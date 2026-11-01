#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-coverage.mjs — CivilCraft 0.8 EG.28 (civil_PART_4): coverage over terrain and the tower leg check (telecom.js), DOM-free.
 * Known answers: ITU-R P.526 J(0) = 6.03 dB, J(1) = 13.9 dB, no loss below v = -0.78; on flat ground every cell equals free-space loss; a ridge puts the cells behind it at
 * FSPL + J(v) of the ridge by hand and the cells in front are untouched; coverage falls with distance and rises with the transmit power; unknown ground leaves cells out;
 * tower legs by statics (square: M/2w + W/4; triangular: M/h + W/3) and Euler buckling by hand.
 *   node bin/test-civilcraft-coverage.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const T = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'telecom.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

near(T.knifeEdgeLoss(0), 6.9 + 20 * Math.log10(Math.sqrt(1.01) - 0.1), 1e-9, 'J(0) by the formula'); near(T.knifeEdgeLoss(0), 6.03, 0.01, 'J(0) = 6.03 dB');
near(T.knifeEdgeLoss(1), 13.93, 0.02, 'J(1) = 13.9 dB'); ok(T.knifeEdgeLoss(-0.8) === 0 && T.knifeEdgeLoss(-2) === 0, 'no loss below -0.78'); ok(T.knifeEdgeLoss(0.5) > T.knifeEdgeLoss(0) && T.knifeEdgeLoss(2) > T.knifeEdgeLoss(1), 'loss grows with v');
{ const lam = 299.792458 / 2000; near(T.diffractionV(10, 1000, 1000, lam), 10 * Math.sqrt((2 * 2000) / (lam * 1e6)), 1e-12, 'v by hand'); }

const flat = () => 100, tx = { x: 0, y: 0, h: 30 }, P = { f: 2, pt: 30, gt: 10, gr: 0, sensitivity: -90, rxH: 2, radius: 3000, step: 500 };
const C0 = T.coverage(flat, tx, P);
ok(C0.nx === 13 && C0.pr.length === 169, 'grid 13 x 13');
{ let worst = 0; for (let j = 0; j < C0.nx; j++) for (let i = 0; i < C0.nx; i++) { const x = C0.x0 + i * 500, y = C0.y0 + j * 500, D = Math.hypot(x, y), p = C0.pr[i + C0.nx * j]; if (D > 3000) { ok(Number.isNaN(p), 'outside the radius is empty'); continue; } const want = 30 + 10 - T.fspl(Math.max(D, 125) / 1000, 2000); worst = Math.max(worst, Math.abs(p - want)); } near(worst, 0, 0.5, 'flat ground = free space (worst cell difference, dB)'); }
ok(C0.covered === 1, 'a clear 3 km at 2 GHz is all covered (-90 dBm)');
{   // a ridge 1000 m east, 60 m above, across the whole width
  const ridge = (x) => (Math.abs(x - 1000) < 100 ? 160 : 100);
  const C1 = T.coverage(ridge, tx, { ...P, step: 100, radius: 2000 });
  const at = (x, y) => C1.pr[Math.round((x - C1.x0) / 100) + C1.nx * Math.round((y - C1.y0) / 100)];
  const front = at(500, 0), behind = at(1500, 0), clearFree = 30 + 10 - T.fspl(1.5, 2000);
  near(front, 30 + 10 - T.fspl(0.5, 2000), 0.5, 'in front of the ridge: free space');
  // the ridge top at 160 m; line height at d1=1000 of 1500: zA 130 -> zB 102: 130 + (102-130)*(1000/1500) = 111.3; h = 160 + bulge(1,0.5 km) 0.0295*... - line
  const bulge = (1 * 0.5) / (12.74 * 4 / 3), h = 160 + bulge - (130 + (102 - 130) * (1000 / 1500)), lam = 299.792458 / 2000, v = T.diffractionV(h, 1000, 500, lam);
  const want = clearFree - T.knifeEdgeLoss(v);
  near(behind, want, 1.2, 'behind the ridge: free space less J(v) of the ridge (' + v.toFixed(2) + ')');
  ok(behind < front - 20, 'a shadow behind the ridge'); ok(C1.covered < 1 && C1.covered > 0.3, 'some of the area is lost: ' + C1.covered.toFixed(3));
  ok(T.coverage(ridge, tx, { ...P, step: 100, radius: 2000, pt: 50 }).covered >= C1.covered, 'more power covers at least as much');
  ok(T.coverage(ridge, tx, { ...P, step: 100, radius: 2000, sensitivity: -60 }).covered <= C1.covered, 'a worse receiver covers less');
}
{   // unknown ground
  const half = (x) => (x > 0 ? NaN : 100); const C2 = T.coverage(half, tx, { ...P, radius: 1000, step: 500 });
  ok(Number.isNaN(C2.pr[C2.nx - 1 + C2.nx * 2]) && C2.cells < 25, 'cells over unknown ground are left out');
  ok(T.coverage(() => NaN, tx, P).cells === 0, 'transmitter off the ground: nothing');
}
// tower
{
  const sq = T.towerLegs({ legs: 4, width: 2, moment: 40000, vertical: 20 }); near(sq.compression, 10 + 5, 1e-9, 'square: M/2w + W/4'); near(sq.tension, 5, 1e-9, 'square: uplift M/2w - W/4');
  const tri = T.towerLegs({ legs: 3, width: 2, moment: 40000, vertical: 21 }); near(tri.compression, 40 / (2 * Math.sqrt(3) / 2) + 7, 1e-9, 'triangular: M/h + W/3');
  const cap = T.towerLegs({ legs: 4, width: 2, moment: 40000, vertical: 20, legCapacity: 30, loadFactor: 1.5 }); near(cap.utilization, 15 * 1.5 / 30, 1e-9, 'utilisation with the person\'s factor and capacity');
  ok(T.towerLegs({ legs: 4, width: 2, moment: 1, vertical: 0 }).utilization === null, 'no capacity given = no utilisation');
  const eu = T.towerLegs({ legs: 4, width: 2, moment: 40000, vertical: 20, I: 100, L: 2, E: 200 }); near(eu.pcr, Math.PI ** 2 * 200e9 * 1e-6 / 4 / 1000, 1e-6, 'Euler load'); near(eu.bucklingUtil, 15 / eu.pcr, 1e-9, 'buckling ratio');
  ok(T.towerLegs({ legs: 4, width: 2, moment: 1 }).pcr === null, 'no section = no buckling check');
}
console.log(`coverage: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
