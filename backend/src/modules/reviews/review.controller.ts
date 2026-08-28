import { Request, Response, NextFunction } from 'express';
import { reviewService } from './review.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class ReviewController {
  public async listForProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const reviews = await reviewService.getProductReviews(req.params.productId);
      sendSuccess(res, reviews, 200);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const review = await reviewService.createReview(req.user!.userId, req.body);
      sendSuccess(res, review, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const reviewController = new ReviewController();
