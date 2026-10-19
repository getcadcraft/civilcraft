/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cad-linework.js — a DWG or DXF drawing as GIS-style linework layers for CivilCraft (0.4 V1). No DOM; the Node test
 * drives it (bin/test-civilcraft-cad.mjs).
 *
 * Input is the drawing model cc-dwg's readDwg() returns (dwg/read.js; dxf-model.js readDxfModel() gives the same
 * model for DXF). Only model space is read. Each CAD layer becomes up to three layers in the shape gis-layers.js
 * addLayers() takes — lines (open linework), polygons (closed linework) and points — so the GIS layer list shows them
 * and "Use for the surface" turns them into breaklines (contours: their elevation), the boundary or survey points.
 *
 *   cadUnits(header)                 → { code, label, metres | null }          $INSUNITS
 *   unitScale(header, projectUnit)   → { scale, from, to, note | null }        drawing units → project units
 *   cadLinework(model, { file, projectUnit, scale, layers })
 *     → { layers: [{ cadLayer, name, geom, hasZ, fields, features, source }], cadLayers: [{ name, on, frozen, lines,
 *         polygons, points, z }], skipped: { TYPE: n }, units, scale, notes }
 *     `layers` (optional Set/array of CAD layer names) keeps only those. Fields on every feature: LAYER (text), TYPE
 *     (text, the CAD object type) and ELEV (number: the object's one elevation when every vertex has it, else null).
 *
 * Geometry: LINE, POINT, CIRCLE, ARC, ELLIPSE, LWPOLYLINE (bulges), POLYLINE_2D (bulges) / POLYLINE_3D, SPLINE (the curve
 * itself: de Boor on the control points, else a smooth curve through the fit points), SOLID/TRACE/3DFACE outlines, and INSERT / MINSERT (the block's
 * linework placed, nested blocks too, up to 8 deep; objects on layer 0 take the reference's layer). Curves become
 * vertices every 5° at most. Object coordinate systems (extrusion) are applied (the arbitrary axis algorithm). A vertex
 * keeps its z unless every z of the object is 0 (plan linework is 2D, so it never makes a flat breakline at 0).
 * Text, hatches, dimensions and anything else are counted in `skipped`, never guessed at.
 *
 * CivilCraft's own feature lines (0.6 WL.24): a model-space 3D polyline carrying CivilCraft's extended data (featureline.js
 * cadPolyline) is a feature line with its arcs:
 *   cadFeatureLines(model, { projectUnit, scale }) → [feature]   (featureline.js featureFromCad, scaled to project units)
 *   cadLinework(…, { skipFeatureLines: true }) leaves those polylines out of the linework (they come in as feature lines)
 */

import { t } from './i18n.js';
import { featureFromCad, CAD_TAG } from './featureline.js';

const isFeatureLine = (e) => e?.type === 'POLYLINE_3D' && e.xdata?.CADCRAFT?.[0]?.[1] === CAD_TAG;
/** CivilCraft feature lines written into this drawing (top-level model space only), in project units. */
export function cadFeatureLines(model, { projectUnit = 'ft', scale = null } = {}) {
  const ms = (model?.blocks || []).find((b) => String(b.name).toUpperCase() === '*MODEL_SPACE');
  const k = Number.isFinite(scale) && scale > 0 ? scale : unitScale(model?.header || {}, projectUnit).scale;
  const out = [];
  for (const e of ms?.entities || []) {
    if (!isFeatureLine(e) || e.invisible) continue;
    const vs = (e.vertices || []).filter((v) => !(v.flags & 16)).map((v) => ({ x: v.x * k, y: v.y * k, z: (v.z || 0) * k }));
    const f = featureFromCad(vs, !!e.closed, e.xdata, projectUnit);
    if (f) out.push(f);
  }
  return out;
}

// $INSUNITS → metres per unit (DXF reference, header variables). Feet and US survey feet count as one family: drawings
// say "feet" (2) for survey-foot coordinates far more often than not, and scaling by 2 ppm would move state-plane
// coordinates by feet — so they are never scaled into each other (the note says so).
const INSUNITS = {
  1: ['in', 0.0254], 2: ['ft', 0.3048], 3: ['mi', 1609.344], 4: ['mm', 0.001], 5: ['cm', 0.01], 6: ['m', 1], 7: ['km', 1000],
  8: ['microinch', 2.54e-8], 9: ['mil', 2.54e-5], 10: ['yd', 0.9144], 14: ['dm', 0.1], 21: ['ftUS', 1200 / 3937],
};
const FEET = new Set(['ft', 'ftUS']);
export const MAX_DEPTH = 8;
export const MAX_VERTICES = 5e6;
const STEP = Math.PI / 36;   // 5°

export function cadUnits(header = {}) {
  const u = INSUNITS[header.INSUNITS];
  return u ? { code: header.INSUNITS, label: u[0], metres: u[1] } : { code: header.INSUNITS ?? 0, label: '', metres: null };
}

/** Drawing units → project units ('ft' = US survey feet, 'm'). */
export function unitScale(header, projectUnit = 'ft') {
  const u = cadUnits(header);
  const to = projectUnit === 'm' ? 'm' : 'ft';
  if (!u.metres) return { scale: 1, from: '', to, note: t('cad.units.unknown', { unit: t('cad.unit.' + to) }) };
  if (to === 'ft' && FEET.has(u.label)) return { scale: 1, from: u.label, to, note: u.label === 'ft' ? t('cad.units.feet') : null };
  if (to === 'm' && u.label === 'm') return { scale: 1, from: 'm', to, note: null };
  const projM = to === 'm' ? 1 : 1200 / 3937;
  // inches and other imperial lengths into a feet project: exact ratios to the international foot
  const scale = to === 'ft' && ['in', 'mi', 'yd', 'mil', 'microinch'].includes(u.label) ? u.metres / 0.3048 : u.metres / projM;
  return { scale, from: u.label, to, note: t('cad.units.scaled', { from: u.label, to: t('cad.unit.' + to), scale: +scale.toPrecision(10) }) };
}

// ---------------------------------------------------------------- 3D affine transforms (row-major 3×4)
function mul(a, b) {   // a ∘ b
  const o = new Array(12);
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c];
    o[r * 4 + 3] = a[r * 4] * b[3] + a[r * 4 + 1] * b[7] + a[r * 4 + 2] * b[11] + a[r * 4 + 3];
  }
  return o;
}
const apply = (m, x, y, z) => [m[0] * x + m[1] * y + m[2] * z + m[3], m[4] * x + m[5] * y + m[6] * z + m[7], m[8] * x + m[9] * y + m[10] * z + m[11]];
const translate = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];

