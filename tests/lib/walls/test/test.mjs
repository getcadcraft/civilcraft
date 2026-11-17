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
import { cornerEnds, styleToken, parseStyleToken, nextStyle, JOIN_STYLES } from '../joinstyle.js';
import { moveJoined as moveJoinedTogether } from '../square.js';
import { layerPriority, layerBands, cleanJunction, subtractConvex, segmentOutside, LAYER_PRIORITY } from '../layerjoin.js';
import { relineJoined, endDrag } from '../reline.js';
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
console.log('== the join rules are one rule (lib/walls/joins.js; BimCraft re-exports its copy)');
{
  // walls-join-10 (FX.60): the lib is the single source. BimCraft's wall-joins.js and wall-square.js hold no logic: each only re-exports the
  // synced byte copy in its walls/ folder, and that copy equals the lib file
  const dev = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../../public_html/assets/apps/bimcraft/dev');
  const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').trim();
  const same = (n) => fs.existsSync(path.join(dev, 'walls', n)) && fs.readFileSync(path.join(dev, 'walls', n)).equals(fs.readFileSync(fileURLToPath(new URL('../' + n, import.meta.url))));
  ok(fs.existsSync(path.join(dev, 'wall-joins.js')) && code(fs.readFileSync(path.join(dev, 'wall-joins.js'), 'utf8')) === "export * from './walls/joins.js';" && same('joins.js'), 'BimCraft\'s wall-joins.js only re-exports walls/joins.js, a byte copy of lib/walls/joins.js: one set of rules for every app');
  ok(fs.existsSync(path.join(dev, 'wall-square.js')) && code(fs.readFileSync(path.join(dev, 'wall-square.js'), 'utf8')) === "export * from './walls/square.js';" && same('square.js'), 'and its wall-square.js only re-exports walls/square.js, a byte copy of lib/walls/square.js: one solver for corners, moves and lengths');
  const rows = [{ guid: 'A', a: [0, 0], b: [4000, 0], t: 100 }, { guid: 'B', a: [4000, 0], b: [4000, 3000], t: 100 }, { guid: 'C', a: [2000, 0], b: [2000, 1500], t: 100 }, { guid: 'D', a: [1000, -500], b: [1000, 500], t: 100 }];
  const d = deriveJoins(rows);
  ok(d.length === 3 && d.map((r) => r.kind).sort().join('') === 'LTX', 'an L, a T and an X from four walls', d.map((r) => r.kind));
  ok(reconcile(d, d).add.length === 0 && reconcile(d, []).add.length === 3 && reconcile([], d).remove.length === 3, 'reconcile adds and removes by key');
  ok(joinKey({ guid: 'B', pos: 'start' }, { guid: 'A', pos: 'end' }) === joinKey({ guid: 'A', pos: 'end' }, { guid: 'B', pos: 'start' }), 'a join has one key whichever wall is named first');
}

