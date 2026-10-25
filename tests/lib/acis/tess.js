/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tess.js — the faces of decoded ACIS bodies → triangles for display (cc-acis, docs/ACIS-READER.md § 5–6). No DOM.
 *
 *   tessellate(dec, { maxTriangles, step }) → { bodies: [Mesh], notDrawn: Map('reason|what' → n), faces, drawn }
 *   Mesh { positions: Float64Array (x y z …), triangles: Uint32Array, faceOf: Uint32Array (per triangle), faces:
 *          [{ surface, planar, loops? (3D rings, outer first; planar faces) }], closed, sheet, volume, area, box }
 *
 * Every edge is sampled once and shared by the faces on both sides, so a closed shell stays closed. Faces are laid out
 * flat in their surface's own (u, v), checked against their edges, triangulated there (constrained Delaunay, cdt.js,
 * with extra points inside on curved surfaces) and mapped back.
 */

import { cdt } from './cdt.js';
import { surfaceOf, bsEval, bsTransposed, TAU, sub, add, mul, dot, cross, len, dist, unit } from './geom.js';

const STEP = Math.PI / 24;          // 7.5°, the apps' own circles (48 a turn)
const MAX_LOOP = 100000;            // coedges in one loop
const MAX_CHAIN = 1000000;          // faces / loops / lumps followed along their next pointers

