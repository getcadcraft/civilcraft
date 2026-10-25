/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-craftlib.mjs — CraftScript builder D: every check of the analysis library (docs/SCRIPTING-SPEC.md §4,
 * docs/apps/craftscript.md "The analysis library"). Picked up by bin/test-craftscript.mjs (`--lib` runs only this).
 *
 * Each check runs the library's own .craft files (craftlib/, looked up by name like the worker does) on a small case with
 * a known answer — closed forms (Euler–Bernoulli, the plane wall with generation, lumped capacitance, separation of
 * variables, ε w/d, μ0 n I, Poiseuille), the published top88 results — and, where PartCraft has a native study, the same
 * model through that study's own solver (fea.js solveStudy, tetfea.js solveTetStudy static + modal, topopt.js optimize),
 * called directly here with the same mesh and loads. Sizes are kept small so the whole section runs in well under a
 * minute or two in Node. Every result line prints the measured value, the reference and the error.
 */
import fs from 'node:fs';
import path from 'node:path';

export async function run(T) {
  const { ok, section, runCraft, DEV, DEVURL } = T;
  const LIB = path.join(DEV, 'craftlib');
  const library = (name) => {
    const f = path.join(LIB, name + '.craft');
    return /^[A-Za-z][A-Za-z0-9_]*$/.test(name) && fs.existsSync(f) ? { source: fs.readFileSync(f, 'utf8'), file: 'craftlib/' + name + '.craft' } : null;
  };
  const num = (v) => (typeof v === 'number' ? v : typeof v === 'boolean' ? +v : v && v.t === 'tensor' && v.data.length === 1 ? v.data[0] : NaN);
  const arr = (v) => (v && v.t === 'tensor' ? Array.from(v.data) : typeof v === 'number' ? [v] : []);
  const pct = (a, b) => 100 * (a / b - 1);
  const f = (x, d = 4) => (Number.isFinite(x) ? x.toFixed(d) : String(x));
  const times = [];
  /** Run CraftScript with the library; returns the workspace getter, fails the check on an error. */
  async function craft(label, src) {
    const t0 = Date.now();
    const r = await runCraft(src, { library, file: label + '.craft' });
    const ms = Date.now() - t0;
    times.push([label, ms]);
    if (!r.ok) { ok(false, `${label}: ${r.error.message} (line ${r.error.line}${r.error.file ? ' of ' + r.error.file : ''})`); return null; }
    return { get: (n) => r.ws.get(n), num: (n) => num(r.ws.get(n)), arr: (n) => arr(r.ws.get(n)), out: r.out, displays: r.displays, ms };
  }
  const tAll = Date.now();

  // ───────────────────────────────────────────────────────────── the index and the headers
  section('Library (builder D): index.json and file headers');
  let index = null;
  try { index = JSON.parse(fs.readFileSync(path.join(LIB, 'index.json'), 'utf8')); } catch (e) { ok(false, 'craftlib/index.json is valid JSON: ' + e.message); }
  if (index) {
    const items = (index.groups || []).flatMap((g) => (g.items || []).map((it) => ({ ...it, group: g.id })));
    const files = fs.readdirSync(LIB).filter((n) => n.endsWith('.craft')).map((n) => n.slice(0, -6));
    ok(Array.isArray(index.groups) && ['mesh', 'static', 'modal', 'thermal', 'topopt', 'em', 'fluid', 'examples'].every((g) => index.groups.some((x) => x.id === g)), `index.json has the groups mesh, static, modal, thermal, topopt, em, fluid and examples (${index.groups.map((g) => g.id).join(', ')})`);
    ok(items.every((it) => files.includes(it.name)) && files.every((n) => items.some((it) => it.name === n)), `every listed item has its .craft file and every .craft file is listed (${items.length} items)`);
    const need = ['box_mesh', 'cylinder_mesh', 'voxel_mesh', 'tet_mesh', 'mesh_quality', 'static_voxel', 'static_tet', 'modal_tet', 'heat_steady', 'heat_transient', 'top88', 'top99', 'topopt3d', 'poisson2d', 'magnetostatic2d', 'lbm2d', 'lbm3d'];
    ok(need.every((n) => items.some((it) => it.name === n)), 'the spec §4 minimum is there: ' + need.join(' '));
    const missing = [];
    for (const it of items.filter((x) => x.group !== 'examples')) {
      const src = fs.readFileSync(path.join(LIB, it.name + '.craft'), 'utf8');
      const head = src.split('\n').filter((l) => l.startsWith('%')).join('\n');
      for (const key of ['Usage:', 'Method:', 'Units:', 'References:', 'Check:']) if (!head.includes(key)) missing.push(`${it.name} ${key}`);
      if (!new RegExp(`^function .*\\b${it.name}\\(`, 'm').test(src)) missing.push(`${it.name}: no function ${it.name}`);
    }
    ok(!missing.length, 'every library file has a header with Usage, Method, Units, References and Check, and defines its own function' + (missing.length ? ': ' + missing.join('; ') : ''));
  }

  // ───────────────────────────────────────────────────────────── mesh
  section('Library: meshing');
  {
    const w = await craft('mesh', `
kinds = {'hex', 'voxel', 'tet4', 'tet10', 'surface'};
ne = zeros(1, 5); vol = zeros(1, 5);
for k = 1:5
  q = mesh_quality(box_mesh(100, 10, 10, 2.5, kinds{k}));
  ne(k) = q.elements; vol(k) = q.volume;
end
t = box_mesh(100, 10, 10, 5, 'tet10'); qt = mesh_quality(t); dih = qt.minDihedral; inv = qt.inverted;
qc = mesh_quality(cylinder_mesh(10, 20, 4)); cyl = qc.volume;
qv = mesh_quality(cylinder_mesh(10, 20, 0.5, 'voxel')); cylv = qv.volume;
v = box_mesh(100, 10, 10, 2.5, 'voxel'); n0 = numel(nodes_at(v, 1, 0));
[fn, ft] = face_nodes(t, 6); X = meshNodes(t); fx = max(abs(X(fn, 1) - 100));
A = X(ft(:,1),:); B = X(ft(:,2),:); C = X(ft(:,3),:);
fa = sum(sqrt(sum([(B(:,2)-A(:,2)).*(C(:,3)-A(:,3))-(B(:,3)-A(:,3)).*(C(:,2)-A(:,2)), (B(:,3)-A(:,3)).*(C(:,1)-A(:,1))-(B(:,1)-A(:,1)).*(C(:,3)-A(:,3)), (B(:,1)-A(:,1)).*(C(:,2)-A(:,2))-(B(:,2)-A(:,2)).*(C(:,1)-A(:,1))].^2, 2))) / 2;
`);
    if (w) {
      const ne = w.arr('ne'), vol = w.arr('vol'), cyl = w.num('cyl'), cylv = w.num('cylv'), ex = Math.PI * 100 * 20;
      ok(ne[0] === 640 && ne[1] === 640 && vol.every((v) => Math.abs(v - 10000) < 1e-6), `box_mesh 100 × 10 × 10, h 2.5: hex ${ne[0]} and voxel ${ne[1]} elements (40·4·4 = 640); volume of hex, voxel, tet4, tet10 and the closed surface = 10000 (${vol.map((v) => f(v, 6)).join(', ')})`);
      ok(w.num('dih') > 10 && w.num('inv') === 0, `tet10 of the box (size 5): no inverted element, smallest dihedral angle ${f(w.num('dih'), 1)}° (> 10°)`);
      ok(Math.abs(pct(cyl, ex)) < 0.5, `cylinder_mesh r 10, len 20, tet10 size 4: volume ${f(cyl, 2)} vs πr²len ${f(ex, 2)} (${f(pct(cyl, ex), 3)} %, ≤ 0.5 %; the 128-sided prism is −0.04 %)`);
      ok(Math.abs(pct(cylv, ex)) < 1, `cylinder_mesh voxel h 0.5: volume ${f(cylv, 1)} vs ${f(ex, 1)} (${f(pct(cylv, ex), 2)} %, ≤ 1 %)`);
      ok(w.num('n0') === 25, `nodes_at: the voxel box has ${w.num('n0')} nodes on x = 0 (5 × 5)`);
      ok(w.num('fx') < 1e-9 && Math.abs(w.num('fa') - 100) < 1e-9, `face_nodes(t, 6): every node on x = 100, its triangles add up to ${f(w.num('fa'), 9)} (10 × 10)`);
    }
  }

  // ───────────────────────────────────────────────────────────── static
  section('Library: static stress (cantilever vs Euler–Bernoulli and vs PartCraft Simulation)');
  const MESH = await import(DEVURL + 'cs-lib-mesh.js');
  const FEA = await import(DEVURL + 'fea.js');
  const TF = await import(DEVURL + 'tetfea.js');
  const steel = { name: 'Steel', E: 200000, nu: 0.3, density: 7850, yield: 250 };
  const boxS = MESH.boxSurface(100, 10, 10);
  const kmesh = () => ({ positions: boxS.nodes, indices: boxS.elems, triFace: boxS.triFace });
  const EB = 100 * 100 ** 3 / (3 * 200000 * (10 ** 4 / 12));   // P L³ / 3EI = 0.2 mm
  {
    const w = await craft('static_voxel', `
v = box_mesh(100, 10, 10, 2.5, 'voxel');
fixed = nodes_at(v, 1, 0); tip = nodes_at(v, 1, 100);
bc = struct('fixed', fixed); bc.loads = {struct('nodes', tip, 'force', [0 0 -100])};
r = static_voxel(v, 200000, 0.3, bc);
w = -mean(r.U(tip, 3)); Rz = r.reaction(3); C = r.compliance; vmax = r.maxVm;
`);
    if (w) {
      const tip = w.num('w');
      ok(Math.abs(pct(tip, EB)) <= 3, `static_voxel (h = 2.5 mm, 640 cubes, ${3000} unknowns): tip ${f(tip, 5)} mm vs P L³/3EI ${f(EB, 5)} mm (${f(pct(tip, EB), 2)} %, ≤ 3 %)`);
      ok(Math.abs(w.num('Rz') - 100) < 1e-6, `static_voxel: the support reaction balances the load (Rz = ${f(w.num('Rz'), 9)} N)`);
      ok(w.displays.some((d) => d.show === 'field'), 'static_voxel shows its von Mises field on the canvas (deformed)');
      // the same model through PartCraft's Simulation solver (fea.js solveStudy: matrix-free multigrid PCG)
      const t0 = Date.now();
      const fixed0 = w.arr('fixed').map((n) => n - 1), tip0 = w.arr('tip').map((n) => n - 1);
      const res = FEA.solveStudy({ mesh: kmesh(), material: steel, h: 2.5, elem: 'h8i', kind: 'static', bcs: { constraints: [{ type: 'fixed', nodes: fixed0 }], loads: [{ type: 'force', nodes: tip0, total: 100, dir: [0, 0, -1] }] } });
      const nat = -tip0.reduce((s, n) => s + res.u[3 * n + 2], 0) / tip0.length;
      times.push(['native fea.js solveStudy', Date.now() - t0]);
      ok(Math.abs(pct(tip, nat)) <= 1 && Math.abs(pct(w.num('C'), res.compliance)) <= 1, `static_voxel vs PartCraft Simulation (fea.js solveStudy, same grid and loads): tip ${f(tip, 6)} vs ${f(nat, 6)} mm (${pct(tip, nat).toExponential(1)} %), compliance ${f(w.num('C'), 5)} vs ${f(res.compliance, 5)} N·mm (≤ 1 %)`);
    }
  }
  {
    const w = await craft('static_tet', `
t = box_mesh(100, 10, 10, 5, 'tet10');
bc = struct('fixedFaces', 5); bc.loads = {struct('face', 6, 'force', [0 0 -100])};
r = static_tet(t, 200000, 0.3, bc);
tip = nodes_at(t, 1, 100); w = -mean(r.U(tip, 3)); C = r.compliance; Rz = r.reaction(3); dofs = r.dofs;
bc2 = struct('fixedFaces', 5); bc2.loads = {struct('face', 2, 'pressure', 0.1)};
r2 = static_tet(t, 200000, 0.3, bc2, struct('show', false)); Rp = r2.reaction(3);
`);
    if (w) {
      const tip = w.num('w');
      ok(Math.abs(pct(tip, EB)) <= 3, `static_tet (tet10 size 5, 1296 elements, ${w.num('dofs')} unknowns): tip ${f(tip, 5)} mm vs P L³/3EI ${f(EB, 5)} mm (${f(pct(tip, EB), 2)} %, ≤ 3 %)`);
      ok(Math.abs(w.num('Rz') - 100) < 1e-6 && Math.abs(w.num('Rp') - 100) < 1e-6, `static_tet: reactions balance a face force (${f(w.num('Rz'), 7)} N) and a 0.1 MPa pressure on the 1000 mm² top (${f(w.num('Rp'), 7)} N)`);
      const t0 = Date.now();
      const res = TF.solveTetStudy({ mesh: kmesh(), material: steel, h: 5, kind: 'static', bcs: { constraints: [{ type: 'fixed', faces: [4] }], loads: [{ type: 'force', faces: [5], total: 100, dir: [0, 0, -1] }] } });
      times.push(['native tetfea.js solveTetStudy (static)', Date.now() - t0]);
      let s = 0, c = 0; for (let a = 0; a < res.model.n; a++) if (Math.abs(res.model.X[3 * a] - 100) < 1e-9) { s += res.u[3 * a + 2]; c++; }
      const nat = -s / c;
      ok(Math.abs(pct(tip, nat)) <= 1 && Math.abs(pct(w.num('C'), res.compliance)) <= 1 && res.summary.elements === 1296, `static_tet vs PartCraft Simulation (tetfea.js solveTetStudy, same mesh: ${res.summary.elements} elements): tip ${f(tip, 6)} vs ${f(nat, 6)} mm (${pct(tip, nat).toExponential(1)} %), compliance ${f(w.num('C'), 5)} vs ${f(res.compliance, 5)} (≤ 1 %)`);
    }
  }

  // ───────────────────────────────────────────────────────────── modal
  section('Library: modal (cantilever first frequency)');
  {
    const w = await craft('modal_tet', `
t = box_mesh(100, 10, 10, 5, 'tet10');
r = modal_tet(t, 200000, 0.3, 7.85e-9, struct('fixedFaces', 5), 4);
f1 = r.freqs(1); f2 = r.freqs(2); mass = r.mass;
`);
    if (w) {
      const fa = 1.8751040687 ** 2 / (2 * Math.PI) * Math.sqrt(200000 * (1e4 / 12) / (7.85e-9 * 100 * 100 ** 4));
      ok(Math.abs(pct(w.num('f1'), fa)) <= 3 && Math.abs(w.num('f1') - w.num('f2')) < 1e-3 * fa, `modal_tet (tet10 size 5): f1 ${f(w.num('f1'), 2)} Hz vs Euler–Bernoulli ${f(fa, 2)} Hz (${f(pct(w.num('f1'), fa), 2)} %, ≤ 3 %); the square section gives f2 = f1 (${f(w.num('f2'), 2)})`);
      ok(Math.abs(pct(w.num('mass'), 7.85e-5)) < 1e-6, `modal_tet: total mass ${w.num('mass').toExponential(6)} t = ρV`);
      const t0 = Date.now();
      const res = TF.solveTetStudy({ mesh: kmesh(), material: steel, h: 5, kind: 'modal', modes: 4, bcs: { constraints: [{ type: 'fixed', faces: [4] }] } });
      times.push(['native tetfea.js solveTetStudy (modal)', Date.now() - t0]);
      ok(Math.abs(pct(w.num('f1'), res.freqs[0])) <= 1, `modal_tet vs PartCraft Simulation modal (tetfea.js LOBPCG, same mesh): f1 ${f(w.num('f1'), 3)} vs ${f(res.freqs[0], 3)} Hz (${pct(w.num('f1'), res.freqs[0]).toExponential(1)} %, ≤ 1 %)`);
    }
  }

  // ───────────────────────────────────────────────────────────── thermal
  section('Library: heat (slab, lumped body, decaying slab)');
  {
    const w = await craft('heat', `
m = box_mesh(100, 5, 5, 5);
ends = [nodes_at(m, 1, 0); nodes_at(m, 1, 100)];
bc = struct('q', 1e-3); bc.T = {struct('nodes', ends, 'value', 20)};
r = heat_steady(m, 0.05, bc);
X = meshNodes(m); Ta = 20 + 1e-3 * X(:, 1) .* (100 - X(:, 1)) / (2 * 0.05);
slab = max(abs(r.T - Ta)) / 25; Tmid = max(r.T); qout = r.heatOut;
c = box_mesh(10, 10, 10, 5); S = meshElems(meshSurface(c));
bc2 = struct(); bc2.conv = {struct('nodes', unique(S(:)), 'h', 1e-5, 'Tinf', 20)};
tau = 2.43e-3 * 1000 / (1e-5 * 600);
r2 = heat_transient(c, 0.2, 2.43e-3, bc2, tau / 200, 200, 100);
lumped = (r2.mean(end) - 20) / 80; spread = max(r2.T) - min(r2.T);
s = box_mesh(100, 5, 5, 5); Xs = meshNodes(s);
bc3 = struct(); bc3.T = {struct('nodes', [nodes_at(s, 1, 0); nodes_at(s, 1, 100)], 'value', 0)};
al = 0.05 / 3.6e-3; tt = 100^2 / (al * pi^2);
r3 = heat_transient(s, 0.05, 3.6e-3, bc3, tt / 200, 200, sin(pi * Xs(:, 1) / 100), struct('probe', nodes_at(s, 1, 50)));
decay = mean(r3.probe(end, :));
`);
    if (w) {
      ok(w.num('slab') < 1e-3 && Math.abs(w.num('Tmid') - 45) < 1e-6, `heat_steady: plane wall 100 mm with q = 1e-3 W/mm³, ends at 20: T = 20 + q x (L − x)/2k at every node (largest error ${w.num('slab').toExponential(1)} of the 25 K rise, ≤ 0.1 %; mid-length ${f(w.num('Tmid'), 6)})`);
      ok(Math.abs(w.num('qout') - 2.5) < 1e-9, `heat_steady: heat out through the ends ${f(w.num('qout'), 9)} W = q·V = 2.5 W`);
      const e1 = Math.exp(-1);
      ok(Math.abs(pct(w.num('lumped'), e1)) <= 1 && w.num('spread') < 0.1, `heat_transient lumped: 10 mm aluminium cube (Bi = 5e-4), (T − T∞)/(T0 − T∞) at t = ρcV/hA: ${f(w.num('lumped'), 5)} vs e⁻¹ ${f(e1, 5)} (${f(pct(w.num('lumped'), e1), 2)} %, ≤ 1 %; Δt = τ/200, backward Euler), temperature spread ${w.num('spread').toExponential(1)} K`);
      ok(Math.abs(pct(w.num('decay'), e1)) <= 2, `heat_transient slab: sin(πx/L) start, ends at 0, mid-length at t = L²/απ²: ${f(w.num('decay'), 5)} vs e⁻¹ (${f(pct(w.num('decay'), e1), 2)} %, ≤ 2 %)`);
      ok(w.displays.some((d) => d.plot), 'heat_transient plots the temperature against time');
    }
  }

  // ───────────────────────────────────────────────────────────── topology optimization
  section('Library: topology optimization');
  {
    const w = await craft('top88', `
[x1, c1, l1, h1] = top88(60, 20, 0.5, 3, 1.5, 1); v1 = mean(x1(:));
[x2, c2, l2, h2] = top88(60, 20, 0.5, 3, 1.5, 2); v2 = mean(x2(:));
`);
    if (w) {
      ok(w.num('l1') === 94 && w.num('c1').toFixed(4) === '203.1925' && Math.abs(w.num('v1') - 0.5) < 1e-3, `top88 MBB 60×20, ft = 1: ${w.num('l1')} iterations, c = ${f(w.num('c1'))} (reference 94, 203.1925), volume ${f(w.num('v1'), 3)}`);
      ok(w.num('l2') === 127 && w.num('c2').toFixed(4) === '218.8032' && Math.abs(w.num('v2') - 0.5) < 1e-3, `top88 MBB 60×20, ft = 2: ${w.num('l2')} iterations, c = ${f(w.num('c2'))} (reference 127, 218.8032), volume ${f(w.num('v2'), 3)}`);
      ok(w.displays.some((d) => d.plot) && w.displays.some((d) => d.show === 'field'), 'top88 plots the compliance history and shows the design as a field');
    }
  }
  {
    const w = await craft('top99', `[x, c, loop, hist] = top99(60, 20, 0.5, 3, 1.5); vol = mean(x(:)); ch = max(abs(diff(hist(end-1:end))));`);
    if (w) ok(w.num('loop') < 200 && Math.abs(w.num('vol') - 0.5) < 1e-3 && Math.abs(pct(w.num('c'), 203.1925)) <= 2, `top99 MBB 60×20: converged in ${w.num('loop')} iterations, volume ${f(w.num('vol'), 4)}, c = ${f(w.num('c'))} (${f(pct(w.num('c'), 203.1925), 2)} % from top88's 203.1925, ≤ 2 %)`);
  }
  {
    const w = await craft('topopt3d', `
v = box_mesh(20, 10, 2, 1, 'voxel');
fixed = nodes_at(v, 1, 0); tip = intersect(nodes_at(v, 1, 20), nodes_at(v, 2, 0));
bc = struct('fixed', fixed); bc.loads = {struct('nodes', tip, 'force', [0 -1 0])};
r = topopt3d(v, 1000, 0.3, bc, 0.4, 3, 1.5, struct('maxit', 200));
loop = r.loop; conv = r.converged; c = r.c; vol = mean(r.xPhys); vmax = max(abs(r.vol - 0.4)); c0 = r.hist(1);
`);
    if (w) {
      ok(w.num('conv') === 1 && Math.abs(w.num('vol') - 0.4) < 1e-3 && w.num('vmax') < 1e-3 && w.num('c') < w.num('c0'), `topopt3d 20 × 10 × 2 cubes, volfrac 0.4: converged in ${w.num('loop')} iterations (change ≤ 0.01), volume ${f(w.num('vol'), 4)} at every iteration (largest drift ${w.num('vmax').toExponential(1)}), compliance ${w.num('c0').toPrecision(5)} → ${w.num('c').toPrecision(5)} N·mm`);
      const TO = await import(DEVURL + 'topopt.js');
      const boxT = MESH.boxSurface(20, 10, 2);
      const t0 = Date.now();
      const out = TO.optimize({ mesh: { positions: boxT.nodes, indices: boxT.elems, triFace: boxT.triFace }, h: 1, material: { name: 'Test', E: 1000, nu: 0.3, density: 1000, yield: 100 }, elem: 'h8', keepBC: false, constraints: [{ type: 'fixed', nodes: w.arr('fixed').map((n) => n - 1) }], loads: [{ type: 'force', nodes: w.arr('tip').map((n) => n - 1), total: 1, dir: [0, -1, 0] }], volfrac: 0.4, rmin: 1.5, penal: 3, maxIter: 200 });
      times.push(['native topopt.js optimize', Date.now() - t0]);
      ok(Math.abs(pct(w.num('c'), out.finalC)) <= 1, `topopt3d vs PartCraft Generative (topopt.js optimize, same grid, loads, filter, OC): compliance ${w.num('c').toPrecision(6)} vs ${out.finalC.toPrecision(6)} N·mm (${pct(w.num('c'), out.finalC).toExponential(1)} %, ≤ 1 %), ${w.num('loop')} vs ${out.iterations} iterations`);
    }
  }

  // ───────────────────────────────────────────────────────────── electromagnetics
  section('Library: electromagnetics');
  {
    const w = await craft('em', `
e0 = 8.8541878128e-12;
m = quadGrid(1, 1, 10, 20);
bc = struct(); bc.fixed = {struct('nodes', nodes_at(m, 2, 1), 'value', 1), struct('nodes', nodes_at(m, 2, 0), 'value', 0)};
r = poisson2d(m, e0, 0, bc, struct('show', false));
Cfull = 2 * r.energy / e0; Qfull = r.charge(1) / e0;
L = 16; h = 0.125; n = L / h; d = 1; w = 4;
m = quadGrid(L, L, n, n, [-L/2 -L/2]); X = meshNodes(m);
top = find(abs(X(:, 2) - d/2) < 1e-9 & abs(X(:, 1)) <= w/2 + 1e-9);
bot = find(abs(X(:, 2) + d/2) < 1e-9 & abs(X(:, 1)) <= w/2 + 1e-9);
bc = struct(); bc.fixed = {struct('nodes', top, 'value', 0.5), struct('nodes', bot, 'value', -0.5)};
r = poisson2d(m, e0, 0, bc);
ratio = 2 * r.energy / (e0 * w / d);
palmer = 1 + d / (pi * w) * (1 + log(2 * pi * w / d));
a = 1; t = 0.25; Ls = 40; K = 1000; mu0 = 4e-7 * pi;
m = quadGrid(4, 60, 32, 120); N = meshNodes(m); Q = meshElems(m);
xc = (N(Q(:, 1), 1) + N(Q(:, 2), 1)) / 2; yc = (N(Q(:, 1), 2) + N(Q(:, 4), 2)) / 2;
J = (K / t) * (xc > a & xc < a + t & yc < Ls);
bc = struct(); bc.fixed = {struct('nodes', nodes_at(m, 1, 0), 'value', 0)};
s = magnetostatic2d(m, 1, J, bc);
Bair = -mean(s.B(xc < 0.5 & yc < 1, 2)) / (mu0 * K);
mur = 1 + 99 * (xc < a);
Jf = (K / t) * (xc > a & xc < a + t);
s = magnetostatic2d(m, mur, Jf, bc, struct('show', false));
Biron = -mean(s.B(xc < 0.5 & yc < 1, 2)) / (100 * mu0 * K);
Br0 = 1.2; murm = 1.05; R = 1; L = 16; n = 16;
m = quadGrid(L, L, L * n, L * n); X = meshNodes(m); Q = meshElems(m);
xc = (X(Q(:, 1), 1) + X(Q(:, 2), 1)) / 2; yc = (X(Q(:, 1), 2) + X(Q(:, 4), 2)) / 2;
mag = xc .^ 2 + yc .^ 2 < R ^ 2;
bc = struct(); bc.fixed = {struct('nodes', [nodes_at(m, 1, 0); nodes_at(m, 1, L); nodes_at(m, 2, L)], 'value', 0)};
s = magnetostatic2d(m, 1 + (murm - 1) * mag, 0, bc, struct('show', false, 'Br', [zeros(numel(mag), 1), Br0 * mag]));
core = xc .^ 2 + yc .^ 2 < (R / 2) ^ 2;
Bround = mean(s.B(core, 2)) / (Br0 / (1 + murm)); Bxround = max(abs(s.B(core, 1)));
s1 = magnetostatic2d(m, 1, 0, bc, struct('show', false, 'Br', [zeros(numel(mag), 1), Br0 * mag]));
Bround1 = mean(s1.B(core, 2)) / (Br0 / 2);
Hrec = max(abs(s.B(core, 2) - (Br0 + mu0 * murm * s.H(core, 2))));
t = 0.020; W = 0.100; H = 0.080; lm = 0.010; h = 0.001; muri = 1000;
m = quadGrid(0.140, 0.120, 140, 120, [-0.070 -0.060]); X = meshNodes(m); Q = meshElems(m);
xc = (X(Q(:, 1), 1) + X(Q(:, 2), 1)) / 2; yc = (X(Q(:, 1), 2) + X(Q(:, 4), 2)) / 2;
frame = abs(xc) < W / 2 & abs(yc) < H / 2; window = abs(xc) < W / 2 - t & abs(yc) < H / 2 - t;
mag = xc > -W / 2 & xc < -W / 2 + t & abs(yc) < lm / 2;
s = magnetostatic2d(m, 1 + (muri - 1) * (frame & ~window & ~mag) + (murm - 1) * mag, 0, struct(), struct('show', false, 'Br', [zeros(numel(mag), 1), Br0 * mag]));
Bkeep = mean(s.B(mag & abs(xc + W / 2 - t / 2) < t / 4, 2)) / (Br0 * lm / (lm + murm * (2 * ((W - t) + (H - t)) - lm) / muri));
`);
    if (w) {
      ok(Math.abs(w.num('Cfull') - 1) < 1e-9 && Math.abs(w.num('Qfull') - 1) < 1e-9, `poisson2d: plates spanning the domain (no fringing) give C' = ε0 w/d exactly (energy ${f(w.num('Cfull'), 12)}, charge ${f(w.num('Qfull'), 12)} × ε0 w/d)`);
      ok(w.num('ratio') > 1 && Math.abs(pct(w.num('ratio'), w.num('palmer'))) <= 3, `poisson2d: plates w = 4d in a 16d box (h = d/8): C' = ${f(w.num('ratio'), 4)} × ε0 w/d — fringing adds ${f(100 * (w.num('ratio') - 1), 1)} %; Palmer's formula ${f(w.num('palmer'), 4)} (${f(pct(w.num('ratio'), w.num('palmer')), 2)} %, ≤ 3 %)`);
      ok(Math.abs(w.num('Bair') - 1) <= 0.02, `magnetostatic2d: long solenoid (quarter model, ideal return path), B at the centre ${f(w.num('Bair'), 5)} × μ0 n I (${f(100 * (w.num('Bair') - 1), 3)} %, ≤ 2 %)`);
      ok(Math.abs(w.num('Biron') - 1) <= 0.02, `magnetostatic2d: coil and an iron core μr = 100 the full length of the model (an endless solenoid), B = ${f(w.num('Biron'), 5)} × μr μ0 n I (≤ 2 %)`);
      // 0.6 SG.7+: permanent magnets (opts.Br)
      ok(Math.abs(w.num('Bround') - 1) <= 0.01 && w.num('Bxround') < 0.01, `magnetostatic2d magnets: a round magnet in air (Br 1.2 T across it, μr 1.05; quarter model, 16 R box, R/16 squares): B inside = ${f(w.num('Bround'), 5)} × Br/(1 + μr) (${f(100 * (w.num('Bround') - 1), 2)} %, ≤ 1 %), straight across (|Bx| ≤ ${f(w.num('Bxround'), 4)} T)`);
      ok(Math.abs(w.num('Bround1') - 1) <= 0.01, `magnetostatic2d magnets: the same with μr = 1: B inside = ${f(w.num('Bround1'), 5)} × Br/2 (the 2-D demagnetising factor ½; ≤ 1 %)`);
      ok(w.num('Hrec') < 1e-9, `magnetostatic2d magnets: r.H puts every magnet element on its recoil line B = Br + μ0 μr H (worst ${w.num('Hrec').toExponential(1)} T)`);
      ok(Math.abs(w.num('Bkeep') - 1) <= 0.01, `magnetostatic2d magnets: a magnet closed by an iron keeper (μr 1000, no gap): B in the magnet = ${f(w.num('Bkeep'), 5)} × the magnetic circuit's (${f(100 * (w.num('Bkeep') - 1), 2)} %, ≤ 1 %)`);
    }
  }

  // ───────────────────────────────────────────────────────────── fluid
  section('Library: fluid (Poiseuille channel)');
  {
    const w = await craft('fluid', `
nx = 3; ny = 22; solid = false(nx, ny); solid(:, [1 ny]) = true;
tau = 0.9; F = 1e-6; H = ny - 2; y = (2:ny-1) - 1.5; nu = (tau - 0.5) / 3;
ua = F / (2 * nu) * y .* (H - y);
r = lbm2d(solid, struct('tau', tau, 'force', [F 0], 'tol', 1e-9));
e2 = max(abs(r.ux(2, 2:ny-1) - ua)) / max(ua); s2 = r.steps; c2 = r.converged;
kind = zeros(4, ny); kind(:, [1 ny]) = -1;
r3 = lbm3d(kind, struct('tau', tau, 'force', [F 0 0], 'periodic', [1 0 1]));
e3 = max(abs(r3.ux(2, 2:ny-1) - ua)) / max(ua); s3 = r3.steps; c3 = r3.converged;
`);
    if (w) {
      ok(w.num('c2') === 1 && w.num('e2') <= 0.02, `lbm2d (D2Q9 BGK in script, Guo forcing, half-way bounce-back): Poiseuille profile within ${f(100 * w.num('e2'), 3)} % of the analytic peak (≤ 2 %) after ${w.num('s2')} steps`);
      ok(w.num('c3') === 1 && w.num('e3') <= 0.02, `lbm3d (flow.js D3Q19 TRT): Poiseuille profile within ${f(100 * w.num('e3'), 4)} % (≤ 2 %) after ${w.num('s3')} steps`);
      ok(w.displays.filter((d) => d.plot).length >= 2, 'lbm2d and lbm3d plot their convergence');
    }
  }

  // ───────────────────────────────────────────────────────────── the examples
  section('Library: examples run');
  for (const ex of ['example_cantilever', 'example_mbb', 'example_capacitor', 'example_channel', 'example_electromagnet', 'example_magnet']) {
    const w = await craft(ex, fs.readFileSync(path.join(LIB, ex + '.craft'), 'utf8'));
    if (w) ok(w.displays.some((d) => d.show === 'field') && w.displays.some((d) => d.plot), `${ex} runs: a field on the canvas and a plot (${(w.ms / 1000).toFixed(1)} s)`);
    // 0.5 SG.7 (#573): the electromagnet against the magnetic circuit, B_gap = μ0 N I / (g + l/μr); FEM a little lower
    // (fringing widens the gap's flux path, some flux leaks across the window); the inductance higher (leakage)
    if (w && ex === 'example_electromagnet') {
      const e = w.num('Bgap') / w.num('Bc') - 1;
      ok(e < 0 && e > -0.05, `example_electromagnet: B in the gap ${f(w.num('Bgap'), 4)} T vs the magnetic circuit ${f(w.num('Bc'), 4)} T (${f(100 * e, 2)} %, within −5 %)`);
      ok(w.num('L') > w.num('Lc') && w.num('L') < 2 * w.num('Lc') && Math.abs(w.num('F') - w.num('Bgap') ** 2 * 0.02 / (2 * 4e-7 * Math.PI)) < 1e-6 * w.num('F'), `example_electromagnet: inductance ${f(w.num('L'), 4)} H/m above the circuit's ${f(w.num('Lc'), 4)} H/m (leakage), pull ${f(w.num('F'), 0)} N/m = B² w / 2μ0`);
    }
    // 0.6 SG.7+: the permanent magnet against the magnetic circuit without leakage — the gap gets less (the magnet's
    // flux leaks across the window), the magnet works between the gap field and Br, on its recoil line
    if (w && ex === 'example_magnet') {
      const mu0 = 4e-7 * Math.PI, e = w.num('Bgap') / w.num('Bc') - 1;
      ok(e < 0 && e > -0.5 && w.num('sigma') > 1 && w.num('Bm') > w.num('Bgap') && w.num('Bm') < 1.2, `example_magnet: B in the gap ${f(w.num('Bgap'), 4)} T under the leak-free circuit's ${f(w.num('Bc'), 4)} T (${f(100 * e, 1)} %), leakage factor ${f(w.num('sigma'), 2)}, the magnet at ${f(w.num('Bm'), 3)} T (between the gap and Br)`);
      ok(Math.abs(w.num('Bm') - (1.2 + mu0 * 1.05 * w.num('Hm'))) < 1e-6 && w.num('Hm') < 0 && Math.abs(w.num('F') - w.num('Bgap') ** 2 * 0.02 / (2 * mu0)) < 1e-6 * w.num('F'), `example_magnet: working point on the recoil line (H = ${f(w.num('Hm') / 1000, 0)} kA/m, against B), pull ${f(w.num('F'), 0)} N/m = B² w / 2μ0`);
    }
  }

  console.log('\n  timings (Node, one thread): ' + times.map(([l, ms]) => `${l} ${(ms / 1000).toFixed(2)} s`).join(' · ') + ` — library section ${((Date.now() - tAll) / 1000).toFixed(1)} s`);
}
