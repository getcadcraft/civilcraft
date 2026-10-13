#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-edit.mjs — CadCraft's Edit group, clipboard keys and its own settings, in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-edit.mjs [--shots <dir>]
 *
 * Run as root (it calls `sudo -u www-data php tools/cadcraft-test/admin.php up|down` for the test admin
 * cctest+cadcraft@projectz.xyz, disabled again at the end). Uses the cached Playwright Chromium, 1440 × 900.
 * Checks: the toolbar keeps two rows at 1440 px and its contract (role=toolbar child of <main>, groups with names,
 * tools in the tool row); one group named Edit with Undo, Redo, Copy, Paste and a More menu (Cut, Copy, Paste, Paste
 * in place, Duplicate and move, Delete, Select all, Select none, each with its key); real clicks on those buttons and
 * menu items, and the keys Ctrl+A, Ctrl+C, Ctrl+V (follows the pointer, click places), Ctrl+Shift+V, Ctrl+D (Esc leaves
 * nothing), Ctrl+X, Delete, Esc, Ctrl+Z (one step per paste); typed text at the command line keeps the browser's own
 * Ctrl+A; a second tab pastes from localStorage "cadcraft.clipboard", and refuses tampered contents; Settings ›
 * CadCraft: paste point (center) and clicking objects (replace), saved and reset; no console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const watch = (p) => { p.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); }); p.on('pageerror', (e) => problems.push('pageerror: ' + e.message)); };
const page = await ctx.newPage();
watch(page);

const count = (p = page) => p.evaluate(() => window.cadcraft.doc.count());
const selected = (p = page) => p.evaluate(() => window.cadcraft.host.selection.size);
const steps = (p = page) => p.evaluate(() => window.cadcraft.doc.undoStack.length);
const history = (p = page) => p.textContent('[data-history]');
const running = (p = page) => p.evaluate(() => window.cadcraft.engine.running);
const typeCmd = async (s, p = page) => { await p.click('[data-cmd-input]'); await p.keyboard.type(s); await p.keyboard.press('Enter'); await p.waitForTimeout(80); };
/** A world point → page pixels over the drawing canvas. */
const screen = (x, y, p = page) => p.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const world = (sx, sy, p = page) => p.evaluate(([sx, sy]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return window.cadcraft.view.toWorld(sx - r.left, sy - r.top); }, [sx, sy]);
/** A spot on the drawing canvas by fractions of its width and height → page pixels. */
const spot = (fx, fy, p = page) => p.evaluate(([fx, fy]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: Math.round(r.left + r.width * fx), y: Math.round(r.top + r.height * fy) }; }, [fx, fy]);
const circles = (p = page) => p.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'circle').map((e) => ({ cx: e.cx, cy: e.cy, r: e.r })));
const near = (a, b, t) => Math.abs(a - b) <= t;

