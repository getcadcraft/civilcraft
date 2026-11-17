/* SPDX-License-Identifier: Apache-2.0 */
/**
 * symbols.js — the in-line symbols of 2D MEP drafting: valves, pipeline accessories and duct accessories (lib/mep2d). DOM-free.
 *
 * The shapes are our own drawings. They follow the conventions most building-services schematics share — the families of
 * graphical symbols in ISO 14617 (valves as two triangles tip to tip, with the mark of the valve type at the middle; pumps as
 * a circle with the flow triangle) and the ventilation symbols of the EN 12792 tradition (dampers as a blade across the duct)
 * — in general terms only: no standard's figures and no vendor's symbol set were copied, and the engine does not claim that
 * a drawing made with them conforms to either standard.
 *
 * Every symbol is drawn about the origin with the flow along +x.
 *   pipe symbols: one unit = the symbol's length (a valve runs from x = −0.5 to 0.5 and is 0.5 high)
 *   duct symbols: one unit = the duct's width (the duct's edges are y = ±0.5)
 *   SYMBOLS[key] = { key, cat ('pipe' | 'duct'), prefix (tag letters; '' = not tagged), len (how much of the run it
 *                    replaces, in units; 0 = it sits on the run without cutting it), dir (true = it shows the flow direction),
 *                    mount ('inline' | 'branch' | 'end'), draw() → entities }
 *   symbolBlockName(key) · symbolExtent(key) → { minX, maxX, minY, maxY }
 */
import { L, poly, circle, arc, fill, disc, text, rect } from './geom.js';

const bow = () => [poly([[-0.5, -0.25], [-0.5, 0.25], [0, 0]], true), poly([[0.5, -0.25], [0.5, 0.25], [0, 0]], true)];
const zig = (x0, y0, x1, y1, n, amp) => {   // a zigzag from (x0, y0) to (x1, y1), n teeth
  const pts = [[x0, y0]], dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n, s = i % 2 ? -1 : 1; pts.push([x0 + dx * t + nx * amp * s, y0 + dy * t + ny * amp * s]); }
  pts.push([x1, y1]);
  return poly(pts);
};
const arrowHead = (x, y, ang, s) => {
  const c = Math.cos(ang), sn = Math.sin(ang), p = (u, v) => [x + u * c - v * sn, y + u * sn + v * c];
  return fill([p(0, 0), p(-s, s * 0.4), p(-s, -s * 0.4)]);
};

