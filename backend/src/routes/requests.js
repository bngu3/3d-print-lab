const express = require('express');
const path = require('path');
const pool = require('../db/database');
const { upload, UPLOAD_DIR } = require('../middleware/upload');

const router = express.Router();
const PRIORITY_MAP = { class: 1, project: 2, personal: 3 };

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A print file is required.' });
  const { student_name, requested_date, description, request_type } = req.body;
  if (!student_name || !requested_date || !description || !request_type)
    return res.status(400).json({ error: 'All fields are required.' });
  const priority = PRIORITY_MAP[request_type];
  try {
    const result = await pool.query(
      `INSERT INTO print_requests (student_name, requested_date, description, request_type, priority, file_name, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [student_name, requested_date, description, request_type, priority, req.file.originalname, req.file.filename]
    );
    res.status(201).json({ message: 'Request submitted!', request: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM print_requests ORDER BY priority ASC, created_at ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM print_requests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.patch('/:id/status', async (req, res) => {
  const { status, admin_notes } = req.body;
  const validStatuses = ['pending', 'approved', 'denied', 'completed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const result = await pool.query(
      'UPDATE print_requests SET status = $1, admin_notes = $2 WHERE id = $3 RETURNING *',
      [status, admin_notes ?? null, req.params.id]
    );
    res.json({ message: 'Status updated.', request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM print_requests WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found.' });
    res.download(path.join(UPLOAD_DIR, result.rows[0].file_path), result.rows[0].file_name);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;