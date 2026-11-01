#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ground-browser.mjs — CivilCraft 0.8 SU.911 / SU.935 / SU.914 (session civil-08) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft:
 *   SU.911  Surface › More › Terrain from contours: GIS line layers (contours), the elevation sources, Check lists a crossing,
 *           Build adds the lines as breaklines (one undo step) and the ground follows the slope; scale and place by two points.
 *   SU.935  opening testfiles/generated/drone-survey-300m.las (no ground class) offers "Find the ground myself"; the import
 *           keeps ground points on the true terrain and takes buildings and trees out.
 *   SU.914  the sample site with a pad: Show › Cut and fill map (legend, spot levels), the 3D colouring, the Free section tool
 *           (dialog with the SVG, cut and fill areas, CSV), the Ramp tool (a pad with levels on its corners).
 * Run as root; signs in with a minted session (tag cgd).
 *   node tools/civilcraft-test/ground-browser.mjs [--shots <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const SHOTS = arg('--shots');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cgd'], { encoding: 'utf8' }));
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
async function open(space) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push(space + ' console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push(space + ' pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft?space=' + space, { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  return { ctx, page };
}
const clickWorld = async (page, x, y) => { const s = await page.evaluate(([a, b]) => window.civilcraft.toScreen(a, b), [x, y]); await page.mouse.click(s.x, s.y); };
const newProject = (page, units) => page.evaluate(async (units) => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const key = Object.keys(map).find((k) => /\/civilcraft\/[^/]+\/project\.js$/.test(k));
  const { Project } = await import(key);
  const p = new Project(); p.state.units = units;
  window.civilcraft.gis.setProject(p);
}, units);
try {
  for (const space of ['paper', 'model']) {
    console.log('\n== ' + space);
    // ---------------------------------------------------------------- SU.911
    {
      const { ctx, page } = await open(space);
      ok(await page.$('[data-cmd="ground-contours"]') !== null, 'Surface › More has Terrain from contours');
      await page.evaluate(() => window.civilcraft.command('ground-contours'));
      ok(await page.evaluate(() => (document.querySelector('[data-status]')?.textContent || '')).then((s) => /No line layers/.test(s)), 'without line layers it says to open the contour map first');
      // contour lines of a plane z = 100 + 0.1 x as a GIS layer, one with a stray crossing line
      await page.evaluate(() => {
        const p = window.civilcraft.project;
        const feats = [];
        for (let k = 0; k <= 10; k++) feats.push({ g: { t: 'ln', c: [[[10 * k, 0, 100 + k], [10 * k, 50, 100 + k], [10 * k, 100, 100 + k]]] }, p: {} });
        feats.push({ g: { t: 'ln', c: [[[0, 45, 103], [100, 45, 103]]] }, p: {} });
        p.editGis('test layer', (map, s) => { const g = s.gis ||= { layers: [], maps: [] }; const id = 'g' + s.seq++; g.layers.push({ id, name: 'Contours', geom: 'ln', hasZ: true, fields: [], visible: true, color: 'major', source: { file: '', format: '', crs: null } }); map.set(id, feats); return map; });
      });
      await page.evaluate(() => window.civilcraft.command('ground-contours'));
      await page.waitForSelector('[data-ground-dialog][open]');
      await page.fill('[data-ground-interval]', '1');
      await page.click('[data-ground-check]');
      const iss = await page.$$eval('[data-ground-issues] li', (n) => n.map((x) => x.textContent));
      ok(iss.some((s) => /crosses line/.test(s)), 'Check names the stray line that crosses the contours', iss);
      await page.check('[data-ground-drop]');
      const before = await page.evaluate(() => window.civilcraft.project.state.surface.breaklines.length);
      await page.click('[data-ground-build]');
      const r = await page.evaluate(() => { const p = window.civilcraft.project; const sf = p.eg().surface; return { n: p.state.surface.breaklines.length, fix: p.state.surface.flatFix, z: sf ? [sf.elevationAt(5, 5), sf.elevationAt(37, 61)] : null }; });
      ok(r.n - before === 11 && r.fix === 1, 'Build adds the 11 real contours (the crossing line left out) and sets the flat-triangle fix', r);
      ok(r.z && Math.abs(r.z[0] - 100.5) < 1e-6 && Math.abs(r.z[1] - 103.7) < 1e-6, 'the ground follows the slope between the contours', r);
      if (SHOTS) await page.locator('[data-ground-dialog]').screenshot({ path: path.join(SHOTS, `ground-contours-${space}.png`) });
      await page.click('[data-ground-close]');
      await page.keyboard.press('Control+z');
      ok(await page.evaluate(() => window.civilcraft.project.state.surface.breaklines.length) === before, 'Ctrl+Z takes all of them back in one step');
      // place by two points
      await page.evaluate(() => window.civilcraft.command('ground-contours'));
      await page.waitForSelector('[data-ground-dialog][open]');
      await page.evaluate(() => document.querySelector('[data-ground-dialog] details').open = true);
      const vals = { 'data-ground-ax': 0, 'data-ground-ay': 0, 'data-ground-bx': 100, 'data-ground-by': 0, 'data-ground-a2x': 1000, 'data-ground-a2y': 2000, 'data-ground-b2x': 1200, 'data-ground-b2y': 2000 };
      for (const [k, v] of Object.entries(vals)) await page.fill(`[${k}]`, String(v));
      await page.click('[data-ground-place]');
      const moved = await page.evaluate(() => { const p = window.civilcraft.project; const l = p.state.gis.layers[0]; const f = p.gisFeatures.get(l.id)[0]; return f.g.c[0][0]; });
      ok(Math.abs(moved[0] - 1000) < 1e-6 && Math.abs(moved[1] - 2000) < 1e-6 && moved[2] === 100, 'two known points scale (×2) and place the layer; z kept', moved);
      await ctx.close();
    }
    // ---------------------------------------------------------------- SU.935
    {
      const { ctx, page } = await open(space);
      await newProject(page, 'm');
      await page.setInputFiles('[data-file]', [path.join(REPO, 'testfiles/generated/drone-survey-300m.las')]);
      const DLG = 'dialog.cv-terrain[open]';
      await page.waitForSelector(DLG);
      await page.waitForFunction(() => window.civilcraft.gis.terrain.dialog?.st.scanned, null, { timeout: 60000 });
      ok(await page.$eval(DLG + ' [data-terrain-ground]', (s) => s.value) === 'find', 'a cloud with no ground class starts on "Find the ground myself"');
      await page.selectOption(DLG + ' select[id$="-z"]', 'm');
      await page.selectOption(DLG + ' select[id$="-area"]', 'all');
      await page.fill(DLG + ' input[id$="-spacing"]', '2');
      await page.fill(DLG + ' [data-terrain-object]', '40');
      await page.waitForTimeout(150);
      if (SHOTS) await page.locator(DLG).screenshot({ path: path.join(SHOTS, `ground-cloud-${space}.png`) });
      await page.click(DLG + ' .cv-dlg-foot .btn-plot');
      await page.waitForSelector(DLG, { state: 'detached', timeout: 90000 });
      const g = await page.evaluate(() => { const p = window.civilcraft.project; const pts = p.points; const trueZ = (x, y) => { const u = x - 500000, v = y - 4000000; return 100 + 0.06 * u + 4 * Math.sin(u / 40) * Math.cos(v / 55); }; let worst = 0; for (const q of pts) worst = Math.max(worst, Math.abs(q.z - trueZ(q.x, q.y))); return { n: pts.length, d: [...new Set(pts.map((q) => q.d))], worst, note: window.civilcraft.gis.terrain.last.notes.join(' '), surface: !!p.eg().surface }; });
      ok(g.n > 20000 && g.d.join() === 'GROUND', g.n + ' ground points, described GROUND', g);
      ok(g.worst < 0.1, 'every kept point is within 10 cm of the true terrain (buildings, trees and stray low points gone)', g.worst);
      ok(/Ground found/.test(g.note) && g.surface, 'the report says what was taken out, and the ground surface builds', g.note);
      await ctx.close();
    }
    // ---------------------------------------------------------------- SU.914
    {
      const { ctx, page } = await open(space);
      await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
      await page.waitForFunction(() => window.civilcraft.project.points.length > 100 && window.civilcraft.project.eg().surface);
      const b = await page.evaluate(() => window.civilcraft.project.eg().surface.bounds);
      const w = b.maxX - b.minX, h = b.maxY - b.minY, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
      const zc = await page.evaluate(([x, y]) => window.civilcraft.project.eg().surface.elevationAt(x, y), [cx, cy]);
      await page.evaluate(([cx, cy, w, h, zc]) => window.civilcraft.project.change('Pad', (s) => s.pads.push({ id: 'p1', name: 'House', pts: [{ x: cx - w * 0.08, y: cy - h * 0.08 }, { x: cx + w * 0.08, y: cy - h * 0.08 }, { x: cx + w * 0.08, y: cy + h * 0.08 }, { x: cx - w * 0.08, y: cy + h * 0.08 }], z: zc, cut: 2, fill: 2 })), [cx, cy, w, h, zc]);
      ok(await page.$('[data-show="cutfill"]') !== null && await page.$('[data-cmd="free-section"]') !== null && await page.$('[data-cmd="ramp"]') !== null, 'Show has Cut and fill map; Surface › More has Free section and Ramp');
      await page.evaluate(() => window.civilcraft.project.setDisplay('cutfill', true));
      await page.waitForTimeout(400);
      const leg = await page.evaluate(() => { const l = document.querySelector('[data-legend]'); return { hidden: l.hidden, text: l.textContent }; });
      ok(!leg.hidden && /Cut/.test(leg.text) && /Fill/.test(leg.text), 'the legend lists cut and fill depths', leg);
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `cutfill-plan-${space}.png`) });
      // a section line drawn across the pad
      await page.evaluate(() => window.civilcraft.command('free-section'));
      for (const [x, y] of [[cx - w * 0.3, cy], [cx, cy + h * 0.02], [cx + w * 0.3, cy]]) await clickWorld(page, x, y);
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-pf-dialog][open] [data-free-section]');
      const sec = await page.evaluate(() => ({ kinds: [...document.querySelectorAll('[data-free-section] [data-kind]')].map((n) => n.dataset.kind), note: document.querySelector('[data-pf-dialog] .cv-note').textContent }));
      ok(sec.kinds.length > 0 && /Cut area/.test(sec.note), 'the free section shows shaded cut/fill and their areas', sec);
      if (SHOTS) await page.locator('[data-pf-dialog]').screenshot({ path: path.join(SHOTS, `free-section-${space}.png`) });
      const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-pf-csv]')]);
      ok(/section\.csv$/.test(dl.suggestedFilename()), 'CSV downloads', dl.suggestedFilename());
      await page.click('[data-pf-close]');
      // a ramp
      const pads0 = await page.evaluate(() => window.civilcraft.project.state.pads.length);
      await page.evaluate(() => window.civilcraft.command('ramp'));
      for (const [x, y] of [[cx - w * 0.35, cy - h * 0.3], [cx - w * 0.2, cy - h * 0.3]]) await clickWorld(page, x, y);
      await page.keyboard.press('Enter');
      await page.waitForSelector('[data-pf-ramp][open]');
      await page.fill('[data-pf-grade]', '8'); await page.click('[data-pf-make]');
      const rp = await page.evaluate(() => { const p = window.civilcraft.project.state.pads; const r = p[p.length - 1]; return { n: p.length, zs: r.pts.map((q) => q.z), name: r.name }; });
      ok(rp.n === pads0 + 1 && rp.zs[1] > rp.zs[0] && rp.zs[0] === rp.zs[3] && rp.zs[1] === rp.zs[2], 'the ramp is a pad with levels on its corners, higher at the second click', rp);
      await page.keyboard.press('Control+z');
      ok(await page.evaluate(() => window.civilcraft.project.state.pads.length) === pads0, 'one undo step takes the ramp back');
      // the 3D colouring
      await page.evaluate(() => window.civilcraft.command('view3d'));
      await page.waitForSelector('[data-3d-color]');
      await page.selectOption('[data-3d-color]', 'cutfill');
      await page.waitForTimeout(800);
      ok(await page.$eval('[data-3d-color]', (s) => s.value) === 'cutfill', '3D has the Cut and fill colouring');
      if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `cutfill-3d-${space}.png`) });
      await ctx.close();
    }
  }
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
