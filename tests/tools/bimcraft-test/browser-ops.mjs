#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ops.mjs — BimCraft for building operations and energy (0.7, session `bim-ops`: LC.12, LC.20) in the lab, headless,
 * real clicks.   node tools/bimcraft-test/browser-ops.mjs [--shots <dir>] [--only docs,cobie,sensors,feeds,day,energy]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimops), so the shared
 * admin-login throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimops'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh(viewport = { width: 1440, height: 900 }) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport, acceptDownloads: true });
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
/** Pick the house's first window and track it: → its key. */
async function trackWindow() {
  const key = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer, keys = window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcWindow' }]); v.select([keys[0]]); return keys[0]; });
  await page.click('[data-as-track]');
  await page.waitForSelector('[data-as-detail]');
  return key;
}
const parts = {};
const T = { page: () => page, ok, shot, fresh, openFile, waitStatus, statusText, download, tab, trackWindow, HOUSE, REPO };

parts.docs = async () => {
  console.log('== docs: documents per asset (LC.12 item 1)');
  await fresh();
  await openFile(HOUSE);
  await tab('assets');
  await trackWindow();
  ok(/No documents linked yet/.test(await page.textContent('[data-as-detail]')), 'a tracked window: no documents yet, the tab says what can be linked');
  await page.selectOption('[data-as-d="kind"]', 'manual');
  await page.fill('[data-as-d="title"]', 'Window care guide');
  await page.fill('[data-as-d="location"]', 'https://example.com/window-care.pdf');
  await page.click('[data-as-doc-add]');
  await waitStatus(/^Document linked\./);
  await page.selectOption('[data-as-d="kind"]', 'photo');
  await page.fill('[data-as-d="location"]', 'Photos/W1 as fitted.jpg');
  await page.click('[data-as-doc-add]');
  await waitStatus(/^Document linked\./);
  const docs = await page.$$eval('[data-as-doc]', (l) => l.map((x) => ({ text: x.textContent, a: x.querySelector('[data-as-doc-open]') && { href: x.querySelector('a').href, target: x.querySelector('a').target, rel: x.querySelector('a').rel } })));
  ok(docs.length === 2, 'two documents linked', String(docs.length));
  const web = docs.find((d) => d.a), file = docs.find((d) => !d.a);
  ok(web && web.a.href === 'https://example.com/window-care.pdf' && web.a.target === '_blank' && /noopener/.test(web.a.rel) && /noreferrer/.test(web.a.rel), 'the web address opens in a new tab, no opener, no referrer', JSON.stringify(web));
  ok(file && /W1 as fitted\.jpg/.test(file.text) && /beside the IFC/.test(file.text), 'the photo by file name: shown with its name, said to be beside the IFC, no link', file?.text);
  await shot(page, '01-docs');
  await page.fill('[data-as-d="location"]', 'javascript:alert(1)');
  await page.click('[data-as-doc-add]');
  await waitStatus(/Only web addresses \(http or https\) or file names/);
  ok(await page.$$eval('[data-as-doc]', (l) => l.length) === 2, 'a javascript: link: refused, said why, nothing added');
  await page.click('[data-as-doc-del]');
  await page.waitForFunction(() => document.querySelectorAll('[data-as-doc]').length === 1);
  await page.click('[data-toolbar] [data-act="undo"]');
  await page.waitForFunction(() => document.querySelectorAll('[data-as-doc]').length === 2);
  ok(true, 'Remove, then Undo: the document back');
  const saved = await download(() => page.click('[data-save]'));
  const ifc = saved.bytes.toString('latin1');
  ok(/IFCDOCUMENTREFERENCE\('https:\/\/example\.com\/window-care\.pdf',\$,'Window care guide','manual',\$\)/.test(ifc) && /'CadCraft_AssetDocument','photo'/.test(ifc), 'Save as IFC: both references and their kinds are in the file');
};

