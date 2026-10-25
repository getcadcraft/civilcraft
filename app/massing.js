/* SPDX-License-Identifier: Apache-2.0 */
/**
 * massing.js — building masses on a site (0.7 LC.1 M1/M2). A mass is a footprint, a number of floors and a floor height: the
 * early-design question "how much building fits here, and what does it do to the ground". No DOM, no three.js; the Node test
 * drives it (bin/test-civilcraft-massing.mjs).
 *
 * mass = { id 'm…', name, pts: [{x, y}] (the footprint, straight edges, any winding), floors (1–200), floorHeight (project
 *          units), base: 'stepped' | 'podium' | 'cut' (what the mass does on sloping ground, below), ground: 'eg' | 'fg' (the
 *          ground it sits on: existing, or proposed where the grading made one), use (text), parcel: parcel id | null }
 *
 * Base on sloping ground (one setting on the mass; z0 is the level of the ground floor):
 *   podium   z0 = the highest ground under the footprint; a solid base fills the low side up to the ground floor
 *   cut      z0 = the lowest ground under the footprint; the high side is cut away into the hill
 *   stepped  z0 = the average ground under the footprint; the low side is filled up to it and the high side cut, so the two
 *            volumes come close to balancing (the ground floor steps neither up nor down the slope)
 * The ground under the footprint is sampled on a grid inside it plus its corners; a spot off the surface counts as missing.
 *
 *   cleanMass(o, units) → mass | null           (untrusted: the project file)
 *   massArea(m) · massGfa(m) · massHeight(m)    footprint area, gross floor area (area × floors), height (floors × floorHeight)
 *   groundUnder(m, elevAt, { cells }) → { min, max, mean, n, missing, cellArea, samples:[{x,y,z,dA}] } | null (no ground at all)
 *   baseLevel(m, ground) → z0                   by the mass's base setting
 *   baseVolumes(m, ground, z0) → { fill, cut }   cubic project units between the ground and z0 under the footprint
 *   measureMass(m, elevAt) → { ground, z0, zBottom, fill, cut, levels }   all of the above for one mass on one ground
 *   levels(m, z0) → [{ n, name, z (floor), top, h }]
 *   setHeight(m, H) → floors      push/pull: the floor count nearest to the height H (≥ 1), floor height kept
 *   triangulate(pts) → [i, j, k, …]   ear clipping (concave footprints too); indices into pts
 *   massMesh(m, z0, zBottom) → { positions, normals, indices }   walls from zBottom to the roof, the roof; Float32/Uint32, absolute project coordinates
 *   planItems(m, { units, unitPerMm }) → scene items on A-MASS (outline, name, floors and GFA)
 */

import { pointInPoly } from './tin.js';
import { grouped, unitOf, fixed } from './units.js';
import { t } from './i18n.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const BASES = ['stepped', 'podium', 'cut'];
export const GROUNDS = ['eg', 'fg'];
export const MAX_FLOORS = 200;
export const MAX_MASSES = 500;
export const FLOOR_HEIGHT = { ft: 12, m: 3.6 };
const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

export function cleanMass(o, units = 'ft') {
  if (!o || typeof o !== 'object' || !Array.isArray(o.pts)) return null;
  const pts = o.pts.filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e9 && Math.abs(p.y) < 1e9).slice(0, 1000).map((p) => ({ x: p.x, y: p.y }));
  if (pts.length < 3 || Math.abs(signedArea(pts)) < 1e-9) return null;
  const fh = fin(o.floorHeight) && o.floorHeight > 0 && o.floorHeight < 1000 ? o.floorHeight : FLOOR_HEIGHT[units] || 12;
  const floors = fin(o.floors) ? Math.max(1, Math.min(MAX_FLOORS, Math.round(o.floors))) : 3;
  return {
    id: /^m\d{1,9}$/.test(String(o.id)) ? String(o.id) : null, name: clean(o.name, 120) || 'Mass', pts, floors, floorHeight: fh,
    base: BASES.includes(o.base) ? o.base : 'stepped', ground: GROUNDS.includes(o.ground) ? o.ground : 'eg',
    use: clean(o.use, 60), parcel: /^r\d{1,9}$/.test(String(o.parcel)) ? String(o.parcel) : null,
  };
}

