/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail-clearance.js — a railway's clearance envelope along its alignment (CV.1, 2026-11-12): a structure gauge (an outline in the
 * section) tilted with the cant, widened on curves, swept from station to station, and checked against what stands beside the
 * track. No DOM, no imports from rail.js (rail.js cleans these settings). Tested by bin/test-civilcraft-railline.mjs.
 * The outlines here are PLACEHOLDERS, not any railway's gauge: the person types their railway's own outline.
 *
 * Published maths (turnout.js header): on a curve of radius R a vehicle of length L on bogie centres b throws its middle inward by
 * b² / 8R and its ends outward by (L² − b²) / 8R. The cant E over the rail-centre distance G tilts the section by asin(E / G) about
 * the low rail.
 *
 *   OUTLINES            placeholder outlines { key: [{o, z}] } in METRES: o right of the track centre, z above the top of rail
 *   cleanClearance(o)   → { on, outline (OUTLINES key | 'custom'), points [{o,z}] (custom, metres), length, bogie (metres), step (project units, 0 = auto),
 *                           platform: { side 'L'|'R'|'', offset (m from the track centre), height (m above rail) } } | null
 *   outlineOf(cl)       → [{o, z}] metres
 *   envelopeOn({ outline, hL, hR (mm), base (mm), kappa (1/m, + = turning left), length, bogie }) → { poly [{o,z}] metres, left, right (the furthest reach each side, m, positive), top, inside, outside }
 *   sweep(al, cl, { units, base, cantAt: (sta) → { L, R } mm, curvatureAt: (sta) → 1/project unit, tracks: [centre offsets], step }) →
 *     [{ sta, x, y, dir, polys: [[{o,z}] project units, one per track, o from the ALIGNMENT], left, right (project units from the alignment), top }]
 *   envelopeEdges(sweepRows) → { left: [{x,y}], right: [{x,y}] }   the envelope's plan outline
 *   check(al, rows, { obstacles: [{ id, name, kind, pts: [{x, y, z | null}] }], zAt: (sta) → top of rail | null, tracks, centres, platform, units, id, name, t }) →
 *     { warnings (Problems shape: rail.clear.hit, rail.clear.track, rail.clear.spacing, rail.clear.platform), hits: [{ id, kind, sta, off, z, plan }],
 *       spacing: { need (the least centres at which two neighbouring envelopes clear, at the worst station), have, sta } | null, platform: { gap, sta } | null }
 *   otherTrackObstacles(alignments) → obstacles from other railway alignments' centrelines (their own envelope half-width as `reach`)
 */

import { t as tr } from './i18n.js';
import { overlap, minSpacing } from './turnout.js';
import { LAYERS } from './scene.js';

if (!LAYERS.some((l) => l.name === 'C-RAIL-CLRN')) LAYERS.push({ name: 'C-RAIL-CLRN', token: 'cyan', aci: 4, get label() { return tr('scene.layer.railclrn'); } });

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const M_PER_FT = 1200 / 3937;
const K = (units) => (units === 'm' ? 1 : M_PER_FT);   // metres per project unit

// Two placeholder shapes (not a standard's gauge): a plain box, and a box with a stepped foot and chamfered roof.
export const OUTLINES = {
  box: [{ o: -1.7, z: 0.2 }, { o: 1.7, z: 0.2 }, { o: 1.7, z: 4.3 }, { o: -1.7, z: 4.3 }],
  shaped: [{ o: -1.25, z: 0.13 }, { o: 1.25, z: 0.13 }, { o: 1.25, z: 0.4 }, { o: 1.65, z: 0.4 }, { o: 1.65, z: 3.5 }, { o: 1.1, z: 4.35 }, { o: -1.1, z: 4.35 }, { o: -1.65, z: 3.5 }, { o: -1.65, z: 0.4 }, { o: -1.25, z: 0.4 }],
};

