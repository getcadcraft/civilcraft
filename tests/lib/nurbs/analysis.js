/* SPDX-License-Identifier: Apache-2.0 */
/**
 * analysis.js — cc-nurbs (0.8 SU.747b, session `nurbs`): the quality views, from the exact surface (analytic normals and
 * curvatures at every vertex of an adaptive tessellation), never from facet normals. DOM-free; a host colours the numbers.
 *
 *   zebra(n, view, { axis = [0, 0, 1], stripes = 12 }) → 0 | 1: stripes of a striped environment seen in the reflection of `view`
 *     (the unit direction from the eye to the point) about the normal n; the stripes are bands of equal angle round `axis`
 *     (a reflection-line test: the bands run on unbroken across a G1 edge and keep their width across a G2 edge)
 *   zebraValue(n, view, opts) → the continuous phase in [0, 1) (a host may smooth-step it in a shader)
 *   maps(s, { tol, maxPerSpan }) → the tessellation with per-vertex K, H, kmax (largest |principal curvature|) and their ranges
 *   comb(c, { samples, scale }) → { teeth: [{ p, q, k }], max } — curvature comb: q = p − scale·κ·N (pointing away from the centre)
 *   isoLines(s, { u = 8, v = 8 }) → { u: [curves], v: [curves] } (exact iso-curves, evenly spaced in parameter)
 *   deviation(s, points) → { max, mean, rms, at, d: Float64Array } (closest-point distance of each point to the surface)
 *   ranges(values) → { min, max } (finite values only)
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as V from './vec.js';

export function zebraValue(n, view, { axis = [0, 0, 1], stripes = 12 } = {}) {
  const r = V.sub(view, V.mul(n, 2 * V.dot(view, n)));
  const a = V.norm(axis), x = V.perp(a), y = V.cross(a, x);
  const ang = Math.atan2(V.dot(r, y), V.dot(r, x));      // −π … π round the axis
  const ph = ((ang / (2 * Math.PI)) * stripes) % 1;
  return ph < 0 ? ph + 1 : ph;
}
export const zebra = (n, view, opts) => (zebraValue(n, view, opts) < 0.5 ? 0 : 1);

export function ranges(values) {
  let min = Infinity, max = -Infinity;
  for (const x of values) if (Number.isFinite(x)) { if (x < min) min = x; if (x > max) max = x; }
  return min === Infinity ? { min: 0, max: 0 } : { min, max };
}

export function maps(s, { tol = 0.01, maxPerSpan = 64 } = {}) {
  const t = S.tessellate(s, { tol, maxPerSpan, curvature: true });
  const kmax = new Float64Array(t.K.length);
  for (let i = 0; i < kmax.length; i++) { const H = t.H[i], K = t.K[i], d = Math.sqrt(Math.max(0, H * H - K)); kmax[i] = Math.max(Math.abs(H + d), Math.abs(H - d)); }
  return { ...t, kmax, rangeK: ranges(t.K), rangeH: ranges(t.H), rangeKmax: ranges(kmax) };
}

export function comb(c, { samples = 64, scale = 1 } = {}) {
  const [a, b] = C.domain(c), teeth = [];
  let max = 0;
  for (let i = 0; i <= samples; i++) {
    const u = a + (b - a) * i / samples, p = C.point(c, u), kv = C.curvatureVector(c, u), k = V.len(kv);
    teeth.push({ u, p, q: V.sub(p, V.mul(kv, scale)), k });
    if (k > max) max = k;
  }
  return { teeth, max };
}

export function isoLines(s, { u = 8, v = 8 } = {}) {
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
  return {
    u: Array.from({ length: u + 1 }, (_, i) => S.isoCurve(s, 'u', ua + (ub - ua) * i / u)),
    v: Array.from({ length: v + 1 }, (_, j) => S.isoCurve(s, 'v', va + (vb - va) * j / v)),
  };
}

export function deviation(s, points) {
  const d = new Float64Array(points.length);
  let max = 0, sum = 0, sq = 0, at = 0;
  points.forEach((p, i) => { const x = S.closestPoint(s, p).d; d[i] = x; sum += x; sq += x * x; if (x > max) { max = x; at = i; } });
  const n = Math.max(1, points.length);
  return { max, mean: sum / n, rms: Math.sqrt(sq / n), at, d };
}
