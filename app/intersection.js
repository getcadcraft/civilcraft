/* SPDX-License-Identifier: Apache-2.0 */
/**
 * intersection.js — road intersections, pavement striping and signs (0.8 EG.10). No DOM, no strings, no imports. Plan units are the caller's (all lengths
 * in one unit, project length); speeds in km/h, ISD in metres through `isd` (convert on the way in). No signal timing. A calculation aid: the
 * authority's standard (MUTCD, TSM, the national manual) fixes every limit, so each number here is a setting with a placeholder default, not a rule.
 * Tested by bin/test-civilcraft-intersection.mjs.
 *
 * Published maths (nothing copied):
 *  - Curb return as a simple radius r between two edge lines meeting at an interior angle ψ: tangent length T = r / tan(ψ/2), centre r / sin(ψ/2) from the corner
 *    on the bisector, arc angle π − ψ (Easa, Geometric Design; any surveying text).
 *  - Intersection sight distance, case B1 (left turn from the minor road) ISD = 0.278·V·tg, V in km/h on the major road, tg the time gap in seconds
 *    (AASHTO Green Book, 7th ed., ch. 9; 7.5 s for a passenger car, +0.5 s per extra lane crossed). In feet: 1.47·V(mph)·tg.
 *  - Sight triangle: the area bounded by the two legs and the line between their ends, free of objects taller than the user's height limit.
 *
 *   cornerFillet({ corner, dirA, dirB, radius }) → { T1, T2, centre, arc[], length, tangent, angle } | null   dirA / dirB unit vectors from the corner along the two edge lines
 *   intersection({ centre, legs: [{ bearing (rad, math, outward), halfWidth (to the edge of pavement), length (how far the pavement is drawn), name }], radius | radii[] })
 *        → { legs (sorted by direction), corners: [{ between: [i,j], corner, fillet }], pavement: [{x,y}] (outline), area, curbLength, problems[] }
 *   isd({ speed (km/h), gap (s), lanes (extra lanes crossed) }) → metres
 *   sightTriangle({ stop: {x,y}, major dir, minor dir, ... }) → [{x,y}×3]
 *   triangleBlocked(tri, obstacles[]) → [index of obstacles that intrude]
 *   offsetLine(line, d) → polyline offset by d (left +), mitred, limited
 *   dashSegments(line, { dash, gap, from, to }) → [[p,q,…]] the painted lengths
 *   stripe(line, plan, { breaks }) → { items: [{ kind, pts, width, colour, dashed }], quantities }
 *   signsFor(line, plan) → [{ code, name, station, offset, side, size }]
 *   crosswalk(centre, dir, width, { style, bar, gap, length }) → bars as rectangles
 */

const TAU = Math.PI * 2;
const norm = (a) => { a %= TAU; return a < 0 ? a + TAU : a; };
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const len = (a) => Math.hypot(a.x, a.y);
const unit = (a) => { const l = len(a) || 1; return { x: a.x / l, y: a.y / l }; };
const dot = (a, b) => a.x * b.x + a.y * b.y;
const crs = (a, b) => a.x * b.y - a.y * b.x;
const polyLen = (p) => { let s = 0; for (let i = 1; i < p.length; i++) s += Math.hypot(p[i].x - p[i - 1].x, p[i].y - p[i - 1].y); return s; };
export const polyArea = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a.x * b.y - b.x * a.y; } return s / 2; };

