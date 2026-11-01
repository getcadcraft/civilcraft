#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-nesting.mjs — the Nesting add-on (0.8 NEST-CAD-PATH, part_PART_3) in CadCraft's real page (/lab/cadcraft, headless Chromium): bundled and off,
 * switched on; six 300 × 200 plates with a Ø80 hole each drawn through the command line, selected, NEST on 1000 × 500 plates: the sheets and copies
 * drawn on their layers, the exact re-check line; File › Export › Nested sheets (DXF) downloads the DXF; no console errors.
 *   node tools/addons-test/browser-nesting.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/nesting'));
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const typeCmd = async (s, wait = 120) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const typeAll = async (...lines) => { for (const l of lines) await typeCmd(l); };
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const kindsOf = (kind) => page.evaluate((k) => window.cadcraft.doc.all().filter((e) => window.ccAddons.kinds.info(e)?.kind === k).map((e) => ({ id: e.id, x: e.x, y: e.y, data: window.ccAddons.kinds.info(e).data })), kind);
const download = async (label) => {
  const ex = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.label));
  const i = ex.findIndex((l) => l.includes(label));
  if (i < 0) return { file: null, list: ex };
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), typeAll('EXPORT', String(i + 1))]);
  const f = path.join(SHOTS, dl.suggestedFilename());
  await dl.saveAs(f);
  return { file: f, list: ex };
};

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:nesting:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.nesting; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'nesting' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'nesting'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Nesting is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('nesting', true));
  await page.waitForTimeout(500);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'nesting'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.detail]));
  for (let i = 0; i < 6; i++) await typeAll('RECTANG', `${i * 400},0`, `${i * 400 + 300},200`, 'CIRCLE', `${i * 400 + 150},100`, '40');
  await page.waitForTimeout(300);
  const n0 = await page.evaluate(() => window.cadcraft.doc.all().length);
  ok(n0 === 12, 'six plates and six holes drawn (' + n0 + ' objects)');
  await page.evaluate(() => window.cadcraft.host.setSelection(window.cadcraft.doc.all().map((e) => e.id)));
  await typeAll('NEST', 'P', '1000', '500', '10', '5', '1', '9');
  await page.waitForTimeout(800);
  const lay = await page.evaluate(() => { const c = {}; for (const e of window.cadcraft.doc.all()) c[e.layer] = (c[e.layer] || 0) + 1; return c; });
  ok(lay['NEST-PARTS'] === 12 && lay['NEST-SHEET'] >= 1 && lay['NEST-LABELS'] === 6, 'NEST: the parts on NEST-PARTS, the plates on NEST-SHEET, the names on NEST-LABELS — ' + JSON.stringify(lay));
  const h = (await history()).join(' | ');
  ok(/Nested 6 parts\. Plates used: 1,/.test(h) && /Checked again on the exact shapes/.test(h), 'the command line: six parts on one plate, checked again');
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(400);
  await shot('nesting-01');
  const dl = await download('Nested sheets');
  const txt = dl.file ? fs.readFileSync(dl.file, 'utf8') : '';
  ok(/SECTION/.test(txt) && /PARTS/.test(txt) && /SHEET/.test(txt), 'File › Export › Nested sheets (DXF): ' + (dl.file ? path.basename(dl.file) : 'not in ' + JSON.stringify(dl.list)));
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err.stack || err.message));
} finally {
  await browser.close();
  try { admin('down'); } catch { /* fine */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
