/* SPDX-License-Identifier: Apache-2.0 */
/**
 * corridor.js — a corridor: one simple assembly swept along an alignment and its design profile.
 * No DOM.
 *
 * The assembly is the same on both sides of the centreline: a lane (width, cross slope falling away
 * from the crown), a shoulder (width, slope), then a side slope at the cut or fill ratio (H:V) out to
 * where it meets the ground. Slopes are fractions (0.02 = 2%). Curb and gutter, sidewalks
 * and side-slope targets are not built yet (superelevation: 0.4 V18; edge targets and widening: 0.6 WL.25).
 *
 *   defaultAssembly(units) → { lane, laneSlope, shoulder, shoulderSlope, cut, fill, step }   (placeholders to edit)
 *   corridorPatch(surface, alignment, profile, asm) → { problems, region, points, breaklines, info }
 *     info = { sections: [{ sta, L: [cl, eop, sh, dl], R: [...] }], lines: { CL, EOP_L, SH_L, DL_L, EOP_R, SH_R, DL_R }, from, to }
 *     region = the daylight outline (left daylight forward, right daylight back), for gradedSurface().
 *     0.4 V18: asm.super (superelev.js) on → the lanes rotate through the curves (superPlan / slopesAt, the transition
 *     stations become sections); a lane falling away steeper than the shoulder slope takes the shoulder with it (a shoulder
 *     is never flatter than its lane on the low side). info.super = the plan (curves, problems).
 *
 * 0.7 D7.35 - the assembly editor: asm.parts = { L: [part…], R: [part…] } replaces the simple lane + shoulder with a list of
 * parts from the centreline outward, different on each side. A part is { type, … } with
 *   lane / shoulder / strip / walk   { w, slope }      a width at a cross slope (fall-away, so a walk that drains to the road is negative)
 *   gutter                           { w, slope }      the pan, falling toward the curb face
 *   curb                             { h, w, drop }    a face h high (a hair out of plumb: 0.01 ft / 0.003 m), a top w wide, the back dropping `drop`
 *   daylight                         { cut, fill }     last; the side slope out to the ground (the corridor's own cut / fill when it is not there)
 * PRESETS (rural, urban) give the usual starting points. Superelevation rolls every lane of the run from the centreline out;
 * the curb, gutter, strip and walk hang from the edge of the lanes as built. Targets still move "the edge of pavement" (the end
 * of the lane run) and "the shoulder's outer edge" (the last part before the daylight). Each section also carries
 * sec.det = { L, R } - every point of the side with its `code` - and info.lines has a line for every code (GUTTER: FL_L …).
 * Without parts the corridor is exactly what it was.
 *
 * Pavement courses (0.7.1 71.24, owner 2026-10-26): a part with a width (lane, shoulder, gutter, strip, walk) may carry
 * layers: [{ name, material, t (thickness, project units), course ('surface'|'binder'|'base'|'subbase'|'capping'|'other') }],
 * top down. They do not change the corridor's surfaces (the top is the design surface); each course lies under its part, its
 * depth measured straight down. The section points of such a part carry `layers`; info.courses = [{ side, code, part, layers,
 * edges: [{ sta, i (inner top point), o (outer top point) }] }] (one per part with layers), read by sections.js (layer lines),
 * courseQuantities (area and volume per course) and the IFC export (IfcCourse).
 *   COURSE_KINDS · MAX_LAYERS · cleanLayers(list, units) (untrusted) · defaultLayer(units) · courseQuantities(info) →
 *   [{ side, code, part, k, name, material, course, t, area (plan, sq units), volume (cubic units), length }]
 *
 * Track (0.7.1 71.26, rail.js): asm.rail = { …rail settings (on), speed, minSpeed (km/h), id, name } builds a TRACK instead of the road:
 * every section is rail.js trackShape at that station's cant (cantPlan / cantAt; the ramp ends become sections), its ballast top the
 * design surface (codes CL, SLP…, BSH, BTOE, CESS, then DL), daylight from the cess edge at the corridor's own cut / fill. The road
 * parts, superelevation and targets are not used. Each section carries sec.track = { E, hL, hR (mm), shape (offsets / z from the
 * profile), p (the station's point), r (the unit vector to the right), z0 (the profile) }; info.rail = { plan, rail, units,
 * quantities (trackQuantities), at(sta) → that station's shape in absolute z (sections.js draws it) }. sec[side] = [CL, BSH, CESS, DL].
 *
 * Targets (0.6 WL.25): corridorPatch(…, { targets }) — each target belongs to ONE side and moves one point of that side's
 * section to a line, where the section (square to the alignment, outward from the centreline on that side only) first
 * crosses it:
 *   { side 'L'|'R', what 'width'|'elev', part 'eop'|'sh', line: [{x,y,z}] | null, label }
 *     width + eop   the edge of pavement sits on the line (the lane widens or narrows to it)
 *     width + sh    the shoulder's outer edge sits on the line (the shoulder takes up the rest; never narrower than 0)
 *     elev  + eop   the edge of pavement takes the line's elevation there (the lane's cross slope follows)
 *     elev  + sh    the shoulder's outer edge takes the line's elevation there
 *   Where the section does not reach the line, the assembly's own values stay (counted). The other side never moves:
 *   a target on the left only ever changes left points. info.targets = [{ …target without line, found, of }].
 *   TARGET_WHAT, TARGET_PARTS, TARGET_SIDES, CORRIDOR_LINES (the lines another corridor can target), MAX_TARGETS
 *   cleanTargets(list) (untrusted: the project file) → [{ side, what, part, from: { kind 'feature', id } |
 *     { kind 'corridor', id (alignment id), line (CORRIDOR_LINES) } }]
 *   sectionHit(p, ux, uy, line) → { t (distance out along u), z } | null   the first crossing at t > 0
 *
 * Templates by station (0.9 SU.1110 + WB.6, templates.js): asm.regions = [{ from (station), L: { uses, end }, R: { uses, end } }]
 * with asm.templates = Map(id → template) builds every section from templates instead: each side chains its pavement templates
 * outward from the centreline (each starts at the last top point of the one before), then its END CONDITION (a daylight, a
 * ditch, a wall … any template whose last top point meets the ground; none = a daylight at the corridor's own cut / fill). A
 * region runs from its station to the next region's; asm.from / asm.to limit the whole corridor (several corridors on one
 * alignment). A use's targets ({ CODE: line }, resolved by project.js) move that template point to the line. The surface runs
 * through every top point (codes kept, a repeated code numbered: FL, FL2 …); sec[side] = [CL, end of pavement, last point
 * before the daylight, DL] as before; sec.comps[side] = the components' shapes in (o, z), sec.compsBefore at a region's first
 * station = the region before's (so volumes never mix two templates). info.components = componentQuantities (average end
 * areas along the centreline, per side, region and component). Superelevation and WL.25 targets are not used in this mode.
 *
 * Junctions (0.10.1, /suggest #1977; junction.js finds them, project.js passes them): corridorPatch(…, { ties, openings }).
 *   openings = [{ side 'L'|'R', from, to }] (stations): where another road's pavement meets this road's side. There every point
 *     past the edge of pavement is laid on the lane's own cross slope (no curb, shoulder break, strip or walk standing across the
 *     mouth) and carries `open: true` (the 3D view draws it as pavement); the section has sec.open = { L|R: true }.
 *   ties = [{ kind 'road'|'pad', id, name, end 'start'|'end'|null, inside(x, y) → bool, zAt(x, y) → z | null, lines?: [[{x, y}]] }]:
 *     something this corridor joins. The TIE ZONE is every section whose centreline point is inside it (with a section exactly
 *     where the centreline enters or leaves, and where it crosses `lines`); a tie with `end` whose zone is empty (the road stops
 *     just short) ties that end section alone. In the zone every point takes zAt (the other road's surface, the pad's level), so
 *     the road lies ON what it joins; sec.tie = { kind, id }. Before and after the zone, over the blend length (asm.tieLen, else
 *     the larger of 10 m / 30 ft and 20 × the centreline's difference, at most 45% of the corridor), each point is moved by the
 *     difference its own line has at the zone's edge, eased in by 3u² − 2u³ (no kink at either end); sec.blend = that weight.
 *     The design profile itself is not changed. info.ties = [{ kind, id, name, from, to (the zone), dz (the centreline's change
 *     at the zone's edge), len (the blend length) }]. Not used on a track.
 */

