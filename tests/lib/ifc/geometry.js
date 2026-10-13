/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geometry.js — the geometry of IFC products for cc-ifc. For each product with a placement and a shape it returns the
 * pieces to draw: a mesh in the file's length unit, the matrix that places it in the world (file units, Z up) and a
 * colour. Representation items read: mapped items (IfcRepresentationMap + IfcCartesianTransformationOperator), swept
 * solids and CSG primitives (geo-solid.js), breps and face sets (geo-brep.js), booleans, half-spaces and CSG trees
 * (geo-bool.js); openings (IfcRelVoidsElement) are cut from their element. Identical items shared through a
 * representation map are built once (geometry ids are shared then).
 *
 *   const geo = new Geometry(file)            file = model.js IfcFile
 *   geo.products({ types, exclude })          ids to draw (default: every product with a shape except openings and spaces)
 *   geo.pieces(productId) → [{ geomId, matrix, color }]
 *   geo.mesh(geomId) → Mesh                   (built pieces are kept until clear())
 *   geo.notes → Map(text → count)             what could not be drawn and why
 */

import { GeoCtx } from './geo-ctx.js';
import { Mesh } from './geo-mesh.js';
import { Styles } from './geo-style.js';
import { extruded, revolved, sweptDisk, sweptArea, primitive } from './geo-solid.js';
import { brep, faceSet, surfaceModel, boundingBox, shellFaces } from './geo-brep.js';
import { boolean, halfSpaceCut, hasManifold, subtractAll } from './geo-bool.js';
import { mul, invert, I4 } from './geo-math.js';
import { advancedBrep } from './geo-nurbs.js';
import { sectionedSolid } from './geo-align.js';

const BODY_IDS = new Set(['BODY', 'FACETATION', 'MESH', 'TESSELLATION', 'SURFACE', 'BODY-FALLBACK']);
const SKIP_IDS = new Set(['AXIS', 'FOOTPRINT', 'BOX', 'ANNOTATION', 'PROFILE', 'CLEARANCE', 'REFERENCE', 'LIGHTING', 'COG', 'PLAN', 'SURVEYPOINTS', 'TEXT']);
const SOLID_TYPES = new Set(['SWEPTSOLID', 'ADVANCEDSWEPTSOLID', 'BREP', 'ADVANCEDBREP', 'CSG', 'CLIPPING', 'SURFACEMODEL', 'TESSELLATION', 'SOLIDMODEL', 'MAPPEDREPRESENTATION', 'BOUNDINGBOX', 'SECTIONEDSPINE', 'ADVANCEDSURFACE', 'SURFACE3D', 'CURVE3D']);
// openings are cut from their elements and spaces are rooms (an app streams them on their own); everything else with a
// body is drawn — products that only have 2D or axis representations give no pieces
const DEFAULT_EXCLUDE = ['IFCOPENINGELEMENT', 'IFCSPACE'];

export const GEOM_ID_BASE = 2 ** 28;   // above any express ID a file uses in practice; geometry ids are ours

export class Geometry {
  constructor(file) {
    this.f = file;
    this.g = new GeoCtx(file);
    this.st = new Styles(this.g);
    this.store = new Map();          // geomId → Mesh
    this.itemGeom = new Map();       // item id → geomId (items whose mesh does not depend on the product)
    this.nextId = GEOM_ID_BASE;
    this.voids = null;
  }

  get notes() { return this.g.notes; }

  clear() { this.store.clear(); this.itemGeom.clear(); this.g.places.clear(); this.voids = null; }

  products({ types = null, exclude = DEFAULT_EXCLUDE } = {}) {
    const f = this.f, s = f.schema;
    const out = [];
    const skip = new Set(exclude.flatMap((t) => s.subtypes(t)));
    const roots = types ? types.flatMap((t) => s.subtypes(t)) : s.subtypes('IFCPRODUCT');
    for (const t of new Set(roots)) {
      if (skip.has(t) && !(types && types.includes(t))) continue;
      for (const id of f.ofType(t)) {
        if (f.attr(id, 'Representation') && f.attr(id, 'ObjectPlacement') !== undefined) out.push(id);
      }
    }
    return out.sort((a, b) => a - b);
  }

