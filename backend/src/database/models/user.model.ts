import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface UserAttributes {
  id: string;
  email?: string | null;
  name: string;
  password_hash?: string | null;
  phone?: string | null;
  phone_verified: boolean;
  role: 'CUSTOMER' | 'ADMIN';
  avatar_url?: string | null;
  google_id?: string | null;
  status: 'ACTIVE' | 'BLOCKED';
  created_at?: Date;
  updated_at?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'email' | 'password_hash' | 'phone' | 'phone_verified' | 'role' | 'avatar_url' | 'google_id' | 'status'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare public id: string;
  declare public email: string | null;
  declare public name: string;
  declare public password_hash: string | null;
  declare public phone: string | null;
  declare public phone_verified: boolean;
  declare public role: 'CUSTOMER' | 'ADMIN';
  declare public avatar_url: string | null;
  declare public google_id: string | null;
  declare public status: 'ACTIVE' | 'BLOCKED';

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    role: {
      type: DataTypes.ENUM('CUSTOMER', 'ADMIN'),
      defaultValue: 'CUSTOMER',
      allowNull: false,
    },
    avatar_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    google_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'BLOCKED'),
      defaultValue: 'ACTIVE',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'users',
    indexes: [{ unique: true, fields: ['email'] }, { fields: ['phone'] }],
  }
);
