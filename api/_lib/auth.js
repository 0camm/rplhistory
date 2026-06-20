// api/_lib/auth.js
// Stateless admin auth. Login compares the submitted password against
// ADMIN_PASSWORD (env var) and, on success, issues an HMAC-signed token
// using ADMIN_TOKEN_SECRET (env var). No secrets ever reach the client,
// and no session table is needed since the token is self-verifying.

const crypto = require('crypto');

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function getSecret() {
  const secret = process.env.ADMIN_TOKEN_SECRET;
  if (!secret) throw new Error('ADMIN_TOKEN_SECRET is not configured.');
  return secret;
}

function sign(payload) {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex');
}

// Issue a token of the form base64(expiry).signature
function issueToken() {
  const expires = Date.now() + TOKEN_TTL_MS;
  const payload = String(expires);
  const sig = sign(payload);
  return Buffer.from(payload).toString('base64url') + '.' + sig;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [encodedPayload, sig] = token.split('.');
  let payload;
  try {
    payload = Buffer.from(encodedPayload, 'base64url').toString('utf8');
  } catch {
    return false;
  }
  const expected = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }
  const expires = parseInt(payload, 10);
  if (!expires || Date.now() > expires) return false;
  return true;
}

function checkPassword(password) {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) throw new Error('ADMIN_PASSWORD is not configured.');
  if (typeof password !== 'string' || password.length !== real.length) return false;
  return crypto.timingSafeEqual(Buffer.from(password), Buffer.from(real));
}

// Express/Vercel-style guard: returns true and lets the caller proceed,
// or writes a 401 and returns false.
function requireAdmin(req, res) {
  const token = req.headers['x-admin-token'];
  if (!verifyToken(token)) {
    res.status(401).json({ ok: false, error: 'Unauthorized' });
    return false;
  }
  return true;
}

module.exports = { issueToken, verifyToken, checkPassword, requireAdmin };
