/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lasso-core.js — lasso selection for any 2D app (0.4 part 2, T.4 / T.5). Import-free and DOM-free.
 * Canonical: cadcraft/dev/lasso-core.js (session cad-draw owns it). Byte-identical copies in markupcraft, detailcraft,
 * takeoffcraft and civilcraft dev (an app never imports another app's folder; bin/test-cadcraft.mjs checks they match —
 * never edit a copy, ask cad-draw).
 *
 * Press and drag on an empty spot draws a freehand lasso. Its mode follows the first sideways move, as in AutoCAD: to
 * the right = window (wholly inside), to the left = crossing (inside or touching); Space while dragging cycles window →
 * crossing → fence (what the open path crosses). A click, then a second click, stays the app's rectangle.
 *
 *   lassoMode(start, cur, minPx = 6) → 'window' | 'crossing' | null   (screen points; null until it has moved sideways)
 *   nextMode(mode)                   → the mode Space switches to
 *   thin(pts, minStep)               → the pointer's path without crowded points (ends kept)
 *   pointInPoly(p, pts)              → even-odd test; the lasso closes itself from its last point to its first
 *   segsCross(ax, ay, bx, by, cx, cy, dx, dy) → do two segments touch
 *   lassoSelect(items, pts, mode, { box, segs, filled }) → the items it selects, in order:
 *     box(item)    → { minX, minY, maxX, maxY } in the lasso's coordinates
 *     segs(item)   → [[x1, y1, x2, y2], …] the item's outline as segments (flatten curves; a point = one zero-length seg)
 *     filled(item) → optional: true for an area (a fill, a text box) — a lasso drawn inside it touches it (crossing)
 */

export const LASSO_MODES = ['window', 'crossing', 'fence'];
export const nextMode = (m) => LASSO_MODES[(LASSO_MODES.indexOf(m) + 1) % LASSO_MODES.length];
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

export function lassoMode(start, cur, minPx = 6) {
  const dx = cur.x - start.x;
  if (Math.abs(dx) < minPx) return null;
  return dx > 0 ? 'window' : 'crossing';
}

export function thin(pts, minStep) {
  const out = [];
  for (const p of pts) if (!out.length || dist(out[out.length - 1], p) >= minStep) out.push({ x: p.x, y: p.y });
  if (pts.length > 1 && out.length && dist(out[out.length - 1], pts[pts.length - 1]) > 1e-12) out.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y });
  return out;
}

export function pointInPoly(p, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

/** Do segments AB and CD touch (collinear overlaps included). */
export function segsCross(ax, ay, bx, by, cx, cy, dx, dy) {
  const o = (px, py, qx, qy, rx, ry) => { const v = (qx - px) * (ry - py) - (qy - py) * (rx - px); return Math.abs(v) < 1e-12 ? 0 : v > 0 ? 1 : -1; };
  const on = (px, py, qx, qy, rx, ry) => Math.min(px, qx) - 1e-12 <= rx && rx <= Math.max(px, qx) + 1e-12 && Math.min(py, qy) - 1e-12 <= ry && ry <= Math.max(py, qy) + 1e-12;
  const o1 = o(ax, ay, bx, by, cx, cy), o2 = o(ax, ay, bx, by, dx, dy), o3 = o(cx, cy, dx, dy, ax, ay), o4 = o(cx, cy, dx, dy, bx, by);
  if (o1 !== o2 && o3 !== o4) return true;
  return (o1 === 0 && on(ax, ay, bx, by, cx, cy)) || (o2 === 0 && on(ax, ay, bx, by, dx, dy)) || (o3 === 0 && on(cx, cy, dx, dy, ax, ay)) || (o4 === 0 && on(cx, cy, dx, dy, bx, by));
}

export function lassoSelect(items, pts, mode, { box, segs, filled = () => false }) {
  const out = [];
  if (!pts || pts.length < 2) return out;
  const path = [];
  const n = mode === 'fence' ? pts.length - 1 : pts.length;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if (dist(a, b) > 1e-12) path.push([a.x, a.y, b.x, b.y]); }
  if (!path.length || (mode !== 'fence' && pts.length < 3)) return out;
  let lx0 = Infinity, ly0 = Infinity, lx1 = -Infinity, ly1 = -Infinity;
  for (const p of pts) { lx0 = Math.min(lx0, p.x); ly0 = Math.min(ly0, p.y); lx1 = Math.max(lx1, p.x); ly1 = Math.max(ly1, p.y); }
  const crosses = (ss) => ss.some(([a, b, c, d]) => path.some(([e, f, g, h]) => segsCross(a, b, c, d, e, f, g, h)));
  for (const it of items) {
    const b = box(it);
    if (!b || !(b.maxX >= lx0 && b.minX <= lx1 && b.maxY >= ly0 && b.minY <= ly1)) continue;
    const ss = segs(it) || [];
    if (mode === 'fence') { if (crosses(ss)) out.push(it); continue; }
    if (mode === 'window') {
      if (!(b.minX >= lx0 && b.maxX <= lx1 && b.minY >= ly0 && b.maxY <= ly1)) continue;
      if (ss.length && !crosses(ss) && ss.every(([x, y]) => pointInPoly({ x, y }, pts))) out.push(it);
      continue;
    }
    if (crosses(ss) || ss.some(([x, y]) => pointInPoly({ x, y }, pts)) || (filled(it) && pts.some((q) => q.x >= b.minX && q.x <= b.maxX && q.y >= b.minY && q.y <= b.maxY))) out.push(it);
  }
  return out;
}
