import { Request, Response, NextFunction } from 'express';
import { wishlistService } from './wishlist.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { User } from '../../database/index.js';

export class WishlistController {
  private async resolveUserId(req: Request): Promise<string> {
    if (req.user?.userId) return req.user.userId;
    // Fallback for guest sessions: use demo customer account or first active customer
    const user = await User.findOne({ where: { role: 'CUSTOMER' } });
    if (user) return user.id;
    return '00000000-0000-0000-0000-000000000001';
  }

  public get = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = await this.resolveUserId(req);
      const items = await wishlistService.getWishlist(userId);
      sendSuccess(res, items, 200);
    } catch (error) {
      next(error);
    }
  };

  public toggle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId, variantId } = req.body;
      const userId = await this.resolveUserId(req);
      const result = await wishlistService.toggleItem(userId, productId, variantId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  };
}

export const wishlistController = new WishlistController();
