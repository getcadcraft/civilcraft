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
/** The spiral's constants for radius R and length Ls: θs, Xc, Yc (the end's offsets), the shift p and the offset k. */
export function spiralConstants(R, Ls) {
  if (!(Ls > 0) || !(R > 0)) return { th: 0, Xc: 0, Yc: 0, p: 0, k: 0 };
  const c = clothoid(Ls, R, Ls);
  return { th: c.th, Xc: c.x, Yc: c.y, p: c.y - R * (1 - Math.cos(c.th)), k: c.x - R * Math.sin(c.th) };
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
  for (let i = 1; i < n - 1; i++) {
    const r = Number(Q[i].r) || 0;
    const a1 = Math.atan2(Q[i].y - Q[i - 1].y, Q[i].x - Q[i - 1].x), a2 = Math.atan2(Q[i + 1].y - Q[i].y, Q[i + 1].x - Q[i].x);
    const d = normAng(a2 - a1);
    if (r <= 0 || Math.abs(d) < 1e-9) { curves[i] = { r: 0, d, T: 0, T1: 0, T2: 0, a1, a2 }; continue; }
    if (Math.abs(Math.abs(d) - Math.PI) < 1e-6) { errors.push(t('al.err.back', { pi: i + 1 })); curves[i] = { r: 0, d, T: 0, T1: 0, T2: 0, a1, a2 }; continue; }
    const ls1 = finPos(Q[i].ls1) || finPos(Q[i].ls), ls2 = finPos(Q[i].ls2) || finPos(Q[i].ls);
    if (!ls1 && !ls2) { const T = r * Math.tan(Math.abs(d) / 2); curves[i] = { r, d, T, T1: T, T2: T, a1, a2, ls1: 0, ls2: 0 }; continue; }
    // 0.7 D7.35: spirals. The circle's centre sits (r + p) from each tangent, on the inside; the spiral's end is k along the tangent from the foot.
    const S1 = spiralConstants(r, ls1), S2 = spiralConstants(r, ls2);
    if (S1.th + S2.th > Math.abs(d) + 1e-12) { errors.push(t('al.err.spiral', { pi: i + 1, ls: +(ls1 + ls2).toFixed(2) })); curves[i] = { r: 0, d, T: 0, T1: 0, T2: 0, a1, a2 }; continue; }
    const sg = d > 0 ? 1 : -1, u1 = { x: Math.cos(a1), y: Math.sin(a1) }, u2 = { x: Math.cos(a2), y: Math.sin(a2) };
    const n1 = { x: -sg * u1.y, y: sg * u1.x }, n2 = { x: -sg * u2.y, y: sg * u2.x };
    const det = n1.x * n2.y - n1.y * n2.x, b1 = r + S1.p, b2 = r + S2.p;
    const cx = (b1 * n2.y - n1.y * b2) / det, cy = (n1.x * b2 - b1 * n2.x) / det;   // the centre, relative to the PI
    const T1 = S1.k - (u1.x * cx + u1.y * cy), T2 = u2.x * cx + u2.y * cy + S2.k;
    curves[i] = { r, d, T: Math.max(T1, T2), T1, T2, a1, a2, ls1, ls2, S1, S2, cx, cy };
  }
  // tangents must fit
  for (let i = 0; i < n - 1; i++) {
    const L = Math.hypot(Q[i + 1].x - Q[i].x, Q[i + 1].y - Q[i].y);
    const need = (curves[i]?.T2 || 0) + (curves[i + 1]?.T1 || 0);
    if (need > L + 1e-9) errors.push(t('al.err.overlap', { a: i + 1, b: i + 2, need: need.toFixed(2), dist: L.toFixed(2) }));
  }
  if (errors.length) return new Alignment([], start, errors, Q);

  let sta = start, cur = { x: Q[0].x, y: Q[0].y };
  const records = [];
  for (let i = 1; i < n; i++) {
    const c = i < n - 1 ? curves[i] : null;
    const dir = Math.atan2(Q[i].y - Q[i - 1].y, Q[i].x - Q[i - 1].x);
    const ux = Math.cos(dir), uy = Math.sin(dir);
    const T = c?.T1 || 0;
    const end = { x: Q[i].x - ux * T, y: Q[i].y - uy * T };   // PC / TS (or the PI / last point)
    const len = Math.hypot(end.x - cur.x, end.y - cur.y);
    if (len > 1e-9) { elements.push({ type: 'line', p0: cur, p1: end, dir, sta, len }); sta += len; }
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
      const rec = { piIndex: i, r, ccw, d: c.d, ls1: c.ls1, ls2: c.ls2, theta1: c.S1.th, theta2: c.S2.th, T1: c.T1, T2: c.T2, Es: Math.hypot(c.cx, c.cy) - r, ts };
      let p = end, dirNow = dir;
      if (c.ls1 > 0) {
        const sp = spiralElement('in', { p0: end, dir0: dir, r, Ls: c.ls1, ccw, sta, piIndex: i });
        elements.push(sp); sta += c.ls1; p = sp.p1; dirNow = sp.dir1;
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
        elements.push(spiralElement('out', { p1: st, dir1: c.a2, r, Ls: c.ls2, ccw, sta, piIndex: i }));
        sta += c.ls2;
      }
      rec.st = sta;
      records.push(rec);
      cur = st;
      void outStart; void sc;
    } else cur = { x: Q[i].x, y: Q[i].y };
  }
  const al = new Alignment(elements, start, [], Q);
  al.curves = records;
  return al;
}

