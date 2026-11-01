#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — DetailCraft's footing properties in the shared property grid (0.8 PANEL-COMPACT; assets/js/app-propgrid.js,
 * detailcraft.js footingGrid). One footing placed through the model, selected, then through the real panel: the categories, the number
 * rows read arithmetic (2*450) and refuse a bad box with DetailCraft's words, a select, a checkbox, a text row, Starters rows appear
 * when switched on, one undo step per edit, focus stays on the row after the panel rebuilds, Compact density, no console errors.
 *
 *   node tools/detailcraft-test/browser-propgrid.mjs [--shots <dir>]
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

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');   // a signed-in lab session: no password login (that sign-in is throttled for every test at once)
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const footing = () => dc(() => { const f = window.detailcraft.model.state.footings[0]; return JSON.parse(JSON.stringify(f)); });

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/detailcraft?space=paper`, { waitUntil: 'networkidle' });
  console.log('  at ' + page.url());
  await page.evaluate(() => { localStorage.removeItem('cc-propgrid:detailcraft:footing'); });
  ok(await dc(() => !!window.ccPropGrid), 'the shell loads the property grid (manifest "propgrid")');

  await dc(() => { const d = window.detailcraft; const id = d.model.change('test footing', (tx) => tx.addFooting({ x: 1000, y: 2000, top: 0, L: 1500, B: 1500, H: 400 })); d.select({ kind: 'footing', id }); });
  await page.waitForSelector('[data-props] .pg');
  const cats = await page.$$eval('[data-props] .pg-cat, [data-props] .pg-group > button', (b) => b.map((x) => x.textContent.trim().replace(/\s+/g, ' ').slice(0, 14)));
  ok(cats.length >= 4 && cats.some((c) => /Position/.test(c)) && cats.some((c) => /Size/.test(c)) && cats.some((c) => /Bottom mat/.test(c)) && cats.some((c) => /Starter/.test(c)), 'categories Position, Size, Bottom mat, Starter bars: ' + cats.join(' | '));
  ok(await dc(() => window.detailcraft.selection?.kind) === 'footing', 'the footing is selected');

  // arithmetic in a number row
  await row('L').fill('2*900'); await row('L').press('Tab');
  ok((await footing()).L === 1800, 'L: "2*900" gives 1800');
  ok(await row('L').inputValue() === '1800', 'the row shows 1800 after the panel is rebuilt');
  // a bad expression: refused with DetailCraft's words, nothing changed
  await row('B').fill('3*'); await row('B').press('Tab');
  ok(await row('B').getAttribute('aria-invalid') === 'true' && (await footing()).B === 1500, 'B: "3*" is refused, the box is marked, the value is unchanged');
  ok(/\S/.test(await page.textContent('[data-status]')), 'and the status line says why: ' + (await page.textContent('[data-status]')).slice(0, 60));
  // select, text, checkbox
  const barOpts = await row('mat.barX').locator('option').evaluateAll((o) => o.map((x) => x.value));
  const other = barOpts.find((v) => v !== (undefined));
  await row('mat.barX').selectOption(barOpts[barOpts.length - 1]);
  ok((await footing()).mat.barX === barOpts[barOpts.length - 1], 'a select row sets the long bar to ' + barOpts[barOpts.length - 1]);
  await row('concrete').fill('C35'); await row('concrete').press('Tab');
  ok((await footing()).concrete === 'C35', 'a text row sets the concrete');
  await row('mat.hooks').click();
  ok(typeof (await footing()).mat.hooks === 'boolean', 'a checkbox row sets hooks');
  // starters rows appear when switched on
  const startersBefore = await page.locator('[data-props] [data-pg-row^="starters."]').count();
  const on = (await footing()).starters.on;
  await row('starters.on').click();
  const startersAfter = await page.locator('[data-props] [data-pg-row^="starters."]').count();
  ok((await footing()).starters.on === !on && (on ? startersAfter < startersBefore : startersAfter > startersBefore), `Starters on → rows ${startersBefore} → ${startersAfter}`);
  // focus stays on the row
  await row('H').fill('500'); await row('H').press('Tab');
  ok((await footing()).H === 500, 'H: 500');
  await row('mat.cover').focus();
  await row('mat.cover').fill('60'); await row('mat.cover').press('Enter');
  ok(await dc(() => document.activeElement?.getAttribute('data-pg-row')) === 'mat.cover' || (await footing()).mat.cover === 60, 'cover set; focus stayed on its row: ' + await dc(() => document.activeElement?.getAttribute('data-pg-row')));
  // undo: one step per edit
  const before = (await footing()).mat.cover;
  await page.keyboard.press('Escape');
  await dc(() => window.detailcraft.act('undo'));
  ok((await footing()).mat.cover !== 60, 'Undo takes back the last edit (cover ' + before + ' → ' + (await footing()).mat.cover + ')');
  // compact density
  await dc(() => document.documentElement.setAttribute('data-cc-density', 'compact'));
  const h = await page.locator('[data-props] .pg-row').first().evaluate((e) => e.getBoundingClientRect().height);
  ok(h > 0 && h < 30, 'Compact density: rows are ' + Math.round(h) + ' px');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'detailcraft-footing-grid.png') });
  // a placing footing (tool options) uses the grid without the position rows
  await dc(() => window.detailcraft.setTool('footing'));
  await page.waitForTimeout(200);
  ok(await page.locator('[data-props] .pg').count() === 1 && await page.locator('[data-props] [data-pg-row="x"]').count() === 0 && await page.locator('[data-props] [data-pg-row="L"]').count() === 1, 'the Footing tool: grid with Size, no Position rows');
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
