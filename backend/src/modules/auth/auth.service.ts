import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { User, UserOtp, Wishlist, Cart } from '../../database/index.js';
import { env } from '../../config/env.js';
import { googleAuthProvider } from '../../integrations/google/google.provider.js';
import { whatsappProvider } from '../../integrations/whatsapp/whatsapp.provider.js';
import { generateOTP, hashValue, verifyHash } from '../../common/utils/crypto.js';
import {
  AuthenticationError,
  BusinessRuleError,
  NotFoundError,
} from '../../common/errors/index.js';
import { TokenPayload } from '../../middleware/auth.js';
import { AuthResponse, AuthTokens } from './auth.types.js';

export class AuthService {
  /**
   * Generates JWT Access and Refresh tokens
   */
  public generateTokens(user: User): AuthTokens {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    const refreshToken = jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: env.JWT_EXPIRES_IN,
    };
  }

  /**
   * Customer Registration with Email/Phone & Password
   */
  public async registerWithPassword(data: {
    name: string;
    email?: string | null;
    phone?: string | null;
    password: string;
  }): Promise<AuthResponse> {
    const cleanPhone = data.phone ? data.phone.trim().replace(/\D/g, '') : null;
    const cleanEmail = (data.email && data.email.trim()) ? data.email.toLowerCase().trim() : null;

    if (!cleanEmail && !cleanPhone) {
      throw new BusinessRuleError('Please provide a mobile number or email address to register.');
    }

    if (cleanEmail) {
      const existingEmail = await User.findOne({ where: { email: cleanEmail } });
      if (existingEmail) {
        throw new BusinessRuleError('An account with this email address already exists. Please sign in instead.');
      }
    }

    if (cleanPhone) {
      const existingPhone = await User.findOne({ where: { phone: cleanPhone } });
      if (existingPhone) {
        throw new BusinessRuleError('An account with this mobile number already exists. Please sign in instead.');
      }
    }

    const passwordHash = await hashValue(data.password);

    const user = await User.create({
      email: cleanEmail,
      name: data.name.trim(),
      phone: cleanPhone,
      password_hash: passwordHash,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      phone_verified: false,
    });

    await Wishlist.findOrCreate({ where: { user_id: user.id } });

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phone_verified: user.phone_verified,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      tokens,
    };
  }

  /**
   * Customer Direct Login with Email/Mobile & Password
   */
  public async loginWithPassword(data: {
    identifier: string;
    password: string;
  }): Promise<AuthResponse> {
    const id = data.identifier.trim();
    const cleanPhone = id.replace(/\D/g, '');
    
    // Look up by email or phone
    const orConditions: any[] = [{ email: id.toLowerCase() }];
    if (cleanPhone && cleanPhone.length === 10) {
      orConditions.push({ phone: cleanPhone });
    }

    let user = await User.findOne({
      where: {
        [Op.or]: orConditions,
        password_hash: { [Op.ne]: null as any },
      },
    });

    if (!user) {
      user = await User.findOne({
        where: {
          [Op.or]: orConditions,
        },
      });
    }

    if (!user) {
      throw new AuthenticationError('Invalid email/mobile or password.');
    }

    if (user.status === 'BLOCKED') {
      throw new AuthenticationError('Account is blocked. Please contact customer support.');
    }

    if (!user.password_hash) {
      throw new AuthenticationError('Please sign in using Google OAuth for this account.');
    }

    const isMatch = await verifyHash(data.password, user.password_hash);
    if (!isMatch) {
      throw new AuthenticationError('Invalid email/mobile or password.');
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phone_verified: user.phone_verified,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      tokens,
    };
  }

  /**
   * Admin & Atelier Staff Authentication
   */
  public async adminLogin(data: {
    identifier: string;
    password: string;
  }): Promise<AuthResponse> {
    const id = data.identifier.trim().toLowerCase();
    let user = await User.findOne({
      where: {
        [Op.or]: [{ email: id }, { phone: id }],
      },
    });

    // Seed master atelier admin if none exists yet
    if (!user && (id === 'admin@ithihasa.com' || id === 'admin')) {
      const passwordHash = await hashValue(data.password || 'admin123');
      user = await User.create({
        email: 'admin@ithihasa.com',
        name: 'Atelier Lead Director',
        role: 'ADMIN',
        status: 'ACTIVE',
        password_hash: passwordHash,
      });
    }

    if (!user) {
      throw new AuthenticationError('Invalid credentials or unauthorized atelier account.');
    }

    if (user.status === 'BLOCKED') {
      throw new AuthenticationError('Atelier access revoked.');
    }

    if (user.password_hash) {
      const isMatch = await verifyHash(data.password, user.password_hash);
      if (!isMatch) {
        throw new AuthenticationError('Invalid credentials.');
      }
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phone_verified: user.phone_verified,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      tokens,
    };
  }

  /**
   * Password Reset Request (Generates OTP)
   */
  public async requestPasswordReset(identifier: string): Promise<{ success: boolean; message: string }> {
    const id = identifier.trim();
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { email: id.toLowerCase() },
          { phone: id },
        ],
      },
    });

    if (!user) {
      // Return true to avoid user enumeration
      return { success: true, message: 'If an account exists with this credential, a verification OTP has been sent.' };
    }

    const otp = generateOTP(4);
    const otpHash = await hashValue(otp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await UserOtp.create({
      user_id: user.id,
      phone: user.phone || user.email || 'NO_PHONE',
      otp_hash: otpHash,
      purpose: 'PASSWORD_RESET',
      expires_at: expiresAt,
    });

    if (user.phone) {
      await whatsappProvider.sendOTP({
        phone: user.phone,
        otp,
        expiryMinutes: 15,
      });
    }

    return {
      success: true,
      message: `Verification code sent successfully.`,
    };
  }

  /**
   * Google OAuth / One-Tap Authentication
   */
  public async authenticateWithGoogle(idToken: string): Promise<AuthResponse> {
    const profile = await googleAuthProvider.verifyIdToken(idToken);

    let [user, created] = await User.findOrCreate({
      where: { email: profile.email.toLowerCase() },
      defaults: {
        email: profile.email.toLowerCase(),
        name: profile.name,
        google_id: profile.googleId,
        avatar_url: profile.avatarUrl,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        phone_verified: false,
      },
    });

    if (!created) {
      if (user.status === 'BLOCKED') {
        throw new AuthenticationError('Account is blocked. Please contact customer support.');
      }
      if (!user.google_id) {
        user.google_id = profile.googleId;
      }
      if (!user.avatar_url && profile.avatarUrl) {
        user.avatar_url = profile.avatarUrl;
      }
      await user.save();
    } else {
      // Ensure new customer gets an initialized wishlist
      await Wishlist.findOrCreate({ where: { user_id: user.id } });
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        phone_verified: user.phone_verified,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      tokens,
    };
  }

  /**
   * Refreshes expired access token using valid refresh token
   */
  public async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET) as TokenPayload;
      const user = await User.findByPk(decoded.userId);

      if (!user || user.status === 'BLOCKED') {
        throw new AuthenticationError('User account invalid or blocked');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }
  }

  /**
   * Sends WhatsApp OTP to link/verify customer phone number
   */
  public async sendWhatsAppOTP(userId: string, phone: string): Promise<{ success: boolean; message: string }> {
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User');

    // Check if another active customer already verified this phone
    const existingPhoneUser = await User.findOne({
      where: {
        phone,
        phone_verified: true,
        id: { [Op.ne]: userId },
      },
    });
    if (existingPhoneUser) {
      throw new BusinessRuleError('This phone number is already verified on another account');
    }

    // Rate limit check: Max 3 active OTP requests in the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentOtpsCount = await UserOtp.count({
      where: {
        user_id: userId,
        phone,
        created_at: { [Op.gt]: tenMinutesAgo },
      },
    });

    if (recentOtpsCount >= env.MAX_OTP_ATTEMPTS) {
      throw new BusinessRuleError('Too many OTP attempts. Please wait 10 minutes before requesting again.');
    }

    const otp = generateOTP(4);
    const otpHash = await hashValue(otp);
    const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

    await UserOtp.create({
      user_id: userId,
      phone,
      otp_hash: otpHash,
      purpose: 'PHONE_VERIFICATION',
      expires_at: expiresAt,
    });

    await whatsappProvider.sendOTP({
      phone,
      otp,
      expiryMinutes: env.OTP_EXPIRY_MINUTES,
    });

    return {
      success: true,
      message: `OTP sent successfully via WhatsApp to ${phone}`,
    };
  }

  /**
   * Verifies WhatsApp OTP and marks phone as verified on customer profile
   */
  public async verifyWhatsAppOTP(
    userId: string,
    phone: string,
    otp: string
  ): Promise<{ success: boolean; phone: string; phone_verified: boolean }> {
    const latestOtp = await UserOtp.findOne({
      where: {
        user_id: userId,
        phone,
        verified_at: null,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [['created_at', 'DESC']],
    });

    if (!latestOtp) {
      throw new BusinessRuleError('OTP has expired or is invalid. Please request a new one.');
    }

    if (latestOtp.attempts >= 3) {
      throw new BusinessRuleError('Maximum verification attempts exceeded. Please request a new OTP.');
    }

    latestOtp.attempts += 1;
    await latestOtp.save();

    const isMatch = await verifyHash(otp, latestOtp.otp_hash);
    if (!isMatch) {
      throw new BusinessRuleError('Invalid OTP entered. Please check and try again.');
    }

    latestOtp.verified_at = new Date();
    await latestOtp.save();

    // Update user profile
    const user = await User.findByPk(userId);
    if (!user) throw new NotFoundError('User');

    user.phone = phone;
    user.phone_verified = true;
    await user.save();

    return {
      success: true,
      phone: user.phone,
      phone_verified: user.phone_verified,
    };
  }
}

export const authService = new AuthService();
