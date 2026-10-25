#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-drawing-sheet.mjs — the drawing sheet's size, title block and revisions, and the part's material (0.4 P14), in
 * headless Chromium: Material in the Part panel, Sheet A1 / ANSI B from the Drawing panel (the SVG sheet resizes), every
 * title block field typed and drawn on the sheet, two revisions added (B follows A, today's date) and one edited, Undo,
 * a bad date refused, the PDF downloaded at its size and read back by pdfinfo / pdftotext, the file saved and read back.
 *   node tools/partcraft-test/browser-drawing-sheet.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export async function run(h) {
  const { page, ok, pc, built, shot, tool } = h;
  const sheetWords = () => page.evaluate(() => [...document.querySelectorAll('[data-sheet] svg text')].map((t) => t.textContent).join(' | '));
  const field = (k) => page.locator(`[data-props] [data-title-field="${k}"]`);
  const type = async (loc, v) => { await loc.fill(v); await loc.press('Enter'); await page.waitForTimeout(60); };

  console.log('\n== drawing sheet: material, size, title block, revisions');
  await pc((t) => window.partcraft.openText(t, 'Bracket.partcraft.json'), JSON.stringify(h.F.flange().part));
  await built();
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await page.keyboard.press('Escape');
  { const r = await page.locator('.pc-stage canvas').first().boundingBox(); await page.mouse.click(r.x + 12, r.y + r.height - 12); await page.waitForTimeout(100); }
  await page.selectOption('[data-props] [data-part-material]', await page.$eval('[data-props] [data-part-material]', (s, n) => [...s.options].find((o) => o.textContent.startsWith(n)).value, 'Aluminum 6061-T6'));   // options are preset numbers since 0.4 G
  ok(await pc(() => window.partcraft.part.material?.name === 'Aluminum 6061-T6' && window.partcraft.part.material.density > 2.6 && window.partcraft.part.material.density < 2.8), 'Part panel › Material: aluminium 6061-T6 (2.7 g/cm³) is stored in the part');

  await tool('drawing');
  await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 20000 });
  ok(await pc(() => window.partcraft.drawing.sheet.paper === 'a3'), 'a new drawing is on A3');
  await page.selectOption('.pc-right label:has-text("Sheet") + select', 'a1');
  await page.waitForFunction(() => window.partcraft.drawing?.sheet?.paper === 'a1');
  const paper = await page.evaluate(() => { const r = document.querySelector('[data-sheet] svg .pc-sheet-paper'); return [Number(r.getAttribute('width')), Number(r.getAttribute('height'))]; });
  ok(paper[0] === 841 && paper[1] === 594 && (await pc(() => window.partcraft.part.drawing.sheet)) === 'a1', `Sheet › A1: the paper is 841 × 594 mm (${paper.join(' × ')}), saved in the drawing`);
  const fields = { title: 'Flange, DN50', number: 'FL-0050', company: 'Acme Fabrication', drawnBy: 'J. Doe', checkedBy: 'R. Roe', approvedBy: 'K. Lee', date: '2026-10-01', tolerance: 'ISO 2768-m', finish: 'Ra 3.2' };
  for (const [k, v] of Object.entries(fields)) await type(field(k), v);
  const tt = await pc(() => window.partcraft.part.drawing.title);
  ok(Object.entries(fields).every(([k, v]) => tt?.[k] === v), 'every title block field typed is stored');
  let words = await sheetWords();
  ok(['Flange, DN50', 'FL-0050', 'Acme Fabrication', 'J. Doe', 'R. Roe', 'K. Lee', '2026-10-01', 'Aluminum 6061-T6', 'A1', 'General tolerance: ISO 2768-m', 'Finish: Ra 3.2'].every((w) => words.includes(w)), 'the sheet draws them, with the material and the size');
  await type(field('date'), '1/10/2026');
  ok((await pc(() => window.partcraft.part.drawing.title.date)) === '2026-10-01' && /year-month-day/.test(await h.statusText()), 'a date not as year-month-day is refused in words, the old one kept');

  await page.click('[data-props] [data-rev-add]'); await page.waitForTimeout(60);
  await page.click('[data-props] [data-rev-add]'); await page.waitForTimeout(60);
  let revs = await pc(() => window.partcraft.part.drawing.revisions);
  const today = new Date().toISOString().slice(0, 10);
  ok(revs?.length === 2 && revs[0].rev === 'A' && revs[1].rev === 'B' && revs.every((r) => r.date === today), 'Add revision twice: A then B, dated today');
  await type(page.locator('[data-props] [data-rev-row="1"] [data-rev-field="desc"]'), 'Bolt circle 125 → 130');
  await type(page.locator('[data-props] [data-rev-row="1"] [data-rev-field="by"]'), 'RR');
  words = await sheetWords();
  ok(words.includes('Bolt circle 125 → 130') && words.includes('Description') && (await pc(() => window.partcraft.drawing.sheet.revisions)) === 2, 'the revision block on the sheet: header and both rows, the description typed');
  ok((await pc(() => window.partcraft.drawing.sheet.texts.filter((t) => t.text === 'B').length)) >= 2, 'Rev. in the title block follows the latest revision (B) while none is typed');
  await pc(() => document.activeElement?.blur());   // in a text box Ctrl+Z is the browser's own undo
  await page.keyboard.press('Control+z'); await page.waitForTimeout(80);
  ok((await pc(() => window.partcraft.part.drawing.revisions[1].by)) === '', 'Ctrl+Z takes back the last edit only');
  await page.click('[data-props] [data-rev-delete="0"]'); await page.waitForTimeout(60);
  revs = await pc(() => window.partcraft.part.drawing.revisions);
  ok(revs.length === 1 && revs[0].rev === 'B', 'Delete removes a revision row');
  await shot('drawing-sheet-a1');

  // the PDF at its size
  const dl = page.waitForEvent('download');
  await page.click('[data-props] button:has-text("Export PDF")');
  const pdfPath = path.join(h.OUT, 'drawing-sheet.pdf');
  await (await dl).saveAs(pdfPath);
  if (spawnSync('which', ['pdftotext']).status === 0) {
    const info = spawnSync('pdfinfo', [pdfPath], { encoding: 'utf8' }).stdout, txt = spawnSync('pdftotext', ['-layout', pdfPath, '-'], { encoding: 'utf8' }).stdout;
    ok(/Page size:\s+2383\.94 x 1683\.78 pts/.test(info) && ['FL-0050', 'Acme Fabrication', 'Aluminum 6061-T6', 'Bolt circle 125', 'General tolerance'].every((w) => txt.includes(w)), 'the PDF is one A1 page (2383.94 × 1683.78 pt) with the title block and the revision');
  } else console.log('  skip pdftotext missing');
  await page.selectOption('.pc-right label:has-text("Sheet") + select', 'ansi-b');
  await page.waitForFunction(() => window.partcraft.drawing?.sheet?.paper === 'ansi-b');
  ok((await sheetWords()).includes('ANSI B'), 'Sheet › ANSI B: the size cell says so');
  const back = await pc(() => { const p = window.partcraft.P.readPart(window.partcraft.P.toJSON(window.partcraft.part)); return { v: JSON.parse(window.partcraft.P.toJSON(window.partcraft.part)).version, sheet: p.drawing.sheet, number: p.drawing.title.number, revs: p.drawing.revisions.length, mat: p.material.name }; });
  ok(back.v === 3 && back.sheet === 'ansi-b' && back.number === 'FL-0050' && back.revs === 1 && back.mat === 'Aluminum 6061-T6', 'saved and read back: sheet, title block, revision, material (file version 3)');
  await page.click('[data-props] button:has-text("Back to the model")');
  await page.waitForFunction(() => window.partcraft.mode !== 'drawing');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
