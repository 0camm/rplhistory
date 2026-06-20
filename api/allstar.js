// api/allstar.js
// GET  /api/allstar                       -> { ok, allStar }
// POST /api/allstar?player=Name           -> create a player entry  (admin)
// PUT  /api/allstar?player=Name           -> update a player entry  (admin)
const { requireAdmin } = require('./_lib/auth');
const { getAllStar, setAllStar } = require('./_lib/store');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');

const BLANK = { apps: 0, wins: 0, mvps: 0, dunk: 0, skills: 0, threepoint: 0 };

module.exports = withErrorHandling(async (req, res) => {
  if (req.method === 'GET') {
    const allStar = await getAllStar();
    return sendOk(res, { allStar });
  }

  if (!requireAdmin(req, res)) return;

  const player = (req.query.player || '').trim();
  if (!player) return sendError(res, 400, 'Player name required');

  const allStar = await getAllStar();

  if (req.method === 'POST') {
    if (allStar[player]) return sendError(res, 409, `${player} already exists`);
    allStar[player] = { ...BLANK, ...(req.body || {}) };
    await setAllStar(allStar);
    return sendOk(res, { player, data: allStar[player] });
  }

  if (req.method === 'PUT') {
    const existing = allStar[player] || BLANK;
    allStar[player] = { ...existing, ...(req.body || {}) };
    await setAllStar(allStar);
    return sendOk(res, { player, data: allStar[player] });
  }

  return sendError(res, 405, 'Method not allowed');
});
