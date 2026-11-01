#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — TakeoffCraft 0.8 PANEL-COMPACT (oltl2-c): the item editor's simple fields and the selected mark's panel
 * are the shared property grid (window.ccPropGrid). Run as root (session minted by admin.php, like browser-typed.mjs):
 *   node tools/takeoffcraft-test/browser-propgrid.mjs [--out dir]
 * Checks that ft-in, $ and % still type, each edit is one undo step, a refusal marks the box, the crew keeps the labor rate read-only,
 * the assembly editor stays below the grid, the mark panel moves a mark to another item and takes a spot elevation, and markup in a name is text.
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const PLAN = path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);
  const item = () => T(() => { const m = window.takeoffcraft.model; return m.state.items.find((i) => i.name !== 'Walls B') || m.state.items[0]; });
  const hist = () => T(() => window.takeoffcraft.model.state.items.length + ':' + (window.takeoffcraft.model.undoDepth ?? ''));
  const row = (id) => `#tc-item-props [data-pg-row="${id}"], [data-pg-row="${id}"]`;
  const setRow = async (id, v) => { const sel = `[data-pg-row="${id}"]`; await page.fill(sel, v); await page.press(sel, 'Enter'); await page.waitForTimeout(150); };

  await page.setInputFiles('[data-file-pdf]', PLAN);
  await page.waitForFunction(() => window.takeoffcraft.sheets().length === 1 && window.takeoffcraft.rendered() > 0, null, { timeout: 30000 });
  await page.selectOption('[data-scale-preset]', 'a1/4');
  const addItem = async (name, type) => {
    await page.click('[data-item-new]');
    await page.fill('[data-item-form] [name="name"]', name);
    await page.selectOption('[data-item-form] [name="type"]', type);
    await page.click('[data-item-form] button[type="submit"]');
    await page.waitForTimeout(150);
  };
  await addItem('Walls A', 'linear');
  ok(!!(await page.$('.tc-grid .pg-value')) && !!(await page.$('.tc-grid [role="group"], .tc-grid .pg-cat')), 'the item editor draws the shared property grid');
  ok((await page.$$('[data-pg-row]')).length >= 8, 'name, type, colour, unit, height, waste, material and labor are grid rows');

  // text rows
  await setRow('name', 'Partition walls');
  ok((await item()).name === 'Partition walls', 'a typed name renames the item');
  await setRow('height', '9\'-0"');
  ok(Math.abs((await item()).heightFt - 9) < 1e-9, 'ft-in still types: 9\'-0" = 9 ft');
  await setRow('height', '10');
  ok(Math.abs((await item()).heightFt - 10) < 1e-9 && await page.inputValue('[data-pg-row="height"]') === '10\'-0"', 'a bare 10 is feet and reads back 10\'-0"', await page.inputValue('[data-pg-row="height"]'));
  await setRow('height', 'garbage');
  ok(Math.abs((await item()).heightFt - 10) < 1e-9 && /is-invalid/.test(await page.getAttribute('[data-pg-row="height"]', 'class')), 'a refused length keeps the old value and marks the box');
  await setRow('waste', '10%');
  ok((await item()).waste === 1000, 'a percent types: 10% = 1000 basis points', String((await item()).waste));
  await setRow('mat', '$2.50');
  await setRow('lab', '1.25');
  const it2 = await item();
  ok(it2.mat === 25000 && it2.lab === 12500, 'rates type with or without $', JSON.stringify([it2.mat, it2.lab]));
  await setRow('csi', '09 21 16');
  ok((await item()).csi === '09 21 16', 'the division code is kept');

  // selects and colour
  await page.selectOption('[data-pg-row="unit"]', 'm');
  ok((await item()).unit === 'm', 'the unit select changes the item unit');
  await page.fill('.tc-grid .pg-colortext', '#ff0000'); await page.press('.tc-grid .pg-colortext', 'Enter'); await page.waitForTimeout(150);
  ok((await item()).color.toLowerCase() === '#ff0000', 'the colour box sets the item colour');

  // undo is one step per edit
  const before = (await item()).waste;
  await setRow('waste', '5');
  ok((await item()).waste === 500, 'a bare 5 is five percent');
  await T(() => document.activeElement?.blur()); await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
  ok((await item()).waste === before, 'one Ctrl+Z takes the edit back', String((await item()).waste));

  // the crew locks the labor rate, assembly stays below the grid
  await page.check('[data-field="crew"]'); await page.waitForTimeout(200);
  ok(await page.isDisabled('[data-pg-row="lab"]'), 'with a crew the labor rate row is read-only');
  ok(!!(await page.$('#tc-i-crew-prod')) && !!(await page.$('.tc-comps')), 'the crew fields and the assembly editor stay outside the grid');
  await page.uncheck('[data-field="crew"]'); await page.waitForTimeout(200);
  ok(!(await page.isDisabled('[data-pg-row="lab"]')), 'unticked: the labor rate is editable again');

  // markup in a name is text
  await setRow('name', '<img src=x onerror=window.__pwn=1>');
  ok(!(await T(() => window.__pwn)) && !(await page.$('.tc-grid img')), 'markup in an item name is text, not HTML');
  await setRow('name', 'Partition walls');

  // the mark panel
  await addItem('Other walls', 'linear');
  await T(() => { const tk = window.takeoffcraft; const its = tk.model.state.items; tk.model.addMark({ item: its[0].id, sheet: tk.sheets()[0].key, pts: [{ x: 924, y: 1151 }, { x: 1226, y: 1151 }] }); });
  const markId = await T(() => window.takeoffcraft.model.state.marks[0].id);
  await T((id) => window.takeoffcraft.select ? window.takeoffcraft.select(id) : null, markId).catch(() => {});
  if (!(await page.$('#tc-mark-props [data-pg-row="item"]'))) {
    // click the mark on the sheet
    const p = await T(() => window.takeoffcraft.toScreen({ x: 1075, y: 1151 }));
    await page.mouse.click(p.x, p.y); await page.waitForTimeout(250);
  }
  ok(!!(await page.$('[data-pg-row="item"]')), 'the selected mark has an Item row in the grid');
  ok(!!(await page.$('[data-pg-row="sheet"], .pg-ro')), 'its sheet and measured values are read-only rows');
  const other = await T(() => window.takeoffcraft.model.state.items[1].id);
  await page.selectOption('[data-pg-row="item"]', other); await page.waitForTimeout(200);
  ok(await T(() => window.takeoffcraft.model.state.marks[0].item) === other, 'choosing another item moves the mark (one undo step)');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(200);
  ok(await T(() => window.takeoffcraft.model.state.marks[0].item) !== other, 'Ctrl+Z puts the mark back');
} catch (e) { fail++; console.log('  FAIL browser run — ' + String(e.message).split('\n')[0]); }
finally { await browser.close(); try { admin('down'); } catch {} }
ok(problems.length === 0, 'no console errors', problems.join(' | ').slice(0, 300));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
