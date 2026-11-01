#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-chem-draw4-plant.mjs — chem-draw_PART_4 in BimCraft's Plant tab on the real page (0.8 round 4): the new calculators, the process layout placed with its pipes (CH.29),
 * the batch recipe in the 4D panel (CH.6) and live values tinting the equipment (XE.9). Run as root, one app, with a timeout:
 *   nice timeout 300 node tools/addons-test/browser-chem-draw4-plant.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/plant'));
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

try {
  await page.goto(BASE + '/lab/bimcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:bimcraft:plant:')) localStorage.removeItem(k); const k = 'cc-addons:bimcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.plant; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/bimcraft', { waitUntil: 'load' });
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.loader && window.ccAddons.loader.started, null, { timeout: 60000 });
  const nlist = () => page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'plant'));
  await page.setInputFiles('[data-file]', { name: 'fixture.ifc', mimeType: 'application/octet-stream', buffer: Buffer.from(fixtureIfc()) });
  await page.waitForFunction(() => !!window.bimcraftLive?.editor, null, { timeout: 60000 });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('plant', true));
  await page.waitForTimeout(500);
  ok((await nlist())?.state === 'active', 'Plant is on');
  const tab = '[data-rtab="addon-plant-plant"]', pane = '[data-rpane="addon-plant-plant"]';
  await page.waitForSelector(tab, { timeout: 10000 }); await page.click(tab);
  await page.waitForSelector(pane + ' form.plant-form', { timeout: 10000 });
  // the process model with a layout, made by the engine in the page and loaded through the file input
  const modelJson = await page.evaluate(async () => {
    const S = await import('/assets/apps/bimcraft/dev/process/synth.js'), PM = await import('/assets/apps/bimcraft/dev/process/model.js');
    const b = S.build({ name: 'Browser plant', components: ['water'], model: 'ideal', feed: { flows: { water: 30 }, T: 300, P: 3e5 }, steps: [{ type: 'pump', id: 'P-101', p: { Pout: 6e5 } }, { type: 'flash', id: 'V-101', p: { T: 330, P: 5e5 } }] });
    return PM.toJSON(b.model);
  });
  await page.setInputFiles(pane + ' [data-plant-process-file]', { name: 'plant.process.json', mimeType: 'application/json', buffer: Buffer.from(modelJson) });
  await page.waitForTimeout(500);
  // calculators of round 4 are in the engineering section
  await page.click(pane + ' [data-plant-eng] summary').catch(() => {});
  const opts = await page.$$eval(pane + ' [data-plant-eng] [data-calc-pick] option', (o) => o.map((x) => x.value));
  ok(['bell', 'vessel2', 'pumptrip', 'pipestress2', 'relief2', 'blast', 'heavygas', 'packs'].every((id) => opts.includes(id)), 'the Plant calculators list the round-4 engines', opts.join());
  await page.selectOption(pane + ' [data-plant-eng] [data-calc-pick]', 'pumptrip'); await page.click(pane + ' [data-plant-eng] [data-calc="calc.run"]'); await page.waitForTimeout(800);
  ok(/steadyH_m/.test(await page.textContent(pane + ' [data-plant-eng] [data-calc-out]')), 'the pump trip runs in the Plant tab');
  await page.selectOption(pane + ' [data-plant-eng] [data-calc-pick]', 'vessel2'); await page.click(pane + ' [data-plant-eng] [data-calc="calc.run"]'); await page.waitForTimeout(600);
  await page.click(pane + ' [data-plant-eng] [data-calc="calc.act.body"]');
  await page.waitForSelector(pane + ' table.plant-table', { timeout: 10000 });
  ok(/Vessel from the body calculator/.test(await page.textContent(pane + ' table.plant-table')), 'Add the vessel body: a vessel-profile row in the equipment table');
  const tanks0 = await page.evaluate(() => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid); let n = 0; for (const id of f.ids()) if (f.type(id) === 'IFCTANK') n++; return n; });
  await page.click(pane + ' table.plant-table tbody tr:last-child button[data-plant-place]');
  await page.waitForFunction((n0) => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid); let n = 0; for (const id of f.ids()) if (f.type(id) === 'IFCTANK') n++; return n > n0; }, tanks0, { timeout: 20000 });
  ok(true, 'the revolved vessel is placed in the model as an IfcTank');
  // place the plant and its pipes
  await page.selectOption(pane + ' select[name="p4system"]', 'chw');
  await page.click(pane + ' [data-plant-place-layout]');
  await page.waitForFunction(() => /Placed \d+ equipment/.test(document.querySelector('[data-plant-p4-out]')?.textContent || ''), null, { timeout: 30000 });
  const msg = await page.textContent(pane + ' [data-plant-p4-out]');
  const classes = await page.evaluate(() => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid), n = {}; for (const id of f.ids()) { const t = f.type(id); n[t] = (n[t] || 0) + 1; } return n; });
  ok((classes.IFCPUMP || 0) === 1, 'the layout puts the pump in the model', msg);
  ok(/drew \d+ pipe runs/.test(msg), 'and says how many pipes it drew and what it left out'); console.log('       ' + msg);
  // the batch recipe in the 4D panel
  await page.click(pane + ' [data-plant-batch]');
  await page.waitForFunction(() => !!window.bimcraftFourD?.tasks?.() , null, { timeout: 10000 }).catch(() => {});
  const tasks = await page.evaluate(() => (window.bimcraftFourD.tasks() || []).length);
  ok(tasks >= 6, 'the batch recipe becomes tasks in the 4D panel', String(tasks) + ' ' + (await page.textContent(pane + ' [data-plant-p4-out]')).slice(0, 120));
  // live values tint the pump
  await page.fill(pane + ' [data-plant-live-csv]', 'tag,time,value,quality\nP-101,' + new Date().toISOString() + ',3.2,Good\nZ-9,' + new Date().toISOString() + ',1,Good');
  await page.click(pane + ' [data-plant-live]');
  await page.waitForFunction(() => /values read/.test(document.querySelector('[data-plant-p4-out]')?.textContent || ''), null, { timeout: 10000 });
  const lv = await page.textContent(pane + ' [data-plant-p4-out]');
  ok(/1 values read, [1-9]\d* elements tinted/.test(lv), 'a reading tints the element with that tag', lv.slice(0, 160));
  await page.click(pane + ' [data-plant-live-clear]');
  await shot('draw4-plant-01');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err?.stack || err));
} finally {
  await browser.close();
  try { admin('down'); } catch { /* fine */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
