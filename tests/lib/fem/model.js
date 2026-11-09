/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — assemble and solve a mixed beam / shell / solid model (0.9 SU.908). DOM-free; imports linalg.js, shell.js, tet10.js and
 * lib/frame's own beam stiffness (frame-solve.js localK, frame-model.js axesOf) so a beam here is exactly a beam there.
 * An analysis aid, not a code check; your engineer reviews the results.
 *
 * model = {
 *   nodes:   [[x, y, z]]                                                       mm
 *   beams:   [{ i, j, E, G, A, Iy, Iz, J, rho, roll }]                         node indices; frame axes (lib/frame axesOf); rho kg/m³
 *   shells:  [{ n: [4], E, nu, t, rho, bending: 'mitc4' | 'dkq' }]            four corners in order round the plate
 *   solids:  [{ n: [10], E, nu, rho }]                                         tet10 node order (tet10.js)
 *   beams may carry rel: { i: [6 booleans], j: [6] } (0.9: released end actions, by static condensation of K and Guyan reduction of M)
 *   diaphragms: [{ nodes: [node indices] }]  (0.9) rigid in the floor's plane: ux, uy, rz of every node of the floor follow the first
 *            node that no support holds in those three; the other dofs stay free
 *   fix:     [{ node, dofs: [0..5], values?: [one per dof, default 0] }]   held global dofs (ux uy uz rx ry rz); a node of solids only has dofs 0..2
 *   springs: [{ node, dof, k }]
 *   masses:  [{ node, m: [mx, my, mz] }]  (0.9, dynamics) lumped translational masses in tonne (N s²/mm), added to the mass matrix; held nodes ignore them
 *   rigid:   [{ master, slaves: [nodes] }]  rigid links (exact, by elimination): slave u = master u + θ × r, θ = master θ
 * }
 * loads = { nodal: [{ node, F: [6] }], area: [{ shell, q: [qx, qy, qz] }] (N/mm² on the shell), pressure: [{ solid, face, p }],
 *           gravity: [gx, gy, gz] (m/s², self weight of every element that has rho) }
 *
 *   build(model) → sys   { ndof (reduced), K (Csr), M (Csr), red (full→reduced map), … }
 *   solveStatic(sys, loads, { tol, prec }) → { u (reduced), full (6·nodes), reactions (6·nodes), iter, rel, ok, bytes }
 *   modal(sys, n, { tol, maxIter }) → { freqHz: [], omega: [], modes: [Float64Array full-dof], iter, ok }
 *   shellResult(sys, full, k, xi, eta) → [Nx Ny Nxy Mx My Mxy Qx Qy] local axes · solidStress(sys, full, k, L) · beamEnds(sys, full, k)
 * Density: kg/m³ in, tonne/mm³ inside (×1e-12), so N, mm, s are consistent and ω² = eigenvalue in 1/s².
 */
import { Coo, csrMul, pcg, jacobiEig, solveDense } from './linalg.js';
import { shellK, shellMass, shellAxes, areaLoad, toLocal, shellResultants, rotaryLump } from './shell.js';
import { tetK, tetM, tetStress, faceLoad, vonMises } from './tet10.js';
import { localK } from '../frame/frame-solve.js';
import { axesOf } from '../frame/frame-model.js';

export const NOTE = 'Not a code check; your engineer reviews the results.';
const RHO = 1e-12;