console.log('== reline: an end dragged or a wall turned, the joined walls keep their direction (FX.63, walls-plan-10)');
{
  // a room 4000 x 3000 drawn anticlockwise from (0,0): A bottom, B right, C top, D left; P a partition from A's middle up to (2000,1500)
  const room = () => [{ guid: 'A', a: [0, 0], b: [4000, 0], t: 100 }, { guid: 'B', a: [4000, 0], b: [4000, 3000], t: 100 }, { guid: 'C', a: [4000, 3000], b: [0, 3000], t: 100 }, { guid: 'D', a: [0, 3000], b: [0, 0], t: 100 }, { guid: 'P', a: [2000, 0], b: [2000, 1500], t: 100 }];
  // A's end dragged to (5000, 500): A's new line runs from (0,0) with slope 500/5000 = 0.1; B's own line is x = 4000, so they meet at (4000, 400)
  let m = endDrag(room(), 'A', 'b', [5000, 500]);
  ok(nearP(m.get('A').b, [4000, 400]) && nearP(m.get('A').a, [0, 0]), 'end drag: the dragged end lands where its new line (slope 0.1 from the origin) crosses the joined wall\'s line x = 4000: (4000, 400)', m.get('A'));
  ok(nearP(m.get('B').a, [4000, 400]) && nearP(m.get('B').b, [4000, 3000]), 'the joined wall\'s end slides along its own line to (4000, 400); its far end and its direction hold (it stays vertical)', m.get('B'));
  ok(nearP(m.get('P').a, [2000, 200]) && nearP(m.get('P').b, [2000, 1500]), 'the partition butting into the dragged wall follows along its own line x = 2000 to y = 0.1 x 2000 = 200', m.get('P'));
  ok(!m.has('C') && nearP(m.get('D').b, [0, 0]), 'the wall at the end that holds does not move, nor the wall across the room');
  // along the wall itself it is a Length change: 4000 to 5000, the joined wall B moves parallel to x = 5000 and C lengthens (D1 option A)
  m = endDrag(room(), 'A', 'b', [5000, 0]);
  ok(nearP(m.get('A').b, [5000, 0]) && nearP(m.get('B').a, [5000, 0]) && nearP(m.get('B').b, [5000, 3000]) && nearP(m.get('C').a, [5000, 3000]), 'a drag along the wall is a Length change: B moves parallel to x = 5000, C lengthens to it');
  // the T end of the partition dragged to (2500, 300): its line from (2000,1500) has direction (500, -1200); it reaches y = 0 after 1500/1200 = 1.25 of it: x = 2000 + 625
  m = endDrag(room(), 'P', 'a', [2500, 300]);
  ok(nearP(m.get('P').a, [2625, 0]) && m.size === 1, 'a T end dragged stays on the wall it butts into: (2625, 0); that wall does not move', [...m]);
  // the corner A/B moved to (4500, -500) with both walls named: both go there (both turn); P follows A's new line y = -x/9: -2000/9 = -222.222
  m = relineJoined(room(), new Map([['A', { a: [0, 0], b: [4500, -500] }], ['B', { a: [4500, -500], b: [4000, 3000] }]]));
  ok(nearP(m.get('A').b, [4500, -500]) && nearP(m.get('B').a, [4500, -500]) && nearP(m.get('B').b, [4000, 3000]), 'a corner moved (both walls named): both stay on the moved corner and turn');
  ok(nearP(m.get('P').a, [2000, -2000 / 9]) && nearP(m.get('C').a, [4000, 3000]) && nearP(m.get('D').b, [0, 0]), 'the partition slides to the new line (2000, -222.22); the walls further along keep their ends');
  // B turned about its middle (4000,1500) so that tan = 0.1: its line passes (4150, 0) and (3850, 3000); A's line is y = 0, C's is y = 3000
  m = relineJoined(room(), new Map([['B', { a: [4150, 0], b: [3850, 3000] }]]));
  ok(nearP(m.get('A').b, [4150, 0]) && nearP(m.get('C').a, [3850, 3000]) && nearP(m.get('A').a, [0, 0]) && nearP(m.get('C').b, [0, 3000]), 'a wall turned: each neighbour\'s end slides along its own line to the turned line: (4150, 0) and (3850, 3000)', [...m]);
  // past the joined wall's far end (4000, 3000) it would be turned back: refused
  ok(throwsKey(() => endDrag(room(), 'A', 'b', [4000, 3500]), 'model.err.short'), 'a drag that would turn the joined wall back through its far end is refused (model.err.short)');
  // two walls in one line: the neighbour's line is the dragged wall's old line, so the crossing is the end that holds: no corner, it is carried (it turns)
  m = endDrag([{ guid: 'A', a: [0, 0], b: [4000, 0], t: 100 }, { guid: 'E', a: [4000, 0], b: [8000, 0], t: 100 }], 'A', 'b', [4000, 1000]);
  ok(nearP(m.get('A').b, [4000, 1000]) && nearP(m.get('E').a, [4000, 1000]) && nearP(m.get('E').b, [8000, 0]), 'no solution (the neighbour runs along the dragged wall): it is carried to the dragged end');
  // the stored record decides, not where ends are: with the record gone (Disallow join) the wall at the same point stays
  const rec = room().map((w) => ({ ...w, joins: [] }));
  m = endDrag(rec, 'A', 'b', [5000, 500]);
  ok(m.size === 1 && nearP(m.get('A').b, [5000, 500]), 'rows that carry join records and name none: the end goes where it is put and nothing else moves', [...m]);
  rec[0].joins = [{ other: 'B', pos: 'end', otherPos: 'start', kind: 'L' }]; rec[1].joins = [{ other: 'A', pos: 'start', otherPos: 'end', kind: 'L' }];
  m = endDrag(rec, 'A', 'b', [5000, 500]);
  ok(nearP(m.get('A').b, [4000, 400]) && nearP(m.get('B').a, [4000, 400]) && !m.has('P'), 'with the L record stored the joined wall slides as above (4000, 400); the partition has no record, so it stays');
}

