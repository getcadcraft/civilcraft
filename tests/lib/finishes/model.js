// SPDX-License-Identifier: Apache-2.0
/**
 * model.js: the wall finishes a project keeps (0.10 BK.25, BK.26, BK.27; session bim-finishes-10). Host-free, no DOM, no imports but face.js.
 * The wall stays a raw core; a finish is a layer on one face of it. Everything is in FACE COORDINATES (face.js): s along the wall from its
 * start, v above its base. A wall is named by its stable id (BimCraft: GlobalId).
 *
 * THE DOCUMENT (BimCraft: property set CadCraft_WallFinishes on IfcProject):
 *   { format: 'cadcraft-wall-finishes', version: 1,
 *     types: [{ id, name, kind: 'tile' | 'paint' | 'plaster' | 'board' | 'panel' | 'other', code?,
 *               layers: [{ role: 'substrate' | 'waterproofing' | 'adhesive' | 'finish', material, thickness }]   (nearest the wall first),
 *               tile?: { length, width, joint, texture?, waste (percent) } }],
 *     faces: [{ wall, face: 'left' | 'right',
 *               zones: [{ id, name, kind: 'full' | 'splash' | 'shower' | 'custom', type (a type id),
 *                         anchor: 'fill' | 'a' | 'b',  fill = the whole width of the face; a / b = measured from that end of the wall
 *                         d0, d1 (distance from the anchor end, d0 <= d1), v0, v1 (height above the base), top (v1 follows the wall's top),
 *                         setout?: { start: { kind: 'corner' (corner: 'bl'|'br'|'tl'|'tr') | 'centre' | 'opening' (opening, edge: 'left'|'right'|'top'|'bottom') | 'point' (s, v) },
 *                                    direction: 'horizontal' | 'vertical' (the tile's LONG side), pattern: 'grid' | 'brick', shift (0..1, brick only) } }] }] }
 *   A zone later in a face's list lies ON TOP of the earlier ones: where they overlap, only the later one is counted (it is painted over).
 *
 *   emptyDoc() · cleanDoc(raw) → { doc, errors: [{ code, at }] }   never throws; a wrong entry is left out and named
 *   typeById(doc, id) · layerRoles · typeThickness(type) · buildUp(type) → layers with from / to (distance from the wall face)
 *   substrates(type) → the substrate layers · tileOf(type) → the tile or null
 *   zoneFullHeight() / zoneSplashBack(span, opts) / zoneShower(span, opts) / zoneFromCorners(points, geom, opts)  → a zone (no id: the host gives one)
 *   resolveZone(zone, geom) → { rect, clipped, lost }   geom = { len, extent: [s0, s1], height }
 *   finishedWall(wall, thickLeft, thickRight) → { raw, finished, left, right }   what the wall measures from finished face to finished face
 *   newId(prefix, taken) → an id not in `taken`
 *   Changes (each returns a NEW document, checked by cleanDoc, or throws an Error with a `key` for the host's language file; nothing is changed in place):
 *   withType(doc, type) (add or replace by id) · withoutType(doc, id) (refused while a zone uses it: finishes.err.typeused)
 *   withZone(doc, wall, face, zone) (on top of the face's others; the id is made when missing) · withoutZone(doc, wall, face, id)
 *   withZoneChanged(doc, wall, face, id, patch) · withZoneMoved(doc, wall, face, id, 'up' | 'down') (one place in the stacking order; up = nearer the top)
 *   forgetWalls(doc, keep: Set of wall ids) → { doc, dropped: number of faces whose wall is gone }
 */
import { rect, FACES } from './face.js';

export const FORMAT = 'cadcraft-wall-finishes';
export const VERSION = 1;
export const KINDS = ['tile', 'paint', 'plaster', 'board', 'panel', 'other'];
export const ROLES = ['substrate', 'waterproofing', 'adhesive', 'finish'];
export const ZONE_KINDS = ['full', 'splash', 'shower', 'custom'];
export const CORNERS = ['bl', 'br', 'tl', 'tr'];
export const EDGES = ['left', 'right', 'top', 'bottom'];
export const LIMITS = { types: 500, layers: 16, zones: 40, faces: 20000, name: 80, id: 64, thickness: 500, tile: 3000, joint: 50, size: 100000 };
/** Defaults the tools start from. Typical heights, not code values: the person types the real ones. */
export const DEFAULTS = { splashFrom: 900, splashHeight: 600, showerHeight: 2100, joint: 3, waste: 10, shift: 0.5 };

export const emptyDoc = () => ({ format: FORMAT, version: VERSION, types: [], faces: [] });
const num = (x) => (typeof x === 'number' && Number.isFinite(x) ? x : typeof x === 'string' && x.trim() !== '' && Number.isFinite(Number(x)) ? Number(x) : null);
const str = (x, n = LIMITS.name) => (typeof x === 'string' ? x.trim().slice(0, n) : '');
const idOf = (x) => { const s = str(x, LIMITS.id); return /^[A-Za-z0-9_.:$-]+$/.test(s) ? s : ''; };

