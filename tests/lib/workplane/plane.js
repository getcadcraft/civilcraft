// SPDX-License-Identifier: Apache-2.0
/**
 * plane.js — the mathematics of a work plane (session bk-tools-b-10). Host-free, no DOM, no IFC: canonical in lib/workplane,
 * hosts carry byte-identical copies (tools/workplane/sync.mjs). Lengths are whatever the caller uses (the apps: millimetres).
 *
 * A plane is a FRAME { o, x, y, n }: a point on it and three unit vectors, right-handed (x cross y = n). A point of space has
 * plane coordinates [u, v, w]: u along x, v along y, w its distance in front of the plane (along n).
 *
 *   frame(o, n, xHint?)          a frame from a point and a normal. x is the hint laid into the plane; without one x is level
 *                                (horizontal) and y is the way up the plane; on a level plane x = [1, 0, 0], y = [0, 1, 0]
 *   levelPlane(z)                the level plane at height z, looking down (n = +Z)
 *   linePlane(a, b, z?)          the upright plane through the plan line a → b: x runs along the line, y is up
 *   acrossPlane(F, p, q)         the plane through the line p → q (plane coordinates of F) standing square to F: what a line drawn
 *                                in a view becomes (a reference plane drawn in plan is upright)
 *   toPlane(F, p) → [u, v, w]    fromPlane(F, u, v, w = 0) → [x, y, z]
 *   rayPlane(o, d, F)            where a ray meets the plane ([x, y, z]), null when it runs along it or away from it
 *   planeSection(F, tris)        the cut of a triangle soup (flat array, 9 numbers a triangle) by the plane → [[u1, v1, u2, v2] …]
 *   faceOutline(F, tris, tol?)   the outer boundary of the triangles lying in the plane → { outline: [[u, v] …] counter-clockwise,
 *                                area, holes: n } (null when they bound nothing)
 *   isUpright(F) / isLevel(F)    n is horizontal / vertical (within 0.001)
 *   polyArea(p)  signed          clipConvex(subject, clip)  the part of a polygon inside a CONVEX one (Sutherland-Hodgman)
 *   clipSegment(poly, a, b)      the pieces of a → b inside a polygon (even-odd; any polygon) → [[a', b'] …]
 *   insetConvex(poly, d)         a convex polygon moved in by d on every side (null when nothing is left)
 *   isConvex(poly)               frameKey(F) → 9 rounded numbers (two frames of the same plane and x read the same)
 */
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => { const l = len(a); return l > 1e-12 ? [a[0] / l, a[1] / l, a[2] / l] : null; };
const snap0 = (v) => v.map((c) => (Math.abs(c) < 1e-12 ? 0 : Math.abs(Math.abs(c) - 1) < 1e-12 ? Math.sign(c) : c));

export function frame(o, n, xHint = null) {
  const N = unit(n);
  if (!N) return null;
  let x = null;
  if (xHint) { const h = sub(xHint, mul(N, dot(xHint, N))); x = unit(h); }
  if (!x) {
    const h = cross([0, 0, 1], N);   // level, and to the right when you face the plane's front from outside
    x = len(h) > 1e-6 ? unit(h) : [1, 0, 0];
    if (len(h) <= 1e-6 && N[2] < 0) x = [1, 0, 0];
  }
  const y = unit(cross(N, x));
  return { o: [+o[0], +o[1], +o[2]], x: snap0(x), y: snap0(y), n: snap0(N) };
}
export const levelPlane = (z = 0) => ({ o: [0, 0, z], x: [1, 0, 0], y: [0, 1, 0], n: [0, 0, 1] });
export function linePlane(a, b, z = 0) {
  const x = unit([b[0] - a[0], b[1] - a[1], 0]);
  if (!x) return null;
  const y = [0, 0, 1];
  return { o: [a[0], a[1], z], x: snap0(x), y, n: snap0(cross(x, y)) };
}
export function acrossPlane(F, p, q) {
  const a = fromPlane(F, p[0], p[1]), b = fromPlane(F, q[0], q[1]);
  const x = unit(sub(b, a));
  if (!x) return null;
  // y is the way the view looks back at you: a line drawn in plan (n up) stands up; x cross y = the new normal
  const y = F.n;
  return { o: a, x: snap0(x), y: snap0(y), n: snap0(cross(x, y)) };
}
export const toPlane = (F, p) => { const d = sub(p, F.o); return [dot(d, F.x), dot(d, F.y), dot(d, F.n)]; };
export const fromPlane = (F, u, v, w = 0) => [F.o[0] + F.x[0] * u + F.y[0] * v + F.n[0] * w, F.o[1] + F.x[1] * u + F.y[1] * v + F.n[1] * w, F.o[2] + F.x[2] * u + F.y[2] * v + F.n[2] * w];
export const isUpright = (F) => Math.abs(F.n[2]) < 1e-3;
export const isLevel = (F) => Math.abs(Math.abs(F.n[2]) - 1) < 1e-6;
export const frameKey = (F) => [...F.o, ...F.x, ...F.n].map((c) => Math.round(c * 1e4) / 1e4).join(',');
export function rayPlane(o, d, F) {
  const k = dot(d, F.n);
  if (Math.abs(k) < 1e-12) return null;
  const t = dot(sub(F.o, o), F.n) / k;
  return t < 0 ? null : add(o, mul(d, t));
}

