/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-step is a standalone library; its errors are codes (the app words them). */
/**
 * geom.js — the geometry of a STEP file (ISO 10303-42, as the AP203 / AP214 / AP242 long-form schemas list it): placements,
 * curves and surfaces, each evaluated and (for surfaces) inverted, for cc-step's tessellator (0.7 D7.26, session part-08).
 * Written from the published schemas (refs/step-spec/); no STEP library's source read. DOM-free, import-free.
 *
 *   Curves  { kind, at(t) → [x,y,z], range: [t0, t1] | null (unbounded), period: number | 0, project(p) → t }
 *           line, circle, ellipse, polyline, bspline (rational or not); trimmed and surface / seam curves resolve to their basis.
 *   Surfaces { kind, at(u, v), project(p, hint?) → [u, v], periodU, periodV, scale: [su, sv] (≈ length per parameter unit, so the
 *           (u, v) domain can be triangulated with sensible shapes), singular(p) → 'u' when the point is a pole (u undefined),
 *           flat (no refinement needed) }
 *           plane, cylinder, cone, sphere, torus, bspline, revolution, extrusion; offset surfaces approximated by their basis
 *           moved along its normal.
 * Parameters of conics and of the angle surfaces are in radians here: the reader converts a file's plane-angle unit first.
 */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a); return l > 0 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 1]; };
export const V3 = { sub, add, mul, dot, cross, len, norm };
const TAU = 2 * Math.PI;

/** An axis2_placement_3d as { o, x, y, z } (Part 42 build_axes: x is ref_direction made square to z; defaults (1,0,0) / (0,1,0)). */
export function frame(o, axis, ref) {
  const z = axis ? norm(axis) : [0, 0, 1];
  let r = ref ? ref : (Math.abs(z[0] - 1) < 1e-12 && Math.abs(z[1]) < 1e-12 && Math.abs(z[2]) < 1e-12 ? [0, 1, 0] : [1, 0, 0]);
  let x = sub(r, mul(z, dot(r, z)));
  if (len(x) < 1e-12) { r = Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]; x = sub(r, mul(z, dot(r, z))); }
  x = norm(x);
  return { o: [...o], x, y: cross(z, x), z };
}
const local = (F, p) => { const d = sub(p, F.o); return [dot(d, F.x), dot(d, F.y), dot(d, F.z)]; };
const world = (F, a, b, c) => [F.o[0] + F.x[0] * a + F.y[0] * b + F.z[0] * c, F.o[1] + F.x[1] * a + F.y[1] * b + F.z[1] * c, F.o[2] + F.x[2] * a + F.y[2] * b + F.z[2] * c];

/** The angle nearest `near` that is congruent to a (mod period). */
export const wrapNear = (a, near, period) => (period ? a + Math.round((near - a) / period) * period : a);

// ---- curves ----------------------------------------------------------------------------------------------------------

export function line(p, dir) {
  const d = norm(dir);
  return { kind: 'line', range: null, period: 0, at: (t) => add(p, mul(d, t)), project: (q) => dot(sub(q, p), d) };
}
export function circle(F, r) {
  return { kind: 'circle', range: [0, TAU], period: TAU, r, F,
    at: (t) => world(F, r * Math.cos(t), r * Math.sin(t), 0),
    project: (q) => { const l = local(F, q); let a = Math.atan2(l[1], l[0]); if (a < 0) a += TAU; return a; } };
}
export function ellipse(F, a, b) {
  return { kind: 'ellipse', range: [0, TAU], period: TAU,
    at: (t) => world(F, a * Math.cos(t), b * Math.sin(t), 0),
    project: (q) => {
      const l = local(F, q);
      let t = Math.atan2(l[1] / b, l[0] / a);
      for (let i = 0; i < 8; i++) {   // Newton on the distance (the eccentric angle is not the closest point when a ≠ b)
        const x = a * Math.cos(t), y = b * Math.sin(t), dx = -a * Math.sin(t), dy = b * Math.cos(t);
        const f = (x - l[0]) * dx + (y - l[1]) * dy, df = dx * dx + dy * dy + (x - l[0]) * -x + (y - l[1]) * -y;
        if (!(Math.abs(df) > 1e-30)) break;
        t -= f / df;
      }
      if (t < 0) t += TAU;
      return t % TAU;
    } };
}
export function polyline(pts) {
  const n = pts.length;
  const at = (t) => { const i = Math.max(0, Math.min(n - 2, Math.floor(t))); const f = t - i; return add(mul(pts[i], 1 - f), mul(pts[i + 1], f)); };
  return { kind: 'polyline', range: [0, n - 1], period: 0, pts, at,
    project: (q) => { let best = 0, bd = Infinity; for (let i = 0; i + 1 < n; i++) { const d = sub(pts[i + 1], pts[i]), l2 = dot(d, d); let f = l2 > 0 ? dot(sub(q, pts[i]), d) / l2 : 0; f = Math.max(0, Math.min(1, f)); const e = len(sub(add(pts[i], mul(d, f)), q)); if (e < bd) { bd = e; best = i + f; } } return best; } };
}

