/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view.js — the plan view: two stacked canvases, `base` (bands + the plan scene, rebuilt only when
 * the scene changes; one Path2D per layer) and `over` (cursor, drafts, selection, grips — redrawn
 * on every pointer move by the page's `drawOverlay(ctx, view)`).
 *
 *   const v = new PlanView(base, over, { scene: (mmPerUnit) => scene, bands: () => [{color, loop}], underlay: (ctx, v) => {} })
 *   underlay (optional) paints map layers first, in CSS px (ctx already scaled by dpr); v.toScreen/viewBounds place them.
 *   v.fit(bounds)  v.zoomAt(sx, sy, f)  v.panBy(dx, dy)  v.toWorld(sx, sy)  v.toScreen(x, y)
 *   v.invalidate(true) after the drawing changes; v.invalidate() for the overlay only.
 *
 * Coordinates are kept relative to `origin` inside the paths (state-plane values would lose
 * precision in the canvas's float32 geometry). Labels are drawn at a fixed size on screen: the scene
 * is asked for at the current zoom rounded to a power of two (paper mm per unit), so label spacing
 * follows the zoom without rebuilding on every wheel step. Colours come from the page's theme tokens.
 */

export const PX_PER_MM = 96 / 25.4;
export const LABEL_FONT = 'Helvetica, Arial, "Liberation Sans", sans-serif';

const WIDTHS = { 'C-TOPO-MAJR': 1.5, 'C-TOPO-MINR': 0.75, 'C-TOPO-TINN': 0.6, 'C-TOPO-BRKL': 1.4, 'C-TOPO-BNDY': 1.2, 'C-TOPO-SLOP': 1, 'C-ROAD-CNTR': 2.2, 'C-ROAD-STAN': 1.2, 'C-ROAD-CORR': 1.4, 'C-GRAD-PADS': 2, 'C-GRAD-DAYL': 1.6, 'C-GRAD-SLOP': 0.6, 'C-STRM-PIPE': 2.4, 'C-STRM-STRC': 1.6, 'C-STRM-PROB': 2.8 };

export class PlanView {
  constructor(base, over, src) {
    this.base = base; this.over = over; this.src = src;
    this.bctx = base.getContext('2d'); this.octx = over.getContext('2d');
    this.cx = 0; this.cy = 0; this.zoom = 1; this.w = 1; this.h = 1; this.dpr = 1;
    this.origin = { x: 0, y: 0 };
    this.drawOverlay = null;
    this.dirtyBase = true; this.raf = 0;
    this.sceneCache = null; this.paths = null;
    this.theme();
    if (typeof MutationObserver !== 'undefined') new MutationObserver(() => { this.theme(); this.invalidate(true); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-space'] });
    window.matchMedia?.('(prefers-color-scheme: dark)').addEventListener?.('change', () => { this.theme(); this.invalidate(true); });   // i18n-ignore: CSS media query
    new ResizeObserver(() => this.resize()).observe(base.parentElement);
    this.resize();
  }

  theme() {
    const cs = getComputedStyle(document.documentElement);
    const t = (n, d) => cs.getPropertyValue(n).trim() || d;
    const c = {
      bg: t('--sheet', '#f3f6f8'), ink: t('--ink', '#17202b'), ink2: t('--ink-2', '#34404e'), grid: t('--grid', '#d5dde5'), line: t('--line', '#7a8796'),
      action: t('--action', '#1e48c8'), red: t('--layer-red', '#b3122e'), orange: t('--layer-orange', '#a84a00'), green: t('--layer-green', '#17703a'),
      blue: t('--layer-blue', '#1e48c8'), magenta: t('--layer-magenta', '#9a1f86'), cyan: t('--layer-cyan', '#00707e'), ochre: t('--layer-ochre', '#8a6200'),
    };
    this.dark = luminance(c.bg) < 0.4;
    c.major = c.ink;
    c.minor = mix(c.ink, c.bg, this.dark ? 0.55 : 0.5);
    c.tin = mix(c.line, c.bg, 0.35);
    this.colors = c;
    this.invalidateScene();
  }
  colorOf(token) { return this.colors[token] || this.colors.ink; }

  resize() {
    const r = this.base.parentElement.getBoundingClientRect();
    const first = this.w <= 1;
    this.w = Math.max(1, r.width); this.h = Math.max(1, r.height);
    this.dpr = window.devicePixelRatio || 1;
    for (const cv of [this.base, this.over]) { cv.width = Math.round(this.w * this.dpr); cv.height = Math.round(this.h * this.dpr); }
    if (first && this.onFirstSize) this.onFirstSize();
    this.invalidate(true);
  }

  // ---- coordinates ----
  toScreen(x, y) { return { x: (x - this.cx) * this.zoom + this.w / 2, y: this.h / 2 - (y - this.cy) * this.zoom }; }
  toWorld(sx, sy) { return { x: (sx - this.w / 2) / this.zoom + this.cx, y: (this.h / 2 - sy) / this.zoom + this.cy }; }
  zoomAt(sx, sy, f) {
    const before = this.toWorld(sx, sy);
    this.zoom = Math.min(1e6, Math.max(1e-6, this.zoom * f));
    const after = this.toWorld(sx, sy);
    this.cx += before.x - after.x; this.cy += before.y - after.y;
    this.invalidate(true);
  }
  panBy(dx, dy) { this.cx -= dx / this.zoom; this.cy += dy / this.zoom; this.invalidate(true); }
  fit(b) {
    if (!b || !Number.isFinite(b.minX)) { this.zoom = 1; this.invalidate(true); return; }
    const bw = Math.max(b.maxX - b.minX, 1e-6), bh = Math.max(b.maxY - b.minY, 1e-6);
    this.cx = (b.minX + b.maxX) / 2; this.cy = (b.minY + b.maxY) / 2;
    this.zoom = Math.min(this.w / bw, this.h / bh) * 0.88;
    this.invalidate(true);
  }
  viewBounds() { const a = this.toWorld(0, this.h), b = this.toWorld(this.w, 0); return { minX: a.x, minY: a.y, maxX: b.x, maxY: b.y }; }
  /** Paper mm per unit for the scene: the zoom rounded to a power of two. */
  mmBucket() { const mm = this.zoom / PX_PER_MM; return Math.pow(2, Math.round(Math.log2(mm))); }

  invalidateScene() { this.sceneCache = null; this.paths = null; this.dirtyBase = true; this.schedule(); }
  invalidate(base = false) { if (base) this.dirtyBase = true; this.schedule(); }
  schedule() { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.paint(); }); }

  scene() {
    const mm = this.mmBucket();
    if (!this.sceneCache || this.sceneCache.mm !== mm) {
      const sc = this.src.scene(mm);
      this.sceneCache = { mm, scene: sc };
      this.paths = sc ? this.buildPaths(sc) : null;
    }
    return this.sceneCache.scene;
  }

  buildPaths(sc) {
    const ox = this.origin.x, oy = this.origin.y;
    const byLayer = new Map(), texts = [], points = [], dashed = [];
    const P = (layer) => { let p = byLayer.get(layer); if (!p) byLayer.set(layer, (p = new Path2D())); return p; };
    for (const it of sc.items) {
      if (it.kind === 'poly') {
        const p = it.dashed ? (dashed.push({ layer: it.layer, pts: it.pts }), null) : P(it.layer);
        if (!p) continue;
        it.pts.forEach((q, i) => (i ? p.lineTo(q.x - ox, q.y - oy) : p.moveTo(q.x - ox, q.y - oy)));
        if (it.closed) p.closePath();
      } else if (it.kind === 'arc') {
        const p = P(it.layer);
        p.moveTo(it.c.x - ox + it.r * Math.cos(it.a0), it.c.y - oy + it.r * Math.sin(it.a0));
        p.arc(it.c.x - ox, it.c.y - oy, it.r, it.a0, it.a1, false);
      } else if (it.kind === 'text') texts.push(it);
      else if (it.kind === 'point') points.push(it);
    }
    const layerToken = new Map(sc.layers.map((l) => [l.name, l.token]));
    return { byLayer, texts, points, dashed, layerToken, order: sc.layers.map((l) => l.name) };
  }

  paint() {
    if (this.dirtyBase) { this.dirtyBase = false; this.paintBase(); }
    const ctx = this.octx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    if (this.drawOverlay) this.drawOverlay(ctx, this);
  }

  /** World (relative to origin) → CSS px, as a canvas transform scaled by dpr. */
  worldTransform(ctx) {
    const z = this.zoom, d = this.dpr;
    ctx.setTransform(z * d, 0, 0, -z * d, (this.w / 2 - (this.cx - this.origin.x) * z) * d, (this.h / 2 + (this.cy - this.origin.y) * z) * d);
  }

  paintBase() {
    const ctx = this.bctx, C = this.colors;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, this.base.width, this.base.height);
    // map layers (GIS, docs/GIS-SPEC.md §4) under everything: the page's underlay(ctx, view) draws them in CSS px
    if (this.src.underlay) { ctx.save(); ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); this.src.underlay(ctx, this); ctx.restore(); }
    // elevation bands under everything else
    const bands = this.src.bands?.();
    if (bands?.length) {
      this.worldTransform(ctx);
      const ox = this.origin.x, oy = this.origin.y;
      const byColor = new Map();
      for (const b of bands) { let p = byColor.get(b.color); if (!p) byColor.set(b.color, (p = new Path2D())); const L = b.loop; p.moveTo(L[0] - ox, L[1] - oy); for (let i = 2; i < L.length; i += 2) p.lineTo(L[i] - ox, L[i + 1] - oy); p.closePath(); }
      ctx.globalAlpha = this.dark ? 0.55 : 0.6;
      for (const [color, p] of byColor) { ctx.fillStyle = color; ctx.fill(p); }
      ctx.globalAlpha = 1;
    }
    this.scene();
    const P = this.paths;
    if (!P) return;
    this.worldTransform(ctx);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const name of P.order) {
      const p = P.byLayer.get(name);
      if (!p) continue;
      ctx.strokeStyle = this.colorOf(P.layerToken.get(name));
      ctx.lineWidth = (WIDTHS[name] || 1) / this.zoom;
      ctx.stroke(p);
    }
    for (const d of P.dashed) {
      ctx.strokeStyle = this.colorOf(P.layerToken.get(d.layer));
      ctx.lineWidth = 1.4 / this.zoom;
      ctx.setLineDash([6 / this.zoom, 4 / this.zoom]);
      ctx.beginPath(); d.pts.forEach((q, i) => (i ? ctx.lineTo(q.x - this.origin.x, q.y - this.origin.y) : ctx.moveTo(q.x - this.origin.x, q.y - this.origin.y))); ctx.stroke();
      ctx.setLineDash([]);
    }
    // points and labels in screen space
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    const vb = this.viewBounds(), m = 40 / this.zoom;
    const inView = (x, y) => x >= vb.minX - m && x <= vb.maxX + m && y >= vb.minY - m && y <= vb.maxY + m;
    if (P.points.length) {
      ctx.strokeStyle = this.colorOf('green'); ctx.lineWidth = 1.2;
      ctx.beginPath();
      const k = P.points.length > 5000 && this.zoom < 0.5 ? 1.5 : 2.5;
      for (const q of P.points) { if (!inView(q.x, q.y)) continue; const s = this.toScreen(q.x, q.y); ctx.moveTo(s.x - k, s.y - k); ctx.lineTo(s.x + k, s.y + k); ctx.moveTo(s.x - k, s.y + k); ctx.lineTo(s.x + k, s.y - k); }
      ctx.stroke();
    }
    ctx.textBaseline = 'alphabetic';
    for (const t of P.texts) {
      if (!inView(t.x, t.y)) continue;
      const s = this.toScreen(t.x, t.y), fs = t.mm * PX_PER_MM / 0.72;
      ctx.save();
      ctx.translate(s.x, s.y); ctx.rotate(-(t.rot || 0));
      ctx.font = '600 ' + fs.toFixed(1) + 'px ' + LABEL_FONT;
      ctx.textAlign = t.align === 'center' ? 'center' : t.align === 'right' ? 'right' : 'left';
      const y = t.middle ? fs * 0.36 : 0;
      if (t.mask) {
        const w = ctx.measureText(t.text).width, x0 = t.align === 'center' ? -w / 2 : t.align === 'right' ? -w : 0;
        ctx.fillStyle = this.colors.bg; ctx.fillRect(x0 - 2, y - fs * 0.8, w + 4, fs * 0.95);
      }
      ctx.fillStyle = this.colorOf(P.layerToken.get(t.layer));
      ctx.fillText(t.text, 0, y);
      ctx.restore();
    }
  }
}

export function luminance(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return 1;
  const n = parseInt(m[1], 16);
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f((n >> 16) & 255) + 0.7152 * f((n >> 8) & 255) + 0.0722 * f(n & 255);
}
export function mix(a, b, t) {
  const p = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(String(h).trim()); const n = m ? parseInt(m[1], 16) : 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(v * (1 - t) + y[i] * t).toString(16).padStart(2, '0')).join('');
}
