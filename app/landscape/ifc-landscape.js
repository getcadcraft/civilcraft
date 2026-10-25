/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-landscape.js — the Landscape workspace's IFC export (0.7 LD.2 plants, LD.4 hardscape; session `landscape`). DOM-free, no
 * library: ISO 10303-21 text written by hand, schema **IFC4X3_ADD2** (the edition that has IfcPavement, IfcKerb and the
 * VEGETATION geographic element; BimCraft's reader and IfcOpenShell both read it).
 *
 *   writeLandscapeIfc({ name, units, elements, crsName? }, { now, seed }) → { text, counts: { elements, types, psets } }
 *     units: the project's ('ft' | 'm'); every coordinate is converted to metres (the file's length unit).
 *     element = { cls ('IfcGeographicElement' | 'IfcWall' | 'IfcSlab' | 'IfcPavement' | 'IfcKerb' | 'IfcStair' | 'IfcRamp' | …),
 *       predefined ('VEGETATION', 'SOLIDWALL', …, or 'USERDEFINED' + objectType), name, objectType?, tag?,
 *       at: {x, y, z, rot (radians)} (project units; z may be null = 0),
 *       body: { kind: 'cylinders', parts: [{ r, z0, z1 }] }   (round solids on the element's axis: a trunk and a crown)
 *           | { kind: 'mesh', positions (project units, relative to `at`), indices }   (IfcTriangulatedFaceSet, LD.7)
 *           | { kind: 'prism', pts: [{x, y}] (relative to `at`), z0, z1 }   (an extruded outline)
 *           | { kind: 'prisms', list: [{ pts, z0, z1 }] }   (several: stepped footings, a flight's treads)
 *       type?: { key, cls, predefined, name, psets }     (a shared type: its psets once; occurrences of one key share it)
 *       psets: { name: { prop: value } }   (number → IfcReal, integer-valued counts as IfcInteger when key ends 'Count', string → IfcLabel/Text, boolean)
 *       material?: string | [{ name, thickness }]       (IfcMaterial, or an IfcMaterialLayerSet for walls and paving) }
 *   plantingElements(ls, index, units, { zAt, lang, which }) → elements for every plant, bed and hedge
 *   guid(seed) → a 22-character IFC GlobalId from a string (stable: the same project exports with the same ids)
 *
 * Structure: IfcProject → IfcSite (everything contained in the site: landscape elements belong to the site, not a building).
 * The site's placement is the project's local origin (the first element's position rounded to 100 project units), recorded
 * in pset CadCraft_Site (OriginEasting, OriginNorthing, Units) so state-plane coordinates survive in viewers.
 */

import { sizeOf, displayName } from './plants.js';
import { bedFill, hedgeFill, offsetLine, unitM, bedSpacingM } from './planting.js';

const B64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
export function guid(seed) {
  let h1 = 1779033703, h2 = 3144134277, h3 = 1013904242, h4 = 2773480762;
  for (let i = 0; i < seed.length; i++) {
    const k = seed.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067); h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213); h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067); h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213); h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= h2 ^ h3 ^ h4; h2 ^= h1; h3 ^= h1; h4 ^= h1;
  let n = 0n;
  for (const h of [h1, h2, h3, h4]) n = (n << 32n) | BigInt(h >>> 0);
  let s = B64[Number(n & 3n)];   // the first character carries only 2 bits
  n >>= 2n;
  let tail = '';
  for (let i = 0; i < 21; i++) { tail = B64[Number(n & 63n)] + tail; n >>= 6n; }
  return s + tail;
}
const R = (v, d = 6) => { if (!Number.isFinite(v)) return '0.'; let s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace(/(\.\d*?)0+$/, '$1'); if (!s.includes('.')) s += '.'; return s === '-0.' ? '0.' : s; };
const S = (str) => {
  let out = '';
  for (const ch of String(str ?? '')) {
    const c = ch.codePointAt(0);
    if (c === 39) out += "''";
    else if (c === 92) out += '\\\\';
    else if (c >= 32 && c < 127) out += ch;
    else { const u = []; for (let i = 0; i < ch.length; i++) u.push(ch.charCodeAt(i).toString(16).toUpperCase().padStart(4, '0')); out += '\\X2\\' + u.join('') + '\\X0\\'; }
  }
  return "'" + out + "'";
};
const ENUM = (v) => '.' + String(v).toUpperCase().replace(/[^A-Z0-9_]/g, '') + '.';