import { t } from "./i18n.js";
import { castSlope, selfCrosses } from './grading.js';
import { superPlan, slopesAt, keyStations as superStations } from './superelev.js';   // 0.4 V18
import { cantPlan, cantAt, trackShape, trackQuantities } from './rail.js';   // 0.7.1 71.26: a track instead of a road
import { evalTemplate, regionAt, namedAt } from './templates.js';   // 0.9 SU.1110: templates by station

export function defaultAssembly(units = 'ft') {
  return units === 'm'
    ? { lane: 3.6, laneSlope: 0.02, shoulder: 1.2, shoulderSlope: 0.04, cut: 2, fill: 3, step: 5 }
    : { lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 };
}

/** 0.7 D7.35: the parts of a side, from the centre out. */
export const PART_TYPES = ['lane', 'shoulder', 'gutter', 'curb', 'strip', 'walk', 'daylight'];
export const MAX_PARTS = 12;
export const PART_CODES = { lane: 'LANE', shoulder: 'SH', gutter: 'FL', strip: 'STRIP', walk: 'WALK' };
const num = (v, d, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d);
/** The default part of a type, in the project's units. */
export function defaultPart(type, units = 'ft') {
  const m = units === 'm';
  switch (type) {
    case 'lane': return { type, w: m ? 3.6 : 12, slope: 0.02 };
    case 'shoulder': return { type, w: m ? 1.2 : 4, slope: 0.04 };
    case 'gutter': return { type, w: m ? 0.6 : 2, slope: 0.08 };
    case 'curb': return { type, h: m ? 0.15 : 0.5, w: m ? 0.15 : 0.5, drop: 0 };
    case 'strip': return { type, w: m ? 1.5 : 5, slope: -0.02 };
    case 'walk': return { type, w: m ? 1.8 : 5, slope: -0.02 };
    case 'daylight': return { type, cut: 2, fill: 3 };
    default: return null;
  }
}
/** Starting assemblies: 'rural' = lanes and shoulders, 'urban' = lanes, gutter, curb, planting strip, walk. */
export function presetParts(name, units = 'ft') {
  const P = (type, o = {}) => ({ ...defaultPart(type, units), ...o });
  if (name === 'urban') return [P('lane'), P('lane'), P('gutter'), P('curb'), P('strip'), P('walk'), P('daylight')];
  return [P('lane'), P('shoulder'), P('daylight')];
}
/** 0.7.1 71.24: pavement courses under a part (top down). Kinds map to IFC 4.3 IfcCourse (ifc-civil.js). */
export const COURSE_KINDS = ['surface', 'binder', 'base', 'subbase', 'capping', 'other'];
export const MAX_LAYERS = 8;
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
export function cleanLayers(list, units = 'ft') {
  if (!Array.isArray(list)) return [];
  const max = units === 'm' ? 5 : 16;
  return list.slice(0, MAX_LAYERS).filter((q) => q && typeof q === 'object' && typeof q.t === 'number' && Number.isFinite(q.t) && q.t > 0 && q.t <= max)
    .map((q) => ({ name: clip(q.name, 60), material: clip(q.material, 60), t: q.t, course: COURSE_KINDS.includes(q.course) ? q.course : 'other' }));
}
/** A new course to edit (a placeholder thickness, not a standard). */
export function defaultLayer(units = 'ft') { return { name: '', material: '', t: units === 'm' ? 0.1 : 0.33, course: 'base' }; }

