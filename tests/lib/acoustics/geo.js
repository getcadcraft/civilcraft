/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * geo.js — geometric room acoustics (0.8 XE.3 phase S2, session ind_PART_4). DOM-free; lib/acoustics is canonical. Two methods, both energy-based per octave band:
 *   imageSourceBox(box, source, listener, opts)   exact specular reflections of a box room (Allen & Berkley 1979): every image source inside a radius
 *                                                  adds the energy (1 − α)^(reflections) / (4π d²) at the delay d / c, then air absorption exp(−m d).
 *   traceRoom(room, source, listener, opts)       stochastic ray tracing of any room of planar polygons, with a scattering coefficient per surface
 *                                                  (a ray is reflected diffusely with that probability, else specularly) and a spherical receiver.
 * Both return an echogram per band: { sr, bands: [{ f, e: Float64Array }], ... } where e[n] is the energy (arbitrary but common units) arriving in the n-th bin.
 * echogramMetrics() turns it into EDT / T20 / T30 / C50 / C80 / D50 / Ts through metrics.js (the echogram's square root is the amplitude it measures).
 * The scattering default is an assumption (0.1, say so in the panel), not a value from a standard: the person sets it per surface.
 * Honest limits: geometric methods are not valid below the Schroeder frequency (modes.js gives it); diffraction is not modelled.
 */
import { BANDS, airM } from './acoustics.js';
import { roomMetrics } from './metrics.js';

export const SOUND_SPEED = 343;

/** Image sources of a box lx × ly × lz. `walls` = { x0, x1, y0, y1, z0, z1 } each an array of 6 band absorptions. */
export function imageSourceBox(box, source, listener, { walls, sr = 8000, tmax = 0.8, env = {} } = {}) {
  const c = SOUND_SPEED, R = c * tmax, N = Math.ceil(tmax * sr);
  const L = [box.lx, box.ly, box.lz];
  const bands = BANDS.map((f) => ({ f, e: new Float64Array(N) })), m = BANDS.map((f) => (env.air === false ? 0 : airM(f, env)));
  const rf = BANDS.map((_, b) => ({ x0: 1 - walls.x0[b], x1: 1 - walls.x1[b], y0: 1 - walls.y0[b], y1: 1 - walls.y1[b], z0: 1 - walls.z0[b], z1: 1 - walls.z1[b] }));
  const n = L.map((l) => Math.ceil(R / (2 * l)) + 1);
  let count = 0;
  for (let i = -n[0]; i <= n[0]; i++) for (let j = -n[1]; j <= n[1]; j++) for (let k = -n[2]; k <= n[2]; k++) for (let p = 0; p < 8; p++) {
    const px = p & 1, py = p >> 1 & 1, pz = p >> 2 & 1;
    const ix = (1 - 2 * px) * source[0] + 2 * i * L[0] + 2 * px * 0 + (px ? 0 : 0), iy = (1 - 2 * py) * source[1] + 2 * j * L[1], iz = (1 - 2 * pz) * source[2] + 2 * k * L[2];
    const d = Math.hypot(ix - listener[0], iy - listener[1], iz - listener[2]);
    if (d > R) continue;
    // reflections on each wall pair: image index (i, px) → |2i − px| hits of the x1 side and |2i| … of x0; standard counts
    const hx0 = Math.abs(i - px), hx1 = Math.abs(i), hy0 = Math.abs(j - py), hy1 = Math.abs(j), hz0 = Math.abs(k - pz), hz1 = Math.abs(k);
    const idx = Math.round(d / c * sr);
    if (idx >= N) continue;
    count++;
    for (let b = 0; b < bands.length; b++) {
      const r = rf[b], g = Math.pow(r.x0, hx0) * Math.pow(r.x1, hx1) * Math.pow(r.y0, hy0) * Math.pow(r.y1, hy1) * Math.pow(r.z0, hz0) * Math.pow(r.z1, hz1);
      bands[b].e[idx] += g * Math.exp(-m[b] * d) / (4 * Math.PI * Math.max(d, 0.05) ** 2);
    }
  }
  return { sr, bands, method: 'image-source', images: count, direct: Math.hypot(source[0] - listener[0], source[1] - listener[1], source[2] - listener[2]) };
}

/** Deterministic generator. */
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/** A box as six rectangles for traceRoom: surfaces carry `alpha` (6 band values) and `scatter` (0..1). */
export function boxSurfaces(box, walls, scatter = 0.1) {
  const { lx, ly, lz } = box, S = (name, pts, alpha) => ({ name, pts, alpha, scatter });
  return [
    S('x0', [[0, 0, 0], [0, ly, 0], [0, ly, lz], [0, 0, lz]], walls.x0), S('x1', [[lx, 0, 0], [lx, ly, 0], [lx, ly, lz], [lx, 0, lz]], walls.x1),
    S('y0', [[0, 0, 0], [lx, 0, 0], [lx, 0, lz], [0, 0, lz]], walls.y0), S('y1', [[0, ly, 0], [lx, ly, 0], [lx, ly, lz], [0, ly, lz]], walls.y1),
    S('z0', [[0, 0, 0], [lx, 0, 0], [lx, ly, 0], [0, ly, 0]], walls.z0), S('z1', [[0, 0, lz], [lx, 0, lz], [lx, ly, lz], [0, ly, lz]], walls.z1),
  ];
}

function prep(surfaces) {
  return surfaces.map((s) => {
    const [a, b, c] = s.pts, u = sub(b, a), v = sub(c, a); let n = cross(u, v); const l = Math.hypot(...n); n = n.map((x) => x / l);
    return { ...s, n, d: dot(n, a) };
  });
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** Is point p (on the plane) inside the convex polygon? */
function inside(s, p) {
  const pts = s.pts; let sign = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], k = dot(cross(sub(b, a), sub(p, a)), s.n);
    if (Math.abs(k) < 1e-12) continue;
    const sg = k > 0 ? 1 : -1;
    if (sign === 0) sign = sg; else if (sg !== sign) return false;
  }
  return true;
}

