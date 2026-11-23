#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-road.mjs — 0.11 IL.10 road lighting (session `road-light-11`) in the real /lab pages. Run as root, alone, nice, with a timeout:
 *   nice -n 10 timeout 900 node lib/lightdesign/test/browser-road.mjs [--apps civilcraft,cadcraft] [--shots dir]
 * CivilCraft: a road (an alignment with an urban assembly) is put in the project; the lighting design add-on (bundled, off) is switched on; Road lighting is
 *   ticked; the road is listed and its assembly becomes the cross-section; luminaires both sides; C2 values from the cited table; Calculate; a pasted reflection
 *   table (a test table written here, not a road surface) gives luminance, Ul and TI with M3; failed criteria reach the shell's Problems; CSV; reload keeps the inputs.
 * CadCraft: the typed default section is calculated (any host can do a typed road).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, BASE } from '../../../tools/gpu-remote/browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/lightdesign-road'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + String(typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 300) : '')); } };

const browser = await launch({ webgl: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies(labCookie());
await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const ld = (k) => `[data-ld="${k}"]`;
const shotPanel = async (n) => { await page.locator('[data-ld-root]').screenshot({ path: path.join(SHOTS, n + '.png') }).catch(() => page.screenshot({ path: path.join(SHOTS, n + '.png') })); };
const closeDialogs = () => page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open].shell-fit')) { try { d.close(); } catch { /* */ } } for (const e of document.querySelectorAll('.nh-offer, .tour-toast')) { try { e.hidePopover(); } catch { /* */ } e.remove(); } });
const ink = (sel) => page.$eval(sel, (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const cols = new Set(); let dark = 0; for (let i = 0; i < d.length; i += 4) { cols.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5)); if (d[i] + d[i + 1] + d[i + 2] < 200) dark++; } return { colours: cols.size, dark }; });
const setNum = async (key, v) => { await page.fill(ld(key), String(v)); await page.dispatchEvent(ld(key), 'change'); };
async function enable(app) {
  await page.evaluate((a) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':lightdesign:')) localStorage.removeItem(k); }, app);
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'lightdesign' && a.state !== 'loading'), null, { timeout: 30000 });
  const me = await page.evaluate(() => { const a = window.ccAddons.list().find((x) => x.id === 'lightdesign'); return a && { state: a.state, source: a.source }; });
  if (me.state !== 'active') await page.evaluate(() => window.ccAddons.loader.setEnabled('lightdesign', true));   // only when it is not on yet (a second call starts a second copy)
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'lightdesign')?.state === 'active', null, { timeout: 20000 });
  for (let k = 0; k < 20 && !(await page.isVisible('[data-ld-root]').catch(() => false)); k++) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button, summary, [role=tab]')].find((x) => /^\s*Lighting design\s*$/.test(x.textContent || '') && x.offsetParent); if (b) b.click(); });
    await page.waitForTimeout(600);
  }
  await page.waitForSelector('[data-ld-root]', { state: 'visible', timeout: 20000 });
  return me;
}
// a test reflection table written here (r × 10 000, a gently shiny made-up surface), NOT a standard's table
const RT = ['beta\\tan, 0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, 12',
  '0, 700, 650, 560, 470, 400, 300, 230, 150, 100, 70, 50',
  '30, 700, 630, 520, 420, 340, 230, 160, 90, 55, 35, 25',
  '90, 700, 600, 460, 340, 250, 140, 85, 40, 20, 12, 8',
  '180, 700, 590, 440, 320, 230, 125, 75, 35, 17, 10, 6'].join('\n');

