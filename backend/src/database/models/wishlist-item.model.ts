import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface WishlistItemAttributes {
  id: string;
  wishlist_id: string;
  product_id: string;
  variant_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type WishlistItemCreationAttributes = Optional<WishlistItemAttributes, 'id' | 'variant_id'>;

export class WishlistItem
  extends Model<WishlistItemAttributes, WishlistItemCreationAttributes>
  implements WishlistItemAttributes
{
  declare public id: string;
  declare public wishlist_id: string;
  declare public product_id: string;
  declare public variant_id: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

WishlistItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    wishlist_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'wishlist_items',
    indexes: [
      { fields: ['wishlist_id'] },
      { fields: ['product_id'] },
      { unique: true, fields: ['wishlist_id', 'product_id', 'variant_id'] },
    ],
  }
);
