/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section-view.js — one cross section on a canvas (0.4 V13): offset across (left −, right +), elevation up, the existing
 * ground, the design (graded) surface, cut and fill shaded between them, corridor points (CL, EOP, SH, DL) marked, a grid
 * with offsets and elevations, the vertical exaggeration and the section's areas. Colours from the page tokens.
 *
 *   const sv = new SectionView(canvas)
 *   sv.set({ key, section, units, station (text), exaggeration (≥ 1 | null = fit), labels: { ground, design, cut, fill, ve } })
 *   sv.toData(sx, sy) → { o, z }
 */

import { fixed } from './units.js';
import { LABEL_FONT, mix } from './view.js';
import { segValues } from './sections.js';
import { measureSection } from './section-measure.js';

export class SectionView {
  constructor(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.data = null; this.w = 1; this.h = 1; this.dpr = 1;
    this.pad = { l: 58, r: 16, t: 26, b: 30 };
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
  }
  resize() {
    const r = this.cv.parentElement.getBoundingClientRect();
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height); this.dpr = window.devicePixelRatio || 1;
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.fit(); this.draw();
  }
  set(d) { this.data = d; this.fit(); this.draw(); }
  /** CV.3 (#1534): zoom about the screen point (f > 1 in; axis 'x' offsets only, 'y' elevations only, else both); the view stays zoomed through
   *  the next and previous sections until `reset()` (Fit, a new exaggeration, the F key, a double click). */
  zoomAt(sx, sy, f, axis = 'xy') {
    if (!this.data?.section) return;
    const a = this.toData(sx, sy);
    if (axis.includes('x')) { const w = Math.max((this.o1 - this.o0) / f, 1e-3), k = (a.o - this.o0) / (this.o1 - this.o0); this.o0 = a.o - k * w; this.o1 = this.o0 + w; }
    if (axis.includes('y')) { const h = Math.max((this.z1 - this.z0) / f, 1e-3), k = (a.z - this.z0) / (this.z1 - this.z0); this.z0 = a.z - k * h; this.z1 = this.z0 + h; }
    this.zoomed = true; this.updateVe(); this.draw();
  }
  panBy(dx, dy) {
    const P = this.plot, dO = (dx / (P.x1 - P.x0)) * (this.o1 - this.o0), dZ = (dy / (P.y0 - P.y1)) * (this.z1 - this.z0);
    this.o0 -= dO; this.o1 -= dO; this.z0 += dZ; this.z1 += dZ; this.zoomed = true; this.draw();
  }
  reset() { this.zoomed = false; this.fit(); this.draw(); }
  updateVe() { const P = this.plot; this.ve = ((P.y0 - P.y1) / (this.z1 - this.z0)) / ((P.x1 - P.x0) / (this.o1 - this.o0)); }
  get plot() { const p = this.pad; return { x0: p.l, x1: this.w - p.r, y0: this.h - p.b, y1: p.t }; }

  fit() {
    const d = this.data, s = d?.section;
    if (!s) return;
    if (this.zoomed) { this.updateVe(); return; }
    const P = this.plot;
    this.o0 = -s.left; this.o1 = s.right;
    let lo = Infinity, hi = -Infinity;
    for (const r of [...s.ground, ...s.design]) for (const q of r) { lo = Math.min(lo, q.z); hi = Math.max(hi, q.z); }
    for (const m of s.marks) if (Number.isFinite(m.z)) { lo = Math.min(lo, m.z); hi = Math.max(hi, m.z); }
    for (const L of s.layers || []) lo = Math.min(lo, L.a.z, L.b.z);
    for (const r of s.basis || []) for (const q of r) lo = Math.min(lo, q.z);   // CV.3: the bottom surface too   // 0.7.1 71.24: the course bottoms stay in view
    if (!Number.isFinite(lo)) { lo = 0; hi = 10; }
    const pxPerO = (P.x1 - P.x0) / Math.max(this.o1 - this.o0, 1e-9);
    // a fixed exaggeration when asked, else fit the elevations (at least 1×)
    let span = Math.max(hi - lo, 1) * 1.3;
    const fitVe = ((P.y0 - P.y1) / span) / pxPerO;
    const ve = d.exaggeration > 0 ? d.exaggeration : Math.max(1, fitVe);
    span = (P.y0 - P.y1) / (pxPerO * ve);
    const mid = (lo + hi) / 2;
    this.z0 = mid - span / 2; this.z1 = mid + span / 2; this.ve = ve;
  }
  toScreen(o, z) {
    const P = this.plot;
    return { x: P.x0 + ((o - this.o0) / (this.o1 - this.o0)) * (P.x1 - P.x0), y: P.y0 - ((z - this.z0) / (this.z1 - this.z0)) * (P.y0 - P.y1) };
  }
  toData(sx, sy) {
    const P = this.plot;
    return { o: this.o0 + ((sx - P.x0) / (P.x1 - P.x0)) * (this.o1 - this.o0), z: this.z0 + ((P.y0 - sy) / (P.y0 - P.y1)) * (this.z1 - this.z0) };
  }
  colors() {
    const cs = getComputedStyle(document.documentElement), t = (n, f) => cs.getPropertyValue(n).trim() || f;
    const bg = t('--sheet-2', '#ffffff'), ink = t('--ink', '#17202b');
    return { bg, ink, ink2: t('--ink-2', '#34404e'), grid: t('--grid', '#d5dde5'), eg: mix(ink, bg, 0.25), fg: t('--layer-red', '#b3122e'), cut: t('--layer-orange', '#b4530f'), fill: t('--layer-green', '#17703a'), ochre: t('--layer-ochre', '#8a6a00'), action: t('--action', '#1e48c8'), green: t('--layer-green', '#17703a') };
  }

  draw() {
    const ctx = this.ctx, C = this.colors(), d = this.data, s = d?.section;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, this.w, this.h);
    ctx.font = '12px ' + LABEL_FONT;
    if (!s) { ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.fillText(d?.empty || '', this.w / 2, this.h / 2); return; }
    const P = this.plot, L = d.labels || {};
    const pxPerO = (P.x1 - P.x0) / (this.o1 - this.o0), pxPerZ = (P.y0 - P.y1) / (this.z1 - this.z0);
    const oStep = niceStep(60 / pxPerO, [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 500]);
    const zStep = niceStep(24 / pxPerZ, [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]);
    ctx.lineWidth = 1; ctx.strokeStyle = C.grid; ctx.fillStyle = C.ink2;
    ctx.beginPath(); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let o = Math.ceil(this.o0 / oStep) * oStep; o <= this.o1 + 1e-9; o += oStep) {
      const x = this.toScreen(o, 0).x; ctx.moveTo(x, P.y1); ctx.lineTo(x, P.y0);
      ctx.fillText((o > 0 ? '+' : '') + fixed(o, oStep < 1 ? (oStep < 0.1 ? 2 : 1) : 0), x, P.y0 + 6);
    }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let z = Math.ceil(this.z0 / zStep) * zStep; z <= this.z1 + 1e-9; z += zStep) {
      const y = this.toScreen(0, z).y; ctx.moveTo(P.x0, y); ctx.lineTo(P.x1, y);
      ctx.fillText(fixed(z, zStep < 0.1 ? 2 : zStep < 1 ? 1 : 0), P.x0 - 6, y);
    }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.strokeRect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1);
    const cl = this.toScreen(0, 0).x;
    if (cl >= P.x0 && cl <= P.x1) { ctx.setLineDash([6, 3, 1, 3]); ctx.strokeStyle = C.fg; ctx.beginPath(); ctx.moveTo(cl, P.y1); ctx.lineTo(cl, P.y0); ctx.stroke(); ctx.setLineDash([]); }

    ctx.save();
    ctx.beginPath(); ctx.rect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1); ctx.clip();
    // cut and fill: the band between the ground and the surface the volumes are measured to (the bottom of the components, or the top) over each part
    const base = s.basis || s.design, os = [...new Set([...s.ground, ...base].flat().map((q) => q.o))].sort((m, n) => m - n);
    for (const part of s.parts) {
      const xs = [part.o0, ...os.filter((o) => o > part.o0 && o < part.o1), part.o1];
      ctx.fillStyle = part.kind === 'cut' ? C.cut : C.fill; ctx.globalAlpha = 0.28; ctx.beginPath();
      const up = [], dn = [];
      for (let i = 1; i < xs.length; i++) {
        const bv = segValues(base, xs[i - 1], xs[i]), gv = segValues(s.ground, xs[i - 1], xs[i]);
        if (!bv || !gv) continue;
        up.push([xs[i - 1], bv[0]], [xs[i], bv[1]]); dn.push([xs[i - 1], gv[0]], [xs[i], gv[1]]);
      }
      [...up, ...dn.reverse()].forEach(([o, z], i) => { const q = this.toScreen(o, z); i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); });
      ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    }
    const line = (runs, color, w, dash) => {
      ctx.strokeStyle = color; ctx.lineWidth = w; ctx.setLineDash(dash || []); ctx.beginPath();
      for (const r of runs) r.forEach((q, i) => { const p = this.toScreen(q.o, q.z); i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y); });
      ctx.stroke(); ctx.setLineDash([]);
    };
    line(s.ground, C.eg, 1.6);
    if (s.design !== s.ground) line(s.design, C.fg, 2.2);   // only where something is graded (sections.js clips it)
    for (const L of s.layers || []) line([[L.a, L.b]], C.ink2, 1, [4, 2]);   // 0.7.1 71.24: pavement course bottoms
    if (s.basis && s.basis !== s.design) line(s.basis, C.cut, 1.8, [7, 3]);   // CV.3 (#1534): the bottom surface the volumes run to
    ctx.restore();
    if (d.snap) {   // CV.3: the vertex a click would take
      const q = this.toScreen(d.snap.o, d.snap.z);
      ctx.strokeStyle = C.green; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(q.x - 6, q.y - 6, 12, 12); ctx.stroke();
    }
    if (d.measure?.a) this.drawMeasure(ctx, C, d.measure, L);
    // corridor points
    ctx.font = '600 11px ' + LABEL_FONT;
    let lastX = -Infinity, row = 0;
    for (const m of s.marks) {
      if (!Number.isFinite(m.z)) continue;
      const p = this.toScreen(m.o, m.z);
      ctx.fillStyle = C.bg; ctx.strokeStyle = C.ochre; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // labels that would touch the one before go a line higher (two lines, then alternate)
      const text = m.code.replace(/_[LR]$/, ''), w = ctx.measureText(text).width;
      row = p.x - lastX < w + 6 ? (row + 1) % 2 : 0;
      lastX = p.x;
      ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(text, p.x, p.y - 6 - row * 13);
    }
    // header: station, areas, exaggeration
    ctx.font = '600 12px ' + LABEL_FONT; ctx.textBaseline = 'top'; ctx.textAlign = 'left'; ctx.fillStyle = C.ink;
    ctx.fillText(d.station || '', P.x0, 6);
    ctx.font = '12px ' + LABEL_FONT; ctx.textAlign = 'right';
    const parts = [];
    if (L.cut) parts.push(L.cut); if (L.fill) parts.push(L.fill); if (L.ve) parts.push(L.ve);
    ctx.fillStyle = C.ink2; ctx.fillText(parts.join('   '), P.x1, 6);
  }
}
/** CV.3 (#1534): the measure line from A to B (or to the pointer), with the horizontal and vertical legs, and the readout. */
SectionView.prototype.drawMeasure = function drawMeasure(ctx, C, m, L) {
  const P = this.plot, a = m.a, b = m.b || m.live;
  const pa = this.toScreen(a.o, a.z);
  ctx.save(); ctx.beginPath(); ctx.rect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1); ctx.clip();
  ctx.fillStyle = C.action || C.ink; ctx.beginPath(); ctx.arc(pa.x, pa.y, 4, 0, Math.PI * 2); ctx.fill();
  if (b) {
    const pb = this.toScreen(b.o, b.z), r = measureSection(a, b);
    ctx.strokeStyle = C.action || C.ink; ctx.lineWidth = 2; ctx.setLineDash([]); ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke();
    ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(pb.x, pb.y, 4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    const text = [L.mh ? L.mh(r.dh) : fixed(r.dh, 2), L.mv ? L.mv(r.dv) : fixed(r.dv, 2), L.ms ? L.ms(r.slope) : (r.slope === null ? '' : fixed(r.slope * 100, 2) + '%'), L.md ? L.md(r.dist) : fixed(r.dist, 2)].filter(Boolean).join('   ');
    ctx.font = '600 12px ' + LABEL_FONT; const w = ctx.measureText(text).width + 14, x = Math.max(P.x0 + 4, Math.min(P.x1 - w - 4, (pa.x + pb.x) / 2 - w / 2)), y = Math.max(P.y1 + 4, Math.min(P.y0 - 24, (pa.y + pb.y) / 2 - 30));
    ctx.fillStyle = C.bg; ctx.globalAlpha = 0.92; ctx.fillRect(x, y, w, 20); ctx.globalAlpha = 1; ctx.strokeStyle = C.action || C.ink; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, 20);
    ctx.fillStyle = C.ink; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 7, y + 10);
  } else ctx.restore();
};
function niceStep(raw, steps) { for (const s of steps) if (s >= raw) return s; return steps[steps.length - 1] * Math.ceil(raw / steps[steps.length - 1]); }
