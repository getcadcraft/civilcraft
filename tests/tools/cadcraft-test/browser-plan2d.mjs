#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-plan2d.mjs — 0.9 PLAN2D in the real page (/lab/cadcraft): typed WALL with clicks, DOOR and WINDOW, a drag of a wall's grip,
 * Properties › Wall, the Floors panel, layer groups in the Layers panel, HATCH with a pick then MOVE on the boundary. No console errors.
 *   node tools/cadcraft-test/browser-plan2d.mjs [--shots <dir>]      (run as root)
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
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.mouse.click(700, 450);

  console.log('\n== walls');
  await cmd('WALL', 'T', '100', '0,0', '4000,0', '4000,3000', '0,3000', 'C');
  await page.waitForTimeout(100);
  let w = await walls();
  ok(w.length === 4, 'a closed room of four walls', w.length);
  ok(new Set(w.map((x) => x.block)).size === 4, 'each has its own block');
  await ev(() => window.cadcraft.host.zoomExtents?.() ?? window.cadcraft.view?.zoomExtents?.());
  await type('ZOOM'); await type('E');
  await cmd('WALL', '2000,0', '2000,3000', '');
  w = await walls();
  ok(w.length === 5, 'an inner wall, T at both ends', w.length);
  await cmd('DOOR', '1000,100', '');
  await cmd('WINDOW', 'W', '1500', '3000,3000', '');
  w = await walls();
  const opsOf = (l) => l.flatMap((x) => x.data.ops);
  ok(opsOf(w).filter((o) => o.k === 'door').length === 1, 'a door is in a wall', opsOf(w));
  ok(opsOf(w).filter((o) => o.k === 'window' && o.w === 1500).length === 1, 'a 1500 window is in a wall', opsOf(w));
  ok(opsOf(w).find((o) => o.k === 'door')?.sw === 1, 'the door swings to the side clicked');
  await shot('walls');

  console.log('\n== selecting a wall');
  const pick = await ev(() => {
    const c = window.cadcraft, e = [...c.doc.model.values()].find((x) => x.xd?.CADCRAFT_WALL && JSON.parse(x.xd.CADCRAFT_WALL.map((r) => r[1]).join('')).ops.some((o) => o.k === 'door'));
    c.host.setSelection(new Set([e.id]));
    return e.id;
  });
  await page.waitForTimeout(250);
  await shot('wall-selected');
  const propsText = await page.locator('.cc-right, [data-props]').first().innerText().catch(() => '');
  ok(/Wall/.test(propsText) && /Door 1/.test(propsText), 'Properties shows the wall and its door', propsText.slice(0, 300));
  const grips = await ev(() => window.cadcraft.view?.state?.grips?.map((g) => g.key) ?? null);
  ok(grips && grips.includes('wall:a') && grips.includes('wall:swing:0'), 'the grips are there', grips);
  await page.keyboard.press('Escape');

  console.log('\n== moving a wall: joined walls follow');
  const before = await walls();
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), pick);
  await cmd('MOVE', '0,0', '0,-500');
  await page.waitForTimeout(100);
  const after = await walls();
  const moved = after.find((x) => x.id === pick);
  ok(moved.y === before.find((x) => x.id === pick).y - 500, 'the wall moved');
  const inner = after.find((x) => { const b = before.find((y) => y.id === x.id); return b && x.id !== pick && (Math.hypot(x.data.b[0], x.data.b[1]) > Math.hypot(b.data.b[0], b.data.b[1]) + 1); });
  ok(!!inner, 'a joined wall got longer');
  await shot('wall-moved');
  await type('UNDO');
  ok(JSON.stringify(await walls()) === JSON.stringify(before), 'one undo puts it all back');

  console.log('\n== hatch follows');
  await cmd('RECTANG', '6000,0', '7000,1000');
  await type('ZOOM'); await type('E');
  await cmd('HATCH', '6500,500', '');
  await page.waitForTimeout(100);
  const hatch = () => ev(() => { const h = [...window.cadcraft.doc.model.values()].find((e) => e.type === 'hatch'); return h && { id: h.id, assoc: h.assoc, x: h.loops[0][0], ox: h.ox || 0, link: !!h.xd?.CADCRAFT_HATCH }; });
  const h0 = await hatch();
  ok(h0 && h0.assoc && h0.link, 'a picked hatch is linked to its rectangle', h0);
  const rect = await ev(() => [...window.cadcraft.doc.model.values()].find((e) => e.type === 'poly').id);
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), rect);
  await cmd('MOVE', '0,0', '0,2000');
  const h1 = await ev(() => { const h = [...window.cadcraft.doc.model.values()].find((e) => e.type === 'hatch'); return { y: Math.min(h.loops[0][1], h.loops[0][3], h.loops[0][5], h.loops[0][7]), oy: h.oy || 0 }; });
  ok(h1.y === 2000 && h1.oy === 2000, 'moving the rectangle moved the hatch and its pattern', h1);
  await shot('hatch-moved');
  await page.keyboard.press('Escape');

  console.log('\n== layer groups');
  await cmd('LAYGROUP', 'S');
  await page.waitForTimeout(150);
  ok(await page.locator('[data-group-row="Proposed"]').count() === 1, 'the ready-made groups are in the panel');
  ok(await page.locator('[data-layer-row="P-Walls"]').count() === 1, 'its layers show under it');
  await shot('layer-groups');
  await page.locator('[data-layer-group="Proposed"]').click();
  await page.waitForTimeout(100);
  ok(await page.locator('[data-layer-row="P-Walls"]').count() === 0, 'a group folds');
  await page.locator('[data-group-row="Existing"] [data-group-flag="on"]').click();
  ok(await ev(() => !window.cadcraft.doc.layers.get('E-Walls').on), 'a group\'s eye turns its layers off');
  await page.fill('[data-layer-filter]', 'drain');
  await page.waitForTimeout(100);
  ok(await page.locator('[data-layer-row="S-Drainage"]').count() === 1 && await page.locator('[data-layer-row="E-Doors"]').count() === 0, 'Find a layer narrows the list');
  await page.fill('[data-layer-filter]', '');
  await page.mouse.click(700, 450);
  await page.keyboard.press('Escape');

  console.log('\n== floors');
  await type('FLOORS');
  await page.waitForSelector('[data-floors-panel]:not([hidden])');
  await page.locator('[data-floors-on]').click();
  await page.waitForSelector('[data-floor-list]');
  ok(await page.locator('[data-floor]').count() === 2, 'starts with two floors');
  await page.locator('[data-floor-active="f2"]').check();
  await page.waitForTimeout(150);
  await page.locator('[data-floors-panel] .cc-align-close').click();
  await cmd('WALL', '0,0', '0,3000', '');
  await page.waitForTimeout(150);
  await type('ZOOM'); await type('E');
  await page.waitForTimeout(200);
  await shot('floors-ghost');
  const on2 = await ev(() => { const d = window.cadcraft.doc, l = [...d.model.values()]; const g = l.filter((e) => !e.xd?.CADCRAFT_FLOOR), u = l.filter((e) => e.xd?.CADCRAFT_FLOOR?.[0]?.[1] === 'f2'); return { ground: g.length, upper: u.length, groundEditable: g.every((e) => d.editable(e)), upperEditable: u.every((e) => d.editable(e)) }; });
  ok(on2.upper === 1 && !on2.groundEditable && on2.upperEditable, 'the new wall is upstairs; downstairs can\'t be edited from here', on2);
  await type('FLOORS');
  await page.waitForSelector('[data-floors-panel]:not([hidden])');
  await page.locator('[data-floor-eye="f1"]').click();
  await page.waitForTimeout(200);
  ok(await ev(() => { const d = window.cadcraft.doc; return [...d.model.values()].filter((e) => !e.xd?.CADCRAFT_FLOOR).every((e) => !d.visible(e)); }), 'the ground floor turns off');
  await shot('floors-off');
  await page.locator('[data-floors-panel] .cc-align-close').click();
  ok(!problems.length, 'no console errors', problems.slice(0, 6));
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