class Step {
  constructor() { this.lines = []; this.n = 0; this.cache = new Map(); }
  add(s) { this.n++; this.lines.push('#' + this.n + '=' + s + ';'); return '#' + this.n; }
  once(s) { if (!this.cache.has(s)) this.cache.set(s, this.add(s)); return this.cache.get(s); }
  pt(p) { return this.once('IFCCARTESIANPOINT((' + p.map((v) => R(v)).join(',') + '))'); }
  dir(d) { return this.once('IFCDIRECTION((' + d.map((v) => R(v, 12)).join(',') + '))'); }
}

function value(v, key) {
  if (typeof v === 'boolean') return 'IFCBOOLEAN(' + (v ? '.T.' : '.F.') + ')';
  if (typeof v === 'number' && Number.isFinite(v)) return /Count$/.test(key) && Number.isInteger(v) ? 'IFCINTEGER(' + v + ')' : 'IFCREAL(' + R(v, 6) + ')';
  const s = String(v ?? '');
  return s.length > 255 ? 'IFCTEXT(' + S(s.slice(0, 2000)) + ')' : 'IFCLABEL(' + S(s) + ')';
}

export function writeLandscapeIfc({ name = 'Landscape', units = 'm', elements = [] } = {}, { now = new Date(), seed = name } = {}) {
  const k = unitM(units), w = new Step(), id = (s) => S(guid(seed + '|' + s));
  const counts = { elements: 0, types: 0, psets: 0 };
  const O = w.pt([0, 0, 0]), Z = w.dir([0, 0, 1]), X = w.dir([1, 0, 0]);
  const WCS = w.add('IFCAXIS2PLACEMENT3D(' + O + ',$,$)');
  const ctx = w.add("IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05," + WCS + ',$)');
  const body = w.add("IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*," + ctx + ',$,.MODEL_VIEW.,$)');
  const units4 = [w.add('IFCSIUNIT(*,.LENGTHUNIT.,$,.METRE.)'), w.add('IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)'), w.add('IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)'), w.add('IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)')];
  const ua = w.add('IFCUNITASSIGNMENT((' + units4.join(',') + '))');
  const project = w.add('IFCPROJECT(' + id('project') + ',$,' + S(name) + ',$,$,$,$,(' + ctx + '),' + ua + ')');
  const first = elements.find((e) => e.at);
  const ox = first ? Math.round(first.at.x / 100) * 100 : 0, oy = first ? Math.round(first.at.y / 100) * 100 : 0;
  const siteLP = w.add('IFCLOCALPLACEMENT($,' + WCS + ')');
  const site = w.add('IFCSITE(' + id('site') + ",$," + S(name) + ',$,$,' + siteLP + ',$,$,.ELEMENT.,$,$,$,$,$)');
  w.add('IFCRELAGGREGATES(' + id('rel-site') + ',$,$,$,' + project + ',(' + site + '))');
  const psetOn = (objs, pname, props, tag) => {
    const ps = Object.entries(props).filter(([, v]) => v !== '' && v != null).map(([pk, pv]) => w.add('IFCPROPERTYSINGLEVALUE(' + S(pk) + ',$,' + value(pv, pk) + ',$)'));
    if (!ps.length) return null;
    const set = w.add('IFCPROPERTYSET(' + id('pset|' + tag + '|' + pname) + ',$,' + S(pname) + ',$,(' + ps.join(',') + '))');
    counts.psets++;
    return set;
  };
  const siteSet = psetOn([site], 'CadCraft_Site', { OriginEasting: ox * k, OriginNorthing: oy * k, ProjectUnits: units === 'm' ? 'metre' : 'US survey foot', Source: 'CivilCraft Landscape' }, 'site');   // i18n-ignore: file data
  w.add('IFCRELDEFINESBYPROPERTIES(' + id('rel-site-pset') + ',$,$,$,(' + site + '),' + siteSet + ')');

  const circle = (r) => w.once('IFCCIRCLEPROFILEDEF(.AREA.,$,$,' + R(r) + ')');
  const polygon = (pts) => {
    const ring = pts.map((p) => w.pt([p.x * k, p.y * k]));
    ring.push(ring[0]);
    return w.add('IFCARBITRARYCLOSEDPROFILEDEF(.AREA.,$,' + w.add('IFCPOLYLINE((' + ring.join(',') + '))') + ')');
  };
  const extrude = (profile, z0, z1) => w.add('IFCEXTRUDEDAREASOLID(' + profile + ',' + w.add('IFCAXIS2PLACEMENT3D(' + w.pt([0, 0, z0 * k]) + ',$,$)') + ',' + Z + ',' + R(Math.max(1e-4, (z1 - z0) * k)) + ')');
  const solids = (b) => {
    if (!b) return [];
    if (b.kind === 'cylinders') return b.parts.filter((p) => p.r > 0 && p.z1 > p.z0).map((p) => extrude(circle(p.r * k), p.z0, p.z1));
    if (b.kind === 'prism') return b.pts?.length >= 3 && b.z1 > b.z0 ? [extrude(polygon(b.pts), b.z0, b.z1)] : [];
    if (b.kind === 'prisms') return b.list.flatMap((q) => solids({ kind: 'prism', ...q }));
    if (b.kind === 'mesh' && b.indices?.length >= 3) {   // LD.7: a freeform mesh, 1-based indices
      const pts = [];
      for (let i = 0; i < b.positions.length; i += 3) pts.push('(' + R(b.positions[i] * k) + ',' + R(b.positions[i + 1] * k) + ',' + R(b.positions[i + 2] * k) + ')');
      const tris = [];
      for (let i = 0; i < b.indices.length; i += 3) tris.push('(' + (b.indices[i] + 1) + ',' + (b.indices[i + 1] + 1) + ',' + (b.indices[i + 2] + 1) + ')');
      return [w.add('IFCTRIANGULATEDFACESET(' + w.add('IFCCARTESIANPOINTLIST3D((' + pts.join(',') + '),$)') + ',$,$,(' + tris.join(',') + '),$)')];
    }
    return [];
  };
  const shape = (items, tess = false) => w.add('IFCPRODUCTDEFINITIONSHAPE($,$,(' + w.add('IFCSHAPEREPRESENTATION(' + body + ",'Body','" + (tess ? 'Tessellation' : 'SweptSolid') + "',(" + items.join(',') + '))') + '))');
  const materials = new Map();
  const material = (m, tag, objs) => {
    if (!m) return;
    let ref;
    if (typeof m === 'string') { ref = materials.get(m) || w.add('IFCMATERIAL(' + S(m) + ',$,$)'); materials.set(m, ref); }
    else {
      const layers = m.map((L) => { const mat = materials.get(L.name) || w.add('IFCMATERIAL(' + S(L.name) + ',$,$)'); materials.set(L.name, mat); return w.add('IFCMATERIALLAYER(' + mat + ',' + R(L.thickness * k) + ',$,' + S(L.name) + ',$,$,$)'); });
      ref = w.add('IFCMATERIALLAYERSET((' + layers.join(',') + '),' + S(tag) + ',$)');
    }
    w.add('IFCRELASSOCIATESMATERIAL(' + id('mat|' + tag) + ',$,$,$,(' + objs.join(',') + '),' + ref + ')');
  };

  const contained = [], types = new Map();
  elements.forEach((e, i) => {
    const tag = e.tag || String(i);
    const at = e.at || { x: ox, y: oy, z: 0, rot: 0 };
    const rot = at.rot || 0;
    const place = w.add('IFCAXIS2PLACEMENT3D(' + w.pt([(at.x - ox) * k, (at.y - oy) * k, (at.z || 0) * k]) + ',' + Z + ',' + (rot ? w.dir([Math.cos(rot), Math.sin(rot), 0]) : X) + ')');
    const lp = w.add('IFCLOCALPLACEMENT(' + siteLP + ',' + place + ')');
    const items = solids(e.body);
    const rep = items.length ? shape(items, e.body?.kind === 'mesh') : '$';
    const pre = e.predefined || 'NOTDEFINED';
    const objType = pre === 'USERDEFINED' ? S(e.objectType || e.name) : (e.objectType ? S(e.objectType) : '$');
    const cls = e.cls.toUpperCase();
    // IfcStair / IfcRamp / IfcWall etc. all take (GlobalId, OwnerHistory, Name, Description, ObjectType, ObjectPlacement, Representation, Tag, PredefinedType)
    const el = w.add(cls + '(' + id('el|' + tag) + ',$,' + S(e.name) + ',$,' + objType + ',' + lp + ',' + rep + ',' + S(tag) + ',' + ENUM(pre) + ')');
    contained.push(el);
    counts.elements++;
    for (const [pname, props] of Object.entries(e.psets || {})) {
      const set = psetOn([el], pname, props, 'el|' + tag);
      if (set) w.add('IFCRELDEFINESBYPROPERTIES(' + id('rdp|' + tag + '|' + pname) + ',$,$,$,(' + el + '),' + set + ')');
    }
    if (e.material) material(e.material, 'el|' + tag, [el]);
    if (e.type) {
      let ty = types.get(e.type.key);
      if (!ty) {
        const tcls = (e.type.cls || e.cls + 'Type').toUpperCase(), tpre = e.type.predefined || pre;
        const sets = Object.entries(e.type.psets || {}).map(([pn, pr]) => psetOn([], pn, pr, 'type|' + e.type.key)).filter(Boolean);
        // IfcGeographicElementType etc.: (GlobalId, OwnerHistory, Name, Description, ApplicableOccurrence, HasPropertySets, RepresentationMaps, Tag, ElementType, PredefinedType)
        const t = w.add(tcls + '(' + id('type|' + e.type.key) + ',$,' + S(e.type.name) + ',$,$,' + (sets.length ? '(' + sets.join(',') + ')' : '$') + ',$,' + S(e.type.key) + ',$,' + ENUM(tpre) + ')');
        ty = { ref: t, members: [] };
        types.set(e.type.key, ty);
        counts.types++;
      }
      ty.members.push(el);
    }
  });
  for (const [key, ty] of types) w.add('IFCRELDEFINESBYTYPE(' + id('rdt|' + key) + ',$,$,$,(' + ty.members.join(',') + '),' + ty.ref + ')');
  if (contained.length) w.add('IFCRELCONTAINEDINSPATIALSTRUCTURE(' + id('rel-contained') + ',$,$,$,(' + contained.join(',') + '),' + site + ')');

  const stamp = now.toISOString().replace(/\.\d+Z$/, '');
  const head = ['ISO-10303-21;', 'HEADER;', "FILE_DESCRIPTION(('ViewDefinition [ReferenceView]'),'2;1');",
    'FILE_NAME(' + S(name + '.ifc') + ",'" + stamp + "',(''),(''),'CivilCraft Landscape','CadCraft','');", "FILE_SCHEMA(('IFC4X3_ADD2'));", 'ENDSEC;', 'DATA;'];   // i18n-ignore: file header
  return { text: [...head, ...w.lines, 'ENDSEC;', 'END-ISO-10303-21;', ''].join('\n'), counts };
}

