import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'ITEM_RECEIVED'
  | 'REFUND_ISSUED'
  | 'CANCELLED';

export interface ReturnAttributes {
  id: string;
  order_id: string;
  user_id: string;
  status: ReturnStatus;
  reason: string;
  customer_comments?: string | null;
  admin_notes?: string | null;
  refund_amount: number;
  created_at?: Date;
  updated_at?: Date;
}

export type ReturnCreationAttributes = Optional<
  ReturnAttributes,
  'id' | 'status' | 'customer_comments' | 'admin_notes' | 'refund_amount'
>;

export class Return
  extends Model<ReturnAttributes, ReturnCreationAttributes>
  implements ReturnAttributes
{
  declare public id: string;
  declare public order_id: string;
  declare public user_id: string;
  declare public status: ReturnStatus;
  declare public reason: string;
  declare public customer_comments: string | null;
  declare public admin_notes: string | null;
  declare public refund_amount: number;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Return.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        'REQUESTED',
        'APPROVED',
        'REJECTED',
        'ITEM_RECEIVED',
        'REFUND_ISSUED',
        'CANCELLED'
      ),
      defaultValue: 'REQUESTED',
      allowNull: false,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customer_comments: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    admin_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refund_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'returns',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  }
);
