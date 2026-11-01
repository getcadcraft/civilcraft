#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-massopt.mjs — 0.8 round 3 (civil_PART_3), EG.58: the Massing options window on the sample site (open BimCraft's options file, place one on a parcel,
 * the zoning answer, the envelope file back) at https://getcadcraft.com/lab/civilcraft.
 *   node tools/civilcraft-test/browser-massopt.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-massopt'); })();
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
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.command);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);

  const b = await page.evaluate(() => window.civilcraft.project.eg().surface.stats().bounds);
  const w = b.maxX - b.minX, h = b.maxY - b.minY;
  await page.evaluate(([x0, y0, x1, y1]) => window.civilcraft.project.change('parcel', (s) => { s.parcels.push({ id: 'r1', name: 'Lot 1', pts: [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }] }); s.zoning = [{ parcel: 'r1', front: 15, side: 15, rear: 15, frontCourse: 0, rearCourse: null, setbacks: {}, show: false, heightCap: 0, sky: null, far: 0, coverage: 0.25 }]; }), [b.minX + w * 0.1, b.minY + h * 0.1, b.maxX - w * 0.1, b.maxY - h * 0.1]);
  const opts = { format: 'cadcraft-massing-options', version: 1, units: 'mm', program: [{ name: 'Bedroom', count: 4, area_m2: 14, ground: false }], masses: [
    { key: 'bar', name: 'Bar', pts: [{ x: 0, y: 0 }, { x: 40000, y: 0 }, { x: 40000, y: 12000 }, { x: 0, y: 12000 }], floors: 3, floorHeight: 3000, use: 'Apartments' },
    { key: 'tower', name: 'Tower', pts: [{ x: 0, y: 0 }, { x: 20000, y: 0 }, { x: 20000, y: 20000 }, { x: 0, y: 20000 }], floors: 8, floorHeight: 3000, use: 'Apartments' }] };
  fs.writeFileSync(path.join(OUT, 'opts.json'), JSON.stringify(opts));
  await page.evaluate(() => window.civilcraft.command('mass-options')); await page.waitForSelector('[data-eg-dialog="cv-massopt"][open]');
  ok(!!(await page.$('[data-mo-open]')), 'the Massing options window opens');
  await page.setInputFiles('[data-mo-file]', path.join(OUT, 'opts.json'));
  await page.waitForSelector('[data-mo-table]');
  const rows = await page.$$eval('[data-mo-table] tbody tr', (r) => r.length);
  ok(rows === 2, 'both alternatives are listed', rows);
  await page.click('[data-mo-opt="bar"]');
  await page.click('[data-mo-place]');
  await page.waitForSelector('[data-mo-result]');
  const res = await page.$eval('[data-mo-result]', (n) => n.textContent);
  ok(/100\.0 %/.test(res), 'the bar sits fully inside the buildable area: ' + res.slice(0, 80));
  const chk = await page.$eval('[data-mo-check]', (n) => n.textContent);
  ok(/Setbacks: met/.test(chk) && /Lot coverage: (met|not met)/.test(chk), 'the zoning check answers: ' + chk.slice(0, 120));
  const m = await page.evaluate(() => { const s = window.civilcraft.project.state; return { n: s.masses.length, floors: s.masses[0].floors, parcel: s.masses[0].parcel, fh: s.masses[0].floorHeight }; });
  ok(m.n === 1 && m.floors === 3 && m.parcel === 'r1' && Math.abs(m.fh - 9.8425) < 0.01, 'one mass on the parcel, 3 floors of 3 m in feet', m);
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate(() => (window.civilcraft.project.state.masses || []).length === 0), 'one undo takes it away');
  // the tower is 20 × 20 m: too big for the 25 % coverage? it is placed, and the check says what it makes of it
  await page.click('[data-mo-opt="tower"]'); await page.click('[data-mo-place]'); await page.waitForSelector('[data-mo-result]');
  ok(/Lot coverage: (met|not met)/.test(await page.$eval('[data-mo-check]', (n) => n.textContent)), 'the tower is checked too');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-mo-envelope]')]);
  const env = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(env.format === 'cadcraft-massing-envelope' && env.polygon.length >= 4 && env.units === 'mm', 'the buildable area downloads as a massing envelope file');
  // a wrong file says so
  fs.writeFileSync(path.join(OUT, 'bad.json'), '{"format":"x"}');
  await page.setInputFiles('[data-mo-file]', path.join(OUT, 'bad.json'));
  await page.waitForSelector('[data-mo-msg]');
  ok(/not a massing options file/.test(await page.$eval('[data-mo-msg]', (n) => n.textContent)), 'another kind of file is refused in words');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
