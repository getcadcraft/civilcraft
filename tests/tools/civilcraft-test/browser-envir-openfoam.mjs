#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-envir-openfoam.mjs — 0.9 SU.1119, rule 49: the wind-openfoam add-on in the real page (https://getcadcraft.com/lab/civilcraft). The add-on is switched on, the helper
 * program (the runner on 127.0.0.1:8765) is STUBBED with a canned answer, so no OpenFOAM is needed: engine select, helper check, run, map and tables, validation label, CSV.
 *   node tools/civilcraft-test/browser-envir-openfoam.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-envir-openfoam'); })();
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
function epwText() {
  const head = ['LOCATION,Testville,XX,TST,synthetic,0,40,-105,-7,1600', 'DESIGN CONDITIONS,0', 'TYPICAL/EXTREME PERIODS,0', 'GROUND TEMPERATURES,0', 'HOLIDAYS/DAYLIGHT SAVINGS,No,0,0,0', 'COMMENTS 1,x', 'COMMENTS 2,x', 'DATA PERIODS,1,1,Data,Sunday, 1/ 1,12/31'];
  const dm = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], rows = [];
  for (let m = 1; m <= 12; m++) for (let d = 1; d <= dm[m - 1]; d++) for (let h = 1; h <= 24; h++) {
    const c = new Array(35).fill('0'); const sun = h >= 8 && h <= 17;
    c[0] = '2005'; c[1] = m; c[2] = d; c[3] = h; c[4] = 60; c[6] = 25; c[7] = 10; c[8] = 40; c[9] = 83000; c[12] = 350; c[13] = sun ? 600 : 0; c[14] = sun ? 700 : 0; c[15] = sun ? 80 : 0; c[20] = 90; c[21] = 2;
    rows.push(c.join(','));
  }
  return head.concat(rows).join('\n');
}

