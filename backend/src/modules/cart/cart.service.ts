import { v4 as uuidv4 } from 'uuid';
import {
  Cart,
  CartItem,
  ProductVariant,
  Product,
  ProductImage,
  Inventory,
} from '../../database/index.js';
import { pricingService } from '../pricing/pricing.service.js';
import { NotFoundError, InventoryError } from '../../common/errors/index.js';

export class CartService {
  /**
   * Retrieves or creates active cart for user or guest session
   */
  public async getOrCreateCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (userId) {
      let cart = await Cart.findOne({
        where: { user_id: userId, status: 'ACTIVE' },
      });
      if (!cart) {
        cart = await Cart.create({ user_id: userId, status: 'ACTIVE' });
      }
      return cart;
    }

    const guestId = sessionId || uuidv4();
    let cart = await Cart.findOne({
      where: { session_id: guestId, status: 'ACTIVE' },
    });
    if (!cart) {
      cart = await Cart.create({ session_id: guestId, status: 'ACTIVE' });
    }
    return cart;
  }

  /**
   * Gets full cart contents with item details and calculated pricing quote
   */
  public async getCart(userId?: string, sessionId?: string, couponCode?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);

    const items = await CartItem.findAll({
      where: { cart_id: cart.id },
      include: [
        {
          model: ProductVariant,
          as: 'variant',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['url', 'is_primary'],
                },
              ],
            },
            {
              model: Inventory,
              as: 'inventory',
              attributes: ['available'],
            },
          ],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    const pricingItems = items.map((item: any) => {
      const variant = item.variant;
      const product = variant?.product;
      const primaryImage =
        product?.images?.find((img: any) => img.is_primary)?.url ||
        product?.images?.[0]?.url ||
        null;

      return {
        variantId: item.variant_id,
        unitPrice: Number(variant?.price || item.unit_price),
        quantity: item.quantity,
        productName: product?.name || 'Unknown Product',
        variantName: `Size: ${variant?.size || 'Standard'}${variant?.color ? ` / Color: ${variant.color}` : ''}`,
        sku: variant?.sku || '',
        imageUrl: primaryImage,
      };
    });

    const quote = await pricingService.calculateQuote(pricingItems, couponCode, userId);

    return {
      id: cart.id,
      sessionId: cart.session_id,
      items: items.map((item: any, idx) => ({
        id: item.id,
        variantId: item.variant_id,
        quantity: item.quantity,
        unitPrice: pricingItems[idx].unitPrice,
        subtotal: pricingItems[idx].unitPrice * item.quantity,
        product: {
          id: item.variant?.product?.id,
          name: item.variant?.product?.name,
          slug: item.variant?.product?.slug,
          image: pricingItems[idx].imageUrl,
        },
        variant: {
          id: item.variant?.id,
          sku: item.variant?.sku,
          size: item.variant?.size,
          color: item.variant?.color,
          availableStock: item.variant?.inventory?.available || 0,
        },
      })),
      summary: quote,
    };
  }

  /**
   * Adds an item to the cart
   */
  public async addItem(
    variantId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ) {
    const variant = await ProductVariant.findByPk(variantId, {
      include: [{ model: Inventory, as: 'inventory' }],
    });

    if (!variant || variant.status !== 'ACTIVE') {
      throw new NotFoundError('Product Variant');
    }

    const availableStock = (variant as any).inventory?.available || 0;
    if (availableStock < quantity) {
      throw new InventoryError(`Only ${availableStock} units available in stock`);
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    const existingItem = await CartItem.findOne({
      where: { cart_id: cart.id, variant_id: variantId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (availableStock < newQuantity) {
        throw new InventoryError(`Cannot add more. Only ${availableStock} units available in stock.`);
      }
      existingItem.quantity = newQuantity;
      existingItem.unit_price = variant.price;
      await existingItem.save();
    } else {
      await CartItem.create({
        cart_id: cart.id,
        variant_id: variantId,
        quantity,
        unit_price: variant.price,
      });
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Updates cart item quantity (0 removes item)
   */
  public async updateItemQuantity(
    itemId: string,
    quantity: number,
    userId?: string,
    sessionId?: string
  ) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const item = await CartItem.findOne({
      where: { id: itemId, cart_id: cart.id },
      include: [
        {
          model: ProductVariant,
          as: 'variant',
          include: [{ model: Inventory, as: 'inventory' }],
        },
      ],
    });

    if (!item) throw new NotFoundError('Cart Item');

    if (quantity <= 0) {
      await item.destroy();
    } else {
      const availableStock = (item as any).variant?.inventory?.available || 0;
      if (availableStock < quantity) {
        throw new InventoryError(`Only ${availableStock} units available in stock`);
      }
      item.quantity = quantity;
      await item.save();
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Removes item from cart
   */
  public async removeItem(itemId: string, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    const item = await CartItem.findOne({
      where: { id: itemId, cart_id: cart.id },
    });

    if (item) {
      await item.destroy();
    }

    return this.getCart(userId, sessionId);
  }

  /**
   * Merges guest cart into authenticated customer cart upon login
   */
  public async mergeGuestCart(userId: string, guestSessionId: string) {
    const guestCart = await Cart.findOne({
      where: { session_id: guestSessionId, status: 'ACTIVE' },
      include: [{ model: CartItem, as: 'items' }],
    });

    const items = (guestCart as any)?.items;
    if (!guestCart || !items || items.length === 0) {
      return this.getCart(userId);
    }

    const userCart = await this.getOrCreateCart(userId);

    for (const guestItem of items) {
      const existingUserItem = await CartItem.findOne({
        where: { cart_id: userCart.id, variant_id: guestItem.variant_id },
      });

      if (existingUserItem) {
        existingUserItem.quantity += guestItem.quantity;
        await existingUserItem.save();
      } else {
        await CartItem.create({
          cart_id: userCart.id,
          variant_id: guestItem.variant_id,
          quantity: guestItem.quantity,
          unit_price: guestItem.unit_price,
        });
      }
    }

    // Mark guest cart as converted
    guestCart.status = 'CONVERTED';
    await guestCart.save();

    return this.getCart(userId);
  }
}

export const cartService = new CartService();
