#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bundle_PART_3.mjs — CadCraft opens a project bundle (0.8 BIM-BUNDLE-OPEN + DF.12b, session ifc_PART_3) on the real page, headless, in the lab:
 * the sample bundle's DWG layout opens, its layers and dashed line type are added from the bundle's standards, and a zip with no manifest is refused.
 *   node tools/cadcraft-test/browser-bundle_PART_3.mjs        (run as root; test admin via tools/cadcraft-test/admin.php)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SAMPLE = path.join(REPO, '..', 'testfiles/archicad-bundle/FZK-Haus.ccbundle.zip');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const adminCmd = (c) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, c, 'cwb'], { encoding: 'utf8' }) || '{}');
adminCmd('up');
const sess = adminCmd('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
try {
  if (!fs.existsSync(SAMPLE)) throw new Error('sample bundle missing: ' + SAMPLE);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => !!window.cadcraft, null, { timeout: 15000 });
  const before = await page.evaluate(() => ({ layers: window.cadcraft.doc.layers.size, lt: window.cadcraft.doc.linetypes.size }));
  await page.setInputFiles('[data-file]', SAMPLE);
  await page.waitForFunction(() => /Standards from the bundle/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  const hist = await page.textContent('[data-history]');
  ok(/Project bundle "FZK-Haus\.ccbundle\.zip"/.test(hist), 'the history names the bundle and its drawing', hist.slice(-400));
  const after = await page.evaluate(() => { const d = window.cadcraft.doc; return { layers: [...d.layers.keys()], lt: [...d.linetypes.keys()], entities: d.entities?.size ?? d.entities?.length ?? null, g: d.layers.get('Gelaender') || null }; });
  ok(after.layers.includes('Gelaender') && after.layers.includes('Räume') && after.layers.length >= 10, 'the bundle layers are in the drawing (' + after.layers.length + ' layers, was ' + before.layers + ')', after.layers.slice(0, 5));
  ok(after.lt.includes('Gestrichelt'), 'the dashed line type came with the standards', after.lt);
  ok(/pen sets/i.test(hist), 'the pen sets are reported as not loaded');
  ok(/dashed line type/.test(hist), 'the history says how many layers and line types were added');
  // a zip that is not a bundle
  const zip = path.join(process.env.TMPDIR || '/tmp', 'not-a-bundle.ccbundle');
  fs.writeFileSync(zip, Buffer.from('504b0506' + '00'.repeat(18), 'hex'));
  await page.setInputFiles('[data-file]', zip);
  await page.waitForFunction(() => /could not read/.test(document.querySelector('[data-history]')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
  ok(/could not read "not-a-bundle\.ccbundle" as a project bundle/.test(await page.textContent('[data-history]')), 'a zip with no manifest is refused in words');
  fs.rmSync(zip, { force: true });
  ok(problems.length === 0, 'no page errors', problems);
} catch (e) { fail++; console.log('  FAIL ' + e.message); }
await browser.close();
adminCmd('down');
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
