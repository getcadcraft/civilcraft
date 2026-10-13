/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-layers.js — the GIS layer model of a CivilCraft project (docs/GIS-SPEC.md §2). No DOM; the Node test drives it.
 *
 *   state.gis = { layers: [{ id: 'g1', name, geom: 'pt'|'ln'|'pg', fields: [{name, type}], visible, color, hasZ,
 *                            source: { file, format, crs: name | null } }], maps: [] }   (maps: builder C)
 *   project.gisFeatures: Map(layerId → [{ g, p }]) in project coordinates (gis-geom.js geometry; p = attributes),
 *   outside the undo snapshots; project.editGis(label, fn) is one undo step.
 *
 *   addLayers(project, layers, { label, crs }) → ids      one undo step; `crs` (optional) becomes state.crs in the same step
 *   removeLayer(project, id) · setLayer(project, id, { name, visible, color, label })   undo steps (label: a field name or
 *                                                         null — 0.4 V7: the plan labels each feature with its value)
 *   labelItems(layer, features, mmPerUnit) → scene text items (≤ MAX_LABELS per layer), labelText(value)
 *   transformLayers(project, fn, label)                   every vertex through fn(x, y) → [x, y] (reprojection), one step
 *   moveLayers(project, before, after)                    the project's system changed: layers to where they belong now
 *   layerOf(project, id) · featuresOf(project, id) · layerBounds(features) · gisExtents(project) (visible layers)
 *   pickFeature(project, x, y, tol) → { kind: 'gis', layer, i } | null     top layer first; points and edges within tol,
 *                                                                          else the smallest polygon holding the point
 *   gisScene(project, mmPerUnit) → { layers: [{name, token, label}], items }   scene items for visible layers (layer
 *                                                                          GIS-<id>, points as 1.2 mm squares)
 *   useChoices(layer, features) → [{ use, label, fields? }]               what "Use for the surface" can do with a layer
 *   useForSurface(project, id, { use, field, feature }) → { ok, message }  copies geometry into the project's own
 *     structures as one undo step: 'breaklines' (lines with z, or z from a number field), 'boundary' (a polygon's outer
 *     ring: the given feature, else the largest), 'points' (survey points, description = the layer name)
 *   readGisState, gisFeaturesJSON, LAYER_TOKENS — from gis-state.js (re-exported)
 */

import { bounds, pointInRing, ringArea, mapXY } from './gis-geom.js';
import { renumber } from './clip.js';
import { frame } from './crs.js';
import { LAYER_TOKENS, MAX_LAYERS, clean, readGisState, gisFeaturesJSON } from './gis-state.js';
import { t } from './i18n.js';

const TOKEN_KEY = { blue: 'layers.color.blue', orange: 'layers.color.orange', magenta: 'layers.color.magenta', cyan: 'layers.color.cyan', ochre: 'layers.color.ochre', green: 'layers.color.green', red: 'layers.color.red' };
export const tokenLabel = (token) => (Object.hasOwn(TOKEN_KEY, token) ? t(TOKEN_KEY[token]) : token);
export const MAX_LAYER_FEATURES = 500000;
export { LAYER_TOKENS, readGisState, gisFeaturesJSON };

export const gisOf = (project) => (project.state.gis ||= { layers: [], maps: [] });
export const layerOf = (project, id) => gisOf(project).layers.find((l) => l.id === id) || null;
export const featuresOf = (project, id) => project.gisFeatures.get(id) || [];

export function addLayers(project, layers, { label = t('layers.undo.import'), crs } = {}) {
  const ids = [];
  const ok = project.editGis(label, (map, s) => {
    const g = s.gis ||= { layers: [], maps: [] };
    if (crs !== undefined) s.crs = crs;
    let k = g.layers.length;
    for (const l of layers) {
      if (g.layers.length >= MAX_LAYERS) break;
      const id = 'g' + s.seq++;
      ids.push(id);
      g.layers.push({ id, name: clean(l.name, 120) || t('layers.default'), geom: l.geom, hasZ: !!l.hasZ, fields: (l.fields || []).map((f) => ({ name: f.name, type: f.type })), visible: true, color: LAYER_TOKENS[k++ % LAYER_TOKENS.length], source: { file: clean(l.source?.file, 200), format: clean(l.source?.format, 40), crs: l.source?.crs ? clean(l.source.crs, 200) : null } });
      map.set(id, l.features);
    }
    return map;
  });
  return ok ? ids : [];
}

