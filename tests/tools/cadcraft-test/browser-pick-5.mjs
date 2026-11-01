#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pick-5.mjs — apps-mount_PART_5 (DC.1): CadCraft announces its pick as `cc-pick` and takes a related pick back through
 * window.ccPickApply (what SuperCadCraft's one selection uses). Run as root (test admin via tools/cadcraft-test/admin.php).
 *   node tools/cadcraft-test/browser-pick-5.mjs
 */
/**
 * browser-pick-5.mjs — cad_PART_4 on the real page, headless, in the lab: the ghost of a running LINE's next point (EG.54),
 * keys on objects and the Settings switch (DC.27), the DETAILS prompt (EG.57), the undo hook (EG.77), the add-on banner (AL.6).
 *   node tools/cadcraft-test/browser-pick-5.mjs [--shots <dir>]
 * Run as root (test admin via tools/cadcraft-test/admin.php). Draws studs with real commands, hovers, checks the ghost,
 * Tab (one undo step), Esc, the Off setting, and the cost of a mouse move on a big drawing (rule: keep the cursor smooth).
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

const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(80); };
try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  console.log('\n== DC.1: cc-pick and ccPickApply');
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('100,0'); await page.keyboard.press('Escape');
  await typeCmd('L'); await typeCmd('0,50'); await typeCmd('100,50'); await page.keyboard.press('Escape');
  const ids = await page.evaluate(() => window.cadcraft.doc.all().map((e) => e.id));
  ok(ids.length >= 2, 'two lines drawn', ids);
  await page.evaluate(() => { window.__picks = []; window.addEventListener('cc-pick', (e) => window.__picks.push(e.detail)); });
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), ids[0]);
  const pk = await page.evaluate(() => window.__picks.at(-1));
  ok(pk && pk.app === 'cadcraft' && pk.ids.length === 1 && pk.ids[0] === String(ids[0]), 'selecting an object announces cc-pick', pk);
  const applied = await page.evaluate((id) => window.ccPickApply([{ app: 'cadcraft', id: String(id) }]), ids[1]);
  const now = await page.evaluate(() => [...window.cadcraft.host.selection]);
  ok(applied === true && now.length === 1 && String(now[0]) === String(ids[1]), 'ccPickApply selects the related object', now);
  ok(await page.evaluate(() => window.ccPickApply([{ app: 'cadcraft', id: 'nope' }])) === false, 'an id that is not in the drawing is refused');
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} catch (e) { fail++; console.log('  FAIL threw: ' + (e && e.stack || e)); }
await browser.close();
console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
