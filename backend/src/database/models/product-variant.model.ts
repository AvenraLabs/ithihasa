import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface ProductVariantAttributes {
  id: string;
  product_id: string;
  sku: string;
  size: string;
  color?: string | null;
  price: number; // in INR
  compare_at_price?: number | null;
  barcode?: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: Date;
  updated_at?: Date;
}

export type ProductVariantCreationAttributes = Optional<
  ProductVariantAttributes,
  'id' | 'color' | 'compare_at_price' | 'barcode' | 'status'
>;

export class ProductVariant
  extends Model<ProductVariantAttributes, ProductVariantCreationAttributes>
  implements ProductVariantAttributes
{
  declare public id: string;
  declare public product_id: string;
  declare public sku: string;
  declare public size: string;
  declare public color: string | null;
  declare public price: number;
  declare public compare_at_price: number | null;
  declare public barcode: string | null;
  declare public status: 'ACTIVE' | 'ARCHIVED';

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

ProductVariant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    compare_at_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'product_variants',
    indexes: [
      { unique: true, fields: ['sku'] },
      { fields: ['product_id'] },
      { fields: ['size'] },
    ],
  }
);
