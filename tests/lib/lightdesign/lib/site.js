/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site.js — exterior site lighting (0.10 SU.1816, session `night-light-10`). DOM-free.
 *
 * An outdoor area (a car park, a path, a forecourt) is lit by luminaires on poles or bollards. There is no ceiling and no wall to bounce light back, so what is
 * calculated is the DIRECT illuminance on the ground (E = I(γ, C) cos θ / d², photometry.js), blocked by the boxes you list (buildings, trees). The ground and
 * the buildings do reflect light in real life and in the night picture; the numbers leave that out and the notes say so (a small error for dark paving).
 *
 *   runSite({ room, luminaires, llf, spacing, obstacles, requirements }) → the same result shape as runDesign (em, emin, emax, uo, grid, ...) with `outdoor: true`
 * room = { polygon (mm), height (the mounting height, informational), workplane (the ground, 0 mm, or the height you measure at) }.
 */
import { cleanRoom, polyArea, autoSpacing } from './calc.js';
import { gridPoints, stats, DEFAULT_LLF } from './photometry.js';
import { directAt, hiddenByObstacle } from './obstruct.js';
import { checkResult } from './standards.js';

export const SITE_NOTES = ['note.site', 'note.llf'];
export function runSite({ room: roomIn, luminaires, llf = DEFAULT_LLF.value, spacing = 0, obstacles = null, requirements = {} }) {
  if (!luminaires || !luminaires.length) throw Object.assign(new Error('no luminaires'), { key: 'err.noluminaires' });
  const rm = cleanRoom({ ...roomIn, margin: roomIn && roomIn.margin !== undefined ? roomIn.margin : 0 });
  const sp = spacing > 0 ? spacing : autoSpacing(rm.polygon);
  const g = gridPoints(rm.polygon, { spacing: sp, height: rm.workplane, margin: rm.margin });
  let pts = g.points;
  if (!pts.length) { const g2 = gridPoints(rm.polygon, { spacing: sp, height: rm.workplane, margin: 0 }); pts = g2.points; Object.assign(g, g2); }
  let excluded = 0;
  if (obstacles && obstacles.length) { const keep = pts.filter((p) => !hiddenByObstacle(p, obstacles)); excluded = pts.length - keep.length; pts = keep; }
  if (!pts.length) throw Object.assign(new Error('no grid'), { key: 'err.nogrid' });
  const direct = pts.map((p) => directAt(luminaires, p, [0, 0, 1], obstacles)), values = direct.map((x) => x * llf), st = stats(values);
  const lumens = luminaires.reduce((s, L) => s + (L.photo.lumens || 0) * (L.scale ?? 1), 0), watts = luminaires.reduce((s, L) => s + (L.photo.watts || 0) * (L.scale ?? 1), 0), areaM2 = polyArea(rm.polygon);
  const res = {
    outdoor: true, room: rm, grid: { points: pts, values, spacing: sp, nx: g.nx, ny: g.ny }, stats: { min: st.min, avg: st.avg, max: st.max, uo: st.minAvg, u1: st.minMax },
    em: st.avg, emin: st.min, emax: st.max, uo: st.minAvg, surfaces: { floor: st.avg, ceiling: 0, walls: 0 }, directShare: 1,
    lumens, watts, count: luminaires.length, areaM2, lpd: areaM2 > 0 ? watts / areaM2 : 0, lpd100: st.avg > 0 && areaM2 > 0 ? (watts / areaM2) / (st.avg / 100) : 0,
    llf, patches: 0, excluded, obstacles: obstacles ? obstacles.length : 0, ugr: null, observers: [], ra: 0, luminaires,
  };
  res.checks = checkResult(res, requirements, { ugr: null, ra: 0 });
  res.notes = SITE_NOTES.slice();
  if (obstacles && obstacles.length) res.notes.push('note.obstruct');
  return res;
}
/** The lux (maintained) at one point of the ground [x, y] mm, for the false-colour view: the same sum as the grid. */
export function siteLuxAt(luminaires, x, y, z, { llf = DEFAULT_LLF.value, obstacles = null } = {}) {
  return directAt(luminaires, [x, y, z], [0, 0, 1], obstacles) * llf;
}
