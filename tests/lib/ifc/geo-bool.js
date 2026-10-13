/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-bool.js — booleans for cc-ifc: openings (IfcRelVoidsElement), IfcBooleanResult / IfcBooleanClippingResult and
 * half-spaces (IfcHalfSpaceSolid, IfcBoxedHalfSpace, IfcPolygonalBoundedHalfSpace). Solids are cut with manifold-3d
 * (Apache-2.0, the same build PartCraft ships), handed in once with setManifold(M) after `await Module(); M.setup()`.
 * Without it, or when a mesh is not a closed manifold (many exported breps are not), a half-space still cuts through
 * clipPlane() here (exact plane clipping with capped holes), and a solid that cannot be subtracted is left whole with a note.
 *
 *   setManifold(M) / hasManifold()
 *   boolean(op, a, b, g) → Mesh          op 'DIFFERENCE' | 'UNION' | 'INTERSECTION'; a, b in the same frame
 *   clipPlane(mesh, p, n) → Mesh         keeps the side n points to; the cut is capped where the mesh was closed
 *   subtractAll(base, cutters, g) → Mesh base minus each cutter in turn: with manifold-3d when everything is closed,
 *                                        else each convex cutter is cut out of the triangles exactly (no reveal faces)
 *   convexPlanes(mesh) → planes | null   the face planes of a convex mesh (outward), null when it is not convex
 *   halfSpaceCut(g, base, hsId) → Mesh   base minus the half-space solid (in base's frame)
 */

import { Mesh } from './geo-mesh.js';
import { sub, dot, cross, norm, add, scale, apply, invert, len, perp } from './geo-math.js';
import { planeTriangulate } from './geo-tri.js';
import { extrudeShapes } from './geo-solid.js';
import { curvePoints } from './geo-curve.js';

let M = null;
export function setManifold(mod) { M = mod || null; }
export function hasManifold() { return !!M; }

function toManifold(mesh) {
  const { pos, idx } = mesh.welded(1e-6 * scaleOf(mesh));
  if (!idx.length) return null;
  const mm = new M.Mesh({ numProp: 3, vertProperties: Float32Array.from(pos), triVerts: Uint32Array.from(idx) });
  mm.merge();
  let man;
  try { man = new M.Manifold(mm); } catch (e) { return null; }
  const st = typeof man.status === 'function' ? man.status() : 'NoError';
  if (st !== 'NoError') { man.delete?.(); return null; }
  return man;
}

function scaleOf(mesh) {
  const b = mesh.bounds();
  if (!b) return 1;
  return Math.max(1e-9, Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]));
}

function fromManifold(man) {
  const mm = man.getMesh();
  const out = Mesh.fromWelded(mm.vertProperties, mm.triVerts);
  return out;
}

/** a OP b with manifold-3d, both meshes shifted near the origin first (float precision). null when it cannot. */
export function boolean(op, a, b, g = null) {
  if (!M || a.isEmpty) return op === 'UNION' ? new Mesh().append(a).append(b) : null;
  if (b.isEmpty) return op === 'INTERSECTION' ? new Mesh() : a;
  const ba = a.bounds();
  const c = [(ba.min[0] + ba.max[0]) / 2, (ba.min[1] + ba.max[1]) / 2, (ba.min[2] + ba.max[2]) / 2];
  const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -c[0], -c[1], -c[2], 1];
  const Tb = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c[0], c[1], c[2], 1];
  const A = toManifold(new Mesh().append(a, T));
  if (!A) return null;
  const B = toManifold(new Mesh().append(b, T));
  if (!B) { A.delete?.(); return null; }
  let R;
  try {
    R = op === 'DIFFERENCE' ? A.subtract(B) : op === 'UNION' ? A.add(B) : A.intersect(B);
    const out = fromManifold(R).transform(Tb);
    return out;
  } catch (e) { if (g) g.note('A boolean could not be computed'); return null; }
  finally { A.delete?.(); B.delete?.(); R?.delete?.(); }
}

