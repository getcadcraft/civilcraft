/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-hull speaks codes and numbers; the host words them (keys hull.*). */
/**
 * fair.js — cc-hull: fairness of hull lines and fairing them (0.8 EG.26, session part_PART_3). DOM-free and host-free: the host hands in its
 * copy of cc-nurbs (`N`, `import * as N from './nurbs/index.js'`), so PartCraft, ModelCraft and SuperCad Studio use one code path (rule 39;
 * copies by `node tools/hull/sync.mjs <host>`). A fair line, in the naval architect's sense (Rawson & Tupper, Basic Ship Theory, ch. 2; the
 * lines plan): no inflection the designer did not put there, curvature that changes smoothly (no jump at a knot, no ripple). Measured on the
 * exact curve, never on its polyline:
 *   signed curvature κ(s) in the curve's own best plane (a station, a waterline, a buttock is planar; a space curve uses the plane of its ends
 *   and middle), inflections = sign changes of κ through more than 1 % of its largest value, curvature jumps at interior knots (left and right limits), roughness
 *   R = ∫ (dκ/ds)² ds (Simpson on arc length; the classic fairness energy).
 *
 *   fairness(N, c, { samples = 240, band = 1e-6 }) → { inflections, at: [u], maxK, roughness, jumps: [{ u, dk }], maxJump, length, planar }
 *   fairCurve(N, c, { tol = 0.1, maxCvs = 40, degree = 3 }) → { curve, cvs, deviation, before, after, fair }
 *       the fewest cubic control points (from 4 up) whose rebuild stays within `tol` of the original (mm) and has no more inflections than it,
 *       taking the smoothest when several counts pass; `fair` false when none did (the original is kept)
 *   fairProblems(N, doc, { tol }) → shared-Problems shape (rule 29) for curves of a patch set that have an inflection or a curvature jump
 */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);

/** The curve's plane normal: from its ends and middle, else (a straight line) null. */
function planeOf(N, c) {
  const [a, b] = N.curve.domain(c);
  const p0 = N.curve.point(c, a), p1 = N.curve.point(c, (a + b) / 2), p2 = N.curve.point(c, b);
  let n = cross(sub(p1, p0), sub(p2, p0));
  if (len(n) < 1e-12) { const q = N.curve.point(c, a + (b - a) / 3); n = cross(sub(q, p0), sub(p2, p0)); }
  const l = len(n);
  return l < 1e-12 ? null : [n[0] / l, n[1] / l, n[2] / l];
}
/** Signed curvature at u (in the plane with normal nrm) and the speed |C'|. */
function kappa(N, c, u, nrm) {
  const D = N.curve.derivs(c, u, 2), d1 = D[1], d2 = D[2], sp = len(d1);
  if (sp < 1e-14) return { k: 0, sp };
  const x = cross(d1, d2);
  return { k: (nrm ? dot(x, nrm) : len(x)) / (sp * sp * sp), sp };
}

export function fairness(N, c, { samples = 240, band = 1e-6 } = {}) {
  const [a, b] = N.curve.domain(c), nrm = planeOf(N, c), n = Math.max(8, samples - (samples % 2));
  const us = [], ks = [], sps = [];
  for (let i = 0; i <= n; i++) { const u = a + (b - a) * i / n, q = kappa(N, c, u, nrm); us.push(u); ks.push(q.k); sps.push(q.sp); }
  let maxK = 0; for (const k of ks) maxK = Math.max(maxK, Math.abs(k));
  const dead = Math.max(band, 0.01 * maxK);   // a sign change counts only through 1 % of the largest curvature (the ends of a wave sit near zero)
  const at = [];
  let last = 0;
  for (let i = 0; i <= n; i++) { const s = ks[i] > dead ? 1 : ks[i] < -dead ? -1 : 0; if (s && last && s !== last) at.push((us[i - 1] + us[i]) / 2); if (s) last = s; }
  // roughness ∫ (dκ/ds)² ds by central differences on the sample grid (ds = speed · du), Simpson's rule
  const du = (b - a) / n, g = new Array(n + 1);
  for (let i = 0; i <= n; i++) { const i0 = Math.max(0, i - 1), i1 = Math.min(n, i + 1), ds = sps[i] * du * (i1 - i0); g[i] = ds > 1e-14 ? ((ks[i1] - ks[i0]) / ds) ** 2 * sps[i] : 0; }
  let rough = g[0] + g[n]; for (let i = 1; i < n; i++) rough += (i % 2 ? 4 : 2) * g[i];
  rough *= du / 3;
  // curvature jumps at interior knots (a cubic is C2 at a simple knot: a jump means a multiple knot or a kink in the fit)
  const jumps = [], eps = 1e-9 * (b - a);
  const knots = [...new Set(c.knots.slice(c.deg + 1, c.cvs.length))].filter((u) => u > a + eps && u < b - eps);
  for (const u of knots) { const l = kappa(N, c, u - eps, nrm).k, r = kappa(N, c, u + eps, nrm).k; jumps.push({ u, dk: Math.abs(r - l) }); }
  let maxJump = 0; for (const j of jumps) maxJump = Math.max(maxJump, j.dk);
  const length = N.curve.arcLength(c);
  return { inflections: at.length, at, maxK, roughness: rough, jumps, maxJump, length, planar: !!nrm };
}

export function fairCurve(N, c, { tol = 0.1, maxCvs = 40, degree = 3 } = {}) {
  const before = fairness(N, c);
  let best = null;
  for (let n = degree + 1; n <= Math.min(maxCvs, Math.max(degree + 1, c.cvs.length + 8)); n++) {
    const r = N.fit.rebuild(c, n, degree);
    if (!(r.deviation.max <= tol)) continue;
    const f = fairness(N, r.curve);
    if (f.inflections > before.inflections) continue;
    if (!best || f.roughness < best.after.roughness * (1 - 1e-9) - 1e-15 || (best.cvs - n > 2 && f.roughness <= best.after.roughness * 1.05)) best = { curve: r.curve, cvs: n, deviation: r.deviation.max, after: f };
    if (best && n - best.cvs >= 4) break;   // more control points than this only follow the original's ripples
  }
  if (!best) return { curve: c, cvs: c.cvs.length, deviation: 0, before, after: before, fair: false };
  return { ...best, before, fair: true };
}

export function fairProblems(N, doc, { source = 'hull.fair', jumpTol = 1e-4 } = {}) {
  const out = [];
  for (const it of doc.items || []) {
    if (it.kind !== 'curve' || it.hidden) continue;
    const f = fairness(N, it.curve);
    const about = [{ kind: 'curve', id: it.id, label: it.name || it.id }];
    if (f.inflections) out.push({ id: source + ':inflection:' + it.id, code: 'hull.inflection', severity: 'note', msg: { key: 'hull.p.inflection', vars: { name: it.name || it.id, n: f.inflections } }, about, source: { kind: 'check', name: source }, found: { value: f.inflections, unit: '' }, fixes: [{ action: 'hull.fair', label: { key: 'hull.fix.fair' }, args: { id: it.id } }] });
    if (f.maxJump > jumpTol * Math.max(1, f.maxK)) out.push({ id: source + ':jump:' + it.id, code: 'hull.jump', severity: 'warning', msg: { key: 'hull.p.jump', vars: { name: it.name || it.id, dk: +f.maxJump.toPrecision(3) } }, about, source: { kind: 'check', name: source }, found: { value: +f.maxJump.toPrecision(3), unit: '1/mm' }, fixes: [{ action: 'hull.fair', label: { key: 'hull.fix.fair' }, args: { id: it.id } }] });
  }
  return out;
}
