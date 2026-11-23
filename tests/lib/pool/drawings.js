/* SPDX-License-Identifier: Apache-2.0 */
/**
 * drawings.js — the plan and the long section of a pool as plain 2D entities (0.11 POOL.1 / POOL.3). Host-free; millimetres, y up.
 *   { type: 'line', layer, a: [x, y], b: [x, y] } · { type: 'poly', layer, pts: [[x, y]…], closed } · { type: 'text', layer, at, h, s, ha } ·
 *   { type: 'dim', layer, p1, p2, loc, rot }
 * CadCraft's host turns them into real entities; the panel draws the same list as its preview.
 */
import { floorZ } from './build.js';
import { edges, offset, longestAtY } from './plan.js';

export const LAYERS = {
  'POOL-SHELL': { color: 8 }, 'POOL-WATER': { color: 5 }, 'POOL-FINISH': { color: 4 }, 'POOL-SURROUND': { color: 9 }, 'POOL-ROOM': { color: 8 }, 'POOL-EQUIP': { color: 6 },
  'POOL-PIPE-SUCTION': { color: 3 }, 'POOL-PIPE-RETURN': { color: 5 }, 'POOL-TEXT': { color: 7 }, 'POOL-DIMS': { color: 2 },
};
const PIPE_LAYER = { surface: 'POOL-PIPE-SUCTION', drain: 'POOL-PIPE-SUCTION', overflow: 'POOL-PIPE-SUCTION', ret: 'POOL-PIPE-RETURN', jet: 'POOL-PIPE-RETURN' };
const rectPts = (r) => [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]];
const grow = (r, o) => [r[0] - o, r[1] - o, r[2] + o, r[3] + o];
const round = (c, r, n = 16) => Array.from({ length: n }, (_, i) => [c[0] + r * Math.cos((2 * Math.PI * i) / n), c[1] + r * Math.sin((2 * Math.PI * i) / n)]);
const m = (mm) => (mm / 1000).toFixed(2);

