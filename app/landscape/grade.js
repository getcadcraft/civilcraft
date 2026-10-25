/* SPDX-License-Identifier: Apache-2.0 */
/**
 * grade.js — the Landscape workspace's grading front end (0.7 LD.3, session `landscape`). No DOM. Built on CivilCraft's own
 * grading (grading.js daylightPad / castSlope / gradedSurface, the TIN): no second terrain engine. Each landscape grading
 * object becomes one more item in project.gradeItems(), so the proposed surface, the existing one (never changed), the
 * cut/fill volumes (masshaul.js, project.volumes()) and every export see it like a pad or a corridor.
 *
 * state.landscape.grading = [
 *   { id, kind: 'platform', name, pts: [{x,y}], z (null = the ground's mean under it), fall: null | { pct, dir (deg, the way
 *     water runs, 0 = east, counter-clockwise) }, cut, fill (side slopes H:V) }   a level or sloped platform, daylighted
 *   { id, kind: 'berm', name, pts, height, cut, fill }                            a mound: top at the ground's mean + height
 *   { id, kind: 'swale', name, pts (open line, the way water runs), depth, bottom (width), side (H:V), fall: null (follows
 *     the ground, `depth` below it) | pct (a steady fall from the start) }
 *   { id, kind: 'area', name, pts (closed), spots: [{ id, x, y, z }], contours: [{ id, z, pts }] }   free grading: inside
 *     the outline the ground is rebuilt from its edge (on the existing ground), the spot elevations and the edited contours
 * ]
 *
 *   cleanGrading(list, units) (untrusted) · gradeItems(ls, units) → items for gradedSurface (in drawing order)
 *   gradeDeps(ls) → a string that changes when any grading object does (project.gradeDeps)
 *   planeZ(pts, z0, fall) → corner elevations of a sloped platform · swalePatch(surface, swale, units) → a gradedSurface patch
 *   slopeClasses(surface, limits) → { counts, tris: [{ pts, cls }] }   triangles by gradient (cls 0 … limits.length)
 *   flowArrows(surface, spacing) → [{ x, y, ux, uy, slope }]            the way water runs, on a grid
 *   ponding(surface, { tol }) → { ponds: [{ depth, area, volume, spill, x, y, verts }], fill (Float64Array) }  priority-flood
 *   gradeSceneItems(ls, surface, units, { unitPerMm, slope: { limits } | null, flow: bool }) → plan items (L-GRAD-*)
 */

import { daylightPad, castSlope } from '../grading.js';
import { pointInPoly, polyArea } from '../tin.js';
import { t } from '../i18n.js';
import { hardGradeItems } from './hardscape.js';   // LD.4: paving and paths are part of the proposed surface too
import { freeformGradeItems } from './freeform.js';   // LD.7: freeform objects that cut the ground
import './layers.js';

export const KINDS = ['platform', 'berm', 'swale', 'area'];
export const MAX_GRADING = 500;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const XY = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
const pos = (v, d, max = 1e4) => (fin(v) && v > 0 && v <= max ? v : d);

/** Defaults in project units: side slopes 3:1, swale 1 ft / 0.3 m deep, 2 ft / 0.6 m bottom, berm 3 ft / 1 m high. */
export function defaults(units) {
  const m = units === 'm';
  return { cut: 3, fill: 3, side: 3, depth: m ? 0.3 : 1, bottom: m ? 0.6 : 2, height: m ? 1 : 3 };
}

