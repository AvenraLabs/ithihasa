import { apiClient } from './client.js';

export async function fetchNotifications() {
  return apiClient('/admin/notifications');
}

export async function markNotificationsRead() {
  return apiClient('/admin/notifications/mark-read', {
    method: 'PATCH',
  });
}
