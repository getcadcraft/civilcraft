/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hardscape.js — the Landscape workspace's hardscape (0.7 LD.4, session `landscape`): paving, paths, walls, kerbs, ramps and
 * steps that follow the ground. No DOM. Every object is worked out again from the current surface each time (memoised by the
 * caller), so it regenerates when the terrain or its line moves. Lengths are in project units (ft or m), slopes in %.
 *
 * state.landscape.hardscape = [
 *   { id, kind: 'paving', name, pts (closed), level: null (the ground's mean) | z, falls: { mode: 'none'|'cross'|'drain', pct, dir (deg),
 *     drain: {x,y} }, edge (edging width, 0 = none), pattern: { kind: 'none'|'grid'|'stretcher'|'herringbone', w, l, joint, angle },
 *     layers: [{ name, thickness }] (top first), grade (bool: part of the proposed surface) }
 *   { id, kind: 'path', name, pts (open), width, crossfall (%), edge, layers, maxGrade (%) }
 *   { id, kind: 'wall', name, pts (open), wall: 'retaining'|'freestanding', thickness, top: null (ground + height) | z, height,
 *     batter (deg, the face leaning back), footing: { width, depth, step }, coping: { overhang, thickness }, drain (drainage layer
 *     thickness behind a retaining wall, 0 = none), material }
 *   { id, kind: 'kerb', name, pts (open), width, upstand, depth }
 *   { id, kind: 'ramp', name, pts (open, bottom → top), width, zStart: null | z, zEnd: null | z, maxGrade (%), landingEvery (rise), landing (length) }
 *   { id, kind: 'steps', name, pts: [bottom, top] (the line of travel up), width, zBottom: null | z, zTop: null | z, riserMax, goingMin, maxRisers, landing }
 * ]
 *
 *   cleanHardscape(list, units) (untrusted) · hardDefaults(units)
 *   pavingSurface(p, surface) → { corners: [{x,y,z}], drain: {x,y,z} | null, z0 }
 *   patternLines(p, { max }) → [[{x,y},{x,y}]…] the joint lines clipped to the area (capped)
 *   pathStrip(path, surface) → { center: [{x,y,z}], left, right, length, steepest, steep: [{ s, grade }] }
 *   wallLayout(w, surface, units) → { stations: [{ s, x, y, ground, top, height, footing }], maxHeight, length, faceArea, volume, steps, engineer }
 *   rampLayout(r, surface, units) → { zs, ze, rise, length, grade, runs, landings, need, ok, checks }
 *   stepsLayout(s, surface, units) → { H, n, riser, going, treads, flights, run, length, fits, need, checks, treadLines }
 *   hardGradeItems(ls, units) → gradedSurface items for paving and paths marked `grade`
 *   hardSceneItems(ls, surface, units, { unitPerMm, fixed }) → plan items on the L-HARD-* layers
 *   hardElements(ls, surface, units) → IFC elements (ifc-landscape.js): IfcPavement, IfcWall, IfcKerb, IfcRamp, IfcStair, IfcSlab (edging)
 *   hardQuantities(ls, surface, units) → [{ key, name, unit, qty }] for TakeoffCraft
 */

import { meanGround, planeZ } from './grade.js';
import { inside, offsetLine } from './planting.js';
import { t } from '../i18n.js';
import './layers.js';

export const HARD_KINDS = ['paving', 'path', 'wall', 'kerb', 'ramp', 'steps'];
export const PATTERNS = ['none', 'grid', 'stretcher', 'herringbone'];
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const XY = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
const pos = (v, d, max = 1e4, min = 0) => (fin(v) && v > min && v <= max ? v : d);
const nz = (v) => (fin(v) && Math.abs(v) < 1e6 ? v : null);

/** Labelled defaults (a designer sets the real ones): exterior steps after the usual comfort rule 2R + G ≈ 630 mm (25 in),
 *  ramps 1:12 (8.33 %) with a landing every 750 mm (30 in) of rise, paths no steeper than 1:20 (5 %). */
export function hardDefaults(units) {
  const m = units === 'm', L = (mv, fv) => (m ? mv : fv);
  return {
    paving: { edge: L(0.15, 0.5), pattern: { kind: 'stretcher', w: L(0.1, 0.33), l: L(0.2, 0.66), joint: L(0.005, 0.016), angle: 0 }, layers: [{ name: t('ls.h.l.pavers'), thickness: L(0.06, 0.2) }, { name: t('ls.h.l.bedding'), thickness: L(0.03, 0.1) }, { name: t('ls.h.l.base'), thickness: L(0.15, 0.5) }] },
    path: { width: L(1.2, 4), crossfall: 2, edge: L(0.05, 0.17), maxGrade: 5, layers: [{ name: t('ls.h.l.gravel'), thickness: L(0.05, 0.17) }, { name: t('ls.h.l.base'), thickness: L(0.1, 0.33) }] },
    wall: { thickness: L(0.3, 1), height: L(0.9, 3), batter: 0, footing: { width: L(0.6, 2), depth: L(0.45, 1.5), step: L(0.15, 0.5) }, coping: { overhang: L(0.03, 0.1), thickness: L(0.05, 0.17) }, drain: L(0.3, 1), engineerFrom: L(1.2, 4) },
    kerb: { width: L(0.125, 0.5), upstand: L(0.1, 0.33), depth: L(0.25, 0.83) },
    ramp: { width: L(1.2, 4), maxGrade: 8.33, landingEvery: L(0.75, 2.5), landing: L(1.5, 5), widthMin: L(0.9, 3) },
    steps: { width: L(1.2, 4), riserMax: L(0.17, 0.583), goingMin: L(0.3, 1), maxRisers: 12, landing: L(1.2, 4), comfort: L(0.63, 2.083) },
  };
}

