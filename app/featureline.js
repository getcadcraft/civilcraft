/* SPDX-License-Identifier: Apache-2.0 */
/**
 * featureline.js — feature lines with grades (0.4 V14). No DOM; the Node test drives it (bin/test-civilcraft-features.mjs).
 *
 * A feature line is a 3D polyline the user grades: { id, name, pts: [{x, y, z}], closed, use, daylight, cut, fill }.
 *   use 'eg'      a breakline of the existing ground (a curb, a ditch, a wall top surveyed or designed onto the ground)
 *   use 'design'  part of the proposed surface: a CLOSED line grades its inside to its edge (a sloped pad); with
 *                 daylight on, cut and fill slopes (H:V) run from its edge to the ground, as a pad's do (grading.js)
 *   use 'off'     drawn only
 * Elevations are per vertex; a segment's grade is Δz / its plan length (rise over run, 0.02 = 2 %).
 *
 * Arcs (0.6 WL.24): a vertex may carry `b`, the bulge of the segment that STARTS there (DXF style: b = tan(sweep / 4),
 * + = curving left), so a segment is an arc in plan whose ends sit at different elevations: z changes evenly along the
 * arc (one grade), its plan length is r·|sweep|, its 3D length √(L² + Δz²) — a helix piece. Everything that needs straight
 * lines (the surface's breaklines, grading regions, the plan's linework, the 3D view, DXF/DWG) takes `flatten(f)`: the arc
 * in pieces within 0.01 of the curve. Crossings with an alignment are worked out on the true arc.
 *   okBulge(b) · arcOf(a, b, bulge) → { cx, cy, r, a0, sweep, L } · bulgeThrough(a, m, b) · bulgeForRadius(a, b, r, left)
 *   pointOnSeg(a, b, bulge, u) → { x, y, dir } · arcPieces(A, tol, maxDeg) · hasArcs(f) · flatten(f, { tol, maxDeg })
 *   setArc(f, i, r, left) (r 0 = straight) · arcText(f, i) → '50.00 L' · parseArc('50 R') → { r, left }
 *   cadPolyline(f) → { pts, closed, xdata, arcsLeft } · featureFromCad(vertices, closed, xdata, units) → feature | null
 *       (DXF/DWG: the pieces + CADCRAFT extended data naming the arcs; see the section below)
 *
 *   USES · FEATURE_DEFAULTS(units) · cleanFeature(obj, units) → feature | null (untrusted: the project file)
 *   stations(f) → [0, …] plan distance to each vertex (and the closing segment's end for a closed line: length n + 1)
 *   segments(f) → [{ i, j, len, chord, len3d, dz, grade, arc }]       grade null for a zero-length segment
 *   setElevation(f, i, z) · setGrade(f, i, grade) (segment i: the far vertex moves; the rest stay) · raise(f, dz)
 *   evenGrade(f, i, j) → vertices between i and j at one grade from z_i to z_j (along the plan length)
 *   fromSurface(f, surface, which = all) → { f, missing: [i] }   vertices off the surface keep their elevation
 *   offsetFeature(f, dist, { dz, slope }) → { f | null, problem }   a stepped offset: the line moved `dist` to its right
 *       (negative = left; mitred corners, refused when the result folds over itself) and raised by dz, or by dist × slope
 *       (slope as a fraction, + = up away from the line)
 *   featureBreaklines(features, use) → [{ name, pts }]   the lines with that use, closed ones closed
 *   featureItem(f) → a grading item for project.gradeItems (closed design lines): { kind: 'feature', id, name, pts, z, cut,
 *       fill, daylight } — with daylight off its patch is the outline itself (region = the polygon, its edge a breakline)
 *   gradeLabel(g) → '+2.00%'
 *
 * In a profile view (0.5 WL.20), against an Alignment (alignment.js):
 *   alignmentCrossings(al, f) → [{ sta, z, i (segment), grade }]   every place the line crosses the centerline, exactly
 *       (each plan segment against each line / arc element of the alignment); z along the segment by plan length
 *   projectedRuns(al, f, within) → [[{ sta, z, off }]]   the line's stretches lying within `within` of the centerline (its
 *       vertices and crossings, by station), split where it leaves the band or runs past an end — what a profile shows of a
 *       curb or ditch running alongside
 *   featureProfile(al, features, { within }) → [{ id, name, use, crossings, runs }]   lines with neither are left out
 *
 * On screen only (0.5 WL.21: the grade and elevation overlay — never in the drawing, PDF, DXF or DWG):
 *   gradeOverlay(features, toScreen, { minSeg = 60, minGap = 34, skip }) → [{ kind 'grade', x, y, ang, text, down }
 *       | { kind 'elev', x, y, text }]   a grade label at each segment's middle (unsigned, `down` = the downhill direction
 *       in screen radians; level = no arrow), drawn upright along the segment, for segments at least `minSeg` px long; an
 *       elevation at each vertex at least `minGap` px from every elevation already placed (busy lines thin out when zoomed
 *       out); `skip` = an id left out (the selected line has its own labels)
 */

