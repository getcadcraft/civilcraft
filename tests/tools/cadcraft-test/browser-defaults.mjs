#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-defaults.mjs: 0.10 DP.1 Default Policies for CadCraft, in the real page (/lab/cadcraft, headless), session
 * `bk-defaults-10`.   node tools/cadcraft-test/browser-defaults.mjs   (run as root)
 *
 *   off   the add-on is bundled and off; policies left in storage change nothing: a new drawing is unitless, decimal with 4
 *         places, text 2.5, and a new sheet is on A3, as before
 *   on    switched on with policies set (in storage, then one through the real Settings control): the first empty drawing gets
 *         them when the add-on arrives, a new drawing tab gets them, a new sheet is on the policy's paper; Settings has the two
 *         sections; a drawing with something in it is not changed when a policy changes
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com', ID = 'default-policies', KEY = 'cc-default-policies';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' (' + (typeof x === 'string' ? x : JSON.stringify(x)) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bkdefaults'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const STORED = { format: KEY, version: 1, office: 'Test office', policies: { 'cadcraft.units': 'mm', 'cadcraft.length.precision': { metric: 1 }, 'cadcraft.length.format': { imperial: 'architectural' }, 'cadcraft.text.height': { metric: 3.5 }, 'cadcraft.sheet.paper': { metric: 'iso-a1' } } };
const state = () => { const d = window.cadcraft.doc; return { units: d.meta.units, lunits: d.meta.lunits ?? null, luprec: d.meta.luprec ?? null, text: d.current.textHeight, n: d.model.size, dirty: !!d.dirty, layouts: d.layouts.map((l) => l.paper.key) }; };
async function open({ on, stored }) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.setDefaultTimeout(20000);
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(([id, key, on, stored]) => { localStorage.setItem('cc-addons:cadcraft', JSON.stringify(on ? { off: {}, on: { [id]: true } } : { off: {}, on: {} })); if (stored) localStorage.setItem(key, JSON.stringify(stored)); else localStorage.removeItem(key); }, [ID, KEY, on, stored]);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction((id) => !!window.cadcraft && !!window.ccAddons?.list().find((x) => x.id === id), ID);
  if (on) await page.waitForFunction((id) => window.ccAddons.list().find((x) => x.id === id)?.state === 'active', ID);
  return { ctx, page, problems };
}
const noErrors = (problems) => { const real = problems.filter((p) => !/favicon|ERR_ABORTED|hardware/.test(p)); ok(!real.length, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : '')); };
try {
  console.log('== off: stored policies change nothing');
  {
    const { ctx, page, problems } = await open({ on: false, stored: STORED });
    const row = await page.evaluate((id) => { const a = window.ccAddons.list().find((x) => x.id === id); return { state: a.state, source: a.source }; }, ID);
    ok(row.state === 'off' && row.source === 'bundled', 'Default Policies is a bundled add-on that is off', row);
    const s = await page.evaluate(state);
    ok(s.units === '' && s.lunits === null && s.luprec === null && s.text === 2.5 && s.n === 0, 'the first drawing is as before: unitless, decimal with 4 places (nothing stored), text 2.5', s);
    await page.click('[data-cmd="LAYOUT"] >> visible=true'); await page.waitForTimeout(700);
    const s2 = await page.evaluate(state);
    ok(s2.layouts.join() === 'iso-a3', 'a new sheet is on A3, as before', s2);
    await page.click('[data-settings-open] >> visible=true').catch(() => {});
    const sec = await page.evaluate(() => ({ open: !!document.querySelector('dialog[data-app-settings][open]'), global: !!document.querySelector('[data-dp-global]'), app: !!document.querySelector('[data-dp-app]') }));
    ok(!sec.global && !sec.app, 'no Default Policies section in Settings', sec);
    noErrors(problems);
    await ctx.close();
  }
  console.log('== on: a new drawing starts the way the policies say');
  {
    const { ctx, page, problems } = await open({ on: true, stored: STORED });
    await page.waitForFunction(() => window.cadcraft.doc.meta.units === 'millimeters');
    let s = await page.evaluate(state);
    ok(s.units === 'millimeters' && s.luprec === 1 && s.lunits === null && s.text === 3.5 && s.n === 0 && !s.dirty, 'the first empty drawing gets them when the add-on arrives: millimeters, precision 1, text 3.5; the imperial format does not apply; it is not marked changed', s);
    await page.evaluate(() => window.cadcraft.host.tabs.add());
    await page.waitForTimeout(500);
    s = await page.evaluate(state);
    const tabs = await page.evaluate(() => window.cadcraft.host.tabs.list.length);
    ok(tabs === 2 && s.units === 'millimeters' && s.luprec === 1 && s.text === 3.5, 'a new drawing in a second tab starts the same way', [tabs, s]);
    await page.click('[data-cmd="LAYOUT"] >> visible=true'); await page.waitForTimeout(700);
    s = await page.evaluate(state);
    ok(s.layouts.join() === 'iso-a1', 'a new sheet is on A1, the policy\'s paper', s);
    // Settings: the two sections, and one policy changed with the real control
    await page.click('[data-settings-open] >> visible=true');
    await page.waitForSelector('dialog[data-app-settings][open]');
    const tab = await page.$('dialog[data-app-settings] [data-settings-tab="app"]'); if (tab) await tab.click();
    await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Default Policies") >> visible=true');
    await page.waitForSelector('[data-dp-app="cadcraft"] [data-dp="cadcraft.units"]', { state: 'visible' });
    const ui = await page.evaluate(() => { const fs = document.querySelector('[data-dp-app]'); return { rows: fs.querySelectorAll('[data-dp-row]').length, groups: [...fs.querySelectorAll('[data-dp-group]')].map((g) => g.textContent), lede: fs.querySelector('[data-dp-lede]').textContent, global: !!document.querySelector('[data-dp-global]'),
      units: fs.querySelector('[data-dp="cadcraft.units"]').value, papers: fs.querySelector('[data-dp="cadcraft.sheet.paper"][data-dp-system="metric"]').options.length, paper: fs.querySelector('[data-dp="cadcraft.sheet.paper"][data-dp-system="metric"]').value }; });
    ok(ui.rows === 5 && ui.groups.join() === 'Units,Text,First sheet' && ui.global && /not changed/.test(ui.lede), 'Settings › CadCraft › Default Policies: 5 policies (units, format, precision, text height, sheet paper), and the Global section is there', ui);
    ok(ui.units === 'mm' && ui.paper === 'iso-a1' && ui.papers > 10, 'the controls show what is set; the paper list is CadCraft\'s own papers', ui);
    await page.selectOption('[data-dp-app] [data-dp="cadcraft.units"]', 'm');
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)).policies['cadcraft.units'], KEY);
    ok(saved === 'm', 'changing Units of a new drawing to Meters is saved at once');
    await page.keyboard.press('Escape');
    await page.waitForSelector('dialog[data-app-settings][open]', { state: 'detached', timeout: 5000 }).catch(() => {});
    s = await page.evaluate(state);
    ok(s.units === 'millimeters' && s.layouts.length === 1, 'the drawing that already has a sheet keeps its millimeters (a started drawing is not changed)', s);
    await page.evaluate(() => window.cadcraft.host.tabs.add());
    await page.waitForTimeout(500);
    s = await page.evaluate(state);
    ok(s.units === 'meters' && s.luprec === 1, 'the next new drawing is in meters', s);
    await page.evaluate((id) => window.ccAddons.loader.setEnabled(id, false), ID);
    await page.waitForFunction((id) => window.ccAddons.list().find((x) => x.id === id)?.state === 'off', ID);
    await page.evaluate(() => window.cadcraft.host.tabs.add());
    await page.waitForTimeout(500);
    s = await page.evaluate(state);
    ok(s.units === '' && s.lunits === null && s.luprec === null, 'switched off again: the next new drawing is unitless with CadCraft\'s own format', s);
    noErrors(problems);
    await ctx.close();
  }
} catch (e) { ok(false, 'stopped: ' + (e.stack || e.message || e)); }
await browser.close();
try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bkdefaults'], { encoding: 'utf8' }); } catch (e) { /* stays for the next run */ }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
