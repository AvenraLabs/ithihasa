import { apiClient } from './client.js';

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface AddressInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export function normalizeAddress(a: any): Address {
  return {
    id: a.id,
    userId: a.userId ?? a.user_id,
    name: a.name ?? a.recipient_name ?? '',
    phone: a.phone ?? '',
    line1: a.line1 ?? '',
    line2: a.line2 ?? null,
    city: a.city ?? '',
    state: a.state ?? '',
    postalCode: a.postalCode ?? a.postal_code ?? '',
    country: a.country ?? 'India',
    isDefaultShipping: Boolean(a.isDefaultShipping ?? a.is_default_shipping ?? a.is_default),
    isDefaultBilling: Boolean(a.isDefaultBilling ?? a.is_default_billing),
  };
}

export async function fetchAddresses(): Promise<Address[]> {
  const rawList = await apiClient<any[]>('/account/addresses');
  return rawList.map(normalizeAddress);
}

export async function fetchAddressById(id: string): Promise<Address> {
  const raw = await apiClient<any>(`/account/addresses/${id}`);
  return normalizeAddress(raw);
}

export async function createAddress(data: AddressInput): Promise<Address> {
  const payload = {
    name: data.name,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2,
    city: data.city,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country || 'India',
    isDefaultShipping: data.isDefaultShipping ?? false,
    isDefaultBilling: data.isDefaultBilling ?? false,
  };
  const raw = await apiClient<any>('/account/addresses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return normalizeAddress(raw);
}

export async function updateAddress(id: string, data: Partial<AddressInput>): Promise<Address> {
  const raw = await apiClient<any>(`/account/addresses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return normalizeAddress(raw);
}

export async function deleteAddress(id: string): Promise<{ success: boolean; message: string }> {
  return apiClient<{ success: boolean; message: string }>(`/account/addresses/${id}`, {
    method: 'DELETE',
  });
}