const defs = [
  // ---- valves
  ['gate', 'pipe', 'V', 1, false, 'inline', () => [...bow(), L(0, -0.25, 0, 0.25)]],
  ['globe', 'pipe', 'V', 1, false, 'inline', () => [...bow(), disc(0, 0, 0.09)]],
  ['ball', 'pipe', 'V', 1, false, 'inline', () => [...bow(), circle(0, 0, 0.12)]],
  ['butterfly', 'pipe', 'V', 1, false, 'inline', () => [L(-0.5, -0.25, -0.5, 0.25), L(0.5, -0.25, 0.5, 0.25), L(-0.5, 0, -0.3, 0), L(0.3, 0, 0.5, 0), L(-0.3, -0.22, 0.3, 0.22), disc(0, 0, 0.05)]],
  ['check', 'pipe', 'NRV', 1, true, 'inline', () => [...bow(), fill([[-0.5, -0.25], [-0.5, 0.25], [0, 0]]), L(-0.25, 0.42, 0.25, 0.42), arrowHead(0.25, 0.42, 0, 0.14)]],
  ['balancing', 'pipe', 'BV', 1, false, 'inline', () => [...bow(), L(-0.25, 0.125, -0.25, 0.4), circle(-0.25, 0.46, 0.06), L(0.25, 0.125, 0.25, 0.4), circle(0.25, 0.46, 0.06)]],
  ['control', 'pipe', 'CV', 1, false, 'inline', () => [...bow(), L(0, 0, 0, 0.4), rect(-0.2, 0.4, 0.2, 0.8), L(-0.1, 0.5, -0.1, 0.7), L(-0.1, 0.7, 0, 0.58), L(0, 0.58, 0.1, 0.7), L(0.1, 0.7, 0.1, 0.5)]],
  ['safety', 'pipe', 'SV', 1, true, 'inline', () => [...bow(), zig(0, 0, 0, 0.6, 5, 0.1), L(-0.14, 0.6, 0.14, 0.6)]],
  ['prv', 'pipe', 'PRV', 1, true, 'inline', () => [...bow(), L(0, 0, 0, 0.35), arc(0, 0.35, 0.22, 0, Math.PI), L(-0.22, 0.35, 0.22, 0.35), L(0.22, 0.35, 0.4, 0.35), L(0.4, 0.35, 0.4, 0.05)]],
  // ---- pipeline accessories
  ['strainer', 'pipe', 'STR', 1, false, 'inline', () => [rect(-0.5, -0.25, 0.5, 0.25), L(-0.42, -0.21, -0.22, -0.11), L(-0.1, -0.05, 0.1, 0.05), L(0.22, 0.11, 0.42, 0.21)]],
  ['pump', 'pipe', 'P', 1, true, 'inline', () => [circle(0, 0, 0.5), poly([[-0.25, 0.433], [0.5, 0], [-0.25, -0.433]])]],
  ['flowmeter', 'pipe', 'FM', 1, true, 'inline', () => [rect(-0.5, -0.25, 0.5, 0.25), L(-0.3, 0, 0.3, 0), arrowHead(0.3, 0, 0, 0.16)]],
  ['thermometer', 'pipe', 'TI', 0, false, 'branch', () => [L(0, 0, 0, 0.35), circle(0, 0.65, 0.3), text(0, 0.65, 0.3, 'T')]],
  ['gauge', 'pipe', 'PI', 0, false, 'branch', () => [L(0, 0, 0, 0.35), circle(0, 0.65, 0.3), text(0, 0.65, 0.3, 'P')]],
  ['expansion', 'pipe', 'EV', 0, false, 'branch', () => [L(0, 0, 0, 0.35), circle(0, 0.8, 0.45), L(-0.45, 0.8, 0.45, 0.8), L(-0.3, 0.6, -0.1, 0.6), L(0.1, 0.6, 0.3, 0.6)]],
  ['airvent', 'pipe', 'AV', 0, false, 'branch', () => [L(0, 0, 0, 0.3), circle(0, 0.42, 0.12), L(0, 0.54, 0, 0.8), arrowHead(0, 0.95, Math.PI / 2, 0.16)]],
  ['drain', 'pipe', 'DR', 0, false, 'branch', () => [L(0, 0, 0, -0.25), poly([[-0.15, -0.25], [0.15, -0.25], [0, -0.5]], true), poly([[-0.15, -0.75], [0.15, -0.75], [0, -0.5]], true), L(0, -0.75, 0, -0.95)]],
  // ---- fittings (not tagged)
  ['union', 'pipe', '', 0.3, false, 'inline', () => [L(-0.15, -0.17, -0.15, 0.17), L(0, -0.25, 0, 0.25), L(0.15, -0.17, 0.15, 0.17), L(-0.15, 0, 0.15, 0)]],
  ['flange', 'pipe', '', 0.16, false, 'inline', () => [L(-0.08, -0.25, -0.08, 0.25), L(0.08, -0.25, 0.08, 0.25)]],
  ['reducer', 'pipe', '', 1, true, 'inline', () => [poly([[-0.5, -0.25], [-0.5, 0.25], [0.5, 0.11], [0.5, -0.11]], true)]],
  ['cap', 'pipe', '', 0, false, 'end', () => [L(0, -0.25, 0, 0.25), arc(-0.18, 0, 0.31, -0.94, 0.94)]],
  // ---- duct accessories
  ['damper', 'duct', 'VD', 0, false, 'inline', () => [L(-0.3, -0.5, 0.3, 0.5), disc(0, 0, 0.05), L(0.3, 0.5, 0.3, 0.68), L(0.22, 0.68, 0.38, 0.68)]],
  ['firedamper', 'duct', 'FD', 0, false, 'inline', () => [rect(-0.09, -0.62, 0.09, 0.62), L(-0.09, -0.62, 0.09, 0.62), fill([[-0.09, -0.62], [0.09, -0.62], [0.09, -0.5], [-0.09, -0.5]]), fill([[-0.09, 0.5], [0.09, 0.5], [0.09, 0.62], [-0.09, 0.62]])]],
  ['attenuator', 'duct', 'ATT', 2, false, 'inline', () => [rect(-1, -0.65, 1, 0.65), rect(-0.85, 0.35, 0.85, 0.55), rect(-0.85, -0.55, 0.85, -0.35), rect(-0.85, -0.1, 0.85, 0.1)]],
  ['flexconn', 'duct', 'FC', 0.3, false, 'inline', () => [L(-0.15, -0.5, -0.15, 0.5), L(0.15, -0.5, 0.15, 0.5), zig(-0.15, 0.5, 0.15, 0.5, 4, 0.06), zig(-0.15, -0.5, 0.15, -0.5, 4, 0.06)]],
  ['accessdoor', 'duct', 'AD', 0, false, 'inline', () => [rect(-0.25, 0.28, 0.25, 0.5), L(-0.25, 0.28, 0.25, 0.5), L(-0.25, 0.5, 0.25, 0.28)]],
];

