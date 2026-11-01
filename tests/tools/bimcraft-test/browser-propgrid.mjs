#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — BimCraft's Properties panel in the shared property grid (0.8 PANEL-COMPACT; assets/js/app-propgrid.js,
 * bimcraft.js propsGrid). Opens fixtures/showcase/bimcraft-house.ifc in the lab, picks walls, and drives the real grid: the element's
 * attributes and every property set as categories, an attribute edit, a property-set value edit (copy-on-write: the neighbour wall is
 * unchanged), a typed number refused with the editor's words, Ctrl+Z restores, shared type note, no console errors.
 *   node tools/bimcraft-test/browser-propgrid.mjs [--shots <dir>]
 * Run as root; signs in with a minted lab session (tools/shell-test/admin.php session), no password login.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const IFC = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const waitProps = () => page.waitForSelector('[data-props] [data-bc-propgrid] .pg-row', { timeout: 20000 });
/** Pick the n-th element of a class the way a click does. */
const pickKey = (k) => page.evaluate((key) => { const v = document.querySelector('[data-canvas]').viewer; v.select([key]); v.onPick(key); }, k);
const wallKeys = () => page.evaluate(() => { const o = []; for (const [k, n] of window.bimcraftTree().tree.byKey) if (n.cls === 'IfcWall' || n.cls === 'IfcWallStandardCase') o.push(k); return o; });
/** Every grid row now: id, category, label, type, value. */
const gridRows = () => page.$$eval('[data-props] [data-bc-propgrid] .pg-row', (rs) => rs.map((r) => {
  const inp = r.querySelector('input,select');
  return { id: r.getAttribute('data-pg-id'), type: r.getAttribute('data-pg-type'), label: r.querySelector('label')?.textContent, cat: r.closest('.pg-cat')?.querySelector('.pg-cat-b')?.getAttribute('data-pg-cat'), value: inp ? inp.value : r.textContent };
}));
const pgRow = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-propgrid:bimcraft')) localStorage.removeItem(k); });
  ok(await page.evaluate(() => !!window.ccPropGrid), 'the shell loads the property grid (manifest "propgrid")');
  await page.setInputFiles('[data-file]', IFC);
  await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 90000 });
  const walls = await wallKeys();
  ok(walls.length >= 2, 'the house has walls to pick (' + walls.length + ')');

  console.log('== Categories');
  await pickKey(walls[0]); await waitProps();
  const rows = await gridRows();
  const cats = [...new Set(rows.map((r) => r.cat))];
  ok(cats.length >= 3, 'categories: the element and its property sets (' + cats.join(' | ') + ')');
  ok(cats.some((c) => /^Wall/.test(c)) && cats.some((c) => /^Pset_/.test(c)), 'the element class and a Pset_ category are there');
  ok(!(await page.$('[data-props] details.bc-set')), 'no old collapsible property sets: the grid replaces them');
  const nm = rows.find((r) => r.id === 'a:Name');
  ok(nm && nm.type === 'text', 'Name is a text row');
  ok(['r:type', 'r:guid', 'r:line'].every((i) => rows.find((r) => r.id === i && r.type === 'readonly')), 'type, GlobalId and line number are read-only rows');
  ok(rows.some((r) => r.id.startsWith('p:') && r.type === 'select' || r.id.startsWith('p:') && r.type === 'text' || r.id.startsWith('p:') && r.type === 'number'), 'editable property rows are text / number / select rows');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'bimcraft-propgrid.png') });

  console.log('== Attribute edit and undo');
  const oldDesc = (await gridRows()).find((r) => r.id === 'a:Description').value;
  await pgRow('a:Description').fill('grid-test description'); await pgRow('a:Description').press('Tab');
  await page.waitForFunction(() => document.querySelector('[data-props] [data-pg-row="a:Description"]')?.value === 'grid-test description');
  ok((await page.evaluate(() => document.querySelector('[data-changes]')?.textContent || '')).length >= 0 && await pgRow('a:Description').inputValue() === 'grid-test description', 'the attribute shows the new text');
  await pickKey(walls[1]); await waitProps();
  ok((await gridRows()).find((r) => r.id === 'a:Description').value !== 'grid-test description', 'the other wall keeps its own description');
  await pickKey(walls[0]); await waitProps();
  ok((await gridRows()).find((r) => r.id === 'a:Description').value === 'grid-test description', 'wall 1 shows the new description after the panel rebuilt');
  await page.keyboard.press('Control+z');
  await page.waitForFunction((v) => document.querySelector('[data-props] [data-pg-row="a:Description"]')?.value === v, oldDesc);
  ok(true, 'Ctrl+Z restores the description (' + JSON.stringify(oldDesc) + ')');

  console.log('== Property-set value: copy-on-write');
  // a text row in a Pset that both walls have
  const scan = {};
  for (const k of walls.slice(0, 6)) { await pickKey(k); await waitProps(); scan[k] = (await gridRows()).filter((r) => r.id.startsWith('p:') && r.type === 'text' && r.cat); }
  let pick = null;
  const ks = Object.keys(scan);
  outer: for (const a of ks) for (const r of scan[a]) { for (const b of ks) { if (b === a) continue; const m = scan[b].find((x) => x.cat === r.cat && x.label === r.label); if (m) { pick = { a: Number(a), b: Number(b), cat: r.cat, label: r.label, was: r.value, bwas: m.value }; break outer; } } }
  ok(!!pick, 'two walls share a text property to edit' + (pick ? ' (' + pick.cat + ' / ' + pick.label + ')' : ''));
  if (pick) {
    const idOf = async (k) => { await pickKey(k); await waitProps(); return (await gridRows()).find((r) => r.cat === pick.cat && r.label === pick.label); };
    const ra = await idOf(pick.a);
    await pgRow(ra.id).fill('grid-cow-test'); await pgRow(ra.id).press('Tab');
    await page.waitForFunction((a) => document.querySelector(`[data-props] [data-pg-row="${a}"]`)?.value === 'grid-cow-test', ra.id);
    ok(true, 'edited through the grid: ' + pick.label + ' = grid-cow-test');
    const rb = await idOf(pick.b);
    ok(rb.value === pick.bwas, 'the neighbour wall is unchanged (copy-on-write): ' + JSON.stringify(rb.value));
    ok(((await idOf(pick.a)).value) === 'grid-cow-test', 'the edited wall keeps the new value');
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(300);
    await pickKey(pick.a); await waitProps();
    ok(((await gridRows()).find((r) => r.cat === pick.cat && r.label === pick.label).value) === pick.was, 'Ctrl+Z puts the old value back');
  }

  console.log('== Typed numbers');
  let numRow = null;
  for (const k of walls) { await pickKey(k); await waitProps(); numRow = (await gridRows()).find((r) => r.id.startsWith('p:') && r.type === 'number'); if (numRow) break; }
  if (numRow) {
    const was = numRow.value;
    await pgRow(numRow.id).fill('abc'); await pgRow(numRow.id).press('Tab');
    ok(await pgRow(numRow.id).getAttribute('aria-invalid') === 'true' && /number/i.test(await page.textContent('[data-status]')), 'a number row refuses "abc" with the editor\'s words: ' + (await page.textContent('[data-status]')).slice(0, 40));
    ok(await pgRow(numRow.id).inputValue() === 'abc', 'the refused text stays in the box, marked, for correction');
    await pgRow(numRow.id).fill(String(Number(was) + 1)); await pgRow(numRow.id).press('Tab');
    await page.waitForFunction(([i, v]) => Number(document.querySelector(`[data-props] [data-pg-row="${i}"]`)?.value) === v, [numRow.id, Number(was) + 1]);
    ok(true, 'a real number is written (' + was + ' → ' + (Number(was) + 1) + ')');
    await page.keyboard.press('Control+z');
  } else ok(true, '(this house has no numeric editable property: skipped)');

  console.log('== Type note');
  let typed = false;
  for (const k of walls) { await pickKey(k); await waitProps(); if (await page.$('[data-props] .bc-type-note')) { typed = true; break; } }
  ok(typed, 'type properties note shown where a set comes from the type: ' + typed);
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' / ') : ''));
} catch (e) {
  fail++; console.log('  FAIL exception: ' + (e.stack || e.message));
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
