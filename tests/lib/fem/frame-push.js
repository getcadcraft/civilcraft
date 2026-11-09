/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-push.js — nonlinear static (pushover) and nonlinear time history of a lib/frame model by lumped plastic hinges (0.9 SU.1056). DOM-free. An analysis aid,
 * not a code check; your engineer reviews the results.
 *
 * Model. Beams keep the elastic member stiffness (lib/frame's localK, end releases condensed, optional P-delta by the geometric stiffness K_G(N) of
 * frame-solve.js addGeometric with the axial force iterated). A hinge sits at each member end that has an I or rectangular `shape` and is free to turn about y and z.
 * It carries plastic rotations p = (θy, θz) at that end: end forces f = k (u − E p) − p_eq (E puts p on the rotation dofs, p_eq the equivalent loads of member loads).
 * The hinge yields when μ(N, My, Mz) = 1 (hinge.js: exact uniaxial plastic capacities with axial force, an elliptic combination for two moments); the flow is associated in the
 * moments (p' = λ ∂μ/∂M, axial and shear stay elastic: a non-associated simplification). Hardening: the capacity grows with the plastic rotation, μ = 1 + hs κ,
 * hs = α k_end / M_p along the loading direction, α = r / (1 − r) with r the post-yield stiffness ratio asked for (a member fixed at the other end then has a tangent
 * ratio of exactly r). Return mapping: closest point by Newton on the plastic multipliers (at most two per member), tangent k_ep = k − k A (Aᵀ k A + H)⁻¹ Aᵀ k
 * (the textbook elastoplastic tangent: Simo & Hughes, Computational Inelasticity, ch. 3; Powell & Chen 1986 for concentrated-plasticity frame elements in spirit; derived here).
 * Plates and solids stay elastic. Axial yielding and buckling of braces are NOT modelled: a member with both ends released gets no hinge. Hinges act at member ENDS only:
 * to place one inside a span, put a node there. No hinge table (FEMA 356, ASCE 41) is used and no acceptance criteria are given.
 *
 *   plasticOf(section, fy)  (hinge.js)
 *   pushoverOfFrame(frame, opts) → { ok, curve: [{ delta, V, lambda }], events, hinges, peak, stopped, … }
 *       opts = { fy (MPa), dir: 'X'|'Y', pattern: 'mode'|'uniform', target (mm of roof displacement), steps, r (post-yield ratio), pdelta, gravity: [{ case, f }], masses: [{ case, f }], prep }
 *   nlTimeHistoryOfFrame(frame, opts) → { ok, t, series, hinges, events, … }       opts as timeHistory plus fy, r, pdelta, gravity
 *   PUSH_NOTE
 * Displacement control: the roof (control) displacement is stepped, the load factor λ is the unknown, found with the bordered Newton–Raphson of the control
 * degree of freedom (the tangent stays solvable at a mechanism). A step that does not converge is halved (six times at most); then the run stops and says why.
 */
import { Coo, csrMul, pcg, solveDense } from './linalg.js';
import { fromFrame } from './bim.js';
import { build, expandFull, beamT, congruent, guyan } from './model.js';
import { modalOfFrame } from './frame-fem.js';
import { localK, addGeometric, loadSet } from '../frame/frame-solve.js';
import { axesOf } from '../frame/frame-model.js';
import { plasticOf, gauge } from './hinge.js';
import { G_MM, NOTE, influence, reduceVec, mulCsr, dot, csrComb, resample, rayleighCoeffs } from './dyn-core.js';
import { storiesOf, floorMotion, driftVector, massesFromCases, driftRows } from './stories.js';

export { plasticOf };
export const PUSH_NOTE = NOTE;
const AX = ['X', 'Y', 'Z'], ROT = [[4, 5], [10, 11]];

function solveLocalLoad(k0, p, rel) {                                                              // static condensation of a local load vector at released dofs
  if (!rel.length || !p) return p;
  const n = 12, keep = [...Array(n).keys()].filter((i) => !rel.includes(i)), r = rel.length;
  const krr = new Float64Array(r * r); for (let a = 0; a < r; a++) for (let b = 0; b < r; b++) krr[a * r + b] = k0[rel[a] * n + rel[b]];
  const x = solveDense(krr, Float64Array.from(rel, (d) => p[d]), r);
  const out = new Float64Array(n);
  for (const i of keep) { let s = p[i]; for (let a = 0; a < r; a++) s -= k0[i * n + rel[a]] * x[a]; out[i] = s; }
  return out;
}
function dense(K) { const n = K.n, A = new Float64Array(n * n); for (let i = 0; i < n; i++) for (let p = K.ptr[i]; p < K.ptr[i + 1]; p++) A[i * n + K.col[p]] += K.val[p]; return A; }

/** The nonlinear system of a frame model. */
export function nlSystem(frame, { fy = 355, r = 0, pdelta = false, masses = null, gravity = null, prep = null, bending = 'mitc4' } = {}) {
  const conv = fromFrame(frame);
  const fem = conv.model;
  for (const s of fem.shells) s.bending = bending;
  if (masses?.length) fem.masses = masses;
  const sys = build(fem), nn = fem.nodes.length, nb = fem.beams.length;
  const rEff = Math.min(Math.max(r, 1e-4), 0.5), alpha = rEff / (1 - rEff), warnings = [];       // a floor of 0.01 % hardening keeps the tangent of a mechanism solvable (stated in the results)
  const secs = new Map(frame.sections.map((s) => [s.id, s]));
  const els = fem.beams.map((b, k) => {
    const m = frame.members[k], ax = axesOf(fem.nodes[b.i], fem.nodes[b.j], b.roll || 0), T = beamT(ax);
    const dofs = []; for (const n of [b.i, b.j]) for (let d = 0; d < 6; d++) dofs.push(6 * n + d);
    const rel = b.rel ? [...b.rel.i.map((q, d) => (q ? d : -1)), ...b.rel.j.map((q, d) => (q ? 6 + d : -1))].filter((d) => d >= 0) : [];
    const cap = plasticOf(secs.get(m.section), fy);
    const end = [0, 1].map((e) => cap.ok && !rel.includes(ROT[e][0]) && !rel.includes(ROT[e][1]));
    return { b, ax, T, dofs, rel, cap, end, k0: localK(b.E, b.G, b.A, b.Iy, b.Iz, b.J, ax.L), kt: null, ktN: NaN, peq: null };
  });
  const noCap = els.filter((e) => !e.cap.ok).length, pinned = els.filter((e) => e.rel.length >= 8 || (!e.end[0] && !e.end[1])).length;
  if (noCap) warnings.push({ code: 'no-shape', n: noCap });
  if (pinned) warnings.push({ code: 'braces', n: pinned });
  // elastic remainder: plates, solids, springs (constant)
  const Ko = new Coo(sys.ndof);
  for (const e of sys.el) if (e.kind !== 'beam') scatter(sys, Ko, e.dofs, e.k());
  for (const sp of fem.springs || []) for (const [ra, ca] of sys.ex(6 * sp.node + sp.dof)) Ko.add(ra, ra, sp.k * ca * ca);
  const Kother = Ko.toCsr();
  // loads of the gravity state (reduced) and the equivalent loads of member loads (local, condensed)
  let Fg = new Float64Array(sys.ndof);
  if (gravity?.length && prep) {
    const entries = gravity.map(({ case: id, f }) => ({ c: frame.cases.find((q) => q.id === id), f })).filter((x) => x.c && x.f);
    const { nodeF, memLoads } = loadSet(prep, entries.map(({ c, f }) => ({ c: { ...c, loads: c.loads.filter((l) => l.type !== 'area') }, f })));
    const full = new Float64Array(6 * nn); for (let q = 0; q < full.length; q++) full[q] = nodeF[q];
    els.forEach((e, k) => {
      const p = new Float64Array(12);
      for (const pz of memLoads[k]) addEq(p, pz, e.ax.L);
      e.peq = solveLocalLoad(e.k0, p, e.rel);
    });
    for (const { c, f } of entries) {                                                              // slabs: area loads and own weight as forces on the shell corner nodes
      (fem.shells || []).forEach((s, si) => {
        const pl = frame.plates?.[si]; if (!pl) return;
        const pts = s.n.map((n) => fem.nodes[n]);
        const d1 = [pts[2][0] - pts[0][0], pts[2][1] - pts[0][1], pts[2][2] - pts[0][2]], d2 = [pts[3][0] - pts[1][0], pts[3][1] - pts[1][1], pts[3][2] - pts[1][2]];
        const cr = [d1[1] * d2[2] - d1[2] * d2[1], d1[2] * d2[0] - d1[0] * d2[2], d1[0] * d2[1] - d1[1] * d2[0]], ar = 0.5 * Math.hypot(...cr), nrm = cr.map((v) => v / (2 * ar || 1));
        let q = [0, 0, 0];
        if (c.selfWeight && s.rho) q[2] -= c.selfWeight * f * s.rho * 1e-9 * 9.80665 * s.t;
        for (const l of c.loads) if (l.type === 'area' && l.plate === pl.id) { const g = l.dir === 'X' ? [1, 0, 0] : l.dir === 'Y' ? [0, 1, 0] : l.dir === 'Z' ? [0, 0, 1] : nrm; for (let a = 0; a < 3; a++) q[a] += g[a] * l.p * f; }
        s.n.forEach((n) => { for (let a = 0; a < 3; a++) full[6 * n + a] += q[a] * ar / 4; });
      });
    }
    for (let d = 0; d < full.length; d++) if (full[d]) for (const [rr, c] of sys.ex(d)) Fg[rr] += c * full[d];
  }
  return { conv, fem, sys, els, Kother, Fg, alpha, pdelta, warnings, nb, nn };
}
function addEq(p, pz, L) {                                                                          // equivalent nodal loads of one local piece (same shape functions as frame-solve equivalentLoads)
  const G4 = [[-0.8611363115940526, 0.3478548451374538], [-0.3399810435848563, 0.6521451548625461], [0.3399810435848563, 0.6521451548625461], [0.8611363115940526, 0.3478548451374538]];
  const add = (xi, q) => {
    const N1 = 1 - 3 * xi * xi + 2 * xi ** 3, N2 = L * (xi - 2 * xi * xi + xi ** 3), N3 = 3 * xi * xi - 2 * xi ** 3, N4 = L * (-xi * xi + xi ** 3);
    if (pz.comp === 0) { p[0] += q * (1 - xi); p[6] += q * xi; }
    else if (pz.comp === 1) { p[1] += q * N1; p[5] += q * N2; p[7] += q * N3; p[11] += q * N4; }
    else { p[2] += q * N1; p[4] -= q * N2; p[8] += q * N3; p[10] -= q * N4; }
  };
  if (pz.kind === 'point') add(pz.a / L, pz.P);
  else { const { a, b, w1, w2 } = pz, h = (b - a) / 2; for (const [g, wt] of G4) { const x = a + h * (g + 1); add(x / L, (w1 + (w2 - w1) * (x - a) / (b - a)) * wt * h); } }
}
function scatter(sys, C, dofs, ke) {
  const n = dofs.length;
  for (let a = 0; a < n; a++) {
    const ea = sys.ex(dofs[a]); if (!ea.length) continue;
    for (let b = 0; b < n; b++) { const v = ke[a * n + b]; if (!v) continue; const eb = sys.ex(dofs[b]); for (const [ra, ca] of ea) for (const [rb, cb] of eb) C.add(ra, rb, ca * cb * v); }
  }
}

export const newState = (nl) => ({ dp: nl.els.map(() => new Float64Array(4)), kap: nl.els.map(() => new Float64Array(2)), N: nl.els.map(() => 0) });
const cloneState = (s) => ({ dp: s.dp.map((a) => Float64Array.from(a)), kap: s.kap.map((a) => Float64Array.from(a)), N: Float64Array.from(s.N) });

function tangentOf(nl, e, N) {
  const Ng = nl.pdelta ? N : 0;
  if (e.kt && e.ktN === Ng) return e.kt;
  const k = Float64Array.from(e.k0);
  if (Ng) addGeometric(k, Ng, e.ax.L);
  e.kt = guyan(k, null, e.rel).k; e.ktN = Ng;
  return e.kt;
}
const mv = (k, x, n = 12) => { const y = new Float64Array(n); for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < n; j++) s += k[i * n + j] * x[j]; y[i] = s; } return y; };

