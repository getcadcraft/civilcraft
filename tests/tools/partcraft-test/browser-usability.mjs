#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-usability.mjs — the 0.5 usability pass's changes on the page (the mesh kernel): a new part's first Extrude fills
 * the view and says its depth can be typed; with it selected, typing 25 then Enter sets the depth (one undo step; Ctrl+Z
 * still undoes right after adding a feature); the Features › More menu has its group headings and dims what the mesh kernel
 * does not build; no console errors.
 *   node tools/partcraft-test/browser-usability.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, shot, F } = h;

try {
  console.log('\n== usability pass (0.5)');
  const P = await import('../../public_html/assets/apps/partcraft/dev/part.js');
  const p = P.newPart('Plate');
  P.addFeature(p, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk });
  await pc((t) => window.partcraft.openText(t, 'Plate.partcraft.json'), JSON.stringify(p));
  await built();
  const cam0 = await pc(() => window.partcraft.view.camera.position.toArray());
  await page.click('.pc-tree [data-id="f1"]');
  await h.tool('extrude');
  await built(); await page.waitForTimeout(200);
  const cam1 = await pc(() => window.partcraft.view.camera.position.toArray());
  ok(/Extrude1 added\. Change its numbers on the right, or type a number now for its depth\./.test(await h.statusText()), 'the first Extrude says its depth can be typed now');
  ok(cam0.some((v, i) => Math.abs(v - cam1[i]) > 1e-3), 'the first solid is fitted into the view');
  await page.click('.pc-stage canvas', { position: { x: 3, y: 3 } }).catch(() => {});
  await page.click('.pc-tree [data-id="f2"]');
  await page.keyboard.type('25');
  ok((await page.evaluate(() => document.activeElement?.dataset?.paramKey)) === 'f2.depth' && /type the number, then Enter/.test(await h.statusText()), 'with Extrude1 selected, typing goes into its Depth box');
  await page.keyboard.press('Enter');
  await built();
  ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 25 && Math.abs((await pc(() => window.partcraft.regen.stats.volume)) - 100 * 50 * 25) < 1e-3, 'Enter sets the depth: 25 (volume 100 × 50 × 25)');
  await page.click('.pc-tree [data-id="f2"]');
  await page.keyboard.press('Control+z');
  await built();
  ok((await pc(() => window.partcraft.part.features.find((f) => f.id === 'f2').depth)) === 10, 'one Ctrl+Z puts the depth back to 10');
  await page.click('[data-features-menu] > summary');
  const heads = await page.evaluate(() => [...document.querySelectorAll('[data-features-menu] .pc-menu-h')].map((x) => x.textContent));
  const dim = await page.evaluate(() => getComputedStyle(document.querySelector('[data-features-menu] [data-cmd="sweep"]')).opacity);
  ok(heads.join('|') === 'Reference geometry|Sweep, loft and draft|Bodies|Surfaces|Ribs and threads|Sheet metal' && Number(dim) < 1, `More: headings (${heads.join(', ')}); Sweep dimmed (not built on the mesh kernel)`);
  const fits = await page.evaluate(() => { const m = document.querySelector('[data-features-menu] .pc-menu-list'), last = m.querySelector('[data-cmd="sheetflange"]'); m.scrollTop = m.scrollHeight; return m.getBoundingClientRect().bottom <= innerHeight && last.getBoundingClientRect().bottom <= innerHeight; });
  ok(fits, 'the long menu stays inside the window and scrolls to its last item (Edge flange)');
  await shot('us-1-more-menu');
  await page.keyboard.press('Escape');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
