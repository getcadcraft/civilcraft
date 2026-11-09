/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/cut.js — the Cut recipes of the wall tool (0.9 WT.4, wall tool spec pages 6-7 and test 6; session walls-09). Host-free:
 * a wall { guid, a, b, bulge, t } in, the parts out; the host writes them (the first part keeps the wall's id and everything it
 * holds, each other part is a new wall of the same type) and runs its join solver.
 *
 *   splitAt(wall, s, { gap, free })   cut at s mm along the wall (from a). gap 0: the two parts meet end to end at the cut; gap > 0:
 *                                     a gap that long, centred on the cut. free: the cut ends get "Disallow join" (decision D2's
 *                                     other answer; the default keeps the two parts joined in line, as spec test 6 expects)
 *                                     → { parts: [{ a, b, bulge, keep, joinOff }], cut: [s0, s1] }
 *   deleteSegment(wall, s0, s1)       remove the piece between s0 and s1 → { parts } (one or two parts; none left is refused)
 *   crossingAt(wall, other)           where another wall's centre line crosses this one → s along this wall (null when it does not)
 *   station(wall, p)                  how far along the wall the point p is (mm from a), and how far off it: { s, off }
 *   canRejoin(w1, w2, { tol })        two parts of one wall: in line, same type, ends meeting or a gap between them →
 *                                     { a, b, bulge } of the one wall they make again (w1's id), or null
 *   openingsAfter(openings, cut)      the doors and windows of the wall, sorted by part: { stay, move: [{ guid, offset }], cut }
 *                                     (cut: those the cut would pass through: the host refuses the change)
 *
 * Curved walls are split along their arc: each part keeps the same circle (its bulge for its own turn). Errors thrown:
 * { key: 'walls.err.cutend' } (a cut within MIN_PART of an end), 'walls.err.cutgap' (a gap that leaves less than MIN_PART).
 */
export const MIN_PART = 50;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const fail = (key) => { throw Object.assign(new Error(key), { key }); };
const TAU = 2 * Math.PI;

/** The circle of a curved wall (BimCraft's model-arcs.js arcOf, repeated here so the library stands alone). */
function arcOf(a, b, bulge) {
  const bg = Number(bulge) || 0, dx = b[0] - a[0], dy = b[1] - a[1], c = Math.hypot(dx, dy);
  if (!(Math.abs(bg) > 1e-9) || c < 1e-9) return null;
  const theta = 4 * Math.atan(bg), nl = [-dy / c, dx / c], h = bg * c / 2, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const mid = [m[0] - nl[0] * h, m[1] - nl[1] * h], R = ((c / 2) ** 2 + h * h) / (2 * Math.abs(h)), sg = Math.sign(theta);
  const C = [mid[0] + nl[0] * R * sg, mid[1] + nl[1] * R * sg];
  return { C, R, theta, sg, a0: Math.atan2(a[1] - C[1], a[0] - C[0]), len: R * Math.abs(theta) };
}
export const wallLength = (w) => { const k = arcOf(w.a, w.b, w.bulge); return k ? k.len : dist(w.a, w.b); };
/** The point s mm along the wall, and a part from s0 to s1 as { a, b, bulge }. */
function along(w) {
  const k = arcOf(w.a, w.b, w.bulge);
  if (!k) { const L = dist(w.a, w.b), u = [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L]; return { L, at: (s) => [w.a[0] + u[0] * s, w.a[1] + u[1] * s], part: (s0, s1) => ({ a: [w.a[0] + u[0] * s0, w.a[1] + u[1] * s0], b: [w.a[0] + u[0] * s1, w.a[1] + u[1] * s1], bulge: 0 }) }; }
  const at = (s) => { const f = k.a0 + k.sg * s / k.R; return [k.C[0] + k.R * Math.cos(f), k.C[1] + k.R * Math.sin(f)]; };
  return { L: k.len, at, part: (s0, s1) => ({ a: at(s0), b: at(s1), bulge: Math.tan(k.sg * (s1 - s0) / k.R / 4) }) };
}
export function station(w, p) {
  const k = arcOf(w.a, w.b, w.bulge);
  if (!k) { const L = dist(w.a, w.b), u = [(w.b[0] - w.a[0]) / L, (w.b[1] - w.a[1]) / L], r = sub(p, w.a); return { s: dot(r, u), off: cross(u, r) }; }
  let d = (Math.atan2(p[1] - k.C[1], p[0] - k.C[0]) - k.a0) * k.sg;
  d = ((d % TAU) + TAU) % TAU;
  if (d > Math.abs(k.theta) + (TAU - Math.abs(k.theta)) / 2) d -= TAU;   // nearer the start than the end, going back
  return { s: k.R * d, off: (k.R - dist(p, k.C)) * k.sg };
}

export function splitAt(wall, s, { gap = 0, free = false } = {}) {
  const g = along(wall), L = g.L, half = Math.max(0, gap) / 2, s0 = s - half, s1 = s + half;
  if (!(s > MIN_PART && s < L - MIN_PART)) fail('walls.err.cutend');
  if (s0 < MIN_PART || s1 > L - MIN_PART) fail('walls.err.cutgap');
  const first = { ...g.part(0, s0), keep: true, joinOff: { a: !!wall.joinOff?.a, b: free && !gap } };
  const second = { ...g.part(s1, L), keep: false, joinOff: { a: free && !gap, b: !!wall.joinOff?.b } };
  return { parts: [first, second], cut: [s0, s1] };
}

export function deleteSegment(wall, s0, s1) {
  const g = along(wall), L = g.L;
  let lo = Math.max(0, Math.min(s0, s1)), hi = Math.min(L, Math.max(s0, s1));
  if (lo < MIN_PART) lo = 0;
  if (hi > L - MIN_PART) hi = L;
  if (hi - lo < 1) fail('walls.err.small');
  if (lo === 0 && hi === L) fail('walls.err.all');
  const parts = [];
  if (lo > 0) parts.push({ ...g.part(0, lo), keep: true, joinOff: { a: !!wall.joinOff?.a, b: false } });
  if (hi < L) parts.push({ ...g.part(hi, L), keep: !parts.length, joinOff: { a: false, b: !!wall.joinOff?.b } });
  return { parts, cut: [lo, hi] };
}

export function crossingAt(wall, other) {
  if (wall.bulge || other.bulge) return null;
  const r = sub(wall.b, wall.a), q = sub(other.b, other.a), den = cross(r, q);
  if (Math.abs(den) < 1e-9 * Math.hypot(...r) * Math.hypot(...q)) return null;
  const d = sub(other.a, wall.a), t = cross(d, q) / den, u = cross(d, r) / den;
  const Lq = Math.hypot(...q), slack = (other.t || 0) / 2 / Lq;
  if (u < -slack || u > 1 + slack || t <= 0 || t >= 1) return null;
  return t * Math.hypot(...r);
}

export function canRejoin(w1, w2, { tol = 1, maxGap = 5000 } = {}) {
  if (w1.guid === w2.guid || (w1.typeKey && w2.typeKey && w1.typeKey !== w2.typeKey) || Math.abs((w1.t || 0) - (w2.t || 0)) > 0.5) return null;
  if (w1.bulge || w2.bulge) {
    const k1 = arcOf(w1.a, w1.b, w1.bulge), k2 = arcOf(w2.a, w2.b, w2.bulge);
    if (!k1 || !k2 || dist(k1.C, k2.C) > tol || Math.abs(k1.R - k2.R) > tol || k1.sg !== k2.sg) return null;
    const ang = (from, to) => { const f = (Math.atan2(to[1] - k1.C[1], to[0] - k1.C[0]) - Math.atan2(from[1] - k1.C[1], from[0] - k1.C[0])) * k1.sg; return ((f % TAU) + TAU) % TAU; };
    // the order going round the way they turn: p, then q after p's end
    const [p, q, kp] = ang(w1.a, w2.a) >= Math.abs(k1.theta) - 1e-6 ? [w1, w2, k1] : [w2, w1, k2];
    const th = ang(p.a, q.b);
    if (th < Math.abs(kp.theta) || th > 1.5 * Math.PI + 1e-9 || ang(p.b, q.a) * k1.R > maxGap) return null;
    return { a: p.a, b: q.b, bulge: Math.tan(k1.sg * th / 4) };
  }
  const u = sub(w1.b, w1.a), L = Math.hypot(...u), e = [u[0] / L, u[1] / L];
  const off = (p) => Math.abs(cross(e, sub(p, w1.a)));
  if (off(w2.a) > tol || off(w2.b) > tol) return null;
  if (Math.abs(cross(e, sub(w2.b, w2.a))) > tol) return null;
  const s = (p) => dot(sub(p, w1.a), e), ends = [[0, w1.a], [L, w1.b], [s(w2.a), w2.a], [s(w2.b), w2.b]].sort((x, y) => x[0] - y[0]);
  // the gap between them (or their overlap) no longer than maxGap
  const s2 = [s(w2.a), s(w2.b)].sort((x, y) => x - y);
  const gapLen = s2[0] >= L ? s2[0] - L : s2[1] <= 0 ? -s2[1] : 0;
  if (gapLen > maxGap) return null;
  // keep w1's direction
  return { a: ends[0][1], b: ends[3][1], bulge: 0 };
}

export function openingsAfter(openings, cut) {
  const [s0, s1] = cut, stay = [], move = [], through = [];
  for (const o of openings) {
    const o0 = o.offset, o1 = o.offset + o.width;
    if (o1 <= s0 + 0.5) stay.push(o.guid);
    else if (o0 >= s1 - 0.5) move.push({ guid: o.guid, offset: o0 - s1 });
    else through.push(o.guid);
  }
  return { stay, move, cut: through };
}
