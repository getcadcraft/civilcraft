/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-align.js — IFC4X3 alignment geometry (IFC4.3 ADD2 §8.9 Geometry resource: IfcCurveSegment, IfcGradientCurve,
 * IfcSegmentedReferenceCurve, IfcClothoid, IfcPolynomialCurve; §8.9 IfcAxis2PlacementLinear, IfcPointByDistanceExpression;
 * §8.8 IfcSectionedSolidHorizontal).
 *
 * A curve segment takes the part of its ParentCurve from SegmentStart for SegmentLength (lengths along the curve; a
 * negative length runs backwards) and places it so the parent's point at SegmentStart is at the segment's Placement,
 * running along its x axis. Parent curves: IfcLine, IfcCircle, IfcClothoid (heading s²/2A², integrated numerically),
 * IfcPolynomialCurve; other spirals are drawn as their chord (noted).
 *
 *   segmentedCurve(g, id) → { pts: [[x, y, z]…], dist: [horizontal distance along it…] }   IfcCompositeCurve of curve
 *                           segments, IfcGradientCurve (horizontal base + vertical profile), IfcSegmentedReferenceCurve
 *   pointAlong(g, curveId, distance) → { p, t }   a station on a curve (position, unit tangent)
 *   linearPlacement(g, axis2LinearId) → matrix    IfcAxis2PlacementLinear (IfcPointByDistanceExpression + offsets)
 *   sectionedSolid(g, id) → Mesh                  IfcSectionedSolidHorizontal
 */

import { Mesh } from './geo-mesh.js';
import { profileShapes } from './geo-profile.js';
import { curvePoints } from './geo-curve.js';
import { apply, sub, add, scale, dot, cross, norm, len, frame, mul, invert } from './geo-math.js';

const cache = new WeakMap();   // GeoCtx → Map(curve id → sampled curve)

/** Is this composite made of IFC4X3 curve segments? */
export function isSegmented(g, id) {
  const t = g.t(id);
  if (t === 'IFCGRADIENTCURVE' || t === 'IFCSEGMENTEDREFERENCECURVE') return true;
  if (t !== 'IFCCOMPOSITECURVE') return false;
  const segs = g.refs(g.a(id, 'Segments'));
  return segs.length > 0 && g.t(segs[0]) === 'IFCCURVESEGMENT';
}

function measure(g, v) { return g.num(v, 0); }

/** A parent curve in its own coordinates: p(s) for s along it (length measure), 2D or 3D. */
function parentCurve(g, id) {
  const t = g.t(id);
  if (t === 'IFCLINE') {
    const o = g.point(g.ref(g.a(id, 'Pnt')));
    const d = norm(g.vector(g.ref(g.a(id, 'Dir'))));
    return (s) => add(o, scale(d, s));
  }
  if (t === 'IFCCIRCLE') {
    const M = g.axis2(g.ref(g.a(id, 'Position')));
    const r = g.num(g.a(id, 'Radius'), 1) || 1;
    return (s) => apply(M, r * Math.cos(s / r), r * Math.sin(s / r), 0);
  }
  if (t === 'IFCCLOTHOID') {
    const M = g.axis2(g.ref(g.a(id, 'Position')));
    const A = g.num(g.a(id, 'ClothoidConstant'), 1) || 1;
    // heading θ(s) = sign(A) s² / (2A²); x = ∫cos θ, y = ∫sin θ (Simpson's rule, fine steps)
    const k = Math.sign(A) / (2 * A * A);
    return (s) => {
      const n = Math.max(8, Math.min(2000, Math.ceil(Math.abs(s) / 0.5)) * 2);
      const h = s / n;
      let x = 0, y = 0;
      for (let i = 0; i <= n; i++) {
        const w = i === 0 || i === n ? 1 : i % 2 ? 4 : 2;
        const u = i * h, th = k * u * u;
        x += w * Math.cos(th); y += w * Math.sin(th);
      }
      return apply(M, x * h / 3, y * h / 3, 0);
    };
  }
  if (t === 'IFCPOLYNOMIALCURVE') {
    const M = g.axis2(g.ref(g.a(id, 'Position')));
    const cx = (g.a(id, 'CoefficientsX') || []).map((v) => g.num(v, 0));
    const cy = (g.a(id, 'CoefficientsY') || []).map((v) => g.num(v, 0));
    const cz = (g.a(id, 'CoefficientsZ') || []).map((v) => g.num(v, 0));
    const poly = (c, u) => c.reduce((acc, a, i) => acc + a * u ** i, 0);
    return (u) => apply(M, poly(cx, u), poly(cy, u), poly(cz, u));
  }
  if (t) g.note(g.s.pretty(t) + ' alignment segments are drawn as straight lines');
  return null;
}

