import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, phone, password } = req.body;
      const result = await authService.registerWithPassword({ name, email, phone, password });
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, password } = req.body;
      const result = await authService.loginWithPassword({ identifier, password });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async adminLogin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier, username, email, password } = req.body;
      const id = identifier || email || username;
      const result = await authService.adminLogin({ identifier: id, password });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { identifier } = req.body;
      const result = await authService.requestPasswordReset(identifier);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body;
      const result = await authService.authenticateWithGoogle(idToken);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshAccessToken(refreshToken);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.body;
      const userId = req.user?.userId || 'guest';
      const result = await authService.sendWhatsAppOTP(userId, phone);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone, otp } = req.body;
      const userId = req.user?.userId || 'guest';
      const result = await authService.verifyWhatsAppOTP(userId, phone, otp);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
