import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface UserOtpAttributes {
  id: string;
  user_id: string;
  phone: string;
  otp_hash: string;
  purpose: 'PHONE_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET';
  attempts: number;
  expires_at: Date;
  verified_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
}

export type UserOtpCreationAttributes = Optional<UserOtpAttributes, 'id' | 'attempts' | 'verified_at'>;

export class UserOtp
  extends Model<UserOtpAttributes, UserOtpCreationAttributes>
  implements UserOtpAttributes
{
  declare public id: string;
  declare public user_id: string;
  declare public phone: string;
  declare public otp_hash: string;
  declare public purpose: 'PHONE_VERIFICATION' | 'LOGIN' | 'PASSWORD_RESET';
  declare public attempts: number;
  declare public expires_at: Date;
  declare public verified_at: Date | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

UserOtp.init(
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
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otp_hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM('PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET'),
      defaultValue: 'PHONE_VERIFICATION',
      allowNull: false,
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_otps',
    indexes: [{ fields: ['user_id', 'phone'] }, { fields: ['expires_at'] }],
  }
);
