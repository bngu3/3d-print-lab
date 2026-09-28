const bcrypt = require('bcrypt');
const express = require('express');
const pool = require('../db/database');
const { COOKIE_NAME, sessionCookieOptions } = require('../middleware/auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  if (!process.env.SESSION_SECRET) {
    return res.status(500).json({ error: 'Session authentication is not configured.' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const result = await pool.query(`
      SELECT u.id, u.email, u.password_hash, r.name AS role
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE u.email = $1 AND u.is_active = TRUE
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    res.setHeader('Set-Cookie', sessionCookieOptions({ id: user.id, role: user.role }));
    res.json({ message: 'Login successful.', role: user.role, email: user.email });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/logout', (_req, res) => {
  const sameSite = process.env.NODE_ENV === 'production' ? 'None; Secure' : 'Lax';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}`);
  res.json({ message: 'Logged out.' });
});

module.exports = router;