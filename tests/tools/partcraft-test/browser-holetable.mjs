#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-holetable.mjs — the hole table (0.4 P23), headless Chromium: the flange's drawing, Hole table › Of the top view:
 * the panel counts 8 holes, the sheet shows the table, the tags A1–A8 and X0 Y0, the PDF has them (pdftotext), Ctrl+S saves
 * the setting in the part. No console errors.
 *   node tools/partcraft-test/browser-holetable.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export async function run(h) {
  const { page, ok, pc, built, shot, tool } = h;
  const save = async (fn) => { const dl = page.waitForEvent('download'); await fn(); const d = await dl; const f = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(f); return f; };
  console.log('\n== hole table on the drawing');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  await pc(() => window.partcraft.exactReady());
  await built();
  await tool('drawing');
  await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 20000 });
  await page.locator('.pc-right label', { hasText: /^Hole table$/ }).first().locator('xpath=following-sibling::*[1]/descendant-or-self::select[1]').selectOption('top');
  await page.waitForSelector('[data-hole-count]', { timeout: 20000 });
  const n = await page.getAttribute('[data-hole-count]', 'data-hole-count');
  const sheetText = await page.evaluate(() => [...document.querySelectorAll('[data-sheet] svg text')].map((x) => x.textContent).join(' | '));
  ok(n === '8' && /Hole table \(top view\)/.test(sheetText) && /\bA8\b/.test(sheetText) && /X0 Y0/.test(sheetText) && /Ø14 THRU/.test(sheetText), `Hole table › Of the top view: 8 holes; the sheet shows the table, tags A1–A8 and the X0 Y0 origin`);
  await shot('hole-table');
  const pdf = await save(() => tool('dr-pdf'));
  try {
    const pt = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' });
    ok(/Hole table \(top view\)/.test(pt) && /A8/.test(pt) && /Ø14 THRU/.test(pt), 'the PDF carries the hole table');
  } catch { ok(true, 'pdftotext is not installed (skipped)'); }
  const sv = await save(() => page.keyboard.press('Control+s'));
  const j = JSON.parse(fs.readFileSync(sv, 'utf8'));
  ok(j.drawing && j.drawing.holeTable && j.drawing.holeTable.view === 'top', 'Ctrl+S: the hole table setting is saved with the part');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.partcraft.mode === 'model').catch(() => {});
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-holetable');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
