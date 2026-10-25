#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-flow-turb.mjs — the experimental turbulent flow model in the browser (flow-ui.js, flow-turb.js): the Flow model
 * select offers it, the standing warning (with the failed checks' figures) shows in the panel, the results and the table, the
 * run-time line shows, and a small turbulent pipe study runs in the worker with the y⁺ readout, without console errors.
 *   node tools/partcraft-test/browser-flow-turb.mjs   (shares the test admin and state file; one sign-in at most)
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
  const { page, ok, pc, built } = h;
  const { facePoint, viewAs, choose, setNum } = helpers(h);
  const FS = await import(DEV + 'flow-study.js');
  console.log('\n== flow, turbulent (experimental): the option and its warning');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'Pipe.partcraft.json'), JSON.stringify(await pipePart()));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-kind]', 'flow');
  await page.waitForSelector('[data-flow-model]');
  const opts = await page.$$eval('[data-flow-model] option', (o) => o.map((x) => [x.value, x.textContent]));
  ok(opts.length === 2 && opts[0][0] === 'laminar' && opts[1][0] === 'sa' && /experimental/i.test(opts[1][1]) && (await page.inputValue('[data-flow-model]')) === 'laminar', `Flow model offers ${opts.map((o) => o[1]).join(' | ')}; laminar is the default`);
  ok(!(await page.$('[data-flow-turb-warning]')), 'a laminar study shows no turbulence warning');
  await page.selectOption('[data-flow-model]', 'sa');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.model === 'sa');
  const warn = await page.textContent('[data-flow-turb-warning="panel"]');
  ok(warn === FS.TURB_WARNING && /30 to 34 %/.test(warn) && /21 to 39 %/.test(warn) && /friction \+3 to \+5 %/.test(warn) && /bulk velocity −1 %/.test(warn) && /qualitative/.test(warn) && await page.isVisible('[data-flow-turb-warning="panel"]'), 'Turbulent: the panel shows the standing warning with the figures (channels +3…+5 %, pipe +30…+34 %, step −21…−39 %)');
  ok(!(await page.$('[data-flow-turb-warning] button')), 'the warning has no close button (it cannot be dismissed)');
  const rt = Number(await page.getAttribute('[data-flow-runtime]', 'data-flow-runtime'));
  ok(rt > 0 && rt < 600 && /laptop/.test(await page.textContent('[data-flow-runtime]')), `the run-time line for the automatic grid: at most about ${rt} s`);
  await viewAs('back');
  await page.selectOption('[data-flow-add-role]', 'inlet');
  await page.click('[data-flow-add]');
  await page.waitForSelector('[data-flow-pick][aria-pressed="true"]');
  const back = await facePoint([0, 0, -1]);
  await page.mouse.click(back.x, back.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.openings[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await setNum('[data-flow-value]', 2);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.openings[0].value === 2);
  await viewAs('front');
  await page.selectOption('[data-flow-add-role]', 'outlet');
  await page.click('[data-flow-add]');
  const front = await facePoint([0, 0, 1]);
  await page.mouse.click(front.x, front.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.flow.openings[1]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await viewAs('iso');

  console.log('\n== flow, turbulent: a small run');
  const t0 = Date.now();
  await page.click('[data-flow-solve]');
  await page.waitForSelector('[data-flow-yplus]', { timeout: 300000 });
  const res = await page.evaluate(() => ({ model: document.querySelector('[data-flow-model-used]')?.dataset.flowModelUsed, y: document.querySelector('[data-flow-yplus]').dataset.flowYplus.split(',').map(Number), out: document.querySelector('[data-flow-yplus]').dataset.flowYplusOut, conv: document.querySelector('[data-flow-conv]')?.dataset.flowConv, dp: Number(document.querySelector('[data-flow-dp]').dataset.flowDp), bal: Number(document.querySelector('[data-flow-balance]').dataset.flowBalance) }));
  ok(res.model === 'sa' && res.conv === '1' && res.dp > 0 && Math.abs(res.bal) < 1e-3, `water at 2 m/s (Re ≈ 20,000) (automatic cells) solved turbulent in the worker in ${((Date.now() - t0) / 1000).toFixed(1)} s: Δp ${res.dp.toFixed(1)} Pa, ${res.conv === "1" ? "converged" : "NOT converged"} (model ${res.model}), mass balance ${(100 * res.bal).toExponential(1)} %`);
  ok(res.y.length === 3 && res.y[0] > 0 && res.y[0] <= res.y[1] && res.y[1] <= res.y[2], `first-cell y⁺ readout: min ${res.y[0].toFixed(1)}, mean ${res.y[1].toFixed(1)}, max ${res.y[2].toFixed(1)}${res.out === '1' ? ' (some outside the checked range: flagged)' : ''}`);
  ok(await page.isVisible('[data-flow-turb-warning="results"]') && (await page.textContent('[data-flow-turb-warning="results"]')) === FS.TURB_WARNING && (await page.textContent('[data-flow-turb-warning="table"]')) === FS.TURB_WARNING, 'the results block and the table carry the same warning');
  await page.selectOption('[data-flow-show]', 'nut');
  ok(await page.evaluate(() => !!window.partcraft.view.overlays.get('simulation-flow-plane')), 'the cut plane shows the eddy viscosity ratio');
  await page.selectOption('[data-sim-kind]', 'static');
  await choose('design');
  ok(h.problems.length === 0, 'turbulent flow: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