export function cleanClearance(o) {
  if (!o || typeof o !== 'object') return null;
  const N = (v, d, lo, hi) => (fin(v) && v >= lo && v <= hi ? v : d);
  const pts = (Array.isArray(o.points) ? o.points : []).slice(0, 60).filter((p) => fin(p?.o) && fin(p?.z) && Math.abs(p.o) <= 10 && p.z >= -2 && p.z <= 15).map((p) => ({ o: p.o, z: p.z }));
  const pf = o.platform && typeof o.platform === 'object' ? o.platform : {};
  const outline = o.outline === 'custom' && pts.length >= 3 ? 'custom' : Object.hasOwn(OUTLINES, o.outline) ? o.outline : 'box';
  return { on: o.on === true, outline, points: pts, length: N(o.length, 20, 0, 60), bogie: N(o.bogie, 14, 0, 50), step: N(o.step, 0, 0, 1000),
    platform: { side: pf.side === 'L' || pf.side === 'R' ? pf.side : '', offset: N(pf.offset, 1.75, 0.5, 6), height: N(pf.height, 0.76, 0, 2) } };
}
export const outlineOf = (cl) => (cl?.outline === 'custom' && cl.points?.length >= 3 ? cl.points : OUTLINES[cl?.outline] || OUTLINES.box);

export function envelopeOn({ outline, hL = 0, hR = 0, base = 1500, kappa = 0, length = 0, bogie = 0 }) {
  const b = base / 1000, d = (hR - hL) / 1000, a = Math.asin(Math.max(-1, Math.min(1, d / b)));   // + = the right rail higher: the section turns counter-clockwise seen up-station
  const pivot = d >= 0 ? -b / 2 : b / 2, cos = Math.cos(a), sin = Math.sin(a);   // the low rail stays
  const R = Math.abs(kappa) > 1e-12 ? 1 / Math.abs(kappa) : Infinity, bb = Math.min(bogie, length);
  const inside = Number.isFinite(R) && length > 0 ? (bb * bb) / (8 * R) : 0, outside = Number.isFinite(R) && length > 0 ? (length * length - bb * bb) / (8 * R) : 0;
  const inSign = kappa > 0 ? -1 : 1;   // turning left: the inside of the curve is the left (o < 0)
  const poly = outline.map((p) => {
    const dx = p.o - pivot, o = pivot + dx * cos - p.z * sin, z = dx * sin + p.z * cos;
    const shift = !Number.isFinite(R) || p.o === 0 ? 0 : Math.sign(p.o) === inSign ? inSign * inside : -inSign * outside;
    return { o: o + shift, z };
  });
  let left = 0, right = 0, top = 0; for (const p of poly) { left = Math.max(left, -p.o); right = Math.max(right, p.o); top = Math.max(top, p.z); }
  return { poly, left, right, top, inside, outside, tilt: a };
}

export function sweep(al, cl, { units = 'm', base = 1500, cantAt = () => ({ L: 0, R: 0 }), curvatureAt = () => 0, tracks = [0], step = 0 } = {}) {
  if (!al?.ok || !cl) return [];
  const k = K(units), outline = outlineOf(cl), st = step > 0 ? step : cl.step > 0 ? cl.step : Math.max(al.length / 400, 5 / k);
  const stas = new Set([al.start, al.end]);
  for (let s = Math.ceil(al.start / st) * st; s < al.end; s += st) stas.add(Number(s.toFixed(6)));
  for (const q of al.keyStations?.() || []) stas.add(q.sta);
  return [...stas].sort((a, b) => a - b).map((sta) => {
    const p = al.pointAt(sta), h = cantAt(sta) || { L: 0, R: 0 };
    const e = envelopeOn({ outline, hL: h.L || 0, hR: h.R || 0, base, kappa: curvatureAt(sta) / k, length: cl.length, bogie: cl.bogie });
    const polys = tracks.map((c) => e.poly.map((q) => ({ o: c + q.o / k, z: q.z / k })));
    return { sta, x: p.x, y: p.y, dir: p.dir, polys, left: e.left / k - Math.min(...tracks), right: e.right / k + Math.max(...tracks), top: e.top / k, one: { left: e.left / k, right: e.right / k }, centres: tracks };
  });
}

