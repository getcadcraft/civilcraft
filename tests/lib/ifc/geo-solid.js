/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-solid.js — swept solids and primitives as meshes, each in its own Position frame (IFC4 ADD2 TC1 §8.8 Geometric
 * model resource):
 *   IfcExtrudedAreaSolid (+ Tapered), IfcRevolvedAreaSolid (+ Tapered), IfcSweptDiskSolid (+ Polygonal: rebar),
 *   IfcSurfaceCurveSweptAreaSolid, IfcFixedReferenceSweptAreaSolid, IfcDirectrixCurveSweptAreaSolid (profile swept along
 *   a curve, kept upright to the reference), and the CSG primitives IfcBlock, IfcRightCircularCylinder,
 *   IfcRightCircularCone, IfcSphere, IfcRectangularPyramid.
 *
 *   extruded(g, id) / revolved(g, id) / sweptDisk(g, id) / sweptArea(g, id) / primitive(g, id) → Mesh (Position applied)
 *   extrudeShapes(shapes, dir, depth) → Mesh   profile shapes (geo-profile.js) swept straight; outward faces
 */

import { Mesh } from './geo-mesh.js';
import { profileShapes } from './geo-profile.js';
import { curvePoints, arcSegments } from './geo-curve.js';
import { isSegmented, segmentedCurve, pointAlong } from './geo-align.js';
import { apply, add, sub, scale, dot, cross, norm, len, perp, rotation, mul, translation } from './geo-math.js';

const P3 = (p, z = 0) => [p[0], p[1], z];

/** Extrude 2D shapes (z = 0) along dir × depth. Faces point outward whatever the direction's sign. */
export function extrudeShapes(shapes, dir, depth, endShapes = null) {
  const m = new Mesh();
  const d = scale(dir, depth);
  const up = d[2] >= 0;   // shapes are counter-clockwise seen from +z
  shapes.forEach((s, si) => {
    if (s.open) return;
    const e = endShapes && endShapes[si] && sameCounts(s, endShapes[si]) ? endShapes[si] : s;
    const bottom = [s.outer.map((p) => P3(p)), ...s.holes.map((h) => h.map((p) => P3(p)))];
    const top = [e.outer.map((p) => add(P3(p), d)), ...e.holes.map((h) => h.map((p) => add(P3(p), d)))];
    // bottom faces down (reversed), top faces up — swapped when extruding downward
    m.polygon(up ? bottom.map((r) => r.slice().reverse()) : bottom);
    m.polygon(up ? top : top.map((r) => r.slice().reverse()));
    for (let r = 0; r < bottom.length; r++) {
      const A = bottom[r], B = top[r], n = A.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const q = [A[i], A[j], B[j], B[i]];
        quad(m, up ? q : q.slice().reverse());
      }
    }
  });
  return m;
}

function sameCounts(a, b) { return a.outer.length === b.outer.length && a.holes.length === b.holes.length && a.holes.every((h, k) => h.length === b.holes[k].length); }

/** A planar or slightly twisted quad as two triangles (one polygon when planar). */
function quad(m, q) {
  const [a, b, c, d] = q;
  if (len(sub(a, b)) < 1e-12 || len(sub(c, d)) < 1e-12) { m.tri(a, c, d); return; }
  const n1 = cross(sub(b, a), sub(c, a)), n2 = cross(sub(c, a), sub(d, a));
  if (dot(norm(n1), norm(n2)) > 0.9999) m.polygon([q]);
  else { m.tri(a, b, c); m.tri(a, c, d); }
}

export function extruded(g, id) {
  const shapes = profileShapes(g, g.ref(g.a(id, 'SweptArea')));
  const dir = g.dir(g.ref(g.a(id, 'ExtrudedDirection')), [0, 0, 1]);
  const depth = g.num(g.a(id, 'Depth'), 0);
  const end = g.t(id) === 'IFCEXTRUDEDAREASOLIDTAPERED' ? profileShapes(g, g.ref(g.a(id, 'EndSweptArea'))) : null;
  const m = extrudeShapes(shapes, dir, depth, end);
  return m.transform(g.axis2(g.ref(g.a(id, 'Position'))));
}

