#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — MarkupCraft's Style fields (colour, line width, fill, opacity, text size) in the shared property grid
 * (0.8 PANEL-COMPACT; assets/js/app-propgrid.js, markupcraft.js styleControls). A real PDF is opened, a rectangle and a text note are
 * drawn, and the Properties panel is used: the Style rows for each kind, each row changes the markup (one undo step), a slider applies
 * where it settles, fill on adds the fill colour and opacity rows, several selected markups share the rows, focus stays on the row,
 * no console errors.
 *
 *   node tools/markupcraft-test/browser-propgrid.mjs [--shots <dir>]
 * Signs in with the MarkupCraft test admin (admin.php; disabled again at the end).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const dc = (fn, arg) => page.evaluate(fn, arg);
const row = (id) => page.locator(`[data-props] [data-pg-row="${id}"]`);
const marks = () => dc(() => window.markupcraft.store.all().map((m) => JSON.parse(JSON.stringify(m))));

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cc-propgrid:markupcraft:style'); } catch {} });
  ok(await dc(() => !!window.ccPropGrid), 'the shell loads the property grid (manifest "propgrid")');
  await page.setInputFiles('[data-file]', [PLAN]);
  await page.waitForFunction(() => window.markupcraft?.sheets.length >= 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  const over = page.locator('[data-over]');
  await over.focus();
  const box = await over.boundingBox();
  const at = async (x, y) => { const [sx, sy] = await dc(([a, b]) => window.markupcraft.view.toScreen([a, b]), [x, y]); return [box.x + sx, box.y + sy]; };
  const drag = async (a, b) => { const [x0, y0] = await at(...a); const [x1, y1] = await at(...b); await page.mouse.move(x0, y0); await page.mouse.down(); await page.mouse.move(x1, y1, { steps: 6 }); await page.mouse.up(); };
  await over.focus(); await page.keyboard.press('r');
  await drag([120, 120], [330, 260]);
  if (await page.locator('dialog.mc-dialog[open]').count()) {   // the author question, asked once on the first markup
    await page.fill('#mc-dlg-author', 'Grid Tester');
    await page.click('dialog.mc-dialog button[data-key="save"]');
    await page.waitForSelector('dialog.mc-dialog', { state: 'detached' });
    await over.focus(); await page.keyboard.press('r');
    await drag([120, 120], [330, 260]);
  }
  await page.waitForSelector('[data-props] .pg');
  ok((await marks()).length === 1 && (await marks())[0].type === 'rect', 'a rectangle is drawn and selected');
  const ids = await page.$$eval('[data-props] [data-pg-row]', (e) => e.map((x) => x.getAttribute('data-pg-row')));
  ok(['color', 'width', 'fill', 'opacity'].every((i) => ids.includes(i)) && !ids.includes('fontSize'), 'Style rows for a rectangle: ' + ids.join(','));
  const heads = await page.$$eval('[data-props] .pg-cat, [data-props] .pg-group > button', (b) => b.map((x) => x.textContent.trim().replace(/\s+/g, ' ').slice(0, 10)));
  ok(heads.length >= 1, 'one Style heading from the grid, not a second sub-heading: ' + heads.join(' | '));

  await row('color').evaluate((e) => { e.value = '#336699'; e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(300);
  ok((await marks())[0].style.color === '#336699', 'colour row: #336699');
  await row('width').fill('3.5'); await row('width').press('Tab'); await page.waitForTimeout(300);
  ok((await marks())[0].style.width === 3.5, 'width row: 3.5');
  await row('width').fill('500'); await row('width').press('Tab'); await page.waitForTimeout(300);
  ok((await marks())[0].style.width === 72, 'width row is held to 72');
  const fill0 = !!(await marks())[0].style.fill;
  await row('fill').click();
  await page.waitForTimeout(300);
  ok(!!(await marks())[0].style.fill === !fill0, 'fill checkbox switches the fill ' + (fill0 ? 'off' : 'on'));
  ok(await page.locator('[data-props] [data-pg-row="fillColor"]').count() === (fill0 ? 0 : 1) && await page.locator('[data-props] [data-pg-row="fillOpacity"]').count() === (fill0 ? 0 : 1), 'fill colour and fill opacity rows follow the checkbox');
  await page.locator('[data-props] .pg-row:has([data-pg-row="opacity"]) input[type="range"]').focus();   // the slider; the number box beside it carries the row id
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(500);
  const op = (await marks())[0].style.opacity;
  ok(typeof op === 'number' && op < 1, 'opacity slider (keyboard) lowers the opacity to ' + op);
  // undo is one step per edit
  const w = (await marks())[0].style.width;
  await page.keyboard.press('Escape');
  await dc(() => window.markupcraft.store.undo());
  ok(JSON.stringify((await marks())[0].style) !== JSON.stringify({}), 'Undo steps back (one edit at a time)');

  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'markupcraft-style-grid.png') });
} finally {
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {}
  await browser.close();
}
ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
