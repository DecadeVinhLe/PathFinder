import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../netlify/server/index.mjs';
const post = { ty:'experience', r:5, m:'bike', tx:'Slow commute' };
const request = (method, path, body, headers={}) => new Request('https://example.com/api/community/'+path, {
  method, headers:{'content-type':'application/json',...headers},
  ...(body === undefined ? {} : {body:JSON.stringify(body)}),
});
test('rejects invalid posts before querying storage', async () => {
  for (const body of [{}, null, {...post,r:6}, {...post,tx:' '}, {...post,m:'unknown'}, {...post,durationMinutes:-1}, {...post,departedAt:'invalid'}, {...post,origin:'x'.repeat(151)}]) {
    assert.equal((await handler(request('POST','posts',body))).status,400);
  }
});
test('rejects cross-origin writes', async () => {
  assert.equal((await handler(request('POST','posts',post,{origin:'https://other.example'}))).status,403);
});
test('rejects malformed deletion IDs and unsupported methods', async () => {
  assert.equal((await handler(request('DELETE','posts/invalid'))).status,400);
  assert.equal((await handler(request('PATCH','posts'))).status,405);
});