/** The envelope's two plan edges (offsets right of the alignment are to the right of its direction). */
export function envelopeEdges(rows) {
  const at = (r, o) => ({ x: r.x + Math.sin(r.dir) * o, y: r.y - Math.cos(r.dir) * o });
  return { left: rows.map((r) => at(r, -r.left)), right: rows.map((r) => at(r, r.right)) };
}

/** Plan items: the envelope's two edges (C-RAIL-CLRN, dashed) and a small cross at each clash. */
export function clearanceSceneItems(res, { unitPerMm = 1 } = {}) {
  if (!res?.rows?.length) return [];
  const e = envelopeEdges(res.rows), out = [{ layer: 'C-RAIL-CLRN', kind: 'poly', dashed: true, pts: e.left }, { layer: 'C-RAIL-CLRN', kind: 'poly', dashed: true, pts: e.right }];
  const d = 1.5 * unitPerMm;
  for (const h of res.hits || []) { const r = rowAt(res.rows, h.sta), x = r.x + Math.sin(r.dir) * h.off, y = r.y - Math.cos(r.dir) * h.off; out.push({ layer: 'C-RAIL-CLRN', kind: 'poly', pts: [{ x: x - d, y: y - d }, { x: x + d, y: y + d }] }, { layer: 'C-RAIL-CLRN', kind: 'poly', pts: [{ x: x - d, y: y + d }, { x: x + d, y: y - d }] }); }
  return out;
}

const rowAt = (rows, sta) => { let best = null; for (const r of rows) if (!best || Math.abs(r.sta - sta) < Math.abs(best.sta - sta)) best = r; return best; };
const pip = (p, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) if ((poly[i].z > p.z) !== (poly[j].z > p.z) && p.o < ((poly[j].o - poly[i].o) * (p.z - poly[i].z)) / (poly[j].z - poly[i].z) + poly[i].o) c = !c; return c; };

