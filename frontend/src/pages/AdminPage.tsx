import { useEffect, useState } from 'react';
import { getAllRequests, updateRequestStatus, getDownloadUrl } from '../api/requests';
import type { PrintRequest } from '../types';
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '../types';

const ADMIN_PASSWORD = 'iloveandrew67$';

const PRIORITY_COLORS: Record<string, string> = {
  class: '#ef4444',
  project: '#f59e0b',
  personal: '#10b981',
};

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  approved: '#10b981',
  denied: '#ef4444',
  completed: '#6366f1',
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [noteInputs, setNoteInputs] = useState<Record<number, string>>({});
  const [updating, setUpdating] = useState<number | null>(null);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      setPasswordError('Incorrect password.');
    }
  };

  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      setRequests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) fetchRequests();
  }, [authenticated]);

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdating(id);
    try {
      const updated = await updateRequestStatus(id, status, noteInputs[id]);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  if (!authenticated) {
    return (
      <div className="form-container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
        <div className="form-header">
          <h1>🔒 Admin Access</h1>
          <p>Enter the lab assistant password to continue.</p>
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password..."
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>
        {passwordError && <div className="error-message">{passwordError}</div>}
        <button className="btn-primary" style={{ marginTop: '1rem', width: '100%' }} onClick={handleLogin}>
          Enter
        </button>
      </div>
    );
  }

  const filtered = filterStatus === 'all'
    ? requests
    : requests.filter((r) => r.status === filterStatus);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>🖨️ Admin Dashboard</h1>
        <p>{requests.length} total requests</p>
      </div>

      <div className="admin-toolbar">
        <label>Filter by status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn-secondary" onClick={fetchRequests}>↻ Refresh</button>
      </div>

      {loading && <p className="loading-text">Loading requests...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && filtered.length === 0 && (
        <div className="empty-state">No requests found.</div>
      )}

      <div className="requests-list">
        {filtered.map((req) => (
          <div key={req.id} className="request-card">
            <div className="request-card-header">
              <div className="request-meta">
                <span className="type-badge" style={{ backgroundColor: PRIORITY_COLORS[req.request_type] }}>
                  {REQUEST_TYPE_LABELS[req.request_type]}
                </span>
                <span className="status-badge-sm" style={{ backgroundColor: STATUS_COLORS[req.status] }}>
                  {STATUS_LABELS[req.status]}
                </span>
              </div>
              <span className="request-id">#{req.id}</span>
            </div>

            <div className="request-body">
              <h3>{req.student_name}</h3>
              <p className="request-description">{req.description}</p>
              <div className="request-details">
                <span>📅 {req.requested_date}</span>
                <span>🕐 Submitted: {new Date(req.created_at).toLocaleString()}</span>
                <span>📁 {req.file_name}</span>
              </div>
            </div>

            <div className="request-actions">
              <a href={getDownloadUrl(req.id)} className="btn-download" download>
                ⬇ Download File
              </a>
              <div className="note-input-row">
                <input
                  type="text"
                  placeholder="Add a note (optional)..."
                  value={noteInputs[req.id] ?? req.admin_notes ?? ''}
                  onChange={(e) => setNoteInputs((prev) => ({ ...prev, [req.id]: e.target.value }))}
                />
              </div>
              <div className="action-buttons">
                <button className="btn-approve" onClick={() => handleStatusUpdate(req.id, 'approved')} disabled={updating === req.id || req.status === 'approved'}>
                  ✓ Approve
                </button>
                <button className="btn-complete" onClick={() => handleStatusUpdate(req.id, 'completed')} disabled={updating === req.id || req.status === 'completed'}>
                  ✅ Mark Completed
                </button>
                <button className="btn-deny" onClick={() => handleStatusUpdate(req.id, 'denied')} disabled={updating === req.id || req.status === 'denied'}>
                  ✕ Deny
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}