export function tessellate(dec, opts = {}) {
  const maxTris = opts.maxTriangles ?? 2000000;
  const step = opts.step ?? STEP;
  const get = dec.get;
  const res = { bodies: [], notDrawn: new Map(), faces: 0, drawn: 0, triangles: 0 };
  const miss = (reason, what = '', n = 1) => { const k = reason + '|' + what; res.notDrawn.set(k, (res.notDrawn.get(k) || 0) + n); };

  // the size of the whole thing (for tolerances): every point record, every sphere / cone / torus radius
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity], rad = 0;
  for (let i = 0; i < dec.records.length; i++) {
    const r = dec.records[i];
    if (!r || !r.name) continue;
    if (r.name === 'point' || /-surface$|-curve$/.test(r.name)) {
      const g = get(i);
      if (!g) continue;
      const ps = g.kind === 'point' ? [g.p] : g.centre ? [g.centre] : g.root ? [g.root] : [];
      for (const p of ps) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); }
      if (g.radius) rad = Math.max(rad, Math.abs(g.radius));
      if (g.major && typeof g.major === 'number') rad = Math.max(rad, Math.abs(g.major) + Math.abs(g.minor || 0));
      if (Array.isArray(g.major)) rad = Math.max(rad, len(g.major));
    }
  }
  let size = Number.isFinite(lo[0]) ? dist(lo, hi) : 0;
  size = Math.max(size, 2 * rad, 1e-9);
  const tol = Math.max((dec.resabs || 1e-6) * 10, size * 1e-5);
  const qWeld = size * 1e-9;

  const pointOf = (vi) => { const v = get(vi, ['vertex']); const p = v && get(v.point, ['point']); return p ? p.p : null; };

  // ---- edges, once each
  const edgeCache = new Map();
  const sampleEdge = (ei) => {
    if (edgeCache.has(ei)) return edgeCache.get(ei);
    const r = sampleEdge0(ei);
    edgeCache.set(ei, r);
    return r;
  };
  const sampleEdge0 = (ei) => {
    const e = get(ei, ['edge']);
    if (!e) return { why: 'cut_off', what: 'edge' };
    const p0 = pointOf(e.v0), p1 = pointOf(e.v1);
    if (!p0 || !p1) return { why: 'cut_off', what: 'vertex' };
    const same = e.v0 === e.v1 || dist(p0, p1) <= tol;
    if (e.curve < 0) return same ? { pts: [p0] } : { why: 'cut_off', what: 'curve' };   // only a point may have no curve
    const c = get(e.curve, ['curve']);
    if (!c) return { why: 'cut_off', what: 'curve' };
    if (c.type === 'straight') {
      if (same) return { pts: [p0] };
      return { pts: [p0, p1] };
    }
    if (c.type === 'ellipse') {
      const N = unit(c.normal), R = len(c.major);
      if (!N || !(R > 0) || !(Math.abs(c.ratio) > 0)) return { why: 'curve', what: 'ellipse-curve' };
      const X = unit(sub(c.major, mul(N, dot(c.major, N)))), Y = cross(N, X), Rm = R * c.ratio, C = c.centre;
      const at = (t) => add(C, add(mul(X, R * Math.cos(t)), mul(Y, Rm * Math.sin(t))));
      const par = (p) => { const d = sub(p, C); return Math.atan2(dot(d, Y) / Rm, dot(d, X) / R); };
      const t0 = par(p0);
      let t1 = par(p1);
      const dir = e.reversed ? -1 : 1;
      if (same) t1 = t0 + dir * TAU;
      else if (dir > 0) { while (t1 <= t0) t1 += TAU; while (t1 - t0 > TAU) t1 -= TAU; }
      else { while (t1 >= t0) t1 -= TAU; while (t0 - t1 > TAU) t1 += TAU; }
      if (dist(at(t0), p0) > tol || dist(at(t1), p1) > tol) return { why: 'off_curve', what: 'ellipse-curve' };
      const st = Math.min(step, R > 0 ? 2 * Math.acos(Math.max(-1, 1 - Math.min(1, size * 2e-4 / Math.max(R, Math.abs(Rm))))) : step);
      const n = Math.min(4096, Math.max(same ? 3 : 1, Math.ceil(Math.abs(t1 - t0) / Math.max(st, 1e-3))));
      const pts = [p0];
      for (let k = 1; k < n; k++) pts.push(at(t0 + ((t1 - t0) * k) / n));
      if (!same) pts.push(p1);
      return { pts };
    }
    if (c.type === 'intcurve') {
      const bs = c.bs;
      if (!bs) return { why: 'curve', what: 'intcurve-curve (' + (c.subtype || '?') + ')' };
      const a = bs.knotsU[bs.degU], b = bs.knotsU[bs.knotsU.length - 1 - bs.degU];
      if (!(b > a)) return { why: 'curve', what: 'intcurve-curve' };
      const N = Math.min(4000, Math.max(64, (bs.nu - bs.degU) * 24));
      const ts = [], ps = [];
      for (let k = 0; k <= N; k++) { const t = a + ((b - a) * k) / N; ts.push(t); ps.push(bsEval(bs, t)); }
      const near = (p) => {
        let bi = 0, bd = Infinity;
        for (let k = 0; k <= N; k++) { const d = dist(ps[k], p); if (d < bd) { bd = d; bi = k; } }
        // refine by halving around the nearest sample
        let lo2 = ts[Math.max(0, bi - 1)], hi2 = ts[Math.min(N, bi + 1)];
        for (let it = 0; it < 60; it++) {
          const m1 = lo2 + (hi2 - lo2) / 3, m2 = hi2 - (hi2 - lo2) / 3;
          if (dist(bsEval(bs, m1), p) < dist(bsEval(bs, m2), p)) hi2 = m2; else lo2 = m1;
        }
        const t = (lo2 + hi2) / 2;
        return { t, d: dist(bsEval(bs, t), p) };
      };
      const A = near(p0), B = same ? A : near(p1);
      if (A.d > tol || B.d > tol) return { why: 'off_curve', what: 'intcurve-curve' };
      let t0 = A.t, t1 = B.t;
      if (same) { t0 = a; t1 = b; }
      const n = Math.max(2, Math.min(4096, Math.ceil((Math.abs(t1 - t0) / (b - a)) * N / 4)));
      const pts = [p0];
      for (let k = 1; k < n; k++) pts.push(bsEval(bs, t0 + ((t1 - t0) * k) / n));
      if (!same) pts.push(p1);
      // the edge runs from p0 to p1 whichever way the curve's parameter goes: the points above already do
      return { pts };
    }
    return { why: 'curve', what: (c.name || c.type) };
  };

  // ---- bodies
  let triBudget = maxTris;
  for (const body of dec.bodies) {
    const faces = [];
    const seenL = new Set();
    for (let li = body.lump, n = 0; li >= 0 && n < MAX_CHAIN && !seenL.has(li); n++) {
      seenL.add(li);
      const lump = get(li, ['lump']);
      if (!lump) { miss('cut_off', 'lump'); break; }
      const seenS = new Set();
      for (let si = lump.shell, m = 0; si >= 0 && m < MAX_CHAIN && !seenS.has(si); m++) {
        seenS.add(si);
        const sh = get(si, ['shell']);
        if (!sh) { miss('cut_off', 'shell'); break; }
        collectFaces(get, sh.face, faces, miss);
        if (sh.subshell >= 0) collectSub(get, sh.subshell, faces, miss, 0);
        si = sh.next;
      }
      li = lump.next;
    }
    if (!faces.length) { miss('wire_body', body.wire >= 0 ? 'wire' : 'empty'); continue; }
    const mesh = { verts: [], tris: [], faceOf: [], faces: [], weld: new Map() };
    const vid = (p) => {
      const k = Math.round(p[0] / qWeld) + ',' + Math.round(p[1] / qWeld) + ',' + Math.round(p[2] / qWeld);
      let id = mesh.weld.get(k);
      if (id === undefined) { id = mesh.verts.length; mesh.verts.push(p); mesh.weld.set(k, id); }
      return id;
    };
    let sheet = false;
    for (const fi of faces) {
      res.faces++;
      const f = get(fi, ['face']);
      if (!f) { miss('cut_off', 'face'); continue; }
      if (f.double) sheet = true;
      if (triBudget <= 0) { miss('too_many', ''); continue; }
      const r = faceTriangles(get, f, { sampleEdge, step, tol, size, miss });
      if (!r) continue;
      if (r.tris.length > triBudget) { miss('too_many', ''); continue; }
      triBudget -= r.tris.length;
      const fIndex = mesh.faces.length;
      mesh.faces.push({ surface: r.surface, planar: r.planar, ...(r.loops ? { loops: r.loops } : {}), reversed: f.reversed, normals: r.normals });
      for (const t of r.tris) {
        const a = vid(t[0]), b = vid(t[1]), c = vid(t[2]);
        if (a === b || b === c || a === c) continue;
        mesh.tris.push(a, b, c);
        mesh.faceOf.push(fIndex);
      }
      res.drawn++;
    }
    if (!mesh.tris.length) continue;
    const tr = body.transform >= 0 ? get(body.transform, ['transform']) : null;
    res.bodies.push(finish(mesh, tr, sheet));
    res.triangles += mesh.tris.length / 3;
  }
  return res;
}