function beamMass(rho, A, Ip, L) {
  const m = new Float64Array(144), r = rho * RHO;
  const put = (a, b, v) => { m[a * 12 + b] += v; };
  const ax = r * A * L / 6; put(0, 0, 2 * ax); put(0, 6, ax); put(6, 0, ax); put(6, 6, 2 * ax);
  const tr = r * Ip * L / 6; put(3, 3, 2 * tr); put(3, 9, tr); put(9, 3, tr); put(9, 9, 2 * tr);
  const c = r * A * L / 420, l = L;
  const B = [[156, 22 * l, 54, -13 * l], [22 * l, 4 * l * l, 13 * l, -3 * l * l], [54, 13 * l, 156, -22 * l], [-13 * l, -3 * l * l, -22 * l, 4 * l * l]];
  const yp = [1, 5, 7, 11], zp = [2, 4, 8, 10];                                   // (v, θz, v, θz) and (w, θy, w, θy): θy = −w'
  for (let a = 0; a < 4; a++) for (let b = 0; b < 4; b++) {
    put(yp[a], yp[b], c * B[a][b]);
    put(zp[a], zp[b], c * B[a][b] * ((a % 2) !== (b % 2) ? -1 : 1));
  }
  return m;
}
export function beamT(ax) { const T = new Float64Array(144); for (let b = 0; b < 4; b++) for (let r = 0; r < 3; r++) { const row = [ax.ex, ax.ey, ax.ez][r]; for (let c = 0; c < 3; c++) T[(3 * b + r) * 12 + 3 * b + c] = row[c]; } return T; }
export function congruent(k, T, n) {                                                      // Tᵀ k T
  const tmp = new Float64Array(n * n), out = new Float64Array(n * n);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let s = 0; for (let m = 0; m < n; m++) s += k[i * n + m] * T[m * n + j]; tmp[i * n + j] = s; }
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { let s = 0; for (let m = 0; m < n; m++) s += T[m * n + i] * tmp[m * n + j]; out[i * n + j] = s; }
  return out;
}

/** Released local dofs `rel` taken out of a 12x12 stiffness (static condensation) and mass (Guyan reduction with the same transform). */
export function guyan(k, m, rel) {
  if (!rel.length) return { k, m };
  const n = 12, keep = [], r = rel.length;
  for (let i = 0; i < n; i++) if (!rel.includes(i)) keep.push(i);
  const kbb = new Float64Array(r * r);
  for (let a = 0; a < r; a++) for (let b = 0; b < r; b++) kbb[a * r + b] = k[rel[a] * n + rel[b]];
  // T (12 x 12): retained dof → itself; released dof → −Kbb⁻¹ Kba (column by column)
  const T = new Float64Array(n * n);
  for (const c of keep) {
    T[c * n + c] = 1;
    const x = solveDense(kbb, Float64Array.from({ length: r }, (_, a) => -k[rel[a] * n + c]), r);
    if (!x) throw new Error('release: a member is freed at both ends in the same way');
    for (let a = 0; a < r; a++) T[rel[a] * n + c] = x[a];
  }
  return { k: congruent(k, T, n), m: m ? congruent(m, T, n) : null };
}

/** The elements as lazy builders: { dofs: [full dof ids], k(), m() }. */
function elements(model) {
  const P = model.nodes, out = [];
  for (const [bi, b] of (model.beams || []).entries()) {
    const ax = axesOf(P[b.i], P[b.j], b.roll || 0), dofs = [];
    for (const n of [b.i, b.j]) for (let d = 0; d < 6; d++) dofs.push(6 * n + d);
    const rel = b.rel ? [...b.rel.i.map((r, d) => (r ? d : -1)), ...b.rel.j.map((r, d) => (r ? 6 + d : -1))].filter((d) => d >= 0) : [];
    let cache = null;
    const local = () => cache || (cache = guyan(localK(b.E, b.G, b.A, b.Iy, b.Iz, b.J, ax.L), b.rho ? beamMass(b.rho, b.A, b.Iy + b.Iz, ax.L) : null, rel));
    out.push({ kind: 'beam', idx: bi, dofs, ax, rel,
      kl: () => local().k,
      k: () => congruent(local().k, beamT(ax), 12),
      m: () => (b.rho ? congruent(local().m, beamT(ax), 12) : null) });
  }
  for (const [si, s] of (model.shells || []).entries()) {
    const pts = s.n.map((n) => P[n]), dofs = [];
    for (const n of s.n) for (let d = 0; d < 6; d++) dofs.push(6 * n + d);
    out.push({ kind: 'shell', idx: si, dofs,
      k: () => shellK(pts, s.E, s.nu, s.t, { bending: s.bending || 'mitc4' }).k,
      m: () => {
        if (!s.rho) return null;
        const ax = shellAxes(pts), m = shellMass(pts, s.rho * RHO * s.t, ax), r = rotaryLump(s.rho * RHO, s.t, ax.area);
        for (let i = 0; i < 4; i++) for (let d = 3; d < 5; d++) m[(6 * i + d) * 24 + 6 * i + d] += r;
        return m;
      } });
  }
  for (const [ti, s] of (model.solids || []).entries()) {
    const X = new Float64Array(30), dofs = [];
    s.n.forEach((n, a) => { X[3 * a] = P[n][0]; X[3 * a + 1] = P[n][1]; X[3 * a + 2] = P[n][2]; for (let d = 0; d < 3; d++) dofs.push(6 * n + d); });
    out.push({ kind: 'solid', idx: ti, dofs, X, k: () => tetK(X, s.E, s.nu), m: () => (s.rho ? tetM(X, s.rho * RHO) : null) });
  }
  return out;
}

