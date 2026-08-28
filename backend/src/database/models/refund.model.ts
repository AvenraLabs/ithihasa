import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface RefundAttributes {
  id: string;
  order_id: string;
  payment_id: string;
  return_id?: string | null;
  refund_transaction_id: string;
  provider_reference_id?: string | null;
  amount: number; // in INR
  currency: string;
  reason: string;
  status: 'INITIATED' | 'COMPLETED' | 'FAILED';
  raw_response?: Record<string, unknown> | null;
  created_at?: Date;
  updated_at?: Date;
}

export type RefundCreationAttributes = Optional<
  RefundAttributes,
  'id' | 'return_id' | 'provider_reference_id' | 'currency' | 'status' | 'raw_response'
>;

export class Refund
  extends Model<RefundAttributes, RefundCreationAttributes>
  implements RefundAttributes
{
  declare public id: string;
  declare public order_id: string;
  declare public payment_id: string;
  declare public return_id: string | null;
  declare public refund_transaction_id: string;
  declare public provider_reference_id: string | null;
  declare public amount: number;
  declare public currency: string;
  declare public reason: string;
  declare public status: 'INITIATED' | 'COMPLETED' | 'FAILED';
  declare public raw_response: Record<string, unknown> | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Refund.init(
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
    payment_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    return_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    refund_transaction_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    provider_reference_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('INITIATED', 'COMPLETED', 'FAILED'),
      defaultValue: 'INITIATED',
      allowNull: false,
    },
    raw_response: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'refunds',
    indexes: [
      { unique: true, fields: ['refund_transaction_id'] },
      { fields: ['order_id'] },
      { fields: ['payment_id'] },
      { fields: ['return_id'] },
    ],
  }
);
