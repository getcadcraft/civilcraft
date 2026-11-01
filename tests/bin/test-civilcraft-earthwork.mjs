#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-earthwork.mjs — CivilCraft 0.8 EG.70: the earthwork balancer (earthwork.js), DOM-free, in Node.
 *
 * By hand: ground z = 100 + 0.1·x over x, y in 0..100 (cells 1 × 1, sampled at centres: exact for a plane). A flat pad at 100 + u:
 *   fill = 1000·u²/2 ... cut = 1000·(10 − u)²/2 (t = 0.1x runs 0..10, 1000 = 10 in x per unit t × 100 in y). Balance with factor f: f·(10 − u)² = u²
 *   → u = 10√f / (1 + √f): 5 for f = 1 (cut = fill = 12 500) and 4.8683 for f = 0.9.
 * Haul: ten cells of cut at x 0..10 and ten of fill at x 20..30, 1 deep each: 10 + 10 units moved a mean of 20 → haul 200; two pairs across a map are matched near-to-near.
 *   node bin/test-civilcraft-earthwork.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const E = await import(pathToFileURL(path.join(APP, 'earthwork.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

const ground = { elevationAt: (x) => 100 + 0.1 * x };
const sq = [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }, { x: 0, y: 100 }];
const cells = E.cellsInside(ground, sq, { cell: 1 });
ok(cells.length === 10000, 'cells ' + cells.length);
const flat = E.planeOf({});
let b = E.balanceLevel(cells, flat, { area: 1, factor: 1 });
near(b.z0, 105, 1e-6, 'balanced level, factor 1'); near(b.cut, 12500, 1e-3, 'cut'); near(b.fill, 12500, 1e-3, 'fill');
b = E.balanceLevel(cells, flat, { area: 1, factor: 0.9 });
near(b.z0, 100 + (10 * Math.sqrt(0.9)) / (1 + Math.sqrt(0.9)), 1e-4, 'balanced level, factor 0.9');
near(b.cut * 0.9, b.fill, 1e-3, 'usable cut equals fill');
// swell: a factor over 1 (rock) means less cut is needed: level rises
ok(E.balanceLevel(cells, flat, { area: 1, factor: 1.2 }).z0 > 105, 'bulking cut raises the level');
// tilt: along the fall of the ground the least haul is a tilt as steep as allowed
const p0 = E.bestPlane(cells, { area: 1, factor: 1, maxGrade: 0 }), p5 = E.bestPlane(cells, { area: 1, factor: 1, maxGrade: 0.05 }), p10 = E.bestPlane(cells, { area: 1, factor: 1, maxGrade: 0.1 });
ok(p5.haulMoment <= p0.haulMoment * 0.501, 'a 5% tilt halves the haul (half the ground grade): ' + p5.haulMoment + ' vs ' + p0.haulMoment);
near(p5.gx, 0.05, 2e-3, 'tilt goes along the fall'); near(p5.gy, 0, 2e-3, 'no cross tilt');
near(p10.haulMoment, 0, 1, 'the ground\'s own grade needs no haul'); near(p10.gx, 0.1, 2e-3, 'tilt equals the ground grade');
near(p5.net, 0, 1e-3 * 12500, 'still balanced');
// minimum grade for drainage
const pm = E.bestPlane(cells, { area: 1, factor: 1, maxGrade: 0.05, minGrade: 0.01 });
ok(pm.grade >= 0.01 - 1e-9, 'minimum fall kept ' + pm.grade);
// haul plan
const row = (x0, n, zg) => Array.from({ length: n }, (_, k) => ({ x: x0 + k + 0.5, y: 0.5, zg }));
let hp = E.haulPlan([...row(0, 10, 1), ...row(20, 10, -1)], flat, 0, { area: 1, factor: 1, blocks: 100 });
near(hp.moved, 10, 1e-9, 'moved'); near(hp.haul, 200, 1e-6, 'haul by hand'); near(hp.avg, 20, 1e-9, 'average distance'); near(hp.spare + hp.short, 0, 1e-9, 'nothing left over');
const mk = (x, v) => Array.from({ length: v }, (_, k) => ({ x, y: 0.5, zg: 1 }));   // v cells of 1 cut at x (area 1)
const fl = (x, v) => Array.from({ length: v }, (_, k) => ({ x, y: 0.5, zg: -1 }));
hp = E.haulPlan([...mk(0, 10), ...mk(100, 10), ...fl(10, 10), ...fl(90, 10)], flat, 0, { area: 1, factor: 1, blocks: 100 });
near(hp.haul, 200, 1e-6, 'two pairs matched near to near (not 1800)');
hp = E.haulPlan([...row(0, 15, 1), ...row(20, 10, -1)], flat, 0, { area: 1, factor: 1, blocks: 100 });
near(hp.spare, 5, 1e-9, 'spare cut to take away'); near(hp.short, 0, 1e-9, 'none brought in');
hp = E.haulPlan([...row(0, 10, 1), ...row(20, 15, -1)], flat, 0, { area: 1, factor: 1, blocks: 100 });
near(hp.short, 5, 1e-9, 'fill to bring in');
hp = E.haulPlan([...row(0, 10, 1), ...row(20, 10, -1)], flat, 0, { area: 1, factor: 0.8, blocks: 100 });
near(hp.moved, 8, 1e-9, 'a lost fifth of the cut leaves two short'); near(hp.short, 2, 1e-9, 'short by two');
// whole site: balanced pad has a haul plan that closes
const site = E.haulPlan(cells, E.planeOf({ cx: 50, cy: 50, gx: p5.gx, gy: p5.gy }), p5.z0, { area: 1, factor: 1, blocks: 80 });
near(site.moved, p5.cut, p5.cut * 0.02, 'site haul moves the cut'); ok(site.avg > 0 && site.avg < 100, 'site average haul ' + site.avg.toFixed(1));
console.log(`earthwork: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
