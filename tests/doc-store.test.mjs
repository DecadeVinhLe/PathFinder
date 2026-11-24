import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleStore, cleanJourney, cleanPrefs, storeName, MAX_JOURNEYS } from '../netlify/server/doc-store.mjs';

// In-memory stand-in for a Netlify Blobs store: same etag / onlyIfMatch / onlyIfNew behaviour.
function mockStore({ conflictsFirst = 0 } = {}) {
  const mem = new Map(); let n = 0, conflicts = conflictsFirst;
  return {
    mem,
    async getWithMetadata(k) { const v = mem.get(k); return v ? { data: JSON.parse(v.json), etag: v.etag, metadata: {} } : null; },
    async setJSON(k, val, o = {}) {
      if (conflicts > 0) { conflicts--; return { modified: false }; }
      const cur = mem.get(k);
      if (o.onlyIfNew && cur) return { modified: false };
      if (o.onlyIfMatch && (!cur || cur.etag !== o.onlyIfMatch)) return { modified: false };
      const etag = 'e' + (++n); mem.set(k, { json: JSON.stringify(val), etag }); return { modified: true, etag };
    },
    async delete(k) { mem.delete(k); },
  };
}
const call = async (store, method, path, body, cookie, extra = {}) => {
  const res = await handleStore(new Request('https://example.com/api/store/' + path, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie: 'pf_store=' + cookie } : {}), ...extra },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  }), { getStore: () => store });
  const set = res.headers.get('set-cookie')?.match(/pf_store=([0-9a-f-]+)/)?.[1];
  return { res, json: await res.json(), cookie: set || cookie };
};
const trip = { from: 'Thu Duc Hospital', to: 'Ben Thanh', time: '08:00', arr: false, pick: 'mix' };

test('validators accept good input and reject bad input', () => {
  assert.ok(cleanJourney(trip));
  for (const bad of [null, [], {}, { ...trip, from: ' ' }, { ...trip, to: 'x'.repeat(151) }, { ...trip, time: '25:00' }, { ...trip, arr: 'yes' }, { ...trip, pick: 'hack' }]) assert.equal(cleanJourney(bad), null);
  assert.deepEqual(cleanPrefs({ lang: 'vi', theme: 'dark' }), { lang: 'vi', theme: 'dark' });
  for (const bad of [null, {}, { lang: 'fr' }, { theme: 'blue' }]) assert.equal(cleanPrefs(bad), null);
});

test('invalid requests are rejected before storage is touched', async () => {
  const boom = { getWithMetadata() { throw new Error('touched'); }, setJSON() { throw new Error('touched'); }, delete() { throw new Error('touched'); } };
  for (const [m, p, b] of [['POST', 'journeys', {}], ['POST', 'journeys', { ...trip, pick: 'x' }], ['PUT', 'prefs', { lang: 'xx' }]]) {
    assert.equal((await call(boom, m, p, b)).res.status, 400);
  }
  assert.equal((await call(boom, 'POST', 'journeys', trip, null, { origin: 'https://evil.example' })).res.status, 403);
  assert.equal((await call(boom, 'PATCH', 'me')).res.status, 405);
  assert.equal((await call(boom, 'GET', 'nope')).res.status, 404);
  const big = await handleStore(new Request('https://example.com/api/store/journeys', { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'x'.repeat(2500) }), { getStore: () => boom });
  assert.equal(big.status, 413);
  const wrongType = await handleStore(new Request('https://example.com/api/store/journeys', { method: 'POST', headers: { 'content-type': 'text/plain' }, body: '{}' }), { getStore: () => boom });
  assert.equal(wrongType.status, 415);
});

test('answers 503 (not a crash) when Blobs is not installed', async () => {
  const res = await handleStore(new Request('https://example.com/api/store/me'), {});
  assert.equal(res.status, 503);
});

test('saves, lists, de-duplicates, orders and caps journeys', async () => {
  const store = mockStore(); let c;
  const first = await call(store, 'POST', 'journeys', trip); c = first.cookie;
  assert.equal(first.res.status, 201); assert.ok(c, 'cookie issued');
  await call(store, 'POST', 'journeys', { from: 'A', to: 'B' }, c);
  await call(store, 'POST', 'journeys', { ...trip, from: 'THU DUC HOSPITAL', pick: 'car' }, c);   // same trip, different case
  let list = (await call(store, 'GET', 'me', undefined, c)).json.journeys;
  assert.equal(list.length, 2); assert.equal(list[0].pick, 'car'); assert.equal(list[1].from, 'A');
  for (let i = 0; i < 30; i++) await call(store, 'POST', 'journeys', { from: 'P' + i, to: 'Q' }, c);
  list = (await call(store, 'GET', 'me', undefined, c)).json.journeys;
  assert.equal(list.length, MAX_JOURNEYS); assert.equal(list[0].from, 'P29');
});

test('each visitor only ever sees their own document', async () => {
  const store = mockStore();
  const a = await call(store, 'POST', 'journeys', { from: 'A1', to: 'A2' });
  const b = await call(store, 'POST', 'journeys', { from: 'B1', to: 'B2' });
  assert.notEqual(a.cookie, b.cookie);
  assert.deepEqual((await call(store, 'GET', 'me', undefined, a.cookie)).json.journeys.map((j) => j.from), ['A1']);
  assert.deepEqual((await call(store, 'GET', 'me', undefined, b.cookie)).json.journeys.map((j) => j.from), ['B1']);
  const forged = await call(store, 'GET', 'me', undefined, 'not-a-uuid');
  assert.deepEqual(forged.json.journeys, []);
});

test('preferences merge and DELETE erases everything', async () => {
  const store = mockStore();
  const a = await call(store, 'PUT', 'prefs', { lang: 'vi' });
  await call(store, 'PUT', 'prefs', { theme: 'dark' }, a.cookie);
  await call(store, 'POST', 'journeys', trip, a.cookie);
  assert.deepEqual((await call(store, 'GET', 'me', undefined, a.cookie)).json.prefs, { lang: 'vi', theme: 'dark' });
  assert.equal((await call(store, 'DELETE', 'me', undefined, a.cookie)).res.status, 200);
  const after = (await call(store, 'GET', 'me', undefined, a.cookie)).json;
  assert.deepEqual(after, { journeys: [], prefs: {} }); assert.equal(store.mem.size, 0);
});

test('retries after a write conflict and gives up after repeated ones', async () => {
  assert.equal((await call(mockStore({ conflictsFirst: 2 }), 'POST', 'journeys', trip)).res.status, 201);
  assert.equal((await call(mockStore({ conflictsFirst: 99 }), 'POST', 'journeys', trip)).res.status, 503);
});

test('Deploy Previews use a different store than production', () => {
  assert.equal(storeName('production'), 'pf-docs'); assert.equal(storeName(undefined), 'pf-docs');
  assert.equal(storeName('deploy-preview'), 'pf-docs-preview'); assert.equal(storeName('branch-deploy'), 'pf-docs-preview');
});
