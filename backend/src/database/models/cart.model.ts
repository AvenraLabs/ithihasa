import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface CartAttributes {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED';
  created_at?: Date;
  updated_at?: Date;
}

export type CartCreationAttributes = Optional<CartAttributes, 'id' | 'user_id' | 'session_id' | 'status'>;

export class Cart extends Model<CartAttributes, CartCreationAttributes> implements CartAttributes {
  declare public id: string;
  declare public user_id: string | null;
  declare public session_id: string | null;
  declare public status: 'ACTIVE' | 'CONVERTED' | 'ABANDONED';

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Cart.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    session_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'CONVERTED', 'ABANDONED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'carts',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['session_id'] },
      { fields: ['status'] },
    ],
  }
);