parts.cobie = async () => {
  console.log('== cobie: COBie spreadsheet out and in (LC.12 item 2)');
  const APP = path.join(REPO, 'public_html/assets/apps/bimcraft/dev');
  const X = await import(path.join(APP, 'assets-bim-xlsx.js'));
  await fresh();
  await openFile(HOUSE);
  await tab('assets');
  await trackWindow();
  await page.fill('[data-as-field="serial"]', 'NL-55-0192');
  await page.click('[data-as-save]');
  await waitStatus(/^Asset data written into the model\./);
  await page.click('[data-as-cobie] > summary');
  await page.fill('[data-as-cobie-by]', 'fm@example.com');
  const out = await download(() => page.click('[data-as-cobie-save]'));
  await waitStatus(/^COBie spreadsheet saved with 1 components?\./);
  const wb = await X.readXlsx(new Uint8Array(out.bytes));
  const comp = wb.sheets.find((s) => s.name === 'Component');
  const H = comp.rows[0];
  ok(/ COBie\.xlsx$/.test(out.name) && wb.sheets.length === 10 && comp.rows.length === 2 && comp.rows[1][H.indexOf('SerialNumber')] === 'NL-55-0192' && comp.rows[1][H.indexOf('CreatedBy')] === 'fm@example.com', 'Save as COBie: 10 sheets, the tracked window as a component with its serial and the typed address', out.name);
  ok(wb.sheets.find((s) => s.name === 'Space').rows.length === 6, 'the house\'s 5 rooms on the Space sheet');
  // edit it as a spreadsheet would and read it back
  comp.rows[1][H.indexOf('SerialNumber')] = 'NL-55-9999';
  comp.rows[1][H.indexOf('BarCode')] = '=1+1';
  const edited = path.join(REPO, 'tmp', 'browser-ops-cobie.xlsx');
  fs.writeFileSync(edited, await X.writeXlsx(wb.sheets.map((s) => ({ name: s.name, rows: s.rows }))));
  try {
    await page.setInputFiles('[data-as-cobie-file]', edited);
    await page.waitForSelector('[data-as-cobie-preview]');
    const lines = await page.$$eval('[data-as-cobie-change] .bc-muted', (l) => l.map((x) => x.textContent));
    ok(lines.length === 2 && lines.some((l) => /NL-55-0192 → NL-55-9999/.test(l)) && lines.some((l) => /=1\+1 \(new\)/.test(l)), 'Read: the preview lists the serial change and the new barcode (kept as text), nothing written yet', lines.join(' | '));
    ok(await page.inputValue('[data-as-field="serial"]') === 'NL-55-0192', 'before Apply the model is unchanged');
    await shot(page, '02-cobie-preview');
    await page.click('[data-as-cobie-apply]');
    await waitStatus(/^COBie read into 1 assets?\./);
    ok(await page.inputValue('[data-as-field="serial"]') === 'NL-55-9999' && await page.inputValue('[data-as-field="barcode"]') === '=1+1', 'Apply: the asset shows the new serial and barcode');
    await page.click('[data-toolbar] [data-act="undo"]');
    await page.waitForFunction(() => document.querySelector('[data-as-field="serial"]')?.value === 'NL-55-0192');
    ok(true, 'Undo: one step takes the whole spreadsheet back');
  } finally { fs.rmSync(edited, { force: true }); }
};

