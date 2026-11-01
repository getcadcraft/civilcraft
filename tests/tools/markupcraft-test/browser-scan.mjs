#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft and other programs' files in a real (headless) browser, against the live vhost (0.7.1 71.4, 71.5):
 *   node tools/markupcraft-test/browser-scan.mjs [--out tmp/shots/markupcraft-scan] [--big <pdf>]
 *
 * 71.5 Scanned pages: opens fixtures/pdf/scan-filters.pdf (one picture-only page per image filter: JPEG, CCITT G4 image
 * and stencil mask, JBIG2, JPEG 2000, 1-bit Flate, a 200 × 200 in page, a turned 300 dpi scan) and checks that every page's
 * picture is drawn (dark ink on the sheet, not blank, not inverted) once the crisp render is in; then the 36 × 48 in
 * 400 dpi sheet (G4 and JBIG2, 276 megapixels each) from testfiles/generated/markup when it is there.
 * 71.4 Text boxes from another program: a FreeText with a pale border and black text (/DA, /DS, /RC and an appearance
 * stream, as other markup programs write it) reads dark in Paper space and light in Model space.
 * 71.10 Read text (OCR): on the scan fixture's 300 dpi page, run from File › Pages, with progress and Stop; Find finds the
 * words, Select text copies a paragraph, Save writes a text layer pdf.js reads back; the offline list carries the engine
 * and every language; no request leaves getcadcraft.com while it runs. (--no-ocr skips it.)
 * Signs in the MarkupCraft test admin with a minted session (admin.php session; disabled again at the end unless another
 * MarkupCraft browser run is going). Fails on any console error. Run as root.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));
const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-scan');
const SCANS = path.join(REPO, 'fixtures/pdf/scan-filters.pdf');
const BIG = args.includes('--big') ? path.resolve(args[args.indexOf('--big') + 1]) : path.join(REPO, '../testfiles/generated/markup/scan-sheet-36x48-400dpi.pdf');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-scan-'));

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const noRecover = async (pg) => {
  const n = await pg.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  const d = n ? await pg.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 10000 }).catch(() => null) : null;
  if (d) { await pg.click('[data-autosave-discard-all]'); await pg.waitForSelector('dialog[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
};

/** A page with a text box like another markup program writes: pale border (no width), black text everywhere. */
async function freeTextPdf(file) {
  const doc = await PDFLib.PDFDocument.create();
  const page = doc.addPage([612, 792]);
  const ctx = doc.context;
  const S = (x) => PDFLib.PDFString.of(x);
  const ap = ctx.register(ctx.flateStream('1 1 0.8 rg 100 600 300 60 re f BT 0 0 0 rg /Helv 20 Tf 106 620 Td (BARELY VISIBLE BEFORE) Tj ET',
    { Type: 'XObject', Subtype: 'Form', BBox: [100, 600, 400, 660], Resources: { Font: { Helv: { Type: 'Font', Subtype: 'Type1', BaseFont: 'Helvetica' } } } }));
  const a = ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'FreeText', Rect: [100, 600, 400, 660], F: 4, C: [0.85, 0.85, 0.85], BS: { W: 0 },
    Contents: PDFLib.PDFHexString.fromText('BARELY VISIBLE BEFORE'), DA: S('0 0 0 rg /Helv 20 Tf'),
    DS: S('font: Helvetica 20pt; text-align:left; color:#000000'),
    RC: S('<?xml version="1.0"?><body xmlns="http://www.w3.org/1999/xhtml"><p><span style="font-size:20pt;color:#000000">BARELY VISIBLE BEFORE</span></p></body>'),
    T: PDFLib.PDFHexString.fromText('Other Tool User'), AP: { N: ap } }));
  page.node.set(PDFLib.PDFName.of('Annots'), ctx.obj([a]));
  fs.writeFileSync(file, await doc.save());
}

const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
const state = { cookies: [{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }], origins: [] };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, storageState: state, acceptDownloads: true });
await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
const outside = [];   // requests to anywhere but this site (OCR must not fetch from a CDN)
ctx.on('request', (r) => { const u = new URL(r.url()); if (/^https?:$/.test(u.protocol) && u.hostname !== 'getcadcraft.com') outside.push(r.url()); });
await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Scan Tester')); } catch { /* */ } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) problems.push(r.status() + ': ' + r.url()); });

