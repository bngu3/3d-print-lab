const express = require('express');
const pool = require('../db/database');
const { upload } = require('../middleware/upload');
const { sendConfirmationEmail } = require('../email');

const router = express.Router();
const PRIORITY_MAP = { class: 1, project: 2, personal: 3 };

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'A print file is required.' });
  const { student_name, email, requested_date, description, print_size, request_type } = req.body;
  if (!student_name || !email || !requested_date || !description || !print_size || !request_type)
    return res.status(400).json({ error: 'All fields are required.' });
  const priority = PRIORITY_MAP[request_type];
  const request_code = generateCode();
  try {
    const result = await pool.query(
      `INSERT INTO print_requests (request_code, student_name, email, requested_date, description, print_size, request_type, priority, file_name, file_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, request_code, student_name, email, requested_date, description, print_size, request_type, priority, status, file_name, created_at`,
      [request_code, student_name, email, requested_date, description, print_size, request_type, priority, req.file.originalname, req.file.buffer]
    );
    const newRequest = result.rows[0];

    try {
      await sendConfirmationEmail(email, newRequest);
    } catch (emailErr) {
      console.error('Email failed:', emailErr);
    }

    res.status(201).json({ message: 'Request submitted!', request: newRequest });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, request_code, student_name, email, requested_date, description, print_size, request_type, priority, status, file_name, admin_notes, archived, created_at FROM print_requests WHERE archived = FALSE ORDER BY priority ASC, created_at ASC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/archived', async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, request_code, student_name, email, requested_date, description, print_size, request_type, priority, status, file_name, admin_notes, archived, created_at FROM print_requests WHERE archived = TRUE ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:code', async (req, res) => {
  if (req.params.code === 'archived') return;
  try {
    const result = await pool.query(
      'SELECT id, request_code, student_name, email, requested_date, description, print_size, request_type, priority, status, file_name, admin_notes, created_at FROM print_requests WHERE request_code = $1',
      [req.params.code.toUpperCase()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found.' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.patch('/:code/status', async (req, res) => {
  const { status, admin_notes } = req.body;
  const validStatuses = ['pending', 'approved', 'denied', 'completed'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status.' });
  try {
    const result = await pool.query(
      'UPDATE print_requests SET status = $1, admin_notes = $2 WHERE request_code = $3 RETURNING id, request_code, student_name, email, requested_date, description, print_size, request_type, priority, status, file_name, admin_notes, created_at',
      [status, admin_notes ?? null, req.params.code.toUpperCase()]
    );
    res.json({ message: 'Status updated.', request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.patch('/:code/archive', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE print_requests SET archived = TRUE WHERE request_code = $1 RETURNING *',
      [req.params.code.toUpperCase()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found.' });
    res.json({ message: 'Request archived.', request: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.get('/:code/download', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT file_name, file_data FROM print_requests WHERE request_code = $1',
      [req.params.code.toUpperCase()]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Request not found.' });
    const { file_name, file_data } = result.rows[0];
    res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
    res.send(file_data);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;