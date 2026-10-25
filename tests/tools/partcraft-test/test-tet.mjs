#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-tet.mjs — PartCraft's tetrahedral mesher and quadratic-tet solver (tetmesh.js, tetfea.js, amg.js, tet-elements.js,
 * tet-worker.js, the tet parts of sim.js), checked against closed-form and published references:
 *   mesher: BVH queries, conforming bisection, exact volumes / face areas, dihedral-angle bounds, curved midside nodes;
 *   element: quadrature exactness, patch tests (straight and curved elements, constant strain reproduced exactly);
 *   static: cantilever tip deflection PL³/3EI (+ Timoshenko) and bending stress P(L−x)c/I, convergence; a plate with a hole
 *   (Heywood's finite-width Kt, d/W = 0.2) and a thick cylinder under pressure (Lamé), each also solved on the voxel mesh
 *   for comparison; modal: the first bending frequency of a cantilever (Euler–Bernoulli); thermal on tets: radial
 *   conduction (log profile, heat flow 2πkLΔT/ln(b/a)), thermal stress (−EαΔT restrained, 0 free), linear buckling of a
 *   fixed-free column (Euler π²EI/4L²); sim.js tet studies; the worker op.
 *   node tools/partcraft-test/test-tet.mjs [--verbose]     (or runTetTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runTetTests({ ok, section, near, oc = null, log = (m) => console.log('  note ' + m) }) {
  const TM = await import(DEV + 'tetmesh.js');
  const TF = await import(DEV + 'tetfea.js');
  const AM = await import(DEV + 'amg.js');
  const TE = await import(DEV + 'tet-elements.js');
  const TW = await import(DEV + 'tet-worker.js');
  const TH = await import(DEV + 'thermal.js');
  const FE = await import(DEV + 'fea.js');
  const SIM = await import(DEV + 'sim.js');
  const MAT = await import(DEV + 'materials.js');
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'), B = await import(DEV + 'brep.js');
  if (!oc) {
    const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await init({ print: () => {}, printErr: () => {} });
  }
  const rel = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
  const pct = (a, b) => `${((a / b - 1) * 100).toFixed(2)} %`;
  const throws = (fn, re) => { try { fn(); return false; } catch (e) { return re ? re.test(e.message) : true; } };
  const table = [];   // verification: case | reference | result | error
  const row = (c, ref, res, err) => table.push([c, ref, res, err]);
  const steel = MAT.materialById('steel');

  // ------------------------------------------------------------------ parts (front-plane sketch, extruded along z)
  const finish = (part) => { const regen = B.regenerateBrep(part, oc); return { part, regen, faces: regen.faces, mesh: regen.mesh } };
  const extrude = (name, draw, depth) => { const part = P.newPart(name), sk = S.newSketch(); draw(sk); const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk }); P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth }); return finish(part); };
  const block = (L, H, W, hole = null) => extrude('Block', (sk) => { S.addRect(sk, [0, 0], [L, H]); if (hole) S.addCircle(sk, [hole.cx, hole.cy], hole.d / 2); }, W);
  const quarterTube = (a, b, W) => extrude('Tube', (sk) => { const l1 = S.addLine(sk, [a, 0], [b, 0]), ar = S.addArc(sk, [0, 0], l1.p2, [0, b]), l2 = S.addLine(sk, ar.e, [0, a]); S.addArc(sk, [0, 0], l1.p1, l2.p2); }, W);
  const halfPlate = (A, Bh, r, t) => extrude('HalfPlate', (sk) => { const l1 = S.addLine(sk, [0, 0], [A - r, 0]), l2 = S.addLine(sk, [A + r, 0], [2 * A, 0]); S.addArc(sk, [A, 0], l2.p1, l1.p2); const l3 = S.addLine(sk, l2.p2, [2 * A, Bh]), l4 = S.addLine(sk, l3.p2, [0, Bh]); S.addLine(sk, l4.p2, l1.p1); }, t);
  const plane = (b, n, at = null) => { let best = -1, bd = Infinity; b.faces.forEach((f, i) => { if (f.type !== 'plane' || f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] < 0.999) return; const d = at ? Math.hypot(...f.at.map((v, k) => v - at[k])) : 0; if (d < bd) { bd = d; best = i; } }); return best; };
  const cyl = (b, r) => b.faces.findIndex((f) => f.type === 'cylinder' && Math.abs(f.r - r) < 1e-6);
  const job = (b, extra) => ({ mesh: b.mesh, faces: b.faces, material: 'steel', ...extra });

  section('tets: the surface queries and the background lattice (tetmesh.js)');
  const bar = block(100, 10, 10);
  {
    const bvh = TM.buildBVH(bar.mesh);
    const c = bvh.closest([50, 15, 5]);
    ok(near(Math.sqrt(c.d2), 5, 1e-9) && near(c.p[1], 10, 1e-9), 'BVH closest point: 5 mm above the top face, on it');
    ok(bvh.inside([50, 5, 5]) && !bvh.inside([50, 11, 5]) && !bvh.inside([-1, 5, 5]) && bvh.inside([0.001, 0.001, 0.001]), 'inside test (ray parity, skewed rays): in, above, beyond the end, just inside a corner');
    const h = bvh.firstHit([50, 5, 5], [0, 20, 0]);
    ok(h && near(h.t, 0.25, 1e-12), 'first hit along a segment: the top face at a quarter of the way');
    ok(bvh.firstHit([0, 5, 5], [0, -10, 0], 1, 1e-4) && bvh.near([0, 10, 5], 1e-9), 'a ray along a face (in its plane) still finds the edge it leaves through; a point on an edge is "on" the surface');
    const lat = TM.bccLattice({ min: [0, 0, 0], max: [10, 4, 4] }, 2);
    let vol = 0, neg = 0; for (let e = 0; e < lat.tets.length / 4; e++) { const v = TM.tetVolume(lat.pts.a, lat.tets[4 * e], lat.tets[4 * e + 1], lat.tets[4 * e + 2], lat.tets[4 * e + 3]); vol += v; if (v <= 0) neg++; }
    const nf = 6 * 4 * 4 + 7 * 3 * 4 + 7 * 4 * 3;   // faces between neighbouring cubes of the padded 7 × 4 × 4 lattice
    ok(lat.cubes.join() === '5,2,2' && neg === 0 && lat.tets.length / 4 === 4 * nf && near(vol, 4 * nf * 8 / 12, 1e-9), 'BCC lattice: the box as whole 2 mm cubes, 4 positive tets per pair of neighbouring cubes, each of volume h³/12');
    // conforming bisection: every interior face shared by exactly two tets, volume kept
    const pts = lat.pts, T = TM.bisectRefine(pts, lat.tets, (e, Tt) => { const c = [0, 1, 2].map((a) => (pts.a[3 * Tt[4 * e] + a] + pts.a[3 * Tt[4 * e + 1] + a]) / 2); return Math.hypot(c[0] - 4, c[1] - 2, c[2] - 2) < 3; }, { rounds: 4 });
    const fc = new Map(); let v2 = 0, n2 = 0;
    for (let e = 0; e < T.length / 4; e++) { const v = [T[4 * e], T[4 * e + 1], T[4 * e + 2], T[4 * e + 3]], vv = TM.tetVolume(pts.a, ...v); v2 += vv; if (vv <= 0) n2++; for (const f of [[1, 2, 3], [0, 2, 3], [0, 1, 3], [0, 1, 2]]) { const k = f.map((i) => v[i]).sort((x, y) => x - y).join(','); fc.set(k, (fc.get(k) || 0) + 1); } }
    let bad = 0; for (const n of fc.values()) if (n > 2) bad++;
    const q = TM.meshQuality(pts.a, Int32Array.from(T));
    ok(T.length > lat.tets.length * 2 && n2 === 0 && near(v2, vol, 1e-9) && bad === 0, `longest-edge bisection (4 rounds near a point): ${T.length / 4} tets, conforming (no face used by 3), volume kept`);
    ok(q.minDihedral > 30, `bisected BCC tets keep their shape: smallest dihedral ${q.minDihedral.toFixed(1)}°`);
    const qr = TM.tetQuality([1, 1, 1, 1, -1, -1, -1, 1, -1, -1, -1, 1], [0, 1, 2, 3]), qf = TM.tetQuality([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1e-9], [0, 1, 2, 3]);
    ok(near(qr.minDih, Math.acos(1 / 3) * 180 / Math.PI, 1e-9) && near(qr.aspect, 1, 1e-12) && qf.minDih < 1e-6 && qf.maxDih > 179.99, 'quality measures: regular tet 70.53°, aspect 1; a flat tet reads 0° / 180°');
  }

  section('tets: meshing parts (isosurface stuffing, sharp edges, curved faces)');
  const plateHole = block(100, 40, 4, { cx: 50, cy: 20, d: 10 }), tube = quarterTube(10, 20, 10);
  {
    const meshed = (b, h) => { const bvh = TM.buildBVH(b.mesh), tm = TM.tetMesh(b.mesh, b.faces, { h, curv: 0.25, thick: 1, bvh }); return { tm, t10: TM.toT10(tm, b.mesh, b.faces, bvh) }; };
    const faceAreas = (tm) => { const A = new Map(), X = tm.nodes; for (let t = 0; t < tm.btri.length / 3; t++) { const [a, b2, c] = [0, 1, 2].map((k) => tm.btri[3 * t + k]), u = [0, 1, 2].map((i) => X[3 * b2 + i] - X[3 * a + i]), w = [0, 1, 2].map((i) => X[3 * c + i] - X[3 * a + i]); A.set(tm.bface[t], (A.get(tm.bface[t]) || 0) + Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]) / 2); } return A; };
    const vol10 = (t10) => { let V = 0; for (let e = 0; e < t10.tets10.length / 10; e++) { const d = TM.t10DetJ(t10.nodes, t10.tets10.subarray(10 * e, 10 * e + 10)); V += (d[4] + d[5] + d[6] + d[7]) / 24; } return V; };
    const a = meshed(bar, 2.5), A = faceAreas(a.tm);
    ok(near(a.tm.stats.volume, 10000, 1e-6) && bar.faces.every((f, i) => near(A.get(i) || 0, f.area, 1e-6)) && a.tm.quality.minDihedral >= 45 - 1e-9, `100 × 10 × 10 block: ${a.tm.stats.tets} tets, volume 10000 exactly, every face's area exact, dihedral angles ${a.tm.quality.minDihedral.toFixed(1)}–${a.tm.quality.maxDihedral.toFixed(1)}°`);
    const b = meshed(plateHole, 3), Ab = faceAreas(b.tm), ih = cyl(plateHole, 5), Vb = vol10(b.t10);
    ok(rel(Vb, plateHole.regen.stats.volume, 2e-4) && rel(Ab.get(ih), plateHole.faces[ih].area, 0.01) && b.tm.quality.minDihedral > 10 && b.tm.stats.chamfers === 0, `plate with a Ø10 hole: T10 volume ${Vb.toFixed(2)} vs exact ${plateHole.regen.stats.volume.toFixed(2)} (${pct(Vb, plateHole.regen.stats.volume)}), hole face ${Ab.get(ih).toFixed(2)} vs ${plateHole.faces[ih].area.toFixed(2)} mm² (sharp rims recovered, ${b.tm.stats.featurePasses} refinement pass), dihedral ${b.tm.quality.minDihedral.toFixed(1)}–${b.tm.quality.maxDihedral.toFixed(1)}°, aspect ≤ ${b.tm.quality.maxAspect.toFixed(2)}`);
    const c = meshed(tube, 2.5), Vc = vol10(c.t10), Vl = c.tm.stats.volume, Vt = tube.regen.stats.volume;
    ok(rel(Vc, Vt, 5e-4) && c.t10.stats.curvedEdges > 100 && c.tm.quality.minDihedral > 10, `quarter tube a 10 b 20: linear ${pct(Vl, Vt)}, with midside nodes on the cylinders ${pct(Vc, Vt)} (${c.t10.stats.curvedEdges} curved edges, ${c.t10.stats.straightKept} kept straight); dihedral ≥ ${c.tm.quality.minDihedral.toFixed(1)}°`);
    // boundary midside nodes of faces on the cylinders (not kept straight) lie on them exactly
    let off = 0, cnt = 0; const X = c.t10.nodes, ci = [cyl(tube, 10), cyl(tube, 20)];
    for (let t = 0; t < c.t10.btri6.length / 6; t++) { const fi = c.t10.bface[t]; if (!ci.includes(fi)) continue; const R = fi === ci[0] ? 10 : 20; for (let k = 3; k < 6; k++) { const v = c.t10.btri6[6 * t + k], d = Math.abs(Math.hypot(X[3 * v], X[3 * v + 1]) - R); if (d < 0.01 * R) { off = Math.max(off, d); cnt++; } } }
    ok(off < 1e-9 && cnt > 500, `midside nodes of the faces on the cylinders lie on them exactly (${cnt}, worst ${off.toExponential(1)} mm)`);
    row('Mesh: plate with a hole, volume', `${plateHole.regen.stats.volume.toFixed(2)} mm³ (OCCT)`, `${Vb.toFixed(2)} mm³`, pct(Vb, plateHole.regen.stats.volume));
    row('Mesh: quarter tube, volume (T10)', `${Vt.toFixed(2)} mm³`, `${Vc.toFixed(2)} mm³`, pct(Vc, Vt));
  }

  section('tets: the element (quadrature, patch tests)');
  {
    const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
    const exact = (a, b, c, d) => fact(a) * fact(b) * fact(c) * fact(d) / fact(a + b + c + d + 3);   // ∫ L0^a L1^b L2^c L3^d on the unit tet
    const integ = (rule, a, b, c, d) => rule.reduce((s, [x, y, z, w]) => s + w * (1 - x - y - z) ** a * x ** b * y ** c * z ** d, 0);
    let e5 = 0, e2 = 0;
    for (let a = 0; a <= 5; a++) for (let b = 0; a + b <= 5; b++) for (let c = 0; a + b + c <= 5; c++) for (let d = 0; a + b + c + d <= 5; d++) { const ex = exact(a, b, c, d); e5 = Math.max(e5, Math.abs(integ(TF.RULE64, a, b, c, d) - ex) / ex); if (a + b + c + d <= 2) e2 = Math.max(e2, Math.abs(integ(TF.GP4, a, b, c, d) - ex) / ex); }
    ok(e5 < 1e-13 && e2 < 1e-13, `quadrature: the 64-point collapsed rule is exact to degree 5 (${e5.toExponential(1)}), the 4-point rule to degree 2 (${e2.toExponential(1)})`);
    let et = 0; const fT = (n) => fact(n);
    for (let a = 0; a <= 4; a++) for (let b = 0; a + b <= 4; b++) for (let c = 0; a + b + c <= 4; c++) { const ex = 2 * fT(a) * fT(b) * fT(c) / fT(a + b + c + 2) / 2; const v = TF.TRI6.reduce((s, [L0, L1, L2, w]) => s + w * L0 ** a * L1 ** b * L2 ** c, 0) / 2; et = Math.max(et, Math.abs(v - ex) / ex); }
    ok(et < 1e-12, `the 6-point triangle rule (face loads) is exact to degree 4 (${et.toExponential(1)})`);
    // a 30×30 stiffness: symmetric, six zero modes
    const X = new Float64Array([0, 0, 0, 2, 0, 0, 0, 1.5, 0, 0.2, 0.3, 1.7]), el10 = [...Array(10).keys()];
    const Xe = new Float64Array(30); Xe.set(X); [[0, 1], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3]].forEach(([i, j], k) => { for (let c = 0; c < 3; c++) Xe[3 * (4 + k) + c] = (X[3 * i + c] + X[3 * j + c]) / 2; });
    Xe[3 * 4 + 2] += 0.1;   // one curved edge
    const Ke = new Float64Array(900); TF.t10Stiffness(Xe, el10, 1000, FE.elasticD(0.3), Ke);
    let asym = 0, mx = 0; for (let i = 0; i < 30; i++) for (let j = 0; j < 30; j++) { asym = Math.max(asym, Math.abs(Ke[i * 30 + j] - Ke[j * 30 + i])); mx = Math.max(mx, Math.abs(Ke[i * 30 + j])); }
    const ev = FE.symEig(Ke, 30).values.sort((p, q) => p - q), zero = ev.filter((v) => Math.abs(v) < 1e-9 * ev[29]).length;
    ok(asym < 1e-12 * mx && zero === 6 && ev[6] > 1e-6 * ev[29], `a curved T10's stiffness is symmetric with exactly six zero modes (the rigid motions); the next ${(ev[6] / ev[29]).toExponential(1)} of the largest`);
    // patch test on the meshed block: three frictionless faces, a pull on the fourth → σxx uniform, u linear (exact)
    const blk = block(20, 10, 10), r = TF.solveTetStudy(job(blk, { h: 2.5, kind: 'static', tol: 1e-12, bcs: { constraints: [{ type: 'frictionless', faces: [plane(blk, [-1, 0, 0]), plane(blk, [0, -1, 0]), plane(blk, [0, 0, -1])] }], loads: [{ type: 'pressure', faces: [plane(blk, [1, 0, 0])], p: -100 }] } }));
    let eu = 0, es = 0; const zmin = blk.regen.stats.bbox.min[2], XX = r.model.X;
    for (let n = 0; n < r.model.n; n++) { const ux = 100 * XX[3 * n] / 2e5, uy = -0.26 * 100 * XX[3 * n + 1] / 2e5, uz = -0.26 * 100 * (XX[3 * n + 2] - zmin) / 2e5; eu = Math.max(eu, Math.abs(r.u[3 * n] - ux), Math.abs(r.u[3 * n + 1] - uy), Math.abs(r.u[3 * n + 2] - uz)); es = Math.max(es, Math.abs(r.sigN[6 * n] - 100), ...[1, 2, 3, 4, 5].map((k) => Math.abs(r.sigN[6 * n + k]))); }
    ok(eu < 1e-9 * 0.01 && es < 1e-6 * 100 && near(r.reaction[0], -10000, 1e-6), `patch test (meshed block, frictionless on 3 faces, 100 MPa pull): σxx = 100 everywhere to ${es.toExponential(1)} MPa, u = σx/E, −νσy/E … to ${eu.toExponential(1)} mm, reaction −10000 N`);
    row('Patch test, constant stress (straight tets)', 'σxx = 100 MPa, others 0', `max deviation ${es.toExponential(1)} MPa`, 'exact');
    // curved patch: a linear displacement field on the tube mesh (curved midsides) gives constant strain exactly
    const { model } = TF.meshJob({ mesh: tube.mesh, faces: tube.faces, h: 2.5 });
    const u = new Float64Array(model.N), G = [[1e-3, 2e-3, -1e-3], [3e-3, -2e-3, 1e-3], [0.5e-3, 1e-3, 2e-3]];
    for (let n = 0; n < model.n; n++) for (let i = 0; i < 3; i++) u[3 * n + i] = G[i][0] * model.X[3 * n] + G[i][1] * model.X[3 * n + 1] + G[i][2] * model.X[3 * n + 2];
    const K = TF.assemble(model, 2e5, 0.3).K, post = TF.tetPostprocess(model, K, u, new Float64Array(model.N), { nodes: new Int32Array(0), dirs: [] }, { E: 2e5, nu: 0.3 });
    const epsRef = [G[0][0], G[1][1], G[2][2], G[0][1] + G[1][0], G[1][2] + G[2][1], G[0][2] + G[2][0]];
    let ee = 0; for (let n = 0; n < model.n; n++) for (let k = 0; k < 6; k++) ee = Math.max(ee, Math.abs(post.epsN[6 * n + k] - epsRef[k]));
    ok(ee < 1e-12, `patch test on curved elements (the tube mesh, midside nodes on the cylinders): a linear displacement gives its constant strain at every node (${ee.toExponential(1)})`);
    row('Patch test, curved tets (linear field)', 'constant strain', `max deviation ${ee.toExponential(1)}`, 'exact');
  }

  section('tets: cantilever (beam theory), convergence, the solver');
  {
    const L = 100, I = 1e4 / 12, E = 2e5, Pf = 100, eb = Pf * L ** 3 / (3 * E * I), G = E / (2 * 1.26), tim = eb + Pf * L / (5 / 6 * G * 100);
    const runs = [5, 2.5].map((h) => { const t0 = Date.now(); const r = TF.solveTetStudy(job(bar, { h, kind: 'static', bcs: { constraints: [{ type: 'fixed', faces: [plane(bar, [-1, 0, 0])] }], loads: [{ type: 'force', faces: [plane(bar, [1, 0, 0])], total: Pf, dir: [0, -1, 0] }] } })); return { h, r, ms: Date.now() - t0 }; });
    const tip = (r) => { let s = 0, c = 0; for (let n = 0; n < r.model.n; n++) if (Math.abs(r.model.X[3 * n] - L) < 1e-9) { s -= r.u[3 * n + 1]; c++; } return s / c; };
    const d = runs.map((w) => tip(w.r));
    runs.forEach((w, i) => log(`cantilever h ${w.h}: ${w.r.summary.elements} T10, ${w.r.summary.dofs} unknowns, tip ${d[i].toFixed(6)} mm = ${pct(d[i], eb)} vs PL³/3EI, ${pct(d[i], tim)} vs Timoshenko; ${w.r.iterations} CG iterations, ${w.ms} ms, estimated error ${w.r.errorPct.toFixed(2)} %`));
    ok(d.every((x) => rel(x, eb, 0.005)) && d.every((x) => x < tim), 'tip deflection within 0.5 % of PL³/3EI at h 5 and 2.5 (between Euler–Bernoulli and Timoshenko, the fixed end holding Poisson\'s contraction)');
    ok(Math.abs(d[1] - d[0]) < 0.002 * eb && runs[1].r.errorPct < runs[0].r.errorPct, `mesh convergence: h 5 → 2.5 changes the tip by ${((d[1] / d[0] - 1) * 100).toFixed(3)} %, the error estimate falls ${runs[0].r.errorPct.toFixed(2)} → ${runs[1].r.errorPct.toFixed(2)} %`);
    ok(runs.every((w) => near(w.r.reaction[1], Pf, 1e-5) && near(w.r.reaction[0], 0, 1e-5)), 'reactions = the load (Σ Ry = 100 N)');
    // bending stress on the top surface at x = L/4 and L/2: σxx = P(L − x)c / I
    const r = runs[1].r, X = r.model.X;
    const top = (x) => { let s = 0, c = 0; for (let n = 0; n < r.model.n; n++) if (Math.abs(X[3 * n] - x) < 0.01 && Math.abs(X[3 * n + 1] - 10) < 1e-9 && X[3 * n + 2] > 2.4 && X[3 * n + 2] < 7.6) { s += r.sigN[6 * n]; c++; } return s / c; };
    const s25 = top(25), s50 = top(50), r25 = Pf * 75 * 5 / I, r50 = Pf * 50 * 5 / I;
    ok(rel(s25, r25, 0.01) && rel(s50, r50, 0.01), `bending stress on the top face: x = 25: ${s25.toFixed(3)} MPa vs P(L−x)c/I = ${r25.toFixed(3)} (${pct(s25, r25)}); x = 50: ${s50.toFixed(3)} vs ${r50.toFixed(3)} (${pct(s50, r50)})`);
    row('Cantilever 100×10×10 steel, tip deflection (h 2.5)', `PL³/3EI = ${eb.toFixed(6)} mm (Timoshenko ${tim.toFixed(6)})`, `${d[1].toFixed(6)} mm`, `${pct(d[1], eb)} (${pct(d[1], tim)})`);
    row('Cantilever, convergence h 5 → 2.5', 'tip deflection', `${d[0].toFixed(6)} → ${d[1].toFixed(6)} mm`, `change ${((d[1] / d[0] - 1) * 100).toFixed(3)} %`);
    row('Cantilever, root-side stress σxx at x = 25 (top)', `P(L−x)c/I = ${r25.toFixed(3)} MPa`, `${s25.toFixed(3)} MPa`, pct(s25, r25));
    row('Cantilever, mid-span stress σxx at x = 50 (top)', `${r50.toFixed(3)} MPa`, `${s50.toFixed(3)} MPa`, pct(s50, r50));
    // AMG and IC(0) give the same answer; AMG in far fewer iterations
    const { model } = TF.meshJob({ mesh: bar.mesh, faces: bar.faces, h: 2.5 });
    const asm = TF.assemble(model, E, 0.26), bc = TF.tetBoundaryConditions(model, { constraints: [{ type: 'fixed', faces: [plane(bar, [-1, 0, 0])] }], loads: [{ type: 'force', faces: [plane(bar, [1, 0, 0])], total: Pf, dir: [0, -1, 0] }] }, { faces: bar.faces, nodeVolN: asm.nodeVolN });
    const s1 = TF.tetPCG(model, TF.system(model, asm.K, bc.cons, { prec: 'ic0' }), bc.f, { tol: 1e-10 }), s2 = TF.tetPCG(model, TF.system(model, asm.K, bc.cons, { prec: 'amg' }), bc.f, { tol: 1e-10 });
    let diff = 0, mx = 0; for (let i = 0; i < model.N; i++) { diff = Math.max(diff, Math.abs(s1.u[i] - s2.u[i])); mx = Math.max(mx, Math.abs(s1.u[i])); }
    ok(s1.converged && s2.converged && diff < 1e-8 * mx && s2.iterations * 4 < s1.iterations, `algebraic multigrid = IC(0) to ${(diff / mx).toExponential(1)} in ${s2.iterations} CG iterations instead of ${s1.iterations}`);
    ok(throws(() => TF.solveTetStudy(job(bar, { h: 5, kind: 'static', bcs: { constraints: [{ type: 'frictionless', faces: [plane(bar, [-1, 0, 0])] }], loads: [{ type: 'force', faces: [plane(bar, [1, 0, 0])], total: 1, dir: 'normal' }] } })), /not held: it can still .*move along y/), 'one frictionless face only: refused, naming the free motions');
  }

  section('tets: plate with a hole (Kt) and a thick cylinder (Lamé), against the voxel mesh');
  {
    // half of a 200 × 50 plate, Ø10 hole (d/W = 0.2), 2 mm = half of a 4 mm plate; 10 MPa pull
    const hp = halfPlate(100, 25, 5, 2), sig = 10, kt = (2 + 0.8 ** 3) / 0.8, ref = kt * sig;
    const bcs = { constraints: [{ type: 'frictionless', faces: [plane(hp, [-1, 0, 0]), plane(hp, [0, -1, 0], [50, 0, 1]), plane(hp, [0, -1, 0], [150, 0, 1]), plane(hp, [0, 0, -1])] }], loads: [{ type: 'pressure', faces: [plane(hp, [1, 0, 0])], p: -sig }] };
    const t0 = Date.now(), r = TF.solveTetStudy(job(hp, { h: 4, kind: 'static', bcs })), ms = Date.now() - t0;
    const X = r.model.X, at90 = [];
    for (let n = 0; n < r.model.n; n++) if (Math.abs(Math.hypot(X[3 * n] - 100, X[3 * n + 1]) - 5) < 1e-6 && Math.abs(X[3 * n] - 100) < 1e-6) at90.push([X[3 * n + 2], r.sigN[6 * n]]);
    at90.sort((p, q) => p[0] - q[0]);
    const mean = at90.reduce((s, p) => s + p[1], 0) / at90.length, peak = Math.max(...at90.map((p) => p[1]));
    log(`plate with a hole: ${r.summary.elements} T10 (${ms} ms), σxx at the hole edge through the thickness ${at90.map((p) => `z ${p[0].toFixed(2)}: ${p[1].toFixed(2)}`).join(', ')} MPa; Heywood Kt·σ = ${ref.toFixed(3)}`);
    ok(rel(mean, ref, 0.02) && rel(peak, ref, 0.04) && near(r.reaction[0], -sig * 50, 1e-4), `the peak at the hole edge across the load: through-thickness mean ${mean.toFixed(3)} MPa (${pct(mean, ref)}), mid-plane ${peak.toFixed(3)} (${pct(peak, ref)}) vs Heywood's finite-width Kt ${kt.toFixed(3)} × 10 = ${ref.toFixed(3)} (the 3-D peak sits at mid-thickness); reaction = 500 N`);
    const vx = [2, 1].map((h) => ({ h, r: FE.solveStudy(job(hp, { h, kind: 'static', bcs })) }));
    vx.forEach((w) => log(`voxel h ${w.h}: ${w.r.summary.elements} cubes, max von Mises ${w.r.maxVm.value.toFixed(3)} MPa (${pct(w.r.maxVm.value, ref)})`));
    row('Plate with a hole, d/W 0.2, σxx at the hole (T10)', `Heywood Kt 2.512/0.8 × 10 = ${ref.toFixed(3)} MPa`, `${mean.toFixed(3)} (through-thickness mean), ${peak.toFixed(3)} mid-plane`, `${pct(mean, ref)} / ${pct(peak, ref)}`);
    vx.forEach((w) => row(`  same on the voxel mesh, h ${w.h} (${w.r.summary.elements} cubes)`, `${ref.toFixed(3)} MPa`, `${w.r.maxVm.value.toFixed(3)} MPa (max von Mises)`, pct(w.r.maxVm.value, ref)));
    ok(Math.abs(mean / ref - 1) < Math.min(...vx.map((w) => Math.abs(w.r.maxVm.value / ref - 1))), 'the tet mesh is closer to Kt than the voxel mesh at either size');

    // Lamé: a = 10, b = 20, p = 10 MPa, plane strain (both ends frictionless)
    const a = 10, b = 20, p = 10, E = 2e5, nu = 0.26, sth = p * (a * a + b * b) / (b * b - a * a), ur = (r0) => (1 + nu) / E * p * a * a / (b * b - a * a) * ((1 - 2 * nu) * r0 + b * b / r0);
    const lb = { constraints: [{ type: 'frictionless', faces: [plane(tube, [-1, 0, 0]), plane(tube, [0, -1, 0]), plane(tube, [0, 0, -1]), plane(tube, [0, 0, 1])] }], loads: [{ type: 'pressure', faces: [cyl(tube, a)], p }] };
    const rl = TF.solveTetStudy(job(tube, { h: 2.5, kind: 'static', bcs: lb })), XL = rl.model.X;
    let hoop = 0, hc = 0, ua = 0, uc = 0, ub = 0, ubc = 0;
    for (let n = 0; n < rl.model.n; n++) {
      const rr = Math.hypot(XL[3 * n], XL[3 * n + 1]), c = XL[3 * n] / rr, s = XL[3 * n + 1] / rr, u = rl.u[3 * n] * c + rl.u[3 * n + 1] * s;
      if (Math.abs(rr - a) < 1e-6) { ua += u; uc++; if (XL[3 * n + 2] > 1 && XL[3 * n + 2] < 9 && c > 0.2 && s > 0.2) { hoop += rl.sigN[6 * n] * s * s + rl.sigN[6 * n + 1] * c * c - 2 * rl.sigN[6 * n + 3] * s * c; hc++; } }
      if (Math.abs(rr - b) < 1e-6) { ub += u; ubc++; }
    }
    hoop /= hc; ua /= uc; ub /= ubc;
    ok(rel(hoop, sth, 0.02) && rel(ua, ur(a), 0.01) && rel(ub, ur(b), 0.01), `Lamé (plane strain): hoop stress at the bore ${hoop.toFixed(3)} MPa vs ${sth.toFixed(3)} (${pct(hoop, sth)}); radial displacement at a ${ua.toExponential(4)} vs ${ur(a).toExponential(4)} (${pct(ua, ur(a))}), at b ${pct(ub, ur(b))}`);
    const lv = FE.solveStudy(job(tube, { h: 1.25, kind: 'static', bcs: lb }));
    // voxel: hoop at the bore — nodal von Mises is the only stress it reports; compare its radial displacement at the bore instead
    let vua = 0, vc = 0; const gq = lv.grid;
    for (let n = 0; n < lv.vmNode.length; n++) { if (!Number.isFinite(lv.vmNode[n])) continue; const q = [gq.origin[0] + (n % (gq.nx + 1)) * gq.h, gq.origin[1] + (Math.floor(n / (gq.nx + 1)) % (gq.ny + 1)) * gq.h]; const rr = Math.hypot(q[0], q[1]); if (Math.abs(rr - a) < 0.7 * gq.h) { vua += (lv.u[3 * n] * q[0] + lv.u[3 * n + 1] * q[1]) / rr; vc++; } }
    vua /= vc;
    const vmRef = Math.sqrt(0.5 * ((sth + p) ** 2 + (-p - nu * (sth - p)) ** 2 + (nu * (sth - p) - sth) ** 2));
    log(`Lamé on voxels h 1.25 (${lv.summary.elements} cubes): bore radial displacement ${vua.toExponential(4)} (${pct(vua, ur(a))}), max von Mises ${lv.maxVm.value.toFixed(3)} vs the exact bore value ${vmRef.toFixed(3)} (${pct(lv.maxVm.value, vmRef)}); tets: max von Mises ${rl.maxVm.value.toFixed(3)} (${pct(rl.maxVm.value, vmRef)})`);
    row('Thick cylinder a 10 b 20, p 10, hoop at the bore (T10)', `Lamé ${sth.toFixed(3)} MPa`, `${hoop.toFixed(3)} MPa`, pct(hoop, sth));
    row('Thick cylinder, radial displacement at the bore (T10)', `${ur(a).toExponential(4)} mm`, `${ua.toExponential(4)} mm`, pct(ua, ur(a)));
    row('Thick cylinder, max von Mises (T10)', `${vmRef.toFixed(3)} MPa (bore)`, `${rl.maxVm.value.toFixed(3)} MPa`, pct(rl.maxVm.value, vmRef));
    row(`  same on the voxel mesh, h 1.25 (${lv.summary.elements} cubes)`, `${vmRef.toFixed(3)} MPa; u ${ur(a).toExponential(4)}`, `${lv.maxVm.value.toFixed(3)} MPa; u ${vua.toExponential(4)}`, `${pct(lv.maxVm.value, vmRef)}; ${pct(vua, ur(a))}`);
    ok(Math.abs(rl.maxVm.value / vmRef - 1) < Math.abs(lv.maxVm.value / vmRef - 1), 'the tet maximum von Mises is closer to Lamé than the voxel one (whose staircase bore has stress spikes)');
  }

  section('tets: natural frequency (Euler–Bernoulli) and the T10 thermal / buckling elements');
  {
    const f1 = 1.8751 ** 2 / (2 * Math.PI) * Math.sqrt(2e5 * (1e4 / 12) / (7.85e-9 * 100 * 1e8));
    const t0 = Date.now(), m = TF.solveTetStudy(job(bar, { h: 5, kind: 'modal', modes: 2, bcs: { constraints: [{ type: 'fixed', faces: [plane(bar, [-1, 0, 0])] }], loads: [] } }));
    ok(rel(m.freqs[0], f1, 0.01) && rel(m.freqs[1], m.freqs[0], 1e-4), `first bending frequency ${m.freqs[0].toFixed(2)} Hz vs Euler–Bernoulli ${f1.toFixed(2)} (${pct(m.freqs[0], f1)}; consistent mass, LOBPCG ${m.iterations} iterations, ${Date.now() - t0} ms); the square section's two bending modes coincide`);
    row('Cantilever, first natural frequency (h 5)', `Euler–Bernoulli ${f1.toFixed(2)} Hz`, `${m.freqs[0].toFixed(2)} Hz`, pct(m.freqs[0], f1));
    // the element interface
    ok(TH.ELEMENTS.tet10 === TE.TET10 && TE.TET10.npe === 10 && TE.TET10.nip === 4 && TE.TET10.face.npf === 6, 'thermal.js ELEMENTS.tet10 registered (10 nodes, 4 stress points, T6 facets)');
    const Xe = new Float64Array(30), base = [0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 0, 4]; Xe.set(base); [[0, 1], [1, 2], [0, 2], [0, 3], [1, 3], [2, 3]].forEach(([i, j], k) => { for (let c = 0; c < 3; c++) Xe[3 * (4 + k) + c] = (base[3 * i + c] + base[3 * j + c]) / 2; });
    const Kc = TE.TET10.conductivity(Xe, 2, new Float64Array(100)), C = TE.TET10.capacity(Xe, 5, new Float64Array(100), false), Cl = TE.TET10.capacity(Xe, 5, new Float64Array(10), true), Q = TE.TET10.heatLoad(Xe, 7, new Float64Array(10));
    const V = 4, rs = Math.max(...[...Array(10).keys()].map((a) => Math.abs(Kc.slice(10 * a, 10 * a + 10).reduce((s, v) => s + v, 0))));
    const g = TE.TET10.gradient(Xe, Float64Array.from({ length: 10 }, (_, a) => 2 * Xe[3 * a] - Xe[3 * a + 1] + 3 * Xe[3 * a + 2]), new Float64Array(3));
    ok(rs < 1e-12 && near(C.reduce((s, v) => s + v, 0), 5 * V, 1e-12) && near(Cl.reduce((s, v) => s + v, 0), 5 * V, 1e-12) && Cl.every((v) => v > 0) && near(Q.reduce((s, v) => s + v, 0), 7 * V, 1e-12) && near(g[0], 2, 1e-12) && near(g[1], -1, 1e-12) && near(g[2], 3, 1e-12), 'T10 thermal routines: conductivity rows sum to 0, capacity totals ρc·V (lumped: all positive), heat load totals Q·V, the gradient of a linear field exact');
    const Ff = TE.TET10.face.load(Float64Array.from([0, 0, 0, 2, 0, 0, 0, 3, 0, 1, 0, 0, 1, 1.5, 0, 0, 1.5, 0]), new Float64Array(6));
    ok(near(Ff.reduce((s, v) => s + v, 0), 3, 1e-12) && Ff.slice(0, 3).every((v) => near(v, 0, 1e-12)), 'T6 facet load: ∫N dA totals the area (3), corners 0 and midsides A/3 on a flat face');
    // radial conduction through the quarter tube
    const kW = steel.k * 1e-3, Qx = 2 * Math.PI * kW * 10 * 100 / Math.log(2) / 4;
    const th = TE.solveTetThermal(job(tube, { h: 2.5, kind: 'thermal', heat: [{ type: 'temperature', faces: [cyl(tube, 10)], T: 100 }, { type: 'temperature', faces: [cyl(tube, 20)], T: 0 }] }));
    let eT = 0; for (let n = 0; n < th.model.n; n++) { const rr = Math.hypot(th.model.X[3 * n], th.model.X[3 * n + 1]); eT = Math.max(eT, Math.abs(th.T[n] - 100 * (1 - Math.log(rr / 10) / Math.log(2)))); }
    ok(eT < 1 && rel(th.balance.inflow, Qx, 2e-3) && Math.abs(th.balance.imbalance) < 1e-6 * Qx, `radial conduction in the tube (100 °C bore, 0 °C outside): T within ${eT.toFixed(3)} K of the log profile, heat flow ${th.balance.inflow.toFixed(4)} W vs 2πkLΔT/ln 2 ÷ 4 = ${Qx.toFixed(4)} (${pct(th.balance.inflow, Qx)}), balance to ${Math.abs(th.balance.imbalance).toExponential(1)} W`);
    row('Radial conduction, quarter tube 10/20, 100 → 0 °C (T10)', `2πkLΔT/ln(b/a)/4 = ${Qx.toFixed(4)} W`, `${th.balance.inflow.toFixed(4)} W, T within ${eT.toFixed(3)} K of the log profile`, pct(th.balance.inflow, Qx));
    // thermal stress: restrained bar −EαΔT, free bar 0 and αΔT·L
    const b50 = block(50, 10, 10);
    const ts = TE.solveTetThermoStatic(job(b50, { h: 2.5, kind: 'static', thermalLoad: { mode: 'uniform', dT: 50 }, bcs: { constraints: [{ type: 'frictionless', faces: [plane(b50, [-1, 0, 0]), plane(b50, [1, 0, 0]), plane(b50, [0, -1, 0]), plane(b50, [0, 0, -1])] }], loads: [] } }));
    const sref = -steel.E * steel.alpha * 50; let se = 0; for (let n = 0; n < ts.model.n; n++) se = Math.max(se, Math.abs(ts.sigN[6 * n] - sref), Math.abs(ts.sigN[6 * n + 1]), Math.abs(ts.sigN[6 * n + 2]));
    const tf = TE.solveTetThermoStatic(job(b50, { h: 2.5, kind: 'static', thermalLoad: { mode: 'uniform', dT: 50 }, bcs: { constraints: [{ type: 'frictionless', faces: [plane(b50, [-1, 0, 0]), plane(b50, [0, -1, 0]), plane(b50, [0, 0, -1])] }], loads: [] } }));
    ok(se < 1e-6 * Math.abs(sref) && tf.maxVm.value < 1e-6 * Math.abs(sref) && rel(tf.maxDisp.vec[0], steel.alpha * 50 * 50, 1e-6), `thermal stress on tets, ΔT 50 K: restrained along x σxx = −EαΔT = ${sref.toFixed(1)} MPa (to ${se.toExponential(1)}, others 0); free: max von Mises ${tf.maxVm.value.toExponential(1)} MPa, the end moves ${tf.maxDisp.vec[0].toFixed(6)} = αΔT·L ${(steel.alpha * 2500).toFixed(6)} mm`);
    row('Thermal stress, bar restrained along x, ΔT 50 K (T10)', `−EαΔT = ${sref.toFixed(1)} MPa`, `max deviation ${se.toExponential(1)} MPa`, 'exact');
    // buckling of a fixed-free column
    const col = block(10, 200, 10), Pcr = Math.PI ** 2 * 2e5 * (1e4 / 12) / (4 * 200 ** 2);
    const t1 = Date.now(), bk = TE.solveTetBuckling(job(col, { h: 5, kind: 'buckling', modes: 2, bcs: { constraints: [{ type: 'fixed', faces: [plane(col, [0, -1, 0])] }], loads: [{ type: 'force', faces: [plane(col, [0, 1, 0])], total: 1000, dir: [0, -1, 0] }] } }));
    ok(bk.converged && rel(bk.factors[0] * 1000, Pcr, 0.005) && rel(bk.factors[1], bk.factors[0], 1e-4), `buckling of a 10 × 10 × 200 fixed-free column: load factor ${bk.factors[0].toFixed(4)} × 1000 N vs Euler π²EI/4L² = ${Pcr.toFixed(1)} N (${pct(bk.factors[0] * 1000, Pcr)}; ${bk.summary.elements} T10, ${Date.now() - t1} ms); both bending directions equal`);
    row('Buckling, fixed-free column 10×10×200 (T10, h 5)', `Euler π²EI/4L² = ${Pcr.toFixed(1)} N`, `${(bk.factors[0] * 1000).toFixed(1)} N`, pct(bk.factors[0] * 1000, Pcr));
  }

  section('tets: studies (sim.js) and the worker op');
  {
    const st = SIM.newSimStudy();
    ok(st.mesher === 'tet' && SIM.mesherOf(st) === 'tet', 'a new simulation study uses the tetrahedral mesh');
    const old = { v: 1, kind: 'static', material: 'steel', h: null, elem: 'h8i', modes: 4, seq: 0, constraints: [], loads: [] }, back = SIM.readSimStudy(JSON.parse(JSON.stringify(old)));
    ok(back.mesher === undefined && SIM.mesherOf(back) === 'voxel' && JSON.stringify(back) === JSON.stringify(old), 'a study saved before tets reads back unchanged and stays on the voxel mesh');
    ok(throws(() => SIM.readSimStudy({ ...old, mesher: 'hex' }), /mesh type/) && throws(() => SIM.readSimStudy({ ...old, refineCurved: 'yes' }), /refinement/), 'an unknown mesher or a bad refinement flag is refused');
    ok(SIM.mesherOf({ ...st, kind: 'flow' }) === 'voxel', 'a flow study keeps its own grid');
    const fixed = bar.faces[plane(bar, [-1, 0, 0])], end = bar.faces[plane(bar, [1, 0, 0])];
    const s2 = { ...st, material: 'steel', constraints: [{ id: 'c1', type: 'fixed', faces: [B.faceRef(fixed)] }], loads: [{ id: 'l2', type: 'force', faces: [B.faceRef(end)], total: 100, dir: [0, -1, 0] }] };
    const { job: j, problems, h } = SIM.simJob(SIM.readSimStudy(s2), bar.regen);
    ok(!problems.length && j.mesher === 'tet' && j.refineCurved === true && j.faces.every((f) => f.type === 'plane' && f.n && f.o) && j.mesh.edgeSegs && h === SIM.tetAutoSize(10000), `simJob for tets: the job carries mesher, exact face geometry and the B-rep edges; automatic size ${h} mm (about ${SIM.AUTO_ELEMENTS.tet} tets before grading)`);
    const sent = []; const w = TW.tetSolve(j, { progress() {}, transfer: (...b) => sent.push(...b) });
    const nv = w.plotMesh.positions.length / 3;
    ok(w.kind === 'static' && w.mesher === 'tet' && w.vertex.vm.length === nv && w.vertex.s1.length === nv && w.vertex.u.length === 3 * nv && w.plotMesh.lines.length > 0 && w.plotMesh.indices.length % 12 === 0 && w.summary.quality.minDihedral > 10, 'tetSolve (the worker op): a plot mesh of the tet surface (each T6 face as 4 triangles), nodal vm, principal stresses, strain, displacement, mesh lines, quality');
    ok(near(w.reaction[1], 100, 1e-5) && rel(w.maxDisp.value, 0.2, 0.01) && sent.length >= 8, `the op's answer: reactions 100 N, max displacement ${w.maxDisp.value.toFixed(5)} mm; arrays handed over as transfers`);
    // thermal and buckling studies through the same op
    const e0 = B.faceRef(fixed), e1 = B.faceRef(end);
    const ts = SIM.readSimStudy({ ...st, kind: 'thermal', material: 'steel', h: 5, heat: [{ id: 'h1', type: 'temperature', faces: [e0], T: 100 }, { id: 'h2', type: 'temperature', faces: [e1], T: 0 }], thermal: { gen: 0, transient: false, T0: 20, t: 60, steps: 30, scheme: 'euler' } });
    const wt = TW.tetSolve(SIM.simJob(ts, bar.regen).job), qx = steel.k * 1e-3 * 100 * 100 / 100;
    let tmax = -Infinity, tmin = Infinity; for (const v of wt.vertex.T) { tmax = Math.max(tmax, v); tmin = Math.min(tmin, v); }
    ok(wt.kind === 'thermal' && wt.mesher === 'tet' && wt.vertex.T.length === wt.plotMesh.positions.length / 3 && near(tmax, 100, 1e-9) && near(tmin, 0, 1e-9) && rel(wt.balance.inflow, qx, 1e-6), `a thermal study on tets through tetSolve: T 0…100 °C on the tet surface, heat flow ${wt.balance.inflow.toFixed(5)} W = kAΔT/L ${qx.toFixed(5)} (a linear field: exact)`);
    const bs = SIM.readSimStudy({ ...st, kind: 'buckling', material: 'steel', h: 5, modes: 1, constraints: [{ id: 'c1', type: 'fixed', faces: [e0] }], loads: [{ id: 'l2', type: 'force', faces: [e1], total: 1000, dir: [-1, 0, 0] }] });
    const wb = TW.tetSolve(SIM.simJob(bs, bar.regen).job), Pb = Math.PI ** 2 * 2e5 * (1e4 / 12) / (4 * 100 ** 2);
    ok(wb.kind === 'buckling' && wb.shapes.length === 1 && wb.shapes[0].length === wb.plotMesh.positions.length && rel(wb.factors[0] * 1000, Pb, 0.03), `a buckling study on tets through tetSolve: ${(wb.factors[0] * 1000).toFixed(0)} N vs π²EI/4L² ${Pb.toFixed(0)} N for the 100 mm bar (L/r 35, shear: ${pct(wb.factors[0] * 1000, Pb)}), its shape on the tet surface`);
  }

  log('verification (case | reference | result | error):');
  for (const r of table) log(`  ${r.join(' | ')}`);
  return table;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runTetTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
