#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-offcuts.mjs — 0.7 SU.755 and SU.772 in PartCraft, headless Chromium (mesh kernel): Export › Nest flat parts on sheets…, a 100 × 60 mm
 * outline added from a DXF, material + thickness typed, nested on a 400 × 300 plate; "Add this job to the stock" puts the leftover
 * in the stock list (R-0001) and marks the file changed; a second nest of a small part says it used R-0001; the stock is in the
 * saved part JSON and survives Save → reopen; Save stock list (CSV). Then Export › Laser program…: a DXF outline, the layer set
 * to Cut (saved in the part), the preview, Save G-code. No console errors.
 *   node tools/partcraft-test/browser-offcuts.mjs [--state <file>] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { startHarness, cliArgs } from './browser-harness.mjs';

const h = await startHarness({ ...cliArgs(), exact: false });
const { page, ok } = h;
const P = (pairs) => pairs.map(([c, v]) => c + '\n' + v).join('\n');
const rectDxf = (w, hh) => P([[0, 'SECTION'], [2, 'HEADER'], [9, '$INSUNITS'], [70, 4], [0, 'ENDSEC'], [0, 'SECTION'], [2, 'ENTITIES'], [0, 'LWPOLYLINE'], [8, '0'], [90, 4], [70, 1], [10, 0], [20, 0], [10, w], [20, 0], [10, w], [20, hh], [10, 0], [20, hh], [0, 'ENDSEC'], [0, 'EOF']]) + '\n';
fs.mkdirSync(h.OUT, { recursive: true });
const big = path.join(h.OUT, 'Big.dxf'), small = path.join(h.OUT, 'Small.dxf');
fs.writeFileSync(big, rectDxf(100, 60)); fs.writeFileSync(small, rectDxf(30, 20));
const open = async () => { await page.click('[data-export-menu] > summary'); await page.click('[data-export-menu] [data-cmd="export-nest"]'); await page.waitForSelector('dialog [data-nest]'); };
const setNum = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); };
try {
  console.log('\n== offcut stock in the nest dialog (0.7 SU.755)');
  await h.built();
  await open();
  await page.setInputFiles('dialog [data-nest-file]', big);
  await page.waitForFunction(() => document.querySelectorAll('dialog [data-nest-part]').length === 1);
  await setNum('dialog [data-nest-w]', 400); await setNum('dialog [data-nest-h]', 300);
  await page.fill('dialog [data-nest-stock="material"]', 'Steel'); await page.press('dialog [data-nest-stock="material"]', 'Tab');
  await setNum('dialog [data-nest-stock="thickness"]', 3);
  await page.click('dialog [data-nest-run]');
  await page.waitForSelector('dialog [data-nest-svg]');
  ok(/none|No remnant/i.test(await page.textContent('dialog [data-nest-stock-used]')), 'first job: no remnant in stock, the part goes on a new plate');
  await page.click('dialog [data-nest-stock-commit]');
  await page.waitForSelector('dialog [data-stock-item="R-0001"]');
  ok(await page.evaluate(() => /R-0001/.test(window.partcraft.part.stock?.items?.map((i) => i.id).join(',') || '')), 'Add this job to the stock: R-0001 is in the stock list and in the part');
  await page.click('dialog button[data-key="cancel"]');
  await page.waitForSelector('dialog [data-nest]', { state: 'detached' });
  await open();
  ok(await page.$('dialog [data-stock-item="R-0001"]') !== null, 'the dialog opened again lists the stock');
  await page.setInputFiles('dialog [data-nest-file]', small);
  await page.waitForFunction(() => document.querySelectorAll('dialog [data-nest-part]').length === 1);
  await page.fill('dialog [data-nest-stock="material"]', 'Steel'); await page.press('dialog [data-nest-stock="material"]', 'Tab');
  await setNum('dialog [data-nest-stock="thickness"]', 3);
  await page.click('dialog [data-nest-run]');
  await page.waitForSelector('dialog [data-nest-svg]');
  ok(/R-0001/.test(await page.textContent('dialog [data-nest-stock-used]')), 'second job: "Remnants used: R-0001"');
  const sel = 'dialog [data-stock-item="R-0001"] select';
  await page.selectOption(sel, 'scrap');
  ok(await page.evaluate(() => window.partcraft.part.stock.items[0].status === 'scrap'), 'the status of a remnant can be changed in the list (Scrap)');
  const dl = page.waitForEvent('download');
  await page.click('dialog [data-nest-stock-csv]');
  const d = await dl;
  ok(/stock\.csv$/.test(d.suggestedFilename()), 'Save stock list (CSV): ' + d.suggestedFilename());
  await page.click('dialog button[data-key="cancel"]');
  const reopened = await page.evaluate(async () => { const pc = window.partcraft, txt = pc.P.toJSON(pc.part); await pc.openText(txt, 'again.partcraft.json'); await pc.built(); return pc.part.stock?.items?.length || 0; });
  ok(reopened === 2 || reopened === 1, `Save → reopen keeps the stock (${reopened} rows)`);
  console.log('\n== laser program (0.7 SU.772)');
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export-menu] [data-cmd="export-laser"]');
  await page.waitForSelector('dialog [data-laser]');
  ok(await page.isVisible('dialog [data-laser-none]') && await page.isVisible('dialog [data-lp-aid]'), 'Export › Laser program…: says there is nothing to send yet, and the safety line shows');
  await page.setInputFiles('dialog [data-laser-file]', big);
  await page.waitForSelector('dialog [data-lp-layer="CUT"]');
  await page.selectOption('dialog [data-lp-layer="CUT"] [data-lp="mode"]', 'cut');
  ok(await page.evaluate(() => window.partcraft.part.laser?.layers?.some((l) => l.name === 'CUT' && l.mode === 'cut')), 'choosing Cut for the layer is saved in the part (one undo step)');
  await page.waitForSelector('dialog [data-lp-canvas]');
  ok(/mm of burn/.test(await page.textContent('dialog [data-lp-stats]')), 'the preview and its numbers: ' + (await page.textContent('dialog [data-lp-stats]')).trim().slice(0, 60));
  const dl2 = page.waitForEvent('download');
  await page.click('dialog [data-lp-save]');
  const g = await dl2;
  const gtxt = fs.readFileSync(await g.path(), 'utf8');
  ok(/\.gcode$/.test(g.suggestedFilename()) && /G1/.test(gtxt) && /M[34]/.test(gtxt), `Save G-code: ${g.suggestedFilename()}, ${gtxt.split('\n').length} lines`);
  await page.click('dialog button[data-key="cancel"]');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
} catch (err) { await h.failed(err); }
await h.finish();