/** Wait for the crisp render of the sheet on screen, then measure the base canvas inside the sheet: share of dark / light pixels. */
const crisp = (ms = 60000) => page.waitForFunction(() => { const v = window.markupcraft.view; return v.page && v.crisp && Math.abs(v.crisp.z - v.z) < 1e-9; }, null, { timeout: ms });
const measure = (box = null) => page.evaluate((box) => {
  const v = window.markupcraft.view, c = document.querySelector('[data-base]');
  const r = box ? [v.toScreen([box[0], box[1]]), v.toScreen([box[2], box[3]])] : [v.toScreen([v.page.view[0], v.page.view[1]]), v.toScreen([v.page.view[2], v.page.view[3]])];
  const d = v.dpr;
  const x0 = Math.max(0, Math.floor(Math.min(r[0][0], r[1][0]) * d) + 2), x1 = Math.min(c.width, Math.ceil(Math.max(r[0][0], r[1][0]) * d) - 2);
  const y0 = Math.max(0, Math.floor(Math.min(r[0][1], r[1][1]) * d) + 2), y1 = Math.min(c.height, Math.ceil(Math.max(r[0][1], r[1][1]) * d) - 2);
  const px = c.getContext('2d').getImageData(x0, y0, Math.max(1, x1 - x0), Math.max(1, y1 - y0)).data;
  let dark = 0, light = 0, min = 255, max = 0;
  for (let i = 0; i < px.length; i += 4) { const l = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]; if (l < 100) dark++; if (l > 170) light++; if (l < min) min = l; if (l > max) max = l; }
  const n = px.length / 4;
  return { dark: +(100 * dark / n).toFixed(2), light: +(100 * light / n).toFixed(2), min: Math.round(min), max: Math.round(max), w: x1 - x0, h: y1 - y0 };
}, box);

