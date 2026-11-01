/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-curve.js — IFC curves as point lists (IFC4 ADD2 TC1 §8.9 Geometry resource): IfcPolyline, IfcIndexedPolyCurve
 * (line and arc segments), IfcCompositeCurve (+ IfcCompositeCurveSegment SameSense), IfcTrimmedCurve (by parameter or
 * by point, SenseAgreement) of IfcLine / IfcCircle / IfcEllipse / any bounded curve, full IfcCircle and IfcEllipse,
 * IfcBSplineCurveWithKnots and IfcRationalBSplineCurveWithKnots (de Boor), IfcOffsetCurve2D (straight offsets),
 * IfcSurfaceCurve / IfcIntersectionCurve / IfcSeamCurve (their Curve3D), and IFC4X3 alignment curves (composites of
 * IfcCurveSegment, IfcGradientCurve, IfcSegmentedReferenceCurve: geo-align.js).
 *
 *   curvePoints(g, id) → [[x, y, z]…]   (2D curves have z = 0; arcs and splines are tessellated)
 *   CIRCLE_SEGMENTS                      segments per full turn of a circle (also used by profiles and solids)
 *
 * Conic trimming parameters are in the project's plane angle unit (g.angleUnit), lines' in length along the vector.
 */

import { apply, sub, norm, len, add, scale, dot } from './geo-math.js';
import { isSegmented, segmentedCurve } from './geo-align.js';

export const CIRCLE_SEGMENTS = 36;

export function arcSegments(sweep, radius = 1) {
  const n = Math.ceil(Math.abs(sweep) / (2 * Math.PI) * CIRCLE_SEGMENTS);
  return Math.max(radius > 0 ? 2 : 1, n);
}

export function curvePoints(g, id, depth = 0) {
  if (id === null || depth > 32) return [];
  const t = g.t(id);
  switch (t) {
    case 'IFCPOLYLINE': return g.refs(g.a(id, 'Points')).map((p) => g.point(p));
    case 'IFCINDEXEDPOLYCURVE': return indexedPolyCurve(g, id);
    case 'IFCCOMPOSITECURVE': case 'IFCCOMPOSITECURVEONSURFACE': case 'IFCOUTERBOUNDARYCURVE': case 'IFCBOUNDARYCURVE':
      // IFC4X3 alignments: composites of placed curve segments (geo-align.js)
      if (isSegmented(g, id)) return segmentedCurve(g, id).pts.map((p) => p.slice());
      return compositeCurve(g, id, depth);
    case 'IFCGRADIENTCURVE': case 'IFCSEGMENTEDREFERENCECURVE': return segmentedCurve(g, id).pts.map((p) => p.slice());
    case 'IFCTRIMMEDCURVE': return trimmedCurve(g, id, depth);
    case 'IFCCIRCLE': case 'IFCELLIPSE': return conic(g, id, 0, 2 * Math.PI, true);
    case 'IFCBSPLINECURVEWITHKNOTS': case 'IFCRATIONALBSPLINECURVEWITHKNOTS': return bspline(g, id);
    case 'IFCOFFSETCURVE2D': return offsetCurve2D(g, id, depth);
    // curves on surfaces carry their 3D form (IFC4 §8.9.3.71 IfcSurfaceCurve): draw that one
    case 'IFCSURFACECURVE': case 'IFCINTERSECTIONCURVE': case 'IFCSEAMCURVE': return curvePoints(g, g.ref(g.a(id, 'Curve3D')), depth + 1);
    case 'IFCLINE': g.note('An unbounded line is used as a curve; drawn one unit long'); return [linePoint(g, id, 0), linePoint(g, id, 1)];
    default:
      if (t) g.note(g.s.pretty(t) + ' curves are not drawn yet');
      return [];
  }
}

/** Points of an IfcCartesianPointList2D/3D (1-based indexes in the segments). */
function pointList(g, id) {
  const c = g.a(id, 'CoordList');
  if (!Array.isArray(c)) return [];
  return c.map((p) => [g.num(p[0], 0), g.num(p[1], 0), g.num(p[2], 0)]);
}

