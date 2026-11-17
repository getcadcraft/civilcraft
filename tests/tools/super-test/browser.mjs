// SPDX-License-Identifier: Apache-2.0
// Super 0.1 SC.2: the window in headless Chromium — workspaces, one selection across panels, tools greying with the view,
// tear off / group / split / dock (buttons and real drags), Find any tool, saving across a reload.
// No sign-in and no database: the page is rendered by tools/super-test/render.php and served here with the real /assets.
//   node tools/super-test/browser.mjs [--shots <dir>]
import fs from 'node:fs'; import path from 'node:path';
import { ROOT, start, launch } from './serve.mjs';
const shots = process.argv.includes('--shots') ? process.argv[process.argv.indexOf('--shots') + 1] : null;
if (shots) fs.mkdirSync(shots, { recursive: true });
const { url: URL0, missing, close } = await start();

let pass = 0, fail = 0;
let lastOk = ''; const ok = (c, m) => { lastOk = m; if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
/** Tear a panel off into a floating window: its tab's "…" menu (the old pop-out icon was replaced by the apps' menu). */
const tearOff = async name => { await page.click(`[aria-label="Options for ${name}"]`); await page.click('.shell-panel-menu [role="menuitem"]:has-text("Float in this window")'); };

const errors = [];
page.on('pageerror', e => errors.push(String(e.message) + ' [after check ' + (pass+fail) + ' ' + lastOk.slice(0,100) + ']' + (process.env.SC_STACK ? ' @ ' + String(e.stack).split('\n').slice(1,4).join(' ; ') : '')));
page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errors.push(m.text()); });   // /sw.js is the site's, not served here
const shot = async n => { if (shots) await page.screenshot({ path: path.join(shots, n + '.png') }); };
const S = () => page.evaluate(() => JSON.parse(JSON.stringify(window.superWindow.state)));
const visible = () => page.evaluate(() => window.superWindow.M.visible(window.superWindow.state));
// a workspace on the bar is one click on its tab; one that is not there yet (BK.77: the real window starts with Build only) is reached as a person does, More tools › its name
const ws = async id => { const tab = page.locator(`.sc-wstab[data-ws="${id}"]`);
  if (await tab.count() && await tab.first().isVisible()) await tab.first().click(); else { await page.click('[data-act="more-tools"]'); await page.click(`[data-scd-menu] [data-scd-ws="${id}"]`); }
  await openLeft(); };
// the window's own mechanics are tried over the demo views (four walls and a pad: one selection across panels, no app behind them)
// In a window of 1500 px and under the left zone (the tool sets) starts folded to a slim strip; one tap on the strip opens it, as a person does.
const openLeft = async () => { const b = await page.$('[data-act="fold-left"][aria-expanded="false"]'); if (b) await b.click(); };
const useDemo = async () => { await page.evaluate(() => { const w = window.superWindow; w.state = w.M.defaultState({ demo: true }); }); await openLeft(); };
// BK.77: the real window starts with Build only on the bar; the others are put there the way a person does (More tools › Show every workspace)
const showAll = async () => { if (await page.$('[data-act="more-tools"]') === null) return false; await page.click('[data-act="more-tools"]'); const all = await page.$('[data-scd-all]'); if (all) await all.click(); else await page.keyboard.press('Escape'); return !!all; };

await page.goto(URL0);
await page.waitForSelector('[data-sc-ready]');
await page.evaluate(() => window.superWindow.ready);
ok(true, 'page opens');
await useDemo();

/* the window */
{ const fit = await page.evaluate(() => { const b = document.querySelector('[data-panel="plan"]'), v = b.querySelector('svg.sc-svg'); if (!b || !v) return null; const rb = b.getBoundingClientRect(), rv = v.getBoundingClientRect(); return { w: rv.width / rb.width, h: rv.height / rb.height }; });
  ok(fit && fit.w > 0.9 && fit.h > 0.7, 'a demo view fills its panel instead of a fixed box: ' + JSON.stringify(fit)); }
const tabs = await page.$$eval('.sc-wstab', e => e.map(x => x.textContent));
ok(JSON.stringify(tabs) === JSON.stringify(['Layout and landscape', 'Build', 'Model', 'Report and price', 'Finalize and export']), 'the five workspaces in the bar (the demo arrangement keeps all five on it): ' + tabs);
const nTools = await page.evaluate(() => window.superWindow.catalog.tools.length);
ok(nTools > 500, 'the catalog holds the eight apps\' real tools: ' + nTools);
ok((await page.evaluate(() => window.superWindow.catalog.failed.length)) === 0, 'every app\'s registry loaded in the page');
ok((await page.$$('.sc-frame')).length >= 3, 'frames drawn');
ok(await page.$eval('[data-supercadcraft]', m => m.getBoundingClientRect().height > 400), 'the window fills the page');
await shot('01-layout');

/* workspaces change the panels, not the project */
await ws('build');
ok((await visible()).includes('tools-build') && !(await visible()).includes('tools-layout'), 'Build shows the Build tools');
ok((await page.$$('[data-panel="plan"]')).length === 1 && (await page.$$('[data-panel="model3d"]')).length === 1, 'Build shows the plan and the 3D view');

/* one selection across every panel */
await page.click('[data-panel="plan"] .sc-hit[data-id="W2"]', { force: true });
ok(await page.$eval('[data-panel="model3d"] .sc-wall3.is-sel', () => true).catch(() => false), 'a wall picked in the plan is picked in 3D');
ok((await page.textContent('[data-panel="props"]')).includes('East wall'), 'Properties shows it');
ok((await page.textContent('.sc-status')).includes('W2'), 'the status line says so');
await ws('report');
ok(await page.$eval('[data-panel="table"] tr[data-id="W2"].is-sel', () => true).catch(() => false), 'it is picked in the quantities table too (other workspace)');
await shot('02-report-selection');
await page.click('[data-panel="table"] tr[data-id="W4"]');
await ws('build');
ok(await page.$eval('[data-panel="plan"] .sc-wall.is-sel[data-id="W4"]', () => true).catch(() => false), 'and the table drives the plan');
await page.click('[data-panel="plan"] svg', { position: { x: 5, y: 5 } });
ok((await page.evaluate(() => window.superWindow.selection)) === null, 'a click on nothing clears it');

/* tools follow the view and the selection */
const pp = await page.evaluate(() => { const t = window.superWindow.catalog.tools.find(x => x.app === 'modelcraft' && /push|pull/.test(x.id)); return t && t.key; });
ok(!!pp, 'ModelCraft has a push/pull tool');
await page.click('[data-panel="plan"]', { position: { x: 5, y: 5 }, force: true });
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'cad', 'the plan (CadCraft\'s demo) is the active view');
let why = await page.evaluate(k => window.superWindow.reason(window.superWindow.catalog.tools.find(t => t.key === k)), pp);
ok(/needs the ModelCraft panel/.test(why || ''), 'push/pull on a plan says what it needs: ' + why);
await ws('model'); await page.click('[data-panel="model3d"]', { position: { x: 5, y: 5 }, force: true });
const offBefore = await page.$$eval('.sc-tool[aria-disabled="true"]', e => e.length);
// the 2D drawing's tools are Build's since the workspaces went by trade (owner 2026-10-24): the plan (CadCraft's demo) is there too
await ws('build'); await page.click('[data-panel="plan"]', { position: { x: 5, y: 5 }, force: true });
const off = await page.$$eval('.sc-tool', e => e.map(b => [b.getAttribute('aria-disabled'), b.title]));
ok(off.length > 10, 'Build tools list real tools: ' + off.length);
const delTool = await page.$eval('.sc-tool.is-off', b => b.title).catch(() => null);
ok(!!delTool && /needs/.test(delTool), 'a greyed tool says why in its title: ' + delTool);
await page.click('[data-panel="plan"] .sc-hit[data-id="W1"]', { force: true });
const offSel = await page.$$eval('.sc-tool.is-off', e => e.length);
await page.click('[data-panel="plan"] svg', { position: { x: 5, y: 5 } });
const offNone = await page.$$eval('.sc-tool.is-off', e => e.length);
ok(offNone > offSel, `picking a wall frees the tools that need a selection (${offNone} → ${offSel} greyed)`);
await shot('03-layout-tools');

