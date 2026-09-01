import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './env.js';

const allowedOrigins = env.CORS_ORIGINS.split(',').map((origin) => origin.trim());

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps / server-to-server) or listed origins
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      allowedOrigins.includes('*') ||
      (env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) ||
      origin.startsWith('capacitor://')
    ) {
      return callback(null, true);
    }
    return callback(new Error(`Origin '${origin}' not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-Id',
    'X-Session-Id',
    'x-session-id',
    'X-Goog-Api-Key',
    'X-VERIFY',
  ],
});

export const helmetMiddleware = helmet({
  contentSecurityPolicy: env.NODE_ENV === 'production',
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
});

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 500, // 500 requests per 15 minutes per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20, // 20 attempts per 15 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    },
  },
});

export const otpRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5, // 5 OTP requests per 10 minutes
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'OTP_RATE_LIMIT_EXCEEDED',
      message: 'Too many OTP requests. Please wait a few minutes before trying again.',
    },
  },
});
