import { Router } from 'express';
import { returnController } from './return.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { createReturnRequestSchema } from './return.validation.js';

export const returnRouter = Router();

returnRouter.use(authenticate);

returnRouter.get('/', returnController.list);
returnRouter.post('/', validateRequest({ body: createReturnRequestSchema }), returnController.create);
