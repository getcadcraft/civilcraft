/* SPDX-License-Identifier: Apache-2.0 */
/**
 * alignment.js — horizontal alignments by PIs with circular curves. No DOM.
 *
 *   buildAlignment({ pis: [{x, y, r}], start = 0 }) → Alignment
 *     pis: the points of intersection in order; r (radius) at an interior PI makes a circular
 *     curve there (0 or missing = an angle point). First and last PI are the ends.
 *   a.elements      [{ type:'line', p0, p1, dir, sta, len } | { type:'arc', p0, p1, c, r, ccw, delta, a0, sta, len, pi, T, E, M, chord, pc, pt }]
 *   a.length, a.start, a.end (stations), a.errors (overlapping curves, tiny tangents)
 *   a.pointAt(sta) → { x, y, dir } (dir = forward direction, radians)
 *   a.stationOffset(x, y) → { sta, off (right of the alignment = +), x, y, outside } | null
 *   a.polyline(maxSeg) → [{x, y, sta}] (arcs as chords no longer than maxSeg, and within 0.5° of turn)
 *   a.ticks(step) → [{ sta, x, y, dir }] at every whole multiple of step
 *
 * Without a spiral the curve facts follow the usual arc-definition formulas: T = R·tan(Δ/2), L = R·Δ, E = R(sec(Δ/2) − 1),
 * M = R(1 − cos(Δ/2)), chord = 2R·sin(Δ/2). With spirals (Ls, R, θs = Ls / 2R): Xc = Ls(1 − θs²/10 + θs⁴/216 − …),
 * Yc = Ls(θs/3 − θs³/42 + θs⁵/1320 − …), p = Yc − R(1 − cos θs), k = Xc − R sin θs, Ts = (R + p)·tan(Δ/2) + k,
 * Es = (R + p)·sec(Δ/2) − R, Lc = R(Δ − 2θs).
 *
 * 0.7.1 71.26 (rail transitions): a PI may carry `tr` = one of TRANSITIONS (default 'clothoid'); both ends of the curve use it.
 *   clothoid   κ = l / (R·Ls)                                   (linear curvature; the series above)
 *   cubic      cubic parabola y = x³ / (6·R·Ls), x along the tangent: here Ls is the length ALONG THE TANGENT (the formula's L),
 *              the element's `len` is its true length along the curve (a little longer); θ = atan(Ls / 2R) at the end
 *   bloss      κ = (3u² − 2u³) / R                              (u = l / Ls)
 *   helmert    κ = 2u² / R for u ≤ ½, (1 − 2(1 − u)²) / R after  (Schramm's two parabolas, "biquadratic")
 *   sinehalf   κ = (1 − cos πu) / (2R)                          (the sine half-wave / cosine transition)
 *   sine       κ = (u − sin(2πu) / 2π) / R                      (Klein's sine transition)
 * All but the cubic turn by θ = Ls / 2R; their x, y are the integrals of cos θ, sin θ (Gauss–Legendre, exact to ~1e-12 of Ls).
 *   transitionAt(kind, l, R, Ls) → { x, y, th }   transitionLength(kind, R, Ls)   cubicParamFor(R, len) (the cubic's Ls from a length)
 *   spiral elements carry `tr` (the kind), `Lp` (the PI's Ls as typed) and `len` (the true length); a.curves records carry
 *   tr, ls1 / ls2 = the true lengths, lp1 / lp2 = as typed.
 */

import { t } from "./i18n.js";

const TAU = Math.PI * 2;
export const normAng = (a) => { a %= TAU; if (a <= -Math.PI) a += TAU; if (a > Math.PI) a -= TAU; return a; };

/** A clothoid from zero curvature: at distance l along a spiral of length Ls that ends at radius R, the point (x along the starting
 *  tangent, y toward the turn) and the turn so far th = l² / (2·R·Ls). The power series is exact to double precision for th up to ~2 rad. */
export function clothoid(l, R, Ls) {
  const th = (l * l) / (2 * R * Ls), t2 = th * th;
  let x = 0, y = 0, fx = 1, fy = th;
  for (let n = 0; n < 24; n++) {
    x += fx / (4 * n + 1); y += fy / (4 * n + 3);
    fx *= -t2 / ((2 * n + 1) * (2 * n + 2)); fy *= -t2 / ((2 * n + 2) * (2 * n + 3));
  }
  return { x: l * x, y: l * y, th };
}
/** The spiral's constants for radius R and length Ls: θs, Xc, Yc (the end's offsets), the shift p and the offset k (and `len`,
 *  its true length: Ls except for the cubic parabola). */
export function spiralConstants(R, Ls, kind = 'clothoid') {
  if (!(Ls > 0) || !(R > 0)) return { th: 0, Xc: 0, Yc: 0, p: 0, k: 0, len: 0 };
  const len = transitionLength(kind, R, Ls), c = transitionAt(kind, len, R, Ls);
  return { th: c.th, Xc: c.x, Yc: c.y, p: c.y - R * (1 - Math.cos(c.th)), k: c.x - R * Math.sin(c.th), len };
}