import { t } from './i18n.js';

export const USES = ['eg', 'design', 'off'];
export const MAX_VERTICES = 10000;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function FEATURE_DEFAULTS(units = 'ft') {
  return { use: 'eg', daylight: false, cut: 2, fill: 3, offset: units === 'm' ? 1 : 3 };
}

export function cleanFeature(o, units = 'ft') {
  if (!o || typeof o !== 'object' || !Array.isArray(o.pts)) return null;
  const pts = o.pts.slice(0, MAX_VERTICES).filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e9 && Math.abs(p.y) < 1e9).map((p) => {
    const q = { x: p.x, y: p.y, z: fin(p.z) && Math.abs(p.z) < 1e6 ? p.z : 0 };
    if (okBulge(p.b)) q.b = p.b;   // 0.6 WL.24: the segment starting here is an arc
    return q;
  });
  if (pts.length < 2) return null;
  const d = FEATURE_DEFAULTS(units);
  const closed = o.closed === true && (pts.length >= 3 || (pts.length === 2 && pts.every((p) => p.b)));   // two arcs make a circle
  // a bulge needs a segment with length after it (and none after the last vertex of an open line)
  pts.forEach((p, i) => { const q = pts[(i + 1) % pts.length]; if (p.b && ((!closed && i === pts.length - 1) || !(segLen(p, q) > 1e-12))) delete p.b; });
  return {
    id: /^f\d{1,9}$/.test(String(o.id)) ? String(o.id) : null,
    name: String(o.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 120) || t('toolbar.feature'),
    pts, closed,
    use: USES.includes(o.use) ? o.use : d.use,
    daylight: o.daylight === true,
    cut: fin(o.cut) && o.cut > 0 && o.cut < 1000 ? o.cut : d.cut,
    fill: fin(o.fill) && o.fill > 0 && o.fill < 1000 ? o.fill : d.fill,
  };
}

const segLen = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

