#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cam-library.mjs — PartCraft's tool libraries (cam-tools.js: exportLibrary, readLibrary, mergeTools, the saved library) and the
 * stock-versus-model colour of the material-removal simulation (cam-sim.js: deviation, colorAt, toMesh colours):
 *   · a library file round-trips every tool; ids are not in the file and are new where it lands; every refusal (not JSON, wrong
 *     format, newer version, too many tools, a bad number, too big);
 *   · merging: the same tool twice is skipped, a taken T number moves to the next free one, ids stay unique;
 *   · my saved library lives in browser storage and survives a missing, full or corrupted store;
 *   · the simulation on a small block: facing to the model's top leaves green on the model and the colour of uncut stock round it,
 *     facing 0.5 mm too deep is red, the colour ramp has the right ends, the mesh carries one colour per vertex = the cell's colour.
 *   Tiny sizes only (a 12 × 12 mm block, cell 0.5).
 *   node tools/partcraft-test/test-cam-library.mjs [--verbose]   (or runCamLibraryTests() from test-cam.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function runCamLibraryTests({ ok, section, near }) {
  const T = await import(DEV + 'cam-tools.js');
  const C = await import(DEV + 'cam.js');
  const CP = await import(DEV + 'cam-paths.js');
  const CS = await import(DEV + 'cam-sim.js');

  // ===================================================================================
  section('CAM tool library: file, merge, saved');
  const lib = T.starterLibrary();
  lib[0].vc = 150; lib[2].feed = 480.5; lib[3].name = 'My bull nose';
  const text = T.exportLibrary(lib, 'Shop tools');
  const J = JSON.parse(text);
  ok(J.format === 'partcraft-tool-library' && J.version === 1 && J.name === 'Shop tools' && J.tools.length === lib.length && J.tools.every((x) => !('id' in x)), 'the file: format, version, name, every tool, no ids');
  {
    const back = T.readLibrary(text);
    const strip = ({ id, ...r }) => r;
    ok(back.length === lib.length && back.every((x, i) => JSON.stringify(strip(x)) === JSON.stringify(strip(T.readTool(lib[i])))), 'a library file reads back to the same tools (sizes, flutes, overrides, names)');
    ok(new Set(back.map((x) => x.id)).size === back.length, 'each tool gets an id of its own');
    ok(T.readLibrary(J).length === lib.length, 'an object is read as well as text');
  }
  {
    const bad = (fn) => { const x = JSON.parse(text); fn(x); try { T.readLibrary(JSON.stringify(x)); return false; } catch { return true; } };
    let e1 = null, e2 = null, e3 = null;
    try { T.readLibrary('{nope'); } catch (e) { e1 = e.message; }
    try { T.readLibrary(JSON.stringify({ format: 'something-else', version: 1, tools: [] })); } catch (e) { e2 = e.message; }
    try { T.readLibrary('x'.repeat(T.LIBRARY_BYTES + 1)); } catch (e) { e3 = e.message; }
    ok(e1 && e2 && e3 && e1 !== e2 && e2 !== e3, 'not JSON, another format, too big: each refused with its own message');
    ok(bad((x) => { x.version = 2; }) && bad((x) => { x.version = 0; }) && bad((x) => { x.tools = 'many'; }) && bad((x) => { x.tools = Array(501).fill(x.tools[0]); }), 'a newer or older version, a tool list that is not a list, more than 500 tools: refused');
    ok(bad((x) => { x.tools[0].d = -3; }) && bad((x) => { x.tools[1].kind = 'laser'; }) && bad((x) => { x.tools[2].flutes = 2.5; }) && bad((x) => { x.tools[0].number = 1000; }) && bad((x) => { x.tools[4].angle = 5; }), 'a tool with a negative size, an unknown kind, half a flute, T1000 or a 5° drill point: refused');
  }
  {
    const a = T.readLibrary(text);
    const m1 = T.mergeTools([], a);
    ok(m1.added.length === a.length && !m1.skipped.length && !m1.renumbered.length, 'into an empty list: all added, none renumbered');
    const m2 = T.mergeTools(m1.tools, a);
    ok(m2.added.length === 0 && m2.skipped.length === a.length && m2.tools.length === a.length, 'the same file again: every tool is already there, nothing added');
    const mine = [T.newTool('flat', { id: 'x1', number: 1, d: 12, flutes: 4 }), T.newTool('ball', { id: 'x2', number: 2, d: 10 })];
    const m3 = T.mergeTools(mine, a);
    ok(m3.added.length === a.length && m3.renumbered.length >= 2 && m3.tools.length === 2 + a.length, `onto tools already on T1 and T2: the file's ${m3.renumbered.length} clashing numbers move to the next free ones`);
    const nums = m3.tools.map((x) => x.number), ids = m3.tools.map((x) => x.id);
    ok(new Set(nums).size === nums.length && new Set(ids).size === ids.length && nums.every((n) => n >= 1 && n <= 999), 'after merging every T number and id is unique and within 1–999');
    ok(m3.renumbered.every((r) => m3.tools.some((x) => x.number === r.to && x.name === r.name)), 'the report names each tool and its new number');
    const full = Array.from({ length: 999 }, (_, i) => T.newTool('flat', { id: 'f' + i, number: i + 1, d: 1 + (i % 50) / 7, flutes: 1 + (i % 4) }));
    let m = null; try { T.mergeTools(full, [T.newTool('drill', { id: 'z', number: 5, d: 99 })]); } catch (e) { m = e.message; }
    ok(m, 'all 999 T numbers in use: a new tool is refused, not given a number past 999');
  }
  {
    const mem = () => { const o = {}; return { getItem: (k) => (k in o ? o[k] : null), setItem: (k, v) => { o[k] = v; }, _o: o }; };
    const st = mem();
    ok(T.savedLibrary(st).length === 0, 'my saved library starts empty');
    const r1 = T.saveToLibrary([lib[0], lib[1]], st);
    ok(r1.ok && r1.added.length === 2 && T.savedLibrary(st).length === 2, 'saving two tools keeps them');
    const r2 = T.saveToLibrary([lib[1], lib[2]], st);
    ok(r2.ok && r2.added.length === 1 && r2.skipped.length === 1 && T.savedLibrary(st).length === 3, 'saving one it already has and one new: one added, one skipped');
    ok(T.removeFromLibrary(0, st) && T.savedLibrary(st).length === 2 && !T.removeFromLibrary(9, st), 'removing the first; a place that is not there is refused');
    st.setItem(T.LIBRARY_KEY, '{broken');
    ok(T.savedLibrary(st).length === 0, 'a corrupted store reads as empty and does not throw');
    const full = { getItem: () => null, setItem: () => { throw new Error('quota'); } };
    ok(T.saveToLibrary([lib[0]], full).ok === false && T.savedLibrary(null).length === 0 && T.saveToLibrary([lib[0]], null).ok === false, 'a full or missing store: saving says it did not work; nothing throws');
  }

  // ===================================================================================
  section('CAM simulation: stock against the model in colour');
  {
    // a 12 × 12 × 5 block as 12 triangles
    const P = [[0, 0, 0], [12, 0, 0], [12, 12, 0], [0, 12, 0], [0, 0, 5], [12, 0, 5], [12, 12, 5], [0, 12, 5]].flat();
    const I = [0, 2, 1, 0, 3, 2, 4, 5, 6, 4, 6, 7, 0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7];
    const rg = { mesh: { positions: new Float32Array(P), indices: new Uint32Array(I), triFace: new Int32Array(12) }, stats: { bbox: { min: [0, 0, 0], max: [12, 12, 5] } }, faces: [], edges: [] };
    const setup = C.newSetup(); setup.axis = '+z'; setup.origin = 'model-origin'; setup.stock = { ...setup.stock, side: 4, top: 1, bottom: 0 };
    const model = C.machineModel(rg, setup);
    const face = T.newTool('face', { id: 'fm', number: 1, d: 10, flutes: 4 });
    const run = (params) => {
      const st = C.newStudy(); st.setup = setup; st.tools = [face]; st.ops = [C.newOp('face', { id: 'f', tool: 'fm', params })];
      const sim = new CS.Sim(model, { cell: 0.5 });
      CP.generateProgram(st, rg, { sim, model });
      return sim;
    };
    const cellOf = (sim, x, y) => Math.floor((y - sim.y0) / sim.cell) * sim.nx + Math.floor((x - sim.x0) / sim.cell);
    const before = new CS.Sim(model, { cell: 0.5 });
    const d0 = before.deviation();
    ok(Math.abs(d0[cellOf(before, 6, 6)] - 1) < 1e-6 && Math.abs(d0[cellOf(before, -2, 6)] - 6) < 1e-6, 'before any cut: 1 mm of stock on the model (over the block), 6 mm beside it (the stock is 6 high)');
    const sim = run({});
    const d1 = sim.deviation(), c6 = cellOf(sim, 6, 6), cOut = cellOf(sim, -2, 6);
    ok(Math.abs(d1[c6]) < 1e-6, 'faced down to the model top: zero stock left on the model');
    ok(sim.colorAt(d1[c6]).join() === CS.ON_RGB.join(), 'zero is green (on the model)');
    ok(Math.abs(d1[cOut] - 5) < 1e-6 && sim.colorAt(d1[cOut]).join() === CS.STOCK_RGB.join(), 'beside the block the stock is 5 mm thick after facing: the colour of uncut stock');
    const deep = run({ bottom: 4.5 });
    const dd = deep.deviation();
    ok(Math.abs(dd[cellOf(deep, 6, 6)] + 0.5) < 1e-6 && deep.colorAt(dd[cellOf(deep, 6, 6)]).join() === CS.GOUGE_RGB.join(), 'faced 0.5 mm too deep: −0.5 mm and red');
    ok(CS.GOUGE_RGB[0] > CS.GOUGE_RGB[1] && CS.ON_RGB[1] > CS.ON_RGB[0], 'red is red, green is green');
    const lerp = (A, B, u) => A.map((x, i) => x + (B[i] - x) * u);
    const near3 = (p, q) => p.every((x, i) => Math.abs(x - q[i]) < 1e-9);
    ok(near3(sim.colorAt(0.12), lerp(CS.THIN_RGB, CS.MID_RGB, 0.2)) && near3(sim.colorAt(0.52), lerp(CS.MID_RGB, CS.STOCK_RGB, 0)) && near3(sim.colorAt(0.77), lerp(CS.MID_RGB, CS.STOCK_RGB, 0.5)), 'the ramp: yellow for a thin skin, orange at 0.5 mm, blending to the colour of uncut stock at 1 mm');
    ok(sim.colorAt(1.02).join() === CS.STOCK_RGB.join() && sim.colorAt(5).join() === CS.STOCK_RGB.join() && sim.colorAt(NaN).join() === CS.STOCK_RGB.join(), '1 mm or more of stock, and cells outside the stock, are the colour of uncut stock');
    ok(sim.colorAt(0.02).join() === CS.ON_RGB.join() && sim.colorAt(-0.02).join() === CS.ON_RGB.join() && sim.colorAt(-0.021).join() === CS.GOUGE_RGB.join(), 'on the model means within ±0.02 mm (the simulation tolerance); beyond it the cell is a gouge');
    const m = before.toMesh(2, { colors: true });
    ok(m.colors instanceof Float32Array && m.colors.length === m.positions.length, 'the mesh carries one RGB colour per vertex');
    const m0 = before.toMesh(2);
    ok(!m0.colors, 'without colors: the mesh as before');
    // vertex (i, j) takes the colour of its cell: check a few
    const step = 2, nx = Math.ceil(before.nx / step) + 1;
    let bad = 0;
    for (const [i, j] of [[3, 3], [9, 9], [1, 12], [14, 2]]) {
      const ci = Math.min(before.nx - 1, i * step), cj = Math.min(before.ny - 1, j * step);
      const want = before.colorAt(d0[cj * before.nx + ci]);
      const k = (j * nx + i) * 3;
      if (Math.abs(m.colors[k] - want[0]) > 1e-6 || Math.abs(m.colors[k + 1] - want[1]) > 1e-6 || Math.abs(m.colors[k + 2] - want[2]) > 1e-6) bad++;
    }
    ok(bad === 0, 'each vertex has the colour of its own cell');
    const rep = sim.report();
    ok(rep.gouges === 0 && deep.report().gouges > 100, 'the report and the colours agree: no gouge when faced to the top, many when 0.5 mm too deep');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
  await runCamLibraryTests({ ok, section, near });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