export function cleanGrading(list, units) {
  const d = defaults(units), out = [];
  if (!Array.isArray(list)) return out;
  for (const g of list.slice(0, MAX_GRADING)) {
    if (!g || typeof g !== 'object' || !KINDS.includes(g.kind) || !/^l\d{1,9}$/.test(String(g.id))) continue;
    const pts = (Array.isArray(g.pts) ? g.pts.slice(0, 5000) : []).map(XY).filter(Boolean);
    const base = { id: g.id, kind: g.kind, name: str(g.name) || t('ls.g.' + g.kind), pts };
    if (g.kind === 'swale') {
      if (pts.length < 2) continue;
      out.push({ ...base, depth: pos(g.depth, d.depth, 100), bottom: fin(g.bottom) && g.bottom >= 0 && g.bottom <= 1000 ? g.bottom : d.bottom, side: pos(g.side, d.side, 100),
        fall: fin(g.fall) && g.fall > 0 && g.fall <= 100 ? g.fall : null });
      continue;
    }
    if (pts.length < 3) continue;
    if (g.kind === 'platform') {
      const fall = g.fall && fin(g.fall.pct) && g.fall.pct > 0 && g.fall.pct <= 100 && fin(g.fall.dir) ? { pct: g.fall.pct, dir: ((g.fall.dir % 360) + 360) % 360 } : null;
      out.push({ ...base, z: fin(g.z) && Math.abs(g.z) < 1e6 ? g.z : null, fall, cut: pos(g.cut, d.cut, 100), fill: pos(g.fill, d.fill, 100) });
    } else if (g.kind === 'berm') {
      out.push({ ...base, height: pos(g.height, d.height, 1000), cut: pos(g.cut, d.cut, 100), fill: pos(g.fill, d.fill, 100) });
    } else {
      const spots = (Array.isArray(g.spots) ? g.spots.slice(0, 5000) : []).filter((s) => XY(s) && fin(s.z) && Math.abs(s.z) < 1e6 && /^s\d{1,6}$/.test(String(s.id))).map((s) => ({ id: s.id, x: s.x, y: s.y, z: s.z }));
      const contours = (Array.isArray(g.contours) ? g.contours.slice(0, 500) : []).map((c) => ({ id: /^c\d{1,6}$/.test(String(c?.id)) ? c.id : null, z: fin(c?.z) && Math.abs(c.z) < 1e6 ? c.z : null, pts: (Array.isArray(c?.pts) ? c.pts.slice(0, 5000) : []).map(XY).filter(Boolean) }))
        .filter((c) => c.id && c.z !== null && c.pts.length >= 2);
      out.push({ ...base, spots, contours });
    }
  }
  return out;
}

export const gradeDeps = (ls) => JSON.stringify([ls?.grading || [], (ls?.hardscape || []).filter((h) => h.grade), (ls?.freeform || []).filter((f) => f.base === 'cut').map((f) => [f.id, f.at, f.baseZ, f.cut, f.fill, f.mesh.positions.length])]);

/** A sloped platform's corner elevations: a plane through the centroid at z0 falling `pct` % towards `dir`. */
export function planeZ(pts, z0, fall) {
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length, cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  if (!fall) return pts.map((p) => ({ x: p.x, y: p.y, z: z0 }));
  const a = (fall.dir * Math.PI) / 180, g = fall.pct / 100;
  return pts.map((p) => ({ x: p.x, y: p.y, z: z0 - g * ((p.x - cx) * Math.cos(a) + (p.y - cy) * Math.sin(a)) }));
}
/** The mean ground elevation along an outline (vertices and edge midpoints), or null when it is off the surface. */
export function meanGround(surface, pts) {
  if (!surface) return null;
  let s = 0, n = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    for (const q of [a, { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }]) { const z = surface.elevationAt(q.x, q.y, 1e-6); if (z !== null) { s += z; n++; } }
  }
  return n ? s / n : null;
}

