/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calc.js — the room lighting calculation of the Interior lighting design add-on (0.9 LD.2). DOM-free. Clean room (rule 32): the maths is textbook.
 *
 *   direct light      E = I(γ, C) · cos θ / d²   (photometry.js, the inverse-square cosine law)
 *   inter-reflection  the room's floor, ceiling and walls are cut into patches; each patch is a diffuse (Lambertian) reflector with the reflectance you give.
 *                     Irradiance of patch i:  E_i = E0_i + Σ_j F_ij · ρ_j · E_j  — solved by Gauss-Seidel (a radiosity solution).
 *                     The form factor of a patch pair uses the disc approximation  F_ij = cos θi · cos θj · A_j / (π r² + A_j),  with each row scaled to sum to 1
 *                     (a closed room returns all the light it does not absorb).
 *   workplane         E(p) = direct(p) + Σ_j ρ_j E_j · cos θp · cos θj · A_j / (π r² + A_j)
 *
 * What it does NOT do (and the report says so): no furniture, columns or interior walls blocking light (every patch sees every other patch, so a room that is not
 * convex is a little too bright in its bays), no windows or daylight, no specular surfaces, no coloured light. Millimetres in, lux out.
 *
 *   prepare(room, { maxPatches }) → prep        the patches and form factors: they depend on the room only, so planning reuses them for every try
 *   solve(prep, luminaires) → { E (lux per patch, initial flux), E0 }
 *   workplane(prep, sol, luminaires, points, normal) → lux per point (initial flux)
 *   runRoom({ room, luminaires, llf, spacing, maxPatches }) → result
 */
import { illuminanceAt, gridPoints, stats, DEFAULT_LLF } from './photometry.js';
import { directAt, hiddenByObstacle } from './obstruct.js';

export const DEFAULT_ROOM = { polygon: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], height: 2800, workplane: 800, margin: 500, refl: { ceiling: 0.7, walls: 0.5, floor: 0.2 } };
const clamp01 = (x, d) => (Number.isFinite(Number(x)) ? Math.min(0.99, Math.max(0, Number(x))) : d);

/** A clean room, or throws Error with `key`. polygon: ≥ 3 points [x, y] mm, no two the same in a row. */
export function cleanRoom(r = {}) {
  const poly = (Array.isArray(r.polygon) ? r.polygon : []).map((p) => [Number(p[0]), Number(p[1])]).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  const pts = poly.filter((p, i) => { const q = poly[(i + poly.length - 1) % poly.length]; return Math.hypot(p[0] - q[0], p[1] - q[1]) > 1; });
  if (pts.length < 3 || polyArea(pts) < 0.25) throw Object.assign(new Error('room.polygon'), { key: 'err.room' });
  const height = Number(r.height ?? DEFAULT_ROOM.height), wp = Number(r.workplane ?? DEFAULT_ROOM.workplane), margin = Number(r.margin ?? DEFAULT_ROOM.margin);
  if (!(height >= 500 && height <= 60000)) throw Object.assign(new Error('room.height'), { key: 'err.height' });
  if (!(wp >= 0 && wp < height)) throw Object.assign(new Error('room.workplane'), { key: 'err.workplane' });
  const rf = r.refl || {};
  return { polygon: pts, height, workplane: wp, margin: Number.isFinite(margin) && margin >= 0 ? margin : 500, refl: { ceiling: clamp01(rf.ceiling, 0.7), walls: clamp01(rf.walls, 0.5), floor: clamp01(rf.floor, 0.2) } };
}
export function polyArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const u = p[i], v = p[(i + 1) % p.length]; a += u[0] * v[1] - v[0] * u[1]; } return Math.abs(a) / 2e6; }   // m²
const signedArea = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const u = p[i], v = p[(i + 1) % p.length]; a += u[0] * v[1] - v[0] * u[1]; } return a / 2; };
export function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c; }
  return c;
}
export const bbox = (poly) => { const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]); return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; };