function cleanLayers(a, d) {
  if (!Array.isArray(a)) return d;
  const out = a.slice(0, 8).filter((l) => l && fin(l.thickness) && l.thickness > 0 && l.thickness < 100).map((l) => ({ name: str(l.name, 60) || '—', thickness: l.thickness }));
  return out.length ? out : d;
}

export function cleanHardscape(list, units) {
  const D = hardDefaults(units), out = [];
  if (!Array.isArray(list)) return out;
  for (const h of list.slice(0, 2000)) {
    if (!h || typeof h !== 'object' || !HARD_KINDS.includes(h.kind) || !/^l\d{1,9}$/.test(String(h.id))) continue;
    const pts = (Array.isArray(h.pts) ? h.pts.slice(0, 5000) : []).map(XY).filter(Boolean);
    const closed = h.kind === 'paving';
    if (pts.length < (closed ? 3 : 2)) continue;
    const base = { id: h.id, kind: h.kind, name: str(h.name) || t('ls.h.k.' + h.kind), pts };
    if (h.kind === 'paving') {
      const f = h.falls && typeof h.falls === 'object' ? h.falls : {};
      const mode = ['none', 'cross', 'drain'].includes(f.mode) ? f.mode : 'none';
      const falls = { mode, pct: pos(f.pct, 1.5, 50), dir: fin(f.dir) ? ((f.dir % 360) + 360) % 360 : 0, drain: XY(f.drain) };
      if (mode === 'drain' && !falls.drain) falls.mode = 'none';
      const p = h.pattern && typeof h.pattern === 'object' ? h.pattern : {};
      out.push({ ...base, level: nz(h.level), falls, edge: fin(h.edge) && h.edge >= 0 && h.edge < 100 ? h.edge : D.paving.edge,
        pattern: { kind: PATTERNS.includes(p.kind) ? p.kind : D.paving.pattern.kind, w: pos(p.w, D.paving.pattern.w, 100), l: pos(p.l, D.paving.pattern.l, 100), joint: fin(p.joint) && p.joint >= 0 && p.joint < 10 ? p.joint : D.paving.pattern.joint, angle: fin(p.angle) ? p.angle % 360 : 0 },
        layers: cleanLayers(h.layers, D.paving.layers), grade: h.grade !== false });
    } else if (h.kind === 'path') {
      out.push({ ...base, width: pos(h.width, D.path.width, 1000), crossfall: fin(h.crossfall) && h.crossfall >= 0 && h.crossfall <= 50 ? h.crossfall : D.path.crossfall,
        edge: fin(h.edge) && h.edge >= 0 && h.edge < 100 ? h.edge : D.path.edge, layers: cleanLayers(h.layers, D.path.layers), maxGrade: pos(h.maxGrade, D.path.maxGrade, 100), grade: h.grade !== false });
    } else if (h.kind === 'wall') {
      const fo = h.footing || {}, co = h.coping || {};
      out.push({ ...base, wall: h.wall === 'freestanding' ? 'freestanding' : 'retaining', thickness: pos(h.thickness, D.wall.thickness, 100), top: nz(h.top), height: pos(h.height, D.wall.height, 1000),
        batter: fin(h.batter) && h.batter >= 0 && h.batter < 45 ? h.batter : 0,
        footing: { width: pos(fo.width, D.wall.footing.width, 100), depth: pos(fo.depth, D.wall.footing.depth, 100), step: pos(fo.step, D.wall.footing.step, 100) },
        coping: { overhang: fin(co.overhang) && co.overhang >= 0 && co.overhang < 10 ? co.overhang : D.wall.coping.overhang, thickness: fin(co.thickness) && co.thickness >= 0 && co.thickness < 10 ? co.thickness : D.wall.coping.thickness },
        drain: fin(h.drain) && h.drain >= 0 && h.drain < 100 ? h.drain : D.wall.drain, material: str(h.material, 60) || t('ls.h.m.wall') });
    } else if (h.kind === 'kerb') {
      out.push({ ...base, width: pos(h.width, D.kerb.width, 10), upstand: fin(h.upstand) && h.upstand >= 0 && h.upstand < 10 ? h.upstand : D.kerb.upstand, depth: pos(h.depth, D.kerb.depth, 10) });
    } else if (h.kind === 'ramp') {
      out.push({ ...base, width: pos(h.width, D.ramp.width, 100), zStart: nz(h.zStart), zEnd: nz(h.zEnd), maxGrade: pos(h.maxGrade, D.ramp.maxGrade, 100), landingEvery: pos(h.landingEvery, D.ramp.landingEvery, 100), landing: pos(h.landing, D.ramp.landing, 100) });
    } else {
      out.push({ ...base, pts: pts.slice(0, 2), width: pos(h.width, D.steps.width, 100), zBottom: nz(h.zBottom), zTop: nz(h.zTop), riserMax: pos(h.riserMax, D.steps.riserMax, 10),
        goingMin: pos(h.goingMin, D.steps.goingMin, 10), maxRisers: Number.isInteger(h.maxRisers) && h.maxRisers >= 2 && h.maxRisers <= 50 ? h.maxRisers : D.steps.maxRisers, landing: pos(h.landing, D.steps.landing, 100) });
    }
  }
  return out;
}

