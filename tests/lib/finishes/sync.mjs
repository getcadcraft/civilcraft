#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sync.mjs: lib/finishes/ (the wall finishes' rules, 0.10 BK.25-28 / BK.130, session bim-finishes-10) is canonical; each host carries a byte-identical
 * copy in <app>/dev/finishes/lib/ (nobody edits a copy). Run it after every change to lib/finishes:
 *   node lib/finishes/sync.mjs [--check] bimcraft
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(LIB, '../..');
const HOSTS = ['bimcraft'];
const args = process.argv.slice(2), check = args.includes('--check'), names = args.filter((a) => !a.startsWith('--'));
if (!names.length) { console.error('Name the host: node lib/finishes/sync.mjs [--check] bimcraft'); process.exit(1); }
let diff = 0;
for (const name of names) {
  if (!HOSTS.includes(name)) { console.error(name + ': not a host (' + HOSTS.join(', ') + ')'); diff++; continue; }
  const dir = path.join(ROOT, 'public_html/assets/apps', name, 'dev/finishes/lib');
  if (!check) fs.mkdirSync(dir, { recursive: true });
  const want = fs.readdirSync(LIB).filter((f) => f.endsWith('.js'));
  for (const n of want) {
    const src = fs.readFileSync(path.join(LIB, n)), to = path.join(dir, n);
    if (fs.existsSync(to) && fs.readFileSync(to).equals(src)) continue;
    diff++;
    console.log((check ? 'differs: ' : 'copied: ') + name + '/dev/finishes/lib/' + n);
    if (!check) fs.writeFileSync(to, src);
  }
  if (fs.existsSync(dir)) for (const n of fs.readdirSync(dir)) if (n.endsWith('.js') && !want.includes(n)) { diff++; console.log((check ? 'stale: ' : 'removed: ') + name + '/dev/finishes/lib/' + n); if (!check) fs.rmSync(path.join(dir, n)); }
}
console.log(diff ? (check ? diff + ' differ' : diff + ' changed') : 'in sync');
process.exit(check && diff ? 1 : 0);
