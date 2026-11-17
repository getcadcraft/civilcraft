#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-countmarker.mjs — count marker size, screen against the marked PDF, in /lab/takeoffcraft (0.9.1, suggestion 1494).
 *
 *   node tools/takeoffcraft-test/browser-countmarker.mjs        (run as root; test admin via tools/takeoffcraft-test/admin.php)
 *
 * Opens a generated 24" × 36" sheet, counts a row of 12 symbols 18 pt apart (1/4" on paper) with the Count tool, measures
 * the dots on the screen's own canvas at 100% (96 px per inch), exports the marked PDF from the Export menu, reads the dot
 * radius out of the PDF and rasterises it with poppler at 96 dpi, and compares. Then Settings › TakeoffCraft › Count marker
 * size: Large and Extra small change both, the choice is kept after a reload, Reset puts medium back.
 * Screenshots in tmp/shots/takeoffcraft/countmarker-*.png.
 */
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'tmp/shots/takeoffcraft');
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'tc-marker-b-'));
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

// the sheet: 24" × 36" landscape, a border and a row of 12 little squares 18 pt apart to count
const W = 2592, H = 1728, X0 = 600, Y0 = 900, STEP = 18, N = 12;
const SHEET = path.join(TMP, 'big-sheet.pdf');
{
  const doc = await PDFLib.PDFDocument.create();
  const p = doc.addPage([W, H]);
  p.drawRectangle({ x: 36, y: 36, width: W - 72, height: H - 72, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 2 });
  for (let i = 0; i < N; i++) p.drawRectangle({ x: X0 + i * STEP - 4, y: Y0 - 4, width: 8, height: 8, borderColor: PDFLib.rgb(0.2, 0.2, 0.2), borderWidth: 0.6 });
  p.drawLine({ start: { x: X0 - 40, y: Y0 - 30 }, end: { x: X0 + N * STEP + 40, y: Y0 - 30 }, thickness: 1, color: PDFLib.rgb(0.2, 0.2, 0.2) });
  fs.writeFileSync(SHEET, await doc.save());
}

/** Dot radii in a marked PDF's first page ("r·0.25 w, x+r y m, 4 curves, h B"). */
async function pdfDots(file) {
  const d = await PDFLib.PDFDocument.load(fs.readFileSync(file));
  const c = d.getPages()[0].node.Contents();
  const text = (c.asArray ? c.asArray() : [c]).map((r) => { const o = d.context.lookup(r); try { return Buffer.from(PDFLib.decodePDFRawStream(o).decode()).toString('latin1'); } catch { return Buffer.from(o.contents).toString('latin1'); } }).join('\n');
  const num = '(-?[\\d.]+(?:e-?\\d+)?)';
  const re = new RegExp(`${num} w\\s+${num} ${num} m\\s+${num} ${num} ${num} ${num} ${num} ${num} c\\s+(?:${num} ){6}c\\s+(?:${num} ){6}c\\s+(?:${num} ){6}c\\s+h\\s+B\\b`, 'g');
  return [...text.matchAll(re)].map((m) => { const v = m.slice(1).map(Number); return { x: v[7], y: v[2], r: v[1] - v[7] }; });
}
/** Width in px of the coloured run through a dot's centre in the PDF at 96 dpi; also the widest gap of paper between the first two dots. */
function pdfRun(file, name) {
  const cx = Math.round(X0 * 96 / 72), cy = Math.round((H - Y0) * 96 / 72), w = 80;
  execFileSync('pdftoppm', ['-r', '96', '-x', String(cx - 20), '-y', String(cy), '-W', String(w), '-H', '1', file, path.join(TMP, name)]);
  const f = fs.readdirSync(TMP).find((n) => n.startsWith(name) && n.endsWith('.ppm'));
  const pgm = fs.readFileSync(path.join(TMP, f));
  const head = pgm.subarray(0, 20).toString('latin1').match(/^P6\s+(\d+)\s+(\d+)\s+(\d+)\s/);
  const px = pgm.subarray(head[0].length), row = [];
  for (let i = 0; i < w; i++) row.push(px[i * 3] > 150 && px[i * 3 + 1] < 120 && px[i * 3 + 2] < 120);   // the item's red (#D62728), not the sheet's own grey lines
  return runs(row);
}
/** First dark run's width and the gap to the next one, in a row of booleans. */
function runs(row) {
  let i = 0; while (i < row.length && !row[i]) i++;
  let j = i; while (j < row.length && row[j]) j++;
  let k = j; while (k < row.length && !row[k]) k++;
  return { width: j - i, gap: k < row.length ? k - j : null };
}