function indexedPolyCurve(g, id) {
  const pts = pointList(g, g.ref(g.a(id, 'Points')));
  const segs = g.a(id, 'Segments');
  if (!Array.isArray(segs) || !segs.length) return pts.slice();
  const out = [];
  const push = (p) => { const l = out[out.length - 1]; if (!l || l[0] !== p[0] || l[1] !== p[1] || l[2] !== p[2]) out.push(p); };
  for (const s of segs) {
    const kind = s && s.typed;
    const ix = (Array.isArray(s?.value) ? s.value : []).map((v) => g.num(v, 1) - 1);
    if (kind === 'IFCARCINDEX' && ix.length === 3) {
      for (const p of arc3(pts[ix[0]], pts[ix[1]], pts[ix[2]])) push(p);
    } else for (const k of ix) if (pts[k]) push(pts[k]);
  }
  return out;
}

/** The circular arc through three points (start, middle, end), tessellated; straight when they are collinear. */
export function arc3(a, b, c) {
  if (!a || !b || !c) return [a, b, c].filter(Boolean);
  // circle centre in the plane of the three points
  const ab = sub(b, a), ac = sub(c, a);
  const n = [ab[1] * ac[2] - ab[2] * ac[1], ab[2] * ac[0] - ab[0] * ac[2], ab[0] * ac[1] - ab[1] * ac[0]];
  const nn = dot(n, n);
  if (nn < 1e-18 * Math.max(1, dot(ab, ab) * dot(ac, ac))) return [a, c];
  const t1 = scale([ac[1] * n[2] - ac[2] * n[1], ac[2] * n[0] - ac[0] * n[2], ac[0] * n[1] - ac[1] * n[0]], dot(ab, ab));
  const t2 = scale([n[1] * ab[2] - n[2] * ab[1], n[2] * ab[0] - n[0] * ab[2], n[0] * ab[1] - n[1] * ab[0]], dot(ac, ac));
  const ctr = add(a, scale(add(t1, t2), 1 / (2 * nn)));
  const r = len(sub(a, ctr));
  const u = norm(sub(a, ctr)), w = norm(n), v = [w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]];
  const ang = (p) => { const d = sub(p, ctr); return Math.atan2(dot(d, v), dot(d, u)); };
  let tb = ang(b), tc = ang(c);
  if (tb < 0) tb += 2 * Math.PI;
  if (tc < 0) tc += 2 * Math.PI;
  const sweep = tc;   // counter-clockwise about n from a to c passes b by construction of n
  const segs = arcSegments(sweep, r);
  const out = [a];
  for (let i = 1; i < segs; i++) {
    const th = sweep * i / segs;
    out.push(add(ctr, add(scale(u, r * Math.cos(th)), scale(v, r * Math.sin(th)))));
  }
  out.push(c);
  return out;
}

function compositeCurve(g, id, depth) {
  const out = [];
  for (const seg of g.refs(g.a(id, 'Segments'))) {
    const st = g.t(seg);
    let pts, same = true;
    if (st === 'IFCCOMPOSITECURVESEGMENT' || st === 'IFCREPARAMETRISEDCOMPOSITECURVESEGMENT') {
      pts = curvePoints(g, g.ref(g.a(seg, 'ParentCurve')), depth + 1);
      same = g.bool(g.a(seg, 'SameSense'), true);
    } else if (st === 'IFCCURVESEGMENT') {
      g.note('Alignment curve segments are drawn as straight lines');
      pts = curvePoints(g, g.ref(g.a(seg, 'ParentCurve')), depth + 1);
    } else pts = curvePoints(g, seg, depth + 1);
    if (!same) pts = pts.slice().reverse();
    for (const p of pts) {
      const l = out[out.length - 1];
      if (l && Math.abs(l[0] - p[0]) < 1e-9 && Math.abs(l[1] - p[1]) < 1e-9 && Math.abs(l[2] - p[2]) < 1e-9) continue;
      out.push(p);
    }
  }
  return out;
}

function linePoint(g, id, t) {
  const p = g.point(g.ref(g.a(id, 'Pnt')));
  const d = g.vector(g.ref(g.a(id, 'Dir')));
  return add(p, scale(d, t));
}

/** A conic between parameters a0 and a1 (radians), counter-clockwise; `full` closes it without repeating the start. */
function conic(g, id, a0, a1, full = false) {
  const t = g.t(id);
  const m = g.axis2(g.ref(g.a(id, 'Position')));
  const r1 = g.num(g.a(id, t === 'IFCCIRCLE' ? 'Radius' : 'SemiAxis1'), 0);
  const r2 = t === 'IFCCIRCLE' ? r1 : g.num(g.a(id, 'SemiAxis2'), 0);
  const sweep = a1 - a0;
  const n = arcSegments(sweep, Math.max(r1, r2));
  const out = [];
  const last = full ? n - 1 : n;
  for (let i = 0; i <= last; i++) {
    const th = a0 + sweep * i / n;
    out.push(apply(m, r1 * Math.cos(th), r2 * Math.sin(th), 0));
  }
  return out;
}

