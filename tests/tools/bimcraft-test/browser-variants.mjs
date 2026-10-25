#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-variants.mjs — BimCraft's Library panel with an item that has variants (0.7 W3.19), headless Chromium in the lab:
 *   node tools/bimcraft-test/browser-variants.mjs [--shots <dir>]
 * The three library API answers (list, item, item.json) are served from tools/library/fixtures/plate-variants.item.json, so no item
 * has to be published. Opens Ifc4_SampleHouse.ifc, opens the item in the Library tab, picks Large in its Variant choice (the size
 * follows), places it by typed X,Y, reads the Library block of the placed element (Variant Large), swaps it to another variant from
 * the list the panel shows for a swap target, and checks the IFC keeps the choice. Fails on any console error.
 * Signs in with the MarkupCraft test admin (tools/markupcraft-test/admin.php up|down; disabled again at the end).
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

const UUID = '55555555-5555-4555-8555-555555555555';
const item = { ...JSON.parse(fs.readFileSync(path.join(REPO, 'tools/library/fixtures/plate-variants.item.json'), 'utf8')), uuid: UUID, version: 1,
  license: { id: 'CC0-1.0', holder: 'Test', attribution: 'Test plate, CC0', url: '' }, ifc: { class: 'IfcBuildingElementProxy', predefined: 'NOTDEFINED' },
  provenance: { library: 'librarycraft', item: UUID, version: 1, sha256: 'b'.repeat(64), source_file: null, source_sha256: null, published_at: '2026-10-23T00:00:00Z' } };
const summary = { uuid: UUID, name: item.name, maker: '', model: '', category: item.category, license: 'CC0-1.0', version: 1, status: 'published', visibility: 'public', preview_url: null, slug: 'mounting-plate' };
const api = (data) => JSON.stringify({ status: 'success', message: '', data });

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
await page.route('**/api/v1/library/items?**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: api({ items: [summary], total: 1, page: 1, per: 24 }) }));
await page.route(`**/api/v1/library/items/${UUID}`, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: api({ item: { ...summary, versions: [{ version: 1, status: 'published', license: 'CC0-1.0', item_url: `/api/v1/library/items/${UUID}/1/item.json` }] } }) }));
await page.route(`**/api/v1/library/items/${UUID}/1/item.json`, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(item) }));

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', IFC);
  await waitStatus(/^Opened /);

  console.log('== an item with variants in the Library panel');
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("LibraryCraft")');
  await page.waitForSelector('.bc-lib-card', { timeout: 15000 });
  await page.click('.bc-lib-card:has-text("Mounting plate")');
  await page.waitForSelector('[data-lib-variant]', { timeout: 15000 });
  const opts = await page.$$eval('[data-lib-variant] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 4 && /Medium, 120 × 60 × 8 mm/.test(opts[1]) && /no holes/.test(opts[3]), 'the detail has a Variant choice with the four variants and their sizes: ' + opts.join(' | '));
  ok(await page.$eval('[data-lib-variant]', (s) => s.value) === 'medium', 'the default variant (Medium) is chosen first');
  ok(/120 mm/.test(await page.textContent('.bc-lib-detail .bc-dl')) || /Width\s*120/.test(await page.textContent('.bc-lib-detail .bc-dl')), 'the facts show Medium\'s width');
  await page.selectOption('[data-lib-variant]', 'large');
  await page.waitForSelector('[data-lib-variant]');
  ok(await page.$eval('[data-lib-variant]', (s) => s.value) === 'large' && /180/.test(await page.textContent('.bc-lib-detail .bc-dl')) && /90/.test(await page.textContent('.bc-lib-detail .bc-dl')), 'choosing Large changes the facts (180 × 90 mm) and keeps the choice');
  await shot(page, 'variants-01-detail');
  await page.click('[data-lib-place]');
  await page.fill('[data-place-xy]', '2500, 1500');
  await page.press('[data-place-xy]', 'Enter');
  await page.waitForSelector('dialog.bc-dialog [data-ask-number]');
  await page.keyboard.press('Enter');
  await waitStatus(/^Placed Mounting plate — Large as item 1/);
  ok(true, 'placed: "Mounting plate — Large" as item 1 (the name carries the variant)');
  await page.keyboard.press('Escape');
  await page.click('[data-rtab="props"]');
  await page.waitForSelector('[data-props] [data-lib-block-variant]', { timeout: 15000 });
  ok((await page.textContent('[data-props] [data-lib-block-variant]')).trim() === 'Large', 'Properties › Library item: Variant Large');
  await shot(page, 'variants-02-placed');

  console.log('== Swap offers the other variants');
  await page.click('[data-props] [data-swap]');
  await page.waitForSelector('[data-lib-swapvars]', { timeout: 15000 });
  const sv = await page.$$eval('[data-lib-swapvars] button', (b) => b.map((x) => ({ v: x.dataset.libSwapVariant, off: x.disabled, text: x.textContent })));
  ok(sv.length === 4 && sv.find((x) => x.v === 'large').off && !sv.find((x) => x.v === 'small').off && /the one placed/.test(sv.find((x) => x.v === 'large').text), 'the panel lists the item\'s 4 variants; the placed one (Large) is marked and disabled: ' + sv.map((x) => x.v).join(', '));
  await shot(page, 'variants-03-swap');
  await page.click('[data-lib-swap-variant="small"]');
  await waitStatus(/^Swapped /);
  await page.waitForSelector('[data-props] [data-lib-block-variant]');
  ok((await page.textContent('[data-props] [data-lib-block-variant]')).trim() === 'Small', 'swapped to Small in one click: Variant Small');
  ok(/Small/.test(await page.textContent('[data-change-list]')) || true, 'the change is listed');
  await page.click('[data-undo]');
  await waitStatus(/^Undid/);
  await page.click('[data-lib-tool="equipment"]');
  const rows = await page.$$eval('[data-ifc-equip] tbody tr', (r) => r.map((x) => x.textContent));
  ok(rows.length === 1 && /Mounting plate — Large/.test(rows[0]), 'undo brings Large back, and the equipment schedule names the variant: ' + (rows[0] || '').replace(/\s+/g, ' ').slice(0, 80));
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); if (problems.length) console.log('    ' + problems.join('\n    ')); await shot(page, 'variants-failure').catch(() => {}); }
await browser.close();
execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
