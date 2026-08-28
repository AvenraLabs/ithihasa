import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export type OrderStatus =
  | 'PENDING_PAYMENT'
  | 'PAID'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED'
  | 'REFUNDED';

export interface OrderAttributes {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount_amount: number;
  coupon_code?: string | null;
  shipping_amount: number;
  tax_amount: number;
  total_amount: number;
  currency: string;
  shipping_address: Record<string, unknown>;
  billing_address?: Record<string, unknown> | null;
  notes?: string | null;
  idempotency_key?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type OrderCreationAttributes = Optional<
  OrderAttributes,
  | 'id'
  | 'status'
  | 'discount_amount'
  | 'coupon_code'
  | 'shipping_amount'
  | 'tax_amount'
  | 'currency'
  | 'billing_address'
  | 'notes'
  | 'idempotency_key'
>;

export class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  declare public id: string;
  declare public order_number: string;
  declare public user_id: string;
  declare public status: OrderStatus;
  declare public subtotal: number;
  declare public discount_amount: number;
  declare public coupon_code: string | null;
  declare public shipping_amount: number;
  declare public tax_amount: number;
  declare public total_amount: number;
  declare public currency: string;
  declare public shipping_address: Record<string, unknown>;
  declare public billing_address: Record<string, unknown> | null;
  declare public notes: string | null;
  declare public idempotency_key: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    order_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'PENDING_PAYMENT',
        'PAID',
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURN_REQUESTED',
        'RETURNED',
        'REFUNDED'
      ),
      defaultValue: 'PENDING_PAYMENT',
      allowNull: false,
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    discount_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    coupon_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    shipping_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      allowNull: false,
    },
    shipping_address: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    billing_address: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    idempotency_key: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    indexes: [
      { unique: true, fields: ['order_number'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
      { unique: true, fields: ['idempotency_key'] },
      { fields: ['created_at'] },
    ],
  }
);
