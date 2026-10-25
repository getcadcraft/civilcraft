#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-new.mjs — BimCraft's New building (0.5 part 3) in the lab, headless, with real clicks and keys.
 *   node tools/bimcraft-test/browser-new.mjs [--shots <dir>]
 * Run as root (BimCraft's test admin, tools/bimcraft-test/admin.php up|down). The dialog and its refusals, a 3-level
 * building in feet and inches, a library item placed on Level 2, Save as IFC (the download is read back: IFC4, three
 * storeys, the item), the saved file reopened, and the unsaved-work question before a second New. Fails on any console error.
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
const tool = (act) => `[data-toolbar] .bc-tool-row > [data-act="${act}"]`;
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

  console.log('== The button and the dialog');
  ok(await page.isVisible('[data-empty] [data-new]') && await page.isVisible('.bc-left [data-new]'), 'New building on the empty page and under Open');
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await shot(page, '01-dialog');
  ok(await page.inputValue('[data-new-name]') === 'New building' && await page.inputValue('[data-new-levels]') === '2', 'defaults: "New building", 2 levels (height ' + await page.inputValue('[data-new-height]') + ')');
  await page.fill('[data-new-height]', 'tall');
  await page.click('[data-new-ok]');
  ok(/level height/i.test(await page.textContent('.bc-new-err')) && await page.isVisible('dialog.bc-new'), 'a height that is not a length is refused in the dialog: "' + await page.textContent('.bc-new-err') + '"');
  await page.fill('[data-new-name]', '');
  await page.fill('[data-new-height]', "10'");
  await page.click('[data-new-ok]');
  ok(/name/i.test(await page.textContent('.bc-new-err')), 'an empty name is refused');
  await page.fill('[data-new-name]', "Smith's house");
  await page.fill('[data-new-levels]', '3');
  await page.fill('[data-new-height]', "10'-6\"");
  await page.click('[data-new-ok]');
  await waitStatus(page, /^New building Smith's house with 3 levels/);
  ok(true, 'created: "' + await statusOf(page) + '"');
  const tree = await page.textContent('[data-tree]');
  ok(['Level 1', 'Level 2', 'Level 3', "Smith's house"].every((x) => tree.includes(x)), 'the model tree has the building and its 3 levels');
  ok(!(await page.isDisabled('[data-save]')), 'Save as IFC is ready before any edit (the building is not saved yet)');
  await shot(page, '02-new');

  console.log('== Place a library item on Level 2');
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("Files")');
  await page.setInputFiles('[data-lib-file]', path.join(REPO, 'tools/library/seed.csv'));
  await waitStatus(page, /Read seed\.csv: 6 items/);
  await page.click('.bc-lib-card:has-text("reach-in")');
  await page.click('[data-lib-place]');
  const opts = await page.$$eval('[data-placebar] select option', (o) => o.map((x) => x.textContent.trim()));
  ok(opts.some((o) => /Level 2/.test(o)), 'the placing bar lists the new levels: ' + opts.join(', '));
  await page.selectOption('[data-placebar] select', { label: opts.find((o) => /Level 2/.test(o)) });
  await page.fill('[data-place-xy]', '2000, 1500');
  await page.press('[data-place-xy]', 'Enter');
  await page.waitForSelector('dialog.bc-dialog [data-ask-number]');
  await page.keyboard.press('Enter');
  await waitStatus(page, /^Placed .* as item 1/);
  await page.keyboard.press('Escape');
  ok(true, 'placed: "' + await statusOf(page) + '"');
  await shot(page, '03-placed');

  console.log('== Save as IFC, read it back, reopen');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-save]')]);
  ok(dl.suggestedFilename() === "Smith's house.ifc", 'saved under its own name: ' + dl.suggestedFilename());
  const file = await dl.path();
  const text = fs.readFileSync(file, 'utf8');
  ok(/FILE_SCHEMA\(\('IFC4'\)\)/.test(text) && (text.match(/IFCBUILDINGSTOREY\(/g) || []).length === 3, 'the file: IFC4 with 3 storeys');
  ok(/'CadCraft_Placement'/.test(text) && /3200\.4\)/.test(text), 'with the placed item and Level 2 at 10\'-6" = 3200.4 mm');
  await waitStatus(page, /^Saved /);
  ok(await page.isDisabled('[data-save]'), 'after saving, nothing is unsaved');
  const kept = path.join('/tmp', 'bimcraft-new-' + process.pid + '.ifc');
  fs.copyFileSync(file, kept);
  await page.setInputFiles('[data-file]', kept);
  await waitStatus(page, /^Opened /);
  const again = await page.textContent('[data-tree]');
  const levels = await page.$$eval('[data-storey-list] li', (li) => li.map((x) => x.textContent.trim()));
  ok(['Level 1', 'Level 2', 'Level 3'].every((x) => again.includes(x)) && levels.join() === 'Level 2', 'reopened: 3 levels in the tree; Storeys lists Level 2, the one with something on it');
  fs.unlinkSync(kept);

  console.log('== Unsaved work is asked about');
  await page.click('.bc-left [data-new]');
  await page.click('[data-new-ok]');
  await waitStatus(page, /^New building /);
  await page.click('.bc-left [data-new]');
  ok(await page.isVisible('dialog.bc-dialog[aria-labelledby="bc-unsaved-h"]'), 'a second New asks about the unsaved building first');
  await page.click('dialog.bc-dialog button[value="cancel"]');
  ok(!(await page.isVisible('dialog.bc-new')), 'Cancel keeps it');
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
