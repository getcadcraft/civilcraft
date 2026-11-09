#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-al6.mjs — AL.6 "This file uses …" in ModelCraft's real page (/lab/modelcraft), headless Chromium. Run as root.
 *   node tools/modelcraft-test/browser-al6.mjs
 * A save records the add-ons whose data the model holds (usesAddons); an opened file's record is read as untrusted and offered in the bar above the stage.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + JSON.stringify(d).slice(0, 300) : '')); } };
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/modelcraft-test/admin.php'), 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mc-al6-'));
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft?.file, null, { timeout: 20000 });
  ok(await page.waitForFunction(() => !!window.ccAddonsFile, null, { timeout: 15000 }).then(() => true).catch(() => false), 'the shell\'s ccAddonsFile seam is there');
  const plain = await page.evaluate(() => window.modelcraft.file());
  ok(!('usesAddons' in plain), 'a model with no add-on data records nothing (files stay as they were)');
  await page.evaluate(() => { window.ccDocData('flow').setData('layout', { items: [{ id: 1 }] }); });
  const withData = await page.evaluate(() => window.modelcraft.file());
  ok(withData.usesAddons && 'flow' in withData.usesAddons, 'a save with add-on data records the add-on that wrote it', withData.usesAddons);
  await page.evaluate(() => { window.__offers = []; const o = window.ccAddonsFile.offer; window.ccAddonsFile.offer = (doc, el) => { window.__offers.push({ doc, hasEl: !!el }); return o(doc, el); }; });
  const f = { ...plain, usesAddons: { 'site-fema-flood': '0.1.0', 'bad id!': 'x', ['x'.repeat(100)]: '1' } };
  const p = path.join(tmp, 'uses.modelcraft');
  fs.writeFileSync(p, JSON.stringify(f));
  await page.setInputFiles('[data-file-open]', p);
  await page.waitForFunction(() => window.__offers.length >= 1, null, { timeout: 10000 }).catch(() => {});
  const offers = await page.evaluate(() => window.__offers);
  ok(offers.length >= 1 && offers.at(-1).hasEl && offers.at(-1).doc.addons['site-fema-flood'] === '0.1.0' && Object.keys(offers.at(-1).doc.addons).length === 1, 'opening it offers the recorded add-on (bad ids dropped as untrusted)', offers);
  ok(!!(await page.$('[data-addons-banner]')), 'the bar is in the page');
  const again = await page.evaluate(() => window.modelcraft.file().usesAddons);
  ok(again && again['site-fema-flood'] === '0.1.0', 'saving it again keeps the record', again);
  await ctx.close();
} finally { await browser.close(); fs.rmSync(tmp, { recursive: true, force: true }); }
ok(problems.length === 0, 'no console errors', problems);
console.log(`\nbrowser-al6: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
