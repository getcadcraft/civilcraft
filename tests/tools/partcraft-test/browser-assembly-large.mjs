#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-assembly-large.mjs — 0.9 SU.749 (session assembly-09): the large lattice assemblies in the real page. For one size
 * (testfiles/generated/partcraft/assembly-<n>.partcraft-asm.json, made once by gen-assembly-large.mjs) it times open (read +
 * build parts + place + draw), a frame of rotation, picking a part, selecting it (tree + highlight), one mate solve (a joint
 * turned, everything after it moves), a mate solve for a joint near the end, and save (A.toJSON). One size per run, one browser.
 *   nice -n 10 timeout 900 node tools/partcraft-test/browser-assembly-large.mjs --size 1000 [--label before] [--out dir]
 * Prints one JSON line "RESULT {...}" with the machine line and load (headless SwiftShader, never copy as a speed claim).
 * On the workstation: tools/gpu-remote/run.sh --session assembly-09 -- tools/partcraft-test/browser-assembly-large.mjs --size 20000
 */
import fs from 'node:fs';
import { FILES } from './gen-assembly-large.mjs';
import { startHarness, cliArgs } from './browser-harness.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const size = +arg('--size', 1000), label = arg('--label', 'run');
const { state, out } = cliArgs();
if (!fs.existsSync(FILES[size])) { console.log('skip: ' + FILES[size] + ' is missing'); process.exit(0); }
const h = await startHarness({ state, out, exact: false });
const { ok, page } = h;
const text = fs.readFileSync(FILES[size], 'utf8');
const load = () => fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
const R = { size, label, load_before: load() };
try {
  const open = await page.evaluate(async (t) => {
    const pc = window.partcraft, t0 = performance.now();
    await pc.openText(t, 'lattice.partcraft-asm.json');
    await pc.asmBuilt();
    const t1 = performance.now();
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { ms: t1 - t0, firstFrameMs: performance.now() - t1, n: pc.asm.instances.length, joints: pc.asm.joints.length, view: pc.view.instances?.length ?? 0, problems: pc.asmPlace.problems.length,
      heapMB: performance.memory ? performance.memory.usedJSHeapSize / 1e6 : null, draw: pc.view.renderer.info.render.calls };
  }, text);
  Object.assign(R, { open_ms: open.ms, first_frame_ms: open.firstFrameMs, heap_MB: open.heapMB, draw_calls: open.draw, view_objects: open.view });
  ok(open.n === size && open.joints === size - 1 && open.problems === 0, `opens: ${open.n} instances, ${open.joints} joints, ${open.problems} problems`);

  // the whole lattice in view (the worst case for drawing: nothing is off screen)
  R.fit_all = await page.evaluate(() => {
    const v = window.partcraft.view;
    v.view('iso'); v.renderNow();
    return { zoom: v.camera.zoom, calls: v.renderer.info.render.calls, tris: v.renderer.info.render.triangles };
  });
  R.draw_calls = R.fit_all.calls;
  // a frame while the view turns (the page's own drawing choice: boxes for a very large assembly), then one at rest (full detail)
  const frames = await page.evaluate(async () => {
    const v = window.partcraft.view, gl = v.renderer.getContext(), px = new Uint8Array(4), ms = [];
    for (let k = 0; k < 5; k++) { v.orbitBy(7, 2); const t0 = performance.now(); v.renderNow(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); ms.push(performance.now() - t0); }
    const light = !!v.lightNow, calls = v.renderer.info.render.calls;
    await new Promise((r) => setTimeout(r, 500));   // the view has settled: full detail again
    const t1 = performance.now(); v.renderNow(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); const still = performance.now() - t1;
    return { rotate: ms.reduce((a, b) => a + b, 0) / ms.length, light, calls, still, stillLight: !!v.lightNow };
  });
  Object.assign(R, { rotate_frame_ms: frames.rotate, rotate_uses_boxes: frames.light, rotate_calls: frames.calls, still_frame_ms: frames.still });

  const pick = await page.evaluate(() => {
    const v = window.partcraft.view, r = v.canvas.getBoundingClientRect(), ms = []; let hit = null;
    for (const [fx, fy] of [[0.5, 0.5], [0.4, 0.5], [0.6, 0.45], [0.5, 0.6], [0.45, 0.4]]) { const t0 = performance.now(); const x = v.pickAt(r.left + r.width * fx, r.top + r.height * fy); ms.push(performance.now() - t0); hit = hit || x; }
    return { ms: ms.reduce((a, b) => a + b, 0) / ms.length, hit: hit && hit.inst };
  });
  R.pick_ms = pick.ms;

  // select: the tree row of the 10th part (its click selects, redraws the tree and the panel, highlights); the handler's own time
  R.select_ms = await page.evaluate(async () => {
    const pc = window.partcraft, id = pc.asm.instances[9].id;
    const btn = document.querySelector(`[data-inst="${id}"]`);
    const t0 = performance.now();
    btn.click();
    const dt = performance.now() - t0;
    await new Promise((r) => requestAnimationFrame(r));
    return dt;
  });
  R.tree_rows = await page.evaluate(() => document.querySelectorAll('[data-inst]').length);

  // mate solve: turn a revolute joint (first one, near the root) and place everything again
  const solve = await page.evaluate(async () => {
    const pc = window.partcraft, A = pc.A, rev = pc.asm.joints.filter((j) => j.type === 'revolute');
    const time = async (j, deg) => { const t0 = performance.now(); j.angle = deg; const t1 = performance.now(); await pc.rebuild(); return performance.now() - t0; };
    const out = {};
    const t0 = performance.now(); const p = A.placeAll(pc.asm, pc.asmBuilds); out.placeAll_ms = performance.now() - t0;
    out.root_ms = await time(rev[0], 15);          // near the root of the tree
    out.leaf_ms = await time(rev[rev.length - 1], 15);   // near the end
    return out;
  });
  Object.assign(R, { place_all_ms: solve.placeAll_ms, solve_root_ms: solve.root_ms, solve_leaf_ms: solve.leaf_ms });

  // the view's own checks (instancing, picking, the lightweight display, a section): what it shows is what the assembly says
  const chk = await page.evaluate(async () => {
    const pc = window.partcraft, v = pc.view, out = {};
    out.batches = v.batches.length; out.parts = Object.keys(pc.asm.parts).length;
    const rev = pc.asm.joints.find((j) => j.type === 'revolute');
    const child = rev.b.inst, rec = v.instances.find((r) => r.id === child), want = pc.asmPlace.world.get(child);
    out.matrixInView = want.every((x, k) => Math.abs(x - rec.matrix[k]) < 1e-9) && want.every((x, k) => Math.abs(x - rec.batch.mesh.instanceMatrix.array[rec.slot * 16 + k]) < 1e-5);
    const r = v.canvas.getBoundingClientRect();
    let hit = null; for (let y = 0.3; y < 0.8 && !hit; y += 0.05) for (let x = 0.3; x < 0.8 && !hit; x += 0.05) hit = v.pickAt(r.left + r.width * x, r.top + r.height * y, { edges: false });
    out.pickInst = hit?.inst || null; out.pickKnown = !!hit && pc.asm.instances.some((i) => i.id === hit.inst) && hit.tris?.length > 0 && Array.isArray(hit.point);
    // the lightweight display, from the Views menu
    document.querySelector('[data-cmd="view-light"]').click();
    out.lightOn = v.lightNow === true && v.batches.every((b) => b.proxy.visible && !b.mesh.visible);
    document.querySelector('[data-cmd="view-light"]').click();
    out.lightOff = v.lightNow === false && v.batches.every((b) => !b.proxy.visible && b.mesh.visible);
    // a section through the middle
    const c = v.box.getCenter(new pc.host.THREE.Vector3());
    v.setSection({ n: [0, 1, 0], c: c.y, caps: true }); v.renderNow();
    out.sectionOk = v.capParts.length === 2 * v.batches.length; v.setSection(null);
    return out;
  });
  ok(chk.batches === chk.parts, `one draw group per part: ${chk.batches} for ${chk.parts} parts`);
  ok(chk.matrixInView, 'a joint\'s moved part sits in the view where the assembly puts it');
  ok(chk.pickKnown, `a pick in the view finds a part of the assembly (${chk.pickInst})`);
  ok(chk.lightOn && chk.lightOff, 'Views > Lightweight display draws boxes, and back to the parts in full');
  ok(chk.sectionOk, 'a section view still caps every group');
  R.save_ms = await page.evaluate(() => { const pc = window.partcraft, t0 = performance.now(); const s = pc.A.toJSON(pc.asm); R_bytes = s.length; return performance.now() - t0; });
  R.save_MB = await page.evaluate(() => R_bytes / 1e6);
  R.problems = h.problems.slice(0, 5);
  R.load_after = load();
  R.machine = await page.evaluate(() => navigator.userAgent.replace(/.*\(([^)]*)\).*/, '$1') + ', ' + (navigator.hardwareConcurrency || '?') + ' cores');
  console.log('RESULT ' + JSON.stringify(R));
} catch (e) { await h.failed(e); console.log('RESULT ' + JSON.stringify({ ...R, error: String(e).slice(0, 300) })); }
await h.finish();
