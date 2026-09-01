import { apiClient } from './client.js';

export async function fetchCategories() {
  return apiClient('/admin/categories');
}

export async function createCategory(categoryData) {
  return apiClient('/admin/categories', {
    method: 'POST',
    body: categoryData,
  });
}

export async function updateCategory(id, categoryData) {
  return apiClient(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: categoryData,
  });
}

export async function deleteCategory(id) {
  return apiClient(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}
