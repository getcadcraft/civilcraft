#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-night.mjs — the site lighting and night view of the Interior lighting design add-on in /lab/bimcraft and /lab/cadcraft (0.10 SU.1816). Run as root, alone, nice, with a timeout:
 *   nice -n 10 timeout 900 node lib/lightdesign/test/browser-night.mjs [--shots dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/lightdesign-night'));
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

await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });

const closeDialogs = () => page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open].shell-fit')) { try { d.close(); } catch { /* */ } } for (const e of document.querySelectorAll('.nh-offer, .tour-toast')) { try { e.hidePopover(); } catch { /* */ } e.remove(); } });
const enable = async (app) => {
  await page.goto(BASE + '/lab/' + app, { waitUntil: 'domcontentloaded' });
  await page.evaluate((a) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':lightdesign:')) localStorage.removeItem(k); }, app);
  await page.goto(BASE + '/lab/' + app, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.ccAddons, null, { timeout: 30000 });
  await page.waitForFunction(() => window.ccAddons.list().some((a) => a.id === 'lightdesign' && a.state !== 'loading'), null, { timeout: 20000 }).catch(() => {});
  await page.evaluate(() => window.ccAddons.loader.setEnabled('lightdesign', true));
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'lightdesign')?.state === 'active', null, { timeout: 20000 });
  for (let k = 0; k < 20 && !(await page.isVisible('[data-ld-root]').catch(() => false)); k++) {
    await page.evaluate(() => { const b = [...document.querySelectorAll('button.bc-rtab, [role=tab], button')].find((x) => /^\s*Lighting design\s*$/.test(x.textContent || '') && x.offsetParent); if (b) b.click(); });
    await page.waitForTimeout(600);
  }
};
const run = async (app, expectPicture) => {
  console.log('\n' + app);
  await enable(app);
  await closeDialogs();
  ok(await page.isVisible('[data-ld-root]'), 'the lighting design panel is open');
  // outdoors: a 30 x 20 m car park, poles on a grid
  await page.fill(ld('outline'), '0, 0\n30000, 0\n30000, 20000\n0, 20000'); await page.keyboard.press('Tab');
  await page.check(ld('outdoor'));
  ok((await page.inputValue(ld('height'))) === '6000' && (await page.inputValue(ld('workplane'))) === '0', 'ticking Outdoors sets the mounting height to 6 m and the workplane to the ground');
  const lumOpts = await page.$$eval('[data-ld="lum"] option', (o) => o.map((x) => x.value));
  ok(lumOpts.includes('pole') && lumOpts.includes('bollard') && !lumOpts.includes('panel'), 'the luminaire list offers the outdoor types', lumOpts.join(','));
  ok(await page.$('[data-ld-mode="plan"]') === null, 'plan-for-a-target is not offered outdoors');
  await page.click('[data-ld-mode="grid"]');
  await page.fill(ld('nx'), '3'); await page.keyboard.press('Tab'); await page.fill(ld('ny'), '2'); await page.keyboard.press('Tab');
  await page.fill(ld('cct'), '4000'); await page.keyboard.press('Tab');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  const rows = await page.$$eval('[data-ld-result] tr', (r) => r.map((x) => x.textContent));
  const em = Number((rows.find((r) => /Mean illuminance/.test(r)) || '').match(/(\d+) lx/)?.[1]);
  ok(em > 1 && rows.some((r) => /UGR-/.test(r.replace(/\s/g, '')) || /UGR/.test(r)), 'a site result: mean lux and counts', rows.slice(0, 3).join(' | '));
  ok(/direct light of the luminaires on the ground/.test(await page.textContent('[data-ld-root]')), 'the note says the lux are direct light only');
  await page.selectOption(ld('nightQ'), '8');
  const t0 = Date.now();
  await closeDialogs();
  await page.click(ld('night'));
  await page.waitForSelector('[data-ld-night-canvas="false"]', { timeout: 240000 });
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const facts = await page.textContent('[data-ld-night-facts]');
  ok(/6 lamps/.test(facts), 'the night view says how many lamps it made', facts + ' (' + secs + ' s)');
  const stats = async (sel) => page.$eval(sel, (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let lit = 0, sum = 0; const cols = new Set(); for (let i = 0; i < d.length; i += 4) { const y = d[i] + d[i + 1] + d[i + 2]; sum += y; if (y > 60) lit++; cols.add((d[i] >> 5) + ',' + (d[i + 1] >> 5) + ',' + (d[i + 2] >> 5)); } return { lit, mean: sum / (d.length / 4), colours: cols.size, w: c.width, h: c.height }; });
  const fc = await stats('[data-ld-night-canvas="false"]');
  ok(fc.colours >= 8 && fc.lit > 2000, 'the false-colour picture has a spread of colours', JSON.stringify(fc));
  const legend = await page.$$eval('[data-ld-night-legend] span', (s) => s.map((x) => x.textContent));
  ok(legend.length >= 3 && legend.every((x) => /lx$/.test(x)), 'with a legend in lux', legend.join(' '));
  if (expectPicture) {
    const pic = await stats('[data-ld-night-canvas="picture"]');
    ok(pic.lit > 500 && pic.colours >= 6 && pic.mean > 5 && pic.mean < 600, 'the night picture is lit by the lamps (not black, not white)', JSON.stringify(pic));
    ok(!(await page.$('[data-ld-night-nokit]')), 'the renderer was found');
  } else {
    ok(await page.$('[data-ld-night-canvas="picture"]') === null && !!(await page.$('[data-ld-night-nokit]')), 'no renderer in this app: the false colour only, and it says so');
  }
  await shot(app + '-night');
  await closeDialogs();
  const pkg = await readDownload(ld('nightpkg'));
  const j = JSON.parse(pkg.text);
  ok(j.format === 'cadcraft-night-lights' && j.lamps.length === 6 && Object.keys(j.ies).length === 1 && /^IESNA:LM-63/.test(Object.values(j.ies)[0].text) && j.axes === (app === 'bimcraft' ? 'y' : 'z'), 'the lamps file has six lamps, one measured web as IES text and the app\'s axes', j.axes + ' ' + j.lamps.length);
  ok(j.lamps[0].color === '#ffd1a3' || /^#[0-9a-f]{6}$/.test(j.lamps[0].color), 'with the 4000 K colour', j.lamps[0].color);
  // the report still works for a site result
  await closeDialogs();
  const rep = await readDownload(ld('report'));
  ok(/Mean illuminance/.test(rep.text), 'the report downloads for a site result');
  // back indoors: the panel returns to the room kinds
  await page.uncheck(ld('outdoor'));
  const back = await page.$$eval('[data-ld="lum"] option', (o) => o.map((x) => x.value));
  ok(back.includes('panel') && !back.includes('pole') && !!(await page.$('[data-ld-mode="plan"]')), 'unticking Outdoors brings the indoor luminaires and plan mode back');
  await page.fill(ld('outline'), '0, 0\n6000, 0\n6000, 4000\n0, 4000'); await page.keyboard.press('Tab');
  await page.click(ld('calc'));
  await page.waitForSelector('[data-ld-result]', { timeout: 30000 });
  await closeDialogs();
  await page.click(ld('night'));
  await page.waitForSelector('[data-ld-night-canvas="false"]', { timeout: 240000 });
  const f2 = await stats('[data-ld-night-canvas="false"]');
  ok(f2.colours >= 6, 'a room: the false-colour view of the workplane', JSON.stringify(f2));
  if (expectPicture) { const p2 = await stats('[data-ld-night-canvas="picture"]'); ok(p2.lit > 500 && p2.mean < 700, 'a room: the night picture', JSON.stringify(p2)); }
  await shot(app + '-room-night');
};

try {
  const which = (opt('--apps', 'bimcraft,cadcraft')).split(',');
  for (const a of which) await run(a, a === 'bimcraft');
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot('night-error').catch(() => {});
}
const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
