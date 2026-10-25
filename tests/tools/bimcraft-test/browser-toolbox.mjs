#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-toolbox.mjs — the "Toolbox and info box" workspace in BimCraft's lab build (2026-10-24; workspace/toolbox.js; map
 * docs/apps/bimcraft-workspace.md): the Settings choice, the toolbox running the app's own Draw tools (walls and a roof really
 * drawn), the info box following the tool and the selection, the view tabs, the quick bar, the toolbar styles, the toolbox in its own
 * window, the panels still movable, a DWG staying in the layout, and the way back; since the Discord ask of 2026-10-24 (0.7 WS.19–WS.23) also
 * the navigator on the right, the quick bar's view settings, the picked element's fields in the info box, the edit palette and My tools. Run as root (Playwright, the bimres test admin).
 *   node tools/bimcraft-test/browser-toolbox.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const si = process.argv.indexOf('--shots'), SH = si > 0 ? process.argv[si + 1] : null;
if (SH) fs.mkdirSync(SH, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + d + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimres'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1600, height: 950 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage(); const problems = [];
page.on('pageerror', (e) => problems.push('pageerror ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') problems.push('console ' + m.text()); });
const shot = async (n) => { if (SH) await page.screenshot({ path: path.join(SH, n + '.png') }); };
const waitStatus = (re) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout: 120000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 60000 });
const S = () => page.evaluate(() => window.bimcraftPlan.state.tool);