function cleanSetout(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const st = raw.start && typeof raw.start === 'object' ? raw.start : {};
  const start = { kind: ['corner', 'centre', 'opening', 'point'].includes(st.kind) ? st.kind : 'corner' };
  if (start.kind === 'corner') start.corner = CORNERS.includes(st.corner) ? st.corner : 'bl';
  if (start.kind === 'opening') { start.opening = idOf(st.opening); start.edge = EDGES.includes(st.edge) ? st.edge : 'right'; if (!start.opening) start.kind = 'corner', start.corner = 'bl', delete start.edge, delete start.opening; }
  if (start.kind === 'point') { const s = num(st.s), v = num(st.v); if (s === null || v === null) start.kind = 'corner', start.corner = 'bl'; else { start.s = s; start.v = v; } }
  const sh = num(raw.shift);
  return { start, direction: raw.direction === 'vertical' ? 'vertical' : 'horizontal', pattern: raw.pattern === 'brick' ? 'brick' : 'grid', shift: sh !== null && sh >= 0 && sh <= 1 ? sh : DEFAULTS.shift };
}
function cleanType(raw, errors, at) {
  const bad = (code) => { errors.push({ code, at }); return null; };
  if (!raw || typeof raw !== 'object') return bad('type');
  const id = idOf(raw.id), name = str(raw.name);
  if (!id) return bad('type.id');
  if (!name) return bad('type.name');
  const layers = [];
  for (const [i, l] of (Array.isArray(raw.layers) ? raw.layers : []).entries()) {
    const t = num(l?.thickness);
    if (!l || !ROLES.includes(l.role) || t === null || t < 0 || t > LIMITS.thickness) { errors.push({ code: 'layer', at: at + '/' + i }); continue; }
    if (layers.length >= LIMITS.layers) { errors.push({ code: 'layers.many', at }); break; }
    layers.push({ role: l.role, material: str(l.material), thickness: t });
  }
  if (!layers.length) return bad('type.layers');
  const out = { id, name, kind: KINDS.includes(raw.kind) ? raw.kind : 'other', layers };
  const code = str(raw.code, 40); if (code) out.code = code;
  if (out.kind === 'tile') {
    const T = raw.tile || {}, length = num(T.length), width = num(T.width), joint = num(T.joint ?? DEFAULTS.joint), waste = num(T.waste ?? DEFAULTS.waste);
    if (length === null || width === null || !(length > 0) || !(width > 0) || length > LIMITS.tile || width > LIMITS.tile || joint === null || joint < 0 || joint > LIMITS.joint || waste === null || waste < 0 || waste > 100) return bad('tile');
    out.tile = { length, width, joint, waste, ...(str(T.texture) ? { texture: str(T.texture) } : {}) };
  }
  return out;
}
function cleanZone(raw, types, errors, at) {
  const bad = (code) => { errors.push({ code, at }); return null; };
  if (!raw || typeof raw !== 'object') return bad('zone');
  const id = idOf(raw.id), type = idOf(raw.type);
  if (!id || !types.has(type)) return bad('zone.type');
  const z = { id, name: str(raw.name), kind: ZONE_KINDS.includes(raw.kind) ? raw.kind : 'custom', type };
  const v0 = num(raw.v0 ?? 0), v1 = num(raw.v1 ?? 0);
  if (raw.anchor === 'fill' || raw.kind === 'full') { z.anchor = 'fill'; z.d0 = 0; z.d1 = 0; }
  else {
    const d0 = num(raw.d0), d1 = num(raw.d1);
    if (!['a', 'b'].includes(raw.anchor) || d0 === null || d1 === null || d0 < 0 || d1 <= d0 || d1 > LIMITS.size) return bad('zone.span');
    z.anchor = raw.anchor; z.d0 = d0; z.d1 = d1;
  }
  z.top = !!raw.top;
  if (v0 === null || v0 < 0 || (!z.top && (v1 === null || v1 <= v0)) || v0 > LIMITS.size || (v1 !== null && v1 > LIMITS.size)) return bad('zone.height');
  z.v0 = v0; z.v1 = z.top ? Math.max(v1 ?? 0, v0) : v1;
  const so = cleanSetout(raw.setout); if (so) z.setout = so;
  return z;
}
export function cleanDoc(raw) {
  const errors = [], doc = emptyDoc();
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT) { if (raw && typeof raw === 'object' && raw.format) errors.push({ code: 'format', at: '' }); return { doc, errors }; }
  const seen = new Set();
  for (const [i, t] of (Array.isArray(raw.types) ? raw.types : []).entries()) {
    if (doc.types.length >= LIMITS.types) { errors.push({ code: 'types.many', at: '' }); break; }
    const x = cleanType(t, errors, 'types/' + i);
    if (!x) continue;
    if (seen.has(x.id)) { errors.push({ code: 'type.dup', at: 'types/' + i }); continue; }
    seen.add(x.id); doc.types.push(x);
  }
  const keys = new Set();
  for (const [i, f] of (Array.isArray(raw.faces) ? raw.faces : []).entries()) {
    if (doc.faces.length >= LIMITS.faces) { errors.push({ code: 'faces.many', at: '' }); break; }
    const wall = idOf(f?.wall);
    if (!wall || !FACES.includes(f.face) || keys.has(wall + ':' + f.face)) { errors.push({ code: 'face', at: 'faces/' + i }); continue; }
    keys.add(wall + ':' + f.face);
    const zones = [], zids = new Set();
    for (const [j, z] of (Array.isArray(f.zones) ? f.zones : []).entries()) {
      if (zones.length >= LIMITS.zones) { errors.push({ code: 'zones.many', at: 'faces/' + i }); break; }
      const c = cleanZone(z, seen, errors, 'faces/' + i + '/zones/' + j);
      if (!c) continue;
      if (zids.has(c.id)) { errors.push({ code: 'zone.dup', at: 'faces/' + i + '/zones/' + j }); continue; }
      zids.add(c.id); zones.push(c);
    }
    doc.faces.push({ wall, face: f.face, zones });
  }
  return { doc, errors };
}

