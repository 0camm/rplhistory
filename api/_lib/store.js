// api/_lib/store.js
// Centralized data-access layer. Every API route goes through these
// functions instead of touching Redis directly, so the storage schema
// only has to be understood in one place.

const { getJSON, setJSON, setJSONIfMissing } = require('./redis');

const KEYS = {
  seasons: 'rpl:seasons',
  archivedSeasons: 'rpl:seasons:archived',
  records: 'rpl:records',
  allStar: 'rpl:allstar',
  hofInductions: 'rpl:hof:inductions',
  hofRemovals: 'rpl:hof:removals',
};

const getSeasons = () => getJSON(KEYS.seasons, []);
const setSeasons = (seasons) => setJSON(KEYS.seasons, seasons);

const getArchivedSeasons = () => getJSON(KEYS.archivedSeasons, []);
const setArchivedSeasons = (seasons) => setJSON(KEYS.archivedSeasons, seasons);

const getRecords = () => getJSON(KEYS.records, {});
const setRecords = (records) => setJSON(KEYS.records, records);

const getAllStar = () => getJSON(KEYS.allStar, {});
const setAllStar = (data) => setJSON(KEYS.allStar, data);

const getHofInductions = () => getJSON(KEYS.hofInductions, {});
const setHofInductions = (data) => setJSON(KEYS.hofInductions, data);

const getHofRemovals = () => getJSON(KEYS.hofRemovals, []);
const setHofRemovals = (data) => setJSON(KEYS.hofRemovals, data);

// Fetch everything the frontend needs for first paint, in parallel.
async function getAllData() {
  const [seasons, records, allStar, hofInductions, hofRemovals] = await Promise.all([
    getSeasons(),
    getRecords(),
    getAllStar(),
    getHofInductions(),
    getHofRemovals(),
  ]);
  return { seasons, records, allStar, hofInductions, hofRemovals };
}

// Populate only the keys that are currently empty — never overwrites
// existing admin-entered data.
async function seedIfEmpty({ DEFAULT_SEASONS, DEFAULT_RECORDS, DEFAULT_ALLSTAR }) {
  const results = await Promise.all([
    setJSONIfMissing(KEYS.seasons, DEFAULT_SEASONS),
    setJSONIfMissing(KEYS.records, DEFAULT_RECORDS),
    setJSONIfMissing(KEYS.allStar, DEFAULT_ALLSTAR),
    setJSONIfMissing(KEYS.archivedSeasons, []),
    setJSONIfMissing(KEYS.hofInductions, {}),
    setJSONIfMissing(KEYS.hofRemovals, []),
  ]);
  return { seeded: results.some(Boolean) };
}

module.exports = {
  KEYS,
  getSeasons, setSeasons,
  getArchivedSeasons, setArchivedSeasons,
  getRecords, setRecords,
  getAllStar, setAllStar,
  getHofInductions, setHofInductions,
  getHofRemovals, setHofRemovals,
  getAllData,
  seedIfEmpty,
};