export function build(model, { mass = true } = {}) {
  const nn = model.nodes.length, P = model.nodes, el = elements(model);
  const stiff = new Uint8Array(6 * nn);
  for (const e of el) e.dofs.forEach((d, a) => { if (!(e.rel && e.rel.includes(a))) stiff[d] = 1; });
  for (const sp of model.springs || []) stiff[6 * sp.node + sp.dof] = 1;
  const held = new Uint8Array(6 * nn);
  for (const f of model.fix || []) for (const d of f.dofs) held[6 * f.node + d] = 1;
  // rigid links: slave dofs are written in terms of the master's
  const slave = new Map();
  for (const r of model.rigid || []) for (const s of r.slaves) {
    const a = P[r.master], b = P[s], rv = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    for (let d = 0; d < 6; d++) if (held[6 * s + d]) throw new Error('rigid: slave node ' + s + ' has a held dof');
    // u_s = u_m + θ_m × r  → ux: +θy rz − θz ry ; uy: +θz rx − θx rz ; uz: +θx ry − θy rx
    const c = [[[6 * r.master, 1], [6 * r.master + 4, rv[2]], [6 * r.master + 5, -rv[1]]],
      [[6 * r.master + 1, 1], [6 * r.master + 5, rv[0]], [6 * r.master + 3, -rv[2]]],
      [[6 * r.master + 2, 1], [6 * r.master + 3, rv[1]], [6 * r.master + 4, -rv[0]]],
      [[6 * r.master + 3, 1]], [[6 * r.master + 4, 1]], [[6 * r.master + 5, 1]]];
    for (let d = 0; d < 6; d++) slave.set(6 * s + d, c[d]);
  }
  // rigid floors (in plane): ux, uy, rz of the floor's free nodes follow the first of them
  for (const dg of model.diaphragms || []) {
    const free = (dg.nodes || []).filter((n) => ![0, 1, 5].some((d) => held[6 * n + d] || slave.has(6 * n + d)) && [0, 1, 5].every((d) => stiff[6 * n + d]));
    if (free.length < 2) continue;
    const m = free[0], a = P[m];
    for (const s of free.slice(1)) {
      const b = P[s], dx = b[0] - a[0], dy = b[1] - a[1];
      slave.set(6 * s, [[6 * m, 1], [6 * m + 5, -dy]]);
      slave.set(6 * s + 1, [[6 * m + 1, 1], [6 * m + 5, dx]]);
      slave.set(6 * s + 5, [[6 * m + 5, 1]]);
    }
  }
  const red = new Int32Array(6 * nn).fill(-1);
  let nr = 0;
  for (let d = 0; d < 6 * nn; d++) if (stiff[d] && !held[d] && !slave.has(d)) red[d] = nr++;
  const expand = (d) => (slave.has(d) ? slave.get(d).map(([m, c]) => [red[m], c]).filter(([r]) => r >= 0) : red[d] >= 0 ? [[red[d], 1]] : []);
  const cacheE = new Map(), ex = (d) => { let v = cacheE.get(d); if (!v) { v = expand(d); cacheE.set(d, v); } return v; };
  const K = new Coo(nr), M = new Coo(nr);
  const scatter = (C, dofs, ke) => {
    const n = dofs.length;
    for (let a = 0; a < n; a++) {
      const ea = ex(dofs[a]); if (!ea.length) continue;
      for (let b = 0; b < n; b++) {
        const v = ke[a * n + b]; if (!v) continue;
        const eb = ex(dofs[b]);
        for (const [ra, ca] of ea) for (const [rb, cb] of eb) C.add(ra, rb, ca * cb * v);
      }
    }
  };
  for (const e of el) { scatter(K, e.dofs, e.k()); if (mass) { const m = e.m(); if (m) scatter(M, e.dofs, m); } }
  for (const sp of model.springs || []) { const r = ex(6 * sp.node + sp.dof); for (const [ra, ca] of r) K.add(ra, ra, sp.k * ca * ca); }
  if (mass) for (const q of model.masses || []) for (let d = 0; d < 3; d++) if (q.m[d]) { const e = ex(6 * q.node + d); for (const [ra, ca] of e) for (const [rb, cb] of e) M.add(ra, rb, ca * cb * q.m[d]); }
  return { model, el, nn, ndof: nr, red, ex, slave, held, stiff, K: K.toCsr(), M: mass ? M.toCsr() : null };
}

