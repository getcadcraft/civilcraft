#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft 0.7.1 rows 71.6–71.9 in a real (headless) browser, against the live vhost:
 *   node tools/markupcraft-test/browser-071.mjs [--out tmp/shots/markupcraft-071] [--keep-admin]
 *
 * 71.6 copy and paste: page content selected with the Content tool (Ctrl+C / X / V / Shift+V / D, the Edit menu, the
 *      right-click menu) on the same page, another page and another open PDF; markups by the right-click menu too.
 * 71.7 a picture from a file (the Edit menu's Insert a picture: SVG, a PDF page; dropped PNG) and "Flatten into the page
 *      when saved" (Save draws it into the page; it stays a markup until then).
 * 71.8 a signature from a file (a JPEG on white paper made see-through), the signature list.
 * 71.9 a selection saved as a stamp in the tool chest (markups, and page content) and placed with a click.
 * Plus the desktop app (a stand-in `window.cadcraftDesktop`): the picture comes through its own file dialog.
 * Screenshots; fails on any console error. Run as root (it calls `sudo -u www-data php` for the MarkupCraft test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const PDFLib = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const bc = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/markupcraft/dev/base-content.js')).href);
const corpus = await import(pathToFileURL(path.join(HERE, 'base-corpus.mjs')).href);
const { createCanvas } = await import(pathToFileURL(path.join(HERE, 'node_modules/@napi-rs/canvas/index.js')).href);

const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-071');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-071-'));
const AWK = path.join(TMP, 'awkward.pdf');
fs.writeFileSync(AWK, corpus.awkward());
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
// pictures made here: an SVG logo, a two-page PDF (page 2 = a stamp), a PNG, a signature scanned on white paper (JPEG)
const SVG = path.join(TMP, 'logo.svg');
fs.writeFileSync(SVG, '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect x="5" y="5" width="190" height="90" fill="none" stroke="#1e48c8" stroke-width="8"/><circle cx="100" cy="50" r="25" fill="#d0021b"/></svg>');
const STAMP_PDF = path.join(TMP, 'stamps.pdf');
{
  const d = await PDFLib.PDFDocument.create();
  d.addPage([300, 300]).drawCircle({ x: 150, y: 150, size: 100, color: PDFLib.rgb(0, 0.5, 0) });
  const p2 = d.addPage([400, 150]);
  p2.drawRectangle({ x: 10, y: 10, width: 380, height: 130, borderColor: PDFLib.rgb(0.8, 0, 0), borderWidth: 6 });
  fs.writeFileSync(STAMP_PDF, await d.save());
}
const pngOf = (w, h, paint) => { const c = createCanvas(w, h); const g = c.getContext('2d'); paint(g); return c; };
const PNG = path.join(TMP, 'photo.png');
fs.writeFileSync(PNG, pngOf(60, 30, (g) => { g.fillStyle = '#c25e00'; g.fillRect(0, 0, 60, 30); }).toBuffer('image/png'));
const SIG = path.join(TMP, 'signature-scan.jpg');
fs.writeFileSync(SIG, pngOf(400, 160, (g) => { g.fillStyle = '#fbfbf8'; g.fillRect(0, 0, 400, 160); g.strokeStyle = '#14204a'; g.lineWidth = 6; g.beginPath(); g.moveTo(60, 110); g.bezierCurveTo(120, 20, 180, 140, 240, 60); g.lineTo(330, 100); g.stroke(); }).toBuffer('image/jpeg'));

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const until = async (pg, fn, arg, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await new Promise((r) => setTimeout(r, 250)); } return false; };
const noRecover = async (pg) => {
  const n = await pg.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  const d = n ? await pg.waitForSelector('dialog[data-autosave-dialog][open]', { timeout: 10000 }).catch(() => null) : null;
  if (d) { await pg.click('[data-autosave-discard-all]'); await pg.waitForSelector('dialog[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
};

const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'up'], { encoding: 'utf8' }));
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
const page = await ctx.newPage();
const problems = [];
const watch = (pg, tag = '') => {
  pg.on('console', (m) => { if (m.type() === 'error') problems.push(tag + 'console: ' + m.text()); });
  pg.on('pageerror', (e) => problems.push(tag + 'pageerror: ' + e.message));
  pg.on('response', (r) => { if (r.status() >= 400) problems.push(tag + r.status() + ': ' + r.url()); });
};
watch(page);