const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const T = (fn, a) => page.evaluate(fn, a);
  const open = async () => {
    await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
    await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
    if (await T(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  };
  await open();
  await T(() => localStorage.removeItem('takeoffcraft.settings'));
  await open();

  // the sheet, a count item, 12 counts with the Count tool
  await page.setInputFiles('[data-file-pdf]', SHEET);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0 && window.takeoffcraft.rendered?.() !== false, null, { timeout: 20000 });
  await page.click('[data-item-new]');
  await page.fill('#tc-new-name', 'Receptacles');
  await page.selectOption('#tc-new-type', 'count');
  await page.click('[data-item-form] button[type="submit"]');
  await page.waitForFunction(() => window.takeoffcraft.model.state.items.length === 1);
  const fitZ = await T(() => window.takeoffcraft.view.z);
  // 100%: 96 px per inch = 4/3 px per point, centred on the row
  const at100 = async () => {
    await T(([x, y]) => { const v = window.takeoffcraft.view; const s = v.toScreen({ x, y }); v.zoomAt(s.x, s.y, (96 / 72) / v.z); const s2 = v.toScreen({ x, y }); v.panBy(v.w / 2 - s2.x, v.h / 2 - s2.y); }, [X0 + N * STEP / 2, Y0]);
    await page.waitForTimeout(500);
  };
  await at100();
  ok(Math.abs(await T(() => window.takeoffcraft.view.z) - 96 / 72) < 1e-9, `the sheet at 100% (4/3 px per point; "fit page" was ${fitZ.toFixed(3)} px per point)`);
  await page.click('[data-tool="count"]');
  for (let i = 0; i < N; i++) { const s = await T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [X0 + i * STEP, Y0]); await page.mouse.click(s.x, s.y); }
  await page.keyboard.press('Escape');
  await page.click('[data-tool="select"]').catch(() => {});
  await page.mouse.move(200, 700);
  await page.waitForFunction((n) => window.takeoffcraft.model.state.marks.length === n, N);
  ok(true, `${N} counts placed with the Count tool, ${STEP} pt apart`);

  // the dot on the screen's own canvas: the coloured run through the first dot's centre, and the gap to the next
  const screenRun = (x0 = X0) => T(([x, y]) => {
    const tc = window.takeoffcraft, color = tc.model.state.items[0].color, n = parseInt(color.slice(1), 16), rgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    const s = tc.toScreen({ x, y });
    for (const c of document.querySelectorAll('canvas')) {
      const r = c.getBoundingClientRect();
      if (s.x < r.left || s.x > r.right || s.y < r.top || s.y > r.bottom || !c.width) continue;
      let g; try { g = c.getContext('2d'); } catch { continue; }
      if (!g) continue;
      const k = c.width / r.width, px = Math.round((s.x - r.left) * k), py = Math.round((s.y - r.top) * k);
      const d = g.getImageData(px - 20, py, 80, 1).data;
      const row = []; for (let i = 0; i < 80; i++) row.push(d[i * 4 + 3] > 128 && Math.abs(d[i * 4] - rgb[0]) < 60 && Math.abs(d[i * 4 + 1] - rgb[1]) < 60 && Math.abs(d[i * 4 + 2] - rgb[2]) < 60);
      if (row.some(Boolean)) return { row, k };
    }
    return null;
  }, [x0, Y0]);
  const measure = async (x0) => { const r = await screenRun(x0); return r ? { ...runs(r.row), k: r.k } : null; };
  const exportPdf = async (name) => {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), (async () => { await page.click('[data-export-menu] > summary'); await page.click('[data-export-menu] [data-act="export-pdf"]'); })()]);
    const f = path.join(TMP, name + '.pdf'); await dl.saveAs(f); return f;
  };
  const clip = async () => { const a = await T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [X0, Y0]); return { x: Math.round(a.x - 100), y: Math.round(a.y - 150), width: 480, height: 300 }; };
  const pdfShot = (file, name) => execFileSync('pdftoppm', ['-r', '96', '-x', String(Math.round(X0 * 96 / 72) - 100), '-y', String(Math.round((H - Y0) * 96 / 72) - 150), '-W', '480', '-H', '300', '-png', '-singlefile', file, path.join(OUT, name)]);

  // medium (the default)
  let scr = await measure();
  ok(scr && Math.abs(scr.width - 10.5) <= 1.5 && scr.gap >= 10, `screen, medium: the coloured dot is ${scr?.width} px across (6 px radius less half the white outline), ${scr?.gap} px clear to the next`, JSON.stringify(scr));
  await page.screenshot({ path: path.join(OUT, 'countmarker-01-screen-medium.png'), clip: await clip() });
  let pf = await exportPdf('medium');
  let ds = await pdfDots(pf);
  ok(ds.length === N && ds.every((d) => Math.abs(d.r - 4.5) < 1e-3), `PDF, medium: ${ds.length} dots of radius 4.5 pt on the 24" × 36" sheet (the old export drew 10.08 pt: 20 pt dots on ${STEP} pt centres)`, JSON.stringify(ds.slice(0, 2)));
  let pr = pdfRun(pf, 'm');
  ok(Math.abs(pr.width - scr.width) <= 1 && pr.gap !== null && Math.abs(pr.gap - scr.gap) <= 2, `PDF at 96 dpi against the screen at 100%: dot ${pr.width} px vs ${scr.width} px, gap ${pr.gap} px vs ${scr.gap} px`);
  pdfShot(pf, 'countmarker-01-pdf-medium');

  // Settings › TakeoffCraft › Count marker size
  const setSize = async (v, shot) => {
    await page.click('[data-settings-open]');
    await page.waitForSelector('[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]');
    await page.locator('.shell-sec-nav button', { hasText: 'Count marker size' }).click();
    await page.locator(`label:has(input[name="tcMarker"][value="${v}"])`).click();   // the segmented control hides the radio itself
    if (shot) await page.screenshot({ path: path.join(OUT, shot) });
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.querySelector('[data-app-settings][open]'));
    await page.waitForTimeout(300);
  };
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  ok(await T(() => { const f = document.querySelector('[data-tc-marker]'); return !!f && f.querySelector('legend').textContent.trim() === 'Count marker size' && [...f.querySelectorAll('input[name="tcMarker"]')].map((r) => r.value).join() === 'xsmall,small,medium,large' && f.querySelector('input[name="tcMarker"]:checked')?.value === 'medium'; }), 'Settings › TakeoffCraft has "Count marker size": Extra small, Small, Medium, Large; Medium is on at the start');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('[data-app-settings][open]'));

  await setSize('large', 'countmarker-02-settings.png');
  ok(await T(() => JSON.parse(localStorage.getItem('takeoffcraft.settings')).marker === 'large'), 'Large is stored with the other TakeoffCraft settings (localStorage takeoffcraft.settings)');
  scr = await measure();
  ok(scr && Math.abs(scr.width - 14) <= 1.5, `screen, large: ${scr?.width} px across (8 px radius)`, JSON.stringify(scr));
  await page.screenshot({ path: path.join(OUT, 'countmarker-03-screen-large.png'), clip: await clip() });
  pf = await exportPdf('large'); ds = await pdfDots(pf); pr = pdfRun(pf, 'l');
  ok(ds.length === N && ds.every((d) => Math.abs(d.r - 6) < 1e-3), 'PDF, large: radius 6 pt (8 px × 0.75)', JSON.stringify(ds.slice(0, 2)));
  ok(Math.abs(pr.width - scr.width) <= 1, `PDF at 96 dpi against the screen: ${pr.width} px vs ${scr.width} px`);
  pdfShot(pf, 'countmarker-03-pdf-large');

  await setSize('xsmall');
  scr = await measure();
  ok(scr && Math.abs(scr.width - 5.25) <= 1.5, `screen, extra small: ${scr?.width} px across (3 px radius)`, JSON.stringify(scr));
  const xsAt100 = scr.width;
  pf = await exportPdf('xsmall'); ds = await pdfDots(pf); pr = pdfRun(pf, 'x');
  ok(ds.length === N && ds.every((d) => Math.abs(d.r - 2.25) < 1e-3), 'PDF, extra small: radius 2.25 pt', JSON.stringify(ds.slice(0, 2)));
  ok(Math.abs(pr.width - scr.width) <= 1, `PDF at 96 dpi against the screen: ${pr.width} px vs ${scr.width} px`);

  // a small dot can still be picked
  await page.click('[data-tool="select"]').catch(() => {});
  { const s = await T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [X0 + 3 * STEP, Y0]); await page.mouse.click(s.x + 2, s.y + 2); }
  ok((await T(() => window.takeoffcraft.selection().length)) === 1, 'an extra-small dot is still picked by a click on it');
  await page.keyboard.press('Escape');

  // the size holds at every zoom on screen; kept after a reload; Reset puts medium back
  await T(() => window.takeoffcraft.view.fit('page'));
  await page.waitForTimeout(400);
  scr = await measure(X0 + (N - 1) * STEP);   // the last dot: drawn on top, its neighbours crowd in at this zoom
  ok(scr && Math.abs(scr.width - xsAt100) <= 1.5, `at "fit page" the screen dot is ${scr?.width} px across, as at 100% (${xsAt100} px): the screen size never follows the zoom`);
  await open();
  ok(await T(() => JSON.parse(localStorage.getItem('takeoffcraft.settings')).marker === 'xsmall'), 'the choice is kept after a reload');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  ok(await T(() => document.querySelector('input[name="tcMarker"]:checked')?.value === 'xsmall'), 'and the dialog shows it');
  await page.click('[data-settings-reset]');
  await page.waitForTimeout(300);
  ok(await T(() => document.querySelector('input[name="tcMarker"]:checked')?.value === 'medium' && !JSON.parse(localStorage.getItem('takeoffcraft.settings') || '{}').marker), 'Reset TakeoffCraft settings puts Medium back');
  await page.keyboard.press('Escape');

  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* already down */ }
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(ROOT, OUT)}`);
process.exit(fail ? 1 : 0);
