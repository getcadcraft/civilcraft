/* SPDX-License-Identifier: Apache-2.0 */
/**
 * measure.js — the Measure tool's arithmetic (0.7 PL.10; the requester of Track PL asked for measuring tools). No DOM: the Node
 * test drives it as the page does. Lengths are in the project's units (ft or m), areas in square units, grades in %.
 *
 *   measure(pts, { closed, zAt }) → {
 *     n, closed,
 *     segs: [{ L, bearing (radians from east, counter-clockwise), dz | null, grade_pct | null, L3d | null }],
 *     total (plan length; with the closing side when closed), total3d (along the ground: null when any end is off the surface),
 *     area (plan area of the closed shape, ≥ 3 points; else null), last (the last segment | null)
 *   }
 *     zAt(x, y) → ground elevation | null (the surface); a point's own z (a survey point it snapped to) wins
 *   between(a, b) → { dx (horizontal), dz (vertical), slope (straight-line), grade_pct | null }   two points on a profile:
 *     a, b = { ch, z } in project units (the power line profile's Measure)
 */

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function measure(pts, { closed = false, zAt = null } = {}) {
  const P = (Array.isArray(pts) ? pts : []).filter((p) => p && fin(p.x) && fin(p.y));
  const z = (p) => { if (fin(p.z)) return p.z; try { const v = zAt ? zAt(p.x, p.y) : null; return fin(v) ? v : null; } catch { return null; } };
  const Z = P.map(z);
  const shut = closed && P.length >= 3;
  const segs = [];
  const seg = (i, j) => {
    const a = P[i], b = P[j], L = Math.hypot(b.x - a.x, b.y - a.y);
    const dz = Z[i] != null && Z[j] != null ? Z[j] - Z[i] : null;
    return { L, bearing: Math.atan2(b.y - a.y, b.x - a.x), dz, grade_pct: dz != null && L > 1e-12 ? (dz / L) * 100 : null, L3d: dz != null ? Math.hypot(L, dz) : null };
  };
  for (let i = 1; i < P.length; i++) segs.push(seg(i - 1, i));
  if (shut) segs.push(seg(P.length - 1, 0));
  const total = segs.reduce((s, x) => s + x.L, 0);
  const total3d = segs.length && segs.every((x) => x.L3d != null) ? segs.reduce((s, x) => s + x.L3d, 0) : null;
  let area = null;
  if (shut) {
    let a2 = 0;
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a2 += p.x * q.y - q.x * p.y; }
    area = Math.abs(a2) / 2;
  }
  return { n: P.length, closed: shut, segs, total, total3d, area, last: segs.length ? segs[shut ? segs.length - 2 : segs.length - 1] || null : null };
}

export function between(a, b) {
  if (!a || !b || !fin(a.ch) || !fin(a.z) || !fin(b.ch) || !fin(b.z)) return null;
  const dx = Math.abs(b.ch - a.ch), dz = b.z - a.z;
  return { dx, dz, slope: Math.hypot(dx, dz), grade_pct: dx > 1e-12 ? (dz / dx) * 100 * Math.sign(b.ch - a.ch || 1) : null };
}
