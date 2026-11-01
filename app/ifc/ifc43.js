/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its problem texts are English (an app translates what it shows). */
/**
 * ifc43.js — IFC 4.3 (IFC4X3_ADD2) infrastructure entities, read and written on cc-ifc's IfcFile (0.8 SU.882, session ifc_PART_4).
 * DOM-free. Built from the EXPRESS schema buildingSMART publishes (the tables in schema-ifc4x3.js) and the file layout they define; no
 * other program's code was read (rules 32, 43). The IFC5 / IFCX half of SU.882 is not here: no file description or schema licence is published.
 *
 *   read43(file, { world }) → {
 *     schema, is43, units: { length, area, volume, mass } (SI per file unit),
 *     facilities: [{ id, cls, name, predefined, parent (id | null), kids: [id], kind: 'road'|'railway'|'bridge'|'marine'|'facility', part: bool }],
 *     elements: [{ id, cls, group, name, predefined, tag, facility (nearest facility or part id | null), station: { distance, lateral, vertical,
 *                  longitudinal, alignment (id | null) } | null, quantities: { 'Set.Name': { kind, value (SI) } }, material, world? }],
 *     alignments: [{ id, name, predefined, curve (id | null), length (m) | null, referents: [{ id, name, station }] }],
 *     counts: { <group>: n }, problems: [{ code, severity, vars, text }] }
 *   classify(schemaName, cls) → group name | null   (the infrastructure groups, GROUPS below)
 *   quantitiesFile(read, { project, app }) → a 'cadcraft-quantities' document (TakeoffCraft's typed quantities, fixedqty.js)
 *   summary(read) → [{ group, cls, predefined, count, length, area, volume, counted: { length, area, volume } }]  one row per class + predefined type
 *   write43(spec) → { bytes, text, counts }   a new IFC4X3_ADD2 file; spec in the comment above writeSpec
 *
 * What is NOT done: IfcAlignmentHorizontal / Vertical / Cant "business logic" is read by geo-align.js and CivilCraft (ifc-civil-read.js); this file
 * only carries a placement's station and offsets. write43 writes straight tangents only (its Axis curve is IfcCompositeCurve of IfcLine segments).
 */

import { schemaFor } from './schema.js';
import { IfcFile } from './model.js';
import { GeoCtx } from './geo-ctx.js';
import { formatString } from './step.js';

/** The infrastructure groups: [group, entity names]. A class belongs to the first group any of whose names it is (or inherits from). */
export const GROUPS = [
  ['road', ['IFCPAVEMENT', 'IFCCOURSE', 'IFCKERB']],
  ['rail', ['IFCRAIL', 'IFCTRACKELEMENT']],
  ['earthworks', ['IFCEARTHWORKSCUT', 'IFCEARTHWORKSFILL', 'IFCEARTHWORKSELEMENT', 'IFCREINFORCEDSOIL']],
  ['bridge', ['IFCBEARING', 'IFCDEEPFOUNDATION', 'IFCCAISSONFOUNDATION']],
  ['marine', ['IFCMOORINGDEVICE', 'IFCNAVIGATIONELEMENT']],
  ['geotechnical', ['IFCGEOTECHNICALELEMENT']],
  ['signalling', ['IFCSIGNAL', 'IFCSIGN']],
  ['vehicle', ['IFCVEHICLE']],
];
export const FACILITIES = { IFCROAD: 'road', IFCRAILWAY: 'railway', IFCBRIDGE: 'bridge', IFCMARINEFACILITY: 'marine', IFCFACILITY: 'facility' };
export const FACILITY_PARTS = { IFCROADPART: 'road', IFCRAILWAYPART: 'railway', IFCBRIDGEPART: 'bridge', IFCMARINEPART: 'marine', IFCFACILITYPART: 'facility' };

const AREA_NAMES = ['NetSurfaceArea', 'NetFootprintArea', 'NetArea', 'NetSideArea', 'GrossSurfaceArea', 'GrossFootprintArea', 'GrossArea', 'GrossSideArea', 'CrossSectionArea'];
const VOLUME_NAMES = ['NetVolume', 'GrossVolume'];
const LENGTH_NAMES = ['Length'];
const KIND_OF = { IFCQUANTITYLENGTH: ['length', 'LengthValue'], IFCQUANTITYAREA: ['area', 'AreaValue'], IFCQUANTITYVOLUME: ['volume', 'VolumeValue'],
  IFCQUANTITYWEIGHT: ['mass', 'WeightValue'], IFCQUANTITYCOUNT: ['count', 'CountValue'], IFCQUANTITYTIME: ['time', 'TimeValue'] };
const PREFIX = { EXA: 1e18, PETA: 1e15, TERA: 1e12, GIGA: 1e9, MEGA: 1e6, KILO: 1e3, HECTO: 1e2, DECA: 10, DECI: 0.1, CENTI: 0.01, MILLI: 1e-3, MICRO: 1e-6, NANO: 1e-9 };