/* the greyed tool stays reachable by keyboard and reports instead of running */
await page.focus('.sc-tool.is-off');
ok((await page.textContent('.sc-status')).includes('needs'), 'focusing a greyed tool shows its reason in the status line');
let ranEvent = false; await page.exposeFunction('sawTool', () => { ranEvent = true; });
await page.evaluate(() => document.querySelector('[data-supercadcraft]').addEventListener('super:tool', () => window.sawTool()));
await page.click('.sc-tool.is-off', { force: true });
ok(!ranEvent, 'a greyed tool does not run');
await page.click('.sc-tool:not(.is-off)');
ok(ranEvent, 'an available tool reports a click (the apps are mounted in SC.4)');

/* tear off, group, split, dock */
await ws('layout');
await tearOff('Properties');
ok((await S()).floats.length === 1, 'tear off makes a window');
ok((await page.$$('.sc-float [data-panel="props"]')).length === 1, 'Properties is in its own window');
await ws('finalize');
ok((await page.$$('.sc-float [data-panel="props"]')).length === 1, 'the window stays on screen in another workspace');
ok((await page.$$('.sc-frame [data-panel="props"]')).length === 0, 'and is not also docked');
await page.click('[data-act="panels"]');
await page.click('[data-act="tear-all"]');
ok((await S()).floats.filter(f => f.tabs.some(t => t.startsWith('tools-'))).length === 6, 'every tool set in its own window');
await shot('04-torn-off');
await page.locator('.sc-float').last().locator('[data-act="group"]').first().click();   // the window on top: the others are stacked under it
const grouped = (await S()).floats.find(f => f.tabs.length === 2);
ok(!!grouped, 'Group with … joins two windows as tabs');
await page.locator('.sc-float [data-act="split"]').dispatchEvent('click');
ok(!(await S()).floats.some(f => f.tabs.length > 1), 'Split this tab out separates them again');
await page.click('[data-act="panels"]'); await page.click('[data-act="dock-all"]');
ok((await S()).floats.length === 0, 'Dock every window again');
ok((await visible()).length === new Set(await visible()).size, 'nobody on screen twice');

/* real drags */
await ws('layout');
const planTab = page.locator('[data-panel-tab="plan"]'), siteTab = page.locator('[data-panel-tab="site"]');
ok(await planTab.count() === 1 && await siteTab.count() === 1, 'plan and site are tabs of one frame');
await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'props'); w.render(); });   // Layout lost Properties to the window earlier
await page.locator('[data-panel-tab="site"]').dragTo(page.locator('.sc-right .sc-frame .sc-tabs'));
let st = await S();
ok(st.workspaces.layout.docks.right[0].tabs.includes('site'), 'dragging a tab onto another frame groups it there');
await page.locator('[data-panel-tab="site"]').dragTo(page.locator('.sc-status'));
st = await S();
ok(st.floats.some(f => f.tabs.includes('site')), 'dragging a tab out of the docks tears it off');
const fl = page.locator('.sc-float .sc-ftitle');
const b0 = await fl.boundingBox();
await page.mouse.move(b0.x + b0.width - 8, b0.y + 6); await page.mouse.down(); await page.mouse.move(b0.x + 200, b0.y + 120, { steps: 6 }); await page.mouse.up();
const b1 = await fl.boundingBox();
ok(Math.abs(b1.x - b0.x) > 100, 'a window moves by its title bar');
await page.locator('.sc-float [data-panel-tab="site"]').dragTo(page.locator('.sc-center .sc-tabs').first());
st = await S();
ok(!st.floats.length && st.workspaces.layout.docks.center.some(f => f.tabs.includes('site')), 'dragging a window\'s tab onto a frame docks it');
await shot('05-dragged');

/* keyboard: tabs and workspace tabs */
await page.focus('.sc-wstab[aria-selected="true"]'); await page.keyboard.press('ArrowRight');
ok((await S()).active === 'build', 'arrow keys move between workspaces');
await ws('layout'); await page.focus('.sc-center [data-panel-tab="plan"]'); await page.keyboard.press('ArrowRight');
ok(await page.$eval('.sc-center [role=tab][aria-selected="true"]', b => /Site|Sheet/.test(b.textContent)), 'arrow keys move between tabs');

/* own workspace + Panels menu */
await page.evaluate(() => { window.prompt = () => 'Estimating'; });
await page.click('.sc-add');
ok((await page.$$eval('.sc-wstab', e => e.map(x => x.textContent))).includes('Estimating'), 'your own workspace appears in the bar');
await page.click('[data-act="panels"]'); await page.click('.sc-menu label:has-text("Quantities (demo)") input');
ok((await visible()).includes('table'), 'Panels menu adds any panel to any workspace');
await page.keyboard.press('Escape');

/* Find any tool: the bar's dialog, and the shell's Ctrl+K palette with every tool registered in it */
await page.click('[data-act="find"]');
await page.waitForSelector('dialog.sc-find[open]');
await page.fill('.sc-find-input', 'wall');
await page.waitForSelector('.sc-hit-row');
const rows = await page.$$eval('.sc-hit-row', e => e.map(r => r.textContent));
ok(rows.length > 0 && rows.some(r => /BimCraft/.test(r)), 'Find finds BimCraft\'s wall tools: ' + rows.length);
await page.fill('.sc-find-input', 'export');
await page.waitForFunction(() => document.querySelectorAll('.sc-hit-row').length > 20);
const apps = await page.$$eval('.sc-hit-row .sc-chip', e => [...new Set(e.map(x => x.textContent))]);
ok(apps.length >= 4, 'Find spans the apps: ' + apps.join(', '));
await shot('06-find');
await page.keyboard.press('Shift+Enter');
await page.waitForSelector('dialog.sc-find', { state: 'detached' });
ok(await page.$('.sc-tool.is-flash') !== null, 'Shift+Enter shows the tool in its tool set');
await page.click('[data-act="find"]'); await page.fill('.sc-find-input', 'zzzzqq');
ok((await page.textContent('.sc-find-note')).includes('No tool'), 'no match says so'); await page.keyboard.press('Escape');
await page.waitForFunction(() => window.ccPalette && window.ccPalette.items().some(i => i.kind === 'app'), null, { timeout: 8000 }).catch(() => {});
const pal = await page.evaluate(() => window.ccPalette ? window.ccPalette.items().filter(i => i.kind === 'app').length : -1);
ok(pal > 500, 'Ctrl+K (the shell palette) holds every tool of the eight apps: ' + pal);
await page.keyboard.press('Control+k');
await page.waitForSelector('dialog[open].shell-palette, dialog.shell-palette[open], .shell-palette[open]').catch(() => {});
await page.keyboard.type('hatch');
ok((await page.$$('.shell-palette-opt')).length > 0, 'typing in Ctrl+K finds tools');
await page.keyboard.press('Escape');

