/* SPDX-License-Identifier: Apache-2.0 */
/**
 * feature-grade.js — grading tools that make a new feature line from one that is drawn (0.10.1, suggestion #1970). No DOM; the
 * Node test drives it (bin/test-civilcraft-sg1970.mjs).
 *
 * Both tools walk the source line by DISTANCE along it (plan length, arcs as their pieces within 0.01), between a start and a
 * stop distance, and work at every vertex in that stretch, at its two ends, and (where the result is not a straight line
 * between them) at even steps in between. `side` is +1 for the right of the direction the line is drawn in, −1 for the left.
 * At a corner the work line is the bisector (a mitre): an offset stays parallel to both segments.
 *
 *   samples(f, { from, to, spacing }) → [{ d, x, y, z, nx, ny (unit, to the right), m (mitre: 1 / cos(half the turn)) }]
 *
 *   slopeToSurface(f, surface, { side, from, to, slope0, slope1, spacing })
 *       → { pts: [{x, y, z}] (the daylight line), base: [{x, y, z}] (the source points the rays left from, same order),
 *           rays: [{ d, kind 'cut'|'fill'|'flat'|'off', len, H }], missed, problem }
 *     From every sample a slope runs square to the line, up where the surface is above the line and down where it is below,
 *     until it meets the surface. slope0 / slope1 = the slope at the start and the stop distance as H for 1 V (3 = 3:1); in
 *     between it changes evenly with distance (a transition). A ray that leaves the surface first is left out (`missed`).
 *
 *   slopePolygon(result) → [{x, y, z}] | null   the source stretch out to the daylight line and back, as a closed outline (for a
 *       closed design feature line: the slope graded into the proposed surface); null when it would cross itself
 *
 *   longOffset(f, { side, from, to, off0, off1, mode, s0, s1, z0, z1, grade, target, spacing }) → { pts, problem }
 *     An offset whose distance from the line changes evenly from off0 (at `from`) to off1 (at `to`), with its elevations by:
 *       mode 'slope'   a cross slope from the source line: z = source z + offset × s, s from s0 to s1 (rise over run, + = up
 *                      going away from the line)
 *       mode 'elev'    z0 at the start to z1 at the end, evenly along the source distance
 *       mode 'grade'   z0 at the start, then `grade` (rise over run) along the NEW line's own length
 *       mode 'toelev'  the offset is worked out instead of typed: a slope of |s| (s0 to s1) from the source line out to the
 *                      elevation `target`; z = target
 *
 * Problems are codes for the UI to word: 'range' (no stretch), 'slope' (a slope that is not above zero), 'numbers',
 * 'surface' (fewer than two rays reached the surface), 'fold' (the offset folds over itself).
 */

import { flatten } from './featureline.js';
import { castSlope, selfCrosses } from './grading.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

/** The line's plan length (arcs along their pieces). */
export function planLength(f) {
  const P = flatten(f);
  let L = 0;
  for (let k = 1; k < P.length; k++) L += Math.hypot(P[k].x - P[k - 1].x, P[k].y - P[k - 1].y);
  return L;
}

