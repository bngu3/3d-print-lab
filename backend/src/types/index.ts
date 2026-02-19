export type RequestType = 'class' | 'project' | 'personal';
export type RequestStatus = 'pending' | 'approved' | 'denied' | 'completed';

export interface PrintRequest {
  id: number;
  student_name: string;
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

export interface CreatePrintRequestBody {
  student_name: string;
  requested_date: string;
  description: string;
  request_type: RequestType;
}