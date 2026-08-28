import { Sequelize } from 'sequelize';
import { env } from './env.js';
import { logger } from '../common/logger/index.js';

export const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.DB_LOGGING ? (msg) => logger.debug(msg) : false,
  pool: {
    max: env.DB_POOL_MAX,
    min: env.DB_POOL_MIN,
    idle: env.DB_POOL_IDLE,
    acquire: 30000,
  },
  define: {
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
});

export async function testDatabaseConnection(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('✅ PostgreSQL database connection established successfully.');
  } catch (error) {
    logger.error({ err: error }, '❌ Unable to connect to the PostgreSQL database.');
    throw error;
  }
}