// ---- arcs (0.6 WL.24) ----
/** A usable bulge, else 0: finite, not zero, under 100 (a sweep short of a full circle). */
export const okBulge = (b) => (fin(b) && b !== 0 && Math.abs(b) < 100 ? b : 0);
/** The plan arc from a to b with bulge `bulge` (+ = curving left): { cx, cy, r, a0, sweep (signed radians), L } or null. */
export function arcOf(a, b, bulge) {
  const bb = okBulge(bulge), dx = b.x - a.x, dy = b.y - a.y, c = Math.hypot(dx, dy);
  if (!bb || !(c > 1e-12)) return null;
  const k = (1 - bb * bb) / (4 * bb);   // centre = chord middle + k × (−dy, dx)
  const cx = (a.x + b.x) / 2 - k * dy, cy = (a.y + b.y) / 2 + k * dx;
  const r = (c * (1 + bb * bb)) / (4 * Math.abs(bb)), sweep = 4 * Math.atan(bb);
  return { cx, cy, r, a0: Math.atan2(a.y - cy, a.x - cx), sweep, L: r * Math.abs(sweep) };
}
/** The bulge of the arc from a through m to b (0 when the three are in a line). */
export function bulgeThrough(a, m, b) {
  const ax = m.x - a.x, ay = m.y - a.y, bx = b.x - m.x, by = b.y - m.y, cr = ax * by - ay * bx;
  if (Math.abs(cr) < 1e-12 * Math.max(1, Math.hypot(ax, ay) * Math.hypot(bx, by))) return 0;
  // the inscribed angle at m: the arc's sweep is 2(π − angle a-m-b), turning the way the three points turn
  const ang = Math.acos(Math.max(-1, Math.min(1, -(ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by)))));
  const sweep = 2 * (Math.PI - ang);
  return Math.sign(cr) * Math.tan(sweep / 4);
}
/** The bulge of the shorter arc of radius r from a to b turning `left` (true) or right; null when r < half the chord. */
export function bulgeForRadius(a, b, r, left = true) {
  const c = segLen(a, b);
  if (!(r > 0) || !(c > 1e-12) || r < c / 2 - 1e-9 * Math.max(1, c)) return null;
  const delta = 2 * Math.asin(Math.min(1, c / (2 * r)));
  return (left ? 1 : -1) * Math.tan(delta / 4);
}
/** Plan point and travel direction (radians) at fraction u (0…1 by length) of the segment from a to b. */
export function pointOnSeg(a, b, bulge, u) {
  const A = arcOf(a, b, bulge);
  if (!A) return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u, dir: Math.atan2(b.y - a.y, b.x - a.x) };
  const th = A.a0 + A.sweep * u;
  return { x: A.cx + A.r * Math.cos(th), y: A.cy + A.r * Math.sin(th), dir: th + (A.sweep > 0 ? Math.PI / 2 : -Math.PI / 2) };
}
/** How many straight pieces draw an arc within `tol` (the sagitta), at least one per `maxDeg` degrees, at most 720. */
export function arcPieces(A, tol = 0.01, maxDeg = 5) {
  if (!A) return 1;
  const byTol = A.r > tol ? 2 * Math.acos(1 - tol / A.r) : Math.PI;
  const step = Math.min(byTol, (maxDeg * Math.PI) / 180);
  return Math.max(1, Math.min(720, Math.ceil(Math.abs(A.sweep) / step - 1e-9)));
}
export const hasArcs = (f) => !!f?.pts?.some((p, i) => okBulge(p.b) && (f.closed || i < f.pts.length - 1));
/** The line as straight pieces: [{x, y, z, v}] (v = the vertex index at a real vertex, else −1); arcs in pieces within
 *  `tol`, z along each arc by its length (a grade is constant along a segment). A closed line ends back at its start. */
export function flatten(f, { tol = 0.01, maxDeg = 5 } = {}) {
  const P = f.pts, n = P.length, m = f.closed ? n : n - 1, out = [];
  if (!n) return out;
  out.push({ x: P[0].x, y: P[0].y, z: P[0].z, v: 0 });
  for (let i = 0; i < m; i++) {
    const a = P[i], j = (i + 1) % n, b = P[j], A = arcOf(a, b, a.b);
    if (A) {
      const k = arcPieces(A, tol, maxDeg);
      for (let s = 1; s < k; s++) {
        const th = A.a0 + (A.sweep * s) / k;
        out.push({ x: A.cx + A.r * Math.cos(th), y: A.cy + A.r * Math.sin(th), z: a.z + ((b.z - a.z) * s) / k, v: -1 });
      }
    }
    out.push({ x: b.x, y: b.y, z: b.z, v: j });
  }
  return out;
}