/* a real app in a panel: TakeoffCraft */
ok((await page.$$('dialog[open]')).length === 0, 'no dialog left open');
await ws('report');
await page.waitForFunction(() => document.querySelector('[data-panel="takeoff"]')?.dataset.mount === 'ready', null, { timeout: 30000 });
ok(await page.evaluate(() => !!window.takeoffcraft && window.takeoffcraft.tool() === 'select'), 'TakeoffCraft runs in its panel (its own global, its select tool)');
ok(await page.evaluate(() => document.querySelectorAll('main').length === 1 && document.querySelectorAll('#main').length === 1), 'still one <main> and one #main in the document');
ok(await page.$eval('[data-panel="takeoff"] [data-takeoffcraft]', e => e.getBoundingClientRect().width > 400 && e.getBoundingClientRect().height > 200), 'the app fills its panel');
await shot('07-takeoff-mounted');
await page.setInputFiles('[data-panel="takeoff"] [data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0 && window.takeoffcraft.rendered() > 0, null, { timeout: 30000 });
ok(true, 'a PDF opens in the panel and its page renders');
await page.click('[data-panel="takeoff"] [data-takeoffcraft]', { position: { x: 5, y: 5 }, force: true });   // make it the active view
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'takeoff', 'a click in the panel makes it the active view');
// a Super tool is the app's own button
await page.evaluate(() => { const t = window.superWindow.catalog.tools.find(x => x.key === 'takeoffcraft:scale.calibrate'); window.__tool = t; });
ok(await page.evaluate(() => window.superWindow.reason(window.__tool)) === null, 'its tools are available while it is the active view');
await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'tools-report'); w.render(); });   // earlier steps moved the tool sets to other workspaces
await page.click('.sc-tool[data-key="takeoffcraft:scale.calibrate"]');
ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'calibrate', 'clicking Calibrate the scale in Super\'s tool set runs TakeoffCraft\'s own tool');
await page.keyboard.press('Escape');
await page.evaluate(() => document.querySelector('[data-panel="takeoff"] [data-tool="select"]').click());
// keys: only the active panel's app hears them
await page.focus('.sc-tools .sc-filter'); await page.keyboard.press('a');
ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'select', 'typing in another panel\'s filter does not reach TakeoffCraft');
ok(await page.inputValue('.sc-tools .sc-filter') === 'a', 'and the filter got its letter');
await page.fill('.sc-tools .sc-filter', '');
await page.evaluate(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('k');
ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'calibrate', 'with its panel active and nothing focused, its own key (K) reaches it');
await page.evaluate(() => document.querySelector('[data-panel="takeoff"] [data-tool="select"]').click());
await page.click('[data-panel-tab="model3d"]');   // another view becomes the active one
await page.evaluate(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('k');
ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'select', 'with another panel active, the same key does nothing in TakeoffCraft');
await page.click('[data-panel-tab="takeoff"]');
// it survives the window being rearranged
const sheetsBefore = await page.evaluate(() => window.takeoffcraft.sheets().length);
await tearOff('Quantities');
ok(await page.$('.sc-float [data-panel="takeoff"][data-mount="ready"] [data-takeoffcraft]') !== null, 'torn off into its own window, the app moves with its state');
await ws('layout');
ok(await page.evaluate(() => window.takeoffcraft.sheets().length) === sheetsBefore && await page.$('.sc-float [data-panel="takeoff"]') !== null, 'and stays open (same sheets) in another workspace');
await shot('08-takeoff-window');
await page.click('.sc-float [data-act="dock"]');
ok(await page.$('.sc-frame [data-panel="takeoff"] [data-takeoffcraft]') !== null, 'docked back, still the same app');

