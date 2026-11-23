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
import { stepString as S, stepList as L, stepBool as B } from './ifc/step.js';   // 0.11 PERF.73: one copy of the token helpers
import { guid } from './landscape/ifc-landscape.js';
import { fileUnit, FT_US_M } from './ifc-massing.js';
import { writeIfcSite } from './ifc-civil-site.js';
import { writeIfcNetworks } from './ifc-civil-networks.js';
import { writeIfcCorridors } from './ifc-civil-corridors.js';
import { writeIfcAlignments } from './ifc-civil-align.js';

export const SCHEMAS = ['IFC4X3_ADD2', 'IFC4', 'IFC2X3'];
export const SCHEMA_INFO = {
  IFC4X3_ADD2: { key: 'IFC4X3', file: '4x3', losses: ['ifc.loss.43.cant', 'ifc.loss.43.thick'] },
  IFC4: { key: 'IFC4', file: '4', losses: ['ifc.loss.4.align', 'ifc.loss.4.road', 'ifc.loss.43.thick'] },
  IFC2X3: { key: 'IFC2X3', file: '2x3', losses: ['ifc.loss.4.align', 'ifc.loss.2.proxy', 'ifc.loss.2.geo', 'ifc.loss.2.mesh'] },
};

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const R = (v, d = 6) => { if (!fin(v)) return '0.'; let s = (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d).replace(/(\.\d*?)0+$/, '$1'); if (!s.includes('.')) s += '.'; return s === '-0.' ? '0.' : s; };
const E = (v) => '.' + String(v).toUpperCase().replace(/[^A-Z0-9_]/g, '') + '.';
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
  const geomCtx = w.ent('IfcGeometricRepresentationContext', { ContextType: S('Model'), CoordinateSpaceDimension: '3', Precision: '1.E-05', WorldCoordinateSystem: WCS, TrueNorth: w.dir([0, 1]) });
  const sub = (ident, view) => w.ent('IfcGeometricRepresentationSubContext', { ContextIdentifier: S(ident), ContextType: S('Model'), ParentContext: geomCtx, TargetView: view });
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
  const project = root('IfcProject', 'project', { Name: S(model.name || 'Site'), RepresentationContexts: L([geomCtx]), UnitsInContext: ua });

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
      w.ent('IfcMapConversion', { SourceCRS: geomCtx, TargetCRS: crsId, Eastings: R(E0), Northings: R(N0), OrthogonalHeight: R(o.z), XAxisAbscissa: R(geo.xa, 12), XAxisOrdinate: R(geo.xo, 12), Scale: R(sc, 12) });
    } else {
      pset([site], 'ePSet_ProjectedCRS', [['Name', geo.name, 'label'], ['Description', geo.desc, 'label'], ['GeodeticDatum', geo.datum, 'label'], ['MapUnit', unit === 'm' ? 'METRE' : unit === 'ft' ? 'FOOT' : 'US SURVEY FOOT', 'label']], 'site');   // i18n-ignore: IFC file data
      pset([site], 'ePSet_MapConversion', [['Eastings', E0, 'len'], ['Northings', N0, 'len'], ['OrthogonalHeight', o.z, 'len'], ['XAxisAbscissa', geo.xa, 'real'], ['XAxisOrdinate', geo.xo, 'real'], ['Scale', sc, 'real']], 'site');
    }
  }
  // i18n-ignore: IFC file data (property values in English, like every IFC we write)
  pset([site], 'CadCraft_Site', [['OriginEasting', o.x, 'len'], ['OriginNorthing', o.y, 'len'], ['ProjectUnits', units === 'm' ? 'metre' : 'US survey foot', 'label'], ['Source', 'CivilCraft', 'label']], 'site');
  const siteKids = [], contain = new Map();   // container → [elements]
  const { put, MPS, designProps, alOut } = writeIfcAlignments({
    w, units, X4, lx, ly, lz, um, counts, root, O2, X2D, ax2d0, cAxis, cFoot, pset, place, shape, element, site, projectKids, contain, model, parabolaLength,
    get fin() { return fin; },
    get R() { return R; },
    get E() { return E; },
  });

  writeIfcCorridors({
    X4, w, lx, ly, lz, um, m2, meshArea, counts, root, O3, ax2d0, cBody, pset, qto, place, shape, body, element, isCut, siteLP, site, siteKids, contain, put, MPS, designProps, alOut, model,
    get fin() { return fin; },
    get R() { return R; },
    get E() { return E; },
  });

  writeIfcNetworks({
    w, lx, ly, lz, unit, counts, root, O2, ax2d0, cBody, pset, qto, shape, element, site, put, model,
    get R() { return R; },
    get words() { return words; },
  });

  writeIfcSite({
    w, lx, ly, lz, o, m2, counts, root, O3, ax2d0, cBody, cFoot, T, pset, place, shape, tess, element, siteLP, site, siteKids, put, model,
    get R() { return R; },
    get fin() { return fin; },
    get words() { return words; },
    get E() { return E; },
  });

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