/** OCS → WCS for an extrusion direction (DXF reference, "Arbitrary axis algorithm"); null for the plain +Z. */
export function ocs(ext) {
  if (!ext || !Number.isFinite(ext.x) || !Number.isFinite(ext.y) || !Number.isFinite(ext.z)) return null;
  const L = Math.hypot(ext.x, ext.y, ext.z);
  if (!L) return null;
  const az = [ext.x / L, ext.y / L, ext.z / L];
  if (Math.abs(az[0]) < 1e-12 && Math.abs(az[1]) < 1e-12 && az[2] > 0) return null;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  let ax = Math.abs(az[0]) < 1 / 64 && Math.abs(az[1]) < 1 / 64 ? cross([0, 1, 0], az) : cross([0, 0, 1], az);
  const n = Math.hypot(...ax); ax = ax.map((v) => v / n);
  const ay = cross(az, ax);
  return [ax[0], ay[0], az[0], 0, ax[1], ay[1], az[1], 0, ax[2], ay[2], az[2], 0];
}
const withOcs = (m, ext) => { const o = ocs(ext); return o ? mul(m, o) : m; };

// ---------------------------------------------------------------- curves → vertices
function arcPts(cx, cy, r, a0, a1, z = 0) {   // CCW from a0 to a1 (radians)
  let sweep = a1 - a0;
  while (sweep <= 0) sweep += 2 * Math.PI;
  const n = Math.max(2, Math.ceil(sweep / STEP));
  const out = [];
  for (let i = 0; i <= n; i++) { const a = a0 + (sweep * i) / n; out.push([cx + r * Math.cos(a), cy + r * Math.sin(a), z]); }
  return out;
}
/** Vertices with DXF bulges (the arc starting at a vertex) → points; `closed` adds the closing segment's arc. */
function bulgedPts(vs, closed, zOf) {
  const out = [];
  const n = vs.length;
  for (let i = 0; i < n; i++) {
    const a = vs[i], z = zOf(a);
    out.push([a.x, a.y, z]);
    if (i === n - 1 && !closed) break;
    const b = vs[(i + 1) % n], bu = a.bulge || 0;
    if (!bu || !Number.isFinite(bu)) continue;
    const dx = b.x - a.x, dy = b.y - a.y, c = Math.hypot(dx, dy);
    if (!c) continue;
    const theta = 4 * Math.atan(bu);              // signed sweep
    const r = c / (2 * Math.sin(theta / 2));
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const h = r * Math.cos(theta / 2);            // centre distance from the chord's middle (signed with r)
    const cx = mx - (dy / c) * h, cy = my + (dx / c) * h;
    const a0 = Math.atan2(a.y - cy, a.x - cx);
    const steps = Math.max(1, Math.ceil(Math.abs(theta) / STEP));
    const zb = zOf(b);
    for (let k = 1; k < steps; k++) {
      const ang = a0 + (theta * k) / steps, R = Math.abs(r);
      out.push([cx + R * Math.cos(ang), cy + R * Math.sin(ang), z + ((zb - z) * k) / steps]);
    }
  }
  return out;
}
/** A B-spline (optionally rational) by de Boor, sampled evenly in its parameter: ~32 vertices per control span. */
export function splinePts(sp) {
  const P = sp.control || [], p = sp.degree | 0, U = sp.knots || [];
  if (P.length > p && p >= 1 && U.length === P.length + p + 1) {
    const W = sp.weights && sp.weights.length === P.length ? sp.weights : null;
    const u0 = U[p], u1 = U[P.length];
    const n = Math.min(4000, Math.max(16, (P.length - p) * 32));
    const out = [];
    for (let i = 0; i <= n; i++) {
      const u = i === n ? u1 : u0 + ((u1 - u0) * i) / n;
      let k = p;
      while (k < P.length - 1 && u >= U[k + 1]) k++;
      const d = [];
      for (let j = 0; j <= p; j++) { const q = P[k - p + j], w = W ? W[k - p + j] : 1; d.push([q.x * w, q.y * w, (q.z || 0) * w, w]); }
      for (let r = 1; r <= p; r++) {
        for (let j = p; j >= r; j--) {
          const i0 = k - p + j, den = U[i0 + p - r + 1] - U[i0];
          const a = den ? (u - U[i0]) / den : 0;
          for (let c = 0; c < 4; c++) d[j][c] = (1 - a) * d[j - 1][c] + a * d[j][c];
        }
      }
      const q = d[p];
      out.push([q[0] / q[3], q[1] / q[3], q[2] / q[3]]);
    }
    return out;
  }
  const F = (sp.fit || []).map((q) => [q.x, q.y, q.z || 0]);
  if (F.length === 2) return F;
  if (F.length > 2) return throughFit(F);
  return P.length >= 2 ? P.map((q) => [q.x, q.y, q.z || 0]) : [];
}