/** Ray tracing. room = { surfaces: [{ pts (convex planar polygon), alpha[6], scatter }] }. */
export function traceRoom(room, source, listener, { rays = 20000, sr = 8000, tmax = 0.8, radius = 0.5, seed = 1, env = {} } = {}) {
  const c = SOUND_SPEED, N = Math.ceil(tmax * sr), surf = prep(room.surfaces), rand = rng(seed);
  const nb = BANDS.length, bands = BANDS.map((f) => ({ f, e: new Float64Array(N) })), m = BANDS.map((f) => (env.air === false ? 0 : airM(f, env)));
  const vs = 4 / 3 * Math.PI * radius ** 3, golden = Math.PI * (3 - Math.sqrt(5));
  const en = new Float64Array(nb);
  for (let r = 0; r < rays; r++) {
    const z = 1 - 2 * (r + 0.5) / rays, rr = Math.sqrt(1 - z * z);
    let dir = [rr * Math.cos(golden * r), rr * Math.sin(golden * r), z], pos = source.slice(), t = 0;
    en.fill(1 / rays);
    for (let bounce = 0; bounce < 400 && t < tmax; bounce++) {
      let best = Infinity, hit = -1;
      for (let i = 0; i < surf.length; i++) {
        const s = surf[i], den = dot(s.n, dir);
        if (Math.abs(den) < 1e-12) continue;
        const tt = (s.d - dot(s.n, pos)) / den;
        if (tt > 1e-7 && tt < best && inside(s, [pos[0] + dir[0] * tt, pos[1] + dir[1] * tt, pos[2] + dir[2] * tt])) { best = tt; hit = i; }
      }
      if (hit < 0) break;
      // receiver: the chord of this segment inside the sphere
      const w = sub(pos, listener), bq = dot(w, dir), cq = dot(w, w) - radius * radius, disc = bq * bq - cq;
      if (disc > 0) {
        const sq = Math.sqrt(disc), t0 = Math.max(0, -bq - sq), t1 = Math.min(best, -bq + sq);
        if (t1 > t0) {
          const chord = t1 - t0, tm = t + (t0 + t1) / 2 / c, idx = Math.floor(tm * sr);
          if (idx >= 0 && idx < N) for (let b = 0; b < nb; b++) bands[b].e[idx] += en[b] * chord / vs * Math.exp(-m[b] * (tm * c));
        }
      }
      pos = [pos[0] + dir[0] * best, pos[1] + dir[1] * best, pos[2] + dir[2] * best]; t += best / c;
      const s = surf[hit];
      let any = 0;
      for (let b = 0; b < nb; b++) { en[b] *= 1 - s.alpha[b]; any += en[b]; }
      if (any < 1e-12 / rays) break;
      let n = s.n; if (dot(n, dir) > 0) n = n.map((x) => -x);
      if (rand() < s.scatter) {                              // diffuse: Lambert about the normal
        const u1 = rand(), u2 = rand(), rho = Math.sqrt(u1), ph = 2 * Math.PI * u2;
        const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0], t1v = cross(n, a), l1 = Math.hypot(...t1v), tt1 = t1v.map((x) => x / l1), tt2 = cross(n, tt1);
        dir = [0, 1, 2].map((q) => tt1[q] * rho * Math.cos(ph) + tt2[q] * rho * Math.sin(ph) + n[q] * Math.sqrt(1 - u1));
      } else { const k = 2 * dot(dir, n); dir = [dir[0] - k * n[0], dir[1] - k * n[1], dir[2] - k * n[2]]; }
    }
  }
  return { sr, bands, method: 'ray-tracing', rays, radius, direct: Math.hypot(source[0] - listener[0], source[1] - listener[1], source[2] - listener[2]) };
}

/** EDT, T20, T30, C50, C80, D50, Ts per band from an echogram (the square root of its energy is the amplitude the measures read). */
export function echogramMetrics(eg) {
  return eg.bands.map((b) => {
    const amp = new Float32Array(b.e.length);
    for (let i = 0; i < amp.length; i++) amp[i] = Math.sqrt(b.e[i]);
    return { f: b.f, ...roomMetrics(amp, eg.sr, null) };
  });
}

/** Metrics over a grid of listener positions (a seat map): { points: [{ at, bands }] }. `method` 'image' needs a box. */
export function seatMap(room, source, seats, opts = {}) {
  return seats.map((at) => {
    const eg = opts.method === 'image' ? imageSourceBox(room.box, source, at, { ...opts, walls: room.walls }) : traceRoom(room, source, at, opts);
    return { at, bands: echogramMetrics(eg) };
  });
}
