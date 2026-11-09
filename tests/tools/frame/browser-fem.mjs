#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fem.mjs — the Finite elements block of the Analysis panel (0.9 SU.908) in the real pages: natural frequencies of the sample frame
 * (end releases kept) in DetailCraft and in BimCraft (the sample as IFC). Each: Run the frequencies → a row per mode, ascending, shares of mass, the mode drawn
 * (the Show control), 'Not a code check' line, the settings saved in the analysis (one undo step) and read back; the PDF carries the frequencies table.
 * Run as root (it calls `sudo -u www-data php tools/frame/admin.php session|down`; the test admin is
 * frametest+cadcraft@projectz.xyz, disabled at the end) with the cached Playwright Chromium:
 *
 *   node tools/frame/browser-fem.mjs [--shots <dir>] [--only detailcraft|bimcraft]
 *
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SHOTS = arg('--shots', path.join(ROOT, 'tmp/shots/frame'));
const ONLY = arg('--only', '');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

// an IFC of DetailCraft's sample, made by DetailCraft's own writer (as bin/test-frame.mjs does)
const DC = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const dl = (f) => import(pathToFileURL(path.join(DC, f)).href);
(await dl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) });
const tmp = fs.mkdtempSync(path.join(ROOT, 'tmp/frame-browser-'));
const ifcFile = path.join(tmp, 'Frame sample.ifc');
{
  const { sampleModel } = await dl('sample.js'), { writeIfc } = await dl('ifc.js'), { build } = await dl('build.js'), { markParts, markFootings } = await dl('marks.js'), { bendingSchedule } = await dl('rebar.js');
  const st = sampleModel().state || sampleModel(), built = build(st), marks = markParts(built, { perPhase: false });
  marks.footingMark = markFootings(st.footings, { perPhase: false });
  fs.writeFileSync(ifcFile, writeIfc(st, built, marks, bendingSchedule(st.footings), { now: new Date('2026-10-16T00:00:00Z') }));
}

const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const issues = [];
const download = async (page, click) => {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), click()]);
  const f = path.join(tmp, d.suggestedFilename());
  await d.saveAs(f);
  return { name: d.suggestedFilename(), bytes: fs.readFileSync(f) };
};
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: SESSION.name, value: SESSION.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const watch = (page) => { page.on('console', (m) => { if (m.type() === 'error') issues.push('console: ' + m.text()); }); page.on('pageerror', (e) => issues.push('pageerror: ' + e.message)); };
  const check = async (page, app) => {
    ok(await page.isVisible('[data-fa-modal-run]'), app + ': the Finite elements block and its button are there');
    await page.selectOption('[data-fa-modes]', '6');
    await page.click('[data-fa-modal-run]');
    await page.waitForSelector('[data-fa-modal-table]', { timeout: 60000 });
    const rows = await page.$$eval('[data-fa-modal-row]', (r) => r.map((x) => [...x.children].map((c) => c.textContent.trim())));
    const hz = rows.map((r) => parseFloat(r[1]));
    ok(rows.length === 6 && hz.every((v, i) => v > 0 && (i === 0 || v >= hz[i - 1] - 1e-6)), app + ': 6 modes, frequencies positive and ascending — ' + hz.map((v) => v.toFixed(2)).join(', ') + ' Hz');
    ok(rows.every((r) => /^X \d/.test(r[6])), app + ': every row carries the mass shares');
    ok(/Not a code check/.test(await page.textContent('.fa-fem')), app + ': the "Not a code check" line is shown');
    ok((await page.inputValue('[data-fa-modal-show]')) === '1', app + ': mode 1 is drawn on the model after the run');
    await page.selectOption('[data-fa-modal-show]', '2');
    await page.waitForTimeout(300);
    ok((await page.inputValue('[data-fa-modal-show]')) === '2', app + ': Show switches to mode 2');
    await page.screenshot({ path: path.join(SHOTS, '10-fem-' + app + '.png') }).catch(() => {});
    await page.selectOption('[data-fa-modes]', '10');
    const saved = await page.evaluate((a) => (a === 'detailcraft' ? window.detailcraft.model.state.analysis?.fem?.modes : null), app);
    if (app === 'detailcraft') ok(saved === 10, app + ': the number of modes is saved in the analysis settings (' + saved + ')');
    await page.click('[data-fa-modal-run]');
    await page.waitForFunction(() => document.querySelectorAll('[data-fa-modal-row]').length === 10, null, { timeout: 60000 });
    ok(true, app + ': 10 modes after the setting changed');
    if (app === 'bimcraft') {
      ok(await page.isVisible('[data-fa-floor]'), app + ': the Floor pressure box (every slab) is in the Loads block');
      await page.fill('[data-fa-floor-value]', '5');
      await page.click('[data-fa-floor-add]');
      await page.waitForSelector('[data-fa-floor-loads] tbody tr');
      ok(/5 kN\/m² down/.test(await page.textContent('[data-fa-floor-loads]')), app + ': 5 kN/m² is listed and kept in the IFC settings');
      await page.click('[data-fa-run]');
      await page.waitForSelector('[data-fa-table]');
      ok(/no concrete slab/.test(await page.textContent('[data-fa-floor]')), app + ': a model with no concrete slab says the pressure has no effect');
      await page.click('[data-fa-floor-loads] tbody tr button');
      await page.waitForFunction(() => !document.querySelector('[data-fa-floor-loads]'), null, { timeout: 15000 });
      ok(true, app + ': Remove takes the pressure off again');
      await page.click('[data-fa-modal-run]');
      await page.waitForSelector('[data-fa-modal-table]', { timeout: 60000 });
    }
    const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-fa-csv]')]);
    const csv = fs.readFileSync(await d.path(), 'utf8');
    ok(/Natural frequencies/.test(csv) && /f \(Hz\)/.test(csv), app + ': the CSV report carries the frequencies table');
  };
  if (!ONLY || ONLY === 'detailcraft') {
    console.log('\nDetailCraft');
    const page = await ctx.newPage(); watch(page);
    await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 30000 });
    await page.evaluate(() => window.detailcraft.act('sample'));
    await page.waitForFunction(() => window.detailcraft.built.parts.length === 25);
    await page.click('[data-tab="analysis"]');
    await page.waitForSelector('[data-fa-run]');
    await check(page, 'detailcraft');
    await page.close();
  }
  if (!ONLY || ONLY === 'bimcraft') {
    console.log('\nBimCraft');
    const page = await ctx.newPage(); watch(page);
    await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
    await page.setInputFiles('[data-file]', ifcFile);
    await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
    await page.click('[data-rtab="analysis"]');
    await page.waitForSelector('[data-fa-run]');
    await check(page, 'bimcraft');
    await page.close();
  }
} finally {
  await browser.close();
  admin('down');
  fs.rmSync(tmp, { recursive: true, force: true });
}
ok(!issues.length, 'no console errors', issues.slice(0, 5).join(' | '));
console.log(`\n${pass} passed, ${fail} failed — shots in ${SHOTS}`);
process.exit(fail ? 1 : 0);
