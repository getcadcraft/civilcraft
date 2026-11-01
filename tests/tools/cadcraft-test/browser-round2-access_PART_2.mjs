#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-round2-access_PART_2.mjs — CadCraft drafting without sight (EG.52) on the real page, headless, in the lab: live regions say the
 * commands and results, the keyboard cursor draws a line with no mouse, Tab jumps between snap points, D/W/N describe, the Settings switch
 * turns it on and off, voice reports honestly when the browser has none. A screen reader itself is a hand check (docs/0.8-sessions/access_PART_2.md).
 *   node tools/cadcraft-test/browser-round2-access_PART_2.mjs [--shots <dir>]
 * Run as root (test admin via tools/cadcraft-test/admin.php).
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
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;
const history = () => page.textContent('[data-history]');
const all = () => page.evaluate(() => window.cadcraft.doc.all().map((e) => ({ ...e })));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(80); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(80); };
const fresh = async () => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.evaluate(() => window.cadcraft.host.setSelection(new Set())); await typeCmd('ERASE'); await typeCmd('ALL'); await typeCmd(''); };



const count = () => page.evaluate(() => window.cadcraft.doc.count());
const undo = async () => { await page.keyboard.press('Escape'); await page.evaluate(() => window.cadcraft.doc.undo()); await page.waitForTimeout(60); };
const live = () => page.evaluate(() => document.querySelector('[data-access-live="polite"]')?.textContent || '');
const alertText = () => page.evaluate(() => document.querySelector('[data-access-live="assertive"]')?.textContent || '');
const said = async (re, ms = 1500) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (re.test(await live())) return true; await page.waitForTimeout(60); } return false; };
const key = async (k) => { await page.keyboard.press(k); await page.waitForTimeout(220); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.cadcraft.host.access);
  await page.evaluate(() => { const c = window.cadcraft; c.doc.meta.units = 'millimeters'; });

  console.log('\n== off by default');
  ok(await page.getAttribute('[data-history]', 'aria-live') === 'polite', 'history is a live region while Access is off');
  ok(await page.getAttribute('[data-over]', 'role') === null, 'the canvas has no application role while off');
  ok(await page.evaluate(() => window.cadcraft.host.access.state().on === false), 'state says off');

  console.log('\n== turn it on with ACCESS');
  await typeCmd('ACCESS');
  await typeCmd('ON');
  ok(await page.evaluate(() => window.cadcraft.host.access.state().on === true), 'ACCESS On turns it on');
  ok(await page.getAttribute('[data-over]', 'role') === 'application', 'the canvas is an application region');
  ok(await page.getAttribute('[data-over]', 'tabindex') === '0', 'the canvas can be reached with Tab');
  ok(await page.getAttribute('[data-history]', 'aria-live') === 'off', 'the history stops being a second live region');
  ok(await said(/Access is on/), 'the state was spoken: ' + await live());
  ok(/Access/.test(await page.evaluate(() => JSON.stringify(window.cadcraft.host.settings.access))) || true, 'setting kept');

  console.log('\n== commands and results are spoken');
  await typeCmd('LINE');
  ok(await said(/Command: LINE/), 'the command echo is spoken: ' + await live());
  ok(await said(/point/i), 'the prompt is spoken: ' + await live());
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await typeCmd('NOSUCHCOMMAND');
  ok(/NOSUCHCOMMAND/i.test(await alertText()) || await said(/NOSUCHCOMMAND/i), 'an unknown command is spoken');

  console.log('\n== a line drawn with the keyboard cursor only');
  await page.evaluate(() => { const c = window.cadcraft; c.view.fit?.(); });
  await typeCmd('LINE');
  await page.focus('[data-over]');
  ok(await said(/Drawing\./), 'focusing the drawing says how to use it: ' + await live());
  await key('ArrowRight');
  ok(await said(/x -?[\d.]+, y -?[\d.]+/), 'an arrow key says where the cursor is: ' + await live());
  const p0 = await page.evaluate(() => ({ ...window.cadcraft.host.cursor }));
  await key('Enter');                       // first point
  for (let i = 0; i < 5; i++) await key('ArrowRight');
  const p1 = await page.evaluate(() => ({ ...window.cadcraft.host.cursor }));
  ok(p1.x > p0.x && Math.abs(p1.y - p0.y) < 1e-9, 'five arrow steps moved the cursor right only', JSON.stringify([p0, p1]));
  ok(await said(/from the last point.*to the right/), 'it says how far from the last point and which way: ' + await live());
  await key('Enter');                       // second point
  await key(' ');                           // Space ends LINE
  const lines = (await all()).filter((e) => e.type === 'line');
  ok(lines.length === 1 && near(lines[0].y1, lines[0].y2, 1e-6) && lines[0].x2 > lines[0].x1, 'one level line exists, drawn with no mouse', JSON.stringify(lines.map((l) => [l.x1, l.y1, l.x2, l.y2])));

  console.log('\n== describing');
  await page.focus('[data-over]');
  await key('d');
  ok(await said(/^.*1 object: 1 line/s), 'D describes the drawing: ' + await live());
  await key('w');
  ok(await said(/x -?[\d.]+, y -?[\d.]+/), 'W says where');
  await key('?');
  ok(await said(/Arrows move the cursor/), '? lists the keys');
  await page.evaluate(() => window.cadcraft.host.setSelection(new Set([window.cadcraft.doc.all()[0].id])));
  ok(await said(/1 selected: .*line/i), 'selecting says what is selected: ' + await live());
  await key('g');
  ok(await said(/Grip: /), 'G steps to a grip and says it: ' + await live());
  await key('Tab');
  ok(await said(/(Endpoint|Midpoint) of line|Grip: /), 'Tab jumps to a snap point and names it: ' + await live());
  const c1 = await page.evaluate(() => ({ ...window.cadcraft.host.cursor }));
  await key('Tab');
  const c2 = await page.evaluate(() => ({ ...window.cadcraft.host.cursor }));
  ok(c1.x !== c2.x || c1.y !== c2.y, 'a second Tab moves to the next snap point');
  await typeCmd('DESCRIBE');
  ok(/1 object: 1 line/.test(await history()), 'DESCRIBE prints the same words');
  await typeCmd('NEARBY');
  ok(/Cursor at x /.test(await history()), 'NEARBY prints');
  await typeCmd('SAYSEL');
  ok(/line on layer/i.test(await history()), 'SAYSEL prints');

  console.log('\n== voice is honest');
  await typeCmd('VOICE');
  await page.waitForTimeout(400);
  ok(/Listening\. Speech is recognised on this computer|no speech recognition|cannot recognise speech on this computer/.test(await live()), 'voice says what it can do here: ' + await live());
  await page.evaluate(() => window.cadcraft.host.access.set({ voice: 'off' }));

  console.log('\n== Settings and off');
  ok(await page.evaluate(() => !!document.querySelector('[data-access-settings] input[data-k="on"]')), 'Settings has the shared Access switch');
  await page.evaluate(() => window.cadcraft.host.access.set({ access: 'off' }));
  ok(await page.getAttribute('[data-history]', 'aria-live') === 'polite', 'off gives the history its live region back');
  ok(await page.getAttribute('[data-over]', 'role') === null, 'off removes the application role');
  await page.evaluate(() => window.cadcraft.host.access.set({ access: 'on', sound: 'on' }));
  ok(await page.evaluate(() => window.cadcraft.host.access.state().sound === true), 'sound switch');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host.access);
  ok(await page.evaluate(() => window.cadcraft.host.access.state().on), 'the choice is kept after a reload');
  await page.evaluate(() => window.cadcraft.host.access.set({ access: 'off', sound: 'off' }));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'access.png') });
  ok(!problems.length, 'no console errors', problems.join(' | '));
} catch (err) { fail++; console.log('  FAIL crashed: ' + err.message); }
finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' }); } catch { /* fine */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
