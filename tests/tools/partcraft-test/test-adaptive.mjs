#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-adaptive.mjs — CAM 2D adaptive clearing (0.4 P24, cam-adaptive.js + the 'adaptive' operation in cam-paths.js).
 *   1. The passes on their own, re-simulated on a separate, finer raster (engagementCheck): a 60 × 40 rectangle, an 80 × 50
 *      rectangle with a round island, an L — the largest engagement angle within one raster cell's worth of the target
 *      acos(1 − w/R), nothing the cutter can reach left uncut (with the wall pass), no point nearer the walls than R, most
 *      links kept down.
 *   2. The operation on a block pocket built by OpenCascade (as test-cam.mjs): every cutting point ≥ r from the walls and the
 *      wall pass at exactly r, the floor at −9 and never below, the floor cut everywhere but the four corners a round tool
 *      cannot reach (cam-sim.js), a helix in, and the program posted as G-code (arcs, no NaN).
 *   node tools/partcraft-test/test-adaptive.mjs [--verbose]    (or runAdaptiveTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runAdaptiveTests({ ok, section, oc }) {
  (await import(DEV + 'i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const O = await import(DEV + 'cam-offset.js'), A = await import(DEV + 'cam-adaptive.js');
  const near = (a, b, t = 1e-9) => Math.abs(a - b) <= t;
  const rect = (x0, y0, x1, y1) => [O.line([x0, y0], [x1, y0]), O.line([x1, y0], [x1, y1]), O.line([x1, y1], [x0, y1]), O.line([x0, y1], [x0, y0])];

  section('adaptive clearing: the passes (cam-adaptive.js)');
  const R = 5, w = 1.5, target = Math.acos(1 - w / R) * 180 / Math.PI;
  for (const [name, loops] of [
    ['a 60 × 40 rectangle', O.orientRegion([rect(0, 0, 60, 40)])],
    ['an 80 × 50 rectangle round a Ø16 island', O.orientRegion([rect(0, 0, 80, 50), [O.circle([40, 25], 8)]])],
    ['an L (70 × 60, arms 25 wide)', O.orientRegion([[O.line([0, 0], [70, 0]), O.line([70, 0], [70, 25]), O.line([70, 25], [25, 25]), O.line([25, 25], [25, 60]), O.line([25, 60], [0, 60]), O.line([0, 60], [0, 0])]])],
  ]) {
    const r = A.adaptivePasses(loops, { R, w });
    const e = A.engagementCheck(loops, { R, entry: r.entry, passes: r.passes, closed: r.closed, links: r.links, finish: O.offsetRegion(loops, R) });
    // one raster cell of error in where a pass sits changes the engagement width by up to a cell
    const slack = Math.acos(1 - Math.min(1, (w + r.cell) / R)) * 180 / Math.PI;
    ok(e.angle <= slack + 1 && e.uncut === 0 && e.gouge >= -1e-9, `${name}: ${r.stats.passes} passes; largest engagement ${e.angle.toFixed(0)}° (target ${target.toFixed(1)}°, one ${r.cell.toFixed(2)} mm cell allows ${slack.toFixed(1)}°), nothing reachable left uncut, never nearer the walls than R (+${e.gouge.toFixed(3)} mm)`);
    ok(r.links.filter((x) => x === 'down').length >= r.links.length / 2 && e.inCut / e.pathLen > 0.4, `${name}: ${r.links.filter((x) => x === 'down').length} of ${r.links.length} links stay down; ${(100 * e.inCut / e.pathLen).toFixed(0)} % of the path cuts`);
  }
  let threw = ''; try { A.adaptivePasses(O.orientRegion([rect(0, 0, 8, 8)]), { R, w }); } catch (er) { threw = er.message; }
  ok(/does not fit/.test(threw), `a pocket narrower than the tool is refused ("${threw}")`);

  section('adaptive clearing: the operation (cam-paths.js) on a block pocket');
  if (!oc) return;
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'), B = await import(DEV + 'brep.js');
  const C = await import(DEV + 'cam.js'), CP = await import(DEV + 'cam-paths.js'), CS = await import(DEV + 'cam-sim.js'), PO = await import(DEV + 'cam-post.js');
  const part = P.newPart('Block');
  const s1 = S.newSketch(); S.addRect(s1, [0, 0], [100, 60]);
  const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: s1 });
  const e1 = P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 20 });
  const s2 = S.newSketch(); S.addRect(s2, [30, 18], [70, 42]);
  const f2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: s2 });
  P.addFeature(part, 'extrude', { sketch: f2.id, op: 'cut', end: 'blind', depth: 8 });
  const rg = B.regenerateBrep(part, oc);
  const study = C.newStudy();
  study.setup.stock = { ...study.setup.stock, side: 2, top: 1, bottom: 0 };
  const model = C.machineModel(rg, study.setup);
  const fi = rg.faces.findIndex((f, i) => model.isFloor(model.faces[i]) && Math.abs(model.faces[i].o[2] + 9) < 1e-6);
  const em = study.tools.find((t) => t.id === 'em6'), r = em.d / 2;
  study.ops = [C.newOp('adaptive', { id: 'ad', tool: 'em6', geo: { faces: [B.faceRef(rg.faces[fi])] }, params: { stepdown: 4, engagement: 0.15 } })];
  const sim = new CS.Sim(model, { cell: 0.1 });
  const prog = CP.generateProgram(study, rg, { sim, model });
  const path0 = prog.paths[0];
  ok(!path0.error && path0.moves.length > 50 && path0.info.passes > 5 && near(path0.info.engagement.w, 0.9), `the adaptive operation builds: ${path0.error || path0.moves.length + ' moves, ' + path0.info.passes + ' passes, engagement 0.15 × Ø6 = ' + path0.info.engagement.w + ' mm (' + path0.info.engagement.angle.toFixed(1) + '°)'}`);
  const walls = rect(32, 20, 72, 44);
  const segs = CP.segments([path0]).filter((s) => s.k !== 'rapid' && Math.min(s.a[2], s.b[2]) < -1 + 1e-9);
  const pts = segs.flatMap((s) => CP.segPoints(s, 1e-4));
  const md = Math.min(...pts.map((q) => O.distToLoops([q[0], q[1]], [walls])));
  ok(pts.every((q) => O.inside([walls], [q[0], q[1]])) && Math.abs(md - r) < 1e-9, `every cutting point inside the pocket and at least r from the walls; the wall pass at exactly r (min ${md.toFixed(12)})`);
  const zs = [...new Set(segs.map((s) => +s.b[2].toFixed(9)))].sort((a, b) => a - b);
  ok(near(zs[0], -9, 1e-9) && segs.every((s) => s.b[2] >= -9 - 1e-9), 'floor at −9 (two levels of ≤ 4), never deeper');
  ok(path0.moves.some((m) => m.k === 'arc' && Math.abs(m.p[2] - (path0.moves[path0.moves.indexOf(m) - 1]?.p?.[2] ?? m.p[2])) > 1e-9), 'it goes in by a helix (arcs that descend)');
  let wrong = 0;
  const c = sim.cell;
  for (let j = 0; j < sim.ny; j++) for (let i = 0; i < sim.nx; i++) {
    const [x, y] = sim.centre(i, j);
    if (x < 32 + c || x > 72 - c || y < 20 + c || y > 44 - c) continue;
    const cx = x < 52 ? 32 + r : 72 - r, cy = y < 32 ? 20 + r : 44 - r;
    const inCornerSq = Math.abs(x - cx) <= r && Math.abs(y - cy) <= r && (x < 32 + r || x > 72 - r) && (y < 20 + r || y > 44 - r);
    const cut = Math.abs(sim.at(x, y) + 9) < 1e-9, band = Math.abs(Math.hypot(x - cx, y - cy) - r) < c;
    if (!band && cut === (inCornerSq && Math.hypot(x - cx, y - cy) > r)) wrong++;
  }
  ok(wrong === 0, `the floor is cut to −9 everywhere but the four corner remnants a round tool cannot reach (cam-sim; mismatches ${wrong})`);
  ok(!path0.sim.rapidCuts && !path0.sim.gouges, `the simulation: no rapid move into stock and no gouge (rapids into stock ${path0.sim.rapidCuts || 0})`);
  const g = PO.post(prog, { post: 'grbl', name: 'Block' });
  const txt = typeof g === 'string' ? g : g.text;
  ok(/G0?[23]\b/.test(txt) && !/NaN|undefined/.test(txt) && txt.split('\n').length > 50, `posted for GRBL: ${txt.split('\n').length} lines with arcs (G2/G3), no NaN`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  await runAdaptiveTests({ ok, section, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
