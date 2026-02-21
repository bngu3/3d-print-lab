export type RequestType = 'class' | 'project' | 'personal';
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'completed';

export interface PrintRequest {
  id: number;
  student_name: string;
   email: string;
  requested_date: string;
  description: string;
  request_type: RequestType;
  priority: number;
  status: RequestStatus;
  file_name: string;
  file_path: string;
  created_at: string;
  admin_notes?: string;
}

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  class: 'Class-Related',
  project: 'Project-Based',
  personal: 'Personal',
};

export const STATUS_LABELS: Record<RequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
  completed: 'Completed',
};