/** An untrusted list of parts (the project file): known types, finite numbers within sane limits, one daylight and it last. */
export function cleanParts(list, units = 'ft') {
  if (!Array.isArray(list)) return null;
  const out = [];
  for (const q of list.slice(0, 64)) {
    if (!q || typeof q !== 'object' || !PART_TYPES.includes(q.type)) continue;
    const d = defaultPart(q.type, units), type = q.type;
    if (type === 'daylight') { if (!out.some((x) => x.type === 'daylight')) out.push({ type, cut: num(q.cut, d.cut, 0.05, 1000) || d.cut, fill: num(q.fill, d.fill, 0.05, 1000) || d.fill }); continue; }
    if (type === 'curb') out.push({ type, h: num(q.h, d.h, 0, 5), w: num(q.w, d.w, 0, 10), drop: num(q.drop, 0, 0, 5) });
    else { const ly = cleanLayers(q.layers, units); out.push({ type, w: num(q.w, d.w, 0, 100), slope: num(q.slope, d.slope, -0.5, 0.5), ...(ly.length ? { layers: ly } : {}) }); }   // layers: 0.7.1 71.24
    if (out.length >= MAX_PARTS) break;
  }
  const di = out.findIndex((x) => x.type === 'daylight');
  if (di >= 0 && di < out.length - 1) out.push(...out.splice(di, 1));
  return out;
}
/** The cleaned { L, R } of an untrusted object, or null when neither side has a part. */
export function cleanSides(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const L = cleanParts(o.L, units), R = cleanParts(o.R, units);
  return L?.length || R?.length ? { L: L || [], R: R || [] } : null;
}
/** The normal-crown slope a corridor starts from: the first lane's, else the simple assembly's. */
export function ncOf(asm) {
  const q = asm?.parts && ['L', 'R'].map((k) => asm.parts[k]?.find((x) => x.type === 'lane')).find(Boolean);
  return q ? q.slope : (asm?.laneSlope ?? defaultAssembly().laneSlope);
}
/** The width of the lanes in a row from the centreline (superelevation's one rotated pavement); the widest side. */
export function laneRunWidth(asm) {
  if (!asm?.parts) return asm?.lane ?? defaultAssembly().lane;
  const run = (L) => { let w = 0; for (const q of L || []) { if (q.type !== 'lane') break; w += q.w; } return w; };
  return Math.max(run(asm.parts.L), run(asm.parts.R)) || (asm.lane ?? defaultAssembly().lane);
}

export const TARGET_SIDES = ['L', 'R'];
export const TARGET_WHAT = ['width', 'elev'];
export const TARGET_PARTS = ['eop', 'sh'];
export const CORRIDOR_LINES = ['CL', 'EOP_L', 'SH_L', 'DL_L', 'EOP_R', 'SH_R', 'DL_R'];
export const MAX_TARGETS = 8;
export function cleanTargets(list) {
  if (!Array.isArray(list)) return [];
  const out = [], seen = new Set();
  for (const g of list.slice(0, 64)) {
    if (!g || typeof g !== 'object' || !TARGET_SIDES.includes(g.side) || !TARGET_WHAT.includes(g.what) || !TARGET_PARTS.includes(g.part)) continue;
    const f = g.from, id = String(f?.id ?? '');
    let from = null;
    if (f?.kind === 'feature' && /^f\d{1,16}$/.test(id)) from = { kind: 'feature', id };
    else if (f?.kind === 'corridor' && /^a\d{1,16}$/.test(id) && CORRIDOR_LINES.includes(f.line)) from = { kind: 'corridor', id, line: f.line };
    if (!from) continue;
    const key = g.side + g.what + g.part;   // one target per side, kind and point
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ side: g.side, what: g.what, part: g.part, from });
    if (out.length >= MAX_TARGETS) break;
  }
  return out;
}
/** Where the ray from p along (ux, uy) first crosses the 3D polyline `line` (t > 0, the distance out), with the line's z
 *  there (by length along the crossed segment). */
export function sectionHit(p, ux, uy, line) {
  let best = null;
  for (let i = 1; i < (line?.length || 0); i++) {
    const a = line[i - 1], b = line[i], dx = b.x - a.x, dy = b.y - a.y, den = ux * dy - uy * dx;
    if (Math.abs(den) < 1e-15) continue;
    const wx = a.x - p.x, wy = a.y - p.y;
    const t = (wx * dy - wy * dx) / den, u = (wx * uy - wy * ux) / den;
    if (t <= 1e-9 || u < -1e-12 || u > 1 + 1e-12) continue;
    if (!best || t < best.t) best = { t, z: a.z + Math.min(1, Math.max(0, u)) * (b.z - a.z) };
  }
  return best;
}

/**
 * 0.7 D7.35: one side of one section from its parts. Returns { det, eop, sh, dl }: det = every point from the centreline out
 * (each with its `code`), eop = the end of the lanes in a row from the centre, sh = the last point before the daylight, dl = the
 * daylight point. c.tg(what, part) is the side's target hit (corridor.js `hitOf`); c.dsl = the superelevation's change to a lane's slope.
 */
