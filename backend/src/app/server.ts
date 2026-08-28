import { createApp } from './app.js';
import { env } from '../config/env.js';
import { testDatabaseConnection, sequelize } from '../config/database.js';
import { logger } from '../common/logger/index.js';

async function bootstrap() {
  try {
    // 1. Verify PostgreSQL Database Connection
    await testDatabaseConnection();

    // 2. Instantiate App
    const app = createApp();

    // 3. Start Listening
    const server = app.listen(env.PORT, env.HOST, () => {
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