await page.goto('https://getcadcraft.com/lab/bimcraft', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('cc-workspace'); } catch (e) {} });
await page.reload({ waitUntil: 'networkidle' });
// the Settings choice
await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
await page.click('[data-settings-tab="general"]').catch(() => {});
ok(await page.isEnabled('input[name="workspace"][value="toolbox"]'), 'Settings › Global › Layout: "Toolbox and info box" can be picked in BimCraft');
await page.check('input[name="workspace"][value="toolbox"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(700);
ok(await page.evaluate(() => window.bimcraftToolbox?.active && localStorage.getItem('cc-workspace') === 'toolbox' && !document.body.classList.contains('has-live-workspace')), 'picking it switches at once (the ribbon layout stays off)');
// a building drawn with the toolbox
await page.click('.bc-left [data-new]'); await page.waitForSelector('dialog.bc-new'); await page.fill('[data-new-name]', 'Toolbox check'); await page.fill('[data-new-levels]', '2'); await page.click('[data-new-ok]');
await waitStatus(/^New building Toolbox check/); await page.waitForTimeout(1200);
ok(await page.evaluate(() => [...document.querySelectorAll('.tbx-tab')].map((t) => t.textContent.trim()).join('|')) === 'Level 1|Level 2|3D', 'view tabs: each level\'s floor plan and 3D');
ok(await page.evaluate(() => !!document.querySelector('.tbx-info [data-model-level]') && !!document.querySelector('.tbx-quick [data-model-layout="3d"]') && !!document.querySelector('.tbx-info [data-model-print]')),
  'the info box holds the level and the document controls, the quick bar plan / split / 3D — the app\'s own controls');
await page.click('[data-tbx-tool="wall"]'); await page.waitForTimeout(500);
ok((await S()) === 'wall' && await page.evaluate(() => !!document.querySelector('.tbx-info [data-mopts="wall"]:not([hidden])') && /Wall/.test(document.querySelector('.tbx-ig-tool .tbx-ig-title').textContent) && document.querySelector('[data-tbx-tool="wall"]').getAttribute('aria-pressed') === 'true'),
  'Wall in the toolbox: the app\'s Wall tool, its settings in the info box under its name, the tool shown pressed');
await page.click('[data-model-fit]').catch(() => {});
for (const [x, y] of [[0, 0], [8000, 0], [8000, 6000], [0, 6000], [0, 0]]) await planClick(x, y);
await settled(); await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
ok((await page.evaluate(() => window.bimcraftPlan.state.data.walls.length)) === 4, 'four walls drawn with it');
await page.click('[data-tbx-tool="roof"]'); await page.waitForTimeout(400);
const [rx, ry] = await at(4000, 3000); await page.mouse.move(rx, ry, { steps: 3 }); await page.mouse.click(rx, ry); await settled();
ok((await page.evaluate(() => window.bimcraftPlan.state.data.derived.roofs.length)) === 1, 'a roof from the toolbox');
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(300);   // the chain first if one is running, then the tool (as in CadCraft classic)
ok((await S()) === 'select' && await page.evaluate(() => !document.querySelector('.tbx-info [data-mopts="roof"]') && /Selection/.test(document.querySelector('.tbx-ig-tool .tbx-ig-title').textContent)), 'Esc ends the tool; the info box shows the selection again');
// 2026-10-24, Discord (Galax65, ravk): the navigator on the right, quick options, the picked element's fields, the edit palette, My tools
ok(await page.evaluate(() => !!document.querySelector('.bc-right .ws-palettes [data-ws-browser-scroll] [data-pb-sec]') && [...document.querySelectorAll('.bc-right [data-ws-lower]')].map((b) => b.dataset.wsLower).join() === 'properties,model'),
  'WS.19 the Project Browser is the navigator in the right panel, Properties and the right panel\'s own tabs under it');
ok(await page.evaluate(() => document.querySelector('.bc-right [data-ws-lower="model"]')?.textContent.trim() === 'More panels' && !!document.querySelector('.bc-right [data-ws-model-scroll] [data-rtab]')), 'the right panel\'s own tabs are one palette tab, named for that');
await page.evaluate(() => document.querySelector('.bc-right .ws-palette [data-ws-browser-3d]')?.closest('details')?.setAttribute('open', ''));
await page.click('.bc-right .ws-palette [data-ws-browser-3d]'); await page.waitForTimeout(600);
ok(await page.evaluate(() => document.querySelector('.tbx-tab[aria-selected="true"]')?.textContent.trim() === '3D'), 'the navigator\'s {3D} opens the 3D view');
await page.click('.bc-right .ws-palette [data-pb-plan]'); await page.waitForTimeout(800);
ok(await page.evaluate(() => /^Level/.test(document.querySelector('.tbx-tab[aria-selected="true"]')?.textContent.trim() || '')), 'a plan in the navigator opens that plan, as in classic');
await page.click('.tbx-tab:has-text("Level 1")'); await page.waitForTimeout(600);
await page.selectOption('.tbx-quick [data-ws-setting="scale"]', '100'); await page.waitForTimeout(600);
ok(await page.evaluate(() => document.querySelector('.tbx-quick [data-ws-setting="scale"]').value === '100' && !!document.querySelector('.tbx-quick [data-ws-setting="detail"]') && !!document.querySelector('.tbx-quick [data-model-layout="3d"]')),
  'WS.23 the quick bar sets the plan\'s scale and holds detail, view range, fit, plan / split / 3D and units');
await page.click('[data-model-fit]').catch(() => {});
await planClick(4000, 0); await page.waitForTimeout(700);
const picked = () => page.evaluate(() => !/^Nothing|^Open a file/.test(document.querySelector('.tbx-ig-tool .tbx-sel')?.textContent || ''));
ok(await picked(), 'a wall picked with a click');
const fields = await page.evaluate(() => [...document.querySelectorAll('.tbx-ig-tool .tbx-field')].map((f) => f.textContent.trim()));
ok(fields.length > 0, 'WS.20 the info box shows the picked element\'s main fields', fields.join(' | '));
ok(await page.evaluate(() => { const p = document.querySelector('.ws-pet'); return !!p && !p.hidden && !!p.querySelector('[data-ws-pet="edit.delete"]') && !!p.querySelector('[data-ws-props]'); }), 'WS.22 the edit palette comes by the pointer: Delete, Duplicate … and Properties');
await shot('1-picked');
const twin = await page.$('.tbx-ig-tool .tbx-field input[type="number"], .tbx-ig-tool .tbx-field input[type="text"]');
if (twin) {
  const sig = () => page.evaluate(() => JSON.stringify(window.bimcraftPlan.state.data.walls));
  const before = await sig();
  const v = await twin.inputValue(); await twin.fill(String((parseFloat(v) || 2000) + 100)); await twin.press('Enter'); await settled(); await page.waitForTimeout(500);
  ok((await sig()) !== before, 'a change in the info box goes through the app\'s own Properties field', v);
  await page.evaluate(() => document.activeElement?.blur()); await page.waitForTimeout(200);   // the browser's own change on blur must not commit it twice
  await page.keyboard.press('Control+z'); await settled(); await page.waitForTimeout(300);
  ok((await sig()) === before, 'one Undo takes that change back (one commit per change)');
} else ok(false, 'a typed field in the info box');
await page.mouse.click(5, 300).catch(() => {});
await planClick(4000, 0); await page.waitForTimeout(500);
await page.keyboard.press('Escape'); await page.waitForTimeout(300);
ok(await page.evaluate(() => document.querySelector('.ws-pet')?.hidden !== false), 'Esc puts the edit palette away');
await page.keyboard.press('Escape');
// My tools: an empty slot picks a tool; right-click adds one; both run the app's own tool
await page.evaluate(() => localStorage.removeItem('cc-ws-mytools:bimcraft'));
await page.click('[data-tbx-mine="0"]'); await page.waitForSelector('dialog.ws-mine-pick[open]');
await page.fill('dialog.ws-mine-pick input[type="search"]', 'Door'); await page.click('dialog.ws-mine-pick [data-mine-pick="tbx:door"]'); await page.waitForTimeout(300);
ok(await page.evaluate(() => !!document.querySelector('[data-tbx-mine="0"][data-mine-ref="tbx:door"]') && JSON.parse(localStorage.getItem('cc-ws-mytools:bimcraft'))[0] === 'tbx:door'), 'WS.21 an empty slot of My tools takes a tool (kept per app)');
await page.click('[data-tbx-group="design"] [data-tbx-tool="window"]', { button: 'right' }); await page.click('.ws-ctx-menu [role="menuitem"]'); await page.waitForTimeout(300);
ok(await page.evaluate(() => !!document.querySelector('[data-tbx-mine="1"][data-mine-ref="tbx:window"]')), 'right-click › Add to My tools fills the next slot');
await page.click('[data-tbx-mine="0"]'); await page.waitForTimeout(400);
ok((await S()) === 'door' && await page.evaluate(() => document.querySelector('[data-tbx-mine="0"]').getAttribute('aria-pressed') === 'true'), 'a tool in My tools runs the app\'s own tool and shows pressed');
await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
await page.click('[data-tbx-mine="2"]'); await page.waitForSelector('dialog.ws-mine-pick[open]');
const cmd = await page.evaluate(() => document.querySelector('dialog.ws-mine-pick [data-mine-pick^="cmd:"]')?.dataset.minePick || '');
ok(!!cmd, 'the slot picker also lists the app\'s other commands', cmd);
await page.keyboard.press('Escape'); await page.waitForTimeout(200);
await shot('1b-mytools');
await page.evaluate(() => localStorage.removeItem('cc-ws-mytools:bimcraft'));
await shot('1-toolbox');
await page.click('.tbx-tab:has-text("3D")'); await page.waitForTimeout(600);
ok(await page.evaluate(() => document.querySelector('.tbx-tab[aria-selected="true"]')?.textContent.trim() === '3D'), 'the 3D tab shows the model in 3D');
await page.click('.tbx-tab:has-text("Level 2")'); await page.waitForTimeout(600);
ok(await page.evaluate(() => document.querySelector('.tbx-tab[aria-selected="true"]')?.textContent.trim() === 'Level 2'), 'a level tab opens that floor plan');
// toolbar styles
await page.evaluate(() => document.body.setAttribute('data-shell-tb', 'icons')); await page.waitForTimeout(300);
const wIcons = await page.evaluate(() => document.querySelector('.tbx-toolbox').getBoundingClientRect().width);
await shot('2-icons');
await page.evaluate(() => document.body.setAttribute('data-shell-tb', 'both')); await page.waitForTimeout(300);
const wBoth = await page.evaluate(() => document.querySelector('.tbx-toolbox').getBoundingClientRect().width);
ok(wIcons < wBoth * 0.75, 'icons only: a narrow toolbox', Math.round(wBoth) + ' → ' + Math.round(wIcons) + ' px');
// the toolbox in its own window, used from there
await page.click('.tbx-head .ws-popout-menu');
const [tw] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.click('.shell-panel-menu [role="menuitem"]')]);
await tw.waitForTimeout(1200);
ok(await tw.evaluate(() => !!document.querySelector('.tbx-toolbox [data-tbx-tool="door"]')) && await page.evaluate(() => !document.querySelector('.bc-stage .tbx-toolbox')), 'the toolbox moves into its own window ("…" › Move to a new window)');
await tw.click('[data-tbx-tool="door"]'); await page.waitForTimeout(500);
ok((await S()) === 'door', 'a tool clicked in the toolbox\'s window runs in the main window');
await tw.keyboard.press('Escape'); await tw.keyboard.press('Escape'); await page.waitForTimeout(300);
ok((await S()) === 'select', 'Esc there ends it');
await tw.click('.tbx-head .ws-popout-menu'); await tw.click('.shell-panel-menu [role="menuitem"]'); await page.waitForTimeout(600);
ok(await page.evaluate(() => !!document.querySelector('.bc-stage .tbx-toolbox')) && tw.isClosed(), 'Put the toolbox back: home again, its window closed');
// the panels stay the app's panels
await page.evaluate(() => window.ccShellPanels.move('right', 'float')); await page.waitForTimeout(500);
ok(await page.evaluate(() => window.ccShellPanels.panels()[1].dock === 'float' && window.bimcraftToolbox.active), 'the panels keep their features (the right one floats) with the layout on');
await page.evaluate(() => window.ccShellPanels.reset()); await page.waitForTimeout(300);
// a drawing stays in the layout
await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg'));
const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 2500 }).catch(() => null);
if (asked) await asked.click();
await waitStatus(/Opened kitchen-equipment/); await page.waitForTimeout(800);
ok(await page.evaluate(() => window.bimcraftToolbox.active && document.querySelector('.bc-dwg').getBoundingClientRect().left >= document.querySelector('.tbx-toolbox').getBoundingClientRect().right - 1), 'a DWG opens inside the layout, beside the toolbox');
await shot('3-dwg');
// back to CadCraft classic
await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
await page.click('[data-settings-tab="general"]').catch(() => {});
await page.check('input[name="workspace"][value="standard"]'); await page.keyboard.press('Escape'); await page.waitForTimeout(600);
ok(await page.evaluate(() => !window.bimcraftToolbox.active && !document.querySelector('.tbx-toolbox') && !!document.querySelector('[data-modelbar] [data-model-level]') && !!document.querySelector('[data-toolbar] [data-model-layout="3d"]')),
  'CadCraft classic: every control back in its own place');
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
