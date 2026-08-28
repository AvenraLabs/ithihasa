import { Router } from 'express';
import { productController } from './product.controller.js';
import { validateRequest } from '../../middleware/validation.js';
import { listProductsQuerySchema } from './product.validation.js';

export const productRouter = Router();

productRouter.get('/', validateRequest({ query: listProductsQuerySchema }), productController.list);
productRouter.get('/:slug', productController.getBySlug);