export function removeLayer(project, id) {
  const l = layerOf(project, id);
  if (!l) return false;
  return project.editGis(t('layers.undo.remove', { layer: l.name }), (map, s) => { s.gis.layers = s.gis.layers.filter((x) => x.id !== id); map.delete(id); return map; });
}
export function setLayer(project, id, patch) {
  const l = layerOf(project, id);
  if (!l) return false;
  if ('label' in patch && patch.label !== null && !l.fields.some((f) => f.name === patch.label)) return false;
  const what = 'label' in patch ? t('gis.label.undo', { layer: l.name }) : 'name' in patch ? t('layers.undo.rename') : 'visible' in patch ? t(patch.visible ? 'layers.undo.show' : 'layers.undo.hide', { layer: l.name }) : t('layers.undo.color');
  return project.change(what, (s) => {
    const x = s.gis.layers.find((q) => q.id === id);
    if ('name' in patch) x.name = clean(patch.name, 120) || x.name;
    if ('visible' in patch) x.visible = !!patch.visible;
    if ('color' in patch && LAYER_TOKENS.includes(patch.color)) x.color = patch.color;
    if ('label' in patch) { if (patch.label === null) delete x.label; else x.label = { field: patch.label }; }   // 0.4 V7
  });
}
export function transformLayers(project, fn, label = t('layers.undo.move')) {
  return project.editGis(label, (map) => { for (const [id, fs] of map) map.set(id, fs.map((f) => ({ g: mapXY(f.g, fn), p: f.p }))); return map; });
}
/** The project's system changed from `before` to `after` (state.crs shapes): move every layer from where it belongs under
 *  `before` to where it belongs under `after` (project → grid of before → after's grid → after's project). One step. */
export function moveLayers(project, before, after) {
  const fb = frame(before), fa = frame(after), tf = fb.to(after);
  return transformLayers(project, (x, y) => { const g = tf(x, y); return fa.fromGrid(g[0], g[1]); }, t('layers.undo.moveto', { crs: after.name }));
}

// ---------------------------------------------------------------- bounds and picking (cached per features array)
const BOX = new WeakMap();
function boxes(features) {
  let b = BOX.get(features);
  if (b) return b;
  b = new Float64Array(features.length * 4);
  features.forEach((f, i) => { const q = bounds(f.g); b[i * 4] = q.minX; b[i * 4 + 1] = q.minY; b[i * 4 + 2] = q.maxX; b[i * 4 + 3] = q.maxY; });
  BOX.set(features, b);
  return b;
}
export function layerBounds(features) {
  const b = boxes(features), out = { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
  for (let i = 0; i < features.length; i++) {
    if (!Number.isFinite(b[i * 4])) continue;
    out.minX = Math.min(out.minX, b[i * 4]); out.minY = Math.min(out.minY, b[i * 4 + 1]); out.maxX = Math.max(out.maxX, b[i * 4 + 2]); out.maxY = Math.max(out.maxY, b[i * 4 + 3]);
  }
  return Number.isFinite(out.minX) ? out : null;
}
export function gisExtents(project) {
  let out = null;
  for (const l of gisOf(project).layers) {
    if (!l.visible) continue;
    const b = layerBounds(featuresOf(project, l.id));
    if (!b) continue;
    out = out ? { minX: Math.min(out.minX, b.minX), minY: Math.min(out.minY, b.minY), maxX: Math.max(out.maxX, b.maxX), maxY: Math.max(out.maxY, b.maxY) } : { ...b };
  }
  return out;
}
function segDist(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
  const t = L ? Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / L)) : 0;
  return Math.hypot(px - a[0] - dx * t, py - a[1] - dy * t);
}
export function pickFeature(project, x, y, tol) {
  // a point within tol wins (the nearest), then a line or polygon edge within tol (top layer first, nearest in it), then
  // the smallest polygon holding the spot
  const layers = gisOf(project).layers;
  let inside = null, pt = null, edge = null;
  for (let li = layers.length - 1; li >= 0; li--) {
    const l = layers[li];
    if (!l.visible) continue;
    const fs = featuresOf(project, l.id), b = boxes(fs);
    let best = null, bd = tol;
    for (let i = 0; i < fs.length; i++) {
      if (x < b[i * 4] - tol || x > b[i * 4 + 2] + tol || y < b[i * 4 + 1] - tol || y > b[i * 4 + 3] + tol) continue;
      const g = fs[i].g;
      if (!g) continue;
      if (g.t === 'pt') { const d = Math.hypot(g.c[0] - x, g.c[1] - y); if (d <= tol && (!pt || d < pt.d)) pt = { layer: l.id, i, d }; continue; }
      let hit = false;
      const rings = g.t === 'ln' ? g.c : g.c.flat();
      for (const r of rings) for (let k = 1; k < r.length; k++) { const d = segDist(x, y, r[k - 1], r[k]); if (d <= bd) { bd = d; best = i; hit = true; } }
      if (g.t === 'pg' && !hit) {
        for (const poly of g.c) {
          if (!pointInRing(x, y, poly[0]) || poly.slice(1).some((h) => pointInRing(x, y, h))) continue;
          const a = Math.abs(ringArea(poly[0]));
          if (!inside || a < inside.a) inside = { layer: l.id, i, a };
        }
      }
    }
    if (best !== null && !edge) edge = { layer: l.id, i: best };
  }
  const h = pt || edge || inside;
  return h ? { kind: 'gis', layer: h.layer, i: h.i } : null;
}

