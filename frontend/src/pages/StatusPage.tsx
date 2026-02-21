import { useState } from 'react';
import { getRequestById } from '../api/requests';
import type { PrintRequest } from '../types';
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '../types';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  denied: '#ef4444',
  completed: '#6366f1',
};

export default function StatusPage() {
  const [requestId, setRequestId] = useState('');
  const [request, setRequest] = useState<PrintRequest | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLookup = async () => {
    setError('');
    setRequest(null);
    if (!requestId.trim()) {
      setError('Please enter a Request ID.');
      return;
    }
    setLoading(true);
    try {
      const result = await getRequestById(requestId.trim());
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
        <p>Enter your Request ID to see the current status of your print job.</p>
      </div>

      <div className="lookup-bar">
        <input
          type="number"
          placeholder="Enter your Request ID (e.g. 67)"
          value={requestId}
          onChange={(e) => setRequestId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
        />
        <button className="btn-primary" onClick={handleLookup} disabled={loading}>
          {loading ? 'Looking up...' : 'Check Status'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {request && (
        <div className="status-card">
          <div
            className="status-badge"
            style={{ backgroundColor: STATUS_COLORS[request.status] }}
          >
            {STATUS_LABELS[request.status]}
          </div>

          <h2>Request #{request.id}</h2>

          <div className="info-block">
            <p><span>Student:</span> {request.student_name}</p>
            <p><span>Email:</span> {request.email}</p>
            <p><span>Type:</span> {REQUEST_TYPE_LABELS[request.request_type]}</p>
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
