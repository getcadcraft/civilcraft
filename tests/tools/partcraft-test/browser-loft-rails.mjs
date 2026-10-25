#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-loft-rails.mjs — guide rails on a loft (0.4 P6) in headless Chromium: a part with two circle sections and two
 * rail sketches (two lines each) lofted without rails (a smooth loft), then the rails ticked in the Loft panel: the loft
 * becomes the frustum through the four rails (exact cone volume), the panel reports how closely it follows them, Undo takes
 * the last rail sketch off (its two lines are still two rails), Redo, no console errors.
 *   node tools/partcraft-test/browser-loft-rails.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, shot, nearRel } = h;
  console.log('\n== loft: guide rails');
  await pc(() => window.partcraft.exactReady());
  await pc((t) => window.partcraft.openText(t, 'LoftRails.partcraft.json'), await pc(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('LoftRails');
    const sk = (plane, draw) => { const s = S.newSketch(); draw(s); return P.addFeature(part, 'sketch', { plane, sketch: s }); };
    const a = sk({ kind: 'base', name: 'top' }, (s) => S.addCircle(s, [0, 0], 20));
    const b = sk({ kind: 'fixed', o: [0, 40, 0], n: [0, 1, 0] }, (s) => S.addCircle(s, [0, 0], 10));
    sk({ kind: 'base', name: 'front' }, (s) => { S.addLine(s, [20, 0], [10, 40]); S.addLine(s, [-20, 0], [-10, 40]); });
    sk({ kind: 'base', name: 'right' }, (s) => { S.addLine(s, [-20, 0], [-10, 40]); S.addLine(s, [20, 0], [10, 40]); });
    P.addFeature(part, 'loft', { sections: [{ sketch: a.id }, { sketch: b.id }] });
    return JSON.stringify(part);
  }));
  await built();
  const cone = Math.PI * 40 * 700 / 3, vol = () => pc(() => window.partcraft.regen.stats.volume);
  const v0 = await vol();
  await pc(() => window.partcraft.selectFeature('f5'));
  await page.waitForSelector('[data-props] [data-loft-rails]');
  ok((await page.getAttribute('[data-props] [data-loft-rails]', 'data-loft-rails')) === '0' && (await page.$$('[data-props] [data-loft-rail]')).length === 2, `the Loft panel offers the two unused sketches as guide rails (no rails yet; smooth loft ${v0.toFixed(1)} mm³)`);
  await page.click('[data-props] [data-loft-rail="f3"]'); await built();
  await page.click('[data-props] [data-loft-rail="f4"]'); await built();
  const rails = await pc(() => window.partcraft.part.features.find((f) => f.id === 'f5').rails);
  ok(JSON.stringify(rails) === '[{"sketch":"f3"},{"sketch":"f4"}]' && nearRel(await vol(), cone, 1e-5), `both rail sketches ticked: the loft follows the four lines — the frustum ${cone.toFixed(3)} (${(await vol()).toFixed(3)})`);
  const dev = Number(await page.getAttribute('[data-props] [data-loft-rail-dev]', 'data-loft-rail-dev'));
  ok(dev < 1e-4 && /4 rails/.test(await page.textContent('[data-props] [data-loft-rail-dev]')), `the panel says how closely it follows them (${dev.toExponential(1)} mm, 4 rails)`);
  await shot('loft-rails');
  await pc(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z'); await built();
  ok((await pc(() => (window.partcraft.part.features.find((f) => f.id === 'f5').rails || []).length)) === 1, 'Ctrl+Z takes the last rail off (one rail left)');
  ok(await pc(() => { const r = window.partcraft.regen.results.get('f5'); return r.status === 'ok' && r.gordon?.guides === 2; }), 'one rail sketch left: its two lines are two rails, and the loft still follows them');
  await page.keyboard.press('Control+y'); await built();
  ok(nearRel(await vol(), cone, 1e-5), 'Ctrl+Y: both rails again');
  // a refusal made in the exact-kernel worker reads as a sentence: the worker got the page's language catalog (worker-i18n.js)
  await pc(() => window.partcraft.commit('Point section', () => { window.partcraft.part.features.find((f) => f.id === 'f5').sections[1] = { point: { kind: 'fixed', p: [0, 40, 0] } }; }));
  await built();
  const wmsg = await pc(() => window.partcraft.regen.results.get('f5').message || '');
  ok(/every section must be a sketch/.test(wmsg) && !/loft\.rails/.test(wmsg), `a message made in the worker is in words, not a key: "${wmsg}"`);
  await pc(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await built();
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
