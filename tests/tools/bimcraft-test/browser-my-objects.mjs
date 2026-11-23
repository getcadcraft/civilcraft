#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-my-objects.mjs — PO.1 "My objects" in BimCraft's Library panel, in the lab, headless.
 *   node tools/bimcraft-test/browser-my-objects.mjs [--shots <dir>]
 * Run as root. Signs in with the MarkupCraft test admin, hands the panel a one-hour Library token, reads a real family file
 * (fixtures/folder/Cad/Families/Wall shelf.rfa) in Files…, keeps it in My objects, finds it there as Private, opens it (fetched
 * back from the server), checks another signed-out browser gets 404 for it, removes it. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const RFA = path.join(REPO, 'fixtures/folder/Cad/Families/Wall shelf.rfa');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const php = (...a) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', ...a], { encoding: 'utf8' }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/markupcraft-test/admin.php');
const helper = path.join(REPO, 'tools/bimcraft-test/my-objects-helper.php');
const admin = php(adminPhp, 'up');
const tok = php(helper, 'token');

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript((t) => { try { if (location.pathname.startsWith('/lab/')) sessionStorage.setItem('bimcraft.library.token', JSON.stringify({ token: t, expires_at: null })); } catch { /* another origin */ } }, tok.token);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('dialog', (d) => d.accept());
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);

  console.log('== My objects');
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-rtab="library"]');
  ok(await page.isVisible('.bc-lib-src:has-text("My objects")'), 'the Library tab has a My objects source');
  await page.click('.bc-lib-src:has-text("My objects")');
  await page.waitForSelector('[data-lib-mine-intro]');
  ok(/Only you can see them/.test(await page.textContent('[data-lib-mine-intro]')), 'signed in: it says only you can see them');
  await page.waitForFunction(() => !/Loading/.test(document.querySelector('[data-rpane="library"]')?.textContent || ''), null, { timeout: 15000 });
  ok(!(await page.$('.bc-lib-card:has-text("Wall shelf")')), 'no Wall shelf kept yet');

  console.log('== Read a family file and keep it');
  await page.click('.bc-lib-src:has-text("Files")');
  await page.setInputFiles('[data-lib-file]', RFA);
  await waitStatus(/Read Wall shelf\.rfa: 1 item/);
  ok((await page.$$('.bc-lib-card')).length === 1, 'Files…: Wall shelf.rfa read in the browser → 1 card');
  ok(await page.isVisible('[data-lib-keep-all]'), 'Files… offers "Keep all in my objects"');
  await page.click('.bc-lib-card:has-text("Wall shelf")');
  await page.waitForSelector('[data-lib-keep]');
  ok(/Geometry not read from this family/.test(await page.textContent('.bc-lib-detail')), 'the detail says the family\'s geometry was not read (a box stands in)');
  await shot(page, '01-file-detail');
  await page.click('[data-lib-keep]');
  await waitStatus(/Kept 1 object in My objects/);
  ok(/Kept in my objects/.test(await page.textContent('[data-lib-keep]')) && await page.isDisabled('[data-lib-keep]'), 'the button now reads "Kept in my objects"');

  console.log('== Find it in My objects');
  await page.click('.bc-lib-detail .bc-linkbtn');   // Back: the detail view hides the source buttons
  await page.click('.bc-lib-src:has-text("My objects")');
  await page.waitForSelector('.bc-lib-card:has-text("Wall shelf")', { timeout: 15000 });
  ok(await page.isVisible('.bc-lib-card:has-text("Wall shelf") [data-lib-private]'), 'its card carries the Private badge');
  await shot(page, '02-my-objects');
  await page.click('.bc-lib-card:has-text("Wall shelf")');
  await page.waitForSelector('[data-lib-unkeep]', { timeout: 15000 });
  const detail = await page.textContent('.bc-lib-detail');
  ok(/Example Foodservice Co\./.test(detail) && /WS-1448/.test(detail), 'opened from the server: maker and model from the family are there');
  ok(/Private \(only you\)/.test(detail), 'its license line reads "Private (only you)"');
  await shot(page, '03-my-object-detail');

  console.log('== Nobody else');
  const mine = await page.evaluate(async (t) => (await (await fetch('/api/v1/library/my-items?q=Wall%20shelf', { headers: { Authorization: 'Bearer ' + t } })).json()).data.items, tok.token);
  ok(mine.length === 1 && mine[0].visibility === 'private', 'the API lists it to its owner as private');
  const anon = await browser.newContext();
  const ap = await anon.newPage();
  const codes = [];
  for (const u of ['/api/v1/library/items/' + mine[0].uuid, new URL(mine[0].item_url).pathname, new URL(mine[0].preview_url).pathname, '/library/item/' + mine[0].slug, '/api/v1/library/my-items']) codes.push((await ap.request.get(BASE + u)).status());
  ok(codes.join(',') === '404,404,404,404,401', 'a signed-out browser gets 404 for the item, its file, its preview and its page (and 401 for the list): ' + codes.join(','));
  const found = await (await ap.request.get(BASE + '/api/v1/library/items?q=Wall%20shelf&per=100')).json();
  ok(!found.data.items.some((i) => i.uuid === mine[0].uuid), 'it is not in the public item search');
  await anon.close();

  console.log('== Remove');
  await page.click('[data-lib-unkeep]');
  await waitStatus(/removed from My objects/);
  await page.waitForFunction(() => !document.querySelector('.bc-lib-card'), null, { timeout: 15000 }).catch(() => {});
  ok(!(await page.$('.bc-lib-card:has-text("Wall shelf")')), 'removed: My objects no longer lists it');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.message || e).split('\n')[0]);
  try { console.log('  status: ' + await page.textContent('[data-status]')); await shot(page, 'zz-failure'); } catch (x) { /* ignore */ }
} finally {
  const real = problems.filter((p) => !/favicon/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  try { console.log('  cleanup: ' + JSON.stringify(php(helper, 'clean', String(tok.id)))); } catch (e) { console.log('  cleanup failed: ' + e.message.split('\n')[0]); }
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
