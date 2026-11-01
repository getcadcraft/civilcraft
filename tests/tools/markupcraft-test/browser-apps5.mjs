#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-apps5.mjs — apps-mount_PART_5 on the real page (headless, /lab/markupcraft): DC.1 (a pick is announced as `cc-pick`, a related pick comes
 * back through ccPickApply) and CH.14 (a P&ID's HAZOP node boxes brought in as Open rectangles on the open sheet, with the print scale, undo,
 * what falls outside, and refusals).
 *   node tools/markupcraft-test/browser-apps5.mjs [--out <dir>]
 */
/**
 * browser-mount.mjs — 0.8 round 3 (markup_PART_3): what MarkupCraft mounted, in headless Chromium at https://getcadcraft.com/lab/markupcraft.
 *   - the shell's seven modules (calc sheets, reasons, lessons, Suggest, activity, Ask box) and that the sheets travel in the PDF (/MarkupCraftShell)
 *   - Problems markers on the page (an overdue task shows a ⚠ on its markup; a page that could not be drawn at the page's corner)
 *   - the live adapter's where(ops) (EG.41) and SU.910's overlay + reviewers strip, with a stand-in for the session client
 *   node tools/markupcraft-test/browser-mount.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/markupcraft-apps5'); })();
fs.mkdirSync(OUT, { recursive: true });
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));
const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Mount Tester')); localStorage.setItem('cadcraft.assistants.markupcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const orphans = await page.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  if (orphans) await page.click('[data-autosave-discard-all]').catch(() => {});
  await page.setInputFiles('[data-file]', PLAN);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });

  console.log('\n== DC.1: cc-pick and ccPickApply');
  const ids = await page.evaluate(() => { const m = window.markupcraft; const out = []; m.store.change('t', (tx) => { for (const y of [300, 500]) out.push(tx.add({ sheet: m.sheets[0].page.key, type: 'rect', rect: [100, y, 300, y + 80], text: 'box ' + y, author: 'T' }).id); }); window.__picks = []; window.addEventListener('cc-pick', (e) => window.__picks.push(e.detail)); return out; });
  const applied = await page.evaluate((id) => window.ccPickApply([{ app: 'markupcraft', id }]), ids[1]);
  const selNow = await page.evaluate(() => [...window.markupcraft.sel]);
  ok(applied === true && selNow.length === 1 && selNow[0] === ids[1], 'ccPickApply selects the related markup', selNow);
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-act="select-none"]')?.click());
  await page.evaluate(() => document.querySelector('[data-act="select-all"]')?.click());
  const pk = await page.evaluate(() => window.__picks.at(-1));
  ok(pk && pk.app === 'markupcraft' && pk.ids.length >= 2 && pk.ids.includes(ids[0]) && pk.ids.includes(ids[1]), 'a selection change (Select all) is announced as cc-pick', pk);
  ok(await page.evaluate(() => window.ccPickApply([{ app: 'markupcraft', id: 'nope' }])) === false, 'an id that is not on the sheet is refused');

  console.log('\n== EG.77: the undo reporter');
  await page.evaluate(() => { window.__ev = []; window.addEventListener('cc-undo-report', (e) => window.__ev.push(e.detail)); window.markupcraft.store.change('Edit text', (tx) => { const m = window.markupcraft.store.all()[0]; tx.update(m.id, { text: 'Told' }); }); });
  const ev = await page.evaluate(() => window.__ev);
  ok(ev.length >= 1 && ev.at(-1).type === 'edit.done' && ev.at(-1).data.kind === 'do' && ev.at(-1).data.label === 'Edit text', 'a finished edit is told: ' + JSON.stringify(ev.at(-1)));
  const probe = await page.evaluate(() => window.ccUndoReporter.onMessage('undo.probe', {}));
  ok(probe && probe.step && probe.depth >= 1, 'the probe names the top step', probe);
  const run = await page.evaluate((step) => window.ccUndoReporter.onMessage('undo.run', { step }), probe.step);
  ok(run && run.ok === true && await page.evaluate(() => window.markupcraft.store.all()[0].text) !== 'Told', 'a run undoes it through the app');
  ok((await page.evaluate(() => window.ccUndoReporter.onMessage('undo.run', { step: 'nope' }))).ok === false, 'a step that is not on top is refused');

  console.log('\n== CH.14: HAZOP node boxes as markers');
  const file = path.join(OUT, 'hazop.json');
  fs.writeFileSync(file, JSON.stringify({ format: 'cadcraft-hazop-markers', version: 1, sheet: 'Unit 100', unit: 'mm', nodes: [
    { id: 'N1', name: 'Feed to column', box: [30, 40, 90, 100], equipment: ['V-101', 'P-101'], lines: ['L-1'] },
    { id: 'N2', name: 'Reflux loop', box: [100, 40, 150, 100], equipment: ['E-102'], lines: [] },
    { id: 'N3', name: 'Off the page', box: [5000, 5000, 5100, 5100], equipment: [], lines: [] },
    { id: 'N4', name: '', box: [1, 1, 2, 2] }] }));
  await page.locator('[data-tab="tasks"]').click();
  await page.locator('summary', { hasText: 'HAZOP node boxes' }).click();
  const before = await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'HAZOP').length);
  const [ch] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="hazop-import"]')]);
  await ch.setFiles(file);
  await page.waitForFunction((b) => window.markupcraft.store.all().filter((m) => m.subject === 'HAZOP').length === b + 2, before, { timeout: 8000 }).catch(() => {});
  const marks = await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'HAZOP').map((m) => ({ type: m.type, rect: m.rect, text: m.text, status: m.status })));
  const view = await page.evaluate(() => window.markupcraft.sheets[0].page.view);
  const mm = 72 / 25.4;
  ok(marks.length === 2 && marks.every((m) => m.type === 'rect' && m.status === 'Open'), 'two nodes became two Open rectangles (one off the page, one without a name left out)', marks);
  const n1 = marks.find((m) => /N1/.test(m.text));
  ok(n1 && Math.abs(n1.rect[0] - (view[0] + 30 * mm)) < 0.01 && Math.abs(n1.rect[3] - (view[1] + 100 * mm)) < 0.01, 'the box is the drawing\'s mm in PDF points from the sheet corner', n1 && n1.rect);
  ok(n1 && /Feed to column/.test(n1.text) && /V-101, P-101/.test(n1.text) && /L-1/.test(n1.text), 'the text names the node, equipment and lines', n1 && n1.text);
  const st = await page.locator('[data-hazop-status]').innerText();
  ok(/Marked 2 nodes/.test(st) && /1 node falls outside/.test(st) && /1 rows were skipped/.test(st), 'the panel says what happened', st);
  await page.evaluate(() => window.markupcraft.store.undo());
  ok(await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'HAZOP').length) === 0, 'one undo step takes them all back');
  // scale 0.5 halves the boxes
  await page.fill('[data-hazop-scale]', '0.5');
  const [ch2] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="hazop-import"]')]);
  await ch2.setFiles(file);
  await page.waitForFunction(() => window.markupcraft.store.all().some((m) => m.subject === 'HAZOP'), null, { timeout: 8000 });
  const half = await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'HAZOP' && /N1/.test(m.text))[0].rect);
  ok(Math.abs(half[0] - (view[0] + 15 * mm)) < 0.01, 'printed at 0.5, the box halves', half);
  // a file that is not a node-box file
  const bad = path.join(OUT, 'bad.json'); fs.writeFileSync(bad, JSON.stringify({ hello: 1 }));
  const [ch3] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="hazop-import"]')]);
  await ch3.setFiles(bad);
  await page.waitForTimeout(300);
  ok(/No HAZOP nodes in that file/.test(await page.locator('[data-hazop-status]').innerText()), 'another file is refused in words');
} catch (e) { fail++; console.log('  FAIL threw: ' + (e && e.stack || e)); }
finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
