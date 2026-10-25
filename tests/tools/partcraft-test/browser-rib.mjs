#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-rib.mjs — the Rib (0.4 P20) in the Design workspace, headless Chromium: an L-bracket with a line on its middle
 * plane; More › Rib on the selected sketch fills the inside corner (+ 1250 × 3); Thickness 6 from the panel; Flip says the
 * other side never meets the body; Ctrl+Z; the thickness side. Volumes against hand geometry. No console errors.
 *   node tools/partcraft-test/browser-rib.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot, nearRel } = h;
  const menu = async (cmd) => { await page.click('[data-features-menu] > summary'); await page.click(`[data-features-menu] [data-cmd="${cmd}"]`); await built(); };
  const vol = () => pc(() => window.partcraft.regen.stats?.volume ?? null);
  const control = (label) => page.locator('[data-props] label', { hasText: label }).first().locator('xpath=following-sibling::*[1]/descendant-or-self::*[self::input or self::select][1]');
  const setNum = async (label, v) => { const c = control(label); await c.fill(String(v)); await c.press('Enter'); await built(); };
  console.log('\n== rib from an open sketch');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await pc(() => window.partcraft.exactReady());
  // an L-bracket (legs 100, walls 10, 40 deep = 76000) and a line from (10, 60) to (60, 10) on the plane 20 in front
  const json = await pc(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Bracket');
    const a = S.newSketch(); let prev = null, first = null;
    const pts = [[0, 0], [100, 0], [100, 10], [10, 10], [10, 100], [0, 100]];
    for (let i = 0; i + 1 < pts.length; i++) { prev = S.addLine(a, prev ? prev.p2 : pts[i], pts[i + 1]); if (!first) first = prev; }
    S.addLine(a, prev.p2, first.p1);
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: a });
    P.addFeature(part, 'extrude', { sketch: s1.id, depth: 40 });
    const pl = P.addFeature(part, 'plane', { mode: 'offset', planes: [{ kind: 'base', name: 'front' }], d: 20 });
    const b = S.newSketch(); S.addLine(b, [10, 60], [60, 10]);
    P.addFeature(part, 'sketch', { plane: { kind: 'ref', feature: pl.id }, sketch: b });
    return JSON.stringify(part);
  });
  await pc((t) => window.partcraft.openText(t, 'Bracket.partcraft.json'), json);
  await built();
  ok(nearRel(await vol(), 76000, 1e-9), 'the bracket: 76000');
  await pc(() => window.partcraft.selectFeature('f4'));
  await menu('rib');
  await page.waitForTimeout(300); await built();
  const f = await pc(() => window.partcraft.part.features.at(-1));
  ok(f.type === 'rib' && f.sketch === 'f4' && !f.flip && nearRel(await vol(), 76000 + 1250 * 3, 1e-9), `More › Rib on the selected sketch fills the inside corner: + 1250 × 3 (${await vol()})`);
  await setNum('Thickness (mm)', 6);
  ok(nearRel(await vol(), 76000 + 1250 * 6, 1e-9), 'Thickness 6 in the panel: 83500');
  await shot('rib');
  await page.click('[data-props] label:has-text("Flip")'); await built();
  ok((await page.textContent('[data-props]')).includes('never meets the body') && nearRel(await vol(), 76000, 1e-9), 'Flip: the other side never meets the body, and the panel says so');
  await pc(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await built();
  ok(nearRel(await vol(), 83500, 1e-9), 'Ctrl+Z: back to the corner');
  await page.locator('[data-props] select').first().selectOption('front'); await built();
  ok((await pc(() => window.partcraft.part.features.at(-1).side)) === 'front' && nearRel(await vol(), 83500, 1e-9), 'the thickness all in front of the plane: the same volume');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-rib');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