/** Full-dof vector from a reduced one (held and unstiffened dofs 0, slaves from their masters). */
export function expandFull(sys, u) {
  const full = new Float64Array(6 * sys.nn);
  for (let d = 0; d < full.length; d++) { if (sys.red[d] >= 0) full[d] = u[sys.red[d]]; }
  for (const [d, terms] of sys.slave) { let s = 0; for (const [m, c] of terms) s += c * full[m]; full[d] = s; }
  return full;
}
function reducedLoad(sys, F) {
  const f = new Float64Array(sys.ndof);
  for (let d = 0; d < F.length; d++) if (F[d]) for (const [r, c] of sys.ex(d)) f[r] += c * F[d];
  return f;
}
export function loadVector(sys, loads) {
  const { model } = sys, F = new Float64Array(6 * sys.nn);
  for (const l of loads.nodal || []) for (let d = 0; d < 6; d++) F[6 * l.node + d] += l.F[d] || 0;
  for (const l of loads.area || []) {
    const s = model.shells[l.shell], f = areaLoad(s.n.map((n) => model.nodes[n]), l.q);
    s.n.forEach((n, i) => { for (let d = 0; d < 3; d++) F[6 * n + d] += f[6 * i + d]; });
  }
  for (const l of loads.pressure || []) {
    const s = model.solids[l.solid], e = sys.el.find((q) => q.kind === 'solid' && q.idx === l.solid), f = faceLoad(e.X, l.face, l.p);
    s.n.forEach((n, a) => { for (let d = 0; d < 3; d++) F[6 * n + d] += f[3 * a + d]; });
  }
  if (loads.gravity) {
    for (const e of sys.el) {
      const m = e.m(); if (!m) continue;
      const g = new Float64Array(e.dofs.length);
      e.dofs.forEach((d, i) => { g[i] = loads.gravity[d % 6] || 0; });
      const n = e.dofs.length;
      for (let a = 0; a < n; a++) { let s = 0; for (let b = 0; b < n; b++) s += m[a * n + b] * g[b] * 1000; F[e.dofs[a]] += s; }   // m/s² → mm/s²
    }
  }
  return F;
}
export function solveStatic(sys, loads, { tol = 1e-10, prec = 'ic0', maxIter = 0 } = {}) {
  const F = loadVector(sys, loads);
  // prescribed (non-zero held) values: move K·u0 to the right-hand side
  const u0 = new Float64Array(6 * sys.nn);
  let any = false;
  for (const f of sys.model.fix || []) if (f.values) f.dofs.forEach((d, i) => { if (f.values[i]) { u0[6 * f.node + d] = f.values[i]; any = true; } });
  let Fr = F;
  if (any) { const R = reactions(sys, u0, null, true); Fr = Float64Array.from(F, (v, d) => v - R[d]); }
  const f = reducedLoad(sys, Fr);
  const r = pcg(sys.K, f, { tol, prec, maxIter });
  const full = expandFull(sys, r.x);
  if (any) for (let d = 0; d < full.length; d++) if (sys.held[d]) full[d] = u0[d];
  return { u: r.x, full, F, shift: r.factor ? r.factor.shift : 0, iter: r.iter, rel: r.rel, ok: r.ok, bytes: r.bytes, reactions: reactions(sys, full, F) };
}
/** Reactions at held dofs (and at slaved/idle ones, which come out zero): element forces K·u summed minus the applied loads. */
export function reactions(sys, full, F, all = false) {
  const R = new Float64Array(6 * sys.nn);
  for (const e of sys.el) {
    const k = e.k(), n = e.dofs.length;
    for (let a = 0; a < n; a++) { let s = 0; for (let b = 0; b < n; b++) s += k[a * n + b] * full[e.dofs[b]]; R[e.dofs[a]] += s; }
  }
  for (const sp of sys.model.springs || []) R[6 * sp.node + sp.dof] += sp.k * full[6 * sp.node + sp.dof];
  const out = new Float64Array(6 * sys.nn);
  for (let d = 0; d < out.length; d++) if (all) out[d] = R[d]; else if (sys.held[d]) out[d] = R[d] - (F ? F[d] : 0);
  return out;
}

