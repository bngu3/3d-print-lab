const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id SMALLSERIAL PRIMARY KEY,
      name VARCHAR(32) NOT NULL UNIQUE CHECK (name IN ('technician', 'admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role_id SMALLINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS print_requests (
      id SERIAL PRIMARY KEY,
      request_code TEXT UNIQUE NOT NULL,
      student_name TEXT NOT NULL,
      email TEXT,
      requested_date TEXT NOT NULL,
      description TEXT NOT NULL,
      print_size TEXT NOT NULL,
      request_type TEXT NOT NULL,
      priority INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      file_name TEXT NOT NULL,
      file_data BYTEA,
      admin_notes TEXT,
      archived BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    INSERT INTO roles (name)
    VALUES ('technician'), ('admin')
    ON CONFLICT (name) DO NOTHING
  `);

  console.log('Database ready!');
}

initializeDatabase().catch((err) => {
  console.error('Database setup error:', err);
});

module.exports = pool;