/* Settings: the window's own, and each mounted app's fieldsets in the one dialog */
await page.evaluate(() => { window.confirm = () => true; });
await page.click('[data-settings-open]');
await page.waitForSelector('dialog[data-app-settings][open]');
const stabs = await page.$$eval('[data-settings-tab]', e => e.map(x => x.textContent.trim()));
ok(stabs.length === 2 && stabs[0] === 'SuperCad Studio', 'Settings has the SuperCad Studio tab and Global: ' + stabs);
const legends = await page.$$eval('dialog[data-app-settings] [data-settings-pane="app"] legend', e => e.map(x => x.textContent.trim()));
// an app's sections are a group named after the app now (the legends are the app's own words; the group's heading in the section list names the app)
const tkSecs = await page.$$eval('dialog[data-app-settings] [data-settings-pane="app"] fieldset[data-sec-group="app-takeoffcraft"] > legend', e => e.map(x => x.textContent.trim()));
const tkNav = await page.$$eval('dialog[data-app-settings] ul[aria-label="TakeoffCraft"] button', e => e.map(x => x.textContent.trim()));
ok(legends.includes('Window') && legends.indexOf('Window') < legends.indexOf(tkSecs[0]) && tkSecs.length >= 5 && tkNav.length >= 5 && tkSecs.every(l => tkNav.includes(l)), 'the app tab lists Window, then TakeoffCraft\'s own sections under its name: ' + tkNav.join(' | '));
await page.waitForFunction(() => document.querySelector('[data-panel="takeoff"]')?.dataset.mount === 'ready');
await page.evaluate(() => { const r = document.querySelector('dialog[data-app-settings] input[name="tcDenom"][value="8"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
ok(await page.evaluate(() => JSON.parse(localStorage.getItem('takeoffcraft.settings') || '{}').denom) === 8, 'a TakeoffCraft setting changed in Super\'s dialog reaches the app (its own stored settings)');
await page.evaluate(() => { const r = document.querySelector('dialog[data-app-settings] input[name="tcDenom"][value="16"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
await page.evaluate(() => { const w = window.superWindow; w.M.tearOff(w.state, 'props'); w.render(); });
await page.evaluate(() => document.querySelector('[data-sc-reset-all]').click());
ok((await S()).floats.length === 0 && (await S()).workspaces.layout.docks.right.some(f => f.tabs.includes('props')), 'Reset every workspace docks the windows and restores the starting panels');
await page.keyboard.press('Escape');
const ids = await page.evaluate(() => { const c = {}; for (const e of document.querySelectorAll('[id]')) c[e.id] = (c[e.id] || 0) + 1; return Object.entries(c).filter(([, n]) => n > 1).map(([k]) => k); });
ok(ids.length === 0, 'no duplicate ids in the page with an app mounted: ' + ids);

/* saved */
await tearOff('Properties').catch(() => {});
const before = await S();
await page.reload(); await page.waitForSelector('[data-sc-ready]');
const after = await S();
const noId = fl => fl.map(({ id, ...r }) => r);   // window ids are renumbered on load
ok(JSON.stringify(noId(after.floats)) === JSON.stringify(noId(before.floats)) && after.active === before.active, 'the arrangement is back after a reload');
ok(Object.keys(after.workspaces).includes('mine-1'), 'your workspace is back too');
await page.waitForFunction(() => document.querySelector('[data-panel="takeoff"]')?.dataset.mount !== 'loading', null, { timeout: 30000 }).catch(() => {});
await page.waitForTimeout(400);   // let the app's own refresh/save settle, or it would write over the damaged copy
await page.evaluate(() => localStorage.setItem('cc-super-window', '{"v":1,"workspaces":{"layout":{"docks":{"left":[{"tabs":["nope"]}]}}},"floats":"x"}'));
await page.reload(); await page.waitForSelector('[data-sc-ready]');
ok(JSON.stringify(await page.$$eval('.sc-wstab', e => e.map(x => x.textContent))) === '["Build"]' && JSON.stringify(await page.evaluate(() => { const s = window.superWindow.state; return [s.active, s.shown, Object.keys(s.workspaces)]; })) === '["build",["build"],["layout","build","model","report","finalize"]]', 'a damaged saved arrangement falls back to the starting one (Build on the bar, the five workspaces behind it): ' + (await page.$$eval('.sc-wstab', e => e.map(x => x.textContent))));

/* language packs: the page, Super's words and the apps' tool names follow the visitor's language */
for (const [l, tab, label] of [['es-MX', 'Construcción', 'Calibrar'], ['id', 'Bangun', 'Kalibrasi']]) {
  await page.goto(URL0 + '?lang=' + l); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  const names = await page.$$eval('.sc-wstab', e => e.map(x => x.textContent));
  ok(names[0] === tab, `${l}: Super's own words come from its ${l} pack: ` + names);
  ok(await page.evaluate(() => document.documentElement.lang !== undefined), `${l}: page loads`);
  const lab = await page.evaluate(() => window.superWindow.catalog.tools.find(t => t.key === 'takeoffcraft:scale.calibrate').label);
  ok(lab !== 'Calibrate the scale', `${l}: a TakeoffCraft tool is named in the app's ${l} pack, not English: ` + lab);
  const en = await page.evaluate(() => window.superWindow.catalog.tools.filter(t => t.label === t.id).length);
  ok(en === 0, `${l}: every tool still has a label`);
}
await page.goto(URL0 + '?lang=es-MX'); await page.waitForSelector('[data-sc-ready]');
await ws('report'); await page.click('[data-panel-tab="takeoff"]'); await page.waitForFunction(() => document.querySelector('[data-panel="takeoff"]')?.dataset.mount === 'ready');   // Quantities is Report's second view (by trade, 2026-10-24)
ok((await page.textContent('[data-panel="takeoff"] [data-takeoffcraft]')).includes('Abrir'), 'es-MX: the mounted app itself is in Spanish (its own pack)');
await page.evaluate(() => window.superWindow.state = { ...window.superWindow.state, active: 'layout' });
/* no key is ever missing from the language pack: every t() the window made found its string (i18n.js remembers the ones it did not) */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await useDemo();
await page.click('[data-panel="plan"] .sc-hit[data-id="W2"]', { force: true });
await page.click('[data-act="find"]'); await page.fill('.sc-find-input', 'line'); await page.keyboard.press('Escape');
await page.click('[data-act="panels"]'); await page.keyboard.press('Escape');
const gone = await page.evaluate(async () => (await import('/assets/apps/supercadcraft/dev/i18n.js')).missing());
ok(gone.length === 0, 'the window asked for no string the language pack lacks: ' + gone.slice(0, 5));
const pt = await page.textContent('[data-panel="props"]');
ok(/Name/.test(pt) && /East wall/.test(pt) && !/\bcol\./.test(pt), 'Properties shows words, not keys: ' + pt.slice(0, 80));

/* a second real app: MarkupCraft, with its own words and its own keys */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]');
await ws('finalize');
await page.waitForFunction(() => document.querySelector('[data-panel="markup"]')?.dataset.mount === 'ready', null, { timeout: 30000 });
ok(await page.evaluate(() => !!window.markupcraft), 'MarkupCraft runs in its panel (Finalize and export)');
ok(await page.evaluate(() => document.querySelectorAll('main').length === 1 && document.querySelectorAll('#main').length === 1), 'still one <main>');
await page.setInputFiles('[data-panel="markup"] input[type="file"][accept*="pdf"]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
await page.waitForFunction(() => document.querySelector('[data-panel="markup"] canvas') !== null, null, { timeout: 30000 });
ok(true, 'a PDF opens in MarkupCraft');
await shot('10-markup');
// keys go to the active app only
await ws('report'); await page.click('[data-panel-tab="takeoff"]');   // Report's second view since 2026-10-24
await page.waitForFunction(() => document.querySelector('[data-panel="takeoff"]')?.dataset.mount === 'ready', null, { timeout: 30000 });
await page.setInputFiles('[data-panel="takeoff"] [data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0, null, { timeout: 30000 });
await page.click('[data-panel="takeoff"] [data-takeoffcraft]', { position: { x: 5, y: 5 }, force: true });
await page.evaluate(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('k');
ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'calibrate', 'with TakeoffCraft active, its key reaches it');
await page.evaluate(() => document.querySelector('[data-panel="takeoff"] [data-tool="select"]').click());
await ws('finalize'); await page.click('[data-panel="markup"]', { position: { x: 5, y: 5 }, force: true });
await page.evaluate(() => document.activeElement && document.activeElement.blur());
await page.keyboard.press('k');
ok(await page.evaluate(() => window.takeoffcraft.tool()) === 'select', 'with MarkupCraft active, the same key does not reach TakeoffCraft');
ok((await page.$$('dialog.mc-dialog[open]')).length === 1, 'it went to MarkupCraft (which asked for the name its markups carry)');
await page.keyboard.press('Escape');
await ws('report');
await page.evaluate(() => document.querySelector('[data-panel="takeoff"] [data-tool="select"]').click());
// each app has its own catalog: a key the two apps word differently reads each app's own words
const words = await page.evaluate(async () => {
  const a = await import('/assets/apps/takeoffcraft/dev/i18n.js'), b = await import('/assets/apps/markupcraft/dev/i18n.js');
  const sa = a.catalog().strings, sb = b.catalog().strings;   // each app's own i18n.js holds its own catalog
  const diff = Object.keys(sa).find(k => typeof sa[k] === 'string' && typeof sb[k] === 'string' && sa[k] !== sb[k] && !/[{]/.test(sa[k] + sb[k]));
  return { diff, ta: a.t(diff), tb: b.t(diff), ea: sa[diff], eb: sb[diff] };
});
ok(words.diff && words.ta === words.ea && words.tb === words.eb && words.ta !== words.tb, `the two apps keep their own words for "${words.diff}": ${words.ta} | ${words.tb}`);
// MarkupCraft's settings sit in the one dialog beside TakeoffCraft's
await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
const lg = await page.$$eval('dialog[data-app-settings] [data-settings-pane="app"] legend', e => e.map(x => x.textContent.trim()));
const appSecs = await page.evaluate(() => Object.fromEntries(['markupcraft', 'takeoffcraft'].map(a => [a, { secs: document.querySelectorAll(`dialog[data-app-settings] [data-settings-pane="app"] fieldset[data-sec-group="app-${a}"]`).length, label: document.querySelector(`dialog[data-app-settings] [data-settings-pane="app"] fieldset[data-sec-group="app-${a}"]`)?.dataset.secGroupLabel }])));
ok(lg.length > 10 && appSecs.markupcraft.secs >= 1 && appSecs.markupcraft.label === 'MarkupCraft' && appSecs.takeoffcraft.secs >= 1 && appSecs.takeoffcraft.label === 'TakeoffCraft' && await page.$('dialog[data-app-settings] ul[aria-label="MarkupCraft"] button') !== null && await page.$('dialog[data-app-settings] ul[aria-label="TakeoffCraft"] button') !== null, 'Settings lists each mounted app\'s sections under its name: ' + JSON.stringify(appSecs));
await page.keyboard.press('Escape');
ok((await page.evaluate(() => { const c = {}; for (const e of document.querySelectorAll('[id]')) c[e.id] = (c[e.id] || 0) + 1; return Object.entries(c).filter(([, n]) => n > 1).map(([k]) => k); })).length === 0, 'no duplicate ids with two apps mounted');

/* ModelCraft in a frame of its own (its styles would clash with MarkupCraft's): it lies over its panel and is never reloaded by the window */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
await ws('model');
await page.waitForFunction(() => document.querySelector('[data-panel="model"]')?.dataset.mount === 'ready', null, { timeout: 40000 });
const boxes = () => page.evaluate(() => { const f = document.querySelector('iframe[data-sc-frame="model"]').getBoundingClientRect(), s = document.querySelector('[data-panel="model"]').getBoundingClientRect(); return { f: [f.left, f.top, f.width, f.height].map(Math.round), s: [s.left, s.top, s.width, s.height].map(Math.round), shown: getComputedStyle(document.querySelector('iframe[data-sc-frame="model"]')).display }; });
let bx = await boxes();
ok(bx.shown === 'block' && JSON.stringify(bx.f) === JSON.stringify(bx.s), 'ModelCraft\'s frame lies exactly over its panel: ' + JSON.stringify(bx));
ok(await page.evaluate(() => { const d = document.querySelector('iframe[data-sc-frame="model"]').contentDocument; return !!d.querySelector('[data-modelcraft]') && !d.querySelector('.app-bar') || getComputedStyle(d.querySelector('.app-bar') || d.body).display === 'none'; }), 'it is the app without its own bar');
await page.evaluate(() => { document.querySelector('iframe[data-sc-frame="model"]').contentWindow.__mark = 4711; });
await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'tools-model'); w.render(); });
// a click in the frame makes it the active view; then a Super tool presses the app's own button inside it
await page.evaluate(() => { const f = document.querySelector('iframe[data-sc-frame="model"]'); f.contentWindow.document.body.dispatchEvent(new f.contentWindow.PointerEvent('pointerdown', { bubbles: true })); });
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'model', 'a click inside the frame makes it the active view');
await page.click('.sc-tool[data-key="modelcraft:draw.rect"]');
ok(await page.evaluate(() => document.querySelector('iframe[data-sc-frame="model"]').contentDocument.querySelector('[data-tool="rect"]').getAttribute('aria-pressed')) === 'true', 'Super\'s Rectangle tool presses ModelCraft\'s own Rectangle button inside the frame');
// the window rearranged around it: torn off, another workspace, docked back: same page, same frame, never reloaded
await tearOff('3D model');
await page.waitForTimeout(300);
bx = await boxes();
ok(bx.shown === 'block' && JSON.stringify(bx.f) === JSON.stringify(bx.s) && await page.$('.sc-float [data-panel="model"]') !== null, 'torn off, the frame follows its panel into the window: ' + JSON.stringify(bx));
await ws('layout'); await page.waitForTimeout(300);
bx = await boxes();
ok(bx.shown === 'block' && JSON.stringify(bx.f) === JSON.stringify(bx.s), 'and stays in another workspace');
await page.click('.sc-float [data-act="dock"]'); await page.waitForTimeout(300);
ok(await page.evaluate(() => document.querySelector('iframe[data-sc-frame="model"]').contentWindow.__mark) === 4711, 'docked back, the frame was never reloaded (its page kept what it held)');
await ws('build'); await page.waitForTimeout(200);
ok(await page.evaluate(() => getComputedStyle(document.querySelector('iframe[data-sc-frame="model"]')).display) === 'none', 'a workspace that does not show it hides the frame');

/* open any file: the router picks the app and its panel; the app's own file input takes the file */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const give = async file => { await page.setInputFiles('[data-sc-open-input]', path.join(ROOT, file)); };
// by trade (2026-10-24): Report and price = sheets and markup, then quantities; Layout = the site; Build = the 2D drawing first
await ws('report');
await give('fixtures/pdf/kitchen-plan-sheet.pdf');   // Report and price: a PDF is a sheet to mark up (its first view)
await page.waitForFunction(() => document.querySelector('[data-panel="markup"]')?.dataset.mount === 'ready' && document.querySelector('[data-panel="markup"] canvas'), null, { timeout: 40000 });
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'markup' && (await page.textContent('.sc-status')).includes('went to Sheets and markup'), 'a PDF opened in Report and price goes to Sheets and markup and makes it active');
// Build opens with the Building view in front since BK.3, and the view in front takes a file it can open (super-open.js `prefer`): a DWG given with the
// Building in front goes to the Building. For the 2D drawing a person brings its tab forward first.
await ws('build'); await page.click('[data-panel-tab="cad"]');
await page.waitForFunction(() => document.querySelector('[data-panel="cad"]')?.dataset.mount === 'ready', null, { timeout: 40000 });
await give('fixtures/showcase/cadcraft-sample-house.dwg');
await page.waitForFunction(() => /went to 2D drawing/.test(document.querySelector('.sc-status').textContent), null, { timeout: 40000 }).catch(() => {});
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'cad' && (await page.textContent('.sc-status')).includes('went to 2D drawing'), 'a DWG in Build, with the 2D drawing in front, goes to the 2D drawing');
await ws('build');
await give('fixtures/showcase/bimcraft-house.ifc');
await page.waitForFunction(() => document.querySelector('[data-panel="bim"]')?.dataset.mount === 'ready', null, { timeout: 40000 });
await page.waitForFunction(() => /went to Building/.test(document.querySelector('.sc-status').textContent), null, { timeout: 40000 });
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'bim', 'an IFC goes to BimCraft');
// dropped on the window's own surface (not on an app) it is the same
await page.evaluate(() => { const w = window.superWindow; w.M.hidePanel(w.state, 'bim'); w.render(); });
await ws('model'); await page.click('[data-panel-tab="part"]');   // parts are Model's since 2026-10-24 (by trade; in Build a STEP file asks); with Parts in front it goes there
await page.evaluate(async () => {
  const f = new File([new Uint8Array(8)], 'part.step', { type: 'application/octet-stream' }), dt = new DataTransfer(); dt.items.add(f);
  document.querySelector('.sc-bar').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
});
await page.waitForFunction(() => document.querySelector('[data-panel="part"]')?.dataset.mount === 'ready', null, { timeout: 40000 });
ok((await page.evaluate(() => window.superWindow.ctx().view)) === 'part', 'a STEP file dropped on the window opens in PartCraft');
// a .json that names no app asks, with a choice for each file
await page.evaluate(async () => {
  const f = new File(['{"v":1}'], 'thing.json', { type: 'application/json' }), dt = new DataTransfer(); dt.items.add(f);
  document.querySelector('.sc-bar').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
});
await page.waitForSelector('dialog.sc-openwith[open]');
ok((await page.$$('dialog.sc-openwith input[type=radio]')).length >= 6, 'a file more than one app opens asks which');
await page.click('dialog.sc-openwith button[value="no"]');
ok((await page.$$('dialog.sc-openwith')).length === 0, 'and Cancel opens nothing');
await page.evaluate(async () => {
  const f = new File(['x'], 'archive.rar', { type: 'application/octet-stream' }), dt = new DataTransfer(); dt.items.add(f);   // (a .png is a scan for the site since Start from a scan)
  document.querySelector('.sc-bar').dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }));
});
await page.waitForFunction(() => /No app here opens archive.rar/.test(document.querySelector('.sc-status').textContent));
ok(true, 'a file no app opens says so');