/** base minus every cutter (all in one frame). Never throws; a cutter that cannot be removed is noted and skipped. */
export function subtractAll(base, cutters, g = null) {
  if (!cutters.length || base.isEmpty) return base;
  if (M) {
    const bb = base.bounds();
    const c = [(bb.min[0] + bb.max[0]) / 2, (bb.min[1] + bb.max[1]) / 2, (bb.min[2] + bb.max[2]) / 2];
    const T = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, -c[0], -c[1], -c[2], 1];
    const Tb = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, c[0], c[1], c[2], 1];
    let A = toManifold(new Mesh().append(base, T));
    if (A) {
      const rest = [];
      for (const cut of cutters) {
        const B = toManifold(new Mesh().append(cut, T));
        if (!B) { rest.push(cut); continue; }
        try { const R = A.subtract(B); A.delete?.(); A = R; } catch (e) { rest.push(cut); }
        B.delete?.();
      }
      let out = fromManifold(A).transform(Tb);
      A.delete?.();
      for (const cut of rest) out = convexCut(out, cut, g);
      return out;
    }
  }
  let out = base;
  for (const cut of cutters) out = convexCut(out, cut, g);
  return out;
}

/** Outward face planes [{ n, d }] of a convex closed mesh (n · p ≤ d inside), or null when it is not convex. */
export function convexPlanes(mesh, tol = 1e-6) {
  const P = mesh.pos, I = mesh.idx;
  const b = mesh.bounds();
  if (!b) return null;
  const size = Math.max(1e-9, len(sub(b.max, b.min)));
  const eps = size * tol;
  const planes = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = [P[I[t] * 3], P[I[t] * 3 + 1], P[I[t] * 3 + 2]], bb = [P[I[t + 1] * 3], P[I[t + 1] * 3 + 1], P[I[t + 1] * 3 + 2]], c = [P[I[t + 2] * 3], P[I[t + 2] * 3 + 1], P[I[t + 2] * 3 + 2]];
    const cr = cross(sub(bb, a), sub(c, a));
    if (len(cr) < eps * eps) continue;
    const n = norm(cr), d = dot(n, a);
    if (planes.some((q) => dot(q.n, n) > 1 - 1e-9 && Math.abs(q.d - d) < eps)) continue;
    planes.push({ n, d });
  }
  if (planes.length < 4) return null;
  for (let i = 0; i < P.length; i += 3) for (const q of planes) if (q.n[0] * P[i] + q.n[1] * P[i + 1] + q.n[2] * P[i + 2] - q.d > eps * 10) return null;
  return planes;
}

/** base minus a convex cutter, on the triangles themselves (works on open or broken meshes; leaves the hole open). */
function convexCut(base, cutter, g) {
  const planes = convexPlanes(cutter);
  if (!planes) { if (g) g.note('An opening could not be cut (neither the element nor the opening is a closed convex solid)'); return base; }
  const out = new Mesh();
  const P = base.pos, N = base.nrm, I = base.idx;
  for (let t = 0; t < I.length; t += 3) {
    const ids = [I[t], I[t + 1], I[t + 2]];
    let poly = ids.map((k) => [P[k * 3], P[k * 3 + 1], P[k * 3 + 2]]);
    const nrm = [N[ids[0] * 3], N[ids[0] * 3 + 1], N[ids[0] * 3 + 2]];
    // quick reject: a triangle wholly outside one plane is kept as it is
    if (planes.some((q) => poly.every((p) => dot(q.n, p) - q.d >= 0))) { const b0 = out.vertexCount; for (const p of poly) out.vertex(p, nrm); out.idx.push(b0, b0 + 1, b0 + 2); continue; }
    for (const q of planes) {
      const [front, back] = splitPoly(poly, q);
      if (front.length >= 3) { const b0 = out.vertexCount; for (const p of front) out.vertex(p, nrm); for (let k = 1; k + 1 < front.length; k++) out.idx.push(b0, b0 + k, b0 + k + 1); }
      poly = back;
      if (poly.length < 3) break;
    }
  }
  return out;
}

/** Split a convex polygon by plane q: [part with n·p ≥ d, part with n·p < d]. */
function splitPoly(poly, q) {
  const front = [], back = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = dot(q.n, a) - q.d, db = dot(q.n, b) - q.d;
    if (da >= 0) front.push(a); else back.push(a);
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db);
      const x = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
      front.push(x); back.push(x);
    }
  }
  return [front, back];
}

/**
 * Keep the part of `mesh` on the side of the plane (point p, normal n) that n points to. Triangles are split exactly;
 * cut edges are chained into loops and capped (outer loops and the holes inside them) when they close.
 */
