/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * continuity.js — cc-nurbs (0.8 SU.747b, session `nurbs`): G0 / G1 / G2 measured as numbers on the exact curves and surfaces,
 * never on a mesh and never asserted. DOM-free.
 *
 * What is measured (and what is not claimed): along a shared edge, at `samples` points spaced evenly in the first surface's
 * edge parameter, the matching point on the second surface's edge (closest point on its exact edge curve) gives
 *   G0 — gap: the distance between the two edge points (mm)
 *   G1 — angle: between the two surface normals (degrees; normals pointing opposite ways are turned round first and the pair
 *        is reported `flipped`)
 *   G2 — curvature difference: the normal curvatures of both surfaces in the one direction that crosses the edge (in the first
 *        surface's tangent plane, perpendicular to the edge), against one normal (1/mm). With G1 in place this is the whole of
 *        G2: the curvature along the edge is the shared curve's, and the twist term follows from the normals agreeing along it.
 * G3 and "class A" are not measured or claimed. For curves: the gap, the angle between the tangents (as the curves run on)
 * and the length of the difference of the curvature vectors (1/mm).
 *
 * Default tolerances (until the owner sets others; every report carries the ones it used): G0 0.01 mm, G1 0.1°, G2 0.001 1/mm
 * absolute or 1 % of the larger curvature, whichever is looser.
 *
 *   TOL · classify({ gap, angle, dk, rel }, tol) → 'G2' | 'G1' | 'G0' | 'none'
 *   curveJoin(a, endA, b, endB, tol) → { gap, angle, dk, rel, cls, tol }      (ends 'start' | 'end')
 *   surfaceEdge(sA, edgeA, sB, edgeB, { samples = 33, tol }) → { rows: [{ t, uvA, uvB, gap, angle, dk, kA, kB, at }], gap, angle,
 *     dk: { max, mean, at }, rel, flipped, cls, tol, samples }
 *   sharedEdges(surfaces, { tol }) → [{ a, edgeA, b, edgeB }] (edges that lie on each other within tol, either direction)
 *   patchReport(surfaces, { tol, samples, want }) → { edges: [{ a, edgeA, b, edgeB, want, ...surfaceEdge }], worst }
 *   problems(report, { ids, source }) → problems in the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1) for every edge whose
 *     measured class is below what it should be (`want`, default 'G0' — a gap is always a problem)
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as V from './vec.js';

export const TOL = Object.freeze({ g0: 0.01, g1: 0.1, g2: 0.001, g2rel: 0.01 });
const DEG = 180 / Math.PI;
const RANK = { none: 0, G0: 1, G1: 2, G2: 3 };

export function classify({ gap, angle, dk, rel }, tol = TOL) {
  if (!(gap <= tol.g0)) return 'none';
  if (!(angle <= tol.g1)) return 'G0';
  if (!(dk <= tol.g2 || rel <= tol.g2rel)) return 'G1';
  return 'G2';
}

// ------------------------------------------------------------------------------------------------ curves

function endInfo(c, end) {
  const [a, b] = C.domain(c), u = end === 'start' ? a : b, d = C.derivs(c, u, 2);
  // the direction the joined path runs on in: leaving `a` at its end, or arriving at the start
  return { p: d[0], u, kv: C.curvatureVector(c, u), d1: d[1] };
}

export function curveJoin(a, endA, b, endB, tol = TOL) {
  const A = endInfo(a, endA), Bi = endInfo(b, endB);
  const tA = V.mul(A.d1, endA === 'end' ? 1 : -1), tB = V.mul(Bi.d1, endB === 'start' ? 1 : -1);
  const gap = V.dist(A.p, Bi.p), angle = V.angle(tA, tB) * DEG;
  const dk = V.dist(A.kv, Bi.kv), big = Math.max(V.len(A.kv), V.len(Bi.kv));
  const rel = big > 1e-300 ? dk / big : 0;
  return { gap, angle, dk, rel, kA: V.len(A.kv), kB: V.len(Bi.kv), cls: classify({ gap, angle, dk, rel }, tol), tol };
}

