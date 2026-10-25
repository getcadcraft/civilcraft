/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its errors are English (an app translates what it shows). */
/**
 * api.js — cc-ifc's IfcAPI: the calls BimCraft and DetailCraft make on an IFC engine, with the value shapes their code
 * already reads (lines as objects with expressID / type / named attributes; values { type, name, value }; references
 * { type: 5, value: id } (Handle); enumerations { type: 3, value }; vectors with size()/get(i); meshes streamed as
 * { expressID, geometries } with a column-major flatTransformation in metres, Y up). So switching an app is one import.
 *
 *   import * as WebIFC from './ifc/api.js';      // WebIFC.IfcAPI, WebIFC.Handle, WebIFC.IFCWALL …, WebIFC.FILE_NAME
 *   const api = new WebIFC.IfcAPI(); await api.Init({ manifold });   // manifold-3d module (openings, booleans); optional
 *   const mid = api.OpenModel(bytes, { COORDINATE_TO_ORIGIN: true });
 *   api.AdoptModel(file)                           a model opened elsewhere (open-async.js) → modelID
 *   (both take COORDINATION_MATRIX: the matrix an earlier open found, so a reloaded edit stays where it was)
 *
 * Lines: GetLine(mid, id, flatten) · GetLineType · GetLineIDsWithType(mid, code, inherited) · GetAllTypesOfModel · GetMaxExpressID ·
 *   GetNameFromTypeCode · GetTypeCodeFromName · IsIfcElement · GetHeaderLine · GetModelSchema
 * Writing: CreateIfcEntity(mid, code, ...attrs) (expressID −1 until written) · CreateIfcType(mid, code, value) ·
 *   CreateIFCGloballyUniqueId · WriteLine(mid, line) (a new line gets the next free id) · DeleteLine · SaveModel → bytes
 * Geometry: StreamAllMeshes(mid, cb(mesh, index, total)) · StreamAllMeshesWithTypes(mid, codes, cb) · GetFlatMesh(mid, id)
 *   · GetGeometry(mid, geometryExpressID) → { GetVertexData, GetVertexDataSize, GetIndexData, GetIndexDataSize, delete }
 *   · GetVertexArray(data, size) / GetIndexArray(data, size) · GetCoordinationMatrix · GetWorldTransformMatrix(mid, placementId)
 *   · GetGeoReference(mid) (map conversion: CRS, eastings/northings/height, rotation, scale, model → map matrix)
 *   (vertices: x y z nx ny nz in the file's length unit; flatTransformation scales to metres and turns Z up into Y up)
 * Properties: api.properties.getSpatialStructure(mid, withProps) · getPropertySets(mid, id, recursive) ·
 *   getTypeProperties(mid, id, recursive) · getItemProperties(mid, id, recursive) · getClassifications(mid, id) ·
 *   getGroups(mid, id) (zones, systems)
 * Extra: api.file(mid) → the model.js IfcFile · api.notes(mid) → what could not be drawn · api.geometry(mid)
 */

import { IfcFile } from './model.js';
import { DERIVED } from './step.js';
import { CONSTANTS, typeCode, nameOfCode, schemaFor } from './schema.js';
import { Geometry } from './geometry.js';
import { setManifold } from './geo-bool.js';
import { mul, scaling, translation, I4 } from './geo-math.js';

export * from './constants.js';

export const UNKNOWN = 0, STRING = 1, LABEL = 2, ENUM = 3, REAL = 4, REF = 5, EMPTY = 6, SET_BEGIN = 7, SET_END = 8, LINE_END = 9, INTEGER = 10;

/** A reference to a line (web-ifc's Handle shape). */
export class Handle {
  constructor(id) { this.value = id; this.type = REF; }
}

const DERIVED_VALUE = Object.freeze({ type: UNKNOWN, value: null, derived: true });
const YUP = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];

class Vector {
  constructor(a) { this.a = a; }
  size() { return this.a.length; }
  get(i) { return this.a[i]; }
  [Symbol.iterator]() { return this.a[Symbol.iterator](); }
  delete() {}
}

const classes = new Map();
function lineClass(pretty) {
  let C = classes.get(pretty);
  if (!C) {
    C = ({ [pretty]: class { constructor(expressID, type) { this.expressID = expressID; this.type = type; } } })[pretty];
    classes.set(pretty, C);
  }
  return C;
}

export class IfcAPI {
  constructor() {
    this.models = new Map();
    this.nextModel = 0;
    this.properties = new Properties(this);
  }

