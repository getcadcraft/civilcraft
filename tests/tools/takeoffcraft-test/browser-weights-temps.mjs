#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-weights-temps.mjs — TakeoffCraft 0.9 TKW.1: weights as typed-quantity units (lb, ton, kg, t) and an item temperature in °C / °F.
 * Run as root (session minted by admin.php, like browser-propgrid.mjs):  node tools/takeoffcraft-test/browser-weights-temps.mjs
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
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch {} });   // the shell's Auto-focus panel would fold the grid
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
  const TS = '[data-pg-row="temp"]';
  await addItem('Pipe run', 'linear');
  const id = await T(() => window.takeoffcraft.model.state.items.at(-1).id);
  ok(!!(await page.$(TS)), 'the item editor has a Temperature field');
  const temp = async (v) => { await page.fill(TS, v); await page.press(TS, 'Enter'); await page.waitForTimeout(200); };
  const tk = () => T((i) => window.takeoffcraft.model.state.items.find((x) => x.id === i).tempK, id);
  await temp('5 C');
  ok(Math.abs((await tk()) - 278.15) < 1e-9, '5 C is kept as 278.15 K', String(await tk()));
  ok(await page.inputValue(TS) === '41°F', 'with feet-inches and nothing starred it reads in °F: 41°F', await page.inputValue(TS));
  await T(() => { const r = document.querySelector('input[name="tcTempShow"][value="degc"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.waitForTimeout(300);
  await T((i) => { window.takeoffcraft.model.updateItem(i, { name: 'Pipe run' }); }, id);   // redraw the editor
  await page.waitForTimeout(200);
  ok(await page.inputValue(TS) === '5°C', 'Settings › Temperatures as °C: the same value reads 5°C', await page.inputValue(TS));
  await temp('-4');
  ok(Math.abs((await tk()) - 269.15) < 1e-9, 'a bare -4 in a °C field is -4 °C = 269.15 K', String(await tk()));
  await temp('104 F');
  ok(Math.abs((await tk()) - 313.15) < 1e-9 && await page.inputValue(TS) === '40°C', '104 F is 40°C', String(await tk()));
  await temp('-500 C');
  ok(Math.abs((await tk()) - 313.15) < 1e-9, 'below absolute zero is refused: the value stays', String(await tk()));
  await temp('');
  ok((await tk()) === undefined, 'blank clears the temperature');
  await T(() => window.takeoffcraft.model.undo()); await page.waitForTimeout(200);
  ok(Math.abs((await tk()) - 313.15) < 1e-9, 'Undo brings it back (one undo step)', String(await tk()));
  // weights in the unit list of a typed quantity
  await addItem('Rebar', 'fixed');
  const units = await T(() => [...document.querySelectorAll('[data-pg-row="unit"] option, #tc-i-unit option')].map((o) => o.value));
  ok(['lb', 'TON', 'kg', 't'].every((u) => units.includes(u)), 'a typed quantity lists lb, ton, kg and t', units.join());
  await page.selectOption('[data-pg-row="unit"]', 'kg'); await page.waitForTimeout(200);
  ok(await T(() => window.takeoffcraft.model.state.items.at(-1).unit) === 'kg', 'kg can be chosen');
} catch (e) { fail++; console.log('  FAIL browser run — ' + String(e.message).split('\n')[0]); }
finally { await browser.close(); try { admin('down'); } catch {} }
ok(problems.length === 0, 'no console errors', problems.join(' | ').slice(0, 300));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