const ref = (v) => (v && typeof v === 'object' && v.ref !== undefined ? v.ref : null);
const refs = (v) => (Array.isArray(v) ? v.map(ref).filter((x) => x !== null) : []);
const str = (v) => (typeof v === 'string' ? v : v && typeof v === 'object' && typeof v.value === 'string' ? v.value : v && typeof v === 'object' && typeof v.enum === 'string' ? v.enum : null);
const enm = (v) => (v && typeof v === 'object' && typeof v.enum === 'string' ? v.enum : null);
const num = (v) => (typeof v === 'number' ? v : v && typeof v === 'object' && 'typed' in v ? num(v.value) : null);
const P = (code, severity, vars, text) => ({ code, severity, vars, text });

/** Which infrastructure group a class belongs to (null for anything else, and for every class of IFC2X3 / IFC4). */
export function classify(schemaName, cls) {
  const s = schemaFor(schemaName);
  const up = String(cls || '').toUpperCase();
  if (!s.has(up) || s.name !== 'IFC4X3') return null;
  for (const [g, names] of GROUPS) for (const n of names) if (s.has(n) && s.isA(up, n)) return g;
  return null;
}

function unitScales(g) {
  // SI per one file unit for each measure: the unit assignment's SI prefix or conversion factor; the defaults are the SI units
  const out = { length: g.lengthUnit, area: 1, volume: 1, mass: 1 };
  const f = g.f;
  const proj = f.ofType('IFCPROJECT', true)[0];
  const ua = proj !== undefined ? ref(g.a(proj, 'UnitsInContext')) : (f.ofType('IFCUNITASSIGNMENT')[0] ?? null);
  if (ua === null || ua === undefined) return out;
  for (const u of refs(g.a(ua, 'Units'))) {
    const kind = enm(g.a(u, 'UnitType'));
    const key = kind === 'AREAUNIT' ? 'area' : kind === 'VOLUMEUNIT' ? 'volume' : kind === 'MASSUNIT' ? 'mass' : null;
    if (!key) continue;
    const t = f.type(u);
    if (t === 'IFCSIUNIT') {
      const p = enm(g.a(u, 'Prefix'));
      out[key] = p ? PREFIX[p] ?? 1 : 1;
      if (key === 'mass' && String(enm(g.a(u, 'Name'))) === 'GRAM') out.mass *= 1e-3;
    } else {
      const v = g.unitFactor(u, 'METRE');
      if (v) out[key] = v;
    }
  }
  return out;
}

/** The linear placement an element sits on: { distance, lateral, vertical, longitudinal, curve } (file length units), or null. */
function linearOf(g, placementId, depth = 0) {
  const f = g.f;
  if (placementId === null || depth > 6) return null;
  const t = f.type(placementId);
  if (t === 'IFCLINEARPLACEMENT') {
    const ax = ref(g.a(placementId, 'RelativePlacement'));
    if (ax === null || f.type(ax) !== 'IFCAXIS2PLACEMENTLINEAR') return null;
    const pt = ref(g.a(ax, 'Location'));
    if (pt === null || f.type(pt) !== 'IFCPOINTBYDISTANCEEXPRESSION') return null;
    const n = (name) => num(g.a(pt, name)) ?? 0;
    return { distance: n('DistanceAlong'), lateral: n('OffsetLateral'), vertical: n('OffsetVertical'), longitudinal: n('OffsetLongitudinal'), curve: ref(g.a(pt, 'BasisCurve')) };
  }
  if (t === 'IFCLOCALPLACEMENT') return linearOf(g, ref(g.a(placementId, 'PlacementRelTo')), depth + 1);   // a relative placement inherits its parent's station
  return null;
}