const status = () => page.locator('[data-status]').innerText();
const baseState = (i = null) => page.evaluate((idx) => { const mc = window.markupcraft; const k = mc.sheets[idx ?? mc.cur]?.page.key; return JSON.parse(JSON.stringify(mc.store.base.get(k) || null)); }, i);
const pasted = async (i = null) => ((await baseState(i))?.add || []).filter((a) => a.kind === 'pdf');
const settled = () => page.evaluate(async () => { const s = window.markupcraft.sheets[window.markupcraft.cur]; await window.markupcraft.base.settled(s.file); return true; });
const markups = () => page.evaluate(() => window.markupcraft.store.all().map((m) => ({ id: m.id, type: m.type, rect: m.rect, label: m.label, flat: !!m.flat, img: m.img ? m.img.slice(0, 22) : '' })));

try {
  console.log('\n== Sign in, open two PDFs');
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  await page.evaluate(() => { try { for (const k of ['markupcraft.signatures', 'markupcraft.signature', 'markupcraft.contentclip', 'markupcraft.clipboard']) localStorage.removeItem(k); } catch { /* none */ } });
  await page.setInputFiles('[data-file]', [AWK, PLAN]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 2 && window.markupcraft.view.page, null, { timeout: 30000 });
  await page.evaluate(() => window.markupcraft.goTo(0));
  await page.waitForTimeout(400);
  const box = await page.locator('[data-over]').boundingBox();
  const at = async (x, y) => { const [sx, sy] = await page.evaluate(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]); return [box.x + sx, box.y + sy]; };
  const clickUser = async (x, y, opts) => { const [a, b] = await at(x, y); await page.mouse.click(a, b, opts); };
  const over = page.locator('[data-over]');

  console.log('\n== 71.6 page content: copy and paste');
  await over.focus();
  await page.keyboard.press('b');
  await page.evaluate(() => window.markupcraft.base.ready());
  await until(page, () => !!window.markupcraft.base.objects());
  await clickUser(60, 656);                          // "Hello (world) \ AB"
  await page.keyboard.down('Shift'); await clickUser(60, 632); await page.keyboard.up('Shift');   // + "Kerned Text"
  const selKeys = await page.evaluate(() => window.markupcraft.base.selection);
  ok(selKeys.length === 2, 'two lines of the page\'s text selected with the Content tool', selKeys);
  ok(!(await page.locator('[data-act="copy"]').first().isDisabled()), 'Edit › Copy is on for a Content selection (it was off: the reported bug)');
  await page.keyboard.press('Control+c');
  await until(page, () => /Copied 2 page objects/.test(document.querySelector('[data-status]').textContent));
  ok(/Copied 2 page objects/.test(await status()), 'Ctrl+C copies them', await status());
  ok(await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('markupcraft.contentclip')).n === 2; } catch { return false; } }), 'the copy is shared with other tabs');
  await page.keyboard.press('Control+Shift+v');
  await until(page, () => (window.markupcraft.store.base.get(window.markupcraft.sheets[0].page.key)?.add || []).length === 1);
  let ps = await pasted();
  ok(ps.length === 1 && ps[0].T.join() === '1,0,0,1,0,0', 'Ctrl+Shift+V pastes in place (same page-space position)', ps.map((p) => p.T));
  ok(JSON.stringify(await page.evaluate(() => window.markupcraft.base.selection)) === JSON.stringify(['a:' + ps[0].id]), 'the paste is selected, as one piece');
  const [mx, my] = await at(300, 450);
  await page.mouse.move(mx, my);
  await page.keyboard.press('Control+v');
  await until(page, () => (window.markupcraft.store.base.get(window.markupcraft.sheets[0].page.key)?.add || []).length === 2);
  ps = await pasted();
  ok(ps.length === 2 && (ps[1].T[4] !== 0 || ps[1].T[5] !== 0), 'Ctrl+V pastes again, moved (beside, or at the pointer as Settings say)', ps[1]?.T);
  await settled();
  await page.screenshot({ path: path.join(OUT, '01-content-pasted.png') });
  await page.keyboard.press('Control+z');
  await until(page, () => (window.markupcraft.store.base.get(window.markupcraft.sheets[0].page.key)?.add || []).length === 1);
  ok((await pasted()).length === 1, 'Ctrl+Z takes the last paste away (one step)');
  // Ctrl+D duplicates the selection without touching the clipboard
  await page.evaluate(() => window.markupcraft.base.select([window.markupcraft.base.objects().find((o) => o.kind === 'picture').key]));
  await page.keyboard.press('Control+d');
  await until(page, () => (window.markupcraft.store.base.get(window.markupcraft.sheets[0].page.key)?.add || []).length === 2);
  ok((await pasted()).length === 2 && await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.contentclip')).n === 2), 'Ctrl+D duplicates a picture beside itself; the clipboard still holds the 2 lines');
  // another PDF
  await page.evaluate(() => window.markupcraft.goTo(1));
  await page.waitForTimeout(500);
  await over.focus();
  await page.keyboard.press('Control+v');
  await until(page, () => (window.markupcraft.store.base.get(window.markupcraft.sheets[1].page.key)?.add || []).length === 1, null, 20000);
  ok((await pasted(1)).length === 1 && await page.evaluate(() => window.markupcraft.tool) === 'content', 'pasted into the other open PDF (the Content tool comes on)');
  await settled();
  await page.screenshot({ path: path.join(OUT, '02-content-other-file.png') });
  // right-click menu on the paste: Delete
  const pb = (await page.evaluate(() => window.markupcraft.base.objects())).find((o) => o.kind === 'pasted').box;
  const [rx, ry] = await at((pb[0] + pb[2]) / 2, (pb[1] + pb[3]) / 2);
  await page.evaluate(() => window.markupcraft.base.select([]));
  await page.mouse.click(rx, ry, { button: 'right' });
  await page.waitForSelector('[data-ctx-menu]', { timeout: 5000 });
  const items = await page.locator('[data-ctx-menu] [data-ctx]').evaluateAll((bs) => bs.map((b) => b.dataset.ctx + (b.disabled ? ':off' : '')));
  ok(items.includes('cut') && items.includes('copy') && items.includes('paste-here') && items.includes('delete') && items.includes('save-stamp'), 'right click: the context menu (Cut, Copy, Paste here, Delete, Save as a stamp…)', items);
  ok((await page.evaluate(() => window.markupcraft.base.selection)).length === 1, 'right-clicking the paste selected it first');
  await page.screenshot({ path: path.join(OUT, '03-context-menu-content.png') });
  await page.click('[data-ctx-menu] [data-ctx="delete"]');
  await until(page, () => !(window.markupcraft.store.base.get(window.markupcraft.sheets[1].page.key)?.add || []).length);
  ok((await pasted(1)).length === 0 && await page.locator('[data-ctx-menu]').count() === 0, 'Delete from the menu; the menu closes');
  // Ctrl+X: cut
  await page.evaluate(() => window.markupcraft.goTo(0));
  await page.waitForTimeout(400);
  await over.focus();
  await page.keyboard.press('b');
  await page.evaluate(() => window.markupcraft.base.ready());
  await clickUser(60, 562);                          // "Scaled"
  await page.keyboard.press('Control+x');
  await until(page, () => /Cut 1 page object/.test(document.querySelector('[data-status]').textContent));
  const stCut = await baseState();
  ok(Object.values(stCut.o).some((e) => e.del) && await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.contentclip')).n === 1), 'Ctrl+X: the line is taken out of the page and on the clipboard');

  console.log('\n== 71.6 markups: the context menu');
  await page.keyboard.press('v');
  await page.evaluate(() => { const mc = window.markupcraft; mc.store.change('t', (tx) => tx.add({ sheet: mc.sheets[0].page.key, type: 'cloudrect', rect: [80, 380, 200, 460], style: { fill: '#ffeeaa', fillOpacity: 0.5 }, author: 'Test' })); });
  const [cx1, cy1] = await at(140, 420);
  await page.mouse.click(cx1, cy1, { button: 'right' });
  await page.waitForSelector('[data-ctx-menu]', { timeout: 5000 });
  ok(await page.evaluate(() => window.markupcraft.sel.size) === 1, 'right-clicking a markup selects it');
  await page.click('[data-ctx-menu] [data-ctx="copy"]');
  ok(/Copied 1 markup/.test(await status()), 'Copy from the menu', await status());
  const [cx2, cy2] = await at(400, 200);
  await page.mouse.click(cx2, cy2, { button: 'right' });
  await page.waitForSelector('[data-ctx-menu]', { timeout: 5000 });
  await page.click('[data-ctx-menu] [data-ctx="paste-here"]');
  await page.waitForTimeout(300);
  const ms1 = (await markups()).filter((m) => m.type === 'cloudrect');
  const last = ms1.at(-1);
  ok(ms1.length === 2 && Math.abs((last.rect[0] + last.rect[2]) / 2 - 400) < 2 && Math.abs((last.rect[1] + last.rect[3]) / 2 - 200) < 2, 'Paste here: the copy lands centred where the menu was opened', last?.rect);
  await page.keyboard.press('Escape');

  console.log('\n== 71.7 pictures from files, flatten when saved');
  ok(await page.locator('[data-edit-menu] [data-act="insert-picture"]').count() === 1, 'Edit › More has Insert a picture from a file…');
  await page.click('[data-edit-menu] > summary');
  const [fc1] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-edit-menu] [data-act="insert-picture"]')]);
  await fc1.setFiles(SVG);
  await until(page, () => window.markupcraft.store.all().some((m) => m.type === 'image' && m.label === 'logo'));
  let pics = (await markups()).filter((m) => m.type === 'image');
  const logo = pics.find((m) => m.label === 'logo');
  ok(logo && logo.img.startsWith('data:image/png') && Math.abs((logo.rect[2] - logo.rect[0]) / (logo.rect[3] - logo.rect[1]) - 2) < 0.05, 'an SVG becomes a PNG picture markup, its proportions kept (2:1)', logo);
  const [fc2] = await Promise.all([page.waitForEvent('filechooser'), page.evaluate(() => { window.markupcraft.insertPicture(); })]);
  await fc2.setFiles(STAMP_PDF);
  await page.waitForSelector('dialog[open] #mc-dlg-page', { timeout: 10000 });
  await page.fill('#mc-dlg-page', '2');
  await page.click('dialog[open] button[data-key="ok"]');
  await until(page, () => window.markupcraft.store.all().some((m) => m.type === 'image' && m.label === 'stamps'));
  const st2 = (await markups()).find((m) => m.label === 'stamps');
  ok(st2 && Math.abs((st2.rect[2] - st2.rect[0]) / (st2.rect[3] - st2.rect[1]) - 400 / 150) < 0.05, 'a PDF: asked which page; page 2 (400 × 150) becomes the picture', st2?.rect);
  // dropped on the sheet
  const dropAt = await at(450, 600);
  await page.evaluate(async ([b64, x, y]) => {
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const dt = new DataTransfer(); dt.items.add(new File([bytes], 'photo.png', { type: 'image/png' }));
    document.querySelector('[data-stage]').dispatchEvent(new DragEvent('drop', { dataTransfer: dt, clientX: x, clientY: y, bubbles: true, cancelable: true }));
  }, [fs.readFileSync(PNG).toString('base64'), dropAt[0], dropAt[1]]);
  await until(page, () => window.markupcraft.store.all().some((m) => m.type === 'image' && m.label === 'photo'));
  const dropped = (await markups()).find((m) => m.label === 'photo');
  ok(dropped && Math.abs((dropped.rect[0] + dropped.rect[2]) / 2 - 450) < 3 && Math.abs((dropped.rect[1] + dropped.rect[3]) / 2 - 600) < 3, 'a PNG dropped on the sheet: a picture markup where it landed', dropped?.rect);
  ok(await page.evaluate(() => window.markupcraft.files.length) === 2, 'and no file was opened for it');
  // flatten when saved: the logo
  await page.evaluate((id) => { window.markupcraft.setTool('select'); window.markupcraft.select([id]); }, logo.id);   // the logo and the PDF stamp both landed mid-view
  await page.waitForSelector('[data-props] [data-flat]', { timeout: 5000 });
  await page.check('[data-props] [data-flat]');
  ok((await markups()).find((m) => m.id === logo.id).flat, 'Properties: "Flatten into the page when saved" ticked; it is still a markup');
  await page.screenshot({ path: path.join(OUT, '04-flatten-props.png') });
  await over.focus();
  const nMarks = (await page.evaluate(() => window.markupcraft.store.onSheet(window.markupcraft.sheets[0].page.key).length));
  const [down] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s').then(() => page.waitForSelector('dialog[open] button[data-key="one"]', { timeout: 3000 }).then(() => page.click('dialog[open] button[data-key="one"]')).catch(() => {}))]);
  const saved = path.join(TMP, 'saved.pdf');
  await down.saveAs(saved);
  ok(/flattened into the page/.test(await status()), 'Save says one was flattened', await status());
  const doc = await PDFLib.PDFDocument.load(fs.readFileSync(saved));
  const annots = (doc.getPage(0).node.Annots()?.asArray() || []).map((r) => doc.context.lookup(r)).filter((a) => a.get(PDFLib.PDFName.of('Subtype')).decodeText() !== 'Popup' && !a.get(PDFLib.PDFName.of('IRT')));
  ok(annots.length === nMarks - 1, 'saved: every markup but the flattened one is an annotation', { annots: annots.length, nMarks });
  const spc = bc.readPage(PDFLib, doc, 0);
  ok(spc.objects.filter((o) => o.kind === 'form' || o.kind === 'image').length > 4 && spc.objects.some((o) => o.kind === 'text' && o.text.startsWith('Hello') && o.where !== 'page'), 'saved: the picture is drawn into the page, the pasted words are in it', spc.objects.filter((o) => o.kind === 'form').length);
  ok((await markups()).find((m) => m.id === logo.id)?.flat === true, 'and it is still a movable markup here');

  console.log('\n== 71.8 a signature from a file');
  await page.evaluate(() => window.markupcraft.setTool('stamp'));
  const [fc3] = await Promise.all([page.waitForEvent('filechooser'), page.evaluate(() => { window.markupcraft.uploadSignature(); })]);
  await fc3.setFiles(SIG);
  await until(page, () => (JSON.parse(localStorage.getItem('markupcraft.signatures') || '[]')).length === 1);
  const sig = await page.evaluate(async () => {
    const s = JSON.parse(localStorage.getItem('markupcraft.signatures'))[0];
    const img = new Image(); img.src = s.src; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let clear = 0, solid = 0; for (let i = 3; i < d.length; i += 4) { if (d[i] === 0) clear++; else if (d[i] > 200) solid++; }
    return { png: s.src.startsWith('data:image/png'), w: img.width, h: img.height, clear, solid, name: s.name, inUse: JSON.parse(localStorage.getItem('markupcraft.signature')).src === s.src };
  });
  ok(sig.png && sig.clear > sig.solid && sig.solid > 50 && sig.w < 400 && sig.inUse, 'a JPEG scanned on paper: the paper made see-through, trimmed to the ink, kept and in use', sig);
  await page.evaluate(() => window.markupcraft.setTool('stamp'));
  const [fc4] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-props] [data-sig-upload]')]);
  await fc4.setFiles(PNG);
  await page.waitForSelector('dialog[open] button[data-key="keep"]', { timeout: 5000 });
  await page.click('dialog[open] button[data-key="keep"]');
  await until(page, () => (JSON.parse(localStorage.getItem('markupcraft.signatures') || '[]')).length === 2);
  await page.waitForTimeout(200);
  ok(await page.locator('[data-props] [data-sig-id]').count() === 2, 'a PNG kept as it is; the signature list shows both', await page.locator('[data-props] [data-sig-id]').count());
  await page.screenshot({ path: path.join(OUT, '05-signatures.png') });
  await page.locator('[data-props] [data-sig-id]').nth(1).click();
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.signature')).src === JSON.parse(localStorage.getItem('markupcraft.signatures'))[1].src), 'clicking one in the list uses it');
  const nImg = (await markups()).filter((m) => m.type === 'image').length;
  await clickUser(500, 300);
  ok((await markups()).filter((m) => m.type === 'image').length === nImg + 1, 'and a click places it');

  console.log('\n== 71.9 a selection as a stamp');
  await page.evaluate(() => { const mc = window.markupcraft; mc.setTool('select'); const ids = mc.store.all().filter((m) => m.type === 'cloudrect').map((m) => m.id); mc.select(ids); });
  await page.evaluate(() => { window.markupcraft.saveStamp(); });
  await page.waitForSelector('dialog[open] #mc-dlg-tool', { timeout: 5000 });
  await page.fill('#mc-dlg-tool', 'Two clouds');
  await page.click('dialog[open] button[data-key="save"]');
  await page.waitForTimeout(300);
  const row = page.locator('[data-chest] li', { hasText: 'Two clouds' });
  ok(await row.count() === 1 && /2 markups together/.test(await row.innerText()), 'saved in the tool chest as one stamp', await row.innerText().catch(() => ''));
  await row.locator('button').first().click();
  const before = (await markups()).filter((m) => m.type === 'cloudrect').length;
  await clickUser(300, 150);
  const clouds = (await markups()).filter((m) => m.type === 'cloudrect');
  ok(clouds.length === before + 2, 'one click with it places both markups', clouds.length - before);
  await page.screenshot({ path: path.join(OUT, '06-stamp-placed.png') });
  // page content as a stamp
  await over.focus();
  await page.keyboard.press('b');
  await page.evaluate(() => window.markupcraft.base.ready());
  await clickUser(60, 632);
  await page.click('[data-tab="props"]');
  await page.click('[data-props] [data-base-stamp]');
  await page.waitForSelector('dialog[open] #mc-dlg-tool', { timeout: 10000 });
  await page.click('dialog[open] button[data-key="save"]');
  await page.waitForTimeout(300);
  const crow = page.locator('[data-chest] li', { hasText: 'Page detail' });
  ok(await crow.count() === 1, 'page content saved as a stamp too');
  await crow.locator('button').first().click();
  const nAdd = (await pasted()).length;
  await clickUser(400, 100);
  await until(page, (n) => (window.markupcraft.store.base.get(window.markupcraft.sheets[0].page.key)?.add || []).filter((a) => a.kind === 'pdf').length === n + 1, nAdd);
  ok((await pasted()).length === nAdd + 1, 'a click with it draws that content into the page');
  ok(await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('markupcraft.chest')).some((t) => t.content && t.name === 'Page detail'); } catch { return false; } }), 'the chest is kept in this browser with both stamps');
  await page.evaluate(() => window.markupcraft.store.dirtySheets.clear());
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e.message));
  await page.screenshot({ path: path.join(OUT, 'zz-failure.png') }).catch(() => {});
}

