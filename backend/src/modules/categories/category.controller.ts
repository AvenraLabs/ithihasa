import { Request, Response, NextFunction } from 'express';
import { categoryService } from './category.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class CategoryController {
  public async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getCategories();
      sendSuccess(res, categories, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.getCategoryBySlug(req.params.slug);
      sendSuccess(res, category, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const categoryController = new CategoryController();