/** A circular fillet between two lines leaving `corner` along unit vectors dirA and dirB. */
export function cornerFillet({ corner, dirA, dirB, radius, step = 0.05 }) {
  const a = unit(dirA), b = unit(dirB), cosPsi = dot(a, b), psi = Math.acos(Math.max(-1, Math.min(1, cosPsi)));
  if (!(radius > 0) || psi < 1e-3 || psi > Math.PI - 1e-3) return null;
  const T = radius / Math.tan(psi / 2), bis = unit({ x: a.x + b.x, y: a.y + b.y }), cd = radius / Math.sin(psi / 2);
  const T1 = { x: corner.x + a.x * T, y: corner.y + a.y * T }, T2 = { x: corner.x + b.x * T, y: corner.y + b.y * T }, centre = { x: corner.x + bis.x * cd, y: corner.y + bis.y * cd };
  const a1 = Math.atan2(T1.y - centre.y, T1.x - centre.x), a2 = Math.atan2(T2.y - centre.y, T2.x - centre.x);
  let d = a2 - a1; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU;
  const n = Math.max(2, Math.ceil(Math.abs(d) / step)), arc = [];
  for (let i = 0; i <= n; i++) { const t = a1 + (d * i) / n; arc.push({ x: centre.x + radius * Math.cos(t), y: centre.y + radius * Math.sin(t) }); }
  return { T1, T2, centre, arc, tangent: T, angle: Math.abs(d), length: radius * Math.abs(d), radius };
}

/**
 * A three-centre compound curve between two lines leaving `corner` along dirA and dirB (the curb return of a turning vehicle: entry arc, a tighter middle arc, exit arc).
 * radii = [R1, R2, R1] (outer, middle, outer; R2 < R1, the usual ratio is 2:1:2) and `share` is the fraction of the total turn each outer arc takes (placeholder 2/9, the
 * authority's table decides). Symmetric, so both tangent lengths are equal. Method: walk the three arcs in a local frame (start on the first line heading to the corner),
 * find where the end line meets the start line (the corner), then rotate and slide so that point lands on `corner`. Plain geometry (Easa, Geometric Design).
 */
export function cornerCompound3({ corner, dirA, dirB, radii, share = 2 / 9, step = 0.05 }) {
  const a = unit(dirA), b = unit(dirB), psi = Math.acos(Math.max(-1, Math.min(1, dot(a, b))));
  const [R1, R2] = radii || [];
  if (!(R1 > 0) || !(R2 > 0) || psi < 1e-3 || psi > Math.PI - 1e-3 || !(share > 0) || share >= 0.5) return null;
  const turn = Math.PI - psi, sg = crs({ x: -a.x, y: -a.y }, b) >= 0 ? 1 : -1, ang = [share * turn, (1 - 2 * share) * turn, share * turn], rad = [R1, R2, R1];
  // local frame: start at the origin heading +x, turning to the left (sg = 1) or right; pts in local (x, y·sg)
  let px = 0, py = 0, h = 0; const local = [{ x: 0, y: 0 }];
  for (let i = 0; i < 3; i++) {
    const cx = px - Math.sin(h) * rad[i], cy = py + Math.cos(h) * rad[i], n = Math.max(2, Math.ceil(ang[i] / step));
    for (let j = 1; j <= n; j++) { const th = h + (ang[i] * j) / n; local.push({ x: cx + Math.sin(th) * rad[i], y: cy - Math.cos(th) * rad[i] }); }
    px = cx + Math.sin(h + ang[i]) * rad[i]; py = cy - Math.cos(h + ang[i]) * rad[i]; h += ang[i];
  }
  // the end line (point p, heading h) meets the x-axis at x = px − py·cos h / sin h
  const T = px - (py * Math.cos(h)) / Math.sin(h), d0 = { x: -a.x, y: -a.y }, T1 = { x: corner.x + a.x * T, y: corner.y + a.y * T };
  const arc = local.map((q) => ({ x: T1.x + d0.x * q.x - sg * d0.y * q.y, y: T1.y + d0.y * q.x + sg * d0.x * q.y }));
  let length = 0; for (let i = 1; i < arc.length; i++) length += Math.hypot(arc[i].x - arc[i - 1].x, arc[i].y - arc[i - 1].y);
  return { T1, T2: arc[arc.length - 1], arc, tangent: T, angle: turn, length, radius: R2, radii: rad, kind: '3c' };
}

