#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-chem-mount5-plant.mjs — chem-mount_PART_5 in BimCraft's Plant tab on the real page (0.8 round 5): Connect to a device with the tag map (XE.9, a device added, the map checked, readings tint
 * the equipment by Tag) and Optimise overnight (CH.31) with the variants solved by a second computer. The second computer is the same page: a stand-in for Studio's render-nodes bridge
 * hands the node's transport to the page's own lan-node.js, so the whole protocol runs in the page. Run as root, one app, with a timeout:
 *   nice timeout 300 node tools/addons-test/browser-chem-mount5-plant.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/chem-mount5'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString().trim().split('\n').pop());
const { fixtureIfc } = await import(pathToFileURL(path.join(ROOT, 'tools/bimcraft-test/ifc-fixture.mjs')).href);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };


const BRIDGE = () => {
  const pair = () => { const mk = () => ({ onmessage: null, onclose: null, closed: false, peer: null, send(b) { if (this.closed) return; const c = Uint8Array.from(b), p = this.peer; setTimeout(() => { if (!p.closed) p.onmessage?.(c); }, 0); }, close() { if (this.closed) return; this.closed = true; const p = this.peer; setTimeout(() => { this.onclose?.(); if (!p.closed) { p.closed = true; p.onclose?.(); } }, 0); } }); const a = mk(), b = mk(); a.peer = b; b.peer = a; return [a, b]; };
  let conn = null; const nodes = [{ tag: 'loopback', name: 'Loopback computer', host: '127.0.0.1', port: 1 }];
  window.cadcraftDesktop = { renderNodes: { advertise: async () => {}, stopAdvertising() {}, onConnection(cb) { conn = cb; }, onNodes(cb) { setTimeout(() => cb(nodes), 0); }, browse: async () => nodes,
    connect: async () => { const [a, b] = pair(); setTimeout(() => conn && conn(b), 0); return a; } } };
};
await page.addInitScript(BRIDGE);
try {
  await page.goto(BASE + '/lab/bimcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:bimcraft:plant:')) localStorage.removeItem(k); const k = 'cc-addons:bimcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.plant; localStorage.setItem(k, JSON.stringify(s)); localStorage.removeItem('cc-compute.node'); });
  await page.goto(BASE + '/lab/bimcraft', { waitUntil: 'load' });
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.loader && window.ccAddons.loader.started, null, { timeout: 60000 });
  await page.setInputFiles('[data-file]', { name: 'fixture.ifc', mimeType: 'application/octet-stream', buffer: Buffer.from(fixtureIfc()) });
  await page.waitForFunction(() => !!window.bimcraftLive?.editor, null, { timeout: 60000 });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('plant', true));
  await page.waitForTimeout(500);
  const tab = '[data-rtab="addon-plant-plant"]', pane = '[data-rpane="addon-plant-plant"]';
  await page.waitForSelector(tab, { timeout: 10000 }); await page.click(tab);
  await page.waitForSelector(pane + ' form.plant-form', { timeout: 10000 });
  const modelJson = await page.evaluate(async () => {
    const S = await import('/assets/apps/bimcraft/dev/process/synth.js'), PM = await import('/assets/apps/bimcraft/dev/process/model.js');
    const b = S.build({ name: 'Browser plant', components: ['water'], model: 'ideal', feed: { flows: { water: 30 }, T: 300, P: 3e5 }, steps: [{ type: 'pump', id: 'P-101', p: { Pout: 6e5 } }, { type: 'flash', id: 'V-101', p: { T: 330, P: 5e5 } }] });
    return PM.toJSON(b.model);
  });
  await page.setInputFiles(pane + ' [data-plant-process-file]', { name: 'plant.process.json', mimeType: 'application/json', buffer: Buffer.from(modelJson) });
  await page.waitForTimeout(500);

  // ---- XE.9: Connect to a device
  ok(await page.$(pane + ' [data-plant-connect]') !== null, 'the Plant tab has a Connect to a device section');
  await page.click(pane + ' [data-plant-connect] summary');
  await page.waitForSelector(pane + ' [data-plant-connect] [data-live-add]', { timeout: 10000 });
  await page.fill(pane + ' [data-live-id]', 'plc1'); await page.fill(pane + ' [data-live-host]', '192.168.1.10'); await page.fill(pane + ' [data-live-port]', '502');
  await page.click(pane + ' [data-live-add]'); await page.waitForTimeout(150);
  ok(/Device plc1 added/.test(await page.textContent(pane + ' [data-live-out]')) && await page.$(pane + ' [data-live-device="plc1"]') !== null, 'a Modbus device on a private address is added');
  await page.fill(pane + ' [data-live-id]', 'out'); await page.fill(pane + ' [data-live-host]', '8.8.8.8'); await page.selectOption(pane + ' [data-live-protocol]', 'mqtt');
  await page.click(pane + ' [data-live-add]'); await page.waitForTimeout(150);
  ok(await page.$(pane + ' [data-live-device="out"]') === null, 'a public address without the person\'s yes is not added');
  await page.fill(pane + ' [data-live-csv]', 'id,device,address,label,unit,scale,offset,low,high,deadband,staleS,type,target\nP-101,plc1,40001,Pump flow,m3/h,0.1,0,,50,,60,s16,P-101\n');
  await page.click(pane + ' [data-live-act="live.act.check"]'); await page.waitForTimeout(200);
  ok(/1 tags on 1 devices checked/.test(await page.textContent(pane + ' [data-live-out]')), 'Check the map counts the tags and devices', (await page.textContent(pane + ' [data-live-out]')).slice(0, 120));
  // the equipment table needs P-101: place the layout first
  await page.click(pane + ' [data-plant-place-layout]').catch(() => {});
  await page.waitForFunction(() => /Placed \d+ equipment/.test(document.querySelector('[data-plant-p4-out]')?.textContent || ''), null, { timeout: 30000 }).catch(() => {});
  await page.fill(pane + ' [data-live-readings]', 'tag,time,value,quality\nP-101,' + new Date().toISOString() + ',32,Good');
  await page.click(pane + ' [data-live-act="live.act.read"]'); await page.waitForTimeout(400);
  ok(/1 readings placed/.test(await page.textContent(pane + ' [data-live-out]')) && /Pump flow: /.test(await page.textContent(pane + ' [data-live-values]')), 'readings from a CSV are placed on the tag', (await page.textContent(pane + ' [data-live-out]')).slice(0, 160));
  ok(await page.evaluate(() => typeof window.bimcraftTint?.tint === 'function'), 'the tint hook the readings go through is there');
  await page.click(pane + ' [data-live-act="live.act.device"]'); await page.waitForTimeout(300);
  ok(/needs CadCraft Studio/.test(await page.textContent(pane + ' [data-live-out]')), 'reading the devices says it needs Studio when there is no device bridge');


  // ---- CH.10: the fitting-loss picker in the Plant engineering section
  await page.click(pane + ' [data-plant-eng] summary').catch(() => {});
  await page.selectOption(pane + ' [data-plant-eng] [data-calc-pick]', 'fittingk');
  await page.waitForSelector(pane + ' [data-plant-eng] [data-calc-option]:not([hidden])', { timeout: 10000 });
  ok((await page.$$eval(pane + ' [data-plant-eng] [data-calc-option] option', (o) => o.length)) === 67, 'the Plant tab lists the 66 fittings');
  await page.selectOption(pane + ' [data-plant-eng] [data-calc-option]', { label: '[3K] Gate valve, standard, β = 1' }); await page.waitForTimeout(1200);
  const fo = await page.textContent(pane + ' [data-plant-eng] [data-calc-out]');
  ok(/0\.1352/.test(fo) && /draft/i.test(fo) && /not yet checked against the original papers/.test(fo), 'a 3-K gate valve gives K 0.1352 and the draft label', fo.slice(0, 140));

  for (const [id, re, what] of [['compressor', /outletTemperature_K455\.9/, 'the compressor calculator'], ['npsh', /margin_m8\.61/, 'the pump and NPSH calculator'], ['network', /links\.pi\.Kfit2\.1/, 'the network calculator with fitting lists']]) {
    await page.selectOption(pane + ' [data-plant-eng] [data-calc-pick]', id); await page.click(pane + ' [data-plant-eng] [data-calc="calc.run"]'); await page.waitForTimeout(1000);
    ok(re.test(await page.textContent(pane + ' [data-plant-eng] [data-calc-out]')), 'the Plant tab runs ' + what);
  }

  // ---- CH.31: Optimise overnight, the variants solved by a second computer
  ok(await page.$(pane + ' [data-plant-optimise]') !== null, 'the Plant tab has an Optimise overnight section');
  await page.click(pane + ' [data-plant-optimise] summary');
  const spec = { title: 'Flash temperature', variables: [{ unit: 'V-101', param: 'T', from: 320, to: 340, steps: 3 }], objectives: [{ key: 'energy', metric: 'energy_kW', goal: 'min' }] };
  await page.fill(pane + ' [data-opt-spec]', JSON.stringify(spec));
  ok(/No other computer is connected/.test(await page.textContent(pane + ' [data-opt-nodes]')), 'before any connection the panel says every variant is solved here');
  await page.click(pane + ' [data-opt-run]');
  await page.waitForSelector(pane + ' [data-opt-out][data-opt-done]', { timeout: 30000 });
  ok(/3 variants: 0 solved on other computers, 3 here, 0 could not/.test(await page.textContent(pane + ' [data-opt-out]')), 'a study with no other computer is solved here', (await page.textContent(pane + ' [data-opt-out]')).slice(0, 200));
  // Settings: this computer serves, then connects to the loopback node
  const lanBox = '[data-compute-lan]';
  ok(await page.$(lanBox + ' input[name="ccLanServe"]') !== null, 'inside Studio\'s shell the Settings have the other-computers section');
  await page.evaluate((sel) => { const c = document.querySelector(sel + ' input[name="ccLanServe"]'); c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }, lanBox);
  await page.waitForFunction((sel) => /[A-Z0-9]{2}-[A-Z0-9]{5}/.test(document.querySelector(sel + ' .cc-lan-code strong')?.textContent || ''), lanBox, { timeout: 10000 });
  const code = await page.textContent(lanBox + ' .cc-lan-code strong');
  await page.waitForSelector(lanBox + ' .cc-lan-list button', { state: 'attached', timeout: 10000 });
  await page.evaluate((sel) => document.querySelector(sel + ' .cc-lan-list button').click(), lanBox);
  await page.waitForSelector(lanBox + ' .cc-lan-ask input', { state: 'attached', timeout: 5000 });
  await page.evaluate(([sel, v]) => { const i = document.querySelector(sel + ' .cc-lan-ask input'); i.value = v; }, [lanBox, code]);
  await page.evaluate((sel) => document.querySelector(sel + ' .cc-lan-ask button').click(), lanBox);
  await page.waitForFunction(() => (window.bimcraftLan?.taskNodes('process-variant') || []).length === 1, null, { timeout: 15000 });
  ok(true, 'the second computer connects with its code and lists the process-variant job');
  await page.click(pane + ' [data-opt-run]');
  await page.waitForFunction(() => /3 variants: 3 solved on other computers/.test(document.querySelector('[data-opt-out]')?.textContent || ''), null, { timeout: 30000 });
  ok(true, 'the same study now has all 3 variants solved by the other computer', (await page.textContent(pane + ' [data-opt-out]')).slice(0, 200));
  ok(/1 other computers can solve/.test(await page.textContent(pane + ' [data-opt-nodes]')), 'the panel counts the connected computer');
  await shot('mount5-plant');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err?.stack || err)); console.log(problems.slice(0, 6).join('\n')); await shot('fail').catch(() => {});
} finally {
  await browser.close();
  try { admin('down'); } catch { /* fine */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
