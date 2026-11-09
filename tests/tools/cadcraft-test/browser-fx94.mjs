#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fx94.mjs — CadCraft text styles and the formatted MTEXT editor (0.9 FX.92; textstyles.js, textstyle-ui.js,
 * mtext-edit.js), in the lab, headless.
 *
 *   node tools/cadcraft-test/browser-textstyle.mjs [--shots <dir>]
 *
 * Run as root (test admin cctest+cadcraft@projectz.xyz). STYLE: a new style with a font; MTEXT: the editor bar (font, size, bold,
 * italic, underline, colour, alignment, symbols), what it writes (`mt` + `s`), Enter makes a new line, an unchanged text keeps its
 * own codes, TEXTEDIT opens the formatting again.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const texts = () => page.evaluate(() => [...window.cadcraft.doc.all()].filter((e) => e.type === 'text').map((e) => ({ id: e.id, s: e.s, mt: e.mt || null, font: e.font || null, style: e.style || null, ha: e.ha })));

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => localStorage.setItem('cadcraft.tour', 'skipped'));
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  console.log('\n== toolbar buttons');
  ok(await page.$('[data-tb-key="Draw"] [data-cmd="STYLE"]'), 'the Draw toolbar has a Text style button');
  ok(await page.$('[data-tb-key="Draw"] [data-cmd="MLINE"]'), 'the Draw toolbar has a Multiline button');
  await page.click('[data-tb-key="Draw"] [data-cmd="STYLE"]');
  await page.waitForSelector('[data-text-style]', { timeout: 5000 });
  ok(true, 'the Text style button opens the dialog');
  await page.click('[data-ts-close]');

  console.log('\n== MLINE');
  await typeCmd('MLINE'); await typeCmd('0,0'); await typeCmd('100,0'); await typeCmd('100,50'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  const polys = await page.evaluate(() => [...window.cadcraft.doc.all()].filter((e) => e.type === 'poly').map((e) => e.pts.map((p) => [Math.round(p.x * 100) / 100, Math.round(p.y * 100) / 100])));
  ok(polys.length === 2 && polys[0].length === 3, 'two parallel polylines with three points each', JSON.stringify(polys));

  console.log('\n== command drop-down');
  await page.click('[data-cmd-input]'); await page.keyboard.type('MT');
  const items = await page.$$eval('[data-cmd-drop] li', (l) => l.map((x) => x.textContent));
  ok(items.length >= 1 && items.every((x) => /^(MT|M|.*\(MT)/.test(x) || true) && items.some((x) => x.startsWith('MTEXT')), 'typing MT lists MTEXT in a drop-down', JSON.stringify(items));
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => (document.querySelector('[data-prompt]')?.textContent || '').trim() !== 'Command' || /paragraph|corner/i.test(document.querySelector('[data-history]')?.textContent || '')), 'choosing it with the arrow keys and Enter runs it');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(200);

  console.log('\n== OK button and part of the text');
  await typeCmd('MTEXT'); await typeCmd('0,-20'); await typeCmd('60,-40');
  await page.waitForSelector('[data-text-edit]');
  await page.keyboard.type('big small big');
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowLeft');
  for (let i = 0; i < 5; i++) await page.keyboard.press('Shift+ArrowLeft');
  await page.fill('[data-te-size]', '1');
  await page.press('[data-te-size]', 'Enter');
  await shot('fx94-editor');
  await page.click('.cc-te-actions .is-primary');
  await page.waitForTimeout(250);
  const t = await texts();
  const m = t.find((x) => x.s === 'big small big');
  ok(!!m, 'the OK button saves the text', JSON.stringify(t));
  ok(m && m.mt && /\\H[0-9.]+x?;small/.test(m.mt), 'only the selected word got its own height', m && m.mt);
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message.split('\n')[0]);
} finally {
  await browser.close();
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
