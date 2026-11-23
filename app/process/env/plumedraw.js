/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plumedraw.js — the plume contours as drawing entities (0.8 Track CH, CH.19; DOM-free). A host (CadCraft's P&ID add-on, CivilCraft's site plan) draws them.
 *   plumeDrawing({ shapes (dispersion.toPlan(…).shapes), stack: { x, y, label }, windFrom (deg clockwise from north), receptors?, scale = 1, layer = 'AIR' })
 *   → { entities: [{ type: 'polyline' | 'line' | 'circle' | 'text', layer, … }], legend: [{ layer, label }], extent }
 * Units are the site coordinates of the shapes times `scale` (use 1000 for a drawing in mm). It adds the stack marker, a wind arrow that points the way the wind
 * blows, a label at the far end of each contour (level, reach) and a note that this is a stability-class screening, not AERMOD.
 */
export function plumeDrawing({ shapes, stack, windFrom, receptors = [], scale = 1, layer = 'AIR' }) {
  const E = [], legend = [], toAz = ((windFrom + 180) % 360) * Math.PI / 180, dx = Math.sin(toAz), dy = Math.cos(toAz);
  let minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity; const ext = (x, y) => { minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y); };
  for (const s of shapes) {
    const L = `${layer}-PLUME-${String(s.level).replace(/[^0-9A-Za-z.]/g, '_')}`; legend.push({ layer: L, label: s.label });
    E.push({ type: 'polyline', layer: L, closed: true, points: s.polygon.map((p) => [p[0] * scale, p[1] * scale]), id: s.id });
    for (const p of s.polygon) ext(p[0] * scale, p[1] * scale);
    const far = s.polygon.reduce((a, p) => ((p[0] - stack.x) * dx + (p[1] - stack.y) * dy > (a[0] - stack.x) * dx + (a[1] - stack.y) * dy ? p : a), s.polygon[0]);
    E.push({ type: 'text', layer: layer + '-TEXT', x: far[0] * scale, y: far[1] * scale, text: `${s.label}, reach ${s.reach.toFixed(0)} m`, h: 3 * scale });
  }
  const sx = stack.x * scale, sy = stack.y * scale, len = 30 * scale; ext(sx, sy);
  E.push({ type: 'circle', layer: layer + '-STACK', cx: sx, cy: sy, r: 1.5 * scale }, { type: 'text', layer: layer + '-TEXT', x: sx + 2 * scale, y: sy - 4 * scale, text: stack.label || 'Stack', h: 3 * scale });
  const ax = sx + dx * len, ay = sy + dy * len, hx = 0.25 * len;
  E.push({ type: 'line', layer: layer + '-WIND', x1: sx, y1: sy, x2: ax, y2: ay }, { type: 'line', layer: layer + '-WIND', x1: ax, y1: ay, x2: ax - hx * (dx * 0.87 - dy * 0.5), y2: ay - hx * (dy * 0.87 + dx * 0.5) }, { type: 'line', layer: layer + '-WIND', x1: ax, y1: ay, x2: ax - hx * (dx * 0.87 + dy * 0.5), y2: ay - hx * (dy * 0.87 - dx * 0.5) });
  E.push({ type: 'text', layer: layer + '-TEXT', x: ax, y: ay, text: `Wind from ${windFrom.toFixed(0)} deg`, h: 3 * scale });
  for (const r of receptors) { E.push({ type: 'circle', layer: layer + '-RECEPTOR', cx: r.x * scale, cy: r.y * scale, r: 1 * scale }, { type: 'text', layer: layer + '-TEXT', x: r.x * scale + 1.5 * scale, y: r.y * scale, text: `${r.id}${r.c != null ? ' ' + r.c.toPrecision(3) + ' ug/m3' : ''}`, h: 2.5 * scale }); ext(r.x * scale, r.y * scale); }
  E.push({ type: 'text', layer: layer + '-TEXT', x: minx, y: miny - 6 * scale, text: 'Stability-class screening, not AERMOD. Not an engineering approval.', h: 2.5 * scale });
  return { entities: E, legend, extent: { minx, miny, maxx, maxy } };
}
