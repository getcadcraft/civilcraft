#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cadcraft.mjs — CadCraft's add-on API in the real page (0.4 part 2, A.3 / A.4 / W2.9; session addons).
 *
 *   node tools/addons-test/browser-cadcraft.mjs [--shots dir]      (run as root: Playwright + sudo -u www-data php)
 *
 * The fixture add-ons in tools/addons-test/cadcraft/ are served as /lab/cadcraft's addons/ folder by request interception
 * (index.json and the fixture folders only; CadCraft's own addons/*.js come from the server). Checks: CadCraft starts its own
 * loader (no shell boot), Settings › Add-ons lists the three fixtures with their states, the add-on's toolbar group in
 * CadCraft's look runs PIPE by a real click, its More menu and an item in Annotate › More, the right-panel section, the
 * Settings › CadCraft fieldset, the Properties panel section for a selected pipe, the object drawn on the canvas, switching
 * it off in Settings takes every part away (objects stay), on again brings them back, no console errors.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FIX = path.join(ROOT, 'tools/addons-test/cadcraft');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? args[args.indexOf('--shots') + 1] : path.join(ROOT, 'tmp/shots/addons-cadcraft');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((x) => path.join(cacheDir, build, x)).find((x) => fs.existsSync(x));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());
const { cookie } = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()); });
  page.on('pageerror', (e) => problems.push(e.message));
  const FIXED = new Set(['index.json', ...fs.readdirSync(FIX).filter((d) => fs.statSync(path.join(FIX, d)).isDirectory())]);
  await page.route(/\/assets\/apps\/cadcraft\/dev\/addons\/([^?]+)(\?.*)?$/, async (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname.replace(/^.*\/dev\/addons\//, ''));
    if (!FIXED.has(rel.split('/')[0])) return route.continue();   // CadCraft's own addons/*.js
    const f = path.join(FIX, rel);
    if (!f.startsWith(FIX + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return route.fulfill({ status: 404, body: 'not found' });
    await route.fulfill({ status: 200, contentType: f.endsWith('.json') ? 'application/json' : 'text/javascript', body: fs.readFileSync(f) });
  });
  console.log('  … opening /lab/cadcraft'); await page.goto('https://getcadcraft.com/lab/cadcraft', { waitUntil: 'load', timeout: 30000 });
  await page.evaluate(() => { localStorage.removeItem('cc-addons:cadcraft'); });
  await page.reload({ waitUntil: 'load', timeout: 30000 }); console.log('  … reloaded');
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().length >= 3, null, { timeout: 15000 });

  await page.waitForFunction(() => window.ccAddons.list().every((a) => a.state !== 'ready'), null, { timeout: 15000 });
  const st = await page.evaluate(() => ({ list: window.ccAddons.list().map((a) => [a.id, a.state, a.reason]), shellBoot: !!document.getElementById('cc-addons'), api: !!globalThis.__testPipes }));
  const by = Object.fromEntries(st.list.map(([id, s, r]) => [id, { s, r }]));
  ok(!st.shellBoot, 'manifest "addons": "own": the shell\'s boot is not on the page');
  ok(by['test.pipes']?.s === 'active' && by['test.thief']?.s === 'failed' && by['test.newer']?.s === 'refused' && by['test.newer'].r === 'api-newer', 'CadCraft\'s own loader: pipes active, the thief switched off, the newer one refused', JSON.stringify(st.list));

  // toolbar group in CadCraft's look, runs PIPE by a real click
  const grp = await page.evaluate(() => {
    const g = document.querySelector('[data-addon-group="test.pipes:pipes"]');
    const b = g && g.querySelector('button[data-addon-tool="test.pipes:pipe"]');
    const first = document.querySelector('.cc-tools > .cc-tool-group');
    return g && b ? { cls: g.className, same: g.className === first.className, btn: b.className, label: b.textContent.trim(), cmd: b.dataset.cmd, groupLabel: g.getAttribute('aria-label') } : null;
  });
  ok(grp && grp.same && /\bcc-tool\b/.test(grp.btn) && grp.label === 'Pipe' && grp.cmd === 'PIPE' && grp.groupLabel === 'Pipe', 'the add-on\'s toolbar group looks like CadCraft\'s own', JSON.stringify(grp));
  await page.click('button[data-addon-tool="test.pipes:pipe"]');
  await page.waitForFunction(() => window.cadcraft.engine.running === 'PIPE');
  ok(await page.evaluate(() => document.querySelector('button[data-addon-tool="test.pipes:pipe"]').getAttribute('aria-pressed') === 'true'), 'clicking it runs PIPE, and the button shows it is running');
  await page.keyboard.type('0,0'); await page.keyboard.press('Enter');
  await page.keyboard.type('200,0'); await page.keyboard.press('Enter');
  await page.waitForFunction(() => !window.cadcraft.engine.running, null, { timeout: 8000 }).catch(async () => {
    const probe = page.evaluate(() => [window.cadcraft.engine.running, document.activeElement?.outerHTML.slice(0, 120), [...document.querySelectorAll('[data-history] li')].slice(-4).map((l) => l.textContent).join(' | ')].join(' :: '));
    console.log('  … still running: ' + await Promise.race([probe, new Promise((r) => setTimeout(() => r('FROZEN'), 3000))]));
    const cdp = await ctx.newCDPSession(page);
    const scripts = new Map();
    cdp.on('Debugger.scriptParsed', (ev) => scripts.set(ev.scriptId, ev.url));
    cdp.on('Debugger.paused', (ev) => { console.log('  PAUSED ' + ev.callFrames.slice(0, 12).map((f) => f.functionName + '@' + String(scripts.get(f.location.scriptId) || '').split('/').pop().split('?')[0] + ':' + (f.location.lineNumber + 1)).join(' < ')); cdp.send('Debugger.resume').catch(() => {}); });
    await cdp.send('Debugger.enable');
    for (let i = 0; i < 3; i++) { await cdp.send('Debugger.pause'); await new Promise((r) => setTimeout(r, 700)); }
    process.exit(3);
  });
  await page.evaluate(() => { window.cadcraft.engine.run('ZOOM'); });
  await page.keyboard.type('E'); await page.keyboard.press('Enter');
  const made = await page.evaluate(() => { const d = window.cadcraft.doc; const e = d.all().find((x) => x.type === 'insert'); return e ? { id: e.id, block: e.block, xd: Object.keys(e.xd || {}), n: d.blocks.get(e.block)?.entities.length } : null; });
  ok(made && made.xd.join() === 'CC_TEST_PIPES' && made.n === 3, 'typed points: a pipe object with its graphics block', JSON.stringify(made));
  // canvas: ink where the pipe is
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '01-pipe-paper.png') });

  // menus
  const menus = await page.evaluate(() => ({
    own: [...document.querySelectorAll('[data-addon-group="test.pipes:pipes"] details.cc-menu .cc-menu-list [role=menuitem]')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()),
    annotate: [...document.querySelectorAll('details[data-group-menu="Annotate"] .cc-menu-list [data-addon-item="test.pipes"]')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()),
  }));
  ok(menus.own.join() === 'Pipe run RUN' && menus.annotate.join() === 'Pipe PP', 'a More menu for its own group, and an item in Annotate › More', JSON.stringify(menus));
  await page.click('details[data-group-menu="Annotate"] > summary');
  await page.click('details[data-group-menu="Annotate"] [data-addon-item="test.pipes"]');
  await page.waitForFunction(() => window.cadcraft.engine.running === 'PIPE');
  ok(await page.evaluate(() => !document.querySelector('details[data-group-menu="Annotate"]').open), 'the menu item runs PIPE and closes the menu');
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !window.cadcraft.engine.running);

  // right panel section, Properties section
  ok(await page.evaluate(() => /Pipes in this drawing/.test(document.querySelector('.cc-right [data-addon-section="test.pipes:pipes"]')?.textContent || '')), 'its section in the right panel');
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), made.id);
  await page.waitForTimeout(400);
  const propsText = await page.evaluate(() => document.querySelector('.cc-right').textContent.replace(/\s+/g, ' '));
  ok(/Pipe/.test(propsText) && /Label/.test(propsText), 'the Properties panel shows its section for a selected pipe', propsText.slice(0, 200));
  await page.screenshot({ path: path.join(SHOTS, '02-props.png') });
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));

  // Settings: CadCraft tab fieldset; General › Add-ons
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('dialog[open]');
  ok(await page.evaluate(() => !!document.querySelector('[data-settings-pane="app"] [data-addon-settings="test.pipes:pipes"] [data-pipes-setting]')), 'its fieldset in Settings › CadCraft');
  if (await page.$('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  const rows = await page.$$eval('[data-addons-set] [data-addon]', (n) => n.map((r) => [r.dataset.addon, r.dataset.state, r.textContent.replace(/\s+/g, ' ').trim()]));
  ok(rows.length === 3 && rows.some(([id, s, tx]) => id === 'test.pipes' && s === 'active' && /1\.2\.0/.test(tx)), 'Settings › General › Add-ons lists them', JSON.stringify(rows));
  await page.screenshot({ path: path.join(SHOTS, '03-settings.png') });
  // switch it off
  await page.click('[data-addon-toggle="test.pipes"]');
  await page.waitForFunction(() => document.querySelector('[data-addon="test.pipes"]').dataset.state === 'off');
  await page.keyboard.press('Escape');
  const off = await page.evaluate(() => ({
    group: !!document.querySelector('[data-addon-group="test.pipes:pipes"]'), items: document.querySelectorAll('[data-addon-item]').length,
    section: !!document.querySelector('[data-addon-section]'), fieldset: !!document.querySelector('[data-addon-settings]'),
    pipe: !!window.cadcraft.engine && !!(globalThis.__lookupPipe = null), objects: window.cadcraft.doc.all().filter((e) => e.type === 'insert').length,
  }));
  await page.evaluate(() => { window.cadcraft.engine.run('PIPE'); });
  const said = await page.evaluate(() => [...document.querySelectorAll('[data-history] li')].slice(-1)[0]?.textContent || '');
  ok(!off.group && !off.items && !off.section && !off.fieldset && /Unknown command "PIPE"/.test(said) && off.objects === 1, 'switched off: group, menu items, sections and PIPE gone; the pipe stays', JSON.stringify(off) + ' ' + said);
  // on again
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('dialog[open]');
  if (await page.$('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]');
  await page.click('[data-addon-toggle="test.pipes"]');
  await page.waitForFunction(() => document.querySelector('[data-addon="test.pipes"]').dataset.state === 'active');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => !!document.querySelector('[data-addon-group="test.pipes:pipes"]') && document.querySelectorAll('[data-addon-group="test.pipes:pipes"]').length === 1), 'on again: the group is back (once)');
  // model space screenshot
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; window.cadcraft.view.invalidate(true); });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '04-model.png') });
  await page.evaluate(() => localStorage.removeItem('cc-addons:cadcraft'));
  const unexpected = problems.filter((p) => !/404|Failed to load resource/.test(p));
  ok(!unexpected.length, 'no console errors', unexpected.slice(0, 3).join(' | '));
} finally {
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
