#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-scanprogress.mjs — Compare the scan with the model (0.8 EG.39), session bim-analysis_PART_4, in the lab: headless, real clicks.
 *   node tools/bimcraft-test/browser-people.mjs [--shots <dir>]
 * Run as root: a session minted for its own test admin. Fails on any console error. Opens the showcase house.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimscanprog'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { localStorage.setItem('bimcraft.model.units', 'm'); } catch (e) { /* none */ } });   // GH.3-A: results follow the display unit; these checks read metres
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const status = () => page.textContent('[data-status]');

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', HOUSE);
  await waitStatus(/^Opened /, 90000);
  ok(await page.locator('[data-scanprog-sec]').isHidden(), 'the panel is hidden until a point cloud is open');
  // a scan made from the model's own element boxes (viewer space, y up): 70 % of the elements get points on their surfaces, the rest are left out
  const boxes = await page.evaluate(() => { const ix = window.bimcraftColor.index(); return null; }).catch(() => null);
  // open an empty-ish cloud first (one point at the origin) to mount the panel and the API
  fs.mkdirSync(path.join(REPO, 'tmp/eg-a'), { recursive: true });
  const seed = path.join(REPO, 'tmp/eg-a/seed.xyz');
  fs.writeFileSync(seed, '0 0 0\n1 0 0\n0 1 0\n');
  await page.setInputFiles('[data-cloud-input]', seed);
  await page.waitForFunction(() => window.bimcraftScanProgress, null, { timeout: 30000 }).catch((e) => { console.log('PROBLEMS', problems.slice(0, 5)); throw e; });
  await page.waitForTimeout(800);
  const bx = await page.evaluate(() => [...window.bimcraftScanProgress.boxes()].map(([k, b]) => [k, b.min, b.max]));
  ok(bx.length > 20, 'the house gives ' + bx.length + ' element boxes in viewer space');
  // where the model's own coordinates land in the viewer: read it from the seed cloud (v = M * (m - origin)), then go back for the scan
  const T = await page.evaluate(() => { const L = window.bimcraftCloud.layer(); L.points.updateMatrixWorld(true); return { M: [...L.points.matrixWorld.elements], o: L.cloud.origin }; });
  const toModel = (v) => { const M = T.M, d = [v[0] - M[12], v[1] - M[13], v[2] - M[14]];   // rotation part is orthonormal: its inverse is the transpose
    return [0, 1, 2].map((c) => M[c * 4] * d[0] + M[c * 4 + 1] * d[1] + M[c * 4 + 2] * d[2] + T.o[c]); };
  let seedN = 11; const rnd = () => ((seedN = (seedN * 1664525 + 1013904223) >>> 0) / 4294967296);
  const lines = []; const built = new Set();
  bx.forEach(([k, mn, mx], i) => {
    if (i % 10 >= 7) return;   // 30 % never scanned
    built.add(k);
    const sz = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]];
    for (let f = 0; f < 3; f++) for (let s = 0; s < 2; s++) {
      const area = sz[(f + 1) % 3] * sz[(f + 2) % 3]; const n = Math.max(30, Math.min(600, Math.round(area * 300)));
      for (let j = 0; j < n; j++) { const p = [0, 0, 0]; p[f] = s ? mx[f] : mn[f]; p[(f + 1) % 3] = mn[(f + 1) % 3] + rnd() * sz[(f + 1) % 3]; p[(f + 2) % 3] = mn[(f + 2) % 3] + rnd() * sz[(f + 2) % 3];
        for (let c = 0; c < 3; c++) p[c] += (rnd() - 0.5) * 0.01;
        const m = toModel(p); lines.push(`${m[0].toFixed(4)} ${m[1].toFixed(4)} ${m[2].toFixed(4)}`); }
    }
  });
  const cloud = path.join(REPO, 'tmp/eg-a/house-scan.xyz');
  fs.writeFileSync(cloud, lines.join('\n') + '\n');
  await page.evaluate(() => window.bimcraftCloud.remove?.());
  await page.setInputFiles('[data-cloud-input]', cloud);
  await page.waitForFunction(() => window.bimcraftCloud?.has?.(), null, { timeout: 60000 });
  await page.waitForTimeout(1500);
  ok(await page.locator('[data-scanprog-sec]').isVisible(), 'the panel shows while a cloud is open');
  await page.evaluate(() => { document.querySelector('[data-scanprog-details]').open = true; });
  await page.click('[data-sp-run]');
  await page.waitForSelector('[data-sp-table]', { timeout: 60000 });
  const res = await page.evaluate(() => { const r = window.bimcraftScanProgress.last(); return { t: r.totals, rows: r.rows.map((x) => [x.key, x.state]) }; });
  const gotBuilt = res.rows.filter((r) => built.has(r[0]) && r[1] === 'built').length;
  ok(gotBuilt >= built.size * 0.85, gotBuilt + ' of the ' + built.size + ' scanned elements read as built', JSON.stringify(res.t));
  const wrong = res.rows.filter((r) => !built.has(r[0]) && r[1] === 'built').length;
  ok(wrong < res.rows.length - built.size, wrong + ' of the ' + (res.rows.length - built.size) + ' unscanned elements read as built: an element hidden against a scanned one shares its surface (said in the panel)');
  ok(/built/.test(await page.textContent('[data-sp-sum]')), 'the summary line: ' + (await page.textContent('[data-sp-sum]')).slice(0, 110));
  ok(await page.locator('[data-sp-row]').count() > 0, 'a row per element in the table');
  await page.selectOption('[data-sp-filter]', 'missing');
  const miss = await page.locator('[data-sp-row]').count();
  ok(miss === res.t.missing || miss === Math.min(300, res.t.missing), 'the Missing filter lists the ' + res.t.missing + ' missing elements (' + miss + ')');
  if (miss) { await page.locator('[data-sp-row]').first().click(); await page.waitForTimeout(300); ok(true, 'a click selects the element'); }
  await page.click('[data-sp-color]');
  ok(await page.locator('[data-sp-color]').textContent().then((t) => /Own colours/.test(t)), 'Colour the model switched on');
  // a 4D schedule: every wall and slab is due by 2026-01-10; on 2026-01-20 the scan should show them all
  await page.evaluate(() => window.bimcraftFourD.open('plan.csv', 'Task,Start,Finish,Field,Value\nWalls,2026-01-01,2026-01-05,Class,IfcWall\nSlabs,2026-01-06,2026-01-10,Class,IfcSlab\nRoof,2026-03-01,2026-03-10,Class,IfcRoof\n'));
  await page.waitForFunction(() => window.bimcraftFourD.tasks()?.length === 3, null, { timeout: 15000 });
  await page.evaluate(() => window.bimcraftFourD.day(Math.floor(Date.UTC(2026, 0, 20) / 86400000)));
  await page.click('[data-sp-run]');
  await page.waitForSelector('[data-sp-plan]', { timeout: 30000 });
  const plan = await page.evaluate(() => window.bimcraftScanProgress.last().plan);
  ok(plan && plan.scheduled > 0 && plan.expectedBuilt > 0, 'with a 4D schedule the result says how many are scheduled and due: ' + JSON.stringify(plan));
  const flagged = await page.evaluate(() => window.bimcraftScanProgress.last().rows.filter((r) => r.flag === 'behind').length);
  ok(flagged === plan.behind, flagged + ' elements flagged behind the schedule, as counted');
  ok(/2026-01-20/.test(await page.textContent('[data-sp-plan]')), 'the line names the 4D day: ' + (await page.textContent('[data-sp-plan]')).slice(0, 90));
  const pr = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => p.code === 'scanprog.behind').length : -1));
  ok(pr === -1 || pr === plan.behind, 'each element behind the schedule is in the shell\'s Problems (' + pr + ')');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-sp-csv]')]);
  const f = path.join(REPO, 'tmp/eg-a/sp.csv'); await dl.saveAs(f);
  ok(/^"element","state"/.test(fs.readFileSync(f, 'utf8')), 'the CSV has a row per element');
  await shot(page, 'scan-progress');
  await page.evaluate(() => window.bimcraftScanProgress.clear());
  ok(await page.locator('[data-sp-sum]').count() === 0, 'Clear empties the result');
} finally { await browser.close(); }
ok(!problems.length, 'no console errors', problems.slice(0, 3).join(' | '));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
