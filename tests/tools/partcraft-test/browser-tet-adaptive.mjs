#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-tet-adaptive.mjs — round 5 of the tet studies in headless Chromium: automatic refinement and exact surfaces.
 *   A steel cantilever with its supports and load already in the file: "Refine automatically (adaptive)" appears for a
 *   tetrahedral static study, its target and passes are set, Solve runs the passes in the compute worker, the convergence
 *   table (one row per pass) and chart are shown with the stop message, and the last pass equals tetSolve run in Node on
 *   the same job; a pressurised thick sphere (octant, Lamé) whose bore is a sphere: the regen hands the exact surface
 *   through the page to the worker, the table says every face is exact, the result equals Node; settings saved and read
 *   back; no console errors.
 *   node tools/partcraft-test/browser-tet-adaptive.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  const { choose, setNum } = helpers(h);
  const near = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
  const SIM = await import(DEV + 'sim.js'), B = await import(DEV + 'brep.js'), P = await import(DEV + 'part.js'), TW = await import(DEV + 'tet-worker.js'), S = await import(DEV + 'sketch.js');
  await import(DEV + 'ws-simulation.js');   // registers the simulation study reader for readPart
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  const planeOf = (rg, n) => rg.faces.find((f) => f.type === 'plane' && f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] > 0.999);
  const nodeRef = async () => { const saved = P.readPart(await pc(() => window.partcraft.host.P.toJSON(window.partcraft.part))); return TW.tetSolve(SIM.simJob(saved.studies.simulation, B.regenerateBrep(saved, oc)).job); };

  console.log('\n== adaptive: a cantilever refined automatically');
  {
    const part = await cantileverPart(), rg = B.regenerateBrep(part, oc);
    part.studies = { simulation: { ...SIM.newSimStudy(), material: 'steel', h: 5, seq: 2, constraints: [{ id: 'c1', type: 'fixed', faces: [B.faceRef(planeOf(rg, [-1, 0, 0]))] }], loads: [{ id: 'l2', type: 'force', faces: [B.faceRef(planeOf(rg, [1, 0, 0]))], total: 100, dir: [0, -1, 0] }] } };
    await pc(() => window.partcraft.exactReady());
    await pc((t) => window.partcraft.openText(t, 'AdaptiveCantilever.partcraft.json'), JSON.stringify(part));
    await built();
    await choose('simulation');
    await page.waitForSelector('[data-sim-adaptive]');
    ok(!(await page.isChecked('[data-sim-adaptive]')) && !(await page.$('[data-sim-adapt-target]')), 'a tetrahedral static study offers "Refine automatically (adaptive)", off by default');
    await page.click('[data-sim-adaptive]');
    await page.waitForSelector('[data-sim-adapt-target]');
    ok(await pc(() => { const a = window.partcraft.part.studies.simulation.adaptive; return a && a.target === 1 && a.passes === 5; }) && /an estimate, not a bound/.test(await page.textContent('[data-sim-adapt-note]')), 'on: target 1 %, at most 5 passes, and the note says the estimate is an estimate');
    await setNum('[data-sim-adapt-target]', 0.4);
    await setNum('[data-sim-adapt-passes]', 3);
    await page.waitForFunction(() => { const a = window.partcraft.part.studies.simulation.adaptive; return a.target === 0.4 && a.passes === 3; });
    await page.click('[data-sim-solve]');
    await page.waitForSelector('[data-sim-adapt-table]', { timeout: 240000 });
    const got = await page.evaluate(() => ({ rows: Number(document.querySelector('[data-sim-adapt-table]').dataset.simAdaptTable), stop: document.querySelector('[data-sim-adapt-stop]').dataset.simAdaptStop, msg: document.querySelector('[data-sim-adapt-stop]').textContent, errs: [...document.querySelectorAll('[data-sim-adapt-err]')].map((e) => Number(e.dataset.simAdaptErr)), d: Number(document.querySelector('[data-sim-max-disp]').dataset.simMaxDisp), chart: !!document.querySelector('[data-sim-adapt-chart]'), exact: document.querySelector('[data-sim-exact-faces]')?.dataset.simExactFaces }));
    const ref = await nodeRef();
    ok(got.rows === ref.adaptive.passes.length && got.rows >= 2 && got.stop === ref.adaptive.stop && near(got.d, ref.maxDisp.value, 1e-6), `solved in the worker: ${got.rows} passes, stop "${got.stop}" — the same as tetSolve in Node (${ref.adaptive.passes.length} passes, max displacement ${ref.maxDisp.value.toFixed(6)} = the panel's ${got.d.toFixed(6)} mm)`);
    ok(got.errs.length === got.rows && got.errs.every((e, i) => !i || e < got.errs[i - 1]) && got.chart && got.msg.length > 20, `the convergence table (estimated error ${got.errs.map((e) => e.toFixed(3)).join(' → ')} %), the chart, and the stop message: "${got.msg}"`);
    ok(got.exact === '6', 'the mesh report: all 6 faces on their exact surfaces');
    await page.locator('[data-sim-adapt-chart]').scrollIntoViewIfNeeded();
    await shot('tet-adaptive');
    const back = await pc(() => window.partcraft.host.P.readPart(window.partcraft.host.P.toJSON(window.partcraft.part)).studies.simulation.adaptive);
    ok(back && back.target === 0.4 && back.passes === 3, 'the settings are saved with the study and read back');
    await page.click('[data-sim-adaptive]');
    await page.waitForFunction(() => window.partcraft.part.studies.simulation.adaptive === undefined);
    ok(!(await page.$('[data-sim-adapt-target]')), 'off again: the block leaves the study');
  }

  console.log('\n== adaptive: a modal study refined automatically (0.4 P5)');
  {
    const part = await cantileverPart(), rg = B.regenerateBrep(part, oc);
    part.studies = { simulation: { ...SIM.newSimStudy(), kind: 'modal', modes: 2, material: 'steel', h: 5, seq: 1, constraints: [{ id: 'c1', type: 'fixed', faces: [B.faceRef(planeOf(rg, [-1, 0, 0]))] }], loads: [] } };
    await pc((t) => window.partcraft.openText(t, 'AdaptiveModal.partcraft.json'), JSON.stringify(part));
    await built();
    await choose('simulation');
    await page.waitForSelector('[data-sim-adaptive]');
    ok(/frequencies/.test(await page.evaluate(() => { document.querySelector('[data-sim-adaptive]').click(); return new Promise((r) => setTimeout(() => r(document.querySelector('[data-sim-adapt-note]')?.textContent || ''), 120)); })), 'a tetrahedral modal study offers "Refine automatically", with its own note');
    await setNum('[data-sim-adapt-target]', 0.5);
    await setNum('[data-sim-adapt-passes]', 3);
    await page.click('[data-sim-solve]');
    await page.waitForSelector('[data-sim-adapt-table]', { timeout: 240000 });
    const got = await page.evaluate(() => ({ rows: Number(document.querySelector('[data-sim-adapt-table]').dataset.simAdaptTable), f: [...document.querySelectorAll('[data-sim-adapt-val]')].map((e) => Number(e.dataset.simAdaptVal)), head: [...document.querySelectorAll('[data-sim-adapt-table] th')].map((t) => t.textContent), f1: Number(document.querySelector('[data-sim-f1]').dataset.simF1), chart: !!document.querySelector('[data-sim-adapt-chart]') }));
    const ref = await nodeRef();
    ok(got.rows === ref.adaptive.passes.length && got.rows >= 2 && got.f.every((v, i) => Math.abs(v / ref.adaptive.passes[i].freqs[0] - 1) < 1e-9) && near(got.f1, ref.freqs[0], 1e-9), `solved in the worker: ${got.rows} passes, f₁ ${got.f.map((v) => v.toFixed(2)).join(' → ')} Hz — the same as tetSolve in Node; the mode list shows the last pass`);
    ok(got.head.includes('Mode 1, Hz') && got.head.includes('Mode 2, Hz') && got.f.every((v, i) => !i || v <= got.f[i - 1] * (1 + 1e-9)) && got.chart, `the table follows modes 1 and 2 (${got.head.join(', ')}), f₁ never rises (flat faces), the chart is drawn`);
    await page.locator('[data-sim-adapt-chart]').scrollIntoViewIfNeeded();
    await shot('tet-adaptive-modal');
  }

  console.log('\n== exact surfaces: a pressurised thick sphere');
  {
    const a = 10, b = 20, part = P.newPart('ThickSphere'), sk = S.newSketch();
    S.addLine(sk, [0, -30], [0, 40], { construction: true });
    const l1 = S.addLine(sk, [a, 0], [b, 0]), ar = S.addArc(sk, [0, 0], l1.p2, [0, b]), l2 = S.addLine(sk, ar.e, [0, a]); S.addArc(sk, [0, 0], l1.p1, l2.p2);
    const f1 = P.addFeature(part, 'sketch', { sketch: sk }); P.addFeature(part, 'revolve', { sketch: f1.id, op: 'add', angle: 90 });
    const rg = B.regenerateBrep(part, oc), bore = rg.faces.find((f) => f.surf && f.surf.type === 'sphere' && Math.abs(f.surf.r - a) < 1e-9);
    part.studies = { simulation: { ...SIM.newSimStudy(), material: 'steel', h: 6, seq: 2, constraints: [{ id: 'c1', type: 'frictionless', faces: rg.faces.filter((f) => f.type === 'plane').map(B.faceRef) }], loads: [{ id: 'l2', type: 'pressure', faces: [B.faceRef(bore)], p: 10 }] } };
    await pc((t) => window.partcraft.openText(t, 'ThickSphere.partcraft.json'), JSON.stringify(part));
    await built();
    ok(await pc(() => window.partcraft.regen.faces.filter((f) => f.surf && f.surf.type === 'sphere').length === 2), 'the regen in the page carries both spheres\' exact surfaces');
    await choose('simulation');
    await page.click('[data-sim-solve]');
    await page.waitForSelector('[data-sim-exact-faces]', { timeout: 240000 });
    const got = await page.evaluate(() => ({ exact: Number(document.querySelector('[data-sim-exact-faces]').dataset.simExactFaces), tess: Number(document.querySelector('[data-sim-exact-faces]').dataset.simTessFaces), d: Number(document.querySelector('[data-sim-max-disp]').dataset.simMaxDisp) }));
    const ref = await nodeRef();
    ok(got.exact === 5 && got.tess === 0 && near(got.d, ref.maxDisp.value, 1e-6), `solved in the worker with all ${got.exact} faces exact (none on the tessellation); max displacement ${got.d.toExponential(5)} mm = tetSolve in Node`);
    await shot('tet-exact-sphere');
  }
  await choose('design');
  ok(h.problems.length === 0, 'adaptive / exact surfaces: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
