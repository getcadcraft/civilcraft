#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-library.mjs — BimCraft's Library panel in the lab, headless (docs/LIBRARY-SPEC.md §7 B "browser check").
 *   node tools/bimcraft-test/browser-library.mjs [--shots <dir>]
 * Run as root: signs in with the MarkupCraft test admin (tools/markupcraft-test/admin.php up|down, disabled again
 * at the end) and drives the cached Playwright Chromium. Opens Ifc4_SampleHouse.ifc, lists LibraryCraft items
 * (live API), makes items from tools/library/seed.csv (Files…), places one by clicking in the 3D view and one by
 * typed X,Y, checks the change list, the equipment schedule, credits, swap, undo and the ?library= deep link.
 * Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const IFC = '/var/www/CADCRAFT/testfiles/samples/Ifc4_SampleHouse.ifc';
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
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const statusText = () => page.textContent('[data-status]');
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  console.log('== Library panel');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-rtab="library"]');
  ok(await page.isVisible('[data-rpane="library"]'), 'Library tab opens beside Properties');
  await page.waitForSelector('.bc-lib-card, .bc-lib-detail, [data-library] .bc-muted', { timeout: 15000 });
  await page.waitForTimeout(800);
  const apiCards = await page.$$eval('.bc-lib-card', (cs) => cs.map((c) => c.textContent));
  ok(apiCards.length > 0, `LibraryCraft source lists ${apiCards.length} items from /api/v1/library/items`);
  ok(await page.isVisible('[data-lib-signin]'), '"Sign in to the library" link shown when not signed in');
  ok((await page.getAttribute('[data-lib-signin]', 'href')) === '/library/connect?app=bimcraft', 'sign-in link goes to /library/connect?app=bimcraft');
  await shot(page, '01-library-panel');

  console.log('== Open an IFC and place from a file');
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /);
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("Files")');
  await page.setInputFiles('[data-lib-file]', path.join(REPO, 'tools/library/seed.csv'));
  await waitStatus(/Read seed\.csv: 6 items/);
  ok((await page.$$('.bc-lib-card')).length === 6, 'Files…: seed.csv read in the browser → 6 cards');
  await page.click('.bc-lib-card:has-text("reach-in")');
  await page.waitForSelector('[data-lib-place]');
  await shot(page, '02-item-detail');
  await page.click('[data-lib-place]');
  ok(await page.isVisible('[data-placebar]'), 'placing bar shown (storey, typed X,Y, wall snap, stop)');
  const box = await page.locator('[data-canvas]').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  await page.mouse.move(cx - 40, cy);
  await page.mouse.move(cx, cy, { steps: 4 });
  await page.keyboard.press('r');
  await page.waitForTimeout(300);
  ok(/90°/.test(await page.textContent('[data-place-at]')), 'R turns the ghost 90°');
  await shot(page, '03-ghost');
  await page.mouse.click(cx, cy);
  await page.waitForSelector('dialog.bc-dialog [data-ask-number]');
  ok((await page.inputValue('[data-ask-number]')) === '1', 'item number prompt defaults to the next free number (1)');
  await page.keyboard.press('Enter');
  await waitStatus(/^Placed Generic two-door reach-in refrigerator as item 1/);
  ok(/Placed: Generic two-door/.test(await page.textContent('[data-change-list]')), 'the change list shows the placement');
  ok(/CadCraft_Placement|Library item, item 1/.test(await page.textContent('[data-props]')), 'Properties show the placed item (library block, item 1)');
  await page.click('[data-rtab="props"]');
  await shot(page, '04-placed');

  console.log('== Typed coordinates, a LibraryCraft item');
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("LibraryCraft")');
  await page.waitForSelector('.bc-lib-card', { timeout: 15000 });
  await page.click('.bc-lib-card >> nth=0');
  const libPlace = await page.waitForSelector('[data-lib-place], .bc-lib-detail .bc-input-err', { timeout: 15000 });
  if (await libPlace.getAttribute('data-lib-place') !== null) {
    await page.click('[data-lib-place]');
    await page.fill('[data-place-xy]', '2500, 1500');
    await page.press('[data-place-xy]', 'Enter');
    await page.waitForSelector('dialog.bc-dialog [data-ask-number]');
    ok((await page.inputValue('[data-ask-number]')) === '2', 'second placement defaults to item 2');
    await page.keyboard.press('Enter');
    await waitStatus(/^Placed .* as item 2/);
    ok(true, 'a LibraryCraft item placed at typed X,Y 2500, 1500');
  } else ok(false, 'LibraryCraft item opened: ' + await libPlace.textContent());
  await page.keyboard.press('Escape');
  ok(await page.isHidden('[data-placebar]'), 'Esc stops placing');

  console.log('== Equipment, credits, swap, undo');
  await page.click('[data-lib-tool="equipment"]');
  const rows = await page.$$eval('[data-ifc-equip] tbody tr', (r) => r.map((x) => x.querySelector('th').textContent));
  ok(rows.join() === '1,2', 'equipment schedule from the IFC: items ' + rows.join(', '));
  await shot(page, '05-equipment');
  await page.click('[data-lib-tool="equipment"]');
  await page.click('[data-lib-tool="credits"]');
  const credits = await page.$$eval('dialog.bc-dialog tbody tr', (r) => r.length);
  ok(credits === 2, 'Library credits list both items');
  await shot(page, '06-credits');
  await page.click('dialog.bc-dialog button:has-text("Close")');
  // Swap item 1 (selected after placing? select it through the schedule's "Where").
  await page.click('[data-lib-tool="equipment"]');
  await page.click('[data-ifc-equip] tbody tr >> nth=0 >> button');
  await page.waitForSelector('[data-swap]');
  await page.click('[data-swap]');
  await page.click('.bc-lib-src:has-text("Files")');
  ok((await page.$$('.bc-lib-card')).length === 6, 'Files… keeps the items read before');
  await page.click('.bc-lib-card:has-text("work table")');
  await page.click('button:has-text("to this")');
  await waitStatus(/^Swapped .* item number, quantity and notes are kept/);
  await page.click('[data-lib-tool="equipment"]');
  const after = await page.$$eval('[data-ifc-equip] tbody tr', (r) => r.map((x) => x.querySelector('th').textContent + ' ' + x.children[2].textContent));
  ok(after.some((t) => /^1 Generic work table/.test(t)), 'swap kept item number 1, now a work table');
  await page.click('[data-lib-tool="equipment"]');
  await page.click('[data-undo]');
  await waitStatus(/^Undid/);
  await page.click('[data-lib-tool="equipment"]');
  const undone = await page.$$eval('[data-ifc-equip] tbody tr', (r) => r.map((x) => x.querySelector('th').textContent + ' ' + x.children[2].textContent));
  ok(undone.some((t) => /^1 Generic two-door/.test(t)), 'undo brings the refrigerator back as item 1');
  await page.click('[data-lib-tool="equipment"]');
  await page.click('[data-lib-tool="updates"]');
  await page.waitForSelector('dialog.bc-dialog', { timeout: 15000 }).catch(() => null);
  const upd = await page.$('dialog.bc-dialog');
  ok(!!upd && /Up to date|Newer version|Withdrawn|Not found/.test(await upd.textContent()), 'Check for updates asks /api/v1/library/updates and lists the result');
  if (upd) { await shot(page, '07-updates'); await page.click('dialog.bc-dialog button:has-text("Close")'); }
  await page.evaluate(() => { window.onbeforeunload = null; });

  console.log('== This file: blocks of an open DWG');
  page.once('dialog', (d) => d.accept());   // "discard the unsaved changes?" — yes
  await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg'));   // public fixture
  // the edited IFC asks first (in-page "Unsaved changes" dialog): discard
  await page.click('dialog.bc-dialog button:has-text("Discard changes")', { timeout: 10000 }).catch(() => null);
  await waitStatus(/^Opened kitchen-equipment\.dwg/, 120000);
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("This file")');
  const blocks = await page.$$('.bc-lib-card');
  ok(blocks.length === 163, `This file lists the ${blocks.length} blocks of the kitchen fixture`);
  await page.fill('.bc-lib-search', 'hot wells');
  await page.waitForTimeout(500);
  await page.click('.bc-lib-card >> nth=0');
  await page.waitForSelector('.bc-lib-detail .bc-prop-name');
  const det = await page.textContent('.bc-lib-detail');
  ok(/Example Foodservice Co\./.test(det) && /775 mm/.test(det) && !(await page.$('[data-lib-place]')), 'a block shows its KCL data and size in mm; no Place on a drawing');
  await shot(page, '09-this-file-dwg');

  console.log('== Deep link and model space');
  const first = await page.evaluate(async () => (await (await fetch('/api/v1/library/items?per=1')).json()).data.items[0]?.uuid);
  const p2 = await ctx.newPage();
  p2.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  await p2.goto(BASE + '/lab/bimcraft?space=model&library=' + first, { waitUntil: 'networkidle' });
  await p2.waitForSelector('.bc-lib-detail .bc-prop-name, .bc-lib-detail .bc-input-err', { timeout: 15000 });
  ok(await p2.isVisible('[data-rpane="library"]') && await p2.isVisible('.bc-lib-detail .bc-prop-name'), '?library=<uuid> opens the Library tab on that item');
  if (SHOTS) await p2.screenshot({ path: path.join(SHOTS, '08-deeplink-model.png') });
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.message || e).split('\n')[0]);
  try { console.log('  status: ' + await statusText()); await shot(page, 'zz-failure'); } catch (x) { /* ignore */ }
} finally {
  const real = problems.filter((p) => !/favicon/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
