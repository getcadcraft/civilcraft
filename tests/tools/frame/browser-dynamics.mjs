#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-dynamics.mjs — the Response spectrum, Time history and Pushover blocks of the Analysis panel (0.9 SU.1056) in the real pages: natural frequencies of the sample frame
 * (end releases kept) in DetailCraft and in BimCraft (the sample as IFC). Each: run the response spectrum (modes, base shear, drifts, chart), a time history under a synthetic sine and under a pasted record (peaks, charts), the
 * pushover (capacity curve, hinges), the 'Not a code check' line, the settings saved in the analysis, and the CSV report carrying the three result sets.
 * Run as root (it calls `sudo -u www-data php tools/frame/admin.php session|down`; the test admin is
 * frametest+cadcraft@projectz.xyz, disabled at the end) with the cached Playwright Chromium:
 *
 *   node tools/frame/browser-dynamics.mjs [--shots <dir>] [--only detailcraft|bimcraft]
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
  const watch = (page) => { page.on('console', (m) => { if (m.type() === 'error' && !/429/.test(m.text())) issues.push('console: ' + m.text()); }); page.on('pageerror', (e) => issues.push('pageerror: ' + e.message)); };
  const check = async (page, app) => {
    ok(await page.isVisible('[data-fa-rs-run]') && await page.isVisible('[data-fa-th-run]') && await page.isVisible('[data-fa-ps-run]'), app + ': the three blocks and their buttons are there');
    // response spectrum
    await page.selectOption('[data-fa-dyn-modes]', '10');
    await page.click('[data-fa-rs-run]');
    await page.waitForSelector('[data-fa-rs-modes],[data-fa-rs-error]', { timeout: 120000 });
    ok(!(await page.$('[data-fa-rs-error]')), app + ': response spectrum ran without an error', (await page.textContent('[data-fa-rs-error]').catch(() => '')) || '');
    const rows = await page.$$eval('[data-fa-rs-modes] [data-fa-dyn-mode]', (r) => r.map((x) => [...x.children].map((c) => c.textContent.trim())));
    const T = rows.map((r) => parseFloat(r[2]));
    ok(rows.length >= 3 && T.every((v, i) => v > 0 && (i === 0 || v <= T[i - 1] + 1e-9)), app + ': ' + rows.length + ' modes, periods descending — ' + T.slice(0, 4).map((v) => v.toFixed(3)).join(', ') + ' s');
    const vb = await page.$$eval('[data-fa-rs-vb]', (r) => r.map((x) => parseFloat(x.children[1].textContent)));
    ok(Math.max(vb[0], vb[1]) > 0, app + ': a horizontal base shear is above zero (X ' + vb[0] + ', Y ' + vb[1] + ' kN)');
    const dirAxis = vb[1] > vb[0] ? 'Y' : 'X', di = dirAxis === 'Y' ? 1 : 0;
    ok(await page.isVisible('[data-fa-rs-spectrum] svg'), app + ': the spectrum chart is drawn');
    ok(/Not a code check/.test(await page.textContent('.fa-rs')), app + ': the "Not a code check" line is shown (response spectrum)');
    await page.selectOption('[data-fa-rs-method]', 'srss');
    const vb2 = await page.evaluate(() => 0);
    void vb2;
    await page.click('[data-fa-rs-run]');
    await page.waitForSelector('[data-fa-rs-base]', { timeout: 120000 });
    const vbS = await page.$$eval('[data-fa-rs-vb]', (r) => r.map((x) => parseFloat(x.children[1].textContent)));
    ok(vbS[di] > 0 && vbS[di] <= vb[di] * 1.0001 + 0.01, app + ': SRSS gives a base shear not above CQC here (' + vbS[di] + ' <= ' + vb[di] + ')');
    if (app === 'detailcraft') ok((await page.evaluate(() => window.detailcraft.model.state.analysis?.dyn?.rs?.method)) === 'srss', app + ': the method is saved in the analysis settings');
    // time history, synthetic sine
    await page.selectOption('[data-fa-th-dir]', dirAxis);
    await page.click('[data-fa-th-run]');
    await page.waitForSelector('[data-fa-th-peaks],[data-fa-th-error]', { timeout: 180000 });
    ok(!(await page.$('[data-fa-th-error]')), app + ': time history ran without an error', (await page.textContent('[data-fa-th-error]').catch(() => '')) || '');
    const peaks = await page.$$eval('[data-fa-th-peak]', (r) => r.map((x) => parseFloat(x.children[1].textContent)));
    ok(peaks.length === 3 && peaks.every((v) => v > 0), app + ': input, roof and base peaks are all above zero — ' + peaks.join(', '));
    ok(await page.isVisible('[data-fa-th-roof] svg') && await page.isVisible('[data-fa-th-base] svg'), app + ': roof and base shear histories are drawn');
    ok(/synthetic/i.test(await page.textContent('.fa-th')), app + ': the input is labelled synthetic');
    // a pasted record (a decaying pulse, 400 lines), direct integration
    await page.selectOption('[data-fa-th-motion]', 'table');
    const lines = []; for (let i = 0; i < 400; i++) lines.push((i * 0.01).toFixed(2) + ', ' + (0.15 * Math.exp(-i / 60) * Math.sin(i * 0.4)).toFixed(5));
    await page.fill('[data-fa-th-paste]', lines.join('\n'));
    await page.press('[data-fa-th-paste]', 'Tab');
    await page.waitForFunction(() => /400 points/.test(document.querySelector('[data-fa-th-have]')?.textContent || ''), null, { timeout: 15000 });
    ok(true, app + ': a pasted record of 400 points is read and kept with the model');
    await page.selectOption('[data-fa-th-method]', 'direct');
    await page.click('[data-fa-th-run]');
    await page.waitForSelector('[data-fa-th-peaks],[data-fa-th-error]', { timeout: 300000 });
    ok(!(await page.$('[data-fa-th-error]')), app + ': direct integration under the pasted record ran', (await page.textContent('[data-fa-th-error]').catch(() => '')) || '');
    const p2 = await page.$$eval('[data-fa-th-peak]', (r) => r.map((x) => parseFloat(x.children[1].textContent)));
    ok(p2.length === 3 && p2[1] > 0 && p2[2] > 0, app + ': direct integration gives a roof and base peak — ' + p2.join(', '));
    // pushover
    await page.selectOption('[data-fa-ps-dir]', dirAxis);
    await page.fill('[data-fa-ps-target]', '0');
    await page.click('[data-fa-ps-run]');
    await page.waitForSelector('[data-fa-ps-summary],[data-fa-ps-error]', { timeout: 300000 });
    const perr = await page.textContent('[data-fa-ps-error]').catch(() => '');
    ok(!perr, app + ': pushover ran' + (perr ? ' — ' + perr : ''));
    if (!perr) {
      ok(await page.isVisible('[data-fa-ps-curve] svg'), app + ': the capacity curve is drawn');
      const sum = await page.$$eval('[data-fa-ps-summary] tr', (r) => r.map((x) => x.textContent.trim()));
      ok(sum.length >= 5, app + ': the summary lists stiffness, largest base shear and hinges — ' + sum.slice(0, 3).join(' | '));
      ok(/Not a code check/.test(await page.textContent('.fa-ps')), app + ': the "Not a code check" line is shown (pushover)');
    }
    // settings changes make older results stale: run the three again, with nothing changed in between, for the report
    await page.click('[data-fa-rs-run]'); await page.waitForSelector('[data-fa-rs-base]', { timeout: 120000 });
    await page.click('[data-fa-th-run]'); await page.waitForSelector('[data-fa-th-peaks]', { timeout: 300000 });
    await page.click('[data-fa-ps-run]'); await page.waitForSelector('[data-fa-ps-summary],[data-fa-ps-error]', { timeout: 300000 });
    await page.screenshot({ path: path.join(SHOTS, '11-dynamics-' + app + '.png'), fullPage: false }).catch(() => {});
    // the CSV report carries the three result sets
    const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-fa-csv]')]);
    const csv = fs.readFileSync(await d.path(), 'utf8');
    ok(/Response spectrum/.test(csv) && /Time history/.test(csv), app + ': the CSV report carries the response spectrum and time history tables');
    ok(perr || /Pushover/.test(csv), app + ': ... and the pushover');
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