/**
 * Intersection of two or more legs meeting at `centre`. Each leg is a road of total half width `halfWidth` (to the edge of pavement, both sides alike) leaving the
 * centre along `bearing` (math radians, counter-clockwise from +x). Legs are taken in order around the centre; between neighbours the edge lines are joined by a
 * curb return of the given radius (one number for all, or `radii[i]` for the corner after leg i). The outline is the closed pavement edge.
 */
export function intersection({ centre, legs, radius = 9, radii = null, curb: curbKind = 'simple' }) {
  const problems = [];
  if (!centre || !Array.isArray(legs) || legs.length < 2) return { legs: [], corners: [], pavement: [], area: 0, curbLength: 0, problems: [{ code: 'int.legs' }] };
  const L = legs.map((l, i) => ({ ...l, i, bearing: norm(l.bearing), dir: { x: Math.cos(l.bearing), y: Math.sin(l.bearing) } })).sort((p, q) => p.bearing - q.bearing);
  const out = [], corners = [];
  let curb = 0;
  for (let k = 0; k < L.length; k++) {
    const a = L[k], b = L[(k + 1) % L.length];
    // leg a's left edge (counter-clockwise side) meets leg b's right edge
    const na = { x: -a.dir.y, y: a.dir.x }, nb = { x: b.dir.y, y: -b.dir.x };
    const pa = { x: centre.x + na.x * a.halfWidth, y: centre.y + na.y * a.halfWidth }, pb = { x: centre.x + nb.x * b.halfWidth, y: centre.y + nb.y * b.halfWidth };
    const den = crs(a.dir, b.dir);
    const nra = { x: a.dir.y, y: -a.dir.x };
    out.push({ x: centre.x + nra.x * a.halfWidth + a.dir.x * a.length, y: centre.y + nra.y * a.halfWidth + a.dir.y * a.length });   // far right
    if (Math.abs(den) < 1e-9) {   // legs run parallel (a straight road, two legs): the edge runs straight past
      problems.push({ code: 'int.parallel', leg: [a.i, b.i] });
      corners.push({ between: [a.i, b.i], corner: null, fillet: null });
      out.push({ x: centre.x + na.x * a.halfWidth + a.dir.x * a.length, y: centre.y + na.y * a.halfWidth + a.dir.y * a.length });
      continue;
    }
    // intersection of the two edge lines: pa + s·a.dir = pb + t·b.dir
    const s = crs(sub(pb, pa), b.dir) / den, corner = { x: pa.x + a.dir.x * s, y: pa.y + a.dir.y * s };
    // the leg's far left end, then in to the corner, then the fillet, then out along b
    out.push({ x: centre.x + na.x * a.halfWidth + a.dir.x * a.length, y: centre.y + na.y * a.halfWidth + a.dir.y * a.length });
    const r = Number.isFinite(a.radius) && a.radius >= 0 ? a.radius : radii ? radii[k] ?? radius : radius;   // a leg's own `radius` is the return on its counter-clockwise side
    const toA = unit(sub({ x: pa.x + a.dir.x * a.length, y: pa.y + a.dir.y * a.length }, corner)), toB = unit(sub({ x: pb.x + b.dir.x * b.length, y: pb.y + b.dir.y * b.length }, corner));
    const f = r > 0 ? (curbKind === '3c' ? cornerCompound3({ corner, dirA: toA, dirB: toB, radii: [2 * r, r, 2 * r] }) || cornerFillet({ corner, dirA: toA, dirB: toB, radius: r }) : cornerFillet({ corner, dirA: toA, dirB: toB, radius: r })) : null;
    if (f) {
      if (f.tangent > a.length || f.tangent > b.length) problems.push({ code: 'int.radius.long', leg: [a.i, b.i], tangent: f.tangent });
      out.push(...f.arc); curb += f.length;
    } else out.push(corner);
    corners.push({ between: [a.i, b.i], corner, fillet: f });
  }
  // the walk above lists leg a's far-right, far-left, then the corner/arc; the left end must come before the corner: reorder is already so
  // (far right → far left → arc → next leg's far right …)
  const pavement = out;
  return { centre, legs: L, corners, pavement, area: Math.abs(polyArea(pavement)), curbLength: curb, problems };
}

