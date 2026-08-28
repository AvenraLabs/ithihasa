import {
  sequelize,
  Return,
  ReturnItem,
  Order,
  OrderItem,
  OrderStatusHistory,
} from '../../database/index.js';
import { NotFoundError, BusinessRuleError } from '../../common/errors/index.js';

export class ReturnService {
  /**
   * Submits a customer return request for a delivered order
   */
  public async createReturnRequest(userId: string, data: {
    orderId: string;
    reason: string;
    customerComments?: string | null;
    items: Array<{ orderItemId: string; quantity: number; reason?: string | null }>;
  }) {
    const order = await Order.findOne({
      where: { id: data.orderId, user_id: userId },
      include: [{ model: OrderItem, as: 'items' }],
    });

    if (!order) throw new NotFoundError('Order');

    if (order.status !== 'DELIVERED') {
      throw new BusinessRuleError('Returns are only allowed for delivered orders');
    }

    // Calculate refund amount based on returned items
    let refundAmount = 0;
    const returnItemsPayload: any[] = [];

    for (const returnItem of data.items) {
      const orderItem = (order as any).items?.find((it: any) => it.id === returnItem.orderItemId);
      if (!orderItem) {
        throw new NotFoundError(`Order item ${returnItem.orderItemId}`);
      }

      if (returnItem.quantity > orderItem.quantity) {
        throw new BusinessRuleError(
          `Return quantity (${returnItem.quantity}) exceeds purchased quantity (${orderItem.quantity})`
        );
      }

      const itemTotal = Number(orderItem.unit_price) * returnItem.quantity;
      refundAmount += itemTotal;

      returnItemsPayload.push({
        order_item_id: orderItem.id,
        quantity: returnItem.quantity,
        reason: returnItem.reason || data.reason,
      });
    }

    return sequelize.transaction(async (t) => {
      const returnRequest = await Return.create(
        {
          order_id: order.id,
          user_id: userId,
          status: 'REQUESTED',
          reason: data.reason,
          customer_comments: data.customerComments || null,
          refund_amount: Number(refundAmount.toFixed(2)),
        },
        { transaction: t }
      );

      await ReturnItem.bulkCreate(
        returnItemsPayload.map((it) => ({
          ...it,
          return_id: returnRequest.id,
        })),
        { transaction: t }
      );

      order.status = 'RETURN_REQUESTED';
      await order.save({ transaction: t });

      await OrderStatusHistory.create(
        {
          order_id: order.id,
          from_status: 'DELIVERED',
          to_status: 'RETURN_REQUESTED',
          actor: 'CUSTOMER',
          reason: `Return requested: ${data.reason}`,
        },
        { transaction: t }
      );

      return returnRequest;
    });
  }

  /**
   * Lists customer's returns
   */
  public async getCustomerReturns(userId: string) {
    return Return.findAll({
      where: { user_id: userId },
      include: [
        {
          model: ReturnItem,
          as: 'items',
          include: [{ model: OrderItem, as: 'order_item' }],
        },
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_number', 'total_amount', 'created_at'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }
}

export const returnService = new ReturnService();
