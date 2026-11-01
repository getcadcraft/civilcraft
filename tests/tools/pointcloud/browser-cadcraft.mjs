#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cadcraft.mjs — a point cloud under a CadCraft drawing (0.5 SG.1), headless, with real clicks and typing.
 *   node tools/pointcloud/browser-cadcraft.mjs [--shots <dir>]
 * Run as root: a session minted for its own CadCraft test admin (tools/cadcraft-test/admin.php session pointcloud), the cached
 * Playwright Chromium, fixtures from tools/pointcloud/fixtures.py (laspy). Fails on any console error.
 *
 *   open       the scanned room (LAS, UTM 14N) opened like a drawing: attached at its own coordinates, zoomed to it, drawn
 *              under the linework (pixels counted); nothing of the reader loaded before
 *   slice      POINTCLOUD › Slice: the plan cut at 1.2 m (fewer pixels); LINE by Node snap on two corners of the column →
 *              exactly 0.4 m along the column's face; Color › Class
 *   3D         the 3D tab shows the cloud (its box), with the slice; back to the Model tab
 *   handoff    BimCraft's "Trace in CadCraft": a new CadCraft tab opens with the cloud attached
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/pointcloud-cadcraft');
fs.mkdirSync(SHOTS, { recursive: true });
const FX = fs.mkdtempSync('/tmp/pc-browser-cad-');
const PY = path.join(REPO, 'tools/civilcraft-test/venv/bin/python');
execFileSync(PY, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'make', FX]);
// 0.6 PF: PTX + E57 fixtures need the corpus venv (outside every repo); skipped without it
const PY2 = path.resolve(REPO, '../testfiles/pointcloud-corpus/venv/bin/python');
const FMT = fs.existsSync(PY2);
if (FMT) { execFileSync(PY2, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'formats', path.join(FX, 'formats')]); execFileSync(PY2, [path.join(REPO, 'tools/pointcloud/fixtures.py'), 'e57', path.join(FX, 'e57')]); }

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const shot = async (page, name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
// a session minted in-process for this test's own account (cctest+cadcraft-pointcloud): no login, so the shared
// admin-login throttle (10 / 10 min) is never touched; disabled again at the end
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'pointcloud'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
const watch = (p, tag) => { p.on('console', (m) => { if (m.type() === 'error') problems.push(tag + ' console: ' + m.text()); }); p.on('pageerror', (e) => problems.push(tag + ' pageerror: ' + e.message)); };
const page = await ctx.newPage();
watch(page, 'cadcraft');

const history = () => page.textContent('[data-history]');
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(120); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const waitHist = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-history]')?.textContent || ''), re.source, { timeout });
/** Base-canvas colours, so a picture can be compared with the empty drawing's. */
const colours = () => page.evaluate(() => {
  const c = window.cadcraft.view.base, d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, m = {};
  for (let i = 0; i < d.length; i += 4) { const k = d[i] + ',' + d[i + 1] + ',' + d[i + 2]; m[k] = (m[k] || 0) + 1; }
  return { m, n: d.length / 4 };
});
/** Share of the view in colours the empty drawing does not have (the cloud). */
const newShare = (empty, now) => Object.entries(now.m).filter(([k]) => !(k in empty.m)).reduce((a, [, v]) => a + v, 0) / now.n;

