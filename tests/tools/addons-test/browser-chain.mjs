#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-chain.mjs — the Roller chain sprockets add-on in /lab/cadcraft (0.9 SU.961, 2026-11-06): bundled and off, switched on, then SPROCKET, CHAINS and CHAINSOURCES
 * typed at the real command line; the outline is read back from the drawing (root and tip radii, one tooth per count); one undo; no console errors. Run as root: a signed-in session is minted in-process by
 * tools/addons-test/admin.php and root's Playwright Chromium is used (the same set-up as browser-windows.mjs).
 *
 *   node tools/addons-test/browser-chain.mjs [--shots dir]     (shots default: tmp/shots/chain)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/chain'));
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
const carveEnts = () => page.evaluate(() => window.cadcraft.doc.all().filter((e) => String(e.layer).startsWith('CARVE-')).length);
const readDownload = async (sel) => { const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click(sel)]); const f = path.join(SHOTS, dl.suggestedFilename()); await dl.saveAs(f); return { file: f, name: dl.suggestedFilename(), text: fs.readFileSync(f, 'utf8') }; };
const typeCmd = async (s, wait = 250) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const count = (layer) => page.evaluate((l) => window.cadcraft.doc.all().filter((e) => e.layer === l).length, layer);

try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:chain:')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); delete s.chain; localStorage.setItem(k, JSON.stringify(s)); });
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'chain' && a.state !== 'loading'), null, { timeout: 15000 }).catch(() => {});
  let me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'chain'));
  ok(me && me.state === 'off' && me.source === 'bundled', 'Roller chain sprockets is bundled and starts off', JSON.stringify(me && { state: me.state, reason: me.reason, detail: me.detail }));
  await page.evaluate(() => window.ccAddons.loader.setEnabled('chain', true));
  await page.waitForTimeout(600);
  me = await page.evaluate(() => window.ccAddons.list().find((a) => a.id === 'chain'));
  ok(me?.state === 'active', 'switched on: active', JSON.stringify(me && [me.state, me.reason, me.detail]));

  await typeCmd('CHAINS', 400);
  let h = await history();
  ok(h.some((l) => /^Roller chains: 38 rows/.test(l)) && h.some((l) => /^80 \(ANSI B29\.1\): p 25\.4, d1 15\.875, b1 15\.875, h2 24\.13 mm/.test(l)) && h.some((l) => /^08B \(ISO 606 B series\): p 12\.7, d1 8\.51, b1 7\.75/.test(l)), 'CHAINS lists the 38 chains at the real command line');
  await typeCmd('CHAINSOURCES', 400);
  h = await history();
  ok(h.some((l) => /We do not hold ISO 606 or ANSI\/ASME B29\.1/.test(l)) && h.filter((l) => /https:\/\/.+/.test(l) && /^(AN1|AN2|PTI|DIAM|SEDIS|MMI|BEP|IWB|TSU):/.test(l)).length === 9, 'CHAINSOURCES prints the nine catalogues and says the standards are not held');

  const before = await page.evaluate(() => window.cadcraft.doc.all().length);
  await typeCmd('SPROCKET'); await typeCmd('80'); await typeCmd('21'); await typeCmd('30'); await typeCmd('0,0', 600);
  const r = await page.evaluate(() => {
    const d = window.cadcraft.doc, poly = d.all().find((e) => e.layer === 'SPROCKET');
    if (!poly) return null;
    const rad = poly.pts.map((p) => Math.hypot(p.x, p.y));
    return { n: poly.pts.length, min: Math.min(...rad), max: Math.max(...rad), total: d.all().length };
  });
  const p = 25.4, D = p / Math.sin(Math.PI / 21), Df = D - 2 * 15.875 / 2 * 1.02, Dt = D + 0.7 * p;
  ok(r && r.total === before + 5 && r.n > 21 * 8, `SPROCKET 80 with 21 teeth: outline of ${r && r.n} points and 4 more objects`);
  ok(r && Math.abs(r.min - Df / 2) < 1e-3 && r.max <= Dt / 2 + 1e-6 && r.max > D / 2, `outline reaches the root radius ${(Df / 2).toFixed(3)} and stays inside the tip radius ${(Dt / 2).toFixed(3)} (measured ${r && r.min.toFixed(3)} to ${r && r.max.toFixed(3)})`);
  h = await history();
  ok(h.some((l) => /^Sprocket for chain 80, 21 teeth: pitch diameter 170\.\d+/.test(l)) && h.some((l) => /rollers seat and clear/.test(l)), 'the command line reports the diameters and the seat check');
  await shot('chain-01-sprocket');
  ok((await count('SPROCKET')) === 1 && (await count('SPROCKET-BORE')) === 1 && (await count('SPROCKET-CENTER')) === 3, 'layers SPROCKET, SPROCKET-BORE and SPROCKET-CENTER hold the drawing');
  await typeCmd('U', 400);
  ok((await page.evaluate(() => window.cadcraft.doc.all().length)) === before, 'one undo takes the whole sprocket away');
  await typeCmd('SPROCKET'); await typeCmd('99', 400);
  h = await history();
  ok(h.some((l) => /No chain 99 in the table/.test(l)), 'an unknown chain number is refused with a message');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('chain-error').catch(() => {});
}
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
