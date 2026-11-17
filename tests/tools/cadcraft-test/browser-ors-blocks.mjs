#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-ors-blocks.mjs — the click-through for builder "blocks" (1.0 ORS.23, ORS.24, ORS.31) in CadCraft's lab build, headless.
 * The engines are tested in Node: bin/test-blocks-panel.mjs, bin/test-smartblocks.mjs, bin/test-lispedit.mjs.
 *
 *   node tools/cadcraft-test/browser-ors-blocks.mjs [--shots <dir>]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin
 * cctest+cadcraft@projectz.xyz, as bin/test-cadcraft-browser-geo_PART_2.mjs does). Cached Playwright Chromium. Fails on any
 * console error.
 *   Blocks panel: a picture per block, filter, list / grid, click a picture → INSERT → a click places it, recent first,
 *   Libraries › Add a drawing (a DXF made here) → its blocks with pictures → placed (copied in once, no question the second
 *   time), a tile dragged onto the drawing is placed where it is dropped, BLOCKSPALETTE.
 *   Smart blocks: BCONVERT on drawn copies, BSEARCH, BREPLACE, INSERT's suGgested places, typed on the command line.
 *   LISP editor: VLIDE opens it; line numbers, the parenthesis pair, Enter indents; Load into the drawing makes a command
 *   that runs; Run selection; an error shows with its line; the function lists.
 * Not covered here: CadCraft Studio's folder libraries (the desktop bridge is stood in for by a fake in one check).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(REPO, 'public_html/assets/apps/cadcraft/dev');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

// a library drawing, written by the app's own DXF writer
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { writeDxf } = await load('dxf.js');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-ors-blocks-'));
const libFile = path.join(tmp, 'office-lib.dxf');
{
  const d = new Doc();
  d.meta.units = 'millimeters';
  d.change('lib', () => {
    d.addLayer({ name: 'A-DOOR', color: 3 });
    d.defineBlock({ name: 'HINGE', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: 'A-DOOR', cx: 0, cy: 0, r: 20 }] });
    d.defineBlock({ name: 'LIBDOOR', base: { x: 0, y: 0 }, entities: [{ type: 'line', layer: 'A-DOOR', x1: 0, y1: 0, x2: 900, y2: 0 }, { type: 'arc', layer: 'A-DOOR', cx: 0, cy: 0, r: 900, a0: 0, a1: Math.PI / 2 }, { type: 'insert', layer: 'A-DOOR', block: 'HINGE', x: 0, y: 0, sx: 1, sy: 1, rot: 0 }] });
    d.defineBlock({ name: 'LIBSINK', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', cx: 0, cy: 0, r: 200 }, { type: 'circle', layer: '0', cx: 0, cy: 0, r: 30 }] });
    d.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 1000, y2: 0 });
  });
  fs.writeFileSync(libFile, writeDxf(d).text);
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); } catch {} });   // the first-drawing tour and the "new here" offer would sit over the page and take the clicks
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const refused = [];   // a 429 from the site's own rate limits (several test runs share 127.0.0.1) is the server's answer, not a fault of the page
page.on('response', (r) => { if (r.status() === 429) refused.push(new URL(r.url()).pathname); });
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(120); };
const cc = (fn, arg) => page.evaluate(fn, arg);
const refs = (name) => cc((n) => window.cadcraft.doc.all().filter((e) => e.type === 'insert' && e.block === n).length, name);
const esc = async () => { await page.click('[data-cmd-input]'); await page.keyboard.press('Escape'); await page.waitForTimeout(80); };