// ---- 0.7.1 71.26: rail transitions
export const TRANSITIONS = ['clothoid', 'cubic', 'bloss', 'helmert', 'sinehalf', 'sine'];
export const trOf = (v) => (TRANSITIONS.includes(v) ? v : 'clothoid');
/** Curvature shape f(u) (κ = f / R) and its integral F(u) (θ = Ls·F / R) of each integrated kind. */
const SHAPES = {
  bloss: { f: (u) => u * u * (3 - 2 * u), F: (u) => u ** 3 - u ** 4 / 2 },
  helmert: { f: (u) => (u <= 0.5 ? 2 * u * u : 1 - 2 * (1 - u) ** 2), F: (u) => (u <= 0.5 ? (2 * u ** 3) / 3 : u - 0.5 + (2 / 3) * (1 - u) ** 3) },
  sinehalf: { f: (u) => (1 - Math.cos(Math.PI * u)) / 2, F: (u) => u / 2 - Math.sin(Math.PI * u) / (2 * Math.PI) },
  sine: { f: (u) => u - Math.sin(2 * Math.PI * u) / (2 * Math.PI), F: (u) => (u * u) / 2 + (Math.cos(2 * Math.PI * u) - 1) / (4 * Math.PI * Math.PI) },
};
export const transitionShape = (kind) => SHAPES[kind] || { f: (u) => u, F: (u) => (u * u) / 2 };
// 8-point Gauss–Legendre nodes and weights on [−1, 1]
const GX = [-0.9602898564975363, -0.7966664774136267, -0.5255324099163290, -0.1834346424956498, 0.1834346424956498, 0.5255324099163290, 0.7966664774136267, 0.9602898564975363];
const GW = [0.1012285362903763, 0.2223810344533745, 0.3137066458778873, 0.3626837833783620, 0.3626837833783620, 0.3137066458778873, 0.2223810344533745, 0.1012285362903763];
function gauss(f, a, b, panels = 8) {
  let s = 0;
  const h = (b - a) / panels;
  for (let p = 0; p < panels; p++) { const m = a + h * (p + 0.5); for (let k = 0; k < 8; k++) s += GW[k] * f(m + (h / 2) * GX[k]); }
  return (s * h) / 2;
}
/** The cubic parabola's length along the curve from x = 0 to x (y' = x² / 2RLs). */
const cubicArc = (x, R, Ls) => gauss((v) => Math.hypot(1, (v * v) / (2 * R * Ls)), 0, x, 4);
/** The true length of a transition of kind with parameter Ls (the cubic's is longer than its Ls; the rest are Ls). */
export function transitionLength(kind, R, Ls) { return kind === 'cubic' && R > 0 && Ls > 0 ? cubicArc(Ls, R, Ls) : Ls; }
/** The cubic parabola's Ls (length along the tangent) whose curve is `len` long. */
export function cubicParamFor(R, len) {
  let L = len;
  for (let i = 0; i < 30; i++) { const d = cubicArc(L, R, L) - len; if (Math.abs(d) < 1e-12 * Math.max(1, len)) break; L -= d / Math.hypot(1, L / (2 * R)); }
  return L;
}
/** A transition of `kind` from zero curvature: at distance l along it (its true length), the point (x along the starting tangent,
 *  y toward the turn) and the turn so far th. Clothoid: the exact series; cubic: on y = x³ / 6RLs; the rest by integration. */
export function transitionAt(kind, l, R, Ls) {
  if (kind === 'cubic') {
    // the x whose arc length is l (Newton on s(x) − l, ds/dx = √(1 + y'²))
    let x = l;
    for (let i = 0; i < 30; i++) { const d = cubicArc(x, R, Ls) - l; if (Math.abs(d) < 1e-13 * Math.max(1, l)) break; x -= d / Math.hypot(1, (x * x) / (2 * R * Ls)); }
    return { x, y: (x ** 3) / (6 * R * Ls), th: Math.atan((x * x) / (2 * R * Ls)) };
  }
  if (!SHAPES[kind]) return clothoid(l, R, Ls);
  const F = SHAPES[kind].F, th = (s) => (Ls * F(Math.min(1, Math.max(0, s / Ls)))) / R;
  if (!(l > 0)) return { x: 0, y: 0, th: 0 };
  const n = Math.max(4, Math.ceil(16 * (l / Ls)));
  return { x: gauss((s) => Math.cos(th(s)), 0, l, n), y: gauss((s) => Math.sin(th(s)), 0, l, n), th: th(l) };
}
const finPos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);

