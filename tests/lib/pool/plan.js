/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plan.js — the pool's outline in plan (0.11 POOL.8: L-shaped, round and freeform pools). Host-free; millimetres; y up.
 *
 * The outline is the finished water edge, a simple polygon turning counter-clockwise, moved so its bounding box starts at (0, 0): its length
 * (x) and width (y) are the pool's length and width, and the floor still falls along x from the shallow end (x = 0) to the deep end (x = L).
 *   rect  [0, 0, L, B]
 *   L     the rectangle less a notch notchL x notchW at its (L, B) corner
 *   round an ellipse in L x B (a circle when L = B), drawn as ROUND_SIDES straight sides whose corners are on the ellipse
 *   free  the person's own corners, "x,y; x,y; …" (millimetres, or feet and inches in the US system: units.js)
 * offset(poly, o) is the outline o further out (mitred corners); the shell, coping, paving, barrier and the pipe rings are all offsets of it.
 */

export const SHAPES = ['rect', 'L', 'round', 'free'];
export const ROUND_SIDES = 48;
const EPS = 1e-6;

export const area2 = (p) => p.reduce((s, q, i) => { const n = p[(i + 1) % p.length]; return s + q[0] * n[1] - n[0] * q[1]; }, 0);
export const area = (p) => Math.abs(area2(p)) / 2;
/** ∫x dA / A over the polygon (the x of its centroid). */
export function centroidX(p) {
  let a = 0, cx = 0;
  for (let i = 0; i < p.length; i++) { const q = p[i], n = p[(i + 1) % p.length], c = q[0] * n[1] - n[0] * q[1]; a += c; cx += (q[0] + n[0]) * c; }
  return a ? cx / (3 * a) : 0;
}
export const perimeter = (p) => p.reduce((s, q, i) => s + Math.hypot(p[(i + 1) % p.length][0] - q[0], p[(i + 1) % p.length][1] - q[1]), 0);
/** The edges: [{ i, a, b, len, d (unit along), n (unit outward, for a counter-clockwise polygon) }]. Edge i runs from corner i to corner i + 1. */
export function edges(p) {
  return p.map((a, i) => {
    const b = p[(i + 1) % p.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, d = [(b[0] - a[0]) / len, (b[1] - a[1]) / len];
    return { i, a, b, len, d, n: [d[1], -d[0]] };
  });
}
const segX = (a, b, c, d) => {
  const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
  if (Math.abs(den) < EPS) return false;
  const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den, u = ((c[0] - a[0]) * (b[1] - a[1]) - (c[1] - a[1]) * (b[0] - a[0])) / den;
  return t > EPS && t < 1 - EPS && u > EPS && u < 1 - EPS;
};
/** True when no two sides cross (sides that share a corner are not compared). */
export function isSimple(p) {
  const n = p.length;
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) {
    if (i === 0 && j === n - 1) continue;
    if (segX(p[i], p[(i + 1) % n], p[j], p[(j + 1) % n])) return false;
  }
  return true;
}
/** Drops repeated corners and corners on a straight line. */
export function tidyRing(p) {
  let out = p.filter((q, i) => Math.hypot(q[0] - p[(i + 1) % p.length][0], q[1] - p[(i + 1) % p.length][1]) > 1e-3);
  for (let pass = 0; pass < 3 && out.length > 3; pass++) {
    out = out.filter((q, i) => { const a = out[(i - 1 + out.length) % out.length], b = out[(i + 1) % out.length]; return Math.abs((q[0] - a[0]) * (b[1] - a[1]) - (q[1] - a[1]) * (b[0] - a[0])) > 1e-6 * Math.hypot(b[0] - a[0], b[1] - a[1]) * 1000; });
  }
  return out;
}

/** Corners typed as "x,y; x,y; …" (also one corner per line). parse(text) turns one number into millimetres. → { pts, bad } */
export function parseCorners(text, parse = Number) {
  const pts = [], bad = [];
  for (const raw of String(text || '').split(/[;\n]+/)) {
    const s = raw.trim();
    if (!s) continue;
    const m = s.split(/\s*,\s*/);
    const x = m.length === 2 ? parse(m[0]) : NaN, y = m.length === 2 ? parse(m[1]) : NaN;
    if (Number.isFinite(x) && Number.isFinite(y)) pts.push([x, y]); else bad.push(s);
  }
  return { pts, bad };
}