/** One beam: trial end forces, return mapping, tangent. ul = local displacements; st = committed state; returns { f (local end forces), kep, dp, kap, N, active }. */
function beamResponse(nl, k, ul, st) {
  const e = nl.els[k], kt = tangentOf(nl, e, st.N[k]);
  const dp = Float64Array.from(st.dp[k]), kap = Float64Array.from(st.kap[k]);
  const ueff = Float64Array.from(ul); for (let h = 0; h < 2; h++) { ueff[ROT[h][0]] -= dp[2 * h]; ueff[ROT[h][1]] -= dp[2 * h + 1]; }
  const peq = e.peq;
  const force = (u) => { const f = mv(kt, u); if (peq) for (let i = 0; i < 12; i++) f[i] -= peq[i]; return f; };
  let f = force(ueff);
  const info = (ff, h) => {
    const N = (ff[6] - ff[0]) / 2, My = ff[ROT[h][0]], Mz = ff[ROT[h][1]], g = gauge(e.cap, N, My, Mz);
    const mom = Math.hypot(My, Mz) || 1, uy = My / mom, uz = Mz / mom;
    const rho = 1 / Math.hypot(uy / g.mpy, uz / g.mpz), kref = 4 * e.b.E * (e.b.Iy * uy * uy + e.b.Iz * uz * uz) / e.ax.L;
    return { ...g, hs: nl.alpha * kref / rho, an: Math.hypot(g.gy, g.gz) };
  };
  const out = (ff, active, A, H) => {
    let kep = kt;
    if (active.length) {
      const m = active.length, kA = A.map((a) => mv(kt, a)), S = new Float64Array(m * m);
      for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) S[i * m + j] = dot(A[i], kA[j]) + (i === j ? H[i] : 0);
      kep = Float64Array.from(kt);
      const inv = [];
      for (let j = 0; j < m; j++) { const col = solveDense(S, Float64Array.from({ length: m }, (_, i) => (i === j ? 1 : 0)), m); if (!col) { if (process.env.NLDBG) console.log('singular S', Array.from(S), active, Array.from(H)); return { f: ff, kep: kt, dp, kap, N: (ff[6] - ff[0]) / 2, active: [] }; } inv.push(col); }
      for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) { let s = 0; for (let i = 0; i < m; i++) for (let j = 0; j < m; j++) s += kA[i][a] * inv[j][i] * kA[j][b]; kep[a * 12 + b] -= s; }
    }
    return { f: ff, kep, dp, kap, N: (ff[6] - ff[0]) / 2, active };
  };
  if (!e.cap.ok || (!e.end[0] && !e.end[1])) return out(f, [], null, null);
  const yielded = (ff, h) => { const g = info(ff, h); return g.mu - 1 - g.hs * kap0[h] > 1e-9; };
  const kap0 = Float64Array.from(kap), dp0 = Float64Array.from(dp), f0 = f;
  let active = [0, 1].filter((h) => e.end[h] && yielded(f0, h));
  if (!active.length) return out(f, [], null, null);
  let dl = new Float64Array(active.length), fc = f0;
  for (let pass = 0; pass < 3; pass++) {
    // closest-point return: Newton on the multipliers of the active ends, a evaluated at the current force
    for (let it = 0; it < 60; it++) {
      const gi = active.map((h) => info(fc, h));
      const A = gi.map((g, i) => { const a = new Float64Array(12), h = active[i]; a[ROT[h][0]] = g.gy; a[ROT[h][1]] = g.gz; return a; });
      const res = gi.map((g, i) => g.mu - 1 - g.hs * (kap0[active[i]] + dl[i] * g.an));
      if (res.every((v) => Math.abs(v) < 1e-10)) break;
      const kA = A.map((a) => mv(kt, a)), J = new Float64Array(active.length ** 2);
      for (let i = 0; i < active.length; i++) for (let j = 0; j < active.length; j++) J[i * active.length + j] = dot(A[i], kA[j]) + (i === j ? gi[i].hs * gi[i].an : 0);
      const d = solveDense(J, Float64Array.from(res), active.length);
      if (!d) break;
      for (let i = 0; i < active.length; i++) dl[i] = Math.max(0, dl[i] + d[i]);
      fc = Float64Array.from(f0);
      const kAn = active.map((h, i) => { const a = new Float64Array(12); a[ROT[h][0]] = gi[i].gy; a[ROT[h][1]] = gi[i].gz; return mv(kt, a); });
      for (let i = 0; i < active.length; i++) for (let a = 0; a < 12; a++) fc[a] -= dl[i] * kAn[i][a];
    }
    const others = [0, 1].filter((h) => e.end[h] && !active.includes(h) && yielded(fc, h));
    if (!others.length) break;
    active = [...active, ...others]; dl = Float64Array.from([...dl, ...others.map(() => 0)]);
  }
  f = fc;
  const live = [], A2 = [], H2 = [];
  active.forEach((h, i) => {
    const g = info(f, h);
    dp[2 * h] = dp0[2 * h] + dl[i] * g.gy; dp[2 * h + 1] = dp0[2 * h + 1] + dl[i] * g.gz; kap[h] = kap0[h] + dl[i] * g.an;
    if (dl[i] > 0 && g.an > 0) { const a = new Float64Array(12); a[ROT[h][0]] = g.gy; a[ROT[h][1]] = g.gz; live.push(h); A2.push(a); H2.push(g.hs * g.an); }
  });
  return out(f, live, A2, H2);
}

