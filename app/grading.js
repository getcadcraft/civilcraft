/* SPDX-License-Identifier: Apache-2.0 */
/**
 * grading.js — pads daylighted to a surface, the proposed surface, and cut/fill volumes. No DOM.
 *
 *   daylightPad(surface, { pts, z, cut = 2, fill = 2 }, { spacing, fanStep }) →
 *       { rays: [{ x0, y0, x, y, z, d, kind:'cut'|'fill'|'flat' }], daylight: [{x,y,z}], problems: [] }
 *     A pad is a flat polygon at elevation z. From its edge the ground is graded outward at the cut
 *     slope (H:V, going up) where the surface is above the pad and the fill slope (going down) where
 *     it is below, until the slope meets the surface (the daylight line). Rays leave each edge square
 *     to it every `spacing` (default: about 1/20 of the pad's size), fan round convex corners every
 *     `fanStep` (default 10°), and run along the bisector at concave corners (where the two
 *     slopes meet, so they climb more slowly: rate × cos(half the turn)).
 *     0.4 V14: a corner may carry its own elevation (pts[i].z; a closed feature line graded as a sloped pad): the edge
 *     between two corners runs at a constant grade and each ray starts at the edge's elevation where it leaves; corners
 *     without z use pad.z.
 *
 *   gradedSurface(base, pads, build) → { surface, report, regions }
 *     the base surface's points outside every daylight line, plus each pad (flat, its edge a breakline)
 *     and its slopes (every ray and the daylight line as breaklines), triangulated again by build().
 *
 *   gridVolume(base, top, { cell, region, bounds }) → { cut, fill, net, cells, cell, area }
 *     the GRID method: both surfaces are sampled at the centre of every cell (cell × cell) whose centre
 *     lies on both surfaces (and inside `region` polygons when given); each cell's prism is
 *     (top − base) × cell². cut = where top is below base, fill = where it is above. The error shrinks
 *     with the cell size; a plane-to-plane difference is exact on whole cells.
 */

import { t } from "./i18n.js";
import { ccw, pointInPoly, polyArea } from './tin.js';

export function daylightPad(surface, pad, { spacing, fanStep = Math.PI / 18, maxDist } = {}) {
  const problems = [];
  const poly = ccw(pad.pts.filter((p, i, a) => i === 0 || Math.hypot(p.x - a[i - 1].x, p.y - a[i - 1].y) > 1e-9));
  if (poly.length > 2 && Math.hypot(poly[0].x - poly[poly.length - 1].x, poly[0].y - poly[poly.length - 1].y) < 1e-9) poly.pop();
  if (poly.length >= 4 && selfCrosses(poly)) return { rays: [], daylight: [], problems: [t('grade.err.cross')], poly };
  if (poly.length < 3 || Math.abs(polyArea(poly)) < 1e-9) return { rays: [], daylight: [], problems: [t('grade.err.three')], poly };
  const cut = Number(pad.cut), fill = Number(pad.fill), z = Number(pad.z);
  const zv = (p) => (Number.isFinite(p.z) ? p.z : z);   // 0.4 V14: per-corner elevations
  if (!(cut > 0) || !(fill > 0)) return { rays: [], daylight: [], problems: [t('grade.err.slopes')], poly };
  let size = 0;
  for (const p of poly) for (const q of poly) size = Math.max(size, Math.hypot(p.x - q.x, p.y - q.y));
  const sp = spacing > 0 ? spacing : Math.max(size / 20, 0.5);
  const sb = surface.bounds, far = maxDist || 2 * Math.hypot(sb.maxX - sb.minX, sb.maxY - sb.minY);

  const n = poly.length, rays = [], concave = [];
  const edgeN = (i) => { const a = poly[i], b = poly[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y); return { x: (b.y - a.y) / L, y: -(b.x - a.x) / L, L }; };   // outward (right of a counter-clockwise edge)
  for (let i = 0; i < n; i++) {
    const v = poly[i], nIn = edgeN((i - 1 + n) % n), nOut = edgeN(i);
    const turn = Math.atan2(nIn.x * nOut.y - nIn.y * nOut.x, nIn.x * nOut.x + nIn.y * nOut.y);   // > 0 at a convex corner
    if (turn > 1e-9) {
      const a0 = Math.atan2(nIn.y, nIn.x), k = Math.max(1, Math.ceil(turn / fanStep));
      for (let j = 0; j <= k; j++) { const a = a0 + (turn * j) / k; rays.push(cast(v, Math.cos(a), Math.sin(a), 1, zv(v))); }
    } else if (turn < -1e-9) {
      const bx = nIn.x + nOut.x, by = nIn.y + nOut.y, L = Math.hypot(bx, by);
      rays.push(cast(v, bx / L, by / L, Math.cos(Math.abs(turn) / 2), zv(v)));
      concave.push({ i, v, bx: bx / L, by: by / L });
    } else rays.push(cast(v, nOut.x, nOut.y, 1, zv(v)));
    // along the edge
    const b = poly[(i + 1) % n], m = Math.max(1, Math.ceil(nOut.L / sp));
    for (let j = 1; j < m; j++) { const t = j / m; const r = cast({ x: v.x + (b.x - v.x) * t, y: v.y + (b.y - v.y) * t }, nOut.x, nOut.y, 1, zv(v) + (zv(b) - zv(v)) * t); r.edge = i; rays.push(r); }
  }
  // at a concave corner the two slopes meet along the bisector: edge rays that would reach past it are dropped
  for (const c of concave) {
    const side = (x, y) => c.bx * (y - c.v.y) - c.by * (x - c.v.x);
    for (let k = rays.length - 1; k >= 0; k--) {
      const r = rays[k];
      if (r.edge !== c.i && r.edge !== (c.i - 1 + n) % n) continue;
      const s0 = side(r.x0, r.y0), s1 = side(r.x, r.y);
      if ((s0 > 1e-9 && s1 < -1e-9) || (s0 < -1e-9 && s1 > 1e-9)) rays.splice(k, 1);
    }
  }
  const bad = rays.filter((r) => r.kind === 'off');
  if (bad.length) problems.push(t('grade.off', { n: bad.length }));
  const daylight = rays.map((r) => ({ x: r.x, y: r.y, z: r.z }));
  if (!bad.length && selfCrosses(daylight)) problems.push(t('grade.daycross'));
  return { rays, daylight, problems, poly };

  function cast(p0, ux, uy, rate, z0 = z) { const r = castSlope(surface, p0, ux, uy, z0, cut, fill, { rate, step: Math.max(sp / 4, 0.05), far }); r.z0 = z0; return r; }
}

