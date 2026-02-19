import type{ PrintRequest } from '../types';

const BASE_URL = 'http://localhost:3001/api';

export async function submitRequest(formData: FormData): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit request.');
  return data.request;
}

export async function getRequestById(id: string): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request not found.');
  return data;
}

export async function getAllRequests(): Promise<PrintRequest[]> {
  const res = await fetch(`${BASE_URL}/requests`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch requests.');
  return data;
}

export async function updateRequestStatus(
  id: number,
  status: string,
  admin_notes?: string
): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update status.');
  return data.request;
}

export function getDownloadUrl(id: number): string {
  return `${BASE_URL}/requests/${id}/download`;
}