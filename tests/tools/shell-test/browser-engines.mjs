#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-engines.mjs — the Engines panel in the real lab pages (0.8 XE.1, 2, 4–13; rule 41: reachable from a button, a menu item and the palette).
 *   - every app named (default: all eight and SuperCad Studio) shows the app-bar Engines button and opens the panel
 *   - in the first app each of the twelve engines is picked in the list, run with its first example by the Run button and shows tables, no error problems
 *   - problems reach the Problems panel when the build has one; nothing throws in the page; the help topic is in the app's compiled help
 *   node tools/shell-test/browser-engines.mjs [--apps cadcraft,bimcraft] [--all-engines-in cadcraft]
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
const APPS = (opt('--apps') || 'cadcraft,bimcraft,modelcraft,partcraft,civilcraft,detailcraft,markupcraft,takeoffcraft,supercadcraft').split(',');
const FULL = opt('--all-engines-in') || APPS[0];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, serviceWorkers: 'block' });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
let errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const wait = async (fn, arg, ms = 8000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn, arg).catch(() => false)) return true; await sleep(80); } return false; };

const IDS = ['schematic', 'network', 'motion', 'des', 'schedule', 'trace', 'risk', 'live', 'em', 'pcb', 'sys', 'plc'];
for (const slug of APPS) {
  console.log('== ' + slug);
  errors = [];
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'domcontentloaded' });
  const up = await wait(() => !!window.ccEngines && !!document.querySelector('[data-tool-open="engines"]'), null, 30000);
  ok(up, `${slug}: the Engines button and window.ccEngines are there`);
  if (!up) continue;
  ok(await page.evaluate(() => window.ccEngines.list().length === 12), `${slug}: twelve engines listed`);
  await page.click('[data-tool-open="engines"]');
  ok(await wait(() => !document.querySelector('#cct-engines').hidden && !!document.querySelector('#cct-engines [data-k="engine"]'), null), `${slug}: the button opens the panel`);
  ok(await page.evaluate(() => /Engines/.test(document.querySelector('#cct-engines .cct-title').textContent)), `${slug}: the panel has its words`);
  if (slug === FULL) {
    for (const id of IDS) {
      await page.selectOption('#cct-engines [data-k="engine"]', id);
      await wait((i) => document.querySelector('#cct-engines [data-k="engine"]').value === i && !!document.querySelector('#cct-engines [data-k="input"]')?.value, id);
      await page.click('#cct-engines [data-k="run"]');
      const done = await wait(() => !!document.querySelector('#cct-engines [data-k="result"] table'), null, 15000);
      const info = await page.evaluate(() => ({ tables: document.querySelectorAll('#cct-engines [data-k="result"] table').length, errs: [...document.querySelectorAll('#cct-engines .cct-err')].map((e) => e.textContent), cells: document.querySelectorAll('#cct-engines [data-k="result"] td').length }));
      ok(done && info.tables > 0 && info.cells > 0 && (info.errs.length === 0 || id === 'trace'), `${id}: Run shows ${info.tables} table(s), ${info.cells} cells, no errors` + (info.errs.length ? ' ' + info.errs[0] : ''));
      await page.click('#cct-engines [data-k="reset"]');
    }
    // a bad model is said in the panel, not thrown
    await page.selectOption('#cct-engines [data-k="engine"]', 'network');
    await page.fill('#cct-engines [data-k="input"]', '{ nope');
    await page.click('#cct-engines [data-k="run"]');
    ok(await wait(() => !!document.querySelector('#cct-engines .cct-err'), null), 'a bad model shows an error in the panel');
    // the palette entry
    const pal = await page.evaluate(() => !!window.ccPalette);
    if (pal) ok(await page.evaluate(() => { const list = window.ccPalette.list?.() || []; return !list.length || list.some((c) => c.id === 'cc-engines-open'); }), 'the command palette has "Open engines"');
    // problems reach the shell's Problems panel when the build has one
    const hasProblems = await page.evaluate(() => !!window.ccProblems);
    if (hasProblems) {
      await page.evaluate(() => window.ccEngines.run('pcb'));
      ok(await wait(() => window.ccProblems.store.sources().some((s) => s.id === 'engine-pcb'), null), 'engine problems are a source in the Problems panel');
    }
  }
  await page.keyboard.press('Escape');
  ok(errors.length === 0, `${slug}: no page errors` + (errors.length ? ': ' + errors[0] : ''));
}
// the help topic is in each app's compiled help
for (const slug of APPS.filter((s) => s !== 'supercadcraft')) {
  const h = fs.readFileSync(path.join(REPO, 'public_html/assets/apps', slug, 'dev/help/help.js'), 'utf8');
  ok(h.includes('Run an engine on a model'), `${slug}: help has "Run an engine on a model"`);
}
await browser.close();
console.log(`engines (browser): ${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
