/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * step.js — cc-nurbs (0.8 SU.747b, session `nurbs`): STEP for exactly what S1 makes — B-spline curves and untrimmed B-spline
 * surfaces, rational or not — written and read back without loss. DOM-free. lib/step (cc-step, owner `engineer` in 0.8) owns
 * STEP in general and reads any file as triangles; this module is the B-spline entity writer it does not have (D7.45: no writer
 * in the kernel either) and a reader for our own files. Whether it moves into lib/step is asked in docs/0.8-sessions/engineer.md.
 *
 * Written from the published schemas only (ISO 10303-21 the file; -42 geometry and topology: b_spline_curve_with_knots,
 * b_spline_surface_with_knots, rational_b_spline_curve/surface as complex instances in alphabetical order, advanced_face,
 * open_shell, shell_based_surface_model; -43 manifold_surface_shape_representation, geometric_curve_set inside a
 * geometrically_bounded_wireframe_shape_representation; AP242's product structure). No STEP library's code read.
 *
 * Each surface is one advanced face bounded by its four edge curves (exact iso-curves; an edge that has collapsed to a point is
 * left out of the loop), in an open shell of its own — S1 has no sewing, so neighbours are separate shells. Curves go in a
 * geometric curve set.
 *
 *   writeStep(doc, { name, author, org, time, tol }) → text (AP242, millimetres). 0.9 SU.747c (nurbs-s3-09): each solid of the patch set
 *     as ONE MANIFOLD_SOLID_BREP of a CLOSED_SHELL (shellOf: edges and vertices shared between faces, POLYLINE edge curves) in an
 *     ADVANCED_BREP_SHAPE_REPRESENTATION; faces outside solids as before. writeStepReport(doc) → { text, solids: [{ closed, faces,
 *     edges, vertices, loops, euler, why }] }. readStep turns each MANIFOLD_SOLID_BREP back into a solid of the patch set
 *   readStep(text) → doc (cadcraft-nurbs) with every B-spline face surface and curve-set curve, in mm; NurbsError nurbs.err.step_*
 *   parseP21(text) → Map(id → { type, params } | { type: '', parts }) (the small Part 21 reader readStep uses; capped)
 */
import * as B from './basis.js';
import * as C from './curve.js';
import * as S from './surface.js';
import * as D from './doc.js';
import * as TR from './trim.js';
import * as V from './vec.js';
import * as SO from './solid.js';
import * as CO from './construct.js';

const { fail } = C;
export const MAX_BYTES = 200 * 1024 * 1024;
export const MAX_ENTITIES = 4000000;

// ------------------------------------------------------------------------------------------------ writing

export function real(x) {
  if (!Number.isFinite(x)) fail('nurbs.err.step_number');
  if (Object.is(x, -0)) x = 0;
  let s = String(x).toUpperCase();
  if (!s.includes('.')) s = s.includes('E') ? s.replace('E', '.E') : s + '.';
  return s;
}
export function str(x) {
  let o = '';
  for (const ch of String(x)) {
    const c = ch.codePointAt(0);
    if (ch === "'") o += "''";
    else if (ch === '\\') o += '\\\\';
    else if (c >= 32 && c < 127) o += ch;
    else if (c < 0x10000) o += '\\X2\\' + c.toString(16).toUpperCase().padStart(4, '0') + '\\X0\\';
    else o += '\\X4\\' + c.toString(16).toUpperCase().padStart(8, '0') + '\\X0\\';
  }
  return "'" + o + "'";
}

function knotLists(U, p, n) {
  // STEP keeps distinct knots and their multiplicities (clamped: p + 1 at each end)
  const ks = B.distinctKnots(U);
  void p; void n;
  return { mults: ks.map((k) => k.m), knots: ks.map((k) => k.u) };
}

// ------------------------------------------------------------------------------------------------ one closed shell (0.9 SU.747c)

/**
 * The topology of a solid's faces for a closed shell (0.9 SU.747c, nurbs-s3-09): every face's bounds (its trim loops, or the patch's own
 * edges) followed on the surface, oriented counter-clockwise about the OUTWARD normal (solid.sew says which way out is), then cut into
 * edges where the face on the other side changes; each edge is found once on each of its two faces (running opposite ways) and becomes
 * ONE edge curve shared by both, between shared vertices. A seam (a closed surface meeting itself) is an edge used twice by one face.
 * → { faces: [{ item, sense, loops: [[{ e, fwd }]] }], edges: [{ pts, v0, v1 }], verts: [p], stats } or null with a reason when the
 * faces do not pair up edge for edge (the writer then keeps open shells: nothing is claimed that was not found).
 */
export function shellOf(items, { tol = SO.TOL } = {}) {
  const sw = SO.sew(items, { tol });
  if (!sw.closed) return { fail: 'open' };
  let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < sw.positions.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], sw.positions[i + k]); hi[k] = Math.max(hi[k], sw.positions[i + k]); }
  const size = Math.max(1e-9, V.dist(lo, hi)), gTol = Math.max(2 * tol, 1e-6 * size), cap = size / 64;
  // which way each face's Su × Sv points: out (sense true) or in
  const sense = items.map((it, f) => {
    let acc = 0;
    for (let t = 0; t < sw.triangles; t++) {
      if (sw.triFace[t] !== f) continue;
      const p = [0, 1, 2].map((j) => { const v = sw.tris[t * 3 + j]; return [sw.positions[v * 3], sw.positions[v * 3 + 1], sw.positions[v * 3 + 2]]; });
      const g = V.cross(V.sub(p[1], p[0]), V.sub(p[2], p[0]));
      const u = (sw.cornerUV[t * 6] + sw.cornerUV[t * 6 + 2] + sw.cornerUV[t * 6 + 4]) / 3, v = (sw.cornerUV[t * 6 + 1] + sw.cornerUV[t * 6 + 3] + sw.cornerUV[t * 6 + 5]) / 3;
      acc += V.dot(g, S.normal(it.surface, u, v));
    }
    return acc >= 0;
  });
  // the bounds as dense points on the surface, counter-clockwise about the outward normal, no step longer than `cap`
  const loops = [];   // { f, k (loop index in face), P: [p], UV: [uv] }
  items.forEach((it, f) => {
    const s = it.surface, [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
    const L0 = [it.trim && it.trim.outer ? it.trim.outer : [[ua, va], [ub, va], [ub, vb], [ua, vb]], ...(it.trim ? it.trim.holes : [])];
    L0.forEach((L, k) => {
      const Lo = sense[f] ? L : L.slice().reverse();
      const dense = [];
      for (let i = 0; i < Lo.length; i++) {
        const a = Lo[i], b = Lo[(i + 1) % Lo.length], pa = S.point(s, a[0], a[1]), pb = S.point(s, b[0], b[1]);
        const n = Math.min(4096, Math.max(1, Math.ceil(V.dist(pa, pb) / cap)));
        for (let j = 0; j < n; j++) dense.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n]);
      }
      const on = TR.onSurface(s, dense, { tol: Math.min(1e-3, tol / 20) });
      const P = [], UV = [];
      for (const q of on) if (!P.length || V.dist(P[P.length - 1], q.p) > 1e-9 * size) { P.push(q.p); UV.push(q.uv); }
      while (P.length > 1 && V.dist(P[0], P[P.length - 1]) <= 1e-9 * size) { P.pop(); UV.pop(); }
      if (P.length >= 2) loops.push({ f, k, P, UV });
    });
  });
  // every step's middle: the nearest step of another bound (another face, or the same face's bound far along it: a seam)
  const segDist = (p, a, b) => { const d = V.sub(b, a), l2 = V.dot(d, d); const t = l2 > 0 ? Math.min(1, Math.max(0, V.dot(V.sub(p, a), d) / l2)) : 0; return V.dist(p, V.add(a, V.mul(d, t))); };
  const h = Math.max(cap, gTol), grid = new Map(), ck = (x, y, z) => x + ',' + y + ',' + z;
  loops.forEach((lp, li) => lp.P.forEach((a, i) => {
    const b = lp.P[(i + 1) % lp.P.length], n = Math.ceil(V.dist(a, b) / h) + 1, seen = new Set();
    for (let j = 0; j <= n; j++) {
      const q = V.lerp(a, b, j / n), c = q.map((x) => Math.floor(x / h));
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
        const key = ck(c[0] + dx, c[1] + dy, c[2] + dz);
        if (seen.has(key)) continue; seen.add(key);
        let l = grid.get(key); if (!l) grid.set(key, l = []); l.push([li, i]);
      }
    }
  }));
  const partner = loops.map((lp, li) => lp.P.map((a, i) => {
    const b = lp.P[(i + 1) % lp.P.length], m = V.lerp(a, b, 0.5), c = m.map((x) => Math.floor(x / h)), n = lp.P.length;
    let best = null;
    const dir = V.sub(b, a);
    for (const [lj, j] of grid.get(ck(c[0], c[1], c[2])) || []) {
      if (lj === li && j === i) continue;
      const q = loops[lj].P, qa = q[j], qb = q[(j + 1) % q.length];
      // the other side of an edge runs the opposite way (the next step of the same bound goes on the same way: never a partner)
      if (V.dot(dir, V.sub(qb, qa)) >= 0) continue;
      const d = segDist(m, qa, qb);
      if (d <= gTol && (!best || d < best.d)) best = { lj, j, d };
    }
    void n;
    return best;
  }));
  if (partner.some((l) => l.some((x) => !x))) return { fail: 'unpaired' };
  // runs: consecutive steps whose partner is the same bound, going on step by step
  // two partner steps go on from one another: the same step, or steps no further apart than this bound's own steps (the two sides
  // of an edge are followed at different densities)
  const touch = (a, b, reach) => {
    if (a.lj !== b.lj) return false;
    if (a.j === b.j) return true;
    const q = loops[a.lj].P, n = q.length, a0 = q[a.j], a1 = q[(a.j + 1) % n], b0 = q[b.j], b1 = q[(b.j + 1) % n];
    return Math.min(segDist(a0, b0, b1), segDist(a1, b0, b1), segDist(b0, a0, a1), segDist(b1, a0, a1)) <= reach + gTol;
  };
  const runs = [], runOf = loops.map((lp) => new Array(lp.P.length).fill(-1));
  loops.forEach((lp, li) => {
    const n = lp.P.length, pr = partner[li];
    // a new edge starts where the face on the other side changes, where the partner steps stop following on, or where a seam turns
    // back on itself (a pole: the step before has this step as its partner)
    const step = (i) => V.dist(lp.P[i], lp.P[(i + 1) % n]);
    const brk = (i) => { const a = pr[(i + n - 1) % n], b = pr[i]; return !touch(a, b, step((i + n - 1) % n) + step(i)) || (a.lj === li && a.j === i); };
    let start = -1;
    for (let i = 0; i < n; i++) if (brk(i)) { start = i; break; }
    if (start < 0) { runs.push({ li, from: 0, count: n, closed: true }); runOf[li].fill(runs.length - 1); return; }
    let cur = null;
    for (let k = 0; k < n; k++) {
      const i = (start + k) % n;
      if (k === 0 || brk(i)) { cur = { li, from: i, count: 0, closed: false }; runs.push(cur); }
      cur.count++; runOf[li][i] = runs.length - 1;
    }
  });
  const runPts = (r) => { const lp = loops[r.li], n = lp.P.length, out = []; for (let k = 0; k <= r.count; k++) { if (r.closed && k === r.count) break; out.push(lp.P[(r.from + k) % n]); } return out; };
  // pairs: the partner run of a run's middle step must name this run back
  const mate = runs.map((r, ri) => {
    const mid = (r.from + Math.floor(r.count / 2)) % loops[r.li].P.length, p = partner[r.li][mid], rj = runOf[p.lj][p.j];
    const r2 = runs[rj], mid2 = (r2.from + Math.floor(r2.count / 2)) % loops[r2.li].P.length, p2 = partner[r2.li][mid2];
    return runOf[p2.lj][p2.j] === ri && rj !== ri ? rj : -1;
  });
  if (mate.some((m) => m < 0)) return { fail: 'unmatched' };
  // vertices: run ends, one per point (within the sewing gap)
  const verts = [], vOf = (p) => { let i = verts.findIndex((q) => V.dist(q, p) <= gTol); if (i < 0) { verts.push(p); i = verts.length - 1; } return i; };
  const ends = runs.map((r) => { const P = runPts(r); return r.closed ? { a: vOf(P[0]), b: vOf(P[0]) } : { a: vOf(P[0]), b: vOf(loops[r.li].P[(r.from + r.count) % loops[r.li].P.length]) }; });
  const edges = [], use = runs.map(() => null);
  for (let ri = 0; ri < runs.length; ri++) {
    if (use[ri]) continue;
    const rj = mate[ri], A = runs[ri], Bq = runs[rj];
    // a whole closed bound on one side (a cap's circle) and an edge between two vertices on the other (a seam's corner on it): the
    // edge is the open side's, the closed side uses it whole
    let pick = -1;
    if (A.closed !== Bq.closed) {
      const [op, cl] = A.closed ? [rj, ri] : [ri, rj];
      if (ends[op].a !== ends[op].b) return { fail: 'closed_mismatch' };
      ends[cl] = { a: ends[op].a, b: ends[op].a }; runs[cl] = { ...runs[cl], closed: false, whole: true };
      pick = op;
    } else if (!A.closed && !(ends[ri].a === ends[rj].b && ends[ri].b === ends[rj].a)) return { fail: 'orientation' };
    // the edge's points: the run whose points lie closer to the other face's surface
    const off = (r, other) => { const s = items[loops[other.li].f].surface; let m = 0, uv0 = null; for (const p of runPts(r)) { const q = S.closestPoint(s, p, uv0 ? { uv0 } : {}); uv0 = [q.u, q.v]; m = Math.max(m, q.d); } return m; };
    if (pick < 0) pick = off(A, Bq) <= off(Bq, A) ? ri : rj;
    const other = pick === ri ? rj : ri, R = runs[pick];
    const pts = runPts(R);
    if (!R.closed) pts.push(loops[R.li].P[(R.from + R.count) % loops[R.li].P.length]); else pts.push(pts[0]);
    edges.push({ pts, v0: ends[pick].a, v1: R.closed ? ends[pick].a : ends[pick].b });
    use[pick] = { e: edges.length - 1, fwd: true }; use[other] = { e: edges.length - 1, fwd: false };
  }
  // a closed edge (one vertex, a whole circle) is cut in two at its middle point: every reader then has two distinct ends to work from
  const split = new Map();
  edges.slice().forEach((e, ei) => {
    if (e.v0 !== e.v1 || e.pts.length < 3) return;
    const mid = Math.floor((e.pts.length - 1) / 2);
    verts.push(e.pts[mid]);
    const vm = verts.length - 1, second = { pts: e.pts.slice(mid), v0: vm, v1: e.v1 };
    edges[ei] = { pts: e.pts.slice(0, mid + 1), v0: e.v0, v1: vm };
    edges.push(second);
    split.set(ei, edges.length - 1);
  });
  for (let ri = 0; ri < use.length; ri++) {
    const u = use[ri];
    if (!u || !split.has(u.e)) continue;
    const e2 = split.get(u.e);
    use[ri] = u.fwd ? [{ e: u.e, fwd: true }, { e: e2, fwd: true }] : [{ e: e2, fwd: false }, { e: u.e, fwd: false }];
  }
  // only the vertices an edge uses (a closed bound's first point was a vertex until it took its partner's)
  const keep = [...new Set(edges.flatMap((e) => [e.v0, e.v1]))].sort((a, b) => a - b), remap = new Map(keep.map((v, i) => [v, i]));
  for (const e of edges) { e.v0 = remap.get(e.v0); e.v1 = remap.get(e.v1); }
  const vertsUsed = keep.map((v) => verts[v]);
  const faces = items.map((it, f) => ({ item: it, sense: sense[f], loops: [] }));
  loops.forEach((lp, li) => {
    const list = runs.map((r, ri) => ({ r, ri })).filter((x) => x.r.li === li);
    // in loop order from the loop's first break
    faces[lp.f].loops[lp.k] = list.flatMap((x) => (Array.isArray(use[x.ri]) ? use[x.ri] : [use[x.ri]]));
  });
  for (const f of faces) f.loops = f.loops.filter(Boolean);
  // check: every edge used exactly twice, once each way
  const cnt = edges.map(() => [0, 0]);
  for (const f of faces) for (const L of f.loops) for (const oe of L) cnt[oe.e][oe.fwd ? 0 : 1]++;
  if (cnt.some(([a, b]) => a !== 1 || b !== 1)) return { fail: 'uses' };
  const nLoops = faces.reduce((x, f) => x + f.loops.length, 0);
  return { faces, edges, verts: vertsUsed, stats: { faces: faces.length, edges: edges.length, vertices: vertsUsed.length, loops: nLoops, euler: vertsUsed.length - edges.length + faces.length - (nLoops - faces.length) } };
}

