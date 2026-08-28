import { Router } from 'express';
import { addressController } from './address.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { createAddressSchema, updateAddressSchema } from './address.validation.js';

export const addressRouter = Router();

addressRouter.use(authenticate);

addressRouter.get('/', addressController.list);
addressRouter.get('/:id', addressController.getOne);
addressRouter.post('/', validateRequest({ body: createAddressSchema }), addressController.create);
addressRouter.patch('/:id', validateRequest({ body: updateAddressSchema }), addressController.update);
addressRouter.delete('/:id', addressController.remove);
