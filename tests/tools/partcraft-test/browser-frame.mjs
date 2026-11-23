#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-frame.mjs — 0.11 SU.1811 on the page: a 2000 x 800 rectangle of Structural members (HSS4x4x1/4), Views › Check this frame opens the dialog with the four
 * members and four pinned supports at the feet; one pump (200 kg) is added with four bolt-down points; Check shows the not-reviewed line, a verdict and the tables;
 * Save the report downloads a CSV; a bad row is said, not run. No console errors.
 *   node tools/partcraft-test/browser-frame.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');
const part = P.newPart('Skid');
const sk = S.newSketch(); const r = S.addRect(sk, [0, 0], [2000, 800]);
const sf = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
P.addFeature(part, 'member', { segs: r.lines.map((l) => ({ sketch: sf.id, line: l })), section: 'HSS4X4X1/4', corner: 'miter' });

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built } = h;
const TMP = path.join(out, 'frame');
fs.mkdirSync(TMP, { recursive: true });
try {
  console.log('\n== Check this frame (0.11 SU.1811)');
  await pc((t) => window.partcraft.openText(t, 'Skid.partcraft.json'), P.toJSON(part));
  await built();
  await page.locator('[data-views-menu] summary').click();
  await page.click('[data-cmd="view-frame-check"]');
  await page.waitForSelector('[data-frame-dialog]');
  const sup = await page.$$('[data-frame-support]');
  ok(sup.length === 4, 'the dialog opens with four pinned supports at the feet: ' + sup.length);
  ok(/4 straight members/.test(await page.textContent('[data-frame-dialog]')), 'it says four straight members were found');
  await page.click('[data-frame-add-eq]');
  const eq = page.locator('[data-frame-eq="0"]');
  await eq.locator('input').nth(1).fill('200');
  await eq.locator('input').nth(1).dispatchEvent('change');
  await eq.locator('input').nth(2).fill('1000 0 400');
  await eq.locator('input').nth(2).dispatchEvent('change');
  await eq.locator('textarea').fill('500 0 0\n1500 0 0\n500 0 800\n1500 0 800');
  await eq.locator('textarea').dispatchEvent('change');
  await page.click('[data-frame-run]');
  await page.waitForSelector('[data-frame-verdict], [data-frame-error]');
  const txt = await page.textContent('[data-frame-result]');
  console.log('  result: ' + txt.slice(0, 260).replace(/\s+/g, ' '));
  ok(await page.$('[data-frame-not-reviewed]') !== null, 'the not-reviewed line is above the result');
  ok(await page.$('[data-frame-verdict]') !== null, 'a verdict is shown');
  ok((await page.$$('[data-frame-table]')).length >= 3, 'the member and weld tables are shown');
  ok(!/pcframe\.|frame\.(des|weld|rep)\./.test(txt), 'no word is a missing key');
  await page.screenshot({ path: path.join(out, 'frame-check.png') });
  const [d] = await Promise.all([page.waitForEvent('download'), page.click('[data-frame-csv]')]);
  const file = path.join(TMP, d.suggestedFilename());
  await d.saveAs(file);
  const csv = fs.readFileSync(file, 'utf8');
  ok(/frame check\.csv$/.test(file) && /^"An aid until an engineer/.test(csv) && csv.split('\n').length > 20, 'Save the report: ' + path.basename(file) + ', ' + csv.split('\n').length + ' lines');
  await eq.locator('input').nth(1).fill('0');
  await eq.locator('input').nth(1).dispatchEvent('change');
  await page.click('[data-frame-run]');
  ok(/Equipment 1 needs a mass/.test(await page.textContent('[data-frame-result]')), 'a bad equipment row is said, not run');
  await page.keyboard.press('Escape');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
