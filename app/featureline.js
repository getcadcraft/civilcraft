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
