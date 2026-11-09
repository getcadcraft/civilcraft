#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cmdline.mjs — CadCraft's command line docks or floats, one line + the F2 history, and the compact top area (0.9 SU.1083,
 * session cad-cmdline-09; cmdline.js), in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-cmdline.mjs [--shots <dir>]
 *
 * Run as root (test admin cctest+cadcraft@projectz.xyz via admin.php up|down). At 1440 × 900: the standard line; the history pop-up
 * (button, F2, Esc keeps a running command, PageUp, typing stays in the line, no jump of the drawing); one line (history clipped but
 * still a live region, the peek); the height handle by keys and by drag; floating by dragging the grip (more room for the drawing,
 * inside <main>), moved by keys, kept after a reload and after a shell Settings save, the width handle, docked by a drop on the status
 * bar; COMMANDLINE / CMDLINE; Settings › Command line and Top area; TOPAREA; compact top in the three menu styles; F2 in the Drafting
 * classic style (one toggle); Reset the layout; the layout-fit prompt's offer and Yes at a short window. At 390 × 844 (phone): docked
 * whatever is stored, no grip/handles/menu, the history button works, no sideways scroll.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { showSetting } from '../shell-test/show-setting.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const settle = (ms = 250) => page.waitForTimeout(ms);
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const stageH = () => page.evaluate(() => Math.round(document.querySelector('[data-stage]').getBoundingClientRect().height));
const bar = () => page.evaluate(() => {
  const b = document.querySelector('[data-cmd-bar]'), h = document.querySelector('[data-history]'), m = document.querySelector('main').getBoundingClientRect();
  const r = b.getBoundingClientRect(), hr = h.getBoundingClientRect();
  return { dock: b.dataset.cmdDock, lines: b.dataset.cmdLines, pos: getComputedStyle(b).position, pop: b.classList.contains('is-pop'), x: Math.round(r.left - m.left), y: Math.round(r.top - m.top),
    w: Math.round(r.width), h: Math.round(r.height), inside: r.left >= m.left - 1 && r.right <= m.right + 1 && r.top >= m.top - 1 && r.bottom <= m.bottom + 1,
    histH: Math.round(hr.height), histTop: Math.round(hr.top), barTop: Math.round(r.top), live: h.getAttribute('aria-live'), items: h.children.length,
    expanded: document.querySelector('[data-cmd-hist]').getAttribute('aria-expanded'), focusInput: document.activeElement === document.querySelector('[data-cmd-input]'),
    state: window.cadcraft.host.cmdline.state() };
});
const stored = () => page.evaluate(() => { try { return JSON.parse(localStorage.getItem('cc-app-settings:cadcraft') || '{}').cmdline || null; } catch { return 'bad'; } });
const noSideways = () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await settle(150); };
async function open(style = 'cadcraft', keep = false) {
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  if (!keep) await page.evaluate((s) => { localStorage.setItem('cadcraft.input', JSON.stringify({ style: s })); localStorage.removeItem('cadcraft.settings'); localStorage.removeItem('cc-app-settings:cadcraft'); localStorage.setItem('cc-fit', 'never'); localStorage.removeItem('cc-workspace'); }, style);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.cmdline, null, { timeout: 20000 });
  await settle(400);
}
async function dragFrom(sel, dx, dy, to) {
  const b = await page.locator(sel).boundingBox();
  const x = b.x + b.width / 2, y = b.y + b.height / 2;
  await page.mouse.move(x, y); await page.mouse.down();
  await page.mouse.move(x + dx / 3, y + dy / 3, { steps: 3 });
  if (to) await page.mouse.move(to.x, to.y, { steps: 8 }); else await page.mouse.move(x + dx, y + dy, { steps: 8 });
  await page.mouse.up(); await settle();
}

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  console.log('\n== the standard command line (1440 x 900)');
  await open();
  let b = await bar();
  ok(b.dock === 'bottom' && b.lines === 'std' && b.pos === 'relative', 'starts docked at the standard height', JSON.stringify(b));
  ok(b.histH >= 60 && b.histH <= 80, 'the history keeps its height (4.6 rem)', b.histH);
  ok(b.live === 'polite', 'the history is a live region');
  const std0 = await stageH();
  await shot('1-standard');

  console.log('\n== the history pop-up');
  await typeCmd('LINE');
  await page.click('[data-cmd-hist]'); await settle();
  b = await bar();
  ok(b.pop && b.expanded === 'true', 'the history button opens the pop-up (aria-expanded)', JSON.stringify({ pop: b.pop, ex: b.expanded }));
  ok(b.histH > 200 && b.histTop < b.barTop, 'the pop-up is tall and above the line', `${b.histH} @ ${b.histTop} vs ${b.barTop}`);
  ok(Math.abs((await stageH()) - std0) <= 1, 'the drawing does not jump while it is open');
  ok(b.focusInput, 'typing stays in the command line');
  await shot('2-popup');
  await page.keyboard.press('PageUp'); await settle(80);
  ok(await page.evaluate(() => { const h = document.querySelector('[data-history]'); return h.scrollTop < h.scrollHeight - h.clientHeight || h.scrollHeight <= h.clientHeight; }), 'PageUp scrolls the history');
  await page.keyboard.press('Escape'); await settle();
  b = await bar();
  ok(!b.pop && b.expanded === 'false', 'Esc closes the pop-up');
  ok(await page.evaluate(() => window.cadcraft.engine.busy), 'and leaves the running command alone');
  await page.keyboard.press('Escape'); await settle();
  ok(await page.evaluate(() => !window.cadcraft.engine.busy), 'a second Esc cancels the command');
  await page.keyboard.press('F2'); await settle();
  ok((await bar()).pop, 'F2 opens it');
  await page.keyboard.press('F2'); await settle();
  ok(!(await bar()).pop, 'F2 closes it');
  await page.keyboard.press('F2'); await settle();
  await page.mouse.click(700, 300); await settle();
  ok(!(await bar()).pop, 'a click on the drawing closes it');

  console.log('\n== one line');
  await page.click('[data-cmd-more] > summary'); await settle(120);
  ok(await page.isVisible('[data-cmd-opt="one"]') && await page.isVisible('[data-cmd-opt="float"]') && !(await page.isVisible('[data-cmd-opt="dock"]')), 'the … menu offers one line and float (not dock)');
  await page.click('[data-cmd-opt="one"]'); await settle();
  b = await bar();
  ok(b.lines === 'one' && b.histH <= 1, 'one line: the history is hidden', JSON.stringify({ l: b.lines, h: b.histH }));
  ok(b.live === 'polite' && b.items > 0, 'it is still the live region with its lines (screen readers hear it)');
  ok(b.focusInput, 'the focus goes back to the command line');
  const one = await stageH();
  ok(one > std0 + 40, 'the drawing gets the room', `${one} vs ${std0}`);
  ok(b.h <= 42, 'the line is thin', b.h);
  await page.evaluate(() => window.cadcraft.host.print('Peek test line'));
  await settle(100);
  ok(await page.evaluate(() => { const p = document.querySelector('[data-cmd-peek]'); return !p.hidden && p.textContent.includes('Peek test line') && p.getAttribute('aria-hidden') === 'true'; }), 'a new message peeks above the line (hidden from screen readers: the live region says it)');
  await shot('3-one-line');
  await page.keyboard.press('F2'); await settle();
  b = await bar();
  ok(b.pop && b.histH > 200, 'F2 still opens the whole history');
  ok(await page.evaluate(() => document.querySelector('[data-cmd-peek]').hidden), 'the peek goes when the history opens');
  await page.keyboard.press('Escape'); await settle();
  ok(Math.abs((await stageH()) - one) <= 1, 'closing it gives the drawing its room back');
  ok((await stored())?.lines === 0, 'one line is stored in cc-app-settings:cadcraft', JSON.stringify(await stored()));

  console.log('\n== the height handle');
  await page.focus('[data-cmd-size]');
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowUp');
  await settle();
  b = await bar();
  ok(b.state.lines === 3 && b.lines === 'n', 'Up × 3 → three lines', JSON.stringify(b.state));
  ok(b.histH >= 50 && b.histH <= 60, 'three lines tall', b.histH);
  ok(await page.evaluate(() => document.querySelector('[data-cmd-size]').getAttribute('aria-valuetext')) === '3 lines', 'the separator says "3 lines"');
  await page.keyboard.press('End'); await settle();
  ok((await bar()).state.lines === 12, 'End → twelve');
  await page.keyboard.press('Home'); await settle();
  ok((await bar()).state.lines === 0, 'Home → one line');
  const sz = await page.locator('[data-cmd-size]').boundingBox();
  await page.mouse.move(sz.x + 300, sz.y + sz.height / 2); await page.mouse.down();
  await page.mouse.move(sz.x + 300, sz.y - 40, { steps: 6 }); await page.mouse.move(sz.x + 300, sz.y - 90, { steps: 6 }); await page.mouse.up(); await settle();
  b = await bar();
  ok(b.state.lines >= 4 && b.state.lines <= 6, 'dragging the top edge up 90 px adds about five lines', b.state.lines);
  await page.dblclick('[data-cmd-size]'); await settle();
  ok((await bar()).state.lines === 0, 'a double-click → one line');
  await page.dblclick('[data-cmd-size]'); await settle();
  ok((await bar()).state.lines === b.state.lines, 'and back', (await bar()).state.lines);

  console.log('\n== floating');
  const docked = await stageH();
  await dragFrom('[data-cmd-grip]', 120, -320);
  b = await bar();
  ok(b.dock === 'float' && b.pos === 'absolute', 'dragging the grip floats it', JSON.stringify({ d: b.dock, p: b.pos }));
  ok(b.inside, 'inside the app window', JSON.stringify(b));
  ok((await stageH()) > docked + 40, 'the drawing gets the command line\'s row', `${await stageH()} vs ${docked}`);
  ok(b.y < 600, 'it went where it was dropped', b.y);
  ok(await page.isVisible('[data-cmd-wsize]'), 'the width handle shows');
  await shot('4-floating');
  const at = { x: b.x, y: b.y };
  await page.focus('[data-cmd-grip]');
  await page.keyboard.press('ArrowLeft'); await page.keyboard.press('ArrowUp'); await settle();
  b = await bar();
  ok(b.x < at.x && b.y < at.y, 'the arrow keys on the grip move it', JSON.stringify({ at, now: { x: b.x, y: b.y } }));
  const w0 = b.w;
  await page.focus('[data-cmd-wsize]'); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await settle();
  ok((await bar()).w > w0 + 40, 'the width handle widens it', `${(await bar()).w} vs ${w0}`);
  await typeCmd('LINE'); await page.keyboard.press('Escape'); await settle(100);
  ok(await page.evaluate(() => document.activeElement === document.querySelector('[data-cmd-input]')), 'typing still goes to the floating line');
  const before = await bar();
  // a shell setting saved after it (app-settings.js save) keeps the cmdline field
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('dialog[open]', { state: 'attached' });
  await page.evaluate(() => { const r = document.querySelector('input[name="tb"][value="icons"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.keyboard.press('Escape'); await settle();
  ok((await stored())?.dock === 'float', 'a shell Settings save keeps it', JSON.stringify(await stored()));
  await page.reload({ waitUntil: 'networkidle' }); await page.waitForFunction(() => !!window.cadcraft?.host?.cmdline); await settle(500);
  b = await bar();
  ok(b.dock === 'float' && Math.abs(b.x - before.x) <= 3 && Math.abs(b.y - before.y) <= 3 && Math.abs(b.w - before.w) <= 3, 'kept after a reload (place, width)', JSON.stringify({ before: [before.x, before.y, before.w], now: [b.x, b.y, b.w] }));
  await page.setViewportSize({ width: 1200, height: 760 }); await settle(400);
  ok((await bar()).inside, 'still inside after the window shrinks');
  await page.setViewportSize({ width: 1440, height: 900 }); await settle(400);
  await page.keyboard.press('F2'); await settle();
  b = await bar();
  ok(b.pop && b.histH > 200, 'the pop-up works while floating', JSON.stringify(b));
  await page.keyboard.press('Escape'); await settle();
  // dock it by dropping it on the status bar
  const st = await page.locator('.cc-status').boundingBox();
  await dragFrom('[data-cmd-grip]', 0, 0, { x: st.x + 400, y: st.y + st.height / 2 });
  b = await bar();
  ok(b.dock === 'bottom' && b.pos === 'relative', 'dropped on the status bar it docks', JSON.stringify({ d: b.dock, p: b.pos }));

  console.log('\n== COMMANDLINE, Settings');
  await typeCmd('COMMANDLINE'); await typeCmd('F');
  ok((await bar()).dock === 'float', 'COMMANDLINE F floats it');
  await typeCmd('CMDLINE'); await typeCmd('D');
  ok((await bar()).dock === 'bottom', 'CMDLINE D docks it');
  await typeCmd('CMDLINE'); await typeCmd('L'); await typeCmd('2');
  ok((await bar()).state.lines === 2, 'CMDLINE L 2 → two lines');
  await typeCmd('CMDLINE'); await typeCmd('H');
  ok((await bar()).pop, 'CMDLINE H opens the history');
  await page.keyboard.press('Escape'); await settle();
  await page.keyboard.press('Control+Comma');
  await page.waitForSelector('dialog[open] input[name="ccCmdDock"]', { state: 'attached' });
  await showSetting(page, 'input[name="ccCmdDock"]');
  await page.waitForSelector('dialog[open] input[name="ccCmdDock"]');
  ok(await page.evaluate(() => document.querySelector('input[name="ccCmdDock"][value="bottom"]').checked && document.querySelector('input[name="ccCmdLines"]').value === '2'), 'Settings shows docked and 2 lines');
  await page.click('input[name="ccCmdDock"][value="float"]'); await settle();
  ok((await bar()).dock === 'float', 'Settings › Floating floats it');
  await page.evaluate(() => { const r = document.querySelector('input[name="ccCmdLines"]'); r.value = '0'; r.dispatchEvent(new Event('input', { bubbles: true })); });
  await settle();
  ok((await bar()).state.lines === 0 && (await page.textContent('[data-cmd-lines-out]')) === 'One line', 'the slider at 0 → one line, and says so');
  await page.click('[data-cmd-std]'); await settle();
  ok((await bar()).state.lines === null, 'Standard height puts it back');
  await page.click('input[name="ccCmdDock"][value="bottom"]'); await settle();
  await showSetting(page, 'input[name="ccTopArea"]');
  const tools0 = await page.evaluate(() => Math.round(document.querySelector('.cc-tools').getBoundingClientRect().height));
  await page.click('input[name="ccTopArea"][value="compact"]'); await settle(400);
  ok(await page.evaluate(() => document.querySelector('[data-cadcraft]').classList.contains('cc-top-compact')), 'Settings › Top area › Compact');
  await page.keyboard.press('Escape'); await settle(300);
  const tools1 = await page.evaluate(() => Math.round(document.querySelector('.cc-tools').getBoundingClientRect().height));
  ok(tools1 < tools0, 'the toolbar is lower', `${tools1} vs ${tools0}`);
  ok(await page.evaluate(() => { const l = document.querySelector('.cc-tool-label'); const s = document.querySelector('.cc-tool > span'); return (!l || !l.getClientRects().length) && s && s.getBoundingClientRect().width <= 1 && s.textContent.trim().length > 0; }), 'no group names, the words under the icons are hidden (still in the button)');
  await shot('5-compact-top');
  await typeCmd('TOPAREA'); await typeCmd('S');
  ok(await page.evaluate(() => window.cadcraft.host.getTopArea()) === 'standard', 'TOPAREA S → standard');

  console.log('\n== Reset the layout');
  await page.evaluate(() => { window.cadcraft.host.cmdline.set({ dock: 'float', lines: 0 }); });
  await settle();
  await page.evaluate(() => window.ccShellLayout.reset()); await settle(400);
  b = await bar();
  ok(b.dock === 'bottom' && b.state.lines === null && (await stored()) === null, 'Reset the layout docks it at the standard height', JSON.stringify(b.state));

  console.log('\n== a workspace layout (Toolbox)');
  await page.evaluate(() => window.ccShellWorkspace.set('toolbox')); await settle(1500);
  ok(await page.evaluate(() => document.body.classList.contains('ws-on')), 'the Toolbox layout is on');
  await dragFrom('[data-cmd-grip]', 80, -300);
  b = await bar();
  ok(b.dock === 'float' && b.inside && b.pos === 'absolute', 'the command line floats in it too', JSON.stringify({ d: b.dock, i: b.inside, p: b.pos }));
  ok(await page.evaluate(() => { const r = document.querySelector('[data-cmd-input]').getBoundingClientRect(); const e = document.elementFromPoint(r.left + 20, r.top + r.height / 2); return !!e && !!e.closest('[data-cmd-bar]'); }), 'and is on top (nothing covers its input)');
  await page.keyboard.press('F2'); await settle();
  ok((await bar()).pop, 'F2 works there');
  await page.keyboard.press('Escape');
  await shot('6-toolbox-float');
  await page.evaluate(() => window.ccShellWorkspace.set('')); await settle(1200);

  console.log('\n== the menu styles');
  for (const style of ['drafting', 'ribbon']) {
    await open(style);
    const bh = () => page.evaluate(() => Math.round(document.querySelector('.cc-tools').getBoundingClientRect().height));
    const h0 = await bh();
    await page.evaluate(() => window.cadcraft.host.setTopArea('compact')); await settle(500);
    const h1 = await bh();
    ok(h1 < h0, `${style}: compact top makes the bars lower`, `${h1} vs ${h0}`);
    await shot(`6-${style}-compact`);
    await page.click('[data-cmd-input]');
    await page.keyboard.press('F2'); await settle();
    ok((await bar()).pop, `${style}: F2 opens the history once (no double toggle)`);
    await page.keyboard.press('F2'); await settle();
    ok(!(await bar()).pop, `${style}: F2 closes it`);
  }

  console.log('\n== the layout-fit prompt (short window)');
  await page.setViewportSize({ width: 1000, height: 440 });
  await open('cadcraft');
  await page.evaluate(() => localStorage.removeItem('cc-fit'));
  await page.evaluate(() => window.ccFit.ask()); await settle(200);
  ok(await page.evaluate(() => /one line/.test(document.querySelector('[data-fit-offer]')?.textContent || '')), 'the offer says the command line can go to one line');
  const tight = await page.evaluate(() => window.ccFit.measure().tight);
  await page.click('[data-fit="yes"]'); await settle(900);
  const lines = await page.evaluate(() => window.cadcraft.host.getCmdLines());
  const tightAfter = await page.evaluate(() => window.ccFit.measure());
  console.log('   tight before:', tight, 'after:', JSON.stringify(tightAfter), 'lines:', lines);
  ok(lines === 0 || !tightAfter.tight, 'Yes: one line when the drawing was still short (else left alone)', String(lines));
  await shot('7-fit-yes');

  console.log('\n== phone (390 x 844)');
  await page.setViewportSize({ width: 390, height: 844 });
  await open('cadcraft');
  await page.evaluate(() => window.cadcraft.host.cmdline.set({ dock: 'float', lines: 5 })); await settle(400);
  b = await bar();
  ok(b.dock === 'bottom' && b.pos !== 'absolute', 'a phone keeps it docked whatever is stored', JSON.stringify({ d: b.dock, p: b.pos, s: b.state }));
  ok(b.histH <= 22, 'and its own one-line history', b.histH);
  ok(await page.evaluate(() => ['[data-cmd-grip]', '[data-cmd-size]', '[data-cmd-more]'].every((s) => !document.querySelector(s).getClientRects().length)), 'no grip, handle or menu on a phone');
  ok(await page.isVisible('[data-cmd-hist]'), 'the history button is there');
  await page.click('[data-cmd-hist]'); await settle();
  b = await bar();
  ok(b.pop && b.histH > 150, 'and opens the history', b.histH);
  ok(await noSideways(), 'no sideways scroll');
  await shot('8-phone-popup');
  await page.click('[data-cmd-hist]'); await settle();
  await page.setViewportSize({ width: 1440, height: 900 }); await settle(600);
  ok((await bar()).dock === 'float', 'back on a wide window the stored float comes back');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { stdio: 'ignore' }); } catch {}
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
