/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view3d.js — a 3D view of the truss layout as an SVG wireframe, no WebGL needed (DOM-free; pure).
 *   layoutSegments(layout, geomBySpan, z0) → [{ a: [x, y, z], b: [x, y, z], role }]  (mm, plan x y + height z)
 *   project(segs, { az, el }) → { lines: [{ x1, y1, x2, y2, role }], w, h }
 *   toSvg(segs, { az, el, size }) → string
 */
export function layoutSegments(layout, geomFor, z0 = 0) {
  const out = [];
  for (const t of layout.trusses) {
    const g = geomFor(t.span, t);
    if (!g) continue;
    const dx = (t.b[0] - t.a[0]) / t.span, dy = (t.b[1] - t.a[1]) / t.span;
    for (const m of g.members) {
      const p = (id) => { const n = g.nodes[id]; return [t.a[0] + dx * n.x, t.a[1] + dy * n.x, z0 + n.z + (g.raise || 0) + (t.zBase || 0)]; };
      out.push({ a: p(m.a), b: p(m.b), role: m.role, truss: t.id });
    }
  }
  return out;
}

export function project(segs, { az = 35, el = 30 } = {}) {
  const A = az * Math.PI / 180, E = el * Math.PI / 180, ca = Math.cos(A), sa = Math.sin(A), ce = Math.cos(E), se = Math.sin(E);
  const pt = (p) => { const x = p[0] * ca - p[1] * sa, y = p[0] * sa + p[1] * ca; return [x, -(p[2] * ce + y * se)]; };
  const lines = segs.map((s) => { const a = pt(s.a), b = pt(s.b); return { x1: a[0], y1: a[1], x2: b[0], y2: b[1], role: s.role }; });
  const xs = lines.flatMap((l) => [l.x1, l.x2]), ys = lines.flatMap((l) => [l.y1, l.y2]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  return { lines, x0, y0, w: x1 - x0 || 1, h: y1 - y0 || 1 };
}

export function toSvg(segs, { az = 35, el = 30, size = 520 } = {}) {
  if (!segs.length) return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"></svg>';
  const pr = project(segs, { az, el }), pad = 20, k = (size - 2 * pad) / Math.max(pr.w, pr.h), W = pr.w * k + 2 * pad, H = pr.h * k + 2 * pad;
  const col = { top: '#a0522d', bottom: '#6b8e23', web: '#4682b4', post: '#4682b4', tail: '#a0522d' };
  const f = (v) => Math.round(v * 10) / 10;
  const body = pr.lines.map((l) => `<line x1="${f((l.x1 - pr.x0) * k + pad)}" y1="${f((l.y1 - pr.y0) * k + pad)}" x2="${f((l.x2 - pr.x0) * k + pad)}" y2="${f((l.y2 - pr.y0) * k + pad)}" stroke="${col[l.role] || '#888'}" stroke-width="${l.role === 'web' || l.role === 'post' ? 1 : 1.6}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(W)} ${f(H)}" width="${f(W)}" height="${f(H)}" role="img" aria-label="Truss layout">${body}</svg>`;
}
