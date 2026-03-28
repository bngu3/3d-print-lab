import type { PrintRequest } from '../types';

const BASE_URL = 'https://3d-print-lab-production.up.railway.app/api';

export async function submitRequest(formData: FormData): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to submit request.');
  return data.request;
}

export async function getRequestByCode(code: string): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests/${code.toUpperCase()}`);
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

export async function getArchivedRequests(): Promise<PrintRequest[]> {
  const res = await fetch(`${BASE_URL}/requests/archived`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch archived requests.');
  return data;
}

export async function updateRequestStatus(
  code: string,
  status: string,
  admin_notes?: string
): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests/${code}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, admin_notes }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update status.');
  return data.request;
}

export async function archiveRequest(code: string): Promise<PrintRequest> {
  const res = await fetch(`${BASE_URL}/requests/${code}/archive`, {
    method: 'PATCH',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to archive request.');
  return data.request;
}

export function getDownloadUrl(code: string): string {
  return `${BASE_URL}/requests/${code}/download`;
}