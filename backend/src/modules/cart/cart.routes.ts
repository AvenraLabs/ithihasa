import { Router } from 'express';
import { cartController } from './cart.controller.js';
import { optionalAuthenticate, authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} from './cart.validation.js';

export const cartRouter = Router();

// Guest & Customer unified routes
cartRouter.get('/', optionalAuthenticate, cartController.getCart);
cartRouter.post(
  '/items',
  optionalAuthenticate,
  validateRequest({ body: addToCartSchema }),
  cartController.addItem
);
cartRouter.patch(
  '/items/:itemId',
  optionalAuthenticate,
  validateRequest({ body: updateCartItemSchema }),
  cartController.updateItem
);
cartRouter.delete('/items/:itemId', optionalAuthenticate, cartController.removeItem);

// Customer Login Cart Merge
cartRouter.post(
  '/merge',
  authenticate,
  validateRequest({ body: mergeCartSchema }),
  cartController.merge
);
