#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-design.mjs — 0.8 round 2: the Environment block and the Design study block of the Simulation panel in headless Chromium.
 * A 100 × 10 × 10 cantilever with a width parameter d; Moon from the list (gravity 1.62, one undo step); a parameter study of d
 * (10, 20, 40) solved in two workers; the table, the chart, a pick, "Use this variant" changes d; undo puts it back.
 *   node tools/partcraft-test/browser-design.mjs [--state …] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cantileverPart, helpers } from './browser-simulation.mjs';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(path.resolve(HERE, '../..'), 'public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, tool, shot } = h;
  const { facePoint, viewAs, choose, setNum } = helpers(h);
  console.log('\n== design: environment and design study');
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
  await setNum('[data-sim-size]', 5);
  await viewAs('left'); await tool('simulation-fixed');
  const left = await facePoint([-1, 0, 0]); await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1); await page.keyboard.press('Escape');
  await viewAs('right'); await tool('simulation-force');
  const right = await facePoint([1, 0, 0]); await page.mouse.click(right.x, right.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1); await page.keyboard.press('Escape');
  await page.selectOption('[data-sim-dir]', '-y'); await setNum('[data-sim-force]', 100);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0].total === 100);
  // environment
  ok(await page.isVisible('[data-sim-env]'), 'the Environment block is in the Simulation panel');
  await page.selectOption('[data-sim-env-preset]', 'moon');
  await page.waitForFunction(() => window.partcraft.part.studies.environment?.preset === 'moon');
  const env = await pc(() => window.partcraft.part.studies.environment);
  ok(env.g === 1.62 && env.pressure === 0, `Moon: g ${env.g}, pressure ${env.pressure} Pa`);
  ok(Number(await page.inputValue('[data-sim-env-g]')) === 1.62, 'the gravity field shows 1.62');
  await setNum('[data-sim-env-t]', -40);
  await page.waitForFunction(() => window.partcraft.part.studies.environment?.preset === 'custom');
  ok((await pc(() => window.partcraft.part.studies.environment)).temperature === -40, 'typing a temperature makes it custom (the label never lies)');
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.partcraft.part.studies.environment?.preset === 'moon');
  ok(true, 'Ctrl+Z undoes the temperature change');
  await page.selectOption('[data-sim-env-preset]', 'none');
  await page.waitForFunction(() => !window.partcraft.part.studies?.environment);
  ok(true, 'Not set removes the environment from the part');
  // design study
  await page.selectOption('[data-sim-dz-source]', 'parameters');
  await page.waitForSelector('[data-sim-dz-from="0"]');
  await setNum('[data-sim-dz-from="0"]', 10); await setNum('[data-sim-dz-to="0"]', 40); await setNum('[data-sim-dz-steps="0"]', 3);
  await setNum('[data-sim-dz-limit="maxDisp"]', 0.15);
  await page.waitForFunction(() => { const s = window.partcraft.part.studies.design; return s && s.source.params[0].to === 40 && s.metrics.some((m) => m.key === 'maxDisp' && m.limit === 0.15); });
  ok((await page.textContent('[data-sim-dz-run]')).includes('3'), 'the Run button says 3 variants');
  await page.click('[data-sim-dz-run]');
  await page.waitForSelector('[data-sim-dz-table] tbody tr:nth-child(3)', { timeout: 240000 });
  const rows = await page.$$eval('[data-sim-dz-row]', (r) => r.map((x) => [...x.querySelectorAll('td')].map((c) => c.textContent)));
  ok(rows.length === 3 && rows.every((r) => !/Did not solve/.test(r[5])), 'three variants solved: ' + JSON.stringify(rows.map((r) => r.slice(0, 3))));
  ok(/Over a limit/.test(rows[0][5]) && !/Over a limit/.test(rows[2][5]), 'd = 10 deflects 0.2 mm, over the 0.15 limit; d = 40 passes');
  ok(Number(rows[0][1]) * 4 > Number(rows[2][1]) * 0.99 && Math.abs(Number(rows[2][1]) / Number(rows[0][1]) - 4) < 1e-3, 'mass is in the ratio of the widths');
  ok(await page.isVisible('[data-sim-dz-chart] svg circle'), 'the trade-off chart is drawn');
  await page.click('[data-sim-dz-pick="v3"]');
  await page.waitForFunction(() => window.partcraft.part.studies.design.picked === 'v3');
  await page.click('[data-sim-dz-use]');
  await page.waitForFunction(() => window.partcraft.part.params.vars[0].expr === '40');
  await built();
  const vol = await pc(() => window.partcraft.regen.stats.volume);
  ok(Math.abs(vol - 100 * 10 * 40) < 1, `Use this variant: d = 40, the part rebuilt (volume ${vol.toFixed(1)} mm³)`);
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.partcraft.part.params.vars[0].expr === '10');
  ok(true, 'Ctrl+Z puts d back to 10');
  await shot('design-study');
  ok(h.problems.length === 0, 'design: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
