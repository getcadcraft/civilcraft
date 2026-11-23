/* SPDX-License-Identifier: Apache-2.0 */
import { pointInPolygon, pointInRing, signedArea, ringArea } from '../geom2d.js';
import * as V from '../geom-vec.js';
import { compare } from '../../../tools/geom2d/sync.mjs';

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };

// the one function the 18 hand copies were: same answers as the old inline text on a grid of points, a square and a concave "L"
const old = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const p = poly[i], q = poly[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };
const square = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
const ell = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 10 }, { x: 0, y: 10 }];
ok(pointInPolygon(5, 5, square) && !pointInPolygon(11, 5, square) && !pointInPolygon(-0.1, 5, square), 'a square');
ok(pointInPolygon(2, 8, ell) && pointInPolygon(8, 2, ell) && !pointInPolygon(8, 8, ell), 'a concave L');
ok(!pointInPolygon(1, 1, []) && !pointInPolygon(1, 1, [{ x: 0, y: 0 }]) && !pointInPolygon(1, 1, [{ x: 0, y: 0 }, { x: 5, y: 5 }]), 'fewer than three points is never inside');
let same = true;
for (const poly of [square, ell]) for (let x = -2; x <= 12; x += 0.5) for (let y = -2; y <= 12; y += 0.5) if (pointInPolygon(x, y, poly) !== old(poly, x, y)) same = false;
ok(same, 'identical to the old inline text on a half-unit grid (edges included)');
ok(pointInPolygon(0, 0, square) !== pointInPolygon(10, 10, square), 'edges are half-open: the bottom-left corner is in, the top-right is out');
// 0.11: the array-point twins answer exactly as the {x, y} ones; areas are counter-clockwise positive
let twins = true;
for (const poly of [square, ell, []]) { const ring = poly.map((p) => [p.x, p.y]); for (let x = -2; x <= 12; x += 0.5) for (let y = -2; y <= 12; y += 0.5) if (pointInRing(x, y, ring) !== pointInPolygon(x, y, poly)) twins = false; if (!Object.is(ringArea(ring), signedArea(poly))) twins = false; }
ok(twins, 'pointInRing / ringArea answer bit for bit as pointInPolygon / signedArea');
ok(signedArea(square) === 100 && signedArea([...square].reverse()) === -100 && signedArea(ell) === 64 && ringArea([]) === 0, 'shoelace: 100, -100 reversed, the L 64, empty 0');
ok(V.dot3([1, 2, 3], [4, 5, 6]) === 32 && V.cross3([1, 0, 0], [0, 1, 0]).join() === '0,0,1' && V.len3([2, 3, 6]) === 7 && V.unit3([0, 0, 0]).join() === '0,0,0', 'geom-vec 3D');
ok(V.cross2([1, 0], [0, 1]) === 1 && V.dist2([0, 0], [3, 4]) === 5 && V.unit2([0, 0]).join() === '1,0' && V.mid2([0, 0], [2, 4]).join() === '1,2', 'geom-vec 2D');
ok(V.affineMul([1, 0, 0, 1, 5, 6], [2, 0, 0, 2, 0, 0]).join() === '2,0,0,2,5,6' && V.affineMul([2, 0, 0, 2, 0, 0], [1, 0, 0, 1, 5, 6]).join() === '2,0,0,2,10,12', 'affineMul: b first, then a');
for (const r of compare()) ok(r.state === 'ok', `${r.to} is a byte copy of lib/geom2d/${r.file} (node tools/geom2d/sync.mjs)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
