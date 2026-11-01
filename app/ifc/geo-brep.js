/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-brep.js — boundary and tessellated representations as meshes (IFC4 ADD2 TC1 §8.8 Geometric model resource, §8.19
 * Topology resource):
 *   IfcFacetedBrep (+ WithVoids), IfcClosedShell / IfcOpenShell / IfcConnectedFaceSet of IfcFace with IfcPolyLoop or
 *   IfcEdgeLoop bounds (outer bound first, holes; Orientation honoured), IfcShellBasedSurfaceModel,
 *   IfcFaceBasedSurfaceModel, IfcPolygonalFaceSet (IfcIndexedPolygonalFace + WithVoids, PnIndex), IfcTriangulatedFaceSet
 *   (+ Normals, PnIndex; IfcTriangulatedIrregularNetwork), IfcBoundingBox.
 *
 *   brep(g, id) / faceSet(g, id) / surfaceModel(g, id) / boundingBox(g, id) → Mesh
 *   shellFaces(g, shellId, mesh)   adds one shell's faces
 *   edgeLoopPoints(g, loopId)       an IfcEdgeLoop as points (from geo-nurbs.js)
 * Faces on curved surfaces (IfcFaceSurface / IfcAdvancedFace on a cylinder, B-spline …) are tessellated by geo-nurbs.js.
 */

import { Mesh } from './geo-mesh.js';
import { sub, len } from './geo-math.js';
import { extrudeShapes } from './geo-solid.js';
import { surfaceFace, edgeLoopPoints } from './geo-nurbs.js';

export function brep(g, id) {
  const m = new Mesh();
  shellFaces(g, g.ref(g.a(id, 'Outer')), m);
  for (const v of g.refs(g.a(id, 'Voids'))) shellFaces(g, v, m);
  return m;
}

export function surfaceModel(g, id) {
  const m = new Mesh();
  const list = g.t(id) === 'IFCSHELLBASEDSURFACEMODEL' ? g.a(id, 'SbsmBoundary') : g.a(id, 'FbsmFaces');
  for (const s of g.refs(list)) shellFaces(g, s, m);
  return m;
}

export function shellFaces(g, shell, m) {
  if (shell === null) return;
  for (const f of g.refs(g.a(shell, 'CfsFaces'))) face(g, f, m);
}

function face(g, f, m) {
  if (surfaceFace(g, f, m)) return;
  const bounds = g.refs(g.a(f, 'Bounds'));
  if (!bounds.length) return;
  let outer = null;
  const holes = [];
  for (const b of bounds) {
    let pts = loopPoints(g, g.ref(g.a(b, 'Bound')));
    if (pts.length < 3) continue;
    if (g.bool(g.a(b, 'Orientation'), true) === false) pts = pts.reverse();
    if (g.t(b) === 'IFCFACEOUTERBOUND' && !outer) outer = pts;
    else holes.push(pts);
  }
  if (!outer) {
    // no bound marked outer: the largest is the outer one
    if (!holes.length) return;
    let best = 0, area = -1;
    holes.forEach((h, k) => { const a = ringArea(h); if (a > area) { area = a; best = k; } });
    outer = holes.splice(best, 1)[0];
  }
  if (g.t(f) === 'IFCFACESURFACE' || g.t(f) === 'IFCADVANCEDFACE') {
    if (g.bool(g.a(f, 'SameSense'), true) === false) { outer = outer.slice().reverse(); for (let k = 0; k < holes.length; k++) holes[k] = holes[k].slice().reverse(); }
  }
  // inner bounds run the other way round from the outer one
  m.polygon([outer, ...holes]);
}

function ringArea(r) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < r.length; i++) {
    const a = r[i], b = r[(i + 1) % r.length];
    x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return Math.hypot(x, y, z);
}

function loopPoints(g, loop) {
  const t = g.t(loop);
  if (t === 'IFCPOLYLOOP') return dedupe(g.refs(g.a(loop, 'Polygon')).map((p) => g.point(p)));
  if (t === 'IFCEDGELOOP') return edgeLoopPoints(g, loop);
  if (t === 'IFCVERTEXLOOP') return [];
  if (t) g.note(g.s.pretty(t) + ' face bounds are not drawn yet');
  return [];
}

function dedupe(pts) {
  const out = [];
  for (const p of pts) { const l = out[out.length - 1]; if (!l || len(sub(l, p)) > 1e-12) out.push(p); }
  if (out.length > 1 && len(sub(out[0], out[out.length - 1])) < 1e-12) out.pop();
  return out;
}

export { edgeLoopPoints };

/** IfcPolygonalFaceSet / IfcTriangulatedFaceSet. */
export function faceSet(g, id) {
  const m = new Mesh();
  const coords = g.a(g.ref(g.a(id, 'Coordinates')), 'CoordList');
  if (!Array.isArray(coords)) return m;
  const P = coords.map((p) => [g.num(p[0], 0), g.num(p[1], 0), g.num(p[2], 0)]);
  const pn = g.a(id, 'PnIndex');
  const map = Array.isArray(pn) && pn.length ? pn.map((v) => g.num(v, 1) - 1) : null;
  const pt = (k) => P[map ? map[k - 1] : k - 1];
  if (g.t(id) === 'IFCTRIANGULATEDFACESET' || g.t(id) === 'IFCTRIANGULATEDIRREGULARNETWORK') {
    const ci = g.a(id, 'CoordIndex') || [];
    const normals = g.a(id, 'Normals');
    const ni = g.a(id, 'NormalIndex');
    for (let t = 0; t < ci.length; t++) {
      const tri = ci[t];
      const a = pt(g.num(tri[0], 0)), b = pt(g.num(tri[1], 0)), c = pt(g.num(tri[2], 0));
      if (!a || !b || !c) continue;
      if (Array.isArray(normals) && normals.length && (!Array.isArray(ni) || ni.length)) {
        // per-vertex normals (NormalIndex in IFC4X3, else the same indexes as the points)
        const idx = Array.isArray(ni) && ni[t] ? ni[t].map((v) => g.num(v, 1)) : tri.map((v) => g.num(v, 1));
        const N = idx.map((k) => { const n = normals[k - 1]; return n ? [g.num(n[0], 0), g.num(n[1], 0), g.num(n[2], 1)] : null; });
        if (N.every(Boolean)) { m.addIndexed([a, b, c], [0, 1, 2], N); continue; }
      }
      m.tri(a, b, c);
    }
    return m;
  }
  for (const f of g.refs(g.a(id, 'Faces'))) {
    const outer = (g.a(f, 'CoordIndex') || []).map((k) => pt(g.num(k, 0))).filter(Boolean);
    const holes = (g.a(f, 'InnerCoordIndices') || []).map((h) => h.map((k) => pt(g.num(k, 0))).filter(Boolean));
    m.polygon([dedupe(outer), ...holes.map(dedupe)]);
  }
  return m;
}

/** IfcBoundingBox: a box from its corner. */
export function boundingBox(g, id) {
  const c = g.point(g.ref(g.a(id, 'Corner')));
  const x = g.num(g.a(id, 'XDim'), 0), y = g.num(g.a(id, 'YDim'), 0), z = g.num(g.a(id, 'ZDim'), 0);
  const m = extrudeShapes([{ outer: [[0, 0], [x, 0], [x, y], [0, y]], holes: [] }], [0, 0, 1], z);
  return m.transform([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c[0], c[1], c[2], 1]);
}
