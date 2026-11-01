#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-walls.mjs — CivilCraft 0.7.1 in headless Chromium at https://getcadcraft.com/lab/civilcraft, on MickeyWolf's own setup
 * (sample-site.csv in metres, the Landscape workspace, two platforms, a hedge and a bed of Black poplar, single trees):
 *   71.19  the 3D view shows the trees, hedge and bed plants and the platforms (shot 01, the reporter's view);
 *   71.22  a platform's Properties › Sides and retaining walls: side 2 vertical (one undo step), then all sides; the wall's quantities and
 *          the tall-wall warning; the wall symbol on the plan (layer L-HARD-WALL); the wall in 3D; a slope typed as 50%; Ctrl+Z.
 * Run as root; minted session (tag cwl).   node tools/civilcraft-test/browser-walls.mjs   Shots in tmp/shots/civilcraft-walls/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-walls');
fs.mkdirSync(SHOTS, { recursive: true });
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
  await page.goto(BASE + '/lab/civilcraft?space=model', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.landscape);
  await page.evaluate(() => window.civilcraft.landscape.ready);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  // the reporter's site: metres (as the screenshot), two platforms, a hedge and a bed of Black poplar, single trees
  await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f;
    p.change('units', (s) => { s.units = 'm'; });
    p.change('landscape', (s) => {
      s.landscape = { palette: [], show: 'mature', label: '{name}', labels: true, hardscape: [],
        plants: [{ id: 'l1', key: 'populus-nigra', x: X(0.35), y: Y(0.85), z: null }, { id: 'l2', key: 'populus-nigra', x: X(0.45), y: Y(0.88), z: null }],
        beds: [{ id: 'l3', name: 'Bed 1', pts: [{ x: X(0.7), y: Y(0.35) }, { x: X(0.82), y: Y(0.35) }, { x: X(0.82), y: Y(0.6) }, { x: X(0.7), y: Y(0.6) }], mix: [{ key: 'populus-nigra', pct: 100 }], spacing: null, pattern: 'triangular', angle: 0, seed: 1 }],
        hedges: [{ id: 'l4', name: 'Hedge 2', pts: [{ x: X(0.3), y: Y(0.75) }, { x: X(0.6), y: Y(0.82) }], key: 'populus-nigra', spacing: null, rows: 1, rowGap: 0.4 }],
        grading: [
          { id: 'l5', kind: 'platform', name: 'Platform 1', pts: [{ x: X(0.08), y: Y(0.5) }, { x: X(0.22), y: Y(0.5) }, { x: X(0.22), y: Y(0.7) }, { x: X(0.08), y: Y(0.7) }], z: 250, fall: null, cut: 3, fill: 3 },
          { id: 'l6', kind: 'platform', name: 'Platform 2', pts: [{ x: X(0.33), y: Y(0.3) }, { x: X(0.58), y: Y(0.3) }, { x: X(0.58), y: Y(0.62) }, { x: X(0.33), y: Y(0.62) }], z: 255, fall: null, cut: 3, fill: 3 },
        ] };
    });
    window.civilcraft.landscape.setActive(true);
    window.civilcraft.command('fit');
  });
  await page.waitForTimeout(300);
  // the owner's rule (2026-10-26): this project as the reporter saved it with 0.7 (the old plant list) opens with the same plants
  page.on('dialog', (d) => d.accept());
  await page.evaluate(async () => {
    const j = JSON.parse(JSON.stringify(window.civilcraft.project.toJSON()));
    delete j.landscape.plantList;
    for (const it of [...j.landscape.beds, ...j.landscape.hedges]) { delete it.spacingUsed; delete it.spacingFor; }
    window.civilcraft.project.saved = window.civilcraft.project.version;   // nothing unsaved: no discard question
    await window.civilcraft.openText(JSON.stringify(j), 'sample-site.civilcraft.json');
  });
  await page.waitForFunction(() => window.civilcraft.project.state.landscape?.beds?.[0]?.oldList === 1);
  await page.evaluate(() => { window.civilcraft.landscape.setActive(true); });
  const counts = await page.evaluate(() => { const L = window.civilcraft.landscape, sch = L.schedule(); return { total: sch.total, rows: sch.rows.map((r) => [r.key, r.qty]) }; });
  ok(counts.total === 144, 'a 0.7 file of this site reopens with its 144 Black poplars (the spacing it was saved with)', counts);
  await page.evaluate(() => window.civilcraft.select({ kind: 'ls-bed', id: 'l3' }));
  await page.waitForSelector('[data-ls-spacing-old="l3"]');
  ok(await page.$eval('[data-ls-spacing-old="l3"]', (n) => /older plant list: 6\.00 m/.test(n.textContent) && /18\.00 m/.test(n.textContent)), 'the bed\'s Properties: "Spacing from an older plant list: 6.00 m (the list now gives 18.00 m)" + Update');
  await page.screenshot({ path: path.join(SHOTS, '00-older-plant-list.png') });
  const u0 = await page.evaluate(() => window.civilcraft.project.undoStack.length);
  await page.click('[data-ls-spacing-update="l3"]');
  await page.waitForFunction(() => !window.civilcraft.project.state.landscape.beds[0].oldList);
  const after = await page.evaluate((u) => ({ total: window.civilcraft.landscape.schedule().total, steps: window.civilcraft.project.undoStack.length - u, note: !!document.querySelector('[data-ls-spacing-old]') }), u0);
  ok(after.steps === 1 && after.total < 144 && !after.note, `Update: one undo step, the bed re-spaced with the current list (${after.total} poplars in all, the hedge still as saved)`, after);
  await page.evaluate(() => window.civilcraft.select({ kind: 'ls-hedge', id: 'l4' }));
  await page.waitForSelector('[data-ls-spacing-update="l4"]');
  await page.click('[data-ls-spacing-update="l4"]');
  await page.waitForFunction(() => !window.civilcraft.project.state.landscape.hedges[0].oldList);
  await page.evaluate(() => window.civilcraft.select(null));
  // 71.19 again, on this project: the 3D view as the reporter had it
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d?.scene?.instances?.length, null, { timeout: 30000 });
  const r19 = await page.evaluate(() => { const v = window.civilcraft.view3d; v.view.standard('iso'); return { plants: v.scene.counts.plants, inst: v.scene.instances.map((s) => s.key) }; });
  ok(r19.plants >= 8, `71.19: trees, hedge and bed plants stand in 3D (${r19.plants} Black poplars)`, r19);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, '01-reporter-site-3d.png') });
  const tall = await page.evaluate(() => { const v = window.civilcraft.view3d, c = v.scene.instances.find((q) => /sphere|cone/.test(q.key)); return c ? c.size[2] : 0; });
  await page.selectOption('[data-3d-exag]', '1');
  await page.waitForFunction(() => window.civilcraft.view3d.state.exag === 1);
  await page.evaluate(() => window.civilcraft.view3d.view.standard('iso'));
  await page.waitForTimeout(500);
  ok(await page.evaluate((h) => { const c = window.civilcraft.view3d.scene.instances.find((q) => /sphere|cone/.test(q.key)); return Math.abs(c.size[2] - h) < 1e-6; }, tall), '1× and 2×: the trees keep the same true height (only the ground is exaggerated)');
  await page.screenshot({ path: path.join(SHOTS, '01b-reporter-site-3d-1x.png') });
  await page.selectOption('[data-3d-exag]', '2');
  await page.evaluate(() => window.civilcraft.show3D(false));

  // 71.22: Platform 2's sides
  await page.evaluate(() => window.civilcraft.select({ kind: 'ls-grade', id: 'l6' }));
  await page.waitForSelector('[data-sides-table]');
  ok(await page.$$eval('[data-side-mode]', (n) => n.length) === 4 && await page.$eval('[data-sides-all]', (s) => s.value) === 'slope', 'Properties: four sides, all sloped');
  const undo0 = await page.evaluate(() => window.civilcraft.project.undoStack.length);
  await page.selectOption('[data-side-mode="1"]', 'wall');
  await page.waitForFunction(() => window.civilcraft.project.state.landscape.grading[1].sides?.edges?.[1]?.wall);
  ok(await page.evaluate((u) => window.civilcraft.project.undoStack.length === u + 1, undo0), 'side 2 vertical: one undo step');
  const w1 = await page.evaluate(() => { const it = window.civilcraft.project.graded().items.find((x) => x.id === 'l6'); return { walls: it.walls?.length || 0, problems: it.problems, n: it.walls?.[0]?.pts.length }; });
  ok(w1.walls === 1 && !w1.problems.length, 'the platform grades with a retaining wall on side 2', w1);
  await page.waitForSelector('[data-wall-qty]');
  ok(await page.$eval('[data-wall-qty]', (n) => /Wall length/.test(n.textContent) && /Exposed face/.test(n.textContent)), 'Properties: wall length, exposed face, tallest and average height');
  ok(await page.$$eval('[data-sides-warning="grade.wall.tall"]', (n) => n.length === 1 && /engineered wall or a permit/.test(n[0].textContent)), 'a wall over 1.0 m: the warning in Properties');
  const plan = await page.evaluate(() => window.civilcraft.landscape.sceneItems(1).filter((x) => x.layer === 'L-HARD-WALL').length);
  ok(plan > 10, `plan: the wall symbol (${plan} items on L-HARD-WALL)`);
  await page.screenshot({ path: path.join(SHOTS, '02-side-2-wall-plan.png') });
  // all sides, then a slope typed as a percentage
  await page.selectOption('[data-sides-all]', 'wall');
  await page.waitForFunction(() => window.civilcraft.project.state.landscape.grading[1].sides?.edges?.filter((e) => e?.wall).length === 4);
  ok(true, 'All sides › Vertical: walls all round');
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d.scene?.meshes.some((m) => m.key === 'walls'));
  ok(await page.evaluate(() => window.civilcraft.view3d.scene.meshes.find((m) => m.key === 'walls').owners.some((o) => o.id === 'l6')), '3D: the retaining walls as solids');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, '03-walls-3d.png') });
  await page.evaluate(() => window.civilcraft.show3D(false));
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.state.landscape.grading[1].sides?.edges?.filter((e) => e?.wall).length === 1);
  ok(true, 'Ctrl+Z: back to the one wall');
  await page.evaluate(() => window.civilcraft.select({ kind: 'ls-grade', id: 'l6' }));
  await page.waitForSelector('#cv-gr-cut');
  await page.fill('#cv-gr-cut', '50%'); await page.press('#cv-gr-cut', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.landscape.grading[1].cut === 2);
  ok(true, 'a cut slope typed as 50% = 2:1');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