// ---------------------------------------------------------------- the plan scene
const XY = new WeakMap();
const toXY = (r) => r.map((p) => (p.length > 2 ? { x: p[0], y: p[1], z: p[2] } : { x: p[0], y: p[1] }));
export function gisScene(project, mmPerUnit) {
  const layers = [], items = [];
  const h = 0.6 / mmPerUnit;   // points: squares 1.2 mm across on paper
  for (const l of gisOf(project).layers) {
    if (!l.visible) continue;
    const name = 'GIS-' + l.id;
    layers.push({ name, token: l.color, aci: 7, label: l.name });
    const fs = featuresOf(project, l.id);
    if (l.geom === 'pt') {
      for (const f of fs) { if (!f.g) continue; const [x, y] = f.g.c; items.push({ layer: name, kind: 'poly', pts: [{ x: x - h, y: y - h }, { x: x + h, y: y - h }, { x: x + h, y: y + h }, { x: x - h, y: y + h }], closed: true }); }
      if (l.label?.field) for (const it of labelItems(l, fs, mmPerUnit)) items.push({ ...it, layer: name });   // 0.4 V7
      continue;
    }
    let cached = XY.get(fs);
    if (!cached) {
      cached = [];
      for (const f of fs) {
        if (!f.g) continue;
        if (f.g.t === 'ln') for (const part of f.g.c) cached.push({ layer: name, kind: 'poly', pts: toXY(part), z: l.hasZ && part.every((p) => p.length > 2) });
        else if (f.g.t === 'pg') for (const poly of f.g.c) for (const r of poly) cached.push({ layer: name, kind: 'poly', pts: toXY(r.slice(0, -1)), closed: true, z: l.hasZ && r.every((p) => p.length > 2) });
      }
      XY.set(fs, cached);
    }
    for (const it of cached) items.push(it.layer === name ? it : { ...it, layer: name });
    if (l.label?.field) for (const it of labelItems(l, fs, mmPerUnit)) items.push(it.layer === name ? it : { ...it, layer: name });   // 0.4 V7
  }
  return { layers, items };
}

// ---------------------------------------------------------------- labels from an attribute (0.4 V7)
export const MAX_LABELS = 5000;
export function labelText(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') return Number.isFinite(v) ? String(+v.toFixed(3)) : '';
  if (typeof v === 'boolean') return v ? t('gis.label.yes') : t('gis.label.no');
  return String(v).replace(/\s+/g, ' ').trim().slice(0, 80);
}
const LABELS = new WeakMap();   // features array → Map(field|mm → items)
/** Text items for a layer's label field: a point's label beside it, a line's along its longest part (upright), a polygon's
 *  at the centre of its largest ring (or on its outline when the centre falls outside). 1.8 mm text on paper. */
