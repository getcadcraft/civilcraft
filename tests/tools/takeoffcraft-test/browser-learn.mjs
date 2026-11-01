#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-learn.mjs — 0.8 SU.811 (session sx-learn) in headless Chromium at https://getcadcraft.com/lab/takeoffcraft (run as root:
 * a session minted for the test admin by admin.php, so the shared login throttle is untouched).
 *   node tools/takeoffcraft-test/browser-learn.mjs [--out dir]
 *
 * A generated two-page plan set (the same symbol 5 times on each page, 3 look-alike decoys, a stamp in the corner): Auto count on
 * page 1 by a dragged box → accepted → the symbol is learned (status line, the Learned button's count); page 2 → the offer bar
 * says Find Outlet → its review → accepted → page 2 counted, the symbol's count grows; the Learned dialog lists the symbol with
 * its picture; Save the conditions as a set; Repeat the selected stamp on every page (one undo step); delete one thing and undo;
 * Save takeoff → the file has `learn`; New takeoff, the plans again, Same as last job… picks the saved file → conditions and
 * what it learned come in; Clear all. Screenshots in tmp/shots/takeoffcraft-learn/. No console errors.
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-learn'));
fs.mkdirSync(OUT, { recursive: true });
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);

// the plan set: 2 pages 11 × 17 landscape, an outlet symbol (box, bar, dot) 5 times on each, decoys (box with a diagonal) 3 times
// a duplex outlet: a circle, two short prongs and a tail to the right; decoys: a plain circle, a circle with one prong, a square
const ink = { borderWidth: 1.2, borderColor: null };
function outlet(pg, x, y) {
  pg.drawCircle({ x, y, size: 9, ...ink });
  pg.drawLine({ start: { x: x - 3, y: y - 4 }, end: { x: x - 3, y: y + 4 }, thickness: 1.2 });
  pg.drawLine({ start: { x: x + 3, y: y - 4 }, end: { x: x + 3, y: y + 4 }, thickness: 1.2 });
  pg.drawLine({ start: { x: x + 9, y }, end: { x: x + 19, y }, thickness: 1.2 });
}
function decoy(pg, x, y, kind) {
  if (kind === 0) pg.drawCircle({ x, y, size: 9, ...ink });
  else if (kind === 1) { pg.drawCircle({ x, y, size: 9, ...ink }); pg.drawLine({ start: { x: x - 3, y: y - 4 }, end: { x: x - 3, y: y + 4 }, thickness: 1.2 }); }
  else pg.drawRectangle({ x: x - 9, y: y - 9, width: 18, height: 18, ...ink });
}
const pages = [
  { syms: [[100, 500], [300, 520], [520, 480], [700, 300], [200, 200]], decoys: [[400, 300], [600, 150], [150, 350]] },
  { syms: [[120, 450], [350, 430], [560, 520], [650, 200], [260, 150]], decoys: [[420, 250], [700, 420], [100, 300]] },
];
ink.borderColor = PDFLib.rgb(0, 0, 0);
const doc = await PDFLib.PDFDocument.create();
const centres = [];
for (const [pi, p] of pages.entries()) {
  const pg = doc.addPage([1224, 792]);
  for (const [x, y] of p.syms) { outlet(pg, x, y); centres.push({ page: pi, x: x + 5, y }); }
  p.decoys.forEach(([x, y], i) => decoy(pg, x, y, i));
  pg.drawRectangle({ x: 1000, y: 40, width: 200, height: 80, borderWidth: 1, borderColor: PDFLib.rgb(0, 0, 0) });
  pg.drawText('LEARN TEST SET  SHEET ' + (pi + 1), { x: 1010, y: 70, size: 10 });
}
const PLANS = path.join(OUT, 'learn-set.pdf');
fs.writeFileSync(PLANS, await doc.save());

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
  const at = (x, y) => T(([x, y]) => window.takeoffcraft.toScreen({ x, y }), [x, y]);
  const learn = () => T(() => window.takeoffcraft.learn.learn());
  const waitReview = () => page.waitForFunction(() => window.takeoffcraft.autocount() && !window.takeoffcraft.autocount().running, null, { timeout: 60000 });
  const showSheet = async (i) => { const key = (await T(() => window.takeoffcraft.sheets()))[i].key; await page.click(`[data-sheet="${key}"]`).catch(async () => { await page.keyboard.press(i ? 'PageDown' : 'PageUp'); }); await page.waitForTimeout(400); };

  ok(await page.isVisible('[data-act="learned"]'), 'the toolbar has Learned (next to Auto count)');
  ok(await T(() => !!window.takeoffcraft.model.state.learn && window.takeoffcraft.learn.learn().symbols.length === 0), 'a new takeoff starts with an empty learn section');

  await page.setInputFiles('[data-file-pdf]', PLANS);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 2, null, { timeout: 20000 });
  await page.waitForTimeout(500);
  const outlet = await T(() => window.takeoffcraft.model.addItem({ name: 'Duplex outlet', type: 'count', color: '#D62728' }));
  await page.click(`[data-item="${outlet}"]`);
  await page.click('[data-tool="autocount"]');
  const c0 = centres[0];
  const a = await at(c0.x - 18, c0.y - 13), b = await at(c0.x + 18, c0.y + 13);
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2); await page.mouse.move(b.x, b.y); await page.mouse.up();
  await waitReview();
  let ac = await T(() => window.takeoffcraft.autocount());
  const real = (pg) => (bx) => centres.some((c) => c.page === pg && Math.hypot(c.x - bx.center.x, c.y - bx.center.y) < 6);
  ok(ac.boxes.filter(real(0)).length === 5, 'Auto count on page 1: the 5 outlets are among the ' + ac.found + ' boxes offered at 75%');
  await T(() => { const r = document.querySelector('[data-ac-threshold]'); r.value = '0.88'; r.dispatchEvent(new Event('input')); });
  ac = await T(() => window.takeoffcraft.autocount());
  ok(ac.found === 5 && ac.boxes.every(real(0)), 'the person moves the slider to 88%: exactly the 5 outlets (found ' + ac.found + ')');
  await page.click('[data-ac-accept]');
  await page.waitForTimeout(200);
  let L = await learn();
  ok(L.symbols.length === 1 && L.symbols[0].item.name === 'Duplex outlet' && L.symbols[0].found === 5 && L.symbols[0].th === 0.88, 'accepting keeps the symbol: Duplex outlet, 5 marks, at the 88% the person chose', JSON.stringify(L.symbols.map((x) => [x.found, x.th])));
  ok(/Learned the symbol for Duplex outlet/.test(await status()), 'the status line says it learned the symbol');
  ok((await page.getAttribute('[data-act="learned"]', 'data-learned')) === '1', 'the Learned button counts 1 thing learned');
  await page.click('[data-tool="select"]');

  // page 2: the offer bar
  await showSheet(1);
  const offer = await T(() => window.takeoffcraft.learn.bar());
  ok(offer && offer.some((x) => /Find Duplex outlet/.test(x)), 'page 2 offers "Find Duplex outlet"', JSON.stringify(offer));
  await page.screenshot({ path: path.join(OUT, '01-offer-bar.png') });
  await page.click('[data-learn-find]');
  await waitReview();
  ac = await T(() => window.takeoffcraft.autocount());
  ok(ac.found === 5 && ac.adding === 5 && ac.threshold === 0.88 && ac.boxes.every(real(1)), 'the learned symbol is found on page 2 through the usual review, at its learned 88%: the 5 outlets, no decoy (found ' + ac.found + ')');
  await page.screenshot({ path: path.join(OUT, '02-learned-review.png') });
  await page.click('[data-ac-accept]');
  await page.waitForTimeout(200);
  const q = (await T(() => window.takeoffcraft.quantities())).find((r) => r.name === 'Duplex outlet');
  ok(q?.qty === 10, 'accepted: 10 outlets on the two pages');
  L = await learn();
  ok(L.symbols[0].found === 10 && L.symbols[0].runs === 2, 'the learned symbol counts both (10 marks, 2 counts)');
  const u0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.keyboard.press('Control+z');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 5 && (await learn()).symbols[0].found === 5, 'one Ctrl+Z takes the 5 marks and their count back');
  await page.keyboard.press('Control+y');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 10 && (await T(() => window.takeoffcraft.model.undoStack.length)) === u0, 'Ctrl+Y brings them back');

  // the dialog
  await page.click('[data-act="learned"]');
  await page.waitForSelector('[data-learn-dialog][open]');
  ok(await page.isVisible('[data-learn-sym] canvas.tc-learn-thumb'), 'the dialog lists the symbol with its picture');
  ok(/nothing is sent anywhere/i.test(await page.textContent('.tc-learn-lead')), 'the dialog says it is kept in the file and nothing is sent');
  await page.screenshot({ path: path.join(OUT, '03-dialog-paper.png') });
  // save the conditions as a set
  await page.click('[data-learn-set-save]');
  await page.fill('.tc-ask input', 'Electrical base');
  await page.click('.tc-ask button[data-key="ok"]');
  await page.waitForTimeout(200);
  L = await learn();
  ok(L.sets.length === 1 && L.sets[0].name === 'Electrical base' && L.sets[0].items.length === 1, 'Save the conditions as a set: "Electrical base", 1 condition');
  await page.click('[data-learn-dialog] .tc-dialog-foot .btn-plot');

  // repeat a stamp on every page
  await showSheet(0);
  const stamp = await T(() => { const m = window.takeoffcraft.model; const id = m.addItem({ name: 'Title block stamp', type: 'count' }); return m.addMark({ item: id, sheet: window.takeoffcraft.sheets()[0].key, pts: [{ x: 1100, y: 80 }] }); });
  const sp = await at(1100, 80);
  await page.mouse.click(sp.x, sp.y);
  ok((await T(() => window.takeoffcraft.selection())).includes(stamp), 'the stamp is selected');
  await page.click('[data-act="learned"]');
  await page.click('[data-learn-repeat-sel]');
  await page.fill('.tc-ask input', 'Title block');
  const repText = await page.textContent('.tc-ask-text');
  await page.click('.tc-ask button[data-key="ok"]');
  await page.waitForTimeout(200);
  const k2 = (await T(() => window.takeoffcraft.sheets()))[1].key;
  ok(/1 other page/.test(repText) && (await T((k) => window.takeoffcraft.model.marksOn(k).filter((m) => window.takeoffcraft.model.item(m.item).name === 'Title block stamp').length, k2)) === 1, 'Repeat on every page: the stamp goes on page 2 at the same place');
  ok((await learn()).repeats[0]?.name === 'Title block', 'the pattern is learned');
  await page.keyboard.press('Control+z');
  ok((await T((k) => window.takeoffcraft.model.marksOn(k).length, k2)) === 5 && !(await learn()).repeats.length, 'one undo takes the repeated mark and the pattern back');
  await page.keyboard.press('Control+y');

  // delete one thing, undo
  await page.click('[data-act="learned"]');
  await page.click('[data-learn-del^="sets:"]');
  await page.waitForTimeout(150);
  ok(!(await learn()).sets.length && (await page.$$('[data-learn-sec="sets"] .tc-learn-row')).length === 0, 'the bin deletes the set (the list updates)');
  await page.click('[data-learn-dialog] .tc-dialog-foot .btn-plot');
  await page.keyboard.press('Control+z');
  ok((await learn()).sets.length === 1, 'undo brings it back');

  // save → new → same as last job
  const dl = page.waitForEvent('download');
  await page.keyboard.press('Control+s');
  const saved = path.join(OUT, 'learn-job.takeoff.json');
  await (await dl).saveAs(saved);
  const file = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(file.version === 1 && file.learn?.v === 1 && file.learn.symbols.length === 1 && file.learn.sets.length === 1 && file.learn.repeats.length === 1, 'the saved file (version 1) carries learn: 1 symbol, 1 set, 1 pattern');
  await page.click('[data-act="new-takeoff"]');
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 0);
  ok((await learn()).symbols.length === 0, 'New takeoff: nothing learned (it lives in the files)');
  await page.setInputFiles('[data-file-pdf]', PLANS);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 2, null, { timeout: 20000 });
  await page.click('[data-act="learned"]');
  const fc = page.waitForEvent('filechooser');
  await page.click('[data-learn-last]');
  await (await fc).setFiles(saved);
  await page.waitForSelector('.tc-ask');
  await page.screenshot({ path: path.join(OUT, '04-same-as-last-job.png') });
  await page.click('.tc-ask button[data-key="ok"]');
  await page.waitForTimeout(300);
  if (await page.$('[data-learn-dialog][open]')) await page.click('[data-learn-dialog] .tc-dialog-foot .btn-plot');
  L = await learn();
  const names = await T(() => window.takeoffcraft.model.state.items.map((i) => i.name).sort());
  ok(names.join('|') === 'Duplex outlet|Title block stamp' && L.symbols.length === 1 && L.repeats.length === 1 && L.sets.some((s) => s.name === 'Electrical base') && L.sets.some((s) => /Conditions of/.test(s.name)), 'Same as last job: its 2 conditions added, its symbol, pattern and set learned, its conditions kept as a set');
  ok((await T(() => window.takeoffcraft.model.state.marks.length)) === 0, '…and none of its marks');
  await page.click('[data-act="learned"]');
  await page.screenshot({ path: path.join(OUT, '05-dialog-after-last-job.png') });
  // model space look
  await page.click('[data-learn-dialog] .tc-dialog-foot .btn-plot');
  await T(() => document.documentElement.setAttribute('data-space', 'model'));
  await page.click('[data-act="learned"]');
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, '06-dialog-model.png') });
  await T(() => document.documentElement.setAttribute('data-space', 'paper'));
  // Clear all
  await page.click('[data-learn-clear]');
  await page.click('.tc-ask button[data-key="ok"]');
  await page.waitForTimeout(200);
  L = await learn();
  ok(L.symbols.length + L.sets.length + L.asm.length + L.repeats.length === 0 && (await T(() => window.takeoffcraft.model.state.items.length)) === 2, 'Clear all: nothing learned is left, the items stay');
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err.stack || err));
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* fine */ }
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\nbrowser-learn (SU.811): ${pass} passed, ${fail} failed; shots in ${path.relative(ROOT, OUT)}`);
process.exit(fail ? 1 : 0);