export function stations(f) {
  const out = [0];
  for (const s of segments(f)) out.push(out[out.length - 1] + s.len);
  return out;
}
/** [{ i, j, len (plan length, along the arc), chord, len3d, dz, grade, arc }]   arc: { cx, cy, r, a0, sweep, L } | null. */
export function segments(f) {
  const n = f.pts.length, m = f.closed ? n : n - 1, out = [];
  for (let i = 0; i < m; i++) {
    const j = (i + 1) % n, a = f.pts[i], chord = segLen(a, f.pts[j]), arc = arcOf(a, f.pts[j], a.b), len = arc ? arc.L : chord, dz = f.pts[j].z - a.z;
    out.push({ i, j, len, chord, len3d: Math.hypot(len, dz), dz, grade: len > 1e-12 ? dz / len : null, arc });
  }
  return out;
}
/** Make segment i an arc of radius r turning left or right (r null / 0 = straight again). */
export function setArc(f, i, r, left = true) {
  const n = f.pts.length, j = (i + 1) % n;
  if (!f.pts[i] || (!f.closed && i >= n - 1)) return f;
  let b = 0;
  if (r) { b = bulgeForRadius(f.pts[i], f.pts[j], r, left); if (b === null) return f; }
  return withPts(f, f.pts.map((p, k) => (k !== i ? p : b ? { ...p, b } : (({ b: _, ...q }) => q)(p))));
}
/** The radius words for segment i: '' when straight, else '50.00 L' / '50.00 R'. */
export function arcText(f, i, digits = 2) {
  const s = segments(f)[i];
  return s?.arc ? s.arc.r.toFixed(digits) + ' ' + (s.arc.sweep > 0 ? 'L' : 'R') : '';
}
/** '50 L', '50R', '-50' (right), '50' (left unless `left` says otherwise), '' (straight) → { r, left } | null. */
export function parseArc(text, left = true) {
  const s = String(text ?? '').trim().toUpperCase();
  if (!s || s === '0') return { r: 0, left };
  const m = /^([+-]?\d+(?:\.\d*)?|[+-]?\.\d+)\s*([LR])?$/.exec(s);
  if (!m) return null;
  const v = Number(m[1]);
  if (!fin(v) || v === 0) return v === 0 ? { r: 0, left } : null;
  return { r: Math.abs(v), left: m[2] ? m[2] === 'L' : v < 0 ? false : left };
}

const withPts = (f, pts) => ({ ...f, pts });
export function setElevation(f, i, z) {
  if (!fin(z) || !f.pts[i]) return f;
  return withPts(f, f.pts.map((p, k) => (k === i ? { ...p, z } : p)));
}
export function setGrade(f, i, grade) {
  const s = segments(f)[i];
  if (!s || !fin(grade) || !(s.len > 1e-12)) return f;
  return setElevation(f, s.j, f.pts[i].z + grade * s.len);
}
export function raise(f, dz) { return fin(dz) ? withPts(f, f.pts.map((p) => ({ ...p, z: p.z + dz }))) : f; }

export function evenGrade(f, i, j) {
  const n = f.pts.length;
  if (!(i >= 0 && j < n && j > i + 1)) return f;
  const st = stations(f), L = st[j] - st[i];
  if (!(L > 1e-12)) return f;
  const z0 = f.pts[i].z, z1 = f.pts[j].z;
  return withPts(f, f.pts.map((p, k) => (k > i && k < j ? { ...p, z: z0 + ((z1 - z0) * (st[k] - st[i])) / L } : p)));
}

export function fromSurface(f, surface, which = null) {
  const missing = [];
  const pts = f.pts.map((p, k) => {
    if (which && !which.includes(k)) return p;
    const z = surface?.elevationAt(p.x, p.y, 1e-6);
    if (z === null || z === undefined) { missing.push(k); return p; }
    return { ...p, z };
  });
  return { f: withPts(f, pts), missing };
}

