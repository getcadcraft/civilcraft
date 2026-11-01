#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-georef.mjs — D8.9 round 3 (0.8, session d89b_PART_3): the three georeference dialogs in the lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-georef.mjs [--shots <dir>]
 * Signs in with a minted session (tools/shell-test/admin.php session; the shared admin login is never touched; `down` at the end).
 *   1  a model with no map conversion: Measure › Coordinate system… → UTM 33N → "Place this model on the map" (lat/long → E/N, rotation) → saved IFC has
 *      IfcProjectedCRS + IfcMapConversion; an IFC2X3 file gets the property sets instead; "Map origin…" on a placed model says so
 *   2  a model that has one: another system asks "Only change what Location reports" or "Move the model to this system"; Move rewrites IfcProjectedCRS
 *      (the saved IFC says the new system, latitude/longitude of the origin unchanged), Only leaves the file's own georeference
 *   3  a point cloud and a terrain file in another system: no system in the file → asked which (the picker), remembered for that file; "Reproject into the
 *      model's system", the file untouched; the datum / area Problems are listed in the dialog
 * Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const [cname, cval] = minted.cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');
const saveText = async () => { const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]); return fs.readFileSync(await dl.path(), 'utf8'); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const crsBtn = async () => { await page.click('[data-measure-crs]'); await page.waitForSelector('dialog[data-crs-pick][open]'); };
const pickSystem = async (q) => { await page.fill('[data-crs-q]', q); await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled); await page.click('[data-crs-use]'); };
const tmp = process.env.TMPDIR || '/tmp';

async function start(file) {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('cadcraft.projections'); localStorage.removeItem('cadcraft.filecrs'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  if (await page.waitForSelector('[data-autosave-dialog][open] [data-autosave-discard-all]', { timeout: 3000 }).catch(() => null)) {   // the previous part's unsaved model is offered back
    await page.click('[data-autosave-dialog][open] [data-autosave-discard-all]');
    await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog][open]'), null, { timeout: 5000 }).catch(() => page.keyboard.press('Escape'));
  }
  if (file) {
    await page.setInputFiles('[data-file]', { name: file.name, mimeType: 'application/x-step', buffer: Buffer.from(file.text) });
    await waitStatus(/^Opened /);
    await page.click('[data-view="iso"]');
  } else {
    await page.click('[data-empty] [data-new]');
    await page.waitForSelector('dialog.bc-new');
    await page.fill('[data-new-name]', 'Georef test');
    await page.fill('[data-new-levels]', '1');
    await page.fill('[data-new-height]', '3000 mm');
    await page.click('[data-new-ok]');
    await waitStatus(/^New building Georef test/);
    await page.waitForSelector('[data-plan-wrap]:not([hidden])');
    await page.click('[data-toolbar] [data-view="iso"]').catch(() => {});
  }
  await page.locator('[data-canvas]').focus().catch(() => {});
  await page.keyboard.press('m');
  await page.waitForSelector('[data-measure-georef]');
}

