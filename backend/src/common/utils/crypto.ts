import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export function generateOTP(length = 6): string {
  const digits = '0123456789';
  let otp = '';
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    otp += digits[randomBytes[i] % 10];
  }
  return otp;
}

export async function hashValue(val: string): Promise<string> {
  return bcrypt.hash(val, 10);
}

export async function verifyHash(val: string, hash: string): Promise<boolean> {
  return bcrypt.compare(val, hash);
}

export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculates PhonePe X-VERIFY header:
 * SHA256(base64Payload + apiEndpoint + saltKey) + "###" + saltIndex
 */
export function calculatePhonePeChecksum(
  base64Payload: string,
  apiEndpoint: string,
  saltKey: string,
  saltIndex: string | number
): string {
  const stringToHash = `${base64Payload}${apiEndpoint}${saltKey}`;
  const hash = sha256(stringToHash);
  return `${hash}###${saltIndex}`;
}

/**
 * Verifies incoming PhonePe Webhook X-VERIFY header
 */
export function verifyPhonePeWebhookSignature(
  responseBase64: string,
  xVerifyHeader: string,
  saltKey: string
): boolean {
  if (!xVerifyHeader || !xVerifyHeader.includes('###')) {
    return false;
  }
  const [expectedHash, saltIndex] = xVerifyHeader.split('###');
  const computedHash = sha256(`${responseBase64}${saltKey}`);
  return computedHash === expectedHash;
}
