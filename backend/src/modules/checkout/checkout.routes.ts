import { Router } from 'express';
import { checkoutController } from './checkout.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { initiateCheckoutSchema } from './checkout.validation.js';

export const checkoutRouter = Router();

checkoutRouter.use(authenticate);

checkoutRouter.post(
  '/initiate',
  validateRequest({ body: initiateCheckoutSchema }),
  checkoutController.initiate
);