/** Intersection sight distance, case B1, in metres. */
export function isd({ speed, gap = 7.5, lanes = 0 }) { return 0.278 * speed * (gap + 0.5 * Math.max(0, lanes)); }

/**
 * Sight triangle for a minor-road driver: the minor leg is `minorSetback` back from the major road's near edge, the major leg `major` along the major road
 * to the left (approach side). Points: the driver, the point on the minor road, the point on the major road.
 */
export function sightTriangle({ driver, minorDir, majorDir, minorLeg, majorLeg }) {
  const m = unit(minorDir), M = unit(majorDir);
  return [{ x: driver.x, y: driver.y }, { x: driver.x + m.x * minorLeg, y: driver.y + m.y * minorLeg }, { x: driver.x + M.x * majorLeg, y: driver.y + M.y * majorLeg }];
}
const pip = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) if ((poly[i].y > p.y) !== (poly[j].y > p.y) && p.x < ((poly[j].x - poly[i].x) * (p.y - poly[i].y)) / (poly[j].y - poly[i].y) + poly[i].x) c = !c; return c; };
const segX = (a, b, c, d) => { const r = sub(b, a), s = sub(d, c), den = crs(r, s); if (Math.abs(den) < 1e-12) return false; const t = crs(sub(c, a), s) / den, u = crs(sub(c, a), r) / den; return t >= 0 && t <= 1 && u >= 0 && u <= 1; };
/** Which polygons (buildings, hedges, signs as small squares) intrude into the triangle. */
export function triangleBlocked(tri, obstacles) {
  const hit = [];
  obstacles.forEach((o, k) => {
    const poly = o.pts || o;
    let blocked = poly.some((p) => pip(p, tri)) || tri.some((p) => pip(p, poly));
    for (let i = 0; !blocked && i < poly.length; i++) for (let j = 0; j < 3 && !blocked; j++) if (segX(poly[i], poly[(i + 1) % poly.length], tri[j], tri[(j + 1) % 3])) blocked = true;
    if (blocked) hit.push(k);
  });
  return hit;
}

// ---------------------------------------------------------------------------------------------------------------------------------- striping
/** A polyline moved sideways by d (left of the direction of travel +), corners mitred (limited to 4×d). */
export function offsetLine(line, d) {
  const n = line.length, out = [];
  if (n < 2) return line.slice();
  const dirs = []; for (let i = 0; i + 1 < n; i++) dirs.push(unit(sub(line[i + 1], line[i])));
  for (let i = 0; i < n; i++) {
    const a = dirs[Math.max(0, i - 1)], b = dirs[Math.min(n - 2, i)];
    const na = { x: -a.y, y: a.x }, nb = { x: -b.y, y: b.x }, m = { x: na.x + nb.x, y: na.y + nb.y }, ml = len(m);
    if (ml < 1e-9) { out.push({ x: line[i].x + na.x * d, y: line[i].y + na.y * d }); continue; }
    const cosHalf = dot(unit(m), na), sc = Math.min(4, 1 / Math.max(cosHalf, 0.25));
    const mm = unit(m); out.push({ x: line[i].x + mm.x * d * sc, y: line[i].y + mm.y * d * sc });
  }
  return out;
}
/** Cut a polyline into [from, to] (distances along it). */
export function sliceLine(line, from, to) {
  const out = []; let run = 0;
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i], b = line[i + 1], L = Math.hypot(b.x - a.x, b.y - a.y), s = Math.max(from - run, 0), e = Math.min(to - run, L);
    if (e > s + 1e-12) {
      const p = { x: a.x + ((b.x - a.x) * s) / L, y: a.y + ((b.y - a.y) * s) / L }, q = { x: a.x + ((b.x - a.x) * e) / L, y: a.y + ((b.y - a.y) * e) / L };
      if (!out.length || Math.hypot(out[out.length - 1].x - p.x, out[out.length - 1].y - p.y) > 1e-9) out.push(p);
      out.push(q);
    }
    run += L;
  }
  return out;
}
/** Dashes of length `dash` every `dash + gap` along the line between distances from and to; the last dash is cut short. */
export function dashSegments(line, { dash, gap, from = 0, to = Infinity, phase = 0 }) {
  const total = polyLen(line), end = Math.min(to, total), segs = [];
  for (let s = from - phase; s < end - 1e-9; s += dash + gap) { const a = Math.max(s, from), b = Math.min(s + dash, end); if (b > a + 1e-9) segs.push(sliceLine(line, a, b)); }
  return segs;
}

