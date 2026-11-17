/* SPDX-License-Identifier: Apache-2.0 */
/**
 * equipment.js — building-services equipment in plan, with the points runs connect to (lib/mep2d). DOM-free.
 *
 * Plain plan outlines of our own drawing, at real size: the dimensions are what the person types (the defaults are round
 * starting figures, not any maker's product). Each has connection points; a pipe or duct run started or ended near one
 * snaps onto it.
 *
 *   EQUIPMENT[key] = { key, prefix, params [[name, default mm]…], use ('pipe' | 'duct' | 'both') }
 *   parseEquipSize(key, text) → { a, b } (mm) | null         "1000", "1000x100"
 *   equipSizeLabel(key, p)    → "1000x100"
 *   buildEquipment(key, p, k) → { ents, ports: [{ x, y, dx, dy, use, name }], box: { minX, maxX, minY, maxY } }   k = drawing units per mm
 *   equipBlockName(key, p)
 */
import { L, poly, circle, rect } from './geom.js';
import { extentOf } from './symbols.js';

const STUB = 60;   // mm: the length of a pipe connection stub
const pipePort = (x, y, dx, dy, name) => ({ x: x + dx * STUB, y: y + dy * STUB, dx, dy, use: 'pipe', name, stub: [x, y] });
const ductPort = (x, y, dx, dy, name) => ({ x, y, dx, dy, use: 'duct', name });

