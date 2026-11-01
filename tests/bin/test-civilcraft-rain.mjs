#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-rain.mjs — CivilCraft 0.8 EG.69 "Make it rain": rain.js (2D overland flow), DOM-free, in Node.
 *
 * Known answers:
 *  1. Rain on a plane (kinematic wave, Chow, Maidment and Mays 1988 Applied Hydrology § 8; Henderson and Wooding 1964). Slope S, Manning n,
 *     rain i, length L. alpha = sqrt(S)/n, m = 5/3. Outflow per unit width while rising: q = alpha*(i*t)^m (water depth at the foot h = i*t);
 *     equilibrium: q = i*L at t_e = (L/(alpha*i^(m-1)))^(1/m).
 *  2. Mass: rain = loss + out + drained + stored.
 *  3. A closed bowl: water level after rain of depth d on a V pit = volume balance by hand; overtopping time = capacity / (rain on the catchment).
 *  4. Priority-Flood depressions: volume of a made-up pit by hand.
 *  5. alternatingBlock sums to the IDF depth.
 *  node bin/test-civilcraft-rain.mjs [--build dev|x.y] [--big]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const R = await import(pathToFileURL(path.join(APP, 'rain.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

// 1. plane
{
  const S = 0.02, n = 0.03, iMM = 60, L = 100, dx = 2, nx = L / dx, ny = 3;
  const z = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) z[j * nx + i] = S * (L - (i + 0.5) * dx);   // falls toward +x
  const dem = R.demFromGrid(z, nx, ny, dx);
  const sim = new R.RainSim(dem, { rain: iMM, duration: 60, tEnd: 40, n, edge: 'closed', sides: { e: true }, edgeSlope: S, dtMax: 2, rec: 10 });
  const res = sim.run();
  const i = iMM / 3.6e6, a = Math.sqrt(S) / n, m = 5 / 3, te = Math.pow(L / (a * Math.pow(i, m - 1)), 1 / m);
  const W = ny * dx;
  ok(te > 300 && te < 900, 'te sane ' + te);
  for (const frac of [0.5, 0.8]) {
    const t = te * frac, row = res.hydrograph.reduce((b, r) => (Math.abs(r.t - t) < Math.abs(b.t - t) ? r : b));
    const want = a * Math.pow(i * row.t, m) * W;
    near(row.out / want, 1, 0.12, `rising limb at ${row.t.toFixed(0)} s (${(frac * 100)}% of te)`);
  }
  const eq = res.hydrograph.reduce((b, r) => (Math.abs(r.t - 2300) < Math.abs(b.t - 2300) ? r : b));
  near(eq.out / (i * L * W), 1, 0.03, 'equilibrium outflow = i·L·W');
  near(res.volumes.error, 0, 1e-6, 'mass closes (plane)');
  console.log('plane: te', te.toFixed(0), 's, peak', res.peak.q.toFixed(4), 'vs', (i * L * W).toFixed(4), 'm3/s, steps', res.steps);
}
// 2/3. a pit: priority flood fills a basin up to its lowest rim; the map edge is an outlet
{
  const N = 21, dx = 1, z = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) z[j * N + i] = 0.1 * Math.max(Math.abs(i - 10), Math.abs(j - 10));   // pyramid, 0 at the centre, 1.0 on the edge
  for (let k = 0; k < N; k++) { z[k] = 2; z[(N - 1) * N + k] = 2; z[k * N] = 2; z[k * N + N - 1] = 2; }   // a ring of 2.0 all round = the rim
  const d2 = R.findDepressions(R.demFromGrid(z, N, N, dx), { minDepth: 0.001 });
  ok(d2.ponds.length === 1, 'one pond, got ' + d2.ponds.length);
  const p = d2.ponds[0];
  let want = 0; for (let j = 1; j < N - 1; j++) for (let i = 1; i < N - 1; i++) want += 2 - z[j * N + i];
  near(p.volume, want, 1e-9, 'pond volume by hand (to the 2.0 rim)');
  near(p.sill, 2, 1e-9, 'sill');
  const sim = new R.RainSim(R.demFromGrid(z, N, N, dx), { rain: 200, duration: 30, tEnd: 45, n: 0.03, edge: 'closed', minPond: 0.001, dtMax: 2 });
  const res = sim.run();
  near(res.volumes.error, 0, 1e-6, 'mass closes (pit)');
  near(res.volumes.stored, 0.1 * 441, 0.1 * 441 * 1e-3, 'everything stays in a closed map');
  ok(!res.ponds[0].overtopped, 'a 100 mm storm does not fill a pit 1.6 m deep');
}
// 4. overtopping: a basin whose rim is a few cm above its floor, fed by its own catchment, spills at the time the volume balance says
{
  const N = 31, dx = 1, z = new Float64Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const r = Math.max(Math.abs(i - 15), Math.abs(j - 15)); z[j * N + i] = r <= 2 ? -0.03 * (3 - r) + 0.09 : 0.09 + 0.001 * (r - 2); }
  const dem = R.demFromGrid(z, N, N, dx);
  const dep = R.findDepressions(dem, { minDepth: 0.002 });
  ok(dep.ponds.length >= 1, 'pond found');
  const sim = new R.RainSim(dem, { rain: 150, duration: 900, tEnd: 900, edge: 'open', minPond: 0.002, dtMax: 2, n: 0.03 });
  const res = sim.run();
  near(res.volumes.error, 0, 1e-6, 'mass closes (catchment)');
  const big = res.ponds.reduce((a, b) => (b.volume > a.volume ? b : a));
  console.log('pit: capacity', big.volume.toFixed(3), 'm3, rain on the map', res.volumes.rain.toFixed(2), 'overtopped', big.overtopped, big.overtopAt, 'spilled', big.spilled.toFixed(3));
  ok(big.overtopped, 'the pond overtops under 150 mm/h');
  // this basin is the whole map (its rim is the lowest edge cell): it cannot spill before the rain on it has filled its capacity, and does so soon after
  const tFill = big.volume / ((150 / 3.6e6) * big.cells * dem.cellM * dem.cellM);
  ok(big.overtopAt >= tFill * 0.97 && big.overtopAt <= tFill * 1.6, 'overtops after the fill time ' + tFill.toFixed(0) + ' s and soon after: ' + big.overtopAt.toFixed(0));
}
// 5. alternating block
{
  const idf = (t) => 900 / Math.pow(t + 10, 0.8);
  const hy = R.alternatingBlock(idf, 60, 5);
  near(R.hyetoDepth(hy, 60), (idf(60) * 60) / 60, 1e-9, 'alternating blocks sum to the IDF depth');
  const mx = hy.reduce((b, r, k) => (r.i > hy[b].i ? k : b), 0);
  ok(mx >= 4 && mx <= 7, 'peak block in the middle ' + mx);
}
// 6. the V catchment — geometry of Di Giammarco, Todini and Lamberti (1996, J. Hydrology 175): two planes 1000 m x 800 m falling 0.05 toward a 20 m
//    channel that falls 0.02 along its length; n 0.015 on the planes, 0.15 in the channel; 10.8 mm/h for 90 min, run to 180 min.
//    Reference: an independent 1D kinematic-wave model of the same geometry written here (plane strip + channel, explicit upwind, tiny steps).
//    NOT compared with the paper's published curve (its table is not in the repo); the comparison is model against model on the same case.
{
  const t0 = Date.now(), cell = 10, nxp = 100, nx = nxp * 2 + 2, ny = 80;
  const z = new Float64Array(nx * ny), xc = nxp;   // cells xc, xc+1 = the channel
  const bed = (j) => 0.02 * ((j + 0.5) * cell);   // the channel falls toward y = 0, where the open edge is
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const d = i < xc ? xc - i - 0.5 : i > xc + 1 ? i - xc - 1.5 : 0; z[j * nx + i] = bed(j) + 0.05 * d * cell; }
  const dem = R.demFromGrid(z, nx, ny, cell);
  const poly = (x0, x1) => [{ x: x0, y: -1 }, { x: x1, y: -1 }, { x: x1, y: 801 }, { x: x0, y: 801 }];
  R.paint(dem, poly(0, 1000), 'n', 0.015); R.paint(dem, poly(1020, 2020), 'n', 0.015); R.paint(dem, poly(1000, 1020), 'n', 0.15);
  R.paint(dem, poly(0, 1000).map((q) => ({ x: q.x, y: q.y > 0 ? 10 : -1 })), 'block', 1); R.paint(dem, poly(1020, 2020).map((q) => ({ x: q.x, y: q.y > 0 ? 10 : -1 })), 'block', 1);   // planes' south row walled so only the channel leaves
  const sim = new R.RainSim(dem, { rain: 10.8, duration: 90, tEnd: 180, n: 0.015, edge: 'closed', sides: { s: true }, edgeSlope: 0.02, dtMax: 5, rec: 60, frames: 4 });
  const res = sim.run();
  // reference
  const ip = 10.8 / 3.6e6, a1 = Math.sqrt(0.05) / 0.015, M = 5 / 3, Lp = 1000;
  const np = 200, dxp = Lp / np; let hp = new Float64Array(np);   // plane cells, index 0 at the divide, np-1 at the channel
  const nc = 80, dxc = cell; let hc = new Float64Array(nc); const Sc = 0.02, nch = 0.15, b = 20;
  const qp = [];
  let t = 0, dtr = 0.5, Qmax = 0, tQ = 0; const series = [];
  while (t < 10800) {
    const rate = t < 5400 ? ip : 0;
    const q = (h) => a1 * Math.pow(Math.max(h, 0), M);
    let qout = q(hp[np - 1]);
    for (let k = np - 1; k >= 0; k--) { const qin = k > 0 ? q(hp[k - 1]) : 0, qo = q(hp[k]); hp[k] = Math.max(0, hp[k] + dtr * (rate + (qin - qo) / dxp)); }
    const lat = 2 * qout;   // m2/s per metre of channel from both planes
    const Q = (h) => (b * Math.pow(Math.max(h, 0), M) * Math.sqrt(Sc)) / nch;
    let Qlast = 0;
    for (let k = nc - 1; k >= 0; k--) { const qin = k > 0 ? Q(hc[k - 1]) : 0, qo = Q(hc[k]); hc[k] = Math.max(0, hc[k] + (dtr * ((k === nc - 1 ? 0 : lat) * dxc + qin - qo)) / (b * dxc)); if (k === nc - 1) Qlast = qo; }
    t += dtr; if (Qlast > Qmax) { Qmax = Qlast; tQ = t; }
    if (Math.abs(t % 60) < dtr / 2) series.push({ t, Q: Qlast });
  }
  const peak2d = res.peak.q;
  console.log('V catchment (VPS, capped; %d cells, %d steps, %s s): 2D peak %s m3/s at %s min; 1D reference peak %s at %s min; rain %s m3 out %s stored %s',
    res.cells, res.steps, ((Date.now() - t0) / 1000).toFixed(1), peak2d.toFixed(3), (res.peak.t / 60).toFixed(0), Qmax.toFixed(3), (tQ / 60).toFixed(0), res.volumes.rain.toFixed(0), res.volumes.out.toFixed(0), res.volumes.stored.toFixed(0));
  near(res.volumes.error, 0, 1e-4, 'V catchment mass closes');
  near(peak2d / Qmax, 1, 0.12, 'V catchment peak vs the 1D kinematic reference');
  near(res.peak.t / 60, tQ / 60, 6, 'V catchment time of peak (minutes)');
}
console.log(`rain: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
