import { Request, Response, NextFunction } from 'express';
import { AuthorizationError, AuthenticationError } from '../common/errors/index.js';

export function requireRole(...allowedRoles: Array<'CUSTOMER' | 'ADMIN'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthenticationError('Authentication required to access this resource'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(`Role '${req.user.role}' is not authorized to access this resource`)
      );
    }

    next();
  };
}