// ---- line helpers ----
function walk(P) {
  const segs = [];
  let L = 0;
  for (let i = 0; i + 1 < P.length; i++) { const l = Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y); if (l > 1e-9) segs.push({ a: P[i], b: P[i + 1], l, s0: L }); L += l; }
  const at = (s) => { const g = segs.find((q) => s <= q.s0 + q.l + 1e-9) || segs[segs.length - 1]; const f = (s - g.s0) / g.l; return { x: g.a.x + f * (g.b.x - g.a.x), y: g.a.y + f * (g.b.y - g.a.y), ux: (g.b.x - g.a.x) / g.l, uy: (g.b.y - g.a.y) / g.l }; };
  return { segs, L, at };
}
function stations(w, step) {
  const out = [];
  for (let s = 0; s < w.L; s += step) out.push(s);
  out.push(w.L);
  for (const g of w.segs) if (g.s0 > 0) out.push(g.s0);
  return [...new Set(out.map((v) => Math.round(v * 1e6) / 1e6))].sort((a, b) => a - b);
}
const ground = (sf, x, y) => (sf ? sf.elevationAt(x, y, 1e-6) : null);

// ---- paving ----
export function pavingSurface(p, surface) {
  const z0 = p.level ?? meanGround(surface, p.pts) ?? 0;
  const f = p.falls;
  if (f.mode === 'cross') return { corners: planeZ(p.pts, z0, { pct: f.pct, dir: f.dir }), drain: null, z0 };
  if (f.mode === 'drain' && f.drain) {
    // the drain is the low point at the paving's level; every corner rises from it at the fall
    const d = f.drain;
    return { corners: p.pts.map((q) => ({ x: q.x, y: q.y, z: z0 + (f.pct / 100) * Math.hypot(q.x - d.x, q.y - d.y) })), drain: { x: d.x, y: d.y, z: z0 }, z0 };
  }
  return { corners: p.pts.map((q) => ({ x: q.x, y: q.y, z: z0 })), drain: null, z0 };
}

/** Segment ab clipped to a polygon → the pieces inside (even–odd). */
function clipSeg(a, b, poly) {
  const ts = [0, 1];
  const dx = b.x - a.x, dy = b.y - a.y;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const p = poly[j], q = poly[i], ex = q.x - p.x, ey = q.y - p.y, den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-15) continue;
    const t1 = ((p.x - a.x) * ey - (p.y - a.y) * ex) / den, u = ((p.x - a.x) * dy - (p.y - a.y) * dx) / den;
    if (t1 > 0 && t1 < 1 && u >= 0 && u <= 1) ts.push(t1);
  }
  ts.sort((x, y) => x - y);
  const out = [];
  for (let k = 0; k + 1 < ts.length; k++) {
    const m = (ts[k] + ts[k + 1]) / 2;
    if (ts[k + 1] - ts[k] > 1e-9 && inside(a.x + dx * m, a.y + dy * m, poly)) out.push([{ x: a.x + dx * ts[k], y: a.y + dy * ts[k] }, { x: a.x + dx * ts[k + 1], y: a.y + dy * ts[k + 1] }]);
  }
  return out;
}

/** The pattern's joint lines inside the paving (stretcher bond, grid, herringbone), capped at `max` lines. */
export function patternLines(p, { max = 20000 } = {}) {
  const pat = p.pattern;
  if (!pat || pat.kind === 'none') return [];
  const a = (pat.angle * Math.PI) / 180, ca = Math.cos(a), sa = Math.sin(a), o = p.pts[0];
  const loc = p.pts.map((q) => ({ x: (q.x - o.x) * ca + (q.y - o.y) * sa, y: -(q.x - o.x) * sa + (q.y - o.y) * ca }));
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of loc) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); }
  const W = pat.w + pat.joint, Lg = pat.l + pat.joint, out = [];
  const back = (q) => ({ x: o.x + q.x * ca - q.y * sa, y: o.y + q.x * sa + q.y * ca });
  const add = (u, v) => { if (out.length >= max) return false; for (const s of clipSeg(u, v, loc)) out.push([back(s[0]), back(s[1])]); return true; };
  if (pat.kind === 'grid' || pat.kind === 'stretcher') {
    if ((y1 - y0) / W + (x1 - x0) / Lg * ((y1 - y0) / W) > max * 2) return [];
    const eps = 1e-9 * Math.max(1, x1 - x0, y1 - y0);   // whole steps: a line on the far edge is the edge, not a joint
    for (let k = 1; y0 + k * W < y1 - eps; k++) if (!add({ x: x0, y: y0 + k * W }, { x: x1, y: y0 + k * W })) break;   // courses
    for (let row = 0; y0 + row * W < y1 - eps; row++) {   // the joints across each course (offset by half a unit in stretcher bond)
      const y = y0 + row * W, shift = pat.kind === 'stretcher' && row % 2 ? Lg / 2 : 0;
      for (let k = 0; x0 + shift + k * Lg < x1 - eps; k++) { const x = x0 + shift + k * Lg; if (x > x0 + eps && !add({ x, y }, { x, y: y + W })) return out; }
    }
    return out;
  }
  // herringbone (90°): L-shaped pairs of units on a 45° lattice, drawn as each unit's outline
  const units = (x1 - x0) * (y1 - y0) / (pat.w * pat.l);
  if (units > max / 2) return [];
  const step = Lg + W;
  for (let k = Math.floor((x0 - (y1 - y0)) / step) - 1; k * step < x1 + (y1 - y0); k++) {
    for (let j = Math.floor(y0 / W) - 1; j * W < y1 + Lg; j++) {
      const bx = k * step + j * W, by = j * W;
      const rects = [[bx, by, Lg, W], [bx + Lg, by - Lg + W, W, Lg]];
      for (const [rx, ry, rw, rh] of rects) {
        if (rx > x1 || rx + rw < x0 || ry > y1 || ry + rh < y0) continue;
        const c = [{ x: rx, y: ry }, { x: rx + rw, y: ry }, { x: rx + rw, y: ry + rh }, { x: rx, y: ry + rh }];
        for (let e = 0; e < 4; e++) if (!add(c[e], c[(e + 1) % 4])) return out;
      }
    }
  }
  return out;
}

