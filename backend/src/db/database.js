const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query(`
  CREATE TABLE IF NOT EXISTS print_requests (
    id SERIAL PRIMARY KEY,
    student_name TEXT NOT NULL,
    requested_date TEXT NOT NULL,
    description TEXT NOT NULL,
    request_type TEXT NOT NULL,
    priority INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).then(() => console.log('Database ready!'))
  .catch(err => console.error('Database setup error:', err));

module.exports = pool;