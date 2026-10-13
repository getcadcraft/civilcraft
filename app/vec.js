/* SPDX-License-Identifier: Apache-2.0 */
/**
 * vec.js — small 3D vector and 4×4 matrix helpers for ModelCraft. No DOM, no dependency.
 * Points and vectors are plain arrays [x, y, z]. Matrices are 16-number arrays in column-major
 * order (the same layout as three.js and glTF), so m[12..14] is the translation.
 * Model space is Z up, X = red, Y = green, Z = blue; lengths are meters.
 */

export const EPS = 1e-6;          // length tolerance (m): 1 µm
export const EPS2 = EPS * EPS;

export const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const len = (a) => Math.hypot(a[0], a[1], a[2]);
export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
export const neg = (a) => [-a[0], -a[1], -a[2]];
export const near = (a, b, tol = EPS) => dist(a, b) <= tol;
export function norm(a) {
  const l = len(a);
  return l > 1e-15 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
}
/** Any unit vector perpendicular to n. */
export function perp(n) {
  const a = Math.abs(n[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  return norm(cross(n, a));
}
export const parallel = (a, b, tol = 1e-9) => len(cross(norm(a), norm(b))) <= tol;

/** Newell normal of a polygon (array of points): unit, CCW = right-hand rule; [0,0,0] if degenerate. */
export function newell(pts) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    x += (p[1] - q[1]) * (p[2] + q[2]);
    y += (p[2] - q[2]) * (p[0] + q[0]);
    z += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return norm([x, y, z]);
}
/** Twice-area vector length (Newell), unnormalised: the polygon's area = len / 2. */
export function polyArea3(pts) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[(i + 1) % pts.length];
    x += (p[1] - q[1]) * (p[2] + q[2]);
    y += (p[2] - q[2]) * (p[0] + q[0]);
    z += (p[0] - q[0]) * (p[1] + q[1]);
  }
  return Math.hypot(x, y, z) / 2;
}

/** A plane {n, d} with n·p = d and n made canonical (first non-zero component positive). */
export function planeFrom(n, p) {
  let m = norm(n);
  const k = Math.abs(m[0]) > 1e-9 ? 0 : Math.abs(m[1]) > 1e-9 ? 1 : 2;
  if (m[k] < 0) m = neg(m);
  return { n: m, d: dot(m, p) };
}
export const onPlane = (pl, p, tol = EPS) => Math.abs(dot(pl.n, p) - pl.d) <= tol;
export const samePlane = (a, b) => Math.abs(dot(a.n, b.n)) > 1 - 1e-9 && Math.abs(a.d * Math.sign(dot(a.n, b.n)) - b.d) <= EPS;

/** 2D frame on a plane normal n: u × v = n. */
export function frame(n) {
  // horizontal planes: u = +X (v = +Y when n = +Z); others: u horizontal, v up the plane
  const u = Math.abs(n[2]) > 0.999 ? [1, 0, 0] : norm(cross([0, 0, 1], n));
  return { u, v: cross(n, u), n };
}
export const to2 = (f, p) => [dot(p, f.u), dot(p, f.v)];

/** Closest points between the line o + t·d (a ray, t ≥ 0 not enforced) and the segment a–b. */
export function rayToSegment(o, d, a, b) {
  const u = sub(b, a), w = sub(o, a);
  const A = dot(d, d), B = dot(d, u), C = dot(u, u), D = dot(d, w), E = dot(u, w);
  const den = A * C - B * B;
  let t, s;
  if (den < 1e-14) { s = 0; t = -D / A; }
  else { t = (B * E - C * D) / den; s = (A * E - B * D) / den; }
  if (s < 0) { s = 0; t = -D / A; }
  else if (s > 1) { s = 1; t = (B - D) / A; }
  return { t, s, onRay: add(o, mul(d, t)), onSeg: add(a, mul(u, s)) };
}
/** Closest point to p on the infinite line a + s·u (u need not be unit). */
export function closestOnLine(p, a, u) {
  const s = dot(sub(p, a), u) / dot(u, u);
  return { s, p: add(a, mul(u, s)) };
}
/** Closest points between two infinite lines; null when parallel. */
export function lineLine(o1, d1, o2, d2) {
  const w = sub(o1, o2);
  const A = dot(d1, d1), B = dot(d1, d2), C = dot(d2, d2), D = dot(d1, w), E = dot(d2, w);
  const den = A * C - B * B;
  if (Math.abs(den) < 1e-14 * A * C) return null;
  const t = (B * E - C * D) / den, s = (A * E - B * D) / den;
  return { t, s, p1: add(o1, mul(d1, t)), p2: add(o2, mul(d2, s)) };
}
export function rayPlane(o, d, pl) {
  const den = dot(pl.n, d);
  if (Math.abs(den) < 1e-12) return null;
  const t = (pl.d - dot(pl.n, o)) / den;
  return { t, p: add(o, mul(d, t)) };
}
/** Möller–Trumbore; returns t or null (both sides). */
export function rayTri(o, d, a, b, c) {
  const e1 = sub(b, a), e2 = sub(c, a), p = cross(d, e2), det = dot(e1, p);
  if (Math.abs(det) < 1e-14) return null;
  const inv = 1 / det, s = sub(o, a), u = dot(s, p) * inv;
  if (u < -1e-9 || u > 1 + 1e-9) return null;
  const q = cross(s, e1), v = dot(d, q) * inv;
  if (v < -1e-9 || u + v > 1 + 1e-9) return null;
  const t = dot(e2, q) * inv;
  return t > 0 ? t : null;
}