export function samples(f, { from = 0, to = Infinity, spacing = 0 } = {}) {
  const P0 = flatten(f), P = [];
  for (const p of P0) if (!P.length || Math.hypot(p.x - P[P.length - 1].x, p.y - P[P.length - 1].y) > 1e-12) P.push(p);
  if (P.length < 2) return [];
  const D = [0];
  for (let k = 1; k < P.length; k++) D.push(D[k - 1] + Math.hypot(P[k].x - P[k - 1].x, P[k].y - P[k - 1].y));
  const L = D[D.length - 1], a = Math.max(0, fin(from) ? from : 0), b = Math.min(L, fin(to) ? to : L);
  if (!(b - a > 1e-9)) return [];
  const segN = (k) => { const dx = P[k + 1].x - P[k].x, dy = P[k + 1].y - P[k].y, l = Math.hypot(dx, dy); return { x: dy / l, y: -dx / l }; };   // right of travel
  const onSeg = (k, d) => { const u = (d - D[k]) / (D[k + 1] - D[k]), n = segN(k); return { d, x: P[k].x + (P[k + 1].x - P[k].x) * u, y: P[k].y + (P[k + 1].y - P[k].y) * u, z: P[k].z + (P[k + 1].z - P[k].z) * u, nx: n.x, ny: n.y, m: 1 }; };
  const out = [];
  const step = spacing > 0 ? spacing : 0;
  for (let k = 0; k + 1 < P.length; k++) {
    const s0 = Math.max(a, D[k]), s1 = Math.min(b, D[k + 1]);
    if (!(s1 - s0 > 1e-9)) continue;
    // the start of this piece: the stretch's own start, or a vertex shared with the piece before (a mitre)
    if (!out.length) out.push(onSeg(k, s0));
    const n = step ? Math.max(1, Math.ceil((s1 - s0) / step - 1e-9)) : 1;
    for (let j = 1; j < n; j++) out.push(onSeg(k, s0 + ((s1 - s0) * j) / n));
    if (s1 < D[k + 1] - 1e-9 || k + 2 >= P.length || D[k + 1] >= b - 1e-9) out.push(onSeg(k, s1));   // the stop, or the line's end
    else {   // a vertex inside the stretch: the bisector of the two pieces' normals
      const n0 = segN(k), n1 = segN(k + 1), bx = n0.x + n1.x, by = n0.y + n1.y, bl = Math.hypot(bx, by);
      const c = bl > 1e-9 ? (bx * n1.x + by * n1.y) / bl : 0;
      if (c < 0.1) out.push({ d: D[k + 1], x: P[k + 1].x, y: P[k + 1].y, z: P[k + 1].z, nx: n0.x, ny: n0.y, m: 1, sharp: true });
      else out.push({ d: D[k + 1], x: P[k + 1].x, y: P[k + 1].y, z: P[k + 1].z, nx: bx / bl, ny: by / bl, m: 1 / c });
    }
  }
  return out;
}

export function slopeToSurface(f, surface, { side = 1, from = 0, to = Infinity, slope0, slope1 = slope0, spacing = 0 } = {}) {
  const out = { pts: [], base: [], rays: [], missed: 0, problem: null };
  if (!(slope0 > 0) || !(slope1 > 0) || !fin(slope0) || !fin(slope1)) { out.problem = 'slope'; return out; }
  if (!surface) { out.problem = 'surface'; return out; }
  const L = planLength(f), a = Math.max(0, fin(from) ? from : 0), b = Math.min(L, fin(to) ? to : L);
  const S = samples(f, { from: a, to: b, spacing: spacing > 0 ? spacing : Math.max((b - a) / 40, 1e-6) });
  if (S.length < 2) { out.problem = 'range'; return out; }
  const sgn = side < 0 ? -1 : 1;
  for (const s of S) {
    const H = slope0 + ((slope1 - slope0) * (s.d - a)) / (b - a);
    // along a mitre the slope climbs more slowly per unit travelled (rate = 1 / m), so it stays H:1 square to the segments
    const r = castSlope(surface, { x: s.x, y: s.y }, sgn * s.nx, sgn * s.ny, s.z, H, H, { rate: 1 / s.m, step: Math.max(H * 0.05, 0.05) });
    out.rays.push({ d: s.d, kind: r.kind, len: r.d, H });
    if (r.kind === 'off') { out.missed++; continue; }
    out.base.push({ x: s.x, y: s.y, z: s.z });
    out.pts.push({ x: r.x, y: r.y, z: r.z });
  }
  if (out.pts.length < 2) out.problem = 'surface';
  return out;
}