/* the project, and the live link: BimCraft's model → TakeoffCraft's quantities */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
await ws('build');
await give('fixtures/showcase/bimcraft-house.ifc');
await page.waitForFunction(() => window.bimcraftQto && document.querySelector('[data-panel="bim"]')?.dataset.mount === 'ready', null, { timeout: 60000 });
await ws('report'); await page.click('[data-panel-tab="takeoff"]');   // with Quantities in front, the PDF is a takeoff
await give('fixtures/pdf/kitchen-plan-sheet.pdf');
const bimDoors = () => page.evaluate(() => { const d = window.bimcraftQto.set({ scope: 'all', groups: ['cls'], sums: [] }); document.querySelector('[data-qto-details]').open = false; return (d.rows.find(r => r.values[0] === 'IfcDoor') || { count: 0 }).count; });
const tkDoors = () => page.evaluate(() => { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Door: count/.test(x.name)); return r ? r.qty : null; });
await page.waitForFunction(() => window.takeoffcraft && window.takeoffcraft.estimate().rows.some(x => x.kind === 'item' && /: count$/.test(x.name)), null, { timeout: 90000 });
const doors0 = await bimDoors();
ok(doors0 > 0 && await tkDoors() === doors0, `TakeoffCraft holds BimCraft's door count without being asked: model ${doors0}, takeoff ${await tkDoors()}`);
ok((await page.evaluate(() => window.takeoffcraft.estimate().rows.filter(x => x.kind === 'item').length)) >= 4, 'with the other counts and the quantities the model states');
ok((await page.textContent('.sc-status')).includes('now follow the BimCraft model'), 'the window says so');
ok(await page.evaluate(() => window.superWindow.project.links.some(l => l.kind === 'quantities' && l.from.app === 'bimcraft' && l.to.app === 'takeoffcraft')), 'the link is recorded in the project');
/* SC.5: one selection across the apps — a pick in BimCraft reaches the hub, Properties and the status line, and means TakeoffCraft's door rows */
await ws('build');
await page.evaluate(() => { window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]); });
{
  const pick = await page.evaluate(() => ({ g: window.superWindow.hub.get(), r: window.superWindow.hub.related() }));
  ok(pick.g.source === 'bimcraft' && pick.g.refs.length > 0 && pick.g.refs.every(r => /ifcdoor/i.test(r.cls || '')), 'a pick in BimCraft reaches the hub with its IFC class: ' + JSON.stringify(pick.g.refs.slice(0, 2)));
  ok(pick.r.some(r => r.app === 'takeoffcraft' && /^ifc:ifcdoor:count$/.test(r.id)), 'and means the door rows of the takeoff: ' + JSON.stringify(pick.r.map(r => r.id)));
  ok((await page.textContent('.sc-status')).includes('related in other views'), 'the status line says what was picked and how much is related');
  await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'props'); w.render(); });
  const props = await page.textContent('[data-panel="props"]');
  ok(/Picked in/.test(props) && /Quantities/.test(props) && /Door/.test(props), 'Properties lists the matching rows in the other views: ' + props.replace(/\s+/g, ' ').slice(0, 160));
  // the other way: a quantity row picked in the takeoff shows every door in BimCraft
  const back = await page.evaluate(async () => { const h = window.superWindow.hub; h.set('takeoffcraft', [{ app: 'takeoffcraft', id: 'ifc:ifcdoor:count' }]); const rel = h.related(); const ok = await window.superWindow.selWire.applyToBim(rel); return { ok, rel, src: h.get().source }; });
  ok(back.ok && back.rel[0].app === 'bimcraft' && back.src === 'takeoffcraft', 'a quantity row relates to every door in the model and BimCraft shows them, without that echo becoming a new pick: ' + JSON.stringify(back));
}
// a change in BimCraft reaches TakeoffCraft: delete the doors in the model
await ws('build');
await page.evaluate(() => { window.bimcraftFind.run([{ field: 'cls', op: 'is', value: 'IfcDoor' }]); });
await page.evaluate(() => { const w = window.superWindow; w.M.showPanel(w.state, 'tools-build'); w.render(); });
await page.click('[data-panel="bim"]', { position: { x: 5, y: 5 }, force: true });
await page.evaluate(() => document.querySelector('[data-panel="bim"] [data-edit-menu] [data-act="delete"]').click());
await page.waitForFunction(() => { const d = window.bimcraftQto.set({ scope: 'all', groups: ['cls'], sums: [] }); document.querySelector('[data-qto-details]').open = false; return !d.rows.some(r => r.values[0] === 'IfcDoor'); }, null, { timeout: 30000 });
ok(await bimDoors() === 0, 'the doors are deleted in the model');
await ws('report');
await page.waitForFunction(() => { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Door: count/.test(x.name)); return !r || r.qty === 0; }, null, { timeout: 30000 });
ok(true, 'and TakeoffCraft\'s door quantity follows (no new item, the same one updated)');
await page.evaluate(() => window.bimcraftFind && 0);
// undo in BimCraft brings the doors back in the quantities too
await ws('build'); await page.evaluate(() => document.querySelector('[data-panel="bim"] [data-edit-menu] [data-act="undo"], [data-panel="bim"] [data-toolbar] [data-act="undo"]').click());
await ws('report');
await page.waitForFunction(d => { const r = window.takeoffcraft.estimate().rows.find(x => x.kind === 'item' && /^Door: count/.test(x.name)); return r && r.qty === d; }, doors0, { timeout: 30000 });
ok(true, 'undo in BimCraft puts the door count back in TakeoffCraft');
// the project: save it, then open it in a fresh window
const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-act="save"]')]);
const saved = path.join(ROOT, 'tmp/super-test/test.ccproject'); await dl.saveAs(saved);
const pj = await (await import(path.join(ROOT, 'public_html/assets/apps/supercadcraft/dev/super-project.js'))).fromBytes(new Uint8Array(fs.readFileSync(saved)));
ok(pj.project.members.some(m => m.app === 'bimcraft' && /\.ifc$/i.test(m.name)) && pj.project.members.some(m => m.app === 'takeoffcraft'), 'Save project writes each app\'s document: ' + pj.project.members.map(m => m.app + ':' + m.name + ':' + m.role).join(', '));
ok(pj.project.links.some(l => l.kind === 'quantities'), 'with the link table');
ok(dl.suggestedFilename().endsWith('.ccproject'), 'as a .ccproject: ' + dl.suggestedFilename());
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
await page.setInputFiles('[data-sc-open-input]', saved);
await page.waitForFunction(() => /Opened .*files/.test(document.querySelector('.sc-status').textContent), null, { timeout: 90000 });
ok(await page.evaluate(() => window.superWindow.project.members.length) === pj.project.members.length, 'opening the project brings back every member');
await page.waitForFunction(() => window.bimcraftQto && window.takeoffcraft, null, { timeout: 90000 });
ok(true, 'in their own apps');

