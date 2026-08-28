import { Router } from 'express';
import { orderController } from './order.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { listOrdersQuerySchema, cancelOrderSchema } from './order.validation.js';

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.get('/', validateRequest({ query: listOrdersQuerySchema }), orderController.list);
orderRouter.get('/:id', orderController.getById);
orderRouter.post('/:id/cancel', validateRequest({ body: cancelOrderSchema }), orderController.cancel);