// ---- paths ----
export function pathStrip(path, surface) {
  const w = walk(path.pts), out = { center: [], left: [], right: [], length: w.L, steepest: 0, steep: [] };
  if (!w.segs.length) return out;
  const step = Math.max(path.width / 2, w.L / 400);
  let prev = null;
  for (const s of stations(w, step)) {
    const q = w.at(s), z = ground(surface, q.x, q.y);
    if (z === null) continue;
    const nx = -q.uy, ny = q.ux, h = path.width / 2, dz = (path.crossfall / 100) * path.width;   // falls to the right side
    out.center.push({ x: q.x, y: q.y, z, s });
    out.left.push({ x: q.x + nx * h, y: q.y + ny * h, z: z + dz / 2 });
    out.right.push({ x: q.x - nx * h, y: q.y - ny * h, z: z - dz / 2 });
    if (prev) {
      const g = Math.abs(z - prev.z) / Math.max(1e-9, s - prev.s) * 100;
      if (g > out.steepest) out.steepest = g;
      if (g > path.maxGrade + 1e-9) out.steep.push({ s: prev.s, s1: s, grade: g });
    }
    prev = { z, s };
  }
  return out;
}

// ---- walls ----
export function wallLayout(wl, surface, units) {
  const D = hardDefaults(units), w = walk(wl.pts), out = { stations: [], maxHeight: 0, minHeight: Infinity, length: w.L, faceArea: 0, volume: 0, steps: 0, engineer: false, off: 0 };
  if (!w.segs.length) return out;
  const step = Math.max(units === 'm' ? 0.25 : 0.75, w.L / 400);
  let lastFoot = null;
  for (const s of stations(w, step)) {
    const q = w.at(s), g = ground(surface, q.x, q.y);
    if (g === null) { out.off++; continue; }
    const top = wl.top ?? g + wl.height, height = top - g;
    // the footing's top sits `depth` below the ground, stepped down in whole `step`s so it is level between steps
    const foot = Math.floor((g - wl.footing.depth) / wl.footing.step) * wl.footing.step;
    if (lastFoot !== null && Math.abs(foot - lastFoot) > 1e-9) out.steps++;
    lastFoot = foot;
    out.stations.push({ s, x: q.x, y: q.y, ux: q.ux, uy: q.uy, ground: g, top, height, footing: foot });
    out.maxHeight = Math.max(out.maxHeight, height);
    out.minHeight = Math.min(out.minHeight, height);
  }
  for (let i = 1; i < out.stations.length; i++) {
    const a = out.stations[i - 1], b = out.stations[i], ds = b.s - a.s;
    out.faceArea += ds * (Math.max(0, a.height) + Math.max(0, b.height)) / 2;
    out.volume += ds * wl.thickness * ((a.top - a.footing) + (b.top - b.footing)) / 2;
  }
  out.engineer = wl.wall === 'retaining' && out.maxHeight > D.wall.engineerFrom;
  if (!out.stations.length) out.minHeight = 0;
  return out;
}

// ---- ramps and steps ----
export function rampLayout(r, surface, units) {
  const D = hardDefaults(units), w = walk(r.pts);
  const a = r.pts[0], b = r.pts[r.pts.length - 1];
  const zs = r.zStart ?? ground(surface, a.x, a.y) ?? 0, ze = r.zEnd ?? ground(surface, b.x, b.y) ?? 0;
  const rise = Math.abs(ze - zs), runs = Math.max(1, Math.ceil(rise / r.landingEvery - 1e-9)), landings = runs - 1;
  const sloped = w.L - landings * r.landing;
  const grade = sloped > 0 ? (rise / sloped) * 100 : Infinity;
  const need = (rise / (r.maxGrade / 100)) + landings * r.landing;
  const checks = [
    { key: 'grade', ok: grade <= r.maxGrade + 1e-9, value: grade, limit: r.maxGrade },
    { key: 'width', ok: r.width >= D.ramp.widthMin - 1e-9, value: r.width, limit: D.ramp.widthMin },
  ];
  return { zs, ze, rise, length: w.L, grade, runs, landings, need, ok: checks.every((c) => c.ok), checks };
}

