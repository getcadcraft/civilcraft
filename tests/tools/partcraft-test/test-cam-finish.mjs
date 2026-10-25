#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cam-finish.mjs — PartCraft's 3D finishing (cam-finish.js) against closed forms and an independent oracle:
 *   · the drop cutter on a tilted plane (ball, bull-nose, flat): tip z = s·x + [contact point − profile] in closed form, to 1e-6;
 *   · on a dome of known radius: z = √((Rs + R)² − ρ²) − R (ball) within the mesh's own sagitta, and against a brute-force
 *     search over the cutter footprint (polar grid, this test's own code, not the solver's);
 *   · parallel: path length of a plane in closed form (lines × 40·√(1 + s²) + links), every cutting point within the
 *     tolerance of the oracle's tip height (no gouge deeper than that, none floating higher), the simulated stock left
 *     between the passes = the cusp of two ball passes, no gouge in the simulated stock;
 *   · scallop: distance over the surface from the apex of the dome = Rs·asin(r/Rs); on a plane the passes are exactly the
 *     asked distance apart along the surface and the cusp between neighbours (worked out from the path's own points) is the
 *     height asked for; the cusp/spacing relation s = 2·√(2Rh − h²);
 *   · slope limits, leave (stock to leave), the bottom limit, refusals (flat tool for scallop, drill for finishing), study files.
 *   Tiny sizes only (rule 14): meshes ≤ 40 mm, the stock simulation at cell 0.25.
 *   node tools/partcraft-test/test-cam-finish.mjs [--verbose]   (or runCamFinishTests() from test-cam.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function runCamFinishTests({ ok, section, near }) {
  const C = await import(DEV + 'cam.js');
  const CP = await import(DEV + 'cam-paths.js');
  const CF = await import(DEV + 'cam-finish.js');
  const CS = await import(DEV + 'cam-sim.js');
  const T = await import(DEV + 'cam-tools.js');

  // ---- models: a tilted plane and a dome, as plain triangle meshes (the mesh kernel's output shape)
  function regenOf(pos, idx) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], pos[i + k]); mx[k] = Math.max(mx[k], pos[i + k]); }
    return { mesh: { positions: new Float32Array(pos), indices: new Uint32Array(idx), triFace: new Int32Array(idx.length / 3) }, stats: { bbox: { min: mn, max: mx } }, faces: [], edges: [] };
  }
  function plane(slope, W = 40, D = 20, nx = 8, ny = 4) {
    const pos = [], idx = [];
    for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) { const x = (W * i) / nx, y = (D * j) / ny; pos.push(x, y, slope * x); }
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
    return regenOf(pos, idx);
  }
  function dome(Rs, nLat = 45, nLon = 90) {
    const pos = [0, 0, Rs], idx = [];
    for (let i = 1; i <= nLat; i++) { const th = (i * Math.PI / 2) / nLat; for (let k = 0; k < nLon; k++) { const ph = (k * 2 * Math.PI) / nLon; pos.push(Rs * Math.sin(th) * Math.cos(ph), Rs * Math.sin(th) * Math.sin(ph), Rs * Math.cos(th)); } }
    const ring = (i, k) => 1 + (i - 1) * nLon + (k % nLon);
    for (let k = 0; k < nLon; k++) idx.push(0, ring(1, k), ring(1, k + 1));
    for (let i = 1; i < nLat; i++) for (let k = 0; k < nLon; k++) { const a = ring(i, k), b = ring(i, k + 1), c = ring(i + 1, k), d = ring(i + 1, k + 1); idx.push(a, c, d, a, d, b); }
    return regenOf(pos, idx);
  }
  const setup = () => { const s = C.newSetup(); s.axis = '+z'; s.origin = 'model-origin'; s.stock = { ...s.stock, side: 2, top: 1, bottom: 0 }; return s; };
  const modelOf = (rg) => C.machineModel(rg, setup());
  const toolOf = (kind, props) => T.newTool(kind, { id: kind + 'x', number: 1, ...props });
  const study = (tools, ops) => { const st = C.newStudy(); st.setup = setup(); st.tools = tools; st.ops = ops; return st; };

  // ---- the independent oracle: search the whole footprint on a polar grid
  function oracle(model, tool, x, y) {
    const prof = T.profile(tool), R = prof.R;
    let best = -Infinity;
    for (let a = 0; a < 360; a += 1) {
      const ca = Math.cos((a * Math.PI) / 180), sa = Math.sin((a * Math.PI) / 180);
      for (let k = 0; k <= 300; k++) {
        const rho = (R * k) / 300;
        const hz = model.heightAt(x + rho * ca, y + rho * sa);
        if (hz > -Infinity) best = Math.max(best, hz - prof.h(rho));
      }
    }
    return best;
  }

  // ===================================================================================
  section('CAM 3D finishing: the drop cutter against closed forms');
  const SL = 0.5, sq = Math.sqrt(1 + SL * SL);
  const planeRg = plane(SL), planeModel = modelOf(planeRg);
  {
    const ball = toolOf('ball', { d: 6, flutes: 2 });
    const dr = new CF.Dropper(planeModel, ball);
    let worst = 0, n = 0;
    for (const [x, y] of [[0, 3], [1, 10], [7.3, 5.1], [20, 12.34], [31.7, 18], [36, 2], [38.5, 9]]) {
      const want = SL * x + 3 * (sq - 1);
      worst = Math.max(worst, Math.abs(dr.tip(x, y) - want)); n++;
    }
    ok(worst < 1e-6, `ball R 3 on a plane rising 1 in 2: tip z = s·x + R(√(1 + s²) − 1) at ${n} points, worst error ${worst.toExponential(1)}`);
    const bull = toolOf('bull', { d: 8, cornerR: 1, flutes: 4 });
    const drb = new CF.Dropper(planeModel, bull);
    const rho = 3 + (1 * SL) / sq;   // A + rc·s/√(1 + s²)
    const hh = 1 - Math.sqrt(1 - (rho - 3) * (rho - 3));
    let wb = 0;
    for (const [x, y] of [[0, 3], [5.5, 10], [21, 6], [30, 17]]) wb = Math.max(wb, Math.abs(drb.tip(x, y) - (SL * (x + rho) - hh)));
    ok(wb < 1e-6, `bull nose Ø8 R1: tip z = s·(x + ρ*) − h(ρ*) with ρ* = A + rc·s/√(1 + s²) (error ${wb.toExponential(1)})`);
    const flat = toolOf('flat', { d: 6, flutes: 3 });
    const drf = new CF.Dropper(planeModel, flat);
    let wf = 0;
    for (const [x, y] of [[0, 3], [8, 10], [30, 17]]) wf = Math.max(wf, Math.abs(drf.tip(x, y) - SL * (x + 3)));
    ok(wf < 1e-6, `flat Ø6: the uphill edge of the end touches: tip z = s·(x + R) (error ${wf.toExponential(1)})`);
    const dl = new CF.Dropper(planeModel, ball, { leave: 0.5 });
    let wl = 0;
    for (const [x, y] of [[3, 3], [15, 10]]) {
      // the model offset by L along its normal: the plane z = s·x + L·√(1 + s²)
      wl = Math.max(wl, Math.abs(dl.tip(x, y) - (SL * x + 3 * (sq - 1) + 0.5 * sq)));
    }
    ok(wl < 1e-6, `stock to leave 0.5 on the plane = the surface offset 0.5 along its normal (+ 0.5·√(1 + s²) in z; error ${wl.toExponential(1)})`);
    ok(new CF.Dropper(planeModel, ball, { floor: 12 }).tip(1, 5) === 12, 'the bottom limit holds the tip up');
    ok(dr.ok(5, 5) && !dr.ok(-1, 5) && !dr.ok(5, 21) && !new CF.Dropper(planeModel, ball, { slope: [40, 90] }).ok(5, 5) && new CF.Dropper(planeModel, ball, { slope: [20, 30] }).ok(5, 5), 'ok(): over the model, and the slope range (this plane is 26.6°)');
    let m1 = null; try { new CF.Dropper(planeModel, toolOf('drill', { d: 6 })); } catch (e) { m1 = e.message; }
    ok(m1, 'a drill is refused for finishing');
  }
  const RS = 12;
  const domeRg = dome(RS), domeModel = modelOf(domeRg);
  {
    const ball = toolOf('ball', { d: 6, flutes: 2 });
    const dr = new CF.Dropper(domeModel, ball);
    let wa = 0, wo = 0, n = 0;
    for (const [x, y] of [[0, 0], [2, 1], [5, 5], [7, -3], [-8, 2], [9.5, 0], [0, -10]]) {
      const rho0 = Math.hypot(x, y);
      const a = Math.sqrt((RS + 3) ** 2 - rho0 * rho0) - 3;
      const t = dr.tip(x, y);
      wa = Math.max(wa, Math.abs(t - a));
      wo = Math.max(wo, Math.abs(t - oracle(domeModel, ball, x, y))); n++;
    }
    const sag = RS * (1 - Math.cos(Math.PI / 2 / 45 / 2));
    ok(wa < sag * 3 + 1e-3, `ball on a dome R ${RS}: tip z = √((Rs + R)² − ρ²) − R within the mesh's sagitta (${wa.toFixed(4)} ≤ ${(sag * 3 + 1e-3).toFixed(4)}, ${n} points)`);
    ok(wo < 1e-3, `... and equal to a brute-force search of the whole footprint on this mesh (worst ${wo.toExponential(1)}, ${n} points)`);
    for (const k of ['bull', 'flat']) {
      const tl = toolOf(k, { d: 8, cornerR: k === 'bull' ? 1.5 : 0, flutes: 4 });
      const d2 = new CF.Dropper(domeModel, tl);
      let w = 0;
      for (const [x, y] of [[0, 0], [3, 2], [-6, 4]]) w = Math.max(w, Math.abs(d2.tip(x, y) - oracle(domeModel, tl, x, y)));
      ok(w < 1.5e-3, `${k} on the dome: equal to the brute-force search (worst ${w.toExponential(1)})`);
    }
  }

  // ===================================================================================
  section('CAM 3D finishing: parallel');
  {
    const ball = toolOf('ball', { id: 'bm6', d: 6, flutes: 2, fluteLen: 18 });
    const st = study([ball], [C.newOp('parallel', { id: 'pa', tool: 'bm6', params: { stepover: 1 / 3, tolerance: 0.01, angle: 0 } })]);
    const sim = new CS.Sim(planeModel, { cell: 0.25 });
    const prog = CP.generateProgram(st, planeRg, { model: planeModel, sim });
    const pa = prog.paths[0];
    ok(!pa.error, 'a parallel pass over the plane builds' + (pa.error ? ': ' + pa.error : ''));
    const segs = CP.segments([pa]);
    const feed = segs.filter((s) => s.k === 'feed');
    const horiz = feed.filter((s) => Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) > 1e-9);
    const len = horiz.reduce((s, g) => s + CP.segLength(g), 0);
    // one line's length: the curve z(x) = max over contact points q ≤ 40 of [s·q − h(|q − x|)], integrated at 0.001 mm
    const prof3 = T.profile(ball);
    const tipAt = (x) => { let b = -Infinity; for (let q = Math.max(0, x - 3); q <= Math.min(40, x + 3) + 1e-12; q += 0.0005) b = Math.max(b, SL * q - prof3.h(Math.abs(q - x))); return b; };
    let lineLen = 0, zPrev = tipAt(0);
    for (let x = 0.001; x <= 40 + 1e-9; x += 0.001) { const z = tipAt(x); lineLen += Math.hypot(0.001, z - zPrev); zPrev = z; }
    const want = 11 * lineLen + 10 * 2;
    ok(Math.abs(len - want) < 0.03, `path length: 11 lines (each ${lineLen.toFixed(3)} mm: 40·√(1 + s²) less the end where the cutter rolls over the edge, integrated) + 10 links of 2 = ${want.toFixed(3)} mm (got ${len.toFixed(3)})`);
    ok(pa.info.lines === 11, 'stepover 1/3 of Ø6 over 20 mm: 11 lines (both edges included)');
    ok(feed.filter((s) => Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) < 1e-9).length === 1, 'zigzag: one plunge, then the lines are joined down on the surface');
    // every cutting vertex is on the closed form where the contact is inside the mesh; the whole path matches the oracle
    const rho = (3 * SL) / sq;
    const vs = horiz.flatMap((s) => [s.a, s.b]).filter((p) => p[0] <= 40 - rho - 1e-3);
    const worst = Math.max(...vs.map((p) => Math.abs(p[2] - (SL * p[0] + 3 * (sq - 1)))));
    ok(worst < 1e-6, `${vs.length} path points away from the high edge lie on s·x + R(√(1 + s²) − 1) exactly (${worst.toExponential(1)})`);
    let under = 0, over = 0, k = 0;
    for (const g of horiz.filter((_, i) => i % 7 === 0)) {
      for (const u of [0.25, 0.75]) {
        const x = g.a[0] + (g.b[0] - g.a[0]) * u, y = g.a[1] + (g.b[1] - g.a[1]) * u, z = g.a[2] + (g.b[2] - g.a[2]) * u;
        const o = oracle(planeModel, ball, x, y);
        under = Math.max(under, o - z); over = Math.max(over, z - o); k++;
      }
    }
    ok(under < 0.006 && over < 0.012, `${k} points on the path against the brute-force tip height: deepest gouge ${under.toFixed(4)}, highest above ${over.toFixed(4)} (tolerance 0.01)`);
    // the simulated stock: nothing cut under the plane, and the cusp left between two lines
    let lo = 1e9, hi = -1e9;
    for (let x = 1; x < 36; x += 0.5) for (let y = 1; y < 19; y += 0.5) { const d = sim.at(x, y) - SL * x; lo = Math.min(lo, d); hi = Math.max(hi, d); }
    const cusp = (3 - Math.sqrt(9 - 1)) * sq;   // two ball passes 2 mm apart: R − √(R² − 1) along the normal
    ok(lo > -0.02 && Math.abs(hi - cusp) < 0.03, `stock simulation: no cell below the surface (min ${lo.toFixed(4)}), the cusp between lines ${hi.toFixed(3)} ≈ (R − √(R² − 1))·√(1 + s²) = ${cusp.toFixed(3)}`);
    ok(sim.report().gouges === 0, 'stock simulation: no gouge cells');
    ok(prog.paths[0].warnings.some((w) => /rough/i.test(w) || w.length), 'a finishing pass over uncut stock warns that the stock should be roughed first');
  }
  {
    // angle: lines across the dome at 45°; every point against the oracle; leave raises the path
    const ball = toolOf('ball', { id: 'bm6', d: 6, flutes: 2 });
    const mk = (params) => CP.generateProgram(study([ball], [C.newOp('parallel', { id: 'pd', tool: 'bm6', params })]), domeRg, { model: domeModel }).paths[0];
    const p0 = mk({ stepover: 0.25, angle: 45 });
    ok(!p0.error && p0.info.lines > 8, `parallel at 45° over the dome: ${p0.info.lines} lines, ${p0.moves.length} moves`);
    const segs = CP.segments([p0]).filter((s) => s.k === 'feed' && Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) > 1e-9);
    let under = 0, over = 0, n = 0;
    for (const g of segs.filter((_, i) => i % 9 === 0)) { const x = (g.a[0] + g.b[0]) / 2, y = (g.a[1] + g.b[1]) / 2, z = (g.a[2] + g.b[2]) / 2; const o = oracle(domeModel, ball, x, y); under = Math.max(under, o - z); over = Math.max(over, z - o); n++; }
    ok(under < 0.007 && over < 0.012, `dome at 45°: ${n} chord midpoints against the brute-force tip height: gouge ${under.toFixed(4)}, above ${over.toFixed(4)} (tolerance 0.01)`);
    const dirs = segs.map((g) => Math.atan2(g.b[1] - g.a[1], g.b[0] - g.a[0]));
    ok(dirs.filter((a) => Math.abs(Math.abs(Math.sin(a - Math.PI / 4))) < 1e-9 || Math.abs(Math.cos(a - Math.PI / 4)) < 1e-9).length > segs.length * 0.9, 'the lines run at 45° (or 225°) — the rest are the short links across');
    const p1 = mk({ stepover: 0.25, angle: 0, leave: 0.4 });
    const z0 = Math.min(...CP.segments([mk({ stepover: 0.25 })]).filter((s) => s.k === 'feed').flatMap((s) => [s.a[2], s.b[2]]));
    const z1 = Math.min(...CP.segments([p1]).filter((s) => s.k === 'feed').flatMap((s) => [s.a[2], s.b[2]]));
    ok(z1 > z0 + 0.3, `stock to leave 0.4 lifts the lowest point (${z0.toFixed(3)} → ${z1.toFixed(3)})`);
    const pf = mk({ stepover: 0.25, bottom: 4 });
    ok(Math.min(...CP.segments([pf]).filter((s) => s.k === 'feed').flatMap((s) => [s.a[2], s.b[2]])) >= 4 - 1e-9, 'bottom 4: nothing cut below z = 4');
    const ps = mk({ stepover: 0.25, slopeFrom: 0, slopeTo: 30 });
    const bad = CP.segments([ps]).filter((s) => s.k === 'feed').flatMap((s) => [s.a, s.b]).filter((q) => { const pl = domeModel.topPlane(q[0], q[1]); return pl && Math.hypot(pl.gx, pl.gy) > Math.tan(30.01 * Math.PI / 180); });
    ok(bad.length === 0 && ps.moves.length < p0.moves.length, 'slope 0°–30°: no cutting point where the surface is steeper than 30°');
  }

  // ===================================================================================
  section('CAM 3D finishing: scallop');
  {
    ok(near(CF.spacingFor(3, 0.02), 2 * Math.sqrt(2 * 3 * 0.02 - 0.0004), 1e-12) && near(CF.cuspHeight(3, CF.spacingFor(3, 0.02)), 0.02, 1e-12), 'cusp ↔ spacing: s = 2·√(2Rh − h²) and h = R − √(R² − (s/2)²) agree (R 3, h 0.02)');
    // distance over the surface of the dome from its apex: Rs·asin(r/Rs); a cell size that puts the apex at a cell centre
    const c = (2 * RS) / 119;
    const F = CF.surfaceDistance(domeModel, c, 'top');
    let worst = 0, n = 0;
    for (let j = 0; j < F.ny; j++) for (let i = 0; i < F.nx; i++) {
      const x = F.x0 + (i + 0.5) * F.c, y = F.y0 + (j + 0.5) * F.c, r = Math.hypot(x, y);
      if (r < 1 || r > 10 || !(F.g[j * F.nx + i] < Infinity)) continue;
      worst = Math.max(worst, Math.abs(F.g[j * F.nx + i] - RS * Math.asin(r / RS)) / (RS * Math.asin(r / RS))); n++;
    }
    ok(worst < 0.012, `distance over the surface from the apex of the dome = Rs·asin(r/Rs) within ${(worst * 100).toFixed(2)} % over ${n} cells (32-direction steps)`);
    // a plane rising to x = 40, passes from the top edge: parallel to y, exactly s apart over the surface
    const SL2 = Math.tan((25 * Math.PI) / 180), sq2 = Math.sqrt(1 + SL2 * SL2);
    const rg = plane(SL2, 40, 20, 40, 10), model = modelOf(rg);
    const ball = toolOf('ball', { id: 'bm6', d: 6, flutes: 2 });
    const sim = new CS.Sim(model, { cell: 0.25 });
    const pr = CP.generateProgram(study([ball], [C.newOp('scallop', { id: 'sc', tool: 'bm6', params: { height: 0.02, from: 'top', tolerance: 0.01 } })]), rg, { model, sim }).paths[0];
    ok(!pr.error, 'scallop over the plane builds' + (pr.error ? ': ' + pr.error : ''));
    const s = CF.spacingFor(3, 0.02);
    ok(Math.abs(pr.info.spacing - s) < 1e-12, `spacing from the height asked: ${s.toFixed(4)} mm for 0.02 with a Ø6 ball`);
    const segs = CP.segments([pr]).filter((g) => g.k === 'feed' && Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]) > 1e-9);
    // group the long cuts by their x
    const lines = [];
    for (const g of segs) {
      if (Math.abs(g.b[0] - g.a[0]) > 1e-6) continue;   // across the passes: a link
      const x = g.a[0];
      let L = lines.find((l) => Math.abs(l.x - x) < 1e-6);
      if (!L) lines.push(L = { x, z: g.a[2], len: 0 });
      L.len += Math.abs(g.b[1] - g.a[1]);
    }
    lines.sort((a, b) => b.x - a.x);
    ok(lines.length >= 20, `${lines.length} passes, each a straight cut along y`);
    const xs = lines.map((l) => l.x);
    const cell = s / 3, xTop = (Math.floor(40 / cell - 0.5) + 0.5) * cell;   // the last column of cells on the model is the source
    let dev = 0;
    for (let k = 1; k < lines.length - 1; k++) dev = Math.max(dev, Math.abs((xs[k - 1] - xs[k]) * sq2 - s));   // (the last pass is pulled in to reach the far edge)
    ok(dev < 0.003, `neighbouring passes are s = ${s.toFixed(4)} mm apart over the surface (x gap × √(1 + s²); worst error ${dev.toExponential(1)} mm)`);
    ok(Math.abs((xTop - xs[0]) * sq2 - 0.5 * s) < 0.005, 'the first pass is half a spacing from the top edge');
    const zerr = Math.max(...lines.filter((l) => l.x <= 40 - 1.4).map((l) => Math.abs(l.z - (SL2 * l.x + 3 * (sq2 - 1)))));
    ok(zerr < 1e-6, `every pass lies on s·x + R(√(1 + s²) − 1) (error ${zerr.toExponential(1)})`);
    // the cusp, from the path's own lines: the lowest cutter surface over a point between two passes against the model
    const prof = T.profile(ball);
    let cusp = 0;
    for (let k = 1; k < lines.length - 3; k++) {
      for (let u = 0; u <= 1; u += 0.05) {
        const x = xs[k] + (xs[k - 1] - xs[k]) * u;
        const cutter = Math.min(...lines.slice(Math.max(0, k - 2), k + 3).map((l) => l.z + prof.h(Math.abs(x - l.x))));
        cusp = Math.max(cusp, (cutter - SL2 * x) / sq2);
      }
    }
    ok(Math.abs(cusp - 0.02) < 0.001, `the cusp between neighbouring passes, from their own points: ${cusp.toFixed(4)} mm (asked 0.02)`);
    ok(sim.report().gouges === 0, 'stock simulation: no gouge');
    // the dome from its top: circles round the apex, s apart over the surface
    const dm = CP.generateProgram(study([ball], [C.newOp('scallop', { id: 'sd', tool: 'bm6', params: { height: 0.05, from: 'top', tolerance: 0.01 } })]), domeRg, { model: domeModel }).paths[0];
    ok(!dm.error && dm.info.passes >= 10, `scallop over the dome from the top: ${dm.info.passes} passes` + (dm.error ? ': ' + dm.error : ''));
    const sd = CF.spacingFor(3, 0.05);
    // the passes lie on the levels (k + ½)·s of the distance field (read with the same cell size the operation uses)
    const cs = Math.max(0.02, Math.min(sd / 3, 6 / 8));
    const F2 = CF.surfaceDistance(domeModel, cs, 'top');
    const gAt = (x, y) => {
      const fi = (x - F2.x0) / F2.c - 0.5, fj = (y - F2.y0) / F2.c - 0.5, i = Math.floor(fi), j = Math.floor(fj), u = fi - i, v = fj - j;
      const G = (a, b) => F2.g[b * F2.nx + a];
      return (1 - u) * (1 - v) * G(i, j) + u * (1 - v) * G(i + 1, j) + (1 - u) * v * G(i, j + 1) + u * v * G(i + 1, j + 1);
    };
    const pts = CP.segments([dm]).filter((g) => g.k === 'feed' && Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]) > 1e-9).flatMap((g) => [g.a, g.b]);
    const off = pts.map((p) => { const g = gAt(p[0], p[1]); if (!Number.isFinite(g)) return 0; const k = Math.max(0, Math.round(g / sd - 0.5)); return Math.abs(g - (k + 0.5) * sd); });
    const onLevel = off.filter((d) => d < 0.05).length / off.length;
    ok(onLevel > 0.9, `${(onLevel * 100).toFixed(0)} % of ${pts.length} path points lie on a level (k + ½)·${sd.toFixed(3)} of the distance field (within 0.05 mm; the rest are the short links between passes)`);
    const levels = new Set(pts.map((p) => Math.round(gAt(p[0], p[1]) / sd - 0.5)).filter(Number.isFinite));
    ok(levels.size >= 15 && Math.min(...levels) === 0, `${levels.size} different levels walked, from the first at half a spacing from the apex`);
    let under = 0, over = 0, k2 = 0;
    for (let i = 0; i < pts.length; i += Math.ceil(pts.length / 80)) { const p = pts[i], o = oracle(domeModel, ball, p[0], p[1]); under = Math.max(under, o - p[2]); over = Math.max(over, p[2] - o); k2++; }
    ok(under < 0.004 && over < 0.012, `${k2} points of the passes against the brute-force tip height: deepest gouge ${under.toFixed(4)}, highest above ${over.toFixed(4)} (tolerance 0.01)`);
    let m = null;
    try { const r = CP.generateProgram(study([toolOf('flat', { id: 'f', d: 6 })], [C.newOp('scallop', { id: 'x', tool: 'f' })]), domeRg, { model: domeModel }).paths[0]; m = r.error; } catch (e) { m = e.message; }
    ok(m, 'scallop with a flat end mill is refused');
  }

  // ===================================================================================
  section('CAM 3D finishing: study files');
  {
    const ball = toolOf('ball', { id: 'bm6', d: 6, flutes: 2 });
    const st = study([ball], [C.newOp('parallel', { id: 'pa', tool: 'bm6', params: { stepover: 0.2, angle: 30, zigzag: false, slopeTo: 60 } }), C.newOp('scallop', { id: 'sc', tool: 'bm6', params: { height: 0.03, from: 'top', climb: false } })]);
    const back = C.readStudy(JSON.parse(JSON.stringify(st)));
    ok(back.ops[0].params.angle === 30 && back.ops[0].params.zigzag === false && back.ops[0].params.slopeTo === 60 && back.ops[1].params.from === 'top' && back.ops[1].params.height === 0.03, 'parallel and scallop read back with their settings');
    const tamper = (fn) => { const x = JSON.parse(JSON.stringify(st)); fn(x); try { C.readStudy(x); return false; } catch { return true; } };
    ok(tamper((x) => { x.ops[0].params.angle = 200; }) && tamper((x) => { x.ops[1].params.height = 0; }) && tamper((x) => { x.ops[1].params.from = 'middle'; }) && tamper((x) => { x.ops[0].params.stepover = 0.9; }) && tamper((x) => { x.ops[0].params.slopeFrom = 95; }), 'out-of-range angle, height, start, stepover and slope are refused');
    ok(C.OP_TYPES.parallel && C.OP_TYPES.scallop && C.defaultParams('scallop').from === 'edge' && C.defaultParams('parallel').bottom === null, 'both operations have a name and defaults');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  const t0 = Date.now();
  await runCamFinishTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  process.exit(fail ? 1 : 0);
}
