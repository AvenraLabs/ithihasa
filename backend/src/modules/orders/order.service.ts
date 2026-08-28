import {
  sequelize,
  Order,
  OrderItem,
  OrderStatusHistory,
  Payment,
  Return,
} from '../../database/index.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

export class OrderService {
  /**
   * Lists customer's orders with pagination
   */
  public async getCustomerOrders(userId: string, filters: { status?: string; page?: number; limit?: number }) {
    const { status, page = 1, limit = 10 } = filters;
    const where: any = { user_id: userId };
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'provider', 'status', 'amount'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return {
      orders,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  /**
   * Gets specific order detail (IDOR-safe, requires matching user_id)
   */
  public async getCustomerOrderById(userId: string, orderId: string) {
    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [
        {
          model: OrderItem,
          as: 'items',
        },
        {
          model: OrderStatusHistory,
          as: 'status_history',
        },
        {
          model: Payment,
          as: 'payments',
          attributes: ['id', 'provider', 'merchant_transaction_id', 'status', 'amount', 'created_at'],
        },
        {
          model: Return,
          as: 'returns',
          required: false,
        },
      ],
      order: [
        [{ model: OrderStatusHistory, as: 'status_history' }, 'created_at', 'ASC'],
      ],
    });

    if (!order) throw new NotFoundError('Order');
    return order;
  }

  /**
   * Customer cancels order (allowed only if PENDING_PAYMENT or PAID/PROCESSING and not yet PACKED/SHIPPED)
   */
  public async cancelOrder(userId: string, orderId: string, reason: string) {
    const order = await Order.findOne({
      where: { id: orderId, user_id: userId },
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) throw new NotFoundError('Order');

    const allowedCancelStates = ['PENDING_PAYMENT', 'PAID', 'PROCESSING'];
    if (!allowedCancelStates.includes(order.status)) {
      throw new BusinessRuleError(
        `Order cannot be cancelled because it is already in '${order.status}' status.`
      );
    }

    return sequelize.transaction(async (t) => {
      const fromStatus = order.status;
      order.status = 'CANCELLED';
      await order.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          order_id: order.id,
          from_status: fromStatus,
          to_status: 'CANCELLED',
          actor: 'CUSTOMER',
          reason: `Cancelled by customer: ${reason}`,
        },
        { transaction: t }
      );

      // Release stock if it was still reserved
      if (fromStatus === 'PENDING_PAYMENT' && (order as any).items) {
        const releaseItems = (order as any).items.map((it: any) => ({
          variantId: it.variant_id,
          quantity: it.quantity,
        }));
        await inventoryService.releaseStock(releaseItems, order.order_number, t);
      }

      return order;
    });
  }
}

export const orderService = new OrderService();
