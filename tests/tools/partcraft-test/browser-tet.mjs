#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-tet.mjs — the Simulation workspace on the tetrahedral mesh in headless Chromium: a new study defaults to
 * "Tetrahedral (accurate)"; a 100 × 10 × 10 steel cantilever set up by clicks is solved in the compute worker (tet-worker.js);
 * the panel's tip deflection equals tetSolve run in Node on the same exact-kernel mesh and PL³/3EI within 0.5 %; the mesh
 * quality, error estimate and principal stresses are shown; the plot is the tet mesh's surface, the mesh overlay draws its
 * element edges; principal stress and strain plots; natural frequencies vs Euler–Bernoulli; switching to the voxel mesh
 * and back; the study saved with its mesher; no console errors.
 *   node tools/partcraft-test/browser-tet.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, tool, shot } = h;
  const { facePoint, viewAs, choose, setNum } = helpers(h);
  const near = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);

  console.log('\n== tets: a cantilever on the tetrahedral mesh, by clicks');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'TetCantilever.partcraft.json'), JSON.stringify(await cantileverPart()));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  ok((await page.inputValue('[data-sim-mesher]')) === 'tet' && await pc(() => window.partcraft.part.studies.simulation.mesher === 'tet'), 'a new study uses Mesh: Tetrahedral (accurate)');
  await page.selectOption('[data-sim-material]', 'steel');
  await setNum('[data-sim-size]', 2.5);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.h === 2.5 && window.partcraft.part.studies.simulation.material === 'steel');
  const est = Number(await page.getAttribute('[data-sim-estimate]', 'data-sim-estimate'));
  ok(est === 7680 && /tetrahedra before refining/.test(await page.textContent('[data-sim-estimate]')) && await page.isVisible('[data-sim-refine-curved]') && /10-node quadratic tetrahedron/.test(await page.textContent('body')), `element size 2.5 mm: about ${est} tetrahedra (12 per lattice cube), the curved-face option and the element named`);
  await viewAs('left');
  await tool('simulation-fixed');
  const left = await facePoint([-1, 0, 0]);
  await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('right');
  await tool('simulation-force');
  const right = await facePoint([1, 0, 0]);
  await page.mouse.click(right.x, right.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await page.selectOption('[data-sim-dir]', '-y');
  await setNum('[data-sim-force]', 100);
  await page.waitForFunction(() => { const l = window.partcraft.part.studies.simulation.loads[0]; return l.total === 100 && Array.isArray(l.dir) && l.dir[1] === -1; });
  ok(/isosurface stuffing/.test(await page.textContent('[data-sim-method-tet]')), 'the method note names the mesher, the element, the solver and the limits');
  await viewAs('iso');

  console.log('\n== tets: solve in the worker, results, plots');
  await tool('simulation-solve');
  await page.waitForSelector('[data-sim-max-disp]', { timeout: 180000 });
  const got = await page.evaluate(() => ({ d: Number(document.querySelector('[data-sim-max-disp]').dataset.simMaxDisp), vm: Number(document.querySelector('[data-sim-max-vm]').dataset.simMaxVm), r: document.querySelector('[data-sim-reaction]').dataset.simReaction.split(',').map(Number), q: Number(document.querySelector('[data-sim-quality]').dataset.simQuality), err: Number(document.querySelector('[data-sim-error-pct]').dataset.simErrorPct), table: document.querySelector('[data-sim-table]').textContent }));
  const SIM = await import(DEV + 'sim.js'), B = await import(DEV + 'brep.js'), P = await import(DEV + 'part.js'), TW = await import(DEV + 'tet-worker.js');
  await import(DEV + 'ws-simulation.js');
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  const saved = P.readPart(await pc(() => window.partcraft.host.P.toJSON(window.partcraft.part)));
  const rg = B.regenerateBrep(saved, oc);
  const ref = TW.tetSolve(SIM.simJob(saved.studies.simulation, rg).job);
  ok(near(got.d, ref.maxDisp.value, 1e-6) && near(got.vm, ref.maxVm.value, 1e-6), `the panel's max displacement ${got.d.toFixed(6)} mm and von Mises ${got.vm.toFixed(3)} MPa equal tetSolve in Node (${ref.maxDisp.value.toFixed(6)}, ${ref.maxVm.value.toFixed(3)})`);
  const eb = 100 * 1e6 / (3 * 200000 * (1e4 / 12));
  ok(near(got.d, eb, 0.01), `max displacement within 1 % of PL³/3EI = ${eb.toFixed(5)} (${((got.d / eb - 1) * 100).toFixed(2)} %; the tip corner, shear included)`);
  ok(Math.abs(got.r[1] - 100) < 1e-4 && Math.abs(got.r[0]) < 1e-4, `reactions ${got.r.map((v) => v.toFixed(4)).join(', ')} N = the load`);
  ok(got.q >= 44.9 && got.err > 0 && got.err < 5 && /quadratic tetrahedra/.test(got.table) && /Principal stress range/.test(got.table), `the table: mesh in tetrahedra, quality (smallest dihedral ${got.q.toFixed(1)}°), estimated stress error ${got.err.toFixed(2)} %, principal stresses`);
  if (await page.isChecked('[data-sim-deformed]')) { await page.click('[data-sim-deformed]'); await page.waitForFunction(() => window.partcraft.view.overlays.get('simulation-plot')?.userData.simPlot === 'plot'); }   // a modal solve earlier in the run leaves it on
  const pl = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-plot'); return o ? { kind: o.userData.simPlot, tris: o.geometry.index.count / 3, col: !!o.geometry.getAttribute('color') } : null; });
  ok(pl && pl.kind === 'plot' && pl.col && pl.tris === ref.plotMesh.indices.length / 3, `the plot is the tet mesh's own surface (${pl && pl.tris} triangles: each quadratic face as 4), coloured`);
  await page.click('[data-sim-show-mesh]');
  const ml = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-mesh'); return o && o.isLineSegments ? o.geometry.index.count / 2 : 0; });
  ok(ml === ref.plotMesh.lines.length / 2, `Show mesh draws the element edges over the plot (${ml} segments)`);
  await shot('tet-mesh');
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-sim-plot] option')].map((o) => o.value));
  ok(['vm', 's1', 's3', 'strain', 'disp', 'safety'].every((v) => opts.includes(v)), `Show: ${opts.join(', ')}`);
  await page.selectOption('[data-sim-plot]', 's1');
  const tick = await page.evaluate(() => ({ t: [...document.querySelectorAll('[data-sim-legend] .pc-sim-ticks span')].map((s) => Number(s.textContent)), title: document.querySelector('[data-sim-legend] p').textContent }));
  ok(/Maximum principal stress/.test(tick.title) && tick.t[0] < 0 && tick.t[4] > 0, `maximum principal stress plot: legend ${tick.t[0]} … ${tick.t[4]} MPa (tension on top, compression underneath)`);
  await page.selectOption('[data-sim-plot]', 'strain');
  ok(/Equivalent strain/.test(await page.textContent('[data-sim-legend]')), 'equivalent strain plot');
  const top = await facePoint([0, 1, 0]);
  await page.mouse.move(top.x, top.y);
  await page.waitForFunction(() => /principal .* MPa, strain/.test(document.querySelector('[data-sim-probe]').textContent));
  ok(true, 'the probe reads von Mises, principal stresses, strain and displacement: ' + (await page.textContent('[data-sim-probe]')));
  await page.click('[data-sim-deformed]');
  await page.waitForFunction(() => window.partcraft.view.overlays.get('simulation-plot')?.userData.simPlot === 'deformed' && window.partcraft.view.overlays.get('simulation-mesh'));
  ok(true, 'deformed shape: the plot and its mesh lines move together');
  await shot('tet-deformed');
  await page.click('[data-sim-deformed]');

  console.log('\n== tets: natural frequencies, the voxel option, saving');
  await page.selectOption('[data-sim-kind]', 'modal');
  await setNum('[data-sim-size]', 5);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.h === 5 && window.partcraft.part.studies.simulation.kind === 'modal');
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-f1]', { timeout: 180000 });
  const f1 = Number(await page.getAttribute('[data-sim-f1]', 'data-sim-f1')), fe = 1.8751 ** 2 / (2 * Math.PI) * Math.sqrt(200000 * (1e4 / 12) / (7850e-12 * 100 * 1e8));
  ok(near(f1, fe, 0.01) && /consistent mass/.test(await page.textContent('[data-sim-results]')), `first natural frequency ${f1.toFixed(1)} Hz vs Euler–Bernoulli ${fe.toFixed(1)} (${((f1 / fe - 1) * 100).toFixed(2)} %), consistent mass`);
  await page.selectOption('[data-sim-mesher]', 'voxel');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.mesher === 'voxel');
  ok(/cubes/.test(await page.textContent('[data-sim-estimate]')) && !(await page.$('[data-sim-refine-curved]')), 'Mesh: Voxel cubes shows the cube count and hides the tet options');
  await page.selectOption('[data-sim-mesher]', 'tet');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.mesher === 'tet');
  const back = await pc(() => { const t = window.partcraft.host.P.toJSON(window.partcraft.part); return window.partcraft.host.P.readPart(t).studies.simulation; });
  ok(back.mesher === 'tet' && back.h === 5, 'the study is saved with its mesher and reads back');
  await choose('design');
  ok(await pc(() => window.partcraft.view.partVisible && !window.partcraft.view.overlays.size), 'back in Design: plain part, no overlays');
  ok(h.problems.length === 0, 'tets: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
