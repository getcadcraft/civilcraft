#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-edit.mjs — BimCraft's Edit menu and Settings › BimCraft in the lab, headless, with real clicks and keys.
 *   node tools/bimcraft-test/browser-edit.mjs [--shots <dir>]
 * Run as root: signs in with BimCraft's own test admin (tools/bimcraft-test/admin.php up|down, disabled again at the
 * end) and drives the cached Playwright Chromium. Clear the shared admin-login throttle first when other checks ran.
 * Opens Ifc4_SampleHouse.ifc: disabled tools and their reasons, the More menu, copying a wall as text (read back from
 * the system clipboard), placing a library item, Copy / Paste / Paste in place / Duplicate by toolbar, menu and keys,
 * Undo / Redo, the not-built messages, Esc; pasting into another model in a second tab; then the settings: fields
 * stored, shown again after a reload, applied when a model opens and when placing starts, and reset.
 * Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const IFC = '/var/www/CADCRAFT/testfiles/samples/Ifc4_SampleHouse.ifc';
const IFC2 = '/var/www/CADCRAFT/testfiles/samples/Ifc2x3_Duplex_Architecture.ifc';
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
const adminPhp = path.join(REPO, 'tools/bimcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
const problems = [];
const watch = (p) => {
  p.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  p.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
};
const page = await ctx.newPage();
watch(page);
const statusOf = (p) => p.textContent('[data-status]');
const waitStatus = (p, re, timeout = 60000) => p.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const tool = (act) => `[data-toolbar] > [data-act="${act}"]`;
const item = (act) => `[data-edit-menu] [role="menuitem"][data-act="${act}"]`;
const disabled = async (p, sel) => (await p.getAttribute(sel, 'aria-disabled')) === 'true';
const scheduleNos = async (p) => {
  await p.click('[data-lib-tool="equipment"]');
  const nos = await p.$$eval('[data-ifc-equip] tbody tr', (r) => r.map((x) => x.querySelector('th').textContent));
  await p.click('[data-lib-tool="equipment"]');
  return nos.join(',');
};
const openIfc = async (p, file) => { await p.setInputFiles('[data-file]', file); await waitStatus(p, /^Opened /); };
const canvasCentre = async (p) => { const b = await p.locator('[data-canvas]').boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.removeItem('bimcraft.settings'); localStorage.removeItem('bimcraft.clipboard'); });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('== Toolbar: the Edit tools, disabled with reasons');
  await openIfc(page, IFC);
  const acts = await page.$$eval('[data-toolbar] > [data-act]', (bs) => bs.map((b) => b.dataset.act + ':' + b.textContent.trim()));
  ok(acts.join() === 'undo:Undo,redo:Redo,copy:Copy,paste:Paste' && await page.isVisible('[data-edit-menu] > summary'), 'toolbar Edit tools: Undo, Redo, Copy, Paste and More (' + acts.join(', ') + ')');
  const rows = await page.$$eval('[data-toolbar] .bc-tool', (bs) => new Set(bs.filter((b) => b.offsetParent).map((b) => Math.round(b.getBoundingClientRect().top))).size);
  ok(rows === 2, 'at 1440 px the toolbar keeps the two rows it had (' + rows + ')');
  const rowOf = await page.$$eval('[data-toolbar] .bc-tool', (bs) => Object.fromEntries(bs.map((b) => [b.dataset.act || b.dataset.view || b.dataset.toggle || b.dataset.libTool || (b.hasAttribute('data-handoff-ifc') ? 'handoff' : b.closest('[data-vis-menu]') ? 'show' : b.closest('[data-edit-menu]') ? 'more' : 'other'), Math.round(b.getBoundingClientRect().top)])));
  ok(rowOf.iso === rowOf.more && rowOf.undo === rowOf.iso && rowOf.library > rowOf.iso, 'row 1: view tools and the Edit group with More; row 2: the library tools');
  ok(await disabled(page, tool('undo')) && (await page.getAttribute(tool('undo'), 'title')) === 'Nothing to undo.', 'Undo is aria-disabled, title "Nothing to undo."');
  ok(await disabled(page, tool('copy')) && /Pick an element/.test(await page.getAttribute(tool('copy'), 'title')), 'Copy is disabled until an element is picked (title says so)');
  ok(await disabled(page, tool('paste')) && /Nothing copied yet/.test(await page.getAttribute(tool('paste'), 'title')), 'Paste is disabled with nothing copied');
  await page.click(tool('paste'), { force: true });   // aria-disabled: Playwright would wait for it to be enabled
  ok(/^Nothing copied yet/.test(await statusOf(page)), 'clicking a disabled tool says why in the status line');
  await shot(page, '01-toolbar');

  console.log('== More menu');
  await page.click('[data-edit-menu] > summary');
  ok(await page.isVisible('[data-edit-menu] [role="menu"]'), 'More opens the menu');
  const inside = await page.evaluate(() => { const l = document.querySelector('[data-edit-menu] [role="menu"]').getBoundingClientRect(), s = document.querySelector('.bc-stage').getBoundingClientRect(); return l.left >= s.left && l.right <= s.right && l.bottom <= s.bottom; });
  ok(inside, 'the menu opens fully inside the stage (toward the side with room)');
  const menu = await page.$$eval('[data-edit-menu] [role="menuitem"]', (bs) => bs.map((b) => b.childNodes[0].textContent.trim() + ' [' + b.querySelector('kbd').textContent + ']'));
  ok(menu.join('|') === 'Cut [Ctrl+X]|Copy [Ctrl+C]|Paste [Ctrl+V]|Paste in place [Ctrl+Shift+V]|Duplicate [Ctrl+D]|Delete [Delete]|Select all [Ctrl+A]|Select none [Esc]', 'menu items with their keys: ' + menu.join(', '));
  ok(await disabled(page, item('cut')) && /Pick one or more elements first/.test(await page.getAttribute(item('cut'), 'title')), 'Cut: aria-disabled until something is picked, the reason in its title');
  ok(!(await disabled(page, item('select-all'))), 'Select all: enabled (0.4 B1)');
  await shot(page, '02-more-menu');
  await page.click(item('delete'), { force: true });
  ok(/^Pick one or more elements first/.test(await statusOf(page)) && !(await page.isVisible('[data-edit-menu] [role="menu"]')), 'Delete with nothing picked says why, and the menu closes');
  await page.click('[data-edit-menu] > summary');
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-edit-menu] [role="menu"]')), 'Esc closes the menu');

  console.log('== Copy a wall: text on the clipboard, and it pastes (0.4 B1; the full checks are in browser-04.mjs)');
  const [cx, cy] = await canvasCentre(page);
  await page.mouse.click(cx, cy);
  await page.waitForFunction(() => !/Click an element/.test(document.querySelector('[data-props]').textContent));
  const picked = await page.textContent('.bc-prop-cls');
  ok(!(await disabled(page, tool('copy'))), 'Copy is enabled once an element (' + picked + ') is picked');
  await page.click(tool('copy'));
  await waitStatus(page, /^Copied 1 element/);
  const clipText = await page.evaluate(() => navigator.clipboard.readText());
  ok(/GlobalId: /.test(clipText) && clipText.startsWith(picked + ':'), 'the system clipboard holds its name and properties (' + clipText.split('\n')[0] + ' …)');
  ok(!(await disabled(page, tool('paste'))), 'Paste is enabled for the wall');
  await page.keyboard.press('Control+v');
  await waitStatus(page, /^Pasting: click where the copy goes/);
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-placebar]')), 'Ctrl+V starts pasting the wall; Esc stops before anything is placed');
  await page.keyboard.press('Control+d');
  await waitStatus(page, /^Duplicated: click where the copy goes/);
  await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-placebar]')), 'Ctrl+D on a wall starts pasting a copy; Esc stops');

  console.log('== Place a library item, then Copy / Paste / Paste in place / Duplicate');
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("Files")');
  await page.setInputFiles('[data-lib-file]', path.join(REPO, 'tools/library/seed.csv'));
  await waitStatus(page, /Read seed\.csv: 6 items/);
  await page.click('.bc-lib-card:has-text("reach-in")');
  await page.click('[data-lib-place]');
  await page.fill('[data-place-xy]', '2000, 1500');
  await page.press('[data-place-xy]', 'Enter');
  await page.waitForSelector('dialog.bc-dialog [data-ask-number]');
  await page.keyboard.press('Enter');
  await waitStatus(page, /^Placed .* as item 1/);
  ok(await page.isVisible('[data-placebar]') && await disabled(page, tool('paste')), 'while placing, Paste waits ("Finish placing first")');
  await page.keyboard.press('Escape');
  await page.click('[data-rtab="props"]');
  ok(!(await disabled(page, tool('undo'))) && !(await disabled(page, tool('copy'))), 'after placing: Undo and Copy are enabled (the item is picked)');
  await page.click(tool('copy'));
  await waitStatus(page, /^Copied Generic two-door reach-in refrigerator \(item 1\)/);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.clipboard')));
  ok(stored && stored.kind === 'placement' && stored.itemNumber === '1' && stored.item && /^sha:[0-9a-f]{64}$/.test(stored.key), 'localStorage "bimcraft.clipboard": a placement clip with its item (key ' + stored?.key.slice(0, 12) + '…)');
  ok(!(await disabled(page, tool('paste'))), 'Paste is enabled');
  await page.click(tool('paste'));
  ok(await page.isVisible('[data-placebar]') && /^Pasting /.test(await page.textContent('[data-place-name]')), 'Paste opens the placing bar: "' + await page.textContent('[data-place-name]') + '"');
  await page.mouse.move(cx - 60, cy + 40);
  await page.mouse.move(cx - 20, cy + 40, { steps: 3 });
  await page.waitForTimeout(200);
  ok(/X -?\d+ {2}Y -?\d+/.test(await page.textContent('[data-place-at]')), 'the ghost follows the pointer (' + (await page.textContent('[data-place-at]')).trim() + ')');
  await shot(page, '03-pasting');
  await page.mouse.click(cx - 20, cy + 40);
  await waitStatus(page, /^Pasted Generic two-door reach-in refrigerator as item 2/);
  ok(true, 'a click places the copy as item 2 (no prompt)');
  await page.keyboard.press('Escape');
  ok(await page.isHidden('[data-placebar]'), 'Esc stops pasting');
  await page.keyboard.press('Control+Shift+V');
  await waitStatus(page, /^Pasted .* in place as item 3/);
  ok(/beside the original/.test(await statusOf(page)), 'Ctrl+Shift+V: item 3 beside the original (same storey, so not on top of it)');
  await page.keyboard.press('Control+d');
  ok(await page.isVisible('[data-placebar]') && /^Duplicated /.test(await statusOf(page)), 'Ctrl+D duplicates the picked item: placing bar open');
  await page.fill('[data-place-xy]', '4000, 2500');
  await page.click('[data-place-typed]');
  await waitStatus(page, /^Pasted .* as item 4/);
  await page.keyboard.press('Escape');
  ok(await scheduleNos(page) === '1,2,3,4', 'equipment schedule: items 1, 2, 3, 4');
  ok(/Placed: Generic two-door reach-in refrigerator \(item 4\)/.test(await page.textContent('[data-change-list]')), 'the change list shows each paste');
  await page.click('[data-edit-menu] > summary');
  await page.click(item('paste-in-place'));
  await waitStatus(page, /^Pasted .* in place as item 5/);
  ok(true, 'More › Paste in place works from the menu (item 5)');
  await shot(page, '04-pasted');

  console.log('== Undo and redo');
  await page.click(tool('undo'));
  await waitStatus(page, /^Undid/);
  ok(await scheduleNos(page) === '1,2,3,4' && !(await disabled(page, tool('redo'))), 'toolbar Undo takes back item 5; Redo is enabled');
  await page.click(tool('redo'));
  await waitStatus(page, /^Redid/);
  ok(await scheduleNos(page) === '1,2,3,4,5' && await disabled(page, tool('redo')), 'toolbar Redo puts item 5 back; nothing left to redo');
  await page.keyboard.press('Control+z');
  await waitStatus(page, /^Undid/);
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => document.querySelectorAll('[data-change-list] li').length === 3);
  ok(await scheduleNos(page) === '1,2,3', 'Ctrl+Z twice: items 4 and 5 gone');
  await page.keyboard.press('Control+y');
  await waitStatus(page, /^Redid/);
  await page.keyboard.press('Control+Shift+Z');
  await page.waitForFunction(() => document.querySelectorAll('[data-change-list] li').length === 5);
  ok(await scheduleNos(page) === '1,2,3,4,5', 'Ctrl+Y and Ctrl+Shift+Z redo both');

  console.log('== Select all, Delete and Cut on a library item (0.4 B1), and Esc');
  await page.keyboard.press('Control+a');
  await waitStatus(page, /^Picked all \d+ elements shown/);
  ok(Number(await page.getAttribute('[data-pick-count]', 'data-pick-count')) > 5, 'Ctrl+A picks every element shown: ' + await statusOf(page));
  await page.keyboard.press('Escape');
  const pickItem1 = async () => {
    await page.click('[data-lib-tool="equipment"]');
    await page.click('[data-ifc-equip] tbody tr >> nth=0 >> button');
    await page.waitForSelector('[data-swap]');
  };
  await pickItem1();
  await page.keyboard.press('Delete');
  await waitStatus(page, /^Deleted 1 element/);
  ok(await scheduleNos(page) === '2,3,4,5', 'Delete removes item 1 from the model and the schedule');
  await page.keyboard.press('Control+z');
  await waitStatus(page, /^Undid/);
  ok(await scheduleNos(page) === '1,2,3,4,5', 'Ctrl+Z puts it back');
  await pickItem1();
  await page.keyboard.press('Control+x');
  await waitStatus(page, /^Cut 1 element/);
  ok(await scheduleNos(page) === '2,3,4,5', 'Ctrl+X cuts it');
  await page.keyboard.press('Control+Shift+V');
  await waitStatus(page, /^Pasted 1 element where it was cut from/);
  ok(await scheduleNos(page) === '1,2,3,4,5', 'Ctrl+Shift+V pastes it back where it was, keeping its item number 1');
  await page.keyboard.press('Control+c');   // a placement clip again, for the second tab below
  await waitStatus(page, /^Copied /);
  await page.keyboard.press('Escape');
  ok(/Click an element/.test(await page.textContent('[data-props]')) && await disabled(page, tool('copy')) && await disabled(page, item('select-none')), 'Esc selects none: Properties cleared, Copy and Select none disabled');

  console.log('== Paste into another model in a second tab');
  const p2 = await ctx.newPage();
  watch(p2);
  await p2.goto(BASE + '/lab/bimcraft?space=model', { waitUntil: 'networkidle' });
  await openIfc(p2, IFC2);
  ok(!(await disabled(p2, tool('paste'))), 'the clip copied in the first tab is there (Paste enabled)');
  await p2.keyboard.press('Control+Shift+V');
  await waitStatus(p2, /^Pasted .* in place as item 1 on /);
  ok(await scheduleNos(p2) === '1', 'pasted in place into ' + path.basename(IFC2) + ' from the kept library item: ' + (await statusOf(p2)).replace(/ Ctrl\+Z.*/, ''));
  await shot(p2, '05-other-model');
  await p2.close();

  console.log('== Settings › BimCraft');
  await page.evaluate(() => { window.onbeforeunload = null; });
  const openSettings = async (p) => { await p.click('[data-settings-open]'); await p.waitForSelector('dialog[data-app-settings][open]'); };
  await openSettings(page);
  ok((await page.textContent('[data-settings-tab="app"]')).trim() === 'BimCraft' && await page.isVisible('[data-settings-tab="general"]'), 'the dialog has a "BimCraft" tab beside "General"');
  await page.click('[data-settings-tab="app"]');
  const field = (sel) => page.$eval(sel, (i) => i.checked);
  ok(!(await field('input[name="bcSpaces"]')) && await field('input[name="bcEdges"][value="on"]') && await field('input[name="bcView"][value="iso"]') && !(await field('input[name="bcSnap"]')), 'defaults shown: spaces off, edges on, Fit, wall snap off');
  await shot(page, '06-settings');
  await page.check('input[name="bcSpaces"]');
  await page.check('input[name="bcEdges"][value="off"]');
  await page.check('input[name="bcView"][value="top"]');
  await page.check('input[name="bcSnap"]');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.settings')));
  ok(saved && saved.spaces === true && saved.edges === 'off' && saved.view === 'top' && saved.snap === true, 'stored in localStorage "bimcraft.settings": ' + JSON.stringify(saved));
  await page.keyboard.press('Escape');
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  // the edits above were never saved: since 0.4 1.2 the page offers them back ("Recover your work?") — discard them here
  if (await page.waitForSelector('[data-autosave-dialog][open]', { timeout: 4000 }).catch(() => null)) {
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]'); await page.waitForTimeout(150); }
    await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog][open]'), null, { timeout: 5000 }).catch(() => page.keyboard.press('Escape'));
  }
  await openSettings(page);
  await page.click('[data-settings-tab="app"]');
  ok(await field('input[name="bcSpaces"]') && await field('input[name="bcEdges"][value="off"]') && await field('input[name="bcView"][value="top"]') && await field('input[name="bcSnap"]'), 'after a reload the dialog shows the stored values');
  await page.keyboard.press('Escape');
  await openIfc(page, IFC);
  ok((await page.getAttribute('[data-toggle="spaces"]', 'aria-pressed')) === 'true' && (await page.getAttribute('[data-toggle="edges"]', 'aria-pressed')) === 'false', 'a model opens with spaces shown and edges off');
  const lookDown = await page.evaluate(() => { const v = document.querySelector('[data-canvas]').viewer; const d = v.camera.position.clone().sub(v.controls.target).normalize(); return d.y; });
  ok(lookDown > 0.99, 'a model opens in the top view (camera looks straight down: ' + lookDown.toFixed(4) + ')');
  await shot(page, '07-opened-with-settings');
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("Files")');
  await page.setInputFiles('[data-lib-file]', path.join(REPO, 'tools/library/seed.csv'));
  await waitStatus(page, /Read seed\.csv: 6 items/);
  await page.click('.bc-lib-card:has-text("work table")');
  await page.click('[data-lib-place]');
  ok((await page.getAttribute('[data-place-snap]', 'aria-pressed')) === 'true' && /\(on\)/.test(await statusOf(page)), 'placing starts with wall snap on');
  await page.keyboard.press('Escape');
  // Another tab changes a setting: the dialog shows it when it opens.
  await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('bimcraft.settings')); s.view = 'side'; localStorage.setItem('bimcraft.settings', JSON.stringify(s)); });
  await openSettings(page);
  await page.click('[data-settings-tab="app"]');
  ok(await field('input[name="bcView"][value="side"]'), 'opening the dialog syncs the fields with what is stored');
  await page.click('[data-settings-reset]');
  ok(!(await field('input[name="bcSpaces"]')) && await field('input[name="bcEdges"][value="on"]') && await field('input[name="bcView"][value="iso"]') && !(await field('input[name="bcSnap"]')), 'Reset puts the BimCraft fields back to the defaults');
  const afterReset = await page.evaluate(() => JSON.parse(localStorage.getItem('bimcraft.settings')));
  ok(afterReset && afterReset.spaces === false && afterReset.edges === 'on' && afterReset.view === 'iso' && afterReset.snap === false, 'and stores the defaults');
  await page.keyboard.press('Escape');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.message || e).split('\n')[0]);
  try { console.log('  status: ' + await statusOf(page)); await shot(page, 'zz-failure'); } catch (x) { /* ignore */ }
} finally {
  const real = problems.filter((p) => !/favicon/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
