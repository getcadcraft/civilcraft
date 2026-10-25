/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --copylevel` (0.7 SU.461, session bim-07): a level's drawing copied to another level or to a new one on top.
 * Walls with their doors and windows, floors and ceilings: types, heights, openings' places, rooms made by themselves, one undo step,
 * redo makes the same thing, a refusal for the same level or an empty one, the saved IFC reopened.
 */
import path from 'node:path';

export async function copyLevelMode({ APP, WebIFC, IfcModel, quiet }) {
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  let bad = 0;
  const ok = (cond, label) => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const text = N.newBuilding({ name: 'Copy', levels: N.stackLevels(3, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-10-23T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const [A, B, C] = snap.levels.map((l) => l.guid), [a, b, c] = snap.levels.map((l) => l.id);
  const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: A, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: B, extSide: 'right' }));
  ed.modelChange(OPS.drawWalls({ storey: A, segs: [{ a: [4000, 0], b: [4000, 5000] }], typeKey: 'int-2x4', topLevel: B }));
  snap = OPS.snapshotModel(ed);
  const south = snap.walls.find((w) => w.a[1] === 0 && w.b[1] === 0 && w.typeKey === 'ext-2x6');
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 1000, face: 'left' }));
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 5500, face: 'right' }));
  const spaces1 = OPS.snapshotModel(ed).derived.spaces.filter((x) => x.storey === a);
  ed.modelChange(OPS.placeFloor({ storey: A, seed: [2000, 2500], mode: 'room', kind: 'wood' }));
  ed.modelChange(OPS.placeCeiling({ storey: A, seed: [2000, 2500], mode: 'room', height: 2700 }));
  ok(spaces1.length === 2, 'Level 1 drawn: four walls, a partition, a door, a window, a floor, a ceiling; two rooms');

  console.log('== Copy Level 1 to Level 2');
  const r = ed.modelChange(OPS.copyLevel({ from: A, to: B }), { label: 'Level 1', verb: 'Copied' });
  snap = OPS.snapshotModel(ed);
  const on = (lv) => snap.walls.filter((w) => w.storey === lv);
  ok(on(b).length === 5 && on(a).length === 5, 'five walls on Level 2, five still on Level 1');
  ok(on(b).filter((w) => w.typeKey === 'ext-2x6').length === 4 && on(b).filter((w) => w.typeKey === 'int-2x4').length === 1, 'the same types: four exterior, one partition');
  ok(on(b).every((w) => near(w.height, 3000) && w.topLevel === C), 'their tops follow Level 3, the level above Level 2 (as Level 1\'s followed Level 2)');
  ok(on(b).map((w) => w.a.join() + '>' + w.b.join()).sort().join('|') === on(a).map((w) => w.a.join() + '>' + w.b.join()).sort().join('|'), 'on the same lines');
  ok(new Set(snap.walls.map((w) => w.guid)).size === 10, 'ten different GlobalIds');
  const ops2 = snap.openings.filter((o) => o.storey === b), ops1 = snap.openings.filter((o) => o.storey === a);
  ok(ops2.length === 2 && ops2.map((o) => o.kind + o.offset).sort().join() === ops1.map((o) => o.kind + o.offset).sort().join() && ops2.every((o) => on(b).some((w) => w.guid === o.wallGuid)), 'the door and the window are in the copied wall at the same places');
  const D = snap.derived;
  ok(D.spaces.filter((x) => x.storey === b).length === 2 && D.floors.filter((x) => x.storey === b).length === 1 && D.ceilings.filter((x) => x.storey === b).length === 1, 'two rooms, the floor and the ceiling made on Level 2');
  ok(r.counts.walls === 5 && r.counts.openings === 2 && r.counts.floors === 1 && r.counts.ceilings === 1, 'the counts: ' + JSON.stringify(r.counts));
  const guids1 = on(b).map((w) => w.guid).sort().join(), openGuids1 = ops2.map((o) => o.guid).sort().join();
  ed.undo();
  snap = OPS.snapshotModel(ed);
  ok(snap.walls.length === 5 && snap.openings.length === 2 && snap.derived.spaces.filter((x) => x.storey === b).length === 0, 'one Undo takes all of it off Level 2 again');
  ed.redo();
  snap = OPS.snapshotModel(ed);
  ok(snap.walls.filter((w) => w.storey === b).map((w) => w.guid).sort().join() === guids1 && snap.openings.filter((o) => o.storey === b).map((o) => o.guid).sort().join() === openGuids1, 'Redo makes the same elements (the same GlobalIds)');

  console.log('== Copy to a new level on top');
  const r2 = ed.modelChange(OPS.copyLevel({ from: B, to: null, newLevel: { name: 'Level 4', elevation: 9000, height: 3000 } }), { label: 'Level 2', verb: 'Copied' });
  snap = OPS.snapshotModel(ed);
  const L4 = snap.levels.find((l) => l.name === 'Level 4');
  const w4 = snap.walls.filter((w) => w.storey === L4.id);
  ok(snap.levels.length === 4 && w4.length === 5 && w4.every((w) => near(w.height, 3000) && !w.topLevel), 'Level 4 made with five walls; there is no level above it, so a fixed height (3000)');
  ok(snap.openings.filter((o) => o.storey === L4.id).length === 2, 'and its door and window');
  ed.undo();
  snap = OPS.snapshotModel(ed);
  ok(snap.levels.length === 3, 'one Undo takes the level away with its walls');

  console.log('== Refusals');
  const fail = (fn) => { try { ed.modelChange(fn()); return ''; } catch (e) { return e.key || e.message; } };
  ok(fail(() => OPS.copyLevel({ from: A, to: A })) === 'model.err.copysame', 'the same level: "pick another level"');
  ok(fail(() => OPS.copyLevel({ from: C, to: A })) === 'model.err.copynone', 'a level with nothing drawn: refused');
  console.log('== Saved and reopened');
  const bytes = ed.save();
  const e2 = await quiet(IfcModel.create)(WebIFC, null);
  const m2 = await quiet((x) => e2.load(x))(bytes);
  ok(m2.types.find((t) => t.name === 'IfcWall')?.count === 10 && m2.types.find((t) => t.name === 'IfcDoor')?.count === 2, 'cc-ifc reopens ten walls and two doors');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
