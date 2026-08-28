import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface CouponAttributes {
  id: string;
  code: string;
  description?: string | null;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  min_order_value: number;
  max_discount?: number | null;
  start_at?: Date | null;
  expires_at?: Date | null;
  usage_limit?: number | null;
  per_user_limit: number;
  times_used: number;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: Date;
  updated_at?: Date;
}

export type CouponCreationAttributes = Optional<
  CouponAttributes,
  | 'id'
  | 'description'
  | 'min_order_value'
  | 'max_discount'
  | 'start_at'
  | 'expires_at'
  | 'usage_limit'
  | 'per_user_limit'
  | 'times_used'
  | 'status'
>;

export class Coupon
  extends Model<CouponAttributes, CouponCreationAttributes>
  implements CouponAttributes
{
  declare public id: string;
  declare public code: string;
  declare public description: string | null;
  declare public type: 'PERCENTAGE' | 'FIXED';
  declare public value: number;
  declare public min_order_value: number;
  declare public max_discount: number | null;
  declare public start_at: Date | null;
  declare public expires_at: Date | null;
  declare public usage_limit: number | null;
  declare public per_user_limit: number;
  declare public times_used: number;
  declare public status: 'ACTIVE' | 'INACTIVE';

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Coupon.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      set(value: string) {
        this.setDataValue('code', value.toUpperCase().trim());
      },
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM('PERCENTAGE', 'FIXED'),
      allowNull: false,
    },
    value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    min_order_value: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
    max_discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    start_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usage_limit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    per_user_limit: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
    },
    times_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'coupons',
    indexes: [{ unique: true, fields: ['code'] }, { fields: ['status'] }],
  }
);
