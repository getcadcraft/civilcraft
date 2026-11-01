#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — developer messages. */
/**
 * ws11a.mjs — what runs on the owner's workstation for the real-client matrix (tools/gpu-remote/run.sh --wsl, rule 25):
 *   1. the mcp suites and the eval set (a second machine, a second OS family);
 *   2. DETECTION of the AI apps really installed on the Windows side (read only), then connect / disconnect on COPIES of their
 *      settings files in tmp/, to prove the writers keep every other server and the file's own formatting. The owner's real settings
 *      files are never written.
 * Windows folders are read through /mnt/c (WSL), with the Windows path rules of clients.mjs applied to the real %APPDATA%.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const OUT = path.join(ROOT, 'tmp');
fs.mkdirSync(OUT, { recursive: true });
const run = (f, ...a) => { const r = spawnSync(process.execPath, [path.join(ROOT, f), ...a], { encoding: 'utf8', timeout: 900000, maxBuffer: 1 << 25, env: { ...process.env, CADCRAFT_STUDIO: path.join(ROOT, 'studio') } }); return r; };
console.log('machine: ' + (process.env.HOSTNAME || '') + ' node ' + process.version + ' ' + process.platform);
for (const t of ['contract', 'connect', 'connect-table', 'hub', 'cards-openapi']) { const r = run('tools/mcp/test/' + t + '.mjs'); console.log(t + ': ' + ((/(\d+ passed, \d+ failed)/.exec(r.stdout) || [])[1] || (r.stdout + r.stderr).slice(-200))); }
{ const r = run('tools/mcp/evals/run.mjs'); console.log('evals:\n' + r.stdout + (r.status ? r.stderr.slice(-300) : '')); }
{ const r = run('tools/mcp/contract-check.mjs'); console.log('contract-check: ' + r.stdout.trim().split('\n').pop()); }

// ---- real Windows side
const { CLIENTS, detect, plan, apply, remove } = await import(pathToFileURL(path.join(ROOT, 'tools/mcp/clients.mjs')).href);
const WIN = '/mnt/c/Users/DDGCO';
const real = { platform: 'linux', home: WIN, appdata: WIN + '/AppData/Roaming', xdgConfig: WIN + '/AppData/Roaming' };
const ioFor = (rootMap) => ({
  exists: async (p) => fs.existsSync(rootMap(p)), read: async (p) => fs.readFileSync(rootMap(p), 'utf8'),
  write: async (p, s) => { fs.mkdirSync(path.dirname(rootMap(p)), { recursive: true }); fs.writeFileSync(rootMap(p), s); },
  rename: async (a, b) => fs.renameSync(rootMap(a), rootMap(b)), mkdirp: async (p) => fs.mkdirSync(rootMap(p), { recursive: true }),
  which: async (c) => { for (const d of (process.env.PATH || '').split(':')) { if (fs.existsSync(path.join(d, c))) return path.join(d, c); } return null; },
  run: async () => ({ code: 1, out: 'not run on the workstation' }),
});
// reads go to the real files; writes (mapped) go to tmp/copy/ so the real settings are never touched
const copyRoot = path.join(OUT, 'copy');
const readIo = ioFor((p) => p);
const copyMap = (p) => path.join(copyRoot, p.replace(/^\/+/, ''));
const writeIo = { ...ioFor(copyMap) };
console.log('\nDetected on this workstation (Windows side, read only):');
const rows = [];
for (const c of CLIENTS) {
  let d; try { d = await detect(c, real, readIo); } catch (e) { d = { found: false, why: String(e.message) }; }
  console.log('  ' + c.name.padEnd(20) + (d.found ? 'FOUND' : 'not found').padEnd(11) + (d.configured ? 'already connected ' : '') + (d.path || ''));
  rows.push({ c, d });
}
console.log('\nConnect / Disconnect on COPIES of the real settings files:');
for (const { c, d } of rows) {
  if (!d.found || c.format === 'cli' || !d.path) continue;
  const before = fs.existsSync(d.path) ? fs.readFileSync(d.path, 'utf8') : '';
  const cp = copyMap(d.path); fs.mkdirSync(path.dirname(cp), { recursive: true }); if (before) fs.writeFileSync(cp, before);
  // the copy io reads the copy (so the plan is made from the real content, written to the copy)
  const io = ioFor(copyMap);
  try {
    const p = await plan(c, real, io);
    const a = await apply(c, real, io);
    const after = fs.readFileSync(cp, 'utf8');
    const j = (t) => { try { return JSON.parse(t); } catch { return null; } };
    const others = c.format === 'json' && before.trim() ? Object.keys((j(before) || {})[c.key] || {}).every((k) => k === 'cadcraft' || (j(after)?.[c.key] || {})[k] !== undefined) : true;
    const r = await remove(c, real, io);
    const back = fs.readFileSync(cp, 'utf8');
    const same = c.format === 'json' && before.trim() ? JSON.stringify(j(back)) === JSON.stringify(j(before)) || JSON.stringify(Object.keys(j(back)?.[c.key] || {})) === JSON.stringify(Object.keys(j(before)?.[c.key] || {})) : true;
    console.log('  ' + c.name + ': plan ok, wrote ' + (a.path ? 'copy' : '?') + ', other servers kept: ' + others + ', disconnect restores the server list: ' + same + ', backup made: ' + !!a.backup + ', removed: ' + r.removed);
  } catch (e) { console.log('  ' + c.name + ': FAILED ' + e.message); }
}
console.log('\nreal settings files untouched: ' + rows.filter((r) => r.d.path && fs.existsSync(r.d.path)).map((r) => r.d.path.split('/').pop() + ' ' + fs.statSync(r.d.path).mtime.toISOString()).join(', '));
