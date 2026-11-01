/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cadplan.js — truss drawings as plain CadCraft entities (DOM-free; pure; imports no app code). The CadCraft host adds them to the drawing with
 * doc.add inside one doc.change, so they are real lines, closed polylines, text, hatches and dimensions on layers, and DXF / DWG out is CadCraft's own.
 * Everything is given in mm and placed with { at: [x, y], k } — k = drawing units per mm (1 for a drawing in mm), at = where the drawing's origin lands.
 *
 *   LAYERS                                              the layers the drawings use { name: { color (ACI), linetype? } }
 *   elevationEnts(d, { at, k, st, textH })              one truss elevation: member outlines (poly), plate rectangles (solid hatch), marks, node numbers,
 *                                                       span / heel / panel dimensions (dim) and the not-a-design label
 *   forceEnts(d, { at, k, textH })                      the member force diagram: centre-lines on TRUSS-TENSION / TRUSS-COMPRESSION with the force in kN
 *   layoutEnts(layout, designs, { at, k, st, textH })   the roof truss layout plan: the outline, a line per truss with its id, the bay dimension
 *   tableEnts(rows, { at, k, textH, widths })           a schedule as a grid of lines and text (rows[0] is the heading)
 *   scheduleRows(d)                                     the cut list + joint schedule of one design as table rows
 */
import { t } from './core.js';
import { sizeById, PLATES } from './tables.js';
import { cutList, jointSchedule } from './cutlist.js';

export const LAYERS = {
  'TRUSS-MEMBERS': { color: 3 }, 'TRUSS-PLATES': { color: 1 }, 'TRUSS-DIMS': { color: 5 }, 'TRUSS-TEXT': { color: 7 },
  'TRUSS-FORCES': { color: 6 }, 'TRUSS-TENSION': { color: 1 }, 'TRUSS-COMPRESSION': { color: 5 }, 'TRUSS-LAYOUT': { color: 4 }, 'TRUSS-TABLE': { color: 8 },
};
const groupOf = (r) => (r === 'tail' ? 'top' : r === 'post' || r === 'stub' ? 'web' : r);
const round1 = (v) => Math.round(v * 10) / 10;

function maker({ at = [0, 0], k = 1, st = null }) {
  const P = (x, y) => ({ x: at[0] + x * k, y: at[1] + y * k });
  return {
    P,
    line: (layer, x1, y1, x2, y2) => ({ type: 'line', layer, x1: at[0] + x1 * k, y1: at[1] + y1 * k, x2: at[0] + x2 * k, y2: at[1] + y2 * k }),
    poly: (layer, pts, closed = true) => ({ type: 'poly', layer, pts: pts.map(([x, y]) => P(x, y)), closed }),
    text: (layer, x, y, s, h, o = {}) => ({ type: 'text', layer, x: at[0] + x * k, y: at[1] + y * k, h: h * k, rot: o.rot || 0, s: String(s), ha: o.ha || 'center', va: o.va || 'middle' }),
    hatch: (layer, pts) => ({ type: 'hatch', layer, solid: true, loops: [pts.flatMap(([x, y]) => [at[0] + x * k, at[1] + y * k])] }),
    dim: (layer, x1, y1, x2, y2, lx, ly, rot = 0) => ({ type: 'dim', kind: 'linear', layer, color: null, p1: P(x1, y1), p2: P(x2, y2), loc: P(lx, ly), rot, text: '', st: { ...(st || {}) } }),
  };
}

export function elevationEnts(d, o = {}) {
  const M = maker(o), g = d.g, raise = d.heel ? d.heel.raise || 0 : 0, th = o.textH || 60, out = [];
  const zs = g.nodes.map((n) => n.z + raise), zlo = Math.min(0, ...zs);
  for (const m of g.members) {
    const a = g.nodes[m.a], b = g.nodes[m.b], size = sizeById(d.sizes[groupOf(m.role)]) || sizeById('2x4');
    const dx = b.x - a.x, dz = b.z - a.z, L = Math.hypot(dx, dz), nx = -dz / L * size.d / 2, nz = dx / L * size.d / 2;
    out.push(M.poly('TRUSS-MEMBERS', [[a.x + nx, a.z + nz + raise], [b.x + nx, b.z + nz + raise], [b.x - nx, b.z - nz + raise], [a.x - nx, a.z - nz + raise]]));
    out.push(M.text('TRUSS-TEXT', (a.x + b.x) / 2, (a.z + b.z) / 2 + raise + size.d / 2 + th * 0.8, m.mark || '', th * 0.8));
  }
  const js = jointSchedule(g, d.sizes, d.res, d.opts && d.opts.plates ? d.opts.plates : null);
  const list = d.opts && d.opts.plates && d.opts.plates.list ? d.opts.plates.list : PLATES;
  for (const j of js) {
    const p = list.find((q) => q.id === j.plate);
    if (!p) continue;
    const n = g.nodes[j.node], z = n.z + raise;
    out.push(M.hatch('TRUSS-PLATES', [[n.x - p.w / 2, z - p.h / 2], [n.x + p.w / 2, z - p.h / 2], [n.x + p.w / 2, z + p.h / 2], [n.x - p.w / 2, z + p.h / 2]]));
  }
  for (const n of g.nodes) out.push(M.text('TRUSS-TEXT', n.x, n.z + raise - th * 1.6, String(n.id + 1), th * 0.7));
  const yb = zlo - 350;
  out.push(M.dim('TRUSS-DIMS', 0, zlo, g.span, zlo, g.span / 2, yb));
  if (g.overhang > 0) out.push(M.dim('TRUSS-DIMS', -g.overhang, zlo, 0, zlo, -g.overhang / 2, yb + 250));
  const peak = Math.max(...zs);
  out.push(M.dim('TRUSS-DIMS', g.span, zlo, g.span, peak, g.span + 450, peak / 2, Math.PI / 2));
  if (raise > 0) out.push(M.text('TRUSS-TEXT', -120, raise / 2, t('dwg.heel') + ' +' + Math.round(raise), th * 0.7, { ha: 'right' }));
  out.push(M.text('TRUSS-TEXT', 0, peak + 500, t('dwg.title', { type: g.type }), th * 1.4, { ha: 'left' }));
  out.push(M.text('TRUSS-TEXT', 0, zlo - 850, t('label.notdesign'), th, { ha: 'left' }));
  return out;
}

