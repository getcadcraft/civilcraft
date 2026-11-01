#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-supply.mjs — 0.8 EG.51 supplier stock and lead times in a browser at /lab/takeoffcraft (session takeoff_PART_2).
 *   node tools/takeoffcraft-test/browser-supply.mjs [--out dir]
 * Items and marks → Supply → add a CSV → each need is matched, short / late / ok → the Problems panel (the shell's ⚠, source takeoffcraft.supply)
 * lists the shortage and the wait → Order list downloads the short items → Leave out → saved with the takeoff and read back (supply + accepted) → remove the file.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, BASE } from '../gpu-remote/browser.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv.includes('--out') ? process.argv[process.argv.indexOf('--out') + 1] : path.join(ROOT, 'tmp/shots/takeoffcraft-supply');
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const CSV = 'SKU,Description,In Stock,Lead Time,UOM,Unit Price,Vendor\nST-248,"2x4 Stud, 8 ft",300,3 days,EA,$3.85,Acme Lumber\nRB-4,Rebar #4,0,3 weeks,LF,$0.91,Steel Co\nCT-1,Ceiling tile,,backorder,EA,$22,Acme Lumber\nPL-1,Plywood sheet,40,2 days,EA,$41,Acme Lumber\n';
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
  const T = (fn, a) => page.evaluate(fn, a);
  const b64 = await T(async () => { const L = await import('/assets/vendor/pdf-lib/current/pdf-lib.esm.min.js'); const d = await L.PDFDocument.create(); d.addPage([612, 792]).drawText('SUPPLY TEST', { x: 50, y: 700, size: 12 }); const b = await d.save(); let s = ''; for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000)); return btoa(s); });
  await page.setInputFiles('[data-file-pdf]', { name: 'p.pdf', mimeType: 'application/pdf', buffer: Buffer.from(b64, 'base64') });
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1, null, { timeout: 20000 });
  const key = await T(() => window.takeoffcraft.sheets()[0].key);
  await T((k) => {
    const m = window.takeoffcraft.model;
    m.setScale(k, { ftPerUnit: 1, label: '1:1', preset: null });
    const a = m.addItem({ name: '2x4 Stud, 8 ft', type: 'count' }), b = m.addItem({ name: 'Rebar #4', type: 'linear' }), c = m.addItem({ name: 'Ceiling tile', type: 'count' }), d = m.addItem({ name: 'Plywood sheet', type: 'count' });
    for (let i = 0; i < 4; i++) m.addMark({ item: a, sheet: k, pts: [[i, 0]], kind: 'count' });
    m.addMark({ item: b, sheet: k, pts: [[0, 0], [50, 0]], kind: 'linear' }); m.addMark({ item: c, sheet: k, pts: [[0, 1]], kind: 'count' });
    for (let i = 0; i < 60; i++) m.addMark({ item: d, sheet: k, pts: [[i, 9]], kind: 'count' });
  }, key);
  ok(await page.isVisible('[data-act="supply"]'), 'the toolbar has Supply');
  await page.click('[data-act="supply"]');
  await page.waitForSelector('[data-supply-dialog][open]');
  ok(/No supplier file yet/.test(await page.textContent('[data-supply-dialog]')), 'before a file it says what a file needs');
  await page.setInputFiles('[data-supply-file]', { name: 'acme.csv', mimeType: 'text/csv', buffer: Buffer.from(CSV) });
  await page.waitForSelector('[data-supply-row]');
  const st = await T(() => Object.fromEntries([...document.querySelectorAll('[data-supply-row]')].map((r) => [r.querySelector('.tc-learn-name').firstChild.textContent.trim(), r.dataset.supplyStatus])));
  ok(st['2x4 Stud, 8 ft'] === 'ok' && st['Rebar #4'] === 'short' && st['Ceiling tile'] === 'late' && st['Plywood sheet'] === 'short', 'stud ok, rebar short, ceiling tile late (backorder), plywood short (60 needed, 40 in stock)', JSON.stringify(st));
  ok(/2 short, 1 waiting/.test(await page.textContent('[data-supply-summary]')), 'the summary counts them', await page.textContent('[data-supply-summary]'));
  ok(/Rebar #4, 21 days/.test(await page.textContent('[data-supply-summary]')), 'and names the longest wait that matters');
  await page.screenshot({ path: path.join(OUT, '01-supply.png') });
  const dl = page.waitForEvent('download', { timeout: 10000 });
  await page.click('[data-supply-order]');
  const csv = fs.readFileSync(await (await dl).path(), 'utf8');
  ok(/Rebar #4/.test(csv) && /Plywood sheet/.test(csv) && !/2x4 Stud/.test(csv), 'the order list holds the short items only');
  await page.keyboard.press('Escape');
  // the shell's Problems panel
  await page.waitForFunction(() => window.ccProblems && window.ccProblems.store.list().some((p) => p.code === 'supply.short'), null, { timeout: 8000 });
  const pl = await T(() => window.ccProblems.store.list().filter((p) => /^supply\./.test(p.code)).map((p) => [p.code, p.severity]));
  ok(pl.filter((x) => x[0] === 'supply.short' && x[1] === 'warning').length === 2 && pl.filter((x) => x[0] === 'supply.lead' && x[1] === 'note').length === 1, 'the ⚠ panel gets two shortage warnings and one wait note', JSON.stringify(pl));
  // saved with the takeoff
  const save = page.waitForEvent('download', { timeout: 15000 });
  await page.keyboard.press('Control+s');
  const saved = JSON.parse(fs.readFileSync(await (await save).path(), 'utf8'));
  ok(saved.supply?.v === 1 && saved.supply.sources[0].name === 'acme.csv' && saved.supply.sources[0].rows.length === 4, 'the supplier rows are saved in the takeoff file');
  // leave one out
  await page.click('[data-act="supply"]');
  await page.waitForSelector('[data-supply-dialog][open]');
  await page.click('[data-supply-leave]');
  await page.waitForFunction(() => document.querySelectorAll('[data-supply-row]').length === 3, null, { timeout: 4000 });
  ok(true, 'Leave out takes a need out of the check');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+z');
  await page.click('[data-act="supply"]');
  await page.waitForSelector('[data-supply-dialog][open]');
  ok((await T(() => document.querySelectorAll('[data-supply-row]').length)) === 4 || (await T(() => window.takeoffcraft.model.state.supply?.ignore?.length || 0)) === 0, 'and Ctrl+Z puts it back');
  ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
} catch (err) { fail++; console.log('  FAIL ' + (err.stack || err)); console.log('  problems:', problems.slice(0, 5)); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