export const SYMBOLS = Object.freeze(Object.fromEntries(defs.map(([key, cat, prefix, len, dir, mount, draw]) => [key, Object.freeze({ key, cat, prefix, len, dir, mount, draw })])));
export const SYMBOL_KEYS = Object.freeze(defs.map((d) => d[0]));
export const symbolBlockName = (key) => 'MEP_SYM_' + String(key).toUpperCase();
export const FLOW_BLOCK = 'MEP_FLOW_ARROW';
/** The flow arrow: a solid triangle one unit long, pointing along +x. */
export const flowArrow = () => [fill([[0.5, 0], [-0.5, 0.3], [-0.5, -0.3]]), poly([[0.5, 0], [-0.5, 0.3], [-0.5, -0.3]], true)];

/** The box a list of entities fills (arcs counted as whole circles). */
export function extentOf(ents) {
  const b = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity };
  const put = (x, y) => { b.minX = Math.min(b.minX, x); b.maxX = Math.max(b.maxX, x); b.minY = Math.min(b.minY, y); b.maxY = Math.max(b.maxY, y); };
  for (const e of ents) {
    if (e.type === 'line') { put(e.x1, e.y1); put(e.x2, e.y2); }
    else if (e.type === 'circle' || e.type === 'arc') { put(e.cx - e.r, e.cy - e.r); put(e.cx + e.r, e.cy + e.r); }
    else if (e.type === 'poly') for (const p of e.pts) put(p.x, p.y);
    else if (e.type === 'hatch') for (const lp of e.loops) for (let i = 0; i + 1 < lp.length; i += 2) put(lp[i], lp[i + 1]);
    else if (e.type === 'text') { put(e.x - e.h * 0.4, e.y - e.h / 2); put(e.x + e.h * 0.4, e.y + e.h / 2); }
  }
  return Number.isFinite(b.minX) ? b : { minX: 0, maxX: 0, minY: 0, maxY: 0 };
}
const extents = new Map();
export function symbolExtent(key) {
  if (!extents.has(key)) extents.set(key, extentOf(SYMBOLS[key] ? SYMBOLS[key].draw() : []));
  return extents.get(key);
}
