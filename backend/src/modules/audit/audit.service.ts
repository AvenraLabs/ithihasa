import { AuditLog } from '../../database/index.js';
import { logger } from '../../common/logger/index.js';

export interface RecordAuditLogParams {
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export class AuditService {
  public async log(params: RecordAuditLogParams): Promise<void> {
    try {
      await AuditLog.create({
        actor_id: params.actorId || null,
        actor_email: params.actorEmail || null,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId || null,
        before_state: params.beforeState || null,
        after_state: params.afterState || null,
        ip_address: params.ipAddress || null,
        user_agent: params.userAgent || null,
        request_id: params.requestId || null,
      });
    } catch (error) {
      logger.error({ err: error, action: params.action }, 'Failed to record audit log');
    }
  }

  public async getLogs(limit = 100) {
    return AuditLog.findAll({
      order: [['created_at', 'DESC']],
      limit,
    });
  }
}

export const auditService = new AuditService();