/** Points of one IfcCurveSegment, placed: the parent's point at SegmentStart lands on Placement, heading along its x. */
function segmentPoints(g, seg) {
  const start = measure(g, g.a(seg, 'SegmentStart')), length = measure(g, g.a(seg, 'SegmentLength'));
  const P = g.axis2(g.ref(g.a(seg, 'Placement')));
  if (!length) return [];
  const f = parentCurve(g, g.ref(g.a(seg, 'ParentCurve')));
  const n = Math.max(2, Math.min(400, Math.ceil(Math.abs(length) / 2)));
  if (!f) return [apply(P, 0, 0, 0), apply(P, Math.abs(length), 0, 0)];
  const sgn = Math.sign(length);
  const p0 = f(start);
  const e = Math.max(1e-6, Math.abs(length) * 1e-6);
  let tx = norm(scale(sub(f(start + sgn * e), p0), 1));
  if (!len(tx)) tx = [1, 0, 0];
  // the parent's frame at the start (x along the way it is run, y to its left in its plane)
  const z = [0, 0, 1];
  let y = norm(cross(z, tx));
  if (!len(y)) y = [0, 1, 0];
  const F0 = frame(p0, tx, y, cross(tx, y));
  const T = mul(P, invert(F0) || F0);
  const out = [];
  for (let i = 0; i <= n; i++) out.push(apply(T, ...f(start + length * i / n)));
  return out;
}

function horizontalOf(g, id) {
  const pts = [];
  for (const seg of g.refs(g.a(id, 'Segments'))) {
    const s = g.t(seg) === 'IFCCURVESEGMENT' ? segmentPoints(g, seg) : curvePoints(g, seg);
    for (const p of s) { const l = pts[pts.length - 1]; if (!l || len(sub(l, p)) > 1e-9) pts.push([p[0], p[1], p[2] || 0]); }
  }
  return pts;
}

function stations(pts) {
  const d = [0];
  for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return d;
}

/** Sampled alignment curve with the horizontal distance of each point. */
export function segmentedCurve(g, id) {
  let c = cache.get(g);
  if (!c) cache.set(g, (c = new Map()));
  if (c.has(id)) return c.get(id);
  const t = g.t(id);
  let out;
  if (t === 'IFCGRADIENTCURVE' || t === 'IFCSEGMENTEDREFERENCECURVE') {
    const base = t === 'IFCSEGMENTEDREFERENCECURVE' ? segmentedCurve(g, g.ref(g.a(id, 'BaseCurve'))) : (() => { const h = horizontalOf(g, g.ref(g.a(id, 'BaseCurve'))); return { pts: h, dist: stations(h) }; })();
    if (t === 'IFCSEGMENTEDREFERENCECURVE') { g.note('Cant (superelevation) is not applied yet'); out = base; }
    else {
      // vertical profile: points (distance along, height)
      const prof = horizontalOf(g, id).map((p) => [p[0], p[1]]).sort((a, b) => a[0] - b[0]);
      const zAt = (d) => {
        if (!prof.length) return 0;
        if (d <= prof[0][0]) return prof[0][1];
        let lo = 0, hi = prof.length - 1;
        if (d >= prof[hi][0]) return prof[hi][1];
        while (hi - lo > 1) { const m = (lo + hi) >> 1; if (prof[m][0] <= d) lo = m; else hi = m; }
        const f = (d - prof[lo][0]) / ((prof[hi][0] - prof[lo][0]) || 1);
        return prof[lo][1] + (prof[hi][1] - prof[lo][1]) * f;
      };
      out = { pts: base.pts.map((p, i) => [p[0], p[1], zAt(base.dist[i])]), dist: base.dist };
    }
  } else {
    const h = horizontalOf(g, id);
    out = { pts: h, dist: stations(h) };
  }
  c.set(id, out);
  return out;
}

