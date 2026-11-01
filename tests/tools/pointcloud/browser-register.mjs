#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-register.mjs — "Register scans" in BimCraft's and CadCraft's lab builds (0.7 LC.3, session `scans`), headless, with real
 * clicks. Run as root (a session minted for its own test admin, tools/cadcraft-test/admin.php session scans, disabled at the end).
 *   node tools/pointcloud/browser-register.mjs [--shots <dir>] [--app bimcraft|cadcraft]
 * Scans: testfiles/generated/pointcloud-register/ (room-scan-a.las, room-scan-b.las, truth.json; tools/pointcloud/mkscans.mjs).
 * Steps (each app): open the dialog (BimCraft: Show › Register scans; CadCraft: the REGISTERSCANS command), add both scans through
 * the dialog's file input, pick four pairs on the Plan picture with real clicks, Place by pairs (residuals shown), Refine (ICP)
 * with its table, Stop on a second run, Undo, Save project (download), Export LAS and E57 (downloads, sizes), Show registered cloud
 * (the app opens it). Checks B against truth.json after each step and fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SCANS = process.env.POINTCLOUD_REGISTER || path.resolve(REPO, '../testfiles/generated/pointcloud-register');
if (!fs.existsSync(path.join(SCANS, 'truth.json'))) { console.log('skip: ' + SCANS + ' is missing (node tools/pointcloud/mkscans.mjs)'); process.exit(0); }
const arg = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots') || path.join(REPO, 'tmp/shots/register');
const ONLY = arg('--app');
fs.mkdirSync(SHOTS, { recursive: true });
const truth = JSON.parse(fs.readFileSync(path.join(SCANS, 'truth.json'), 'utf8'));
const { loadPointCloudEnv } = await import('./node-env.mjs');
const { R } = await loadPointCloudEnv();
const back = R.inv4(truth.applied);

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'scans'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];

