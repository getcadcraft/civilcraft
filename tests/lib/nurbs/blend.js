/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * blend.js — cc-nurbs (0.9 SU.747c, session `nurbs-s3-09`): FILLETS between two faces of a NURBS solid (constant or variable
 * radius) and THICKENING a surface into a solid. DOM-free; the fillet's Boolean uses the mesh engine handed in (manifold-3d), never
 * imported here. Written from the plain definitions (a rolling ball touching two faces; an offset surface along the normal); no kernel's
 * code read.
 *
 * Fillet (rolling ball):
 *   1. The edge where the two faces meet is found in the sewn solid (solid.sew) and every point of it is put on BOTH exact surfaces
 *      (alternating closest points). The edge is cut into stations by arc length.
 *   2. At each station the ball of radius r(s) (constant, or linear from `radius` to `radius2` along the edge) is placed in the plane
 *      square to the edge so that it touches both faces: its centre c solves (c − pA)·nA = σr, (c − pB)·nB = σr, (c − E)·T = 0 with
 *      pA, pB the closest points of c on the two exact surfaces, repeated until c stops moving (σ = −1 on a convex edge: the ball is
 *      inside the solid; +1 on a concave one). A ball that does not fit is REFUSED with the face it fails on (`nurbs.err.fillet_radius`):
 *      its touch point falls off the face, the face curves tighter than r towards the ball, or the iteration does not settle.
 *   3. Each station's section is the exact circular arc from pA to pB about c (a rational quadratic); the fillet surface is the loft
 *      through the sections (homogeneous points, so each section stays exact). Its DEVIATION FROM THE IDEAL ROLLING-BALL SURFACE is
 *      measured half-way between stations (the exact arc there against the lofted surface's closest points) and stations are doubled
 *      until it is within tol / 4 (at most MAX_STATIONS). Tangency to both faces is measured too (the largest normal angle, degrees).
 *   4. The fillet becomes a closed tool solid (the fillet surface, two ruled walls along the touch lines going away from the ball, an
 *      outer ruled face and two end caps past the edge's ends) that is subtracted from the solid (convex edge) or added to it (concave)
 *      with solid.boolean — so the faces at the edge's ends are cut by the fillet surface, the two faces are trimmed along the touch
 *      lines, and the result is measured as every Boolean is (deviation, residual, sewn again from the exact faces).
 *
 *   fillet(M, doc, solidId, faceA, faceB, { radius, radius2, tol, name }) → { doc, id, report }
 *     report = solid.boolean's report + fillet { radius, radius2, convex, length, closedEdge, stations, deviation (mm), tangent
 *     (degrees), face (the fillet face ids) }
 *     NurbsError nurbs.err.fillet_face | fillet_edge | fillet_edges | fillet_size | fillet_radius (+ solid.boolean's)
 *   rollingBall(A, B, E, T, r, σ, { uvA, uvB, sA, sB }) → { c, pA, pB, uvA, uvB } | null   (one station; exported for tests)
 *
 * Thicken:
 *   thicken(doc, surfaceId, { thickness, side (1 along the surface normal Su × Sv, −1 against it), tol, fitTol, name })
 *     → { doc, id, report }   the surface, its offset (construct.offset: fitted, deviation measured) carrying the same trim, and
 *     ruled side walls along every boundary (none along a seam or a pole) sewn into one solid.
 *     report = { thickness, side, fit (offset's fitted deviation), offset (largest | distance to the surface − thickness | measured at
 *     points between the fitting samples), minRadius (tightest curvature on the offset side), volume, area, closed, faces }
 *     Refused, naming the surface: `nurbs.err.thicken_fold` (the surface curves tighter than the thickness towards the offset side: the
 *     offset folds) and `nurbs.err.thicken_self` (another part of the surface lies closer than the thickness: the offset would cross it).
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as K from './construct.js';
import * as F from './fit.js';
import * as T from './trim.js';
import * as V from './vec.js';
import * as B from './solid.js';

const { fail } = C;
export const MAX_STATIONS = 257;
const DEG = 180 / Math.PI;

// ------------------------------------------------------------------------------------------------ helpers

/** A point where two faces meet, on both exact surfaces (alternating closest points, averaged). */
function meet(A, Bs, p, uvA, uvB, size) {
  let q = p, a = uvA, b = uvB, pa = null, pb = null;
  for (let it = 0; it < 40; it++) {
    const ra = S.closestPoint(A, q, a ? { uv0: a } : {}), rb = S.closestPoint(Bs, q, b ? { uv0: b } : {});
    a = [ra.u, ra.v]; b = [rb.u, rb.v]; pa = ra.point; pb = rb.point;
    const n = V.lerp(pa, pb, 0.5), moved = V.dist(n, q);
    q = n;
    if (moved < 1e-12 * size) break;
  }
  return { p: q, uvA: a, uvB: b, gap: V.dist(pa, pb) };
}

/** Outward normal of a face at (u, v): the surface normal times the face's sign. */
const nOut = (s, sign, u, v) => V.mul(S.normal(s, u, v), sign);

/** One ball: centre in the plane through E square to T, touching surface A and surface B on the side σ (−1: against the outward
 *  normals, i.e. inside the solid). null when it does not settle or a touch point is not a true foot (it fell off the patch). */
export function rollingBall(A, Bs, E, Tg, r, sigma, { uvA = null, uvB = null, sA = 1, sB = 1, size = 100 } = {}) {
  let a = uvA, b = uvB;
  let nA = nOut(A, sA, ...(a || [S.closestPoint(A, E).u, S.closestPoint(A, E).v])), nB = nOut(Bs, sB, ...(b || [S.closestPoint(Bs, E).u, S.closestPoint(Bs, E).v]));
  // first guess: the tangent planes through E
  const plane = (pa, na, pb, nb) => V.solve([na, nb, Tg], [[V.dot(na, pa) + sigma * r], [V.dot(nb, pb) + sigma * r], [V.dot(Tg, E)]]);
  let X = plane(E, nA, E, nB);
  if (!X) return null;
  let c = X.map((x) => x[0]), pa = null, pb = null, ok = false;
  for (let it = 0; it < 60; it++) {
    const ra = S.closestPoint(A, c, a ? { uv0: a } : {}), rb = S.closestPoint(Bs, c, b ? { uv0: b } : {});
    a = [ra.u, ra.v]; b = [rb.u, rb.v]; pa = ra.point; pb = rb.point;
    nA = nOut(A, sA, a[0], a[1]); nB = nOut(Bs, sB, b[0], b[1]);
    X = plane(pa, nA, pb, nB);
    if (!X) return null;
    const cn = X.map((x) => x[0]), moved = V.dist(cn, c);
    c = cn;
    if (moved < 1e-11 * size) { ok = true; break; }
  }
  if (!ok) return null;
  // a true foot: the ball's centre lies along the face's normal at its touch point, at distance r, on the side asked for
  const foot = (p, n) => { const d = V.sub(c, p); return Math.abs(V.len(d) - r) <= 1e-6 * Math.max(r, 1) && V.angle(d, V.mul(n, sigma)) <= 1e-5; };
  return { c, pA: pa, pB: pb, uvA: a, uvB: b, okA: foot(pa, nA), okB: foot(pb, nB), nA, nB };
}

/** Chain the edge where face ia meets face ib in a sewn solid: [{ a, b, t (A's triangle), third }] → ordered vertex lists. */
function edgeChains(sw, ia, ib) {
  const dir = new Map(), segs = [];
  const key = (a, b) => a * 4294967296 + b;
  for (let t = 0; t < sw.triangles; t++) for (let k = 0; k < 3; k++) dir.set(key(sw.tris[t * 3 + k], sw.tris[t * 3 + (k + 1) % 3]), { t, k });
  for (let t = 0; t < sw.triangles; t++) {
    if (sw.triFace[t] !== ia) continue;
    for (let k = 0; k < 3; k++) {
      const a = sw.tris[t * 3 + k], b = sw.tris[t * 3 + (k + 1) % 3], tw = dir.get(key(b, a));
      if (!tw || sw.triFace[tw.t] !== ib) continue;
      segs.push({ a, b, t, k, tw, third: sw.tris[t * 3 + (k + 2) % 3] });
    }
  }
  const from = new Map();
  for (const s of segs) from.set(s.a, s);
  const used = new Set(), chains = [];
  // open chains start where no segment ends
  const ends = new Set(segs.map((s) => s.b));
  const starts = [...segs.filter((s) => !ends.has(s.a)), ...segs];
  for (const s0 of starts) {
    if (used.has(s0)) continue;
    const list = [];
    let s = s0, closed = false;
    while (s && !used.has(s)) { used.add(s); list.push(s); s = from.get(s.b); if (s === s0) { closed = true; break; } }
    chains.push({ segs: list, closed });
  }
  return chains;
}

/** A7.1's circular arc with a fixed number of pieces, so every section of a loft has the same knots and the same kind of control points
 *  (C.arc picks the count from the angle: one section at 89.9999° and the next at 90.0001° would not match). */
function arcIn(center, xAxis, yAxis, r, th, pieces) {
  const X = V.norm(xAxis), Y = V.norm(yAxis), dth = th / pieces, w1 = Math.cos(dth / 2);
  const at = (a) => V.add(center, V.add(V.mul(X, r * Math.cos(a)), V.mul(Y, r * Math.sin(a))));
  const cvs = [at(0)], w = [1];
  for (let i = 1; i <= pieces; i++) { const a0 = dth * (i - 1), a1 = dth * i; cvs.push(V.add(center, V.mul(V.add(V.mul(X, Math.cos((a0 + a1) / 2)), V.mul(Y, Math.sin((a0 + a1) / 2))), r / w1)), at(a1)); w.push(w1, 1); }
  const knots = [0, 0, 0];
  for (let i = 1; i < pieces; i++) knots.push(i / pieces, i / pieces);
  knots.push(1, 1, 1);
  return { deg: 2, knots, cvs, w };
}

// ------------------------------------------------------------------------------------------------ fillet

export function fillet(M, doc, solidId, faceA, faceB, opts = {}) {
  const pr = prepare(doc, solidId, faceA, faceB, opts), { tol = B.TOL, name = '' } = opts;
  const res = B.boolean(M, pr.doc, solidId, pr.toolId, pr.convex ? 'subtract' : 'union', { tol, name: name || pr.sol.name || '', tangent: pr.tangentTo });
  return finish(pr, res, pr.sw.volume, solidId);
}

/**
 * The first half of a fillet: everything up to the closed tool solid, which is added to the patch set (not yet used). The tool depends
 * only on the two faces' own surfaces and the sewn solid, so several of them can be prepared on the same solid and cut one after the other
 * (filletEdges). → { doc (with the tool), toolId, convex, tangentTo, sw, sol, report parts }
 */
function prepare(doc, solidId, faceA, faceB, { radius = 5, radius2 = null, tol = B.TOL, name = '' } = {}) {
  const r0 = radius, r1 = radius2 == null ? radius : radius2;
  if (!(Number.isFinite(r0) && r0 > 0 && Number.isFinite(r1) && r1 > 0)) fail('nurbs.err.fillet_size');
  const sol = B.solid(doc, solidId) || fail('nurbs.err.no_solid', { id: solidId });
  const faces = B.facesOf(doc, solidId);
  const ia = faces.findIndex((f) => f.id === faceA), ib = faces.findIndex((f) => f.id === faceB);
  if (ia < 0) fail('nurbs.err.fillet_face', { id: faceA, solid: sol.name || sol.id });
  if (ib < 0 || ib === ia) fail('nurbs.err.fillet_face', { id: faceB, solid: sol.name || sol.id });
  const FA = faces[ia], FB = faces[ib], A = FA.surface, Bs = FB.surface;
  const nameA = FA.name || FA.id, nameB = FB.name || FB.id;
  const sw = B.sew(faces, { tol });
  if (!sw.closed) fail('nurbs.err.solid_open', { name: sol.name || sol.id, edges: sw.openEdges + sw.nonManifold, gap: Math.round(sw.gap * 1e4) / 1e4, tol });
  const chains = edgeChains(sw, ia, ib);
  if (!chains.length) fail('nurbs.err.fillet_edge', { a: nameA, b: nameB });
  if (chains.length > 1) fail('nurbs.err.fillet_edges', { a: nameA, b: nameB, n: chains.length });
  const { segs, closed } = chains[0];
  const P = sw.positions, pos = (v) => [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]];
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], P[i + k]); hi[k] = Math.max(hi[k], P[i + k]); }
  const size = Math.max(1e-9, V.dist(lo, hi));

  // the outward sign of each face's surface normal (the sewn mesh is outward)
  const signOf = (fi) => {
    let s = 0;
    for (let t = 0; t < sw.triangles && Math.abs(s) < 20; t++) {
      if (sw.triFace[t] !== fi) continue;
      const p = [0, 1, 2].map((j) => pos(sw.tris[t * 3 + j]));
      const g = V.cross(V.sub(p[1], p[0]), V.sub(p[2], p[0]));
      if (V.len(g) < 1e-12 * size * size) continue;
      const u = (sw.cornerUV[t * 6] + sw.cornerUV[t * 6 + 2] + sw.cornerUV[t * 6 + 4]) / 3, v = (sw.cornerUV[t * 6 + 1] + sw.cornerUV[t * 6 + 3] + sw.cornerUV[t * 6 + 5]) / 3;
      s += Math.sign(V.dot(g, S.normal(faces[fi].surface, u, v)));
    }
    return s >= 0 ? 1 : -1;
  };
  const sA = signOf(ia), sB = signOf(ib);

  // the edge on both exact surfaces
  const uvOf = (t, j) => [sw.cornerUV[t * 6 + j * 2], sw.cornerUV[t * 6 + j * 2 + 1]];
  const raw = segs.map((s) => ({ v: s.a, uvA: uvOf(s.t, s.k), uvB: uvOf(s.tw.t, (s.tw.k + 1) % 3) }));
  if (!closed) { const s = segs[segs.length - 1]; raw.push({ v: s.b, uvA: uvOf(s.t, (s.k + 1) % 3), uvB: uvOf(s.tw.t, s.tw.k) }); }
  const pts = raw.map((q) => ({ ...meet(A, Bs, pos(q.v), q.uvA, q.uvB, size) }));
  const endFaces = (v) => { const out = new Set(); for (let t = 0; t < sw.triangles; t++) for (let j = 0; j < 3; j++) if (sw.tris[t * 3 + j] === v && sw.triFace[t] !== ia && sw.triFace[t] !== ib) out.add(sw.triFace[t]); return [...out]; };
  if (!closed) for (const [k, v] of [[0, segs[0].a], [pts.length - 1, segs[segs.length - 1].b]]) {
    // an end of the edge is a corner: on A, on B and on the face(s) there (alternating closest points), not a mesh vertex near it
    const list = [A, Bs, ...endFaces(v).map((fi) => faces[fi].surface)], uvs = list.map(() => null);
    let q = pts[k].p;
    uvs[0] = pts[k].uvA; uvs[1] = pts[k].uvB;
    for (let it = 0; it < 60; it++) {
      const ps = list.map((sf, i) => { const r = S.closestPoint(sf, q, uvs[i] ? { uv0: uvs[i] } : {}); uvs[i] = [r.u, r.v]; return r.point; });
      const nq = [0, 1, 2].map((c) => ps.reduce((x, y) => x + y[c], 0) / ps.length), moved = V.dist(nq, q);
      q = nq;
      if (moved < 1e-13 * size) break;
    }
    pts[k] = { p: q, uvA: uvs[0], uvB: uvs[1], gap: 0, ends: endFaces(v) };
  }
  if (closed) pts.push(pts[0]);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + V.dist(pts[i].p, pts[i - 1].p));
  const L = cum[cum.length - 1];
  if (!(L > 1e-9 * size)) fail('nurbs.err.fillet_edge', { a: nameA, b: nameB });
  const at = (s) => {   // a point of the edge at arc length s, on both surfaces, with its tangent
    let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
    const f = Math.min(1, Math.max(0, (s - cum[i - 1]) / Math.max(1e-300, cum[i] - cum[i - 1])));
    const p0 = pts[i - 1], p1 = pts[i];
    const m = meet(A, Bs, V.lerp(p0.p, p1.p, f), p0.uvA, p0.uvB, size);
    const nA = nOut(A, sA, ...m.uvA), nB = nOut(Bs, sB, ...m.uvB);
    let Tg = V.norm(V.cross(nA, nB));
    if (V.len(Tg) < 0.5) Tg = V.norm(V.sub(p1.p, p0.p));   // tangent faces: the chain's own direction
    if (V.dot(Tg, V.sub(p1.p, p0.p)) < 0) Tg = V.mul(Tg, -1);
    return { E: m.p, T: Tg, uvA: m.uvA, uvB: m.uvB, nA, nB };
  };
  // convex or concave: does face A leave the edge below face B's tangent plane?
  const mid = segs[Math.floor(segs.length / 2)];
  const em = V.lerp(pos(mid.a), pos(mid.b), 0.5), st = at(cum[Math.floor(segs.length / 2)] + 0.5 * V.dist(pos(mid.a), pos(mid.b)));
  const convex = V.dot(V.sub(pos(mid.third), em), st.nB) < 0;
  const sigma = convex ? -1 : 1;
  if (!convex && !closed) {
    // the added piece stops at the section square to the edge at each end: right only where the end face is flat and square to it
    for (const [k, s0] of [[0, 0], [pts.length - 1, L]]) {
      const e = at(s0), ends = pts[k].ends;
      const flat = ends.some((fi) => faces[fi].surface.cvs.every((row) => row.every((p) => Math.abs(V.dot(V.sub(p, pts[k].p), e.T)) <= 1e-7 * size)));
      if (!flat) { const fi = ends[0]; fail('nurbs.err.fillet_end', { name: fi === undefined ? nameA : faces[fi].name || faces[fi].id }); }
    }
  }
  const rAt = (s) => r0 + (r1 - r0) * (closed ? 0 : s / L);
  if (closed && Math.abs(r1 - r0) > 1e-12) fail('nurbs.err.fillet_closed_var');

  const ballAt = (s, prev) => {
    const e = at(s), r = rAt(s);
    const b = rollingBall(A, Bs, e.E, e.T, r, sigma, { uvA: prev ? prev.uvA : e.uvA, uvB: prev ? prev.uvB : e.uvB, sA, sB, size });
    const end = !closed && (s <= 1e-9 * L || s >= L * (1 - 1e-9));
    if (!b) fail('nurbs.err.fillet_radius', { name: nameA + ', ' + nameB, radius: Math.round(r * 1e4) / 1e4 });
    if (!b.okA) fail('nurbs.err.fillet_radius', { name: nameA, radius: Math.round(r * 1e4) / 1e4 });
    if (!b.okB) fail('nurbs.err.fillet_radius', { name: nameB, radius: Math.round(r * 1e4) / 1e4 });
    if (!end) {   // inside the edge, the touch points must lie on the faces as trimmed
      if (!T.contains(A, FA.trim || null, b.uvA[0], b.uvA[1])) fail('nurbs.err.fillet_radius', { name: nameA, radius: Math.round(r * 1e4) / 1e4 });
      if (!T.contains(Bs, FB.trim || null, b.uvB[0], b.uvB[1])) fail('nurbs.err.fillet_radius', { name: nameB, radius: Math.round(r * 1e4) / 1e4 });
    }
    // a face that curves towards the ball tighter than r: the ball cannot roll there
    for (const [s0, sg, uv, nm] of [[A, sA, b.uvA, nameA], [Bs, sB, b.uvB, nameB]]) {
      const across = V.norm(V.cross(e.T, nOut(s0, sg, uv[0], uv[1])));
      const k = S.normalCurvature(s0, uv[0], uv[1], across) * sg * sigma;   // > 0: bends towards the ball
      if (k * r >= 1 - 1e-9) fail('nurbs.err.fillet_radius', { name: nm, radius: Math.round(r * 1e4) / 1e4 });
    }
    return { s, r, ...b, E: e.E, T: e.T };
  };
  let pieces = null;
  const section = (b) => {
    const x = V.sub(b.pA, b.c), y0 = V.sub(b.pB, b.c);
    const yv = V.sub(y0, V.mul(V.norm(x), V.dot(y0, V.norm(x))));
    const ang = V.angle(x, y0);
    if (!(ang > 1e-6) || V.len(yv) < 1e-12 * size) fail('nurbs.err.fillet_radius', { name: nameA + ', ' + nameB, radius: Math.round(b.r * 1e4) / 1e4 });
    if (pieces == null) pieces = ang < 0.6 * Math.PI ? 1 : ang < 1.2 * Math.PI ? 2 : 3;   // one count for every section of this fillet
    return arcIn(b.c, x, yv, b.r, ang, pieces);
  };

  // stations: doubled until the lofted surface is within tol / 4 of the exact rolling-ball arcs half-way between them
  let n = Math.max(4, Math.min(64, Math.ceil(L / Math.max(tol * 40, Math.min(r0, r1)))));
  let balls = null, Fs = null, dev = Infinity, tParams = null, ext = 0;
  const cache = new Map();
  const ballCached = (s, prev) => { const k = s.toFixed(12); if (!cache.has(k)) cache.set(k, ballAt(s, prev)); return cache.get(k); };
  for (;;) {
    balls = [];
    for (let i = 0; i <= n; i++) {
      const s = closed && i === n ? 0 : L * i / n;
      balls.push(closed && i === n ? balls[0] : ballCached(s, balls[i - 1] || null));
    }
    let secs = balls.map(section);
    // a concave edge's tool is ADDED: nothing of it may stick out past the ends (the end faces are checked square to the edge, below)
    ext = closed || !convex ? 0 : 2 * Math.max(...balls.map((b) => b.r + V.dist(b.E, b.c))) + 10 * tol;
    let t = balls.map((b, i) => (closed && i === n ? 1 : b.s / L));
    let d0 = null, d1 = null;
    if (!closed && ext > 0) {
      // past each end the end section carried straight on along the edge's end tangent (outside the solid: the end faces cut it)
      const mv = (c, d) => ({ ...c, cvs: c.cvs.map((p) => V.add(p, d)) });
      secs = [mv(secs[0], V.mul(balls[0].T, -ext)), ...secs, mv(secs[secs.length - 1], V.mul(balls[n].T, ext))];
      t = [-ext / L, ...t, 1 + ext / L].map((x) => (x * L + ext) / (L + 2 * ext));
    } else if (closed) {
      // round the loop: the same slope at both ends of the seam (central difference of each control point)
      const cs = K.compatible(secs), H = cs.map((c) => C.hcvs(c));
      const dt = (t[1] - t[0]) + (t[n] - t[n - 1]);
      d0 = H[0].map((_, j) => V.mul(V.sub(H[1][j], H[n - 1][j]), 1 / dt).slice(0, 3));
      d1 = d0;
      secs = cs;
    }
    tParams = t;
    Fs = K.loft(secs, { degree: Math.min(3, secs.length - 1), params: t, d0, d1 }).surface;
    // measured: half-way between stations, the exact arc against the lofted surface
    dev = 0;
    const [ua, ub] = S.domainU(Fs);
    for (let i = 0; i < n; i++) {
      const s = closed ? L * (i + 0.5) / n : L * (i + 0.5) / n;
      const b = ballAt(s, balls[i]), arc = section(b);
      const v0 = closed ? s / L : (s + ext) / (L + 2 * ext);
      for (let j = 0; j <= 8; j++) {
        const q = C.point(arc, j / 8);
        const r = S.closestPoint(Fs, q, { uv0: [ua + (ub - ua) * j / 8, v0] });
        dev = Math.max(dev, r.d);
      }
    }
    if (dev <= tol / 4 || 2 * n + 1 > MAX_STATIONS) break;
    n *= 2;
  }
  // tangency to both faces along the touch lines (measured, degrees)
  let tangent = 0;
  const [fu0, fu1] = S.domainU(Fs);
  for (let i = 0; i <= 2 * n; i++) {
    const s = L * i / (2 * n), v = closed ? s / L : (s + ext) / (L + 2 * ext);
    const b = i % 2 === 0 ? balls[i / 2] : ballAt(s, balls[(i - 1) / 2]);
    const nf0 = S.normal(Fs, fu0, v), nf1 = S.normal(Fs, fu1, v);
    tangent = Math.max(tangent, Math.min(V.angle(nf0, b.nA), V.angle(nf0, V.mul(b.nA, -1))) * DEG, Math.min(V.angle(nf1, b.nB), V.angle(nf1, V.mul(b.nB, -1))) * DEG);
  }

  // the tool: fillet surface + walls along the touch lines (away from the ball) + an outer face + end caps
  // walls long enough that the tool's section holds the edge point E (the far side's projection on c→E at least 1.25 |E − c|)
  const m = Math.max(...balls.map((b) => {
    const e = V.norm(V.sub(b.E, b.c)), cb = Math.max(0.05, Math.min(V.dot(V.norm(V.sub(b.pA, b.c)), e), V.dot(V.norm(V.sub(b.pB, b.c)), e)));
    return Math.max(b.r * 0.5, 1.25 * V.dist(b.E, b.c) / cb - b.r);
  }));
  const vs = (k) => (closed || !(ext > 0) ? balls : [balls[0], ...balls, balls[n]]).map((b, i, all) => {
    const p = k === 'A' ? b.pA : b.pB;
    let q = V.add(p, V.mul(V.norm(V.sub(p, b.c)), m));
    if (!closed && ext > 0 && (i === 0 || i === all.length - 1)) q = V.add(q, V.mul(b.T, i === 0 ? -ext : ext));
    return q;
  });
  const curveThrough = (Q) => {
    const opt = { params: tParams };
    if (closed) { const dt = (tParams[1] - tParams[0]) + (tParams[n] - tParams[n - 1]); const d = V.mul(V.sub(Q[1], Q[n - 1]), 1 / dt); opt.d0 = d; opt.d1 = d; }
    return F.interpolate(Q, Math.min(3, Q.length - 1), opt);
  };
  const farA = curveThrough(vs('A')), farB = curveThrough(vs('B'));
  const [fv0, fv1] = S.domainV(Fs);
  const bA = S.isoCurve(Fs, 'u', fu0), bB = S.isoCurve(Fs, 'u', fu1);
  const tool = [
    { surface: Fs, name },
    { surface: K.ruled(bA, farA).surface }, { surface: K.ruled(bB, farB).surface }, { surface: K.ruled(farA, farB).surface },
  ];
  if (!closed) for (const v of [fv0, fv1]) {
    const arc = S.isoCurve(Fs, 'v', v), a0 = C.point(arc, C.domain(arc)[0]), a1 = C.point(arc, C.domain(arc)[1]);
    const fa = C.point(farA, v), fb = C.point(farB, v);
    tool.push({ surface: K.coons(arc, C.line(fa, fb), C.line(a0, fa), C.line(a1, fb)).surface });
  }
  let made;
  try { made = B.addFaces(doc, tool, '', tol); } catch (e) { if (e && e.code === 'nurbs.err.solid_open') fail('nurbs.err.fillet_radius', { name: nameA + ', ' + nameB, radius: Math.round(Math.max(r0, r1) * 1e4) / 1e4 }); throw e; }
  const toolFace = B.solid(made.doc, made.id).faces[0], Fsurf = made.doc.items.find((i) => i.id === toolFace).surface;
  const tangentTo = [{ s: Fsurf, with: A, dir: 'u', end: 0 }, { s: Fsurf, with: Bs, dir: 'u', end: 1 }];
  // the tool may only change the corner along the edge: the volume taken or added is at most the triangles pA–E–pB swept along it
  let bound = 0;
  const triA = (b) => V.len(V.cross(V.sub(b.pA, b.E), V.sub(b.pB, b.E))) / 2;
  for (let i = 0; i < n; i++) bound += (triA(balls[i]) + triA(balls[i + 1])) / 2 * V.dist(balls[i].E, balls[i + 1].E);
  return {
    doc: made.doc, toolId: made.id, convex, tangentTo, sw, sol, Fsurf, tol, bound, L, n, dev, tangent, closed, r0, r1, nameA, nameB, A, Bs,
    E0: balls[0].E, E1: balls[n].E, edge: { a: faceA, b: faceB },
  };
}