  /** The body representations of a product (IfcShapeRepresentation ids). */
  bodyReps(pid) {
    const g = this.g;
    const pds = g.ref(g.a(pid, 'Representation'));
    if (pds === null) return [];
    const reps = g.refs(g.a(pds, 'Representations'));
    const body = [], other = [];
    for (const r of reps) {
      const ident = String(g.str(g.a(r, 'RepresentationIdentifier')) || '').toUpperCase();
      const type = String(g.str(g.a(r, 'RepresentationType')) || '').toUpperCase().replace(/[\s_-]/g, '');
      if (BODY_IDS.has(ident)) body.push(r);
      else if (!ident && SOLID_TYPES.has(type)) other.push(r);
      else if (!SKIP_IDS.has(ident) && SOLID_TYPES.has(type) && type !== 'CURVE3D') other.push(r);
    }
    return body.length ? body : other;
  }

  /** Opening meshes of an element (one per opening item), in the element's own frame; null when it has none. */
  openings(pid, world) {
    if (!this.voids) this.voids = this.f.inverse('IFCRELVOIDSELEMENT', 'RelatingBuildingElement');
    const rels = this.voids.get(pid);
    if (!rels || !rels.length) return null;
    const g = this.g;
    const inv = invert(world) || I4();
    const out = [];
    for (const r of rels) {
      const op = g.ref(g.a(r, 'RelatedOpeningElement'));
      if (op === null) continue;
      const ow = g.placement(g.ref(g.a(op, 'ObjectPlacement')));
      const toLocal = mul(inv, ow);
      for (const rep of this.bodyReps(op)) for (const it of g.refs(g.a(rep, 'Items'))) {
        for (const p of this.item(it, I4(), null, 0, true)) {
          const m = new Mesh().append(this.store.get(p.geomId) || p.mesh, mul(toLocal, p.matrix));
          if (!m.isEmpty) out.push(m);
        }
      }
    }
    return out.length ? out : null;
  }

  pieces(pid) {
    const g = this.g;
    const world = g.placement(g.ref(g.a(pid, 'ObjectPlacement')));
    const fallback = this.st.productColor(pid);
    const raw = [];
    for (const rep of this.bodyReps(pid)) for (const it of g.refs(g.a(rep, 'Items'))) raw.push(...this.item(it, I4(), null, 0, false));
    if (!raw.length) return [];
    const cuts = this.openings(pid, world);
    const out = [];
    for (const p of raw) {
      const color = p.color || fallback || Styles.DEFAULT;
      if (cuts) {
        // bake the piece into the element's frame and cut the openings from it
        const baked = new Mesh().append(this.store.get(p.geomId) || p.mesh, p.matrix);
        const cut = subtractAll(baked, cuts, g);
        if (cut && cut.isEmpty && !baked.isEmpty) g.note('An element lies wholly inside its own openings and is cut away (as the file says)');
        const id = this.keep(cut || baked);
        out.push({ geomId: id, matrix: world, color });
      } else {
        const id = p.geomId ?? this.keep(p.mesh);
        out.push({ geomId: id, matrix: mul(world, p.matrix), color });
      }
    }
    return out.filter((p) => !this.store.get(p.geomId).isEmpty);
  }

  keep(mesh) { const id = this.nextId++; this.store.set(id, mesh); return id; }

  mesh(id) { return this.store.get(id) || null; }

  /**
   * One representation item → [{ geomId | mesh, matrix (item → representation frame), color }]. Leaf meshes that do not
   * depend on their product are stored once by item id.
   */
  item(id, m, color, depth, forCut) {
    const g = this.g;
    if (id === null || depth > 24) return [];
    const t = g.t(id);
    const own = this.st.itemColor(id) || color;
    if (t === 'IFCMAPPEDITEM') {
      const src = g.ref(g.a(id, 'MappingSource'));
      const origin = g.ref(g.a(src, 'MappingOrigin'));
      const om = g.t(origin)?.startsWith('IFCCARTESIANTRANSFORMATIONOPERATOR') ? g.operator(origin) : g.axis2(origin);
      const tm = mul(m, mul(g.operator(g.ref(g.a(id, 'MappingTarget'))), om));
      const rep = g.ref(g.a(src, 'MappedRepresentation'));
      return g.refs(g.a(rep, 'Items')).flatMap((it) => this.item(it, tm, own, depth + 1, forCut));
    }
    let geomId = this.itemGeom.get(id);
    if (geomId === undefined) {
      let mesh;
      try { mesh = this.leaf(id, t, depth); } catch (e) { g.note('A ' + (g.s.pretty(t) || 'shape') + ' could not be built: ' + e.message); mesh = null; }
      if (!mesh) return [];
      geomId = this.keep(mesh);
      this.itemGeom.set(id, geomId);
    }
    return [{ geomId, matrix: m, color: own }];
  }

