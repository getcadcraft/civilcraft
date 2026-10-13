/* SPDX-License-Identifier: Apache-2.0 */
/**
 * profile-view.js — the profile view: existing ground and the design profile along one alignment,
 * station across, elevation up (vertically exaggerated to fill the panel; the exaggeration is shown).
 *
 *   const pv = new ProfileView(canvas)
 *   pv.set({ eg, profile, pvis, start, end, units, sel, hover })   then pv.draw()
 *   pv.toData(sx, sy) → { sta, z }    pv.toScreen(sta, z)    pv.hitPvi(sx, sy) → index | -1
 * Labels: grades on each tangent, PVI station/elevation, each vertical curve's L and K with BVC/EVC
 * ticks, and its high or low point.
 */

import { t } from "./i18n.js";
import { formatStation, fixed, pct } from './units.js';
import { LABEL_FONT, mix } from './view.js';

export class ProfileView {
  constructor(canvas) {
    this.cv = canvas; this.ctx = canvas.getContext('2d');
    this.data = null; this.w = 1; this.h = 1; this.dpr = 1;
    this.pad = { l: 58, r: 16, t: 14, b: 30 };
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
  }
  resize() {
    const r = this.cv.parentElement.getBoundingClientRect();
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height); this.dpr = window.devicePixelRatio || 1;
    this.cv.width = Math.round(this.w * this.dpr); this.cv.height = Math.round(this.h * this.dpr);
    this.fitY(); this.draw();
  }
  set(d) { const keep = this.data && d && this.data.key === d.key; this.data = d; if (!keep) this.fitY(); this.draw(); }

  fitY() {
    const d = this.data;
    if (!d) return;
    let lo = Infinity, hi = -Infinity;
    for (const p of d.eg || []) if (p.z !== null) { lo = Math.min(lo, p.z); hi = Math.max(hi, p.z); }
    for (const v of d.pvis || []) { lo = Math.min(lo, v.z); hi = Math.max(hi, v.z); }
    if (!Number.isFinite(lo)) { lo = 0; hi = 10; }
    const span = Math.max(hi - lo, 2), m = span * 0.15;
    this.z0 = lo - m; this.z1 = hi + m;
  }
  get plot() { const p = this.pad; return { x0: p.l, x1: this.w - p.r, y0: this.h - p.b, y1: p.t }; }
  toScreen(sta, z) {
    const d = this.data, P = this.plot;
    const sx = P.x0 + (sta - d.start) / Math.max(d.end - d.start, 1e-9) * (P.x1 - P.x0);
    const sy = P.y0 - (z - this.z0) / Math.max(this.z1 - this.z0, 1e-9) * (P.y0 - P.y1);
    return { x: sx, y: sy };
  }
  toData(sx, sy) {
    const d = this.data, P = this.plot;
    return { sta: d.start + (sx - P.x0) / (P.x1 - P.x0) * (d.end - d.start), z: this.z0 + (P.y0 - sy) / (P.y0 - P.y1) * (this.z1 - this.z0) };
  }
  hitPvi(sx, sy, px = 9) {
    const d = this.data;
    if (!d) return -1;
    let best = -1, bd = px;
    (d.pvis || []).forEach((v, i) => { const s = this.toScreen(v.sta, v.z); const dd = Math.hypot(s.x - sx, s.y - sy); if (dd < bd) { bd = dd; best = i; } });
    return best;
  }

  colors() {
    const cs = getComputedStyle(document.documentElement), t = (n, f) => cs.getPropertyValue(n).trim() || f;
    const bg = t('--sheet-2', '#ffffff'), ink = t('--ink', '#17202b');
    return { bg, ink, ink2: t('--ink-2', '#34404e'), grid: t('--grid', '#d5dde5'), eg: mix(ink, bg, 0.25), fg: t('--layer-red', '#b3122e'), action: t('--action', '#1e48c8'), green: t('--layer-green', '#17703a'), muted: mix(ink, bg, 0.6) };
  }

  draw() {
    const ctx = this.ctx, C = this.colors(), d = this.data;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, this.w, this.h);
    ctx.font = '12px ' + LABEL_FONT;
    if (!d) {
      ctx.fillStyle = C.ink2; ctx.textAlign = 'center';
      ctx.fillText(t('pv.empty'), this.w / 2, this.h / 2);
      return;
    }
    const P = this.plot, u = d.units;
    // grid: stations and elevations
    const len = d.end - d.start, pxPerSta = (P.x1 - P.x0) / Math.max(len, 1e-9);
    const sStep = niceStep(70 / pxPerSta, u === 'm' ? [10, 20, 50, 100, 200, 500, 1000] : [25, 50, 100, 200, 500, 1000, 2000]);
    const zStep = niceStep(28 / ((P.y0 - P.y1) / (this.z1 - this.z0)), [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]);
    ctx.lineWidth = 1; ctx.strokeStyle = C.grid; ctx.fillStyle = C.ink2;
    ctx.beginPath();
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let s = Math.ceil(d.start / sStep) * sStep; s <= d.end + 1e-9; s += sStep) {
      const x = this.toScreen(s, this.z0).x; ctx.moveTo(x, P.y1); ctx.lineTo(x, P.y0);
      ctx.fillText(formatStation(s, u, 0), x, P.y0 + 6);
    }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let z = Math.ceil(this.z0 / zStep) * zStep; z <= this.z1 + 1e-9; z += zStep) {
      const y = this.toScreen(d.start, z).y; ctx.moveTo(P.x0, y); ctx.lineTo(P.x1, y);
      ctx.fillText(fixed(z, zStep < 1 ? 1 : 0), P.x0 - 6, y);
    }
    ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.strokeRect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1);
    const ve = ((P.y0 - P.y1) / (this.z1 - this.z0)) / pxPerSta;
    ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillStyle = C.ink2;
    ctx.fillText(t('pv.ve', { ve: ve >= 10 ? Math.round(ve) : fixed(ve, 1) }), P.x0 + 6, P.y1 + 4);

    ctx.save();
    ctx.beginPath(); ctx.rect(P.x0, P.y1, P.x1 - P.x0, P.y0 - P.y1); ctx.clip();
    // existing ground
    ctx.strokeStyle = C.eg; ctx.lineWidth = 1.5; ctx.beginPath();
    let pen = false;
    for (const p of d.eg || []) { if (p.z === null) { pen = false; continue; } const s = this.toScreen(p.sta, p.z); if (pen) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y); pen = true; }
    ctx.stroke();
    // design: tangents dashed through the PVIs, the profile itself solid
    const pv = d.pvis || [];
    if (pv.length >= 2) {
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1; ctx.setLineDash([5, 4]); ctx.beginPath();
      pv.forEach((v, i) => { const s = this.toScreen(v.sta, v.z); i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); });
      ctx.stroke(); ctx.setLineDash([]);
    }
    const prof = d.profile;
    if (prof && prof.pvis.length >= 2) {
      ctx.strokeStyle = C.fg; ctx.lineWidth = 2.2; ctx.beginPath();
      prof.sample(len / 400).forEach((q, i) => { if (q.z === null) return; const s = this.toScreen(q.sta, q.z); i ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y); });
      ctx.stroke();
    }
    ctx.restore();

    // labels
    ctx.font = '600 11.5px ' + LABEL_FONT;
    if (prof && prof.pvis.length >= 2) {
      ctx.fillStyle = C.fg; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      prof.grades.forEach((g) => {
        const m = (g.from + g.to) / 2, a = this.toScreen(g.from, prof.elevationAt(g.from) ?? 0), b = this.toScreen(g.to, prof.elevationAt(g.to) ?? 0);
        const s = this.toScreen(m, prof.elevationAt(m));
        if (b.x - a.x < 60) return;
        ctx.save(); ctx.translate(s.x, s.y - 4); ctx.rotate(Math.atan2(b.y - a.y, b.x - a.x)); ctx.fillText(pct(g.g), 0, 0); ctx.restore();
      });
      for (const c of prof.curves) {
        const a = this.toScreen(c.bvc, c.zBvc), b = this.toScreen(c.evc, c.zEvc), v = this.toScreen(c.pvi, c.zPvi);
        ctx.strokeStyle = C.fg; ctx.lineWidth = 1; ctx.beginPath();
        for (const q of [a, b]) { ctx.moveTo(q.x, q.y - 8); ctx.lineTo(q.x, q.y + 8); }
        ctx.stroke();
        ctx.fillStyle = C.ink;
        // label on the outside of the curve, or inside when there is no room
        let up = c.kind === 'crest';
        let ly = up ? Math.min(v.y, a.y, b.y) - 16 : Math.max(v.y, a.y, b.y) + 16;
        if (up && ly - 30 < P.y1) { up = false; ly = Math.max(v.y, a.y, b.y) + 26; }
        else if (!up && ly + 30 > P.y0) { up = true; ly = Math.min(v.y, a.y, b.y) - 26; }
        ctx.textBaseline = up ? 'bottom' : 'top';
        ctx.fillText(t('pv.lk', { len: fixed(c.L, 2), k: fixed(c.K, 1) }), v.x, ly);
        const hp = c.high || c.low;
        if (hp) {
          const s = this.toScreen(hp.sta, hp.z);
          ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(s.x, s.y, 3.2, 0, Math.PI * 2); ctx.fill();
          ctx.fillText(t(c.high ? 'pv.high' : 'pv.low', { sta: formatStation(hp.sta, u), z: fixed(hp.z, 2) }), v.x, up ? ly - 14 : ly + 14);
        }
      }
    }
    // PVIs
    pv.forEach((v, i) => {
      const s = this.toScreen(v.sta, v.z), sel = d.sel === i, hov = d.hover === i;
      ctx.lineWidth = sel ? 2.4 : 1.6; ctx.strokeStyle = sel ? C.action : C.fg; ctx.fillStyle = C.bg;
      ctx.beginPath(); ctx.arc(s.x, s.y, sel || hov ? 6 : 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (sel || pv.length <= 8) {
        ctx.fillStyle = C.ink2; ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.font = '11px ' + LABEL_FONT;
        ctx.fillText(t('pv.pvi', { sta: formatStation(v.sta, u), z: fixed(v.z, 2) }), s.x, s.y + 9);
      }
    });
    if (d.cursor) {
      const s = this.toScreen(d.cursor.sta, this.z0);
      ctx.strokeStyle = C.action; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(s.x, P.y1); ctx.lineTo(s.x, P.y0); ctx.stroke();
    }
  }
}

function niceStep(raw, steps) { for (const s of steps) if (s >= raw) return s; return steps[steps.length - 1] * Math.ceil(raw / steps[steps.length - 1]); }
