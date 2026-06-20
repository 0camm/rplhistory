// api/records.js
// GET /api/records              -> { ok, records }
// PUT /api/records?key=pts      -> update one record            (admin)
const { requireAdmin } = require('./_lib/auth');
const { getRecords, setRecords } = require('./_lib/store');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');

module.exports = withErrorHandling(async (req, res) => {
  if (req.method === 'GET') {
    const records = await getRecords();
    return sendOk(res, { records });
  }

  if (!requireAdmin(req, res)) return;

  if (req.method === 'PUT') {
    const { key } = req.query;
    if (!key) return sendError(res, 400, 'Record key required');
    const body = req.body || {};
    if (body.value === undefined || !body.holder) {
      return sendError(res, 400, 'Record requires value and holder');
    }
    const records = await getRecords();
    if (!records[key]) return sendError(res, 404, `Record "${key}" not found`);
    records[key] = { ...records[key], ...body };
    await setRecords(records);
    return sendOk(res, { key, record: records[key] });
  }

  return sendError(res, 405, 'Method not allowed');
});
