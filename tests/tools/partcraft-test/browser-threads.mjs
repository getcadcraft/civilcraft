#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-threads.mjs — round 5 (builder C) in headless Chromium: /lab/partcraft is cross-origin isolated (COOP same-origin +
 * COEP require-corp on the lab dev page only; /try is not) and nothing breaks under it (fonts, images, the exact kernel's
 * WebAssembly, help, a download, no console errors); Settings › PartCraft "Solver threads"; a voxel static study big enough to
 * thread solved with the automatic count ("N threads" in the solver details) and again with 1 thread (same answer); a static
 * study with temperatures over time (a transient run): the stress history, the worst time, the time slider and the peak chart,
 * equal to thermal-worker.js in Node on the same exact mesh.
 *   node tools/partcraft-test/browser-threads.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, tool, shot, BASE } = h;
  const { facePoint, viewAs, choose, setNum } = helpers(h);
  const near = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);
  const data = (sel, key) => page.evaluate(([s, k]) => document.querySelector(s)?.dataset[k] ?? null, [sel, key]);

  console.log('\n== threads: cross-origin isolation on the lab page only');
  const res = await page.request.get(BASE + '/lab/partcraft');
  const hd = res.headers();
  ok(hd['cross-origin-opener-policy'] === 'same-origin' && hd['cross-origin-embedder-policy'] === 'require-corp', `/lab/partcraft sends COOP ${hd['cross-origin-opener-policy']} and COEP ${hd['cross-origin-embedder-policy']}`);
  const tryH = (await page.request.get(BASE + '/use/partcraft')).headers();
  ok(!tryH['cross-origin-opener-policy'] && !tryH['cross-origin-embedder-policy'], '/use/partcraft (the release) sends neither');
  const iso = await pc(() => ({ coi: window.crossOriginIsolated, sab: typeof SharedArrayBuffer, hc: navigator.hardwareConcurrency }));
  ok(iso.coi === true && iso.sab === 'function', `the page is cross-origin isolated (crossOriginIsolated ${iso.coi}, SharedArrayBuffer available; ${iso.hc} logical processors)`);
  const assets = await pc(async () => {
    await document.fonts.ready;
    const imgs = [...document.images].filter((i) => i.offsetParent !== null || i.complete);
    return { fonts: document.fonts.status, faces: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')), imgs: imgs.length, broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src), exact: window.partcraft.useExact };
  });
  ok(assets.fonts === 'loaded' && assets.faces.length > 0 && !assets.broken.length && assets.exact === true, `under COEP: fonts load (${[...new Set(assets.faces)].join(', ')}), ${assets.imgs} images and none broken, the exact kernel (OpenCascade WebAssembly in its blob: worker) is up`);
  await page.click('[data-help-open]');
  await page.waitForFunction(() => { const p = document.querySelector('[data-help-panel]'); return p && !p.hidden && p.textContent.length > 200; }, null, { timeout: 15000 });
  ok(true, 'the help panel opens and loads its topics');
  await page.keyboard.press('Escape');
  await page.click('[data-help-open]').catch(() => {});
  await page.evaluate(() => { const p = document.querySelector('[data-help-panel]'); if (p && !p.hidden) document.querySelector('[data-help-open]').click(); });

  console.log('\n== threads: Settings › PartCraft, Solver threads');
  await page.click('[data-settings-open]');
  await page.waitForFunction(() => document.querySelector('[data-app-settings]')?.open);
  const set = await page.evaluate(() => { const s = document.querySelector('select[name="pcThreads"]'); return { opts: [...s.options].map((o) => o.textContent), val: s.value, state: document.querySelector('[data-pc-threads-state]').textContent }; });
  ok(set.val === 'auto' && /^Automatic \(\d+\)$/.test(set.opts[0]) && /can run solvers on several threads/.test(set.state), `Solver threads: ${set.opts[0]} by default (${set.opts.length} choices); "${set.state}"`);
  await page.keyboard.press('Escape');
  const autoN = Number(set.opts[0].match(/\d+/)[0]);

  console.log('\n== threads: a voxel static study solved on several threads, then on one');
  await pc((t) => window.partcraft.openText(t, 'Cantilever.partcraft.json'), JSON.stringify(await cantileverPart()));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-mesher]', 'voxel');
  await page.selectOption('[data-sim-material]', 'steel');
  await setNum('[data-sim-size]', 1);
  await page.waitForFunction(() => { const s = window.partcraft.part.studies.simulation; return s.mesher === 'voxel' && s.h === 1 && s.material === 'steel'; });
  await viewAs('left'); await tool('simulation-fixed');
  const l = await facePoint([-1, 0, 0]); await page.mouse.click(l.x, l.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('right'); await tool('simulation-force');
  const r = await facePoint([1, 0, 0]); await page.mouse.click(r.x, r.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('iso');
  const solve = async () => { await page.click('[data-sim-solve]'); await page.waitForFunction(() => !document.querySelector('[data-sim-progress]') && document.querySelector('[data-sim-max-vm]'), null, { timeout: 240000 }); };
  await solve();
  const vmA = Number(await data('[data-sim-max-vm]', 'simMaxVm')), thA = Number(await data('[data-sim-threads]', 'simThreads'));
  const rowA = await page.evaluate(() => [...document.querySelectorAll('[data-sim-table] dt')].find((d) => d.textContent === 'Solver').nextElementSibling.textContent);
  ok(thA === autoN && thA > 1 && new RegExp(`, ${autoN} threads$`).test(rowA), `10 000 cubes (36 663 unknowns): solved on ${thA} threads — solver details "${rowA}"`);
  await page.evaluate(() => { const s = document.querySelector('select[name="pcThreads"]'); s.value = '1'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  ok(await pc(() => JSON.parse(localStorage.getItem('partcraft.settings')).threads === 1), 'Settings › Solver threads 1: stored with the other PartCraft settings');
  await solve();
  const vm1 = Number(await data('[data-sim-max-vm]', 'simMaxVm')), row1 = await page.evaluate(() => [...document.querySelectorAll('[data-sim-table] dt')].find((d) => d.textContent === 'Solver').nextElementSibling.textContent);
  ok(near(vm1, vmA, 1e-9) && /1 thread \(chosen in Settings\)$/.test(row1), `the same study on 1 thread: max von Mises ${vm1} vs ${vmA} MPa (${Math.abs(vm1 / vmA - 1).toExponential(1)}); "${row1}"`);
  await page.evaluate(() => { const s = document.querySelector('select[name="pcThreads"]'); s.value = 'auto'; s.dispatchEvent(new Event('change', { bubbles: true })); });

  console.log('\n== thermal stress over time: the stress history of a transient run');
  await setNum('[data-sim-size]', 2.5);
  await page.selectOption('[data-sim-thermal-load]', 'transient');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.thermalLoad?.mode === 'transient' && document.querySelector('[data-sim-stress-at]'));
  ok(await page.isVisible('[data-sim-t0]') && await page.isVisible('[data-sim-solves]') && await page.isVisible('[data-sim-tref]'), 'Thermal load "Temperatures over time": start temperature, span, steps, scheme, stress-free temperature, "Stress at" (worst time) and the number of stress solves');
  await page.selectOption('[data-sim-add-type]', 'temperature');
  await page.click('[data-sim-add]');
  await viewAs('right');
  const rr = await facePoint([1, 0, 0]); await page.mouse.click(rr.x, rr.y);
  await page.waitForFunction(() => (window.partcraft.part.studies.simulation.heat || [])[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await setNum('[data-sim-heat-t]', 200);
  await setNum('[data-sim-t0]', 25); await setNum('[data-sim-time]', 90); await setNum('[data-sim-steps]', 45); await setNum('[data-sim-solves]', 7);
  await page.waitForFunction(() => { const s = window.partcraft.part.studies.simulation; return s.heat?.[0]?.T === 200 && s.thermal?.T0 === 25 && s.thermal?.t === 90 && s.thermal?.steps === 45 && s.thermalLoad?.solves === 7; });
  await viewAs('iso');
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-time-slider]', { timeout: 240000 });
  const worst = Number(await data('[data-sim-worst-time]', 'simWorstTime')), vmW = Number(await data('[data-sim-max-vm]', 'simMaxVm'));
  const lab0 = await page.textContent('[data-sim-time-label]');
  const chart = await pc(() => { const c = document.querySelector('[data-sim-history]'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n; });
  ok(Number.isFinite(worst) && /\(worst\)$/.test(lab0) && chart > 200, `solved over time: worst ${worst} s at ${vmW.toFixed(2)} MPa; the slider starts there ("${lab0}"); the peak-stress chart is drawn (${chart} pixels)`);
  // the same study in Node
  const TW = await import(DEV + 'thermal-worker.js'), SIM = await import(DEV + 'sim.js'), B = await import(DEV + 'brep.js'), P = await import(DEV + 'part.js');
  await import(DEV + 'ws-simulation.js');
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  const part = P.readPart(await pc(() => window.partcraft.host.P.toJSON(window.partcraft.part)));
  const ref = TW.thermoHistorySolve(SIM.simJob(part.studies.simulation, B.regenerateBrep(part, oc)).job);
  ok(near(ref.maxVm.value, vmW, 1e-9) && near(ref.history.times[ref.history.worst], worst, 1e-12) && ref.frames.length === 7, `= thermal-worker.js thermoHistorySolve in Node on the same exact mesh (${ref.maxVm.value.toFixed(6)} MPa at ${ref.history.times[ref.history.worst]} s, 7 stress solves)`);
  const colorsSum = () => pc(() => { const c = window.partcraft.view.overlays.get('simulation-plot').geometry.getAttribute('color').array; let s = 0; for (let i = 0; i < c.length; i += 3) s += c[i]; return s; });
  const c0 = await colorsSum();
  const other = ref.history.worst === 0 ? 6 : 0;
  await page.fill('[data-sim-time-slider]', String(other));
  await page.waitForFunction((t) => document.querySelector('[data-sim-time-label]').textContent.startsWith(t), `${ref.history.times[other]} s`);
  const c1 = await colorsSum();
  ok(c1 !== c0 && (await page.textContent('[data-sim-time-label]')).includes(`peak ${Number(ref.history.maxVm[other].toPrecision(4))}`), `the slider moves to ${await page.textContent('[data-sim-time-label]')}; the plot changes with it`);
  await shot('thermal-history');
  const back = await pc(() => { const t = window.partcraft.host.P.toJSON(window.partcraft.part); return window.partcraft.host.P.readPart(t).studies.simulation.thermalLoad; });
  ok(back.mode === 'transient' && back.solves === 7, 'the transient thermal load is saved in the part file and reads back');

  console.log('\n== threads: a laminar flow study on the solver threads');
  {
    const S = await import(DEV + 'sketch.js'), FS = await import(DEV + 'flow-study.js'), FW = await import(DEV + 'flow-worker.js');
    const pp = P.newPart('Pipe');
    const sk = S.newSketch(); S.addRect(sk, [-10, -10], [10, 10]); S.addCircle(sk, [0, 0], 5);
    const s1 = P.addFeature(pp, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    P.addFeature(pp, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: 40 });
    const rg0 = B.regenerateBrep(pp, oc), rim = (z) => rg0.faces.findIndex((f) => f.type === 'plane' && Math.abs(f.n[2] - Math.sign(z)) < 1e-9);
    const st = { ...SIM.newSimStudy(), kind: 'flow', flow: { ...FS.newFlow(), h: 0.5, seq: 2, openings: [
      { id: 'o1', role: 'inlet', faces: [B.faceRef(rg0.faces[rim(-1)])], spec: 'velocity', value: 0.001 },
      { id: 'o2', role: 'outlet', faces: [B.faceRef(rg0.faces[rim(1)])], p: 0 }] } };
    pp.studies = { simulation: st };
    await pc((t) => window.partcraft.openText(t, 'Pipe.partcraft.json'), P.toJSON(pp));
    await built(); await choose('simulation');
    await page.waitForFunction(() => window.partcraft.part.studies?.simulation?.kind === 'flow' && !!document.querySelector('[data-flow-solve]'));
    await page.click('[data-flow-solve]');
    await page.waitForSelector('[data-flow-dp]', { timeout: 600000 });
    const g = await page.evaluate(() => ({ dp: Number(document.querySelector('[data-flow-dp]').dataset.flowDp), cells: Number(document.querySelector('[data-flow-cells]').dataset.flowCells), thr: Number(document.querySelector('[data-flow-threads]').dataset.flowThreads), row: [...document.querySelectorAll('dt')].find((d) => d.textContent === 'Solver')?.nextElementSibling.textContent || '' }));
    const saved = P.readPart(await pc(() => window.partcraft.host.P.toJSON(window.partcraft.part)));
    const ref = FW.solveFlow(FS.flowJob(saved.studies.simulation, B.regenerateBrep(saved, oc)).job);
    ok(g.thr === autoN && g.cells === ref.mesh.fluid && g.cells >= 20000 && g.dp === ref.dp && new RegExp(`${autoN} threads`).test(g.row), `pipe at 0.5 mm cells (${g.cells} fluid cells): stepped on ${g.thr} threads in the worker; pressure drop ${g.dp} Pa bit-identical to flow-worker.js on one thread in Node (${ref.steps} steps)`);
    await choose('design');
  }

  console.log('\n== threads: a download under isolation');
  await choose('design');
  const [dl] = await Promise.all([page.waitForEvent('download'), (async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-stl"]'); })()]);
  const file = path.join(h.OUT, 'threads-cantilever.stl');
  await dl.saveAs(file);
  const stl = fs.readFileSync(file), ntri = stl.length >= 84 ? stl.readUInt32LE(80) : 0;
  ok(ntri >= 12 && stl.length === 84 + 50 * ntri, `STL export downloads under COEP (binary, ${ntri} triangles, ${stl.length} bytes)`);
  ok(h.problems.length === 0, 'threads: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
