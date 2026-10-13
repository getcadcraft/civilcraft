/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tables-probe.mjs — builder T's decoding probe: for every table-related record of each file, the bits the
 * decoder left in the data stream (`left`) and in the handle stream (`hleft`), and any error.
 *   node tools/dwg-test/tables-probe.mjs <file.dwg|dir>… [--types ACAD_TABLE,TABLESTYLE] [--show]
 */
import fs from 'node:fs';
import path from 'node:path';
import { readDwg } from '../../lib/dwg/index.js';

const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args.splice(i, 2)[1] : null; };
const types = new Set((opt('--types') || 'ACAD_TABLE,TABLESTYLE,CELLSTYLEMAP,TABLECONTENT,TABLEGEOMETRY,FIELD,FIELDLIST').split(','));
const show = args.includes('--show'); if (show) args.splice(args.indexOf('--show'), 1);
const files = args.flatMap((a) => (fs.statSync(a).isDirectory() ? fs.readdirSync(a).filter((f) => f.endsWith('.dwg')).map((f) => path.join(a, f)) : [a]));
for (const f of files) {
  const m = readDwg(new Uint8Array(fs.readFileSync(f)), { raw: true });
  const tally = {};
  for (const r of m._records.values()) {
    if (!types.has(r.type)) continue;
    const k = r.type, t = tally[k] || (tally[k] = { n: 0, bad: 0, ex: [] });
    t.n++;
    const ok = !r._error && (r._dataLeft === 0 || (r._dataLeft === 1 && m.version >= "AC1021")) && (r._hLeft === undefined || r._hLeft < 8);
    if (!ok) { t.bad++; if (t.ex.length < 3) t.ex.push(`${r.handle.toString(16)} left=${r._dataLeft} hleft=${r._hLeft} ${r._error || ''}`); }
    if (show) console.log(JSON.stringify(r, (key, v) => (key === '_records' ? undefined : v)).slice(0, 4000));
  }
  console.log(path.basename(path.dirname(f)) + '/' + path.basename(f), JSON.stringify(tally));
}
