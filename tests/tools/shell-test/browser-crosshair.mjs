#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * browser-crosshair.mjs — the full-screen crosshair in every app (0.8 D8.14, assets/js/app-crosshair.js). For each lab app: the switch is in
 * Settings › General, on puts html[data-cc-crosshair], the pointer over the drawing area shows two lines spanning it (CadCraft draws its own
 * and the shell leaves its canvas alone), off hides them, /use (released) has no switch. Screenshots to --shots <dir>.
 *
 *   node tools/shell-test/browser-crosshair.mjs [--apps bimcraft,cadcraft] [--shots <dir>]
 */
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-install.mjs — a field pack installed in two apps' lab builds (0.8 FL.0, session fields_PART_3; assets/js/app-fields.js over the shell's own
 * calc sheets and lessons):
 *   - the release gate: /lab has the Field packs panel, /use has none
 *   - the panel lists the packs that name the app (and not the ones that do not)
 *   - Install: the pack's lesson appears in Lessons, its calc templates are offered
 *   - Insert: a template becomes a working sheet in the open file (the beam's deflection is the hand-worked 5.02 mm)
 *   - the choice survives a reload (restore)
 *   - Remove: lesson and templates go; the sheet already inserted stays
 *
 *   node tools/fields-test/browser-install.mjs [--apps detailcraft,partcraft]
 * Run as root (a session minted for the shell's test admin). One app at a time.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = async (fn, ms = 6000, arg) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn, arg).catch(() => false)) return true; await sleep(80); } return false; };

const ALL = ['cadcraft', 'bimcraft', 'modelcraft', 'markupcraft', 'takeoffcraft', 'civilcraft', 'detailcraft', 'partcraft'];
const apps = (opt('--apps') || ALL.join(',')).split(',');
const shots = opt('--shots');
for (const slug of apps) {
  console.log('== ' + slug);
  ok(curl(BASE + '/lab/' + slug, minted.cookie).includes('data-crosshair-all'), 'lab: Settings has the switch');
  ok(!curl(BASE + '/use/' + slug).includes('data-crosshair-all'), 'use (released): no switch');
  await page.goto(BASE + '/lab/' + slug, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { localStorage.setItem('cc-crosshair', 'on'); localStorage.setItem('cc-tours', 'off'); });
  await page.reload({ waitUntil: 'domcontentloaded' });
  ok(await wait(() => document.documentElement.dataset.ccCrosshair === 'full', 15000), 'on: html[data-cc-crosshair=full]');
  await sleep(6000);
  await page.keyboard.press('Escape');
  if (slug === 'bimcraft') {   // the start screen has no view: a new building opens the plan
    await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new'); await page.click('[data-new-ok]');
    await page.waitForSelector('[data-plan-wrap]:not([hidden])', { timeout: 60000 }); await sleep(1500);
  }
  // a point where a drawing canvas is uncovered (start hints sit over empty views), on the biggest such canvas
  const box = await page.evaluate(() => {
    const cs = [...document.querySelectorAll('canvas')].map((c) => ({ c, r: c.getBoundingClientRect() })).filter((o) => o.r.width >= 200 && o.r.height >= 120).sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height);
    for (const { c, r } of cs) for (let fy = 0.3; fy <= 0.9; fy += 0.1) for (let fx = 0.2; fx <= 0.9; fx += 0.1) {
      const x = r.x + r.width * fx, y = r.y + r.height * fy;
      if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
      const t = document.elementFromPoint(x, y);
      if (t?.tagName === 'CANVAS' && t.getBoundingClientRect().width >= 200) { const q = t.getBoundingClientRect(); return { x: q.x, y: q.y, w: q.width, h: q.height, px: x, py: y, own: !!t.closest('[data-own-crosshair]') }; }
    }
    return null;
  });
  ok(!!box, 'a drawing area', JSON.stringify(box));
  if (!box) continue;
  const px = box.px, py = box.py;
  await page.mouse.move(px - 20, py - 20); await sleep(150); await page.mouse.move(px, py); await sleep(400);
  const L = await page.evaluate(() => [...document.querySelectorAll('.cc-xhair')].map((e) => { const r = e.getBoundingClientRect(); return { show: getComputedStyle(e).display !== 'none', x: r.x, y: r.y, w: r.width, h: r.height }; }));
  if (box.own) ok(!L.some((l) => l.show), 'CadCraft draws its own: the shell lines stay hidden over its view');
  else {
    const h = L[0], v = L[1];
    ok(h?.show && v?.show, 'two lines show over the drawing area');
    ok(h && Math.abs(h.w - box.w) < 3 && Math.abs(h.x - box.x) < 2 && Math.abs(h.y - py) <= 1.5, 'the horizontal line spans the area through the pointer', JSON.stringify({ h, box }));
    ok(v && Math.abs(v.h - box.h) < 3 && Math.abs(v.y - box.y) < 2 && Math.abs(v.x - px) <= 1.5, 'the vertical line spans the area through the pointer', JSON.stringify(v));
  }
  if (shots) await page.screenshot({ path: shots + '/crosshair-' + slug + '.png' });
  await page.evaluate(() => window.ccCrosshair.set(false));
  await page.mouse.move(px + 10, py + 10); await sleep(200);
  ok(await page.evaluate(() => !document.documentElement.dataset.ccCrosshair && ![...document.querySelectorAll('.cc-xhair')].some((e) => getComputedStyle(e).display !== 'none')), 'off: no lines, no mark');
  ok(problems.length === 0, 'no page errors', problems.join(' | '));
  problems = [];
}
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
