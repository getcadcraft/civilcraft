#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft 0.8: fillable PDF forms and Scroll mode in a real (headless) browser, against the live vhost (/lab):
 *   node tools/markupcraft-test/browser-forms.mjs [--out tmp/shots/markupcraft-forms]
 *
 * Forms (the report: "fillable forms in PDFs don't appear / work in MarkupCraft"), on the two files of form-corpus.mjs:
 *   fields with no appearance of their own are drawn (a ticked box, a picked radio button); a page whose other annotation became
 *   a markup still draws its field; Fill form (F) puts inputs over the fields; typing, ticking, picking; letters typed in a field
 *   don't switch tools; a double click on a field with Select turns Fill form on; Save writes the values into the fields (read
 *   back with pdf-lib); the saved copy opens with them; the values show on the sheet after Fill form is off.
 * Scroll mode (the ask: "allow scrolling in the main canvas … vs. tab per page — perhaps allow both"): the sheet bar's Scroll
 *   pages switch, the wheel scrolls through the pages and the open sheet follows, Ctrl + wheel zooms, pressing on another page
 *   makes it the one you work on, a rectangle drawn there lands on that page, Page Down goes to the next page in the column,
 *   the switch is remembered, and in a workspace layout the tabs are one per file in Scroll mode and one per page in Tabs.
 * Screenshots; fails on any console error. Run as root (it calls `sudo -u www-data php` for the MarkupCraft test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const PDFLib = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const forms = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/markupcraft/dev/forms.js')).href);
const corpus = await import(pathToFileURL(path.join(HERE, 'form-corpus.mjs')).href);

const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-forms');
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const AP = path.join(corpus.FORM_DIR, 'form-ap.pdf'), NOAP = path.join(corpus.FORM_DIR, 'form-noap.pdf');
if (!fs.existsSync(AP) || !fs.existsSync(NOAP)) { console.error('Make the files first: node tools/markupcraft-test/form-corpus.mjs'); process.exit(2); }

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const until = async (pg, fn, arg, ms = 15000) => { const end = Date.now() + ms; while (Date.now() < end) { if (await pg.evaluate(fn, arg).catch(() => false)) return true; await new Promise((r) => setTimeout(r, 200)); } return false; };
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
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('response', (r) => { if (r.status() >= 400) problems.push(r.status() + ': ' + r.url()); });

const status = () => page.locator('[data-status]').innerText();
/** Dark pixels of the BASE canvas inside a PDF-space box of the open sheet (what the sheet shows there). */
const inkIn = (rect) => page.evaluate((r) => {
  const v = window.markupcraft.view, c = document.querySelector('[data-base]');
  const a = v.toScreen([r[0], r[1]]), b = v.toScreen([r[2], r[3]]);
  const x = Math.round(Math.min(a[0], b[0]) * v.dpr), y = Math.round(Math.min(a[1], b[1]) * v.dpr);
  const w = Math.max(1, Math.round(Math.abs(b[0] - a[0]) * v.dpr)), h = Math.max(1, Math.round(Math.abs(b[1] - a[1]) * v.dpr));
  const d = c.getContext('2d').getImageData(x, y, w, h).data;
  let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 110 && d[i + 1] < 110 && d[i + 2] < 110) n++;
  return n;
}, rect);
const settle = async () => { await page.waitForTimeout(700); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); };
const widget = (name, k = 0) => page.evaluate(([n, i]) => window.markupcraft.sheets[window.markupcraft.cur].file.form.fields.find((f) => f.name === n).widgets[i].rect, [name, k]);
async function clickUser(x, y, opts) {
  const box = await page.locator('[data-over]').boundingBox();
  const [sx, sy] = await page.evaluate(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]);
  await page.mouse.click(box.x + sx, box.y + sy, opts);
}
async function saveDownload() {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const file = path.join(OUT, await dl.suggestedFilename());
  await dl.saveAs(file);
  return file;
}
const readBack = async (file) => forms.readForm(PDFLib, await PDFLib.PDFDocument.load(fs.readFileSync(file)));

