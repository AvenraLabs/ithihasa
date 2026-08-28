import { Request, Response, NextFunction } from 'express';
import { addressService } from './address.service.js';
import { sendSuccess } from '../../common/utils/response.js';

export class AddressController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const addresses = await addressService.getAddresses(req.user!.userId);
      sendSuccess(res, addresses, 200);
    } catch (error) {
      next(error);
    }
  }

  public async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const address = await addressService.getAddressById(req.user!.userId, req.params.id);
      sendSuccess(res, address, 200);
    } catch (error) {
      next(error);
    }
  }

  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const created = await addressService.createAddress(req.user!.userId, req.body);
      sendSuccess(res, created, 201);
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await addressService.updateAddress(req.user!.userId, req.params.id, req.body);
      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  public async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await addressService.deleteAddress(req.user!.userId, req.params.id);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const addressController = new AddressController();
