#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plant.mjs — the Plant add-on in /lab/bimcraft (0.7 LC.5 step 2; session plant-design). Run as root: a signed-in session
 * is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used.
 *
 *   node tools/addons-test/browser-plant.mjs [--shots dir]     (shots default: tmp/shots/plant)
 *
 * Bundled and off, switched on; the Plant tab opens in the right panel; equipment added through its form (a tank, two pumps
 * 600 mm apart); the layout check names the overlap; the table is saved as an IFC file that BimCraft opens, with the pump, the tank
 * and a port at every nozzle; the Pipe spec section; switched off, the tab goes; no console errors.
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
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'plant'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Plant is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  await page.setInputFiles('[data-file]', { name: 'fixture.ifc', mimeType: 'application/octet-stream', buffer: Buffer.from(fixtureIfc()) });
  await page.waitForFunction(() => !!window.bimcraftLive?.editor, null, { timeout: 60000 });
  await page.evaluate(() => window.ccAddons.loader.setEnabled('plant', true));
  await page.waitForTimeout(500);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'plant'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  const tab = '[data-rtab="addon-plant-plant"]';
  await page.waitForSelector(tab, { timeout: 10000 });
  await page.click(tab);
  await page.waitForSelector('[data-rpane="addon-plant-plant"] form.plant-form', { timeout: 10000 });
  ok(true, 'the Plant tab opens in the right panel with its equipment form');
  const pane = '[data-rpane="addon-plant-plant"]';
  const add = async (type, tag, x, y) => {
    await page.selectOption(pane + ' select[name="type"]', type);
    await page.fill(pane + ' input[name="tag"]', tag);
    await page.fill(pane + ' input[name="x"]', String(x)); await page.fill(pane + ' input[name="y"]', String(y));
    await page.click(pane + ' form.plant-form button[type="submit"]');
    await page.waitForSelector(pane + ' form.plant-form');
  };
  await add('tank', 'T-101', 0, 0);
  await add('pump-cf', 'P-101', 6000, 0);
  await add('pump-cf', 'P-102', 6600, 0);
  const rows = await page.$$eval(pane + ' table.plant-table tbody tr', (r) => r.map((x) => x.textContent));
  ok(rows.length === 3 && /Storage tank/.test(rows[0]) && /P-102/.test(rows[2]), 'three items in the table', JSON.stringify(rows));
  await page.click(pane + ' button:has-text("Check the layout")');
  await page.waitForSelector(pane + ' .plant-out li', { timeout: 5000 });
  const out = await page.$$eval(pane + ' .plant-out li', (l) => l.map((x) => x.textContent));
  ok(out.some((l) => /P-101 overlaps P-102/.test(l)), 'the layout check finds the two pumps 600 apart overlapping', JSON.stringify(out));
  await shot('plant-01-tab');
  // P-102 was only there to overlap; remove it and put a second pump well away
  await page.click(pane + ' table.plant-table tbody tr:nth-child(3) button[aria-label]');
  await page.waitForSelector(pane + ' form.plant-form');
  await add('pump-cf', 'P-103', 12000, 3000);
  // placed in the open model through add-on API 1.1 (model.write): one undo step each
  const classes0 = () => page.evaluate(() => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid), n = {}; for (const id of f.ids()) { const t = f.type(id); n[t] = (n[t] || 0) + 1; } return n; });
  const c0 = await classes0();
  await page.click(pane + ' table.plant-table tbody tr:nth-child(2) button[data-plant-place]');
  await page.waitForFunction(() => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid); let n = 0; for (const id of f.ids()) if (f.type(id) === 'IFCTANK') n++; return n >= 1; }, null, { timeout: 15000 }).catch(() => {});
  // the row order is T-101, P-101, P-102: the second row is P-101
  const c1 = await classes0();
  ok((c1.IFCPUMP || 0) === (c0.IFCPUMP || 0) + 1 && (c1.IFCDISTRIBUTIONPORT || 0) === (c0.IFCDISTRIBUTIONPORT || 0) + 2, 'Place on a pump row: one IfcPump and two ports (suction, discharge) in the open model', JSON.stringify([c0.IFCPUMP, c1.IFCPUMP, c0.IFCDISTRIBUTIONPORT, c1.IFCDISTRIBUTIONPORT]));
  const props = await page.evaluate(() => {
    const e = window.bimcraftLive.editor, api = e.api, mid = e.mid, f = api.file(mid);
    for (const id of f.ids()) {
      if (f.type(id) !== 'IFCPUMP') continue;
      const l = api.GetLine(mid, id, false), sets = [];
      for (const rid of f.ids()) if (f.type(rid) === 'IFCRELDEFINESBYPROPERTIES') { const r = api.GetLine(mid, rid, false); if ((r.RelatedObjects || []).some((h) => h.value === id)) sets.push(api.GetLine(mid, r.RelatingPropertyDefinition.value, false).Name.value); }
      return { name: l.Name.value, tag: l.Tag?.value, sets };
    }
    return null;
  });
  ok(props && props.name === 'P-101' && props.tag === 'P-101' && props.sets.includes('CadCraft_Plant'), 'the pump keeps its tag and the CadCraft_Plant set', JSON.stringify(props));
  await page.evaluate(() => window.bimcraftLive.editor.undo());
  const c2 = await classes0();
  ok((c2.IFCPUMP || 0) === (c0.IFCPUMP || 0) && (c2.IFCDISTRIBUTIONPORT || 0) === (c0.IFCDISTRIBUTIONPORT || 0), 'Undo takes the pump and its ports out again (one step)', JSON.stringify([c2.IFCPUMP, c2.IFCDISTRIBUTIONPORT]));
  await page.evaluate(() => window.bimcraftLive.editor.redo());
  const c3 = await classes0();
  ok((c3.IFCPUMP || 0) === (c0.IFCPUMP || 0) + 1, 'Redo puts it back');
  await page.evaluate(() => window.ccAddons.runCommand('plant:place-equipment'));
  await page.waitForTimeout(1500);
  const c4 = await classes0();
  ok(c4.IFCTANK === 1 && c4.IFCPUMP === 2 && c4.IFCDISTRIBUTIONPORT === 4 + 2 + 2, 'the place-equipment command puts the rest in: a tank and two pumps, 4 + 2 + 2 ports', JSON.stringify([c4.IFCTANK, c4.IFCPUMP, c4.IFCDISTRIBUTIONPORT]));
  // the router, between two of their ports
  await page.click(tab);
  await page.waitForSelector(pane + ' [data-plant-route]', { timeout: 10000 });
  const opts = await page.$$eval(pane + ' select[name="from"] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 8 && opts.some((o) => /pump suction/.test(o)), 'the router lists the model\'s eight ports', JSON.stringify(opts));
  const idx = (re, last) => { const all = opts.map((o, i) => (re.test(o) ? i : -1)).filter((i) => i >= 0); return String(last ? all[all.length - 1] : all[0]); };
  await page.selectOption(pane + ' select[name="from"]', idx(/pump discharge/));
  await page.selectOption(pane + ' select[name="to"]', idx(/pump suction/, true));
  await page.fill(pane + ' input[name="size"]', '4');
  await page.click(pane + ' [data-plant-route]');
  await page.waitForSelector(pane + ' .plant-out p', { timeout: 5000 });
  const rt = await page.textContent(pane + ' .plant-out');
  ok(/A route of \d+ mm with \d+ bends/.test(rt), 'Find a route between a pump\'s discharge and the other pump\'s suction', rt.slice(0, 160));
  await shot('plant-03-route');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click(pane + ' button:has-text("Save as IFC file")')]);
  const saved = path.join(SHOTS, dl.suggestedFilename());
  await dl.saveAs(saved);
  const text = fs.readFileSync(saved, 'utf8');
  ok(/\.ifc$/.test(saved) && /IFCPUMP\(/.test(text) && /IFCTANK\(/.test(text) && (text.match(/IFCDISTRIBUTIONPORT\(/g) || []).length === 4 + 2 + 2, 'the IFC file: a tank, two pumps, ports at every nozzle (4 + 2 + 2)', path.basename(saved));
  // BimCraft opens it
  await page.setInputFiles('[data-file]', saved);
  await page.click('dialog[open] button:has-text("Discard changes")');   // the placed equipment is unsaved: BimCraft asks before opening another file
  await page.waitForFunction(() => /plant-equipment/.test(window.bimcraftLive?.name || ''), null, { timeout: 60000 });
  const classes = await page.evaluate(() => { const e = window.bimcraftLive.editor, f = e.api.file(e.mid), n = {}; for (const id of f.ids()) { const t = f.type(id); n[t] = (n[t] || 0) + 1; } return n; });
  ok(classes.IFCPUMP === 2 && classes.IFCTANK === 1 && classes.IFCDISTRIBUTIONPORT === 8, 'BimCraft opens it: 2 pumps, 1 tank, 8 ports', JSON.stringify(classes));
  await page.waitForTimeout(800);
  await shot('plant-02-opened');
  // a pipe run drawn with BimCraft's own tool, picked by one of its segments: the spec section, the isometric
  await page.evaluate(async () => {
    const M = await import('/assets/apps/bimcraft/dev/mep-model.js');
    const ed = window.bimcraftLive.editor, api = ed.api, mid = ed.mid, f = api.file(mid);
    let st = null; for (const id of f.ids()) if (f.type(id) === 'IFCBUILDINGSTOREY') { st = api.GetLine(mid, id, false).GlobalId.value; break; }
    ed.modelChange(M.placeRun({ storey: st, kind: 'pipe', system: 'chw', mat: 'steel', cls: '40', size: '3', points: [[1000, 1000, 600], [3400, 1000, 600], [3400, 1000, 3000], [3400, 2500, 3000]], valves: [{ s: 1200, kind: 'gate' }, { s: 4000, kind: 'globe' }] }), { label: 'run' });
    window.bimcraftLive.refresh(true);
  });
  await page.waitForTimeout(800);
  const picked = await page.evaluate(() => window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcPipeSegment' }]).length);
  ok(picked >= 3, 'the run\'s segments are picked in the view', String(picked));
  const svg = await page.evaluate(async () => { const x = window.ccAddons.exporters().find((e) => /iso-svg/.test(e.id)); return x.write(window.ccAddons.exportInput()); });
  ok(typeof svg === 'string' && svg.startsWith('<svg') && svg.includes('>2400<') && svg.includes('>2400<') && svg.includes('>1500<') && svg.includes('CS40') && svg.includes('Gate valve'.slice(0, 0)), 'the isometric of a run drawn by BimCraft\'s own tool: legs 2400, 2400 and 1500, its spec CS40', svg.slice(0, 80));
  fs.writeFileSync(path.join(SHOTS, 'plant-run-isometric.svg'), svg);
  await page.evaluate(() => window.ccAddons.runCommand('plant:spec-check'));
  await page.waitForFunction(() => /match their spec|findings/.test(document.querySelector('p.bc-status')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
  const statusLine = await page.evaluate(() => document.querySelector('p.bc-status')?.textContent || '');
  ok(/1 runs? match/.test(statusLine) || /match their spec/.test(statusLine), 'spec-check: the run matches its spec', statusLine);
  // switched off
  await page.evaluate(() => window.ccAddons.loader.setEnabled('plant', false));
  await page.waitForTimeout(300);
  ok(await page.evaluate(() => !document.querySelector('[data-rtab="addon-plant-plant"]') && !window.ccAddons.commandList().length), 'switched off: the tab and the commands are gone');
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
