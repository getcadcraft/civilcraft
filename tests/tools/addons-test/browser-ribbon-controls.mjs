#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ribbon-controls.mjs — the ribbon's inline layer / colour / linetype / lineweight controls in /lab/cadcraft (0.8 RIBBON-COMPACT item 8, shell-08's ask; session cad-addons-08). Run as root: a signed-in session
 * is minted in-process by tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-pid.mjs).
 *
 *   node tools/addons-test/browser-ribbon-controls.mjs [--shots dir]     (shots default: tmp/shots/ribbon-controls)
 *
 * Drafting classic style: the Home tab shows the four controls; each writes through the code Properties uses and stays live when the state changes elsewhere.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/ribbon-controls'));
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
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' ' + (e.stack || '').split('\n').slice(0, 4).join(' / ')));
page.on('requestfailed', (r) => problems.push('requestfailed: ' + r.url()));
page.on('response', (r) => { if (r.status() >= 400) problems.push('http ' + r.status() + ' ' + r.url()); });

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
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccInput, null, { timeout: 15000 }).catch(async () => { console.log('  state: ' + JSON.stringify(await page.evaluate(() => ({ c: !!window.cadcraft, h: !!window.cadcraft?.host, i: !!window.ccInput })))); console.log(problems.join('\n')); });
  await page.evaluate(() => window.ccInput.setStyle('drafting'));
  await page.waitForSelector('[data-ribbon-control="layers"]', { timeout: 15000 });
  const names = await page.evaluate(() => window.ccInput.controlNames().sort().join());
  ok(names === 'color,layers,linetype,lineweight', 'the four controls are registered with the shell', names);
  ok((await page.$$('[data-ribbon-control]')).length === 4, 'the Home tab shows all four');
  await shot('ribbon-controls-01');
  // colour
  await page.selectOption('.cc-ribbon-color select', '1');
  ok(await page.evaluate(() => window.cadcraft.doc.current.color === 1), 'colour: new objects get colour 1');
  await page.selectOption('.cc-ribbon-lineweight select', '-3');
  ok(await page.evaluate(() => window.cadcraft.doc.current.lineweight === -3), 'lineweight: default (-3)');
  const lts = await page.$$eval('.cc-ribbon-linetype select option', (o) => o.map((x) => x.value));
  ok(lts.includes('') && lts.length > 3, 'linetype list starts with By layer', lts.join());
  await page.selectOption('.cc-ribbon-linetype select', lts.find((v) => v && v !== 'ByBlock' && v.toUpperCase() !== 'CONTINUOUS') || lts[2]);
  ok(await page.evaluate(() => !!window.cadcraft.doc.current.linetype), 'linetype set');
  // layers: make a layer, pick it, switch it off / freeze / lock through the buttons, undo
  await page.evaluate(() => { const d = window.cadcraft.doc; d.setLayer('RB-TEST', { color: 3 }, { current: false }); });
  await page.waitForTimeout(300);
  await page.selectOption('.cc-ribbon-layers select', 'RB-TEST');
  ok(await page.evaluate(() => window.cadcraft.doc.current.layer === 'RB-TEST'), 'the layer list makes the layer current');
  const btn = (n) => page.locator('.cc-ribbon-layers .cc-ribbon-ctl-btn').nth(n);
  await btn(0).click(); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.cadcraft.doc.layers.get('RB-TEST').on === false), 'the light button turns the current layer off');
  ok((await btn(0).getAttribute('aria-pressed')) === 'false', 'and the button says so');
  await btn(0).click(); await page.waitForTimeout(200);
  await btn(1).click(); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.cadcraft.doc.layers.get('RB-TEST').frozen === true), 'the snowflake freezes it');
  await btn(2).click(); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.cadcraft.doc.layers.get('RB-TEST').locked === true), 'the lock locks it');
  await page.evaluate(() => window.cadcraft.doc.undo());
  await page.waitForTimeout(250);
  ok(await page.evaluate(() => window.cadcraft.doc.layers.get('RB-TEST').locked === false), 'undo takes the lock back (one undo step per click)');
  ok((await btn(2).getAttribute('aria-pressed')) === 'false', 'and the control follows');
  // live: change elsewhere
  await page.evaluate(() => { window.cadcraft.doc.setLayer('0', {}, { current: true }); });
  await page.waitForTimeout(300);
  ok((await page.$eval('.cc-ribbon-layers select', (s) => s.value)) === '0', 'a layer made current elsewhere shows in the control');
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
