#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-flow.mjs — PartCraft's Flow study (flow.js lattice Boltzmann D3Q19 TRT, flow-domain.js, flow-study.js,
 * flow-worker.js), checked against closed-form and published benchmark values, errors printed:
 *   fluids (ideal gas + Sutherland for air, IAPWS for water); study data and 12 tampered blocks refused;
 *   a closed box at rest stays at rest; uniform flow through a slip box stays uniform; plane Poiseuille flow
 *   (profile and pressure gradient 12μŪ/H²); the lid-driven cavity at Re 100 against Ghia, Ghia & Shin (1982)
 *   centre-line tables, with mass conserved exactly; the Schäfer & Turek (1996) benchmark 2D-1 (cylinder in a channel,
 *   Re 20): drag coefficient 5.57–5.59, pressure difference 0.1172–0.1176; the product path on a voxelized OCCT part:
 *   a pipe (lids found on its rims, hole area exact) against Hagen–Poiseuille (pressure gradient, velocity profile,
 *   flow rate) with a grid-convergence run, the mass balance, a volume-flow inlet, a capped pipe (inlet on a cap's inner
 *   face), an open cavity refused, and a sphere in an external box (Re 20) against the standard drag curve.
 *   node tools/partcraft-test/test-flow.mjs [--verbose] [--long]   (or runFlowTests() from bin/test-partcraft.mjs)
 *   --long adds the cylinder at 20 cells per diameter and the unconfined cylinder at Re 20.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

// Ghia, Ghia & Shin (1982), J. Comput. Phys. 48, 387–411, tables I and II, Re 100: u on the vertical and v on the horizontal centre line
const GHIA_U = [[1, 1], [0.9766, 0.84123], [0.9688, 0.78871], [0.9609, 0.73722], [0.9531, 0.68717], [0.8516, 0.23151], [0.7344, 0.00332], [0.6172, -0.13641], [0.5, -0.20581], [0.4531, -0.2109], [0.2813, -0.15662], [0.1719, -0.1015], [0.1016, -0.06434], [0.0703, -0.04775], [0.0625, -0.04192], [0.0547, -0.03717], [0, 0]];
const GHIA_V = [[1, 0], [0.9688, -0.05906], [0.9609, -0.07391], [0.9531, -0.08864], [0.9453, -0.10313], [0.9063, -0.16914], [0.8594, -0.22445], [0.8047, -0.24533], [0.5, 0.05454], [0.2344, 0.17527], [0.2266, 0.17507], [0.1563, 0.16077], [0.0938, 0.12317], [0.0781, 0.1089], [0.0703, 0.10091], [0.0625, 0.09233], [0, 0]];