export function clipPlane(mesh, p, n) {
  n = norm(n);
  const out = new Mesh();
  const P = mesh.pos, N = mesh.nrm, I = mesh.idx;
  const sd = new Float64Array(P.length / 3);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < sd.length; i++) { const d = (P[i * 3] - p[0]) * n[0] + (P[i * 3 + 1] - p[1]) * n[1] + (P[i * 3 + 2] - p[2]) * n[2]; sd[i] = d; if (d < lo) lo = d; if (d > hi) hi = d; }
  const span = Math.max(1e-9, hi - lo);
  const eps = span * 1e-9;
  if (lo >= -eps) return out.append(mesh);
  if (hi <= eps) return out;
  const segs = [];
  const v = (i) => [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]];
  const nv = (i) => [N[i * 3], N[i * 3 + 1], N[i * 3 + 2]];
  const lerp = (i, j) => { const t = sd[i] / (sd[i] - sd[j]); const a = v(i), b = v(j); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  for (let t = 0; t < I.length; t += 3) {
    const ids = [I[t], I[t + 1], I[t + 2]];
    const inside = ids.map((i) => sd[i] >= -eps);
    const k = inside.filter(Boolean).length;
    const fn = nv(ids[0]);
    const emit = (pts) => { const base = out.vertexCount; for (const q of pts) out.vertex(q, fn); for (let s = 1; s + 1 < pts.length; s++) out.idx.push(base, base + s, base + s + 1); };
    if (k === 3) { emit(ids.map(v)); continue; }
    if (k === 0) continue;
    // walk the triangle's edges, keeping the inside part
    const poly = [], cut = [];
    for (let e = 0; e < 3; e++) {
      const i = ids[e], j = ids[(e + 1) % 3];
      const ii = sd[i] >= -eps, jj = sd[j] >= -eps;
      if (ii) poly.push(v(i));
      if (ii !== jj && Math.abs(sd[i]) > eps && Math.abs(sd[j]) > eps) { const q = lerp(i, j); poly.push(q); cut.push(q); }
      else if (ii && !jj && Math.abs(sd[i]) <= eps) cut.push(v(i));
      else if (!ii && jj && Math.abs(sd[j]) <= eps) cut.push(v(j));
    }
    if (poly.length >= 3) emit(poly);
    if (cut.length === 2) segs.push(cut);
  }
  capLoops(out, segs, scale(n, -1), eps * 10 + span * 1e-7);
  return out;
}

