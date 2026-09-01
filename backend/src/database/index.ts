import { sequelize } from '../config/database.js';

import { User } from './models/user.model.js';
import { UserOtp } from './models/user-otp.model.js';
import { Address } from './models/address.model.js';
import { Category } from './models/category.model.js';
import { Product } from './models/product.model.js';
import { ProductVariant } from './models/product-variant.model.js';
import { ProductImage } from './models/product-image.model.js';
import { Inventory } from './models/inventory.model.js';
import { InventoryMovement } from './models/inventory-movement.model.js';
import { Cart } from './models/cart.model.js';
import { CartItem } from './models/cart-item.model.js';
import { Wishlist } from './models/wishlist.model.js';
import { WishlistItem } from './models/wishlist-item.model.js';
import { Coupon } from './models/coupon.model.js';
import { CouponRedemption } from './models/coupon-redemption.model.js';
import { Order } from './models/order.model.js';
import { OrderItem } from './models/order-item.model.js';
import { OrderStatusHistory } from './models/order-status-history.model.js';
import { Payment } from './models/payment.model.js';
import { Return } from './models/return.model.js';
import { ReturnItem } from './models/return-item.model.js';
import { Refund } from './models/refund.model.js';
import { Review } from './models/review.model.js';
import { AuditLog } from './models/audit-log.model.js';
import { AppSetting } from './models/app-setting.model.js';

let associationsInitialized = false;

// Setup Associations
export function setupModelAssociations(): void {
  if (associationsInitialized) return;
  associationsInitialized = true;

  // User Associations
  User.hasMany(Address, { foreignKey: 'user_id', as: 'addresses' });
  Address.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(UserOtp, { foreignKey: 'user_id', as: 'otps' });
  UserOtp.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasOne(Wishlist, { foreignKey: 'user_id', as: 'wishlist' });
  Wishlist.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(Cart, { foreignKey: 'user_id', as: 'carts' });
  Cart.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
  Order.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  User.hasMany(Review, { foreignKey: 'user_id', as: 'reviews' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Category Associations
  Category.hasMany(Category, { foreignKey: 'parent_id', as: 'subcategories' });
  Category.belongsTo(Category, { foreignKey: 'parent_id', as: 'parent' });

  Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
  Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

  // Product Associations
  Product.hasMany(ProductVariant, { foreignKey: 'product_id', as: 'variants' });
  ProductVariant.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  Product.hasMany(ProductImage, { foreignKey: 'product_id', as: 'images' });
  ProductImage.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  ProductVariant.hasMany(ProductImage, { foreignKey: 'variant_id', as: 'variant_images' });
  ProductImage.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  ProductVariant.hasOne(Inventory, { foreignKey: 'variant_id', as: 'inventory' });
  Inventory.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  ProductVariant.hasMany(InventoryMovement, { foreignKey: 'variant_id', as: 'inventory_movements' });
  InventoryMovement.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  Product.hasMany(Review, { foreignKey: 'product_id', as: 'reviews' });
  Review.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  // Cart Associations
  Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
  CartItem.belongsTo(Cart, { foreignKey: 'cart_id', as: 'cart' });

  CartItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });
  ProductVariant.hasMany(CartItem, { foreignKey: 'variant_id', as: 'cart_items' });

  // Wishlist Associations
  Wishlist.hasMany(WishlistItem, { foreignKey: 'wishlist_id', as: 'items' });
  WishlistItem.belongsTo(Wishlist, { foreignKey: 'wishlist_id', as: 'wishlist' });

  WishlistItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
  WishlistItem.belongsTo(ProductVariant, { foreignKey: 'variant_id', as: 'variant' });

  // Order Associations
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'status_history' });
  OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Order.hasMany(Payment, { foreignKey: 'order_id', as: 'payments' });
  Payment.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Order.hasMany(Return, { foreignKey: 'order_id', as: 'returns' });
  Return.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  Order.hasMany(Refund, { foreignKey: 'order_id', as: 'refunds' });
  Refund.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

  // Return Associations
  Return.hasMany(ReturnItem, { foreignKey: 'return_id', as: 'items' });
  ReturnItem.belongsTo(Return, { foreignKey: 'return_id', as: 'return' });

  ReturnItem.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'order_item' });

  // Coupon Associations
  Coupon.hasMany(CouponRedemption, { foreignKey: 'coupon_id', as: 'redemptions' });
  CouponRedemption.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

  CouponRedemption.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  CouponRedemption.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
}

// Call associations initialization
setupModelAssociations();

export {
  sequelize,
  User,
  UserOtp,
  Address,
  Category,
  Product,
  ProductVariant,
  ProductImage,
  Inventory,
  InventoryMovement,
  Cart,
  CartItem,
  Wishlist,
  WishlistItem,
  Coupon,
  CouponRedemption,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Return,
  ReturnItem,
  Refund,
  Review,
  AuditLog,
  AppSetting,
};
