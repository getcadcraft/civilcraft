#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-simulation.mjs — PartCraft's Simulation and Generative kernels (voxel.js, fea.js, mg.js, topopt.js,
 * materials.js, sim.js, sim-worker.js), checked against closed-form references:
 *   cantilever tip deflection PL³/3EI (and Timoshenko's + PL/κGA) converging as the mesh refines (both element
 *   types, errors printed), axial bar PL/AE, reactions = loads, a plate with a hole (Heywood's Kt), symmetry,
 *   self-weight wL⁴/8EI, pressure × exact area, the first bending frequency of a cantilever, rigid-body detection;
 *   topology optimisation: MBB beam (compliance falling, volume met within 1 %), a symmetric problem giving a
 *   symmetric design, preserve/obstacle regions, a closed iso-surface, STL, and the faceted solid imported back
 *   into a part through the exact kernel.
 *   node tools/partcraft-test/test-simulation.mjs [--verbose]     (or runSimulationTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');
const TMP = path.join(REPO, 'tmp/partcraft-sim');

export async function runSimulationTests({ ok, section, near, oc = null, log = (m) => console.log('  note ' + m) }) {
  const MAT = await import(DEV + 'materials.js');
  const VX = await import(DEV + 'voxel.js');
  const FE = await import(DEV + 'fea.js');
  const MG = await import(DEV + 'mg.js');
  const TO = await import(DEV + 'topopt.js');
  const SIM = await import(DEV + 'sim.js');
  const SW = await import(DEV + 'sim-worker.js');
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const B = await import(DEV + 'brep.js');
  const X = await import(DEV + 'export.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(2)} %`;
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  fs.mkdirSync(TMP, { recursive: true });

  /** An exact-kernel block L (x) × H (y) × W (z), optionally with a through hole Ø d at (cx, cy) → { regen, face(n, at?) } */
  const block = (L, H, W, hole = null) => {
    const part = P.newPart('Block');
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [L, H]);
    if (hole) S.addCircle(sk, [hole.cx, hole.cy], hole.d / 2);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: W });
    const regen = B.regenerateBrep(part, oc);
    // the plane face with this outward normal (and nearest this point)
    const face = (n, at = null) => {
      let best = -1, bd = Infinity;
      regen.faces.forEach((f, i) => { if (f.type !== 'plane' || f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] < 0.999) return; const d = at ? Math.hypot(f.at[0] - at[0], f.at[1] - at[1], f.at[2] - at[2]) : 0; if (d < bd) { bd = d; best = i; } });
      return best;
    };
    const zMin = regen.stats.bbox.min[2];
    return { part, regen, face, zMin };
  };

  section('simulation: materials (materials.js)');
  {
    ok(MAT.MATERIALS.length === 7 && ['steel', 'ss304', 'al6061', 'ti64', 'abs', 'pla', 'nylon'].every((id) => MAT.materialById(id)), 'seven library materials: steel, stainless 304, aluminum 6061-T6, Ti-6Al-4V, ABS, PLA, nylon');
    const al = MAT.materialById('al6061'), st = MAT.materialById('steel');
    ok(al.E === 68900 && al.nu === 0.33 && al.density === 2700 && al.yield === 276 && st.E === 200000 && st.yield === 250, 'values as cited (6061-T6 68.9 GPa / 0.33 / 2700 / 276 MPa; A36 200 GPa / 250 MPa)');
    ok(MAT.MATERIALS.every((m) => m.E > 0 && m.nu > 0 && m.nu < 0.5 && m.density > 0 && m.yield > 0), 'every material is physical (0 < ν < 0.5)');
    ok(throws(() => MAT.readMaterial({ name: 'x', E: 1000, nu: 0.5, density: 1000, yield: 10 }), /Poisson/) && throws(() => MAT.readMaterial('unobtainium'), /Unknown/), 'a custom material with ν = 0.5 and an unknown id are refused');
  }

  section('simulation: voxelizer (voxel.js)');
  const bar = block(100, 10, 10);
  {
    const g = VX.voxelize(bar.regen.mesh, { h: 2.5 });
    ok(g.nx === 40 && g.ny === 4 && g.nz === 4 && g.count === 640 && g.oddRows === 0 && near(g.origin[0], 0, 1e-9) && near(g.origin[2], bar.zMin, 1e-9), 'a 100 × 10 × 10 block at 2.5 mm: a 40 × 4 × 4 grid matching the box, all 640 cubes inside, no open rows');
    const end = bar.face([1, 0, 0]), top = bar.face([0, 1, 0]);
    const fe = VX.faceNodes(g, bar.regen.mesh, [end]), ft = VX.faceNodes(g, bar.regen.mesh, [top]);
    ok(fe.nodes.length === 25 && near(fe.area, 100, 1e-9) && fe.nodes.every((n) => near(VX.nodeXYZ(g, n)[0], 100, 1e-9)), 'the end face maps to its 5 × 5 grid nodes (edges included), tributary area 100 mm²');
    ok(ft.nodes.length === 41 * 5 && near(ft.area, 1000, 1e-9) && ft.nodes.every((n) => near(VX.nodeXYZ(g, n)[1], 10, 1e-9)), 'the top face: 41 × 5 nodes, area 1000 mm²; an edge node belongs to both faces');
    ok(Math.abs(fe.normal[0] - 1) < 1e-6 && Math.abs(ft.normal[4] - 1) < 1e-6, 'each node carries its picked face\'s outward normal');
    // the flange (curved faces, holes): voxel volume converges to the exact 302160π
    const F = await import(path.join(REPO, 'tools/partcraft-test/fixtures.mjs'));
    const fl = B.regenerateBrep(F.flange().part, oc);
    const errs = [4, 2, 1].map((h) => { const gf = VX.voxelize(fl.mesh, { h, surface: false }); return { h, err: gf.count * h ** 3 / (302160 * Math.PI) - 1, odd: gf.oddRows }; });
    log('flange voxel volume vs 302160π: ' + errs.map((e) => `h ${e.h}: ${(e.err * 100).toFixed(2)} %`).join(', '));
    ok(errs.every((e) => e.odd === 0) && Math.abs(errs[2].err) < 0.01 && Math.abs(errs[2].err) < Math.abs(errs[0].err), 'the flange voxelizes (no open rows) and its volume converges to 302160π (within 1 % at h 1)');
  }

  section('simulation: the hex element (fea.js)');
  {
    for (const type of ['h8', 'h8i']) {
      const { Ke } = FE.hexElement(0.3, type);
      let asym = 0; for (let i = 0; i < 24; i++) for (let j = 0; j < 24; j++) asym = Math.max(asym, Math.abs(Ke[i * 24 + j] - Ke[j * 24 + i]));
      const ev = FE.symEig(Ke, 24).values.sort((a, b) => a - b);
      ok(asym < 1e-12 && ev.slice(0, 6).every((v) => Math.abs(v) < 1e-10) && ev[6] > 1e-3, `${type}: symmetric, exactly six zero-energy modes (the rigid motions), the rest positive`);
    }
  }

  section('simulation: axial bar δ = PL/AE, patch test, reactions');
  {
    const steel = MAT.materialById('steel');
    for (const elem of ['h8i', 'h8']) {
      // the far end pulled 1000 N; the near end on frictionless supports (x held), plus one edge held so it cannot slide or spin
      const job = { mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 2.5, elem, bcs: {
        constraints: [{ type: 'frictionless', faces: [bar.face([-1, 0, 0])] }, { type: 'frictionless', faces: [bar.face([0, -1, 0])] }, { type: 'frictionless', faces: [bar.face([0, 0, -1])] }],
        loads: [{ type: 'force', faces: [bar.face([1, 0, 0])], total: 1000, dir: 'normal' }] } };
      job.bcs.loads[0].total = -1000;   // "normal" pushes into the face: −1000 pulls
      const r = FE.solveStudy(job);
      const d = 1000 * 100 / (100 * steel.E);
      const ux = r.u[3 * r.maxDisp.node];
      ok(rel(ux, d, 1e-6), `${elem}: free end moves PL/AE = ${d.toFixed(6)} mm (got ${ux.toFixed(6)}, ${pct(ux, d)})`);
      ok(rel(r.maxVm.value, 10, 1e-6) && rel(r.maxVmElem.value, 10, 1e-6), `${elem}: uniform stress σ = P/A = 10 MPa everywhere (patch test: max ${r.maxVm.value.toFixed(6)})`);
      ok(near(r.reaction[0] + r.loadTotal[0], 0, 1e-4) && near(r.reaction[1], 0, 1e-4) && near(r.reaction[2], 0, 1e-4), `${elem}: reactions balance the load (Σ = ${r.reaction.map((v) => v.toFixed(6)).join(', ')} N)`);
      ok(near(r.minSafety, 25, 1e-4), `${elem}: safety factor = yield / σ = 250 / 10 = 25`);
    }
  }

  section('simulation: cantilever vs Euler–Bernoulli (and Timoshenko)');
  let cantTip = null;
  {
    const E = 200000, nu = 0.26, I = 10 * 10 ** 3 / 12, L = 100, Pf = 100;
    const eb = Pf * L ** 3 / (3 * E * I), tim = eb + Pf * L / ((5 / 6) * (E / (2 * (1 + nu))) * 100);
    const rows = [];
    for (const elem of ['h8i', 'h8']) for (const h of [5, 2.5, 1.25]) {
      const r = FE.solveStudy({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h, elem, bcs: { constraints: [{ type: 'fixed', faces: [bar.face([-1, 0, 0])] }], loads: [{ type: 'force', faces: [bar.face([1, 0, 0])], total: Pf, dir: [0, -1, 0] }] } });
      rows.push({ elem, h, d: r.maxDisp.value, n: r.summary.elements, it: r.iterations, ms: r.ms, r });
    }
    log(`tip deflection, P 100 N, steel 100 × 10 × 10: Euler–Bernoulli ${eb.toFixed(5)} mm, Timoshenko ${tim.toFixed(5)} mm`);
    for (const w of rows) log(`  ${w.elem} h ${w.h} (${w.n} elements, ${w.it} CG iterations, ${w.ms} ms): ${w.d.toFixed(5)} mm = EB ${pct(w.d, eb)}, Timoshenko ${pct(w.d, tim)}`);
    const i = rows.filter((w) => w.elem === 'h8i'), s = rows.filter((w) => w.elem === 'h8');
    ok(i.every((w) => rel(w.d, eb, 0.01)), 'h8i (incompatible modes): within 1 % of PL³/3EI at every size, even 2 elements through the thickness');
    ok(Math.abs(i[2].d / tim - 1) < 0.005, 'h8i at 1.25 mm is within 0.5 % of Timoshenko (shear deformation included)');
    ok(s[0].d < s[1].d && s[1].d < s[2].d && Math.abs(s[2].d / eb - 1) < Math.abs(s[0].d / eb - 1) && s[0].d < 0.9 * eb, 'h8 (plain trilinear) is stiff in bending (> 10 % low at 2 through the thickness) and converges as it refines');
    ok(rows.every((w) => near(w.r.reaction[1], Pf, 1e-5) && near(w.r.reaction[0], 0, 1e-5)), 'reactions = the load at every size (Σ Ry = 100 N)');
    // bending stress at mid-span on the top surface: σ = M c / I = P (L/2)(5)/I
    const r = i[2].r, g = r.grid;
    const mid = VX.nodeXYZ(g, 0); void mid;
    const target = [50, 10, bar.zMin + 5];
    let best = -1, bd = Infinity;
    for (let n = 0; n < r.model.nn; n++) { if (!r.model.active[n]) continue; const p = VX.nodeXYZ(g, n); const d = Math.hypot(p[0] - target[0], p[1] - target[1], p[2] - target[2]); if (d < bd) { bd = d; best = n; } }
    const sMid = Pf * 50 * 5 / I;
    ok(rel(r.vmNode[best], sMid, 0.03), `von Mises at mid-span, top surface: ${r.vmNode[best].toFixed(3)} MPa vs M·c/I = ${sMid.toFixed(3)} (${pct(r.vmNode[best], sMid)})`);
    cantTip = i[1].d;
    // the worker op gives the same, plus values on the part mesh
    const w = SW.simSolve({ mesh: SIM.meshForJob(bar.regen.mesh), faces: bar.regen.faces.map((f) => ({ area: f.area })), material: MAT.materialById('steel'), h: 2.5, elem: 'h8i', kind: 'static', bcs: { constraints: [{ type: 'fixed', faces: [bar.face([-1, 0, 0])] }], loads: [{ type: 'force', faces: [bar.face([1, 0, 0])], total: Pf, dir: [0, -1, 0] }] } });
    let vmax = 0; for (const v of w.vertex.disp) vmax = Math.max(vmax, v);
    ok(rel(w.maxDisp.value, cantTip, 1e-6) && rel(vmax, cantTip, 1e-4) && w.vertex.vm.length === w.plotMesh.positions.length / 3 && w.plotMesh.indices.length > 100 * bar.regen.mesh.indices.length, `simSolve (the worker op): same tip deflection (${w.maxDisp.value.toFixed(6)}); the per-vertex plot (on the part mesh split to ≤ h: ${w.plotMesh.indices.length / 3} triangles) peaks at ${vmax.toFixed(5)} mm`);
  }

  section('simulation: multigrid = block Jacobi, a fixed-fixed beam is symmetric');
  {
    const g = VX.voxelize(bar.regen.mesh, { h: 2.5 });
    const model = FE.makeModel(g, { E: 200000, nu: 0.3 });
    const top = bar.face([0, 1, 0]);
    const bc = FE.boundaryConditions(model, bar.regen.mesh, { constraints: [{ type: 'fixed', faces: [bar.face([-1, 0, 0])] }, { type: 'fixed', faces: [bar.face([1, 0, 0])] }], loads: [{ type: 'pressure', faces: [top], p: 1 }] }, { exactArea: bar.regen.faces.map((f) => f.area) });
    ok(near(bc.loadTotal[1], -1000, 1e-9), 'a 1 MPa pressure on the 100 × 10 top face is exactly 1000 N, pushing in');
    const a = FE.pcg(model, bc.cons, bc.f, { tol: 1e-10 }), b = FE.pcg(model, bc.cons, bc.f, { tol: 1e-10, ...FE.preconditioner(model, bc.cons) });
    let diff = 0, mx = 0; for (let i = 0; i < a.u.length; i++) { diff = Math.max(diff, Math.abs(a.u[i] - b.u[i])); mx = Math.max(mx, Math.abs(a.u[i])); }
    ok(diff < 1e-7 * mx && b.iterations < a.iterations / 3, `multigrid-preconditioned CG gives the block-Jacobi answer (to ${(diff / mx).toExponential(1)}) in ${b.iterations} iterations instead of ${a.iterations}`);
    // mirror x → 100 − x
    let asym = 0;
    for (let k = 0; k <= g.nz; k++) for (let j = 0; j <= g.ny; j++) for (let i = 0; i <= g.nx; i++) {
      const n = i + (g.nx + 1) * (j + (g.ny + 1) * k), m = (g.nx - i) + (g.nx + 1) * (j + (g.ny + 1) * k);
      asym = Math.max(asym, Math.abs(b.u[3 * n + 1] - b.u[3 * m + 1]), Math.abs(b.u[3 * n] + b.u[3 * m]));
    }
    ok(asym < 1e-6 * mx, `the displacement field is mirror-symmetric about mid-span (to ${(asym / mx).toExponential(1)})`);
    // fixed-fixed beam, uniform load: centre deflection wL⁴/384EI (+ shear)
    const res = FE.postprocess(model, b.u, bc.f, bc.cons, {});
    const wl = 10, I = 10 * 1000 / 12, d = wl * 100 ** 4 / (384 * 200000 * I);
    log(`fixed-fixed beam, uniform 10 N/mm: centre ${res.maxDisp.value.toFixed(5)} mm vs wL⁴/384EI ${d.toFixed(5)} (${pct(res.maxDisp.value, d)}; shear adds more at L/h 10)`);
    ok(res.maxDisp.value > d && res.maxDisp.value < 1.25 * d && near(res.reaction[1], 1000, 1e-6), 'fixed-fixed beam: centre deflection above wL⁴/384EI by the shear share (< 25 %), reactions = 1000 N');
  }

  section('simulation: self-weight, a plate with a hole, modes, a body that is not held');
  {
    const steel = MAT.materialById('steel');
    const r = FE.solveStudy({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 2.5, bcs: { constraints: [{ type: 'fixed', faces: [bar.face([-1, 0, 0])] }], loads: [{ type: 'gravity', dir: [0, -1, 0] }] } });
    const w = MAT.tonnesPerMm3(steel.density) * MAT.G_MM * 100, I = 1000 * 10 / 12, d = w * 100 ** 4 / (8 * steel.E * I);
    ok(rel(r.reaction[1], w * 100, 1e-9) && rel(r.maxDisp.value, d, 0.02), `self-weight: reaction = ρ·g·V = ${(w * 100).toFixed(5)} N, tip ${r.maxDisp.value.toExponential(4)} mm vs wL⁴/8EI ${d.toExponential(4)} (${pct(r.maxDisp.value, d)})`);
    ok(rel(r.summary.mass, 0.0785, 1e-9), 'mass reported in kg: 100 × 10 × 10 mm of steel = 0.0785 kg');
    // plate 200 × 100 × 5, Ø20 hole in the middle, pulled 10 MPa along x: Heywood Kt(net) = 2 + (1 − d/W)³ = 2.512 → σmax = 2.512·σ·W/(W − d) = 31.4 MPa
    const pl = block(200, 100, 5, { cx: 100, cy: 50, d: 20 });
    const rp = FE.solveStudy({ mesh: pl.regen.mesh, faces: pl.regen.faces, material: 'steel', h: 1.25, bcs: {
      constraints: [{ type: 'frictionless', faces: [pl.face([-1, 0, 0])] }, { type: 'frictionless', faces: [pl.face([0, 0, -1])] }, { type: 'frictionless', faces: [pl.face([0, -1, 0])] }],
      loads: [{ type: 'pressure', faces: [pl.face([1, 0, 0])], p: -10 }] } });
    const kt = 2 + (1 - 0.2) ** 3, smax = kt * 10 * 100 / 80, at = rp.maxVm.at;
    const rAt = Math.hypot(at[0] - 100, at[1] - 50), ang = Math.abs(Math.atan2(at[1] - 50, at[0] - 100)) * 180 / Math.PI;
    log(`plate with a hole: max von Mises ${rp.maxVm.value.toFixed(2)} MPa at r ${rAt.toFixed(2)} mm, ${ang.toFixed(0)}° from the load axis; Heywood ${smax.toFixed(2)} MPa (${pct(rp.maxVm.value, smax)}; the voxel hole is a staircase)`);
    ok(rp.maxVm.value > 0.75 * smax && rp.maxVm.value < 1.35 * smax && rAt < 12 && ang > 60 && ang < 120, 'the stress peaks at the hole edge across the load (60–120° from it), within −25 %/+35 % of Heywood\'s Kt (a sanity check, not a convergence claim)');
    ok(near(rp.reaction[0], -10 * 500, 1e-4) && near(rp.loadTotal[0], 10 * 500, 1e-6), `and its supports react exactly the 5000 N pulled (${rp.reaction[0].toFixed(6)})`);
    // first bending frequency of the cantilever: f = (1.8751²/2π)·√(EI/(ρA L⁴))
    const m = FE.solveStudy({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 2.5, kind: 'modal', modes: 3, bcs: { constraints: [{ type: 'fixed', faces: [bar.face([-1, 0, 0])] }], loads: [] } });
    const f1 = 1.8751 ** 2 / (2 * Math.PI) * Math.sqrt(steel.E * I / (MAT.tonnesPerMm3(steel.density) * 100 * 100 ** 4));
    log(`cantilever modes: ${m.freqs.map((f) => f.toFixed(1)).join(', ')} Hz; Euler–Bernoulli first bending ${f1.toFixed(1)} Hz (${pct(m.freqs[0], f1)})`);
    ok(rel(m.freqs[0], f1, 0.03) && rel(m.freqs[1], m.freqs[0], 1e-3), 'first natural frequency within 3 % of Euler–Bernoulli; the square section\'s two bending modes coincide');
    ok(throws(() => FE.solveStudy({ mesh: bar.regen.mesh, faces: bar.regen.faces, material: 'steel', h: 5, bcs: { constraints: [{ type: 'frictionless', faces: [bar.face([-1, 0, 0])] }], loads: [{ type: 'force', faces: [bar.face([1, 0, 0])], total: 1, dir: 'normal' }] } }), /not held: it can still .*move along y/), 'one frictionless face only: refused, naming the free motions');
  }

  section('simulation: studies (sim.js)');
  {
    const st = { ...SIM.newSimStudy(), mesher: 'voxel' };   // the voxel path (new studies default to tets: test-tet.mjs)
    st.constraints.push({ id: 'c1', type: 'fixed', faces: [B.faceRef(bar.regen.faces[bar.face([-1, 0, 0])])] });
    st.loads.push({ id: 'l1', type: 'force', faces: [B.faceRef(bar.regen.faces[bar.face([1, 0, 0])])], total: 100, dir: [0, -1, 0] }, { id: 'l2', type: 'gravity', dir: [0, -1, 0] });
    ok(JSON.stringify(SIM.readSimStudy(JSON.parse(JSON.stringify(st)))) === JSON.stringify(st), 'a simulation study reads back unchanged');
    const bads = [{ ...st, kind: 'fatigue' }, { ...st, material: 'gold' }, { ...st, h: -1 }, { ...st, loads: [{ id: 'l1', type: 'force', faces: [{ name: '<script>', at: [0, 0, 0] }], total: 1, dir: 'normal' }] }, { ...st, loads: [{ id: 'l1', type: 'force', faces: [], total: Infinity, dir: 'normal' }] }, { ...st, constraints: Array(40).fill(st.constraints[0]) }, { ...st, loads: [st.loads[0], st.loads[0]] }];
    ok(bads.every((b) => throws(() => SIM.readSimStudy(JSON.parse(JSON.stringify(b, (k, v) => (v === Infinity ? 1e400 : v)))))), `${bads.length} tampered simulation studies refused (kind, material, size, face name, force, too many items, duplicate ids)`);
    const { job, problems, h } = SIM.simJob(st, bar.regen);
    ok(!problems.length && h === SIM.autoSize(bar.regen.stats.volume, SIM.AUTO_ELEMENTS.simulation) && job.bcs.constraints[0].faces[0] === bar.face([-1, 0, 0]), `simJob resolves the face references; automatic element size ${h} mm`);
    const gst = SIM.newGenStudy();
    gst.constraints = st.constraints; gst.loads = [st.loads[0]]; gst.preserve = [{ id: 'k1', faces: st.loads[0].faces, t: 3 }];
    ok(JSON.stringify(SIM.readGenStudy(JSON.parse(JSON.stringify(gst)))) === JSON.stringify(gst), 'a generative study reads back unchanged');
    ok(throws(() => SIM.readGenStudy({ ...gst, loads: [st.loads[1]] })) && throws(() => SIM.readGenStudy({ ...gst, volfracs: [0.99] })) && throws(() => SIM.readGenStudy({ ...gst, materials: [] })), 'gravity, a 99 % target and no materials are refused in a generative study');
    const gone = JSON.parse(JSON.stringify(st)); gone.constraints[0].faces[0].name = 'f99.end';
    ok(/gone/.test(SIM.simJob(gone, bar.regen).problems.join(' ')), 'a face that is gone is named as a problem, never moved');
  }

  section('generative: MBB beam, symmetry, regions, the surface (topopt.js)');
  {
    // half MBB beam, 60 × 20 × 1 elements: symmetry (x held) on the left, a roller under the right end, the load on the top-left corner
    const mbb = block(60, 20, 1), g0 = VX.voxelize(mbb.regen.mesh, { h: 1 });
    const node = (i, j, k) => i + 61 * (j + 21 * k);
    const job = { mesh: mbb.regen.mesh, h: 1, material: 'steel', volfrac: 0.5, rmin: 1.5, maxIter: 60, elem: 'h8',
      constraints: [{ type: 'frictionless', faces: [mbb.face([-1, 0, 0])] }, { type: 'frictionless', faces: [mbb.face([0, 0, -1])] }, { type: 'fixed', nodes: [node(60, 0, 0), node(60, 0, 1)], axes: [1] }],
      loads: [{ type: 'force', nodes: [node(0, 20, 0), node(0, 20, 1)], total: 1, dir: [0, -1, 0] }] };
    void g0;
    const t0 = Date.now();
    const r = TO.optimize(job);
    const c = r.history.map((h) => h.c);
    const rises = c.slice(1).filter((v, i) => v > c[i] * (1 + 1e-4)).length;
    log(`MBB 60 × 20: ${r.iterations} iterations in ${Date.now() - t0} ms, compliance ${c[0].toExponential(3)} → ${c[c.length - 1].toExponential(3)} N·mm`);
    ok(rises === 0 && c[c.length - 1] < 0.25 * c[0], 'MBB: compliance never rises (to 1e-4) and ends below a quarter of the uniform start');
    ok(r.history.every((h) => Math.abs(h.vol - 0.5) < 0.005), 'MBB: the volume constraint is met every iteration (within 1 % of 50 %)');
    let grey = 0; for (const v of r.x) if (v > 0.1 && v < 0.9) grey++;
    ok(grey / r.x.length < 0.4, `MBB: mostly black and white (${(100 * grey / r.x.length).toFixed(0)} % grey elements)`);
    const art = []; for (let j = 19; j >= 0; j -= 2) { let s = ''; for (let i = 0; i < 60; i += 1) s += r.x[i + 60 * j] > 0.5 ? '#' : ' '; art.push(s); }
    ok(r.x[0 + 60 * 19] > 0.9 && r.x[59 + 60 * 0] > 0.9 && r.x[30 + 60 * 10] < 0.5, 'MBB: solid at the load and the support, a hole mid-span (the classic truss)');
    if (process.argv.includes('--verbose')) console.log(art.join('\n'));
    const iso = TO.isoSurface(r.model, r.x);
    const chk = TO.meshCheck(iso.indices);
    ok(chk.closed && iso.volume > 0 && rel(iso.volume, iso.target, 0.01), `the iso-surface is closed and manifold (${iso.indices.length / 3} triangles), outward, enclosing the optimised volume (${iso.volume.toFixed(1)} vs ${iso.target.toFixed(1)} mm³, level ${iso.iso.toFixed(3)})`);
    // symmetric problem: a beam on two rollers, loaded in the middle, 40 × 10 × 4 → the design is mirror-symmetric
    const sb = block(40, 10, 4);
    const nd = (i, j, k) => i + 41 * (j + 11 * k);
    const ks = [0, 1, 2, 3, 4];
    const sym = TO.optimize({ mesh: sb.regen.mesh, h: 1, material: 'steel', volfrac: 0.4, rmin: 1.5, maxIter: 25, elem: 'h8',
      constraints: [{ type: 'fixed', nodes: ks.map((k) => nd(0, 0, k)), axes: [1] }, { type: 'fixed', nodes: ks.map((k) => nd(40, 0, k)), axes: [1] }, { type: 'fixed', nodes: [nd(20, 10, 0), nd(20, 10, 4)], axes: [0] }, { type: 'fixed', nodes: [nd(20, 10, 0)], axes: [2] }],
      loads: [{ type: 'force', nodes: ks.map((k) => nd(20, 10, k)), total: 10, dir: [0, -1, 0] }] });
    let sd = 0;
    for (let k = 0; k < 4; k++) for (let j = 0; j < 10; j++) for (let i = 0; i < 40; i++) sd = Math.max(sd, Math.abs(sym.x[i + 40 * (j + 10 * k)] - sym.x[(39 - i) + 40 * (j + 10 * k)]));
    ok(sd < 1e-3, `a symmetric problem gives a mirror-symmetric design (largest difference ${sd.toExponential(1)})`);
    // regions on the cantilever bar: keep 3 mm under the loaded end, keep the top face's neighbourhood empty
    const cj = { mesh: bar.regen.mesh, faces: bar.regen.faces, h: 2.5, material: 'al6061', volfrac: 0.3, rmin: 3.75, maxIter: 15,
      constraints: [{ type: 'fixed', faces: [bar.face([-1, 0, 0])] }], loads: [{ type: 'force', faces: [bar.face([1, 0, 0])], total: 100, dir: [0, -1, 0] }],
      preserve: [{ faces: [bar.face([1, 0, 0])], t: 3 }], obstacle: [{ box: { min: [40, 5, -100], max: [60, 100, 100] } }] };
    const cr = TO.optimize(cj);
    const keepOk = cr.model.elems.every((e, m) => { const p = VX.elemCentre(cr.grid, e); return p[0] < 97 || cr.x[m] === 1; });
    const voidOk = cr.model.elems.every((e) => { const p = VX.elemCentre(cr.grid, e); return p[0] < 40 || p[0] > 60 || p[1] < 5; });
    ok(keepOk && voidOk && cr.passive.some((v) => v), 'a preserve region (3 mm at the loaded face) stays solid; an obstacle box is removed from the design space');
    const ev = TO.evaluate(cj, cr);
    ok(ev.mass > 0 && ev.maxVm > 0 && Number.isFinite(ev.minSafety) && ev.maxDisp > 0 && ev.elements < cr.model.elems.length, `the outcome is re-solved as a solid: ${ev.mass.toFixed(4)} kg, max ${ev.maxVm.toFixed(1)} MPa, ${ev.maxDisp.toFixed(4)} mm, safety ${ev.minSafety.toFixed(2)}`);
    // outcomes: two volumes × two materials in one call (the worker op); materials share a shape. A 60 × 20 × 1 cantilever slab
    const slab = block(60, 20, 1);
    const gj = SIM.genJob({ ...SIM.newGenStudy(), h: 1, maxIter: 75, volfracs: [0.3, 0.5], materials: ['al6061', 'steel'],
      constraints: [{ id: 'c1', type: 'fixed', faces: [B.faceRef(slab.regen.faces[slab.face([-1, 0, 0])])] }], loads: [{ id: 'l1', type: 'force', faces: [B.faceRef(slab.regen.faces[slab.face([1, 0, 0])])], total: 100, dir: [0, -1, 0] }] }, slab.regen);
    const t2 = Date.now();
    const go = SW.genOutcomes({ job: gj.job, variants: gj.variants });
    const o = go.outcomes;
    log('outcomes: ' + o.map((x) => `${x.volfrac} ${x.material.id}: ${x.eval.mass.toFixed(4)} kg, ${x.eval.maxDisp.toFixed(4)} mm, ${x.eval.maxVm.toFixed(1)} MPa, vol ${x.eval.volume}`).join('; '));
    log(`genOutcomes: ${Date.now() - t2} ms`);
    ok(o.length === 4 && o[0].mesh.positions === o[1].mesh.positions && o[0].eval.volume === o[1].eval.volume && rel(o[1].eval.mass / o[0].eval.mass, 7850 / 2700, 1e-9) && rel(o[0].eval.maxDisp / o[1].eval.maxDisp, 200000 / 68900, 0.02), 'genOutcomes: 2 volumes × 2 materials; a material swap keeps the shape, scales mass by density and deflection by 1/E (ν differs: 2 %)');
    ok(o[2].eval.mass > o[0].eval.mass && o[2].eval.maxDisp < o[0].eval.maxDisp, 'more volume: heavier and stiffer');
    ok(o.every((x) => Math.abs(x.eval.volume / (60 * 20) - x.volfrac) < 0.03 * x.volfrac + 0.01), `each outcome holds its target volume (${o.map((x) => (100 * x.eval.volume / 1200).toFixed(1) + ' %').join(', ')})`);
    ok(o.every((x) => x.eval.grey < 0.05), `with the threshold projection the designs are black and white (grey elements ${o.map((x) => (100 * x.eval.grey).toFixed(1) + ' %').join(', ')})`);
    ok(o.every((x) => x.eval.compliance > 0 && rel(x.eval.compliance, x.finalC, 0.25)), `the solid design checked with incompatible-mode elements (softer in bending than the optimiser's plain hexes) is within 25 % of the optimiser's own compliance (${o.map((x) => pct(x.eval.compliance, x.finalC)).join(', ')})`);
    ok(o.every((x) => rel(x.mesh.volume, x.eval.volume, 0.01) && TO.meshCheck(x.mesh.indices).closed), `each surface is closed and holds the checked volume (${o.map((x) => pct(x.mesh.volume, x.eval.volume)).join(', ')})`);
    // STL and the exact kernel: the faceted surface as an imported solid in a part
    const m = o[0].mesh;
    const stl = X.stlBinary(m, 'outcome');
    fs.writeFileSync(path.join(TMP, 'outcome.stl'), stl);
    ok(stl.length === 84 + 50 * (m.indices.length / 3), `STL of the outcome: ${m.indices.length / 3} triangles`);
    const step = X.stepFaceted(m, 'Outcome').text;
    const part = P.newPart('Outcome');
    P.addFeature(part, 'import', { file: 'outcome.step', step, up: 'y' });
    const t1 = Date.now();
    const ri = B.regenerateBrep(part, oc);
    const st = [...ri.results.values()][0];
    ok(st.status === 'ok' && ri.stats && rel(ri.stats.volume, m.volume, 1e-3) && ri.stats.bodies === 1, `the outcome as an imported (faceted) solid through OpenCascade: ${st.status} ${st.message || ''} ${ri.stats ? ri.stats.bodies : ''} body, ${ri.stats ? ri.stats.volume.toFixed(1) : '?'} mm³ = the mesh's ${m.volume.toFixed(1)} (${Date.now() - t1} ms)`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runSimulationTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