/** The patches: [{ c: [x, y, z] mm, n (unit, into the room), a (m²), rho, kind: 'floor' | 'ceiling' | 'wall' }] and the form-factor matrix. */
export function prepare(roomIn, { maxPatches = 1300 } = {}) {
  const room = cleanRoom(roomIn), P = room.polygon, H = room.height, areaM2 = polyArea(P), per = P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + Math.hypot(q[0] - p[0], q[1] - p[1]); }, 0) / 1000;
  const total = 2 * areaM2 + per * H / 1000;
  const cell = Math.max(150, Math.sqrt(total / maxPatches) * 1000);
  const bb = bbox(P), patches = [];
  const nx = Math.max(1, Math.round((bb.x1 - bb.x0) / cell)), ny = Math.max(1, Math.round((bb.y1 - bb.y0) / cell)), dx = (bb.x1 - bb.x0) / nx, dy = (bb.y1 - bb.y0) / ny;
  for (const [kind, z, nz, rho] of [['floor', 0, 1, room.refl.floor], ['ceiling', H, -1, room.refl.ceiling]]) {
    const first = patches.length;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { const x = bb.x0 + dx * (i + 0.5), y = bb.y0 + dy * (j + 0.5); if (inside(P, x, y)) patches.push({ c: [x, y, z], n: [0, 0, nz], a: 0, rho, kind }); }
    if (patches.length === first) patches.push({ c: [(bb.x0 + bb.x1) / 2, (bb.y0 + bb.y1) / 2, z], n: [0, 0, nz], a: 0, rho, kind });   // a sliver of a room: one patch at the middle
    const a = areaM2 / (patches.length - first);                                       // exact area shared out, so the cell edge does not matter
    for (let k = first; k < patches.length; k++) patches[k].a = a;
  }
  const ccw = signedArea(P) > 0;
  for (let i = 0; i < P.length; i++) {
    const u = P[i], v = P[(i + 1) % P.length], len = Math.hypot(v[0] - u[0], v[1] - u[1]), tx = (v[0] - u[0]) / len, ty = (v[1] - u[1]) / len;
    const n = ccw ? [-ty, tx, 0] : [ty, -tx, 0];
    const nh = Math.max(1, Math.round(len / cell)), nv = Math.max(1, Math.round(H / cell));
    for (let a = 0; a < nh; a++) for (let b = 0; b < nv; b++) {
      const s = (a + 0.5) / nh;
      patches.push({ c: [u[0] + (v[0] - u[0]) * s, u[1] + (v[1] - u[1]) * s, H * (b + 0.5) / nv], n, a: (len / 1000 / nh) * (H / 1000 / nv), rho: room.refl.walls, kind: 'wall' });
    }
  }
  const N = patches.length, F = new Float32Array(N * N);
  for (let i = 0; i < N; i++) {
    const pi = patches[i]; let sum = 0;
    for (let j = 0; j < N; j++) {
      if (i === j) continue;
      const pj = patches[j], vx = (pj.c[0] - pi.c[0]) / 1000, vy = (pj.c[1] - pi.c[1]) / 1000, vz = (pj.c[2] - pi.c[2]) / 1000, r2 = vx * vx + vy * vy + vz * vz;
      if (r2 < 1e-9) continue;
      const r = Math.sqrt(r2), ci = (pi.n[0] * vx + pi.n[1] * vy + pi.n[2] * vz) / r, cj = -(pj.n[0] * vx + pj.n[1] * vy + pj.n[2] * vz) / r;
      if (ci <= 0 || cj <= 0) continue;
      const f = ci * cj * pj.a / (Math.PI * r2 + pj.a);
      F[i * N + j] = f; sum += f;
    }
    if (sum > 0) for (let j = 0; j < N; j++) F[i * N + j] /= sum;
  }
  return { room, patches, F, N, areaM2, cell };
}

/** The inter-reflection solve for any direct irradiance E0 (lux per patch, one number per patch): Gauss-Seidel on E_i = E0_i + Σ_j F_ij · ρ_j · E_j. → { E, E0 }. */
export function solveFrom(prep, E0, { iterations = 80, tol = 1e-6 } = {}) {
  const { patches, F, N } = prep, E = E0.slice();
  for (let it = 0; it < iterations; it++) {
    let worst = 0;
    for (let i = 0; i < N; i++) {
      let s = 0; const row = i * N;
      for (let j = 0; j < N; j++) { const f = F[row + j]; if (f) s += f * patches[j].rho * E[j]; }
      const e = E0[i] + s, d = Math.abs(e - E[i]) / (Math.abs(e) + 1e-9);
      if (d > worst) worst = d;
      E[i] = e;
    }
    if (worst < tol) break;
  }
  return { E, E0 };
}
/** Direct irradiance on every patch and the solved total (both for the luminaires at initial flux). `obstacles` (obstruct.js) block the direct light only. */
export function solve(prep, luminaires, { iterations = 80, tol = 1e-6, obstacles = null } = {}) {
  const E0 = prep.patches.map((p) => directAt(luminaires, p.c, p.n, obstacles));
  return solveFrom(prep, E0, { iterations, tol });
}

/** Irradiance at p [x, y, z] mm on a surface with unit normal `normal` from the patches only (the light that has bounced at least once). */
export function indirectAt(prep, sol, p, normal = [0, 0, 1]) {
  let e = 0;
  for (let j = 0; j < prep.N; j++) {
    const q = prep.patches[j], vx = (q.c[0] - p[0]) / 1000, vy = (q.c[1] - p[1]) / 1000, vz = (q.c[2] - p[2]) / 1000, r2 = vx * vx + vy * vy + vz * vz;
    if (r2 < 1e-9) continue;
    const r = Math.sqrt(r2), cp = (normal[0] * vx + normal[1] * vy + normal[2] * vz) / r, cj = -(q.n[0] * vx + q.n[1] * vy + q.n[2] * vz) / r;
    if (cp <= 0 || cj <= 0) continue;
    e += q.rho * sol.E[j] * cp * cj * q.a / (Math.PI * r2 + q.a);
  }
  return e;
}
/** Direct + inter-reflected lux at each point (initial flux). */
export function workplane(prep, sol, luminaires, points, normal = [0, 0, 1], obstacles = null) {
  return points.map((p) => directAt(luminaires, p, normal, obstacles) + indirectAt(prep, sol, p, normal));
}

