import { sequelize, setupModelAssociations, User } from '../index.js';
import { hashValue, verifyHash } from '../../common/utils/crypto.js';
import { logger } from '../../common/logger/index.js';

async function seedAdmin() {
  try {
    logger.info('🔑 Seeding/Resetting Master Atelier Admin in database...');
    setupModelAssociations();
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });

    const adminEmail = 'admin@ithihasa.com';
    const adminPassword = 'Admin@123456';
    const hashedPassword = await hashValue(adminPassword);

    let user = await User.findOne({ where: { email: adminEmail } });

    if (user) {
      await user.update({
        name: 'Ithihasa Atelier Director',
        role: 'ADMIN',
        status: 'ACTIVE',
        password_hash: hashedPassword,
        phone_verified: true,
      });
      logger.info(`✅ Updated existing admin user in DB: ID=${user.id}, Email=${user.email}`);
    } else {
      user = await User.create({
        email: adminEmail,
        name: 'Ithihasa Atelier Director',
        role: 'ADMIN',
        status: 'ACTIVE',
        phone: '9876500001',
        password_hash: hashedPassword,
        phone_verified: true,
      });
      logger.info(`✅ Created new admin user in DB: ID=${user.id}, Email=${user.email}`);
    }

    // Direct Database Verification
    const reloaded = await User.findByPk(user.id);
    if (!reloaded) throw new Error('Failed to reload user from database.');

    const isMatch = await verifyHash(adminPassword, reloaded.password_hash || '');
    if (!isMatch) {
      throw new Error('Verification failed: Password does not match database hash.');
    }

    logger.info('=============================================');
    logger.info('👑 MASTER ATELIER ADMIN READY IN DATABASE:');
    logger.info(`   Email / Username : ${adminEmail}`);
    logger.info(`   Alternative Alias: admin`);
    logger.info(`   Password         : ${adminPassword}`);
    logger.info(`   Role             : ${reloaded.role}`);
    logger.info(`   Status           : ${reloaded.status}`);
    logger.info(`   DB Verification  : PASSED (bcrypt compare successful)`);
    logger.info('=============================================');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed admin user:', error);
    process.exit(1);
  }
}

seedAdmin();
