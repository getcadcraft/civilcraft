#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cam-multiaxis.mjs — PartCraft's 0.11 Track CAM (3D roughing and rest machining, tilted tool directions, 5-axis and
 * 4th-axis finishing, turning, probing, and the posts that write them) against closed forms and oracles of this test's own:
 *   · kinematics: the tool direction rebuilt from the rotary positions = the direction asked for, for every machine kind,
 *     table and head; a table's turn brings the direction onto the spindle axis;
 *   · 3D roughing: every cutting point is at or above the exact drop cutter of cam-finish.js for the real tool + stock to
 *     leave (the roughing grid is not used to check itself); the stock simulation finds no gouge and no rapid in stock;
 *     rest machining with a smaller tool cuts less than the same tool on full stock and leaves less;
 *   · a tilted operation: the part in the tilted frame, the path's frame, rotary positions and written coordinates in the posts;
 *   · 5-axis finishing on a dome: the ball's centre (tip + R·direction) on the centre surface, the direction along the
 *     sphere's radius, the tilt limit, G-code read back to the tool tip;
 *   · rotary finishing: the radial drop on a cylinder and a square bar in closed form and against a brute-force search;
 *     the written Y stays on the axis for a table machine;
 *   · turning: the spun profile and the tool's reach in closed form, every cutting point clear of the true outline by the
 *     nose radius (point-to-outline distance, this test's own), no gouge in the lathe's stock, removed volume near the
 *     closed form, diameters and G96/G32 in the lathe posts;
 *   · probing: touches, expected values and what each post writes.
 *   Tiny sizes only: meshes ≤ 60 mm, grids of a few thousand points.
 *   node tools/partcraft-test/test-cam-multiaxis.mjs [--verbose]   (or runCamMultiaxisTests() from test-cam.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function runCamMultiaxisTests({ ok, section, near }) {
  const C = await import(DEV + 'cam.js');
  const CP = await import(DEV + 'cam-paths.js');
  const CF = await import(DEV + 'cam-finish.js');
  const CS = await import(DEV + 'cam-sim.js');
  const T = await import(DEV + 'cam-tools.js');
  const K = await import(DEV + 'cam-kin.js');
  const R3 = await import(DEV + 'cam-rough3d.js');
  const MX = await import(DEV + 'cam-multiaxis.js');
  const TU = await import(DEV + 'cam-turn.js');
  const PO = await import(DEV + 'cam-post.js');
  const PD = await import(DEV + 'cam-postdef.js');
  const DEG = Math.PI / 180;
  const hyp = Math.hypot;
  // A message is matched by its key (what t() gives when no language is loaded, as when this file runs alone) or by its English
  // text with anything in place of {…} (as when test-cam.mjs has loaded the language file). A key ending in _ means any that start so.
  const EN = JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8'));
  const says = (key) => {
    const keys = key.endsWith('_') ? Object.keys(EN).filter((k) => k.startsWith(key)) : [key];
    const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp([esc(key), ...keys.map((k) => String(EN[k] || k).split(/\{[a-z_]+\}/).map(esc).join('[\\s\\S]*?'))].join('|'));
  };

  // ---------------------------------------------------------------- meshes (the mesh kernel's output shape)
  function regenOf(pos, idx, faces = [], triFace = null) {
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], pos[i + k]); mx[k] = Math.max(mx[k], pos[i + k]); }
    return { mesh: { positions: new Float32Array(pos), indices: new Uint32Array(idx), triFace: triFace ? new Int32Array(triFace) : new Int32Array(idx.length / 3) }, stats: { bbox: { min: mn, max: mx } }, faces, edges: [] };
  }
  /** A box as 12 triangles (outward), appended to pos/idx; face ids f..f+5 (−x, +x, −y, +y, −z, +z) pushed to tf. */
  function addBox(pos, idx, tf, a, b, f0 = 0) {
    const o = pos.length / 3;
    for (const z of [a[2], b[2]]) for (const y of [a[1], b[1]]) for (const x of [a[0], b[0]]) pos.push(x, y, z);
    const q = (i, j, k, l, f) => { idx.push(o + i, o + j, o + k, o + i, o + k, o + l); tf.push(f, f); };
    q(0, 4, 6, 2, f0); q(1, 3, 7, 5, f0 + 1); q(0, 1, 5, 4, f0 + 2); q(2, 6, 7, 3, f0 + 3); q(0, 2, 3, 1, f0 + 4); q(4, 5, 7, 6, f0 + 5);
  }
  /** A stepped block: base 40 × 30 × 10 with a 20 × 14 boss 10 high on it (z 0–20). */
  function stepBlock() {
    const pos = [], idx = [], tf = [];
    addBox(pos, idx, tf, [0, 0, 0], [40, 30, 10]);
    addBox(pos, idx, tf, [10, 8, 10], [30, 22, 20]);
    return regenOf(pos, idx);
  }
  /** A dome: the cap of a sphere of radius Rs over a disc of radius a, on a grid (closed below by a flat). */
  function dome(Rs = 30, a = 18, n = 36) {
    const pos = [], idx = [];
    const zc = -Math.sqrt(Rs * Rs - a * a);
    for (let j = 0; j <= n; j++) for (let i = 0; i <= n; i++) {
      const x = -a + (2 * a * i) / n, y = -a + (2 * a * j) / n, r2 = x * x + y * y;
      pos.push(x, y, r2 <= a * a ? zc + Math.sqrt(Rs * Rs - r2) : 0);
    }
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) { const p = j * (n + 1) + i, q = p + 1, r = p + n + 1, s = r + 1; idx.push(p, q, s, p, s, r); }
    return { regen: regenOf(pos, idx), zc, Rs, a };
  }
  /** A body of revolution about Z from an outline [[z, r] …] (z falling), `seg` sides. */
  function revolve(outline, seg = 64) {
    const pos = [], idx = [];
    for (const [z, r] of outline) for (let k = 0; k < seg; k++) { const a = (2 * Math.PI * k) / seg; pos.push(r * Math.cos(a), r * Math.sin(a), z); }
    for (let i = 0; i + 1 < outline.length; i++) for (let k = 0; k < seg; k++) {
      const a = i * seg + k, b = i * seg + ((k + 1) % seg), c = a + seg, d = b + seg;
      idx.push(a, b, d, a, d, c);
    }
    return regenOf(pos, idx);
  }
  /** A prism along X from a closed YZ outline [[y, z] …] (counter-clockwise seen from +X), x0 to x1. */
  function prismX(outline, x0, x1) {
    const pos = [], idx = [], n = outline.length;
    for (const x of [x0, x1]) for (const [y, z] of outline) pos.push(x, y, z);
    for (let k = 0; k < n; k++) { const a = k, b = (k + 1) % n, c = a + n, d = b + n; idx.push(a, c, d, a, d, b); }
    for (let k = 1; k + 1 < n; k++) { idx.push(0, k + 1, k); idx.push(n, n + k, n + k + 1); }
    return regenOf(pos, idx);
  }
  const setupOf = (over = {}) => { const s = C.newSetup(); s.axis = '+z'; s.origin = 'model-origin'; Object.assign(s.stock, { side: 2, top: 1, bottom: 0 }); return { ...s, ...over, stock: { ...s.stock, ...(over.stock || {}) }, machine: { ...s.machine, ...(over.machine || {}) } }; };
  const studyOf = (setup, tools, ops) => C.readStudy(JSON.parse(JSON.stringify({ version: 1, setup, tools, ops, posts: [] })));
  const feeds = (path) => { const out = []; let prev = null; for (const m of path.moves) { if (m.k === 'feed' && prev) out.push([prev, m]); prev = m; } return out; };
  /** Read G-code words back: [{g, X, Y, Z, A, B, C, F}] per motion line, modal. */
  function readGcode(text) {
    const st = { g: null, X: null, Y: null, Z: null, A: null, B: null, C: null, F: null }, out = [];
    for (const raw of text.split('\n')) {
      const line = raw.replace(/\(.*?\)/g, '').replace(/^N\d+\s*/, '').trim();
      if (!line || line[0] === '%' || line[0] === 'O' || line[0] === '#') continue;
      let motion = false;
      for (const w of line.split(/\s+/)) {
        const L = w[0], val = parseFloat(w.slice(1));
        if (L === 'G' && [0, 1, 2, 3, 31, 32, 33, 38.2].includes(val)) { st.g = val; motion = true; }
        else if ('XYZABCF'.includes(L) && Number.isFinite(val)) { st[L] = val; if (L !== 'F') motion = true; }
      }
      if (/G28|G53|G10|G43|G49/.test(line)) continue;
      if (motion) out.push({ ...st, raw: line });
    }
    return out;
  }

  // ===================================================================================
  section('CAM kinematics: rotary positions');
  {
    const vecs = [];
    for (let i = 0; i < 40; i++) { const tl = (5 + ((i * 37) % 100)) * DEG, tn = ((i * 73) % 360) * DEG; vecs.push([Math.sin(tl) * Math.cos(tn), Math.sin(tl) * Math.sin(tn), Math.cos(tl)]); }
    let worst = 0, worstT = 0;
    for (const kin of ['ac', 'bc']) for (const rotaryIn of ['table', 'head']) for (const v of vecs) {
      const mc = { kin, rotaryIn, tiltMax: 110 }, a = K.solveAngles(mc, v);
      const back = K.vectorOf(mc, a);
      worst = Math.max(worst, hyp(back[0] - v[0], back[1] - v[1], back[2] - v[2]));
      const Rt = K.transpose(K.headMatrix(mc, a)), on = K.mulMV(Rt, v);
      worstT = Math.max(worstT, hyp(on[0], on[1], on[2] - 1));
    }
    ok(worst < 1e-6, `two-rotary machines (ac, bc; table and head): the direction rebuilt from the positions = the one asked for (worst ${worst.toExponential(1)})`);
    ok(worstT < 1e-6, `the table's turn brings the tool direction onto the spindle axis (worst ${worstT.toExponential(1)})`);
    const h = K.solveAngles({ kin: 'ac', rotaryIn: 'head' }, [1, 0, 0]), tb = K.solveAngles({ kin: 'ac', rotaryIn: 'table' }, [1, 0, 0]);
    ok(near(h.a, 90, 1e-6) && near(h.c, 90, 1e-6) && near(tb.a, -90, 1e-6) && near(tb.c, -90, 1e-6), 'tool along +X on an A/C machine: head A90 C90, table A−90 C−90');
    const a4 = K.solveAngles({ kin: 'a', rotaryIn: 'head' }, [0, -Math.sin(30 * DEG), Math.cos(30 * DEG)]);
    ok(near(a4.a, 30, 1e-6) && a4.b === null && a4.c === null, 'one rotary about X: [0, −sin 30°, cos 30°] is A30');
    let code = '';
    try { K.solveAngles({ kin: 'a', rotaryIn: 'table' }, [1, 0, 0]); } catch (e) { code = e.code; }
    ok(code === 'plane', 'a machine with only A cannot point the tool along X: refused');
    code = '';
    try { K.solveAngles({ kin: 'none' }, [0, 0.5, Math.sqrt(0.75)]); } catch (e) { code = e.code; }
    ok(code === 'no_rotary', 'a tilted tool on a 3-axis machine: refused');
    code = '';
    try { K.solveAngles({ kin: 'bc', rotaryIn: 'head', tiltMax: 30 }, [Math.sin(45 * DEG), 0, Math.cos(45 * DEG)]); } catch (e) { code = e.code; }
    ok(code === 'tilt', 'past the machine\'s tilt limit: refused');
    const c1 = K.solveAngles({ kin: 'bc', rotaryIn: 'head' }, [Math.sin(20 * DEG) * Math.cos(170 * DEG), Math.sin(20 * DEG) * Math.sin(170 * DEG), Math.cos(20 * DEG)]);
    const c2 = K.solveAngles({ kin: 'bc', rotaryIn: 'head' }, [Math.sin(20 * DEG) * Math.cos(-170 * DEG), Math.sin(20 * DEG) * Math.sin(-170 * DEG), Math.cos(20 * DEG)], c1);
    ok(near(c1.c, 170, 1e-6) && near(c2.c, 190, 1e-6), 'C goes the short way round (170° → 190°, not −170°)');
    const up = K.solveAngles({ kin: 'bc', rotaryIn: 'head' }, [0, 0, 1], c2);
    ok(near(up.b, 0, 1e-9) && near(up.c, 190, 1e-6), 'upright, where any C will do, C stays where it was');
    const o = K.orientFromVector([0, 1, 0]);
    ok(near(o.tilt, 90, 1e-6) && near(o.turn, 90, 1e-6), 'orientFromVector: +Y is tilt 90, turn 90');
    const Q = K.orientMatrix({ tilt: 35, turn: 120 }), tv = K.toolVector({ tilt: 35, turn: 120 }), qz = K.mulMV(Q, [0, 0, 1]);
    ok(hyp(qz[0] - tv[0], qz[1] - tv[1], qz[2] - tv[2]) < 1e-12, 'the tilted frame\'s Z is the tool direction');
    let refused = '';
    try { K.outputTransform({ kin: 'ac', rotaryIn: 'head', tcp: false }, { a: 10, c: 0 }); } catch (e) { refused = e.code; }
    ok(refused === 'head_needs_tcp', 'a head machine without tool-tip control is refused (the pivot length is the machine\'s)');
  }

  // ===================================================================================
  section('CAM 3D roughing');
  const tools = [
    T.newTool('flat', { id: 'em10', number: 1, d: 10, flutes: 3, fluteLen: 25 }),
    T.newTool('flat', { id: 'em3', number: 2, d: 3, flutes: 2, fluteLen: 22 }),
    T.newTool('ball', { id: 'bm6', number: 3, d: 6, flutes: 2, fluteLen: 18 }),
    T.newTool('face', { id: 'fm40', number: 4, d: 40, flutes: 4, fluteLen: 6 }),
    T.newTool('drill', { id: 'dr5', number: 5, d: 5, fluteLen: 40 }),
    T.newTool('turn', { id: 'tn', number: 6 }),
    T.newTool('groove', { id: 'gv', number: 7, d: 3 }),
    T.newTool('probe', { id: 'pb', number: 9, d: 6 }),
  ];
  {
    const regen = stepBlock(), setup = setupOf();
    const op = C.newOp('rough3d', { id: 'r1', tool: 'em10', params: { stepdown: 4, leave: 0.5 } });
    const study = studyOf(setup, tools, [op]);
    const model = C.machineModel(regen, study.setup);
    const sim = new CS.Sim(model, { cell: 0.25 });
    const prog = CP.generateProgram(study, regen, { sim, model });
    const ph = prog.paths[0];
    ok(!ph.error && ph.moves.length > 20, `roughs the stepped block (${ph.moves.length} moves, ${ph.info.levels} levels, cell ${ph.info.cell})` + (ph.error ? ' — ' + ph.error : ''));
    // the oracle: the exact drop cutter for the real tool with the stock to leave
    const dr = new CF.Dropper(model, tools[0], { leave: 0.5 });
    let worstCut = Infinity, n = 0;
    for (const [a, b] of feeds(ph)) {
      const L = hyp(b.p[0] - a.p[0], b.p[1] - a.p[1]), m = Math.max(1, Math.ceil(L / 0.5));
      for (let k = 0; k <= m; k++) {
        const x = a.p[0] + ((b.p[0] - a.p[0]) * k) / m, y = a.p[1] + ((b.p[1] - a.p[1]) * k) / m, z = a.p[2] + ((b.p[2] - a.p[2]) * k) / m;
        const tip = dr.tip(x, y);
        if (tip > -Infinity) worstCut = Math.min(worstCut, z - tip);
        n++;
      }
    }
    ok(worstCut > -1e-6, `no cutting point is under the exact drop cutter for the tool + 0.5 stock to leave (${n} points, closest ${worstCut.toFixed(4)} mm above)`);
    ok(ph.sim.gouges === 0 && ph.sim.rapidCuts === 0, `the stock simulation finds no gouge and no rapid through stock (${ph.sim.gouges}, ${ph.sim.rapidCuts})`);
    const rep = sim.report();
    const before = (44 * 34 * 21) - (40 * 30 * 10 + 20 * 14 * 10);
    ok(rep.remaining < 0.45 * before, `most of the stock above the part is gone (${rep.remaining.toFixed(0)} of ${before} mm³ left)`);
    // nothing cut closer than the stock to leave, measured straight up (walls keep more)
    let minLeft = Infinity;
    const hp = sim.partHeights();
    for (let k = 0; k < sim.z.length; k++) if (sim.inStock[k] && hp[k] > -Infinity) minLeft = Math.min(minLeft, sim.z[k] - hp[k]);
    ok(minLeft > 0.5 - 0.03, `at least the stock to leave stays on every face (least ${minLeft.toFixed(3)} mm of 0.5)`);
    const zsCut = new Set(feeds(ph).filter(([a, b]) => Math.abs(a.p[2] - b.p[2]) < 1e-9).map(([a]) => +a.p[2].toFixed(4)));
    ok(zsCut.has(10.5) && zsCut.has(20.5) === false && zsCut.has(0), `levels: the stepdown, the base's top + stock to leave (10.5), the bottom (0): ${[...zsCut].sort((x, y) => y - x).join(', ')}`);
    ok(ph.info.wallExtra > 0 && near(ph.info.wallExtra, (Math.SQRT2 + Math.SQRT1_2) * ph.info.cell, 1e-12), `the extra stock walls may keep is 2.12 × the grid cell (${ph.info.wallExtra.toFixed(3)} mm here), and is reported`);

    // ---- rest machining
    const rest = C.newOp('rest3d', { id: 'r2', tool: 'em3', params: { stepdown: 2, leave: 0.5 } });
    const alone = C.newOp('rough3d', { id: 'r3', tool: 'em3', params: { stepdown: 2, leave: 0.5, stepover: 0.4 } });
    const st2 = studyOf(setup, tools, [op, rest]);
    const sim2 = new CS.Sim(model, { cell: 0.25 });
    const pg2 = CP.generateProgram(st2, regen, { sim: sim2, model });
    const sim3 = new CS.Sim(model, { cell: 0.25 });
    const pg3 = CP.generateProgram(studyOf(setup, tools, [alone]), regen, { sim: sim3, model });
    const pr = pg2.paths[1], pa = pg3.paths[0];
    ok(!pr.error && pr.moves.length > 0, 'rest machining with a ⌀3 tool after the ⌀10 roughing' + (pr.error ? ' — ' + pr.error : ''));
    ok(pr.info.cutLength < 0.5 * pa.info.cutLength, `it cuts only where stock is left: ${pr.info.cutLength.toFixed(0)} mm of cutting against ${pa.info.cutLength.toFixed(0)} mm for the same tool on full stock`);
    ok(pr.sim.removed > 0 && pr.sim.gouges === 0 && pr.sim.rapidCuts === 0, `it removes stock (${pr.sim.removed.toFixed(0)} mm³), no gouge, no rapid through stock`);
    ok(sim2.report().remaining < rep.remaining, `less stock is left after it (${sim2.report().remaining.toFixed(0)} < ${rep.remaining.toFixed(0)} mm³)`);
    const dr3 = new CF.Dropper(model, tools[1], { leave: 0.5 });
    let worst3 = Infinity;
    for (const [a, b] of feeds(pr)) for (const q of [a.p, b.p, [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2, (a.p[2] + b.p[2]) / 2]]) { const tip = dr3.tip(q[0], q[1]); if (tip > -Infinity) worst3 = Math.min(worst3, q[2] - tip); }
    ok(worst3 > -1e-6, `rest machining: no cutting point under the exact drop cutter (closest ${worst3.toFixed(4)} mm)`);
    const noSim = CP.generateProgram(studyOf(setup, tools, [rest]), regen, {});
    ok(noSim.paths[0].warnings.some((w) => says('mfg.rest.no_sim').test(w)), 'rest machining with no simulation to read says so');
    // a second roughing with the same tool finds nothing to do
    const again = CP.generateProgram(studyOf(setup, tools, [op, C.newOp('rough3d', { id: 'r4', tool: 'em10', params: { stepdown: 4, leave: 0.5 } })]), regen, { sim: new CS.Sim(model, { cell: 0.25 }), model });
    ok((again.paths[1].info.cutLength || 0) < 0.03 * again.paths[0].info.cutLength && again.paths[1].sim.removed < 0.005 * again.paths[0].sim.removed, `the same roughing a second time finds next to nothing to cut (${(again.paths[1].info.cutLength || 0).toFixed(0)} mm of cutting against ${again.paths[0].info.cutLength.toFixed(0)} mm)`);
    const bad = CP.generateProgram(studyOf(setup, tools, [C.newOp('rough3d', { id: 'r5', tool: 'dr5' })]), regen, {});
    ok(says('mfg.rough.tool').test(bad.paths[0].error || ''), 'a drill is refused for roughing');
    // the height map the grid starts from: never under the model anywhere in a cell
    {
      const g = 0.5, nx = 90, ny = 70, H = R3.heightMax(model.mesh, -2, -2, g, nx, ny);
      let low = 0, high = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) for (const [dx, dy] of [[0, 0], [-0.24, -0.24], [0.24, 0.24], [0.24, -0.24], [-0.24, 0.24]]) {
        const z = model.heightAt(-2 + i * g + dx, -2 + j * g + dy), h = H[j * nx + i];
        if (z > -Infinity) { if (h < z - 1e-9) low++; high = Math.max(high, h - z); }
      }
      ok(low === 0 && high <= 10 + 1e-9, `the height map of the grid is never under the model at any of 5 points in each of ${nx * ny} cells (it is over it only in cells a step runs through)`);
    }
    // a ball roughs a dome
    const D = dome();
    const sd = setupOf({ stock: { side: 1, top: 1, bottom: 0 } });
    const pd = CP.generateProgram(studyOf(sd, tools, [C.newOp('rough3d', { id: 'rd', tool: 'bm6', params: { stepdown: 2, leave: 0.3, stepover: 0.4 } })]), D.regen, { sim: new CS.Sim(C.machineModel(D.regen, sd), { cell: 0.25 }) });
    ok(!pd.paths[0].error && pd.paths[0].sim.gouges === 0, 'a ball end mill roughs a dome without a gouge' + (pd.paths[0].error ? ' — ' + pd.paths[0].error : ''));
  }

  // ===================================================================================
  section('CAM tilted tool direction (3+2)');
  {
    const regen = stepBlock(), setup = setupOf();
    const m0 = C.machineModel(regen, setup), mt = C.machineModel(regen, setup, { tilt: 90, turn: 0 });
    ok(near(mt.box.max[2] - mt.box.min[2], 40, 1e-5) && near(m0.box.max[2] - m0.box.min[2], 20, 1e-5), 'tilted 90° towards +X: the part is 40 deep along the tool (20 from above)');
    const p = [12.5, 7, 3], back = mt.toWorld(mt.toM(p));
    ok(hyp(back[0] - p[0], back[1] - p[1], back[2] - p[2]) < 1e-9, 'into the tilted frame and back is the same point');
    const l = mt.toM([40, 15, 5]);
    ok(near(l[2], 40, 1e-9), 'the +X end of the block is the top in the tilted frame (z = 40)');
    ok(mt.stock.kind === 'box' && mt.stock.max[2] >= 42 - 1e-9, 'the stock there is the box that holds the turned stock');
    ok(C.readOrient({ tilt: 0, turn: 30 }) === null && C.readOrient(null) === null, 'tilt 0 is no tilt');
    let threw = false;
    try { C.readOrient({ tilt: 200, turn: 0 }); } catch { threw = true; }
    ok(threw, 'a tilt past 180° is refused in a study file');
    // a facing pass on the +X end, on a table A/C machine without tool-tip control
    const op = C.newOp('face', { id: 'f1', tool: 'fm40', orient: { tilt: 90, turn: 0 }, params: { stepdown: 5 } });
    const mk = (machine) => studyOf(setupOf({ machine }), tools, [op]);
    const stT = mk({ kin: 'ac', rotaryIn: 'table', tcp: false, post: 'linuxcnc' });
    const pg = CP.generateProgram(stT, regen, { simFor: (m) => new CS.Sim(m, { cell: 0.5 }) });
    const ph = pg.paths[0];
    ok(!ph.error && ph.frame && near(ph.frame.orient.tilt, 90, 1e-12) && ph.sim && ph.sim.gouges === 0, 'the tilted facing pass has its frame and its own simulation, no gouge' + (ph.error ? ' — ' + ph.error : ''));
    ok(ph.warnings.length === 0, 'no warning on a machine that can reach it');
    ok(C.readStudy(JSON.parse(JSON.stringify(stT))).ops[0].orient.tilt === 90, 'the tool direction is kept in the study file');
    const txt = PO.post(pg, { post: 'linuxcnc', name: 'tilt' }).text;
    ok(/G0 A-90 C-90/.test(txt), 'the post turns the table to A−90 C−90 before the operation');
    const idx = txt.indexOf('A-90'), zHome = txt.lastIndexOf('G53 G0 Z0', idx);
    ok(zHome > 0 && zHome < idx, 'the tool is taken up before the table turns');
    const lines = readGcode(txt.slice(idx));
    const cutZ = new Set(lines.filter((x) => x.g === 1).map((x) => x.Z));
    const want = new Set(feeds(ph).map(([, b]) => +b.p[2].toFixed(3)));
    ok([...cutZ].every((z) => want.has(z)) && cutZ.size === want.size, `written without tool-tip control, Z is the depth along the tool (${[...cutZ].join(', ')})`);
    // the written X, Y against the transform worked out here
    const ang = K.solveAngles(stT.setup.machine, K.mulMV(ph.frame.Q, [0, 0, 1])), X = K.outputTransform(stT.setup.machine, ang);
    const f0 = feeds(ph)[0][1].p, w = K.mulMV(K.mulMM(X.M, ph.frame.Q), f0);
    const g1 = lines.find((x) => x.g === 1);
    ok(near(g1.Z, w[2], 2e-3), 'the first cutting move lands where table turn × tilted frame says');
    // tool-tip control on a head machine: the coordinates are the work frame's, G43.4
    const stH = mk({ kin: 'bc', rotaryIn: 'head', tcp: true, post: 'fanuc' });
    const pgH = CP.generateProgram(stH, regen, {});
    const txH = PO.post(pgH, { post: 'fanuc', name: 'tilt' }).text;
    ok(/G43\.4/.test(txH) && /B90\. C0\./.test(txH), 'a head machine with tool-tip control: B90 C0 and G43.4');
    const lh = readGcode(txH.slice(txH.indexOf('G43.4'))).filter((x) => x.g === 1);
    const wx = new Set(lh.map((x) => x.X));
    ok(wx.size > 0 && [...wx].every((x) => x >= 30 && x <= 43), `its cutting moves are in the work frame: X is the depth here (${[...wx].join(', ')})`);
    // a 3-axis machine
    const pg3 = CP.generateProgram(mk({ kin: 'none' }), regen, {});
    ok(pg3.paths[0].warnings.some((x) => says('mfg.kin.no_rotary').test(x)), 'on a 3-axis machine the operation carries a warning');
    let err = '';
    try { PO.post(pg3, { post: 'grbl' }); } catch (e) { err = e.message; }
    ok(says('mfg.kin.no_rotary').test(err), 'and the post refuses to write it');
    // holes and arcs stay holes and arcs while the written frame is only turned about Z
    const hole = [], hi = [], htf = [];
    addBox(hole, hi, htf, [0, 0, 0], [40, 30, 20]);
    const rg2 = regenOf(hole, hi);
    const stD = studyOf(setupOf({ machine: { kin: 'ac', rotaryIn: 'table' } }), tools, [C.newOp('face', { id: 'f2', tool: 'fm40', orient: { tilt: 90, turn: 90 }, params: { stepdown: 5 } })]);
    const pgD = CP.generateProgram(stD, rg2, {});
    const fake = { ...pgD, paths: [{ ...pgD.paths[0], moves: [{ k: 'rapid', p: [5, 5, 40] }, { k: 'feed', p: [5, 5, 30], f: 100 }, { k: 'arc', p: [15, 15, 30], c: [5, 15], sw: Math.PI / 2, f: 200 }, { k: 'cycle', kind: 'peck', init: 40, f: 80, holes: [{ at: [5, 5], top: 30, z: 20, r: 32, q: 3, ret: 'r' }] }] }] };
    const tf2 = PO.post(fake, { post: 'linuxcnc' }).text;
    ok(/G3 /.test(tf2) && /G83 /.test(tf2), 'a table machine keeps the arc (G3) and the canned cycle (G83) of a tilted operation');
    const fakeH = { ...fake, setup: { ...fake.setup, machine: { ...fake.setup.machine, kin: 'bc', rotaryIn: 'head', tcp: true } } };
    const tf3 = PO.post(fakeH, { post: 'linuxcnc' }).text;
    ok(!/G3 /.test(tf3) && !/G83 /.test(tf3) && tf3.split('\n').filter((x) => /^G1|^X|^Y|^Z/.test(x)).length > 10, 'with tool-tip control in a tilted plane the arc is short lines and the cycle its moves');
    // a 3-axis program is untouched by all this
    const plain = CP.generateProgram(studyOf(setupOf(), tools, [C.newOp('face', { id: 'f3', tool: 'fm40', params: { stepdown: 5 } })]), regen, {});
    ok(PO.post(plain, { post: 'fanuc' }).text === PO.postLegacy(plain, { post: 'fanuc' }).text, 'a 3-axis program is written exactly as before');
    const rot0 = CP.generateProgram(studyOf(setupOf({ machine: { kin: 'ac' } }), tools, [C.newOp('face', { id: 'f4', tool: 'fm40', params: { stepdown: 5 } })]), regen, {});
    ok(/G0 A0 C0/.test(PO.post(rot0, { post: 'linuxcnc' }).text), 'on a machine with rotary axes an upright program starts by putting them at 0');
  }

  // ===================================================================================
  section('CAM 5-axis finishing');
  {
    const D = dome(), R = 3;
    const setup = setupOf({ stock: { side: 1, top: 1, bottom: 0 }, machine: { kin: 'ac', rotaryIn: 'table', tcp: false } });
    const mk = (params) => studyOf(setup, tools, [C.newOp('five', { id: 'v1', tool: 'bm6', params: { stepover: 0.4, tolerance: 0.01, ...params } })]);
    const model = C.machineModel(D.regen, setup);
    const pg = CP.generateProgram(mk({ lean: 0, towardNormal: 1, maxTilt: 60 }), D.regen, {});
    const ph = pg.paths[0];
    ok(!ph.error && ph.kind === 'multi' && ph.moves.every((m) => m.a && near(hyp(...m.a), 1, 1e-9)), `passes on the dome, every move with a unit tool direction (${ph.moves.length} moves)` + (ph.error ? ' — ' + ph.error : ''));
    const dr = new CF.Dropper(model, tools[2], {});
    let under = Infinity, over = -Infinity, off = 0, n = 0;
    const cuts = feeds(ph).filter(([a]) => a.k === 'feed');
    for (const [, b] of cuts) {
      const c = [b.p[0] + R * b.a[0], b.p[1] + R * b.a[1], b.p[2] + R * b.a[2]];
      const zc = dr.tip(c[0], c[1]) + R;
      if (!Number.isFinite(zc)) continue;
      under = Math.min(under, c[2] - zc); over = Math.max(over, c[2] - zc);
      const rr = hyp(c[0], c[1]);
      if (rr < D.a - 2 * R && rr > 1) {   // on the sphere, away from its edge: the direction is the sphere's radius
        const rad = [c[0], c[1], c[2] - D.zc], L = hyp(...rad);
        off = Math.max(off, Math.acos(Math.min(1, (rad[0] * b.a[0] + rad[1] * b.a[1] + rad[2] * b.a[2]) / L)) / DEG);
      }
      n++;
    }
    ok(under > -1e-6, `the ball's centre (tip + R × direction) is never under the surface it may move on (${n} points, lowest ${under.toExponential(1)})`);
    ok(over < 0.012, `and never floats above it by more than the tolerance (highest ${over.toFixed(4)} mm)`);
    ok(off < 3, `the tool points along the sphere's radius (worst ${off.toFixed(2)}° off, a faceted mesh)`);
    ok(ph.info.maxTilt > 15 && ph.info.maxTilt <= 60 + 1e-6, `it leans as it goes (up to ${ph.info.maxTilt.toFixed(1)}°)`);
    const pgL = CP.generateProgram(mk({ lean: 10, towardNormal: 1, maxTilt: 20 }), D.regen, {});
    const tiltMax = Math.max(...pgL.paths[0].moves.map((m) => Math.acos(Math.min(1, m.a[2])) / DEG));
    ok(tiltMax <= 20 + 1e-6 && tiltMax > 15, `the tilt limit holds (${tiltMax.toFixed(3)}° of 20°)`);
    const pgU = CP.generateProgram(mk({ lean: 0, towardNormal: 0 }), D.regen, {});
    ok(pgU.paths[0].moves.every((m) => m.a[2] > 1 - 1e-12), 'towards the normal 0 and no lean: the tool stays upright (the 3-axis pass)');
    const pgLean = CP.generateProgram(mk({ lean: 12, towardNormal: 0, maxTilt: 30 }), D.regen, {});
    const lean = feeds(pgLean.paths[0]).filter(([a, b]) => a.k === 'feed' && hyp(b.p[0] - a.p[0], b.p[1] - a.p[1]) > 0.3).map(([a, b]) => { const f = [b.p[0] - a.p[0], b.p[1] - a.p[1]], L = hyp(...f); return (b.a[0] * f[0] + b.a[1] * f[1]) / L; });
    ok(lean.length > 10 && lean.filter((v) => v > 0).length > 0.95 * lean.length, 'the lean is forward, along the cut');
    // the posts: G-code read back to the tool tip
    const txt = PO.post(pg, { post: 'linuxcnc', name: 'five' }).text;
    ok(/G93/.test(txt) && /G94/.test(txt), 'a table machine without tool-tip control gets inverse-time feed (G93) while the rotary axes turn, G94 after');
    const gl = readGcode(txt.slice(txt.indexOf('G43'))).filter((x) => x.g === 1 && x.A !== null && x.C !== null);
    const mv = ph.moves.filter((m) => m.k === 'feed');
    // a move that rounds to where the tool already is writes no line, so each line is matched to the next move it fits
    const follow = (lines, moves, tipOf) => {
      let worst = 0, j = 0, lost = 0;
      for (const g of lines) {
        const p = tipOf(g);
        let best = Infinity, bj = j;
        for (let q = j; q < Math.min(moves.length, j + 12); q++) { const d = hyp(p[0] - moves[q].p[0], p[1] - moves[q].p[1], p[2] - moves[q].p[2]); if (d < best) { best = d; bj = q; } if (d < 5e-3) break; }
        if (best > 0.05) lost++; else { worst = Math.max(worst, best); j = bj + 1; }
      }
      return { worst, lost };
    };
    const fb = follow(gl, mv, (g) => { const X = K.outputTransform(setup.machine, { a: g.A, b: null, c: g.C }); return K.mulTV(X.M, [g.X - X.d[0], g.Y - X.d[1], g.Z - X.d[2]]); });
    ok(gl.length > 0.9 * mv.length && fb.lost === 0 && fb.worst < 0.01, `read back and turned back by the written A and C, the G-code is the tool tip (${gl.length} lines for ${mv.length} moves, worst ${fb.worst.toFixed(4)} mm, ${fb.lost} not found)`);
    const stH = studyOf(setupOf({ stock: { side: 1, top: 1, bottom: 0 }, machine: { kin: 'bc', rotaryIn: 'head', tcp: true } }), tools, [C.newOp('five', { id: 'v1', tool: 'bm6', params: { stepover: 0.4, lean: 0, maxTilt: 60 } })]);
    const pgH = CP.generateProgram(stH, D.regen, {});
    const txH = PO.post(pgH, { post: 'fanuc' }).text;
    const gh = readGcode(txH).filter((x) => x.g === 1 && x.B !== null && x.X !== null && x.Y !== null);
    const mh = pgH.paths[0].moves.filter((m) => m.k === 'feed');
    const fh = follow(gh, mh, (g) => [g.X, g.Y, g.Z]);
    ok(/G43\.4/.test(txH) && !/G93/.test(txH) && gh.length > 0.9 * mh.length && fh.lost === 0 && fh.worst < 2e-3, `with tool-tip control X Y Z are the tip itself and the feed stays G94 (worst ${fh.worst.toFixed(4)} mm, ${fh.lost} not found)`);
    const bad = CP.generateProgram(studyOf(setup, tools, [C.newOp('five', { id: 'v2', tool: 'em10' })]), D.regen, {});
    ok(says('mfg.five.tool').test(bad.paths[0].error || ''), 'a flat end mill is refused (only a ball cuts the same leaning)');
    const p3 = CP.generateProgram(studyOf(setupOf({ stock: { side: 1, top: 1, bottom: 0 } }), tools, [C.newOp('five', { id: 'v3', tool: 'bm6', params: { stepover: 0.4 } })]), D.regen, {});
    ok(p3.paths[0].warnings.some((w) => says('mfg.kin.no_rotary').test(w)), 'on a 3-axis machine the operation warns that it cannot be run');
    let custom = '';
    try { PO.post(pg, { post: 'custom:old', posts: [{ id: 'old', text: 'post old\nname Old\non index\n  emit G0 A{rot.a}\nend\non rapid\n  emit G0 X{x}\nend\n' }] }); } catch (e) { custom = e.message; }
    ok(says('cam.post.err.no_event').test(custom), 'a post with no rotary move events refuses a 5-axis path instead of writing it wrong');
  }

  // ===================================================================================
  section('CAM rotary finishing (4th axis)');
  {
    const Rb = 3;
    // a cylinder ⌀20 along X
    const seg = 64, cyl = [];
    for (let k = 0; k < seg; k++) { const a = (2 * Math.PI * k) / seg; cyl.push([10 * Math.cos(a), 10 * Math.sin(a)]); }
    const rc = prismX(cyl, 0, 40);
    const setup = setupOf({ stock: { side: 2, top: 2, bottom: 2 }, machine: { kin: 'a', rotaryIn: 'table', tcp: false, pivot: [0, 0, 0] } });
    const model = C.machineModel(rc, setup);
    const D = new MX.RadialDropper(model.mesh, 0, 0, Rb);
    let lo = Infinity, hi = -Infinity;
    for (let k = 0; k < 50; k++) { const r = D.drop(5 + (k % 7) * 4, (k * 7.3) * DEG); lo = Math.min(lo, r); hi = Math.max(hi, r); }
    ok(hi <= 13 + 1e-9 && lo >= 13 - 0.013, `a ball of R 3 dropped on a ⌀20 cylinder from any side: centre at 13 from the axis (${lo.toFixed(4)} … ${hi.toFixed(4)}; the 64-sided mesh sits up to 0.012 inside)`);
    ok(D.drop(-10, 0) === -Infinity && D.drop(60, 1) === -Infinity, 'nothing under the ball beyond the ends');
    ok(near(D.drop(-2, 0), Math.sqrt(9 - 4) + 10, 1e-6) || D.drop(-2, 0) <= 13, 'just past the end the ball rests on the end\'s rim');
    // a square bar 10 × 10: flats and corners in closed form
    const sq = prismX([[-5, -5], [5, -5], [5, 5], [-5, 5]], 0, 30);
    const ms = C.machineModel(sq, setup), Ds = new MX.RadialDropper(ms.mesh, 0, 0, Rb);
    ok(near(Ds.drop(15, 0), 8, 1e-9) && near(Ds.drop(15, 90 * DEG), 8, 1e-9), 'square bar: on a flat the centre is at 5 + R');
    ok(near(Ds.drop(15, 45 * DEG), 5 * Math.SQRT2 + Rb, 1e-9), 'on a corner it is at 5√2 + R (the edge contact)');
    // against a brute-force search over points of the surface (this test's own)
    const pts = [];
    { const P = ms.mesh.positions, I = ms.mesh.indices; for (let t = 0; t < I.length; t += 3) { const v = [0, 1, 2].map((e) => [P[I[t + e] * 3], P[I[t + e] * 3 + 1], P[I[t + e] * 3 + 2]]); const N = 90; for (let i = 0; i <= N; i++) for (let j = 0; j <= N - i; j++) { const a = i / N, b = j / N, c = 1 - a - b; pts.push([v[0][0] * a + v[1][0] * b + v[2][0] * c, v[0][1] * a + v[1][1] * b + v[2][1] * c, v[0][2] * a + v[1][2] * b + v[2][2] * c]); } } }
    const brute = (x, th) => { let m = -Infinity; const cs = Math.cos(th), sn = Math.sin(th); for (const q of pts) { const y = q[1] * cs + q[2] * sn, z = -q[1] * sn + q[2] * cs, d2 = (q[0] - x) * (q[0] - x) + y * y; if (d2 <= Rb * Rb) m = Math.max(m, z + Math.sqrt(Rb * Rb - d2)); } return m; };
    let wb = 0, wa = 0;
    for (let k = 0; k < 60; k++) { const x = 1 + (k % 9) * 3.4, th = k * 0.37, e = Ds.drop(x, th), b = brute(x, th); wb = Math.max(wb, b - e); wa = Math.max(wa, e - b); }
    ok(wb < 1e-9 && wa < 0.03, `the exact drop is never under a brute-force search over ${pts.length} surface points and within ${wa.toFixed(4)} mm of it`);
    // the operation
    for (const pattern of ['along', 'around']) {
      const st = studyOf(setup, tools, [C.newOp('rotary', { id: 'q1', tool: 'bm6', params: { pattern, stepover: 0.5, tolerance: 0.01 } })]);
      const pg = CP.generateProgram(st, sq, {});
      const ph = pg.paths[0];
      ok(!ph.error && ph.kind === 'multi' && ph.moves.length > 50 && ph.warnings.length === 0, `${pattern}: a path round the square bar (${ph.moves.length} moves, ${ph.info.passes} passes)` + (ph.error ? ' — ' + ph.error : '') + (ph.warnings.length ? ' — ' + ph.warnings[0] : ''));
      let under = Infinity, perp = 0, aim = 0;
      for (const m of ph.moves.filter((x) => x.k === 'feed')) {
        const c = [m.p[0] + Rb * m.a[0], m.p[1] + Rb * m.a[1], m.p[2] + Rb * m.a[2]];
        const th = Math.atan2(-m.a[1], m.a[2]), r = hyp(c[1], c[2]);
        under = Math.min(under, r - brute(c[0], th));
        perp = Math.max(perp, Math.abs(m.a[0]));
        aim = Math.max(aim, Math.abs(c[1] * m.a[2] - c[2] * m.a[1]));      // the centre lies on the line through the axis along a
      }
      ok(under > -1e-6, `${pattern}: the ball never goes under the surface found by brute force (closest ${under.toExponential(1)})`);
      ok(perp < 1e-12 && aim < 1e-9, `${pattern}: the tool is square to X and points at the axis`);
      const txt = PO.post(pg, { post: 'linuxcnc', name: 'rot' }).text;
      const gl = readGcode(txt.slice(txt.indexOf('G43'))).filter((x) => x.g === 1);
      const ys = gl.map((x) => Math.abs(x.Y ?? 0));
      const as = gl.map((x) => x.A).filter((v) => v !== null);
      ok(gl.length > 50 && Math.max(...ys) < 1.5e-3, `${pattern}: written for a table machine, Y stays on the axis (worst ${Math.max(...ys).toFixed(4)})`);
      ok(Math.min(...as) < -300 && Math.max(...as) <= 1e-9, `${pattern}: A runs from 0 to about −360 (${Math.min(...as).toFixed(1)}), a table turning against the tool`);
      const zs = gl.map((x) => x.Z);
      ok(Math.min(...zs) >= 5 - 1e-3 && Math.max(...zs) <= 5 * Math.SQRT2 + 1e-3, `${pattern}: Z, the tip's distance from the axis, is between the flats (5) and the corners (7.071): ${Math.min(...zs)} … ${Math.max(...zs)}`);
    }
    const stP = studyOf(setupOf({ stock: { side: 2, top: 2, bottom: 2 }, machine: { kin: 'a', pivot: [0, 3, 0] } }), tools, [C.newOp('rotary', { id: 'q2', tool: 'bm6' })]);
    ok(CP.generateProgram(stP, sq, {}).paths[0].warnings.some((w) => says('mfg.rotary.pivot').test(w)), 'an axis that is not the machine\'s rotary centre is pointed out');
    const stB = studyOf(setup, tools, [C.newOp('rotary', { id: 'q3', tool: 'em10' })]);
    ok(says('mfg.rotary.tool').test(CP.generateProgram(stB, sq, {}).paths[0].error || ''), 'a flat end mill is refused');
    const half = CP.generateProgram(studyOf(setup, tools, [C.newOp('rotary', { id: 'q4', tool: 'bm6', params: { angleFrom: 0, angleTo: 90, xFrom: 5, xTo: 20 } })]), sq, {}).paths[0];
    const xs = half.moves.filter((m) => m.k === 'feed').map((m) => m.p[0]);
    const ths = half.moves.filter((m) => m.k === 'feed').map((m) => Math.atan2(-m.a[1], m.a[2]) / DEG);
    ok(Math.min(...xs) >= 5 - 1e-9 && Math.max(...xs) <= 20 + 1e-9 && Math.min(...ths) >= -1e-6 && Math.max(...ths) <= 90 + 1e-6, 'a part turn (0–90°) over part of the length (X 5–20) stays inside both');
  }

  // ===================================================================================
  section('CAM turning');
  {
    // a stepped shaft: ⌀12 × 10, ⌀20, a groove 5 wide to ⌀16 at z −30…−25, ⌀20 to z −40. Z0 on the front face.
    const outline = [[0, 0], [0, 6], [-10, 6], [-10, 10], [-25, 10], [-25, 8], [-30, 8], [-30, 10], [-40, 10], [-40, 0]];
    const regen = revolve(outline, 96);
    const rTrue = (z) => (z > 0 || z < -40 ? 0 : z >= -10 ? 6 : z > -25 ? 10 : z >= -30 ? 8 : 10);
    /** Distance from (z, r) to the true outline (segments), this test's own. */
    const dOut = (z, r) => { let m = Infinity; for (let k = 0; k + 1 < outline.length; k++) { const a = outline[k], b = outline[k + 1], dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy; const tt = L2 ? Math.max(0, Math.min(1, ((z - a[0]) * dx + (r - a[1]) * dy) / L2)) : 0; m = Math.min(m, hyp(z - a[0] - tt * dx, r - a[1] - tt * dy)); } return m; };
    const setup = setupOf({ stock: { kind: 'cylinder', side: 2, top: 1, bottom: 0 }, machine: { maxRpm: 4000, post: 'fanuc-lathe' } });
    setup.origin = 'model-top-centre';
    const model = C.machineModel(regen, setup);
    ok(near(model.top, 0, 1e-6) && near(model.stock.max[2], 1, 1e-6) && model.stock.kind === 'cylinder', 'the shaft stands along Z with Z0 on its front face, bar stock 1 mm proud');
    const prof = TU.spunProfile(model, model.stock.c, -41, 1, 0.02);
    const at = (z) => prof.r[Math.floor((z + 41) / 0.02)];
    ok(near(at(-5), 6, 1e-4) && near(at(-15), 10, 1e-4) && near(at(-27), 8, 1e-4) && at(0.5) === -Infinity, `the spun profile: ⌀12, ⌀20, ⌀16 in the groove, nothing in front (${at(-5).toFixed(4)}, ${at(-15).toFixed(4)}, ${at(-27).toFixed(4)})`);
    const tn = tools.find((x) => x.id === 'tn'), gv = tools.find((x) => x.id === 'gv');
    const sh = TU.toolShape(tn), rn = tn.cornerR;
    ok(near(sh.b(0), -rn, 1e-12) && sh.b(-rn - 0.01) === Infinity && near(sh.tip.dr, rn, 1e-12), 'a turning insert as its lower edge: the nose circle, nothing in front of it (lead 93°)');
    const beta = (180 - 93 - 55) * DEG;
    ok(near(sh.b(5), -rn * Math.cos(beta) + (5 - rn * Math.sin(beta)) * Math.tan(beta), 1e-12), 'behind the nose the trailing edge rises at 180° − 93° − 55° = 32°');
    const rc = TU.dropShape(prof, sh);
    const rcAt = (z) => rc[Math.floor((z + 41) / 0.02)];
    ok(near(rcAt(-5), 6 + rn, 1e-3) && near(rcAt(-17), 10 + rn, 1e-3), 'where the tool may be: nose centre at radius + nose radius on a plain diameter');
    ok(rcAt(-27.5) > 8 + rn + 0.5, `it cannot reach the floor of the groove behind the shoulder (${rcAt(-27.5).toFixed(3)} against ${(8 + rn).toFixed(1)})`);
    const gs = TU.toolShape(gv), rg = TU.dropShape(prof, gs);
    ok(near(rg[Math.floor((-27.5 + 41) / 0.02)], 8, 1e-3) && near(rg[Math.floor((-25.5 + 41) / 0.02)], 10, 1e-3), 'a 3 mm grooving blade reaches the groove floor in the middle, and stands on the shoulder when it overlaps it');

    const ops = [
      C.newOp('turnface', { id: 't1', tool: 'tn' }),
      C.newOp('turnrough', { id: 't2', tool: 'tn', params: { depth: 1.5, leave: 0.3 } }),
      C.newOp('turnfinish', { id: 't3', tool: 'tn' }),
      C.newOp('turngroove', { id: 't4', tool: 'gv' }),
      C.newOp('turnthread', { id: 't5', tool: 'tn', params: { diameter: 12, pitch: 1.5, passes: 5, spring: 1, length: 8 } }),
      C.newOp('turndrill', { id: 't6', tool: 'dr5', params: { depth: 12, peck: 4 } }),
      C.newOp('turnpart', { id: 't7', tool: 'gv' }),
    ];
    const study = studyOf(setup, tools, ops);
    const sim = new CS.Sim(model, { cell: 0.5 });
    const v0 = sim.volume();
    const pg = CP.generateProgram(study, regen, { sim, model });
    ok(pg.paths.every((p) => !p.error && p.kind === 'lathe' && p.moves.length > 3), 'facing, roughing, finishing, grooving, threading, drilling and parting all make a path' + (pg.paths.find((p) => p.error) ? ' — ' + pg.paths.find((p) => p.error).error : ''));
    ok(near(sim.volume(), v0, 1e-9), 'turning paths are not run through the milling height map');
    ok(pg.paths.every((p) => p.sim && p.sim.gouges === 0), `the lathe's stock: no gouge in any operation (${pg.paths.map((p) => p.sim.gouges).join(', ')})`);
    ok(pg.paths.every((p) => p.moves.every((m) => m.p[1] === 0)), 'every move is X (radius) and Z only');
    // every cutting point of the turning insert stays a nose radius clear of the true outline
    let clear = Infinity, inside = 0, n = 0;
    for (const id of ['t1', 't2', 't3']) {
      const ph = pg.paths.find((p) => p.op.id === id);
      for (const [a, b] of feeds(ph)) {
        const L = hyp(b.p[0] - a.p[0], b.p[2] - a.p[2]), m = Math.max(1, Math.ceil(L / 0.05));
        for (let k = 0; k <= m; k++) {
          const r = a.p[0] + ((b.p[0] - a.p[0]) * k) / m + rn, z = a.p[2] + ((b.p[2] - a.p[2]) * k) / m + rn;   // the nose centre
          if (rTrue(z) > 0 && r < rTrue(z) - 1e-9) inside++;
          clear = Math.min(clear, dOut(z, r) - rn);
          n++;
        }
      }
    }
    ok(inside === 0 && clear > -0.02, `facing, roughing, finishing: the nose circle never cuts into the true outline (${n} points, closest ${clear.toFixed(4)} mm; 0.02 is the gouge limit)`);
    const fin = pg.paths.find((p) => p.op.id === 't3');
    let onIt = Infinity;
    for (const [a, b] of feeds(fin)) for (let k = 0; k <= 20; k++) { const z = a.p[2] + ((b.p[2] - a.p[2]) * k) / 20 + rn, r = a.p[0] + ((b.p[0] - a.p[0]) * k) / 20 + rn; if (z < -1 && z > -9) onIt = Math.min(onIt, Math.abs(dOut(z, r) - rn)); }
    ok(onIt < 0.012, `the finishing pass is on the ⌀12 (nose circle within ${onIt.toFixed(4)} mm of touching it)`);
    ok(fin.warnings.some((w) => says('mfg.turn.unreached').test(w)), 'finishing says what the insert could not reach (the groove)');
    const L = pg.lathe;
    const S = (z) => L.stock.S[L.stock.kOf(z)];
    ok(near(S(-5), 6, 0.02) && near(S(-17), 10, 0.02) && near(S(-35), 10, 0.02), `after finishing the stock is the part on the plain diameters (${S(-5).toFixed(3)}, ${S(-17).toFixed(3)}, ${S(-35).toFixed(3)})`);
    ok(near(S(-27.5), 8, 0.02) && S(-25.3) >= 8 - 0.02, `after grooving the groove floor is ⌀16 (${S(-27.5).toFixed(3)})`);
    const gr = pg.paths.find((p) => p.op.id === 't4');
    const gz = feeds(gr).map(([, b]) => b.p[2]);
    ok(gr.info.plunges >= 2 && Math.min(...gz) >= -30 - 1e-6 && Math.max(...gz) + 3 <= -25 + 1e-6, `the blade plunges only inside the groove (${gr.info.plunges} plunges, Z ${Math.min(...gz).toFixed(2)} … ${(Math.max(...gz) + 3).toFixed(2)})`);
    let gClear = Infinity;
    for (const [, b] of feeds(gr)) for (let u = 0; u <= 3; u += 0.25) gClear = Math.min(gClear, b.p[0] - rTrue(b.p[2] + u));
    ok(gClear > -0.02, `the blade's edge never goes under the outline across its width (closest ${gClear.toFixed(4)})`);
    // removed volume against the closed form
    const Rs = model.stock.r;
    const partVol = Math.PI * (36 * 10 + 100 * 15 + 64 * 5 + 100 * 10);
    const wantRemoved = Math.PI * Rs * Rs * 41 - partVol;
    const got = ['t1', 't2', 't3', 't4'].reduce((s, id) => s + pg.paths.find((p) => p.op.id === id).sim.removed, 0);
    ok(Math.abs(got - wantRemoved) / wantRemoved < 0.03, `removed by facing, roughing, finishing and grooving: ${got.toFixed(0)} mm³ against π·R²·L − the part = ${wantRemoved.toFixed(0)} mm³`);
    const ro = pg.paths.find((p) => p.op.id === 't2');
    ok(ro.info.passes >= 4 && ro.speeds.css === 200 && near(ro.speeds.feed, 0.2, 1e-12), `roughing: ${ro.info.passes} passes, constant surface speed 200 m/min, 0.2 mm per revolution`);
    // threading
    const th = pg.paths.find((p) => p.op.id === 't5'), tm = th.moves.filter((m) => m.k === 'thread');
    const depth = 0.6134 * 1.5;
    ok(tm.length === 6 && near(th.info.depth, depth, 1e-12), 'threading: 5 passes and a spring pass, depth 0.6134 × pitch');
    ok(near(tm[0].p[0], 6 - depth * Math.sqrt(1 / 5), 1e-9) && near(tm[4].p[0], 6 - depth, 1e-9) && near(tm[5].p[0], 6 - depth, 1e-9), 'each pass takes the same chip area (depth × √(i/n)); the last two are at full depth');
    ok(tm.every((m) => near(m.f, 1.5, 1e-12) && near(m.p[2], -8, 1e-9)), 'every pass at the lead, to the end of the thread');
    // drilling on centre, parting
    const dl = pg.paths.find((p) => p.op.id === 't6');
    ok(dl.moves.every((m) => m.p[0] === 0) && near(Math.min(...dl.moves.map((m) => m.p[2])), -12, 1e-9) && dl.speeds.css === null, 'drilling on centre: X0 all the way, to the depth, at a fixed rpm');
    const pt = pg.paths.find((p) => p.op.id === 't7');
    const pz = feeds(pt).map(([, b]) => b.p[2]), px = feeds(pt).map(([, b]) => b.p[0]);
    ok(pz.every((z) => near(z, -43, 1e-9)) && near(Math.min(...px), -0.5, 1e-9), 'parting: the blade sits behind the part (its edge at Z −43 … −40) and goes 0.5 past centre');
    const time = CS.cycleTime(pg, study.setup);
    ok(time.seconds > 5 && time.seconds < 3600 && Number.isFinite(time.seconds), `cycle time from feeds per revolution and the rpm at each diameter (${time.seconds.toFixed(0)} s)`);
    // the posts
    const fx = PO.post(pg, { post: 'fanuc-lathe', name: 'shaft' }).text;
    ok(/G50 S4000/.test(fx) && /G96 S200 M3/.test(fx) && /G97 S\d+ M3/.test(fx) && /T0606/.test(fx) && /T0707/.test(fx), 'Fanuc-style lathe: G50 limit, G96 surface speed, G97 for the drill, T0606 and T0707');
    ok(!/\bY-?\d/.test(fx) && /G32 Z-8\. F1\.5/.test(fx.replace(/X-?[\d.]+ /g, '')), 'no Y word; threading as G32 with the lead in F');
    const gl = readGcode(fx);
    const first = gl.find((x) => x.g === 0 && x.X !== null);
    ok(near(first.X, 2 * pg.paths[0].moves[0].p[0], 2e-3), `X is written as a diameter (${first.X} for radius ${pg.paths[0].moves[0].p[0].toFixed(3)})`);
    const lx = PO.post(pg, { post: 'linuxcnc-lathe', name: 'shaft' }).text;
    ok(/G7\b/.test(lx) && /G95/.test(lx) && /G96 D4000 S200 M3/.test(lx) && /G33 .*K1\.5/.test(lx), 'LinuxCNC lathe: G7 diameters, G95 per revolution, G96 D S, G33 K');
    let e1 = '', e2 = '';
    try { PO.post(pg, { post: 'fanuc' }); } catch (e) { e1 = e.message; }
    const mill = CP.generateProgram(studyOf(setupOf(), tools, [C.newOp('face', { id: 'm1', tool: 'fm40' })]), stepBlock(), {});
    try { PO.post(mill, { post: 'fanuc-lathe' }); } catch (e) { e2 = e.message; }
    ok(says('cam.post.err.need_lathe').test(e1) && says('cam.post.err.lathe_only').test(e2), 'a milling post refuses a turning program and a lathe post a milling one');
    const radius = PD.parsePost(PO.resolvePost('linuxcnc-lathe') && (await import(DEV + 'cam-posts-builtin.js')).BUILTIN_POSTS['linuxcnc-lathe'].replace('lathe-x diameter', 'lathe-x radius').replace('post linuxcnc-lathe', 'post rad'));
    const rx = readGcode(PD.renderPost(radius, pg, { name: 'r' }).text).find((x) => x.g === 0 && x.X !== null);
    ok(near(rx.X, pg.paths[0].moves[0].p[0], 2e-3), '`lathe-x radius` in a post writes radii');
    // refusals and notes
    const wrong = CP.generateProgram(studyOf(setup, tools, [C.newOp('turnrough', { id: 'w1', tool: 'em10' }), C.newOp('turngroove', { id: 'w2', tool: 'tn' }), C.newOp('turndrill', { id: 'w3', tool: 'tn' })]), regen, {});
    ok(wrong.paths.every((p) => says('mfg.turn.tool_').test(p.error || '')), 'the wrong kind of tool is refused (an end mill for turning, an insert for grooving or drilling)');
    const box = CP.generateProgram(studyOf(setupOf({ stock: { kind: 'box' } }), tools, [C.newOp('turnface', { id: 'b1', tool: 'tn' })]), regen, {});
    ok(box.paths[0].warnings.some((w) => says('mfg.turn.box_stock').test(w)), 'box stock on a lathe is pointed out (it is turned about its middle)');
    ok(T.validateTool(T.newTool('turn')) === null && T.validateTool(T.newTool('groove')) === null && says('mfg.tool.err.lead_insert').test(T.validateTool({ ...T.newTool('turn'), lead: 100, angle: 80 }) || ''), 'lathe tools are checked (lead + insert angle must leave a trailing edge)');
    ok(T.readTool(JSON.parse(JSON.stringify(tn))).lead === 93 && T.readTool({ ...JSON.parse(JSON.stringify(tools[0])), lead: undefined }).lead === 93, 'the lead angle is kept in files; older tools get 93°');
  }

  // ===================================================================================
  section('CAM probing');
  {
    // a block 40 × 30 × 20 with a ⌀12 hole down from the top at (20, 15) and a ⌀10 boss on top at (8, 8)
    const pos = [], idx = [], tf = [];
    addBox(pos, idx, tf, [0, 0, 0], [40, 30, 20], 0);
    const ring = (cx, cy, r, z0, z1, inward, f) => {
      const o = pos.length / 3, n = 48;
      for (const z of [z0, z1]) for (let k = 0; k < n; k++) { const a = (2 * Math.PI * k) / n; pos.push(cx + r * Math.cos(a), cy + r * Math.sin(a), z); }
      for (let k = 0; k < n; k++) { const a = o + k, b = o + ((k + 1) % n), c = a + n, d = b + n; if (inward) idx.push(a, d, b, a, c, d); else idx.push(a, b, d, a, d, c); tf.push(f, f); }
    };
    ring(20, 15, 6, 5, 20, true, 6);
    ring(8, 8, 5, 20, 26, false, 7);
    { const o = pos.length / 3, n = 48; pos.push(8, 8, 26); for (let k = 0; k < n; k++) { const a = (2 * Math.PI * k) / n; pos.push(8 + 5 * Math.cos(a), 8 + 5 * Math.sin(a), 26); } for (let k = 0; k < n; k++) { idx.push(o, o + 1 + k, o + 1 + ((k + 1) % n)); tf.push(8, 8); } }
    const faces = [
      { name: 'f1.sidea', type: 'plane', at: [0, 15, 10], n: [-1, 0, 0], o: [0, 15, 10] },
      { name: 'f1.sideb', type: 'plane', at: [40, 15, 10], n: [1, 0, 0], o: [40, 15, 10] },
      { name: 'f1.sidec', type: 'plane', at: [20, 0, 10], n: [0, -1, 0], o: [20, 0, 10] },
      { name: 'f1.sided', type: 'plane', at: [20, 30, 10], n: [0, 1, 0], o: [20, 30, 10] },
      { name: 'f1.bottom', type: 'plane', at: [20, 15, 0], n: [0, 0, -1], o: [20, 15, 0] },
      { name: 'f1.top', type: 'plane', at: [32, 22, 20], n: [0, 0, 1], o: [32, 22, 20] },
      { name: 'f2.hole', type: 'cylinder', at: [26, 15, 12], axis: { o: [20, 15, 5], d: [0, 0, 1] }, r: 6 },
      { name: 'f3.boss', type: 'cylinder', at: [13, 8, 23], axis: { o: [8, 8, 20], d: [0, 0, 1] }, r: 5 },
      { name: 'f3.cap', type: 'plane', at: [8, 8, 26], n: [0, 0, 1], o: [8, 8, 26] },
    ];
    const regen = regenOf(pos, idx, faces, tf);
    const ref = (name) => { const f = faces.find((x) => x.name === name); return { name, at: f.at }; };
    const setup = setupOf();
    const mk = (names, params = {}) => studyOf(setup, tools, [C.newOp('probe', { id: 'p1', tool: 'pb', geo: { faces: names.map(ref), edges: [] }, params })]);
    const pg = CP.generateProgram(mk(['f1.top', 'f1.sideb', 'f2.hole', 'f3.boss']), regen, { sim: new CS.Sim(C.machineModel(regen, setup), { cell: 0.5 }) });
    const ph = pg.paths[0];
    ok(!ph.error && ph.kind === 'probe' && !ph.sim, 'a probing path for a top face, a side face, a hole and a boss; it is not run through the stock simulation' + (ph.error ? ' — ' + ph.error : ''));
    const touches = ph.moves.filter((m) => m.k === 'probe'), sets = ph.moves.filter((m) => m.k === 'probeset');
    ok(touches.length === 1 + 1 + 4 + 4 && sets.length === 4 && sets.map((s) => s.kind).join() === 'z,x,centre,centre', '1 touch for a flat face, 4 for a round one; one result each: z, x, centre, centre');
    ok(near(sets[0].expect, 20, 1e-9) && near(touches[0].p[2], 15, 1e-9) && touches[0].axis === 'z', 'top face: expected Z 20, the touch may go 5 past it');
    ok(near(sets[1].expect, 43, 1e-9) && near(touches[1].p[0], 38, 1e-9) && touches[1].axis === 'x', 'the +X side at X 40: the ball\'s centre is expected at 40 + 3, the touch may go to 38');
    ok(near(sets[2].cx, 20, 1e-9) && near(sets[2].cy, 15, 1e-9) && near(sets[3].cx, 8, 1e-9) && near(sets[3].cy, 8, 1e-9), 'the hole\'s and the boss\'s centres are what is expected');
    const hx = touches.slice(2, 6).map((m) => [m.p[0] - 20, m.p[1] - 15]);
    ok(near(hx[0][0], 6 - 3 + 5, 1e-9) && near(hx[1][0], -(6 - 3 + 5), 1e-9) && near(hx[2][1], 8, 1e-9) && near(hx[3][1], -8, 1e-9), 'inside the hole the four touches go out from the centre, to the wall less the ball plus 5');
    const bx = touches.slice(6).map((m) => [m.p[0] - 8, m.p[1] - 8]);
    ok(near(bx[0][0], 5 + 3 - 5, 1e-9) && near(bx[1][0], -3, 1e-9), 'outside the boss they come in from each side');
    ok(touches.every((m) => m.f === 100) && ph.speeds.rpm === 0, 'probing feed 100 mm/min, spindle stopped');
    // posts
    const fx = PO.post(pg, { post: 'fanuc', name: 'probe' }).text;
    ok(/G31 Z15\. F100\./.test(fx) && /#101=#5063/.test(fx) && /#5223=#5223\+\[#101-\[20\.\]\]/.test(fx), 'Fanuc-style: G31, the touch kept in #101, the Z offset moved by found − expected');
    ok(/#5221=#5221\+\[\[#101\+#102\]\/2\.-\[20\.\]\]/.test(fx) && /#5222=#5222\+\[\[#103\+#104\]\/2\.-\[15\.\]\]/.test(fx), 'a centre: the middle of each pair of touches against the expected centre');
    ok(!/S0 M3/.test(fx) && !/M8/.test(fx), 'no spindle start and no coolant for a probe');
    const lx = PO.post(pg, { post: 'linuxcnc', name: 'probe' }).text;
    ok(/G38\.2 Z15 F100/.test(lx) && /#<_pc1>=#5063/.test(lx) && /G10 L2 P1 Z\[#5223\+#<_pc1>-\[20\]\]/.test(lx), 'LinuxCNC: G38.2, the touch kept in a parameter, G10 L2 with the new offset');
    const gx = PO.post(pg, { post: 'grbl', name: 'probe' }).text;
    ok(/G38\.2 Z15 F100/.test(gx) && /G10 L20 P1 Z20/.test(gx) && /cannot work out a centre/.test(gx), 'GRBL: one touch sets an offset with G10 L20; a centre is not written and the file says so');
    const pm = CP.generateProgram(mk(['f1.top'], { action: 'measure' }), regen, {});
    const fm = PO.post(pm, { post: 'fanuc' }).text;
    ok(/#110=#101-\[20\.\]/.test(fm) && !/#5223=/.test(fm), 'measure only: the difference is kept, no offset is changed');
    // after a set, the next move writes every axis again
    const after = lx.slice(lx.indexOf('G10 L2 P1 Z'));
    const nx = after.split('\n')[1];
    ok(/Z/.test(nx), 'after an offset is set the next move names its axis again');
    // refusals
    const noTool = CP.generateProgram(studyOf(setup, tools, [C.newOp('probe', { id: 'p2', tool: 'em10', geo: { faces: [ref('f1.top')], edges: [] } })]), regen, {});
    ok(says('mfg.probe.tool').test(noTool.paths[0].error || ''), 'probing with an end mill is refused');
    ok(says('mfg.probe.pick').test(CP.generateProgram(mk([]), regen, {}).paths[0].error || ''), 'nothing picked: refused');
    ok(says('mfg.probe.kinds').test(CP.generateProgram(mk(['f1.bottom']), regen, {}).paths[0].error || ''), 'a face looking away from the tool is refused');
    let custom = '';
    try { PO.post(pg, { post: 'custom:old', posts: [{ id: 'old', text: 'post old\nname Old\non rapid\n  emit G0 X{x}\nend\n' }] }); } catch (e) { custom = e.message; }
    ok(says('cam.post.err.no_event').test(custom), 'a post with no probing events refuses a probing path');
  }

  // ===================================================================================
  section('CAM Track CAM: study files and the post format');
  {
    const s = C.newStudy();
    ok(s.setup.machine.kin === 'none' && s.setup.machine.rotaryIn === 'table' && s.setup.machine.tcp === false, 'a new study is a 3-axis machine');
    const old = JSON.parse(JSON.stringify(s)); delete old.setup.machine.kin; delete old.setup.machine.pivot; delete old.setup.machine.tcp; delete old.setup.machine.rotaryIn; delete old.setup.machine.tiltMax;
    for (const tl of old.tools) delete tl.lead;
    const rd = C.readStudy(old);
    ok(rd.setup.machine.kin === 'none' && rd.setup.machine.pivot.join() === '0,0,0' && rd.tools.every((x) => x.lead === 93), 'a study saved before 0.11 opens as a 3-axis machine');
    for (const type of Object.keys(C.OP_PARAMS)) { const o = C.newOp(type); if (JSON.stringify(C.readParams(type, o.params)) !== JSON.stringify(o.params)) ok(false, 'defaults of ' + type + ' read back'); }
    ok(Object.keys(C.OP_PARAMS).every((k) => C.OP_GROUPS[k] && C.OP_TYPES[k] !== undefined), 'every operation type has a family and a name');
    const st = studyOf(C.newSetup(), T.starterLibrary(), [C.newOp('turnrough', { id: 'x', orient: { tilt: 30, turn: 0 } })].map((o) => ({ ...o, orient: { tilt: 30, turn: 0 } })));
    ok(st.ops[0].orient === null, 'a tool direction on an operation that cannot tilt (turning) is dropped on reading');
    const d = PD.parsePost('post l\nmachine lathe\nlathe-x radius\non thread\n  emit G33 Z{z} K{thread.lead}\nend\n');
    ok(d.lathe === true && d.latheDia === false && !!d.events.thread, 'the post format reads `machine lathe`, `lathe-x radius` and `on thread`');
    let line = 0;
    try { PD.parsePost('post l\nmachine mill5\n'); } catch (e) { line = e.line; }
    ok(line === 2, 'an unknown machine is refused with its line');
    line = 0;
    try { PD.parsePost('post l\non feed\n  emit A{rot.q}\nend\n'); } catch (e) { line = e.line; }
    ok(line === 3, 'an unknown rot. variable is refused with its line');
    const blank = PD.renderPost(PD.parsePost('post w\non rapid\n  emit G0 X{x} A{rot.a} B{rot.b}\nend\non feed\n  emit G1 X{x}\nend\n'), { setup: { program: 1, coolant: 'off', axis: '+z', origin: 'model-origin', machine: {} }, model: { stock: { kind: 'box', min: [0, 0, 0], max: [1, 1, 1] } }, paths: [{ op: { id: 'a', name: 'a' }, tool: T.newTool('flat', { id: 'q' }), speeds: { rpm: 1 }, moves: [{ k: 'rapid', p: [1, 2, 3] }, { k: 'feed', p: [2, 2, 3], f: 5 }] }] });
    ok(blank.text === 'G0 X1\nG1 X2\n', 'a letter word with nothing to write (A on a machine with no A axis) is left out');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runCamMultiaxisTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
