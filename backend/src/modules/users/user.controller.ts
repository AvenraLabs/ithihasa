import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class UserController {
  public async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await userService.getProfile(req.user!.userId);
      sendSuccess(res, profile, 200);
    } catch (error) {
      next(error);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await userService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
