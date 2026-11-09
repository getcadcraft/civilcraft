#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-offline.mjs — offline add-ons in a real browser (0.9 OF.1–OF.4; docs/0.9-OFFLINE-ADDONS.md). Run as root.
 *
 *   node tools/addons-test/browser-offline.mjs [--shots dir]
 *
 * 1. Signed in (fixture lab tester, tools/addons-test/offline-fixture.php) on the live site: /account/addons#offline shows the readiness check, Make my
 *    add-ons available offline stores the signed package in the apps' own IndexedDB store and writes the list, the line says "n of m ready · … ·
 *    prepared today" and names what comes inside an app; once that app's offline copy exists it is ready; offline, Check again still answers;
 *    CadCraft's lab build then finds the stored package and its own trust code accepts it; Remove takes it all away.
 * 2. In CadCraft (lab): Settings › Your add-ons › Add from a file, a package dropped onto the window (installed, said on screen), a changed file refused.
 * 3. No account (a child `php -S` with ADDON_LIBRARY_PUBLIC=1, the live .env untouched): Use offline on a listing adds it to this browser's list and
 *    fetches it; the Library's "Your add-ons in this browser" shows it with the same check.
 */
import { execFileSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/addons-offline'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const php = (script, cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', script, cmd], { cwd: ROOT }).toString().trim().split('\n').pop());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const watch = (page, tag) => { page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push(tag + ' console: ' + m.text()); }); page.on('pageerror', (e) => problems.push(tag + ' pageerror: ' + e.message)); };
const idbGet = (page, db, store, key) => page.evaluate(([db, store, key]) => new Promise((res) => { const r = indexedDB.open(db, 1); r.onupgradeneeded = () => r.result.createObjectStore(store, { keyPath: 'id' }); r.onsuccess = () => { const t = r.result.transaction(store, 'readonly').objectStore(store).get(key); t.onsuccess = () => { const v = t.result; r.result.close(); res(v ? { id: v.id, keep: v.keep || null, version: v.manifest && v.manifest.version, signed: !!v.signature } : null); }; t.onerror = () => res(null); }; r.onerror = () => res(null); }), [db, store, key]);
const idbDel = (page, db, store, key) => page.evaluate(([db, store, key]) => new Promise((res) => { const r = indexedDB.open(db, 1); r.onupgradeneeded = () => r.result.createObjectStore(store, { keyPath: 'id' }); r.onsuccess = () => { const tx = r.result.transaction(store, 'readwrite'); tx.objectStore(store).delete(key); tx.oncomplete = () => { r.result.close(); res(true); }; }; }), [db, store, key]);
const swMsg = (page, msg) => page.evaluate((msg) => new Promise(async (res) => { const reg = await navigator.serviceWorker.ready; const ch = new MessageChannel(); ch.port1.onmessage = (e) => { if (e.data && e.data.type === 'progress') return; res(e.data); }; reg.active.postMessage(msg, [ch.port2]); setTimeout(() => res(null), 20000); }), msg);

