#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-workspace.mjs — the workspace layouts in BimCraft's lab build (2026-10-24; map docs/apps/bimcraft-workspace.md):
 * the standard layout unchanged, Settings › Global › Layout › Workspace (standard / docked / toolbox), the docked ribbon and
 * palettes (Doc's F28) running BimCraft's own tools (engine.js), a tool's options in the options bar, Esc ending a tool, the
 * Model palette, the right panel docked, and the way back. Run as root (Playwright, the bimres test admin).
 *   node tools/bimcraft-test/browser-workspace.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path';
const si = process.argv.indexOf('--shots'), SH = si > 0 ? process.argv[si + 1] : null;
if (SH) fs.mkdirSync(SH, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };
const shot = async (name) => { if (SH) await page.screenshot({ path: path.join(SH, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = '/root/.cache/ms-playwright';
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', '/var/www/CADCRAFT/getcadcraft.com/tools/cadcraft-test/admin.php', 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage(); const problems = [];
page.on('pageerror', (e) => problems.push('pageerror ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') problems.push('console ' + m.text()); });

const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 60000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
await page.goto('https://getcadcraft.com/lab/bimcraft', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('cc-workspace'); } catch (e) {} });
await page.reload({ waitUntil: 'networkidle' });
ok(!(await page.evaluate(() => document.querySelector('.bc').classList.contains('ws-active'))) && !(await page.$('[data-ws-launch]')), 'the standard layout by default, no extra button in the app bar');
await shot('1-standard-empty');
// a building in the standard layout
await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new');
await page.fill('[data-new-name]', 'WS check'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '2700 mm');
await page.click('[data-new-ok]'); await waitStatus(/^New building WS check/); await page.waitForSelector('[data-plan-wrap]:not([hidden])');
await page.click('[data-mtool="wall"]'); await page.click('[data-model-fit]');
for (const [x, y] of [[0, 0], [8000, 0], [8000, 6000], [0, 6000], [0, 0]]) await planClick(x, y);
await settled(); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
ok((await page.evaluate(() => window.bimcraftPlan.state.data.walls.length)) === 4, 'four walls drawn in the standard layout');
// Settings › Global › Layout › Workspace
await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
await page.click('[data-settings-tab="general"]').catch(() => {});
const radios = await page.$$eval('input[name="workspace"]', (r) => r.map((x) => x.value + (x.disabled ? '(off)' : '') + (x.checked ? '*' : '')));
ok(radios.join(' ') === 'standard* docked toolbox', 'Settings › Global › Layout: Workspace standard (picked), docked, toolbox', radios.join(' '));
await page.locator('input[name="workspace"][value="docked"]').scrollIntoViewIfNeeded();
await shot('2-settings');
await page.check('input[name="workspace"][value="docked"]');
await page.keyboard.press('Escape'); await page.waitForTimeout(800);
ok(await page.evaluate(() => document.querySelector('.bc').classList.contains('ws-active') && localStorage.getItem('cc-workspace') === 'docked'), 'picking Docked switches the layout at once and remembers it for every app');
await shot('3-docked');
ok(await page.evaluate(() => !!document.querySelector('.ws-brand .app-bar-mark svg') && !!document.querySelector('.ws-brand .layer-swatch')), 'our logo in the title bar: the mark and the layer swatch, as in the app bar');
ok(await page.evaluate(() => { const f = getComputedStyle(document.querySelector('.ws-ribbon-tabs [aria-selected="true"]')).backgroundColor, l = getComputedStyle(document.querySelector('.ws-brand .layer-swatch')).backgroundColor, file = getComputedStyle(document.querySelector('.ws-file-tab')).backgroundColor; return f === l && file !== l && /Archivo/.test(getComputedStyle(document.querySelector('.ws-ribbon-tabs')).fontFamily); }), 'colours and type from our theme: the open tab lit in the app\'s layer colour (File is not), Archivo');
const tabsNow = await page.$$eval('[data-ws-tab]', (b) => b.map((x) => x.dataset.wsTab));
ok(tabsNow.includes('architecture') && tabsNow.includes('systems') && !tabsNow.includes('steel') && !tabsNow.includes('precast'), 'ribbon tabs: the ones with a tool BimCraft has (no Steel, no Precast)', tabsNow.join(' '));
const on = await page.$$eval('.ws-ribbon [data-ws-command][aria-disabled="false"]', (b) => b.map((x) => x.dataset.wsCommand));
ok(['door', 'window', 'column', 'roof', 'ceiling', 'floor', 'stair', 'railing', 'grid'].every((k) => on.includes(k)), 'Architecture: our tools are live in the ribbon', on.join(' '));
ok(await page.$eval('.ws-ribbon [data-ws-command="curtain"]', (b) => b.getAttribute('aria-disabled') === 'true' && /Not built/.test(b.title)), 'a tool BimCraft lacks is greyed and says so');
// open the floor plan, then the Roof tool from the ribbon
await page.click('.ws-ribbon [data-ws-command="roof"]'); await page.waitForTimeout(1200);
ok((await page.evaluate(() => window.bimcraftPlan.state.tool)) === 'roof' && await page.evaluate(() => !!document.querySelector('[data-ws-tool-options] [data-mopts="roof"]:not([hidden])')), 'Roof from the ribbon: our Roof tool, with its pitch / overhang / ends row in the options bar');
await shot('4-roof-tool');
const [rx, ry] = await at(4000, 3000); await page.mouse.move(rx, ry, { steps: 3 }); await page.mouse.click(rx, ry); await settled();
ok((await page.evaluate(() => window.bimcraftPlan.state.data.derived.roofs.length)) === 1, 'a click in the building places the roof');
await page.keyboard.press('Escape'); await page.waitForTimeout(500);
ok((await page.evaluate(() => window.bimcraftPlan.state.tool)) === 'select' && await page.evaluate(() => !!document.querySelector('[data-modelbar] [data-mopts="roof"]')), 'Esc ends the tool and its row goes back to the model bar');
// lower palette: Model tab; right panel tabs
await page.click('[data-ws-lower="model"]'); await page.waitForTimeout(300);
await shot('5-model-palette');
ok(await page.evaluate(() => !!document.querySelector('[data-ws-model-scroll] [data-file]') && !document.querySelector('[data-ws-model-scroll]').hidden && !!document.querySelector('.bc-left > .ws-palettes') && !!document.querySelector('.bc-left > .shell-grip')), 'the palettes are the left panel\'s content (its grip kept); the Model palette holds its own content');
ok(await page.evaluate(() => { const r = document.querySelector('.bc-right'); return !!r && r.getBoundingClientRect().width > 50 && document.querySelector('.bc-right [data-rtab][aria-selected="true"]')?.dataset.rtab !== 'props'; }), 'the right panel is docked on the right, on a tab other than Properties');
// 3D tab
await page.click('[data-ws-drawing^="3d"]').catch(() => {}); await page.waitForTimeout(800);
await shot('6-3d');
// every panel keeps the panel manager's features (owner 2026-10-24: "this must be maintained", "same with all panels")
ok(await page.evaluate(() => [...document.querySelectorAll('.bc-left > .shell-grip, .bc-right > .shell-grip')].length === 2 && [...document.querySelectorAll('.shell-grip')].every((g) => g.getBoundingClientRect().height > 0) && /Properties/.test(document.querySelector('.bc-left .shell-grip-name')?.textContent || '')),
  'both panels keep their grips; the left one is named for the palettes it holds');
await page.evaluate(() => { window.ccShellPanels.move('right', 'float'); window.ccShellPanels.move('left', 'right'); }); await page.waitForTimeout(600);
ok(await page.evaluate(() => window.ccShellPanels.panels().map((p) => p.dock).join() === 'right,float' && document.body.classList.contains('has-live-workspace') && document.querySelector('.bc-right').getBoundingClientRect().width > 50),
  'the right panel floats and the palettes dock on the right, with the ribbon layout still on');
await page.evaluate(() => window.ccShellPanels.reset()); await page.waitForTimeout(400);
const [pop] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.evaluate(() => window.ccShellPanels.openWindow(['left']))]);
await pop.waitForTimeout(1200);
await pop.click('[data-ws-lower="model"]'); await pop.waitForTimeout(300);
ok(await pop.evaluate(() => !!document.querySelector('.ws-palettes .ws-properties') && !document.querySelector('[data-ws-model-scroll]').hidden), 'Move to a new window: the palettes go with their panel and their tabs work there');
await page.evaluate(() => window.ccShellPanels.closeWindow(1)); await page.waitForTimeout(600);
ok(await page.evaluate(() => !!document.querySelector('.bc-left > .ws-palettes') && window.ccShellPanels.panels()[0].dock === 'left' && !window.ccShellPanels.panels()[0].inWindow), 'closing the window docks the palettes back');
await page.click('[data-ws-lower="browser"]');
// the ribbon in its own window (owner 2026-10-24), a tool used from there, and back
await page.click('.ws-ribbon-tabs [data-ws-ribbon-menu]');
ok(await page.evaluate(() => !!document.querySelector('.ws-ribbon-tabs [data-ws-ribbon-menu] .bi-three-dots') && /new window/i.test(document.querySelector('.shell-panel-menu [role="menuitem"]')?.textContent || '')), 'the ribbon has the panels\' "…" menu with Move to a new window');
const [rw] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.click('.shell-panel-menu [role="menuitem"]')]);
await rw.waitForTimeout(1200);
ok(await rw.evaluate(() => !!document.querySelector('.ws-ribbon [data-ws-command="roof"]') && document.body.classList.contains('has-live-workspace')) && !(await page.$('.ws-top .ws-ribbon')),
  'the ribbon tears off into its own window (tabs and tools move there, styled as at home)');
