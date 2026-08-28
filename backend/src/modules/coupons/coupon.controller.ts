import { Request, Response, NextFunction } from 'express';
import { couponService } from './coupon.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class CouponController {
  public async getByCode(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const coupon = await couponService.getCouponByCode(req.params.code);
      sendSuccess(
        res,
        {
          code: coupon.code,
          description: coupon.description,
          type: coupon.type,
          value: Number(coupon.value),
          minOrderValue: Number(coupon.min_order_value),
          maxDiscount: coupon.max_discount ? Number(coupon.max_discount) : null,
        },
        200
      );
    } catch (error) {
      next(error);
    }
  }
}

export const couponController = new CouponController();
