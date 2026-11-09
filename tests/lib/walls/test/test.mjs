#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — lib/walls known-answer tests (0.9 WT.2, WT.3, WT.4, WT.7; session walls-09). Every expected value is worked out in the comment
 * beside it from the geometry (no reference program):   node lib/walls/test/test.mjs
 */
import { rectangle, rotatedRectangle, polygon, arcByCentre, tangentArc, endTangent, chainFrom, lineAt, outlineAround, offsetPath, segsOf, pathArea } from '../draw.js';
import { splitAt, deleteSegment, crossingAt, canRejoin, openingsAfter, station, wallLength } from '../cut.js';
import { dimensionMove, boxStretch, offsetDistance, growFrom } from '../modify.js';
import { keep, followGrid, distanceTo, drop, renameGrid } from '../hold.js';
import { chordsOf, flatten } from '../straight.js';
import { deriveJoins, reconcile, joinKey } from '../joins.js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const nearP = (p, q, e = 1e-6) => near(p[0], q[0], e) && near(p[1], q[1], e);
const throwsKey = (fn, key) => { try { fn(); return false; } catch (e) { return e.key === key; } };

console.log('== draw: rectangle, rotated rectangle, polygon');
let r = rectangle([5000, 4000], [0, 0]);
ok(r.closed && r.points.length === 4 && nearP(r.points[0], [0, 0]) && nearP(r.points[2], [5000, 4000]), 'rectangle from any two opposite corners: (0,0) (5000,0) (5000,4000) (0,4000)');
ok(near(pathArea(r), 20e6), 'anticlockwise, area 5000 x 4000 = 20 000 000 mm2');
ok(segsOf(r).length === 4 && nearP(segsOf(r)[3].b, [0, 0]), 'four walls, the last ends at the first corner (four corner joins)');
ok(throwsKey(() => rectangle([0, 0], [5, 4000]), 'walls.err.small'), 'a side under 10 mm is refused');
r = rotatedRectangle([0, 0], [3000, 4000], [-4000, 3000]);   // p->q = 5000 long at atan(4/3); r is 5000 to its left (dot((-4000,3000),(-0.8,0.6)) = 3200+1800 = 5000)
ok(nearP(r.points[2], [-1000, 7000]) && near(pathArea(r), 25e6), 'rotated rectangle 5000 x 5000 at 53.13 deg: far corner q + 5000 x left normal (-0.8, 0.6) = (-1000, 7000), area 25 000 000');
r = rotatedRectangle([0, 0], [1000, 0], [0, -500]);
ok(pathArea(r) > 0 && near(Math.abs(pathArea(r)), 500000), 'the other side (r to the right) still comes out anticlockwise, area 1000 x 500');
let pg = polygon([0, 0], [1000, 0], 6);
ok(pg.points.length === 6 && nearP(pg.points[1], [500, Math.sqrt(3) * 500]), 'inscribed hexagon radius 1000: second corner at 60 deg = (500, 866.03)');
ok(near(pathArea(pg), 3 * Math.sqrt(3) / 2 * 1e6), 'its area 3 sqrt(3)/2 R^2 = 2 598 076 mm2');
pg = polygon([0, 0], [1000, 0], 4, { fit: 'circumscribed' });
ok(nearP(pg.points[0], [1000, -1000]) && near(pathArea(pg), 4e6), 'circumscribed square about radius 1000: sides through (1000, 0), corners at (1000, -1000), area 2000^2');
ok(throwsKey(() => polygon([0, 0], [1000, 0], 2), 'walls.err.sides'), 'fewer than 3 sides refused');

