import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface CartItemAttributes {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  created_at?: Date;
  updated_at?: Date;
}

export type CartItemCreationAttributes = Optional<CartItemAttributes, 'id'>;

export class CartItem
  extends Model<CartItemAttributes, CartItemCreationAttributes>
  implements CartItemAttributes
{
  declare public id: string;
  declare public cart_id: string;
  declare public variant_id: string;
  declare public quantity: number;
  declare public unit_price: number;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

CartItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    cart_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      allowNull: false,
      validate: { min: 1 },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'cart_items',
    indexes: [
      { fields: ['cart_id'] },
      { fields: ['variant_id'] },
      { unique: true, fields: ['cart_id', 'variant_id'] },
    ],
  }
);
