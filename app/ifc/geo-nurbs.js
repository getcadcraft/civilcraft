/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-nurbs.js — faces on curved surfaces (0.4 I.8): IfcAdvancedBrep (+ WithVoids), and IfcAdvancedFace / IfcFaceSurface
 * wherever they appear (shells, surface models). Written from IFC4 ADD2 TC1 §8.9 (surfaces), §8.19 (topology) and the
 * B-spline definitions there (de Boor evaluation, knot multiplicities, rational weights).
 *
 * Surfaces: IfcPlane, IfcCylindricalSurface, IfcConicalSurface, IfcSphericalSurface, IfcToroidalSurface,
 * IfcSurfaceOfLinearExtrusion, IfcSurfaceOfRevolution, IfcBSplineSurfaceWithKnots, IfcRationalBSplineSurfaceWithKnots,
 * IfcRectangularTrimmedSurface (its basis surface), IfcCurveBoundedPlane (its plane).
 *
 * A face is tessellated in its surface's parameter space: the boundary loops (edge curves sampled) are mapped to (u, v)
 * (closed forms for the analytic surfaces; a grid search + Newton for B-splines; periodic directions unwrapped along each
 * loop), interior points are added on a grid (density from the surface's curvature), the points are triangulated
 * (Bowyer–Watson Delaunay in a metric-scaled (u, v)), triangles outside the loops are dropped, and the inside is evaluated
 * on the surface; boundary points keep their exact 3D positions so neighbouring faces meet. Triangles face the way the face
 * does (the surface normal, reversed when SameSense is false).
 *
 *   advancedBrep(g, id) → Mesh
 *   surfaceFace(g, faceId, mesh) → true when the face was drawn (false: not a curved face it knows)
 *   surfaceOf(g, surfaceId) → { kind, at(u, v), inv(p, hint), period: [pu, pv] } | null
 *   edgeLoopPoints(g, loopId)   an IfcEdgeLoop as points (edge curves tessellated)
 */

import { Mesh } from './geo-mesh.js';
import { curvePoints, arcSegments, CIRCLE_SEGMENTS } from './geo-curve.js';
import { profileShapes } from './geo-profile.js';
import { apply, sub, add, scale, dot, cross, norm, len, newell, rotation } from './geo-math.js';
import { planeTriangulate } from './geo-tri.js';

export function advancedBrep(g, id) {
  const m = new Mesh();
  const shells = [g.ref(g.a(id, 'Outer')), ...g.refs(g.a(id, 'Voids'))];
  for (const sh of shells) for (const f of g.refs(g.a(sh, 'CfsFaces'))) {
    if (!surfaceFace(g, f, m)) planarFace(g, f, m);
  }
  return m;
}

// ---- loops ----

const vertexPoint = (g, v) => g.point(g.ref(g.a(v, 'VertexGeometry')));

/**
 * IfcEdgeLoop → points: each oriented edge from its start vertex, through its curve (when it has one) to its end. Edges are
 * then chained by their ends: an edge that does not continue from the previous one but would reversed is reversed (some
 * exporters set IfcOrientedEdge.Orientation the wrong way round; the loop's points are what matter).
 */
export function edgeLoopPoints(g, loop) { return flatten(edgeLoopRuns(g, loop)); }

/** The loop's edges as point runs, chained; `ring[k]` is true for an edge that closes on itself (a full circle). */
export function edgeLoopRuns(g, loop) {
  const runs = [], ring = [];
  for (const oe of g.refs(g.a(loop, 'EdgeList'))) {
    let e = oe, forward = true;
    if (g.t(oe) === 'IFCORIENTEDEDGE') { e = g.ref(g.a(oe, 'EdgeElement')); forward = g.bool(g.a(oe, 'Orientation'), true); }
    const s = vertexPoint(g, g.ref(g.a(e, 'EdgeStart'))), en = vertexPoint(g, g.ref(g.a(e, 'EdgeEnd')));
    let pts = [s, en];
    if (g.t(e) === 'IFCEDGECURVE') {
      const c = g.ref(g.a(e, 'EdgeGeometry'));
      const ct = g.t(c);
      if (ct && ct !== 'IFCLINE') {
        let cp = curvePoints(g, c);
        if (g.bool(g.a(e, 'SameSense'), true) === false) cp = cp.slice().reverse();
        if (cp.length >= 2) {
          if (ct === 'IFCCIRCLE' || ct === 'IFCELLIPSE') cp = arcBetween(cp, s, en);
          else if (len(sub(cp[0], s)) > len(sub(cp[cp.length - 1], s))) cp.reverse();
          pts = [s, ...cp.slice(1, -1), en];
        }
      }
    }
    runs.push(forward ? pts : pts.reverse());
    ring.push(len(sub(s, en)) < 1e-9);
  }
  // chain: each run continues from the previous one's end
  if (runs.length > 1) {
    const d = (p, q) => len(sub(p, q));
    const first = runs[0], second = runs[1];
    const touch = (p) => Math.min(d(p, second[0]), d(p, second[second.length - 1]));
    if (touch(first[0]) < touch(first[first.length - 1])) runs[0] = first.slice().reverse();
    for (let k = 1; k < runs.length; k++) {
      const last = runs[k - 1][runs[k - 1].length - 1], r = runs[k];
      if (d(last, r[r.length - 1]) < d(last, r[0])) runs[k] = r.slice().reverse();
    }
  }
  return { runs, ring };
}

function flatten({ runs }) {
  const out = [];
  for (const pts of runs) for (const p of pts) { const l = out[out.length - 1]; if (!l || len(sub(l, p)) > 1e-12) out.push(p); }
  if (out.length > 1 && len(sub(out[0], out[out.length - 1])) < 1e-12) out.pop();
  return out;
}

/** The run of a closed sample loop from the sample nearest a to the one nearest b (going forward). */
function arcBetween(cp, a, b) {
  const ring = len(sub(cp[0], cp[cp.length - 1])) < 1e-9 ? cp.slice(0, -1) : cp;
  const near = (q) => { let k = 0, d = Infinity; ring.forEach((p, i) => { const x = len(sub(p, q)); if (x < d) { d = x; k = i; } }); return k; };
  const i = near(a), j = near(b);
  const out = [];
  if (i === j) { for (let k = 0; k <= ring.length; k++) out.push(ring[(i + k) % ring.length]); return out; }
  for (let k = i; ; k = (k + 1) % ring.length) { out.push(ring[k]); if (k === j) break; }
  return out;
}

function faceLoops(g, f) {
  let outer = null;
  const holes = [];
  for (const b of g.refs(g.a(f, 'Bounds'))) {
    const loop = g.ref(g.a(b, 'Bound'));
    const lt = g.t(loop);
    const runs = lt === 'IFCEDGELOOP' ? edgeLoopRuns(g, loop) : null;
    let pts = lt === 'IFCPOLYLOOP' ? g.refs(g.a(loop, 'Polygon')).map((p) => g.point(p)) : runs ? flatten(runs) : [];
    if (pts.length < 2) continue;
    const rev = g.bool(g.a(b, 'Orientation'), true) === false;
    if (rev) pts = pts.reverse();
    pts.runs = runs; pts.rev = rev;
    if (g.t(b) === 'IFCFACEOUTERBOUND' && !outer) outer = pts; else holes.push(pts);
  }
  return { outer, holes };
}

/** A face drawn as a flat polygon from its loops (planes, and the fallback for surfaces it does not know). */
function planarFace(g, f, m) {
  let { outer, holes } = faceLoops(g, f);
  holes = holes.filter((h) => h.length >= 3);
  if (!outer || outer.length < 3) { if (!holes.length) return; outer = holes.shift(); }
  if (g.bool(g.a(f, 'SameSense'), true) === false) { outer = outer.slice().reverse(); holes = holes.map((h) => h.slice().reverse()); }
  m.polygon([outer, ...holes]);
}

// ---- surfaces ----

const TAU = 2 * Math.PI;

export function surfaceOf(g, sid, depth = 0) {
  const t = g.t(sid);
  if (!t || depth > 4) return null;
  if (t === 'IFCRECTANGULARTRIMMEDSURFACE') return surfaceOf(g, g.ref(g.a(sid, 'BasisSurface')), depth + 1);
  if (t === 'IFCCURVEBOUNDEDPLANE' || t === 'IFCCURVEBOUNDEDSURFACE') return surfaceOf(g, g.ref(g.a(sid, 'BasisSurface')), depth + 1);
  const P = () => g.axis2(g.ref(g.a(sid, 'Position')));
  const frameOf = (M) => ({ o: [M[12], M[13], M[14]], x: [M[0], M[1], M[2]], y: [M[4], M[5], M[6]], z: [M[8], M[9], M[10]] });
  const n = (k, d = 0) => g.num(g.a(sid, k), d);
  if (t === 'IFCPLANE') {
    const F = frameOf(P());
    return { kind: 'plane', F, at: (u, v) => add(F.o, add(scale(F.x, u), scale(F.y, v))), inv: (p) => [dot(sub(p, F.o), F.x), dot(sub(p, F.o), F.y)], period: [0, 0], normal: () => F.z };
  }
  if (t === 'IFCCYLINDRICALSURFACE' || t === 'IFCCONICALSURFACE') {
    const F = frameOf(P()), r = n('Radius'), k = t === 'IFCCONICALSURFACE' ? Math.tan(n('SemiAngle') * g.angleUnit) : 0;
    const at = (u, v) => { const rr = r + v * k; return add(F.o, add(add(scale(F.x, rr * Math.cos(u)), scale(F.y, rr * Math.sin(u))), scale(F.z, v))); };
    const inv = (p) => { const d = sub(p, F.o); return [Math.atan2(dot(d, F.y), dot(d, F.x)), dot(d, F.z)]; };
    return { kind: 'cylinder', at, inv, period: [TAU, 0], curv: [1 / Math.max(r, 1e-9), 0], scaleUV: [r, 1] };
  }
  if (t === 'IFCSPHERICALSURFACE') {
    const F = frameOf(P()), r = n('Radius');
    const at = (u, v) => add(F.o, add(add(scale(F.x, r * Math.cos(v) * Math.cos(u)), scale(F.y, r * Math.cos(v) * Math.sin(u))), scale(F.z, r * Math.sin(v))));
    const inv = (p) => { const d = sub(p, F.o); return [Math.atan2(dot(d, F.y), dot(d, F.x)), Math.asin(Math.max(-1, Math.min(1, dot(d, F.z) / (r || 1))))]; };
    return { kind: 'sphere', at, inv, period: [TAU, 0], curv: [1 / r, 1 / r], scaleUV: [r, r] };
  }
  if (t === 'IFCTOROIDALSURFACE') {
    const F = frameOf(P()), R = n('MajorRadius'), r = n('MinorRadius');
    const at = (u, v) => { const w = R + r * Math.cos(v); return add(F.o, add(add(scale(F.x, w * Math.cos(u)), scale(F.y, w * Math.sin(u))), scale(F.z, r * Math.sin(v)))); };
    const inv = (p) => { const d = sub(p, F.o); const u = Math.atan2(dot(d, F.y), dot(d, F.x)); const radial = Math.hypot(dot(d, F.x), dot(d, F.y)) - R; return [u, Math.atan2(dot(d, F.z), radial)]; };
    return { kind: 'torus', at, inv, period: [TAU, TAU], curv: [1 / R, 1 / r], scaleUV: [R, r] };
  }
  if (t === 'IFCSURFACEOFLINEAREXTRUSION') {
    const M = P(), dir = g.dir(g.ref(g.a(sid, 'ExtrudedDirection')), [0, 0, 1]);
    const curve = sweptCurve(g, g.ref(g.a(sid, 'SweptCurve')));
    if (!curve) return null;
    const d = norm(apply(M, ...dir).map((x, i) => x - M[12 + i]));
    const at = (u, v) => add(curve.at(u, M), scale(d, v));
    const inv = (p) => { const v = dot(sub(p, [M[12], M[13], M[14]]), d); return [curve.near(sub(p, scale(d, v)), M), v]; };
    return { kind: 'extrusion', at, inv, period: [0, 0], curv: [curve.curv, 0], scaleUV: [1, 1] };
  }
  if (t === 'IFCSURFACEOFREVOLUTION') {
    const M = P();
    const ax = g.ref(g.a(sid, 'AxisPosition'));
    const ao = apply(M, ...g.point(g.ref(g.a(ax, 'Location'))));
    const ad = norm(sub(apply(M, ...g.dir(g.ref(g.a(ax, 'Axis')), [0, 0, 1])), [M[12], M[13], M[14]]));
    const curve = sweptCurve(g, g.ref(g.a(sid, 'SweptCurve')));
    if (!curve) return null;
    const at = (u, v) => { const p = curve.at(v, M); const R = rotation(ad, u); return add(ao, apply(R, ...sub(p, ao))); };
    // the angle about the axis measured from the generating curve's own half-plane
    const ref = (() => { const p = curve.at(curve.mid, M); const d = sub(p, ao); const w = sub(d, scale(ad, dot(d, ad))); return len(w) > 1e-12 ? norm(w) : norm(cross(ad, [1, 0, 0])); })();
    const ref2 = cross(ad, ref);
    const inv = (p) => {
      const d = sub(p, ao), h = dot(d, ad), w = sub(d, scale(ad, h));
      const u = Math.atan2(dot(w, ref2), dot(w, ref));
      const back = add(ao, add(scale(ad, h), scale(ref, len(w))));
      return [u, curve.near(back, M)];
    };
    return { kind: 'revolution', at, inv, period: [TAU, 0], curv: [0.2, curve.curv], scaleUV: [1, 1] };
  }
  if (t === 'IFCBSPLINESURFACEWITHKNOTS' || t === 'IFCRATIONALBSPLINESURFACEWITHKNOTS') return bsplineSurface(g, sid, t);
  g.note(g.s.pretty(t) + ' surfaces are not drawn yet; their faces are drawn flat');
  return null;
}

/** A swept curve (an open profile's curve) sampled and parameterised by length: at(s, M), near(p, M) → s. */
function sweptCurve(g, prof) {
  let pts = null;
  const t = g.t(prof);
  if (t === 'IFCARBITRARYOPENPROFILEDEF' || t === 'IFCARBITRARYCLOSEDPROFILEDEF') pts = curvePoints(g, g.ref(g.a(prof, t === 'IFCARBITRARYOPENPROFILEDEF' ? 'Curve' : 'OuterCurve')));
  else if (t && g.s.isA(t, 'IFCCURVE')) pts = curvePoints(g, prof);
  else if (t && g.s.isA(t, 'IFCPROFILEDEF')) { const sh = profileShapes(g, prof); if (sh.length) pts = sh[0].outer.map((p) => [p[0], p[1], 0]); }
  if (!pts || pts.length < 2) return null;
  const s = [0];
  for (let i = 1; i < pts.length; i++) s.push(s[i - 1] + len(sub(pts[i], pts[i - 1])));
  const total = s[s.length - 1] || 1;
  const at = (x, M) => {
    const v = Math.max(0, Math.min(total, x));
    let i = 1;
    while (i < s.length - 1 && s[i] < v) i++;
    const f = (v - s[i - 1]) / ((s[i] - s[i - 1]) || 1);
    const p = add(pts[i - 1], scale(sub(pts[i], pts[i - 1]), f));
    return apply(M, p[0], p[1], p[2]);
  };
  const W = pts.map((p) => p);
  const near = (q, M) => {
    let best = 0, bd = Infinity;
    for (let i = 1; i < W.length; i++) {
      const a = apply(M, ...W[i - 1]), b = apply(M, ...W[i]);
      const ab = sub(b, a), l2 = dot(ab, ab) || 1e-300;
      const f = Math.max(0, Math.min(1, dot(sub(q, a), ab) / l2));
      const d = len(sub(q, add(a, scale(ab, f))));
      if (d < bd) { bd = d; best = s[i - 1] + f * (s[i] - s[i - 1]); }
    }
    return best;
  };
  return { at, near, total, mid: total / 2, curv: pts.length > 2 ? 4 / total : 0 };
}

function bsplineSurface(g, sid, t) {
  const pu = g.num(g.a(sid, 'UDegree'), 1), pv = g.num(g.a(sid, 'VDegree'), 1);
  const rows = g.a(sid, 'ControlPointsList') || [];
  const ctrl = rows.map((r) => g.refs(r).map((c) => g.point(c)));
  const nu = ctrl.length, nv = ctrl[0]?.length || 0;
  if (nu < 2 || nv < 2) return null;
  const knots = (ks, ms) => { const out = []; (ks || []).forEach((k, i) => { for (let r = 0; r < (g.num(ms?.[i], 1) || 1); r++) out.push(g.num(k, 0)); }); return out; };
  const U = knots(g.a(sid, 'UKnots'), g.a(sid, 'UMultiplicities'));
  const V = knots(g.a(sid, 'VKnots'), g.a(sid, 'VMultiplicities'));
  if (U.length !== nu + pu + 1 || V.length !== nv + pv + 1) { g.note('A B-spline surface with inconsistent knots is drawn flat'); return null; }
  const W = t === 'IFCRATIONALBSPLINESURFACEWITHKNOTS' ? (g.a(sid, 'WeightsData') || []).map((r) => (r || []).map((w) => g.num(w, 1))) : null;
  const H = ctrl.map((r, i) => r.map((c, j) => { const w = W ? W[i]?.[j] ?? 1 : 1; return [c[0] * w, c[1] * w, c[2] * w, w]; }));
  const u0 = U[pu], u1 = U[nu], v0 = V[pv], v1 = V[nv];
  const span = (K, p, n, x) => { let k = p; while (k < n - 1 && x >= K[k + 1]) k++; return k; };
  const basis = (K, p, k, x) => {
    // the p + 1 non-zero B-spline basis functions at x in span k (Cox–de Boor)
    const N = [1], left = [], right = [];
    for (let j = 1; j <= p; j++) {
      left[j] = x - K[k + 1 - j]; right[j] = K[k + j] - x;
      let saved = 0;
      for (let r = 0; r < j; r++) {
        const den = right[r + 1] + left[j - r];
        const tmp = den ? N[r] / den : 0;
        N[r] = saved + right[r + 1] * tmp;
        saved = left[j - r] * tmp;
      }
      N[j] = saved;
    }
    return N;
  };
  const closedU = g.bool(g.a(sid, 'UClosed'), false) === true, closedV = g.bool(g.a(sid, 'VClosed'), false) === true;
  // closed directions wrap round (their ends are a seam, not an edge); open ones stop at the ends
  const wrapU = (u) => (closedU ? u0 + ((((u - u0) % (u1 - u0)) + (u1 - u0)) % (u1 - u0)) : Math.max(u0, Math.min(u1, u)));
  const wrapV = (v) => (closedV ? v0 + ((((v - v0) % (v1 - v0)) + (v1 - v0)) % (v1 - v0)) : Math.max(v0, Math.min(v1, v)));
  const at = (u, v) => {
    u = wrapU(u); v = wrapV(v);
    const ku = span(U, pu, nu, u), kv = span(V, pv, nv, v);
    const Nu = basis(U, pu, ku, u), Nv = basis(V, pv, kv, v);
    let x = 0, y = 0, z = 0, w = 0;
    for (let i = 0; i <= pu; i++) for (let j = 0; j <= pv; j++) {
      const h = H[ku - pu + i][kv - pv + j], b = Nu[i] * Nv[j];
      x += b * h[0]; y += b * h[1]; z += b * h[2]; w += b * h[3];
    }
    return [x / w, y / w, z / w];
  };
  // inverse: nearest grid sample, then Newton steps on the distance (numerical derivatives)
  const G = 24, grid = [];
  for (let i = 0; i <= G; i++) for (let j = 0; j <= G; j++) { const u = u0 + (u1 - u0) * i / G, v = v0 + (v1 - v0) * j / G; grid.push([u, v, at(u, v)]); }
  const du = (u1 - u0) * 1e-6 || 1e-9, dv = (v1 - v0) * 1e-6 || 1e-9;
  const inv = (p, hint) => {
    let u, v;
    if (hint) { [u, v] = hint; }
    else { let bd = Infinity; for (const q of grid) { const d = len(sub(q[2], p)); if (d < bd) { bd = d; u = q[0]; v = q[1]; } } }
    for (let it = 0; it < 12; it++) {
      // one-sided differences that stay inside the domain (a step past its edge would be clamped to a zero derivative)
      const s = at(u, v);
      const hu = closedU || u + du <= u1 ? du : -du, hv = closedV || v + dv <= v1 ? dv : -dv;
      const su = scale(sub(at(u + hu, v), s), 1 / hu), sv = scale(sub(at(u, v + hv), s), 1 / hv);
      const r = sub(p, s);
      const a = dot(su, su), b = dot(su, sv), c = dot(sv, sv), e = dot(r, su), f = dot(r, sv);
      const det = a * c - b * b;
      if (Math.abs(det) < 1e-300) break;
      const xu = (e * c - f * b) / det, xv = (a * f - b * e) / det;
      u = closedU ? u + xu : Math.max(u0, Math.min(u1, u + xu)); v = closedV ? v + xv : Math.max(v0, Math.min(v1, v + xv));
      if (Math.abs(xu) < du && Math.abs(xv) < dv) break;
    }
    if (closedU) u = wrapU(u);
    if (closedV) v = wrapV(v);
    if (hint) {
      // a hint can trap Newton on the far side of a fold: keep the better of it and a fresh grid start
      const d1 = len(sub(at(u, v), p));
      if (d1 > 1e-6 * (1 + len(p))) { const fresh = inv(p, null); if (len(sub(at(fresh[0], fresh[1]), p)) < d1) return fresh; }
    }
    return [u, v];
  };
  return { kind: 'bspline', at, inv, period: [closedU ? u1 - u0 : 0, closedV ? v1 - v0 : 0], domain: [u0, u1, v0, v1], dens: [Math.min(48, (nu - pu) * 6 + 4), Math.min(48, (nv - pv) * 6 + 4)], scaleUV: null };
}

// ---- faces ----

/** Tessellate one face on its surface into m. false when the face is not on a curved surface it can read. */
export function surfaceFace(g, f, m) {
  const ft = g.t(f);
  if (ft !== 'IFCADVANCEDFACE' && ft !== 'IFCFACESURFACE') return false;
  const sid = g.ref(g.a(f, 'FaceSurface'));
  const st = g.t(sid);
  if (!st || st === 'IFCPLANE') return false;
  const S = surfaceOf(g, sid);
  if (!S || S.kind === 'plane') return false;
  const same = g.bool(g.a(f, 'SameSense'), true) !== false;
  let { outer, holes } = faceLoops(g, f);
  const loops = [outer, ...holes].filter((l) => l && l.length >= 2);
  if (!loops.length) return true;
  // 1. loops → (u, v), unwrapping periodic directions along each loop; full-circle edges run whichever way closes the loop
  const uvLoops = loops.map((l) => Object.assign(closingUV(S, l), { outer: l === outer }));
  // 2. a loop that does not close in (u, v) wraps round a periodic direction: two such loops make one band
  const closedL = [], wrapping = [];
  uvLoops.forEach((L, k) => {
    const a = L.uv[0], b = L.uv[L.uv.length - 1];
    const gapU = Math.abs(b[0] - a[0]), gapV = Math.abs(b[1] - a[1]);
    if ((S.period[0] && Math.abs(gapU - S.period[0]) < S.period[0] * 0.05) || (S.period[1] && Math.abs(gapV - S.period[1]) < S.period[1] * 0.05)) wrapping.push(L);
    else closedL.push(L);
  });
  if (wrapping.length === 2) closedL.push(Object.assign(band(wrapping[0], wrapping[1], S), { outer: wrapping[0].outer || wrapping[1].outer }));
  else if (wrapping.length) { g.note('A face wrapping round a curved surface is drawn flat'); return false; }
  if (!closedL.length) return true;
  // boundary points that are not on the face's surface (an exporter's edge curve that leaves it) are put back on it;
  // points on it keep their exact place, so neighbouring faces still meet
  {
    const all3 = closedL.flatMap((L) => L.p);
    const lo3 = [0, 1, 2].map((k) => Math.min(...all3.map((q) => q[k]))), hi3 = [0, 1, 2].map((k) => Math.max(...all3.map((q) => q[k])));
    const tol = Math.max(1e-9, len(sub(hi3, lo3)) * 1e-3);
    for (const L of closedL) L.p = L.p.map((q, i) => { const on = S.at(L.uv[i][0], L.uv[i][1]); return len(sub(on, q)) > tol ? on : q; });
  }
  // 3. metric scale for the parameter directions (u in radians, v in length …)
  const all = closedL.flatMap((L) => L.uv);
  const [mu, mv] = metric(S, all);
  for (const L of closedL) {
    L.st = L.uv.map(([u, v]) => [u * mu, v * mv]);
    // repeated points (where a pole meets a seam, a loop's closing point) would never enter the triangulation
    const keepI = [];
    for (let i = 0; i < L.st.length; i++) {
      const a = L.st[i], b = keepI.length ? L.st[keepI[keepI.length - 1]] : null;
      if (b && Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9) continue;
      keepI.push(i);
    }
    while (keepI.length > 1) { const a = L.st[keepI[0]], b = L.st[keepI[keepI.length - 1]]; if (Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9) keepI.pop(); else break; }
    L.st = keepI.map((i) => L.st[i]); L.uv = keepI.map((i) => L.uv[i]); L.p = keepI.map((i) => L.p[i]);
  }
  // outer = largest |area|; others are holes
  const area = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; };
  // the outer loop: the one the file marks (IfcFaceOuterBound), else the largest
  closedL.sort((a, b) => (b.outer - a.outer) || Math.abs(area(b.st)) - Math.abs(area(a.st)));
  const outerL = closedL[0], holeL = closedL.slice(1);
  // on a periodic surface a hole may have been unwrapped a whole period away from the outer loop: bring it back
  for (let d = 0; d < 2; d++) {
    if (!S.period[d]) continue;
    const P = S.period[d] * (d === 0 ? mu : mv);
    const oLo = Math.min(...outerL.st.map((q) => q[d])), oHi = Math.max(...outerL.st.map((q) => q[d]));
    for (const L of holeL) {
      const c = L.st.reduce((s2, q) => s2 + q[d], 0) / L.st.length;
      let k = 0;
      while (c + k * P < oLo && k < 8) k++;
      while (c + k * P > oHi && k > -8) k--;
      if (k) { L.st = L.st.map((q) => (d === 0 ? [q[0] + k * P, q[1]] : [q[0], q[1] + k * P])); L.uv = L.uv.map((q) => (d === 0 ? [q[0] + k * S.period[0], q[1]] : [q[0], q[1] + k * S.period[1]])); }
    }
  }
  // 4. density: the surface's normal is sampled over the loops' box; the spacing turns the normal by about 0.2 rad
  const lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  for (const p of outerL.st) for (let k = 0; k < 2; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); }
  const ext = Math.max(hi[0] - lo[0], hi[1] - lo[1]) || 1;
  // normal by differences stepping toward the middle of the box (a step past an open domain's end is clamped to nothing)
  const nrmAt = (x, y) => {
    const u = x / mu, v = y / mv;
    const ex = (x < (lo[0] + hi[0]) / 2 ? 1 : -1) * 1e-4 * ext, ey = (y < (lo[1] + hi[1]) / 2 ? 1 : -1) * 1e-4 * ext;
    const p0 = S.at(u, v);
    const n = cross(scale(sub(S.at((x + ex) / mu, v), p0), Math.sign(ex)), scale(sub(S.at(u, (y + ey) / mv), p0), Math.sign(ey)));
    return len(n) > 0 ? norm(n) : null;
  };
  const K = 8;
  let turn = 0;
  for (let i = 0; i <= K; i++) for (let j = 0; j <= K; j++) {
    const x = lo[0] + (hi[0] - lo[0]) * i / K, y = lo[1] + (hi[1] - lo[1]) * j / K;
    const n0 = nrmAt(x, y);
    if (!n0) continue;
    const ang = (n1) => (n1 ? Math.acos(Math.max(-1, Math.min(1, dot(n0, n1)))) : 0);
    if (i < K) turn = Math.max(turn, ang(nrmAt(lo[0] + (hi[0] - lo[0]) * (i + 1) / K, y)) / ((hi[0] - lo[0]) / K || 1));
    if (j < K) turn = Math.max(turn, ang(nrmAt(x, lo[1] + (hi[1] - lo[1]) * (j + 1) / K)) / ((hi[1] - lo[1]) / K || 1));
  }
  const h = Math.max(ext / 96, Math.min(ext / 4, turn > 0 ? 0.2 / turn : ext / 4));
  // 5. points: the loops (densified to h), interior grid points away from the loops
  const pts = [], xyz = [], bnd = [];
  // the loops' own points only: a neighbouring face shares exactly these along the common edge (no T-junctions)
  const pushLoop = (L) => {
    const ids = [];
    for (let i = 0; i < L.st.length; i++) { ids.push(pts.length); pts.push(L.st[i]); xyz.push(L.p[i]); }
    return ids;
  };
  const rings = [pushLoop(outerL), ...holeL.map(pushLoop)];
  bnd.push(...rings);
  const polys = [outerL.st, ...holeL.map((L) => L.st)];
  // inside the outer loop and in none of the holes (inner loops lying outside the outer one take nothing away)
  const inside = (q) => pip(q, polys[0]) && !polys.slice(1).some((P) => pip(q, P));
  const segs = [];
  for (const r of rings) for (let i = 0; i < r.length; i++) segs.push([pts[r[i]], pts[r[(i + 1) % r.length]]]);
  for (let x = lo[0] + h / 2; x < hi[0]; x += h) for (let y = lo[1] + h / 2; y < hi[1]; y += h) {
    const q = [x, y];
    if (!inside(q)) continue;
    let near = false;
    for (const [a, b] of segs) if (segDist(q, a, b) < h * 0.45) { near = true; break; }
    if (near) continue;
    pts.push(q); xyz.push(S.at(x / mu, y / mv));
  }
  // 6. triangulate, then make every boundary segment an edge by flipping the diagonals it crosses (constrained Delaunay,
  // Sloan's edge recovery); then keep what is inside the loops
  const tris = delaunay(pts);
  const segsIdx = [];
  for (const r of rings) for (let i = 0; i < r.length; i++) segsIdx.push([r[i], r[(i + 1) % r.length]]);
  recoverEdges(pts, tris, segsIdx);
  const base = m.vertexCount;
  const keep = [];
  for (let i = 0; i < tris.length; i += 3) {
    const a = pts[tris[i]], b = pts[tris[i + 1]], c = pts[tris[i + 2]];
    const cen = [(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3];
    if (inside(cen)) keep.push(tris[i], tris[i + 1], tris[i + 2]);
  }
  if (!keep.length) return true;
  // 7. orientation: the surface normal (finite differences), reversed when SameSense is false
  const want = (i) => {
    const [u, v] = [pts[i][0] / mu, pts[i][1] / mv];
    const e = 1e-5 * (1 + Math.abs(u)), e2 = 1e-5 * (1 + Math.abs(v));
    const p0 = S.at(u, v);
    const n = cross(sub(S.at(u + e, v), p0), sub(S.at(u, v + e2), p0));
    return same ? n : scale(n, -1);
  };
  let agree = 0;
  for (let i = 0; i < keep.length; i += 3) {
    const a = xyz[keep[i]], b = xyz[keep[i + 1]], c = xyz[keep[i + 2]];
    const n = cross(sub(b, a), sub(c, a));
    agree += Math.sign(dot(n, want(keep[i])));
  }
  const flip = agree < 0;
  for (const p of xyz) m.pos.push(p[0], p[1], p[2]), m.nrm.push(0, 0, 1);
  for (let i = 0; i < keep.length; i += 3) {
    const a = keep[i], b = flip ? keep[i + 2] : keep[i + 1], c = flip ? keep[i + 1] : keep[i + 2];
    m.idx.push(base + a, base + b, base + c);
  }
  // vertex normals from the triangles around each vertex (smooth shading on curved faces)
  const N = new Float64Array(xyz.length * 3);
  for (let i = 0; i < keep.length; i += 3) {
    const ia = keep[i], ib = flip ? keep[i + 2] : keep[i + 1], ic = flip ? keep[i + 1] : keep[i + 2];
    const n = cross(sub(xyz[ib], xyz[ia]), sub(xyz[ic], xyz[ia]));
    for (const k of [ia, ib, ic]) { N[k * 3] += n[0]; N[k * 3 + 1] += n[1]; N[k * 3 + 2] += n[2]; }
  }
  for (let k = 0; k < xyz.length; k++) {
    const n = norm([N[k * 3], N[k * 3 + 1], N[k * 3 + 2]]);
    m.nrm[(base + k) * 3] = n[0]; m.nrm[(base + k) * 3 + 1] = n[1]; m.nrm[(base + k) * 3 + 2] = n[2];
  }
  return true;
}

