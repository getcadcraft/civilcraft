#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — PartCraft 0.8 PANEL-COMPACT (oltl2-c): the part's own fields and the numbers of an Extrude, Revolve, Hole,
 * Fillet, Chamfer and Shell are the shared property grid (window.ccPropGrid) in the Properties panel. A change in the grid still runs
 * the control's own handler (same setFeature / params code, one undo step); =expressions and parameter names still work; a refused
 * number puts the old one back; markup in a name is text. Uses the shared PartCraft test admin (browser-harness.mjs).
 *   node tools/partcraft-test/browser-propgrid.mjs [--state ...] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function run(h) {
  const { page, ok, pc, built, F, nearRel } = h;
  const vol = async () => { await built(); return pc(() => window.partcraft.regen.stats.volume); };
  const part = () => pc(() => JSON.parse(JSON.stringify(window.partcraft.part)));
  const feat = async (type) => (await part()).features.find((f) => f.type === type);
  const rowOf = (label) => page.locator('.pc-right [data-pg-id]', { has: page.locator('label', { hasText: label }) }).first().locator('[data-pg-row]');
  const settle = () => page.waitForTimeout(150);

  await pc(() => window.partcraft.exactReady());
  const P = await import(new URL('../../public_html/assets/apps/partcraft/dev/part.js', import.meta.url).href);
  const pt = P.newPart('Block');
  const b = F.blockSketch(100, 50);
  const s1 = P.addFeature(pt, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: b.sk });
  P.addFeature(pt, 'extrude', { sketch: s1.id, depth: 20 });
  await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), JSON.stringify(pt));
  ok(nearRel(await vol(), 100000, 1e-9), 'a 100 × 50 × 20 block opens: 100000');

  // the part
  ok(!!(await page.$('.pc-right .pg-value')), 'the part\'s Properties are the shared grid');
  const nameBox = rowOf('Name');
  await nameBox.fill('Plate'); await nameBox.press('Enter'); await settle();
  ok((await part()).name === 'Plate', 'a typed part name renames the part');
  ok(!!(await page.$('.pc-right select[data-part-material][data-pg-row]')), 'the material list is a grid select that keeps data-part-material');

  // the extrude
  await page.click('.pc-tree [data-id="f2"]'); await settle();
  const depth = page.locator('.pc-right [data-param-key="f2.depth"]');
  ok(await depth.count() === 1 && !!(await page.$('.pc-right .pg-value [data-param-key="f2.depth"]')), 'the extrude depth is a grid box that carries data-param-key');
  await depth.fill('30'); await depth.press('Enter'); await settle();
  ok(nearRel(await vol(), 150000, 1e-9), 'depth 30 from the grid → 100 × 50 × 30 = 150000');
  ok((await feat('extrude')).depth === 30, 'the feature holds the plain number 30');
  await page.evaluate(() => document.activeElement?.blur()); await page.keyboard.press('Control+z');
  await settle();
  ok(nearRel(await vol(), 100000, 1e-9), 'one undo puts the depth back to 20');

  // parameters
  await page.click('#pc-tab-params');
  await page.fill('[data-new-name]', 'thick'); await page.fill('[data-new-expr]', '25'); await page.press('[data-new-expr]', 'Enter'); await settle();
  await page.click('#pc-tab-props'); await page.click('.pc-tree [data-id="f2"]'); await settle();
  await depth.fill('=thick'); await depth.press('Enter'); await built(); await settle();
  ok(nearRel(await vol(), 125000, 1e-9), 'typing =thick in the grid links the depth to the parameter (25 → 125000)');
  ok(await page.evaluate(() => !!document.querySelector('.pc-right label .pc-fx')), 'a linked field keeps its ƒ button (it is shown as the old field)');
  await page.click('.pc-right .pc-fx'); await built(); await settle();
  ok(await page.locator('.pc-right [data-param-key="f2.depth"]').count() === 1, 'unlinking brings the depth back as a grid box');

  // refused numbers
  await depth.fill('-5'); await depth.press('Enter'); await settle();
  await page.waitForTimeout(500);
  ok((await feat('extrude')).depth !== -5 && Number(await page.inputValue('.pc-right [data-param-key="f2.depth"]')) > 0, 'a negative depth is refused and the box goes back to the model\'s number');

  // a name with markup
  const fn = rowOf('Name');
  await fn.fill('<img src=x onerror=window.__pwn=1>'); await fn.press('Enter'); await settle();
  ok(!(await pc(() => window.__pwn)) && !(await page.$('.pc-right img')), 'markup in a feature name is text');
  await fn.fill('Base'); await fn.press('Enter'); await settle();

  // the checkbox
  const rev = page.locator('.pc-right [data-pg-id]', { has: page.locator('label', { hasText: 'Reverse' }) }).first().locator('input[type=checkbox]');
  await rev.check(); await settle(); await built();
  ok((await feat('extrude')).reverse === true, 'the Reverse check box sets the feature flag');
  await rev.uncheck(); await settle();

  ok(!h.problems.length, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { state, out } = cliArgs();
  const h = await startHarness({ state, out: process.argv.includes('--out') ? out : path.join(REPO, 'tmp/shots/partcraft-propgrid') });
  try { await run(h); } catch (e) { await h.failed(e); }
  await h.finish();
}
