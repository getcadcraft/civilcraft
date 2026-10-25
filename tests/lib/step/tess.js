/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-step is a standalone library; its errors are codes (the app words them). */
/**
 * tess.js — triangles for the faces of a STEP B-rep (0.7 D7.26, session part-08). DOM-free, import-free but for geom.js.
 *
 *   edgePoints(curve, a, b, sameSense, tol) → [[x,y,z]…] from vertex a to vertex b along the curve (a and b exact), as many as
 *       the chord tolerance `tol` and an angle limit need. Each edge is made once and both its faces use the same points, so the
 *       faces meet without cracks.
 *   faceTriangles(surface, loops, { sameSense, tol, maxPoints }) → { pos: [[x,y,z]…], tris: [[i,j,k]…], notes: [code…] }
 *       loops: [{ pts: [[x,y,z]…] (closed, no repeat), outer: bool, dir: ±1 (the loop as the face's normal sees it) }]
 *       The loops are mapped to the surface's (u, v) (periodic directions unwrapped, poles split), joined into one polygon with
 *       holes (a loop that runs all the way round a periodic direction is joined to the other one, or to the pole, through
 *       existing points: no new point on an edge), triangulated by ear clipping in (u, v) scaled to lengths, then refined where
 *       the surface curves away from the triangles (inside edges only) with Delaunay flips. Boundary points keep their exact 3D
 *       position; every other point is the surface's.
 */
import { V3, wrapNear } from './geom.js';

const { sub, add, mul, dot, cross, len } = V3;
const TAU = 2 * Math.PI;
export const MAX_ANGLE = Math.PI / 24;   // 7.5° a segment on round curves and surfaces

// ---- edges ------------------------------------------------------------------------------------------------------------

export function edgePoints(curve, a, b, sameSense, tol) {
  if (curve.kind === 'line') return [a, b];
  if (curve.kind === 'polyline') {
    let t0 = curve.project(a), t1 = curve.project(b);
    const out = [a];
    if (sameSense) { for (let i = Math.floor(t0) + 1; i < t1 - 1e-9; i++) out.push(curve.pts[i]); }
    else { for (let i = Math.ceil(t0) - 1; i > t1 + 1e-9; i--) out.push(curve.pts[i]); }
    out.push(b);
    return out;
  }
  const P = curve.period;
  let t0 = curve.project(a), t1 = curve.project(b);
  const same = len(sub(a, b)) <= tol * 1e-3;
  if (same && !P && curve.range) {
    // a closed edge on a curve that is not periodic (its first and last points meet): the whole curve, one way or the other
    [t0, t1] = sameSense ? [curve.range[0], curve.range[1]] : [curve.range[1], curve.range[0]];
  } else if (P) {
    if (sameSense) { let d = ((t1 - t0) % P + P) % P; if (same || d < 1e-12) d = same ? P : d; t1 = t0 + d; }
    else { let d = ((t0 - t1) % P + P) % P; if (same || d < 1e-12) d = same ? P : d; t1 = t0 - d; }
  }
  const ts = adaptive(curve, t0, t1, tol);
  const out = ts.map((t) => curve.at(t));
  out[0] = a; out[out.length - 1] = b;
  return out;
}

/** Parameters from t0 to t1: circles and ellipses evenly by angle and chord; others split until the middle is near the chord. */
function adaptive(curve, t0, t1, tol) {
  if (curve.kind === 'circle' || curve.kind === 'ellipse') {
    const r = curve.r || len(sub(curve.at(0), curve.at(Math.PI))) / 2;
    const step = Math.min(MAX_ANGLE, r > tol ? 2 * Math.acos(Math.max(-1, 1 - tol / r)) : MAX_ANGLE);
    const n = Math.max(1, Math.ceil(Math.abs(t1 - t0) / step));
    return Array.from({ length: n + 1 }, (_, i) => t0 + (t1 - t0) * i / n);
  }
  // first a few even samples (so wiggles are seen), then halve where the middle strays from the chord or the turn is large
  const base = 8;
  let ts = Array.from({ length: base + 1 }, (_, i) => t0 + (t1 - t0) * i / base);
  for (let pass = 0; pass < 12; pass++) {
    const next = [ts[0]];
    let split = false;
    for (let i = 1; i < ts.length; i++) {
      const a = ts[i - 1], b = ts[i], m = (a + b) / 2;
      const pa = curve.at(a), pb = curve.at(b), pm = curve.at(m);
      const dev = len(sub(pm, mul(add(pa, pb), 0.5)));
      const da = sub(pm, pa), db = sub(pb, pm), la = len(da), lb = len(db);
      const turn = la > 0 && lb > 0 ? Math.acos(Math.max(-1, Math.min(1, dot(da, db) / (la * lb)))) : 0;
      if ((dev > tol || turn > MAX_ANGLE) && Math.abs(b - a) > 1e-9 * Math.abs(t1 - t0)) { next.push(m); split = true; }
      next.push(b);
    }
    ts = next;
    if (!split || ts.length > 4096) break;
  }
  return ts;
}

// ---- polygons in the plane -----------------------------------------------------------------------------------------

