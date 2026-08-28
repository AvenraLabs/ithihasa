import { sequelize, setupModelAssociations } from '../index.js';
import { logger } from '../../common/logger/index.js';

async function verifyAndMigrate() {
  try {
    setupModelAssociations();
    logger.info('Checking users table columns...');
    
    // Explicitly add password_hash if not present
    await sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'password_hash'
        ) THEN
          ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
        END IF;
      END $$;
    `);

    // Verify all columns on users table
    const [columns] = await sequelize.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users';
    `);

    logger.info({ columns }, '✅ Users table columns verified');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, '❌ Database verification failed');
    process.exit(1);
  }
}

verifyAndMigrate();