/**
 * One slope line: from p0 (at design elevation z) outward along (ux, uy), up at `rate`/cut where the
 * ground is above z, down at `rate`/fill where it is below, to where it meets the surface.
 * → { x0, y0, x, y, z, d, kind: 'cut'|'fill'|'flat'|'off' }   ('off': left the surface first)
 */
export function castSlope(surface, p0, ux, uy, z, cut, fill, { rate = 1, step = 0.25, far = 1e4 } = {}) {
  const z0 = surface.elevationAt(p0.x, p0.y, 1e-6);
  if (z0 === null) return { x0: p0.x, y0: p0.y, x: p0.x, y: p0.y, z, d: 0, kind: 'off' };
  if (Math.abs(z0 - z) < 1e-9) return { x0: p0.x, y0: p0.y, x: p0.x, y: p0.y, z, d: 0, kind: 'flat' };
  const kind = z0 > z ? 'cut' : 'fill';
  const g = kind === 'cut' ? rate / cut : -rate / fill;   // design rise per unit outward
  const f = (d) => { const e = surface.elevationAt(p0.x + ux * d, p0.y + uy * d, 1e-6); return e === null ? null : z + g * d - e; };
  // f(0) has the sign of (design − ground); march until it changes, then bisect
  const s0 = Math.sign(f(0));
  let a = 0, b = step, fb = f(b);
  while (fb !== null && Math.sign(fb) === s0 && b < far) { a = b; b += step; fb = f(b); }
  if (fb === null || b >= far) return { x0: p0.x, y0: p0.y, x: p0.x + ux * a, y: p0.y + uy * a, z: z + g * a, d: a, kind: 'off' };
  for (let it = 0; it < 60 && b - a > 1e-7; it++) { const m = (a + b) / 2, fm = f(m); if (fm !== null && Math.sign(fm) === s0) a = m; else b = m; }
  const d = (a + b) / 2;
  return { x0: p0.x, y0: p0.y, x: p0.x + ux * d, y: p0.y + uy * d, z: z + g * d, d, kind };
}

/**
 * The base surface with every item graded in, in order (a later item grades against the result of the
 * earlier ones). An item is a pad ({ pts, z, cut, fill, name }) or anything with
 * `patch(surface) → { problems, region, points, breaklines, info }` (a corridor). The item's region
 * (its daylight polygon) replaces the base there: base points inside it and base breaklines touching it
 * are dropped, the item's own points and breaklines go in, and the lot is triangulated again by
 * `build(input)` (buildSurface, passed in so this module stays independent).
 * → { surface (null when nothing could be graded), report: { notes, errors, items: [{name, problems}] },
 *     regions (null for a failed item), items (each daylightPad result or patch info) }
 */
export function gradedSurface(base, basePoints, baseBreaklines, items, build) {
  const regions = [], report = { notes: [], errors: [], items: [] }, infos = [];
  let surf = base, points = basePoints.slice(), breaklines = baseBreaklines.slice(), any = false;
  for (const item of items) {
    const pt = item.patch ? item.patch(surf) : padPatch(surf, item);
    report.items.push({ name: item.name, problems: pt.problems });
    infos.push(pt.info);
    if (pt.problems.length || !pt.region || pt.region.length < 3) { regions.push(null); continue; }
    const region = pt.region;
    regions.push(region);
    // inside the region or on its edge (a ground point on the edge would pin the new surface to the old ground)
    const inside = (p) => pointInPoly(p.x, p.y, region) || nearPoly(p, region, 1e-6);
    points = points.filter((p) => !inside(p));
    breaklines = breaklines.filter((b) => b.pts.every((p) => !inside(p)) && !crossesPoly(b.pts, region));
    points.push(...pt.points);
    breaklines.push(...pt.breaklines);
    const built = build({ points, breaklines, boundary: null });
    if (!built.surface) { report.errors.push(...built.report.errors); return { surface: null, report, regions, items: infos }; }
    surf = built.surface; any = true;
    report.notes.push(...built.report.notes);
  }
  return { surface: any ? surf : null, report, regions, items: infos };
}