export function stepsLayout(st, surface, units) {
  const D = hardDefaults(units);
  const [a, b] = st.pts, L = Math.hypot(b.x - a.x, b.y - a.y);
  const zB = st.zBottom ?? ground(surface, a.x, a.y) ?? 0, zT = st.zTop ?? ground(surface, b.x, b.y) ?? 0;
  const H = zT - zB;
  if (!(H > 1e-6)) return { H, n: 0, riser: 0, going: 0, treads: 0, flights: 0, run: 0, length: L, fits: false, need: 0, checks: [{ key: 'height', ok: false, value: H }], treadLines: [], zB, zT };
  // as BimCraft's stairs (res-stair.js): n = ⌈H / riser max⌉ risers of H / n, n − 1 treads (the top level is the last step);
  // the going from the comfort rule 2R + G ≈ 630 mm, never under the minimum going
  const n = Math.ceil(H / st.riserMax - 1e-9), riser = H / n;
  const going = Math.max(st.goingMin, D.steps.comfort - 2 * riser);
  const flights = Math.ceil(n / st.maxRisers), landings = flights - 1, treads = n - 1;
  const run = treads * going + landings * (st.landing - going);
  const ux = (b.x - a.x) / (L || 1), uy = (b.y - a.y) / (L || 1), nx = -uy, ny = ux, hw = st.width / 2;
  const lines = [];
  let s = 0;
  for (let k = 1; k <= treads; k++) {   // the nosing of each tread, measured from the bottom step's front edge
    s += going;
    if (landings && k % st.maxRisers === 0 && k < treads) s += st.landing - going;
    lines.push([{ x: a.x + ux * s + nx * hw, y: a.y + uy * s + ny * hw }, { x: a.x + ux * s - nx * hw, y: a.y + uy * s - ny * hw }]);
  }
  const checks = [
    { key: 'riser', ok: riser <= st.riserMax + 1e-9, value: riser, limit: st.riserMax },
    { key: 'going', ok: going >= st.goingMin - 1e-9, value: going, limit: st.goingMin },
    { key: 'fits', ok: run <= L + 1e-9, value: run, limit: L },
  ];
  return { H, n, riser, going, treads, flights, landings, run, length: L, fits: run <= L + 1e-9, need: Math.max(0, run - L), checks, treadLines: lines, zB, zT, ux, uy };
}

// ---- the proposed surface ----
export function hardGradeItems(ls, units) {
  const out = [];
  for (const h of ls?.hardscape || []) {
    if (h.kind === 'paving' && h.grade) out.push({ id: h.id, kind: 'ls-paving', name: h.name, patch: (surf) => {
      const ps = pavingSurface(h, surf);
      if (ps.corners.some((c) => !fin(c.z))) return { problems: [t('ls.g.err.off')], region: null, points: [], breaklines: [], info: null };
      return { problems: [], region: h.pts.map((q) => ({ x: q.x, y: q.y })), points: ps.drain ? [ps.drain] : [], breaklines: [{ name: h.name, pts: [...ps.corners, ps.corners[0]] }], info: { kind: 'paving', z0: ps.z0 } };
    } });
    if (h.kind === 'path' && h.grade) out.push({ id: h.id, kind: 'ls-path', name: h.name, patch: (surf) => {
      const st = pathStrip(h, surf);
      if (st.left.length < 2) return { problems: [t('ls.g.err.off')], region: null, points: [], breaklines: [], info: null };
      return { problems: [], region: [...st.left, ...st.right.slice().reverse()].map((q) => ({ x: q.x, y: q.y })), points: [], breaklines: [{ name: h.name + ' L', pts: st.left }, { name: h.name + ' R', pts: st.right }], info: { kind: 'path', steepest: st.steepest } };
    } });
  }
  return out;
}

