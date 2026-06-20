// api/seed.js
// POST /api/seed -> populates any currently-empty DB keys with the
// historical default dataset from lib/defaults.js. Never overwrites
// data that already exists, so it's safe to call more than once.
const { requireAdmin } = require('./_lib/auth');
const { seedIfEmpty } = require('./_lib/store');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');
const { DEFAULT_SEASONS, DEFAULT_RECORDS, DEFAULT_ALLSTAR } = require('../lib/defaults');

module.exports = withErrorHandling(async (req, res) => {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  if (!requireAdmin(req, res)) return;

  const result = await seedIfEmpty({ DEFAULT_SEASONS, DEFAULT_RECORDS, DEFAULT_ALLSTAR });
  sendOk(res, result);
});
