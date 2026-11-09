#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wiring.mjs — the Lighting plots and Harness and cabinet wiring add-ons in /lab/cadcraft (0.8 SU.766 + SU.892; session cad-addons-08). Run as root: a signed-in session
 * is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-pid.mjs).
 *
 *   node tools/addons-test/browser-wiring.mjs [--shots dir]     (shots default: tmp/shots/wiring)
 *
 * Lighting: bundled and off, switched on; its panel; a truss, fixtures on it, numbering, the schedule, Properties, the CSV download, Ctrl+S → DWG →
 * reopened with the add-on off (plain block references that draw, data kept) → on again. Harness: a schematic made with Electrical's own symbols, HNUM,
 * HWIRE, a harness drawing, HEND / HROUTE, the cabinet (rail, panel, HMOD *), the from-to CSV and the workbook, Properties on a wire; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/wiring'));
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
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
await ctx.addInitScript(() => { try { localStorage.setItem('cc-newhere', 'skipped'); } catch { /* */ } });   // the "I'm new" offer would cover the command box
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const typeCmd = async (s, wait = 120) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const typeAll = async (...lines) => { for (const l of lines) await typeCmd(l); };
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const kindsOf = (kind) => page.evaluate((k) => window.cadcraft.doc.all().filter((e) => window.ccAddons.kinds.info(e)?.kind === k).map((e) => ({ id: e.id, x: e.x, y: e.y, data: window.ccAddons.kinds.info(e).data })), kind);
const download = async (label) => {
  const ex = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.label));
  const i = ex.findIndex((l) => l.includes(label));
  if (i < 0) return { file: null, list: ex };
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), typeAll('EXPORT', String(i + 1))]);
  const f = path.join(SHOTS, dl.suggestedFilename());
  await dl.saveAs(f);
  return { file: f, list: ex };
};


