#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fixes_PART_2.mjs — 0.6 round 2, session cad-fixes_PART_2, in CadCraft (/lab), headless. One section per finished
 * item.
 *
 *   node tools/cadcraft-test/browser-fixes_PART_2.mjs [--shots <dir>] [--only dc68,dc72,dc14,dc67]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin
 * cctest+cadcraft@projectz.xyz). Uses the cached Playwright Chromium. Fails on any console error.
 *   dc68  a crossing window dragged with the mouse before STRETCH: the rectangle's right side moves, its left side stays.
 *   dc72  the Annotate group's dimension buttons are on screen; Current settings › Units in the text = m → a new dimension
 *         reads 1.25 m; Properties › Units in the text = cm on it; Ctrl+S → DWG → opened again: still 125 cm.
 *   dc14  Plot dialog: Plot style lists the built-ins; Edit tables… → New, name "office", colour 1 prints blue at 0.50 mm →
 *         Done: the model plots with it (preview list), Download PDF; Export the table, Import it back ("office (2)");
 *         Ctrl+S → DWG → opened again: the table and the model's choice are still there.
 *   dc67  a click on an empty spot clears the selection, Shift+click keeps it; Settings › CadCraft › Clicking an empty spot ›
 *         Keeps the selection: the click keeps it, Esc clears it.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const oi = args.indexOf('--only');
const ONLY = oi >= 0 ? new Set(args[oi + 1].split(',')) : null;
const run = (k) => !ONLY || ONLY.has(k);
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const goto = async (url) => { await page.goto(BASE + url, { waitUntil: 'networkidle' }); await page.waitForFunction(() => !!window.cadcraft); };
/** A drawing point → page pixels. */
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80); };
const lassoThrough = async (pts) => {
  const lp = await Promise.all(pts.map(([x, y]) => screen(x, y)));
  await page.mouse.move(lp[0].x, lp[0].y); await page.mouse.down();
  for (const q of lp.slice(1)) await page.mouse.move(q.x, q.y, { steps: 6 });
  await page.mouse.up(); await page.waitForTimeout(100);
};
const download = async (action) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), action()]);
  const f = await dl.path();
  return { name: dl.suggestedFilename(), file: f, bytes: fs.readFileSync(f) };
};
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');