export function buildAlignment({ pis, start = 0 }) {
  const errors = [], elements = [];
  const P = (pis || []).filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  // drop repeated PIs
  const Q = P.filter((p, i) => i === 0 || Math.hypot(p.x - P[i - 1].x, p.y - P[i - 1].y) > 1e-9);
  if (Q.length < 2) return new Alignment([], start, [t('al.err.two')]);
  const n = Q.length;
  // curve at each interior PI
  const curves = new Array(n).fill(null);
  // 0.11 SU.1944: a PI may carry `lsc`, the length of a spiral joining its curve to the NEXT PI's curve (compound or reverse); that pair
  // is one block (compoundBlock) and the spiral takes the place of the tangent between them, so the first curve has no spiral out
  // and the second none in.
  const compNext = new Array(n).fill(false);
  for (let i = 1; i < n - 2; i++) compNext[i] = finPos(Q[i].lsc) > 0 && Number(Q[i].r) > 0 && Number(Q[i + 1].r) > 0;
  for (let i = 1; i < n - 1; i++) {
    const r = Number(Q[i].r) || 0;
    const a1 = Math.atan2(Q[i].y - Q[i - 1].y, Q[i].x - Q[i - 1].x), a2 = Math.atan2(Q[i + 1].y - Q[i].y, Q[i + 1].x - Q[i].x);
    const d = normAng(a2 - a1);
    if (r <= 0 || Math.abs(d) < 1e-9) { curves[i] = { r: 0, d, T: 0, T1: 0, T2: 0, a1, a2 }; continue; }
    if (Math.abs(Math.abs(d) - Math.PI) < 1e-6) { errors.push(t('al.err.back', { pi: i + 1 })); curves[i] = { r: 0, d, T: 0, T1: 0, T2: 0, a1, a2 }; continue; }
    const ls1 = compNext[i - 1] ? 0 : finPos(Q[i].ls1) || finPos(Q[i].ls), ls2 = compNext[i] ? 0 : finPos(Q[i].ls2) || finPos(Q[i].ls);
    if (!ls1 && !ls2) { const T = r * Math.tan(Math.abs(d) / 2); curves[i] = { r, d, T, T1: T, T2: T, a1, a2, ls1: 0, ls2: 0 }; continue; }
    // 0.7 D7.35: spirals. The circle's centre sits (r + p) from each tangent, on the inside; the spiral's end is k along the tangent from the foot.
    const tr = trOf(Q[i].tr), S1 = spiralConstants(r, ls1, tr), S2 = spiralConstants(r, ls2, tr);   // tr: 0.7.1 71.26
    if (S1.th + S2.th > Math.abs(d) + 1e-12) { errors.push(t('al.err.spiral', { pi: i + 1, ls: +(ls1 + ls2).toFixed(2) })); curves[i] = { r: 0, d, T: 0, T1: 0, T2: 0, a1, a2 }; continue; }
    const sg = d > 0 ? 1 : -1, u1 = { x: Math.cos(a1), y: Math.sin(a1) }, u2 = { x: Math.cos(a2), y: Math.sin(a2) };
    const n1 = { x: -sg * u1.y, y: sg * u1.x }, n2 = { x: -sg * u2.y, y: sg * u2.x };
    const det = n1.x * n2.y - n1.y * n2.x, b1 = r + S1.p, b2 = r + S2.p;
    const cx = (b1 * n2.y - n1.y * b2) / det, cy = (n1.x * b2 - b1 * n2.x) / det;   // the centre, relative to the PI
    const T1 = S1.k - (u1.x * cx + u1.y * cy), T2 = u2.x * cx + u2.y * cy + S2.k;
    curves[i] = { r, d, T: Math.max(T1, T2), T1, T2, a1, a2, ls1, ls2, S1, S2, cx, cy, tr };
  }
  // tangents must fit
  for (let i = 0; i < n - 1; i++) {
    const L = Math.hypot(Q[i + 1].x - Q[i].x, Q[i + 1].y - Q[i].y);
    const need = (curves[i]?.T2 || 0) + (curves[i + 1]?.T1 || 0);
    if (compNext[i]) { if (!(curves[i]?.r > 0 && curves[i + 1]?.r > 0)) errors.push(t('al.err.comp.pair', { a: i + 1, b: i + 2 })); continue; }   // the spiral takes the tangent's place
    if (need > L + 1e-9) errors.push(t('al.err.overlap', { a: i + 1, b: i + 2, need: need.toFixed(2), dist: L.toFixed(2) }));
  }
  if (errors.length) return new Alignment([], start, errors, Q);

  let sta = start, cur = { x: Q[0].x, y: Q[0].y };
  const records = [];
  let afterComp = false;
  for (let i = 1; i < n; i++) {
    const c = i < n - 1 ? curves[i] : null;
    const dir = Math.atan2(Q[i].y - Q[i - 1].y, Q[i].x - Q[i - 1].x);
    const ux = Math.cos(dir), uy = Math.sin(dir);
    const T = c?.T1 || 0;
    const end = { x: Q[i].x - ux * T, y: Q[i].y - uy * T };   // PC / TS (or the PI / last point)
    if (afterComp && (end.x - cur.x) * ux + (end.y - cur.y) * uy < -1e-6) { errors.push(t('al.err.comp.fit', { a: i, b: i + 1 })); break; }   // the compound run ended past the next curve's start
    afterComp = false;
    const len = Math.hypot(end.x - cur.x, end.y - cur.y);
    if (len > 1e-9) { elements.push({ type: 'line', p0: cur, p1: end, dir, sta, len }); sta += len; }
    if (compNext[i]) {   // 0.11 SU.1944: this curve, the spiral between, and the next curve, as one block
      const k = compoundBlock({ start: end, a1: dir, c1: c, c2: curves[i + 1], Q1: Q[i], Q2: Q[i + 1], Q3: Q[i + 2], lsc: finPos(Q[i].lsc), tr: trOf(Q[i].tr), tr2: trOf(Q[i + 1].tr), sta, i });
      if (k.error) { errors.push(k.error); break; }
      elements.push(...k.elements); records.push(...k.records); sta = k.sta; cur = k.end; i++; afterComp = true;
      continue;
    }
    if (c && c.r > 0 && !(c.ls1 || c.ls2)) {
      const ccw = c.d > 0, r = c.r, delta = Math.abs(c.d);
      const nx = ccw ? -uy : uy, ny = ccw ? ux : -ux;   // toward the centre
      const ctr = { x: end.x + nx * r, y: end.y + ny * r };
      const dir2 = c.a2, pt = { x: Q[i].x + Math.cos(dir2) * T, y: Q[i].y + Math.sin(dir2) * T };
      const a0 = Math.atan2(end.y - ctr.y, end.x - ctr.x);
      const L = r * delta;
      elements.push({
        type: 'arc', p0: end, p1: pt, c: ctr, r, ccw, delta, a0, sta, len: L, pi: { x: Q[i].x, y: Q[i].y }, piIndex: i,
        T, E: r * (1 / Math.cos(delta / 2) - 1), M: r * (1 - Math.cos(delta / 2)), chord: 2 * r * Math.sin(delta / 2), dirIn: dir, dirOut: dir2,
      });
      records.push({ piIndex: i, r, ccw, d: c.d, ls1: 0, ls2: 0, theta1: 0, theta2: 0, Lc: L, T1: T, T2: T, Es: r * (1 / Math.cos(delta / 2) - 1), ts: sta, sc: sta, cs: sta + L, st: sta + L });
      sta += L;
      cur = pt;
    } else if (c && c.r > 0) {
      // 0.7 D7.35: tangent - spiral - curve - spiral - tangent
      const ccw = c.d > 0, sg = ccw ? 1 : -1, r = c.r, ts = sta;
      const st = { x: Q[i].x + Math.cos(c.a2) * c.T2, y: Q[i].y + Math.sin(c.a2) * c.T2 };
      const rec = { piIndex: i, r, ccw, d: c.d, ls1: c.S1.len, ls2: c.S2.len, lp1: c.ls1, lp2: c.ls2, tr: c.tr, theta1: c.S1.th, theta2: c.S2.th, T1: c.T1, T2: c.T2, Es: Math.hypot(c.cx, c.cy) - r, ts };
      let p = end, dirNow = dir;
      if (c.ls1 > 0) {
        const sp = spiralElement('in', { p0: end, dir0: dir, r, Ls: c.ls1, ccw, sta, piIndex: i, tr: c.tr });
        elements.push(sp); sta += sp.len; p = sp.p1; dirNow = sp.dir1;
      }
      const delta = Math.abs(c.d) - c.S1.th - c.S2.th, sc = { sta, x: p.x, y: p.y };
      rec.sc = sta;
      let outStart = p;
      if (delta > 1e-12) {
        const nx = ccw ? -Math.sin(dirNow) : Math.sin(dirNow), ny = ccw ? Math.cos(dirNow) : -Math.cos(dirNow);
        const ctr = { x: p.x + nx * r, y: p.y + ny * r }, a0 = Math.atan2(p.y - ctr.y, p.x - ctr.x), L = r * delta;
        const a1 = a0 + sg * delta, pe = { x: ctr.x + Math.cos(a1) * r, y: ctr.y + Math.sin(a1) * r };
        const dirOut = dirNow + sg * delta, Tc = r * Math.tan(delta / 2);
        elements.push({
          type: 'arc', p0: p, p1: pe, c: ctr, r, ccw, delta, a0, sta, len: L, pi: { x: p.x + Math.cos(dirNow) * Tc, y: p.y + Math.sin(dirNow) * Tc }, piIndex: i,
          T: Tc, E: r * (1 / Math.cos(delta / 2) - 1), M: r * (1 - Math.cos(delta / 2)), chord: 2 * r * Math.sin(delta / 2), dirIn: dirNow, dirOut, spIn: c.ls1, spOut: c.ls2,
        });
        sta += L; outStart = pe;
      }
      rec.Lc = Math.max(0, delta) * r; rec.cs = sta;
      if (c.ls2 > 0) {
        const so = spiralElement('out', { p1: st, dir1: c.a2, r, Ls: c.ls2, ccw, sta, piIndex: i, tr: c.tr });
        elements.push(so); sta += so.len;
      }
      rec.st = sta;
      records.push(rec);
      cur = st;
      void outStart; void sc;
    } else cur = { x: Q[i].x, y: Q[i].y };
  }
  if (errors.length) return new Alignment([], start, errors, Q);
  const al = new Alignment(elements, start, [], Q);
  al.curves = records;
  return al;
}

