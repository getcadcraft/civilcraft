#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-author.mjs — "your name comes from your account" in MarkupCraft and BimCraft (0.5 SI.9, the apps' part; the
 * shell's host.account() is bin/test-host-account.mjs). In /lab, with the page's #cc-account set by the test (the signed-in
 * member's display name, as app-shell.inc embeds it), or taken out (signed out).
 *
 *   node tools/shell-test/browser-author.mjs [--shots <dir>]      (run as root: tools/shell-test/admin.php session|down)
 *
 * MarkupCraft: signed in → no name dialog, markups carry the account name, Settings says "From your account (<name>)" with
 * "Use another name"; a typed name wins (also after a reload) until "Use my account name"; signed out → the dialog as before;
 * the name stays text (a name with <b> and & shows as typed). BimCraft: signed in → the issue form's name is the account's,
 * Settings shows the same choice; a typed name wins until cleared; signed out → an empty name box, as before.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fixtureIfc } from '../bimcraft-test/ifc-fixture.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const { chromium } = await import('playwright-core');
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots') ? path.resolve(args[args.indexOf('--shots') + 1]) : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
const BASE = 'https://getcadcraft.com';
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
const NAME = 'Ana <b>&</b> Example';

let pass = 0, fail = 0;
const ok = (c, label, detail) => { if (c) { pass++; console.log('  ok   ' + label); } else { fail++; console.log('  FAIL ' + label + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd], { encoding: 'utf8' }).trim().split('\n').pop());

const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const { cookie } = admin('session');
const [cname, cval] = cookie.split('=');
const problems = [];

