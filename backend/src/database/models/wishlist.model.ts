import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface WishlistAttributes {
  id: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export type WishlistCreationAttributes = Optional<WishlistAttributes, 'id'>;

export class Wishlist
  extends Model<WishlistAttributes, WishlistCreationAttributes>
  implements WishlistAttributes
{
  declare public id: string;
  declare public user_id: string;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Wishlist.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'wishlists',
    indexes: [{ unique: true, fields: ['user_id'] }],
  }
);