export function forceEnts(d, o = {}) {
  const M = maker(o), g = d.g, raise = d.heel ? d.heel.raise || 0 : 0, th = o.textH || 60, out = [], F = d.res && d.res.forces;
  for (const m of g.members) {
    const a = g.nodes[m.a], b = g.nodes[m.b], fr = F && F.get ? F.get(m.id) : null, tail = m.role === 'tail';
    const layer = fr === null || fr === undefined || tail ? 'TRUSS-FORCES' : fr >= 0 ? 'TRUSS-TENSION' : 'TRUSS-COMPRESSION';
    out.push(M.line(layer, a.x, a.z + raise, b.x, b.z + raise));
    if (fr !== null && fr !== undefined && !tail) out.push(M.text('TRUSS-FORCES', (a.x + b.x) / 2, (a.z + b.z) / 2 + raise + th * 1.2, round1(fr) + ' kN', th * 0.8));
  }
  const peak = Math.max(...g.nodes.map((n) => n.z + raise));
  out.push(M.text('TRUSS-FORCES', 0, peak + 400, t('cad.forces.title', { type: g.type }), th * 1.2, { ha: 'left' }));
  out.push(M.text('TRUSS-FORCES', 0, peak + 250, t('cad.forces.key'), th * 0.8, { ha: 'left' }));
  return out;
}

export function layoutEnts(layout, designs, o = {}) {
  const M = maker(o), th = o.textH || 150, out = [];
  if (o.outline) out.push(M.poly("TRUSS-LAYOUT", o.outline));
  for (const tr of layout.trusses) {
    out.push(M.line('TRUSS-LAYOUT', tr.a[0], tr.a[1], tr.b[0], tr.b[1]));
    const dx = tr.b[0] - tr.a[0], dy = tr.b[1] - tr.a[1], L = Math.hypot(dx, dy) || 1;
    out.push(M.text('TRUSS-TEXT', tr.a[0] + dx / 2 + (-dy / L) * th, tr.a[1] + dy / 2 + (dx / L) * th, tr.id, th * 0.8, { rot: Math.atan2(dy, dx) }));
  }
  const tr = layout.trusses;
  if (tr.length > 1) {
    const a = tr[0], b = tr[1], sp = Math.hypot(b.a[0] - a.a[0], b.a[1] - a.a[1]);
    if (sp > 1) out.push(M.dim('TRUSS-DIMS', a.a[0], a.a[1], b.a[0], b.a[1], (a.a[0] + b.a[0]) / 2 - 600, (a.a[1] + b.a[1]) / 2 - 600, 0));
  }
  out.push(M.text('TRUSS-TEXT', 0, -900, t('cad.layout.title', { n: tr.length }), th * 1.3, { ha: 'left' }));
  out.push(M.text('TRUSS-TEXT', 0, -1150, t('label.notdesign'), th, { ha: 'left' }));
  return out;
}

export function tableEnts(rows, o = {}) {
  const M = maker(o), th = o.textH || 60, rh = th * 2, out = [];
  const cols = rows.reduce((n, r) => Math.max(n, r.length), 0);
  const widths = o.widths || Array.from({ length: cols }, (_, c) => Math.max(500, ...rows.map((r) => String(r[c] ?? '').length * th * 0.75 + th)));
  const total = widths.reduce((a, b) => a + b, 0);
  for (let r = 0; r <= rows.length; r++) out.push(M.line('TRUSS-TABLE', 0, -r * rh, total, -r * rh));
  let x = 0;
  for (let c = 0; c <= cols; c++) { out.push(M.line('TRUSS-TABLE', x, 0, x, -rows.length * rh)); x += widths[c] || 0; }
  rows.forEach((row, r) => { let cx = 0; row.forEach((cell, c) => { out.push(M.text('TRUSS-TABLE', cx + th * 0.4, -r * rh - rh / 2, cell ?? '', th, { ha: 'left' })); cx += widths[c]; }); });
  return out;
}

export function scheduleRows(d) {
  const cuts = cutList(d.g, d.sizes, { stock: 1e9 }), js = jointSchedule(d.g, d.sizes, d.res, d.opts && d.opts.plates ? d.opts.plates : null);
  return [
    [t('cad.col.mark'), t('cad.col.size'), t('cad.col.cut'), t('cad.col.angles')],
    ...cuts.map((r) => [r.mark, r.size, String(r.cutLen), `${r.cutA} / ${r.cutB}`]),
    [],
    [t('cad.col.joint'), t('cad.col.force'), t('cad.col.plate'), t('cad.col.source')],
    ...js.map((j) => [String(j.node + 1), String(j.maxForce), j.plate || t('cad.beyond'), j.source || '']),
  ];
}
