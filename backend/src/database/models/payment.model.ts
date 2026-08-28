import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface PaymentAttributes {
  id: string;
  order_id: string;
  provider: 'PHONEPE' | 'COD' | 'OTHER';
  merchant_transaction_id: string;
  provider_reference_id?: string | null;
  amount: number; // in INR
  currency: string;
  status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  raw_response?: Record<string, unknown> | null;
  created_at?: Date;
  updated_at?: Date;
}

export type PaymentCreationAttributes = Optional<
  PaymentAttributes,
  'id' | 'provider_reference_id' | 'currency' | 'status' | 'raw_response'
>;

export class Payment
  extends Model<PaymentAttributes, PaymentCreationAttributes>
  implements PaymentAttributes
{
  declare public id: string;
  declare public order_id: string;
  declare public provider: 'PHONEPE' | 'COD' | 'OTHER';
  declare public merchant_transaction_id: string;
  declare public provider_reference_id: string | null;
  declare public amount: number;
  declare public currency: string;
  declare public status: 'INITIATED' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  declare public raw_response: Record<string, unknown> | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Payment.init(
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
    provider: {
      type: DataTypes.ENUM('PHONEPE', 'COD', 'OTHER'),
      defaultValue: 'PHONEPE',
      allowNull: false,
    },
    merchant_transaction_id: {
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
    status: {
      type: DataTypes.ENUM('INITIATED', 'SUCCESS', 'FAILED', 'REFUNDED'),
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
    tableName: 'payments',
    indexes: [
      { unique: true, fields: ['merchant_transaction_id'] },
      { fields: ['order_id'] },
      { fields: ['status'] },
    ],
  }
);
