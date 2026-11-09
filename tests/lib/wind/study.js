/* SPDX-License-Identifier: Apache-2.0 */
/**
 * study.js — the pedestrian-wind study (0.9 SU.1119 wind; DOM-free, Apache-2.0). Masses → voxels → lattice-Boltzmann LES (lbm3.js) once per wind-direction sector with a
 * log-law boundary-layer inlet → a map of the pedestrian-height wind speed RATIO (speed at ~1.5 m over the speed at 10 m upstream) → combined with the weather file's hourly
 * wind (speed and direction) into a Lawson class and a NEN 8100 grade on every cell. A reading for early design, NOT a certificate.
 *
 * VALIDATION STATE (carried in every result as `validation`): the solver is verified on analytic cases (Poiseuille channel, lid-driven cavity against Ghia et al. 1982) and run
 * on a cube for plausibility. It has NOT been validated against building wind-tunnel data (AIJ / CEDVAL) unless `VALIDATION.windTunnel` says so. Never present the numbers as design values.
 *
 *   planDomain({ masses, targetCells, cellsPerHeight }) → { dx, H, ... }
 *   runSector({ masses, deg, z0, dx, steps, spinFlows, avgFlows, pedZ, onProgress, shouldStop }) → async → { ratio (flow-frame grid), nx, ny, ... }
 *   windStudy({ masses, epw, sectors, z0Site, z0Met, quality, gust, ... }) → async → { map, stats, validation, ... }
 */
import { Lbm3 } from './lbm3.js';
import { voxelise, flowFrame, pointInPoly } from './voxel.js';
import { logProfile, metToSite, windRose, sectorOf } from './abl.js';
import { lawsonFromSeries, nenGrade, LAWSON } from './comfort.js';

/** Where validation stands. Updated by the validation script's report (docs/0.9-sessions/env-analysis-09.md, Wind section). */
export const VALIDATION = {
  analytic: 'verified: channel flow vs the exact parabola, lid-driven cavity vs Ghia et al. 1982',
  windTunnel: false,
  plausibility: { passed: false, date: '2026-11-03', what: 'single cube in a boundary layer (bin/validate-wind-cube.mjs on workstation11a): after the outflow fix the windward Cp is 0.90 and converged and the wake length is inside 1-3 H, but wake length and side speed did not converge with the grid' },
  label: 'EXPERIMENTAL. After a bug fix on 2026-11-03 this solver passes only half of its cube check: the windward pressure coefficient (0.90) is in the expected band and stable under grid refinement, but the wake length and the speed beside the cube still changed by about 13 % between the finest grids, so convergence is NOT shown. It is also not validated against wind-tunnel data. Do not use these numbers for anything.',
};
export const QUALITY = {
  screening: { maxCells: 250000, cellsPerHeight: 8, spinFlows: 2, avgFlows: 1 },
  standard: { maxCells: 1500000, cellsPerHeight: 12, spinFlows: 3, avgFlows: 2 },
};
const ULAT = 0.04;   // lattice speed at the 10 m reference height (Mach about 0.07 at the top of the domain)

