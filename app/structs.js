/* SPDX-License-Identifier: Apache-2.0 */
/**
 * structs.js — the structure builder (0.6 WL.27): pipe-network structures made from parameters, kept as types in the
 * network and saved as CadCraft library items (docs/LIBRARY-SPEC.md, format 1). No DOM; the Node test drives it
 * (bin/test-civilcraft-structs.mjs).
 *
 * A type: { id 'u<n>', name, kind manhole|inlet|junction|outlet, shape round|rect,
 *           dia (round, inside) | w, l (rect, inside: across and along) — in the network's diameter unit (in | mm),
 *           wall (thickness, same unit), base (floor slab, same unit), sump (default sump depth, project units),
 *           depth (a typical rim-to-floor depth for the library item's body, project units),
 *           frame: { shape round|rect, dia | w, l, h (frame and cover height) — diameter unit } }
 * net.types = [type]; a structure may carry `type` (an id). Assigning a type sets the structure's `dia` (round: the
 * inside diameter; rect: the inside width) and its sumpDepth; a rectangular one is drawn and written as a rectangle.
 *
 *   KINDS, SHAPES, MAX_TYPES · typeDefaults(units, shape) · cleanType(o, units) → type | null (untrusted)
 *   typeOf(s, net) → type | null · structGeom(s, net, units) → { shape, inW, inL, outW, outL, wall, frame } (project
 *       units; a structure without a type: round, inside = dia, no wall) · applyType(s, type) → structure
 *   typeWords(type, units) → '48" round manhole, 5" wall' (a one-line summary)
 *   typePlan(type, units) → { layers, entities } in mm (library plan shapes: outside wall = the heavy outline on STRUCTURE,
 *       inside wall on STRUCTURE-DETAIL, the frame opening on FRAME; centre at 0, 0; a rectangle runs along X)
 *   typeItem(type, units) → a library item without uuid/version/license/provenance (the library fills those): kind
 *       fixture, category other/other (there is no drainage category yet), ifc IfcDistributionChamberElement
 *       (MANHOLE | INSPECTIONCHAMBER | SUMP | …), body = the outside shape from the floor slab's underside up to the rim
 *       at z 0 (the item's insertion point is the rim's centre), params width/depth/height, source_attrs CC-STRUCT-* =
 *       every parameter in mm at full precision, so CivilCraft reads its own items back exactly
 *   typeFromItem(item, units) → { type | null, why } — a library item made by CivilCraft (its CC-STRUCT-* attributes),
 *       converted to the project's units
 */

import { t } from './i18n.js';

export const KINDS = ['manhole', 'inlet', 'junction', 'outlet'];
export const SHAPES = ['round', 'rect'];
export const MAX_TYPES = 200;
const PREDEFINED = { manhole: 'MANHOLE', inlet: 'SUMP', junction: 'INSPECTIONCHAMBER', outlet: 'USERDEFINED' };
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const per = (units) => (units === 'm' ? 1000 : 12);   // diameter units per project unit
const mmPerDia = (units) => (units === 'm' ? 1 : 25.4);
const mmPerUnit = (units) => (units === 'm' ? 1000 : 1200000 / 3937);   // US survey foot

export function typeDefaults(units = 'ft', shape = 'round') {
  const m = units === 'm';
  const base = { name: '', kind: 'manhole', shape, wall: m ? 125 : 5, base: m ? 150 : 6, sump: 0, depth: m ? 2 : 6 };
  return shape === 'rect'
    ? { ...base, kind: 'inlet', w: m ? 900 : 36, l: m ? 1200 : 48, frame: { shape: 'rect', w: m ? 600 : 24, l: m ? 900 : 36, h: m ? 150 : 6 } }
    : { ...base, dia: m ? 1200 : 48, frame: { shape: 'round', dia: m ? 600 : 24, h: m ? 150 : 6 } };
}

