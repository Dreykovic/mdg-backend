// validators/auth.validators.ts
import { z } from 'zod';

export const AuthSchemas = {
  signIn: z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional().default(false),
  }),

  refreshToken: z.object({
    token: z.string().min(1, 'Refresh token is required'),
  }),

  logout: z.object({
    token: z.string().min(1, 'Token is required'),
  }),

  logoutAll: z.object({
    userId: z.string().uuid('User ID must be a valid UUID'),
  }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters'),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords don't match",
      path: ['confirmPassword'],
    }),
};
// Inférence des types TypeScript automatique
export type SignInRequest = z.infer<typeof AuthSchemas.signIn>;
export type RefreshTokenRequest = z.infer<typeof AuthSchemas.refreshToken>;
export type LogoutRequest = z.infer<typeof AuthSchemas.logout>;
export type LogoutAllRequest = z.infer<typeof AuthSchemas.logoutAll>;
export type ChangePasswordRequest = z.infer<typeof AuthSchemas.changePassword>;
export type AuthSchemasType = typeof AuthSchemas;