/**
 * The outline of a pool (cleanPool's values). → { poly (counter-clockwise, bounding box from 0, 0), L, B, problems: [code] }. A freeform outline
 * that cannot be used (fewer than 3 corners, sides crossing, under 1 m², over 200 corners) falls back to the rectangle and says why.
 */
export function outlineOf(d) {
  const L = d.length, B = d.width, problems = [];
  let poly;
  if (d.shape === 'L') {
    const nl = Math.min(Math.max(d.notchL, 0), L - 500), nw = Math.min(Math.max(d.notchW, 0), B - 500);
    if (nl !== d.notchL || nw !== d.notchW) problems.push('shape.notch');
    poly = nl > 0 && nw > 0 ? [[0, 0], [L, 0], [L, B - nw], [L - nl, B - nw], [L - nl, B], [0, B]] : [[0, 0], [L, 0], [L, B], [0, B]];
  } else if (d.shape === 'round') {
    poly = Array.from({ length: ROUND_SIDES }, (_, i) => { const a = (2 * Math.PI * i) / ROUND_SIDES; return [L / 2 + (L / 2) * Math.cos(a), B / 2 + (B / 2) * Math.sin(a)]; });
  } else if (d.shape === 'free') {
    let p = tidyRing((d.corners || []).map((q) => [Number(q[0]), Number(q[1])]).filter((q) => q.every(Number.isFinite)));
    if (p.length < 3 || p.length > 200) { problems.push('shape.corners'); p = null; }
    else if (!isSimple(p)) { problems.push('shape.crossing'); p = null; }
    else if (area(p) < 1e6) { problems.push('shape.small'); p = null; }
    if (p) {
      if (area2(p) < 0) p = p.reverse();
      const x0 = Math.min(...p.map((q) => q[0])), y0 = Math.min(...p.map((q) => q[1]));
      poly = p.map((q) => [q[0] - x0, q[1] - y0]);
      const Lf = Math.max(...poly.map((q) => q[0])), Bf = Math.max(...poly.map((q) => q[1]));
      if (Lf < 1000 || Bf < 1000) { problems.push('shape.small'); poly = null; }
      else return { poly, L: Lf, B: Bf, problems };
    }
    poly = [[0, 0], [L, 0], [L, B], [0, B]];
  } else poly = [[0, 0], [L, 0], [L, B], [0, B]];
  return { poly, L, B, problems };
}
export const isRect = (poly) => poly.length === 4 && poly.every((q, i) => { const n = poly[(i + 1) % 4]; return Math.abs(q[0] - n[0]) < EPS || Math.abs(q[1] - n[1]) < EPS; });

/**
 * The outline moved out by o (in by a negative o), each side parallel to its own, corners mitred, so it keeps one corner per corner and the
 * bands between two offsets are one quadrilateral per side. → the new polygon, or null when it crosses itself (an offset larger than a
 * narrow part of a freeform outline). sharpCorners(p) names the corners whose mitre reaches out more than four times the offset.
 */
