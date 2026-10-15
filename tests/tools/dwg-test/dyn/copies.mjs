/* SPDX-License-Identifier: Apache-2.0 */
/**
 * copies.mjs — DB.1 spike: check, on every reference to a dynamic block with a visibility parameter, that its block
 * (the definition itself, or a *B/*U copy) has the definition's entities in the same order (same types), and that the
 * entities shown (not flagged invisible) are exactly the state the reference's XRECORD names.
 *   node tools/dwg-test/dyn/copies.mjs [sample]
 */
import * as P from './probe-lib.mjs';

const name = process.argv[2] || 'blocks-and-tables-imperial';
const db = P.load(name, 'orig');
const H = P.byHandle(db), X = P.xdicOf(db);
const dict = (h) => H.get(h)?.entries || {};
let ok = 0, bad = 0;
for (const b of [{ name: '*Model_Space', entities: db.entities || [] }, ...db.blocks]) for (const e of b.entities || []) {
  if (e.type !== 'INSERT') continue;
  const blk = db.blocks.find((x) => x.name === e.block);
  const rep = dict(dict(X.get(e.handle)).AcDbBlockRepresentation);
  const defRec = H.get(rep.AcDbRepData)?.raw?.h?.[0]?.[1] || (dict(X.get(blk?.record)).ACAD_ENHANCEDBLOCK ? blk.record : null);
  const def = db.blocks.find((x) => x.record === defRec);
  const g = def && H.get(dict(X.get(def.record)).ACAD_ENHANCEDBLOCK);
  if (!g) continue;
  const visO = [...P.graphNodes(g).entries()].map(([id, h]) => [id, H.get(h)]).find(([, o]) => o && P.typeOf(o) === 'BLOCKVISIBILITYPARAMETER');
  if (!visO) continue;
  const vis = P.visibility(visO[1]);
  const xr = H.get(dict(dict(rep.AppDataCache).ACAD_ENHANCEDBLOCKDATA)[String(visO[0])]);
  const stateName = xr ? xr.data.find(([c]) => c === 1)?.[1] : null;
  const st = vis.states.find((s) => s.name === stateName) || (stateName === null ? null : undefined);
  const same = blk.entities.length === def.entities.length && blk.entities.every((x, i) => x.type === def.entities[i].type);
  const shown = blk.entities.map((x, i) => (x.invisible ? null : def.entities[i].handle)).filter(Boolean).sort().join();
  const want = st ? [...st.entities].sort().join() : def.entities.filter((x) => !x.invisible).map((x) => x.handle).sort().join();
  const good = same && shown === want;
  good ? ok++ : bad++;
  if (!good || process.argv.includes('--verbose')) console.log((good ? 'ok   ' : 'BAD  ') + e.handle + ' → ' + e.block + ' (' + (def.trueName || def.name) + ') state ' + (stateName ?? '(definition as saved)') + (same ? '' : ' [entities differ]') + (shown === want ? '' : ' [shown ' + shown + ' want ' + want + ']'));
}
console.log(ok + ' references match, ' + bad + ' do not');
