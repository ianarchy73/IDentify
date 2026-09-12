import {
  EmailLoginRequestSchema,
  FacebookLoginRequestSchema,
  VerifyEmailRequestSchema,
  RefreshTokenRequestSchema,
  LoginResponse,
} from '../src/schemas/auth';
import {
  handleEmailLogin,
  handleFacebookLogin,
  handleEmailVerification,
  handleTokenRefresh,
} from './login';

// Email login endpoint
export async function POST_emailLogin(email: string): Promise<LoginResponse> {
  try {
    const validatedData = EmailLoginRequestSchema.parse({ email });
    return await handleEmailLogin(validatedData);
  } catch (error) {
    return {
      success: false,
      message: 'Invalid email format',
      code: 'INVALID_EMAIL',
    };
  }
}

// Facebook login endpoint
export async function POST_facebookLogin(
  accessToken: string,
  facebookId: string,
  email?: string,
  name?: string
): Promise<LoginResponse> {
  try {
    const validatedData = FacebookLoginRequestSchema.parse({
      accessToken,
      facebookId,
      email,
      name,
    });
    return await handleFacebookLogin(validatedData);
  } catch (error) {
    return {
      success: false,
      message: 'Invalid Facebook credentials',
      code: 'FACEBOOK_AUTH_FAILED',
    };
  }
}

// Email verification endpoint
export async function POST_verifyEmail(
  email: string,
  verificationCode: string
): Promise<LoginResponse> {
  try {
    VerifyEmailRequestSchema.parse({ email, verificationCode });
    return await handleEmailVerification(email, verificationCode);
  } catch (error) {
    return {
      success: false,
      message: 'Invalid verification code',
      code: 'INVALID_CREDENTIALS',
    };
  }
}

// Token refresh endpoint
export async function POST_refreshToken(refreshToken: string): Promise<LoginResponse> {
  try {
    RefreshTokenRequestSchema.parse({ refreshToken });
    return await handleTokenRefresh(refreshToken);
  } catch (error) {
    return {
      success: false,
      message: 'Invalid refresh token',
      code: 'INVALID_TOKEN',
    };
  }
}

// Logout endpoint
export async function POST_logout(): Promise<{ success: boolean; message: string }> {
  try {
    // TODO: Implement logout logic
    // - Invalidate refresh token
    // - Clear session
    // - Revoke access token if needed

    return {
      success: true,
      message: 'Logged out successfully',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Logout failed',
    };
  }
}