/* the honest note, and the measurement button */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
// the bar's own About button is gone: the note is a section of Settings, chosen from the dialog's section list
await page.click('[data-settings-open]');
await page.waitForSelector('dialog[data-app-settings][open]');
ok(await page.evaluate(() => { const fs = document.querySelector('dialog[data-app-settings] [data-sc-about]'), b = [...document.querySelectorAll('dialog[data-app-settings] button')].find(x => x.ccSet === fs); if (!b) return false; b.click(); return fs.getClientRects().length > 0; }), 'Settings has the About section in its section list, and choosing it shows it');
ok((await page.$$('dialog[data-app-settings] [data-sc-about] li')).length === 12, 'Settings says plainly what works (7) and what does not yet (5)');   // SC.6 round 5: the pasted-token line is gone (the setup follows the account by itself)
const docksOf = async () => JSON.stringify(Object.fromEntries(Object.entries((await S()).workspaces).map(([k, w]) => [k, w.docks])));
const docksBefore = await docksOf(), barBefore = JSON.stringify([(await S()).active, (await S()).shown]);
const bench = await page.evaluate(async () => { const r = await window.superWindow.bench(); return { apps: r.steps.map(s => s.app + ':' + s.state), errors: r.errors, heap: r.heapMBAfter, ms: r.allReadyMs }; });
ok(bench.apps.length === 8 && bench.apps.every(a => a.endsWith(':ready')) && bench.errors.length === 0, 'Measure this computer opens all eight apps and reports: ' + JSON.stringify(bench).slice(0, 220));
ok(await docksOf() === docksBefore && JSON.stringify([(await S()).active, (await S()).shown]) === barBefore && (await S()).workspaces.build.docks.center[0].tabs.join() === 'bim,cad', 'and puts the arrangement back as it was (every workspace\'s panels, the workspace that was open, the bar)');
await page.keyboard.press('Escape');