/** Read the infrastructure side of an IFC file (any schema; the 4.3 classes only occur in IFC4X3). */
export function read43(file, { world = false } = {}) {
  const g = new GeoCtx(file);
  const problems = [];
  const is43 = file.schemaName === 'IFC4X3';
  const un = unitScales(g);
  const L = un.length;
  const out = { schema: file.fileSchema || file.schemaName, is43, units: { length: un.length, area: un.area, volume: un.volume, mass: un.mass }, facilities: [], elements: [], alignments: [], counts: {}, problems };
  if (!is43) problems.push(P('ifc43.schema', 'note', { schema: out.schema }, 'This file is ' + out.schema + '. Roads, railways, bridges, courses, kerbs, rails and the other infrastructure classes exist only in IFC4X3, so none can be read from it.'));

  // ---- spatial structure: aggregation parents, containment
  const parentOf = new Map();
  for (const rel of file.ofType('IFCRELAGGREGATES')) {
    const up = ref(g.a(rel, 'RelatingObject'));
    for (const k of refs(g.a(rel, 'RelatedObjects'))) parentOf.set(k, up);
  }
  const containerOf = new Map();
  for (const rel of file.ofType('IFCRELCONTAINEDINSPATIALSTRUCTURE')) {
    const up = ref(g.a(rel, 'RelatingStructure'));
    for (const k of refs(g.a(rel, 'RelatedElements'))) containerOf.set(k, up);
  }
  const facilityIds = new Set();
  const kindOf = (t) => FACILITIES[t] || FACILITY_PARTS[t] || null;
  for (const t of [...Object.keys(FACILITIES), ...Object.keys(FACILITY_PARTS)]) {
    if (!file.schema.has(t)) continue;
    for (const id of file.ofType(t)) {
      facilityIds.add(id);
      out.facilities.push({ id, cls: file.schema.entity(t).name, name: str(g.a(id, 'Name')) || '', predefined: enm(g.a(id, 'PredefinedType')) || enm(g.a(id, 'UsageType')) || null,
        parent: null, kids: [], kind: kindOf(t), part: t in FACILITY_PARTS });
    }
  }
  out.facilities.sort((a, b) => a.id - b.id);
  const byId = new Map(out.facilities.map((x) => [x.id, x]));
  for (const x of out.facilities) {
    let p = parentOf.get(x.id) ?? null, guard = 0;
    while (p !== null && !facilityIds.has(p) && ++guard < 12) p = parentOf.get(p) ?? null;
    x.parent = p !== null && facilityIds.has(p) ? p : null;
    if (x.parent !== null) byId.get(x.parent).kids.push(x.id);
  }
  const facilityOf = (id) => {
    let c = containerOf.get(id) ?? parentOf.get(id) ?? null, guard = 0;
    while (c !== null && !facilityIds.has(c) && ++guard < 12) c = containerOf.get(c) ?? parentOf.get(c) ?? null;
    return c !== null && facilityIds.has(c) ? c : null;
  };

  // ---- quantities and material, by element
  const psetsOf = file.inverse('IFCRELDEFINESBYPROPERTIES', 'RelatedObjects');
  const quantitiesOf = (id) => {
    const q = {};
    for (const rel of psetsOf.get(id) || []) {
      const def = ref(g.a(rel, 'RelatingPropertyDefinition'));
      if (def === null || file.type(def) !== 'IFCELEMENTQUANTITY') continue;
      const set = str(g.a(def, 'Name')) || 'Quantities';
      for (const qid of refs(g.a(def, 'Quantities'))) {
        const t = file.type(qid), k = KIND_OF[t];
        if (!k) continue;
        const v = num(g.a(qid, k[1]));
        if (v === null || !Number.isFinite(v)) continue;
        const si = k[0] === 'length' ? v * un.length : k[0] === 'area' ? v * un.area : k[0] === 'volume' ? v * un.volume : k[0] === 'mass' ? v * un.mass : v;
        q[set + '.' + (str(g.a(qid, 'Name')) || k[0])] = { kind: k[0], value: si };
      }
    }
    return q;
  };
  const materialOf = new Map();
  for (const rel of file.ofType('IFCRELASSOCIATESMATERIAL')) {
    const m = ref(g.a(rel, 'RelatingMaterial'));
    if (m === null) continue;
    let name = null;
    const t = file.type(m);
    if (t === 'IFCMATERIAL') name = str(g.a(m, 'Name'));
    else if (t === 'IFCMATERIALLAYERSETUSAGE' || t === 'IFCMATERIALLAYERSET' || t === 'IFCMATERIALLIST' || t === 'IFCMATERIALPROFILESET' || t === 'IFCMATERIALPROFILESETUSAGE' || t === 'IFCMATERIALCONSTITUENTSET') name = str(g.a(m, 'Name')) || str(g.a(m, 'LayerSetName'));
    for (const k of refs(g.a(rel, 'RelatedObjects'))) materialOf.set(k, name);
  }

  // ---- alignments and referents
  const curveOwner = new Map();   // curve id → alignment id (the Axis representation's items)
  for (const id of file.ofType('IFCALIGNMENT', true)) {
    const al = { id, name: str(g.a(id, 'Name')) || '', predefined: enm(g.a(id, 'PredefinedType')), curve: null, length: null, referents: [] };
    const pds = ref(g.a(id, 'Representation'));
    if (pds !== null) {
      for (const sr of refs(g.a(pds, 'Representations'))) {
        for (const item of refs(g.a(sr, 'Items'))) {
          if (al.curve === null) al.curve = item;
          curveOwner.set(item, id);
        }
      }
    }
    if (al.curve !== null) {
      try {
        const lens = segmentLength(g, al.curve);
        if (lens !== null) al.length = lens * L;
      } catch (e) { /* a curve the reader cannot measure keeps length null */ }
    }
    out.alignments.push(al);
  }
  const alignmentById = new Map(out.alignments.map((a) => [a.id, a]));
  const stationOfReferent = (id) => {
    for (const rel of psetsOf.get(id) || []) {
      const def = ref(g.a(rel, 'RelatingPropertyDefinition'));
      if (def === null || file.type(def) !== 'IFCPROPERTYSET' || str(g.a(def, 'Name')) !== 'Pset_Stationing') continue;
      for (const pid of refs(g.a(def, 'HasProperties'))) if (str(g.a(pid, 'Name')) === 'Station') { const v = num(g.a(pid, 'NominalValue')); if (v !== null) return v * L; }
    }
    return null;
  };
  const positioned = new Map();   // product id → alignment id (IfcRelPositions)
  for (const rel of file.ofType('IFCRELPOSITIONS')) {
    const al = ref(g.a(rel, 'RelatingPositioningElement'));
    for (const k of refs(g.a(rel, 'RelatedProducts'))) positioned.set(k, al);
  }
  for (const id of file.ofType('IFCREFERENT')) {
    const lin = linearOf(g, ref(g.a(id, 'ObjectPlacement')));
    const owner = (lin && curveOwner.get(lin.curve)) ?? [...parentOf.entries()].find(([k]) => k === id)?.[1] ?? null;
    const target = alignmentById.get(owner) || out.alignments[0];
    const st = stationOfReferent(id) ?? (lin ? lin.distance * L : null);
    if (target) target.referents.push({ id, name: str(g.a(id, 'Name')) || '', station: st, predefined: enm(g.a(id, 'PredefinedType')) });
  }

  // ---- elements
  const seen = new Set();
  const classes = new Set();
  for (const [, names] of GROUPS) for (const n of names) if (file.schema.has(n)) for (const t of file.schema.subtypes(n)) classes.add(t);
  let noPlace = 0, noHome = 0;
  for (const t of classes) {
    if (file.schema.entity(t).abstract) continue;
    for (const id of file.ofType(t)) {
      if (seen.has(id)) continue;
      seen.add(id);
      const group = classify(file.schemaName, t);
      if (!group) continue;
      const lin = linearOf(g, ref(g.a(id, 'ObjectPlacement')));
      const station = lin ? { distance: lin.distance * L, lateral: lin.lateral * L, vertical: lin.vertical * L, longitudinal: lin.longitudinal * L, alignment: (curveOwner.get(lin.curve) ?? positioned.get(id) ?? null) } : null;
      const el = { id, cls: file.schema.entity(t).name, group, name: str(g.a(id, 'Name')) || '', predefined: enm(g.a(id, 'PredefinedType')) || null, tag: str(g.a(id, 'Tag')) || '',
        facility: facilityOf(id), station, quantities: quantitiesOf(id), material: materialOf.get(id) ?? null };
      if (ref(g.a(id, 'ObjectPlacement')) === null) noPlace++;
      if (el.facility === null) noHome++;
      if (world) { try { const m = g.placement(ref(g.a(id, 'ObjectPlacement'))); el.world = [m[12] * L, m[13] * L, m[14] * L]; } catch (e) { /* no position */ } }
      out.elements.push(el);
      out.counts[group] = (out.counts[group] || 0) + 1;
    }
  }
  out.elements.sort((a, b) => a.id - b.id);
  if (noPlace) problems.push(P('ifc43.noplacement', 'note', { n: noPlace }, noPlace + ' infrastructure element(s) have no placement, so their position is not known.'));
  if (noHome && out.facilities.length) problems.push(P('ifc43.nofacility', 'note', { n: noHome }, noHome + ' infrastructure element(s) are not contained in any facility or facility part.'));
  const open = out.elements.filter((e) => e.group && !Object.keys(e.quantities).length).length;
  if (open && out.elements.length) problems.push(P('ifc43.noquantities', 'note', { n: open }, open + ' of ' + out.elements.length + ' infrastructure element(s) carry no quantity set (IfcElementQuantity); they are counted but have no length, area or volume.'));
  return out;
}

