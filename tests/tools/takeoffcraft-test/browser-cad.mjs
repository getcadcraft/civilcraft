#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cad.mjs — TakeoffCraft 0.7 Track TD in headless Chromium at https://getcadcraft.com/lab/takeoffcraft (run as root: a session
 * minted for the test admin by admin.php, so the shared login throttle is untouched).
 *   node tools/takeoffcraft-test/browser-cad.mjs [--out dir]
 *
 * Opens fixtures/cad/kitchen-count.dwg through the file input (File › Open plans): Model + K-101, scales read from the drawing; counts the
 * shelves by block through the dialog (22, one undo step, again adds nothing), by text (A3: 8; attribute ITEM: 3); turns a layer off in the
 * Layers menu and sees the count follow; takes geometry from geometry-measure.dwg with the Measure drawing tool (a window, then Add: feet
 * to the hand value, one undo step); exports the marked PDF (a real PDF with the marks); saves the takeoff (the CAD file's hash and name)
 * and reopens it on a reloaded page with the drawing: the marks come back; opens kitchen-equipment.dwg and then its linked drawing
 * base-plan.dwg: the missing-xref note goes. Shots (paper and model themes) in --out. No console errors.
 */
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-cad'));
fs.mkdirSync(OUT, { recursive: true });
const FIX = path.join(ROOT, 'fixtures/cad'), DWG = path.join(ROOT, 'fixtures/dwg');
const KITCHEN = path.join(FIX, 'kitchen-count.dwg'), GEOM = path.join(FIX, 'geometry-measure.dwg');
for (const f of [KITCHEN, GEOM]) if (!fs.existsSync(f)) execFileSync('node', [path.join(ROOT, 'tools/takeoffcraft-test/make-cad-fixtures.mjs')], { stdio: 'inherit' });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const fresh = async (space = 'paper') => {
    await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=' + space);
    await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
    if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  };
  const T = (fn, a) => page.evaluate(fn, a);
  const status = () => page.textContent('[data-status]');
  const openFile = async (...files) => { const n = await T(() => window.takeoffcraft.files.length); await page.setInputFiles('[data-file-pdf]', files); await page.waitForFunction((k) => window.takeoffcraft.files.length >= k, n + files.length, { timeout: 30000 }); await page.waitForTimeout(700); };
  const sheetKeys = () => T(() => [...document.querySelectorAll('[data-sheet]')].map((b) => b.dataset.sheet));
  const showSheet = async (i) => { const k = (await sheetKeys())[i]; await page.click(`[data-sheet="${k}"]`); await page.waitForTimeout(900); return k; };

  // ---- open the drawing
  await fresh();
  await openFile(KITCHEN);
  const names = await T(() => [...document.querySelectorAll('.tc-sheet-title')].map((e) => e.textContent));
  ok(names.join('|') === 'Model|K-101', 'File › Open plans takes the DWG: sheets ' + names.join(', '));
  const hash = crypto.createHash('sha256').update(fs.readFileSync(KITCHEN)).digest('hex');
  ok(await T((h) => window.takeoffcraft.files[0].hash === h, hash), 'its hash is the SHA-256 of the file');
  ok(/Drawing units \(inches\)/.test(await page.textContent('.tc-sheets')) && /1\/2" = 1'-0"/.test(await page.textContent('.tc-sheets')), 'the scales come from the drawing: units for Model, 1/2" = 1\'-0" for K-101');
  const k101 = await showSheet(1);
  ok(await T(() => window.takeoffcraft.rendered() > 0), 'sheet K-101 is drawn');
  ok(!(await page.$eval('[data-act="cad-count"]', (b) => b.hidden)) && !(await page.$eval('[data-tool="cadgeom"]', (b) => b.hidden)) && !(await page.$eval('[data-layers-menu]', (b) => b.hidden)), 'the sheet bar offers Count from drawing, Measure drawing and Layers');
  ok(await T(() => { const sc = window.takeoffcraft.cad.info()?.scale; return sc?.method === 'preset' && sc.label === '1/2" = 1\'-0"'; }), 'the scale is the 1/2" preset: ' + await T(() => window.takeoffcraft.cad.info().scale.label));
  await page.screenshot({ path: path.join(OUT, 'cad-sheet-paper.png') });

  // ---- count by block
  const undo0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.click('[data-act="cad-count"]');
  await page.waitForSelector('.tc-cc');
  await page.fill('.tc-cc-search', 'shelf');
  await page.click('.tc-cc-list li:first-child input');
  ok(/^22 found, 22 to add/.test(await page.textContent('.tc-cc-result')), 'by block: SHELF-18X48 → "' + await page.textContent('.tc-cc-result') + '"');
  ok(/on hidden layers \(K-OLD, A-HIDDEN\)/.test(await page.textContent('.tc-cc-notes')) && /3 on hidden layers left out/.test(await page.textContent('.tc-cc-result')), 'what sits on the hidden layers (K-OLD, A-HIDDEN) is said, and the 3 frozen shelves are left out, not hidden from the count');
  await page.screenshot({ path: path.join(OUT, 'cad-count-dialog.png') });
  await page.click('dialog [data-key="ok"]');
  await page.waitForTimeout(600);
  ok(await T((u) => window.takeoffcraft.model.undoStack.length === u + 1 && window.takeoffcraft.model.state.marks.length === 22 && window.takeoffcraft.model.state.items.length === 1, undo0), 'Add: 22 marks and the item in ONE undo step');
  ok(await T(() => window.takeoffcraft.quantities()[0].qty === 22 && window.takeoffcraft.quantities()[0].unit === 'EA'), 'the quantities table says 22 EA');
  await page.click('[data-act="cad-count"]'); await page.waitForSelector('.tc-cc');
  await page.fill('.tc-cc-search', 'shelf'); await page.click('.tc-cc-list li:first-child input');
  ok(/22 already counted/.test(await page.textContent('.tc-cc-result')) && await page.$eval('dialog [data-key="ok"]', (b) => b.disabled), 'counting again: 22 already counted, nothing to add');
  // by text
  await page.click('[data-cc-tab="text"]');
  await page.fill('.tc-cc-text', 'A3');
  ok(/^8 found/.test(await page.textContent('.tc-cc-result')), 'by text: "A3" → ' + await page.textContent('.tc-cc-result'));
  await page.selectOption('.tc-cc-panel select >> nth=1', 'ITEM');
  ok(/^3 found/.test(await page.textContent('.tc-cc-result')), 'by attribute ITEM = A3 → ' + await page.textContent('.tc-cc-result'));
  // by layer + type
  await page.click('[data-cc-tab="shape"]');
  await page.selectOption('[data-cc-layer]', 'E-LITE'); await page.selectOption('[data-cc-type]', 'CIRCLE');
  ok(/^12 found/.test(await page.textContent('.tc-cc-result')), 'by layer and type: circles on E-LITE → ' + await page.textContent('.tc-cc-result'));
  await page.click('dialog [data-key="cancel"]');

  // ---- layers
  await page.click('[data-layers-menu] > summary');
  await page.waitForSelector('.tc-layers-list');
  ok(await page.$eval('[data-layer="K-OLD"]', (c) => !c.checked) && await page.$eval('[data-layer="K-EQPM"]', (c) => c.checked), 'Layers: K-OLD (frozen in the file) starts off, K-EQPM on');
  const r0 = await T(() => window.takeoffcraft.rendered());
  await page.click('[data-layer="K-EQPM"]');
  await page.waitForFunction((n) => window.takeoffcraft.rendered() > n, r0, { timeout: 15000 });
  ok(await T(async () => (await window.takeoffcraft.cad.count('block', { names: ['SHELF-18X48'] })).total === 0), 'K-EQPM turned off: the sheet redraws and its 22 shelves are not counted');
  await page.click('[data-layer="K-EQPM"]');
  await page.waitForTimeout(300);
  ok(await T(async () => (await window.takeoffcraft.cad.count('block', { names: ['SHELF-18X48'] })).total === 22), 'turned on again: 22');
  await page.click('[data-layers-menu] > summary');
  await page.screenshot({ path: path.join(OUT, 'cad-counted.png') });

  // ---- the takeoff file keeps the drawing
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="save-project"]')]);
  const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(saved.files[0].name === 'kitchen-count.dwg' && saved.files[0].hash === hash && saved.files[0].pages === 2, 'Save takeoff: the file entry is kitchen-count.dwg, its hash, 2 sheets');
  ok(saved.marks.length === 22 && Object.values(saved.sheets).some((s) => s.scale?.method === 'preset') && Object.values(saved.sheets).some((s) => s.scale?.method === 'drawing'), 'the 22 marks and both scales (preset, drawing) are in it');
  const projFile = path.join(OUT, 'kitchen.takeoff.json'); fs.writeFileSync(projFile, JSON.stringify(saved));

  // ---- marked PDF
  await page.click('[data-export-menu] > summary');
  const [pdfDl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="export-pdf"]')]);
  const pdfBytes = fs.readFileSync(await pdfDl.path());
  ok(pdfDl.suggestedFilename() === 'kitchen-count (takeoff).pdf' && pdfBytes.subarray(0, 5).toString() === '%PDF-' && pdfBytes.length > 3000, 'Export › Marked PDF from the drawing: ' + pdfDl.suggestedFilename() + ', ' + pdfBytes.length + ' bytes, a PDF');
  fs.writeFileSync(path.join(OUT, 'kitchen-marked.pdf'), pdfBytes);
  await page.keyboard.press('Escape');

  // ---- reopen: a reloaded page, the project, then the drawing
  await fresh();
  await page.setInputFiles('[data-file-project]', projFile);
  await page.waitForTimeout(600);
  ok(await T(() => window.takeoffcraft.model.state.marks.length === 22), 'a reloaded page opens the takeoff: 22 marks, the drawing is "not open"');
  ok(/kitchen-count\.dwg/.test(await page.textContent('[data-missing]') + ''), 'and names the drawing it needs (listed under Sheets)');
  await openFile(KITCHEN);
  await page.waitForTimeout(500);
  ok(await T(() => window.takeoffcraft.model.state.marks.length === 22) && (await page.$('[data-missing] .tc-missing')) === null, 'opening the same drawing again finds it by hash: the marks are on its sheet, nothing missing');

  // ---- geometry
  await fresh();
  await openFile(GEOM);
  ok(/Drawing units \(inches\)/.test(await page.textContent('.tc-sheets')), 'geometry-measure.dwg opens: Model with the drawing\'s units');
  await page.click('[data-item-new]'); await page.fill('#tc-new-name', 'Edge'); await page.selectOption('#tc-new-type', 'linear'); await page.click('[data-item-form] button[type="submit"]');
  await page.click('[data-tool="cadgeom"]');
  const box = await page.locator('canvas[data-over]').boundingBox();
  const g0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.mouse.move(box.x + 24, box.y + 90); await page.mouse.down(); await page.mouse.move(box.x + box.width - 24, box.y + box.height - 24, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(400);
  const selIds = await T(() => window.takeoffcraft.cad.geometry().selected);
  const sel = selIds.length;
  ok(sel >= 6, 'a window picks the drawing\'s objects: ' + sel + ' of 8 (the circle may sit on the window edge)');
  ok(/runs:/.test(await page.textContent('[data-geom-summary]')) && /hatch is left out/.test(await page.textContent('[data-geom-summary]')), 'the bar totals them and says the hatch is left out: ' + await page.textContent('[data-geom-summary]'));
  await page.click('[data-geom-add]');
  await page.waitForTimeout(500);
  const q = await T(() => window.takeoffcraft.quantities()[0]);
  const want = (120 + 25 * Math.PI + 400 + 200 + 20 * Math.PI + 250 + 193.7665) / 12 + (selIds.includes(2) ? 60 * Math.PI / 12 : 0);   // id 2 is the circle
  ok(Math.abs(q.qty - want) / want < 1e-3, `Add: the Edge item totals ${q.qty.toFixed(3)} LF (hand value ${want.toFixed(3)} LF)`);
  ok(await T((u) => window.takeoffcraft.model.undoStack.length === u + 1, g0), 'in ONE undo step');
  await page.screenshot({ path: path.join(OUT, 'cad-geometry.png') });

  // ---- linked drawing
  await fresh();
  await openFile(path.join(DWG, 'kitchen-equipment.dwg'));
  ok(/linked drawing \(xref\) was not found/.test(await status()), 'kitchen-equipment.dwg: the missing linked drawing is said: ' + (await status()).slice(0, 80));
  ok(await T(() => window.takeoffcraft.files[0].cad.xrefs.some((x) => !x.loaded)), '…and listed as not loaded');
  await openFile(path.join(DWG, 'base-plan.dwg'));
  ok(/Found a linked drawing among the open files: base-plan/.test(await status()), 'opening base-plan.dwg finds it: ' + (await status()).slice(0, 90));
  ok(await T(() => window.takeoffcraft.files[0].cad.xrefs.every((x) => x.loaded)), '…the xref is loaded now');

  // ---- model theme
  await fresh('model');
  await openFile(KITCHEN);
  await showSheet(1);
  await page.screenshot({ path: path.join(OUT, 'cad-sheet-model.png') });
} catch (err) {
  ok(false, 'run: ' + (err.stack || err).toString().split('\n').slice(0, 5).join(' | '));
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* the test admin is disabled by `down` */ }
}
for (const p of problems) console.log('    ! ' + p);
ok(problems.length === 0, 'no console errors or page errors');
console.log(`\n${pass} passed, ${fail} failed (shots in ${OUT})`);
process.exit(fail ? 1 : 0);
