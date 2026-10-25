#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-flow.mjs — the Flow study in headless Chromium: a block with a Ø10 bore set up by clicks (New study, type Flow,
 * cell size, an inlet on one rim and an outlet on the other, clicked in the view), solved in the compute worker with
 * progress; the panel's pressure drop and flow equal flow-worker.js run in Node on the same part; the cut plane, the
 * streamlines, the see-through part and the surface pressure are overlays; the plane slider moves the plane; the hover
 * probe reads the plane; an external study around the block gives drag and Cd; Stop; the study saved in the part file and
 * read back; switching back to a static study clears the flow overlays; one toolbar row; no console errors.
 *   node tools/partcraft-test/browser-flow.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { helpers } from './browser-simulation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

async function pipePart() {
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js');
  const part = P.newPart('Pipe');
  const sk = S.newSketch(); S.addRect(sk, [-10, -10], [10, 10]); S.addCircle(sk, [0, 0], 5);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
  P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 40 });
  return part;
}

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  const { facePoint, viewAs, rows, choose, setNum } = helpers(h);
  const ov = (k) => pc((k) => { const o = window.partcraft.view.overlays.get('simulation-flow-' + k); return o ? { type: o.type, lines: o.userData.flowLines || 0, slice: o.userData.slice ? { at: o.userData.slice.at, axes: o.userData.slice.axes } : null } : null; }, k);

  console.log('\n== flow: a bored block set up by clicks');
  await pc(() => window.partcraft.exactReady());
  const part = await pipePart();
  await pc((t) => window.partcraft.openText(t, 'Pipe.partcraft.json'), JSON.stringify(part));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-kind]', 'flow');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.kind === 'flow' && !!window.partcraft.part.studies.simulation.flow);
  ok(await page.isVisible('[data-flow-type]') && await page.isDisabled('[data-flow-solve]'), 'Type › Flow shows the flow panel; Solve is off without openings');
  ok(await page.isDisabled('.pc-tools [data-cmd="simulation-fixed"]'), 'the structural Fixed tool is off in a flow study');
  await setNum('[data-flow-size]', 1);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.h === 1);
  const est = Number(await page.getAttribute('[data-flow-estimate]', 'data-flow-estimate'));
  ok(est === 24 * 24 * 44, `cell size 1 mm from the panel: the grid estimate is ${est} cells (24 × 24 × 44)`);
  // inlet on the −Z rim, outlet on the +Z rim
  await viewAs('back');
  await page.selectOption('[data-flow-add-role]', 'inlet');
  await page.click('[data-flow-add]');
  await page.waitForSelector('[data-flow-pick][aria-pressed="true"]');
  const back = await facePoint([0, 0, -1]);
  ok(!!back, 'the −Z rim is on screen');
  await page.mouse.click(back.x, back.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.openings[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await setNum('[data-flow-value]', 0.001);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.openings[0].value === 0.001);
  await viewAs('front');
  await page.selectOption('[data-flow-add-role]', 'outlet');
  await page.click('[data-flow-add]');
  const front = await facePoint([0, 0, 1]);
  await page.mouse.click(front.x, front.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.openings[1]?.faces.length === 1);
  await page.keyboard.press('Escape');
  const ops = await pc(() => window.partcraft.part.studies.simulation.flow.openings);
  ok(ops[0].role === 'inlet' && ops[0].faces[0].name === back.name && ops[1].role === 'outlet' && ops[1].faces[0].name === front.name && ops[1].p === 0, `Add inlet + a click on one rim (${back.name}), 1 mm/s; Add outlet + a click on the other (${front.name}), 0 Pa`);
  const tint = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-flow-markers'); let n = 0; o?.traverse((x) => { if (x.isMesh) n++; }); return n; });
  ok(tint === 2, `both openings are tinted in the view (${tint})`);
  await viewAs('iso');

  console.log('\n== flow: solve, results, plots');
  ok(!(await page.isDisabled('.pc-tools [data-cmd="simulation-solve"]')), 'the toolbar Solve is on once there is an inlet and an outlet');
  await page.click('.pc-tools [data-cmd="simulation-solve"]');
  await page.waitForSelector('[data-flow-progress]');
  await page.waitForSelector('[data-flow-dp]', { timeout: 180000 });
  const got = await page.evaluate(() => ({ dp: Number(document.querySelector('[data-flow-dp]').dataset.flowDp), re: Number(document.querySelector('[data-flow-re]').dataset.flowRe), cells: Number(document.querySelector('[data-flow-cells]').dataset.flowCells), bal: Number(document.querySelector('[data-flow-balance]').dataset.flowBalance), conv: document.querySelector('[data-flow-conv]').dataset.flowConv }));
  // the same study in Node
  const FS = await import(DEV + 'flow-study.js'), FW = await import(DEV + 'flow-worker.js'), B = await import(DEV + 'brep.js'), P = await import(DEV + 'part.js');
  await import(DEV + 'ws-simulation.js');
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  const saved = P.readPart(await pc(() => window.partcraft.host.P.toJSON(window.partcraft.part)));
  const rg = B.regenerateBrep(saved, oc);
  const ref = FW.solveFlow(FS.flowJob(saved.studies.simulation, rg).job);
  ok(got.conv === '1' && Math.abs(got.dp / ref.dp - 1) < 1e-6 && got.cells === ref.mesh.fluid, `solved in the worker: converged, pressure drop ${got.dp.toExponential(5)} Pa and ${got.cells} fluid cells equal flow-worker.js in Node (${ref.dp.toExponential(5)} Pa, ${ref.mesh.fluid})`);
  const thr = await page.evaluate(() => Number(document.querySelector('[data-flow-threads]')?.dataset.flowThreads || 0));   // round 5 (builder C): solver threads
  ok(ref.mesh.fluid < 20000 ? thr === 1 : thr > 1 && got.dp === ref.dp, `solver threads: ${thr} for ${ref.mesh.fluid} fluid cells${thr > 1 ? `; pressure drop bit-identical to one thread in Node (${got.dp} Pa)` : ' (under the 20,000-cell threshold: one thread)'}`);
  ok(Math.abs(got.re - 998.21 * 0.001 * 0.01 / 1.0016e-3) < 0.05 && Math.abs(got.bal) < 1e-3, `Reynolds number ${got.re.toFixed(3)} (ρUD/μ ≈ 9.97) and mass balance ${(100 * got.bal).toExponential(2)} % in the table`);
  ok(await page.isVisible('[data-flow-residuals="done"]'), 'the residual history is drawn');
  const plane = await ov('plane'), lines = await ov('streams'), ghost = await ov('ghost');
  ok(plane && plane.slice && lines && lines.lines > 10 && ghost && !(await pc(() => window.partcraft.view.partVisible)), `overlays: the cut plane, ${lines ? lines.lines : 0} streamlines from the inlet, and the part see-through (hidden, ghost drawn)`);
  await shot('flow-results');
  // slider moves the plane
  const at0 = plane.slice.at;
  await page.evaluate(() => { const r = document.querySelector('[data-flow-at]'); r.value = String(Number(r.min) + 0.25 * (Number(r.max) - Number(r.min))); r.dispatchEvent(new Event('input', { bubbles: true })); });
  const plane2 = await ov('plane');
  ok(plane2 && plane2.slice.at < at0 - 1, `the plane slider moves the cut plane (${at0.toFixed(2)} → ${plane2 ? plane2.slice.at.toFixed(2) : '?'} mm)`);
  // probe: hover the plane's centre on screen
  const pt = await page.evaluate(() => {
    const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, o = view.overlays.get('simulation-flow-plane');
    o.geometry.computeBoundingBox(); const c = o.geometry.boundingBox.getCenter(new THREE.Vector3()); const r = view.canvas.getBoundingClientRect(); const v = c.clone().project(view.camera);
    return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height };
  });
  await page.mouse.move(pt.x, pt.y);
  await page.waitForTimeout(150);
  const probe = await page.textContent('[data-flow-probe]');
  ok(/Speed .* m\/s.*pressure .* Pa/.test(probe), `hovering the plane reads it: "${probe.slice(0, 90)}…"`);
  await page.selectOption('[data-flow-look]', 'pressure');
  ok(!!(await ov('surface')) && await pc(() => window.partcraft.view.partVisible), 'Part › Surface pressure colours the part (an overlay over the visible part)');
  await page.selectOption('[data-flow-show]', 'pressure');
  ok((await page.textContent('[data-sim-legend]')).includes('Static pressure'), 'Plane shows › Static pressure: the legend says so');

  console.log('\n== flow: external, stop, saving');
  await page.selectOption('[data-flow-type]', 'external');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.type === 'external');
  await page.selectOption('[data-flow-fluid]', 'air');
  await setNum('[data-flow-size]', 2.5);
  await setNum('[data-flow-speed]', 0.01);
  await setNum('[data-flow-up]', 10); await setNum('[data-flow-down]', 20); await setNum('[data-flow-side]', 10);
  await page.waitForFunction(() => { const e = window.partcraft.part.studies.simulation.flow; return e.h === 2.5 && e.ext.speed === 0.01 && e.ext.side === 10 && e.fluid === 'air'; });
  await page.click('[data-flow-solve]');
  await page.waitForSelector('[data-flow-cd]', { timeout: 180000 });
  const ext = await page.evaluate(() => ({ cd: Number(document.querySelector('[data-flow-cd]').dataset.flowCd), drag: Number(document.querySelector('[data-flow-cd]').dataset.flowDrag), A: Number(document.querySelector('[data-flow-aref]').dataset.flowAref) }));
  ok(ext.cd > 0 && ext.drag > 0 && Math.abs(ext.A - 800) < 4, `external flow along +X around the block: drag ${ext.drag.toExponential(3)} N, Cd ${ext.cd.toFixed(3)} on the frontal area ${ext.A.toFixed(1)} mm² (20 × 40 seen along X; a tight test box, so no reference value)`);
  const box = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-flow-markers'); let b = 0; o?.traverse((x) => { if (x.type === 'Box3Helper') b++; }); return b; });
  ok(box === 1, 'the domain box and the flow arrow are drawn');
  await setNum('[data-flow-size]', 0.4);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.h === 0.4);
  await page.click('[data-flow-solve]');
  await page.waitForSelector('[data-flow-progress]');
  await page.click('[data-flow-stop]');
  await page.waitForFunction(() => /Stopped/.test(document.querySelector('[data-status]').textContent));
  ok(!(await page.isDisabled('[data-flow-solve]')), 'Stop ends a running solve; Solve is available again');
  const rd = await pc(() => { const t = window.partcraft.host.P.toJSON(window.partcraft.part); const p = window.partcraft.host.P.readPart(t); return { v: JSON.parse(t).version, s: p.studies.simulation }; });
  ok(rd.v === 3 && rd.s.kind === 'flow' && rd.s.flow.type === 'external' && rd.s.flow.openings.length === 2 && rd.s.flow.ext.speed === 0.01, 'the flow study is saved in the part file (version 3) and reads back');
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.h === 2.5);
  ok(true, 'Ctrl+Z undoes a flow change (cell size back to 2.5)');
  await page.selectOption('[data-sim-kind]', 'static');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.kind === 'static');
  ok(await pc(() => ![...window.partcraft.view.overlays.keys()].some((k) => k.startsWith('simulation-flow-')) && window.partcraft.view.partVisible) && await page.isVisible('[data-sim-material]'), 'back to Static stress: the structural panel, no flow overlays');
  ok((await rows()) === 1, 'Simulation: the toolbar is one row at 1440 px');
  await choose('design');
  ok(await pc(() => window.partcraft.view.partVisible && !window.partcraft.view.overlays.size), 'back in Design: plain part, no overlays');
  ok(h.problems.length === 0, 'flow: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
