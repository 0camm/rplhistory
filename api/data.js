// api/data.js
// GET -> { ok, data: { seasons, records, allStar, hofInductions, hofRemovals } }
// One consolidated read so the frontend can load everything in a single
// round trip on first paint.
const { getAllData } = require('./_lib/store');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');

module.exports = withErrorHandling(async (req, res) => {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed');

  const data = await getAllData();
  sendOk(res, { data });
});