/** IfcRevolvedAreaSolid: the profile turned about Axis (in the profile plane) by Angle. */
export function revolved(g, id) {
  const shapes = profileShapes(g, g.ref(g.a(id, 'SweptArea')));
  const ax = g.ref(g.a(id, 'Axis'));
  const o = g.point(g.ref(g.a(ax, 'Location')));
  const axis = g.dir(g.ref(g.a(ax, 'Axis')), [0, 1, 0]);
  let angle = g.num(g.a(id, 'Angle'), 0) * g.angleUnit;
  const full = Math.abs(angle) >= 2 * Math.PI - 1e-9;
  if (full) angle = 2 * Math.PI * Math.sign(angle || 1);
  const steps = arcSegments(Math.abs(angle), 1);
  const rot = (k) => { const R = rotation(axis, angle * k / steps); return (p) => add(o, apply(R, ...sub(P3(p), o))); };
  const m = new Mesh();
  for (const sh of shapes) {
    if (sh.open) continue;
    const rings = [sh.outer, ...sh.holes];
    // which way the profile leaves its plane: points move along sign(angle) × axis × (p − o); the profile is
    // counter-clockwise about +z, so that sign fixes the winding of the sides and caps
    const c = sh.outer.reduce((acc, p) => [acc[0] + p[0] / sh.outer.length, acc[1] + p[1] / sh.outer.length], [0, 0]);
    const s = Math.sign(angle) * cross(axis, sub(P3(c), o))[2] < 0 ? -1 : 1;
    for (const ring of rings) {
      const n = ring.length;
      for (let k = 0; k < steps; k++) {
        const fa = rot(k), fb = rot(k + 1);
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n;
          const q = [fa(ring[i]), fa(ring[j]), fb(ring[j]), fb(ring[i])];
          quad(m, s < 0 ? q.slice().reverse() : q);
        }
      }
    }
    if (!full) {
      const start = rings.map((r) => r.map(rot(0)));
      const end = rings.map((r) => r.map(rot(steps)));
      m.polygon(s < 0 ? start : start.map((r) => r.slice().reverse()));
      m.polygon(s < 0 ? end.map((r) => r.slice().reverse()) : end);
    }
  }
  return m.transform(g.axis2(g.ref(g.a(id, 'Position'))));
}

/** Frames along a 3D polyline by parallel transport: [{ p, t, n, b }]. */
export function frames(path) {
  const out = [];
  const n = path.length;
  if (n < 2) return out;
  let t0 = norm(sub(path[1], path[0]));
  let nrm = perp(t0);
  for (let i = 0; i < n; i++) {
    const tin = i > 0 ? norm(sub(path[i], path[i - 1])) : null;
    const tout = i < n - 1 ? norm(sub(path[i + 1], path[i])) : null;
    let t = tin && tout ? norm(add(tin, tout)) : tin || tout;
    if (!t[0] && !t[1] && !t[2]) t = tout || tin;
    // transport the normal from the previous tangent to this one
    if (i > 0) { const prev = out[i - 1].t; nrm = transport(nrm, prev, t); }
    else nrm = norm(sub(nrm, scale(t, dot(nrm, t))));
    const b = cross(t, nrm);
    // mitre: scale the section across the bend so the wall keeps its thickness
    const mit = tin && tout ? 1 / Math.max(0.25, dot(tin, t)) : 1;
    out.push({ p: path[i], t, n: nrm, b, mit, tin, tout });
  }
  return out;
}

function transport(v, a, b) {
  const ax = cross(a, b), s = len(ax);
  if (s < 1e-12) return norm(sub(v, scale(b, dot(v, b))));
  const ang = Math.atan2(s, dot(a, b));
  const R = rotation(ax, ang);
  const w = apply(R, v[0], v[1], v[2]);
  return norm(sub(w, scale(b, dot(w, b))));
}

/** A ring of 2D section points placed at frame f (section x along f.n, y along f.b), mitred across the bend. */
function place(f, ring) {
  return ring.map(([x, y]) => {
    let off = add(scale(f.n, x), scale(f.b, y));
    if (f.mit !== 1 && f.tin) {
      // stretch the component along the bend plane so the section lies on the mitre plane
      const bend = norm(sub(f.tout, f.tin));
      const k = dot(off, bend);
      off = add(off, scale(bend, k * (f.mit - 1)));
    }
    return add(f.p, off);
  });
}

/** Sweep closed 2D rings (outer CCW, holes CW) along a path; caps at the ends unless the path closes. */
export function sweepRings(path, shapes) {
  const m = new Mesh();
  const fr = frames(path);
  if (fr.length < 2) return m;
  for (const s of shapes) {
    if (s.open) continue;
    const rings = [s.outer, ...s.holes];
    const placed = fr.map((f) => rings.map((r) => place(f, r)));
    for (let r = 0; r < rings.length; r++) {
      const n = rings[r].length;
      for (let k = 0; k + 1 < fr.length; k++) {
        const A = placed[k][r], B = placed[k + 1][r];
        for (let i = 0; i < n; i++) { const j = (i + 1) % n; quad(m, [A[i], A[j], B[j], B[i]]); }
      }
    }
    // the section is CCW about +t (n × b = t): the start cap faces back, the end cap forward
    m.polygon(placed[0].map((r) => r.slice().reverse()));
    m.polygon(placed[placed.length - 1]);
  }
  if (m.volume() < 0) m.flip();
  return m;
}

