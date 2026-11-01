/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil.js — 0.7.1 71.24 (semhustej, Discord 2026-10-26: "IFC is a required deliverable" in European public procurement; "support
 * all widely used IFC schema types (2x3, 4.0, 4.3)"). The whole CivilCraft project as ONE IFC file, in the schema the person picks.
 * DOM-free, no library: ISO 10303-21 text written line by line like ifc-massing.js and landscape/ifc-landscape.js, but every entity
 * goes through the schema table of cc-ifc (./ifc/schema.js, generated from buildingSMART's EXPRESS files): attributes are put in the
 * schema's order, derived ones written '*', a required one left out throws, and an enumeration value the schema does not have becomes
 * USERDEFINED with the meaning kept in ObjectType. So the same code writes all three schemas, and a slip shows in the Node test.
 *
 *   writeCivilIfc(model, { schema, now, seed }) → { text, schema, counts, unit, origin }
 *     model   ifc-civil-model.js civilIfcModel(project) (project units, absolute coordinates)
 *     schema  'IFC4X3_ADD2' (default) | 'IFC4' (ADD2 TC1) | 'IFC2X3' (TC1)
 *   SCHEMAS · SCHEMA_INFO[schema] = { label, file, losses: [lang keys] } (what the export dialog says each schema loses)
 *
 * What each schema gets (docs/apps/civilcraft-ifc.md has the table):
 *   IFC4X3_ADD2  IfcAlignment (aggregated to the project) nesting IfcAlignmentHorizontal (LINE / CIRCULARARC / CLOTHOID segments)
 *                and IfcAlignmentVertical (CONSTANTGRADIENT / PARABOLICARC), each ending in the zero-length segment the standard asks
 *                for; its geometry: 'FootPrint' IfcCompositeCurve of IfcCurveSegments (IfcLine / IfcCircle / IfcClothoid parents) and
 *                'Axis' IfcGradientCurve (IfcLine / IfcPolynomialCurve) — or 'Axis' the composite curve with no profile; the start
 *                station as an IfcReferent STATION (Pset_Stationing) and superelevation transitions as IfcReferent SUPERELEVATIONEVENT
 *                (Pset_Superelevation, one per side) on IfcLinearPlacement. No IfcAlignmentCant: cant is the rail layout (it needs a
 *                rail head distance); a road's superelevation is these events plus the rolled road surfaces.
 *                Each corridor: IfcRoad (in the site) > IfcRoadPart CARRIAGEWAY / SHOULDER / ROADSIDE / SIDEWALK holding IfcPavement
 *                (lanes, shoulders, gutters, walks), IfcKerb (curbs), IfcGeographicElement (planting strips) as surfaces from the
 *                sections, IfcEarthworksCut / IfcEarthworksFill (the daylight slopes, the corridor's cut and fill volumes); the
 *                alignment is referenced in the road and positions its elements (IfcRelPositions); Pset_RoadDesignCriteriaCommon.
 *                Surfaces: IfcGeographicElement TERRAIN with IfcTriangulatedIrregularNetwork. Pads: TERRAIN top + earthworks + IfcWall
 *                RETAININGWALL. IfcPipeSegment / IfcDistributionChamberElement in an IfcDistributionSystem. Parcels: IfcGeographicElement
 *                'Parcel' footprints. Landscape (IfcGeographicElement VEGETATION, IfcPavement, IfcKerb, walls, ramps, steps) and the
 *                building masses (IfcBuilding > IfcBuildingStorey + IfcBuildingElementProxy) in the same IfcSite.
 *   IFC4         no alignment or road entities: the alignment is an IfcCivilElement 'Alignment' with an 'Axis' 3D IfcPolyline and a
 *                'FootPrint' 2D one; road parts and earthworks are IfcCivilElement (ObjectType says what) grouped per road in an
 *                IfcGroup; TINs are IfcTriangulatedFaceSet; walls IfcWall USERDEFINED 'Retaining wall'. Same psets.
 *   IFC2X3       as IFC4 with IfcBuildingElementProxy for civil elements, IfcFlowSegment for pipes, IfcSystem, surfaces as
 *                IfcShellBasedSurfaceModel (closed solids IfcFacetedBrep), georeferencing as ePSet_MapConversion / ePSet_ProjectedCRS
 *                on the site (buildingSMART's georeferencing guide for IFC2x3), an IfcOwnerHistory on every rooted entity.
 * Every schema: property set CadCraft_Alignment carries the PI and PVI tables as text, so CivilCraft reads its own file back exactly
 * whatever the schema (ifc-civil-read.js prefers the 4.3 layout when there is one).
 *
 * Units and place (ifc-massing.js's rules): the file's length unit is the project's (metre, or the US survey foot / foot as an
 * IfcConversionBasedUnit); areas and volumes SI. Coordinates are written from a local origin (the content's middle rounded to 100
 * units, elevations unchanged); with a coordinate system IfcProjectedCRS + IfcMapConversion carry the origin's grid easting and
 * northing (a local "ground" system — crs.local — as its rotation and scale), else pset CadCraft_Site keeps the origin.
 */

import { schemaFor } from './ifc/schema.js';
import { guid } from './landscape/ifc-landscape.js';
import { fileUnit, FT_US_M } from './ifc-massing.js';

export const SCHEMAS = ['IFC4X3_ADD2', 'IFC4', 'IFC2X3'];
export const SCHEMA_INFO = {
  IFC4X3_ADD2: { key: 'IFC4X3', file: '4x3', losses: ['ifc.loss.43.cant', 'ifc.loss.43.thick'] },
  IFC4: { key: 'IFC4', file: '4', losses: ['ifc.loss.4.align', 'ifc.loss.4.road', 'ifc.loss.43.thick'] },
  IFC2X3: { key: 'IFC2X3', file: '2x3', losses: ['ifc.loss.4.align', 'ifc.loss.2.proxy', 'ifc.loss.2.geo', 'ifc.loss.2.mesh'] },
};

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const R = (v, d = 6) => { if (!fin(v)) return '0.'; let s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace(/(\.\d*?)0+$/, '$1'); if (!s.includes('.')) s += '.'; return s === '-0.' ? '0.' : s; };
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
const E = (v) => '.' + String(v).toUpperCase().replace(/[^A-Z0-9_]/g, '') + '.';
const L = (a) => '(' + a.join(',') + ')';
const B = (v) => (v ? '.T.' : '.F.');
const words = (s) => String(s).toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** The STEP writer over one schema's table. */
class W {
  constructor(name) {
    this.name = name; this.s = schemaFor(SCHEMA_INFO[name].key);
    this.lines = []; this.n = 0; this.cache = new Map(); this.enums = new Map();
    this.x4 = name === 'IFC4X3_ADD2'; this.x2 = name === 'IFC2X3';
  }
  has(cls) { const e = this.s.entity(cls.toUpperCase()); return !!e && !e.abstract; }
  add(s) { this.n++; this.lines.push('#' + this.n + '=' + s + ';'); return '#' + this.n; }
  once(s) { if (!this.cache.has(s)) this.cache.set(s, this.add(s)); return this.cache.get(s); }
  enumValues(tname) {
    if (!this.enums.has(tname)) { const t = this.s.table.typ[tname]; this.enums.set(tname, t && t[1] === 'e' ? new Set(String(t[2]).split(';')) : null); }
    return this.enums.get(tname);
  }
  /** One entity: `a` = attribute name → Part 21 text (null / undefined = unset). `a._ot` = the ObjectType / ElementType to use when an
   *  enumeration value falls back to USERDEFINED (else the value in words). Attributes the schema does not have are left out. */
  line(cls, a = {}) {
    const up = cls.toUpperCase(), e = this.s.entity(up);
    if (!e || e.abstract) throw new Error(cls + ' is not an entity of ' + this.name);   // i18n-ignore: a programming error (tests)
    const v = { ...a };
    for (const at of e.attrs) {
      const x = v[at.name];
      if (at.t.base !== 'e' || !at.t.tname || typeof x !== 'string') continue;
      const m = /^\.([A-Z0-9_]+)\.$/.exec(x), ok = m && this.enumValues(at.t.tname);
      if (!ok || ok.has(m[1])) continue;
      if (ok.has('USERDEFINED')) {
        v[at.name] = '.USERDEFINED.';
        for (const k of ['ObjectType', 'ElementType']) if (e.index.has(k) && (v[k] == null || v[k] === '$')) v[k] = S(a._ot || words(m[1]));
      } else v[at.name] = ok.has('NOTDEFINED') ? '.NOTDEFINED.' : null;
    }
    // a USERDEFINED predefined type needs its ObjectType / ElementType (the schemas' CorrectPredefinedType rules)
    if (v.PredefinedType === '.USERDEFINED.') for (const k of ['ObjectType', 'ElementType']) if (e.index.has(k) && (v[k] == null || v[k] === '$')) v[k] = S(a._ot || v.Name?.slice?.(1, -1) || 'Element');
    const vals = e.attrs.map((at) => {
      if (e.derived.has(at.name)) return '*';
      const x = v[at.name];
      if (x == null || x === '$') { if (!at.t.opt) throw new Error(e.name + '.' + at.name + ' is required in ' + this.name); return '$'; }   // i18n-ignore: a programming error (tests)
      return x;
    });
    return up + '(' + vals.join(',') + ')';
  }
  ent(cls, a) { return this.add(this.line(cls, a)); }
  one(cls, a) { return this.once(this.line(cls, a)); }
  pt(p) { return this.one('IfcCartesianPoint', { Coordinates: L(p.map((v) => R(v))) }); }
  dir(d) { return this.one('IfcDirection', { DirectionRatios: L(d.map((v) => R(v, 12))) }); }
}

function triArea(P, a, b, c) {
  const ux = P[b * 3] - P[a * 3], uy = P[b * 3 + 1] - P[a * 3 + 1], uz = P[b * 3 + 2] - P[a * 3 + 2], vx = P[c * 3] - P[a * 3], vy = P[c * 3 + 1] - P[a * 3 + 1], vz = P[c * 3 + 2] - P[a * 3 + 2];
  return Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
}
/** Length of y = A + Bx + Cx² over 0 … L (closed form; a straight line when C = 0). */
export function parabolaLength(B, C, Lh) {
  if (Math.abs(C) < 1e-15) return Lh * Math.hypot(1, B);
  const F = (x) => { const d = B + 2 * C * x, r = Math.hypot(1, d); return (d * r + Math.asinh(d)) / (4 * C); };
  return F(Lh) - F(0);
}
/** The middle of everything, rounded to 100 units (z stays 0: elevations are written as they are). */
export function fileOrigin(m) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const see = (x, y) => { if (fin(x) && fin(y)) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); } };
  for (const a of m.alignments) for (const q of a.poly) see(q.x, q.y);
  for (const s of m.surfaces) for (const q of s.pts) see(q.x, q.y);
  for (const p of m.pads) for (let i = 0; i < (p.top?.pos.length || 0); i += 3) see(p.top.pos[i], p.top.pos[i + 1]);
  for (const s of m.network?.structures || []) see(s.x, s.y);
  for (const r of m.parcels) for (const q of r.pts) see(q.x, q.y);
  for (const e of m.landscape) if (e.at) see(e.at.x, e.at.y);
  for (const ms of m.masses) for (const q of ms.pts) see(q.x, q.y);
  if (!fin(x0)) return { x: 0, y: 0, z: 0 };
  return { x: Math.round((x0 + x1) / 200) * 100, y: Math.round((y0 + y1) / 200) * 100, z: 0 };
}

export function writeCivilIfc(model, { schema = 'IFC4X3_ADD2', now = new Date(), seed = model.name || 'site', origin = null, projectPsets = [] } = {}) {
  if (!SCHEMA_INFO[schema]) throw new Error('Unknown IFC schema ' + schema);   // i18n-ignore: a programming error
  const w = new W(schema), X4 = w.x4, X2 = w.x2, units = model.units, crs = model.crs;
  const o = origin || fileOrigin(model), lx = (x) => x - o.x, ly = (y) => y - o.y, lz = (z) => z - o.z;
  const id = (s) => S(guid(seed + '|' + s));
  const unit = fileUnit(units, crs), um = unit === 'm' ? 1 : unit === 'ft' ? 0.3048 : FT_US_M, m2 = (a) => a * um * um, m3 = (v) => v * um * um * um;
  const meshArea = (m) => { let s = 0; for (let i = 0; i < m.idx.length; i += 3) s += triArea(m.pos, m.idx[i], m.idx[i + 1], m.idx[i + 2]); return m2(s); };
  const counts = { alignments: 0, segments: 0, referents: 0, roads: 0, roadParts: 0, courses: 0, elements: 0, earthworks: 0, surfaces: 0, triangles: 0, pads: 0, walls: 0, pipes: 0, structures: 0, parcels: 0, landscape: 0, masses: 0, psets: 0, quantities: 0 };

  // ---- owner history (IFC2x3 requires one on every rooted entity), contexts, units, project
  let OH = null;
  if (X2) {
    const org = w.ent('IfcOrganization', { Name: S('CadCraft') });   // i18n-ignore: the maker's name
    const pao = w.ent('IfcPersonAndOrganization', { ThePerson: w.ent('IfcPerson', { FamilyName: S('') }), TheOrganization: org });
    const app = w.ent('IfcApplication', { ApplicationDeveloper: org, Version: S('0.7.1'), ApplicationFullName: S('CivilCraft'), ApplicationIdentifier: S('CivilCraft') });   // i18n-ignore: product names
    OH = w.ent('IfcOwnerHistory', { OwningUser: pao, OwningApplication: app, ChangeAction: '.NOCHANGE.', CreationDate: String(Math.floor(now.getTime() / 1000)) });
  }
  const tags = {};   // GlobalId → the tag it was made from (71.27: which project object an element came from)
  const root = (cls, tag, a) => { const gid = guid(seed + '|' + tag); tags[gid] = tag; return w.ent(cls, { GlobalId: S(gid), OwnerHistory: OH, ...a }); };
  const O3 = w.pt([0, 0, 0]), O2 = w.pt([0, 0]), X2D = w.dir([1, 0]);
  const WCS = w.ent('IfcAxis2Placement3D', { Location: O3 });
  const ax0 = w.ent('IfcAxis2Placement3D', { Location: O3 });   // the identity every element placement shares
  const ax2d0 = w.one('IfcAxis2Placement2D', { Location: O2, RefDirection: X2D });
  const ctx = w.ent('IfcGeometricRepresentationContext', { ContextType: S('Model'), CoordinateSpaceDimension: '3', Precision: '1.E-05', WorldCoordinateSystem: WCS, TrueNorth: w.dir([0, 1]) });
  const sub = (ident, view) => w.ent('IfcGeometricRepresentationSubContext', { ContextIdentifier: S(ident), ContextType: S('Model'), ParentContext: ctx, TargetView: view });
  const cBody = sub('Body', '.MODEL_VIEW.'), cAxis = sub('Axis', '.GRAPH_VIEW.'), cFoot = sub('FootPrint', '.PLAN_VIEW.');
  const metre = w.ent('IfcSIUnit', { UnitType: '.LENGTHUNIT.', Name: '.METRE.' });
  let length = metre;
  if (unit !== 'm') {
    const dims = w.ent('IfcDimensionalExponents', { LengthExponent: '1', MassExponent: '0', TimeExponent: '0', ElectricCurrentExponent: '0', ThermodynamicTemperatureExponent: '0', AmountOfSubstanceExponent: '0', LuminousIntensityExponent: '0' });
    const mwu = w.ent('IfcMeasureWithUnit', { ValueComponent: 'IFCLENGTHMEASURE(' + R(um, 16) + ')', UnitComponent: metre });
    // i18n-ignore: IFC file data (the unit's name), English like every IFC we write
    length = w.ent('IfcConversionBasedUnit', { Dimensions: dims, UnitType: '.LENGTHUNIT.', Name: S(unit === 'ft' ? 'foot' : 'US survey foot'), ConversionFactor: mwu });
  }
  const ua = w.ent('IfcUnitAssignment', { Units: L([length, w.ent('IfcSIUnit', { UnitType: '.AREAUNIT.', Name: '.SQUARE_METRE.' }), w.ent('IfcSIUnit', { UnitType: '.VOLUMEUNIT.', Name: '.CUBIC_METRE.' }), w.ent('IfcSIUnit', { UnitType: '.PLANEANGLEUNIT.', Name: '.RADIAN.' })]) });
  const project = root('IfcProject', 'project', { Name: S(model.name || 'Site'), RepresentationContexts: L([ctx]), UnitsInContext: ua });

  // ---- property sets and quantities
  const T = {
    len: (v) => 'IFCLENGTHMEASURE(' + R(v) + ')', pos: (v) => 'IFCPOSITIVELENGTHMEASURE(' + R(Math.max(v, 1e-6)) + ')', area: (v) => 'IFCAREAMEASURE(' + R(v) + ')',
    vol: (v) => 'IFCVOLUMEMEASURE(' + R(v) + ')', ratio: (v) => 'IFCRATIOMEASURE(' + R(v, 9) + ')', label: (s) => 'IFCLABEL(' + S(String(s).slice(0, 255)) + ')', text: (s) => 'IFCTEXT(' + S(s) + ')',
    bool: (v) => 'IFCBOOLEAN(' + B(v) + ')', speed: (v) => 'IFCLINEARVELOCITYMEASURE(' + R(v, 9) + ')', int: (v) => 'IFCINTEGER(' + Math.round(v) + ')', count: (v) => 'IFCCOUNTMEASURE(' + Math.round(v) + ')', real: (v) => 'IFCREAL(' + R(v) + ')',
  };
  const pset = (objs, name, props, tag) => {
    const ps = props.filter(([, v]) => v != null && v !== '' && !(typeof v === 'number' && !fin(v))).map(([k, v, f]) => w.ent('IfcPropertySingleValue', { Name: S(k), NominalValue: T[f](v) }));
    if (!ps.length || !objs.length) return null;
    const set = root('IfcPropertySet', 'pset|' + tag + '|' + name, { Name: S(name), HasProperties: L(ps) });
    counts.psets++;
    root('IfcRelDefinesByProperties', 'rdp|' + tag + '|' + name, { RelatedObjects: L(objs), RelatingPropertyDefinition: set });
    return set;
  };
  const QK = { len: ['IfcQuantityLength', 'LengthValue', (v) => R(v)], area: ['IfcQuantityArea', 'AreaValue', (v) => R(m2(v))], vol: ['IfcQuantityVolume', 'VolumeValue', (v) => R(m3(v))], count: ['IfcQuantityCount', 'CountValue', (v) => R(v)], kg: ['IfcQuantityWeight', 'WeightValue', (v) => R(v)] };
  const qto = (objs, name, qs, tag) => {
    const list = qs.filter(([, , v]) => fin(v)).map(([k, kind, v]) => { const [cls, attr, f] = QK[kind]; return w.ent(cls, { Name: S(k), [attr]: f(v) }); });
    if (!list.length || !objs.length) return;
    const set = root('IfcElementQuantity', 'qto|' + tag + '|' + name, { Name: S(name), MethodOfMeasurement: name.startsWith('Qto_') ? S('BaseQuantities') : null, Quantities: L(list) });
    counts.quantities++;
    root('IfcRelDefinesByProperties', 'rdq|' + tag + '|' + name, { RelatedObjects: L(objs), RelatingPropertyDefinition: set });
  };

  // ---- geometry helpers (local coordinates)
  const place = (rel, at = null) => w.ent('IfcLocalPlacement', { PlacementRelTo: rel, RelativePlacement: at || ax0 });
  const shape = (reps) => w.ent('IfcProductDefinitionShape', { Representations: L(reps.map(([c, ident, type, items]) => w.ent('IfcShapeRepresentation', { ContextOfItems: c, RepresentationIdentifier: S(ident), RepresentationType: S(type), Items: L(items) }))) });
  /** A triangle mesh (project coordinates) as a body item: [rep type, item]. */
  const tess = (mesh, { tin = false } = {}) => {
    const P = mesh.pos, I = mesh.idx, n = P.length / 3;
    counts.triangles += I.length / 3;
    if (!X2) {
      const pts = [];
      for (let i = 0; i < n; i++) pts.push('(' + R(lx(P[i * 3])) + ',' + R(ly(P[i * 3 + 1])) + ',' + R(lz(P[i * 3 + 2])) + ')');
      const tris = [];
      for (let i = 0; i < I.length; i += 3) tris.push('(' + (I[i] + 1) + ',' + (I[i + 1] + 1) + ',' + (I[i + 2] + 1) + ')');
      const coords = w.ent('IfcCartesianPointList3D', { CoordList: L(pts) });
      if (tin && X4) return ['Tessellation', w.ent('IfcTriangulatedIrregularNetwork', { Coordinates: coords, Closed: '.F.', CoordIndex: L(tris), Flags: L(tris.map(() => '0')) })];
      return ['Tessellation', w.ent('IfcTriangulatedFaceSet', { Coordinates: coords, Closed: B(!!mesh.closed), CoordIndex: L(tris) })];
    }
    const pts = [];
    for (let i = 0; i < n; i++) pts.push(w.ent('IfcCartesianPoint', { Coordinates: L([R(lx(P[i * 3])), R(ly(P[i * 3 + 1])), R(lz(P[i * 3 + 2]))]) }));
    const faces = [];
    for (let i = 0; i < I.length; i += 3) faces.push(w.ent('IfcFace', { Bounds: L([w.ent('IfcFaceOuterBound', { Bound: w.ent('IfcPolyLoop', { Polygon: L([pts[I[i]], pts[I[i + 1]], pts[I[i + 2]]]) }), Orientation: '.T.' })]) }));
    if (mesh.closed) return ['Brep', w.ent('IfcFacetedBrep', { Outer: w.ent('IfcClosedShell', { CfsFaces: L(faces) }) })];
    return ['SurfaceModel', w.ent('IfcShellBasedSurfaceModel', { SbsmBoundary: L([w.ent('IfcOpenShell', { CfsFaces: L(faces) })]) })];
  };
  const body = (mesh, opts) => { const [type, item] = tess(mesh, opts); return shape([[cBody, 'Body', type, [item]]]); };
  /** The class this schema has for `cls` (IfcCivilElement in IFC4, IfcBuildingElementProxy in IFC2x3; IfcFlowSegment for pipes in 2x3). */
  const clsFor = (cls) => (w.has(cls) ? cls : cls === 'IfcPipeSegment' ? 'IfcFlowSegment' : w.has('IfcCivilElement') ? 'IfcCivilElement' : 'IfcBuildingElementProxy');
  /** An element: { cls, pre (predefined type), name, label (what it is, in words: ObjectType when the class or type falls back), tag }. */
  const element = ({ cls, pre = 'NOTDEFINED', name, label, tag, rep = null, at = null, extra = {} }) => {
    const c = clsFor(cls), fell = c !== cls || (pre !== 'NOTDEFINED' && !w.s.entity(c.toUpperCase()).index.has('PredefinedType'));   // (IFC2x3's IfcWall has no predefined type)
    counts.elements++;
    const ref = root(c, 'el|' + tag, { Name: S(name), ObjectType: fell || pre === 'USERDEFINED' ? S(label) : null, ObjectPlacement: place(siteLP, at), Representation: rep, Tag: S(tag), PredefinedType: E(pre), ShapeType: E(pre), _ot: label, ...extra });
    classOf.set(ref, c);
    return ref;
  };
  const classOf = new Map(), isCut = (el) => classOf.get(el) === 'IfcEarthworksCut';   // 4.3: a subtraction, never contained

  // ---- georeferencing and the site
  const siteLP = place(null);
  let latlon = null;
  if (fin(model.lat) && fin(model.lon)) {
    const dms = (deg) => { const sg = deg < 0 ? -1 : 1, a = Math.abs(deg), d = Math.floor(a), mm = Math.floor((a - d) * 60), sc = ((a - d) * 60 - mm) * 60, s = Math.floor(sc), u = Math.round((sc - s) * 1e6); return L([sg * d, sg * mm, sg * s, sg * u]); };
    latlon = [dms(model.lat), dms(model.lon)];
  }
  const site = root('IfcSite', 'site', { Name: S(model.name || 'Site'), ObjectPlacement: siteLP, CompositionType: '.ELEMENT.', RefLatitude: latlon?.[0], RefLongitude: latlon?.[1], RefElevation: R(o.z) });
  const projectKids = [site];
  let geo = null;
  if (crs) {
    const l = crs.local, rot = l ? (l.rotation * Math.PI) / 180 : 0, sc = l ? l.scale : 1;
    const E0 = l ? l.to[0] + sc * (Math.cos(rot) * (o.x - l.from[0]) - Math.sin(rot) * (o.y - l.from[1])) : o.x;
    const N0 = l ? l.to[1] + sc * (Math.sin(rot) * (o.x - l.from[0]) + Math.cos(rot) * (o.y - l.from[1])) : o.y;
    const datum = /\+datum=([^\s+]+)/.exec(crs.proj4 || '')?.[1] || /\+ellps=([^\s+]+)/.exec(crs.proj4 || '')?.[1] || crs.name || 'unknown';   // i18n-ignore: IFC file data
    geo = { name: crs.code ? 'EPSG:' + crs.code : crs.name || 'CRS', desc: crs.name || '', datum, E0, N0, H: o.z, xa: Math.cos(rot), xo: Math.sin(rot), scale: sc };
    if (!X2) {
      const crsId = w.ent('IfcProjectedCRS', { Name: S(geo.name), Description: S(geo.desc), GeodeticDatum: S(geo.datum), MapUnit: length });
      w.ent('IfcMapConversion', { SourceCRS: ctx, TargetCRS: crsId, Eastings: R(E0), Northings: R(N0), OrthogonalHeight: R(o.z), XAxisAbscissa: R(geo.xa, 12), XAxisOrdinate: R(geo.xo, 12), Scale: R(sc, 12) });
    } else {
      pset([site], 'ePSet_ProjectedCRS', [['Name', geo.name, 'label'], ['Description', geo.desc, 'label'], ['GeodeticDatum', geo.datum, 'label'], ['MapUnit', unit === 'm' ? 'METRE' : unit === 'ft' ? 'FOOT' : 'US SURVEY FOOT', 'label']], 'site');   // i18n-ignore: IFC file data
      pset([site], 'ePSet_MapConversion', [['Eastings', E0, 'len'], ['Northings', N0, 'len'], ['OrthogonalHeight', o.z, 'len'], ['XAxisAbscissa', geo.xa, 'real'], ['XAxisOrdinate', geo.xo, 'real'], ['Scale', sc, 'real']], 'site');
    }
  }
  // i18n-ignore: IFC file data (property values in English, like every IFC we write)
  pset([site], 'CadCraft_Site', [['OriginEasting', o.x, 'len'], ['OriginNorthing', o.y, 'len'], ['ProjectUnits', units === 'm' ? 'metre' : 'US survey foot', 'label'], ['Source', 'CivilCraft', 'label']], 'site');
  const siteKids = [], contain = new Map();   // container → [elements]
  const put = (container, el) => { if (!contain.has(container)) contain.set(container, []); contain.get(container).push(el); };

  // 0.7.1 71.24: an alignment's design speed (with its unit, and in m/s for IFC's IfcLinearVelocityMeasure) and class
  const MPS = { 'km/h': 1 / 3.6, mph: 0.44704 };
  const designProps = (d) => (d ? [['DesignSpeed', fin(d.speed) ? d.speed + ' ' + d.unit : null, 'label'], ['DesignSpeedValue', fin(d.speed) ? d.speed : null, 'real'], ['DesignSpeedUnit', fin(d.speed) ? d.unit : null, 'label'], ['DesignClass', d.cls || null, 'label']] : []);

  /**
   * 0.7.1 71.26 / B: IfcAlignmentCant — rail.js cantPlan's segments (each rail's height over the profile, left / right looking up-station;
   * RailHeadDistance = rail.js baseOf, the rail-centre distance) with the zero-length end, Pset_AlignmentCantSegmentCommon on a curve's constant
   * cant (equilibrium and deficiency), and its geometry: an IfcSegmentedReferenceCurve over the gradient curve, the segments mapped as
   * IfcOpenShell (the reference implementation) maps them — the curve's ordinate is the mean height of the two rails, its parent curve the
   * cant's own shape (IfcLine, IfcClothoid for the linear ramp, the Bloss / Helmert / cosine / sine spirals), the placement's Axis leaning by the
   * rails' difference over the rail head distance.
   */
  function cantLayout(a, tag, grad, layouts) {
    const C = a.cant, mmU = (v) => v / 1000 / um, base = mmU(C.base), segs = [], curve = [];
    const axis = (half) => { const dy = 2 * half, dz = Math.sqrt(Math.max(0, base * base - dy * dy)); return w.dir([0, dy / base, dz / base]); };
    const lineP = () => w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) });
    const P2 = (x, y) => w.ent('IfcAxis2Placement2D', { Location: w.pt([x, y]), RefDirection: X2D });
    const smooth = (q) => q && q.type !== 'LINEARTRANSITION';   // zero slope at both ends (constant, Bloss, Helmert, cosine, sine)
    C.segments.forEach((q, i) => {
      const nx = C.segments[i + 1], d0 = q.start - a.start, Lh = q.length;
      const sl = mmU(q.startLeft), sr = mmU(q.startRight), el = mmU(q.endLeft), er = mmU(q.endRight);
      const Ds = (sl + sr) / 2, De = (el + er) / 2, f = De - Ds, half = (sr - sl) / 2;
      const T = (a2, n, p) => (a2 ? R(Lh ** p * Math.abs(a2) ** (-1 / n) * Math.sign(a2), 9) : null);
      // (codes as IfcOpenShell works them out on the 3D curve: smooth cant ends meet with the same curvature)
      const trans = !nx ? (smooth(q) ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.') : smooth(q) && smooth(nx) ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTINUOUS.';
      const seg = (start, len, parent, at, dir = 0) => curve.push(w.ent('IfcCurveSegment', { Transition: trans, Placement: w.ent('IfcAxis2Placement3D', { Location: w.pt(at), Axis: axis(half), RefDirection: w.dir([Math.cos(dir), Math.sin(dir), 0]) }),
        SegmentStart: 'IFCLENGTHMEASURE(' + R(start) + ')', SegmentLength: 'IFCLENGTHMEASURE(' + R(len) + ')', ParentCurve: parent }));
      if (q.type === 'CONSTANTCANT' || !f) seg(0, Lh, lineP(), [d0, Ds, 0]);
      else if (q.type === 'LINEARTRANSITION') { const A1 = Lh ** 1.5 * Math.abs(f) ** -0.5 * Math.sign(f); seg(0, Lh, w.ent('IfcClothoid', { Position: P2(0, 0), ClothoidConstant: R(A1, 9) }), [d0, Ds, 0], Math.atan((A1 * Lh * Lh) / Math.abs(A1 ** 3))); }
      else if (q.type === 'BLOSSCURVE') seg(0, Lh, w.ent('IfcThirdOrderPolynomialSpiral', { Position: P2(0, 0), CubicTerm: T(-2 * f, 4, 5 / 4), QuadraticTerm: T(3 * f, 3, 4 / 3), ConstantTerm: T(Ds, 1, 2) }), [d0, Ds, 0]);
      else if (q.type === 'COSINECURVE') seg(0, Lh, w.ent('IfcCosineSpiral', { Position: P2(0, 0), CosineTerm: T(-0.5 * f, 1, 2), ConstantTerm: T(Ds + 0.5 * f, 1, 2) }), [d0, Ds, 0]);
      else if (q.type === 'SINECURVE') seg(0, Lh, w.ent('IfcSineSpiral', { Position: P2(0, 0), SineTerm: T(-f / (2 * Math.PI), 1, 2), LinearTerm: T(f, 2, 1.5), ConstantTerm: T(Ds, 1, 2) }), [d0, Ds, 0]);
      else if (q.type === 'HELMERTCURVE') {
        // IfcOpenShell's Helmert cant works on the SUM of the rails' heights (its halves start at sum / 2)
        const Ss = sl + sr, Se = el + er, F2 = Se - Ss, A2a = T(4 * F2, 3, 4 / 3);
        seg(0, Lh / 2, w.ent('IfcSecondOrderPolynomialSpiral', { Position: P2(0, 0), QuadraticTerm: A2a, ConstantTerm: T(2 * Ss, 1, 2) }), [d0, Ss / 2, 0]);
        const slope = (Lh / 2) ** 2 * ((2 * (Lh / 2)) / (+A2a) ** 3);
        seg(Lh / 2, Lh / 2, w.ent('IfcSecondOrderPolynomialSpiral', { Position: P2(0, 0), QuadraticTerm: T(-4 * F2, 3, 4 / 3), LinearTerm: T(8 * F2, 2, 1.5), ConstantTerm: T(-2 * F2 + 2 * Ss, 1, 2) }), [d0 + Lh / 2, Ss / 2 + F2 / 4, 0], Math.atan(slope));
      } else seg(0, Lh, lineP(), [d0, Ds, 0]);
      const dp = w.ent('IfcAlignmentCantSegment', { StartDistAlong: R(d0), HorizontalLength: R(Lh), StartCantLeft: R(sl), EndCantLeft: R(el), StartCantRight: R(sr), EndCantRight: R(er), PredefinedType: E(q.type) });
      const sgEl = root('IfcAlignmentSegment', tag + '|c|' + i, { DesignParameters: dp });
      segs.push(sgEl);
      counts.segments++;
      const mid = q.start + Lh / 2, cv = q.type === 'CONSTANTCANT' && (q.startCant || 0) !== 0 ? C.curves.find((k) => k.sc <= mid && mid <= k.cs) : null;
      if (cv) pset([sgEl], 'Pset_AlignmentCantSegmentCommon', [['CantEquilibrium', fin(cv.eq) ? mmU(cv.eq) : null, 'len'], ['CantDeficiency', fin(cv.deficiency) ? mmU(cv.deficiency) : null, 'len']], tag + '|c|' + i);
    });
    const last = C.segments[C.segments.length - 1], dE = last.start + last.length - a.start, l2 = mmU(last.endLeft), r2 = mmU(last.endRight);
    segs.push(root('IfcAlignmentSegment', tag + '|c|end', { DesignParameters: w.ent('IfcAlignmentCantSegment', { StartDistAlong: R(dE), HorizontalLength: '0.', StartCantLeft: R(l2), EndCantLeft: R(l2), StartCantRight: R(r2), EndCantRight: R(r2), PredefinedType: '.CONSTANTCANT.' }) }));
    curve.push(w.ent('IfcCurveSegment', { Transition: '.DISCONTINUOUS.', Placement: w.ent('IfcAxis2Placement3D', { Location: w.pt([dE, (l2 + r2) / 2, 0]), Axis: axis((r2 - l2) / 2), RefDirection: w.dir([1, 0, 0]) }), SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(0.)', ParentCurve: lineP() }));
    const cantEl = root('IfcAlignmentCant', tag + '|cant', { RailHeadDistance: R(base) });
    root('IfcRelNests', tag + '|nest-c', { RelatingObject: cantEl, RelatedObjects: L(segs) });
    layouts.push(cantEl);
    return w.ent('IfcSegmentedReferenceCurve', { Segments: L(curve), SelfIntersect: '.F.', BaseCurve: grad });
  }

  // ---- alignments
  const alOut = new Map();   // alignment id → { el (IfcAlignment / its stand-in), curve (basis curve, 4.3) }
  for (const a of model.alignments) {
    const tag = 'al|' + a.id;
    counts.alignments++;
    // i18n-ignore: IFC file data (pset values)
    const props = [['StartStation', a.start, 'len'], ['EndStation', a.end, 'len'], ['Length', a.length, 'len'], ['ProjectUnits', units === 'm' ? 'metre' : 'US survey foot', 'label'],
      ['PIs', a.pis.map((p) => [...[p.x, p.y, p.r || 0, p.ls1 || p.ls || 0, p.ls2 || p.ls || 0].map((v) => +(+v).toFixed(6)), ...(p.tr || p.cant ? [p.tr || '', +(+(p.cant || 0)).toFixed(3)] : [])].join(',')).join(';'), 'text'],   // + transition kind and cant (mm): 71.26 / B
      ['PVIs', a.pvis.map((p) => [p.sta, p.z, p.L || 0].map((v) => +(+v).toFixed(6)).join(',')).join(';'), 'text'],
      ['CurveCount', a.h.filter((s) => s.type !== 'LINE').length, 'int'], ...designProps(a.design), ['RailSettings', a.rail ? JSON.stringify(a.rail) : null, 'text']];
    if (!X4) {
      // IFC4 / IFC2x3: an element with the 3D centreline as a polyline (and the PI / PVI tables in its pset)
      const p3 = a.poly.filter((q) => fin(q.z)), reps = [];
      if (p3.length >= 2) reps.push([cAxis, 'Axis', 'Curve3D', [w.ent('IfcPolyline', { Points: L(p3.map((q) => w.pt([lx(q.x), ly(q.y), lz(q.z)]))) })]]);
      reps.push([cFoot, 'FootPrint', 'Curve2D', [w.ent('IfcPolyline', { Points: L(a.poly.map((q) => w.pt([lx(q.x), ly(q.y)]))) })]]);
      if (p3.length < 2) reps.push([cAxis, 'Axis', 'Curve2D', [w.ent('IfcPolyline', { Points: L(a.poly.map((q) => w.pt([lx(q.x), ly(q.y)]))) })]]);
      const el = element({ cls: 'IfcAlignment', name: a.name, label: 'Alignment', tag, rep: shape(reps) });   // i18n-ignore: IFC file data
      put(site, el);
      if (a.superEvents.length) props.push(['Superelevation', a.superEvents.map((e) => [e.sta, -e.L, -e.R].map((v) => +v.toFixed(6)).join(',')).join(';'), 'text']);
      pset([el], 'CadCraft_Alignment', props, tag);
      alOut.set(a.id, { el });
      continue;
    }
    // ---- IFC 4.3: the layouts (business logic) and their geometry
    // horizontal
    const hSegs = [], curveSegs = [], H = a.h;
    const curv = (r) => (r ? 1 / r : 0);
    const endOf = () => { const q = a.poly[a.poly.length - 1]; const e = a.al.pointAt(a.end); return { x: q.x, y: q.y, dir: e.dir }; };
    H.forEach((s, i) => {
      const nx = H[i + 1];
      const dirEnd = fin(s.dir1) ? s.dir1 : s.type === 'LINE' ? s.dir : s.type === 'CIRCULARARC' ? s.dir + s.len / s.r0 : s.dir + (s.len * (curv(s.r0) + curv(s.r1))) / 2;
      // the cubic parabola's true curvature at its curve end is not exactly 1/R (y'' / (1 + y'²)^1.5): never "same curvature" there
      const kEnd = s.kind === 'cubic' && s.r1 ? NaN : curv(s.r1), kNext = nx?.kind === 'cubic' && nx.r0 ? NaN : curv(nx?.r0 || 0);
      const sameDir = (d1, d2) => Math.abs(Math.atan2(Math.sin(d1 - d2), Math.cos(d1 - d2))) < 1e-7;
      let trans;
      if (!nx) trans = Math.abs(kEnd) < 1e-12 ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.';
      else if (!sameDir(dirEnd, nx.dir)) trans = '.CONTINUOUS.';
      else trans = Math.abs(kEnd - kNext) < 1e-9 ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.';
      const plc = w.ent('IfcAxis2Placement2D', { Location: w.pt([lx(s.x), ly(s.y)]), RefDirection: w.dir([Math.cos(s.dir), Math.sin(s.dir)]) });
      let parent, start = 0, len = s.len;
      // 0.7.1 71.26 / B: rail transitions. Their parents follow IFC 4.3's spiral definitions as IfcOpenShell (the reference
      // implementation) maps them: the curvature over u = s / L is κ·L = a0 + Σ aᵢ·uⁱ (a0 = L/R0, f = L/R1 − L/R0), each term written
      // as Aᵢ = L·|aᵢ|^(−1/(i+1))·sign aᵢ (cosine and sine terms: L / a) — Bloss 3f u² − 2f u³ (third order), Helmert 2f u² then
      // −f + 4f u − 2f u² (two second-order halves), the sine half-wave ½f − ½f cos πu (IfcCosineSpiral), the sine
      // f u − f/2π · sin 2πu (IfcSineSpiral). Each is symmetric, so a spiral out of a curve is the same formula with f < 0.
      const term = (a, n) => (a ? R(s.len * Math.abs(a) ** (-1 / n) * Math.sign(a), 9) : null);
      const fK = s.len * curv(s.r1) - s.len * curv(s.r0), a0 = s.len * curv(s.r0);
      const extra = [];   // Helmert: its second half
      if (s.type === 'LINE') parent = w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) });
      else if (s.type === 'CIRCULARARC') { parent = w.ent('IfcCircle', { Position: ax2d0, Radius: R(Math.abs(s.r0)) }); len = s.len * Math.sign(s.r0); }
      else if (s.type === 'CUBIC') {
        // the cubic parabola y = x³ / (6·R·Lp), Lp along the tangent (CivilCraft's as typed); the segment runs `len` ALONG the curve
        // (IfcOpenShell's kernel reads a polynomial segment's length as arc length), a spiral out of a curve from −len to 0
        const A3 = s.r1 ? 1 / (6 * s.r1 * s.Lp) : -1 / (6 * s.r0 * s.Lp);
        parent = w.ent('IfcPolynomialCurve', { Position: ax2d0, CoefficientsX: L(['0.', '1.']), CoefficientsY: L(['0.', '0.', '0.', R(A3, 15)]) });
        start = s.r1 ? 0 : -s.len;
      } else if (s.type === 'BLOSSCURVE') parent = w.ent('IfcThirdOrderPolynomialSpiral', { Position: ax2d0, CubicTerm: term(-2 * fK, 4), QuadraticTerm: term(3 * fK, 3), ConstantTerm: term(a0, 1) });
      else if (s.type === 'COSINECURVE') parent = w.ent('IfcCosineSpiral', { Position: ax2d0, CosineTerm: term(-0.5 * fK, 1), ConstantTerm: term(0.5 * fK + a0, 1) });
      else if (s.type === 'SINECURVE') parent = w.ent('IfcSineSpiral', { Position: ax2d0, SineTerm: term(-fK / (2 * Math.PI), 1), LinearTerm: term(fK, 2), ConstantTerm: term(a0, 1) });
      else if (s.type === 'HELMERTCURVE') {
        parent = w.ent('IfcSecondOrderPolynomialSpiral', { Position: ax2d0, QuadraticTerm: term(2 * fK, 3), ConstantTerm: term(a0, 1) });
        len = s.len / 2;
        const mid = a.al.pointAt(s.sta + s.len / 2);
        extra.push(w.ent('IfcCurveSegment', { Transition: trans, Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([lx(mid.x), ly(mid.y)]), RefDirection: w.dir([Math.cos(mid.dir), Math.sin(mid.dir)]) }),
          SegmentStart: 'IFCLENGTHMEASURE(' + R(s.len / 2) + ')', SegmentLength: 'IFCLENGTHMEASURE(' + R(s.len / 2) + ')',
          ParentCurve: w.ent('IfcSecondOrderPolynomialSpiral', { Position: ax2d0, QuadraticTerm: term(-2 * fK, 3), LinearTerm: term(4 * fK, 2), ConstantTerm: term(a0 - fK, 1) }) }));
      } else {
        // the clothoid (ifcopenshell's mapping): A = L / √|f| · sign f; a spiral out of a curve runs −L … 0
        const A = (s.len / Math.sqrt(Math.abs(fK))) * Math.sign(fK);
        parent = w.ent('IfcClothoid', { Position: ax2d0, ClothoidConstant: R(A, 9) });
        start = s.r1 === 0 ? -s.len : 0;
      }
      curveSegs.push(w.ent('IfcCurveSegment', { Transition: extra.length ? '.CONTSAMEGRADIENTSAMECURVATURE.' : trans, Placement: plc, SegmentStart: 'IFCLENGTHMEASURE(' + R(start) + ')', SegmentLength: 'IFCLENGTHMEASURE(' + R(len) + ')', ParentCurve: parent }));
      curveSegs.push(...extra);   // Helmert's second half after its first
      const dp = w.ent('IfcAlignmentHorizontalSegment', { StartPoint: w.pt([lx(s.x), ly(s.y)]), StartDirection: R(Math.atan2(Math.sin(s.dir), Math.cos(s.dir)), 12), StartRadiusOfCurvature: R(s.r0), EndRadiusOfCurvature: R(s.r1), SegmentLength: R(s.len), PredefinedType: E(s.type) });
      hSegs.push(root('IfcAlignmentSegment', tag + '|h|' + i, { DesignParameters: dp }));
      counts.segments++;
    });
    const end = endOf();
    hSegs.push(root('IfcAlignmentSegment', tag + '|h|end', { DesignParameters: w.ent('IfcAlignmentHorizontalSegment', { StartPoint: w.pt([lx(end.x), ly(end.y)]), StartDirection: R(Math.atan2(Math.sin(end.dir), Math.cos(end.dir)), 12), StartRadiusOfCurvature: '0.', EndRadiusOfCurvature: '0.', SegmentLength: '0.', PredefinedType: '.LINE.' }) }));
    curveSegs.push(w.ent('IfcCurveSegment', { Transition: '.DISCONTINUOUS.', Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([lx(end.x), ly(end.y)]), RefDirection: w.dir([Math.cos(end.dir), Math.sin(end.dir)]) }), SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(0.)', ParentCurve: w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) }) }));
    const comp = w.ent('IfcCompositeCurve', { Segments: L(curveSegs), SelfIntersect: '.F.' });
    const horiz = root('IfcAlignmentHorizontal', tag + '|h', {});
    root('IfcRelNests', tag + '|nest-h', { RelatingObject: horiz, RelatedObjects: L(hSegs) });
    const layouts = [horiz], reps = [];
    // vertical
    if (a.v?.length) {
      const vSegs = [], vCurve = [], V = a.v;
      V.forEach((s, i) => {
        const nx = V[i + 1], d0 = s.sta - a.start;
        const flat = (q) => !q || q.type === 'CONSTANTGRADIENT';   // curvature 0 (the zero-length end segment too)
        const trans = nx && Math.abs(s.g1 - nx.g0) >= 1e-9 ? '.CONTINUOUS.' : flat(s) && flat(nx) ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.';
        const th = Math.atan(s.g0), plc = w.ent('IfcAxis2Placement2D', { Location: w.pt([d0, s.z0]), RefDirection: w.dir([Math.cos(th), Math.sin(th)]) });
        let parent, len;
        if (s.type === 'CONSTANTGRADIENT') { parent = w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) }); len = s.len / Math.cos(th); }
        else { const C = (s.g1 - s.g0) / (2 * s.len); parent = w.ent('IfcPolynomialCurve', { Position: ax2d0, CoefficientsX: L(['0.', '1.']), CoefficientsY: L([R(s.z0), R(s.g0, 12), R(C, 15)]) }); len = parabolaLength(s.g0, C, s.len); }
        vCurve.push(w.ent('IfcCurveSegment', { Transition: trans, Placement: plc, SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(' + R(len) + ')', ParentCurve: parent }));
        vSegs.push(root('IfcAlignmentSegment', tag + '|v|' + i, { DesignParameters: w.ent('IfcAlignmentVerticalSegment', { StartDistAlong: R(d0), HorizontalLength: R(s.len), StartHeight: R(s.z0), StartGradient: R(s.g0, 12), EndGradient: R(s.g1, 12), PredefinedType: E(s.type) }) }));
        counts.segments++;
      });
      const last = V[V.length - 1], dEnd = last.sta + last.len - a.start, zEnd = last.z0 + (last.g0 + last.g1) / 2 * last.len;
      vSegs.push(root('IfcAlignmentSegment', tag + '|v|end', { DesignParameters: w.ent('IfcAlignmentVerticalSegment', { StartDistAlong: R(dEnd), HorizontalLength: '0.', StartHeight: R(zEnd), StartGradient: R(last.g1, 12), EndGradient: R(last.g1, 12), PredefinedType: '.CONSTANTGRADIENT.' }) }));
      const thE = Math.atan(last.g1);
      vCurve.push(w.ent('IfcCurveSegment', { Transition: '.DISCONTINUOUS.', Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([dEnd, zEnd]), RefDirection: w.dir([Math.cos(thE), Math.sin(thE)]) }), SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(0.)', ParentCurve: w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) }) }));
      const vert = root('IfcAlignmentVertical', tag + '|v', {});
      root('IfcRelNests', tag + '|nest-v', { RelatingObject: vert, RelatedObjects: L(vSegs) });
      layouts.push(vert);
      const grad = w.ent('IfcGradientCurve', { Segments: L(vCurve), SelfIntersect: '.F.', BaseCurve: comp });
      const cantCurve = a.cant && X4 ? cantLayout(a, tag, grad, layouts) : null;   // 0.7.1 71.26 / B: a railway's cant
      reps.push([cFoot, 'FootPrint', 'Curve2D', [comp]], [cAxis, 'Axis', 'Curve3D', [cantCurve || grad]]);
    } else reps.push([cAxis, 'Axis', 'Curve2D', [comp]]);
    const alEl = root('IfcAlignment', tag, { Name: S(a.name), ObjectPlacement: place(null), Representation: shape(reps), PredefinedType: '.NOTDEFINED.' });
    projectKids.push(alEl);
    root('IfcRelNests', tag + '|nest', { RelatingObject: alEl, RelatedObjects: L(layouts) });
    // referents: the start station, then the superelevation events (each side)
    const refs = [], at = (d) => w.ent('IfcLinearPlacement', { RelativePlacement: w.ent('IfcAxis2PlacementLinear', { Location: w.ent('IfcPointByDistanceExpression', { DistanceAlong: 'IFCLENGTHMEASURE(' + R(d) + ')', BasisCurve: comp }) }),
      CartesianPosition: (() => { const p = a.al.pointAt(a.start + d), z = a.prof?.ok ? a.prof.elevationAt(a.start + d) : null; return w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.x), ly(p.y), fin(z) ? lz(z) : 0]), RefDirection: w.dir([Math.cos(p.dir), Math.sin(p.dir), 0]), Axis: w.dir([0, 0, 1]) }); })() });
    const st = root('IfcReferent', tag + '|sta', { Name: S(String(+a.start.toFixed(3))), ObjectPlacement: at(0), PredefinedType: '.STATION.' });
    pset([st], 'Pset_Stationing', [['Station', a.start, 'len']], tag + '|sta');
    refs.push(st); counts.referents++;
    a.superEvents.forEach((e, k) => {
      for (const [side, v] of [['LEFT', e.L], ['RIGHT', e.R]]) {
        const r = root('IfcReferent', tag + '|se|' + k + side, { Name: S(side + ' ' + (+e.sta.toFixed(3))), ObjectPlacement: at(e.sta - a.start), PredefinedType: '.SUPERELEVATIONEVENT.' });
        // Superelevation: the lane's cross slope, + rising away from the centreline (a normal crown is −2 %)
        pset([r], 'Pset_Superelevation', [['Side', side, 'label'], ['Superelevation', -v, 'ratio'], ['TransitionSuperelevation', 'LINEAR', 'label']], tag + '|se|' + k + side);   // i18n-ignore: IFC enumerated words
        refs.push(r); counts.referents++;
      }
    });
    root('IfcRelNests', tag + '|nest-ref', { RelatingObject: alEl, RelatedObjects: L(refs) });
    pset([alEl], 'CadCraft_Alignment', props, tag);
    alOut.set(a.id, { el: alEl, curve: comp });
  }

  // ---- surfaces (first: in IFC 4.3 an IfcEarthworksCut is a subtraction that voids the existing ground)
  let egEl = null;
  for (const s of model.surfaces) {
    if (!s.faces.length) continue;
    const pos = [];
    for (const q of s.pts) pos.push(q.x, q.y, q.z);
    const mesh = { pos, idx: s.faces.flat(), closed: false };
    const label = s.key === 'eg' ? 'Existing ground' : 'Design surface';   // i18n-ignore: IFC file data
    const el = element({ cls: 'IfcGeographicElement', pre: 'TERRAIN', name: s.name, label, tag: 'surface|' + s.key, rep: body(mesh, { tin: true }), extra: { ObjectType: S(label) } });
    put(site, el); counts.surfaces++;
    if (s.key === 'eg') egEl = el;
    pset([el], 'CadCraft_Surface', [['Kind', label, 'label'], ['Points', s.pts.length, 'int'], ['Triangles', s.faces.length, 'int'], ['SurfaceArea', meshArea(mesh), 'area']], 'surface|' + s.key);
  }

  // ---- corridors: roads, their parts, earthworks
  // i18n-ignore-start: IFC file data (names and object types in English, like every IFC we write)
  const PART = {
    lane: { cls: 'IfcPavement', pre: 'NOTDEFINED', label: 'Lanes', rp: 'CARRIAGEWAY' }, shoulder: { cls: 'IfcPavement', pre: 'NOTDEFINED', label: 'Shoulder', rp: 'SHOULDER' },
    gutter: { cls: 'IfcPavement', pre: 'USERDEFINED', label: 'Gutter', rp: 'CARRIAGEWAY' }, curb: { cls: 'IfcKerb', pre: 'NOTDEFINED', label: 'Curb', rp: 'ROADSIDE' },
    strip: { cls: 'IfcGeographicElement', pre: 'VEGETATION', label: 'Planting strip', rp: 'ROADSIDE' }, walk: { cls: 'IfcPavement', pre: 'USERDEFINED', label: 'Sidewalk', rp: 'SIDEWALK' },
  };
  const SIDE = { L: 'left', R: 'right' };
  // 0.7.1 71.24: CivilCraft's course kinds → IfcCourseTypeEnum (4.3 has PAVEMENT for the courses traffic runs on; base, subbase and
  // capping have no value of their own there: USERDEFINED with the name in ObjectType)
  const COURSE = { surface: { pre: 'PAVEMENT', label: 'Surface course' }, binder: { pre: 'PAVEMENT', label: 'Binder course' }, base: { pre: 'USERDEFINED', label: 'Base course' },
    subbase: { pre: 'USERDEFINED', label: 'Subbase' }, capping: { pre: 'USERDEFINED', label: 'Capping layer' }, other: { pre: 'USERDEFINED', label: 'Course' } };
  const RP_NAME = { CARRIAGEWAY: 'Carriageway', SHOULDER: 'Shoulders', ROADSIDE: 'Roadside', SIDEWALK: 'Sidewalks' };
  // i18n-ignore-end
  const earthworks = (owner, tag, nameOf, meshes, volumes) => {
    const out = [];
    for (const kind of ['cut', 'fill']) {
      const mesh = meshes[kind], v = volumes?.[kind];
      if (!mesh && !(v > 0)) continue;
      const cut = kind === 'cut';
      if (cut && X4 && !egEl) continue;   // a cut needs the ground it is cut from
      // i18n-ignore: IFC file data
      const el = element({ cls: cut ? 'IfcEarthworksCut' : 'IfcEarthworksFill', pre: cut ? 'CUT' : 'EMBANKMENT', name: nameOf(cut ? 'cut slopes' : 'fill slopes'), label: cut ? 'Earthworks cut' : 'Earthworks fill', tag: tag + '|' + kind, rep: mesh ? body(mesh) : null });
      counts.earthworks++;
      if (fin(v)) qto([el], cut ? 'Qto_EarthworksCutBaseQuantities' : 'Qto_EarthworksFillBaseQuantities', [[cut ? 'UndisturbedVolume' : 'CompactedVolume', 'vol', v]], tag + '|' + kind);
      // i18n-ignore: IFC file data
      pset([el], 'CadCraft_Earthworks', [['Of', owner, 'label'], ['VolumeMethod', 'Grid method between the existing ground and the graded surface inside the daylight line', 'text'], ['SlopeArea', mesh ? meshArea(mesh) : null, 'real']], tag + '|' + kind);
      // IFC 4.3: the cut is a subtraction feature, never in the spatial structure: it voids the existing ground
      if (cut && X4) root('IfcRelVoidsElement', tag + '|voids', { RelatingBuildingElement: egEl, RelatedOpeningElement: el });
      out.push(el);
    }
    return out;
  };

  const mats = new Map(), material = (n) => { if (!mats.has(n)) mats.set(n, w.ent('IfcMaterial', { Name: S(n) })); return mats.get(n); };
  /**
   * 0.7.1 71.26 / B: a railway corridor (corridor.js info.rail, ifc-civil-model.js trackSolids). IFC 4.3: IfcRailway (in the site) >
   * IfcRailwayPart TRACK (Pset_RailwayTrackStructurePart: a ballasted track) holding each rail (IfcRail RAIL, a solid of its section along
   * the head line, Qto_RailBaseQuantities length and weight), each track's sleepers (IfcTrackElement SLEEPER: one element per track, every
   * sleeper an IfcMappedItem of one box, Qto_SleeperBaseQuantities + the count and spacing) and the ballast bed (IfcCourse BALLASTBED, its
   * net volume), and IfcRailwayPart SUBSTRUCTURE with the sub-ballast (IfcCourse USERDEFINED 'Sub-ballast') and the fill; the cut voids the
   * ground as for a road. The alignment is referenced in the railway and positions its elements. IFC4 / 2x3: the same elements as
   * IfcCivilElement / proxies (ObjectType Rail, Sleepers, Ballast bed, Sub-ballast) in an IfcGroup 'Railway'.
   */
  const sleeperMaps = new Map();
  function writeTrack(c, tag, al) {
    const T = c.track, rs = T.rail, Q = T.quantities || {}, els = [], d = c.design || {};
    let fac = null, group = null, track = null, substructure = null;
    // i18n-ignore-start: IFC file data
    const props = [...designProps(c.design), ['Alignment', c.name, 'label'], ['FromStation', c.from, 'len'], ['ToStation', c.to, 'len'], ['Gauge', rs.gauge + ' mm', 'label'], ['RailHeadDistance', T.base + ' mm', 'label'],
      ['Tracks', rs.tracks || 1, 'int'], ['TrackCentres', rs.tracks > 1 ? rs.centres : null, 'len'], ['RailSection', rs.rail, 'label'], ['CantPivot', rs.pivot, 'label'], ['SleeperMaterial', rs.sleeper.material, 'label'], ['SleeperSpacing', rs.sleeper.spacing, 'len'],
      ['BallastDepth', rs.ballast.depth, 'len'], ['SubBallastDepth', rs.sub.depth, 'len'], ['Provisional', c.standIn, 'bool']];
    // i18n-ignore-end
    if (X4) {
      fac = root('IfcRailway', tag, { Name: S(c.name), ObjectPlacement: place(siteLP), CompositionType: '.ELEMENT.', PredefinedType: '.NOTDEFINED.' });
      siteKids.push(fac);
      track = root('IfcRailwayPart', tag + '|TRACK', { Name: S('Track'), ObjectPlacement: place(siteLP), UsageType: '.LONGITUDINAL.', PredefinedType: '.TRACK.' });   // i18n-ignore: IFC file data
      substructure = root('IfcRailwayPart', tag + '|SUBSTRUCTURE', { Name: S('Substructure'), ObjectPlacement: place(siteLP), UsageType: '.LONGITUDINAL.', PredefinedType: '.SUBSTRUCTURE.' });   // i18n-ignore: IFC file data
      root('IfcRelAggregates', tag + '|parts', { RelatingObject: fac, RelatedObjects: L([track, substructure]) });
      pset([track], 'Pset_RailwayTrackStructurePart', [['HasBallastTrack', true, 'bool']], tag + '|TRACK');
      pset([fac], 'CadCraft_Track', props, tag);
      counts.roadParts += 2;
    } else {
      group = root('IfcGroup', tag, { Name: S(c.name), ObjectType: S('Railway') });   // i18n-ignore: IFC file data
      pset([group], 'CadCraft_Track', props, tag);
    }
    const inTrack = [], inSub = [];
    for (const r of T.rails) {
      const rtag = tag + '|rail|' + r.track + r.side;
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcRail', pre: 'RAIL', name: 'Rail, track ' + (r.track + 1) + ', ' + SIDE[r.side], label: 'Rail', tag: rtag, rep: body(r.mesh) });
      inTrack.push(el); els.push(el);
      qto([el], 'Qto_RailBaseQuantities', [['Length', 'len', r.length], ['Weight', 'kg', r.length * um * r.kg]], rtag);
      pset([el], 'CadCraft_Rail', [['Section', r.profile, 'label'], ['MassPerMetre', r.kg, 'real'], ['Track', r.track + 1, 'int'], ['Side', SIDE[r.side], 'label']], rtag);
    }
    for (const sp of T.sleepers) {
      if (!sp.at.length) continue;
      const stag = tag + '|sleepers|' + sp.track, key = [sp.length, sp.width, sp.depth].join(',');
      if (!sleeperMaps.has(key)) {
        const solid = w.ent('IfcExtrudedAreaSolid', { SweptArea: w.ent('IfcRectangleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, XDim: R(sp.length), YDim: R(sp.width) }), Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, -sp.depth]) }), ExtrudedDirection: w.dir([0, 0, 1]), Depth: R(sp.depth) });
        sleeperMaps.set(key, w.ent('IfcRepresentationMap', { MappingOrigin: w.ent('IfcAxis2Placement3D', { Location: O3 }), MappedRepresentation: w.ent('IfcShapeRepresentation', { ContextOfItems: cBody, RepresentationIdentifier: S('Body'), RepresentationType: S('SweptSolid'), Items: L([solid]) }) }));
      }
      const items = sp.at.map((q) => {
        const sl = q.slope, a1 = [q.across.x, q.across.y, sl], n1 = Math.hypot(...a1), A1 = a1.map((v) => v / n1), A2 = [-q.across.y, q.across.x, 0];
        const A3 = [A1[1] * A2[2] - A1[2] * A2[1], A1[2] * A2[0] - A1[0] * A2[2], A1[0] * A2[1] - A1[1] * A2[0]];
        return w.ent('IfcMappedItem', { MappingSource: sleeperMaps.get(key), MappingTarget: w.ent('IfcCartesianTransformationOperator3D', { Axis1: w.dir(A1), Axis2: w.dir(A2), LocalOrigin: w.pt([lx(q.x), ly(q.y), lz(q.z)]), Scale: '1.', Axis3: w.dir(A3) }) });
      });
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcTrackElement', pre: 'SLEEPER', name: 'Sleepers, track ' + (sp.track + 1), label: 'Sleepers', tag: stag, rep: shape([[cBody, 'Body', 'MappedRepresentation', items]]) });
      inTrack.push(el); els.push(el);
      qto([el], 'Qto_SleeperBaseQuantities', [['Length', 'len', sp.length], ['Width', 'len', sp.width], ['Height', 'len', sp.depth]], stag);
      pset([el], 'CadCraft_Sleepers', [['Count', sp.at.length, 'int'], ['Spacing', sp.spacing, 'len'], ['Material', sp.material, 'label']], stag);
    }
    if (T.ballast) {
      const btag = tag + '|ballast';
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcCourse', pre: 'BALLASTBED', name: 'Ballast bed', label: 'Ballast bed', tag: btag, rep: body(T.ballast) });
      inTrack.push(el); els.push(el); counts.courses++;
      qto([el], 'Qto_CourseBaseQuantities', [['Length', 'len', Q.length], ['Volume', 'vol', Q.ballast], ['GrossVolume', 'vol', Q.ballastGross], ['Thickness', 'len', rs.ballast.depth]], btag);
    }
    if (T.sub) {
      const stag = tag + '|subballast';
      // i18n-ignore: IFC file data
      const el = element({ cls: 'IfcCourse', pre: 'USERDEFINED', name: 'Sub-ballast', label: 'Sub-ballast', tag: stag, rep: body(T.sub) });
      inSub.push(el); els.push(el); counts.courses++;
      qto([el], 'Qto_CourseBaseQuantities', [['Length', 'len', Q.length], ['Volume', 'vol', Q.sub], ['Thickness', 'len', rs.sub.depth]], stag);
    }
    for (const el of earthworks(c.name, tag, (what) => c.name + ', ' + what, { cut: c.cut, fill: c.fill }, c.volumes)) { els.push(el); if (!isCut(el)) inSub.push(el); }
    if (X4) { contain.set(track, inTrack); contain.set(substructure, inSub); } else for (const el of [...inTrack, ...inSub]) put(site, el);
    if (X4 && al) {
      root('IfcRelReferencedInSpatialStructure', tag + '|ref-al', { RelatedElements: L([al.el]), RelatingStructure: fac });
      root('IfcRelPositions', tag + '|positions', { RelatingPositioningElement: al.el, RelatedProducts: L([fac, ...els]) });
    }
    if (group && els.length) root('IfcRelAssignsToGroup', tag + '|group', { RelatedObjects: L(els), RelatingGroup: group });
    counts.railways = (counts.railways || 0) + 1;
    void d;
  }

  for (const c of model.corridors) {
    if (c.track) { writeTrack(c, 'rail|' + c.id, alOut.get(c.alignment)); continue; }   // 0.7.1 71.26 / B
    const tag = 'road|' + c.id, al = alOut.get(c.alignment), partEl = new Map();
    counts.roads++;
    const els = [];
    let road = null, group = null;
    // i18n-ignore: IFC file data
    const roadProps = [...designProps(c.design), ['Alignment', c.name, 'label'], ['FromStation', c.from, 'len'], ['ToStation', c.to, 'len'], ['Assembly', c.assembly, 'text'], ['CutSlope', c.cutSlope + ':1', 'label'], ['FillSlope', c.fillSlope + ':1', 'label'], ['SectionStep', c.step, 'len'], ['Superelevation', c.superOn, 'bool'], ['Provisional', c.standIn, 'bool']];
    const parts = new Map();   // road part type → { el, items }
    if (X4) {
      road = root('IfcRoad', tag, { Name: S(c.name), ObjectPlacement: place(siteLP), CompositionType: '.ELEMENT.', PredefinedType: '.NOTDEFINED.' });
      siteKids.push(road);
      for (const p of c.parts) {
        const rp = PART[p.part].rp;
        if (!parts.has(rp)) parts.set(rp, { el: root('IfcRoadPart', tag + '|' + rp, { Name: S(RP_NAME[rp]), ObjectPlacement: place(siteLP), UsageType: '.LONGITUDINAL.', PredefinedType: E(rp) }), items: [] });
      }
      if (parts.size) { root('IfcRelAggregates', tag + '|parts', { RelatingObject: road, RelatedObjects: L([...parts.values()].map((x) => x.el)) }); counts.roadParts += parts.size; }
      const d = c.design || {};
      pset([road], 'Pset_RoadDesignCriteriaCommon', [['Crossfall', c.nc, 'ratio'], ['LaneWidth', c.laneWidth, 'pos'], ['NumberOfThroughLanes', c.lanes, 'count'],
        ['DesignSpeed', fin(d.speed) ? d.speed * MPS[d.unit] : null, 'speed'], ['RoadDesignClass', d.cls || null, 'label']], tag);   // DesignSpeed in m/s (SI)
      pset([road], 'CadCraft_Corridor', roadProps, tag);
    } else {
      group = root('IfcGroup', tag, { Name: S(c.name), ObjectType: S('Road') });   // i18n-ignore: IFC file data
      pset([group], 'CadCraft_Corridor', roadProps, tag);
    }
    for (const p of c.parts) {
      const d = PART[p.part], ptag = tag + '|' + p.side + '|' + p.part;
      const el = element({ cls: d.cls, pre: d.pre, name: d.label + ', ' + SIDE[p.side], label: d.label, tag: ptag, rep: body(p.mesh) });
      els.push(el); partEl.set(p.side + ':' + p.part, el);
      if (X4) parts.get(d.rp).items.push(el); else put(site, el);
      const area = meshArea(p.mesh);
      if (d.cls === 'IfcPavement') qto([el], 'Qto_PavementBaseQuantities', [['Length', 'len', p.length], ['Width', 'len', p.length > 0 ? p.area / p.length : null], ['GrossArea', 'area', p.area]], ptag);
      else if (d.cls === 'IfcKerb') qto([el], 'Qto_KerbBaseQuantities', [['Length', 'len', p.length]], ptag);
      pset([el], 'CadCraft_CorridorPart', [['Part', p.part, 'label'], ['Side', SIDE[p.side], 'label'], ['SurfaceArea', area, 'area']], ptag);   // i18n-ignore: IFC file data
    }
    // 0.7.1 71.24: the pavement courses under each part: IfcCourse solids (IFC4: civil elements, IFC2x3: proxies) aggregated into
    // their part, with a material each, Qto_CourseBaseQuantities and the part's IfcMaterialLayerSet (top down)
    const byPart = new Map();
    for (const q of c.courses || []) {
      const key = q.side + ':' + q.part, host = partEl.get(key);
      if (!host || !q.mesh) continue;
      const ctag = tag + '|course|' + q.side + '|' + q.code + '|' + q.k, kind = COURSE[q.course] || COURSE.other;
      const label = q.name || kind.label;
      const el = element({ cls: 'IfcCourse', pre: kind.pre, name: label + ', ' + PART[q.part].label.toLowerCase() + ', ' + SIDE[q.side], label: kind.pre === 'USERDEFINED' ? label : 'Course: ' + label, tag: ctag, rep: body(q.mesh) });   // i18n-ignore: IFC file data
      counts.courses++;
      if (!byPart.has(key)) byPart.set(key, { host, items: [], layers: [] });
      const bp = byPart.get(key);
      bp.items.push(el);
      if (!bp.codes) bp.codes = new Set();
      if (!bp.codes.size || bp.codes.has(q.code)) { bp.codes.add(q.code); bp.layers.push(q); }
      if (q.material) root('IfcRelAssociatesMaterial', 'mat|' + ctag, { RelatedObjects: L([el]), RelatingMaterial: material(q.material) });
      qto([el], 'Qto_CourseBaseQuantities', [['Length', 'len', q.length], ['Width', 'len', q.length > 0 ? q.area / q.length : null], ['Thickness', 'len', q.t], ['Volume', 'vol', q.volume]], ctag);
      // i18n-ignore: IFC file data
      pset([el], 'CadCraft_Course', [['Kind', q.course, 'label'], ['Material', q.material, 'label'], ['Thickness', q.t, 'len'], ['PlanArea', m2(q.area), 'area'], ['Part', q.part, 'label'], ['Side', SIDE[q.side], 'label']], ctag);
    }
    for (const [key, bp] of byPart) {
      root('IfcRelAggregates', tag + '|courses|' + key, { RelatingObject: bp.host, RelatedObjects: L(bp.items) });
      const set = w.ent('IfcMaterialLayerSet', { MaterialLayers: L(bp.layers.map((q) => w.ent('IfcMaterialLayer', { Material: material(q.material || q.name || COURSE[q.course]?.label || 'Course'), LayerThickness: R(Math.max(q.t, 1e-6)), Name: S(q.name || COURSE[q.course]?.label || 'Course') }))), LayerSetName: S(key) });   // i18n-ignore: IFC file data
      root('IfcRelAssociatesMaterial', 'matset|' + tag + '|' + key, { RelatedObjects: L([bp.host]), RelatingMaterial: set });
    }
    const ew = earthworks(c.name, tag, (what) => c.name + ', ' + what, { cut: c.cut, fill: c.fill }, c.volumes);
    for (const el of ew) { els.push(el); if (!isCut(el)) put(X4 ? road : site, el); }
    for (const [, x] of parts) if (x.items.length) contain.set(x.el, x.items);
    if (X4 && al) {
      root('IfcRelReferencedInSpatialStructure', tag + '|ref-al', { RelatedElements: L([al.el]), RelatingStructure: road });
      root('IfcRelPositions', tag + '|positions', { RelatingPositioningElement: al.el, RelatedProducts: L([road, ...els]) });
    }
    if (group && els.length) root('IfcRelAssignsToGroup', tag + '|group', { RelatedObjects: L(els), RelatingGroup: group });
  }

  // ---- pads, their slopes and retaining walls
  for (const p of model.pads) {
    const tag = 'pad|' + p.id;
    counts.pads++;
    const top = p.top ? element({ cls: 'IfcGeographicElement', pre: 'TERRAIN', name: p.name, label: 'Graded pad', tag, rep: body(p.top, { tin: true }), extra: { ObjectType: S('Graded pad') } }) : null;   // i18n-ignore: IFC file data
    if (top) {
      put(site, top);
      pset([top], 'CadCraft_Pad', [['Elevation', p.z, 'len'], ['CutSlope', p.cutSlope + ':1', 'label'], ['FillSlope', p.fillSlope + ':1', 'label'], ['Area', m2(p.area), 'area']], tag);
    }
    for (const el of earthworks(p.name, tag, (what) => p.name + ', ' + what, { cut: p.cut, fill: p.fill }, p.volumes)) if (!isCut(el)) put(site, el);
    p.walls.forEach((wl, k) => {
      const wt = tag + '|wall|' + k;
      const el = element({ cls: 'IfcWall', pre: 'RETAININGWALL', name: p.name + ', retaining wall ' + (k + 1), label: 'Retaining wall', tag: wt, rep: body(wl.mesh) });   // i18n-ignore: IFC file data
      put(site, el); counts.walls++;
      qto([el], 'Qto_WallBaseQuantities', [['Length', 'len', wl.length], ['Width', 'len', wl.thickness], ['Height', 'len', wl.maxH], ['GrossSideArea', 'area', wl.faceArea], ['GrossVolume', 'vol', wl.volume]], wt);
      pset([el], 'CadCraft_RetainingWall', [['Pad', p.name, 'label'], ['AverageHeight', wl.avgH, 'len'], ['TallestHeight', wl.maxH, 'len'], ['Sides', (wl.sides || []).map((x) => x + 1).join(', '), 'label']], wt);
    });
  }

  // ---- the pipe network
  const net = model.network;
  if (net) {
    const members = [];
    const extrude = (profile, at, depth) => w.ent('IfcExtrudedAreaSolid', { SweptArea: profile, Position: at, ExtrudedDirection: w.dir([0, 0, 1]), Depth: R(Math.max(depth, 1e-6)) });
    for (const p of net.pipes) {
      const r = p.dia / 2, dx = p.b.x - p.a.x, dy = p.b.y - p.a.y, dz = p.b.z - p.a.z, L3 = Math.hypot(dx, dy, dz);
      if (!(L3 > 1e-9)) continue;
      const u = [dx / L3, dy / L3, dz / L3], hl = Math.hypot(u[0], u[1]) || 1, ref = [-u[1] / hl, u[0] / hl, 0];
      const solid = extrude(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: R(r) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.a.x), ly(p.a.y), lz(p.a.z + r)]), Axis: w.dir(u), RefDirection: w.dir(ref) }), L3);
      const ptag = 'pipe|' + p.id;
      const el = element({ cls: 'IfcPipeSegment', pre: 'RIGIDSEGMENT', name: p.name, label: 'Pipe', tag: ptag, rep: shape([[cBody, 'Body', 'SweptSolid', [solid]]]) });   // i18n-ignore: IFC file data
      put(site, el); members.push(el); counts.pipes++;
      qto([el], 'Qto_PipeSegmentBaseQuantities', [['Length', 'len', p.len]], ptag);
      // i18n-ignore: IFC file data
      pset([el], 'CadCraft_Pipe', [['InvertUpstream', p.a.z, 'len'], ['InvertDownstream', p.b.z, 'len'], ['InsideDiameter', p.dia, 'pos'], ['Diameter', p.diaText, 'label'], ['Slope', p.slope, 'ratio'], ['MinimumCover', p.cover, 'len'], ['From', p.from, 'label'], ['To', p.to, 'label'], ['Note', 'Body = the inside diameter (wall thickness is not modelled)', 'text']], ptag);
    }
    for (const s of net.structures) {
      const stag = 'struct|' + s.id, at = w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(s.x), ly(s.y), lz(s.bottom)]) });
      const prof = s.shape === 'rect'
        ? w.ent('IfcRectangleProfileDef', { ProfileType: '.AREA.', Position: w.ent('IfcAxis2Placement2D', { Location: O2, RefDirection: w.dir([Math.cos(s.ang), Math.sin(s.ang)]) }), XDim: R(s.l), YDim: R(s.w) })
        : w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: R(s.w / 2) });
      if (!(s.w > 0)) continue;
      const el = element({ cls: 'IfcDistributionChamberElement', pre: s.predefined, name: s.name, label: words(s.kind), tag: stag, rep: shape([[cBody, 'Body', 'SweptSolid', [extrude(prof, at, s.rim - s.bottom)]]]) });
      put(site, el); members.push(el); counts.structures++;
      qto([el], 'Qto_DistributionChamberElementBaseQuantities', [['Depth', 'len', s.rim - s.bottom]], stag);
      pset([el], 'CadCraft_Structure', [['Kind', s.kind, 'label'], ['Type', s.typeName, 'label'], ['Rim', s.rim, 'len'], ['Floor', s.bottom, 'len'], ['SumpDepth', s.sumpDepth, 'len'], ['RimFrom', s.rimFrom, 'label']], stag);
    }
    if (members.length) {
      const sys = root(w.has('IfcDistributionSystem') ? 'IfcDistributionSystem' : 'IfcSystem', 'system', { Name: S(net.name), ObjectType: S(net.type === 'sanitary' ? 'Sanitary sewer' : 'Storm drainage'), PredefinedType: net.type === 'sanitary' ? '.SEWAGE.' : '.STORMWATER.' });   // i18n-ignore: IFC file data
      root('IfcRelAssignsToGroup', 'system|members', { RelatedObjects: L(members), RelatingGroup: sys });
      pset([sys], 'CadCraft_PipeRules', [['MinimumSlope', net.rules.minSlope, 'ratio'], ['MinimumCover', net.rules.minCover, 'len'], ['MinimumDrop', net.rules.minDrop, 'len']], 'system');
    }
  }

  // ---- the water mains (0.8 LC.16 rest + CV.2, civil_PART_3): pipes under the ground, then hydrants, valves and fittings, in one distribution system
  const wat = model.water;
  if (wat) {
    const members = [];
    const extrudeW = (profile, at, depth) => w.ent('IfcExtrudedAreaSolid', { SweptArea: profile, Position: at, ExtrudedDirection: w.dir([0, 0, 1]), Depth: R(Math.max(depth, 1e-6)) });
    for (const p of wat.pipes) {
      const r = p.dia / 2, dx = p.b.x - p.a.x, dy = p.b.y - p.a.y, dz = p.b.z - p.a.z, L3 = Math.hypot(dx, dy, dz);
      if (!(L3 > 1e-9)) continue;
      const u = [dx / L3, dy / L3, dz / L3], hl = Math.hypot(u[0], u[1]) || 1, ref = [-u[1] / hl, u[0] / hl, 0];
      const solid = extrudeW(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: R(r) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.a.x), ly(p.a.y), lz(p.a.z)]), Axis: w.dir(u), RefDirection: w.dir(ref) }), L3);
      const ptag = 'wmain|' + p.id;
      const el = element({ cls: 'IfcPipeSegment', pre: 'RIGIDSEGMENT', name: p.name, label: 'Water main', tag: ptag, rep: shape([[cBody, 'Body', 'SweptSolid', [solid]]]) });   // i18n-ignore: IFC file data
      put(site, el); members.push(el); counts.pipes++;
      qto([el], 'Qto_PipeSegmentBaseQuantities', [['Length', 'len', p.len]], ptag);
      pset([el], 'CadCraft_WaterMain', [['Diameter', p.diaText, 'label'], ['InsideDiameter', p.dia, 'pos'], ['Cover', p.cover, 'len'], ['Note', 'Laid at the ground less the cover (a design aid: the invert is not surveyed).', 'label']], ptag);   // i18n-ignore: IFC file data
    }
    const KIND = { hydrant: ['IfcFireSuppressionTerminal', 'FIREHYDRANT', 'Hydrant'], valve: ['IfcValve', 'ISOLATING', 'Gate valve'], airvalve: ['IfcValve', 'AIRRELEASE', 'Air valve'], blowoff: ['IfcValve', 'FLUSHING', 'Blow-off'], meter: ['IfcFlowMeter', 'WATERMETER', 'Water meter'],
      tee: ['IfcPipeFitting', 'JUNCTION', 'Tee'], cross: ['IfcPipeFitting', 'JUNCTION', 'Cross'], bend: ['IfcPipeFitting', 'BEND', 'Bend'], reducer: ['IfcPipeFitting', 'TRANSITION', 'Reducer'], cap: ['IfcPipeFitting', 'OBSTRUCTION', 'Cap'] };   // i18n-ignore: IFC file data
    for (const f of wat.fixtures) {
      const k = KIND[f.kind]; if (!k) continue;
      const rr = Math.max(f.dia > 0 ? f.dia / 2 : 0, (unit === 'm' ? 0.1 : 0.35)), h = f.kind === 'hydrant' ? (unit === 'm' ? 1 : 3.3) + wat.cover : 2 * rr;
      const base = f.kind === 'hydrant' ? f.z : f.z - rr;   // a hydrant stands from the main to above the ground; the rest are centred on the main
      const ftag = 'wfit|' + f.id;
      const el = element({ cls: k[0], pre: k[1], name: f.name, label: k[2], tag: ftag, rep: shape([[cBody, 'Body', 'SweptSolid', [extrudeW(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: R(rr) }), w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(f.x), ly(f.y), lz(base)]) }), h)]]]) });
      put(site, el); members.push(el); counts.pipes++;
      pset([el], 'CadCraft_WaterFitting', [['Kind', k[2], 'label'], ['Source', f.source === 'placed' ? 'Placed by the person' : 'Implied by the layout', 'label'], ...(f.angle != null ? [['Angle', f.angle, 'real']] : [])], ftag);   // i18n-ignore: IFC file data
    }
    if (members.length) {
      const sys = root(w.has('IfcDistributionSystem') ? 'IfcDistributionSystem' : 'IfcSystem', 'system|water', { Name: S(wat.name), ObjectType: S('Water main'), PredefinedType: '.DOMESTICCOLDWATER.' });   // i18n-ignore: IFC file data
      root('IfcRelAssignsToGroup', 'system|water|members', { RelatedObjects: L(members), RelatingGroup: sys });
    }
  }

  // ---- parcels (footprints)
  for (const r of model.parcels) {
    const ring = r.pts.map((q) => w.pt([lx(q.x), ly(q.y)]));
    ring.push(ring[0]);
    const el = element({ cls: 'IfcGeographicElement', pre: 'USERDEFINED', name: r.name, label: 'Parcel', tag: 'parcel|' + r.id, rep: shape([[cFoot, 'FootPrint', 'Curve2D', [w.ent('IfcPolyline', { Points: L(ring) })]]]), extra: { ObjectType: S('Parcel') } });   // i18n-ignore: IFC file data
    put(site, el); counts.parcels++;
    pset([el], 'CadCraft_Parcel', [['Area', m2(r.area), 'area']], 'parcel|' + r.id);
  }

  // ---- the Landscape workspace (ifc-landscape.js elements; bodies in project units, relative to `at`)
  const types = new Map(), materials = new Map(), Z = w.dir([0, 0, 1]), XD = w.dir([1, 0, 0]);
  const value = (v, key) => (typeof v === 'boolean' ? ['bool', v] : typeof v === 'number' && fin(v) ? (/Count$/.test(key) && Number.isInteger(v) ? ['int', v] : ['real', v]) : String(v ?? '').length > 255 ? ['text', String(v).slice(0, 2000)] : ['label', String(v ?? '')]);
  const lsSolids = (b) => {
    if (!b) return [];
    const polyProf = (pts) => { const ring = pts.map((p) => w.pt([p.x, p.y])); ring.push(ring[0]); return w.ent('IfcArbitraryClosedProfileDef', { ProfileType: '.AREA.', OuterCurve: w.ent('IfcPolyline', { Points: L(ring) }) }); };
    const ext = (prof, z0, z1) => w.ent('IfcExtrudedAreaSolid', { SweptArea: prof, Position: w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, z0]) }), ExtrudedDirection: Z, Depth: R(Math.max(1e-4, z1 - z0)) });
    if (b.kind === 'cylinders') return b.parts.filter((p) => p.r > 0 && p.z1 > p.z0).map((p) => ['SweptSolid', ext(w.ent('IfcCircleProfileDef', { ProfileType: '.AREA.', Position: ax2d0, Radius: R(p.r) }), p.z0, p.z1)]);
    if (b.kind === 'prism') return b.pts?.length >= 3 && b.z1 > b.z0 ? [['SweptSolid', ext(polyProf(b.pts), b.z0, b.z1)]] : [];
    if (b.kind === 'prisms') return b.list.flatMap((q) => lsSolids({ kind: 'prism', ...q }));
    if (b.kind === 'mesh' && b.indices?.length >= 3) {
      // a freeform mesh relative to its element's placement: written as is (tess() moves to the origin; undo that first)
      return [tessLocal({ pos: Array.from(b.positions), idx: Array.from(b.indices), closed: false })];
    }
    return [];
  };
  const tessLocal = (m) => { const P = m.pos.slice(); for (let i = 0; i < P.length; i += 3) { P[i] += o.x; P[i + 1] += o.y; P[i + 2] += o.z; } return tess({ ...m, pos: P }); };
  model.landscape.forEach((e, i) => {
    const tag = 'ls|' + (e.tag || i), at = e.at || { x: o.x, y: o.y, z: 0, rot: 0 }, rot = at.rot || 0;
    const plc = w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(at.x), ly(at.y), lz(at.z || 0)]), Axis: Z, RefDirection: rot ? w.dir([Math.cos(rot), Math.sin(rot), 0]) : XD });
    const items = lsSolids(e.body);
    const kinds = [...new Set(items.map((x) => x[0]))];
    const rep = items.length ? shape([[cBody, 'Body', kinds.length === 1 ? kinds[0] : 'SolidModel', items.map((x) => x[1])]]) : null;
    const label = e.objectType || words((e.predefined && e.predefined !== 'NOTDEFINED' && e.predefined !== 'USERDEFINED' ? e.predefined : e.cls.replace(/^Ifc/, '')));
    const el = element({ cls: e.cls, pre: e.predefined || 'NOTDEFINED', name: e.name, label, tag, rep, at: plc, extra: e.objectType ? { ObjectType: S(e.objectType) } : {} });
    put(site, el); counts.landscape++;
    for (const [pn, pr] of Object.entries(e.psets || {})) pset([el], pn, Object.entries(pr).filter(([, v]) => v !== '' && v != null).map(([k, v]) => { const [f, x] = value(v, k); return [k, x, f]; }), tag);
    if (e.material) {
      let ref;
      const mat = (n) => { if (!materials.has(n)) materials.set(n, w.ent('IfcMaterial', { Name: S(n) })); return materials.get(n); };
      if (typeof e.material === 'string') ref = mat(e.material);
      else ref = w.ent('IfcMaterialLayerSet', { MaterialLayers: L(e.material.map((m) => w.ent('IfcMaterialLayer', { Material: mat(m.name), LayerThickness: R(Math.max(m.thickness, 1e-6)), Name: S(m.name) }))), LayerSetName: S(tag) });
      root('IfcRelAssociatesMaterial', 'mat|' + tag, { RelatedObjects: L([el]), RelatingMaterial: ref });
    }
    if (e.type) {
      let ty = types.get(e.type.key);
      if (!ty) {
        const want = e.type.cls || e.cls + 'Type', tcls = w.has(want) ? want : w.has('IfcCivilElementType') ? 'IfcCivilElementType' : 'IfcBuildingElementProxyType';
        const sets = Object.entries(e.type.psets || {}).map(([pn, pr]) => {
          const ps = Object.entries(pr).filter(([, v]) => v !== '' && v != null).map(([k, v]) => { const [f, x] = value(v, k); return w.ent('IfcPropertySingleValue', { Name: S(k), NominalValue: T[f](x) }); });
          if (!ps.length) return null;
          counts.psets++;
          return root('IfcPropertySet', 'tpset|' + e.type.key + '|' + pn, { Name: S(pn), HasProperties: L(ps) });
        }).filter(Boolean);
        const t = root(tcls, 'type|' + e.type.key, { Name: S(e.type.name), HasPropertySets: sets.length ? L(sets) : null, Tag: S(e.type.key), ElementType: tcls !== want ? S(label) : null, PredefinedType: E(e.type.predefined || e.predefined || 'NOTDEFINED'), _ot: label });
        ty = { ref: t, members: [] };
        types.set(e.type.key, ty);
      }
      ty.members.push(el);
    }
  });
  for (const [key, ty] of types) root('IfcRelDefinesByType', 'rdt|' + key, { RelatedObjects: L(ty.members), RelatingType: ty.ref });

  // ---- building masses (ifc-massing.js's shape: a building, its storeys, the mass as a proxy)
  for (const m of model.masses) {
    const tag = m.id || String(counts.masses);
    let P = m.pts, a = 0;
    for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; a += p.x * q.y - q.x * p.y; }
    if (a < 0) P = P.slice().reverse();
    const Hm = m.floors * m.floorHeight, fp = Math.abs(a / 2);
    const bLP = place(siteLP, w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, lz(m.z0)]) }));
    const building = root('IfcBuilding', 'building|' + tag, { Name: S(m.name), ObjectPlacement: bLP, CompositionType: '.ELEMENT.' });
    siteKids.push(building);
    const storeys = [];
    for (let k = 0; k < m.floors; k++) storeys.push(root('IfcBuildingStorey', 'storey|' + tag + '|' + k, { Name: S('Level ' + (k + 1)), ObjectPlacement: place(bLP, w.ent('IfcAxis2Placement3D', { Location: w.pt([0, 0, k * m.floorHeight]) })), CompositionType: '.ELEMENT.', Elevation: R(m.z0 + k * m.floorHeight) }));   // i18n-ignore: IFC file data
    const ring = P.map((p) => w.pt([lx(p.x), ly(p.y)]));
    ring.push(ring[0]);
    const solid = w.ent('IfcExtrudedAreaSolid', { SweptArea: w.ent('IfcArbitraryClosedProfileDef', { ProfileType: '.AREA.', OuterCurve: w.ent('IfcPolyline', { Points: L(ring) }) }), Position: w.ent('IfcAxis2Placement3D', { Location: O3 }), ExtrudedDirection: Z, Depth: R(Hm) });
    const proxy = root('IfcBuildingElementProxy', 'mass|' + tag, { Name: S(m.name), Description: S('Building mass'), ObjectPlacement: place(bLP), Representation: shape([[cBody, 'Body', 'SweptSolid', [solid]]]), PredefinedType: '.NOTDEFINED.' });   // i18n-ignore: IFC file data
    pset([proxy], 'CadCraft_SiteMass', [['MassId', tag, 'label'], ['Use', m.use || '', 'label'], ['Floors', m.floors, 'int'], ['FloorHeight', m.floorHeight, 'len'], ['Height', Hm, 'len'], ['GroundFloorLevel', m.z0, 'len'],
      ['FootprintArea', m2(fp), 'area'], ['GrossFloorArea', m2(fp * m.floors), 'area'], ['BaseOnSlope', m.base || '', 'label'], ['Ground', m.ground || '', 'label'], ['Parcel', m.parcel || '', 'label']], 'mass|' + tag);
    put(building, proxy);
    root('IfcRelAggregates', 'rel-storeys|' + tag, { RelatingObject: building, RelatedObjects: L(storeys) });
    counts.masses++;
  }

  // 0.7.1 71.27: property sets on the project (the native save's CadCraft_Native), last in the file
  for (const [pname, props] of projectPsets) pset([project], pname, props, 'project');

  // ---- the spatial tree
  root('IfcRelAggregates', 'rel-project', { RelatingObject: project, RelatedObjects: L(projectKids) });
  if (siteKids.length) root('IfcRelAggregates', 'rel-site', { RelatingObject: site, RelatedObjects: L(siteKids) });
  let k = 0;
  for (const [container, list] of contain) if (list.length) root('IfcRelContainedInSpatialStructure', 'contain|' + (k++), { RelatedElements: L(list), RelatingStructure: container });

  const stamp = now.toISOString().slice(0, 19);
  const view = X2 ? 'CoordinationView_V2.0' : 'ReferenceView';
  const head = ['ISO-10303-21;', 'HEADER;', "FILE_DESCRIPTION(('ViewDefinition [" + view + "]'),'2;1');",
    'FILE_NAME(' + S((model.name || 'site') + '.ifc') + ",'" + stamp + "',(''),(''),'CivilCraft 0.7.1','CivilCraft','');", "FILE_SCHEMA(('" + schema + "'));", 'ENDSEC;', 'DATA;'];   // i18n-ignore: file header
  return { text: [...head, ...w.lines, 'ENDSEC;', 'END-ISO-10303-21;', ''].join('\n'), schema, counts, unit, origin: o, georef: geo, tags };
}