function walkSide(parts, c) {
  const { p, ux, uy, z0, cl, dsl, A, surface, step, far, eps, tg } = c;
  const day = parts.find((q) => q.type === 'daylight');
  const body = parts.filter((q) => q.type !== 'daylight');
  let run = 0;
  while (run < body.length && body[run].type === 'lane') run++;
  const hW = tg('width', 'eop'), hE = tg('elev', 'eop'), hSW = tg('width', 'sh'), hSE = tg('elev', 'sh');
  let lw = -1;   // the last part with a width (the shoulder's target moves it)
  body.forEach((q, i) => { if (q.type !== 'curb' && q.w > 1e-9) lw = i; });
  const det = [cl], seen = {};
  const code = (base) => { seen[base] = (seen[base] || 0) + 1; return seen[base] > 1 ? base + seen[base] : base; };
  let t = 0, z = z0, eop = cl, prev = null;
  const push = (cd) => { const q = { x: p.x + ux * t, y: p.y + uy * t, z, code: cd }; det.push(q); return q; };
  body.forEach((q, i) => {
    if (q.type === 'curb') {
      t += eps; z += q.h; push(code('TOC'));
      t += q.w; push(code('BOC'));
      if (q.drop > 0) { t += eps; z -= q.drop; push(code('BC')); }
      return;
    }
    let w = q.w;
    if (hW && i === run - 1) w = Math.max(0, hW.t - t);
    if (hSW && i === lw) w = Math.max(0, hSW.t - t);
    if (!(w > 1e-9)) return;
    let slope = q.slope;
    if (q.type === 'lane') slope = q.slope + dsl;
    else if (q.type === 'shoulder' && i === run && prev !== null) slope = prev > q.slope ? prev : q.slope;   // 0.4 V18: the low side's shoulder no flatter than its lane
    if (q.type === 'lane' && hE && i === run - 1) {
      // the edge of pavement takes the line's elevation: every lane in the run falls at the one slope that gets there
      const total = t + w;
      slope = total > 1e-9 ? (z0 - hE.z) / total : slope;
      z = z0 - t * slope;   // (the lanes before this one are re-laid at the same slope)
      for (const d of det) if (d.code && /^LANE/.test(d.code)) d.z = z0 - Math.hypot(d.x - p.x, d.y - p.y) * slope;
    }
    t += w; z -= w * slope;
    const pt = push(q.type === 'lane' ? (i === run - 1 ? 'EOP' : code('LANE')) : code(PART_CODES[q.type]));
    if (q.layers?.length) { pt.part = q.type; pt.layers = q.layers; }   // 0.7.1 71.24: the courses under the stretch that ends here
    if (q.type === 'lane') { prev = slope; if (i === run - 1) eop = pt; }
    if (hSE && i === lw) { z = hSE.z; pt.z = z; }
  });
  const sh = det[det.length - 1];
  const r = castSlope(surface, sh, ux, uy, sh.z, day?.cut || A.cut, day?.fill || A.fill, { step: Math.max(0.1, step / 20), far });
  const dl = { x: r.x, y: r.y, z: r.z, kind: r.kind, code: 'DL' };
  det.push(dl);
  return { det, eop, sh, dl };
}

/**
 * 0.9 SU.1110: one side of one section from its templates: the pavement uses outward, then the end condition. Returns
 * { det (CL + every top point, coded), eop (where the pavement ends), sh (the point before the daylight), dl, comps }.
 * A use's `lines` ({ CODE: 3D polyline }) are its resolved targets.
 */
function walkTemplates(sideDef, c) {
  const { p, ux, uy, z0, cl, A, surface, step, far, tplMiss, eps, sta } = c;
  const named = A.named?.length ? namedAt(A.named, sta) : null;   // 0.11 SU.1941: the corridor's named values at this station (they win over a use's fixed value)
  const W = (o) => ({ x: p.x + ux * o, y: p.y + uy * o });
  const ground = (o) => { const q = W(o), z = surface.elevationAt(q.x, q.y, 1e-6); return z === null || !Number.isFinite(z) ? null : z; };
  const cast = (b, cut, fill) => { const q = W(b.o), r = castSlope(surface, q, ux, uy, b.z, cut, fill, { step: Math.max(0.1, step / 20), far }); return { o: b.o + r.d, z: r.z, kind: r.kind }; };
  const det = [cl], comps = [], seen = {};
  const code = (base) => { seen[base] = (seen[base] || 0) + 1; return seen[base] > 1 ? base + seen[base] : base; };
  let base = { o: 0, z: z0 }, eop = cl, dl = null, lastO = 0;
  const uses = [...(sideDef?.uses || []).map((u) => ({ u, end: false })), ...(sideDef?.end ? [{ u: sideDef.end, end: true }] : [])];
  uses.forEach(({ u, end }, k) => {
    if (dl) return;   // an end condition met the ground: nothing attaches after it
    const tpl = A.templates.get(u.tpl);
    if (!tpl) { tplMiss.add(u.tpl); return; }
    const hit = (cd, what) => { const line = u.lines?.[cd]; if (!line || line.length < 2) return null; const h = sectionHit(p, ux, uy, line); return h ? (what === 'width' ? { o: h.t } : { z: h.z }) : null; };
    const r = evalTemplate(tpl, { params: named ? { ...(u.params || {}), ...named } : u.params || {}, origin: base, ground, cast, hit });
    for (const q of r.top) {
      // the surface is one height per offset: a point straight above or below the last one (a wall face, a curb face) is
      // nudged out by eps, a point that would step back inward is kept just outside the last one
      const o = Math.max(q.o, lastO + eps);
      lastO = o;
      const w = W(o);
      det.push({ x: w.x, y: w.y, z: q.z, code: code(q.code), ...(q.kind === 'off' ? { kind: 'off' } : {}) });
    }
    for (const cp of r.comps) comps.push({ key: (end ? 'E' : 'P' + k) + ':' + u.tpl + ':' + cp.k, use: k, end, tpl: u.tpl, name: cp.name, material: cp.material, kind: cp.kind, poly: cp.poly, area: cp.area, ...(cp.wall ? { wall: true, h: cp.h } : {}) });
    if (r.end) {
      dl = det[det.length - 1];
      const lk = r.top[r.top.length - 1]?.kind;
      dl.code = 'DL'; dl.kind = lk === 'off' ? 'off' : dl.z > base.z + 1e-9 ? 'cut' : dl.z < base.z - 1e-9 ? 'fill' : 'flat';
      return;
    }
    base = { o: r.attach.o, z: r.attach.z };
    if (!end) eop = det[det.length - 1];
  });
  if (!dl) {
    // no end condition met the ground: a daylight from the last point at the corridor's own slopes
    const sh0 = det[det.length - 1];
    const r = castSlope(surface, sh0, ux, uy, sh0.z, A.cut, A.fill, { step: Math.max(0.1, step / 20), far });
    dl = { x: r.x, y: r.y, z: r.z, kind: r.kind, code: 'DL' };
    det.push(dl);
  }
  const sh = det.length >= 2 ? det[det.length - 2] : cl;
  return { det, eop, sh, dl, comps };
}

/** 0.9 SU.1110: each component's volume by average end areas along the centreline: [{ side, region, key, tpl, name, material,
 *  kind, from, to, length, area0 (first section's area), volume, wall?, maxH? }]. Two neighbouring sections in different
 *  regions use the later section's areas for the region before (compsBefore), so a template never borrows another's area. */