/** The plan. words = { depth, room, filter, pump, tank, panel, gate } (already in the person's language); fmt(mm) prints a length (metres by default). */
export function planEnts(result, words = {}, fmt = null) {
  const d = result.design, { layout } = result.built, steps = result.steps, out = [];
  const W = { depth: 'depth', room: 'Machine room', filter: 'Filter', pump: 'Pump', tank: 'Balance tank', panel: 'Panel', gate: 'Gate', ...words };
  const F = fmt || ((mm) => m(mm));
  const poly = (layer, pts, closed = true) => out.push({ type: 'poly', layer, pts, closed });
  const text = (at, s, h = 150, ha = 'center') => out.push({ type: 'text', layer: 'POOL-TEXT', at, h, s: String(s), ha });
  const L = d.length, B = d.width, e0 = d.finish + d.wall, P = layout.poly || rectPts(layout.rect);
  poly('POOL-WATER', P);
  const shell = layout.rings && layout.rings.shell ? layout.rings.shell : rectPts(grow(layout.rect, e0));
  poly('POOL-SHELL', shell);
  if (layout.rings && layout.rings.outer) poly('POOL-SHELL', layout.rings.outer); else if (layout.outer[0] < -e0 - 1 && !layout.rings) poly('POOL-SHELL', rectPts(layout.outer));
  if (d.overflow !== 'gutter' || d.kind !== 'pool') poly('POOL-SURROUND', (layout.rings && layout.rings.coping) || offset(P, d.copingWidth) || P);
  if (d.pavingWidth > 0 && layout.rings && layout.rings.paving) poly('POOL-SURROUND', layout.rings.paving);
  // the sides, numbered: steps and benches are placed by side
  edges(P).forEach((e) => { const c = [(e.a[0] + e.b[0]) / 2 - e.n[0] * 220, (e.a[1] + e.b[1]) / 2 - e.n[1] * 220]; if (P.length <= 24 || e.i % Math.ceil(P.length / 12) === 0) text(c, e.i + 1, 100); });
  if (steps && !steps.nofit && steps.plain) {
    for (let k = 1; k <= steps.treads; k++) out.push({ type: 'line', layer: 'POOL-FINISH', a: [k * steps.tread, 0], b: [k * steps.tread, steps.width] });
    if (steps.width < B) out.push({ type: 'line', layer: 'POOL-FINISH', a: [0, steps.width], b: [steps.run, steps.width] });
  } else if (steps && !steps.nofit && steps.plan) {
    poly('POOL-FINISH', steps.plan);
    const [s0, s1] = steps.plan, inw = [-steps.n[0], -steps.n[1]];
    for (let k = 1; k <= steps.treads; k++) out.push({ type: 'line', layer: 'POOL-FINISH', a: [s0[0] + inw[0] * k * steps.tread, s0[1] + inw[1] * k * steps.tread], b: [s1[0] + inw[0] * k * steps.tread, s1[1] + inw[1] * k * steps.tread] });
  }
  for (const b of result.benches || []) if (b.fits) poly('POOL-FINISH', b.plan);
  if (layout.gate) { poly('POOL-SURROUND', layout.gate.plan); text([layout.gate.at[0], layout.gate.at[1]], W.gate, 90); }
  for (const p of layout.skimmers) poly('POOL-EQUIP', rectPts([p[0] - 125, p[1] - 125, p[0] + 125, p[1] + 125]));
  for (const p of layout.inlets) poly('POOL-EQUIP', round(p, 60, 8));
  for (const p of layout.drains) poly('POOL-EQUIP', rectPts([p[0] - 150, p[1] - 150, p[0] + 150, p[1] + 150]));
  for (const p of layout.jets) poly('POOL-EQUIP', round(p, 80, 12));
  poly('POOL-ROOM', rectPts(layout.room.outer)); poly('POOL-ROOM', rectPts(layout.room.inner));
  for (const it of layout.room.items) {
    if (it.kind === 'filter') poly('POOL-EQUIP', round([it.at[0], it.at[1]], it.wu / 2, 24)); else poly('POOL-EQUIP', rectPts(it.rect));
    text([it.at[0], it.at[1]], it.kind === 'filter' ? W.filter + ' ' + it.n : it.kind === 'pump' ? W.pump + ' ' + it.n : it.kind === 'tank' ? W.tank : W.panel, 90);
  }
  const ro = layout.room.outer;
  text([(ro[0] + ro[2]) / 2, ro[3] + 250], W.room, 180);
  const PL = { suction: 'POOL-PIPE-SUCTION', return: 'POOL-PIPE-RETURN', link: 'POOL-PIPE-RETURN' };
  if (result.net) {
    for (const sg of result.net.segments) if (Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1]) > 1) poly(PIPE_LAYER[sg.system] || PL[sg.side] || 'POOL-PIPE-RETURN', [[sg.a[0], sg.a[1]], [sg.b[0], sg.b[1]]], false);
  } else for (const p of layout.pipes) poly(PIPE_LAYER[p.system], p.pts.map((q) => [q[0], q[1]]), false);
  for (const p of layout.pipes) if (p.pts.length >= 2 && Math.hypot(p.pts[1][0] - p.pts[0][0], p.pts[1][1] - p.pts[0][1]) > 1500) text([(p.pts[0][0] + p.pts[1][0]) / 2, (p.pts[0][1] + p.pts[1][1]) / 2 + 120], 'DN' + p.dn, 100);
  text([L / 2, B / 2 + 250], d.name, 250);
  text([L / 2, B / 2 - 150], F(L) + ' x ' + F(B) + (fmt ? '' : ' m'), 180);
  text([Math.min(600, L / 6), B / 2], W.depth + ' ' + F(d.depthShallow), 120, 'left');
  if (d.depthDeep !== d.depthShallow) text([L - Math.min(600, L / 6), B / 2], W.depth + ' ' + F(d.depthDeep), 120, 'right');
  const off = -layout.outer[0] + d.pavingWidth + 500;
  out.push({ type: 'dim', layer: 'POOL-DIMS', p1: [0, 0], p2: [L, 0], loc: [L / 2, -off], rot: 0 });
  out.push({ type: 'dim', layer: 'POOL-DIMS', p1: [0, 0], p2: [0, B], loc: [-off, B / 2], rot: 90 });
  return out;
}