async function signIn(p) {
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
}
async function openApp(p) {
  await p.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await p.waitForFunction(() => !!window.cadcraft);
  // exact clicks: no object snaps
  if ((await p.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true') await p.click('[data-toggle="osnap"]');
}

try {
  await signIn(page);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.clipboard'); localStorage.removeItem('cadcraft.settings'); localStorage.removeItem('cc-app-settings:cadcraft'); } catch {} });
  await openApp(page);

  console.log('\n== toolbar');
  const tb = await page.evaluate(() => {
    const t = document.querySelector('main > [role="toolbar"]');
    const groups = [...t.querySelectorAll(':scope > [role="group"]')];
    const tops = [...new Set(groups.map((g) => Math.round(g.getBoundingClientRect().top)))];
    const edit = groups.filter((g) => g.getAttribute('aria-label') === 'Edit');
    const row = edit[0]?.querySelector('.cc-tool-row');
    return {
      rows: tops.length, names: groups.map((g) => g.getAttribute('aria-label')), editCount: edit.length,
      editTools: row ? [...row.children].map((c) => (c.matches('details') ? 'menu:' + c.querySelector('summary').textContent.trim() : c.textContent.trim())) : [],
      items: [...document.querySelectorAll('[data-edit-menu] [role="menuitem"]')].map((b) => [b.firstChild.textContent.trim(), b.querySelector('kbd')?.textContent.trim()]),
    };
  });
  ok(tb.rows === 2, 'the toolbar still takes two rows at 1440 px', tb.rows + ' rows');
  ok(tb.editCount === 1 && tb.names.every((n) => n), 'exactly one group is named Edit; every group has a name', tb.names.join(', '));
  ok(JSON.stringify(tb.editTools) === JSON.stringify(['Undo', 'Redo', 'Copy', 'Paste', 'menu:More']), 'Edit holds Undo, Redo, Copy, Paste and More, as children of its tool row', JSON.stringify(tb.editTools));
  ok(JSON.stringify(tb.items) === JSON.stringify([['Cut', 'Ctrl+X'], ['Copy', 'Ctrl+C'], ['Paste', 'Ctrl+V'], ['Paste in place', 'Ctrl+Shift+V'], ['Duplicate and move', 'Ctrl+D'], ['Delete', 'Delete'], ['Select all', 'Ctrl+A'], ['Select none', 'Esc'], ['Quick select', 'QS'], ['Select similar', 'SIM'], ['Find and replace', 'FIND']]), 'More lists Cut, Copy, Paste, Paste in place, Duplicate and move, Delete, Select all, Select none, Quick select, Select similar, Find and replace with their keys', JSON.stringify(tb.items));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'edit-01-toolbar.png'), clip: { x: 0, y: 0, width: 1440, height: 220 } });

  console.log('\n== draw, select all, copy');
  await typeCmd('C'); await typeCmd('0,0'); await typeCmd('50');
  await typeCmd('REC'); await typeCmd('100,0'); await typeCmd('@80,40');
  await typeCmd('ZOOM'); await typeCmd('E');
  await page.waitForTimeout(100);
  ok(await count() === 2, 'two objects drawn');
  await page.click('[data-cmd-input]');
  await page.keyboard.press('Control+a');
  ok(await selected() === 2, 'Ctrl+A (command line empty) selects every object');
  await page.keyboard.press('Control+c');
  await page.waitForTimeout(100);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.clipboard') || 'null'));
  ok(stored && stored.format === 'cadcraft-clipboard' && stored.entities.length === 2, 'Ctrl+C puts both on the clipboard (localStorage "cadcraft.clipboard")');
  ok(await selected() === 2, 'and keeps them selected');

  console.log('\n== Paste button: the copy follows the pointer, a click places it');
  const s0 = await steps();
  await page.click('[data-cmd="PASTECLIP"].cc-tool');
  await page.waitForTimeout(80);
  ok(await running() === 'PASTECLIP', 'the Paste button starts PASTECLIP', '');
  const target = await spot(0.8, 0.8);
  await page.mouse.move(target.x - 30, target.y - 30);
  await page.mouse.move(target.x, target.y, { steps: 4 });
  const preview = await page.evaluate(() => window.cadcraft.view.state.preview.length);
  ok(preview >= 2, 'the copy follows the pointer (preview drawn)', preview + ' ' + (await history()).slice(-300));
  await page.mouse.click(target.x, target.y);
  await page.waitForTimeout(80);
  const at = await world(target.x, target.y);
  const cs = await circles();
  const pastedCircle = cs.find((c) => !near(c.cx, 0, 1e-6));
  // lower-left of the copy = (-50, -50): the circle's center lands 50 right and up of the click
  ok(await count() === 4 && pastedCircle && near(pastedCircle.cx, at.x + 50, 1e-6) && near(pastedCircle.cy, at.y + 50, 1e-6), 'a click places the copy by its lower-left corner', JSON.stringify({ at, cs }));
  ok(await steps() === s0 + 1 && await selected() === 2, 'one undo step; the pasted objects are selected');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(80);
  ok(await count() === 2, 'Ctrl+Z takes the whole paste away');

  console.log('\n== keys: Ctrl+V, Ctrl+Shift+V');
  await page.keyboard.press('Control+v');
  await page.waitForTimeout(80);
  const t2 = await spot(0.2, 0.25);
  await page.mouse.move(t2.x, t2.y, { steps: 3 });
  await page.mouse.click(t2.x, t2.y);
  await page.waitForTimeout(80);
  ok(await count() === 4, 'Ctrl+V, then a click, pastes');
  await page.keyboard.press('Control+Shift+v');
  await page.waitForTimeout(80);
  const inPlace = (await circles()).filter((c) => near(c.cx, 0, 1e-9) && near(c.cy, 0, 1e-9)).length;
  ok(await count() === 6 && inPlace === 2, 'Ctrl+Shift+V pastes in place (same coordinates)', inPlace);
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(80);
  ok(await count() === 2, 'two undos, two pastes gone');

  console.log('\n== More menu');
  await page.click('[data-edit-menu] > summary');
  ok(await page.isVisible('[data-edit-menu] [data-cmd="PASTEORIG"]'), 'More opens its menu');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'edit-02-more-menu.png'), clip: { x: 300, y: 40, width: 900, height: 420 } });
  await page.click('[data-edit-menu] [data-cmd="PASTEORIG"]');
  await page.waitForTimeout(80);
  ok(await count() === 4 && !(await page.evaluate(() => document.querySelector('[data-edit-menu]').open)), 'Paste in place from the menu pastes, and the menu closes');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-cmd="DESELECT"]');
  await page.waitForTimeout(80);
  ok(await selected() === 0, 'Select none clears the selection');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-cmd="SELECTALL"]');
  await page.waitForTimeout(80);
  ok(await selected() === 4, 'Select all selects everything');
  await page.click('[data-edit-menu] > summary');
  await page.keyboard.press('Escape');
  ok(!(await page.evaluate(() => document.querySelector('[data-edit-menu]').open)) && await selected() === 4, 'Esc closes the menu without touching the selection');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-cmd="ERASE"]');
  await page.waitForTimeout(80);
  ok(await count() === 0, 'Delete erases the selection');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(80);
  ok(await count() === 4, 'Ctrl+Z brings it back');
  // the pasted copies are on top of the originals: undo them for a clean start
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(80);
  ok(await count() === 2, 'back to the two originals');

  console.log('\n== duplicate: menu and Ctrl+D');
  const c1 = await screen(0, 0);
  await page.mouse.click(c1.x + (await page.evaluate(() => window.cadcraft.view.toScreen(50, 0).x - window.cadcraft.view.toScreen(0, 0).x)), c1.y);   // on the circle's edge
  await page.waitForTimeout(80);
  ok(await selected() === 1, 'a click on the circle selects it');
  const from = await screen(0, 0);
  await page.mouse.move(from.x, from.y, { steps: 2 });
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-cmd="DUPLICATE"]');
  await page.waitForTimeout(80);
  ok(await running() === 'DUPLICATE' && await count() === 2, 'Duplicate and move waits for the pointer, adding nothing yet');
  const to = await spot(0.3, 0.85);
  await page.mouse.move(to.x, to.y, { steps: 4 });
  await page.mouse.click(to.x, to.y);
  await page.waitForTimeout(80);
  const d1 = (await circles()).find((c) => c.cy < -10);   // the spot is below the original circle
  ok(await count() === 3 && d1 && near(d1.r, 50, 1e-9), 'the copy moved with the pointer and went down on the click', JSON.stringify(await circles()));
  ok(await selected() === 1, 'the copy is selected');
  const s1 = await steps();
  await page.keyboard.press('Control+d');
  await page.waitForTimeout(80);
  ok(await running() === 'DUPLICATE', 'Ctrl+D duplicates the selection');
  const away = await spot(0.7, 0.15);
  await page.mouse.move(away.x, away.y, { steps: 3 });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  ok(await count() === 3 && await steps() === s1, 'Esc leaves nothing behind');
  await page.keyboard.press('Control+d');
  await page.mouse.move(away.x + 5, away.y, { steps: 3 });
  await page.mouse.click(away.x + 5, away.y);
  await page.waitForTimeout(80);
  ok(await count() === 4 && await steps() === s1 + 1, 'Ctrl+D, move, click: one more copy, one undo step');

  console.log('\n== cut, Delete, Esc');
  const n2 = await count();
  await page.keyboard.press('Control+x');
  await page.waitForTimeout(80);
  ok(await count() === n2 - 1, 'Ctrl+X cuts the selected copy');
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.clipboard')).entities.length)) === 1, 'and puts it on the clipboard');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Escape');
  ok(await selected() === 0, 'Esc clears the selection');
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Delete');
  await page.waitForTimeout(80);
  ok(await count() === 0, 'Delete erases (the command line has the cursor, but nothing typed)');
  await page.keyboard.press('Control+z');
  await page.waitForTimeout(80);
  ok(await count() === n2 - 1, 'Ctrl+Z brings them back');
  await page.click('[data-cmd-input]');
  await page.keyboard.type('LIN');
  await page.keyboard.press('Control+a');
  ok(await selected() === 0 && (await page.evaluate(() => { const i = document.querySelector('[data-cmd-input]'); return i.selectionStart === 0 && i.selectionEnd === 3; })), 'with text typed at the command line, Ctrl+A selects the text, not the drawing');
  await page.keyboard.press('Escape');

  console.log('\n== another tab pastes; tampered contents are refused');
  const p2 = await ctx.newPage();
  watch(p2);
  await openApp(p2);
  await p2.click('[data-cmd-input]');
  await p2.keyboard.press('Control+Shift+v');
  await p2.waitForTimeout(100);
  ok(await count(p2) === 1 && (await p2.evaluate(() => window.cadcraft.doc.all()[0].type)) === 'circle', 'a second tab pastes what the first one cut');
  await p2.evaluate(() => { const c = JSON.parse(localStorage.getItem('cadcraft.clipboard')); c.entities[0].r = 'a lot'; localStorage.setItem('cadcraft.clipboard', JSON.stringify(c)); });
  const p3 = await ctx.newPage();
  watch(p3);
  await openApp(p3);
  await p3.click('[data-cmd-input]');
  await p3.keyboard.press('Control+v');
  await p3.waitForTimeout(100);
  ok(await count(p3) === 0 && !(await running(p3)) && /Nothing pasted: /.test(await history(p3)), 'a tab with tampered clipboard contents pastes nothing and says why', (await history(p3)).slice(-160));
  await p3.close();
  await p2.close();

  console.log('\n== Settings › CadCraft');
  await page.click('[data-settings-open]');
  const appTab = await page.$('[role="tab"]:has-text("CadCraft")');
  if (appTab) await appTab.click();
  ok(await page.isChecked('input[name="ccPaste"][value="lower-left"]') && await page.isChecked('input[name="ccPick"][value="add"]'), 'defaults: paste point lower-left corner, clicks add to the selection');
  await page.check('input[name="ccPaste"][value="center"]');
  await page.check('input[name="ccPick"][value="replace"]');
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings')));
  ok(st.pasteBase === 'center' && st.pick === 'replace', 'both saved in cadcraft.settings', JSON.stringify(st));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'edit-03-settings.png') });
  await page.click('.shell-dlg-foot button[type="submit"]');
  // paste point: center
  await page.evaluate(() => { const c = JSON.parse(localStorage.getItem('cadcraft.clipboard')); c.entities[0].r = 10; c.entities[0].cx = 500; c.entities[0].cy = 500; localStorage.setItem('cadcraft.clipboard', JSON.stringify(c)); });
  await page.keyboard.press('Control+v');
  const t3 = await spot(0.15, 0.2);
  await page.mouse.move(t3.x, t3.y, { steps: 3 });
  await page.mouse.click(t3.x, t3.y);
  await page.waitForTimeout(80);
  const at3 = await world(t3.x, t3.y);
  ok((await circles()).some((c) => near(c.r, 10, 1e-9) && near(c.cx, at3.x, 1e-6) && near(c.cy, at3.y, 1e-6)), 'with Center, the pasted circle is centered on the click');
  // clicking objects: replace
  await page.keyboard.press('Escape');
  const all = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'circle').map((e) => ({ id: e.id, cx: e.cx, cy: e.cy, r: e.r })));
  const edge = async (c) => screen(c.cx + c.r, c.cy);
  const e1 = await edge(all[0]), e2 = await edge(all[1]);
  await page.mouse.click(e1.x, e1.y);
  await page.mouse.click(e2.x, e2.y);
  await page.waitForTimeout(80);
  ok(await selected() === 1, 'with Replaces, a second click selects only the second object');
  await page.keyboard.down('Shift'); await page.mouse.click(e1.x, e1.y); await page.keyboard.up('Shift');
  await page.waitForTimeout(80);
  ok(await selected() === 2, 'Shift+click adds');
  await page.click('[data-settings-open]');
  if (appTab) await (await page.$('[role="tab"]:has-text("CadCraft")')).click();
  await page.click('[data-settings-reset]');
  ok(await page.isChecked('input[name="ccPaste"][value="lower-left"]') && await page.isChecked('input[name="ccPick"][value="add"]'), 'reset puts both back');
  await page.click('.shell-dlg-foot button[type="submit"]');
  await page.keyboard.press('Escape');
  await page.mouse.click(e1.x, e1.y);
  await page.mouse.click(e2.x, e2.y);
  await page.waitForTimeout(80);
  ok(await selected() === 2, 'after reset, clicks add to the selection again');

  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
