#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pickpath.mjs — TakeoffCraft 0.8 SU.880 (Path tool: pick the PDF's own linework) in headless Chromium at
 * https://getcadcraft.com/lab/takeoffcraft (run as root: a session minted for the test admin by admin.php).
 *   node tools/takeoffcraft-test/browser-pickpath.mjs [--out dir]
 *
 * A made-up sheet (1 pt = 0.1 ft): a 200 x 100 rectangle drawn as four lines with a 1 pt hole in one corner, and a separate
 * 2-segment L. Click a side → the whole rectangle (4 segments, one gap bridged, closed); Backspace and Ctrl+Z take a segment
 * each; Enter makes a Linear mark in one undo step; click inside → an Area mark (200 sq ft); Shift adds a second path; ] and [
 * change the tolerance; a click on blank paper says so. No console errors.
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-pickpath'));
fs.mkdirSync(OUT, { recursive: true });
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);

const doc = await PDFLib.PDFDocument.create();
const pg = doc.addPage([600, 400]);
const L = (a, b) => pg.drawLine({ start: { x: a[0], y: a[1] }, end: { x: b[0], y: b[1] }, thickness: 1, color: PDFLib.rgb(0, 0, 0) });
L([100, 100], [300, 100]); L([300, 100], [300, 200]); L([300, 200], [100, 200]); L([100, 200], [100, 101]);      // a 1 pt hole at the first corner
L([400, 100], [500, 100]); L([500, 100], [500, 300]);
const PLAN = path.join(OUT, 'pickpath.pdf');
fs.writeFileSync(PLAN, await doc.save());

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { window.showOpenFilePicker = undefined; } catch { /* the plain file input then */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);
  const status = () => page.textContent('[data-status]');
  const measure = () => page.textContent('[data-measure]').catch(() => '');
  const at = (x, y) => T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const pick = () => T(() => window.takeoffcraft.pick());
  const clickAt = async (x, y, mods = []) => { const s = await at(x, y); await page.mouse.move(s.x, s.y); await page.waitForTimeout(80); for (const m of mods) await page.keyboard.down(m); await page.mouse.click(s.x, s.y); for (const m of mods) await page.keyboard.up(m); await page.waitForTimeout(80); };

  await page.setInputFiles('[data-file-pdf]', PLAN);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1, null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const key = (await T(() => window.takeoffcraft.sheets()))[0].key;
  await T(async (k) => { const U = await import('/assets/apps/takeoffcraft/dev/units.js'); window.takeoffcraft.model.setScale(k, U.scaleRecord({ method: 'drawing', ftPerUnit: 0.1, label: 'test 1 pt = 0.1 ft' })); }, key);
  await T(() => window.takeoffcraft.snapLoaded());

  ok(await page.isVisible('[data-tool="path"]'), 'the toolbar has the Path tool (Takeoff group)');
  await page.click('[data-tool="path"]');
  ok((await T(() => window.takeoffcraft.tool())) === 'path' && /gap tolerance/.test(await status()), 'the Path tool is on and its help line names the gap tolerance', await status());

  // hover then click one side of the rectangle
  await clickAt(200, 100);
  let p = await pick();
  ok(p.staged.length === 1 && p.staged[0].kind === 'line' && p.staged[0].segs === 4, 'one click on a side picks the whole rectangle: 4 segments', JSON.stringify(p));
  ok(p.staged[0].closed && p.staged[0].gaps === 1, 'it is closed, with the 1 pt hole bridged (tolerance 1.5)', JSON.stringify(p));
  ok(Math.abs(p.staged[0].len - 600) < 1.2, 'its length is 600 pt (60 ft at 0.1 ft per pt)', String(p.staged[0].len));
  ok(/4 segments/.test(await measure()) && /1 gap bridged/.test(await measure()) && /gap tolerance/.test(await measure()), 'the text under the toolbar gives segments, length, the tolerance and the bridged gap', await measure());
  await page.screenshot({ path: path.join(OUT, '01-picked.png') });

  // undo per segment
  await page.keyboard.press('Backspace');
  p = await pick();
  ok(p.staged[0].segs === 3 && !p.staged[0].closed, 'Backspace takes the last segment off: 3 segments, no longer closed', JSON.stringify(p));
  await page.keyboard.press('Control+z');
  p = await pick();
  ok(p.staged[0].segs === 2, 'Ctrl+Z does the same while a path is picked: 2 segments', JSON.stringify(p));
  const marks0 = await T(() => window.takeoffcraft.model.state.marks.length);
  ok(marks0 === 0, 'nothing was added to the takeoff by trimming');
  await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace');
  p = await pick();
  ok(p.staged.length === 0, 'the last segment takes the path away');

  // a stray L is its own path; Shift adds it
  await clickAt(200, 100);
  await clickAt(450, 100, ['Shift']);
  p = await pick();
  ok(p.staged.length === 2 && p.staged[1].segs === 2 && !p.staged[1].closed, 'Shift+click adds the separate L (2 segments, open)', JSON.stringify(p));
  ok(/2 paths/.test(await measure()), 'the text sums the picked paths', await measure());
  await clickAt(200, 100);                                    // without Shift: only this one again
  ok((await pick()).staged.length === 1, 'a plain click starts over');

  // Enter with no Linear item asks for one
  await page.keyboard.press('Enter');
  ok(/Linear item/.test(await status()) && (await T(() => window.takeoffcraft.model.state.marks.length)) === 0, 'Enter without a Linear item opens the item form and adds nothing', await status());
  await page.keyboard.press('Escape').catch(() => {});
  await T(() => { const m = window.takeoffcraft.model; m.addItem({ name: 'Wall base', type: 'linear', color: '#D62728' }); });
  await page.waitForTimeout(150);
  const wall = (await T(() => window.takeoffcraft.model.state.items))[0].id;
  await page.click(`[data-item="${wall}"]`);
  await page.click('[data-tool="path"]');
  await clickAt(200, 100);
  const u0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.keyboard.press('Enter');
  let q = (await T(() => window.takeoffcraft.quantities())).find((r) => r.name === 'Wall base');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 1 && Math.abs(q.qty - 60) < 0.2, 'Enter adds one Linear mark: 60 ft (the closed outline, perimeter)', JSON.stringify(q));
  ok((await T(() => window.takeoffcraft.model.undoStack.length)) === u0 + 1, 'in one undo step');

  // inside the outline: an area
  await T(() => { window.takeoffcraft.model.addItem({ name: 'Slab', type: 'area', color: '#1F77B4' }); });
  const slab = (await T(() => window.takeoffcraft.model.state.items)).find((i) => i.name === 'Slab').id;
  await page.click(`[data-item="${slab}"]`);
  await page.click('[data-tool="path"]');
  await clickAt(200, 150);
  p = await pick();
  ok(p.staged.length === 1 && p.staged[0].kind === 'loop' && Math.abs(p.staged[0].area - 20000) < 300, 'a click inside the outline picks it as an area (about 20,000 pt²)', JSON.stringify(p));
  await page.screenshot({ path: path.join(OUT, '02-outline.png') });
  await page.keyboard.press('Enter');
  q = (await T(() => window.takeoffcraft.quantities())).find((r) => r.name === 'Slab');
  ok(Math.abs(q.qty - 200) < 3, 'Enter adds an Area mark: about 200 sq ft', JSON.stringify(q));
  await page.keyboard.press('Control+z');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 1, 'Ctrl+Z (nothing picked) is the ordinary undo: the area mark goes');

  // the tolerance
  await page.click('[data-tool="path"]');
  const g0 = (await pick()).gap;
  await page.keyboard.press(']');
  ok((await pick()).gap > g0 && /Gap tolerance/.test(await status()), '] widens the tolerance and the status line says what it is now', await status());
  await page.keyboard.press('[');
  ok(Math.abs((await pick()).gap - g0) < 1e-9, '[ brings it back');
  for (let i = 0; i < 12; i++) await page.keyboard.press('[');
  const tight = (await pick()).gap;
  await clickAt(200, 100);
  p = await pick();
  ok(tight < 0.2 && p.staged[0].segs === 4 && !p.staged[0].closed && p.staged[0].gaps === 0, 'a tolerance below the 1 pt hole leaves the rectangle open: the four lines still join where they touch, the hole is not bridged', JSON.stringify([tight, p.staged[0]]));
  await page.keyboard.press('Escape');
  await clickAt(550, 350);
  ok(/No (line|closed outline)/.test(await status()) && (await pick()).staged.length === 0, 'a click on blank paper says there is nothing there', await status());
  await page.screenshot({ path: path.join(OUT, '03-tolerance.png') });
  ok(true, 'screenshots in ' + OUT);
} catch (err) {
  ok(false, 'browser run', err.stack?.split('\n').slice(0, 4).join(' | '));
} finally {
  await browser.close();
}
for (const i of problems) console.log('    ! ' + i);
ok(problems.length === 0, 'no console errors or page errors');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