/** Length of an alignment curve in file units (sum of its curve segments' lengths), or null. */
function segmentLength(g, curve) {
  const f = g.f;
  const t = f.type(curve);
  if (t === 'IFCCOMPOSITECURVE' || t === 'IFCGRADIENTCURVE' || t === 'IFCSEGMENTEDREFERENCECURVE') {
    let s = 0, any = false;
    for (const seg of refs(g.a(curve, 'Segments'))) {
      if (f.type(seg) !== 'IFCCURVESEGMENT') return null;
      const l = num(g.a(seg, 'SegmentLength'));
      if (l !== null) { s += Math.abs(l); any = true; }
    }
    return any ? s : null;
  }
  return null;
}

const ROUND = (v) => Number(Number(v).toPrecision(12));

/** Totals per class and predefined type (SI: m, m², m³; a quantity is summed over the elements that have it, `counted` says how many). */
export function summary(r) {
  const rows = new Map();
  for (const e of r.elements) {
    const key = e.cls + '|' + (e.predefined || '');
    let row = rows.get(key);
    if (!row) rows.set(key, (row = { group: e.group, cls: e.cls, predefined: e.predefined || '', count: 0, length: 0, area: 0, volume: 0, counted: { length: 0, area: 0, volume: 0 } }));
    row.count++;
    const pick = (kind, names) => {
      for (const n of names) for (const [k, q] of Object.entries(e.quantities)) if (q.kind === kind && k.endsWith('.' + n)) return q.value;
      return null;
    };
    for (const [kind, names] of [['length', LENGTH_NAMES], ['area', AREA_NAMES], ['volume', VOLUME_NAMES]]) {
      const v = pick(kind, names);
      if (v !== null) { row[kind] += v; row.counted[kind]++; }
    }
  }
  return [...rows.values()].map((x) => ({ ...x, length: ROUND(x.length), area: ROUND(x.area), volume: ROUND(x.volume) })).sort((a, b) => a.group.localeCompare(b.group) || a.cls.localeCompare(b.cls) || a.predefined.localeCompare(b.predefined));
}