/**
 * Several edges at once (0.9 SU.747c, owner's order 2026-11-06): `edges` = [{ a, b, radius, radius2 }] (faces by id; each pair meets along one
 * edge of the solid; radius / radius2 default to the options). Every tool is prepared on the ORIGINAL solid (its faces, its sewn edges and
 * the touch points checked against the faces as they were), then they are cut (or, on an inside edge, added) one after the other: the order
 * does not change the result. Where two filleted edges meet at a corner whose other edges stay sharp, the two fillets run into each other
 * along their intersection curve (mitred: a crease, not a vertex blend); where THREE edges of three flat faces square to each other meet
 * with one radius, a spherical corner is made (cornerBlend) when `corners` is true (the default).
 *   filletEdges(M, doc, solidId, edges, { radius, radius2, tol, name, corners }) → { doc, id, report }
 *     report = the last Boolean's + fillets [{ faces, radius, radius2, convex, length, deviation, tangent, changed, bound, stations }], edges, corners
 *     NurbsError as fillet's, plus nurbs.err.fillet_dup (the same edge twice) and nurbs.err.fillet_none
 */
export function filletEdges(M, doc, solidId, edges, { radius = 5, radius2 = null, tol = B.TOL, name = '', corners = true } = {}) {
  if (!Array.isArray(edges) || !edges.length) fail('nurbs.err.fillet_none');
  if (edges.length > 64) fail('nurbs.err.fillet_none');
  const seen = new Set();
  for (const e of edges) {
    const k = [e.a, e.b].sort().join('|');
    if (seen.has(k)) fail('nurbs.err.fillet_dup', { a: e.a, b: e.b });
    seen.add(k);
  }
  let d = doc;
  const prs = [];
  for (const e of edges) {
    const pr = prepare(d, solidId, e.a, e.b, { radius: e.radius ?? radius, radius2: e.radius2 ?? radius2, tol, name });
    d = pr.doc; prs.push(pr);
  }
  // corners: where two or three filleted edges meet
  const cs = corners ? cornersOf(prs, tol) : cornersOf(prs, tol).map((c) => ({ ...c, kind: 'mitre' }));
  let cur = solidId, before = prs[0].sw.volume, last = null;
  const fills = [];
  const spheres = [];
  for (const c of cs) if (c.kind === 'sphere') { const t = cornerTool(M, d, c, tol); d = t.doc; spheres.push({ c, id: t.id }); }
  for (const pr of prs) {
    const res = B.boolean(M, d, cur, pr.toolId, pr.convex ? 'subtract' : 'union', { tol, name: name || pr.sol.name || '', tangent: pr.tangentTo });
    const f = finish({ ...pr, Fsurf: pr.Fsurf }, res, before, cur);
    fills.push(f.report.fillet);
    d = res.doc; cur = res.id; before = res.report.volume; last = f;
  }
  // the spherical corners: the cell at the vertex minus the ball, cut after the edges (it holds every part of them that lies in the cell)
  const cornerReports = cs.map((c) => ({ kind: c.kind, edges: c.edges.length, point: c.P, radius: c.r }));
  for (const { c, id } of spheres) {
    const res = B.boolean(M, d, cur, id, 'subtract', { tol, name: name || last.report.name || '' });
    const taken = before - res.report.volume, cell = c.r ** 3;
    if (taken > cell * (1 + 1e-6) + 4 * tol * c.r * c.r) fail('nurbs.err.fillet_hits', { name: prs[0].sol.name || prs[0].sol.id, mm3: Math.round(taken - cell) });
    const rp = cornerReports.find((x) => x.point === c.P); if (rp) { rp.taken = taken; rp.face = B.solid(res.doc, res.id).faces.filter((f) => res.doc.items.find((i) => i.id === f).surface === c.sphereSurface); }
    d = res.doc; cur = res.id; before = res.report.volume; last = { ...last, report: { ...last.report, ...res.report, fillet: last.report.fillet } };
  }
  return { doc: d, id: cur, report: { ...last.report, fillet: { ...fills[0], edges: fills.length }, fillets: fills, edges: fills.length, corners: cornerReports } };
}