/** Parameter of a point on a curve (conic → radians, line → length along the vector). */
function paramOf(g, curve, p) {
  const t = g.t(curve);
  if (t === 'IFCCIRCLE' || t === 'IFCELLIPSE') {
    const m = g.axis2(g.ref(g.a(curve, 'Position')));
    const d = sub(p, [m[12], m[13], m[14]]);
    const r1 = g.num(g.a(curve, t === 'IFCCIRCLE' ? 'Radius' : 'SemiAxis1'), 1) || 1;
    const r2 = t === 'IFCCIRCLE' ? r1 : g.num(g.a(curve, 'SemiAxis2'), 1) || 1;
    return Math.atan2(dot(d, [m[4], m[5], m[6]]) / r2, dot(d, [m[0], m[1], m[2]]) / r1);
  }
  if (t === 'IFCLINE') {
    const o = g.point(g.ref(g.a(curve, 'Pnt')));
    const v = g.vector(g.ref(g.a(curve, 'Dir')));
    const l2 = dot(v, v) || 1;
    return dot(sub(p, o), v) / l2;
  }
  return null;
}

function trimmedCurve(g, id, depth) {
  const basis = g.ref(g.a(id, 'BasisCurve'));
  const bt = g.t(basis);
  const sense = g.bool(g.a(id, 'SenseAgreement'), true);
  const master = g.enm(g.a(id, 'MasterRepresentation'));
  const pick = (trim) => {
    const list = Array.isArray(trim) ? trim : [trim];
    let par = null, pt = null;
    for (const v of list) {
      if (v && typeof v === 'object' && v.typed === 'IFCPARAMETERVALUE') par = g.num(v.value);
      else if (typeof v === 'number') par = v;
      else if (v && v.ref !== undefined && g.t(v.ref) === 'IFCCARTESIANPOINT') pt = g.point(v.ref);
    }
    if (master === 'CARTESIAN' && pt) return { pt };
    if (par !== null) return { par };
    return pt ? { pt } : {};
  };
  const t1 = pick(g.a(id, 'Trim1')), t2 = pick(g.a(id, 'Trim2'));
  if (bt === 'IFCCIRCLE' || bt === 'IFCELLIPSE') {
    const ang = (tr) => (tr.par !== undefined ? tr.par * g.angleUnit : tr.pt ? paramOf(g, basis, tr.pt) : 0);
    let a0 = ang(t1), a1 = ang(t2);
    if (sense) { while (a1 <= a0 + 1e-12) a1 += 2 * Math.PI; return conic(g, basis, a0, a1); }
    while (a1 >= a0 - 1e-12) a1 -= 2 * Math.PI;
    return conic(g, basis, a0, a1);
  }
  if (bt === 'IFCLINE') {
    const p = (tr) => (tr.pt ? tr.pt : linePoint(g, basis, tr.par ?? 0));
    const a = p(t1), b = p(t2);
    return sense ? [a, b] : [b, a];
  }
  // another bounded curve: cut its points at the trimming points (parameters along it are not defined here)
  let pts = curvePoints(g, basis, depth + 1);
  if (t1.pt && t2.pt && pts.length > 1) {
    const near = (q) => { let best = 0, bd = Infinity; pts.forEach((p, k) => { const d = len(sub(p, q)); if (d < bd) { bd = d; best = k; } }); return best; };
    let i = near(t1.pt), j = near(t2.pt);
    pts = i <= j ? pts.slice(i, j + 1) : pts.slice(j, i + 1).reverse();
    pts[0] = t1.pt; pts[pts.length - 1] = t2.pt;
  } else if (pts.length) g.note('A trimmed ' + (g.s.pretty(bt) || 'curve') + ' is drawn untrimmed');
  return sense ? pts : pts.slice().reverse();
}

