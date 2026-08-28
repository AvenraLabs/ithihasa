import { Router } from 'express';
import { couponController } from './coupon.controller.js';

export const couponRouter = Router();

couponRouter.get('/:code', couponController.getByCode);
