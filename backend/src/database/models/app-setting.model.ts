import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface AppSettingAttributes {
  key: string;
  value: object;
  updated_at?: Date;
}

export type AppSettingCreationAttributes = Optional<AppSettingAttributes, 'updated_at'>;

export class AppSetting
  extends Model<AppSettingAttributes, AppSettingCreationAttributes>
  implements AppSettingAttributes
{
  declare public key: string;
  declare public value: object;
  declare public readonly updated_at: Date;
}

AppSetting.init(
  {
    key: {
      type: DataTypes.STRING(100),
      primaryKey: true,
      allowNull: false,
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
  },
  {
    sequelize,
    tableName: 'app_settings',
    timestamps: true,
    createdAt: false,
    updatedAt: 'updated_at',
  }
);