/**
 * Where filleted edges meet (end points within a hair of each other): 'sphere' when exactly three convex edges of three flat faces square to
 * each other meet with one radius (the corner is a sphere patch tangent to all three fillets), else 'mitre' (the fillets run into each other
 * along their intersection curve). → [{ kind, P, edges: [index], r, dirs, ... }]
 */
function cornersOf(prs, tol) {
  const ends = [];
  prs.forEach((pr, i) => { if (!pr.closed) ends.push({ i, P: pr.E0, Q: pr.E1 }, { i, P: pr.E1, Q: pr.E0 }); });
  const size = Math.max(1e-9, ...prs.map((pr) => pr.L)), gap = Math.max(1e-7 * size, 1e-9);
  const groups = [];
  for (const e of ends) {
    const g = groups.find((x) => V.dist(x.P, e.P) <= gap);
    if (g) g.list.push(e); else groups.push({ P: e.P, list: [e] });
  }
  const out = [];
  for (const g of groups) {
    if (g.list.length < 2) continue;
    const c = { kind: 'mitre', P: g.P, edges: g.list.map((e) => e.i), dirs: g.list.map((e) => V.norm(V.sub(e.Q, e.P))), r: prs[g.list[0].i].r0 };
    if (g.list.length === 3) {
      const es = g.list.map((e) => prs[e.i]);
      const ids = new Set(es.flatMap((e) => [e.edge.a, e.edge.b]));
      const surf = new Map(es.flatMap((e) => [[e.edge.a, e.A], [e.edge.b, e.Bs]]));
      const flat = (sf) => { const n = S.normal(sf, 0.5, 0.5), p0 = sf.cvs[0][0]; return sf.cvs.every((row) => row.every((q) => Math.abs(V.dot(V.sub(q, p0), n)) <= 1e-7 * size)) ? n : null; };
      const ns = [...ids].map((id) => flat(surf.get(id)));
      const square = ids.size === 3 && ns.every(Boolean) && V.dot(ns[0], ns[1]) ** 2 + V.dot(ns[0], ns[2]) ** 2 + V.dot(ns[1], ns[2]) ** 2 < 1e-12;
      const same = es.every((e) => e.convex && Math.abs(e.r0 - c.r) <= 1e-9 * c.r && Math.abs(e.r1 - c.r) <= 1e-9 * c.r);
      const shortest = Math.min(...es.map((e) => e.L));
      if (square && same) {
        if (shortest < 2 * c.r * (1 + 1e-9)) fail('nurbs.err.fillet_corner', { name: es[0].sol.name || es[0].sol.id, radius: Math.round(c.r * 1e4) / 1e4 });   // the two corner cells of an edge would overlap
        c.kind = 'sphere';
      }
    }
    out.push(c);
  }
  return out;
}

