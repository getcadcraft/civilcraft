#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-windows.mjs — the Windows and doors add-on in /lab/cadcraft (0.8 SU.874; session fab-08). Run as root: a signed-in session
 * is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-cabinet.mjs).
 *
 *   node tools/addons-test/browser-windows.mjs [--shots dir]     (shots default: tmp/shots/windows)
 *
 * Bundled and off, switched on; its panel; three windows and a door typed in; WINLIST and WINBARS in the history; the five exports
 * downloaded (cut list, bars, glass, hardware, labels); Properties; Ctrl+S → DWG → reopened with the add-on off (plain block
 * references that draw) → on (windows again); no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/windows'));
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
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:windows:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.windows; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'windows' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'windows'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Windows and doors is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('windows', true));
  await page.waitForTimeout(500);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'windows'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  const ui = await page.evaluate(() => document.querySelectorAll('[data-addon-section="windows:windows"] [data-win-cmd]').length);
  ok(ui === 3, 'the section of the right panel has its three actions', String(ui));

  await typeAll('WINDOW', 'Z', '1500x1200', 'L', 'TL|TR', '0,0', 'Z', '900x1200', 'L', 'F', '2000,0', 'Z', '1800x1400', 'L', 'TL|F|TR', '3000,0', 'K', 'Z', '900x2100', 'L', 'F~800/R', '5000,0', '');
  await page.waitForTimeout(400);
  const wins = await kindsOf('win');
  ok(wins.length === 4 && wins.map((w) => w.data.spec.no).sort().join(' ') === 'D01 W01 W02 W03', 'three windows and a door placed', JSON.stringify(wins.map((w) => [w.data.spec.no, w.x])));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(500);
  await shot('windows-01-elevation');
  await typeCmd('WINLIST', 300);
  ok((await history()).some((l) => /4 windows, \d+ profile pieces, \d+ bars to saw/.test(l)), 'WINLIST in the history', (await history()).slice(-6).join(' | '));
  await typeCmd('WINBARS', 300);
  ok((await history()).some((l) => /bar 1 \(6500\)/.test(l)), 'WINBARS in the history', (await history()).slice(-4).join(' | '));
  const facts = await page.textContent('[data-addon-section="windows:windows"] .win-facts').catch(() => '');
  ok(/4 windows and doors/.test(facts || ''), 'the panel says how many', facts);

  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), wins.find((w) => w.data.spec.no === 'W01').id);
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => document.body.innerText.includes('Profile system') && document.body.innerText.includes('Glass build')), 'Properties shows the window fields');
  await shot('windows-02-properties');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));

  const cut = await download('Window profile cut list');
  ok(cut.file && /^﻿?Piece,Window,Name,Profile/.test(fs.readFileSync(cut.file, 'utf8')), 'EXPORT: the profile cut list CSV', cut.list.join(' | '));
  const bars = await download('Window bars');
  ok(bars.file && /^﻿?Profile and colour,Bar,Bar length/.test(fs.readFileSync(bars.file, 'utf8')), 'EXPORT: the bars CSV');
  const glass = await download('Window glass');
  ok(glass.file && /W01-G01/.test(fs.readFileSync(glass.file, 'utf8')), 'EXPORT: the glass CSV');
  const hw = await download('Window hardware');
  ok(hw.file && /Frame gasket/.test(fs.readFileSync(hw.file, 'utf8')), 'EXPORT: the hardware CSV');
  const lab = await download('Window labels');
  const html = lab.file ? fs.readFileSync(lab.file, 'utf8') : '';
  ok(/<svg/.test(html) && /Bar 1, cut 1/.test(html), 'EXPORT: the labels, in sawing order');
  if (lab.file) {
    const p2 = await ctx.newPage();
    await p2.goto('file://' + lab.file);
    await p2.waitForTimeout(300);
    await p2.screenshot({ path: path.join(SHOTS, 'windows-03-labels.png'), clip: { x: 0, y: 0, width: 820, height: 560 } });
    await p2.close();
  }

  const [sv] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(SHOTS, 'saved-' + sv.suggestedFilename());
  await sv.saveAs(saved);
  ok(/\.dwg$/.test(saved) && fs.statSync(saved).size > 1000, 'Ctrl+S saves a DWG', path.basename(saved));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('windows', false));
  await page.waitForTimeout(300);
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction((f) => window.cadcraft.doc.meta.source === f && window.cadcraft.doc.model.size > 0, path.basename(saved), { timeout: 60000 });
  const plain = await page.evaluate(() => { const d = window.cadcraft.doc; const ins = d.all().filter((e) => e.type === 'insert' && e.xd && e.xd.CC_WINDOWS); return { n: ins.length, drawn: ins.every((e) => (d.blocks.get(e.block)?.entities.length || 0) > 0), known: ins.some((e) => !!window.ccAddons.kinds.info(e)) }; });
  ok(plain.n === 4 && plain.drawn && !plain.known, 'opened without the add-on: plain block references that draw, data kept', JSON.stringify(plain));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('windows', true));
  await page.waitForTimeout(500);
  ok((await kindsOf('win')).length === 4, 'switched on: the windows again');
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err.stack || err.message));
} finally {
  await browser.close();
  try { admin('down'); } catch { /* fine */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
