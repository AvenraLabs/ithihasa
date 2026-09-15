import { Request, Response, NextFunction } from 'express';
import { supportService } from './support.service.js';
import { sendSuccess } from '../../common/utils/response.js';
import { User } from '../../database/index.js';

export class SupportController {
  // Customer: List patron's tickets
  public async listCustomerTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const email = (req.query.email as string) || req.user?.email || (req as any).user?.email;
      const ticketIdsParam = req.query.ticketIds as string;
      const ticketIds = ticketIdsParam ? ticketIdsParam.split(',').filter(Boolean) : undefined;
      const tickets = await supportService.getTickets({
        userId,
        email,
        ticketIds,
        isCustomerView: true,
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
      });
      sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }

  // Customer: Create ticket / start concierge conversation
  public async createTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      const ticket = await supportService.createTicket(req.body, userId);
      sendSuccess(res, ticket, 201);
    } catch (error) {
      next(error);
    }
  }

  // Customer & Admin: Get ticket details by ID or #TK-xxxx
  public async getTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ticket = await supportService.getTicketById(req.params.id);
      sendSuccess(res, ticket, 200);
    } catch (error) {
      next(error);
    }
  }

  // Customer: Send message in ticket thread
  public async sendCustomerMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId || (req as any).user?.id;
      let senderName = req.body.senderName;
      if (!senderName && userId) {
        const u = await User.findByPk(userId);
        if (u) senderName = u.name || u.phone || u.email?.split('@')[0];
      }
      const message = await supportService.addMessage(
        req.params.id,
        req.body.text || req.body.message,
        'CUSTOMER',
        senderName || 'Patron'
      );
      sendSuccess(res, message, 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Get Support Metrics
  public async getMetrics(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const metrics = await supportService.getMetrics();
      sendSuccess(res, metrics, 200);
    } catch (error) {
      next(error);
    }
  }

  // Admin: List all tickets
  public async listAdminTickets(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tickets = await supportService.getTickets({
        status: req.query.status as string,
        priority: req.query.priority as string,
        search: req.query.search as string,
      });
      sendSuccess(res, tickets, 200);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Reply to ticket
  public async replyTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const text = req.body.text || req.body.message;
      const senderName = (req as any).user?.name || 'Atelier Concierge';
      const message = await supportService.addMessage(
        req.params.id,
        text,
        'AGENT',
        senderName
      );
      sendSuccess(res, message, 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Update ticket status (e.g. RESOLVED, CLOSED, OPEN)
  public async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const updated = await supportService.updateTicketStatus(req.params.id, status);
      sendSuccess(res, updated, 200);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Legacy & Direct Chat sessions mapping
  public async getChatSessions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tickets = await supportService.getTickets({});
      const sessions = tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        patronName: t.customer,
        email: t.email,
        phone: t.phone,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        avatar: null,
        lastMessage: t.lastMessage,
        time: t.date,
        unread: t.unread,
        messages: t.messages.map((m: any) => ({
          id: m.id,
          sender: m.senderRole === 'AGENT' ? 'Atelier Concierge' : t.customer,
          senderRole: m.senderRole, // 'AGENT' | 'CUSTOMER'
          text: m.text,
          time: m.time,
          createdAt: m.createdAt,
        })),
      }));
      sendSuccess(res, sessions, 200);
    } catch (error) {
      next(error);
    }
  }

  // Admin: Direct Chat send message
  public async sendChatMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const text = req.body.text || req.body.message;
      const senderRole = req.body.sender === 'patron' ? 'CUSTOMER' : 'AGENT';
      const senderName = senderRole === 'AGENT' ? 'Atelier Concierge' : 'Atelier Patron';
      const message = await supportService.addMessage(
        req.params.sessionId,
        text,
        senderRole,
        senderName
      );
      sendSuccess(res, message, 201);
    } catch (error) {
      next(error);
    }
  }
}

export const supportController = new SupportController();
