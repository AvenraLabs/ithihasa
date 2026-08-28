import { Review, Order, OrderItem, Product } from '../../database/index.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

export class ReviewService {
  public async getProductReviews(productId: string) {
    return Review.findAll({
      where: { product_id: productId, status: 'APPROVED' },
      order: [['created_at', 'DESC']],
    });
  }

  public async createReview(userId: string, data: {
    productId: string;
    rating: number;
    title?: string | null;
    comment: string;
  }) {
    const product = await Product.findByPk(data.productId);
    if (!product) throw new NotFoundError('Product');

    // Check verified purchase
    const verifiedPurchase = await Order.findOne({
      where: { user_id: userId, status: 'DELIVERED' },
      include: [
        {
          model: OrderItem,
          as: 'items',
          where: { product_id: data.productId },
          required: true,
        },
      ],
    });

    return Review.create({
      product_id: data.productId,
      user_id: userId,
      rating: data.rating,
      title: data.title || null,
      comment: data.comment,
      is_verified_purchase: Boolean(verifiedPurchase),
      status: 'APPROVED',
    });
  }
}

export const reviewService = new ReviewService();