// ---- the plan ----
export function hardSceneItems(ls, surface, units, { unitPerMm = 1, fixed = (v) => v.toFixed(2) } = {}) {
  const items = [], lab = 2;
  for (const h of ls?.hardscape || []) {
    if (h.kind === 'paving') {
      items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: h.pts, closed: true });
      if (h.edge > 0) items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: insetPoly(h.pts, h.edge), closed: true });
      if (h.pattern.w / unitPerMm >= 1) for (const [a, b] of patternLines(h, { max: 8000 })) items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: [a, b] });   // joints under 1 mm apart on paper would be a grey smudge
      const ps = pavingSurface(h, surface);
      if (ps.drain) {
        const r = 1.2 * unitPerMm;
        items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: [{ x: ps.drain.x - r, y: ps.drain.y - r }, { x: ps.drain.x + r, y: ps.drain.y - r }, { x: ps.drain.x + r, y: ps.drain.y + r }, { x: ps.drain.x - r, y: ps.drain.y + r }], closed: true });
        for (const c of ps.corners) items.push(...arrow(c, ps.drain, unitPerMm));
      } else if (h.falls.mode === 'cross') {
        const cx = h.pts.reduce((v, q) => v + q.x, 0) / h.pts.length, cy = h.pts.reduce((v, q) => v + q.y, 0) / h.pts.length, a = (h.falls.dir * Math.PI) / 180, L = 8 * unitPerMm;
        items.push(...arrow({ x: cx - Math.cos(a) * L / 2, y: cy - Math.sin(a) * L / 2 }, { x: cx + Math.cos(a) * L / 2, y: cy + Math.sin(a) * L / 2 }, unitPerMm));
        items.push({ layer: 'L-HARD-TEXT', kind: 'text', x: cx, y: cy - 2.5 * unitPerMm, mm: lab, rot: 0, text: t('ls.h.fall.label', { pct: h.falls.pct }), align: 'center' });
      }
      items.push({ layer: 'L-HARD-TEXT', kind: 'text', x: h.pts[0].x + unitPerMm, y: h.pts[0].y + unitPerMm, mm: lab, rot: 0, text: t('ls.h.level.label', { z: fixed(ps.z0) }), align: 'left' });
    } else if (h.kind === 'path') {
      const hw = h.width / 2;
      items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: offsetLine(h.pts, hw) }, { layer: 'L-HARD-PAVE', kind: 'poly', pts: offsetLine(h.pts, -hw) });
      if (h.edge > 0) items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: offsetLine(h.pts, hw - h.edge) }, { layer: 'L-HARD-PAVE', kind: 'poly', pts: offsetLine(h.pts, -hw + h.edge) });
      const st = pathStrip(h, surface);
      for (const q of st.steep) { const w = walk(h.pts), m = w.at((q.s + q.s1) / 2); items.push({ layer: 'L-GRAD-SLOP', kind: 'text', x: m.x, y: m.y, mm: lab, rot: 0, text: '!', align: 'center', middle: true }); }
    } else if (h.kind === 'wall') {
      const half = h.thickness / 2;
      items.push({ layer: 'L-HARD-WALL', kind: 'poly', pts: offsetLine(h.pts, half) }, { layer: 'L-HARD-WALL', kind: 'poly', pts: offsetLine(h.pts, -half) });
      items.push({ layer: 'L-HARD-WALL', kind: 'poly', pts: [offsetLine(h.pts, half)[0], offsetLine(h.pts, -half)[0]] }, { layer: 'L-HARD-WALL', kind: 'poly', pts: [offsetLine(h.pts, half).at(-1), offsetLine(h.pts, -half).at(-1)] });
      items.push({ layer: 'L-HARD-WALL', kind: 'poly', pts: offsetLine(h.pts, half + (h.footing.width - h.thickness) / 2), dashed: true }, { layer: 'L-HARD-WALL', kind: 'poly', pts: offsetLine(h.pts, -half - (h.footing.width - h.thickness) / 2), dashed: true });
      const lay = wallLayout(h, surface, units);
      // top and bottom of wall at each end, set beyond the end along the wall so the two never overlap
      const ends = [[lay.stations[0], -1, 'right'], [lay.stations.at(-1), 1, 'left']];
      for (const [s, dir, align] of ends) if (s) items.push({ layer: 'L-HARD-TEXT', kind: 'text', x: s.x + dir * s.ux * 1.5 * unitPerMm, y: s.y + dir * s.uy * 1.5 * unitPerMm, mm: lab, rot: 0, text: t('ls.h.tw.bw', { tw: fixed(s.top), bw: fixed(s.ground) }), align, middle: true });
    } else if (h.kind === 'kerb') {
      items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: offsetLine(h.pts, h.width / 2) }, { layer: 'L-HARD-PAVE', kind: 'poly', pts: offsetLine(h.pts, -h.width / 2) });
    } else if (h.kind === 'ramp') {
      const hw = h.width / 2;
      items.push({ layer: 'L-HARD-STEP', kind: 'poly', pts: offsetLine(h.pts, hw) }, { layer: 'L-HARD-STEP', kind: 'poly', pts: offsetLine(h.pts, -hw) });
      const r = rampLayout(h, surface, units), w = walk(h.pts), m = w.at(w.L / 2);
      items.push(...arrow(w.at(Math.max(0, w.L / 2 - 4 * unitPerMm)), w.at(Math.min(w.L, w.L / 2 + 4 * unitPerMm)), unitPerMm, 'L-HARD-STEP'));
      items.push({ layer: 'L-HARD-TEXT', kind: 'text', x: m.x + (hw + 2 * unitPerMm) * -m.uy, y: m.y + (hw + 2 * unitPerMm) * m.ux, mm: lab, rot: 0, text: t('ls.h.ramp.label', { g: fixed(r.grade), ok: r.ok ? '' : ' !' }), align: 'center' });
    } else if (h.kind === 'steps') {
      const s = stepsLayout(h, surface, units), [a, b] = h.pts, hw = h.width / 2;
      const nx = -(b.y - a.y) / (s.length || 1), ny = (b.x - a.x) / (s.length || 1), end = { x: a.x + (s.ux || 0) * s.run, y: a.y + (s.uy || 0) * s.run };
      items.push({ layer: 'L-HARD-STEP', kind: 'poly', pts: [{ x: a.x + nx * hw, y: a.y + ny * hw }, { x: end.x + nx * hw, y: end.y + ny * hw }, { x: end.x - nx * hw, y: end.y - ny * hw }, { x: a.x - nx * hw, y: a.y - ny * hw }], closed: true });
      for (const [p, q] of s.treadLines) items.push({ layer: 'L-HARD-STEP', kind: 'poly', pts: [p, q] });
      if (s.n) items.push({ layer: 'L-HARD-TEXT', kind: 'text', x: a.x - nx * (hw + 2 * unitPerMm), y: a.y - ny * (hw + 2 * unitPerMm), mm: lab, rot: 0, text: t('ls.h.steps.label', { n: s.n, r: fixed(s.riser), g: fixed(s.going) }), align: 'center' });
    }
  }
  return items;
}
function arrow(from, to, unitPerMm, layer = 'L-HARD-PAVE') {
  const dx = to.x - from.x, dy = to.y - from.y, L = Math.hypot(dx, dy);
  if (L < 1e-9) return [];
  const ux = dx / L, uy = dy / L, h = Math.min(L * 0.3, 1.5 * unitPerMm);
  return [{ layer, kind: 'poly', pts: [from, to] }, { layer, kind: 'poly', pts: [{ x: to.x - ux * h - uy * h * 0.5, y: to.y - uy * h + ux * h * 0.5 }, to, { x: to.x - ux * h + uy * h * 0.5, y: to.y - uy * h - ux * h * 0.5 }] }];
}
/** A closed outline moved inwards by d (mitred; fine for the convex-ish shapes of paving edges). */
export function insetPoly(pts, d) {
  const ccw = pts.reduce((a, p, i) => { const q = pts[(i + 1) % pts.length]; return a + p.x * q.y - q.x * p.y; }, 0) > 0;
  const closed = [...pts, pts[0], pts[1]];
  const off = offsetLine(closed, ccw ? d : -d);
  return off.slice(1, pts.length + 1);
}

