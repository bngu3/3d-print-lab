import { useState } from 'react';
import { getRequestByCode } from '../api/requests';
import type { PrintRequest } from '../types';
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  denied: '#ef4444',
  completed: '#6366f1',
};

export default function StatusPage() {
  const [requestCode, setRequestCode] = useState('');
  const [studentName, setStudentName] = useState('');
  const [request, setRequest] = useState<PrintRequest | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setError('');
    setRequest(null);
    if (!requestCode.trim() || !studentName.trim()) {
      setError('Please enter both your Request Code and Student Name.');
      return;
    }
    setLoading(true);
    try {
      const result = await getRequestByCode(requestCode.trim());
      if (result.student_name.toLowerCase() !== studentName.trim().toLowerCase()) {
        setError('Request not found. Please check your Request Code and Name.');
        return;
      }
      setRequest(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Check Request Status</h1>
        <p>Enter your Request Code and name to see your print job status.</p>
      </div>

      <div className="print-form">
        <div className="form-group">
          <label>Request Code</label>
          <input
            type="text"
            placeholder="Enter your Request Code (e.g. A3K9X)"
            value={requestCode}
            onChange={(e) => setRequestCode(e.target.value.toUpperCase())}
            maxLength={5}
          />
        </div>
        <div className="form-group">
          <label>Student Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
          />
        </div>
        <button className="btn-primary" onClick={handleLookup} disabled={loading}>
          {loading ? 'Looking up...' : 'Check Status'}
        </button>
      </div>

      {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}

      {request && (
        <div className="status-card" style={{ marginTop: '1.5rem' }}>
          <div className="status-badge" style={{ backgroundColor: STATUS_COLORS[request.status] }}>
            {STATUS_LABELS[request.status]}
          </div>
          <h2>Request {request.request_code}</h2>
          <div className="info-block">
            <p><span>Student:</span> {request.student_name}</p>
            <p><span>Type:</span> {REQUEST_TYPE_LABELS[request.request_type]}</p>
            <p><span>Print Size:</span> {request.print_size}</p>
            <p><span>Requested Date:</span> {request.requested_date}</p>
            <p><span>Submitted:</span> {new Date(request.created_at).toLocaleString()}</p>
            <p><span>File:</span> {request.file_name}</p>
            <p><span>Description:</span> {request.description}</p>
          </div>
          {request.admin_notes && (
            <div className="admin-notes">
              <strong>Note from Lab Assistant:</strong>
              <p>{request.admin_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}