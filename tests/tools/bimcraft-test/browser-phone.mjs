#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-phone.mjs — BimCraft on a phone (owner, 2026-10-15: the Studio APK on a Samsung phone, portrait, dark theme).
 * Run as root: signs in with BimCraft's test admin (tools/bimcraft-test/admin.php session|down; no login form, so the
 * admin-login throttle is never touched) and drives the cached Playwright Chromium as a phone (touch, isMobile,
 * deviceScaleFactor 2.625).
 *
 *   node tools/bimcraft-test/browser-phone.mjs [--shots <dir>] [--tag <name>] [--no-checks]
 *
 * The layout is the shell's (assets/js/app-phone.js; was bimcraft/dev/phone-sheets.js until 2026-10-15).
 * Sizes 412 × 892 and 360 × 800, portrait and landscape, paper and model. Each: the start screen (no model) and the
 * generated IFC fixture opened, then the Files and Properties sheets. Checks on the app (`main.bc`; the app bar above it is
 * the shell's): nothing wider than the screen, the start screen fills the space under the app bar and scrolls, its title
 * fits, its three buttons can be reached and are whole on screen; with a model the 3D view keeps most of the screen and
 * the panels open as sheets over it (one at a time, closable). No console errors. Shots: <dir>/<tag>-<w>x<h>-<space>-<state>.png.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from './ifc-fixture.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SHOTS = arg('--shots', path.join(REPO, 'tmp/shots/bimcraft-phone'));
const TAG = arg('--tag', 'after');
const CHECKS = !process.argv.includes('--no-checks');
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (!CHECKS) return; if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/bimcraft-test/admin.php');
const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];

/** Facts about the page, measured in the page. */
const measure = () => {
  const main = document.querySelector('main.bc'), r = main.getBoundingClientRect();
  const vw = document.documentElement.clientWidth, vh = window.innerHeight;
  // what a person can see sticking out (a closed sheet waits off screen, hidden; a toolbar that scrolls sideways is fine)
  const scrollsX = (e) => { for (let p = e.parentElement; p && p !== main; p = p.parentElement) if (/auto|scroll/.test(getComputedStyle(p).overflowX) && p.getBoundingClientRect().right <= vw + 1) return true; return false; };
  const wide = [...main.querySelectorAll('*')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && b.right > vw + 1 && e.checkVisibility({ visibilityProperty: true }) && getComputedStyle(e).position !== 'fixed' && !e.closest('[hidden], canvas') && !scrollsX(e); }).slice(0, 3).map((e) => (e.className || e.tagName) + '@' + Math.round(e.getBoundingClientRect().right));
  const empty = document.querySelector('[data-empty]');
  const shown = (e) => !!e && !e.hidden && e.getClientRects().length > 0;
  const barEl = document.querySelector('[data-phone-bar]'), barTop = barEl && getComputedStyle(barEl).display !== 'none' ? barEl.getBoundingClientRect().top : vh;
  const out = { vw, vh, barTop, mainTop: r.top, mainBottom: r.bottom, mainWidth: r.width, scrollW: document.scrollingElement.scrollWidth, wide, docScroll: document.scrollingElement.scrollHeight > vh + 1 };
  if (shown(empty)) {
    const e = empty.getBoundingClientRect(), h1 = empty.querySelector('h1');
    out.empty = { top: e.top, bottom: e.bottom, height: e.height, scrolls: empty.scrollHeight > empty.clientHeight + 1, overflowY: getComputedStyle(empty).overflowY, h1px: parseFloat(getComputedStyle(h1).fontSize), h1right: h1.getBoundingClientRect().right };
    out.buttons = [...empty.querySelectorAll('.bc-empty-cta button')].map((b) => { b.scrollIntoView({ block: 'nearest' }); const x = b.getBoundingClientRect(); return { top: x.top, bottom: x.bottom, left: x.left, right: x.right, eb: empty.getBoundingClientRect().bottom }; });
    empty.scrollTop = 0;
  }
  const stage = document.querySelector('.bc-stage').getBoundingClientRect();
  out.stage = { top: stage.top, height: stage.height, width: stage.width };
  const sheets = [...document.querySelectorAll('.bc-panel')].map((p) => ({ cls: p.className, sheet: getComputedStyle(p).position === 'fixed' || getComputedStyle(p).position === 'absolute', open: p.classList.contains('shell-sheet-open'), visible: p.getBoundingClientRect().height > 0 && getComputedStyle(p).visibility !== 'hidden' && getComputedStyle(p).display !== 'none' }));
  out.panels = sheets;
  out.sheetBar = !!document.querySelector('[data-phone-bar]') && getComputedStyle(document.querySelector('[data-phone-bar]')).display !== 'none';
  return out;
};