// ---- 0.11 SU.1944: a spiral between two curves of different radii (compound: same way, reverse: the other way)
const GP = (n) => Math.max(8, Math.ceil(n));
/** A spiral whose curvature runs LINEARLY from k1 to k2 (signed, 1 / length, + = left) over length L, starting at p with heading h:
 *  the point and heading at distance s. θ(s) = h + k1·s + (k2 − k1)·s² / 2L; x, y by Gauss–Legendre on cos θ, sin θ (exact to ~1e-12).
 *  With k1 = 0 this is the usual clothoid (alignment spirals); with k1 and k2 both set it is a piece of the same Euler spiral
 *  (rate c = (k2 − k1) / L), from the point where its curvature is k1: the Fresnel integrals' own segment (Abramowitz & Stegun 7.3). */
export function linearCurvatureAt(p, h, k1, k2, L, s) {
  const th = (u) => h + k1 * u + ((k2 - k1) * u * u) / (2 * L);
  const panels = GP((Math.abs(th(s) - h) * 8) + 1);
  return { x: p.x + gauss((u) => Math.cos(th(u)), 0, s, panels), y: p.y + gauss((u) => Math.sin(th(u)), 0, s, panels), dir: th(s) };
}
/** The spiral-out of a curve forward from its start (curvature sg/r at heading h, to 0 over Ls of kind tr): point and heading at its end. */
function outEnd(p, h, r, Ls, sg, tr) {
  const K = spiralConstants(r, Ls, tr), th = (s) => h + sg * (K.th - transitionAt(tr, Math.max(0, K.len - s), r, Ls).th);
  const panels = GP(K.th * 8 + 1);
  return { x: p.x + gauss((u) => Math.cos(th(u)), 0, K.len, panels), y: p.y + gauss((u) => Math.sin(th(u)), 0, K.len, panels), dir: h + sg * K.th, len: K.len, th: K.th };
}
function arcEl(p, h, r, sg, m, sta, piIndex) {
  const ccw = sg > 0, nx = ccw ? -Math.sin(h) : Math.sin(h), ny = ccw ? Math.cos(h) : -Math.cos(h);
  const ctr = { x: p.x + nx * r, y: p.y + ny * r }, a0 = Math.atan2(p.y - ctr.y, p.x - ctr.x), a1 = a0 + sg * m;
  const p1 = { x: ctr.x + Math.cos(a1) * r, y: ctr.y + Math.sin(a1) * r }, dirOut = h + sg * m, Tc = r * Math.tan(m / 2);
  return { type: 'arc', p0: p, p1, c: ctr, r, ccw, delta: m, a0, sta, len: r * m, pi: { x: p.x + Math.cos(h) * Tc, y: p.y + Math.sin(h) * Tc }, piIndex, T: Tc, E: r * (1 / Math.cos(m / 2) - 1), M: r * (1 - Math.cos(m / 2)), chord: 2 * r * Math.sin(m / 2), dirIn: h, dirOut };
}
/**
 * Curve 1 (PI i), the spiral of length lsc, curve 2 (PI i+1) as one run between the tangent lines before PI i and after PI i+1.
 * It starts where curve 1 would (the TS of its own spiral-in, or its PC), keeps both radii, and turns curve 1 by the one angle at
 * which the run ends ON the last tangent line; the turn of curve 2 is what is left of the total deflection. (The middle line, PI i to
 * PI i+1, only fixes the two deflections: nothing of the alignment lies on it.) A bisection on that angle, scanned for its roots first.
 */
