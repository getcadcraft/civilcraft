#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-live.mjs — 0.8 round 3, EG.29: the Live switch of the Simulation panel in headless Chromium. A 100 × 10 × 10 cantilever with a
 * width parameter d; Live on → a quick answer (elements 4× the study's) shows at once and says so, a refined one replaces it after a quiet
 * moment and says so; changing d starts over (the stale answer is never kept); Live off stops it; a manual Solve clears the label.
 *   node tools/partcraft-test/browser-breakit.mjs [--state …] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(path.resolve(HERE, '../..'), 'public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, tool, shot } = h;
  const { facePoint, viewAs, choose, setNum } = helpers(h);
  console.log('\n== break it: what breaks first');
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
  ok(await page.isVisible('[data-sim-break-run]'), 'the Break it block is in the Simulation panel');
  await page.click('[data-sim-break-run]');
  await page.waitForSelector('[data-sim-break-row="yield"]', { timeout: 240000 });
  const rows = await page.$$eval('[data-sim-break-row]', (r) => r.map((x) => ({ kind: x.dataset.simBreakRow, f: Number(x.dataset.simBreakFactor), fail: x.dataset.simBreakFailing === '1', text: x.textContent })));
  const y = rows.find((r) => r.kind === 'yield'), hand = 250 / 60;
  ok(y && !y.fail && Math.abs(y.f / hand - 1) < 0.1, `first yield at ${y && y.f.toFixed(3)}× the load (beam formula ${hand.toFixed(3)}×): "${y && y.text}"`);
  ok(rows.length >= 1 && rows[0].f <= rows[rows.length - 1].f, 'the list is worst first: ' + rows.map((r) => r.kind + ' ' + r.f.toFixed(2)).join(', '));
  const at = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-break'); return o ? o.position.toArray() : null; });
  ok(at && at[0] < 15, `a marker sits at the fixed end, x = ${at && at[0].toFixed(1)} mm of 100`);
  const probs = await pc(async () => { const m = await import('/assets/apps/partcraft/dev/break-part.js'); return m.breakProblemsNow(); });
  ok(probs.length === 1 && probs[0].code === 'breakit.yield' && probs[0].severity === 'note', 'the weakest finding is a note in Problems when everything holds: ' + JSON.stringify(probs.map((p) => p.msg.key)));
  await shot('breakit');
  await setNum('[data-sim-force]', 500);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0].total === 500);
  await page.click('[data-sim-break-run]');
  await page.waitForFunction(() => document.querySelector('[data-sim-break-row="yield"]')?.dataset.simBreakFailing === '1', null, { timeout: 240000 });
  const probs2 = await pc(async () => { const m = await import('/assets/apps/partcraft/dev/break-part.js'); return m.breakProblemsNow(); });
  ok(probs2[0].severity === 'error', '500 N yields as loaded: an error in Problems (' + probs2[0].msg.key + ')');
  const PPm = '/assets/apps/partcraft/dev/params-part.js';
  await page.evaluate(async (src) => { const m = await import(src); window.partcraft.host.commit('d', () => { window.partcraft.part.params.vars[0].expr = '20'; m.applyPartParams(window.partcraft.part); }); }, PPm);
  await built();
  await page.waitForSelector('text=changed since this run', { timeout: 20000 });
  ok(!(await pc(() => window.partcraft.view.overlays.get('simulation-break'))), 'the part changed: the run is marked stale and the marker is gone');
  ok(h.problems.length === 0, 'break it: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
