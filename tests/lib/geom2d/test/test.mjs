/* SPDX-License-Identifier: Apache-2.0 */
import { pointInPolygon } from '../geom2d.js';
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
for (const r of compare()) ok(r.state === 'ok', `${r.to} is a byte copy of lib/geom2d/geom2d.js (node tools/geom2d/sync.mjs)`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