  /** opts.manifold: an initialised manifold-3d module; else it is imported by name when the page maps 'manifold-3d'. */
  async Init(opts = {}) {
    let M = opts.manifold || null;
    if (!M && opts.manifold !== false) {
      try {
        const mod = await import('manifold-3d');
        M = await (mod.default || mod)();
        M.setup?.();
      } catch (e) { M = null; }
    }
    if (M) setManifold(M);
    this.booleans = !!M;
    return this;
  }

  SetWasmPath() {}
  SetLogLevel() {}

  OpenModel(bytes, settings = {}) {
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let file;
    try { file = IfcFile.open(data); } catch (e) { return -1; }
    return this.AdoptModel(file, settings);
  }

  /** settings.COORDINATION_MATRIX (16 numbers, column-major): use it as the model's coordination matrix instead of finding
   *  one — a reload of an edited file keeps the frame it had (its first element may have changed or moved). */
  AdoptModel(file, settings = {}) {
    const mid = this.nextModel++;
    const keep = settings.COORDINATION_MATRIX;
    const C = keep && keep.length === 16 && [...keep].every(Number.isFinite) ? [...keep] : null;
    this.models.set(mid, { file, toOrigin: settings.COORDINATE_TO_ORIGIN === true, C, geo: null });
    return mid;
  }

  CloseModel(mid) { this.models.delete(mid); }
  IsModelOpen(mid) { return this.models.has(mid); }

  m(mid) {
    const m = this.models.get(mid);
    if (!m) throw new Error('No IFC model is open with id ' + mid);
    return m;
  }

  file(mid) { return this.m(mid).file; }
  geometry(mid) { const m = this.m(mid); if (!m.geo) m.geo = new Geometry(m.file); return m.geo; }
  notes(mid) { return this.m(mid).geo ? this.m(mid).geo.notes : new Map(); }

  GetModelSchema(mid) { return this.file(mid).schemaName; }

  GetHeaderLine(mid, code) {
    const name = nameOfCode(code) || String(code);
    const raw = this.file(mid).header.raw[name];
    if (!raw) return null;
    const conv = (v) => (Array.isArray(v) ? v.map(conv) : v === null ? null : typeof v === 'string' ? { type: STRING, value: v } : v && v.enum ? { type: ENUM, value: v.enum } : { type: REAL, value: v });
    return { ID: Object.keys(this.file(mid).header.raw).indexOf(name) + 1, type: name, arguments: raw.map(conv) };
  }

  GetTypeCodeFromName(name) { return typeCode(name); }
  GetNameFromTypeCode(code) { const up = nameOfCode(code); if (!up) return ''; for (const s of ['IFC4X3', 'IFC4', 'IFC2X3']) { const p = schemaFor(s).pretty(up); if (p) return p; } return up; }
  GetLineType(mid, id) { const t = this.file(mid).type(id); return t ? typeCode(t) : 0; }
  IsIfcElement(code) { const up = nameOfCode(code); return !!up && ['IFC4X3', 'IFC4', 'IFC2X3'].some((s) => schemaFor(s).has(up) && schemaFor(s).isA(up, 'IFCPRODUCT')); }

  GetLineIDsWithType(mid, code, inherited = false) {
    const up = nameOfCode(code);
    return new Vector(up ? this.file(mid).ofType(up, inherited) : []);
  }

  GetAllLines(mid) { return new Vector([...this.file(mid).ids()]); }
  GetMaxExpressID(mid) { return this.file(mid).maxId; }

  GetAllTypesOfModel(mid) {
    const f = this.file(mid);
    return [...f.typesPresent().keys()].map((up) => ({ typeID: typeCode(up), typeName: f.schema.pretty(up) || up }));
  }

  /** A line as an object. flatten: references become the lines they point at (nested to any depth). */
  GetLine(mid, id, flatten = false) {
    const f = this.file(mid);
    return this.lineObject(f, id, flatten, flatten ? new Map() : null, 0);
  }

  lineObject(f, id, flatten, memo, depth) {
    if (memo && memo.has(id)) return memo.get(id);
    const up = f.type(id);
    if (!up) return null;
    const ent = f.schema.entity(up);
    const pretty = ent ? ent.name : up;
    const obj = new (lineClass(pretty))(id, typeCode(up));
    if (memo) memo.set(id, obj);
    const params = f.params(id) || [];
    const attrs = ent ? ent.attrs : params.map((_, k) => ({ name: 'Arg' + k, t: { agg: 0, base: 'S', tname: null } }));
    for (let k = 0; k < attrs.length; k++) {
      let v = toApi(params[k], attrs[k].t, f.schema);
      if (flatten && depth < 64) v = this.flat(f, v, memo, depth + 1);
      obj[attrs[k].name] = v;
    }
    return obj;
  }

