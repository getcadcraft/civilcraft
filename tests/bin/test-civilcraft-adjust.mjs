#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-adjust.mjs — CivilCraft 0.8 EG.11: least-squares network adjustment (adjust.js), DOM-free.
 * Known answers: a height seen twice (10.00, 10.04) adjusts to 10.02 with residuals ∓0.02; a levelling loop; a point from four distances equals an independent
 * minimiser of Σ(v/σ)²; perfect data leave zero residuals; one planted blunder gets the largest standardised residual and is flagged; a plain 2-distance fix has
 * the ellipse axes k·σ; a network with simulated noise of the stated σ passes the χ² test; directions with an unknown orientation per set are recovered.
 *   node bin/test-civilcraft-adjust.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const A = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'adjust.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
let seed = 12345; const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-12)) * Math.cos(2 * Math.PI * rnd());

// levelling
{
  const r = A.adjustLevels({ A: { h: 0, fixed: true }, B: { h: 0 } }, [{ from: 'A', to: 'B', dh: 10.0, length: 1 }, { from: 'A', to: 'B', dh: 10.04, length: 1 }]);
  near(r.heights.B.h, 10.02, 1e-9, 'a height seen twice = mean'); near(r.residuals[0], 0.02, 1e-9, 'residual +'); near(r.residuals[1], -0.02, 1e-9, 'residual −');
  const w = A.adjustLevels({ A: { h: 0, fixed: true }, B: { h: 0 } }, [{ from: 'A', to: 'B', dh: 10.0, length: 1 }, { from: 'A', to: 'B', dh: 10.06, length: 3 }]);
  near(w.heights.B.h, (10.0 * 1 + 10.06 / 3) / (1 + 1 / 3), 1e-9, 'weighted by 1/length');
  // a loop A-B-C-A, misclosure 0.03 spread by length
  const l = A.adjustLevels({ A: { h: 100, fixed: true }, B: { h: 0 }, C: { h: 0 } }, [{ from: 'A', to: 'B', dh: 1.0, length: 1 }, { from: 'B', to: 'C', dh: 2.0, length: 1 }, { from: 'C', to: 'A', dh: -3.03, length: 1 }]);
  near(l.heights.B.h, 101.01, 1e-9, 'loop B'); near(l.heights.C.h, 103.02, 1e-9, 'loop C'); near(l.dof, 1, 0, 'one degree of freedom');
}
// four distances to one point
{
  const C = { P1: [0, 0], P2: [100, 0], P3: [100, 100], P4: [0, 100] };
  const pts = { P: { x: 48, y: 52 } }; for (const [k, v] of Object.entries(C)) pts[k] = { x: v[0], y: v[1], fixed: true };
  const truth = { x: 50, y: 50 }, noise = [0.02, -0.01, 0.015, -0.03];
  const obs = Object.entries(C).map(([k, v], i) => ({ type: 'dist', from: k, to: 'P', value: Math.hypot(truth.x - v[0], truth.y - v[1]) + noise[i], sd: 0.01 }));
  const r = A.adjustNetwork(pts, obs);
  ok(r.converged, 'converged'); near(r.dof, 2, 0, 'dof 2');
  // independent minimiser
  const f = (x, y) => obs.reduce((s, o) => s + ((o.value - Math.hypot(x - C[o.from][0], y - C[o.from][1])) / 0.01) ** 2, 0);
  let x = 50, y = 50, h = 1; for (let i = 0; i < 4000; i++) { const f0 = f(x, y); let moved = false; for (const [dx, dy] of [[h, 0], [-h, 0], [0, h], [0, -h]]) if (f(x + dx, y + dy) < f0) { x += dx; y += dy; moved = true; break; } if (!moved) h /= 2; if (h < 1e-12) break; }
  near(r.points.P.x, x, 1e-6, 'x equals the independent minimiser'); near(r.points.P.y, y, 1e-6, 'y equals the independent minimiser');
  near(r.chi2.value, f(r.points.P.x, r.points.P.y), 1e-6, 'χ² = Σ(v/σ)²');
  near(r.obs.reduce((s, o) => s + (o.v / 0.01) ** 2, 0), r.chi2.value, 1e-6, 'residuals reproduce χ²');
  ok(r.ellipses.P.semiMajor >= r.ellipses.P.semiMinor && r.ellipses.P.semiMinor > 0, 'ellipse axes ordered');
}
// perfect data
{
  const pts = { A: { x: 0, y: 0, fixed: true }, B: { x: 100, y: 0, fixed: true }, C: { x: 40, y: 40 } };
  const obs = [{ type: 'dist', from: 'A', to: 'C', value: Math.hypot(50, 60), sd: 0.01 }, { type: 'dist', from: 'B', to: 'C', value: Math.hypot(50, 60), sd: 0.01 }, { type: 'az', from: 'A', to: 'C', value: Math.atan2(50, 60), sd: 1e-5 }];
  const r = A.adjustNetwork(pts, obs); near(r.points.C.x, 50, 1e-6, 'perfect x'); near(r.points.C.y, 60, 1e-6, 'perfect y'); ok(r.obs.every((o) => Math.abs(o.v) < 1e-7), 'zero residuals');
}
// a plain two-distance fix: ellipse = k·σ circle
{
  const pts = { A: { x: 0, y: 0, fixed: true }, B: { x: 100, y: 0, fixed: true }, P: { x: 60, y: 80 } };   // P at (0..): right angle at P? use two perpendicular lines instead
  const q = { A: { x: 0, y: 0, fixed: true }, B: { x: 0, y: 100, fixed: true }, P: { x: 50, y: 50 } };
  const r = A.adjustNetwork(q, [{ type: 'dist', from: 'A', to: 'P', value: 50, sd: 0.01 }, { type: 'vec', from: 'B', to: 'P', dx: 50, dy: -50, sdx: 0.01, sdy: 0.01 }]); void pts;
  ok(r.converged, 'vector fix converged'); ok(r.ellipses.P.semiMajor > 0, 'ellipse found');
  const ang = A.adjustNetwork({ A: { x: 0, y: 0, fixed: true }, B: { x: 100, y: 0, fixed: true }, P: { x: 50, y: 50 } }, [{ type: 'dist', from: 'A', to: 'P', value: Math.hypot(50, 50), sd: 0.01 }, { type: 'dist', from: 'B', to: 'P', value: Math.hypot(50, 50), sd: 0.01 }]);
  // A→P and B→P are perpendicular, so Qxx is diagonal-ish rotated: semi axes both k·σ/√(…): the two lines are at 90°, each pins one direction to σ
  near(ang.ellipses.P.semiMajor, 2.4477 * 0.01, 5e-5, 'perpendicular distances: axis k·σ'); near(ang.ellipses.P.semiMinor, 2.4477 * 0.01, 5e-5, 'both axes k·σ');
}
// blunder
{
  const names = ['P1', 'P2', 'P3', 'P4', 'P5'], pos = { P1: [0, 0], P2: [100, 0], P3: [100, 100], P4: [0, 100], P5: [50, 130] }, tr = { x: 48, y: 52 };
  const pts = { P: { x: 40, y: 40 } }; for (const n of names) pts[n] = { x: pos[n][0], y: pos[n][1], fixed: true };
  seed = 7; const obs = names.map((n) => ({ type: 'dist', from: n, to: 'P', value: Math.hypot(tr.x - pos[n][0], tr.y - pos[n][1]) + 0.004 * gauss(), sd: 0.005 }));
  obs[2].value += 0.5;
  const r = A.adjustNetwork(pts, obs, { alpha: 0.001 });
  const worst = r.obs.reduce((a, b, i) => (Math.abs(b.w) > Math.abs(r.obs[a].w) ? i : a), 0);
  ok(worst === 2, 'the blunder has the largest |w|'); ok(r.problems.some((p) => p.code === 'adj.blunder' && p.obs === 2), 'blunder reported'); ok(r.chi2.pass === false, 'χ² fails with a blunder');
  r.obs.splice(0); const clean = obs.map((o, i) => (i === 2 ? { ...o, value: o.value - 0.5 } : o)); const r2 = A.adjustNetwork(pts, clean);
  ok(!r2.problems.some((p) => p.code === 'adj.blunder'), 'clean data: no blunder flag');
}
// directions with orientation per set + distances; simulated noise passes χ²
{
  const ctrl = { A: [0, 0], B: [200, 0], C: [200, 150] }, free = { P: [90, 60], Q: [140, 90] };
  const pts = {}; for (const [k, v] of Object.entries(ctrl)) pts[k] = { x: v[0], y: v[1], fixed: true }; pts.P = { x: 80, y: 50 }; pts.Q = { x: 150, y: 80 };
  const all = { ...ctrl, ...free }, get = (n) => all[n];
  const azOf = (a, b) => Math.atan2(get(b)[0] - get(a)[0], get(b)[1] - get(a)[1]), dOf = (a, b) => Math.hypot(get(b)[0] - get(a)[0], get(b)[1] - get(a)[1]);
  seed = 99; const obs = [], sdD = 0.01, sdA = (3 / 3600) * Math.PI / 180;
  const orient = { A: 0.7, B: -1.1, P: 2.0, Q: 0.3 };
  const dirs = { A: ['P', 'Q', 'B', 'C'], B: ['Q', 'P', 'A', 'C'], P: ['A', 'B', 'Q', 'C'], Q: ['P', 'B', 'C', 'A'] };
  for (const [at, list] of Object.entries(dirs)) for (const to of list) obs.push({ type: 'dir', at, to, set: 1, value: azOf(at, to) - orient[at] + sdA * gauss(), sd: sdA });
  for (const [a, b] of [['A', 'P'], ['B', 'P'], ['P', 'Q'], ['C', 'Q'], ['B', 'Q'], ['A', 'Q'], ['C', 'P'], ['A', 'B']]) if (!(pts[a].fixed && pts[b].fixed)) obs.push({ type: 'dist', from: a, to: b, value: dOf(a, b) + sdD * gauss(), sd: sdD });
  const r = A.adjustNetwork(pts, obs);
  ok(r.converged, 'network converged'); near(r.points.P.x, 90, 0.05, 'P recovered x'); near(r.points.Q.y, 90, 0.05, 'Q recovered y');
  ok(r.chi2.pass, `χ² passes at the stated σ: ${r.chi2.value.toFixed(2)} in [${r.chi2.lo.toFixed(1)}, ${r.chi2.hi.toFixed(1)}] dof ${r.dof}`);
  ok(r.sigma0 > 0.6 && r.sigma0 < 1.5, 'σ0 near 1: ' + r.sigma0);
  near(r.orientations.find((o) => o.at === 'P').z, 2.0, 0.002, 'orientation of the set at P recovered'); void get;
}
// weighted control moves
{
  const pts = { A: { x: 0, y: 0, fixed: true }, B: { x: 100.03, y: 0, sx: 0.02, sy: 0.02 }, C: { x: 50, y: 80 } };
  const r = A.adjustNetwork(pts, [{ type: 'dist', from: 'A', to: 'B', value: 100, sd: 0.01 }, { type: 'dist', from: 'A', to: 'C', value: Math.hypot(50, 80), sd: 0.01 }, { type: 'dist', from: 'B', to: 'C', value: Math.hypot(50, 80), sd: 0.01 }]);
  ok(r.points.B.x < 100.03 && r.points.B.x > 100, 'weighted control is pulled between its stated place and the measurement');
}
ok(Math.abs(A.zCrit(0.001) - 3.29) < 0.01, 'critical z 3.29'); ok(Math.abs(A.zCrit(0.05) - 1.96) < 0.01, 'critical z 1.96');
ok(Math.abs(A.chi2Quantile(0.975, 10) - 20.483) < 0.1, 'χ² 97.5% at 10 dof'); ok(Math.abs(A.chi2Quantile(0.025, 10) - 3.247) < 0.1, 'χ² 2.5% at 10 dof');
console.log(`adjust: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
