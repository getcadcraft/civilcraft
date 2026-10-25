#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-flow-turb.mjs — turbulence for PartCraft's Flow study (flow-turb.js: steady RANS, Spalart–Allmaras, Spalding wall
 * functions; flow.js eddy collision and slab kernel). Round 5, 2026-10-12. The turbulent option ships as EXPERIMENTAL: it
 * passes the plane-channel checks below but fails the pipe and backward-facing-step checks (docs/apps/partcraft.md, Flow,
 * "Turbulence"); these tests pin what works, the warning's figures, and that a small turbulent study runs.
 *   Spalding's law and its inverse; the slab kernel (any cut of the cells gives the same step, bit for bit — the
 *   contract a worker split relies on); laminar runs unchanged by the new options; a body-force Poiseuille channel exact
 *   through the eddy collision; fully developed turbulent plane channel (periodic, body force) against Dean's (1978)
 *   friction correlation Cf = 0.073 Re_m^−¼ and against Moser, Kim & Mansour (1999) at Re_τ 180; mass conserved; the
 *   experimental option and its standing warning; a small turbulent pipe study on an OCCT part (converges, mass, y⁺).
 *   node tools/partcraft-test/test-flow-turb.mjs [--verbose] [--long]   (or runFlowTurbTests() from bin/test-partcraft.mjs)
 *   --long adds the channel's y⁺ sweep and the pipe (Colebrook) and step (Driver & Seegmiller) runs, printed, not checked.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runFlowTurbTests({ ok, section, near, oc = null, long = false, log = (m) => console.log('  note ' + m) }) {
  const FL = await import(DEV + 'flow.js');
  const FT = await import(DEV + 'flow-turb.js');
  const FS = await import(DEV + 'flow-study.js');
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(2)} %`;

  section('flow turbulence: Spalding\'s law of the wall (flow-turb.js)');
  {
    let e = 0;
    for (const up of [0.5, 3, 8, 15, 25, 32]) e = Math.max(e, Math.abs(FT.uPlus(FT.spalding(up)) / up - 1));
    ok(e < 1e-10, `u⁺(y⁺(u⁺)) returns u⁺ to ${e.toExponential(1)} over 0.5…32`);
    ok(Math.abs(FT.spalding(0.1) / 0.1 - 1) < 1e-4 && Math.abs(FT.uPlus(1000) - (Math.log(1000) / 0.41 + 5.0)) < 0.05, `viscous sublayer y⁺ = u⁺ (${FT.spalding(0.1).toFixed(6)} at 0.1) and log layer u⁺ = ln(y⁺)/κ + B at y⁺ 1000 (${FT.uPlus(1000).toFixed(3)} vs ${(Math.log(1000) / 0.41 + 5).toFixed(3)})`);
    const nu = 1e-5, y = 0.5, ut = 0.003, U = ut * FT.uPlus(y * ut / nu);
    ok(Math.abs(FT.frictionVelocity(U, y, nu) / ut - 1) < 1e-9 && Math.abs(FT.frictionVelocity(U, y, nu, 0.1) / ut - 1) < 1e-9, `friction velocity from the wall-parallel speed: ${FT.frictionVelocity(U, y, nu).toPrecision(10)} vs ${ut} (any starting guess)`);
  }

  // a square duct (walls as solid cells), velocity inlet / pressure outlet, for the kernel checks
  const duct = (n = 8, len = 20, eddy = false) => {
    const nx = n + 2, ny = n + 2, nz = len + 2, kind = new Int32Array(nx * ny * nz);
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const e = i + nx * (j + ny * k); kind[e] = i === 0 || j === 0 || i === nx - 1 || j === ny - 1 ? -1 : k === 0 ? 1 : k === nz - 1 ? 2 : 0; }
    const lat = FL.buildLattice({ nx, ny, nz, kind, groups: [null, { type: 'velocity', u: [0, 0, 0.03] }, { type: 'pressure', rho: 1 }] });
    const S = FL.makeState(lat, { tau: eddy ? 0.5 + 3 * 2e-4 : 0.6, eddy, smagorinsky: eddy ? FT.STABILIZER : 0 });
    if (eddy) FT.attachSA(S, { nu: 2e-4, nuIn: 1e-3, nt0: 1e-3 });
    return S;
  };
  section('flow turbulence: the slab kernel (flow.js stepSlab / updateSlab / endStep)');
  for (const eddy of [false, true]) {
    const A = duct(8, 20, eddy), B = duct(8, 20, eddy);
    for (let s = 0; s < 60; s++) FL.step(A);
    const parts = FL.slabs(B, 3);
    for (let s = 0; s < 60; s++) {
      for (const sl of parts.slice().reverse()) FL.stepSlab(B, sl);          // any order: slabs only write their own cells
      if (B.turb) for (const sl of parts) B.turb.updateSlab(B, sl);
      FL.endStep(B);
    }
    let d = 0; for (let i = 0; i < A.src.length; i++) d = Math.max(d, Math.abs(A.src[i] - B.src[i]));
    let dn = 0; if (eddy) for (let i = 0; i < A.nut.length; i++) dn = Math.max(dn, Math.abs(A.nut[i] - B.nut[i]));
    ok(d === 0 && dn === 0 && parts[0].n0 === 0 && parts[2].n1 === A.lat.nf, `${eddy ? 'turbulent (eddy collision + SA)' : 'laminar'} duct, 60 steps: three slabs run out of order give the same populations${eddy ? ' and eddy viscosity' : ''} as one step over all cells (largest difference ${Math.max(d, dn)})`);
  }

  section('flow turbulence: the eddy collision on a body-force channel');
  {
    const N = 20, nu = 0.1, F = 1e-6;
    const run = (eddy) => {
      const lat = FL.buildLattice({ nx: 1, ny: N, nz: 1, kind: new Int32Array(N), periodic: [true, false, true] });
      const S = FL.makeState(lat, { tau: 0.5 + 3 * nu, force: [F, 0, 0], eddy });
      for (let s = 0; s < 20000; s++) FL.step(S);
      let e = 0; for (let n = 0; n < N; n++) { const y = n + 0.5; e = Math.max(e, Math.abs(S.ux[n] / (F / (2 * nu) * y * (N - y)) - 1)); }
      return e;
    };
    const el = run(false), ee = run(true);
    ok(el < 1e-10, `laminar TRT (magic Λ) with the body force: Poiseuille exact to ${el.toExponential(1)}`);
    ok(ee < 0.03, `eddy collision (ν_t = 0, τ 0.8, ω− ≥ ${FL.OMEGA_MINUS} so Λ is not the magic 3/16): largest error ${(100 * ee).toFixed(2)} % (the halfway wall moves off ½ when Λ is not magic)`);
  }

  /** Fully developed plane channel: N cells across 2h, friction Reynolds number Re_τ; periodic, driven by F = u_τ²/h. */
  const channel = (N, ReTau, { ut = 0.005, maxSteps = 1500000 } = {}) => {
    const h = N / 2, nu = ut * h / ReTau;
    const lat = FL.buildLattice({ nx: 1, ny: N, nz: 1, kind: new Int32Array(N), periodic: [true, false, true] });
    const S = FL.makeState(lat, { tau: 0.5 + 3 * nu, eddy: true, force: [ut * ut / h, 0, 0], u0: [20 * ut, 0, 0], smagorinsky: FT.STABILIZER });
    const T = FT.attachSA(S, { nu, nt0: 0.05 * ut * h });
    let prev = 0, ub = 0, conv = false;
    for (let s = 1; s <= maxSteps; s++) {
      FL.step(S);
      if (s % 2000) continue;
      ub = 0; for (let n = 0; n < N; n++) ub += S.ux[n]; ub /= N;
      if (s > 20000 && Math.abs(ub - prev) < 1e-7 * ub) { conv = true; break; }
      prev = ub;
    }
    let m = 0; for (let n = 0; n < N; n++) m += S.rho[n];
    const Reb = ub * 2 * h / nu, Cf = 2 * ut * ut / (ub * ub), dean = 0.073 * Reb ** -0.25;
    return { Reb, Cf, dean, ubp: ub / ut, yplus: FT.wallStats(T).p50, conv, steps: S.step, mass: m / N };
  };
  section('flow turbulence: plane channel vs Dean 1978 and Moser, Kim & Mansour 1999');
  {
    const t0 = Date.now();
    const a = channel(20, 1000), b = channel(20, 2000), c = channel(60, 180);
    ok(a.conv && Math.abs(a.Cf / a.dean - 1) < 0.06, `Re_τ 1000, 20 cells across (first-cell y⁺ ${a.yplus.toFixed(1)}): Re_m ${a.Reb.toFixed(0)}, Cf ${a.Cf.toExponential(4)} vs Dean ${a.dean.toExponential(4)} (${pct(a.Cf, a.dean)})`);
    ok(b.conv && Math.abs(b.Cf / b.dean - 1) < 0.06, `Re_τ 2000, 20 cells across (y⁺ ${b.yplus.toFixed(1)}): Re_m ${b.Reb.toFixed(0)}, Cf ${b.Cf.toExponential(4)} vs Dean ${b.dean.toExponential(4)} (${pct(b.Cf, b.dean)})`);
    const mkm = 5600 / (2 * 178.12);   // MKM 1999 Re_τ 178.12, Re_b(2h) ≈ 5600 → U_b⁺ ≈ 15.72
    ok(c.conv && Math.abs(c.ubp / mkm - 1) < 0.03, `Re_τ 180, 60 cells across (y⁺ ${c.yplus.toFixed(1)}, sublayer resolved): bulk velocity U_b⁺ ${c.ubp.toFixed(3)} vs ${mkm.toFixed(3)} from the DNS (${pct(c.ubp, mkm)}); Cf ${pct(c.Cf, c.dean)} vs Dean`);
    ok([a, b, c].every((r) => Math.abs(r.mass - 1) < 1e-10), `mass conserved in the periodic channels (mean density ${a.mass.toFixed(12)}) (${Date.now() - t0} ms)`);
    if (long) {
      for (const [N, R] of [[20, 300], [40, 300], [80, 1000], [10, 2000], [10, 4000], [30, 180]]) {
        const r = channel(N, R);
        log(`channel Re_τ ${R}, ${N} cells: y⁺ ${r.yplus.toFixed(1)}, Cf ${pct(r.Cf, r.dean)} vs Dean${r.conv ? '' : ' (not converged)'}`);
      }
    }
  }

  section('flow turbulence: offered as experimental, with its warning');
  {
    const back = FS.readFlow(JSON.parse(JSON.stringify({ ...FS.newFlow(), model: 'sa' })));
    ok(back.model === 'sa' && FS.readFlow({ ...FS.newFlow(), model: undefined }).model === 'laminar' && FS.newFlow().model === 'laminar', 'the study reads model "sa"; an old file without a model, and a new study, are laminar');
    let threw = false; try { FS.readFlow({ ...FS.newFlow(), model: 'kepsilon' }); } catch { threw = true; }
    ok(threw, 'an unknown flow model is refused');
    ok(FS.FLOW_MODELS.some(([k, l]) => k === 'sa' && /experimental/.test(l)) && FS.FLOW_MODELS[0][0] === 'laminar', `the panel offers ${FS.FLOW_MODELS.map(([, l]) => l).join(' | ')}`);
    const W = FS.TURB_WARNING;
    ok(/did not pass/.test(W) && /friction \+3 to \+5 %/.test(W) && /bulk velocity −1 %/.test(W) && /30 to 34 %/.test(W) && /21 to 39 %/.test(W) && /slowly/.test(W) && /qualitative/.test(W), 'the standing warning names the failed checks and their figures (channel friction +3…+5 %, resolved-wall channel bulk velocity −1 %, pipe +30…+34 %, step −21…−39 %, slow grid convergence) and says qualitative only');
  }
  if (oc) {
    section('flow turbulence: a small turbulent study on an OCCT part (flow-worker.js)');
    const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'), B = await import(DEV + 'brep.js'), SIM = await import(DEV + 'sim.js'), FW = await import(DEV + 'flow-worker.js');
    const part = P.newPart('Pipe'), sk = S.newSketch(); S.addRect(sk, [-10, -10], [10, 10]); S.addCircle(sk, [0, 0], 5);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 40 });
    const regen = B.regenerateBrep(part, oc);
    const face = (z) => regen.faces.findIndex((f) => f.type === 'plane' && Math.abs(f.n[2] - z) < 1e-6);
    const st = SIM.newSimStudy(); st.kind = 'flow'; st.flow = { ...FS.newFlow(), model: 'sa', fluid: 'water' };
    const nu = 1.0016e-3 / 998.21, U = 2e4 * nu / 0.01;
    st.flow.openings = [{ id: 'o1', role: 'inlet', faces: [B.faceRef(regen.faces[face(-1)])], spec: 'velocity', value: U }, { id: 'o2', role: 'outlet', faces: [B.faceRef(regen.faces[face(1)])], p: 0 }];
    const { job, problems, h } = FS.flowJob(SIM.readSimStudy(st), regen);
    const t0 = Date.now(), r = FW.solveFlow(job), ms = Date.now() - t0;
    const y = r.turb.yplus, bal = (r.massIn - r.massOut) / r.massIn;
    ok(!problems.length && r.model === 'sa' && r.converged, `water at ${U.toFixed(2)} m/s through the Ø10 bore (Re ${r.Re.toFixed(0)}), automatic ${h} mm cells: ${r.mesh.fluid.toLocaleString('en-US')} fluid cells, converged in ${r.steps} steps, ${(ms / 1000).toFixed(1)} s`);
    ok(Math.abs(bal) < 1e-4 && r.wallLeak === 0, `mass balance ${(100 * bal).toExponential(2)} % with slip terms on the walls (the local mass correction passes none)`);
    ok(y && y.min >= FT.YPLUS_RANGE[0] && y.max <= FT.YPLUS_RANGE[1] && y.mean > 15, `first-cell y⁺ min ${y.min.toFixed(1)}, mean ${y.mean.toFixed(1)}, max ${y.max.toFixed(1)} over ${y.cells} wall cells (inside ${FT.YPLUS_RANGE.join('–')})`);
    ok(r.fields.nut && r.turb.nutMax > 10 && r.dp > 0 && r.forceBy === 'openings', `eddy viscosity up to ${r.turb.nutMax.toFixed(0)} × ν, pressure drop ${r.dp.toFixed(1)} Pa, force from the momentum balance over the openings`);
    const Fz = r.force[2];
    ok(Fz > 0 && Math.abs(r.force[0]) < 0.05 * Fz && Math.abs(r.force[1]) < 0.05 * Fz, `the fluid drags the part along the flow (${Fz.toExponential(3)} N along +Z; across ${Math.abs(r.force[0]).toExponential(1)}, ${Math.abs(r.force[1]).toExponential(1)} N)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose'), LONG = process.argv.includes('--long');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  await runFlowTurbTests({ ok, section, near, oc, long: LONG });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