/** A smooth curve through fit points (centripetal Catmull–Rom, 8 vertices a span) — for a spline stored only as fit
 *  points (DXF writers may leave out the control points). It passes every fit point, as the spline does. */
function throughFit(F) {
  const out = [F[0]];
  const P = [F[0].map((v, i) => 2 * v - F[1][i]), ...F, F.at(-1).map((v, i) => 2 * v - F.at(-2)[i])];
  const tj = (a, b) => Math.sqrt(Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2])) || 1e-9;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const t1 = tj(p0, p1), t2 = t1 + tj(p1, p2), t3 = t2 + tj(p2, p3);
    for (let k = 1; k <= 8; k++) {
      const u = t1 + ((t2 - t1) * k) / 8;
      const L = (a, b, ta, tb) => a.map((v, j) => ((tb - u) * v + (u - ta) * b[j]) / (tb - ta));
      const A1 = L(p0, p1, 0, t1), A2 = L(p1, p2, t1, t2), A3 = L(p2, p3, t2, t3);
      const B1 = L(A1, A2, 0, t2), B2 = L(A2, A3, t1, t3);
      out.push(L(B1, B2, t1, t2));
    }
  }
  return out;
}

/** One entity → { parts: [[[x,y,z]…]], closed, point? } in its own coordinates (OCS applied by the caller's matrix). */
function shapeOf(e) {
  const P = (q) => [q.x, q.y, q.z || 0];
  switch (e.type) {
    case 'LINE': return { parts: [[P(e.start), P(e.end)]], wcs: true };
    case 'POINT': return { point: P(e.position), wcs: true };
    case 'CIRCLE': { const pts = arcPts(e.center.x, e.center.y, e.radius, 0, 2 * Math.PI, e.center.z || 0); pts.pop(); return { parts: [pts], closed: true }; }
    case 'ARC': return { parts: [arcPts(e.center.x, e.center.y, e.radius, e.startAngle, e.endAngle, e.center.z || 0)] };
    case 'ELLIPSE': {
      const c = e.center, M = e.majorAxis, r = e.ratio;
      const N = ocs(e.extrusion) ? [e.extrusion.x, e.extrusion.y, e.extrusion.z] : [0, 0, 1];
      const L = Math.hypot(...N), n = N.map((v) => v / L);
      const mn = [n[1] * M.z - n[2] * M.y, n[2] * M.x - n[0] * M.z, n[0] * M.y - n[1] * M.x].map((v) => v * r);   // minor axis
      let s0 = e.startParam ?? 0, s1 = e.endParam ?? 2 * Math.PI;
      while (s1 <= s0) s1 += 2 * Math.PI;
      const full = Math.abs(s1 - s0 - 2 * Math.PI) < 1e-9;
      const k = Math.max(4, Math.ceil((s1 - s0) / STEP)), out = [];
      for (let i = 0; i <= k; i++) { const s = s0 + ((s1 - s0) * i) / k; out.push([c.x + M.x * Math.cos(s) + mn[0] * Math.sin(s), c.y + M.y * Math.cos(s) + mn[1] * Math.sin(s), (c.z || 0) + M.z * Math.cos(s) + mn[2] * Math.sin(s)]); }
      if (full) out.pop();
      return { parts: [out], closed: full, wcs: true };
    }
    case 'LWPOLYLINE': {
      const z = e.elevation || 0;
      return { parts: [bulgedPts(e.vertices || [], !!e.closed, () => z)], closed: !!e.closed };
    }
    case 'POLYLINE_2D': {
      const vs = (e.vertices || []).filter((v) => !(v.flags & 16));   // spline frame control points are not on the line
      const z = e.elevation || 0;   // a 2D vertex's own z means nothing (DXF reference): the polyline's elevation
      return { parts: [bulgedPts(vs, !!e.closed, () => z)], closed: !!e.closed };
    }
    case 'POLYLINE_3D': {
      const vs = (e.vertices || []).filter((v) => !(v.flags & 16));
      return { parts: [vs.map(P)], closed: !!e.closed, wcs: true };
    }
    case 'SPLINE': return { parts: [splinePts(e)], closed: !!e.closed, wcs: true };
    case 'SOLID': case 'TRACE': {
      const q = (e.points || []).map((p) => [p.x, p.y, e.elevation || p.z || 0]);
      if (q.length !== 4) return null;
      const ring = [q[0], q[1], q[3], q[2]];   // SOLID order: 1 2 4 3 round the outline
      return { parts: [dedupe(ring)], closed: true };
    }
    case '3DFACE': {
      const q = (e.points || []).map(P);
      return q.length >= 3 ? { parts: [dedupe(q)], closed: true, wcs: true } : null;
    }
    default: return null;
  }
}
function dedupe(r) { const out = []; for (const p of r) { const l = out[out.length - 1]; if (!l || l[0] !== p[0] || l[1] !== p[1] || l[2] !== p[2]) out.push(p); } if (out.length > 1) { const a = out[0], b = out[out.length - 1]; if (a[0] === b[0] && a[1] === b[1] && a[2] === b[2]) out.pop(); } return out; }

