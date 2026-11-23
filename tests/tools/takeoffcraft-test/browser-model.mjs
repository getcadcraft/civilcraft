#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-model.mjs — 0.11 MT.1 / MT.2: model takeoff in TakeoffCraft (/lab/takeoffcraft, headless Chromium, run as root).
 * An IFC building opened like any plan file shows the model takeoff panel; its rows join the takeoff as typed quantities; opened again it says
 * nothing changed. In the lab an .rvt project (the MIT 2024 sample, /var/www/CADCRAFT/testfiles/rvt-preview, skipped when missing) is read through
 * the lab reader, says it is a lab preview, counts its boxes and leaves them unmeasured; grouped by level it is over the limit and Add is off.
 * Without the lab switch the same file gets the "ask for an IFC export" line. No console errors.
 *   node tools/takeoffcraft-test/browser-model.mjs
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'tmp/shots/takeoffcraft-model');
fs.mkdirSync(OUT, { recursive: true });
const HOUSE = path.join(ROOT, 'fixtures/bimcraft/small-house.ifc');
const RVT = path.join(process.env.BIMCRAFT_TESTFILES || '/var/www/CADCRAFT/testfiles', 'rvt-preview/2024_Core_Interior.rvt');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForTimeout(500); }
  const items = () => page.evaluate(() => window.takeoffcraft.model.state.items.map((i) => ({ n: i.name, u: i.unit, q: i.qty, o: i.origin && i.origin.app, p: i.origin && i.origin.project })));
  const status = () => page.textContent('[data-status]');
  const dialog = '[data-model-dialog][open]';

  console.log('An IFC building');
  ok(await page.locator('[data-act="model-takeoff"]').count() >= 1, 'the toolbar has a Model button');
  await page.setInputFiles('[data-file-pdf]', HOUSE);
  await page.waitForSelector(dialog + ' [data-mt-row]', { timeout: 30000 });
  ok(/small-house\.ifc: 20 elements, 2 rooms, 1 levels \(IFC4\)/.test(await page.textContent('[data-mt-summary]')), 'the panel says what the file holds: ' + (await page.textContent('[data-mt-summary]')));
  ok(await page.locator('[data-mt-row]').count() === 11, '11 rows by category and type');
  ok(await page.locator('[data-mt-rvt]').count() === 0 && await page.locator('[data-mt-boxnote]').count() === 0, 'no lab or box warning on an IFC with shapes');
  ok(await page.getAttribute('[data-mt-count]', 'data-mt-count') === '31', '31 quantities ready');
  const first = await page.locator('[data-mt-row]').first().innerText();
  ok(/Exterior masonry 300 mm/.test(first) && /111\.5 LF/.test(first) && /827\.4 SF/.test(first), 'the exterior walls read 111.5 LF and 827.4 SF: ' + first.replace(/\s+/g, ' '));
  await page.screenshot({ path: path.join(OUT, 'model-ifc-paper.png') });
  await page.selectOption('[data-mt-units]', 'metric');
  ok(/34 m/.test(await page.locator('[data-mt-row]').first().innerText()), 'in metres the same row reads 34 m');
  await page.selectOption('[data-mt-units]', 'imperial');
  await page.fill('[data-mt-input="name"]', 'Small house');
  await page.click('[data-mt-add]');
  await page.waitForFunction(() => window.takeoffcraft.model.state.items.length === 31, null, { timeout: 10000 });
  const a = await items();
  ok(a.every((i) => i.o === 'Model' && i.p === 'Small house'), '31 typed quantities, each from the model "Small house"');
  ok(a.some((i) => /Rooms: Bedroom: plan area/.test(i.n) && i.u === 'SF' && Math.abs(i.q - 346.167) < 0.01), 'the bedroom is 346.17 SF');
  ok(/31 added/.test(await status()) && await page.locator(dialog).count() === 0, 'the status line says 31 added and the dialog closed: ' + (await status()));
  // the button brings the read model back; the same quantities are all unchanged
  await page.evaluate(() => document.querySelector('[data-act="model-takeoff"]').click());
  await page.waitForSelector(dialog + ' [data-mt-row]', { timeout: 10000 });
  await page.fill('[data-mt-input="name"]', 'Small house');
  await page.waitForSelector('[data-mt-compare]', { timeout: 5000 });
  ok(/0 new, 0 changed, 31 unchanged/.test(await page.textContent('[data-mt-compare]')), 'under the same model name it says 0 new, 0 changed, 31 unchanged');
  await page.click('[data-mt-all]');
  ok(await page.getAttribute('[data-mt-count]', 'data-mt-count') === '0' && await page.isDisabled('[data-mt-add]'), 'with every row unticked there is nothing to add');
  await page.click('[data-mt-all]');
  await page.fill('[data-mt-input="filter"]', 'window');
  ok(await page.locator('[data-mt-row]').count() === 1, 'Find "window" leaves one row');
  await page.evaluate(() => document.querySelector('[data-model-dialog]').close());

  if (!fs.existsSync(RVT)) console.log('The .rvt path: SKIPPED (no ' + RVT + ')');
  else {
    console.log('An .rvt project, in the lab');
    ok(/^\/assets\/vendor\/rvt\/[0-9.]+\/rvt\.js$/.test(await page.evaluate(() => document.querySelector('[data-takeoffcraft]').dataset.rvtModel || '')), 'the lab page carries the reader\'s pinned address');
    await page.setInputFiles('[data-file-model]', RVT);
    await page.waitForSelector(dialog + ' [data-mt-rvt]', { timeout: 120000 });
    const info = await page.evaluate(() => window.takeoffcraftModel);
    ok(info.elements === 970 && info.spaces === 116 && info.source.kind === 'rvt' && info.source.release === 2024, '854 elements and 116 rooms read from the 2024 project');
    ok(/Lab preview/.test(await page.textContent('[data-mt-rvt]')) && /854 elements/.test(await page.textContent('[data-mt-rvt]')), 'the panel says it is a lab preview and what was found');
    ok(await page.getAttribute('[data-mt-boxnote]', 'data-mt-boxnote') === '138', 'it says 138 elements are boxes');
    const door = await page.locator('[data-mt-row]', { hasText: 'I_Single-Flush:3 x 8 2 Hour' }).innerText();
    ok(/50 of 50 are boxes/.test(door), 'a door row says its 50 are boxes: counted only');
    const wall = await page.locator('[data-mt-row]', { hasText: 'Basic Wall:18" Basement' }).innerText();
    ok(/\b4\b/.test(wall) && /LF/.test(wall) && /SF/.test(wall) && /CY/.test(wall), 'the basement walls carry a length, an area and a volume: ' + wall.replace(/\s+/g, ' '));
    await page.screenshot({ path: path.join(OUT, 'model-rvt-paper.png') });
    await page.selectOption('[data-mt-by]', 'level');
    ok(Number(await page.getAttribute('[data-mt-count]', 'data-mt-count')) > 500 && await page.isDisabled('[data-mt-add]'), 'by level it is over 500 quantities: said, and Add is off');
    await page.selectOption('[data-mt-by]', 'type');
    const n = Number(await page.getAttribute('[data-mt-count]', 'data-mt-count'));
    await page.click('[data-mt-add]');
    await page.waitForFunction((k) => window.takeoffcraft.model.state.items.length === 31 + k, n, { timeout: 10000 });
    ok(true, n + ' more quantities joined the takeoff');
    ok((await items()).some((i) => /Doors: I_Single-Flush:3 x 8: count/.test(i.n) && i.q === 70 && i.u === 'EA'), '70 single flush doors, counted');
    await page.evaluate(() => { document.documentElement.dataset.space = 'model'; document.querySelector('[data-act="model-takeoff"]').click(); });
    await page.waitForSelector(dialog + ' [data-mt-row]', { timeout: 10000 });
    await page.screenshot({ path: path.join(OUT, 'model-rvt-model.png') });
    await page.evaluate(() => document.querySelector('[data-model-dialog]').close());

    console.log('The same file without the lab switch');
    await page.evaluate(() => { delete document.querySelector('[data-takeoffcraft]').dataset.rvtModel; });
    await page.setInputFiles('[data-file-pdf]', RVT);
    await page.waitForFunction(() => /Ask the architect for an IFC export/.test(document.querySelector('[data-status]').textContent), null, { timeout: 20000 });
    ok(await page.locator(dialog).count() === 0, 'no reader: the status line asks for an IFC export and nothing opens');
  }
} finally { await browser.close(); }
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