try {
  if (run('dc68')) {
    console.log('\n== DC.68 STRETCH takes a selection made before the command');
    await goto('/lab/cadcraft?space=paper');
    await typeCmd('RECTANG'); await typeCmd('0,0'); await typeCmd('100,100');
    await typeCmd('ZOOM'); await typeCmd('E'); await typeCmd('ZOOM'); await typeCmd('0.5X');   // room round it for the window's corners
    const rectXs = () => page.evaluate(() => ([...window.cadcraft.doc.model.values()].find((e) => e.type === 'poly')?.pts || []).map((p) => p.x).sort((a, b) => a - b));
    const selState = () => page.evaluate(() => ({ n: window.cadcraft.host.selection.size, w: (window.cadcraft.host.selection.windows || []).length }));
    for (const [how, make] of [
      ['click, click right to left (a crossing window)', async () => { await clickAt(110, 110); await clickAt(90, -10); }],
      ['a crossing lasso drawn leftward', async () => { await lassoThrough([[110, 110], [90, 110], [90, -10], [110, -10], [110, 108]]); }],
    ]) {
      await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
      await make();
      const sel = await selState();
      ok(sel.n === 1 && sel.w === 1, `${how} with no command running: the rectangle is selected and the window kept with it`, JSON.stringify(sel));
      await shot('dc68-preselected-' + (how.startsWith('click') ? 'window' : 'lasso'));
      const before = (await history()).length;
      await typeCmd('STRETCH'); await typeCmd('0,0'); await typeCmd('50,0');
      const xs = await rectXs();
      ok(xs.length === 4 && near(xs[0], 0) && near(xs[1], 0) && near(xs[2], 150) && near(xs[3], 150), `then STRETCH 50: only the right side moves (${how})`, JSON.stringify(xs));
      ok(!/No window was used/.test((await history()).slice(before)), 'no "No window was used" message');
      await shot('dc68-stretched-' + (how.startsWith('click') ? 'window' : 'lasso'));
      await page.keyboard.press('Control+z'); await page.waitForTimeout(100);
    }
  }

  if (run('dc72')) {
    console.log('\n== DC.72 dimensions in the units you work in');
    await goto('/lab/cadcraft?space=paper');
    const btns = await page.evaluate(() => ['DIMLINEAR', 'DIMALIGNED', 'DIMANGULAR', 'DIMRADIUS', 'DIMDIAMETER'].map((c) => { const b = document.querySelector(`[data-cmd="${c}"]`); const r = b?.getBoundingClientRect(); return !!(r && r.width > 0 && r.height > 0 && b.closest('[role=group]')); }));
    ok(btns.every(Boolean), 'the five dimension buttons are in a toolbar group on screen at 1440 px (what the help points to)', JSON.stringify(btns));
    await page.selectOption('#cc-cur-units', 'millimeters'); await page.waitForTimeout(150);
    await page.keyboard.press('Escape');
    ok(await page.isVisible('#cc-cur-dtunit'), 'Current settings › New dimensions has "Units in the text"');
    await page.selectOption('#cc-cur-dtunit', 'm'); await page.waitForTimeout(100);
    await typeCmd('DIMALIGNED'); await typeCmd('0,0'); await typeCmd('1250,0'); await typeCmd('600,300');
    await typeCmd('ZOOM'); await typeCmd('E');
    const text = () => page.evaluate(async () => { const D = await import('/assets/apps/cadcraft/dev/dims.js'); const e = [...window.cadcraft.doc.model.values()].find((x) => x.type === 'dim'); return e ? D.dimText(e) : null; });
    ok(await text() === '1.25 m', 'a new dimension of 1250 mm reads 1.25 m', String(await text()));
    await page.evaluate(() => { const e = [...window.cadcraft.doc.model.values()].find((x) => x.type === 'dim'); window.cadcraft.host.setSelection(new Set([e.id])); });
    await page.waitForTimeout(400);
    const sel = await page.evaluate(() => { const l = [...document.querySelectorAll('[data-props] label')].find((x) => x.textContent.trim() === 'Units in the text'); return l ? l.htmlFor : null; });
    ok(!!sel, 'Properties shows "Units in the text" for the dimension');
    if (sel) { await page.selectOption(`[id="${sel}"]`, 'cm'); await page.waitForTimeout(200); }
    ok(await text() === '125 cm', 'changed to cm there: 125 cm', String(await text()));
    await shot('dc72-01-cm');
    await page.evaluate(() => window.cadcraft.host.setSelection(new Set()));
    const dwg = await download(() => page.keyboard.press('Control+s'));
    ok(/\.dwg$/.test(dwg.name), 'Ctrl+S saves a DWG', dwg.name);
    await page.setInputFiles('[data-file]', dwg.file);
    await page.waitForFunction(() => window.cadcraft?.doc?.model?.size > 0 && [...window.cadcraft.doc.model.values()].some((x) => x.type === 'dim'), null, { timeout: 30000 });
    await page.waitForTimeout(300);
    ok(await text() === '125 cm', 'opened again: still 125 cm', String(await text()));
    await shot('dc72-02-reopened');
  }
  if (run('dc14')) {
    console.log('\n== DC.14 plot style tables');
    await goto('/lab/cadcraft?space=paper');
    await typeCmd('LINE'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
    await page.evaluate(() => { const d = window.cadcraft.doc; const e = [...d.model.values()][0]; d.change('t', () => d.update(e.id, { ...e, color: 1 })); });
    await typeCmd('LINE'); await typeCmd('0,20'); await typeCmd('100,20'); await typeCmd('');
    await typeCmd('ZOOM'); await typeCmd('E');
    await typeCmd('PLOT'); await page.waitForSelector('dialog[data-plot][open]');
    const opts = await page.evaluate(() => [...document.querySelectorAll('[data-plot-style] option')].map((o) => o.value));
    ok(opts.join() === 'colour,monochrome,grayscale', 'Plot style lists the three built-in tables', opts.join());
    ok(await page.inputValue('[data-plot-style]') === 'monochrome', 'a drawing with no table chosen starts on Monochrome (as the old default ink)');
    await page.click('[data-plot-style-edit]'); await page.waitForSelector('dialog[data-plotstyle][open]');
    ok(await page.isVisible('[data-ps-readonly]'), 'a built-in table opens read only, with Copy offered');
    await page.click('[data-ps-act="new"]');
    await page.fill('[data-ps-name]', 'office'); await page.press('[data-ps-name]', 'Tab');
    await page.click('[data-ps-aci="1"]');
    await page.selectOption('[data-ps-color]', 'pick');
    await page.evaluate(() => { const i = document.querySelector('dialog[data-plotstyle] input[type=color]'); i.value = '#0000ff'; i.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.selectOption('[data-ps-lw]', '0.5');
    ok(await page.evaluate(() => document.querySelector('[data-ps-aci="1"]').classList.contains('is-set')), 'the colour shows it has its own pen');
    await shot('dc14-01-editor');
    const steps = await page.evaluate(() => window.cadcraft.doc.undoStack.length);
    await page.click('dialog[data-plotstyle] [data-key="ok"]');
    await page.waitForTimeout(200);
    const kept = await page.evaluate(() => JSON.stringify(window.cadcraft.doc.meta.plotStyles));
    ok(/"name":"office"/.test(kept) && /"1":\{"color":"#0000ff","gray":false,"screen":100,"lw":0.5\}/.test(kept) && /"model":"office"/.test(kept), 'Done keeps the table with the drawing and the model now plots with it', kept);
    ok(await page.evaluate(() => window.cadcraft.doc.undoStack.length) - steps === 2, 'one undo step for the tables, one for the choice');
    ok(await page.inputValue('[data-plot-style]') === 'office', 'the Plot dialog shows office');
    const strokes = await page.evaluate(async () => {
      const Pl = await import('/assets/apps/cadcraft/dev/plot.js'), Ps = await import('/assets/apps/cadcraft/dev/plotstyle.js'); const d = window.cadcraft.doc;
      const l = Pl.displayList(d, Pl.modelSheet(d, { area: { minX: 0, minY: 0, maxX: 100, maxY: 20 }, paper: 'iso-a4' }), { style: Ps.findTable(d, 'office') });
      return l.views[0].strokes.map((x) => x.color + '/' + x.lw).sort().join(' ');
    });
    ok(strokes === '#000000/-3 #0000ff/0.5', 'the red line prints blue at 0.50 mm, the other as drawn', strokes);
    await shot('dc14-02-plot-dialog');
    const pdf = await download(() => page.click('[data-plot-save]'));
    ok(/\.pdf$/.test(pdf.name) && pdf.bytes.subarray(0, 5).toString('latin1') === '%PDF-', 'Download PDF makes a PDF', pdf.name);
    // export and import the table
    await typeCmd('PLOTSTYLES'); await page.waitForSelector('dialog[data-plotstyle][open]');
    ok(await page.inputValue('[data-ps-table]') === 'office', 'PLOTSTYLES opens on the table in use');
    const ex = await download(() => page.click('[data-ps-act="export"]'));
    ok(ex.name === 'office.plotstyle.json' && /"format": "cadcraft-plotstyle"/.test(ex.bytes.toString()), 'Export saves office.plotstyle.json', ex.name);
    const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-ps-act="import"]')]);
    await chooser.setFiles(ex.file.endsWith('.json') ? ex.file : (fs.copyFileSync(ex.file, ex.file + '.json'), ex.file + '.json'));
    await page.waitForTimeout(300);
    ok(await page.inputValue('[data-ps-table]') === 'office (2)', 'Import adds it back under a free name', await page.inputValue('[data-ps-table]'));
    await page.click('dialog[data-plotstyle] [data-key="cancel"]');
    ok(await page.evaluate(() => window.cadcraft.doc.meta.plotStyles.tables.length) === 1, 'Cancel drops the imported copy');
    // kept in the DWG
    const dwg = await download(() => page.keyboard.press('Control+s'));
    const reopen = path.join(path.dirname(dwg.file), 'dc14-reopen.dwg');
    fs.copyFileSync(dwg.file, reopen);
    await page.setInputFiles('[data-file]', reopen);
    await page.waitForFunction(() => window.cadcraft?.doc?.meta?.source === 'dc14-reopen.dwg' && window.cadcraft.doc.model.size > 0, null, { timeout: 30000 });
    await page.waitForTimeout(300);
    const again = await page.evaluate(() => JSON.stringify(window.cadcraft.doc.meta.plotStyles));
    ok(/"name":"office"/.test(again) && /"model":"office"/.test(again), 'opened again from the DWG: the table and the choice are there', again);
  }
  if (run('dc67')) {
    console.log('\n== DC.67 clicking an empty spot');
    await goto('/lab/cadcraft?space=paper');
    await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cadcraft.settings') || '{}'); delete s.emptyClick; localStorage.setItem('cadcraft.settings', JSON.stringify(s)); } catch {} });
    await goto('/lab/cadcraft?space=paper');
    await typeCmd('LINE'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('');
    await typeCmd('ZOOM'); await typeCmd('E'); await typeCmd('ZOOM'); await typeCmd('0.5X');
    await page.keyboard.press('Escape');
    const n = () => page.evaluate(() => window.cadcraft.host.selection.size);
    const emptyClick = async (shift) => { if (shift) await page.keyboard.down('Shift'); await clickAt(50, 40); await clickAt(50, 40); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(100); };
    await clickAt(50, 0);
    ok(await n() === 1, 'a click on the line selects it');
    await emptyClick(true);
    ok(await n() === 1, 'Shift+click on an empty spot keeps the selection');
    await emptyClick(false);
    ok(await n() === 0, 'a click on an empty spot clears it (the start)');
    // Settings › CadCraft › Clicking an empty spot › Keeps the selection
    await page.keyboard.press('Control+,'); await page.waitForTimeout(300);
    const radio = page.locator('input[name="ccEmptyClick"][value="keep"]');
    ok(await radio.count() === 1, 'Settings › CadCraft has "Clicking an empty spot"');
    await radio.check({ force: true }); await page.waitForTimeout(100);
    await shot('dc67-01-setting');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    if (await page.evaluate(() => !!document.querySelector('dialog[open]'))) await page.evaluate(() => document.querySelector('dialog[open]')?.close());
    await clickAt(50, 0);
    await emptyClick(false);
    ok(await n() === 1, 'with "Keeps the selection": a click on an empty spot keeps it');
    ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings') || '{}').emptyClick) === 'keep', 'the choice is kept in this browser');
    await page.click('[data-cmd-input]'); await page.keyboard.press('Escape'); await page.waitForTimeout(100);
    ok(await n() === 0, 'and Esc clears it');
    await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cadcraft.settings') || '{}'); delete s.emptyClick; localStorage.setItem('cadcraft.settings', JSON.stringify(s)); } catch {} });
  }
} finally {
  await browser.close();
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