export function signedArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; }
export const massArea = (m) => Math.abs(signedArea(m.pts));
export const massGfa = (m) => massArea(m) * m.floors;
export const massHeight = (m) => m.floors * m.floorHeight;
export function centroid(pts) {
  const A = signedArea(pts);
  if (Math.abs(A) < 1e-12) return { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length };
  let cx = 0, cy = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], k = p.x * q.y - q.x * p.y; cx += (p.x + q.x) * k; cy += (p.y + q.y) * k; }
  return { x: cx / (6 * A), y: cy / (6 * A) };
}

// ------------------------------------------------------------------ the ground under a mass
/** Ground heights under the footprint: a grid of `cells` × `cells` over its bounds (cells inside it) plus its corners.
 *  elevAt(x, y) → z | null. Each sample carries the area it stands for (dA), so volumes are sums. */
export function groundUnder(m, elevAt, { cells = 40 } = {}) {
  const P = m.pts;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of P) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const nx = cells, ny = cells, dx = (x1 - x0) / nx, dy = (y1 - y0) / ny;
  const samples = [];
  let missing = 0;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = x0 + (i + 0.5) * dx, y = y0 + (j + 0.5) * dy;
    if (!pointInPoly(x, y, P)) continue;
    const z = elevAt(x, y);
    if (fin(z)) samples.push({ x, y, z }); else missing++;
  }
  // the cells cover the footprint to within a cell's width; scale their area to the exact footprint area
  const A = massArea(m), n = samples.length + missing;
  const cellArea = n ? A / n : 0;
  for (const s of samples) s.dA = cellArea;
  let min = Infinity, max = -Infinity, sum = 0, w = 0;
  const corners = P.map((p) => ({ x: p.x, y: p.y, z: elevAt(p.x, p.y) })).filter((c) => fin(c.z));
  for (const s of samples) { min = Math.min(min, s.z); max = Math.max(max, s.z); sum += s.z; w++; }
  for (const c of corners) { min = Math.min(min, c.z); max = Math.max(max, c.z); }
  if (!w) return corners.length ? { min, max, mean: corners.reduce((s, c) => s + c.z, 0) / corners.length, n: corners.length, missing: P.length - corners.length, cellArea, samples: [] } : null;
  return { min, max, mean: sum / w, n: w, missing, cellArea, samples };
}

export function baseLevel(m, ground) {
  if (!ground) return 0;
  return m.base === 'podium' ? ground.max : m.base === 'cut' ? ground.min : ground.mean;
}

export function baseVolumes(m, ground, z0) {
  let fill = 0, cut = 0;
  for (const s of ground?.samples || []) { if (s.z < z0) fill += (z0 - s.z) * s.dA; else cut += (s.z - z0) * s.dA; }
  return { fill, cut };
}

/** One mass on one ground (elevAt(x, y) → z | null): its ground, ground floor level z0, cut and fill and levels. */
export function measureMass(m, elevAt) {
  const g = elevAt ? groundUnder(m, elevAt) : null;
  const z0 = g ? baseLevel(m, g) : 0;
  const vol = g ? baseVolumes(m, g, z0) : { fill: 0, cut: 0 };
  return { ground: g, z0, zBottom: g ? Math.min(g.min, z0) : z0, ...vol, levels: levels(m, z0) };
}

export function levels(m, z0) {
  return Array.from({ length: m.floors }, (_, i) => ({ n: i + 1, name: t('ms.level', { n: i + 1 }), z: z0 + i * m.floorHeight, top: z0 + (i + 1) * m.floorHeight, h: m.floorHeight }));
}

/** Push/pull: the floor count whose height is nearest to H (at least one floor). */
export function setHeight(m, H) { return Math.max(1, Math.min(MAX_FLOORS, Math.round(H / m.floorHeight))); }

