/* SPDX-License-Identifier: Apache-2.0 */
// reader-notes.mjs — read every corpus file, print time, object/entity counts, unknown types and notes (builder R).
//   node tools/dwg-test/reader-notes.mjs [file|dir …]
import fs from 'node:fs';
import path from 'node:path';
import { readDwg } from '../../lib/dwg/index.js';
const TF = '/var/www/CADCRAFT/testfiles';
const files = [];
const walk = (p) => { if (!fs.existsSync(p)) return; if (fs.statSync(p).isDirectory()) for (const f of fs.readdirSync(p).sort()) walk(path.join(p, f)); else if (/\.dwg$/i.test(p)) files.push(p); };
const args = process.argv.slice(2);
if (args.length) args.forEach(walk); else [path.join(TF, 'dwg-samples'), path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../fixtures'), path.join(TF, 'dwg-corpus')].forEach((d) => walk(d));
let worst = 0;
for (const f of files) {
  const b = new Uint8Array(fs.readFileSync(f));
  const t = performance.now();
  let m;
  try { m = readDwg(b); } catch (e) { console.log('THREW', f, e.stack); continue; }
  const ms = performance.now() - t;
  worst = Math.max(worst, ms);
  const ents = m.blocks.reduce((n, x) => n + x.entities.length, 0);
  console.log(`${path.relative(TF, f)}  ${m.version}  ${(b.length / 1e6).toFixed(2)} MB  ${ms.toFixed(0)} ms  objects ${m.report.objects ?? 0}  entities ${ents}  layouts ${m.layouts.length}  unknown ${Object.entries(m.report.unknown).map(([k, v]) => k + ':' + v).join(' ')}`);
  for (const n of m.report.notes) console.log('    note:', n);
}
console.log('slowest', worst.toFixed(0), 'ms');