/** IfcBSplineCurveWithKnots (rational too): de Boor at evenly spaced parameters per knot span. */
function bspline(g, id) {
  const p = g.num(g.a(id, 'Degree'), 1);
  const ctrl = g.refs(g.a(id, 'ControlPointsList')).map((c) => g.point(c));
  const mult = (g.a(id, 'KnotMultiplicities') || []).map((v) => g.num(v, 1));
  const kv = (g.a(id, 'Knots') || []).map((v) => g.num(v, 0));
  const w = g.t(id) === 'IFCRATIONALBSPLINECURVEWITHKNOTS' ? (g.a(id, 'WeightsData') || []).map((v) => g.num(v, 1)) : null;
  const knots = [];
  kv.forEach((k, i) => { for (let r = 0; r < (mult[i] || 1); r++) knots.push(k); });
  return sampleBSpline(p, ctrl, knots, w);
}

export function sampleBSpline(p, ctrl, knots, w = null, perSpan = 12) {
  const n = ctrl.length;
  if (n < 2 || knots.length !== n + p + 1) return ctrl.slice();
  // degree 1 is the polyline through its control points (weights do not bend it)
  if (p === 1) return ctrl.map((c) => c.slice());
  // control points in order along one straight line: the curve is that segment (as its neighbours' plain lines draw it)
  {
    const a = ctrl[0], b = ctrl[n - 1], d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const L = Math.hypot(d[0], d[1], d[2]);
    if (L > 0) {
      let straight = true, last = -1e-12;
      for (const c of ctrl) {
        const t = ((c[0] - a[0]) * d[0] + (c[1] - a[1]) * d[1] + (c[2] - a[2]) * d[2]) / (L * L);
        const off = Math.hypot(c[0] - a[0] - d[0] * t, c[1] - a[1] - d[1] * t, c[2] - a[2] - d[2] * t);
        if (off > L * 1e-9 || t < last - 1e-12) { straight = false; break; }
        last = t;
      }
      if (straight) return [a.slice(), b.slice()];
    }
  }
  const H = ctrl.map((c, i) => { const wi = w ? w[i] ?? 1 : 1; return [c[0] * wi, c[1] * wi, c[2] * wi, wi]; });
  const lo = knots[p], hi = knots[n];
  const out = [];
  const evalAt = (u) => {
    let k = p;
    while (k < n - 1 && u >= knots[k + 1]) k++;
    const d = [];
    for (let j = 0; j <= p; j++) d.push(H[k - p + j].slice());
    for (let r = 1; r <= p; r++) {
      for (let j = p; j >= r; j--) {
        const i = k - p + j;
        const den = knots[i + p + 1 - r] - knots[i];
        const a = den ? (u - knots[i]) / den : 0;
        for (let c = 0; c < 4; c++) d[j][c] = (1 - a) * d[j - 1][c] + a * d[j][c];
      }
    }
    const h = d[p];
    return [h[0] / h[3], h[1] / h[3], h[2] / h[3]];
  };
  const spans = [];
  for (let k = p; k < n; k++) if (knots[k + 1] > knots[k]) spans.push([knots[k], knots[k + 1]]);
  for (const [a, b] of spans) for (let s = 0; s < perSpan; s++) out.push(evalAt(a + (b - a) * s / perSpan));
  out.push(evalAt(hi - (hi - lo) * 1e-12));
  out[out.length - 1] = H[n - 1][3] ? [H[n - 1][0] / H[n - 1][3], H[n - 1][1] / H[n - 1][3], H[n - 1][2] / H[n - 1][3]] : out[out.length - 1];
  return out;
}

function offsetCurve2D(g, id, depth) {
  const pts = curvePoints(g, g.ref(g.a(id, 'BasisCurve')), depth + 1);
  const d = g.num(g.a(id, 'Distance'), 0);
  return offsetPolyline(pts, d);
}

/** Offset of a 2D polyline to the left by d (mitred corners). */
export function offsetPolyline(pts, d) {
  if (pts.length < 2 || !d) return pts.slice();
  const out = [];
  const nrm = (a, b) => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };
  for (let i = 0; i < pts.length; i++) {
    const n0 = i > 0 ? nrm(pts[i - 1], pts[i]) : null, n1 = i < pts.length - 1 ? nrm(pts[i], pts[i + 1]) : null;
    let n = n0 && n1 ? [n0[0] + n1[0], n0[1] + n1[1]] : n0 || n1;
    const l = Math.hypot(n[0], n[1]) || 1;
    n = [n[0] / l, n[1] / l];
    const c = n0 && n1 ? Math.max(0.2, n[0] * n1[0] + n[1] * n1[1]) : 1;
    out.push([pts[i][0] + n[0] * d / c, pts[i][1] + n[1] * d / c, pts[i][2] || 0]);
  }
  return out;
}