const defs = {
  radiator: { prefix: 'RAD', params: [['length', 1000], ['depth', 100]], use: 'pipe', draw: (a, b) => {
    const n = Math.max(2, Math.min(60, Math.round(a / 100))), fins = [];
    for (let i = 1; i < n; i++) fins.push(L(-a / 2 + (a * i) / n, 0, -a / 2 + (a * i) / n, b));
    return { ents: [rect(-a / 2, 0, a / 2, b), ...fins], ports: [pipePort(-a / 2, b / 2, -1, 0, 'flow'), pipePort(a / 2, b / 2, 1, 0, 'return')] };
  } },
  fancoil: { prefix: 'FCU', params: [['length', 1000], ['depth', 500]], use: 'both', draw: (a, b) => {
    const r = Math.min(a, b) * 0.28;
    return { ents: [rect(-a / 2, -b / 2, a / 2, b / 2), circle(a * 0.18, 0, r), L(a * 0.18 - r * 0.7, -r * 0.7, a * 0.18 + r * 0.7, r * 0.7), L(a * 0.18 - r * 0.7, r * 0.7, a * 0.18 + r * 0.7, -r * 0.7),
      poly([[-a * 0.38, -b * 0.35], [-a * 0.28, b * 0.35], [-a * 0.18, -b * 0.35], [-a * 0.08, b * 0.35]])],
      ports: [pipePort(-a / 2, b * 0.25, -1, 0, 'flow'), pipePort(-a / 2, -b * 0.25, -1, 0, 'return'), ductPort(a / 2, 0, 1, 0, 'air')] };
  } },
  ahu: { prefix: 'AHU', params: [['length', 3000], ['width', 1200]], use: 'both', draw: (a, b) => {
    const x1 = -a / 2 + a / 3, x2 = -a / 2 + (2 * a) / 3, r = Math.min(a / 3, b) * 0.36, fx = (x2 + a / 2) / 2;
    const filter = [];   // filter: a zigzag across the first section
    const zz = [[-a / 2 + a * 0.08, -b / 2]];
    for (let i = 1; i <= 6; i++) zz.push([-a / 2 + (i % 2 ? a * 0.25 : a * 0.08), -b / 2 + (b * i) / 6]);
    filter.push(poly(zz));
    return { ents: [rect(-a / 2, -b / 2, a / 2, b / 2), L(x1, -b / 2, x1, b / 2), L(x2, -b / 2, x2, b / 2), ...filter,
      // coil: a box with a diagonal, the usual mark of a heating or cooling coil
      rect(x1 + a * 0.08, -b * 0.4, x2 - a * 0.08, b * 0.4), L(x1 + a * 0.08, -b * 0.4, x2 - a * 0.08, b * 0.4),
      // fan: a circle with the discharge triangle
      circle(fx, 0, r), L(fx, r, fx + r * 1.2, r), L(fx + r * 0.94, r * 0.34, fx + r * 1.2, r), L(fx + r * 1.2, r, fx + r * 1.2, r * 0.2)],
      ports: [ductPort(-a / 2, 0, -1, 0, 'air in'), ductPort(a / 2, 0, 1, 0, 'air out'), pipePort(x1 + a * 0.12, b / 2, 0, 1, 'coil flow'), pipePort(x2 - a * 0.12, b / 2, 0, 1, 'coil return')] };
  } },
  boiler: { prefix: 'B', params: [['width', 600], ['depth', 600]], use: 'pipe', draw: (a, b) => {
    const s = Math.min(a, b);
    return { ents: [rect(-a / 2, -b / 2, a / 2, b / 2), circle(0, 0, s * 0.3),
      // a flame: the mark of a fired heat generator
      poly([[-s * 0.11, -s * 0.16], [0, s * 0.2], [s * 0.11, -s * 0.16], [0, -s * 0.06]], true)],
      ports: [pipePort(-a * 0.25, b / 2, 0, 1, 'flow'), pipePort(a * 0.25, b / 2, 0, 1, 'return')] };
  } },
  chiller: { prefix: 'CH', params: [['length', 2400], ['width', 1100]], use: 'pipe', draw: (a, b) => {
    const r = Math.min(a / 4, b / 2) * 0.6, star = [];
    for (let i = 0; i < 3; i++) { const t = (Math.PI * i) / 3; star.push(L(-r * 0.6 * Math.cos(t), -r * 0.6 * Math.sin(t), r * 0.6 * Math.cos(t), r * 0.6 * Math.sin(t))); }
    return { ents: [rect(-a / 2, -b / 2, a / 2, b / 2), circle(-a / 4, 0, r), circle(a / 4, 0, r), ...star],
      ports: [pipePort(-a / 2, b * 0.25, -1, 0, 'flow'), pipePort(-a / 2, -b * 0.25, -1, 0, 'return')] };
  } },
  tank: { prefix: 'T', params: [['diameter', 600], ['', 0]], use: 'pipe', draw: (a) => {
    const r = a / 2;
    return { ents: [circle(0, 0, r), circle(0, 0, r * 0.82), L(-r * 0.2, 0, r * 0.2, 0), L(0, -r * 0.2, 0, r * 0.2)],
      ports: [pipePort(-r, 0, -1, 0, 'a'), pipePort(r, 0, 1, 0, 'b'), pipePort(0, r, 0, 1, 'c'), pipePort(0, -r, 0, -1, 'd')] };
  } },
  exchanger: { prefix: 'HX', params: [['length', 600], ['depth', 300]], use: 'pipe', draw: (a, b) => ({
    ents: [rect(-a / 2, -b / 2, a / 2, b / 2), poly([[-a / 2, 0], [-a * 0.25, b * 0.3], [0, -b * 0.3], [a * 0.25, b * 0.3], [a / 2, 0]])],
    ports: [pipePort(-a / 2, b * 0.3, -1, 0, 'primary in'), pipePort(-a / 2, -b * 0.3, -1, 0, 'primary out'), pipePort(a / 2, b * 0.3, 1, 0, 'secondary out'), pipePort(a / 2, -b * 0.3, 1, 0, 'secondary in')],
  }) },
  diffuser: { prefix: 'SD', params: [['size', 600], ['', 0]], use: 'duct', draw: (a) => {
    const h = a / 2;
    return { ents: [rect(-h, -h, h, h), rect(-h * 0.66, -h * 0.66, h * 0.66, h * 0.66), rect(-h * 0.33, -h * 0.33, h * 0.33, h * 0.33), L(-h, -h, -h * 0.33, -h * 0.33), L(h, -h, h * 0.33, -h * 0.33), L(h, h, h * 0.33, h * 0.33), L(-h, h, -h * 0.33, h * 0.33)],
      ports: [ductPort(0, 0, 0, 0, 'neck'), ductPort(-h, 0, -1, 0, 'side'), ductPort(h, 0, 1, 0, 'side'), ductPort(0, h, 0, 1, 'side'), ductPort(0, -h, 0, -1, 'side')] };
  } },
  linear: { prefix: 'LD', params: [['length', 1200], ['width', 100]], use: 'duct', draw: (a, b) => ({
    ents: [rect(-a / 2, -b / 2, a / 2, b / 2), L(-a / 2, 0, a / 2, 0)],
    ports: [ductPort(0, 0, 0, 0, 'neck'), ductPort(0, b / 2, 0, 1, 'side')],
  }) },
  grille: { prefix: 'RG', params: [['length', 600], ['width', 300]], use: 'duct', draw: (a, b) => {
    const bars = [], n = Math.max(2, Math.min(12, Math.round(b / 75)));
    for (let i = 1; i < n; i++) bars.push(L(-a / 2, -b / 2 + (b * i) / n, a / 2, -b / 2 + (b * i) / n));
    return { ents: [rect(-a / 2, -b / 2, a / 2, b / 2), ...bars, L(-a / 2, -b / 2, a / 2, b / 2)],
      ports: [ductPort(0, 0, 0, 0, 'neck'), ductPort(0, b / 2, 0, 1, 'side')] };
  } },
};