/** The corner cell (a cube of side r + r at the vertex, reaching r outside the solid) minus the ball in its far corner, as a solid in the doc. */
function cornerTool(M, doc, c, tol) {
  const { P, dirs, r } = c, m = r;
  const pt = (a, b, cc) => V.add(P, V.add(V.mul(dirs[0], a), V.add(V.mul(dirs[1], b), V.mul(dirs[2], cc))));
  const cu = (i, j, k) => pt(i ? r : -m, j ? r : -m, k ? r : -m);
  const quad = (p) => ({ surface: K.planarPatch(p) });
  const faces = [
    [cu(0, 0, 0), cu(1, 0, 0), cu(1, 1, 0), cu(0, 1, 0)], [cu(0, 0, 1), cu(1, 0, 1), cu(1, 1, 1), cu(0, 1, 1)],
    [cu(0, 0, 0), cu(1, 0, 0), cu(1, 0, 1), cu(0, 0, 1)], [cu(0, 1, 0), cu(1, 1, 0), cu(1, 1, 1), cu(0, 1, 1)],
    [cu(0, 0, 0), cu(0, 1, 0), cu(0, 1, 1), cu(0, 0, 1)], [cu(1, 0, 0), cu(1, 1, 0), cu(1, 1, 1), cu(1, 0, 1)],
  ].map(quad);
  const cube = B.addFaces(doc, faces, 'corner cell', tol);
  const ball = B.sphere(cube.doc, { center: pt(r, r, r), radius: r, tol, name: 'corner ball' });
  const sph = B.solid(ball.doc, ball.id).faces.map((f) => ball.doc.items.find((i) => i.id === f))[0];
  c.sphereSurface = sph.surface;
  const res = B.boolean(M, ball.doc, cube.id, ball.id, 'subtract', { tol, name: 'corner' });
  return { doc: res.doc, id: res.id };
}

