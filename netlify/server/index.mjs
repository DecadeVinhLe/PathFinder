import { getDatabase } from '@netlify/database';
import { randomUUID, createHash } from 'node:crypto';
import { handleStore, loadBlobs } from './doc-store.mjs';
const db = getDatabase();
export const config = { path: ['/api/community/*', '/api/store/*'] };
const hash = value => createHash('sha256').update(value).digest('hex');
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const publicPost = (row, owner) => ({ id:row.id, ts:new Date(row.created_at).getTime(), ty:row.type, r:row.rating, m:row.mode, tx:row.body, own:row.owner_hash === owner, origin:row.origin, destination:row.destination, departedAt:row.departed_at, durationMinutes:row.duration_minutes, congestion:row.congestion });
export default async function handler(request, context) {
  if (new URL(request.url).pathname.startsWith('/api/store')) {
    return handleStore(request, { getStore: await loadBlobs(), deployContext: context?.deploy?.context ?? process.env.CONTEXT });
  }
  const headers = { 'Cache-Control':'no-store', 'Content-Type':'application/json' };
  const reply = (data, status=200) => new Response(JSON.stringify(data), { status, headers });
  const path = new URL(request.url).pathname;
  let cookie = request.headers.get('cookie')?.match(/(?:^|;\s*)pf_community=([0-9a-f-]+)/)?.[1];
  if (!cookie || !uuid.test(cookie)) {
    cookie = randomUUID();
    headers['Set-Cookie'] = `pf_community=${cookie}; HttpOnly; Secure; SameSite=Strict; Path=/api/community; Max-Age=31536000`;
  }
  const owner = hash(cookie);
  try {
    if (request.method === 'GET' && path === '/api/community/posts') {
      const rows = await db.sql`SELECT * FROM community_posts ORDER BY created_at DESC, id LIMIT 100`;
      return reply(rows.map(row => publicPost(row, owner)));
    }
    if (!['POST','DELETE'].includes(request.method)) return reply({error:'Method not allowed'},405);
    const origin = request.headers.get('origin');
    if (origin && origin !== new URL(request.url).origin) return reply({error:'Invalid origin'},403);
    if (request.method === 'DELETE' && path.startsWith('/api/community/posts/')) {
      const id = path.split('/').pop();
      if (!uuid.test(id)) return reply({error:'Invalid post'},400);
      const rows = await db.sql`DELETE FROM community_posts WHERE id=${id} AND owner_hash=${owner} RETURNING id`;
      return rows.length ? reply({ok:true}) : reply({error:'Post not found'},404);
    }
    if (request.method !== 'POST' || path !== '/api/community/posts') return reply({error:'Not found'},404);
    if (!request.headers.get('content-type')?.includes('application/json')) return reply({error:'JSON required'},415);
    const raw = await request.text();
    if (raw.length > 8000) return reply({error:'Post too large'},413);
    let p;
    try { p = JSON.parse(raw); } catch { return reply({error:'Invalid JSON'},400); }
    if (!p || !['comment','experience','suggestion'].includes(p.ty) || !['bike','car','brt','pool'].includes(p.m) || !Number.isInteger(p.r) || p.r<1 || p.r>5 || typeof p.tx !== 'string' || !p.tx.trim() || p.tx.length>500) return reply({error:'Invalid post'},400);
    for (const field of ['origin','destination']) if (p[field] != null && (typeof p[field] !== 'string' || p[field].length>150)) return reply({error:'Invalid route'},400);
    if (p.durationMinutes != null && (!Number.isInteger(p.durationMinutes) || p.durationMinutes<1 || p.durationMinutes>1440)) return reply({error:'Invalid duration'},400);
    if (p.congestion && !['low','moderate','heavy','standstill'].includes(p.congestion)) return reply({error:'Invalid congestion'},400);
    if (p.departedAt && (!Number.isFinite(Date.parse(p.departedAt)) || Date.parse(p.departedAt)>Date.now())) return reply({error:'Invalid departure time'},400);
    const rows = await db.sql`INSERT INTO community_posts (id,owner_hash,type,rating,mode,body,origin,destination,departed_at,duration_minutes,congestion,training_consent) VALUES (${randomUUID()},${owner},${p.ty},${p.r},${p.m},${p.tx.trim()},${p.origin?.trim() || null},${p.destination?.trim() || null},${p.departedAt || null},${p.durationMinutes ?? null},${p.congestion || null},${p.trainingConsent === true}) RETURNING *`;
    return reply(publicPost(rows[0],owner),201);
  } catch {
    return reply({error:'Community is temporarily unavailable. Please try again.'},503);
  }
}
