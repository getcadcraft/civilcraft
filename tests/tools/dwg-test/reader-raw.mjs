/* SPDX-License-Identifier: Apache-2.0 */
// reader-raw.mjs — decode every object of a DWG and summarise record types / errors (builder R's check).
//   node tools/dwg-test/reader-raw.mjs file.dwg… [--type LINE] [--errors]
import fs from 'node:fs';
import { readDwg } from '../../lib/dwg/read.js';
const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
const typeArg = args.includes('--type') ? args[args.indexOf('--type') + 1] : null;
const showErr = args.includes('--errors');
for (const f of files) {
  if (f === typeArg) continue;
  const m = readDwg(new Uint8Array(fs.readFileSync(f)), { raw: true });
  const recs = m._records || new Map();
  const byType = {};
  for (const r of recs.values()) {
    const t = byType[r.type] || (byType[r.type] = { n: 0, err: 0, unk: 0, left: 0 });
    t.n++; if (r._error) t.err++; if (r._unknown) t.unk++;
    if (!r._unknown && !r._error && r._dataLeft > 7) t.left++;
  }
  console.log(f.split('/').pop(), m.version, m.report.ms + 'ms', 'objects', recs.size, m.report.error || '');
  for (const n of m.report.notes.slice(0, 15)) console.log('  NOTE', n);
  for (const [t, v] of Object.entries(byType).sort((a, b) => b[1].n - a[1].n)) {
    if (v.err || v.left || !v.unk) console.log('   ', t.padEnd(28), v.n, v.err ? 'ERR ' + v.err : '', v.left ? 'LEFT ' + v.left : '', v.unk ? 'unknown' : '');
  }
  const unk = Object.entries(byType).filter(([, v]) => v.unk).map(([t, v]) => t + ':' + v.n);
  if (unk.length) console.log('    not decoded:', unk.join(' '));
  if (showErr) for (const r of recs.values()) if ((r._error || r._dataLeft > 7) && (!typeArg || r.type === typeArg)) console.log('     ', r.type, r.handle.toString(16), r._error || '', 'left', r._dataLeft);
  if (typeArg) for (const r of recs.values()) if (r.type === typeArg) { const o = { ...r }; delete o.preview; console.log(JSON.stringify(o)); break; }
}
