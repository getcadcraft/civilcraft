/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pv-shade.js — shadows on a PV array from the model (0.8 EG.15, session `energy_PART_2`). No DOM. For each sample point of each module and each sun position
 * of the representative days a ray goes toward the sun; the point is shaded when it meets a triangle of the model or the table of another row. This is
 * the same ray test energy-bim.js uses to find what bounds a room, with Möller & Trumbore's (1997) ray–triangle intersection.
 *
 *   obstructions(items) → obs      items [{ owner (id or null), tris (flat mm) }]; owner is a row's table, which does not shade itself
 *   tableTris(corners) → flat tris   a table's rectangle as two triangles (rows shade the rows behind them)
 *   shadeGrid(modules, normal, sunGrid, obs, { owner, perModule, maxModules, lift }) → { frac: [12][24], samples, rays }
 *       frac[m][h] = the share of the sample points shaded from the beam at solar hour h (mid-hour) of month m + 1; null where the sun is down or behind the plane
 *       sunGrid[m][h] = a pv-sun `sunAt` result or null
 *   beamLoss(frac, beamGrid) → share of the year's (or a month's) beam lost, weighted by the beam each hour would have delivered
 * What it does not do: shade the diffuse light, or follow a shadow edge across a cell. A part-shaded module is counted as losing that share of its beam.
 */
const EPS = 1e-9;

export function obstructions(items) {
  const out = { tri: [], owner: [], lo: [], hi: [] };
  for (const it of items) {
    const T = it.tris;
    for (let i = 0; i + 8 < T.length; i += 9) {
      out.tri.push(T[i], T[i + 1], T[i + 2], T[i + 3], T[i + 4], T[i + 5], T[i + 6], T[i + 7], T[i + 8]);
      out.owner.push(it.owner ?? null);
      out.lo.push(Math.min(T[i], T[i + 3], T[i + 6]), Math.min(T[i + 1], T[i + 4], T[i + 7]), Math.min(T[i + 2], T[i + 5], T[i + 8]));
      out.hi.push(Math.max(T[i], T[i + 3], T[i + 6]), Math.max(T[i + 1], T[i + 4], T[i + 7]), Math.max(T[i + 2], T[i + 5], T[i + 8]));
    }
  }
  out.count = out.owner.length;
  return out;
}
export const tableTris = (c) => [...c[0], ...c[1], ...c[2], ...c[0], ...c[2], ...c[3]];

/** Does the ray from `o` along unit `d` meet a triangle of `obs` (not owned by `skip`)? */
export function blocked(obs, o, d, skip = null, tMin = 1) {
  const inv = [1 / (Math.abs(d[0]) < EPS ? EPS : d[0]), 1 / (Math.abs(d[1]) < EPS ? EPS : d[1]), 1 / (Math.abs(d[2]) < EPS ? EPS : d[2])];
  const T = obs.tri, lo = obs.lo, hi = obs.hi;
  for (let k = 0; k < obs.count; k++) {
    if (skip !== null && obs.owner[k] === skip) continue;
    const j = k * 3;
    let t0 = 0, t1 = Infinity;
    for (let a = 0; a < 3; a++) {
      let ta = (lo[j + a] - o[a]) * inv[a], tb = (hi[j + a] - o[a]) * inv[a];
      if (ta > tb) { const x = ta; ta = tb; tb = x; }
      if (ta > t0) t0 = ta;
      if (tb < t1) t1 = tb;
      if (t0 > t1) break;
    }
    if (t0 > t1) continue;
    const i = k * 9;
    const e1x = T[i + 3] - T[i], e1y = T[i + 4] - T[i + 1], e1z = T[i + 5] - T[i + 2], e2x = T[i + 6] - T[i], e2y = T[i + 7] - T[i + 1], e2z = T[i + 8] - T[i + 2];
    const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x, det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-12) continue;
    const id = 1 / det, tx = o[0] - T[i], ty = o[1] - T[i + 1], tz = o[2] - T[i + 2];
    const u = (tx * px + ty * py + tz * pz) * id;
    if (u < 0 || u > 1) continue;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
    const v = (d[0] * qx + d[1] * qy + d[2] * qz) * id;
    if (v < 0 || u + v > 1) continue;
    if ((e2x * qx + e2y * qy + e2z * qz) * id > tMin) return true;
  }
  return false;
}

/**
 * Sample points of an array's modules. opts: perModule (points along each side, 2), maxModules (every k-th module is sampled past this, 400), lift (mm above the plane, 20).
 * → [[x, y, z]…] in mm.
 */
export function samplePoints(modules, normal, { perModule = 2, maxModules = 400, lift = 20 } = {}) {
  const stride = Math.max(1, Math.ceil(modules.length / maxModules)), pts = [];
  const k = Math.max(1, Math.min(4, perModule | 0));
  for (let m = 0; m < modules.length; m += stride) {
    const c = modules[m].corners;
    for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) {
      const s = (a + 0.5) / k, t = (b + 0.5) / k;
      const p = [0, 1, 2].map((q) => c[0][q] * (1 - s) * (1 - t) + c[1][q] * s * (1 - t) + c[2][q] * s * t + c[3][q] * (1 - s) * t);
      pts.push([p[0] + normal[0] * lift, p[1] + normal[1] * lift, p[2] + normal[2] * lift]);
    }
  }
  return { pts, stride };
}

export function shadeGrid(modules, normal, sunGrid, obs, { owner = null, perModule = 2, maxModules = 400, lift = 20 } = {}) {
  const { pts } = samplePoints(modules, normal, { perModule: modules.length * perModule * perModule > maxModules * 4 ? 1 : perModule, maxModules, lift });
  // triangles that can never be hit: wholly below the lowest sample point (the ray only climbs)
  let zmin = Infinity;
  for (const p of pts) zmin = Math.min(zmin, p[2]);
  const keep = { tri: [], owner: [], lo: [], hi: [], count: 0 };
  for (let k = 0; k < obs.count; k++) {
    if (obs.hi[k * 3 + 2] < zmin - 1) continue;
    for (let q = 0; q < 9; q++) keep.tri.push(obs.tri[k * 9 + q]);
    keep.owner.push(obs.owner[k]);
    for (let q = 0; q < 3; q++) { keep.lo.push(obs.lo[k * 3 + q]); keep.hi.push(obs.hi[k * 3 + q]); }
    keep.count++;
  }
  const frac = [], stat = { samples: pts.length, rays: 0, triangles: keep.count };
  for (let m = 0; m < 12; m++) {
    frac.push([]);
    for (let h = 0; h < 24; h++) {
      const s = sunGrid[m]?.[h];
      if (!s || s.dir[0] * normal[0] + s.dir[1] * normal[1] + s.dir[2] * normal[2] <= 0) { frac[m].push(null); continue; }
      let n = 0;
      if (keep.count) for (const p of pts) { stat.rays++; if (blocked(keep, p, s.dir, owner)) n++; }
      frac[m].push(pts.length ? n / pts.length : 0);
    }
  }
  return { frac, ...stat };
}

/** Beam lost to shadows: Σ shade × beam / Σ beam over the hours given (beamGrid[m][h] = the beam an hour would have delivered; months: indexes, default all). */
export function beamLoss(frac, beamGrid, months = null) {
  let lost = 0, all = 0;
  for (let m = 0; m < 12; m++) {
    if (months && !months.includes(m)) continue;
    for (let h = 0; h < 24; h++) { const b = beamGrid[m]?.[h] || 0, f = frac[m]?.[h]; if (b > 0 && f !== null && f !== undefined) { lost += b * f; all += b; } }
  }
  return all > 0 ? lost / all : 0;
}
