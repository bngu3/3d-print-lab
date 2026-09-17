const crypto = require('crypto');
const express = require('express');
const { COOKIE_NAME, sessionCookieOptions } = require('../middleware/auth');

const router = express.Router();

function passwordsMatch(input, configured) {
  if (!input || !configured) return false;
  const inputBuffer = Buffer.from(input);
  const configuredBuffer = Buffer.from(configured);
  return inputBuffer.length === configuredBuffer.length
    && crypto.timingSafeEqual(inputBuffer, configuredBuffer);
}

router.post('/login', (req, res) => {
  if (!process.env.ADMIN_PASSWORD || !process.env.SESSION_SECRET) {
    return res.status(500).json({ error: 'Admin authentication is not configured.' });
  }
  if (!passwordsMatch(req.body?.password, process.env.ADMIN_PASSWORD)) {
    return res.status(401).json({ error: 'Incorrect password.' });
  }

  res.setHeader('Set-Cookie', sessionCookieOptions());
  res.json({ message: 'Admin login successful.' });
});

router.post('/logout', (_req, res) => {
  const sameSite = process.env.NODE_ENV === 'production' ? 'None; Secure' : 'Lax';
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=${sameSite}`);
  res.json({ message: 'Logged out.' });
});

module.exports = router;