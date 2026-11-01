/* SPDX-License-Identifier: Apache-2.0 */
/**
 * planted.js — planted areas as objects (0.8 LA.5, session `landscape-arch_PART_4`): a lawn, bed, meadow or groundcover with a build-up,
 * a plant mix (the bed fill, LD.2) and an optional finished level (a modifier in the proposed ground, LA.4). No DOM. The area clips
 * itself around paving, paths, walls, kerbs, ramps and steps that overlap it (lib/landscape/areas.js clipRegion): no plant goes
 * under paving and the quantities are those of what is left. Lengths and depths are in project units.
 *
 * state.landscape.areas = [{ id, kind: 'lawn'|'bed'|'meadow'|'groundcover', name, pts (closed),
 *   buildup: { topsoil, mulch, membrane (bool), edging: '' | EDGINGS }, mix: [{ key, pct, cv?, sup? }] (empty = no plants: a lawn),
 *   spacing: null | m, pattern, angle, seed, level: null | z (finished level), clip (bool, default true), link? (LA.2) }]
 *
 *   AREA_KINDS · EDGINGS · areaDefaults(kind, units) · cleanAreas(list, units)
 *   obstacles(ls) → [{ id, kind, pts }]   hardscape footprints in plan
 *   areaRegion(a, ls) → clipRegion result (the area minus what overlaps it)
 *   areaFill(a, ls, index, units, region?) → bedFill result, clipped
 *   areaQuantities(a, ls, index, units) → { area, perimeter, edging, topsoil, mulch, membrane, plants, mixCounts, region, fill }
 *   areaGradeItems(ls) → gradedSurface items for areas with a finished level
 *   areaScene(ls, index, units) → [{ a, region, fill }] for planting.sceneItems · areaQuantityItems(ls, index, units) (TakeoffCraft)
 *   areaElements(ls, index, units, { zAt }) → IFC elements (IfcGeographicElement + quantity set)
 */
import { clipRegion } from './areas.js';
import { bedFill, offsetLine } from './planting.js';
import { t } from '../i18n.js';
import { cleanLink } from './links.js';   // 0.8 LA.2

export const AREA_KINDS = ['lawn', 'bed', 'meadow', 'groundcover'];
export const EDGINGS = ['', 'steel', 'timber', 'brick', 'concrete', 'plastic'];
export const MAX_AREAS = 2000;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const XY = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
const KEY = /^[a-z0-9-]{1,64}$/, SUB = /^[a-z0-9-]{1,40}$/;
const depth = (v, d) => (fin(v) && v >= 0 && v < 100 ? v : d);

/** Labelled typical build-ups (a designer sets the real ones), in project units. */
export function areaDefaults(kind, units) {
  const m = units === 'm', L = (mv) => (m ? mv : Math.round((mv / 0.3048) * 100) / 100);
  const d = { lawn: [0.15, 0, ''], bed: [0.3, 0.075, 'steel'], meadow: [0.1, 0, ''], groundcover: [0.2, 0.05, ''] }[kind] || [0.3, 0.075, ''];
  return { topsoil: L(d[0]), mulch: L(d[1]), membrane: false, edging: d[2] };
}

export function cleanAreas(list, units) {
  const out = [];
  if (!Array.isArray(list)) return out;
  for (const a of list.slice(0, MAX_AREAS)) {
    if (!a || typeof a !== 'object' || !/^l\d{1,9}$/.test(String(a.id))) continue;
    const kind = AREA_KINDS.includes(a.kind) ? a.kind : 'bed';
    const pts = (Array.isArray(a.pts) ? a.pts.slice(0, 5000) : []).map(XY).filter(Boolean);
    if (pts.length < 3) continue;
    const D = areaDefaults(kind, units), b = a.buildup && typeof a.buildup === 'object' ? a.buildup : {};
    const mix = (Array.isArray(a.mix) ? a.mix.slice(0, 20) : []).filter((m) => m && KEY.test(m.key) && fin(m.pct) && m.pct > 0 && m.pct <= 100)
      .map((m) => ({ key: m.key, pct: m.pct, ...(SUB.test(m.cv || '') ? { cv: m.cv } : {}), ...(SUB.test(m.sup || '') ? { sup: m.sup } : {}) }));
    out.push({ id: a.id, kind, name: str(a.name) || t('ls.a.k.' + kind), pts,
      buildup: { topsoil: depth(b.topsoil, D.topsoil), mulch: depth(b.mulch, D.mulch), membrane: b.membrane === true, edging: EDGINGS.includes(b.edging) ? b.edging : D.edging },
      mix, spacing: fin(a.spacing) && a.spacing >= 0.05 && a.spacing <= 50 ? a.spacing : null, pattern: a.pattern === 'square' ? 'square' : 'triangular',
      angle: fin(a.angle) ? ((a.angle % 360) + 360) % 360 : 0, seed: Number.isInteger(a.seed) ? a.seed >>> 0 : 1,
      level: fin(a.level) && Math.abs(a.level) < 1e6 ? a.level : null, clip: a.clip !== false, ...(cleanLink(a.link) ? { link: cleanLink(a.link) } : {}) });
  }
  return out;
}