const enable = async (id, on = true) => { await page.evaluate(([i, o]) => window.ccAddons.loader.setEnabled(i, o), [id, on]); await page.waitForTimeout(500); };
const state = (id) => page.evaluate((i) => window.ccAddons.list().find((a) => a.id === i), id);
const reset = (id) => page.evaluate((i) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:' + i + ':')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on[i]; localStorage.setItem(k, JSON.stringify(s)); }, id);
const open = async () => {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'lighting' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
};

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await reset('lighting'); await reset('harness');
  await open();

  // ------------------------------------------------------------------------------------------------ Lighting plots
  let me = await state('lighting');
  ok(me && me.state === 'off' && me.source === 'bundled', 'Lighting plots is bundled and starts off', JSON.stringify(me && { state: me.state, reason: me.reason, detail: me.detail }));
  await enable('lighting');
  me = await state('lighting');
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  ok((await page.evaluate(() => document.querySelectorAll('[data-addon-section="lighting:lighting"] [data-lx-cmd]').length)) === 7, 'its section of the right panel has seven actions');
  await typeAll('LPOS', '1E', 'T', '0,0', '9000,0', '');
  await typeAll('LFIX', '1');
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  for (const [x, y] of [[1500, 20], [4500, -10], [7500, 0]]) { await page.evaluate((p) => window.cadcraft.engine.click(p), { x, y }); await page.waitForTimeout(120); }
  await typeAll('');
  await typeAll('LNUM', 'C', '101', 'G');
  const fx = await kindsOf('lfix');
  ok(fx.length === 3 && fx.map((f) => f.data.unit).sort().join() === '1,2,3' && fx.every((f) => f.data.pos === '1E'), 'three fixtures on 1E, numbered 1–3', JSON.stringify(fx.map((f) => [f.data.unit, f.data.chan, f.data.pos])));
  await typeAll('LSCHED', '');
  ok((await history()).some((l) => /Instrument schedule: 5 lines/.test(l)), 'LSCHED in the history', (await history()).slice(-4).join(' | '));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(400);
  await shot('lighting-01-plot');
  await page.evaluate(() => window.cadcraft.host.zoomWindow({ x: 500, y: -700 }, { x: 5500, y: 700 }));
  await page.waitForTimeout(400);
  await shot('lighting-03-closeup');
  const facts = await page.textContent('[data-addon-section="lighting:lighting"] .lx-facts').catch(() => '');
  ok(/3 fixtures, 2250 W, 1 positions\./.test(facts || ''), 'the panel says how many', facts);
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), fx[0].id);
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.body.innerText.includes('Channel') && document.body.innerText.includes('Purpose')), 'Properties shows the fixture fields');
  await shot('lighting-02-properties');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
  const csv = await download('Instrument schedule');
  ok(csv.file && /^﻿?Position,Unit,Type,Watts/.test(fs.readFileSync(csv.file, 'utf8')) && /1E,1,Profile,750/.test(fs.readFileSync(csv.file, 'utf8')), 'EXPORT: the instrument schedule CSV', csv.list.join(' | '));
  const [sv] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(SHOTS, 'saved-lighting-' + sv.suggestedFilename());
  await sv.saveAs(saved);
  ok(/\.dwg$/.test(saved) && fs.statSync(saved).size > 1000, 'Ctrl+S saves a DWG', path.basename(saved));
  await enable('lighting', false);
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction((f) => window.cadcraft.doc.meta.source === f && window.cadcraft.doc.model.size > 0, path.basename(saved), { timeout: 60000 });
  const plain = await page.evaluate(() => { const d = window.cadcraft.doc; const ins = d.all().filter((e) => e.type === 'insert' && e.xd && e.xd.CC_LIGHTING); return { n: ins.length, drawn: ins.every((e) => (d.blocks.get(e.block)?.entities.length || 0) > 0), known: ins.some((e) => !!window.ccAddons.kinds.info(e)) }; });
  ok(plain.n === 4 && plain.drawn && !plain.known, 'opened without the add-on: plain block references that draw, data kept', JSON.stringify(plain));
  await enable('lighting');
  ok((await kindsOf('lfix')).length === 3 && (await kindsOf('lpos')).length === 1, 'switched on: fixtures and position again');
  const back = await kindsOf('lfix');
  ok(back.map((f) => f.data.chan).sort().join() === '101,102,103', 'with their channels, read back from the DWG', JSON.stringify(back.map((f) => f.data.chan)));
  await enable('lighting', false);

  // ------------------------------------------------------------------------------------------------ Harness and cabinet wiring
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await open();
  me = await state('harness');
  ok(me && me.state === 'off' && me.source === 'bundled', 'Harness is bundled and starts off', JSON.stringify(me && { state: me.state, reason: me.reason, detail: me.detail }));
  await enable('harness');
  me = await state('harness');
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  ok((await page.evaluate(() => document.querySelectorAll('[data-addon-section="harness:harness"] [data-hn-cmd]').length)) === 8, 'its section of the right panel has eight actions');
  // the schematic, with Electrical's own symbols, made in the page
  const made = await page.evaluate(async () => {
    const S = await import('/assets/apps/cadcraft/dev/addons/electrical/lib/symbols.js');
    const doc = window.cadcraft.doc, ids = {};
    const place = (key, x, y, attrs) => { let e; doc.change('p', () => { const b = S.symbolBlock(key, 'iec'); S.ensureBlock(doc, b); e = doc.add({ type: 'insert', block: b.name, x, y, sx: 1, sy: 1, rot: 0, layer: 'EL-SYMBOL', attrs: S.symbolAttrs(key, attrs) }); }); return S.pinsOf(e, doc.blocks.get(e.block)); };
    const pins = (list) => Object.fromEntries(list.map((p) => [p.tag, p]));
    const F1 = pins(place('breaker', 0, 100, { TAG: '-F1', MFR: 'Volta', PART: 'B16-1P' })), K1 = pins(place('coil', 0, 50, { TAG: '-K1' })), X1 = pins(place('terminal', 0, 0, { TAG: '-X1', P1: '1' }));
    const wire = (a, b) => { let e; doc.change('w', () => { e = doc.add({ type: 'line', layer: 'EL-WIRE', x1: a.x, y1: a.y, x2: b.x, y2: b.y }); }); return e.id; };
    ids.a = wire(F1.P2, K1.A1 || K1.P1);
    ids.b = wire(K1.A2 || K1.P2, X1.P1);
    return ids;
  });
  await typeAll('HNUM');
  ok((await history()).some((l) => /Numbered 2 of 2 wires/.test(l)), 'HNUM numbered the two wires', (await history()).slice(-3).join(' | '));
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), made.a);
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.body.innerText.includes('Gauge') && document.body.innerText.includes('End 1')), 'Properties shows the wire fields');
  await shot('harness-01-properties');
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), made.a);
  await typeAll('HWIRE', 'C', 'rd', 'G', '2.5', '');
  await typeAll('HHARN', '', 'H1', '1000,1000', '1300,1000', '1300,1400', '');
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await typeAll('HEND');
  await page.evaluate(() => window.cadcraft.engine.click({ x: 1000, y: 1000 }));
  await page.waitForTimeout(150);
  await typeAll('-F1');
  await page.evaluate(() => window.cadcraft.engine.click({ x: 1300, y: 1400 }));
  await page.waitForTimeout(150);
  await typeAll('-K1');
  await page.evaluate(() => window.cadcraft.engine.click({ x: 1300, y: 1000 }));
  await page.waitForTimeout(150);
  await typeAll('-X1', '');
  await typeAll('HROUTE');
  ok((await history()).some((l) => /Routed 2 of 2 wires through 1 harness/.test(l)), 'HROUTE: both wires routed', (await history()).slice(-4).join(' | '));
  await typeAll('HRAIL', '1000,500', '1400,500');
  await typeAll('HMOD', '*');
  await page.evaluate(() => window.cadcraft.engine.click({ x: 1000, y: 500 }));
  await page.waitForTimeout(200);
  await typeAll('');
  ok((await kindsOf('hmod')).map((m) => m.data.tag).sort().join() === '-F1,-K1,-X1:1', 'HMOD *: the schematic\'s three parts on the rail', JSON.stringify((await kindsOf('hmod')).map((m) => m.data.tag)));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(500);
  await shot('harness-02-harness-and-cabinet');
  const ft = await download('From-to list');
  const text = ft.file ? fs.readFileSync(ft.file, 'utf8') : '';
  ok(/^﻿?Wire,From,To,Colour,Gauge/.test(text) && /W001,'-F1:2,'-K1:A1,RD,2.5,,Ferrule,Ferrule,730,Harness/.test(text), 'EXPORT: the from-to list, the first wire red 2.5 mm², 730 mm along the harness', text.split('\n').slice(0, 3).join(' | '));
  const bom = await download('Bill of materials');
  ok(bom.file && /Rail,DIN rail,400 mm,1/.test(fs.readFileSync(bom.file, 'utf8')), 'EXPORT: the bill of materials has the rail');
  const xl = await download('Wiring lists');
  ok(xl.file && fs.readFileSync(xl.file).subarray(0, 2).toString() === 'PK', 'EXPORT: the workbook');
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
