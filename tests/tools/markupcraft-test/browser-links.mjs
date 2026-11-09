#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft batch links (0.9 SU.1085) in a real (headless) browser, against /lab/markupcraft: Pages › Batch links… on the
 * five-sheet fixture set (title-block numbers checked and one typed by hand, callouts found, a view picked by hand, the misses
 * listed), Ctrl+click follows a link to its view, one undo, the saved PDF's Link annotations (/FitR), a re-run after an addendum
 * sheet is opened (the misses link, the rest kept) and after a sheet is renumbered (broken links listed, one fix updates
 * them all), and the command in the PDF-review menus.
 *   node tools/markupcraft-test/browser-links.mjs [--out tmp/shots/markupcraft-links]
 * Run as root (it calls `sudo -u www-data php` for the test admin). Fixtures: node tools/markupcraft-test/make-link-set.mjs (once).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const pdfjs = await import(pathToFileURL(path.join(HERE, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
const args = process.argv.slice(2);
const OUT = path.resolve(REPO, args.includes('--out') ? args[args.indexOf('--out') + 1] : 'tmp/shots/markupcraft-links');
const GEN = path.resolve(REPO, '../testfiles/generated/markup');
const SET = path.join(GEN, 'link-set.pdf'), ADD = path.join(GEN, 'link-set-addendum.pdf');
if (!fs.existsSync(SET) || !fs.existsSync(ADD)) { console.log('Skipped: no ' + SET + ' (node tools/markupcraft-test/make-link-set.mjs makes it).'); process.exit(0); }
const BASE = 'https://getcadcraft.com';
fs.mkdirSync(OUT, { recursive: true });
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'markupcraft-links-'));
let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail).slice(0, 500) : '')); } };

