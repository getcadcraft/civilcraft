#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-roomair-bim.mjs — the Room air add-on in /lab/bimcraft (0.11 SU.1812, su-finish-11 lane cfd), headless, on the showcase house.
 *   node tools/bimcraft-test/browser-roomair-bim.mjs [--shots dir] [--seconds 60]     (run as root; BimCraft's test admin, tools/frame/admin.php up|down)
 * The test places a supply diffuser, a return grille and a fan coil of BimCraft's own equipment in a room (with airflows in CadCraft_MepCalc, as the duct
 * calculation keeps them); the panel reads them from the model, runs, and shows the occupied-zone numbers, the air in and out and a coloured plane; the add-on
 * writes nothing into the model; the validation line says it waits on measured numbers until some are given. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(REPO, 'tmp/shots/roomair');
const SECONDS = args.includes('--seconds') ? Number(args[args.indexOf('--seconds') + 1]) : 60;
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text() + ' ' + (m.location().url || '')); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const ra = (k) => `[data-ra="${k}"]`;
try {
  const ck = SESSION.cookie.split('=');
  await ctx.addCookies([{ name: ck[0], value: ck.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cc-addons:bimcraft'); Object.keys(localStorage).filter((k) => k.startsWith('cc-addon:bimcraft:roomair')).forEach((k) => localStorage.removeItem(k)); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await page.waitForFunction(() => /^Opened bimcraft-house/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('roomair', true));
  await page.waitForFunction(() => window.ccAddons.list().find((x) => x.id === 'roomair')?.state === 'active', null, { timeout: 20000 });
  ok(true, 'the Room air add-on is switched on in /lab/bimcraft');

  // a rectangular room of the house, and BimCraft's own equipment placed in it (test setup, one undo step)
  const placed = await page.evaluate(async () => {
    const rooms = await window.ccRoomAir.host.rooms();
    const rect = rooms.filter((r) => r.poly.length === 4 && r.area > 8).sort((a, b) => a.area - b.area)[0];
    if (!rect) return { error: 'no rectangular room', rooms: rooms.map((r) => [r.name, r.poly.length, r.area]) };
    const names = performance.getEntriesByType('resource').map((r) => r.name);
    const eqUrl = names.find((n) => /\/mep\/equipment\.js/.test(n)) || (names.find((n) => /\/bimcraft\/dev\/bimcraft\.js/.test(n)) || '').replace(/bimcraft\.js.*$/, 'mep/equipment.js');   // the app's own module (relative imports carry no ?v)
    const E = await import(eqUrl);
    const xs = rect.poly.map((p) => p[0]), ys = rect.poly.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const H = rect.height || 2800, cy = (y0 + y1) / 2;
    const nest = (w, opFn) => { const r = opFn({ W: w.W, api: w.api, mid: w.mid }); if (r && r.journal) { for (const id of r.journal.created) if (!w.journal.created.includes(id)) w.journal.created.push(id); for (const [id, line] of r.journal.before) if (!w.journal.before.has(id) && !w.journal.created.includes(id)) w.journal.before.set(id, line); } w._guids = null; return r; };
    const api = window.ccRoomAir.api;
    await api.model.write('test: room air terminals', (w) => {
      const put = (spec, lps) => { const r = nest(w, E.placeEquipment({ storey: rect.storey, ...spec })); if (lps) w.upsertPset(r.id, 'CadCraft_MepCalc', [['AirflowLps', 'IFCREAL', lps]]); };
      put({ kind: 'diffuser', values: { face: 600, neck: 250, system: 'supply' }, x: x0 + (x1 - x0) * 0.3, y: cy, z: H, tag: 'SD-1' }, 70);
      put({ kind: 'grille', values: { faceW: 600, faceH: 600, neckW: 400, neckH: 400, system: 'return' }, x: x0 + (x1 - x0) * 0.75, y: cy, z: H, tag: 'RG-1' }, 70);
      put({ kind: 'fancoil', values: {}, x: x0 + (x1 - x0) * 0.5, y: y0 + 700, z: 1900, rot: 0, tag: 'FC-1' }, 50);
      return true;
    });
    return { name: rect.name, area: rect.area, height: H, storey: rect.storey };
  });
  ok(!placed.error, 'test setup: a supply diffuser, a return grille and a fan coil placed in ' + placed.name + ' (' + (placed.area || 0).toFixed(1) + ' m2, ceiling ' + placed.height + ' mm)', placed);
  const changesBefore = await page.$$eval('[data-change-list] li', (n) => n.length);

  await page.click('[data-rtab="addon-roomair-roomair"]');
  await page.waitForSelector('[data-ra-root]', { state: 'attached', timeout: 20000 });
  await page.click(ra('reread'));
  await page.waitForFunction(() => document.querySelectorAll('[data-ra="roompick"] option').length > 2, null, { timeout: 20000 });
  const idx = await page.$$eval('[data-ra="roompick"] option', (o, n) => o.findIndex((x) => x.textContent.startsWith(n + ' (')), placed.name);
  ok(idx > 0, 'the panel lists the model\'s rooms, ' + placed.name + ' among them');
  await page.selectOption(ra('roompick'), { index: idx });
  await page.waitForFunction(() => /terminals and fan coils read/.test(document.querySelector('[data-ra-message]')?.textContent || ''), null, { timeout: 20000 });
  const terms = (await page.inputValue(ra('terminals'))).split('\n');
  ok(terms.length === 3 && terms.some((l) => /^supply, .*, 70, 14, 90/.test(l)) && terms.some((l) => /^return, .*, 70, , ,/.test(l)) && terms.some((l) => /^fancoil, .*, 1000, 600, 50, 14, 90/.test(l)), 'picking the room reads its three terminals from the model, with their airflows', terms);
  ok(/14 °C and 90 %/.test(await page.textContent('[data-ra-message]')), 'and says the supply air was filled with defaults (not in the model)');
  ok(Number(await page.inputValue(ra('height'))) === placed.height, 'the ceiling height comes from the walls (' + placed.height + ' mm)');
  const person = await page.evaluate(() => { const c = window.ccRoomAir.specOf().poly, xs = c.map((p) => p[0]), ys = c.map((p) => p[1]); const x = Math.round((Math.min(...xs) + Math.max(...xs)) / 2), y = Math.round((Math.min(...ys) + Math.max(...ys)) / 2); return [x - 200, y - 200, 0, x + 200, y + 200, 1200, 120, 60].join(', '); });
  await page.fill(ra('sources'), person); await page.dispatchEvent(ra('sources'), 'change');
  await page.fill(ra('seconds'), String(SECONDS)); await page.dispatchEvent(ra('seconds'), 'change');
  const t0 = Date.now();
  await page.click(ra('run'));
  await page.waitForSelector('[data-ra-progress]', { timeout: 10000 });
  ok(true, 'Run shows its progress while it works');
  await page.screenshot({ path: path.join(SHOTS, 'bim-running.png') });
  await page.waitForSelector('[data-ra-result], [data-ra-error]', { timeout: 15 * 60000 });
  const secs = (Date.now() - t0) / 1000;
  ok(!(await page.$('[data-ra-error]')), 'the run ended without an error', await page.$('[data-ra-error]').then((e) => e && e.textContent()));
  const res = await page.evaluate(() => { const r = window.ccRoomAir.R.result; return r && { zone: r.zone, flows: r.flows, exhaust: r.exhaust, grid: r.grid, time: r.time, inlets: r.inlets.length, outlets: r.outlets.length, warnings: r.warnings.map((w) => w.key) }; });
  console.log('  ' + JSON.stringify({ browserSeconds: +secs.toFixed(1), cells: res.grid.cells, cell: res.grid.cell, simulated: +res.time.toFixed(1), zone: res.zone && { speed: +res.zone.speedMean.toFixed(3), Tmean: +res.zone.Tmean.toFixed(2), rh: +res.zone.rhMean.toFixed(1) }, flows: res.flows, warnings: res.warnings }));
  ok(res.inlets === 2 && res.outlets === 2, 'two supplies (the diffuser and the fan coil\'s outlet) and two ways out (the grille and the fan coil\'s intake)', res);
  ok(Math.abs(res.flows.supplyLps - 120) < 1e-6 && Math.abs(res.flows.inLps - 120) < 0.5, 'air in: ' + res.flows.inLps.toFixed(1) + ' L/s (70 + 50 typed in the model)');
  ok(res.zone && res.zone.speedMean > 0 && res.zone.Tmean < 24 && res.zone.Tmean > 14, 'occupied zone: ' + res.zone.speedMean.toFixed(3) + ' m/s mean, ' + res.zone.Tmean.toFixed(2) + ' °C mean, ' + res.zone.rhMean.toFixed(0) + ' % mean, after ' + res.time.toFixed(0) + ' s of air in ' + secs.toFixed(0) + ' s in the browser');
  const zt = await page.textContent('[data-ra-zone]');
  ok(/m\/s/.test(zt) && /°C/.test(zt) && /%/.test(zt), 'the panel shows air speed, temperature and humidity: ' + zt.replace(/\s+/g, ' ').slice(0, 160));
  ok(/L\/s/.test(await page.textContent('[data-ra-flows]')) && /120 W, 60 g\/h/.test(await page.textContent('[data-ra-row="heat"]')), 'and the air in and out, and the person typed in the middle of the room (120 W, 60 g/h)');
  ok(!res.warnings.includes('roomair.warn.nosource'), 'the person\'s box holds air cells (no warning)', res.warnings);
  const lit = await page.evaluate(() => { const c = document.querySelector('[data-ra-canvas]'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const set = new Set(); for (let i = 0; i < d.length; i += 4 * 7) set.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return { w: c.width, h: c.height, colours: set.size }; });
  ok(lit.w > 50 && lit.colours > 8, 'a plan at 1.1 m coloured by air speed (' + lit.w + ' x ' + lit.h + ' px, ' + lit.colours + ' colours)', lit);
  await page.screenshot({ path: path.join(SHOTS, 'bim-speed.png') });
  await (await page.$('[data-ra-result]')).screenshot({ path: path.join(SHOTS, 'bim-result-panel.png') });
  await page.selectOption(ra('q'), 'T'); await page.selectOption(ra('axis'), 'y');
  ok((await page.getAttribute('[data-ra-canvas]', 'data-ra-canvas')) === 'T:y' && /Section at y/.test(await page.textContent('[data-ra-view] figcaption')), 'switched to a section across y coloured by temperature');
  await page.screenshot({ path: path.join(SHOTS, 'bim-temp-section.png') });
  await page.selectOption(ra('q'), 'rh');
  ok((await page.getAttribute('[data-ra-canvas]', 'data-ra-canvas')) === 'rh:y', 'and by relative humidity');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.click(ra('csv'))]);
  const csv = fs.readFileSync(await dl.path(), 'utf8');
  ok(csv.split('\n').length > 20 && /Relative humidity/.test(csv.split('\n')[0]), 'CSV of the plane: ' + (csv.split('\n').length - 2) + ' rows');
  ok((await page.getAttribute('[data-ra-validation]', 'data-ra-validation')) === 'waits' && /waits on measured/.test(await page.textContent('[data-ra-validation]')), 'the result says it has not been compared with measured room air');
  ok((await page.$$('[data-ra-limits] li')).length === 4, 'and lists what the model leaves out');
  await page.evaluate(() => { const r = window.ccRoomAir.R.result, c = window.ccRoomAir.specOf().poly; const xs = c.map((p) => p[0]), ys = c.map((p) => p[1]); const x = (Math.min(...xs) + Math.max(...xs)) / 2, y = (Math.min(...ys) + Math.max(...ys)) / 2; window.ccRoomAir.setMeasured({ source: 'browser test: the result itself (not a measurement)', profiles: [{ along: 'z', at: { x, y }, quantity: 'speed', points: r.line({ along: 'z', x, y, q: 'speed' }) }] }); });
  ok((await page.getAttribute('[data-ra-validation]', 'data-ra-validation')) === 'compared', 'with profiles given (here the result itself), the comparison hook runs and names their source');
  const changesAfter = await page.$$eval('[data-change-list] li', (n) => n.length);
  ok(changesAfter === changesBefore, 'running wrote nothing into the model (change list ' + changesBefore + ' → ' + changesAfter + ')');
  await page.screenshot({ path: path.join(SHOTS, 'bim-result.png'), fullPage: false });
} catch (e) {
  fail++; console.log('  FAIL ' + (e.message || e).split('\n')[0]);
} finally {
  const real = problems.filter((p) => !/favicon|api\/v1\/hardware/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