/** Plan offset to the right of the direction of travel (negative = left), mitred; z + dz (or + |dist| × slope). */
export function offsetFeature(f, dist, { dz = null, slope = null } = {}) {
  if (!fin(dist) || dist === 0) return { f: null, problem: t('fl.offset.zero') };
  const raiseBy = fin(dz) ? dz : fin(slope) ? Math.abs(dist) * slope : 0;
  const P = f.pts, n = P.length;
  const right = (dir) => ({ x: Math.sin(dir), y: -Math.cos(dir) });   // right of the direction of travel
  // each segment's right-hand normal where it starts (s) and ends (e): the same for a straight one, radial on an arc (0.6 WL.24)
  const norm = (a, b) => {
    if (!(segLen(a, b) > 1e-12)) return null;
    const p0 = pointOnSeg(a, b, a.b, 0), p1 = pointOnSeg(a, b, a.b, 1);
    return { s: right(p0.dir), e: right(p1.dir) };
  };
  const segN = [];
  const m = f.closed ? n : n - 1;
  for (let i = 0; i < m; i++) segN.push(norm(P[i], P[(i + 1) % n]));
  if (segN.some((v) => !v)) return { f: null, problem: t('fl.offset.repeat') };
  // an arc curving toward the offset side shrinks by the distance: at zero or below it would turn inside out
  for (let i = 0; i < m; i++) { const A = arcOf(P[i], P[(i + 1) % n], P[i].b); if (A && A.r + Math.sign(A.sweep) * dist <= 1e-9 * Math.max(1, A.r)) return { f: null, problem: t('fl.offset.fold') }; }
  const out = [];
  for (let i = 0; i < n; i++) {
    const nIn = (f.closed ? segN[(i - 1 + m) % m] : segN[i - 1])?.e, nOut = (f.closed ? segN[i % m] : segN[i])?.s;
    let ox, oy;
    if (!nIn) { ox = nOut.x * dist; oy = nOut.y * dist; }
    else if (!nOut) { ox = nIn.x * dist; oy = nIn.y * dist; }
    else {
      const bx = nIn.x + nOut.x, by = nIn.y + nOut.y, c = (bx * nOut.x + by * nOut.y) / Math.hypot(bx, by);
      if (Math.hypot(bx, by) < 1e-9 || c < 0.1) return { f: null, problem: t('fl.offset.sharp') };   // a hairpin: the mitre would run away
      const L = Math.hypot(bx, by);
      ox = (bx / L) * (dist / c); oy = (by / L) * (dist / c);
    }
    const q = { x: P[i].x + ox, y: P[i].y + oy, z: P[i].z + raiseBy };
    if (okBulge(P[i].b)) q.b = P[i].b;   // an arc stays an arc with the same sweep (concentric where its ends are tangent)
    out.push(q);
  }
  // the offset must keep every segment's direction (a segment that turns round = the offset folded over a tight bend)
  for (let i = 0; i < m; i++) {
    const a = P[i], b = P[(i + 1) % n], c = out[i], d = out[(i + 1) % n];
    if ((b.x - a.x) * (d.x - c.x) + (b.y - a.y) * (d.y - c.y) <= 0) return { f: null, problem: t('fl.offset.fold') };
  }
  return { f: { ...f, id: null, pts: out }, problem: null };
}

export function featureBreaklines(features, use) {
  // arcs go in as short pieces within 0.01 of the true curve, z along the arc (0.6 WL.24)
  return (features || []).filter((f) => f.use === use && f.pts.length >= 2).map((f) => ({ name: f.name, pts: flatten(f).map((p) => ({ x: p.x, y: p.y, z: p.z })), feature: f.id }));
}

/** A closed design feature line as a grading item (grading.js gradedSurface): with daylight a sloped pad, without it the
 *  outline itself is the region and its edge the breakline. Open lines and other uses → null. */
export function featureItem(f) {
  if (f.use !== 'design' || !f.closed || f.pts.length < (hasArcs(f) ? 2 : 3)) return null;
  const pts = (hasArcs(f) ? flatten(f).slice(0, -1) : f.pts).map((p) => ({ x: p.x, y: p.y, z: p.z }));
  const z = pts.reduce((s, p) => s + p.z, 0) / pts.length;
  if (f.daylight) return { id: f.id, kind: 'feature', name: f.name, pts, z, cut: f.cut, fill: f.fill };
  return {
    id: f.id, kind: 'feature', name: f.name,
    patch: () => ({ problems: [], region: pts, points: [], breaklines: [{ name: f.name, pts: [...pts, pts[0]] }], info: { poly: pts } }),
  };
}