async function civil() {
  console.log('\ncivilcraft');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { const k = 'cc-addons:civilcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.lightdesign; localStorage.setItem(k, JSON.stringify(s)); } catch { /* */ } });
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  // a road: an alignment with the urban assembly CivilCraft's own preset makes (corridor.js presetParts 'urban', metres), as the assembly editor stores it
  await page.evaluate(() => {
    const p = window.civilcraft.project;
    p.change('units', (s) => { s.units = 'm'; });
    const side = () => [{ type: 'lane', w: 3.6, slope: 0.02 }, { type: 'lane', w: 3.6, slope: 0.02 }, { type: 'gutter', w: 0.6, slope: 0.08 }, { type: 'curb', h: 0.15, w: 0.15, drop: 0 }, { type: 'strip', w: 1.5, slope: -0.02 }, { type: 'walk', w: 1.8, slope: -0.02 }, { type: 'daylight', cut: 2, fill: 3 }];
    p.change('road', (s) => { s.alignments.push({ id: p.nextId('a'), name: 'High Street', start: 0, pis: [{ x: 0, y: 0 }, { x: 300, y: 0 }], pvis: [], corridor: { on: false, lane: 3.6, laneSlope: 0.02, shoulder: 1.2, shoulderSlope: 0.04, cut: 2, fill: 3, step: 5, parts: { L: side(), R: side() } } }); });
  });
  const me = await enable('civilcraft');
  ok(me && me.source === 'bundled' && me.state === 'off', 'lighting design is bundled in CivilCraft and starts off (people add it)', me);
  await closeDialogs();
  await page.check(ld('roadOn'));
  await page.waitForSelector('[data-ld-road]');
  await page.waitForFunction(() => document.querySelectorAll('[data-ld="roadpick"] option').length >= 2, null, { timeout: 20000 }).catch(() => {});
  const opts = await page.$$eval('[data-ld="roadpick"] option', (o) => o.map((x) => x.textContent));
  ok(opts.some((x) => /^High Street/.test(x)), 'Road lighting lists the project\'s road', opts);
  await page.selectOption(ld('roadpick'), String(opts.findIndex((x) => /^High Street/.test(x)) - 1));
  const sec = await page.inputValue(ld('rdSection'));
  ok(/^footway, 1\.8\nverge, 1\.5\nverge, 0\.15\nverge, 0\.6\ncarriageway, 14\.4, 4\nverge, 0\.6/.test(sec) && /footway, 1\.8$/.test(sec), 'its assembly is the cross-section: walk, strip, curb, gutter, 4 lanes, and the same the other side', sec);
  await page.selectOption(ld('rdType'), 'opposite');
  await setNum('rdSpacing', 32); await setNum('rdHeight', 10); await setNum('rdOverhang', 1); await setNum('rdTilt', 5);
  await page.selectOption(ld('rdSet'), 'c');
  await page.selectOption(ld('rdClass'), 'C2');
  ok(await page.inputValue(ld('rdE')) === '20' && await page.inputValue(ld('rdUoE')) === '0.4' && /Sørensen/.test(await page.textContent('[data-ld-road-source]')), 'C2 fills 20 lx and Uo 0.40, and names where the values come from');
  ok(await page.getAttribute('[data-ld-rtable]', 'data-ld-rtable') === 'none', 'no reflection table: the panel says luminance is not worked out');
  await closeDialogs();
  await page.click(ld('roadcalc'));
  await page.waitForSelector('[data-ld-road-result]', { timeout: 30000 });
  const r = await page.evaluate(() => { const x = window.ccLightDesign.road.state.result; const c = x.carriageways[0]; return { n: x.count, lanes: c.lanes, e: c.E.avg, uo: c.E.uo, lum: c.luminance, eir: c.eir, fw: x.footways.length, checks: x.checks.map((k) => k.key + ':' + k.ok) }; });
  ok(r.n === 2 && r.lanes === 4 && r.e > 1 && r.uo > 0 && r.lum === null && r.fw === 2, 'opposite: 2 luminaires a field; 4 lanes; ' + r.e.toFixed(1) + ' lx average, Uo ' + r.uo.toFixed(2) + '; two footways; no luminance', r);
  ok(r.checks.join() === 'E:' + (r.e >= 20) + ',uoE:' + (r.uo >= 0.4), 'C2 checked on the carriageway: ' + r.checks.join(', '));
  const pl = await ink('[data-ld-road-plan]');
  ok(pl.colours >= 6 && pl.dark > 50, 'the plan shows the field, the colours and the luminaires', pl);
  await shotPanel('civil-road-c2');
  // the reflection table and M3
  await page.fill(ld('rdRtable'), RT); await page.dispatchEvent(ld('rdRtable'), 'change');
  await page.waitForFunction(() => document.querySelector('[data-ld-rtable]')?.dataset.ldRtable === '4x11');
  ok(true, 'the pasted table is read: 4 β × 11 tan γ');
  await page.selectOption(ld('rdSet'), 'm'); await page.selectOption(ld('rdClass'), 'M3');
  ok(await page.inputValue(ld('rdL')) === '1' && await page.inputValue(ld('rdTi')) === '15' && await page.inputValue(ld('rdE')) === '0', 'M3 fills L 1.00, TI 15 and clears the illuminance values');
  await closeDialogs();
  await page.click(ld('roadcalc'));
  await page.waitForSelector('[data-ld-road-result]', { timeout: 30000 });
  const m = await page.evaluate(() => { const c = window.ccLightDesign.road.state.result.carriageways[0]; return { L: c.luminance && c.luminance.avg, obs: c.luminance && c.luminance.observers.length, ul: c.luminance && c.luminance.ul, ti: c.ti, lv: c.lv.max, checks: window.ccLightDesign.road.state.result.checks.map((k) => k.key + ':' + k.ok) }; });
  ok(m.L > 0 && m.obs === 4 && m.ul > 0 && m.ti > 0 && m.lv > 0, 'luminance from the table: L ' + (m.L || 0).toFixed(2) + ' cd/m² (4 observers), Ul ' + (m.ul || 0).toFixed(2) + ', TI ' + (m.ti || 0).toFixed(1) + ' %', m);
  ok(m.checks.length === 5 && m.checks.every((c) => /:(true|false)$/.test(c)), 'M3: L, Uo, Ul, TI and EIR checked: ' + m.checks.join(', '));
  const txt = await page.textContent('[data-ld-road-result]');
  ok(/Threshold increment/.test(txt) && /not a claim that the road meets a standard/.test(txt), 'the result names TI and says it is not a compliance claim');
  // Problems: one warning per criterion not met
  const nFail = m.checks.filter((c) => c.endsWith(':false')).length;
  const hasP = await page.evaluate(() => !!window.ccProblems);
  if (hasP) {
    await page.waitForFunction((n) => window.ccProblems.store.list().filter((p) => /^road\./.test(p.code)).length === n, nFail, { timeout: 8000 }).catch(() => {});
    const ps = await page.evaluate(() => window.ccProblems.store.list().filter((p) => /^road\./.test(p.code)).map((p) => [p.code, p.severity, p.text]));
    ok(ps.length === nFail && ps.every((p) => p[1] === 'warning' && /Carriageway 1/.test(p[2])), 'the Problems panel has ' + nFail + ' road warning(s), one per failed criterion', ps);
  } else ok(false, 'CivilCraft /lab has the Problems panel');
  await shotPanel('civil-road-m3');
  await page.locator('[data-ld-road-plan]').screenshot({ path: path.join(SHOTS, 'civil-road-plan.png') });
  await page.locator('[data-ld-road-result]').screenshot({ path: path.join(SHOTS, 'civil-road-result.png') });
  // CSV
  await closeDialogs();
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(ld('roadcsv'))]);
  const f = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(f);
  const csv = fs.readFileSync(f, 'utf8').replace(/^﻿/, '').trim().split('\n');
  ok(csv[0] === 'area,x_m,y_m,lux,cd_m2' && csv.length === 1 + 120 + 60 && /^carriageway 1,/.test(csv[1]) && csv[1].split(',')[4] !== '', 'CSV: 120 carriageway points with lux and cd/m², 60 footway points', csv.length + ' ' + csv[1]);
  // kept after a reload
  await page.reload({ waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await enable('civilcraft').catch(() => {});
  ok(await page.isChecked(ld('roadOn')).catch(() => false) && /carriageway, 14\.4, 4/.test(await page.inputValue(ld('rdSection')).catch(() => '')) && await page.inputValue(ld('rdType')).catch(() => '') === 'opposite', 'after a reload: Road lighting, the section and the arrangement are kept');
}

async function cad() {
  console.log('\ncadcraft');
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await enable('cadcraft');
  await closeDialogs();
  if (!(await page.isChecked(ld('roadOn')))) await page.check(ld('roadOn'));
  await page.waitForSelector('[data-ld-road]');
  ok(!(await page.$(ld('roadpick'))), 'CadCraft has no roads of its own: the typed section is used');
  await page.selectOption(ld('rdType'), 'staggered');
  await page.click(ld('roadcalc'));
  await page.waitForSelector('[data-ld-road-result]', { timeout: 30000 });
  const r = await page.evaluate(() => { const x = window.ccLightDesign.road.state.result; return { n: x.count, e: x.carriageways[0].E.avg, fw: x.footways.map((f) => f.E.avg) }; });
  ok(r.n === 2 && r.e > 0 && r.fw.length === 2, 'staggered on the typed 2 m + 7 m + 2 m street: ' + r.e.toFixed(1) + ' lx on the carriageway', r);
  await shotPanel('cad-road-staggered');
}

try {
  const which = opt('--apps', 'civilcraft,cadcraft').split(',');
  if (which.includes('civilcraft')) await civil();
  if (which.includes('cadcraft')) await cad();
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); await page.screenshot({ path: path.join(SHOTS, 'road-error.png') }).catch(() => {}); }
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
