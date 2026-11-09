#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wallsplan.mjs — 0.9 walls-plan-09 in the real page (/lab/cadcraft): the stored join record (FX.59) and the wall tool's recipes
 * (WT.2 shapes, WT.4 split and rejoin, WT.3 locks) typed at the command line as a person would; picks go through the page's own
 * host.pickAt. Properties shows the new rows. No console errors.
 *   node tools/cadcraft-test/browser-wallsplan.mjs [--shots <dir>]      (run as root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2), si = args.indexOf('--shots'), SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + JSON.stringify(x) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const ev = (fn, arg) => page.evaluate(fn, arg);
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '.png') }); };
const type = async (s) => { await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(60); };
const cmd = async (...parts) => { for (const s of parts) await type(s); };
const walls = () => ev(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'insert' && e.xd?.CADCRAFT_WALL).map((e) => ({ id: e.id, block: e.block, x: e.x, y: e.y, data: JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join('')) })));
const wallsNow = () => ev(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'insert' && e.xd?.CADCRAFT_WALL).map((e) => {
  const d = JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join(''));
  return { id: e.id, x: e.x, y: e.y, a: [e.x + d.a[0], e.y + d.a[1]], b: [e.x + d.b[0], e.y + d.b[1]], t: d.t, g: d.g || '', jn: d.jn || [], jo: d.jo || '', h: d.h || [], ops: d.ops };
}));
const clickAt = async (x, y) => { await ev(([px, py]) => window.cadcraft.engine.click({ x: px, y: py }, { x: px, y: py }), [x, y]); await page.waitForTimeout(60); };
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.mouse.click(700, 450);

  console.log('\n== FX.59 joins are stored');
  await cmd('WALLRECT', '0,0', '5000,4000');
  await type('ZOOM'); await type('E');
  let w = await wallsNow();
  ok(w.length === 4, 'WALLRECT: four walls', w.length);
  ok(w.every((x) => /^w[0-9a-z]{12}$/.test(x.g) && x.jn.length === 2 && x.jn.every((r) => r.k === 'L')), 'each has its own id and two stored L records', w.map((x) => [x.g, x.jn.length]));
  await shot('rect');
  const before = JSON.stringify(await wallsNow());
  const topId = w.find((x) => near(x.a[1], 4000) && near(x.b[1], 4000)).id;
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), topId);
  await cmd('MOVE', '0,0', '0,500');
  w = await wallsNow();
  const sides = w.filter((x) => near(x.a[0], x.b[0]));
  ok(sides.length === 2 && sides.every((x) => near(Math.abs(x.b[1] - x.a[1]), 4500)), 'MOVE the top wall 500 up: the side walls lengthen to 4500 and every corner stays joined', sides.map((x) => [x.a, x.b]));
  ok(w.every((x) => x.jn.length === 2), 'the stored records are all still there');
  await type('UNDO');
  ok(JSON.stringify(await wallsNow()) === before, 'one undo puts every wall and record back');

  console.log('\n== an older drawing: joins found once');
  await ev(() => {
    const d = window.cadcraft.doc;
    for (const e of [...d.model.values()]) if (e.xd?.CADCRAFT_WALL) {
      const j = JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join('')); delete j.g; delete j.jn;
      d.model.set(e.id, { ...e, xd: { ...e.xd, CADCRAFT_WALL: [[1000, JSON.stringify(j)]] } });
    }
  });
  w = await wallsNow();
  ok(w.every((x) => !x.g && x.jn.length === 0), 'setup: no ids and no records (as an older file opens)');
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), topId);
  await cmd('MOVE', '0,0', '0,500');
  w = await wallsNow();
  ok(w.every((x) => x.g && x.jn.length === 2), 'the first change gives every wall an id and stores its two joins', w.map((x) => x.jn.length));
  ok(w.filter((x) => near(x.a[0], x.b[0])).every((x) => near(Math.abs(x.b[1] - x.a[1]), 4500)), 'and the joined walls followed from the stored joins');
  await type('UNDO');

  console.log('\n== WT.2 shapes');
  await cmd('ERASE'); // no selection: ends at the prompt
  await page.keyboard.press('Escape');
  await ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); });
  await cmd('WALLPOLY', '6', '0,0', 'I', '1000,0');
  w = await wallsNow();
  ok(w.length === 6 && w.every((x) => near(Math.hypot(x.b[0] - x.a[0], x.b[1] - x.a[1]), 1000, 0.01) && x.jn.length === 2), 'WALLPOLY: a hexagon of six joined walls, each 1000 long');
  await cmd('WALLARC', '5000,0', '6000,0', '5000,1000');
  w = await wallsNow();
  ok(w.length === 12, 'WALLARC: a quarter circle is six chords (12 walls now)', w.length);
  await type('ZOOM'); await type('E');
  await shot('shapes');

  console.log('\n== WT.4 split and rejoin');
  await ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); });
  await cmd('WALL', '0,0', '6000,0', '');
  await cmd('DOOR', '1000,100', '');
  await type('ZOOM'); await type('E');
  await type('WALLSPLIT');
  await clickAt(3000, 50);
  await type('3000,0');
  w = await wallsNow();
  ok(w.length === 2 && w.some((x) => near(x.b[0], 3000)) && w.some((x) => near(x.a[0], 3000)), 'WALLSPLIT at 3000: two walls', w.map((x) => [x.a, x.b]));
  ok(w.every((x) => x.jn.length === 1 && x.jn[0].k === 'L'), 'the parts stay joined in line (one stored record each)');
  ok(w.reduce((n, x) => n + x.ops.length, 0) === 1, 'the door went with its part');
  await shot('split');
  await type('UNDO');
  ok((await wallsNow()).length === 1, 'undo makes it one wall again');
  await type('REDO');
  await type('WALLREJOIN');
  await clickAt(300, 50);
  await clickAt(4500, 50);
  w = await wallsNow();
  ok(w.length === 1 && near(w[0].a[0], 0) && near(w[0].b[0], 6000), 'WALLREJOIN: one wall again, 0 to 6000', w.map((x) => [x.a, x.b]));

  console.log('\n== WT.3 locks');
  await ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); });
  await cmd('WALLRECT', '0,0', '4000,3000');
  await type('ZOOM'); await type('E');
  await type('WALLHOLD');
  await clickAt(2000, 3050);
  await clickAt(2000, 50);
  await type('K');
  w = await wallsNow();
  ok(w.some((x) => x.h.length === 1 && x.h[0].kind === 'line' && near(x.h[0].off, 3000)), 'WALLHOLD: the north wall is locked to the south wall, 3000 apart', w.map((x) => x.h));
  const south = w.find((x) => near(x.a[1], 0) && near(x.b[1], 0));
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), south.id);
  await cmd('MOVE', '0,0', '0,500');
  w = await wallsNow();
  const north = w.find((x) => x.h.length === 1);
  ok(near(north.a[1], 3500) && near(north.b[1], 3500), 'moving the south wall 500 north: the locked north wall follows to y = 3500', [north.a, north.b]);
  await shot('locks');

  console.log('\n== Properties');
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), south.id);
  await page.waitForTimeout(300);
  const propsText = await page.locator('.cc-right, [data-props]').first().innerText().catch(() => '');
  ok(/Location line/.test(propsText) && /Disallow join at start/.test(propsText) && /Length/.test(propsText), 'Properties shows Length, Location line and the two Disallow join switches', propsText.slice(0, 400));
  await shot('properties');
  await page.keyboard.press('Escape');
  ok(!problems.length, 'no console errors', problems.slice(0, 6));
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
