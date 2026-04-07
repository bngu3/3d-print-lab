import { useEffect, useState } from 'react';
import { getAllRequests, getArchivedRequests, updateRequestStatus, archiveRequest, getDownloadUrl } from '../api/requests';
import type { PrintRequest } from '../types';
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '../types';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

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
  const [archivedRequests, setArchivedRequests] = useState<PrintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});
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

  const fetchArchived = async () => {
    try {
      const data = await getArchivedRequests();
      setArchivedRequests(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load archived requests.');
    }
  };

  useEffect(() => {
    if (authenticated) {
      fetchRequests();
      fetchArchived();
    }
  }, [authenticated]);

  const handleStatusUpdate = async (req: PrintRequest, status: string) => {
    setUpdating(req.id);
    try {
      const updated = await updateRequestStatus(req.request_code, status, noteInputs[req.request_code]);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const handleArchive = async (req: PrintRequest) => {
    try {
      await archiveRequest(req.request_code);
      setRequests((prev) => prev.filter((r) => r.id !== req.id));
      fetchArchived();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Archive failed.');
    }
  };

  if (!authenticated) {
    return (
      <div className="form-container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
        <div className="form-header">
          <h1>Admin Access</h1>
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

  const displayList = showArchived ? archivedRequests : filtered;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>{requests.length} active requests · {archivedRequests.length} archived</p>
      </div>

      <div className="admin-toolbar">
        <button
          className={!showArchived ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setShowArchived(false)}
        >
          Active
        </button>
        <button
          className={showArchived ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setShowArchived(true)}
        >
          Archived
        </button>

        {!showArchived && (
          <>
            <label>Filter:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="completed">Completed</option>
            </select>
          </>
        )}
        <button className="btn-secondary" onClick={() => { fetchRequests(); fetchArchived(); }}>↻ Refresh</button>
      </div>

      {loading && <p className="loading-text">Loading requests...</p>}
      {error && <div className="error-message">{error}</div>}

      {!loading && displayList.length === 0 && (
        <div className="empty-state">{showArchived ? 'No archived requests.' : 'No requests found.'}</div>
      )}

      <div className="requests-list">
        {displayList.map((req) => (
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
              <span className="request-id">{req.request_code}</span>
            </div>

            <div className="request-body">
              <h3>{req.student_name}</h3>
              <p style={{ fontSize: '0.85rem', color: '#BDBDBD' }}>📧 {req.email}</p>
              <p className="request-description">{req.description}</p>
              <div className="request-details">
                <span>{req.print_size}</span>
                <span>{req.requested_date}</span>
                <span>{new Date(req.created_at).toLocaleString()}</span>
                <span>{req.file_name}</span>
              </div>
            </div>

            {!showArchived && (
              <div className="request-actions">
                <a href={getDownloadUrl(req.request_code)} className="btn-download" download>
                  ⬇ Download File
                </a>
                <div className="note-input-row">
                  <input
                    type="text"
                    placeholder="Add a note (optional)..."
                    value={noteInputs[req.request_code] ?? req.admin_notes ?? ''}
                    onChange={(e) => setNoteInputs((prev) => ({ ...prev, [req.request_code]: e.target.value }))}
                  />
                </div>
                <div className="action-buttons">
                  <button className="btn-approve" onClick={() => handleStatusUpdate(req, 'approved')} disabled={updating === req.id || req.status === 'approved'}>
                    Approve
                  </button>
                  <button className="btn-complete" onClick={() => handleStatusUpdate(req, 'completed')} disabled={updating === req.id || req.status === 'completed'}>
                    Complete
                  </button>
                  <button className="btn-deny" onClick={() => handleStatusUpdate(req, 'denied')} disabled={updating === req.id || req.status === 'denied'}>
                    Deny
                  </button>
                  <button
                    style={{ background: 'rgba(100,100,100,0.15)', color: '#BDBDBD', border: '1px solid #3a3a3a', borderRadius: '8px', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '0.85rem', fontWeight: '700' }}
                    onClick={() => handleArchive(req)}
                  >
                    Archive
                  </button>
                </div>
              </div>
            )}

            {showArchived && (
              <div className="request-actions">
                <a href={getDownloadUrl(req.request_code)} className="btn-download" download>
                  ⬇ Download File
                </a>
                {req.admin_notes && (
                  <p style={{ fontSize: '0.85rem', color: '#BDBDBD', padding: '0.5rem 0' }}>📝 {req.admin_notes}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}