console.log('== join style (walls-join-10, WT.5): mitre, butt, square off at an L corner');
{
  const polyArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) a += p[i][0] * p[(i + 1) % p.length][1] - p[i][1] * p[(i + 1) % p.length][0]; return a / 2; };
  // A comes in from the left along the x axis and ends at the corner (0, 0): out of the corner it points (-1, 0); 200 thick (h = 100).
  // Looking along (-1, 0), left is (0, -1): A's "left" face is y = -100, its "right" face y = +100.
  // B goes up from the corner: (0, 1); 100 thick (h = 50). Looking along (0, 1), left is (-1, 0): left face x = -50, right face x = +50.
  const A = { p: [0, 0], d: [-1, 0], h: 100 }, B = { p: [0, 0], d: [0, 1], h: 50 };
  let c = cornerEnds(A, B);
  // mitre: A's left (y = -100) meets B's right (x = 50) at the outer corner (50, -100); A's right (y = 100) meets B's left (x = -50) at the inner corner (-50, 100)
  ok(c.style === 'mitre' && nearP(c.a.left, [50, -100]) && nearP(c.b.right, [50, -100]) && nearP(c.a.right, [-50, 100]) && nearP(c.b.left, [-50, 100]), 'mitre (the default): both ends are cut from the inner corner (-50, 100) to the outer corner (50, -100)');
  c = cornerEnds(A, B, { style: 'butt', through: 'a' });
  // butt, A runs through: A runs on to B's far face x = 50, so its end is (50, -100) to (50, 100); B stops against A's side y = 100: (-50, 100) to (50, 100)
  ok(c.style === 'butt' && nearP(c.a.left, [50, -100]) && nearP(c.a.right, [50, 100]) && nearP(c.b.left, [-50, 100]) && nearP(c.b.right, [50, 100]), 'butt, the first wall runs through: it ends on the other\'s far face x = 50; the other stops on its side y = 100');
  c = cornerEnds(A, B, { style: 'butt', through: 'b' });
  // butt, B runs through: B runs down to A's far face y = -100: (-50, -100) to (50, -100); A stops against B's side x = -50: (-50, -100) to (-50, 100)
  ok(c.style === 'butt' && nearP(c.b.left, [-50, -100]) && nearP(c.b.right, [50, -100]) && nearP(c.a.left, [-50, -100]) && nearP(c.a.right, [-50, 100]), 'butt, the second wall runs through: it ends on y = -100; the first stops on x = -50');
  const sq = cornerEnds(A, B, { style: 'square', through: 'a' }), bt = cornerEnds(A, B, { style: 'butt', through: 'a' });
  ok(sq.style === 'square' && ['left', 'right'].every((k) => nearP(sq.a[k], bt.a[k]) && nearP(sq.b[k], bt.b[k])), 'at a right angle square off is the same shape as butt');
  // the same corner whichever style: the two outlines together cover the same area at 90 degrees. A's end piece from x = -1000, B's to y = 1000:
  // mitre  A = trapezoid (-1000,-100) (50,-100) (-50,100) (-1000,100) = 200 x (1050 + 950) / 2 = 200 000; B = (50,-100) (50,1000) (-50,1000) (-50,100) = 100 x (1100 + 900) / 2 = 100 000
  // butt a A = 1050 x 200 = 210 000; B = 100 x 900 = 90 000. Both 300 000.
  const m0 = cornerEnds(A, B);
  ok(near(polyArea([[-1000, -100], m0.a.left, m0.a.right, [-1000, 100]]) + polyArea([m0.b.right, [50, 1000], [-50, 1000], m0.b.left]), 300000) && near(polyArea([[-1000, -100], bt.a.left, bt.a.right, [-1000, 100]]) + polyArea([bt.b.right, [50, 1000], [-50, 1000], bt.b.left]), 300000), 'mitre and butt cover the same 300 000 mm2 (the corner only changes hands: 200 000 + 100 000, then 210 000 + 90 000)');

  // 60 degrees: B leaves the corner at 60 degrees from the x axis, d = (0.5, 0.8660254), h = 100 (the walls are 120 degrees apart).
  // B's far face (its right): through (86.60254, -50) along d, so x = (100 + 0.5 y) / 0.8660254: at y = -100 x = 57.735027, at y = +100 x = 173.205081.
  // B's left face: through (-86.60254, 50) along d: at y = 100 x = -86.60254 + 0.5 x 57.735027 = -57.735027.
  const B6 = { p: [0, 0], d: [0.5, Math.sqrt(3) / 2], h: 100 };
  c = cornerEnds(A, B6, { style: 'butt', through: 'a' });
  ok(c.style === 'butt' && nearP(c.a.left, [57.735027, -100], 1e-5) && nearP(c.a.right, [173.205081, 100], 1e-5) && nearP(c.b.left, [-57.735027, 100], 1e-5) && nearP(c.b.right, [173.205081, 100], 1e-5), 'butt at 60 degrees: the through wall is cut along the other\'s far face, (57.735, -100) to (173.205, 100); the other stops on y = 100 from x = -57.735 to 173.205');
  c = cornerEnds(A, B6, { style: 'square', through: 'a' });
  // square off: the through wall ends square where B's far face reaches its side: x = 173.205081 for both faces
  ok(c.style === 'square' && nearP(c.a.left, [173.205081, -100], 1e-5) && nearP(c.a.right, [173.205081, 100], 1e-5) && nearP(c.b.left, [-57.735027, 100], 1e-5) && nearP(c.b.right, [173.205081, 100], 1e-5), 'square off at 60 degrees: the through wall ends square at x = 173.205 (where the other\'s far face reaches its side); the other stops on its side as for butt');
  c = cornerEnds(A, B6);
  ok(nearP(c.a.left, [57.735027, -100], 1e-5) && nearP(c.a.right, [-57.735027, 100], 1e-5), 'mitre at 60 degrees: outer corner (57.735, -100), inner corner (-57.735, 100)');
  // walls in one line: nothing to butt against; both ends stay square at the corner
  c = cornerEnds(A, { p: [0, 0], d: [1, 0], h: 100 }, { style: 'butt' });
  ok(c.style === 'mitre' && nearP(c.a.left, [0, -100]) && nearP(c.a.right, [0, 100]), 'two walls in one line: butt is not made (style comes back mitre), the ends stay square');
  // 20 degrees apart: every cut point would be 100 / sin(10 deg) = 575.9 from the corner, over the limit 4 x 100 + 1: square ends
  c = cornerEnds(A, { p: [0, 0], d: [-Math.cos(20 * Math.PI / 180), Math.sin(20 * Math.PI / 180)], h: 100 }, { style: 'square' });
  ok(c.style === 'mitre' && nearP(c.a.left, [0, -100]) && nearP(c.a.right, [0, 100]), 'a corner of 20 degrees is too sharp (575.9 mm > 401): the style falls back and the ends stay square');
  ok(styleToken({ style: 'mitre' }) === '' && styleToken({ style: 'butt', through: 2 }) === 'butt 2' && styleToken({ style: 'square' }) === 'square 1', 'the stored word: nothing for mitre, "butt 2", "square 1"');
  const pt = parseStyleToken('CadCraft join L butt 2'), p0 = parseStyleToken('CadCraft join L');
  ok(pt.style === 'butt' && pt.through === 2 && p0.style === 'mitre' && p0.through === 1 && parseStyleToken('CadCraft join L square').through === 1, 'read back from a join record\'s name; an older record with no word is a mitre');
  ok(JOIN_STYLES.join() === 'mitre,butt,square' && nextStyle('mitre') === 'butt' && nextStyle('butt') === 'square' && nextStyle('square') === 'mitre', 'the tool cycles mitre, butt, square off');
}

