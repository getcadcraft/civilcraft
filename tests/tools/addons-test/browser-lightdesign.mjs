#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-lightdesign.mjs — the Interior lighting design add-on in /lab/cadcraft (0.9 LD). Run as root (session minted by tools/addons-test/admin.php).
 *   node tools/addons-test/browser-lightdesign.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/lightdesign'));
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
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s, wait = 200) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const ldEnts = () => page.evaluate(() => window.cadcraft.doc.all().filter((e) => String(e.layer).startsWith('LD-')).length);
const readDownload = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); const f = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(f); return { file: f, name: dl.suggestedFilename(), text: fs.readFileSync(f, 'utf8') }; };
const ld = (k) => `[data-ld="${k}"]`;
const openPanel = async () => { await page.waitForSelector('[data-ld-root]', { state: 'attached', timeout: 10000 }); for (let k = 0; k < 6; k++) { await page.waitForTimeout(700); if (await page.isVisible('[data-ld-root]')) return; const head = page.locator('[data-af="closed"]', { hasText: 'Lighting design' }); if (await head.count()) await head.first().click(); } await page.waitForSelector('[data-ld-root]', { state: 'visible', timeout: 5000 }); };   // the shell's one-open-section folding (2026-11) starts add-on sections closed

await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });   // the shell's one-open-section folding (app-settings.js) would start every add-on section closed
try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:lightdesign:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on.lightdesign; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'lightdesign' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'lightdesign'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Interior lighting design is bundled and starts off', JSON.stringify(me));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('lightdesign', true));
  await page.waitForTimeout(600);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'lightdesign'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.reason, me.detail]));

  // a 6 x 4 m room (drawing units are millimetres by default) and a smaller one
  await page.evaluate(() => {
    const d = window.cadcraft.doc;
    d.change('test rooms', () => {
      d.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0 }, { x: 6000, y: 0 }, { x: 6000, y: 4000 }, { x: 0, y: 4000 }] });
      d.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 8000, y: 0 }, { x: 11000, y: 0 }, { x: 11000, y: 3000 }, { x: 8000, y: 3000 }] });
    });
  });
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await openPanel();
  await page.click(ld('reread'));
  await page.waitForFunction(() => document.querySelectorAll('[data-ld="roompick"] option').length === 3, null, { timeout: 5000 }).catch(() => {});
  const opts = await page.$$eval('[data-ld="roompick"] option', (o) => o.map((x) => x.textContent));
  ok(opts.length === 3 && /24\.0 m²/.test(opts[1]) && /9\.0 m²/.test(opts[2]), 'Rooms found lists both closed shapes with their areas, largest first', opts.join(' | '));
  await page.selectOption(ld('roompick'), '0');
  ok((await page.inputValue(ld('outline'))).split('\n').length >= 4, 'choosing a room fills the outline');

  // plan for the office target and calculate
  await page.selectOption(ld('preset'), 'office.writing');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  const rows = await page.$$eval('[data-ld-result] tr', (r) => r.map((x) => x.textContent));
  const em = Number((rows.find((r) => /Mean illuminance/.test(r)) || '').match(/(\d+) lx/)?.[1]);
  ok(em >= 500 && em < 900, 'a planned office reaches 500 lx and is not wildly over (' + em + ')', rows.join(' | '));
  ok(await page.$('[data-ld-check="em:ok"]'), 'the mean-lux requirement shows as met');
  ok(rows.some((r) => /^UGR\s*\d/.test(r)), 'UGR is shown', rows.join(' | '));
  const painted = await page.evaluate(() => { const c = document.querySelector('[data-ld-map]'); if (!c) return -1; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const seen = new Set(); for (let i = 0; i < d.length; i += 40) seen.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return seen.size; });
  ok(painted > 3, 'the false-colour map is painted', String(painted));
  await page.locator('[data-ld-root]').screenshot({ path: path.join(SHOTS, 'lightdesign-panel.png') }).catch(() => {});

  // draw, undo, redraw, erase
  const before = await ldEnts();
  await page.click(ld('draw')); await page.waitForTimeout(500);
  const drawn = await ldEnts();
  ok(before === 0 && drawn > 10, 'Draw puts luminaires and lux values on the LD layers', before + ' -> ' + drawn);
  await page.evaluate(() => window.cadcraft.host.zoomExtents()); await page.waitForTimeout(300);
  await shot('lightdesign-drawn');
  await typeCmd('U', 300);
  ok((await ldEnts()) === 0, 'one undo takes it all back');
  await typeCmd('REDO', 300);
  await page.click(ld('draw')); await page.waitForTimeout(400);
  ok((await ldEnts()) === drawn, 'drawing again replaces, not doubles');
  await page.click(ld('erase')); await page.waitForTimeout(300);
  ok((await ldEnts()) === 0, 'Erase clears them');

  // report and csv
  const rep = await readDownload(ld('report'));
  ok(/<svg/.test(rep.text) && /Mean illuminance/.test(rep.text), 'the report downloads as a page with a map', rep.name);
  const csv = await readDownload(ld('csv'));
  ok(/x_mm,y_mm,z_mm,lux/.test(csv.text) && csv.text.split('\n').length > 30, 'the CSV lists the grid', csv.name);

  // a generic file-less error path: a thin sliver is refused in words
  await page.fill(ld('outline'), '0, 0\n10, 0\n10, 10'); await page.keyboard.press('Tab');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-error]', { timeout: 5000 });
  ok(/at least three corners/.test(await page.textContent('[data-ld-error]')), 'a degenerate outline is refused in words');
  await page.fill(ld('outline'), '0, 0\n6000, 0\n6000, 4000\n0, 4000'); await page.keyboard.press('Tab');

  // commands
  await typeCmd('LDESIGN', 800);
  ok((await history()).some((l) => /Em \d+ lx, Uo [\d.]+, UGR [\d.]+, \d+ luminaires/.test(l)), 'LDESIGN prints the summary', (await history()).slice(-3).join(' | '));
  await typeCmd('LDDRAW', 800);
  ok((await ldEnts()) > 10, 'LDDRAW draws');

  // a setting survives a reload
  await page.fill(ld('height'), '3100'); await page.keyboard.press('Tab'); await page.waitForTimeout(300);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ccAddons?.list().some((a) => a.id === 'lightdesign' && a.state === 'active'), null, { timeout: 15000 });
  await openPanel();
  ok((await page.inputValue(ld('height'))) === '3100', 'the ceiling height you typed is still there after a reload');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('lightdesign-error').catch(() => {});
}
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