export function labelItems(layer, features, mmPerUnit) {
  const field = layer.label?.field;
  if (!field) return [];
  let byKey = LABELS.get(features);
  if (!byKey) LABELS.set(features, (byKey = new Map()));
  const key = field + '|' + mmPerUnit;
  if (byKey.has(key)) return byKey.get(key);
  const u = 1 / mmPerUnit, out = [];
  for (const f of features) {
    if (out.length >= MAX_LABELS) break;
    const text = labelText(f.p?.[field]);
    if (!text || !f.g) continue;
    const g = f.g;
    if (g.t === 'pt') { out.push({ kind: 'text', x: g.c[0] + 1.2 * u, y: g.c[1] + 0.6 * u, rot: 0, mm: 1.8, align: 'left', middle: true, text, mask: true }); continue; }
    if (g.t === 'ln') {
      let best = null, bl = -1;
      for (const part of g.c) { let L = 0; for (let i = 1; i < part.length; i++) L += Math.hypot(part[i][0] - part[i - 1][0], part[i][1] - part[i - 1][1]); if (L > bl) { bl = L; best = part; } }
      if (!best || best.length < 2) continue;
      let half = bl / 2, i = 1;
      for (; i < best.length; i++) { const d = Math.hypot(best[i][0] - best[i - 1][0], best[i][1] - best[i - 1][1]); if (half <= d) break; half -= d; }
      const a = best[Math.min(i, best.length - 1) - 1], b = best[Math.min(i, best.length - 1)], d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      let rot = Math.atan2(b[1] - a[1], b[0] - a[0]);
      if (Math.cos(rot) < -1e-9) rot += Math.PI;   // upright
      if (rot > Math.PI) rot -= 2 * Math.PI;
      const x = a[0] + ((b[0] - a[0]) * half) / d, y = a[1] + ((b[1] - a[1]) * half) / d;
      out.push({ kind: 'text', x: x - Math.sin(rot) * 1.4 * u, y: y + Math.cos(rot) * 1.4 * u, rot, mm: 1.8, align: 'center', middle: true, text, mask: true });
      continue;
    }
    if (g.t === 'pg') {
      let ring = null, ba = -1;
      for (const poly of g.c) { const A = Math.abs(ringArea(poly[0])); if (A > ba) { ba = A; ring = poly[0]; } }
      if (!ring) continue;
      let cx = 0, cy = 0, A2 = 0;
      for (let k = 0; k + 1 < ring.length; k++) { const c = ring[k][0] * ring[k + 1][1] - ring[k + 1][0] * ring[k][1]; A2 += c; cx += (ring[k][0] + ring[k + 1][0]) * c; cy += (ring[k][1] + ring[k + 1][1]) * c; }
      if (Math.abs(A2) > 1e-12) { cx /= 3 * A2; cy /= 3 * A2; } else { cx = ring[0][0]; cy = ring[0][1]; }
      if (!pointInRing(cx, cy, ring)) { cx = ring[0][0]; cy = ring[0][1]; }
      out.push({ kind: 'text', x: cx, y: cy, rot: 0, mm: 1.8, align: 'center', middle: true, text, mask: true });
    }
  }
  byKey.set(key, out);
  return out;
}

// ---------------------------------------------------------------- use for the surface
const numFields = (layer) => layer.fields.filter((f) => f.type === 'number').map((f) => f.name);
const zOf = (g) => { const out = []; const add = (p) => { if (p.length > 2) out.push(p[2]); }; if (!g) return out; if (g.t === 'pt') add(g.c); else if (g.t === 'ln') g.c.forEach((q) => q.forEach(add)); else g.c.forEach((poly) => poly.forEach((r) => r.forEach(add))); return out; };
export function useChoices(layer, features) {
  const out = [], nf = numFields(layer);
  const withZ = features.some((f) => zOf(f.g).length);
  if (layer.geom === 'ln') {
    if (withZ) out.push({ use: 'breaklines', from: 'z', label: t('layers.use.brk.z') });
    if (nf.length) out.push({ use: 'breaklines', from: 'field', fields: nf, label: t('layers.use.brk.field') });
  } else if (layer.geom === 'pg') {
    out.push({ use: 'boundary', label: t('layers.use.boundary') });
    if (withZ) out.push({ use: 'breaklines', from: 'z', label: t('layers.use.pgbrk.z') });
    if (nf.length) out.push({ use: 'breaklines', from: 'field', fields: nf, label: t('layers.use.pgbrk.field') });
  } else {
    if (withZ) out.push({ use: 'points', from: 'z', label: t('layers.use.pts.z') });
    if (nf.length) out.push({ use: 'points', from: 'field', fields: nf, label: t('layers.use.pts.field') });
  }
  return out;
}