/** The long section on the centre line: x along the drawing's x, level along its y, set down by `drop` so it sits under the plan. */
export function sectionEnts(result, { drop = 0, words = {} } = {}) {
  const d = result.design, steps = result.steps, out = [];
  const W = { section: 'Long section', water: 'water line', ...words };
  const tf = d.finish, e0 = tf + d.wall, zt = -d.copingThickness;
  const P = (result.built && result.built.layout.poly) || [[0, 0], [d.length, 0], [d.length, d.width], [0, d.width]];
  const span = longestAtY(P, d.width / 2) || [0, d.length], xa = span[0], xb = span[1];
  const zf = (x) => floorZ(d, x), zs = (x) => zf(x) - tf;
  const Y = (z) => z - drop;
  const poly = (layer, pts, closed = true) => out.push({ type: 'poly', layer, pts: pts.map(([x, z]) => [x, Y(z)]), closed });
  const top = [[xa - e0, zs(xa)], [xa, zs(xa)], [xb, zs(xb)], [xb + e0, zs(xb)]];
  poly('POOL-SHELL', [...top, ...top.map(([x, z]) => [x, z - d.floor]).reverse()]);
  poly('POOL-SHELL', [[xa - e0, zs(xa)], [xa - tf, zs(xa)], [xa - tf, zt], [xa - e0, zt]]);
  poly('POOL-SHELL', [[xb + tf, zs(xb)], [xb + e0, zs(xb)], [xb + e0, zt], [xb + tf, zt]]);
  poly('POOL-FINISH', [[xa, zt], [xa, zf(xa)], [xb, zf(xb)], [xb, zt]], false);
  if (steps && !steps.nofit && steps.plain) poly('POOL-FINISH', steps.profile);
  out.push({ type: 'line', layer: 'POOL-WATER', a: [xa, Y(-d.freeboard)], b: [xb, Y(-d.freeboard)] });
  poly('POOL-SURROUND', [[xa - d.copingWidth, zt], [xa, zt], [xa, 0], [xa - d.copingWidth, 0]]);
  poly('POOL-SURROUND', [[xb, zt], [xb + d.copingWidth, zt], [xb + d.copingWidth, 0], [xb, 0]]);
  const xm = (xa + xb) / 2;
  out.push({ type: 'text', layer: 'POOL-TEXT', at: [xm, Y(250)], h: 180, s: W.section, ha: 'center' });
  out.push({ type: 'text', layer: 'POOL-TEXT', at: [xm, Y(-d.freeboard - 200)], h: 110, s: W.water, ha: 'center' });
  out.push({ type: 'dim', layer: 'POOL-DIMS', p1: [xa, Y(-d.freeboard)], p2: [xa, Y(zf(xa))], loc: [xa - e0 - 400, Y((zf(xa) - d.freeboard) / 2)], rot: 90 });
  out.push({ type: 'dim', layer: 'POOL-DIMS', p1: [xb, Y(-d.freeboard)], p2: [xb, Y(zf(xb))], loc: [xb + e0 + 400, Y((zf(xb) - d.freeboard) / 2)], rot: 90 });
  return out;
}

/** Plan and section together, the section under the plan. */
export function sheetEnts(result, words = {}, fmt = null) {
  const plan = planEnts(result, words, fmt);
  let lowest = Infinity;
  for (const e of plan) for (const p of e.pts || [e.a, e.b, e.at, e.loc].filter(Boolean)) lowest = Math.min(lowest, p[1]);
  return [...plan, ...sectionEnts(result, { drop: 1750 - lowest, words })];
}

/** [x0, y0, x1, y1] of an entity list. */
export function extent(ents) {
  const b = [Infinity, Infinity, -Infinity, -Infinity];
  for (const e of ents) for (const p of e.pts || [e.a, e.b, e.at, e.loc, e.p1, e.p2].filter(Boolean)) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }
  return b;
}
