import { Request, Response, NextFunction } from 'express';
import { returnService } from './return.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class ReturnController {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await returnService.createReturnRequest(req.user!.userId, req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const returns = await returnService.getCustomerReturns(req.user!.userId);
      sendSuccess(res, returns, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const returnController = new ReturnController();