/** A swale as a gradedSurface patch: a flat-bottomed channel (or a V when bottom = 0) along the line, its sides cast to the ground. */
export function swalePatch(surface, sw, units) {
  const P = sw.pts, problems = [];
  let L = 0;
  const segs = [];
  for (let i = 0; i + 1 < P.length; i++) { const l = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y); if (l > 1e-9) segs.push({ a: P[i], b: P[i + 1], l, s0: L }); L += l; }
  if (!segs.length) return { problems: [t('ls.g.err.short')], region: null, points: [], breaklines: [], info: null };
  const step = Math.max(units === 'm' ? 0.5 : 1.5, Math.min(L / 200, Math.max(sw.bottom, units === 'm' ? 1 : 3)));
  const stations = [];
  for (let s = 0; s < L; s += step) stations.push(s);
  stations.push(L);
  for (const g of segs) if (g.s0 > 0) stations.push(g.s0);   // every bend gets a section
  stations.sort((a, b) => a - b);
  const at = (s) => { const g = segs.find((q) => s <= q.s0 + q.l + 1e-9) || segs[segs.length - 1]; const f = (s - g.s0) / g.l; return { x: g.a.x + f * (g.b.x - g.a.x), y: g.a.y + f * (g.b.y - g.a.y), ux: (g.b.x - g.a.x) / g.l, uy: (g.b.y - g.a.y) / g.l }; };
  const g0 = surface.elevationAt(P[0].x, P[0].y, 1e-6);
  if (g0 === null) return { problems: [t('ls.g.err.off')], region: null, points: [], breaklines: [], info: null };
  const left = [], right = [], bl = [], br = [], cl = [], rays = [];
  let last = Infinity;
  for (const s of stations) {
    const q = at(s), gz = surface.elevationAt(q.x, q.y, 1e-6);
    if (gz === null) { problems.push(t('ls.g.err.offat', { s: s.toFixed(1) })); continue; }
    let zb = sw.fall ? g0 - sw.depth - (sw.fall / 100) * s : gz - sw.depth;
    if (!sw.fall) zb = Math.min(zb, last);   // following the ground, the bottom never runs uphill
    last = zb;
    const nx = -q.uy, ny = q.ux, h = sw.bottom / 2;
    const pl = { x: q.x + nx * h, y: q.y + ny * h, z: zb }, pr = { x: q.x - nx * h, y: q.y - ny * h, z: zb };
    const rl = castSlope(surface, pl, nx, ny, zb, sw.side, sw.side), rr = castSlope(surface, pr, -nx, -ny, zb, sw.side, sw.side);
    left.push({ x: rl.x, y: rl.y, z: rl.z }); right.push({ x: rr.x, y: rr.y, z: rr.z });
    bl.push(pl); br.push(pr); cl.push({ x: q.x, y: q.y, z: zb });
    rays.push(rl, rr);
  }
  if (left.length < 2) return { problems: problems.length ? problems : [t('ls.g.err.off')], region: null, points: [], breaklines: [], info: null };
  const region = [...left, ...right.slice().reverse()];
  if (Math.abs(polyArea(region)) < 1e-9) return { problems: [t('ls.g.err.flat')], region: null, points: [], breaklines: [], info: null };
  const breaklines = [{ name: 'swale-left', pts: left }, { name: 'swale-right', pts: right }];
  if (sw.bottom > 1e-6) breaklines.push({ name: 'swale-bottom-left', pts: bl }, { name: 'swale-bottom-right', pts: br });
  else breaklines.push({ name: 'swale-bottom', pts: cl });
  breaklines.push({ name: 'swale-end', pts: [left[0], ...(sw.bottom > 1e-6 ? [bl[0], br[0]] : [cl[0]]), right[0]] });
  breaklines.push({ name: 'swale-end', pts: [left.at(-1), ...(sw.bottom > 1e-6 ? [bl.at(-1), br.at(-1)] : [cl.at(-1)]), right.at(-1)] });
  return { problems: [], region, points: [], breaklines, info: { kind: 'swale', bottom: cl, left, right, rays, length: L, fallAt: cl.length > 1 ? (cl[0].z - cl.at(-1).z) / L : 0, offNotes: problems } };
}