console.log('== layer priority (walls-join-10, WT.5): the stronger layer cuts the weaker at L, T and X');
{
  const polyArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) a += p[i][0] * p[(i + 1) % p.length][1] - p[i][1] * p[(i + 1) % p.length][0]; return a / 2; };
  const hasLine = (lines, p, q) => lines.some((s) => (nearP(s[0], p, 1e-6) && nearP(s[1], q, 1e-6)) || (nearP(s[0], q, 1e-6) && nearP(s[1], p, 1e-6)));
  const box = (poly) => [Math.min(...poly.map((q) => q[0])), Math.min(...poly.map((q) => q[1])), Math.max(...poly.map((q) => q[0])), Math.max(...poly.map((q) => q[1]))];
  ok(layerPriority({ function: 'structure' }) === 800 && layerPriority({ function: 'substrate' }) === 600 && layerPriority({ function: 'insulation' }) === 400 && layerPriority({ function: 'membrane' }) === 300 && layerPriority({ function: 'finish' }) === 200 && layerPriority({ kind: 'cavity', function: 'structure' }) === 100, 'defaults by function: structure 800, substrate 600, insulation 400, membrane 300, finish 200; a cavity 100');
  ok(layerPriority({ function: 'finish', priority: 850 }) === 850 && layerPriority({ function: 'finish', priority: 1000 }) === 200 && layerPriority({ function: 'x' }) === LAYER_PRIORITY.finish, 'a layer\'s own number wins (0 to 999); out of range or an unknown function counts as the default');
  // a 200 wall: finish 20, core 160, finish 20, from the exterior. Exterior on the left: the first layer is the band +80..+100; core -80..+80; the last -100..-80
  const FCF = [{ t: 20, function: 'finish', mat: 'gyp' }, { t: 160, function: 'structure', mat: 'conc' }, { t: 20, function: 'finish', mat: 'gyp' }];
  const bl = layerBands(FCF), br = layerBands(FCF.concat([{ t: 0, function: 'membrane', mat: 'vb' }]), 'right');
  ok(bl.length === 3 && bl[0].index === 2 && near(bl[0].lo, -100) && near(bl[0].hi, -80) && bl[1].index === 1 && near(bl[1].lo, -80) && near(bl[1].hi, 80) && bl[2].index === 0 && near(bl[2].hi, 100) && bl[1].prio === 800 && bl[1].mat === 'conc', 'bands to the wall\'s left of its centre line, sorted: -100..-80 (layer 2), -80..80 (layer 1, 800), 80..100 (layer 0)');
  ok(br.length === 3 && br[0].index === 0 && near(br[0].lo, -100), 'exterior on the right: layer 0 is the band -100..-80; a membrane of no thickness has no band');

  // T: the host runs along x (y = -100..100); the stem comes up from below at x = 2000 (x = 1900..2100) and stops on the host's face y = -100.
  // The stem's core (x = 1920..2080, 800) passes the host's finish (y = -100..-80, 200) and stops at the host's core (y = -80, 800 = as strong):
  // the piece is the rectangle x 1920..2080, y -100..-80 = 160 x 20 = 3200 mm2. The stem's finishes (200) stop at the host's finish (200).
  const host = { key: 'H', a: [0, 0], b: [4000, 0], bands: bl, body: [[0, -100], [4000, -100], [4000, 100], [0, 100]], end: null };
  // the stem runs (2000, -3000) -> (2000, 0): its left is -x, so its left face is x = 1900 and its end is cut from (1900, -100) to (2100, -100)
  const stem = { key: 'S', a: [2000, -3000], b: [2000, 0], bands: bl, body: [[1900, -3000], [2100, -3000], [2100, -100], [1900, -100]], end: 'b', face: [[1900, -100], [2100, -100]] };
  let j = cleanJunction({ kind: 'T', walls: [host, stem] });
  ok(j.adds.length === 1 && j.adds[0].wall === 'S' && j.adds[0].band === 1 && j.adds[0].into === 'H' && near(polyArea(j.adds[0].poly), 3200) && box(j.adds[0].poly).every((v, i) => near(v, [1920, -100, 2080, -80][i])), 'T: the stem\'s core is carried through the host\'s finish to the host\'s core: x 1920..2080, y -100..-80 (3200 mm2)', j.adds);
  ok(j.cuts.length === 1 && j.cuts[0].wall === 'H' && near(polyArea(j.cuts[0].poly), 3200), 'the same rectangle is taken out of the host\'s layers');
  // lines: the two sides of the piece (core against the host's finish, other material); none at y = -80 (core meets core, same material)
  ok(j.lines.length === 2 && hasLine(j.lines, [1920, -100], [1920, -80]) && hasLine(j.lines, [2080, -100], [2080, -80]), 'lines only at its two sides (x = 1920 and x = 2080); none where core meets core', j.lines);
  // equal priorities never cut: a stem of finish only (200) against the host's finish (200) carries nothing, and no line (same material)
  j = cleanJunction({ kind: 'T', walls: [host, { ...stem, bands: layerBands([{ t: 200, function: 'finish', mat: 'gyp' }]) }] });
  ok(j.adds.length === 0 && j.cuts.length === 0 && j.lines.length === 0, 'equal priority never cuts: a finish-only stem stops at the host\'s finish, nothing drawn (same material)');
  // ... and with another material the contact gets its line: the stem's whole end (1900..2100 at y = -100)
  j = cleanJunction({ kind: 'T', walls: [host, { ...stem, bands: layerBands([{ t: 200, function: 'finish', mat: 'tile' }]) }] });
  ok(j.adds.length === 0 && j.lines.length === 1 && hasLine(j.lines, [1900, -100], [2100, -100]), 'another material at equal priority: one line along the contact (1900..2100 at y = -100)', j.lines);
  // a stem whose core is stronger than everything in the host (900 against 800) goes right through to the far face y = 100: 160 x 200 = 32 000
  j = cleanJunction({ kind: 'T', walls: [host, { ...stem, bands: layerBands([{ t: 20, function: 'finish', mat: 'gyp' }, { t: 160, function: 'structure', mat: 'steel', priority: 900 }, { t: 20, function: 'finish', mat: 'gyp' }]) }] });
  ok(j.adds.length === 1 && near(polyArea(j.adds[0].poly), 32000) && j.lines.length === 6 && hasLine(j.lines, [1920, -100], [1920, -80]) && hasLine(j.lines, [1920, -80], [1920, 80]) && hasLine(j.lines, [2080, 80], [2080, 100]), 'a layer stronger than all of the host goes through to the far face (160 x 200 = 32 000 mm2); its sides are lines all the way (three stretches each: steel against finish, concrete, finish), its end is the outline', j.lines);

  // L, mitred: A comes from the left (finish 20 / concrete 160 / finish 20), B goes up and is 200 of the same concrete. The mitre runs from the inner
  // corner (-100, 100) to the outer corner (100, -100). B's concrete (800) faces A's finishes (200) on two stretches of the mitre and is carried
  // DOWN (B's direction past its end) into them until A's concrete or A's far face:
  //   inner: mitre from (-100, 100) to (-80, 80), down to y = 80: triangle (-100, 100) (-80, 80) (-100, 80) = 20 x 20 / 2 = 200 mm2
  //   outer: mitre from (80, -80) to (100, -100), down to y = -100: triangle (80, -80) (100, -100) (80, -100) = 200 mm2
  // lines: x = -100 from 100 to 80 and x = 80 from -80 to -100 (concrete against A's finish); none against A's concrete (same material)
  const LA = { key: 'A', a: [-4000, 0], b: [0, 0], bands: bl, body: [[-4000, -100], [100, -100], [-100, 100], [-4000, 100]], end: 'b', face: [[-100, 100], [100, -100]] };
  const LB = { key: 'B', a: [0, 0], b: [0, 4000], bands: layerBands([{ t: 200, function: 'structure', mat: 'conc' }]), body: [[100, -100], [100, 4000], [-100, 4000], [-100, 100]], end: 'a', face: [[-100, 100], [100, -100]] };
  j = cleanJunction({ kind: 'L', walls: [LA, LB] });
  ok(j.adds.length === 2 && j.adds.every((a) => a.wall === 'B' && a.into === 'A' && near(polyArea(a.poly), 200)), 'mitred L, a concrete wall against a layered one: the concrete takes two 200 mm2 triangles of the other wall\'s finishes', j.adds);
  ok(j.lines.length === 2 && hasLine(j.lines, [-100, 100], [-100, 80]) && hasLine(j.lines, [80, -80], [80, -100]), 'lines where concrete meets finish (x = -100 and x = 80); none where concrete meets concrete', j.lines);
  // two walls of the same layers mitred: every layer faces its twin: nothing to do
  j = cleanJunction({ kind: 'L', walls: [LA, { ...LB, bands: bl }] });
  ok(j.adds.length === 0 && j.cuts.length === 0 && j.lines.length === 0, 'a mitre of two walls with the same layers needs nothing (each layer meets its twin)');
  // L, butt (A runs through to x = 100; B, the same layers, stops on A's side y = 100, its end (-100, 100) to (100, 100)): B's core x -80..80 is
  // carried down through A's finish y 80..100 to A's core: 160 x 20 = 3200; lines at x = -80 and x = 80 from y = 100 to 80
  j = cleanJunction({ kind: 'L', walls: [{ ...LA, body: [[-4000, -100], [100, -100], [100, 100], [-4000, 100]], face: [[100, 100], [100, -100]] }, { ...LB, bands: bl, body: [[100, 100], [100, 4000], [-100, 4000], [-100, 100]], face: [[-100, 100], [100, 100]] }] });
  ok(j.adds.length === 1 && j.adds[0].wall === 'B' && near(polyArea(j.adds[0].poly), 3200) && j.lines.length === 2 && hasLine(j.lines, [-80, 100], [-80, 80]) && hasLine(j.lines, [80, 100], [80, 80]), 'butt L: the stopping wall\'s core is carried to the through wall\'s core (160 x 20 = 3200 mm2), lines at its two sides', [j.adds, j.lines]);

  // X: the through wall along x; the other crosses at x = 2000. Its own layers are cut out of the crossing (x 1900..2100, y -100..100 = 40 000) and its
  // core is carried in from both faces to the through wall's core: two rectangles 160 x 20
  const XO = { key: 'O', a: [2000, -1000], b: [2000, 1000], bands: bl, body: [[1900, -1000], [2100, -1000], [2100, 1000], [1900, 1000]], end: null };
  j = cleanJunction({ kind: 'X', walls: [host, XO], through: 'H' });
  ok(j.cuts.filter((c2) => c2.wall === 'O').length === 1 && near(polyArea(j.cuts.find((c2) => c2.wall === 'O').poly), 40000) && j.adds.length === 2 && j.adds.every((a) => a.wall === 'O' && near(polyArea(a.poly), 3200)) && j.cuts.filter((c2) => c2.wall === 'H').length === 2, 'X: the crossing wall\'s layers are cut out of the crossing (40 000 mm2) and its core carried in from both sides (2 x 3200 mm2)', j);
  ok(j.lines.length === 4 && hasLine(j.lines, [1920, -100], [1920, -80]) && hasLine(j.lines, [2080, 100], [2080, 80]), 'four short lines, at the sides of the two pieces');
  j = cleanJunction({ kind: 'X', walls: [host, XO], through: 'O' });
  ok(j.cuts.filter((c2) => c2.wall === 'H').length === 1 && j.adds.every((a) => a.wall === 'H'), 'the other wall continuous: the roles swap');
  // not handled: walls nearly in line, a wall with no bands
  ok(cleanJunction({ kind: 'L', walls: [LA, { ...LA, key: 'Z', a: [0, 0], b: [4000, 50], end: 'a' }] }).adds.length === 0 && cleanJunction({ kind: 'T', walls: [host, { ...stem, bands: [] }] }).adds.length === 0, 'walls within 5 degrees of one line, or a wall without layers: left alone');
  // the host helpers: a 10 x 10 square minus the strip x 4..6 leaves 4 x 10 on each side; a line across it keeps 0..4 and 6..10
  const parts = subtractConvex([[0, 0], [10, 0], [10, 10], [0, 10]], [[4, -1], [6, -1], [6, 11], [4, 11]]);
  ok(parts.length === 2 && parts.every((q) => near(Math.abs(polyArea(q)), 40)), 'subtractConvex: a 10 x 10 square minus the strip x 4..6 = two pieces of 40 mm2');
  const segs = segmentOutside([[0, 5], [10, 5]], [[4, -1], [6, -1], [6, 11], [4, 11]]);
  ok(segs.length === 2 && near(segs[0][1][0], 4, 1e-5) && near(segs[1][0][0], 6, 1e-5) && segmentOutside([[4, 0], [4, 10]], [[4, -1], [6, -1], [6, 11], [4, 11]]).length === 0 && segmentOutside([[0, 20], [10, 20]], [[4, -1], [6, -1], [6, 11], [4, 11]]).length === 1, 'segmentOutside: 0..4 and 6..10 stay; a line on the edge is taken; a line that misses stays whole');
}

