import {
  sequelize,
  setupModelAssociations,
  User,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Order,
  Review
} from '../index.js';
import { Op } from 'sequelize';

async function cleanSeedUsers() {
  try {
    setupModelAssociations();
    await sequelize.authenticate();
    console.log('Connected to DB for cleanup.');

    // Find users with seed names or demo email
    const usersToDelete = await User.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: '%santhosh%' } },
          { name: { [Op.iLike]: '%aravinth%' } },
          { name: { [Op.iLike]: '%rohit%' } },
          { name: { [Op.iLike]: '%aravind%' } },
          { email: 'customer@ithihasa.com' }
        ]
      }
    });

    console.log(`Found ${usersToDelete.length} seed users to delete.`);

    for (const u of usersToDelete) {
      console.log(`Deleting user: ${u.name} (${u.email || u.phone})`);
      
      // Clean up relations
      const carts = await Cart.findAll({ where: { user_id: u.id } });
      for (const cart of carts) {
        await CartItem.destroy({ where: { cart_id: cart.id } });
        await cart.destroy();
      }

      const wishlists = await Wishlist.findAll({ where: { user_id: u.id } });
      for (const wl of wishlists) {
        await WishlistItem.destroy({ where: { wishlist_id: wl.id } });
        await wl.destroy();
      }

      await Review.destroy({ where: { user_id: u.id } });
      await Order.destroy({ where: { user_id: u.id } });
      await u.destroy();
    }

    console.log('Cleanup completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanSeedUsers();
