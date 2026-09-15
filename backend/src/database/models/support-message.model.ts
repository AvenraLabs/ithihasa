import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export type MessageSenderRole = 'CUSTOMER' | 'AGENT';

export interface SupportMessageAttributes {
  id: string;
  ticket_id: string;
  sender_role: MessageSenderRole;
  sender_name: string;
  message_text: string;
  is_read: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export type SupportMessageCreationAttributes = Optional<
  SupportMessageAttributes,
  'id' | 'is_read'
>;

export class SupportMessage
  extends Model<SupportMessageAttributes, SupportMessageCreationAttributes>
  implements SupportMessageAttributes
{
  declare public id: string;
  declare public ticket_id: string;
  declare public sender_role: MessageSenderRole;
  declare public sender_name: string;
  declare public message_text: string;
  declare public is_read: boolean;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

SupportMessage.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticket_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    sender_role: {
      type: DataTypes.ENUM('CUSTOMER', 'AGENT'),
      allowNull: false,
    },
    sender_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'support_messages',
    indexes: [
      { fields: ['ticket_id'] },
      { fields: ['sender_role'] },
      { fields: ['created_at'] },
    ],
  }
);