parts.sensors = async () => {
  console.log('== sensors: readings from a CSV, limits, the model (LC.12 item 3)');
  const csvFile = path.join(REPO, 'tmp', 'browser-ops-sensors.csv');
  for (const vp of [{ width: 1440, height: 900 }, { width: 412, height: 892 }]) {
    const phone = vp.width < 700;
    await fresh(vp);
    await openFile(HOUSE);
    if (phone) { await page.click('[data-phone-bar] [data-phone-sheet="right"]'); await page.waitForTimeout(400); }
    await tab('assets');
    const key = await trackWindow();
    const a = await page.evaluate((k) => window.bimcraftAssets.state.list.find((x) => x.id === k), key);
    const rows = ['time,' + a.guid + ',Nobody'];
    for (let h = 0; h < 24; h++) rows.push(`2026-10-23T${String(h).padStart(2, '0')}:00:00Z,${(20 + 3 * Math.sin(h / 4)).toFixed(2)},1`);
    rows.push('2026-10-24T00:00:00Z,27.4375,1');   // a reading no IFC coordinate will hold
    fs.writeFileSync(csvFile, rows.join('\n') + '\n');
    try {
      await page.evaluate(() => { const d = document.querySelector('[data-as-sensors]'); if (d) d.open = true; });
      await page.setInputFiles('[data-as-sensor-file]', csvFile);
      await waitStatus(/^Readings for 1 asset \(rows read: 25\)\./);
      if (!phone) {
        ok(/27\.44/.test(await page.textContent(`[data-as-reading="${a.guid}"]`)) && /Nobody/.test(await page.textContent('[data-as-sensor-unmatched]')), 'a CSV of 25 readings: the latest (27.44) in the list; the column "Nobody" said to match no asset');
        await page.fill('[data-as-limit="low"]', '18');
        await page.fill('[data-as-limit="high"]', '24');
        await page.fill('[data-as-limit="unit"]', '°C');
        await page.click('[data-as-limit-save]');
        await waitStatus(/^Limits written into the model\./);
        ok(await page.isVisible(`[data-as-reading="${a.guid}"] [data-as-flag="high"]`) && /27\.44 °C/.test(await page.textContent('[data-as-sensor-latest]')), 'limits 18–24 °C saved: the asset is flagged above its limit');
        ok(await page.isVisible('[data-as-chart] path') && /25 readings/.test(await page.textContent('.as-figure figcaption')), 'its chart: 25 readings, with the limit lines');
        await page.check('[data-as-sensor-show]');
        await page.waitForSelector('[data-as-label]');
        const painted = await page.evaluate((k) => { const v = document.querySelector('[data-canvas]').viewer; const l = document.querySelector(`[data-as-label="${k}"]`); return { color: v.colorMap?.get(k), text: l?.textContent, shown: l && l.style.display !== 'none' }; }, key);
        ok(painted.color === '#c53030' && painted.text === '27.44 °C' && painted.shown, 'Show on the model: the window painted red (above its limit) with a "27.44 °C" label', JSON.stringify(painted));
        await shot(page, '03-sensors');
        await page.uncheck('[data-as-sensor-show]');
        ok(await page.evaluate(() => !document.querySelector('[data-canvas]').viewer.colorMap && !document.querySelector('[data-as-labels]')), 'unticked: the model\'s own colours back, no labels');
        const saved = await download(() => page.click('[data-save]'));
        ok(/'CadCraft_Sensor'/.test(saved.bytes.toString('latin1')) && !/27\.4375/.test(saved.bytes.toString('latin1')), 'Save as IFC: the limits are in the file, the readings are not');
      } else {
        ok(await page.isVisible('[data-as-chart-show]') && !(await page.$('[data-as-chart]')), 'on a phone (412 px): no chart until asked; the button shows one');
        await page.click('[data-as-chart-show]');
        await page.waitForSelector('[data-as-chart]');
        ok(true, 'Show the chart: drawn on the phone too');
        await shot(page, '04-sensors-phone');
      }
    } finally { fs.rmSync(csvFile, { force: true }); }
  }
};