/**
 * A loop's (u, v) on a periodic surface, made to close: exporters disagree about the direction of an edge that starts
 * and ends on one vertex (a full circle), and an edge shrunk to a point (a cone's apex, a pole) must run along the pole
 * in (u, v) by some whole number of periods. Every combination is tried (they are few); the first that closes wins,
 * else the plain reading.
 */
function closingUV(S, loop) {
  const plain = toUV(S, loop);
  const r = loop.runs;
  const per = S.period;
  const within = (uv) => [0, 1].every((d) => !per[d] || Math.max(...uv.map((q) => q[d])) - Math.min(...uv.map((q) => q[d])) <= per[d] * 1.001);
  if (!r || !(per[0] || per[1]) || (closes(S, plain) && within(plain.uv))) return plain;
  let R = r.runs.map((pts, k) => ({ pts, ring: r.ring[k] }));
  if (loop.rev) R = R.reverse().map((x) => ({ ...x, pts: x.pts.slice().reverse() }));
  const all = R.flatMap((x) => x.pts);
  const lo = [0, 1, 2].map((k) => Math.min(...all.map((p) => p[k]))), hi = [0, 1, 2].map((k) => Math.max(...all.map((p) => p[k])));
  const size = Math.max(1e-12, len(sub(hi, lo)));
  for (const x of R) {
    // a pole: an edge shrunk to a point, or a closed edge whose points all land on one (u, v) (a cone's apex as a tiny circle)
    let l = 0;
    for (let i = 1; i < x.pts.length; i++) l += len(sub(x.pts[i], x.pts[i - 1]));
    let span = 0;
    // (some exporters give the apex edge a curve that leaves the surface; its points still all find the apex)
    // (on a pole u is arbitrary, so compare where the points land on the surface, not their (u, v))
    let collapsed = false;
    if (x.ring) {
      const q0 = S.inv(x.pts[0], null), p0 = S.at(q0[0], q0[1]);
      for (const p of x.pts) span = Math.max(span, len(sub(S.at(...S.inv(p, null)), p0)));
      // its vertex sits where the surface collapses: moving along the periodic direction does not move the point
      collapsed = [0, 1].some((d) => per[d] && [0.25, 0.5].every((f) => len(sub(S.at(q0[0] + (d === 0 ? f * per[0] : 0), q0[1] + (d === 1 ? f * per[1] : 0)), p0)) < size * 1e-6));
    }
    // an edge whose curve strays off the face's surface (some exporters write such curves) is drawn like a pole: a straight
    // run in (u, v) between its ends, evaluated on the surface
    let off = 0;
    const step = Math.max(1, Math.floor(x.pts.length / 12));
    for (let i = 0; i < x.pts.length; i += step) { const q = S.inv(x.pts[i], null); off = Math.max(off, len(sub(S.at(q[0], q[1]), x.pts[i]))); }
    x.junk = off > size * 1e-3;
    x.pole = l < size * 1e-6 || (x.ring && (span < size * 1e-6 || collapsed)) || x.junk;
  }
  const first = R.findIndex((x) => !x.pole);
  if (first < 0) return plain;
  R = [...R.slice(first), ...R.slice(0, first)];
  const rings = R.map((x, i) => (x.ring && !x.pole ? i : -1)).filter((i) => i >= 0);
  const poles = R.map((x, i) => (x.pole ? i : -1)).filter((i) => i >= 0);
  if (rings.length + poles.length > 6) return plain;
  // each pole run may wrap by -1, 0 or +1 periods in each periodic direction
  const opts = [];
  for (const su of per[0] ? [-1, 0, 1] : [0]) for (const sv of per[1] ? [-1, 0, 1] : [0]) opts.push([su * per[0], sv * per[1]]);
  const combos = (1 << rings.length) * opts.length ** poles.length;
  let best = null, bestArea = 1e-12;
  for (let c = 0; c < combos; c++) {
    let rest = c;
    const flip = new Set(), shift = new Map();
    for (const i of rings) { if (rest & 1) flip.add(i); rest >>= 1; }
    for (const i of poles) { shift.set(i, opts[rest % opts.length]); rest = Math.floor(rest / opts.length); }
    const uv = [], p = [];
    let prev = null, pending = null;
    for (let i = 0; i < R.length; i++) {
      const pts = flip.has(i) ? R[i].pts.slice().reverse() : R[i].pts;
      if (R[i].pole) { pending = { i, pts }; continue; }
      for (let j = 0; j < pts.length; j++) {
        let q = invAt(S, pts[j], prev);
        if (prev) {
          for (let d = 0; d < 2; d++) { const Pd = per[d]; if (Pd) q[d] -= Math.round((q[d] - prev[d]) / Pd) * Pd; }
          if (pending && j === 0) {
            // the pole: straight along it from where the loop reached it to where it leaves, plus whole periods
            const sh = shift.get(pending.i);
            q[0] += sh[0]; q[1] += sh[1];
            const a = prev, n = pending.pts.length;
            for (let t = 1; t < n - 1; t++) { const f = t / (n - 1); const w = [a[0] + (q[0] - a[0]) * f, a[1] + (q[1] - a[1]) * f]; uv.push(w); p.push(S.at(w[0], w[1])); }
            pending = null;
          }
        }
        if (uv.length && j === 0 && len(sub(p[p.length - 1], pts[0])) < 1e-12) { prev = q; continue; }
        uv.push(q); p.push(pts[j]); prev = q.free ? null : q;
      }
    }
    if (pending) {
      // a pole closes the loop: run along it back to the start, by whole periods
      const a = prev, q = [uv[0][0], uv[0][1]];
      const n = pending.pts.length;
      const sh = shift.get(pending.i);
      for (let d = 0; d < 2; d++) if (per[d]) q[d] = uv[0][d] + sh[d] + Math.round((a[d] - uv[0][d]) / per[d]) * per[d];
      // points on the pole come from the surface (an exporter's curve there may leave it)
      for (let t = 1; t < n - 1; t++) { const f = t / (n - 1); const w = [a[0] + (q[0] - a[0]) * f, a[1] + (q[1] - a[1]) * f]; uv.push(w); p.push(S.at(w[0], w[1])); }
      uv.push(q); p.push(S.at(q[0], q[1]));
    }
    settleStart(uv);
    const L = { p, uv };
    // of the readings that close, the one enclosing the most of the parameter plane (a wrong turn folds the loop back)
    // a face covers at most one period in each periodic direction
    if (within(uv) && closes(S, L)) { const a = Math.abs(uvArea(uv)); if (a > bestArea) { bestArea = a; best = L; } }
  }
  return best || plain;
}