const pos = (v, max) => fin(v) && v > 0 && v < max;
/** A type from the project file or a library item: every field checked, sizes in range; null when unusable. */
export function cleanType(o, units = 'ft') {
  if (!o || typeof o !== 'object') return null;
  const shape = SHAPES.includes(o.shape) ? o.shape : 'round', d = typeDefaults(units, shape);
  const big = units === 'm' ? 20000 : 800, small = units === 'm' ? 2000 : 80;   // diameter units
  const out = {
    id: /^u\d{1,9}$/.test(String(o.id)) ? String(o.id) : null,
    name: String(o.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80),
    kind: KINDS.includes(o.kind) ? o.kind : d.kind,
    shape,
    wall: fin(o.wall) && o.wall >= 0 && o.wall < small ? o.wall : d.wall,
    base: fin(o.base) && o.base >= 0 && o.base < small ? o.base : d.base,
    sump: fin(o.sump) && o.sump >= 0 && o.sump < 100 ? o.sump : d.sump,
    depth: pos(o.depth, 200) ? o.depth : d.depth,
  };
  if (shape === 'round') { if (!pos(o.dia, big)) return null; out.dia = o.dia; }
  else { if (!pos(o.w, big) || !pos(o.l, big)) return null; out.w = o.w; out.l = o.l; }
  const f = o.frame && typeof o.frame === 'object' ? o.frame : null;
  if (f) {
    const fs = SHAPES.includes(f.shape) ? f.shape : 'round', fr = { shape: fs, h: fin(f.h) && f.h >= 0 && f.h < small ? f.h : d.frame.h };
    if (fs === 'round' && pos(f.dia, big)) out.frame = { ...fr, dia: f.dia };
    else if (fs === 'rect' && pos(f.w, big) && pos(f.l, big)) out.frame = { ...fr, w: f.w, l: f.l };
  }
  if (!out.frame) out.frame = null;
  if (!out.name) out.name = typeWords(out, units);
  return out;
}

export const typeOf = (s, net) => (s?.type ? (net?.types || []).find((k) => k.id === s.type) || null : null);

export function structGeom(s, net, units = 'ft') {
  const k = typeOf(s, net), P = per(units);
  if (!k) { const d = (Number(s?.dia) || 0) / P; return { shape: 'round', inW: d, inL: d, outW: d, outL: d, wall: 0, frame: null, type: null }; }
  const wall = (k.wall || 0) / P;
  const inW = (k.shape === 'round' ? k.dia : k.w) / P, inL = (k.shape === 'round' ? k.dia : k.l) / P;
  const frame = k.frame ? { shape: k.frame.shape, w: (k.frame.shape === 'round' ? k.frame.dia : k.frame.w) / P, l: (k.frame.shape === 'round' ? k.frame.dia : k.frame.l) / P, h: (k.frame.h || 0) / P } : null;
  return { shape: k.shape, inW, inL, outW: inW + 2 * wall, outL: inL + 2 * wall, wall, frame, type: k };
}

export function applyType(s, type) {
  if (!type) { const { type: _, ...rest } = s; return rest; }
  return { ...s, type: type.id, dia: type.shape === 'round' ? type.dia : type.w, sumpDepth: type.sump };
}

const sizeText = (v, units) => (units === 'm' ? Math.round(v) + ' mm' : (Math.round(v * 100) / 100) + '"');
export function typeWords(k, units = 'ft') {
  const size = k.shape === 'round' ? sizeText(k.dia, units) : sizeText(k.w, units) + ' × ' + sizeText(k.l, units);
  return t('st.words', { size, shape: t('st.shape.' + k.shape), kind: t('st.kind.' + k.kind), wall: sizeText(k.wall || 0, units) });
}