async function run(app) {
  console.log('== ' + app);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(app + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
  await page.goto(BASE + '/lab/' + app + '?space=paper', { waitUntil: 'networkidle' });
  const api = app === 'bimcraft' ? 'window.bimcraftRegister' : 'window.cadcraft.host.registerUi';
  if (app === 'cadcraft') {
    await page.waitForFunction(() => !!window.cadcraft);
    const before = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /register|scan-export/.test(n)).length);
    ok(before === 0, 'nothing of the registration code loads before it is asked for');
    await page.click('[data-cmd-input]'); await page.keyboard.type('REGISTERSCANS'); await page.keyboard.press('Enter');
  } else {
    const before = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /register|scan-export/.test(n)).length);
    ok(before === 0, 'nothing of the registration code loads before it is asked for');
    await page.click('.bc-left [data-cloud-register]');   // the start panel's button (the Show menu has one too, once a model is open)
  }
  await page.waitForSelector('[data-register][open]');
  ok(true, 'the dialog opens');
  await page.setInputFiles('[data-reg-input]', [path.join(SCANS, 'room-scan-a.las'), path.join(SCANS, 'room-scan-b.las')]);
  await page.waitForFunction((a) => eval(a).session().scans.length === 2, api, { timeout: 60000 });
  ok((await page.locator('[data-reg-scans] li').count()) === 2, 'both scans are listed');
  await page.selectOption('[data-reg-moving]', '1');
  await page.selectOption('[data-reg-against]', '0');
  await page.screenshot({ path: path.join(SHOTS, app + '-01-added.png') });
  const err = (M) => page.evaluate(([a, M, back]) => {
    const s = eval(a).session(), c = s.scans[1].cloud; let w = 0;
    const ap = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
    for (let i = 0; i < c.n; i += 311) { const p = [c.pos[i * 3] + c.origin[0], c.pos[i * 3 + 1] + c.origin[1], c.pos[i * 3 + 2] + c.origin[2]], x = ap(s.scans[1].M, p), y = ap(back, p); w = Math.max(w, Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2])); }
    return w;
  }, [api, null, back]);
  const e0 = await err();
  ok(e0 > 1, `B starts ${e0.toFixed(2)} m from where it belongs`);

  // four pairs by real clicks on the Plan picture: ceiling points of B spread apart, each matched to A's ceiling point nearest the truth
  const picks = await page.evaluate(([a, back]) => {
    const r = eval(a), s = r.session(), B = s.scans[1], O = s.origin;
    const loc = s.local(1);
    const want = [(p) => p[0] + p[1], (p) => p[0] - p[1], (p) => -p[0] + p[1], (p) => -p[0] - p[1]];
    const n = r.debug.shownCount(1), out = [];
    let top = -Infinity; for (let k = 0; k < n; k++) top = Math.max(top, r.debug.screenOf(1, k).world[2]);
    for (const f of want) {
      let best = -1, bv = -Infinity;
      for (let k = 0; k < n; k++) { const w = r.debug.screenOf(1, k).world; if (w[2] > top - 0.05 && f(w) > bv) { bv = f(w); best = k; } }
      const b = r.debug.screenOf(1, best), abs = [b.world[0] + O[0], b.world[1] + O[1], b.world[2] + O[2]];
      const t = [back[0] * abs[0] + back[1] * abs[1] + back[2] * abs[2] + back[3], back[4] * abs[0] + back[5] * abs[1] + back[6] * abs[2] + back[7], back[8] * abs[0] + back[9] * abs[1] + back[10] * abs[2] + back[11]];
      const ka = r.debug.nearest(0, [t[0] - O[0], t[1] - O[1], t[2] - O[2]]);
      out.push({ b: { x: b.x, y: b.y }, a: { x: r.debug.screenOf(0, ka).x, y: r.debug.screenOf(0, ka).y } });
    }
    return out;
  }, [api, back]);
  for (const [k, p] of picks.entries()) {
    await page.click('[data-reg-pick]');
    await page.mouse.click(p.b.x, p.b.y);
    ok(/same place on another scan/.test(await page.textContent('[data-reg-msg]')), `pair ${k + 1}: the first click asks for the same place on another scan`);
    await page.mouse.click(p.a.x, p.a.y);
  }
  ok((await page.locator('[data-reg-pairs] tr').count()) === 4, 'four pairs in the table');
  await page.screenshot({ path: path.join(SHOTS, app + '-02-pairs.png') });
  await page.click('[data-reg-place]');
  const msg = await page.textContent('[data-reg-msg]');
  ok(/Placed room-scan-b\.las from 4 pairs/.test(msg), 'Place by pairs says what it did: ' + msg);
  const resid = await page.locator('[data-reg-pairs] tr td:nth-child(4)').allTextContents();
  ok(resid.length === 4 && resid.every((v) => Number(v) >= 0 && Number(v) < 0.5), 'a residual per pair: ' + resid.join(', '));
  const e1 = await err();
  ok(e1 < 0.5 && e1 < e0, `the picks bring B within ${(e1 * 100).toFixed(1)} cm (from ${e0.toFixed(2)} m)`);

  await page.click('[data-reg-run]');
  await page.waitForFunction(() => !document.querySelector('[data-reg-run]').disabled, null, { timeout: 120000 });
  const rows = await page.locator('[data-reg-log] tr').count();
  ok(rows > 3, `ICP: ${rows} steps listed with their errors`);
  const e2 = await err();
  ok(e2 < 0.01, `after ICP B is within ${(e2 * 1000).toFixed(1)} mm of the truth`);
  await page.screenshot({ path: path.join(SHOTS, app + '-03-icp.png') });
  // Stop
  await page.click('[data-reg-undo]');
  const e3 = await err();
  ok(e3 > e2 && e3 < 0.5, 'Undo takes the whole ICP run back (' + (e3 * 100).toFixed(1) + ' cm)');
  await page.click('[data-reg-run]');
  await page.waitForFunction(() => document.querySelectorAll('[data-reg-log] tr').length >= 2);
  await page.click('[data-reg-stop]');
  await page.waitForFunction(() => !document.querySelector('[data-reg-run]').disabled, null, { timeout: 60000 });
  const stopMsg = await page.textContent('[data-reg-msg]');
  ok(/Stopped after \d+ steps|Refined/.test(stopMsg), 'Stop ends the run: ' + stopMsg);
  await page.click('[data-reg-run]');
  await page.waitForFunction(() => !document.querySelector('[data-reg-run]').disabled && /Refined/.test(document.querySelector('[data-reg-msg]').textContent), null, { timeout: 120000 });

  // project + exports
  const dl = async (sel) => { const [d] = await Promise.all([page.waitForEvent('download'), page.click(sel)]); const p = path.join('/tmp', 'reg-' + app + '-' + d.suggestedFilename()); await d.saveAs(p); const size = fs.statSync(p).size; return { name: d.suggestedFilename(), path: p, size }; };
  const proj = await dl('[data-reg-save]');
  const pj = JSON.parse(fs.readFileSync(proj.path, 'utf8'));
  ok(pj.format === 'cadcraft-scan-registration' && pj.scans.length === 2 && proj.size < 5000, `the project: ${proj.name}, ${proj.size} bytes, 2 scans, transforms and references only`);
  const las = await dl('[data-reg-las]');
  ok(las.name === 'registered.las' && las.size > 44393 * 26, `LAS: ${las.name}, ${las.size} bytes`);
  const e57 = await dl('[data-reg-e57]');
  ok(e57.name === 'registered.e57' && e57.size % 1024 === 0 && e57.size > 44393 * 27, `E57: ${e57.name}, ${e57.size} bytes`);
  fs.rmSync(proj.path); fs.rmSync(las.path); fs.rmSync(e57.path);
  await page.screenshot({ path: path.join(SHOTS, app + '-04-exported.png') });

  // the project comes back: remove B's placement, open the project
  await page.click('[data-reg-reset]');
  ok((await err()) > 1, 'Reset puts B back at its file coordinates');
  await page.setInputFiles('[data-reg-project]', { name: 'scans.ccscans.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(pj)) });
  await page.waitForFunction(() => /Placed 2 scans from the project/.test(document.querySelector('[data-reg-msg]').textContent));
  ok((await err()) < 0.01, 'Open project puts the scan back to within 10 mm');
  await page.setInputFiles('[data-reg-project]', { name: 'x.json', mimeType: 'application/json', buffer: Buffer.from('{"format":"nope"}') });
  await page.waitForFunction(() => /not a scan registration project/.test(document.querySelector('[data-reg-msg]').textContent));
  ok(true, 'a file that is not a project is refused in words');

  // the registered cloud in the app
  await page.click('[data-reg-show]');
  await page.waitForFunction(() => !document.querySelector('[data-register]').open, null, { timeout: 120000 });
  if (app === 'bimcraft') {
    await page.waitForFunction(() => window.bimcraftCloud?.has(), null, { timeout: 60000 });
    const st = await page.evaluate(() => window.bimcraftCloud.state());
    ok(st && st.kept === 44393 && st.name === 'registered.las', 'BimCraft shows the registered cloud: ' + st?.kept + ' points');
  } else {
    await page.waitForFunction(() => window.cadcraft.host.cloud.has(), null, { timeout: 60000 });
    const nm = await page.evaluate(() => window.cadcraft.host.cloud.cloud.name);
    ok(nm === 'registered.las', 'CadCraft attached the registered cloud under the drawing');
  }
  await page.screenshot({ path: path.join(SHOTS, app + '-05-shown.png') });
  await ctx.close();
}

try {
  for (const app of ['bimcraft', 'cadcraft']) if (!ONLY || ONLY === app) await run(app);
} catch (e) { fail++; console.log('  FAIL ' + (e.stack || e)); }
finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'scans'], { stdio: 'ignore' }); } catch (e) { /* the account is disabled at the end where it can be */ }
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