/** writeStep plus what was written for each solid: { text, solids: [{ id, name, closed (one closed shell), faces, edges, vertices, loops, euler, why }] } */
export function writeStepReport(doc, opts = {}) { const out = { solids: [] }; out.text = writeStep(doc, { ...opts, _report: out }); return out; }

export function writeStep(doc, { name = 'nurbs', author = '', org = '', time = null, tol = SO.TOL, _report = null } = {}) {
  const d = D.cleanDoc(doc);
  const lines = [];
  let next = 1;
  const add = (body) => { const id = next++; lines.push('#' + id + '=' + body + ';'); return id; };
  const pt = (p) => add('CARTESIAN_POINT(\'\',(' + p.map(real).join(',') + '))');
  const list = (a) => '(' + a.join(',') + ')';
  const refs = (a) => list(a.map((i) => '#' + i));

  const ctxApp = add("APPLICATION_CONTEXT('managed model based 3d engineering')");
  add("APPLICATION_PROTOCOL_DEFINITION('international standard','ap242_managed_model_based_3d_engineering',2014,#" + ctxApp + ')');
  const pctx = add("PRODUCT_CONTEXT('',#" + ctxApp + ",'mechanical')");
  const prod = add('PRODUCT(' + str(name) + ',' + str(name) + ",'',(#" + pctx + '))');
  const pdf = add("PRODUCT_DEFINITION_FORMATION('','',#" + prod + ')');
  const pdc = add("PRODUCT_DEFINITION_CONTEXT('part definition',#" + ctxApp + ",'design')");
  const pd = add("PRODUCT_DEFINITION('design','',#" + pdf + ',#' + pdc + ')');
  const pds = add("PRODUCT_DEFINITION_SHAPE('','',#" + pd + ')');
  const uLen = add('(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.))');
  const uAng = add('(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.))');
  const uSol = add('(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT())');
  const unc = add('UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-06),#' + uLen + ",'distance_accuracy_value','')");
  const ctx = add('(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#' + unc + '))GLOBAL_UNIT_ASSIGNED_CONTEXT((#' + uLen + ',#' + uAng + ',#' + uSol + "))REPRESENTATION_CONTEXT('',''))");
  const o = pt([0, 0, 0]);
  const ax = add("AXIS2_PLACEMENT_3D('',#" + o + ',$,$)');

  const bsCurve = (c, nm = '') => {
    const ids = c.cvs.map(pt), { mults, knots } = knotLists(c.knots, c.deg, c.cvs.length - 1);
    if (!c.w) return add('B_SPLINE_CURVE_WITH_KNOTS(' + str(nm) + ',' + c.deg + ',' + refs(ids) + ',.UNSPECIFIED.,.F.,.F.,' + list(mults) + ',' + list(knots.map(real)) + ',.UNSPECIFIED.)');
    return add('(BOUNDED_CURVE()B_SPLINE_CURVE(' + c.deg + ',' + refs(ids) + ',.UNSPECIFIED.,.F.,.F.)B_SPLINE_CURVE_WITH_KNOTS(' + list(mults) + ',' + list(knots.map(real)) + ',.UNSPECIFIED.)CURVE()GEOMETRIC_REPRESENTATION_ITEM()RATIONAL_B_SPLINE_CURVE(' + list(c.w.map(real)) + ')REPRESENTATION_ITEM(' + str(nm) + '))');
  };
  const bsSurface = (s, nm = '') => {
    const ids = s.cvs.map((row) => row.map(pt));
    const ku = knotLists(s.knotsU, s.degU), kv = knotLists(s.knotsV, s.degV);
    const net = list(ids.map(refs));
    const kn = list(ku.mults) + ',' + list(kv.mults) + ',' + list(ku.knots.map(real)) + ',' + list(kv.knots.map(real)) + ',.UNSPECIFIED.';
    if (!s.w) return add('B_SPLINE_SURFACE_WITH_KNOTS(' + str(nm) + ',' + s.degU + ',' + s.degV + ',' + net + ',.UNSPECIFIED.,.F.,.F.,.F.,' + kn + ')');
    return add('(BOUNDED_SURFACE()B_SPLINE_SURFACE(' + s.degU + ',' + s.degV + ',' + net + ',.UNSPECIFIED.,.F.,.F.,.F.)B_SPLINE_SURFACE_WITH_KNOTS(' + kn + ')GEOMETRIC_REPRESENTATION_ITEM()RATIONAL_B_SPLINE_SURFACE(' + list(s.w.map((r) => list(r.map(real)))) + ')REPRESENTATION_ITEM(' + str(nm) + ')SURFACE())');
  };

  const shells = [], breps = [];
  // solids (0.9 SU.747c): one MANIFOLD_SOLID_BREP of one CLOSED_SHELL each, edges and vertices shared between faces; a solid whose faces
  // do not pair up edge for edge is written as before (each face its own open shell) and the report says why
  const inSolid = new Set();
  for (const b of SO.solids(d)) {
    const its = b.faces.map((f) => d.items.find((i) => i.id === f)).filter(Boolean);
    let sh = null;
    try { sh = shellOf(its, { tol }); } catch (e) { sh = { fail: e && e.code ? e.code : 'error' }; }
    if (!sh || sh.fail) { if (_report) _report.solids.push({ id: b.id, name: b.name, closed: false, why: sh ? sh.fail : 'error' }); continue; }
    const vids = sh.verts.map((p) => add("VERTEX_POINT('',#" + pt(p) + ')'));
    // an edge's curve is the polyline of its points followed on the surface (within 0.001 mm): POLYLINE, which every reader knows
    const eids = sh.edges.map((e) => add("EDGE_CURVE('',#" + vids[e.v0] + ',#' + vids[e.v1] + ",#" + add("POLYLINE('',(" + e.pts.map((p) => '#' + pt(p)).join(',') + '))') + ',.T.)'));
    const fids = sh.faces.map((f) => {
      const bounds = f.loops.map((L, k) => {
        const loop = add("EDGE_LOOP('',(" + L.map((oe) => '#' + add("ORIENTED_EDGE('',*,*,#" + eids[oe.e] + ',' + (oe.fwd ? '.T.' : '.F.') + ')')).join(',') + '))');
        return add((k === 0 ? 'FACE_OUTER_BOUND' : 'FACE_BOUND') + "('',#" + loop + ',.T.)');
      });
      return add('ADVANCED_FACE(' + str(f.item.name || f.item.id) + ',(' + bounds.map((x) => '#' + x).join(',') + '),#' + bsSurface(f.item.surface, f.item.id) + ',' + (f.sense ? '.T.' : '.F.') + ')');
    });
    const shell = add("CLOSED_SHELL('',(" + fids.map((x) => '#' + x).join(',') + '))');
    breps.push(add('MANIFOLD_SOLID_BREP(' + str(b.name || b.id) + ',#' + shell + ')'));
    for (const f of b.faces) inSolid.add(f);
    if (_report) _report.solids.push({ id: b.id, name: b.name, closed: true, ...sh.stats });
  }
  for (const it of D.surfaces(d)) {
    if (inSolid.has(it.id)) continue;
    const s = it.surface, size = S.size(s);
    const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
    const corner = { '00': S.point(s, ua, va), '10': S.point(s, ub, va), '11': S.point(s, ub, vb), '01': S.point(s, ua, vb) };
    const vtx = {};
    const vOf = (k) => (vtx[k] || (vtx[k] = add("VERTEX_POINT('',#" + pt(corner[k]) + ')')));
    // counter-clockwise in (u, v) — v0 forward, u1 forward, v1 backward, u0 backward — so the face normal is Su × Sv
    const loopDef = [['v0', '00', '10', true], ['u1', '10', '11', true], ['v1', '01', '11', false], ['u0', '00', '01', false]];
    const oes = [];
    for (const [edge, a, b, same] of loopDef) {
      const ec = S.edgeCurve(s, edge);
      if (C.arcLength(ec) <= 1e-9 * size) continue;         // collapsed to a point (a pole): no edge
      const e = add("EDGE_CURVE('',#" + vOf(a) + ',#' + vOf(b) + ',#' + bsCurve(ec) + ',.T.)');
      oes.push(add("ORIENTED_EDGE('',*,*,#" + e + ',' + (same ? '.T.' : '.F.') + ')'));
    }
    // a trim loop (0.8 DC.54 S2): one closed degree-1 B-spline through the loop's points on the surface, one edge, one vertex
    const trimBound = (L, outer) => {
      // two (u, v) points can be one point in space (the two sides of a seam, a pole): no zero-length step (0.9 DC.54, nurbs-09)
      const P3 = [];
      for (const { p } of TR.onSurface(s, L)) if (!P3.length || V.dist(P3[P3.length - 1], p) > 1e-9 * size) P3.push(p);   // each (u, v) step followed on the surface
      if (P3.length > 1 && V.dist(P3[0], P3[P3.length - 1]) <= 1e-9 * size) P3.pop();
      const line = C.polyline([...P3, P3[0]]);
      const v = add("VERTEX_POINT('',#" + pt(P3[0]) + ')');
      const e = add("EDGE_CURVE('',#" + v + ',#' + v + ',#' + bsCurve(line) + ',.T.)');
      const oe = add("ORIENTED_EDGE('',*,*,#" + e + ',.T.)');
      return add((outer ? 'FACE_OUTER_BOUND' : 'FACE_BOUND') + "('',#" + add("EDGE_LOOP('',(#" + oe + '))') + ',.T.)');
    };
    const bounds = [];
    if (it.trim && it.trim.outer) bounds.push(trimBound(it.trim.outer, true));
    else {
      const loop = add("EDGE_LOOP('',(" + oes.map((i) => '#' + i).join(',') + '))');
      bounds.push(add("FACE_OUTER_BOUND('',#" + loop + ',.T.)'));
    }
    if (it.trim) for (const h of it.trim.holes) bounds.push(trimBound(h, false));
    const face = add('ADVANCED_FACE(' + str(it.name || it.id) + ',(' + bounds.map((b) => '#' + b).join(',') + '),#' + bsSurface(s, it.id) + ',.T.)');
    shells.push(add("OPEN_SHELL('',(#" + face + '))'));
  }
  const reps = [];
  if (breps.length) reps.push(add('ADVANCED_BREP_SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + ',' + breps.map((i) => '#' + i).join(',') + '),#' + ctx + ')'));
  if (shells.length) {
    const sbsm = add("SHELL_BASED_SURFACE_MODEL('',(" + shells.map((i) => '#' + i).join(',') + '))');
    reps.push(add('MANIFOLD_SURFACE_SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + ',#' + sbsm + '),#' + ctx + ')'));
  }
  const cs = D.curves(d);
  if (cs.length) {
    const set = add("GEOMETRIC_CURVE_SET('',(" + cs.map((it) => '#' + bsCurve(it.curve, it.id)).join(',') + '))');
    reps.push(add('GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + ',#' + set + '),#' + ctx + ')'));
  }
  if (!reps.length) reps.push(add('SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + '),#' + ctx + ')'));
  add('SHAPE_DEFINITION_REPRESENTATION(#' + pds + ',#' + reps[0] + ')');
  for (const r of reps.slice(1)) add("SHAPE_REPRESENTATION_RELATIONSHIP('','',#" + reps[0] + ',#' + r + ')');

  const stamp = (time || new Date().toISOString()).slice(0, 19);
  return [
    'ISO-10303-21;', 'HEADER;',
    "FILE_DESCRIPTION(('CadCraft NURBS patch set (cc-nurbs)'),'2;1');",
    'FILE_NAME(' + str(name) + ',' + str(stamp) + ',(' + str(author) + '),(' + str(org) + "),'CadCraft cc-nurbs','CadCraft','');",
    "FILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF { 1 0 10303 442 1 1 4 }'));",
    'ENDSEC;', 'DATA;', ...lines, 'ENDSEC;', 'END-ISO-10303-21;', '',
  ].join('\n');
}

// ------------------------------------------------------------------------------------------------ reading (Part 21)

function decodeStr(s) {
  return s.replace(/''/g, "'").replace(/\\X2\\((?:[0-9A-F]{4})+)\\X0\\/gi, (_, h) => String.fromCharCode(...h.match(/.{4}/g).map((x) => parseInt(x, 16))))
    .replace(/\\X4\\((?:[0-9A-F]{8})+)\\X0\\/gi, (_, h) => String.fromCodePoint(...h.match(/.{8}/g).map((x) => parseInt(x, 16))))
    .replace(/\\\\/g, '\\');
}

/** Parameters of one entity body `(...)`, from position i; returns [value, next index]. */
function parseList(t, i) {
  const out = [];
  if (t[i] !== '(') fail('nurbs.err.step_syntax');
  i++;
  for (;;) {
    while (t[i] === ' ' || t[i] === '\n' || t[i] === '\r' || t[i] === '\t') i++;
    const ch = t[i];
    if (ch === undefined) fail('nurbs.err.step_syntax');
    if (ch === ')') return [out, i + 1];
    if (ch === ',') { i++; continue; }
    if (ch === '(') { const [v, j] = parseList(t, i); out.push(v); i = j; continue; }
    if (ch === "'") {
      let j = i + 1, s = '';
      for (;;) { const k = t.indexOf("'", j); if (k < 0) fail('nurbs.err.step_syntax'); if (t[k + 1] === "'") { s += t.slice(j, k + 2); j = k + 2; continue; } s += t.slice(j, k); i = k + 1; break; }
      out.push({ str: decodeStr(s) }); continue;
    }
    if (ch === '#') { let j = i + 1; while (t[j] >= '0' && t[j] <= '9') j++; out.push({ ref: +t.slice(i + 1, j) }); i = j; continue; }
    if (ch === '.') { const k = t.indexOf('.', i + 1); if (k < 0) fail('nurbs.err.step_syntax'); out.push({ enum: t.slice(i + 1, k) }); i = k + 1; continue; }
    if (ch === '$' || ch === '*') { out.push(null); i++; continue; }
    if ((ch >= '0' && ch <= '9') || ch === '-' || ch === '+') {
      let j = i + 1; while (j < t.length && /[0-9.EeDd+-]/.test(t[j])) j++;
      out.push(+t.slice(i, j).replace(/[Dd]/, 'E')); i = j; continue;
    }
    if (/^[A-Za-z_]$/.test(ch)) {
      // a typed parameter: NAME(value)
      let j = i; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
      const [v, k] = parseList(t, j);
      out.push({ typed: t.slice(i, j).toUpperCase(), value: v[0] }); i = k; continue;
    }
    fail('nurbs.err.step_syntax');
  }
}

export function parseP21(text) {
  if (typeof text !== 'string') fail('nurbs.err.step_not');
  if (text.length > MAX_BYTES) fail('nurbs.err.too_big');
  if (!/^\s*ISO-10303-21;/.test(text)) fail('nurbs.err.step_not');
  const t = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const dataAt = t.search(/\bDATA\b[^;]*;/);
  if (dataAt < 0) fail('nurbs.err.step_not');
  const ents = new Map();
  const re = /#(\d+)\s*=\s*/g;
  re.lastIndex = dataAt;
  let m;
  while ((m = re.exec(t))) {
    if (ents.size >= MAX_ENTITIES) fail('nurbs.err.too_many', { max: MAX_ENTITIES });
    let i = re.lastIndex;
    try {
      if (t[i] === '(') {
        // complex instance: (A(...)B(...)...)
        i++;
        const parts = [];
        for (;;) {
          while (i < t.length && /\s/.test(t[i])) i++;
          if (i >= t.length) fail('nurbs.err.step_syntax');
          if (t[i] === ')') { i++; break; }
          let j = i; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
          const pname = t.slice(i, j).toUpperCase();
          while (j < t.length && /\s/.test(t[j])) j++;
          const [params, k] = parseList(t, j);
          parts.push({ type: pname, params }); i = k;
        }
        ents.set(+m[1], { type: '', parts });
      } else {
        let j = i; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
        const type = t.slice(i, j).toUpperCase();
        while (j < t.length && /\s/.test(t[j])) j++;   // Part 21 allows blanks between the name and its parameters (some writers put one)
        const [params, k] = parseList(t, j);
        ents.set(+m[1], { type, params }); i = k;
      }
    } catch { /* one bad entity: skip it, keep reading */ }
    const semi = t.indexOf(';', i);
    re.lastIndex = semi < 0 ? t.length : semi + 1;
  }
  return ents;
}


/**
 * A face's bounds as trim loops in (u, v) (shared with iges.js): `list` = [{ pts3 (the loop's points in space, in the way the bound goes), reverse, outer }].
 * Each point is projected on the surface; a boundary that is the patch's own edge, or not on the surface, is not a trim. → trim or null.
 */
export function trimFromLoops(surf, list) {
  const size = S.size(surf);
  const [ua, ub] = S.domainU(surf), [va, vb] = S.domainV(surf);
  // which directions close on themselves (the two ends are one curve): only there does u = 1 mean u = 0
  const meets = (f) => [0, 0.37, 0.71, 1].every((x) => f(x) < 1e-9 * size);
  const wrapU = meets((x) => V.dist(S.point(surf, ua, va + (vb - va) * x), S.point(surf, ub, va + (vb - va) * x)));
  const wrapV = meets((x) => V.dist(S.point(surf, ua + (ub - ua) * x, va), S.point(surf, ua + (ub - ua) * x, vb)));
  const loops = [];
  for (const { pts3, reverse, outer: isOut } of list) {
    const L = [];
    let uv0 = null, offSurface = false;
    // a closed direction wraps (u = 1 is u = 0): the loop is unwrapped point by point (each stays on the side of the one before),
    // then moved by whole turns into the patch, so a loop that runs along a seam keeps both sides of it (0.9 DC.54, nurbs-09)
    const unwrap = (x, prev, lo, hi, wraps) => (!wraps || prev == null ? x : x + Math.round((prev - x) / (hi - lo)) * (hi - lo));
    let lift = null;
    for (const q of pts3) {
      const r = S.closestPoint(surf, q, uv0 ? { uv0 } : {});
      if (r.d > 1e-4 * size) { offSurface = true; break; }
      lift = [unwrap(r.u, lift && lift[0], ua, ub, wrapU), unwrap(r.v, lift && lift[1], va, vb, wrapV)];
      uv0 = [r.u, r.v];
      L.push(lift);
    }
    const into = (k, lo, hi, wraps) => {
      if (!wraps || !L.length) return;
      const min = Math.min(...L.map((p) => p[k])), max = Math.max(...L.map((p) => p[k])), P = hi - lo;
      if (max - min > P * (1 + 1e-9)) return;   // round the whole patch: left to the clamp
      const shift = Math.ceil((lo - min) / P - 1e-9) * P;
      for (const p of L) p[k] = Math.min(hi, Math.max(lo, p[k] + shift));
    };
    into(0, ua, ub, wrapU); into(1, va, vb, wrapV);
    if (offSurface) continue;
    loops.push({ L: reverse ? L.reverse() : L, outer: !!isOut });
  }
  if (!loops.length) return null;
  let outer = null; const holes = [];
  const full = (ub - ua) * (va === vb ? 0 : (vb - va));
  // a face's bounds are FACE_OUTER_BOUND plus FACE_BOUNDs, but several writers say FACE_BOUND for all of them (and not first): with no outer bound named,
  // the loop that encloses the most is the outer one
  const areaOf = (L) => { let a2 = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; a2 += p[0] * q[1] - q[0] * p[1]; } return Math.abs(a2 / 2); };
  if (!loops.some((l) => l.outer) && loops.length) { let big = loops[0]; for (const l of loops) if (areaOf(l.L) > areaOf(big.L)) big = l; big.outer = true; }
  for (const { L, outer: isOuter } of loops) {
    let area = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; area += p[0] * q[1] - q[0] * p[1]; }
    if (isOuter) { if (Math.abs(area / 2) < 0.999 * full) outer = L; } else holes.push(L);
  }
  try { return TR.cleanTrim({ outer, holes }, surf); } catch { return null; }
}

/** Reads STEP text back into a patch set. */
export function readStep(text) {
  const E = parseP21(text);
  const get = (r) => (r && typeof r.ref === 'number' ? E.get(r.ref) || null : null);
  const part = (e, type) => (!e ? null : e.parts ? e.parts.find((p) => p.type === type) || null : e.type === type ? e : null);
  const num = (x) => (typeof x === 'number' ? x : x && typeof x.value === 'number' ? x.value : NaN);
  // length unit in mm: an SI length unit (MILLI METRE = 1, METRE = 1000, …) or a conversion-based one (inch = 25.4 × its base)
  const unitMm = (e, depth = 0) => {
    if (!e || depth > 4) return null;
    const si = part(e, 'SI_UNIT');
    if (si) { const pre = si.params[0] && si.params[0].enum; return (({ MILLI: 1e-3, CENTI: 1e-2, DECI: 0.1, KILO: 1e3, MICRO: 1e-6 })[pre] ?? 1) * 1000; }
    const cb = part(e, 'CONVERSION_BASED_UNIT');
    if (cb) { const mw = get(cb.params[1]), p = mw && (mw.params || (part(mw, 'MEASURE_WITH_UNIT') || {}).params); if (!p) return null; const v = num(p[0]), b = unitMm(get(p[1]), depth + 1); return Number.isFinite(v) && b ? v * b : null; }
    return null;
  };
  // the units of the geometric context (GLOBAL_UNIT_ASSIGNED_CONTEXT names them), not the first length unit in the file: an inch file also holds the
  // metre its inch is defined from (found with a real file, 0.9 DC.54)
  const ctxUnits = [];
  for (const e of E.values()) { const g = part(e, 'GLOBAL_UNIT_ASSIGNED_CONTEXT'); if (g && Array.isArray(g.params[0])) for (const r of g.params[0]) { const u = get(r); if (u) ctxUnits.push(u); } if (ctxUnits.length) break; }
  const unitOf = (kind) => ctxUnits.find((u) => part(u, kind)) || [...E.values()].find((u) => part(u, kind)) || null;
  let unit = 1;
  { const lu = unitOf('LENGTH_UNIT'), u = lu && unitMm(lu); if (u > 0) unit = u; }
  // plane angle unit in radians (a cone's semi-angle is in it: 45 with a degree unit, 0.785 with radians)
  let angleUnit = 1;
  { const au = unitOf('PLANE_ANGLE_UNIT'), cb = au && part(au, 'CONVERSION_BASED_UNIT');
    if (cb) { const mw = get(cb.params[1]), p = mw && (mw.params || (part(mw, 'MEASURE_WITH_UNIT') || {}).params), v = p && num(p[0]); if (v > 0) angleUnit = v; } }
  const pts = (list) => list.map((r) => { const p = get(r); const c = p && p.params && p.params[1]; if (!Array.isArray(c)) fail('nurbs.err.step_point'); return [num(c[0]) * unit, num(c[1]) * unit, num(c[2] ?? 0) * unit]; });
  const expand = (mults, knots) => { const U = []; mults.forEach((m, i) => { for (let k = 0; k < m; k++) U.push(num(knots[i])); }); return U; };
  const curveOf = (e) => {
    if (e.type === 'POLYLINE') { const P = pts(e.params[1] || []); return P.length >= 2 ? C.polyline(P) : null; }
    const plain = part(e, 'B_SPLINE_CURVE_WITH_KNOTS');
    if (plain && plain.params.length >= 9) {
      const [, deg, cps, , , , mults, knots] = plain.params;
      return C.cleanCurve({ deg, cvs: pts(cps), knots: expand(mults, knots) });
    }
    const bs = part(e, 'B_SPLINE_CURVE'), wk = part(e, 'B_SPLINE_CURVE_WITH_KNOTS'), rat = part(e, 'RATIONAL_B_SPLINE_CURVE');
    if (bs && wk) {
      const [deg, cps] = bs.params, [mults, knots] = wk.params;
      return C.cleanCurve({ deg, cvs: pts(cps), knots: expand(mults, knots), w: rat ? rat.params[0].map(num) : null });
    }
    return null;
  };
  const surfaceOf = (e) => {
    const plain = part(e, 'B_SPLINE_SURFACE_WITH_KNOTS');
    if (plain && plain.params.length >= 13 && !e.parts) {
      const [, du, dv, net, , , , , mu, mv, ku, kv] = plain.params;
      return S.cleanSurface({ degU: du, degV: dv, cvs: net.map(pts), knotsU: expand(mu, ku), knotsV: expand(mv, kv) });
    }
    const bs = part(e, 'B_SPLINE_SURFACE'), wk = part(e, 'B_SPLINE_SURFACE_WITH_KNOTS'), rat = part(e, 'RATIONAL_B_SPLINE_SURFACE');
    if (bs && wk) {
      const [du, dv, net] = bs.params, [mu, mv, ku, kv] = wk.params;
      return S.cleanSurface({ degU: du, degV: dv, cvs: net.map(pts), knotsU: expand(mu, ku), knotsV: expand(mv, kv), w: rat ? rat.params[0].map((r) => r.map(num)) : null });
    }
    return null;
  };
  // ---- 0.9 DC.54 (real files): the edges and surfaces other programs write. A real STEP file's faces are mostly planes, cylinders, cones, spheres and
  // tori bounded by LINE and CIRCLE edges; the reader used to take only B-spline faces and B-spline edges, so a file of those came back empty and a
  // B-spline face with a LINE or CIRCLE edge came back with no trim (the whole patch). Analytic surfaces become exact rational patches of the face's
  // extent (a full turn where it turns), trimmed by the face's own loops through the same trim code as any face.
  const vec3 = (r) => { const d = get(r); const c = d && d.params && d.params[1]; return Array.isArray(c) && c.length >= 3 ? [num(c[0]), num(c[1]), num(c[2])] : null; };   // DIRECTION / VECTOR direction
  const vertexAt = (r) => { const v = get(r), p = v && get(v.params && v.params[1]); const c = p && p.params && p.params[1]; return Array.isArray(c) ? [num(c[0]) * unit, num(c[1]) * unit, num(c[2]) * unit] : null; };
  /** AXIS2_PLACEMENT_3D → { o, x, y, z } (right-handed, unit axes; a missing axis is Z, a missing reference direction any perpendicular). */
  const frameOf = (ref) => {
    const a = get(ref); if (!a || a.type !== 'AXIS2_PLACEMENT_3D') return null;
    const lc = get(a.params[1]), lcc = lc && lc.params && lc.params[1];
    if (!Array.isArray(lcc)) return null;
    const o = [num(lcc[0]) * unit, num(lcc[1]) * unit, num(lcc[2]) * unit];
    let z = vec3(a.params[2]) || [0, 0, 1]; z = V.norm(z);
    let x = vec3(a.params[3]);
    if (!x || V.len(V.sub(x, V.mul(z, V.dot(x, z)))) < 1e-9) x = Math.abs(z[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0];
    x = V.norm(V.sub(x, V.mul(z, V.dot(x, z))));
    return { o, x, y: V.cross(z, x), z };
  };
  /** The points of one oriented edge in the way it is walked: LINE, CIRCLE and ELLIPSE edges from their two vertices, else the B-spline curve whole. */
  const edgeSeg = (oe, ed, size) => {
    let ce = get(ed.params[3]);
    if (ce && (ce.type === 'SURFACE_CURVE' || ce.type === 'SEAM_CURVE' || ce.type === 'INTERSECTION_CURVE')) ce = get(ce.params[1]);   // the 3D curve of a curve that also lies on surfaces
    if (!ce) return null;
    const sameEdge = !(ed.params[4] && ed.params[4].enum === 'F'), sameOr = !(oe.params[4] && oe.params[4].enum === 'F');
    if (ce.type === 'LINE' || ce.type === 'CIRCLE' || ce.type === 'ELLIPSE') {
      const p0 = vertexAt(ed.params[1]), p1 = vertexAt(ed.params[2]);
      if (!p0 || !p1) return null;
      let seg;
      if (ce.type === 'LINE') seg = [p0, p1];
      else {
        const f = frameOf(ce.params[1]), ra = num(ce.params[2]) * unit, rb = (ce.type === 'ELLIPSE' ? num(ce.params[3]) : num(ce.params[2])) * unit;
        if (!f || !(ra > 0) || !(rb > 0)) return null;
        const ang = (p) => { const d = V.sub(p, f.o); return Math.atan2(V.dot(d, f.y) / rb, V.dot(d, f.x) / ra); };
        const TWO = 2 * Math.PI, a0 = ang(p0);
        let a1 = ang(p1);
        const closed = V.dist(p0, p1) < 1e-9 * Math.max(ra, rb, 1);
        if (sameEdge) { while (a1 <= a0 + 1e-12) a1 += TWO; if (closed) a1 = a0 + TWO; } else { while (a1 >= a0 - 1e-12) a1 -= TWO; if (closed) a1 = a0 - TWO; }
        const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / TWO * 96));
        seg = Array.from({ length: n + 1 }, (_, i) => { const t = a0 + (a1 - a0) * i / n; return V.add(f.o, V.add(V.mul(f.x, ra * Math.cos(t)), V.mul(f.y, rb * Math.sin(t)))); });
        seg[0] = p0; seg[n] = p1;
      }
      return sameOr ? seg : seg.reverse();
    }
    const c = curveOf(ce);
    if (!c) return null;
    const [a, z] = C.domain(c);
    const seg = c.deg === 1 ? c.cvs.slice() : Array.from({ length: 33 }, (_, i) => C.point(c, a + (z - a) * i / 32));
    return sameEdge !== sameOr ? seg.reverse() : seg;
  };
  /** The face's bounds as 3D point loops, in the way each is walked: [{ pts3, b, br }]. */
  const loopsPts = (face, size) => {
    const out = [];
    for (const br of face.params[1] || []) {
      const b = get(br), lp = b && get(b.params[1]);
      if (!lp || lp.type !== 'EDGE_LOOP') continue;
      const pts3 = [];
      for (const oer of lp.params[1] || []) {
        const oe = get(oer), ed = oe && get(oe.params[3]);
        if (!ed || ed.type !== 'EDGE_CURVE') continue;
        const seg = edgeSeg(oe, ed, size);
        if (!seg) continue;
        for (const q of seg) if (!pts3.length || V.dist(pts3[pts3.length - 1], q) > 1e-9 * size) pts3.push(q);
      }
      if (pts3.length > 1 && V.dist(pts3[0], pts3[pts3.length - 1]) < 1e-6 * size) pts3.pop();
      if (pts3.length >= 3) out.push({ pts3, b, br });
    }
    return out;
  };
  /** An analytic face surface as an exact patch covering the face (null when it is not one, or the face has no bound to size it by). */
  const analyticPatch = (se, face) => {
    if (!['PLANE', 'CYLINDRICAL_SURFACE', 'CONICAL_SURFACE', 'SPHERICAL_SURFACE', 'TOROIDAL_SURFACE'].includes(se.type)) return null;
    const f = frameOf(se.params[1]);
    if (!f) return null;
    const loops = loopsPts(face, 1e3);
    const closedFace = se.type === 'SPHERICAL_SURFACE' || se.type === 'TOROIDAL_SURFACE';   // a whole sphere or torus has only seam and degenerate edges: no loop of points
    if (!loops.length && !closedFace) return null;
    const all = loops.flatMap((l) => l.pts3), lo = (p) => V.dot(V.sub(p, f.o), f.z);
    const r = num(se.params[2]) * unit;
    try {
      if (se.type === 'PLANE') {
        const us = all.map((p) => V.dot(V.sub(p, f.o), f.x)), vs = all.map((p) => V.dot(V.sub(p, f.o), f.y));
        const [u0, u1, v0, v1] = [Math.min(...us), Math.max(...us), Math.min(...vs), Math.max(...vs)];
        if (!(u1 - u0 > 1e-9) || !(v1 - v0 > 1e-9)) return null;
        const at = (u, v) => V.add(f.o, V.add(V.mul(f.x, u), V.mul(f.y, v)));
        return CO.planarPatch([at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)]);
      }
      // the patch's seam (angle 0) goes through the face's first boundary point off the axis, so a full turn starts and ends on the seam the face's own
      // loops run along (a loop that starts mid-patch would be cut by the wrap)
      const radial = (p) => { const d = V.sub(p, f.o); return V.sub(d, V.mul(f.z, V.dot(d, f.z))); };
      const first = all.find((p) => V.len(radial(p)) > 1e-6 * Math.max(r, 1));
      if (first) { const x = V.norm(radial(first)); f.x = x; f.y = V.cross(f.z, x); }
      const zs = all.map(lo), z0 = Math.min(...zs), z1 = Math.max(...zs);
      const at = (rad, z) => V.add(f.o, V.add(V.mul(f.x, rad), V.mul(f.z, z)));
      let profile;
      if (se.type === 'CYLINDRICAL_SURFACE') { if (!(r > 0) || !(z1 - z0 > 1e-9)) return null; profile = C.line(at(r, z0), at(r, z1)); }
      else if (se.type === 'CONICAL_SURFACE') {
        const k = Math.tan(num(se.params[3]) * angleUnit), rad = (z) => r + z * k;   // semi-angle in radians (the file's plane angle unit: radians for the SI case)
        if (!(z1 - z0 > 1e-9) || !(Math.max(rad(z0), rad(z1)) > 0)) return null;
        profile = C.line(at(Math.max(rad(z0), 0), z0), at(Math.max(rad(z1), 0), z1));
      } else if (se.type === 'SPHERICAL_SURFACE') { if (!(r > 0)) return null; profile = C.arc(f.o, f.x, f.z, r, -Math.PI / 2, Math.PI / 2); }
      else { const r2 = num(se.params[3]) * unit; if (!(r > 0) || !(r2 > 0)) return null; profile = C.arc(V.add(f.o, V.mul(f.x, r)), f.x, f.z, r2, 0, 2 * Math.PI); }
      return CO.revolve(profile, f.o, f.z).surface;
    } catch { return null; }
  };
  // the face's bounds as trim loops in (u, v): each edge's curve sampled (a degree-1 curve by its own points), turned the way the
  // oriented edge goes, projected on the surface. A boundary that is the patch's own edge, or not on the surface, is not a trim.
  const trimOf = (face, surf) => trimFromLoops(surf, loopsPts(face, S.size(surf)).map(({ pts3, b }) => ({ pts3, reverse: !!(b.params[2] && b.params[2].enum === 'F'), outer: /OUTER/.test(b.type || '') })));
  const nameOf = (e) => { const p = part(e, 'REPRESENTATION_ITEM') || e; const s = p && p.params && p.params[0]; return s && typeof s.str === 'string' ? s.str : ''; };
  let doc = D.newDoc();
  const faceItem = new Map();   // ADVANCED_FACE entity → item id (for the solids below)
  const ids = [...E.keys()].sort((a, b) => a - b);
  for (const id of ids) {
    const e = E.get(id);
    if (e.type === 'ADVANCED_FACE') {
      const se = get(e.params[2]);
      let s = null;
      try { s = se ? (surfaceOf(se) || analyticPatch(se, e)) : null; } catch { s = null; }   // one face that will not read (bad knots) is left out, the others stay
      if (!s) continue;
      const fname = e.params[0] && e.params[0].str || '';
      const added = D.add(doc, 'surface', s, { name: fname, id: nameOf(se) || null });
      doc = added.doc;
      faceItem.set(id, added.id);
      const trim = trimOf(e, s);
      if (trim) doc = D.setTrim(doc, added.id, trim);
    } else if (e.type === 'GEOMETRIC_CURVE_SET') {
      for (const r of e.params[1] || []) { const ce = get(r), c = ce ? curveOf(ce) : null; if (c) doc = D.add(doc, 'curve', c, { id: nameOf(ce) || null }).doc; }
    }
  }
  if (!doc.items.length) fail('nurbs.err.step_empty');
  // closed shells of manifold solid B-reps come back as solids (0.9 SU.747c); doc.cleanDoc drops any that do not name real faces
  const sols = [];
  for (const id of ids) {
    const e = E.get(id);
    if (e.type !== 'MANIFOLD_SOLID_BREP') continue;
    const sh = get(e.params[1]);
    if (!sh || sh.type !== 'CLOSED_SHELL') continue;
    const faces = (sh.params[1] || []).map((r) => faceItem.get(r && r.ref)).filter(Boolean);
    if (faces.length) sols.push({ id: 'b' + (sols.length + 1), name: e.params[0] && e.params[0].str || '', faces });
  }
  if (sols.length) {
    const used = new Set(doc.items.map((i) => i.id));
    for (const b of sols) { let n = 1; while (used.has('b' + n)) n++; b.id = 'b' + n; used.add(b.id); }
    doc = D.cleanDoc({ ...doc, solids: sols });
  }
  void V;
  return doc;
}
