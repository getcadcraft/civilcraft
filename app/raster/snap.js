/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — option names and data fields. */
/**
 * snap.js — snapping to the lines of a scanned drawing (0.7 LC.6 b). DOM-free. The sheet is not traced as a whole: the tile
 * under the pointer is traced when it is first asked for (trace.js on a small window, cached), and the traced centre lines'
 * ends, middles, corners and crossings are offered as snap points, in the kinds CadCraft already draws (`end`, `mid`, `int`,
 * `cen`). A corner (two lines that meet) and a crossing are both `int`; an end that nothing else meets is `end`. A line cut by the
 * edge of the traced tile offers no end there and no middle (it is longer than the tile): only crossings and corners are sure.
 *
 *   const s = new RasterSnap(bitmap, { tile: 320, margin: 40, tol: 1.5, keep: 24 })
 *   s.near(px, py, r, { end, mid, int, cen }) → { x, y, kind, d } | null     pixel coordinates, y down
 *   s.points(tx, ty)                          → the snap points of one tile (for tests): [{ x, y, kind }]
 */
import { trace } from './trace.js';
import { Workspace } from './util.js';

const MAX_WIN = 3000;
/** Does the segment pass through the rectangle? (Liang–Barsky) */
function clipSegment(ax, ay, bx, by, x0, y0, x1, y1) {
  let t0 = 0, t1 = 1;
  const dx = bx - ax, dy = by - ay;
  for (const [p, q] of [[-dx, ax - x0], [dx, x1 - ax], [-dy, ay - y0], [dy, y1 - ay]]) {
    if (p === 0) { if (q < 0) return false; continue; }
    const r = q / p;
    if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
  }
  return true;
}
const segCross = (a, b) => {   // two segments → the crossing point strictly inside both, else null
  const d = (a.x2 - a.x1) * (b.y2 - b.y1) - (a.y2 - a.y1) * (b.x2 - b.x1);
  if (Math.abs(d) < 1e-9) return null;
  const t = ((b.x1 - a.x1) * (b.y2 - b.y1) - (b.y1 - a.y1) * (b.x2 - b.x1)) / d, u = ((b.x1 - a.x1) * (a.y2 - a.y1) - (b.y1 - a.y1) * (a.x2 - a.x1)) / d;
  const la = Math.hypot(a.x2 - a.x1, a.y2 - a.y1), lb = Math.hypot(b.x2 - b.x1, b.y2 - b.y1), ea = 1.5 / la, eb = 1.5 / lb;
  if (t < -ea || t > 1 + ea || u < -eb || u > 1 + eb) return null;
  return { x: a.x1 + t * (a.x2 - a.x1), y: a.y1 + t * (a.y2 - a.y1), ta: t, tb: u, la, lb };
};

/** The snap points of a trace result: [{ x, y, kind }]. `joinDist` = how close two ends are to count as one corner. */
export function snapPointsOf(result, joinDist = 3, cutBox = null) {
  const pts = [];
  const ends = [];   // every end of every line or arc
  // a line that runs out of the traced window was cut by it: its end there is not an end, and its middle is not the line's middle
  const cutAt = (x, y) => !!cutBox && ((cutBox[0] > 0 && x <= cutBox[0] + 2) || (cutBox[1] > 0 && y <= cutBox[1] + 2) || (cutBox[2] < cutBox[4] && x >= cutBox[2] - 2) || (cutBox[3] < cutBox[5] && y >= cutBox[3] - 2));
  for (const l of result.lines) {
    const c1 = cutAt(l.x1, l.y1), c2 = cutAt(l.x2, l.y2);
    if (!c1) ends.push([l.x1, l.y1]);
    if (!c2) ends.push([l.x2, l.y2]);
    if (!c1 && !c2) pts.push({ x: (l.x1 + l.x2) / 2, y: (l.y1 + l.y2) / 2, kind: 'mid' });
  }
  for (const a of result.arcs) {
    const c1 = cutAt(a.sx, a.sy), c2 = cutAt(a.ex, a.ey);
    if (!c1) ends.push([a.sx, a.sy]);
    if (!c2) ends.push([a.ex, a.ey]);
    if (c1 || c2) continue;
    const m = (a.a0 + a.a1) / 2;
    pts.push({ x: a.cx + a.r * Math.cos(m), y: a.cy + a.r * Math.sin(m), kind: 'mid' }, { x: a.cx, y: a.cy, kind: 'cen' });
  }
  const used = new Array(ends.length).fill(false);
  for (let i = 0; i < ends.length; i++) {
    if (used[i]) continue;
    const grp = [i];
    for (let j = i + 1; j < ends.length; j++) if (!used[j] && Math.hypot(ends[i][0] - ends[j][0], ends[i][1] - ends[j][1]) <= joinDist) grp.push(j);
    for (const g of grp) used[g] = true;
    let x = 0, y = 0;
    for (const g of grp) { x += ends[g][0]; y += ends[g][1]; }
    pts.push({ x: x / grp.length, y: y / grp.length, kind: grp.length > 1 ? 'int' : 'end' });
  }
  // crossings and T meetings: an end on another line's body, and lines that cross
  const L = result.lines;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const c = segCross(L[i], L[j]);
    if (!c) continue;
    const nearEnd = (c.ta * c.la < joinDist || (1 - c.ta) * c.la < joinDist) && (c.tb * c.lb < joinDist || (1 - c.tb) * c.lb < joinDist);
    if (nearEnd) continue;   // a corner: already there
    pts.push({ x: c.x, y: c.y, kind: 'int' });
  }
  return pts;
}