/** Chain cut segments into closed loops on the plane and fill them (normal `cn`, facing out of the kept part). */
function capLoops(out, segs, cn, tol) {
  if (!segs.length) return;
  const key = (q) => Math.round(q[0] / tol) + ',' + Math.round(q[1] / tol) + ',' + Math.round(q[2] / tol);
  const adj = new Map();
  for (const [a, b] of segs) {
    const ka = key(a), kb = key(b);
    if (ka === kb) continue;
    if (!adj.has(ka)) adj.set(ka, { p: a, to: [] });
    if (!adj.has(kb)) adj.set(kb, { p: b, to: [] });
    adj.get(ka).to.push(kb); adj.get(kb).to.push(ka);
  }
  const used = new Set(), loops = [];
  const ek = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  for (const [start] of adj) {
    for (const first of adj.get(start).to) {
      if (used.has(ek(start, first))) continue;
      const loop = [adj.get(start).p];
      used.add(ek(start, first));
      let prev = start, cur = first, guard = 0;
      while (cur !== start && guard++ < 1e6) {
        loop.push(adj.get(cur).p);
        const nxt = adj.get(cur).to.find((x) => x !== prev && !used.has(ek(cur, x)));
        if (!nxt) break;
        used.add(ek(cur, nxt));
        prev = cur; cur = nxt;
      }
      if (cur === start && loop.length >= 3) loops.push(loop);
    }
  }
  if (!loops.length) return;
  // 2D frame on the plane; loops CCW about cn are outers, nesting decides holes
  const u = perp(cn), w = cross(cn, u);
  const to2 = (q) => [dot(q, u), dot(q, w)];
  const L = loops.map((l) => { const p2 = l.map(to2); let a = 0; for (let i = 0; i < p2.length; i++) { const x = p2[i], y = p2[(i + 1) % p2.length]; a += x[0] * y[1] - y[0] * x[1]; } return { l, p2, area: Math.abs(a / 2), ccw: a > 0 }; });
  L.sort((x, y) => y.area - x.area);
  const inside = (pt, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
  const depth = L.map((x, i) => L.slice(0, i).filter((y) => inside(x.p2[0], y.p2)).length);
  for (let i = 0; i < L.length; i++) {
    if (depth[i] % 2) continue;
    const outer = L[i].ccw ? L[i].l : L[i].l.slice().reverse();
    const holes = [];
    for (let j = i + 1; j < L.length; j++) if (depth[j] === depth[i] + 1 && inside(L[j].p2[0], L[i].p2)) holes.push(L[j].ccw ? L[j].l.slice().reverse() : L[j].l);
    const rings = [outer, ...holes];
    const tris = planeTriangulate(rings);
    const base = out.vertexCount;
    for (const r of rings) for (const q of r) out.vertex(q, cn);
    for (let k = 0; k < tris.length; k += 3) out.idx.push(base + tris[k], base + tris[k + 1], base + tris[k + 2]);
  }
}

/** The plane of an IfcHalfSpaceSolid's BaseSurface (IfcPlane) and the side its material is on. */
function halfSpacePlane(g, hs) {
  const surf = g.ref(g.a(hs, 'BaseSurface'));
  const pos = g.axis2(g.ref(g.a(surf, 'Position')));
  const p = [pos[12], pos[13], pos[14]], n = norm([pos[8], pos[9], pos[10]]);
  // AgreementFlag TRUE: the plane's normal points away from the half-space's material
  const agree = g.bool(g.a(hs, 'AgreementFlag'), true);
  return { p, n: agree ? n : scale(n, -1), pos };
}

/** base − half-space solid (the half-space's material is behind its outward normal n: keep what n points to). */
export function halfSpaceCut(g, base, hs) {
  const t = g.t(hs);
  if (g.t(g.ref(g.a(hs, 'BaseSurface'))) !== 'IFCPLANE') { g.note('Half-spaces on curved surfaces are not cut yet'); return base; }
  const { p, n } = halfSpacePlane(g, hs);
  if (t === 'IFCHALFSPACESOLID' || t === 'IFCBOXEDHALFSPACE') return clipPlane(base, p, n);
  if (t === 'IFCPOLYGONALBOUNDEDHALFSPACE') {
    const P = g.axis2(g.ref(g.a(hs, 'Position')));
    const ring = curvePoints(g, g.ref(g.a(hs, 'PolygonalBoundary'))).map((q) => [q[0], q[1]]);
    if (ring.length > 1 && Math.abs(ring[0][0] - ring[ring.length - 1][0]) < 1e-9 && Math.abs(ring[0][1] - ring[ring.length - 1][1]) < 1e-9) ring.pop();
    if (ring.length < 3) return clipPlane(base, p, n);
    const bb = base.bounds();
    const L = bb ? 4 * Math.max(1, len(sub(bb.max, bb.min))) + len(sub([P[12], P[13], P[14]], bb.min)) : 1e6;
    // the bounded half-space as a closed solid: the prism over the boundary, long enough, cut by the plane
    const prism = extrudeShapes([{ outer: ring, holes: [] }], [0, 0, 1], 2 * L).transform([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -L, 1]).transform(P);
    const solid = clipPlane(prism, p, scale(n, -1));
    const r = boolean('DIFFERENCE', base, solid, g);
    if (r) return r;
    // not a closed manifold: cut by the plane only where the triangles lie over the boundary
    const Pi = invert(P);
    const inPrism = (q) => { const l = apply(Pi, q[0], q[1], q[2]); let c = false; for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) { const a = ring[i], b = ring[j]; if ((a[1] > l[1]) !== (b[1] > l[1]) && l[0] < (b[0] - a[0]) * (l[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };
    const cut = clipPlane(base, p, n), keepOut = new Mesh();
    // keep triangles outside the boundary from the uncut mesh, inside it from the cut one
    splitBy(base, (c) => !inPrism(c), keepOut);
    splitBy(cut, (c) => inPrism(c), keepOut);
    g.note('A bounded half-space was cut approximately (the mesh is not closed)');
    return keepOut;
  }
  g.note(g.s.pretty(t) + ' is not cut yet');
  return base;
}

function splitBy(mesh, test, into) {
  const P = mesh.pos, I = mesh.idx;
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const cen = [(P[a] + P[b] + P[c]) / 3, (P[a + 1] + P[b + 1] + P[c + 1]) / 3, (P[a + 2] + P[b + 2] + P[c + 2]) / 3];
    if (!test(cen)) continue;
    const base = into.vertexCount;
    for (const k of [I[t], I[t + 1], I[t + 2]]) into.vertex([P[k * 3], P[k * 3 + 1], P[k * 3 + 2]], [mesh.nrm[k * 3], mesh.nrm[k * 3 + 1], mesh.nrm[k * 3 + 2]]);
    into.idx.push(base, base + 1, base + 2);
  }
}

export { add };