const LINEWORK = new Set(['LINE', 'POINT', 'CIRCLE', 'ARC', 'ELLIPSE', 'LWPOLYLINE', 'POLYLINE_2D', 'POLYLINE_3D', 'SPLINE', 'SOLID', 'TRACE', '3DFACE', 'INSERT', 'MINSERT']);

export function cadLinework(model, { file = '', projectUnit = 'ft', scale = null, layers: only = null, skipFeatureLines = false } = {}) {
  const notes = [], skipped = {};
  const header = model?.header || {};
  const us = unitScale(header, projectUnit);
  const k = Number.isFinite(scale) && scale > 0 ? scale : us.scale;
  if (scale == null && us.note) notes.push(us.note);
  const blocks = new Map();
  for (const b of model?.blocks || []) blocks.set(String(b.name).toUpperCase(), b);
  const ms = blocks.get('*MODEL_SPACE');
  if (!ms) return { layers: [], cadLayers: [], skipped, units: cadUnits(header), scale: k, notes: [t('cad.no.model')] };
  const keep = only ? new Set([...only].map(String)) : null;
  const tableLayers = new Map((model.tables?.layers || []).map((l) => [l.name, l]));
  const by = new Map();   // cad layer → { lines: [], polygons: [], points: [] }
  let vertices = 0, depthHit = 0, cut = false;
  const top = [k, 0, 0, 0, 0, k, 0, 0, 0, 0, k, 0];

  const add = (layer, kind, feat) => {
    let b = by.get(layer);
    if (!b) by.set(layer, (b = { lines: [], polygons: [], points: [] }));
    b[kind].push(feat);
  };
  const props = (layer, type, pts) => {
    const z0 = pts[0]?.[2];
    const same = pts.length && pts.every((p) => Math.abs(p[2] - z0) <= 1e-9 * Math.max(1, Math.abs(z0)));
    return { LAYER: layer, TYPE: type, ELEV: same && Number.isFinite(z0) && z0 !== 0 ? z0 : null };
  };
  const shape = (pts) => {
    const flat = pts.every((p) => p[2] === 0 || Math.abs(p[2]) < 1e-12);
    return flat ? pts.map((p) => [p[0], p[1]]) : pts.map((p) => [p[0], p[1], p[2]]);
  };

  function walk(ents, m, inherit, depth) {
    for (const e of ents) {
      if (cut) return;
      if (!e || e.invisible) continue;
      const layer = e.layer === '0' && inherit ? inherit : String(e.layer ?? '0');
      if (!LINEWORK.has(e.type)) { skipped[e.type] = (skipped[e.type] || 0) + 1; continue; }
      if (skipFeatureLines && depth === 0 && isFeatureLine(e)) continue;   // 0.6 WL.24: brought in as feature lines
      if (e.type === 'INSERT' || e.type === 'MINSERT') {
        const b = blocks.get(String(e.block || '').toUpperCase());
        if (!b) { skipped['INSERT_NO_BLOCK'] = (skipped['INSERT_NO_BLOCK'] || 0) + 1; continue; }
        if (b.xrefPath || (b.flags & 4)) { skipped['XREF'] = (skipped['XREF'] || 0) + 1; continue; }
        if (depth >= MAX_DEPTH) { depthHit++; continue; }
        const s = e.scale || { x: 1, y: 1, z: 1 }, r = e.rotation || 0, ins = e.insert || { x: 0, y: 0, z: 0 }, base = b.base || { x: 0, y: 0, z: 0 };
        const cols = e.type === 'MINSERT' ? Math.max(1, Math.min(1000, e.cols | 0 || 1)) : 1, rows = e.type === 'MINSERT' ? Math.max(1, Math.min(1000, e.rows | 0 || 1)) : 1;
        const c = Math.cos(r), sn = Math.sin(r);
        for (let ci = 0; ci < cols; ci++) for (let ri = 0; ri < rows; ri++) {
          // block → (−base) → scale → (+ column/row spacing) → rotate → (+insert) → OCS
          const step = translate(ci * (e.colSpacing || 0), ri * (e.rowSpacing || 0), 0);
          const rot = [c, -sn, 0, 0, sn, c, 0, 0, 0, 0, 1, 0];
          const scl = [s.x ?? 1, 0, 0, 0, 0, s.y ?? 1, 0, 0, 0, 0, s.z ?? 1, 0];
          const M = mul(mul(withOcs(m, e.extrusion), translate(ins.x, ins.y, ins.z || 0)), mul(rot, mul(step, mul(scl, translate(-base.x, -base.y, -(base.z || 0))))));
          walk(b.entities || [], M, layer, depth + 1);
        }
        continue;
      }
      const sh = shapeOf(e);
      if (!sh) { skipped[e.type] = (skipped[e.type] || 0) + 1; continue; }
      const mm = sh.wcs ? m : withOcs(m, e.extrusion);
      if (keep && !keep.has(layer)) continue;
      if (sh.point) {
        const p = apply(mm, ...sh.point);
        if (!p.every(Number.isFinite)) continue;
        add(layer, 'points', { g: { t: 'pt', c: shape([p])[0] }, p: props(layer, e.type, [p]) });
        vertices++;
        continue;
      }
      for (const part of sh.parts) {
        const pts = part.map((q) => apply(mm, q[0], q[1], q[2])).filter((p) => p.every(Number.isFinite));
        if (pts.length < 2 || (sh.closed && pts.length < 3)) continue;
        vertices += pts.length;
        if (vertices > MAX_VERTICES) { cut = true; return; }
        const s2 = shape(pts);
        if (sh.closed) add(layer, 'polygons', { g: { t: 'pg', c: [[[...s2, s2[0]]]] }, p: props(layer, e.type, pts) });
        else add(layer, 'lines', { g: { t: 'ln', c: [s2] }, p: props(layer, e.type, pts) });
      }
    }
  }
  walk(ms.entities || [], top, null, 0);
  if (depthHit) notes.push(t('cad.depth', { n: depthHit, max: MAX_DEPTH }));
  if (cut) notes.push(t('cad.cut', { max: MAX_VERTICES.toLocaleString('en-US') }));
  const skippedN = Object.values(skipped).reduce((a, b) => a + b, 0);
  if (skippedN) notes.push(t('cad.skipped', { n: skippedN, list: Object.entries(skipped).map(([k2, v]) => k2 + ' ' + v).join(', ') }));

  const fields = [{ name: 'LAYER', type: 'text' }, { name: 'TYPE', type: 'text' }, { name: 'ELEV', type: 'number' }];
  const out = [], cadLayers = [];
  const names = [...by.keys()].sort((a, b) => a.localeCompare(b));
  for (const name of names) {
    const b = by.get(name), tl = tableLayers.get(name);
    const hasZ = (fs) => fs.some((f) => (f.g.t === 'pt' ? f.g.c.length > 2 : (f.g.t === 'ln' ? f.g.c : f.g.c.flat()).some((r) => r.some((p) => p.length > 2))));
    const z = hasZ(b.lines) || hasZ(b.polygons) || hasZ(b.points);
    cadLayers.push({ name, on: tl ? tl.on !== false && !tl.off && !tl.frozen : true, frozen: !!tl?.frozen, lines: b.lines.length, polygons: b.polygons.length, points: b.points.length, z });
    const src = { file, format: 'CAD', crs: null };
    const kinds = [['lines', 'ln', ''], ['polygons', 'pg', 'cad.closed'], ['points', 'pt', 'cad.points']].filter(([kk]) => b[kk].length);
    for (const [kk, geom, suffix] of kinds) {
      out.push({ cadLayer: name, name: kinds.length > 1 && suffix ? t(suffix, { layer: name }) : name, geom, hasZ: hasZ(b[kk]), fields, features: b[kk], source: src });
    }
  }
  return { layers: out, cadLayers, skipped, units: cadUnits(header), scale: k, notes };
}
