#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-live.mjs — 0.8 round 3, EG.29: the Live switch of the Simulation panel in headless Chromium. A 100 × 10 × 10 cantilever with a
 * width parameter d; Live on → a quick answer (elements 4× the study's) shows at once and says so, a refined one replaces it after a quiet
 * moment and says so; changing d starts over (the stale answer is never kept); Live off stops it; a manual Solve clears the label.
 *   node tools/partcraft-test/browser-live.mjs [--state …] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(path.resolve(HERE, '../..'), 'public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, tool, shot } = h;
  const { facePoint, viewAs, choose, setNum } = helpers(h);
  console.log('\n== live: re-solve while editing');
  await pc(() => window.partcraft.exactReady());
  const part = await cantileverPart();
  const P = await import(DEV + 'part.js');
  const ex = part.features.find((f) => f.type === 'extrude');
  part.params = { vars: [{ name: 'd', expr: '10' }], links: [{ target: `${ex.id}.depth`, expr: 'd' }] };
  await pc((t) => window.partcraft.openText(t, 'Beam.partcraft.json'), P.toJSON(part));
  await built();
  await choose('simulation');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-material]', 'steel');
  await setNum('[data-sim-size]', 4);
  await viewAs('left'); await tool('simulation-fixed');
  const left = await facePoint([-1, 0, 0]); await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1); await page.keyboard.press('Escape');
  await viewAs('right'); await tool('simulation-force');
  const right = await facePoint([1, 0, 0]); await page.mouse.click(right.x, right.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1); await page.keyboard.press('Escape');
  await page.selectOption('[data-sim-dir]', '-y'); await setNum('[data-sim-force]', 100);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0].total === 100);
  ok(await page.isVisible('[data-sim-live]') && !(await page.isChecked('[data-sim-live]')), 'the Live switch is in the Solve block, off');
  const label = () => page.evaluate(() => document.querySelector('[data-sim-live-quality]')?.dataset.simLiveQuality || null);
  const disp = () => page.evaluate(() => Number(document.querySelector('[data-sim-max-disp]')?.dataset.simMaxDisp));
  await page.click('[data-sim-live]');
  await page.waitForFunction(() => document.querySelector('[data-sim-live-quality="coarse"]') || document.querySelector('[data-sim-live-quality="refined"]'), null, { timeout: 120000 });
  ok(true, 'Live on: a result appears without pressing Solve');
  await page.waitForSelector('[data-sim-live-quality="refined"]', { timeout: 120000 });
  const d0 = await disp(), I = 10 * 1000 / 12, eb = 100 * 1e6 / (3 * 200000 * I);
  ok(Math.abs(d0 / eb - 1) < 0.1, `the refined tip deflection ${d0.toFixed(5)} mm is within 10 % of PL³/3EI ${eb.toFixed(5)} mm`);
  ok(/Refined answer, elements 4 mm/.test(await page.textContent('[data-sim-live-quality]')) && /refined/.test(await page.getAttribute('[data-sim-live-note]', 'data-sim-live-note')), 'the results and the status say refined, with the element size');
  // an edit: d 10 → 20 halves the deflection; the label drops back to a quick answer or "solving", never stale numbers under "refined"
  // the same calls "Use this variant" makes, run in the page
  await page.evaluate(async (src) => { const PPm = await import(src); window.partcraft.host.commit('d', () => { window.partcraft.part.params.vars[0].expr = '20'; PPm.applyPartParams(window.partcraft.part); }); }, '/assets/apps/partcraft/dev/params-part.js');
  await built();
  if (process.env.LIVE_DEBUG) { await page.waitForTimeout(8000); console.log('  debug', JSON.stringify(await page.evaluate(() => ({ expr: window.partcraft.part.params.vars[0].expr, vol: window.partcraft.regen.stats.volume, q: document.querySelector('[data-sim-live-quality]')?.dataset.simLiveQuality, note: document.querySelector('[data-sim-live-note]')?.dataset.simLiveNote, d: document.querySelector('[data-sim-max-disp]')?.dataset.simMaxDisp })))); }
  await page.waitForFunction(() => document.querySelector('[data-sim-max-disp]') && document.querySelector('[data-sim-live-quality="refined"]') && Math.abs(Number(document.querySelector('[data-sim-max-disp]').dataset.simMaxDisp) - 0.1) < 0.02, null, { timeout: 120000 });
  const d1 = await disp();
  ok(Math.abs(d0 / d1 - 2) < 0.2, `d = 20: the deflection halved (ratio ${(d0 / d1).toFixed(3)}) without pressing Solve`);
  await shot('live');
  await page.click('[data-sim-live]');
  await page.waitForFunction(() => !document.querySelector('[data-sim-live-note]'));
  ok(true, 'Live off removes the status line');
  await page.click('.pc-tools [data-cmd="simulation-solve"]');
  if (process.env.LIVE_DEBUG) { await page.waitForTimeout(6000); console.log('  debug', JSON.stringify(await page.evaluate(async () => { const m = await import('/assets/apps/partcraft/dev/ws-simulation.js'); const s = m._state; return { q: s.quality, busy: s.busy, live: s.live, err: s.error, dom: document.querySelector('[data-sim-live-quality]')?.outerHTML, dis: document.querySelector('.pc-tools [data-cmd="simulation-solve"]')?.disabled, status: document.querySelector('[data-status], .pc-status')?.textContent }; }))); }
  await page.waitForFunction(() => document.querySelector('[data-sim-max-disp]') && !document.querySelector('[data-sim-live-quality]'), null, { timeout: 120000 });
  ok(true, 'a manual Solve clears the quick/refined label');
  ok(h.problems.length === 0, 'live: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