/** A fresh browser context signed in to /lab; the app page's #cc-account replaced by `account` (null = taken out). */
async function open(slug, account) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  await ctx.addCookies([{ name: cname, value: cval, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.route(new RegExp('^' + BASE + '/lab/' + slug + '(\\?.*)?$'), async (route) => {
    const res = await route.fetch();
    let body = await res.text();
    body = body.replace(/<script type="application\/json" id="cc-account">[^<]*<\/script>\s*/, '');
    if (account) body = body.replace('</body>', `<script type="application/json" id="cc-account">${JSON.stringify(account).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')}</script></body>`);
    await route.fulfill({ response: res, body });
  });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => problems.push(slug + ' pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) problems.push(slug + ' console: ' + m.text()); });
  // #cc-account must be in the page before host.js reads it: it is put at the end of <body>, before the modules run (deferred)
  await page.goto(BASE + '/lab/' + slug + '?space=paper', { waitUntil: 'networkidle' });
  return { ctx, page };
}
const settings = async (page) => {
  await page.keyboard.press('Control+,');
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
};
const closeSettings = (page) => page.keyboard.press('Escape');
const shot = (page, n) => (SHOTS ? page.screenshot({ path: path.join(SHOTS, n + '.png') }) : null);

try {
  console.log('\n== MarkupCraft, signed in');
  {
    const { ctx, page } = await open('markupcraft', { name: NAME, avatar: null });
    await page.waitForFunction(() => window.markupcraft && window.markupcraft.store);
    await page.setInputFiles('[data-file]', PLAN);
    await page.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
    await page.evaluate(() => window.markupcraft.setTool('rect'));
    await page.waitForTimeout(600);
    ok(!(await page.$('#mc-dlg-author')), 'no name dialog when a drawing tool is picked');
    ok(await page.evaluate(() => window.markupcraft.author) === NAME, 'markups carry the account name', await page.evaluate(() => window.markupcraft.author));
    ok(await page.locator('[data-author]').innerText() === NAME && await page.evaluate(() => document.querySelector('[data-author]').children.length === 0), 'the status bar shows it as text (no markup from the name)');
    await settings(page);
    ok(await page.locator('[data-mc-author-from]').innerText() === `From your account (${NAME})`, 'Settings: "From your account (<name>)"', await page.locator('[data-mc-author-from]').innerText());
    ok(await page.isVisible('[data-mc-author-other]') && !(await page.isVisible('[data-mc-author-row]')), 'with "Use another name", the name box out of the way');
    await shot(page, 'mc-settings-account');
    await page.click('[data-mc-author-other]');
    ok(await page.isVisible('[data-mc-author-row]'), '"Use another name" opens the name box');
    await page.fill('[name="mcAuthor"]', 'Bea Typed');
    await page.locator('[name="mcAuthor"]').press('Tab');
    ok(await page.evaluate(() => window.markupcraft.author) === 'Bea Typed', 'a typed name wins');
    ok(await page.isVisible('[data-mc-author-mine]'), 'with "Use my account name" beside it');
    await closeSettings(page);
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.markupcraft && window.markupcraft.store);
    ok(await page.evaluate(() => window.markupcraft.author) === 'Bea Typed', 'the typed name is kept after a reload, signed in or not');
    await settings(page);
    await page.click('[data-mc-author-mine]');
    ok(await page.evaluate(() => window.markupcraft.author) === NAME && await page.evaluate(() => JSON.parse(localStorage.getItem('markupcraft.author') || '""')) === '', '"Use my account name": the account\'s again, the typed one cleared');
    ok(!(await page.isVisible('[data-mc-author-row]')), 'and the name box is put away');
    await ctx.close();
  }

  console.log('\n== MarkupCraft, signed out');
  {
    const { ctx, page } = await open('markupcraft', null);
    await page.waitForFunction(() => window.markupcraft && window.markupcraft.store);
    await page.setInputFiles('[data-file]', PLAN);
    await page.waitForFunction(() => window.markupcraft.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
    page.evaluate(() => window.markupcraft.setTool('rect')).catch(() => {});
    await page.waitForSelector('#mc-dlg-author', { timeout: 5000 }).catch(() => {});
    ok(!!(await page.$('#mc-dlg-author')), 'signed out: the name dialog asks, as before');
    await shot(page, 'mc-signed-out-dialog');
    await page.keyboard.press('Escape');
    await settings(page);
    ok(!(await page.isVisible('[data-mc-author-account]')) && await page.isVisible('[data-mc-author-row]'), 'Settings: just the name box');
    await ctx.close();
  }

  console.log('\n== BimCraft, signed in');
  const ifc = { name: 'author-fixture.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({})) };
  {
    const { ctx, page } = await open('bimcraft', { name: NAME, avatar: null });
    await page.waitForFunction(() => document.querySelector('[data-file]'));
    await settings(page);
    ok(await page.locator('[data-bc-author-from]').innerText() === `From your account (${NAME})` && await page.evaluate(() => document.querySelector('[data-bc-author-from]').children.length === 0), 'Settings: "From your account (<name>)", as text');
    ok(await page.isVisible('[data-bc-author-other]') && !(await page.isVisible('[data-bc-author-row]')), 'with "Use another name"');
    await shot(page, 'bc-settings-account');
    await closeSettings(page);
    await page.setInputFiles('[data-file]', ifc);
    await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
    await page.click('[data-rtab="issues"]');
    await page.click('[data-bcf-new]');
    ok(await page.inputValue('[data-bcf-f-author]') === NAME, 'a new issue: the account name, nothing to type');
    await page.fill('[data-bcf-f-title]', 'Door clashes with the duct');
    await page.click('[data-bcf-form] button[type="submit"]');
    await page.waitForTimeout(300);
    ok((await page.textContent('[data-issues]').catch(() => '') || (await page.evaluate(() => document.body.innerText))).includes(NAME), 'the issue carries it');
    ok(await page.evaluate(() => localStorage.getItem('bimcraft.author')) === null, 'the account\'s name is not kept as a typed one');
    await settings(page);
    await page.click('[data-bc-author-other]');
    await page.fill('[name="bcAuthor"]', 'Bea Typed');
    await page.locator('[name="bcAuthor"]').press('Tab');
    await closeSettings(page);
    await page.click('[data-bcf-new]');
    ok(await page.inputValue('[data-bcf-f-author]') === 'Bea Typed', 'a typed name wins');
    await settings(page);
    await page.click('[data-bc-author-mine]');
    await closeSettings(page);
    await page.click('[data-bcf-new]').catch(() => {});
    ok(await page.inputValue('[data-bcf-f-author]').catch(() => '') === NAME && await page.evaluate(() => localStorage.getItem('bimcraft.author')) === null, '"Use my account name": the account\'s again');
    await ctx.close();
  }

  console.log('\n== BimCraft, signed out');
  {
    const { ctx, page } = await open('bimcraft', null);
    await page.waitForFunction(() => document.querySelector('[data-file]'));
    await page.setInputFiles('[data-file]', ifc);
    await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
    await page.click('[data-rtab="issues"]');
    await page.click('[data-bcf-new]');
    ok(await page.inputValue('[data-bcf-f-author]') === '', 'signed out: an empty name box, as before');
    await settings(page);
    ok(!(await page.isVisible('[data-bc-author-account]')) && await page.isVisible('[data-bc-author-row]'), 'Settings: just the name box');
    await ctx.close();
  }
  ok(!problems.length, 'no page errors', problems.slice(0, 6));
} finally {
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