const sizes = [[412, 892], [360, 800]];
for (const [w, h] of sizes) for (const land of [false, true]) for (const space of ['paper', 'model']) {
  const vw = land ? h : w, vh = land ? w : h, key = `${vw}x${vh}-${space}`;
  console.log(`\n== ${key}${land ? ' (landscape)' : ''}`);
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2.625, isMobile: true, hasTouch: true, colorScheme: space === 'model' ? 'dark' : 'light' });
  const [cn, cv] = cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(key + ': ' + m.text()); });
  page.on('pageerror', (e) => problems.push(key + ': ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=' + space, { waitUntil: 'load' });
  await page.waitForSelector('[data-empty]', { timeout: 30000 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, `${TAG}-${key}-start.png`) });
  const m = await page.evaluate(measure);
  if (CHECKS) {
    ok(!m.wide.length, 'start: nothing in the app is wider than the screen', JSON.stringify({ sw: m.scrollW, wide: m.wide }));
    ok(m.empty && m.empty.top <= m.mainTop + 1 && m.empty.bottom >= m.barTop - 2 && m.barTop >= vh - 64, 'start: the start screen fills the space between the app bar and the panel buttons', JSON.stringify(m.empty && { top: m.empty.top, bottom: m.empty.bottom, mainTop: m.mainTop, barTop: m.barTop, vh }));
    ok(m.empty && /auto|scroll/.test(m.empty.overflowY), 'start: the start screen scrolls');
    ok(m.empty && m.empty.h1px <= (vw < 600 ? 32 : 44) && m.empty.h1right <= vw, `start: the title fits (${m.empty && m.empty.h1px}px)`);
    ok(m.buttons && m.buttons.length === 3 && m.buttons.every((b) => b.top >= m.mainTop - 1 && b.bottom <= Math.min(vh, b.eb) + 1 && b.left >= 0 && b.right <= vw + 1), 'start: Open a file, Open a folder and New building are whole on screen (scrolled to)', JSON.stringify(m.buttons));
    ok(!m.docScroll, 'start: the page itself does not scroll (only the start screen does)');
  }
  // a model
  await page.setInputFiles('[data-file]', { name: 'bimcraft-fixture.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc()) });
  await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS, `${TAG}-${key}-model.png`) });
  const m2 = await page.evaluate(measure);
  if (CHECKS) {
    ok(!m2.wide.length, 'model: nothing in the app is wider than the screen', JSON.stringify({ sw: m2.scrollW, wide: m2.wide }));
    ok(m2.stage.height >= (vh - m2.mainTop) * 0.75 && m2.stage.width >= vw - 1, `model: the 3D view keeps the screen (${Math.round(m2.stage.width)} × ${Math.round(m2.stage.height)})`);
    ok(m2.sheetBar, 'model: the Files / Properties buttons are on screen');
    ok(m2.panels.every((p) => p.sheet && !p.open), 'model: both panels are closed sheets until asked for', JSON.stringify(m2.panels));
  }
  for (const which of ['left', 'right']) {
    const btn = page.locator(`[data-phone-bar] [data-phone-sheet="${which}"]`);
    if (!(await btn.count())) continue;
    await btn.tap();
    await page.waitForTimeout(350);
    await page.screenshot({ path: path.join(SHOTS, `${TAG}-${key}-sheet-${which}.png`) });
    const m3 = await page.evaluate(measure);
    if (CHECKS) {
      const p = m3.panels.find((x) => x.cls.includes('bc-' + which));
      ok(p && p.open && p.visible && m3.panels.filter((x) => x.open).length === 1, `model: the ${which === 'left' ? 'Files' : 'Properties'} sheet opens over the view (one at a time)`);
    }
    await page.locator(`.bc-${which} [data-phone-close]`).tap().catch(() => {});
    await page.waitForTimeout(300);
    if (CHECKS) ok(await page.evaluate((x) => !document.querySelector('.bc-' + x).classList.contains('shell-sheet-open'), which), `model: the ${which} sheet closes`);
  }
  await ctx.close();
}
await browser.close();
execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
const unexpected = problems.filter((p) => !/favicon|404/.test(p));
ok(!unexpected.length, 'no console errors', unexpected.slice(0, 3).join(' | '));
console.log(`\nshots in ${SHOTS}`);
if (CHECKS) { console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0); }
