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
 *   USES · FEATURE_DEFAULTS(units) · cleanFeature(obj, units) → feature | null (untrusted: the project file)
 *   stations(f) → [0, …] plan distance to each vertex (and the closing segment's end for a closed line: length n + 1)
 *   segments(f) → [{ i, j, len, dz, grade }]       grade null for a zero-length segment
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
  const pts = o.pts.slice(0, MAX_VERTICES).filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e9 && Math.abs(p.y) < 1e9).map((p) => ({ x: p.x, y: p.y, z: fin(p.z) && Math.abs(p.z) < 1e6 ? p.z : 0 }));
  if (pts.length < 2) return null;
  const d = FEATURE_DEFAULTS(units);
  const closed = o.closed === true && pts.length >= 3;
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
export function stations(f) {
  const out = [0];
  const n = f.pts.length, m = f.closed ? n : n - 1;
  for (let i = 0; i < m; i++) out.push(out[i] + segLen(f.pts[i], f.pts[(i + 1) % n]));
  return out;
}
export function segments(f) {
  const n = f.pts.length, m = f.closed ? n : n - 1, out = [];
  for (let i = 0; i < m; i++) {
    const j = (i + 1) % n, len = segLen(f.pts[i], f.pts[j]), dz = f.pts[j].z - f.pts[i].z;
    out.push({ i, j, len, dz, grade: len > 1e-12 ? dz / len : null });
  }
  return out;
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
  const norm = (a, b) => { const L = segLen(a, b); return L > 1e-12 ? { x: (b.y - a.y) / L, y: -(b.x - a.x) / L } : null; };   // right of a→b
  const segN = [];
  const m = f.closed ? n : n - 1;
  for (let i = 0; i < m; i++) segN.push(norm(P[i], P[(i + 1) % n]));
  if (segN.some((v) => !v)) return { f: null, problem: t('fl.offset.repeat') };
  const out = [];
  for (let i = 0; i < n; i++) {
    const nIn = f.closed ? segN[(i - 1 + m) % m] : segN[i - 1], nOut = f.closed ? segN[i % m] : segN[i];
    let ox, oy;
    if (!nIn) { ox = nOut.x * dist; oy = nOut.y * dist; }
    else if (!nOut) { ox = nIn.x * dist; oy = nIn.y * dist; }
    else {
      const bx = nIn.x + nOut.x, by = nIn.y + nOut.y, c = (bx * nOut.x + by * nOut.y) / Math.hypot(bx, by);
      if (Math.hypot(bx, by) < 1e-9 || c < 0.1) return { f: null, problem: t('fl.offset.sharp') };   // a hairpin: the mitre would run away
      const L = Math.hypot(bx, by);
      ox = (bx / L) * (dist / c); oy = (by / L) * (dist / c);
    }
    out.push({ x: P[i].x + ox, y: P[i].y + oy, z: P[i].z + raiseBy });
  }
  // the offset must keep every segment's direction (a segment that turns round = the offset folded over a tight bend)
  for (let i = 0; i < m; i++) {
    const a = P[i], b = P[(i + 1) % n], c = out[i], d = out[(i + 1) % n];
    if ((b.x - a.x) * (d.x - c.x) + (b.y - a.y) * (d.y - c.y) <= 0) return { f: null, problem: t('fl.offset.fold') };
  }
  return { f: { ...f, id: null, pts: out }, problem: null };
}

export function featureBreaklines(features, use) {
  return (features || []).filter((f) => f.use === use && f.pts.length >= 2).map((f) => ({ name: f.name, pts: [...f.pts, ...(f.closed ? [f.pts[0]] : [])].map((p) => ({ x: p.x, y: p.y, z: p.z })), feature: f.id }));
}

/** A closed design feature line as a grading item (grading.js gradedSurface): with daylight a sloped pad, without it the
 *  outline itself is the region and its edge the breakline. Open lines and other uses → null. */
export function featureItem(f) {
  if (f.use !== 'design' || !f.closed || f.pts.length < 3) return null;
  const pts = f.pts.map((p) => ({ x: p.x, y: p.y, z: p.z }));
  const z = pts.reduce((s, p) => s + p.z, 0) / pts.length;
  if (f.daylight) return { id: f.id, kind: 'feature', name: f.name, pts, z, cut: f.cut, fill: f.fill };
  return {
    id: f.id, kind: 'feature', name: f.name,
    patch: () => ({ problems: [], region: pts, points: [], breaklines: [{ name: f.name, pts: [...pts, pts[0]] }], info: { poly: pts } }),
  };
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

/** Every crossing of a feature line with an alignment's centerline (see the header). */
export function alignmentCrossings(al, f) {
  if (!al?.elements?.length || !f?.pts?.length) return [];
  const out = [];
  for (const sg of segments(f)) {
    if (!(sg.len > 1e-12)) continue;
    const a = f.pts[sg.i], b = f.pts[sg.j];
    for (const e of al.elements) for (const c of crossElement(e, a, b)) out.push({ sta: c.sta, z: a.z + c.t * sg.dz, i: sg.i, grade: sg.grade });
  }
  out.sort((p, q) => p.sta - q.sta);
  // a crossing exactly at a shared vertex / element joint is found twice
  return out.filter((c, k) => !k || Math.abs(c.sta - out[k - 1].sta) > 1e-6 || Math.abs(c.z - out[k - 1].z) > 1e-6);
}

/** The line's stretches within `within` of the centerline, as profile polylines by station (see the header). */
export function projectedRuns(al, f, within) {
  if (!(within > 0) || !al?.elements?.length || !f?.pts?.length) return [];
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
      const a = S[sg.i], b = S[sg.j], len = Math.hypot(b.x - a.x, b.y - a.y);
      if (len < minSeg || sg.grade === null) continue;
      let ang = Math.atan2(b.y - a.y, b.x - a.x);
      const along = ang;
      if (Math.abs(ang) > Math.PI / 2) ang += ang > 0 ? -Math.PI : Math.PI;   // upright
      const level = Math.abs(sg.grade) < 5e-5;
      out.push({ kind: 'grade', x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, ang, text: (Math.abs(sg.grade) * 100).toFixed(2) + '%', down: level ? null : (sg.grade < 0 ? along : along + Math.PI) });
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