  flat(f, v, memo, depth) {
    if (Array.isArray(v)) return v.map((x) => this.flat(f, x, memo, depth));
    if (v instanceof Handle || (v && v.type === REF && typeof v.value === 'number' && !('name' in v))) return this.lineObject(f, v.value, true, memo, depth) ?? v;
    return v;
  }

  // ---- writing ----

  CreateIfcEntity(mid, code, ...args) {
    const f = this.file(mid);
    const up = nameOfCode(code);
    const ent = up && f.schema.entity(up);
    if (!ent) throw new Error('Unknown IFC entity code ' + code + ' in ' + f.schemaName);
    const obj = new (lineClass(ent.name))(-1, code);
    ent.attrs.forEach((a, k) => { obj[a.name] = args[k] === undefined ? null : args[k]; });
    return obj;
  }

  CreateIfcType(mid, code, value) {
    const up = nameOfCode(code);
    if (!up) throw new Error('Unknown IFC type code ' + code);
    return typedApi(up, value, this.file(mid).schema);
  }

  CreateIFCGloballyUniqueId() { return { type: STRING, name: 'IFCGLOBALLYUNIQUEID', value: newGuid() }; }

  WriteLine(mid, line) {
    const f = this.file(mid);
    this.writeObj(f, line, new Set());
    this.dirty(mid);
  }

  writeObj(f, line, busy) {
    const up = nameOfCode(line.type) || String(line.constructor?.name || '').toUpperCase();
    const ent = f.schema.entity(up);
    if (!ent) throw new Error('Cannot write a line of unknown type ' + up);
    if (!(line.expressID > 0)) line.expressID = f.maxId + 1;
    if (busy.has(line.expressID)) return line.expressID;
    busy.add(line.expressID);
    // reserve the id before nested new lines take the next ones
    if (!f.has(line.expressID)) f.set(line.expressID, up, []);
    const params = ent.attrs.map((a) => this.fromApi(f, line[a.name], a.t, busy));
    f.set(line.expressID, up, params);
    return line.expressID;
  }

  fromApi(f, v, t, busy) {
    if (v === null || v === undefined) return null;
    if (v === DERIVED_VALUE || v?.derived) return DERIVED;
    if (Array.isArray(v)) return v.map((x) => this.fromApi(f, x, { ...t, agg: Math.max(0, t.agg - 1) }, busy));
    if (typeof v === 'number') return v;
    if (typeof v === 'string') return t.base === 'e' ? { enum: v } : v;
    if (typeof v === 'boolean') return { enum: v ? 'T' : 'F' };
    if (typeof v !== 'object') return null;
    if ('expressID' in v && v.type !== undefined && typeof v.type === 'number' && v.type !== REF) return { ref: this.writeObj(f, v, busy) };
    if (v instanceof Handle || (v.type === REF && !('name' in v))) return { ref: v.value };
    const name = v.name ? String(v.name).toUpperCase() : null;
    let prim = v.value;
    if (prim && typeof prim === 'object' && !Array.isArray(prim) && 'value' in prim) prim = prim.value;
    const asRaw = (x, base) => {
      if (Array.isArray(x)) return x.map((y) => asRaw(y, base));
      if (base === 'b' || base === 'l' || v.type === ENUM) {
        if (x === true || x === 'T' || x === '.T.') return { enum: 'T' };
        if (x === false || x === 'F' || x === '.F.') return { enum: 'F' };
        if (x === undefined || x === null || x === 'U' || x === '.U.') return base === 'b' || base === 'l' ? { enum: 'U' } : null;
        return { enum: String(x).replace(/^\.|\.$/g, '') };
      }
      if (base === 'r' || base === 'n' || base === 'i') { const n = Number(x); return Number.isFinite(n) ? n : 0; }
      return x === null || x === undefined ? null : String(x);
    };
    if (!name) return asRaw(prim, v.type === ENUM ? 'e' : v.type === STRING || v.type === LABEL ? 's' : v.type === INTEGER ? 'i' : 'r');
    const code = f.schema.typeCode(name);
    const base = code ? code.replace(/^\[+/, '') : t.base;
    const raw = asRaw(prim, base === 'e' ? 'e' : base);
    // a defined type in a SELECT is written with its name; where the attribute itself has that type, bare
    if (t.base === 'S' || (t.tname && t.tname !== name)) return { typed: name, value: raw };
    return raw;
  }

  DeleteLine(mid, id) { this.file(mid).remove(id); this.dirty(mid); }

  dirty(mid) { const m = this.m(mid); if (m.geo) { m.geo.clear(); } }

  SaveModel(mid) { return this.file(mid).save(); }

  // ---- geometry ----

  ensureC(mid) {
    const m = this.m(mid);
    if (m.C) return m.C;
    m.C = I4();
    if (!m.toOrigin) return m.C;
    const geo = this.geometry(mid);
    for (const p of geo.products()) {
      const pcs = geo.pieces(p);
      if (!pcs.length) continue;
      // move the first element's centre to the origin (metres, Y up), as models far from it lose float precision
      const b = geo.mesh(pcs[0].geomId).bounds();
      if (!b) continue;
      const c = [(b.min[0] + b.max[0]) / 2, (b.min[1] + b.max[1]) / 2, (b.min[2] + b.max[2]) / 2];
      const w = mul(this.toYupMetres(mid, pcs[0].matrix), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c[0], c[1], c[2], 1]);
      m.C = translation(-w[12], -w[13], -w[14]);
      break;
    }
    return m.C;
  }