function compoundBlock({ start, a1, c1, c2, Q1, Q2, Q3, lsc, tr, tr2, sta, i }) {
  const sg1 = c1.d > 0 ? 1 : -1, sg2 = c2.d > 0 ? 1 : -1, r1 = c1.r, r2 = c2.r, k1 = sg1 / r1, k2 = sg2 / r2;
  const D = c1.d + c2.d, a3 = a1 + D, thC = ((k1 + k2) / 2) * lsc;   // total turn; the spiral's own (signed)
  const S1 = c1.ls1 > 0 ? spiralConstants(r1, c1.ls1, tr) : { th: 0 }, S2 = c2.ls2 > 0 ? spiralConstants(r2, c2.ls2, tr2) : { th: 0 };
  const u3 = { x: Math.cos(a3), y: Math.sin(a3) };
  // pieces for an arc-1 turn m1
  const run = (m1, build) => {
    const els = []; let p = start, h = a1, s = sta;
    const push = (e, len, p1, h1) => { if (build) els.push(e); p = p1; h = h1; s += len; };
    if (c1.ls1 > 0) { const sp = spiralElement('in', { p0: p, dir0: h, r: r1, Ls: c1.ls1, ccw: sg1 > 0, sta: s, piIndex: i, tr }); push(sp, sp.len, sp.p1, sp.dir1); }
    const m2 = sg2 * (D - sg1 * (S1.th + m1) - thC - sg2 * S2.th);
    if (!(m1 >= -1e-12) || !(m2 >= -1e-12)) return null;
    const A = arcEl(p, h, r1, sg1, Math.max(0, m1), s, i); push(A, A.len, A.p1, A.dirOut); const arc1 = A;
    const cs = { type: 'spiral', io: 'cs', ccw: sg1 > 0, r: r1, r1, r2, k1, k2, Ls: lsc, Lp: lsc, tr: 'clothoid', len: lsc, sta: s, piIndex: i, p0: p, dir0: h, dirIn: h, delta: Math.abs(thC), theta: Math.abs(thC) };
    const e1 = linearCurvatureAt(p, h, k1, k2, lsc, lsc); cs.p1 = { x: e1.x, y: e1.y }; cs.dir1 = e1.dir;
    push(cs, lsc, cs.p1, cs.dir1);
    const B = arcEl(p, h, r2, sg2, Math.max(0, m2), s, i + 1); push(B, B.len, B.p1, B.dirOut);
    let out = null;
    if (c2.ls2 > 0) { const q = outEnd(p, h, r2, c2.ls2, sg2, tr2); out = { start: p, h, len: q.len }; p = { x: q.x, y: q.y }; h = q.dir; s += q.len; }
    return { els, end: p, h, s, arc1, cs, arc2: B, out, m1, m2 };
  };
  const f = (m1) => { const q = run(m1, false); return q ? (q.end.x - Q2.x) * u3.y - (q.end.y - Q2.y) * u3.x : NaN; };
  // m2 = sg2·(D − sg1·(θs1 + m1) − θc − sg2·θs2) ≥ 0 bounds the turn m1 of curve 1: above by the total (compound), below by the rest (reverse)
  const same = sg1 === sg2, lo = same ? 0 : Math.max(0, S2.th - S1.th - sg2 * (D - thC)), hi = same ? sg1 * (D - thC) - S1.th - S2.th : lo + Math.PI;
  const guess = Math.max(0, Math.abs(c1.d) - S1.th);
  const N = 2000; let best = null, prev = null;
  for (let k = 0; k <= N; k++) {
    const m = lo + ((hi - lo) * k) / N, v = f(m);
    if (Number.isFinite(v)) { if (prev && Math.sign(prev.v) !== Math.sign(v)) { const root = { a: prev.m, b: m, va: prev.v }; if (!best || Math.abs((root.a + root.b) / 2 - guess) < Math.abs((best.a + best.b) / 2 - guess)) best = root; } prev = { m, v }; } else prev = null;
  }
  if (!best) return { error: t('al.err.comp.none', { a: i + 1, b: i + 2 }) };
  let { a, b, va } = best;
  for (let k = 0; k < 80; k++) { const m = (a + b) / 2, v = f(m); if (Math.sign(v) === Math.sign(va)) { a = m; va = v; } else b = m; }
  const q = run((a + b) / 2, true);
  const els = q.els, recs = [];
  const th1 = c1.ls1 > 0 ? S1.th : 0;
  recs.push({ piIndex: i, r: r1, ccw: sg1 > 0, d: c1.d, ls1: c1.ls1 || 0, ls2: 0, lp1: c1.ls1 || 0, lp2: 0, theta1: th1, theta2: 0, tr, T1: c1.T1, T2: c1.T2, Es: c1.Es ?? 0, Lc: q.arc1.len, ts: sta, sc: q.arc1.sta, cs: q.arc1.sta + q.arc1.len, st: q.arc1.sta + q.arc1.len, lsc });
  recs.push({ piIndex: i + 1, r: r2, ccw: sg2 > 0, d: c2.d, ls1: 0, ls2: c2.ls2 || 0, lp1: 0, lp2: c2.ls2 || 0, theta1: 0, theta2: c2.ls2 > 0 ? S2.th : 0, tr: tr2, T1: c2.T1, T2: c2.T2, Es: c2.Es ?? 0, Lc: q.arc2.len, ts: q.arc2.sta, sc: q.arc2.sta, cs: q.arc2.sta + q.arc2.len, st: q.s, lsc, compoundWith: i });
  if (q.out) {
    const so = spiralElement('out', { p1: q.end, dir1: a3, r: r2, Ls: c2.ls2, ccw: sg2 > 0, sta: q.arc2.sta + q.arc2.len, piIndex: i + 1, tr: tr2 });
    els.push(so);
  }
  return { elements: els, records: recs, end: q.end, sta: q.s, error: null };
}

