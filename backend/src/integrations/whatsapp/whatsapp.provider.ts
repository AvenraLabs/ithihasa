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
      '📱 [MOCK WHATSAPP OTP] Verification code sent to WhatsApp recipient'
    );
    return {
      success: true,
      messageId: `mock_msg_${Date.now()}`,
      provider: 'mock',
    };
  }
}

/**
 * Meta Cloud API WhatsApp Provider
 */
class MetaWhatsAppProvider implements IWhatsAppProvider {
  public async sendOTP(params: SendOtpParams): Promise<SendOtpResult> {
    const phoneNumberId = env.WHATSAPP_PHONE_NUMBER_ID;
    const apiToken = env.WHATSAPP_API_TOKEN;

    if (!phoneNumberId || !apiToken) {
      throw new Error('Meta WhatsApp Cloud API credentials not configured');
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
      logger.error({ result, phone: params.phone }, 'Meta WhatsApp API failed to send OTP');
      throw new Error('Failed to send WhatsApp verification message');
    }

    return {
      success: true,
      messageId: result.messages?.[0]?.id,
      provider: 'meta',
    };
  }
}

export function getWhatsAppProvider(): IWhatsAppProvider {
  if (env.WHATSAPP_PROVIDER === 'meta' && env.NODE_ENV === 'production') {
    return new MetaWhatsAppProvider();
  }
  return new MockWhatsAppProvider();
}

export const whatsappProvider = getWhatsAppProvider();