  toYupMetres(mid, matrix) { const u = this.geometry(mid).g.lengthUnit; return mul(YUP, mul(scaling(u), matrix)); }

  GetCoordinationMatrix(mid) { return this.ensureC(mid).slice(); }

  /** The project's georeference (IfcMapConversion / IfcRigidOperation), or null. See geo-ctx.js georef(). */
  GetGeoReference(mid) { return this.geometry(mid).g.georef(); }

  /** World matrix of an IfcObjectPlacement: file units, Z up (as the file has it). */
  GetWorldTransformMatrix(mid, placementId) { return this.geometry(mid).g.placement(placementId).slice(); }

  flatMesh(mid, id) {
    const geo = this.geometry(mid);
    const C = this.ensureC(mid);
    const pcs = geo.pieces(id);
    return {
      expressID: id,
      geometries: new Vector(pcs.map((p) => ({ color: p.color, flatTransformation: mul(C, this.toYupMetres(mid, p.matrix)), geometryExpressID: p.geomId }))),
      delete() {},
    };
  }

  GetFlatMesh(mid, id) { return this.flatMesh(mid, id); }

  StreamAllMeshes(mid, cb) { this.stream(mid, null, cb); }

  StreamAllMeshesWithTypes(mid, codes, cb) {
    const types = [...codes].map((c) => nameOfCode(c)).filter(Boolean);
    this.stream(mid, types, cb);
  }

  stream(mid, types, cb) {
    const geo = this.geometry(mid);
    const ids = geo.products(types ? { types, exclude: [] } : {});
    this.ensureC(mid);
    const total = ids.length;
    let i = 0;
    for (const id of ids) {
      const fm = this.flatMesh(mid, id);
      if (!fm.geometries.size()) continue;
      cb(fm, i++, total);
    }
  }

  GetGeometry(mid, gid) {
    const mesh = this.geometry(mid).mesh(gid);
    const { vertices, indices } = mesh ? mesh.interleaved() : { vertices: new Float32Array(0), indices: new Uint32Array(0) };
    return {
      GetVertexData: () => vertices, GetVertexDataSize: () => vertices.length,
      GetIndexData: () => indices, GetIndexDataSize: () => indices.length,
      delete() {},
    };
  }

  GetVertexArray(data, size) { return size === undefined || size === data.length ? data : data.subarray(0, size); }
  GetIndexArray(data, size) { return size === undefined || size === data.length ? data : data.subarray(0, size); }
}

/** api.properties: the spatial tree, property sets and type properties. */
class Properties {
  constructor(api) { this.api = api; }

  async getItemProperties(mid, id, recursive = false) { return this.api.GetLine(mid, id, recursive); }

  async getPropertySets(mid, id = 0, recursive = false) {
    const f = this.api.file(mid);
    const out = [];
    const rels = f.inverse('IFCRELDEFINESBYPROPERTIES', 'RelatedObjects');
    for (const r of rels.get(id) || []) {
      const def = f.attr(r, 'RelatingPropertyDefinition');
      const ids = Array.isArray(def) ? def.map((x) => x && x.ref).filter(Boolean) : def && def.ref ? [def.ref] : [];
      for (const p of ids) out.push(this.api.GetLine(mid, p, recursive));
    }
    return out.filter(Boolean);
  }

