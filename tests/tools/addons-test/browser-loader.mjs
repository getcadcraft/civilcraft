#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-loader.mjs — the add-on loader and the account's add-on list in REAL lab apps, against more than the two signed packages, including an update with a
 * second signed version (0.8 AL.4 / AL.5 / AL.8 / AL.11; session al-loader_PART_5). Run as root (a signed-in lab session is minted by tools/addons-test/admin.php).
 *
 *   sudo -u www-data php tools/addons-test/pack-test.php tmp/addons-loader-run cadcraft:pid,cadcraft:electrical,cadcraft:hvac,cadcraft:harness,cadcraft:lighting,bimcraft:plant,bimcraft:sprinkler --lab-api
 *   node tools/addons-test/browser-loader.mjs [--dir tmp/addons-loader-run] [--apps cadcraft,bimcraft] [--shots dir]
 *
 * The real folders of the first-party add-ons are packed (their app-relative imports become engine:/host:) and signed with a THROWAWAY key (never the real one);
 * the page is the real /lab app. Three things are stood in for by request routes, nothing is changed on disk or on the server:
 *   - dev/addons.js        → the canonical loader (public_html/assets/js/addons.js: the apps' copies are synced at the end of the round)
 *   - dev/addons/trust.js  → the same file with the throwaway public key added to TRUSTED_KEYS
 *   - dev/addons/index.json→ the bundled list without the add-ons under test (that is what "unbundled" means), and
 *   - /api/v1/account/addons and /pkg/<id>-<version>.json → the account list and the packages (the server's real list needs the signed Library versions).
 * It checks, per app: the account list syncs with a token; each add-on is fetched, hash-checked, signature-checked and installed in one set; after a reload the loader
 * finds them (source "installed"), links their engine:/host: imports and activates them; a downloaded engine package is the one a add-on gets; Settings › Your add-ons
 * lists them; a corrupted download changes nothing; Check for updates finds the second signed version, "Update all together" installs it and the loader runs it after a
 * reload; Roll back returns the first; no console errors from the loader or the account.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const DIR = path.resolve(ROOT, opt('--dir', 'tmp/addons-loader-run'));
const APPS = opt('--apps', 'cadcraft,bimcraft').split(',');
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/addons-loader'));
fs.mkdirSync(SHOTS, { recursive: true });
const idx = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString().trim().split('\n').pop());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
const LOADER_SRC = fs.readFileSync(path.join(ROOT, 'public_html/assets/js/addons.js'), 'utf8');
const problems = [];

async function runApp(app) {
  console.log('— ' + app);
  const mine = idx.items.filter((i) => i.app === app);
  const tested = new Set(mine.map((i) => i.id));
  const withDemo = app === 'cadcraft';
  const ids = [...mine.map((i) => i.id), ...(withDemo ? ['engine-demo'] : [])];
  let version = 1;            // which signed version the "server" lists
  let corrupt = null;         // id whose download is damaged
  const itemFor = (i) => { const v = version === 2 && i.v2 ? i.v2 : i.v1; return { id: i.id, kind: 'addon', class: 'code', name: i.name, needs: [], source: 'account', pin: 'none', size_bytes: v.size, available: true, how: 'download', why: '', firstParty: true, channel: 'stable',
    package: { url: `/pkg/${i.id}-${v.version}.json`, version: v.version, sha256: v.sha256, size: v.size, permissions: v.permissions } }; };
  const items = () => [
    ...mine.map(itemFor),
    ...(withDemo ? [{ id: 'engine-demo', kind: 'addon', class: 'code', name: 'Engine demo', needs: [{ id: 'engine.demo', range: '^1.0' }], source: 'account', pin: 'none', size_bytes: idx.demo.size, available: true, how: 'download', why: '', firstParty: true, channel: 'stable',
      package: { url: `/pkg/engine-demo-${idx.demo.version}.json`, version: idx.demo.version, sha256: idx.demo.sha256, size: idx.demo.size, permissions: [] } },
    { id: 'engine.demo', kind: 'engine', class: 'code', name: 'Demo engine', needs: [], source: 'needed-by:engine-demo', pin: 'none', size_bytes: idx.engine.size, available: true, how: 'download', why: '', firstParty: true, channel: 'stable',
      package: { url: `/pkg/engine.demo-${idx.engine.version}.json`, version: idx.engine.version, sha256: idx.engine.sha256, size: idx.engine.size, permissions: [] } }] : []),
  ];

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
  await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const reqs = [];
  await ctx.route('**/*', async (route) => {
    const u = new URL(route.request().url());
    if (u.hostname !== 'getcadcraft.com') return route.continue();
    const p = u.pathname, method = route.request().method();
    if (p === `/assets/apps/${app}/dev/addons.js`) return route.fulfill({ status: 200, contentType: 'text/javascript', body: LOADER_SRC });
    if (p === `/assets/apps/${app}/dev/addons/trust.js`) {
      const real = await (await route.fetch()).text();
      return route.fulfill({ status: 200, contentType: 'text/javascript', body: real + `\nTRUSTED_KEYS[${JSON.stringify(idx.key.id)}] = ${JSON.stringify(idx.key.pub)};\n` });
    }
    if (p === `/assets/apps/${app}/dev/addons/index.json`) {
      const real = await (await route.fetch()).json();
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...real, addons: real.addons.filter((n) => !tested.has(n)) }) });
    }
    if (p === '/api/v1/account/addons') {
      reqs.push(method + ' ' + p + ' ' + (route.request().headers().authorization ? 'Bearer' : 'no-auth'));
      if (method === 'GET') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { items: items() } }) });
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: {} }) });
    }
    const m = /^\/pkg\/(.+)\.json$/.exec(p);
    if (m) {
      const f = path.join(DIR, m[1] + '.json');
      if (!fs.existsSync(f)) return route.fulfill({ status: 404, body: '' });
      let body = fs.readFileSync(f);
      if (corrupt && m[1].startsWith(corrupt + '-')) { body = Buffer.from(body); body[body.length - 20] ^= 1; }
      return route.fulfill({ status: 200, contentType: 'application/json', body });
    }
    return route.continue();
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(app + ' console: ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message.slice(0, 300)));
  await page.addInitScript((a) => { try { if (!sessionStorage.getItem('cc-addons-account:' + a + ':token')) sessionStorage.setItem('cc-addons-account:' + a + ':token', 'ccu_' + 't'.repeat(40)); } catch { /* blocked */ } }, app);

  const boot = async () => {
    await page.goto(BASE + '/lab/' + app, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.ccAddons && !!window.ccAddonsAccount, null, { timeout: 120000 });
    await page.waitForFunction(() => window.ccAddons.loader && window.ccAddons.loader.started, null, { timeout: 90000 });
    await page.waitForFunction(() => window.ccAddons.list().every((a) => a.state !== 'ready'), null, { timeout: 90000 });
    await page.waitForTimeout(1500);
  };
  const states = (want) => page.evaluate((w) => Object.fromEntries(window.ccAddons.list().filter((a) => w.includes(a.id)).map((a) => [a.id, { state: a.state, source: a.source, version: a.version, reason: a.reason, detail: String(a.detail || '').slice(0, 160) }])), want);

  await boot();
  ok(await page.evaluate(() => window.ccAddonsAccount.signedIn()), app + ': the tab is signed in (token in sessionStorage)');
  const before = await states(ids);
  ok(Object.keys(before).length === 0, app + ': with the add-ons unbundled and nothing installed, the loader lists none of them', JSON.stringify(before));
  const sync = await page.evaluate(async () => { const r = await window.ccAddonsAccount.sync(); return { ok: r.ok, n: (r.items || []).length }; });
  ok(sync.ok && sync.n === items().length, app + ': sync reads the account list with a Bearer token (' + sync.n + ' items)', JSON.stringify(sync));

  // a damaged download changes nothing (all-or-nothing)
  corrupt = mine[0].id;
  const bad = await page.evaluate(async (ids) => { const r = await window.ccAddonsAccount.ensureMany(ids); return { ok: r.ok, reason: r.reason, id: r.id, have: (await window.ccAddons.loader.packages.list()).length }; }, ids);
  ok(!bad.ok && ['hash', 'signature:files', 'unreadable'].includes(bad.reason) && bad.have === 0, app + ': a damaged download is refused and nothing is installed (' + bad.reason + ')', JSON.stringify(bad));
  corrupt = null;

  // the whole set at once
  const got = await page.evaluate(async (ids) => { const r = await window.ccAddonsAccount.ensureMany(ids); return { ok: r.ok, reason: r.reason, installed: r.installed }; }, ids);
  ok(got.ok && got.installed.length >= ids.length, app + ': ' + ids.length + ' signed packages (+ engine) fetched, hash and signature checked, installed together', JSON.stringify(got).slice(0, 300));
  const stored = await page.evaluate(async () => (await window.ccAddons.loader.packages.list()).map((p) => ({ id: p.id, v: p.manifest.version, imports: p.manifest.imports || null })));
  ok(mine.every((i) => stored.some((s) => s.id === i.id && s.v === i.v1.version)), app + ': every package is in the loader’s store at the first version', JSON.stringify(stored.map((s) => s.id + '@' + s.v)));
  ok(stored.some((s) => s.imports && (s.imports.host || []).length), app + ': the stored manifests carry their imports (signed with the package)');

  // reload: the loader finds, links and activates them
  await boot();
  const after = await states(ids);
  if (process.env.DBG) console.log('DBG', JSON.stringify(await page.evaluate(async () => ({ list: window.ccAddons.list().map((a) => a.id + ':' + a.state + ':' + a.reason + ':' + a.detail), store: (await window.ccAddons.loader.packages.list()).map((p) => p.id), verify: String(window.ccAddons.loader.constructor.verify).slice(0, 80) }))));
  for (const i of ids) {
    const s = after[i];
    ok(s && s.source === 'installed' && s.state === 'active', app + ': ' + i + ' is installed and active after a reload', JSON.stringify(s));
  }
  if (withDemo) {
    const d = await page.evaluate(() => globalThis.__engineDemo || null);
    ok(d && d.k === 42 && d.host === true, app + ': engine-demo got its code from the DOWNLOADED engine package (the app carries no lib/demo) and a host: module', JSON.stringify(d));
  }
  await page.screenshot({ path: path.join(SHOTS, app + '-01-installed.png') });

  // Settings › Your add-ons
  await page.click('[data-settings-open]').catch(() => {});
  if (await page.isVisible('[data-settings-tab="general"]').catch(() => false)) await page.click('[data-settings-tab="general"]').catch(() => {});
  const set = '[data-addons-account-set]';
  await page.waitForSelector('.shell-sec-nav button:has-text("Your add-ons")', { timeout: 8000 }).then(() => page.click('.shell-sec-nav button:has-text("Your add-ons")')).catch(() => {});
  await page.waitForSelector(set, { state: 'visible', timeout: 15000 });
  const txt = await page.textContent(set);
  ok(mine.every((i) => txt.includes(i.name)) && /v\d+\.\d+\.\d+/.test(txt), app + ': Settings › Your add-ons lists all of them with their versions', txt.slice(0, 160));
  await page.screenshot({ path: path.join(SHOTS, app + '-02-settings.png') });

  // an update with a second signed version
  version = 2;
  await page.evaluate(() => window.ccAddonsAccount.sync());
  await page.click(set + ' button:has-text("Check for updates")');
  await page.waitForFunction((s) => /Update all together/.test(document.querySelector(s).textContent), set, { timeout: 20000 }).catch(() => {});
  const utxt = await page.textContent(set);
  ok(mine.every((i) => utxt.includes(i.name + ': ' + i.v1.version + ' to ' + i.v2.version)), app + ': Check for updates lists every add-on with its second version (same major, same permissions: automatic)', utxt.slice(utxt.indexOf('Updates'), utxt.indexOf('Updates') + 200));
  await page.screenshot({ path: path.join(SHOTS, app + '-03-updates.png') });
  await page.click(set + ' button:has-text("Update all together")');
  await page.waitForFunction((s) => /Updated \d+ together/.test(document.querySelector(s).textContent), set, { timeout: 60000 }).catch(() => {});
  ok(/Updated \d+ together/.test(await page.textContent(set)), app + ': "Update all together" installs the second versions as one set', (await page.textContent(set)).slice(-120));
  const v2stored = await page.evaluate(async () => Object.fromEntries((await window.ccAddons.loader.packages.list()).map((p) => [p.id, p.manifest.version])));
  ok(mine.every((i) => v2stored[i.id] === i.v2.version), app + ': the store now holds the second versions', JSON.stringify(v2stored));
  await boot();
  const run2 = await states(mine.map((i) => i.id));
  ok(mine.every((i) => run2[i.id] && run2[i.id].state === 'active' && run2[i.id].version === i.v2.version), app + ': after a reload the loader runs the second versions', JSON.stringify(run2));
  await page.screenshot({ path: path.join(SHOTS, app + '-04-updated.png') });

  // roll back
  const rb = await page.evaluate(async (ids) => { const r = await window.ccAddonsAccount.rollBack(ids); return r; }, mine.map((i) => i.id));
  ok(rb.ok && rb.back.length === mine.length, app + ': Roll back returns the first versions', JSON.stringify(rb).slice(0, 200));
  version = 1;
  await boot();
  const run3 = await states(mine.map((i) => i.id));
  ok(mine.every((i) => run3[i.id] && run3[i.id].state === 'active' && run3[i.id].version === i.v1.version), app + ': after a reload the loader runs the first versions again', JSON.stringify(run3));

  // remove one: it goes from the list and the store
  const rm = await page.evaluate(async (id) => { const r = await window.ccAddons.loader.uninstall(id); return (await window.ccAddons.loader.packages.list()).some((p) => p.id === id); }, mine[0].id);
  ok(rm === false, app + ': uninstall takes one out of the store');
  await ctx.close();
}

try {
  for (const app of APPS) await runApp(app);
} finally {
  await browser.close();
  admin('down');
}
const real = problems.filter((p) => !/favicon|Failed to load resource: the server responded with a status of 40[134]/.test(p));
ok(real.length === 0, 'no console errors or page errors from the apps, the loader or the account', real.slice(0, 5).join(' | '));
console.log(fail ? `FAILED ${fail} of ${pass + fail}` : `passed ${pass}`);
process.exit(fail ? 1 : 0);