export function planDomain({ masses, targetCells = 250000, cellsPerHeight = 8, up = 5, down = 10, side = 3, top = 5 }) {
  let H = 0, gx0 = Infinity, gz = Infinity, cx = 0, cy = 0, n = 0;
  for (const m of masses) { H = Math.max(H, m.height); gz = Math.min(gz, m.z0); for (const p of m.pts) { cx += p.x; cy += p.y; n++; } }
  if (!n || !(H > 0)) throw new Error('no_masses');
  cx /= n; cy /= n;
  let R = 0; for (const m of masses) for (const p of m.pts) R = Math.max(R, Math.hypot(p.x - cx, p.y - cy));
  const dims = (dx) => ({ nx: Math.ceil((up * H + 2 * R + down * H) / dx), ny: Math.ceil((2 * R + 2 * side * H) / dx), nz: Math.ceil((top * H) / dx) });
  let dx = H / cellsPerHeight;
  for (let k = 0; k < 60; k++) { const d = dims(dx); if (d.nx * d.ny * d.nz <= targetCells) break; dx *= 1.06; }
  const d = dims(dx);
  return { dx, H, R, cx, cy, ground: gz, ...d, cells: d.nx * d.ny * d.nz, cellsPerHeight: H / dx, up, down, side, top };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

/** One wind direction. Returns the pedestrian-height ratio on the flow-frame grid (NaN inside buildings). */
export async function runSector(o) {
  const { masses, deg, z0 = 0.5, pedZ = 1.5, onProgress, shouldStop } = o;
  const plan = o.plan || planDomain({ masses, targetCells: o.targetCells, cellsPerHeight: o.cellsPerHeight });
  const { dx, nx, ny, nz, cx, cy, R, H, ground } = plan;
  const fr = flowFrame(deg), frame = { cx, cy, ex: fr.ex, ey: fr.ey, x0: -(plan.up * H + R), y0: -(ny * dx) / 2 };
  const solid = voxelise({ masses, dx, frame, nx, ny, nz, ground });
  const z0c = Math.min(Math.max(z0 / dx, 1e-4), 0.2);   // roughness in cells, kept below the first cell centre
  const prof = (z) => ULAT * logProfile(Math.max((z + 0.5) * dx, z0 * 1.0001), z0, 1, 10);
  const S = new Lbm3({ nx, ny, nz, tau: 0.51, cs: 0.16, solid, bc: { x0: 'inlet', x1: 'outflow', y0: 'symmetry', y1: 'symmetry', z0: 'symmetry', z1: 'symmetry' },
    inlet: (y, z) => [prof(z), 0, 0],
    groundWall: { z0: z0c } });
  const umean = prof(Math.floor(nz / 3));
  const flow = Math.ceil(nx / umean), spin = Math.ceil((o.spinFlows ?? 2) * flow), avg = Math.ceil((o.avgFlows ?? 1) * flow), chunk = Math.max(10, Math.floor(2e6 / (nx * ny * nz) * 50));
  const kPed = Math.min(nz - 1, Math.max(0, Math.floor(pedZ / dx)));
  let done = 0; const total = spin + avg;
  const half = [null, null];
  for (let t = 0; t < total; t += chunk) {
    const n = Math.min(chunk, total - t);
    for (let s = 0; s < n; s++) {
      S.step(1);
      if (t + s >= spin) { S.accumulate(); if (t + s === spin + Math.floor(avg / 2) - 1) { half[0] = ped(S.mean(), nx, ny, kPed); S.resetMean(); } }
    }
    done = t + n;
    if (onProgress) onProgress(done / total);
    if (shouldStop && shouldStop()) return { stopped: true };
    await tick();
  }
  const m = S.mean(); half[1] = ped(m, nx, ny, kPed);
  // stationarity: the change in the pedestrian layer's mean speed between the two halves of the averaging window
  let num = 0, den = 0; const A = half[0] || full, B = half[1];
  for (let i = 0; i < nx * ny; i++) { if (solid[i + nx * ny * kPed]) continue; num += Math.abs(A[i] - B[i]); den += B[i]; }
  const drift = den > 0 ? num / den : 0;
  const uref = ULAT;   // inlet speed at 10 m above the ground
  const ratio = new Float32Array(nx * ny);
  for (let i = 0; i < nx * ny; i++) ratio[i] = solid[i + nx * ny * kPed] ? NaN : (0.5 * (A[i] + B[i])) / uref;
  const finite = Array.from(ratio).every((v) => Number.isNaN(v) || Number.isFinite(v));
  return { plan, frame, nx, ny, ratio, solidTop: solid.slice(nx * ny * kPed, nx * ny * (kPed + 1)), steps: total, drift, ok: finite, kPed, pedHeight: (kPed + 0.5) * dx, deg };
}
function ped(m, nx, ny, k) { const o = new Float32Array(nx * ny), b = nx * ny * k; for (let i = 0; i < nx * ny; i++) o[i] = Math.hypot(m.ux[b + i], m.uy[b + i]); return o; }

/** Sample a sector's flow-frame ratio at a world point (bilinear). NaN inside a building or outside the grid. */
export function sampleRatio(r, wx, wy) {
  const { frame, plan, nx, ny } = r, dx = plan.dx, fx = -frame.ey, fy = frame.ex;
  const X = (wx - frame.cx) * frame.ex + (wy - frame.cy) * frame.ey, Y = (wx - frame.cx) * fx + (wy - frame.cy) * fy;
  const gx = (X - frame.x0) / dx - 0.5, gy = (Y - frame.y0) / dx - 0.5;
  const i = Math.floor(gx), j = Math.floor(gy);
  if (i < 0 || j < 0 || i >= nx - 1 || j >= ny - 1) return NaN;
  const tx = gx - i, ty = gy - j, v = (a, b) => r.ratio[a + nx * b];
  const c = [v(i, j), v(i + 1, j), v(i, j + 1), v(i + 1, j + 1)];
  if (c.some(Number.isNaN)) return NaN;
  return c[0] * (1 - tx) * (1 - ty) + c[1] * tx * (1 - ty) + c[2] * (1 - tx) * ty + c[3] * tx * ty;
}

/** The whole study. */
export async function windStudy(o) {
  const { masses, epw, sectors = 8, z0Site = 0.5, z0Met = 0.03, gust = 1.5, quality = 'screening', onProgress, shouldStop } = o;
  if (!masses?.length) throw new Error('no_masses');
  if (!epw) throw new Error('need_epw');
  const q = { ...QUALITY[quality] || QUALITY.screening, ...(o.override || {}) };
  const plan = planDomain({ masses, targetCells: q.maxCells, cellsPerHeight: q.cellsPerHeight, ...(o.domain || {}) });
  const rose = windRose(epw, sectors);
  const results = [];
  for (let s = 0; s < sectors; s++) {
    if (rose.freq[s] === 0) { results.push(null); continue; }
    const r = await runSector({ masses, deg: s * (360 / sectors), z0: z0Site, plan, spinFlows: q.spinFlows, avgFlows: q.avgFlows,
      onProgress: (p) => onProgress && onProgress((s + p) / sectors, s), shouldStop });
    if (r.stopped) return { stopped: true };
    results.push(r);
  }
  return classify({ masses, epw, sectors, rose, results, plan, z0Site, z0Met, gust, quality, validation: VALIDATION });
}

/** Turn per-sector pedestrian-height speed-ratio grids into Lawson / NEN maps over a world grid with the weather file's hourly wind.
 *  Engine-neutral: `results[s]` (null = sector with no wind) is { frame:{cx,cy,ex,ey,x0,y0}, plan:{dx}, nx, ny, ratio:Float32Array(nx*ny, NaN = no value), drift?, pedHeight? }
 *  where ratio = speed at the pedestrian height / speed at 10 m upstream. Used by the built-in solver and by add-ons (the OpenFOAM add-on). */
export function classify({ masses, epw, sectors, rose = windRose(epw, sectors), results, plan, z0Site, z0Met, gust, quality = 'screening', validation = VALIDATION, engine = 'builtin' }) {
  // world grid over the masses plus a margin
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const m of masses) for (const p of m.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const mg = Math.max(plan.H * 1.5, 10), cell = Math.max(plan.dx, (x1 - x0 + y1 - y0 + 4 * mg) / 160);
  const gx0 = x0 - mg, gy0 = y0 - mg, w = Math.ceil((x1 - x0 + 2 * mg) / cell), h = Math.ceil((y1 - y0 + 2 * mg) / cell);
  const u10 = rose.speeds.map((q2) => (q2.sector < 0 ? 0 : metToSite(q2.u, { z0Met, z0Site })));
  const lawson = new Int8Array(w * h).fill(-2), nen = new Uint8Array(w * h), p5 = new Float32Array(w * h), q95 = new Float32Array(w * h), rmax = new Float32Array(w * h);
  const nHours = epw.hours.length, series = new Float32Array(nHours);
  const counts = { lawson: new Array(LAWSON.length + 1).fill(0), nen: { A: 0, B: 0, C: 0, D: 0, E: 0 }, cells: 0 };
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const wx = gx0 + (i + 0.5) * cell, wy = gy0 + (j + 0.5) * cell, id = i + w * j;
    let inside = false; for (const m of masses) if (pointInPoly(wx, wy, m.pts)) { inside = true; break; }
    if (inside) continue;
    const rr = results.map((r) => (r ? sampleRatio(r, wx, wy) : 0));
    if (rr.some((v) => Number.isNaN(v))) { lawson[id] = -1; continue; }   // inside a wake cell blocked in some sector or off the solved grid
    let mx = 0;
    for (let hr = 0; hr < nHours; hr++) { const sct = rose.speeds[hr].sector; series[hr] = sct < 0 ? 0 : u10[hr] * rr[sct]; if (rr[sct >= 0 ? sct : 0] > mx) mx = rr[sct >= 0 ? sct : 0]; }
    const L = lawsonFromSeries(series, gust), N = nenGrade(series);
    lawson[id] = L.index; nen[id] = 'ABCDE'.indexOf(N.grade); p5[id] = N.share;
    const sorted = Array.from(series).sort((a, b) => a - b); q95[id] = sorted[Math.floor(0.95 * (sorted.length - 1))] * gust; rmax[id] = mx;
    counts.lawson[L.index]++; counts.nen[N.grade]++; counts.cells++;
  }
  const drift = Math.max(0, ...results.filter(Boolean).map((r) => r.drift));
  return { map: { gx0, gy0, w, h, cell, lawson, nen, q95, nenShare: p5, ratioMax: rmax }, counts, plan, sectors, rose: { freq: rose.freq, calm: rose.calm },
    drift, gust, z0Site, z0Met, quality, pedHeight: results.find(Boolean)?.pedHeight, results, validation, engine, tables: { lawson: LAWSON } };
}