parts.feeds = async () => {
  console.log('== feeds: live readings from the person\'s own broker or address (LC.12 item 4)');
  const { startBroker } = await import(path.join(REPO, 'tools/bimcraft-test/ops-broker.mjs'));
  const b = await startBroker({ user: 'fm', pass: 'pw-9f3k', token: 'tok-77' });
  const savedIfc = path.join(REPO, 'tmp', 'browser-ops-feeds.ifc');
  try {
    await fresh();
    await openFile(HOUSE);
    await tab('assets');
    const key = await trackWindow();
    const a = await page.evaluate((k) => window.bimcraftAssets.state.list.find((x) => x.id === k), key);
    await page.evaluate(() => { document.querySelector('[data-as-live-sec]').open = true; });
    ok(b.log.connects.length === 0 && /Not connected/.test(await page.textContent('[data-as-live-state]')), 'nothing connects by itself: the feed waits for Connect');
    await page.fill('[data-as-live="url"]', b.url);
    await page.fill('[data-as-live="topics"]', 'site/{tag}/temp');
    await page.fill('[data-as-live="user"]', 'fm');
    await page.fill('[data-as-live-secret]', 'pw-9f3k');
    await page.click('[data-as-live-go]');
    await page.waitForSelector('[data-as-live-state="connected"]', { timeout: 15000 });
    ok(b.log.connects[0]?.user === 'fm' && b.log.connects[0]?.pass === 'pw-9f3k' && b.log.subscribes[0]?.filters.join() === 'site/+/temp', 'Connect: the broker got the login and the subscription site/+/temp');
    ok(await page.evaluate(() => !document.querySelector('[data-as-live-secret]').value && !JSON.stringify(Object.assign({}, localStorage)).includes('pw-9f3k')), 'the password box is emptied at Connect and nothing in this browser\'s storage holds it');
    b.publish('site/' + a.guid + '/temp', '23.5');
    await page.waitForFunction((g) => /23\.5/.test(document.querySelector(`[data-as-reading="${g}"]`)?.textContent || ''), a.guid, { timeout: 10000 });
    ok(b.log.pubacks.length === 1, 'a reading published for the window (topic site/<its GlobalId>/temp) shows in its Reading column; acknowledged (QoS 1)');
    b.publish('site/Nothing-here/temp', '1');
    await page.waitForSelector('[data-as-live-unmatched]', { timeout: 10000 });
    ok(/Nothing-here/.test(await page.textContent('[data-as-live-unmatched]')), 'a reading for a name no asset has: listed, not shown');
    await shot(page, '05-feeds');
    await page.click('[data-as-live-keep]');
    await waitStatus(/^The address, topics and value field are in the model/);
    const ifc = await download(() => page.click('[data-save]'));
    const text = ifc.bytes.toString('latin1');
    ok(/'CadCraft_Feed'/.test(text) && text.includes(b.url) && !text.includes('pw-9f3k') && !/23\.5,|IFCREAL\(23\.5\)/.test(text), 'Keep these settings: the address and topic are in the IFC; no password, no readings');
    fs.writeFileSync(savedIfc, ifc.bytes);
    await page.click('[data-as-live-stop]');
    await page.waitForFunction(() => /Disconnected/.test(document.querySelector('[data-as-live-state]')?.textContent || ''));
    ok(await (async () => { for (let i = 0; i < 50 && b.log.disconnects < 1; i++) await page.waitForTimeout(100); return b.log.disconnects === 1; })(), 'Disconnect: the broker is told (DISCONNECT)');
    // HTTP polling with a token
    b.readings = { [a.guid]: 30.25 };
    await page.check('[data-as-live-kind="http"]');
    await page.fill('[data-as-live="url"]', b.http);
    await page.fill('[data-as-live="every"]', '5');
    await page.fill('[data-as-live-secret]', 'tok-77');
    await page.click('[data-as-live-go]');
    await page.waitForFunction((g) => /30\.25/.test(document.querySelector(`[data-as-reading="${g}"]`)?.textContent || ''), a.guid, { timeout: 15000 });
    ok(b.log.auth.includes('Bearer tok-77') && b.log.cookies === 0, 'HTTP: the reading arrives; the token went as a bearer token; no cookies were sent');
    await page.click('[data-as-live-stop]');
    // the saved file opened again: the form is filled from it, nothing connects
    const before = b.log.connects.length;
    await fresh();
    await openFile(savedIfc);
    await tab('assets');
    await page.evaluate(() => { document.querySelector('[data-as-live-sec]').open = true; });
    await page.waitForTimeout(1500);
    ok(await page.inputValue('[data-as-live="url"]') === b.url && await page.inputValue('[data-as-live="topics"]') === 'site/{tag}/temp' && b.log.connects.length === before, 'the saved IFC opened again: the address and topic come back from the file, and nothing connects until Connect');
  } finally { await b.close(); fs.rmSync(savedIfc, { force: true }); }
};

