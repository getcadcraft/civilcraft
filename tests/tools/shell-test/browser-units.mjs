#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-units.mjs — Settings › General › Units (0.7 UNITS; lib/units/unit-settings.js, filled by the build's copy) in every
 * app open in the lab, and the unit dropdowns that follow it: the five lists render (a switch and a star per unit, in the
 * shell's words), a switch and a star are saved in localStorage cc-units, the dropdowns drop a unit turned off but keep the
 * one in use (ModelCraft's units, CivilCraft's project units, BimCraft's toolbar units, MarkupCraft's Settings unit),
 * Reset puts the lists back, and no console errors.
 *
 *   node tools/shell-test/browser-units.mjs [--apps a,b] [--shots <dir>]
 * Signs in with the MarkupCraft test admin (tools/markupcraft-test/admin.php; disabled again at the end), like
 * bin/test-app-settings.mjs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { showSetting } from './show-setting.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const ai = process.argv.indexOf('--apps');
const APPS = ai > 0 ? process.argv[ai + 1].split(',') : ['cadcraft', 'bimcraft', 'markupcraft', 'takeoffcraft', 'modelcraft', 'civilcraft', 'detailcraft', 'partcraft'];
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
let problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const general = async () => { if (await page.isVisible('[data-settings-tab="general"]')) await page.click('[data-settings-tab="general"]'); };
const options = (sel) => page.$$eval(sel + ' option', (o) => o.map((x) => x.value)).catch(() => null);
// the app's own unit dropdown: [selector, a value to turn off (table id), its value in the app]
const DROPDOWN = { modelcraft: ['[data-units]', 'yd', 'yd'], civilcraft: ['[data-units]', 'm', 'm'], bimcraft: ['[data-model-units]', 'cm', 'cm'], markupcraft: ['[name="mcUnit"]', 'in', 'in'] };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  for (const slug of APPS) {
    console.log(`\n== ${slug}`);
    problems = [];
    await page.goto(`${BASE}/lab/${slug}?space=paper`, { waitUntil: 'networkidle' });
    await page.evaluate(() => { localStorage.removeItem('cc-units'); localStorage.removeItem('bimcraft.model.units'); });
    await page.reload({ waitUntil: 'networkidle' });
    const dd = DROPDOWN[slug];
    const before = dd ? await options(dd[0]) : null;

    await page.keyboard.press('Control+Comma');
    await general();
    await page.waitForSelector('[data-units-set] details[data-units-kind]', { timeout: 10000 }).catch(() => {});
    // Since 0.7 (data-shell-07) the dialog shows one section at a time: pick Units in the list on the left, as a person would.
    await showSetting(page, '[data-units-set]');
    const st = await page.evaluate(() => {
      const box = document.querySelector('[data-units-set]');
      return box && {
        hidden: box.hidden, kinds: [...box.querySelectorAll('details[data-units-kind]')].map((d) => d.dataset.unitsKind),
        rows: box.querySelectorAll('[data-unit-row]').length, stars: box.querySelectorAll('.shell-unit-star').length,
        sum: box.querySelector('summary .shell-units-kname')?.textContent || '', name: box.querySelector('[data-unit-row="usft"] .shell-unit-name')?.textContent || '',
      };
    });
    ok(st && !st.hidden && st.kinds.join() === 'length,area,volume,angle,slope', `Units: five lists (${st && st.kinds.join()})`);
    ok(st && st.rows === 57 && st.stars === 57, `a switch and a star for each of the 57 units (${st && st.rows})`);
    ok(st && st.sum && !st.sum.startsWith('shell.') && st.name && !st.name.startsWith('shell.'), `the shell's words (${st && st.sum}, ${st && st.name})`);

    if (dd) {
      ok(before && before.includes(dd[2]), `${dd[0]} offers ${dd[2]} at first`);
      // pick another value first, so the one turned off is not the one in use
      await page.evaluate(([id]) => { const s = document.querySelector('[data-unit-row="' + id + '"] input[role=switch]'); s.click(); }, [dd[1]]);
      await page.waitForTimeout(300);
      const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-units') || '{}'));
      ok(saved.on && Object.values(saved.on).some((l) => !l.includes(dd[1])), `turning ${dd[1]} off is saved in cc-units`);
      const now = await options(dd[0]);
      const cur = await page.$eval(dd[0], (s) => s.value).catch(() => null);
      ok(now && (cur === dd[2] ? now.includes(dd[2]) : !now.includes(dd[2])), `${dd[0]}: ${dd[2]} ${cur === dd[2] ? 'kept (in use)' : 'left out'} (${now && now.join(' ')})`);
    }
    // a star, then the reset
    await page.click('[data-units-set] [data-unit-row="chain"] .shell-unit-star').catch(async () => { await page.click('[data-units-set] details[data-units-kind="length"] > summary'); await page.click('[data-units-set] [data-unit-row="chain"] .shell-unit-star'); });
    await page.waitForTimeout(200);
    const star = await page.evaluate(() => ({ s: JSON.parse(localStorage.getItem('cc-units') || '{}').star, pressed: document.querySelector('[data-unit-row="chain"] .shell-unit-star')?.getAttribute('aria-pressed') }));
    ok(star.s && star.s.length === 'chain' && star.pressed === 'true', 'a star: saved and shown pressed');
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, slug + '-units.png') });
    await page.click('[data-units-reset]');
    await page.waitForTimeout(200);
    ok(await page.evaluate(() => localStorage.getItem('cc-units') === null), 'Reset the unit lists: nothing saved');
    if (dd) ok(JSON.stringify(await options(dd[0])) === JSON.stringify(before), `${dd[0]}: the full list back after the reset`);
    await page.keyboard.press('Escape');
    ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
  }
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* best effort */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
