import {
  EmailLoginRequestSchema,
  EmailSignupRequestSchema,
  FacebookLoginRequestSchema,
  LinkFacebookRequestSchema,
  LoginResponse,
  UserProfile,
} from '../src/schemas/auth';
import { randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { RowDataPacket } from 'mysql2';
import { ZodError } from 'zod';
import { db } from './db';

const scryptAsync = promisify(scrypt);

function formatValidationError(error: ZodError): string {
  return error.issues.map((issue) => issue.message).join('. ');
}

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  password_hash: string | null;
  name: string | null;
  facebook_id: string | null;
  verified: number;
  status: 'active' | 'suspended' | 'deleted';
  created_at: Date;
  last_login: Date | null;
}

function toUserProfile(user: UserRow, provider: 'email' | 'facebook'): UserProfile {
  return {
    id: user.id,
    email: user.email,
    name: user.name || undefined,
    loginProvider: provider,
    facebookId: user.facebook_id || undefined,
    createdAt: new Date(user.created_at).toISOString(),
    lastLogin: new Date(user.last_login || user.created_at).toISOString(),
  };
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomUUID();
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, 'hex');
  return storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey);
}

export async function handleEmailSignup(data: unknown): Promise<LoginResponse> {
  try {
    const validatedData = EmailSignupRequestSchema.parse(data);
    const [existingUsers] = await db.execute<UserRow[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [validatedData.email],
    );

    if (existingUsers.length > 0) {
      return { success: false, message: 'An account with this email already exists', code: 'EMAIL_EXISTS' };
    }

    const userId = randomUUID();
    const passwordHash = await hashPassword(validatedData.password);
    await db.execute(
      `INSERT INTO users (id, email, password_hash, name, verified, status, last_login)
       VALUES (?, ?, ?, ?, true, 'active', CURRENT_TIMESTAMP)`,
      [userId, validatedData.email, passwordHash, validatedData.name],
    );

    const [users] = await db.execute<UserRow[]>(
      'SELECT * FROM users WHERE id = ? LIMIT 1',
      [userId],
    );
    const user = users[0];
    if (!user) throw new Error('Account could not be created');

    return {
      success: true,
      message: 'Account created successfully',
      user: toUserProfile(user, 'email'),
      token: generateMockToken(user.id),
      refreshToken: generateMockRefreshToken(user.id),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: formatValidationError(error), code: 'INVALID_EMAIL' };
    }
    return { success: false, message: 'Could not create account', code: 'DATABASE_ERROR' };
  }
}

export async function handleEmailLogin(
  data: unknown
): Promise<LoginResponse> {
  try {
    const validatedData = EmailLoginRequestSchema.parse(data);
    const [users] = await db.execute<UserRow[]>(
      'SELECT * FROM users WHERE email = ? AND status = \'active\' LIMIT 1',
      [validatedData.email],
    );
    const user = users[0];

    if (!user || !user.password_hash || !(await verifyPassword(validatedData.password, user.password_hash))) {
      return { success: false, message: 'Invalid email or password', code: 'INVALID_CREDENTIALS' };
    }

    await db.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

    return {
      success: true,
      message: 'Signed in successfully',
      user: toUserProfile({ ...user, last_login: new Date() }, 'email'),
      token: generateMockToken(user.id),
      refreshToken: generateMockRefreshToken(user.id),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: formatValidationError(error), code: 'INVALID_EMAIL' };
    }
    return { success: false, message: 'Email login failed. Please try again.', code: 'INVALID_EMAIL' };
  }
}