// ---- the library item ----
const circlePoly = (r, n = 48) => Array.from({ length: n }, (_, i) => [r * Math.cos((2 * Math.PI * i) / n), r * Math.sin((2 * Math.PI * i) / n)]);
const r6 = (v) => Math.round(v * 1e6) / 1e6;
export function typePlan(k, units = 'ft') {
  const M = mmPerDia(units), ents = [];
  const shapeEnt = (layer, shape, w, l) => (shape === 'round'
    ? { type: 'circle', layer, color: null, x: 0, y: 0, r: r6((w * M) / 2) }
    : { type: 'poly', layer, color: null, pts: [[-w, -l], [w, -l], [w, l], [-w, l]].map(([x, y]) => [r6((x * M) / 2), r6((y * M) / 2)]), closed: true });
  // a rectangle runs along X: its length (l) is the X size, its width (w) the Y size
  const W = k.shape === 'round' ? k.dia : k.l, D = k.shape === 'round' ? k.dia : k.w, wall = k.wall || 0;
  ents.push(shapeEnt('STRUCTURE', k.shape, W + 2 * wall, D + 2 * wall));
  if (wall > 0) ents.push(shapeEnt('STRUCTURE-DETAIL', k.shape, W, D));
  if (k.frame) ents.push(shapeEnt('FRAME', k.frame.shape, k.frame.shape === 'round' ? k.frame.dia : k.frame.l, k.frame.shape === 'round' ? k.frame.dia : k.frame.w));
  return { layers: [{ name: 'STRUCTURE', color: 7 }, { name: 'STRUCTURE-DETAIL', color: 8 }, { name: 'FRAME', color: 5 }], entities: ents };
}
/** The outside shape as a closed mesh (round: 48 sides) from z0 up to z1 (mm). */
function prism(outline, z0, z1) {
  const n = outline.length, P = [], I = [];
  for (const [x, y] of outline) P.push(x, y, z0);
  for (const [x, y] of outline) P.push(x, y, z1);
  P.push(0, 0, z0, 0, 0, z1);
  const cb = 2 * n, ct = 2 * n + 1;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    I.push(i, j, n + j, i, n + j, n + i);   // the side, outward (outline counter-clockwise)
    I.push(cb, j, i);                        // the floor, facing down
    I.push(ct, n + i, n + j);                // the top, facing up
  }
  return { type: 'mesh', positions: P.map(r6), indices: I };
}
export function typeItem(k, units = 'ft') {
  const M = mmPerDia(units), U = mmPerUnit(units), wall = k.wall || 0;
  const W = (k.shape === 'round' ? k.dia : k.l) + 2 * wall, D = (k.shape === 'round' ? k.dia : k.w) + 2 * wall;
  const H = k.depth * U + (k.base || 0) * M;
  const outline = k.shape === 'round' ? circlePoly((W * M) / 2) : [[-W, -D], [W, -D], [W, D], [-W, D]].map(([x, y]) => [(x * M) / 2, (y * M) / 2]);
  const attrs = {
    'CC-STRUCT-FORMAT': '1', 'CC-STRUCT-KIND': k.kind, 'CC-STRUCT-SHAPE': k.shape,
    'CC-STRUCT-WALL-MM': String(wall * M), 'CC-STRUCT-BASE-MM': String(((k.base || 0) * M)),
    'CC-STRUCT-SUMP-MM': String((k.sump * U)), 'CC-STRUCT-DEPTH-MM': String((k.depth * U)),
  };
  if (k.shape === 'round') attrs['CC-STRUCT-DIA-MM'] = String((k.dia * M));
  else { attrs['CC-STRUCT-W-MM'] = String((k.w * M)); attrs['CC-STRUCT-L-MM'] = String((k.l * M)); }
  if (k.frame) {
    attrs['CC-STRUCT-FRAME-SHAPE'] = k.frame.shape;
    attrs['CC-STRUCT-FRAME-H-MM'] = String(((k.frame.h || 0) * M));
    if (k.frame.shape === 'round') attrs['CC-STRUCT-FRAME-DIA-MM'] = String((k.frame.dia * M));
    else { attrs['CC-STRUCT-FRAME-W-MM'] = String((k.frame.w * M)); attrs['CC-STRUCT-FRAME-L-MM'] = String((k.frame.l * M)); }
  }
  return {
    format: 'cadcraft-library-item', format_version: 1,
    name: k.name || typeWords(k, units),
    kind: 'fixture', category: 'other/other',
    description: t('st.item.desc', { words: typeWords(k, units) }),
    maker: '', model: '',
    ifc: { class: 'IfcDistributionChamberElement', predefined: PREDEFINED[k.kind] || 'NOTDEFINED' },
    plan: typePlan(k, units),
    body: prism(outline, r6(-H), 0),
    clearances: [],
    params: { width: r6(W * M), depth: r6(D * M), height: r6(H), remarks: typeWords(k, units) },
    source_attrs: attrs,
  };
}
/** A library item made by CivilCraft → a type in the project's units (CC-STRUCT-* attributes; mm → in or mm). */
export function typeFromItem(item, units = 'ft') {
  const a = item?.source_attrs;
  if (!item || typeof item !== 'object' || item.format !== 'cadcraft-library-item') return { type: null, why: t('st.lib.notitem') };
  if (!a || a['CC-STRUCT-FORMAT'] !== '1') return { type: null, why: t('st.lib.notours') };
  const M = mmPerDia(units), U = mmPerUnit(units), n = (k) => Number(a[k]);
  const shape = a['CC-STRUCT-SHAPE'];
  const o = { name: String(item.name || ''), kind: a['CC-STRUCT-KIND'], shape, wall: n('CC-STRUCT-WALL-MM') / M, base: n('CC-STRUCT-BASE-MM') / M,
    sump: n('CC-STRUCT-SUMP-MM') / U, depth: n('CC-STRUCT-DEPTH-MM') / U };
  if (shape === 'round') o.dia = n('CC-STRUCT-DIA-MM') / M; else { o.w = n('CC-STRUCT-W-MM') / M; o.l = n('CC-STRUCT-L-MM') / M; }
  const fs = a['CC-STRUCT-FRAME-SHAPE'];
  if (fs) o.frame = fs === 'round' ? { shape: fs, dia: n('CC-STRUCT-FRAME-DIA-MM') / M, h: n('CC-STRUCT-FRAME-H-MM') / M } : { shape: fs, w: n('CC-STRUCT-FRAME-W-MM') / M, l: n('CC-STRUCT-FRAME-L-MM') / M, h: n('CC-STRUCT-FRAME-H-MM') / M };
  const type = cleanType(o, units);
  return type ? { type, why: '' } : { type: null, why: t('st.lib.bad') };
}
