#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — USD in the apps, headless Chromium at /lab (0.7 XF.2 / XF.8 / XF.9, session `usd`). Run as root (a session
 * minted for the shared test admin through tools/cadcraft-test/admin.php).
 *
 *   node tools/usd/browser.mjs [--out <dir>]
 *
 * ModelCraft: the showcase house, Save as › Text (.usda) and Package (.usdz) downloaded; each opened again (Open) gives the
 * same model; the Export menu has USD; the USD modules load only when used. BimCraft: the showcase house IFC, USD on the
 * toolbar › Package → the download read back by cc-usd (every element with its GlobalId). DetailCraft: Sample, Output › USD ›
 * Binary → read back (every part). CivilCraft, CadCraft, PartCraft, TakeoffCraft: the USD entry is on the page and the app's
 * adapter module loads in the browser. Fails on any console error. Screenshots in --out (default tmp/shots/usd).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/usd')));
const DL = path.join(REPO, 'tmp/usd-browser');
fs.mkdirSync(OUT, { recursive: true }); fs.rmSync(DL, { recursive: true, force: true }); fs.mkdirSync(DL, { recursive: true });
const U = await import(path.join(REPO, 'lib/usd/index.js'));

let pass = 0, fail = 0;
const ok = (c, m, d) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const req = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'));
const { chromium } = req('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'usd'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const newPage = async (url) => {
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(url + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(url + ' pageerror: ' + e.message));
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  return page;
};
const download = async (page, fn, name) => {
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), fn()]);
  const f = path.join(DL, name || d.suggestedFilename());
  await d.saveAs(f);
  return f;
};
const loaded = (page, re) => page.evaluate((src) => performance.getEntriesByType('resource').some((r) => new RegExp(src).test(r.name)), re.source);

try {
  // ---------------------------------------------------------------- ModelCraft
  console.log('\n== ModelCraft: Save as USD, open it again');
  {
    const page = await newPage('/lab/modelcraft?space=paper');
    const house = path.join(REPO, 'fixtures/showcase/modelcraft-house.modelcraft');
    await page.setInputFiles('[data-file-open]', house);
    await page.waitForFunction(() => /house/.test(window.modelcraft.ui.msg.textContent), null, { timeout: 60000 });
    ok(!(await loaded(page, /\/usd\//)), 'the USD library is not loaded before it is used');
    const want = await page.evaluate(() => JSON.stringify(window.modelcraft.model.toJSON()));
    ok(await page.isVisible('.mc-tools [data-act="saveas"]'), 'Save as is on the toolbar');
    for (const [key, ext] of [['usda', 'usda'], ['usdz', 'usdz']]) {
      await page.click('.mc-tools [data-act="saveas"]');
      await page.waitForSelector('dialog.mc-dialog button[data-key="' + key + '"]');
      if (key === 'usda') await page.screenshot({ path: path.join(OUT, '01-modelcraft-save-as.png'), timeout: 180000 });
      const f = await download(page, () => page.click('dialog.mc-dialog button[data-key="' + key + '"]'));
      ok(f.endsWith('.' + ext) && U.sniffUsd(fs.readFileSync(f)) === ext, `Save as › ${ext}: ${path.basename(f)} downloaded`);
      // open it again in a fresh page (Open replaces the model)
      const p2 = await newPage('/lab/modelcraft?space=paper');
      await p2.setInputFiles('[data-file-open]', f);
      await p2.waitForFunction((n) => window.modelcraft.ui.msg.textContent.includes(n), path.basename(f), { timeout: 60000 });
      const got = await p2.evaluate(() => JSON.stringify(window.modelcraft.model.toJSON()));
      ok(got === want, `the .${ext} opens as the same model`);
      if (key === 'usdz') await p2.screenshot({ path: path.join(OUT, '02-modelcraft-reopened-usdz.png'), timeout: 180000 });
      await p2.close();
    }
    await page.click('.mc-tools [data-export-menu] summary');
    ok(await page.isVisible('[data-export="usd"]'), 'Export › USD is in the menu');
    await page.close();
  }

  // ---------------------------------------------------------------- BimCraft
  console.log('\n== BimCraft: Export › USD');
  {
    const page = await newPage('/lab/bimcraft?space=paper');
    await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc'));
    await page.waitForFunction(() => /^Opened /.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 });
    await page.click('[data-usd-export]');
    await page.waitForSelector('dialog.bc-dialog [data-usd-usdz]');
    await page.screenshot({ path: path.join(OUT, '03-bimcraft-usd.png'), timeout: 180000 });
    const f = await download(page, () => page.click('dialog.bc-dialog [data-usd-usdz]'));
    const st = U.openStage(f, { read: (n) => (n === f ? fs.readFileSync(f) : null) });
    const els = [...st.walk()].filter((p) => p.meta.get('kind')?.v === 'component' && p.props.has('ifc:globalId'));
    const status = await page.textContent('[data-status]');
    ok(els.length > 10 && new RegExp(String(els.length)).test(status), `the package holds ${els.length} elements, as the status bar says ("${status.trim()}")`);
    await page.close();
  }

  // ---------------------------------------------------------------- DetailCraft
  console.log('\n== DetailCraft: Output › USD');
  {
    const page = await newPage('/lab/detailcraft?space=paper');
    await page.click('.dc-tool-row > [data-act="sample"]');
    await page.waitForTimeout(500);
    await page.click('.dc-tool-row > [data-act="usd"]');
    await page.waitForSelector('dialog.dc-dialog button[data-key="usdc"]');
    const f = await download(page, () => page.click('dialog.dc-dialog button[data-key="usdc"]'));
    const st = U.openStage(f, { read: () => fs.readFileSync(f) });
    const parts = [...st.walk()].filter((p) => p.meta.get('kind')?.v === 'subcomponent');
    ok(parts.length > 5 && parts.every((p) => p.children.some((c) => c.typeName === 'Mesh')), `the .usdc holds ${parts.length} parts, each with its solid`);
    await page.close();
  }

  // ---------------------------------------------------------------- the others: the entry is there, the module loads
  console.log('\n== CivilCraft, CadCraft, PartCraft, TakeoffCraft: the USD entry and its module');
  for (const [app, sel, mod] of [['civilcraft', null, 'usd-civilcraft.js'], ['cadcraft', null, 'usd-cadcraft.js'], ['partcraft', '[data-cmd="export-usd"]', 'usd-partcraft.js'], ['takeoffcraft', '[data-3d-usd]', 'usd-takeoffcraft.js']]) {
    const page = await newPage('/lab/' + app + '?space=paper');
    if (sel) ok((await page.locator(sel).count()) > 0, app + ': the USD entry is on the page');
    const r = await page.evaluate(async (m) => { const base = [...document.querySelectorAll('script[type="importmap"]')].map((s) => JSON.parse(s.textContent)).map((j) => Object.values(j.imports || {}).find((u) => /\/dev\/[^/]+\.js/.test(u))).find(Boolean); const url = base.replace(/[^/]+\.js(\?.*)?$/, m); try { const x = await import(url); return Object.keys(x).join(','); } catch (e) { return 'ERR ' + e.message; } }, mod);
    ok(!/^ERR/.test(r) && r.length > 0, `${app}: ${mod} loads in the browser (${r})`);
    await page.close();
  }
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'down', 'usd'], { encoding: 'utf8' });
}
ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 4).join(' | ') : ''));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
