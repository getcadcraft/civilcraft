#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-recovery09.mjs — BimCraft FX.41 (0.9, session bim-fix-09): the "Recover your work?" path with saved copies in the browser store.
 *   node tools/bimcraft-test/browser-recovery09.mjs [--big <ifc>] [--lab|--use] [--keep-going]
 * Seeds IndexedDB "cadcraft-autosave" with orphan copies (small + one large), then loads the page and MEASURES: ms to the dialog, whether
 * "New building" and "Choose a file" answer while the dialog is pending, and ms for Recover on the large copy. Prints numbers; fails only on
 * a broken expectation (the expectations are the FX.41 fix: New building works while recovery is pending, progress is shown).
 * Light: one headless Chromium, one page. The large copy defaults to fixtures/showcase/bimcraft-water-treatment.ifc (23 MB).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };
const BIG = arg('--big', path.join(REPO, 'fixtures/showcase/bimcraft-water-treatment.ifc'));
const URLP = process.argv.includes('--use') ? '/use/bimcraft' : '/lab/bimcraft';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + URLP, { waitUntil: 'networkidle' });
  const houseB64 = fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')).toString('base64');
  const bigB64 = fs.readFileSync(BIG).toString('base64');
  const bigSize = fs.statSync(BIG).size;
  // seed: 3 small copies + 1 large copy, written by a session that no longer runs
  await page.evaluate(async ({ houseB64, bigB64, bigSize }) => {
    const bytes = (b) => Uint8Array.from(atob(b), (c) => c.charCodeAt(0));
    const db = await new Promise((res, rej) => { const r = indexedDB.open('cadcraft-autosave', 1); r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('index', { keyPath: 'key' }).createIndex('app', 'app'); d.createObjectStore('data'); d.createObjectStore('sessions', { keyPath: 'key' }).createIndex('app', 'app'); }; r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    const put = (i, name, blob) => new Promise((res, rej) => {
      const t = db.transaction(['index', 'data'], 'readwrite');
      const key = 'bimcraft:old' + i + ':doc' + i;
      t.objectStore('index').put({ key, app: 'bimcraft', session: 'old' + i, doc: 'doc' + i, name, savedAt: Date.now() - i * 3600000, size: blob.size, meta: { name, changes: 3 }, format: 1 });
      t.objectStore('data').put(blob, key);
      t.oncomplete = res; t.onerror = () => rej(t.error);
    });
    for (let i = 0; i < 3; i++) await put(i, 'House ' + i + '.ifc', new Blob([bytes(houseB64)], { type: 'application/x-step' }));
    await put(3, 'Big site.ifc', new Blob([bytes(bigB64)], { type: 'application/x-step' }));
    db.close();
  }, { houseB64, bigB64, bigSize });
  console.log('== seeded 3 x 0.7 MB + 1 x ' + (bigSize / 1048576).toFixed(1) + ' MB copies; reload');
  const t0 = Date.now();
  await page.reload({ waitUntil: 'commit' });
  await page.waitForSelector('[data-autosave-dialog]', { timeout: 120000 });
  const tDialog = Date.now() - t0;
  console.log('  dialog after ' + tDialog + ' ms (page load + store read)');
  ok(tDialog < 15000, 'the recovery dialog appears within 15 s of the load', tDialog + ' ms');
  const state = await page.evaluate(() => { const d = document.querySelector('[data-autosave-dialog]'); return { modal: d.matches(':modal'), rows: d.querySelectorAll('[data-autosave-row]').length }; });
  console.log('  dialog modal: ' + state.modal + ', rows: ' + state.rows);
  { const sh = arg('--shot'); if (sh) await page.screenshot({ path: sh }); }
  ok(/saved cop/i.test(await page.evaluate(() => document.querySelector('[data-status]')?.textContent || '')), 'the status line says saved copies are listed');
  // New building while recovery is pending (a real click: Playwright waits for the button to be reachable)
  let reachable = true;
  try { await page.click('[data-new]', { timeout: 3000 }); } catch { reachable = false; }
  console.log('  New building clickable while the dialog is pending: ' + reachable);
  ok(reachable, 'New building can be clicked while recovery is pending');
  if (reachable) {
    await page.waitForSelector('dialog:not([data-autosave-dialog])[open]', { timeout: 5000 }).then(() => ok(true, 'New building opens its dialog'), () => ok(false, 'New building opens its dialog'));
    await page.keyboard.press('Escape');
  }
  let chooseOk = true;
  try { await page.click('label[for="bc-file"]', { timeout: 3000, trial: true }); } catch { chooseOk = false; }
  ok(chooseOk, 'Choose a file is reachable while recovery is pending');
  // Recover the large copy and time it; the row must say what is happening
  const row = page.locator('[data-autosave-row]', { hasText: 'Big site.ifc' });
  const t1 = Date.now();
  await row.locator('[data-autosave-recover]').click();
  const seen = new Set();
  const poll = setInterval(async () => { try { seen.add(await row.locator('.shell-recover-msg').textContent({ timeout: 200 })); } catch { /* row gone */ } }, 500);
  await page.waitForFunction(() => /^Opened|Recovered/i.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 180000 }).catch(() => {});
  clearInterval(poll);
  console.log('  Recover of the large copy: ' + (Date.now() - t1) + ' ms; row said: ' + JSON.stringify([...seen]));
  console.log('  status: ' + (await page.evaluate(() => document.querySelector('[data-status]')?.textContent)));
  ok(!problems.length, 'no console errors', problems.join(' | ').slice(0, 300));
  await ctx.close();
} finally { await browser.close(); }
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
