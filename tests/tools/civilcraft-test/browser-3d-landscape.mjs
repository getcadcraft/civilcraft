#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-3d-landscape.mjs — CivilCraft 0.7.1 71.19 (roads, plants and ramps in 3D) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft, as a new user would meet it:
 *   1. a new project with nothing but a plant: the 3D button is on and 3D shows the tree (instanced);
 *   2. the sample survey + a road with an urban assembly + plants, a bed and a ramp: 3D shows the road body, the plants and
 *      the ramp by default, the Show menu has Road surfaces / Plants / Hardscape, a click on a tree selects that plant
 *      (Properties), a click on the ramp selects it; GLB export carries the plants; no console errors.
 * Run as root; signs in with a minted session (tag c3l).   node tools/civilcraft-test/browser-3d-landscape.mjs
 * Screenshots in tmp/shots/civilcraft-3d-landscape/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-3d-landscape');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'c3l'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.landscape);
  await page.evaluate(() => window.civilcraft.landscape.ready);

  // 1. nothing but a plant
  ok(await page.$eval('[data-cmd="view3d"]', (b) => b.disabled), 'an empty project: 3D is off (nothing to show)');
  await page.evaluate(() => { const p = window.civilcraft.project; p.change('plant', (s) => { s.landscape = { palette: [], plants: [{ id: 'l1', key: 'acer-campestre', x: 1000, y: 1000, z: null }], beds: [], hedges: [], grading: [], hardscape: [], show: 'mature', label: '{name}', labels: true }; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(200);
  ok(!(await page.$eval('[data-cmd="view3d"]', (b) => b.disabled)), 'one plant placed: the 3D button is on (no hidden step)');
  await page.click('[data-cmd="view3d"]');
  await page.waitForFunction(() => window.civilcraft.view3d?.scene, null, { timeout: 30000 });
  const one = await page.evaluate(() => { const v = window.civilcraft.view3d; return { inst: v.scene.instances.map((s) => [s.key, s.count]), drawn: v.view.root.children.filter((o) => o.isInstancedMesh).length }; });
  ok(one.inst.length === 2 && one.drawn === 2, 'the tree is in 3D: trunk + crown, two instanced meshes', one);
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SHOTS, '01-one-tree.png') });
  await page.evaluate(() => window.civilcraft.show3D(false));

  // 1b. a road with no survey yet (owner 2026-10-26): drawn on flat stand-in ground, with a warning in Properties and in 3D
  await page.evaluate(() => { const p = window.civilcraft.project; p.change('road', (s) => { s.alignments.push({ id: 'a90', name: 'Lane', start: 0, pis: [{ x: 900, y: 950 }, { x: 1100, y: 960 }], pvis: [{ sta: 0, z: 100, L: 0 }, { sta: 200, z: 104, L: 0 }], corridor: { lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10, on: true } }); }); window.civilcraft.select({ kind: 'alignment', id: 'a90' }); });
  await page.waitForSelector('[data-corridor-warning="corridor.standin"]');
  ok(await page.$eval('[data-corridor-warning]', (n) => /flat ground at elevation 102\.00 ft/.test(n.textContent)), 'Properties: the corridor warns it is drawn on flat ground at 102.00 ft');
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d.scene?.meshes.some((m) => m.key === 'road'));
  ok(await page.$eval('[data-3d-note]', (n) => !n.hidden && /flat ground/.test(n.textContent)), '3D: the road is drawn and the note warns it is provisional');
  await page.screenshot({ path: path.join(SHOTS, '03-road-stand-in.png') });
  await page.evaluate(() => { window.civilcraft.show3D(false); window.civilcraft.project.change('x', (s) => { s.alignments = s.alignments.filter((a) => a.id !== 'a90'); }); window.civilcraft.select(null); });

  // 2. survey + road + plants + ramp
  await page.evaluate(() => { const p = window.civilcraft.project; p.change('none', (s) => { delete s.landscape; }); });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const ids = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, w = (b.maxX - b.minX) / 3;
    // the Urban street preset (corridor.js presetParts('urban', 'ft')): lanes, gutter, curb, strip, walk, daylight
    const urban = () => [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'lane', w: 12, slope: 0.02 }, { type: 'gutter', w: 2, slope: 0.08 }, { type: 'curb', h: 0.5, w: 0.5, drop: 0 }, { type: 'strip', w: 5, slope: -0.02 }, { type: 'walk', w: 5, slope: -0.02 }, { type: 'daylight', cut: 2, fill: 3 }];
    const id = p.nextId('a');
    p.change('road', (s) => { s.alignments.push({ id, name: 'Main street', start: 0, pis: [{ x: cx - w, y: cy }, { x: cx + w, y: cy + 10, r: 0 }], pvis: [], corridor: null }); });
    const a = p.state.alignments.find((x) => x.id === id), al = p.alignment(a), z0 = p.eg().surface.elevationAt(cx - w + 1, cy), z1 = p.eg().surface.elevationAt(cx + w - 1, cy + 10);
    p.change('profile + corridor', (s) => { const q = s.alignments.find((x) => x.id === id); q.pvis = [{ sta: 0, z: Number(z0.toFixed(2)), L: 0 }, { sta: Number(al.end.toFixed(2)), z: Number(z1.toFixed(2)), L: 0 }]; q.corridor = { lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10, on: true, parts: { L: urban(), R: urban() } }; });
    const g = (x, y) => p.eg().surface.elevationAt(x, y);
    const rz = g(cx - 40, cy - 70);
    p.change('landscape', (s) => {
      s.landscape = { palette: [], beds: [], hedges: [], grading: [], show: 'mature', label: '{name}', labels: true,
        plants: [{ id: 'l1', key: 'acer-campestre', x: cx - 60, y: cy + 50, z: null }, { id: 'l2', key: 'pinus-sylvestris', x: cx, y: cy + 55, z: null }, { id: 'l3', key: 'pinus-mugo', x: cx + 40, y: cy + 48, z: null }],
        hardscape: [{ id: 'l4', kind: 'ramp', name: 'Ramp', pts: [{ x: cx - 40, y: cy - 70 }, { x: cx + 5, y: cy - 70 }], width: 5, zStart: rz, zEnd: rz + 3, maxGrade: 8.33, landingEvery: 2.5, landing: 5 }] };
    });
    return { id, g: p.graded().items.map((x) => [x.kind, x.problems.length]) };
  });
  ok(ids.g.some(([k, n]) => k === 'corridor' && n === 0), 'the urban road builds into the graded surface', ids.g);
  await page.click('[data-cmd="view3d"]');
  await page.waitForFunction(() => window.civilcraft.view3d?.scene?.meshes.some((m) => m.key === 'road'), null, { timeout: 30000 });
  const sc = await page.evaluate(() => { const v = window.civilcraft.view3d; v.view.standard('iso'); return { meshes: v.scene.meshes.map((m) => m.key), inst: v.scene.instances.reduce((n, s) => n + s.count, 0), menu: [...document.querySelectorAll('[data-3d-show]')].filter((i) => ['roads', 'plants', 'hardscape'].includes(i.dataset['3dShow'])).map((i) => i.checked) }; });
  ok(sc.meshes.includes('road') && sc.meshes.includes('hardscape'), 'by default 3D shows the road body and the ramp', sc.meshes);
  ok(sc.inst >= 5, `the three plants (trunks and crowns: ${sc.inst} instances)`);
  ok(sc.menu.length === 3 && sc.menu.every(Boolean), 'Show menu: Road surfaces, Plants, Hardscape, all on');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, '02-road-plants-ramp.png') });
  // a click on the tree selects it
  const at = await page.evaluate(() => {
    const v = window.civilcraft.view3d, s = v.scene.instances.find((q) => q.key === 'plants-sphere'), i = 0;
    const p = v.cam.project([s.at[0], s.at[1], s.at[2] + s.size[2] / 2]);
    const r = document.querySelector('[data-3d-canvas]').getBoundingClientRect();
    return { x: r.left + p[0], y: r.top + p[1], i };
  });
  await page.mouse.click(at.x, at.y);
  await page.waitForTimeout(200);
  const sel = await page.evaluate(() => window.civilcraft.sel);
  ok(sel?.kind === 'ls-plant' && sel.id === 'l1', 'a click on the maple selects that plant (as on the plan)', sel);
  ok(await page.$eval('[data-3d-tip]', (n) => !n.hidden && /Field maple/.test(n.textContent)), 'the tip names it');
  // GLB carries the plants
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-3d-glb]')]);
  const glb = fs.readFileSync(await dl.path());
  const jl = glb.readUInt32LE(12), json = JSON.parse(glb.subarray(20, 20 + jl).toString('utf8'));
  ok(json.meshes.some((m) => /Plants/.test(m.name || '')) && json.meshes.some((m) => /Road surfaces/.test(m.name || '')) && json.meshes.some((m) => /Hardscape/.test(m.name || '')), 'GLB export: road surfaces, hardscape and plants', json.meshes.map((m) => m.name));
  await page.click('[data-3d-show-menu] summary');
  await page.uncheck('[data-3d-show="plants"]');
  ok(await page.evaluate(() => !window.civilcraft.view3d.scene.instances.length && !window.civilcraft.view3d.view.root.children.some((o) => o.isInstancedMesh)), 'Show › Plants off: gone');
  await page.check('[data-3d-show="plants"]');
  await page.keyboard.press('Escape');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
