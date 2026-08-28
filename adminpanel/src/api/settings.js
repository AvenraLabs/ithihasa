import { apiClient } from './client.js';

export async function fetchSettings() {
  return apiClient('/admin/settings');
}

export async function updateSettings(settingsData) {
  return apiClient('/admin/settings', {
    method: 'PUT',
    body: settingsData,
  });
}

export async function fetchTeamMembers() {
  return apiClient('/admin/team');
}

export async function inviteTeamMember(memberData) {
  return apiClient('/admin/team', {
    method: 'POST',
    body: memberData,
  });
}

export async function removeTeamMember(id) {
  return apiClient(`/admin/team/${id}`, {
    method: 'DELETE',
  });
}
