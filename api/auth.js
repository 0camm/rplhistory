// api/auth.js
// POST { password } -> { ok, token }
const { checkPassword, issueToken } = require('./_lib/auth');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');

module.exports = withErrorHandling(async (req, res) => {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');

  const { password } = req.body || {};
  if (!password) return sendError(res, 400, 'Password required');

  if (!checkPassword(password)) {
    return sendError(res, 401, 'Invalid password');
  }

  sendOk(res, { token: issueToken() });
});
