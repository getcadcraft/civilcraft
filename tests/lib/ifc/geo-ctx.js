/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-ctx.js — what every geometry module needs from an open file (model.js IfcFile): attributes by name, numbers and
 * references out of raw values, the project's units, and placements as matrices (IFC4 ADD2 TC1 §8.18 Geometry resource:
 * IfcAxis2Placement2D/3D, IfcAxis1Placement, IfcCartesianTransformationOperator2D/3D (+ NonUniform); §8.17 Geometric
 * constraint resource: IfcLocalPlacement, IfcGridPlacement). Matrices are column-major 4 × 4, in the file's length unit.
 *
 *   const g = new GeoCtx(file)
 *   g.t(id) 'IFCWALL'   g.a(id, 'Name') raw   g.num(v)   g.ref(v)   g.refs(v)   g.str(v)   g.isA(id, 'IFCPROFILEDEF')
 *   g.lengthUnit  metres per file length unit      g.angleUnit  radians per file plane angle unit
 *   g.placement(id)  world matrix of an IfcObjectPlacement (cached; IFC4X3 IfcLinearPlacement through geo-align.js)
 *   g.axis2(id) / g.axis2d(id) / g.operator(id)    matrices of the placement entities
 *   g.note(text)  a note for the report (each text once)
 *   g.georef()   IfcMapConversion (+ Scaled) / IfcRigidOperation → { kind, crs, eastings, northings, height, xAxis,
 *                rotation (radians from map east to the model's x axis), scale, matrix (model units → map) } | null
 */

import { I4, mul, frame, norm, cross, dot, sub, scale, perp } from './geo-math.js';
import { linearPlacement } from './geo-align.js';

export class GeoCtx {
  constructor(file) {
    this.f = file;
    this.s = file.schema;
    this.places = new Map();
    this.notes = new Map();
    this.units();
  }

  t(id) { return id == null ? null : this.f.type(id); }
  isA(id, up) { const t = this.t(id); return !!t && this.s.isA(t, up); }
  a(id, name) { return this.f.attr(id, name); }

  num(v, dflt = null) {
    if (v === null || v === undefined) return dflt;
    if (typeof v === 'number') return v;
    if (typeof v === 'object' && 'typed' in v) return this.num(v.value, dflt);
    return dflt;
  }
  ref(v) { return v && typeof v === 'object' && 'ref' in v ? v.ref : null; }
  refs(v) { return Array.isArray(v) ? v.map((x) => this.ref(x)).filter((x) => x !== null) : []; }
  str(v) {
    if (v === null || v === undefined) return null;
    if (typeof v === 'string') return v;
    if (typeof v === 'object' && 'typed' in v) return this.str(v.value);
    if (typeof v === 'object' && 'enum' in v) return v.enum;
    return null;
  }
  enm(v) { return v && typeof v === 'object' && 'enum' in v ? v.enum : null; }
  bool(v, dflt = null) {
    const e = this.enm(v && typeof v === 'object' && 'typed' in v ? v.value : v);
    if (e === 'T') return true;
    if (e === 'F') return false;
    return dflt;
  }

  note(text) { this.notes.set(text, (this.notes.get(text) || 0) + 1); }

  // ---- units ----

  units() {
    this.lengthUnit = 1;      // metres per file unit (IFC's default length unit is the metre)
    this.angleUnit = 1;       // radians per file unit (IFC's default plane angle unit is the radian)
    const f = this.f;
    let ua = null;
    const proj = f.ofType('IFCPROJECT', true)[0] ?? f.ofType('IFCCONTEXT', true)[0];
    if (proj !== undefined) ua = this.ref(this.a(proj, 'UnitsInContext'));
    if (ua === null) ua = f.ofType('IFCUNITASSIGNMENT')[0] ?? null;
    if (ua === null) return;
    for (const u of this.refs(this.a(ua, 'Units'))) {
      const kind = this.enm(this.a(u, 'UnitType'));
      if (kind === 'LENGTHUNIT') this.lengthUnit = this.unitFactor(u, 'METRE') ?? 1;
      if (kind === 'PLANEANGLEUNIT') this.angleUnit = this.unitFactor(u, 'RADIAN') ?? 1;
    }
  }

  /** The SI value of one of `u` (SI base unit with prefix, or a conversion-based unit through its factor). */
  unitFactor(u, base, depth = 0) {
    if (depth > 8 || u === null) return null;
    const t = this.t(u);
    if (t === 'IFCSIUNIT') {
      const p = this.enm(this.a(u, 'Prefix'));
      return p ? PREFIX[p] ?? 1 : 1;
    }
    if (t === 'IFCCONVERSIONBASEDUNIT' || t === 'IFCCONVERSIONBASEDUNITWITHOFFSET') {
      const m = this.ref(this.a(u, 'ConversionFactor'));
      if (m !== null) {
        const v = this.num(this.a(m, 'ValueComponent'));
        const inner = this.unitFactor(this.ref(this.a(m, 'UnitComponent')), base, depth + 1) ?? 1;
        if (v && Number.isFinite(v)) return v * inner;
      }
      const n = String(this.str(this.a(u, 'Name')) || '').toUpperCase();
      if (base === 'RADIAN' && n.includes('DEGREE')) return Math.PI / 180;
      if (n.includes('INCH')) return 0.0254;
      if (n.includes('FOOT') || n.includes('FEET')) return 0.3048;
    }
    return null;
  }

  // ---- points and directions ----

  point(id) {
    if (id === null) return [0, 0, 0];
    const c = this.a(id, 'Coordinates');
    if (!Array.isArray(c)) return [0, 0, 0];
    return [this.num(c[0], 0), this.num(c[1], 0), this.num(c[2], 0)];
  }
  dir(id, dflt = null) {
    if (id === null) return dflt;
    const r = this.a(id, 'DirectionRatios');
    if (!Array.isArray(r)) return dflt;
    const v = [this.num(r[0], 0), this.num(r[1], 0), this.num(r[2], 0)];
    const n = norm(v);
    return n[0] || n[1] || n[2] ? n : dflt;
  }
  /** IfcVector → [x, y, z] with its magnitude. */
  vector(id) {
    const d = this.dir(this.ref(this.a(id, 'Orientation')), [1, 0, 0]);
    return scale(d, this.num(this.a(id, 'Magnitude'), 1));
  }

  // ---- placements ----

  /** IfcAxis2Placement3D / 2D / IfcAxis1Placement → matrix (2D placements lie in the XY plane). */
  axis2(id) {
    if (id === null) return I4();
    const t = this.t(id);
    const o = this.point(this.ref(this.a(id, 'Location')));
    if (t === 'IFCAXIS2PLACEMENT2D') {
      let x = this.dir(this.ref(this.a(id, 'RefDirection')), [1, 0, 0]);
      x = norm([x[0], x[1], 0]);
      if (!x[0] && !x[1]) x = [1, 0, 0];
      return frame([o[0], o[1], 0], x, [-x[1], x[0], 0], [0, 0, 1]);
    }
    if (t === 'IFCAXIS1PLACEMENT') {
      const z = this.dir(this.ref(this.a(id, 'Axis')), [0, 0, 1]);
      const x = perp(z);
      return frame(o, x, cross(z, x), z);
    }
    if (t === 'IFCAXIS2PLACEMENT3D') {
      const z = this.dir(this.ref(this.a(id, 'Axis')), [0, 0, 1]);
      let x = this.dir(this.ref(this.a(id, 'RefDirection')), null);
      x = firstProjAxis(z, x);
      return frame(o, x, cross(z, x), z);
    }
    if (t === 'IFCAXIS2PLACEMENTLINEAR') { this.note('Linear placements are drawn at their start point'); return I4(); }
    return I4();
  }
  axis2d(id) { return this.axis2(id); }

  /** IfcCartesianTransformationOperator2D/3D (+ NonUniform): IFC4 IfcBaseAxis / IfcFirstProjAxis / IfcSecondProjAxis. */
  operator(id) {
    if (id === null) return I4();
    const t = this.t(id);
    const two = t === 'IFCCARTESIANTRANSFORMATIONOPERATOR2D' || t === 'IFCCARTESIANTRANSFORMATIONOPERATOR2DNONUNIFORM';
    const o = this.point(this.ref(this.a(id, 'LocalOrigin')));
    const s1 = this.num(this.a(id, 'Scale'), 1);
    const s2 = this.num(this.a(id, 'Scale2'), s1);
    const s3 = this.num(this.a(id, 'Scale3'), s1);
    const a1 = this.dir(this.ref(this.a(id, 'Axis1')), null);
    const a2 = this.dir(this.ref(this.a(id, 'Axis2')), null);
    if (two) {
      let x = a1 ? norm([a1[0], a1[1], 0]) : [1, 0, 0];
      let y = a2 ? norm([a2[0], a2[1], 0]) : [-x[1], x[0], 0];
      return [x[0] * s1, x[1] * s1, 0, 0, y[0] * s2, y[1] * s2, 0, 0, 0, 0, 1, 0, o[0], o[1], 0, 1];
    }
    const z = this.dir(this.ref(this.a(id, 'Axis3')), [0, 0, 1]);
    const x = firstProjAxis(z, a1);
    let y;
    if (a2) { const v = sub(a2, scale(z, dot(a2, z))); y = norm(sub(v, scale(x, dot(v, x)))); if (!y[0] && !y[1] && !y[2]) y = cross(z, x); }
    else y = cross(z, x);
    return [x[0] * s1, x[1] * s1, x[2] * s1, 0, y[0] * s2, y[1] * s2, y[2] * s2, 0, z[0] * s3, z[1] * s3, z[2] * s3, 0, o[0], o[1], o[2], 1];
  }

  /** World matrix of an IfcObjectPlacement (IfcLocalPlacement chain, IfcGridPlacement). Cached; cycles stop. */
  placement(id, depth = 0) {
    if (id === null || id === undefined) return I4();
    const hit = this.places.get(id);
    if (hit) return hit;
    if (depth > 64) { this.note('A placement chain loops'); return I4(); }
    const t = this.t(id);
    let m = I4();
    if (t === 'IFCLOCALPLACEMENT') {
      const rel = this.ref(this.a(id, 'PlacementRelTo'));
      const local = this.axis2(this.ref(this.a(id, 'RelativePlacement')));
      m = rel !== null ? mul(this.placement(rel, depth + 1), local) : local;
    } else if (t === 'IFCGRIDPLACEMENT') {
      m = this.gridPlacement(id);
    } else if (t === 'IFCLINEARPLACEMENT' && this.t(this.ref(this.a(id, 'RelativePlacement'))) === 'IFCAXIS2PLACEMENTLINEAR' && linearPlacement(this, this.ref(this.a(id, 'RelativePlacement')))) {
      // a station along an alignment, with its offsets (the alignment curve is in the frame PlacementRelTo gives)
      const rel = this.ref(this.a(id, 'PlacementRelTo'));
      const local = linearPlacement(this, this.ref(this.a(id, 'RelativePlacement')));
      m = rel !== null ? mul(this.placement(rel, depth + 1), local) : local;
    } else if (t && this.s.entity(t)?.index.has('CartesianPosition')) {
      // IFC4X3 linear placements carry their position as a plain placement too
      const cp = this.ref(this.a(id, 'CartesianPosition'));
      const rel = this.ref(this.a(id, 'PlacementRelTo'));
      const local = cp !== null ? this.axis2(cp) : I4();
      m = rel !== null ? mul(this.placement(rel, depth + 1), local) : local;
      if (cp === null) this.note('A linear placement without a Cartesian position is drawn at the origin');
    } else if (t) this.note(this.s.pretty(t) + ' placements are not read yet; drawn at the origin');
    this.places.set(id, m);
    return m;
  }

  /**
   * IfcGridPlacement: the intersection of two grid axes (straight axis curves) offset by IfcVirtualGridIntersection,
   * in the coordinate system of the IfcGrid the axes belong to (its ObjectPlacement; else PlacementRelTo).
   */
  gridPlacement(id) {
    const vgi = this.ref(this.a(id, 'PlacementLocation'));
    if (vgi === null) return I4();
    const axes = this.refs(this.a(vgi, 'IntersectingAxes'));
    const offs = (this.a(vgi, 'OffsetDistances') || []).map((v) => this.num(v, 0));
    if (axes.length < 2) return I4();
    const line = (ax) => {
      const c = this.ref(this.a(ax, 'AxisCurve'));
      const ct = this.t(c);
      let pts = null;
      if (ct === 'IFCPOLYLINE') pts = this.refs(this.a(c, 'Points')).map((p) => this.point(p));
      else if (ct === 'IFCLINE') { const o = this.point(this.ref(this.a(c, 'Pnt'))); const v = this.vector(this.ref(this.a(c, 'Dir'))); pts = [o, [o[0] + v[0], o[1] + v[1], o[2] + v[2]]]; }
      if (!pts || pts.length < 2) return null;
      let d = norm(sub(pts[pts.length - 1], pts[0]));
      if (this.bool(this.a(ax, 'SameSense'), true) === false) d = scale(d, -1);
      return { p: pts[0], d };
    };
    const A = line(axes[0]), B = line(axes[1]);
    if (!A || !B) { this.note('Grid placements on curved axes are drawn at the origin'); return I4(); }
    // offsets move each axis to its left (seen along the axis), the third one up
    const nA = [-A.d[1], A.d[0], 0], nB = [-B.d[1], B.d[0], 0];
    const pA = [A.p[0] + nA[0] * (offs[0] || 0), A.p[1] + nA[1] * (offs[0] || 0)];
    const pB = [B.p[0] + nB[0] * (offs[1] || 0), B.p[1] + nB[1] * (offs[1] || 0)];
    const den = A.d[0] * B.d[1] - A.d[1] * B.d[0];
    if (Math.abs(den) < 1e-12) return I4();
    const tA = ((pB[0] - pA[0]) * B.d[1] - (pB[1] - pA[1]) * B.d[0]) / den;
    const o = [pA[0] + A.d[0] * tA, pA[1] + A.d[1] * tA, offs[2] || 0];
    const refDir = this.ref(this.a(id, 'PlacementRefDirection'));
    let x = A.d;
    if (refDir !== null && this.t(refDir) === 'IFCDIRECTION') x = this.dir(refDir, A.d);
    else if (refDir !== null && this.t(refDir) === 'IFCVIRTUALGRIDINTERSECTION') this.note('Grid placements aimed at another grid point face the first axis');
    x = norm([x[0], x[1], 0]);
    const local = frame(o, x, [-x[1], x[0], 0], [0, 0, 1]);
    // the grid's own placement
    let base = null;
    for (const attr of ['UAxes', 'VAxes', 'WAxes']) {
      const grids = this.f.inverse('IFCGRID', attr).get(axes[0]);
      if (grids && grids.length) { base = this.ref(this.a(grids[0], 'ObjectPlacement')); break; }
    }
    if (base === null) base = this.ref(this.a(id, 'PlacementRelTo'));
    return base !== null && base !== id ? mul(this.placement(base, 1), local) : local;
  }
}

/** GeoCtx.georef, kept outside the class body for reading. */
GeoCtx.prototype.georef = function georef() {
  const f = this.f;
  const op = f.ofType('IFCMAPCONVERSION', true)[0] ?? f.ofType('IFCRIGIDOPERATION', true)[0];
  if (op === undefined) return null;
  const t = this.t(op);
  const crsId = this.ref(this.a(op, 'TargetCRS'));
  const crs = crsId === null ? null : {
    name: this.str(this.a(crsId, 'Name')), description: this.str(this.a(crsId, 'Description')),
    geodeticDatum: this.str(this.a(crsId, 'GeodeticDatum')), verticalDatum: this.str(this.a(crsId, 'VerticalDatum')),
    projection: this.str(this.a(crsId, 'MapProjection')), zone: this.str(this.a(crsId, 'MapZone')),
  };
  if (t === 'IFCRIGIDOPERATION') {
    const e = this.num(this.a(op, 'FirstCoordinate'), 0), n = this.num(this.a(op, 'SecondCoordinate'), 0), h = this.num(this.a(op, 'Height'), 0);
    return { kind: 'rigid', crs, eastings: e, northings: n, height: h, xAxis: [1, 0], rotation: 0, scale: 1, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, e, n, h, 1] };
  }
  const e = this.num(this.a(op, 'Eastings'), 0), n = this.num(this.a(op, 'Northings'), 0), h = this.num(this.a(op, 'OrthogonalHeight'), 0);
  let ax = this.num(this.a(op, 'XAxisAbscissa'), 1), ay = this.num(this.a(op, 'XAxisOrdinate'), 0);
  const l = Math.hypot(ax, ay) || 1; ax /= l; ay /= l;
  const s = this.num(this.a(op, 'Scale'), 1);
  const sy = this.num(this.a(op, 'FactorY'), s), sz = this.num(this.a(op, 'FactorZ'), 1);
  // map = (E, N, H) + R(θ) · S · model, θ from the map's east axis to the model's x axis
  const m = [ax * s, ay * s, 0, 0, -ay * sy, ax * sy, 0, 0, 0, 0, sz, 0, e, n, h, 1];
  return { kind: 'map-conversion', crs, eastings: e, northings: n, height: h, xAxis: [ax, ay], rotation: Math.atan2(ay, ax), scale: s, matrix: m };
};

/** IFC IfcFirstProjAxis: X projected into the plane normal to Z (default (1,0,0), or (0,1,0) when Z is X). */
export function firstProjAxis(z, x) {
  let v = x;
  if (!v) v = Math.abs(z[0]) > 0.999999 && Math.abs(z[1]) < 1e-6 && Math.abs(z[2]) < 1e-6 ? [0, 1, 0] : [1, 0, 0];
  let p = sub(v, scale(z, dot(v, z)));
  let n = norm(p);
  if (!n[0] && !n[1] && !n[2]) n = perp(z);
  return n;
}

const PREFIX = { EXA: 1e18, PETA: 1e15, TERA: 1e12, GIGA: 1e9, MEGA: 1e6, KILO: 1e3, HECTO: 1e2, DECA: 1e1, DECI: 1e-1, CENTI: 1e-2, MILLI: 1e-3, MICRO: 1e-6, NANO: 1e-9, PICO: 1e-12, FEMTO: 1e-15, ATTO: 1e-18 };