function collectFaces(get, first, out, miss) {
  const seen = new Set();
  for (let fi = first, n = 0; fi >= 0 && n < MAX_CHAIN && !seen.has(fi); n++) {
    seen.add(fi);
    const f = get(fi, ['face']);
    if (!f) { miss('cut_off', 'face'); break; }
    out.push(fi);
    fi = f.next;
  }
}
function collectSub(get, si, out, miss, depth) {
  if (depth > 64) return;
  const seen = new Set();
  for (let i = si, n = 0; i >= 0 && n < MAX_CHAIN && !seen.has(i); n++) {
    seen.add(i);
    const s = get(i, ['subshell']);
    if (!s) break;
    collectFaces(get, s.face, out, miss);
    if (s.child >= 0) collectSub(get, s.child, out, miss, depth + 1);
    i = s.sibling;
  }
}

/** one face → { tris: [[p, p, p]…], surface, planar, loops? } or null (counted) */
function faceTriangles(get, f, ctx) {
  const { miss, tol } = ctx;
  const s = get(f.surface, ['surface']);
  if (!s) { miss('cut_off', 'surface'); return null; }
  const sname = s.type === 'other' ? s.name : s.type === 'spline' && !s.bs ? 'spline-surface (' + (s.subtype || '?') + ')' : s.type + '-surface';
  if (s.type === 'other' || (s.type === 'spline' && !s.bs)) { miss('surface', sname); return null; }
  // the loops' points
  const loops = [];
  const seenL = new Set();
  for (let li = f.loop, n = 0; li >= 0 && n < MAX_CHAIN && !seenL.has(li); n++) {
    seenL.add(li);
    const L = get(li, ['loop']);
    if (!L) { miss('cut_off', 'loop'); return null; }
    const pts = [];
    let ok = true;
    const start = L.coedge;
    let ci = start, k = 0;
    do {
      const ce = get(ci, ['coedge']);
      if (!ce) { miss('cut_off', 'coedge'); return null; }
      const smp = ctx.sampleEdge(ce.edge);
      if (!smp.pts) { miss(smp.why, smp.what); return null; }
      const run = ce.reversed ? smp.pts.slice().reverse() : smp.pts;
      for (const p of run) if (!pts.length || pts[pts.length - 1] !== p && dist(pts[pts.length - 1], p) > 0) pts.push(p);
      ci = ce.next;
      if (++k > MAX_LOOP) { ok = false; break; }
    } while (ci !== start && ci >= 0);
    if (!ok || ci < 0) { miss('loop_open', ''); return null; }
    while (pts.length > 1 && dist(pts[0], pts[pts.length - 1]) <= 0) pts.pop();
    if (pts.length >= 3 || (pts.length >= 1 && s.type !== 'plane')) loops.push(pts);
    li = L.next;
  }
  // the surface, read the way that fits the edges (spec gaps: a cone's angle sign, a spline's point order)
  const tries = s.type === 'cone' ? [surfaceOf(s, 1), surfaceOf(s, -1)]
    : s.type === 'spline' ? [surfaceOf(s), surfaceOf({ ...s, bs: bsTransposed(s.bs) })] : [surfaceOf(s)];
  let surf = null;
  for (const t of tries) {
    if (!t) continue;
    if (loops.every((pts) => pts.every((p) => dist(t.eval(...t.inv(p)), p) <= tol))) { surf = t; break; }
  }
  if (!surf) { miss(tries.some(Boolean) ? 'off_surface' : 'surface', sname); return null; }
  const fsign = f.reversed ? -1 : 1;
  let r;
  try { r = surf.curved ? curvedFace(surf, loops, fsign, ctx) : planarFace(surf, loops, ctx); } catch { r = null; }
  if (!r || !r.tris.length) { miss('layout', sname); return null; }
  // turn every triangle the way the face's outward normal points (the face's own side, flipped when reversed)
  let agree = 0, against = 0;
  for (const t of r.tris) {
    const n = cross(sub(t[1], t[0]), sub(t[2], t[0]));
    const c = mul(add(add(t[0], t[1]), t[2]), 1 / 3);
    const want = mul(surf.normal(...surf.inv(c)), fsign);
    const d = dot(n, want);
    if (d > 0) agree++; else if (d < 0) against++;
  }
  if (against > agree) for (const t of r.tris) { const x = t[1]; t[1] = t[2]; t[2] = x; }
  return { tris: r.tris, surface: surf.type, planar: !surf.curved, loops: r.loops, normals: null };
}

// ---------------------------------------------------------------------------------------------------------------------
// planar faces: loops nested by containment (the outer loops are the even depths)

function planarFace(surf, loops, ctx) {
  const rings = loops.filter((l) => l.length >= 3).map((pts) => ({ pts, uv: pts.map((p) => surf.inv(p)) }));
  if (!rings.length) return null;
  const tris = [], outLoops = [];
  for (const g of nest(rings)) {
    const all = [g.outer, ...g.holes];
    const flat = [], spans = [], P = [];
    for (const r of all) {
      spans.push([P.length, r.uv.length]);
      for (let i = 0; i < r.uv.length; i++) { flat.push(r.uv[i][0], r.uv[i][1]); P.push(r.pts[i]); }
    }
    const idx = cdt(flat, spans);
    for (let i = 0; i < idx.length; i += 3) tris.push([P[idx[i]], P[idx[i + 1]], P[idx[i + 2]]]);
    outLoops.push(all.map((r) => r.pts));
  }
  return { tris, loops: outLoops };
}

