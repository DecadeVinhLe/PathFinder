// Sanity checks that need no dependencies:
//   1. every JS file under src/js parses
//   2. index.html references only files that exist
//   3. every file under src/js and src/css is referenced by index.html (no orphans)
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = new URL('..', import.meta.url).pathname;
const html = readFileSync(join(root, 'index.html'), 'utf8');
let failed = false;
const fail = (msg) => { console.error('✗ ' + msg); failed = true; };

const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const rel = (p) => relative(root, p).split(sep).join('/');

const referenced = [...html.matchAll(/(?:src|href)="((?:src|public)\/[^"]+)"/g)].map((m) => m[1]);
for (const r of referenced) if (!existsSync(join(root, r))) fail(`index.html references missing file: ${r}`);

const sources = [...walk(join(root, 'src/js')), ...walk(join(root, 'src/css'))].map(rel);
for (const s of sources) if (!referenced.includes(s)) fail(`not referenced by index.html: ${s}`);

for (const f of sources.filter((s) => s.endsWith('.js'))) {
  const r = spawnSync(process.execPath, ['--check', join(root, f)], { encoding: 'utf8' });
  if (r.status !== 0) fail(`syntax error in ${f}\n${r.stderr}`);
}

if (failed) process.exit(1);
console.log(`✓ ${sources.length} source files OK, ${referenced.length} references resolved`);