await page.addInitScript(() => { window.__workers = []; const W = window.Worker; window.Worker = class extends W { constructor(u, o) { window.__workers.push(String(u)); super(u, o); } }; });
try {
  await ctx.addCookies([{ name: cname, value: cval, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);

  console.log('== 1  a model with no map conversion (new model, IFC4)');
  await start(null);
  ok(await page.isVisible('[data-measure-georef]'), 'Measure shows "Map origin…" beside "Coordinate system…"');
  await page.click('[data-measure-georef]');
  await waitStatus(/Choose the model's coordinate system first/);
  await page.waitForSelector('dialog[data-crs-pick][open]');
  ok(true, 'Map origin… with no system chosen asks for the system first and opens the picker');
  await pickSystem('UTM 33N');
  await page.waitForSelector('dialog[data-georef-origin][open]');
  ok(/UTM zone 33N/.test(await page.textContent('dialog[data-georef-origin]')), 'the system picked, the "Place this model on the map" dialog follows');
  ok(!(await page.$('[data-geo-2x3]')), 'an IFC4 model gets no IFC2X3 note');
  ok(Math.abs(Number(await page.inputValue('[data-geo-scale]')) - 0.001) < 1e-12, 'the scale starts at the unit difference (0.001: millimetres on a metre grid)');
  await page.fill('[data-geo-e]', 'abc');
  await page.click('[data-geo-apply]');
  await page.waitForSelector('[data-georef-problem="georef.numbers"]');
  ok(true, 'eastings that are not a number: a Problem in the dialog, nothing written');
  await page.fill('[data-geo-lat]', '48.2'); await page.fill('[data-geo-lon]', '16.37');
  await page.click('[data-geo-convert]');
  const E = Number(await page.inputValue('[data-geo-e]')), N = Number(await page.inputValue('[data-geo-n]'));
  ok(E > 600000 && E < 604000 && N > 5338000 && N < 5341000, 'a latitude/longitude is converted through UTM 33N: E ' + E + ', N ' + N);
  await page.fill('[data-geo-rot]', '10');
  await shot('georef-01-origin');
  await page.click('[data-geo-apply]');
  await waitStatus(/The model is on the map in WGS 84 \/ UTM zone 33N/);
  ok(!(await page.$('dialog[data-georef-origin]')), 'placed; the dialog closed');
  let text = await saveText();
  ok(/IFCPROJECTEDCRS\('EPSG:32633'/.test(text) && /IFCMAPCONVERSION\(/.test(text) && new RegExp('IFCMAPCONVERSION\\([^;]*' + E.toFixed(0)).test(text), 'the saved IFC has IfcProjectedCRS EPSG:32633 and an IfcMapConversion at E ' + E);
  await page.click('[data-measure-georef]');
  await waitStatus(/already on the map in WGS 84 \/ UTM zone 33N/);
  ok(true, 'Map origin… on a placed model says so and points to Coordinate system…');

  console.log('== 2  a model on the map: another system asks what to do');
  await crsBtn();
  await pickSystem('UTM 32N');
  await page.waitForSelector('dialog[data-georef-choice][open]');
  const pv = await page.textContent('[data-georef-preview]');
  ok(/Origin from E 6\d{5}/.test(pv) && /stay the same/.test(pv), 'both choices are offered with a preview: ' + pv.slice(0, 120));
  ok(await page.isVisible('[data-georef-only]') && await page.isVisible('[data-georef-move]'), '"Only change what Location reports" and "Move the model to this system"');
  await shot('georef-02-choice');
  await page.click('[data-georef-move]');
  await waitStatus(/georeference now says WGS 84 \/ UTM zone 32N/);
  text = await saveText();
  ok(/IFCPROJECTEDCRS\('EPSG:32632'/.test(text) && (text.match(/IFCPROJECTEDCRS\(/g) || []).length === 1 && (text.match(/IFCMAPCONVERSION\(/g) || []).length === 1, 'Move: the saved IFC says EPSG:32632, one IfcProjectedCRS, one IfcMapConversion (rewritten in place)');
  const mc = /IFCMAPCONVERSION\([^;]*;/.exec(text)[0];
  ok(!mc.includes(String(E)), 'the origin changed with the system: ' + mc.slice(0, 90));
  await crsBtn();
  await pickSystem('UTM 33N');
  await page.waitForSelector('dialog[data-georef-choice][open]');
  await page.click('[data-georef-only]');
  await waitStatus(/is this model's coordinate system/);
  const text2 = await saveText();
  ok(/IFCPROJECTEDCRS\('EPSG:32632'/.test(text2) && /CadCraft_CRS/.test(text2), 'Only: the file keeps its own EPSG:32632 georeference; the choice (UTM 33N) is in CadCraft_CRS');
  await crsBtn();
  await pickSystem('UTM 33N');
  await page.waitForFunction(() => !document.querySelector('dialog[data-crs-pick][open]'));
  ok(!(await page.$('dialog[data-georef-choice][open]')), 'the same system again: no question');

  console.log('== 3  a point cloud in another system');
  // 2,000 points round Paris in Lambert-93 metres: the model sits in UTM 33N (Vienna), far outside Paris\' own zone
  const rows = [];
  for (let i = 0; i < 2000; i++) rows.push([650000 + (i % 50) * 2, 6860000 + Math.floor(i / 50) * 2, 35 + (i % 7) * 0.1].join(' '));
  fs.writeFileSync(path.join(tmp, 'paris-scan.xyz'), rows.join('\n'));
  await page.setInputFiles('[data-cloud-input]', path.join(tmp, 'paris-scan.xyz'));
  await page.waitForSelector('[data-cloudbar]:not([hidden])', { timeout: 60000 });
  const box0 = JSON.stringify(await page.evaluate(() => window.bimcraftCloud.state().box));
  await page.click('[data-cloud-system]');
  await page.waitForSelector('dialog[data-georef-file][open]');
  ok(/Which system is this file in/.test(await page.textContent('dialog[data-georef-file]')), 'the file names no system: "Which system is this file in?"');
  await shot('georef-03-ask');
  await page.click('[data-georef-pick]');
  await page.waitForSelector('dialog[data-crs-pick][open]');
  await pickSystem('2154');
  await page.waitForSelector('dialog[data-georef-file][open]');
  const intro = await page.textContent('dialog[data-georef-file]');
  ok(/Lambert-93/.test(intro) && /UTM zone 33N/.test(intro) && /not touched/.test(intro), 'the file in Lambert-93, the model in UTM 33N, the file itself not touched: ' + intro.slice(0, 110));
  ok(await page.isVisible('[data-georef-problem="georef.area"]'), 'a Problem is listed: the data is far outside the model\'s zone');
  await shot('georef-04-reproject');
  await page.click('[data-georef-do]');
  await waitStatus(/2,000 points of paris-scan\.xyz were reprojected/);
  const box1 = JSON.stringify(await page.evaluate(() => window.bimcraftCloud.state().box));
  ok(box0 !== box1, 'the cloud moved into the model\'s system (its extent changed)');
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.filecrs') || '{}'))) && Object.keys(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.filecrs') || '{}'))).length === 1, 'the answer is remembered for that file');
  await page.evaluate(() => window.bimcraftCloud.remove());
  await page.setInputFiles('[data-cloud-input]', path.join(tmp, 'paris-scan.xyz'));
  await page.waitForSelector('[data-cloudbar]:not([hidden])', { timeout: 60000 });
  await page.click('[data-cloud-system]');
  await page.waitForSelector('dialog[data-georef-file][open]');
  ok(/Lambert-93/.test(await page.textContent('dialog[data-georef-file]')) && !/Which system/.test(await page.textContent('dialog[data-georef-file]')), 'opened again: not asked, Lambert-93 is remembered');
  await page.click('[data-georef-keep]');
  ok(!(await page.$('dialog[data-georef-file][open]')), '"Keep the file\'s own system" closes it');

  console.log('== 3  a big cloud goes through a Worker, the page stays usable');
  await page.evaluate(() => window.bimcraftCloud.remove());
  const big = [];
  for (let i = 0; i < 250000; i++) big.push((650000 + (i % 500) * 0.5) + ' ' + (6860000 + Math.floor(i / 500) * 0.5) + ' ' + (35 + (i % 7) * 0.1));
  fs.writeFileSync(path.join(tmp, 'paris-big.xyz'), big.join('\n'));
  await page.setInputFiles('[data-cloud-input]', path.join(tmp, 'paris-big.xyz'));
  await page.waitForSelector('[data-cloudbar]:not([hidden])', { timeout: 120000 });
  await page.click('[data-cloud-system]');
  await page.waitForSelector('dialog[data-georef-file][open]');
  await page.click('[data-georef-pick]');
  await page.waitForSelector('dialog[data-crs-pick][open]');
  await pickSystem('2154');
  await page.waitForSelector('dialog[data-georef-file][open]');
  await page.evaluate(() => { window.__tick = 0; window.__iv = setInterval(() => { window.__tick++; }, 20); });
  await page.click('[data-georef-do]');
  await waitStatus(/250,000 points of paris-big\.xyz were reprojected/, 120000);
  const bw = await page.evaluate(() => ({ w: window.__workers.filter((u) => /reproject-worker/.test(u)).length, ticks: window.__tick }));
  ok(bw.w === 1, 'over 200,000 points: one reproject-worker.js Worker was used');
  ok(bw.ticks > 5, 'timers kept running while it worked (' + bw.ticks + ' ticks of 20 ms): the page was not blocked');
  await page.evaluate(() => window.bimcraftCloud.remove());

  console.log('== 3  a terrain file in another system');
  await page.evaluate(() => window.bimcraftCloud.remove());
  await page.waitForSelector('[data-plan-wrap]:not([hidden])').catch(() => {});
  const survey = ['P,N,E,Z,D'];
  let k = 1;
  for (let x = 0; x <= 60; x += 10) for (let y = 0; y <= 60; y += 10) survey.push([k++, 6860000 + y, 650000 + x, 35 + x / 10, 'GND'].join(','));
  fs.writeFileSync(path.join(tmp, 'paris-survey.csv'), survey.join('\n'));
  await page.click('[data-res-tools] > summary');
  await page.click('[data-mtool="terrain"]');
  await page.selectOption('[data-res-trunit]', 'm');
  await page.setInputFiles('[data-res-trfile]', path.join(tmp, 'paris-survey.csv'));
  await page.waitForSelector('dialog[data-georef-file][open]');
  await page.click('[data-georef-pick]');
  await page.waitForSelector('dialog[data-crs-pick][open]');
  await pickSystem('2154');
  await page.waitForSelector('dialog[data-georef-file][open]');
  await page.click('[data-georef-do]');
  await page.waitForFunction(() => /49 points of paris-survey\.csv were reprojected|Ground/.test(document.querySelector('[data-status]')?.textContent || '') || !!window.bimcraftRes?.state.terrain, null, { timeout: 60000 });
  await settled();
  await page.waitForFunction(() => !!window.bimcraftRes.state.terrain, null, { timeout: 30000 });
  const T = await page.evaluate(() => { const t2 = window.bimcraftRes.state.terrain; return { n: t2.pts.length, off: t2.offset }; });
  ok(T.n === 49, 'the ground is built from the 49 reprojected points');
  ok(Math.abs(T.off[0] - 650035000) > 1e6, 'moved through proj4, not just shifted: the offset is not Lambert-93\'s own (' + Math.round(T.off[0] / 1000) + ' m east)');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'georef-error.png') }).catch(() => {});
}

try {
  console.log('== 1b  an IFC2X3 model: the standard\'s property sets');
  await start({ name: 'old.ifc', text: fixtureIfc().replace("FILE_SCHEMA(('IFC4'))", "FILE_SCHEMA(('IFC2X3'))") });
  await crsBtn();
  await pickSystem('UTM 33N');
  await page.waitForSelector('dialog[data-georef-origin][open]');
  ok(/ePSet_MapConversion/.test(await page.textContent('[data-geo-2x3]')), 'the dialog says how IFC2X3 is written (ePSet_MapConversion and ePSet_ProjectedCRS)');
  await page.fill('[data-geo-lat]', '48.2'); await page.fill('[data-geo-lon]', '16.37');
  await page.click('[data-geo-convert]');
  await page.click('[data-geo-apply]');
  await waitStatus(/written as property sets \(IFC2X3\)/);
  const t23 = await saveText();
  ok(/ePSet_MapConversion/.test(t23) && /ePSet_ProjectedCRS/.test(t23) && !/IFCMAPCONVERSION/.test(t23), 'the saved IFC2X3 file has the property sets and no IfcMapConversion');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'georef-error2.png') }).catch(() => {});
}
for (const f of ['paris-scan.xyz', 'paris-big.xyz', 'paris-survey.csv']) fs.rmSync(path.join(tmp, f), { force: true });
ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
await browser.close();
execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'down']);
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
