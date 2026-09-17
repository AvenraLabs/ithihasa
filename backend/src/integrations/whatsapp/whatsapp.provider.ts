import { env } from '../../config/env.js';
import { logger } from '../../common/logger/index.js';
import { IWhatsAppProvider, SendOtpParams, SendOtpResult } from './whatsapp.types.js';

/**
 * Mock WhatsApp Provider (for local development and integration tests)
 */
class MockWhatsAppProvider implements IWhatsAppProvider {
  public async sendOTP(params: SendOtpParams): Promise<SendOtpResult> {
    logger.info(
      {
        phone: params.phone,
        otp: params.otp,
        expiryMinutes: params.expiryMinutes,
      },
      `📱 [IN-UI OTP] Verification code for ${params.phone}: ${params.otp}`
    );
    return {
      success: true,
      messageId: `ui_otp_${Date.now()}`,
      provider: 'mock',
    };
  }
}

/**
 * Meta Cloud API WhatsApp Provider
 */
class MetaWhatsAppProvider implements IWhatsAppProvider {
  public async sendOTP(params: SendOtpParams): Promise<SendOtpResult> {
    try {
      const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
      const apiToken = env.WHATSAPP_API_TOKEN;

      if (!phoneNumberId || !apiToken || apiToken === 'mock_whatsapp_token' || phoneNumberId === 'mock_phone_id') {
        logger.warn({ phone: params.phone }, 'Meta WhatsApp Cloud API credentials not configured; using UI OTP display');
        return {
          success: true,
          messageId: `mock_fallback_${Date.now()}`,
          provider: 'mock',
        };
      }

      const cleanPhone = params.phone.replace(/[^0-9]/g, '');

      const payload = {
        messaging_product: 'whatsapp',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'ithihasa_otp_verification',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: params.otp },
                { type: 'text', text: `${params.expiryMinutes} minutes` },
              ],
            },
            {
              type: 'button',
              sub_type: 'url',
              index: 0,
              parameters: [{ type: 'text', text: params.otp }],
            },
          ],
        },
      };

      const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as any;
      if (!response.ok) {
        logger.warn({ result, phone: params.phone }, 'Meta WhatsApp API failed to send OTP; falling back to UI OTP display');
        return {
          success: false,
          messageId: `failed_${Date.now()}`,
          provider: 'meta',
        };
      }

      return {
        success: true,
        messageId: result.messages?.[0]?.id,
        provider: 'meta',
      };
    } catch (err) {
      logger.warn({ err, phone: params.phone }, 'WhatsApp provider error caught; proceeding with UI OTP display');
      return {
        success: false,
        messageId: `err_${Date.now()}`,
        provider: 'meta',
      };
    }
  }
}

export function getWhatsAppProvider(): IWhatsAppProvider {
  // WhatsApp OTP dispatch paused per request; OTP is displayed directly in UI for verification.
  // When ready to re-activate Meta WhatsApp & PhonePe PG later, credentials can be plugged in here.
  return new MockWhatsAppProvider();
}

export const whatsappProvider = getWhatsAppProvider();
