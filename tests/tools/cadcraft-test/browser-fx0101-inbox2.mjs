#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx0101-inbox2.mjs — the click-through for three more 0.10.1 inbox fixes in CadCraft's lab build, headless:
 *   #1971 WALLPOLY (and POLYGON) take a radius typed while the pointer is still on the centre;
 *   #1973 object snap finds a plan wall's centre line (marker "Wall center: …"), DIMLINEAR measures between two centre lines and
 *         WALLDIM (Edit by dimension) moves the second wall and the dimension;
 *   #1974 F typed in the Blocks panel's filter box is INSERT's File option (Enter), and a DXF of blocks picked there lists its blocks.
 * Engines: tools/cadcraft-test/walls-plan.mjs, bin/test-cadcraft.mjs, bin/test-blocks-panel.mjs.
 *
 *   node tools/cadcraft-test/browser-fx0101-inbox2.mjs [--shots <dir>]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin). Cached
 * Playwright Chromium.
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
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { try { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.setItem('cc-newhere', 'skipped'); localStorage.removeItem('cadcraft.arrays.assoc'); } catch {} });
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const history = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(150); };
const cc = (fn, arg) => page.evaluate(fn, arg);
const esc = async () => { await page.click('[data-cmd-input]'); await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(80); };

const eng = () => cc(() => ({ run: window.cadcraft.engine.running, exp: window.cadcraft.engine.expects }));
const walls = () => cc(async () => { const W = await import('/assets/apps/cadcraft/dev/plan2d/walls.js'); return window.cadcraft.doc.all().filter(W.isWall).map((e) => { const m = W.model(e); return { id: m.id, a: m.a, b: m.b, t: m.t }; }); });
const clearAll = () => cc(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of d.all()) d.remove(e.id); }); });
const hover = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x - 3, p.y - 2); await page.mouse.move(p.x, p.y); await page.waitForTimeout(200); return cc(() => { const s = window.cadcraft.view.state.snap; return s ? { kind: s.kind, x: s.x, y: s.y, label: s.label || '', axis: !!s.axis } : null; }); };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
// a block library drawing: millimetres stated (a file with no units is asked about first), two blocks, nothing in its model
const DXF = ['0', 'SECTION', '2', 'HEADER', '9', '$INSUNITS', '70', '4', '0', 'ENDSEC', '0', 'SECTION', '2', 'BLOCKS', '0', 'BLOCK', '8', '0', '2', 'LIBDOOR', '70', '0', '10', '0', '20', '0', '30', '0', '3', 'LIBDOOR', '1', '', '0', 'LINE', '8', '0', '10', '0', '20', '0', '30', '0', '11', '900', '21', '0', '31', '0', '0', 'ENDBLK',
  '0', 'BLOCK', '8', '0', '2', 'LIBWINDOW', '70', '0', '10', '0', '20', '0', '30', '0', '3', 'LIBWINDOW', '1', '', '0', 'LINE', '8', '0', '10', '0', '20', '0', '30', '0', '11', '1200', '21', '0', '31', '0', '0', 'ENDBLK', '0', 'ENDSEC', '0', 'SECTION', '2', 'ENTITIES', '0', 'ENDSEC', '0', 'EOF', ''].join('\n');