const area2 = (P, idx) => { let s = 0; for (let i = 0; i < idx.length; i++) { const a = P[idx[i]], b = P[idx[(i + 1) % idx.length]]; s += a[0] * b[1] - b[0] * a[1]; } return s; };
const crossO = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
/** The turn at b: +1 left (convex in a counter-clockwise ring), −1 right, 0 straight within rounding (relative to the sides). */
const turnAt = (a, b, c) => { const x = crossO(a, b, c), s = Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(c[0] - b[0], c[1] - b[1]); return x > 1e-9 * s ? 1 : x < -1e-9 * s ? -1 : 0; };
function segCross(p1, p2, p3, p4) {
  const d1 = crossO(p3, p4, p1), d2 = crossO(p3, p4, p2), d3 = crossO(p1, p2, p3), d4 = crossO(p1, p2, p4);
  return ((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0));
}

/** Holes joined to the outer ring by bridges (each hole from its rightmost point to a visible outer point), then ear clipping.
 *  P: [[x, y]…]; outer: indices CCW; holes: index lists CW. → triangles [[i, j, k]…] (CCW). */
export function earcut(P, outer, holes = []) {
  let ring = outer.slice();
  const hs = holes.map((h) => h.slice()).sort((a, b) => Math.max(...b.map((i) => P[i][0])) - Math.max(...a.map((i) => P[i][0])));
  for (const h of hs) {
    let hi = 0;
    for (let k = 1; k < h.length; k++) if (P[h[k]][0] > P[h[hi]][0]) hi = k;
    const m = P[h[hi]];
    // the ring point nearest m that m can see (no ring or hole edge crossing the bridge)
    let best = -1, bd = Infinity;
    for (let k = 0; k < ring.length; k++) {
      const q = P[ring[k]];
      const d = (q[0] - m[0]) ** 2 + (q[1] - m[1]) ** 2;
      if (d >= bd) continue;
      let blocked = false;
      for (let e = 0; e < ring.length && !blocked; e++) { const a = ring[e], b = ring[(e + 1) % ring.length]; if (a === ring[k] || b === ring[k]) continue; if (segCross(m, q, P[a], P[b])) blocked = true; }
      for (let e = 0; e < h.length && !blocked; e++) { const a = h[e], b = h[(e + 1) % h.length]; if (a === h[hi] || b === h[hi]) continue; if (segCross(m, q, P[a], P[b])) blocked = true; }
      if (!blocked) { bd = d; best = k; }
    }
    if (best < 0) best = 0;
    const hole = [...h.slice(hi), ...h.slice(0, hi), h[hi]];
    ring = [...ring.slice(0, best + 1), ...hole, ...ring.slice(best)];
  }
  return clip(P, ring);
}

function clip(P, ring) {
  const tris = [];
  let live = ring.slice();
  let guard = 0;
  while (live.length > 3 && guard++ < 50 * ring.length + 1000) {
    let cut = -1;
    const n = live.length;
    for (let i = 0; i < n; i++) {
      const ia = live[(i + n - 1) % n], ib = live[i], ic = live[(i + 1) % n];
      const a = P[ia], b = P[ib], c = P[ic];
      if (turnAt(a, b, c) <= 0) continue;   // reflex, or straight within rounding (a sliver flat in (u, v) is a real triangle in 3D)
      // blocked by a ring point strictly inside, or by a reflex one on its edge; points in a straight run along the edge (a
      // circle laid out as a row, a seam) do not block: they stay on the boundary, and dropping them would crack the neighbours
      let inside = false;
      for (let k = 0; k < n && !inside; k++) {
        const j = live[k];
        if (j === ia || j === ib || j === ic) continue;
        const p = P[j];
        if ((p[0] === a[0] && p[1] === a[1]) || (p[0] === b[0] && p[1] === b[1]) || (p[0] === c[0] && p[1] === c[1])) continue;   // bridge duplicates
        const o1 = turnAt(a, b, p), o2 = turnAt(b, c, p), o3 = turnAt(c, a, p);
        if (o1 < 0 || o2 < 0 || o3 < 0) continue;
        if (o1 > 0 && o2 > 0 && o3 > 0) { inside = true; break; }
        const pr = P[live[(k + n - 1) % n]], nx = P[live[(k + 1) % n]];
        if (turnAt(pr, p, nx) <= 0) inside = true;   // on the edge: blocks unless it is a convex corner of the ring
      }
      if (!inside) { cut = i; break; }
    }
    if (cut < 0) {
      // a pinched or slightly folded ring: cut the most convex corner anyway so the face still closes (never a straight one:
      // that would be a triangle with no area); a ring with no convex corner left is dropped
      let bi = -1, bv = 0;
      for (let i = 0; i < n; i++) { if (turnAt(P[live[(i + n - 1) % n]], P[live[i]], P[live[(i + 1) % n]]) <= 0) continue; const v = crossO(P[live[(i + n - 1) % n]], P[live[i]], P[live[(i + 1) % n]]); if (v > bv) { bv = v; bi = i; } }
      if (bi < 0) break;
      cut = bi;
    }
    tris.push([live[(cut + n - 1) % n], live[cut], live[(cut + 1) % n]]);
    live.splice(cut, 1);
  }
  if (live.length === 3 && turnAt(P[live[0]], P[live[1]], P[live[2]]) > 0) tris.push([live[0], live[1], live[2]]);
  return tris;
}

// ---- faces -----------------------------------------------------------------------------------------------------------

