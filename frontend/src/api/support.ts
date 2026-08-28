import { apiClient } from './client.js';

export interface SupportTicketPayload {
  customer: string;
  email?: string;
  subject: string;
  message?: string;
  priority?: 'High' | 'Med' | 'Low';
}

export async function submitSupportInquiry(payload: SupportTicketPayload) {
  return apiClient('/admin/support/tickets', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function sendConciergeMessage(text: string) {
  return apiClient('/admin/support/chat/chat-1/messages', {
    method: 'POST',
    body: JSON.stringify({ text, sender: 'patron' }),
  });
}