function uvArea(P) { let s = 0; for (let i = 0; i < P.length; i++) { const p = P[i], q = P[(i + 1) % P.length]; s += p[0] * q[1] - q[0] * p[1]; } return s / 2; }

function closes(S, L) {
  const a = L.uv[0], b = L.uv[L.uv.length - 1];
  return [0, 1].every((k) => !S.period[k] || Math.abs(b[k] - a[k]) < S.period[k] * 0.25);
}

/**
 * (u, v) of a point, with prev as the hint; where the surface collapses (a pole: moving in u does not move the point) that
 * parameter means nothing, so it keeps prev's value — else a loop zigzags along the pole.
 */
function invAt(S, p, prev) {
  const q = S.inv(p, prev);
  const p0 = S.at(q[0], q[1]);
  for (let d = 0; d < 2; d++) {
    // step both ways: at the end of an open domain one step is clamped and moves nothing
    const span = S.period[d] || (S.domain ? S.domain[2 * d + 1] - S.domain[2 * d] : 1) || 1;
    const e = 1e-3 * span;
    const tiny = 1e-9 * (1 + len(p0));
    const moved = [e, -e].some((x) => len(sub(S.at(q[0] + (d === 0 ? x : 0), q[1] + (d === 1 ? x : 0)), p0)) > tiny);
    if (!moved) { if (prev) q[d] = prev[d]; else (q.free || (q.free = [])).push(d); }
  }
  return q;
}

