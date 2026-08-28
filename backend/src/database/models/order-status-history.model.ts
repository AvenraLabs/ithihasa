import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';
import { OrderStatus } from './order.model.js';

export interface OrderStatusHistoryAttributes {
  id: string;
  order_id: string;
  from_status?: OrderStatus | null;
  to_status: OrderStatus;
  actor: string; // e.g. "CUSTOMER", "SYSTEM", "ADMIN:john@example.com", "PHONEPE_WEBHOOK"
  reason?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type OrderStatusHistoryCreationAttributes = Optional<
  OrderStatusHistoryAttributes,
  'id' | 'from_status' | 'reason'
>;

export class OrderStatusHistory
  extends Model<OrderStatusHistoryAttributes, OrderStatusHistoryCreationAttributes>
  implements OrderStatusHistoryAttributes
{
  declare public id: string;
  declare public order_id: string;
  declare public from_status: OrderStatus | null;
  declare public to_status: OrderStatus;
  declare public actor: string;
  declare public reason: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

OrderStatusHistory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    from_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    to_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    actor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'order_status_history',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['to_status'] },
      { fields: ['created_at'] },
    ],
  }
);
