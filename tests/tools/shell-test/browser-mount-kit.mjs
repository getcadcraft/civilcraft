#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mount-kit.mjs — the mount kit's proof (round 3, session shell_PART_3; docs/apps/shell-modules.md § Mounting), on a scratch copy of an app's lab page:
 *   - /use (a release) has none of the seven keys; the scratch build (the real manifest, the seven keys on, in memory: tools/shell-test/mount-kit.php) names every
 *     file in its import map and offline list, and every one is on disk
 *   - the page is fetched as the lab serves it and the seven <script> pairs app-shell.inc prints for those keys are put in (no app folder is edited)
 *   - the block under "### 2. The block" of the doc is EXTRACTED from the doc and run against a stand-in host: calc and reasons persist into the "file", totals draw a
 *     chip, a lesson completes, Suggest / Activity / Ask each show a button and their tools are on host.control; load(save()) round-trips; the app bar fits at 360 px
 *
 *   node tools/shell-test/browser-mount-kit.mjs [--apps partcraft]
 * Run as root (a session minted for the shell's test admin). One app at a time.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const APPS = (opt('--apps') || 'partcraft').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const KEYS = ['calc', 'reasons', 'totals', 'lessons', 'ai-suggest', 'ai-activity', 'ai-ask'];

const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

// the block, from the doc
const doc = fs.readFileSync(path.join(REPO, 'docs/apps/shell-modules.md'), 'utf8');
const m = doc.match(/```js mount-block\n([\s\S]*?)\n```/);
ok(!!m, 'the doc has a ```js mount-block block');
const BLOCK = m ? m[1] : '';

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block' });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn).catch(() => false)) return true; await sleep(60); } return false; };

for (const slug of APPS) {
  console.log('== ' + slug);
  problems = [];
  const use = curl(`${BASE}/use/${slug}`);
  ok(!KEYS.some((k) => use.includes('id="cc-' + k + '"')), `${slug}: /use (release) has none of the seven keys`);

  const scratch = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/mount-kit.php'), slug], { encoding: 'utf8' }));
  ok(JSON.stringify(scratch.extras.filter((k) => KEYS.includes(k))) === JSON.stringify(KEYS), 'the scratch build turns on the seven keys in order (later keys such as access, fields, engines may follow)');
  ok(scratch.missing.length === 0, 'import map, offline list and disk name every file the seven keys use' + (scratch.missing.length ? ': ' + scratch.missing.join(', ') : ''));

  await page.route(`${BASE}/lab/${slug}`, async (route) => {
    const res = await route.fetch();
    const body = (await res.text()).replace('</body>', scratch.tags + '</body>');
    await route.fulfill({ response: res, body });
  });
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'domcontentloaded' });
  const up = await wait(() => !!(window.ccCalc && window.ccReasons && window.ccTotals && window.ccLessons && window.ccSuggest && window.ccActivity && window.ccAsk), 25000);
  ok(up, 'all seven APIs are there');
  if (!up) continue;
  const mounted = await page.evaluate(async ([BLOCK, app]) => {
    const { createDispatcher } = await import('/assets/apps/' + app + '/dev/host.js');
    const file = { calcs: undefined, reasons: undefined }; const sets = [];
    let sel = null; const selFns = new Set(); let depth = 0; const store = { Width: 5000 };
    const d = createDispatcher({ allowed: () => ['read', 'suggest'], log: () => {} });
    const control = { list: () => d.list(), call: (n, a, s) => d.call(n, a, s), sessions: () => [], tool: (def) => d.tool(def), step: (l, fn) => { depth++; return fn(); },
      apply: (n, a, s) => d.call(n, a, s), configure: () => control, on: () => () => {}, get enabled() { return true; }, get groups() { return ['read', 'suggest']; } };
    const host = {
      control, step: control.step, file: { set: (k, v) => { file[k] = v; sets.push(k); } },
      params: { get: (n) => (n in store ? store[n] : null), set: (n, v) => { store[n] = v; return true; }, list: () => Object.keys(store) },
      selection: () => sel, onSelection: (fn) => { selFns.add(fn); return () => selFns.delete(fn); }, select: () => {},
      totals: [{ id: 't.cost', measure: 'cost', label: 'Stand-in', read: () => ({ value: 1200, currency: 'USD' }) }],
      lessons: [{ id: 'mount-kit', title: 'Mount kit', steps: [{ id: 's1', text: 'Do the thing', hints: ['Try the tool'], done: { event: 'tool', match: { name: 'line' } } }] }],
      rev: () => depth, document: () => ({ name: 'plan', docId: 'abc' }), perms: { get: () => ({ enabled: true, groups: ['read', 'suggest'], folders: [], projects: {} }), set: () => {} },
      askContext: () => ({ document: 'plan', selection: { kind: 'x', count: 0 } }), skillPack: () => 'pack',
    };
    window.__mk = { file, sets, host, setSel: (s) => { sel = s; selFns.forEach((f) => f()); } };
    new Function('host', BLOCK + '\nmountShellModules(host);')(host);
    return true;
  }, [BLOCK, slug]).catch((e) => ({ err: e.message }));
  ok(mounted === true, 'the doc block runs against a stand-in host' + (mounted && mounted.err ? ': ' + mounted.err : ''));
  if (mounted !== true) continue;

  ok(await page.evaluate(() => ['calc', 'reasons', 'ai-suggest', 'ai-activity', 'ai-ask'].every((k) => document.querySelector('.app-bar-' + k.replace('ai-', '')) !== null)), 'each panel has its app-bar button');
  const tools = await page.evaluate(() => window.__mk.host.control.list().map((t) => t.name));
  ok(['calcs_list', 'reasons_get', 'totals_get', 'lessons_status', 'suggestions_list', 'ask_list', 'ask_reply'].every((n) => tools.includes(n)), 'their tools are on host.control (' + tools.length + ' in all)');

  // calc: a row through the panel is persisted into the "file"
  await page.click('.app-bar-calc');
  await page.click('#cct-calc [data-k="addsheet"]'); await page.click('#cct-calc [data-k="addrow"]');
  const row = page.locator('#cct-calc .cct-r:not(.cct-rh)').nth(0);
  await row.locator('input').nth(0).fill('span'); await row.locator('input').nth(0).press('Tab');
  await row.locator('input').nth(1).fill('6 m'); await row.locator('input').nth(1).press('Tab');
  ok(await wait(() => window.__mk.file.calcs && window.__mk.file.calcs.format === 'cadcraft-calcs', 6000), 'calc: persist wrote file.calcs');
  // reasons: select an element, write a record
  await page.evaluate(() => { window.__mk.setSel({ kind: 'beam', id: 'B1', label: 'Beam B1' }); window.ccReasons.reasons.set({ kind: 'beam', id: 'B1', label: 'Beam B1' }, { decision: 'Steel for span' }); });
  ok(await wait(() => window.__mk.file.reasons && window.__mk.file.reasons.records && window.__mk.file.reasons.records.length === 1, 6000), 'reasons: persist wrote file.reasons');
  // totals: a chip
  ok(await wait(() => /1[,.]?200/.test(document.querySelector('.cct-chip-cost')?.textContent || ''), 5000), 'totals: a cost chip shows 1,200');
  // lessons: button shows once registered; an event completes the step
  ok(await page.evaluate(() => !document.querySelector('.app-bar-lessons').hidden), 'lessons: the button appears once a lesson is registered');
  await page.evaluate(() => { window.ccLessons.start('mount-kit'); window.__mk.host.emit('tool', { name: 'line' }); });
  ok(await page.evaluate(() => JSON.stringify(window.ccLessons.state()).includes('mount-kit')), 'lessons: host.emit reaches the lesson');
  // file round trip
  const rt = await page.evaluate(() => { const a = JSON.stringify(window.ccCalc.save()); window.ccCalc.load(JSON.parse(a)); return a === JSON.stringify(window.ccCalc.save()); });
  ok(rt, 'load(save()) round-trips the calc sheets');
  ok(await page.evaluate(() => { window.__mk.host.fileOpened(); return true; }), 'host.fileOpened() resets Suggest');
  // phone
  await page.setViewportSize({ width: 360, height: 780 }); await sleep(250);
  ok(await page.evaluate(() => { const b = document.querySelector('.app-bar'); return b.scrollWidth <= b.clientWidth + 1; }), 'the app bar still fits at 360 px with all seven mounted');
  // the worst case: every button the seven modules own is showing at once (Suggest, Activity and Ask show only with content), at the narrowest fold width
  await page.setViewportSize({ width: 344, height: 780 }); await sleep(200);
  await page.evaluate(() => { document.querySelectorAll('.app-bar-calc, .app-bar-reasons, .app-bar-lessons, .app-bar-suggest, .app-bar-activity, .app-bar-ask').forEach((b) => { b.hidden = false; }); });
  await sleep(150);
  ok(await page.evaluate(() => { const b = document.querySelector('.app-bar'); return b.scrollWidth <= b.clientWidth + 1; }), 'the app bar fits at 344 px with every one of the six buttons showing (they live in More)');
  ok(await page.evaluate(() => ['suggest', 'activity', 'ask'].every((k) => getComputedStyle(document.querySelector('.app-bar > .app-bar-' + k)).display === 'none')), 'Suggest, Activity and Ask are not in the bar at phone width');
  await page.setViewportSize({ width: 1280, height: 800 });
  ok(!problems.length, 'no page errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
}
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
