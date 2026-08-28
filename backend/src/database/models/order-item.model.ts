import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface OrderItemAttributes {
  id: string;
  order_id: string;
  product_id: string;
  variant_id: string;
  sku: string;
  product_name: string;
  variant_name: string; // e.g. "Size: M / Color: Black"
  unit_price: number;
  quantity: number;
  total: number;
  image_url?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type OrderItemCreationAttributes = Optional<OrderItemAttributes, 'id' | 'image_url'>;

export class OrderItem
  extends Model<OrderItemAttributes, OrderItemCreationAttributes>
  implements OrderItemAttributes
{
  declare public id: string;
  declare public order_id: string;
  declare public product_id: string;
  declare public variant_id: string;
  declare public sku: string;
  declare public product_name: string;
  declare public variant_name: string;
  declare public unit_price: number;
  declare public quantity: number;
  declare public total: number;
  declare public image_url: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

OrderItem.init(
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
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    variant_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    image_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'order_items',
    indexes: [
      { fields: ['order_id'] },
      { fields: ['product_id'] },
      { fields: ['variant_id'] },
    ],
  }
);
