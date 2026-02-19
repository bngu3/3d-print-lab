const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../db/printlab.db');
const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS print_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      requested_date TEXT NOT NULL,
      description TEXT NOT NULL,
      request_type TEXT NOT NULL,
      priority INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      admin_notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
});

module.exports = db;