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
 * Spirals are not built yet (curves are simple circular arcs between tangents).
 * The curve facts follow the usual arc-definition formulas: T = R·tan(Δ/2), L = R·Δ, E = R(sec(Δ/2) − 1),
 * M = R(1 − cos(Δ/2)), chord = 2R·sin(Δ/2).
 */

import { t } from "./i18n.js";

const TAU = Math.PI * 2;
export const normAng = (a) => { a %= TAU; if (a <= -Math.PI) a += TAU; if (a > Math.PI) a -= TAU; return a; };

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
    if (r <= 0 || Math.abs(d) < 1e-9) { curves[i] = { r: 0, d, T: 0, a1, a2 }; continue; }
    if (Math.abs(Math.abs(d) - Math.PI) < 1e-6) { errors.push(t('al.err.back', { pi: i + 1 })); curves[i] = { r: 0, d, T: 0, a1, a2 }; continue; }
    curves[i] = { r, d, T: r * Math.tan(Math.abs(d) / 2), a1, a2 };
  }
  // tangents must fit
  for (let i = 0; i < n - 1; i++) {
    const L = Math.hypot(Q[i + 1].x - Q[i].x, Q[i + 1].y - Q[i].y);
    const need = (curves[i]?.T || 0) + (curves[i + 1]?.T || 0);
    if (need > L + 1e-9) errors.push(t('al.err.overlap', { a: i + 1, b: i + 2, need: need.toFixed(2), dist: L.toFixed(2) }));
  }
  if (errors.length) return new Alignment([], start, errors, Q);

  let sta = start, cur = { x: Q[0].x, y: Q[0].y };
  for (let i = 1; i < n; i++) {
    const c = i < n - 1 ? curves[i] : null;
    const dir = Math.atan2(Q[i].y - Q[i - 1].y, Q[i].x - Q[i - 1].x);
    const ux = Math.cos(dir), uy = Math.sin(dir);
    const T = c?.T || 0;
    const end = { x: Q[i].x - ux * T, y: Q[i].y - uy * T };   // PC (or the PI / last point)
    const len = Math.hypot(end.x - cur.x, end.y - cur.y);
    if (len > 1e-9) { elements.push({ type: 'line', p0: cur, p1: end, dir, sta, len }); sta += len; }
    if (c && c.r > 0) {
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
      sta += L;
      cur = pt;
    } else cur = { x: Q[i].x, y: Q[i].y };
  }
  return new Alignment(elements, start, [], Q);
}

export class Alignment {
  constructor(elements, start, errors, pis = []) {
    this.elements = elements; this.start = start; this.errors = errors; this.pis = pis;
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
      const n = Math.max(1, Math.ceil(e.delta / maxTurn), Number.isFinite(maxSeg) ? Math.ceil(e.len / maxSeg) : 1);
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

  /** Key stations: start, PCs, PTs, end (for labels and tables). */
  keyStations() {
    const out = [{ sta: this.start, kind: 'Start' }];
    for (const e of this.elements) if (e.type === 'arc') out.push({ sta: e.sta, kind: 'PC' }, { sta: e.sta + e.len, kind: 'PT' });
    out.push({ sta: this.end, kind: 'End' });
    return out;
  }
}
