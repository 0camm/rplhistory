// api/_lib/redis.js
// Single source of truth for talking to Upstash Redis over its REST API.
// Credentials come ONLY from environment variables — never hardcode them.
// Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your Vercel
// project settings (Project → Settings → Environment Variables).

const BASE_URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function assertConfigured() {
  if (!BASE_URL || !TOKEN) {
    throw new Error(
      'Redis is not configured. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN as environment variables.'
    );
  }
}

// Low-level command runner — sends a single Redis command via the REST API.
async function command(parts) {
  assertConfigured();
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parts),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Redis error ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (json.error) throw new Error(`Redis error: ${json.error}`);
  return json.result;
}

// Get a JSON value stored at `key`. Returns `fallback` if missing/unparseable.
async function getJSON(key, fallback = null) {
  const raw = await command(['GET', key]);
  if (raw === null || raw === undefined) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Store a JSON-serializable value at `key`.
async function setJSON(key, value) {
  return command(['SET', key, JSON.stringify(value)]);
}

// Delete one or more keys.
async function del(...keys) {
  if (!keys.length) return 0;
  return command(['DEL', ...keys]);
}

// Only set a key if it does not already exist (used for safe seeding).
async function setJSONIfMissing(key, value) {
  const raw = await command(['SET', key, JSON.stringify(value), 'NX']);
  return raw === 'OK';
}

module.exports = { command, getJSON, setJSON, del, setJSONIfMissing };
