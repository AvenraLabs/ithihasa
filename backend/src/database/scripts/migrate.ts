import { sequelize, setupModelAssociations } from '../index.js';
import { logger } from '../../common/logger/index.js';

async function migrate() {
  try {
    logger.info('🔄 Synchronizing database tables and models...');
    setupModelAssociations();
    await sequelize.sync({ alter: true });
    logger.info('✅ Database synchronization completed successfully.');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, '❌ Database migration failed');
    process.exit(1);
  }
}

migrate();