/** The loop in the surface's (u, v): projected, periodic directions unwrapped, a pole split into two points (one per neighbour's
 *  u). → { uv: [[u, v]…], p3: [[x,y,z]…], wrapU, wrapV } (wrap = how many periods the closed loop runs: 0 or ±1). */
function loopUV(S, pts, seam2 = -1) {
  const n = pts.length;
  const uv = [], p3 = [], sing = [];
  let hint = null;
  for (let i = 0; i < n; i++) {
    const s = S.singular(pts[i]);
    let q = S.project(pts[i], hint);
    uv.push(q); p3.push(pts[i]); sing.push(!!s);
    if (!s) hint = q;
  }
  // unwrap: each coordinate nearest the previous non-pole point
  for (let i = 1; i < n; i++) {
    let j = i - 1; while (j >= 0 && sing[j]) j--;
    if (j < 0) continue;
    if (S.periodU && !sing[i]) uv[i][0] = wrapNear(uv[i][0], uv[j][0], S.periodU);
    if (S.periodV) uv[i][1] = wrapNear(uv[i][1], uv[j][1], S.periodV);
  }
  // a seam's second pass is on the other side of the seam: when the loop seems to run round a period, move that pass (and
  // what follows it) back by the turn
  if (seam2 >= 0) for (const [k, P] of [[0, S.periodU], [1, S.periodV]]) {
    if (!P) continue;
    let tot = 0;
    for (let i = 0; i < n; i++) { const a = uv[i][k], b = uv[(i + 1) % n][k]; tot += wrapNear(b, a, P) - a; }
    const turn = Math.round(tot / P);
    if (turn) for (let i = seam2; i < n; i++) uv[i][k] -= turn * P;
  }
  // poles: u from the neighbours (the pole becomes a short line along it)
  const outUV = [], out3 = [];
  for (let i = 0; i < n; i++) {
    if (!sing[i]) { outUV.push(uv[i]); out3.push(p3[i]); continue; }
    let a = i - 1; while (a >= -n && sing[(a + n) % n]) a--;
    let b = i + 1; while (b < 2 * n && sing[b % n]) b++;
    const ua = uv[(a + n) % n][0], ub = uv[b % n][0];
    if (Math.abs(ub - ua) > 1e-9) { outUV.push([ua, uv[i][1]], [ub, uv[i][1]]); out3.push(p3[i], p3[i]); }   // each neighbour's own u (a seam may lie between them)
    else { outUV.push([ua, uv[i][1]]); out3.push(p3[i]); }
  }
  // how far the loop turned round each periodic direction
  // the loop is unwrapped (its pole lines and seams kept as they are): it runs round a period when closing it needs a jump of one
  const turns = (k, P) => {
    if (!P || outUV.length < 2) return 0;
    const first = outUV[0][k], last = outUV[outUV.length - 1][k];
    return Math.round((wrapNear(first, last, P) - first) / P);
  };
  return { uv: outUV, p3: out3, wrapU: turns(0, S.periodU), wrapV: turns(1, S.periodV) };
}

