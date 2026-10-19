#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-extra2.mjs — BimCraft round-2 extras (0.6, session `bim-extra_PART_2`) in the lab, headless, real clicks.
 *   node tools/bimcraft-test/browser-extra2.mjs [--shots <dir>] [--only glb,assets,daylight]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimextra2), so the shared
 * admin-login throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase).
 *   glb       DC.22: For rendering → a .glb that the Khronos validator passes, with the painted materials' textures
 *   assets    LC.12: the Assets tab — track a picked element, its data, a maintenance entry, due list, CSV, save and reopen
 *   daylight  LC.20: the Daylight tab — every room's average daylight factor, the inputs, CSV
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimextra2'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusText = () => page.textContent('[data-status]');
async function openFile(file) {
  await page.setInputFiles('[data-file]', file);
  await waitStatus(/^Opened /, 90000);
}
const download = async (fn) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };
const tab = async (name) => { await page.click(`[data-rtab="${name}"]`); await page.waitForSelector(`[data-rpane="${name}"]:not([hidden])`); };

try {
  if (want('glb')) {
    console.log('== glb: Model for rendering (DC.22)');
    await fresh();
    await openFile(HOUSE);
    const { name, bytes } = await download(() => page.click('[data-glb-export]'));
    await waitStatus(/^Saved the \.glb: /);
    const st = await statusText();
    ok(name === 'bimcraft-house.glb' && /\d+ triangles, \d+ materials, 0 lamps/.test(st), 'For rendering downloads bimcraft-house.glb and says what it holds', name + ' | ' + st);
    const len = new DataView(bytes.buffer, bytes.byteOffset).getUint32(12, true);
    const J = JSON.parse(new TextDecoder().decode(bytes.subarray(20, 20 + len)));
    const textured = (J.materials || []).filter((m) => m.pbrMetallicRoughness?.baseColorTexture);
    ok(textured.length >= 1 && (J.images || []).length === textured.length, 'the house\'s painted library materials come with their textures (' + textured.length + ')', (J.materials || []).map((m) => m.name).join(' | '));
    ok(J.nodes.some((n) => / — /.test(n.name)) && J.nodes.every((n) => n.mesh !== undefined || n.extensions), 'nodes named "<storey> — <material>"', J.nodes.slice(0, 4).map((n) => n.name).join(' | '));
    const vdir = path.join(REPO, 'tools/modelcraft-test/node_modules/gltf-validator');
    if (fs.existsSync(vdir)) {
      const rep = await createRequire(import.meta.url)(vdir).validateBytes(new Uint8Array(bytes), { maxIssues: 30 });
      const issues = rep.issues.messages.filter((m) => m.severity <= 1);
      ok(rep.issues.numErrors === 0 && !issues.length, 'Khronos glTF validator: 0 errors, 0 warnings on the house', issues.map((m) => m.code + ' ' + m.pointer).join('; '));
    }
    await shot(page, '01-glb-house');
  }

  if (want('assets')) {
    console.log('== assets: the Assets tab (LC.12)');
    await fresh();
    await openFile(HOUSE);
    await tab('assets');
    ok(await page.isVisible('[data-as-empty]') && /No assets yet/.test(await page.textContent('[data-as-summary]')), 'the house has no equipment yet: the tab says how to track an element');
    // pick the first window and track it
    const win = await page.evaluate(() => {
      const v = document.querySelector('[data-canvas]').viewer, keys = window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWindow' }]);
      v.select([keys[0]]);
      return { id: keys[0], name: '#' + keys[0], n: keys.length };
    });
    await page.click('[data-as-track]');
    await page.waitForSelector('[data-as-detail]');
    ok(await page.$$eval('[data-as-row]', (r) => r.length) === 1 && /1 asset/.test(await page.textContent('[data-as-summary]')), 'Track picked: the window ' + win.name + ' is an asset, its form open');
    await page.fill('[data-as-field="maker"]', 'Northlight');
    await page.fill('[data-as-field="serial"]', 'NL-55-0192');
    await page.fill('[data-as-field="installed"]', '2025-05-20');
    await page.fill('[data-as-field="warrantyEnd"]', '2035-05-20');
    await page.fill('[data-as-field="life"]', '30');
    await page.click('[data-as-save]');
    await waitStatus(/^Asset data written into the model\./);
    ok(await page.inputValue('[data-as-field="serial"]') === 'NL-55-0192', 'Save the data: written, the form shows it read back');
    // a maintenance entry that makes it overdue
    await page.fill('[data-as-add-form] [data-as-e="date"]', '2025-11-03');
    await page.fill('[data-as-add-form] [data-as-e="next"]', '2026-05-03');
    await page.fill('[data-as-add-form] [data-as-e="work"]', 'Seals checked, hinges oiled');
    await page.fill('[data-as-add-form] [data-as-e="by"]', 'FM team');
    await page.fill('[data-as-add-form] [data-as-e="notes"]', 'Upper hinge stiff');
    await page.click('[data-as-add-form] [data-as-e-ok]');
    await waitStatus(/^Maintenance entry added\./);
    ok(await page.$$eval('[data-as-entry]', (l) => l.length) === 1 && /1 overdue/.test(await page.textContent('[data-as-summary]')) && await page.isVisible('[data-as-row] .as-overdue'), 'an entry with next due 3 May 2026: listed, the asset overdue');
    await shot(page, '02-assets');
    // a refusal says why and changes nothing
    await page.fill('[data-as-add-form] [data-as-e="date"]', '2026-01-10');
    await page.click('[data-as-add-form] [data-as-e-ok]');
    await waitStatus(/Say what work was done/);
    ok(await page.$$eval('[data-as-entry]', (l) => l.length) === 1, 'an entry with no work: refused, said why');
    // Undo / redo through the toolbar
    await page.click('[data-toolbar] [data-act="undo"]');
    await page.waitForFunction(() => !document.querySelector('[data-as-entry]'));
    ok(true, 'Undo: the entry goes');
    await page.click('[data-toolbar] [data-act="redo"]');
    await page.waitForSelector('[data-as-entry]');
    ok(true, 'Redo: it comes back');
    // due only, CSV
    await page.check('[data-as-due]');
    ok(await page.$$eval('[data-as-row]', (r) => r.length) === 1, 'Only overdue or due: the overdue window stays');
    const csv = await download(() => page.click('[data-as-csv]'));
    const text = csv.bytes.toString('utf8');
    ok(/ assets\.csv$/.test(csv.name) && /NL-55-0192/.test(text) && /Seals checked, hinges oiled/.test(text), 'CSV: the asset with its data and the entry', csv.name);
    // the IFC carries it
    const saved = await download(() => page.click('[data-save]'));
    const ifc = saved.bytes.toString('latin1');
    ok(/IFCTASK\(.*'Seals checked, hinges oiled'.*\.MAINTENANCE\.\)/.test(ifc) && /'SerialNumber',\$,IFCIDENTIFIER\('NL-55-0192'\)/.test(ifc) && /IFCRELASSIGNSTOPROCESS\(/.test(ifc), 'Save as IFC: the task, its relation and the serial number are in the file');
  }

  if (want('daylight')) {
    console.log('== daylight: the Daylight tab (LC.20)');
    await fresh();
    await page.evaluate(() => { try { localStorage.removeItem('bimcraft.daylight'); } catch { /* none */ } });
    await openFile(HOUSE);
    await tab('daylight');
    ok(await page.isVisible('[data-day-not]') && /not a check against a building code/.test(await page.textContent('[data-day-not]')), 'the tab says first what it is not (no simulation, no code check)');
    ok(await page.inputValue('[data-day-in="T"]') === '0.7' && await page.inputValue('[data-day-in="wall"]') === '0.5', 'the inputs shown with their starting values (T 0.7, walls 0.5)');
    await page.click('[data-day-run]');
    await waitStatus(/^Daylight worked out for \d+ rooms? \(\d+ windows\)\./, 120000);
    const st = await statusText();
    const rows = await page.$$eval('[data-day-row]', (r) => r.map((x) => ({ guid: x.dataset.dayRow, text: x.cells[2].textContent })));
    const adf = rows.map((r) => Number(/(\d+\.\d\d)/.exec(r.text)?.[1]));
    ok(rows.length === 5 && /5 rooms \(9 windows\)/.test(st), 'Calculate: the house\'s 5 rooms and its 9 windows', st);
    ok(adf.every((x) => Number.isFinite(x) && x >= 0 && x < 30) && adf.some((x) => x > 0), 'every room has a daylight factor (0–30 %)', adf.join(' '));
    await page.click(`[data-day-row="${rows[adf.indexOf(Math.max(...adf))].guid}"]`);
    await page.waitForSelector('[data-day-detail]');
    const wins = await page.$$eval('[data-day-window]', (l) => l.map((x) => x.textContent));
    ok(wins.length >= 1 && wins.every((w) => /sky angle θ \d+(\.\d)?°/.test(w)), 'a room\'s detail lists its windows with their sky angle', wins.join(' | '));
    await shot(page, '03-daylight');
    // the factor is in proportion to the glass's transmittance
    const before = Math.max(...adf);
    await page.fill('[data-day-in="T"]', '0.35');
    await page.press('[data-day-in="T"]', 'Tab');
    await page.waitForFunction((b) => [...document.querySelectorAll('[data-day-row]')].some((r) => Math.abs(Number(/(\d+\.\d\d)/.exec(r.cells[2].textContent)?.[1]) - b / 2) < 0.011), before);
    ok(true, 'transmittance 0.7 → 0.35: the factor halves (' + before.toFixed(2) + ' → ' + (before / 2).toFixed(2) + ')');
    ok(await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.daylight')).T) === 0.35, 'the inputs are kept in this browser');
    await page.fill('[data-day-in="T"]', '7');
    await page.press('[data-day-in="T"]', 'Tab');
    ok(await page.inputValue('[data-day-in="T"]') === '0.35', 'a transmittance of 7: refused, the box goes back to 0.35');
    const csv = await download(() => page.click('[data-day-csv]'));
    const text = csv.bytes.toString('utf8');
    ok(/ daylight\.csv$/.test(csv.name) && text.split('\r\n').filter((l) => l && !/^﻿?Room,|^Inputs/.test(l)).length === 5, 'CSV: one row per room and the inputs', csv.name);
  }
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (page) await shot(page, 'zz-error');
}
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimextra2']); } catch { /* the session expires anyway */ }
console.log(`\nbrowser-extra2: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