const strip = (pts, w) => (pts.length >= 2 && w > 0 ? [...offsetLine(pts, w / 2), ...offsetLine(pts, -w / 2).reverse()] : null);
/** The plan footprints of hardscape (what a planted area clips around). */
export function obstacles(ls) {
  const out = [];
  for (const h of ls?.hardscape || []) {
    let pts = null;
    if (h.kind === 'paving') pts = h.pts;
    else if (h.kind === 'path' || h.kind === 'ramp') pts = strip(h.pts, h.width);
    else if (h.kind === 'wall') pts = strip(h.pts, h.thickness);
    else if (h.kind === 'kerb') pts = strip(h.pts, h.width);
    else if (h.kind === 'steps') pts = strip(h.pts.slice(0, 2), h.width);
    if (pts && pts.length >= 3) out.push({ id: h.id, kind: h.kind, pts });
  }
  return out;
}

const regionCache = new WeakMap();
export function areaRegion(a, ls) {
  const obs = a.clip ? obstacles(ls) : [];
  const key = JSON.stringify([a.pts, obs.map((o) => o.pts)]);
  const c = regionCache.get(a);
  if (c && c.key === key) return c.region;
  const region = clipRegion(a.pts, obs.map((o) => o.pts));
  regionCache.set(a, { key, region });
  return region;
}
const asBed = (a) => ({ id: a.id, pts: a.pts, mix: a.mix, spacing: a.spacing, pattern: a.pattern, angle: a.angle, seed: a.seed });
export function areaFill(a, ls, index, units, region = areaRegion(a, ls)) {
  if (!a.mix.length) return { pts: [], counts: {}, mixCounts: [], spacing: 0, area: region.area, capped: false };
  // a place is kept when it is in what is left and at least half a spacing from a cut edge (the outline's margin is bedFill's own)
  return bedFill(asBed(a), index, units, (x, y, s) => region.inside(x, y) && (!region.cutLength || cutDist(region, x, y) >= s / 2 - 1e-9));
}
function cutDist(region, x, y) {
  let d = Infinity;
  for (const e of region.edges) {
    if (e.from !== 'cut') continue;
    const dx = e.b.x - e.a.x, dy = e.b.y - e.a.y, L = dx * dx + dy * dy, tt = L ? Math.max(0, Math.min(1, ((x - e.a.x) * dx + (y - e.a.y) * dy) / L)) : 0;
    d = Math.min(d, Math.hypot(x - e.a.x - tt * dx, y - e.a.y - tt * dy));
  }
  return d;
}

export function areaQuantities(a, ls, index, units) {
  const region = areaRegion(a, ls), fill = areaFill(a, ls, index, units, region), b = a.buildup;
  return { area: region.area, perimeter: region.perimeter, edging: b.edging ? region.outlineLength : 0, topsoil: region.area * b.topsoil, mulch: region.area * b.mulch,
    membrane: b.membrane ? region.area : 0, plants: fill.pts.length, mixCounts: fill.mixCounts || [], counts: fill.counts, clipped: region.cutLength > 0, region, fill };
}