/** IfcSweptDiskSolid (and the polygonal variant with bends): a tube along the directrix. */
export function sweptDisk(g, id) {
  let path = curvePoints(g, g.ref(g.a(id, 'Directrix')));
  path = dedupe(path);
  const r = g.num(g.a(id, 'Radius'), 0);
  const ri = g.num(g.a(id, 'InnerRadius'), 0);
  const bend = g.num(g.a(id, 'FilletRadius'), 0);
  if (bend > 0 && path.length > 2) path = filletPath(path, bend);
  const circle = (rad) => { const n = arcSegments(2 * Math.PI, rad); return Array.from({ length: n }, (_, i) => [rad * Math.cos(2 * Math.PI * i / n), rad * Math.sin(2 * Math.PI * i / n)]); };
  const holes = ri > 0 && ri < r ? [circle(ri).reverse()] : [];
  return sweepRings(path, [{ outer: circle(r), holes }]);
}

function dedupe(path) {
  const out = [];
  for (const p of path) { const l = out[out.length - 1]; if (!l || len(sub(l, p)) > 1e-9) out.push(p); }
  return out;
}

/** Round the corners of a 3D polyline with arcs of radius r (IfcSweptDiskSolidPolygonal bends). */
export function filletPath(path, r) {
  const out = [path[0]];
  for (let i = 1; i + 1 < path.length; i++) {
    const p = path[i], a = norm(sub(path[i - 1], p)), b = norm(sub(path[i + 1], p));
    const cosT = dot(a, b);
    const half = Math.acos(Math.max(-1, Math.min(1, cosT))) / 2;
    if (half < 1e-6 || half > Math.PI / 2 - 1e-6) { out.push(p); continue; }
    const d = Math.min(r / Math.tan(half), len(sub(path[i - 1], p)) * 0.999, len(sub(path[i + 1], p)) * 0.999);
    const rr = d * Math.tan(half);
    const s = add(p, scale(a, d)), e = add(p, scale(b, d));
    const c = add(p, scale(norm(add(a, b)), rr / Math.sin(half)));
    const u = norm(sub(s, c)), w = norm(sub(e, c));
    const sweep = Math.acos(Math.max(-1, Math.min(1, dot(u, w))));
    const ax = norm(cross(u, w));
    const n = Math.max(2, arcSegments(sweep, rr));
    for (let k = 0; k <= n; k++) { const R = rotation(ax, sweep * k / n); out.push(add(c, scale(apply(R, u[0], u[1], u[2]), rr))); }
  }
  out.push(path[path.length - 1]);
  return out;
}

/** Profile swept along a directrix: IfcSurfaceCurveSweptAreaSolid, IfcFixedReferenceSweptAreaSolid, IfcDirectrixCurve…. */
export function sweptArea(g, id) {
  const shapes = profileShapes(g, g.ref(g.a(id, 'SweptArea')));
  const dirId = g.ref(g.a(id, 'Directrix'));
  let path = dedupe(curvePoints(g, dirId));
  // an alignment directrix is cut to StartParam … EndParam (distances along it)
  const sp = g.num(g.a(id, 'StartParam')), ep = g.num(g.a(id, 'EndParam'));
  if (isSegmented(g, dirId) && (sp !== null || ep !== null)) {
    const C = segmentedCurve(g, dirId), d0 = sp ?? 0, d1 = ep ?? C.dist[C.dist.length - 1];
    path = dedupe([pointAlong(g, dirId, d0).p, ...C.pts.filter((_, i) => C.dist[i] > d0 && C.dist[i] < d1), pointAlong(g, dirId, d1).p]);
  }
  const t = g.t(id);
  let m;
  if (t === 'IFCFIXEDREFERENCESWEPTAREASOLID' || t === 'IFCDIRECTRIXCURVESWEPTAREASOLID' || t === 'IFCSURFACECURVESWEPTAREASOLID') {
    // keep the profile's x axis toward the fixed reference — for a curve on a surface, the surface's normal (a plane's
    // axis; other surfaces: their position's z) — and y along tangent × x
    let ref = g.dir(g.ref(g.a(id, 'FixedReference')), [0, 0, 1]);
    if (t === 'IFCSURFACECURVESWEPTAREASOLID') {
      const rs = g.ref(g.a(id, 'ReferenceSurface'));
      const pos = rs !== null ? g.ref(g.a(rs, 'Position')) : null;
      if (pos !== null) { const M = g.axis2(pos); ref = [M[8], M[9], M[10]]; }
    }
    m = new Mesh();
    const fr = frames(path).map((f) => {
      let x = sub(ref, scale(f.t, dot(ref, f.t)));
      if (len(x) < 1e-9) x = f.n;
      x = norm(x);
      return { ...f, n: x, b: cross(f.t, x) };
    });
    m = sweepFramed(fr, shapes);
  } else m = sweepRings(path, shapes);
  return m.transform(g.axis2(g.ref(g.a(id, 'Position'))));
}

