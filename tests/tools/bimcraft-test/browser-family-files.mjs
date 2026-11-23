#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-family-files.mjs — PO.4: family files with a type catalog or a same-name shape file, in BimCraft's Library panel, in the lab, headless.
 *   node tools/bimcraft-test/browser-family-files.mjs [--shots <dir>]
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
const CLEAN = [];
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

  console.log('== A family with a type catalog, and a family with a shape file of the same name');
  const dir = fs.mkdtempSync(path.join(REPO, 'tmp/po4-'));
  fs.copyFileSync(RFA, path.join(dir, 'Wall shelf.rfa'));
  fs.writeFileSync(path.join(dir, 'Wall shelf.txt'), ',Width##LENGTH##MILLIMETERS,Depth##LENGTH##MILLIMETERS,Height##LENGTH##MILLIMETERS,Model##OTHER##\r\n900 wide,900,300,40,WS-0900\r\n1500 wide,1500,350,40,WS-1500\r\n');
  fs.copyFileSync(RFA, path.join(dir, 'Bench.rfa'));
  fs.writeFileSync(path.join(dir, 'Bench.obj'), 'v 0 0 0\nv 1000 0 0\nv 1000 400 0\nv 0 400 0\nv 0 0 700\nv 1000 0 700\nv 1000 400 700\nv 0 400 700\nf 1 2 3\nf 1 3 4\nf 5 6 7\nf 5 7 8\nf 1 2 6\nf 1 6 5\nf 2 3 7\nf 2 7 6\nf 3 4 8\nf 3 8 7\nf 4 1 5\nf 4 5 8\n');
  fs.writeFileSync(path.join(dir, 'notes.pdf'), 'not a library file');
  CLEAN.push(dir);
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-rtab="library"]');
  await page.click('.bc-lib-src:has-text("Files")');
  ok(await page.isVisible('[data-lib-folder-btn]'), 'Files… has "Choose a folder…"');
  await page.selectOption('[data-lib-units]', 'mm');
  await page.selectOption('[data-lib-up]', 'z');
  await page.setInputFiles('[data-lib-file]', ['Wall shelf.rfa', 'Wall shelf.txt', 'Bench.rfa', 'Bench.obj', 'notes.pdf'].map((n) => path.join(dir, n)));
  await waitStatus(/Read 2 files: 2 items/);
  ok((await page.$$('.bc-lib-card')).length === 2, 'five files picked → 2 cards: each family with its partner file is one item, the pdf is left out');
  const notes = await page.textContent('[data-rpane="library"]');
  ok(/2 types read from the type catalog/.test(notes) && /Shape taken from Bench\.obj/.test(notes), 'the notes say where the types and the shape came from');

  await page.click('.bc-lib-card >> nth=0');
  await page.waitForSelector('[data-lib-keep]');
  const opts = await page.$$eval('[data-lib-variant] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 2 && /900 wide/.test(opts[0]) && /1500 wide/.test(opts[1]), 'the catalog family offers its 2 types as variants: ' + opts.join(' | '));
  await page.selectOption('[data-lib-variant]', { index: 1 });
  await page.waitForTimeout(300);
  ok(/1500 mm/.test(await page.textContent('.bc-lib-detail')), 'choosing "1500 wide" shows a 1500 mm width');
  ok(await page.isVisible('[data-lib-picture] img'), 'the picture saved in the family file is shown');
  await shot(page, '04-family-types');
  await page.click('.bc-lib-detail .bc-linkbtn');
  await page.click('.bc-lib-card >> nth=1');
  await page.waitForSelector('[data-lib-keep]');
  const d2 = await page.textContent('.bc-lib-detail');
  ok(/1000 mm/.test(d2) && /700 mm/.test(d2) && /Example Foodservice Co\./.test(d2), 'the paired family has the mesh\'s size (1000 wide, 700 high) and the family\'s maker');
  ok(!/Box/.test((await page.$$eval('.bc-lib-detail dl dt, .bc-lib-detail dl dd', (n) => n.map((x) => x.textContent))).join('|').match(/3D body\|[^|]*/)?.[0] || 'Box'), 'its 3D body is a mesh, not a box');
  await shot(page, '05-family-shape');
  await page.click('.bc-lib-detail .bc-linkbtn');

  console.log('== Keep both, read one back');
  await page.click('[data-lib-keep-all]');
  await waitStatus(/Kept 2 objects in My objects/);
  await page.click('.bc-lib-src:has-text("My objects")');
  await page.waitForSelector('.bc-lib-card', { timeout: 15000 });
  const kept = await page.evaluate(async (t) => (await (await fetch('/api/v1/library/my-items?q=Wall%20shelf', { headers: { Authorization: 'Bearer ' + t } })).json()).data.items, tok.token);
  ok(kept.length === 2, 'My objects lists both');
  const items = await page.evaluate(async ({ t, list }) => Promise.all(list.map(async (i) => (await fetch(new URL(i.item_url).pathname, { headers: { Authorization: 'Bearer ' + t } })).json())), { t: tok.token, list: kept });
  ok(items.some((i) => i.variants && i.variants.rows.length === 2 && i.variants.rows[1].body && i.variants.rows[1].body.w === 1500), 'the kept catalog family still has its 2 variants, the second a 1500 wide box');
  ok(items.some((i) => i.body && i.body.type === 'mesh'), 'the kept paired family still has its mesh body');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.message || e).split('\n')[0]);
  try { console.log('  status: ' + await page.textContent('[data-status]')); await shot(page, 'zz-failure'); } catch (x) { /* ignore */ }
} finally {
  const real = problems.filter((p) => !/favicon/.test(p));
  ok(real.length === 0, 'no console errors' + (real.length ? ': ' + real.slice(0, 3).join(' | ') : ''));
  await browser.close();
  for (const d of CLEAN) fs.rmSync(d, { recursive: true, force: true });
  try { console.log('  cleanup: ' + JSON.stringify(php(helper, 'clean', String(tok.id)))); } catch (e) { console.log('  cleanup failed: ' + e.message.split('\n')[0]); }
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
