import { Request, Response, NextFunction } from 'express';
import { inventoryService } from './inventory.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class InventoryController {
  public async adjust(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = req.user?.email || 'ADMIN';
      const result = await inventoryService.adjustStock({
        ...req.body,
        actor,
      });
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async movements(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const variantId = req.query.variantId as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const result = await inventoryService.getMovements(variantId, limit);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const inventoryController = new InventoryController();
