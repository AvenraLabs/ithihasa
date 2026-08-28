import { z } from 'zod';

export const indianPhoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number');

export const googleAuthSchema = z.object({
  idToken: z.string().min(1, 'Google ID Token is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: indianPhoneSchema.optional().nullable(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or 10-digit Mobile Number is required'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or 10-digit Mobile Number is required'),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(1, 'Email or 10-digit Mobile Number is required'),
  otp: z.string().min(4, 'OTP must be provided'),
  newPassword: z.string().min(6, 'New Password must be at least 6 characters'),
});

export const sendOtpSchema = z.object({
  phone: indianPhoneSchema,
});

export const verifyOtpSchema = z.object({
  phone: indianPhoneSchema,
  otp: z.string().min(4, 'OTP must be at least 4 digits'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  email: z.string().email('Invalid email address').optional(),
  phone: indianPhoneSchema.optional().nullable(),
  avatarUrl: z.string().url('Invalid avatar URL').optional().nullable(),
});