try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-addons:civilcraft', JSON.stringify({ off: {}, on: { 'wind-openfoam': true } })); } catch { /* blocked */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  // the stubbed helper: CORS preflight, health, job, job status with a canned cc-samples.json computed from the probe points the page posted
  const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'x-cc-token, content-type', 'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS' };
  const posted = []; let tokenSeen = '';
  await page.route('http://127.0.0.1:8765/**', async (route) => {
    const req = route.request(), u = new URL(req.url());
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers: CORS });
    tokenSeen = req.headers()['x-cc-token'] || tokenSeen;
    const json = (o) => route.fulfill({ status: 200, headers: { ...CORS, 'content-type': 'application/json' }, body: JSON.stringify(o) });
    if (u.pathname === '/health') return json({ ok: true, runner: 1, foam: 'Build: v1912 (stub)' });
    if (u.pathname === '/job' && req.method() === 'POST') { posted.push(JSON.parse(req.postData())); return json({ ok: true, id: '0123456789abcdef' }); }
    if (u.pathname === '/job/0123456789abcdef') {
      const job = posted[posted.length - 1], pts = JSON.parse(job.files['cc-probes.json']);
      return json({ ok: true, state: 'done', files: { 'cc-samples.json': JSON.stringify({ time: 400, n: pts.length, cells: 54321, U: pts.map((p) => (p[1] > 0 ? [50, 0, 0] : [4, 0, 0])), p: pts.map(() => 0) }) }, log: '' });
    }
    return route.fulfill({ status: 404, headers: CORS, body: '{}' });
  });
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.command);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const b = await page.evaluate(() => window.civilcraft.project.eg().surface.stats().bounds);
  const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
  const u = await page.evaluate(() => window.civilcraft.project.state.units);
  const k = u === 'm' ? 1 : 3937 / 1200;
  await page.evaluate(([x, y, k]) => window.civilcraft.project.change('mass', (s) => { (s.masses ||= []).push({ id: 'm1', name: 'Block', pts: [{ x, y }, { x: x + 20 * k, y }, { x: x + 20 * k, y: y + 20 * k }, { x, y: y + 20 * k }], floors: 8, floorHeight: 3.5 }); }), [cx, cy, k]);
  await page.evaluate(() => window.civilcraft.command('mass'));
  await page.waitForSelector('[data-env-head]');
  await page.waitForSelector('[data-env-wind-engine] option[value="openfoam"]', { state: 'attached', timeout: 20000 }).catch(() => {});
  ok(!!(await page.$('[data-env-wind-engine] option[value="openfoam"]')), 'the OpenFOAM add-on is on and its engine is in the Environment engine select');
  fs.writeFileSync(path.join(OUT, 'test.epw'), epwText());
  await page.setInputFiles('[data-env-epw]', path.join(OUT, 'test.epw'));
  await page.waitForFunction(() => /Testville/.test(document.querySelector('[data-env-epw-note]')?.textContent || ''), null, { timeout: 15000 });
  await page.selectOption('[data-env-wind-engine]', 'openfoam');
  await page.waitForSelector('[data-env-wind-field="token"]');
  ok(/not been validated|not validated/i.test(await page.$eval('[data-env-wind]', (n) => n.textContent)), 'the OpenFOAM engine says plainly that it is not validated');
  ok(/OpenFOAM installation|your own OpenFOAM/i.test(await page.$eval('[data-env-wind]', (n) => n.textContent)), 'the note says it uses your own OpenFOAM installation');
  await page.fill('[data-env-wind-field="token"]', 'tok123'); await page.dispatchEvent('[data-env-wind-field="token"]', 'change');
  await page.click('[data-env-wind-check]');
  await page.waitForSelector('[data-env-wind-checked]');
  ok(/OpenFOAM: .*v1912/.test(await page.$eval('[data-env-wind-checked]', (n) => n.textContent)), 'Check the helper reaches the (stub) helper and shows the OpenFOAM version');
  await page.selectOption('[data-env-wind-sectors]', '4');
  await page.click('[data-env-wind-run]');
  await page.waitForSelector('[data-env-wind-map]', { timeout: 90000 });
  ok(tokenSeen === 'tok123', 'the token the person typed is sent to the helper');
  ok(posted.length === 1 && /atmBoundaryLayerInletVelocity/.test(posted[0].files['0/U']) && /buildings\.stl/.test(Object.keys(posted[0].files).join()), 'one case was posted: ABL inlet and the buildings STL (' + posted.length + ')');
  ok(posted[0].steps.map((s) => s.cmd).join() === 'blockMesh,snappyHexMesh,checkMesh,simpleFoam,cc-sample', 'the steps are the OpenFOAM tools plus the built-in sampler');
  const rows = await page.$$eval('[data-env-wind-table] tbody tr', (r) => r.length);
  ok(rows === 5, 'the Lawson table lists five classes');
  ok((await page.$$eval('[data-env-wind-nen] tbody tr', (r) => r.length)) === 5, 'the NEN 8100 table lists five grades');
  const colours = await page.$eval('[data-env-wind-map]', (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; const s = new Set(); for (let i = 0; i < d.length; i += 4) s.add(d[i] + ',' + d[i + 1] + ',' + d[i + 2]); return s.size; });
  ok(colours > 2, 'the comfort map has several colours (' + colours + ')');
  ok(/not been validated|not validated/i.test(await page.$eval('[data-env-wind]', (n) => n.textContent)), 'the validation label stays above the results');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-env-wind-csv]')]);
  const csv = fs.readFileSync(await dl.path(), 'utf8'); ok(csv.split('\n').length > 20 && /OpenFOAM engine/.test(csv), 'the CSV downloads and carries the OpenFOAM validation line');
  await page.screenshot({ path: path.join(OUT, 'envir-openfoam.png'), fullPage: false });
  // the built-in engine is still there and still gated
  await page.selectOption('[data-env-wind-engine]', 'builtin');
  ok(!(await page.$('[data-env-wind-run]')), 'back on the built-in engine the run button is hidden again until the Experimental tick');
} catch (e) { fail++; console.log('  FAIL threw: ' + (e.stack || e)); }
await browser.close();
const real = problems.filter((p) => !/favicon|net::ERR|Failed to load resource/.test(p));
ok(real.length === 0, 'no console errors', real.slice(0, 4));
console.log(`browser-envir-openfoam: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