/** A spiral element. 'in': from p0 (tangent dir0) curvature 0 → 1/r; 'out': ends at p1 (tangent dir1), curvature 1/r → 0. */
function spiralElement(io, { p0, dir0, p1, dir1, r, Ls, ccw, sta, piIndex, tr = 'clothoid' }) {
  const sg = ccw ? 1 : -1, K = spiralConstants(r, Ls, tr), e = { type: 'spiral', io, ccw, r, Ls, Lp: Ls, tr, len: K.len, sta, piIndex, theta: K.th, delta: K.th, Xc: K.Xc, Yc: K.Yc, p: K.p, k: K.k };
  if (io === 'in') { e.p0 = p0; e.dir0 = dir0; e.dirIn = dir0; e.dir1 = dir0 + sg * K.th; }
  else { e.p1 = p1; e.dir1 = dir1; e.dir0 = dir1 - sg * K.th; e.dirIn = e.dir0; }
  const at = (s) => spiralAt(e, s);
  if (io === 'in') e.p1 = at(e.len); else e.p0 = at(0);
  // the spiral's own PI: where its two end tangents meet (tanLong from the tangent point, tanShort to the curve end)
  const tl = K.Xc - K.Yc / Math.tan(K.th), ts = K.Yc / Math.sin(K.th);
  e.tanLong = tl; e.tanShort = ts;
  e.pi = io === 'in' ? { x: e.p0.x + Math.cos(e.dir0) * tl, y: e.p0.y + Math.sin(e.dir0) * tl } : { x: e.p1.x - Math.cos(e.dir1) * tl, y: e.p1.y - Math.sin(e.dir1) * tl };
  return e;
}
/** The point and forward direction on a spiral element at distance s from its start. */
export function spiralAt(e, s) {
  const sg = e.ccw ? 1 : -1;
  if (e.io === 'cs') return linearCurvatureAt(e.p0, e.dir0, e.k1, e.k2, e.len, s);   // 0.11 SU.1944: between two curves
  if (e.io === 'in') {
    const c = transitionAt(e.tr, s, e.r, e.Lp ?? e.Ls), co = Math.cos(e.dir0), si = Math.sin(e.dir0);
    return { x: e.p0.x + c.x * co - sg * c.y * si, y: e.p0.y + c.x * si + sg * c.y * co, dir: e.dir0 + sg * c.th };
  }
  // 'out': walked backwards from its end it is an 'in' spiral turning the other way
  const l = Math.max(0, e.len - s), c = transitionAt(e.tr, l, e.r, e.Lp ?? e.Ls), db = e.dir1 + Math.PI, co = Math.cos(db), si = Math.sin(db);
  return { x: e.p1.x + c.x * co + sg * c.y * si, y: e.p1.y + c.x * si - sg * c.y * co, dir: e.dir1 - sg * c.th };
}
/** Nearest point on a spiral element to (x, y): { s, x, y, dir }. */
function spiralNearest(e, x, y) {
  const N = 32, P = [];
  let k = 0, best = Infinity;
  for (let i = 0; i <= N; i++) { const q = spiralAt(e, (e.len * i) / N), d = (q.x - x) ** 2 + (q.y - y) ** 2; P.push(q); if (d < best) { best = d; k = i; } }
  const g = (s) => { const q = spiralAt(e, s); return (q.x - x) * Math.cos(q.dir) + (q.y - y) * Math.sin(q.dir); };   // d(distance²)/2ds
  let lo = (e.len * Math.max(0, k - 1)) / N, hi = (e.len * Math.min(N, k + 1)) / N;
  const glo = g(lo), ghi = g(hi);
  let s;
  if (glo >= 0) s = lo; else if (ghi <= 0) s = hi;
  else { for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if (g(m) < 0) lo = m; else hi = m; } s = (lo + hi) / 2; }
  return { s, ...spiralAt(e, s) };
}

