import http from 'http';
import { createApp } from './app.js';
import { env } from '../config/env.js';
import { testDatabaseConnection, sequelize } from '../config/database.js';
import { setupModelAssociations } from '../database/index.js';
import { logger } from '../common/logger/index.js';
import { initSupportSocket } from '../modules/support/support.socket.js';

async function bootstrap() {
  try {
    // 1. Verify PostgreSQL Database Connection & Sync Schema
    await testDatabaseConnection();
    setupModelAssociations();
    await sequelize.sync({ alter: true });
    logger.info('📦 Database tables and schema synchronized.');

    // 2. Instantiate App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 3. Attach Socket.IO for Real-Time Concierge Dialogue
    initSupportSocket(server);

    // 4. Start Listening
    server.listen(env.PORT, env.HOST, () => {
      logger.info(
        `🏛️  Ithihasa Backend Server running on http://${env.HOST}:${env.PORT}${env.API_PREFIX} [${env.NODE_ENV}]`
      );
    });

    // Graceful Shutdown Handlers
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        try {
          await sequelize.close();
          logger.info('Database connection closed cleanly.');
          process.exit(0);
        } catch (err) {
          logger.error({ err }, 'Error during database disconnect.');
          process.exit(1);
        }
      });

      // Force shutdown if taking too long
      setTimeout(() => {
        logger.error('Forceful shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ err: error }, '💥 Failed to initialize Ithihasa backend');
    process.exit(1);
  }
}

bootstrap();
