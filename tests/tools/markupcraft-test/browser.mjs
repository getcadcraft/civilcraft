#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft in a real (headless) browser, against the live vhost:
 *   node tools/markupcraft-test/browser.mjs [--out tmp/shots/markupcraft] [--keep-admin]
 *
 * Signs in a dedicated test admin (admin.php up/down — disabled again at the end), opens /lab/markupcraft,
 * opens the public kitchen plan sheet (fixtures/pdf/kitchen-plan-sheet.pdf) + a generated revision, draws every kind of markup with scripted pointer
 * events, moves/resizes/undoes, sets a status, a punch item, a tool, compares the two sheets, saves,
 * re-reads the saved PDF with pdf.js (annotation subtypes, /T, appearance streams) and pdf-lib (/NM),
 * reopens it (markups editable again), then the Edit group (Copy, Paste, Undo, Redo, the More menu, the keys),
 * Settings › MarkupCraft (kept, used, reset keeps the name) and a paste in a second tab (incl. a tampered copy),
 * and screenshots both themes. Fails on any console error.
 * Run as root (it calls `sudo -u www-data php` for the admin). Client drawings are read in place.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const pdfjs = await import(path.join(HERE, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs'));
const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));

const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft');
const STD_FONTS = path.join(HERE, 'node_modules/pdfjs-dist/standard_fonts/');
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');   // public fixture (0.4 item 0.7)
const FACTS = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/facts.json'), 'utf8'));
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
/** Poll an async check in the page (waitForFunction would take its Promise as a truthy answer at once). */
const until = async (pg, fn, arg, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await new Promise((r) => setTimeout(r, 400)); } return false; };
// Autosave (0.4 item 1.2): a tab closed with unsaved work leaves a copy that the next page offers back. Tests that open
// a fresh tab say "Discard all" to that offer unless they are testing it.
const noRecover = async (pg) => {
  const n = await pg.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  const d = n ? await pg.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 10000 }).catch(() => null) : null;
  if (d) { await pg.click('[data-autosave-discard-all]'); await pg.waitForSelector('dialog[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
};

// ---- a revision of the kitchen plan sheet for compare: same drawing moved 6 pt, plus new and missing work ----
async function makeRevision(file) {
  const src = await PDFLib.PDFDocument.load(fs.readFileSync(PLAN));
  const doc = await PDFLib.PDFDocument.create();
  const [emb] = await doc.embedPdf(src, [0]);
  const page = doc.addPage([emb.width, emb.height]);
  page.drawPage(emb, { x: 6, y: -4 });
  page.drawRectangle({ x: 300, y: 300, width: 260, height: 140, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 2 });
  page.drawLine({ start: { x: 700, y: 200 }, end: { x: 1100, y: 600 }, thickness: 3 });
  page.drawRectangle({ x: 820, y: 1200, width: 200, height: 160, color: PDFLib.rgb(1, 1, 1) });   // "removed" work
  doc.setTitle('Kitchen plan revision B');
  fs.writeFileSync(file, await doc.save());
}
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-browser-'));
const REV = path.join(TMP, 'markupcraft-kitchen-rev-B.pdf');
await makeRevision(REV);

// ---- admin session ----
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'up'], { encoding: 'utf8' }));

const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
// 0.5 SI.9: signed in, MarkupCraft takes the name from the account (no dialog). This run checks the name dialog, the
// signed-out path, so the page's #cc-account is taken out; tools/shell-test/browser-author.mjs checks the signed-in one.
await ctx.route(/\/lab\/markupcraft(\?[^/]*)?$/, async (route) => {
  const res = await route.fetch();
  await route.fulfill({ response: res, body: (await res.text()).replace(/<script type="application\/json" id="cc-account">[^<]*<\/script>\s*/, '') });
});
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) problems.push(r.status() + ': ' + r.url()); });

