/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid.js — a cabinet as boxes for CadCraft's 3D tab (0.8 SU.1035 step 5, session `fab-08`). DOM-free; imports model.js.
 *
 *   boxesOf(cab, R) → [{ role, x0, y0, z0, x1, y1, z1 }]   the carcass panels, back, shelves, plinth and fronts in the cabinet's
 *     own frame: x along the wall from its left end, y out from the wall, z up from the floor (rule units; `elev` is not added)
 *   solidPolys(cab, R, place) → closed polygons [[[x, y, z]…]…] in DRAWING units for api.solids: place = { x, y, rot, k, sx, sy }
 *     (the entity's position and rotation in the drawing, k = drawing units per rule unit); six quads a box, faces outward
 *   colorOf(role) → '#rrggbb'
 */
import { cabinetParts, frontsOf, boxOf, cleanCabinet } from './model.js';

export function boxesOf(cabIn, R) {
  const cab = cleanCabinet(cabIn, R);
  if (!cab) return [];
  const { kick, boxH, backDepth } = boxOf(cab, R);
  const t = R.t, px0 = R.back === 'applied' ? R.backT : 0, px1 = cab.d, top = kick + boxH, W = cab.w;
  const hasTop = cab.type === 'wall' || cab.type === 'tall';
  const out = [];
  const box = (role, x0, y0, z0, x1, y1, z1) => { if (x1 > x0 + 1e-9 && y1 > y0 + 1e-9 && z1 > z0 + 1e-9) out.push({ role, x0, y0, z0, x1, y1, z1 }); };
  const notch = kick > 0 && R.kick === 'notch';
  box('side', 0, px0, notch ? 0 : kick, t, px1, top);
  box('side', W - t, px0, notch ? 0 : kick, W, px1, top);
  box('bottom', t, px0, kick, W - t, px1, kick + t);
  if (hasTop) box('top', t, px0, top - t, W - t, px1, top);
  else { box('rail', t, px1 - R.railDepth, top - t, W - t, px1, top); box('rail', t, px0, top - t, W - t, px0 + R.railDepth, top); }
  if (R.back === 'applied') box('back', 0, 0, kick, W, R.backT, top);
  else box('back', t, R.backSetback, kick + t, W - t, R.backSetback + R.backT, hasTop ? top - t : top - t);
  const shelves = cabinetParts(cab, R).filter((p) => p.role === 'shelf' || p.role === 'shelf-fixed');
  const innerBottom = kick + t, innerTop = top - t;
  for (const p of shelves) for (let i = 0; i < p.qty; i++) {
    const z = p.role === 'shelf-fixed' ? (innerBottom + innerTop) / 2 - t / 2 : innerBottom + (innerTop - innerBottom) * (i + 1) / (p.qty + 1) - t / 2;
    box(p.role, t + (p.role === 'shelf' ? R.shelfClear : 0), px0 + backDepth, z, W - t - (p.role === 'shelf' ? R.shelfClear : 0), p.role === 'shelf' ? px1 - R.shelfFront : px1, z + t);
  }
  if (kick > 0 && R.plinth) box('plinth', notch ? t : 0, px1 - R.kickSetback - t, 0, notch ? W - t : W, px1 - R.kickSetback, kick);
  for (const f of frontsOf(cab, R)) box(f.kind === 'door' ? 'door' : 'drawer-front', f.x, px1, f.y, f.x + f.w, px1 + R.frontT, f.y + f.h);
  return out;
}

const COLORS = { side: '#c9a77a', bottom: '#c9a77a', top: '#c9a77a', rail: '#c9a77a', shelf: '#d6b88c', 'shelf-fixed': '#d6b88c', back: '#e4d2b4', plinth: '#8a7458', door: '#e8e0d0', 'drawer-front': '#e8e0d0' };
export const colorOf = (role) => COLORS[role] || '#c9a77a';

/** Six outward quads of a box. */
export function quads(b) {
  const { x0, y0, z0, x1, y1, z1 } = b;
  return [
    [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]],   // bottom (normal −z)
    [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],   // top
    [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],   // −y (the wall side)
    [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]],   // +y (front)
    [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],   // −x
    [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]],   // +x
  ];
}

export function solidPolys(cab, R, place) {
  const { x = 0, y = 0, rot = 0, k = 1, sx = 1, sy = 1 } = place || {};
  const c = Math.cos(rot), s = Math.sin(rot), flip = sx * sy < 0, elev = (cleanCabinet(cab, R)?.elev) || 0;
  const P = ([px, py, pz]) => {
    const lx = px * k * sx, ly = py * k * sy;
    return [x + lx * c - ly * s, y + lx * s + ly * c, (pz + elev) * k];
  };
  const polys = [];
  for (const b of boxesOf(cab, R)) for (const q of quads(b)) { const poly = q.map(P); polys.push(flip ? poly.reverse() : poly); }
  return polys;
}
