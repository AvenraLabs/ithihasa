import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface InventoryAttributes {
  id: string;
  variant_id: string;
  on_hand: number;
  reserved: number;
  available: number;
  low_stock_threshold: number;
  created_at?: Date;
  updated_at?: Date;
}

export type InventoryCreationAttributes = Optional<
  InventoryAttributes,
  'id' | 'reserved' | 'available' | 'low_stock_threshold'
>;

export class Inventory
  extends Model<InventoryAttributes, InventoryCreationAttributes>
  implements InventoryAttributes
{
  declare public id: string;
  declare public variant_id: string;
  declare public on_hand: number;
  declare public reserved: number;
  declare public available: number;
  declare public low_stock_threshold: number;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Inventory.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    on_hand: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: { min: 0 },
    },
    reserved: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: { min: 0 },
    },
    available: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
      validate: { min: 0 },
    },
    low_stock_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'inventory',
    indexes: [{ unique: true, fields: ['variant_id'] }],
    hooks: {
      beforeSave: (instance: Inventory) => {
        instance.available = Math.max(0, instance.on_hand - instance.reserved);
      },
    },
  }
);