  /**
   * Classifications associated with an element (or its type): [{ system, edition, code, name, location }] from
   * IfcRelAssociatesClassification → IfcClassificationReference (IFC2X3 ItemReference, IFC4 Identification; the system
   * is the IfcClassification at the end of ReferencedSource) or IFC2X3 IfcClassificationNotation facets.
   */
  async getClassifications(mid, id) {
    const f = this.api.file(mid);
    const rels = f.inverse('IFCRELASSOCIATESCLASSIFICATION', 'RelatedObjects');
    const byType = f.inverse('IFCRELDEFINESBYTYPE', 'RelatedObjects');
    const owners = [id, ...(byType.get(id) || []).map((r) => f.attr(r, 'RelatingType')?.ref).filter(Boolean)];
    const str = (v) => (v && typeof v === 'object' && 'typed' in v ? str(v.value) : typeof v === 'string' ? v : null);
    const out = [];
    for (const o of owners) for (const r of rels.get(o) || []) {
      const c = f.attr(r, 'RelatingClassification')?.ref;
      if (!c) continue;
      const t = f.type(c);
      if (t === 'IFCCLASSIFICATIONREFERENCE') {
        let src = f.attr(c, 'ReferencedSource')?.ref, system = null, edition = null, guard = 0;
        while (src && guard++ < 16) {
          if (f.type(src) === 'IFCCLASSIFICATION') { system = str(f.attr(src, 'Name')); edition = str(f.attr(src, 'Edition')); break; }
          src = f.attr(src, 'ReferencedSource')?.ref;
        }
        out.push({ system, edition, code: str(f.attr(c, 'Identification') ?? f.attr(c, 'ItemReference')), name: str(f.attr(c, 'Name')), location: str(f.attr(c, 'Location')) });
      } else if (t === 'IFCCLASSIFICATIONNOTATION') {
        for (const fc of f.attr(c, 'NotationFacets') || []) out.push({ system: null, edition: null, code: str(f.attr(fc?.ref, 'NotationValue')), name: null, location: null });
      } else if (t === 'IFCCLASSIFICATION') {
        out.push({ system: str(f.attr(c, 'Name')), edition: str(f.attr(c, 'Edition')), code: null, name: null, location: str(f.attr(c, 'Location')) });
      }
    }
    return out;
  }

  /** Groups an element is assigned to (IfcRelAssignsToGroup): zones, systems … → [{ expressID, type, name, longName }]. */
  async getGroups(mid, id) {
    const f = this.api.file(mid);
    const rels = f.inverse('IFCRELASSIGNSTOGROUP', 'RelatedObjects');
    const str = (v) => (v && typeof v === 'object' && 'typed' in v ? str(v.value) : typeof v === 'string' ? v : null);
    const out = [];
    for (const r of rels.get(id) || []) {
      const g = f.attr(r, 'RelatingGroup')?.ref;
      if (g && f.has(g)) out.push({ expressID: g, type: f.schema.pretty(f.type(g)), name: str(f.attr(g, 'Name')), longName: str(f.attr(g, 'LongName')) });
    }
    return out;
  }

  async getTypeProperties(mid, id = 0, recursive = false) {
    const f = this.api.file(mid);
    const out = [];
    const rels = f.inverse('IFCRELDEFINESBYTYPE', 'RelatedObjects');
    for (const r of rels.get(id) || []) {
      const t = f.attr(r, 'RelatingType');
      if (t && t.ref) out.push(this.api.GetLine(mid, t.ref, recursive));
    }
    return out.filter(Boolean);
  }

  /**
   * The spatial tree from the project down: IfcRelAggregates (any object's parts) and IfcRelContainedInSpatialStructure
   * (elements in a storey, space, building …). Nodes { expressID, type, children }; the root's type is upper case.
   */
  async getSpatialStructure(mid, includeProperties = false) {
    const f = this.api.file(mid);
    const proj = f.ofType('IFCPROJECT')[0];
    if (proj === undefined) return null;
    const agg = f.inverse('IFCRELAGGREGATES', 'RelatingObject');
    const cont = f.inverse('IFCRELCONTAINEDINSPATIALSTRUCTURE', 'RelatingStructure');
    const kids = (id, attr, map) => {
      const out = [];
      for (const r of map.get(id) || []) for (const x of f.attr(r, attr) || []) if (x && x.ref) out.push(x.ref);
      return out;
    };
    const seen = new Set();
    const node = (id, depth) => {
      seen.add(id);
      const up = f.type(id);
      const n = { expressID: id, type: depth === 0 ? up : f.schema.pretty(up) || up, children: [] };
      if (includeProperties) Object.assign(n, this.api.GetLine(mid, id, false));
      if (depth < 64) for (const c of [...kids(id, 'RelatedObjects', agg), ...kids(id, 'RelatedElements', cont)]) if (!seen.has(c) && f.has(c)) n.children.push(node(c, depth + 1));
      return n;
    };
    return node(proj, 0);
  }
}

