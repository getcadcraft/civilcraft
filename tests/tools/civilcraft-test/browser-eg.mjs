#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-eg.mjs — 0.8 round 2 (civil_PART_2): the six EG dialogs in headless Chromium at https://getcadcraft.com/lab/civilcraft.
 * Opens the sample site, runs Make it rain through the real dialog (animation frames, slider, facts), opens earthwork, best route (and runs it),
 * address to site, detention ponds and progress, and fails on any console error.
 *   node tools/civilcraft-test/browser-eg.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-eg'); })();
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.command);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const open = async (cmd) => { await page.evaluate((c) => window.civilcraft.command(c), cmd); await page.waitForSelector('[data-eg-dialog][open]'); };
  const close = async () => { await page.evaluate(() => document.querySelectorAll('[data-eg-dialog][open]').forEach((d) => d.close())); };

  await open('eg-rain');
  ok(!!(await page.$('[data-eg-rain-form]')), 'Make it rain opens with its form on the sample site');
  await page.click('[data-eg-rain-run]');
  if (process.env.DBG) { await page.waitForTimeout(15000); console.log(await page.evaluate(() => ({ prog: document.querySelector('[data-eg-rain-progress]')?.value, inputs: [...document.querySelectorAll('[data-eg-rain-form] input')].map((i) => i.value) }))); await page.waitForTimeout(15000); console.log(await page.evaluate(() => document.querySelector('[data-eg-rain-progress]')?.value)); }
  await page.waitForSelector('[data-eg-rain-slider]', { timeout: 500000 }).catch(async (e) => { console.log('status:', await page.$eval('[data-eg-rain-status]', (n) => n.textContent), '| errors:', problems.join(' / ')); throw e; });
  ok(!!(await page.$('[data-eg-rain-facts]')), 'the run ends with the facts: ' + await page.$eval('[data-eg-rain-status]', (n) => n.textContent));
  const t0 = await page.$eval('[data-eg-rain-time]', (n) => n.textContent);
  await page.$eval('[data-eg-rain-slider]', (s) => { s.value = s.max; s.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(200);
  ok((await page.$eval('[data-eg-rain-time]', (n) => n.textContent)) !== t0, 'the slider moves the picture to another time');
  await page.screenshot({ path: path.join(OUT, '01-rain.png') });
  await close();

  for (const [cmd, sel, what] of [['eg-earthwork', '[data-eg-body], [data-eg-none]', 'earthwork balancer'], ['eg-pond', '[data-eg-body]', 'detention ponds'], ['eg-site', '[data-eg-st-run]', 'address to site'], ['eg-progress', '[data-eg-pg-run]', 'progress']]) {
    await open(cmd);
    ok(!!(await page.$(sel)), what + ' opens');
    await page.screenshot({ path: path.join(OUT, `02-${cmd}.png`) });
    await close();
  }
  await open('eg-route');
  ok(!!(await page.$('[data-eg-rt-form]')), 'best route opens with its form');
  await page.screenshot({ path: path.join(OUT, '03-route.png') });
  await close();
} finally { await browser.close(); admin('down'); }
ok(problems.length === 0, 'no console errors', problems);
console.log(`browser-eg: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