export function faceTriangles(S, loops, { sameSense = true, tol = 0.01, maxPoints = 200000 } = {}) {
  const notes = [];
  const uvs = [], p3s = [], isB = [];   // all points of the face: (u, v), 3D (null = from the surface), on the boundary?
  const addPt = (uv, p, b) => { uvs.push([uv[0], uv[1]]); p3s.push(p); isB.push(b); return uvs.length - 1; };
  const L = loops.filter((l) => l.pts.length >= 2).map((l) => ({ ...l, ...loopUV(S, l.pts, l.seam2 ?? -1) }));
  // the closed surfaces with no loop at all: their whole domain
  if (!L.length) {
    const dom = fullDomain(S);
    if (!dom) return { pos: [], tris: [], notes: ['step.face_unbounded'] };
    // its sides (a seam twice, a pole line or the patch's edges) get their points now: refinement never splits a boundary edge
    const dense = [];
    for (let i = 0; i < 4; i++) { const a = dom[i], b = dom[(i + 1) % 4]; dense.push(a, ...seamPts(S, a, b, tol, (q) => q, Math.abs(a[1] - b[1]) < 1e-12 && S.kind !== 'bspline')); }
    L.push({ outer: true, dir: 1, uv: dense, p3: dense.map(() => null), wrapU: 0, wrapV: 0, synthetic: true });
  }
  // which direction wraps (a torus face can wrap in v)
  const wrapsU = L.filter((l) => l.wrapU), wrapsV = L.filter((l) => l.wrapV && !l.wrapU);
  let swap = false;
  if (!wrapsU.length && wrapsV.length) swap = true;   // treat v as u: swap coordinates throughout
  const SW = (q) => (swap ? [q[1], q[0]] : q);
  const PU = swap ? S.periodV : S.periodU;
  for (const l of L) { l.uv = l.uv.map(SW); l.w = swap ? l.wrapV : l.wrapU; }
  const rings = [];   // [{ idx: [...], outer }]
  const plain = L.filter((l) => !l.w), wrapping = L.filter((l) => l.w);
  for (const l of plain) rings.push({ idx: l.uv.map((q, i) => addPt(q, l.p3[i], !l.synthetic)), outer: l.outer, synthetic: !!l.synthetic });
  if (wrapping.length) {
    if (wrapping.length > 2) notes.push('step.face_many_wraps');
    const A = wrapping[0];
    let B = wrapping[1] || null;
    // A from its first point once round (u0 → u0 ± P); the ring closes through B or a pole
    const aIdx = A.uv.map((q, i) => addPt(q, A.p3[i], true));
    const u0 = A.uv[0][0], dA = Math.sign(A.w);
    const aEnd = addPt([u0 + dA * PU, A.uv[0][1]], A.p3[0], true);   // A's first point again, one period on (the same 3D point)
    let ring;
    if (B) {
      // B from the point whose u is nearest u0 (mod P), run against A's direction
      let k = 0, bd = Infinity;
      B.uv.forEach((q, i) => { const d = Math.abs(wrapNear(q[0], u0, PU) - u0); if (d < bd) { bd = d; k = i; } });
      let bu = B.uv.slice(k).concat(B.uv.slice(0, k)), b3 = B.p3.slice(k).concat(B.p3.slice(0, k));
      if (Math.sign(B.w) === dA) { bu = [bu[0], ...bu.slice(1).reverse()]; b3 = [b3[0], ...b3.slice(1).reverse()]; }
      // unwrap B so it starts near u0 + dA·P and runs back to near u0
      const start = wrapNear(bu[0][0], u0 + dA * PU, PU);
      const shift = start - bu[0][0];
      const bU = [[start, bu[0][1]]];
      for (let i = 1; i < bu.length; i++) bU.push([wrapNear(bu[i][0] + shift, bU[i - 1][0], PU), bu[i][1]]);
      bU.push([bU[0][0] - dA * PU, bU[0][1]]); b3.push(b3[0]);
      const bIdx = bU.map((q, i) => addPt(q, b3[i], true));
      // the seam: from A's end to B's start and from B's end to A's start, points of the surface between (one period apart: the
      // same 3D points on both sides)
      const seam = (from, to) => seamPts(S, uvs[from], uvs[to], tol, SW).map((q) => addPt(q, null, false));
      ring = [...aIdx, aEnd, ...seam(aEnd, bIdx[0]), ...bIdx, ...seam(bIdx[bIdx.length - 1], aIdx[0])];
    } else {
      // one loop round a pole (a sphere's or a cone's cap): the side the face is on, from the loop's sense
      const pole = poleV(S, swap, dA * (A.dir || 1) * (sameSense ? 1 : -1) > 0 ? 1 : -1);
      if (pole === null) { notes.push('step.face_open_wrap'); ring = null; }
      else {
        const p1 = addPt([u0 + dA * PU, pole], null, false), p2 = addPt([u0, pole], null, false);
        const seam1 = seamPts(S, uvs[aEnd], uvs[p1], tol, SW).map((q) => addPt(q, null, false));
        const poleLine = seamPts(S, uvs[p1], uvs[p2], tol, SW, true).map((q) => addPt(q, null, false));
        const seam2 = seamPts(S, uvs[p2], uvs[aIdx[0]], tol, SW).map((q) => addPt(q, null, false));
        ring = [...aIdx, aEnd, ...seam1, p1, ...poleLine, p2, ...seam2];
      }
    }
    if (ring) rings.push({ idx: ring, outer: true, joined: true });
    if (B && plain.some((l) => l.outer)) notes.push('step.face_outer_and_wraps');
  }
  if (!rings.length) return { pos: [], tris: [], notes };
  // scale (u, v) to lengths so the triangles have sensible shapes
  const [su, sv] = swap ? [S.scale[1], S.scale[0]] : S.scale;
  const M = uvs.map((q) => [q[0] * su, q[1] * sv]);
  // the outer ring: the joined one, else the one marked outer, else the largest; holes moved into its period
  let outer = rings.find((r) => r.joined) || rings.find((r) => r.outer) || rings.reduce((a, b) => (Math.abs(area2(M, a.idx)) >= Math.abs(area2(M, b.idx)) ? a : b));
  const holes = rings.filter((r) => r !== outer);
  if (PU) {
    const ou = outer.idx.map((i) => uvs[i][0]), oc = (Math.min(...ou) + Math.max(...ou)) / 2;
    for (const h of holes) {
      const hu = h.idx.map((i) => uvs[i][0]), hc = (Math.min(...hu) + Math.max(...hu)) / 2, k = Math.round((oc - hc) / PU);
      if (k) for (const i of h.idx) { uvs[i][0] += k * PU; M[i][0] = uvs[i][0] * su; }
    }
  }
  if (area2(M, outer.idx) < 0) outer.idx.reverse();
  for (const h of holes) if (area2(M, h.idx) > 0) h.idx.reverse();
  let tris = earcut(M, outer.idx, holes.map((h) => h.idx));
  // refinement where the surface curves (never on the boundary: the neighbours share those edges)
  if (!S.flat) {
    // interior points on a grid sized by the surface's curvature, put in by constrained Delaunay insertion; then a few passes
    // of edge splitting where the surface still strays (B-splines, revolved curves)
    tris = densify(S, uvs, M, p3s, isB, tris, [outer.idx, ...holes.map((h) => h.idx)], { tol, su, sv, SW, swap, maxPoints, notes });
    ({ tris } = refine(S, uvs, M, p3s, isB, tris, { tol, su, sv, SW, maxPoints, notes }));
  }
  // 3D positions; triangles turned to face the way the face does
  const pos = uvs.map((q, i) => p3s[i] || S.at(...SW(q)));
  const want = (q) => { const [u, v] = SW(q), h = 1e-5; const Su = sub(S.at(u + h, v), S.at(u - h, v)), Sv = sub(S.at(u, v + h), S.at(u, v - h)); return mul(cross(Su, Sv), sameSense ? 1 : -1); };
  let vote = 0;
  for (let k = 0; k < tris.length && Math.abs(vote) < 8; k++) {
    const [a, b, c] = tris[k];
    const n = cross(sub(pos[b], pos[a]), sub(pos[c], pos[a]));
    if (len(n) < 1e-12) continue;
    const cq = [(uvs[a][0] + uvs[b][0] + uvs[c][0]) / 3, (uvs[a][1] + uvs[b][1] + uvs[c][1]) / 3];
    const d = dot(n, want(cq));
    if (d > 0) vote++; else if (d < 0) vote--;
  }
  if (vote < 0) tris = tris.map(([a, b, c]) => [a, c, b]);
  // a self-check on up to 64 triangles: their centres should lie within a few tolerances of the surface (a coarse face is said)
  if (!S.flat && tris.length) {
    const step = Math.max(1, Math.floor(tris.length / 64));
    let worst = 0;
    for (let k = 0; k < tris.length; k += step) {
      const [a, b, c] = tris[k];
      const cen = [(pos[a][0] + pos[b][0] + pos[c][0]) / 3, (pos[a][1] + pos[b][1] + pos[c][1]) / 3, (pos[a][2] + pos[b][2] + pos[c][2]) / 3];
      const cq = [(uvs[a][0] + uvs[b][0] + uvs[c][0]) / 3, (uvs[a][1] + uvs[b][1] + uvs[c][1]) / 3];
      worst = Math.max(worst, len(sub(S.at(...SW(cq)), cen)));
    }
    if (worst > 25 * tol) notes.push('step.face_coarse');
  }
  return { pos, tris, notes };
}