export function slopePolygon(res) {
  if (!res || res.problem || res.pts.length < 2) return null;
  const poly = [];
  const add = (p) => { if (!poly.length || Math.hypot(p.x - poly[poly.length - 1].x, p.y - poly[poly.length - 1].y) > 1e-6) poly.push({ x: p.x, y: p.y, z: p.z }); };
  res.base.forEach(add);
  [...res.pts].reverse().forEach(add);
  while (poly.length > 1 && Math.hypot(poly[0].x - poly[poly.length - 1].x, poly[0].y - poly[poly.length - 1].y) <= 1e-6) poly.pop();
  if (poly.length < 3 || selfCrosses(poly)) return null;
  return poly;
}

export function longOffset(f, { side = 1, from = 0, to = Infinity, off0 = 0, off1 = off0, mode = 'slope', s0 = 0, s1 = s0, z0 = null, z1 = null, grade = 0, target = null, spacing = 0 } = {}) {
  const L = planLength(f), a = Math.max(0, fin(from) ? from : 0), b = Math.min(L, fin(to) ? to : L);
  if (!(b - a > 1e-9)) return { pts: [], problem: 'range' };
  const sgn = side < 0 ? -1 : 1;
  if (mode === 'toelev') { if (!fin(target) || !fin(s0) || !fin(s1)) return { pts: [], problem: 'numbers' }; if (!(Math.abs(s0) > 1e-9) || !(Math.abs(s1) > 1e-9)) return { pts: [], problem: 'slope' }; }
  else if (!fin(off0) || !fin(off1)) return { pts: [], problem: 'numbers' };
  if (mode === 'slope' && (!fin(s0) || !fin(s1))) return { pts: [], problem: 'numbers' };
  if (mode === 'elev' && (!fin(z0) || !fin(z1))) return { pts: [], problem: 'numbers' };
  if (mode === 'grade' && (!fin(z0) || !fin(grade))) return { pts: [], problem: 'numbers' };
  if (!['slope', 'elev', 'grade', 'toelev'].includes(mode)) return { pts: [], problem: 'numbers' };
  // a straight line between two samples is exact unless two things change together along it
  const curved = (mode === 'slope' && off0 !== off1 && s0 !== s1) || (mode === 'toelev' && s0 !== s1);
  const S = samples(f, { from: a, to: b, spacing: spacing > 0 ? spacing : curved ? (b - a) / 16 : 0 });
  if (S.length < 2) return { pts: [], problem: 'range' };
  if (S.some((s) => s.sharp)) return { pts: [], problem: 'fold' };
  const pts = [];
  let own = 0;
  for (const s of S) {
    const u = (s.d - a) / (b - a), sl = s0 + (s1 - s0) * u;
    let off = off0 + (off1 - off0) * u, z;
    if (mode === 'toelev') { off = Math.abs(target - s.z) / Math.abs(sl); z = target; }
    const x = s.x + sgn * s.nx * off * s.m, y = s.y + sgn * s.ny * off * s.m;
    if (mode === 'slope') z = s.z + off * sl;
    else if (mode === 'elev') z = z0 + (z1 - z0) * u;
    else if (mode === 'grade') { if (pts.length) own += Math.hypot(x - pts[pts.length - 1].x, y - pts[pts.length - 1].y); z = z0 + grade * own; }
    pts.push({ x, y, z });
  }
  // the new line must run the same way as the source at every step (else the offset folded over a bend)
  for (let k = 1; k < S.length; k++) {
    const dx = S[k].x - S[k - 1].x, dy = S[k].y - S[k - 1].y, ex = pts[k].x - pts[k - 1].x, ey = pts[k].y - pts[k - 1].y;
    if (Math.hypot(ex, ey) < 1e-9) continue;   // both on the source line (an offset of 0)
    if (dx * ex + dy * ey <= 0) return { pts: [], problem: 'fold' };
  }
  const clean = pts.filter((p, k) => !k || Math.hypot(p.x - pts[k - 1].x, p.y - pts[k - 1].y) > 1e-9);
  if (clean.length < 2) return { pts: [], problem: 'range' };
  return { pts: clean, problem: null };
}