/** A loop that starts on a pole: the first points' free parameter takes the first ordinary point's value. */
function settleStart(uv) {
  const f = uv[0] && uv[0].free;
  if (!f) return uv;
  const j = uv.findIndex((q) => !q.free);
  if (j > 0) for (let i = 0; i < j; i++) for (const d of f) uv[i][d] = uv[j][d];
  for (let i = 0; i < Math.max(j, 0); i++) delete uv[i].free;
  return uv;
}

/** Loop points → { p (3D), uv } with periodic directions unwrapped so the loop is continuous. */
function toUV(S, loop) {
  const uv = [];
  let prev = null;
  for (const p of loop) {
    let q = invAt(S, p, prev);
    if (prev) for (let k = 0; k < 2; k++) {
      const P = S.period[k];
      if (!P) continue;
      q[k] -= Math.round((q[k] - prev[k]) / P) * P;
    }
    uv.push(q);
    prev = q.free ? null : q;
  }
  return { p: loop.slice(), uv: settleStart(uv) };
}

/**
 * Two loops that each wrap once round a periodic direction (a cylinder face between two circles, no seam edge) → one closed
 * loop: A once round in its own direction, then B the other way round, shifted by whole periods to start next to A's end.
 */
function band(A, B, S) {
  const k = S.period[0] ? 0 : 1, P = S.period[k];
  const a = A.uv;
  const dirA = Math.sign(a[a.length - 1][k] - a[0][k]) || 1;
  let b = B.uv, bp = B.p;
  if ((Math.sign(b[b.length - 1][k] - b[0][k]) || 1) === dirA) { b = b.slice().reverse(); bp = bp.slice().reverse(); }
  const at = (q, d) => (k === 0 ? [q[0] + d, q[1]] : [q[0], q[1] + d]);
  const aEnd = at(a[0], dirA * P);
  let shift = 0;
  while (b[0][k] + shift - aEnd[k] > P / 2) shift -= P;
  while (b[0][k] + shift - aEnd[k] < -P / 2) shift += P;
  b = b.map((q) => at(q, shift));
  const bEnd = at(b[0], -dirA * P);
  return { uv: [...a, aEnd, ...b, bEnd], p: [...A.p, A.p[0], ...bp, bp[0]] };
}