export class Alignment {
  constructor(elements, start, errors, pis = []) {
    this.elements = elements; this.start = start; this.errors = errors; this.pis = pis; this.curves = [];
    this.length = elements.reduce((s, e) => s + e.len, 0);
    this.end = start + this.length;
  }
  get ok() { return this.elements.length > 0 && !this.errors.length; }

  elementAt(sta) {
    const els = this.elements;
    if (!els.length) return null;
    for (const e of els) if (sta <= e.sta + e.len + 1e-9) return e;
    return els[els.length - 1];
  }

  pointAt(sta) {
    const e = this.elementAt(sta);
    if (!e) return null;
    const s = sta - e.sta;
    if (e.type === 'line') return { x: e.p0.x + Math.cos(e.dir) * s, y: e.p0.y + Math.sin(e.dir) * s, dir: e.dir };
    if (e.type === 'spiral') return spiralAt(e, Math.min(e.len, Math.max(0, s)));   // 0.7 D7.35
    const sw = (e.ccw ? 1 : -1) * s / e.r, a = e.a0 + sw;
    return { x: e.c.x + Math.cos(a) * e.r, y: e.c.y + Math.sin(a) * e.r, dir: a + (e.ccw ? Math.PI / 2 : -Math.PI / 2) };
  }

  /** Nearest station and offset (right = +). `outside` is true when the point is beyond either end. */
  stationOffset(x, y) {
    let best = null;
    for (const e of this.elements) {
      let s, px, py, dir;
      if (e.type === 'line') {
        const ux = Math.cos(e.dir), uy = Math.sin(e.dir);
        s = Math.max(0, Math.min(e.len, (x - e.p0.x) * ux + (y - e.p0.y) * uy));
        px = e.p0.x + ux * s; py = e.p0.y + uy * s; dir = e.dir;
      } else if (e.type === 'spiral') {
        const q = spiralNearest(e, x, y);   // 0.7 D7.35
        s = q.s; px = q.x; py = q.y; dir = q.dir;
      } else {
        const a = Math.atan2(y - e.c.y, x - e.c.x);
        let sw = ((a - e.a0) * (e.ccw ? 1 : -1)) % TAU;
        if (sw < 0) sw += TAU;
        if (sw > e.delta) sw = sw - e.delta < TAU - sw ? e.delta : 0;   // off the arc: its nearer end
        s = sw * e.r;
        const aa = e.a0 + (e.ccw ? sw : -sw);
        px = e.c.x + Math.cos(aa) * e.r; py = e.c.y + Math.sin(aa) * e.r; dir = aa + (e.ccw ? Math.PI / 2 : -Math.PI / 2);
      }
      const d = Math.hypot(x - px, y - py);
      if (!best || d < best.d - 1e-12) {
        const off = (x - px) * Math.sin(dir) - (y - py) * Math.cos(dir);   // + to the right
        best = { d, sta: e.sta + s, off, x: px, y: py, dir };
      }
    }
    if (!best) return null;
    // beyond the ends: the projection is not perpendicular
    const along = (p, dir) => (x - p.x) * Math.cos(dir) + (y - p.y) * Math.sin(dir);
    const p0 = this.pointAt(this.start), p1 = this.pointAt(this.end);
    best.outside = (best.sta <= this.start + 1e-9 && along(p0, p0.dir) < -1e-9) || (best.sta >= this.end - 1e-9 && along(p1, p1.dir) > 1e-9);
    return { sta: best.sta, off: best.off, x: best.x, y: best.y, outside: best.outside, dist: best.d };
  }

