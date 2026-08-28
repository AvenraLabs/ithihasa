import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare global {
  namespace Express {
    interface Request {
      id: string;
      sessionId?: string;
    }
  }
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  const sessionId = (req.headers['x-session-id'] as string) || undefined;

  req.id = reqId;
  req.sessionId = sessionId;
  res.setHeader('X-Request-Id', reqId);

  next();
}