/** Elements for every plant, bed and hedge (plants on the ground: `zAt(x, y)` gives the surface elevation). */
export function plantingElements(ls, index, units, { zAt = null, lang = 'en', which = null } = {}) {
  const k = unitM(units), show = which || ls.show || 'mature', out = [];
  const ground = (x, y) => { const z = zAt ? zAt(x, y) : null; return Number.isFinite(z) ? z : 0; };
  const typeOf = (sp) => ({
    key: 'plant-' + sp.key, cls: 'IfcGeographicElementType', predefined: 'VEGETATION', name: `${displayName(sp, lang)} (${sp.botanical})`,
    psets: { CadCraft_Plant: { BotanicalName: sp.botanical, CommonName: displayName(sp, lang), PlantType: sp.type, Form: sp.form, Foliage: sp.foliage,
      MatureHeight: sp.size.mature.h, MatureSpread: sp.size.mature.s, PlantingHeight: sizeOf(sp, 'plant').h, PlantingSpread: sizeOf(sp, 'plant').s,
      Container: sp.container, HardinessZone: sp.zone ? `${sp.zone.min}-${sp.zone.max}` : '', WaterNeed: sp.water, Light: sp.light.join(', '), Library: 'plants', SpeciesKey: sp.key } },
  });
  const bodyOf = (sp) => {   // in project units: trunk + crown for a tree, one round mass otherwise
    const z = sizeOf(sp, show), h = z.h / k, r = z.s / 2 / k;
    if (sp.type === 'tree') return { kind: 'cylinders', parts: [{ r: Math.max(0.05 / k, r * 0.08), z0: 0, z1: h * 0.4 }, { r, z0: h * 0.4, z1: h }] };
    return { kind: 'cylinders', parts: [{ r, z0: 0, z1: Math.max(0.02 / k, h) }] };
  };
  for (const p of ls.plants) {
    const sp = index.get(p.key);
    if (!sp) continue;
    out.push({ cls: 'IfcGeographicElement', predefined: 'VEGETATION', name: displayName(sp, lang), tag: p.id, at: { x: p.x, y: p.y, z: Number.isFinite(p.z) ? p.z : ground(p.x, p.y) },
      body: bodyOf(sp), type: typeOf(sp), psets: { CadCraft_Planting: { Source: 'plant', ShownSize: show, Label: p.label || '' } } });
  }
  for (const b of ls.beds) {
    const f = bedFill(b, index, units);
    const cx = b.pts.reduce((v, q) => v + q.x, 0) / b.pts.length, cy = b.pts.reduce((v, q) => v + q.y, 0) / b.pts.length;
    const zs = b.pts.map((q) => ground(q.x, q.y)), z = zs.reduce((a, v) => a + v, 0) / zs.length;
    let h = 0, wsum = 0;
    for (const m of b.mix) { const sp = index.get(m.key); if (sp) { h += m.pct * sizeOf(sp, show).h; wsum += m.pct; } }
    const counts = {};
    for (const [key, n] of Object.entries(f.counts)) counts[(index.get(key)?.botanical || key) + ' Count'] = n;
    // i18n-ignore: IFC file data (ObjectType), English like every library item
    out.push({ cls: 'IfcGeographicElement', predefined: 'VEGETATION', name: b.name, objectType: 'Planting bed', tag: b.id, at: { x: cx, y: cy, z },
      body: { kind: 'prism', pts: b.pts.map((q) => ({ x: q.x - cx, y: q.y - cy })), z0: 0, z1: Math.max(0.02, wsum ? h / wsum : 0.3) / k },
      psets: { CadCraft_PlantingBed: { Source: 'bed', PlantCount: f.pts.length, Spacing: bedSpacingM(b, index), Pattern: b.pattern, Mix: b.mix.map((m) => `${index.get(m.key)?.botanical || m.key} ${m.pct}%`).join('; '), Area: f.area * k * k, ...counts } } });
  }
  for (const hd of ls.hedges) {
    const sp = index.get(hd.key);
    if (!sp) continue;
    const f = hedgeFill(hd, index, units), z = sizeOf(sp, show), half = (z.s / 2 + (hd.rows === 2 ? hd.rowGap / 2 : 0)) / k;
    const a = offsetLine(hd.pts, half), b = offsetLine(hd.pts, -half).reverse();
    const o = hd.pts[0], g = ground(o.x, o.y);
    out.push({ cls: 'IfcGeographicElement', predefined: 'VEGETATION', name: hd.name, objectType: 'Hedge', tag: hd.id, at: { x: o.x, y: o.y, z: g },
      body: { kind: 'prism', pts: [...a, ...b].map((q) => ({ x: q.x - o.x, y: q.y - o.y })), z0: 0, z1: z.h / k },
      type: typeOf(sp), psets: { CadCraft_Hedge: { Source: 'hedge', PlantCount: f.pts.length, Rows: hd.rows, Length: f.length * k, Spacing: f.spacing * k } } });
  }
  return out;
}
