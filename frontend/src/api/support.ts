import { apiClient } from './client.js';

export interface SupportMessageItem {
  id: string;
  sender: string;
  senderRole: 'CUSTOMER' | 'AGENT';
  text: string;
  time: string;
  createdAt?: string;
}

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  customer: string;
  email: string;
  phone?: string;
  subject: string;
  priority: 'High' | 'Med' | 'Low';
  status: 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
  channel: 'CONCIERGE_CHAT' | 'WEB_INQUIRY' | 'CALLBACK';
  createdAt: string;
  updatedAt: string;
  date: string;
  lastMessage: string;
  messagesCount: number;
  unread: boolean;
  messages: SupportMessageItem[];
}

export interface CreateTicketPayload {
  customerName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  channel?: 'CONCIERGE_CHAT' | 'WEB_INQUIRY' | 'CALLBACK';
}

export async function fetchCustomerTickets(): Promise<SupportTicketItem[]> {
  const storedIds = localStorage.getItem('ithihasa_support_ticket_ids') || '';
  const query = storedIds ? `?ticketIds=${encodeURIComponent(storedIds)}` : '';
  return apiClient<SupportTicketItem[]>(`/support/tickets${query}`);
}

export async function fetchTicketById(ticketId: string): Promise<SupportTicketItem> {
  return apiClient<SupportTicketItem>(`/support/tickets/${ticketId}`);
}

export async function createSupportTicket(payload: CreateTicketPayload): Promise<SupportTicketItem> {
  const ticket = await apiClient<SupportTicketItem>('/support/tickets', {
    method: 'POST',
    body: JSON.stringify({
      customerName: payload.customerName || undefined,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject || 'Concierge Assistance',
      message: payload.message || undefined,
      priority: payload.priority || 'HIGH',
      channel: payload.channel || 'CONCIERGE_CHAT',
    }),
  });

  if (ticket?.id) {
    const existing = (localStorage.getItem('ithihasa_support_ticket_ids') || '')
      .split(',')
      .filter(Boolean);
    if (!existing.includes(ticket.id)) {
      existing.unshift(ticket.id);
      localStorage.setItem('ithihasa_support_ticket_ids', existing.join(','));
    }
  }

  return ticket;
}

export async function sendTicketMessage(ticketId: string, text: string): Promise<SupportMessageItem> {
  return apiClient<SupportMessageItem>(`/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// Backward compatibility helper for quick inquiry
export async function submitSupportInquiry(payload: {
  customer: string;
  email?: string;
  phone?: string;
  subject: string;
  message?: string;
  priority?: 'High' | 'Med' | 'Low';
  channel?: 'CONCIERGE_CHAT' | 'WEB_INQUIRY' | 'CALLBACK';
}) {
  return createSupportTicket({
    customerName: payload.customer,
    email: payload.email,
    phone: payload.phone,
    subject: payload.subject,
    message: payload.message || payload.subject,
    priority: payload.priority === 'High' ? 'HIGH' : payload.priority === 'Low' ? 'LOW' : 'MEDIUM',
    channel: payload.channel || 'CALLBACK',
  });
}