function padPatch(surf, pad) {
  const dl = daylightPad(surf, pad, pad.options || {});
  if (dl.problems.length || !dl.rays.length) return { problems: dl.problems.length ? dl.problems : [t('grade.none')], region: null, points: [], breaklines: [], info: dl };
  const region = dl.daylight, padZ = Number(pad.z), bl = [], zv = (p) => (Number.isFinite(p.z) ? p.z : padZ);
  bl.push({ name: t('grade.bl.edge', { name: pad.name || t('scene.pad.default') }), pts: [...dl.poly, dl.poly[0]].map((p) => ({ x: p.x, y: p.y, z: zv(p) })) });
  bl.push({ name: t('grade.bl.daylight', { name: pad.name || t('scene.pad.default') }), pts: [...region, region[0]].map((p) => ({ x: p.x, y: p.y, z: p.z })) });
  for (const r of dl.rays) if (r.d > 1e-6) bl.push({ name: 'slope', pts: [{ x: r.x0, y: r.y0, z: r.z0 ?? padZ }, { x: r.x, y: r.y, z: r.z }] });
  return { problems: [], region, points: [], breaklines: bl, info: dl };
}

export function gridVolume(base, top, { cell, region = null, bounds = null, maxCells = 4e6 } = {}) {
  const ba = base.bounds, bb = top.bounds;
  let b = bounds || { minX: Math.max(ba.minX, bb.minX), minY: Math.max(ba.minY, bb.minY), maxX: Math.min(ba.maxX, bb.maxX), maxY: Math.min(ba.maxY, bb.maxY) };
  const regions = region ? (Array.isArray(region[0]) ? region : [region]).filter(Boolean) : null;
  if (regions && regions.length) {
    const r = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
    for (const poly of regions) for (const p of poly) { r.minX = Math.min(r.minX, p.x); r.minY = Math.min(r.minY, p.y); r.maxX = Math.max(r.maxX, p.x); r.maxY = Math.max(r.maxY, p.y); }
    b = { minX: Math.max(b.minX, r.minX), minY: Math.max(b.minY, r.minY), maxX: Math.min(b.maxX, r.maxX), maxY: Math.min(b.maxY, r.maxY) };
  }
  const W = b.maxX - b.minX, H = b.maxY - b.minY;
  if (!(W > 0 && H > 0)) return { cut: 0, fill: 0, net: 0, cells: 0, cell: cell || 0, area: 0 };
  let c = cell > 0 ? cell : niceCell(Math.sqrt((W * H) / 250000));
  while ((W / c) * (H / c) > maxCells) c *= 2;
  // cells on a grid anchored at whole multiples of c, so results do not depend on the bounds
  const i0 = Math.floor(b.minX / c), i1 = Math.ceil(b.maxX / c), j0 = Math.floor(b.minY / c), j1 = Math.ceil(b.maxY / c);
  let cutV = 0, fillV = 0, cells = 0;
  const A = c * c;
  for (let j = j0; j < j1; j++) {
    const y = (j + 0.5) * c;
    for (let i = i0; i < i1; i++) {
      const x = (i + 0.5) * c;
      if (regions && !regions.some((poly) => pointInPoly(x, y, poly))) continue;
      const z0 = base.elevationAt(x, y), z1 = top.elevationAt(x, y);
      if (z0 === null || z1 === null) continue;
      cells++;
      const dz = z1 - z0;
      if (dz > 0) fillV += dz * A; else cutV -= dz * A;
    }
  }
  return { cut: cutV, fill: fillV, net: fillV - cutV, cells, cell: c, area: cells * A };
}

function niceCell(v) {
  if (!(v > 0)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p;
  return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
}

/** True when a closed polygon's edges cross (not at shared corners). */
export function selfCrosses(pts) {
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    for (let j = i + 2; j < n; j++) {
      if (i === 0 && j === n - 1) continue;
      const c = pts[j], d = pts[(j + 1) % n];
      if (properCross(a, b, c, d)) return true;
    }
  }
  return false;
}
function properCross(a, b, c, d) {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12));
}
function nearPoly(p, poly, tol) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
    if (Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t) <= tol) return true;
  }
  return false;
}
function crossesPoly(line, poly) {
  for (let i = 0; i + 1 < line.length; i++) for (let j = 0; j < poly.length; j++) if (properCross(line[i], line[i + 1], poly[j], poly[(j + 1) % poly.length])) return true;
  return false;
}