// ---- feature lines in DXF / DWG (0.6 WL.24) ----
// A DXF/DWG 3D polyline cannot hold an arc, so a feature line is written as its pieces (within 0.01 of every arc, z along
// the arc) and CivilCraft's own extended data (APPID CADCRAFT) says which runs of pieces were arcs:
//   [1000 'CCFL3D 1'], [1000 name], [1000 '<use>|<closed 0/1>'], then per arc [1040 k], [1040 m], [1040 bulge]
//   k = the arc's first vertex in the polyline, m = the pieces' inner vertices that follow it
// Any other program sees an ordinary 3D polyline; CivilCraft reads the feature line back with its arcs.
export const CAD_TAG = 'CCFL3D 1';
export const CAD_MAX_ARCS = 500;   // extended data is at most 16 KB per object: past this many arcs the rest stay pieces
/** → { pts: [{x,y,z}], closed, xdata, arcsLeft } (a closed line's last piece ends at the first vertex, not repeated). */
export function cadPolyline(f) {
  const flat = flatten(f), pts = flat.map(({ x, y, z }) => ({ x, y, z }));
  if (f.closed && pts.length > 1) pts.pop();
  const items = [[1000, CAD_TAG], [1000, String(f.name || '').slice(0, 120)], [1000, (USES.includes(f.use) ? f.use : 'eg') + '|' + (f.closed ? 1 : 0)]];
  let arcs = 0, left = 0;
  flat.forEach((p, k) => {
    if (p.v < 0 || !okBulge(f.pts[p.v].b) || k === flat.length - 1) return;
    let m = 0;
    while (flat[k + 1 + m] && flat[k + 1 + m].v < 0) m++;
    if (arcs >= CAD_MAX_ARCS) { left++; return; }
    items.push([1040, k], [1040, m], [1040, f.pts[p.v].b]);
    arcs++;
  });
  return { pts, closed: !!f.closed, xdata: { CADCRAFT: items }, arcsLeft: left };
}
/** A 3D polyline's vertices + extended data → a feature line (untrusted: checked as a project file is), or null when the
 *  polyline was not written by CivilCraft as a feature line. Vertices: [{x, y, z}] in project units. */
export function featureFromCad(vertices, closed, xdata, units = 'ft') {
  const it = xdata?.CADCRAFT;
  if (!Array.isArray(it) || it[0]?.[0] !== 1000 || it[0][1] !== CAD_TAG || !Array.isArray(vertices) || vertices.length < 2) return null;
  const name = it[1]?.[0] === 1000 ? String(it[1][1]) : '';
  const [use, cl] = it[2]?.[0] === 1000 ? String(it[2][1]).split('|') : [];
  const arcs = new Map();
  for (let q = 3; q + 2 < it.length; q += 3) {
    const [k, m, b] = [it[q], it[q + 1], it[q + 2]].map((x) => (x?.[0] === 1040 ? Number(x[1]) : NaN));
    if (Number.isInteger(k) && Number.isInteger(m) && k >= 0 && m >= 0 && m < 10000 && okBulge(b)) arcs.set(k, { m, b });
  }
  const pts = [];
  for (let k = 0; k < vertices.length; k++) {
    const v = vertices[k], p = { x: v.x, y: v.y, z: v.z };
    const a = arcs.get(k);
    if (a && k + a.m + 1 <= vertices.length) { p.b = a.b; pts.push(p); k += a.m; continue; }   // skip the arc's inner pieces
    pts.push(p);
  }
  return cleanFeature({ name, pts, closed: cl === '1' || (cl === undefined && !!closed), use }, units);
}

export const gradeLabel = (g) => (fin(g) ? (g >= 0 ? '+' : '') + (g * 100).toFixed(2) + '%' : '—');

// ---- feature lines in a profile view (0.5 WL.20) ----
const TAU = Math.PI * 2;
/** Where plan segment a→b crosses one alignment element: [{ t (0…1 along the segment), sta }]. */
function crossElement(e, a, b) {
  const out = [], dx = b.x - a.x, dy = b.y - a.y;
  if (e.type === 'line') {
    const ex = e.p1.x - e.p0.x, ey = e.p1.y - e.p0.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-15) return out;   // parallel (or along it: no single crossing)
    const wx = e.p0.x - a.x, wy = e.p0.y - a.y;
    const t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
    if (t >= -1e-12 && t <= 1 + 1e-12 && u >= -1e-12 && u <= 1 + 1e-12) out.push({ t: Math.min(1, Math.max(0, t)), sta: e.sta + Math.min(1, Math.max(0, u)) * e.len });
    return out;
  }
  // arc: |a + t·d − c| = r
  const fx = a.x - e.c.x, fy = a.y - e.c.y, A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), C = fx * fx + fy * fy - e.r * e.r;
  const disc = B * B - 4 * A * C;
  if (A < 1e-24 || disc < 0) return out;
  const sq = Math.sqrt(disc);
  for (const t of disc === 0 ? [-B / (2 * A)] : [(-B - sq) / (2 * A), (-B + sq) / (2 * A)]) {
    if (t < -1e-12 || t > 1 + 1e-12) continue;
    const x = a.x + t * dx, y = a.y + t * dy;
    let sw = ((Math.atan2(y - e.c.y, x - e.c.x) - e.a0) * (e.ccw ? 1 : -1)) % TAU;
    if (sw < 0) sw += TAU;
    if (sw > e.delta + 1e-12) continue;
    out.push({ t: Math.min(1, Math.max(0, t)), sta: e.sta + Math.min(sw, e.delta) * e.r });
  }
  return out;
}

