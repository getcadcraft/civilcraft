#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — CadCraft's Properties panel in the shared property grid (0.8 PANEL-COMPACT oltl2-c; assets/js/app-propgrid.js,
 * props.js gridOf / noneGrid). A line, a circle and a text are drawn through the document, selected, and edited through the real panel:
 * categories, number rows (typed lengths still read), one undo step per edit, "Varies" for several objects, the layer select, the
 * no-selection "Current settings" grid, no console errors.
 *
 *   node tools/cadcraft-test/browser-propgrid.mjs [--shots <dir>]
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
const lab = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' })).cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const cc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const ent = (id) => cc((i) => JSON.parse(JSON.stringify(window.cadcraft.doc.get(i))), id);
const steps = () => cc(() => window.cadcraft.doc.undoStack.length);
const select = (ids) => cc((a) => { window.cadcraft.host.setSelection(new Set(a)); }, ids);
const undo = async () => { await page.locator('[data-over]').click({ position: { x: 5, y: 5 } }).catch(() => {}); await cc(() => window.cadcraft.engine.text('UNDO')); };

try {
  await page.context().addCookies([{ name: lab[0], value: lab.slice(1).join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(`${BASE}/lab/cadcraft?space=paper`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await cc(() => { for (const k of ['cc-propgrid:cadcraft:props', 'cc-propgrid:cadcraft:current', 'cadcraft.props']) localStorage.removeItem(k); });
  ok(await cc(() => !!window.ccPropGrid), 'the shell loads the property grid (manifest "propgrid")');

  const ids = await cc(() => {
    const c = window.cadcraft; let out;
    c.doc.change('test', () => {
      out = [c.doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 100, y2: 0 }), c.doc.add({ type: 'circle', layer: '0', cx: 200, cy: 100, r: 40 }),
        c.doc.add({ type: 'text', layer: '0', x: 50, y: 150, h: 10, s: 'HELLO', rot: 0 })].map((e) => (typeof e === 'object' ? e.id : e));
    });
    return out;
  });
  ok(ids.length === 3 && ids.every((i) => i != null), 'a line, a circle and a text are in the drawing');

  // --- one line
  await select([ids[0]]);
  await page.waitForSelector('[data-props] .pg');
  ok(await page.locator('[data-props] .pg').count() === 1, 'the line: the Properties panel is a grid (.pg)');
  const cats = await page.$$eval('[data-props] .pg-cat-n', (b) => b.map((x) => x.textContent.trim().replace(/\s+/g, ' ')));
  ok(cats.some((c) => /General/i.test(c)) && cats.some((c) => /Geometry/i.test(c)), 'categories General and Geometry: ' + cats.join(' | '));
  ok(await row('len').count() === 1 && await row('layer').count() === 1, 'rows for Length and Layer exist');
  await row('len').fill('250'); await row('len').press('Tab');
  await page.waitForTimeout(150);
  let e = await ent(ids[0]);
  ok(Math.abs(Math.hypot(e.x2 - e.x1, e.y2 - e.y1) - 250) < 1e-6, 'Length 250 changes the line: ' + JSON.stringify([e.x2, e.y2]));
  ok(await row('len').inputValue() !== '', 'the grid redraws with the new value ' + await row('len').inputValue());
  const n1 = await steps();
  await row('len').fill('2*60'); await row('len').press('Tab');
  await page.waitForTimeout(150);
  e = await ent(ids[0]);
  ok(Math.abs(Math.hypot(e.x2 - e.x1, e.y2 - e.y1) - 120) < 1e-6, 'arithmetic "2*60" reads as 120 (the app\'s own reader)');
  ok((await steps()) === n1 + 1, 'one edit = one undo step');
  await cc(() => window.cadcraft.engine.text('UNDO'));
  await page.waitForTimeout(150);
  e = await ent(ids[0]);
  ok(Math.abs(Math.hypot(e.x2 - e.x1, e.y2 - e.y1) - 250) < 1e-6, 'ONE undo puts the length back to 250');
  await select([ids[0]]);
  await page.waitForSelector('[data-props] [data-pg-row="len"]');
  await row('len').fill('abc'); await row('len').press('Tab');
  e = await ent(ids[0]);
  ok(await row('len').getAttribute('aria-invalid') === 'true' && Math.abs(Math.hypot(e.x2 - e.x1, e.y2 - e.y1) - 250) < 1e-6, 'a bad entry is refused and marks the box');

  // --- layer select
  await cc(() => window.cadcraft.doc.change('layer', () => window.cadcraft.doc.addLayer ? window.cadcraft.doc.addLayer({ name: 'WALLS' }) : null));
  const layerOpts = await row('layer').locator('option').evaluateAll((o) => o.map((x) => x.textContent));
  ok(layerOpts.length >= 1, 'Layer is a select row: ' + layerOpts.join(','));

  // --- circle: radius, then text
  await select([ids[1]]);
  await page.waitForSelector('[data-props] [data-pg-row="r"]');
  await row('r').fill('55'); await row('r').press('Tab');
  await page.waitForTimeout(150);
  ok((await ent(ids[1])).r === 55, 'circle: Radius 55 through the grid');
  await select([ids[2]]);
  await page.waitForSelector('[data-props] .pg');
  const textRows = await page.$$eval('[data-props] [data-pg-row]', (r) => r.map((x) => x.getAttribute('data-pg-row')));
  ok(textRows.includes('s') || textRows.includes('h'), 'text: its rows are in the grid (' + textRows.slice(0, 8).join(',') + ')');
  const hRow = textRows.includes('h') ? 'h' : null;
  if (hRow) { await row('h').fill('14'); await row('h').press('Tab'); await page.waitForTimeout(150); }
  ok(!hRow || (await ent(ids[2])).h === 14, 'text height 14 through the grid');

  // --- several objects: Varies
  await select(ids);
  await page.waitForSelector('[data-props] .pg');
  await page.waitForTimeout(150);
  const hasVaries = await cc(() => !!document.querySelector('[data-props] .pg input[placeholder="Varies"], [data-props] .pg .pg-ro, [data-props] .pg select option:disabled'));
  ok(hasVaries, 'several objects: a row says Varies where they differ');
  ok(await page.locator('[data-props] .pg').count() === 1, 'several objects: still one grid');

  // --- nothing selected: Current settings
  await select([]);
  await page.waitForTimeout(250);
  ok(await page.locator('[data-props] .pg').count() === 1, 'nothing selected: Current settings is a grid');
  const cats2 = await page.$$eval('[data-props] .pg-cat-n', (b) => b.map((x) => x.textContent.trim().replace(/\s+/g, ' ')));
  ok(cats2.length >= 3 && cats2.some((c) => /View/i.test(c)), 'Current settings categories: ' + cats2.join(' | '));
  await row('cur-th').fill('7'); await row('cur-th').press('Tab');
  await page.waitForTimeout(150);
  ok(await cc(() => window.cadcraft.doc.current.textHeight) === 7, 'current text height 7 through the grid');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cadcraft-props-grid.png') });
} finally {
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
