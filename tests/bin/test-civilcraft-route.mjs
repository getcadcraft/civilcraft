#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-route.mjs — CivilCraft 0.8 EG.71: best route across the terrain (route.js), DOM-free, in Node.
 *
 * Known answers: on flat ground with no limits the best route is the straight line (within the grid's own error of a few percent); a ridge
 * that is too steep to cross except at a pass sends the route through the pass; a curve limit R is kept (every bend's chord radius >= R);
 * a forbidden wall with a gap sends the route through the gap; an area you dislike is avoided when going round is cheaper than going through;
 * and a route's earthwork across a cross-slope s on a road of width w is w²·s/4 per unit length (triangle of cut and of fill), by hand.
 *   node bin/test-civilcraft-route.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const R = await import(pathToFileURL(path.join(APP, 'route.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
const flat = { elevationAt: (x, y) => (x >= -50 && x <= 400 && y >= -150 && y <= 200 ? 10 : null) };

// 1. flat, straight
let r = R.findRoute(flat, { x: 0, y: 0 }, { x: 300, y: 100 }, { cell: 5 });
ok(r.found, 'found on flat ground');
near(r.length / Math.hypot(300, 100), 1, 0.03, 'straight within the grid error');
ok(r.maxGrade === 0, 'flat has no grade');

// 2. ridge with a pass
const ridge = { elevationAt: (x, y) => { if (x < -50 || x > 300 || y < -150 || y > 200) return null; const hg = Math.min(30, Math.abs(y) * 1.5); return hg * Math.max(0, 1 - Math.abs(x - 100) / 30); } };
r = R.findRoute(ridge, { x: 0, y: 60 }, { x: 200, y: 60 }, { cell: 4, maxGrade: 0.15, bounds: { minX: -40, minY: -100, maxX: 290, maxY: 150 } });
ok(r.found, 'found over the pass');
if (r.found) {
  ok(r.maxGrade <= 0.15 + 1e-9, 'grade kept ' + r.maxGrade);
  let cross = null;
  for (let i = 1; i < r.path.length; i++) { const a = r.path[i - 1], b = r.path[i]; if ((a.x - 100) * (b.x - 100) <= 0 && a.x !== b.x) cross = a.y + ((b.y - a.y) * (100 - a.x)) / (b.x - a.x); }
  ok(cross !== null && Math.abs(cross) <= 8, 'crosses the ridge at the pass, y = ' + cross);
  ok(r.length > 200 * 1.1, 'a detour, not the straight 200: ' + r.length.toFixed(0));
}
r = R.findRoute(ridge, { x: 0, y: 60 }, { x: 200, y: 60 }, { cell: 4, maxGrade: 0.01 });
ok(!r.found, 'a 1% limit cannot cross even the pass: ' + r.reason);

// 3. curve limit
r = R.findRoute(flat, { x: 0, y: 0 }, { x: 300, y: 120 }, { cell: 5, minRadius: 60 });
ok(r.found, 'found with a curve limit'); if (r.found) { ok(r.minRadius >= 60 * 0.999, 'curve limit kept, smallest radius ' + r.minRadius.toFixed(1)); ok(r.K >= 3, 'finer headings for the radius K=' + r.K); }
r = R.findRoute(flat, { x: 0, y: 0 }, { x: 300, y: 120 }, { cell: 5, minRadius: 0 });
ok(r.found && r.minRadius < 60, 'without the limit it bends sharper (or not at all)');

// 4. forbidden wall with a gap
const wall = [{ x: 140, y: -150 }, { x: 160, y: -150 }, { x: 160, y: 30 }, { x: 140, y: 30 }];
const wall2 = [{ x: 140, y: 60 }, { x: 160, y: 60 }, { x: 160, y: 200 }, { x: 140, y: 200 }];
r = R.findRoute(flat, { x: 0, y: 150 }, { x: 300, y: 150 }, { cell: 5, forbid: [wall, wall2], bounds: { minX: -40, minY: -100, maxX: 340, maxY: 190 } });
ok(r.found, 'found through the gap');
if (r.found) {
  const inside = r.path.some((p, i) => i && [wall, wall2].some((w) => { const a = r.path[i - 1]; for (let t = 0; t <= 1; t += 0.02) { const x = a.x + (p.x - a.x) * t, y = a.y + (p.y - a.y) * t; if (x > 141 && x < 159 && ((y > -149 && y < 29) || (y > 61 && y < 199))) return true; } return false; }));
  ok(!inside, 'never enters the wall');
}
r = R.findRoute(flat, { x: 0, y: 150 }, { x: 300, y: 150 }, { cell: 5, forbid: [[{ x: 140, y: -150 }, { x: 160, y: -150 }, { x: 160, y: 200 }, { x: 140, y: 200 }]] });
ok(!r.found, 'a closed wall cannot be crossed: ' + r.reason);

// 5. avoid: a costly square in the middle is skirted when the way round is cheaper
const bog = [{ x: 100, y: -40 }, { x: 200, y: -40 }, { x: 200, y: 40 }, { x: 100, y: 40 }];
r = R.findRoute(flat, { x: 0, y: 0 }, { x: 300, y: 0 }, { cell: 5, avoid: [{ poly: bog, factor: 10 }] });
ok(r.found && r.path.every((p) => !(p.x > 105 && p.x < 195 && Math.abs(p.y) < 35)), 'goes round the bog');
r = R.findRoute(flat, { x: 0, y: 0 }, { x: 300, y: 0 }, { cell: 5, avoid: [{ poly: bog, factor: 1.05 }] });
ok(r.found && r.length < 310, 'a mild dislike is crossed: ' + r.length.toFixed(0));

// 6. earthwork by hand: ground falls 0.1 across a route heading +x (z = 10 - 0.1 y), road 10 wide, no side slopes (sideSlope 0):
//    cross-slope s = 0.1; area of cut + fill = 2 · (w/2 · w/2 · s / 2)... the roadway sits at the centre height: half-width 5 -> 0.5 high each side, triangle 5 x 0.5 / 2 = 1.25 each side
//    -> cut 1.25 + fill 1.25 = 2.5 = w²·s/4 per unit length (10² · 0.1 / 4 = 2.5)
const slope = { elevationAt: (x, y) => (x >= -50 && x <= 500 && y >= -150 && y <= 150 ? 10 - 0.1 * y : null) };
r = R.findRoute(slope, { x: 0, y: 0 }, { x: 200, y: 0 }, { cell: 5, width: 10, sideSlope: 0, earthCost: 0.0001 });
ok(r.found, 'found on the slope');
if (r.found) near(r.earthwork / r.length, 2.5, 0.15, 'earthwork per unit length = w²·s/4');
console.log(`route: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
