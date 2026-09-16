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
      logger.warn({ err: err.message, email }, 'SMTP send attempt finished with notice');
    }

    return false;
  }

  /**
   * Sends an Order Confirmation email to the customer from help@ithihasa.co.in
   */
  public async sendOrderConfirmationEmail(options: {
    email: string;
    orderNumber: string;
    totalAmount: number;
    currency?: string;
    items: Array<{
      productName: string;
      variantName?: string;
      quantity: number;
      unitPrice: number;
      total: number;
    }>;
    shippingAddress?: any;
    customerName?: string;
  }): Promise<boolean> {
    const { email, orderNumber, totalAmount, currency = 'INR', items = [], shippingAddress, customerName } = options;
    if (!email) return false;

    const formattedCurrency = currency === 'INR' ? '₹' : `${currency} `;
    const itemsHtml = items
      .map(
        (it) => `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #262220; color: #F4EFE6; font-size: 14px;">
            <strong>${it.productName}</strong>
            ${it.variantName ? `<br><span style="font-size: 12px; color: #B8B0A2;">${it.variantName}</span>` : ''}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #262220; color: #B8B0A2; font-size: 14px; text-align: center;">
            ×${it.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #262220; color: #C9A24B; font-size: 14px; text-align: right; font-weight: bold;">
            ${formattedCurrency}${Number(it.total).toLocaleString('en-IN')}
          </td>
        </tr>
      `
      )
      .join('');

    const addressText = shippingAddress
      ? [
          shippingAddress.full_name || shippingAddress.name,
          shippingAddress.address_line_1,
          shippingAddress.address_line_2,
          `${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postal_code || ''}`,
          shippingAddress.country || 'India',
        ]
          .filter(Boolean)
          .join('<br>')
      : '';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { margin: 0; padding: 0; background-color: #0A0A0A; color: #F4EFE6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
          .container { max-width: 580px; margin: 40px auto; background-color: #141210; border: 1px solid #262220; padding: 40px 36px; }
          .brand-title { font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 0.25em; color: #C9A24B; text-transform: uppercase; text-align: center; margin-bottom: 6px; }
          .brand-subtitle { font-size: 12px; color: #B8B0A2; letter-spacing: 0.15em; text-transform: uppercase; text-align: center; margin-bottom: 32px; }
          .greeting { font-size: 16px; color: #F4EFE6; margin-bottom: 16px; line-height: 1.6; }
          .order-card { background-color: #1A1714; border: 1px solid #C9A24B; padding: 20px; text-align: center; margin: 24px 0; }
          .order-title { font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #B8B0A2; margin-bottom: 4px; }
          .order-number { font-family: 'Georgia', serif; font-size: 24px; color: #C9A24B; letter-spacing: 0.1em; }
          .table-title { font-size: 12px; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A24B; margin-top: 28px; margin-bottom: 12px; border-bottom: 1px solid #262220; padding-bottom: 6px; }
          .order-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          .total-row { font-size: 18px; color: #C9A24B; font-weight: bold; text-align: right; padding-top: 16px; }
          .address-box { font-size: 13px; color: #B8B0A2; line-height: 1.6; background-color: #1A1714; padding: 16px; border: 1px solid #262220; margin-top: 12px; }
          .footer { font-size: 12px; color: #8A7133; margin-top: 40px; border-top: 1px solid #262220; padding-top: 20px; line-height: 1.6; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="brand-title">ITHIHASA</div>
          <div class="brand-subtitle">Wear Your Legacy</div>

          <div class="greeting">
            Dear ${customerName || 'Patron'},<br>
            Thank you for your order. We are honored to craft your bespoke heritage pieces.
          </div>

          <div class="order-card">
            <div class="order-title">Confirmed Order Number</div>
            <div class="order-number">#${orderNumber}</div>
          </div>

          <div class="table-title">Order Summary</div>
          <table class="order-table">
            ${itemsHtml}
          </table>

          <div class="total-row">
            Total Paid: ${formattedCurrency}${Number(totalAmount).toLocaleString('en-IN')}
          </div>

          ${
            addressText
              ? `
            <div class="table-title">Delivery Destination</div>
            <div class="address-box">${addressText}</div>
          `
              : ''
          }

          <div class="footer">
            Our atelier artisans will carefully pack and inspect your garments.<br>
            Track your order anytime on <a href="https://ithihasa.co.in/account/orders" style="color: #C9A24B; text-decoration: underline;">Your Orders Page</a>.<br><br>
            Ithihasa Atelier Concierge &bull; <a href="mailto:${env.SMTP_USER}" style="color: #C9A24B; text-decoration: none;">${env.SMTP_USER}</a>
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
          subject: `Order Confirmation #${orderNumber} — Ithihasa Atelier`,
          text: `Thank you for your order #${orderNumber}. Total: ${formattedCurrency}${totalAmount}. We are preparing your heritage garments.`,
          html: htmlContent,
        });
        logger.info({ email, orderNumber }, 'Order confirmation email sent successfully via SMTP');
        return true;
      }
    } catch (err: any) {
      logger.warn({ err: err.message, email, orderNumber }, 'Failed to send order confirmation email via SMTP');
    }

    return false;
  }
}

export const emailProvider = new EmailProvider();
