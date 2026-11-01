/* SPDX-License-Identifier: Apache-2.0 */
/**
 * modify-test.mjs — Move, Copy, Align and Distribute (0.8 D8.3, session bim-08), DOM-free, run by
 *   node bin/test-bimcraft.mjs --modify
 * Walls (with their doors), columns, a drawn floor: moved by a vector, copied, aligned and distributed; one undo step each.
 */
import path from 'node:path';

export async function modifyMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MO = await import(path.join(APP, 'model-openings.js'));
  const MC = await import(path.join(APP, 'model-columns.js'));
  const MF = await import(path.join(APP, 'model-floors.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const text = N.newBuilding({ name: 'Modify', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'm.ifc', now: new Date('2026-10-27T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [4000, 0] }, { a: [4000, 0], b: [4000, 3000] }, { a: [4000, 3000], b: [0, 3000] }, { a: [0, 3000], b: [0, 0] }], typeKey: 'int-2x4', height: 2700 }));
  const walls = () => MW.readWalls(W());
  const [w0, w1, w2, w3] = walls();
  ed.modelChange(OPS.placeOpening({ wall: w0.guid, typeKey: 'door-single', offset: 1000, width: 900 }));
  ed.modelChange(MC.placeColumns({ storey: L1.guid, points: [[500, 500], [1500, 500], [3500, 500]], width: 300, depth: 300 }));
  ed.modelChange(MF.placeDrawnFloor({ storey: L1.guid, points: [[0, 0], [2000, 0], [2000, 2000], [0, 2000]], kind: 'concrete' }));
  const doorWorld = () => { const o = MO.readOpenings(W())[0], wl = walls().find((x) => x.guid === o.wallGuid); const L = Math.hypot(wl.b[0] - wl.a[0], wl.b[1] - wl.a[1]); return [wl.a[0] + (wl.b[0] - wl.a[0]) / L * (o.offset + o.width / 2), wl.a[1] + (wl.b[1] - wl.a[1]) / L * (o.offset + o.width / 2)]; };
  const d0 = doorWorld();

  // 1. move: a wall with its door
  let n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: w0.guid, dx: 250, dy: -400 }]), { label: 'Move' });
  const m0 = walls().find((x) => x.guid === w0.guid), d1 = doorWorld();
  ok(ed.changes.length === n0 + 1, 'Move is one undo step');
  ok(near(m0.a[0], 250) && near(m0.a[1], -400) && near(m0.b[0], 4250) && near(m0.b[1], -400), 'the wall moved by the vector, its length unchanged');
  ok(near(d1[0] - d0[0], 250) && near(d1[1] - d0[1], -400), 'its door travelled with it');
  ok(walls().filter((x) => x.guid !== w0.guid).every((x, i) => [w1, w2, w3][i].a.every((v, k) => near(v, x.a[k]))), 'the other walls stayed (no joined walls carried)');
  ed.undo();
  ok(near(walls().find((x) => x.guid === w0.guid).a[0], 0) && near(doorWorld()[0], d0[0]), 'undo: wall and door back');
  ed.redo();
  ok(near(walls().find((x) => x.guid === w0.guid).a[0], 250), 'redo: moved again');
  ed.undo();

  // 2. columns and the floor move; several kinds in one change
  const cols = MC.readColumns(W()), fl = MF.readDrawnFloors(W())[0];
  n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: cols[0].guid, dx: 100, dy: 200 }, { guid: fl.guid, dx: 1000, dy: 500 }, { guid: w2.guid, dx: 0, dy: 300 }]));
  ok(ed.changes.length === n0 + 1, 'a column, a floor and a wall together: one step');
  const c1 = MC.readColumns(W()).find((x) => x.guid === cols[0].guid), f1 = MF.readDrawnFloors(W())[0];
  ok(near(c1.at[0], 600) && near(c1.at[1], 700), 'column moved');
  ok(f1.points.every((p, i) => near(p[0], fl.points[i][0] + 1000) && near(p[1], fl.points[i][1] + 500)), 'floor moved');
  ed.undo();

  // 3. copy
  n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: w0.guid, dx: 0, dy: 1500 }, { guid: cols[1].guid, dx: 0, dy: 900 }, { guid: fl.guid, dx: 3000, dy: 0 }], { copy: true }));
  const after = walls();
  ok(ed.changes.length === n0 + 1 && after.length === 5 && MC.readColumns(W()).length === 4 && MF.readDrawnFloors(W()).length === 2, 'Copy: one step, a new wall, column and floor; the originals stay');
  ok(MO.readOpenings(W()).length === 2, 'the copied wall carries its door');
  const cp = after.find((x) => !([w0, w1, w2, w3].some((o) => o.guid === x.guid)));
  ok(cp && near(cp.a[1], 1500) && near(cp.b[0], 4000), 'the copy is where the vector says');
  ed.undo();
  ok(walls().length === 4 && MC.readColumns(W()).length === 3, 'undo removes the copies');

  // 4. align and distribute
  const list = MM.movables(W()).filter((e) => e.kind === 'column');
  const al = MM.alignMoves(list, { side: 'bottom', to: 'selection' });
  ok(al.size === 0, 'columns already on one line: nothing to align');
  const lc = MM.alignMoves(list, { side: 'left', to: 'last' });
  ok(near(lc.get(list[0].guid)[0], 3500 - 500) && !lc.has(list[2].guid), 'align left to the last picked');
  const ds = MM.distributeMoves(list, { axis: 'h', mode: 'centers' });
  ok(near(ds.get(list[1].guid)[0], 500) && ds.size === 1, 'distribute centres: the middle column goes from 1500 to 2000 (equal steps)');
  const ds2 = MM.distributeMoves(list.slice(0, 2), { axis: 'h' });
  ok(ds2.size === 0, 'fewer than three: nothing');
  n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([...ds].map(([guid, v]) => ({ guid, dx: v[0], dy: v[1] }))));
  const xs = MC.readColumns(W()).map((c) => c.at[0]).sort((a, b) => a - b);
  ok(near(xs[1] - xs[0], xs[2] - xs[1]) && ed.changes.length === n0 + 1, 'applied: equal steps, one undo step');

  // 5. refusals
  let err = null;
  try { ed.modelChange(MM.moveElements([{ guid: 'nope', dx: 1, dy: 1 }])); } catch (e) { err = e; }
  ok(err && err.key === 'model.move.err.kind', 'an unknown element is refused');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
