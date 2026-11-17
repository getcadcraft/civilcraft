#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-annoscale.mjs: 0.10 BK.10 annotate by scale in CadCraft, in the real page (/lab/cadcraft, headless), session
 * `bk-r3-scale-10`.   node tools/cadcraft-test/browser-annoscale.mjs   (run as root)
 * Text typed at the command line, made annotative with the Properties checkbox, resized by ANNOSCALE typed at the command line;
 * Properties says its size on paper; Undo puts it back. The rules themselves: node tools/annoscale/test.mjs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' (' + (typeof x === 'string' ? x : JSON.stringify(x)) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bkanno'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
page.setDefaultTimeout(20000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const texts = () => page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'text').map((e) => ({ id: e.id, h: e.h, ann: !!e.ann, as: e.as ?? null, s: e.s })));
const logText = () => page.evaluate(() => document.querySelector('[data-log], [data-cmd-log], .cc-cmdlog')?.innerText || document.body.innerText);
try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.props);
  console.log('== annotative text follows ANNOSCALE on the page');
  await page.evaluate(() => { const c = window.cadcraft; c.doc.change('units', () => c.doc.setMeta({ units: 'millimeters' })); });
  await typeCmd('TEXT'); await typeCmd('0,0'); await typeCmd('2.5'); await typeCmd('0'); await typeCmd('ROOM'); await typeCmd('');
  await page.keyboard.press('Escape');
  let T = await texts();
  ok(T.length === 1 && T[0].h === 2.5 && !T[0].ann, 'TEXT at the command line: one text 2.5 tall, not annotative', T);
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), T[0].id);
  // the lab's property grid names a row by its key ([data-pg-row]); the older panel by id (#cc-p-<key>)
  const ANN = '[data-pg-row="ann"], #cc-p-ann', PAPER = '.pg-row[data-pg-id="annpaper"], #cc-p-annpaper';
  const paperText = () => page.evaluate((sel) => { const n = document.querySelector(sel); return n ? (n.innerText || n.textContent || '').replace(/\s+/g, ' ').trim() : ''; }, PAPER);
  await page.waitForSelector(ANN, { state: 'attached' });
  ok(!(await page.$(PAPER)), 'Properties: Annotative is there, no "Size on paper" yet');
  await page.locator(ANN).first().scrollIntoViewIfNeeded();
  await page.locator(ANN).first().click();
  await page.waitForTimeout(300);
  T = await texts();
  const paper = await paperText();
  ok(T[0].ann && /Size on paper/.test(paper) && /2\.5 mm at 1:1/.test(paper), 'ticked: the text is annotative and Properties reads "Size on paper: 2.5 mm at 1:1"', [T, paper]);
  await page.keyboard.press('Escape');
  await typeCmd('ANNOSCALE'); await typeCmd('1:100');
  T = await texts();
  ok(T[0].h === 250 && T[0].as === 100 && /Annotation scale 1:100\. Resized 1 annotative object/.test(await logText()), 'ANNOSCALE 1:100: the text is 250 tall and the command line says so', T);
  await typeCmd('ANNOSCALE'); await typeCmd('1:50');
  T = await texts();
  ok(T[0].h === 125, '1:100 to 1:50: 125 tall', T);
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), T[0].id);
  await page.waitForSelector(PAPER, { state: 'attached' });
  const paper2 = await paperText();
  ok(/2\.5 mm at 1:50/.test(paper2), 'Properties: still 2.5 mm on paper, now "at 1:50"', paper2);
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(250);
  T = await texts();
  ok(T[0].h === 250, 'one Undo: back to 250 (1:100)', T);
  const real = problems.filter((p) => !/favicon|ERR_ABORTED|hardware/.test(p));
  ok(!real.length, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); } finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bkanno'], { stdio: 'ignore' }); } catch (e) { /* stays */ }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
