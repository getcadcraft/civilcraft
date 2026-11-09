#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-envir.mjs — 0.8 round 3 (civil_PART_3), EG.58: the Massing options window on the sample site (open BimCraft's options file, place one on a parcel,
 * the zoning answer, the envelope file back) at https://getcadcraft.com/lab/civilcraft.
 *   node tools/civilcraft-test/browser-envir.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-massopt'); })();
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
function epwText() {
  const head = ['LOCATION,Testville,XX,TST,synthetic,0,40,-105,-7,1600', 'DESIGN CONDITIONS,0', 'TYPICAL/EXTREME PERIODS,0', 'GROUND TEMPERATURES,0', 'HOLIDAYS/DAYLIGHT SAVINGS,No,0,0,0', 'COMMENTS 1,x', 'COMMENTS 2,x', 'DATA PERIODS,1,1,Data,Sunday, 1/ 1,12/31'];
  const dm = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], rows = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= dm[m - 1]; d++) for (let h = 1; h <= 24; h++) {
    const c = new Array(35).fill('0'); const sun = h >= 8 && h <= 17;
    c[0] = '2005'; c[1] = m; c[2] = d; c[3] = h; c[4] = 60; c[6] = 25; c[7] = 10; c[8] = 40; c[9] = 83000; c[12] = 350; c[13] = sun ? 600 : 0; c[14] = sun ? 700 : 0; c[15] = sun ? 80 : 0; c[20] = 90; c[21] = 2;
    rows.push(c.join(','));
  }
  return head.concat(rows).join('\n');
}

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

  const b = await page.evaluate(() => window.civilcraft.project.eg().surface.stats().bounds);
  const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
  const u = await page.evaluate(() => window.civilcraft.project.state.units);
  const k = u === 'm' ? 1 : 3937 / 1200;
  await page.evaluate(([x, y, k]) => window.civilcraft.project.change('mass', (s) => { (s.masses ||= []).push({ id: 'm1', name: 'Block', pts: [{ x, y }, { x: x + 10 * k, y }, { x: x + 10 * k, y: y + 10 * k }, { x, y: y + 10 * k }], floors: 3, floorHeight: 3.333 * k, use: 'Office' }); }), [cx, cy, k]);
  await page.evaluate(() => window.civilcraft.command('mass'));
  await page.waitForSelector('[data-env-head]');
  ok(!!(await page.$('[data-env-shade-run]')) && !!(await page.$('[data-env-wind]')), 'the Environment block is in the Massing panel, with the wind line');
  ok(/not validated/i.test(await page.$eval('[data-env-wind]', (n) => n.textContent)), 'the wind line says the wind engine is not validated');
  ok(!(await page.$('[data-env-wind-run]')), 'the built-in wind run button stays hidden until the Experimental tick');
  fs.writeFileSync(path.join(OUT, 'test.epw'), epwText());
  await page.setInputFiles('[data-env-epw]', path.join(OUT, 'test.epw'));
  await page.waitForSelector('[data-env-epw-note]');
  await page.waitForFunction(() => /Testville/.test(document.querySelector('[data-env-epw-note]')?.textContent || ''), null, { timeout: 15000 });
  ok(true, 'the weather file loads: ' + (await page.$eval('[data-env-epw-note]', (n) => n.textContent)).slice(0, 90));
  await page.fill('[data-env-date]', '2026-06-21'); await page.dispatchEvent('[data-env-date]', 'change');
  await page.click('[data-env-shade-run]');
  await page.waitForSelector('[data-env-map]', { timeout: 60000 });
  const rows = await page.$$eval('[data-env-series] tbody tr', (r) => r.length);
  ok(rows > 3, 'the shade study lists its hours (' + rows + ' rows)');
  const lit = await page.$eval('[data-env-map]', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const seen = new Set(); for (let i = 0; i < d.length; i += 4) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return seen.size; });
  ok(lit > 1, 'the hours map has more than one colour (' + lit + ')');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-env-csv]')]);
  ok((fs.readFileSync(await dl.path(), 'utf8').split('\n').length) > 3, 'the shade hours download as CSV');
  await page.click('[data-env-pv-run]');
  await page.waitForSelector('[data-env-pv] tbody tr', { timeout: 60000 });
  const pvTxt = await page.$eval('[data-env-pv] tbody', (n) => n.textContent);
  ok(/Block/.test(pvTxt) && /\d/.test(pvTxt), 'solar yield is listed for the block: ' + pvTxt.slice(0, 60));
  await page.click('[data-env-ux-run]');
  await page.waitForSelector('[data-env-ux] tbody tr', { timeout: 60000 });
  ok((await page.$$eval('[data-env-ux] tbody tr', (r) => r.length)) >= 4, 'outdoor comfort is listed for the open place and each wall');
  const saved = await page.evaluate(() => JSON.stringify(window.civilcraft.project.state));
  ok(!/Testville|utci|shade-hours/i.test(saved), 'nothing from the study is saved in the project');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