export function check(al, rows, { obstacles = [], zAt = () => null, centres = 0, platform = null, units = 'm', id = '', name = '', t = tr } = {}) {
  const warnings = [], hits = [], U = units === 'm' ? 'm' : 'ft', k = K(units);
  if (!al?.ok || !rows?.length) return { warnings, hits, spacing: null, platform: null };
  const n0 = (x) => String(Math.round(x)), n2 = (x) => String(Math.round(x * 100) / 100);
  const warn = (code, severity, part, vars, extra = {}) => {
    const msg = { key: code, vars: { name, ...vars } };
    warnings.push({ code, severity, text: t(code, msg.vars), hard: false, msg, ref: id, about: { kind: 'alignment', id }, part, ...extra });
  };
  // ---- things beside the track: a point is inside the envelope when, at its station, its offset and height fall in a track's polygon
  //      (no height known: its offset inside the envelope's width). `reach` widens it (another track's own half envelope).
  for (const ob of obstacles) {
    let worst = null;
    const pts = ob.pts || [], dense = [];
    for (let i = 0; i < pts.length; i++) { dense.push(pts[i]); const b = pts[i + 1]; if (b) { const a = pts[i], n = Math.min(200, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / Math.max(al.length / 400, 1e-6))); for (let j = 1; j < n; j++) dense.push({ x: a.x + ((b.x - a.x) * j) / n, y: a.y + ((b.y - a.y) * j) / n, z: fin(a.z) && fin(b.z) ? a.z + ((b.z - a.z) * j) / n : null }); } }
    for (const p of dense) {
      const so = al.stationOffset(p.x, p.y); if (!so || so.outside) continue;
      const r = rowAt(rows, so.sta), reach = ob.reach || 0, tor = zAt(so.sta);
      let inside;
      if (fin(p.z) && fin(tor) && !reach) inside = r.polys.some((poly) => pip({ o: so.off, z: p.z - tor }, poly));
      else inside = so.off > -(r.left + reach) && so.off < r.right + reach;
      if (!inside) continue;
      const depth = Math.min(so.off + r.left + reach, r.right + reach - so.off);
      if (!worst || depth > worst.depth) worst = { id: ob.id, kind: ob.kind, name: ob.name, sta: so.sta, off: so.off, z: fin(p.z) ? p.z : null, depth, plan: !(fin(p.z) && fin(tor) && !reach) };
    }
    if (worst) { hits.push(worst); warn(worst.kind === 'track' ? 'rail.clear.track' : 'rail.clear.hit', 'warning', 'cl-' + ob.kind + '-' + ob.id, { what: ob.name || ob.id, sta: n0(worst.sta), off: n2(Math.abs(worst.off)), u: U }, { value: Math.abs(worst.off), unit: U }); }
  }
  // ---- this alignment's own tracks: neighbouring envelopes must not overlap anywhere
  let spacing = null;
  const nT = rows[0].polys.length;
  if (nT > 1 && centres > 0) {
    // the least centres at which two neighbours' envelopes just clear, at the worst station (tilted outlines nest, so this is less than
    // the sum of their reaches); stations with the same outline are worked once
    let need = 0, at = rows[0].sta; const seen = new Map();
    for (const r of rows) { const c0 = r.centres[0], P0 = r.polys[0].map((q) => ({ o: q.o - c0, z: q.z })), key = P0.map((q) => q.o.toFixed(5) + ',' + q.z.toFixed(5)).join(';');
      let w = seen.get(key); if (w === undefined) { w = minSpacing(P0, P0, 3 * (r.one.left + r.one.right) + 1); seen.set(key, w); }
      if (w > need) { need = w; at = r.sta; } }
    spacing = { need, have: centres, sta: at };
    const clash = rows.find((r) => r.polys.some((p, i) => i && overlap(r.polys[i - 1], p)));
    if (clash) warn('rail.clear.spacing', 'warning', 'cl-spacing', { have: n2(centres), need: n2(need), sta: n0(clash.sta), u: U }, { limit: need, value: centres, unit: U });
  }
  // ---- a platform edge: the corner at (offset, height) from the nearest track's centre must stay outside the envelope
  let pf = null;
  if (platform?.side) {
    const sg = platform.side === 'R' ? 1 : -1; let gap = Infinity, at = rows[0].sta;
    for (const r of rows) {
      const poly = sg > 0 ? r.polys[r.polys.length - 1] : r.polys[0];   // the outermost track's polygon on that side; its reach at and below the platform's height
      const h = platform.height / k; let reach = -Infinity;
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; for (const q of [a, b]) if (q.z <= h + 1e-9) reach = Math.max(reach, sg * q.o); if ((a.z - h) * (b.z - h) < 0) reach = Math.max(reach, sg * (a.o + ((b.o - a.o) * (h - a.z)) / (b.z - a.z))); }
      const centre = sg > 0 ? Math.max(...r.polys.map((_, i) => trackCentre(r, i))) : Math.min(...r.polys.map((_, i) => trackCentre(r, i)));
      const edge = sg * centre + platform.offset / k, g = edge - reach;
      if (g < gap) { gap = g; at = r.sta; }
    }
    pf = { gap, sta: at };
    if (gap < -1e-9) warn('rail.clear.platform', 'warning', 'cl-platform', { by: n2(-gap), sta: n0(at), u: U }, { value: gap, unit: U });
  }
  return { warnings, hits, spacing, platform: pf };
}
// a track's centre offset in a sweep row: stored when swept
function trackCentre(r, i) { return r.centres ? r.centres[i] : 0; }

/** Other railway alignments as obstacles: their centreline, widened by their own half envelope (`reach`, project units). */
export function otherTrackObstacles(list) {
  return (list || []).map((x) => ({ id: x.id, name: x.name, kind: 'track', reach: x.reach || 0, pts: x.pts.map((p) => ({ x: p.x, y: p.y, z: null })) }));
}
