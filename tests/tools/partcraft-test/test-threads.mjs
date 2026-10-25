#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-threads.mjs — pool.js (solver threads on SharedArrayBuffer + Atomics; Node worker_threads here, Web Workers in the app):
 * the kernels against the one-thread code (bitwise where each output has one writer, 1e-12 where sums are regrouped), the threaded
 * voxel PCG + multigrid, the thermal CSR solve and a transient thermal-stress history against one thread, the size threshold, the
 * one-thread fallback, and timings with the speed-up (logged, not asserted: the box is shared).
 *   node tools/partcraft-test/test-threads.mjs [--verbose] [--threads N]     (or runThreadTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runThreadTests({ ok, section, log = (m) => console.log('  note ' + m), threads = 0 }) {
  const PL = await import(DEV + 'pool.js');
  const FE = await import(DEV + 'fea.js');
  const TH = await import(DEV + 'thermal.js');
  const T = threads || Math.max(2, Math.min(4, os.cpus().length - 1));
  const now = () => performance.now();
  const box = (nx, ny, nz) => { const g = { h: 1, nx, ny, nz, origin: [0, 0, 0] }; g.solid = new Uint8Array(nx * ny * nz).fill(1); g.count = g.solid.length; return g; };
  /** A box cantilever: fixed at x = 0, a downward pull on x = nx. */
  const cantilever = (nx, ny, nz) => {
    const g = box(nx, ny, nz), model = FE.makeModel(g, { E: 200000, nu: 0.3 });
    const NX = nx + 1, NY = ny + 1, nd = (i, j, k) => i + NX * (j + NY * k), fixed = [];
    for (let k = 0; k <= nz; k++) for (let j = 0; j <= ny; j++) fixed.push([nd(0, j, k), [[1, 0, 0], [0, 1, 0], [0, 0, 1]]]);
    const cons = FE.makeConstraints(fixed), f = new Float64Array(3 * model.nn);
    for (let k = 0; k <= nz; k++) for (let j = 0; j <= ny; j++) f[3 * nd(nx, j, k) + 1] = -1;
    return { g, model, cons, f };
  };
  const relDiff = (a, b) => { let d = 0, m = 0; for (let i = 0; i < a.length; i++) { d = Math.max(d, Math.abs(a[i] - b[i])); m = Math.max(m, Math.abs(b[i])); } return d / (m || 1); };
  const same = (a, b) => { if (a.length !== b.length) return false; for (let i = 0; i < a.length; i++) if (a[i] !== b[i] && !(Number.isNaN(a[i]) && Number.isNaN(b[i]))) return false; return true; };

  section('threads: the pool (pool.js) and its fallback');
  {
    const one = await PL.ensurePool(1);
    ok(PL.getPool() === null && one.threads === 1 && PL.threadWords({ ...one, used: 1 }) === '1 thread (chosen in Settings)' && PL.threadWords({ threads: 1, isolated: false, requested: 4, used: 1 }) === '1 thread (page not isolated)', 'one thread chosen: no pool, solvers run their own one-thread code; the words for "1 thread (chosen in Settings)" and "1 thread (page not isolated)"');
    const t0 = now(), info = await PL.ensurePool(T), startMs = now() - t0;
    ok(info.threads === T && PL.getPool() && PL.getPool().n === T && PL.threadWords({ ...info, used: T }) === `${T} threads` && PL.threadWords({ ...info, used: 1 }) === '1 thread (below the size worth threading)', `a pool of ${T} threads (the coordinator + ${T - 1} helpers) starts in ${startMs.toFixed(0)} ms; "${T} threads" / "1 thread (below the size worth threading)"`);
    ok(PL.AUTO_THREADS() >= 1 && PL.AUTO_THREADS() <= PL.MAX_THREADS, `automatic = logical processors − 1, capped at ${PL.MAX_THREADS} (here ${PL.AUTO_THREADS()})`);
  }
  const P = PL.getPool();

  section('threads: kernels against one thread');
  {
    const { model } = cantilever(40, 12, 12), n = 3 * model.nn;
    const x = P.f64(n), y = P.f64(n), y0 = new Float64Array(n);
    for (let i = 0; i < n; i++) x[i] = Math.sin(0.37 * i) + 0.01 * (i % 7);
    FE.applyK(model, x, y0); PL.hexOperator(P, model)(x, y);
    const scale = Float64Array.from(model.elems, (_, m) => 0.2 + (m % 5) / 5), ys = new Float64Array(n);
    FE.applyK(model, x, ys, scale); const yp = P.f64(n); PL.hexOperator(P, model, { scale })(x, yp);
    ok(same(y, y0) && same(yp, ys), `voxel K·x (${model.elems.length} cubes, ${n} unknowns), gathered per node on ${T} threads = fea.js applyK bitwise, plain and with per-element (SIMP) factors`);
    let d0 = 0; for (let i = 0; i < n; i++) d0 += x[i] * y0[i];
    const d1 = P.dot(x, y), d2 = P.dot(x, y);
    ok(Math.abs(d1 - d0) <= 1e-12 * Math.abs(d0) && d1 === d2, `dot product in fixed 4096-entry chunks: ${Math.abs(d1 / d0 - 1).toExponential(1)} from the serial sum (regrouped), and the same every time`);
    // the multigrid V-cycle: built and applied with and without the pool on the same model and residual
    const { model: m2, cons } = cantilever(48, 16, 16), n2 = 3 * m2.nn;
    const mgS = PL.withoutPool(() => FE.preconditioner(m2, cons).mg), mgP = FE.preconditioner(m2, cons).mg;
    const r = P.f64(n2); for (let i = 0; i < n2; i++) r[i] = Math.cos(0.11 * i) * (m2.active[(i / 3) | 0] ? 1 : 0);
    const zS = new Float64Array(n2), zP = P.f64(n2);
    PL.withoutPool(() => mgS.apply(Float64Array.from(r), zS)); mgP.apply(r, zP);
    ok(mgP.threads === T && !mgS.threads && same(zP, zS), `multigrid V-cycle (${mgP.levels.length} levels, smoother, restriction, prolongation on the pool; coarsest Cholesky on one thread) = the one-thread V-cycle bitwise`);
    const z2 = new Float64Array(n2); mgP.apply(Float64Array.from(r), z2);
    ok(same(z2, zS), 'and with plain (unshared) arrays handed in: copied through, the same bits');
    // Kσ·x from per-element blocks gathered per node = buckling.js geometricOperator's scatter (bitwise)
    const BK = await import(DEV + 'buckling.js'), vm = TH.voxelMesh(model.grid, { type: 'h8i' });
    const sig = new Float64Array(vm.ne * 48); for (let i = 0; i < sig.length; i++) sig[i] = Math.sin(0.7 * i) * 10;
    const g0 = new Float64Array(n), g1 = P.f64(n);
    BK.geometricOperator(vm, sig, -1)(x, g0); PL.blockOperator(P, vm, BK.elementBlocks(vm, sig), -1)(x, g1);
    ok(same(g1, g0), 'geometric stiffness Kσ·x (per-element blocks, gathered per node) = buckling.js geometricOperator bitwise');
    const tA = now(); for (let k = 0; k < 2000; k++) P.dot(x, x, 1000); const lat = (now() - tA) / 2000 * 1000;
    log(`kernel round trip on ${T} threads (a 1000-entry dot product): ${lat.toFixed(1)} µs`);
  }

  section('threads: solves against one thread, and the speed-up');
  const rows = [];
  {
    const sizes = [[24, 8, 8], [48, 12, 12], [80, 20, 20]];
    for (const [nx, ny, nz] of sizes) {
      const c = cantilever(nx, ny, nz), n = 3 * c.model.nn;
      const solve = () => { const t0 = now(); const pre = FE.preconditioner(c.model, c.cons); const t1 = now(); const s = FE.pcg(c.model, c.cons, c.f, { tol: 1e-8, ...pre }); return { s, setup: t1 - t0, ms: now() - t1 }; };
      const s1 = PL.withoutPool(solve); PL.withoutPool(solve);
      const s1b = PL.withoutPool(solve);
      PL.setMinParallel(1);   // force the pool even on the small model, to measure its overhead
      const sp = solve(), spb = solve();
      PL.setMinParallel(0);
      const e = relDiff(sp.s.u, s1.s.u), t1 = Math.min(s1.ms, s1b.ms), tp = Math.min(sp.ms, spb.ms);
      rows.push([`${c.model.elems.length} cubes, ${n} unknowns`, `${t1.toFixed(0)} ms (${s1.s.iterations} it)`, `${tp.toFixed(0)} ms (${sp.s.iterations} it)`, `×${(t1 / tp).toFixed(2)}`, e.toExponential(1)]);
      ok(e < 1e-10 && Math.abs(sp.s.iterations - s1.s.iterations) <= 1 && sp.s.threads === T, `voxel static (${c.model.elems.length} cubes): ${T} threads = one thread to ${e.toExponential(1)} (relative, max |Δu|), ${sp.s.iterations} vs ${s1.s.iterations} iterations`);
    }
    log(`voxel static solve, multigrid PCG to 1e-8 (solve only, best of 2; this box also runs other jobs — load ${os.loadavg()[0].toFixed(1)} on ${os.cpus().length} logical processors):`);
    log('  model | 1 thread | ' + T + ' threads | speed-up | max |Δu| (relative)');
    for (const r of rows) log('  ' + r.join(' | '));
    // below the threshold a solve stays on one thread
    const small = cantilever(20, 6, 6), c0 = P.calls, rs = FE.pcg(small.model, small.cons, small.f, { tol: 1e-8, ...FE.preconditioner(small.model, small.cons) });
    ok(P.calls === c0 && !rs.threads && 3 * small.model.nn < PL.MIN_PARALLEL, `a model under ${PL.MIN_PARALLEL} unknowns (${3 * small.model.nn}) stays on one thread (no kernel ran)`);
  }

  section('threads: CSR products and PCG');
  {
    // pool.js csrPCG: threaded products and vector updates, the IC(0) preconditioner on one thread. thermal.js does NOT use it:
    // its assembly and IC(0) dominate (measured: ~6 % faster at 260k unknown temperatures on 4 threads), so heat stays one thread
    const nn = 60000, rp = new Int32Array(nn + 1), cols = [], vals = [];
    for (let i = 0; i < nn; i++) { for (const j of [i - 300, i - 1, i, i + 1, i + 300]) if (j >= 0 && j < nn) { cols.push(j); vals.push(j === i ? 4.2 : -1); } rp[i + 1] = cols.length; }
    const A = { n: nn, rowPtr: rp, cols: Int32Array.from(cols) }, Av = Float64Array.from(vals), bb = Float64Array.from({ length: nn }, (_, i) => Math.sin(i));
    const M0 = TH.ic0(A, Av);
    const t0 = now(), s1 = PL.withoutPool(() => TH.csrPcg(A, Av, bb, { tol: 1e-10, prec: M0 })), t1 = now(), s2 = PL.csrPCG(P, A, Av, bb, { tol: 1e-10 }, M0), t2 = now();
    ok(relDiff(s2.x, s1.x) < 1e-10 && Math.abs(s2.iterations - s1.iterations) <= 1, `CSR PCG (a 7-point-like matrix, ${nn} unknowns, IC(0)): ${T} threads = one thread to ${relDiff(s2.x, s1.x).toExponential(1)}; ${(t1 - t0).toFixed(0)} → ${(t2 - t1).toFixed(0)} ms`);
    const y1 = new Float64Array(nn), xs = P.share(bb), y2 = P.f64(nn);
    TH.csrMul(A, Av, bb, y1); PL.csrOperator(P, A, Av)(xs, y2);
    ok(same(y1, y2), 'CSR y = A x over a row partition balanced by nonzeros = thermal.js csrMul bitwise');
  }
  section('threads: buckling and a transient thermal-stress history (the solvers that call fea.js pcg)');
  {
    const BK = await import(DEV + 'buckling.js'), HI = await import(DEV + 'thermal-history.js');
    // an 80 × 10 × 10 box as a triangle mesh with one face id per side (x−, x+, y−, y+, z−, z+)
    const L = 80, W = 10, v = [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0], [0, 0, W], [L, 0, W], [L, W, W], [0, W, W]];
    const quads = [[0, 3, 7, 4], [1, 5, 6, 2], [0, 4, 5, 1], [3, 2, 6, 7], [0, 1, 2, 3], [4, 7, 6, 5]];
    const mesh = { positions: Float32Array.from(v.flat()), indices: Uint32Array.from(quads.flatMap(([a, b, c, d]) => [a, b, c, a, c, d])), triFace: Int32Array.from(quads.flatMap((_, i) => [i, i])) };
    const faces = [W * W, W * W, L * W, L * W, L * W, L * W].map((area) => ({ area }));
    const job = { mesh, faces, material: 'steel', h: 1, elem: 'h8i', bcs: { constraints: [{ type: 'fixed', faces: [0] }], loads: [{ type: 'force', faces: [1], total: 1, dir: [-1, 0, 0] }] }, modes: 1 };
    const t0 = now(), b1 = PL.withoutPool(() => BK.solveBuckling(job)), t1 = now(), bp = BK.solveBuckling(job), t2 = now();
    ok(Math.abs(bp.factors[0] / b1.factors[0] - 1) < 1e-9, `linear buckling, ${b1.summary.elements} cubes (${b1.summary.dofs} unknowns): load factor ${bp.factors[0].toPrecision(10)} on ${T} threads vs ${b1.factors[0].toPrecision(10)} on one; ${(t1 - t0).toFixed(0)} → ${(t2 - t1).toFixed(0)} ms (stiffness solves, K·x and Kσ·x threaded; the small Rayleigh–Ritz algebra on one thread)`);
    const hj = { ...job, bcs: { constraints: [{ type: 'fixed', faces: [0] }], loads: [] }, heat: [{ type: 'temperature', faces: [1], T: 200 }], transient: { T0: 20, t: 60, steps: 12, theta: 1 }, thermalLoad: { mode: 'transient', Tref: 20, at: 'worst', solves: 4 } };
    const t3 = now(), h1 = PL.withoutPool(() => HI.solveThermoHistory(hj)), t4 = now(), hp = HI.solveThermoHistory(hj), t5 = now();
    const dh = Math.max(...hp.history.maxVm.map((x, i) => Math.abs(x / h1.history.maxVm[i] - 1)));
    ok(dh < 1e-9 && hp.history.worst === h1.history.worst, `transient thermal-stress history (4 stress solves): peaks ${hp.history.maxVm.map((x) => x.toFixed(2)).join(', ')} MPa on ${T} threads = one thread to ${dh.toExponential(1)}; ${(t4 - t3).toFixed(0)} → ${(t5 - t4).toFixed(0)} ms (the heat run stays on one thread)`);
  }
  section('threads: quadratic tets stay on one thread (0.4 P4: threading them measured no real gain and was removed)');
  {
    const TF = await import(DEV + 'tetfea.js');
    const L = 60, W = 12, v = [[0, 0, 0], [L, 0, 0], [L, W, 0], [0, W, 0], [0, 0, W], [L, 0, W], [L, W, W], [0, W, W]];
    const quads = [[0, 3, 7, 4], [1, 5, 6, 2], [0, 4, 5, 1], [3, 2, 6, 7], [0, 1, 2, 3], [4, 7, 6, 5]];
    const mesh = { positions: Float32Array.from(v.flat()), indices: Uint32Array.from(quads.flatMap(([a, b, c, d]) => [a, b, c, a, c, d])), triFace: Int32Array.from(quads.flatMap((_, i) => [i, i])) };
    const nrm = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]], org = [[0, 0, 0], [L, 0, 0], [0, 0, 0], [0, W, 0], [0, 0, 0], [0, 0, W]];
    const faces = [W * W, W * W, L * W, L * W, L * W, L * W].map((area, i) => ({ area, type: 'plane', n: nrm[i], o: org[i] }));
    const job = { kind: 'static', mesh, faces, material: 'steel', h: 2, mesher: 'tet', bcs: { constraints: [{ type: 'fixed', faces: [0] }], loads: [{ type: 'force', faces: [1], total: 100, dir: [0, -1, 0] }] } };
    const calls0 = P.calls, s1 = TF.solveTetStudy(job), s0 = PL.withoutPool(() => TF.solveTetStudy(job));
    ok(P.calls === calls0 && !s1.threads && same(s1.u, s0.u) && s1.summary.dofs > 20000, `a ${s1.summary.dofs}-unknown tet solve with the pool up runs no pool kernel and gives the one-thread answer bitwise`);
    ok(!('setTetThreads' in PL) && !('sysPCG' in PL), 'pool.js no longer carries the tet threading (setTetThreads, sysPCG)');
  }
  section('threads: lattice Boltzmann (flow.js slabs on the pool, flow-par.js)');
  {
    const FL = await import(DEV + 'flow.js'), FP = await import(DEV + 'flow-par.js');
    const duct = (n, len) => {
      const nx = n + 2, ny = n + 2, nz = len + 2, kind = new Int32Array(nx * ny * nz);
      for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const e = i + nx * (j + ny * k); kind[e] = i === 0 || j === 0 || i === nx - 1 || j === ny - 1 ? -1 : k === 0 ? 1 : k === nz - 1 ? 2 : 0; }
      const lat = FL.buildLattice({ nx, ny, nz, kind, groups: [null, { type: 'velocity', u: [0, 0, 0.03] }, { type: 'pressure', rho: 1 }] });
      return FL.makeState(lat, { tau: 0.6 });
    };
    const A = duct(30, 60), B = duct(30, 60), steps = 200;
    const t0 = now(); for (let s = 0; s < steps; s++) FL.step(A); const t1 = now();
    const on = FP.threadFlow(B);
    const t2 = now(); for (let s = 0; s < steps; s++) FL.step(B); const t3 = now();
    let d = 0; for (let i = 0; i < A.src.length; i++) if (A.src[i] !== B.src[i]) d++;
    let du = 0; for (let n = 0; n < A.lat.nf; n++) if (A.ux[n] !== B.ux[n] || A.uz[n] !== B.uz[n] || A.rho[n] !== B.rho[n]) du++;
    const mcu = (nf, ms) => (nf * steps / ms / 1000).toFixed(1);
    ok(on && B.threads === T && d === 0 && du === 0 && A.step === B.step, `laminar duct (${A.lat.nf} fluid cells, ${steps} steps): ${T} threads give populations, velocities and densities bit-identical to one thread (0 of ${A.src.length} differ); ${(t1 - t0).toFixed(0)} → ${(t3 - t2).toFixed(0)} ms (${mcu(A.lat.nf, t1 - t0)} → ${mcu(A.lat.nf, t3 - t2)} M cell-updates/s)`);
    const r1 = FL.run(duct(30, 60), { maxSteps: 300, every: 100 }), C = duct(30, 60); FP.threadFlow(C); const r2 = FL.run(C, { maxSteps: 300, every: 100 });
    ok(r1.res === r2.res && r1.steps === r2.steps, `flow.js run() on the pool: the same residual history to the bit (${r2.res.toExponential(3)} after ${r2.steps} steps)`);
    const small = duct(6, 10);
    ok(!FP.threadFlow(small) && !small.par, `a lattice under ${PL.MIN_PARALLEL} fluid cells (${small.lat.nf}) stays on one thread`);
  }
  PL.closePool();   // the rest of the suite runs on one thread
  return { T };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  const ti = process.argv.indexOf('--threads');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  await runThreadTests({ ok, section, threads: ti > 0 ? Number(process.argv[ti + 1]) : 0 });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
