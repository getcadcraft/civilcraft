#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-craftscript-b.mjs — CraftScript builder B's builtins (docs/SCRIPTING-SPEC.md §1–§3, §6): dense and sparse linear
 * algebra (cs-lib-linalg.js), meshes and the native kernels (cs-lib-mesh.js), file io incl. HDF5 (cs-lib-io.js) and the Lua
 * adapter (cs-lang-lua.js). Every reference value is worked out independently in the comment beside it (closed forms,
 * textbook beams, analytic Poiseuille flow, the 1-D Laplacian's known eigenvalues), or a second reader where one exists
 * (h5py/numpy in a venv when present).
 *   node tools/partcraft-test/test-craftscript-b.mjs [--verbose] [--perf]
 * bin/test-craftscript.mjs runs the four parts through test-cs-linalg.mjs, test-cs-mesh.mjs, test-cs-io.mjs, test-cs-lua.mjs
 * (each `run(T)` → runPart(name, T); --lua runs only the Lua part).
 * --perf adds the ~100k-dof voxel cantilever timings (about two minutes). Temporary files: tmp/partcraft-craftscript-b/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const TMP = path.join(REPO, 'tmp/partcraft-craftscript-b');

/** bin/test-craftscript.mjs picks these up through test-cs-linalg/mesh/io/lua.mjs: run(T) with T = { ok, section, near, skip, … }. */
export const runPart = (part, T) => runCraftscriptBTests({ ...T, parts: [part], perf: process.argv.includes('--perf') });

export async function runCraftscriptBTests({ ok, section, near = (a, b, t) => Math.abs(a - b) <= t, perf = false, skip = (m) => console.log('  skip ' + m), parts = ['linalg', 'mesh', 'io', 'lua'] }) {
  const RT = await import(DEV + 'cs-runtime.js');
  const LA = await import(DEV + 'cs-lib-linalg.js');
  const ME = await import(DEV + 'cs-lib-mesh.js');
  const IO = await import(DEV + 'cs-lib-io.js');
  await import(DEV + 'cs-lang-lua.js');
  try { await import(DEV + 'cs-lang-craft.js'); } catch { /* A's adapter; parity checks skip without it */ }
  try { await import(DEV + 'cs-lib-core.js'); } catch { /* A's core library, when present */ }
  const st = (o) => ({ t: 'struct', fields: o });
  const T = (shape, d) => LA.tensor(shape, d);
  const M = (rows) => { const r = rows.length, c = rows[0].length, d = new Float64Array(r * c); rows.forEach((row, i) => row.forEach((x, j) => { d[i + j * r] = x; })); return LA.mat(r, c, d); };
  const col = (a) => T([a.length, 1], a);
  const B = (name) => { const b = RT.getBuiltin(name); if (!b) throw new Error('missing builtin ' + name); return (args, nargout = 1) => b.fn(args, { nargout, check() {}, print() {}, display() {} }); };
  const maxAbs = (a, b) => { let m = 0; for (let i = 0; i < a.length; i++) m = Math.max(m, Math.abs(a[i] - b[i])); return m; };
  const mm = (A, Bm) => LA.matmul(A, Bm);
  const tr = (A) => { const [n, m] = A.shape, d = new Float64Array(n * m); for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) d[j + i * m] = A.data[i + j * n]; return LA.mat(m, n, d); };
  const eye = (n) => { const d = new Float64Array(n * n); for (let i = 0; i < n; i++) d[i * (n + 1)] = 1; return LA.mat(n, n, d); };

  const box = B('meshBox')([100, 10, 10]);
  const A = M([[4, 1, 2], [1, 5, 3], [2, 3, 6]]);
  if (parts.includes('linalg')) {
  section('CraftScript B: registry');
  for (const n of ['linsolve', 'inv', 'det', 'lu', 'chol', 'qr', 'eig', 'norm', 'cond', 'sparse', 'full', 'speye', 'assemble', 'pcg', 'bicgstab', 'eigs', 'voxelize', 'tetmesh', 'hexKe', 't10Ke', 'voxelSolve', 'lbmInit', 'load', 'save']) ok(RT.hasBuiltin(n), `builtin ${n} registered`);
  ok(RT.hasMethod('sparse', 'mtimes') && RT.hasMethod('sparse', 'subsref') && RT.hasMethod('sparse', 'mldivide'), 'sparse operators registered as methods');
  ok(LA.skipped.length === 0 && ME.skipped.length === 0 && IO.skipped.length === 0, `no name clashes (${[...LA.skipped, ...ME.skipped, ...IO.skipped].join(', ') || 'none'})`);
  ok(RT.languageList().some((l) => l.id === 'lua' && l.ext.includes('.lua')), 'Lua language registered for .lua');

  section('CraftScript B: dense linear algebra vs reference values');
  ok(near(B('det')([A]), 70, 1e-12), 'det [4 1 2;1 5 3;2 3 6] = 70 (cofactors: 4·21 − 1·0 + 2·(−7))');
  ok(maxAbs(mm(B('inv')([A]), A).data, eye(3).data) < 1e-14, 'inv(A)·A = I');
  { const [L, U, P] = B('lu')([M([[1, 2], [3, 4]])], 3); ok(maxAbs(mm(P, M([[1, 2], [3, 4]])).data, mm(L, U).data) < 1e-15 && L.data[1] === 1 / 3 && U.data[0] === 3, 'lu: P·A = L·U, pivot row [3 4], l21 = 1/3'); }
  { const R = B('chol')([A]); ok(maxAbs(mm(tr(R), R).data, A.data) < 1e-14 && R.data[1] === 0 && near(R.data[0], 2, 0), 'chol: RᵀR = A, upper, r11 = 2'); }
  { const X = M([[1, 2, 3], [4, 5, 6], [7, 8, 10], [1, 0, 1]]), [Q, R] = B('qr')([X], 2); ok(maxAbs(mm(Q, R).data, X.data) < 1e-13 && maxAbs(mm(tr(Q), Q).data, eye(4).data) < 1e-14 && Math.abs(R.data[1]) < 1e-15, 'qr: QR = A, QᵀQ = I, R upper'); }
  { // 1-D Laplacian tridiag(−1, 2, −1), n = 8: λk = 2 − 2cos(kπ/9)
    const n = 8, d = new Float64Array(n * n); for (let i = 0; i < n; i++) { d[i * (n + 1)] = 2; if (i) { d[i + (i - 1) * n] = -1; d[i - 1 + i * n] = -1; } }
    const ev = B('eig')([LA.mat(n, n, d)]).data, ex = Array.from({ length: n }, (_, k) => 2 - 2 * Math.cos((k + 1) * Math.PI / (n + 1)));
    ok(maxAbs(ev, ex) < 1e-13, 'eig of the 8×8 Laplacian = 2 − 2cos(kπ/9), ascending');
    const [V, D] = B('eig')([LA.mat(n, n, d)], 2);
    ok(maxAbs(mm(LA.mat(n, n, d), V).data, mm(V, D).data) < 1e-13 && maxAbs(mm(tr(V), V).data, eye(n).data) < 1e-13, '[V, D] = eig: AV = VD, V orthonormal');
  }
  { const Bm = M([[2, 0, 0], [0, 3, 0], [0, 0, 4]]), [V, D] = B('eig')([A, Bm], 2); ok(maxAbs(mm(A, V).data, mm(mm(Bm, V), D).data) < 1e-12 && maxAbs(mm(mm(tr(V), Bm), V).data, eye(3).data) < 1e-13, 'eig(K, M): KV = MVD, VᵀMV = I'); }
  ok(B('norm')([A, 1]) === 11 && B('norm')([A, 'inf']) === 11 && near(B('norm')([A, 'fro']), Math.sqrt(105), 1e-13), 'norm 1 = 11, Inf = 11, fro = √105');
  ok(near(B('norm')([col([3, 4])]), 5, 0) && near(B('norm')([M([[3, 0], [0, 4]])]), 4, 1e-14), 'norm 2: [3;4] → 5, diag(3,4) → 4');
  ok(near(B('cond')([M([[1, 0], [0, 1e-3]])]), 1000, 1e-9), 'cond diag(1, 1e-3) = 1000');
  { const [x, info] = B('linsolve')([M([[1, 1], [1, 2], [1, 3]]), col([1, 2, 2])], 2); ok(near(x.data[0], 2 / 3, 1e-14) && near(x.data[1], 0.5, 1e-14) && /least squares/.test(info.fields.method), 'linsolve over-determined: least squares [2/3; 1/2] (normal equations by hand)'); }
  ok((() => { try { B('chol')([M([[1, 2], [2, 1]])]); return false; } catch (e) { return /not positive definite/.test(e.message); } })(), 'chol of an indefinite matrix says so');

  section('CraftScript B: sparse matrices');
  { // duplicates summed: (1,1) gets 1 + 2, (2,3) gets 5
    const S = B('sparse')([col([1, 1, 2, 3]), col([1, 1, 3, 2]), col([1, 2, 5, 7]), 3, 3]);
    ok(S.t === 'sparse' && S.col.length === 3 && S.val[0] === 3 && Array.from(S.rowPtr).join() === '0,1,2,3', 'sparse(i, j, v): duplicates summed (1,1) = 1 + 2, CSR rows');
    ok(Array.from(B('full')([S]).data).join() === '3,0,0,0,0,7,0,5,0', 'full() column-major');
    const St = RT.methodFor('transpose', [S])([S]); ok(Array.from(B('full')([St]).data).join() === '3,0,0,0,0,5,0,7,0', "S' (method)");
    const sum = RT.methodFor('plus', [S, S])([S, St]); ok(Array.from(B('full')([sum]).data).join() === '6,0,0,0,0,12,0,12,0', 'S + Sᵀ stays sparse and adds');
    const sub = RT.methodFor('subsref', [S])([S, { type: '()', subs: [col([3, 2]), ':'] }]); ok(sub.n === 2 && Array.from(B('full')([sub]).data).join() === '0,0,7,0,0,5', 'S([3 2], :)');
    const S2 = RT.methodFor('subsasgn', [S])([S, 9, 1, 3]); ok(B('full')([S2]).data[6] === 9 && S2.col.length === 4, 'S(1, 3) = 9');
    const y = B('csrmul')([S, col([1, 2, 3])]); ok(Array.from(y.data).join() === '3,15,14', 'csrmul: [3·1; 5·3; 7·2]');
    const prod = RT.methodFor('mtimes', [S, S])([S, S]); ok(maxAbs(B('full')([prod]).data, mm(B('full')([S]), B('full')([S])).data) === 0, 'sparse × sparse = dense product');
  }
  { // assemble = the same matrix as sparse(iK, jK, sK) for a 1-D bar of 4 two-node elements, k = [1 −1; −1 1]·w
    const edof = M([[1, 2], [2, 3], [3, 4], [4, 5]]), Ke = M([[1, -1], [-1, 1]]), w = col([1, 2, 3, 4]);
    const K1 = B('assemble')([edof, Ke, w]);
    const iK = [], jK = [], sK = []; for (let e = 0; e < 4; e++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) { iK.push(e + 1 + a); jK.push(e + 1 + b); sK.push(Ke.data[a + 2 * b] * (e + 1)); }
    const K2 = B('sparse')([col(iK), col(jK), col(sK)]);
    ok(maxAbs(B('full')([K1]).data, B('full')([K2]).data) === 0 && K1.n === 5, 'assemble(edof, Ke, w) = sparse(iK, jK, sK)');
    ok(B('full')([K1]).data[1 + 5 * 1] === 3, 'node 2 diagonal = w1 + w2 = 3');
  }
  { // 1-D Laplacian n = 5000 (fixed–free): solution of K u = 1 has u(n) = n(n+1)/2
    const n = 5000, I = [], J = [], V = [];
    for (let e = 0; e < n - 1; e++) for (const [a, b, v] of [[e, e, 1], [e + 1, e + 1, 1], [e, e + 1, -1], [e + 1, e, -1]]) { I.push(a + 1); J.push(b + 1); V.push(v); }
    I.push(1); J.push(1); V.push(1);
    const K = B('sparse')([col(I), col(J), col(V), n, n]), f = col(new Float64Array(n).fill(1)), exact = n * (n + 1) / 2;
    const [x0, i0] = B('linsolve')([K, f], 2); ok(near(x0.data[n - 1], exact, 1e-6 * exact) && /envelope/.test(i0.fields.method), `K\\f direct (envelope Cholesky): u(n) = n(n+1)/2 = ${exact}`);
    for (const prec of ['ic0', 'amg', 'jacobi']) {
      const [x, info] = B('pcg')([K, f, st({ prec, tol: 1e-10, maxit: 20000 })], 2);
      ok(info.fields.converged && near(x.data[n - 1], exact, 1e-6 * exact), `pcg + ${prec}: converged in ${info.fields.iterations} iterations, u(n) right`);
    }
    const [, ij] = B('pcg')([K, f, st({ prec: 'jacobi', tol: 1e-10, maxit: 20 })], 2); ok(!ij.fields.converged && ij.fields.iterations === 20, 'pcg reports a run that did not converge (maxit 20)');
    ok((() => { try { B('pcg')([K, f, st({ prec: 'jacobi', maxit: 5 })]); return false; } catch (e) { return /did not converge/.test(e.message); } })(), 'pcg with one output throws when it does not converge');
    // eigs: λk = 2 − 2cos((2k − 1)π/(2n + 1)) for the fixed–free string
    const [, D] = B('eigs')([K, undefined, 3, st({ tol: 1e-12 })], 2), ex = [1, 2, 3].map((k) => 2 - 2 * Math.cos((2 * k - 1) * Math.PI / (2 * n + 1)));
    ok([0, 1, 2].every((i) => Math.abs(D.data[i * 4] - ex[i]) < 1e-9 * ex[i] + 1e-15), 'eigs(K, 3): the three smallest of the 5000-dof string (subspace iteration)');
    // non-symmetric: convection–diffusion tridiag(−1.5, 2, −0.5), n = 4000 → BiCGSTAB + ILU(0) vs residual
    const I2 = [], J2 = [], V2 = []; for (let i = 0; i < 4000; i++) { I2.push(i + 1); J2.push(i + 1); V2.push(2.2); if (i) { I2.push(i + 1); J2.push(i); V2.push(-1.5); } if (i < 3999) { I2.push(i + 1); J2.push(i + 2); V2.push(-0.5); } }
    const N = B('sparse')([col(I2), col(J2), col(V2)]), b = col(new Float64Array(4000).fill(1));
    const [xb, ib] = B('bicgstab')([N, b, st({ tol: 1e-10 })], 2), r = B('csrmul')([N, xb]);
    ok(ib.fields.converged && maxAbs(r.data, b.data) < 1e-8, `bicgstab + ilu0 on a non-symmetric 4000×4000 system (${ib.fields.iterations} iterations), residual < 1e-8`);
    const xd = RT.methodFor('mldivide', [N])([N, b], { check() {} }); ok(maxAbs(B('csrmul')([N, xd]).data, b.data) < 1e-8, 'N\\b (non-symmetric sparse) through the operator method');
  }
  { // eigs small dense path: generalized vs eig
    const K = B('sparse')([A]), Mm = B('sparse')([M([[2, 0, 0], [0, 3, 0], [0, 0, 4]])]);
    const d1 = B('eigs')([K, Mm, 2]).data, d2 = B('eig')([A, M([[2, 0, 0], [0, 3, 0], [0, 0, 4]])]).data;
    ok(maxAbs(d1, d2.slice(0, 2)) < 1e-13, 'eigs(K, M, 2) = the two smallest of eig(K, M)');
  }

  }
  if (parts.includes('mesh')) {
  section('CraftScript B: meshes and element kernels');
  { const v = B('voxelize')([box, 2.5]), info = B('meshInfo')([v]).fields; ok(info.kind === 'voxel' && info.nx === 40 && info.ny === 4 && info.nz === 4 && info.elements === 640, 'voxelize 100×10×10 at h 2.5 → 40×4×4 = 640 cubes'); }
  { const v = B('voxelize')([B('meshCylinder')([10, 20, 96]), 0.5]), V = v.elems.length / 8 * 0.125, ex = Math.PI * 100 * 20; ok(Math.abs(V - ex) / ex < 0.01, `voxelized cylinder volume ${V.toFixed(0)} vs πr²h ${ex.toFixed(0)} (≤ 1 %)`); }
  { const Ke = B('hexKe')([200000, 0.3, 2]), rig = new Float64Array(24); for (let a = 0; a < 8; a++) rig[3 * a + 1] = 1; // translation in y
    const f = mm(Ke, col(rig)); ok(maxAbs(f.data, new Float64Array(24)) < 1e-9 && maxAbs(Ke.data, tr(Ke).data) === 0, 'hexKe: symmetric, a rigid translation gives no force');
    const S = B('hexStressOp')([200000, 0.3, 2]), u = new Float64Array(24), X = [0, 1, 1, 0, 0, 1, 1, 0]; for (let a = 0; a < 8; a++) u[3 * a] = 1e-3 * X[a] * 2; // εxx = 1e-3
    const s = mm(S, col(u)), Ee = 200000, nu = 0.3, lam = Ee * nu / ((1 + nu) * (1 - 2 * nu)), mu = Ee / (2 * (1 + nu));
    ok(near(s.data[48], (lam + 2 * mu) * 1e-3, 1e-6) && near(s.data[49], lam * 1e-3, 1e-6), 'hexStressOp: uniaxial strain 1e-3 → σxx = (λ + 2μ)ε, σyy = λε at the centre');
  }
  { const Kt = B('hexKt')([2, 1]).data; ok(Math.abs(Kt.slice(0, 8).reduce((a, b) => a + b)) < 1e-12 && Kt[0] > 0, 'hexKt rows sum to zero (constant temperature: no flux), positive diagonal'); }
  ok(near(B('hexCt')([3, 2]).data.reduce((a, b) => a + b), 24, 1e-12) && near(B('hexCt')([3, 2, true]).data.reduce((a, b) => a + b), 24, 1e-12), 'hexCt consistent and lumped sum to ρc·h³ = 24');
  let tm = null;
  try { tm = B('tetmesh')([box, 5, st({ order: 2 })]); } catch (e) { ok(false, 'tetmesh: ' + e.message); }
  if (tm) {
    ok(tm.kind === 'tet10' && tm.elems.length % 10 === 0 && tm.quality.minDihedral > 10, `tetmesh order 2: ${tm.elems.length / 10} T10 elements, min dihedral ${tm.quality.minDihedral.toFixed(1)}°`);
    const Mv = B('assemble')([B('edofs')([tm]), B('t10MeAll')([tm, 1])]); let s = 0; for (const x of Mv.val) s += x;
    ok(near(s / 3, 10000, 1e-6), 'Σ consistent T10 mass (ρ = 1) / 3 = box volume 10000');
    const X = new Float64Array(30); for (let a = 0; a < 10; a++) for (let i = 0; i < 3; i++) X[a + 10 * i] = tm.nodes[3 * tm.elems[a] + i];
    const Ke = B('t10Ke')([LA.mat(10, 3, X), 1000, 0.25]), r = new Float64Array(30); for (let a = 0; a < 10; a++) { r[3 * a] = -X[a + 10]; r[3 * a + 1] = X[a]; } // rotation about z
    ok(maxAbs(mm(Ke, col(r)).data, new Float64Array(30)) < 1e-8 * Ke.data.reduce((m, x) => Math.max(m, Math.abs(x)), 0), 't10Ke: a rigid rotation gives no force');
    const surf = B('meshSurface')([tm]); const edges = new Map(); for (let t = 0; t < surf.elems.length; t += 3) for (let k = 0; k < 3; k++) { const a = surf.elems[t + k], b = surf.elems[t + (k + 1) % 3], key = Math.min(a, b) + ',' + Math.max(a, b); edges.set(key, (edges.get(key) || 0) + 1); }
    ok([...edges.values()].every((c) => c === 2), 'meshSurface of the tet mesh is closed (every edge in two triangles)');
  }
  { // cantilever 100 × 10 × 10, tip load P = −100 N, E = 200 GPa: Euler–Bernoulli PL³/3EI = −0.2 mm (+ Timoshenko shear −0.00156)
    const v = B('voxelize')([box, 10 / 3]), X = v.nodes, nn = X.length / 3, fixed = [], F = new Float64Array(3 * nn), tip = [];
    for (let n = 0; n < nn; n++) { if (X[3 * n] < 1e-9) fixed.push(3 * n + 1, 3 * n + 2, 3 * n + 3); if (Math.abs(X[3 * n] - 100) < 1e-9) tip.push(n); }
    for (const n of tip) F[3 * n + 2] = -100 / tip.length;
    const [u, info] = B('voxelSolve')([v, 200000, 0.3, col(fixed), col(F)], 2);
    let w = 0; for (const n of tip) w += u.data[3 * n + 2] / tip.length;
    ok(info.fields.converged && Math.abs(w + 0.2) / 0.2 < 0.03, `voxelSolve cantilever tip ${w.toFixed(4)} mm vs Euler–Bernoulli −0.2000 (≤ 3 %), ${info.fields.dofs} dofs, ${info.fields.iterations} multigrid PCG iterations`);
    const K = B('assemble')([B('edofs')([v]), B('hexKe')([200000, 0.3, 10 / 3])]);
    const isFixed = new Uint8Array(3 * nn); for (const d of fixed) isFixed[d - 1] = 1;
    const used = new Uint8Array(nn); for (const q of v.elems) used[q] = 1;
    const free = []; for (let d = 0; d < 3 * nn; d++) if (!isFixed[d] && used[Math.floor(d / 3)]) free.push(d + 1);
    const Kf = B('spindex')([K, col(free)]), xf = B('linsolve')([Kf, col(free.map((d) => F[d - 1]))]);
    const uu = new Float64Array(3 * nn); free.forEach((d, i) => { uu[d - 1] = xf.data[i]; });
    ok(maxAbs(uu, u.data) < 1e-6 * 0.2, 'assembled K (assemble + hexKe) solved directly = voxelSolve (matrix-free) to 1e-6');
    const vm = B('voxelStress')([v, u, 200000, 0.3]); const root = Math.max(...Array.from(vm.data).slice(0, 9));
    ok(vm.data.length === v.elems.length / 8 && root > 30 && root < 70, `voxelStress: root von Mises ${root.toFixed(1)} MPa (beam My/I at the root 60 MPa, element centres below the surface)`);
  }
  { // Poiseuille: periodic channel, walls (halfway bounce-back) at j = 0 and 21, body force Fx: u(y) = F y (H − y) / 2ν, H = 20
    const nx = 4, ny = 22, kind = new Float64Array(nx * ny); for (let i = 0; i < nx; i++) { kind[i] = -1; kind[i + nx * (ny - 1)] = -1; }
    const tau = 0.9, Fx = 1e-6, nuL = (tau - 0.5) / 3, H = ny - 2, umax = Fx * H * H / (8 * nuL);
    let S = B('lbmInit')([st({ kind: T([nx, ny], kind), tau, force: T([1, 3], [Fx, 0, 0]), periodic: T([1, 3], [1, 0, 1]) })]);
    const [S2, info] = B('lbmRun')([S, st({ tol: 1e-10, maxSteps: 50000 })], 2);
    const fld = B('lbmField')([S2]).fields; let e = 0;
    for (let j = 1; j < ny - 1; j++) { const y = j - 0.5; e = Math.max(e, Math.abs(fld.ux.data[1 + nx * j] - Fx / (2 * nuL) * y * (H - y)) / umax); }
    ok(info.fields.converged && e < 0.02, `lbm (flow.js D3Q19): Poiseuille profile within ${(e * 100).toExponential(1)} % of analytic (≤ 2 %) after ${S2.fields.step} steps`);
    ok(B('lbmFree')([S2]) === true && (() => { try { B('lbmStep')([S2]); return false; } catch (er) { return /freed/.test(er.message); } })(), 'lbmFree drops the state');
  }
  { const q = B('quadGrid')([2, 1, 4, 2]), e = B('edofs')([q, 2]); ok(q.elems.length === 32 && e.shape.join() === '8,8' && e.data[0] === 1 && e.data[8] === 2, 'quadGrid 4×2 + edofs (2 dofs per node)'); }

  }
  if (parts.includes('io')) {
  section('CraftScript B: files (load / save)');
  fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true });
  IO.setIoHost(IO.nodeFs(TMP));
  const save = B('save'), load = B('load');
  { save(['box.stl', box]); const m = load(['box.stl']); ok(m.t === 'model' && m.mesh.nodes.length === 24 && m.mesh.elems.length === 36 && fs.statSync(path.join(TMP, 'box.stl')).size === 84 + 50 * 12, 'STL binary round trip: 8 vertices welded, 12 triangles'); }
  { fs.writeFileSync(path.join(TMP, 'a.stl'), 'solid t\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid t\n'); const m = load(['a.stl']); ok(m.mesh.elems.length === 3, 'ASCII STL'); }
  { save(['box.obj', box]); const m = load(['box.obj']); ok(m.mesh.elems.length === 36 && maxAbs(m.mesh.nodes, box.nodes) === 0, 'OBJ round trip'); }
  { const D = LA.mat(2, 3, Float64Array.of(1, 4, 2, 5, 3, NaN)); save(['d.csv', D, st({ headers: { t: 'cell', items: ['x', 'y', '=z'] } })]); const [d, hdr] = load(['d.csv'], 2); ok(d.shape.join() === '2,3' && Number.isNaN(d.data[5]) && d.data[3] === 5 && hdr.items[2] === "'=z", 'CSV round trip with headers (formula-looking header escaped), NaN kept'); }
  const S = B('sparse')([col([1, 2, 3]), col([1, 3, 2]), col([5, 6, 7]), 3, 3]);
  const T3 = T([2, 3, 4], Float64Array.from({ length: 24 }, (_, i) => i));
  const bag = st({ A, T3, S, name: 'hello', flag: true, k: 3.5, c: { t: 'cell', shape: [1, 3], items: [1, 'two', T([1, 2], [3, 4])] }, mesh: box, inner: st({ x: 2 }) });
  { save(['t.npy', T3]); const t = load(['t.npy']); ok(t.shape.join() === '2,3,4' && t.data.every((x, i) => x === i), 'NPY round trip (2×3×4, Fortran order)'); }
  { save(['bag.json', bag]); const j = load(['bag.json']).fields; ok(maxAbs(j.A.data, A.data) === 0 && j.S.t === 'sparse' && Array.from(j.S.val).join() === '5,6,7' && j.c.items[1] === 'two' && j.mesh.kind === 'tri' && j.inner.fields.x === 2, 'JSON round trip: tensor, sparse, cell, mesh, nested struct'); }
  { fs.writeFileSync(path.join(TMP, 'plain.json'), JSON.stringify({ a: [1, 2, 3], m: [[1, 2], [3, 4]], s: 'x', 'bad key': null })); const j = load(['plain.json']).fields; ok(j.a.shape.join() === '1,3' && j.m.data.join() === '1,3,2,4' && j.s === 'x' && Number.isNaN(j.xbad_key), 'plain JSON: vectors, matrices (rows), strings, odd keys made valid, null → NaN'); }
  await IO.prepareIo("save('x.h5', w)");
  { save(['bag.h5', bag]); const f = load(['bag.h5']).fields;
    ok(maxAbs(f.A.data, A.data) === 0 && f.T3.shape.join() === '2,3,4' && f.T3.data.every((x, i) => x === i), 'HDF5 round trip: matrices and a 3-D tensor (C order inside)');
    ok(f.S.t === 'sparse' && Array.from(f.S.col).join() === '0,2,1' && f.name === 'hello' && f.flag === true && f.k === 3.5, 'HDF5: sparse (h5sparse CSR group), string, bool, scalar');
    ok(f.c.t === 'cell' && f.c.items[2].data[1] === 4 && f.mesh.kind === 'tri' && f.mesh.elems.length === 36 && f.inner.fields.x === 2, 'HDF5: cell, mesh, nested struct');
    ok(load(['bag.h5', st({ dataset: '/T3' })]).shape.join() === '2,3,4', 'HDF5: one dataset by path');
  }
  ok((() => { try { load(['nothere.h5']); return false; } catch (e) { return /no file called/.test(e.message); } })(), 'a missing file is named in the error');
  { fs.writeFileSync(path.join(TMP, 'junk.h5'), 'not hdf5'); ok((() => { try { load(['junk.h5']); return false; } catch (e) { return /not an HDF5 file/.test(e.message); } })(), 'a damaged HDF5 file is refused with a plain message'); }
  { fs.writeFileSync(path.join(TMP, 'junk.stl'), Buffer.alloc(200, 7)); ok((() => { try { load(['junk.stl']); return false; } catch (e) { return /not an STL/.test(e.message); } })(), 'a damaged STL is refused'); }
  { fs.writeFileSync(path.join(TMP, 'short.npy'), Buffer.concat([Buffer.from([0x93]), Buffer.from('NUMPY'), Buffer.from([1, 0, 70, 0]), Buffer.from("{'descr': '<f8', 'fortran_order': False, 'shape': (100,), }".padEnd(69) + '\n')])); ok((() => { try { load(['short.npy']); return false; } catch (e) { return /shorter than the shape/.test(e.message); } })(), 'an NPY shorter than its shape is refused'); }
  { // a second reader: h5py / numpy when a venv with them exists
    const py = [path.join(HERE, 'venv/bin/python'), process.env.CS_H5PY_PYTHON].filter(Boolean).find((p) => fs.existsSync(p) && spawnSync(p, ['-c', 'import h5py, numpy'], { encoding: 'utf8' }).status === 0);
    if (!py) skip('h5py/numpy second reader (set CS_H5PY_PYTHON to a python with h5py + numpy)');
    else {
      const r = spawnSync(py, ['-I', '-c', `import h5py, numpy as np, sys
f = h5py.File(sys.argv[1], 'r'); a = f['A'][()]; t = f['T3'][()]
print(a[0, 2], a[2, 1], t.shape, t[1, 2, 3], dict(f['S'].attrs)['h5sparse_format'], f['S/indptr'][()].tolist(), np.load(sys.argv[2])[1, 2, 3])
g = h5py.File(sys.argv[3], 'w'); g['M'] = np.arange(6.).reshape(2, 3); g['i'] = np.arange(4, dtype=np.int64); g['txt'] = 'abc'; g.close()`, path.join(TMP, 'bag.h5'), path.join(TMP, 't.npy'), path.join(TMP, 'py.h5')], { encoding: 'utf8' });
      ok(r.status === 0 && r.stdout.trim() === '2.0 3.0 (2, 3, 4) 23.0 csr [0, 1, 2, 3] 23.0', `h5py/numpy read our files with the script's indices: ${r.stdout.trim() || r.stderr.trim().split('\n').pop()}`);
      const p = load(['py.h5']).fields; ok(p.M.shape.join() === '2,3' && p.M.data.join() === '0,3,1,4,2,5' && p.i.data.join() === '0,1,2,3' && p.txt === 'abc', 'an h5py file reads with NumPy\'s shape and indices');
    }
  }

  }
  if (parts.includes('lua')) {
  section('CraftScript B: Lua adapter');
  const lines = [];
  const rt = RT.createRuntime({ onPrint: (t) => lines.push(t), budget: 2e7 });
  const run = async (src, lang) => { lines.length = 0; return rt.run(src, { lang }); };
  { const r = await run('x = 1 + 2; s = "a" .. "b"; t = cs.tensor({{1, 2}, {3, 4}}); print(#t, t(2, 1), t[4])', 'lua'); ok(r.ok && rt.ws.get('x') === 3 && rt.ws.get('s') === 'ab' && rt.ws.get('t').t === 'tensor' && lines[0] === '4\t3\t4\n', 'globals land in the workspace; #t, t(i, j), t[k]'); }
  { const r = await run('local V, D = cs.call("eig", 2, cs.tensor({{2, 0}, {0, 3}})); d = D(2, 2); v = V:shape()[1]; y = t * t - t:T(); z = t:times(t)', 'lua');
    ok(r.ok && rt.ws.get('d') === 3 && rt.ws.get('v') === 2 && Array.from(rt.ws.get('y').data).join() === '6,13,7,18' && Array.from(rt.ws.get('z').data).join() === '1,9,4,16', 'cs.call with 2 outputs; * is the matrix product, :times elementwise, :T()'); }
  { const r = await run('t:set(1, 1, 100); u = t(1, 1); w = ws.x * 10', 'lua'); ok(r.ok && rt.ws.get('u') === 100 && rt.ws.get('w') === 30, 't:set and ws.name reads'); }
  { const r = await run('local n = 0; for i = 1, 10 do n = n + i end; ws.total = n', 'lua'); ok(r.ok && rt.ws.get('total') === 55 && rt.ws.get('n') === undefined, 'ws.name = v writes; locals stay local'); }
  { const r = await run('while true do end', 'lua'); ok(!r.ok && r.error.stopped && /budget/.test(r.error.message), 'an endless loop stops at the budget (count hook)'); }
  { const r = await run('ok, e = pcall(function() while true do end end); print("escaped")', 'lua'); ok(!r.ok && r.error.stopped && !lines.includes('escaped'), 'pcall cannot swallow the budget stop'); }
  { const r = await run('local a = 1\nlocal b = 2\nerror("boom")', 'lua'); ok(!r.ok && r.error.line === 3 && r.error.message === 'boom', 'a Lua error carries its line'); }
  { const r = await run('x = = 1', 'lua'); ok(!r.ok && r.error.line === 1 && /unexpected symbol/.test(r.error.message), 'a syntax error carries its line'); }
  { const r = await run('cs.nosuch(1)', 'lua'); ok(!r.ok && /no function called "nosuch"/.test(r.error.message), 'an unknown builtin says so'); }
  { const r = await run('a = io == nil and os.execute == nil and require == nil and debug == nil and dofile == nil and type(os.clock()) == "number"', 'lua'); ok(r.ok && rt.ws.get('a') === true, 'sandbox: no io, os.execute, require, debug, dofile; os.clock kept'); }
  { const r = await run('K = cs.sparse(cs.tensor({1, 2, 2}), cs.tensor({1, 2, 1}), cs.tensor({4, 5, 1}), 2, 2); k21 = K(2, 1); f = K * cs.tensor({{1}, {1}}); tp = K:T():type()', 'lua'); ok(r.ok && rt.ws.get('k21') === 1 && Array.from(rt.ws.get('f').data).join() === '4,6' && rt.ws.get('tp') === 'sparse', 'sparse userdata: S(i, j), S * x, S:T()'); }
  if (RT.languageList().some((l) => l.id === 'craft')) {
    // parity: the same small programs in both languages give the same values
    const pairs = [
      ['s = 0; for i = 1:100, s = s + i*i; end', 's = 0; for i = 1, 100 do s = s + i * i end', 's', 338350],
      ['A = [4 1; 1 3]; x = linsolve(A, [1; 2]); r = x(2);', 'A = cs.tensor({{4, 1}, {1, 3}}); x = cs.linsolve(A, cs.tensor({{1}, {2}})); r = x(2)', 'r', 7 / 11],
      ['K = sparse([1 1 2 2 3 3], [1 2 1 2 2 3], [2 -1 -1 2 -1 2]); u = K \\ [1; 1; 1]; r = u(3);', 'K = cs.sparse(cs.tensor({1, 1, 2, 2, 3, 3}), cs.tensor({1, 2, 1, 2, 2, 3}), cs.tensor({2, -1, -1, 2, -1, 2})); u = cs.linsolve(K, cs.tensor({{1}, {1}, {1}})); r = u(3)', 'r', null],
      ['M = [2 1; 1 2]; d = eig(M); r = d(2) - d(1);', 'local d = cs.eig(cs.tensor({{2, 1}, {1, 2}})); r = d(2) - d(1)', 'r', 2],
      ['v = voxelize(meshBox(10, 10, 10), 2.5); s = meshInfo(v); r = s.elements;', 'local v = cs.voxelize(cs.meshBox(10, 10, 10), 2.5); r = cs.meshInfo(v).elements', 'r', 64],
    ];
    for (const [craft, lua, name, expect] of pairs) {
      const a = await run(craft, 'craft'), va = rt.ws.get(name);
      const b = await run(lua, 'lua'), vb = rt.ws.get(name);
      const num = (v) => (typeof v === 'number' ? v : v && v.t === 'tensor' && v.data.length === 1 ? v.data[0] : NaN);
      ok(a.ok && b.ok && Math.abs(num(va) - num(vb)) < 1e-12 * Math.max(1, Math.abs(num(va))) && (expect === null || Math.abs(num(va) - expect) < 1e-12), `parity CraftScript = Lua: ${name} = ${num(va)}${a.ok ? '' : ' (craft: ' + a.error.message + ')'}${b.ok ? '' : ' (lua: ' + b.error.message + ')'}`);
    }
    { await run('handoff = [1 2 3] * 2;', 'craft'); const r = await run('back = handoff[3] + 1', 'lua'); ok(r.ok && rt.ws.get('back') === 7, 'a CraftScript result is a Lua global in the next run'); }
    // 0.4 P8: Lua calls the analysis library (craftlib/) and the part's own CraftScript functions
    {
      const fs = await import('node:fs');
      const LIB = DEV + 'craftlib/', names = new Set(JSON.parse(fs.readFileSync(LIB + 'index.json', 'utf8')).groups.flatMap((g) => g.items.map((i) => i.name)));
      const own = { twice: 'function y = twice(x)\n  y = 2 * x;\nend\n', broken: 'function y = broken(x)\n  y = x(5);\nend\n' };
      const library = async (name) => (own[name] ? { source: own[name], file: name + '.craft' } : names.has(name) ? { source: fs.readFileSync(LIB + name + '.craft', 'utf8'), file: name + '.craft' } : null);
      const out = [];
      const rt2 = RT.createRuntime({ onPrint: (t) => out.push(t), budget: 2e9, library });
      const go = (src, lang) => rt2.run(src, { lang, file: lang === 'lua' ? 'l.lua' : 'c.craft' });
      const a = await go("t = box_mesh(100, 10, 10, 5, 'tet10'); bc = struct(); bc.fixedFaces = 5; bc.loads = {struct('face', 6, 'force', [0 -100 0])}; r = static_tet(t, 200000, 0.3, bc); dc = r.maxDisp; [nn, tt] = face_nodes(t, 6); nc = numel(nn);", 'craft');
      const b = await go("local t = cs.box_mesh(100, 10, 10, 5, 'tet10')\nlocal bc = cs.struct({ fixedFaces = 5, loads = { cs.struct({ face = 6, force = cs.tensor({ 0, -100, 0 }) }) } })\nlocal r = cs.static_tet(t, 200000, 0.3, bc)\ndl = r.maxDisp\nlocal nodes, tris = cs.call('face_nodes', 2, t, 6)\nnl = #nodes\ntw = cs.twice(21)", 'lua');
      const dc = rt2.ws.get('dc'), dl = rt2.ws.get('dl');
      ok(a.ok && b.ok && typeof dl === 'number' && Math.abs(dl / dc - 1) < 1e-12 && dl > 0.19 && dl < 0.21, `Lua calls the library: cs.static_tet on cs.box_mesh gives CraftScript's max displacement ${typeof dc === 'number' ? dc.toPrecision(12) : dc} (Lua ${typeof dl === 'number' ? dl.toPrecision(12) : dl})${a.ok ? '' : ' craft: ' + a.error.message}${b.ok ? '' : ' lua: ' + b.error.message}`);
      ok(b.ok && rt2.ws.get('nl') === rt2.ws.get('nc') && rt2.ws.get('nl') > 0, `cs.call('face_nodes', 2, …): both outputs of a library function, the same ${rt2.ws.get('nl')} nodes as CraftScript's [nodes, tris] = …`);
      ok(b.ok && rt2.ws.get('tw') === 42, "a CraftScript function the part's scripts define (twice) is reached from Lua too");
      const e1 = await go('local a = 1\nlocal y = cs.broken(2)', 'lua');
      ok(!e1.ok && e1.error.line === 2 && /broken/.test(e1.error.message) && /broken\.craft line 2/.test(e1.error.message), `an error inside a library function names it, its file and line, at the Lua line that called it: line ${e1.error.line}, "${e1.error.message}"`);
      const e2 = await go('local a = 1\nlocal c = cs.inv(cs.tensor({{1, 2, 3}}))', 'lua');
      ok(!e2.ok && e2.error.line === 2 && /square/.test(e2.error.message), `a builtin's error in Lua now carries the line of the call (${e2.error.line})`);
      const e3 = await go('local n = "twice"\ny = cs[n](2)', 'lua');
      ok(!e3.ok && /no function called "twice"/.test(e3.error.message), 'a name built at run time is not looked up in the library (found before the run: write cs.twice( literally) — said plainly');
    }
  } else skip('Lua/CraftScript parity (cs-lang-craft.js not here)');
  }

  if (perf && parts.includes('mesh')) {
    section('CraftScript B: performance (voxel cantilever ~116k dofs)');
    const v = B('voxelize')([box, 10 / 15]), X = v.nodes, nn = X.length / 3, fixed = [], F = new Float64Array(3 * nn), tip = [];
    for (let n = 0; n < nn; n++) { if (X[3 * n] < 1e-9) fixed.push(3 * n + 1, 3 * n + 2, 3 * n + 3); if (Math.abs(X[3 * n] - 100) < 1e-9) tip.push(n); }
    for (const n of tip) F[3 * n + 2] = -100 / tip.length;
    let t0 = Date.now(); const [u, info] = B('voxelSolve')([v, 200000, 0.3, col(fixed), col(F)], 2); const tv = Date.now() - t0;
    let w = 0; for (const n of tip) w += u.data[3 * n + 2] / tip.length;
    ok(info.fields.converged, `voxelSolve: ${info.fields.dofs} dofs in ${tv} ms (${info.fields.iterations} iterations), tip ${w.toFixed(5)}`);
    t0 = Date.now(); const K = B('assemble')([B('edofs')([v]), B('hexKe')([200000, 0.3, 10 / 15])]); const ta = Date.now() - t0;
    const isFixed = new Uint8Array(3 * nn); for (const d of fixed) isFixed[d - 1] = 1;
    const free = []; for (let d = 0; d < 3 * nn; d++) if (!isFixed[d]) free.push(d + 1);
    const Kf = B('spindex')([K, col(free)]), ff = col(free.map((d) => F[d - 1]));
    for (const prec of ['amg', 'ic0']) { t0 = Date.now(); const [, inf] = B('pcg')([Kf, ff, st({ prec, dofsPerNode: 3, tol: 1e-8 })], 2); ok(inf.fields.converged, `assembled (${ta} ms, ${K.col.length} nonzeros) + pcg ${prec}: ${Date.now() - t0} ms, ${inf.fields.iterations} iterations`); }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runCraftscriptBTests({ ok, section, perf: process.argv.includes('--perf') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