console.log('== draw: arcs');
let a = arcByCentre([0, 0], [1000, 0], [0, 1000]);
ok(a.points.length === 2 && nearP(a.points[1], [0, 1000]) && near(a.bulges[0], Math.tan(Math.PI / 8)), 'quarter circle anticlockwise (the shorter way): bulge tan(90/4 deg) = 0.41421');
a = arcByCentre([0, 0], [1000, 0], [0, 1000], { ccw: false });
ok(a.bulges.length === 1 && near(a.bulges[0], -Math.tan((3 * Math.PI / 2) / 4)), 'the long way round: 270 deg clockwise, one wall (BimCraft takes up to 270): bulge -tan(67.5 deg)');
a = arcByCentre([0, 0], [1000, 0], [1000, -1], { ccw: true });
ok(a.bulges.length === 2 && near(a.bulges[0], Math.tan(((2 * Math.PI) - 0.001) / 2 / 4), 1e-5), 'nearly a whole circle anticlockwise (359.94 deg): two pieces');
a = arcByCentre([0, 0], [1000, 0], [1000, 0]);
ok(a.closed && a.bulges.length === 2 && near(a.bulges[0], Math.tan(Math.PI / 4)), 'end at the start: a whole circle, two half circles (bulge 1)');
let t = tangentArc([0, 0], [1, 0], [1000, 1000]);
ok(t.bulges.length === 1 && near(t.bulges[0], Math.tan(Math.PI / 8)), 'tangent arc east then to (1000, 1000): chord at 45 deg, included angle 90 deg, bulge tan(22.5 deg)');
ok(nearP(endTangent({ a: [0, 0], b: [1000, 1000], bulge: Math.tan(Math.PI / 8) }), [0, 1], 1e-9), 'that arc leaves its end going north (the next tangent arc follows from there)');
ok(throwsKey(() => tangentArc([0, 0], [1, 0], [2000, 0]), 'walls.err.tangent'), 'an end on the tangent line is a straight wall, not an arc');
t = tangentArc([0, 0], [1, 0], [-1000, -400]);   // chord at -158.2 deg from the tangent: included angle 316 deg
ok(t.bulges.length === 2 && t.bulges.every((b) => b < 0), 'over 270 deg (end nearly behind, to the right): two clockwise pieces');

