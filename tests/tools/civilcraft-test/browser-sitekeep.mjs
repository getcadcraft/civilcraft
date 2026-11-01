#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sitekeep.mjs — 0.8 EG.63: the site kept in the project file, in headless Chromium at https://getcadcraft.com/lab/civilcraft (light: no rain run).
 * Puts the frozen site (fixtures/formats/civilcraft/v1-site.json) into the open project, opens Address to site, checks the kept site is shown with its sources and
 * licence and no service is asked, saves it as a .ccsite.json with its provenance, forgets it, and fails on any console error.
 *   node tools/civilcraft-test/browser-sitekeep.mjs
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
  const fx = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/formats/civilcraft/v1-site.json'), 'utf8'));
  const asked = []; page.on('request', (r) => { if (!r.url().startsWith(BASE) && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) asked.push(r.url()); });
  await page.evaluate((site) => window.civilcraft.project.change('kept site', (s) => { s.site = site; }), fx.site);
  await page.evaluate(() => window.civilcraft.command('eg-site')); await page.waitForSelector('[data-eg-dialog][open]');
  ok(!!(await page.$('[data-eg-st-kept]')), 'the window shows the kept site box');
  const lead = await page.$eval('[data-eg-st-kept-lead]', (n) => n.textContent);
  ok(/Schlossplatz 1, Stuttgart/.test(lead) && /48\.7783/.test(lead) && /2026-10-30/.test(lead), 'the kept site shows the address, the point and the fetch day: ' + lead.slice(0, 120));
  const srcs = await page.$$eval('[data-eg-st-kept-src] li', (l) => l.map((n) => n.textContent));
  ok(srcs.length === 2 && srcs.some((t) => /FEMA/.test(t) && /US federal data/.test(t) && /2026-10-29/.test(t)), 'each source is listed with its licence and day', srcs);
  ok(await page.$eval('#eg-st-lat', (n) => Number(n.value) === 48.7783), 'the point fields start from the kept site');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-eg-st-kept-save]')]);
  const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8').replace(/^\uFEFF/, ''));
  ok(dl.suggestedFilename().endsWith('.ccsite.json') && saved.format === 'cc-site-context' && saved.items.length === fx.site.items.length && saved.address === 'Schlossplatz 1, Stuttgart' && saved.sources.length === 2, 'Save writes the .ccsite.json from the kept site, with its provenance');
  ok(asked.length === 0, 'no outside service was asked', asked);
  await page.click('[data-eg-st-forget]');
  ok(!(await page.$('[data-eg-st-kept-lead]')) && !(await page.evaluate(() => window.civilcraft.project.state.site)), 'Forget removes it from the project');
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(!!(await page.evaluate(() => window.civilcraft.project.state.site)), 'and undo brings it back');
  const text = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON()));
  ok(JSON.parse(text).site.sources.length === 2, 'the project file written by the page carries the site');
} finally { await browser.close(); admin('down'); }
ok(problems.length === 0, 'no console errors', problems);
console.log(`browser-sitekeep: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