/** Grid spacing in mm from the longer side d (m): p = 0.2 · 5^log10(d), the calculation-grid rule of EN 12464-1 / EN 12193 (rounded to 10 mm), kept to ≤ 6000 points. */
export function autoSpacing(polygon) {
  const bb = bbox(polygon), d = Math.max(bb.x1 - bb.x0, bb.y1 - bb.y0) / 1000;
  let s = Math.round(0.2 * Math.pow(5, Math.log10(Math.max(d, 0.5))) * 100) * 10;
  s = Math.max(s, 100);
  while (((bb.x1 - bb.x0) / s) * ((bb.y1 - bb.y0) / s) > 6000) s *= 1.25;
  return Math.round(s);
}
const avgOf = (patches, E, kind) => { let a = 0, s = 0; patches.forEach((p, i) => { if (p.kind === kind) { a += p.a; s += p.a * E[i]; } }); return a ? s / a : 0; };

/**
 * The whole calculation. luminaires: [{ photo, p: [x, y, z] mm, aim?, rot?, scale? }], llf = light loss factor (maintenance): lux are MAINTAINED values.
 * → { room, grid: { points, values, spacing, nx, ny }, stats: { min, avg, max, uo (min/avg), u1 (min/max) }, em, emin, emax, uo, surfaces: { floor, ceiling, walls } (mean lux),
 *     directShare (0..1 of the mean workplane lux that comes straight from the luminaires), lumens, watts, count, areaM2, lpd (W/m²), lpd100 (W/m² per 100 lx), llf, patches }
 */
export function runRoom({ room, luminaires, llf = DEFAULT_LLF.value, spacing = 0, maxPatches = 1300, prep = null, obstacles = null }) {
  const pr = prep || prepare(room, { maxPatches }), rm = pr.room;
  if (!luminaires || !luminaires.length) throw Object.assign(new Error('no luminaires'), { key: 'err.noluminaires' });
  const sol = solve(pr, luminaires, { obstacles });
  const sp = spacing > 0 ? spacing : autoSpacing(rm.polygon);
  const g = gridPoints(rm.polygon, { spacing: sp, height: rm.workplane, margin: rm.margin });
  let pts = g.points;
  if (!pts.length) {   // a room narrower than twice the margin: calculate over the whole floor rather than refuse
    const g2 = gridPoints(rm.polygon, { spacing: sp, height: rm.workplane, margin: 0 });
    pts = g2.points; Object.assign(g, g2);
  }
  let excluded = 0;
  if (obstacles && obstacles.length) { const keep = pts.filter((p) => !hiddenByObstacle(p, obstacles)); excluded = pts.length - keep.length; pts = keep; }   // a point inside a column or under a high shelf is not a place a person works
  if (!pts.length) throw Object.assign(new Error('no grid'), { key: 'err.nogrid' });
  const E = workplane(pr, sol, luminaires, pts, [0, 0, 1], obstacles), direct = pts.map((p) => directAt(luminaires, p, [0, 0, 1], obstacles));
  const k = llf, values = E.map((x) => x * k), st = stats(values);
  const lumens = luminaires.reduce((s, L) => s + (L.photo.lumens || 0) * (L.scale ?? 1), 0), watts = luminaires.reduce((s, L) => s + (L.photo.watts || 0) * (L.scale ?? 1), 0);
  const sum = (a) => a.reduce((s, x) => s + x, 0), eAvg = sum(E) / E.length;
  return {
    room: rm, grid: { points: pts, values, spacing: sp, nx: g.nx, ny: g.ny }, stats: { min: st.min, avg: st.avg, max: st.max, uo: st.minAvg, u1: st.minMax },
    em: st.avg, emin: st.min, emax: st.max, uo: st.minAvg,
    surfaces: { floor: avgOf(pr.patches, sol.E, 'floor') * k, ceiling: avgOf(pr.patches, sol.E, 'ceiling') * k, walls: avgOf(pr.patches, sol.E, 'wall') * k },
    directShare: eAvg > 0 ? Math.min(1, sum(direct) / E.length / eAvg) : 0,
    lumens, watts, count: luminaires.length, areaM2: pr.areaM2, lpd: pr.areaM2 > 0 ? watts / pr.areaM2 : 0, lpd100: st.avg > 0 && pr.areaM2 > 0 ? (watts / pr.areaM2) / (st.avg / 100) : 0,
    llf: k, patches: pr.N, sol, prep: pr, excluded, obstacles: obstacles ? obstacles.length : 0,
  };
}