try {
  console.log('\n== Sign in, open the form without appearances');
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await noRecover(page);
  await page.evaluate(() => { try { localStorage.removeItem('cc-workspace'); const s = JSON.parse(localStorage.getItem('markupcraft.settings') || '{}'); s.pageMode = 'tabs'; localStorage.setItem('markupcraft.settings', JSON.stringify(s)); } catch { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await noRecover(page);
  await page.setInputFiles('[data-file]', [NOAP]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 3 && window.markupcraft.view.page && window.markupcraft.sheets[0].file.form, null, { timeout: 30000 });
  await settle();
  ok(/Fillable form: 9 fields/.test(await status()), 'opening says the PDF has a form and how to fill it', await status());
  ok(await inkIn(await widget('approved')) > 15, 'a ticked box with no appearance of its own is drawn (pdf.js leaves it blank)');
  ok(await inkIn(await widget('grade', 1)) > 10, 'the picked radio button is drawn too');
  ok(await inkIn(await widget('name')) > 20, 'a text field\'s value shows');
  await page.screenshot({ path: path.join(OUT, '01-noap-fields-drawn.png') });

  console.log('\n== Fill form');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('f');
  await until(page, () => window.markupcraft.tool === 'fill' && !document.querySelector('[data-form-layer]').hidden);
  ok(await page.evaluate(() => window.markupcraft.tool) === 'fill', 'F turns Fill form on');
  const inputs = await page.locator('[data-form-layer] .mc-ff').count();
  ok(inputs === 10, 'an input over every field of the page (4 text, a box, 3 radio buttons, a drop-down, a list)', inputs);
  ok(await page.locator('[data-form-layer] [data-field="locked"]').isDisabled(), 'a read-only field can\'t be changed');
  const nameBox = page.locator('[data-form-layer] [data-field="name"]');
  ok(await nameBox.inputValue() === 'Jane Builder', 'the field shows the file\'s value', await nameBox.inputValue());
  await nameBox.fill('');
  await nameBox.type('Avery Vance');
  ok(await page.evaluate(() => window.markupcraft.tool) === 'fill', 'letters typed in a field (v, a, …) don\'t switch tools');
  await page.locator('[data-form-layer] [data-field="approved"]').uncheck();
  await page.locator('[data-form-layer] [data-field="grade"][value="C"]').check();
  await page.locator('[data-form-layer] [data-field="pick"]').selectOption('Three');
  await page.locator('[data-form-layer] [data-field="trades"]').selectOption(['Electrical', 'Framing']);
  const code = page.locator('[data-form-layer] [data-field="code"]');
  await code.fill('ABCDEFG');
  ok((await code.inputValue()).length === 5, 'max length 5 holds', await code.inputValue());
  await page.waitForTimeout(600);
  const edits = await page.evaluate(() => Object.fromEntries(window.markupcraft.sheets[0].file.formEdits));
  ok(edits.name === 'Avery Vance' && edits.approved === false && edits.grade === 'C' && edits.pick?.[0] === 'Three' && edits.trades?.join() === 'Electrical,Framing', 'the values are kept per field', edits);
  ok(await page.locator('[data-act="save"].is-dirty').count() > 0, 'the file has unsaved work (Save is marked)');
  await page.screenshot({ path: path.join(OUT, '02-filling.png') });

  console.log('\n== Off again: the values are on the sheet');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Escape');
  await until(page, () => window.markupcraft.tool === 'select' && document.querySelector('[data-form-layer]').hidden);
  await settle(); await page.waitForTimeout(600);
  ok(await inkIn(await widget('approved')) < 15, 'the untick shows on the sheet');
  ok(await inkIn(await widget('grade', 2)) > 10 && (await inkIn(await widget('grade', 1))) < 15, 'radio C picked, B not, on the sheet');
  await page.screenshot({ path: path.join(OUT, '03-values-on-sheet.png') });

  console.log('\n== Double click on a field with Select');
  const [nx0, ny0, nx1, ny1] = await widget('name');
  await clickUser((nx0 + nx1) / 2, (ny0 + ny1) / 2, { clickCount: 2 });
  await until(page, () => window.markupcraft.tool === 'fill');
  ok(await page.evaluate(() => window.markupcraft.tool === 'fill' && document.activeElement?.dataset.field === 'name'), 'it turns Fill form on and puts the cursor in that field');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Escape');

  console.log('\n== Save: the values go into the fields');
  const saved = await saveDownload();
  const back = await readBack(saved);
  const val = (n) => back.fields.find((f) => f.name === n)?.value;
  ok(val('name') === 'Avery Vance' && val('approved') === false && val('grade') === 'C' && val('pick')?.[0] === 'Three' && val('trades')?.join() === 'Electrical,Framing' && val('code') === 'ABCDE',
    'pdf-lib reads the saved values back', back.fields.map((f) => [f.name, f.value]));
  ok(back.fields.find((f) => f.name === 'grade').widgets.every((w) => w.hasAp) && back.fields.find((f) => f.name === 'approved').widgets[0].hasAp, 'the boxes and radio buttons got appearances (every reader draws them now)');

  console.log('\n== The saved copy opens with its values; a page with a markup still draws its field');
  await page.evaluate(() => window.markupcraft.store.dirtySheets.clear());
  await page.setInputFiles('[data-file]', [saved, AP]);
  await page.waitForFunction(() => window.markupcraft.sheets.length === 9, null, { timeout: 30000 });
  await settle();
  ok(await page.evaluate(() => window.markupcraft.sheets[3].file.form.fields.find((f) => f.name === 'name').value) === 'Avery Vance', 'reopened: the field holds the saved value');
  await page.evaluate(() => window.markupcraft.goTo(7));   // form-ap.pdf page 2: a field + another program's square (now a markup)
  await settle();
  ok(await page.evaluate(() => window.markupcraft.store.onSheet(window.markupcraft.sheets[7].page.key).some((m) => m.type === 'rect')), 'the other program\'s square became a markup');
  ok(await inkIn(await widget('inspector')) > 20, 'the field on that page is still drawn (it vanished before: the page\'s annotations were all switched off)');
  await page.screenshot({ path: path.join(OUT, '04-field-and-markup.png') });

  console.log('\n== Scroll mode');
  await page.evaluate(() => window.markupcraft.goTo(6));   // form-ap.pdf page 1
  await settle();
  await page.click('.mc-nav [data-act="page-mode"]');
  await until(page, () => !!window.markupcraft.view.strip);
  ok(await page.evaluate(() => window.markupcraft.view.strip?.items.length) === 3, 'Scroll pages: the open file\'s three pages in one column');
  ok(await page.getAttribute('.mc-nav [data-act="page-mode"]', 'aria-pressed') === 'true', 'the switch shows it is on');
  await page.evaluate(() => window.markupcraft.view.fit('width'));
  await settle();
  const z0 = await page.evaluate(() => window.markupcraft.view.z);
  const box = await page.locator('[data-over]').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  for (let i = 0; i < 12 && (await page.evaluate(() => window.markupcraft.cur)) === 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(120); }
  ok(await page.evaluate(() => window.markupcraft.cur) === 7, 'the wheel scrolls down and the next page becomes the open sheet', await page.evaluate(() => window.markupcraft.cur));
  ok(Math.abs((await page.evaluate(() => window.markupcraft.view.z)) - z0) < 1e-9, 'scrolling keeps the zoom');
  ok(/page 2|8/.test(await page.locator('[data-sheet-label]').innerText()), 'the sheet bar follows', await page.locator('[data-sheet-label]').innerText());
  await settle(); await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '05-scroll.png') });
  await page.keyboard.down('Control'); await page.mouse.wheel(0, -200); await page.keyboard.up('Control');
  ok((await page.evaluate(() => window.markupcraft.view.z)) > z0, 'Ctrl + wheel zooms');
  // the whole page on screen, then a third of the stage further down: the open page keeps the middle, the next one shows below
  await page.evaluate(() => { const v = window.markupcraft.view; v.fit('page'); v.panBy(0, -v.h * 0.3); });
  await settle(); await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '05b-column.png') });

  // draw a rectangle on the page BELOW the open one: pressing there makes it the page you work on
  const target = await page.evaluate(() => { const v = window.markupcraft.view, s = v.strip; for (const k of v.stripVisible()) if (k > s.at) { const r = v.stripRect(k); return { k, x: r.x + r.w * 0.3, y: Math.min(r.y + 60, v.h - 80) }; } return null; });
  ok(!!target, 'another page shows below the open one', target);
  if (target) {
    await page.locator('[data-over]').focus();
    await page.keyboard.press('r');
    await page.mouse.move(box.x + target.x, box.y + target.y);
    await page.mouse.down();
    await page.mouse.move(box.x + target.x + 80, box.y + target.y + 40, { steps: 5 });
    await page.mouse.up();
    await page.waitForTimeout(300);
    const last = await page.evaluate(() => { const all = window.markupcraft.store.all(); const m = all[all.length - 1]; return { sheet: m?.sheet, type: m?.type, cur: window.markupcraft.sheets[window.markupcraft.cur].page.key }; });
    ok(last.type === 'rect' && last.sheet === last.cur && last.sheet.endsWith(':' + target.k), 'the rectangle lands on the page it was drawn on, which is now the open sheet', last);
    await page.keyboard.press('Escape');
  }
  const before = await page.evaluate(() => window.markupcraft.cur);
  await page.locator('[data-over]').focus();
  await page.keyboard.press('PageUp');
  await until(page, (b) => window.markupcraft.cur === b - 1, before);
  ok(await page.evaluate((b) => window.markupcraft.cur === b - 1 && !!window.markupcraft.view.strip, before), 'Page Up goes to the page above inside the column');
  await settle(); await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, '06-scroll-markups.png') });
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.settings')).pageMode) === 'scroll', 'the choice is remembered');
  // comparing shows one page at a time; Scroll mode comes back after
  await page.click('[data-tab="compare"]');
  const [ck, ok0] = await page.evaluate(() => [window.markupcraft.sheets[window.markupcraft.cur].page.key, window.markupcraft.sheets[0].page.key]);
  await page.selectOption('[data-cmp="new"]', ck);
  await page.selectOption('[data-cmp="old"]', ok0);
  await page.click('[data-act="compare"]');
  await until(page, () => window.markupcraft.cmp.on);
  ok(await page.evaluate(() => window.markupcraft.cmp.on && !window.markupcraft.view.strip), 'Compare: one page at a time');
  await page.click('[data-act="compare-stop"]');
  await until(page, () => !window.markupcraft.cmp.on && !!window.markupcraft.view.strip);
  ok(await page.evaluate(() => !window.markupcraft.cmp.on && !!window.markupcraft.view.strip), 'Stop comparing: the column is back');

  console.log('\n== Workspace layout: a tab per file in Scroll mode, per page in Tabs');
  await page.evaluate(() => window.markupcraft.store.dirtySheets.clear());
  await page.goto(BASE + '/lab/markupcraft?space=paper&workspace=docked', { waitUntil: 'networkidle' });
  await noRecover(page);
  await page.setInputFiles('[data-file]', [AP, NOAP]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 6 && window.markupcraft.view.page, null, { timeout: 30000 });
  await settle();
  const tabs = () => page.evaluate(() => [...document.querySelectorAll('[data-ws-blk="viewtabs"] [role="tab"]')].map((t) => t.textContent.trim()));
  const t1 = await tabs();
  ok(t1.length >= 1 && t1.every((x) => /form-(no)?ap\.pdf/.test(x)), 'Scroll mode: the tabs name files', t1);
  await page.evaluate(() => window.markupcraft.goTo(3));
  await settle();
  const t2 = await tabs();
  ok(t2.length === 2, 'opening the other file adds its tab (two files, two tabs)', t2);
  ok(await page.evaluate(() => window.markupcraft.view.strip?.items[0].page.key.startsWith(window.markupcraft.sheets[3].file.id + ':')), 'the column is that file\'s pages');
  await page.screenshot({ path: path.join(OUT, '07-layout-file-tabs.png') });
  await page.evaluate(() => window.markupcraft.setPageMode('tabs'));
  await settle();
  await page.evaluate(() => window.markupcraft.goTo(4));
  await settle();
  const t3 = await tabs();
  ok(!(await page.evaluate(() => !!window.markupcraft.view.strip)) && t3.some((x) => /page/i.test(x)), 'Tabs: one page at a time, the tabs name pages again', t3);
  await page.screenshot({ path: path.join(OUT, '08-layout-page-tabs.png') });
  await page.evaluate(() => window.markupcraft.store.dirtySheets.clear());
} catch (e) {
  fail++;
  console.log('  FAIL threw: ' + (e.stack || e));
  await page.screenshot({ path: path.join(OUT, 'zz-failed.png') }).catch(() => {});
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
await browser.close();
execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'down']);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