function sweepFramed(fr, shapes) {
  const m = new Mesh();
  if (fr.length < 2) return m;
  for (const s of shapes) {
    if (s.open) continue;
    const rings = [s.outer, ...s.holes];
    const placed = fr.map((f) => rings.map((r) => place(f, r)));
    for (let r = 0; r < rings.length; r++) {
      const n = rings[r].length;
      for (let k = 0; k + 1 < fr.length; k++) {
        const A = placed[k][r], B = placed[k + 1][r];
        for (let i = 0; i < n; i++) { const j = (i + 1) % n; quad(m, [A[i], A[j], B[j], B[i]]); }
      }
    }
    m.polygon(placed[0].map((r) => r.slice().reverse()));
    m.polygon(placed[placed.length - 1]);
  }
  if (m.volume() < 0) m.flip();
  return m;
}

/** CSG primitives (IfcBlock, IfcRightCircularCylinder, IfcRightCircularCone, IfcSphere, IfcRectangularPyramid). */
export function primitive(g, id) {
  const t = g.t(id);
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  let m = new Mesh();
  if (t === 'IFCBLOCK') {
    const x = n('XLength'), y = n('YLength'), z = n('ZLength');
    m = extrudeShapes([{ outer: [[0, 0], [x, 0], [x, y], [0, y]], holes: [] }], [0, 0, 1], z);
  } else if (t === 'IFCRIGHTCIRCULARCYLINDER') {
    const r = n('Radius'), h = n('Height'), k = arcSegments(2 * Math.PI, r);
    m = extrudeShapes([{ outer: Array.from({ length: k }, (_, i) => [r * Math.cos(2 * Math.PI * i / k), r * Math.sin(2 * Math.PI * i / k)]), holes: [] }], [0, 0, 1], h);
  } else if (t === 'IFCRIGHTCIRCULARCONE') {
    const r = n('BottomRadius'), h = n('Height'), k = arcSegments(2 * Math.PI, r);
    const ring = Array.from({ length: k }, (_, i) => [r * Math.cos(2 * Math.PI * i / k), r * Math.sin(2 * Math.PI * i / k), 0]);
    m.polygon([ring.slice().reverse()]);
    for (let i = 0; i < k; i++) m.tri(ring[i], ring[(i + 1) % k], [0, 0, h]);
  } else if (t === 'IFCRECTANGULARPYRAMID') {
    const x = n('XLength'), y = n('YLength'), h = n('Height');
    const b = [[0, 0, 0], [x, 0, 0], [x, y, 0], [0, y, 0]], top = [x / 2, y / 2, h];
    m.polygon([b.slice().reverse()]);
    for (let i = 0; i < 4; i++) m.tri(b[i], b[(i + 1) % 4], top);
  } else if (t === 'IFCSPHERE') {
    const r = n('Radius'), st = 12, sl = 24;
    const pt = (i, j) => { const th = Math.PI * i / st, ph = 2 * Math.PI * j / sl; return [r * Math.sin(th) * Math.cos(ph), r * Math.sin(th) * Math.sin(ph), r * Math.cos(th)]; };
    for (let i = 0; i < st; i++) for (let j = 0; j < sl; j++) {
      const a = pt(i, j), b = pt(i + 1, j), c = pt(i + 1, j + 1), d = pt(i, j + 1);
      if (i > 0) m.tri(a, b, d);
      if (i < st - 1) m.tri(b, c, d);
    }
  } else { g.note(g.s.pretty(t) + ' is not drawn yet'); return m; }
  return m.transform(g.axis2(g.ref(g.a(id, 'Position'))));
}

export { mul, translation };