try {
  console.log('\n== 71.5 Scanned pages: every image filter draws');
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  await page.setInputFiles('[data-file]', SCANS);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 8 && window.markupcraft.view.page, null, { timeout: 60000 });
  const names = ['JPEG (DCT)', 'CCITT G4 image', 'CCITT G4 stencil mask', 'JBIG2 (MMR)', 'JPEG 2000', '1-bit Flate', '200 × 200 in page', 'turned 300 dpi JPEG'];
  const ink = [];
  for (let i = 0; i < 8; i++) {
    const t0 = Date.now();
    await page.evaluate((i) => window.markupcraft.goTo(i), i);
    await crisp();
    const m = await measure();
    ink.push(m.dark);
    // the page is a white sheet with lines of black text: a few % dark, most of it light (not blank, not inverted)
    const want = i === 6 ? m.dark > 0.1 : m.dark > 0.5;
    ok(want && m.light > 80, (i + 1) + ' ' + names[i] + ': the picture is drawn (' + m.dark + ' % ink, ' + (Date.now() - t0) + ' ms)', m);
    await page.screenshot({ path: path.join(OUT, 'scan-' + (i + 1) + '.png') });
  }
  const ref = ink[0];
  ok([1, 2, 3, 4, 5].every((i) => Math.abs(ink[i] - ref) < ref * 0.35), 'the same page through each filter has about the same ink', ink);
  const noText = await page.evaluate(async () => { const f = window.markupcraft.files[0]; const p = await f.doc.getPage(1); return (await p.getTextContent()).items.length; });
  ok(noText === 0, 'and no text layer: a scan is only a picture (search needs OCR, 71.10)');
  // Model space draws the scan ink-on-dark
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await page.evaluate(() => window.markupcraft.goTo(1));
  await crisp();
  const mm = await measure();
  ok(mm.light > 0.5 && mm.dark > 50, 'Model space: the scan turns light-on-dark (' + mm.light + ' % light)', mm);
  await page.screenshot({ path: path.join(OUT, 'scan-model.png') });
  await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });

  if (fs.existsSync(BIG)) {
    console.log('\n== 71.5 A 36 × 48 in sheet scanned at 400 dpi (14400 × 19200 px, G4 and JBIG2)');
    await page.evaluate(() => window.markupcraft.files.length);
    const t0 = Date.now();
    await page.setInputFiles('[data-file]', BIG);
    await page.waitForFunction(() => window.markupcraft?.sheets.length === 10, null, { timeout: 120000 });
    for (let i = 8; i < 10; i++) {
      const t1 = Date.now();
      await page.evaluate((i) => window.markupcraft.goTo(i), i);
      await crisp(180000);
      const m = await measure();
      ok(m.dark > 0.5 && m.light > 80, 'big sheet ' + (i === 8 ? 'G4' : 'JBIG2') + ': drawn (' + m.dark + ' % ink, ' + (Date.now() - t1) + ' ms)', m);
      await page.screenshot({ path: path.join(OUT, 'big-' + (i - 7) + '.png') });
    }
    console.log('  (open + both pages ' + (Date.now() - t0) + ' ms)');
  } else console.log('  (no ' + path.relative(REPO, BIG) + ': the big sheet is skipped; make it with make-scan-pdfs.py --big)');

  console.log('\n== 71.4 A text box from another program in Paper and Model space');
  const ft = path.join(TMP, 'other-program-text-box.pdf');
  await freeTextPdf(ft);
  await page.setInputFiles('[data-file]', ft);
  await page.waitForFunction(() => window.markupcraft.files.some((f) => f.name === 'other-program-text-box.pdf'), null, { timeout: 30000 });
  const k = await page.evaluate(() => window.markupcraft.sheets.findIndex((s) => s.file.name === 'other-program-text-box.pdf'));
  await page.evaluate((k) => window.markupcraft.goTo(k), k);
  await crisp();
  const mk = await page.evaluate(() => [...window.markupcraft.store.markups.values()].find((m) => m.type === 'text')?.style);
  ok(mk && mk.color === '#000000' && mk.fontSize === 20, 'the text box opens editable with black 20 pt text (its border is pale grey, its text is not)', mk);
  const tp = await measure([104, 604, 396, 656]);
  ok(tp.min < 60 && tp.dark > 3, 'Paper space: the words are dark on the page (min ' + tp.min + ', ' + tp.dark + ' % dark)', tp);
  await page.screenshot({ path: path.join(OUT, 'freetext-paper.png') });
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await crisp();
  const tm = await measure([104, 604, 396, 656]);
  ok(tm.max > 120, 'Model space: the same words are lightened on the dark sheet (max ' + tm.max + ')', tm);
  await page.screenshot({ path: path.join(OUT, 'freetext-model.png') });
  await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });

  if (!args.includes('--no-ocr')) {
    console.log('\n== 71.10 Read text (OCR) on a scan, Find, Select text, Save');
    const p2 = await ctx.newPage();
    p2.on('console', (m) => { if (m.type() === 'error') problems.push('ocr console: ' + m.text()); });
    p2.on('pageerror', (e) => problems.push('ocr pageerror: ' + e.message + ' ' + String(e.stack || '').split('\n').slice(0, 4).join(' | ')));
    p2.on('response', (r) => { if (r.status() >= 400) problems.push('ocr ' + r.status() + ': ' + r.url()); });
    await p2.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
    await noRecover(p2);
    const off = await p2.evaluate(() => JSON.parse(document.getElementById('cc-offline').textContent).urls);
    const offHas = (re) => off.some((u) => re.test(u));
    ok(offHas(/\/assets\/vendor\/tesseract\/[\d.]+\/worker\.min\.js/) && offHas(/tesseract-core-simd-lstm\.wasm\.js/) && offHas(/tesseract-core-lstm\.wasm\.js/) && !offHas(/traineddata/),
      '"Save for offline" carries the OCR worker and the engine builds (pinned), no language data in the fixed list', off.filter((u) => /tess/.test(u)));
    const extra = await p2.evaluate(() => window.ccOfflineExtra());
    ok(extra.length === 1 && /\/tessdata\/4\.1\.0\/eng\.traineddata\.gz$/.test(extra[0]), 'and English data from the app (an English page)', extra);
    const p3 = await ctx.newPage();
    await p3.goto(BASE + '/lab/markupcraft?space=paper&lang=de', { waitUntil: 'networkidle' });
    const extraDe = await p3.evaluate(() => window.ccOfflineExtra());
    ok(extraDe.length === 2 && extraDe.some((u) => /deu\.traineddata\.gz$/.test(u)) && extraDe.some((u) => /eng\.traineddata\.gz$/.test(u)), 'a German page keeps German and English data offline', extraDe);
    await p3.close();
    const ds = await p2.evaluate(() => ({ ...document.querySelector('[data-markupcraft]').dataset }));
    ok(/\/assets\/vendor\/tesseract\/7\.0\.0\/worker\.min\.js$/.test(ds.ocrWorker) && /\/tessdata\/4\.1\.0\/eng\.traineddata\.gz$/.test(ds.ocrData), 'the page names pinned local OCR paths', ds);
    const engineLoaded = () => p2.evaluate(() => performance.getEntriesByType('resource').some((r) => /tesseract|tessdata/.test(r.name)));
    await p2.setInputFiles('[data-file]', SCANS);
    await p2.waitForFunction(() => window.markupcraft?.sheets.length === 8 && window.markupcraft.view.page, null, { timeout: 60000 });
    ok(!(await engineLoaded()), 'nothing of the OCR engine loads until it is run');
    await p2.evaluate(() => window.markupcraft.goTo(7));
    const o1 = outside.length;
    // run it from File › Pages › Read text (OCR)
    await p2.click('[data-pages-menu] > summary');
    await p2.click('[data-pages-menu] [data-act="ocr"]');
    await p2.waitForSelector('dialog.mc-dialog #mc-ocr-scope');
    await p2.selectOption('#mc-ocr-scope', 'sheet');
    ok(await p2.$eval('#mc-ocr-lang', (s) => s.value) === 'eng', 'English by default on an English page');
    const t0 = Date.now();
    await p2.click('dialog.mc-dialog button[data-key="go"]');
    await p2.waitForSelector('dialog[data-ocr-progress]', { timeout: 10000 });
    const sawProgress = await p2.waitForFunction(() => +document.querySelector('dialog[data-ocr-progress] progress')?.value > 0, null, { timeout: 60000 }).then(() => true, () => false);
    await p2.waitForSelector('dialog[data-ocr-progress]', { state: 'detached', timeout: 180000 });
    const ms = Date.now() - t0;
    const st = await p2.locator('[data-status]').innerText();
    ok(sawProgress && /Read the text of 1 page \(\d+ words\)/.test(st), 'the page is read with a progress bar (' + ms + ' ms, first run incl. loading)', st);
    const ocr = await p2.evaluate(() => { const f = window.markupcraft.files[0]; const o = f.ocr?.get(7); return o && { words: o.words, conf: o.conf, pdf: o.pdf?.length || 0 }; });
    ok(ocr && ocr.words > 140 && ocr.pdf > 1000, 'its words and text layer are kept on the file (not in the markups)', ocr);
    ok(await p2.evaluate(() => window.markupcraft.store.markups.size) === 0, 'no markups were added');
    ok(outside.length === o1, 'no request left the site while reading', outside.slice(o1));
    // Find
    await p2.evaluate(() => { document.querySelector('[data-find]').open = true; });
    await p2.fill('[data-find-q]', 'egress');
    await p2.press('[data-find-q]', 'Enter');
    await p2.waitForFunction(() => document.querySelectorAll('[data-find-list] button[data-hit]').length > 0, null, { timeout: 15000 }).catch(() => {});
    const hits = await p2.evaluate(() => document.querySelectorAll('[data-find-list] button[data-hit]').length);
    ok(hits >= 7, 'Find finds "egress" on the scan (' + hits + ' hits)');
    await p2.screenshot({ path: path.join(OUT, 'ocr-find.png') });
    // Select text: drag over the first paragraph, Ctrl+C
    await p2.click('details[data-edit-menu] > summary');   // Edit › More › Select text to copy
    await p2.click('details[data-edit-menu] [data-act="seltext"]');
    const box = await p2.locator('[data-over]').boundingBox();
    const ends = await p2.evaluate(async () => {
      const v = window.markupcraft.view, f = window.markupcraft.files[0], items = f.ocr.get(7).items;
      const a = items.find((i) => i.str === 'R311.1'), b = items.find((i) => i.str === 'garage.');
      const mid = (i) => v.toScreen([i.transform[4] + i.width / 2, i.transform[5] + 3]);
      return [mid(a), mid(b)];
    });
    await p2.mouse.move(box.x + ends[0][0], box.y + ends[0][1]);
    await p2.mouse.down();
    await p2.mouse.move(box.x + (ends[0][0] + ends[1][0]) / 2, box.y + (ends[0][1] + ends[1][1]) / 2, { steps: 4 });
    await p2.mouse.move(box.x + ends[1][0], box.y + ends[1][1], { steps: 4 });
    await p2.mouse.up();
    await p2.keyboard.press('Control+c');
    await p2.waitForFunction(() => !!window.markupcraft.lastTextCopy, null, { timeout: 5000 }).catch(() => {});
    const copied = await p2.evaluate(() => window.markupcraft.lastTextCopy || '');
    const clip = await p2.evaluate(() => navigator.clipboard.readText().catch(() => ''));
    ok(copied.startsWith('R311.1 Means of egress.') && copied.endsWith('garage.') && clip === copied, 'Select text: a drag + Ctrl+C puts the paragraph on the clipboard', copied.slice(0, 60));
    await p2.screenshot({ path: path.join(OUT, 'ocr-select.png') });
    // Stop: read every page of the file, stop after it starts
    await p2.click('[data-tool="select"]');
    await p2.evaluate(() => { window.__ocrRun = window.markupcraft.ocr.run(); });
    await p2.waitForSelector('dialog.mc-dialog #mc-ocr-scope');
    await p2.selectOption('#mc-ocr-scope', 'file');
    await p2.click('dialog.mc-dialog button[data-key="go"]');
    await p2.waitForFunction(() => /Reading/.test(document.querySelector('dialog[data-ocr-progress]')?.textContent || ''), null, { timeout: 60000 });
    await p2.click('dialog[data-ocr-progress] [data-ocr-cancel]');
    await p2.waitForSelector('dialog[data-ocr-progress]', { state: 'detached', timeout: 30000 });
    const st2 = await p2.locator('[data-status]').innerText();
    ok(/^Stopped:/.test(st2), 'Stop ends the run; the status says what was read', st2);
    // Save: the text layer goes into the PDF
    await p2.locator('[data-over]').focus();
    const dlP = p2.waitForEvent('download', { timeout: 60000 });
    await p2.keyboard.press('Control+s');
    const one = await p2.waitForSelector('dialog.mc-dialog button[data-key="one"]', { timeout: 1500 }).catch(() => null);
    if (one) await one.click();
    const dl = await dlP;
    await p2.waitForFunction(() => /text layer/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 10000 }).catch(() => {});
    ok(/text layer on 1 page/.test(await p2.locator('[data-status]').innerText()), 'Save says the text layer went in', await p2.locator('[data-status]').innerText());
    const savedPath = path.join(TMP, 'ocr-saved.pdf');
    await dl.saveAs(savedPath);
    const pdfjs = await import(pathToFileURL(path.join(HERE, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
    const sd = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(savedPath)), isEvalSupported: false, standardFontDataUrl: path.join(HERE, 'node_modules/pdfjs-dist/standard_fonts/') }).promise;
    const items = (await (await sd.getPage(8)).getTextContent()).items.map((i) => i.str).join(' ');
    ok(/Means of egress/.test(items) && /riser height/.test(items), 'the saved PDF has the words as text (pdf.js reads them back)', items.slice(0, 80));
    const pt = spawnSync('pdftotext', ['-f', '8', '-l', '8', savedPath, '-'], { encoding: 'utf8' });
    if (!pt.error) ok(/Means of egress/.test(pt.stdout), 'and poppler (pdftotext) does too');
    const cached = await p2.evaluate(() => new Promise((res) => {
      const rq = indexedDB.open('keyval-store');
      rq.onsuccess = () => { try { const k = rq.result.transaction('keyval').objectStore('keyval').getAllKeys(); k.onsuccess = () => res(k.result.map(String)); k.onerror = () => res([]); } catch { res([]); } };
      rq.onerror = () => res([]);
    }));
    ok(cached.some((k) => /markupcraft-tessdata-4\.1\.0\/eng\.traineddata/.test(k)), 'language data once fetched stays in this browser (works offline later)', cached);
    await p2.close();

    console.log('\n== 71.10 Autosave keeps the text read from a scan');
    const p4 = await ctx.newPage();
    await p4.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
    await noRecover(p4);
    await p4.setInputFiles('[data-file]', SCANS);
    await p4.waitForFunction(() => window.markupcraft?.sheets.length === 8 && window.markupcraft.view.page, null, { timeout: 60000 });
    await p4.evaluate(() => window.markupcraft.goTo(7));
    await p4.evaluate(() => { window.markupcraft.ocr.run(); });
    await p4.waitForSelector('#mc-ocr-scope'); await p4.selectOption('#mc-ocr-scope', 'sheet'); await p4.click('dialog.mc-dialog button[data-key="go"]');
    await p4.waitForSelector('dialog[data-ocr-progress]', { state: 'detached', timeout: 120000 });
    await p4.waitForTimeout(3500);   // the autosave runs 2 s after the last change
    await p4.close({ runBeforeUnload: false });
    const p5 = await ctx.newPage();
    p5.on('pageerror', (e) => problems.push('recover pageerror: ' + e.message));
    await p5.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
    const dlg = await p5.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 20000 }).catch(() => null);
    ok(!!dlg, 'the closed tab\'s work is offered back');
    if (dlg) {
      await p5.locator('[data-autosave-row]').filter({ hasText: 'scan-filters' }).first().locator('[data-autosave-recover]').click().catch(async () => { await p5.click('[data-autosave-recover]'); });
      await p5.waitForFunction(() => window.markupcraft?.files.some((f) => f.ocr?.get(7)?.words > 140), null, { timeout: 30000 }).catch(() => {});
      const rec = await p5.evaluate(() => { const f = window.markupcraft.files.find((x) => x.ocr); const o = f?.ocr.get(7); return o && { words: o.words, pdf: o.pdf?.length || 0 }; });
      ok(rec && rec.words > 140 && rec.pdf > 1000, 'recovered: the text read from the scan is back, no second read', rec);
      const loadedEngine = await p5.evaluate(() => performance.getEntriesByType('resource').some((r) => /tesseract|tessdata/.test(r.name)));
      ok(!loadedEngine, 'the engine did not run again');
      // the dirty copy goes away so later runs start clean
      await p5.evaluate(() => { for (const f of window.markupcraft.files) for (const pg of f.pages) window.markupcraft.store.dirtySheets.delete(pg.key); window.markupcraft.syncAutosave(); });
      await p5.waitForTimeout(500);
    }
    await p5.close({ runBeforeUnload: false });
  }

  const HARD = path.join(REPO, '../testfiles/generated/markup/scan-hard-cases.pdf');
  if (fs.existsSync(HARD)) {
    console.log('\n== Blank pages (second report): the hard kinds of scanned picture, a broken xref, damaged pictures');
    const p6 = await ctx.newPage();
    p6.on('pageerror', (e) => problems.push('hard pageerror: ' + e.message));
    await p6.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
    await noRecover(p6);
    const labels = JSON.parse(fs.readFileSync(HARD.replace(/\.pdf$/, '.json'), 'utf8')).pages;
    const measure6 = () => p6.evaluate(() => {
      const v = window.markupcraft.view, c = document.querySelector('[data-base]');
      const a = v.toScreen([v.page.view[0], v.page.view[1]]), b = v.toScreen([v.page.view[2], v.page.view[3]]), d = v.dpr;
      const x0 = Math.floor(Math.min(a[0], b[0]) * d) + 2, x1 = Math.ceil(Math.max(a[0], b[0]) * d) - 2, y0 = Math.floor(Math.min(a[1], b[1]) * d) + 2, y1 = Math.ceil(Math.max(a[1], b[1]) * d) - 2;
      const px = c.getContext('2d').getImageData(x0, y0, x1 - x0, y1 - y0).data;
      let dark = 0; for (let i = 0; i < px.length; i += 4) if (0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2] < 100) dark++;
      return { dark: +(100 * dark / (px.length / 4)).toFixed(2), failed: v.failed };
    });
    for (const [file, n] of [[HARD, labels.length], [HARD.replace(/\.pdf$/, '-broken-xref.pdf'), 3]]) {
      await p6.setInputFiles('[data-file]', file);
      await p6.waitForFunction((f) => window.markupcraft.files.some((x) => x.name === f), path.basename(file), { timeout: 120000 });
      const base = await p6.evaluate((f) => window.markupcraft.sheets.findIndex((s) => s.file.name === f), path.basename(file));
      for (let i = 0; i < n; i++) {
        const t0 = Date.now();
        await p6.evaluate((k) => window.markupcraft.goTo(k), base + i);
        await p6.waitForFunction(() => { const v = window.markupcraft.view; return v.page && v.crisp && Math.abs(v.crisp.z - v.z) < 1e-9; }, null, { timeout: 240000 });
        const m = await measure6();
        ok(m.dark > 0.3 && m.dark < 30 && !m.failed, (file.includes('broken') ? 'broken xref, ' : '') + labels[i] + ': drawn (' + m.dark + ' % ink, ' + (Date.now() - t0) + ' ms)', m);
      }
    }
    // damaged pictures: pdf.js leaves them out without an error; the sheet must say so instead of looking blank
    const PL = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
    const bd = await PL.PDFDocument.create(), bc = bd.context;
    const junk = new Uint8Array(5000).map((_, i) => (i * 7919) & 255);
    for (const f of ['JPXDecode', 'JBIG2Decode', 'DCTDecode']) {
      const im = bc.register(bc.stream(junk, { Type: 'XObject', Subtype: 'Image', Width: 1000, Height: 1300, ColorSpace: 'DeviceGray', BitsPerComponent: f === 'JBIG2Decode' ? 1 : 8, Filter: f }));
      const pg = bd.addPage([612, 792]);
      pg.node.set(PL.PDFName.of('Resources'), bc.obj({ XObject: { Im0: im } }));
      pg.node.set(PL.PDFName.of('Contents'), bc.register(bc.stream('q 612 0 0 792 0 0 cm /Im0 Do Q')));
    }
    const badPath = path.join(TMP, 'damaged-pictures.pdf');
    fs.writeFileSync(badPath, await bd.save());
    await p6.setInputFiles('[data-file]', badPath);
    await p6.waitForFunction(() => window.markupcraft.files.some((x) => x.name === 'damaged-pictures.pdf'), null, { timeout: 60000 });
    const b0 = await p6.evaluate(() => window.markupcraft.sheets.findIndex((s) => s.file.name === 'damaged-pictures.pdf'));
    for (let i = 0; i < 3; i++) {
      await p6.evaluate((k) => window.markupcraft.goTo(k), b0 + i);
      await p6.waitForFunction(() => window.markupcraft.view.failed?.kind === 'image', null, { timeout: 30000 }).catch(() => {});
      const st = await p6.locator('[data-status]').innerText();
      const f = await p6.evaluate(() => window.markupcraft.view.failed);
      ok(f?.kind === 'image' && /could not be drawn/.test(st), ['JPX', 'JBIG2', 'JPEG'][i] + ' picture with damaged data: the sheet and the status line say it could not be drawn (not a silent blank)', { f, st });
      if (i === 0) await p6.screenshot({ path: path.join(OUT, 'damaged-picture.png') });
    }
    await p6.close();
  } else console.log('  (no testfiles/generated/markup/scan-hard-cases.pdf: make it with make-scan-pdfs.py --hard <jbig2enc>)');

  ok(outside.length === 0, 'no request left getcadcraft.com', outside.slice(0, 5));
  ok(problems.length === 0, 'no console errors or failed requests', problems.slice(0, 8));
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e.message));
  await page.screenshot({ path: path.join(OUT, 'zz-failure.png') }).catch(() => {});
} finally {
  await browser.close();
  // another MarkupCraft browser run (another builder's) still needs the admin: leave it on then
  const others = spawnSync('pgrep', ['-f', 'markupcraft-test/browser'], { encoding: 'utf8' }).stdout.split('\n').filter((p) => p && +p !== process.pid);
  if (!others.length) execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down'], { stdio: 'ignore' });
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Shots in ' + path.relative(REPO, OUT) + '/');
process.exit(fail ? 1 : 0);