/** A grading area: inside its outline the surface is rebuilt from the edge (on the ground below it), the spots and contours. */
function areaPatch(surface, a) {
  const edge = [];
  for (let i = 0; i < a.pts.length; i++) {
    const p = a.pts[i], q = a.pts[(i + 1) % a.pts.length];
    const n = Math.max(1, Math.ceil(Math.hypot(q.x - p.x, q.y - p.y) / Math.max(1e-6, Math.sqrt(Math.abs(polyArea(a.pts))) / 20)));
    for (let k = 0; k < n; k++) { const x = p.x + ((q.x - p.x) * k) / n, y = p.y + ((q.y - p.y) * k) / n; const z = surface.elevationAt(x, y, 1e-6); if (z === null) return { problems: [t('ls.g.err.off')], region: null, points: [], breaklines: [], info: null }; edge.push({ x, y, z }); }
  }
  const inside = (p) => pointInPoly(p.x, p.y, a.pts);
  const spots = a.spots.filter(inside).map((s) => ({ x: s.x, y: s.y, z: s.z }));
  const contours = a.contours.map((c) => ({ name: 'contour ' + c.z, pts: c.pts.filter(inside).map((p) => ({ x: p.x, y: p.y, z: c.z })) })).filter((c) => c.pts.length >= 2);
  return { problems: [], region: a.pts.map((p) => ({ x: p.x, y: p.y })), points: spots, breaklines: [{ name: a.name, pts: [...edge, edge[0]] }, ...contours], info: { kind: 'area', spots: spots.length, contours: contours.length } };
}

/** gradedSurface items for the landscape grading objects, in their order. */
export function gradeItems(ls, units) {
  const out = [];
  for (const g of ls?.grading || []) {
    if (g.kind === 'swale') { out.push({ id: g.id, kind: 'ls-swale', name: g.name, patch: (surf) => swalePatch(surf, g, units) }); continue; }
    if (g.kind === 'area') { out.push({ id: g.id, kind: 'ls-area', name: g.name, patch: (surf) => areaPatch(surf, g) }); continue; }
    out.push({ id: g.id, kind: 'ls-' + g.kind, name: g.name, patch: (surf) => {
      const mg = meanGround(surf, g.pts);
      if (mg === null) return { problems: [t('ls.g.err.off')], region: null, points: [], breaklines: [], info: null };
      const z0 = g.kind === 'berm' ? mg + g.height : g.z ?? mg;
      const pts = g.kind === 'platform' ? planeZ(g.pts, z0, g.fall) : g.pts.map((p) => ({ x: p.x, y: p.y, z: z0 }));
      const dl = daylightPad(surf, { pts, z: z0, cut: g.cut, fill: g.fill });
      if (dl.problems.length || !dl.rays.length) return { problems: dl.problems.length ? dl.problems : [t('grade.none')], region: null, points: [], breaklines: [], info: dl };
      const zv = (p) => (fin(p.z) ? p.z : z0);
      const bl = [{ name: g.name, pts: [...dl.poly, dl.poly[0]].map((p) => ({ x: p.x, y: p.y, z: zv(p) })) }, { name: g.name + ' daylight', pts: [...dl.daylight, dl.daylight[0]] }];
      for (const r of dl.rays) if (r.d > 1e-6) bl.push({ name: 'slope', pts: [{ x: r.x0, y: r.y0, z: r.z0 ?? z0 }, { x: r.x, y: r.y, z: r.z }] });
      return { problems: [], region: dl.daylight, points: [], breaklines: bl, info: { ...dl, z: z0, kind: g.kind } };
    } });
  }
  out.push(...hardGradeItems(ls, units), ...freeformGradeItems(ls, units));
  return out;
}

// ---- reading the surface: slope classes, flow and ponding ----
/** Triangles by gradient: cls 0 = flatter than limits[0], k = steeper than limits[k-1] (limits as fractions, e.g. 0.05, 0.333). */
export function slopeClasses(surface, limits = [0.05, 1 / 3]) {
  const { X, Y, tris, nT, ox, oy } = surface, counts = new Array(limits.length + 1).fill(0), out = [], area = new Array(limits.length + 1).fill(0);
  for (let k = 0; k < nT; k++) {
    const s = surface.slopeOf(k).slope;
    let c = 0;
    while (c < limits.length && s > limits[c] + 1e-12) c++;
    const a = tris[3 * k], b = tris[3 * k + 1], d = tris[3 * k + 2];
    const ar = Math.abs((X[b] - X[a]) * (Y[d] - Y[a]) - (Y[b] - Y[a]) * (X[d] - X[a])) / 2;
    counts[c]++; area[c] += ar;
    out.push({ cls: c, slope: s, pts: [{ x: X[a] + ox, y: Y[a] + oy }, { x: X[b] + ox, y: Y[b] + oy }, { x: X[d] + ox, y: Y[d] + oy }] });
  }
  return { counts, area, tris: out };
}