/** Points strictly between two (u, v) points, on a straight line in (u, v), dense enough for the surface (for seams and poles). */
function seamPts(S, a, b, tol, SW, alongPole = false) {
  const n = alongPole ? Math.max(1, Math.ceil(Math.abs(b[0] - a[0]) / MAX_ANGLE)) : Math.max(1, Math.ceil(len(sub(S.at(...SW(a)), S.at(...SW(b)))) / Math.max(tol * 40, 1e-9)));
  const out = [];
  for (let i = 1; i < Math.min(n, 512); i++) out.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]);
  return out;
}

/** The pole's v (in the possibly swapped coordinates) on the side `side` (+1 = larger v), or null when the surface has none there. */
function poleV(S, swap, side) {
  if (swap) return null;
  if (S.kind === 'sphere') return side > 0 ? Math.PI / 2 : -Math.PI / 2;
  if (S.kind === 'cone') {
    // the apex, where R + v·tan(semi) = 0
    const probe = (v) => len(sub(S.at(0, v), S.at(Math.PI, v)));
    const R = probe(0) / 2, k = (probe(1) / 2) - R;
    if (!(Math.abs(k) > 1e-12)) return null;
    const va = -R / k;
    return (va > 0) === (side > 0) ? va : null;
  }
  return null;
}

function fullDomain(S) {
  if (S.kind === 'sphere') return [[0, -Math.PI / 2], [TAU, -Math.PI / 2], [TAU, Math.PI / 2], [0, Math.PI / 2]];
  if (S.kind === 'torus') return [[0, 0], [TAU, 0], [TAU, TAU], [0, TAU]];
  if (S.kind === 'bspline') return [[S.ru[0], S.rv[0]], [S.ru[1], S.rv[0]], [S.ru[1], S.rv[1]], [S.ru[0], S.rv[1]]];
  return null;
}

/** Split inside edges whose middle strays from the surface by more than tol (and the longest inside edge of a triangle whose
 *  centre does), with Delaunay flips in the scaled (u, v); the boundary edges stay as they are. */