parts.day = async () => {
  console.log('== day: VSC per window, the sun on a date, the daylight factor on a grid (LC.20 item 6)');
  await fresh();
  await page.evaluate(() => { try { localStorage.removeItem('bimcraft.daylight'); localStorage.removeItem('bimcraft.daylight.sky'); } catch { /* none */ } });
  await openFile(HOUSE);
  await tab('daylight');
  ok(/^A design aid, not a compliance calculation/.test(await page.textContent('[data-day-not]')), 'the tab opens with "A design aid, not a compliance calculation"');
  await page.click('[data-day-run]');
  await waitStatus(/^Daylight worked out for \d+ rooms? \(\d+ windows\)\./, 180000);
  const first = await page.$eval('[data-day-row]', (r) => r.dataset.dayRow);
  await page.click(`[data-day-row="${first}"]`);
  const wins = await page.$$eval('[data-day-window]', (l) => l.map((x) => x.textContent));
  ok(wins.length >= 1 && wins.every((w) => /VSC \d+\.\d %, obstruction \d+°/.test(w)), 'each window in a room\'s detail shows its VSC and obstruction angle', wins.join(' | '));
  // the sun: no site in the house → typed latitude and longitude
  await page.evaluate(() => { document.querySelector('[data-day-sun]').open = true; });
  ok(await page.isVisible('[data-day-sun-nosite]') && await page.isDisabled('[data-day-sun-run]'), 'the house has no site location: said, and the sun waits for a latitude and longitude');
  await page.fill('[data-day-sky="lat"]', '51.5'); await page.press('[data-day-sky="lat"]', 'Tab');
  await page.fill('[data-day-sky="lon"]', '-0.12'); await page.press('[data-day-sky="lon"]', 'Tab');
  await page.waitForFunction(() => !document.querySelector('[data-day-sun-run]').disabled);
  await page.click('[data-day-sun-run]');
  await waitStatus(/^Sun worked out for \d+ rooms?\./, 120000);
  const sunRows = await page.$$eval('[data-day-sun-row]', (r) => r.map((x) => [x.cells[1].textContent, x.cells[2].textContent]));
  ok(sunRows.length === 5 && sunRows.every(([k, p]) => Number(k) >= 0 && /\d+ W/.test(p)) && sunRows.some(([k]) => Number(k) > 0), 'the sun on 21 July at 51.5° N: every room\'s kWh and peak', JSON.stringify(sunRows));
  ok(/A design aid, not a compliance calculation/.test(await page.textContent('[data-day-sun]')), 'the sun panel says it is a design aid, not a compliance calculation');
  // the grid
  await page.evaluate(() => { document.querySelector('[data-day-grid]').open = true; });
  await page.click('[data-day-grid-run]');
  await waitStatus(/^Grid worked out for 5 rooms \(\d+ points\)\./, 180000);
  const gridRows = await page.$$eval('[data-day-grid-row]', (r) => r.map((x) => Number(x.cells[1].textContent)));
  ok(gridRows.length === 5 && gridRows.every((x) => x > 0 && x < 40), 'every room\'s mean daylight factor on its grid', gridRows.join(' '));
  ok(/A design aid, not a compliance calculation/.test(await page.textContent('[data-day-grid]')), 'the grid panel says so too');
  await page.click('[data-day-grid-row]');
  await page.waitForSelector('[data-day-grid-plan]');
  const plan = await page.$eval('[data-day-grid-plan]', (s) => ({ rects: s.querySelectorAll('rect').length, dfs: [...s.querySelectorAll('rect')].map((r) => Number(r.dataset.df)) }));
  ok(plan.rects > 0 && plan.rects <= 400 && plan.dfs.every((x) => x >= 0), `the room's plan: ${plan.rects} points (≤ 400), each in its band's colour`);
  ok(await page.isVisible('[data-day-sun-chart]') && /at most \d+ W/.test(await page.textContent('[data-day-room-sun]')), 'the room\'s sun over the day as a chart');
  await shot(page, '06-day-grid');
};