export function offset(p, o) {
  if (!o) return p.map((q) => [...q]);
  const E = edges(p), out = [];
  for (let i = 0; i < p.length; i++) {
    const e0 = E[(i - 1 + p.length) % p.length], e1 = E[i];
    const a0 = [e0.a[0] + o * e0.n[0], e0.a[1] + o * e0.n[1]], d0 = e0.d, a1 = [e1.a[0] + o * e1.n[0], e1.a[1] + o * e1.n[1]], d1 = e1.d;
    const cr = d0[0] * d1[1] - d0[1] * d1[0];
    if (Math.abs(cr) < 1e-9) { out.push(a1); continue; }   // straight on
    const t = ((a1[0] - a0[0]) * d1[1] - (a1[1] - a0[1]) * d1[0]) / cr;
    out.push([a0[0] + t * d0[0], a0[1] + t * d0[1]]);
  }
  return isSimple(out) && area2(out) > 0 ? out : null;
}
export function sharpCorners(p) {
  const E = edges(p), out = [];
  for (let i = 0; i < p.length; i++) { const d0 = E[(i - 1 + p.length) % p.length].d, d1 = E[i].d; if (d0[0] * d1[0] + d0[1] * d1[1] < -0.94) out.push(i); }
  return out;
}
/** Quadrilaterals that fill the band between an outline and its offset, one per side: [[inner a, inner b, outer b, outer a]]. Both must have the same corners (no cut corners). */
export function bandQuads(inner, outer) {
  if (inner.length !== outer.length) return null;
  return inner.map((a, i) => { const j = (i + 1) % inner.length; return [a, inner[j], outer[j], outer[i]]; });
}
/** The point at distance s along the perimeter (from corner 0, counter-clockwise) → { at, edge (index), t (mm along it), n, d }. */
export function along(p, s) {
  const E = edges(p), per = E.reduce((a, e) => a + e.len, 0);
  let r = ((s % per) + per) % per;
  for (const e of E) { if (r <= e.len + EPS) return { at: [e.a[0] + e.d[0] * r, e.a[1] + e.d[1] * r], edge: e.i, t: r, n: e.n, d: e.d }; r -= e.len; }
  const e = E[E.length - 1];
  return { at: [...e.b], edge: e.i, t: e.len, n: e.n, d: e.d };
}
/** The x-intervals of the polygon along the line y = yc: [[x0, x1]…] sorted. */
export function spansAtY(p, yc) {
  const xs = [];
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length];
    if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + ((yc - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
  }
  xs.sort((u, v) => u - v);
  const out = [];
  for (let i = 0; i + 1 < xs.length; i += 2) out.push([xs[i], xs[i + 1]]);
  return out;
}
export function spansAtX(p, xc) { return spansAtY(p.map(([x, y]) => [y, x]), xc); }
const longest = (spans) => spans.reduce((b, s) => (!b || s[1] - s[0] > b[1] - b[0] ? s : b), null);
/** The longest x-interval at y (the long section's line), or null. */
export const longestAtY = (p, y) => longest(spansAtY(p, y));
export const longestAtX = (p, x) => longest(spansAtX(p, x));
export function inside(p, q) {
  let c = false;
  for (let i = 0, j = p.length - 1; i < p.length; j = i++) if ((p[i][1] > q[1]) !== (p[j][1] > q[1]) && q[0] < ((p[j][0] - p[i][0]) * (q[1] - p[i][1])) / (p[j][1] - p[i][1]) + p[i][0]) c = !c;
  return c;
}
/** The nearest point of the outline to q → { at, edge, t, dist }. */
export function nearest(p, q) {
  let best = null;
  for (const e of edges(p)) {
    const t = Math.max(0, Math.min(e.len, (q[0] - e.a[0]) * e.d[0] + (q[1] - e.a[1]) * e.d[1]));
    const at = [e.a[0] + e.d[0] * t, e.a[1] + e.d[1] * t], dist = Math.hypot(q[0] - at[0], q[1] - at[1]);
    if (!best || dist < best.dist) best = { at, edge: e.i, t, dist };
  }
  return best;
}
/** Distance along the perimeter of a point given by { edge, t }. */
export function sOf(p, pos) { const E = edges(p); let s = 0; for (let i = 0; i < pos.edge; i++) s += E[i].len; return s + pos.t; }
/** The perimeter path from distance s0 to s1 (counter-clockwise, s1 may be past one lap), with every corner on the way. */
export function pathAlong(p, s0, s1) {
  const per = perimeter(p), E = edges(p), out = [along(p, s0).at];
  let s = s0;
  const cum = []; let c = 0; for (const e of E) { c += e.len; cum.push(c); }
  while (s < s1 - EPS) {
    const r = ((s % per) + per) % per, lap = s - r;
    let next = Infinity;
    for (const k of cum) if (lap + k > s + EPS) { next = lap + k; break; }
    if (next === Infinity) next = lap + per;
    if (next >= s1 - EPS) { out.push(along(p, s1).at); break; }
    out.push(along(p, next).at);
    s = next;
  }
  return out;
}
