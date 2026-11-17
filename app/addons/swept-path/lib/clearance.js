/* SPDX-License-Identifier: Apache-2.0 */
/**
 * clearance.js — where a run touches something (SW.5). Obstacles are polylines or closed polygons ({ id, name, pts, closed }); a run is
 * what run.js returns. Every body polygon of every frame is tested against every obstacle; the first frame that comes within `margin`
 * (project units) is the conflict for that obstacle, and the closest approach over the whole run is kept too.
 *
 *   check(result, obstacles, { margin }) → { conflicts: [{ id, name, s, distance, at: {x, y}, frame }], clear: [{ id, name, closest }], tested, ok }
 *   distance 0 = the body crosses or sits on the obstacle; a conflict is distance < margin (or 0 when margin is 0 and the body touches).
 */
import { bbox, polyDist, fin } from './geom.js';

export function check(result, obstacles, { margin = 0, look = 25 } = {}) {   // look: only obstacles within this of a body are measured (closest approach is reported inside it)
  const m = fin(margin) && margin > 0 ? margin : 0, pad = Math.max(m, fin(look) && look > 0 ? look : 0);
  const obs = (obstacles || []).filter((o) => o && Array.isArray(o.pts) && o.pts.length).map((o, i) => ({ id: String(o.id ?? 'o' + (i + 1)), name: String(o.name ?? o.id ?? 'obstacle ' + (i + 1)), pts: o.pts, closed: !!o.closed && o.pts.length >= 3, bb: bbox(o.pts) }));
  const first = new Map(), closest = new Map();
  let tested = 0;
  for (const [fi, f] of (result?.frames || []).entries()) {
    for (const body of f.bodies) {
      const b = bbox(body);
      for (const o of obs) {
        if (b.maxX + pad < o.bb.minX || b.minX - pad > o.bb.maxX || b.maxY + pad < o.bb.minY || b.minY - pad > o.bb.maxY) continue;
        tested++;
        const d = polyDist(body, o.pts, o.closed);
        const c = closest.get(o.id);
        if (!c || d < c.distance) closest.set(o.id, { distance: d, s: f.s });
        if ((d < m || d === 0) && !first.has(o.id)) first.set(o.id, { id: o.id, name: o.name, s: f.s, distance: d, frame: fi, at: nearestPoint(body, o.pts) });
      }
    }
  }
  const conflicts = [...first.values()].sort((a, b) => a.s - b.s);
  const clear = obs.filter((o) => !first.has(o.id)).map((o) => ({ id: o.id, name: o.name, closest: closest.has(o.id) ? closest.get(o.id).distance : null }));
  return { conflicts, clear, tested, ok: conflicts.length === 0, margin: m };
}
/** The obstacle vertex closest to the body (where to put the marker); good enough to jump to. */
function nearestPoint(body, pts) {
  let best = pts[0], bd = Infinity;
  const cx = body.reduce((s, p) => s + p.x, 0) / body.length, cy = body.reduce((s, p) => s + p.y, 0) / body.length;
  for (const p of pts) { const d = Math.hypot(p.x - cx, p.y - cy); if (d < bd) { bd = d; best = p; } }
  return { x: best.x, y: best.y };
}