export class RasterSnap {
  constructor(bm, { tile = 320, margin = 40, tol = 1.5, keep = 24 } = {}) {
    this.bm = bm; this.tile = tile; this.margin = margin; this.tol = tol; this.keep = keep;
    this.cache = new Map(); this.ws = new Workspace();
  }
  points(tx, ty) {
    const key = tx + ',' + ty;
    let t = this.cache.get(key);
    if (t) { this.cache.delete(key); this.cache.set(key, t); return t; }
    const { bm, tile, margin } = this;
    const x0 = tx * tile, y0 = ty * tile, x1 = Math.min(bm.w, x0 + tile), y1 = Math.min(bm.h, y0 + tile);
    t = [];
    if (x1 - x0 >= 3 && y1 - y0 >= 3) {
      // trace the tile with a margin; a line that runs out of the window and passes through the tile makes the window bigger
      // (up to MAX_WIN pixels a side), so a long wall still has its ends and its middle
      let m = margin, win, r;
      for (let round = 0; round < 4; round++) {
        win = [Math.max(0, x0 - m), Math.max(0, y0 - m), Math.min(bm.w, x1 + m), Math.min(bm.h, y1 + m)];
        r = trace(bm, { win, tol: this.tol, minLen: 4, hatch: false, textMax: 6 }, this.ws);
        const cutAt = (x, y) => (win[0] > 0 && x <= win[0] + 2) || (win[1] > 0 && y <= win[1] + 2) || (win[2] < bm.w && x >= win[2] - 2) || (win[3] < bm.h && y >= win[3] - 2);
        const crosses = (l) => clipSegment(l.x1, l.y1, l.x2, l.y2, x0, y0, x1, y1);
        const open = r.lines.some((l) => (cutAt(l.x1, l.y1) || cutAt(l.x2, l.y2)) && crosses(l));
        if (!open || win[2] - win[0] >= MAX_WIN || m >= MAX_WIN) break;
        m *= 2.5;
      }
      for (const p of snapPointsOf(r, 3, [win[0], win[1], win[2], win[3], bm.w, bm.h])) if (p.x >= x0 && p.x < x1 && p.y >= y0 && p.y < y1) t.push(p);
    }
    this.cache.set(key, t);
    if (this.cache.size > this.keep) this.cache.delete(this.cache.keys().next().value);
    return t;
  }
  near(px, py, r, kinds = { end: true, mid: true, int: true, cen: true }) {
    let best = null;
    const tx0 = Math.floor((px - r) / this.tile), tx1 = Math.floor((px + r) / this.tile), ty0 = Math.floor((py - r) / this.tile), ty1 = Math.floor((py + r) / this.tile);
    for (let ty = Math.max(0, ty0); ty <= ty1; ty++) for (let tx = Math.max(0, tx0); tx <= tx1; tx++) {
      for (const p of this.points(tx, ty)) {
        if (!kinds[p.kind]) continue;
        const d = Math.hypot(p.x - px, p.y - py);
        if (d <= r && (!best || d < best.d - (p.kind === 'int' || p.kind === 'end' ? 0.5 : 0))) best = { x: p.x, y: p.y, kind: p.kind, d };
      }
    }
    return best;
  }
}
