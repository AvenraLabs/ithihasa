import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface CouponRedemptionAttributes {
  id: string;
  coupon_id: string;
  user_id: string;
  order_id: string;
  discount_applied: number;
  created_at?: Date;
  updated_at?: Date;
}

export type CouponRedemptionCreationAttributes = Optional<CouponRedemptionAttributes, 'id'>;

export class CouponRedemption
  extends Model<CouponRedemptionAttributes, CouponRedemptionCreationAttributes>
  implements CouponRedemptionAttributes
{
  declare public id: string;
  declare public coupon_id: string;
  declare public user_id: string;
  declare public order_id: string;
  declare public discount_applied: number;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

CouponRedemption.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    discount_applied: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'coupon_redemptions',
    indexes: [
      { fields: ['coupon_id', 'user_id'] },
      { fields: ['order_id'] },
    ],
  }
);
