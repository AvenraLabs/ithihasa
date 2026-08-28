import { Router } from 'express';
import { inventoryController } from './inventory.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireRole } from '../../middleware/rbac.js';
import { validateRequest } from '../../middleware/validation.js';
import { adjustInventorySchema } from './inventory.validation.js';

export const inventoryRouter = Router();

inventoryRouter.use(authenticate, requireRole('ADMIN'));

inventoryRouter.post(
  '/adjust',
  validateRequest({ body: adjustInventorySchema }),
  inventoryController.adjust
);
inventoryRouter.get('/movements', inventoryController.movements);