const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Link Tester')); localStorage.removeItem('markupcraft.input'); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const orphans = await page.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  if (orphans) { await page.click('[data-autosave-discard-all]').catch(() => {}); await page.waitForSelector('dialog[data-autosave-dialog][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); }
  await page.setInputFiles('[data-file]', SET);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 5 && window.markupcraft.view.page, null, { timeout: 30000 });
  const links = () => page.evaluate(() => window.markupcraft.store.all().filter((m) => m.link).map((m) => ({ id: m.id, link: m.link, view: m.linkView?.id || '', ref: m.linkView?.ref || '', box: !!m.linkView?.box, sheet: m.sheet })));
  const statusText = () => page.locator('[data-status]').innerText();
  const openBatch = async () => { await page.click('[data-pages-menu] > summary'); await page.click('[data-pages-menu] [data-act="batch-links"]'); await page.waitForSelector('dialog.mc-dialog .mc-bl-sheets'); };

  console.log('\n== Step 1: sheet numbers from the title blocks, fixed by hand');
  await openBatch();
  const sheetRows = await page.$$eval('dialog.mc-dialog .mc-bl-sheets tbody tr', (trs) => trs.map((tr) => [tr.querySelector('[data-bl-no]').value, tr.querySelector('[data-bl-name]').value, tr.cells[2].textContent.trim()]));
  ok(sheetRows.length === 5 && sheetRows[0][0] === 'A-101' && sheetRows[0][1] === 'FLOOR PLAN' && /Title block/.test(sheetRows[0][2]), 'every sheet listed with its number, name and where they came from', sheetRows);
  ok(sheetRows[3][0] === '' && /Type its number/.test(sheetRows[3][2]), 'A-401 (number plotted as lines) asks for its number', sheetRows[3]);
  await page.locator('dialog.mc-dialog [data-bl-no]').nth(3).fill('A-401');
  await page.screenshot({ path: path.join(OUT, '1-sheets.png') });
  await page.click('dialog.mc-dialog button[data-key="ok"]');

  console.log('\n== Step 2: what links and what did not');
  await page.waitForSelector('dialog.mc-dialog .mc-bl-sec', { timeout: 30000 });
  ok(await page.evaluate(() => window.markupcraft.sheets[3].page.sheetNo) === 'A-401', 'the typed number is the sheet\'s now');
  const newRows = await page.locator('dialog.mc-dialog .mc-bl-row[data-action="new"]').allInnerTexts();
  ok(newRows.length === 9, 'nine callouts will link', newRows);
  ok(newRows.some((r) => /3\/A-501.*A-501.*view 3 WINDOW HEAD DETAIL/.test(r)) && newRows.some((r) => /2\/A-401.*view 2 ENLARGED STAIR PLAN/.test(r)) && newRows.some((r) => /5\/A-501.*view 5/.test(r)), 'each with its sheet and view (the bubble "5" over "A-501", and A-401 thanks to the typed number)', newRows);
  ok(newRows.some((r) => /7\/A-501.*view 7 not found/.test(r)), '7/A-501: view not found, offered for a hand pick');
  const missRows = await page.locator('dialog.mc-dialog .mc-bl-row[data-action="miss"]').allInnerTexts();
  ok(missRows.length === 1 && /A-601: 2 callouts on A-101, A-201/.test(missRows[0]), 'not linked: A-601, two callouts, with a sheet to pick', missRows);
  ok(!(await page.locator('dialog.mc-dialog').innerText()).match(/R-19|W12X26/), 'codes that are not sheets are not listed');
  const i7 = await page.locator('dialog.mc-dialog .mc-bl-row[data-action="new"]', { hasText: '7/A-501' }).getAttribute('data-i');
  await page.selectOption(`dialog.mc-dialog select[data-bl-view="${i7}"]`, '6');   // the person knows 7 is now 6
  await page.screenshot({ path: path.join(OUT, '2-review.png') });
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  let L = await links();
  ok(L.length === 9 && L.every((m) => m.ref), 'nine link boxes made by batch links', L.length);
  ok(L.find((m) => m.ref === '3/A-501')?.view === '3' && L.find((m) => m.ref === '7/A-501')?.view === '6' && L.find((m) => m.ref === 'A-101')?.view === '', 'they keep the view (7/A-501 → the picked view 6; a bare A-101 → the whole sheet)', L);
  ok(/9 new, 0 updated, 2 not linked/.test(await statusText()), 'the status sums it up', await statusText());

  console.log('\n== Follow a link to its view; one undo');
  await page.evaluate(() => window.markupcraft.goTo(0));
  const l3 = L.find((m) => m.ref === '3/A-501');
  const rect = await page.evaluate((id) => window.markupcraft.store.get(id).rect, l3.id);
  const ob = await page.locator('[data-over]').boundingBox();
  await page.evaluate((r) => window.markupcraft.view.zoomTo(r, 0.1), rect);
  const [lx, ly] = await page.evaluate((r) => window.markupcraft.view.toScreen([Math.min(r[0], r[2]), (r[1] + r[3]) / 2]), rect);   // on its outline
  await page.locator('[data-over]').focus(); await page.keyboard.press('v');
  await page.keyboard.down('Control'); await page.mouse.click(ob.x + lx, ob.y + ly); await page.keyboard.up('Control');
  await page.waitForFunction(() => window.markupcraft.cur === 4, null, { timeout: 10000 }).catch(() => {});
  ok(await page.evaluate(() => window.markupcraft.cur) === 4 && /view 3/.test(await statusText()), 'Ctrl+click opens A-501 at view 3', await statusText());
  const vis = await page.evaluate(() => { const v = window.markupcraft.view; const r = v.stage?.getBoundingClientRect?.() || { width: v.w, height: v.h }; const c = v.toUser(v.w / 2, v.h / 2); return { c, z: v.z }; });
  ok(vis.c && vis.c[0] > 1067 && vis.c[0] < 1469 && vis.c[1] > 828 && vis.c[1] < 1270, 'the view fills the screen (its middle is in view 3\'s box)', vis);
  await page.screenshot({ path: path.join(OUT, '3-followed.png') });
  await page.keyboard.press('Alt+ArrowLeft');
  await page.waitForFunction(() => window.markupcraft.cur === 0, null, { timeout: 10000 }).catch(() => {});
  ok(await page.evaluate(() => window.markupcraft.cur) === 0, 'Alt+← comes back');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  ok((await links()).length === 0, 'one Ctrl+Z takes every link away');
  await page.keyboard.press('Control+y');
  ok((await links()).length === 9, 'Ctrl+Y puts them back');

  console.log('\n== Saved: PDF links any reader follows');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.locator('[data-act="save"]').first().click()]);
  const saved = path.join(TMP, 'linked.pdf');
  fs.copyFileSync(await dl.path(), saved);
  const task = pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(saved)), standardFontDataUrl: path.join(HERE, 'node_modules/pdfjs-dist/standard_fonts/'), isEvalSupported: false });
  const doc = await task.promise;
  const la = [];
  for (let i = 1; i <= doc.numPages; i++) for (const a of await (await doc.getPage(i)).getAnnotations()) if (a.subtype === 'Link') la.push({ page: i - 1, to: Array.isArray(a.dest) ? await doc.getPageIndex(a.dest[0]) : null, fit: a.dest?.[1]?.name });
  ok(la.length === 9, 'nine Link annotations in the saved PDF', la);
  ok(la.filter((a) => a.fit === 'FitR').length === 8 && la.filter((a) => a.fit === 'Fit').length === 1, 'eight open a view (/FitR), the bare A-101 opens its sheet (/Fit)', la.map((a) => a.fit));
  ok(la.filter((a) => a.to === 4).length === 5 && la.filter((a) => a.to === 3).length === 1 && la.filter((a) => a.to === 2).length === 2 && la.filter((a) => a.to === 0).length === 1, 'five go to A-501, two to A-301, one to A-401, one to A-101', la.map((a) => a.to));
  await task.destroy();

  console.log('\n== Run again: an addendum sheet is opened');
  await page.setInputFiles('[data-file]', ADD);
  await page.waitForFunction(() => window.markupcraft.sheets.length === 6, null, { timeout: 30000 });
  await openBatch();
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForSelector('dialog.mc-dialog .mc-bl-sec', { timeout: 30000 });
  const new2 = await page.locator('dialog.mc-dialog .mc-bl-row[data-action="new"]').allInnerTexts();
  const kept2 = await page.locator('dialog.mc-dialog [data-bl-kept]').getAttribute('data-bl-kept');
  ok(new2.length === 2 && new2.every((r) => /2\/A-601.*view 2 DOOR JAMB DETAIL/.test(r)) && kept2 === '9', 'the two 2/A-601 callouts link now; the nine earlier links are kept', { new2, kept2 });
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  ok((await links()).length === 11 && /2 new, 0 updated, 0 not linked/.test(await statusText()), 'eleven links', await statusText());

  console.log('\n== Run again: A-501 renumbered A-502');
  await openBatch();
  await page.locator('dialog.mc-dialog [data-bl-no]').nth(4).fill('A-502');
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForSelector('dialog.mc-dialog .mc-bl-sec', { timeout: 30000 });
  const miss3 = await page.locator('dialog.mc-dialog .mc-bl-row[data-action="miss"]').allInnerTexts();
  ok(miss3.length === 1 && /A-501: 5 callouts/.test(miss3[0]) && /no longer finds its sheet/.test(miss3[0]), 'the links to A-501 are listed as not finding their sheet (A-502 prints A-501 in its own title block: not a callout)', miss3);
  const a502 = await page.evaluate(() => window.markupcraft.sheets[4].page.key);
  await page.selectOption('dialog.mc-dialog select[data-bl-fix="A501"]', a502);
  await page.screenshot({ path: path.join(OUT, '4-renumbered.png') });
  await page.click('dialog.mc-dialog button[data-key="ok"]');
  await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
  L = await links();
  ok(L.filter((m) => m.link === 'A-502').length === 5 && L.find((m) => m.ref === '3/A-501')?.view === '3' && L.find((m) => m.ref === '7/A-501')?.view === '6' && /0 new, 5 updated, 0 not linked/.test(await statusText()), 'one fix updates all five, views kept (the hand-picked view 6 too)', { s: await statusText(), L: L.map((m) => m.link + ':' + m.view) });
  ok(L.length === 11, 'no link was doubled');

  console.log('\n== Reachable from the other menus');
  await page.evaluate(() => { const ss = document.querySelector('[data-find]'); if (ss) ss.open = true; });
  ok(await page.locator('[data-act="auto-link"]').count() === 1, 'the Sheets panel still has Link sheet callouts…');
  const inp = await page.evaluate(async () => { const m = await import(new URL('input-markupcraft.js', document.querySelector('script[type=module][src*="markupcraft.js"]')?.src || location.href).href).catch(() => null); if (!m) return null; return { cmd: !!m.COMMANDS.find((c) => c.id === 'pages.batch-links'), doc: m.STYLES.review.menus.find((x) => x.id === 'document')?.items?.includes('pages.batch-links') ?? JSON.stringify(m.STYLES.review.menus).includes('pages.batch-links') }; });
  ok(inp?.cmd && inp?.doc, 'Batch links is a command, in the PDF review style\'s Document menu', inp);
  ok(!problems.length, 'no console errors', problems);
} finally {
  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
}
console.log('\n' + pass + ' passed, ' + fail + ' failed.');
process.exit(fail ? 1 : 0);