console.log('== walls moved together by different vectors keep their joins (walls-join-10, FX.62: Align and Distribute)');
{
  // A runs (0,0) -> (3000,0), B (3000,0) -> (3000,2000): an L at (3000, 0). A goes 300 up, B 400 to the left: A's new line is y = 300, B's is x = 2600,
  // so the corner goes to (2600, 300); the far ends just move: A's start (0, 300), B's end (2600, 2000)
  const A = { guid: 'A', storey: 1, a: [0, 0], b: [3000, 0], t: 100 }, B = { guid: 'B', storey: 1, a: [3000, 0], b: [3000, 2000], t: 100 };
  let pl = moveJoinedTogether([A, B], new Map([['A', [0, 300]], ['B', [-400, 0]]]));
  ok(nearP(pl.get('A').a, [0, 300]) && nearP(pl.get('A').b, [2600, 300]) && nearP(pl.get('B').a, [2600, 300]) && nearP(pl.get('B').b, [2600, 2000]), 'an L, each wall its own vector: the corner goes where the two moved lines meet, (2600, 300)');
  pl = moveJoinedTogether([A, B], new Map([['A', [0, 300]], ['B', [0, 300]]]));
  ok(nearP(pl.get('A').b, [3000, 300]) && nearP(pl.get('B').a, [3000, 300]) && nearP(pl.get('B').b, [3000, 2300]), 'the same vector for both (a Move): the corner is carried as it is, (3000, 300), as before');
  // a T: the host (0,0) -> (4000,0) goes 200 down, the partition (2000,0) -> (2000,3000) 500 to the right: its end stays on the moved host at (2500, -200)
  const H = { guid: 'H', storey: 1, a: [0, 0], b: [4000, 0], t: 100 }, P = { guid: 'P', storey: 1, a: [2000, 0], b: [2000, 3000], t: 100 };
  pl = moveJoinedTogether([H, P], new Map([['H', [0, -200]], ['P', [500, 0]]]));
  ok(nearP(pl.get('P').a, [2500, -200]) && nearP(pl.get('P').b, [2500, 3000]) && nearP(pl.get('H').a, [0, -200]) && nearP(pl.get('H').b, [4000, -200]), 'a T, host and partition moved differently: the partition\'s end stays on the moved host, (2500, -200)');
}