// ---- B-splines (rational or not) ---------------------------------------------------------------------------------------

/** Knots expanded by their multiplicities. */
export function expandKnots(knots, mults) { const out = []; knots.forEach((k, i) => { for (let m = 0; m < mults[i]; m++) out.push(k); }); return out; }
/** The span index i with U[i] ≤ t < U[i+1] (the last non-empty one at the end). */
function span(U, p, n, t) {
  if (t >= U[n + 1]) return n;
  if (t <= U[p]) return p;
  let lo = p, hi = n + 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (t < U[mid]) hi = mid; else lo = mid; }
  return lo;
}
/** The p + 1 non-zero basis functions at t in span i (Cox–de Boor, the triangular table). */
function basis(U, p, i, t, out) {
  const left = new Float64Array(p + 1), right = new Float64Array(p + 1);
  out[0] = 1;
  for (let j = 1; j <= p; j++) {
    left[j] = t - U[i + 1 - j]; right[j] = U[i + j] - t;
    let saved = 0;
    for (let r = 0; r < j; r++) { const den = right[r + 1] + left[j - r]; const tmp = den !== 0 ? out[r] / den : 0; out[r] = saved + right[r + 1] * tmp; saved = left[j - r] * tmp; }
    out[j] = saved;
  }
  return out;
}

export function bsplineCurve(p, P, U, W = null, closed = false) {
  const n = P.length - 1;
  if (U.length !== n + p + 2) throw new Error('step.bad_bspline');
  const N = new Float64Array(p + 1);
  const range = [U[p], U[n + 1]];
  // periodic for us when its two ends meet (the file's closed flag is not always set; first and last poles need not repeat)
  const ends = (() => { const N0 = new Float64Array(p + 1); const ev = (t) => { const i = span(U, p, n, t); basis(U, p, i, t, N0); let x = 0, y = 0, z = 0, w = 0; for (let r = 0; r <= p; r++) { const k = i - p + r, b = N0[r] * (W ? W[k] : 1); x += b * P[k][0]; y += b * P[k][1]; z += b * P[k][2]; w += b; } return W ? [x / w, y / w, z / w] : [x, y, z]; }; return [ev(range[0]), ev(range[1])]; })();
  let ext = 0; for (const q of P) ext = Math.max(ext, len(q));
  const per = len(sub(ends[0], ends[1])) < 1e-9 * Math.max(1, ext) || (closed && len(sub(P[0], P[n])) < 1e-9 * Math.max(1, ext)) ? range[1] - range[0] : 0;
  const at = (t) => {
    if (per) t = range[0] + ((((t - range[0]) % per) + per) % per);
    else t = Math.max(range[0], Math.min(range[1], t));
    const i = span(U, p, n, t); basis(U, p, i, t, N);
    let x = 0, y = 0, z = 0, w = 0;
    for (let r = 0; r <= p; r++) { const k = i - p + r, b = N[r] * (W ? W[k] : 1); x += b * P[k][0]; y += b * P[k][1]; z += b * P[k][2]; w += b; }
    return W ? [x / w, y / w, z / w] : [x, y, z];
  };
  const c = { kind: 'bspline', range, period: per, at, p, P, U,
    project: (q) => {
      // a coarse search over the spans, then a shrinking three-point search around the best (never loses the closest point:
      // Newton with numerical second derivatives wandered on some curves)
      const m = Math.max(32, 8 * (n + 1));
      const span0 = range[1] - range[0] || 1;
      let best = range[0], bd = Infinity;
      for (let k = 0; k <= m; k++) { const t = range[0] + span0 * k / m; const d = len(sub(at(t), q)); if (d < bd) { bd = d; best = t; } }
      const lim = (t) => (per ? t : Math.max(range[0], Math.min(range[1], t)));
      let step = span0 / m;
      for (let it = 0; it < 200 && step > 1e-13 * span0; it++) {
        const a = lim(best - step), b = lim(best + step);
        const da = len(sub(at(a), q)), db = len(sub(at(b), q));
        if (da < bd && da <= db) { bd = da; best = a; }
        else if (db < bd) { bd = db; best = b; }
        else step /= 2;
      }
      return per ? range[0] + ((((best - range[0]) % per) + per) % per) : best;
    } };
  return c;
}