export function useForSurface(project, id, { use, from = 'z', field = null, feature = null } = {}) {
  const l = layerOf(project, id);
  if (!l) return { ok: false, message: t('layers.use.gone') };
  const fs = featuresOf(project, id);
  const zFrom = (f) => (from === 'field' ? (typeof f.p[field] === 'number' && Number.isFinite(f.p[field]) ? f.p[field] : null) : undefined);
  if (from === 'field' && !l.fields.some((f) => f.name === field && f.type === 'number')) return { ok: false, message: t('layers.use.nofield') };
  if (use === 'breaklines') {
    const lines = []; let skipped = 0;
    for (const f of fs) {
      if (!f.g || f.g.t === 'pt') continue;
      const z = zFrom(f);
      const parts = f.g.t === 'ln' ? f.g.c : f.g.c.flat();
      for (const part of parts) {
        const pts = part.map((p) => ({ x: p[0], y: p[1], z: z === undefined ? (p.length > 2 ? p[2] : null) : z }));
        if (pts.length < 2 || pts.some((p) => p.z === null || !Number.isFinite(p.z))) { skipped++; continue; }
        lines.push(pts);
      }
    }
    if (!lines.length) return { ok: false, message: from === 'field' ? t('layers.use.noline.field', { layer: l.name, field }) : t('layers.use.noline', { layer: l.name }) };
    const n0 = project.state.surface.breaklines.length;
    project.change(t('layers.undo.brk', { layer: l.name }), (s) => { lines.forEach((pts, i) => s.surface.breaklines.push({ name: (l.name + ' ' + (i + 1)).slice(0, 120), pts })); });
    const verts = lines.reduce((s, q) => s + q.length, 0);
    return { ok: true, count: lines.length, message: (n0 ? t('layers.use.brk.added.more', { n: lines.length, verts, layer: l.name, before: n0 }) : t('layers.use.brk.added', { n: lines.length, verts, layer: l.name })) + (skipped ? ' ' + t('layers.use.brk.skipped', { n: skipped }) : '') + (project.state.surface.tin ? ' ' + t('layers.use.tin') : '') };
  }
  if (use === 'boundary') {
    let best = null;
    const cand = feature !== null && fs[feature]?.g?.t === 'pg' ? [fs[feature]] : fs;
    for (const f of cand) { if (f.g?.t !== 'pg') continue; for (const poly of f.g.c) { const a = Math.abs(ringArea(poly[0])); if (!best || a > best.a) best = { a, r: poly[0] }; } }
    if (!best) return { ok: false, message: t('layers.use.nopoly', { layer: l.name }) };
    const pts = best.r.slice(0, -1).map((p) => ({ x: p[0], y: p[1] }));
    project.change(t('layers.undo.boundary', { layer: l.name }), (s) => { s.surface.boundary = pts; });
    return { ok: true, count: 1, message: t(feature !== null ? 'layers.use.boundary.selected' : 'layers.use.boundary.largest', { layer: l.name, n: pts.length }) };
  }
  if (use === 'points') {
    const pts = []; let skipped = 0;
    for (const f of fs) {
      if (f.g?.t !== 'pt') continue;
      const z = zFrom(f), zz = z === undefined ? (f.g.c.length > 2 ? f.g.c[2] : null) : z;
      if (zz === null || !Number.isFinite(zz)) { skipped++; continue; }
      pts.push({ n: '0', x: f.g.c[0], y: f.g.c[1], z: zz, d: l.name.slice(0, 200) });
    }
    if (!pts.length) return { ok: false, message: from === 'field' ? t('layers.use.nopoint.field', { layer: l.name, field }) : t('layers.use.nopoint', { layer: l.name }) };
    const r = renumber(pts, project.points, { mode: 'always' });
    project.editPoints(t('layers.undo.pts', { layer: l.name }), (all) => all.concat(r.points));
    const nums = r.points.map((p) => p.n);
    return { ok: true, count: pts.length, message: t('layers.use.pts.added', { n: pts.length, layer: l.name, first: nums[0], last: nums[nums.length - 1] }) + (skipped ? ' ' + t('layers.use.pts.skipped', { n: skipped }) : '') + (project.state.surface.tin ? ' ' + t('layers.use.tin') : '') };
  }
  return { ok: false, message: 'Unknown use.' };   // i18n-ignore: developer error (the page only offers useChoices)
}