try {
  console.log('\n== ORS.23 the Blocks panel');
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.removeItem('cadcraft.blocklib'); localStorage.removeItem('cadcraft.lispedit'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.host.blocksPanel);
  await typeCmd('BLOCKSPALETTE');   // the Blocks section starts folded: the command opens it
  await page.waitForTimeout(200);
  ok(await page.isVisible('[data-blocksx-filter]') && await page.isVisible('[data-blocksx-libs]') && await cc(() => document.activeElement === document.querySelector('[data-blocksx-filter]')), 'BLOCKSPALETTE opens the folded Blocks section: the filter (with the cursor in it), the list / grid switch and Libraries');
  await cc(() => {
    const d = window.cadcraft.doc;
    d.meta.units = 'millimeters';
    d.change('fixture', () => {
      d.defineBlock({ name: 'CHAIR', base: { x: 0, y: 0 }, entities: [{ type: 'circle', cx: 0, cy: 0, r: 250 }, { type: 'line', x1: -250, y1: -300, x2: 250, y2: -300 }] });
      d.defineBlock({ name: 'DESK', base: { x: 0, y: 0 }, entities: [{ type: 'poly', closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 1600, y: 0, b: 0 }, { x: 1600, y: 800, b: 0 }, { x: 0, y: 800, b: 0 }] }] });
      d.defineBlock({ name: 'DOOR-900', base: { x: 0, y: 0 }, entities: [{ type: 'line', x1: 0, y1: 0, x2: 900, y2: 0 }, { type: 'arc', cx: 0, cy: 0, r: 900, a0: 0, a1: Math.PI / 2 }] });
      for (const [x, y] of [[0, 0], [4000, 0], [8000, 0]]) d.add({ type: 'insert', block: 'DESK', x, y, sx: 1, sy: 1, rot: 0 });
    });
    window.cadcraft.host.zoomWindow({ x: -2500, y: -5500 }, { x: 11500, y: 9500 });   // every point this run clicks is inside the view
  });
  await page.waitForTimeout(300);
  const tiles = await page.$$eval('[data-block-list] [data-blocksx-item]', (ls) => ls.map((li) => ({ name: li.dataset.blocksxItem, d: li.querySelector('svg path')?.getAttribute('d') || '', text: li.textContent })));
  ok(tiles.length === 3 && tiles.every((x) => x.d.length > 10), 'three blocks, each with a drawn picture', JSON.stringify(tiles.map((x) => [x.name, x.d.length])));
  ok(/A28 28 0/.test(tiles.find((x) => x.name === 'CHAIR')?.d || '') || /A/.test(tiles.find((x) => x.name === 'CHAIR')?.d || ''), 'the chair\'s picture has its circle as arcs');
  ok(tiles.find((x) => x.name === 'DESK')?.text.includes('3×'), 'the uses count is still shown');
  await shot('ors23-list');
  await page.click('[data-blocksx-view="grid"]');
  ok(await page.$eval('[data-block-list]', (u) => u.classList.contains('cc-blocksx-grid')) && await cc(() => JSON.parse(localStorage.getItem('cadcraft.blocklib')).view === 'grid'), 'Grid switches the list to a grid of pictures and is remembered');
  await shot('ors23-grid');
  await page.click('[data-blocksx-view="list"]');
  await page.fill('[data-blocksx-filter]', 'do');
  ok((await page.$$('[data-block-list] [data-blocksx-item]')).length === 1, 'the filter keeps DOOR-900 only');
  await page.fill('[data-blocksx-filter]', 'zzz');
  ok(/No block matches/.test(await page.textContent('[data-block-list]')), 'a filter with no hit says so');
  await page.fill('[data-blocksx-filter]', '');
  // click a picture: INSERT with that block, then a click places it
  await page.click('[data-block-list] [data-blocksx-item="CHAIR"] [data-blocksx-thumb]');
  await page.waitForTimeout(200);
  ok(await cc(() => window.cadcraft.engine.running === 'INSERT' && window.cadcraft.engine.expects === 'point'), 'a click on the picture starts INSERT at its insertion point');
  await clickAt(800, -400);
  ok(await refs('CHAIR') === 1, 'a click in the drawing places the chair');
  await page.waitForTimeout(200);
  const order = await page.$$eval('[data-block-list] [data-blocksx-item]', (ls) => ls.map((li) => li.dataset.blocksxItem));
  ok(order[0] === 'CHAIR' && (await page.$('[data-block-list] [data-blocksx-item="CHAIR"] [data-blocksx-recent]')) !== null, 'the block just placed comes first, marked as recent', order.join());
  ok(await cc(() => JSON.parse(localStorage.getItem('cadcraft.blocklib')).recent[0] === 'CHAIR'), '… and is remembered');
  // the old Insert button still works
  await page.click('[data-block-list] [data-blocksx-item="DOOR-900"] button[aria-label="Insert DOOR-900"]');
  await page.waitForTimeout(200);
  await clickAt(3000, 3000);
  ok(await refs('DOOR-900') === 1, 'the Insert button places a block as before');
  // drag a tile onto the drawing
  const from = await page.$('[data-block-list] [data-blocksx-item="DOOR-900"] [data-blocksx-thumb]');
  const fb = await from.boundingBox(), to = await screen(6000, 3000);
  await page.mouse.move(fb.x + fb.width / 2, fb.y + fb.height / 2);
  await page.mouse.down();
  await page.mouse.move(fb.x + 40, fb.y + 20, { steps: 4 });
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  const dropped = await cc(() => window.cadcraft.doc.all().filter((e) => e.type === 'insert' && e.block === 'DOOR-900').map((e) => [Math.round(e.x), Math.round(e.y)]));
  ok(dropped.length === 2 && dropped.some(([x, y]) => Math.abs(x - 6000) < 60 && Math.abs(y - 3000) < 60), 'a picture dragged onto the drawing places the block where it is dropped', JSON.stringify(dropped));
  if (dropped.length !== 2) await esc();

  // Libraries: add a drawing
  ok(await page.isHidden('[data-blocksx-add-folder]') && /stays until this page closes/.test(await page.textContent('[data-blocksx-libs-note]')), 'in a browser there is no Add a folder, and the note says a file stays until the page closes');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-blocksx-add-file]')]);
  await chooser.setFiles(libFile);
  await page.waitForSelector('[data-blocksx-lib="file"] [data-blocksx-item="LIBDOOR"]', { timeout: 20000 });
  const libTiles = await page.$$eval('[data-blocksx-lib="file"] [data-blocksx-item]', (ls) => ls.map((li) => ({ name: li.dataset.blocksxItem, d: (li.querySelector('svg path')?.getAttribute('d') || '').length })));
  ok(libTiles.length === 4 && libTiles.every((x) => x.d > 10) && libTiles[0].name === 'office-lib.dxf', 'the library lists the whole drawing and its three blocks, each with a picture', JSON.stringify(libTiles));
  ok(/3 blocks/.test(await page.textContent('[data-blocksx-lib="file"] summary')), 'its header says how many blocks');
  await shot('ors23-library');
  await page.click('[data-blocksx-lib="file"] [data-blocksx-item="LIBDOOR"] [data-blocksx-thumb]');
  await page.waitForFunction(() => window.cadcraft.engine.running === 'INSERT' && window.cadcraft.engine.expects === 'point', null, { timeout: 10000 });
  ok(await cc(() => window.cadcraft.doc.blocks.has('LIBDOOR') && window.cadcraft.doc.blocks.has('HINGE') && !window.cadcraft.doc.blocks.has('LIBSINK')), 'a click copies the block and the one it nests into the drawing; not the others');
  await clickAt(0, 5000);
  ok(await refs('LIBDOOR') === 1 && await cc(() => window.cadcraft.doc.layers.has('A-DOOR')), 'and places it; its layer came along');
  await page.click('[data-blocksx-lib="file"] [data-blocksx-item="LIBDOOR"] [data-blocksx-thumb]');
  await page.waitForFunction(() => window.cadcraft.engine.running === 'INSERT' && window.cadcraft.engine.expects === 'point', null, { timeout: 10000 });
  await clickAt(2000, 5000);
  ok(await refs('LIBDOOR') === 2 && await cc(() => ![...window.cadcraft.doc.blocks.keys()].some((n) => /\(2\)/.test(n))) && (await page.$('dialog[open].cc-ask')) === null, 'placing it again asks nothing and makes no second copy');
  await page.click('[data-blocksx-lib-remove]');
  ok((await page.$$('[data-blocksx-lib]')).length === 0 && await cc(() => window.cadcraft.doc.blocks.has('LIBDOOR')), 'the small x removes the library from the list; the drawing keeps its block');
  // Studio's folder library, with a stand-in for the desktop bridge (the real one is Studio's)
  const libText = fs.readFileSync(libFile, 'utf8');
  await cc((text) => {
    const bytes = new TextEncoder().encode(text);
    window.cadcraftDesktop = { version: 0, openFolderDialog: async () => '/home/me/blocks', listDir: async (p) => (p === '/home/me/blocks' ? [{ name: 'office-lib.dxf', dir: false }, { name: 'notes.txt', dir: false }, { name: 'old', dir: true }] : []), readFile: async (p) => { if (p === '/home/me/blocks/office-lib.dxf') return bytes; throw new Error('no such file'); } };
    const b = document.querySelector('[data-blocksx-add-folder]'); b.hidden = false; b.click();
  }, libText);
  await page.waitForSelector('[data-blocksx-lib="folder"] [data-blocksx-lib="file"]', { timeout: 10000 });
  ok(/1 drawing/.test(await page.textContent('[data-blocksx-lib="folder"] > summary')), 'a folder (stand-in bridge) lists its DWG / DXF files only');
  await page.click('[data-blocksx-lib="folder"] [data-blocksx-lib="file"] > summary');
  await page.waitForSelector('[data-blocksx-lib="folder"] [data-blocksx-item="LIBSINK"]', { timeout: 20000 });
  ok(await cc(() => JSON.parse(localStorage.getItem('cadcraft.blocklib')).folders.join() === '/home/me/blocks'), 'opening a file in it reads its blocks; the folder is remembered');
  await page.click('[data-blocksx-lib="folder"] > summary [data-blocksx-lib-remove]');
  await cc(() => { delete window.cadcraftDesktop; });
  ok(await page.isVisible('[data-tb-key="Blocks"] [data-cmd="BLOCKSPALETTE"]') || (await page.$('[data-tb-key="Blocks"] [data-cmd="BLOCKSPALETTE"]')) !== null, 'the toolbar\'s Blocks group has the command');

  console.log('\n== ORS.24 smart blocks');
  await cc(() => {
    const d = window.cadcraft.doc;
    d.change('lamps', () => {
      // a "lamp" drawn loose three times: at 0,-3000; moved; turned 90°
      const lamp = (m) => [{ type: 'circle', cx: 0, cy: 0, r: 150 }, { type: 'line', x1: 0, y1: 0, x2: 400, y2: 0 }, { type: 'line', x1: 400, y1: 0, x2: 400, y2: 120 }].map((e) => window.ccTestTx(e, m));
      window.ccLampIds = [];
      for (const m of [[1, 0, 0, 1, 0, -3000], [1, 0, 0, 1, 3000, -3000], [0, 1, -1, 0, 6000, -3000]]) for (const e of lamp(m)) window.ccLampIds.push(d.add(e).id);
    });
  }).catch(async () => {
    // geom.txEntity is not on the page: draw them with plain numbers
    await cc(() => {
      const d = window.cadcraft.doc;
      d.change('lamps', () => {
        window.ccLampIds = [];
        const add = (e) => window.ccLampIds.push(d.add(e).id);
        for (const [ox, oy] of [[0, -3000], [3000, -3000]]) { add({ type: 'circle', cx: ox, cy: oy, r: 150 }); add({ type: 'line', x1: ox, y1: oy, x2: ox + 400, y2: oy }); add({ type: 'line', x1: ox + 400, y1: oy, x2: ox + 400, y2: oy + 120 }); }
        add({ type: 'circle', cx: 6000, cy: -3000, r: 150 }); add({ type: 'line', x1: 6000, y1: -3000, x2: 6000, y2: -2600 }); add({ type: 'line', x1: 6000, y1: -2600, x2: 5880, y2: -2600 });   // turned 90°
      });
    });
  });
  await cc(() => { window.cadcraft.host.setSelection(new Set(window.ccLampIds.slice(0, 3))); });
  await typeCmd('BCONVERT'); await typeCmd(''); await typeCmd('LAMP'); await typeCmd('');
  ok(/2 other sets of objects are the same geometry/.test(await history()), 'BCONVERT finds the moved and the turned copy', (await history()).slice(-200));
  await typeCmd('Y');
  ok(await refs('LAMP') === 3 && await cc(() => window.ccLampIds.every((id) => !window.cadcraft.doc.get(id))), 'Yes: three references to LAMP replace the nine objects');
  ok(await cc(() => window.cadcraft.doc.all().some((e) => e.block === 'LAMP' && Math.abs(e.rot - Math.PI / 2) < 1e-6)), 'the turned copy is a reference turned 90°');
  await page.waitForTimeout(250);
  ok((await page.$('[data-block-list] [data-blocksx-item="LAMP"] svg path')) !== null, 'the new block shows in the panel with its picture');
  await typeCmd('BSEARCH'); await typeCmd('N'); await typeCmd('lam*');
  ok(await cc(() => window.cadcraft.host.selection.size === 3) && /3 references selected/.test(await history()), 'BSEARCH by name selects the three lamps');
  await esc();
  await typeCmd('BREPLACE'); await typeCmd('A'); await typeCmd('LAMP'); await typeCmd('CHAIR');
  ok(await refs('LAMP') === 0 && await refs('CHAIR') === 4, 'BREPLACE All turns every lamp into a chair');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
  ok(await refs('LAMP') === 3, 'one undo step');
  // INSERT's suggested places: a chair stands at the first desk; the other two desks repeat without one
  await cc(() => { const d = window.cadcraft.doc; d.change('tidy', () => { for (const e of d.all()) if (e.type === 'insert' && e.block === 'CHAIR') d.remove(e.id); d.add({ type: 'insert', block: 'CHAIR', x: 800, y: -400, sx: 1, sy: 1, rot: 0 }); }); });
  await typeCmd('INSERT'); await typeCmd('CHAIR');
  ok(/2 suggested places for CHAIR/.test(await history()), 'INSERT says two places are suggested (the other two desks)', (await history()).slice(-160));
  await typeCmd('G'); await typeCmd('A');
  const chairs = await cc(() => window.cadcraft.doc.all().filter((e) => e.type === 'insert' && e.block === 'CHAIR').map((e) => [Math.round(e.x), Math.round(e.y)]).sort((a, b) => a[0] - b[0]));
  ok(JSON.stringify(chairs) === '[[800,-400],[4800,-400],[8800,-400]]', 'G then All puts a chair at the same spot beside each desk', JSON.stringify(chairs));
  await shot('ors24-done');

  console.log('\n== ORS.31 the LISP editor');
  await typeCmd('VLIDE');
  await page.waitForSelector('[data-lispedit][open]', { timeout: 10000 });
  ok(await page.isVisible('[data-lispedit-text]') && /c:hello/.test(await page.inputValue('[data-lispedit-text]')), 'VLIDE opens the editor with a starting routine');
  ok(await cc(() => document.querySelector('[data-lispedit]').matches(':not(:modal)')), 'the window is not modal: the drawing stays in reach');
  const routine = '(defun c:ringit (/ p)\n  (setq p (getpoint "\\nCenter: "))\n  (entmake (list (cons 0 "CIRCLE") (cons 10 p) (cons 40 123.0)))\n  (princ "\\nring made")\n  (princ))\n(princ "\\nringit is ready")\n(princ)';
  await page.fill('[data-lispedit-text]', routine);
  await page.waitForTimeout(400);
  ok(await page.$$eval('[data-lispedit-gutter] div', (d) => d.length) === 7, 'seven numbered lines');
  ok(/C:RINGIT|c:ringit/.test(await page.textContent('[data-lispedit-defined]')), 'the side list shows the command the routine defines');
  await page.waitForFunction(() => /\(\d+\)/.test(document.querySelector('[data-lispedit-known] summary').textContent), null, { timeout: 15000 });
  ok(/built-in functions are used/.test(await page.textContent('[data-lispedit-builtin-count]')), 'and counts the built-in functions it uses');
  // the parenthesis pair: caret after the last ) of the defun
  await cc((n) => { const ta = document.querySelector('[data-lispedit-text]'); ta.focus(); ta.setSelectionRange(n, n); ta.dispatchEvent(new Event('keyup')); }, routine.indexOf('(princ))') + 8);
  await page.waitForTimeout(150);
  ok(await page.$$eval('.cc-lispedit-back mark', (m) => m.length) === 2 && /partner is on line 1/.test(await page.textContent('[data-lispedit-paren]')), 'the parenthesis at the cursor and its partner are marked; the status names the partner\'s line');
  const fit = await cc(() => {
    const ta = document.querySelector('[data-lispedit-text]'), back = document.querySelector('.cc-lispedit-back'), a = getComputedStyle(ta), b = getComputedStyle(back);
    const marks = [...back.querySelectorAll('mark')].map((m) => m.getBoundingClientRect());
    // the width of one character in the field, measured with its own font
    const cv = document.createElement('canvas').getContext('2d'); cv.font = a.font; const w = cv.measureText('M').width;
    return { same: a.fontFamily === b.fontFamily && a.fontSize === b.fontSize && a.lineHeight === b.lineHeight && a.paddingLeft === b.paddingLeft, markW: marks[0]?.width, w, first: marks[0]?.left - back.getBoundingClientRect().left - parseFloat(b.paddingLeft) };
  });
  ok(fit.same && Math.abs(fit.markW - fit.w) < 0.6 && Math.abs(fit.first) < 0.6, 'the marks behind the text measure as the text does (same font, a mark is one character wide, the first sits at column 1)', JSON.stringify(fit));
  // Enter indents under the open parenthesis
  await cc(() => { const ta = document.querySelector('[data-lispedit-text]'); ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); });
  await page.keyboard.type('\n(defun c:two ()');
  await page.keyboard.press('Enter');
  await page.keyboard.type('(princ "two"))');
  ok((await page.inputValue('[data-lispedit-text]')).endsWith('(defun c:two ()\n  (princ "two"))'), 'Enter indents the new line two spaces inside the open defun', JSON.stringify((await page.inputValue('[data-lispedit-text]')).slice(-40)));
  await shot('ors31-editor');
  // Load into the drawing
  await page.click('[data-lispedit-load]');
  await page.waitForFunction(() => /Commands: /.test(document.querySelector('[data-lispedit-console]').textContent), null, { timeout: 30000 });
  const con1 = await page.textContent('[data-lispedit-console]');
  ok(/ringit is ready/.test(con1) && /Commands: RINGIT, TWO/.test(con1), 'Load: the console shows what the routine printed and the commands it made', con1.slice(-160));
  ok(await cc(() => !!window.cadcraft.commands && window.cadcraft.lisp.loaded.has('untitled.lsp')), 'APPLOAD\'s list has the file');
  // the command runs, asking for its point on the command line while the editor stays open
  const circles0 = await cc(() => window.cadcraft.doc.all().filter((e) => e.type === 'circle').length);
  await typeCmd('RINGIT');
  await page.waitForFunction(() => window.cadcraft.engine.expects === 'point', null, { timeout: 10000 });
  await typeCmd('1000,7000');
  await page.waitForFunction((n) => window.cadcraft.doc.all().filter((e) => e.type === 'circle').length === n + 1, circles0, { timeout: 10000 });
  ok(await cc(() => window.cadcraft.doc.all().some((e) => e.type === 'circle' && Math.abs(e.r - 123) < 1e-9 && Math.abs(e.cx - 1000) < 1e-6)) && await page.isVisible('[data-lispedit][open]'), 'typing RINGIT runs it: a circle at the typed point, the editor still open');
  // Run selection: one form, and an error with its line
  await page.fill('[data-lispedit-text]', '(setq a 5)\n(* a 8)\n(princ "\\nbefore the error")\n(setq b (+ a "x"))\n(grread)');
  await cc(() => { const ta = document.querySelector('[data-lispedit-text]'); ta.focus(); ta.setSelectionRange(0, 18); });
  await page.click('[data-lispedit-run]');
  await page.waitForFunction(() => /2 forms ran/.test(document.querySelector('[data-lispedit-console]').textContent), null, { timeout: 20000 });
  ok(/\n?40/.test(await page.textContent('[data-lispedit-console]')), 'Run selection evaluates the two selected forms and shows the value 40');
  await page.click('[data-lispedit-clear]');
  await cc(() => { const ta = document.querySelector('[data-lispedit-text]'); ta.focus(); ta.setSelectionRange(0, ta.value.length); });
  await page.keyboard.press('Control+Enter');
  await page.waitForSelector('[data-lispedit-console] li.is-error', { timeout: 20000 });
  const errText = await page.textContent('[data-lispedit-console] li.is-error');
  ok(/^Line 4: bad argument type/.test(errText) && /before the error/.test(await page.textContent('[data-lispedit-console]')), 'an error shows with the line it happened on, after what was printed before it', errText);
  ok(await page.$eval('[data-lispedit-gutter]', (g) => g.children[3].classList.contains('is-error')), 'the line is marked beside the text');
  ok(/grread/.test(await page.textContent('[data-lispedit-notbuilt]')), 'a function that is not built here yet is listed as such');
  await page.fill('[data-lispedit-text]', '(defun c:x ()\n  (princ "a")\n(princ)');
  await page.click('[data-lispedit-load]');
  await page.waitForTimeout(300);
  ok(/Line 1: this parenthesis is never closed/.test(await page.textContent('[data-lispedit-console]')), 'a text with a parenthesis never closed is not run: the line is named');
  await page.click('[data-lispedit-known] summary');
  await page.fill('[data-lispedit-known] input', 'entm');
  ok(/entmake/.test(await page.textContent('[data-lispedit-all]')) && /grread/.test(await page.$eval('[data-lispedit-missing]', (d) => d.textContent)), 'the two full lists: what this LISP has (filtered) and what is not built yet');
  await shot('ors31-console');
  // the text is kept when the window closes
  await page.click('[data-lispedit-close]');
  await typeCmd('LISPEDIT');
  await page.waitForSelector('[data-lispedit][open]');
  ok(/defun c:x/.test(await page.inputValue('[data-lispedit-text]')) && await cc(() => /defun c:x/.test(JSON.parse(localStorage.getItem('cadcraft.lispedit')).text)), 'closing and opening again keeps the text; it is kept in this browser too');
  await page.click('[data-lispedit-close]');

  const real = problems.filter((p) => !(refused.length && /status of 429/.test(p)));
  if (refused.length) console.log('  note the server rate-limited ' + refused.length + ' request(s): ' + [...new Set(refused)].join(', '));
  ok(real.length === 0, 'no console errors', real.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL the run stopped: ' + (err?.stack || err));
  console.log('  history: ' + (await history().catch(() => '')).slice(-400));
  if (problems.length) console.log('  ' + problems.slice(0, 8).join('\n  '));
  await shot('ors-blocks-stopped');
} finally {
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