function refine(S, uvs, M, p3s, isB, tris0, { tol, su, sv, SW, maxPoints, notes }) {
  const cache = new Map();
  const at = (i) => { let p = cache.get(i); if (!p) { p = p3s[i] || S.at(...SW(uvs[i])); cache.set(i, p); } return p; };
  const key = (a, b) => (a < b ? a * 1048576 + b : b * 1048576 + a);
  const boundary = new Set();
  // boundary edges: the ear-clipped polygon's own edges (consecutive ring points) are the ones used by one triangle only
  const count = new Map();
  for (const t of tris0) for (let k = 0; k < 3; k++) { const e = key(t[k], t[(k + 1) % 3]); count.set(e, (count.get(e) || 0) + 1); }
  for (const [e, c] of count) if (c === 1) boundary.add(e);
  // Delaunay first (in the scaled (u, v)): ear clipping leaves long thin triangles along the boundary that would all be split
  const tris = flips(M, tris0.map((t) => t.slice()), boundary, key, 12);
  const midDev = (a, b) => { const m = [(uvs[a][0] + uvs[b][0]) / 2, (uvs[a][1] + uvs[b][1]) / 2]; return len(sub(S.at(...SW(m)), mul(add(at(a), at(b)), 0.5))); };
  let T = tris.map((t) => t.slice());
  for (let pass = 0; pass < 3; pass++) {
    // edge → triangles
    const edgeT = new Map();
    T.forEach((t, ti) => { for (let k = 0; k < 3; k++) { const e = key(t[k], t[(k + 1) % 3]); const l = edgeT.get(e); if (l) l.push(ti); else edgeT.set(e, [ti]); } });
    const want = new Set();
    for (const [e, l] of edgeT) {
      if (boundary.has(e) || l.length !== 2) continue;
      const a = Math.floor(e / 1048576), b = e % 1048576;
      if (midDev(a, b) > tol) want.add(e);
    }
    T.forEach((t) => {
      const c = [(uvs[t[0]][0] + uvs[t[1]][0] + uvs[t[2]][0]) / 3, (uvs[t[0]][1] + uvs[t[1]][1] + uvs[t[2]][1]) / 3];
      const pc = S.at(...SW(c)), pa = at(t[0]), pb = at(t[1]), pd = at(t[2]);
      const n = cross(sub(pb, pa), sub(pd, pa)), ln = len(n);
      if (!(ln > 0)) return;
      if (Math.abs(dot(sub(pc, pa), n)) / ln <= tol) return;
      let best = -1, bl = -1;
      for (let k = 0; k < 3; k++) { const a = t[k], b = t[(k + 1) % 3], e = key(a, b); if (boundary.has(e)) continue; const l = Math.hypot(M[a][0] - M[b][0], M[a][1] - M[b][1]); if (l > bl) { bl = l; best = e; } }
      if (best >= 0) want.add(best);
    });
    if (!want.size) break;
    if (uvs.length + want.size > maxPoints) { notes.push('step.face_points_cap'); break; }
    // split each wanted edge at its middle (both triangles)
    const mids = new Map();
    for (const e of want) {
      const a = Math.floor(e / 1048576), b = e % 1048576;
      const m = [(uvs[a][0] + uvs[b][0]) / 2, (uvs[a][1] + uvs[b][1]) / 2];
      uvs.push(m); M.push([m[0] * su, m[1] * sv]); p3s.push(null); isB.push(false);
      mids.set(e, uvs.length - 1);
    }
    const next = [];
    for (const t of T) {
      const m = [0, 1, 2].map((k) => mids.get(key(t[k], t[(k + 1) % 3])));
      const n = m.filter((x) => x !== undefined).length;
      if (!n) { next.push(t); continue; }
      const [a, b, c] = t, [mab, mbc, mca] = m;
      if (n === 3) { next.push([a, mab, mca], [mab, b, mbc], [mca, mbc, c], [mab, mbc, mca]); continue; }
      if (n === 1) {
        if (mab !== undefined) next.push([a, mab, c], [mab, b, c]);
        else if (mbc !== undefined) next.push([a, b, mbc], [a, mbc, c]);
        else next.push([a, b, mca], [mca, b, c]);
        continue;
      }
      // two: one corner triangle and a quad split on its shorter diagonal
      if (mab === undefined) next.push([mbc, c, mca], ...quad(M, a, b, mbc, mca));
      else if (mbc === undefined) next.push([a, mab, mca], ...quad(M, mab, b, c, mca));
      else next.push([mab, b, mbc], ...quad(M, a, mab, mbc, c));
    }
    T = next;
    T = flips(M, T, boundary, key);
  }
  return { tris: T };
}

const quad = (M, a, b, c, d) => {   // a b c d CCW: two triangles on the shorter diagonal
  const ac = Math.hypot(M[a][0] - M[c][0], M[a][1] - M[c][1]), bd = Math.hypot(M[b][0] - M[d][0], M[b][1] - M[d][1]);
  return ac <= bd ? [[a, b, c], [a, c, d]] : [[a, b, d], [b, c, d]];
};

/** Lawson flips toward Delaunay in the scaled (u, v), inside edges only, a few rounds. */
function flips(M, T, boundary, key, rounds = 4) {
  for (let round = 0; round < rounds; round++) {
    const edgeT = new Map();
    T.forEach((t, ti) => { for (let k = 0; k < 3; k++) { const e = key(t[k], t[(k + 1) % 3]); const l = edgeT.get(e); if (l) l.push([ti, k]); else edgeT.set(e, [[ti, k]]); } });
    let changed = 0;
    const dead = new Set();
    for (const [e, l] of edgeT) {
      if (boundary.has(e) || l.length !== 2) continue;
      const [[t1, k1], [t2, k2]] = l;
      if (dead.has(t1) || dead.has(t2)) continue;
      const A = T[t1], B = T[t2];
      const a = A[k1], b = A[(k1 + 1) % 3], c = A[(k1 + 2) % 3];     // edge a-b, opposite c
      const d = B[(k2 + 2) % 3];                                      // opposite in the other
      if (B[k2] !== b || B[(k2 + 1) % 3] !== a) continue;             // not the same orientation pair
      // in-circle test: d inside the circle of a b c → flip to c-d (only if the quad is convex)
      const inC = incircle(M[a], M[b], M[c], M[d]);
      if (inC <= 1e-12) continue;
      if (crossO(M[c], M[a], M[d]) <= 0 || crossO(M[d], M[b], M[c]) <= 0) continue;
      T[t1] = [c, a, d]; T[t2] = [d, b, c];
      dead.add(t1); dead.add(t2); changed++;
    }
    if (!changed) break;
  }
  return T;
}
function incircle(a, b, c, d) {
  const adx = a[0] - d[0], ady = a[1] - d[1], bdx = b[0] - d[0], bdy = b[1] - d[1], cdx = c[0] - d[0], cdy = c[1] - d[1];
  return (adx * adx + ady * ady) * (bdx * cdy - cdx * bdy) - (bdx * bdx + bdy * bdy) * (adx * cdy - cdx * ady) + (cdx * cdx + cdy * cdy) * (adx * bdy - bdx * ady);
}

