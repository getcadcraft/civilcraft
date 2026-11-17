/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layer1-test.mjs — BK.78 "Layer 1 smart core" depth gate (0.10, session bim-core-10), DOM-free: node tools/bimcraft-test/core10-run.mjs --layer1
 * THE checklist, run on the small house (fixtures/bimcraft/small-house.ifc, BK.4; numbers worked by hand in make-small-house.mjs):
 *   1. wall types with layers   2. joins   3. hosted openings   4. rooms with areas   5. levels   6. grids
 * each read the way the 2D plan reads it (plan outlines and graphics, loops, grid axes) AND the way the 3D view reads it (the IFC through the
 * mesh engine: every wall, door, window and space is an element with triangles in a batch). Then the same model EDITED (a partition moved, a
 * wall lengthened through updateWall, a door and a window placed, one undo each) and read again in both: the 2D and 3D answers must agree
 * with each other and with the hand-worked numbers. The docs/0.10-sessions/bim-core-10.md log records the run.
 */
import path from 'node:path';
import fs from 'node:fs';
import { HOUSE as H } from './make-small-house.mjs';

export async function layer1Mode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol = 1) => Math.abs(a - b) <= tol;
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const MG = await import(path.join(APP, 'model-grids.js'));
  const { wallOutlines } = MW;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const open = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    return new IfcEditor(WebIFC, eng);
  };
  /** The 3D answer: the file read again through the mesh engine, element classes with triangles. */
  const view3d = async (ed) => {
    const im = await quiet(IfcModel.create)(WebIFC, null);
    const model = await quiet((b) => im.load(b))(ed.save());
    const tri = new Map();   // express id → triangles
    for (const b of model.batches) for (let r = 0; r < b.elems.ids.length; r++) tri.set(b.elems.ids[r], (tri.get(b.elems.ids[r]) || 0) + b.elems.tn[r]);
    const by = (re) => [...model.classOf].filter(([id, c]) => re.test(c) && (tri.get(id) || 0) > 0).length;
    return { walls: by(/^IfcWall/), doors: by(/^IfcDoor$/), windows: by(/^IfcWindow$/), spaces: by(/^IfcSpace$/), model, tri };
  };
  const read = (ed) => {
    const w = new ModelWriter(WebIFC, ed.api, ed.mid), snap = OPS.snapshotModel(ed), lvl = snap.levels[0];
    const outlines = wallOutlines(snap.walls.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t, bulge: x.bulge, off: x.joinOff })));
    const loops = OPS.loopsOf(ed, lvl.id);
    return { w, snap, lvl, outlines, rooms: (loops.rooms || []).map((r) => r.area).sort((a, b) => a - b), grids: MG.readGrids(w).flatMap((g) => g.axes), joins: MW.readJoinRecords(w) };
  };

  console.log('== BK.78 layer 1 on the small house, as the plan sees it (2D) and as the model builds it (3D)');
  const ed = await open(new Uint8Array(fs.readFileSync(path.join(ROOT, H.file))));
  let s = read(ed), v = await view3d(ed);
  // 1. wall types with layers
  const types = [...new Set(s.snap.walls.map((x) => x.typeKey))];
  const layered = types.map((k) => MW.wallType(k, s.w)).filter(Boolean);
  ok(layered.length === types.length && layered.every((t) => (t.layers || []).length >= 1 && MW.typeThickness(t) > 0), 'every wall type in use is readable and has layers with a thickness: ' + types.join(', '));
  ok(s.snap.walls.every((x) => near(x.t, MW.typeThickness(MW.wallType(x.typeKey, s.w)), 0.01)), '2D: each wall is as thick as its type\'s layers add up to (300 outside, 100 partition)');
  // 2. joins
  ok(s.joins.length >= 4 && s.joins.filter((j) => j.kind === 'L').length === 4 && s.joins.some((j) => j.kind === 'T'), '2D: the four corners are L joins and the partition ends are T joins (' + s.joins.map((j) => j.kind).join('') + ')');
  ok(s.snap.walls.every((x) => (s.outlines.get(x.guid) || []).length >= 4), '2D: every wall has a joined outline for the plan');
  // 3. hosted openings
  ok(s.snap.openings.length === 5 && s.snap.openings.every((o) => o.wallGuid && s.snap.walls.some((x) => x.guid === o.wallGuid)), '2D: two doors and three windows, each hosted by a wall that exists');
  // 4. rooms with areas
  ok(s.rooms.length === 2 && s.rooms.every((a) => near(a, H.roomArea, 2000)), '2D: two rooms of 32.16 m2 (worked by hand)', s.rooms.map((a) => (a / 1e6).toFixed(3)).join(', '));
  // 5. levels  6. grids
  ok(s.snap.levels.length === 1 && s.snap.walls.every((x) => x.storey === s.lvl.id) && near(s.lvl.elevation, 0, 0.5), '2D: one level, every wall on it');
  ok(s.grids.map((x) => x.tag).join() === H.grid.tags.join(), '2D: the grids 1 2 3 A B');
  // 3D answers for the same things
  ok(v.walls === 5 && v.doors === 2 && v.windows === 3 && v.spaces === 2, '3D: five walls, two doors, three windows and two spaces are elements with triangles', JSON.stringify([v.walls, v.doors, v.windows, v.spaces]));
  const wallBox = (guid) => { const id = new ModelWriter(WebIFC, ed.api, ed.mid).byGuid(guid); return id; };
  ok(s.snap.walls.every((x) => (v.tri.get(wallBox(x.guid)) || 0) >= 12), '3D: every wall has its own mesh (at least a box)');
  ok(v.model.storeys.length >= 1 && s.snap.walls.every((x) => v.model.storeyOf.get(wallBox(x.guid)) !== undefined), '3D: the storey holds every wall');

  console.log('== the same model edited: a partition moved 500, a wall lengthened through updateWall, a door and a window placed, undone one by one');
  const part = s.snap.walls.find((x) => x.typeKey === H.int.type), south = s.snap.walls.find((x) => x.typeKey === H.ext.type && near(x.a[1], 0) && near(x.b[1], 0));
  const n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: part.guid, dx: 500, dy: 0 }]), { label: 'Move' });
  s = read(ed); v = await view3d(ed);
  const half = (5000 + 500 - 150 - 50) * (7000 - 300), other = (10000 - 5000 - 500 - 150 - 50) * (7000 - 300);
  ok(s.rooms.length === 2 && near(s.rooms[0], Math.min(half, other), 4000) && near(s.rooms[1], Math.max(half, other), 4000), '2D: the rooms follow the partition: ' + s.rooms.map((a) => (a / 1e6).toFixed(2)).join(' and ') + ' m2 (hand: ' + (Math.min(half, other) / 1e6).toFixed(2) + ' and ' + (Math.max(half, other) / 1e6).toFixed(2) + ')');
  ok(s.snap.walls.length === 5 && s.joins.filter((j) => j.kind === 'T').length >= 2, '2D: the partition kept its two T joins');
  const door = s.snap.openings.find((o) => o.kind === 'door' && o.wallGuid === part.guid), was = part.a;
  ok(!!door && v.doors === 2 && v.windows === 3, '3D: both doors and all windows still build; the partition\'s door travelled with its wall');
  ok(near(s.snap.walls.find((x) => x.guid === part.guid).a[0], was[0] + 500) , '2D: the partition is at x = 5 500');
  ed.undo();
  s = read(ed);
  ok(near(s.rooms[0], H.roomArea, 2000) && near(s.rooms[1], H.roomArea, 2000) && ed.changes.length === n0, '2D: one undo and both rooms are 32.16 m2 again');
  // updateWall from outside the UI (BK.173): the south wall 500 longer, the east wall goes with it square
  const east = s.snap.walls.find((x) => x.typeKey === H.ext.type && near(x.a[0], 10000) && near(x.b[0], 10000));
  ed.modelChange(OPS.changeWall(south.guid, { b: [south.b[0] + 500, 0] }), { label: 'Lengthen' });
  s = read(ed);
  const e2 = s.snap.walls.find((x) => x.guid === east.guid);
  ok(near(e2.a[0], 10500) && near(e2.b[0], 10500), '2D: a wall lengthened through updateWall: the east wall moved square (x = 10 500 at both ends)', JSON.stringify([e2.a, e2.b]));
  ed.undo();
  // placing a door and a window
  const nb = ed.changes.length;
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'door-single', offset: 5000 }), { label: 'Door' });
  ed.modelChange(OPS.placeOpening({ wall: south.guid, typeKey: 'win-double-hung', offset: 9000 }), { label: 'Window' });
  s = read(ed); v = await view3d(ed);
  ok(s.snap.openings.length === 7 && v.doors === 3 && v.windows === 4, '2D and 3D agree: three doors and four windows after placing one of each', JSON.stringify([s.snap.openings.length, v.doors, v.windows]));
  ed.undo(); ed.undo();
  s = read(ed); v = await view3d(ed);
  ok(s.snap.openings.length === 5 && v.doors === 2 && v.windows === 3 && ed.changes.length === nb, 'two undos: back to two doors and three windows in 2D and 3D');
  console.log(bad ? `FAILED: ${bad}` : `layer 1 checklist: all ${good} passed`);
  return bad ? 1 : 0;
}
