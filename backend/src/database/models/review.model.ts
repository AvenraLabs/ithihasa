import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface ReviewAttributes {
  id: string;
  product_id: string;
  user_id: string;
  rating: number; // 1 to 5
  title?: string | null;
  comment: string;
  is_verified_purchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  created_at?: Date;
  updated_at?: Date;
}

export type ReviewCreationAttributes = Optional<
  ReviewAttributes,
  'id' | 'title' | 'is_verified_purchase' | 'status'
>;

export class Review
  extends Model<ReviewAttributes, ReviewCreationAttributes>
  implements ReviewAttributes
{
  declare public id: string;
  declare public product_id: string;
  declare public user_id: string;
  declare public rating: number;
  declare public title: string | null;
  declare public comment: string;
  declare public is_verified_purchase: boolean;
  declare public status: 'PENDING' | 'APPROVED' | 'REJECTED';

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Review.init(
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
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_verified_purchase: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    status: {
      type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
      defaultValue: 'APPROVED',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'reviews',
    indexes: [
      { fields: ['product_id'] },
      { fields: ['user_id'] },
      { fields: ['status'] },
    ],
  }
);
