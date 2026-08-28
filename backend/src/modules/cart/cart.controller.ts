import { Request, Response, NextFunction } from 'express';
import { cartService } from './cart.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class CartController {
  public async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const couponCode = req.query.coupon as string | undefined;
      const cart = await cartService.getCart(req.user?.userId, req.sessionId, couponCode);
      sendSuccess(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }

  public async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { variantId, quantity } = req.body;
      const cart = await cartService.addItem(variantId, quantity, req.user?.userId, req.sessionId);
      sendSuccess(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }

  public async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { quantity } = req.body;
      const cart = await cartService.updateItemQuantity(req.params.itemId, quantity, req.user?.userId, req.sessionId);
      sendSuccess(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }

  public async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await cartService.removeItem(req.params.itemId, req.user?.userId, req.sessionId);
      sendSuccess(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }

  public async merge(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { guestSessionId } = req.body;
      const cart = await cartService.mergeGuestCart(req.user!.userId, guestSessionId);
      sendSuccess(res, cart, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