/** The second half: the Boolean's result checked against the bound and reported. `before` = the volume the solid had. */
function finish(pr, res, before, solidId) {
  const { tol, bound, L, r0, r1, sw, sol } = pr;
  const changed = Math.abs(res.report.volume - before), slack = 4 * tol * L * Math.max(r0, r1) + 1e-6 * sw.volume;
  if (changed > bound + slack) fail('nurbs.err.fillet_hits', { name: sol.name || sol.id, mm3: Math.round(changed - bound) });
  const filletFaces = B.solid(res.doc, res.id).faces.filter((f) => res.doc.items.find((i) => i.id === f).surface === pr.Fsurf);
  return {
    doc: res.doc, id: res.id,
    report: { ...res.report, fillet: { radius: r0, radius2: r1, convex: pr.convex, length: L, closedEdge: pr.closed, stations: pr.n + 1, deviation: pr.dev, changed, bound, tangent: pr.tangent, faces: [pr.nameA, pr.nameB], face: filletFaces } },
  };
}

// ------------------------------------------------------------------------------------------------ thicken

/** A closed degree-1 curve through points, knots by index (two of these with the same count rule point i to point i). */
function indexLine(pts) {
  const n = pts.length, K = [0, 0];
  for (let i = 1; i < n - 1; i++) K.push(i / (n - 1));
  K.push(1, 1);
  return { deg: 1, knots: K, cvs: pts.map((p) => p.slice(0, 3)), w: null };
}

