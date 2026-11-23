#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-settings-groups.mjs — Settings › CadCraft as the owner asked on 2026-11-22, in the lab, headless:
 *   1. no "Version" section in the left list; the version (" – Browser|Desktop|Mobile" after it, no "Running in" row) sits at the right of the tab row, other versions behind
 *      a small disclosure;
 *   2. the CadCraft tab's sections are sorted under eyebrow groups (Keys and commands, Pointer and cursor, Selecting, Editing,
 *      Screen and toolbars, Help while you draw, Files), "Menus, keys and mouse" first under Keys and commands;
 *   3. every section still opens when picked; the Global tab keeps its own groups.
 *
 *   node tools/cadcraft-test/browser-settings-groups.mjs [--shots <dir>]      (run as root; test admin cctest+cadcraft@projectz.xyz)
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
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'load' });
await page.waitForFunction(() => window.cadcraft && document.querySelector('.shell-sec-nav'), null, { timeout: 60000 });
await page.evaluate(() => { const d = document.querySelector('[data-app-settings]'); if (!d.open) d.showModal(); });
await page.click('[data-settings-tab="app"]');
await page.waitForTimeout(400);

const nav = () => page.evaluate(() => [...document.querySelector('.shell-sec-nav').children].map((n) => n.tagName === 'P' ? '# ' + n.textContent.trim() : [...n.querySelectorAll('button')].map((b) => b.textContent.trim())).flat());
const list = await nav();
console.log(list.join('\n'));
ok(!list.includes('Version'), 'no Version section in the list');
const eyebrows = list.filter((x) => x.startsWith('# ')).map((x) => x.slice(2));
const want = ['Keys and commands', 'Pointer and cursor', 'Selecting', 'Editing', 'Screen and toolbars', 'Help while you draw', 'Files'];
ok(want.every((w, i) => eyebrows[i] === w), 'the CadCraft groups in order', eyebrows.join(' | '));
ok(list[1] === 'Menus, keys and mouse', '"Menus, keys and mouse" first under Keys and commands', list[1]);
ok(!eyebrows.includes('Other'), 'nothing left in an "Other" group', eyebrows.join(' | '));

const ver = await page.evaluate(() => {
  const v = document.querySelector('.shell-tabrow [data-version-set]');
  if (!v) return null;
  const tr = document.querySelector('.shell-tabs').getBoundingClientRect(), vr = v.getBoundingClientRect();
  return { text: v.querySelector('.shell-version').textContent.replace(/\s+/g, ' ').trim(), right: vr.left > tr.left + 150, sameRow: vr.top < tr.bottom && vr.bottom > tr.top, more: !!v.querySelector('details.shell-ver-more') };
});
ok(ver && /Version CadCraft .* – Browser$/.test(ver.text) && !/Running in/.test(ver.text), 'the version line ends "– Browser", no Running in row', ver && ver.text);
ok(ver && ver.right && ver.sameRow, 'at the right of the tabs, on the same row', JSON.stringify(ver));
await shot('settings-cadcraft');
if (ver && ver.more) {
  await page.click('.shell-ver-more summary');
  const shown = await page.evaluate(() => { const u = document.querySelector('.shell-ver-pop'); const r = u.getBoundingClientRect(); return r.height > 0 && u.querySelectorAll('a').length; });
  ok(shown > 0, 'Other versions opens a list of links', String(shown));
  await shot('settings-other-versions');
  await page.click('.shell-ver-more summary');
}

// every section opens when picked
const n = await page.evaluate(() => document.querySelectorAll('.shell-sec-nav button').length);
let opened = 0;
for (let i = 0; i < n; i++) {
  const r = await page.evaluate((i) => { const b = document.querySelectorAll('.shell-sec-nav button')[i]; b.click(); const fs = b.ccSet; return !fs.classList.contains('shell-sec-off') && fs.getBoundingClientRect().height > 0; }, i);
  if (r) opened++;
}
ok(opened === n, `every section opens when picked (${opened}/${n})`);

await page.click('[data-settings-tab="general"]');
await page.waitForTimeout(300);
const g = (await nav()).filter((x) => x.startsWith('# '));
ok(g.length >= 3 && !(await nav()).includes('Version'), 'Global keeps its groups, no Version section', g.join(' | '));
ok(await page.evaluate(() => !!document.querySelector('.shell-tabrow [data-version-set]')), 'the version strip stays on the Global tab');
await shot('settings-global');

// Icons > Outline (owner 2026-11-22): no colour of your own = the app's colour (the eyebrows' colour), not a fixed blue
const ic = await page.evaluate(async () => {
  if (!window.ccShellIcons || !document.querySelector('[data-icons-color]')) return null;
  const hex = (c) => { const x = document.createElement('canvas').getContext('2d'); x.fillStyle = c; return String(x.fillStyle).toLowerCase(); };
  const before = localStorage.getItem('cc-icons');
  const eb = getComputedStyle(document.querySelector('.shell-sec-eyebrow')).color;
  window.ccShellIcons.set({ style: 'outline', color: '' });
  const stored = JSON.parse(localStorage.getItem('cc-icons') || '{}');
  const probe = document.createElement('span'); probe.style.color = 'var(--ic-line)'; document.body.appendChild(probe);
  const line = getComputedStyle(probe).color;
  const swatch = document.querySelector('[data-icons-color]').value;
  window.ccShellIcons.set({ color: '#00aa00' });
  const picked = getComputedStyle(probe).color;
  document.querySelector('[data-icons-reset]').click();
  const back = getComputedStyle(probe).color;
  probe.remove();
  if (before === null) localStorage.removeItem('cc-icons'); else localStorage.setItem('cc-icons', before);
  return { eb: hex(eb), line: hex(line), swatch, stored: 'color' in stored, picked: hex(picked), back: hex(back) };
});
if (ic) {
  ok(ic.line === ic.eb, 'outline icons with no colour picked are the app colour (same as the eyebrows)', JSON.stringify(ic));
  ok(ic.swatch === ic.eb, 'the colour swatch shows the app colour', ic.swatch + ' vs ' + ic.eb);
  ok(!ic.stored, 'choosing Outline stores no colour (every app keeps its own)');
  ok(ic.picked === '#00aa00' && ic.back === ic.eb, 'a picked colour wins; "Use the app colour" goes back', JSON.stringify(ic));
  ok(await page.evaluate(() => document.querySelector('[data-icons-reset]').textContent.trim()) === 'Use the app colour', 'the button says "Use the app colour"');
} else console.log('  (Icons section not in this build: SHELL_ICON_THEME off)');

// Inside Studio: a stand-in for the desktop bridge (info().platform as the Rust shell reports it)
for (const [plat, want] of [['windows', 'Desktop'], ['android', 'Mobile']]) {
  const p2 = await ctx.newPage();
  p2.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await p2.addInitScript((plat) => { Object.defineProperty(window, 'cadcraftDesktop', { value: Object.freeze({ info: async () => ({ platform: plat }) }), enumerable: true }); }, plat);
  await p2.goto(BASE + '/lab/cadcraft', { waitUntil: 'load' });
  await p2.waitForFunction(() => window.cadcraft && document.querySelector('[data-version-where]'), null, { timeout: 60000 });
  await p2.waitForTimeout(500);
  const t = await p2.evaluate(() => document.querySelector('[data-version-where]').textContent.trim());
  ok(t === '– ' + want, `with the bridge on ${plat} it reads "– ${want}"`, t);
  await p2.close();
}
ok(problems.length === 0, 'no page errors', problems.join(' / '));
await browser.close();
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