export function planeSection(F, tris, eps = 1e-6) {
  const out = [];
  for (let i = 0; i + 8 < tris.length; i += 9) {
    const P = [toPlane(F, [tris[i], tris[i + 1], tris[i + 2]]), toPlane(F, [tris[i + 3], tris[i + 4], tris[i + 5]]), toPlane(F, [tris[i + 6], tris[i + 7], tris[i + 8]])];
    const pts = [];
    for (let k = 0; k < 3; k++) {
      const a = P[k], b = P[(k + 1) % 3];
      if (Math.abs(a[2]) <= eps) { pts.push([a[0], a[1]]); continue; }
      if ((a[2] > eps && b[2] < -eps) || (a[2] < -eps && b[2] > eps)) { const t = a[2] / (a[2] - b[2]); pts.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    if (pts.length < 2 || pts.length > 2 && P.every((p) => Math.abs(p[2]) <= eps)) continue;   // a triangle lying IN the plane is a face, not a cut
    const [p, q] = pts;
    if (Math.hypot(p[0] - q[0], p[1] - q[1]) > eps) out.push([p[0], p[1], q[0], q[1]]);
  }
  return out;
}

export const polyArea = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
export function isConvex(p) {
  let sign = 0;
  for (let i = 0; i < p.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length], c = p[(i + 2) % p.length];
    const z = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (Math.abs(z) < 1e-9) continue;
    if (sign && Math.sign(z) !== sign) return false;
    sign = Math.sign(z);
  }
  return true;
}

/** The outer boundary of the triangles that lie in the plane (within tol of it): edges used once, chained. */
export function faceOutline(F, tris, tol = 0.5) {
  const key = (p) => Math.round(p[0] / tol) + ':' + Math.round(p[1] / tol);
  const edges = new Map(), pt = new Map();
  for (let i = 0; i + 8 < tris.length; i += 9) {
    const P = [0, 3, 6].map((k) => toPlane(F, [tris[i + k], tris[i + k + 1], tris[i + k + 2]]));
    if (P.some((p) => Math.abs(p[2]) > Math.max(tol, 1))) continue;
    let T = P.map((p) => [p[0], p[1]]);
    const a2 = polyArea(T);
    if (Math.abs(a2) < tol * tol * 1e-3) continue;
    if (a2 < 0) T = T.reverse();
    for (let k = 0; k < 3; k++) {
      const a = T[k], b = T[(k + 1) % 3], ka = key(a), kb = key(b);
      if (ka === kb) continue;
      pt.set(ka, a); pt.set(kb, b);
      if (edges.has(kb + '>' + ka)) edges.delete(kb + '>' + ka); else edges.set(ka + '>' + kb, [ka, kb]);
    }
  }
  if (!edges.size) return null;
  const next = new Map();
  for (const [a, b] of edges.values()) { if (!next.has(a)) next.set(a, []); next.get(a).push(b); }
  const loops = [];
  while (next.size) {
    const start = next.keys().next().value, loop = [];
    let at = start, guard = 0;
    while (guard++ < 100000) {
      loop.push(pt.get(at));
      const outs = next.get(at);
      if (!outs || !outs.length) break;
      const to = outs.shift();
      if (!outs.length) next.delete(at);
      at = to;
      if (at === start) break;
    }
    if (loop.length >= 3) loops.push(simplify(loop, tol));
  }
  const good = loops.filter((l) => l.length >= 3).map((l) => ({ l, a: polyArea(l) })).sort((p, q) => Math.abs(q.a) - Math.abs(p.a));
  if (!good.length) return null;
  const outer = good[0].a < 0 ? good[0].l.slice().reverse() : good[0].l;
  return { outline: outer, area: Math.abs(good[0].a), holes: good.length - 1 };
}
/** Points on a straight run between their neighbours are dropped. */
function simplify(loop, tol) {
  let p = loop.slice(), changed = true;
  while (changed && p.length > 3) {
    changed = false;
    for (let i = 0; i < p.length; i++) {
      const a = p[(i + p.length - 1) % p.length], b = p[i], c = p[(i + 1) % p.length];
      const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const d = L < 1e-9 ? Math.hypot(b[0] - a[0], b[1] - a[1]) : Math.abs((c[0] - a[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (c[1] - a[1])) / L;
      if (d <= tol * 0.5) { p.splice(i, 1); changed = true; break; }
    }
  }
  return p;
}

export function clipConvex(subject, clip) {
  let out = subject.slice();
  const ccw = polyArea(clip) >= 0 ? clip : clip.slice().reverse();
  for (let i = 0; i < ccw.length && out.length; i++) {
    const a = ccw[i], b = ccw[(i + 1) % ccw.length], inp = out; out = [];
    const side = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]);
    for (let k = 0; k < inp.length; k++) {
      const p = inp[k], q = inp[(k + 1) % inp.length], sp = side(p), sq = side(q);
      if (sp >= -1e-9) out.push(p);
      if ((sp > 1e-9 && sq < -1e-9) || (sp < -1e-9 && sq > 1e-9)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); }
    }
  }
  // points that fell together
  const res = [];
  for (const p of out) { const l = res[res.length - 1]; if (!l || Math.hypot(p[0] - l[0], p[1] - l[1]) > 1e-7) res.push(p); }
  if (res.length > 1 && Math.hypot(res[0][0] - res[res.length - 1][0], res[0][1] - res[res.length - 1][1]) <= 1e-7) res.pop();
  return res.length >= 3 ? res : [];
}
export function insetConvex(poly, d) {
  const p = polyArea(poly) >= 0 ? poly : poly.slice().reverse();
  let out = p.slice();
  for (let i = 0; i < p.length && out.length; i++) {
    const a = p[i], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (L < 1e-9) continue;
    const nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L;   // inward (left of a → b on a counter-clockwise polygon)
    const a2 = [a[0] + nx * d, a[1] + ny * d], b2 = [b[0] + nx * d, b[1] + ny * d];
    const far = 1e9, c2 = [b2[0] + nx * far, b2[1] + ny * far], d2 = [a2[0] + nx * far, a2[1] + ny * far];
    out = clipConvex(out, [a2, b2, c2, d2]);
  }
  return out.length >= 3 && Math.abs(polyArea(out)) > 1e-6 ? out : null;
}
const inside = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > y) !== (b[1] > y) && x < a[0] + ((y - a[1]) / (b[1] - a[1])) * (b[0] - a[0])) c = !c; } return c; };
export const inPolygon = (poly, p) => inside(poly, p[0], p[1]);
export function clipSegment(poly, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], ts = [0, 1];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i], q = poly[(i + 1) % poly.length], ex = q[0] - p[0], ey = q[1] - p[1];
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-12) continue;
    const t = ((p[0] - a[0]) * ey - (p[1] - a[1]) * ex) / den, s = ((p[0] - a[0]) * dy - (p[1] - a[1]) * dx) / den;
    if (t > 1e-9 && t < 1 - 1e-9 && s >= -1e-9 && s <= 1 + 1e-9) ts.push(t);
  }
  ts.sort((p, q) => p - q);
  const out = [];
  for (let i = 0; i + 1 < ts.length; i++) {
    const t0 = ts[i], t1 = ts[i + 1];
    if (t1 - t0 < 1e-9) continue;
    const m = (t0 + t1) / 2;
    if (!inside(poly, a[0] + dx * m, a[1] + dy * m)) continue;
    const s = [a[0] + dx * t0, a[1] + dy * t0], e = [a[0] + dx * t1, a[1] + dy * t1], last = out[out.length - 1];
    if (last && Math.hypot(last[1][0] - s[0], last[1][1] - s[1]) < 1e-7) last[1] = e; else out.push([s, e]);
  }
  return out;
}
