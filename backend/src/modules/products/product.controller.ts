import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class ProductController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await productService.getProducts(req.query);
      sendSuccess(res, result.products, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  public async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getProductBySlug(req.params.slug);
      sendSuccess(res, product, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
