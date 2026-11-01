#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-chem-draw4.mjs — chem-draw_PART_4 on the real page: the P&ID add-on in /lab/cadcraft (0.8 round 4). Run as root; one app, headless, with a timeout:
 *   nice timeout 300 node tools/addons-test/browser-chem-draw4.mjs [--shots dir]
 * Opens the showcase plant, adds a process model, draws the PFD, the HEN grid, a HAZOP node, live labels, a tube sheet and a plume with the real commands, runs three of the
 * new calculators from the panel, works a loop faceplate, checks the HAZOP files and that nothing logged a console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/chem-draw4');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session'); const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const typeCmd = async (s, wait = 150) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const typeAll = async (...lines) => { for (const l of lines) await typeCmd(l); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const onLayer = (layer) => page.evaluate((l) => window.cadcraft.doc.all().filter((e) => e.layer === l).length, layer);
const shot = (n) => page.screenshot({ path: path.join(SHOTS, n + '.png') });
try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:pid:')) localStorage.removeItem(k); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'pid' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  await page.evaluate(() => window.ccAddons.loader.setEnabled('pid', true));
  await page.waitForTimeout(600);
  ok((await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'pid')))?.state === 'active', 'the P&ID add-on is on');
  await page.setInputFiles('[data-file]', path.join(ROOT, 'fixtures/showcase/cadcraft-pid-plant.dwg'));
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'cadcraft-pid-plant.dwg' && window.cadcraft.doc.model.size > 0, null, { timeout: 60000 });
  await page.waitForTimeout(400);
  const btns = await page.$$eval('[data-addon-section="pid:pid"] [data-pid-cmd]', (b) => b.map((x) => x.getAttribute('data-pid-cmd')));
  ok(['PIDPFD', 'PIDHEN', 'PIDNODE', 'PIDLIVE', 'PIDTUBESHEET', 'PIDPLUME'].every((c) => btns.includes(c)), 'the panel has the six new buttons', btns.join());

  // a process model in the drawing, then the PFD
  await page.evaluate(async () => {
    const PM = await import('/assets/apps/cadcraft/dev/process/model.js');
    const flow = { v: 1, thermo: { components: ['water'], model: 'ideal' }, feeds: { S1: { flows: { water: 30 }, T: 300, P: 3e5 } }, units: [{ id: 'P-101', type: 'pump', in: ['S1'], out: ['S2'], p: { Pout: 6e5 } }, { id: 'E-101', type: 'heater', in: ['S2'], out: ['S3'], p: { Tout: 350 } }] };
    window.ccProcessHost.setModel(PM.newModel('Browser plant', flow));
  });
  await typeAll('PIDPFD', '0,-400');
  ok((await history()).some((l) => /Process flow diagram of 2 units/.test(l)) && await onLayer('PFD-UNIT') === 2, 'PIDPFD draws the flow diagram of the model', (await history()).slice(-2).join(' | '));
  await typeAll('PIDHEN', '10', '[{"Ts":20,"Tt":135,"CP":2},{"Ts":170,"Tt":60,"CP":3},{"Ts":80,"Tt":140,"CP":4},{"Ts":150,"Tt":30,"CP":1.5}]', '0,-800');
  ok(await onLayer('HEN-MATCH') >= 8 && await onLayer('HEN-PINCH') === 2, 'PIDHEN draws the grid');
  const tag = await page.evaluate(() => { const d = window.cadcraft.doc; for (const e of d.all()) { const i = window.ccAddons.kinds.info(e); if (i?.kind === 'pidsym' && i.data.tag) return i.data.tag; } return ''; });
  await typeAll('PIDNODE', '0,0', '3000,1500', 'Browser node', 'test');
  ok((await history()).some((l) => /Node N\d Browser node/.test(l)) && await onLayer('HAZOP-NODE') === 2, 'PIDNODE draws and saves a node');
  const iso = new Date().toISOString();
  await typeAll('PIDLIVE', `tag,time,value,quality\\n${tag},${iso},42,Good`);
  ok(await onLayer('LIVE-OK') === 1, 'PIDLIVE puts a reading beside ' + tag, (await history()).slice(-2).join(' | '));
  await typeAll('PIDTUBESHEET', 'E-1', '0,-1500');
  ok(await onLayer('HX-SHELL') === 1, 'PIDTUBESHEET draws a shell');
  await typeAll('PIDPLUME', '270', '0,-2500');
  ok(await onLayer('AIR-STACK') === 1, 'PIDPLUME draws the stack');
  await page.evaluate(() => window.cadcraft.host.zoomExtents()); await page.waitForTimeout(400); await shot('draw4-01');

  // the calculators and the loop panel
  const sec = '[data-addon-section="pid:pid-calc"]';
  const sel = await page.$('[data-calc-pick]');
  ok(!!sel, 'the calculators panel is there');
  for (const id of ['column2', 'wdesign', 'relief2']) {
    await page.selectOption('[data-calc-pick]', id); await page.click('[data-calc="calc.run"]'); await page.waitForTimeout(700);
    const out = await page.textContent('[data-calc-out]');
    ok(out && out.length > 40 && !/This host does not carry/.test(out), 'calculator ' + id + ' runs in the page', (out || '').slice(0, 100));
  }
  void sec;
  const hasTotals = await page.evaluate(() => !!window.ccTotals);
  await page.selectOption('[data-calc-pick]', 'emissions'); await page.click('[data-calc="calc.run"]'); await page.waitForTimeout(800);
  if (hasTotals) {
    const snap = await page.evaluate(() => JSON.stringify(window.ccTotals.snapshot()));
    ok(/carbon/.test(snap) && /Process emissions/.test(snap), 'the emissions run feeds the status-bar totals (EG.30)', snap.slice(0, 200));
  } else console.log('       (this build has no running totals: CH.21 hookup is tested in Node only)');
  const lp = await page.$('[data-loops-table]');
  ok(!!lp, 'the loops panel is mounted');
  const rows = await page.$$('[data-loop-row]');
  ok(rows.length >= 1, 'the loop screen lists a controller of the drawing', String(rows.length));
  if (rows.length) {
    const r0 = '[data-loop-row] ';
    await page.fill(r0 + '[data-bind="pv"]', 'T1.h'); await page.fill(r0 + '[data-bind="mv"]', 'valve.V1'); await page.fill(r0 + '[data-bind="sp"]', '2'); await page.fill(r0 + '[data-bind="Kc"]', '1'); await page.fill(r0 + '[data-bind="Ti"]', '60');
    await page.selectOption(r0 + '[data-bind="action"]', 'direct');
    await page.fill('[data-loops-spec]', JSON.stringify({ tanks: [{ id: 'T1', A: 2, h0: 2.5, rho: 1000 }], sources: [{ id: 'S1', to: 'T1', F: 0.004 }], valves: [{ id: 'V1', from: 'T1', to: null, k: 0.003, open: 0.5 }], tEnd: 600 }));
    await page.click('[data-loops-run]'); await page.waitForTimeout(1500);
    const fpOk = await page.$('[data-faceplate]') !== null; ok(fpOk, 'Run the loops gives a faceplate', fpOk ? '' : (await page.evaluate(() => document.querySelector('[data-loops-run]').parentElement.textContent)).slice(0, 400));
    if (!fpOk) throw new Error('no faceplate');
    await page.click('[data-faceplate-mode]'); await page.waitForTimeout(1500);
    ok(/MAN/.test(await page.textContent('[data-faceplate]')), 'To manual puts the faceplate in MAN');
  }
  const files = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.label));
  ok(['HAZOP worksheet (XLSX)', 'HAZOP worksheet (PDF)'].every((l) => files.includes(l)), 'EXPORT lists the HAZOP worksheet as XLSX and PDF', files.join(' | '));
  const pi = files.findIndex((l) => /\(PDF\)/.test(l));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), typeAll('EXPORT', String(pi + 1))]);
  const pf = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(pf);
  ok(fs.readFileSync(pf).subarray(0, 5).toString() === '%PDF-', 'the HAZOP PDF downloads and is a PDF');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (e) { fail++; console.log('  FAIL ' + (e && e.stack || e)); }
finally { await browser.close(); try { admin('down'); } catch { /* ignore */ } }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
