/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --levelbelow` (0.9 DC.119, session bim-fix-09): "Add a level below": a new level under the lowest, at a negative
 * elevation, nothing else moves, walls and levels above keep their places, one undo step, redo makes the same level (same GlobalId), a second
 * one goes under the first, the saved IFC reopens with the negative elevations, and a wall can be drawn on the new level.
 */
import path from 'node:path';

export async function levelBelowMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const text = N.newBuilding({ name: 'Below', levels: N.stackLevels(3, 3000, (i) => 'Level ' + (i + 1)), fileName: 'b.ifc', now: new Date('2026-11-05T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: snap.levels[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: snap.levels[1].guid, extSide: 'right' }));
  snap = OPS.snapshotModel(ed);
  const before = snap.levels.map((l) => ({ guid: l.guid, e: l.elevation, h: l.height })), wallsBefore = JSON.stringify(snap.walls.map((w) => [w.guid, w.a, w.b, w.height, w.storey]));
  ok(near(snap.levels[0].elevation, 0), 'Level 1 is at 0: nothing lies below it');

  console.log('== Add a level below');
  const r = ed.modelChange(OPS.newLevelBelow({ height: 3000 }), { label: 'Add a level below', verb: 'Added' });
  snap = OPS.snapshotModel(ed);
  const low = snap.levels[0];
  ok(snap.levels.length === 4 && near(low.elevation, -3000) && near(low.height, 3000) && low.name === 'Level -1', 'four levels; the lowest is "Level -1" at -3000, 3000 tall: ' + low.name + ' ' + low.elevation);
  ok(before.every((b, i) => snap.levels[i + 1].guid === b.guid && near(snap.levels[i + 1].elevation, b.e) && near(snap.levels[i + 1].height, b.h)), 'the three levels above did not move');
  ok(JSON.stringify(snap.walls.map((w) => [w.guid, w.a, w.b, w.height, w.storey])) === wallsBefore, 'the walls are where they were');
  const g1 = low.guid;

  console.log('== Undo / redo');
  ed.undo();
  snap = OPS.snapshotModel(ed);
  ok(snap.levels.length === 3 && snap.levels.every((l, i) => near(l.elevation, before[i].e)), 'one Undo takes the level off');
  ed.redo();
  snap = OPS.snapshotModel(ed);
  ok(snap.levels.length === 4 && snap.levels[0].guid === g1 && near(snap.levels[0].elevation, -3000), 'Redo makes the same level (same GlobalId)');

  console.log('== A second one, a different height, and a wall on the new level');
  ed.modelChange(OPS.newLevelBelow({ height: 2500 }), { label: 'Add a level below', verb: 'Added' });
  snap = OPS.snapshotModel(ed);
  ok(snap.levels.length === 5 && snap.levels[0].name === 'Level -2' && near(snap.levels[0].elevation, -5500) && near(snap.levels[0].height, 2500) && near(snap.levels[1].elevation, -3000), 'the second goes under the first: "Level -2" at -5500, 2500 tall');
  const lv = snap.levels[1];
  ed.modelChange(OPS.drawWalls({ storey: lv.guid, segs: [{ a: [0, 0], b: [4000, 0] }], typeKey: 'ext-2x6', topLevel: snap.levels[2].guid, extSide: 'right' }));
  snap = OPS.snapshotModel(ed);
  const w = snap.walls.find((x) => x.storey === lv.id);
  ok(!!w && near(w.height, 3000), 'a wall drawn on Level -1 reaches Level 1 (3000)');

  console.log('== Saved and reopened');
  const bytes = ed.save();
  const e2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((x) => e2.load(x))(bytes);
  const ed2 = new IfcEditor(WebIFC, e2);
  const s2 = OPS.snapshotModel(ed2);
  ok(s2.levels.map((l) => Math.round(l.elevation)).join() === '-5500,-3000,0,3000,6000', 'the elevations after reopening: ' + s2.levels.map((l) => Math.round(l.elevation)).join());
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
