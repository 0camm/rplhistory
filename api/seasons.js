// api/seasons.js
// GET    /api/seasons                  -> { ok, seasons, archived }
// POST   /api/seasons                  -> create a season            (admin)
// PUT    /api/seasons?id=N             -> update a season             (admin)
// DELETE /api/seasons?id=N             -> permanently delete a season (admin)
// POST   /api/seasons?action=archive&id=N -> move season to archive   (admin)
// POST   /api/seasons?action=restore&id=N -> move season back         (admin)
const { requireAdmin } = require('./_lib/auth');
const {
  getSeasons, setSeasons,
  getArchivedSeasons, setArchivedSeasons,
} = require('./_lib/store');
const { sendOk, sendError, withErrorHandling } = require('./_lib/http');

module.exports = withErrorHandling(async (req, res) => {
  const { id, action } = req.query;

  if (req.method === 'GET') {
    const [seasons, archived] = await Promise.all([getSeasons(), getArchivedSeasons()]);
    return sendOk(res, { seasons, archived });
  }

  // Every write below requires a valid admin token.
  if (!requireAdmin(req, res)) return;

  if (req.method === 'POST' && action === 'archive') {
    return archiveSeason(req, res, parseInt(id, 10));
  }
  if (req.method === 'POST' && action === 'restore') {
    return restoreSeason(req, res, parseInt(id, 10));
  }

  if (req.method === 'POST') {
    return createSeason(req, res);
  }

  if (req.method === 'PUT') {
    return updateSeason(req, res, parseInt(id, 10));
  }

  if (req.method === 'DELETE') {
    return deleteSeason(req, res, parseInt(id, 10));
  }

  return sendError(res, 405, 'Method not allowed');
});

function validateSeason(body) {
  if (!body || typeof body !== 'object') return 'Season payload required';
  if (!body.champion || !body.champion.trim()) return 'Champion is required';
  if (body.id === undefined || body.id === null || Number.isNaN(parseInt(body.id, 10))) {
    return 'A numeric season id is required';
  }
  return null;
}

async function createSeason(req, res) {
  const body = req.body || {};
  const error = validateSeason(body);
  if (error) return sendError(res, 400, error);

  const seasons = await getSeasons();
  const id = parseInt(body.id, 10);
  if (seasons.some((s) => s.id === id)) {
    return sendError(res, 409, `Season ${id} already exists`);
  }
  const season = { ...body, id };
  seasons.push(season);
  await setSeasons(seasons);
  sendOk(res, { season });
}

async function updateSeason(req, res, id) {
  if (!id && id !== 0) return sendError(res, 400, 'Season id required');
  const body = req.body || {};
  const error = validateSeason({ ...body, id: body.id ?? id });
  if (error) return sendError(res, 400, error);

  const seasons = await getSeasons();
  const idx = seasons.findIndex((s) => s.id === id);
  if (idx === -1) return sendError(res, 404, `Season ${id} not found`);

  const newId = body.id !== undefined ? parseInt(body.id, 10) : id;
  if (newId !== id && seasons.some((s) => s.id === newId)) {
    return sendError(res, 409, `Season ${newId} already exists`);
  }
  seasons[idx] = { ...body, id: newId };
  await setSeasons(seasons);
  sendOk(res, { season: seasons[idx] });
}

async function deleteSeason(req, res, id) {
  if (!id && id !== 0) return sendError(res, 400, 'Season id required');
  const seasons = await getSeasons();
  const next = seasons.filter((s) => s.id !== id);
  if (next.length === seasons.length) return sendError(res, 404, `Season ${id} not found`);
  await setSeasons(next);
  sendOk(res, { id });
}

async function archiveSeason(req, res, id) {
  if (!id && id !== 0) return sendError(res, 400, 'Season id required');
  const [seasons, archived] = await Promise.all([getSeasons(), getArchivedSeasons()]);
  const idx = seasons.findIndex((s) => s.id === id);
  if (idx === -1) return sendError(res, 404, `Season ${id} not found`);

  const [season] = seasons.splice(idx, 1);
  season._archivedAt = new Date().toISOString();
  archived.push(season);

  await Promise.all([setSeasons(seasons), setArchivedSeasons(archived)]);
  sendOk(res, { id });
}

async function restoreSeason(req, res, id) {
  if (!id && id !== 0) return sendError(res, 400, 'Season id required');
  const [seasons, archived] = await Promise.all([getSeasons(), getArchivedSeasons()]);
  const idx = archived.findIndex((s) => s.id === id);
  if (idx === -1) return sendError(res, 404, `Archived season ${id} not found`);

  const [season] = archived.splice(idx, 1);
  delete season._archivedAt;
  if (seasons.some((s) => s.id === id)) {
    return sendError(res, 409, `Season ${id} already exists in active seasons`);
  }
  seasons.push(season);

  await Promise.all([setSeasons(seasons), setArchivedSeasons(archived)]);
  sendOk(res, { id });
}
