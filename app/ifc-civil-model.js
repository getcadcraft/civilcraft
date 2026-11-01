/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-model.js — 0.7.1 71.24 (semhustej: "IFC support handled as a first class citizen … 2x3, 4.0, 4.3"). What the project
 * IFC export (ifc-civil.js) writes, gathered from a Project into plain data. No DOM; the Node test drives it exactly as the page.
 *
 *   civilIfcModel(project, { species, lat, lon, ground }) → model      (species: the Landscape plant list, a Map key → species, as the
 *                                                                       3D view takes it; lat / lon degrees at the file's origin)
 *   horizontalSegments(al) → [{ type 'LINE'|'CIRCULARARC'|TRANSITION_TYPES[kind], x, y, dir (radians), dir1 (at the end), r0, r1 (signed: + turns left,
 *       0 = straight), len (along the curve), sta, kind (a transition's alignment.js kind), Lp (the cubic parabola's length along its tangent) }]
 *   TRANSITION_TYPES  alignment.js transition kind → IfcAlignmentHorizontalSegmentTypeEnum (0.7.1 71.26: rail transitions)
 *   verticalSegments(prof, al) → [{ type 'CONSTANTGRADIENT'|'PARABOLICARC', sta, len, z0, g0, g1 }]   (clipped to the alignment)
 *   partOf(code) → 'lane'|'shoulder'|'gutter'|'curb'|'strip'|'walk'|'slope'|null   a corridor section point's code → its part
 *
 * Everything is in project units and absolute project coordinates (the writer moves it to the file's origin). Areas and volumes
 * stay in square / cubic project units here; the writer converts them to SI for quantities.
 *
 * model = { name, units, crs, lat, lon,
 *   alignments: [{ id, name, start, end, length, h, v | null, pis, pvis, poly: [{x, y, z | null, sta}], superEvents: [{ sta, L, R }], design }]
 *     (design: 0.7.1 71.24 { speed, unit 'km/h' | 'mph', cls } | null)
 *     (superEvents: the corridor's superelevation transition stations with the lanes' fall-away slopes, corridor.js sign)
 *   corridors: [{ id (the alignment's), name, alignment, standIn, from, to, parts: [{ part, side, mesh, area, length }],
 *                 cut: mesh | null, fill: mesh | null, volumes: { cut, fill } | null, nc, laneWidth, lanes, assembly (text),
 *                 cutSlope, fillSlope, step, superOn, design, courses: [{ side, code, part, k, name, material, course, t, area, volume, length,
 *                 mesh (a closed solid under the part) }] }]   (courses: 0.7.1 71.24, corridor.js courseQuantities)
 *   surfaces: [{ key 'eg' | 'fg', name, pts: [{x, y, z}], faces: [[a, b, c]] (counter-clockwise from above) }]
 *   pads: [{ id, name, z, top: mesh, area, cut, fill (meshes | null), volumes, cutSlope, fillSlope, walls: [{ mesh, length, maxH, avgH,
 *            faceArea, thickness, volume }] }]
 *   network: null | { name, type, structures: [{ id, name, x, y, rim, bottom, shape, w, l, ang, kind, typeName }],
 *                     pipes: [{ id, name, a: {x, y, z}, b: {x, y, z} (inverts), dia (project units, inside), len, slope, from, to }] }
 *   parcels: [{ id, name, pts: [{x, y}] (arcs as short chords), area }]
 *   landscape: ifc-landscape.js elements (plants, beds, hedges, hardscape, freeform objects; bodies in project units)
 *   masses: ifc-massing.js masses (z0 = the ground floor on the mass's own ground)
 *   notes: [text] }
 * mesh = { pos: [x, y, z, …], idx: [a, b, c, …] (0-based, shared vertices), closed }
 */

import { superPlan, slopesAt, keyStations as superStations } from './superelev.js';
import { defaultAssembly, ncOf, laneRunWidth, presetParts, courseQuantities } from './corridor.js';
import { wallSolids, wallQuantities } from './sides.js';
import { triangulate, measureMass } from './massing.js';
import { courses, parcelArea } from './parcels.js';
import { structGeom, typeOf } from './structs.js';
import { DIA_UNIT } from './pipes.js';
import { baseOf, RAIL_PROFILES } from './rail.js';   // 0.7.1 71.26 / B: the track
import { speciesIndex } from './landscape/planting.js';
import { plantingElements } from './landscape/ifc-landscape.js';
import { hardElements } from './landscape/hardscape.js';
import { freeformElements } from './landscape/freeform.js';
import { cleanWater } from './water.js';   // 0.8 LC.16 rest + CV.2: water mains in the IFC
import { layout } from './water-objects.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

/** A mesh builder with shared vertices (welded on exact coordinates). */
export function meshOf(closed = false) {
  const m = { pos: [], idx: [], closed }, at = new Map();
  m.v = (p) => { const k = p.x + ',' + p.y + ',' + p.z; let i = at.get(k); if (i === undefined) { i = m.pos.length / 3; m.pos.push(p.x, p.y, p.z); at.set(k, i); } return i; };
  m.tri = (a, b, c) => { const i = m.v(a), j = m.v(b), k = m.v(c); if (i !== j && j !== k && i !== k) m.idx.push(i, j, k); };
  m.quad = (a, b, c, d) => { m.tri(a, b, c); m.tri(a, c, d); };
  return m;
}
const triArea = (P, a, b, c) => {
  const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2];
  const vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
  return Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
};
export function meshArea(m) { let a = 0; for (let i = 0; i < m.idx.length; i += 3) a += triArea(m.pos, m.idx[i], m.idx[i + 1], m.idx[i + 2]); return a; }
const done = (m) => (m.idx.length ? { pos: m.pos, idx: m.idx, closed: m.closed } : null);

// ---------------------------------------------------------------------------- alignments

export const TRANSITION_TYPES = { clothoid: 'CLOTHOID', cubic: 'CUBIC', bloss: 'BLOSSCURVE', helmert: 'HELMERTCURVE', sinehalf: 'COSINECURVE', sine: 'SINECURVE' };
export function horizontalSegments(al) {
  const out = [];
  for (const e of al?.elements || []) {
    const sg = e.ccw ? 1 : -1;
    if (e.type === 'line') out.push({ type: 'LINE', x: e.p0.x, y: e.p0.y, dir: e.dir, dir1: e.dir, r0: 0, r1: 0, len: e.len, sta: e.sta });
    else if (e.type === 'arc') { const d0 = fin(e.dirIn) ? e.dirIn : e.a0 + sg * Math.PI / 2; out.push({ type: 'CIRCULARARC', x: e.p0.x, y: e.p0.y, dir: d0, dir1: fin(e.dirOut) ? e.dirOut : d0 + sg * e.delta, r0: sg * e.r, r1: sg * e.r, len: e.len, sta: e.sta }); }
    else if (e.type === 'spiral') {
      const kind = TRANSITION_TYPES[e.tr] ? e.tr : 'clothoid';
      out.push({ type: TRANSITION_TYPES[kind], kind, Lp: e.Lp ?? e.Ls, x: e.p0.x, y: e.p0.y, dir: e.dir0, dir1: e.dir1, r0: e.io === 'in' ? 0 : sg * e.r, r1: e.io === 'in' ? sg * e.r : 0, len: e.len, sta: e.sta });
    }
  }
  return out;
}

export function verticalSegments(prof, al) {
  if (!prof?.ok || !al?.ok) return null;
  const A = Math.max(prof.start, al.start), B = Math.min(prof.end, al.end);
  if (!(B - A > 1e-9)) return null;
  const raw = [];
  let cur = prof.start;
  for (const c of prof.curves) {
    if (c.bvc - cur > 1e-9) raw.push({ type: 'CONSTANTGRADIENT', a: cur, b: c.bvc });
    raw.push({ type: 'PARABOLICARC', a: c.bvc, b: c.evc });
    cur = c.evc;
  }
  if (prof.end - cur > 1e-9) raw.push({ type: 'CONSTANTGRADIENT', a: cur, b: prof.end });
  // grade breaks with no curve: one constant segment per grade
  const split = [];
  for (const s of raw) {
    if (s.type !== 'CONSTANTGRADIENT') { split.push(s); continue; }
    let a = s.a;
    for (const p of prof.pvis) if (p.sta > a + 1e-9 && p.sta < s.b - 1e-9) { split.push({ ...s, a, b: p.sta }); a = p.sta; }
    split.push({ ...s, a, b: s.b });
  }
  const out = [];
  for (const s of split) {
    const a = Math.max(s.a, A), b = Math.min(s.b, B);
    if (!(b - a > 1e-9)) continue;
    const eps = Math.min(1e-6, (b - a) / 4);
    const g0 = prof.gradeAt(a + (s.type === 'CONSTANTGRADIENT' ? (b - a) / 2 : 0));
    const g1 = s.type === 'CONSTANTGRADIENT' ? g0 : prof.gradeAt(b);
    void eps;
    out.push({ type: s.type, sta: a, len: b - a, z0: prof.elevationAt(a), g0, g1 });
  }
  return out;
}

function alignmentOf(project, a) {
  const al = project.alignment(a);
  if (!al?.ok) return null;
  const prof = (a.pvis || []).length >= 2 ? project.designProfile(a) : null;
  const v = prof?.ok ? verticalSegments(prof, al) : null;
  const poly = al.polyline(Math.max(al.length / 400, project.state.units === 'm' ? 1 : 3), Math.PI / 180).map((q) => ({ x: q.x, y: q.y, sta: q.sta, z: prof?.ok ? prof.elevationAt(q.sta) : null }));
  // 0.7.1 71.26 / B: a railway's cant (rail.js cantPlan: IfcAlignmentCant's segments) and its settings
  const plan = a.rail?.on ? project.railPlan?.(a) : null;
  const cant = plan?.segments?.length ? { base: baseOf(a.rail), segments: plan.segments, curves: plan.curves || [] } : null;
  return { id: a.id, name: a.name, start: al.start, end: al.end, length: al.length, h: horizontalSegments(al), v, pis: (a.pis || []).map((p) => ({ ...p })), pvis: (a.pvis || []).map((p) => ({ ...p })), poly, superEvents: [], design: a.design || null, rail: a.rail?.on ? a.rail : null, cant, al, prof };
}

// ---------------------------------------------------------------------------- corridors

export function partOf(code) {
  if (!code || code === 'CL') return null;
  if (/^(LANE|EOP)/.test(code)) return 'lane';
  if (/^SH/.test(code)) return 'shoulder';
  if (/^FL/.test(code)) return 'gutter';
  if (/^(TOC|BOC|BC)/.test(code)) return 'curb';
  if (/^STRIP/.test(code)) return 'strip';
  if (/^WALK/.test(code)) return 'walk';
  if (code === 'DL') return 'slope';
  return null;
}
function sidePoints(sec, side) {
  if (sec.det?.[side]) return sec.det[side].map((q, i) => ({ x: q.x, y: q.y, z: q.z, code: i ? q.code : 'CL', kind: q.kind }));
  const a = sec[side];
  if (!a) return [];
  return [{ ...a[0], code: 'CL' }, { ...a[1], code: 'EOP' }, { ...a[2], code: 'SH' }, { ...a[3], code: 'DL' }];
}
const pt = (q) => ({ x: q.x, y: q.y, z: q.z });

function assemblyText(asm, units) {
  const u = units === 'm' ? 'm' : 'ft', f = (v) => +Number(v).toFixed(3);
  if (!asm.parts) return `lane ${f(asm.lane)} ${u} @ ${f(asm.laneSlope * 100)}%, shoulder ${f(asm.shoulder)} ${u} @ ${f(asm.shoulderSlope * 100)}%`;   // i18n-ignore: IFC file data, English like every IFC we write
  const side = (L) => (L?.length ? L : presetParts('rural', units)).map((q) => q.type === 'curb' ? `curb h ${f(q.h)} w ${f(q.w)}` : q.type === 'daylight' ? `daylight ${f(q.cut)}:1 / ${f(q.fill)}:1` : `${q.type} ${f(q.w)} ${u} @ ${f(q.slope * 100)}%`).join(', ');   // i18n-ignore: IFC file data
  return 'L: ' + side(asm.parts.L) + ' | R: ' + side(asm.parts.R);   // i18n-ignore: IFC file data
}

function corridorOf(project, a, info, { standIn = false, volumes = null } = {}) {
  const units = project.state.units, secs = info.sections || [];
  if (secs.length < 2) return null;
  const asm = { ...defaultAssembly(units), ...a.corridor };
  const parts = new Map(), cut = meshOf(), fill = meshOf();
  const meshFor = (side, part) => { const k = side + ':' + part; if (!parts.has(k)) parts.set(k, { part, side, m: meshOf() }); return parts.get(k).m; };
  for (let i = 0; i + 1 < secs.length; i++) for (const side of ['L', 'R']) {
    const A = sidePoints(secs[i], side), B = sidePoints(secs[i + 1], side), byCode = new Map(B.map((q, k) => [q.code, k]));
    for (let k = 1; k < A.length; k++) {
      const part = partOf(A[k].code), kb = byCode.get(A[k].code), kb0 = byCode.get(A[k - 1].code);
      if (!part || kb === undefined || kb0 === undefined) continue;
      const p0 = pt(A[k - 1]), p1 = pt(A[k]), q0 = pt(B[kb0]), q1 = pt(B[kb]);
      if (part === 'slope') {
        if (standIn) continue;   // daylight slopes on made-up ground are not written
        const ka = A[k].kind, kb2 = B[kb].kind, kind = ka === 'cut' || ka === 'fill' ? ka : kb2;
        if (kind !== 'cut' && kind !== 'fill') continue;
        (kind === 'cut' ? cut : fill).quad(p0, p1, q1, q0);
        continue;
      }
      meshFor(side, part).quad(p0, p1, q1, q0);
    }
  }
  const length = info.to - info.from;
  const list = [...parts.values()].filter((x) => x.m.idx.length).map((x) => ({ part: x.part, side: x.side, mesh: done(x.m), area: meshArea(x.m), length }));
  const custom = !!(asm.parts && (asm.parts.L?.length || asm.parts.R?.length));
  const lanes = custom ? ['L', 'R'].reduce((n, s) => n + (asm.parts[s]?.length ? asm.parts[s] : presetParts('rural', units)).filter((q) => q.type === 'lane').length, 0) : 2;
  const firstLane = custom ? ['L', 'R'].map((s) => asm.parts[s]?.find((q) => q.type === 'lane')).find(Boolean) : null;
  return {
    id: a.id, name: a.name, alignment: a.id, standIn, from: info.from, to: info.to, parts: list, cut: done(cut), fill: done(fill), volumes,
    nc: custom ? ncOf(asm) : asm.laneSlope, laneWidth: firstLane ? firstLane.w : asm.lane, laneRun: laneRunWidth(asm), lanes, assembly: assemblyText(asm, units),
    cutSlope: asm.cut, fillSlope: asm.fill, step: asm.step, superOn: !!asm.super?.on, design: a.design || null, courses: courseSolids(info),
    facility: info.rail ? 'rail' : 'road', track: info.rail ? trackSolids(info, units) : null,   // 0.7.1 71.26 / B
  };
}

/** 0.7.1 71.24: every pavement course as a closed solid under its part: the part's inner and outer top edges at each section,
 *  lowered by the depth of the course's top and bottom (straight down), with its quantities (corridor.js courseQuantities). */
function courseSolids(info) {
  const q = courseQuantities(info), out = [];
  for (const c of info.courses || []) {
    let top = 0;
    c.layers.forEach((L, k) => {
      const bot = top + L.t, m = meshOf(true), E = c.edges, at = (e, key, d) => ({ x: e[key].x, y: e[key].y, z: e[key].z - d });
      for (let j = 0; j + 1 < E.length; j++) {
        const a = E[j], b = E[j + 1];
        m.quad(at(a, 'i', top), at(a, 'o', top), at(b, 'o', top), at(b, 'i', top));
        m.quad(at(a, 'i', bot), at(b, 'i', bot), at(b, 'o', bot), at(a, 'o', bot));
        m.quad(at(a, 'i', top), at(b, 'i', top), at(b, 'i', bot), at(a, 'i', bot));
        m.quad(at(a, 'o', top), at(a, 'o', bot), at(b, 'o', bot), at(b, 'o', top));
      }
      const f = E[0], l = E[E.length - 1];
      m.quad(at(f, 'i', top), at(f, 'i', bot), at(f, 'o', bot), at(f, 'o', top));
      m.quad(at(l, 'i', top), at(l, 'o', top), at(l, 'o', bot), at(l, 'i', bot));
      outward(m);
      const qq = q.find((x) => x.side === c.side && x.code === c.code && x.k === k);
      out.push({ ...qq, mesh: done(m) });
      top = bot;
    });
  }
  return out.filter((x) => x.mesh);
}
/** 0.7.1 71.26 / B: a ring of points per section, lofted into a closed solid (rings of one length; the ends closed by a fan from
 *  their middle — the rings here are convex enough: rail outlines, ballast and sub-ballast polygons). */
function loft(rings) {
  const m = meshOf(true), ok = rings.filter((r) => r && r.length >= 3 && r.length === rings[0].length);
  if (ok.length < 2) return null;
  const n = ok[0].length;
  for (let j = 0; j + 1 < ok.length; j++) for (let i = 0; i < n; i++) { const k = (i + 1) % n; m.quad(ok[j][i], ok[j][k], ok[j + 1][k], ok[j + 1][i]); }
  for (const [r, back] of [[ok[0], true], [ok[ok.length - 1], false]]) {
    const c = { x: r.reduce((v, q) => v + q.x, 0) / n, y: r.reduce((v, q) => v + q.y, 0) / n, z: r.reduce((v, q) => v + q.z, 0) / n };
    for (let i = 0; i < n; i++) { const k = (i + 1) % n; if (back) m.tri(c, r[k], r[i]); else m.tri(c, r[i], r[k]); }
  }
  outward(m);
  return done(m);
}
/** A rail's outline (head, web, foot) around its head centre (o, z = top of rail), in project units: [{ o, z }] counter-clockwise. */
export function railOutline(name, units) {
  const P = RAIL_PROFILES[name] || RAIL_PROFILES['60E1'], k = units === 'm' ? 0.001 : 0.001 / 0.3048006096;
  const h = P.h * k, hd = P.head * k / 2, ft = P.foot * k / 2, wb = P.web * k / 2, hh = h * 0.27, fh = h * 0.12;
  return [{ o: -ft, z: -h }, { o: ft, z: -h }, { o: ft, z: -h + fh }, { o: wb, z: -h + fh * 2 }, { o: wb, z: -hh }, { o: hd, z: -hh }, { o: hd, z: 0 }, { o: -hd, z: 0 }, { o: -hd, z: -hh }, { o: -wb, z: -hh }, { o: -wb, z: -h + fh * 2 }, { o: -ft, z: -h + fh }];
}
/** The track of a railway corridor (corridor.js info.rail, rail.js trackShape per section): each rail as a solid along its head line,
 *  each track's sleepers (position, direction across and slope) at their spacing, the ballast bed and the sub-ballast as solids, and
 *  the quantities (rail.js trackQuantities). Project units, absolute. */
function trackSolids(info, units) {
  const R = info.rail, rail = R.rail, secs = (info.sections || []).filter((s) => s.track);
  if (secs.length < 2) return null;
  const W = (sec, o, z) => ({ x: sec.track.p.x + sec.track.r.x * o, y: sec.track.p.y + sec.track.r.y * o, z: sec.track.z0 + z });
  const outline = railOutline(rail.rail, units), n = rail.tracks || 1, rails = [], sleepers = [];
  for (let k = 0; k < n; k++) for (let j = 0; j < 2; j++) {
    const rings = secs.map((s) => { const hc = s.track.shape.tracks[k].rails[j], sl = s.track.shape.tracks[k].slope, c = Math.cos(Math.atan(sl)), sn = Math.sin(Math.atan(sl)); return outline.map((q) => W(s, hc.o + q.o * c - q.z * sn, hc.z + q.o * sn + q.z * c)); });
    const mesh = loft(rings);
    if (mesh) rails.push({ track: k, side: j ? 'R' : 'L', mesh, length: R.quantities.tracks[k]?.rail / 2 || 0, profile: rail.rail, kg: (RAIL_PROFILES[rail.rail] || RAIL_PROFILES['60E1']).kg });
  }
  // sleepers: along each track's centre line, every `spacing` from its start, between the neighbouring sections
  const S = rail.sleeper;
  for (let k = 0; k < n; k++) {
    const pos = [];
    let dist = 0, next = 0;
    for (let j = 1; j < secs.length; j++) {
      const A = secs[j - 1], B = secs[j], ta = A.track.shape.tracks[k], tb = B.track.shape.tracks[k];
      const a = W(A, ta.c, 0), b = W(B, tb.c, 0), len = Math.hypot(b.x - a.x, b.y - a.y);
      while (next <= dist + len + 1e-9) {
        const u = len > 0 ? (next - dist) / len : 0, lerp = (p, q) => p + (q - p) * u;
        const top = (t, s) => ({ o: (t.sleeper[0].o + t.sleeper[1].o) / 2, z: (t.sleeper[0].z + t.sleeper[1].z) / 2 });
        const pa = top(ta), pb = top(tb), wa = W(A, pa.o, pa.z), wb = W(B, pb.o, pb.z);
        const rx = lerp(A.track.r.x, B.track.r.x), ry = lerp(A.track.r.y, B.track.r.y), rl = Math.hypot(rx, ry) || 1, sl = lerp(ta.slope, tb.slope);
        pos.push({ x: lerp(wa.x, wb.x), y: lerp(wa.y, wb.y), z: lerp(wa.z, wb.z), across: { x: rx / rl, y: ry / rl }, slope: sl });
        next += S.spacing;
      }
      dist += len;
    }
    sleepers.push({ track: k, at: pos, length: S.length, width: S.width, depth: S.depth, material: S.material, spacing: S.spacing });
  }
  const ring = (key) => secs.map((s) => (s.track.shape[key] || []).map((q) => W(s, q.o, q.z)));
  return { rail, rails, sleepers, ballast: loft(ring('ballast')), sub: loft(ring('sub')), quantities: R.quantities, base: baseOf(rail) };
}
/** Turn a closed mesh's faces outward (positive volume). */
function outward(m) {
  let vol = 0; const P = m.pos;
  for (let i = 0; i < m.idx.length; i += 3) { const a = m.idx[i] * 3, b = m.idx[i + 1] * 3, c = m.idx[i + 2] * 3; vol += P[a] * (P[b + 1] * P[c + 2] - P[b + 2] * P[c + 1]) - P[a + 1] * (P[b] * P[c + 2] - P[b + 2] * P[c]) + P[a + 2] * (P[b] * P[c + 1] - P[b + 1] * P[c]); }
  if (vol < 0) for (let i = 0; i < m.idx.length; i += 3) { const x = m.idx[i + 1]; m.idx[i + 1] = m.idx[i + 2]; m.idx[i + 2] = x; }
}

// ---------------------------------------------------------------------------- pads and walls

function wallMeshes(walls, thickness) {
  const q = wallQuantities(walls);
  return wallSolids(walls).map((w, i) => {
    const m = meshOf(true), n = w.inner.length, IT = [], OT = [], IB = [], OB = [];
    for (let k = 0; k < n; k++) {
      IT.push({ x: w.inner[k].x, y: w.inner[k].y, z: w.top[k] }); OT.push({ x: w.outer[k].x, y: w.outer[k].y, z: w.top[k] });
      IB.push({ x: w.inner[k].x, y: w.inner[k].y, z: w.bottom[k] }); OB.push({ x: w.outer[k].x, y: w.outer[k].y, z: w.bottom[k] });
    }
    const segs = w.closed ? n : n - 1;
    for (let k = 0; k < segs; k++) {
      const j = (k + 1) % n;
      m.quad(IT[k], IT[j], OT[j], OT[k]);   // top
      m.quad(IB[k], OB[k], OB[j], IB[j]);   // bottom
      m.quad(IT[k], IB[k], IB[j], IT[j]);   // inner face
      m.quad(OT[k], OT[j], OB[j], OB[k]);   // outer face
    }
    if (!w.closed) { m.quad(IT[0], OT[0], OB[0], IB[0]); m.quad(IT[n - 1], IB[n - 1], OB[n - 1], OT[n - 1]); }
    const one = wallQuantities([walls[i]]);
    void q;
    outward(m);   // whichever way round the pad was drawn
    return { mesh: done(m), length: one.length, maxH: one.maxH, avgH: one.avgH, faceArea: one.faceArea, thickness, volume: one.faceArea * thickness, sides: walls[i].k };
  }).filter((w) => w.mesh);
}

function padOf(pad, info, volumes) {
  const poly = info?.poly || pad.pts, z = Number(pad.z);
  const zv = (p) => (fin(p.z) ? p.z : z);
  const top = meshOf(), tri = triangulate(poly.map((p) => ({ x: p.x, y: p.y })));
  for (let i = 0; i < tri.length; i += 3) {
    const a = poly[tri[i]], b = poly[tri[i + 1]], c = poly[tri[i + 2]];
    const o = (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    const P = (p) => ({ x: p.x, y: p.y, z: zv(p) });
    if (o >= 0) top.tri(P(a), P(b), P(c)); else top.tri(P(a), P(c), P(b));
  }
  let area = 0;
  for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; area += p.x * q.y - q.x * p.y; }
  // the slopes between the pad's edge and its daylight line: one quad per pair of neighbouring rays of the same kind
  const cut = meshOf(), fill = meshOf(), rays = (info?.rays || []).filter((r) => r.kind === 'cut' || r.kind === 'fill' || r.kind === 'flat');
  for (let i = 0; i < rays.length && rays.length > 1; i++) {
    const r = rays[i], s = rays[(i + 1) % rays.length], kind = r.kind !== 'flat' ? r.kind : s.kind;
    if (kind !== 'cut' && kind !== 'fill') continue;
    const z0 = (q) => (fin(q.z0) ? q.z0 : z);
    (kind === 'cut' ? cut : fill).quad({ x: r.x0, y: r.y0, z: z0(r) }, { x: r.x, y: r.y, z: r.z }, { x: s.x, y: s.y, z: s.z }, { x: s.x0, y: s.y0, z: z0(s) });
  }
  return {
    id: pad.id, name: pad.name, z, top: done(top), area: Math.abs(area / 2), cut: done(cut), fill: done(fill), volumes,
    cutSlope: Number(pad.cut), fillSlope: Number(pad.fill), walls: info?.walls?.length ? wallMeshes(info.walls, pad.sides?.wallT || 0) : [],
  };
}

// ---------------------------------------------------------------------------- the project

const PREDEFINED = { manhole: 'MANHOLE', inlet: 'SUMP', junction: 'INSPECTIONCHAMBER', outlet: 'USERDEFINED' };   // as structs.js typeItem

export function civilIfcModel(project, { species = null, lat = null, lon = null } = {}) {
  const s = project.state, units = s.units, notes = [];
  const egR = project.eg(), eg = egR.surface || null, g = project.graded(), fg = g.surface || null;
  const vol = eg && fg ? project.volumes() : null;
  const volOf = (id) => { const v = vol?.items?.find((x) => x.id === id); return v ? { cut: v.cut, fill: v.fill } : null; };
  const model = { name: s.name, units, crs: s.crs || null, lat, lon, alignments: [], corridors: [], surfaces: [], pads: [], network: null, parcels: [], landscape: [], masses: [], notes };

  const byAl = new Map();
  for (const a of s.alignments) { const x = alignmentOf(project, a); if (x) { model.alignments.push(x); byAl.set(a.id, x); } }

  // corridors: graded into the existing ground, or (no ground yet) the road on a flat stand-in, its slopes left out
  const items = eg ? (g.items || []).filter((x) => x.kind === 'corridor' && x.sections?.length) : project.standInCorridors?.() || [];
  for (const it of items) {
    const a = s.alignments.find((x) => x.id === it.id), A = byAl.get(it.id);
    if (!a || !A) continue;
    const c = corridorOf(project, a, it, { standIn: !eg, volumes: volOf(it.id) });
    if (c) model.corridors.push(c);
    // superelevation: the lanes' slopes at every transition station
    const asm = { ...defaultAssembly(units), ...a.corridor };
    if (asm.super?.on) {
      const custom = !!(asm.parts && (asm.parts.L?.length || asm.parts.R?.length)), nc = custom ? ncOf(asm) : asm.laneSlope;
      const plan = it.super || superPlan(A.al, { super: asm.super, nc, lane: custom ? laneRunWidth(asm) : asm.lane });
      const stas = [...new Set(superStations(plan).map((v) => +v.toFixed(6)))].filter((v) => v >= A.start - 1e-9 && v <= A.end + 1e-9).sort((x, y) => x - y);
      A.superEvents = stas.map((sta) => ({ sta, ...slopesAt(plan, sta, nc) }));
    }
  }
  if (!eg && items.length) notes.push('standin');

  if (eg) model.surfaces.push({ key: 'eg', name: s.surface.name || 'Existing ground', ...eg.toFaces() });   // i18n-ignore: IFC file data (fallback name)
  if (fg) model.surfaces.push({ key: 'fg', name: 'Proposed (graded) surface', ...fg.toFaces() });   // i18n-ignore: IFC file data

  for (const p of s.pads) {
    if ((p.pts || []).length < 3) continue;
    const info = eg ? (g.items || []).find((x) => x.kind === 'pad' && x.id === p.id) : null;
    model.pads.push(padOf(p, info, volOf(p.id)));
  }

  const net = s.network;
  if (net && (net.structures.length || net.pipes.length)) {
    const chk = project.networkCheck(), per = DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit, byId = new Map(net.structures.map((x) => [x.id, x]));
    const structures = [];
    for (const x of net.structures) {
      const info = chk?.structs?.get(x.id), rim = info?.rim ?? (fin(x.rim) ? x.rim : null);
      if (!fin(rim)) continue;
      let bottom = info?.sump;
      if (!fin(bottom)) bottom = rim - (units === 'm' ? 1.5 : 5);
      if (!(bottom < rim)) continue;
      const geo = structGeom(x, net, units), k = typeOf(x, net);
      const out = net.pipes.find((q) => q.from === x.id), to = out && byId.get(out.to);
      structures.push({ id: x.id, name: x.name, x: x.x, y: x.y, rim, bottom, shape: geo.shape, w: geo.type ? geo.outW : (Number(x.dia) || 0) / per, l: geo.type ? geo.outL : (Number(x.dia) || 0) / per,
        ang: to ? Math.atan2(to.y - x.y, to.x - x.x) : 0, kind: k?.kind || 'manhole', predefined: PREDEFINED[k?.kind || 'manhole'], typeName: k?.name || '', sumpDepth: Number(x.sumpDepth) || 0, rimFrom: info?.rimFrom || null });
    }
    const pipes = [];
    for (const q of net.pipes) {
      const a = byId.get(q.from), b = byId.get(q.to);
      if (!a || !b || !fin(q.invUp) || !fin(q.invDn)) continue;
      const D = (Number(q.dia) || 0) / per;
      if (!(D > 0)) continue;
      const info = chk?.pipes?.get(q.id);
      pipes.push({ id: q.id, name: q.name, a: { x: a.x, y: a.y, z: q.invUp }, b: { x: b.x, y: b.y, z: q.invDn }, dia: D, diaText: q.dia + ' ' + DIA_UNIT[units === 'm' ? 'm' : 'ft'].name, len: Math.hypot(b.x - a.x, b.y - a.y), slope: info?.slope ?? null, cover: info?.cover ?? null, from: a.name, to: b.name });
    }
    model.network = { name: net.name, type: net.type, structures, pipes, rules: net.rules || {} };
  }

  // 0.8 LC.16 rest + CV.2 (civil_PART_3): the water mains as pipes under the ground with their hydrants, valves and fittings (water-objects.js)
  if (s.water?.pipes?.length) {
    const wat = cleanWater(s.water, units), per = DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit, ground = project.graded().surface || project.eg().surface;
    const lay = layout(wat, units, { zAt: (x, y) => { const z = ground?.elevationAt(x, y); return Number.isFinite(z) ? z : null; } });
    const pipes = lay.pipes.filter((p) => p.kind === 'pipe' && fin(p.a.z) && fin(p.b.z) && p.d > 0).map((p) => ({ id: p.id, name: p.name, a: p.a, b: p.b, dia: p.d / per, diaText: p.d + ' ' + DIA_UNIT[units === 'm' ? 'm' : 'ft'].name, len: p.len, cover: lay.cover }));
    const fixtures = lay.fixtures.filter((f) => fin(f.z)).map((f) => ({ id: f.id, kind: f.kind, name: f.name, x: f.x, y: f.y, z: f.z, dia: f.dia ? f.dia / per : 0, angle: f.angle ?? null, source: f.source }));
    if (pipes.length) model.water = { name: s.water.name || 'Water mains', pipes, fixtures, cover: lay.cover };   // i18n-ignore: IFC file data
  }

  for (const r of s.parcels || []) {
    if ((r.pts || []).length < 3) continue;
    const pts = [];
    for (const c of courses(r.pts)) {
      pts.push({ x: c.from.x, y: c.from.y });
      if (c.kind !== 'curve') continue;
      const n = Math.max(2, Math.ceil(c.delta / (Math.PI / 36))), a0 = Math.atan2(c.from.y - c.c.y, c.from.x - c.c.x);
      for (let k = 1; k < n; k++) { const a = a0 + c.turn * c.delta * k / n; pts.push({ x: c.c.x + c.R * Math.cos(a), y: c.c.y + c.R * Math.sin(a) }); }
    }
    model.parcels.push({ id: r.id, name: r.name, pts, area: parcelArea(r.pts) });
  }

  // the Landscape workspace (ifc-landscape.js elements) and the building masses (ifc-massing.js), in the same file
  const ls = s.landscape;
  if (ls) {
    const surf = fg || eg, zAt = surf ? (x, y) => surf.elevationAt(x, y, 1e-6) : null;
    const index = species instanceof Map ? species : speciesIndex([], ls.palette || []);
    model.landscape = [...plantingElements(ls, index, units, { zAt }), ...hardElements(ls, surf, units), ...freeformElements(ls, surf, units)];
  }
  for (const m of s.masses || []) {
    const sf = (m.ground === 'fg' && fg) || eg, elev = sf ? (x, y) => { const z = sf.elevationAt(x, y, 1e-6); return fin(z) ? z : null; } : null;
    const me = measureMass(m, elev);
    model.masses.push({ id: m.id, name: m.name, use: m.use, pts: m.pts, floors: m.floors, floorHeight: m.floorHeight, z0: me.z0, base: m.base, ground: m.ground, parcel: (s.parcels || []).find((r) => r.id === m.parcel)?.name || '' });
  }
  return model;
}

/** Nothing to write? */
export function modelEmpty(m) {
  return !m.alignments.length && !m.corridors.length && !m.surfaces.length && !m.pads.length && !m.network && !m.water && !m.parcels.length && !m.landscape.length && !m.masses.length;
}