// the desktop app: the picture comes through its own dialog, not the browser's, and is not listed as a recent drawing
try {
  console.log('\n== Desktop app (stand-in bridge)');
  const ctx3 = await browser.newContext({ viewport: { width: 1280, height: 800 }, storageState: await ctx.storageState() });   // signed in (the lab)
  await ctx3.addInitScript(([plan, png]) => {
    const files = new Map([['C:\\Jobs\\kitchen-plan-sheet.pdf', Uint8Array.from(atob(plan), (c) => c.charCodeAt(0))], ['C:\\Pics\\photo.png', Uint8Array.from(atob(png), (c) => c.charCodeAt(0))]]);
    let launched = false;
    window.__desk = { dialogs: [] };
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async (o) => { window.__desk.dialogs.push((o.filters || []).flatMap((f) => f.extensions).join(',')); return ['C:\\Pics\\photo.png']; },
      saveDialog: async () => null,
      readFile: async (p) => files.get(p),
      writeFile: async () => {},
      stat: async (p) => (files.has(p) ? { size: files.get(p).length, mtime: 0 } : null),
      launchFiles: async () => (launched ? [] : (launched = true, ['C:\\Jobs\\kitchen-plan-sheet.pdf'])),
      onOpenFiles: () => {},
    };
  }, [fs.readFileSync(PLAN).toString('base64'), fs.readFileSync(PNG).toString('base64')]);
  const pd = await ctx3.newPage();
  watch(pd, 'desktop ');
  await pd.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(pd);
  await pd.waitForFunction(() => window.markupcraft?.sheets.length === 1, null, { timeout: 30000 });
  await pd.evaluate(() => window.markupcraft.insertPicture());
  await until(pd, () => window.markupcraft.store.all().some((m) => m.type === 'image' && m.label === 'photo'));
  const desk = await pd.evaluate(async () => ({ dialogs: window.__desk.dialogs, recent: (await window.markupcraft.host?.recent?.list?.())?.map((e) => e.name) ?? null, pic: window.markupcraft.store.all().filter((m) => m.type === 'image').length }));
  ok(desk.pic === 1 && desk.dialogs.length === 1 && /png/.test(desk.dialogs[0]) && /pdf/.test(desk.dialogs[0]), 'Insert a picture: the desktop app\'s own dialog (PNG, JPEG, SVG, PDF), the picture placed', desk);
  ok(desk.recent === null || !desk.recent.includes('photo.png'), 'the picture is not listed as a recent drawing', desk.recent);
  await pd.evaluate(() => window.markupcraft.store.dirtySheets.clear());
  await ctx3.close();
} catch (e) {
  fail++;
  console.log('  FAIL desktop threw: ' + (e.stack || e.message));
} finally {
  ok(problems.length === 0, 'no console errors, page errors or failed requests' + (problems.length ? ':\n       ' + problems.join('\n       ') : ''));
  await browser.close();
  if (!args.includes('--keep-admin')) execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down']);
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed. Screenshots in ' + path.relative(REPO, OUT));
process.exit(fail ? 1 : 0);
