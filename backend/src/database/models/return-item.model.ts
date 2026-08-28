import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface ReturnItemAttributes {
  id: string;
  return_id: string;
  order_item_id: string;
  quantity: number;
  reason?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type ReturnItemCreationAttributes = Optional<ReturnItemAttributes, 'id' | 'reason'>;

export class ReturnItem
  extends Model<ReturnItemAttributes, ReturnItemCreationAttributes>
  implements ReturnItemAttributes
{
  declare public id: string;
  declare public return_id: string;
  declare public order_item_id: string;
  declare public quantity: number;
  declare public reason: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

ReturnItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    return_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    order_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'return_items',
    indexes: [
      { fields: ['return_id'] },
      { fields: ['order_item_id'] },
    ],
  }
);
