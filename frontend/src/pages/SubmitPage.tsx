import { useState } from 'react';
import type { FormEvent } from 'react';
import type { PrintRequest } from '../types';
import { submitRequest } from '../api/requests';

export default function SubmitPage() {
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [requestedDate, setRequestedDate] = useState('');
  const [description, setDescription] = useState('');
  const [requestType, setRequestType] = useState<'class' | 'project' | 'personal'>('class');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState<PrintRequest | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!file) {
      setError('Please upload a .stl file.');
      return;
    }

    const formData = new FormData();
    formData.append('student_name', studentName);
    formData.append('email', email);
    formData.append('requested_date', requestedDate);
    formData.append('description', description);
    formData.append('request_type', requestType);
    formData.append('file', file);

    setLoading(true);
    try {
      const result = await submitRequest(formData);
      setSubmitted(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h2>Request Submitted!</h2>
        <p>Your print request has been received and is <strong>pending review</strong>.</p>
        <div className="info-block">
          <p><span>Request ID:</span> <strong>#{submitted.id}</strong></p>
          <p><span>Name:</span> {submitted.student_name}</p>
          <p><span>Type:</span> {submitted.request_type}</p>
          <p><span>File:</span> {submitted.file_name}</p>
        </div>
        <p className="hint">Save your Request ID to check your status later.</p>
        <button className="btn-secondary" onClick={() => setSubmitted(null)}>
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="form-container">
      <div className="form-header">
        <h1>Submit a Print Request</h1>
        <p>Fill out the form below to queue your 3D print job.</p>
      </div>

      <form onSubmit={handleSubmit} className="print-form">
        <div className="form-group">
          <label htmlFor="studentName">Student Name</label>
          <input
            id="studentName"
            type="text"
            placeholder="Your full name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="Your school email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="requestedDate">Requested Print Date</label>
          <input
            id="requestedDate"
            type="date"
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description of Object</label>
          <textarea
            id="description"
            placeholder="Describe what you're printing and its purpose..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="requestType">Request Type</label>
          <select
            id="requestType"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as typeof requestType)}
            required
          >
            <option value="class"> Class-Related (Highest Priority)</option>
            <option value="project"> Project-Based</option>
            <option value="personal"> Personal (Lowest Priority)</option>
          </select>
          <span className="field-hint">Class-related requests are always prioritized first.</span>
        </div>

        <div className="form-group">
          <label htmlFor="file">Print File (.stl)</label>
          <div className="file-upload-area">
            <input
              id="file"
              type="file"
              accept=".stl"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
            />
            {file && <p className="file-selected">📎 {file.name}</p>}
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}