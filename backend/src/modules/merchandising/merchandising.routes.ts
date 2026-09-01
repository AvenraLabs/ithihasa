import { Router } from 'express';
import { merchandisingController } from './merchandising.controller.js';

export const merchandisingRouter = Router();

// Public route for customer storefront
merchandisingRouter.get('/storefront', merchandisingController.getStorefront);
