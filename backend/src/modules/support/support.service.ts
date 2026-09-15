import { Op } from 'sequelize';
import {
  SupportTicket,
  SupportMessage,
  User,
  Order,
} from '../../database/index.js';
import type {
  TicketPriority,
  TicketStatus,
  TicketChannel,
} from '../../database/models/support-ticket.model.js';
import { NotFoundError, ValidationError } from '../../common/errors/index.js';
import {
  broadcastNewMessage,
  broadcastTicketStatus,
  broadcastNewTicket,
} from './support.socket.js';

export class SupportService {
  /**
   * Generates unique ticket number, e.g., "#TK-4820"
   */
  private generateTicketNumber(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `#TK-${random}`;
  }

  /**
   * Returns live dashboard metrics for admin Support View
   */
  public async getMetrics() {
    const openTicketsCount = await SupportTicket.count({
      where: { status: { [Op.in]: ['OPEN', 'PENDING'] } },
    });

    const urgentEscalations = await SupportTicket.count({
      where: {
        priority: 'HIGH',
        status: { [Op.in]: ['OPEN', 'PENDING'] },
      },
    });

    const totalTickets = await SupportTicket.count();

    const recentTickets = await SupportTicket.findAll({
      order: [['updated_at', 'DESC']],
      limit: 10,
      include: [
        {
          model: SupportMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
        },
      ],
    });

    // Calculate actual average response time from ticket creation to first agent response
    const repliedTickets = await SupportTicket.findAll({
      attributes: ['id', 'created_at'],
      include: [
        {
          model: SupportMessage,
          as: 'messages',
          attributes: ['id', 'sender_role', 'created_at'],
          where: { sender_role: 'AGENT' },
          required: true,
        },
      ],
      limit: 100,
    });

    let avgResponseHours = 0;
    if (repliedTickets.length > 0) {
      let totalDiffMs = 0;
      for (const ticket of repliedTickets) {
        const agentMessages = (ticket as any).messages || [];
        if (agentMessages.length > 0) {
          const earliestAgentTime = Math.min(
            ...agentMessages.map((m: any) => new Date(m.created_at).getTime())
          );
          const ticketCreatedTime = new Date(ticket.created_at).getTime();
          totalDiffMs += Math.max(0, earliestAgentTime - ticketCreatedTime);
        }
      }
      const totalHours = totalDiffMs / (1000 * 60 * 60);
      avgResponseHours = Number((totalHours / repliedTickets.length).toFixed(1));
    }

    return {
      openTickets: openTicketsCount,
      avgResponseHours,
      urgentEscalations,
      totalTickets,
      recentTickets: recentTickets.map((t) => this.formatTicketSummary(t)),
    };
  }

  /**
   * Lists tickets with optional filters
   */
  public async getTickets(filters: {
    status?: string;
    priority?: string;
    search?: string;
    userId?: string;
    email?: string;
    ticketIds?: string[];
    isCustomerView?: boolean;
  }) {
    const where: any = {};

    if (filters.status && filters.status !== 'ALL') {
      where.status = filters.status.toUpperCase();
    }

    if (filters.priority && filters.priority !== 'ALL') {
      where.priority = filters.priority.toUpperCase();
    }

    if (filters.userId) {
      if (filters.email) {
        where[Op.or] = [{ user_id: filters.userId }, { email: filters.email.toLowerCase() }];
      } else {
        where.user_id = filters.userId;
      }
    } else if (filters.email) {
      where.email = filters.email.toLowerCase();
    } else if (filters.ticketIds && filters.ticketIds.length > 0) {
      where.id = { [Op.in]: filters.ticketIds };
    } else if (filters.isCustomerView) {
      // Unauthenticated guest with no created ticket IDs yet: return empty list
      return [];
    }

    if (filters.search) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      where[Op.or] = [
        { ticket_number: { [Op.iLike]: q } },
        { customer_name: { [Op.iLike]: q } },
        { subject: { [Op.iLike]: q } },
        { email: { [Op.iLike]: q } },
      ];
    }

