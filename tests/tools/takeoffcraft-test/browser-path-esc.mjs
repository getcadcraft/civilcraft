#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-path-esc.mjs — TakeoffCraft Path tool: Esc and the touch bar's Cancel clear the STAGED segments (0.11 fix, owner 2026-11-22),
 * in headless Chromium at https://getcadcraft.com/lab/takeoffcraft (run as root: a session minted for the test admin by admin.php).
 *   flock /var/www/CADCRAFT/getcadcraft.com/tmp/pf11-browser.lock node tools/takeoffcraft-test/browser-path-esc.mjs [--out dir]
 *
 * Before the fix both called the cross-app picker's pickClear (takeoffcraft.js declared `pickClear` twice): the selection went and
 * the staged path stayed. Here: add a mark (it becomes the selection), stage a path, Esc → nothing staged, the mark still selected,
 * the Path tool still on; Esc again (nothing staged) → the Select tool (the app's own Esc chain); Esc once more → select none.
 * Then on a touch screen: tap a line, the touch bar shows, Cancel → nothing staged, the selection kept, the bar hidden. No console errors.
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-path-esc'));
fs.mkdirSync(OUT, { recursive: true });
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);

const doc = await PDFLib.PDFDocument.create();
const pg = doc.addPage([600, 400]);
const L = (a, b) => pg.drawLine({ start: { x: a[0], y: a[1] }, end: { x: b[0], y: b[1] }, thickness: 1, color: PDFLib.rgb(0, 0, 0) });
L([100, 100], [300, 100]); L([300, 100], [300, 200]); L([300, 200], [100, 200]); L([100, 200], [100, 100]);   // a closed rectangle
L([400, 100], [500, 100]); L([500, 100], [500, 300]);                                                         // a separate L
const PLAN = path.join(OUT, 'path-esc.pdf');
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