// ---- values ----

const KIND = { s: STRING, r: REAL, n: REAL, i: INTEGER, b: ENUM, l: ENUM, e: ENUM, x: STRING };

/** A raw value (step.js) of an attribute with type code t → the API shape. */
export function toApi(v, t, schema) {
  if (v === null || v === undefined) return null;
  if (v === DERIVED) return DERIVED_VALUE;
  if (Array.isArray(v)) {
    // an aggregate: each member has the attribute's leaf type (defined types over lists are one value)
    const inner = t.agg > 0 ? { ...t, agg: t.agg - 1 } : t;
    return v.map((x) => toApi(x, inner, schema));
  }
  if (typeof v === 'object') {
    if ('ref' in v) return new Handle(v.ref);
    if ('typed' in v) return typedApi(v.typed, v.value, schema);
    if ('enum' in v) {
      if (t.base === 'b' || t.base === 'l') return logical(v.enum, t.tname || (t.base === 'b' ? 'IFCBOOLEAN' : 'IFCLOGICAL'));
      return { type: ENUM, value: v.enum };
    }
    if ('bin' in v) return { type: STRING, value: v.bin };
    return null;
  }
  if (typeof v === 'string') return t.tname ? { type: STRING, name: t.tname, value: v } : { type: STRING, value: v };
  if (typeof v === 'number') {
    const k = t.base === 'i' ? INTEGER : REAL;
    return { type: k, name: t.tname || (k === INTEGER ? 'IFCINTEGER' : 'IFCREAL'), value: v };
  }
  return null;
}

function logical(e, name) { return { type: ENUM, name, value: e === 'T' ? true : e === 'F' ? false : undefined }; }

/** A value of defined type `name` (upper case) → { type, name, value }. */
function typedApi(name, value, schema) {
  const code = schema.typeCode(name) || anyTypeCode(name) || 's';
  const base = code.replace(/^\[+/, '');
  const unwrap = (x) => {
    if (Array.isArray(x)) return x.map(unwrap);
    if (x && typeof x === 'object') { if ('enum' in x) return base === 'b' || base === 'l' ? (x.enum === 'T' ? true : x.enum === 'F' ? false : undefined) : x.enum; if ('value' in x) return unwrap(x.value); }
    if (base === 'b' || base === 'l') return x === true || x === 'T' ? true : x === false || x === 'F' ? false : x;
    if ((base === 'r' || base === 'n' || base === 'i') && typeof x === 'string' && x.trim() !== '' && Number.isFinite(Number(x))) return Number(x);
    return x;
  };
  return { type: KIND[base] ?? STRING, name, value: unwrap(value) };
}

function anyTypeCode(name) {
  for (const s of ['IFC4X3', 'IFC4', 'IFC2X3']) { const c = schemaFor(s).typeCode(name); if (c) return c; }
  return null;
}

// ---- GUIDs (IFC's 22-character base-64 form of a 128-bit UUID) ----

const B64 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_$';

export function newGuid() {
  const b = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) globalThis.crypto.getRandomValues(b);
  else for (let i = 0; i < 16; i++) b[i] = Math.floor(Math.random() * 256);
  b[6] = (b[6] & 0x0F) | 0x40; b[8] = (b[8] & 0x3F) | 0x80;   // a version 4 UUID
  return guidFromBytes(b);
}

export function guidFromBytes(b) {
  // 128 bits = 2 + 21 × 6: the first character carries the top 2 bits
  let out = B64[b[0] >> 6];
  let acc = BigInt(0);
  for (const x of b) acc = (acc << BigInt(8)) | BigInt(x);
  for (let i = 20; i >= 0; i--) out += B64[Number((acc >> BigInt(i * 6)) & BigInt(63))];
  return out;
}

export { CONSTANTS };
