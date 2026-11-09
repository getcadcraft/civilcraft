#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-textstyle.mjs — CadCraft text styles and the formatted MTEXT editor (0.9 FX.92; textstyles.js, textstyle-ui.js,
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

  console.log('\n== STYLE dialog');
  await typeCmd('STYLE');
  await page.waitForSelector('[data-text-style]');
  await page.click('[data-ts-act="new"]');
  await page.fill('[data-ts-input]', 'Notes');
  await page.click('[data-ts-ok]');
  await page.fill('[data-ts-font]', 'Courier New');
  await page.press('[data-ts-font]', 'Enter');
  await page.dispatchEvent('[data-ts-font]', 'change');
  await shot('style-01-dialog');
  const st = await page.evaluate(() => ({ cur: window.cadcraft.doc.current.textStyle, s: window.cadcraft.doc.textStyles.get('Notes') }));
  ok(st.cur === 'Notes' && st.s?.font === 'Courier New', 'New style "Notes" is current and has the font Courier New', JSON.stringify(st));
  await page.click('[data-ts-close]');

  console.log('\n== TEXT takes the current style');
  await typeCmd('TEXT'); await typeCmd('0,0'); await typeCmd('2.5'); await typeCmd('0'); await typeCmd('Styled line'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  let t = await texts();
  ok(t.length === 1 && t[0].font === 'Courier New' && t[0].style === 'Notes', 'a new single-line text carries the style\'s font and name', JSON.stringify(t));

  console.log('\n== MTEXT editor');
  await page.evaluate(() => window.cadcraft.doc.current.textStyle = 'Standard');
  await typeCmd('MTEXT'); await typeCmd('0,-20'); await typeCmd('60,-40');
  await page.waitForSelector('[data-text-edit]');
  ok(await page.$('[data-te-font]') && await page.$('[data-te-size]') && await page.$('[data-te-fmt="b"]') && await page.$('[data-te-color]') && await page.$('[data-te-align="center"]'), 'the editor has font, size, bold, colour and alignment controls');
  await page.keyboard.type('Multiline ');
  await page.click('[data-te-fmt="b"]');
  await page.keyboard.type('Text');
  await page.keyboard.press('Enter');
  await page.keyboard.type('second line');
  await page.keyboard.press('Control+a');
  await page.selectOption('[data-te-font]', 'Courier New');
  await shot('mtext-01-editor');
  await page.focus('[data-text-edit]'); await page.keyboard.press('Control+End');
  await page.click('[data-te-sym="°"]');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(250);
  t = await texts();
  const m = t.find((x) => x.s && x.s.includes('Multiline'));
  ok(m && m.s.includes('second line') && m.s.endsWith('°'), 'the text is saved, with the degree sign at the end', JSON.stringify(t));
  ok(m && m.mt && /Courier New/.test(m.mt) && /\\P/.test(m.mt), 'the formatting is kept as MTEXT codes (font, new paragraph)', m && m.mt);
  await shot('mtext-02-drawn');

  console.log('\n== bold on a selection');
  await typeCmd('MTEXT'); await typeCmd('0,-60'); await typeCmd('60,-80');
  await page.waitForSelector('[data-text-edit]');
  await page.keyboard.type('plain bold plain');
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowLeft');
  for (let i = 0; i < 4; i++) await page.keyboard.press('Shift+ArrowLeft');
  await page.click('[data-te-fmt="b"]');
  await page.click('[data-te-align="center"]');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(250);
  t = await texts();
  const b = t.find((x) => x.s === 'plain bold plain');
  ok(b && b.mt && /b1\|i0;bold}/.test(b.mt) && b.ha === 'center', 'only the selected word is bold, and the text is centred', b && JSON.stringify(b));

  console.log('\n== an unchanged text keeps its codes');
  const before = b.mt;
  await page.evaluate((id) => window.cadcraft.host.setSelection(new Set([id])), b.id);
  await typeCmd('TEXTEDIT');
  await page.waitForSelector('[data-text-edit]');
  ok(await page.evaluate(() => !!document.querySelector('[data-text-edit] span[style*="bold"], [data-text-edit] span[style*="700"]')), 'TEXTEDIT shows the bold word as bold');
  await page.keyboard.press('Control+Enter');
  await page.waitForTimeout(250);
  t = await texts();
  ok(t.find((x) => x.id === b.id)?.mt === before, 'closing without a change leaves the codes untouched', JSON.stringify(t.find((x) => x.id === b.id)));
  ok(problems.length === 0, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++; console.log('  FAIL ' + e.message);
  await shot('error').catch(() => {});
} finally {
  await browser.close();
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
