#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-thermal.mjs — thermal, thermal stress and buckling in the Simulation workspace, headless Chromium: a 100 × 10 × 10 steel
 * bar set up by clicks (Thermal type, two fixed temperatures picked on the end faces), solved in the compute worker: min/max
 * temperature, heat in = kAΔT/L, the balance closed, equal to thermal.js in Node on the same exact-kernel mesh; the temperature
 * plot, legend and probe; a transient run and its time slider; a buckling study (Fixed + Force by clicks) whose load factor equals
 * buckling.js in Node and π²EI/(2L)² within 2 %, its mode shape deformed; a static study with a uniform thermal load; the study saved
 * and read back; no console errors.
 *   node tools/partcraft-test/browser-thermal.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
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
  const num = (sel, key) => page.evaluate(([s, k]) => Number(document.querySelector(s).dataset[k]), [sel, key]);
  /** Add a heat item of this type and click the face with outward normal n. */
  const addHeat = async (type, n, view) => {
    await page.selectOption('[data-sim-add-type]', type);
    await page.click('[data-sim-add]');
    await viewAs(view);
    const p = await facePoint(n);
    await page.mouse.click(p.x, p.y);
    await page.waitForFunction((c) => { const h = window.partcraft.part.studies.simulation.heat || []; return h.length === c && h[c - 1].faces.length === 1; }, (await pc(() => (window.partcraft.part.studies.simulation.heat || []).length)));
    await page.keyboard.press('Escape');
    return p;
  };

  console.log('\n== thermal: a bar between two temperatures, by clicks');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Bar.partcraft.json'), JSON.stringify(await cantileverPart()));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-mesher]', 'voxel');   // this file checks the voxel mesh (new studies default to tets: browser-tet.mjs)
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.mesher === 'voxel');
  await page.selectOption('[data-sim-kind]', 'thermal');
  await page.selectOption('[data-sim-material]', 'steel');
  await setNum('[data-sim-size]', 2.5);
  await page.waitForFunction(() => { const s = window.partcraft.part.studies.simulation; return s.kind === 'thermal' && s.h === 2.5 && s.material === 'steel'; });
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-sim-add-type] option')].map((o) => o.value));
  ok(opts.join() === 'temperature,flux,power,convection,radiation' && await page.isVisible('[data-sim-gen]') && await page.isVisible('[data-sim-transient]'), `Thermal type: the Add list offers ${opts.join(', ')}; heat generation and transient in the panel`);
  ok(/Add a thermal condition/.test(await page.textContent('body')) && await page.isDisabled('[data-sim-solve]'), 'with no conditions the panel says what is missing and Solve is off');
  await addHeat('temperature', [-1, 0, 0], 'left');
  await setNum('[data-sim-heat-t]', 100);
  await addHeat('temperature', [1, 0, 0], 'right');
  await setNum('[data-sim-heat-t]', 0);
  await page.waitForFunction(() => { const h = window.partcraft.part.studies.simulation.heat; return h.length === 2 && h[0].T === 100 && h[1].T === 0; });
  ok(true, 'two fixed temperatures picked on the end faces, 100 °C and 0 °C typed in the panel');
  await viewAs('iso');
  const tint = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-markers'); let n = 0; o?.traverse((x) => { if (x.isMesh && x.geometry.type === 'BufferGeometry') n++; }); return n; });
  ok(tint >= 2, `the picked faces are tinted in the view (${tint} tinted faces)`);
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-max-t]', { timeout: 120000 });
  const got = await page.evaluate(() => { const d = (s, k) => Number(document.querySelector(s).dataset[k]); return { hi: d('[data-sim-max-t]', 'simMaxT'), lo: d('[data-sim-min-t]', 'simMinT'), qin: d('[data-sim-heat-in]', 'simHeatIn'), qout: d('[data-sim-heat-out]', 'simHeatOut'), imb: d('[data-sim-imbalance]', 'simImbalance') }; });
  const Q = 51.9e-3 * 100 * 100 / 100;
  ok(near(got.hi, 100, 1e-9) && Math.abs(got.lo) < 1e-9 && near(got.qin, Q, 1e-8) && near(got.qout, Q, 1e-8) && Math.abs(got.imb) < 1e-8, `solved in the worker: 0 to 100 °C, heat in ${got.qin.toFixed(6)} W = out ${got.qout.toFixed(6)} W = kAΔT/L ${Q.toFixed(4)} (imbalance ${got.imb.toExponential(1)} W)`);
  // the same study in Node
  const TW = await import(DEV + 'thermal-worker.js'), SIM = await import(DEV + 'sim.js'), B = await import(DEV + 'brep.js'), P = await import(DEV + 'part.js'), BK = await import(DEV + 'buckling.js');
  await import(DEV + 'ws-simulation.js');
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  const saved = () => pc(() => window.partcraft.host.P.toJSON(window.partcraft.part)).then((t) => P.readPart(t));
  let part = await saved();
  const rg = B.regenerateBrep(part, oc);
  const ref = TW.thermalSolve(SIM.simJob(part.studies.simulation, rg).job);
  ok(near(ref.balance.inflow, got.qin, 1e-9) && near(ref.maxT.value, got.hi, 1e-12), `= thermal.js in Node on the same exact mesh (heat in ${ref.balance.inflow.toFixed(9)} W)`);
  const col = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-plot'); return o && o.geometry.getAttribute('color') ? o.geometry.index.count / 3 : 0; });
  const tick = await page.evaluate(() => [...document.querySelectorAll('[data-sim-legend] .pc-sim-ticks span')].map((s) => Number(s.textContent)));
  ok(col > 1000 && tick[0] === 0 && tick[4] === 100 && /Temperature/.test(await page.textContent('[data-sim-legend]')), `the temperature plot colours the part (${col} triangles), legend 0 … 100 °C`);
  const top = await facePoint([0, 1, 0]);
  await page.mouse.move(top.x, top.y);
  await page.waitForFunction(() => /Temperature .* °C, heat flux .* W\/m²/.test(document.querySelector('[data-sim-probe]').textContent));
  ok(true, 'hovering reads the temperature and heat flux: ' + (await page.textContent('[data-sim-probe]')));
  await page.selectOption('[data-sim-plot]', 'flux');
  const ft = await page.evaluate(() => [...document.querySelectorAll('[data-sim-legend] .pc-sim-ticks span')].map((s) => Number(s.textContent)));
  ok(near(ft[4], Q / 100 * 1e6, 1e-3), `heat flux plot: the legend tops at kΔT/L = ${(Q / 100 * 1e6).toFixed(0)} W/m² (${ft[4]})`);
  await shot('thermal-steady');

  console.log('\n== thermal: transient and the time slider');
  await page.click('[data-sim-transient]');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.thermal?.transient === true);
  await setNum('[data-sim-t0]', 0);
  await setNum('[data-sim-time]', 20);
  await setNum('[data-sim-steps]', 10);
  await page.waitForFunction(() => { const t = window.partcraft.part.studies.simulation.thermal; return t.T0 === 0 && t.t === 20 && t.steps === 10; });
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-time-slider]', { timeout: 120000 });
  const label = () => page.textContent('[data-sim-time-label]');
  const colorsSum = () => pc(() => { const c = window.partcraft.view.overlays.get('simulation-plot').geometry.getAttribute('color').array; let s = 0; for (let i = 0; i < c.length; i += 3) s += c[i]; return s; });
  const endLabel = await label(), cEnd = await colorsSum();
  await page.fill('[data-sim-time-slider]', '3');
  await page.waitForFunction(() => /^6 s$/.test(document.querySelector('[data-sim-time-label]').textContent));
  const cMid = await colorsSum();
  ok(endLabel === '20 s' && cMid !== cEnd, `transient: 11 frames; the slider moves from ${endLabel} to ${await label()} and the colours change with it`);
  await shot('thermal-transient');
  await page.click('[data-sim-transient]');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.thermal?.transient === false);

  console.log('\n== buckling and a thermal load');
  await page.selectOption('[data-sim-kind]', 'buckling');
  await viewAs('left');
  await tool('simulation-fixed');
  const l = await facePoint([-1, 0, 0]);
  await page.mouse.click(l.x, l.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('right');
  await tool('simulation-force');
  const r = await facePoint([1, 0, 0]);
  await page.mouse.click(r.x, r.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await setNum('[data-sim-force]', 1000);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0].total === 1000);
  await viewAs('iso');
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-lambda1]', { timeout: 180000 });
  const lam = await num('[data-sim-lambda1]', 'simLambda1');
  part = await saved();
  const bref = BK.solveBuckling(SIM.simJob(part.studies.simulation, rg).job);
  const Pcr = Math.PI ** 2 * 200000 * (1e4 / 12) / 200 ** 2;
  ok(near(lam, bref.factors[0], 1e-6) && near(lam * 1000, Pcr, 0.02), `buckling by clicks (Fixed + 1000 N on the far end): load factor ${lam.toFixed(4)} = buckling.js in Node (${bref.factors[0].toFixed(4)}); ×1000 N = ${(lam * 1000).toFixed(0)} N vs π²EI/(2L)² ${Pcr.toFixed(0)} (${((lam * 1000 / Pcr - 1) * 100).toFixed(2)} %, a stubby L/r 35)`);
  ok(await pc(() => window.partcraft.view.overlays.get('simulation-plot')?.userData.simPlot === 'deformed' && !window.partcraft.view.partVisible) && /overestimates/.test(await page.textContent('[data-sim-results]')) && (await page.getAttribute('[data-sim-eig-converged]', 'data-sim-eig-converged')) === 'true', 'the first mode shape is drawn deformed; the panel says linear buckling overestimates real buckling loads');
  await shot('buckling');
  await page.selectOption('[data-sim-kind]', 'static');
  await page.selectOption('[data-sim-thermal-load]', 'uniform');
  await setNum('[data-sim-dt]', 50);
  await page.waitForFunction(() => { const t = window.partcraft.part.studies.simulation.thermalLoad; return t && t.mode === 'uniform' && t.dT === 50; });
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-thermal-dt]', { timeout: 120000 });
  ok(await num('[data-sim-thermal-dt]', 'simThermalDt') === 50 && await page.isVisible('[data-sim-max-vm]'), 'a static study with a uniform 50 K rise: solved, the thermal load listed with the stresses');
  const back = await pc(() => { const t = window.partcraft.host.P.toJSON(window.partcraft.part); const p = window.partcraft.host.P.readPart(t); return { v: JSON.parse(t).version, s: p.studies.simulation }; });
  ok(back.v === 3 && back.s.heat.length === 2 && back.s.thermal.steps === 10 && back.s.thermalLoad.dT === 50 && back.s.kind === 'static', 'the study (heat conditions, transient settings, thermal load) is saved in the part file and reads back');
  await choose('design');
  ok(await pc(() => window.partcraft.view.partVisible && !window.partcraft.view.overlays.size), 'back in Design: plain part, no overlays');
  ok(h.problems.length === 0, 'thermal: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