// ------------------------------------------------------------------ geometry
/** Ear clipping of a simple polygon, any winding; triangles as indices into pts, counter-clockwise. */
export function triangulate(pts) {
  const n = pts.length;
  const idx = pts.map((_, i) => i);
  if (signedArea(pts) < 0) idx.reverse();
  const out = [];
  const cross = (a, b, c) => (pts[b].x - pts[a].x) * (pts[c].y - pts[a].y) - (pts[b].y - pts[a].y) * (pts[c].x - pts[a].x);
  const inTri = (p, a, b, c) => cross(a, b, p) >= -1e-12 && cross(b, c, p) >= -1e-12 && cross(c, a, p) >= -1e-12;
  let guard = 0;
  while (idx.length > 3 && guard++ < n * n) {
    let clipped = false;
    for (let k = 0; k < idx.length; k++) {
      const a = idx[(k + idx.length - 1) % idx.length], b = idx[k], c = idx[(k + 1) % idx.length];
      if (cross(a, b, c) <= 1e-12) continue;   // reflex or flat
      let ear = true;
      for (const p of idx) { if (p === a || p === b || p === c) continue; if (inTri(p, a, b, c)) { ear = false; break; } }
      if (!ear) continue;
      out.push(a, b, c); idx.splice(k, 1); clipped = true; break;
    }
    if (!clipped) { // a degenerate sliver: drop the flattest corner so the loop always ends
      let best = 0, bv = Infinity;
      for (let k = 0; k < idx.length; k++) { const v = Math.abs(cross(idx[(k + idx.length - 1) % idx.length], idx[k], idx[(k + 1) % idx.length])); if (v < bv) { bv = v; best = k; } }
      idx.splice(best, 1);
    }
  }
  if (idx.length === 3 && cross(idx[0], idx[1], idx[2]) > 1e-12) out.push(idx[0], idx[1], idx[2]);
  return out;
}

/** The mass as a closed prism: walls from zBottom up to the roof (z0 + height) and the roof. Absolute project coordinates. */
export function massMesh(m, z0, zBottom = z0) {
  const P = signedArea(m.pts) < 0 ? m.pts.slice().reverse() : m.pts, n = P.length, top = z0 + massHeight(m), bot = Math.min(zBottom, z0);
  const pos = [], nor = [], ind = [];
  for (let i = 0; i < n; i++) {
    const a = P[i], b = P[(i + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y);
    if (L < 1e-12) continue;
    const nx = (b.y - a.y) / L, ny = -(b.x - a.x) / L, k = pos.length / 3;   // outward for a counter-clockwise outline
    pos.push(a.x, a.y, bot, b.x, b.y, bot, b.x, b.y, top, a.x, a.y, top);
    for (let q = 0; q < 4; q++) nor.push(nx, ny, 0);
    ind.push(k, k + 1, k + 2, k, k + 2, k + 3);
  }
  const k0 = pos.length / 3;
  for (const p of P) { pos.push(p.x, p.y, top); nor.push(0, 0, 1); }
  for (const i of triangulate(P)) ind.push(k0 + i);
  return { positions: new Float32Array(pos), normals: new Float32Array(nor), indices: new Uint32Array(ind) };
}

// ------------------------------------------------------------------ the plan
export function planItems(m, { units = 'ft', unitPerMm = 1 } = {}) {
  const c = centroid(m.pts), U = unitOf(units);
  return [
    { layer: 'A-MASS', kind: 'poly', pts: m.pts, closed: true },
    { layer: 'A-MASS-TEXT', kind: 'text', x: c.x, y: c.y + 1.6 * unitPerMm, rot: 0, mm: 2.2, align: 'center', middle: true, text: m.name, mask: true },
    { layer: 'A-MASS-TEXT', kind: 'text', x: c.x, y: c.y - 1.6 * unitPerMm, rot: 0, mm: 1.8, align: 'center', middle: true,
      text: t('ms.plan.label', { floors: m.floors, gfa: grouped(massGfa(m), 0), area: U.area }), mask: true },
  ];
}

export const gfaText = (m, units) => grouped(massGfa(m), 0) + ' ' + unitOf(units).area;
export const heightText = (m, units) => fixed(massHeight(m), 2) + ' ' + (units === 'm' ? 'm' : 'ft');