/* the shell's docked layout (Ribbon and project browser) around the window */
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]');
ok(await page.evaluate(() => !document.body.classList.contains('ws-on')), 'the standard layout is the default: no workspace layout without the choice');
await page.evaluate(() => localStorage.removeItem('cc-super-window'));   // a fresh window: Layout, the plan in front
await page.goto(URL0 + '?workspace=docked'); await page.waitForSelector('[data-sc-ready]');
await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 });
await page.evaluate(() => window.superWindow.ready); await useDemo();
const rtabs = await page.$$eval('[data-ws-tab]', e => e.map(x => x.textContent));
// BK.30: the first ribbon tab is the core and discipline tools ("Core and Architecture"); then a tab for each workspace on the bar
ok(rtabs.length === 6 && /^Core and \S/.test(rtabs[0]) && JSON.stringify(rtabs.slice(1)) === JSON.stringify(['Layout and landscape', 'Build', 'Model', 'Report and price', 'Finalize and export']), 'the ribbon has the core and discipline tab, then a tab for each workspace: ' + rtabs);
const rgroups = await page.$$eval('.ws-group-title', e => e.map(x => x.textContent));
// named for the work, never an app (owner 2026-10-24): Layout is the site's
ok(rgroups.includes('Design') && rgroups.includes('GIS') && !rgroups.some(g => /craft/i.test(g)), 'its groups are named for the work, never an app: ' + rgroups.slice(0, 6));
ok((await page.$$('.ws-ribbon .ws-tool')).length > 15, 'with their real commands');
ok(await page.$('.ws-status-slot .sc-status') !== null, 'the window\'s status line sits in the layout\'s status bar');
ok(await page.$('.ws-properties .sc-props') !== null && await page.$('[data-sc-browser]') !== null, 'Properties and the project browser are in the left panel');
// nothing is shown twice: the layout owns the workspace tabs, the tool sets, Properties and the Panels list
await page.waitForTimeout(400);   // let the layout settle (the engine moves the status line in on its next frame)
const shownCount = sel => page.$$eval(sel, e => e.filter(n => n.getClientRects().length).length);
ok(await shownCount('.sc-wstab') === 0, 'Super\'s own workspace tabs step aside (the ribbon tabs are the workspaces)');
ok(await shownCount('[data-panel-tab^="tools-"]') === 0 && await shownCount('[data-panel-tab="props"]') === 0, 'no tool-set or Properties tab in the docks (the ribbon and the left palette have them)');
ok(await shownCount('[data-panel="props"]') === 0 && await shownCount('.sc-barbtn[data-act="panels"]') === 0, 'no second Properties panel and no second Panels menu');
ok(await shownCount('.ws-properties .sc-props') === 1, 'exactly one Properties on screen');
// (the plug-ins' own status items, Timer and Teams, sit in the same line now, so the spans are counted by what they say)
const stText = await page.$eval('.ws-status-slot', e => [...e.querySelectorAll('.sc-status > *')].filter(n => n.getClientRects().length).map(n => n.textContent).join(' | ').replace(/\s+/g, ' '));
ok(!/Selection:/.test(stText) && (stText.match(/Active view:/g) || []).length === 1, 'the status bar does not say the selection a second time (the left palette has it), and names the active view once: ' + stText);
await shot('09-docked');
// greyed with the reason, in the layout's own words (the 2D drawing's Move is Build's since 2026-10-24)
await page.click('[data-ws-tab="build"]'); await page.waitForTimeout(300);
const bgroups = await page.$$eval('.ws-group-title', e => e.map(x => x.textContent));
ok(bgroups.includes('Draw') && bgroups.includes('Modify') && bgroups.includes('Building') && !bgroups.some(g => /craft/i.test(g)), 'Build\'s ribbon: Draw, Modify, Building… named for the work: ' + bgroups.slice(0, 8));
const move = page.locator('.ws-ribbon [data-ws-command="cadcraft:modify.move"]');
ok(await move.count() === 1, 'the ribbon has CadCraft\'s Move');
await move.click({ force: true });
await page.waitForSelector('dialog.ws-dialog[open]');
ok((await page.textContent('dialog.ws-dialog')).includes('needs something selected'), 'a tool that cannot run says why: ' + (await page.textContent('dialog.ws-dialog')).slice(0, 60));
await page.click('[data-ws-dismiss]');
// one selection: pick a wall in the plan; Properties (left) shows it; the same tool is now available
await page.click('[data-panel="plan"] .sc-hit[data-id="W3"]', { force: true });
ok((await page.textContent('.ws-properties')).includes('South wall'), 'the left Properties follows the selection');
await move.click({ force: true });
await page.waitForTimeout(300);
ok((await page.$$('dialog.ws-dialog[open]')).length === 0, 'and Move is now available (no explanation dialog)');
// the ribbon's tabs and the window's workspaces are one thing
await page.click('[data-ws-tab="build"]');
ok((await S()).active === 'build', 'choosing a ribbon tab opens that workspace');
await page.evaluate(() => { const w = window.superWindow; w.M.switchWorkspace(w.state, 'report'); w.render(); });   // Super's own tab strip is hidden here
await page.waitForFunction(() => document.querySelector('[data-ws-tab="report"]')?.getAttribute('aria-selected') === 'true', null, { timeout: 5000 }).catch(() => {});
ok(await page.$eval('[data-ws-tab="report"]', b => b.getAttribute('aria-selected') === 'true'), 'and choosing a workspace shows its ribbon tab');
ok(await page.$('.ws-status-slot .sc-status') !== null, 'the status line stays in the status bar when the window redraws');
// the project browser opens views and tool sets
await page.click('[data-sc-browser] [data-pb-panel="takeoff"]');
ok((await visible()).includes('takeoff') && (await page.evaluate(() => window.superWindow.ctx().view)) === 'takeoff', 'the project browser opens a view and makes it active');
ok(await page.$('[data-pb-ws]') === null, 'the project browser does not list the workspaces again (they are the ribbon\'s tabs)');
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); await openLeft();
ok(await shownCount('.sc-wstab') >= 1 && await shownCount('.sc-wstab') === (await S()).shown.length && await shownCount('[data-panel-tab^="tools-"]') > 0 && await shownCount('[data-panel="props"]') === 1, 'the standard layout still shows its workspace tabs, tool sets and Properties');
/* the panel wall (owner 2026-10-24): in the docked layout the view in front keeps its own side panel on top of the left wall,
   Properties under it; another view gives it back; classic puts every panel home */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0 + '?workspace=docked'); await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 }); await page.evaluate(() => window.superWindow.ready);
