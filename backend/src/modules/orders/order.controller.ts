import { Request, Response, NextFunction } from 'express';
import { orderService } from './order.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class OrderController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await orderService.getCustomerOrders(req.user!.userId, req.query as any);
      sendSuccess(res, result.orders, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await orderService.getCustomerOrderById(req.user!.userId, req.params.id);
      sendSuccess(res, order, 200);
    } catch (error) {
      next(error);
    }
  }

  public async cancel(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { reason } = req.body;
      const order = await orderService.cancelOrder(req.user!.userId, req.params.id, reason);
      sendSuccess(res, order, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
