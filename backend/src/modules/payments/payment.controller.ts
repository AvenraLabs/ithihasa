import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service.js';
import { sendSuccess, sendError } from '../../common/utils/response.js';

export class PaymentController {
  public async handleWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { response: responseBase64 } = req.body;
      const xVerifyHeader = req.headers['x-verify'] as string;

      if (!responseBase64 || !xVerifyHeader) {
        sendError(res, 'Missing webhook payload or checksum header', 400);
        return;
      }

      const result = await paymentService.handlePhonePeWebhook(responseBase64, xVerifyHeader);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await paymentService.checkOrderStatus(req.params.orderId);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();
