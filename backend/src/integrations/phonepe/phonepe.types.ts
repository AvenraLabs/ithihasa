export interface PhonePePaymentRequest {
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise (e.g. ₹100 = 10000 paise)
  redirectUrl: string;
  redirectMode: 'REDIRECT' | 'POST';
  callbackUrl: string;
  mobileNumber?: string;
  paymentInstrument: {
    type: 'PAY_PAGE';
  };
}

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse?: {
      type: string;
      redirectInfo?: {
        url: string;
        method: string;
      };
    };
  };
}

export interface PhonePeStatusResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: 'COMPLETED' | 'FAILED' | 'PENDING';
    responseCode: string;
    paymentInstrument?: Record<string, unknown>;
  };
}

export interface PhonePeRefundRequest {
  merchantTransactionId: string;
  originalTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise
  callbackUrl: string;
}

export interface PhonePeRefundResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: 'COMPLETED' | 'FAILED' | 'PENDING';
    responseCode: string;
  };
}