try {
  console.log('\n== the page');
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch {} });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.commands);
  await cc(() => { window.cadcraft.doc.meta.units = 'millimeters'; window.cadcraft.host.zoomWindow({ x: -1000, y: -1000 }, { x: 5000, y: 4000 }); });
  await page.waitForTimeout(350);

  console.log('\n== #1971 a typed radius with the pointer still on the centre');
  for (const cmd of ['POLYGON', 'WALLPOLY']) {
    await esc(); await clearAll();
    await typeCmd(cmd); await typeCmd('6'); await clickAt(2000, 1500);
    await page.keyboard.press('Enter'); await page.waitForTimeout(150);   // <I>; the pointer has not moved since the click
    await page.keyboard.type('800'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    const n = await cc(() => window.cadcraft.doc.count()), e = await eng();
    ok(!e.run && n === (cmd === 'POLYGON' ? 1 : 6) && !/Point or option keyword required/.test((await history()).slice(-200)), cmd + ': 6 sides, centre clicked, Enter, 800 typed without moving the pointer: drawn', JSON.stringify({ n, e, h: (await history()).slice(-160) }));
  }
  const hex = await walls();
  ok(hex.length === 6 && hex.every((w) => near(Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y), 800, 1e-3)), 'the wall polygon is a hexagon of side 800 (inscribed radius 800)', JSON.stringify(hex.map((w) => Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y))));
  await shot('fx0101-wallpoly');

  console.log('\n== #1973 the centre line of a wall: snap, DIMLINEAR, Edit by dimension');
  await esc(); await clearAll();
  await typeCmd('WALLRECT'); await typeCmd('0,0'); await typeCmd('#4000,3000');
  await page.waitForTimeout(300);
  let ws = await walls();
  const vert = ws.filter((w) => near(w.a.x, w.b.x, 1e-6)).sort((p, q) => p.a.x - q.a.x);
  ok(ws.length === 4 && vert.length === 2, 'WALLRECT made four walls', JSON.stringify(ws));
  const xw = vert[0].a.x, xe = vert[1].a.x, ym = (vert[0].a.y + vert[0].b.y) / 2, t = vert[0].t;
  await typeCmd('DIMLINEAR');
  const s1 = await hover(xw, ym);
  ok(s1 && s1.kind === 'mid' && s1.label === 'Wall center: midpoint' && s1.axis && near(s1.x, xw, 1e-6) && near(s1.y, ym, 1e-6), 'the pointer on the middle of the west wall: the marker is on its centre line and reads "Wall center: midpoint" (thickness ' + t + ')', JSON.stringify(s1));
  await shot('fx0101-wallcentre-snap');
  await clickAt(xw, ym);
  const s2 = await hover(xe, ym);
  ok(s2 && /^Wall center: /.test(s2.label) && near(s2.x, xe, 1e-6), 'the east wall offers its centre line for the second point', JSON.stringify(s2));
  await clickAt(xe, ym);
  await clickAt(2000, 2200);
  const dim = await cc(() => { const d = window.cadcraft.doc.all().find((e) => e.type === 'dim'); return d ? { id: d.id, kind: d.kind, p1: d.p1, p2: d.p2 } : null; });
  ok(dim && near(dim.p1.x, xw, 1e-6) && near(dim.p2.x, xe, 1e-6), 'DIMLINEAR measures centre line to centre line (' + (xe - xw) + ', not face to face)', JSON.stringify(dim));
  await shot('fx0101-wallcentre-dim');
  await esc();
  await typeCmd('WALLDIM'); await clickAt(2000, 2200); await typeCmd(String(xe - xw + 500));
  await page.waitForTimeout(300);
  ws = await walls();
  const east = ws.find((w) => w.id === vert[1].id), west = ws.find((w) => w.id === vert[0].id);
  const dim2 = await cc(() => { const d = window.cadcraft.doc.all().find((e) => e.type === 'dim'); return { p1: d.p1, p2: d.p2 }; });
  ok(east && near(east.a.x, xe + 500, 1e-4) && near(east.b.x, xe + 500, 1e-4) && near(west.a.x, xw, 1e-6), 'Edit by dimension (WALLDIM), ' + (xe - xw) + ' to ' + (xe - xw + 500) + ': the east wall moves 500, the west wall holds', JSON.stringify({ east, west, h: (await history()).slice(-200) }));
  ok(near(dim2.p2.x, xe + 500, 1e-4) && near(dim2.p1.x, xw, 1e-6), 'the dimension follows its wall and reads the new value', JSON.stringify(dim2));
  await shot('fx0101-walldim');

  console.log('\n== #1974 F in the Blocks panel\'s filter box; a DXF of blocks through INSERT, File');
  await esc(); await clearAll();
  await cc(() => { const d = window.cadcraft.doc; d.change('fx', () => { d.blocks.set('DOOR', { name: 'DOOR', base: { x: 0, y: 0 }, entities: [{ type: 'line', layer: '0', x1: 0, y1: 0, x2: 900, y2: 0 }], attdefs: [] }); }); window.cadcraft.host.blocksPanel?.render(); });
  await typeCmd('I');
  ok((await eng()).exp === 'string', 'I asks "Enter block name or [File/Library]"');
  await page.click('[data-blocksx-filter]');
  await page.keyboard.type('F'); await page.waitForTimeout(200);
  const row = await cc(() => { const li = document.querySelector('[data-blocksx-nomatch]'); return li ? { text: li.textContent, file: !!li.querySelector('[data-blocksx-fromfile]'), lib: !!li.querySelector('[data-blocksx-fromlibrary]') } : null; });
  ok(row && /INSERT's File option/.test(row.text) && row.file && row.lib, 'F typed in "Filter blocks": the panel says it is INSERT\'s File option and offers From a file / Library', JSON.stringify(row));
  await shot('fx0101-filter-f');
  const chooser = page.waitForEvent('filechooser', { timeout: 8000 });
  await page.keyboard.press('Enter');
  const fc = await chooser.catch(() => null);
  ok(!!fc && (await eng()).run === 'INSERT', 'Enter there starts INSERT\'s File option: the file chooser opens', JSON.stringify({ e: await eng(), h: (await history()).slice(-200) }));
  if (fc) {
    await fc.setFiles({ name: 'my-blocks.dxf', mimeType: 'application/dxf', buffer: Buffer.from(DXF) });
    await page.waitForSelector('#cc-choose-list', { timeout: 8000 });
    const opts = await cc(() => [...document.querySelectorAll('#cc-choose-list option')].map((o) => o.textContent));
    ok(opts.includes('LIBDOOR') && opts.includes('LIBWINDOW'), 'the blocks made in the other drawing are listed in "Insert from"', JSON.stringify(opts));
    await shot('fx0101-insert-from');
    await page.selectOption('#cc-choose-list', 'LIBDOOR');
    await page.click('dialog.cc-ask button[data-key="ok"]');
    await page.waitForTimeout(400);
    ok((await eng()).exp === 'point', 'INSERT goes on to the insertion point', JSON.stringify(await eng()));
    await clickAt(1000, 1000);
    const ins = await cc(() => window.cadcraft.doc.all().filter((e) => e.type === 'insert').map((e) => e.block));
    ok(ins.length === 1 && ins[0] === 'LIBDOOR' && await cc(() => window.cadcraft.doc.blocks.has('LIBDOOR')), 'LIBDOOR from the file is placed in this drawing', JSON.stringify(ins));
  }
  // the command line itself (the guide's steps), and the From a file button
  await esc();
  let c2 = page.waitForEvent('filechooser', { timeout: 8000 });
  await typeCmd('I'); await typeCmd('F');
  let f2 = await c2.catch(() => null);
  ok(!!f2, 'I, Enter, F, Enter at the command line opens the file chooser (as the guide says)', (await history()).slice(-200));
  if (f2) await f2.setFiles([]);
  await esc();
  await page.click('[data-blocksx-filter]'); await page.keyboard.type('zzz'); await page.waitForTimeout(200);
  c2 = page.waitForEvent('filechooser', { timeout: 8000 });
  await page.click('[data-blocksx-fromfile]');
  f2 = await c2.catch(() => null);
  ok(!!f2, 'a filter that matches nothing: "From a file…" opens the file chooser', (await history()).slice(-200));
  if (f2) await f2.setFiles([]);
  await esc();
  await page.click('[data-blocksx-filter]'); await page.keyboard.type('libd'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  ok((await eng()).run === 'INSERT' && (await eng()).exp === 'point' && /LIBDOOR/.test((await history()).slice(-120)), 'a filter that leaves one block (libd): Enter starts placing it', JSON.stringify(await eng()));
  await esc();
  if (problems.length) console.log('  (console errors seen in all: ' + problems.length + ' — first: ' + problems[0].slice(0, 200) + ')');
  ok(problems.length === 0, 'no console errors or page errors', problems.slice(0, 3).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL the run stopped: ' + (err?.stack || err));
  console.log('  history: ' + (await history().catch(() => '')).slice(-400));
  if (problems.length) console.log('  ' + problems.slice(0, 8).join('\n  '));
  await shot('fx0101-inbox2-stopped');
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
