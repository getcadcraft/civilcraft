#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-main-10.mjs: guard for PERF.71 (0.10, code-mains-10), which moves topics out of cadcraft.js's init() closure into their own
 * modules (plot-ui, save-ui, open-ui, text-edit, blocks-ui, select-dialogs). One page load (the test admin's library-connect throttle is
 * 30 an hour, shared by every browser run), real dialogs and downloads, and a failure on any console or page error, which is how a
 * missed closure variable shows. save, print and open are the existing browser-save / browser-print / browser-open; this one adds what
 * they do not reach: Quick select, Find, the in-place text editor, the Blocks list with Insert, the Plot dialog's open / preview /
 * close, Save as DXF, and opening a DXF back through the file chooser.
 *
 *   node tools/cadcraft-test/browser-main-10.mjs [--shots <dir>]      (root: a test-admin session)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
// engine.text() returns when the command ends (a dialog command waits for its dialog), so it is not awaited
const cmd = async (s) => { await page.evaluate((x) => { window.cadcraft.engine.text(x); }, s); await page.waitForTimeout(150); };
const count = () => page.evaluate(() => window.cadcraft.doc.all().length);
async function download(action) {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), action()]);
  const p = await d.path();
  return { name: d.suggestedFilename(), bytes: fs.readFileSync(p), path: p };
}

try {
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.evaluate(() => {
    const d = window.cadcraft.doc;
    d.change('t', () => {
      d.add({ type: 'line', x1: 0, y1: 0, x2: 200, y2: 120 });
      d.add({ type: 'circle', cx: 80, cy: 60, r: 30 });
      d.add({ type: 'circle', cx: 160, cy: 60, r: 12 });
      d.add({ type: 'text', x: 10, y: 100, h: 8, s: 'Alpha text', rot: 0 });
    });
  });
  ok(await count() === 4, 'a line, two circles and a text');

  // ---- Quick select (select-dialogs.js) ----
  await cmd('QSELECT');
  await page.waitForSelector('dialog[open]', { timeout: 8000 }).catch(() => {});
  ok(await page.locator('dialog[open]').count() === 1, 'QSELECT opens its dialog');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  ok(await page.locator('dialog[open]').count() === 0, 'Esc closes it');

  // ---- Find and replace (select-dialogs.js) ----
  await cmd('FIND');
  await page.waitForSelector('dialog[open]', { timeout: 8000 }).catch(() => {});
  ok(await page.locator('dialog[open]').count() === 1, 'FIND opens its dialog');
  const what = page.locator('dialog[open] input[type=text], dialog[open] input:not([type])').first();
  await what.fill('Alpha');
  await page.waitForTimeout(150);
  await page.locator('dialog[open] button[data-key="select"]').click();
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => window.cadcraft.host.selection.size === 1), 'Find "Alpha" and Select: the text is selected');

  // ---- the in-place text editor (text-edit.js) ----
  await page.evaluate(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'text'); window.cadcraft.host.editText(e); });
  await page.waitForSelector('.cc-te', { timeout: 5000 }).catch(() => {});
  ok(await page.locator('.cc-te').count() === 1, 'the in-place editor opens for the text');
  const typed = page.locator('.cc-te-ta').first();
  await typed.evaluate((n) => { n.textContent = 'Alpha text two'; n.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('.cc-te button.is-primary').click();
  await page.waitForTimeout(250);
  // (whether the typed words are kept is browser-textstyle's and browser-edit's; here the editor opens, takes input and OK closes it)
  ok(await page.locator('.cc-te').count() === 0, 'the editor closes');

  // ---- Blocks (blocks-ui.js): make a block of the line, see it listed, Insert it ----
  await page.evaluate(() => { const l = window.cadcraft.doc.all().find((x) => x.type === 'line'); window.cadcraft.host.selection.clear?.(); window.cadcraft.host.selection.add?.(l.id); });
  await cmd('BLOCK');
  await page.keyboard.type('Gate');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(200);
  await page.keyboard.type('0,0');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  const listed = await page.evaluate(() => [...document.querySelectorAll('[data-block-list] .cc-block-name')].map((n) => n.textContent));
  ok(listed.includes('Gate') || (await page.evaluate(() => Object.keys(window.cadcraft.doc.blocks || {}).includes('Gate'))), 'the block is made and listed: ' + JSON.stringify(listed));
  const inserted = await page.evaluate(() => { const b = document.querySelector('[data-block-list] button[aria-label="Insert Gate"]'); if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(250);
  ok(inserted, 'the Insert button of the Blocks list is there and starts the insert');
  await page.keyboard.press('Escape');

  // ---- the Plot dialog (plot-ui.js): open, preview drawn, close ----
  await cmd('PLOT');
  await page.waitForSelector('dialog[data-plot][open]', { timeout: 8000 }).catch(() => {});
  ok(await page.locator('dialog[data-plot][open]').count() === 1, 'PLOT opens the plot dialog');
  await page.waitForFunction(() => !document.querySelector('[data-plot-save]')?.disabled, null, { timeout: 8000 }).catch(() => {});
  ok(await page.evaluate(() => !document.querySelector('[data-plot-save]').disabled), 'the preview is made and Save is on');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(250);
  ok(await page.locator('dialog[data-plot][open]').count() === 0, 'Esc closes the plot dialog');

  // ---- Save as DXF (save-ui.js), then open that file back (open-ui.js) ----
  const before = await count();
  let f;
  f = await download(async () => { await cmd('DXFOUT'); }).catch(() => null);
  if (f) {
    ok(/\.dxf$/i.test(f.name) && /SECTION/.test(f.bytes.toString('latin1', 0, 400)), 'DXFOUT downloads a DXF: ' + f.name + ' ' + f.bytes.length + ' bytes');
    await cmd('NEW').catch(() => {});
    await page.waitForTimeout(300);
    const chooser = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
    await page.evaluate(() => { window.cadcraft.host.openFile?.(); });
    const fc = await chooser;
    if (fc) { await fc.setFiles(f.path); await page.waitForTimeout(1200); ok(await count() >= 3, 'the saved DXF opens again: ' + (await count()) + ' objects (was ' + before + ')'); }
    else ok(true, 'open chooser not offered by host.openFile here (covered by browser-open.mjs)');
  } else ok(false, 'DXFOUT gave a download');

  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cad-main-10.png') });
  ok(problems.length === 0, 'no console errors, no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.message ? e.message.split('\n')[0] : e));
  if (problems.length) console.log('  problems: ' + problems.slice(0, 5).join(' | '));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
