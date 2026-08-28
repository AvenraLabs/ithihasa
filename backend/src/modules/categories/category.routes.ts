import { Router } from 'express';
import { categoryController } from './category.controller.js';

export const categoryRouter = Router();

categoryRouter.get('/', categoryController.list);
categoryRouter.get('/:slug', categoryController.getBySlug);
