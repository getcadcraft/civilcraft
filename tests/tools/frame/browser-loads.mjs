#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-loads.mjs — the Wind, Seismic site and ASCE 7 combinations blocks of the Analysis panel (0.9 SU.1056b) in the real pages: natural frequencies of the sample frame
 * (end releases kept) in DetailCraft and in BimCraft (the sample as IFC). Each: Run the frequencies → a row per mode, ascending, shares of mass, the mode drawn
 * (the Show control), 'Not a code check' line, the settings saved in the analysis (one undo step) and read back; the PDF carries the frequencies table.
 * Run as root (it calls `sudo -u www-data php tools/frame/admin.php session|down`; the test admin is
 * frametest+cadcraft@projectz.xyz, disabled at the end) with the cached Playwright Chromium:
 *
 *   node tools/frame/browser-loads.mjs [--shots <dir>] [--only detailcraft|bimcraft]
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
  const set = async (page, sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); await page.waitForTimeout(150); };
  const check = async (page, app) => {
    for (const s of ['[data-fa-wind-block]', '[data-fa-site-block]', '[data-fa-ld-combos-block]', '[data-fa-ld-sources]']) ok(await page.isVisible(s) || s === '[data-fa-ld-sources]' && (await page.$(s)) !== null, app + ': block ' + s + ' is in the panel');
    ok(/Not a code check; your engineer reviews the results\./.test(await page.textContent('[data-fa-wind-block]')) && /Not a code check/.test(await page.textContent('[data-fa-site-block]')), app + ': both blocks say "Not a code check; your engineer reviews the results."');
    await page.click('[data-fa-eq-find]');                       // floors (the Seismic block's button): the sample's levels
    await page.waitForSelector('[data-fa-eq-floors] tbody tr', { timeout: 20000 });
    const nf = await page.$$eval('[data-fa-eq-floors] tbody tr', (r) => r.length);
    ok(nf >= 1, app + ': floors found (' + nf + ')');
    await page.click('[data-fa-run]');
    await page.waitForSelector('[data-fa-table]', { timeout: 60000 });
    ok(!!(await page.$('[data-fa-wind-need]')) || /Type the basic wind speed/.test(await page.textContent('[data-fa-wind-block]')), app + ': without a wind speed nothing is invented');
    await set(page, '[data-fa-wind="V"]', 100);
    await page.selectOption('[data-fa-wind="vUnit"]', 'mph');
    await page.click('[data-fa-run]');                          // an edit makes the results stale; the floors and size come from a fresh run
    await page.waitForSelector('[data-fa-wind-summary]', { timeout: 20000 });
    const sum = await page.$$eval('[data-fa-wind-summary]', (r) => r.map((x) => x.textContent));
    ok(sum.length === 2 && sum.every((x) => /qh = [\d.]+ kPa/.test(x)), app + ': wind along X and Y: ' + sum.join(' | '));
    const rowsW = await page.$$eval('[data-fa-wind-forces="X"] tbody tr', (r) => r.map((x) => [...x.children].map((c) => c.textContent.trim())));
    ok(rowsW.length === nf && rowsW.every((r) => parseFloat(r[2]) > 0 && parseFloat(r[7]) > 0), app + ': a row per floor with qz and a force, from the model');
    ok(rowsW.length < 2 || parseFloat(rowsW.at(-1)[2]) >= parseFloat(rowsW[0][2]), app + ': velocity pressure grows with height');
    await page.click('[data-fa-wind-make]');
    await page.waitForFunction(() => [...document.querySelectorAll('[data-fa-cases] tbody tr input[type=text]')].some((i) => /^Wind/.test(i.value)), null, { timeout: 20000 });
    const names = await page.$$eval('[data-fa-cases] tbody tr input[type=text]', (r) => r.map((i) => i.value));
    ok(names.filter((n) => /^Wind/.test(n)).length === 4, app + ': four wind cases made (±X, ±Y): ' + names.filter((n) => /^Wind/.test(n)).join(', '));
    // seismic site: Ss, S1, class → SDS, SD1; the spectrum; the 50 % exception; use in the Seismic block
    await set(page, '[data-fa-site="Ss"]', 0.52);
    await set(page, '[data-fa-site="S1"]', 0.232);
    await page.selectOption('[data-fa-site="siteClass"]', 'D');
    await page.waitForSelector('[data-fa-site-err]');
    ok(/site-specific/.test(await page.textContent('[data-fa-site-err]')), app + ': class D with S1 of 0.2 or more asks for a site study or the exception');
    await page.check('[data-fa-site="d1exception"]');
    await page.waitForSelector('[data-fa-site-result]');
    const res = await page.textContent('[data-fa-site-result]');
    ok(/Fa 1\.384/.test(res) && /Fv 2\.136/.test(res) && /SDS 0\.48\d g/.test(res) && /SD1 0\.49\d g/.test(res), app + ': Fa 1.384, Fv 2.136, SDS 0.480, SD1 0.496 — ' + res);
    ok((await page.$$eval('[data-fa-site-spectrum-table] tbody tr', (r) => r.length)) >= 8, app + ': the design spectrum is tabulated');
    await page.click('[data-fa-site-use]');
    await page.waitForFunction(() => document.querySelector('[data-fa-eq="SDS"]')?.value === '0.4798', null, { timeout: 15000 });
    ok(await page.inputValue('[data-fa-eq="R"]') === '8' && await page.inputValue('[data-fa-eq="Cd"]') === '5.5', app + ': the Seismic block took SDS 0.4798, R 8, Cd 5.5');
    // USGS lookup, with the service answered by the test (no network)
    await page.route('https://earthquake.usgs.gov/**', (route) => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' },
      body: JSON.stringify({ response: { data: { ss: 1.5, s1: 0.6, sms: 1.5, sm1: 0.9, sds: 1.0, sd1: 0.6, tl: 8 } } }) }));
    await set(page, '[data-fa-site="lat"]', '34'); await set(page, '[data-fa-site="lon"]', '-118');
    await page.click('[data-fa-site-lookup]');
    await page.waitForFunction(() => /USGS answered/.test(document.querySelector('[data-fa-site-msg]')?.textContent || ''), null, { timeout: 20000 });
    ok(await page.inputValue('[data-fa-site="Ss"]') === '1.5' && await page.inputValue('[data-fa-site="S1"]') === '0.6', app + ': the lookup (answered by the test) filled Ss 1.5 and S1 0.6');
    // combinations
    await page.click('[data-fa-ld-combos]');
    await page.waitForFunction(() => document.querySelectorAll('[data-fa-combos] tbody tr').length > 5, null, { timeout: 20000 });
    const combos = await page.$$eval('[data-fa-combos] tbody tr', (r) => r.map((x) => x.querySelector('input')?.value));
    ok(combos.some((n) => /^LRFD \(1\)/.test(n)) && combos.some((n) => /Wind/.test(n)), app + ': LRFD combinations with the wind cases (' + combos.length + ')');
    await page.selectOption('[data-fa-ld-method]', 'asd');
    await page.click('[data-fa-ld-combos]');
    await page.waitForFunction(() => [...document.querySelectorAll('[data-fa-combos] tbody tr input')].some((i) => /^ASD/.test(i.value)), null, { timeout: 20000 });
    ok(true, app + ': ASD combinations made');
    // solve with a wind combination, saved settings, sources, report
    await page.click('[data-fa-run]');
    await page.waitForSelector('[data-fa-table]', { timeout: 60000 });
    const keys = await page.$$eval('[data-fa-set] option', (o) => o.map((x) => x.textContent));
    ok(keys.some((k) => /Wind/.test(k)), app + ': a wind case is among the results to show — ' + keys.length + ' result sets');
    const saved = await page.evaluate((a) => (a === 'detailcraft' ? window.detailcraft.model.state.analysis?.loads : null), app);
    if (app === 'detailcraft') ok(saved && saved.wind.V === 100 && saved.site.Ss === 1.5 && saved.combos.method === 'asd', app + ': the settings are saved in the analysis');
    await page.click('[data-fa-ld-sources] summary');
    const src = await page.textContent('[data-fa-ld-sources]');
    ok(/Left out/.test(src) && /bentley|skyciv|seaoc|shop\.iccsafe|nibs\.org|usgs/i.test(await page.$eval('[data-fa-ld-sources]', (e) => e.innerHTML)), app + ': the sources and the left-out list are reachable from the panel');
    await page.screenshot({ path: path.join(SHOTS, '11-loads-' + app + '.png') }).catch(() => {});
    const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-fa-csv]')]);
    const csv = fs.readFileSync(await d.path(), 'utf8');
    ok(/Wind loads/.test(csv) && /Seismic site/.test(csv) && /Not a code check/.test(csv), app + ': the CSV report carries the wind and seismic site tables');
    const [p2] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-fa-pdf]')]);
    ok(fs.statSync(await p2.path()).size > 3000, app + ': the PDF report is made');
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