try {
  console.log('\n== Sign in and open the lab');
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  ok(await page.locator('[data-markupcraft]').count() === 1, '/lab/markupcraft renders the MarkupCraft UI');
  await page.screenshot({ path: path.join(OUT, '01-empty-paper.png') });

  console.log('\n== Open a plan set (two files)');
  await page.setInputFiles('[data-file]', [PLAN, REV]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 2 && window.markupcraft.view.page, null, { timeout: 30000 });
  ok(await page.locator('.mc-sheet').count() === 2, 'sheets list shows 2 sheets');
  await page.waitForFunction(() => document.querySelectorAll('.mc-thumb.is-ready').length === 2, null, { timeout: 15000 }).catch(() => {});
  ok(await page.locator('.mc-thumb.is-ready').count() === 2, 'both thumbnails rendered');
  await page.fill('[data-sheet-search]', 'rev-B');
  ok(await page.locator('.mc-sheet').count() === 1, 'sheet search filters by name');
  await page.fill('[data-sheet-search]', '');
  await page.waitForTimeout(400);

  // user space → page pixels
  const box = await page.locator('[data-over]').boundingBox();
  const at = async (x, y) => { const [sx, sy] = await page.evaluate(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]); return [box.x + sx, box.y + sy]; };
  const dragUser = async (pts, opts = {}) => {
    const [x0, y0] = await at(...pts[0]);
    await page.mouse.move(x0, y0);
    await page.mouse.down();
    for (const p of pts.slice(1)) { const [x, y] = await at(...p); await page.mouse.move(x, y, { steps: opts.steps || 6 }); }
    await page.mouse.up();
  };
  const clickUser = async (x, y, opts) => { const [a, b] = await at(x, y); await page.mouse.click(a, b, opts); };
  const count = () => page.evaluate(() => window.markupcraft.store.all().length);
  const over = page.locator('[data-over]');

  console.log('\n== Draw markups');
  await over.focus();
  await page.keyboard.press('c');
  await page.waitForSelector('dialog.mc-dialog[open]');
  await page.fill('#mc-dlg-author', 'Test Reviewer');
  await page.click('dialog.mc-dialog button[data-key="save"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok(await page.locator('[data-author]').innerText() === 'Test Reviewer', 'author asked once and shown');
  await dragUser([[300, 1450], [560, 1300]]);
  await over.focus(); await page.keyboard.press('a');
  await dragUser([[650, 900], [760, 760]]);
  await page.keyboard.press('r');
  await dragUser([[120, 120], [330, 260]]);
  await page.keyboard.press('e');
  await dragUser([[1000, 120], [1180, 260]]);
  await page.keyboard.press('l');
  await dragUser([[100, 700], [280, 700]]);
  await page.keyboard.press('p');
  await dragUser([[900, 1500], [940, 1540], [990, 1500], [1040, 1550], [1090, 1490]], { steps: 4 });
  await page.keyboard.press('i');
  await dragUser([[450, 1000], [700, 1000]]);
  await page.keyboard.press('Shift+C');
  for (const p of [[720, 400], [900, 380], [950, 520], [760, 560]]) await clickUser(...p);
  await page.keyboard.press('Enter');
  await page.keyboard.press('g');
  for (const p of [[150, 400], [260, 380], [280, 480]]) await clickUser(...p);
  await page.keyboard.press('Enter');
  await page.keyboard.press('y');
  for (const p of [[1050, 700], [1150, 760], [1100, 840]]) await clickUser(...p);
  await page.keyboard.press('Enter');
  await page.keyboard.press('k');
  await dragUser([[620, 1180], [700, 1260]]);
  await page.waitForSelector('[data-edit]:not([hidden])');
  await page.keyboard.type('Move prep sink 6" east (coordinate with plumbing).');
  await page.keyboard.press('Control+Enter');
  await over.focus(); await page.keyboard.press('t');
  await clickUser(150, 1600);
  await page.keyboard.type('Verify door swing at walk-in cooler');
  await page.keyboard.press('Control+Enter');
  await over.focus(); await page.keyboard.press('n');
  await clickUser(1150, 1100);
  await page.keyboard.type('Confirm hood size with the kitchen consultant.');
  await page.keyboard.press('Control+Enter');
  await over.focus(); await page.keyboard.press('s');
  await clickUser(1050, 1650);
  // calibrate: a known 16'-0" over 288 pt at 1/4" = 1'-0"
  await page.click('[data-tool="calibrate"]');
  await clickUser(100, 1000); await clickUser(388, 1000);
  await page.waitForSelector('#mc-dlg-dist');
  await page.fill('#mc-dlg-dist', '16\'-0"');
  await page.click('dialog.mc-dialog button[data-key="set"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok(await page.locator('[data-scale]').innerText() !== 'Not calibrated', 'sheet calibrated (status bar shows the scale)');
  ok(await page.evaluate(() => window.markupcraft.tool) === 'measure', 'calibrating switches to the length tool');
  await clickUser(400, 640); await clickUser(688, 640);
  // area (the sheet is calibrated now) and two count groups
  await page.keyboard.press('q');
  for (const p of [[800, 900], [1088, 900], [1088, 1044], [800, 1044]]) await clickUser(...p);
  await page.keyboard.press('Enter');
  await page.keyboard.press('u');
  for (const p of [[300, 800], [340, 800], [380, 800]]) await clickUser(...p);
  ok(await page.locator('[data-status]').innerText() === 'Count: 3.', 'count shows a running total in the status bar');
  await page.keyboard.press('Escape');
  for (const p of [[300, 760], [340, 760]]) await clickUser(...p);
  await page.keyboard.press('Escape');
  const n = await count();
  ok(n === 18, 'eighteen markups drawn (got ' + n + ')');
  const areaVal = await page.evaluate(() => { const mc = window.markupcraft; const m = mc.store.all().find((x) => x.type === 'area'); return m ? m.pts.length : 0; });
  ok(areaVal === 4, 'area outline of 4 corners');
  ok(JSON.stringify(await page.evaluate(() => window.markupcraft.store.all().filter((x) => x.type === 'count').map((m) => m.pts.length))) === '[3,2]', 'two count groups: 3 and 2 marks');
  const types = await page.evaluate(() => [...new Set(window.markupcraft.store.all().map((m) => m.type))].sort().join(','));
  ok(types === 'area,arrow,callout,cloud,cloudrect,count,ellipse,highlight,line,measure,note,pen,polygon,polyline,rect,stamp,text', 'every markup type present: ' + types);
  const measureText = await page.evaluate(() => { const m = window.markupcraft.store.all().find((x) => x.type === 'measure'); const v = window.markupcraft.store.calibrations.get(m.sheet); return v ? (Math.hypot(m.pts[1][0] - m.pts[0][0], m.pts[1][1] - m.pts[0][1]) * v.mmPerPt / 304.8).toFixed(2) : ''; });
  ok(measureText === '16.00', 'measured 288 pt = 16.00 ft after calibration (' + measureText + ')');
  const authors = await page.evaluate(() => [...new Set(window.markupcraft.store.all().map((m) => m.author))].join(','));
  ok(authors === 'Test Reviewer', 'every markup carries the author');

  console.log('\n== Select, move, resize, undo');
  await page.keyboard.press('Escape'); await page.keyboard.press('v');
  const arrow0 = await page.evaluate(() => window.markupcraft.store.all().find((m) => m.type === 'arrow').pts);
  await clickUser(705, 830);
  ok(await page.evaluate(() => window.markupcraft.sel.size) === 1, 'click selects the arrow');
  await dragUser([[705, 830], [785, 790]]);
  const arrow1 = await page.evaluate(() => window.markupcraft.store.all().find((m) => m.type === 'arrow').pts);
  ok(Math.abs(arrow1[0][0] - arrow0[0][0] - 80) < 3 && Math.abs(arrow1[0][1] - arrow0[0][1] + 40) < 3, 'drag moves it by the drag distance');
  await page.keyboard.press('Control+z');
  const arrow2 = await page.evaluate(() => window.markupcraft.store.all().find((m) => m.type === 'arrow').pts);
  ok(JSON.stringify(arrow2) === JSON.stringify(arrow0), 'Ctrl+Z puts it back');
  await page.keyboard.press('Control+y');
  ok(JSON.stringify(await page.evaluate(() => window.markupcraft.store.all().find((m) => m.type === 'arrow').pts)) === JSON.stringify(arrow1), 'Ctrl+Y moves it again');
  await clickUser(300, 1375);   // the cloud's left edge
  const cl0 = await page.evaluate(() => { const m = window.markupcraft.store.all().find((x) => x.type === 'cloudrect'); return window.markupcraft.sel.has(m.id) ? m.rect : null; });
  ok(!!cl0, 'click on the cloud edge selects it');
  if (cl0) {
    await dragUser([[cl0[2], cl0[1]], [cl0[2] + 60, cl0[1] - 50]]);   // the south-east grip
    const cl1 = await page.evaluate(() => window.markupcraft.store.all().find((x) => x.type === 'cloudrect').rect);
    ok(Math.abs(cl1[2] - cl0[2] - 60) < 3 && Math.abs(cl1[1] - cl0[1] + 50) < 3 && Math.abs(cl1[0] - cl0[0]) < 0.01, 'grip resizes the cloud from the opposite corner');
  }
  await page.selectOption('[data-pane="props"] select.mc-select >> nth=0', 'Accepted');
  ok(await page.evaluate(() => window.markupcraft.store.all().find((x) => x.type === 'cloudrect').status) === 'Accepted', 'status set to Accepted in Properties');
  await page.waitForTimeout(150);   // the panel redraws after the status change
  await page.fill('[data-pane="props"] .mc-thread-sec textarea', 'Coordinate with the kitchen consultant before closing.');
  await page.click('[data-pane="props"] [data-reply]');
  const thread = await page.evaluate(() => window.markupcraft.store.all().find((x) => x.type === 'cloudrect').replies.map((r) => r.kind + ':' + r.author + ':' + r.text));
  ok(thread.length === 2 && /^status:Test Reviewer:Status set to Accepted/.test(thread[0]) && /^comment:Test Reviewer:Coordinate/.test(thread[1]), 'thread: the status change logged, then the reply', thread);
  await page.waitForFunction(() => document.querySelectorAll('[data-pane="props"] .mc-thread li').length === 2, null, { timeout: 3000 }).catch(() => {});
  ok(await page.locator('[data-pane="props"] .mc-thread li').count() === 2, 'the thread shows in Properties');
  await page.screenshot({ path: path.join(OUT, '02a-thread-paper.png') });

  console.log('\n== Punch list, markups list, tool chest');
  await page.click('[data-tab="punch"]');
  await page.click('[data-act="punch-add"]');
  ok(await page.evaluate(() => window.markupcraft.store.all().find((x) => x.type === 'cloudrect').punch?.n) === 1, 'cloud is punch item 1');
  await page.fill('[data-pane="punch"] input[type="text"]', 'Mechanical sub');
  await page.locator('[data-pane="punch"] input[type="text"]').press('Tab');
  ok(await page.evaluate(() => window.markupcraft.store.all().find((x) => x.type === 'cloudrect').punch.assignee) === 'Mechanical sub', 'punch assignee saved');
  await page.click('[data-tab="list"]');
  ok(await page.locator('[data-list] .mc-item').count() === 18, 'markups list shows all 18');
  ok(await page.locator('[data-list] .mc-replies').count() === 1 && (await page.locator('[data-list] .mc-replies').innerText()).trim().startsWith('2'), 'reply count shown in the list');
  ok(await page.locator('[data-list] .mc-item', { hasText: '128.00 sq ft' }).count() === 1 && await page.locator('[data-list] .mc-item', { hasText: 'Count: 3' }).count() === 1, 'area and count values in the list');
  await page.screenshot({ path: path.join(OUT, '02b-list-paper.png') });
  const [bdl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="list-bcf"]')]);
  const bcfPath = path.join(TMP, bdl.suggestedFilename());
  await bdl.saveAs(bcfPath);
  ok(bdl.suggestedFilename() === 'kitchen-plan-sheet markups.bcfzip', 'BCF download named "<set> markups.bcfzip"');
  const py = path.join(HERE, 'venv/bin/python');
  if (fs.existsSync(py)) {
    const r = spawnSync(py, [path.join(HERE, 'bcf_check.py'), bcfPath], { encoding: 'utf8' });
    let res = null; try { res = JSON.parse(r.stdout); } catch { res = { ok: false, errors: [r.stdout, r.stderr] }; }
    ok(res.ok && res.topics === 18, 'the exported BCF validates against the BCF 2.1 XSDs: ' + res.topics + ' topics with snapshots', res.errors);
  }
  const [cdl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act="list-csv"]')]);
  const csvText = fs.readFileSync(await cdl.path(), 'utf8');
  ok(/128\.00 sq ft, perimeter 48'-0"/.test(csvText) && /Count: 3/.test(csvText), 'CSV carries the area and count values');
  await page.selectOption('[data-filter="type"]', 'cloudrect');
  ok(await page.locator('[data-list] .mc-item').count() === 1, 'filter by type');
  await page.selectOption('[data-filter="type"]', '');
  await page.locator('[data-list] .mc-item', { hasText: 'Stamp' }).first().click();
  ok(await page.evaluate(() => window.markupcraft.store.get([...window.markupcraft.sel][0])?.type) === 'stamp', 'clicking a row selects that markup');
  await page.click('[data-tab="chest"]');
  const chest0 = await page.locator('[data-chest] .mc-tool-item').count();
  await page.click('[data-act="chest-save"]');
  await page.fill('#mc-dlg-tool', 'Approved stamp (test)');
  await page.click('dialog.mc-dialog button[data-key="save"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok(await page.locator('[data-chest] .mc-tool-item').count() === chest0 + 1, 'saved the stamp as a tool');
  await page.screenshot({ path: path.join(OUT, '02-markups-paper.png') });

  console.log('\n== Rename a sheet');
  await page.click('[data-tab="props"]');
  await over.focus(); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.click('[data-pane="props"] [data-act="sheet-rename"]');
  await page.fill('#mc-dlg-sheetno', 'K-101');
  await page.fill('#mc-dlg-sheettitle', 'Kitchen equipment plan');
  await page.click('dialog.mc-dialog button[data-key="save"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok((await page.locator('.mc-sheet-title').first().innerText()) === 'K-101 — Kitchen equipment plan', 'renamed sheet shows in the sheets list');

  console.log('\n== Save');
  await page.click('[data-tab="props"]');
  await over.focus();
  await page.keyboard.press('Control+s');
  await page.waitForSelector('dialog.mc-dialog button[data-key="one"]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog.mc-dialog button[data-key="one"]')]);
  const saved = path.join(TMP, dl.suggestedFilename());   // a client drawing: kept out of the repo
  await dl.saveAs(saved);
  ok(dl.suggestedFilename() === 'kitchen-plan-sheet (marked up).pdf', 'download named "<name> (marked up).pdf"');
  const bytes = new Uint8Array(fs.readFileSync(saved));
  const doc = await pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false, standardFontDataUrl: STD_FONTS }).promise;
  const allAnnots = await (await doc.getPage(1)).getAnnotations();
  const annots = allAnnots.filter((a) => !a.inReplyTo);
  const subs = annots.map((a) => a.subtype).sort().join(',');
  ok(annots.length === 18, '18 annotations in the saved PDF (' + annots.length + ')');
  ok(subs === 'Circle,FreeText,FreeText,Ink,Ink,Ink,Ink,Line,Line,Line,PolyLine,Polygon,Polygon,Polygon,Square,Square,Stamp,Text', 'subtypes: ' + subs);
  const reps = allAnnots.filter((a) => a.inReplyTo);
  ok(reps.length === 2 && reps.every((a) => a.subtype === 'Text' && annots.find((p) => p.id === a.inReplyTo)?.subtype === 'Square'), 'the thread saved as 2 reply annotations on the cloud');
  ok(JSON.stringify(await doc.getPageLabels()) === '["K-101"]', 'the typed sheet number is the page label');
  ok(allAnnots.every((a) => a.hasAppearance), 'every annotation has an appearance stream');
  ok(allAnnots.every((a) => a.titleObj?.str === 'Test Reviewer'), 'every annotation (and reply) has /T = author');
  const ldoc = await PDFLib.PDFDocument.load(bytes);
  const nms = ldoc.getPage(0).node.Annots().asArray().map((r) => ldoc.context.lookup(r)).filter((d) => !d.get(PDFLib.PDFName.of('IRT'))).map((d) => d.get(PDFLib.PDFName.of('NM'))?.decodeText?.() || '').filter((s) => s.startsWith('mc-'));
  ok(nms.length === 18, '/NM carries our id on all 18');
  ok(annots.find((a) => a.subtype === 'FreeText' && /prep sink/.test(a.contentsObj?.str || '')), 'callout text is in /Contents');
  ok(fs.readFileSync(PLAN).length === FACTS.pdf.bytes, 'the original file is untouched');

  console.log('\n== Themes and compare');
  await page.click('button[name="space"][value="model"]');
  await page.waitForFunction(() => document.documentElement.dataset.space === 'model');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, '03-markups-model.png') });
  await page.click('[data-tab="compare"]');
  await page.selectOption('[data-cmp="old"]', { index: 2 });
  await page.selectOption('[data-cmp="new"]', { index: 1 });
  await page.click('[data-act="compare"]');
  await page.waitForFunction(() => window.markupcraft.view.crisp?.compare, null, { timeout: 15000 });
  ok(await page.evaluate(() => window.markupcraft.cmp.on), 'compare mode on');
  await page.screenshot({ path: path.join(OUT, '04-compare-model.png') });
  // line up by two points: old (6,-4) offset
  await page.click('[data-act="compare-align"]');
  for (const p of [[106, 96], [1106, 1496], [100, 100], [1100, 1500]]) await clickUser(...p);
  const fit = await page.evaluate(() => window.markupcraft.cmp.fit);
  ok(fit && Math.abs(fit[4] + 6) < 0.5 && Math.abs(fit[5] - 4) < 0.5 && Math.abs(fit[0] - 1) < 0.001, 'align by two points finds the 6 pt / 4 pt shift');
  await page.click('button[name="space"][value="paper"]');
  await page.waitForFunction(() => document.documentElement.dataset.space === 'paper');
  await page.waitForFunction(() => window.markupcraft.view.crisp?.compare, null, { timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '05-compare-paper.png') });
  // K12: the same pair compared by lines, with the alignment found above
  await page.check('input[data-cmp-mode][value="lines"]');
  await page.waitForFunction(() => window.markupcraft.cmp.vec, null, { timeout: 30000 });
  const vec = await page.evaluate(() => { const v = window.markupcraft.cmp.vec; const len = (l) => l.reduce((s, q) => s + Math.hypot(q[2] - q[0], q[3] - q[1]), 0); return { removed: len(v.removed), added: len(v.added), status: document.querySelector('[data-cmp-status]').textContent }; });
  ok(vec.removed > 1300 && vec.added < 200 && /Red: \d+ pt/.test(vec.status), 'Changed lines: the revision\'s new box and line show (≈ 1366 pt), little else once aligned', vec);
  await page.screenshot({ path: path.join(OUT, '05b-compare-lines.png') });
  const nC = await page.evaluate(() => window.markupcraft.store.all().length);
  await page.click('[data-act="compare-cloud"]');
  const nCloud = await page.evaluate((n) => window.markupcraft.store.all().length - n, nC);
  ok(nCloud >= 2 && /Clouded \d+ changes/.test(await page.locator('[data-status]').innerText()), 'Cloud the changes: a cloud round each group of changed lines', nCloud);
  await page.keyboard.press('Control+z');
  await page.check('input[data-cmp-mode][value="picture"]');
  await page.click('[data-act="compare-stop"]');

  // zoom deep on the big sheet and check the crisp render keeps up
  await page.evaluate(() => { const mc = window.markupcraft; mc.view.zoomTo([560, 1080, 960, 1340], 0.95); const m = mc.store.all().find((x) => x.type === 'callout'); mc.sel.clear(); mc.sel.add(m.id); mc.view.invalidate(true); });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, '06-detail-paper.png') });
  await page.evaluate(() => { const v = window.markupcraft.view; v.zoomTo([600, 1150, 760, 1300], 0.9); v.setPercent(1600); });
  await page.waitForFunction(() => window.markupcraft.view.crisp && Math.abs(window.markupcraft.view.crisp.z - window.markupcraft.view.z) < 1e-9, null, { timeout: 15000 });
  const pct = await page.evaluate(() => Math.round(window.markupcraft.view.percent));
  ok(pct >= 1600, 'zoomed to ' + pct + '% with a crisp render at that zoom');
  await page.screenshot({ path: path.join(OUT, '07-zoom-1600-paper.png') });

  console.log('\n== Reopen the saved copy: markups come back editable');
  await page.click('[data-act="close"]');
  await page.waitForTimeout(300);
  if (await page.locator('dialog.mc-dialog[open]').count()) await page.click('dialog.mc-dialog button[data-key="discard"]');
  await page.waitForFunction(() => window.markupcraft.sheets.length === 0);
  await page.setInputFiles('[data-file]', [saved]);
  await page.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  const back = await page.evaluate(() => window.markupcraft.store.all().map((m) => ({ type: m.type, locked: m.locked, status: m.status, punch: m.punch, author: m.author, replies: m.replies.length, pts: m.pts?.length })));
  ok(back.length === 18 && back.every((m) => !m.locked), '18 markups read back, all editable');
  ok(back.find((m) => m.type === 'cloudrect')?.replies === 2 && JSON.stringify(back.filter((m) => m.type === 'count').map((m) => m.pts)) === '[3,2]', 'the thread and both count groups come back');
  ok((await page.locator('.mc-sheet-title').first().innerText()) === 'K-101 — Kitchen equipment plan', 'the renamed sheet comes back');
  ok(back.find((m) => m.type === 'cloudrect')?.status === 'Accepted' && back.find((m) => m.type === 'cloudrect')?.punch?.assignee === 'Mechanical sub', 'status and punch item survive the round trip');
  ok(await page.evaluate(() => [...window.markupcraft.store.calibrations.values()][0]?.unit) === 'ft-in', 'sheet calibration survives the round trip');
  ok(await page.evaluate(() => window.markupcraft.files[0].pages[0].annotMode) === 'disable', 'our annotations are drawn by MarkupCraft, not twice');
  // edit one, save again: no duplicates
  await page.keyboard.press('Escape');
  await over.focus(); await page.keyboard.press('v');
  await page.evaluate(() => { const mc = window.markupcraft; const m = mc.store.all().find((x) => x.type === 'rect'); mc.store.change('t', (tx) => tx.update(m.id, { comment: 'Edited after reopening' })); });
  await page.keyboard.press('Control+s');
  const dl2 = await page.waitForEvent('download');
  const saved2 = path.join(TMP, 'resaved.pdf');
  await dl2.saveAs(saved2);
  ok(dl2.suggestedFilename() === 'kitchen-plan-sheet (marked up).pdf', 'saving a marked-up copy again does not stack "(marked up)"');
  const doc2 = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(saved2)), isEvalSupported: false, standardFontDataUrl: STD_FONTS }).promise;
  const annots2all = await (await doc2.getPage(1)).getAnnotations();
  const annots2 = annots2all.filter((a) => !a.inReplyTo);
  ok(annots2.length === 18 && annots2all.length === 20, 'still 18 annotations + 2 replies after a second save (no duplicates)', annots2all.length);
  ok(annots2.some((a) => a.contentsObj?.str === 'Edited after reopening'), 'the edit is in the re-saved file');
  fs.unlinkSync(saved2);
  await page.screenshot({ path: path.join(OUT, '08-reopened-paper.png') });

  console.log('\n== Touch (CDP touch events)');
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
  const tbox = await over.boundingBox();
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 2, radiusY: 2, force: 1 })) });
  await page.evaluate(() => window.markupcraft.view.fit('page'));
  await page.waitForTimeout(200);
  const cx = tbox.x + tbox.width / 2, cy = tbox.y + tbox.height / 2;
  const before = await page.evaluate(([x, y]) => ({ z: window.markupcraft.view.z, u: window.markupcraft.view.toUser(x, y) }), [tbox.width / 2, tbox.height / 2]);
  await touch('touchStart', [[cx - 60, cy], [cx + 60, cy]]);
  for (let i = 1; i <= 6; i++) { const d = 60 + i * 15; await touch('touchMove', [[cx - d, cy], [cx + d, cy]]); }
  await touch('touchEnd', []);
  const after = await page.evaluate(([x, y]) => ({ z: window.markupcraft.view.z, u: window.markupcraft.view.toUser(x, y) }), [tbox.width / 2, tbox.height / 2]);
  ok(Math.abs(after.z / before.z - 2.5) < 0.05, 'pinch spreads 120 → 300 px: zoom × ' + (after.z / before.z).toFixed(3));
  ok(Math.hypot(after.u[0] - before.u[0], after.u[1] - before.u[1]) < 2, 'the point under the pinch center stays put (' + Math.hypot(after.u[0] - before.u[0], after.u[1] - before.u[1]).toFixed(2) + ' pt)');
  const o0 = await page.evaluate(() => [window.markupcraft.view.ox, window.markupcraft.view.oy, window.markupcraft.view.z]);
  await touch('touchStart', [[cx - 50, cy], [cx + 50, cy]]);
  for (let i = 1; i <= 5; i++) await touch('touchMove', [[cx - 50 + i * 16, cy + i * 10], [cx + 50 + i * 16, cy + i * 10]]);
  await touch('touchEnd', []);
  const o1 = await page.evaluate(() => [window.markupcraft.view.ox, window.markupcraft.view.oy, window.markupcraft.view.z]);
  ok(Math.abs(o1[0] - o0[0] - 80) < 2 && Math.abs(o1[1] - o0[1] - 50) < 2 && Math.abs(o1[2] - o0[2]) < 1e-9, 'two-finger drag pans 80, 50 px without zooming');
  const nTouch0 = await count();
  await over.focus(); await page.keyboard.press('p');
  await touch('touchStart', [[cx - 100, cy - 40]]);
  for (let i = 1; i <= 8; i++) await touch('touchMove', [[cx - 100 + i * 20, cy - 40 + (i % 2) * 15]]);
  await touch('touchEnd', []);
  ok(await count() === nTouch0 + 1 && await page.evaluate(() => window.markupcraft.store.all().at(-1).type) === 'pen', 'one finger draws with the pen');
  await over.focus(); await page.keyboard.press('u');
  await touch('touchStart', [[cx + 40, cy + 60]]); await touch('touchEnd', []);
  ok(await count() === nTouch0 + 2 && await page.evaluate(() => window.markupcraft.store.all().at(-1).type) === 'count', 'a one-finger tap counts');
  await touch('touchStart', [[cx + 120, cy + 60]]);
  await touch('touchStart', [[cx + 120, cy + 60], [cx + 220, cy + 60]]);
  await touch('touchMove', [[cx + 110, cy + 60], [cx + 240, cy + 60]]);
  await touch('touchEnd', []);
  ok(await count() === nTouch0 + 2 && await page.evaluate(() => window.markupcraft.store.all().at(-1).pts.length) === 1, 'a pinch with the count tool leaves no mark');
  // S.8: a long press is the touch Enter / double-click
  ok(await page.evaluate(() => document.querySelector('[data-markupcraft]').classList.contains('is-touch')), 'a finger on the sheet switches to touch targets (is-touch)');
  await page.keyboard.press('Escape');
  await over.focus(); await page.keyboard.press('y');
  for (const [dx, dy] of [[-150, 120], [-60, 170], [30, 120]]) { await touch('touchStart', [[cx + dx, cy + dy]]); await touch('touchEnd', []); await page.waitForTimeout(450); }
  await touch('touchStart', [[cx + 30, cy + 120]]); await page.waitForTimeout(750); await touch('touchEnd', []);
  const poly = await page.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(await count() === nTouch0 + 3 && poly.type === 'polyline' && poly.pts.length === 3, 'a long press finishes a polyline (no extra point)', poly?.pts?.length);
  const tId = await page.evaluate(() => { const mc = window.markupcraft; return mc.store.change('t', (tx) => tx.add({ sheet: mc.sheets[mc.cur].page.key, type: 'text', rect: [300, 300, 520, 330], text: 'hold to edit', author: 'Touch' })).id; });
  await over.focus(); await page.keyboard.press('v');
  await page.evaluate(() => window.markupcraft.view.fit('page'));   // the pinch above zoomed in: bring the text back on screen
  await page.waitForTimeout(400);   // let the sheet settle (a crisp render can hold the page past the long-press timer)
  const [tx0, ty0] = await page.evaluate(() => window.markupcraft.view.toScreen([410, 315]));
  await touch('touchStart', [[tbox.x + tx0, tbox.y + ty0]]); await page.waitForTimeout(1200);
  const editing = await page.evaluate(() => !document.querySelector('[data-edit]').hidden && document.querySelector('[data-edit]').value);
  await touch('touchEnd', []);
  ok(editing === 'hold to edit', 'a long press on a text markup opens its text', editing || await page.evaluate(([x, y]) => { const mc = window.markupcraft; return { tool: mc.tool, sel: [...mc.sel], at: mc.view.toUser(x, y), dlg: document.querySelectorAll('dialog[open]').length, touch: mc.touchState() }; }, [tx0, ty0]));
  await page.keyboard.press('Escape');
  ok(await page.evaluate((id) => window.markupcraft.store.get(id)?.text, tId) === 'hold to edit', 'the markup is unchanged after Esc');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, '09-touch-paper.png') });

  console.log('\n== Edit group: Undo, Redo, Copy, Paste and the More menu');
  await cdp.send('Emulation.setTouchEmulationEnabled', { enabled: false });
  await page.evaluate(() => window.markupcraft.view.fit('page'));
  await page.waitForTimeout(200);
  await over.focus(); await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.keyboard.press('v');
  const edit = page.locator('.mc-tools > [role="group"][aria-label="Edit"]');
  const editRow = await edit.locator('.mc-tool-row > *').evaluateAll((els) => els.map((e) => e.dataset.act || (e.matches('details[data-edit-menu]') ? 'more' : '?')));
  ok(editRow.join() === 'undo,redo,copy,paste,more', 'Edit group holds Undo, Redo, Copy, Paste and More', editRow);
  ok(await page.locator('.mc-tools > [role="group"] .mc-tool-row > [data-act="delete"]').count() === 0, 'Delete moved into the More menu');
  const rectId = await page.evaluate(() => window.markupcraft.store.all().find((m) => m.type === 'rect').id);
  const R = () => page.evaluate((id) => window.markupcraft.store.get(id)?.rect, rectId);
  const rect0 = await R();
  const rectScreen = (r) => page.evaluate((rr) => window.markupcraft.view.toScreen([rr[0], rr[3]]), r);
  const selected = () => page.evaluate(() => [...window.markupcraft.sel].map((id) => window.markupcraft.store.get(id)));
  const n0 = await count();
  const selectRect = async () => { await page.keyboard.press('Escape'); await clickUser(rect0[0], (rect0[1] + rect0[3]) / 2); };
  await selectRect();
  ok(JSON.stringify(await page.evaluate(() => [...window.markupcraft.sel])) === JSON.stringify([rectId]), 'click selects the rectangle');
  ok(!(await page.locator('[data-act="copy"].mc-tool').isDisabled()) && !(await page.locator('[data-act="undo"].mc-tool').isDisabled()), 'Copy and Undo are enabled with a selection');
  await page.click('.mc-tool[data-act="copy"]');
  ok(/^Copied 1 markup/.test(await page.locator('[data-status]').innerText()), 'Copy button copies (status says so)');
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.clipboard')));
  ok(stored?.format === 'markupcraft-clip' && stored.items.length === 1 && stored.items[0].type === 'rect', 'the copy is kept in localStorage markupcraft.clipboard for other tabs');
  await page.click('.mc-tool[data-act="paste"]');
  const p1 = (await selected())[0];
  const s0 = await rectScreen(rect0), s1 = await rectScreen(p1.rect);
  ok(await count() === n0 + 1 && p1.id !== rectId && Math.abs(s1[0] - s0[0] - 12) < 0.5 && Math.abs(s1[1] - s0[1] - 12) < 0.5, 'Paste button: a new copy 12 px down and right, selected', [s1[0] - s0[0], s1[1] - s0[1]]);
  await page.click('.mc-tool[data-act="paste"]');
  const s2 = await rectScreen((await selected())[0].rect);
  ok(await count() === n0 + 2 && Math.abs(s2[0] - s0[0] - 24) < 0.5, 'pasting again steps further (24 px)');
  await page.click('.mc-tool[data-act="undo"]');
  await page.click('.mc-tool[data-act="undo"]');
  ok(await count() === n0, 'Undo button takes each paste away (one step each)');
  await page.click('.mc-tool[data-act="redo"]');
  ok(await count() === n0 + 1, 'Redo button puts one back');
  await page.keyboard.press('Control+z');
  // Ctrl+V with the pointer on the sheet: centered where it points
  const [tx, ty] = await at(700, 420);
  await page.mouse.move(tx, ty);
  await page.keyboard.press('Control+v');
  const pp = (await selected())[0];
  ok(await count() === n0 + 1 && Math.abs((pp.rect[0] + pp.rect[2]) / 2 - 700) < 1 && Math.abs((pp.rect[1] + pp.rect[3]) / 2 - 420) < 1, 'Ctrl+V pastes at the pointer', pp.rect);
  await page.keyboard.press('Control+z');
  // More menu
  await page.click('[data-edit-menu] > summary');
  ok(await page.locator('[data-edit-menu][open] .mc-menu-list').isVisible(), 'More opens the menu');
  const items = await page.locator('[data-edit-menu] [role="menuitem"]').evaluateAll((els) => els.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(items.join('|') === 'Cut Ctrl+X|Copy Ctrl+C|Paste Ctrl+V|Paste in place Ctrl+Shift+V|Paste a picture Ctrl+V|Duplicate Ctrl+D|Delete Delete|Select all Ctrl+A|Select none Esc', 'More lists cut, copy, paste, paste in place, paste a picture (0.6 DF.6), duplicate, delete, select all, select none with their keys', items);
  await page.click('[data-edit-menu] [data-act="paste-in-place"]');
  ok(!(await page.locator('[data-edit-menu]').evaluate((d) => d.open)), 'the menu closes after a choice');
  ok(await count() === n0 + 1 && JSON.stringify((await selected())[0].rect) === JSON.stringify(rect0), 'Paste in place: the same position on the sheet');
  await page.keyboard.press('Control+z');
  await selectRect();
  await page.keyboard.press('Control+d');
  const d1 = (await selected())[0];
  const sd = await rectScreen(d1.rect);
  ok(await count() === n0 + 1 && d1.id !== rectId && Math.abs(sd[0] - s0[0] - 12) < 0.5, 'Ctrl+D duplicates beside the original');
  ok(await page.evaluate((at0) => JSON.parse(localStorage.getItem('markupcraft.clipboard')).at === at0, stored.at), 'duplicate leaves the clipboard alone');
  await page.keyboard.press('Control+z');
  ok(await count() === n0, 'one Ctrl+Z takes the duplicate away');
  await selectRect();
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="cut"]');
  ok(await count() === n0 - 1 && !(await R()) && /^Cut 1 markup/.test(await page.locator('[data-status]').innerText()), 'More › Cut removes it and copies it');
  await page.keyboard.press('Control+z');
  ok(await count() === n0 && JSON.stringify(await R()) === JSON.stringify(rect0), 'one Ctrl+Z brings a cut markup back');
  await selectRect();
  await page.keyboard.press('Control+x');
  ok(await count() === n0 - 1, 'Ctrl+X cuts');
  await page.mouse.move(tx, ty);
  await page.keyboard.press('Control+Shift+V');
  ok(await count() === n0 && JSON.stringify((await selected())[0].rect) === JSON.stringify(rect0), 'Ctrl+Shift+V pastes in place even with the pointer elsewhere');
  await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');
  ok(await count() === n0 && JSON.stringify(await R()) === JSON.stringify(rect0), 'two Ctrl+Z: the paste and the cut undone, the original back');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="select-all"]');
  ok(await page.evaluate(() => window.markupcraft.sel.size) === n0, 'More › Select all selects every markup on the sheet');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="select-none"]');
  ok(await page.evaluate(() => window.markupcraft.sel.size) === 0, 'More › Select none clears the selection');
  await selectRect();
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-act="delete"]');
  ok(await count() === n0 - 1 && !(await R()), 'More › Delete deletes');
  await page.keyboard.press('Control+z');
  await page.click('[data-edit-menu] > summary');
  await page.keyboard.press('Escape');
  ok(!(await page.locator('[data-edit-menu]').evaluate((d) => d.open)), 'Esc closes the menu');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(200);
  const tbRows = await page.evaluate(() => new Set([...document.querySelectorAll('.mc-tools > [role="group"]')].map((g) => g.offsetTop)).size);
  ok(tbRows === 1, 'the toolbar still fits one row at 1440 px', tbRows);
  await page.screenshot({ path: path.join(OUT, '10-toolbar-1440.png'), clip: { x: 0, y: 0, width: 1440, height: 130 } });
  await page.click('[data-edit-menu] > summary');
  await page.screenshot({ path: path.join(OUT, '11-edit-menu.png'), clip: { x: 900, y: 0, width: 540, height: 420 } });
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(200);
  const box2 = await over.boundingBox(); box.x = box2.x; box.y = box2.y;

  console.log('\n== Settings › MarkupCraft');
  await page.keyboard.press('Control+,');
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  ok(await page.inputValue('[name="mcAuthor"]') === 'Test Reviewer', 'the name field shows the name in use');
  ok(await page.locator('[name="mcPaste"][value="pointer"]').isChecked() && await page.locator('[name="mcWeight"][value="normal"]').isChecked(), 'defaults: paste at the pointer, normal lines');
  await page.fill('[name="mcAuthor"]', 'Renamed Reviewer');
  await page.locator('[name="mcAuthor"]').press('Tab');
  ok(await page.locator('[data-author]').innerText() === 'Renamed Reviewer' && await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.author'))) === 'Renamed Reviewer', 'changing the name updates the status bar and is kept');
  await page.locator('[name="mcColor"]').fill('#00aa55');
  await page.click('label:has([name="mcWeight"][value="heavy"])');
  await page.click('label:has([name="mcPaste"][value="offset"])');
  await page.selectOption('[name="mcUnit"]', 'm');
  await page.selectOption('[name="mcPos"]', 'mm');
  await page.screenshot({ path: path.join(OUT, '12-settings-markupcraft.png') });
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.settings')));
  ok(kept.markColor === '#00aa55' && kept.weight === 'heavy' && kept.pasteAt === 'offset' && kept.unit === 'm' && kept.posUnit === 'mm', 'settings kept in markupcraft.settings', kept);
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog[data-app-settings]', { state: 'hidden' });
  const rs = await page.evaluate(() => [window.markupcraft.styleFor('rect'), window.markupcraft.styleFor('highlight'), window.markupcraft.styleFor('stamp')]);
  ok(rs[0].color === '#00aa55' && rs[0].width === 3 && rs[1].color === '#f5e000' && rs[1].width === 14 && rs[2].color !== '#00aa55', 'new rectangles: the color and heavy lines; highlighters and stamps keep theirs', rs);
  await over.focus(); await page.keyboard.press('r');
  await dragUser([[400, 1200], [520, 1290]]);
  const drawn = await page.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(drawn.type === 'rect' && drawn.style.color === '#00aa55' && drawn.style.width === 3 && drawn.author === 'Renamed Reviewer', 'a rectangle drawn now uses them, with the new name', drawn.style);
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Escape'); await page.keyboard.press('v');
  await page.mouse.move(tx, ty);
  ok(/mm, Y .* mm$/.test(await page.locator('[data-coords]').innerText()), 'the position on the sheet reads in millimeters');
  await page.keyboard.press('Control+v');
  const off = (await selected())[0];
  ok(await count() === n0 + 1 && Math.abs((off.rect[0] + off.rect[2]) / 2 - 700) > 50, 'with "Beside the copy", Ctrl+V no longer pastes at the pointer');
  await page.keyboard.press('Control+z');
  await page.click('[data-author]');
  await page.fill('#mc-dlg-author', 'Third Name');
  await page.click('dialog.mc-dialog button[data-key="save"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  await page.keyboard.press('Control+,');
  await page.waitForSelector('dialog[data-app-settings][open]');
  ok(await page.inputValue('[name="mcAuthor"]') === 'Third Name', 'the dialog shows the name set from the status bar meanwhile');
  await page.click('[data-settings-tab="app"]');
  await page.click('[data-settings-reset]');
  const afterReset = await page.evaluate(() => ({ s: JSON.parse(localStorage.getItem('markupcraft.settings')), a: JSON.parse(localStorage.getItem('markupcraft.author')) }));
  ok(afterReset.s.markColor === '' && afterReset.s.weight === 'normal' && afterReset.s.pasteAt === 'pointer' && afterReset.s.unit === 'ft-in' && afterReset.s.posUnit === 'in', 'reset puts the MarkupCraft settings back', afterReset.s);
  ok(afterReset.a === 'Third Name' && await page.inputValue('[name="mcAuthor"]') === 'Third Name' && await page.locator('[name="mcPaste"][value="pointer"]').isChecked(), 'reset keeps your name; the fields show the defaults');
  await page.keyboard.press('Escape');
  await page.waitForSelector('dialog[data-app-settings]', { state: 'hidden' });

  console.log('\n== Paste in another tab (localStorage, checked like a file)');
  const page2 = await ctx.newPage();
  page2.on('console', (m) => { if (m.type() === 'error') problems.push('tab 2 console: ' + m.text()); });
  page2.on('pageerror', (e) => problems.push('tab 2 pageerror: ' + e.message));
  await page2.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page2);
  await page2.setInputFiles('[data-file]', [saved]);
  await page2.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  ok(await page2.locator('[data-author]').innerText() === 'Third Name', 'the other tab uses the same name');
  const m2 = await page2.evaluate(() => window.markupcraft.store.all().length);
  ok(!(await page2.locator('.mc-tool[data-act="paste"]').isDisabled()), "the other tab's Paste is ready (something was copied in the first tab)");
  await page2.locator('[data-over]').focus();
  await page2.keyboard.press('Control+Shift+V');
  const got2 = await page2.evaluate(() => { const mc = window.markupcraft; return { n: mc.store.all().length, m: mc.store.get([...mc.sel][0]) }; });
  ok(got2.n === m2 + 1 && got2.m?.type === 'rect' && JSON.stringify(got2.m.rect) === JSON.stringify(rect0) && got2.m.author === 'Third Name', 'Ctrl+Shift+V in another tab pastes the copy in place', got2.m?.rect);
  await page2.evaluate(() => localStorage.setItem('markupcraft.clipboard', JSON.stringify({ format: 'markupcraft-clip', v: 1, source: 'evil', sheet: 'x', at: '2099-01-01T00:00:00Z', items: [
    { type: 'foreign', rect: [0, 0, 9, 9] }, { type: 'rect', rect: [0, 0, 'x', 1] },
    { type: 'note', pts: [[200, 200]], text: '<img src=x onerror="window.__pwned=1">', style: { color: 'expression(1)' }, author: 'Mallory', locked: true } ] })));
  await page2.keyboard.press('Control+Shift+V');
  const got3 = await page2.evaluate(() => { const mc = window.markupcraft; const m = mc.store.get([...mc.sel][0]); return { n: mc.store.all().length, type: m?.type, color: m?.style.color, author: m?.author, locked: m?.locked, pwned: !!window.__pwned }; });
  ok(got3.n === m2 + 2 && got3.type === 'note' && got3.color === '#f2c230' && got3.author === 'Third Name' && !got3.locked && !got3.pwned, 'a tampered copy: bad markups left out, the rest cleaned and pasted as text', got3);
  ok(/2 could not be read/.test(await page2.locator('[data-status]').innerText()), 'the status says how many were left out');
  await page2.keyboard.press('Control+,');
  await page2.waitForSelector('dialog[data-app-settings][open]');
  ok(await page2.inputValue('[name="mcAuthor"]') === 'Third Name' && await page2.inputValue('[name="mcPos"]') === 'in', 'the other tab reads the kept settings');
  await page2.close();

  console.log('\n== Pages menu (0.4 K1) and print (K2)');
  const p3 = await ctx.newPage();
  p3.on('console', (m) => { if (m.type() === 'error') problems.push('tab 3 console: ' + m.text()); });
  p3.on('pageerror', (e) => problems.push('tab 3 pageerror: ' + e.message));
  await p3.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(p3);
  await p3.setInputFiles('[data-file]', [PLAN]);
  await p3.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  const mid = await p3.evaluate(() => { const mc = window.markupcraft; return mc.store.change('test', (tx) => tx.add({ sheet: mc.sheets[0].page.key, type: 'rect', rect: [100, 100, 300, 200], author: 'Pages Test', comment: 'travels with its page' })).id; });
  const st3 = () => p3.evaluate(() => { const mc = window.markupcraft; return { n: mc.sheets.length, cur: mc.cur, rot: mc.sheets[mc.cur]?.page.rotate, keys: mc.sheets.map((s) => s.page.key), w: mc.sheets.map((s) => s.page.width),
    marks: mc.store.all().map((m) => [m.id, m.sheet]), status: document.querySelector('[data-status]').textContent, undo: mc.store.canUndo }; });
  const menu = async (a) => { await p3.click('[data-pages-menu] > summary'); await p3.click('[data-pages-menu] [data-act="' + a + '"]'); };
  const settle = () => p3.waitForFunction(() => document.querySelector('[data-busy]').hidden && window.markupcraft.view.page, null, { timeout: 30000 });
  ok(await p3.locator('[data-pages-menu] [data-act="page-move-up"]').isDisabled(), 'Move page earlier is off on the first page');
  await menu('page-insert-blank'); await settle();
  let s3 = await st3();
  ok(s3.n === 2 && s3.cur === 1 && /blank page/.test(s3.status), 'Insert a blank page: a second sheet, shown', s3.status);
  ok(s3.marks.length === 1 && s3.marks[0][0] === mid && s3.marks[0][1] === s3.keys[0] && !s3.undo, 'the markup stayed on its page; undo history was cleared (said)', s3.marks);
  const [fc] = await Promise.all([p3.waitForEvent('filechooser'), menu('page-insert-pdf')]);
  await fc.setFiles(REV); await p3.waitForFunction(() => window.markupcraft.sheets.length === 3, null, { timeout: 30000 }); await settle();
  s3 = await st3();
  ok(s3.n === 3 && s3.cur === 2 && /Inserted 1 page/.test(s3.status), 'Insert pages from a PDF: the revision lands after the open page', s3.status);
  await p3.evaluate(() => window.markupcraft.goTo(0));
  await menu('page-move-down'); await settle();
  s3 = await st3();
  ok(s3.cur === 1 && s3.marks[0][1] === s3.keys[1], 'Move page later: the page and its markup move to page 2', s3.marks);
  await menu('page-rotate-cw'); await settle();
  s3 = await st3();
  ok(s3.rot === 90 && s3.marks[0][1] === s3.keys[1], 'Rotate page clockwise: the open sheet turns a quarter', s3.rot);
  await p3.screenshot({ path: path.join(OUT, '13-pages-rotated.png') });
  await menu('page-delete');
  await p3.waitForSelector('#mc-dlg-pages');
  await p3.fill('#mc-dlg-pages', '7');
  await p3.click('dialog.mc-dialog button[data-key="ok"]');
  ok(/outside/.test(await p3.locator('.mc-dlg-err').innerText()), 'Delete pages: a page that is not there is refused in the dialog');
  await p3.fill('#mc-dlg-pages', '3');
  await p3.click('dialog.mc-dialog button[data-key="ok"]');
  await p3.waitForSelector('dialog.mc-dialog', { state: 'detached' }); await settle();
  s3 = await st3();
  ok(s3.n === 2 && s3.marks.length === 1 && /Deleted 1 page/.test(s3.status), 'Delete pages: page 3 goes, the marked page stays', s3.status);
  await menu('page-extract');
  await p3.fill('#mc-dlg-pages', '1-2');
  const [exd] = await Promise.all([p3.waitForEvent('download'), p3.click('dialog.mc-dialog button[data-key="ok"]')]);
  const exPath = path.join(TMP, 'extract.pdf'); await exd.saveAs(exPath);
  const exDoc = await PDFLib.PDFDocument.load(fs.readFileSync(exPath));
  ok(exd.suggestedFilename() === 'kitchen-plan-sheet (pages 1-2).pdf' && exDoc.getPageCount() === 2 && exDoc.getPage(1).getRotation().angle === 90, 'Extract pages: a new PDF of pages 1-2, the turned page still turned', exd.suggestedFilename());
  const [prd] = await Promise.all([
    p3.waitForFunction(() => window.markupcraft.lastPrint, null, { timeout: 30000 }).then(() => p3.evaluate(() => Array.from(window.markupcraft.lastPrint))),
    (async () => { await p3.locator('[data-over]').focus(); await p3.keyboard.press('Control+p'); await p3.waitForSelector('dialog.mc-dialog'); await p3.check('input[name="mc-print"][value="file"]'); await p3.click('dialog.mc-dialog button[data-key="print"]'); })(),
  ]);
  const prDoc = await pdfjs.getDocument({ data: new Uint8Array(prd), standardFontDataUrl: STD_FONTS }).promise;
  const prAnn = await (await prDoc.getPage(2)).getAnnotations({ intent: 'any' });
  ok(prDoc.numPages === 2 && prAnn.length === 0 && await p3.locator('iframe[data-mc-print]').count() === 1, 'Print: every page of the file, markups drawn into the pages, handed to a print frame', { pages: prDoc.numPages, annots: prAnn.length });
  await prDoc.loadingTask.destroy();
  const [svd] = await Promise.all([p3.waitForEvent('download'), p3.keyboard.press('Control+s')]);
  const svPath = path.join(TMP, 'pages-saved.pdf'); await svd.saveAs(svPath);
  const svDoc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(svPath)), standardFontDataUrl: STD_FONTS }).promise;
  const svAnn = await (await svDoc.getPage(2)).getAnnotations({ intent: 'any' });
  ok(svDoc.numPages === 2 && svAnn.some((a) => a.subtype === 'Square'), 'Save after page changes: the reorganized set with the markup on its page');
  await svDoc.loadingTask.destroy();
  await p3.close();   // its print frame holds a PDF viewer: let it go

  console.log('\n== Find text (K14), slip-sheet (K13), flattened copy (K15)');
  const mkSet = async (sheetsSpec, file) => {
    const d = await PDFLib.PDFDocument.create();
    const font = await d.embedFont(PDFLib.StandardFonts.HelveticaBold);
    for (const [no, title, words, box] of sheetsSpec) {
      const pg = d.addPage([1296, 864]);
      pg.drawRectangle({ x: 980, y: 30, width: 280, height: 110, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 1 });   // the title block frame
      if (box) pg.drawRectangle({ x: 400, y: 300, width: 200, height: 120, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 1.5 });
      pg.drawText(words, { x: 200, y: 600, size: 18, font });
      pg.drawText(title, { x: 1000, y: 90, size: 14, font });
      pg.drawText(no, { x: 1100, y: 50, size: 28, font });
    }
    fs.writeFileSync(file, await d.save());
    return file;
  };
  const OLD = await mkSet([['A-101', 'FLOOR PLAN', 'VERIFY HOOD SIZE, SEE 3/A-102'], ['A-102', 'KITCHEN PLAN', 'NEW HOOD BY OWNER']], path.join(TMP, 'Set issue 1.pdf'));
  const NEW = await mkSet([['A-102', 'KITCHEN PLAN', 'HOOD REVISED', true], ['A-101', 'FLOOR PLAN', 'VERIFY HOOD SIZE'], ['A-103', 'DETAILS', 'NOTES']], path.join(TMP, 'Set issue 2.pdf'));
  const p4 = await ctx.newPage();
  p4.on('console', (m) => { if (m.type() === 'error') problems.push('tab 4 console: ' + m.text()); });
  p4.on('pageerror', (e) => problems.push('tab 4 pageerror: ' + e.message));
  await p4.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(p4);
  await p4.setInputFiles('[data-file]', [OLD]);
  await p4.waitForFunction(() => window.markupcraft.sheets.length === 2 && window.markupcraft.view.page, null, { timeout: 30000 });
  ok(await p4.evaluate(() => window.markupcraft.sheets.map((s) => s.page.sheetNo).join()) === 'A-101,A-102', 'the generated set reads its sheet numbers from the title block');
  await p4.evaluate(() => { const mc = window.markupcraft; mc.store.change('seed', (tx) => {
    tx.add({ sheet: mc.sheets[0].page.key, type: 'rect', rect: [150, 550, 500, 650], author: 'Seed', comment: 'open item', punch: { n: 1, assignee: 'GC', due: '', status: 'Open' } });
    tx.add({ sheet: mc.sheets[1].page.key, type: 'text', rect: [150, 300, 400, 330], text: 'closed one', author: 'Seed', status: 'Completed' });
    tx.add({ sheet: mc.sheets[1].page.key, type: 'ellipse', rect: [600, 300, 700, 400], author: 'Seed' });
  }); });
  await p4.locator('[data-over]').focus();
  await p4.keyboard.press('Control+f');
  ok(await p4.evaluate(() => document.querySelector('[data-find]').open && document.activeElement === document.querySelector('[data-find-q]')), 'Ctrl+F opens Find text and puts the cursor in it');
  await p4.fill('[data-find-q]', 'hood');
  await p4.press('[data-find-q]', 'Enter');
  await p4.waitForFunction(() => /hits? on/.test(document.querySelector('[data-find-count]').textContent), null, { timeout: 15000 });
  ok((await p4.locator('[data-find-count]').innerText()).startsWith('2 hits on 2 sheets') && await p4.locator('.mc-find-list button').count() === 2, 'Find: "hood" found on both sheets', await p4.locator('[data-find-count]').innerText());
  await p4.click('.mc-find-list li:nth-child(2) button');
  ok(await p4.evaluate(() => window.markupcraft.cur) === 1, 'a hit in the list opens its sheet');
  await p4.screenshot({ path: path.join(OUT, '15-find.png') });
  const nClouds = () => p4.evaluate(() => window.markupcraft.store.all().filter((m) => m.type === 'cloudrect').length);
  await p4.click('[data-act="find-cloud"]');
  ok(await nClouds() === 2 && /Clouded 2 hits on 2 sheets/.test(await p4.locator('[data-status]').innerText()), 'Cloud all: a cloud round each hit');
  await p4.locator('[data-over]').focus();
  await p4.keyboard.press('Control+z');
  ok(await nClouds() === 0, 'one Ctrl+Z takes all the clouds away');
  await p4.keyboard.press('Control+y');
  ok(await nClouds() === 2, 'Ctrl+Y puts them back');

  // K16 + K9: the callout "3/A-102" on A-101 becomes a link box; Ctrl+click follows it, Alt+← comes back
  await p4.evaluate(() => window.markupcraft.goTo(0));
  await p4.click('[data-act="auto-link"]');
  await p4.waitForSelector('dialog.mc-dialog .mc-slip-list');
  ok(await p4.locator('dialog.mc-dialog .mc-slip-row').count() === 1 && /3\/A-102/.test(await p4.locator('dialog.mc-dialog .mc-slip-row').innerText()), 'Link sheet callouts: "3/A-102" on A-101 found for review');
  await p4.click('dialog.mc-dialog button[data-key="ok"]');
  await p4.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  const lbox = await p4.evaluate(() => { const mc = window.markupcraft; const m = mc.store.all().find((x) => x.link === 'A-102'); return m && { rect: m.rect, sheet: m.sheet === mc.sheets[0].page.key }; });
  ok(lbox?.sheet, 'a link box to A-102 is on A-101', lbox);
  const ob4 = await p4.locator('[data-over]').boundingBox();
  const [lx, ly] = await p4.evaluate((r) => window.markupcraft.view.toScreen([r[0], (r[1] + r[3]) / 2]), lbox.rect);
  await p4.locator('[data-over]').focus(); await p4.keyboard.press('v');
  await p4.keyboard.down('Control'); await p4.mouse.click(ob4.x + lx, ob4.y + ly); await p4.keyboard.up('Control');
  await p4.waitForFunction(() => window.markupcraft.cur === 1, null, { timeout: 10000 }).catch(() => {});
  ok(await p4.evaluate(() => window.markupcraft.sheets[window.markupcraft.cur].page.sheetNo) === 'A-102', 'Ctrl+click on the link opens A-102');
  await p4.keyboard.press('Alt+ArrowLeft');
  await p4.waitForFunction(() => window.markupcraft.cur === 0, null, { timeout: 10000 }).catch(() => {});
  ok(await p4.evaluate(() => window.markupcraft.cur) === 0, 'Alt+← comes back to A-101');

  const [fc4] = await Promise.all([p4.waitForEvent('filechooser'), (async () => { await p4.click('[data-pages-menu] > summary'); await p4.click('[data-pages-menu] [data-act="slip-sheet"]'); })()]);
  await fc4.setFiles(NEW);
  await p4.waitForSelector('dialog.mc-dialog .mc-slip-list', { timeout: 30000 });
  ok(await p4.locator('.mc-slip-row input:checked').count() === 2 && await p4.locator('.mc-slip-row input:disabled').count() === 1, 'Slip-sheet: A-101 and A-102 matched by number, A-103 is new');
  await p4.check('#mc-slip-skip');
  await p4.screenshot({ path: path.join(OUT, '16-slip-sheet.png') });
  await p4.click('dialog.mc-dialog button[data-key="carry"]');
  await p4.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  const slip = await p4.evaluate(() => { const mc = window.markupcraft; const on = (i) => mc.store.onSheet(mc.sheets[i].page.key); return {
    n: mc.sheets.length, oldA101: on(0).map((m) => [m.type, m.label, !!m.punch]), newA101: on(3).map((m) => [m.type, m.comment, m.punch?.n]), newA102: on(2).map((m) => m.type).sort(), status: document.querySelector('[data-status]').textContent }; });
  ok(slip.n === 5 && slip.newA101.some(([t, c, n]) => t === 'rect' && c === 'open item' && n === 1), 'the open item and its punch number move to the new A-101', slip.newA101);
  ok(slip.oldA101.some(([t, l]) => t === 'stamp' && l === 'Superseded') && slip.oldA101.every(([t, , p]) => t !== 'rect' || !p), 'the old A-101 is stamped Superseded and its punch item has moved on', slip.oldA101);
  ok(JSON.stringify(slip.newA102) === '["cloudrect","ellipse"]', 'the closed markup stays behind; the cloud and the open ellipse are carried', slip.newA102);
  ok(/Slip-sheeted 2 sheets: 5 markups carried forward\. 2 old sheets stamped “Superseded”\. 1 closed markup stayed/.test(slip.status), 'the status sums it up', slip.status);
  await p4.locator('[data-over]').focus();
  await p4.keyboard.press('Control+z');
  ok(await p4.evaluate(() => window.markupcraft.store.all().filter((m) => m.type === 'stamp').length) === 0, 'one undo takes the whole slip-sheet back (the new files stay open)');
  await p4.keyboard.press('Control+y');

  console.log('\n== Markup summary (K6) and BCF import (K7)');
  await p4.click('[data-tab="list"]');
  const [xd] = await Promise.all([p4.waitForEvent('download'), p4.click('[data-act="list-xlsx"]')]);
  const xPath = path.join(TMP, 'summary.xlsx'); await xd.saveAs(xPath);
  const xz = spawnSync('unzip', ['-l', xPath], { encoding: 'utf8' });
  ok(xd.suggestedFilename() === 'Set issue 1 markup summary.xlsx' && /xl\/worksheets\/sheet3\.xml/.test(xz.stdout), 'XLSX summary: a workbook with markups, by sheet and the punch list', xd.suggestedFilename());
  const [pd] = await Promise.all([p4.waitForEvent('download'), p4.click('[data-act="list-pdf"]')]);
  const pPath = path.join(TMP, 'summary.pdf'); await pd.saveAs(pPath);
  const sdoc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(pPath)), standardFontDataUrl: STD_FONTS }).promise;
  const stext = (await (await sdoc.getPage(1)).getTextContent()).items.map((i) => i.str).join(' ');
  ok(/Markup summary: Set issue 1/.test(stext) && /Superseded/.test(stext), 'PDF summary: a report of the listed markups', stext.slice(0, 80));
  await sdoc.loadingTask.destroy();
  const [bd] = await Promise.all([p4.waitForEvent('download'), p4.click('[data-act="list-bcf"]')]);
  const bPath = path.join(TMP, 'round.bcfzip'); await bd.saveAs(bPath);
  const nBefore = await p4.evaluate(() => window.markupcraft.store.all().length);
  const [bc1] = await Promise.all([p4.waitForEvent('filechooser'), p4.click('[data-act="list-bcf-import"]')]);
  await bc1.setFiles(bPath);
  await p4.waitForFunction(() => /already here|Imported/.test(document.querySelector('[data-status]').textContent), null, { timeout: 15000 });
  ok(await p4.evaluate(() => window.markupcraft.store.all().length) === nBefore && /already here/.test(await p4.locator('[data-status]').innerText()), 'importing our own BCF export again adds nothing');
  const foreign = path.join(TMP, 'from-bim.bcfzip');
  {
    const g = '7a1d0c2e-5555-4b6c-8d9e-0123456789ab';
    const xml = `<?xml version="1.0"?><Markup><Topic Guid="${g}" TopicType="Clash" TopicStatus="Active"><Title>Duct hits beam</Title><Labels>A-102</Labels><CreationAuthor>bim@example.com</CreationAuthor></Topic><Comment Guid="aaaaaaaa-0000-4000-8000-00000000000a"><Date>2026-10-13T09:00:00Z</Date><Author>Ben</Author><Comment>Please check</Comment></Comment></Markup>`;
    const { zip } = await import(path.join(REPO, 'public_html/assets/apps/markupcraft/dev/xlsx.js'));
    fs.writeFileSync(foreign, await zip([{ name: 'bcf.version', data: '<Version VersionId="2.1"/>' }, { name: g + '/markup.bcf', data: xml }]));
  }
  const [bc2] = await Promise.all([p4.waitForEvent('filechooser'), p4.click('[data-act="list-bcf-import"]')]);
  await bc2.setFiles(foreign);
  await p4.waitForFunction((n) => window.markupcraft.store.all().length === n + 1, nBefore, { timeout: 15000 });
  const note = await p4.evaluate(() => { const mc = window.markupcraft; const m = mc.store.all().at(-1); return { type: m.type, sheetNo: mc.sheets.find((s) => s.page.key === m.sheet)?.page.sheetNo, comment: m.comment, replies: m.replies.length }; });
  ok(note.type === 'note' && note.sheetNo === 'A-102' && /Duct hits beam/.test(note.comment) && note.replies === 1, 'a BIM tool\'s issue becomes a note on the sheet it names, with its comment', note);
  await p4.screenshot({ path: path.join(OUT, '20-list-exports.png') });

  console.log('\n== Legend (K21) and copy to other sheets (K22)');
  await p4.evaluate(() => window.markupcraft.goTo(0));
  await p4.click('[data-tab="list"]');
  await p4.click('[data-act="legend-add"]');
  const leg = await p4.evaluate(() => { const mc = window.markupcraft; const m = mc.store.all().at(-1); return { type: m.type, title: m.label }; });
  ok(leg.type === 'legend' && leg.title === 'Legend', 'Legend: added to the sheet', leg);
  await p4.click('[data-tab="props"]');
  await p4.click('[data-pane="props"] button[data-copy-sheets]');
  await p4.waitForSelector('dialog.mc-dialog .mc-slip-list');
  const boxes4 = p4.locator('dialog.mc-dialog .mc-slip-list input');
  await boxes4.nth(0).check(); await boxes4.nth(1).check();
  await p4.click('dialog.mc-dialog button[data-key="ok"]');
  await p4.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  const legs = await p4.evaluate(() => window.markupcraft.store.all().filter((m) => m.type === 'legend').map((m) => m.sheet));
  ok(legs.length === 3 && new Set(legs).size === 3 && /Placed 2 copies on 2 sheets/.test(await p4.locator('[data-status]').innerText()), 'Copy to other sheets: the legend is placed on the two sheets ticked, in one step', legs);
  await p4.screenshot({ path: path.join(OUT, '22-legend.png') });

  console.log('\n== Compare two sets (K23)');
  await p4.click('[data-tab="compare"]');
  await p4.click('.mc-set-cmp > summary');
  await p4.selectOption('[data-set-old]', { label: 'Set issue 1.pdf' });
  await p4.selectOption('[data-set-new]', { label: 'Set issue 2.pdf' });
  await p4.click('[data-act="set-compare"]');
  await p4.waitForFunction(() => /paired/.test(document.querySelector('[data-set-status]').textContent), null, { timeout: 30000 });
  const sc4 = await p4.evaluate(() => ({ status: document.querySelector('[data-set-status]').textContent, rows: [...document.querySelectorAll('[data-set-results] li')].map((li) => li.textContent) }));
  ok(/2 sheets paired; 1 changed/.test(sc4.status) && /^A-102/.test(sc4.rows[0]) && /pt of lines changed/.test(sc4.rows[0]) && /no line changes/.test(sc4.rows[1]), 'the sets pair by number; the changed sheet (A-102) is listed first', sc4);
  const n23 = await p4.evaluate(() => window.markupcraft.store.all().length);
  await p4.click('[data-act="set-cloud"]');
  ok(await p4.evaluate((n) => window.markupcraft.store.all().length - n, n23) >= 1 && /Clouded \d+ changes? on 1 sheet/.test(await p4.locator('[data-set-status]').innerText()), 'Cloud all changes: clouds on the changed sheet');
  await p4.keyboard.press('Control+z');
  await p4.click('[data-tab="props"]');

  console.log('\n== Bookmarks (K24)');
  await p4.evaluate(() => window.markupcraft.goTo(2));
  await p4.click('[data-bookmarks] > summary');
  await p4.click('[data-act="bm-build"]');
  ok(await p4.locator('[data-bm-list] .mc-bm').count() === 3 && /Built 3 bookmarks/.test(await p4.locator('[data-status]').innerText()), 'Build from sheets: one bookmark per sheet of the open file');
  await p4.locator('[data-bm-list] .mc-bm').nth(2).locator('button.mc-layer-btn').last().click();
  await p4.locator('[data-over]').focus();
  const [bmd] = await Promise.all([p4.waitForEvent('download'), (async () => { await p4.keyboard.press('Control+s'); await p4.waitForSelector('dialog.mc-dialog'); await p4.click('dialog.mc-dialog button[data-key="one"]'); })()]);
  const bmPath = path.join(TMP, 'bookmarks.pdf'); await bmd.saveAs(bmPath);
  const bdoc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(bmPath)), standardFontDataUrl: STD_FONTS }).promise;
  const outl = (await bdoc.getOutline()) || [];
  ok(outl.length === 2 && /^A-102/.test(outl[0].title) && /^A-101/.test(outl[1].title), 'saved: the PDF carries the two bookmarks left (one was removed)', outl.map((o) => o.title));
  await bdoc.loadingTask.destroy();

  await p4.evaluate(() => window.markupcraft.goTo(2));
  await p4.click('[data-pages-menu] > summary'); await p4.click('[data-pages-menu] [data-act="save-flat"]');
  await p4.waitForSelector('input[name="mc-flat"]');
  const [fd] = await Promise.all([p4.waitForEvent('download'), p4.click('dialog.mc-dialog button[data-key="save"]')]);
  const fdPath = path.join(TMP, 'flat.pdf'); await fd.saveAs(fdPath);
  const fdoc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(fdPath)), standardFontDataUrl: STD_FONTS }).promise;
  const fann = [];
  for (let i = 1; i <= fdoc.numPages; i++) fann.push(...await (await fdoc.getPage(i)).getAnnotations({ intent: 'any' }));
  ok(fd.suggestedFilename() === 'Set issue 2 (flattened).pdf' && fdoc.numPages === 3 && fann.length === 0, 'Save a flattened copy: no comments left, the markups are in the pages', { name: fd.suggestedFilename(), annots: fann.length });
  await fdoc.loadingTask.destroy();
  await p4.close();

  console.log('\n== Autosave and recovery (1.2), handoff in (1.5)');
  // a context of its own (same sign-in, its own IndexedDB), so the other tabs' copies stay out of it
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true, storageState: await ctx.storageState() });
  const p5 = await ctx2.newPage();
  p5.on('pageerror', (e) => problems.push('tab 5 pageerror: ' + e.message));
  await p5.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(p5);
  await p5.setInputFiles('[data-file]', [PLAN]);
  await p5.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  await p5.evaluate(() => { const mc = window.markupcraft; mc.store.change('crash test', (tx) => { tx.add({ sheet: mc.sheets[0].page.key, type: 'cloudrect', rect: [200, 200, 400, 300], author: 'Crash Test', comment: 'survives a crash' }); tx.setSheetName(mc.sheets[0].page.key, { number: 'K-201', title: 'Recovered plan' }); }); });
  // a copy is written ~2 s after the edits stop
  const saved5 = await until(p5, async () => { const a = window.markupcraft.autosave; return (await a.store.index('markupcraft')).some((x) => x.session === a.session && x.name === 'kitchen-plan-sheet.pdf'); });
  ok(saved5, 'an unsaved markup is copied to this browser a moment after the edit');
  await p5.close({ runBeforeUnload: false });
  await new Promise((r) => setTimeout(r, 1000));   // the closed tab's Web Lock goes with its process; then its copy is an orphan
  const p6 = await ctx2.newPage();
  p6.on('pageerror', (e) => problems.push('tab 6 pageerror: ' + e.message));
  await p6.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const offered = await p6.waitForSelector('dialog[data-autosave-dialog][open] [data-autosave-row]', { timeout: 20000 }).then(() => true, () => false);
  ok(offered, 'the next page offers the closed tab\'s work back ("Recover your work?")', offered ? undefined : await p6.evaluate(async () => { const a = window.markupcraft.autosave; return { dlg: document.querySelectorAll('dialog[data-autosave-dialog]').length, open: !!document.querySelector('dialog[data-autosave-dialog][open]'), idx: (await a.store.index('markupcraft')).map((r) => r.name), orph: (await a.orphans()).length, locks: (await navigator.locks.query()).held.length }; }));
  if (offered) {
    await p6.click('dialog[data-autosave-dialog] [data-autosave-recover]');
    await p6.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page && window.markupcraft.store.all().length === 1, null, { timeout: 30000 });
    const rec6 = await p6.evaluate(() => { const mc = window.markupcraft; const m = mc.store.all()[0]; return { comment: m.comment, sheet: m.sheet === mc.sheets[0].page.key, no: mc.sheets[0].page.sheetNo, title: mc.sheets[0].page.title, dirty: mc.store.dirtySheets.size }; });
    ok(rec6.comment === 'survives a crash' && rec6.sheet && rec6.no === 'K-201' && rec6.dirty === 1, 'Recover: the PDF reopens with the markup and the typed sheet number, as unsaved work', rec6);
    await noRecover(p6);
    const [sv6] = await Promise.all([p6.waitForEvent('download'), p6.keyboard.press('Control+s')]);
    void sv6;
    const gone = await until(p6, async () => { const a = window.markupcraft.autosave; return !(await a.store.index('markupcraft')).some((x) => x.session === a.session); }, undefined, 10000);
    ok(gone, 'saving the file removes its recovery copy');
  }
  await p6.close();
  await ctx2.close();
  // handoff in: the file waits in IndexedDB "cadcraft-handoff" under an id; ?handoff=<id> opens it
  const p7 = await ctx.newPage();
  p7.on('pageerror', (e) => problems.push('tab 7 pageerror: ' + e.message));
  await p7.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(p7);
  const hid = await p7.evaluate(async (b64) => { const { putHandoff, newHandoffId } = await import('/assets/apps/markupcraft/dev/handoff.js'); const id = newHandoffId(); await putHandoff(id, new File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], 'handed over.pdf', { type: 'application/pdf' }), 'takeoffcraft'); return id; }, fs.readFileSync(PLAN).toString('base64'));
  await p7.goto(BASE + '/lab/markupcraft?space=paper&handoff=' + hid, { waitUntil: 'networkidle' });
  await p7.waitForFunction(() => window.markupcraft.sheets.length === 1, null, { timeout: 15000 }).catch(() => {});
  ok(await p7.evaluate(() => window.markupcraft.files[0]?.name) === 'handed over.pdf' && !/handoff=/.test(p7.url()), 'a PDF handed over by another app opens at start, and the address drops ?handoff');

  console.log('\n== Layers (K3)');
  await p7.click('[data-layers] > summary');
  await p7.click('[data-act="layer-new"]');
  await p7.fill('#mc-dlg-layer', 'Mechanical');
  await p7.click('dialog.mc-dialog button[data-key="ok"]');
  await p7.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok(await p7.locator('.mc-layer.is-current .mc-layer-name').innerText() === 'Mechanical', 'New layer: it is listed and becomes the current layer');
  const ob = await p7.locator('[data-over]').boundingBox();
  const sc = async (x, y) => { const [a2, b2] = await p7.evaluate(([u, v]) => window.markupcraft.view.toScreen([u, v]), [x, y]); return [ob.x + a2, ob.y + b2]; };
  await p7.locator('[data-over]').focus(); await p7.keyboard.press('r');
  const [r0x, r0y] = await sc(300, 900), [r1x, r1y] = await sc(500, 800);
  await p7.mouse.move(r0x, r0y); await p7.mouse.down(); await p7.mouse.move(r1x, r1y, { steps: 5 }); await p7.mouse.up();
  const lm = await p7.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(lm?.type === 'rect' && lm.layer === 'Mechanical', 'a new markup goes on the current layer', lm?.layer);
  await p7.keyboard.press('v'); await p7.keyboard.press('Escape');
  const [mx, my] = await sc(300, 850);
  await p7.click('.mc-layer[data-layer="Mechanical"] [data-layer-act="eye"]');
  await p7.mouse.click(mx, my);
  ok(await p7.evaluate(() => window.markupcraft.sel.size) === 0, 'a hidden layer\'s markup cannot be picked');
  await p7.click('.mc-layer[data-layer="Mechanical"] [data-layer-act="eye"]');
  await p7.click('.mc-layer[data-layer="Mechanical"] [data-layer-act="lock"]');
  await p7.mouse.click(mx, my);
  ok(await p7.evaluate(() => window.markupcraft.sel.size) === 0, 'a locked layer\'s markup shows but cannot be picked');
  await p7.click('.mc-layer[data-layer="Mechanical"] [data-layer-act="lock"]');
  await p7.mouse.click(mx, my);
  ok(await p7.evaluate(() => window.markupcraft.sel.size) === 1, 'unlocked again: a click picks it');
  await p7.screenshot({ path: path.join(OUT, '17-layers.png') });
  console.log('\n== Arc and angle (K4)');
  await p7.locator('[data-over]').focus(); await p7.keyboard.press('Escape'); await p7.keyboard.press('o');
  for (const [x, y] of [[600, 300], [700, 380], [800, 300]]) { const [sx, sy] = await sc(x, y); await p7.mouse.click(sx, sy); }
  const arcM = await p7.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(arcM?.type === 'arc' && arcM.pts.length === 3, 'Arc: three clicks make an arc', arcM?.type);
  await p7.keyboard.press('x');
  for (const [x, y] of [[900, 300], [900, 500], [1100, 500]]) { const [sx, sy] = await sc(x, y); await p7.mouse.click(sx, sy); }
  const angM = await p7.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(angM?.type === 'angle' && Math.abs(angM.pts[0][1] - 300) < 3, 'Angle: three clicks make an angle measurement', angM?.type);
  await p7.keyboard.press('v');
  await p7.evaluate((id) => { const mc = window.markupcraft; mc.sel.clear(); mc.sel.add(id); }, angM.id);
  await p7.evaluate(() => window.markupcraft.setTool('select'));
  const [gx, gy] = await sc(900, 400); await p7.mouse.click(gx, gy);
  ok(/90\.0°/.test(await p7.locator('[data-pane="props"]').innerText()), 'Properties shows the angle: 90.0°');
  const fits = await p7.evaluate(() => { const tb = document.querySelector('.mc-tools'); const tops = new Set([...tb.querySelectorAll(':scope > [role="group"]')].map((g) => g.offsetTop)); return { rows: tops.size, over: tb.scrollWidth - tb.clientWidth }; });
  ok(fits.rows === 1 && fits.over <= 0, 'the toolbar still fits one row at 1280 px', fits);
  await p7.screenshot({ path: path.join(OUT, '18-arc-angle.png') });

  console.log('\n== Pictures and signatures (K5)');
  const pngB64 = await p7.evaluate(() => { const c = document.createElement('canvas'); c.width = 120; c.height = 60; const g = c.getContext('2d'); g.fillStyle = '#ff0000'; g.fillRect(0, 0, 60, 60); g.fillStyle = '#0000ff'; g.fillRect(60, 0, 60, 60); return c.toDataURL('image/png'); });
  ok(await p7.evaluate((src) => window.markupcraft.setPicture(src, 'Logo'), pngB64), 'a picture can be chosen as the stamp');
  await p7.locator('[data-over]').focus(); await p7.keyboard.press('s');
  { const [px, py] = await sc(700, 1000); await p7.mouse.click(px, py); }
  const pic = await p7.evaluate(() => { const m = window.markupcraft.store.all().at(-1); return { type: m.type, label: m.label, w: m.rect[2] - m.rect[0], h: m.rect[3] - m.rect[1] }; });
  ok(pic.type === 'image' && pic.label === 'Logo' && Math.round(pic.w) === 216 && Math.round(pic.h) === 108, 'a click places the picture 3 in wide, proportions kept', pic);
  await p7.evaluate(() => window.markupcraft.setTool('stamp'));   // the placed picture is selected: back to the tool's settings
  const sigSel = p7.locator('[data-pane="props"] select', { has: p7.locator('option', { hasText: 'My signature…' }) });
  await sigSel.selectOption({ label: 'My signature…' });
  await p7.waitForSelector('canvas.mc-sig');
  const sb = await p7.locator('canvas.mc-sig').boundingBox();
  await p7.mouse.move(sb.x + 40, sb.y + 120); await p7.mouse.down();
  for (let i = 1; i <= 12; i++) await p7.mouse.move(sb.x + 40 + i * 25, sb.y + 120 - Math.sin(i) * 40);
  await p7.mouse.up();
  await p7.click('dialog.mc-dialog button[data-key="ok"]');
  await p7.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  { const [px, py] = await sc(400, 1100); await p7.mouse.click(px, py); }
  const sig = await p7.evaluate(() => { const m = window.markupcraft.store.all().at(-1); return { type: m.type, label: m.label, subject: m.subject, png: /^data:image\/png;base64,/.test(m.img), kept: !!localStorage.getItem('markupcraft.signature') }; });
  ok(sig.type === 'image' && sig.label === 'Signature' && sig.png && sig.kept, 'a drawn signature is kept in the browser and placed like a stamp', sig);
  await p7.screenshot({ path: path.join(OUT, '19-picture-signature.png') });

  console.log('\n== Area cut-outs (K8)');
  const areaId = await p7.evaluate(() => { const mc = window.markupcraft; const k = mc.sheets[mc.cur].page.key; return mc.store.change('t', (tx) => { tx.setCalibration(k, { mmPerPt: 25.4 / 72 * 48, unit: 'ft-in', label: '1/4" = 1\'-0"' }); return tx.add({ sheet: k, type: 'area', pts: [[100, 1300], [388, 1300], [388, 1444], [100, 1444]], author: 'Cut' }).id; }); });
  await p7.evaluate((id) => { window.markupcraft.setTool('select'); }, areaId);
  { const [ax, ay] = await sc(100, 1370); await p7.mouse.click(ax, ay); }
  await p7.click('[data-pane="props"] button:has-text("Add a cut-out")');
  for (const [x, y] of [[150, 1340], [222, 1340], [222, 1412], [150, 1412]]) { const [cx2, cy2] = await sc(x, y); await p7.mouse.click(cx2, cy2); await p7.waitForTimeout(120); }
  await p7.keyboard.press('Enter');
  const cut = await p7.evaluate((id) => ({ holes: window.markupcraft.store.get(id).holes?.length || 0, status: document.querySelector('[data-status]').textContent }), areaId);
  ok(cut.holes === 1 && /112\.00 sq ft/.test(cut.status), 'Add a cut-out: drawn inside the selected area, the area drops to 112.00 sq ft', cut);

  console.log('\n== Spaces (K17)');
  await p7.click('[data-spaces] > summary');
  await p7.click('[data-act="space-new"]');
  for (const [x, y] of [[80, 1280], [420, 1280], [420, 1470], [80, 1470]]) { const [sx2, sy2] = await sc(x, y); await p7.mouse.click(sx2, sy2); await p7.waitForTimeout(120); }
  await p7.keyboard.press('Enter');
  await p7.waitForSelector('#mc-dlg-space');
  await p7.fill('#mc-dlg-space', 'Kitchen');
  await p7.click('dialog.mc-dialog button[data-key="ok"]');
  await p7.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok(/Added the space Kitchen: 1 markup is in it/.test(await p7.locator('[data-status]').innerText()) && await p7.locator('[data-space-list] .mc-layer').count() === 1, 'New space: drawn round the area, named, listed with what is in it', await p7.locator('[data-status]').innerText());
  await p7.click('[data-tab="list"]');
  await p7.selectOption('[data-filter="space"]', 'Kitchen');
  ok(await p7.locator('[data-list] > li').count() === 1, 'the Markups list filters by space');
  await p7.selectOption('[data-filter="space"]', '');
  await p7.click('[data-tab="props"]');

  console.log('\n== Sketch to scale (K18)');
  await p7.locator('[data-over]').focus(); await p7.keyboard.press('Escape'); await p7.keyboard.press('y');
  { const [x1, y1] = await sc(500, 1300); await p7.mouse.click(x1, y1); const [x2, y2] = await sc(700, 1300); await p7.mouse.move(x2, y2); }
  await p7.keyboard.press('1'); await p7.keyboard.type('6'); await p7.keyboard.press('Enter');
  await p7.keyboard.press('8'); await p7.keyboard.type(' < 90'); await p7.keyboard.press('Enter');
  await p7.keyboard.press('Enter');
  const sk = await p7.evaluate(() => window.markupcraft.store.all().at(-1));
  const okPts = sk?.type === 'polyline' && sk.pts.length === 3 && Math.abs(sk.pts[1][0] - sk.pts[0][0] - 288) < 0.01 && Math.abs(sk.pts[2][1] - sk.pts[1][1] - 144) < 0.01;
  ok(okPts, 'typed lengths: 16 ft to the right, then 8 ft straight up (a polyline of 288 pt and 144 pt)', sk?.pts);

  console.log('\n== Custom columns (K19)');
  await p7.click('[data-tab="list"]');
  await p7.click('[data-act="list-columns"]');
  await p7.click('dialog.mc-dialog button:has-text("Add a column")');
  await p7.fill('.mc-col-row input[aria-label="Column name"]', 'Trade');
  await p7.selectOption('.mc-col-row select', 'choice');
  await p7.fill('.mc-col-row input[aria-label="Choices, separated by commas"]', 'Mechanical, Electrical');
  await p7.click('dialog.mc-dialog button[data-key="ok"]');
  await p7.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  await p7.evaluate((id) => { const mc = window.markupcraft; mc.sel.clear(); mc.sel.add(id); }, areaId);
  await p7.click('[data-tab="props"]');
  await p7.evaluate(() => window.markupcraft.setTool('select'));
  { const [ax, ay] = await sc(100, 1370); await p7.mouse.click(ax, ay); }
  const trade = p7.locator('[data-pane="props"] label:has-text("Trade")');
  await p7.selectOption('#' + await trade.getAttribute('for'), 'Electrical');
  ok(await p7.evaluate((id) => window.markupcraft.store.get(id).fields.c1, areaId) === 'Electrical', 'a custom choice column is set in Properties');
  await p7.click('[data-tab="list"]');
  await p7.selectOption('[data-filter="field"]', { label: 'Trade: Electrical' });
  ok(await p7.locator('[data-list] > li').count() === 1 && /Trade: Electrical/.test(await p7.locator('[data-list]').innerText()), 'the list filters by the column and shows its value');
  await p7.selectOption('[data-filter="field"]', '');
  ok(await p7.locator('[data-sort] option', { hasText: 'Trade' }).count() === 1, 'and can sort by it');
  await p7.click('[data-tab="props"]');

  console.log('\n== Photos on markups (K20)');
  const photoPath = path.join(TMP, 'site photo.png'); fs.writeFileSync(photoPath, Buffer.from(pngB64.split(',')[1], 'base64'));
  await p7.evaluate(() => window.markupcraft.setTool('select'));
  { const [ax, ay] = await sc(100, 1370); await p7.mouse.click(ax, ay); }
  await p7.fill('[data-pane="props"] .mc-thread-sec textarea', 'Column base');
  const [pc] = await Promise.all([p7.waitForEvent('filechooser'), p7.click('[data-pane="props"] button[data-photo]')]);
  await pc.setFiles(photoPath);
  await p7.waitForSelector('[data-pane="props"] .mc-thread-photo img', { timeout: 15000 });
  const ph = await p7.evaluate((id) => { const r = window.markupcraft.store.get(id).replies.at(-1); return { text: r.text, png: /^data:image\/png;base64,/.test(r.photo) }; }, areaId);
  ok(ph.text === 'Column base' && ph.png, 'Add photo: the photo joins the thread with the typed caption, shown as a thumbnail', ph);
  await p7.screenshot({ path: path.join(OUT, '21-photo-thread.png') });

  console.log('\n== Rotate the view (K10)');
  const before10 = await p7.evaluate(() => window.markupcraft.view.toScreen([600, 600]));
  await p7.click('[data-act="view-cw"]');
  await p7.waitForTimeout(300);
  const r10 = await p7.evaluate(() => ({ seen: window.markupcraft.view.seenRotate, at: window.markupcraft.view.toScreen([600, 600]), mid: window.markupcraft.view.toUser(window.markupcraft.view.w / 2, window.markupcraft.view.h / 2) }));
  ok(r10.seen === 90 && Math.hypot(r10.at[0] - before10[0], r10.at[1] - before10[1]) > 5, 'Turn the view: the sheet turns a quarter clockwise on screen', r10);
  await p7.locator('[data-over]').focus(); await p7.keyboard.press('Escape'); await p7.keyboard.press('t');
  { const [tx, ty] = await sc(r10.mid[0], r10.mid[1]); await p7.mouse.click(tx, ty); }
  await p7.keyboard.type('Turned view note'); await p7.keyboard.press('Control+Enter');
  const tv = await p7.evaluate(() => window.markupcraft.store.all().at(-1));
  ok(tv?.type === 'text' && tv.rot === 90 && tv.text === 'Turned view note', 'text typed on the turned view reads upright as seen (rot 90)', { type: tv?.type, rot: tv?.rot });
  await p7.click('[data-act="view-ccw"]');
  ok(await p7.evaluate(() => window.markupcraft.view.seenRotate) === 0, 'and back');
  const [lsv] = await Promise.all([p7.waitForEvent('download'), p7.keyboard.press('Control+s')]);
  const lsPath = path.join(TMP, 'layers.pdf'); await lsv.saveAs(lsPath);
  const lyDoc = await PDFLib.PDFDocument.load(fs.readFileSync(lsPath));
  const locp = lyDoc.catalog.lookup(PDFLib.PDFName.of('OCProperties'));
  ok(locp && locp.lookup(PDFLib.PDFName.of('OCGs')).asArray().some((r) => lyDoc.context.lookup(r).lookup(PDFLib.PDFName.of("Name")).decodeText() === "Mechanical"), 'the saved PDF carries the layer as an optional content group');
  await p7.close();

  console.log('\n== File › New: blank pages (owner, 2026-10-15)');
  {
    const pn = await ctx.newPage();
    pn.on('console', (m) => { if (m.type() === 'error') problems.push('new tab console: ' + m.text()); });
    pn.on('pageerror', (e) => problems.push('new tab pageerror: ' + e.message));
    await pn.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
    await noRecover(pn);
    await pn.evaluate(() => localStorage.removeItem('markupcraft.blank'));
    ok(await pn.locator('.mc-tools [data-act="new"]').isVisible() && await pn.locator('.mc-hint [data-act="new"]').isVisible() && await pn.locator('[data-add-blank]').isHidden(), 'New in the File group and on the start screen; "Add a blank page" hidden with nothing open');
    // Ctrl+N opens the dialog when the page gets the key (headless Chromium hands it over); Esc cancels
    await pn.locator('[data-over]').focus();
    await pn.keyboard.press('Control+n');
    ok(await pn.waitForSelector('dialog.mc-dialog[open] #mc-dlg-paper', { timeout: 5000 }).then(() => true, () => false), 'Ctrl+N opens the New dialog');
    await pn.keyboard.press('Escape');
    await pn.waitForSelector('dialog.mc-dialog', { state: 'detached' });
    ok(await pn.evaluate(() => window.markupcraft.files.length) === 0, 'Esc cancels: nothing made');
    await pn.click('.mc-tools [data-act="new"]');
    await pn.waitForSelector('dialog.mc-dialog[open] #mc-dlg-paper');
    const papers = await pn.$$eval('#mc-dlg-paper option', (o) => o.map((x) => x.value));
    ok(papers.join() === 'letter,tabloid,arch-d,arch-e,a4,a3,a1' && await pn.locator('input[name="mc-new-orient"]').count() === 2 && await pn.locator('input[name="mc-new-grid"]').count() === 3, 'the dialog offers the seven papers, portrait/landscape and three grids', papers);
    await pn.selectOption('#mc-dlg-paper', 'arch-d');
    await pn.check('input[name="mc-new-orient"][value="landscape"]');
    await pn.check('input[name="mc-new-grid"][value="square"]');
    await pn.fill('#mc-dlg-blank-pages', '25');
    await pn.click('dialog.mc-dialog button[data-key="ok"]');
    ok(/1 to 20/.test(await pn.locator('.mc-dlg-err').innerText()), 'more than 20 pages is refused in the dialog');
    await pn.fill('#mc-dlg-blank-pages', '2');
    await pn.screenshot({ path: path.join(OUT, '30-new-dialog.png') });
    await pn.click('dialog.mc-dialog button[data-key="ok"]');
    await pn.waitForFunction(() => window.markupcraft.sheets.length === 2 && window.markupcraft.view.page, null, { timeout: 30000 });
    await pn.waitForFunction(() => /^New /.test(document.querySelector('[data-status]').textContent), null, { timeout: 10000 }).catch(() => {});
    const nb = await pn.evaluate(() => { const mc = window.markupcraft; return { name: mc.files[0].name, blank: mc.files[0].blank, w: mc.sheets[0].page.width, h: mc.sheets[0].page.height, scale: document.querySelector('[data-scale]').textContent.trim(), status: document.querySelector('[data-status]').textContent, dirty: mc.store.dirtySheets.size }; });
    ok(nb.name === 'Untitled-1.pdf' && nb.w === 2592 && nb.h === 1728 && nb.blank?.grid === 'square', 'Create: "Untitled-1.pdf", two ARCH D landscape sheets (2592 × 1728 pt) with a square grid', nb);
    ok(/Not calibrated/.test(nb.scale) && /Not calibrated/.test(nb.status) && nb.dirty === 0, 'blank sheets start with no scale and nothing unsaved', nb);
    ok(await pn.locator('[data-add-blank]').isVisible(), '"Add a blank page" shows under the sheets of a blank set');
    await pn.click('[data-add-blank]');
    await pn.waitForFunction(() => window.markupcraft.sheets.length === 3 && document.querySelector('[data-busy]').hidden, null, { timeout: 30000 });
    const ad = await pn.evaluate(() => { const mc = window.markupcraft; return { cur: mc.cur, w: mc.sheets[2].page.width, grid: mc.files[0].blank?.grid, status: document.querySelector('[data-status]').textContent }; });
    ok(ad.cur === 2 && ad.w === 2592 && ad.grid === 'square' && /Added a blank page at the end of Untitled-1\.pdf \(page 3\)/.test(ad.status), 'Add a blank page: a third sheet like the others, shown', ad);
    // draw on it with the pointer, like on any PDF
    await pn.evaluate(() => window.markupcraft.goTo(0));
    const nbox = await pn.locator('[data-over]').boundingBox();
    const atN = async (x, y) => { const [sx, sy] = await pn.evaluate(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]); return [nbox.x + sx, nbox.y + sy]; };
    await pn.locator('[data-over]').focus();
    await pn.keyboard.press('r');
    const authorDlg = await pn.waitForSelector('#mc-dlg-author', { timeout: 1500 }).catch(() => null);
    if (authorDlg) { await pn.fill('#mc-dlg-author', 'Blank Tester'); await pn.click('dialog.mc-dialog button[data-key="save"]'); await pn.waitForSelector('dialog.mc-dialog', { state: 'detached' }); }
    const [a0, b0] = await atN(400, 400), [a1, b1] = await atN(1200, 900);
    await pn.mouse.move(a0, b0); await pn.mouse.down(); await pn.mouse.move(a1, b1, { steps: 6 }); await pn.mouse.up();
    await pn.keyboard.press('Escape');
    const drawn = await pn.evaluate(() => window.markupcraft.store.all().map((m) => ({ type: m.type, sheet: m.sheet, rect: m.rect.map(Math.round) })));
    ok(drawn.length === 1 && drawn[0].type === 'rect' && drawn[0].sheet.endsWith(':0') && Math.abs(drawn[0].rect[2] - drawn[0].rect[0] - 800) < 20, 'a rectangle drawn on the blank sheet with the pointer', drawn);
    await pn.screenshot({ path: path.join(OUT, '31-new-blank-drawn.png') });
    const [nsv] = await Promise.all([pn.waitForEvent('download'), pn.keyboard.press('Control+s')]);
    const nPath = path.join(TMP, nsv.suggestedFilename()); await nsv.saveAs(nPath);   // reopened under its own name
    const nDoc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(nPath)), standardFontDataUrl: STD_FONTS }).promise;
    const nAnn = await (await nDoc.getPage(1)).getAnnotations({ intent: 'any' });
    ok(nsv.suggestedFilename() === 'Untitled-1 (marked up).pdf' && nDoc.numPages === 3 && nAnn.length === 1 && nAnn[0].subtype === 'Square', 'Save: "Untitled-1 (marked up).pdf", three pages, the rectangle as a Square annotation', { name: nsv.suggestedFilename(), pages: nDoc.numPages, annots: nAnn.map((a) => a.subtype) });
    await nDoc.loadingTask.destroy();
    // reopen the saved copy: the markup comes back editable, the set is still a blank set
    await pn.click('.mc-tools [data-act="close"]');
    await pn.waitForFunction(() => window.markupcraft.files.length === 0, null, { timeout: 10000 });
    await pn.setInputFiles('[data-file]', [nPath]);
    await pn.waitForFunction(() => window.markupcraft.sheets.length === 3 && window.markupcraft.view.page, null, { timeout: 30000 });
    const ro = await pn.evaluate(() => { const mc = window.markupcraft; return { marks: mc.store.all().map((m) => [m.type, m.locked, m.sheet]), grid: mc.files[0].blank?.grid, add: !document.querySelector('[data-add-blank]').hidden }; });
    ok(ro.marks.length === 1 && ro.marks[0][0] === 'rect' && !ro.marks[0][1] && ro.grid === 'square' && ro.add, 'reopened: the rectangle is editable again, and pages can still be added', ro);
    // a second New in the same tab is Untitled-2
    await pn.evaluate(() => window.markupcraft.newBlank({ paper: 'a4', grid: 'dot', pages: 1 }));
    const names = await pn.evaluate(() => window.markupcraft.files.map((f) => f.name).join('|'));
    ok(names === 'Untitled-1 (marked up).pdf|Untitled-2.pdf', 'the next New is Untitled-2.pdf, opened beside the set', names);
    await pn.screenshot({ path: path.join(OUT, '32-new-reopened.png') });
    await pn.close();
  }

  console.log('\n== The desktop app (host.js, W.2): a stand-in bridge');
  {
    const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 800 }, storageState: await ctx.storageState() });
    await ctx3.addInitScript((b64) => {
      const plan = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const files = new Map([['C:\\Jobs\\kitchen-plan-sheet.pdf', plan]]);
      window.__desk = { writes: [], dialogs: 0 };
      let launched = false;
      window.cadcraftDesktop = {
        version: 1,
        openDialog: async () => ['C:\\Jobs\\kitchen-plan-sheet.pdf'],
        saveDialog: async ({ defaultPath }) => { window.__desk.dialogs++; return 'C:\\Jobs\\' + defaultPath; },
        readFile: async (p) => files.get(p),
        writeFile: async (p, bytes) => { files.set(p, bytes); window.__desk.writes.push([p, bytes.length]); },
        stat: async (p) => (files.has(p) ? { size: files.get(p).length, mtime: 0 } : null),
        launchFiles: async () => (launched ? [] : (launched = true, ['C:\\Jobs\\kitchen-plan-sheet.pdf'])),
        onOpenFiles: () => {},
      };
    }, fs.readFileSync(PLAN).toString('base64'));
    const pd = await ctx3.newPage();
    pd.on('pageerror', (e) => problems.push('desktop pageerror: ' + e.message));
    await pd.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
    await noRecover(pd);
    await pd.waitForFunction(() => window.markupcraft.sheets.length === 1, null, { timeout: 20000 }).catch(() => {});
    ok(await pd.evaluate(() => window.markupcraft.files[0]?.name) === 'kitchen-plan-sheet.pdf', 'a PDF the desktop app was started with opens at once');
    await pd.evaluate(() => { const mc = window.markupcraft; mc.store.change('d', (tx) => tx.add({ sheet: mc.sheets[0].page.key, type: 'rect', rect: [100, 100, 200, 200], author: 'Desk' })); });
    await pd.locator('[data-over]').focus();
    await pd.keyboard.press('Control+s');
    await pd.waitForFunction(() => window.__desk.writes.length === 1, null, { timeout: 15000 }).catch(() => {});
    await pd.evaluate(() => { const mc = window.markupcraft; mc.store.change('d2', (tx) => tx.add({ sheet: mc.sheets[0].page.key, type: 'rect', rect: [300, 100, 400, 200], author: 'Desk' })); });
    await pd.keyboard.press('Control+s');
    await pd.waitForFunction(() => window.__desk.writes.length === 2, null, { timeout: 15000 }).catch(() => {});
    const desk = await pd.evaluate(() => window.__desk);
    ok(desk.dialogs === 1 && desk.writes.length === 2 && desk.writes.every(([p]) => p === 'C:\\Jobs\\kitchen-plan-sheet (marked up).pdf'), 'Save: the first asks where the marked-up copy goes, the next writes it in place; the original is not overwritten', desk);
    await ctx3.close();
  }

  console.log('\n== Language files (0.4 item 0.5): the pseudo-locale');
  const p8 = await ctx.newPage();
  p8.on('pageerror', (e) => problems.push('tab 8 pageerror: ' + e.message));
  await p8.goto(BASE + '/lab/markupcraft?space=paper&lang=en-XA', { waitUntil: 'networkidle' });
  await noRecover(p8);
  const pseudo = await p8.evaluate(() => [...document.querySelectorAll('.mc-tools .mc-tool span, .mc-tab, .mc-hint-h, [data-sheets-empty], [data-scale]')].map((e) => e.textContent.trim()));
  ok(pseudo.length > 30 && pseudo.every((x) => /^\[.*\]$/.test(x)), 'en-XA: every toolbar label, tab and status word comes from the language file', pseudo.filter((x) => !/^\[.*\]$/.test(x)));
  await p8.screenshot({ path: path.join(OUT, '14-pseudo-locale.png') });
  await p8.goto(BASE + '/lab/markupcraft?space=paper&lang=en', { waitUntil: 'networkidle' });
  await p8.close();
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e.message));
  await page.screenshot({ path: path.join(OUT, 'zz-failure.png') }).catch(() => {});
} finally {
  ok(problems.length === 0, 'no console errors, page errors or failed requests' + (problems.length ? ':\n       ' + problems.join('\n       ') : ''));
  await browser.close();
  if (!args.includes('--keep-admin')) execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down']);
  fs.rmSync(REV, { force: true });
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Screenshots in ' + path.relative(REPO, OUT));
process.exit(fail ? 1 : 0);