/** Internal force vector and tangent at the reduced displacement u. trial=true leaves `st` alone and returns the new state. */
export function assemble(nl, u, st) {
  const sys = nl.sys, full = expandFull(sys, u), fint = csrMul(nl.Kother, u, new Float64Array(sys.ndof));
  const C = new Coo(sys.ndof);
  for (let i = 0; i < nl.Kother.n; i++) for (let p = nl.Kother.ptr[i]; p < nl.Kother.ptr[i + 1]; p++) C.add(i, nl.Kother.col[p], nl.Kother.val[p]);
  const next = cloneState(st), resp = [];
  nl.els.forEach((e, k) => {
    const ug = e.dofs.map((d) => full[d]), ul = mv(e.T, ug), r = beamResponse(nl, k, ul, st);
    resp.push(r);
    next.dp[k] = r.dp; next.kap[k] = r.kap; next.N[k] = r.N;
    const fg = new Float64Array(12); for (let a = 0; a < 12; a++) { let s = 0; for (let b = 0; b < 12; b++) s += e.T[b * 12 + a] * r.f[b]; fg[a] = s; }
    const kg = congruent(r.kep, e.T, 12);
    for (let a = 0; a < 12; a++) {
      const ea = sys.ex(e.dofs[a]); if (!ea.length) continue;
      for (const [ra, ca] of ea) fint[ra] += ca * fg[a];
      for (let b = 0; b < 12; b++) { const v = kg[a * 12 + b]; if (!v) continue; for (const [ra, ca] of ea) for (const [rb, cb] of sys.ex(e.dofs[b])) C.add(ra, rb, ca * cb * v); }
    }
  });
  return { fint, K: C.toCsr(), next, resp, full };
}

