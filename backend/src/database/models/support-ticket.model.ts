import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export type TicketPriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type TicketStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketChannel = 'CONCIERGE_CHAT' | 'WEB_INQUIRY' | 'CALLBACK';

export interface SupportTicketAttributes {
  id: string;
  ticket_number: string;
  user_id?: string | null;
  customer_name: string;
  email?: string | null;
  phone?: string | null;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
  order_id?: string | null;
  channel: TicketChannel;
  created_at?: Date;
  updated_at?: Date;
}

export type SupportTicketCreationAttributes = Optional<
  SupportTicketAttributes,
  'id' | 'user_id' | 'email' | 'phone' | 'priority' | 'status' | 'order_id' | 'channel'
>;

export class SupportTicket
  extends Model<SupportTicketAttributes, SupportTicketCreationAttributes>
  implements SupportTicketAttributes
{
  declare public id: string;
  declare public ticket_number: string;
  declare public user_id: string | null;
  declare public customer_name: string;
  declare public email: string | null;
  declare public phone: string | null;
  declare public subject: string;
  declare public priority: TicketPriority;
  declare public status: TicketStatus;
  declare public order_id: string | null;
  declare public channel: TicketChannel;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

SupportTicket.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticket_number: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    customer_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    priority: {
      type: DataTypes.ENUM('HIGH', 'MEDIUM', 'LOW'),
      defaultValue: 'HIGH',
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('OPEN', 'PENDING', 'RESOLVED', 'CLOSED'),
      defaultValue: 'OPEN',
      allowNull: false,
    },
    order_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    channel: {
      type: DataTypes.ENUM('CONCIERGE_CHAT', 'WEB_INQUIRY', 'CALLBACK'),
      defaultValue: 'CONCIERGE_CHAT',
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'support_tickets',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['priority'] },
      { fields: ['ticket_number'], unique: true },
    ],
  }
);
