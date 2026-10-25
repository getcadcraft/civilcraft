#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-thermal.mjs — PartCraft's thermal, thermal-stress and buckling kernels (thermal.js, buckling.js, sim-thermal.js,
 * thermal-worker.js, the thermal values in materials.js), checked against closed-form references on exact-kernel blocks:
 *   steady conduction: a bar between two temperatures (linear, kAΔT/L), a fin with convection (cosh solution with a convecting tip),
 *   a slab with internal generation (parabola), heat balance (power in = convection out; flux × the true area of a curved face),
 *   radiation from a bar's end (the quartic balance); transient: a lumped body cooling (exp(−t/τ)) and a semi-infinite bar (erfc);
 *   thermal stress: a free bar (σ = 0, ΔL = αLΔT, also under a linear temperature field), a held bar (σ = −EαΔT); linear buckling:
 *   Euler columns P = π²EI/(KL)² fixed–free and pinned–pinned at two slenderness ratios; study data and the worker ops.
 *   node tools/partcraft-test/test-thermal.mjs [--verbose]     (or runThermalTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runThermalTests({ ok, section, near, oc = null, log = (m) => console.log('  note ' + m) }) {
  const MAT = await import(DEV + 'materials.js');
  const VX = await import(DEV + 'voxel.js');
  const FE = await import(DEV + 'fea.js');
  const TH = await import(DEV + 'thermal.js');
  const BK = await import(DEV + 'buckling.js');
  const SIM = await import(DEV + 'sim.js');
  const ST = await import(DEV + 'sim-thermal.js');
  const TW = await import(DEV + 'thermal-worker.js');
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(3)} %`;
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };

  /** An exact-kernel block L (x) × H (y) × W (z), optionally with a through hole → { regen, face(n, at?), zMin } */
  const block = (L, H, W, hole = null) => {
    const part = P.newPart('Block');
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [L, H]);
    if (hole) S.addCircle(sk, [hole.cx, hole.cy], hole.d / 2);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: W });
    const regen = B.regenerateBrep(part, oc);
    const face = (n, at = null) => {
      let best = -1, bd = Infinity;
      regen.faces.forEach((f, i) => { if (f.type !== 'plane' || f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] < 0.999) return; const d = at ? Math.hypot(f.at[0] - at[0], f.at[1] - at[1], f.at[2] - at[2]) : 0; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    return { part, regen, face, zMin: regen.stats.bbox.min[2] };
  };
  const meshOf = (b, h, type = 'h8i') => { const g = VX.voxelize(b.regen.mesh, { h }); return { g, mesh: TH.voxelMesh(g, { type }) }; };
  const exact = (b) => b.regen.faces.map((f) => f.area);
  const maxErr = (mesh, T, fn) => { let e = 0; for (let n = 0; n < mesh.nn; n++) if (mesh.active[n]) e = Math.max(e, Math.abs(T[n] - fn(mesh.xyz[3 * n], mesh.xyz[3 * n + 1], mesh.xyz[3 * n + 2]))); return e; };
  const steel = MAT.materialById('steel'), al = MAT.materialById('al6061');
  const kS = steel.k * TH.SI.k;
  const bar = block(100, 10, 10);
  const [X0, X1, Y0, Y1, Z0, Z1] = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]].map((n) => bar.face(n));

  section('thermal: material values and the element routines');
  {
    ok(MAT.MATERIALS.every((m) => m.k > 0 && m.cp > 0 && m.alpha > 0 && m.alpha < 2e-4), 'every library material has a conductivity, a specific heat and an expansion coefficient');
    ok(al.k === 167 && al.cp === 896 && al.alpha === 23.6e-6 && steel.k === 51.9 && MAT.materialById('ss304').k === 16.2 && MAT.materialById('ti64').alpha === 8.6e-6, 'values as cited (6061-T6 167 W/(m·K), 896 J/(kg·K), 23.6 µm/(m·K); steel 51.9; 304 16.2; Ti-6Al-4V 8.6 µm/(m·K))');
    const c = MAT.readMaterial({ name: 'c', E: 1000, nu: 0.3, density: 1000, yield: 10, k: 1, cp: 1000, alpha: 1e-5 });
    ok(c.k === 1 && c.alpha === 1e-5 && throws(() => MAT.readMaterial({ name: 'c', E: 1000, nu: 0.3, density: 1000, yield: 10, k: -1 }), /conductivity/) && MAT.readMaterial({ name: 'c', E: 1000, nu: 0.3, density: 1000, yield: 10 }).k === undefined, 'a custom material may carry thermal values (range-checked) or none');
    const el = TH.ELEMENTS.h8i, X = new Float64Array(24), h = 2;
    [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0], [0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]].forEach((p, a) => { X[3 * a] = p[0] * h + 5; X[3 * a + 1] = p[1] * h; X[3 * a + 2] = p[2] * h; });
    const Ke = el.conductivity(X, 3, new Float64Array(64)), ev = FE.symEig(Ke, 8).values.sort((a, b) => a - b);
    let rs = 0, as = 0; for (let a = 0; a < 8; a++) { let s = 0; for (let b = 0; b < 8; b++) { s += Ke[a * 8 + b]; as = Math.max(as, Math.abs(Ke[a * 8 + b] - Ke[b * 8 + a])); } rs = Math.max(rs, Math.abs(s)); }
    ok(rs < 1e-12 && as < 1e-15 && Math.abs(ev[0]) < 1e-12 && ev[1] > 1e-3, 'hex conductivity: symmetric, rows sum to zero, one zero mode (a uniform temperature)');
    const Cl = el.capacity(X, 2, new Float64Array(8), true), Cc = el.capacity(X, 2, new Float64Array(64), false), q = el.heatLoad(X, 5, new Float64Array(8));
    ok(near(Cl.reduce((s, v) => s + v, 0), 2 * 8, 1e-12) && near(Cc.reduce((s, v) => s + v, 0), 2 * 8, 1e-12) && near(q.reduce((s, v) => s + v, 0), 5 * 8, 1e-12), 'capacity (lumped and consistent) and the generation load integrate to ρc·V and Q·V');
    // a free uniform expansion u = α ΔT (x − x0): no stress at any Gauss point, and the thermal load balances itself
    for (const type of ['h8', 'h8i']) {
      const E = TH.ELEMENTS[type], alpha = 1e-5, dT = new Float64Array(8).fill(40), ue = new Float64Array(24);
      for (let a = 0; a < 8; a++) for (let i = 0; i < 3; i++) ue[3 * a + i] = alpha * 40 * (X[3 * a + i] - 1);
      const sg = E.stressPoints(X, 200000, 0.3, ue, new Float64Array(48), { alpha, dT });
      const fe = E.thermalLoad(X, 200000, 0.3, alpha, dT, new Float64Array(24));
      const sum = [0, 1, 2].map((i) => fe.filter((_, r) => r % 3 === i).reduce((s, v) => s + v, 0));
      ok(Math.max(...sg.map(Math.abs)) < 1e-9 && sum.every((v) => Math.abs(v) < 1e-9) && Math.max(...fe.map(Math.abs)) > 1, `${type}: free thermal expansion is stress-free at every Gauss point; the element's thermal load sums to zero`);
    }
    const sig = new Float64Array(48); for (let g = 0; g < 8; g++) sig[6 * g] = -10;
    const G = el.geometricStiffness(X, sig, new Float64Array(64));
    let gs = 0; for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) gs = Math.max(gs, Math.abs(G[a * 8 + b] - G[b * 8 + a]));
    const Kx = el.conductivity(X, 1, new Float64Array(64));   // under uniaxial σxx the geometric matrix is σ·∫∂N/∂x ∂N/∂x: check against a conduction-like integral
    let lin = 0; const ux = Float64Array.from({ length: 8 }, (_, a) => X[3 * a]), Gu = [0, 0, 0, 0, 0, 0, 0, 0]; for (let a = 0; a < 8; a++) for (let b = 0; b < 8; b++) Gu[a] += G[a * 8 + b] * ux[b];
    let uGu = 0; for (let a = 0; a < 8; a++) uGu += ux[a] * Gu[a]; lin = uGu / (-10 * h ** 3);   // ∫ (∂x/∂x)² σ dV / (σ V) = 1
    void Kx;
    ok(gs < 1e-12 && near(lin, 1, 1e-12), 'geometric stiffness: symmetric, and uᵀKσu = σ·V for u = x under a uniform σxx');
  }

  section('thermal: steady conduction against closed forms');
  {
    // bar between 100 °C and 0 °C: linear, heat kAΔT/L, balance
    const { mesh } = meshOf(bar, 2.5);
    const r = TH.solveHeat(mesh, { k: kS, bcs: TH.heatBCs(mesh, [{ type: 'temperature', faces: [X0], T: 100 }, { type: 'temperature', faces: [X1], T: 0 }], exact(bar)) });
    const e = maxErr(mesh, r.T, (x) => 100 - x), Q = kS * 100 * 100 / 100;
    ok(e < 1e-6 && rel(r.balance.items[0], Q, 1e-9) && rel(-r.balance.items[1], Q, 1e-9), `bar between 100 and 0 °C: linear to ${e.toExponential(1)} K; heat kAΔT/L = ${Q.toFixed(4)} W in at the hot end and out at the cold (${r.balance.items.map((v) => v.toFixed(6)).join(', ')})`);
    // fin: base 100 °C, convection h on the sides and the tip; T/Tb = [cosh m(L−x) + (h/mk) sinh m(L−x)] / [cosh mL + (h/mk) sinh mL]
    const hc = 50, hS = hc * TH.SI.h, m = Math.sqrt(hS * 40 / (kS * 100)), L = 100, Bi = hS / (m * kS);
    const fin = (x) => 20 + 80 * (Math.cosh(m * (L - x)) + Bi * Math.sinh(m * (L - x))) / (Math.cosh(m * L) + Bi * Math.sinh(m * L));
    const qf = Math.sqrt(hS * 40 * kS * 100) * 80 * (Math.sinh(m * L) + Bi * Math.cosh(m * L)) / (Math.cosh(m * L) + Bi * Math.sinh(m * L));
    const rows = [2.5, 1.25].map((h) => {
      const mm = meshOf(bar, h).mesh;
      const rr = TH.solveHeat(mm, { k: kS, bcs: TH.heatBCs(mm, [{ type: 'temperature', faces: [X0], T: 100 }, { type: 'convection', faces: [X1, Y0, Y1, Z0, Z1], h: hc, Tamb: 20 }], exact(bar)) });
      let tip = 0, nt = 0; for (let n = 0; n < mm.nn; n++) if (mm.active[n] && near(mm.xyz[3 * n], 100, 1e-9)) { tip += rr.T[n]; nt++; }
      return { h, e: maxErr(mm, rr.T, fin), tip: tip / nt, q: rr.balance.items[0], imb: rr.balance.imbalance, it: rr.iterations };
    });
    log(`fin (steel 10 × 10, h 50 W/(m²·K), Bi ${(hS * 2.5 / kS).toExponential(1)}): tip ${fin(100).toFixed(4)} °C, base heat ${qf.toFixed(5)} W; ` + rows.map((w) => `h ${w.h}: max |ΔT| ${w.e.toFixed(4)} K, tip ${w.tip.toFixed(4)} (${pct(w.tip - 20, fin(100) - 20)} of the excess), heat ${w.q.toFixed(5)} (${pct(w.q, qf)}), ${w.it} IC-PCG iterations`).join('; '));
    ok(rows.every((w) => w.e < 0.3 && rel(w.q, qf, 0.002) && rel(w.tip - 20, fin(100) - 20, 0.002)), 'fin: within 0.3 K of the 1D fin solution everywhere, tip excess and base heat within 0.2 %, at both sizes (what is left is the 1D model\'s own error: it ignores the drop across the section, Bi 2.4e-3, and the corners)');
    ok(rows.every((w) => Math.abs(w.imb) < 1e-8 * Math.abs(w.q)), `fin: heat in = convection out (imbalance ${rows.map((w) => w.imb.toExponential(1)).join(', ')} W)`);
    // slab with internal generation, both faces 20 °C: T = 20 + Q x (L − x) / 2k
    const slab = block(20, 10, 10), sm = meshOf(slab, 1.25).mesh, Qg = 1e8;
    const rs = TH.solveHeat(sm, { k: kS, gen: Qg * TH.SI.gen, bcs: TH.heatBCs(sm, [{ type: 'temperature', faces: [slab.face([-1, 0, 0])], T: 20 }, { type: 'temperature', faces: [slab.face([1, 0, 0])], T: 20 }]) });
    const para = (x) => 20 + Qg * TH.SI.gen * x * (20 - x) / (2 * kS), es = maxErr(sm, rs.T, para);
    ok(es < 1e-6 * para(10) && rel(rs.balance.gen, Qg * 2000 * 1e-9, 1e-12) && rel(-(rs.balance.items[0] + rs.balance.items[1]), rs.balance.gen, 1e-9), `slab 20 mm, 10⁸ W/m³: the parabola (peak ${para(10).toFixed(3)} °C) at every node to ${es.toExponential(1)} K; generation ${rs.balance.gen} W leaves through the two faces`);
    // heat power and flux: what goes in comes out; a flux on a curved face counts its true area
    const pr = TH.solveHeat(mesh, { k: kS, bcs: TH.heatBCs(mesh, [{ type: 'power', faces: [X0], P: 5 }, { type: 'convection', faces: [X1, Y0, Y1, Z0, Z1], h: 20, Tamb: 20 }], exact(bar)) });
    ok(rel(pr.balance.items[0], 5, 1e-12) && rel(-pr.balance.items[1], 5, 1e-8) && Math.abs(pr.balance.imbalance) < 1e-8, `5 W in at one end, convection elsewhere: ${(-pr.balance.items[1]).toFixed(9)} W out`);
    const pl = block(60, 40, 10, { cx: 30, cy: 20, d: 20 }), hole = pl.regen.faces.findIndex((f) => f.type === 'cylinder');
    const hm = meshOf(pl, 1).mesh, qh = 2e4;
    const bh = TH.heatBCs(hm, [{ type: 'flux', faces: [hole], q: qh }, { type: 'temperature', faces: [pl.face([1, 0, 0])], T: 20 }], exact(pl));
    const rh = TH.solveHeat(hm, { k: kS, bcs: bh });
    const At = Math.PI * 20 * 10, Qh = qh * 1e-6 * At;
    ok(rel(pl.regen.faces[hole].area, At, 1e-6) && rel(rh.balance.items[0], Qh, 1e-9) && rel(-rh.balance.items[1], Qh, 1e-8), `flux 2·10⁴ W/m² on a Ø20 × 10 hole: ${rh.balance.items[0].toFixed(6)} W = q × the true area π·20·10 (the staircase has ${bh[0].meshArea.toFixed(0)} mm², not ${At.toFixed(0)})`);
    // radiation from the far end only (sides adiabatic): kA(T0 − TL)/L = εσA(TL⁴ − T∞⁴)
    const eps = 0.8, Ta = 20 + TH.KELVIN, T0 = 300;
    const g = (TL) => kS * (T0 - TL) / 100 - eps * TH.SIGMA_SB * ((TL + TH.KELVIN) ** 4 - Ta ** 4);
    let lo = 20, hi = T0; for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (g(mid) > 0) lo = mid; else hi = mid; }
    const rr = TH.solveHeat(mesh, { k: kS, bcs: TH.heatBCs(mesh, [{ type: 'temperature', faces: [X0], T: T0 }, { type: 'radiation', faces: [X1], eps, Tamb: 20 }], exact(bar)) });
    let tip = 0, nt = 0; for (let n = 0; n < mesh.nn; n++) if (mesh.active[n] && near(mesh.xyz[3 * n], 100, 1e-9)) { tip += rr.T[n]; nt++; }
    tip /= nt;
    ok(Math.abs(tip - lo) < 1e-5 && rr.radiation.converged && Math.abs(rr.balance.imbalance) < 1e-6 * rr.balance.inflow, `radiation (ε 0.8 to 20 °C) from a bar's end held at 300 °C at the other: end ${tip.toFixed(6)} °C vs the quartic balance ${lo.toFixed(6)} (linearised and re-solved, ${rr.radiation.iterations} passes)`);
  }

  section('thermal: transient against closed forms');
  {
    // lumped cooling of a 10 mm aluminum cube (Bi ≈ 5e-4): T = T∞ + (T0 − T∞) exp(−hA t / ρcV)
    const cube = block(10, 10, 10), cm = meshOf(cube, 2.5).mesh, all = cube.regen.faces.map((_, i) => i);
    const rc = al.density * al.cp * TH.SI.rc, tau = rc * 1000 / (50 * TH.SI.h * 600), Tex = 20 + 80 * Math.exp(-200 / tau);
    const res = [1, 0.5].map((theta) => {
      const r = TH.solveHeat(cm, { k: al.k * TH.SI.k, rc, bcs: TH.heatBCs(cm, [{ type: 'convection', faces: all, h: 50, Tamb: 20 }], exact(cube)), transient: { T0: 100, t: 200, steps: 50, theta } });
      let mean = 0, c = 0; for (let n = 0; n < cm.nn; n++) if (cm.active[n]) { mean += r.T[n]; c++; }
      return { theta, T: mean / c, err: (mean / c - Tex) / (Tex - 20), r };
    });
    log(`lumped cube, τ ${tau.toFixed(2)} s, t 200 s in 50 steps: exact ${Tex.toFixed(4)} °C; implicit Euler ${res[0].T.toFixed(4)} (${(100 * res[0].err).toFixed(2)} % of the excess), Crank–Nicolson ${res[1].T.toFixed(4)} (${(100 * res[1].err).toFixed(3)} %)`);
    ok(Math.abs(res[1].err) < 0.005 && Math.abs(res[0].err) < 0.08 && Math.abs(res[1].err) < Math.abs(res[0].err), 'lumped cooling: Crank–Nicolson within 0.5 % of the exponential, implicit Euler within 8 % (first order in Δt/τ = 0.05)');
    ok(res.every((w) => Math.abs(w.r.balance.imbalance) < 1e-9 * Math.abs(w.r.balance.outflow) && w.r.frames.length === 51 && near(w.r.times[50], 200, 1e-9)), 'transient balance: convection out = heat released from storage at the last step; 51 frames kept for the slider');
    // semi-infinite: a steel bar at 0 °C, one end raised to 100 °C: T = 100 erfc(x / 2√(at)) while the far end stays cold
    const { mesh } = meshOf(bar, 2.5), rcS = steel.density * steel.cp * TH.SI.rc, a = kS / rcS;
    const erfc = (x) => { const t = 1 / (1 + 0.3275911 * x); return t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))) * Math.exp(-x * x); };   // A&S 7.1.26, 1.5e-7
    const runs = [[40, 1], [40, 0.5]].map(([steps, theta]) => {
      const r = TH.solveHeat(mesh, { k: kS, rc: rcS, bcs: TH.heatBCs(mesh, [{ type: 'temperature', faces: [X0], T: 100 }]), transient: { T0: 0, t: 20, steps, theta } });
      return { steps, theta, e: maxErr(mesh, r.T, (x) => 100 * erfc(x / (2 * Math.sqrt(a * 20)))) };
    });
    log(`semi-infinite steel bar, 20 s (√(at) ${Math.sqrt(a * 20).toFixed(2)} mm), h 2.5: max error ${runs.map((w) => `${w.theta === 1 ? 'implicit Euler' : 'Crank–Nicolson'} ${w.e.toFixed(3)} K`).join(', ')} of 100`);
    ok(runs[1].e < 0.1 && runs[0].e < 0.6, 'semi-infinite bar: erfc profile within 0.1 K (Crank–Nicolson) and 0.6 K (implicit Euler) of a 100 K step');
  }

  section('thermal stress: free and held bars');
  {
    const alpha = steel.alpha, E = steel.E, dT = 50;
    const fr = [{ type: 'frictionless', faces: [X0] }, { type: 'frictionless', faces: [Y0] }, { type: 'frictionless', faces: [Z0] }];
    const r = BK.solveThermoStatic({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 2.5, bcs: { constraints: fr, loads: [] }, thermalLoad: { mode: 'uniform', dT } });
    const dL = alpha * 100 * dT;
    ok(r.maxVm.value < 1e-6 * E * alpha * dT && rel(r.maxDisp.vec[0], dL, 1e-9) && rel(r.maxDisp.vec[1], alpha * 10 * dT, 1e-8), `free bar, ΔT 50 K: no stress (max ${r.maxVm.value.toExponential(1)} MPa), ΔL = αLΔT = ${dL.toFixed(6)} mm (got ${r.maxDisp.vec[0].toFixed(9)}), and it grows 10αΔT across`);
    ok(Math.hypot(...r.reaction) < 1e-8 * E * alpha * dT * 100, `and the supports carry nothing (Σ ${Math.hypot(...r.reaction).toExponential(1)} N against an internal EαΔT·A of ${(E * alpha * dT * 100).toFixed(0)} N)`);
    // held between two walls (frictionless ends: the sides stay free) → σxx = −EαΔT everywhere
    const hr = BK.solveThermoStatic({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 2.5, bcs: { constraints: [...fr, { type: 'frictionless', faces: [X1] }], loads: [] }, thermalLoad: { mode: 'uniform', dT } });
    const s0 = -E * alpha * dT, mesh = TH.voxelMesh(hr.grid), sig = BK.stressAtPoints(mesh, hr.u, steel, { alpha, dT: hr.dT });
    let dev = 0; for (let i = 0; i < sig.length; i += 6) dev = Math.max(dev, Math.abs(sig[i] - s0), Math.abs(sig[i + 1]), Math.abs(sig[i + 2]), Math.abs(sig[i + 3]), Math.abs(sig[i + 4]), Math.abs(sig[i + 5]));
    ok(dev < 1e-6 * -s0 && rel(hr.maxVm.value, -s0, 1e-8) && rel(hr.groupReactions[3][0], s0 * 100, 1e-8), `bar held between walls, ΔT 50 K: σxx = −EαΔT = ${s0.toFixed(3)} MPa at every Gauss point (others 0, to ${dev.toExponential(1)}), the wall pushes back ${hr.groupReactions[3][0].toFixed(4)} N = σA`);
    // both ends fixed (all directions): the middle is uniaxial, −EαΔT
    const fx = BK.solveThermoStatic({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 2.5, bcs: { constraints: [{ type: 'fixed', faces: [X0] }, { type: 'fixed', faces: [X1] }], loads: [] }, thermalLoad: { mode: 'uniform', dT } });
    const fm = TH.voxelMesh(fx.grid), sf = BK.stressAtPoints(fm, fx.u, steel, { alpha, dT: fx.dT });
    let mid = 0, cnt = 0; for (let e = 0; e < fm.ne; e++) { const x = fm.xyz[3 * fm.conn[8 * e]]; if (x >= 45 && x < 55) for (let gp = 0; gp < 8; gp++) { mid += sf[(e * 8 + gp) * 6]; cnt++; } }
    mid /= cnt;
    ok(rel(mid, s0, 0.03), `both ends fully fixed: mid-span σxx ${mid.toFixed(3)} MPa vs −EαΔT ${s0.toFixed(3)} (${pct(mid, s0)}: the fixed ends also stop the sideways growth, a 3D effect at L/b 10)`);
    // a linear temperature field (100 → 0 °C along the bar, stress-free at 0 °C) in a bar held 3-2-1 (statically determinate, so it
    // is free to warp): stress-free in theory (a linear field is compatible); the edge y = z = 0 grows αL·(mean ΔT) = αL·50
    for (const elem of ['h8i', 'h8']) {
      const h = 2.5, NX = 41, NY = 5, nd = (i, j, k) => i + NX * (j + NY * k);
      const st = BK.solveThermoStatic({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h, elem,
        bcs: { constraints: [{ type: 'fixed', nodes: [nd(0, 0, 0)] }, { type: 'fixed', nodes: [nd(NX - 1, 0, 0)], axes: [1, 2] }, { type: 'fixed', nodes: [nd(0, NY - 1, 0)], axes: [2] }], loads: [] },
        heat: [{ type: 'temperature', faces: [X0], T: 100 }, { type: 'temperature', faces: [X1], T: 0 }], thermalLoad: { mode: 'field', Tref: 0 } });
      const g = st.grid, nB = VX.gridDims(bar.regen.stats.bbox, h).nx;
      const b0 = (() => { for (let n = 0; n < st.model.nn; n++) { const p = VX.nodeXYZ(g, n); if (near(p[0], 100, 1e-9) && near(p[1], 0, 1e-9) && near(p[2], bar.zMin, 1e-9)) return n; } return -1; })();
      const ux = st.u[3 * b0], want = alpha * 100 * 50;
      void nB;
      if (elem === 'h8i') ok(rel(ux, want, 1e-8) && st.maxVm.value < 1e-6 && near(st.thermal.maxDT, 100, 1e-6), `h8i, a linear temperature field (100 → 0 °C) in a bar held 3-2-1: stress-free (max ${st.maxVm.value.toExponential(1)} MPa), the edge grows αL·50 = ${want.toFixed(6)} mm (got ${ux.toFixed(9)}): exact, the bubble modes carry their thermal share`);
      else ok(rel(ux, want, 1e-3) && st.maxVm.value < 0.02 * E * alpha * 100, `h8 (plain cubes), the same: ${ux.toFixed(6)} mm, spurious stress ${st.maxVm.value.toFixed(2)} MPa (< 2 % of Eα·100 K = ${(E * alpha * 100).toFixed(0)}; it halves with h)`);
    }
  }

  section('buckling: Euler columns P = π²EI/(KL)²');
  {
    const E = steel.E, I = 10 ** 4 / 12, r = Math.sqrt(I / 100), out = [];
    for (const L of [200, 400]) {
      const c = block(L, 10, 10), x0 = c.face([-1, 0, 0]), x1 = c.face([1, 0, 0]), h = 2.5;
      const t0 = Date.now();
      const ff = BK.solveBuckling({ mesh: c.regen.mesh, faces: c.regen.faces, material: 'steel', h, modes: 2, bcs: { constraints: [{ type: 'fixed', faces: [x0] }], loads: [{ type: 'force', faces: [x1], total: 1, dir: 'normal' }] } });
      const ms1 = Date.now() - t0;
      // pinned–pinned: the centre node of each end held sideways (one also along the axis), one more node stops the twist
      const g = VX.gridDims(c.regen.stats.bbox, h), NX = g.nx + 1, NY = g.ny + 1, nd = (i, j, k) => i + NX * (j + NY * k), jm = g.ny / 2, km = g.nz / 2;
      const pp = BK.solveBuckling({ mesh: c.regen.mesh, faces: c.regen.faces, material: 'steel', h, modes: 2, bcs: { constraints: [{ type: 'fixed', nodes: [nd(0, jm, km)] }, { type: 'fixed', nodes: [nd(g.nx, jm, km)], axes: [1, 2] }, { type: 'fixed', nodes: [nd(0, jm, 0)], axes: [1] }], loads: [{ type: 'force', faces: [x1], total: 1, dir: 'normal' }] } });
      const Pff = Math.PI ** 2 * E * I / (2 * L) ** 2, Ppp = Math.PI ** 2 * E * I / L ** 2;
      out.push({ L, ff, pp, Pff, Ppp, ms1 });
      log(`column 10 × 10 × ${L} steel (L/r ${(L / r).toFixed(0)}), h 2.5 (${ff.summary.elements} cubes): fixed–free λ ${ff.factors.map((v) => v.toFixed(2)).join(', ')} vs ${Pff.toFixed(2)} N (${pct(ff.factors[0], Pff)}, ${ff.eigIterations} subspace iterations, ${ms1} ms); pinned–pinned ${pp.factors.map((v) => v.toFixed(2)).join(', ')} vs ${Ppp.toFixed(2)} N (${pct(pp.factors[0], Ppp)})`);
    }
    ok(out.every((w) => rel(w.ff.factors[0], w.Pff, 0.01) && w.ff.converged), 'fixed–free (K = 2): the first load factor × 1 N is within 1 % of π²EI/(2L)² at L/r 69 and 139');
    ok(out.every((w) => rel(w.pp.factors[0], w.Ppp, 0.015) && w.pp.converged) && Math.abs(out[1].pp.factors[0] / out[1].Ppp - 1) < Math.abs(out[0].pp.factors[0] / out[0].Ppp - 1), 'pinned–pinned (K = 1): within 1.5 % of π²EI/L² (low by the shear and the point supports; closer at the more slender column)');
    ok(out.every((w) => rel(w.ff.factors[1], w.ff.factors[0], 1e-4) && rel(w.pp.factors[1], w.pp.factors[0], 1e-4)), 'the square section buckles equally either way (the first two load factors coincide)');
    // the load factor scales inversely with the load; a load factor below 1 means it buckles
    const c = block(200, 10, 10);
    const big = BK.solveBuckling({ mesh: c.regen.mesh, faces: c.regen.faces, material: 'steel', h: 2.5, modes: 1, bcs: { constraints: [{ type: 'fixed', faces: [c.face([-1, 0, 0])] }], loads: [{ type: 'force', faces: [c.face([1, 0, 0])], total: 20000, dir: 'normal' }] } });
    ok(rel(big.factors[0] * 20000, out[0].ff.factors[0], 1e-5) && big.factors[0] < 1, `20 kN on the 200 mm fixed–free column: load factor ${big.factors[0].toFixed(4)} (< 1: it buckles), the same critical load ${(big.factors[0] * 20000).toFixed(1)} N`);
    // pulling instead: every factor negative → refused with the reversed value
    ok(throws(() => BK.solveBuckling({ mesh: c.regen.mesh, faces: c.regen.faces, material: 'steel', h: 5, modes: 1, bcs: { constraints: [{ type: 'fixed', faces: [c.face([-1, 0, 0])] }], loads: [{ type: 'force', faces: [c.face([1, 0, 0])], total: -1, dir: 'normal' }] } }), /No buckling under these loads.*reversed/), 'a column in tension is refused: no positive load factor (the reversed value is named)');
  }

  section('thermal: studies (sim.js, sim-thermal.js) and the worker ops');
  {
    const ref = (i) => B.faceRef(bar.regen.faces[i]);
    const st = { ...SIM.newSimStudy(), kind: 'thermal', heat: [{ id: 'h1', type: 'temperature', faces: [ref(X0)], T: 100 }, { id: 'h2', type: 'convection', faces: [ref(X1), ref(Y0), ref(Y1), ref(Z0), ref(Z1)], h: 50, Tamb: 20 }, { id: 'h3', type: 'radiation', faces: [ref(X1)], eps: 0.5, Tamb: 20 }, { id: 'h4', type: 'flux', faces: [ref(Y1)], q: 100 }, { id: 'h5', type: 'power', faces: [ref(Y0)], P: 1 }], thermal: { gen: 0, transient: false, T0: 20, t: 60, steps: 30, scheme: 'euler' } };
    ok(JSON.stringify(SIM.readSimStudy(JSON.parse(JSON.stringify(st)))) === JSON.stringify(st), 'a thermal study (five kinds of condition, settings) reads back unchanged');
    const old = SIM.newSimStudy();
    ok(JSON.stringify(SIM.readSimStudy(JSON.parse(JSON.stringify(old)))) === JSON.stringify(old) && !('heat' in SIM.readSimStudy(old)), 'an older study (no thermal fields) reads back unchanged, with nothing added');
    const bl = { ...SIM.newSimStudy(), kind: 'buckling', modes: 3, thermalLoad: { mode: 'uniform', dT: 10, Tref: 20 } };
    ok(JSON.stringify(SIM.readSimStudy(bl)) === JSON.stringify(bl), 'a buckling study with a thermal load reads back unchanged');
    const bads = [{ ...st, heat: [{ ...st.heat[0], T: -300 }] }, { ...st, heat: [{ ...st.heat[2], eps: 1.5 }] }, { ...st, heat: [{ ...st.heat[1], h: -1 }] }, { ...st, heat: [{ ...st.heat[0], type: 'magic' }] }, { ...st, thermal: { ...st.thermal, steps: 5000 } }, { ...st, thermal: { ...st.thermal, scheme: 'rk4' } }, { ...st, thermalLoad: { mode: 'melt' } }, { ...st, heat: [st.heat[0], st.heat[0]] }, { ...st, heat: [{ ...st.heat[0], faces: [{ name: '<b>', at: [0, 0, 0] }] }] }];
    ok(bads.every((b) => throws(() => SIM.readSimStudy(JSON.parse(JSON.stringify(b))))), `${bads.length} tampered thermal studies refused (below absolute zero, emissivity, negative h, unknown type, steps, scheme, load mode, duplicate ids, face name)`);
    const j = SIM.simJob(st, bar.regen);
    ok(!j.problems.length && j.job.heat.length === 5 && j.job.heat[0].faces[0] === X0 && j.job.transient === null && ST.opFor(st) === 'thermalSolve', 'simJob: a thermal study needs no support; faces resolved; op thermalSolve');
    ok(/somewhere for the heat to go/.test(SIM.simJob({ ...st, heat: [st.heat[3]] }, bar.regen).problems.join(' ')) && !SIM.simJob({ ...st, heat: [st.heat[3]], thermal: { ...st.thermal, transient: true } }, bar.regen).problems.length, 'steady with only a flux in: refused (heat has nowhere to go); the same study transient is fine');
    ok(/Add a thermal condition/.test(SIM.simJob({ ...st, heat: [] }, bar.regen).problems.join(' ')) && /no faces/.test(SIM.simJob({ ...st, heat: [{ ...st.heat[0], faces: [] }] }, bar.regen).problems.join(' ')), 'no conditions, or one without faces: named');
    const tl = { ...SIM.newSimStudy(), constraints: [{ id: 'c1', type: 'frictionless', faces: [ref(X0)] }], thermalLoad: { mode: 'uniform', dT: 5, Tref: 20 } };
    ok(!SIM.simJob(tl, bar.regen).problems.length && ST.opFor(tl) === 'thermoStaticSolve' && ST.opFor({ ...tl, thermalLoad: { mode: 'none' } }) === 'simSolve' && /Add a load/.test(SIM.simJob({ ...tl, thermalLoad: { mode: 'none', dT: 0, Tref: 20 } }, bar.regen).problems.join(' ')), 'a static study with a thermal load needs no other load (op thermoStaticSolve); without one it asks for a load');
    ok(/thermal conductivity/.test(SIM.simJob({ ...st, material: { name: 'X', E: 1000, nu: 0.3, density: 1000, yield: 10 } }, bar.regen).problems.join(' ')), 'a custom material without a conductivity is named as a problem');
    // the worker ops on real study jobs
    const w = TW.thermalSolve(SIM.simJob({ ...st, heat: st.heat.slice(0, 2) }, bar.regen).job);
    let tmax = -Infinity, tmin = Infinity; for (const v of w.vertex.T) { tmax = Math.max(tmax, v); tmin = Math.min(tmin, v); }
    ok(w.kind === 'thermal' && w.vertex.T.length === w.plotMesh.positions.length / 3 && near(tmax, 100, 1e-6) && rel(tmin, w.minT.value, 1e-3) && Math.abs(w.balance.imbalance) < 1e-8 * w.balance.inflow, `thermalSolve: T on the plot mesh (${w.plotMesh.indices.length / 3} triangles) from ${tmin.toFixed(3)} to ${tmax.toFixed(3)} °C, balance closed`);
    const wt = TW.thermalSolve(SIM.simJob({ ...st, heat: st.heat.slice(0, 2), thermal: { ...st.thermal, transient: true, steps: 10, t: 30 } }, bar.regen).job);
    ok(wt.transient && wt.frames.length === 11 && wt.frames[0].every((v) => Math.abs(v - 20) < 1e-9 || v === 100 || (v > 20 && v < 100)) && wt.times[10] === 30, 'thermalSolve transient: 11 frames of T per vertex for the time slider, starting at 20 °C');
    const bj = SIM.simJob({ ...SIM.newSimStudy(), kind: 'buckling', modes: 2, constraints: [{ id: 'c1', type: 'fixed', faces: [ref(X0)] }], loads: [{ id: 'l1', type: 'force', faces: [ref(X1)], total: 1, dir: 'normal' }], h: 2.5 }, bar.regen);
    const wb = TW.bucklingSolve(bj.job);
    const P100 = Math.PI ** 2 * al.E * (1e4 / 12) / 200 ** 2;   // the study's default material, 6061-T6
    ok(!bj.problems.length && wb.kind === 'buckling' && rel(wb.factors[0], P100, 0.01) && wb.shapes.length === 2 && wb.shapes[0].length === wb.plotMesh.positions.length, `bucklingSolve: ${wb.factors[0].toFixed(2)} vs π²EI/(2L)² ${P100.toFixed(2)} for the 100 mm bar (L/r 35, ${pct(wb.factors[0], P100)}); two shapes on the plot mesh`);
    const wl = TW.thermoStaticSolve(SIM.simJob({ ...tl, constraints: [{ id: 'c1', type: 'frictionless', faces: [ref(X0)] }, { id: 'c2', type: 'frictionless', faces: [ref(Y0)] }, { id: 'c3', type: 'frictionless', faces: [ref(Z0)] }] }, bar.regen).job);
    ok(wl.kind === 'static' && wl.maxVm.value < 1e-6 && rel(wl.maxDisp.vec[0], al.alpha * 100 * 5, 1e-6) && wl.thermal.maxDT === 5 && wl.vertex.dT.length === wl.vertex.vm.length, 'thermoStaticSolve: a free bar warmed 5 K grows αL·5 with no stress; ΔT per vertex for the plot');
  }
  await transientStressTests({ ok, section, near, log, block, bar, faces: { X0, X1, Y0, Y1, Z0, Z1 }, rel, pct, throws, steel, al, MAT, TH, BK, SIM, ST, TW, B });
}

