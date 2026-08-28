import {
  Wishlist,
  WishlistItem,
  Product,
  ProductVariant,
  ProductImage,
} from '../../database/index.js';
import { NotFoundError } from '../../common/errors/index.js';

export class WishlistService {
  public async getOrCreateWishlist(userId: string): Promise<Wishlist> {
    let wishlist = await Wishlist.findOne({ where: { user_id: userId } });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user_id: userId });
    }
    return wishlist;
  }

  public async getWishlist(userId: string) {
    const wishlist = await this.getOrCreateWishlist(userId);

    const items = await WishlistItem.findAll({
      where: { wishlist_id: wishlist.id },
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
          model: ProductVariant,
          as: 'variant',
          required: false,
        },
      ],
      order: [['created_at', 'DESC']],
    });

    return items.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.variant_id,
      product: {
        id: item.product?.id,
        name: item.product?.name,
        slug: item.product?.slug,
        basePrice: Number(item.product?.base_price),
        compareAtPrice: item.product?.compare_at_price ? Number(item.product.compare_at_price) : null,
        image:
          item.product?.images?.find((img: any) => img.is_primary)?.url ||
          item.product?.images?.[0]?.url ||
          null,
      },
      variant: item.variant
        ? {
            id: item.variant.id,
            sku: item.variant.sku,
            size: item.variant.size,
            color: item.variant.color,
            price: Number(item.variant.price),
          }
        : null,
    }));
  }

  public async toggleItem(userId: string, productId: string, variantId?: string | null) {
    const product = await Product.findByPk(productId);
    if (!product || product.status !== 'ACTIVE') {
      throw new NotFoundError('Product');
    }

    const wishlist = await this.getOrCreateWishlist(userId);

    const whereClause: any = {
      wishlist_id: wishlist.id,
      product_id: productId,
    };
    if (variantId) {
      whereClause.variant_id = variantId;
    }

    const existing = await WishlistItem.findOne({ where: whereClause });

    if (existing) {
      await existing.destroy();
      return { added: false, message: 'Removed from wishlist' };
    }

    await WishlistItem.create({
      wishlist_id: wishlist.id,
      product_id: productId,
      variant_id: variantId || null,
    });

    return { added: true, message: 'Added to wishlist' };
  }
}

export const wishlistService = new WishlistService();