/** Scale factors for (u, v) so the parameter plane is roughly isometric to the surface near the loops. */
function metric(S, uv) {
  if (S.scaleUV) return S.scaleUV;
  let su = 0, sv = 0, n = 0;
  const step = Math.max(1, Math.floor(uv.length / 24));
  for (let i = 0; i < uv.length; i += step) {
    const [u, v] = uv[i];
    const e = 1e-4 * (1 + Math.abs(u)), e2 = 1e-4 * (1 + Math.abs(v));
    const p = S.at(u, v);
    su += len(sub(S.at(u + e, v), p)) / e; sv += len(sub(S.at(u, v + e2), p)) / e2; n++;
  }
  return [su / n || 1, sv / n || 1];
}

function pip(q, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const a = P[i], b = P[j];
    if ((a[1] > q[1]) !== (b[1] > q[1]) && q[0] < (b[0] - a[0]) * (q[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

function segDist(q, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((q[0] - a[0]) * dx + (q[1] - a[1]) * dy) / l2)) : 0;
  return Math.hypot(q[0] - a[0] - t * dx, q[1] - a[1] - t * dy);
}

const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
/** Do segments p1–p2 and p3–p4 cross at a point inside both (not at an end)? */
function crosses(p1, p2, p3, p4) {
  const d1 = orient(p3, p4, p1), d2 = orient(p3, p4, p2), d3 = orient(p1, p2, p3), d4 = orient(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/**
 * Make each segment [a, b] an edge of the triangulation `tris` (flat, counter-clockwise; changed in place) by flipping the
 * diagonals that cross it (Sloan 1993). Segments that cannot be recovered (overlapping input) are left as they are.
 */
export function recoverEdges(P, tris, segs) {
  const T = tris.length / 3;
  const owner = new Map();   // directed edge "a,b" → triangle index
  const key = (a, b) => a * 1048576 + b;
  const setTri = (t, a, b, c) => {
    if (orient(P[a], P[b], P[c]) < 0) [b, c] = [c, b];
    tris[t * 3] = a; tris[t * 3 + 1] = b; tris[t * 3 + 2] = c;
    owner.set(key(a, b), t); owner.set(key(b, c), t); owner.set(key(c, a), t);
  };
  for (let t = 0; t < T; t++) setTri(t, tris[t * 3], tris[t * 3 + 1], tris[t * 3 + 2]);
  const third = (t, a, b) => { for (let k = 0; k < 3; k++) { const v = tris[t * 3 + k]; if (v !== a && v !== b) return v; } return -1; };
  const has = (a, b) => owner.has(key(a, b)) || owner.has(key(b, a));
  for (const [a, b] of segs) {
    if (a === b || has(a, b)) continue;
    // the edges crossing a–b
    const queue = [];
    for (let t = 0; t < T; t++) for (let k = 0; k < 3; k++) {
      const u = tris[t * 3 + k], v = tris[t * 3 + (k + 1) % 3];
      if (u < v && u !== a && u !== b && v !== a && v !== b && crosses(P[a], P[b], P[u], P[v])) queue.push([u, v]);
    }
    let guard = queue.length * queue.length + 50;
    while (queue.length && guard-- > 0) {
      const [c, d] = queue.shift();
      const t1 = owner.get(key(c, d)), t2 = owner.get(key(d, c));
      if (t1 === undefined || t2 === undefined || tris[t1 * 3] === undefined) continue;
      const e = third(t1, c, d), f = third(t2, c, d);
      if (e < 0 || f < 0) continue;
      if (!crosses(P[c], P[d], P[e], P[f])) { queue.push([c, d]); continue; }   // not convex yet: later
      owner.delete(key(c, d)); owner.delete(key(d, c));
      setTri(t1, c, f, e);
      setTri(t2, d, e, f);
      if (e !== a && e !== b && f !== a && f !== b && crosses(P[a], P[b], P[e], P[f])) queue.push([e, f]);
    }
  }
}

/**
 * Bowyer–Watson Delaunay triangulation of 2D points → [i, j, k, …] counter-clockwise. Triangles are indexed in a grid by
 * their circumcircle's box, so an insertion only tests the triangles whose circle can hold the new point.
 */
export function delaunay(P) {
  const n = P.length;
  if (n < 3) return [];
  let lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  for (const p of P) { if (p[0] < lo[0]) lo[0] = p[0]; if (p[1] < lo[1]) lo[1] = p[1]; if (p[0] > hi[0]) hi[0] = p[0]; if (p[1] > hi[1]) hi[1] = p[1]; }
  const d = Math.max(hi[0] - lo[0], hi[1] - lo[1]) || 1, cx = (lo[0] + hi[0]) / 2, cy = (lo[1] + hi[1]) / 2;
  const pts = P.concat([[cx - 20 * d, cy - d], [cx + 20 * d, cy - d], [cx, cy + 20 * d]]);
  const G = Math.max(1, Math.min(256, Math.ceil(Math.sqrt(n / 2))));
  const cw = (hi[0] - lo[0]) / G || 1, ch = (hi[1] - lo[1]) / G || 1;
  const cells = Array.from({ length: G * G }, () => []);
  const big = [];
  const cellOf = (x, y) => [Math.min(G - 1, Math.max(0, Math.floor((x - lo[0]) / cw))), Math.min(G - 1, Math.max(0, Math.floor((y - lo[1]) / ch)))];
  const add = (t) => {
    const r = Math.sqrt(t.r2);
    const [x0, y0] = cellOf(t.cx - r, t.cy - r), [x1, y1] = cellOf(t.cx + r, t.cy + r);
    if ((x1 - x0 + 1) * (y1 - y0 + 1) > 64) { big.push(t); return; }
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) cells[y * G + x].push(t);
  };
  add(mk(pts, n, n + 1, n + 2));
  const order = [...Array(n).keys()].sort((a, b) => (Math.floor((P[a][0] - lo[0]) / cw) - Math.floor((P[b][0] - lo[0]) / cw)) || P[a][1] - P[b][1]);
  for (const i of order) {
    const [x, y] = pts[i];
    const [gx, gy] = cellOf(x, y);
    const cand = cells[gy * G + gx];
    const bad = [];
    const test = (list) => {
      for (let k = 0; k < list.length; k++) {
        const t = list[k];
        if (t.dead) { list[k] = list[list.length - 1]; list.pop(); k--; continue; }
        if (!t.mark && (x - t.cx) ** 2 + (y - t.cy) ** 2 < t.r2 * (1 + 1e-12)) { t.mark = true; bad.push(t); }
      }
    };
    test(cand); test(big);
    const edges = new Map();
    for (const t of bad) {
      t.dead = true;
      for (const [a, b] of [[t.a, t.b], [t.b, t.c], [t.c, t.a]]) {
        const k = a < b ? a * 1048576 + b : b * 1048576 + a;
        if (edges.has(k)) edges.delete(k); else edges.set(k, [a, b]);
      }
    }
    for (const [a, b] of edges.values()) add(mk(pts, a, b, i));
  }
  const out = [], seen = new Set();
  for (const list of [...cells, big]) for (const t of list) {
    if (t.dead || seen.has(t)) continue;
    seen.add(t);
    if (t.a < n && t.b < n && t.c < n) out.push(t.a, t.b, t.c);
  }
  return out;
}

function mk(p, a, b, c) {
  // counter-clockwise, with its circumcircle
  const A = p[a], B = p[b], C = p[c];
  if ((B[0] - A[0]) * (C[1] - A[1]) - (B[1] - A[1]) * (C[0] - A[0]) < 0) [b, c] = [c, b];
  const [ax, ay] = p[a], [bx, by] = p[b], [cx, cy] = p[c];
  const D = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by)) || 1e-300;
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / D;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / D;
  return { a, b, c, cx: ux, cy: uy, r2: (ax - ux) ** 2 + (ay - uy) ** 2 };
}

export { planeTriangulate, newell, arcSegments };
