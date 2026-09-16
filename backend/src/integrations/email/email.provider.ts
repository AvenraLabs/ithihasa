import nodemailer, { type Transporter } from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../common/logger/index.js';

export interface SendEmailOtpOptions {
  email: string;
  otp: string;
  expiryMinutes: number;
}

export class EmailProvider {
  private transporter: Transporter | null = null;

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE,
        auth: env.SMTP_PASS
          ? {
              user: env.SMTP_USER,
              pass: env.SMTP_PASS,
            }
          : undefined,
        // Short timeout to avoid hanging if network/mailserver is unreachable in dev
        connectionTimeout: 5000,
        greetingTimeout: 5000,
      });
    } catch (err) {
      logger.warn({ err }, 'Failed to initialize SMTP transporter. Email provider will operate in fallback mode.');
      this.transporter = null;
    }
  }

  /**
   * Sends an OTP verification email to the customer from help@ithihasa.co.in
   */
  public async sendOtpEmail(options: SendEmailOtpOptions): Promise<boolean> {
    const { email, otp, expiryMinutes } = options;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #0A0A0A; color: #F4EFE6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
          .container { max-width: 540px; margin: 40px auto; background-color: #141210; border: 1px solid #262220; padding: 40px 32px; text-align: center; }
          .brand-title { font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 0.25em; color: #C9A24B; text-transform: uppercase; margin-bottom: 8px; }
          .brand-subtitle { font-size: 13px; color: #B8B0A2; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 32px; }
          .message { font-size: 15px; line-height: 1.6; color: #F4EFE6; margin-bottom: 28px; }
          .otp-box { display: inline-block; background-color: #1A1714; border: 1px solid #C9A24B; padding: 16px 36px; font-size: 32px; font-weight: bold; letter-spacing: 0.35em; color: #C9A24B; margin-bottom: 28px; }
          .footer { font-size: 12px; color: #8A7133; margin-top: 36px; border-top: 1px solid #262220; padding-top: 20px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand-title">ITHIHASA</div>
          <div class="brand-subtitle">Wear Your Legacy</div>
          <p class="message">Your verification code for your Ithihasa Patron account is:</p>
          <div class="otp-box">${otp}</div>
          <p class="message" style="font-size: 13px; color: #B8B0A2;">
            This code will expire in <strong>${expiryMinutes} minutes</strong>.<br>
            If you did not request this verification, you can safely disregard this email.
          </p>
          <div class="footer">
            Sent by Ithihasa Atelier Concierge<br>
            Official Communications: <a href="mailto:${env.SMTP_USER}" style="color: #C9A24B; text-decoration: none;">${env.SMTP_USER}</a>
          </div>
        </div>
      </body>
      </html>
    `;

    try {
      if (!this.transporter) {
        this.initTransporter();
      }

      if (this.transporter) {
        await this.transporter.sendMail({
          from: env.SMTP_FROM,
          to: email,
          subject: `${otp} is your Ithihasa Atelier verification code`,
          text: `Your Ithihasa verification code is: ${otp}. It expires in ${expiryMinutes} minutes.`,
          html: htmlContent,
        });
        logger.info({ email }, 'Verification email dispatched via SMTP');
        return true;
      }
    } catch (err: any) {
      logger.warn({ err: err.message, email }, 'SMTP send attempt finished with notice (OTP retained for preview)');
    }

    return false;
  }
}

export const emailProvider = new EmailProvider();
