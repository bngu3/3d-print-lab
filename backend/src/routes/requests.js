const express = require('express');
const path = require('path');
const db = require('../db/database');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();
const PRIORITY_MAP = { class: 1, project: 2, personal: 3 };

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A print file is required.' });
  const { student_name, requested_date, description, request_type } = req.body;
  if (!student_name || !requested_date || !description || !request_type)
    return res.status(400).json({ error: 'All fields are required.' });
  const priority = PRIORITY_MAP[request_type];
  db.run(
    `INSERT INTO print_requests (student_name, requested_date, description, request_type, priority, file_name, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [student_name, requested_date, description, request_type, priority, req.file.originalname, req.file.filename],
    function(err) {
      if (err) return res.status(500).json({ error: 'Internal server error.' });
      db.get('SELECT * FROM print_requests WHERE id = ?', [this.lastID], (err, row) => {
        res.status(201).json({ message: 'Request submitted!', request: row });
      });
    }
  );
});

router.get('/', (_req, res) => {
  db.all('SELECT * FROM print_requests ORDER BY priority ASC, created_at ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get('SELECT * FROM print_requests WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Internal server error.' });
    if (!row) return res.status(404).json({ error: 'Request not found.' });
    res.json(row);
  });
});

router.patch('/:id/status', (req, res) => {
  const { status, admin_notes } = req.body;
  const validStatuses = ['pending', 'approved', 'denied', 'completed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  db.run(
    'UPDATE print_requests SET status = ?, admin_notes = ? WHERE id = ?',
    [status, admin_notes ?? null, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Internal server error.' });
      db.get('SELECT * FROM print_requests WHERE id = ?', [req.params.id], (err, row) => {
        res.json({ message: 'Status updated.', request: row });
      });
    }
  );
});

router.get('/:id/download', (req, res) => {
  db.get('SELECT * FROM print_requests WHERE id = ?', [req.params.id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Request not found.' });
    res.download(path.join(UPLOAD_DIR, row.file_path), row.file_name);
  });
});

module.exports = router;