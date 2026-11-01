/* SPDX-License-Identifier: Apache-2.0 */
/**
 * footprint.js — where every cell stands on the floor plan, in room coordinates (0.8 DC.117, session `cabinetcraft_addon` round 2). DOM-free, pure.
 *
 *   footprints(build) → [{ no, run, row ('base' | 'upper'), kind ('cab' | 'endpanel' | 'filler'), cell, pieces: [[[x, y]…] convex polygons], bbox: [x0, y0, x1, y1], z0, z1 }]
 *     the floor row's cabinets (with their doors), end panels and the corner cabinets' arms; the upper row's hung cabinets (z from their elevation)
 *   overlap(polyA, polyB) → how far two convex polygons overlap (0 when apart or just touching) · rectGap(a, b) → distance between two [x0, y0, x1, y1]
 *   toWorld(frame, s, o) → { x, y }
 */
import { r6 } from './core.js';

export const toWorld = (frame, s, o) => ({ x: r6(frame.o.x + frame.u.x * s + frame.n.x * o), y: r6(frame.o.y + frame.u.y * s + frame.n.y * o) });
/** Where a cell stands: a cell on a curved wall has its own frame (`pf`, x from its own start); any other is placed by its run's frame at c.x. */
export const cellFrame = (L, c) => (c.pf ? { frame: c.pf, s: 0 } : { frame: L.frame, s: c.x });
/** A point (x, y) in the cell's own local frame (x along it from its start, y out from its back) in room coordinates. */
export const cellToWorld = (L, c, x, y) => { const f = cellFrame(L, c); return toWorld(f.frame, f.s + x, y); };

export function footprints(build) {
  const { layout, R, F, project } = build;
  const out = [];
  const byNo = new Map(build.cells.map((c) => [c.no, c]));
  for (const L of layout.runs) for (const row of ['base', 'upper']) for (const c of L.rows[row].cells) {
    if (c.kind === 'gap' || c.kind === 'filler') continue;
    let local;
    let z0 = 0, z1 = 0;
    if (c.kind === 'endpanel') { const sx = c.pf ? 0 : c.x; local = [[[sx, 0], [sx + c.w, 0], [sx + c.w, c.depth], [sx, c.depth]]]; z1 = c.height; }
    else {
      const b = byNo.get(c.no);
      const sx = c.pf ? 0 : c.x;
      if (c.curved) local = null;
      else if (b && b.corner) local = b.corner.footprint.map((poly) => poly.map(([x, y]) => [sx + x, y]));
      else {
        const depth = c.cab.d;   // the carcass (and frame): doors stand a few mm proud at a corner, which is what a filler is for
        local = [[[sx, 0], [sx + c.w, 0], [sx + c.w, depth], [sx, depth]]];
      }
      z0 = c.cab.elev || 0; z1 = z0 + c.cab.h;
    }
    const fr = c.pf || L.frame;
    const pieces = local ? local.map((poly) => poly.map(([s, o]) => { const p = toWorld(fr, s, o); return [p.x, p.y]; })) : c.curved.slices;   // a curved-front cabinet: its ring sector in convex slices
    const xs = pieces.flat().map((p) => p[0]), ys = pieces.flat().map((p) => p[1]);
    out.push({ no: c.no, run: L.run.id, island: L.island ? L.island.id : null, row, kind: c.kind, cell: c, pieces, bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], z0, z1 });
  }
  void F; void project;
  return out;
}

/** Penetration depth of two convex polygons (separating axis test); 0 when they only touch or are apart. */
export function overlap(A, B) {
  let best = Infinity;
  for (const poly of [A, B]) {
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const nx = q[1] - p[1], ny = p[0] - q[0], len = Math.hypot(nx, ny);
      if (len < 1e-9) continue;
      const proj = (P) => { let lo = Infinity, hi = -Infinity; for (const [x, y] of P) { const v = (x * nx + y * ny) / len; if (v < lo) lo = v; if (v > hi) hi = v; } return [lo, hi]; };
      const [a0, a1] = proj(A), [b0, b1] = proj(B);
      const o = Math.min(a1, b1) - Math.max(a0, b0);
      if (o <= 1e-6) return 0;
      if (o < best) best = o;
    }
  }
  return Number.isFinite(best) ? best : 0;
}

export function rectGap([ax0, ay0, ax1, ay1], [bx0, by0, bx1, by1]) {
  const dx = Math.max(bx0 - ax1, ax0 - bx1, 0), dy = Math.max(by0 - ay1, ay0 - by1, 0);
  return Math.hypot(dx, dy);
}

/** Distance between two sets of convex polygons (0 when they touch or overlap). */
export function polyGap(setA, setB) {
  const segDist = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; const t = L2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / L2)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); };
  let best = Infinity;
  for (const A of setA) for (const B of setB) {
    if (overlap(A, B) > 0) return 0;
    for (const [P, Q] of [[A, B], [B, A]]) for (const p of P) for (let i = 0; i < Q.length; i++) best = Math.min(best, segDist(p, Q[i], Q[(i + 1) % Q.length]));
  }
  return best === Infinity ? 0 : best;
}