async function open(touch) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, hasTouch: touch });
  await ctx.addInitScript(() => { try { window.showOpenFilePicker = undefined; } catch { /* the plain file input then */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);
  await page.setInputFiles('[data-file-pdf]', PLAN);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1, null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const key = (await T(() => window.takeoffcraft.sheets()))[0].key;
  await T(async (k) => { const U = await import('/assets/apps/takeoffcraft/dev/units.js'); window.takeoffcraft.model.setScale(k, U.scaleRecord({ method: 'drawing', ftPerUnit: 0.1, label: 'test 1 pt = 0.1 ft' })); }, key);
  await T(() => window.takeoffcraft.snapLoaded());
  await T(() => window.takeoffcraft.model.addItem({ name: 'Wall base', type: 'linear', color: '#D62728' }));
  await page.waitForTimeout(150);
  const wall = (await T(() => window.takeoffcraft.model.state.items))[0].id;
  await page.click(`[data-item="${wall}"]`);
  return { ctx, page, T };
}

try {
  // ---- keyboard ----
  const { ctx, page, T } = await open(false);
  const at = (x, y) => T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const pick = () => T(() => window.takeoffcraft.pick());
  const sel = () => T(() => window.takeoffcraft.selection());
  const tool = () => T(() => window.takeoffcraft.tool());
  const measure = () => page.textContent('[data-measure]').catch(() => '');
  const clickAt = async (x, y) => { const s = await at(x, y); await page.mouse.move(s.x, s.y); await page.waitForTimeout(80); await page.mouse.click(s.x, s.y); await page.waitForTimeout(80); };

  await page.click('[data-tool="path"]');
  await clickAt(200, 100);
  await page.keyboard.press('Enter');
  const marks = await T(() => window.takeoffcraft.model.state.marks.length);
  const sel0 = await sel();
  ok(marks === 1 && sel0.length === 1, 'Enter adds the picked rectangle as a mark and it is the selection', JSON.stringify([marks, sel0]));

  await clickAt(450, 100);
  ok((await pick()).staged.length === 1 && (await measure()).trim() !== '', 'the L is staged and the bar under the toolbar reports it');
  await page.screenshot({ path: path.join(OUT, '01-staged.png') });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  ok((await pick()).staged.length === 0, 'Esc clears the staged segments', JSON.stringify(await pick()));
  ok(JSON.stringify(await sel()) === JSON.stringify(sel0), 'Esc leaves the selection alone (before the fix it cleared it and kept the staged path)', JSON.stringify(await sel()));
  ok(!/^\s*(Path:|Closed path:|Outline:|\d+ paths:)/.test(await measure()) && /cleared/i.test(await page.textContent('[data-status]')), 'the bar no longer reports a pick and the status says the picked paths were cleared', JSON.stringify([await measure(), await page.textContent('[data-status]')]));
  ok((await tool()) === 'path', 'the Path tool stays on');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 1, 'nothing was added or removed');
  await page.screenshot({ path: path.join(OUT, '02-esc.png') });

  // a Shift-built multi-path stage goes in one Esc
  await clickAt(200, 100); await page.keyboard.down('Shift'); await clickAt(450, 100); await page.keyboard.up('Shift');
  ok((await pick()).staged.length === 2, 'Shift stages two paths');
  await page.keyboard.press('Escape');
  ok((await pick()).staged.length === 0 && (await tool()) === 'path', 'one Esc clears both, still in the Path tool');

  // nothing staged: the app's own Esc chain
  await page.keyboard.press('Escape');
  ok((await tool()) === 'select' && (await sel()).length === 1, 'Esc with nothing staged goes on to the Select tool (selection kept), as every tool does', JSON.stringify([await tool(), await sel()]));
  await page.keyboard.press('Escape');
  ok((await sel()).length === 0, 'Esc again (Select tool) selects none');
  await ctx.close();

  // ---- touch bar Cancel ----
  const tb = await open(true);
  const tp = tb.page, TT = tb.T;
  const tat = (x, y) => TT(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const tpick = () => TT(() => window.takeoffcraft.pick());
  const tsel = () => TT(() => window.takeoffcraft.selection());
  const tap = async (x, y) => { const s = await tat(x, y); await tp.touchscreen.tap(s.x, s.y); await tp.waitForTimeout(450); };   // past the double-tap window
  await tp.click('[data-tool="path"]');
  await tap(200, 100);
  ok((await TT(() => window.takeoffcraft.touch())).coarse, 'a tap switches TakeoffCraft to touch', JSON.stringify(await TT(() => window.takeoffcraft.touch())));
  if ((await tpick()).staged.length === 0) await tap(200, 100);
  ok((await tpick()).staged.length === 1, 'a tap on a line stages the rectangle', JSON.stringify(await tpick()));
  await tp.click('[data-touchbar] [data-touch="finish"], [data-touch="finish"]');
  await tp.waitForTimeout(100);
  const tsel0 = await tsel();
  ok((await TT(() => window.takeoffcraft.model.state.marks.length)) === 1 && tsel0.length === 1, 'the touch bar Finish adds it as a mark, which is selected', JSON.stringify(tsel0));
  await TT(() => window.takeoffcraft.tool() === 'path' || null);
  if ((await TT(() => window.takeoffcraft.tool())) !== 'path') await tp.click('[data-tool="path"]');
  await tap(450, 100);
  ok((await tpick()).staged.length === 1 && (await TT(() => window.takeoffcraft.touch())).bar === true, 'a tap on the L stages it and the touch bar shows', JSON.stringify([await tpick(), await TT(() => window.takeoffcraft.touch())]));
  await tp.screenshot({ path: path.join(OUT, '03-touch-staged.png') });
  await tp.click('[data-touch="cancel"]');
  await tp.waitForTimeout(100);
  ok((await tpick()).staged.length === 0, 'Cancel clears the staged segments', JSON.stringify(await tpick()));
  ok(JSON.stringify(await tsel()) === JSON.stringify(tsel0), 'Cancel leaves the selection alone', JSON.stringify(await tsel()));
  ok((await TT(() => window.takeoffcraft.touch())).bar === false, 'the touch bar hides (nothing left to finish)');
  ok((await TT(() => window.takeoffcraft.tool())) === 'path' && (await TT(() => window.takeoffcraft.model.state.marks.length)) === 1, 'still the Path tool, nothing added or removed');
  await tp.screenshot({ path: path.join(OUT, '04-touch-cancel.png') });
  await tb.ctx.close();
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
