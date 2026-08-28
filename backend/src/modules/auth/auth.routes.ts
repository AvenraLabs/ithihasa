import { Router } from 'express';
import { authController } from './auth.controller.js';
import { validateRequest } from '../../middleware/validation.js';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import { authRateLimiter, otpRateLimiter } from '../../config/security.js';
import {
  googleAuthSchema,
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  sendOtpSchema,
  verifyOtpSchema,
} from './auth.validation.js';

export const authRouter = Router();

// Public Authentication endpoints
authRouter.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  authController.register
);

authRouter.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

authRouter.post(
  '/admin-login',
  authRateLimiter,
  authController.adminLogin
);

authRouter.post(
  '/forgot-password',
  authRateLimiter,
  validateRequest({ body: forgotPasswordSchema }),
  authController.forgotPassword
);

authRouter.post(
  '/google',
  authRateLimiter,
  validateRequest({ body: googleAuthSchema }),
  authController.googleAuth
);

authRouter.post('/refresh', authRateLimiter, authController.refresh);

// Phone OTP verification endpoints
authRouter.post(
  '/phone/send-otp',
  optionalAuthenticate,
  otpRateLimiter,
  validateRequest({ body: sendOtpSchema }),
  authController.sendOtp
);

authRouter.post(
  '/phone/verify-otp',
  optionalAuthenticate,
  validateRequest({ body: verifyOtpSchema }),
  authController.verifyOtp
);
