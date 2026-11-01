#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-tools.mjs — calc sheets, design reasons, running totals and lessons (round 2, session shell_PART_2; assets/js/app-{calc,reasons,totals,lessons}.js)
 * in an app's dev build, with a stand-in adapter (so it checks the shell, not each app's saving):
 *   - the release gate: /lab has all four, /use has none
 *   - calc: attach, a sheet and rows through the panel, units and a dimension error, an @parameter read, a drive applied (one undo step), persist
 *   - reasons: select an element, write a record that reads a calc row live, persist, the list, the gap in Problems
 *   - totals: sources feed chips; a source with no number is counted, never 0; mount() puts the chips in the app's status bar
 *   - lessons: register, start, mentor hints (never the answer), an event completes a step, a badge
 *
 *   node tools/shell-test/browser-tools.mjs [--apps cadcraft,markupcraft] [--shots <dir>]
 * Run as root (a session minted for the shell's test admin). One app at a time.
 */
/**
 * browser-devices.mjs — the input-device layer (0.8 Track ID; assets/js/app-devices-ui.js, map docs/apps/app-devices.md) in an app's
 * dev build, with a stand-in view (so it checks the shell, not each app's adapter; tools/shell-test/devices-views/<slug>.mjs do those):
 *   - the release gate: /lab has Input devices, /use has none
 *   - defaults change nothing: a trackpad swipe reaches the app
 *   - trackpad scroll → pan / zoom / orbit on the view under the pointer, the app never sees it; pinch → nothing
 *   - a mouse side button → a command (the app's own registry, window.ccInput.run)
 *   - the pen's side button and a two-finger tap → what Input devices says (app-phone.js asks), ccShellPen.set forwards
 *   - a 3D mouse report and a game controller move the view and run their buttons
 *   - Settings › Global › Input devices: the card, Only <App> keeps its own, Every app gives it back, another app follows the shared
 *
 *   node tools/shell-test/browser-devices.mjs [--apps cadcraft,markupcraft]
 * Run as root (a session minted for the shell's test admin, tools/shell-test/admin.php session). One app at a time.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const APPS = (opt('--apps') || 'cadcraft').split(',');
const SHOTS = opt('--shots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

console.log('== the release gate');
for (const slug of APPS) {
  const lab = curl(`${BASE}/lab/${slug}`, minted.cookie);
  ok(['calc', 'reasons', 'totals', 'lessons'].every((k) => lab.includes('id="cc-' + k + '"')), `${slug}: /lab (dev) has calc, reasons, totals and lessons`);
  const use = curl(`${BASE}/use/${slug}`);
  ok(!['calc', 'reasons', 'totals', 'lessons'].some((k) => use.includes('id="cc-' + k + '"')), `${slug}: /use (release) has none of it`);
}

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', hasTouch: true });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));


const wait = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn).catch(() => false)) return true; await sleep(60); } return false; };
for (const slug of APPS) {
  console.log('== ' + slug);
  problems = [];
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'domcontentloaded' });
  const up = await wait(() => !!(window.ccCalc && window.ccReasons && window.ccTotals && window.ccLessons), 20000);
  ok(up, 'all four APIs are there');
  if (!up) continue;
  ok(await page.evaluate(() => ['calc', 'reasons', 'lessons'].every((k) => document.querySelector('.app-bar-' + k) !== null)), 'app-bar buttons for calc, reasons and lessons');
  // an app that mounts the kit with a lesson of its own (MarkupCraft, 0.8 round 3: window.<app>.shellMount) shows the button
  ok(await page.evaluate((s) => document.querySelector('.app-bar-lessons').hidden || !!window[s]?.shellMount, slug), 'the Lessons button stays hidden until a lesson is registered');
  ok(await page.evaluate(() => !window.ccProblems || (window.ccProblems.store.sources().every((x) => (x.id || x.def?.id) !== 'design-reasons') && document.querySelector('[data-problems-open]')?.hidden !== false) || window.ccProblems.store.list().every((p) => !/^design-reasons/.test(p.id))), 'design reasons add nothing to Problems until they have something to say');

  console.log('-- calc');
  const R = await page.evaluate(async () => {
    const store = { Width: 5000, Depth: { value: 300, unit: 'mm' } }; const saved = []; let steps = 0;
    window.__t = { store, saved, steps: () => steps };
    const units = await import('/assets/apps/' + document.documentElement.dataset.ccApp + '/dev/unit-table.js').catch(() => null);
    window.ccCalc.attach({ units, params: { get: (n) => (n in store ? store[n] : null), set: (n, v, u) => { store[n] = u ? { value: v, unit: u } : v; return true; }, list: () => Object.keys(store) },
      step: (l, fn) => { steps++; return fn(); }, persist: (j) => saved.push(j) });
    return { units: !!units };
  }).catch((e) => ({ err: e.message }));
  await page.click('.app-bar-calc');
  ok(await page.locator('#cct-calc').isVisible(), 'the Calc sheets panel opens');
  await page.click('#cct-calc [data-k="addsheet"]');
  await page.click('#cct-calc [data-k="addrow"]');
  const setRow = async (i, name, expr) => {
    const row = page.locator('#cct-calc .cct-r:not(.cct-rh)').nth(i);
    await row.locator('input').nth(0).fill(name); await row.locator('input').nth(0).press('Tab');
    await row.locator('input').nth(1).fill(expr); await row.locator('input').nth(1).press('Tab');
  };
  await setRow(0, 'span', '6 m');
  await page.click('#cct-calc [data-k="addrow"]'); await setRow(1, 'w', '5 kN/m');
  await page.click('#cct-calc [data-k="addrow"]'); await setRow(2, 'M', 'w * span^2 / 8 to kN m');
  const ans = (i) => page.locator('#cct-calc .cct-r:not(.cct-rh)').nth(i).locator('.cct-ans').innerText();
  ok(/22\.5/.test(await ans(2)), 'M = 22.5 kN m through the panel: ' + (await ans(2)));
  await page.click('#cct-calc [data-k="addrow"]'); await setRow(3, 'bad', '3 m + 2 kN');
  ok(/length|force|Cannot add/i.test(await ans(3)), 'a length plus a force shows an error that says so: ' + (await ans(3)).slice(0, 60));
  await page.click('#cct-calc [data-k="addrow"]'); await setRow(4, 'half', '@Width / 2');
  ok(/2500|2\.5/.test(await ans(4)), '@Width reads the parameter: ' + (await ans(4)));
  await page.evaluate(() => { window.ccCalc.calcs.setDrive(window.ccCalc.calcs.sheets()[0].id + '.half', 'Width', ''); });
  await sleep(100);
  ok(await page.locator('#cct-calc .cct-drv').count() === 1, 'the drive shows under its row');
  ok(await wait(() => window.__t.saved.length > 0 && window.__t.saved.at(-1) && window.__t.saved.at(-1).format === 'cadcraft-calcs'), 'persist() was handed the file JSON (and never for a mere touch)');
  const j = await page.evaluate(() => window.ccCalc.save());
  ok(j && j.sheets[0].rows.length === 5, 'save() gives back the sheets');
  if (SHOTS) { fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, slug + '-calc.png') }); }

  console.log('-- reasons');
  await page.evaluate(() => {
    const el = { kind: 'beam', id: 'B3', label: 'Beam B3' }; window.__t.sel = el; window.__t.rsaved = [];
    window.ccReasons.attach({ selection: () => window.__t.sel, onSelection: (f) => { window.__t.selChanged = f; return () => {}; }, select: () => {}, persist: (jj) => window.__t.rsaved.push(jj), step: (l, fn) => fn(),
      expected: () => [el, { kind: 'beam', id: 'B9', label: 'Beam B9' }] });
  });
  await page.click('.app-bar-reasons');
  ok(await page.locator('#cct-reasons').isVisible() && !(await page.locator('#cct-calc').isVisible()), 'Design reasons opens and closes the calc panel (they never stack)');
  const sheetId = await page.evaluate(() => window.ccCalc.calcs.sheets()[0].id);
  await page.fill('#cct-reasons [data-k="decision"]', 'Use the 2-ply header.');
  await page.fill('#cct-reasons [data-k="calc"]', sheetId + '.M');
  await page.click('#cct-reasons [data-k="save"]');
  ok(await page.locator('#cct-reasons .cct-val').innerText().then((t) => /22\.5/.test(t)).catch(() => false), 'the calc row is read live into the reason');
  ok(await wait(() => window.__t.rsaved.at(-1)?.format === 'cadcraft-reasons'), 'persist() got the reasons JSON');
  ok(await page.locator('#cct-reasons [data-reason="beam:B3"]').count() === 1, 'the record is in the list');
  ok(await page.evaluate(() => window.ccReasons.reasons.problems().some((p) => p.code === 'reason.none' && p.about[0].id === 'B9')), 'an expected element with no reason is a note for Problems');
  if (await page.evaluate(() => !!window.ccProblems)) ok(await page.evaluate(() => window.ccProblems.store.list().some((p) => p.code === 'reason.none')), 'and it reached the Problems panel');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-reasons.png') });

  console.log('-- totals');
  const T = await page.evaluate(() => {
    let steel = 1200; window.__t.steel = (v) => { steel = v; window.__t.h.invalidate(); };
    window.__t.h = window.ccTotals.source({ id: 't.steel', measure: 'weight', label: 'Steel', read: () => steel });
    window.ccTotals.source({ id: 't.cost', measure: 'cost', label: 'Takeoff', read: () => null });
    return window.ccTotals.snapshot().map((m) => [m.measure, m.text, m.waiting]);
  });
  ok(T.length === 2 && T.find((m) => m[0] === 'weight')[1] === '1.2 t' && T.find((m) => m[0] === 'cost')[1] === '', 'weight sums; the cost with no number yet has no text: ' + JSON.stringify(T));
  await sleep(300);
  const chips = await page.locator('.cct-totals .cct-chip[data-measure]').allInnerTexts();
  ok(chips.length === 1 && /1\.2 t/.test(chips[0]), 'one chip (the cost waits, nothing shows as 0): ' + JSON.stringify(chips));
  await page.evaluate(() => window.__t.steel(2500)); await sleep(400);
  ok(/2\.5 t/.test((await page.locator('.cct-chip-weight').innerText())), 'invalidate() re-reads');
  await page.evaluate(() => { const bar = document.createElement('div'); bar.id = 'fake-status'; bar.style.cssText = 'position:fixed;left:0;bottom:30px;z-index:3'; document.body.append(bar); window.ccTotals.mount(bar); });
  ok(await page.locator('#fake-status .cct-chip-weight').count() === 1, 'mount() draws the chips inside the app\'s own status bar');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-totals.png') });

  console.log('-- lessons');
  await page.evaluate(() => {
    window.ccLessons.register({ id: 'first-line', title: 'Draw a line', intro: 'Your first line.', steps: [
      { id: 'pick', text: 'Choose the Line tool.', hints: ['Look in the Draw group.', 'It is the first tool.'], done: { event: 'tool', match: { name: 'line' } }, answer: 'Press L' },
      { id: 'look', text: 'Look at the status bar.', done: {} }], badge: { title: 'Line drawer' } });
  });
  ok(await page.evaluate(() => !document.querySelector('.app-bar-lessons').hidden), 'the Lessons button shows once a lesson is registered');
  await page.click('.app-bar-lessons');
  await page.click('#cct-lessons [data-k="start-first-line"]');
  ok(/Choose the Line tool/.test(await page.locator('#cct-lessons .cct-step-t').innerText()), 'the lesson starts on step one');
  ok(await page.locator('#cct-lessons [data-k="hint"]').count() === 0, 'no hint button until mentor mode is on');
  await page.check('#cct-lessons [data-k="mentor"]');
  await page.click('#cct-lessons [data-k="hint"]');
  const hint = await page.locator('#cct-lessons .cct-hint').innerText();
  ok(/Draw group/.test(hint) && !/Press L/.test(await page.locator('#cct-lessons').innerText()), 'a hint is shown and the answer is nowhere on the panel: ' + hint);
  await page.evaluate(() => window.ccLessons.emit('tool', { name: 'arc' }));
  ok(/Choose the Line tool/.test(await page.locator('#cct-lessons .cct-step-t').innerText()), 'the wrong tool does not complete the step');
  await page.evaluate(() => window.ccLessons.emit('tool', { name: 'line' }));
  ok(/status bar/.test(await page.locator('#cct-lessons .cct-step-t').innerText()), 'the right event moves on');
  await page.click('#cct-lessons [data-k="done"]');
  ok(await page.locator('#cct-lessons [data-badge="lesson:first-line"]').count() === 1 && await page.locator('#cct-lessons [data-badge="meta:first"]').count() === 1, 'finishing earns the lesson badge and First lesson');
  ok(!(await page.locator('#cct-lessons [data-badge="meta:clean"]').count()), 'a lesson finished after a hint does not earn No hints needed');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-lessons.png') });

  console.log('-- phone width');
  await page.setViewportSize({ width: 390, height: 780 }); await sleep(200);
  ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no sideways scroll at 390 px');
  ok(await page.evaluate(() => { const b = document.querySelector('.app-bar'); return b.scrollWidth <= b.clientWidth + 1; }), 'the app bar still fits at 390 px (the three buttons moved to More)');
  await page.setViewportSize({ width: 360, height: 780 }); await sleep(150);
  ok(await page.evaluate(() => { const b = document.querySelector('.app-bar'); return b.scrollWidth <= b.clientWidth + 1; }), 'and at 360 px');
  await page.click('.app-bar-more > summary');
  ok(await page.locator('.app-bar-more-tool[data-tool-more="calc"]').isVisible() && await page.locator('.app-bar-more-tool[data-tool-more="lessons"]').isVisible(), 'More lists Calc sheets, Design reasons and Lessons');
  await page.click('.app-bar-more-tool[data-tool-more="calc"]');
  ok(await page.locator('#cct-calc').isVisible() && !(await page.evaluate(() => document.querySelector('.app-bar-more').open)), 'an item in More opens its panel and closes the menu');
  await page.keyboard.press('Escape');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-lessons-390.png') });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.keyboard.press('Escape');
  ok(!problems.length, 'no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
}
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