await page.click('[data-ws-tab="build"]'); await page.click('[data-panel-tab="cad"]');   // Build opens with the Building in front (BK.3): the 2D drawing is its second tab
await page.waitForFunction(() => document.querySelector('[data-panel="cad"]')?.dataset.mount === 'ready', null, { timeout: 40000 });
await page.waitForFunction(() => !!document.querySelector('.sc-wall-engine aside.cc-left'), null, { timeout: 10000 }).catch(() => {});
ok(await page.evaluate(() => !!document.querySelector('.ws-properties .sc-wall-engine aside.cc-left') && !document.querySelector('[data-panel="cad"] aside.cc-left')), 'Build: the 2D drawing\'s own panel (Layers, Blocks…) is in the left wall, not in the view');
ok(await page.evaluate(() => { const a = document.querySelector('[data-sc-wall-engine]'), p = document.querySelector('[data-sc-wall-props]'); return a && p && (a.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING); }), 'Properties is under it');
ok(await page.evaluate(() => getComputedStyle(document.querySelector('[data-panel="cad"] .cc')).gridTemplateColumns.split(' ')[0] === '0px'), 'the view gives the panel\'s column back to the drawing');
await page.click('[data-panel-tab="bim"]');
await page.waitForFunction(() => document.querySelector('[data-panel="bim"]')?.dataset.mount === 'ready' && !!document.querySelector('.sc-wall-engine aside.bc-left'), null, { timeout: 40000 }).catch(() => {});
ok(await page.evaluate(() => !!document.querySelector('.sc-wall-engine aside.bc-left') && !!document.querySelector('[data-panel="cad"] aside.cc-left')), 'another view in front: its panel comes in, the 2D drawing\'s goes home');
ok(await page.evaluate(() => document.querySelector('.ws-properties .ws-palette-heading')?.textContent.trim()) === 'Building', 'the wall names the view\'s work, not the app');
ok(await page.evaluate(() => [...document.querySelectorAll('.ws-properties *')].filter((n) => !n.children.length && n.textContent.trim() === 'Building').length) === 1, 'and says it once (owner 2026-10-24: "2D drawing" twice)');
await page.evaluate(() => { history.replaceState(null, '', location.pathname); window.ccShellWorkspace?.set('standard'); }); await page.waitForTimeout(800);   // the address's ?workspace= would win over Settings
ok(await page.evaluate(() => !document.querySelector('.sc-wall-engine aside') && !!document.querySelector('[data-panel="bim"] aside.bc-left')), 'the classic layout puts every panel home');
/* tear-off (owner 2026-10-24: the left and right panels need the "…" menu so they can go to another monitor) */
await page.evaluate(() => localStorage.removeItem('cc-super-window'));
await page.goto(URL0 + '?workspace=docked'); await page.waitForSelector('body.ws-on .ws-ribbon .ws-tool', { timeout: 20000 }); await page.evaluate(() => window.superWindow.ready);
await page.click('[data-ws-tab="build"]'); await page.click('[data-panel-tab="cad"]');
await page.waitForFunction(() => document.querySelector('[data-panel="cad"]')?.dataset.mount === 'ready' && document.querySelector('.sc-wall-engine aside') && document.querySelector('aside.cc-right [data-ws-grip]'), null, { timeout: 40000 });
ok(await page.evaluate(() => !!document.querySelector('.sc-aside > [data-ws-grip="wall"] .ws-popout-menu')), 'the left wall has the grip with its "…" menu');
ok(await page.evaluate(() => !!document.querySelector('aside.cc-right > [data-ws-grip] .ws-popout-menu')), 'the view\'s right panel has it too');
// the left wall → its own window
await page.click('.sc-aside [data-ws-grip="wall"] .ws-popout-menu');
const [wallWin] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.click('.shell-panel-menu [role="menuitem"]')]);
await wallWin.waitForTimeout(1200);
ok(await wallWin.evaluate(() => !!document.querySelector('.ws-palettes') && !!document.querySelector('aside.cc-left') && !!document.querySelector('[data-ws-grip="wall"]')), 'the left wall moved into a window of its own (Layers, Blocks, Properties, the browser)');
ok(await page.evaluate(() => !document.querySelector('.sc-aside .ws-palettes') && document.querySelector('.sc-aside').classList.contains('is-away') && !!document.querySelector('.sc-wall-away')), 'a slim strip stays behind with the way back');
await wallWin.click('.ws-palettes [data-ws-lower]:nth-child(2)').catch(() => {});
ok(await wallWin.evaluate(() => !!document.querySelector('.ws-palettes .ws-lower-tabs [aria-selected="true"]')), 'the wall works in its window (its tabs answer)');
await page.click('.sc-wall-away'); await page.waitForTimeout(600);
ok(await page.evaluate(() => !!document.querySelector('.sc-aside .ws-palettes') && !document.querySelector('.sc-wall-away') && !document.querySelector('.sc-aside').classList.contains('is-away')) && wallWin.isClosed(), 'the strip\'s button brings it home and closes the window');
// the right panel → its own window
await page.click('aside.cc-right [data-ws-grip] .ws-popout-menu');
const [rightWin] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.click('.shell-panel-menu [role="menuitem"]')]);
await rightWin.waitForTimeout(1200);
ok(await rightWin.evaluate(() => !!document.querySelector('aside.cc-right select, aside.cc-right input')), 'the right panel moved into a window of its own, with its controls');
ok(await page.evaluate(() => getComputedStyle(document.querySelector('[data-panel="cad"] .cc')).gridTemplateColumns.split(' ').pop() === '0px'), 'its column goes to the drawing');
await rightWin.close(); await page.waitForTimeout(500);
ok(await page.evaluate(() => !!document.querySelector('[data-panel="cad"] aside.cc-right select, [data-panel="cad"] aside.cc-right input') && getComputedStyle(document.querySelector('[data-panel="cad"] .cc')).gridTemplateColumns.split(' ').pop() !== '0px'), 'closing that window brings it back, column and all');
// the classic layout leaves nothing behind
await page.click('.sc-aside [data-ws-grip="wall"] .ws-popout-menu');
const [w2] = await Promise.all([page.waitForEvent('popup', { timeout: 15000 }), page.click('.shell-panel-menu [role="menuitem"]')]);
await page.evaluate(() => { history.replaceState(null, '', location.pathname); window.ccShellWorkspace?.set('standard'); }); await page.waitForTimeout(1000);
ok(w2.isClosed() && await page.evaluate(() => !document.querySelector('[data-ws-grip]') && !!document.querySelector('[data-panel="cad"] aside.cc-right')), 'picking the classic layout brings a torn-off panel home and leaves no grip');
// SC.5 (part-model_PART_4): an app announces its pick with a window event and the one selection takes it; a related pick comes back through ccPickApply
{
  await page.evaluate(() => { window.superWindow.hub.clear(); window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'modelcraft', ids: ['7', '9'] } })); });
  const g = await page.evaluate(() => window.superWindow.hub.get());
  ok(g.source === 'modelcraft' && g.refs.length === 2 && g.refs[0].app === 'modelcraft' && g.refs[0].id === '7', 'an app\'s cc-pick event becomes the one selection: ' + JSON.stringify(g));
  // sc-r5-select: an app with nothing selected does not take another panel's pick away; the panel that holds the pick clears it
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'partcraft', ids: [] } })));
  ok((await page.evaluate(() => window.superWindow.hub.get())).refs.length === 2, 'an empty pick from another view leaves the pick alone');
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('cc-pick', { detail: { app: 'modelcraft', ids: [] } })));
  ok((await page.evaluate(() => window.superWindow.hub.get())).refs.length === 0, 'an empty pick from the view that holds it clears it');
  // sc-r5-select: seven apps share the page, so an app's adapter is found by its name (window.ccPickers), here a stand-in for the Part view's
  await page.evaluate(() => { window.__applied = null; window.ccPickers = window.ccPickers || {}; window.__was = window.ccPickers.partcraft; window.ccPickers.partcraft = { apply: (refs) => { window.__applied = refs; return true; } }; });
  const done = await page.evaluate(() => window.superWindow.selWire.applyToApps([{ app: 'partcraft', id: '3' }]));
  ok(done === true && (await page.evaluate(() => window.__applied))[0].id === '3', 'a related pick is applied through the app\'s pick adapter');
  await page.evaluate(() => { if (window.__was) window.ccPickers.partcraft = window.__was; else delete window.ccPickers.partcraft; window.superWindow.hub.forget('partcraft'); window.superWindow.hub.clear(); });
}
ok(errors.length === 0, 'no script errors in the docked layout: ' + errors.slice(0, 3).join(' | '));
ok(missing.filter(p => p.startsWith('/assets/') && !/\/addons\/[^/]+\/lang\/[a-zA-Z-]+\.json$/.test(p)).length === 0, 'every asset the page asks for exists (an add-on\'s language file that does not exist is how its loader asks, in the app on its own page too): ' + missing.filter(p => p.startsWith('/assets/') && !/\/addons\/[^/]+\/lang\/[a-zA-Z-]+\.json$/.test(p)).join(', '));
ok(errors.length === 0, 'no script errors: ' + errors.slice(0, 3).join(' | '));
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
