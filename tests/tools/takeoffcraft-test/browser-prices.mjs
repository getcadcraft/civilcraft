#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-prices.mjs — 0.8 EG.68 price memory in a browser at /lab/takeoffcraft (session takeoff_PART_2).
 *   node tools/takeoffcraft-test/browser-prices.mjs [--out dir]
 * A priced, used item → Save (Ctrl+S) → the price is remembered (browser storage, never in the takeoff file) → a new takeoff with the
 * same item unpriced → Prices: the dialog offers it → Price 1 unpriced item from memory → the rates are on the item, ONE undo step →
 * Ctrl+Z → forget → Clear all. Learn from a past takeoff file. No console errors.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, BASE } from '../gpu-remote/browser.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(ROOT, 'tmp/shots/takeoffcraft-prices');
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const browser = await launch();
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; } catch { /* the plain input / download then */ } });
  await ctx.addCookies(labCookie());
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  await page.evaluate(() => localStorage.removeItem('takeoffcraft.prices'));
  const T = (fn, a) => page.evaluate(fn, a);
  const b64 = await T(async () => { const L = await import('/assets/vendor/pdf-lib/current/pdf-lib.esm.min.js'); const d = await L.PDFDocument.create(); d.addPage([612, 792]).drawText('PRICE TEST', { x: 50, y: 700, size: 12 }); const b = await d.save(); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); });
  await page.setInputFiles('[data-file-pdf]', { name: 'p.pdf', mimeType: 'application/pdf', buffer: Buffer.from(b64, 'base64') });
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1, null, { timeout: 20000 });
  const key = await T(() => window.takeoffcraft.sheets()[0].key);
  await T((k) => { const m = window.takeoffcraft.model; const id = m.addItem({ name: '2x4 stud, 8 ft', type: 'count', mat: 38500, lab: 12000 }); m.addMark({ item: id, sheet: k, pts: [[100, 100]], kind: 'count' }); m.addItem({ name: 'Unused priced', type: 'count', mat: 5, lab: 5 }); }, key);
  ok(await page.isVisible('[data-act="prices"]'), 'the toolbar has Prices');
  const dl = page.waitForEvent('download', { timeout: 15000 });
  await page.keyboard.press('Control+s');
  const file = await dl; const saved = JSON.parse(fs.readFileSync(await file.path(), 'utf8'));
  await page.waitForTimeout(300);
  const mem = await T(() => JSON.parse(localStorage.getItem('takeoffcraft.prices') || 'null'));
  ok(mem && mem.names['2x4 stud 8 ft']?.obs.length === 1 && mem.names['2x4 stud 8 ft'].obs[0].mat === 38500, 'saving remembers the price of the used item', JSON.stringify(mem)?.slice(0, 200));
  ok(mem && !mem.names['unused priced'], 'an item with no mark is not remembered');
  ok(!JSON.stringify(saved).includes('prices"') && !('prices' in saved), 'the takeoff file does not carry the memory');
  fs.writeFileSync(path.join(OUT, 'past.takeoff.json'), JSON.stringify(saved));

  await T(() => window.takeoffcraft.reset());
  await T(() => window.takeoffcraft.model.addItem({ name: '2X4 Stud 8 ft', type: 'count' }));
  await page.click('[data-act="prices"]');
  await page.waitForSelector('[data-prices-dialog][open]');
  ok(await page.isVisible('[data-prices-item]'), 'the dialog lists the new item with its remembered price');
  ok(/Last job/.test(await page.textContent('[data-prices-item]')), 'it says what the last job used');
  await page.screenshot({ path: path.join(OUT, '01-prices.png') });
  const u0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.click('[data-prices-all]');
  const it = await T(() => window.takeoffcraft.model.state.items[0]);
  ok(it.mat === 38500 && it.lab === 12000, 'Price 1 unpriced item from memory: the rates are on the item', JSON.stringify([it.mat, it.lab]));
  ok((await T(() => window.takeoffcraft.model.undoStack.length)) === u0 + 1, 'ONE undo step');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z');
  ok((await T(() => window.takeoffcraft.model.state.items[0].mat)) === 0, 'Ctrl+Z takes the prices back');
  await page.click('[data-act="prices"]');
  await page.waitForSelector('[data-prices-dialog][open]');
  await page.click('[data-prices-forget]');
  ok(!(await page.isVisible('[data-prices-name]')), 'forget removes the name');
  await page.click('[data-prices-on]');
  ok((await T(() => JSON.parse(localStorage.getItem('takeoffcraft.prices')).off)) === true, 'the switch turns remembering off');
  ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
} catch (err) { fail++; console.log('  FAIL ' + (err.stack || err)); console.log('  problems:', problems.slice(0, 5)); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