  polyline(maxSeg = Infinity, maxTurn = Math.PI / 360) {
    const out = [];
    for (const e of this.elements) {
      if (!out.length) out.push({ x: e.p0.x, y: e.p0.y, sta: e.sta });
      if (e.type === 'line') { out.push({ x: e.p1.x, y: e.p1.y, sta: e.sta + e.len }); continue; }
      const n = Math.max(1, Math.ceil(e.delta / maxTurn), e.type === 'spiral' ? 4 : 1, Number.isFinite(maxSeg) ? Math.ceil(e.len / maxSeg) : 1);
      for (let k = 1; k <= n; k++) { const s = e.sta + (e.len * k) / n; const p = this.pointAt(s); out.push({ x: p.x, y: p.y, sta: s }); }
    }
    return out;
  }

  ticks(step) {
    if (!(step > 0) || !this.elements.length) return [];
    const out = [];
    const k0 = Math.ceil(this.start / step - 1e-9), k1 = Math.floor(this.end / step + 1e-9);
    if (k1 - k0 > 20000) return [];
    for (let k = k0; k <= k1; k++) { const sta = k * step; const p = this.pointAt(sta); out.push({ sta, ...p }); }
    return out;
  }

  /** Key stations: start, TS / SC / CS / ST of a curve with spirals, PC / PT of a plain one, end (for labels and tables). */
  keyStations() {
    const out = [{ sta: this.start, kind: 'Start' }];
    for (const c of this.curves || []) {
      if (c.ls1 || c.ls2) out.push({ sta: c.ts, kind: c.ls1 ? 'TS' : 'PC' }, ...(c.ls1 ? [{ sta: c.sc, kind: 'SC' }] : []), ...(c.ls2 ? [{ sta: c.cs, kind: 'CS' }] : []), { sta: c.st, kind: c.ls2 ? 'ST' : 'PT' });
      else out.push({ sta: c.ts, kind: 'PC' }, { sta: c.st, kind: 'PT' });
    }
    out.push({ sta: this.end, kind: 'End' });
    return out;
  }

  /** The elements with each spiral cut into straight pieces no more than `maxTurn` of turn apiece (lines and arcs as they are). */
  pieces(maxTurn = Math.PI / 720) {
    if (this._pieces && this._pieces.maxTurn === maxTurn) return this._pieces.list;
    const list = [];
    for (const e of this.elements) {
      if (e.type !== 'spiral') { list.push(e); continue; }
      const n = Math.max(4, Math.ceil(e.delta / maxTurn));
      let q = this.pointAt(e.sta);
      for (let k = 1; k <= n; k++) {
        const sta = e.sta + (e.len * k) / n, p = this.pointAt(sta), len = Math.hypot(p.x - q.x, p.y - q.y);
        list.push({ type: 'line', p0: { x: q.x, y: q.y }, p1: { x: p.x, y: p.y }, dir: Math.atan2(p.y - q.y, p.x - q.x), sta: sta - e.len / n, len: e.len / n, chordLen: len });
        q = p;
      }
    }
    this._pieces = { maxTurn, list };
    return list;
  }
}