// ---- IFC and quantities ----
export function hardElements(ls, surface, units) {
  const out = [];
  const rel = (pts, o) => pts.map((q) => ({ x: q.x - o.x, y: q.y - o.y }));
  for (const h of ls?.hardscape || []) {
    const tag = h.id;
    if (h.kind === 'paving') {
      const ps = pavingSurface(h, surface), o = h.pts[0], th = h.layers.reduce((a, l) => a + l.thickness, 0);
      out.push({ cls: 'IfcPavement', predefined: 'FLEXIBLE', name: h.name, tag, at: { x: o.x, y: o.y, z: ps.z0 }, body: { kind: 'prism', pts: rel(h.pts, o), z0: -th, z1: 0 },
        material: h.layers.map((l) => ({ name: l.name, thickness: l.thickness })),
        psets: { CadCraft_Paving: { Area: Math.abs(area(h.pts)), Level: ps.z0, Falls: h.falls.mode, FallPercent: h.falls.mode === 'none' ? '' : h.falls.pct, Pattern: h.pattern.kind, UnitWidth: h.pattern.w, UnitLength: h.pattern.l, Joint: h.pattern.joint, Edging: h.edge } } });
    } else if (h.kind === 'path') {
      const st = pathStrip(h, surface);
      if (st.left.length < 2) continue;
      const o = st.center[0], th = h.layers.reduce((a, l) => a + l.thickness, 0);
      out.push({ cls: 'IfcPavement', predefined: 'FLEXIBLE', name: h.name, objectType: 'Path', tag, at: { x: o.x, y: o.y, z: o.z }, body: { kind: 'prism', pts: rel([...st.left, ...st.right.slice().reverse()], o), z0: -th, z1: 0 },
        material: h.layers.map((l) => ({ name: l.name, thickness: l.thickness })), psets: { CadCraft_Path: { Length: st.length, Width: h.width, Crossfall: h.crossfall, SteepestGrade: st.steepest, MaxGrade: h.maxGrade } } });
    } else if (h.kind === 'wall') {
      const lay = wallLayout(h, surface, units);
      if (lay.stations.length < 2) continue;
      const o = lay.stations[0], half = h.thickness / 2, list = [];
      for (let i = 1; i < lay.stations.length; i++) {   // the wall as prisms between stations: footing to top, stepping with the ground
        const a = lay.stations[i - 1], b = lay.stations[i];
        const quad = [{ x: a.x - a.uy * half, y: a.y + a.ux * half }, { x: b.x - a.uy * half, y: b.y + a.ux * half }, { x: b.x + a.uy * half, y: b.y - a.ux * half }, { x: a.x + a.uy * half, y: a.y - a.ux * half }];
        list.push({ pts: rel(quad, o), z0: Math.min(a.footing, b.footing) - o.ground, z1: Math.max(a.top, b.top) - o.ground });
      }
      const layers = [{ name: h.material, thickness: h.thickness }];
      if (h.wall === 'retaining' && h.drain > 0) layers.push({ name: t('ls.h.m.drain'), thickness: h.drain });
      out.push({ cls: 'IfcWall', predefined: h.wall === 'retaining' ? 'RETAININGWALL' : 'STANDARD', name: h.name, tag, at: { x: o.x, y: o.y, z: o.ground }, body: { kind: 'prisms', list }, material: layers,
        psets: { Pset_WallCommon: { IsExternal: true, LoadBearing: h.wall === 'retaining' }, CadCraft_Wall: { Length: lay.length, MaxHeight: lay.maxHeight, MinHeight: lay.minHeight, FaceArea: lay.faceArea, Volume: lay.volume, FootingSteps: lay.steps, FootingWidth: h.footing.width, Batter: h.batter, CopingOverhang: h.coping.overhang, CopingThickness: h.coping.thickness } } });
    } else if (h.kind === 'kerb') {
      const o = h.pts[0], z = ground(surface, o.x, o.y) ?? 0, hw = h.width / 2;
      out.push({ cls: 'IfcKerb', predefined: 'NOTDEFINED', name: h.name, tag, at: { x: o.x, y: o.y, z }, body: { kind: 'prism', pts: rel([...offsetLine(h.pts, hw), ...offsetLine(h.pts, -hw).reverse()], o), z0: h.upstand - h.depth, z1: h.upstand },
        psets: { CadCraft_Kerb: { Length: walk(h.pts).L, Upstand: h.upstand, Width: h.width } } });
    } else if (h.kind === 'ramp') {
      const r = rampLayout(h, surface, units), o = h.pts[0], hw = h.width / 2;
      out.push({ cls: 'IfcRamp', predefined: 'STRAIGHT_RUN_RAMP', name: h.name, tag, at: { x: o.x, y: o.y, z: Math.min(r.zs, r.ze) }, body: { kind: 'prism', pts: rel([...offsetLine(h.pts, hw), ...offsetLine(h.pts, -hw).reverse()], o), z0: 0, z1: Math.max(0.01, r.rise) },
        psets: { Pset_RampCommon: { IsExternal: true }, CadCraft_Ramp: { Rise: r.rise, Length: r.length, Grade: r.grade, MaxGrade: h.maxGrade, Landings: r.landings, MeetsGrade: r.checks[0].ok } } });
    } else if (h.kind === 'steps') {
      const s = stepsLayout(h, surface, units);
      if (!s.n) continue;
      const [a] = h.pts, hw = h.width / 2, list = [];
      // tread k (1 … n − 1) runs from (k − 1)·going to k·going at k risers up: one block each from the bottom level (landings
      // are left as plain treads here; the plan and the Properties show them)
      const q = (d, side) => ({ x: s.ux * d - s.uy * side, y: s.uy * d + s.ux * side });
      for (let k = 1; k <= s.treads; k++) list.push({ pts: [q((k - 1) * s.going, hw), q(k * s.going, hw), q(k * s.going, -hw), q((k - 1) * s.going, -hw)], z0: 0, z1: s.riser * k });
      out.push({ cls: 'IfcStair', predefined: 'STRAIGHT_RUN_STAIR', name: h.name, tag, at: { x: a.x, y: a.y, z: s.zB }, body: { kind: 'prisms', list },
        psets: { Pset_StairCommon: { NumberOfRiser: s.n, NumberOfTreads: s.treads, RiserHeight: s.riser, TreadLength: s.going, IsExternal: true }, CadCraft_Steps: { Height: s.H, Run: s.run, Flights: s.flights, Fits: s.fits } } });
    }
  }
  return out;
}
function area(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; } return a / 2; }