/** Marking kinds with the placeholder widths and colours a plan starts from; every one is the user's to change. */
export const MARKING = {
  'centre-double': { colour: 'yellow', width: 0.1, gapBetween: 0.1, dashed: false, lines: 2 },
  'centre-dashed': { colour: 'yellow', width: 0.1, dashed: true, dash: 3, gap: 9 },
  'lane-dashed': { colour: 'white', width: 0.1, dashed: true, dash: 3, gap: 9 },
  'lane-solid': { colour: 'white', width: 0.1, dashed: false },
  edge: { colour: 'white', width: 0.1, dashed: false },
  'stop-bar': { colour: 'white', width: 0.6, dashed: false },
  crosswalk: { colour: 'white', width: 0.4, dashed: false },
};

/**
 * Striping along a road. `line` is the centreline (a sampled polyline in plan units, in the direction of stationing); plan:
 *   { lanesLeft, lanesRight, laneWidth, shoulder (0 = none), centre: 'double'|'dashed'|'none', edge: true, marking: { kind → overrides }, breaks: [{ from, to }] (distances along the line left unpainted: intersections) }
 * Lanes on the left of the direction are `lanesLeft`. Returns the painted items and the quantities (length per kind, painted length of dashed lines).
 */
export function stripe(line, plan) {
  const total = polyLen(line), brk = (plan.breaks || []).slice().sort((a, b) => a.from - b.from), items = [];
  const mk = (kind) => ({ ...MARKING[kind], ...(plan.marking?.[kind] || {}) });
  const spans = []; let at = 0;
  for (const b of brk) { if (b.from > at) spans.push([at, Math.min(b.from, total)]); at = Math.max(at, b.to); }
  if (at < total) spans.push([at, total]);
  const emit = (kind, off, tag = '') => {
    const m = mk(kind), base = off === 0 ? line : offsetLine(line, off);
    for (const [s, e] of spans) {
      if (m.dashed) for (const seg of dashSegments(base, { dash: m.dash, gap: m.gap, from: s, to: e })) items.push({ kind, tag, pts: seg, width: m.width, colour: m.colour, dashed: true });
      else { const seg = sliceLine(base, s, e); if (seg.length > 1) items.push({ kind, tag, pts: seg, width: m.width, colour: m.colour, dashed: false }); }
    }
  };
  const w = plan.laneWidth, cw = (plan.centreWidth ?? 0);
  if (plan.centre === 'double') { const g = (mk('centre-double').gapBetween + mk('centre-double').width) / 2; emit('centre-double', g, 'L'); emit('centre-double', -g, 'R'); }
  else if (plan.centre === 'dashed') emit('centre-dashed', 0);
  const half = cw / 2;
  for (let i = 1; i < (plan.lanesLeft || 0); i++) emit('lane-dashed', half + i * w, 'L' + i);
  for (let i = 1; i < (plan.lanesRight || 0); i++) emit('lane-dashed', -(half + i * w), 'R' + i);
  if (plan.edge !== false) {
    if (plan.lanesLeft) emit('edge', half + plan.lanesLeft * w - (plan.edgeIn ?? 0), 'L');
    if (plan.lanesRight) emit('edge', -(half + plan.lanesRight * w - (plan.edgeIn ?? 0)), 'R');
  }
  const q = {}; let painted = 0;
  for (const it of items) { const l = polyLen(it.pts); q[it.kind] = (q[it.kind] || 0) + l; painted += l * it.width; }
  return { items, quantities: { length: q, paintedArea: painted, total: Object.values(q).reduce((s, v) => s + v, 0) } };
}