export function bsplineSurface(pu, pv, P, U, Vk, W = null, closedU = false, closedV = false) {
  const nu = P.length - 1, nv = P[0].length - 1;
  if (U.length !== nu + pu + 2 || Vk.length !== nv + pv + 2 || P.some((row) => row.length !== nv + 1)) throw new Error('step.bad_bspline');
  const Nu = new Float64Array(pu + 1), Nv = new Float64Array(pv + 1);
  const ru = [U[pu], U[nu + 1]], rv = [Vk[pv], Vk[nv + 1]];
  const at = (u, v) => {
    u = Math.max(ru[0], Math.min(ru[1], u)); v = Math.max(rv[0], Math.min(rv[1], v));
    const i = span(U, pu, nu, u), j = span(Vk, pv, nv, v);
    basis(U, pu, i, u, Nu); basis(Vk, pv, j, v, Nv);
    let x = 0, y = 0, z = 0, w = 0;
    for (let a = 0; a <= pu; a++) for (let b = 0; b <= pv; b++) {
      const ka = i - pu + a, kb = j - pv + b, f = Nu[a] * Nv[b] * (W ? W[ka][kb] : 1), q = P[ka][kb];
      x += f * q[0]; y += f * q[1]; z += f * q[2]; w += f;
    }
    return W ? [x / w, y / w, z / w] : [x, y, z];
  };
  // a closed direction is periodic only when its first and last rows of control points coincide
  const rowsMeet = (a, b) => a.every((q, k) => len(sub(q, b[k])) < 1e-7 * Math.max(1, len(q)));
  const periodU = closedU && rowsMeet(P[0], P[nu]) ? ru[1] - ru[0] : 0;
  const periodV = closedV && rowsMeet(P.map((r) => r[0]), P.map((r) => r[nv])) ? rv[1] - rv[0] : 0;
  // parameter scales from the control net (length per unit of parameter)
  let lu = 0, lv = 0;
  for (let a = 0; a < nu; a++) for (let b = 0; b <= nv; b++) lu += len(sub(P[a + 1][b], P[a][b]));
  for (let a = 0; a <= nu; a++) for (let b = 0; b < nv; b++) lv += len(sub(P[a][b + 1], P[a][b]));
  const su = Math.max(1e-9, lu / (nv + 1) / ((ru[1] - ru[0]) || 1)), sv = Math.max(1e-9, lv / (nu + 1) / ((rv[1] - rv[0]) || 1));
  // a grid of samples for the first guess of an inverse projection
  const G = Math.min(48, Math.max(8, 3 * Math.max(nu, nv)));
  let grid = null;
  const samples = () => {
    if (grid) return grid;
    grid = [];
    for (let a = 0; a <= G; a++) for (let b = 0; b <= G; b++) { const u = ru[0] + (ru[1] - ru[0]) * a / G, v = rv[0] + (rv[1] - rv[0]) * b / G; grid.push([u, v, at(u, v)]); }
    return grid;
  };
  const project = (q, hint) => {
    let u, v;
    if (hint) [u, v] = hint;
    else { let bd = Infinity; for (const [a, b, p] of samples()) { const d = len(sub(p, q)); if (d < bd) { bd = d; u = a; v = b; } } }
    const hu = 1e-6 * ((ru[1] - ru[0]) || 1), hv = 1e-6 * ((rv[1] - rv[0]) || 1);
    for (let it = 0; it < 30; it++) {
      const S = at(u, v);
      const Su = mul(sub(at(u + hu, v), at(u - hu, v)), 1 / (2 * hu)), Sv = mul(sub(at(u, v + hv), at(u, v - hv)), 1 / (2 * hv));
      const r = sub(S, q);
      // Gauss–Newton on |S − q|²: [Su·Su Su·Sv; Su·Sv Sv·Sv] d = −[r·Su; r·Sv]
      const a11 = dot(Su, Su), a12 = dot(Su, Sv), a22 = dot(Sv, Sv), b1 = -dot(r, Su), b2 = -dot(r, Sv);
      const det = a11 * a22 - a12 * a12;
      if (!(Math.abs(det) > 1e-30)) break;
      let du = (b1 * a22 - b2 * a12) / det, dv = (a11 * b2 - a12 * b1) / det;
      const nu2 = periodU ? u + du : Math.max(ru[0], Math.min(ru[1], u + du)), nv2 = periodV ? v + dv : Math.max(rv[0], Math.min(rv[1], v + dv));
      du = nu2 - u; dv = nv2 - v; u = nu2; v = nv2;
      if (Math.abs(du) < 1e-13 * ((ru[1] - ru[0]) || 1) && Math.abs(dv) < 1e-13 * ((rv[1] - rv[0]) || 1)) break;
    }
    if (periodU) u = ru[0] + ((((u - ru[0]) % periodU) + periodU) % periodU);
    if (periodV) v = rv[0] + ((((v - rv[0]) % periodV) + periodV) % periodV);
    return [u, v];
  };
  return { kind: 'bspline', at: (u, v) => at(periodU ? ru[0] + ((((u - ru[0]) % periodU) + periodU) % periodU) : u, periodV ? rv[0] + ((((v - rv[0]) % periodV) + periodV) % periodV) : v),
    project, periodU, periodV, scale: [su, sv], ru, rv, singular: () => null, flat: false, P };
}

