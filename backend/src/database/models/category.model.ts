import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface CategoryAttributes {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  parent_id?: string | null;
  image_url?: string | null;
  sort_order: number;
  status: 'ACTIVE' | 'ARCHIVED';
  created_at?: Date;
  updated_at?: Date;
}

export type CategoryCreationAttributes = Optional<
  CategoryAttributes,
  'id' | 'description' | 'parent_id' | 'image_url' | 'sort_order' | 'status'
>;

export class Category
  extends Model<CategoryAttributes, CategoryCreationAttributes>
  implements CategoryAttributes
{
  declare public id: string;
  declare public name: string;
  declare public slug: string;
  declare public description: string | null;
  declare public parent_id: string | null;
  declare public image_url: string | null;
  declare public sort_order: number;
  declare public status: 'ACTIVE' | 'ARCHIVED';

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Category.init(
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
      allowNull: true,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'ARCHIVED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'categories',
    indexes: [{ unique: true, fields: ['slug'] }, { fields: ['parent_id'] }],
  }
);
