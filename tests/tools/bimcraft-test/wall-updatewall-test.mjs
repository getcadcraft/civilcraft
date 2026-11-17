/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-updatewall-test.mjs — 0.10 BK.173 (bim-core-10): updateWall called from outside the UI (the assistant, the API) moves ONE end of a
 * wall along its own line and the wall joined there moves square, keeping its angle (the join solver's setLength), as a typed length or a
 * grip drag does. DOM-free:   node tools/bimcraft-test/core10-run.mjs --updatewall
 */
import path from 'node:path';

export async function updateWallMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const text = N.newBuilding({ name: 'UpdateWall', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'u.ifc', now: new Date('2026-11-13T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  const walls = () => MW.readWalls(W());
  const by = (g) => walls().find((x) => x.guid === g);
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'int-2x4', height: 2700 }));
  const [s, e, n, wv] = walls();

  console.log('== BK.173: the south wall lengthened 500 through changeWall (a non-UI caller)');
  ed.modelChange(OPS.changeWall(s.guid, { b: [5500, 0] }), { label: 'Lengthen' });
  ok(near(by(s.guid).b[0], 5500) && near(by(s.guid).b[1], 0), 'the wall ends where it was told to');
  const E = by(e.guid);
  ok(near(E.a[0], 5500) && near(E.b[0], 5500), 'the east wall moved square: both its ends are at x = 5500, it did not swing', JSON.stringify([E.a, E.b]));
  ok(near(E.a[1], 0) && near(E.b[1], 4000), 'its length along the line is the same');
  ok(near(by(n.guid).a[0], 5500) && near(by(n.guid).b[0], 0), 'the north wall followed to the new corner');
  ed.undo();
  ok(near(by(e.guid).a[0], 5000) && near(by(e.guid).b[0], 5000), 'undo puts it back');

  console.log('== the start end shortened 300 (the other end)');
  ed.modelChange(OPS.changeWall(s.guid, { a: [300, 0] }), { label: 'Shorten' });
  const V = by(wv.guid);
  ok(near(by(s.guid).a[0], 300) && near(V.a[0], 300) && near(V.b[0], 300), 'the west wall moved square to x = 300', JSON.stringify([V.a, V.b]));
  ed.undo();

  console.log('== an end moved off its line keeps the old carry (a turn was asked for)');
  ed.modelChange(OPS.changeWall(s.guid, { b: [5000, 300] }), { label: 'Turn' });
  ok(near(by(e.guid).a[1], 300), 'the joined end follows the corner');
  ed.undo();
  console.log(bad ? `FAILED: ${bad}` : 'updateWall: all passed');
  return bad ? 1 : 0;
}