// ---- interior points by constrained Delaunay insertion ------------------------------------------------------------

const angleStep = (r, tol) => Math.min(MAX_ANGLE, r > tol ? 2 * Math.acos(Math.max(-1, 1 - tol / r)) : MAX_ANGLE);

/** Grid steps (du, dv) in parameter units for the surface, or null where the boundary alone is enough. A ruled direction (along
 *  a cylinder's or cone's axis) gets a step four times the other in length, so long thin triangles across the curve are broken. */
function gridSteps(S, tol, swap) {
  let du = 0, dv = 0, rowScale = null;
  switch (S.kind) {
    case 'cylinder': du = angleStep(S.r, tol); dv = 4 * S.r * du; break;
    case 'cone': du = angleStep(S.scale[0], tol); dv = 4 * S.scale[0] * du / S.scale[1]; break;
    case 'sphere': du = dv = angleStep(S.r, tol); rowScale = (v) => Math.max(Math.cos(v), du); break;
    case 'torus': du = angleStep(S.scale[0], tol); dv = angleStep(S.scale[1], tol); break;
    case 'revolution': du = angleStep(S.scale[0], tol); dv = Math.max(S.scale[0] * du, Math.sqrt(8 * tol * S.scale[0])) / S.scale[1]; break;
    case 'extrusion': return swap ? null : { auto: 'u' };   // ruled along v: columns at the outline's own spacing (densify)
    case 'bspline': case 'offset': {
      const P = S.P;
      const nu = P ? P.length : 8, nv = P ? P[0].length : 8;
      du = ((S.ru ? S.ru[1] - S.ru[0] : 1) / Math.max(4, 3 * nu));
      dv = ((S.rv ? S.rv[1] - S.rv[0] : 1) / Math.max(4, 3 * nv));
      break;
    }
    default: return null;
  }
  return swap ? { du: dv, dv: du, rowScale: null } : { du, dv, rowScale };
}