try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  if ((await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) !== 'true') await page.click('[data-toggle="osnap"]');
  await page.evaluate(() => { window.cadcraft.doc.meta.units = 'meters'; });

  console.log('== open');
  const before = await page.evaluate(() => performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /laz-perf|pointcloud|\/las\.js|crs-db/.test(n)).length);
  ok(before === 0, 'nothing of the cloud reader loads with the app');
  const empty = await colours();
  await page.setInputFiles('[data-file]', path.join(FX, 'room-f2-12.las'));
  await waitHist(/showing 44,393 of 44,393 points/);
  const st = await page.evaluate(() => { const pc = window.cadcraft.host.cloud; return { has: pc.has(), insert: pc.insert, bb: pc.bbox(), vr: window.cadcraft.view.viewRect?.() }; });
  ok(st.has && !st.insert && Math.abs(st.bb.minX - 620000) < 1e-6, 'opened like a drawing: attached at its own coordinates (UTM)', JSON.stringify(st.bb));
  ok(/POINTCLOUD \(PC\): Slice/.test(await history()), 'the command line says what to do next');
  ok(/starts as a plan cut 1\.2 above/.test(await history()) && (await page.evaluate(() => window.cadcraft.host.cloud.slice.on)), 'a building-size scan starts as a plan cut at 1.2 m (said)');
  await page.waitForTimeout(150);
  const sl = newShare(empty, await colours());
  ok(sl > 0.003, `the cut is drawn under the drawing: ${(sl * 100).toFixed(2)} % of the view in the walls' colours`);
  await shot(page, '01-open-slice');

  console.log('== slice');
  await typeCmd('PC'); await typeCmd('S'); await typeCmd('C'); await typeCmd('H'); await typeCmd('');
  await page.waitForTimeout(150);
  const all = newShare(empty, await colours());
  ok(all > sl * 5 && all > 0.05, `Slice off, colour by height: every point, seen from above (${(all * 100).toFixed(1)} % of the view)`);
  await shot(page, '02-all-height');
  await typeCmd('PC'); await typeCmd('S'); await typeCmd('C'); await typeCmd('F'); await typeCmd('');
  // zoom in on the column and trace one face of it by Node snap
  await page.evaluate(() => { window.cadcraft.host.zoomWindow({ x: 620003.6, y: 3349001.7 }, { x: 620004.8, y: 3349002.7 }, { exact: true }); });
  await page.waitForTimeout(200);
  await typeCmd('L');
  const a = await screen(620004.0, 3349002.0), b = await screen(620004.4, 3349002.0);
  await page.mouse.move(a.x + 4, a.y - 3); await page.waitForTimeout(80);
  const snap = await page.evaluate(() => window.cadcraft.view.state.snap);
  ok(snap && snap.kind === 'node' && snap.label === 'Point cloud', 'Node snap marks a cloud point under the cursor ("Point cloud")', JSON.stringify(snap));
  await page.mouse.click(a.x + 4, a.y - 3);
  await page.mouse.move(b.x - 3, b.y + 4); await page.waitForTimeout(80);
  await page.mouse.click(b.x - 3, b.y + 4);
  await typeCmd('');
  const line = await page.evaluate(() => window.cadcraft.doc.all().find((e) => e.type === 'line'));
  ok(line && Math.abs(line.x1 - 620004) < 1e-6 && Math.abs(line.y1 - 3349002) < 1e-6 && Math.abs(Math.hypot(line.x2 - line.x1, line.y2 - line.y1) - 0.4) < 1e-6, 'LINE traced on two snapped column corners: exactly 0.4 m along its face', JSON.stringify(line));
  await shot(page, '03-traced');
  await typeCmd('PC'); await typeCmd('C'); await typeCmd('C'); await typeCmd('');
  ok((await page.evaluate(() => window.cadcraft.host.cloud.color)) === 'class', 'Color › Class');
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await page.evaluate(() => window.cadcraft.view.theme?.());
  await page.evaluate(() => window.cadcraft.view.invalidate(true));
  await page.waitForTimeout(250);
  await shot(page, '04-model-theme');
  await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; window.cadcraft.view.theme?.(); window.cadcraft.view.invalidate(true); });

  console.log('== 3D');
  await page.evaluate(() => window.cadcraft.host.open3d());
  await page.waitForFunction(() => !!window.cadcraft.host.ws3d?.cloud3d?.()?.points, null, { timeout: 30000 });
  const b3 = await page.evaluate(() => { const ws = window.cadcraft.host.ws3d, L = ws.cloud3d(); const b = L.box(); return { min: b.min.toArray(), max: b.max.toArray(), slice: L.uniforms.uSliceHalf.value }; });
  ok(Math.abs(b3.min[2]) < 1e-6 && Math.abs(b3.max[2] - 3) < 1e-6 && Math.abs(b3.min[0] - 620000) < 1e-3, '3D tab: the cloud in metres at its own place, its lowest point on the ground', JSON.stringify(b3));
  ok(Math.abs(b3.slice - 0.05) < 1e-9, '… with the Model tab\'s slice');
  await page.evaluate(() => window.cadcraft.host.ws3d.fit?.());
  await page.waitForTimeout(400);
  await shot(page, '05-3d');
  await typeCmd('PC'); await typeCmd('S'); await typeCmd('');
  await page.waitForTimeout(200);
  ok((await page.evaluate(() => window.cadcraft.host.ws3d.cloud3d().uniforms.uSliceHalf.value)) < 0, 'slice off on the 3D tab too');
  await shot(page, '06-3d-all');

  console.log('== handoff from BimCraft');
  const bp = await ctx.newPage();
  watch(bp, 'bimcraft');
  await bp.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await bp.setInputFiles('[data-file]', path.join(FX, 'room-f3-12.laz'));
  await bp.waitForFunction(() => /showing 44,393/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  if (await bp.isVisible('[data-cloud-trace]')) {
    const [np] = await Promise.all([ctx.waitForEvent('page'), bp.click('[data-cloud-trace]')]);
    watch(np, 'cadcraft (handed over)');
    await np.waitForFunction(() => window.cadcraft?.host?.cloud?.has(), null, { timeout: 60000 });
    const h = await np.evaluate(() => ({ name: window.cadcraft.host.cloud.cloud.name, n: window.cadcraft.host.cloud.cloud.n, url: location.search }));
    ok(h.name === 'room-f3-12.laz' && h.n === 44393 && !/handoff/.test(h.url), 'Trace in CadCraft: a new CadCraft tab with the cloud attached (' + h.name + ')');
    await np.screenshot({ path: path.join(SHOTS, '07-handed-over.png') });
    await np.close();
  } else ok(false, 'BimCraft offers Trace in CadCraft (CadCraft takes hand-overs in the lab)');
  await bp.close();

  await typeCmd('PC'); await typeCmd('D');
  ok(!(await page.evaluate(() => window.cadcraft.host.cloud.has())), 'PC › Detach');

  if (FMT) {
    console.log('== formats (0.6 PF.1–PF.3): opened like a drawing');
    await page.setInputFiles('[data-file]', path.join(FX, 'e57', 'posed-two-scans.e57'));
    await waitHist(/posed-two-scans\.e57: showing 3,000 of 3,000 points/);
    ok(/2 scans, each placed by its pose/.test(await history()) && (await page.evaluate(() => window.cadcraft.host.cloud.cloud.unit)) === 'm', 'an E57 (web-e57 in its Worker): 3,000 points of two posed scans, meters, said');
    await shot(page, '08-e57');
    await page.setInputFiles('[data-file]', path.join(FX, 'formats', 'room-two-scans.ptx'));
    await waitHist(/room-two-scans\.ptx: showing 43,507 of 43,507 points/);
    ok(Math.abs((await page.evaluate(() => window.cadcraft.host.cloud.bbox().minX)) - 620000) < 0.01, 'a two-scan PTX: attached at its registered coordinates (UTM, each scan through its transform)');
    await page.setInputFiles('[data-file]', { name: 'scan001.fls', mimeType: 'application/octet-stream', buffer: Buffer.alloc(256) });
    await waitHist(/can’t be opened here/);
    const h = await history();
    ok(/scan001\.fls is a FARO scan file/.test(h) && /FARO SCENE/.test(h) && /point cloud formats/.test(h) && (await page.evaluate(() => window.cadcraft.host.cloud.cloud.name)) === 'room-two-scans.ptx', 'an FLS: what it is, where to export it, where the help is; the cloud attached before stays');
    await shot(page, '09-native');
  }
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  await shot(page, 'zz-failure').catch(() => {});
} finally {
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'pointcloud']);
  fs.rmSync(FX, { recursive: true, force: true });
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(fail ? '\n' + fail + ' FAILED, ' + pass + ' passed' : '\nall ' + pass + ' browser checks passed (shots: ' + SHOTS + ')');
process.exit(fail ? 1 : 0);
