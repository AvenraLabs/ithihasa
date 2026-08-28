export interface SendOtpParams {
  phone: string;
  otp: string;
  expiryMinutes: number;
}

export interface SendOtpResult {
  success: boolean;
  messageId?: string;
  provider: string;
}

export interface IWhatsAppProvider {
  sendOTP(params: SendOtpParams): Promise<SendOtpResult>;
}
