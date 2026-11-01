#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-countall.mjs — 0.8 EG.67 "Count everything" (session takeoff_PART_2) in a real browser, at /lab/takeoffcraft.
 *   node tools/takeoffcraft-test/browser-countall.mjs [--sheets 6] [--out dir]
 *   tools/gpu-remote/run.sh --session takeoff_PART_2 --lab -- tools/takeoffcraft-test/browser-countall.mjs --sheets 200     (rule 25: the 200-sheet timing)
 *
 * The plan set is made inside the page (pdf-lib from the site) so it runs here and on the workstation: page 1 has a legend (four symbols,
 * each with its name as real PDF text, plus a title with no symbol), every page has the symbols in a different number. Box the legend with
 * the Count everything tool → the panel lists the four names → count → every symbol is counted on every sheet, each count a link to its
 * sheet → turn one find off → add → items and marks → one Ctrl+Z takes them all back. Prints the machine line and the end-to-end time.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, remote, BASE } from '../gpu-remote/browser.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const N = Number(arg('--sheets', 6));
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-countall'));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const browser = await launch();
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addInitScript(() => { try { window.showOpenFilePicker = undefined; } catch { /* the plain file input then */ } });
  await ctx.addCookies(labCookie());
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  console.log('machine: ' + await machine(page));
  const T = (fn, a) => page.evaluate(fn, a);
  const status = () => page.textContent('[data-status]');

  // ---- the set, made in the page ----
  const SYMBOLS = ['Duplex outlet', 'Quad outlet', 'Ceiling light', 'Wall switch'];
  const want = (i, k) => ((i * 3 + k * 2) % 5) + (k === 3 && i % 4 === 0 ? 0 : 1) - (i === 2 && k === 1 ? 1 : 0);      // how many of symbol k on sheet i (0 on some)
  const b64 = await T(async ({ n, names }) => {
    const L = await import('/assets/vendor/pdf-lib/current/pdf-lib.esm.min.js');
    const doc = await L.PDFDocument.create();
    const font = await doc.embedFont(L.StandardFonts.Helvetica);
    const black = L.rgb(0, 0, 0), ink = { borderWidth: 1.2, borderColor: black };
    const sym = (pg, k, x, y) => {
      if (k === 3) { pg.drawRectangle({ x: x - 6, y: y - 5, width: 12, height: 10, ...ink }); pg.drawLine({ start: { x, y: y + 5 }, end: { x, y: y + 12 }, thickness: 1.2, color: black }); pg.drawLine({ start: { x: x - 3, y }, end: { x: x + 3, y }, thickness: 1.2, color: black }); return; }
      pg.drawCircle({ x, y, size: 9, ...ink });
      const ln = (a, b, c, d) => pg.drawLine({ start: { x: a, y: b }, end: { x: c, y: d }, thickness: 1.2, color: black });
      if (k === 0) { ln(x - 4, y, x + 4, y); }
      if (k === 1) { ln(x - 4, y - 2, x + 4, y - 2); ln(x - 4, y + 2, x + 4, y + 2); }
      if (k === 2) { ln(x - 6, y - 6, x + 6, y + 6); ln(x - 6, y + 6, x + 6, y - 6); }
    };
    const rnd = (s) => () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < n; i++) {
      const pg = doc.addPage([1224, 792]), r = rnd(77 + i), spots = [];
      for (let j = 0; j < 30; j++) { const x = 40 + r() * 1100, y = 40 + r() * 700; pg.drawLine({ start: { x, y }, end: { x: x + (r() - 0.5) * 300, y: y + (r() < 0.5 ? 0 : (r() - 0.5) * 200) }, thickness: 1, color: black }); }
      pg.drawRectangle({ x: 20, y: 20, width: 1184, height: 752, borderWidth: 1.2, borderColor: black });
      if (i === 0) {
        pg.drawText('SYMBOL LEGEND', { x: 70, y: 745, size: 11, font });
        names.forEach((nm, k) => { sym(pg, k, 70, 700 - k * 40); pg.drawText(nm, { x: 100, y: 696 - k * 40, size: 10, font }); });
        spots.push({ x: 160, y: 700 }, { x: 160, y: 660 }, { x: 160, y: 620 }, { x: 160, y: 580 });
      }
      names.forEach((nm, k) => {
        const want = ((i * 3 + k * 2) % 5) + (k === 3 && i % 4 === 0 ? 0 : 1) - (i === 2 && k === 1 ? 1 : 0);
        for (let c = 0; c < want; c++) { let x, y, t = 0; do { x = 330 + r() * 800; y = 60 + r() * 680; t++; } while (spots.some((p) => Math.abs(p.x - x) < 36 && Math.abs(p.y - y) < 36) && t < 60); spots.push({ x, y }); sym(pg, k, x, y); }
      });
      pg.drawText('SHEET E-' + (100 + i), { x: 1000, y: 40, size: 10, font });
    }
    const bytes = await doc.save();
    let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(s);
  }, { n: N, names: SYMBOLS });
  const buffer = Buffer.from(b64, 'base64');
  fs.writeFileSync(path.join(OUT, 'count-set.pdf'), buffer);
  await page.setInputFiles('[data-file-pdf]', { name: 'count-set.pdf', mimeType: 'application/pdf', buffer });
  await page.waitForFunction((n) => window.takeoffcraft.sheets().length === n, N, { timeout: 120000 });
  await page.waitForTimeout(500);
  const sheets = await T(() => window.takeoffcraft.sheets());
  const wantTotals = SYMBOLS.map((_, k) => Array.from({ length: N }, (_, i) => want(i, k)).reduce((a, b) => a + b, 0));

  // ---- box the legend ----
  ok(await page.isVisible('[data-tool="legend"]'), 'the toolbar has Count everything');
  await page.click('[data-tool="legend"]');
  ok(/legend/i.test(await status()), 'its help line asks for a box round the legend', await status());
  const at = (x, y) => T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const a = await at(50, 735), b = await at(300, 540);
  if (process.env.DEBUG) console.log('  drag', JSON.stringify([a, b, await T(() => [window.takeoffcraft.tool(), window.innerWidth])]));
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2); await page.mouse.move(b.x, b.y); await page.mouse.up();
  if (process.env.DEBUG) { await page.waitForTimeout(2500); console.log('  after drag:', await status()); await page.screenshot({ path: path.join(OUT, 'debug.png') }); }
  await page.waitForFunction(() => window.takeoffcraft.countall()?.phase === 'review', null, { timeout: 30000 }).catch(async (e) => { console.log('  status:', await status()); throw e; });
  let st = await T(() => window.takeoffcraft.countall());
  ok(st.entries.length === 4 && st.entries.every((e) => !e.problem), 'the legend gave 4 symbols and the title row none', JSON.stringify(st.entries));
  ok(JSON.stringify(st.entries.map((e) => e.name)) === JSON.stringify(SYMBOLS), 'each symbol has the name printed beside it', JSON.stringify(st.entries.map((e) => e.name)));
  ok(await page.isVisible('.tc-cabar canvas.tc-learn-thumb'), 'the panel shows each symbol\'s picture');
  await page.screenshot({ path: path.join(OUT, '01-legend-read.png') });

  // ---- count ----
  const t0 = Date.now();
  await page.click('[data-ca-start]');
  await page.waitForFunction(() => window.takeoffcraft.countall()?.phase === 'results', null, { timeout: 1700000 });
  const wall = (Date.now() - t0) / 1000;
  st = await T(() => window.takeoffcraft.countall());
  const ids = st.entries.map((e) => e.id);
  const got = ids.map((id) => st.total[id] || 0);
  console.log(`  count everything on ${N} sheets: ${wall.toFixed(1)} s end to end (drawing every sheet, searching, reading); counted ${got.join(', ')} of ${wantTotals.join(', ')}`);
  const missed = wantTotals.reduce((s, w, k) => s + Math.max(0, w - got[k]), 0), extra = got.reduce((s, g, k) => s + Math.max(0, g - wantTotals[k]), 0);
  ok(extra === 0, 'nothing is counted that is not a symbol (extra ' + extra + ')');
  ok(missed <= Math.ceil(wantTotals.reduce((a, b) => a + b, 0) * 0.03), 'at least 97% of the real symbols are found (missed ' + missed + ' of ' + wantTotals.reduce((a, b) => a + b, 0) + ')');
  ok(await page.isVisible(`[data-ca-result] [data-ca-sheet]`), 'each count is a link to its sheet');
  const links = await page.$$eval('[data-ca-result="' + ids[0] + '"] [data-ca-sheet]', (els) => els.length);
  ok(links === wantNonZero(0), 'the first symbol links exactly the sheets that have it (' + links + ')');
  function wantNonZero(k) { return Array.from({ length: N }, (_, i) => want(i, k)).filter((x) => x > 0).length > 40 ? Math.min(40, N) : Array.from({ length: N }, (_, i) => want(i, k)).filter((x) => x > 0).length; }
  const lastLink = await page.$$eval('[data-ca-result="' + ids[0] + '"] [data-ca-sheet]', (els) => els[els.length - 1].dataset.caSheet);
  await page.click(`[data-ca-result="${ids[0]}"] [data-ca-sheet="${lastLink}"]`);
  await page.waitForTimeout(500);
  ok(await T((k) => window.takeoffcraft.sheets().find((s) => s.key === k) && document.querySelector('[data-sheet][aria-current="true"]')?.dataset.sheet === k, lastLink), 'a click on a count goes to its sheet');
  await page.screenshot({ path: path.join(OUT, '02-results.png') });
  const level = await T(() => { const r = document.querySelector('[data-ca-level]'); r.value = '0.97'; r.dispatchEvent(new Event('input')); return window.takeoffcraft.countall().all; });
  ok(level <= st.all, 'a higher match level keeps fewer (' + level + ' of ' + st.all + ')');
  await T(() => { const r = document.querySelector('[data-ca-level]'); r.value = '0.75'; r.dispatchEvent(new Event('input')); });
  st = await T(() => window.takeoffcraft.countall());

  // ---- add ----
  const before = await T(() => ({ items: window.takeoffcraft.model.state.items.length, marks: window.takeoffcraft.model.state.marks.length, undo: window.takeoffcraft.model.undoStack.length }));
  await page.click('[data-ca-add]');
  await page.waitForTimeout(300);
  const after = await T(() => ({ items: window.takeoffcraft.model.state.items.length, marks: window.takeoffcraft.model.state.marks.length, undo: window.takeoffcraft.model.undoStack.length, names: window.takeoffcraft.model.state.items.map((i) => i.name), learn: window.takeoffcraft.learn.learn().symbols.length }));
  ok(after.items - before.items === 4 && after.marks - before.marks === st.all && after.undo - before.undo === 1, 'adding makes 4 count items with every mark in ONE undo step', JSON.stringify([before, after]));
  ok(SYMBOLS.every((s) => after.names.includes(s)), 'the items carry the legend\'s names');
  ok(after.learn >= 1, 'what was confirmed is kept in the takeoff\'s local memory (Learned)', String(after.learn));
  const q = await T(() => window.takeoffcraft.quantities());
  ok(SYMBOLS.every((s, k) => q.find((r) => r.name === s)?.qty === (st.total[ids[k]] || 0)), 'the quantities are the counts');
  await page.keyboard.press('Control+z');
  ok(await T((b) => window.takeoffcraft.model.state.items.length === b.items && window.takeoffcraft.model.state.marks.length === b.marks, before), 'one Ctrl+Z takes all of it back');
  ok(!(await page.isVisible('.tc-cabar')), 'the panel is gone after adding');
  ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
} catch (err) { fail++; console.log('  FAIL ' + (err.stack || err)); console.log('  problems:', problems.slice(0, 5)); }
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
