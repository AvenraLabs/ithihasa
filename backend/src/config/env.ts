import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  HOST: z.string().default('0.0.0.0'),
  API_PREFIX: z.string().default('/api/v1'),

  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:3000,capacitor://localhost,http://localhost'),

  DATABASE_URL: z.string().default('postgres://postgres:admin123@localhost:5432/ithihasa_db'),
  DB_LOGGING: z.string().transform((val) => val === 'true').default('false'),
  DB_POOL_MAX: z.coerce.number().default(20),
  DB_POOL_MIN: z.coerce.number().default(2),
  DB_POOL_IDLE: z.coerce.number().default(10000),

  JWT_SECRET: z.string().default('ithihasa_super_secret_jwt_key_dev_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().default('ithihasa_super_refresh_secret_key_dev_2026'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  GOOGLE_CLIENT_ID: z.string().default('mock_google_client_id.apps.googleusercontent.com'),

  WHATSAPP_PROVIDER: z.enum(['mock', 'meta', 'twilio']).default('mock'),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(5),
  MAX_OTP_ATTEMPTS: z.coerce.number().default(3),

  PHONEPE_ENV: z.enum(['SANDBOX', 'PRODUCTION']).default('SANDBOX'),
  PHONEPE_MERCHANT_ID: z.string().default('PGTESTPAYUAT'),
  PHONEPE_SALT_KEY: z.string().default('099eb0cd-02cf-4e2a-8aca-3e6c6aff0399'),
  PHONEPE_SALT_INDEX: z.string().default('1'),
  PHONEPE_HOST_URL: z.string().default('https://api-preprod.phonepe.com/apis/pg-sandbox'),
  PHONEPE_CALLBACK_URL: z.string().default('http://localhost:5000/api/v1/payments/phonepe/webhook'),
  PHONEPE_REDIRECT_URL: z.string().default('http://localhost:5173/checkout/confirmation'),

  CURRENCY: z.string().default('INR'),
  TAX_RATE: z.coerce.number().default(0.00),
  DEFAULT_SHIPPING_FEE: z.coerce.number().default(0),
  FREE_SHIPPING_THRESHOLD: z.coerce.number().default(0),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables configuration:', JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;