export const typeById = (doc, id) => doc.types.find((t) => t.id === id) || null;
export const typeThickness = (type) => (type?.layers || []).reduce((s, l) => s + l.thickness, 0);
export function buildUp(type) {
  let at = 0;
  return (type?.layers || []).map((l) => { const x = { ...l, from: at, to: at + l.thickness }; at = x.to; return x; });
}
export const substrates = (type) => (type?.layers || []).filter((l) => l.role === 'substrate');
export const tileOf = (type) => (type?.kind === 'tile' && type.tile ? type.tile : null);

/** The wall from finished face to finished face: raw core + what each face carries. */
export function finishedWall(wall, thickLeft = 0, thickRight = 0) {
  return { raw: wall.t, finished: wall.t + thickLeft + thickRight, left: thickLeft, right: thickRight };
}

// ---- zones by corners (BK.26) ----
const nearer = (s0, s1, len) => (s0 + s1) / 2 <= len / 2 ? 'a' : 'b';
function spanZone(kind, s0, s1, v0, v1, len, extra = {}) {
  if (!(s1 - s0 > 0) || !(v1 - v0 > 0)) throw Object.assign(new Error('finishes.err.emptyzone'), { key: 'finishes.err.emptyzone' });
  const anchor = nearer(s0, s1, len);
  return { kind, anchor, d0: anchor === 'a' ? s0 : len - s1, d1: anchor === 'a' ? s1 : len - s0, v0, v1, top: false, ...extra };
}
/** Full height: the whole face, floor to top. Follows the wall's length and height. */
export const zoneFullHeight = () => ({ kind: 'full', anchor: 'fill', d0: 0, d1: 0, v0: 0, v1: 0, top: true });
/** A splash-back: a band between two corners along the wall, `height` tall from `from` above the floor (a worktop). `span` = [s0, s1]. */
export function zoneSplashBack(span, geom, { from = DEFAULTS.splashFrom, height = DEFAULTS.splashHeight } = {}) {
  return spanZone('splash', Math.min(...span), Math.max(...span), from, from + height, geom.len);
}
/** A shower wall: from the floor to `height` (or to the top when height is 0), between two corners along the wall. */
export function zoneShower(span, geom, { height = DEFAULTS.showerHeight } = {}) {
  const z = spanZone('shower', Math.min(...span), Math.max(...span), 0, height > 0 ? height : geom.height, geom.len);
  if (!(height > 0)) { z.top = true; z.v1 = z.v0; }
  return z;
}
/** The zone the person marked by clicking its corners: 2 points (opposite corners) or 4 (a rectangle in any order). [s, v] each. */
export function zoneFromCorners(points, geom) {
  const P = (points || []).filter((p) => Array.isArray(p) && num(p[0]) !== null && num(p[1]) !== null);
  if (P.length !== 2 && P.length !== 4) throw Object.assign(new Error('finishes.err.corners'), { key: 'finishes.err.corners' });
  const ss = [...new Set(P.map((p) => Math.round(p[0] * 1000)))], vs = [...new Set(P.map((p) => Math.round(p[1] * 1000)))];
  if (P.length === 4 && (ss.length !== 2 || vs.length !== 2)) throw Object.assign(new Error('finishes.err.notrect'), { key: 'finishes.err.notrect' });
  const s0 = Math.min(...P.map((p) => p[0])), s1 = Math.max(...P.map((p) => p[0])), v0 = Math.min(...P.map((p) => p[1])), v1 = Math.max(...P.map((p) => p[1]));
  const [e0, e1] = geom.extent || [0, geom.len];
  const cs0 = Math.max(s0, e0), cs1 = Math.min(s1, e1), cv0 = Math.max(v0, 0), cv1 = Math.min(v1, geom.height);
  const z = spanZone('custom', cs0, cs1, cv0, cv1, geom.len);
  return z;
}

