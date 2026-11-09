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
  // 0.9 FX.62 (wall tool spec rules 2 and 3): the wall is joined at both ends, so it moves square to itself (the part of the drag along
  // its own line is dropped) and the walls joined to it follow, keeping their direction; the wall across the room is not touched
  ok(near(m0.a[0], 0) && near(m0.a[1], -400) && near(m0.b[0], 4000) && near(m0.b[1], -400), 'the wall moved 400 square to itself, its corners slide');
  ok(near(d1[0] - d0[0], 0) && near(d1[1] - d0[1], -400), 'its door travelled with it');
  const [m1, m2, m3] = [w1, w2, w3].map((o) => walls().find((x) => x.guid === o.guid));
  ok(near(m1.a[0], 4000) && near(m1.a[1], -400) && near(m1.b[0], 4000) && near(m1.b[1], 3000), 'the joined wall on the right stretched and stayed at 90');
  ok(near(m3.b[0], 0) && near(m3.b[1], -400) && near(m3.a[1], 3000), 'the joined wall on the left too');
  ok(m2.a.every((v, k) => near(v, w2.a[k])) && m2.b.every((v, k) => near(v, w2.b[k])), 'the wall across the room stayed');
  ed.undo();
  ok(near(walls().find((x) => x.guid === w0.guid).a[0], 0) && near(doorWorld()[0], d0[0]), 'undo: wall and door back');
  ed.redo();
  ok(near(walls().find((x) => x.guid === w0.guid).a[1], -400) && near(walls().find((x) => x.guid === w1.guid).a[1], -400), 'redo: moved again, the neighbours with it');
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

  // 4b. a stair (an L with winders) moves by a vector, as one undo step; the whole stair incl. its parts is what Move reports
  const ST = await import(path.join(APP, 'res-stair.js'));
  ed.modelChange(ST.placeStair({ level: L1.guid, start: [1000, 1000], angle: 0, kind: 'winder', turn: 'left', width: 1000, riserMax: 180, tread: 280, railings: 'both' }));
  const s0 = ST.readStairs(W())[0], mv = MM.movables(W()).find((e) => e.kind === 'stair');
  ok(mv && mv.guid === s0.guid && mv.ids.includes(s0.id), 'the stair is something Move can work on (its parts count as the stair)');
  n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: s0.guid, dx: 500, dy: -250 }]), { label: 'Move' });
  const s1 = ST.readStairs(W())[0];
  ok(ed.changes.length === n0 + 1 && near(s1.start[0], 1500) && near(s1.start[1], 750) && s1.parts.length === s0.parts.length, 'Move: the stair starts 500 / -250 away, same parts, one undo step');
  ed.undo();
  ok(near(ST.readStairs(W())[0].start[0], 1000), 'undo: the stair is back');

  // 4c. every other placed kind moves too: a ramp, a railing, a roof plane, a free-standing device
  const RPm = await import(path.join(APP, 'model-ramps.js')), RLm = await import(path.join(APP, 'res-railing.js')), RFm = await import(path.join(APP, 'res-roofplane.js')), ELm = await import(path.join(APP, 'res-elec.js'));
  ed.modelChange(RPm.placeRamp({ storey: L1.guid, start: [8000, 0], angle: 90, rise: 600, width: 1200 }));
  ed.modelChange(RLm.placeRailing({ level: L1.guid, points: [[1000, 2000], [3000, 2000]], kind: 'guard' }));
  ed.modelChange(RFm.placeRoofPlane({ level: L1.guid, points: [[0, 0], [2000, 0], [2000, 2000], [0, 2000]], pitch: 20, base: 2700 }));
  ed.modelChange(ELm.placeDevice({ level: L1.guid, kind: 'downlight', units: 'mm', at: [1500, 1500], angle: 0, circuit: '1' }));
  const kinds = new Map(MM.movables(W()).map((e) => [e.kind, e]));
  for (const k of ['ramp', 'railing', 'roofplane', 'device']) ok(kinds.has(k), k + ' is something Move can work on');
  const before = { ramp: RPm.readRamps(W())[0].start, rail: RLm.readRailings(W())[0].points[0], roof: RFm.readRoofPlanes(W())[0].points[0], dev: ELm.readDevices(W())[0]?.at };
  n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([...kinds.values()].filter((e) => ['ramp', 'railing', 'roofplane', 'device'].includes(e.kind)).map((e) => ({ guid: e.guid, dx: 300, dy: 200 }))), { label: 'Move' });
  ok(ed.changes.length === n0 + 1, 'a ramp, railing, roof plane and device together: one undo step');
  const aft = { ramp: RPm.readRamps(W())[0].start, rail: RLm.readRailings(W())[0].points[0], roof: RFm.readRoofPlanes(W())[0].points[0], dev: ELm.readDevices(W())[0]?.at };
  ok(near(aft.ramp[0], before.ramp[0] + 300) && near(aft.ramp[1], before.ramp[1] + 200), 'ramp moved');
  ok(near(aft.rail[0], before.rail[0] + 300) && near(aft.rail[1], before.rail[1] + 200), 'railing moved');
  ok(near(aft.roof[0], before.roof[0] + 300) && near(aft.roof[1], before.roof[1] + 200), 'roof plane moved');
  ok(aft.dev && near(aft.dev[0], before.dev[0] + 300) && near(aft.dev[1], before.dev[1] + 200), 'device moved');
  ed.undo();
  ok(near(RPm.readRamps(W())[0].start[0], before.ramp[0]), 'undo: back where they were');

  // 5. refusals
  let err = null;
  try { ed.modelChange(MM.moveElements([{ guid: 'nope', dx: 1, dy: 1 }])); } catch (e) { err = e; }
  ok(err && err.key === 'model.move.err.kind', 'an unknown element is refused');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