await rw.click('.ws-ribbon [data-ws-command="roof"]'); await page.waitForTimeout(1000);
ok((await page.evaluate(() => window.bimcraftPlan.state.tool)) === 'roof', 'a tool clicked in the ribbon\'s window runs in the main window');
await rw.keyboard.press('Escape'); await page.waitForTimeout(400);
ok((await page.evaluate(() => window.bimcraftPlan.state.tool)) === 'select', 'Esc in the ribbon\'s window ends the tool');
await rw.click('[data-ws-ribbon-menu]'); await rw.click('.shell-panel-menu [role="menuitem"]'); await page.waitForTimeout(600);
ok(await page.evaluate(() => !!document.querySelector('.ws-top .ws-ribbon [data-ws-command="roof"]')) && rw.isClosed(), 'Put the ribbon back: home again, its window closed');
// icons only compacts the ribbon
const tall = await page.evaluate(() => document.querySelector('.ws-ribbon').getBoundingClientRect().height);
await page.evaluate(() => { document.body.setAttribute('data-shell-tb', 'icons'); }); await page.waitForTimeout(200);
const short = await page.evaluate(() => document.querySelector('.ws-ribbon').getBoundingClientRect().height);
await shot('9-icons');
ok(short < tall * 0.7, 'icons only compacts the ribbon', Math.round(tall) + ' → ' + Math.round(short) + ' px');
await page.evaluate(() => { document.body.setAttribute('data-shell-tb', 'both'); });
// the ribbon layout's styles stay in its own chrome: the Settings dialog keeps its boxed buttons (owner 2026-10-24)
await page.evaluate(() => document.querySelector('[data-settings-open]').click()); await page.waitForSelector('dialog[data-app-settings][open]');
ok(await page.evaluate(() => [...document.querySelectorAll('dialog[data-app-settings] .shell-dlg-foot button')].every((b) => { const c = getComputedStyle(b); return parseFloat(c.borderTopWidth) > 0 && c.borderTopColor !== 'rgba(0, 0, 0, 0)'; })),
  'the Settings dialog\'s buttons keep their boxes in the ribbon layout');
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await page.click('[data-ws-tab="view"]'); await page.waitForTimeout(200);
await page.click('.ws-ribbon [data-ws-command="rcp"]'); await page.waitForTimeout(700);
ok(await page.evaluate(() => document.querySelector('[data-model-viewkind]').value === 'rcp'), 'Reflected Ceiling Plan in the ribbon: the level\'s ceiling plan (the app\'s own plan kind)');
await page.evaluate(() => { const s = document.querySelector('[data-model-viewkind]'); s.value = 'plan'; s.dispatchEvent(new Event('change', { bubbles: true })); });
await page.click('[data-ws-tab="architecture"]'); await page.waitForTimeout(200);
// full screen from the title bar, and the auto-hide ribbon (owner 2026-10-24)
ok(await page.evaluate(() => !!document.querySelector('.ws-titlebar [data-ws-shell="[data-fs-cycle]"]:not([hidden])')), 'the title bar has the full-screen button');
await page.click('.ws-titlebar [data-ws-shell="[data-fs-cycle]"]'); await page.waitForTimeout(400);
ok((await page.evaluate(() => window.ccShellScreen.mode())) !== 'normal', 'it switches the screen mode, as the app bar\'s button does');
await page.evaluate(() => window.ccShellScreen.goTo('normal')); await page.waitForTimeout(300);
await page.click('.ws-ribbon-tabs [data-ws-ribbon-menu]'); await page.click('.shell-panel-menu [role="menuitem"]:has-text("Collapse")'); await page.waitForTimeout(300);
ok(await page.evaluate(() => getComputedStyle(document.querySelector('.ws-ribbon')).display === 'none'), '"…" › Collapse the ribbon: only the tab names stay');
await page.click('[data-ws-tab="architecture"]'); await page.waitForTimeout(300);
ok(await page.evaluate(() => getComputedStyle(document.querySelector('.ws-ribbon')).position === 'absolute' && getComputedStyle(document.querySelector('.ws-ribbon')).display !== 'none'), 'a tab click shows its tools over the drawing');
await page.click('.ws-ribbon [data-ws-command="roof"]'); await page.waitForTimeout(500);
ok((await page.evaluate(() => window.bimcraftPlan.state.tool)) === 'roof' && await page.evaluate(() => getComputedStyle(document.querySelector('.ws-ribbon')).display === 'none'), 'a tool picked there runs, and the ribbon folds away again');
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await page.dblclick('[data-ws-tab="architecture"]'); await page.waitForTimeout(300);
ok(await page.evaluate(() => getComputedStyle(document.querySelector('.ws-ribbon')).display !== 'none' && getComputedStyle(document.querySelector('.ws-ribbon')).position !== 'absolute'), 'a double-click on a tab keeps the ribbon open again');
// a drawing opens inside the ribbon layout (owner 2026-10-24: it used to switch back to CadCraft classic)
await page.setInputFiles('[data-file]', path.join(path.dirname(new URL(import.meta.url).pathname), '../../fixtures/dwg/kitchen-equipment.dwg'));
const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 2500 }).catch(() => null);   // the building drawn above is unsaved
if (asked) await asked.click();
await page.waitForFunction(() => /Opened kitchen-equipment/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
await page.waitForTimeout(800);
await shot('8-dwg');
ok(await page.evaluate(() => document.querySelector('.bc').classList.contains('ws-active') && document.querySelector('.bc').classList.contains('ws-other') && /kitchen-equipment\.dwg/.test(document.querySelector('.ws-project').textContent) && !!document.querySelector('[data-ws-properties-scroll] [data-props]')),
  'a DWG opens inside the ribbon layout: its own tabs in the view, its name in the title bar, its properties in the palette');
// back to the standard layout from the title bar
ok(await page.evaluate(() => [...document.querySelectorAll('.ws-ribbon .ws-group')].every((g) => { const t = g.querySelector('.ws-group-title'); return !t || t.scrollWidth <= t.clientWidth + 1; })), 'every group is as wide as its name (no name runs into the next group)');
ok(!(await page.$('[data-ws-fallback]')) && await page.evaluate(() => !/[⌄]/.test(document.querySelector('.ws-ribbon').innerText) && [...document.querySelectorAll('.ws-group-title')].every((g) => getComputedStyle(g, '::after').content === 'none' || getComputedStyle(g, '::after').content === 'normal')),
  'no layout button in the title bar (the choice is in Settings) and no marks after the group names');
await page.evaluate(() => document.querySelector('[data-settings-open]').click()); await page.waitForSelector('dialog[data-app-settings][open]');
await page.click('[data-settings-tab="general"]').catch(() => {});
await page.check('input[name="workspace"][value="standard"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(800);
ok(await page.evaluate(() => !document.querySelector('.bc').classList.contains('ws-active') && localStorage.getItem('cc-workspace') === null && document.querySelector('.bc-left')?.parentElement?.classList.contains('bc') && document.querySelector('.bc-right [data-rtab="props"]')?.getAttribute('aria-selected') === 'true'), 'Settings › CadCraft classic: back to the toolbar and panels, every panel in its place, the choice cleared');
await shot('7-standard-again');
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