export function componentQuantities(sections) {
  const out = new Map();
  for (let i = 1; i < sections.length; i++) {
    const a = sections[i - 1], b = sections[i], L = b.sta - a.sta;
    if (!(L > 0)) continue;
    for (const side of ['L', 'R']) {
      const A = a.comps?.[side] || [], B = (b.compsBefore?.[side]) || b.comps?.[side] || [];
      const keys = new Set([...A.map((c) => c.key), ...B.map((c) => c.key)]);
      for (const key of keys) {
        const ca = A.find((c) => c.key === key), cb = B.find((c) => c.key === key), cc = ca || cb;
        const id = side + '|' + a.region + '|' + key;
        let r = out.get(id);
        if (!r) { r = { side, region: a.region, key, tpl: cc.tpl, name: cc.name, material: cc.material, kind: cc.kind, from: a.sta, to: b.sta, length: 0, volume: 0, ...(cc.wall ? { wall: true, maxH: 0 } : {}) }; out.set(id, r); }
        r.volume += (((ca?.area || 0) + (cb?.area || 0)) / 2) * L;
        r.to = b.sta; r.length = r.to - r.from;
        if (r.wall) r.maxH = Math.max(r.maxH, ca?.h || 0, cb?.h || 0);
      }
    }
  }
  return [...out.values()];
}

