// api/hof.js
// POST /api/hof?action=induct  { name, tier, notes } -> manually induct (admin)
// POST /api/hof?action=remove&name=Name              -> remove/exclude (admin)
const { requireAdmin } = require('./_lib/auth');
const { getHofInductions, setHofInductions, getHofRemovals, setHofRemovals } = require('./_lib/store');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');

module.exports = withErrorHandling(async (req, res) => {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed');
  if (!requireAdmin(req, res)) return;

  const { action } = req.query;

  if (action === 'induct') {
    const { name, tier, notes } = req.body || {};
    if (!name || !name.trim()) return sendError(res, 400, 'Player name required');
    if (!['hof', 'ring-of-honor'].includes(tier)) {
      return sendError(res, 400, 'Tier must be "hof" or "ring-of-honor"');
    }
    const [inductions, removals] = await Promise.all([getHofInductions(), getHofRemovals()]);
    inductions[name.trim()] = { tier, notes: notes || '', inductedAt: new Date().toISOString() };
    const nextRemovals = removals.filter((n) => n !== name.trim());
    await Promise.all([setHofInductions(inductions), setHofRemovals(nextRemovals)]);
    return sendOk(res, { name: name.trim(), tier });
  }

  if (action === 'remove') {
    const name = (req.query.name || '').trim();
    if (!name) return sendError(res, 400, 'Player name required');
    const [inductions, removals] = await Promise.all([getHofInductions(), getHofRemovals()]);
    delete inductions[name];
    if (!removals.includes(name)) removals.push(name);
    await Promise.all([setHofInductions(inductions), setHofRemovals(removals)]);
    return sendOk(res, { name });
  }

  return sendError(res, 400, 'Unknown action');
});
