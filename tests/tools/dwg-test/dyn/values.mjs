/* SPDX-License-Identifier: Apache-2.0 */
/**
 * values.mjs — DB.1 spike: per parameter type, the shape of a reference's current values (the XRECORDs under
 * INSERT xdict → AcDbBlockRepresentation → AppDataCache → ACAD_ENHANCEDBLOCKDATA, keyed by the graph's node id).
 *   node tools/dwg-test/dyn/values.mjs [sample]
 */
import * as P from './probe-lib.mjs';
const { graphNodes } = P;

const name = process.argv[2] || 'blocks-and-tables-imperial';
const db = P.load(name, 'orig');
const H = P.byHandle(db), X = P.xdicOf(db);
const dict = (h) => { const o = H.get(h); return o && o.entries ? o.entries : {}; };
const shapes = new Map();
for (const b of [{ name: '*Model_Space', entities: db.entities || [] }, ...db.blocks]) for (const e of b.entities || []) {
  if (e.type !== 'INSERT' || !X.get(e.handle)) continue;
  const rep = dict(dict(X.get(e.handle)).AcDbBlockRepresentation || '');
  const def = H.get(rep.AcDbRepData)?.raw?.h?.[0]?.[1];
  const defBlk = db.blocks.find((x) => x.record === def);
  const g = defBlk && H.get(dict(X.get(def)).ACAD_ENHANCEDBLOCK);
  if (!g) continue;
  const nodes = graphNodes(g);
  const vals = dict(dict(rep.AppDataCache || '').ACAD_ENHANCEDBLOCKDATA || '');
  for (const [k, xh] of Object.entries(vals)) {
    const t = P.typeOf(H.get(nodes.get(+k)) || {});
    const x = H.get(xh);
    const sh = (x?.data || []).map(([c]) => c).join(',');
    const key = t + ' [' + sh + ']';
    if (!shapes.has(key)) shapes.set(key, { n: 0, ex: (defBlk.trueName || defBlk.name) + ': ' + JSON.stringify(x?.data) });
    shapes.get(key).n++;
  }
}
for (const [k, v] of shapes) console.log(k, '×' + v.n, '\n   e.g. ' + v.ex.slice(0, 300));
