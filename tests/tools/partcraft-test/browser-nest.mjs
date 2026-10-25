#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-nest.mjs — 0.6 LC.17 in PartCraft, headless Chromium: a sheet metal bracket (plate + 90° flange) laid flat, then
 * Flat pattern › Nest on sheets…: the dialog lists the bracket; six of them nested on a 400 × 250 plate (the facts, the
 * preview); outlines from a DXF file added (two parts, inches → mm); nested again; Save DXF read back by our reader (every
 * part, the right areas); Export › Nest flat parts on sheets… opens the same dialog. No console errors.
 *   node tools/partcraft-test/browser-nest.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  const N = await import(pathToFileURL(path.join(REPO, 'lib/nest/nest.js')).href);
  console.log('\n== nest flat parts on sheets');
  if ((await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace)) !== 'design') { await page.selectOption('[data-workspace]', 'design'); await page.waitForTimeout(300); }
  await pc(() => window.partcraft.exactReady());
  const json = await pc(() => {
    const { P, S } = window.partcraft;
    const part = P.newPart('Bracket');
    const sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 60]);
    const top = sk.entities.filter((e) => e.type === 'line')[2].id;
    const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
    const base = P.addFeature(part, 'sheetbase', { sketch: s1.id, t: 2, r: 2, k: 0.44 });
    P.addFeature(part, 'sheetflange', { edge: { faces: [`${base.id}.end`, `${base.id}.side:${top}`], at: [50, 60, 2] }, angle: 90, length: 20 });
    return JSON.stringify(part);
  });
  await pc((t) => window.partcraft.openText(t, 'Bracket.partcraft.json'), json);
  await built();
  await pc(() => window.partcraft.selectFeature('f2'));
  await page.waitForTimeout(200);
  await page.click('[data-props] [data-sheet-flat]');
  await page.waitForSelector('[data-sheet-nest]', { timeout: 30000 });
  ok(await page.isVisible('[data-sheet-nest]'), 'Flat pattern: Nest on sheets… beside Save DXF');
  await page.click('[data-sheet-nest]');
  await page.waitForSelector('dialog [data-nest]');
  const rows = await page.$$eval('dialog [data-nest-part]', (r) => r.map((x) => x.textContent));
  ok(rows.length === 1 && /Bracket/.test(rows[0]), 'the dialog lists the bracket\'s flat pattern');
  await page.fill('dialog [data-nest-qty="0"]', '6'); await page.press('dialog [data-nest-qty="0"]', 'Tab');
  await page.fill('dialog [data-nest-w]', '400'); await page.press('dialog [data-nest-w]', 'Tab');
  await page.fill('dialog [data-nest-h]', '250'); await page.press('dialog [data-nest-h]', 'Tab');
  await page.click('dialog [data-nest-run]');
  await page.waitForSelector('dialog [data-nest-svg]');
  let facts = (await page.textContent('dialog [data-nest-facts]')).replace(/\s+/g, ' ');
  ok(/Plates used\s*1/.test(facts) && /Parts placed\s*6/.test(facts) && /Material used\s*[\d.]+ %/.test(facts), 'six brackets on one 400 × 250 plate: ' + facts);
  ok((await page.$$eval('dialog [data-nest-svg] .pc-nest-sheet', (x) => x.length)) === 1, 'the preview draws the plate');
  await shot('nest-flat');
  // outlines from a DXF in inches: a 4 × 2 in plate with a Ø1 in hole, and a Ø2 in disc
  const P = (pairs) => pairs.map(([c, v]) => c + '\n' + v).join('\n');
  const dxfIn = P([[0, 'SECTION'], [2, 'HEADER'], [9, '$INSUNITS'], [70, 1], [0, 'ENDSEC'], [0, 'SECTION'], [2, 'ENTITIES'],
    [0, 'LWPOLYLINE'], [8, '0'], [90, 4], [70, 1], [10, 0], [20, 0], [10, 4], [20, 0], [10, 4], [20, 2], [10, 0], [20, 2],
    [0, 'CIRCLE'], [8, '0'], [10, 1], [20, 1], [40, 0.5], [0, 'CIRCLE'], [8, '0'], [10, 8], [20, 1], [40, 1], [0, 'ENDSEC'], [0, 'EOF']]) + '\n';
  fs.mkdirSync(h.OUT, { recursive: true });
  const fIn = path.join(h.OUT, 'Washers.dxf');
  fs.writeFileSync(fIn, dxfIn);
  await page.setInputFiles('dialog [data-nest-file]', fIn);
  await page.waitForFunction(() => document.querySelectorAll('dialog [data-nest-part]').length === 3);
  const notes = await page.textContent('dialog .pc-nest-notes');
  ok(/Added 2 parts from Washers\.dxf/.test(notes) && /in inches/.test(notes), 'Add outlines from a DXF: two parts, inches changed to mm — ' + notes.replace(/\s+/g, ' '));
  await page.click('dialog [data-nest-run]');
  await page.waitForFunction(() => /Parts placed\s*8/.test(document.querySelector('dialog [data-nest-facts]')?.textContent || ''));
  facts = (await page.textContent('dialog [data-nest-facts]')).replace(/\s+/g, ' ');
  ok(/Parts placed\s*8/.test(facts), 'nested again with them: eight parts — ' + facts);
  const dl = page.waitForEvent('download');
  await page.click('dialog [data-nest-dxf]');
  const d = await dl; const fd = path.join(h.OUT, d.suggestedFilename()); await d.saveAs(fd);
  const back = N.readOutlines(fs.readFileSync(fd, 'utf8'), { skipLayers: ['SHEET', 'LABELS'] });
  const areas = back.parts.map((p) => N.regionArea(p.loops)).sort((a, b) => a - b);
  const plate = (8 - Math.PI * 0.25) * 645.16, disc = Math.PI * 645.16;
  ok(d.suggestedFilename() === 'Bracket nest.dxf' && back.parts.length === 8, `Save DXF: "${d.suggestedFilename()}", eight parts read back`);
  ok(areas.filter((a) => Math.abs(a - disc) < 1e-6 * disc).length === 1 && areas.filter((a) => Math.abs(a - plate) < 1e-6 * plate).length === 1, '… the disc and the holed plate at their areas in mm²');
  await shot('nest-dxf');
  await page.click('dialog button[data-key="cancel"]');
  await page.waitForSelector('dialog [data-nest]', { state: 'detached' });
  // Export › Nest flat parts on sheets… (the part is sheet metal: its flat pattern comes along)
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export-menu] [data-cmd="export-nest"]');
  await page.waitForSelector('dialog [data-nest-part]', { timeout: 30000 });
  ok((await page.$$('dialog [data-nest-part]')).length === 1, 'Export › Nest flat parts on sheets…: the same dialog, with the part\'s flat pattern');
  await page.click('dialog button[data-key="cancel"]');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-nest');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
