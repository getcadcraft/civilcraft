/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * construct.js — cc-nurbs (0.8 SU.747b, session `nurbs`): untrimmed surfaces from curves. DOM-free.
 *
 * Every constructor returns { surface, report } where report says what was exact and, where a construction is fitted, the
 * deviation it measured (mm, sampled between the fitting samples) — never a claim that was not checked.
 *
 * Sources (published, cited): The NURBS Book (Piegl & Tiller, 2nd ed.) § 8.3 extruded and ruled surfaces, A8.1 surface of
 * revolution, § 10.3 skinning (common degree and knots, § 5.5 and A5.4; parameters averaged over the columns), § 10.4 swept
 * surfaces (by skinning placed copies of the section); rotation-minimising frames by double reflection (Wang, Jüttler, Zheng,
 * Liu, "Computation of rotation minimizing frames", ACM TOG 27(1), 2008); Gordon surfaces (W. J. Gordon, "Spline-blended surface
 * interpolation through curve networks", J. Math. Mech. 18, 1969: S = Lu + Lv − T); bilinearly blended Coons patches
 * (S. A. Coons, MIT Project MAC TR-41, 1967); Fritsch–Carlson monotone cubic interpolation (SIAM J. Numer. Anal. 17, 1980) for
 * the reparametrisation in Gordon's step 3.
 *
 *   compatible(curves) → curves of one degree and one knot vector on [0, 1] (exact: elevation + knot insertion)
 *   extrude(curve, dir) · ruled(a, b) · revolve(profile, axisPoint, axisDir, angle = 2π)  (all exact)
 *   loft(sections, { degree = 3, params, kind, d0, d1 }) — sections are curves in u, the result passes through each at its v
 *   sweep1(profile, rail, { tol, frame: 'rmf' | 'fixed', scale(t), twist(t), maxSections }) — the profile as drawn at the rail's
 *     start, carried along by a rotation-minimising frame (or a fixed one), skinned through more sections until the surface at
 *     the mid-sections is within tol of the true placement
 *   sweep2(profile, rail1, rail2, { tol, keepHeight, maxSections }) — the profile's ends ride on the two rails (scaled to the gap)
 *   network(profiles, guides, { tol, fitTol }) → a Gordon surface through a grid of curves (each profile meets each guide once)
 *   coons(c0, c1, d0, d1, { tol }) — four boundary curves meeting at the corners (c0 = S(u,0), c1 = S(u,1), d0 = S(0,v), d1 = S(1,v))
 *   offset(s, d, { tol }) · extend(s, edge, length) (exact: the edge span's own polynomial carried on) · rebuild(s, nu, nv, du, dv)
 *   planarPatch(corners) (a bilinear patch through 4 points) · polynomial(curve, tol) (a rational curve fitted as a polynomial one)
 */
import * as B from './basis.js';
import * as C from './curve.js';
import * as F from './fit.js';
import * as S from './surface.js';
import * as V from './vec.js';

const { fail } = C;

// ------------------------------------------------------------------------------------------------ compatibility

function unionKnots(list) {
  const map = new Map();
  for (const U of list) for (const k of B.distinctKnots(U)) {
    const key = Math.round(k.u * 1e12) / 1e12;
    map.set(key, Math.max(map.get(key) || 0, k.m));
  }
  return [...map.entries()].sort((a, b) => a[0] - b[0]);
}

/** Bring curves to one degree and one knot vector on [0, 1] (no curve moves). */
export function compatible(curves) {
  if (!curves.length) return [];
  const p = Math.max(...curves.map((c) => c.deg));
  let cs = curves.map((c) => C.elevate(C.reparam(c, 0, 1), p - c.deg));
  const all = unionKnots(cs.map((c) => c.knots));
  cs = cs.map((c) => {
    let out = c;
    for (const [u, m] of all) {
      if (u <= 0 || u >= 1) continue;
      const have = B.multiplicity(out.knots, u, 1e-12);
      if (m > have) out = C.insertKnot(out, u, m - have);
    }
    // snap knot values that differ only by rounding, so every curve carries the identical vector
    return out;
  });
  const K = cs[0].knots;
  return cs.map((c) => ({ ...c, knots: K.slice() }));
}

const rowsToSurface = (degU, degV, knotsU, knotsV, H) => S.fromHGrid(degU, degV, knotsU, knotsV, H);

// ------------------------------------------------------------------------------------------------ exact constructions

export function extrude(curve, dir) {
  const H = C.hcvs(curve);
  const cvs = H.map((q) => [q, [q[0] + dir[0] * q[3], q[1] + dir[1] * q[3], q[2] + dir[2] * q[3], q[3]]]);
  return { surface: rowsToSurface(curve.deg, 1, curve.knots, [0, 0, 1, 1], cvs), report: { exact: true } };
}

export function ruled(a, b) {
  const [ca, cb] = compatible([a, b]), Ha = C.hcvs(ca), Hb = C.hcvs(cb);
  return { surface: rowsToSurface(ca.deg, 1, ca.knots, [0, 0, 1, 1], Ha.map((q, i) => [q, Hb[i]])), report: { exact: true } };
}

/** A8.1: revolve a profile about an axis; the profile runs in u, the rotation in v. */
export function revolve(profile, axisPoint, axisDir, angle = 2 * Math.PI) {
  const Z = V.norm(axisDir);
  if (V.len(Z) === 0) fail('nurbs.err.axis');
  const H = C.hcvs(profile);
  let ref = null;
  const rows = profile.cvs.map((p, i) => {
    const o = V.add(axisPoint, V.mul(Z, V.dot(V.sub(p, axisPoint), Z)));
    const x = V.sub(p, o), r = V.len(x);
    if (r > 1e-14 && !ref) ref = V.norm(x);
    return { o, x: r > 1e-14 ? V.norm(x) : null, r, w: H[i][3] };
  });
  if (!ref) fail('nurbs.err.on_axis');
  let arcKnots = null;
  const cvs = rows.map((row) => {
    const X = row.x || ref, Y = V.cross(Z, X);
    const a = C.arc(row.o, X, Y, row.r, 0, angle);
    arcKnots = a.knots;
    return C.hcvs(a).map((q) => V.mul(q, row.w));
  });
  return { surface: rowsToSurface(profile.deg, 2, profile.knots, arcKnots, cvs), report: { exact: true } };
}

export function planarPatch([p00, p10, p11, p01]) {
  return { degU: 1, degV: 1, knotsU: [0, 0, 1, 1], knotsV: [0, 0, 1, 1], cvs: [[p00.slice(), p01.slice()], [p10.slice(), p11.slice()]], w: null };
}

// ------------------------------------------------------------------------------------------------ skinning

/** § 10.3: v parameters averaged over the control-point columns (chord or centripetal). */
function skinParams(H, kind) {
  const ns = H.length, t = new Array(ns).fill(0);
  if (ns < 2) return [0];
  const cols = H[0].length;
  for (let j = 0; j < cols; j++) {
    const pts = H.map((row) => row[j].slice(0, 3).map((x) => x / row[j][3]));
    const tj = F.params(pts, kind);
    for (let k = 0; k < ns; k++) t[k] += tj[k] / cols;
  }
  t[0] = 0; t[ns - 1] = 1;
  return t;
}

export function loft(sections, { degree = 3, params = null, kind = 'chord', d0 = null, d1 = null } = {}) {
  if (sections.length < 2) fail('nurbs.err.sections', { min: 2 });
  const cs = compatible(sections), H = cs.map((c) => C.hcvs(c));
  const t = params ? params.slice() : skinParams(H, kind);
  for (let k = 1; k < t.length; k++) if (!(t[k] > t[k - 1])) fail('nurbs.err.sections_order');
  // one interpolation per control-point column, all with the same matrix; homogeneous values, so rational sections stay exact
  const cols = H[0].map((_, i) => H.map((row) => row[i]));
  const dd = (d) => (d ? d.map((x) => [x[0], x[1], x[2], 0]) : null);
  const r = F.interpolateMany(cols, t, degree, { d0: dd(d0), d1: dd(d1) });
  const surface = rowsToSurface(cs[0].deg, r.deg, cs[0].knots, r.knots, r.rows);
  return { surface, report: { exact: true, params: t } };
}

// ------------------------------------------------------------------------------------------------ sweeps

/** Frames along a curve at parameters ts: rotation-minimising (double reflection) from the start's frame, or fixed. */
export function frames(rail, ts, { frame = 'rmf', up = null } = {}) {
  const fine = [];
  const [a, b] = C.domain(rail), N = Math.max(64, ts.length * 8);
  for (let i = 0; i <= N; i++) fine.push(a + (b - a) * i / N);
  const all = [...new Set([...fine, ...ts])].sort((x, y) => x - y);
  const T0 = C.tangent(rail, all[0]);
  let r = up ? V.norm(V.sub(up, V.mul(T0, V.dot(up, T0)))) : null;
  if (!r || V.len(r) < 1e-9) {
    const kv = C.curvatureVector(rail, all[0]);
    r = V.len(kv) > 1e-9 ? V.norm(kv) : V.perp(T0);
  }
  const out = new Map();
  let x = C.point(rail, all[0]), t = T0;
  out.set(all[0], { o: x, t, r, s: V.cross(t, r) });
  for (let i = 1; i < all.length; i++) {
    const x1 = C.point(rail, all[i]), t1 = C.tangent(rail, all[i]);
    if (frame === 'fixed') r = V.norm(V.sub(r, V.mul(t1, V.dot(r, t1))));
    else {
      const v1 = V.sub(x1, x), c1 = V.dot(v1, v1);
      if (c1 > 1e-300) {
        const rL = V.sub(r, V.mul(v1, 2 / c1 * V.dot(v1, r))), tL = V.sub(t, V.mul(v1, 2 / c1 * V.dot(v1, t)));
        const v2 = V.sub(t1, tL), c2 = V.dot(v2, v2);
        r = c2 > 1e-300 ? V.sub(rL, V.mul(v2, 2 / c2 * V.dot(v2, rL))) : rL;
      }
      r = V.norm(V.sub(r, V.mul(t1, V.dot(r, t1))));
    }
    x = x1; t = t1;
    out.set(all[i], { o: x1, t: t1, r, s: V.cross(t1, r) });
  }
  return ts.map((u) => out.get(u));
}

function placeProfile(profile, f0, f, scale = 1, twist = 0) {
  // profile coordinates in the start frame (r, s, t), turned by `twist` about t, scaled, set in frame f
  const c = Math.cos(twist), sn = Math.sin(twist);
  return {
    deg: profile.deg, knots: profile.knots.slice(), w: profile.w ? profile.w.slice() : null,
    cvs: profile.cvs.map((p) => {
      const d = V.sub(p, f0.o);
      let a = V.dot(d, f0.r), b = V.dot(d, f0.s);
      const z = V.dot(d, f0.t);
      [a, b] = [a * c - b * sn, a * sn + b * c];
      return V.add(f.o, V.add(V.add(V.mul(f.r, a * scale), V.mul(f.s, b * scale)), V.mul(f.t, z * scale)));
    }),
  };
}

function sweepBy(place, { tol, maxSections, degree = 3 }) {
  // place(t) → the section at rail parameter t ∈ [0, 1]; sections added until the mid-sections are within tol
  let n = 4, last = null;
  for (;;) {
    const ts = Array.from({ length: n + 1 }, (_, i) => i / n);
    const secs = place(ts);
    const { surface } = loft(secs, { degree, params: ts });
    const mids = ts.slice(0, -1).map((x, i) => (x + ts[i + 1]) / 2), ref = place(mids);
    let dev = 0;
    mids.forEach((v, k) => {
      const sec = ref[k], [a, b] = C.domain(sec);
      for (let i = 0; i <= 12; i++) { const u = a + (b - a) * i / 12; dev = Math.max(dev, V.dist(S.point(surface, (u - a) / (b - a), v), C.point(sec, u))); }
    });
    last = { surface, report: { exact: false, deviation: dev, sections: n + 1, tol } };
    if (dev <= tol || n >= maxSections) return last;
    n = Math.min(maxSections, n * 2);
  }
}

export function sweep1(profile, rail, { tol = 0.01, frame = 'rmf', scale = null, twist = null, up = null, maxSections = 256 } = {}) {
  const r = C.reparam(rail, 0, 1), pr = C.reparam(profile, 0, 1);
  const f0 = frames(r, [0], { frame, up })[0];
  return sweepBy((ts) => {
    const fs = frames(r, ts, { frame, up });
    return ts.map((t, k) => placeProfile(pr, f0, fs[k], scale ? scale(t) : 1, twist ? twist(t) : 0));
  }, { tol, maxSections });
}

export function sweep2(profile, rail1, rail2, { tol = 0.01, keepHeight = false, maxSections = 256 } = {}) {
  const r1 = C.reparam(rail1, 0, 1), r2 = C.reparam(rail2, 0, 1), pr = C.reparam(profile, 0, 1);
  const frameAt = (t) => {
    const A = C.point(r1, t), Bp = C.point(r2, t), x = V.sub(Bp, A), d = V.len(x);
    if (d < 1e-12) fail('nurbs.err.rails_meet');
    const X = V.mul(x, 1 / d);
    let Z = V.add(C.tangent(r1, t), C.tangent(r2, t));
    Z = V.sub(Z, V.mul(X, V.dot(Z, X)));
    if (V.len(Z) < 1e-12) Z = V.perp(X);
    Z = V.norm(Z);
    return { o: A, X, Y: V.cross(Z, X), Z, d };
  };
  const g0 = frameAt(0);
  const e = C.endsOf(pr);
  if (V.dist(e.start, g0.o) > Math.max(tol, 1e-6 * g0.d) * 10 || V.dist(e.end, V.add(g0.o, V.mul(g0.X, g0.d))) > Math.max(tol, 1e-6 * g0.d) * 10) fail('nurbs.err.profile_off_rails');
  const local = pr.cvs.map((p) => { const q = V.sub(p, g0.o); return [V.dot(q, g0.X), V.dot(q, g0.Y), V.dot(q, g0.Z)]; });
  return sweepBy((ts) => ts.map((t) => {
    const g = frameAt(t), s = g.d / g0.d, sh = keepHeight ? 1 : s;
    return { deg: pr.deg, knots: pr.knots.slice(), w: pr.w ? pr.w.slice() : null, cvs: local.map(([a, b, c]) => V.add(g.o, V.add(V.add(V.mul(g.X, a * s), V.mul(g.Y, b * sh)), V.mul(g.Z, c * sh)))) };
  }), { tol, maxSections });
}

// ------------------------------------------------------------------------------------------------ networks

/** A rational curve as a polynomial one within tol (Gordon and Coons sums need one weight everywhere). */
export function polynomial(c, tol = 1e-6) {
  if (!c.w) return { curve: c, deviation: 0 };
  const r = C.reparam(c, 0, 1);
  return F.fitTo((t) => C.point(r, t), Math.max(3, c.deg), tol, { start: c.cvs.length * 2 });
}

/** Closest pair of parameters between two curves (polylines first, then Newton on |A(s) − B(t)|²). */
export function curveCurve(A, Bc) {
  const [a0, a1] = C.domain(A), [b0, b1] = C.domain(Bc);
  const K = 96;
  let best = { s: a0, t: b0, d: Infinity };
  for (let i = 0; i <= K; i++) {
    const s = a0 + (a1 - a0) * i / K, p = C.point(A, s), q = C.closestParam(Bc, p);
    if (q.d < best.d) best = { s, t: q.u, d: q.d };
  }
  let { s, t } = best;
  for (let it = 0; it < 40; it++) {
    const da = C.derivs(A, s, 2), db = C.derivs(Bc, t, 2), r = V.sub(da[0], db[0]);
    const f = V.dot(r, da[1]), g = -V.dot(r, db[1]);
    const J00 = V.dot(da[1], da[1]) + V.dot(r, da[2]), J01 = -V.dot(da[1], db[1]), J11 = V.dot(db[1], db[1]) - V.dot(r, db[2]);
    const det = J00 * J11 - J01 * J01;
    if (Math.abs(det) < 1e-300) break;
    const ds = -(J11 * f - J01 * g) / det, dt = -(J00 * g - J01 * f) / det;
    const sn = Math.min(a1, Math.max(a0, s + ds)), tn = Math.min(b1, Math.max(b0, t + dt));
    const moved = Math.abs(sn - s) + Math.abs(tn - t);
    s = sn; t = tn;
    if (moved < 1e-15) break;
  }
  const d = V.dist(C.point(A, s), C.point(Bc, t));
  return d <= best.d ? { s, t, d } : best;
}

function pchip(x, y) {
  const n = x.length, h = [], dlt = [], m = new Array(n).fill(0);
  for (let i = 0; i + 1 < n; i++) { h.push(x[i + 1] - x[i]); dlt.push((y[i + 1] - y[i]) / h[i]); }
  if (n === 2) { m[0] = m[1] = dlt[0]; }
  else {
    for (let i = 1; i + 1 < n; i++) {
      if (dlt[i - 1] * dlt[i] <= 0) m[i] = 0;
      else { const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1]; m[i] = (w1 + w2) / (w1 / dlt[i - 1] + w2 / dlt[i]); }
    }
    m[0] = ((2 * h[0] + h[1]) * dlt[0] - h[0] * dlt[1]) / (h[0] + h[1]);
    if (Math.sign(m[0]) !== Math.sign(dlt[0])) m[0] = 0; else if (Math.sign(dlt[0]) !== Math.sign(dlt[1]) && Math.abs(m[0]) > 3 * Math.abs(dlt[0])) m[0] = 3 * dlt[0];
    const k = n - 1;
    m[k] = ((2 * h[k - 1] + h[k - 2]) * dlt[k - 1] - h[k - 1] * dlt[k - 2]) / (h[k - 1] + h[k - 2]);
    if (Math.sign(m[k]) !== Math.sign(dlt[k - 1])) m[k] = 0; else if (Math.sign(dlt[k - 1]) !== Math.sign(dlt[k - 2]) && Math.abs(m[k]) > 3 * Math.abs(dlt[k - 1])) m[k] = 3 * dlt[k - 1];
  }
  return (t) => {
    let i = 0;
    while (i + 2 < n && t > x[i + 1]) i++;
    const hh = h[i], s = (t - x[i]) / hh, s2 = s * s, s3 = s2 * s;
    return (2 * s3 - 3 * s2 + 1) * y[i] + (s3 - 2 * s2 + s) * hh * m[i] + (-2 * s3 + 3 * s2) * y[i + 1] + (s3 - s2) * hh * m[i + 1];
  };
}

/** A family whose curves meet the other family at their own parameters `own[k][j]`, brought onto shared parameters `common[j]`. */
function family(curves, own, common, fitTol) {
  let exact = true;
  const out = curves.map((c, k) => {
    const same = own[k].every((x, j) => Math.abs(x - common[j]) <= 1e-9);
    if (same && !c.w) return c;
    exact = false;
    const r = pchip(common, own[k]);
    return F.fitTo((t) => C.point(c, r(t)), Math.max(3, c.deg), fitTol, { start: c.cvs.length + common.length }).curve;
  });
  return { curves: out, exact };
}

function makeSame(surfs) {
  // one degree each way and one knot vector each way (exact)
  const du = Math.max(...surfs.map((s) => s.degU)), dv = Math.max(...surfs.map((s) => s.degV));
  let ss = surfs.map((s) => { let o = s; if (o.degU < du) o = S.elevate(o, 'u', du - o.degU); if (o.degV < dv) o = S.elevate(o, 'v', dv - o.degV); return o; });
  for (const dir of ['u', 'v']) {
    const all = unionKnots(ss.map((s) => (dir === 'u' ? s.knotsU : s.knotsV)));
    ss = ss.map((s) => {
      let o = s;
      for (const [x, m] of all) {
        if (x <= 0 || x >= 1) continue;
        const have = B.multiplicity(dir === 'u' ? o.knotsU : o.knotsV, x, 1e-12);
        if (m > have) o = S.insertKnot(o, dir, x, m - have);
      }
      return o;
    });
    const K = dir === 'u' ? ss[0].knotsU : ss[0].knotsV;
    ss = ss.map((s) => (dir === 'u' ? { ...s, knotsU: K.slice() } : { ...s, knotsV: K.slice() }));
  }
  return ss;
}

function sumNets(a, b, c) {
  // a + b − c, control point by control point (polynomial nets of one shape)
  return { ...a, cvs: a.cvs.map((row, i) => row.map((p, j) => V.sub(V.add(p, b.cvs[i][j]), c.cvs[i][j]))), w: null };
}

export function network(profiles, guides, { tol = 0.01, fitTol = null } = {}) {
  if (profiles.length < 2 || guides.length < 2) fail('nurbs.err.network_size');
  fitTol = fitTol == null ? tol / 10 : fitTol;
  let P = profiles.map((c) => C.reparam(c, 0, 1)), G = guides.map((c) => C.reparam(c, 0, 1));
  // order: guides along the first profile, profiles along the first guide; curves running backwards turned round
  const orderBy = (list, ref) => list.map((c, i) => ({ c, i, at: curveCurve(ref, c) })).sort((x, y) => x.at.s - y.at.s);
  G = orderBy(G, P[0]).map((x) => x.c);
  P = orderBy(P, G[0]).map((x) => x.c);
  const X = P.map((p) => G.map((g) => curveCurve(p, g)));
  let gap = 0;
  for (const row of X) for (const x of row) gap = Math.max(gap, x.d);
  if (gap > tol) fail('nurbs.err.network_gap', { gap });
  P = P.map((p, k) => (X[k][X[k].length - 1].s < X[k][0].s ? C.reverse(p) : p));
  G = G.map((g, j) => (X[X.length - 1][j].t < X[0][j].t ? C.reverse(g) : g));
  const Y = P.map((p) => G.map((g) => curveCurve(p, g)));
  const ownU = Y.map((row) => row.map((x) => x.s)), ownV = G.map((_, j) => Y.map((row) => row[j].t));
  const ubar = G.map((_, j) => ownU.reduce((s, r) => s + r[j], 0) / P.length), vbar = P.map((_, k) => ownV.reduce((s, r) => s + r[k], 0) / G.length);
  // the outer curves bound the surface: ū and v̄ run 0…1 between the first and last curve of the other family
  const norm01 = (a) => a.map((x) => (x - a[0]) / (a[a.length - 1] - a[0]));
  const ub = norm01(ubar), vb = norm01(vbar);
  const trimTo = (c, a, b) => C.reparam(C.segment(c, Math.max(a, 0), Math.min(b, 1)), 0, 1);
  const Pt = P.map((p, k) => trimTo(p, ownU[k][0], ownU[k][G.length - 1]));
  const Gt = G.map((g, j) => trimTo(g, ownV[j][0], ownV[j][P.length - 1]));
  const ownU2 = Pt.map((_, k) => norm01(ownU[k])), ownV2 = Gt.map((_, j) => norm01(ownV[j]));
  const fp = family(Pt, ownU2, ub, fitTol), fg = family(Gt, ownV2, vb, fitTol);
  const Lu = loft(fp.curves, { params: vb, degree: Math.min(3, P.length - 1) }).surface;
  const Lv = S.swap(loft(fg.curves, { params: ub, degree: Math.min(3, G.length - 1) }).surface);
  // T: tensor interpolation of the crossing points (the average of the two curves' points there)
  const Q = ub.map((u, j) => vb.map((v, k) => V.mul(V.add(C.point(fp.curves[k], u), C.point(fg.curves[j], v)), 0.5)));
  const du = Math.min(3, G.length - 1), dv = Math.min(3, P.length - 1);
  const rowsV = F.interpolateMany(Q, vb, dv);
  const cols = rowsV.rows[0].map((_, jj) => rowsV.rows.map((r) => r[jj]));
  const colsU = F.interpolateMany(cols, ub, du);
  const T = { degU: colsU.deg, degV: rowsV.deg, knotsU: colsU.knots, knotsV: rowsV.knots, cvs: colsU.rows[0].map((_, i) => colsU.rows.map((col) => col[i])), w: null };
  const [a, b, c] = makeSame([Lu, Lv, T]);
  const surface = sumNets(a, b, c);
  // measured: every curve of the network against the surface
  let dev = 0;
  fp.curves.forEach((cv, k) => { for (let i = 0; i <= 24; i++) dev = Math.max(dev, V.dist(S.point(surface, i / 24, vb[k]), C.point(Pt[k], ownU2[k].length ? pchip(ub, ownU2[k])(i / 24) : i / 24))); });
  fg.curves.forEach((cv, j) => { for (let i = 0; i <= 24; i++) dev = Math.max(dev, V.dist(S.point(surface, ub[j], i / 24), C.point(Gt[j], pchip(vb, ownV2[j])(i / 24)))); });
  return { surface, report: { exact: fp.exact && fg.exact, deviation: dev, gap, profiles: P.length, guides: G.length, uParams: ub, vParams: vb } };
}

export function coons(c0, c1, d0, d1, { tol = 1e-6 } = {}) {
  let [a, b, l, r] = [c0, c1, d0, d1].map((c) => C.reparam(c, 0, 1));
  // orient: a and b run from l to r; l and r run from a to b
  const near = (p, q) => V.dist(p, q);
  const E = (c) => C.endsOf(c);
  if (near(E(a).start, E(l).start) > near(E(a).end, E(l).start) && near(E(a).end, E(l).start) < near(E(a).start, E(l).end)) a = C.reverse(a);
  if (near(E(l).start, E(a).start) > near(E(l).end, E(a).start)) l = C.reverse(l);
  if (near(E(r).start, E(a).end) > near(E(r).end, E(a).end)) r = C.reverse(r);
  if (near(E(b).start, E(l).end) > near(E(b).end, E(l).end)) b = C.reverse(b);
  const P00 = E(a).start, P10 = E(a).end, P01 = E(b).start, P11 = E(b).end;
  const gap = Math.max(near(P00, E(l).start), near(P10, E(r).start), near(P01, E(l).end), near(P11, E(r).end));
  const size = Math.max(near(P00, P11), near(P10, P01), 1e-9);
  if (gap > Math.max(tol, 1e-9 * size) * 1e3) fail('nurbs.err.corners', { gap });
  let dev = 0;
  [a, b, l, r] = [a, b, l, r].map((c) => { const q = polynomial(c, tol); dev = Math.max(dev, q.deviation); return q.curve; });
  const Ru = ruled(a, b).surface, Rv = S.swap(ruled(l, r).surface);
  const T = planarPatch([P00, P10, P11, P01]);
  const [x, y, z] = makeSame([Ru, Rv, T]);
  return { surface: sumNets(x, y, z), report: { exact: dev === 0, deviation: dev, cornerGap: gap } };
}

// ------------------------------------------------------------------------------------------------ edits that make a new surface

export function offset(s, d, { tol = 0.01, maxCvs = 60 } = {}) {
  const s01 = S.reparam(s);
  const r = F.fitSurfaceTo((u, v) => V.add(S.point(s01, u, v), V.mul(S.normal(s01, u, v), d)), Math.max(3, s.degU), Math.max(3, s.degV), tol, { maxCvs, start: [s.cvs.length, s.cvs[0].length] });
  return { surface: r.surface, report: { exact: false, deviation: r.deviation, tol } };
}

export function rebuild(s, nu, nv, du = 3, dv = 3) {
  const s01 = S.reparam(s), Su = Math.max(nu * 4, 16), Sv = Math.max(nv * 4, 16);
  const tu = Array.from({ length: Su + 1 }, (_, i) => i / Su), tv = Array.from({ length: Sv + 1 }, (_, j) => j / Sv);
  const out = F.fitSurfaceGrid(tu.map((u) => tv.map((v) => S.point(s01, u, v))), tu, tv, Math.min(du, nu - 1), Math.min(dv, nv - 1), B.clampedUniform(nu, Math.min(du, nu - 1)), B.clampedUniform(nv, Math.min(dv, nv - 1)));
  let dev = 0;
  for (let i = 0; i < Su; i++) for (let j = 0; j < Sv; j++) { const u = (i + 0.5) / Su, v = (j + 0.5) / Sv; dev = Math.max(dev, V.dist(S.point(out, u, v), S.point(s01, u, v))); }
  return { surface: out, report: { exact: false, deviation: dev } };
}

/** Carry the surface on past an edge by `length` (mm, measured along the cross direction at the edge's middle). Exact: the
 *  last knot span's own polynomial is continued (de Casteljau past the end), so the joint is as smooth as the span itself;
 *  the joint knot is left at multiplicity p (the shape there is the same polynomial on both sides). */
export function extend(s, edge, length) {
  if (!(length > 0)) fail('nurbs.err.length');
  S.edgeParams(s, edge);
  const dir = edge[0], flip = edge[1] === '0';
  let w = s;
  if (dir === 'v') w = S.swap(w);
  if (flip) w = S.reverse(w, 'u');
  w = S.reparam(w);
  const p = w.degU, ks = B.distinctKnots(w.knotsU), last = ks[ks.length - 2].u;
  const piece = last > 0 ? S.split(w, 'u', last)[1] : w;
  const Hp = S.hgrid(piece);
  const build = (du) => {
    const t = (1 + du - last) / (1 - last), sCut = (1 - last) / (1 + du - last);
    const extRows = Hp[0].map((_, j) => {
      // Bézier points of the span's polynomial on [last, 1 + du]: the left chain of de Casteljau at t > 1 …
      let q = Hp.map((r) => r[j].slice());
      const left = [q[0]];
      for (let r = 1; r <= p; r++) { const nx = []; for (let i = 0; i + 1 < q.length; i++) nx.push(V.comb(q[i], 1 - t, q[i + 1], t)); q = nx; left.push(q[0]); }
      // … split at sCut (the old end, u = 1): the right part is the extension on [1, 1 + du]
      let z = left;
      const right = [];
      for (let r = 1; r <= p; r++) { right.push(z[z.length - 1]); const nx = []; for (let i = 0; i + 1 < z.length; i++) nx.push(V.comb(z[i], 1 - sCut, z[i + 1], sCut)); z = nx; }
      right.push(z[0]);
      return right.reverse();
    });
    const knotsU = w.knotsU.slice(0, w.knotsU.length - 1);
    for (let i = 0; i <= p; i++) knotsU.push(1 + du);
    const net = S.hgrid(w);
    for (let i = 1; i <= p; i++) net.push(extRows.map((row) => row[i]));
    const ext = S.fromHGrid(p, w.degV, [...new Array(p + 1).fill(0), ...new Array(p + 1).fill(1)], w.knotsV, extRows[0].map((_, i) => extRows.map((row) => row[i])));
    return { out: S.fromHGrid(p, w.degV, knotsU.map((x) => x / (1 + du)), w.knotsV, net), ext };
  };
  // the added length is measured along the middle iso-curve across the edge; secant steps on du until it is `length`
  const lenOf = (du) => C.arcLength(S.isoCurve(build(du).ext, 'v', 0.5));
  let d0 = length / (V.len(S.derivs(w, 1, 0.5, 1)[1][0]) || 1), l0 = lenOf(d0), d1 = d0 * length / Math.max(l0, 1e-300), l1 = lenOf(d1);
  for (let it = 0; it < 30 && Math.abs(l1 - length) > 1e-10 * length; it++) {
    const dn = l1 === l0 ? d1 * length / l1 : d1 + (length - l1) * (d1 - d0) / (l1 - l0);
    d0 = d1; l0 = l1; d1 = dn > 0 ? dn : d1 / 2; l1 = lenOf(d1);
  }
  let out = build(d1).out;
  if (flip) out = S.reverse(out, 'u');
  if (dir === 'v') out = S.swap(out);
  return { surface: out, report: { exact: true, length: l1, joint: flip ? d1 / (1 + d1) : 1 / (1 + d1) } };
}