/**
 * Thermal stress from a transient run (round 5, thermal-history.js): the infinite-plate quench against the series solution on voxel
 * cubes and quadratic tets; a long run's last step = the steady thermal-stress result; a step's stress = a static solve on the
 * temperatures a thermal study exports at that time; study data, problems and the worker op.
 */
async function transientStressTests({ ok, section, near, log, block, bar, faces, rel, pct, throws, steel, al, MAT, TH, BK, SIM, ST, TW, B }) {
  const HI = await import(DEV + 'thermal-history.js');
  const { X0, X1, Y0, Z0 } = faces;
  const rows = [];
  section('thermal stress over time: a quenched plate (infinite-plate series solution)');
  {
    // 1/8 of a plate 2b = 10 mm thick, 2W = 40 mm wide (symmetry planes frictionless), steel at 100 °C, stress-free at 100 °C; the face
    // x = b held at 0 °C from t = 0. Away from the free edges: σyy = σzz = Eα/(1 − ν)·(T̄ − T), T̄ the through-thickness mean, with
    // θ = (T − Ts)/(T0 − Ts) = Σ 2(−1)ⁿ/λn cos(λn x/b) e^(−λn² Fo), T̄: Σ 2/λn² e^(−λn² Fo), λn = (n + ½)π, Fo = at/b² (Timoshenko & Goodier §150).
    const b = 5, Wd = 20, pl = block(b, Wd, Wd), bb = pl.regen.stats.bbox, ref = (i) => B.faceRef(pl.regen.faces[i]);
    const [P0, P1, Q0, R0] = [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 0, -1]].map((n) => pl.face(n));
    const a = steel.k * TH.SI.k / (steel.density * steel.cp * TH.SI.rc), tEnd = 0.5 * b * b / a;
    const lam = Array.from({ length: 400 }, (_, n) => (n + 0.5) * Math.PI);
    const theta = (xi, Fo) => lam.reduce((s, l, n) => s + 2 * (n % 2 ? -1 : 1) / l * Math.cos(l * xi) * Math.exp(-l * l * Fo), 0);
    const tbar = (Fo) => lam.reduce((s, l) => s + 2 / (l * l) * Math.exp(-l * l * Fo), 0);
    const s0 = steel.E * steel.alpha * 100 / (1 - steel.nu);
    const study = (mesher, h) => ({ ...SIM.newSimStudy(), mesher, h, material: 'steel', constraints: [P0, Q0, R0].map((f, i) => ({ id: 'c' + (i + 1), type: 'frictionless', faces: [ref(f)] })),
      heat: [{ id: 'h1', type: 'temperature', faces: [ref(P1)], T: 0 }], thermal: { gen: 0, transient: false, T0: 100, t: tEnd, steps: 200, scheme: 'cn' },
      thermalLoad: { mode: 'transient', dT: 0, Tref: 100, at: 'worst', solves: 11 } });
    for (const [mesher, h, tolC, tolS] of [['voxel', 0.625, 0.02, 0.01], ['tet', 1.25, 0.03, 0.03]]) {
      const job = SIM.simJob(study(mesher, h), pl.regen).job;
      const got = [];
      const t0 = Date.now();
      const r = HI.solveThermoHistory(job, () => {}, null, { onFrame(i, { res, time, model }) {
        const Fo = a * time / (b * b);
        if (![0.1, 0.3, 0.5].some((f) => Math.abs(Fo - f) < 1e-9)) return;
        const X = mesher === 'tet' ? model.X : null, g = model.grid, NX = g ? g.nx + 1 : 0, NY = g ? g.ny + 1 : 0;
        const xyz = (n) => (X ? [X[3 * n], X[3 * n + 1], X[3 * n + 2]] : [g.origin[0] + (n % NX) * g.h, g.origin[1] + (Math.floor(n / NX) % NY) * g.h, g.origin[2] + Math.floor(n / (NX * NY)) * g.h]);
        const pick = (x) => { let best = -1, bd = Infinity; for (let n = 0; n < (X ? model.n : model.nn); n++) { if (!X && !model.active[n]) continue; const p = xyz(n), d = Math.hypot(p[0] - x, p[1] - bb.min[1], p[2] - bb.min[2]); if (d < bd) { bd = d; best = n; } } return best; };
        const vm = mesher === 'tet' ? res.vm : res.vmNode;
        got.push({ Fo, c: vm[pick(bb.min[0])], s: vm[pick(bb.max[0])], ac: Math.abs(s0 * (tbar(Fo) - theta(0, Fo))), as: Math.abs(s0 * (tbar(Fo) - theta(1, Fo))) });
      } });
      const ms = Date.now() - t0;
      const errC = Math.max(...got.map((g) => Math.abs(g.c / g.ac - 1))), errS = Math.max(...got.map((g) => Math.abs(g.s / g.as - 1)));
      for (const g of got) rows.push([`Quenched plate, ${mesher} (h ${h}), Fo ${g.Fo.toFixed(1)}: centre / surface σ`, `${g.ac.toFixed(2)} / ${g.as.toFixed(2)} MPa`, `${g.c.toFixed(2)} / ${g.s.toFixed(2)} MPa`, `${pct(g.c, g.ac)} / ${pct(g.s, g.as)}`]);
      ok(got.length === 3 && errC < tolC && errS < tolS && r.history.times.length === 11 && r.history.worst === 0, `quenched plate on ${mesher === 'tet' ? 'quadratic tets' : 'voxel cubes'} (${r.summary.elements} elements, Crank–Nicolson 200 steps, 11 stress solves, ${(ms / 1000).toFixed(1)} s): centre within ${(100 * errC).toFixed(2)} %, surface within ${(100 * errS).toFixed(2)} % of the series solution at Fo 0.1, 0.3, 0.5; the worst time is the start (the quench instant: surface held at 0 °C, the rest still 100 °C)`);
      if (mesher === 'voxel') ok(r.history.maxVm.every((v, i) => i === 0 || v <= r.history.maxVm[i - 1] + 1e-9), `the peak decays monotonically after the quench (${r.history.maxVm.map((v) => v.toFixed(0)).join(', ')} MPa)`);
    }
  }

  section('thermal stress over time: the steady limit and a step against an exported temperature field');
  {
    const ref = (i) => B.faceRef(bar.regen.faces[i]);
    // a 100 × 10 × 10 bar, both ends fixed (all directions), held at 20 °C and 200 °C; diffusion time L²/a ≈ 735 s: after 20 000 s the
    // run is steady to e^(−π² 20000 / 735) — its last step must equal the steady ('field') thermal stress
    const base = (mesher) => ({ ...SIM.newSimStudy(), mesher, h: mesher === 'tet' ? 5 : 2.5, material: 'steel', constraints: [{ id: 'c1', type: 'fixed', faces: [ref(X0)] }],
      heat: [{ id: 'h1', type: 'temperature', faces: [ref(X0)], T: 20 }, { id: 'h2', type: 'temperature', faces: [ref(X1)], T: 200 }], thermal: { gen: 0, transient: false, T0: 20, t: 20000, steps: 40, scheme: 'euler' } });
    for (const mesher of ['voxel', 'tet']) {
      const tr = { ...base(mesher), thermalLoad: { mode: 'transient', dT: 0, Tref: 20, at: 'time', time: 20000 } };
      const sd = { ...base(mesher), thermalLoad: { mode: 'field', dT: 0, Tref: 20 } };
      const rt = HI.solveThermoHistory(SIM.simJob(tr, bar.regen).job);
      const sj = SIM.simJob(sd, bar.regen).job;
      const rs = mesher === 'tet' ? (await import(DEV + 'tet-elements.js')).solveTetThermoStatic(sj) : BK.solveThermoStatic(sj);
      const a1 = mesher === 'tet' ? rt.vm : rt.vmNode, a2 = mesher === 'tet' ? rs.vm : rs.vmNode;
      let d = 0; for (let n = 0; n < a1.length; n++) if (Number.isFinite(a2[n])) d = Math.max(d, Math.abs(a1[n] - a2[n]));
      rows.push([`Long run → steady, ${mesher}: max von Mises`, `${rs.maxVm.value.toFixed(4)} MPa (steady field)`, `${rt.maxVm.value.toFixed(4)} MPa at ${rt.thermal.time} s`, `${pct(rt.maxVm.value, rs.maxVm.value)}`]);
      ok(rel(rt.maxVm.value, rs.maxVm.value, 1e-6) && d < 1e-5 * rs.maxVm.value && rt.history.times.length === 1, `${mesher}: the last step of a 20 000 s run (40 implicit Euler steps) = the steady thermal stress: max von Mises ${rt.maxVm.value.toFixed(4)} vs ${rs.maxVm.value.toFixed(4)} MPa, every node within ${d.toExponential(1)} MPa`);
    }
    // a step's stress = the static solve on the temperatures a thermal study exports at that time (two code paths: the thermal study's frames,
    // then buckling.js setup with those nodal temperatures)
    const tj = { ...base('voxel'), thermal: { gen: 0, transient: true, T0: 20, t: 300, steps: 30, scheme: 'cn' } };
    const th = TH.solveThermalStudy(SIM.simJob({ ...tj, kind: 'thermal' }, bar.regen).job);
    const k = 12, tk = th.times[k];
    const hj = SIM.simJob({ ...tj, thermalLoad: { mode: 'transient', dT: 0, Tref: 20, at: 'time', time: tk } }, bar.regen).job;
    const rh = HI.solveThermoHistory(hj);
    const rx = BK.solveThermoStatic({ ...hj, thermalLoad: { mode: 'field', Tref: 20 }, temperatures: th.frames[k] });
    let du = 0, um = 0; for (let i = 0; i < rx.u.length; i++) { du = Math.max(du, Math.abs(rh.u[i] - rx.u[i])); um = Math.max(um, Math.abs(rx.u[i])); }
    rows.push([`Stress at t = ${tk} s vs a static solve on the exported T`, `${rx.maxVm.value.toFixed(6)} MPa`, `${rh.maxVm.value.toFixed(6)} MPa`, `|Δu| ${(du / um).toExponential(1)} relative`]);
    ok(near(th.times[k], rh.thermal.time, 1e-9) && du < 1e-8 * um && rel(rh.maxVm.value, rx.maxVm.value, 1e-8), `the stress at ${tk} s (step ${k} of 30) = a static solve on the thermal study's exported temperatures at that time (max von Mises ${rh.maxVm.value.toFixed(6)} vs ${rx.maxVm.value.toFixed(6)} MPa, |Δu| ${(du / um).toExponential(1)} of max)`);
    const bk = { ...tj, kind: 'buckling', modes: 1, constraints: [...tj.constraints, { id: 'c2', type: 'fixed', faces: [ref(X1)] }] };   // held at both ends: heating compresses it
    const bt = BK.solveBuckling(SIM.simJob({ ...bk, thermalLoad: { mode: 'transient', dT: 0, Tref: 20, time: tk } }, bar.regen).job);
    const bx = BK.solveBuckling({ ...SIM.simJob({ ...bk, thermalLoad: { mode: 'field', dT: 0, Tref: 20 } }, bar.regen).job, temperatures: th.frames[k] });
    ok(rel(bt.factors[0], bx.factors[0], 1e-7) && near(bt.thermal.time, tk, 1e-9), `buckling (both ends held) with the run's temperatures at ${tk} s = buckling on the exported field (load factor ${bt.factors[0].toPrecision(6)} vs ${bx.factors[0].toPrecision(6)}; the heat is the only load)`);
    // the same two checks on quadratic tets (tet-elements.js setupTet: transient load and given temperatures)
    const TE = await import(DEV + 'tet-elements.js');
    const tt = { ...tj, mesher: 'tet', h: 5 }, thT = TE.solveTetThermal(SIM.simJob({ ...tt, kind: 'thermal' }, bar.regen).job);
    const hT = SIM.simJob({ ...tt, thermalLoad: { mode: 'transient', dT: 0, Tref: 20, at: 'time', time: tk } }, bar.regen).job;
    const rhT = HI.solveThermoHistory(hT), rxT = TE.solveTetThermoStatic({ ...hT, thermalLoad: { mode: 'field', Tref: 20 }, temperatures: thT.frames[k] });
    let duT = 0, umT = 0; for (let i = 0; i < rxT.u.length; i++) { duT = Math.max(duT, Math.abs(rhT.u[i] - rxT.u[i])); umT = Math.max(umT, Math.abs(rxT.u[i])); }
    ok(duT < 1e-7 * umT && rel(rhT.maxVm.value, rxT.maxVm.value, 1e-7), `tets: the stress at ${tk} s = a static solve on the tet thermal study's exported temperatures (max von Mises ${rhT.maxVm.value.toFixed(6)} vs ${rxT.maxVm.value.toFixed(6)} MPa, |Δu| ${(duT / umT).toExponential(1)} of max)`);
    const bkT = { ...bk, mesher: 'tet', h: 5 };
    const btT = TE.solveTetBuckling(SIM.simJob({ ...bkT, thermalLoad: { mode: 'transient', dT: 0, Tref: 20, time: tk } }, bar.regen).job);
    const bxT = TE.solveTetBuckling({ ...SIM.simJob({ ...bkT, thermalLoad: { mode: 'field', dT: 0, Tref: 20 } }, bar.regen).job, temperatures: thT.frames[k] });
    ok(rel(btT.factors[0], bxT.factors[0], 1e-6) && near(btT.thermal.time, tk, 1e-9), `tets: buckling over time at ${tk} s = buckling on the exported field (load factor ${btT.factors[0].toPrecision(6)} vs ${bxT.factors[0].toPrecision(6)})`);
  }

  section('thermal stress over time: study data, problems, the worker op');
  {
    const ref = (i) => B.faceRef(bar.regen.faces[i]);
    const st = { ...SIM.newSimStudy(), mesher: 'voxel', h: 2.5, material: 'steel', constraints: [{ id: 'c1', type: 'fixed', faces: [ref(X0)] }], heat: [{ id: 'h1', type: 'temperature', faces: [ref(X1)], T: 200 }],
      thermal: { gen: 0, transient: false, T0: 20, t: 30, steps: 30, scheme: 'euler' }, thermalLoad: { mode: 'transient', dT: 0, Tref: 20, at: 'worst', solves: 6 } };
    ok(JSON.stringify(SIM.readSimStudy(JSON.parse(JSON.stringify(st)))) === JSON.stringify(st) && JSON.stringify(SIM.readSimStudy({ ...st, thermalLoad: { mode: 'transient', dT: 0, Tref: 20 } }).thermalLoad) === '{"mode":"transient","dT":0,"Tref":20}', 'a static study with a transient thermal load reads back unchanged (at, time, solves only when set)');
    const bads = [{ mode: 'transient', at: 'never' }, { mode: 'transient', solves: 99 }, { mode: 'transient', solves: 1 }, { mode: 'transient', time: -1 }];
    ok(bads.every((l) => throws(() => SIM.readSimStudy({ ...st, thermalLoad: { dT: 0, Tref: 20, ...l } }))), `${bads.length} tampered transient loads refused (unknown time choice, 99 or 1 solves, negative time)`);
    const j = SIM.simJob(st, bar.regen);
    ok(!j.problems.length && ST.opFor(st) === 'thermoHistorySolve' && ST.opFor({ ...st, kind: 'buckling' }) === 'bucklingSolve' && j.job.transient.steps === 30 && j.job.thermalLoad.at === 'worst' && j.job.thermalLoad.solves === 6 && j.job.heat.length === 1, 'simJob: transient settings and the heat conditions go to the job; op thermoHistorySolve (buckling: bucklingSolve at one time)');
    ok(/after the end of the run/.test(SIM.simJob({ ...st, thermalLoad: { ...st.thermalLoad, at: 'time', time: 99 } }, bar.regen).problems.join(' ')) && !SIM.simJob({ ...st, kind: 'buckling', mesher: 'tet' }, bar.regen).problems.length && /thermal conditions/.test(SIM.simJob({ ...st, heat: [] }, bar.regen).problems.join(' ')), 'problems named: a stress time after the end of the run, no thermal conditions; buckling over time on tets is accepted');
    ok(HI.stressSteps({ steps: 30, t: 30 }, { at: 'worst', solves: 6 }).join() === '0,6,12,18,24,30' && HI.stressSteps({ steps: 4, t: 1 }, { at: 'worst', solves: 21 }).join() === '0,1,2,3,4' && HI.stressSteps({ steps: 30, t: 30 }, { at: 'time', time: 12.4 }).join() === '12', 'stress steps: evenly over the run with the start and the end; never more than the run has; one time = the nearest step');
    for (const mesher of ['voxel', 'tet']) {
      const w = TW.thermoHistorySolve(SIM.simJob({ ...st, mesher }, bar.regen).job);
      const nv = w.plotMesh.positions.length / 3;
      ok(w.kind === 'static' && w.frames.length === 6 && w.vertex === w.frames[w.history.worst] && w.frames.every((f) => f.vm.length === nv && f.dT.length === nv && f.u.length === 3 * nv) && near(w.history.maxVm[w.history.worst], w.maxVm.value, 1e-12) && w.history.maxVm.every((v) => v <= w.maxVm.value + 1e-12) && (mesher === 'voxel' || !!w.frames[0].s1), `thermoHistorySolve (${mesher}): 6 frames of vertex fields for the slider, the worst at ${w.history.times[w.history.worst]} s carrying the table's maxima (${w.maxVm.value.toFixed(1)} MPa)`);
    }
  }
  log('verification (case | reference | result | error):');
  for (const r of rows) log('  ' + r.join(' | '));
}


if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runThermalTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