function linSolve(K, rhs, n) {
  const out = [];
  let ok = true, factor = null;
  try { for (const b of rhs) { const r = pcg(K, b, { tol: 1e-12, factor, maxIter: Math.max(300, 4 * K.n) }); factor = r.factor || factor; if (!r.ok) { ok = false; break; } out.push(r.x); } } catch (e) { ok = false; }
  if (ok) return out;
  if (K.n > 1500) return null;
  const A = dense(K);
  const sols = rhs.map((b) => solveDense(A, b, K.n));
  return sols.every(Boolean) ? sols : null;
}
function fixControl(K, c) {                                                                         // row and column c replaced by the identity row
  const Kp = { n: K.n, ptr: K.ptr, col: K.col, val: Float64Array.from(K.val) }, row = new Float64Array(K.n);
  for (let i = 0; i < K.n; i++) for (let p = K.ptr[i]; p < K.ptr[i + 1]; p++) {
    if (i === c) { row[K.col[p]] += K.val[p]; Kp.val[p] = K.col[p] === c ? 1 : 0; }
    else if (K.col[p] === c) { Kp.val[p] = 0; }
  }
  return { Kp, row };
}

function modalPattern(nl, dir, pattern, massesList) {
  const ai = AX.indexOf(dir), sys = nl.sys;
  const r = influence(sys, ai), mr = mulCsr(sys.M, r), F = new Float64Array(sys.ndof);
  let phi1 = null;
  if (pattern === 'mode') {
    const { modal: solveModal } = nl; void solveModal;
  }
  for (let i = 0; i < sys.ndof; i++) F[i] = r[i] ? mr[i] : 0;
  return { F, r, mr };
}