export async function handleFacebookLogin(
  data: {
    accessToken: string;
    facebookId: string;
    email?: string;
    name?: string;
  }
): Promise<LoginResponse> {
  try {
    // Validate input
    const validatedData = FacebookLoginRequestSchema.parse(data);

    const facebookProfile = await verifyFacebookAccessToken(
      validatedData.accessToken,
      validatedData.facebookId,
    );

    const [users] = await db.execute<UserRow[]>(
      "SELECT * FROM users WHERE facebook_id = ? AND status = 'active' LIMIT 1",
      [facebookProfile.id],
    );
    const user = users[0];
    if (user) {
      await db.execute('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);
      return {
        success: true,
        message: 'Signed in with Facebook',
        user: toUserProfile({ ...user, last_login: new Date() }, 'facebook'),
        token: generateMockToken(user.id),
        refreshToken: generateMockRefreshToken(user.id),
      };
    }

    return {
      success: false,
      message: `No IDentify account was found for Facebook user ${facebookProfile.id}`,
      code: 'USER_NOT_FOUND',
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Facebook login failed',
      code: 'FACEBOOK_AUTH_FAILED',
    };
  }
}

async function verifyFacebookAccessToken(
  accessToken: string,
  expectedFacebookId: string,
): Promise<{ id: string; name?: string; email?: string }> {
  const response = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(accessToken)}`,
  );

  if (!response.ok) {
    throw new Error('Facebook access token could not be verified');
  }

  const profile = (await response.json()) as { id?: string; name?: string; email?: string };
  if (!profile.id || profile.id !== expectedFacebookId) {
    throw new Error('Facebook account does not match the access token');
  }

  return profile as { id: string; name?: string; email?: string };
}

function getUserIdFromToken(token: string): string | null {
  const match = token.match(/^token_(.+)_\d+$/);
  return match?.[1] || null;
}

export async function handleFacebookLink(data: unknown): Promise<LoginResponse> {
  try {
    const validatedData = LinkFacebookRequestSchema.parse(data);
    const userId = getUserIdFromToken(validatedData.authToken);
    if (!userId) {
      return { success: false, message: 'Your session is invalid. Please sign in again.', code: 'INVALID_TOKEN' };
    }

    const facebookProfile = await verifyFacebookAccessToken(
      validatedData.accessToken,
      validatedData.facebookId,
    );
    const [linkedUsers] = await db.execute<UserRow[]>(
      'SELECT id FROM users WHERE facebook_id = ? LIMIT 1',
      [facebookProfile.id],
    );
    if (linkedUsers.length > 0 && linkedUsers[0].id !== userId) {
      return { success: false, message: 'This Facebook account is already linked to another user.', code: 'FACEBOOK_EXISTS' };
    }

    await db.execute(
      'UPDATE users SET facebook_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [facebookProfile.id, userId],
    );
    const [users] = await db.execute<UserRow[]>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    const user = users[0];
    if (!user) return { success: false, message: 'User account was not found.', code: 'USER_NOT_FOUND' };

    return {
      success: true,
      message: 'Facebook account linked successfully',
      user: toUserProfile(user, 'email'),
      token: generateMockToken(user.id),
      refreshToken: generateMockRefreshToken(user.id),
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, message: formatValidationError(error), code: 'INVALID_TOKEN' };
    }
    return { success: false, message: 'Could not link Facebook account.', code: 'FACEBOOK_AUTH_FAILED' };
  }
}

export async function handleEmailVerification(
  email: string,
  verificationCode: string
): Promise<LoginResponse> {
  try {
    // TODO: Implement verification logic
    // - Check if code matches stored code for email
    // - Check if code has expired (typically 15 minutes)
    // - Mark email as verified
    // - Create session/token

    // Placeholder response
    const user: UserProfile = {
      id: `user_${Date.now()}`,
      email,
      name: email.split('@')[0],
      loginProvider: 'email',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };

    return {
      success: true,
      message: 'Email verified successfully',
      user,
      token: generateMockToken(user.id),
      refreshToken: generateMockRefreshToken(user.id),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Email verification failed',
      code: 'INVALID_CREDENTIALS',
    };
  }
}

function generateMockToken(userId: string): string {
  return `token_${userId}_${Date.now()}`;
}

function generateMockRefreshToken(userId: string): string {
  return `refresh_${userId}_${Date.now()}`;
}

export async function handleTokenRefresh(
  refreshToken: string
): Promise<LoginResponse> {
  try {
    // TODO: Implement refresh token validation
    // - Verify refresh token signature
    // - Check if token has expired
    // - Check if token has been revoked
    // - Generate new access token

    const userId = refreshToken.split('_')[1];

    return {
      success: true,
      message: 'Token refreshed successfully',
      user: {
        id: userId,
        email: 'user@example.com',
        loginProvider: 'email',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      token: generateMockToken(userId),
    };
  } catch (error) {
    return {
      success: false,
      message: 'Token refresh failed',
      code: 'INVALID_TOKEN',
    };
  }
}
