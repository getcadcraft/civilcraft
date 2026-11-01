#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cabinet.mjs — the Cabinets add-on in /lab/cadcraft (0.8 SU.1035; session sx-cabinet). Run as root: a signed-in session
 * is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-pid.mjs).
 *
 *   node tools/addons-test/browser-cabinet.mjs [--shots dir]     (shots default: tmp/shots/cabinet)
 *
 * Bundled and off, switched on; its panel; a run typed in (two bases, a drawer base, a wall cabinet); the front view; CABLIST and
 * CABNEST in the history; the three exports downloaded (CSV, labels HTML, DXF); Properties for a cabinet; Ctrl+S → DWG → reopened
 * with the add-on off (plain block references that draw) → on (cabinets again); no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/cabinet'));
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

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:cabinet:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.cabinet; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'cabinet' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'cabinet'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Cabinets is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('cabinet', true));
  await page.waitForTimeout(500);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'cabinet'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  const ui = await page.evaluate(() => document.querySelectorAll('[data-addon-section="cabinet:cabinet"] [data-cab-cmd]').length);
  ok(ui === 8, 'the Cabinets section of the right panel has its eight actions', String(ui));
  const units = await page.evaluate(() => window.cadcraft.doc.meta.units || '');
  ok(!['inches', 'feet', 'yards'].includes(units), 'a new drawing works in millimetres', units);

  // a wall line drawn first (so the run has something to stand on), then the run
  await typeAll('LINE', '0,0', '3600,0', '');
  await typeAll('CABINET', '0,0', '3600,0', '1000,1000', '600', '800', 'D', '450', 'W', '600', '800', '');
  await page.waitForTimeout(300);
  const cabs = await kindsOf('cab');
  ok(cabs.length === 5 && cabs.map((c) => c.data.cab.no).sort().join(' ') === 'B01 B02 D01 W01 W02', 'the run: B01, B02, D01 and two wall cabinets', JSON.stringify(cabs.map((c) => [c.data.cab.no, c.x])));
  // the front view: pick B01 by clicking it on the screen
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(300);
  await typeCmd('CABELEV');
  await page.evaluate(() => window.cadcraft.engine.click({ x: 300, y: 0 }));
  await page.waitForTimeout(200);
  await typeCmd('0,-2600', 300);
  const ev = await kindsOf('cabelev');
  ok(ev.length === 1 && ev[0].data.items.length === 5, 'CABELEV: the front view of the five cabinets', JSON.stringify(ev.map((e) => e.data.items.length)));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(500);
  await shot('cabinet-01-plan-and-front');
  await typeCmd('CABLIST', 250);
  ok((await history()).some((l) => /5 cabinets, \d+ pieces/.test(l)), 'CABLIST in the history', (await history()).slice(-6).join(' | '));
  await typeCmd('CABNEST', 2500);
  ok((await history()).some((l) => /Nested on \d+ sheets of 2440 × 1220/.test(l)), 'CABNEST in the history', (await history()).slice(-5).join(' | '));
  const facts = await page.textContent('[data-addon-section="cabinet:cabinet"] .cab-facts').catch(() => '');
  ok(/5 cabinets, \d+ pieces\./.test(facts || ''), 'the panel says how many', facts);

  // Properties of one cabinet
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), cabs.find((c) => c.data.cab.no === 'B02').id);
  await page.waitForTimeout(400);
  const props = await page.evaluate(() => document.body.innerText.includes('Drawers') && document.body.innerText.includes('Hinged on'));
  ok(props, 'Properties shows the cabinet fields');
  await shot('cabinet-02-properties');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));

  // the exports
  const csv = await download('Cabinet cut list');
  ok(csv.file && /^﻿?Part,Name,Cabinet/.test(fs.readFileSync(csv.file, 'utf8')), 'EXPORT: the cut list CSV', csv.list.join(' | '));
  const lab = await download('Cabinet labels');
  const html = lab.file ? fs.readFileSync(lab.file, 'utf8') : '';
  ok(/<svg/.test(html) && /Sheet 1, no\. 1/.test(html), 'EXPORT: the labels, in cutting order');
  if (lab.file) {
    const p2 = await ctx.newPage();
    await p2.goto('file://' + lab.file);
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: path.join(SHOTS, 'cabinet-03-labels.png'), clip: { x: 0, y: 0, width: 820, height: 560 } });
    await p2.close();
  }
  const dxf = await download('Cabinet sheets');
  ok(dxf.file && /B01-01\.1 \(/.test(fs.readFileSync(dxf.file, 'utf8')), 'EXPORT: the nested sheets DXF');

  // Ctrl+S → DWG; off → plain block references; on → cabinets again
  const [sv] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(SHOTS, 'saved-' + sv.suggestedFilename());
  await sv.saveAs(saved);
  ok(/\.dwg$/.test(saved) && fs.statSync(saved).size > 1000, 'Ctrl+S saves a DWG', path.basename(saved));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('cabinet', false));
  await page.waitForTimeout(300);
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction((f) => window.cadcraft.doc.meta.source === f && window.cadcraft.doc.model.size > 0, path.basename(saved), { timeout: 60000 });
  const plain = await page.evaluate(() => { const d = window.cadcraft.doc; const ins = d.all().filter((e) => e.type === 'insert' && e.xd && e.xd.CC_CABINET); return { n: ins.length, drawn: ins.every((e) => (d.blocks.get(e.block)?.entities.length || 0) > 0), known: ins.some((e) => !!window.ccAddons.kinds.info(e)) }; });
  ok(plain.n === 6 && plain.drawn && !plain.known, 'opened without the add-on: plain block references that draw, data kept', JSON.stringify(plain));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('cabinet', true));
  await page.waitForTimeout(500);
  ok((await kindsOf('cab')).length === 5 && (await kindsOf('cabelev')).length === 1, 'switched on: cabinets and the front view again');
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
