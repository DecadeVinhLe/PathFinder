// NoSQL document store for per-browser data (recent journeys, preferences), backed by Netlify Blobs.
//
//  - One JSON document per visitor (an "aggregate"), key `u/<sha256 of the pf_store cookie>`.
//  - Optimistic concurrency: read the etag, write with onlyIfMatch / onlyIfNew, retry on conflict.
//  - Store name depends on the deploy context so Deploy Previews never touch production data
//    (Blobs stores made with getStore() are shared across contexts).
//  - @netlify/blobs is loaded lazily. Until it is installed (`pnpm add @netlify/blobs`) the routes
//    answer 503 and nothing else in the app is affected.
//
// Routes (all under /api/store):
//   GET    /me         -> { journeys:[...], prefs:{...} }
//   POST   /journeys   -> add or refresh one recent journey (max 20 kept, newest first)
//   PUT    /prefs      -> { lang:'en'|'vi', theme:'light'|'dark' } (either or both)
//   DELETE /me         -> erase everything stored for this visitor
import { randomUUID, createHash } from 'node:crypto';

export const MAX_JOURNEYS = 20;
const MAX_BODY = 2000;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const PICK = /^(bike|car|pub|mix|j:[\w:.-]{1,40})$/;
const hash = (v) => createHash('sha256').update(v).digest('hex');

export async function loadBlobs() {
  try { return (await import('@netlify/blobs')).getStore; } catch { return null; }
}

export const storeName = (deployContext) =>
  !deployContext || deployContext === 'production' ? 'pf-docs' : 'pf-docs-preview';

const blank = () => ({ v: 1, journeys: [], prefs: {}, updatedAt: 0 });
function normalize(d) {
  const out = blank();
  if (d && typeof d === 'object') {
    if (Array.isArray(d.journeys)) out.journeys = d.journeys.slice(0, MAX_JOURNEYS);
    if (d.prefs && typeof d.prefs === 'object') out.prefs = d.prefs;
    out.updatedAt = Number(d.updatedAt) || 0;
  }
  return out;
}

export function cleanJourney(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const from = typeof p.from === 'string' ? p.from.trim() : '';
  const to = typeof p.to === 'string' ? p.to.trim() : '';
  if (!from || !to || from.length > 150 || to.length > 150) return null;
  if (p.time != null && p.time !== '' && (typeof p.time !== 'string' || !TIME.test(p.time))) return null;
  if (p.arr != null && typeof p.arr !== 'boolean') return null;
  if (p.pick != null && p.pick !== '' && (typeof p.pick !== 'string' || !PICK.test(p.pick))) return null;
  return { id: randomUUID(), from, to, time: p.time || '', arr: !!p.arr, pick: p.pick || '', ts: Date.now() };
}

export function cleanPrefs(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  const out = {};
  if (p.lang !== undefined) { if (!['en', 'vi'].includes(p.lang)) return null; out.lang = p.lang; }
  if (p.theme !== undefined) { if (!['light', 'dark'].includes(p.theme)) return null; out.theme = p.theme; }
  return Object.keys(out).length ? out : null;
}

const journeyKey = (j) => `${j.from}|${j.to}`.toLowerCase();

async function mutate(store, key, change) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const cur = await store.getWithMetadata(key, { type: 'json' });
    const next = change(normalize(cur && cur.data));
    next.updatedAt = Date.now();
    const res = await store.setJSON(key, next, cur && cur.etag ? { onlyIfMatch: cur.etag } : { onlyIfNew: true });
    if (!res || res.modified !== false) return next;
  }
  throw new Error('write conflict');
}

export async function handleStore(request, { getStore, deployContext } = {}) {
  const headers = { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' };
  const reply = (data, status = 200) => new Response(JSON.stringify(data), { status, headers });
  const url = new URL(request.url);
  const path = url.pathname.replace(/\/+$/, '');

  let cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)pf_store=([0-9a-f-]+)/)?.[1];
  if (!cookie || !uuid.test(cookie)) {
    cookie = randomUUID();
    headers['Set-Cookie'] = `pf_store=${cookie}; HttpOnly; Secure; SameSite=Strict; Path=/api/store; Max-Age=31536000`;
  }
  const key = `u/${hash(cookie)}`;

  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(request.method)) return reply({ error: 'Method not allowed' }, 405);
  if (request.method !== 'GET') {
    const origin = request.headers.get('origin');
    if (origin && origin !== url.origin) return reply({ error: 'Invalid origin' }, 403);
  }

  let body;
  if (request.method === 'POST' || request.method === 'PUT') {
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({ error: 'JSON required' }, 415);
    const raw = await request.text();
    if (raw.length > MAX_BODY) return reply({ error: 'Too large' }, 413);
    try { body = JSON.parse(raw); } catch { return reply({ error: 'Invalid JSON' }, 400); }
  }

  const route = `${request.method} ${path}`;
  let entry, prefs;
  if (route === 'POST /api/store/journeys') {
    entry = cleanJourney(body);
    if (!entry) return reply({ error: 'Invalid journey' }, 400);
  } else if (route === 'PUT /api/store/prefs') {
    prefs = cleanPrefs(body);
    if (!prefs) return reply({ error: 'Invalid preferences' }, 400);
  } else if (route !== 'GET /api/store/me' && route !== 'DELETE /api/store/me') {
    return reply({ error: 'Not found' }, 404);
  }

  if (typeof getStore !== 'function') return reply({ error: 'The data store is not enabled on this deploy.' }, 503);
  try {
    const store = getStore(storeName(deployContext));
    if (route === 'GET /api/store/me') {
      const cur = await store.getWithMetadata(key, { type: 'json' });
      const d = normalize(cur && cur.data);
      return reply({ journeys: d.journeys, prefs: d.prefs });
    }
    if (route === 'DELETE /api/store/me') {
      await store.delete(key);
      return reply({ ok: true });
    }
    if (entry) {
      const d = await mutate(store, key, (doc) => {
        doc.journeys = [entry, ...doc.journeys.filter((j) => journeyKey(j) !== journeyKey(entry))].slice(0, MAX_JOURNEYS);
        return doc;
      });
      return reply({ ...entry, kept: d.journeys.length }, 201);
    }
    const d = await mutate(store, key, (doc) => { doc.prefs = { ...doc.prefs, ...prefs }; return doc; });
    return reply({ prefs: d.prefs });
  } catch {
    return reply({ error: 'The data store is temporarily unavailable. Please try again.' }, 503);
  }
}