/** The n lowest modes of K φ = ω² M φ by shifted-free subspace iteration (K⁻¹M applied by PCG) and a Rayleigh–Ritz step. */
export function modal(sys, nModes = 4, { tol = 1e-9, maxIter = 60, extra = 0, cgTol = 1e-12 } = {}) {
  const n = sys.ndof, q = Math.min(n, nModes + (extra || Math.max(4, nModes))), K = sys.K, M = sys.M;
  let seed = 12345;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) - 0.5;
  let X = Array.from({ length: q }, () => Float64Array.from({ length: n }, rnd));
  const tmp = new Float64Array(n), mdiag = new Float64Array(n);
  for (let i = 0; i < n; i++) for (let p = M.ptr[i]; p < M.ptr[i + 1]; p++) mdiag[i] += Math.abs(M.val[p]);
  // massless dofs cannot be excited: start inside the range of M
  X = X.map((x) => { csrMul(M, x, tmp); return Float64Array.from(tmp); });
  const dotM = (a, b) => { csrMul(M, b, tmp); let s = 0; for (let i = 0; i < n; i++) s += a[i] * tmp[i]; return s; };
  let factor = null, prevVals = null, iters = 0, vals = [], modes = [], ok = false;
  for (; iters < maxIter; iters++) {
    // Y = K⁻¹ M X
    const Y = X.map((x) => { csrMul(M, x, tmp); const r = pcg(K, Float64Array.from(tmp), { tol: cgTol, factor }); factor = r.factor || factor; return r.x; });
    // Rayleigh–Ritz in span(Y)
    const A = new Float64Array(q * q), B = new Float64Array(q * q), KY = Y.map((y) => csrMul(K, y, new Float64Array(n))), MY = Y.map((y) => csrMul(M, y, new Float64Array(n)));
    for (let i = 0; i < q; i++) for (let j = i; j < q; j++) {
      let a = 0, b = 0; for (let k = 0; k < n; k++) { a += Y[i][k] * KY[j][k]; b += Y[i][k] * MY[j][k]; }
      A[i * q + j] = A[j * q + i] = a; B[i * q + j] = B[j * q + i] = b;
    }
    // B = Lᵀ-free reduction: B = V Λ Vᵀ → S = Λ^-½ Vᵀ A V Λ^-½ (drops directions with no mass)
    const eb = jacobiEig(B, q), keep = eb.values.map((v, i) => [v, i]).filter(([v]) => v > 1e-12 * eb.values[q - 1]).map(([, i]) => i);
    const m = keep.length, S = new Float64Array(m * m);
    const W = keep.map((i) => eb.vectors[i].map((v) => v / Math.sqrt(eb.values[i])));       // columns of the transform (length q)
    for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) { let s = 0; for (let i = 0; i < q; i++) for (let j = 0; j < q; j++) s += W[a][i] * A[i * q + j] * W[b][j]; S[a * m + b] = s; }
    const es = jacobiEig(S, m);
    vals = es.values.slice(0, nModes);
    modes = es.vectors.slice(0, Math.min(q, m)).map((c) => { const phi = new Float64Array(n); for (let a = 0; a < m; a++) { const wa = W[a], ca = c[a]; for (let i = 0; i < q; i++) { const co = ca * wa[i]; if (co) for (let k = 0; k < n; k++) phi[k] += co * Y[i][k]; } } return phi; });
    X = modes.slice(0, q).map((v) => Float64Array.from(v));
    while (X.length < q) X.push(Float64Array.from({ length: n }, rnd));
    if (prevVals && vals.length === nModes && vals.every((v, i) => Math.abs(v - prevVals[i]) <= tol * Math.abs(v))) { ok = true; iters++; break; }
    prevVals = vals.slice();
  }
  void dotM; void solveDense; void mdiag;
  const omega = vals.map((v) => Math.sqrt(Math.max(v, 0)));
  const fulls = modes.slice(0, nModes).map((phi) => {
    const nrm = Math.sqrt(dotM(phi, phi)) || 1, f = expandFull(sys, phi.map((v) => v / nrm)); return f;
  });
  return { omega, freqHz: omega.map((w) => w / (2 * Math.PI)), modes: fulls, iter: iters, ok };
}

