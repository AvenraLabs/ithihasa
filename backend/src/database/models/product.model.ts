import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface ProductAttributes {
  id: string;
  name: string;
  slug: string;
  description: string;
  short_description?: string | null;
  category_id: string;
  base_price: number; // in INR
  compare_at_price?: number | null;
  currency: string;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  featured: boolean;
  metadata?: Record<string, unknown> | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ProductCreationAttributes = Optional<
  ProductAttributes,
  'id' | 'short_description' | 'compare_at_price' | 'currency' | 'status' | 'featured' | 'metadata'
>;

export class Product
  extends Model<ProductAttributes, ProductCreationAttributes>
  implements ProductAttributes
{
  declare public id: string;
  declare public name: string;
  declare public slug: string;
  declare public description: string;
  declare public short_description: string | null;
  declare public category_id: string;
  declare public base_price: number;
  declare public compare_at_price: number | null;
  declare public currency: string;
  declare public status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  declare public featured: boolean;
  declare public metadata: Record<string, unknown> | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    short_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    base_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    compare_at_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'ACTIVE', 'ARCHIVED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'products',
    indexes: [
      { unique: true, fields: ['slug'] },
      { fields: ['category_id'] },
      { fields: ['status'] },
      { fields: ['featured'] },
    ],
  }
);
