import { z } from 'zod';

/**
 * Email Login Schema
 */
export const EmailLoginRequestSchema = z.object({
  email: z
    .string('Email is required')
    .email('Invalid email address')
    .toLowerCase(),
});

export type EmailLoginRequest = z.infer<typeof EmailLoginRequestSchema>;

/**
 * Facebook Login Schema
 */
export const FacebookLoginRequestSchema = z.object({
  accessToken: z
    .string('Facebook access token is required')
    .min(1, 'Access token cannot be empty'),
  facebookId: z
    .string('Facebook ID is required')
    .min(1, 'Facebook ID cannot be empty'),
  email: z
    .string('Email is required')
    .email('Invalid email address')
    .optional(),
  name: z
    .string('Name is required')
    .optional(),
});

export type FacebookLoginRequest = z.infer<typeof FacebookLoginRequestSchema>;

/**
 * Unified Login Request - can be either email or facebook
 */
export const LoginRequestSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('email'),
    payload: EmailLoginRequestSchema,
  }),
  z.object({
    type: z.literal('facebook'),
    payload: FacebookLoginRequestSchema,
  }),
]);

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/**
 * User Session/Profile Response
 */
export const UserProfileSchema = z.object({
  id: z.string('User ID is required'),
  email: z.string('Email is required').email(),
  name: z.string('Name is required').optional(),
  loginProvider: z.enum(['email', 'facebook']),
  facebookId: z.string().optional(),
  createdAt: z.string().datetime(),
  lastLogin: z.string().datetime(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

/**
 * Successful Login Response
 */
export const LoginSuccessResponseSchema = z.object({
  success: z.literal(true),
  message: z.string('Success message is required'),
  user: UserProfileSchema,
  token: z.string('Authentication token is required'),
  refreshToken: z.string('Refresh token is required').optional(),
});

export type LoginSuccessResponse = z.infer<typeof LoginSuccessResponseSchema>;

/**
 * Error Response
 */
export const LoginErrorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string('Error message is required'),
  code: z.enum([
    'INVALID_EMAIL',
    'INVALID_CREDENTIALS',
    'USER_NOT_FOUND',
    'FACEBOOK_AUTH_FAILED',
    'INVALID_TOKEN',
    'SERVER_ERROR',
  ]),
});

export type LoginErrorResponse = z.infer<typeof LoginErrorResponseSchema>;

/**
 * Combined Login Response
 */
export const LoginResponseSchema = z.union([
  LoginSuccessResponseSchema,
  LoginErrorResponseSchema,
]);

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

/**
 * Email verification schema (if implementing email verification)
 */
export const VerifyEmailRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  verificationCode: z.string('Verification code is required').length(6, 'Code must be 6 characters'),
});

export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

/**
 * Refresh Token Request
 */
export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string('Refresh token is required'),
});

export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;
