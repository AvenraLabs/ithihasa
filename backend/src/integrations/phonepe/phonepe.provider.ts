import { env } from '../../config/env.js';
import { calculatePhonePeChecksum, verifyPhonePeWebhookSignature } from '../../common/utils/crypto.js';
import { logger } from '../../common/logger/index.js';
import { PaymentError } from '../../common/errors/index.js';
import {
  PhonePePaymentRequest,
  PhonePePaymentResponse,
  PhonePeStatusResponse,
  PhonePeRefundRequest,
  PhonePeRefundResponse,
} from './phonepe.types.js';

export class PhonePeProvider {
  private readonly merchantId: string;
  private readonly saltKey: string;
  private readonly saltIndex: string;
  private readonly hostUrl: string;

  constructor() {
    this.merchantId = env.PHONEPE_MERCHANT_ID;
    this.saltKey = env.PHONEPE_SALT_KEY;
    this.saltIndex = env.PHONEPE_SALT_INDEX;
    this.hostUrl = env.PHONEPE_HOST_URL;
  }

  /**
   * Initiates payment via PhonePe Standard Checkout
   */
  public async initiatePayment(params: {
    transactionId: string;
    userId: string;
    amountInRupees: number;
    phone?: string;
    redirectUrl?: string;
  }): Promise<{ redirectUrl: string; merchantTransactionId: string }> {
    const amountInPaise = Math.round(params.amountInRupees * 100);

    const payload: PhonePePaymentRequest = {
      merchantTransactionId: params.transactionId,
      merchantUserId: params.userId,
      amount: amountInPaise,
      redirectUrl: params.redirectUrl || env.PHONEPE_REDIRECT_URL,
      redirectMode: 'REDIRECT',
      callbackUrl: env.PHONEPE_CALLBACK_URL,
      mobileNumber: params.phone,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const endpoint = '/pg/v1/pay';
    const checksum = calculatePhonePeChecksum(base64Payload, endpoint, this.saltKey, this.saltIndex);

    try {
      const response = await fetch(`${this.hostUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          accept: 'application/json',
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const result = (await response.json()) as PhonePePaymentResponse;

      if (!result.success || !result.data?.instrumentResponse?.redirectInfo?.url) {
        logger.error({ result, transactionId: params.transactionId }, 'PhonePe payment initiation returned error');
        throw new PaymentError(result.message || 'PhonePe payment initiation failed', result);
      }

      logger.info({ transactionId: params.transactionId }, 'PhonePe payment initiated successfully');
      return {
        redirectUrl: result.data.instrumentResponse.redirectInfo.url,
        merchantTransactionId: params.transactionId,
      };
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      logger.error({ err: error, transactionId: params.transactionId }, 'PhonePe payment initiation request failed');
      throw new PaymentError('Failed to communicate with PhonePe Payment Gateway');
    }
  }

  /**
   * Checks transaction status from PhonePe S2S API
   */
  public async checkStatus(transactionId: string): Promise<PhonePeStatusResponse> {
    const endpoint = `/pg/v1/status/${this.merchantId}/${transactionId}`;
    const stringToHash = `${endpoint}${this.saltKey}`;
    const hash = calculatePhonePeChecksum('', endpoint, this.saltKey, this.saltIndex);

    try {
      const response = await fetch(`${this.hostUrl}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': hash,
          'X-MERCHANT-ID': this.merchantId,
          accept: 'application/json',
        },
      });

      const result = (await response.json()) as PhonePeStatusResponse;
      return result;
    } catch (error) {
      logger.error({ err: error, transactionId }, 'Failed to fetch PhonePe transaction status');
      throw new PaymentError('Failed to check PhonePe transaction status');
    }
  }

  /**
   * Verifies incoming webhook signature and decodes response payload
   */
  public verifyAndDecodeWebhook(
    base64Response: string,
    xVerifyHeader: string
  ): { isValid: boolean; data?: PhonePeStatusResponse['data'] } {
    const isValid = verifyPhonePeWebhookSignature(base64Response, xVerifyHeader, this.saltKey);
    if (!isValid) {
      return { isValid: false };
    }

    try {
      const decodedJson = Buffer.from(base64Response, 'base64').toString('utf-8');
      const parsed = JSON.parse(decodedJson);
      return { isValid: true, data: parsed.data };
    } catch (error) {
      logger.error({ err: error }, 'Failed to parse PhonePe webhook payload JSON');
      return { isValid: false };
    }
  }

  /**
   * Issues a refund via PhonePe
   */
  public async issueRefund(params: {
    refundTransactionId: string;
    originalTransactionId: string;
    userId: string;
    amountInRupees: number;
  }): Promise<PhonePeRefundResponse> {
    const payload: PhonePeRefundRequest = {
      merchantTransactionId: params.refundTransactionId,
      originalTransactionId: params.originalTransactionId,
      merchantUserId: params.userId,
      amount: Math.round(params.amountInRupees * 100),
      callbackUrl: env.PHONEPE_CALLBACK_URL,
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const endpoint = '/pg/v1/refund';
    const checksum = calculatePhonePeChecksum(base64Payload, endpoint, this.saltKey, this.saltIndex);

    try {
      const response = await fetch(`${this.hostUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          accept: 'application/json',
        },
        body: JSON.stringify({ request: base64Payload }),
      });

      const result = (await response.json()) as PhonePeRefundResponse;
      if (!result.success) {
        throw new PaymentError(result.message || 'PhonePe refund failed', result);
      }
      return result;
    } catch (error) {
      if (error instanceof PaymentError) throw error;
      logger.error({ err: error, refundTransactionId: params.refundTransactionId }, 'PhonePe refund request failed');
      throw new PaymentError('Failed to communicate with PhonePe for refund');
    }
  }
}

export const phonePeProvider = new PhonePeProvider();