export function thicken(doc, surfaceId, { thickness = 2, side = 1, tol = B.TOL, fitTol = null, name = '' } = {}) {
  const it = doc.items.find((i) => i.id === surfaceId);
  if (!it || it.kind !== 'surface') fail('nurbs.err.no_item', { id: surfaceId });
  if (!(Number.isFinite(thickness) && thickness > 0)) fail('nurbs.err.thicken_size');
  if (B.solidOf(doc, surfaceId)) fail('nurbs.err.solid_taken', { id: surfaceId, solid: B.solidOf(doc, surfaceId).name || B.solidOf(doc, surfaceId).id });
  const s = it.surface, trim = it.trim || null, nm = it.name || it.id;
  const d = (side < 0 ? -1 : 1) * thickness;
  const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s), size = S.size(s);
  const inside = (u, v) => T.contains(s, trim, u, v);
  // 1. the offset folds where the surface bends towards it tighter than the thickness
  const G = 32;
  let minRadius = Infinity, where = null;
  for (let i = 0; i <= G; i++) for (let j = 0; j <= G; j++) {
    const u = ua + (ub - ua) * i / G, v = va + (vb - va) * j / G;
    if (!inside(u, v)) continue;
    const k = S.curvature(s, u, v), kk = d > 0 ? k.k1 : -k.k2;   // towards +n: the largest k; towards −n: the most negative
    if (kk > 1e-12 && 1 / kk < minRadius) { minRadius = 1 / kk; where = S.point(s, u, v); }
  }
  if (minRadius <= thickness * (1 + 1e-9)) fail('nurbs.err.thicken_fold', { name: nm, radius: Math.round(minRadius * 1e4) / 1e4, thickness, at: where.map((x) => Math.round(x * 100) / 100).join(', ') });
  // 2. the offset surface (fitted), measured independently between its fitting samples
  const off = K.offset(s, d, { tol: fitTol ?? Math.min(tol / 5, 0.01) });
  const O = off.surface, [oa, ob] = S.domainU(O), [oc, od] = S.domainV(O);
  const toO = (u, v) => [oa + (ob - oa) * (u - ua) / (ub - ua), oc + (od - oc) * (v - va) / (vb - va)];
  let offDev = 0;
  const M2 = 41, samples = [];
  for (let i = 0; i <= M2; i++) for (let j = 0; j <= M2; j++) {
    const u = ua + (ub - ua) * (i + 0.37) / (M2 + 1), v = va + (vb - va) * (j + 0.61) / (M2 + 1);
    if (!inside(u, v)) continue;
    const q = S.point(O, ...toO(u, v)), r = S.closestPoint(s, q, { uv0: [u, v] });
    offDev = Math.max(offDev, Math.abs(r.d - thickness));
    samples.push({ q, u, v });
  }
  // 3. another part of the surface closer than the thickness: the offset would run into it
  const pts = [];
  const NS = 64;
  for (let i = 0; i <= NS; i++) for (let j = 0; j <= NS; j++) {
    const u = ua + (ub - ua) * i / NS, v = va + (vb - va) * j / NS;
    if (inside(u, v)) pts.push({ p: S.point(s, u, v), u, v });
  }
  let spacing = 0;
  for (let i = 0; i < NS; i++) for (const [a, b] of [[1, 0], [0, 1]]) {
    const u = ua + (ub - ua) * i / NS, v = va + (vb - va) * i / NS;
    spacing = Math.max(spacing, V.dist(S.point(s, u, v), S.point(s, u + (ub - ua) * a / NS, v + (vb - va) * b / NS)));
  }
  const h = thickness + spacing, grid = new Map(), gk = (p) => Math.floor(p[0] / h) + ',' + Math.floor(p[1] / h) + ',' + Math.floor(p[2] / h);
  for (const p of pts) { const k = gk(p.p); let l = grid.get(k); if (!l) grid.set(k, l = []); l.push(p); }
  for (const sm of samples) {
    const foot = S.point(s, sm.u, sm.v);
    const c = sm.q.map((x) => Math.floor(x / h));
    let worst = null;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      for (const p of grid.get((c[0] + dx) + ',' + (c[1] + dy) + ',' + (c[2] + dz)) || []) {
        const dd = V.dist(p.p, sm.q);
        // another part of the surface (not the offset point's own foot and its neighbours) near the offset point
        if (dd < thickness + spacing && V.dist(p.p, foot) > 1.5 * thickness + spacing && (!worst || dd < worst.dd)) worst = { dd, p };
      }
    }
    if (!worst) continue;
    const r = S.closestPoint(s, sm.q, { uv0: [worst.p.u, worst.p.v] });
    if (r.d < thickness * (1 - 1e-3) - tol && inside(r.u, r.v)) fail('nurbs.err.thicken_self', { name: nm, gap: Math.round(r.d * 1e4) / 1e4, thickness, at: r.point.map((x) => Math.round(x * 100) / 100).join(', ') });
  }
  // 4. the faces: the surface, its offset with the same trim, a ruled wall along every boundary
  const list = [{ surface: s, trim, name: nm }];
  const otrim = trim ? { outer: trim.outer ? trim.outer.map((p) => toO(...p)) : null, holes: trim.holes.map((L) => L.map((p) => toO(...p))) } : null;
  list.push({ surface: O, trim: otrim, name: nm });
  const closedDir = (dir) => [0, 0.37, 0.71, 1].every((x) => (dir === 'u'
    ? V.dist(S.point(s, ua, va + (vb - va) * x), S.point(s, ub, va + (vb - va) * x))
    : V.dist(S.point(s, ua + (ub - ua) * x, va), S.point(s, ua + (ub - ua) * x, vb))) < 1e-9 * size);
  const wall = (L) => {   // a boundary loop in (u, v): followed on the surface, the offset taken at the same (u, v)
    const on = T.onSurface(s, L, { tol: Math.min(1e-3, tol / 20) });
    const keep = [];
    for (const q of on) if (!keep.length || V.dist(keep[keep.length - 1].p, q.p) > 1e-9 * size) keep.push(q);
    if (keep.length > 1 && V.dist(keep[0].p, keep[keep.length - 1].p) <= 1e-9 * size) keep.pop();
    keep.push(keep[0]);
    return { surface: K.ruled(indexLine(keep.map((q) => q.p)), indexLine(keep.map((q) => S.point(O, ...toO(q.uv[0], q.uv[1]))))).surface };
  };
  if (!trim || !trim.outer) {
    const cu = closedDir('u'), cv = closedDir('v');
    for (const e of S.EDGES) {
      if ((e[0] === 'u' && cu) || (e[0] === 'v' && cv)) continue;
      const a = S.edgeCurve(s, e);
      if (C.arcLength(a) <= 1e-9 * size) continue;   // a pole
      list.push({ surface: K.ruled(a, S.edgeCurve(O, e)).surface });
    }
  } else list.push(wall(trim.outer));
  if (trim) for (const hl of trim.holes) list.push(wall(hl));
  let made;
  try { made = B.addFaces(doc, list, name || nm, tol); } catch (e) { if (e && e.code === 'nurbs.err.solid_open') fail('nurbs.err.thicken_open', { name: nm }); throw e; }
  // the thickened solid replaces the surface (its first face is a copy of it)
  const out = { ...made.doc, items: made.doc.items.filter((i) => i.id !== surfaceId), links: made.doc.links.filter((l) => l.a !== surfaceId && l.b !== surfaceId) };
  return {
    doc: out, id: made.id,
    report: { thickness, side: d > 0 ? 1 : -1, fit: off.report.deviation, offset: offDev, minRadius: Number.isFinite(minRadius) ? minRadius : null, volume: made.report.volume, area: made.report.area, closed: made.report.closed, faces: list.length, tol },
  };
}