export async function runFlowTests({ ok, section, near, oc = null, long = false, log = (m) => console.log('  note ' + m) }) {
  const FL = await import(DEV + 'flow.js');
  const FD = await import(DEV + 'flow-domain.js');
  const FS = await import(DEV + 'flow-study.js');
  const FW = await import(DEV + 'flow-worker.js');
  const SIM = await import(DEV + 'sim.js');
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(2)} %`;
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };

  section('flow: fluids and study data (flow.js, flow-study.js, sim.js)');
  {
    const air = FL.fluidById('air'), water = FL.fluidById('water');
    ok(near(air.density, 101325 / (287.05 * 293.15), 1e-4) && near(air.density, 1.2041, 1e-9), `air at 20 °C: ρ = p/(RT) = ${air.density} kg/m³`);
    ok(Math.abs(air.viscosity / 1.813e-5 - 1) < 1e-3 && air.viscosity > 1.80e-5 && air.viscosity < 1.83e-5, `air: Sutherland's law (White) μ = ${air.viscosity} Pa·s, inside the handbook range 1.81–1.82e-5`);
    ok(water.density === 998.21 && water.viscosity === 1.0016e-3, 'water at 20 °C: 998.21 kg/m³ (IAPWS-95), 1.0016 mPa·s (IAPWS 2008)');
    const fl = FS.newFlow();
    fl.openings = [{ id: 'o1', role: 'inlet', faces: [{ name: 'f1.side:l1', at: [0, 0, 0] }], spec: 'velocity', value: 0.1 }, { id: 'o2', role: 'outlet', faces: [{ name: 'f1.top', at: [1, 2, 3] }], p: 50 }];
    fl.fluid = { name: 'Oil', density: 870, viscosity: 0.1 };
    const back = FS.readFlow(JSON.parse(JSON.stringify(fl)));
    ok(JSON.stringify(back) === JSON.stringify(fl), 'a flow block survives JSON and the reader unchanged (openings, custom fluid)');
    const st = SIM.newSimStudy(); st.kind = 'flow'; st.flow = fl; st.constraints = [{ id: 'c1', type: 'fixed', faces: [] }];
    const rs = SIM.readSimStudy(JSON.parse(JSON.stringify(st)));
    ok(rs.kind === 'flow' && rs.flow.openings.length === 2 && rs.constraints.length === 1 && !('flow' in SIM.readSimStudy(SIM.newSimStudy())), 'the simulation study reads kind "flow" with its block, keeps the structural fields; a static study has no flow block');
    const bad = [
      (f) => { f.type = 'pipe'; }, (f) => { f.fluid = 'mercury'; }, (f) => { f.fluid = { density: 1000, viscosity: -1 }; }, (f) => { f.openings[0].role = 'vent'; },
      (f) => { f.openings[0].value = NaN; }, (f) => { f.openings[1].id = 'o1'; }, (f) => { f.openings[0].faces[0].name = 'x<script>'; }, (f) => { f.ext.dir = [0, 0, 0]; },
      (f) => { f.openings = Array.from({ length: 17 }, (_, i) => ({ id: 'o' + i, role: 'outlet', faces: [], p: 0 })); }, (f) => { f.h = 0; }, (f) => { f.v = 2; }, (f) => { f.ext.speed = 1e9; },
    ];
    ok(bad.every((fn) => { const f = JSON.parse(JSON.stringify(fl)); fn(f); return throws(() => FS.readFlow(f)); }), `${bad.length} tampered flow blocks are refused (type, fluid, viscosity, role, NaN, duplicate id, face name, zero direction, too many openings, zero cell, version, speed)`);
  }

  section('flow: lattice (flow.js) — rest, uniform flow, plane Poiseuille');
  {
    // a closed box at rest
    const nx = 6, ny = 5, nz = 4, kind = new Int32Array(nx * ny * nz);
    const lat = FL.buildLattice({ nx, ny, nz, kind });
    const st = FL.makeState(lat, { tau: 0.8 });
    for (let i = 0; i < 200; i++) FL.step(st);
    let m = 0, u = 0; for (let n = 0; n < lat.nf; n++) { m += st.rho[n]; u = Math.max(u, Math.hypot(st.ux[n], st.uy[n], st.uz[n])); }
    ok(Math.abs(m - lat.nf) < 1e-10 && u < 1e-14, `a closed box at rest stays at rest (mass ${m.toFixed(12)} of ${lat.nf}, |u| ${u.toExponential(1)})`);
    // uniform flow along x through a box with slip sides: velocity inflow, pressure outflow
    const bx = 24, by = 8, bz = 8, k2 = new Int32Array(bx * by * bz);
    for (let k = 0; k < bz; k++) for (let j = 0; j < by; j++) for (let i = 0; i < bx; i++) {
      const e = i + bx * (j + by * k);
      if (i === 0) k2[e] = 1; else if (i === bx - 1) k2[e] = 2; else if (j === 0 || j === by - 1) k2[e] = 3; else if (k === 0 || k === bz - 1) k2[e] = 4;
    }
    const U0 = 0.05, l2 = FL.buildLattice({ nx: bx, ny: by, nz: bz, kind: k2, groups: [null, { type: 'velocity', u: [U0, 0, 0] }, { type: 'pressure', rho: 1 }, { type: 'slip', axis: 1 }, { type: 'slip', axis: 2 }] });
    const s2 = FL.makeState(l2, { tau: 0.7, u0: [U0, 0, 0] });
    for (let i = 0; i < 500; i++) FL.step(s2);
    let du = 0; for (let n = 0; n < l2.nf; n++) du = Math.max(du, Math.abs(s2.ux[n] - U0), Math.abs(s2.uy[n]), Math.abs(s2.uz[n]));
    ok(du < 1e-9 * U0 * 1e3, `uniform flow through a slip-walled box stays uniform (largest deviation ${(du / U0).toExponential(1)} of U)`);
    // plane Poiseuille: plates at y = 0 and H (bounce-back), plug inflow, outlet pressure; 2D slab (periodic z)
    const H = 16, Lx = 12 * H, cx = Lx + 2, k3 = new Int32Array(cx * H);
    for (let j = 0; j < H; j++) { k3[cx * j] = 1; k3[cx - 1 + cx * j] = 2; }
    const Ub = 0.004, nu = 1 / 6, l3 = FL.buildLattice({ nx: cx, ny: H, nz: 1, kind: k3, periodic: [false, false, true], groups: [null, { type: 'velocity', u: [Ub, 0, 0] }, { type: 'pressure', rho: 1 }] });
    const s3 = FL.makeState(l3, { tau: 3 * nu + 0.5 });
    const r3 = FL.run(s3, { maxSteps: 60000, tol: 1e-9, every: 200 });
    const at = (i, j) => l3.index[i + cx * j];
    const xi = 1 + 8 * H;
    // the weakly compressible lattice carries ρu, so compare with the local mean speed and density (they differ from Ū by the ~0.5 % density change)
    const mean = (i, arr) => { let s = 0; for (let j = 0; j < H; j++) s += arr[at(i, j)]; return s / H; };
    const um = mean(xi, s3.ux);
    let pe = 0; for (let j = 0; j < H; j++) { const y = j + 0.5, ex = 6 * um * y * (H - y) / (H * H); pe = Math.max(pe, Math.abs(s3.ux[at(xi, j)] - ex) / (1.5 * um)); }
    const i1 = 1 + 5 * H, i2 = 1 + 10 * H, grad = (mean(i1, s3.rho) - mean(i2, s3.rho)) / 3 / (i2 - i1), exact = 12 * nu * mean(xi, s3.rho) * um / (H * H);
    ok(r3.converged && pe < 5e-3 && Math.abs(grad / exact - 1) < 0.01, `plane Poiseuille, ${H} cells across, bounce-back plates: profile within ${(100 * pe).toFixed(4)} % of 6ū y(H−y)/H² (of the top speed), pressure gradient ${pct(grad, exact)} vs 12μū/H²; mean speed ${pct(um, Ub)} off the inlet's (density change) (${r3.steps} steps)`);
  }

  section('flow: lid-driven cavity, Re 100, vs Ghia et al. 1982');
  {
    const N = 64, nx = N, ny = N + 1, U = 0.1, kind = new Int32Array(nx * ny);
    for (let i = 0; i < nx; i++) kind[i + nx * N] = 1;
    const lat = FL.buildLattice({ nx, ny, nz: 1, kind, periodic: [false, false, true], groups: [null, { type: 'velocity', u: [U, 0, 0] }] });
    const st = FL.makeState(lat, { tau: 3 * (U * N / 100) + 0.5 });
    const t0 = Date.now(), r = FL.run(st, { maxSteps: 60000, tol: 1e-8, every: 200 });
    const u = (i, j) => st.ux[lat.index[i + nx * j]] / U, v = (i, j) => st.uy[lat.index[i + nx * j]] / U;
    const prof = (fn, top, y) => { const s = y * N - 0.5; if (s <= 0) return fn(0) * (y * N) / 0.5; if (s >= N - 1) return fn(N - 1) + (top - fn(N - 1)) * (s - (N - 1)) / 0.5; const j = Math.floor(s), t = s - j; return fn(j) * (1 - t) + fn(j + 1) * t; };
    const uc = (j) => 0.5 * (u(N / 2 - 1, j) + u(N / 2, j)), vc = (i) => 0.5 * (v(i, N / 2 - 1) + v(i, N / 2));
    let eu = 0, ev = 0;
    for (const [y, g] of GHIA_U) eu = Math.max(eu, Math.abs(prof(uc, 1, y) - g));
    for (const [x, g] of GHIA_V) ev = Math.max(ev, Math.abs(prof(vc, 0, x) - g));
    let m = 0; for (let n = 0; n < lat.nf; n++) m += st.rho[n];
    ok(r.converged && eu < 0.01 && ev < 0.01, `${N} × ${N} cells: centre-line u within ${(100 * eu).toFixed(2)} % of U and v within ${(100 * ev).toFixed(2)} % of U of Ghia's 17 + 17 points (${r.steps} steps, ${Date.now() - t0} ms)`);
    ok(Math.abs(m - lat.nf) < 1e-8, `mass is conserved exactly in the closed cavity (total ${m.toFixed(10)} for ${lat.nf} cells)`);
  }

  /** Schäfer–Turek 2D-1 on a slab: D cells per diameter → { cd, cl, dp, steps } */
  const turek = (D, { Um = 0.075, interp = true, tol = 1e-7 } = {}) => {
    const H = Math.round(4.1 * D), nx = 22 * D + 2, ny = H, R = D / 2, cx = 1 + 2 * D, cy = 2 * D;
    const kind = new Int32Array(nx * ny);
    for (let j = 0; j < ny; j++) { kind[nx * j] = 1; kind[nx - 1 + nx * j] = 2; for (let i = 1; i < nx - 1; i++) if (Math.hypot(i + 0.5 - cx, j + 0.5 - cy) < R) kind[i + nx * j] = -1; }
    const Ub = 2 * Um / 3, nu = Ub * D / 20;
    const wallGroup = (c, q) => {
      const x = (c % nx) + 0.5 - cx, y = Math.floor(c / nx) + 0.5 - cy, dx = FL.CX[q], dy = FL.CY[q];
      const a = dx * dx + dy * dy, b = 2 * (x * dx + y * dy), cc = x * x + y * y - R * R, disc = b * b - 4 * a * cc;
      if (disc < 0) return null; const t = (-b - Math.sqrt(disc)) / (2 * a);
      return interp && t > 0 && t <= 1 ? { g: 0, q: t } : null;
    };
    const lat = FL.buildLattice({ nx, ny, nz: 1, kind, periodic: [false, false, true], wallGroup, groups: [null, { type: 'velocity', u: [Ub, 0, 0] }, { type: 'pressure', rho: 1 }], profile: (g, i, j) => { const y = j + 0.5; return [4 * Um * y * (H - y) / (H * H), 0, 0]; } });
    const st = FL.makeState(lat, { tau: 3 * nu + 0.5 });
    const r = FL.run(st, { maxSteps: 200000, tol, every: 200, minSteps: 3 * nx / Ub });
    const bs = FL.boundaryStats(st);
    const row = (i) => 0.5 * (st.rho[lat.index[i + nx * (cy - 1)]] + st.rho[lat.index[i + nx * cy]]);
    const fi = Math.floor(cx - R - 0.5), bi = Math.ceil(cx + R - 0.5);
    const front = row(fi) + (row(fi) - row(fi - 1)) * ((cx - R) - (fi + 0.5)), back = row(bi) + (row(bi) - row(bi + 1)) * ((bi + 0.5) - (cx + R));
    return { cd: 2 * bs.force[0] / (Ub * Ub * D), cl: 2 * bs.force[1] / (Ub * Ub * D), dp: (front - back) / 3 / (Ub * Ub) * 0.04, steps: r.steps, converged: r.converged };
  };
  section('flow: cylinder in a channel, Schäfer & Turek 1996 benchmark 2D-1 (Re 20)');
  {
    const t0 = Date.now(), a = turek(10);
    ok(a.converged && a.cd > 5.5795 * 0.985 && a.cd < 5.5795 * 1.015, `10 cells per diameter, interpolated walls: Cd ${a.cd.toFixed(4)} vs 5.5795 (${pct(a.cd, 5.5795)}; published band 5.57–5.59; ${a.steps} steps, ${Date.now() - t0} ms)`);
    ok(Math.abs(a.dp / 0.11752 - 1) < 0.08, `pressure difference front to back ${a.dp.toFixed(4)} vs 0.11752 (${pct(a.dp, 0.11752)}; extrapolated from the cells nearest the surface)`);
    log(`2D-1 lift coefficient ${a.cl.toFixed(4)} vs 0.010618 (small and sensitive: reported, not checked)`);
    log('2D-1 is confined (blockage D/H = 0.24, parabolic inflow, Cd on the mean speed), so its Cd is 5.58, not the ≈ 2.05 of an unconfined cylinder at Re 20 (Dennis & Chang 1970; Fornberg 1980)');
    if (long) {
      const b = turek(20);
      ok(b.converged && Math.abs(b.cd / 5.5795 - 1) < 0.01, `20 cells per diameter: Cd ${b.cd.toFixed(4)} (${pct(b.cd, 5.5795)}), Δp ${b.dp.toFixed(4)} (${pct(b.dp, 0.11752)}), Cl ${b.cl.toFixed(4)}`);
      const c = turek(10, { interp: false });
      log(`bounce-back walls (staircase) at 10 cells: Cd ${c.cd.toFixed(4)} (${pct(c.cd, 5.5795)})`);
    }
  }

  // ---------------------------------------------------------------- the product path on OCCT parts
  /** A block W × W × L (z) with a through bore Ø d; caps of thickness t over both ends when capped. */
  const pipePart = (d, L, { W = 20, cap = 0 } = {}) => {
    const part = P.newPart('Pipe');
    const sk = S.newSketch(); S.addRect(sk, [-W / 2, -W / 2], [W / 2, W / 2]); S.addCircle(sk, [0, 0], d / 2);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: L });
    if (cap) for (const z of [-cap, L]) {
      const c = S.newSketch(); S.addRect(c, [-W / 2, -W / 2], [W / 2, W / 2]);
      const sc = P.addFeature(part, 'sketch', { plane: { kind: 'fixed', n: [0, 0, 1], o: [0, 0, z] }, sketch: c });
      P.addFeature(part, 'extrude', { sketch: sc.id, op: 'add', end: 'blind', depth: cap });
    }
    const regen = B.regenerateBrep(part, oc);
    const face = (n, z = null) => regen.faces.findIndex((f) => f.type === 'plane' && f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] > 0.999 && (z === null || Math.abs(f.o[2] - z) < 1e-6 || Math.abs(f.at[2] - z) < 1e-6));
    return { part, regen, face };
  };
  const studyOf = (regen, openings, extra = {}) => {
    const st = SIM.newSimStudy(); st.kind = 'flow'; st.flow = FS.newFlow();
    Object.assign(st.flow, extra);
    st.flow.openings = openings.map((o, i) => ({ id: 'o' + (i + 1), ...o, faces: o.faces.map((fi) => B.faceRef(regen.faces[fi])) }));
    return SIM.readSimStudy(st);
  };
  const hpCase = (h, L = 40) => {
    const { regen, face } = pipePart(10, L);
    const st = studyOf(regen, [{ role: 'inlet', faces: [face([0, 0, -1])], spec: 'velocity', value: 0.001 }, { role: 'outlet', faces: [face([0, 0, 1])], p: 0 }], { h, fluid: 'water' });
    const { job, problems } = FS.flowJob(st, regen);
    const t0 = Date.now(), r = FW.solveFlow(job);
    if (problems.length || !r.converged) log(`pipe h ${h}: problems ${problems.join('; ')}, converged ${r.converged}, residual ${r.res}, steps ${r.steps}`);
    const F = r.fields, mu = 1.0016e-3, R = 0.005, Qex = 0.001 * Math.PI * R * R, zmin = regen.stats.bbox.min[2];
    const cz = (z) => Math.floor((z - F.origin[2]) / F.h);
    const sec = (k) => { let s = 0, n = 0; for (let j = 0; j < F.ny; j++) for (let i = 0; i < F.nx; i++) { const e = i + F.nx * (j + F.ny * k); if (F.mask[e] === 1) { s += F.p[e]; n++; } } return s / n; };
    const k1 = cz(zmin + 0.4 * L), k2 = cz(zmin + 0.85 * L);
    const grad = (sec(k1) - sec(k2)) / ((k2 - k1) * F.h / 1000), hp = 8 * mu * Qex / (Math.PI * R ** 4);
    let pe = 0; const km = cz(zmin + 0.6 * L);
    for (let j = 0; j < F.ny; j++) for (let i = 0; i < F.nx; i++) { const e = i + F.nx * (j + F.ny * km); if (F.mask[e] !== 1) continue; const rr = Math.hypot(F.origin[0] + (i + 0.5) * F.h, F.origin[1] + (j + 0.5) * F.h) / 5; pe = Math.max(pe, Math.abs(F.vz[e] - 0.002 * (1 - rr * rr)) / 0.002); }
    return { r, problems, grad, hp, pe, ms: Date.now() - t0, Qex, regen, face };
  };

  section('flow: pipe through the part (flow-domain.js, flow-worker.js) vs Hagen–Poiseuille');
  const fine = hpCase(0.5);
  {
    const { r, problems } = fine;
    ok(!problems.length && r.converged, `a 20 × 20 × 40 block with a Ø10 bore, water at 1 mm/s (Re ${r.Re.toFixed(2)}), 0.5 mm cells: ${r.mesh.fluid.toLocaleString('en-US')} fluid cells, converged in ${r.steps} steps, ${fine.ms} ms`);
    const inl = r.openings[0], out = r.openings[1];
    ok(inl.modes[0] === 'lid' && out.modes[0] === 'lid' && Math.abs(inl.area / (Math.PI * 25e-6) - 1) < 2e-3, `both rims found as lids; the inlet's hole area from the face's boundary loops is ${(inl.area * 1e6).toFixed(3)} mm² vs π·5² = ${(Math.PI * 25).toFixed(3)} (${pct(inl.area, Math.PI * 25e-6)}, the tessellation)`);
    ok(Math.abs(inl.flow / (0.001 * inl.area) - 1) < 1e-9 && Math.abs(inl.mass / (998.21 * fine.Qex) - 1) < 3e-3, `the inlet carries exactly velocity × opening area: ${(inl.flow * 6e7).toFixed(4)} mL/min (${pct(inl.mass, 998.21 * fine.Qex)} vs ρ·U·πR²)`);
    ok(Math.abs(fine.grad / fine.hp - 1) < 0.01, `developed pressure gradient ${fine.grad.toFixed(4)} Pa/m vs Hagen–Poiseuille 8μQ/(πR⁴) = ${fine.hp.toFixed(4)} (${pct(fine.grad, fine.hp)})`);
    ok(fine.pe < 0.03, `velocity profile within ${(100 * fine.pe).toFixed(2)} % (of the centre speed 2U) of 2U(1 − r²/R²) across the bore`);
    const bal = (r.massIn - r.massOut) / r.massIn;
    ok(Math.abs(bal) < 1e-4 && r.wallLeak === 0, `mass balance: in − out = ${(100 * bal).toExponential(2)} % of the inflow (interpolated walls with the local mass correction pass none)`);
    ok(r.dp > 0 && r.dp > fine.hp * 0.04 * 0.9, `pressure drop inlet to outlet ${r.dp.toExponential(4)} Pa (the developed part alone is ${(fine.hp * 0.04).toExponential(4)}; the rest is the entrance from a uniform inflow)`);
    ok(r.surfP.length === r.plotMesh.positions.length / 3 && Array.from(r.surfP).some(Number.isFinite) && Array.from(r.surfP).some((v) => !Number.isFinite(v)), 'surface pressure: on the bore (fluid side) a value per plot vertex, on the outside faces none');
    ok(r.inletCells.length > 200 && r.Re > 9 && r.Re < 11, `${r.inletCells.length} streamline seed cells at the inlet; Reynolds number ${r.Re.toFixed(3)} = ρUD/μ ${(998.21 * 0.001 * 0.01 / 1.0016e-3).toFixed(3)} (on the equivalent diameter of the opening)`);
    const lines = FL.streamlines(r.fields, [[0, 0, fine.regen.stats.bbox.min[2] + 1]], {});
    const last = lines[0] && lines[0].points.slice(-3);
    ok(lines.length === 1 && last && last[2] > fine.regen.stats.bbox.max[2] - 2 && Math.hypot(last[0], last[1]) < 0.5, `a streamline from the axis at the inlet runs straight down the bore to the outlet (ends at z ${last ? last[2].toFixed(2) : '?'})`);
    // bounce-back walls: no leak at all
    const { regen, face } = fine;
    const sb = studyOf(regen, [{ role: 'inlet', faces: [face([0, 0, -1])], spec: 'velocity', value: 0.001 }, { role: 'outlet', faces: [face([0, 0, 1])], p: 0 }], { h: 1, fluid: 'water', wall: 'bounce', tol: 1e-9 });
    const rb = FW.solveFlow(FS.flowJob(sb, regen).job);
    ok(Math.abs(rb.massIn - rb.massOut) / rb.massIn < 1e-6 && rb.wallLeak === 0, `with bounce-back walls (run to 1e-9) the mass balance closes to ${(Math.abs(rb.massIn - rb.massOut) / rb.massIn).toExponential(1)} (no wall leak)`);
  }
  section('flow: grid convergence on the pipe (pressure gradient vs Hagen–Poiseuille)');
  {
    const cases = [hpCase(1), hpCase(2 / 3), fine];
    const e = cases.map((c) => c.grad / c.hp - 1);
    log('cells across the bore 10 / 15 / 20: pressure gradient ' + e.map((x) => (100 * x).toFixed(2) + ' %').join(' / ') + '; profile ' + cases.map((c) => (100 * c.pe).toFixed(2) + ' %').join(' / ') + '; fluid cells ' + cases.map((c) => c.r.mesh.fluid).join(' / ') + '; ' + cases.map((c) => c.ms + ' ms').join(' / '));
    ok(Math.abs(e[2]) < 0.01 && Math.abs(e[1]) < 0.02 && Math.abs(e[0]) < 0.04, `pressure-gradient errors ${e.map((x) => (100 * x).toFixed(2) + ' %').join(', ')} at 10, 15 and 20 cells across: all within 4 %, the finest within 1 %`);
    ok(cases[2].pe <= cases[0].pe + 1e-9, `the velocity-profile error falls as the cells shrink (${(100 * cases[0].pe).toFixed(2)} → ${(100 * cases[2].pe).toFixed(2)} %)`);
  }

  section('flow: openings, caps and refusals');
  {
    // volume flow inlet
    const { regen, face } = fine;
    const sq = studyOf(regen, [{ role: 'inlet', faces: [face([0, 0, -1])], spec: 'flow', value: 1e-7 }, { role: 'outlet', faces: [face([0, 0, 1])], p: 100 }], { h: 1, fluid: 'water' });
    const rq = FW.solveFlow(FS.flowJob(sq, regen).job);
    ok(Math.abs(rq.openings[0].flow / 1e-7 - 1) < 1e-9 && Math.abs(rq.openings[1].p - 100) < 0.05 * Math.abs(rq.dp), `a volume-flow inlet carries exactly 0.1 mL/s (${(rq.openings[0].flow * 1e6).toFixed(6)} mL/s); the outlet holds its 100 Pa (mean ${rq.openings[1].p.toFixed(4)} Pa half a cell inside, Δp ${rq.dp.toFixed(4)} Pa)`);
    // capped pipe: the inlet on the inner face of a modelled cap
    const cp = pipePart(10, 30, { cap: 2 });
    const inner = cp.regen.faces.findIndex((f) => f.type === 'plane' && f.n[2] > 0.999 && Math.abs(f.at[2]) < 1e-6 && Math.hypot(f.at[0], f.at[1]) < 1e-6);
    const outer = cp.face([0, 0, -1, 0]);
    void outer;
    const outInner = cp.regen.faces.findIndex((f) => f.type === 'plane' && f.n[2] < -0.999 && Math.abs(f.at[2] - 30) < 1e-6 && Math.hypot(f.at[0], f.at[1]) < 1e-6);
    ok(inner >= 0 && outInner >= 0, 'the capped pipe has the caps\' inner discs as faces');
    const sc = studyOf(cp.regen, [{ role: 'inlet', faces: [inner], spec: 'velocity', value: 0.001 }, { role: 'outlet', faces: [outInner], p: 0 }], { h: 1, fluid: 'water' });
    const rc = FW.solveFlow(FS.flowJob(sc, cp.regen).job);
    ok(rc.openings[0].modes[0] === 'cap' && Math.abs(rc.openings[0].area / (Math.PI * 25e-6) - 1) < 2e-3 && Math.abs(rc.openings[0].flow / (0.001 * rc.openings[0].area) - 1) < 1e-9 && rc.converged, `an inlet on a cap's inner face (cap mode): ${(rc.openings[0].flow * 6e7).toFixed(4)} mL/min = U × the face's exact area, converged, Δp ${rc.dp.toExponential(3)} Pa`);
    // an open opening: the cavity reaches the outside
    const so = studyOf(regen, [{ role: 'inlet', faces: [face([0, 0, -1])], spec: 'velocity', value: 0.001 }, { role: 'outlet', faces: [regen.faces.findIndex((f) => f.type === 'plane' && f.n[0] > 0.999)], p: 0 }], { h: 1 });
    ok(throws(() => FW.solveFlow(FS.flowJob(so, regen).job), /No closed fluid space/), 'an opening left open (the outlet put on an outside face) is refused: "No closed fluid space …"');
    const none = studyOf(regen, [], {});
    const pr = FS.flowJob(none, regen, { check: true }).problems;
    ok(pr.some((p) => /Add an inlet/.test(p)) && pr.some((p) => /Add an outlet/.test(p)), 'a study without openings lists "Add an inlet" and "Add an outlet"');
    const gone = JSON.parse(JSON.stringify(sq)); gone.flow.openings[0].faces[0].name = 'f99.top';
    ok(FS.flowJob(gone, regen, { check: true }).problems.some((p) => /gone/.test(p)), 'a face that is gone is named, never moved');
    // too fast for the cells: refused with the reason
    const fast = studyOf(regen, [{ role: 'inlet', faces: [face([0, 0, -1])], spec: 'velocity', value: 50 }, { role: 'outlet', faces: [face([0, 0, 1])], p: 0 }], { h: 1, fluid: 'water' });
    ok(throws(() => FW.solveFlow(FS.flowJob(fast, regen).job), /cells are too large/), 'water at 50 m/s in 1 mm cells (cell Reynolds number 50,000) is refused: "The cells are too large …"');
  }

  section('flow: sphere in an external box (Re 20) vs the standard drag curve');
  {
    const part = P.newPart('Sphere'), R = 4;
    const sk = S.newSketch();
    S.addLine(sk, [0, -R - 2], [0, R + 2], { construction: true });
    S.addArc(sk, [0, 0], [0, -R], [0, R]);
    S.addLine(sk, [0, R], [0, -R]);
    const f1 = P.addFeature(part, 'sketch', { sketch: sk });
    P.addFeature(part, 'revolve', { sketch: f1.id, op: 'add', angle: 360 });
    const regen = B.regenerateBrep(part, oc);
    ok(regen.stats && Math.abs(regen.stats.volume / (4 / 3 * Math.PI * R ** 3) - 1) < 1e-3, `a Ø${2 * R} sphere by revolve (${regen.stats ? regen.stats.volume.toFixed(2) : '?'} mm³)`);
    const nuA = FL.fluidById('air').viscosity / FL.fluidById('air').density, Ui = 20 * nuA / (2 * R / 1000);
    const st = studyOf(regen, [], { type: 'external', h: 8 / 6, fluid: 'air', ext: { speed: Ui, dir: [1, 0, 0], up: 16, down: 32, side: 16, refArea: null, lift: null } });
    const { job, problems } = FS.flowJob(st, regen);
    const t0 = Date.now(), r = FW.solveFlow(job);
    if (problems.length || !r.converged) log(`sphere: problems ${problems.join('; ')}, converged ${r.converged}, residual ${r.res}, steps ${r.steps}`);
    const sn = 24 / 20 * (1 + 0.15 * 20 ** 0.687);
    ok(!problems.length && r.converged && Math.abs(r.Re - 20) < 1e-6, `air at ${Ui.toFixed(4)} m/s (Re ${r.Re.toFixed(2)}), 6 cells per diameter, box 2D up / 4D down / 2D aside: ${r.mesh.fluid.toLocaleString('en-US')} cells, converged in ${r.steps} steps, ${Date.now() - t0} ms`);
    ok(Math.abs(r.ext.refArea / (Math.PI * R * R) - 1) < 0.01, `reference area = the frontal area from the mesh, ${r.ext.refArea.toFixed(3)} mm² vs πR² ${(Math.PI * R * R).toFixed(3)} (${pct(r.ext.refArea, Math.PI * R * R)})`);
    ok(r.ext.cd > sn * 0.85 && r.ext.cd < sn * 1.3, `Cd ${r.ext.cd.toFixed(3)} vs Schiller–Naumann 24/Re(1 + 0.15 Re^0.687) = ${sn.toFixed(3)} (${pct(r.ext.cd, sn)}; coarse cells and a 3 % blockage box: a plausibility band of −15/+30 %)`);
    ok(Math.abs(r.ext.cl) < 0.03 * r.ext.cd && Math.abs(r.force[2]) < 0.03 * Math.abs(r.force[0]), `a symmetric body has next to no lift (Cl ${r.ext.cl.toExponential(2)}, side force ${(r.force[2] / r.force[0] * 100).toFixed(2)} % of drag)`);
    ok(Math.abs((r.massIn - r.massOut) / r.massIn) < 0.01, `mass balance through the box: ${(100 * (r.massIn - r.massOut) / r.massIn).toFixed(3)} % (the sphere's interpolated walls ${(100 * r.wallLeak / r.massIn).toFixed(3)} %)`);
  }
  if (long) {
    section('flow: unconfined cylinder, Re 20 (long)');
    const D = 10, up = 10 * D, down = 20 * D, side = 10 * D, nx = up + down + 2, ny = 2 * side + 2, R = D / 2, cx = 1 + up, cy = 1 + side;
    const kind = new Int32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const e = i + nx * j; if (i === 0) kind[e] = 1; else if (i === nx - 1) kind[e] = 2; else if (j === 0 || j === ny - 1) kind[e] = 3; else if (Math.hypot(i + 0.5 - cx, j + 0.5 - cy) < R) kind[e] = -1; }
    const Ub = 0.05, nu = Ub * D / 20;
    const wallGroup = (c, q) => { const x = (c % nx) + 0.5 - cx, y = Math.floor(c / nx) + 0.5 - cy, dx = FL.CX[q], dy = FL.CY[q], a = dx * dx + dy * dy, b = 2 * (x * dx + y * dy), cc = x * x + y * y - R * R, d = b * b - 4 * a * cc; if (d < 0) return null; const t = (-b - Math.sqrt(d)) / (2 * a); return t > 0 && t <= 1 ? { g: 0, q: t } : null; };
    const lat = FL.buildLattice({ nx, ny, nz: 1, kind, periodic: [false, false, true], wallGroup, groups: [null, { type: 'velocity', u: [Ub, 0, 0] }, { type: 'pressure', rho: 1 }, { type: 'slip', axis: 1 }] });
    const st = FL.makeState(lat, { tau: 3 * nu + 0.5, u0: [Ub, 0, 0] });
    const r = FL.run(st, { maxSteps: 200000, tol: 1e-7, every: 200, minSteps: 3 * nx / Ub });
    const cd = 2 * FL.boundaryStats(st).force[0] / (Ub * Ub * D);
    log(`unconfined cylinder (box 30D × 20D, slip sides, blockage 5 %), 10 cells per diameter: Cd ${cd.toFixed(3)} (Dennis & Chang 1970: 2.045; Fornberg 1980: 2.00; Tritton 1959 experiment ≈ 2.1); ${r.steps} steps`);
    ok(r.converged && cd > 1.95 && cd < 2.35, `unconfined Re 20 Cd ${cd.toFixed(3)} within 2.0–2.35 (2.0–2.1 published unconfined; a 5 % blockage raises it)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose'), LONG = process.argv.includes('--long');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runFlowTests({ ok, section, near, long: LONG });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