/** The point and unit tangent at a horizontal distance along a curve (alignment curves; others by arc length). */
export function pointAlong(g, id, d) {
  const C = isSegmented(g, id) ? segmentedCurve(g, id) : (() => { const p = curvePoints(g, id); return { pts: p, dist: stations(p) }; })();
  const { pts, dist } = C;
  if (pts.length < 2) return { p: pts[0] || [0, 0, 0], t: [1, 0, 0] };
  let i = 1;
  while (i < pts.length - 1 && dist[i] < d) i++;
  const f = (d - dist[i - 1]) / ((dist[i] - dist[i - 1]) || 1);
  const p = add(pts[i - 1], scale(sub(pts[i], pts[i - 1]), f));
  return { p, t: norm(sub(pts[i], pts[i - 1])) };
}

/** IfcAxis2PlacementLinear → matrix: the station's point plus offsets, x along the curve (level), z up (or as given). */
export function linearPlacement(g, id) {
  const loc = g.ref(g.a(id, 'Location'));
  if (g.t(loc) !== 'IFCPOINTBYDISTANCEEXPRESSION') return null;
  const basis = g.ref(g.a(loc, 'BasisCurve'));
  const d = g.num(g.a(loc, 'DistanceAlong'), 0);
  const { p, t } = pointAlong(g, basis, d);
  const th = norm([t[0], t[1], 0]);
  const left = [-th[1], th[0], 0];
  const o = add(add(add(p, scale(left, g.num(g.a(loc, 'OffsetLateral'), 0))), [0, 0, g.num(g.a(loc, 'OffsetVertical'), 0)]), scale(th, g.num(g.a(loc, 'OffsetLongitudinal'), 0)));
  const zAxis = g.dir(g.ref(g.a(id, 'Axis')), [0, 0, 1]);
  const ref = g.dir(g.ref(g.a(id, 'RefDirection')), null);
  let x = ref || th;
  x = norm(sub(x, scale(zAxis, dot(x, zAxis))));
  if (!len(x)) x = th;
  return frame(o, x, cross(zAxis, x), zAxis);
}

/** IfcSectionedSolidHorizontal: the cross sections placed across the directrix at their stations, lofted between. */
export function sectionedSolid(g, id) {
  const dir = g.ref(g.a(id, 'Directrix'));
  const profs = g.refs(g.a(id, 'CrossSections')).map((p) => profileShapes(g, p)[0]).filter(Boolean);
  const pos = g.refs(g.a(id, 'CrossSectionPositions'));
  const m = new Mesh();
  if (profs.length < 2 || pos.length !== profs.length) { g.note('A sectioned solid without matching sections is not drawn'); return m; }
  const st = pos.map((q) => g.num(g.a(g.ref(g.a(q, 'Location')), 'DistanceAlong'), 0));
  const C = segmentedCurve(g, dir);
  // the frame at a station: x to the left (level), y up, z along the alignment
  const at = (d) => {
    const { p, t } = pointAlong(g, dir, d);
    const th = norm([t[0], t[1], 0]);
    return { o: p, x: [-th[1], th[0], 0], y: [0, 0, 1] };
  };
  const rings = [];
  for (let k = 0; k + 1 < profs.length; k++) {
    const A = profs[k].outer, B = profs[k + 1].outer;
    if (A.length !== B.length) { g.note('Sections with different numbers of points are lofted from the first one'); }
    const d0 = st[k], d1 = st[k + 1];
    const between = C.dist.filter((d) => d > d0 && d < d1);
    const ds = [d0, ...between, d1];
    for (const d of ds) {
      if (rings.length && rings[rings.length - 1].d === d) continue;
      const f = d1 > d0 ? (d - d0) / (d1 - d0) : 0;
      const F = at(d);
      const ring = A.map((a, i) => { const b = B[i] || a; const x = a[0] + (b[0] - a[0]) * f, y = a[1] + (b[1] - a[1]) * f; return add(F.o, add(scale(F.x, x), scale(F.y, y))); });
      rings.push(Object.assign(ring, { d }));
    }
  }
  if (rings.length < 2) return m;
  const n = rings[0].length;
  for (let k = 0; k + 1 < rings.length; k++) {
    const A = rings[k], B = rings[k + 1];
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; m.polygon([[A[i], A[j], B[j], B[i]]]); }
  }
  m.polygon([rings[0].slice().reverse()]);
  m.polygon([rings[rings.length - 1].slice()]);
  if (m.volume() < 0) m.flip();
  return m;
}

/** A matrix's inverse or itself (kept for callers that need the frame back). */
export const inverseOr = (M) => invert(M) || M;