// ------------------------------------------------------------------------------------------------ shape.js on curved walls (walls-shape-10)
// Known answers (by hand, mm). A quarter-circle wall: centre line 5000 long, so R = 10000/π = 3183.10; 200 thick, 3000 high; its outline in
// n = 23 chords per face (δ = 90°/23 each). Ring between Ro = R + 100 and Ri = R − 100 in chords: n · ½ · (Ro² − Ri²) · sin δ
// = the true ring (t · L = 1.0e6 mm²) × sin δ / δ = 999 223 mm². Flat top at 3000: × 3000 = 2.99767e9 mm³.
// Gable 3000 → 4500 → 3000 along the arc: true ring t · ∫z ds = 200 · 18.75e6 = 3.75e9; in chords × sin δ / δ = 3.7471e9 (to 0.02 %).
// Single slant 10° towards the centre: t · θ · (R·H − tan10° · H²/2) = 200 · 1.570796 · 8755819 = 2.7507e9, in chords 2.7486e9.
// A slanted straight wall cut 1200 above its base at 10°: the outline moves tan10° · 1200 = 211.59 to its left.
{
  const { shapeBody, arcFrame, lineBreaks, cutOutline, profileAt } = await import('../shape.js');
  console.log('== shape: curved walls (profile, slant, breaks) and the slanted plan outline (walls-shape-10)');
  const R = 10000 / Math.PI, n = 23, th = Math.PI / 2, d = th / n, k = Math.sin(d) / d;
  const w = { a: [R, 0], b: [0, R], t: 200, bulge: Math.tan(Math.PI / 8), height: 3000 };
  const F = arcFrame(w);
  ok(near(F.L, 5000, 1e-6) && near(F.R, R, 1e-6) && F.sg === 1 && near(F.C[0], 0, 1e-6) && near(F.C[1], 0, 1e-6), 'arcFrame: the quarter circle about the origin, 5000 long');
  const q = F.toL([(R - 100) * Math.cos(th / 2), (R - 100) * Math.sin(th / 2)]);
  ok(near(q[0], 2500, 1e-6) && near(q[1], 100, 1e-6), 'a point 100 inside the arc at its middle: 2500 along, 100 to the left', q);
  ok(arcFrame({ a: [0, 0], b: [5000, 0], t: 200 }) === null, 'a straight wall has no arc frame');
  const out = [];
  for (let i = 0; i <= n; i++) out.push([(R + 100) * Math.cos(d * i), (R + 100) * Math.sin(d * i)]);
  for (let i = n; i >= 0; i--) out.push([(R - 100) * Math.cos(d * i), (R - 100) * Math.sin(d * i)]);
  let B = shapeBody(w, out, { topAt: () => 3000, baseAt: () => 0 });
  ok(near(B.footArea, 1e6 * k, 1e-3) && near(B.volume, 3e9 * k, 10), 'flat top: the ring in 23 chords, 999 223 mm² × 3000 = 2.99767e9 mm³', [B.footArea, B.volume]);
  ok(near(B.sideArea, 15e6, 1e-3), 'side area along the centre line: 5000 × 3000', B.sideArea);
  const top = [[0, 3000], [2500, 4500], [5000, 3000]];
  B = shapeBody(w, out, { topAt: (p, s) => profileAt(top, s), baseAt: () => 0, breaks: [2500] });
  ok(Math.abs(B.volume - 3.75e9 * k) < 5e5 && near(B.sideArea, 18.75e6, 1e-3), 'gable along the arc: 3.7471e9 mm³, side 18.75e6 mm²', [B.volume, B.sideArea]);
  ok(Math.max(...B.verts.map((v) => v[2])) === 4500 && B.verts.some((v) => v[2] === 4500 && near(Math.hypot(v[0], v[1]), R + 100, 1e-6)), 'a ring vertex at the peak, on the face where the break crosses it', Math.max(...B.verts.map((v) => v[2])));
  B = shapeBody(w, out, { topAt: () => 3000, baseAt: () => 0, slant: [10] });
  const vs = 200 * th * (R * 3000 - Math.tan(10 * Math.PI / 180) * 3000 * 3000 / 2);
  ok(Math.abs(B.volume - vs * k) < 5e5, 'single slant 10° towards the centre: 2.7486e9 mm³', [B.volume, vs * k]);
  const edges = new Map();
  for (const f of B.faces) for (let i = 0; i < f.length; i++) { const a = f[i], b = f[(i + 1) % f.length], key = Math.min(a, b) + ':' + Math.max(a, b); edges.set(key, (edges.get(key) || 0) + (a < b ? 1 : -1)); }
  ok([...edges.values()].every((v) => v === 0), 'the shell is closed: every edge is used once each way', [...edges.values()].filter((v) => v !== 0).length);
  let low = null;
  try { shapeBody(w, out, { topAt: (p, s) => (s > 4000 ? 5 : 3000), baseAt: () => 0 }); } catch (e) { low = e.key; }
  ok(low === 'wshape.err.low', 'a top under 10 mm is refused on a curved wall too', low);
  const br = lineBreaks(w, [[[0, 0], [6000, 6000], [0, 6000]]]).filter((s) => s > 1 && s < 4999);
  ok(br.length === 3 && br.every((s) => near(s, 2500, 1e-6)), 'a line through the centre at 45° crosses both faces and the centre line at 2500', br);
  const sq = [[0, -100], [5000, -100], [5000, 100], [0, 100]], lean = Math.tan(10 * Math.PI / 180) * 1200;
  let c = cutOutline({ a: [0, 0], b: [5000, 0], t: 200, height: 3000 }, sq, { slant: [10], cut: 1200 });
  ok(c.every((p, i) => near(p[0], sq[i][0], 1e-9) && near(p[1], sq[i][1] + lean, 1e-9)), 'cutOutline: 10° at 1200 above the base moves the outline 211.59 to the left', c);
  ok(cutOutline({ a: [0, 0], b: [5000, 0], t: 200 }, sq, { slant: null, cut: 1200 }) === sq, 'no slant: the outline itself');
  c = cutOutline(w, out, { slant: [10], cut: 1200 });
  ok(near(Math.hypot(...c[0]), R + 100 - lean, 1e-6) && near(Math.hypot(...c[c.length - 1]), R - 100 - lean, 1e-6), 'a curved wall leans along its radius: both faces 211.59 nearer the centre', [Math.hypot(...c[0]), Math.hypot(...c[c.length - 1])]);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
