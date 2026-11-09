#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-docinfo.mjs — Drawing details (0.9 DI.1) in the real lab pages: the button, the panel, the numbers the app hands over, writing details,
 * save() stamping, load() round trip, no page errors.   node tools/shell-test/browser-docinfo.mjs [--apps cadcraft,bimcraft]
 * Run as root (a session minted for the shell's test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
const APPS = (opt('--apps') || 'cadcraft,bimcraft,modelcraft,markupcraft,takeoffcraft,civilcraft,detailcraft,partcraft').split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
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
const wait = async (fn, ms = 4000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn).catch(() => false)) return true; await sleep(80); } return false; };

for (const slug of APPS) {
  console.log('== ' + slug);
  problems = [];
  await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'domcontentloaded' });
  const up = await wait(() => !!(window.ccDocInfo && window.ccDocInfo.state().attached), 30000);
  ok(up, 'ccDocInfo is there and the app attached to it');
  if (!up) continue;
  ok(await page.evaluate(() => !!document.querySelector('[data-tool-open="docinfo"]')), 'the Drawing details button is in the app bar');
  await page.evaluate(() => ccDocInfo.open());
  await sleep(300);
  const facts = await page.evaluate(() => [...document.querySelectorAll('.cct-docinfo [data-k="facts"] dt, .cct-docinfo [data-k="facts"] dd')].map((e) => e.textContent));
  ok(facts.length >= 2 || await page.evaluate(() => !!document.querySelector('.cct-docinfo .cct-empty')), 'the panel lists what the app counts (or says there is nothing yet): ' + facts.slice(0, 6).join(' | '));
  ok(!facts.some((t, i) => i % 2 === 1 && /^0$/.test(t) && /triangle/i.test(facts[i - 1])), 'no invented zero triangles');
  await page.fill('.cct-docinfo [data-k="title"]', 'Docinfo test');
  await page.fill('.cct-docinfo [data-k="author"]', 'Test Author');
  await page.click('.cct-docinfo [data-k="save"]');
  await sleep(500);
  const st = await page.evaluate(() => ({ title: ccDocInfo.info.get().title, author: ccDocInfo.info.get().author, created: ccDocInfo.info.get().created }));
  ok(st.title === 'Docinfo test' && st.author === 'Test Author' && st.created > 0, 'writing the details keeps them and stamps the creation date');
  const saved = await page.evaluate(() => ccDocInfo.save());
  ok(saved && saved.title === 'Docinfo test' && saved.modified > 0 && saved.revision >= 1, 'save() stamps the save time and returns the file JSON');
  await page.evaluate((j) => ccDocInfo.load(j), { title: 'Other', author: 'Else' });
  ok(await page.evaluate(() => ccDocInfo.info.get().title === 'Other' && ccDocInfo.info.get().created === 0), 'load() replaces what the panel holds');
  const tools = await page.evaluate(() => ccDocInfo.tools().map((t) => t.name).join());
  ok(tools === 'docinfo_get,docinfo_set', 'the two assistant tools');
  ok(problems.length === 0, 'no page errors' + (problems.length ? ': ' + problems.join('; ') : ''));
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