/** The zone as a rectangle on the face now (the wall may be longer, shorter or lower than when it was made): clipped to the face, or lost when nothing is left. */
export function resolveZone(zone, geom) {
  const [e0, e1] = geom.extent || [0, geom.len], top = geom.height;
  let s0, s1, v0 = zone.v0, v1 = zone.top ? top : zone.v1;
  if (zone.anchor === 'fill') { s0 = e0; s1 = e1; if (!zone.top) v1 = zone.v1; }
  else if (zone.anchor === 'a') { s0 = zone.d0; s1 = zone.d1; }
  else { s0 = geom.len - zone.d1; s1 = geom.len - zone.d0; }
  const r = rect(Math.max(s0, e0), Math.min(s1, e1), Math.max(v0, 0), Math.min(v1, top));
  const lost = !(Math.min(s1, e1) - Math.max(s0, e0) > 1e-6) || !(Math.min(v1, top) - Math.max(v0, 0) > 1e-6);
  const clipped = !lost && (r.s0 > s0 + 1e-6 || r.s1 < s1 - 1e-6 || r.v0 > v0 + 1e-6 || r.v1 < v1 - 1e-6);
  return { rect: lost ? rect(0, 0, 0, 0) : r, clipped, lost };
}

export function newId(prefix, taken) {
  const set = taken instanceof Set ? taken : new Set(taken);
  for (let n = set.size + 1; ; n++) { const id = prefix + n; if (!set.has(id)) return id; }
}

// ---- changes ----
const refuse = (key) => { throw Object.assign(new Error(key), { key }); };
const checked = (doc) => { const r = cleanDoc(doc); if (r.errors.length) refuse('finishes.err.' + r.errors[0].code); return r.doc; };
const clone = (doc) => JSON.parse(JSON.stringify(doc));
export function withType(doc, type) {
  const d = clone(doc), i = d.types.findIndex((x) => x.id === type.id);
  if (i >= 0) d.types[i] = type; else d.types.push(type);
  return checked(d);
}
export function withoutType(doc, id) {
  if (doc.faces.some((f) => f.zones.some((z) => z.type === id))) refuse('finishes.err.typeused');
  const d = clone(doc); d.types = d.types.filter((x) => x.id !== id);
  return checked(d);
}
function faceOf(d, wall, face, make) {
  let f = d.faces.find((x) => x.wall === wall && x.face === face);
  if (!f && make) d.faces.push(f = { wall, face, zones: [] });
  return f || null;
}
export function withZone(doc, wall, face, zone) {
  const d = clone(doc), f = faceOf(d, wall, face, true);
  const z = { ...zone }; if (!z.id) z.id = newId('z', f.zones.map((x) => x.id));
  if (f.zones.some((x) => x.id === z.id)) refuse('finishes.err.zonedup');
  f.zones.push(z);
  return checked(d);
}
export function withoutZone(doc, wall, face, id) {
  const d = clone(doc), f = faceOf(d, wall, face, false);
  if (!f || !f.zones.some((z) => z.id === id)) refuse('finishes.err.nozone');
  f.zones = f.zones.filter((z) => z.id !== id);
  d.faces = d.faces.filter((x) => x.zones.length);
  return checked(d);
}
export function withZoneChanged(doc, wall, face, id, patch) {
  const d = clone(doc), f = faceOf(d, wall, face, false), i = f ? f.zones.findIndex((z) => z.id === id) : -1;
  if (i < 0) refuse('finishes.err.nozone');
  f.zones[i] = { ...f.zones[i], ...patch, id };
  return checked(d);
}
export function withZoneMoved(doc, wall, face, id, way) {
  const d = clone(doc), f = faceOf(d, wall, face, false), i = f ? f.zones.findIndex((z) => z.id === id) : -1;
  if (i < 0) refuse('finishes.err.nozone');
  const j = way === 'up' ? i + 1 : i - 1;
  if (j < 0 || j >= f.zones.length) return checked(d);
  [f.zones[i], f.zones[j]] = [f.zones[j], f.zones[i]];
  return checked(d);
}
export function forgetWalls(doc, keep) {
  const d = clone(doc), n = d.faces.length;
  d.faces = d.faces.filter((f) => keep.has(f.wall));
  return { doc: d, dropped: n - d.faces.length };
}
