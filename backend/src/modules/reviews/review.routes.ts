import { Router } from 'express';
import { reviewController } from './review.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { createReviewSchema } from './review.validation.js';

export const reviewRouter = Router();

reviewRouter.get('/product/:productId', reviewController.listForProduct);
reviewRouter.post(
  '/',
  authenticate,
  validateRequest({ body: createReviewSchema }),
  reviewController.create
);