  /** A leaf item's mesh in its own frame (booleans resolved here), or null. */
  leaf(id, t, depth) {
    const g = this.g;
    switch (t) {
      case 'IFCEXTRUDEDAREASOLID': case 'IFCEXTRUDEDAREASOLIDTAPERED': return extruded(g, id);
      case 'IFCREVOLVEDAREASOLID': case 'IFCREVOLVEDAREASOLIDTAPERED': return revolved(g, id);
      case 'IFCSWEPTDISKSOLID': case 'IFCSWEPTDISKSOLIDPOLYGONAL': return sweptDisk(g, id);
      case 'IFCSURFACECURVESWEPTAREASOLID': case 'IFCFIXEDREFERENCESWEPTAREASOLID': case 'IFCDIRECTRIXCURVESWEPTAREASOLID': return sweptArea(g, id);
      case 'IFCBLOCK': case 'IFCRIGHTCIRCULARCYLINDER': case 'IFCRIGHTCIRCULARCONE': case 'IFCSPHERE': case 'IFCRECTANGULARPYRAMID': return primitive(g, id);
      case 'IFCFACETEDBREP': case 'IFCFACETEDBREPWITHVOIDS': return brep(g, id);
      case 'IFCADVANCEDBREP': case 'IFCADVANCEDBREPWITHVOIDS': return advancedBrep(g, id);
      case 'IFCPOLYGONALFACESET': case 'IFCTRIANGULATEDFACESET': case 'IFCTRIANGULATEDIRREGULARNETWORK': return faceSet(g, id);
      case 'IFCSHELLBASEDSURFACEMODEL': case 'IFCFACEBASEDSURFACEMODEL': return surfaceModel(g, id);
      case 'IFCCLOSEDSHELL': case 'IFCOPENSHELL': case 'IFCCONNECTEDFACESET': { const m = new Mesh(); shellFaces(g, id, m); return m; }
      case 'IFCBOUNDINGBOX': return boundingBox(g, id);
      case 'IFCSECTIONEDSOLIDHORIZONTAL': return sectionedSolid(g, id);
      case 'IFCCSGSOLID': return this.operand(g.ref(g.a(id, 'TreeRootExpression')), depth + 1);
      case 'IFCBOOLEANRESULT': case 'IFCBOOLEANCLIPPINGRESULT': return this.booleanResult(id, depth);
      case 'IFCGEOMETRICSET': case 'IFCGEOMETRICCURVESET': case 'IFCPOLYLINE': case 'IFCINDEXEDPOLYCURVE': case 'IFCCOMPOSITECURVE':
      case 'IFCTRIMMEDCURVE': case 'IFCCARTESIANPOINT': case 'IFCTEXTLITERAL': case 'IFCTEXTLITERALWITHEXTENT': case 'IFCANNOTATIONFILLAREA':
      case 'IFCCIRCLE': case 'IFCLINE': case 'IFCSTYLEDITEM':
        return null;   // curves, points and text: not part of a body
      default:
        if (t) g.note(g.s.pretty(t) + ' is not drawn yet');
        return null;
    }
  }

  /** A boolean operand: a solid, a half-space (only as a second operand), a nested boolean or a CSG primitive. */
  operand(id, depth) {
    const t = this.g.t(id);
    return this.leaf(id, t, depth + 1) || new Mesh();
  }

  booleanResult(id, depth) {
    const g = this.g;
    const op = g.enm(g.a(id, 'Operator')) || 'DIFFERENCE';
    const a = this.operand(g.ref(g.a(id, 'FirstOperand')), depth);
    const bId = g.ref(g.a(id, 'SecondOperand'));
    const bt = g.t(bId);
    if (bt && g.s.isA(bt, 'IFCHALFSPACESOLID')) {
      if (op === 'DIFFERENCE') return halfSpaceCut(g, a, bId);
      g.note('Only differences with half-spaces are cut');
      return a;
    }
    const b = this.operand(bId, depth);
    if (op === 'UNION' && !hasManifold()) return new Mesh().append(a).append(b);
    const r = boolean(op, a, b, g);
    if (r) return r;
    g.note(hasManifold() ? 'A boolean was left uncut (an operand is not a closed solid)' : 'Booleans are not cut (no boolean engine loaded)');
    return op === 'UNION' ? new Mesh().append(a).append(b) : a;
  }
}
