/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drawing.js — one truss elevation to scale as SVG (DOM-free; pure).
 *   elevationSvg(g, sizes, { raise, title, note, forces, scale }) → string
 * Members are drawn at their sawn depth about the centre-line, marks beside them, joints numbered, with span, rise, pitch, heel and overhang dimensions
 * and the not-a-design label on the sheet. Words come from the add-on's language file (core.t).
 */
import { t } from './core.js';
import { sizeById } from './tables.js';

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const f = (v) => Math.round(v * 10) / 10;

export function elevationSvg(g, sizes, { raise = 0, title = '', forces = null, width = 900 } = {}) {
  const hasStub = !!(g.bearings && g.bearings.length), xs = g.nodes.map((n) => n.x), zs = g.nodes.map((n) => n.z + raise);
  const x0 = Math.min(...xs) - 300, x1 = Math.max(...xs) + 300, z0 = Math.min(0, ...zs) - 250, z1 = Math.max(...zs) + 600;
  const k = (width - 80) / (x1 - x0), H = (z1 - z0) * k + 150;
  const X = (x) => f((x - x0) * k + 40), Z = (z) => f((z1 - z) * k + 40);
  const out = [];
  for (const m of g.members) {
    const a = g.nodes[m.a], b = g.nodes[m.b], size = sizeById(sizes[m.role === 'post' || m.role === 'tail' || m.role === 'stub' ? (m.role === 'tail' ? 'top' : 'web') : m.role]) || sizeById('2x4');
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), nx = -dz / L * size.d / 2, nz = dx / L * size.d / 2;
    const pts = [[a.x + nx, a.z + nz], [b.x + nx, b.z + nz], [b.x - nx, b.z - nz], [a.x - nx, a.z - nz]].map((p) => X(p[0]) + ',' + Z(p[1] + raise)).join(' ');
    const fill = m.role === 'top' || m.role === 'tail' ? '#e8d3b4' : m.role === 'bottom' ? '#dfe8c4' : '#cfe0ee';
    out.push(`<polygon points="${pts}" fill="${fill}" stroke="#333" stroke-width="0.8"/>`);
    const mx = (a.x + b.x) / 2, mz = (a.z + b.z) / 2 + raise, fr = forces && forces.get ? forces.get(m.id) : null;
    out.push(`<text x="${X(mx)}" y="${Z(mz) - 3}" font-size="9" text-anchor="middle" fill="#222">${esc(m.mark || '')}${fr === null || fr === undefined || m.role === 'tail' ? '' : ' ' + f(fr) + ' kN'}</text>`);
  }
  for (const n of g.nodes) out.push(`<circle cx="${X(n.x)}" cy="${Z(n.z + raise)}" r="2.2" fill="#c00"/><text x="${X(n.x) + 4}" y="${Z(n.z + raise) + 12}" font-size="8" fill="#c00">${n.id + 1}</text>`);
  // bearings
  const [s0, s1] = g.supports;
  for (const s of [s0, s1]) if (s >= 0) out.push(`<path d="M${X(g.nodes[s].x) - 7},${Z(-60) + 0} h14 l-7,-12 z" fill="none" stroke="#000"/>`);
  if (raise > 0 && !(g.bearings && g.bearings.length)) for (const s of [s0, s1]) if (s >= 0) out.push(`<line x1="${X(g.nodes[s].x)}" y1="${Z(raise)}" x2="${X(g.nodes[s].x)}" y2="${Z(0)}" stroke="#555" stroke-dasharray="3 2"/>`);
  // dimensions
  const dim = (xa, xb, y, label) => `<line x1="${X(xa)}" y1="${y}" x2="${X(xb)}" y2="${y}" stroke="#06c"/><text x="${X((xa + xb) / 2)}" y="${y - 3}" font-size="10" text-anchor="middle" fill="#06c">${esc(label)}</text>`;
  const yb = Z(z0 + 100) + 28;
  out.push(dim(0, g.span, yb, t('dwg.span') + ' ' + Math.round(g.span) + ' mm'));
  if (g.overhang > 0) out.push(dim(-g.overhang, 0, yb + 18, t('dwg.overhang') + ' ' + Math.round(g.overhang) + ' mm'));
  const peakZ = Math.max(...g.nodes.map((n) => n.z));
  out.push(`<text x="${X(g.span / 2)}" y="${Z(peakZ + raise) - 20}" font-size="10" text-anchor="middle" fill="#06c">${esc(t('dwg.pitch'))} ${f(g.pitch)}° · ${esc(t('dwg.rise'))} ${Math.round(peakZ)} mm</text>`);
  if (raise > 0) out.push(`<text x="${X(0) - 4}" y="${Z(raise / 2)}" font-size="9" text-anchor="end" fill="#06c">${esc(t('dwg.heel'))} +${Math.round(raise)}</text>`);
  out.push(`<text x="40" y="18" font-size="13" font-weight="bold">${esc(title || t('dwg.title', { type: g.type }))}</text>`);
  out.push(`<text x="40" y="${f(H - 28)}" font-size="9" fill="#900">${esc(t('label.notdesign'))}</text>`);
  out.push(`<text x="40" y="${f(H - 14)}" font-size="9" fill="#555">${esc(t('dwg.sizes', { top: sizes.top, bottom: sizes.bottom, web: sizes.web }))}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${f(H)}" width="${width}" height="${f(H)}" role="img" aria-label="${esc(t('dwg.title', { type: g.type }))}" font-family="sans-serif"><rect width="100%" height="100%" fill="#fff"/>${out.join('')}</svg>`;
}
