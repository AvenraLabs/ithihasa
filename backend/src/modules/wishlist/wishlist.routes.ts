import { Router } from 'express';
import { wishlistController } from './wishlist.controller.js';
import { optionalAuthenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { toggleWishlistSchema } from './wishlist.validation.js';

export const wishlistRouter = Router();

wishlistRouter.use(optionalAuthenticate);

wishlistRouter.get('/', wishlistController.get);
wishlistRouter.post(
  '/toggle',
  validateRequest({ body: toggleWishlistSchema }),
  wishlistController.toggle
);
