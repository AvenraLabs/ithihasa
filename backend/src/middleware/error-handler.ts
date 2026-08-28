import { Request, Response, NextFunction } from 'express';
import { AppError } from '../common/errors/index.js';
import { sendError } from '../common/utils/response.js';
import { logger } from '../common/logger/index.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): Response {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, reqId: req.id, path: req.path }, err.message);
    }
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle SyntaxError / Body parser errors
  if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400) {
    return sendError(res, 'Malformed JSON payload in request body', 400, 'MALFORMED_JSON');
  }

  // Handle Unexpected/Unhandled Server Errors
  logger.error({ err, reqId: req.id, path: req.path }, 'Unhandled server exception');

  const message = env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred' : err.message;
  return sendError(res, message, 500, 'INTERNAL_SERVER_ERROR');
}

export function notFoundHandler(req: Request, res: Response): Response {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND');
}
