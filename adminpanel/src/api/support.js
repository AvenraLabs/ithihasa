import { apiClient } from './client.js';

export async function fetchSupportMetrics() {
  return apiClient('/admin/support/metrics');
}

export async function fetchSupportTickets() {
  return apiClient('/admin/support/tickets');
}

export async function createSupportTicket(ticketData) {
  return apiClient('/admin/support/tickets', {
    method: 'POST',
    body: ticketData,
  });
}

export async function replySupportTicket(ticketId, message) {
  return apiClient(`/admin/support/tickets/${ticketId}/reply`, {
    method: 'POST',
    body: { message },
  });
}

export async function fetchChatSessions() {
  return apiClient('/admin/support/chat/sessions');
}

export async function sendChatMessage(sessionId, text, sender = 'concierge') {
  return apiClient(`/admin/support/chat/${sessionId}/messages`, {
    method: 'POST',
    body: { text, sender },
  });
}
