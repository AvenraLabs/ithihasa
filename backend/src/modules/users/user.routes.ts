import { Router } from 'express';
import { userController } from './user.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { validateRequest } from '../../middleware/validation.js';
import { updateProfileSchema } from '../auth/auth.validation.js';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/profile', userController.getProfile);
userRouter.patch('/profile', validateRequest({ body: updateProfileSchema }), userController.updateProfile);
