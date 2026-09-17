const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function getSecret() {
  return process.env.SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createSession() {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload)}`;
}

function parseCookies(header = '') {
  return Object.fromEntries(
    header.split(';').filter(Boolean).map((part) => {
      const separator = part.indexOf('=');
      return [part.slice(0, separator).trim(), decodeURIComponent(part.slice(separator + 1).trim())];
    })
  );
}

function isValidSession(session) {
  if (!getSecret() || !session) return false;
  const [expiresAt, signature] = session.split('.');
  if (!expiresAt || !signature || Number(expiresAt) < Date.now()) return false;

  const expectedSignature = sign(expiresAt);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function requireAdmin(req, res, next) {
  const cookies = parseCookies(req.headers.cookie);
  if (!isValidSession(cookies[COOKIE_NAME])) {
    return res.status(401).json({ error: 'Admin authentication required.' });
  }
  next();
}

function sessionCookieOptions() {
  const isProduction = process.env.NODE_ENV === 'production';
  return [
    `${COOKIE_NAME}=${encodeURIComponent(createSession())}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${SESSION_TTL_MS / 1000}`,
    `SameSite=${isProduction ? 'None' : 'Lax'}`,
    ...(isProduction ? ['Secure'] : []),
  ].join('; ');
}

module.exports = { COOKIE_NAME, requireAdmin, sessionCookieOptions };