export function pushoverOfFrame(frame, opts = {}) {
  const warnings = [];
  const dir = opts.dir === 'Y' ? 'Y' : 'X', ai = AX.indexOf(dir);
  const nl = nlSystem(frame, { fy: opts.fy ?? 355, r: opts.r ?? 0, pdelta: !!opts.pdelta, masses: opts.massList || null, gravity: opts.gravity || null, prep: opts.prep || null });
  warnings.push(...nl.warnings);
  const sys = nl.sys;
  if (!sys.ndof) return { ok: false, error: { code: 'no-dofs' }, warnings };
  if (!nl.els.some((e) => e.cap.ok && (e.end[0] || e.end[1]))) return { ok: false, error: { code: 'no-hinges' }, warnings };
  const { F: Flump, r } = modalPattern(nl, dir, opts.pattern);
  let Fp = Flump;
  if (opts.pattern !== 'uniform') {                                                                  // first mode of the same model (with the masses asked for)
    const mo = modalOfFrame(frame, { n: 3, masses: opts.massList || null });
    if (!mo.ok) return { ok: false, error: { code: 'no-modes', inner: mo.error }, warnings };
    const phi = reduceVec(mo.sys, mo.modal.modes[0]);
    Fp = Float64Array.from(Flump, (v, i) => v * phi[i]);
    if (Fp.every((v) => v === 0) || dot(Fp, r) < 0) Fp = Float64Array.from(Fp, (v) => -v);
    if (!(Math.abs(dot(Fp, r)) > 0)) return { ok: false, error: { code: 'bad-pattern' }, warnings };
  }
  const { stories, baseZ } = storiesOf(nl.fem, frame);
  if (!stories.length) return { ok: false, error: { code: 'no-floors' }, warnings };
  const top = stories[stories.length - 1];
  let c = -1;
  for (const n of top.nodes) { const t = sys.ex(6 * n + ai); if (t.length === 1 && t[0][1] === 1) { c = t[0][0]; break; } }
  if (c < 0) return { ok: false, error: { code: 'no-control' }, warnings };
  const H = top.z - baseZ, target = opts.target > 0 ? opts.target : 0.02 * H;
  const nsteps = Math.max(5, Math.min(400, opts.steps || 60)), n = sys.ndof;
  // gravity state first (load-controlled, Newton)
  let st = newState(nl), u = new Float64Array(n);
  const newton = (fixedControl, lam0, delta) => {
    let lam = lam0, ref = 0;
    let gn0 = 0;
    const ref0 = Math.sqrt(dot(nl.Fg, nl.Fg)) + (Math.abs(lam0) + 1e-3) * Math.sqrt(dot(Fp, Fp));
    for (let it = 0; it < 30; it++) {
      const a = assemble(nl, u, st), g = new Float64Array(n);
      for (let i = 0; i < n; i++) g[i] = a.fint[i] - nl.Fg[i] - lam * Fp[i];
      let gn = 0; for (let i = 0; i < n; i++) if (i !== c || !fixedControl) gn += g[i] * g[i];
      gn = Math.sqrt(gn);
      ref = Math.max(1e-9, Math.sqrt(dot(nl.Fg, nl.Fg)) + Math.abs(lam) * Math.sqrt(dot(Fp, Fp)));
      if (it === 0) gn0 = gn;
      if (!(gn <= 1e3 * Math.max(gn0, ref0)) || !Number.isFinite(lam)) return { ok: false };                  // diverging: the caller halves the step
      if (gn <= 1e-7 * ref + 1e-7 * Math.sqrt(dot(a.fint, a.fint)) + 1e-9) { return { ok: true, a, lam, it }; }
      if (!fixedControl) {
        const sol = linSolve(a.K, [Float64Array.from(g, (v) => -v)], n); if (!sol) return { ok: false };
        for (let i = 0; i < n; i++) u[i] += sol[0][i];
        continue;
      }
      const { Kp, row } = fixControl(a.K, c);
      const rhs1 = Float64Array.from(g, (v, i) => (i === c ? 0 : -v)), rhs2 = Float64Array.from(Fp, (v, i) => (i === c ? 0 : v));
      const sol = linSolve(Kp, [rhs1, rhs2], n); if (!sol) return { ok: false };
      let sr = 0, sF = 0; for (let j = 0; j < n; j++) if (j !== c) { sr += row[j] * sol[0][j]; sF += row[j] * sol[1][j]; }
      const dlam = -(g[c] + sr) / (sF - Fp[c]);
      for (let i = 0; i < n; i++) u[i] += sol[0][i] + dlam * sol[1][i];
      lam += dlam;
    }
    return { ok: false };
  };
  if (nl.Fg.some((v) => v !== 0)) {
    const g0 = newton(false, 0);
    if (!g0.ok) return { ok: false, error: { code: 'gravity-failed' }, warnings };
    st = g0.a.next;
    if (st.kap.some((k) => k[0] > 0 || k[1] > 0)) warnings.push({ code: 'gravity-yield' });
  }
  const u0 = u[c];
  const curve = [{ delta: 0, V: 0, lambda: 0 }], events = [], seen = new Set();
  let lam = 0, stopped = null, ud = u[c] - u0, peak = { V: 0, delta: 0 }, step = 0, dstep = target / nsteps, halvings = 0, last = null;
  const VOf = (l) => l * dot(Fp, r);
  while (ud < target - 1e-9 * target && step < nsteps * 8) {
    const save = { u: Float64Array.from(u), st, lam };
    const inc = Math.min(dstep, target - ud);
    u[c] += inc;
    const res = newton(true, lam, inc);
    if (!res.ok) {
      u = save.u; st = save.st; lam = save.lam; halvings++;
      if (halvings > 6) { stopped = 'no-convergence'; break; }
      dstep /= 2; continue;
    }
    halvings = 0; step++;
    lam = res.lam; st = res.a.next; ud = u[c] - u0; last = res.a;
    const V = VOf(lam);
    curve.push({ delta: ud, V, lambda: lam });
    if (V > peak.V) peak = { V, delta: ud };
    st.kap.forEach((k, m) => k.forEach((v, h) => { const key = m + ':' + h; if (v > 0 && !seen.has(key)) { seen.add(key); events.push({ member: frame.members[m].id, index: m, end: h === 0 ? 'i' : 'j', delta: ud, V, step }); } }));
    if (step % 5 === 0 && curve.length > 8 && peak.V > 0) {                                           // a plateau: the load no longer rises over the last steps
      const a = curve[curve.length - 6], b = curve[curve.length - 1], k0 = curve[1].V / curve[1].delta;
      if (a && k0 > 0 && (b.V - a.V) / (b.delta - a.delta) < 1e-4 * k0 && b.V > 0.5 * peak.V && false) { stopped = 'plateau'; }
    }
    if (V < 0.2 * peak.V && peak.V > 0) { stopped = 'strength-lost'; break; }
    dstep = Math.min(target / nsteps, dstep * 1.5);
  }
  const hinges = [];
  nl.els.forEach((e, m) => [0, 1].forEach((h) => {
    if (!e.cap.ok || !e.end[h]) return;
    const f = last ? last.resp[m].f : null, N = f ? (f[6] - f[0]) / 2 : 0, g = f ? gauge(e.cap, N, f[ROT[h][0]], f[ROT[h][1]]) : { mu: 0 };
    const kap = st.kap[m][h];
    if (kap > 0 || g.mu > 0.7) hinges.push({ member: frame.members[m].id, index: m, end: h === 0 ? 'i' : 'j', mu: g.mu, rotation: kap, yielded: kap > 0, N, My: f ? f[ROT[h][0]] : 0, Mz: f ? f[ROT[h][1]] : 0 });
  }));
  hinges.sort((a, b) => b.rotation - a.rotation || b.mu - a.mu);
  const fullEnd = expandFull(sys, u), dv = driftRows(nl.fem, stories, driftVector(nl.fem, stories, fullEnd));
  const k0 = curve[1] && curve[1].delta ? curve[1].V / curve[1].delta : 0;
  return { ok: true, curve, events, hinges, peak, stopped, target, steps: step, control: { dir, height: H }, pattern: opts.pattern === 'uniform' ? 'uniform' : 'mode', drifts: dv, k0,
    gravity: nl.Fg.some((v) => v !== 0), pdelta: !!opts.pdelta, r: opts.r ?? 0, fy: opts.fy ?? 355, warnings, note: NOTE, stories, fem: nl.fem, state: st };
}