export function corridorPatch(surface, alignment, profile, asm, { targets = [], units = 'ft', ties = [], openings = [] } = {}) {
  const problems = [];
  const empty = (msg) => ({ problems: [msg], region: null, points: [], breaklines: [], info: { sections: [], lines: {} } });
  if (!alignment?.ok) return empty(t('corr.err.al'));
  if (!profile?.ok) return empty(t('corr.err.prof'));
  const A = { ...defaultAssembly(), ...asm };
  if (!(A.cut > 0 && A.fill > 0)) return empty(t('corr.err.slopes'));
  const tplOn = !A.rail?.on && Array.isArray(A.regions) && A.regions.length > 0 && A.templates instanceof Map;   // 0.9 SU.1110
  let from = Math.max(alignment.start, profile.start), to = Math.min(alignment.end, profile.end);
  if (Number.isFinite(A.from)) from = Math.max(from, A.from);   // 0.9: a corridor on part of the alignment
  if (Number.isFinite(A.to)) to = Math.min(to, A.to);
  if (tplOn) from = Math.max(from, A.regions[0].from);
  if (!(to - from > 1e-6)) return empty(t('corr.err.overlap'));
  // stations: every step, the ends, the curve ends and the vertical curve ends
  const st = new Set([from, to]);
  const step = A.step > 0 ? A.step : 10;
  for (let s = Math.ceil(from / step) * step; s < to; s += step) st.add(Number(s.toFixed(6)));
  for (const k of alignment.keyStations()) if (k.sta > from && k.sta < to) st.add(k.sta);
  for (const c of profile.curves) for (const s of [c.bvc, c.evc]) if (s > from && s < to) st.add(s);
  // 0.9: every region starts with a section, and the region before ends just short of it (the change of template is abrupt, as built)
  if (tplOn) for (const n of A.named || []) for (const r of n.rows) for (const q of [r.sta0, r.sta1]) if (q > from && q < to) st.add(q);   // 0.11 SU.1941: a named value's row ends
  if (tplOn) for (const r of A.regions) if (r.from > from && r.from < to) { st.add(r.from); const e = Math.min((A.step > 0 ? A.step : 10) * 0.01, units === 'm' ? 0.1 : 0.3); if (r.from - e > from) st.add(Number((r.from - e).toFixed(6))); }
  const railOn = !!A.rail?.on;   // 0.7.1 71.26
  const rp = railOn ? cantPlan(alignment, A.rail, { speed: A.rail.speed, minSpeed: A.rail.minSpeed, units, id: A.rail.id, name: A.rail.name }) : null;
  if (rp) for (const s of rp.stations) if (s > from && s < to) st.add(Number(s.toFixed(6)));
  const custom = !railOn && !tplOn && !!(A.parts && (A.parts.L?.length || A.parts.R?.length));   // 0.7 D7.35
  const nc = custom ? ncOf(A) : A.laneSlope;
  const sp = !railOn && !tplOn && A.super?.on ? superPlan(alignment, { super: A.super, nc, lane: custom ? laneRunWidth(A) : A.lane }) : null;   // 0.4 V18
  if (sp) { for (const s of superStations(sp)) if (s > from && s < to) st.add(Number(s.toFixed(6))); problems.push(...sp.problems); }
  // 0.10.1 #1977: a section at each end of an opening (and one just outside it, so the edge drops at once), and a section
  // where the centreline enters or leaves what the corridor ties to and where it crosses the other road's lines
  const opens = railOn ? [] : (openings || []).filter((o) => (o?.side === 'L' || o?.side === 'R') && o.to > o.from && o.to > from && o.from < to);
  // (a station within a millimetre or so of one already there is that one: no two sections on top of each other)
  const addSta = (s) => { for (const x of st) if (Math.abs(x - s) < 1e-3) return x; const v = Number(s.toFixed(6)); if (v > from && v < to) st.add(v); return v; };
  for (const o of opens) { const e = Math.min(step * 0.01, units === 'm' ? 0.1 : 0.3); for (const [s, d] of [[o.from, -e], [o.to, e]]) if (s > from && s < to) { addSta(s); if (s + d > from && s + d < to) addSta(s + d); } }
  const tieList = railOn ? [] : (ties || []).filter((g) => g && typeof g.inside === 'function' && typeof g.zAt === 'function').map((g) => ({ ...g, edges: [] }));
  if (tieList.length) {
    const fine = Math.max(step / 8, (to - from) / 4000), n = Math.max(2, Math.ceil((to - from) / fine));
    const cl = []; for (let k = 0; k <= n; k++) { const s = from + ((to - from) * k) / n, p = alignment.pointAt(s); cl.push({ s, x: p.x, y: p.y }); }
    for (const g of tieList) {
      let was = g.inside(cl[0].x, cl[0].y);
      for (let k = 1; k <= n; k++) {
        const now = g.inside(cl[k].x, cl[k].y);
        if (now !== was) {
          let a = cl[k - 1].s, b = cl[k].s;   // a on the side `was`
          for (let it = 0; it < 40 && b - a > 1e-5; it++) { const m = (a + b) / 2, p = alignment.pointAt(m); if (g.inside(p.x, p.y) === was) a = m; else b = m; }
          g.edges.push(addSta(was ? a : b));   // the last station still inside
        }
        was = now;
      }
      let extra = 0;
      for (const line of g.lines || []) for (let i = 0; i + 1 < line.length && extra < 64; i++) for (let k = 1; k <= n; k++) {
        const a = cl[k - 1], b = cl[k], c = line[i], d = line[i + 1], dx = b.x - a.x, dy = b.y - a.y, ex = d.x - c.x, ey = d.y - c.y, den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-15) continue;
        const u = ((c.x - a.x) * ey - (c.y - a.y) * ex) / den, v = ((c.x - a.x) * dy - (c.y - a.y) * dx) / den;
        if (u < 0 || u >= 1 || v < 0 || v > 1) continue;
        addSta(a.s + u * (b.s - a.s)); extra++;
      }
    }
  }
  const stations = [...st].sort((a, b) => a - b).filter((s, i, a) => !i || s - a[i - 1] > 1e-6);

  const sb = surface.bounds, far = 2 * Math.hypot(sb.maxX - sb.minX, sb.maxY - sb.minY);
  const sections = [];
  // 0.6 WL.25: the targets, each with its counts (a target without a line is said once)
  const tgs = (targets || []).filter((g) => TARGET_SIDES.includes(g.side) && TARGET_WHAT.includes(g.what) && TARGET_PARTS.includes(g.part)).map((g) => ({ ...g, found: 0, of: 0 }));
  // (a target whose line is gone is a note, not a problem: the corridor still builds, with the assembly's own values)
  for (const g of tgs) g.missing = !g.line || g.line.length < 2;
  const tgOf = (side, what, part) => tgs.find((g) => g.side === side && g.what === what && g.part === part && g.line?.length >= 2) || null;
  const hitOf = (g, p, ux, uy) => { if (!g) return null; g.of++; const h = sectionHit(p, ux, uy, g.line); if (h) g.found++; return h; };
  let off = 0;
  const tplMiss = new Set();   // 0.9: template ids a region names that are not in the project any more
  for (const sta of stations) {
    const p = alignment.pointAt(sta), z0 = profile.elevationAt(sta);
    if (z0 === null) continue;
    const rx = Math.sin(p.dir), ry = -Math.cos(p.dir);   // to the right
    const sec = { sta };
    const sl = sp ? slopesAt(sp, sta, nc) : { L: nc, R: nc };
    if (sp) sec.slopes = sl;
    const tk = rp ? (() => { const h = cantAt(rp, sta); return { E: h.E, hL: h.L, hR: h.R, shape: trackShape(A.rail, { hL: h.L, hR: h.R }, units), p: { x: p.x, y: p.y }, r: { x: rx, y: ry }, z0 }; })() : null;
    if (tk) sec.track = tk;   // 0.7.1 71.26
    for (const [side, sx] of [['L', -1], ['R', 1]]) {
      const ux = rx * sx, uy = ry * sx;
      const cl = { x: p.x, y: p.y, z: z0 };
      if (tk) {
        // 0.7.1 71.26: the track's ballast top, then the daylight from the cess edge
        const det = tk.shape.top[side].map((q) => ({ x: p.x + rx * q.o, y: p.y + ry * q.o, z: z0 + q.z, code: q.code }));
        const sh = det[det.length - 1];
        const r = castSlope(surface, sh, ux, uy, sh.z, A.cut, A.fill, { step: Math.max(0.1, step / 20), far });
        if (r.kind === 'off') off++;
        const dl = { x: r.x, y: r.y, z: r.z, kind: r.kind, code: 'DL' };
        det.push(dl);
        sec[side] = [det[0], det.find((q) => q.code === 'BSH'), sh, dl];
        (sec.det ||= {})[side] = det;
        continue;
      }
      if (tplOn) {
        // 0.9 SU.1110: this station's region, its templates on this side
        cl.code = 'CL';
        const ri = Math.max(0, regionAt(A.regions, sta));
        const side0 = { side, p, ux, uy, z0, cl, A, surface, step, far, tplMiss, sta, eps: units === 'm' ? 0.003 : 0.01 };
        const r = walkTemplates(A.regions[ri][side], side0);
        if (r.dl.kind === 'off') off++;
        sec[side] = [cl, r.eop, r.sh, r.dl];
        (sec.det ||= {})[side] = r.det;
        (sec.comps ||= {})[side] = r.comps;
        sec.region = ri;
        if (ri > 0 && Math.abs(A.regions[ri].from - sta) < 1e-6) (sec.compsBefore ||= {})[side] = walkTemplates(A.regions[ri - 1][side], side0).comps;
        continue;
      }
      if (custom) {
        cl.code = 'CL';
        // 0.7 D7.35: the parts of this side
        const r = walkSide(A.parts[side]?.length ? A.parts[side] : presetParts('rural', units), { side, p, ux, uy, z0, cl, dsl: sl[side] - nc, A, surface, step, far, eps: units === 'm' ? 0.003 : 0.01, tg: (what, part) => hitOf(tgOf(side, what, part), p, ux, uy) });
        if (r.dl.kind === 'off') off++;
        sec[side] = [cl, r.eop, r.sh, r.dl];
        (sec.det ||= {})[side] = r.det;
        continue;
      }
      // 0.6 WL.25: this side's targets move this side's points only
      const hW = hitOf(tgOf(side, 'width', 'eop'), p, ux, uy), hE = hitOf(tgOf(side, 'elev', 'eop'), p, ux, uy);
      const laneW = hW ? hW.t : A.lane;
      const eopZ = hE ? hE.z : z0 - laneW * sl[side];
      const ls = laneW > 1e-9 ? (z0 - eopZ) / laneW : sl[side];
      const ss = ls > A.shoulderSlope ? ls : A.shoulderSlope;   // 0.4 V18: the low side's shoulder no flatter than its lane
      const eop = { x: p.x + ux * laneW, y: p.y + uy * laneW, z: eopZ };
      const hSW = hitOf(tgOf(side, 'width', 'sh'), p, ux, uy), hSE = hitOf(tgOf(side, 'elev', 'sh'), p, ux, uy);
      const shW = hSW ? Math.max(0, hSW.t - laneW) : A.shoulder;
      const sh = { x: eop.x + ux * shW, y: eop.y + uy * shW, z: hSE ? hSE.z : eop.z - shW * ss };
      const r = castSlope(surface, sh, ux, uy, sh.z, A.cut, A.fill, { step: Math.max(0.1, step / 20), far });
      if (r.kind === 'off') off++;
      sec[side] = [cl, eop, sh, { x: r.x, y: r.y, z: r.z, kind: r.kind }];
    }
    sections.push(sec);
  }
  // 0.10.1 #1977: openings, then ties (see the header). Both move points of sections already built, then cast that side's
  // daylight again from its last point.
  const sidePts = (s, side) => (s.det ? s.det[side] : s[side]);
  const recast = (s, side) => {
    const pts = sidePts(s, side), sh = pts[pts.length - 2], dl = pts[pts.length - 1], p = alignment.pointAt(s.sta), sx = side === 'L' ? -1 : 1;
    const day = custom ? (A.parts[side] || []).find((q) => q.type === 'daylight') : null;
    const r = castSlope(surface, sh, Math.sin(p.dir) * sx, -Math.cos(p.dir) * sx, sh.z, day?.cut || A.cut, day?.fill || A.fill, { step: Math.max(0.1, step / 20), far });
    dl.x = r.x; dl.y = r.y; dl.z = r.z; dl.kind = r.kind;
  };
  for (const s of sections) for (const o of opens) {
    if (s.sta < o.from - 1e-6 || s.sta > o.to + 1e-6) continue;
    const pts = sidePts(s, o.side), cl = pts[0], eop = s[o.side][1], ie = pts.indexOf(eop);
    if (ie < 0 || ie >= pts.length - 2) continue;   // nothing between the pavement and the daylight
    const d0 = Math.hypot(eop.x - cl.x, eop.y - cl.y), sl = d0 > 1e-9 ? (cl.z - eop.z) / d0 : 0;
    for (let k = ie + 1; k < pts.length - 1; k++) { pts[k].z = eop.z - Math.hypot(pts[k].x - eop.x, pts[k].y - eop.y) * sl; pts[k].open = true; }
    (s.open ||= {})[o.side] = true;
    recast(s, o.side);
  }
  const tieInfo = [];
  if (tieList.length && sections.length >= 2) {
    const N = sections.length, ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
    const zOf = (g, q) => { const z = g.zAt(q.x, q.y); return z === null || z === undefined || !Number.isFinite(z) ? null : z; };
    const taken = new Uint8Array(N);   // sections already in a zone
    for (const g of tieList) {
      const inZone = sections.map((s) => { const c = sidePts(s, 'L')[0]; return g.inside(c.x, c.y) || g.edges.some((e) => Math.abs(e - s.sta) < 1e-5); });
      if (!inZone.some(Boolean)) { if (g.end === 'start') inZone[0] = true; else if (g.end === 'end') inZone[N - 1] = true; else continue; }
      for (let i0 = 0; i0 < N; i0++) {
        if (!inZone[i0]) continue;
        let i1 = i0; while (i1 + 1 < N && inZone[i1 + 1]) i1++;
        // each line's difference at the zone's two edge sections, before anything moves
        const snap = (i) => { const m = {}; for (const side of ['L', 'R']) sidePts(sections[i], side).slice(0, -1).forEach((q, k) => { const z = zOf(g, q); if (z !== null) m[side + (k ? q.code || k : 'CL')] = z - q.z; }); return m; };
        const dA = snap(i0), dB = snap(i1), clA = dA.LCL ?? dA.RCL ?? 0, clB = dB.LCL ?? dB.RCL ?? 0;
        const cap = 0.45 * (to - from), base = units === 'm' ? 10 : 30;
        const lenOf = (d) => Math.min(cap, A.tieLen > 0 ? A.tieLen : Math.max(base, 20 * Math.abs(d)));
        const LA = lenOf(clA), LB = lenOf(clB), sA = sections[i0].sta, sB = sections[i1].sta;
        for (let i = i0; i <= i1; i++) {
          const s = sections[i];
          for (const side of ['L', 'R']) {
            const pts = sidePts(s, side), c = zOf(g, pts[0]), dc = c !== null ? c - pts[0].z : (i - i0 <= i1 - i ? clA : clB);
            for (let k = 0; k < pts.length - 1; k++) { const z = zOf(g, pts[k]); pts[k].z = z !== null ? z : pts[k].z + dc; }
            recast(s, side);
          }
          s.tie = { kind: g.kind, id: g.id }; taken[i] = 1;
        }
        const blend = (i, w, d, dcl) => {
          const s = sections[i];
          if (taken[i] || !(w > 0)) return;
          for (const side of ['L', 'R']) {
            const pts = sidePts(s, side);
            for (let k = 0; k < pts.length - 1; k++) pts[k].z += w * (d[side + (k ? pts[k].code || k : 'CL')] ?? dcl);
            recast(s, side);
          }
          s.blend = Math.max(s.blend || 0, w);
        };
        for (let i = i0 - 1; i >= 0 && sA - sections[i].sta < LA; i--) blend(i, ease(1 - (sA - sections[i].sta) / LA), dA, clA);
        for (let i = i1 + 1; i < N && sections[i].sta - sB < LB; i++) blend(i, ease(1 - (sections[i].sta - sB) / LB), dB, clB);
        tieInfo.push({ kind: g.kind, id: g.id, name: g.name || '', ...(g.end ? { end: g.end } : {}), from: sA, to: sB, dz: i0 > 0 ? clA : clB, len: i0 > 0 ? LA : LB });
        i0 = i1;
      }
    }
  }
  if (sections.length < 2) return empty(t('corr.err.two'));
  if (off) problems.push(t('corr.off', { n: off }));
  if (tplMiss.size) problems.push(t('tpl.err.missing', { n: tplMiss.size }));
  const tgInfo = tgs.map(({ line, ...g }) => g);
  const line = (side, k) => sections.map((s) => s[side][k]);
  const lines = { CL: line('L', 0), EOP_L: line('L', 1), SH_L: line('L', 2), DL_L: line('L', 3), EOP_R: line('R', 1), SH_R: line('R', 2), DL_R: line('R', 3) };
  if (tplOn) {   // 0.9 SU.1110: a line for every code; a code that stops and starts again (another region) gets one line per run
    for (const side of ['L', 'R']) {
      const codes = new Set(sections.flatMap((s) => (s.det?.[side] || []).map((q) => q.code)).filter((cd) => cd && cd !== 'DL' && cd !== 'CL'));
      for (const cd of codes) {
        let run = [], n = 0;
        const flush = () => { if (run.length >= 2) { n++; const key = cd + '_' + side + (n > 1 ? '.' + n : ''); if (!lines[key]) lines[key] = run; } run = []; };
        for (const s of sections) { const q = s.det[side].find((x) => x.code === cd); if (q) run.push(q); else flush(); }
        flush();
      }
    }
  }
  if (custom || railOn) {   // 0.7 D7.35: a line for every other code (FL_L, TOC_R, WALK_L …; 0.7.1 71.26: SLP_L, BSH_R, BTOE_L, CESS_R …)
    for (const side of ['L', 'R']) {
      const codes = (sections[0].det?.[side] || []).map((q) => q.code).filter((cd) => cd && cd !== 'DL' && cd !== 'EOP');
      for (const cd of new Set(codes)) { const key = cd + '_' + side; if (!lines[key]) lines[key] = sections.map((s) => s.det[side].find((q) => q.code === cd)).filter(Boolean); }
    }
  }
  const detOf = (s, side) => (s.det ? s.det[side] : s[side]);
  const region = [...lines.DL_L, ...lines.DL_R.slice().reverse()].map((q) => ({ x: q.x, y: q.y, z: q.z }));
  // neighbouring sections must not cross (they do on the inside of a curve tighter than the corridor)
  let crossing = false;
  for (let i = 0; i + 1 < sections.length && !crossing; i++) for (const side of ['L', 'R']) {
    const a = sections[i][side], b = sections[i + 1][side];
    if (cross(a[0], a[3], b[0], b[3])) { crossing = true; break; }
  }
  if (crossing || (!problems.length && selfCrosses(region))) problems.push(t('corr.cross'));
  const points = [];
  for (const s of sections) for (const side of ['L', 'R']) for (const q of detOf(s, side).slice(side === 'L' ? 0 : 1)) points.push({ x: q.x, y: q.y, z: q.z });
  const breaklines = Object.entries(lines).map(([name, pts]) => ({ name, pts: pts.map((q) => ({ x: q.x, y: q.y, z: q.z })) }));
  // every section across (so the triangles follow the sections, and the ends close the corridor)
  for (const s of sections) breaklines.push({ name: 'section', pts: [...detOf(s, 'L').slice().reverse(), ...detOf(s, 'R').slice(1)].map((q) => ({ x: q.x, y: q.y, z: q.z })) });
  // 0.7.1 71.24: each part with courses, its inner and outer top edge at every section
  const courses = [];
  if (custom) for (const side of ['L', 'R']) {
    const det0 = sections[0].det?.[side] || [];
    det0.forEach((q, k) => {
      if (!q.layers || k === 0) return;
      const inner = det0[k - 1].code, edges = [];
      for (const sc of sections) { const D = sc.det?.[side] || [], o = D.find((x) => x.code === q.code), i = D.find((x) => x.code === inner); if (o && i) edges.push({ sta: sc.sta, i: { x: i.x, y: i.y, z: i.z }, o: { x: o.x, y: o.y, z: o.z } }); }
      if (edges.length >= 2) courses.push({ side, code: q.code, part: q.part, layers: q.layers, edges });
    });
  }
  // 0.7.1 71.26: the track's plan, quantities and any station's shape (absolute z) for the sections
  const rail = rp ? { plan: rp, rail: A.rail, units, quantities: trackQuantities(sections, A.rail, units), at: (sta) => { const z0 = profile.elevationAt(sta); if (z0 === null) return null; const h = cantAt(rp, sta); return { z0, E: h.E, shape: trackShape(A.rail, { hL: h.L, hR: h.R }, units) }; } } : null;
  const components = tplOn ? componentQuantities(sections) : null;   // 0.9 SU.1110
  return { problems, region, points, breaklines, info: { sections, lines, from, to, assembly: A, super: sp, targets: tgInfo, courses, ...(tieInfo.length ? { ties: tieInfo } : {}), ...(rail ? { rail } : {}), ...(components ? { components } : {}) } };
}

function cross(a, b, c, d) {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12));
}

/** 0.7.1 71.24: area (plan) and volume of every course: the part's plan width between neighbouring sections, averaged × the
 *  station step (as the sections' average end areas), × the course thickness. */
export function courseQuantities(info) {
  const out = [];
  for (const c of info?.courses || []) {
    let area = 0;
    for (let k = 1; k < c.edges.length; k++) {
      const a = c.edges[k - 1], b = c.edges[k], w = (e) => Math.hypot(e.o.x - e.i.x, e.o.y - e.i.y);
      area += ((w(a) + w(b)) / 2) * (b.sta - a.sta);
    }
    c.layers.forEach((L, k) => out.push({ side: c.side, code: c.code, part: c.part, k, name: L.name, material: L.material, course: L.course, t: L.t, area, volume: area * L.t, length: c.edges[c.edges.length - 1].sta - c.edges[0].sta }));
  }
  return out;
}
