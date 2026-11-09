#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-carving.mjs — the Router carving add-on in /lab/cadcraft (0.9 SU.886; session carve-09). Run as root: a signed-in session is minted in-process by
 * tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-windows.mjs).
 *
 *   node tools/addons-test/browser-carving.mjs [--shots dir]     (shots default: tmp/shots/carving)
 *
 * Bundled and off, switched on; shapes read from the drawing (closed, open, layers); V-carve with the panel: toolpaths, preview with dark pixels, the check;
 * Draw / Erase / undo as one step; the downloaded G-code read back with the engine's parser and checker (3 mm deep, spindle, end); Fanuc and an edited post;
 * engrave; relief from a picture made in the page; the commands CARVE and CARVEDRAW; a setting kept across a reload; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/carving'));
fs.mkdirSync(SHOTS, { recursive: true });
const { parseGcode } = await import(path.join(ROOT, 'lib/carve/lib/post.js'));
const { checkProgram } = await import(path.join(ROOT, 'lib/carve/lib/check.js'));

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s, wait = 200) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const carveEnts = () => page.evaluate(() => window.cadcraft.doc.all().filter((e) => String(e.layer).startsWith('CARVE-')).length);
const readDownload = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); const f = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(f); return { file: f, name: dl.suggestedFilename(), text: fs.readFileSync(f, 'utf8') }; };
const cv = (k) => `[data-cv="${k}"]`;
const openPanel = async () => { await page.waitForSelector('[data-cv-root]', { state: 'attached', timeout: 10000 }); if (!(await page.isVisible('[data-cv-root]'))) await page.locator('.shell-addon-section-tog', { hasText: 'Carving' }).first().click(); await page.waitForSelector('[data-cv-root]', { state: 'visible', timeout: 10000 }); };
const make = async () => { await page.click(cv('make')); await page.waitForSelector('[data-cv-result]', { timeout: 30000 }); };

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:carving:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.carving; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'carving' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'carving'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Router carving is bundled and starts off', JSON.stringify(me && { state: me.state, reason: me.reason, detail: me.detail }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('carving', true));
  await page.waitForTimeout(600);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'carving'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.reason, me.detail]));

  // shapes in the drawing: a 60 × 30 rectangle with an oval-ish hole, a ring, and an open line on another layer
  await page.evaluate(() => {
    const d = window.cadcraft.doc;
    const circle = (cx, cy, r, n = 120) => Array.from({ length: n }, (_, k) => ({ x: cx + r * Math.cos((k * 2 * Math.PI) / n), y: cy + r * Math.sin((k * 2 * Math.PI) / n) }));
    d.change('test shapes', () => {
      d.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0 }, { x: 60, y: 0 }, { x: 60, y: 30 }, { x: 0, y: 30 }] });
      d.add({ type: 'poly', layer: '0', closed: true, pts: circle(20, 15, 6) });
      d.add({ type: 'poly', layer: '0', closed: true, pts: circle(45, 15, 9) });
      if (!d.layers.has('LOGO')) d.addLayer({ name: 'LOGO', color: 3 });
      d.add({ type: 'poly', layer: 'LOGO', closed: false, pts: [{ x: 0, y: -10 }, { x: 30, y: -10 }, { x: 30, y: -20 }] });
    });
  });
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(300);
  await openPanel();
  await page.hover('[data-cv-root]');
  await page.waitForFunction(() => /3 closed shapes/.test(document.querySelector('[data-cv-shapes]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
  const shapesText = await page.textContent('[data-cv-shapes]');
  ok(/3 closed shapes, 1 open lines/.test(shapesText), 'Shapes: reads 3 closed shapes and 1 open line from the drawing', shapesText);
  ok((await page.$$('[data-cv="layers"] input')).length === 2, 'two layers are listed to choose from');
  ok(!(await page.$('[data-cv-result]')), 'nothing is made until you ask');

  // V-carve
  await page.fill(cv('maxDepth'), '3'); await page.keyboard.press('Tab');
  await make();
  const rows = await page.$$eval('[data-cv-result] tr', (trs) => trs.map((r) => r.textContent));
  ok(rows.some((r) => /Operations/.test(r) && /Flat mill 6 mm/.test(r) && /V-bit 60°/.test(r)), 'V-carve: a flat-mill clearing operation and a V-bit operation', rows.join(' | '));
  ok(rows.some((r) => /Flat floor/.test(r) && /flat at 3 mm/.test(r)), 'it says where the floor is flat', rows.join(' | '));
  const dark = await page.evaluate(() => { const c = document.querySelector('[data-cv-preview]'); if (!c) return -1; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 200) n++; return n; });
  ok(dark > 300, 'the preview shows the cut block (dark where cut)', String(dark));
  ok(await page.$('[data-cv-check="ok"]'), 'the program check finds no problems');
  fs.writeFileSync(path.join(SHOTS, 'carving-06-preview.png'), Buffer.from((await page.evaluate(() => document.querySelector('[data-cv-preview]').toDataURL('image/png'))).split(',')[1], 'base64'));
  await shot('carving-01-vcarve');
  await page.evaluate(() => { const r = document.querySelector('[data-cv-root]'); r && r.scrollIntoView(); });
  await page.locator('[data-cv-root]').screenshot({ path: path.join(SHOTS, 'carving-05-panel.png') }).catch(() => {});

  // draw, erase, undo
  const before = await carveEnts();
  await page.click(cv('draw'));
  await page.waitForTimeout(400);
  const drawn = await carveEnts();
  ok(before === 0 && drawn > 20, 'Draw toolpaths: polylines on the CARVE layers', before + ' → ' + drawn);
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(300);
  await shot('carving-02-drawn');
  await typeCmd('U', 300);
  ok((await carveEnts()) === 0, 'one undo takes all the toolpaths back');
  await typeCmd('REDO', 300);
  await page.click(cv('draw')); await page.waitForTimeout(300);
  const again = await carveEnts();
  ok(again === drawn, 'drawing again replaces them (same count, not doubled)', again + ' vs ' + drawn);
  await page.click(cv('erase')); await page.waitForTimeout(300);
  ok((await carveEnts()) === 0, 'Remove drawn toolpaths clears them');

  // download and read back
  const dl = await readDownload(cv('download'));
  const moves = parseGcode(dl.text);
  const minZ = Math.min(...moves.filter((m) => m.z !== null).map((m) => m.z));
  const chk = checkProgram(dl.text, { bed: { x0: -1, y0: -1, x1: 62, y1: 32 }, maxDepth: 3.01 });
  ok(/^G21$/m.test(dl.text) && /^M3 S12000$/m.test(dl.text) && minZ === -3 && chk.ok, 'Download G-code: millimetres, spindle on, 3 mm deep, and the program passes the checker', JSON.stringify(chk.issues.slice(0, 3)) + ' minZ ' + minZ);
  ok(dl.name === 'carving.gcode', 'named for the job', dl.name);

  // layers: only the LOGO line, engrave
  await page.click('[data-cv="layers"] label:nth-of-type(1) input');   // untick the first layer
  await page.waitForTimeout(200);
  ok(/0 closed shapes, 1 open lines/.test(await page.textContent('[data-cv-shapes]')), 'untick a layer: its shapes are left out', await page.textContent('[data-cv-shapes]'));
  await page.click('[data-cv-mode="engrave"]');
  await page.fill(cv('engDepth'), '1.5'); await page.keyboard.press('Tab');
  await make();
  const erows = await page.$$eval('[data-cv-result] tr', (trs) => trs.map((r) => r.textContent));
  ok(erows.some((r) => /Line width/.test(r) && /1\.73 mm/.test(r)), 'Engrave: a 1.5 mm deep line with a 60° V-bit is 1.73 mm wide at the top', erows.join(' | '));
  const eg = await readDownload(cv('download'));
  ok(Math.min(...parseGcode(eg.text).filter((m) => m.z !== null).map((m) => m.z)) === -1.5 && (eg.text.match(/^M3 S/gm) || []).length === 1, 'and the program cuts 1.5 mm deep with one tool');
  await page.click('[data-cv="layers"] label:nth-of-type(1) input');   // both layers again
  await page.waitForTimeout(200);

  // post: Fanuc, and an edited header
  await page.click('[data-cv-mode="vcarve"]');
  await page.selectOption(cv('post'), 'fanuc');
  await make();
  const fan = await readDownload(cv('download'));
  ok(/^%$/m.test(fan.text) && /^O0001$/m.test(fan.text) && /T1 M6/.test(fan.text) && fan.name === 'carving.nc', 'Fanuc post: % and O0001, T1 M6, a .nc file', fan.name);
  await page.selectOption(cv('post'), 'grbl');
  await page.locator('details summary', { hasText: 'Edit the post-processor' }).click();
  await page.fill('[data-cv-post="header"]', 'G21\n(MY START)\nG90');
  await page.evaluate(() => document.querySelector('[data-cv-post="header"]').dispatchEvent(new Event('change', { bubbles: true })));
  await make();
  const mine = await readDownload(cv('download'));
  ok(/\(MY START\)/.test(mine.text) && /^G90$/m.test(mine.text), 'an edited post-processor header is in the program', mine.text.split('\n').slice(0, 6).join(' | '));
  await page.click(cv('post-reset'));

  // relief from a picture made in the page
  await page.click('[data-cv-mode="relief"]');
  await page.evaluate(async () => {
    const cvs = document.createElement('canvas'); cvs.width = 160; cvs.height = 100;
    const c = cvs.getContext('2d'); const g = c.createRadialGradient(80, 50, 5, 80, 50, 48); g.addColorStop(0, '#fff'); g.addColorStop(1, '#000'); c.fillStyle = g; c.fillRect(0, 0, 160, 100);
    const blob = await new Promise((r) => cvs.toBlob(r, 'image/png'));
    const input = document.querySelector('[data-cv="image"]');
    const dt = new DataTransfer(); dt.items.add(new File([blob], 'dome.png', { type: 'image/png' })); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForFunction(() => /dome\.png: 160 × 100/.test(document.querySelector('[data-cv-image]')?.textContent || ''), null, { timeout: 15000 });
  ok(true, 'Relief: the picture is read (160 × 100 pixels)');
  await page.fill(cv('relWidth'), '80'); await page.keyboard.press('Tab');
  await page.fill(cv('relDepth'), '4'); await page.keyboard.press('Tab');
  await make();
  const rr = await page.$$eval('[data-cv-result] tr', (trs) => trs.map((r) => r.textContent));
  ok(rr.some((r) => /Operations/.test(r) && /Flat mill 6 mm/.test(r) && /Ball nose 3 mm/.test(r)) && rr.some((r) => /Resolution/.test(r) && /Ridge between lines/.test(r)), 'Relief: roughing and finishing operations, the resolution and the ridge left', rr.join(' | '));
  const rel = await readDownload(cv('download'));
  const relMin = Math.min(...parseGcode(rel.text).filter((m) => m.z !== null).map((m) => m.z));
  ok(relMin >= -4.0001 && relMin < -3.5 && checkProgram(rel.text, { maxDepth: 4.01 }).ok && (rel.text.match(/^M3 S/gm) || []).length === 2, 'the relief program stays within 4 mm, goes nearly that deep, has two tools and passes the checker', 'minZ ' + relMin);
  await shot('carving-03-relief');
  fs.writeFileSync(path.join(SHOTS, 'carving-07-relief-preview.png'), Buffer.from((await page.evaluate(() => document.querySelector('[data-cv-preview]').toDataURL('image/png'))).split(',')[1], 'base64'));
  ok(!(await page.$('[data-cv-error]')), 'no error on the panel');

  // the checker on someone else's program
  await page.evaluate(() => {
    const input = document.querySelector('[data-cv="checkfile"]');
    const dt = new DataTransfer(); dt.items.add(new File(['G21\nM3 S1000\nG0 X0 Y0 Z5\nG1 Z-1\nG1 X10 Y10\nG0 X50 Y0 Z-1\n'], 'other.nc', { type: 'text/plain' })); input.files = dt.files; input.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await page.waitForSelector('[data-cv-ext="issues"]', { timeout: 10000 });
  const ext = await page.textContent('[data-cv-ext="issues"]');
  ok(/other\.nc: \d+ things to look at/.test(ext) && /before any feed rate/.test(ext) && /rapid move crosses the work/.test(ext) && /no end/.test(ext), 'Check a G-code file: a program from somewhere else is read and its problems listed', ext);

  // an unusable job says why
  await page.click('[data-cv-mode="vcarve"]');
  await page.evaluate(() => window.cadcraft.doc.all().forEach(() => {}));
  await page.click('[data-cv="layers"] label:nth-of-type(1) input'); await page.click('[data-cv="layers"] label:nth-of-type(2) input'); await page.waitForTimeout(200);
  await page.click(cv('make')); await page.waitForSelector('[data-cv-error]', { timeout: 10000 });
  ok(/no closed shape/.test(await page.textContent('[data-cv-error]')), 'no layer ticked: a message, not a crash', await page.textContent('[data-cv-error]'));
  await page.click('[data-cv="layers"] label:nth-of-type(1) input'); await page.click('[data-cv="layers"] label:nth-of-type(2) input'); await page.waitForTimeout(200);

  // commands
  await typeCmd('CARVE', 600);
  ok((await history()).some((l) => /\d operations, \d+ lines, about \d+ min/.test(l)), 'CARVE: the summary is in the history', (await history()).slice(-3).join(' | '));
  await typeCmd('CARVEDRAW', 600);
  ok((await history()).some((l) => /Drew \d+ toolpaths on the CARVE layers/.test(l)) && (await carveEnts()) > 20, 'CARVEDRAW draws the toolpaths');

  // a setting survives a reload
  await page.fill(cv('feed'), '777'); await page.keyboard.press('Tab');
  await page.waitForTimeout(300);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ccAddons?.list().some((a) => a.id === 'carving' && a.state === 'active'), null, { timeout: 15000 });
  await openPanel();
  ok((await page.inputValue(cv('feed'))) === '777', 'the feed you typed is still there after a reload');
  await shot('carving-04-reloaded');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('carving-error').catch(() => {});
}
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
