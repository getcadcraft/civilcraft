#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * furnish08.mjs — EG.60's ModelCraft side (0.8 round 3, model_PART_3): a 4 × 5 m floor face (and the same room inside a moved, turned group),
 * a starter door in its wall, furnished as a bedroom with the shared planner (lib/furnish) and the starter library's furniture: each piece
 * stands on the floor, inside the room, on the planner's footprint, nothing overlapping, the door's swing free; one group on the Furniture
 * tag, one undo step; a wall face is refused; the size guess says it guessed.
 *   node tools/modelcraft-test/furnish08.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/');
const load = (f) => import(pathToFileURL(D + f).href);
const F = await load('furnish-mc.js'), M = await load('model.js'), S = await load('starter.js'), P = await load('furnish.js'), V = await load('vec.js');
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

function room(m, at = [0, 0, 0]) {
  return m.change('floor', (mm) => { M.addPolygon(mm.root, [[at[0], at[1], at[2]], [at[0] + 4, at[1], at[2]], [at[0] + 4, at[1] + 5, at[2]], [at[0], at[1] + 5, at[2]]], [0, 0, 1]); return [...mm.root.faces.keys()].at(-1); });
}
const opts = (m) => ({ names: { group: 'Furniture: bedroom', tag: 'Furniture' }, buildStarter: S.buildStarter, starterName: (id) => id, footprint: P.footprint });

// 1. a floor at the origin, a starter door in the south wall (its middle at x = 2 m)
const m = new M.Model();
const fid = room(m);
m.change('door', (mm) => { const d = S.buildStarter(mm, 'door', 'Door'); d.starter = 'door'; const bb = mm.bbox(d); mm.place(mm.root, d.id, V.translation([2 - (bb.min[0] + bb.max[0]) / 2, -(bb.min[1] + bb.max[1]) / 2, 0])); });
const planned = F.planRoom(m, { fid, kind: 'bedroom' });
ok(!planned.error && Math.abs(planned.room.area - 20) < 1e-9 && planned.room.z === 0, 'the floor face is a 20 m² room', JSON.stringify(planned.error || planned.room.area));
ok(planned.doors.length === 1 && Math.abs(planned.doors[0].x - 2000) < 5, 'the starter door in its wall is found: ' + JSON.stringify(planned.doors));
ok(planned.plan.placements.length >= 2, 'the bedroom preset places pieces: ' + planned.plan.placements.map((p) => p.family).join(', ') + (planned.plan.skipped.length ? ' (skipped ' + planned.plan.skipped.map((s) => s.family).join(', ') + ')' : ''));
const undo0 = m.undoStack.length;
const out = m.change('Furnish', (mm) => F.furnishRoom(mm, planned, opts(mm)));
ok(m.undoStack.length === undo0 + 1, 'one undo step');
ok(out.placed.length === planned.plan.placements.length && out.tag === 'Furniture' && m.root.insts.get(out.instance).tag === 'Furniture', 'one group of ' + out.placed.length + ' pieces on the Furniture tag');
const boxes = [];
for (const [iid, inst] of out.def.insts) {
  const def = m.defs.get(inst.def), bb = m.bbox(def, V.mmul(m.root.insts.get(out.instance).m, inst.m));
  boxes.push({ iid, starter: def.starter, bb });
}
ok(boxes.every((b) => Math.abs(b.bb.min[2]) < 1e-6), 'every piece stands on the floor (z = 0)');
ok(boxes.every((b) => b.bb.min[0] > -0.005 && b.bb.min[1] > -0.005 && b.bb.max[0] < 4.005 && b.bb.max[1] < 5.005), 'every piece inside the room', JSON.stringify(boxes.map((b) => [b.starter, b.bb.min.slice(0, 2).map((v) => +v.toFixed(3)), b.bb.max.slice(0, 2).map((v) => +v.toFixed(3))])));
const fps = planned.plan.placements.map((p) => P.footprint(p));
ok(fps.every((a, i) => fps.every((b, j) => i === j || !P.boxesOverlap(a, b))), 'no two footprints overlap');
// each piece's own box matches its footprint's (axis-aligned) box: the matrix lays the starter thing on the planned rectangle
const fbb = (fp) => [Math.min(...fp.map((q) => q[0])) / 1000, Math.min(...fp.map((q) => q[1])) / 1000, Math.max(...fp.map((q) => q[0])) / 1000, Math.max(...fp.map((q) => q[1])) / 1000];
const sameBox = planned.plan.placements.every((p, i) => { const b = boxes[i].bb, f = fbb(fps[i]); return Math.abs(b.min[0] - f[0]) < 0.01 && Math.abs(b.min[1] - f[1]) < 0.01 && Math.abs(b.max[0] - f[2]) < 0.01 && Math.abs(b.max[1] - f[3]) < 0.01; });
ok(sameBox, 'each piece sits exactly on its planned footprint');
const swing = [1.55, 0, 2.45, 0.9];   // the door's 900 mm in front of it
ok(boxes.every((b) => b.bb.max[0] <= swing[0] || b.bb.min[0] >= swing[2] || b.bb.min[1] >= swing[3]), 'the door\'s swing stays free');
ok(boxes.every((b) => Object.values(F.STARTER_OF).includes(b.starter)), 'pieces are the starter library\'s furniture: ' + boxes.map((b) => b.starter).join(', '));
m.undo();
ok(!m.root.insts.has(out.instance), 'undo takes the whole set away');