/** A finished level makes the area a modifier of the proposed ground (flat at that level inside its outline). */
export function areaGradeItems(ls) {
  const out = [];
  for (const a of ls?.areas || []) {
    if (a.level == null) continue;
    out.push({ id: a.id, kind: 'ls-planted', name: a.name, patch: () => ({ problems: [], region: a.pts.map((q) => ({ x: q.x, y: q.y })), points: [],
      breaklines: [{ name: a.name, pts: [...a.pts, a.pts[0]].map((q) => ({ x: q.x, y: q.y, z: a.level })) }], info: { kind: 'planted', z0: a.level } }) });
  }
  return out;
}

export function areaScene(ls, index, units) {
  return (ls?.areas || []).map((a) => { const region = areaRegion(a, ls); return { a, region, fill: areaFill(a, ls, index, units, region) }; });
}

export function areaQuantityItems(ls, index, units) {
  const m = units === 'm', A = m ? 'm²' : 'SF', L = m ? 'm' : 'LF', V = m ? 'm³' : 'CY', vPer = m ? 1 : 27, r2 = (v) => Math.round(v * 100) / 100;   // i18n-ignore: TakeoffCraft's unit symbols
  const out = [];
  for (const a of ls?.areas || []) {
    const q = areaQuantities(a, ls, index, units), k = 'area:' + a.id;
    out.push({ key: k + ':area', name: t('ls.a.q.area', { name: a.name }), unit: A, qty: r2(q.area) });
    if (q.topsoil) out.push({ key: k + ':topsoil', name: t('ls.a.q.topsoil', { name: a.name }), unit: V, qty: r2(q.topsoil / vPer) });
    if (q.mulch) out.push({ key: k + ':mulch', name: t('ls.a.q.mulch', { name: a.name }), unit: V, qty: r2(q.mulch / vPer) });
    if (q.membrane) out.push({ key: k + ':membrane', name: t('ls.a.q.membrane', { name: a.name }), unit: A, qty: r2(q.membrane) });
    if (q.edging) out.push({ key: k + ':edging', name: t('ls.a.q.edging', { name: a.name, kind: t('ls.a.e.' + a.buildup.edging) }), unit: L, qty: r2(q.edging) });
  }
  return out;
}

/** IFC: one IfcGeographicElement per area (VEGETATION; a lawn too), its build-up as the prism's depth, and a quantity set. */
export function areaElements(ls, index, units, { zAt = () => 0 } = {}) {
  const out = [];
  for (const a of ls?.areas || []) {
    const q = areaQuantities(a, ls, index, units), b = a.buildup;
    const cx = a.pts.reduce((v, p) => v + p.x, 0) / a.pts.length, cy = a.pts.reduce((v, p) => v + p.y, 0) / a.pts.length;
    const z = a.level ?? (a.pts.map((p) => zAt(p.x, p.y) ?? 0).reduce((s, v) => s + v, 0) / a.pts.length);
    // i18n-ignore: IFC file data (ObjectType), English like every library item
    out.push({ cls: 'IfcGeographicElement', predefined: 'VEGETATION', name: a.name, objectType: 'Planted area: ' + a.kind, tag: a.id, at: { x: cx, y: cy, z },
      body: { kind: 'prism', pts: a.pts.map((p) => ({ x: p.x - cx, y: p.y - cy })), z0: -Math.max(0.01, b.topsoil + b.mulch), z1: 0 },
      material: [b.mulch ? { name: t('ls.a.l.mulch'), thickness: b.mulch } : null, { name: t('ls.a.l.topsoil'), thickness: Math.max(0.001, b.topsoil) }].filter(Boolean),
      psets: { CadCraft_PlantedArea: { Kind: a.kind, Edging: b.edging, Membrane: b.membrane, Clipped: q.clipped, PlantCount: q.plants, Mix: a.mix.map((m) => `${index.get(m.key)?.botanical || m.key} ${m.pct}%`).join('; ') } },
      qsets: { Qto_CadCraft_PlantedArea: { NetArea: { kind: 'area', v: q.area }, Perimeter: { kind: 'length', v: q.perimeter }, EdgingLength: { kind: 'length', v: q.edging },
        TopsoilVolume: { kind: 'volume', v: q.topsoil }, MulchVolume: { kind: 'volume', v: q.mulch }, PlantCount: { kind: 'count', v: q.plants } } } });
  }
  return out;
}