/** Crosswalk bars (continental/ladder: bars along the direction of walking) across a road of `width` centred at `centre`; `dir` is the road direction. */
export function crosswalk(centre, dir, width, { style = 'continental', bar = 0.4, gap = 0.6, length = 3 } = {}) {
  const d = unit(dir), n = { x: -d.y, y: d.x }, bars = [];
  if (style === 'ladder') for (const s of [-1, 1]) { const o = (s * (length - bar)) / 2; bars.push([{ x: centre.x - d.x * width / 2 + n.x * (o - bar / 2), y: centre.y - d.y * width / 2 + n.y * (o - bar / 2) }, { x: centre.x + d.x * width / 2 + n.x * (o - bar / 2), y: centre.y + d.y * width / 2 + n.y * (o - bar / 2) }, { x: centre.x + d.x * width / 2 + n.x * (o + bar / 2), y: centre.y + d.y * width / 2 + n.y * (o + bar / 2) }, { x: centre.x - d.x * width / 2 + n.x * (o + bar / 2), y: centre.y - d.y * width / 2 + n.y * (o + bar / 2) }]); }
  const count = Math.max(1, Math.floor((width + gap) / (bar + gap))), used = count * bar + (count - 1) * gap, start = -used / 2;
  if (style === 'ladder') return bars;
  for (let i = 0; i < count; i++) {
    const s = start + i * (bar + gap), a = { x: centre.x + d.x * s, y: centre.y + d.y * s };
    bars.push([{ x: a.x - n.x * length / 2, y: a.y - n.y * length / 2 }, { x: a.x + d.x * bar - n.x * length / 2, y: a.y + d.y * bar - n.y * length / 2 }, { x: a.x + d.x * bar + n.x * length / 2, y: a.y + d.y * bar + n.y * length / 2 }, { x: a.x + n.x * length / 2, y: a.y + n.y * length / 2 }]);
  }
  return bars;
}

/**
 * Crosswalks and stop bars on each leg of an intersection result: the crosswalk is set `gap` beyond the end of the curb returns on that leg, the stop bar `stopGap` further out
 * (the approach side is the right-hand side of the leg's outward direction). Returns [{ leg, centre, dir, width, bars[], stopBar[] }]; the numbers are placeholders (the authority's
 * manual sets the setbacks).
 */
export function crossingsFor(inter, { style = 'continental', gap = 1.5, stopGap = 1.2, length = 3, stopWidth = 0.6, bar = 0.4, barGap = 0.6 } = {}) {
  const out = [];
  inter.legs.forEach((l, i) => {
    // how far along the leg the returns reach: the tangent points that lie on this leg
    let reach = 0;
    for (const c of inter.corners) {
      if (!c.fillet) continue;
      for (const q of [c.fillet.T1, c.fillet.T2]) { const rel = sub(q, inter.centre || { x: 0, y: 0 }); const along = dot(rel, l.dir), side = Math.abs(crs(l.dir, rel)); if (side > l.halfWidth - 1e-6 && side < l.halfWidth + 1e-6) reach = Math.max(reach, along); }
    }
    const at = reach + gap + length / 2, ctr = { x: (inter.centre?.x ?? 0) + l.dir.x * at, y: (inter.centre?.y ?? 0) + l.dir.y * at }, width = 2 * l.halfWidth;
    if (reach + gap + length + stopGap > l.length) return;   // the leg is too short for them
    const sb = reach + gap + length + stopGap, n = { x: l.dir.y, y: -l.dir.x };   // right of the outward direction
    const mid = { x: inter.centre.x + l.dir.x * sb + n.x * l.halfWidth / 2, y: inter.centre.y + l.dir.y * sb + n.y * l.halfWidth / 2 };
    out.push({ leg: l.name || String(i), centre: ctr, dir: l.dir, width, bars: crosswalk(ctr, { x: -l.dir.y, y: l.dir.x }, width, { style, length, bar, gap: barGap }), stopBar: [{ x: mid.x - l.dir.x * stopWidth / 2 - n.x * l.halfWidth / 2, y: mid.y - l.dir.y * stopWidth / 2 - n.y * l.halfWidth / 2 }, { x: mid.x + l.dir.x * stopWidth / 2 - n.x * l.halfWidth / 2, y: mid.y + l.dir.y * stopWidth / 2 - n.y * l.halfWidth / 2 }, { x: mid.x + l.dir.x * stopWidth / 2 + n.x * l.halfWidth / 2, y: mid.y + l.dir.y * stopWidth / 2 + n.y * l.halfWidth / 2 }, { x: mid.x - l.dir.x * stopWidth / 2 + n.x * l.halfWidth / 2, y: mid.y - l.dir.y * stopWidth / 2 + n.y * l.halfWidth / 2 }] });
  });
  return out;
}