// 2. the same room inside a group that is moved and turned: pieces land in the group, on its floor
const g = new M.Model();
const iid = g.change('room', (mm) => { M.addPolygon(mm.root, [[0, 0, 0], [4, 0, 0], [4, 5, 0], [0, 5, 0]], [0, 0, 1]); return mm.makeGroup(mm.root, [...mm.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Room'); });
g.change('turn', (mm) => { const i = mm.root.insts.get(iid); i.m = V.mmul(V.translation([10, 3, 2.7]), V.rotation([0, 0, 1], Math.PI / 6)); });
const gf = [...g.defs.get(g.root.insts.get(iid).def).faces.keys()][0];
const p2 = F.planRoom(g, { path: [iid], fid: gf });
ok(!p2.error && p2.guessed && p2.kind === 'living' && Math.abs(p2.room.z - 2.7) < 1e-9, 'inside a turned group: a 20 m² floor at 2.7 m, kind guessed (living)', JSON.stringify({ k: p2.kind, z: p2.room?.z }));
const o2 = g.change('Furnish', (mm) => F.furnishRoom(mm, p2, { ...opts(mm), path: [iid] }));
const inner = g.defs.get(g.root.insts.get(iid).def);
ok(inner.insts.has(o2.instance), 'the furniture group is inside the room\'s group');
const wm = V.mmul(g.root.insts.get(iid).m, inner.insts.get(o2.instance).m);
const zs = [...o2.def.insts.values()].map((i) => g.bbox(g.defs.get(i.def), V.mmul(wm, i.m)).min[2]);
ok(zs.length > 0 && zs.every((z) => Math.abs(z - 2.7) < 1e-6), 'every piece on that floor (world z 2.7 m)');
// 3. a wall is not a floor
const w = new M.Model();
const wf = w.change('wall', (mm) => { M.addPolygon(mm.root, [[0, 0, 0], [4, 0, 0], [4, 0, 3], [0, 0, 3]], [0, -1, 0]); return [...mm.root.faces.keys()].at(-1); });
ok(F.planRoom(w, { fid: wf }).error === 'not_floor', 'a wall face is refused (not a floor)');
ok(F.guessKind(4) === 'bath' && F.guessKind(8) === 'office' && F.guessKind(15) === 'bedroom' && F.guessKind(30) === 'living', 'the size guess');
console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
