import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export type InventoryMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'RESERVATION'
  | 'RELEASE'
  | 'RETURN'
  | 'ADJUSTMENT'
  | 'RESTOCK'
  | 'DAMAGE';

export interface InventoryMovementAttributes {
  id: string;
  variant_id: string;
  quantity: number; // positive for addition, negative for reduction
  type: InventoryMovementType;
  actor?: string | null;
  reason?: string | null;
  reference_id?: string | null; // e.g. order_id, return_id
  created_at?: Date;
  updated_at?: Date;
}

export type InventoryMovementCreationAttributes = Optional<
  InventoryMovementAttributes,
  'id' | 'actor' | 'reason' | 'reference_id'
>;

export class InventoryMovement
  extends Model<InventoryMovementAttributes, InventoryMovementCreationAttributes>
  implements InventoryMovementAttributes
{
  declare public id: string;
  declare public variant_id: string;
  declare public quantity: number;
  declare public type: InventoryMovementType;
  declare public actor: string | null;
  declare public reason: string | null;
  declare public reference_id: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

InventoryMovement.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        'PURCHASE',
        'SALE',
        'RESERVATION',
        'RELEASE',
        'RETURN',
        'ADJUSTMENT',
        'RESTOCK',
        'DAMAGE'
      ),
      allowNull: false,
    },
    actor: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reason: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reference_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'inventory_movements',
    indexes: [
      { fields: ['variant_id'] },
      { fields: ['type'] },
      { fields: ['reference_id'] },
      { fields: ['created_at'] },
    ],
  }
);
