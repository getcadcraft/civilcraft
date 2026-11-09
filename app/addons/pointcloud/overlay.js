/* SPDX-License-Identifier: Apache-2.0 */
/**
 * overlay.js — draw a shape over the plan or the 3D view and hand back a ring of ground coordinates (the cloud's file coordinates).
 *   const ring = await drawRing(ctx, 'lasso' | 'box' | 'polygon' | 'line' | 'polyline')   null when cancelled (Esc, or the view changed)
 * lasso: press, drag, release. box: press, drag to the opposite corner. polygon: click corners, double-click or Enter closes. line: two clicks. polyline: click vertices, double-click or Enter ends (2 or more points, not closed).
 * In the plan the corners are exact. In 3D each pixel is taken down onto the horizontal plane at the cloud's middle height, so the
 * selection is a vertical prism over that outline: use the top view when it has to be exact (the panel says so).
 */
import { el } from './ui.js';
import { thin } from '../../lasso-core.js';

export function activeHost() {
  const h3 = document.querySelector('[data-view3d]');
  if (h3 && !h3.hidden) return { kind: '3d', el: h3 };
  return { kind: 'plan', el: document.querySelector('[data-over]') };
}

export function drawRing(ctx, shape, { message = '' } = {}) {
  return new Promise((resolve) => {
    const host = activeHost();
    if (!host.el || !ctx.cloud) return resolve(null);
    const r = host.el.getBoundingClientRect();
    const cv = el('canvas', { className: 'pc-overlay', width: Math.round(r.width), height: Math.round(r.height), 'data-pc-overlay': shape });
    cv.style.left = r.left + 'px'; cv.style.top = r.top + 'px'; cv.style.width = r.width + 'px'; cv.style.height = r.height + 'px';
    const hint = el('div', { className: 'pc-overlay pc-overlay-hint', 'data-pc-overlay-hint': '' }, message);
    hint.style.cssText = `left:${r.left + 8}px;top:${r.top + 8}px;background:var(--sheet-2,#fff);color:var(--ink,#111);padding:.2rem .5rem;border:1px solid var(--line,#777);cursor:default;pointer-events:none`;
    document.body.append(cv, hint);
    const g = cv.getContext('2d');
    const midZ = (ctx.cloud.bounds.min[2] + ctx.cloud.bounds.max[2]) / 2;
    const toGround = (px, py) => {
      if (host.kind === 'plan') { const w = window.civilcraft.view.toWorld(px, py); return [w.x, w.y]; }
      return ctx.view.screenToGround(px, py, midZ);
    };
    let pts = [], hover = null, down = false, done = false;
    const local = (e) => { const b = cv.getBoundingClientRect(); return { x: e.clientX - b.left, y: e.clientY - b.top }; };
    const finish = (res) => {
      if (done) return; done = true;
      cv.remove(); hint.remove(); window.removeEventListener('keydown', key, true);
      resolve(res);
    };
    const toRing = (screen) => {
      const out = [];
      for (const p of screen) { const w = toGround(p.x, p.y); if (!w) return null; out.push(w); }
      return out;
    };
    const paint = () => {
      g.clearRect(0, 0, cv.width, cv.height);
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--action').trim() || '#1e48c8';
      g.strokeStyle = ink; g.fillStyle = ink + '22'; g.lineWidth = 2;
      let p = pts;
      if (shape === 'box' && pts.length === 2) p = [pts[0], { x: pts[1].x, y: pts[0].y }, pts[1], { x: pts[0].x, y: pts[1].y }];
      else if ((shape === 'polygon' || shape === 'line' || shape === 'polyline') && hover) p = pts.concat([hover]);
      if (!p.length) return;
      g.beginPath(); g.moveTo(p[0].x, p[0].y); for (let i = 1; i < p.length; i++) g.lineTo(p[i].x, p[i].y);
      const closed = shape !== 'line' && shape !== 'polyline' && p.length > 2;
      if (closed) g.closePath();
      g.stroke(); if (closed) g.fill();
    };
    const key = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); finish(null); }
      else if (e.key === 'Enter' && shape === 'polyline' && pts.length >= 2) { e.preventDefault(); e.stopPropagation(); finish(toRing(pts)); }
      else if (e.key === 'Enter' && shape === 'polygon' && pts.length >= 3) { e.preventDefault(); e.stopPropagation(); finish(toRing(pts)); }
    };
    window.addEventListener('keydown', key, true);
    cv.addEventListener('contextmenu', (e) => { e.preventDefault(); finish(null); });
    cv.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      const p = local(e);
      if (shape === 'lasso' || shape === 'box') { down = true; pts = [p]; if (shape === 'box') pts.push(p); cv.setPointerCapture(e.pointerId); paint(); }
      else if (shape === 'polygon') { if (e.detail >= 2 && pts.length >= 3) { finish(toRing(pts)); return; } pts.push(p); paint(); }
      else if (shape === 'polyline') { if (e.detail >= 2 && pts.length >= 2) { finish(toRing(pts)); return; } pts.push(p); paint(); }
      else if (shape === 'line') { pts.push(p); if (pts.length === 2) finish(toRing(pts)); else paint(); }
    });
    cv.addEventListener('pointermove', (e) => {
      const p = local(e);
      if (down) { if (shape === 'lasso') pts.push(p); else pts[1] = p; paint(); }
      else if (shape === 'polygon' || shape === 'line' || shape === 'polyline') { hover = p; paint(); }
    });
    cv.addEventListener('pointerup', () => {
      if (!down) return;
      down = false;
      if (shape === 'lasso') {
        const s = thin(pts, 3);
        if (s.length < 3) return finish(null);
        finish(toRing(s));
      } else {
        const [a, b] = pts;
        if (Math.abs(a.x - b.x) < 3 || Math.abs(a.y - b.y) < 3) return finish(null);
        finish(toRing([a, { x: b.x, y: a.y }, b, { x: a.x, y: b.y }]));
      }
    });
    ctx.api.onDeactivate(() => finish(null));
  });
}