/** A spiral element. 'in': from p0 (tangent dir0) curvature 0 → 1/r; 'out': ends at p1 (tangent dir1), curvature 1/r → 0. */
function spiralElement(io, { p0, dir0, p1, dir1, r, Ls, ccw, sta, piIndex }) {
  const sg = ccw ? 1 : -1, K = spiralConstants(r, Ls), e = { type: 'spiral', io, ccw, r, Ls, len: Ls, sta, piIndex, theta: K.th, delta: K.th, Xc: K.Xc, Yc: K.Yc, p: K.p, k: K.k };
  if (io === 'in') { e.p0 = p0; e.dir0 = dir0; e.dirIn = dir0; e.dir1 = dir0 + sg * K.th; }
  else { e.p1 = p1; e.dir1 = dir1; e.dir0 = dir1 - sg * K.th; e.dirIn = e.dir0; }
  const at = (s) => spiralAt(e, s);
  if (io === 'in') e.p1 = at(Ls); else e.p0 = at(0);
  // the spiral's own PI: where its two end tangents meet (tanLong from the tangent point, tanShort to the curve end)
  const tl = K.Xc - K.Yc / Math.tan(K.th), ts = K.Yc / Math.sin(K.th);
  e.tanLong = tl; e.tanShort = ts;
  e.pi = io === 'in' ? { x: e.p0.x + Math.cos(e.dir0) * tl, y: e.p0.y + Math.sin(e.dir0) * tl } : { x: e.p1.x - Math.cos(e.dir1) * tl, y: e.p1.y - Math.sin(e.dir1) * tl };
  return e;
}
/** The point and forward direction on a spiral element at distance s from its start. */
export function spiralAt(e, s) {
  const sg = e.ccw ? 1 : -1;
  if (e.io === 'in') {
    const c = clothoid(s, e.r, e.Ls), co = Math.cos(e.dir0), si = Math.sin(e.dir0);
    return { x: e.p0.x + c.x * co - sg * c.y * si, y: e.p0.y + c.x * si + sg * c.y * co, dir: e.dir0 + sg * c.th };
  }
  // 'out': walked backwards from its end it is an 'in' spiral turning the other way
  const l = Math.max(0, e.Ls - s), c = clothoid(l, e.r, e.Ls), db = e.dir1 + Math.PI, co = Math.cos(db), si = Math.sin(db);
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