export function hardQuantities(ls, surface, units) {
  const m = units === 'm', A = m ? 'm²' : 'SF', L = m ? 'm' : 'LF', V = m ? 'm³' : 'CY', vPer = m ? 1 : 27, r2 = (v) => Math.round(v * 100) / 100;   // i18n-ignore: TakeoffCraft's unit symbols
  const out = [];
  for (const h of ls?.hardscape || []) {
    if (h.kind === 'paving') {
      const a = Math.abs(area(h.pts));
      out.push({ key: 'hard:' + h.id + ':area', name: t('ls.h.q.paving', { name: h.name }), unit: A, qty: r2(a) });
      h.layers.forEach((l, i) => out.push({ key: 'hard:' + h.id + ':layer' + i, name: t('ls.h.q.layer', { name: h.name, layer: l.name }), unit: V, qty: r2((a * l.thickness) / vPer) }));
    } else if (h.kind === 'path') { const st = pathStrip(h, surface); out.push({ key: 'hard:' + h.id + ':area', name: t('ls.h.q.path', { name: h.name }), unit: A, qty: r2(st.length * h.width) }); }
    else if (h.kind === 'wall') { const w = wallLayout(h, surface, units); out.push({ key: 'hard:' + h.id + ':face', name: t('ls.h.q.wallface', { name: h.name }), unit: A, qty: r2(w.faceArea) }, { key: 'hard:' + h.id + ':len', name: t('ls.h.q.walllen', { name: h.name }), unit: L, qty: r2(w.length) }); }
    else if (h.kind === 'kerb') out.push({ key: 'hard:' + h.id + ':len', name: t('ls.h.q.kerb', { name: h.name }), unit: L, qty: r2(walk(h.pts).L) });
    else if (h.kind === 'steps') { const s = stepsLayout(h, surface, units); out.push({ key: 'hard:' + h.id + ':risers', name: t('ls.h.q.steps', { name: h.name }), unit: 'EA', qty: s.n }); }   // i18n-ignore: a unit symbol
    else if (h.kind === 'ramp') { const r = rampLayout(h, surface, units); out.push({ key: 'hard:' + h.id + ':area', name: t('ls.h.q.ramp', { name: h.name }), unit: A, qty: r2(r.length * h.width) }); }
  }
  return out;
}
