#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sketchlive.mjs — Sketch with a pen, live (0.8 EG.55 SKETCHLIVE), session oltl-eg-b_PART_3, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-sketchlive.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session sxtags), so the shared admin-login
 * throttle is never touched. Fails on any console error. Opens the showcase house (fixtures/showcase/bimcraft-house.ifc).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'cadsketchlive'], { encoding: 'utf8' }));
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
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.cadcraft && window.cadcraft.engine, null, { timeout: 30000 });
  console.log('== Draw › More › Sketch with a pen');
  const more = await page.$('[data-tb-key="Draw"] [data-more-menu] summary, [data-tb-key="Draw"] details summary');
  ok(!!more, 'the Draw group has a More menu');
  await more.click();
  const btn = await page.$('[data-tb-key="Draw"] [data-cmd="SKETCHLIVE"]');
  ok(!!btn, 'Sketch with a pen is in it');
  await btn.click();
  await page.waitForFunction(() => window.cadcraft.engine.running === 'SKETCHLIVE', null, { timeout: 5000 });
  const box = await page.$eval('canvas', (c) => { const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; });
  const stroke = async (pts) => { await page.mouse.move(pts[0][0], pts[0][1]); await page.mouse.down(); for (const p of pts.slice(1)) await page.mouse.move(p[0], p[1], { steps: 2 }); await page.mouse.up(); await page.waitForTimeout(250); };
  const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
  const before = await page.evaluate(() => window.cadcraft.doc.count());
  await stroke(Array.from({ length: 12 }, (_, i) => [cx - 150 + i * 25, cy + (i % 2 ? 2 : -2)]));
  const after = await page.evaluate(() => { const e = window.cadcraft.doc.all(); const l = e[e.length - 1]; return { n: e.length, type: l?.type, level: l ? Math.abs(l.y1 - l.y2) : null }; });
  ok(after.n === before + 1 && after.type === 'line' && after.level < 1e-6, 'a wobbly stroke became one exactly level line the moment the pen lifted', JSON.stringify(after));
  const prompt = await page.evaluate(() => document.querySelector('[data-cmdline], .cc-cmdline, [data-prompt]')?.textContent || document.body.innerText.slice(-300));
  ok(/Length|length/.test(prompt), 'its length is offered to type over');
  await page.keyboard.type('40'); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
  const len = await page.evaluate(() => { const e = window.cadcraft.doc.all(); const l = e[e.length - 1]; return Math.hypot(l.x2 - l.x1, l.y2 - l.y1); });
  ok(Math.abs(len - 40) < 1e-6, 'typing 40 made it 40 long', String(len));
  await page.keyboard.press('Enter'); await page.waitForTimeout(250);
  ok(await page.evaluate(() => !window.cadcraft.engine.running), 'Enter ends the command');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(250);
  ok(await page.evaluate((n) => window.cadcraft.doc.count() === n, before), 'one Ctrl+Z takes the whole session back');
} catch (e) {
  ok(false, 'ran to the end', e.message);
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 5).join(' | '));
await browser.close();
console.log(fail ? `\n${pass} ok, ${fail} FAILED` : `\nall ok (${pass})`);
process.exit(fail ? 1 : 0);