parts.energy = async () => {
  console.log('== energy: heating and cooling loads (LC.20 item 7)');
  const ddFile = path.join(REPO, 'tmp', 'browser-ops-dd.csv');
  fs.writeFileSync(ddFile, 'Month,HDD\nJan,380\nFeb,330\nMar,300\nApr,210\nMay,120\nJun,40\nJul,10\nAug,15\nSep,60\nOct,170\nNov,280\nDec,350\n');
  try {
    await fresh();
    await page.evaluate(() => { try { localStorage.removeItem('bimcraft.energy'); } catch { /* none */ } });
    await openFile(HOUSE);
    await tab('daylight');
    await page.click('[data-day-run]');
    await waitStatus(/^Daylight worked out for/, 180000);
    await page.evaluate(() => { document.querySelector('[data-energy]').open = true; });
    ok(/^A design aid, not a compliance calculation/.test(await page.textContent('[data-energy-not]')), 'the section opens with "A design aid, not a compliance calculation"');
    ok(await page.inputValue('[data-energy-in="ti"]') === '21' && await page.inputValue('[data-energy-in="te"]') === '-3' && await page.inputValue('[data-energy-in="dd"]') === '2000', 'every input shown with its starting value (21 °C in, −3 °C out, 2000 degree-days)');
    await page.setInputFiles('[data-energy-dd]', ddFile);
    await waitStatus(/^Degree-days: 2265 \(12 rows added up\)\./);
    ok(await page.inputValue('[data-energy-in="dd"]') === '2265', 'degree-days read from a CSV of 12 months: 2265');
    await page.click('[data-energy-run]');
    await waitStatus(/^Loads worked out for 5 rooms\./, 180000);
    const rows = await page.$$eval('[data-energy-row]', (r) => r.map((x) => [...x.cells].slice(1).map((c) => Number(c.textContent.replace(/[^\d.]/g, '')))));
    ok(rows.length === 5 && rows.every(([h, y, c]) => h > 0 && y > 0 && c > 0), 'each room: heat loss, heating a year, cooling peak', JSON.stringify(rows));
    await page.click('[data-energy-row]');
    await page.waitForSelector('[data-energy-detail]');
    const parts = await page.$$eval('[data-energy-part]', (l) => l.map((x) => x.textContent));
    ok(parts.length >= 3 && parts.some((p) => /to outside/.test(p)) && parts.every((p) => /from the IFC|from its type|from its layers|typical value/.test(p)), 'the room\'s detail lists what bounds it, each with its area, U and where the U came from', parts.slice(0, 4).join(' | '));
    ok(/= \d[\d ]* W\./.test(await page.textContent('[data-energy-heat]')) && /sun 0 W/.test(await page.textContent('[data-energy-cool]')), 'the heat loss and the cooling peak are shown as sums of their parts (no sun worked out yet: sun 0 W)');
    const editable = await page.$('[data-energy-u]');
    ok(editable ? true : /U-values are shown here/.test(await page.textContent('[data-energy-detail]')), editable ? 'U-values can be typed (the host passes afterEdit)' : 'U-values read-only until mep-07\'s mount line (said in the detail)');
    await shot(page, '07-energy');
    // the sun on a hot day goes into the cooling peak
    const before = Number((await page.textContent('[data-energy-cool]')).match(/= ([\d ]+) W/)[1].replace(/ /g, ''));
    await page.evaluate(() => { document.querySelector('[data-day-sun]').open = true; });
    await page.fill('[data-day-sky="lat"]', '40'); await page.press('[data-day-sky="lat"]', 'Tab');
    await page.fill('[data-day-sky="lon"]', '-105'); await page.press('[data-day-sky="lon"]', 'Tab');
    await page.waitForFunction(() => !document.querySelector('[data-day-sun-run]').disabled);
    await page.click('[data-day-sun-run]');
    await waitStatus(/^Sun worked out/, 120000);
    await page.waitForFunction(() => !/sun 0 W/.test(document.querySelector('[data-energy-cool]')?.textContent || 'sun 0 W'));
    const after = Number((await page.textContent('[data-energy-cool]')).match(/= ([\d ]+) W/)[1].replace(/ /g, ''));
    ok(after > before, `with the sun worked out, its peak joins the cooling peak (${before} → ${after} W)`);
  } finally { fs.rmSync(ddFile, { force: true }); }
};

try {
  for (const [k, f] of Object.entries(parts)) if (want(k)) await f(T);
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (page) await shot(page, 'zz-error');
}
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimops']); } catch { /* the session expires anyway */ }
console.log(`\nbrowser-ops: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
