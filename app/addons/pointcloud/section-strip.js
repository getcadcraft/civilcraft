/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section-strip.js — a thin slice of the cloud in elevation (spec § 6): draw a line in the plan (or in the 3D view over the ground), the
 * points within half the strip width of it are shown against station and height, coloured by class, with the built ground as a line.
 * The way a ditch or a kerb is checked by eye. First pass: one strip, no pan or zoom, not yet shown in the terrain section sheet.
 */
import { el, field, numInput } from './ui.js';
import { drawRing } from './overlay.js';
import { fmtN, fmt } from './ctx.js';

const CLS = { 1: '#999', 2: '#a06e3c', 3: '#78c85a', 4: '#32a03c', 5: '#0a6428', 6: '#dc5046', 7: '#e628c8', 9: '#3c78e6', 18: '#ff8200' };

export function mountSection(ctx) {
  const t = ctx.t;
  const width = numInput(2, { min: 0.1, step: 0.5, 'data-pc-sec-width': '' });
  const cv = el('canvas', { className: 'pc-strip', width: 640, height: 240, 'data-pc-strip': '' });
  const out = el('div', { className: 'pc-note', 'data-pc-strip-out': '', role: 'status' });
  const draw = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-strip-draw': '', onclick: async () => {
    const ring = await drawRing(ctx, 'line', { message: t('pc.sec.draw') });
    if (ring && ring.length === 2) await show(ring[0], ring[1], Number(width.value));
  } }, t('pc.sec.line'));
  ctx.on('cloud', () => { draw.disabled = !ctx.cloud; out.textContent = ''; cv.getContext('2d').clearRect(0, 0, cv.width, cv.height); });

  async function show(A, B, w) {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
    if (!(L > 0)) return;
    const ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L, h = w / 2;
    const bb = [Math.min(A[0], B[0]) - h, Math.min(A[1], B[1]) - h, Math.max(A[0], B[0]) + h, Math.max(A[1], B[1]) + h];
    out.textContent = t('pc.v.working');
    const r = await ctx.cloud.readRegion(bb);
    const S = [], Z = [], C = [];
    for (let k = 0; k < r.n; k++) {
      const dx = r.x[k] - A[0], dy = r.y[k] - A[1], s = dx * ux + dy * uy, o = -dx * uy + dy * ux;
      if (s < 0 || s > L || Math.abs(o) > h) continue;
      S.push(s); Z.push(r.z[k]); C.push(r.cls[k]);
    }
    const g = cv.getContext('2d'), W = cv.width, H = cv.height, pad = 28;
    g.clearRect(0, 0, W, H);
    if (!S.length) { out.textContent = t('pc.sec.none'); return; }
    let z0 = Infinity, z1 = -Infinity; for (const z of Z) { if (z < z0) z0 = z; if (z > z1) z1 = z; }
    const surf = ctx.surface;
    const prof = [];
    if (surf) for (let i = 0; i <= 200; i++) { const s = (L * i) / 200, z = surf.elevationAt(A[0] + ux * s, A[1] + uy * s, 1e-6); if (z != null) { prof.push([s, z]); if (z < z0) z0 = z; if (z > z1) z1 = z; } }
    const zr = Math.max(z1 - z0, 0.5), X = (s) => pad + (s / L) * (W - 2 * pad), Y = (z) => H - pad - ((z - z0) / zr) * (H - 2 * pad);
    for (let k = 0; k < S.length; k++) { g.fillStyle = CLS[C[k]] || '#888'; g.fillRect(X(S[k]) - 1, Y(Z[k]) - 1, 2, 2); }
    if (prof.length) { g.strokeStyle = '#1e48c8'; g.lineWidth = 2; g.beginPath(); prof.forEach(([s, z], i) => (i ? g.lineTo(X(s), Y(z)) : g.moveTo(X(s), Y(z)))); g.stroke(); }
    g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#111';
    g.font = '11px sans-serif';
    g.fillText(fmt(z0, 2), 2, H - pad + 4); g.fillText(fmt(z1, 2), 2, pad - 4); g.fillText('0', pad, H - 8); g.fillText(fmt(L, 1), W - pad - 24, H - 8);
    out.textContent = t('pc.sec.out', { n: fmtN(S.length), len: fmt(L, 1), w: fmt(w, 1), z0: fmt(z0, 2), z1: fmt(z1, 2) }) + (prof.length ? ' ' + t('pc.sec.tin') : '');
  }
  return el('details', { 'data-pc-sec': 'strip' }, el('summary', {}, t('pc.sec.strip')), el('p', { className: 'pc-note' }, t('pc.sec.what')), field(t('pc.sec.width'), width), el('div', { className: 'pc-row' }, draw), cv, out);
}
