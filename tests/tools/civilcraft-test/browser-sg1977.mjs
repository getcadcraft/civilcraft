#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sg1977.mjs — CivilCraft 0.10.1, suggestion #1977 (roads that meet roads, pads and paths) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft: a main road, a side road that ends on it and starts in a pad, and two paths, one
 * drawn onto the side road and one across it. Properties says what was joined and has the switch; the 3D view draws the mouth
 * as pavement and the paths up to the road's edge.
 * Run as root; minted session (tag sg1977).   node tools/civilcraft-test/browser-sg1977.mjs   Shots in tmp/shots/civilcraft-sg1977/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-sg1977');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'sg1977'], { encoding: 'utf8' }) || '{}');

// metres; ground the plane z = 10 + 0.01 x + 0.02 y; the roads of bin/test-civilcraft-sg1977.mjs
const points = [];
{ let n = 1; for (let x = -50; x <= 250; x += 10) for (let y = -100; y <= 150; y += 10) points.push([String(n++), x, y, Number((10 + 0.01 * x + 0.02 * y).toFixed(3)), 'G']); }
const ASM = { on: true, lane: 3.5, laneSlope: 0.02, shoulder: 1, shoulderSlope: 0.04, cut: 2, fill: 3, step: 5 };
const FILE = JSON.stringify({ format: 'civilcraft-project', version: 1, name: 'sg1977', units: 'm', points, seq: 900, network: null, features: [],
  alignments: [
    { id: 'a1', name: 'Main road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 200, y: 0, r: 0 }], pvis: [{ sta: 0, z: 12, L: 0 }, { sta: 200, z: 12, L: 0 }], corridor: { ...ASM } },
    { id: 'a2', name: 'Side road', start: 0, pis: [{ x: 100, y: 80, r: 0 }, { x: 100, y: 0, r: 0 }], pvis: [{ sta: 0, z: 13, L: 0 }, { sta: 80, z: 12.5, L: 0 }], corridor: { ...ASM } }],
  pads: [{ id: 'p40', name: 'House pad', pts: [{ x: 90, y: 78 }, { x: 110, y: 78 }, { x: 110, y: 95 }, { x: 90, y: 95 }], z: 13.4, cut: 2, fill: 2 }],
  landscape: { hardscape: [
    { id: 'l1', kind: 'path', name: 'Path 1', pts: [{ x: 60, y: 40 }, { x: 97, y: 40 }], width: 1.5 },
    { id: 'l2', kind: 'path', name: 'Path 2', pts: [{ x: 140, y: 30 }, { x: 80, y: 30 }], width: 1.5 }] } });

admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });   // Properties shows every section
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.evaluate(async (f) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(f, 'sg1977.civilcraft.json'); }, FILE);
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 2 && window.civilcraft.project.points.length > 50);
  await page.waitForTimeout(500);
  const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
  const sel = (kind, id) => page.evaluate(([k, i]) => { document.activeElement?.blur?.(); window.civilcraft.select({ kind: k, id: i }); }, [kind, id]).then(() => page.waitForTimeout(300));
  const zAt = (x, y) => page.evaluate(([x, y]) => window.civilcraft.project.graded().surface?.elevationAt(x, y) ?? null, [x, y]);

  console.log('\nThe file as opened');
  const st = await page.evaluate(() => { const g = window.civilcraft.project.graded(); return { errors: g.report.errors, items: g.items.map((x) => [x.id, x.problems.length, (x.ties || []).map((t) => t.kind).join('+')]), paths: window.civilcraft.project.state.landscape?.hardscape?.length }; });
  ok(!st.errors.length && st.items.every((x) => x[1] === 0) && st.paths === 2, 'two roads, a pad and two paths grade without a problem', st);
  ok(st.items.find((x) => x[0] === 'a2')[2].split('+').sort().join('+') === 'pad+road', 'the side road joined the main road and the pad', st.items);
  ok(near(await zAt(100, 0), 12) && near(await zAt(100, 4.5), 11.91) && near(await zAt(100, 85), 13.4) && near(await zAt(100, 30), 12.6875), 'the surface: main crown 12, the mouth 11.91, the pad 13.4, the side road under the crossing path 12.6875', [await zAt(100, 0), await zAt(100, 4.5), await zAt(100, 85), await zAt(100, 30)]);
  await page.screenshot({ path: path.join(SHOTS, '01-plan.png') });

  console.log('\nProperties');
  await sel('alignment', 'a2');
  const box = page.locator('#cv-co-join');
  ok(await box.count() === 1 && await box.isChecked(), 'the side road\'s Corridor block has "Join the roads and pads it meets", on');
  const notes = await page.locator('[data-corridor-tie]').allTextContents();
  ok(notes.length === 2 && notes.some((n) => /Main road/.test(n) && /lowered 0\.62 m/.test(n) && /12\.4 m/.test(n)) && notes.some((n) => /House pad/.test(n) && /raised 0\.41 m/.test(n)), 'it says what it joined and by how much (Main road: lowered 0.62 m; House pad: raised 0.41 m)', notes);
  await page.locator('#cv-co-join').scrollIntoViewIfNeeded();
  await page.screenshot({ path: path.join(SHOTS, '02-properties.png') });
  await sel('alignment', 'a1');
  ok(await page.locator('#cv-co-join').isChecked() && await page.locator('[data-corridor-tie]').count() === 0 && await page.locator('[data-corridor-join-note]').count() === 1, 'the main road has the switch and the plain note (it joins nothing itself)');

  console.log('\nThe switch');
  await sel('alignment', 'a2');
  await page.locator('#cv-co-join').uncheck(); await page.waitForTimeout(500);
  let s2 = await page.evaluate(() => { const p = window.civilcraft.project, g = p.graded(); return { join: p.state.alignments[1].corridor.join, ties: g.items.find((x) => x.id === 'a2').ties || null, open: g.items.find((x) => x.id === 'a1').sections.some((s) => s.open), undo: p.undoStack.at(-1)?.label || p.undoStack.at(-1)?.name || '' }; });
  // (off, the side road runs over the main road on its own profile, as before: 13 − 0.5 × 75.5 / 80 = 12.528 at the main road's edge)
  ok(s2.join === false && s2.ties === null && !s2.open && near(await zAt(100, 4.5), 12.528) && await page.locator('[data-corridor-tie]').count() === 0, 'off: nothing is joined, the main road has no opening, the notes are gone', [s2, await zAt(100, 4.5)]);
  await page.evaluate(() => window.civilcraft.project.undo()); await page.waitForTimeout(500);
  s2 = await page.evaluate(() => { const p = window.civilcraft.project; return { join: p.state.alignments[1].corridor.join, ties: (p.graded().items.find((x) => x.id === 'a2').ties || []).length }; });
  ok(s2.join === undefined && s2.ties === 2 && near(await zAt(100, 4.5), 11.91), 'one undo step brings the join back', s2);

  console.log('\n3D');
  await page.evaluate(() => window.civilcraft.select(null));
  await page.click('[data-cmd="view3d"]');
  await page.waitForFunction(() => window.civilcraft.view3d?.scene?.meshes.some((m) => m.key === 'road') && window.civilcraft.view3d.scene.meshes.some((m) => m.key === 'hardscape'), null, { timeout: 30000 });
  const sc = await page.evaluate(() => {
    const v = window.civilcraft.view3d, s = v.scene, hard = s.meshes.find((m) => m.key === 'hardscape'), ox = s.origin.x;
    let over = 0; for (let i = 0; i < hard.positions.length; i += 3) { const x = hard.positions[i] + ox; if (x > 95.501 && x < 104.499) over++; }
    return { meshes: s.meshes.map((m) => m.key), over, notes: s.notes };
  });
  ok(sc.over === 0 && sc.meshes.includes('road'), 'the 3D scene has the roads and the paths, and no part of a path lies over the side road', sc);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SHOTS, '03-3d.png') });
  // closer: look at the junction, the pad and the paths from the south-east and from the north-west
  const look = async (eye, target, file) => {
    await page.evaluate(([e, t]) => { const v = window.civilcraft.view3d, s = v.scene, L = (q) => [q[0] - s.origin.x, q[1] - s.origin.y, (q[2] - s.origin.z) * s.exag]; v.cam.persp = true; v.cam.target = L(t); v.cam.eye = L(e); v.cam.clip?.(); v.view.invalidate?.(); v.refresh?.(); }, [eye, target]);
    await page.mouse.move(700, 500); await page.mouse.wheel(0, -1); await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(SHOTS, file) });
  };
  await look([150, -45, 32], [100, 22, 12], '04-3d-junction.png');
  await look([55, 55, 30], [100, 20, 12], '05-3d-paths.png');
  await look([135, 40, 28], [100, 78, 13], '06-3d-pad.png');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