// ------------------------------------------------------------------------------------------------ surfaces

/** The unit direction in s's tangent plane at (u, v), perpendicular to the edge tangent te. */
const crossDir = (n, te) => V.norm(V.cross(n, te));

export function surfaceEdge(sA, edgeA, sB, edgeB, { samples = 33, tol = TOL } = {}) {
  const eA = S.edgeParams(sA, edgeA), eB = S.edgeParams(sB, edgeB), cB = S.edgeCurve(sB, edgeB), cA = S.edgeCurve(sA, edgeA);
  const rows = [];
  let flips = 0;
  for (let k = 0; k < samples; k++) {
    const t = eA.a + (eA.b - eA.a) * (samples > 1 ? k / (samples - 1) : 0.5);
    const uvA = S.edgeUV(sA, edgeA, t), pA = S.point(sA, ...uvA);
    const cp2 = C.closestParam(cB, pA);
    const uvB = S.edgeUV(sB, edgeB, cp2.u), pB = S.point(sB, ...uvB);
    const nA = S.normal(sA, ...uvA);
    let nB = S.normal(sB, ...uvB);
    if (V.dot(nA, nB) < 0) { flips++; }
    rows.push({ t, uvA, uvB, pA, pB, nA, nB, gap: V.dist(pA, pB), te: C.derivs(cA, t, 1)[1] });
  }
  const flipped = flips * 2 > samples;
  let gap = 0, ang = 0, dkMax = 0, dkSum = 0, relMax = 0, at = { gap: 0, angle: 0, dk: 0 };
  const out = rows.map((r, k) => {
    const nB = flipped ? V.mul(r.nB, -1) : r.nB;
    const angle = V.angle(r.nA, nB) * DEG;
    const d = crossDir(r.nA, V.len(r.te) > 1e-300 ? r.te : V.perp(r.nA));
    const kA = S.normalCurvature(sA, ...r.uvA, d);
    // B's normal curvature in the same direction, made a tangent of B, against B's (turned) normal
    const dB = V.norm(V.sub(d, V.mul(nB, V.dot(d, nB))));
    const kB = S.normalCurvature(sB, ...r.uvB, dB) * (flipped ? -1 : 1);
    const dk = Math.abs(kA - kB), big = Math.max(Math.abs(kA), Math.abs(kB)), rel = big > 1e-300 ? dk / big : 0;
    if (r.gap > gap) { gap = r.gap; at.gap = k; }
    if (angle > ang) { ang = angle; at.angle = k; }
    if (dk > dkMax) { dkMax = dk; at.dk = k; relMax = rel; }
    dkSum += dk;
    return { t: r.t, uvA: r.uvA, uvB: r.uvB, at: r.pA, gap: r.gap, angle, dk, kA, kB, rel };
  });
  const res = { rows: out, gap, angle: ang, dk: { max: dkMax, mean: dkSum / Math.max(1, out.length), at: at.dk }, rel: relMax, flipped, samples, tol, worstAt: at };
  res.cls = classify({ gap, angle: ang, dk: dkMax, rel: relMax }, tol);
  return res;
}

export function sharedEdges(surfaces, { tol = TOL.g0 } = {}) {
  const edges = [];
  surfaces.forEach((s, i) => S.EDGES.forEach((e) => {
    const c = S.edgeCurve(s, e), L = C.arcLength(c);
    if (L > tol * 10) edges.push({ i, e, c, L });
  }));
  const out = [];
  for (let x = 0; x < edges.length; x++) for (let y = x + 1; y < edges.length; y++) {
    const A = edges[x], Bq = edges[y];
    if (A.i === Bq.i || Math.abs(A.L - Bq.L) > Math.max(tol * 10, 0.05 * Math.max(A.L, Bq.L))) continue;
    const [a, b] = C.domain(A.c);
    let okk = true;
    for (let k = 0; k <= 6 && okk; k++) if (C.closestParam(Bq.c, C.point(A.c, a + (b - a) * k / 6)).d > tol) okk = false;
    if (okk) out.push({ a: A.i, edgeA: A.e, b: Bq.i, edgeB: Bq.e });
  }
  return out;
}

