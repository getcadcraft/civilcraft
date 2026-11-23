#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fit-area.mjs — "Limited drawing area" (assets/js/app-fit.js, owner 2026-11-21) in CadCraft's lab build:
 *   - an ordinary window and layout: no warning
 *   - a layout that leaves the drawing under 20 % of the window (Toolbox at 900 × 650: panels and bars around it): the warning, with the share,
 *     the encouragement to switch, Change interface style / Change sizes and panels, and Yes, more room
 *   - Change interface style opens Settings at Interface style; Change sizes and panels at Sizes and panels
 *   - Yes, more room: the drawing gets a bigger share of the window
 *
 *   node tools/shell-test/browser-fit-area.mjs [--shots <dir>]      (run as root; the shell's test admin)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots'); const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const [cn, cv] = minted.cookie.split('=');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const errors = [];
async function open(layout, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await ctx.addInitScript((l) => { try { localStorage.setItem('cc-tours', 'off'); localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cc-fit'); localStorage.removeItem('cc-fit-room'); if (l) localStorage.setItem('cc-workspace', l); else localStorage.removeItem('cc-workspace'); } catch (e) { /* none */ } }, layout);
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`${BASE}/lab/cadcraft`, { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.ccFit, null, { timeout: 20000 });
  return { ctx, page };
}
const dialog = (page) => page.evaluate(() => {
  const d = document.querySelector('dialog.shell-fit[open]'); if (!d) return null;
  const vis = (el) => el && !el.closest('[hidden]') && el.getBoundingClientRect().width > 0;
  return { title: d.querySelector('h2')?.textContent, why: d.querySelector('[data-fit-why]')?.textContent, sw: d.querySelector('[data-fit-switch]')?.textContent, offer: d.querySelector('[data-fit-offer]')?.textContent,
    buttons: [...d.querySelectorAll('[data-fit]')].filter(vis).map((b) => b.textContent) };
});
const click = (page, a) => page.evaluate((x) => document.querySelector(`dialog.shell-fit [data-fit="${x}"]`).click(), a);
const inView = (page, sel) => page.evaluate((s) => { const d = document.querySelector('dialog[open]:not(.shell-fit)'); const f = d?.querySelector(s); if (!f) return null; const r = f.getBoundingClientRect(), b = d.getBoundingClientRect(); return { open: !!d, visible: r.height > 0 && !f.closest('[hidden]') && r.top < b.bottom && r.bottom > b.top }; }, sel);

try {
  console.log('== an ordinary window and layout');
  {
    const { ctx, page } = await open(null, 1440, 900);
    await page.waitForTimeout(3500);
    const m = await page.evaluate(() => window.ccFit.measure());
    ok(!(await dialog(page)) && m.why === '', `CadCraft's default layout at 1440 × 900 (drawing ${Math.round(m.area * 100)}% of the window): no warning`, JSON.stringify(m));
    await ctx.close();
  }

  console.log('\n== the Toolbox layout at 900 × 650: the drawing is a small part of the window');
  {
    const { ctx, page } = await open('toolbox', 900, 650);
    await page.waitForFunction(() => !!document.querySelector('dialog.shell-fit[open]'), null, { timeout: 15000 }).catch(() => {});
    const m = await page.evaluate(() => window.ccFit.measure());
    const d = await dialog(page);
    ok(d && m.why === 'area', `the warning opens (drawing ${Math.round(m.area * 100)}% of the window)`, JSON.stringify({ m, d }));
    if (d) {
      ok(d.title === 'Limited drawing area', 'titled "Limited drawing area"', d.title);
      ok(new RegExp('only ' + Math.max(1, Math.round(m.area * 100)) + '% of this window').test(d.why), 'it says how much of the window the drawing has: ' + d.why);
      ok(/different interface style/.test(d.sw), 'it encourages switching: ' + d.sw);
      ok(d.buttons.includes('Change interface style') && d.buttons.includes('Change sizes and panels') && d.buttons.includes('Yes, more room') && d.buttons.includes('No, not now') && d.buttons.includes("Don't ask again"), 'buttons: ' + d.buttons.join(' | '));
      ok(!/shell\.fit/.test(JSON.stringify(d)), 'no bare keys');
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'fit-area-warning.png') });
      await click(page, 'style'); await page.waitForTimeout(400);
      const s = await inView(page, '[data-layout-set]');
      ok(!(await dialog(page)) && s?.open && s.visible, 'Change interface style: the warning closes and Settings opens at Interface style', JSON.stringify(s));
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'fit-area-style.png') });
    }
    await ctx.close();
  }
  {
    const { ctx, page } = await open('toolbox', 900, 650);
    await page.waitForFunction(() => !!document.querySelector('dialog.shell-fit[open]'), null, { timeout: 15000 }).catch(() => {});
    if (await dialog(page)) {
      await click(page, 'sizes'); await page.waitForTimeout(400);
      const s = await inView(page, '[data-sizes-set]');
      ok(s?.open && s.visible, 'Change sizes and panels: Settings opens at Sizes and panels', JSON.stringify(s));
    } else ok(false, 'the warning opens again in a new tab');
    await ctx.close();
  }
  {
    const { ctx, page } = await open('toolbox', 900, 650);
    await page.waitForFunction(() => !!document.querySelector('dialog.shell-fit[open]'), null, { timeout: 15000 }).catch(() => {});
    if (await dialog(page)) {
      const a0 = (await page.evaluate(() => window.ccFit.measure())).area;
      await click(page, 'yes'); await page.waitForTimeout(1500);
      const a1 = (await page.evaluate(() => window.ccFit.measure())).area;
      ok(!(await dialog(page)) && a1 > a0 + 0.02, `Yes, more room: the drawing goes from ${Math.round(a0 * 100)}% to ${Math.round(a1 * 100)}% of the window`);
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'fit-area-yes.png') });
    } else ok(false, 'the warning opens again in a new tab');
    await ctx.close();
  }
} catch (e) { fail++; console.log('  FAIL threw: ' + (e.stack || e)); }
await browser.close();
ok(errors.length === 0, 'no page errors', errors.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
