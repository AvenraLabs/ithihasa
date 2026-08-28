import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface ProductImageAttributes {
  id: string;
  product_id: string;
  variant_id?: string | null;
  url: string;
  alt_text?: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type ProductImageCreationAttributes = Optional<
  ProductImageAttributes,
  'id' | 'variant_id' | 'alt_text' | 'sort_order' | 'is_primary'
>;

export class ProductImage
  extends Model<ProductImageAttributes, ProductImageCreationAttributes>
  implements ProductImageAttributes
{
  declare public id: string;
  declare public product_id: string;
  declare public variant_id: string | null;
  declare public url: string;
  declare public alt_text: string | null;
  declare public sort_order: number;
  declare public is_primary: boolean;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

ProductImage.init(
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
    variant_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    url: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    alt_text: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'product_images',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['variant_id'] },
      { fields: ['sort_order'] },
    ],
  }
);