export function patchReport(surfaces, { tol = TOL, samples = 33, want = null, edges = null } = {}) {
  const list = edges || sharedEdges(surfaces, { tol: Math.max(tol.g0 * 10, 1e-6) });
  const out = list.map((p) => {
    const m = surfaceEdge(surfaces[p.a], p.edgeA, surfaces[p.b], p.edgeB, { samples, tol });
    return { ...p, want: p.want || (want ? want(p) : 'G0'), ...m };
  });
  let worst = null;
  for (const e of out) if (!worst || RANK[e.cls] - RANK[e.want] < RANK[worst.cls] - RANK[worst.want]) worst = e;
  return { edges: out, worst, tol };
}

const r4 = (x) => +x.toPrecision(4);

/** Problems (docs/0.8-PROBLEMS-SPEC.md § 1): one per edge below its wanted class, naming the first level it misses. */
export function problems(report, { ids = null, source = { kind: 'check', name: 'nurbs.continuity' } } = {}) {
  const idOf = (i) => (ids ? ids[i] : String(i));
  const out = [];
  for (const e of report.edges) {
    if (RANK[e.cls] >= RANK[e.want]) continue;
    const tol = e.tol || report.tol || TOL;
    const miss = e.cls === 'none' ? 'g0' : e.cls === 'G0' ? 'g1' : 'g2';
    const key = idOf(e.a) + '.' + e.edgeA + '|' + idOf(e.b) + '.' + e.edgeB;
    const row = e.rows[miss === 'g0' ? e.worstAt.gap : miss === 'g1' ? e.worstAt.angle : e.worstAt.dk];
    const vars = { a: idOf(e.a), b: idOf(e.b), want: e.want, got: e.cls === 'none' ? '—' : e.cls };
    let req, found, text;
    if (miss === 'g0') { req = { op: '<=', value: tol.g0, unit: 'mm' }; found = { value: r4(e.gap), unit: 'mm' }; vars.gap = r4(e.gap); text = `Gap of ${vars.gap} mm along the shared edge (G0 needs ${tol.g0} mm or less)`; }
    else if (miss === 'g1') { req = { op: '<=', value: tol.g1, unit: 'deg' }; found = { value: r4(e.angle), unit: 'deg' }; vars.angle = r4(e.angle); text = `Normals ${vars.angle}° apart along the shared edge (G1 needs ${tol.g1}° or less)`; }
    else { req = { op: '<=', value: tol.g2, unit: '1/mm' }; found = { value: r4(e.dk.max), unit: '1/mm' }; vars.dk = r4(e.dk.max); text = `Curvature differs by ${vars.dk} 1/mm across the shared edge (G2 needs ${tol.g2} 1/mm or ${tol.g2rel * 100} %)`; }
    out.push({
      id: 'nurbs.continuity:' + miss + ':' + key, code: 'nurbs.cont.' + miss,
      severity: 'warning',
      msg: { key: 'nurbs.prob.' + miss, vars }, text,
      about: [{ kind: 'surface', id: idOf(e.a) }, { kind: 'surface', id: idOf(e.b) }],
      where: row ? { space: '3d', at: row.at.slice() } : undefined,
      source, req, found,
      fixes: [{ id: 'match', msg: { key: 'nurbs.fix.match', vars: { want: e.want } }, action: 'nurbs.match', args: { a: idOf(e.a), edgeA: e.edgeA, b: idOf(e.b), edgeB: e.edgeB, want: e.want } }],
    });
  }
  return out;
}