console.log('== draw: pick lines, trace outline, placement offset');
const L = [{ a: [0, 0], b: [4000, 0] }, { a: [4000, 3000], b: [4000, 0] }, { a: [4000, 3000], b: [0, 3000] }, { a: [0, 0], b: [0, 3000] }, { a: [6000, 0], b: [7000, 0] }];
ok(lineAt(L, [2000, 5], 10) === 0 && lineAt(L, [2000, 500], 10) === null, 'lineAt finds the line under the pointer (10 mm), none in the middle');
const ch = chainFrom(L, 0);
ok(ch.closed && ch.points.length === 4 && ch.lines.length === 4, 'Tab: the four lines joined end to end, drawn in any direction, are one closed chain');
ok(near(Math.abs(pathArea(ch)), 12e6), 'the chain encloses 4000 x 3000');
ok(chainFrom(L, 4).points.length === 2 && !chainFrom(L, 4).closed, 'a lone line is a one-wall chain');
const grid = [{ a: [0, 0], b: [6000, 0] }, { a: [6000, 0], b: [6000, 4000] }, { a: [6000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }, { a: [2000, -500], b: [2000, 4500] }];
let o = outlineAround(grid, [1000, 1000]);
ok(o.closed && near(Math.abs(pathArea(o)), 2000 * 4000, 1e-3), 'click inside the left room of a rectangle cut by a line running past it: the 2000 x 4000 area, not the whole');
o = outlineAround(grid, [4000, 2000]);
ok(near(Math.abs(pathArea(o)), 4000 * 4000, 1e-3) && o.points.length === 4, 'the right room: 4000 x 4000, four corners (the line\'s ends past the walls are not corners)');
ok(throwsKey(() => outlineAround(grid, [9000, 9000]), 'walls.err.open'), 'outside every closed area: refused');
let off = offsetPath(rectangle([0, 0], [4000, 3000]), 100);
ok(nearP(off.points[0], [100, 100]) && nearP(off.points[2], [3900, 2900]), 'placement offset 100 to the left of an anticlockwise rectangle (its inside): corners mitred (100, 100) .. (3900, 2900)');
off = offsetPath({ points: [[0, 0], [1000, 0], [1000, 1000]], bulges: [0, 0], closed: false }, -50);
ok(nearP(off.points[0], [0, -50]) && nearP(off.points[1], [1050, -50]) && nearP(off.points[2], [1050, 1000]), 'an open path 50 to its right: (0,-50) (1050,-50) (1050,1000)');

console.log('== cut: split (test 6), gap, delete segment, rejoin');
const wall = { guid: 'S', a: [0, 0], b: [5000, 0], t: 200, joinOff: { a: false, b: false } };
let sp = splitAt(wall, 2500);
ok(sp.parts.length === 2 && nearP(sp.parts[0].b, [2500, 0]) && nearP(sp.parts[1].a, [2500, 0]), 'split at the middle: two walls meeting end to end at 2500 (D2 default: they stay joined in line)');
ok(!sp.parts[0].joinOff.b && !sp.parts[1].joinOff.a, 'the cut ends are joined');
sp = splitAt(wall, 2500, { free: true });
ok(sp.parts[0].joinOff.b && sp.parts[1].joinOff.a, 'D2 "free ends": the cut ends get Disallow join');
sp = splitAt(wall, 2500, { gap: 900 });
ok(nearP(sp.parts[0].b, [2050, 0]) && nearP(sp.parts[1].a, [2950, 0]), 'split with a 900 gap centred on 2500: 2050 and 2950');
ok(throwsKey(() => splitAt(wall, 20), 'walls.err.cutend'), 'a cut 20 mm from an end is refused (under 50)');
const rj = canRejoin({ ...sp.parts[0], guid: 'A', t: 200 }, { ...sp.parts[1], guid: 'B', t: 200 });
ok(rj && nearP(rj.a, [0, 0]) && nearP(rj.b, [5000, 0]), 'rejoin the two parts over the gap: one wall 0 to 5000 again');
ok(!canRejoin({ guid: 'A', a: [0, 0], b: [1000, 0], t: 200 }, { guid: 'B', a: [1000, 10], b: [2000, 10], t: 200 }), 'walls 10 mm out of line do not rejoin');
const ds = deleteSegment(wall, 1000, 3000);
ok(ds.parts.length === 2 && nearP(ds.parts[0].b, [1000, 0]) && nearP(ds.parts[1].a, [3000, 0]), 'delete the piece 1000-3000: 0-1000 and 3000-5000 left');
ok(deleteSegment(wall, 30, 3000).parts.length === 1, 'a piece from within 50 of an end takes the end: one part left');
ok(near(crossingAt(wall, { a: [1800, -1000], b: [1800, 1000], t: 100 }), 1800), 'a crossing wall cuts it at 1800');
const arcWall = { guid: 'C', a: [1000, 0], b: [-1000, 0], bulge: 1, t: 200 };   // a half circle, radius 1000, anticlockwise about (0,0): length pi*1000
ok(near(wallLength(arcWall), Math.PI * 1000, 1e-6), 'a half-circle wall of radius 1000 is 3141.59 long');
sp = splitAt(arcWall, Math.PI * 500);
ok(nearP(sp.parts[0].b, [0, 1000], 1e-6) && near(sp.parts[0].bulge, Math.tan(Math.PI / 8)), 'split along the arc at half its length: (0, 1000), each part a quarter circle (bulge tan 22.5 deg)');
const ra = canRejoin({ ...sp.parts[0], guid: 'A', t: 200 }, { ...sp.parts[1], guid: 'B', t: 200 });
ok(ra && near(ra.bulge, 1, 1e-9), 'the two quarters rejoin as the half circle (bulge 1)');
ok(near(station(arcWall, [0, 1000]).s, Math.PI * 500, 1e-6), 'station on a curved wall: the top of the half circle is half way along');
const op = openingsAfter([{ guid: 'd1', offset: 500, width: 900 }, { guid: 'd2', offset: 3000, width: 900 }, { guid: 'd3', offset: 2200, width: 900 }], [2500, 2500]);
ok(op.stay[0] === 'd1' && op.move[0].guid === 'd2' && near(op.move[0].offset, 500) && op.cut[0] === 'd3', 'doors: 500 stays, 3000 goes to the second part at 500, one across the cut is named (the host refuses)');

console.log('== modify: edit by dimension (test 4), box stretch, offset, grow from');
// left wall x = 0, right wall x = 5000, dimension from the left to the right wall along x
const right = { guid: 'R', a: [5000, 0], b: [5000, 4000] };   // runs north: its left is west (-x)
ok(near(dimensionMove({ a: [0, 2000], b: [5000, 2000], value: 5000 }, 6000, right), -1000), 'type 6000 on a 5000 dimension: the right wall moves 1000 east, which is -1000 to its left');
ok(dimensionMove({ a: [0, 2000], b: [5000, 2000], value: 5000 }, 6000, { a: [0, 0], b: [5000, 0] }) === null, 'a wall running along the dimension cannot change it by a square move: null');
const room = [{ guid: 'S', a: [0, 0], b: [5000, 0], t: 200 }, { guid: 'E', a: [5000, 0], b: [5000, 4000], t: 200 }, { guid: 'N', a: [5000, 4000], b: [0, 4000], t: 200 }, { guid: 'W', a: [0, 4000], b: [0, 0], t: 200 }, { guid: 'P', a: [2500, 0], b: [2500, 4000], t: 100 }];
let bs = boxStretch(room, { minX: 4000, minY: -500, maxX: 6000, maxY: 4500 }, [1000, 0]);
ok(nearP(bs.get('E').a, [6000, 0]) && nearP(bs.get('S').b, [6000, 0]) && nearP(bs.get('N').a, [6000, 4000]) && !bs.has('W') && !bs.has('P'), 'box round the east wall, stretch 1000 east: the east wall moves, the south and north walls stretch 1000, the rest stay');
bs = boxStretch([{ guid: 'H', a: [0, 0], b: [5000, 0], t: 200 }, { guid: 'T', a: [2500, 0], b: [2500, 3000], t: 100 }], { minX: -100, minY: -300, maxX: 5100, maxY: 300 }, [0, -500]);
ok(nearP(bs.get('H').a, [0, -500]) && nearP(bs.get('T').a, [2500, -500]) && nearP(bs.get('T').b, [2500, 3000]), 'a wall moved whole by the box takes the partition butting into it (its end slides down 500 with it)');
ok(near(offsetDistance({ a: [0, 0], b: [1000, 0] }, [500, -300], 200), -200), 'offset: a typed 200 goes to the pointer\'s side (the right: -200)');
let g = growFrom({ a: [0, 0], b: [5000, 0] }, 6000, 'end');
ok(nearP(g.a, [-1000, 0]) && nearP(g.b, [5000, 0]) && nearP(g.fixed[0], [5000, 0]), 'FX.67 grow from the end: the end holds (the marker), the start goes 1000 back');
g = growFrom({ a: [0, 0], b: [5000, 0] }, 6000, 'centre');
ok(nearP(g.a, [-500, 0]) && nearP(g.b, [5500, 0]), 'grow from the centre: 500 each way');

console.log('== hold: align and lock, lock dimension, grid lock (WT.3, WT.7)');
// a square move stand-in: the wall moves d along its left normal, its joined (shared-end) walls' ends follow (enough for these cases)
const sq = (walls, guid, d) => {
  const w = walls.find((x) => x.guid === guid), u = [(w.b[0] - w.a[0]) / Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]), (w.b[1] - w.a[1]) / Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1])], n = [-u[1], u[0]];
  const mv = (p) => [p[0] + n[0] * d, p[1] + n[1] * d], plan = new Map([[guid, { a: mv(w.a), b: mv(w.b) }]]);
  for (const x of walls) if (x.guid !== guid) for (const e of ['a', 'b']) for (const f of ['a', 'b']) if (Math.hypot(x[e][0] - w[f][0], x[e][1] - w[f][1]) < 1) { const c = plan.get(x.guid) || { a: x.a, b: x.b }; plan.set(x.guid, { ...c, [e]: mv(w[f]) }); }
  return plan;
};
const lineOf = (w) => ({ p: w.a, u: [w.b[0] - w.a[0], w.b[1] - w.a[1]] });
const G = { '1': { a: [0, -1000], b: [0, 5000] } };
const ctx = { lineOf, grid: (tag) => G[tag] || null, move: sq, dim: () => null };
const two = [{ guid: 'A', a: [0, 0], b: [0, 3000] }, { guid: 'B', a: [0, 4000], b: [0, 7000] }];   // two walls in line on x = 0, going north
const hAlign = [{ id: 'h1', kind: 'line', wall: 'B', ref: 'center', to: { wall: 'A', ref: 'center' }, off: 0 }];
ok(near(distanceTo(lineOf(two[1]), lineOf(two[0])), 0), 'the two walls are aligned: distance 0');
let k = keep(two, hAlign, new Map([['A', { a: [500, 0], b: [500, 3000] }]]), ctx, { driven: ['A'] });
ok(nearP(k.get('B').a, [500, 4000]) && nearP(k.get('B').b, [500, 7000]), 'move the reference wall A 500 east: the locked wall B follows 500 (Align + padlock)');
k = keep(two, hAlign, new Map([['B', { a: [500, 4000], b: [500, 7000] }]]), ctx, { driven: ['B'] });
ok(nearP(k.get('A').a, [500, 0]), 'move the locked wall B: A comes too (the lock holds both ways)');
ok(throwsKey(() => keep(two, hAlign, new Map([['A', { a: [500, 0], b: [500, 3000] }], ['B', { a: [-500, 4000], b: [-500, 7000] }]]), ctx, { driven: ['A', 'B'] }), 'walls.err.held'), 'moving both sides apart at once is refused');
const hGrid = [{ id: 'g1', kind: 'line', wall: 'A', ref: 'center', to: { grid: '1' }, off: 0 }];
ok(throwsKey(() => keep(two, hGrid, new Map([['A', { a: [300, 0], b: [300, 3000] }]]), ctx, { driven: ['A'] }), 'walls.err.held'), 'a wall locked to a grid line cannot be moved off it (move the grid)');
G['1'] = { a: [800, -1000], b: [800, 5000] };
let fg = followGrid(two, hGrid, '1', ctx);
ok(nearP(fg.get('A').a, [800, 0]) && nearP(fg.get('A').b, [800, 3000]), 'grid line 1 moved 800 east: the wall locked to it follows 800');
G['1'] = { a: [0, -1000], b: [3000, 5000] };
ok(throwsKey(() => followGrid(two, hGrid, '1', ctx), 'walls.err.gridturn'), 'a grid line turned: the locked wall cannot lie square on it: refused, said why');
G['2'] = { a: [-1000, 3000], b: [3000, 3000] };
const hEnd = [{ id: 'e1', kind: 'end', wall: 'A', end: 'b', to: { grid: '2' } }];
G['2'] = { a: [-1000, 3500], b: [3000, 3500] };
fg = followGrid(two, hEnd, '2', ctx);
ok(nearP(fg.get('A').b, [0, 3500]) && nearP(fg.get('A').a, [0, 0]), 'an end locked to grid line 2: the line moves 500 north, the end slides along its wall to it (the wall lengthens 500)');
// lock dimension: from A (x = 0) to C (x = 5000) along x, value 5000
const dw = [{ guid: 'A', a: [0, 0], b: [0, 3000] }, { guid: 'C', a: [5000, 3000], b: [5000, 0] }];   // C runs south: its left is east
const dctx = { ...ctx, dim: (id, walls) => { const A0 = walls.find((x) => x.guid === 'A'), C0 = walls.find((x) => x.guid === 'C'); return { value: C0.a[0] - A0.a[0], a: [A0.a[0], 1500], b: [C0.a[0], 1500], walls: ['A', 'C'] }; } };
k = keep(dw, [{ id: 'd1', kind: 'dim', dim: 'D', value: 5000 }], new Map([['A', { a: [-400, 0], b: [-400, 3000] }]]), dctx, { driven: ['A'] });
ok(nearP(k.get('C').a, [4600, 3000]), 'a locked 5000 dimension: move A 400 west, C follows 400 west, still 5000');
ok(drop(hAlign, ['B']).length === 0 && drop(hGrid, ['grid:1']).length === 0 && renameGrid(hGrid, '1', '1A')[0].to.grid === '1A', 'holds drop with their walls and grid lines, and follow a renamed grid line');

