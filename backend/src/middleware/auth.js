const crypto = require('crypto');

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const AUTHORIZED_ROLES = new Set(['technician', 'admin']);

function getSecret() {
  return process.env.SESSION_SECRET;
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('base64url');
}

function createSession(userId, role = 'admin') {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${expiresAt}.${userId}.${role}`;
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

function parseSession(session = '') {
  if (!session) return null;
  const parts = session.split('.');
  if (parts.length !== 4) return null;

  const [expiresAt, userId, role, signature] = parts;
  return { expiresAt, userId, role, signature };
}

function getSessionUserFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);
  const session = cookies[COOKIE_NAME];
  if (!getSecret() || !session) return null;

  const parsed = parseSession(session);
  if (!parsed) return null;

  const { expiresAt, userId, role, signature } = parsed;
  if (!expiresAt || !userId || !role || !signature || Number(expiresAt) < Date.now()) return null;

  const payload = `${expiresAt}.${userId}.${role}`;
  const expectedSignature = sign(payload);
  const actual = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    return null;
  }

  return { id: Number(userId), role };
}

function requireRole(req, res, next, allowedRoles) {
  const user = getSessionUserFromRequest(req);
  if (!user || !allowedRoles.includes(user.role)) {
    return res.status(401).json({ error: 'Staff authentication required.' });
  }
  req.user = user;
  next();
}

function requireTechnician(req, res, next) {
  requireRole(req, res, next, ['technician', 'admin']);
}

function requireAdmin(req, res, next) {
  requireRole(req, res, next, ['admin']);
}

function sessionCookieOptions(user) {
  const isProduction = process.env.NODE_ENV === 'production';
  const userId = user && user.userId ? user.userId : user && user.id ? user.id : 'admin';
  const role = user && user.role ? user.role : 'admin';
  return [
    `${COOKIE_NAME}=${encodeURIComponent(createSession(userId, role))}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${SESSION_TTL_MS / 1000}`,
    `SameSite=${isProduction ? 'None' : 'Lax'}`,
    ...(isProduction ? ['Secure'] : []),
  ].join('; ');
}

module.exports = {
  COOKIE_NAME,
  requireTechnician,
  requireAdmin,
  sessionCookieOptions,
  AUTHORIZED_ROLES,
  getSessionUserFromRequest,
};