const words = (s) => String(s).replace(/^Ifc/, '').replace(/([a-z])([A-Z])/g, '$1 $2');
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** A 'cadcraft-quantities' document (TakeoffCraft's fixedqty.js reads it): a count per class and predefined type, and its length, area and volume when the file states them. */
export function quantitiesFile(r, { project = '', app = 'BimCraft', made = new Date().toISOString().replace(/\.\d+Z$/, 'Z') } = {}) {
  const items = [];
  for (const row of summary(r)) {
    const base = 'ifc43:' + slug(row.cls.replace(/^Ifc/, '')) + (row.predefined ? ':' + slug(row.predefined) : '');
    const label = words(row.cls) + (row.predefined && row.predefined !== 'NOTDEFINED' ? ' (' + row.predefined.toLowerCase().replace(/_/g, ' ') + ')' : '');
    items.push({ key: base + ':count', name: label + ': count', unit: 'EA', qty: row.count, note: row.count + ' element(s) in the IFC file.' });
    for (const [kind, unit, word] of [['length', 'm', 'length'], ['area', 'm²', 'area'], ['volume', 'm³', 'volume']]) {
      if (!row.counted[kind]) continue;
      const gap = row.count - row.counted[kind];
      items.push({ key: base + ':' + kind, name: label + ': ' + word, unit, qty: ROUND(row[kind]), note: gap ? gap + ' of ' + row.count + ' element(s) state no ' + word + ' and add nothing.' : 'Stated by all ' + row.count + ' element(s).' });
    }
  }
  return { format: 'cadcraft-quantities', version: 1, app, project: String(project).slice(0, 200), made, items };
}

// ---------------------------------------------------------------------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------------------------------------------------------------------

const R = (v, d = 9) => { const s = Number(v).toFixed(d).replace(/0+$/, ''); return /\.$/.test(s) ? s + '0' : s.includes('.') ? s : s + '.0'; };
const S = (s) => formatString(String(s ?? ''));
const Lst = (a) => '(' + a.join(',') + ')';
const B36 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';
function guid(seed) {
  // a 22-character IFC GUID from a 128-bit FNV-style mix of the seed: stable for the same input, no random source needed
  let h = [0x811c9dc5, 0x01000193, 0xdeadbeef, 0x9e3779b9];
  for (let i = 0; i < seed.length; i++) for (let k = 0; k < 4; k++) { h[k] ^= seed.charCodeAt(i) + k; h[k] = Math.imul(h[k], 0x01000193 + 2 * k) >>> 0; h[(k + 1) % 4] ^= h[k] >>> 13; }
  const b = []; for (const x of h) b.push((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255);
  b[0] &= 0x03;   // the first character carries only 2 bits
  let n = 0n; for (const x of b) n = (n << 8n) | BigInt(x);
  let out = ''; for (let i = 0; i < 22; i++) { out = B36[Number(n & 63n)] + out; n >>= 6n; }
  return out;
}

class Writer {
  constructor(schemaName) {
    this.s = schemaFor(schemaName);
    this.lines = []; this.n = 0; this.cache = new Map();
  }
  line(cls, a = {}) {
    const up = cls.toUpperCase(), e = this.s.entity(up);
    if (!e || e.abstract) throw new Error(cls + ' is not an entity of ' + this.s.name);
    for (const k of Object.keys(a)) if (!e.index.has(k)) throw new Error(e.name + ' has no attribute ' + k);
    const vals = e.attrs.map((at) => {
      if (e.derived.has(at.name)) return '*';
      const x = a[at.name];
      if (x === undefined || x === null || x === '$') { if (!at.t.opt) throw new Error(e.name + '.' + at.name + ' is required'); return '$'; }
      return x;
    });
    return up + '(' + vals.join(',') + ')';
  }
  add(text) { this.n++; this.lines.push('#' + this.n + '=' + text + ';'); return '#' + this.n; }
  ent(cls, a) { return this.add(this.line(cls, a)); }
  one(cls, a) { const t = this.line(cls, a); if (!this.cache.has(t)) this.cache.set(t, this.add(t)); return this.cache.get(t); }
  pt(p) { return this.one('IfcCartesianPoint', { Coordinates: Lst(p.map((v) => R(v))) }); }
  dir(d) { return this.one('IfcDirection', { DirectionRatios: Lst(d.map((v) => R(v, 12))) }); }
}

const PREDEF = (s, cls, v) => {
  if (!v) return null;
  const e = s.entity(cls.toUpperCase());
  const at = e && e.attrs.find((a) => a.name === 'PredefinedType');
  if (!at) return null;
  const tt = s.table.typ[at.t.tname];
  const ok = tt && tt[1] === 'e' ? String(tt[2]).split(';') : [];
  const up = String(v).toUpperCase();
  return ok.includes(up) ? '.' + up + '.' : ok.includes('NOTDEFINED') ? '.NOTDEFINED.' : null;
};

const FACILITY_CLS = { road: ['IfcRoad', 'IfcRoadPart'], railway: ['IfcRailway', 'IfcRailwayPart'], bridge: ['IfcBridge', 'IfcBridgePart'], marine: ['IfcMarineFacility', 'IfcMarinePart'], facility: ['IfcFacility', 'IfcFacilityPart'] };

/**
 * write43(spec): a new IFC4X3_ADD2 file in metres.
 *   spec = { name, alignments: [{ name, points: [[x, y], …] }],       straight tangents; the Axis curve is a composite of line segments
 *            facilities: [{ kind: 'road' | 'railway' | 'bridge' | 'marine' | 'facility', name, predefined?, parts: [{ name, usage?: 'LONGITUDINAL' | 'LATERAL' | 'REGION' | 'COMPLEX',
 *              predefined?, elements: [ element ] }] }] }
 *   element = { cls: 'IfcPavement', name, predefined?, tag?, material?,
 *               at: [x, y, z]  |  station: { alignment (index), distance, lateral?, vertical? },
 *               profile: { w, d } | { r } | { poly: [[x, y], …] },  height (extruded along local Z),
 *               qto?: { Name: metres | m² | m³ } to override the quantities worked out from the profile }
 * Quantities written (set 'BaseQuantities', SI): Length (the profile's longer side, or the diameter), Width, Height, GrossFootprintArea, GrossVolume.
 */
export function write43(spec) {
  const w = new Writer('IFC4X3');
  const sch = w.s;
  const name = spec.name || 'Infrastructure';
  const gid = (tag) => S(guid(name + '|' + tag));
  const O3 = w.pt([0, 0, 0]);
  const WCS = w.ent('IfcAxis2Placement3D', { Location: O3 });
  const ctx = w.ent('IfcGeometricRepresentationContext', { ContextType: S('Model'), CoordinateSpaceDimension: '3', Precision: '1.E-05', WorldCoordinateSystem: WCS, TrueNorth: w.dir([0, 1]) });
  const cBody = w.ent('IfcGeometricRepresentationSubContext', { ContextIdentifier: S('Body'), ContextType: S('Model'), ParentContext: ctx, TargetView: '.MODEL_VIEW.' });
  const cAxis = w.ent('IfcGeometricRepresentationSubContext', { ContextIdentifier: S('Axis'), ContextType: S('Model'), ParentContext: ctx, TargetView: '.GRAPH_VIEW.' });
  const units = w.ent('IfcUnitAssignment', { Units: Lst([w.ent('IfcSIUnit', { UnitType: '.LENGTHUNIT.', Name: '.METRE.' }), w.ent('IfcSIUnit', { UnitType: '.AREAUNIT.', Name: '.SQUARE_METRE.' }),
    w.ent('IfcSIUnit', { UnitType: '.VOLUMEUNIT.', Name: '.CUBIC_METRE.' }), w.ent('IfcSIUnit', { UnitType: '.PLANEANGLEUNIT.', Name: '.RADIAN.' })]) });
  const project = w.ent('IfcProject', { GlobalId: gid('project'), Name: S(name), RepresentationContexts: Lst([cCtx(ctx)]), UnitsInContext: units });
  function cCtx(c) { return c; }
  const site = w.ent('IfcSite', { GlobalId: gid('site'), Name: S('Site'), CompositionType: '.ELEMENT.' });
  const rel = (tag, up, kids) => w.ent('IfcRelAggregates', { GlobalId: gid('agg|' + tag), RelatingObject: up, RelatedObjects: Lst(kids) });
  rel('project', project, [site]);

  const counts = { facilities: 0, parts: 0, elements: 0, alignments: 0 };
  // ---- alignments: Axis curve = composite of line segments
  const alignments = [];
  for (const [ai, a] of (spec.alignments || []).entries()) {
    const pts = a.points;
    if (!Array.isArray(pts) || pts.length < 2) throw new Error('An alignment needs at least two points.');
    const segs = [];
    let at = 0;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0], dy = pts[i][1] - pts[i - 1][1], len = Math.hypot(dx, dy);
      if (!(len > 0)) throw new Error('Two points of an alignment coincide.');
      const line = w.ent('IfcLine', { Pnt: w.pt([0, 0]), Dir: w.ent('IfcVector', { Orientation: w.dir([1, 0]), Magnitude: '1.' }) });
      segs.push(w.ent('IfcCurveSegment', { Transition: i === pts.length - 1 ? '.DISCONTINUOUS.' : '.CONTSAMEGRADIENTSAMECURVATURE.',
        Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([pts[i - 1][0], pts[i - 1][1]]), RefDirection: w.dir([dx / len, dy / len]) }),
        SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(' + R(len) + ')', ParentCurve: line }));
      at += len;
    }
    const curve = w.ent('IfcCompositeCurve', { Segments: Lst(segs), SelfIntersect: '.F.' });
    const rep = w.ent('IfcShapeRepresentation', { ContextOfItems: cAxis, RepresentationIdentifier: S('Axis'), RepresentationType: S('Curve3D'), Items: Lst([curve]) });
    const al = w.ent('IfcAlignment', { GlobalId: gid('alignment|' + ai), Name: S(a.name || 'Alignment ' + (ai + 1)), ObjectPlacement: w.ent('IfcLocalPlacement', { RelativePlacement: WCS }),
      Representation: w.ent('IfcProductDefinitionShape', { Representations: Lst([rep]) }), PredefinedType: '.USERDEFINED.', ObjectType: S('Centreline') });
    alignments.push({ id: al, curve, length: at, related: [] });
    counts.alignments++;
  }
  if (alignments.length) rel('alignments', project, alignments.map((x) => x.id));

  // ---- facilities, parts, elements
  const facIds = [];
  const material = new Map();
  const needs = (cls) => { const e = sch.entity(cls.toUpperCase()); if (!e || e.abstract) throw new Error(cls + ' is not an IFC4X3 entity you can write.'); return e; };
  for (const [fi, f] of (spec.facilities || []).entries()) {
    const kinds = FACILITY_CLS[f.kind || 'facility'];
    if (!kinds) throw new Error('Unknown facility kind ' + f.kind);
    const fe = w.ent(kinds[0], { GlobalId: gid('facility|' + fi), Name: S(f.name || kinds[0]), ObjectPlacement: w.ent('IfcLocalPlacement', { RelativePlacement: WCS }), CompositionType: '.ELEMENT.', ...(sch.entity(kinds[0].toUpperCase()).index.has('PredefinedType') && PREDEF(sch, kinds[0], f.predefined) ? { PredefinedType: PREDEF(sch, kinds[0], f.predefined) } : {}) });
    counts.facilities++;
    facIds.push(fe);
    const partIds = [];
    for (const [pi, p] of (f.parts || []).entries()) {
      const pe = w.ent(kinds[1], { GlobalId: gid('part|' + fi + '|' + pi), Name: S(p.name || kinds[1]), ObjectPlacement: w.ent('IfcLocalPlacement', { RelativePlacement: WCS }), CompositionType: '.ELEMENT.',
        UsageType: p.usage && /^(LONGITUDINAL|LATERAL|REGION|COMPLEX|NOTDEFINED)$/.test(p.usage) ? '.' + p.usage + '.' : '.NOTDEFINED.',
        ...(PREDEF(sch, kinds[1], p.predefined) ? { PredefinedType: PREDEF(sch, kinds[1], p.predefined) } : {}) });
      counts.parts++;
      partIds.push(pe);
      const inside = [];
      for (const [ei, el] of (p.elements || []).entries()) {
        const ee = needs(el.cls);
        const tag = fi + '|' + pi + '|' + ei;
        // body: one extrusion of the profile along local Z
        const area = profileArea(el.profile), dims = profileDims(el.profile);
        const h = Number(el.height);
        if (!(h > 0) || !(area > 0)) throw new Error((el.name || el.cls) + ': a profile and a height are needed');
        let prof;
        const pr = el.profile;
        if (pr.poly) prof = w.ent('IfcArbitraryClosedProfileDef', { ProfileType: '.AREA.', OuterCurve: w.ent('IfcPolyline', { Points: Lst([...pr.poly, pr.poly[0]].map((q) => w.pt(q))) }) });
        else if (pr.r) prof = w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Radius: R(pr.r) });
        else prof = w.ent('IfcRectangleProfileDef', { ProfileType: '.AREA.', XDim: R(pr.w), YDim: R(pr.d) });
        const solid = w.ent('IfcExtrudedAreaSolid', { SweptArea: prof, Position: WCS, ExtrudedDirection: w.dir([0, 0, 1]), Depth: R(h) });
        const shape = w.ent('IfcProductDefinitionShape', { Representations: Lst([w.ent('IfcShapeRepresentation', { ContextOfItems: cBody, RepresentationIdentifier: S('Body'), RepresentationType: S('SweptSolid'), Items: Lst([solid]) })]) });
        let placement;
        if (el.station) {
          const al = alignments[el.station.alignment ?? 0];
          if (!al) throw new Error((el.name || el.cls) + ': station refers to an alignment that is not in the spec');
          const ds = Number(el.station.distance);
          if (!(ds >= 0 && ds <= al.length + 1e-9)) throw new Error((el.name || el.cls) + ': station ' + ds + ' is outside the alignment (0 to ' + R(al.length, 3) + ' m)');
          placement = w.ent('IfcLinearPlacement', { RelativePlacement: w.ent('IfcAxis2PlacementLinear', { Location: w.ent('IfcPointByDistanceExpression', { DistanceAlong: 'IFCLENGTHMEASURE(' + R(ds) + ')',
            OffsetLateral: el.station.lateral ? 'IFCLENGTHMEASURE(' + R(el.station.lateral) + ')' : null, OffsetVertical: el.station.vertical ? 'IFCLENGTHMEASURE(' + R(el.station.vertical) + ')' : null, BasisCurve: al.curve }) }) });
        } else placement = w.ent('IfcLocalPlacement', { RelativePlacement: w.ent('IfcAxis2Placement3D', { Location: w.pt(el.at || [0, 0, 0]) }) });
        const a = { GlobalId: gid('element|' + tag), Name: S(el.name || ee.name), ObjectPlacement: placement, Representation: shape };
        if (ee.index.has('Tag') && el.tag) a.Tag = S(el.tag);
        if (ee.index.has('PredefinedType') && PREDEF(sch, el.cls, el.predefined)) a.PredefinedType = PREDEF(sch, el.cls, el.predefined);
        const id = w.ent(el.cls, a);
        inside.push(id);
        counts.elements++;
        if (el.station) alignments[el.station.alignment ?? 0].related.push(id);
        // quantities
        const q = { Length: Math.max(...dims), Width: Math.min(...dims), Height: h, GrossFootprintArea: area, GrossVolume: area * h, ...(el.qto || {}) };
        const qs = Object.entries(q).filter(([, v]) => Number.isFinite(v)).map(([k, v]) => {
          const area_ = /Area$/.test(k), vol = /Volume$/.test(k);
          return w.ent(area_ ? 'IfcQuantityArea' : vol ? 'IfcQuantityVolume' : 'IfcQuantityLength', { Name: S(k), [area_ ? 'AreaValue' : vol ? 'VolumeValue' : 'LengthValue']: R(v) });
        });
        const qset = w.ent('IfcElementQuantity', { GlobalId: gid('qto|' + tag), Name: S('BaseQuantities'), Quantities: Lst(qs) });
        w.ent('IfcRelDefinesByProperties', { GlobalId: gid('rdp|' + tag), RelatedObjects: Lst([id]), RelatingPropertyDefinition: qset });
        if (el.material) {
          if (!material.has(el.material)) material.set(el.material, { id: w.ent('IfcMaterial', { Name: S(el.material) }), objs: [] });
          material.get(el.material).objs.push(id);
        }
      }
      if (inside.length) w.ent('IfcRelContainedInSpatialStructure', { GlobalId: gid('contain|' + fi + '|' + pi), RelatedElements: Lst(inside), RelatingStructure: pe });
    }
    if (partIds.length) rel('parts|' + fi, fe, partIds);
  }
  if (facIds.length) rel('facilities', site, facIds);
  for (const [m, v] of material) w.ent('IfcRelAssociatesMaterial', { GlobalId: gid('mat|' + m), RelatedObjects: Lst(v.objs), RelatingMaterial: v.id });
  for (const [ai, a] of alignments.entries()) if (a.related.length) w.ent('IfcRelPositions', { GlobalId: gid('pos|' + ai), RelatingPositioningElement: a.id, RelatedProducts: Lst(a.related) });

  const text = 'ISO-10303-21;\nHEADER;\nFILE_DESCRIPTION((\'ViewDefinition [ReferenceView_V1.2]\'),\'2;1\');\nFILE_NAME(' + S(slug(name) + '.ifc') + ',' + S('2026-01-01T00:00:00') + ',(\'\'),(\'\'),\'cc-ifc\',\'cc-ifc ifc43.js\',\'\');\nFILE_SCHEMA((\'IFC4X3_ADD2\'));\nENDSEC;\nDATA;\n' + w.lines.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
  return { text, bytes: new TextEncoder().encode(text), counts };
}

function profileArea(p) {
  if (!p) return 0;
  if (p.r) return Math.PI * p.r * p.r;
  if (p.poly) { let s = 0; for (let i = 0; i < p.poly.length; i++) { const a = p.poly[i], b = p.poly[(i + 1) % p.poly.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; }
  return (p.w || 0) * (p.d || 0);
}
function profileDims(p) {
  if (p.r) return [2 * p.r, 2 * p.r];
  if (p.poly) { const xs = p.poly.map((q) => q[0]), ys = p.poly.map((q) => q[1]); return [Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; }
  return [p.w, p.d];
}

/** Open written (or any) bytes. */
export const open43 = (bytes) => IfcFile.open(bytes);