/** Sign kinds a plan can place (placeholders: the real code, size and offset are the authority's). */
export const SIGNS = {
  stop: { code: 'R1-1', size: 0.75, at: 'stop-bar' },
  yield: { code: 'R1-2', size: 0.9, at: 'stop-bar' },
  speed: { code: 'R2-1', size: 0.6, at: 'interval' },
  street: { code: 'D3-1', size: 0.9, at: 'intersection' },
  'no-parking': { code: 'R7-1', size: 0.3, at: 'interval' },
  crossing: { code: 'W11-2', size: 0.9, at: 'crosswalk' },
};
/**
 * Place signs along a road: `plan.signs` = [{ kind, station, side: 'L'|'R', offset, text }] by hand, plus the repeating ones `plan.repeat` = [{ kind, every, side, offset, from, to }].
 * Returns the schedule with the position of each sign in plan and the counts by kind.
 */
export function signsFor(line, plan) {
  const total = polyLen(line), out = [];
  const at = (sta) => { const p = sliceLine(line, 0, Math.max(0, Math.min(total, sta))), q = p[p.length - 1] || line[0], r = sliceLine(line, Math.max(0, Math.min(total, sta)), Math.min(total, sta + 0.01)), d = r.length > 1 ? unit(sub(r[r.length - 1], r[0])) : unit(sub(line[line.length - 1], line[line.length - 2])); return { p: q, d }; };
  const add = (s) => {
    const info = SIGNS[s.kind]; if (!info) return;
    const { p, d } = at(s.station), n = { x: -d.y, y: d.x }, sg = s.side === 'L' ? 1 : -1, off = s.offset ?? 2;
    out.push({ kind: s.kind, code: info.code, text: s.text || '', station: s.station, side: s.side, offset: off, size: s.size ?? info.size, x: p.x + n.x * sg * off, y: p.y + n.y * sg * off, facing: Math.atan2(-d.y * sg, -d.x * sg) });
  };
  for (const s of plan.signs || []) add(s);
  for (const r of plan.repeat || []) for (let sta = r.from ?? 0; sta <= Math.min(r.to ?? total, total) + 1e-9; sta += r.every) add({ ...r, station: sta });
  out.sort((a, b) => a.station - b.station);
  const counts = {}; for (const s of out) counts[s.kind] = (counts[s.kind] || 0) + 1;
  return { signs: out, counts };
}

/** Quantities for a corridor with intersections: pavement areas, curb, striping, signs. */
export function roadQuantities({ intersections = [], stripes = [], signs = [] }) {
  return { pavementIntersections: intersections.reduce((s, i) => s + i.area, 0), curbReturn: intersections.reduce((s, i) => s + i.curbLength, 0), striping: stripes.reduce((s, q) => s + q.quantities.total, 0), paintedArea: stripes.reduce((s, q) => s + q.quantities.paintedArea, 0), signs: signs.reduce((s, g) => s + g.signs.length, 0) };
}