// ---- elementary and swept surfaces ----------------------------------------------------------------------------------------

export function plane(F) {
  return { kind: 'plane', F, at: (u, v) => world(F, u, v, 0), project: (q) => { const l = local(F, q); return [l[0], l[1]]; },
    periodU: 0, periodV: 0, scale: [1, 1], singular: () => null, flat: true };
}
export function cylinder(F, r) {
  return { kind: 'cylinder', F, r, at: (u, v) => world(F, r * Math.cos(u), r * Math.sin(u), v),
    project: (q) => { const l = local(F, q); let a = Math.atan2(l[1], l[0]); if (a < 0) a += TAU; return [a, l[2]]; },
    periodU: TAU, periodV: 0, scale: [r, 1], singular: () => null, flat: false };
}
/** Cone: radius R at v = 0, growing by tan(semi) per unit of v along z (Part 42). The apex (radius 0) is a pole. */
export function cone(F, R, semi) {
  const k = Math.tan(semi);
  const rad = (v) => R + v * k;
  return { kind: 'cone', F, at: (u, v) => { const r = rad(v); return world(F, r * Math.cos(u), r * Math.sin(u), v); },
    project: (q) => {
      const l = local(F, q);
      let a = Math.atan2(l[1], l[0]); if (a < 0) a += TAU;
      // the closest point on the generating line at angle a: along (k, 1) from (R, 0)
      const rho = Math.hypot(l[0], l[1]), c = Math.hypot(k, 1);
      return [a, ((rho - R) * k + l[2]) / (c * c)];
    },
    periodU: TAU, periodV: 0, scale: [Math.max(Math.abs(R), 1e-6), Math.hypot(k, 1)], flat: false,
    singular: (q) => { const l = local(F, q); return Math.hypot(l[0], l[1]) < 1e-9 * Math.max(1, Math.abs(R), Math.abs(l[2])) ? 'u' : null; } };
}
export function sphere(F, r) {
  return { kind: 'sphere', F, r, at: (u, v) => world(F, r * Math.cos(v) * Math.cos(u), r * Math.cos(v) * Math.sin(u), r * Math.sin(v)),
    project: (q) => { const l = local(F, q); let a = Math.atan2(l[1], l[0]); if (a < 0) a += TAU; return [a, Math.atan2(l[2], Math.hypot(l[0], l[1]))]; },
    periodU: TAU, periodV: 0, scale: [r, r], flat: false,
    singular: (q) => { const l = local(F, q); return Math.hypot(l[0], l[1]) < 1e-9 * r ? 'u' : null; } };
}
export function torus(F, R, r) {
  return { kind: 'torus', F, at: (u, v) => { const c = R + r * Math.cos(v); return world(F, c * Math.cos(u), c * Math.sin(u), r * Math.sin(v)); },
    project: (q) => {
      const l = local(F, q);
      let a = Math.atan2(l[1], l[0]); if (a < 0) a += TAU;
      let b = Math.atan2(l[2], Math.hypot(l[0], l[1]) - R); if (b < 0) b += TAU;
      return [a, b];
    },
    periodU: TAU, periodV: TAU, scale: [R + r, r], singular: () => null, flat: false };
}
/** The swept curve turned about the axis by u; v is the curve's parameter. */
export function revolution(curve, o, axis) {
  const z = norm(axis);
  const at = (u, v) => {
    const p = curve.at(v), d = sub(p, o), h = dot(d, z), rr = sub(d, mul(z, h));
    const c = Math.cos(u), s = Math.sin(u);
    return add(add(o, mul(z, h)), add(mul(rr, c), mul(cross(z, rr), s)));
  };
  // the curve's own first point fixes u = 0 (the meridian plane through it)
  const p0 = curve.at(curve.range ? curve.range[0] : 0), d0 = sub(p0, o), r0 = sub(d0, mul(z, dot(d0, z)));
  const ex = len(r0) > 1e-12 ? norm(r0) : frame(o, z).x, ey = cross(z, ex);
  const span = curve.range ? curve.range[1] - curve.range[0] : 1;
  let L = 0; { const m = 16; let prev = curve.at(curve.range ? curve.range[0] : 0); for (let i = 1; i <= m; i++) { const q = curve.at((curve.range ? curve.range[0] : 0) + span * i / m); L += len(sub(q, prev)); prev = q; } }
  let rmax = 1e-6; { const m = 16; for (let i = 0; i <= m; i++) { const q = curve.at((curve.range ? curve.range[0] : 0) + span * i / m), d = sub(q, o); rmax = Math.max(rmax, len(sub(d, mul(z, dot(d, z))))); } }
  return { kind: 'revolution', at, periodU: TAU, periodV: 0, scale: [rmax, L / (span || 1)], flat: false,
    project: (q) => {
      const d = sub(q, o), h = dot(d, z), rr = sub(d, mul(z, h));
      let a = Math.atan2(dot(rr, ey), dot(rr, ex)); if (a < 0) a += TAU;
      // turn q back into the meridian plane, then find it on the curve
      const back = add(add(o, mul(z, h)), mul(ex, len(rr)));
      // the curve's points sit in their own meridian (angle 0 at the curve's start): the turned-back point lies there
      return [a, curve.project(back)];
    },
    singular: (q) => { const d = sub(q, o); return len(sub(d, mul(z, dot(d, z)))) < 1e-9 * Math.max(1, rmax) ? 'u' : null; } };
}
export function extrusion(curve, vec) {
  const d = norm(vec), m = len(vec);
  const span = curve.range ? curve.range[1] - curve.range[0] : 1;
  let L = 0; { const k = 16; let prev = curve.at(curve.range ? curve.range[0] : 0); for (let i = 1; i <= k; i++) { const q = curve.at((curve.range ? curve.range[0] : 0) + span * i / k); L += len(sub(q, prev)); prev = q; } }
  return { kind: 'extrusion', at: (u, v) => add(curve.at(u), mul(vec, v)), periodU: curve.period || 0, periodV: 0, scale: [L / (span || 1), m || 1], flat: curve.kind === 'line' || curve.kind === 'polyline',
    project: (q) => {
      // the point moved back along the extrusion onto the curve's plane is not known in general: iterate
      let v = 0, u = curve.project(q);
      for (let it = 0; it < 10; it++) { const c = curve.at(u); v = dot(sub(q, c), d) / (m || 1); const nu = curve.project(sub(q, mul(vec, v))); if (Math.abs(nu - u) < 1e-12) break; u = nu; }
      return [u, v];
    },
    singular: () => null };
}
/** An offset surface, approximated: the basis moved along its numerical normal by d (exact for planes, cylinders, spheres). */
export function offset(basis, d) {
  const nAt = (u, v) => {
    const hu = 1e-6, hv = 1e-6;
    const Su = sub(basis.at(u + hu, v), basis.at(u - hu, v)), Sv = sub(basis.at(u, v + hv), basis.at(u, v - hv));
    return norm(cross(Su, Sv));
  };
  return { ...basis, kind: 'offset', flat: basis.flat, at: (u, v) => add(basis.at(u, v), mul(nAt(u, v), d)),
    project: (q, hint) => basis.project(q, hint) };
}
