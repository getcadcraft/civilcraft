#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** browser-ge-home.mjs — the home page is /great-eight with its intro, no parameters (owner 2026-11-01). Run as root.
 *  .env GREAT_EIGHT_MOTION_ALWAYS=1: motion is on for everyone (also under reduce-motion); ?motion=off opts out. */
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const { chromium } = await import('playwright-core');
const cd = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cd).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cd, pw, s)).find((p) => fs.existsSync(p));
const b = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
let pass = 0, fail = 0; const ok = (c, m) => { c ? pass++ : fail++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const [cn, cv] = minted.cookie.split('=');
async function visit(label, { reduce, staff, path: p = '/' }) {
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', reducedMotion: reduce ? 'reduce' : 'no-preference', userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/120 Safari/537.36' });
  if (staff) await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  await page.goto('https://getcadcraft.com' + p, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const r = await page.evaluate(() => ({ url: location.pathname + location.search, motion: window.__geMotion, intro: document.documentElement.classList.contains('ge-intro-on') || !!document.getElementById('ge-intro') && !document.getElementById('ge-intro').hidden, anim: document.documentElement.classList.contains('ge-anim') }));
  console.log(`  ${label}: ${JSON.stringify(r)}`); await ctx.close(); return r;
}
console.log('== the home page (nothing in the address)');
let r = await visit('visitor, no setting', {});          ok(r.url === '/great-eight', '/ lands on a clean /great-eight'); ok(r.motion === 'on' && r.intro, 'motion on, the intro plays');
r = await visit('visitor, reduce motion', { reduce: true }); ok(r.url === '/great-eight', 'clean address'); ok(r.motion === 'forced' && r.intro && r.anim, 'motion is on automatically even under reduce-motion (GREAT_EIGHT_MOTION_ALWAYS), the intro plays');
r = await visit('visitor, reduce + ?motion=off', { reduce: true, path: '/great-eight?motion=off' }); ok(r.motion === 'reduced' && !r.intro && !r.anim, '?motion=off still opts out: the still page');
r = await visit('staff, reduce motion', { reduce: true, staff: true }); ok(r.url === '/great-eight' && r.motion === 'forced' && r.intro, 'staff: motion and the intro, clean address');
await b.close(); console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