    const tickets = await SupportTicket.findAll({
      where,
      order: [['updated_at', 'DESC']],
      include: [
        {
          model: SupportMessage,
          as: 'messages',
          order: [['created_at', 'ASC']],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
          required: false,
        },
      ],
    });

    return tickets.map((t) => this.formatTicketSummary(t));
  }

  /**
   * Retrieves single ticket by UUID or #TK-xxxx number with full message timeline
   */
  public async getTicketById(ticketIdOrNumber: string, userId?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      ticketIdOrNumber
    );

    const where: any = isUuid
      ? { id: ticketIdOrNumber }
      : { ticket_number: ticketIdOrNumber.toUpperCase().trim() };

    if (userId) {
      where[Op.or] = [{ user_id: userId }, { user_id: null }];
    }

    const ticket = await SupportTicket.findOne({
      where,
      include: [
        {
          model: SupportMessage,
          as: 'messages',
          order: [['created_at', 'ASC']],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'role'],
        },
      ],
    });

    if (!ticket) throw new NotFoundError('Support Ticket');
    return this.formatTicketDetail(ticket);
  }

  /**
   * Creates a new ticket without requiring or auto-sending any dummy messages
   */
  public async createTicket(
    data: {
      customerName?: string;
      email?: string;
      phone?: string;
      subject?: string;
      message?: string;
      priority?: TicketPriority;
      channel?: TicketChannel;
      orderId?: string;
    },
    userId?: string
  ) {
    let resolvedName = data.customerName;
    let resolvedEmail = data.email;

    if (userId) {
      const patron = await User.findByPk(userId);
      if (patron) {
        resolvedName = patron.name || resolvedName || patron.phone || patron.email?.split('@')[0] || 'Patron';
        resolvedEmail = patron.email || resolvedEmail;
        if (!data.phone && patron.phone) {
          data.phone = patron.phone;
        }
      }
    }

    const ticket = await SupportTicket.create({
      ticket_number: this.generateTicketNumber(),
      user_id: userId || null,
      customer_name: (resolvedName || data.phone || data.email?.split('@')[0] || 'Patron').trim(),
      email: resolvedEmail ? resolvedEmail.toLowerCase().trim() : (data.email ? data.email.toLowerCase().trim() : null),
      phone: data.phone ? data.phone.trim() : null,
      subject: (data.subject || 'Concierge Assistance').trim(),
      priority: data.priority || 'HIGH',
      status: 'OPEN',
      channel: data.channel || 'CONCIERGE_CHAT',
      order_id: data.orderId || null,
    });

    // Only create a message if explicitly provided by the user (no auto-generated messages)
    if (data.message && data.message.trim()) {
      await SupportMessage.create({
        ticket_id: ticket.id,
        sender_role: 'CUSTOMER',
        sender_name: ticket.customer_name,
        message_text: data.message.trim(),
        is_read: false,
      });
    }

    // Return complete ticket
    const fullTicket = await this.getTicketById(ticket.id);
    broadcastNewTicket(fullTicket);
    return fullTicket;
  }

  /**
   * Appends a message to a ticket conversation
   */
  public async addMessage(
    ticketIdOrNumber: string,
    text: string,
    senderRole: 'CUSTOMER' | 'AGENT',
    senderName?: string
  ) {
    if (!text || !text.trim()) {
      throw new ValidationError('Message content cannot be empty.');
    }

    const ticket = await this.findTicket(ticketIdOrNumber);

    const resolvedSenderName =
      senderName || (senderRole === 'AGENT' ? 'Atelier Concierge' : ticket.customer_name);

    const message = await SupportMessage.create({
      ticket_id: ticket.id,
      sender_role: senderRole,
      sender_name: resolvedSenderName,
      message_text: text.trim(),
      is_read: false,
    });

    // Update ticket state & timestamp
    const updates: any = { updated_at: new Date() };
    if (senderRole === 'AGENT' && ticket.status === 'OPEN') {
      updates.status = 'PENDING';
    } else if (senderRole === 'CUSTOMER' && ticket.status === 'PENDING') {
      updates.status = 'OPEN';
    }

    await ticket.update(updates);

    const result = {
      id: message.id,
      ticketId: ticket.id,
      sender: senderRole === 'AGENT' ? 'concierge' : 'user',
      senderRole: message.sender_role,
      senderName: message.sender_name,
      text: message.message_text,
      time: 'Just now',
      createdAt: message.created_at,
    };

    // Broadcast in real-time over WebSocket
    broadcastNewMessage(ticket.id, result);

    return result;
  }

  /**
   * Updates ticket status (e.g. admin resolves or closes ticket)
   */
  public async updateTicketStatus(ticketIdOrNumber: string, status: TicketStatus) {
    const ticket = await this.findTicket(ticketIdOrNumber);
    ticket.status = status;
    await ticket.save();

    // Append system message in the thread
    if (status === 'RESOLVED') {
      await SupportMessage.create({
        ticket_id: ticket.id,
        sender_role: 'AGENT',
        sender_name: 'Atelier Concierge Desk',
        message_text:
          'This conversation has been marked as resolved by the atelier concierge. If you have further inquiries, feel free to submit a new inquiry.',
        is_read: true,
      });
    }

    const updatedTicket = await this.getTicketById(ticket.id);
    broadcastTicketStatus(ticket.id, status);
    return updatedTicket;
  }

  /**
   * Helper: formats ticket summary for lists
   */
  private formatTicketSummary(ticket: any) {
    const messages = ticket.messages || [];
    const lastMsg = messages[messages.length - 1];
    const user = ticket.user;

    // Resolve the most meaningful display name: stored customer_name (unless it's the
    // generic fallback "Patron"), or the linked user's real name/phone/email prefix
    const resolvedName =
      (ticket.customer_name && ticket.customer_name !== 'Patron')
        ? ticket.customer_name
        : (user?.name || user?.phone || user?.email?.split('@')[0] || ticket.customer_name || 'Patron');

    return {
      id: ticket.id,
      ticketNumber: ticket.ticket_number,
      customer: resolvedName,
      email: ticket.email || user?.email || null,
      phone: ticket.phone || user?.phone || null,
      subject: ticket.subject,
      priority: ticket.priority === 'HIGH' ? 'High' : ticket.priority === 'LOW' ? 'Low' : 'Med',
      status: ticket.status,
      channel: ticket.channel,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at,
      date: this.formatRelativeTime(ticket.updated_at || ticket.created_at),
      lastMessage: lastMsg ? lastMsg.message_text : ticket.subject,
      messagesCount: messages.length,
      unread: messages.some((m: any) => !m.is_read && m.sender_role === 'CUSTOMER'),
      messages: messages.map((m: any) => ({
        id: m.id,
        sender: m.sender_role === 'AGENT' ? 'Atelier Concierge' : m.sender_name,
        senderRole: m.sender_role,
        text: m.message_text,
        time: this.formatRelativeTime(m.created_at),
        createdAt: m.created_at,
      })),
    };
  }

  /**
   * Helper: formats ticket detail with complete thread
   */
  private formatTicketDetail(ticket: any) {
    const summary = this.formatTicketSummary(ticket);
    return {
      ...summary,
      user: ticket.user
        ? {
            id: ticket.user.id,
            name: ticket.user.name,
            email: ticket.user.email,
            phone: ticket.user.phone,
          }
        : null,
    };
  }

  private async findTicket(ticketIdOrNumber: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      ticketIdOrNumber
    );

    const ticket = await SupportTicket.findOne({
      where: isUuid
        ? { id: ticketIdOrNumber }
        : { ticket_number: ticketIdOrNumber.toUpperCase().trim() },
    });

    if (!ticket) throw new NotFoundError('Support Ticket');
    return ticket;
  }

  private formatRelativeTime(date: Date | string): string {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  }
}

export const supportService = new SupportService();
