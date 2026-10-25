#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-input.mjs — BimCraft's menu styles, keys and mouse (0.5 track IP.1; the shell's app-input-ui.js since IP.2) in the lab, headless, real clicks
 * and keys.   node tools/bimcraft-test/browser-input.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimmodel), as
 * browser-model.mjs does. Fails on any console error.
 *   CadCraft style = the toolbar as before; Settings is wider with the style cards; Home design (menu bar, its quick row,
 *   the app's own keys still work, Ctrl+L); BIM ribbon (tabs, two-letter keys, a moved key says where it went, middle
 *   pans the plan and right does not, the 3D viewer's buttons follow); Drafting classic (typed commands, Enter repeats,
 *   an unknown word); Customize (a key recorded by pressing it, a command moved to another menu, mouse wheel flipped) →
 *   "My Home design"; Export → Import; a damaged stored value is ignored.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimmodel'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1200 }, acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const statusOf = () => page.textContent('[data-status]');
const tool = () => page.evaluate(() => window.bimcraftPlan?.state?.tool);
const style = () => page.evaluate(() => window.ccInput.current().id);
const visible = (sel) => page.isVisible(sel);
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const openSettings = async () => { await page.keyboard.press('Control+Comma'); await page.waitForSelector('[data-app-settings][open]'); };
const closeSettings = async () => { await page.keyboard.press('Escape'); await page.waitForFunction(() => !document.querySelector('[data-app-settings]').open); };
const pickStyle = async (id) => { await openSettings(); await page.click(`[data-input-settings] input[value="${id}"]`, { force: true }); await closeSettings(); };
const pan = () => page.evaluate(() => [window.bimcraftPlan.view.cx, window.bimcraftPlan.view.cy]);
async function dragPlan(button) {
  const r = await page.evaluate(() => { const b = window.bimcraftPlan.view.canvas.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height * 0.6]; });
  await page.mouse.move(r[0], r[1]);
  await page.mouse.down({ button });
  await page.mouse.move(r[0] + 60, r[1] + 40, { steps: 6 });
  await page.mouse.up({ button });
}

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.setItem('bimcraft.input', '{"style":"nope","custom":[{"format":"cadcraft-input","version":1,"id":"<b>","name":"x"}],"tab":"x"}'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  ok(await style() === 'cadcraft', 'a damaged stored value is ignored: CadCraft style');

  console.log('== a new building, the CadCraft style');
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Input test');
  await page.fill('[data-new-levels]', '1');
  await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  ok(await visible('[data-toolbar] [data-view="iso"]') && !(await visible('[data-input-bar]')), 'CadCraft style: the toolbar as it was, no menu bar');
  await page.keyboard.press('w');
  ok(await tool() === 'wall', 'W = Wall (the app\'s own key)');
  await page.keyboard.press('Escape');

  console.log('== Settings: wider, the style cards');
  await openSettings();
  const w = await page.evaluate(() => document.querySelector('[data-app-settings]').getBoundingClientRect().width);
  ok(w > 700, 'Settings is wider with BimCraft\'s panel: ' + Math.round(w) + ' px');
  // since the 0.7 sections (app-shell.css § 0.7 sections) the dialog is two columns: the section list, then one section at a time
  const cols = await page.evaluate(() => ({ body: getComputedStyle(document.querySelector('[data-app-settings] .shell-dlg-body')).gridTemplateColumns.split(' ').length,
    nav: !!document.querySelector('[data-app-settings] .shell-sec-nav') }));
  ok(cols.body === 2 && cols.nav, 'BimCraft\'s settings: the section list beside the section ' + JSON.stringify(cols));
  ok((await page.$$('[data-input-settings] .cc-in-card')).length === 5, 'five style cards (Viewer since 0.5 IP.3)');
  await shot(page, 'in-01-settings');
  await page.click('[data-input-settings] input[value="home"]', { force: true });
  await closeSettings();

  console.log('== Home design');
  ok(await style() === 'home' && await visible('[data-input-bar] .cc-in-menus') && !(await visible('[data-toolbar] .bc-tool-row > [data-view="iso"]')), 'Home design: a menu bar instead of the toolbar buttons');
  const titles = await page.$$eval('[data-input-bar] .cc-in-menus > details > summary', (s) => s.map((x) => x.textContent));
  ok(titles.slice(0, 8).join() === 'File,Edit,Build,Library,3D,CAD,Tools,View', 'menus: ' + titles.join(', '));
  await page.waitForFunction(() => document.querySelector('[data-modelbar]').getBoundingClientRect().top >= document.querySelector('[data-toolbar]').getBoundingClientRect().bottom, null, { timeout: 3000 }).catch(() => {});   // the model bar follows the bar's height a frame later
  const mb = await page.evaluate(() => [document.querySelector('[data-toolbar]').getBoundingClientRect().bottom, document.querySelector('[data-modelbar]').getBoundingClientRect().top]);
  ok(mb[1] >= mb[0], 'the model bar still sits under the bar ' + JSON.stringify(mb));
  await page.click('[data-input-bar] summary:text("Build")');
  await shot(page, 'in-02-home-build');
  await page.click('[data-input-bar] [role="menuitem"][data-cmd="model.door"]');
  ok(await tool() === 'door' && !(await page.isVisible('[data-input-bar] details[open]')), 'Build › Door picks the Door tool and closes the menu');
  await page.click('[data-input-bar] .cc-in-quickbar [data-cmd="model.wall"]');
  ok(await tool() === 'wall' && await page.getAttribute('[data-input-bar] .cc-in-quickbar [data-cmd="model.wall"]', 'aria-pressed') === 'true', 'the quick row\'s Wall: Wall tool, shown pressed');
  await page.keyboard.press('Escape');
  await page.keyboard.press('n');
  ok(await tool() === 'window', 'N = Window (kept from the app\'s own keys)');
  await page.keyboard.press('Escape');
  await page.keyboard.press('F9');
  ok(await page.getAttribute('[data-model-toggle]', 'aria-pressed') === 'false', 'F9 = 3D view: Draw off, the model alone (a Home design key)');
  await page.keyboard.press('F11');
  ok(await page.getAttribute('[data-model-toggle]', 'aria-pressed') === 'true' && await page.getAttribute('[data-model-layout="split"]', 'aria-pressed') === 'true', 'F11 = plan and 3D: Draw comes back on by itself');

  console.log('== BIM ribbon');
  await pickStyle('ribbon');
  ok(await visible('[data-input-bar] .cc-in-tabs') && (await page.$$eval('[data-input-bar] [role="tab"]', (b) => b.map((x) => x.textContent))).join() === 'Architecture,Insert,Annotate,Modify,View,Output', 'ribbon tabs');
  await shot(page, 'in-03-ribbon');
  await page.keyboard.press('w'); await page.keyboard.press('a');
  ok(await tool() === 'wall', 'W then A = Wall');
  await page.keyboard.press('Escape');
  await page.keyboard.press('x');
  ok(/Section is SC/.test(await statusOf()), 'X (the app\'s Section key) says where Section went: ' + await statusOf());
  await page.keyboard.press('d'); await page.keyboard.press('r');
  ok(await tool() === 'door', 'D then R = Door');
  await page.keyboard.press('Escape');
  await page.click('[data-input-bar] [role="tab"]:text("View")');
  ok(await visible('[data-input-bar] .cc-in-panel[aria-label="Visibility"]'), 'the View tab shows its panels');
  await page.click('[data-input-bar] [role="tab"]:text("Architecture")');
  const btns = await page.evaluate(() => window.bimcraftPlan ? document.querySelector('[data-canvas]').viewer?.controls.mouseButtons : null);
  ok(btns && btns.LEFT === -1 && btns.MIDDLE === 2 && btns.RIGHT === -1, '3D viewer: middle pans, left and right do nothing (Shift + middle orbits)');
  let p0 = await pan(); await dragPlan('right');
  ok(JSON.stringify(await pan()) === JSON.stringify(p0), 'plan: a right drag does not pan in BIM ribbon');
  p0 = await pan(); await dragPlan('middle');
  ok(JSON.stringify(await pan()) !== JSON.stringify(p0), 'plan: a middle drag pans');

  console.log('== Drafting classic');
  await pickStyle('drafting');
  ok(await visible('[data-input-cmdline]'), 'a command line');
  await page.keyboard.type('window');
  await page.keyboard.press('Enter');
  ok(await tool() === 'window', 'typed WINDOW = Window');
  await page.keyboard.press('Escape');
  await page.click('[data-plan-canvas]', { position: { x: 120, y: 700 } });
  await page.keyboard.press('Escape');
  await page.focus('[data-input-cmdline]');
  await page.keyboard.press('Enter');
  ok(await tool() === 'window', 'Enter on nothing repeats the last command');
  await page.keyboard.press('Escape');
  await page.keyboard.type('flurb');
  await page.keyboard.press('Enter');
  ok(/Unknown command "FLURB"/.test(await page.textContent('.cc-in-cmdmsg')), 'an unknown word is said so');
  await shot(page, 'in-04-drafting');

  console.log('== Customize → My Home design, export, import');
  await pickStyle('home');
  await openSettings();
  await page.click('[data-input-settings] button:text("Customize…")');
  await page.waitForSelector('dialog.cc-in-dlg[open]');
  await page.fill('.cc-in-dlg input[type="search"]', 'roof');
  await page.click('.cc-in-dlg tbody tr:has-text("Roof") button:text("Add a key")');
  await page.keyboard.press('q');
  await page.waitForSelector('.cc-in-dlg tbody tr:has-text("Roof") .cc-in-chip:text-is("Q")');
  ok(true, 'Q recorded for Roof by pressing it');
  await page.selectOption('.cc-in-dlg tbody tr:has-text("Roof") select', { label: 'Tools' });
  await page.click('.cc-in-dlg [role="tab"]:text("Mouse")');
  await page.selectOption('.cc-in-dlg .cc-in-mouse select >> nth=0', '-1');
  await shot(page, 'in-05-customize');
  await page.click('.cc-in-dlg button:text("Save")');
  await page.waitForFunction(() => !document.querySelector('dialog.cc-in-dlg'));
  ok((await page.$$('[data-input-settings] .cc-in-card')).length === 6 && /My Home design/.test(await page.textContent('[data-input-settings] .cc-in-card:has(input:checked)')), 'saved as "My Home design", picked');
  await closeSettings();
  await page.keyboard.press('q');
  ok(await tool() === 'roof', 'Q = Roof');
  await page.keyboard.press('Escape');
  await page.click('[data-input-bar] summary:text("Tools")');
  ok(await visible('[data-input-bar] details[open] [data-cmd="model.roof"]'), 'Roof is in the Tools menu now');
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.controls.zoomSpeed > 0 && document.querySelector('[data-canvas]').viewer._wheelFlip === true), 'the wheel is turned round in 3D (pinch stays as it is)');
  await openSettings();
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-input-settings] button:text("Export")')]);
  const file = path.join(REPO, 'tmp', 'bimcraft-input-export.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await dl.saveAs(file);
  const exp = JSON.parse(fs.readFileSync(file, 'utf8'));
  ok(exp.format === 'cadcraft-input' && exp.base === 'home' && exp.keys['model.roof'].includes('Q') && exp.mouse.wheel === -1, 'Export: a cadcraft-input file with the key, the menu and the mouse');
  exp.name = 'Shared style'; exp.keys['nope.cmd'] = ['Z']; exp.keys['model.floor'] = ['Ctrl+Nope'];
  fs.writeFileSync(file, JSON.stringify(exp));
  await page.setInputFiles('[data-input-settings] input[type="file"]', file);
  await page.waitForFunction(() => /Shared style/.test(document.querySelector('[data-status]').textContent));
  ok(/2 things in it were left out/.test(await statusOf()) && await style() !== 'home', 'Import: added, the unknown command and the bad key left out — ' + await statusOf());
  await page.click('[data-input-settings] button:text("Delete this style")');
  ok((await page.$$('[data-input-settings] .cc-in-card')).length === 6, 'Delete this style');
  await page.click('[data-input-settings] input[value="cadcraft"]', { force: true });
  await closeSettings();
  ok(await visible('[data-toolbar] [data-view="iso"]') && !(await visible('[data-input-bar]')), 'back to CadCraft: the toolbar as it was');
  ok(await page.evaluate(() => { const c = document.querySelector('[data-canvas]').viewer.controls.mouseButtons; return c.LEFT === 0 && c.MIDDLE === 1 && c.RIGHT === 2; }), '3D viewer: its own buttons again');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  await shot(page, 'in-error');
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimmodel'], { stdio: 'ignore' }); } catch (e) { /* the session ends anyway */ }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