export const EQUIPMENT = Object.freeze(Object.fromEntries(Object.entries(defs).map(([key, d]) => [key, Object.freeze({ key, prefix: d.prefix, params: d.params, use: d.use })])));
export const EQUIPMENT_KEYS = Object.freeze(Object.keys(defs));
const fmt = (v) => String(Math.round(v * 100) / 100);
const two = (key) => defs[key].params[1][0] !== '';

export function parseEquipSize(key, textIn) {
  const d = defs[key];
  if (!d) return null;
  const s = String(textIn ?? '').trim();
  if (!s) return { a: d.params[0][1], b: d.params[1][1] };
  const m = /^(\d+(?:\.\d+)?)(?:\s*[x×*]\s*(\d+(?:\.\d+)?))?$/i.exec(s.replace(/\s*mm$/i, ''));
  if (!m) return null;
  const a = Number(m[1]), b = m[2] !== undefined ? Number(m[2]) : d.params[1][1];
  if (!(a > 0) || a > 100000 || (two(key) && !(b > 0)) || b > 100000) return null;
  return { a, b: two(key) ? b : 0 };
}
export const equipSizeLabel = (key, p) => (two(key) ? fmt(p.a) + 'x' + fmt(p.b) : fmt(p.a));
export const equipBlockName = (key, p) => 'MEP_EQ_' + String(key).toUpperCase() + '_' + equipSizeLabel(key, p).replace(/\./g, '_').toUpperCase();

export function buildEquipment(key, p, k = 1) {
  const d = defs[key];
  if (!d) return null;
  const got = d.draw(p.a, p.b);
  const ents = [...got.ents];
  for (const pt of got.ports) if (pt.stub) ents.push(L(pt.stub[0], pt.stub[1], pt.x, pt.y));
  const sc = (e) => {
    if (e.type === 'line') return { ...e, x1: e.x1 * k, y1: e.y1 * k, x2: e.x2 * k, y2: e.y2 * k };
    if (e.type === 'circle' || e.type === 'arc') return { ...e, cx: e.cx * k, cy: e.cy * k, r: e.r * k };
    if (e.type === 'poly') return { ...e, pts: e.pts.map((q) => ({ x: q.x * k, y: q.y * k, b: q.b || 0 })) };
    return e;
  };
  const out = ents.map(sc);
  return { ents: out, ports: got.ports.map((q) => ({ x: q.x * k, y: q.y * k, dx: q.dx, dy: q.dy, use: q.use, name: q.name })), box: extentOf(out) };
}
