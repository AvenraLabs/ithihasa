import express, { Express } from 'express';
import { pinoHttp } from 'pino-http';
import { env } from '../config/env.js';
import { logger } from '../common/logger/index.js';
import { corsMiddleware, helmetMiddleware, globalRateLimiter } from '../config/security.js';
import { requestIdMiddleware } from '../middleware/request-id.js';
import { errorHandler, notFoundHandler } from '../middleware/error-handler.js';
import { apiRouter } from './routes.js';
import { sequelize } from '../config/database.js';

export function createApp(): Express {
  const app = express();

  // Basic Security & Headers
  app.use(helmetMiddleware);
  app.use(corsMiddleware);

  // Body Parsing (JSON & URL-Encoded)
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // Request ID & Logging
  app.use(requestIdMiddleware);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.id,
      autoLogging: env.NODE_ENV !== 'test',
    })
  );

  // Global Rate Limiting
  app.use(globalRateLimiter);

  // Health Checks (GCP / PM2 / Monitoring ready)
  const healthHandler = (_req: any, res: any) => {
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'ithihasa-backend',
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  app.get('/ready', async (_req, res) => {
    try {
      await sequelize.authenticate();
      res.status(200).json({
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Mount API Router under prefix
  app.use(env.API_PREFIX, apiRouter);

  // 404 & Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
