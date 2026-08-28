import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface AddressAttributes {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default_shipping: boolean;
  is_default_billing: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type AddressCreationAttributes = Optional<
  AddressAttributes,
  'id' | 'line2' | 'country' | 'is_default_shipping' | 'is_default_billing'
>;

export class Address
  extends Model<AddressAttributes, AddressCreationAttributes>
  implements AddressAttributes
{
  declare public id: string;
  declare public user_id: string;
  declare public name: string;
  declare public phone: string;
  declare public line1: string;
  declare public line2: string | null;
  declare public city: string;
  declare public state: string;
  declare public postal_code: string;
  declare public country: string;
  declare public is_default_shipping: boolean;
  declare public is_default_billing: boolean;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

Address.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line1: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    line2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      defaultValue: 'India',
      allowNull: false,
    },
    is_default_shipping: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_default_billing: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'addresses',
    indexes: [{ fields: ['user_id'] }],
  }
);
