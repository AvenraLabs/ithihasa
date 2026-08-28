import { Request, Response, NextFunction } from 'express';
import { checkoutService } from './checkout.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class CheckoutController {
  public async initiate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await checkoutService.initiateCheckout(req.user!.userId, req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const checkoutController = new CheckoutController();