console.log('== straight hosts: chords (walls-plan-09)');
{
  // a quarter circle of radius 1000 about the origin: bulge tan(90deg / 4); 90 deg in 15 deg steps = 6 chords, each 2 R sin(7.5 deg) = 261.05 mm
  const ch = chordsOf({ a: [1000, 0], b: [0, 1000], bulge: Math.tan(Math.PI / 8) });
  ok(ch.length === 6 && ch.every((c) => near(Math.hypot(c.a[0], c.a[1]), 1000, 1e-6)) && near(Math.hypot(ch[0].b[0] - ch[0].a[0], ch[0].b[1] - ch[0].a[1]), 2000 * Math.sin(7.5 * Math.PI / 180), 1e-6), 'a 90 degree arc: 6 chords with every corner on the circle (R = 1000), each 261.05 mm');
  ok(nearP(ch[0].a, [1000, 0]) && nearP(ch[5].b, [0, 1000]) && nearP(ch[2].b, ch[3].a), 'they run from (1000, 0) to (0, 1000) end to end');
  ok(chordsOf({ a: [0, 0], b: [10, 0], bulge: 0 }).length === 1, 'a straight side stays one');
  const cw = chordsOf({ a: [0, 1000], b: [1000, 0], bulge: -Math.tan(Math.PI / 8) });
  ok(cw.length === 6 && nearP(cw[0].a, [0, 1000]) && cw.every((c) => near(Math.hypot(c.a[0], c.a[1]), 1000, 1e-6)), 'the other way round (negative bulge, clockwise) too');
  const f = flatten({ points: [[0, 0], [1000, 0], [1000, 1000]], bulges: [0, 0, 0], closed: true });
  ok(f.points.length === 3 && f.closed, 'a path of straight sides is unchanged');
}
console.log('== the join rules are one rule (lib/walls/joins.js and BimCraft wall-joins.js)');
{
  const bim = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/bimcraft/dev/wall-joins.js');
  const strip = (src) => src.replace(/\/\*\*[\s\S]*?\*\//, '');
  ok(fs.existsSync(bim) && strip(fs.readFileSync(bim, 'utf8')) === strip(fs.readFileSync(fileURLToPath(new URL('../joins.js', import.meta.url)), 'utf8')), 'the code of BimCraft\'s wall-joins.js equals lib/walls/joins.js (only the header comment differs): one set of rules for both apps');
  const bimSq = bim.replace('wall-joins.js', 'wall-square.js');
  ok(fs.existsSync(bimSq) && strip(fs.readFileSync(bimSq, 'utf8')) === strip(fs.readFileSync(fileURLToPath(new URL('../square.js', import.meta.url)), 'utf8')), 'and BimCraft\'s wall-square.js equals lib/walls/square.js: one solver for corners, moves and lengths');
  const rows = [{ guid: 'A', a: [0, 0], b: [4000, 0], t: 100 }, { guid: 'B', a: [4000, 0], b: [4000, 3000], t: 100 }, { guid: 'C', a: [2000, 0], b: [2000, 1500], t: 100 }, { guid: 'D', a: [1000, -500], b: [1000, 500], t: 100 }];
  const d = deriveJoins(rows);
  ok(d.length === 3 && d.map((r) => r.kind).sort().join('') === 'LTX', 'an L, a T and an X from four walls', d.map((r) => r.kind));
  ok(reconcile(d, d).add.length === 0 && reconcile(d, []).add.length === 3 && reconcile([], d).remove.length === 3, 'reconcile adds and removes by key');
  ok(joinKey({ guid: 'B', pos: 'start' }, { guid: 'A', pos: 'end' }) === joinKey({ guid: 'A', pos: 'end' }, { guid: 'B', pos: 'start' }), 'a join has one key whichever wall is named first');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
