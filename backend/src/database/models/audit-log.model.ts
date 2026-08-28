import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../config/database.js';

export interface AuditLogAttributes {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

export type AuditLogCreationAttributes = Optional<
  AuditLogAttributes,
  | 'id'
  | 'actor_id'
  | 'actor_email'
  | 'entity_id'
  | 'before_state'
  | 'after_state'
  | 'ip_address'
  | 'user_agent'
  | 'request_id'
>;

export class AuditLog
  extends Model<AuditLogAttributes, AuditLogCreationAttributes>
  implements AuditLogAttributes
{
  declare public id: string;
  declare public actor_id: string | null;
  declare public actor_email: string | null;
  declare public action: string;
  declare public entity_type: string;
  declare public entity_id: string | null;
  declare public before_state: Record<string, unknown> | null;
  declare public after_state: Record<string, unknown> | null;
  declare public ip_address: string | null;
  declare public user_agent: string | null;
  declare public request_id: string | null;

  declare public readonly created_at: Date;
  declare public readonly updated_at: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    actor_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    actor_email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    before_state: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    after_state: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_agent: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    request_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    indexes: [
      { fields: ['actor_id'] },
      { fields: ['action'] },
      { fields: ['entity_type', 'entity_id'] },
      { fields: ['created_at'] },
    ],
  }
);
