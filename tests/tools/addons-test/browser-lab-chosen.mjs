#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lab-chosen.mjs — the lab lists only the add-ons the account chose (owner 2026-11-22: "unbundle them -- they should only be listed
 * when the account has them selected -- there should be a link to the library"), headless, in /lab/cadcraft:
 *   1. signed out, the lab build's addons/index.json is empty ({chosen: true});
 *   2. an account with nothing added: no add-ons load, Settings › Add-ons shows "Nothing added…" and a Browse the Library link to /library/addons?app=cad;
 *   3. after adding Electrical and Apparel (Apparel is "off by default" in its manifest) to the account: exactly those two load, both on,
 *      labelled "Added from the Library"; removed again at the end;
 *   4. test fixture accounts without the cookie still get every lab copy (the other add-on suites rely on it).
 *
 *   node tools/addons-test/browser-lab-chosen.mjs      (run as root; test admin cctest+cadcraft@projectz.xyz, cookie cc_lab_addons=chosen)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const EMAIL = 'cctest+cadcraft@projectz.xyz';
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };
const php = (code) => execFileSync('sudo', ['-u', 'www-data', 'php', '-r', `require ${JSON.stringify(REPO + '/public_html/core/bootstrap.php')}; $u = Auth::byEmail(${JSON.stringify(EMAIL)}); ${code}`], { encoding: 'utf8' });
const setList = (ids) => php(`foreach (array_keys(AccountAddons::listFor($u)) as $i) AccountAddons::remove($u, $i); foreach (${JSON.stringify(ids)} as $i) { $r = AccountAddons::add($u, $i); if (!$r['ok']) echo 'add ' . $i . ': ' . $r['message'] . "\\n"; }`);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const before = JSON.parse(php('echo json_encode(array_keys(AccountAddons::listFor($u)));'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
const INDEX = BASE + '/assets/apps/cadcraft/dev/addons/index.json';

try {
  // 1. signed out
  const anon = await browser.newContext();
  const r0 = await (await anon.request.get(INDEX)).json();
  ok(Array.isArray(r0.addons) && r0.addons.length === 0 && r0.chosen === true, 'signed out: the lab build lists no add-ons', JSON.stringify(r0));
  await anon.close();

  const open = async (cookies) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
    await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }, ...cookies]);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'load' });
    await page.waitForFunction(() => window.cadcraft && window.ccAddons && document.querySelector('.shell-sec-nav'), null, { timeout: 60000 });
    await page.waitForTimeout(1500);
    return { ctx, page };
  };
  const chosen = [{ name: 'cc_lab_addons', value: 'chosen', domain: 'getcadcraft.com', path: '/', secure: true }];
  const loaded = (page) => page.evaluate(() => window.ccAddons.list().map((a) => ({ id: a.id, state: a.state })));

  // 2. nothing added
  setList([]);
  let { ctx, page } = await open(chosen);
  ok((await loaded(page)).length === 0, 'nothing added: no add-on loads', JSON.stringify(await loaded(page)));
  await page.keyboard.press('Control+Comma'); await page.waitForTimeout(300);
  await page.click('[data-settings-tab="general"]'); await page.waitForTimeout(300);
  const empty = await page.evaluate(() => {
    const set = document.querySelector('[data-addons-set]'), a = set && set.querySelector('a[href^="/library/addons"]');
    return { shown: !!set && !set.hidden, none: !!set && !set.querySelector('[data-addons-none]').hidden, href: a && a.getAttribute('href'), text: a && a.textContent.trim(),
      inNav: [...document.querySelectorAll('.shell-sec-nav button')].some((b) => b.textContent.trim() === 'Add-ons') };
  });
  ok(empty.shown && empty.inNav, 'Settings › Add-ons is still there with nothing added', JSON.stringify(empty));
  ok(empty.none, 'it says nothing is added yet');
  ok(empty.href === '/library/addons?app=cad' && empty.text === 'Browse the Library', 'with a Browse the Library link to CadCraft\'s add-ons', JSON.stringify(empty));
  await ctx.close();

  // 3. Electrical + Apparel added
  const err = setList(['electrical', 'apparel']);
  ok(err.trim() === '', 'Electrical and Apparel added to the account', err);
  ({ ctx, page } = await open(chosen));
  const l = await loaded(page);
  ok(l.map((a) => a.id).sort().join(',') === 'apparel,electrical', 'exactly the two chosen add-ons load', JSON.stringify(l));
  ok(l.every((a) => a.state === 'active'), 'both on, Apparel too (off by default in its manifest)', JSON.stringify(l));
  const label = await page.evaluate(() => [...document.querySelectorAll('[data-addons-list] > li .shell-addon-meta')].map((m) => m.textContent));
  ok(label.length === 2 && label.every((t) => t.includes('Added from the Library') && !t.includes('Comes with the app')), 'listed as "Added from the Library"', JSON.stringify(label));
  ok(await page.evaluate(() => document.querySelector('[data-addons-none]').hidden), 'no "nothing added" line');
  await ctx.close();

  // 4. a fixture account without the cookie: every lab copy, as before
  ({ ctx, page } = await open([]));
  const all = await loaded(page);
  ok(all.length > 20, `test accounts without the cookie still get every lab copy (${all.length})`);
  await ctx.close();
} finally {
  setList(before);
  await browser.close();
}
ok(problems.length === 0, 'no page errors', problems.join(' / '));
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
