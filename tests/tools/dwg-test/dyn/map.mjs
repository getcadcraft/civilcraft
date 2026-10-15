/* SPDX-License-Identifier: Apache-2.0 */
/**
 * map.mjs — DB.1 spike: how dynamic blocks hang together in a DWG (definition → ACAD_ENHANCEDBLOCK graph, *U copies,
 * references and their AcDbBlockRepresentation data). Prints a tree per block and per reference.
 *   node tools/dwg-test/dyn/map.mjs [sample] [--refs n]
 */
import * as P from './probe-lib.mjs';

const name = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'blocks-and-tables-imperial';
const db = P.load(name, 'orig');
const H = P.byHandle(db), X = P.xdicOf(db);
const recOf = new Map(db.blocks.map((b) => [b.record, b]));
const show = (h, depth = 0, seen = new Set()) => {
  const o = H.get(h); const pad = '  '.repeat(depth + 1);
  if (!o) return console.log(pad + h + ' ?');
  if (seen.has(h)) return console.log(pad + h + ' (again)');
  seen.add(h);
  const t = P.typeOf(o);
  if (t === 'DICTIONARY' || t === 'ACDBDICTIONARYWDFLT') {
    console.log(pad + h + ' DICTIONARY');
    for (const [k, v] of Object.entries(o.entries || {})) { console.log(pad + '  "' + k + '" →'); show(v, depth + 2, seen); }
  } else if (t === 'XRECORD') console.log(pad + h + ' XRECORD ' + JSON.stringify(o.data).slice(0, 300));
  else {
    console.log(pad + h + ' ' + t + (o.raw ? ' (' + o.raw.n + ' bits, ' + o.raw.h.length + ' refs: ' + o.raw.h.map(([c, x]) => (H.get(x) ? P.typeOf(H.get(x)) : '?') + '@' + x).slice(0, 12).join(' ') + ')' : ''));
    const xd = X.get(h); if (xd && depth < 6) { console.log(pad + '  xdict:'); show(xd, depth + 2, seen); }
  }
};
for (const b of db.blocks) {
  const xd = X.get(b.record);
  if (!xd && !b.trueName) continue;
  console.log('\nBLOCK ' + b.name + (b.trueName ? ' (true name ' + b.trueName + ')' : '') + ' record ' + b.record + ' entities ' + b.entities.length);
  if (xd) show(xd);
}
const refs = +(process.argv[process.argv.indexOf('--refs') + 1] || 3);
let n = 0;
for (const b of [{ name: '*Model_Space', entities: db.entities || [] }, ...db.blocks]) for (const e of b.entities || []) {
  if (e.type !== 'INSERT' || !X.get(e.handle) || n >= refs) continue;
  n++;
  const blk = db.blocks.find((x) => x.name === e.block);
  console.log('\nINSERT ' + e.handle + ' in ' + b.name + ' → ' + e.block + (blk?.trueName ? ' (' + blk.trueName + ')' : ''));
  show(X.get(e.handle));
}
