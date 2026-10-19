#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-typed.mjs — TakeoffCraft 0.6 TK.5+ in headless Chromium at https://getcadcraft.com/lab/takeoffcraft (run as root:
 * a session minted for the test admin by admin.php, so the shared login throttle is untouched).
 *   node tools/takeoffcraft-test/browser-typed.mjs [--file <x.quantities.json>] [--out dir]
 *
 * A typed quantity by the New item form ("Mobilization", Typed quantity, LS); its editor has Quantity, no Also measure and
 * no Height; quantity 1 and material 2500 typed → the Quantities table and job total say $2,500.00; picking the Linear tool
 * with it active asks for a linear item instead. Then a quantities file opened through Open takeoff's file input (CivilCraft's
 * own, from browser-06.mjs --only tk5, else a made-up one): two items added, the takeoff kept, the editor says where they came
 * from; the same file again changes nothing; Ctrl+Z takes the import back in one step. No console errors.
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-typed'));
fs.mkdirSync(OUT, { recursive: true });
let FILE = arg('--file', path.join(ROOT, 'tmp/civilcraft-test/tk5.quantities.json'));
if (!fs.existsSync(FILE)) {
  FILE = path.join(OUT, 'made-up.quantities.json');
  fs.writeFileSync(FILE, JSON.stringify({ format: 'cadcraft-quantities', version: 1, app: 'CivilCraft', project: 'Sample', made: '2026-10-18T12:00:00Z', items: [{ key: 'earthwork:cut', name: 'Earthwork: cut', unit: 'CY', qty: 120.5 }, { key: 'earthwork:fill', name: 'Earthwork: fill', unit: 'CY', qty: 80.25 }] }));
  console.log('  note no CivilCraft file from browser-06.mjs --only tk5: a made-up one');
}
const want = JSON.parse(fs.readFileSync(FILE, 'utf8'));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
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
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);
  const status = () => page.textContent('[data-status]');

  // a typed quantity by the form
  await page.click('[data-item-new]');
  await page.fill('#tc-new-name', 'Mobilization');
  await page.selectOption('#tc-new-type', 'fixed');
  await page.click('[data-item-form] button[type="submit"]');
  await page.waitForFunction(() => window.takeoffcraft.model.state.items.length === 1);
  ok(await T(() => { const i = window.takeoffcraft.model.state.items[0]; return i.type === 'fixed' && i.unit === 'LS' && i.qty === 0; }), 'New item › Typed quantity: an LS item with quantity 0');
  ok(/type its quantity in the item panel/.test(await status()), 'the status line says to type its quantity');
  ok(!!(await page.$('#tc-i-qty')) && !(await page.$('#tc-i-height')) && !(await page.$('[data-field="cond:linear"]')), 'its editor has Quantity, no Height and no Also measure');
  await page.fill('#tc-i-qty', '1'); await page.press('#tc-i-qty', 'Enter');
  await page.fill('#tc-i-mat', '2500'); await page.press('#tc-i-mat', 'Enter');
  await page.waitForFunction(() => window.takeoffcraft.estimate().total === 250000);
  ok(/2,500\.00/.test(await page.textContent('[data-job-total]').catch(() => '')) || (await T(() => window.takeoffcraft.estimate().total)) === 250000, 'quantity 1 × $2,500.00: the job total is $2,500.00');
  await page.fill('#tc-i-qty', 'abc'); await page.press('#tc-i-qty', 'Enter');
  ok((await page.getAttribute('#tc-i-qty', 'class')).includes('is-invalid') && (await T(() => window.takeoffcraft.model.state.items[0].qty)) === 1, 'a quantity that is not a number is refused, the box marked');
  await page.keyboard.press('Escape');
  await page.setInputFiles('[data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));     // public fixture: a sheet to point at
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0 && window.takeoffcraft.rendered?.() !== false, null, { timeout: 20000 });
  await page.click('[data-tool="count"]');
  ok(!(await page.$('[data-item-form][hidden]')) && (await page.inputValue('#tc-new-type')) === 'count', 'the Count tool with a typed quantity active asks for a count item instead (a typed quantity takes no marks)');
  await page.keyboard.press('Escape');
  await page.click('[data-tool="select"]').catch(() => {});
  await page.screenshot({ path: path.join(OUT, '01-typed.png') });

  // a quantities file through Open takeoff's file input
  const u0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.setInputFiles('[data-file-project]', FILE);
  await page.waitForFunction(() => window.takeoffcraft.model.state.items.length === 3, null, { timeout: 10000 });
  const items = await T(() => window.takeoffcraft.model.state.items.map((i) => ({ name: i.name, type: i.type, unit: i.unit, qty: i.qty, origin: i.origin })));
  ok(items[0].name === 'Mobilization' && items[1].qty === want.items[0].qty && items[2].qty === want.items[1].qty && items.slice(1).every((i) => i.type === 'fixed' && i.origin?.app === want.app), `the file adds ${want.items.map((x) => x.qty + ' ' + x.unit).join(' and ')} as typed quantities; the takeoff is kept`);
  ok(new RegExp(`2 added, 0 updated, 0 unchanged`).test(await status()), 'the status line counts what came in');
  ok(/From CivilCraft/.test(await page.textContent('[data-item-origin]')), 'the editor says where the selected one came from');
  ok((await T(() => window.takeoffcraft.model.undoStack.length)) === u0 + 1, 'one undo step');
  await page.setInputFiles('[data-file-project]', FILE);
  await page.waitForFunction(() => /0 added, 0 updated, 2 unchanged/.test(document.querySelector('[data-status]').textContent), null, { timeout: 10000 });
  ok((await T(() => window.takeoffcraft.model.state.items.length)) === 3, 'the same file again: nothing added, two unchanged');
  await page.screenshot({ path: path.join(OUT, '02-imported.png') });
  await T(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.takeoffcraft.model.state.items.length === 1);
  ok(true, 'Ctrl+Z takes the import back in one step');
  // LC.13: bid packages and leveling — set-up items with CSI numbers (making items is tested above), then the dialog by clicks
  await T(() => { const m = window.takeoffcraft.model; m.addItem({ name: 'Gypsum board', type: 'fixed', unit: 'SF', qty: 1000, mat: 15000, lab: 20000, csi: '09 21 16' }); m.addItem({ name: 'Paint', type: 'fixed', unit: 'SF', qty: 1000, mat: 4000, lab: 6000, csi: '09 91 23' }); });
  await page.click('[data-export-menu] > summary');
  await page.click('[data-act="export-level"]');
  await page.waitForSelector('[data-lvl-pkg="09"]');
  ok(/2 items on 0 sheets; our cost \$4,500\.00/.test(await page.textContent('[data-lvl-pkg="09"]')), 'Export › Bid packages and leveling: package 09 with its two items and our cost $4,500.00');
  const [csvDl] = await Promise.all([page.waitForEvent('download'), page.click('[data-lvl-csv="09"]')]);
  const csvText = fs.readFileSync(await csvDl.path(), 'utf8');
  ok(/scope\.csv$/.test(csvDl.suggestedFilename()) && /Gypsum board,09 21 16,1000,SF/.test(csvText) && !/\$/.test(csvText), `Scope CSV downloads ${csvDl.suggestedFilename()}: items and quantities, no prices`);
  for (const [who, amt] of [['Xavier Drywall', '4,200'], ['Yates Interiors', '3600']]) {
    await page.fill('[data-lvl-new-bidder="09"]', who); await page.fill('[data-lvl-new-amount="09"]', amt);
    await page.click('[data-lvl-add="09"]');
  }
  await page.waitForFunction(() => (window.takeoffcraft.model.state.bids || []).length === 2);
  const yid = await T(() => window.takeoffcraft.model.state.bids[1].id), xid = await T(() => window.takeoffcraft.model.state.bids[0].id);
  ok((await page.textContent(`[data-lvl-row="${yid}"]`)).includes('Low'), 'two bids typed: Yates at $3,600.00 is low');
  await page.click(`[data-lvl-row="${yid}"] details summary`);
  const paintId = await T(() => window.takeoffcraft.model.state.items.find((i) => i.name === 'Paint').id);
  await page.check(`[data-lvl-left="${yid}:${paintId}"]`);
  await page.waitForFunction((id) => document.querySelector(`[data-lvl-leveled="${id}"]`)?.textContent === '$4,600.00', yid);
  ok((await page.textContent(`[data-lvl-row="${xid}"]`)).includes('Low'), 'Yates leaves out paint: leveled $3,600.00 + $1,000.00 = $4,600.00, and Xavier ($4,200.00) is low');
  await page.screenshot({ path: path.join(OUT, '03-leveling.png') });
  await page.keyboard.press('Escape');
  await T(() => window.takeoffcraft.model.markSaved());
  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* already down */ }
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(ROOT, OUT)}`);
process.exit(fail ? 1 : 0);
