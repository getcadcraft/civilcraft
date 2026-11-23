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
 *     0.7.1 71.22: pad.sides (sides.js) = each side its own cut and fill slopes, or a vertical RETAINING WALL: sides.edges[k]
 *     is the side from pts[k] to pts[k + 1] ({ wall, cut, fill }, any left out = the pad's). A wall side has no embankment: its
 *     rays (kind 'wall') run sides.wallT outward to the ground (the wall's thickness, the surface steps there from the pad
 *     edge to the ground), so the daylight line is the wall's outer face and no slope is graded. Corners: two walls meet in a
 *     mitre; where a wall meets a slope the slope's fan wraps the wall's end. Every edge ray carries `k` (the pad's side);
 *     result + `walls` (sides.js wallRuns) and `warnings` (sides.js sideWarnings: tall walls, slopes steeper than allowed).
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
import { wallRuns, sideWarnings } from './sides.js';   // 0.7.1 71.22: walls and slope settings per side

export function daylightPad(surface, pad, { spacing, fanStep = Math.PI / 18, maxDist } = {}) {
  const problems = [];
  const kept = pad.pts.map((p, k) => ({ ...p, _k: k })).filter((p, i, a) => i === 0 || Math.hypot(p.x - a[i - 1].x, p.y - a[i - 1].y) > 1e-9);   // _k: 0.7.1 71.22
  const rev = polyArea(kept) < 0;
  const poly = ccw(kept);
  if (poly.length > 2 && Math.hypot(poly[0].x - poly[poly.length - 1].x, poly[0].y - poly[poly.length - 1].y) < 1e-9) poly.pop();
  if (poly.length >= 4 && selfCrosses(poly)) return { rays: [], daylight: [], problems: [t('grade.err.cross')], poly };
  if (poly.length < 3 || Math.abs(polyArea(poly)) < 1e-9) return { rays: [], daylight: [], problems: [t('grade.err.three')], poly };
  const cut = Number(pad.cut), fill = Number(pad.fill), z = Number(pad.z);
  const zv = (p) => (Number.isFinite(p.z) ? p.z : z);   // 0.4 V14: per-corner elevations
  if (!(cut > 0) || !(fill > 0)) return { rays: [], daylight: [], problems: [t('grade.err.slopes')], poly };
  // 0.7.1 71.22: the settings of the side that runs from poly[i] to poly[i + 1] (its index k in pad.pts, whichever way round)
  const S = pad.sides || null, wallT = Number(S?.wallT) > 0 ? Number(S.wallT) : 0;
  const sideOf = (i) => {
    const a = poly[i], b = poly[(i + 1) % poly.length], k = rev ? b._k : a._k, e = S?.edges?.[k] || null;
    return { k, wall: !!e?.wall && wallT > 0, cut: Number(e?.cut) > 0 ? Number(e.cut) : cut, fill: Number(e?.fill) > 0 ? Number(e.fill) : fill };
  };
  let size = 0;
  for (const p of poly) for (const q of poly) size = Math.max(size, Math.hypot(p.x - q.x, p.y - q.y));
  const sp = spacing > 0 ? spacing : Math.max(size / 20, 0.5);
  const sb = surface.bounds, far = maxDist || 2 * Math.hypot(sb.maxX - sb.minX, sb.maxY - sb.minY);

  const n = poly.length, rays = [], concave = [];
  const edgeN = (i) => { const a = poly[i], b = poly[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y); return { x: (b.y - a.y) / L, y: -(b.x - a.x) / L, L }; };   // outward (right of a counter-clockwise edge)
  for (let i = 0; i < n; i++) {
    const v = poly[i], nIn = edgeN((i - 1 + n) % n), nOut = edgeN(i);
    const sIn = sideOf((i - 1 + n) % n), sOut = sideOf(i);   // 0.7.1 71.22
    const turn = Math.atan2(nIn.x * nOut.y - nIn.y * nOut.x, nIn.x * nOut.x + nIn.y * nOut.y);   // > 0 at a convex corner
    if (sIn.wall && sOut.wall && Math.abs(turn) > 1e-9) {   // two walls: a mitre
      const bx = nIn.x + nOut.x, by = nIn.y + nOut.y, L = Math.hypot(bx, by);
      rays.push(wall(v, bx / L, by / L, wallT / Math.max(0.25, Math.cos(Math.abs(turn) / 2)), zv(v), sOut.k));
    } else if (turn > 1e-9) {
      // a wall's end: its own ray, then the slope's fan round the corner (without the ray along the wall)
      const a0 = Math.atan2(nIn.y, nIn.x), k = Math.max(1, Math.ceil(turn / fanStep));
      if (sIn.wall) rays.push(wall(v, nIn.x, nIn.y, wallT, zv(v), sIn.k));
      for (let j = sIn.wall ? 1 : 0; j <= (sOut.wall ? k - 1 : k); j++) { const a = a0 + (turn * j) / k; rays.push(cast(v, Math.cos(a), Math.sin(a), 1, zv(v), j * 2 <= k ? (sIn.wall ? sOut : sIn) : (sOut.wall ? sIn : sOut))); }
      if (sOut.wall) rays.push(wall(v, nOut.x, nOut.y, wallT, zv(v), sOut.k));
    } else if (turn < -1e-9) {
      const bx = nIn.x + nOut.x, by = nIn.y + nOut.y, L = Math.hypot(bx, by);
      rays.push(cast(v, bx / L, by / L, Math.cos(Math.abs(turn) / 2), zv(v), sIn.wall ? sOut : sIn));
      concave.push({ i, v, bx: bx / L, by: by / L });
    } else rays.push(sOut.wall || sIn.wall ? wall(v, nOut.x, nOut.y, wallT, zv(v), sOut.wall ? sOut.k : sIn.k) : cast(v, nOut.x, nOut.y, 1, zv(v), sOut));   // in line: a wall runs to the corner
    // along the edge
    const b = poly[(i + 1) % n], m = Math.max(1, Math.ceil(nOut.L / sp));
    for (let j = 1; j < m; j++) {
      const t = j / m, p = { x: v.x + (b.x - v.x) * t, y: v.y + (b.y - v.y) * t }, ze = zv(v) + (zv(b) - zv(v)) * t;
      const r = sOut.wall ? wall(p, nOut.x, nOut.y, wallT, ze, sOut.k) : cast(p, nOut.x, nOut.y, 1, ze, sOut);
      r.edge = i; rays.push(r);
    }
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
  const out = { rays, daylight, problems, poly };
  if (S) { out.walls = wallRuns(rays); out.warnings = sideWarnings(out, pad); }   // 0.7.1 71.22
  return out;

  function cast(p0, ux, uy, rate, z0 = z, sd = null) {
    const r = castSlope(surface, p0, ux, uy, z0, sd ? sd.cut : cut, sd ? sd.fill : fill, { rate, step: Math.max(sp / 4, 0.05), far });
    r.z0 = z0;
    if (sd) r.k = sd.k;
    return r;
  }
  /** 0.7.1 71.22: a wall side's ray: the wall's thickness out to the ground behind (or in front of) it, no slope. */
  function wall(p0, ux, uy, d, z0, k) {
    const x = p0.x + ux * d, y = p0.y + uy * d, g = surface.elevationAt(x, y, 1e-6);
    return { x0: p0.x, y0: p0.y, x, y, z: g ?? z0, d, kind: g === null ? 'off' : 'wall', z0, k };
  }
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
 * (its daylight polygon) replaces the base there: base points inside it and the parts of base breaklines inside it
 * are dropped (0.10.1 #1977: only those parts; the rest of each line stays), the item's own points and breaklines go in, and the lot is triangulated again by
 * `build(input)` (buildSurface, passed in so this module stays independent).
 * 0.10.1 #1970: a patch may instead return `overlay: true` with breaklines only (an open design feature line): they are laid
 * into the surface as it stands (after everything before it), the item's region is the triangles they touch (starRegion).
 * → { surface (null when nothing could be graded), report: { notes, errors, items: [{name, problems}] },
 *     regions (null for a failed item), items (each daylightPad result or patch info) }
 */
export function gradedSurface(base, basePoints, baseBreaklines, items, build) {
  const regions = [], extra = [], report = { notes: [], errors: [], items: [] }, infos = [];
  let surf = base, points = basePoints.slice(), breaklines = baseBreaklines.slice(), any = false;
  for (const item of items) {
    const pt = item.patch ? item.patch(surf) : padPatch(surf, item);
    report.items.push({ name: item.name, problems: pt.problems });
    infos.push(pt.info);
    if (pt.overlay) {   // 0.10.1 #1970: breaklines laid INTO the surface as it stands (a design feature line): nothing is cut out
      if (pt.problems.length || !pt.breaklines.length) { regions.push(null); continue; }
      const on = (p) => pt.breaklines.some((b) => nearLine(p, b.pts, 1e-3));   // a ground point on the line would pin it to the old ground
      const pts2 = points.filter((p) => !on(p)), bl2 = [...breaklines, ...pt.breaklines];
      const built = build({ points: pts2, breaklines: bl2, boundary: null });
      if (!built.surface) { pt.problems.push(...(built.report.errors.length ? built.report.errors : [t('grade.none')])); regions.push(null); continue; }   // this line is left out; the rest stands
      points = pts2; breaklines = bl2; surf = built.surface; any = true;
      const region = starRegion(surf, pt.breaklines);
      if (pt.info) pt.info.inside = !!region && regions.some((r) => r && region.every((p) => pointInPoly(p.x, p.y, r) || nearPoly(p, r, 1e-6)));
      regions.push(region);
      continue;
    }
    if (pt.problems.length || !pt.region || pt.region.length < 3) { regions.push(null); continue; }
    regions.push(pt.region);
    // 0.10.1 #1977: a patch may come in more pieces (`more`: [{ region, points, breaklines }]: a path cut in two by a road). Each
    // is laid in like the first; their regions go after every item's own (regions[i] stays item i's).
    let failed = false;
    for (const piece of [pt, ...(pt.more || [])]) {
      const region = piece.region;
      if (!region || region.length < 3) continue;
      if (piece !== pt) extra.push(region);
      // inside the region or on its edge (a ground point on the edge would pin the new surface to the old ground)
      const inside = (p) => pointInPoly(p.x, p.y, region) || nearPoly(p, region, 1e-6);
      points = points.filter((p) => !inside(p));
      breaklines = breaklines.flatMap((b) => outsideRuns(b, inside, region));   // 0.10.1 #1977: the parts outside stay (the whole line used to go)
      points.push(...(piece.points || []));
      breaklines.push(...(piece.breaklines || []));
      const built = build({ points, breaklines, boundary: null });
      if (!built.surface) { report.errors.push(...built.report.errors); failed = true; break; }
      surf = built.surface; any = true;
      report.notes.push(...built.report.notes);
    }
    if (failed) return { surface: null, report, regions: [...regions, ...extra], items: infos };
  }
  return { surface: any ? surf : null, report, regions: [...regions, ...extra], items: infos };
}

/** 0.10.1 #1977: what is left of a breakline when a region replaces the surface there: its runs of two or more points outside
 *  the region whose pieces do not cross the region's edge, each run carried to within 0.05 of where the line crosses that edge
 *  (at the line's own elevation there). A line the region does not touch comes back as it is. Before this a
 *  line that touched a later item's region was dropped whole, so a road lost its edge lines along its whole length where a
 *  second road or a pad met it. */
function outsideRuns(b, inside, region) {
  if (b.pts.every((p) => !inside(p)) && !crossesPoly(b.pts, region)) return [b];
  const out = [], GAP = 0.05;
  let run = [];
  const flush = () => { if (run.length >= 2) out.push({ ...b, pts: run }); run = []; };
  // where a→q crosses the region's edge, as fractions along it
  const cuts = (a, q) => {
    const us = [], dx = q.x - a.x, dy = q.y - a.y;
    for (let j = 0; j < region.length; j++) {
      const c = region[j], d = region[(j + 1) % region.length], ex = d.x - c.x, ey = d.y - c.y, den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-15) continue;
      const u = ((c.x - a.x) * ey - (c.y - a.y) * ex) / den, v = ((c.x - a.x) * dy - (c.y - a.y) * dx) / den;
      if (u > 0 && u < 1 && v >= 0 && v <= 1) us.push(u);
    }
    return us.sort((m, n) => m - n);
  };
  // the point of a→q a little short of fraction u (toward `to`: 0 = back toward a, 1 = on toward q), still outside the region
  const at = (a, q, u, to) => {
    const L = Math.hypot(q.x - a.x, q.y - a.y), g = L > 0 ? GAP / L : 0, w = to ? u + g : u - g;
    if (!(w > 1e-9 && w < 1 - 1e-9)) return null;
    const p = { ...a, x: a.x + (q.x - a.x) * w, y: a.y + (q.y - a.y) * w, z: a.z + (q.z - a.z) * w };
    return inside(p) ? null : p;
  };
  for (let i = 0; i < b.pts.length; i++) {
    const p = b.pts[i], a = i ? b.pts[i - 1] : null, us = a ? cuts(a, p) : [];
    const aIn = a ? inside(a) : true, pIn = inside(p);
    if (a && us.length) {
      // the line stops just short of where it goes in, and starts again just past where it last comes out
      if (!aIn && run.length) { const q = at(a, p, us[0], 0); if (q) run.push(q); }
      flush();
      if (!pIn) { const q = at(a, p, us[us.length - 1], 1); if (q) run.push(q); }
    } else if (pIn || aIn) flush();
    if (!pIn) run.push(p);
  }
  flush();
  return out;
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
function nearLine(p, line, tol) {
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i], b = line[i + 1], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
    const u = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
    if (Math.hypot(p.x - a.x - dx * u, p.y - a.y - dy * u) <= tol) return true;
  }
  return false;
}
/**
 * 0.10.1 #1970: the part of a surface a breakline shapes: every triangle with a corner on one of `lines` ([{ pts }]), as one
 * outline [{x, y}] (the largest loop of their outer edges), or null. Volumes, sections and the cut and fill map count the
 * design there, as they do inside a pad's daylight line.
 */
export function starRegion(surface, lines) {
  const { X, Y, tris, ox, oy } = surface;
  if (!X || !tris) return null;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const l of lines) for (const p of l.pts) { minX = Math.min(minX, p.x); minY = Math.min(minY, p.y); maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y); }
  const onLine = new Uint8Array(X.length);
  for (let i = 0; i < X.length; i++) {
    const p = { x: X[i] + ox, y: Y[i] + oy };
    if (p.x < minX - 1e-3 || p.x > maxX + 1e-3 || p.y < minY - 1e-3 || p.y > maxY + 1e-3) continue;
    if (lines.some((l) => nearLine(p, l.pts, 1e-4))) onLine[i] = 1;
  }
  const edges = new Map();   // an edge of the chosen triangles seen once is on their outline
  const edge = (a, b) => { const k = a < b ? a + '|' + b : b + '|' + a; if (edges.has(k)) edges.delete(k); else edges.set(k, [a, b]); };
  for (let k = 0; k < tris.length; k += 3) {
    const a = tris[k], b = tris[k + 1], c = tris[k + 2];
    if (onLine[a] || onLine[b] || onLine[c]) { edge(a, b); edge(b, c); edge(c, a); }
  }
  if (edges.size < 3) return null;
  const nextOf = new Map();
  for (const [a, b] of edges.values()) { if (!nextOf.has(a)) nextOf.set(a, []); if (!nextOf.has(b)) nextOf.set(b, []); nextOf.get(a).push(b); nextOf.get(b).push(a); }
  const used = new Set(), key = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  let best = null, bestA = 0;
  for (const [a0, b0] of edges.values()) {
    if (used.has(key(a0, b0))) continue;
    const loop = [a0];
    let prev = a0, cur = b0;
    used.add(key(a0, b0));
    for (let guard = 0; guard <= edges.size && cur !== a0; guard++) {
      loop.push(cur);
      const nx = nextOf.get(cur).find((v) => !used.has(key(cur, v)));
      if (nx === undefined) break;
      used.add(key(cur, nx)); prev = cur; cur = nx;
    }
    if (cur !== a0 || loop.length < 3) continue;
    const poly = loop.map((i) => ({ x: X[i] + ox, y: Y[i] + oy })), A = Math.abs(polyArea(poly));
    if (A > bestA) { bestA = A; best = poly; }
  }
  return best;
}
function crossesPoly(line, poly) {
  for (let i = 0; i + 1 < line.length; i++) for (let j = 0; j < poly.length; j++) if (properCross(line[i], line[i + 1], poly[j], poly[(j + 1) % poly.length])) return true;
  return false;
}