/** How far round an arc (0…1 of its sweep) the angle th lies, or null when it is off the arc. */
function arcFrac(A, th) {
  let sw = ((th - A.a0) * Math.sign(A.sweep)) % TAU;
  if (sw < 0) sw += TAU;
  const S = Math.abs(A.sweep);
  if (sw > S + 1e-12) { if (TAU - sw < 1e-12) sw = 0; else return null; }
  return Math.min(1, sw / S);
}
/** Where a feature line's ARC segment A crosses one alignment element: [{ t (0…1 along the arc), sta }] (0.6 WL.24). */
function crossArcElement(e, A) {
  const out = [];
  if (e.type === 'line') {   // |p0 + w·d − C| = r
    const dx = e.p1.x - e.p0.x, dy = e.p1.y - e.p0.y, fx = e.p0.x - A.cx, fy = e.p0.y - A.cy;
    const a = dx * dx + dy * dy, b = 2 * (fx * dx + fy * dy), c = fx * fx + fy * fy - A.r * A.r, disc = b * b - 4 * a * c;
    if (a < 1e-24 || disc < 0) return out;
    const sq = Math.sqrt(disc);
    for (const w of disc === 0 ? [-b / (2 * a)] : [(-b - sq) / (2 * a), (-b + sq) / (2 * a)]) {
      if (w < -1e-12 || w > 1 + 1e-12) continue;
      const x = e.p0.x + w * dx, y = e.p0.y + w * dy, u = arcFrac(A, Math.atan2(y - A.cy, x - A.cx));
      if (u !== null) out.push({ t: u, sta: e.sta + Math.min(1, Math.max(0, w)) * e.len });
    }
    return out;
  }
  // arc × arc: the two circles' crossings, kept where both arcs pass
  const dx = e.c.x - A.cx, dy = e.c.y - A.cy, d = Math.hypot(dx, dy);
  if (d < 1e-12 || d > A.r + e.r + 1e-12 || d < Math.abs(A.r - e.r) - 1e-12) return out;
  const along = (A.r * A.r - e.r * e.r + d * d) / (2 * d), h = Math.sqrt(Math.max(0, A.r * A.r - along * along));
  const mx = A.cx + (along * dx) / d, my = A.cy + (along * dy) / d;
  for (const s of h < 1e-12 ? [0] : [-1, 1]) {
    const x = mx - (s * h * dy) / d, y = my + (s * h * dx) / d, u = arcFrac(A, Math.atan2(y - A.cy, x - A.cx));
    if (u === null) continue;
    let sw = ((Math.atan2(y - e.c.y, x - e.c.x) - e.a0) * (e.ccw ? 1 : -1)) % TAU;
    if (sw < 0) sw += TAU;
    if (sw > e.delta + 1e-12) { if (TAU - sw < 1e-12) sw = 0; else continue; }
    out.push({ t: u, sta: e.sta + Math.min(sw, e.delta) * e.r });
  }
  return out;
}

/** Every crossing of a feature line with an alignment's centerline (see the header). */
export function alignmentCrossings(al, f) {
  if (!al?.elements?.length || !f?.pts?.length) return [];
  const out = [];
  for (const sg of segments(f)) {
    if (!(sg.len > 1e-12)) continue;
    const a = f.pts[sg.i], b = f.pts[sg.j];
    for (const e of al.elements) for (const c of sg.arc ? crossArcElement(e, sg.arc) : crossElement(e, a, b)) out.push({ sta: c.sta, z: a.z + c.t * sg.dz, i: sg.i, grade: sg.grade });
  }
  out.sort((p, q) => p.sta - q.sta);
  // a crossing exactly at a shared vertex / element joint is found twice
  return out.filter((c, k) => !k || Math.abs(c.sta - out[k - 1].sta) > 1e-6 || Math.abs(c.z - out[k - 1].z) > 1e-6);
}