export function shellResult(sys, full, k, xi = 0, eta = 0) {
  const s = sys.model.shells[k], pts = s.n.map((n) => sys.model.nodes[n]);
  const el = shellK(pts, s.E, s.nu, s.t, { bending: s.bending || 'mitc4' }), ug = new Float64Array(24);
  s.n.forEach((n, i) => { for (let d = 0; d < 6; d++) ug[6 * i + d] = full[6 * n + d]; });
  return shellResultants(el, toLocal(el, ug), xi, eta);
}
export function solidStress(sys, full, k, L = [0.25, 0.25, 0.25, 0.25]) {
  const s = sys.model.solids[k], e = sys.el.find((q) => q.kind === 'solid' && q.idx === k), u = new Float64Array(30);
  s.n.forEach((n, a) => { for (let d = 0; d < 3; d++) u[3 * a + d] = full[6 * n + d]; });
  const sig = tetStress(e.X, u, s.E, s.nu, L);
  return { sigma: sig, vonMises: vonMises(sig) };
}
/** Beam end forces in the member's local axes (what the nodes exert on the member): 12 numbers. */
export function beamEnds(sys, full, k) {
  const b = sys.model.beams[k], e = sys.el.find((q) => q.kind === 'beam' && q.idx === k), T = beamT(e.ax), ul = new Float64Array(12), kl = e.kl();
  const ug = e.dofs.map((d) => full[d]);
  for (let i = 0; i < 12; i++) { let s = 0; for (let j = 0; j < 12; j++) s += T[i * 12 + j] * ug[j]; ul[i] = s; }
  return Array.from({ length: 12 }, (_, i) => { let s = 0; for (let j = 0; j < 12; j++) s += kl[i * 12 + j] * ul[j]; return s; });
}
export { vonMises };
