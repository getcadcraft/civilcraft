#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-compare-words.mjs — Compare versions, in words (0.8 EG.65), session oltl-eg-b_PART_3, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-compare-words.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session sxtags), so the shared admin-login
 * throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase/bimcraft-house.ifc).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const HOUSE = path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimcmpwords'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');
const download = async (fn) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), fn()]); return { name: dl.suggestedFilename(), bytes: fs.readFileSync(await dl.path()) }; };

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);
  const b64 = fs.readFileSync(HOUSE).toString('base64');
  await page.evaluate(async (b) => { const f = new File([Uint8Array.from(atob(b), (c) => c.charCodeAt(0))], 'house-b.ifc'); await window.bimcraftModels.add(f); }, b64);
  const mis = await page.evaluate(() => window.bimcraftModels.list().map((m) => m.mi));
  ok(mis.length === 2, 'two models open');
  console.log('== Compare, copy as words');
  await page.evaluate((m) => window.bimcraftCompare.run(m[0], m[1]), mis);
  await page.waitForSelector('[data-cmp-words]');
  await page.click('[data-cmp-words]');
  await waitStatus(/Copied the changes as words/);
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  ok(/^Changes from .+ to house-b\.ifc: 0 added, 0 removed, 0 changed\./.test(clip), 'the clipboard holds the summary line: ' + clip.split('\n')[0]);
  const direct = await page.evaluate(() => window.bimcraftCompare.words());
  ok(direct === clip, 'the same text through the test hook');
} catch (e) {
  ok(false, 'ran to the end', e.message);
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
process.exit(fail ? 1 : 0);