/** rings ({uv}) → [{ outer, holes }] by containment depth */
function nest(rings) {
  const area = (uv) => { let a = 0; for (let i = 0; i < uv.length; i++) { const p = uv[i], q = uv[(i + 1) % uv.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
  const info = rings.map((r) => ({ r, A: Math.abs(area(r.uv)) }));
  for (const a of info) {
    a.in = info.filter((b) => b !== a && b.A > a.A && inside(probe(a.r.uv), b.r.uv));
    a.depth = a.in.length;
  }
  const groups = [];
  for (const a of info) if (a.depth % 2 === 0) groups.push({ outer: a.r, a, holes: [] });
  for (const a of info) if (a.depth % 2 === 1) {
    const host = a.in.filter((b) => b.depth === a.depth - 1).sort((x, y) => x.A - y.A)[0];
    const g = host && groups.find((q) => q.a === host);
    if (g) g.holes.push(a.r);
  }
  return groups;
}
/** a point of a ring that is not on another ring's vertex: the middle of its first edge */
const probe = (uv) => [(uv[0][0] + uv[1 % uv.length][0]) / 2, (uv[0][1] + uv[1 % uv.length][1]) / 2];
function inside(p, uv) {
  let c = false;
  for (let i = 0, j = uv.length - 1; i < uv.length; j = i++) {
    const a = uv[i], b = uv[j];
    if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

// ---------------------------------------------------------------------------------------------------------------------
// curved faces

/**
 * A loop's points → [{u, v, p}] with angles unwound along it, poles / the apex split into two points at the angles on
 * either side, and how many times it winds round in u and in v.
 */
function loopUV(surf, pts, tol) {
  const n = pts.length;
  const isPole = (p, uv) => {
    if (surf.type === 'sphere') return Math.cos(uv[1]) * surf.scaleU <= tol;
    if (surf.type === 'cone' && surf.poles) return surf.radiusAt(uv[1]) <= tol;
    return false;
  };
  const raw = pts.map((p) => { const uv = surf.inv(p); return { u: uv[0], v: uv[1], p, pole: isPole(p, uv) }; });
  const Pu = surf.periodicU, Pv = surf.periodicV;
  const wrap = (d, P) => { if (!P) return d; while (d > P / 2) d -= P; while (d < -P / 2) d += P; return d; };
  const good = raw.filter((x) => !x.pole);
  if (!good.length) return null;
  // unwind u (and v on a torus) along the non-pole points; a jump of exactly half a turn (through a pole) is given the
  // sign that keeps the running total nearest nought
  let total = 0, totalV = 0;
  for (let i = 0; i < good.length; i++) {
    if (i === 0) continue;
    let du = wrap(good[i].u - good[i - 1].u, Pu);
    if (Pu && Math.abs(Math.abs(du) - Pu / 2) < 1e-6) du = total > 0 ? -Pu / 2 : Pu / 2;
    good[i].u = good[i - 1].u + du; total += du;
    const dv = wrap(good[i].v - good[i - 1].v, Pv);
    good[i].v = good[i - 1].v + dv; totalV += dv;
  }
  let du = wrap(good[0].u - good[good.length - 1].u, Pu);
  if (Pu && Math.abs(Math.abs(du) - Pu / 2) < 1e-6) du = total > 0 ? -Pu / 2 : Pu / 2;
  total += du;
  totalV += wrap(good[0].v - good[good.length - 1].v, Pv);
  const wu = Pu ? Math.round(total / Pu) : 0, wv = Pv ? Math.round(totalV / Pv) : 0;
  // poles: (u before, v pole), (u after, v pole); both map to the pole itself
  const out = [];
  for (let i = 0; i < n; i++) {
    const x = raw[i];
    if (!x.pole) { out.push({ u: x.u, v: x.v, p: x.p }); continue; }
    let a = i - 1, b = i + 1;
    while (raw[(a + n) % n].pole && a > i - n) a--;
    while (raw[b % n].pole && b < i + n) b++;
    const A = raw[(a + n) % n], B = raw[b % n];
    let ua = A.u, ub = B.u;
    // B comes after A along the loop; at the end of the list it is the first point again, one winding further on
    if (b >= n) ub += wu * Pu;
    if (a < 0) ua -= wu * Pu;
    const vp = surf.type === 'sphere' ? (x.v > 0 ? Math.PI / 2 : -Math.PI / 2) : surf.inv(x.p)[1];
    out.push({ u: ua, v: vp, p: x.p }, { u: ub, v: vp, p: x.p });
  }
  return { pts: out, wu, wv };
}

function curvedFace(surf, loops, fsign, ctx) {
  const { tol, step } = ctx;
  const Pu = surf.periodicU, Pv = surf.periodicV;
  // the side of (u, v): +1 when u × v points along the face's outward normal
  const orient = (() => {
    const at = loops.length && loops[0].length ? surf.inv(loops[0][0]) : [0.3, 0.2];
    let [u, v] = at;
    if (surf.poles && surf.type === 'sphere') v = Math.max(-1.2, Math.min(1.2, v));
    if (surf.type === 'cone' && surf.poles) { /* stay off the apex */ const ap = surf.poles[0] ?? surf.poles[1]; if (Math.abs(v - ap) < 1e-9) v += 1e-3 * (surf.scaleU || 1); }
    // finite differences, each a small step in its own parameter's units
    const eu = surf.type === 'spline' ? 1e-5 * (surf.domain[1] - surf.domain[0]) : 1e-5;
    const ev = surf.type === 'spline' ? 1e-5 * (surf.domain[3] - surf.domain[2]) : surf.type === 'cone' ? 1e-5 * surf.scaleU : 1e-5;
    if (surf.type === 'spline') { u = Math.min(surf.domain[1] - eu, Math.max(surf.domain[0] + eu, u)); v = Math.min(surf.domain[3] - ev, Math.max(surf.domain[2] + ev, v)); }
    const Puv = sub(surf.eval(u + eu, v), surf.eval(u - eu, v)), Pvv = sub(surf.eval(u, v + ev), surf.eval(u, v - ev));
    const n = cross(Puv, Pvv);
    return dot(n, surf.normal(u, v)) * fsign >= 0 ? 1 : -1;
  })();
  const L = [];
  for (const pts of loops) {
    const r = loopUV(surf, pts, tol);
    if (!r) return null;
    L.push(r);
  }
  // scaled coordinates for shapes and distances
  const su = surf.scaleU || 1, sv = surf.scaleV || 1;
  const stepU = surf.type === 'spline' ? (surf.domain[1] - surf.domain[0]) / 16 : step;
  const stepV = surf.type === 'spline' ? (surf.domain[3] - surf.domain[2]) / 16 : surf.type === 'cone' ? Math.max(step * su * 3, 1e-12) : step;
  const segV = (a, b) => Math.max(1, Math.ceil(Math.abs(b - a) / stepV));
  const segU = (a, b) => Math.max(1, Math.ceil(Math.abs(b - a) / stepU));
  const synth = (u, v) => ({ u, v, p: surf.eval(u, v) });
  const area = (q) => { let a = 0; for (let i = 0; i < q.length; i++) { const p = q[i], r = q[(i + 1) % q.length]; a += p.u * r.v - r.u * p.v; } return a / 2; };

  let wind = L.filter((l) => l.wu || l.wv), plain = L.filter((l) => !l.wu && !l.wv && l.pts.length >= 3);
  const shiftLoop = (l, du, dv) => ({ ...l, pts: l.pts.map((x) => ({ u: x.u + du, v: x.v + dv, p: x.p })) });
  const centre = (l) => { let u = 0, v = 0; for (const x of l.pts) { u += x.u; v += x.v; } return [u / l.pts.length, v / l.pts.length]; };
  /** move a non-winding loop by whole turns so its middle lies in [u0, u0 + Pu) (and [v0, v0 + Pv)) */
  const into = (l, u0, v0) => {
    const [cu, cv] = centre(l);
    const ku = Pu ? Math.floor((cu - u0) / Pu) : 0, kv = Pv && v0 !== null ? Math.floor((cv - v0) / Pv) : 0;
    return ku || kv ? shiftLoop(l, -ku * Pu, -kv * Pv) : l;
  };
  /** a u where no plain loop is (the middle of the widest gap), to cut the surface open at */
  const freeU = () => {
    if (!Pu || !plain.length) return wind.length ? wind[0].pts[0].u : 0;
    const iv = plain.map((l) => { let a = Infinity, b = -Infinity; for (const x of l.pts) { a = Math.min(a, x.u); b = Math.max(b, x.u); } return [a, b]; });
    const base = iv[0][0];
    const segs = iv.map(([a, b]) => { const k = Math.floor((a - base) / Pu); return [a - k * Pu, b - k * Pu]; }).sort((x, y) => x[0] - y[0]);
    let best = segs[0][1], gap = -Infinity, end = segs[0][1];
    for (let i = 1; i <= segs.length; i++) {
      const nextStart = i < segs.length ? segs[i][0] : segs[0][0] + Pu;
      if (nextStart - end > gap) { gap = nextStart - end; best = (end + nextStart) / 2; }
      if (i < segs.length) end = Math.max(end, segs[i][1]);
    }
    return gap > 0 ? best : base;
  };

  let regions = [];   // [{ outer: [{u,v,p}], holes: [[{u,v,p}]] }]
  if (!wind.length) {
    if (surf.type === 'sphere' || surf.type === 'torus') {
      // closed surfaces: the loops' turning says which side the face is on (left of each loop, seen from outside)
      const u0 = freeU(), v0 = Pv ? -Math.PI : null;
      const placed = plain.map((l) => into(l, u0, v0));
      const outs = placed.filter((l) => area(l.pts) * orient > 0), holes = placed.filter((l) => area(l.pts) * orient <= 0);
      if (!outs.length) {
        const c = freeU();
        const ua = c, ub = c + Pu;
        const va = surf.type === 'sphere' ? -Math.PI / 2 : (Pv ? freeV(holes) : 0), vb = surf.type === 'sphere' ? Math.PI / 2 : va + Pv;
        const rect = [];
        for (let k = 0; k < segU(ua, ub); k++) rect.push(synth(ua + ((ub - ua) * k) / segU(ua, ub), va));
        for (let k = 0; k < segV(va, vb); k++) rect.push(synth(ub, va + ((vb - va) * k) / segV(va, vb)));
        for (let k = 0; k < segU(ua, ub); k++) rect.push(synth(ub - ((ub - ua) * k) / segU(ua, ub), vb));
        for (let k = 0; k < segV(va, vb); k++) rect.push(synth(ua, vb - ((vb - va) * k) / segV(va, vb)));
        regions.push({ outer: rect, holes: holes.map((h) => into(h, ua, va).pts) });
      } else {
        for (const o of outs) regions.push({ outer: o.pts, holes: [] });
        for (const h of holes) {
          const host = regions.find((g) => inside([h.pts[0].u, h.pts[0].v], g.outer.map((x) => [x.u, x.v])));
          if (host) host.holes.push(h.pts);
        }
      }
    } else {
      // open surfaces (cone, cylinder, spline): nesting, as on a plane
      const u0 = Pu ? freeU() - Pu / 2 : 0;
      const placed = plain.map((l) => into(l, u0, null));
      for (const g of nest(placed.map((l) => ({ l, uv: l.pts.map((x) => [x.u * su, x.v * sv]) })))) {
        regions.push({ outer: g.outer.l.pts, holes: g.holes.map((h) => h.l.pts) });
      }
    }
  } else {
    // winding loops: a band between two, or a cap over a pole / apex from one
    let axisV = false;
    if (wind.every((l) => !l.wu && l.wv)) axisV = true;
    else if (!wind.every((l) => l.wu && !l.wv)) return null;
    // work with the winding direction as "u": swap for loops round a torus' tube (the side flips with the swap)
    const sw = (x) => ({ u: x.v, v: x.u, p: x.p });
    let W = wind.map((l) => (axisV ? { pts: l.pts.map(sw), w: l.wv } : { pts: l.pts, w: l.wu }));
    let H = plain.map((l) => (axisV ? { pts: l.pts.map(sw) } : { pts: l.pts }));
    const P = axisV ? Pv : Pu, Q = axisV ? Pu : Pv, o = axisV ? -orient : orient;
    const evalS = (u, v) => (axisV ? surf.eval(v, u) : surf.eval(u, v));
    const syn = (u, v) => ({ u, v, p: evalS(u, v) });
    const stepA = axisV ? stepV : stepU, stepB = axisV ? stepU : stepV;
    const segA = (a, b) => Math.max(1, Math.ceil(Math.abs(b - a) / stepA)), segB = (a, b) => Math.max(1, Math.ceil(Math.abs(b - a) / stepB));
    /** the loop as a run in +u from index i to i + one turn */
    const run = (l, i) => {
      let pts = l.w < 0 ? l.pts.slice().reverse() : l.pts;
      const n = pts.length;
      if (l.w < 0) i = n - 1 - i;
      const outp = [];
      for (let t = 0; t <= n; t++) { const k = (i + t) % n, wrapN = Math.floor((i + t) / n); outp.push({ u: pts[k].u + wrapN * P * Math.abs(l.w), v: pts[k].v, p: pts[k].p }); }
      return outp;
    };
    if (W.length === 2) {
      let [A, B] = W[0].w > 0 ? W : [W[1], W[0]];   // A: the lower edge (the face lies on its left, +v seen from outside)
      if (Q) {
        // on a torus the band can go either way round the other angle: from A up to B on the face's side
        const va = centre(A)[1], vb = centre(B)[1];
        let d = vb - va;
        if (o > 0) { while (d <= 0) d += Q; while (d > Q) d -= Q; } else { while (d >= 0) d -= Q; while (d < -Q) d += Q; }
        B = shiftLoop(B, 0, va + d - vb);
      }
      // the closest pair of points across, to cut the band open along
      let bi = 0, bj = 0, bd = Infinity;
      const busy = (u) => H.some((h) => { let a = Infinity, b = -Infinity; for (const x of h.pts) { a = Math.min(a, x.u); b = Math.max(b, x.u); } const k = Math.floor((u - a) / P); const uu = u - k * P; return uu >= a && uu <= b; });
      for (let i = 0; i < A.pts.length; i++) for (let j = 0; j < B.pts.length; j++) {
        let du = (B.pts[j].u - A.pts[i].u) % P; if (du > P / 2) du -= P; if (du < -P / 2) du += P;
        const d = Math.hypot(du * (axisV ? sv : su), (B.pts[j].v - A.pts[i].v) * (axisV ? su : sv)) + (busy(A.pts[i].u) ? 1e9 : 0);
        if (d < bd) { bd = d; bi = i; bj = j; }
      }
      const ra = run(A, bi), rbRaw = run(B, bj);
      const k = Math.round((ra[0].u - rbRaw[0].u) / P);
      const rb = rbRaw.map((x) => ({ u: x.u + k * P, v: x.v, p: x.p }));
      const a0 = ra[0], a1 = ra[ra.length - 1], b0 = rb[0], b1 = rb[rb.length - 1];
      const cut = (from, to) => { const n = Math.max(segB(from.v, to.v), segA(from.u, to.u)); const outp = []; for (let t = 1; t < n; t++) outp.push(syn(from.u + ((to.u - from.u) * t) / n, from.v + ((to.v - from.v) * t) / n)); return outp; };
      // A's run (a0 → a1 = a0 one turn on), up the far cut (a1 → b1), B's run backwards (b1 → b0), down the near cut
      // (b0 → a0). The two cuts are one turn apart, so their points are the same in 3D and weld.
      const c1 = cut(a1, b1);
      const c0 = cut(a0, b0).reverse();
      const outer = [...ra, ...c1, ...rb.slice().reverse(), ...c0];
      const lowU = a0.u;
      const holes = H.map((h) => { const [cu] = centre(h); const kk = Math.floor((cu - lowU) / P); return h.pts.map((x) => ({ u: x.u - kk * P, v: x.v, p: x.p })); });
      regions.push({ outer, holes, axisV });
    } else if (W.length === 1 && surf.poles) {
      const A = W[0];
      let vp;
      if (surf.type === 'cone') vp = surf.poles[0] ?? surf.poles[1];
      else { const side = A.w * o; vp = side > 0 ? surf.poles[1] : surf.poles[0]; }
      if (vp === null || vp === undefined) return null;
      const ra = run(A, 0);
      const a0 = ra[0], a1 = ra[ra.length - 1];
      const up = []; for (let t = 1, n = segB(a1.v, vp); t < n; t++) up.push(syn(a1.u, a1.v + ((vp - a1.v) * t) / n));
      const top = []; for (let t = 0, n = segA(a1.u, a0.u); t <= n; t++) top.push(syn(a1.u + ((a0.u - a1.u) * t) / n, vp));
      const down = []; for (let t = 1, n = segB(vp, a0.v); t < n; t++) down.push(syn(a0.u, vp + ((a0.v - vp) * t) / n));
      const outer = [...ra.slice(0, -1), a1, ...up, ...top, ...down];
      const holes = H.map((h) => { const [cu] = centre(h); const kk = Math.floor((cu - a0.u) / P); return h.pts.map((x) => ({ u: x.u - kk * P, v: x.v, p: x.p })); });
      regions.push({ outer, holes, axisV });
    } else return null;
  }

  // triangulate each region in scaled (u, v) with extra points inside on a grid of one step (each nudged off the grid
  // lines by a fixed pseudo-random amount, so no four are on one circle); the boundary keeps only its edge points, so
  // neighbouring faces still meet exactly
  const tris = [];
  for (const g of regions) {
    const sx = g.axisV ? sv : su, sy = g.axisV ? su : sv;
    const back = g.axisV ? (u, v) => surf.eval(v, u) : (u, v) => surf.eval(u, v);
    const rings = [g.outer, ...g.holes];
    const flat = [], spans = [], P3 = [];
    for (const r of rings) {
      spans.push([P3.length, r.length]);
      for (const x of r) { flat.push(x.u * sx, x.v * sy); P3.push(x.p); }
    }
    let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
    for (const x of g.outer) { u0 = Math.min(u0, x.u); u1 = Math.max(u1, x.u); v0 = Math.min(v0, x.v); v1 = Math.max(v1, x.v); }
    const gu = g.axisV ? stepV : stepU, gv = g.axisV ? stepU : stepV;
    const nu = Math.max(1, Math.round((u1 - u0) / gu)), nv = Math.max(1, Math.round((v1 - v0) / gv));
    if (nu * nv > 1 && nu * nv <= MAX_GRID) {
      const cu = (u1 - u0) / nu, cv = (v1 - v0) / nv;
      const segs = [];
      for (const r of rings) for (let i = 0; i < r.length; i++) { const a = r[i], b = r[(i + 1) % r.length]; segs.push([a.u * sx, a.v * sy, b.u * sx, b.v * sy]); }
      const minD = 0.35 * Math.min(cu * sx, cv * sy);
      const polys = rings.map((r) => r.map((x) => [x.u * sx, x.v * sy]));
      // only the segments near a row can be near a point on it
      const rowSegs = [];
      for (let j = 0; j < nv; j++) {
        const y0 = (v0 + cv * (j - 0.5)) * sy - minD, y1 = (v0 + cv * (j + 1.5)) * sy + minD;
        rowSegs.push(segs.filter((s) => Math.max(s[1], s[3]) >= Math.min(y0, y1) && Math.min(s[1], s[3]) <= Math.max(y0, y1)));
      }
      for (let i = 0; i < nu; i++) for (let j = 0; j < nv; j++) {
        const u = u0 + cu * (i + 0.5 + 0.3 * jitter(i, j)), v = v0 + cv * (j + 0.5 + 0.3 * jitter(j + 7, i));
        const q = [u * sx, v * sy];
        let ins = false;
        for (const pl of polys) if (inside(q, pl)) ins = !ins;
        if (!ins) continue;
        let near = false;
        for (const s of rowSegs[j]) if (segDist(q, s) < minD) { near = true; break; }
        if (near) continue;
        flat.push(q[0], q[1]);
        P3.push(back(u, v));
      }
    }
    const idx = cdt(flat, spans);
    for (let i = 0; i < idx.length; i += 3) tris.push([P3[idx[i]], P3[idx[i + 1]], P3[idx[i + 2]]]);
  }
  return { tris, loops: null };

  function freeV(holes) {
    if (!holes.length) return -Math.PI;
    const [, cv] = centre(holes[0]);
    return cv + Math.PI;
  }
}

/** a fixed pseudo-random number in [-0.5, 0.5) for grid cell (i, j): the same every time, so a face always comes out the same */
function jitter(i, j) { const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s) - 0.5; }
const MAX_GRID = 200000;   // grid cells looked at in one face

function segDist(q, s) {
  const dx = s[2] - s[0], dy = s[3] - s[1];
  const l2 = dx * dx + dy * dy;
  let t = l2 > 0 ? ((q[0] - s[0]) * dx + (q[1] - s[1]) * dy) / l2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(q[0] - s[0] - t * dx, q[1] - s[1] - t * dy);
}


// ---------------------------------------------------------------------------------------------------------------------
// one body's mesh: transform, closed or not, volume

function finish(mesh, tr, sheet) {
  let V = mesh.verts;
  let flip = false;
  if (tr) {
    const [a, b, c] = tr.rows, s = tr.s, t = tr.t;
    // p' = s · (p · M) + t (row vectors; docs § 4)
    V = V.map((p) => [s * (p[0] * a[0] + p[1] * b[0] + p[2] * c[0]) + t[0], s * (p[0] * a[1] + p[1] * b[1] + p[2] * c[1]) + t[1], s * (p[0] * a[2] + p[1] * b[2] + p[2] * c[2]) + t[2]]);
    const det = a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
    flip = det * s * s * s < 0;
    for (const f of mesh.faces) if (f.loops) f.loops = f.loops.map((g) => g.map((r) => r.map((p) => [s * (p[0] * a[0] + p[1] * b[0] + p[2] * c[0]) + t[0], s * (p[0] * a[1] + p[1] * b[1] + p[2] * c[1]) + t[1], s * (p[0] * a[2] + p[1] * b[2] + p[2] * c[2]) + t[2]])));
  }
  const T = mesh.tris;
  if (flip) for (let i = 0; i < T.length; i += 3) { const x = T[i + 1]; T[i + 1] = T[i + 2]; T[i + 2] = x; }
  // closed: every edge used by exactly two triangles, once each way
  const edges = new Map();
  const key = (a, b) => a * 4294967296 + b;
  for (let i = 0; i < T.length; i += 3) for (let k = 0; k < 3; k++) {
    const a = T[i + k], b = T[i + (k + 1) % 3];
    edges.set(key(a, b), (edges.get(key(a, b)) || 0) + 1);
  }
  let closed = T.length > 0;
  for (const [k, n] of edges) {
    const a = Math.floor(k / 4294967296), b = k % 4294967296;
    if (n !== 1 || edges.get(key(b, a)) !== 1) { closed = false; break; }
  }
  // a closed shell whose faces disagree on the inside (a convention we read wrong) is made consistent, face by face
  if (!closed && !sheet) {
    const fixed = makeConsistent(T, mesh.faceOf, edges, key);
    if (fixed) closed = true;
  }
  let vol = 0, area = 0;
  for (let i = 0; i < T.length; i += 3) {
    const p = V[T[i]], q = V[T[i + 1]], r = V[T[i + 2]];
    vol += dot(p, cross(q, r)) / 6;
    area += len(cross(sub(q, p), sub(r, p))) / 2;
  }
  if (closed && vol < 0) { for (let i = 0; i < T.length; i += 3) { const x = T[i + 1]; T[i + 1] = T[i + 2]; T[i + 2] = x; } vol = -vol; }
  const box = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  const pos = new Float64Array(V.length * 3);
  V.forEach((p, i) => { pos[i * 3] = p[0]; pos[i * 3 + 1] = p[1]; pos[i * 3 + 2] = p[2]; for (let k = 0; k < 3; k++) { box[k] = Math.min(box[k], p[k]); box[k + 3] = Math.max(box[k + 3], p[k]); } });
  return {
    positions: pos, triangles: Uint32Array.from(T), faceOf: Uint32Array.from(mesh.faceOf),
    faces: mesh.faces.map((f) => ({ surface: f.surface, planar: f.planar, ...(f.loops ? { loops: f.loops } : {}) })),
    closed, sheet: sheet || !closed, volume: closed ? vol : null, area, box,
  };
}

/**
 * Faces turned the wrong way in an otherwise closed shell: flip whole faces so that every edge is used once each way.
 * → true when that made the shell closed (T changed in place), else false (T unchanged).
 */
function makeConsistent(T, faceOf, edges, key) {
  // undirected edge → [triangle…]
  const und = new Map();
  for (let i = 0; i < T.length; i += 3) for (let k = 0; k < 3; k++) {
    const a = T[i + k], b = T[i + (k + 1) % 3], kk = a < b ? key(a, b) : key(b, a);
    let l = und.get(kk); if (!l) und.set(kk, l = []);
    l.push(i / 3);
  }
  for (const l of und.values()) if (l.length !== 2) return false;
  const nf = faceOf.length ? Math.max(...faceOf) + 1 : 0;
  const flipF = new Int8Array(nf).fill(0);   // 0 unknown, 1 keep, -1 flip
  const dirOf = (t, a, b) => { for (let k = 0; k < 3; k++) if (T[t * 3 + k] === a && T[t * 3 + (k + 1) % 3] === b) return 1; return -1; };
  const trisOf = new Map();
  for (let t = 0; t < faceOf.length; t++) { let l = trisOf.get(faceOf[t]); if (!l) trisOf.set(faceOf[t], l = []); l.push(t); }
  // faces next to each other: same face's triangles agree already (made so above); across faces: opposite directions
  const adj = new Map();
  for (const [kk, [t1, t2]] of und) {
    const f1 = faceOf[t1], f2 = faceOf[t2];
    const a = Math.floor(kk / 4294967296), b = kk % 4294967296;
    const same = dirOf(t1, a, b) === dirOf(t2, a, b);   // same direction = they disagree
    if (f1 === f2) { if (same) return false; continue; }
    for (const [x, y] of [[f1, f2], [f2, f1]]) { let l = adj.get(x); if (!l) adj.set(x, l = []); l.push([y, same]); }
  }
  for (let f0 = 0; f0 < nf; f0++) {
    if (flipF[f0] || !trisOf.has(f0)) continue;
    flipF[f0] = 1;
    const stack = [f0];
    while (stack.length) {
      const f = stack.pop();
      for (const [g, same] of adj.get(f) || []) {
        const want = same ? -flipF[f] : flipF[f];
        if (!flipF[g]) { flipF[g] = want; stack.push(g); } else if (flipF[g] !== want) return false;
      }
    }
  }
  for (let t = 0; t < faceOf.length; t++) if (flipF[faceOf[t]] === -1) { const x = T[t * 3 + 1]; T[t * 3 + 1] = T[t * 3 + 2]; T[t * 3 + 2] = x; }
  return true;
}