/** Downhill arrows on a grid of `spacing`: direction of steepest descent of the triangle under each grid point. */
export function flowArrows(surface, spacing, { max = 20000, minSlope = 1e-4 } = {}) {
  const b = surface.stats().bounds, out = [];
  if (!(spacing > 0)) return out;
  const nx = Math.floor((b.maxX - b.minX) / spacing), ny = Math.floor((b.maxY - b.minY) / spacing);
  if (nx * ny > max) return flowArrows(surface, spacing * Math.sqrt((nx * ny) / max), { max, minSlope });
  for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
    const x = b.minX + (i + 0.5) * spacing, y = b.minY + (j + 0.5) * spacing;
    const hit = surface.locate(x - surface.ox, y - surface.oy);
    if (!hit) continue;
    const s = surface.slopeOf(hit.t);
    if (s.slope < minSlope) continue;
    out.push({ x, y, ux: -s.gx / s.slope, uy: -s.gy / s.slope, slope: s.slope });
  }
  return out;
}

/** Ponding: every vertex filled to the lowest level water can drain out at (priority-flood from the surface's outer edge,
 *  Barnes, Lehman & Mulla 2014); a pond is a connected group of vertices filled above their ground by more than `tol`. */
export function ponding(surface, { tol = 1e-3 } = {}) {
  const { X, Y, Z, tris, ox, oy } = surface, n = X.length;
  const used = surface.usedVertices();
  const adj = Array.from({ length: n }, () => []), edgeCount = new Map();
  const key = (a, b) => (a < b ? a * n + b : b * n + a);
  for (let k = 0; k < tris.length; k += 3) for (let e = 0; e < 3; e++) {
    const a = tris[k + e], b = tris[k + ((e + 1) % 3)];
    adj[a].push(b);
    const kk = key(a, b);
    edgeCount.set(kk, (edgeCount.get(kk) || 0) + 1);
  }
  const W = new Float64Array(n).fill(Infinity), done = new Uint8Array(n);
  // a binary heap of [level, vertex]
  const heap = [];
  const push = (lv, v) => { heap.push([lv, v]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
  const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
  for (const [kk, c] of edgeCount) if (c === 1) { const a = Math.floor(kk / n), b = kk % n; for (const v of [a, b]) if (!done[v]) { done[v] = 1; W[v] = Z[v]; push(Z[v], v); } }   // the outer edge drains
  while (heap.length) {
    const [lv, v] = pop();
    for (const u of adj[v]) if (!done[u] && used[u]) { done[u] = 1; W[u] = Math.max(Z[u], lv); push(W[u], u); }
  }
  const seen = new Uint8Array(n), ponds = [];
  const triArea = (a, b, c) => Math.abs((X[b] - X[a]) * (Y[c] - Y[a]) - (Y[b] - Y[a]) * (X[c] - X[a])) / 2;
  const wet = (v) => W[v] - Z[v] > tol;
  for (let v = 0; v < n; v++) {
    if (seen[v] || !used[v] || !wet(v)) continue;
    const verts = [], stack = [v];
    seen[v] = 1;
    while (stack.length) { const a = stack.pop(); verts.push(a); for (const u of adj[a]) if (!seen[u] && wet(u)) { seen[u] = 1; stack.push(u); } }
    const set = new Set(verts);
    let depth = 0, area = 0, volume = 0, lx = 0, ly = 0;
    for (const a of verts) { depth = Math.max(depth, W[a] - Z[a]); lx += X[a]; ly += Y[a]; }
    for (let k = 0; k < tris.length; k += 3) {   // triangles with all three corners wet: area and (mean depth × area) volume
      const a = tris[k], b = tris[k + 1], c = tris[k + 2];
      if (!set.has(a) && !set.has(b) && !set.has(c)) continue;
      const ar = triArea(a, b, c), d = ((W[a] - Z[a]) + (W[b] - Z[b]) + (W[c] - Z[c])) / 3;
      if (set.has(a) && set.has(b) && set.has(c)) { area += ar; volume += ar * Math.max(0, d); }
    }
    ponds.push({ depth, area, volume, spill: W[verts[0]], x: lx / verts.length + ox, y: ly / verts.length + oy, verts });
  }
  ponds.sort((a, b) => b.volume - a.volume || b.depth - a.depth);
  return { ponds, fill: W };
}

/** Plan items: grading outlines, swale bottoms, spot elevation labels, steep triangles, flow arrows, ponds. */
export function gradeSceneItems(ls, surface, units, { unitPerMm = 1, slope = null, flow = false, fixed = (v) => v.toFixed(2) } = {}) {
  const items = [], lab = 2;
  for (const g of ls?.grading || []) {
    if (g.kind === 'swale') items.push({ layer: 'L-GRAD-FLOW', kind: 'poly', pts: g.pts, dashed: true });
    else items.push({ layer: 'L-GRAD-SPOT', kind: 'poly', pts: g.pts, closed: true });
    if (g.kind === 'area') {
      for (const s of g.spots) {
        const r = 0.8 * unitPerMm;
        items.push({ layer: 'L-GRAD-SPOT', kind: 'poly', pts: [{ x: s.x - r, y: s.y - r }, { x: s.x + r, y: s.y + r }] }, { layer: 'L-GRAD-SPOT', kind: 'poly', pts: [{ x: s.x - r, y: s.y + r }, { x: s.x + r, y: s.y - r }] });
        items.push({ layer: 'L-GRAD-SPOT', kind: 'text', x: s.x + 1.2 * unitPerMm, y: s.y + 1.2 * unitPerMm, mm: lab, rot: 0, text: '+' + fixed(s.z), align: 'left' });
      }
      for (const c of g.contours) items.push({ layer: 'L-GRAD-SPOT', kind: 'poly', pts: c.pts });
    }
  }
  if (surface && slope) {
    const sc = slopeClasses(surface, slope.limits);
    const top = slope.limits.length;
    for (const tr of sc.tris) if (tr.cls === top) items.push({ layer: 'L-GRAD-SLOP', kind: 'poly', pts: tr.pts, closed: true });
  }
  if (surface && flow) {
    const sp = 8 * unitPerMm;
    for (const a of flowArrows(surface, sp, { max: 6000 })) {
      const L = sp * 0.35, x1 = a.x - a.ux * L, y1 = a.y - a.uy * L, x2 = a.x + a.ux * L, y2 = a.y + a.uy * L, h = L * 0.45;
      items.push({ layer: 'L-GRAD-FLOW', kind: 'poly', pts: [{ x: x1, y: y1 }, { x: x2, y: y2 }] });
      items.push({ layer: 'L-GRAD-FLOW', kind: 'poly', pts: [{ x: x2 - a.ux * h - a.uy * h * 0.6, y: y2 - a.uy * h + a.ux * h * 0.6 }, { x: x2, y: y2 }, { x: x2 - a.ux * h + a.uy * h * 0.6, y: y2 - a.uy * h - a.ux * h * 0.6 }] });
    }
    for (const p of ponding(surface).ponds.slice(0, 200)) {
      if (p.depth < (units === 'm' ? 0.01 : 0.03)) continue;
      const r = Math.max(1.5 * unitPerMm, Math.sqrt(p.area / Math.PI));
      items.push({ layer: 'L-GRAD-FLOW', kind: 'arc', c: { x: p.x, y: p.y }, r, a0: 0, a1: 2 * Math.PI });
      items.push({ layer: 'L-GRAD-FLOW', kind: 'text', x: p.x, y: p.y, mm: lab, rot: 0, text: t('ls.g.pond', { d: fixed(p.depth) }), align: 'center', middle: true });
    }
  }
  return items;
}