// ---- nonlinear time history (Newmark average acceleration with Newton–Raphson) ----------------------------------------------------------------
export function nlTimeHistoryOfFrame(frame, opts = {}) {
  const warnings = [];
  const dir = opts.dir || 'X', ai = AX.indexOf(dir);
  const rec = opts.record;
  if (!rec?.a || rec.a.length < 2) return { ok: false, error: { code: 'no-record' }, warnings };
  const nl = nlSystem(frame, { fy: opts.fy ?? 355, r: opts.r ?? 0, pdelta: !!opts.pdelta, masses: opts.massList || null, gravity: opts.gravity || null, prep: opts.prep || null });
  warnings.push(...nl.warnings);
  const sys = nl.sys, n = sys.ndof;
  if (!nl.els.some((e) => e.cap.ok && (e.end[0] || e.end[1]))) return { ok: false, error: { code: 'no-hinges' }, warnings };
  const mo = modalOfFrame(frame, { n: 4, masses: opts.massList || null });
  if (!mo.ok) return { ok: false, error: { code: 'no-modes' }, warnings };
  const w = mo.modal.omega, nO = w.length;
  const dm = opts.damping || { xi: 0.05 };
  const i1 = Math.min(Math.max(1, dm.modes?.[0] ?? 1), nO), j1 = Math.min(Math.max(1, dm.modes?.[1] ?? Math.min(3, nO)), nO);
  const ray = rayleighCoeffs(w[i1 - 1], w[j1 === i1 ? Math.min(nO, i1 + 1) - 1 : j1 - 1], dm.xi ?? 0.05);
  const unit = opts.unit === 'g' ? G_MM : opts.unit === 'mms2' ? 1 : 1000, sc = (opts.scale ?? 1) * unit;
  const h = opts.h > 0 ? opts.h : rec.dt, rs = resample(rec, h, { tail: opts.tail || 0 }), ag = Float64Array.from(rs.a, (v) => v * sc), ns = ag.length;
  if (ns > 40000) return { ok: false, error: { code: 'too-many-steps', n: ns }, warnings };
  const r = influence(sys, ai), mr = mulCsr(sys.M, r), M = sys.M, K0 = sys.K;
  const { stories } = storiesOf(nl.fem, frame), top = stories.length - 1;
  const beta = 0.25, gamma = 0.5, c1 = 1 / (beta * h * h), c2 = 1 / (beta * h), c3 = 1 / (2 * beta) - 1;
  const cv = (v) => { const a = mulCsr(M, v), b = mulCsr(K0, v); return Float64Array.from(a, (x, i) => ray.a0 * x + ray.a1 * b[i]); };
  let st = newState(nl), u = new Float64Array(n);
  if (nl.Fg.some((v) => v !== 0)) {                                                                  // gravity state
    for (let it = 0; it < 20; it++) {
      const a = assemble(nl, u, st), g = Float64Array.from(a.fint, (v, i) => v - nl.Fg[i]);
      if (Math.sqrt(dot(g, g)) <= 1e-9 * (1 + Math.sqrt(dot(nl.Fg, nl.Fg)))) { st = a.next; break; }
      const s = linSolve(a.K, [Float64Array.from(g, (v) => -v)], n); if (!s) return { ok: false, error: { code: 'gravity-failed' }, warnings };
      for (let i = 0; i < n; i++) u[i] += s[0][i];
      st = a.next;
    }
  }
  const Fg = nl.Fg, v = new Float64Array(n);
  let acc = Float64Array.from(r, (x) => -x * ag[0]);
  const roof = new Float64Array(ns), base = new Float64Array(ns), t = new Float64Array(ns), np = stories.reduce((s2, q) => s2 + q.probes.length, 0);
  const dmax = new Float64Array(2 * np), events = [], seen = new Set();
  const axis = ai === 1 ? 1 : 0;
  const record = (i, full, a) => { roof[i] = top >= 0 ? floorMotion(nl.fem, stories[top], full)[axis] : 0; let vb = 0; for (let q = 0; q < n; q++) if (r[q]) vb += a.fint[q] - Fg[q]; base[i] = vb; const d = driftVector(nl.fem, stories, full); for (let k = 0; k < d.length; k++) dmax[k] = Math.max(dmax[k], Math.abs(d[k])); };
  { const a0 = assemble(nl, u, st); record(0, expandFull(sys, u), a0); }
  for (let i = 0; i + 1 < ns; i++) {
    t[i + 1] = (i + 1) * h;
    const x1 = Float64Array.from(u, (q, k) => c2 * v[k] + c3 * acc[k]);
    const x2 = Float64Array.from(u, (q, k) => (gamma / beta - 1) * v[k] + h * (gamma / (2 * beta) - 1) * acc[k]);
    const pm = mulCsr(M, x1), pc = cv(x2), un = Float64Array.from(u);
    let conv = false, a = null;
    for (let it = 0; it < 25; it++) {
      a = assemble(nl, un, st);
      const du = Float64Array.from(un, (q, k) => q - u[k]), mu = mulCsr(M, du), cu = cv(du);
      const g = new Float64Array(n);
      for (let k = 0; k < n; k++) g[k] = c1 * mu[k] + (a.fint[k] - Fg[k]) + gamma / (beta * h) * cu[k] - (-mr[k] * ag[i + 1] + pm[k] + pc[k]);
      const gn = Math.sqrt(dot(g, g)), ref = 1e-9 + 1e-6 * (Math.sqrt(dot(pm, pm)) + Math.sqrt(dot(a.fint, a.fint)));
      if (gn <= ref) { conv = true; break; }
      const Keff = csrComb(1, a.K, c1 + gamma / (beta * h) * ray.a0, M); const Kd = ray.a1 ? csrComb(1, Keff, gamma / (beta * h) * ray.a1, K0) : Keff;
      const s = linSolve(Kd, [Float64Array.from(g, (q) => -q)], n); if (!s) return { ok: false, error: { code: 'solver', step: i + 1 }, warnings, t: t.slice(0, i + 1) };
      for (let k = 0; k < n; k++) un[k] += s[0][k];
    }
    if (!conv) return { ok: false, error: { code: 'no-convergence', step: i + 1 }, warnings };
    st = a.next;
    const vn = new Float64Array(n), an = new Float64Array(n);
    for (let k = 0; k < n; k++) { const du = un[k] - u[k]; vn[k] = gamma / (beta * h) * du + (1 - gamma / beta) * v[k] + h * (1 - gamma / (2 * beta)) * acc[k]; an[k] = c1 * du - c2 * v[k] - c3 * acc[k]; }
    u.set(un); v.set(vn); acc = an;
    record(i + 1, a.full, a);
    st.kap.forEach((kk, m) => kk.forEach((val, hh) => { const key = m + ':' + hh; if (val > 0 && !seen.has(key)) { seen.add(key); events.push({ member: frame.members[m].id, index: m, end: hh === 0 ? 'i' : 'j', t: (i + 1) * h }); } }));
  }
  const peak = (arr) => { let m = 0, k = 0; for (let i = 0; i < arr.length; i++) if (Math.abs(arr[i]) > m) { m = Math.abs(arr[i]); k = i; } return { value: m, t: k * h }; };
  let off = 0;
  const drifts = stories.map((s2) => { let mx = 0, my = 0; s2.probes.forEach((_, pi) => { mx = Math.max(mx, dmax[2 * (off + pi)]); my = Math.max(my, dmax[2 * (off + pi) + 1]); }); off += s2.probes.length; return { name: s2.name, z: s2.z, h: s2.h, dx: mx, dy: my, ratioX: s2.h > 0 ? mx / s2.h : null, ratioY: s2.h > 0 ? my / s2.h : null }; });
  const hinges = [];
  nl.els.forEach((e, m) => [0, 1].forEach((hh) => { const kap = st.kap[m][hh]; if (kap > 0) hinges.push({ member: frame.members[m].id, index: m, end: hh === 0 ? 'i' : 'j', rotation: kap, yielded: true }); }));
  hinges.sort((a, b) => b.rotation - a.rotation);
  return { ok: true, t, h, steps: ns, series: { roof: { data: roof, peak: peak(roof) }, base: { data: base, peak: peak(base) }, input: { data: ag, peak: peak(ag) } }, drifts, hinges, events, damping: ray, dir, warnings, note: NOTE, stories, fem: nl.fem, residual: { roof: roof[ns - 1] } };
}