/** The line's stretches within `within` of the centerline, as profile polylines by station (see the header). */
export function projectedRuns(al, f, within) {
  if (!(within > 0) || !al?.elements?.length || !f?.pts?.length) return [];
  // 0.6 WL.24: a line with arcs is followed through its pieces (within 0.01 of the curve)
  if (hasArcs(f)) return projectedRuns(al, { ...f, pts: flatten(f).map(({ x, y, z }) => ({ x, y, z })), closed: false }, within);
  const n = f.pts.length, idx = [...Array(n).keys()];
  if (f.closed) idx.push(0);
  const cross = alignmentCrossings(al, f);
  const runs = [];
  let run = [];
  // a stretch with no length along the alignment (a line straight across it) is only its crossing: no run
  const flush = () => { if (run.length >= 2 && Math.max(...run.map((q) => q.sta)) - Math.min(...run.map((q) => q.sta)) > 1e-6) runs.push(run); run = []; };
  for (let k = 0; k < idx.length; k++) {
    const p = f.pts[idx[k]], so = al.stationOffset(p.x, p.y);
    const inside = so && !so.outside && Math.abs(so.off) <= within + 1e-9;
    if (!inside) { flush(); continue; }
    if (k > 0 && run.length) for (const c of cross) if (c.i === idx[k - 1]) run.push({ sta: c.sta, z: c.z, off: 0 });
    run.push({ sta: so.sta, z: p.z, off: so.off });
  }
  flush();
  // a run is read along the alignment: keep its points in station order when the line runs backwards
  return runs.map((r) => (r[r.length - 1].sta < r[0].sta ? r.reverse() : r));
}

/** Every feature line's crossings and nearby runs against one alignment (see the header). */
export function featureProfile(al, features, { within = 0 } = {}) {
  const out = [];
  for (const f of features || []) {
    const crossings = alignmentCrossings(al, f), runs = projectedRuns(al, f, within);
    if (crossings.length || runs.length) out.push({ id: f.id, name: f.name, use: f.use, crossings, runs });
  }
  return out;
}

// ---- the grade and elevation overlay (0.5 WL.21) ----
/** Screen labels for every feature line's grades and elevations (see the header). */
export function gradeOverlay(features, toScreen, { minSeg = 60, minGap = 34, skip = null } = {}) {
  const out = [], placed = [];
  for (const f of features || []) {
    if (!f?.pts?.length || f.id === skip) continue;
    const S = f.pts.map((p) => toScreen(p.x, p.y));
    for (const sg of segments(f)) {
      const a = S[sg.i], b = S[sg.j];
      let len = Math.hypot(b.x - a.x, b.y - a.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ang = Math.atan2(b.y - a.y, b.x - a.x);
      if (sg.arc) {   // 0.6 WL.24: at the arc's middle, along its tangent there; its length on screen from the chord pieces
        const P0 = f.pts[sg.i], P1 = f.pts[sg.j], mid = pointOnSeg(P0, P1, P0.b, 0.5), m = toScreen(mid.x, mid.y);
        const ahead = toScreen(mid.x + Math.cos(mid.dir), mid.y + Math.sin(mid.dir));
        len = 0; let q = a;
        for (let k = 1; k <= 8; k++) { const p = pointOnSeg(P0, P1, P0.b, k / 8), r = toScreen(p.x, p.y); len += Math.hypot(r.x - q.x, r.y - q.y); q = r; }
        mx = m.x; my = m.y; ang = Math.atan2(ahead.y - m.y, ahead.x - m.x);
      }
      if (len < minSeg || sg.grade === null) continue;
      const along = ang;
      if (Math.abs(ang) > Math.PI / 2) ang += ang > 0 ? -Math.PI : Math.PI;   // upright
      const level = Math.abs(sg.grade) < 5e-5;
      out.push({ kind: 'grade', x: mx, y: my, ang, text: (Math.abs(sg.grade) * 100).toFixed(2) + '%', down: level ? null : (sg.grade < 0 ? along : along + Math.PI) });
    }
    f.pts.forEach((p, i) => {
      const q = S[i];
      if (placed.some((o) => Math.hypot(o.x - q.x, o.y - q.y) < minGap)) return;
      placed.push(q);
      out.push({ kind: 'elev', x: q.x, y: q.y, text: (Math.round(p.z * 100) / 100).toFixed(2) });
    });
  }
  return out;
}