// ---- matrices (column-major) ----
export const IDENT = Object.freeze([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
export const ident = () => IDENT.slice();
export function mmul(a, b) {
  const r = new Array(16);
  for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) {
    let s = 0;
    for (let k = 0; k < 4; k++) s += a[k * 4 + rr] * b[c * 4 + k];
    r[c * 4 + rr] = s;
  }
  return r;
}
export const translation = (t) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, t[0], t[1], t[2], 1];
export function scaling(s, about = [0, 0, 0]) {
  const S = [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1];
  return mmul(translation(about), mmul(S, translation(neg(about))));
}
/** Rotation by angle (radians, right-hand) about the axis through `about`. */
export function rotation(axis, angle, about = [0, 0, 0]) {
  const [x, y, z] = norm(axis), c = Math.cos(angle), s = Math.sin(angle), t = 1 - c;
  const R = [
    t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0,
    t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0,
    t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0,
    0, 0, 0, 1,
  ];
  return mmul(translation(about), mmul(R, translation(neg(about))));
}
export function apply(m, p) {
  const x = p[0], y = p[1], z = p[2];
  const w = m[3] * x + m[7] * y + m[11] * z + m[15] || 1;
  return [(m[0] * x + m[4] * y + m[8] * z + m[12]) / w, (m[1] * x + m[5] * y + m[9] * z + m[13]) / w, (m[2] * x + m[6] * y + m[10] * z + m[14]) / w];
}
/** Direction (no translation). */
export const applyDir = (m, v) => [m[0] * v[0] + m[4] * v[1] + m[8] * v[2], m[1] * v[0] + m[5] * v[1] + m[9] * v[2], m[2] * v[0] + m[6] * v[1] + m[10] * v[2]];
/** Normal transform for an affine m (inverse transpose of its 3×3), normalised. */
export function applyNormal(m, n) {
  const inv = invert(m);
  return norm([inv[0] * n[0] + inv[1] * n[1] + inv[2] * n[2], inv[4] * n[0] + inv[5] * n[1] + inv[6] * n[2], inv[8] * n[0] + inv[9] * n[1] + inv[10] * n[2]]);
}
export const det3 = (m) => m[0] * (m[5] * m[10] - m[9] * m[6]) - m[4] * (m[1] * m[10] - m[9] * m[2]) + m[8] * (m[1] * m[6] - m[5] * m[2]);
export function invert(m) {
  const a = m, r = new Array(16);
  const [a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23, a30, a31, a32, a33] = a;
  const b00 = a00 * a11 - a01 * a10, b01 = a00 * a12 - a02 * a10, b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11, b04 = a01 * a13 - a03 * a11, b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30, b07 = a20 * a32 - a22 * a30, b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31, b10 = a21 * a33 - a23 * a31, b11 = a22 * a33 - a23 * a32;
  let det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
  if (!det) return ident();
  det = 1 / det;
  r[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
  r[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
  r[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
  r[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
  r[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
  r[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
  r[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
  r[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
  r[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
  r[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
  r[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
  r[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
  r[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
  r[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
  r[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
  r[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
  return r;
}
export const isIdent = (m) => m.every((v, i) => Math.abs(v - IDENT[i]) < 1e-12);

/** Bounding box helpers: {min, max} or null. */
export function bboxAdd(bb, p) {
  if (!bb) return { min: p.slice(), max: p.slice() };
  for (let k = 0; k < 3; k++) { if (p[k] < bb.min[k]) bb.min[k] = p[k]; if (p[k] > bb.max[k]) bb.max[k] = p[k]; }
  return bb;
}