function densify(S, uvs, M, p3s, isB, tris, rings, { tol, su, sv, SW, swap, maxPoints, notes }) {
  let st = gridSteps(S, tol, swap);
  if (st && st.auto === 'u') {
    // the boundary's own spacing in u (the curve's discretisation), its lower quartile; a tall step along the rulings
    const gaps = [];
    for (const r of rings) for (let k = 0; k < r.length; k++) { const d = Math.abs(uvs[r[(k + 1) % r.length]][0] - uvs[r[k]][0]); if (d > 1e-12) gaps.push(d); }
    gaps.sort((x, y) => x - y);
    const du = gaps.length ? gaps[Math.floor(gaps.length / 4)] : 0;
    st = du > 0 ? { du, dv: 4 * du * su / sv, rowScale: null } : null;
  }
  if (!st || !(st.du > 0) || !(st.dv > 0)) return tris;
  // the domain's box, and the boundary's segments in a hash (no point too near the boundary)
  let lo = [Infinity, Infinity], hi = [-Infinity, -Infinity];
  for (const r of rings) for (const i of r) { lo = [Math.min(lo[0], uvs[i][0]), Math.min(lo[1], uvs[i][1])]; hi = [Math.max(hi[0], uvs[i][0]), Math.max(hi[1], uvs[i][1])]; }
  const nu = Math.ceil((hi[0] - lo[0]) / st.du), nv = Math.ceil((hi[1] - lo[1]) / st.dv);
  if (nu * nv > maxPoints) { notes.push('step.face_points_cap'); return tris; }
  if (nu < 2 && nv < 2) return tris;
  const gap = 0.35 * Math.min(st.du * su, st.dv * sv);   // in the scaled plane
  const cell = Math.max(gap, 1e-12), hash = new Map();
  const hk = (x, y) => Math.floor(x / cell) * 73856093 ^ Math.floor(y / cell) * 19349663;
  for (const r of rings) for (let k = 0; k < r.length; k++) {
    const a = M[r[k]], b = M[r[(k + 1) % r.length]];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / cell));
    for (let j = 0; j <= n; j++) { const x = a[0] + (b[0] - a[0]) * j / n, y = a[1] + (b[1] - a[1]) * j / n; const h = hk(x, y); const l = hash.get(h); if (l) l.push([a, b]); else hash.set(h, [[a, b]]); }
  }
  const nearBoundary = (x, y) => {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const l = hash.get(hk(x + dx * cell, y + dy * cell));
      if (!l) continue;
      for (const [a, b] of l) {
        const ex = b[0] - a[0], ey = b[1] - a[1], L2 = ex * ex + ey * ey;
        let t = L2 > 0 ? ((x - a[0]) * ex + (y - a[1]) * ey) / L2 : 0; t = Math.max(0, Math.min(1, t));
        if (Math.hypot(a[0] + ex * t - x, a[1] + ey * t - y) < gap) return true;
      }
    }
    return false;
  };
  // adjacency of the current triangulation (Delaunay first)
  const key = (a, b) => (a < b ? a * 1048576 + b : b * 1048576 + a);
  const count = new Map();
  for (const t of tris) for (let k = 0; k < 3; k++) { const e = key(t[k], t[(k + 1) % 3]); count.set(e, (count.get(e) || 0) + 1); }
  const fixed = new Set([...count].filter(([, c]) => c === 1).map(([e]) => e));
  const T = flips(M, tris.map((t) => t.slice()), fixed, key, 12);
  const N = T.map(() => [-1, -1, -1]);
  {
    const half = new Map();
    T.forEach((t, ti) => { for (let k = 0; k < 3; k++) half.set(t[k] * 1048576 + t[(k + 1) % 3], [ti, k]); });
    T.forEach((t, ti) => { for (let k = 0; k < 3; k++) { const o = half.get(t[(k + 1) % 3] * 1048576 + t[k]); if (o) N[ti][k] = o[0]; } });
  }
  const orient = (a, b, p) => (M[b][0] - M[a][0]) * (p[1] - M[a][1]) - (M[b][1] - M[a][1]) * (p[0] - M[a][0]);
  let last = 0;
  const locate = (p) => {
    let t = Math.min(last, T.length - 1);
    for (let steps = 0; steps < 4 * T.length + 10; steps++) {
      const tri = T[t];
      let moved = false;
      for (let k = 0; k < 3; k++) {
        if (orient(tri[k], tri[(k + 1) % 3], p) < 0) {
          const nb = N[t][k];
          if (nb < 0 || fixed.has(key(tri[k], tri[(k + 1) % 3]))) return -1;   // outside, or across the boundary
          t = nb; moved = true; break;
        }
      }
      if (!moved) return t;
    }
    return -1;
  };
  const nbIndex = (t, of) => N[t].indexOf(of);
  const legalize = (stack) => {
    let guard = 0;
    while (stack.length && guard++ < 100000) {
      const [t, k] = stack.pop();
      const o = N[t][k];
      if (o < 0) continue;
      const a = T[t][k], b = T[t][(k + 1) % 3], c = T[t][(k + 2) % 3];
      if (fixed.has(key(a, b))) continue;
      const ko = nbIndex(o, t);
      if (ko < 0) continue;
      const d = T[o][(ko + 2) % 3];
      if (incircle(M[a], M[b], M[c], M[d]) <= 1e-18) continue;
      // flip a-b to c-d: t = (c, a, d), o = (d, b, c)
      const nAd = N[o][(ko + 1) % 3], nDb = N[o][(ko + 2) % 3];   // across a-d? (o's edges: b-a (ko), a-d (ko+1), d-b (ko+2))
      const nBc = N[t][(k + 1) % 3], nCa = N[t][(k + 2) % 3];
      T[t] = [c, a, d]; T[o] = [d, b, c];
      N[t] = [nCa, nAd, o]; N[o] = [nDb, nBc, t];
      const fix = (x, from, to) => { if (x >= 0) { const j = N[x].indexOf(from); if (j >= 0) N[x][j] = to; } };
      fix(nAd, o, t); fix(nBc, t, o);
      stack.push([t, 1], [o, 0]);
    }
  };
  let added = 0;
  for (let j = 1; j < nv; j++) {
    const v = lo[1] + (hi[1] - lo[1]) * j / nv;
    // the row's own length in 3D sets how many points it gets (a row near a pole or a cone's apex gets few or none)
    let rowLen = 0;
    { let prev = S.at(...SW([lo[0], v])); for (let k = 1; k <= 16; k++) { const q = S.at(...SW([lo[0] + (hi[0] - lo[0]) * k / 16, v])); rowLen += Math.hypot(q[0] - prev[0], q[1] - prev[1], q[2] - prev[2]); prev = q; } }
    const n = Math.round(rowLen / Math.max(st.du * su, 1e-12));
    if (n < 2) continue;
    for (let i = 1; i < n; i++) {
      const u = lo[0] + (hi[0] - lo[0]) * i / n;
      const p = [u * su, v * sv];
      if (nearBoundary(p[0], p[1])) continue;
      const t = locate(p);
      if (t < 0) continue;
      const [a, b, c] = T[t];
      if (Math.abs(orient(a, b, p)) < 1e-14 || Math.abs(orient(b, c, p)) < 1e-14 || Math.abs(orient(c, a, p)) < 1e-14) continue;
      uvs.push([u, v]); M.push(p); p3s.push(null); isB.push(false);
      const q = uvs.length - 1;
      if (uvs.length > maxPoints) { notes.push('step.face_points_cap'); return T; }
      // split t into three: (a, b, q) keeps t; (b, c, q) and (c, a, q) are new
      const [nab, nbc, nca] = N[t];
      const t1 = T.length, t2 = T.length + 1;
      T[t] = [a, b, q]; T.push([b, c, q], [c, a, q]);
      N[t] = [nab, t1, t2]; N.push([nbc, t2, t], [nca, t, t1]);
      const fix = (x, from, to) => { if (x >= 0) { const j2 = N[x].indexOf(from); if (j2 >= 0) N[x][j2] = to; } };
      fix(nbc, t, t1); fix(nca, t, t2);
      legalize([[t, 0], [t1, 0], [t2, 0]]);
      last = t; added++;
    }
  }
  return T;
}
