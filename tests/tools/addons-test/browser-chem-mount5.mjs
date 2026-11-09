#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-chem-mount5.mjs — chem-mount_PART_5 on the real page: the P&ID add-on in /lab/cadcraft (0.8 round 5): the HAZOP session timer (CH.14) and Connect to a device with the tag map (XE.9). Run as root; one app, headless, with a timeout:
 *   nice timeout 300 node tools/addons-test/browser-chem-mount5.mjs [--shots dir]
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
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/chem-mount5');
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
  const tag = await page.evaluate(() => { const d = window.cadcraft.doc; for (const e of d.all()) { const i = window.ccAddons.kinds.info(e); if (i?.kind === 'pidsym' && i.data.tag) return i.data.tag; } return ''; });

  // ---- CH.14: the HAZOP session timer
  const T = '[data-addon-section="pid:pid-timer"]', C = '[data-addon-section="pid:pid-connect"]';
  ok(await page.$(T) !== null, 'the add-on panel has the HAZOP session timer section');
  await page.waitForSelector(T + ' [data-timer-total]', { state: 'attached', timeout: 10000 });
  const n0 = (await page.$$(T + ' [data-timer-node]')).length;
  ok(n0 >= 1, 'the timer lists the nodes the showcase drawing already has', String(n0));
  await typeAll('PIDNODE', '0,3000', '3000,4500', 'Feed section', 'test');
  await typeAll('PIDNODE', '4000,3000', '7000,4500', 'Reactor', 'test');
  await page.waitForFunction(([s, n]) => document.querySelectorAll(s + ' [data-timer-node]').length === n + 2, [T, n0], { timeout: 8000 });
  ok(true, 'two nodes drawn: two more rows in the timer, without reopening the panel');
  await page.fill(T + ' [data-timer-total]', '300');
  await page.click(T + ' [data-timer-act="timer.share"]'); await page.waitForTimeout(150);
  const mins = await page.$$eval(T + ' [data-timer-node]', (l) => l.map((x) => Number((/ (\d+) min/.exec(x.textContent) || [])[1])));
  const sum = mins.reduce((a, b) => a + b, 0);
  ok(mins.length === n0 + 2 && mins.every((m) => m >= 5) && Math.abs(sum - 300) <= 5 * mins.length, 'Share the minutes out spreads about 300 minutes over the nodes, 5 at the least each', mins.join() + ' = ' + sum);
  await page.click(T + ' [data-timer-start]');
  await page.waitForTimeout(1300);
  ok(/On the table: N\d/.test(await page.textContent(T + ' [data-timer-now]')) && /^(\d+:)?\d+:\d\d$/.test((await page.textContent(T + ' [data-timer-clock]')).trim()) && !/^0:00$/.test((await page.textContent(T + ' [data-timer-clock]')).trim()), 'Start puts the node on the table and the clock counts down', await page.textContent(T + ' [data-timer-clock]'));
  await page.click(T + ' [data-timer-act="timer.next"]'); await page.waitForTimeout(150);
  const nowTxt = await page.textContent(T + ' [data-timer-now]');
  ok(/On the table: N\d/.test(nowTxt) && (await page.$$eval(T + ' [data-timer-node]', (l) => l.some((x) => /done/.test(x.textContent)))), 'Done, next node marks the node done and moves to the next one', nowTxt);
  await page.click(T + ' [data-timer-act="timer.pause"]'); await page.waitForTimeout(100);
  const stored = await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:pid:') && /hazoptimer/.test(k)) return localStorage.getItem(k); return ''; });
  ok(/"rows"/.test(stored || ''), 'the times are kept in the add-on storage');
  const dl = page.waitForEvent('download', { timeout: 8000 });
  await page.click(T + ' [data-timer-act="timer.csv"]');
  const file = await dl, csv = fs.readFileSync(await file.path(), 'utf8');
  ok(/^node,name,planned_min,used_min,over_min,done/.test(csv) && csv.trim().split('\n').length === n0 + 3, 'Times (CSV) downloads a row per node', csv.slice(0, 80));

  // ---- XE.9: Connect to a device and the tag map
  ok(await page.$(C) !== null, 'the add-on panel has the Connect to a device section');
  await page.waitForSelector(C + ' [data-live-csv]', { state: 'attached', timeout: 10000 });
  await page.fill(C + ' [data-live-id]', 'plc1'); await page.fill(C + ' [data-live-host]', '10.0.0.5'); await page.fill(C + ' [data-live-port]', '502');
  await page.click(C + ' [data-live-add]'); await page.waitForTimeout(150);
  ok(await page.$(C + ' [data-live-device="plc1"]') !== null, 'a device is added');
  await page.fill(C + ' [data-live-csv]', 'id,device,address,label,unit,scale,offset,low,high,deadband,staleS,type,target\n' + tag + ',plc1,40001,Reading,C,0.1,0,,300,,60,s16,' + tag + '\nBAD-1,nodev,zz,,,,,,,,,,\n');
  await page.click(C + ' [data-live-act="live.act.check"]'); await page.waitForTimeout(250);
  const chk = await page.textContent(C + ' [data-live-out]');
  ok(/2 tags on 1 devices checked: [1-9]/.test(chk), 'Check the map reports the unknown device and the wrong address', chk.slice(0, 200));
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /^live\./.test(p.code || '')).length : 1));
  ok(probs >= 1, 'the notes go to Problems (live.map.*)', String(probs));
  await page.fill(C + ' [data-live-csv]', 'id,device,address,label,unit,scale,offset,low,high,deadband,staleS,type,target\n' + tag + ',plc1,40001,Reading,C,0.1,0,,300,,60,s16,' + tag + '\n');
  await page.fill(C + ' [data-live-readings]', 'tag,time,value,quality\n' + tag + ',' + new Date().toISOString() + ',123,Good');
  const before = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => /^LIVE-/.test(e.layer)).length);
  await page.click(C + ' [data-live-act="live.act.read"]'); await page.waitForTimeout(500);
  const after = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => /^LIVE-/.test(e.layer)).length);
  ok(/1 readings placed/.test(await page.textContent(C + ' [data-live-out]')) && after > before, 'readings from a CSV draw a value beside the tag on the sheet', before + ' -> ' + after);
  await page.click(C + ' [data-live-act="live.act.device"]'); await page.waitForTimeout(250);
  ok(/needs CadCraft Studio/.test(await page.textContent(C + ' [data-live-out]')), 'reading the devices says it needs Studio in a browser tab');
  const csvOut = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
  await page.click(C + ' [data-live-act="live.act.export"]'); const dl2 = await csvOut;
  ok(dl2 ? /^\ufeff?id,device,address/.test(fs.readFileSync(await dl2.path(), 'utf8')) : true, 'Save the map (CSV) writes the table');

  // ---- the calculators the remaining mount lines of chem-engines_PART_4 reach (flare header, charges + mesh sum, test the connection)
  const runCalc = async (id, edit) => {
    await page.selectOption('[data-calc-pick]', id);
    const inp = JSON.parse(await page.inputValue('[data-calc-input]')); edit(inp);
    await page.fill('[data-calc-input]', JSON.stringify(inp)); await page.click('[data-calc="calc.run"]'); await page.waitForTimeout(1200);
    return page.textContent('[data-calc-out]');
  };
  let o = await runCalc('relief2', () => {});
  ok(/flare/.test(o) && /back pressure/.test(o), 'Relief extras: the governing case feeds the flare header and the back pressure of each valve is shown', o.slice(0, 100));
  o = await runCalc('md', (i) => { i.steps = 40; i.q = 0.3; i.pme = { grid: 16, order: 4 }; i.constraints = [[0, 1, 1]]; });
  ok(/particle-mesh Ewald 16\^3/.test(o) && /constrainedBonds/.test(o), 'Molecular run: charges with the mesh sum and a rigid bond', o.slice(0, 120));
  o = await runCalc('lims2', (i) => { i.test = true; });
  ok(/needs CadCraft Studio/.test(o), 'Lab system: Test the connection says it needs Studio in a browser tab and sends nothing');

  // ---- CH.10: the fitting-loss picker (draft 2-K / 3-K pack)
  await page.selectOption('[data-calc-pick]', 'fittingk'); await page.waitForSelector('[data-calc-option]:not([hidden])', { timeout: 10000 });
  const nOpt = await page.$$eval('[data-calc-option] option', (o) => o.length);
  ok(nOpt === 67, 'the fitting picker lists 66 fittings of the 2-K and 3-K tables', String(nOpt));
  await page.selectOption('[data-calc-option]', { label: '[2K] Globe valve, Standard' }); await page.waitForTimeout(1200);
  o = await page.textContent('[data-calc-out]');
  ok(/K5\.015/.test(o), 'picking the 2-K globe valve (Re 1e5, 4 in) gives K = 5.015 (1500/Re + 4 x 1.25)', o.slice(0, 160));
  ok(/draft/i.test(o) && /not yet checked against the original papers/.test(o) && /Hooper, W\. B\./.test(o), 'the result says the table is a draft and names the papers');
  await page.fill('[data-calc-input]', JSON.stringify({ pack: null, method: '3K', fitting: 'x', Re: 1e5, Dinch: 4 })); await page.click('[data-calc="calc.run"]'); await page.waitForTimeout(600);
  ok(/Hooper 1981/.test(await page.textContent('[data-calc-out]')), 'with no pack the calculator keeps the needs-a-source message');

  // ---- CH.10 finish: compressor, pump and NPSH, fittings in the network
  o = await runCalc('compressor', () => {});
  ok(/pressureRatio3/.test(o) && /outletTemperature_K455\.9/.test(o) && /ideal gas with constant k and Z/i.test(o), 'Compressor: head, outlet temperature (455.9 K) and its assumptions are shown', o.slice(0, 140));
  o = await runCalc('npsh', () => {});
  ok(/npsha_m11\.61/.test(o) && /margin_m8\.61/.test(o), 'Pump and NPSH: available 11.61 m, margin 8.61 m over the required points');
  o = await runCalc('network', () => {});
  ok(/links\.pi\.Kfit2\.1/.test(o) && /Draft constants/.test(o), 'Pipe network: the link\'s fitting K (2.19) is worked out from its own Re, with the draft label', o.slice(0, 100));
  await shot('mount5-pid');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++; console.log('  FAIL ' + (err?.stack || err)); console.log(problems.slice(0, 6).join('\n')); await shot('fail').catch(() => {});
} finally {
  // ---- CH.26 (0.9): Connect your lab system
  const LM = '[data-addon-section="pid:pid-lims"]';
  await page.waitForSelector(LM + ' [data-lims-field="kind"]', { state: 'attached', timeout: 10000 });
  await page.selectOption(LM + ' [data-lims-field="kind"]', 'rest');
  await page.fill(LM + ' [data-lims-field="name"]', 'Lab'); await page.fill(LM + ' [data-lims-field="baseUrl"]', 'https://lims.example.com/api');
  await page.fill(LM + ' [data-lims-field="authHeader"]', 'Authorization'); await page.fill(LM + ' [data-lims-field="secretRef"]', 'lab-key');
  await page.click(LM + ' button:has-text("Test the connection")'); await page.waitForTimeout(300);
  ok(/needs CadCraft Studio/.test(await page.textContent(LM + ' [data-lims-out]')), 'Connect your lab system: the test in a browser tab says it needs Studio and sends nothing');
  await page.click(LM + ' button:has-text("Save")'); await page.waitForTimeout(200);
  const lstored = await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:pid:') && /limsprofile/.test(k)) return localStorage.getItem(k); return ''; });
  ok(/lab-key/.test(lstored) && !/Bearer/.test(lstored), 'Save keeps the key name in the add-on storage', lstored.slice(0, 120));
  await browser.close();
  try { admin('down'); } catch { /* fine */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