const FX = php('tools/addons-test/offline-fixture.php', 'up');
let child = null, harness = null;
try {
  // ------------------------------------------------------------------ 1. signed in
  console.log('— signed in: /account/addons#offline');
  const ctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const [cn, cv] = FX.cookie.split('=');
  await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage(); watch(page, 'account');
  await page.goto(BASE + '/account/addons#offline', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-of-account][data-of-ready]', { timeout: 30000 });
  const sec = '[data-of-account]';
  const line0 = await page.textContent(sec + ' [data-of-line]');
  ok(/^0 of \d+ ready · not prepared in this browser$/.test(line0.trim()), 'before: the check reads "0 of n ready · not prepared in this browser"', line0);
  ok(await page.isEnabled(sec + ' [data-of-make]'), 'the button is turned on by the script');
  ok(/open it and choose Save for offline/.test(await page.textContent(sec)), 'it names the apps to save for offline');
  await page.screenshot({ path: path.join(SHOTS, '01-account-before.png'), fullPage: false });
  await page.click(sec + ' [data-of-make]');
  await page.waitForFunction((s) => /^(Done|Some items)/.test(document.querySelector(s + ' [data-of-status]').textContent), sec, { timeout: 90000 });
  const status = await page.textContent(sec + ' [data-of-status]');
  const w = await idbGet(page, 'cadcraft-addons', 'packages', 'windows');
  ok(w && w.keep === 'offline' && w.signed && /^\d+\.\d+\.\d+$/.test(w.version), 'Windows is stored in the apps\' add-on store (signed, keep:offline)', JSON.stringify(w) + ' ' + status);
  const list = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-addons-account:web:list') || 'null'));
  ok(Array.isArray(list) && list.some((i) => i.id === 'windows'), 'the list is written where the apps read their last list');
  const line1 = (await page.textContent(sec + ' [data-of-line]')).trim();
  const m1 = /^(\d+) of (\d+) ready · ([\d.]+ [KMG]B) · prepared today$/.exec(line1);
  ok(!!m1 && +m1[1] >= 1, 'after: "n of m ready · size · prepared today"', line1);
  ok(/Electrical/.test(await page.textContent(sec)) && /comes inside/.test(await page.textContent(sec)), 'what comes inside an app is named, with the app');
  await page.screenshot({ path: path.join(SHOTS, '02-account-prepared.png'), fullPage: false });
  // CadCraft's own offline copy (here a stand-in saved under its key): what comes inside it turns ready
  await swMsg(page, { type: 'save', key: 'try/cadcraft', page: '/favicon.ico', urls: [] });
  await page.click(sec + ' [data-of-check]');
  await page.waitForFunction((s) => /^Checked/.test(document.querySelector(s + ' [data-of-status]').textContent), sec, { timeout: 30000 });
  const line2 = (await page.textContent(sec + ' [data-of-line]')).trim();
  const m2 = /^(\d+) of (\d+)/.exec(line2);
  ok(m2 && +m2[1] > +m1[1], 'once CadCraft is saved for offline, the add-ons inside it count as ready', line1 + ' → ' + line2);
  ok(await page.$(sec + ' [data-of-app="cadcraft"].al-yes') !== null, 'and CadCraft shows as saved for offline');
  // offline: the check still answers from what the browser holds
  await ctx.setOffline(true);
  await page.click(sec + ' [data-of-check]');
  await page.waitForFunction((s) => /^Checked/.test(document.querySelector(s + ' [data-of-status]').textContent), sec, { timeout: 30000 });
  ok((await page.textContent(sec + ' [data-of-line]')).trim() === line2, 'with no connection, Check again gives the same answer');
  await ctx.setOffline(false);
  await page.screenshot({ path: path.join(SHOTS, '03-account-ready.png'), fullPage: false });
  // CadCraft's lab build finds the stored package and its own trust code takes it
  const app = await ctx.newPage(); watch(app, 'cadcraft');
  await app.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await app.waitForFunction(() => window.ccAddons && window.ccAddons.list && window.ccAddons.list().length > 0, null, { timeout: 120000 });
  await app.waitForTimeout(1500);
  const e = await app.evaluate(() => { const x = window.ccAddons.list().find((a) => a.id === 'windows'); return x ? { source: x.source, state: x.state, reason: x.reason || '' } : null; });
  ok(e && e.state !== 'refused', 'CadCraft (lab) loads the stored Windows package; its trust code accepts the signature', JSON.stringify(e));
  // ------------------------------------------------------------------ 2. Add from a file / drop (same app page)
  console.log('— CadCraft: Add from a file, drop a package onto the window');
  await app.waitForFunction(() => typeof window.ccAddonsFromFile === 'function', null, { timeout: 60000 });
  const ver = w.version;
  await idbDel(app, 'cadcraft-addons', 'packages', 'windows');
  const dropped = await app.evaluate(async (ver) => {
    const b = new Uint8Array(await (await fetch('/addons/package/windows/' + ver)).arrayBuffer());
    const dt = new DataTransfer(); dt.items.add(new File([b], 'windows-' + ver + '.ccaddon.json', { type: 'application/json' }));
    const ev = new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true });
    document.body.dispatchEvent(ev);
    await new Promise((r) => setTimeout(r, 2500));
    const n = document.getElementById('cc-addons-file-note');
    return { prevented: ev.defaultPrevented, note: n ? n.textContent : '' };
  }, ver);
  ok(dropped.prevented && /checked and added/.test(dropped.note), 'a package dropped onto the window is checked and added, and the window says so', JSON.stringify(dropped));
  const wf = await idbGet(app, 'cadcraft-addons', 'packages', 'windows');
  ok(wf && wf.keep === 'file', 'it is in the store, marked keep:file');
  const other = await app.evaluate(() => { const dt = new DataTransfer(); dt.items.add(new File(['0'], 'plan.dxf')); const ev = new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }); window.__seen = false; const f = () => { window.__seen = true; }; document.body.addEventListener('drop', f, { once: true }); document.body.dispatchEvent(ev); return window.__seen; });
  ok(other === true, 'a drawing dropped onto the window still goes to the app (only package files are taken)');
  await app.click('[data-settings-open]');
  if (await app.isVisible('[data-settings-tab="general"]')) await app.click('[data-settings-tab="general"]');
  const navBtn = '.shell-sec-nav button:has-text("Your add-ons")';
  await app.waitForSelector(navBtn, { timeout: 10000 }).then(() => app.click(navBtn)).catch(() => {});
  const set = '[data-addons-account-set]';
  await app.waitForSelector(set + ' button:has-text("Add from a file")', { state: 'visible', timeout: 15000 });
  ok(true, 'Settings › Your add-ons has "Add from a file"');
  const bad = path.join(SHOTS, 'tampered.ccaddon.json');
  const good = await app.evaluate(async (ver) => await (await fetch('/addons/package/windows/' + ver)).text(), ver);
  const j = JSON.parse(good); j.files['main.js'] = Buffer ? j.files['main.js'] : j.files['main.js'];
  const filesKey = Object.keys(j.files).find((k) => k.endsWith('.js'));
  j.files[filesKey] = Buffer.from('export function activate(){ /* changed */ }').toString('base64');
  fs.writeFileSync(bad, JSON.stringify(j));
  const [chooser] = await Promise.all([app.waitForEvent('filechooser', { timeout: 10000 }), app.click(set + ' button:has-text("Add from a file")')]);
  await chooser.setFiles(bad);
  await app.waitForFunction((s) => /Not added|checked and added/.test(document.querySelector(s).textContent), set, { timeout: 15000 });
  const said = await app.textContent(set);
  ok(/Not added: its signature did not check/.test(said), 'Add from a file refuses a changed package and says why', said.slice(-200));
  await app.screenshot({ path: path.join(SHOTS, '04-app-add-from-file.png') });
  fs.unlinkSync(bad);
  await idbDel(app, 'cadcraft-addons', 'packages', 'windows');
  await app.close();
  // Remove (back on the account page): put the offline copy back first, then remove it all
  await page.click(sec + ' [data-of-make]');
  await page.waitForFunction((s) => /^(Done|Some items)/.test(document.querySelector(s + ' [data-of-status]').textContent), sec, { timeout: 90000 });
  await page.click(sec + ' [data-of-remove]');
  await page.waitForFunction((s) => /^Removed/.test(document.querySelector(s + ' [data-of-status]').textContent), sec, { timeout: 30000 });
  ok(!(await idbGet(page, 'cadcraft-addons', 'packages', 'windows')) && !(await page.evaluate(() => localStorage.getItem('cc-addons-offline:v1'))) && !(await page.evaluate(() => localStorage.getItem('cc-addons-account:web:list'))), 'Remove takes the stored package, the list and the marker away');
  ok(/not prepared/.test(await page.textContent(sec + ' [data-of-line]')), 'and the check says so');
  await swMsg(page, { type: 'remove', key: 'try/cadcraft' });
  await ctx.close();

  // ------------------------------------------------------------------ 3. no account (child server, Library switch on for it only)
  console.log('— no account: Use offline, Your add-ons in this browser');
  const port = await new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
  harness = path.join(ROOT, 'tmp/offline-browser-harness-' + process.pid + '.php');
  fs.writeFileSync(harness, "<?php\nrequire " + JSON.stringify(path.join(ROOT, 'public_html/core/bootstrap.php')) + ";\n$_ENV['ADDON_LIBRARY_PUBLIC'] = '1';\n");
  fs.chmodSync(harness, 0o644);
  child = spawn('sudo', ['-u', 'www-data', 'php', '-S', '127.0.0.1:' + port, '-t', path.join(ROOT, 'public_html'), '-d', 'auto_prepend_file=' + harness, path.join(ROOT, 'tools/addons-test/offline-router.php')], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { const up = await new Promise((r) => { const c = net.connect(port, '127.0.0.1', () => { c.end(); r(true); }); c.on('error', () => r(false)); }); if (up) break; await new Promise((r) => setTimeout(r, 150)); }
  const C = 'http://127.0.0.1:' + port;
  const vctx = await browser.newContext({ viewport: { width: 1360, height: 900 } });
  const v = await vctx.newPage(); watch(v, 'visitor');
  await v.goto(C + '/library/listing.php?section=addons&id=windows', { waitUntil: 'load', timeout: 120000 });
  await v.waitForFunction(() => !!window.ccOfflineAddons, null, { timeout: 30000 });
  await v.click('[data-of-use="windows"]');
  await v.waitForFunction(() => { const t = (document.querySelector('[data-of-use-status]') || {}).textContent || ''; return /Ready offline|Added/.test(t) && !/Fetching/.test(t); }, null, { timeout: 90000 });
  const vs = await v.textContent('[data-of-use-status]');
  ok(/Ready offline in this browser/.test(vs), 'Use offline on a free listing: added to this browser and fetched now', vs);
  ok((await v.evaluate(() => JSON.parse(localStorage.getItem('cc-addons:local') || '[]'))).includes('windows'), 'it is on this browser\'s list (the one Add to this browser uses)');
  const vw = await idbGet(v, 'cadcraft-addons', 'packages', 'windows');
  ok(vw && vw.keep === 'offline' && vw.signed, 'and the signed package is in the apps\' store');
  await v.screenshot({ path: path.join(SHOTS, '05-visitor-use-offline.png') });
  await v.goto(C + '/library/listing.php?section=addons&id=electrical', { waitUntil: 'load', timeout: 120000 });
  await v.waitForFunction(() => !!window.ccOfflineAddons, null, { timeout: 30000 });
  await v.click('[data-of-use="electrical"]');
  await v.waitForFunction(() => { const t = (document.querySelector('[data-of-use-status]') || {}).textContent || ''; return /Ready offline|Added/.test(t) && !/Fetching/.test(t); }, null, { timeout: 60000 });
  ok(/comes inside CadCraft/.test(await v.textContent('[data-of-use-status]')), 'an add-on inside the app: added, and it says which app to save for offline', await v.textContent('[data-of-use-status]'));
  await v.goto(C + '/library/section.php?section=addons', { waitUntil: 'load', timeout: 120000 });
  await v.waitForSelector('[data-of-browser]:not([hidden])[data-of-ready]', { timeout: 30000 });
  const pl = (await v.textContent('[data-of-browser] [data-of-line]')).trim();
  ok(/^\d+ of \d+ ready · .* · prepared today$/.test(pl) && (await v.textContent('[data-of-browser-count]')) === '2', '"Your add-ons in this browser" lists both with the same check', pl);
  ok(/Windows/.test(await v.textContent('[data-of-browser-list]')), 'with the names, linked to their pages');
  await v.screenshot({ path: path.join(SHOTS, '06-visitor-panel.png'), fullPage: false });
  await v.click('[data-of-browser] [data-of-remove]');
  await v.waitForFunction(() => /^Removed/.test(document.querySelector('[data-of-browser] [data-of-status]').textContent), null, { timeout: 30000 });
  ok(!(await idbGet(v, 'cadcraft-addons', 'packages', 'windows')), 'Remove in the panel takes the stored package away');
  await vctx.close();
} catch (err) {
  fail++; console.log('  FAIL the run stopped: ' + (err && err.stack || err));
} finally {
  if (child) { try { execFileSync('pkill', ['-f', 'auto_prepend_file=' + harness]); } catch { /* gone */ } }
  if (harness) { try { fs.unlinkSync(harness); } catch { /* gone */ } }
  php('tools/addons-test/offline-fixture.php', 'down');
  await browser.close();
}
const real = problems.filter((p) => !/the account add-on list did not start|ERR_INTERNET_DISCONNECTED|net::ERR/.test(p));
ok(real.length === 0, 'no console errors', real.slice(0, 5).join(' | '));
console.log(fail ? `FAILED ${fail} (passed ${pass})` : `passed ${pass}`);
process.exit(fail ? 1 : 0);
