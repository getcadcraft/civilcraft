#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-3d.mjs — the CivilCraft 3D site view in headless Chromium at https://getcadcraft.com/lab/civilcraft, by real
 * clicks, drags, wheel and keys: the sample site with breaklines, an alignment + design profile + corridor, a pad and a
 * pipe network; three.js is not fetched until 3D opens; 3D (toolbar and D key) draws something; middle-drag and
 * left-drag orbit, right-drag pans, the wheel zooms at the cursor, a trackpad swipe orbits and a pinch zooms;
 * standard views, perspective/parallel, extents; vertical exaggeration; surface colouring; every Show toggle; a click
 * on a structure / pipe / survey point selects it in Properties (and a tip names it); GLB (Khronos validator) and OBJ
 * exports; paper and model themes (the view re-themes); a 100k-triangle surface (build time and frame time);
 * back to the plan. Screenshots in paper and model. Fails on any console error.
 *
 *   node tools/civilcraft-test/browser-3d.mjs [--out <dir for screenshots>] [--state <storageState.json>] [--stay-up]
 * Run as root: it calls `sudo -u www-data php tools/civilcraft-test/admin-3d.php up|down` for its own test admin
 * civilcraft3dtest+cadcraft@projectz.xyz (disabled again at the end unless --stay-up). The GLB check uses the
 * gltf-validator in tools/modelcraft-test/node_modules (`(cd tools/modelcraft-test && npm install)`; skipped with a note).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-3d'));
const STATE = arg('--state', path.join(REPO, 'tmp/civilcraft-test/state-3d.json'));
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const DL = fs.mkdtempSync('/tmp/civilcraft-3d-dl-');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const note = (s) => console.log('  note ' + s);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(HERE, 'admin-3d.php');
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, cmd], { encoding: 'utf8' }));
let validator = null;
try { validator = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('gltf-validator'); } catch { note('gltf-validator missing: (cd tools/modelcraft-test && npm install)'); }

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const watch = (page) => {
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
};

async function signedInContext(opts = {}) {
  if (fs.existsSync(STATE)) {
    const ctx = await browser.newContext({ storageState: STATE, acceptDownloads: true, ...opts });
    const p = await ctx.newPage();
    const r = await p.goto(BASE + '/lab/civilcraft', { waitUntil: 'domcontentloaded' });
    const okNow = r.status() === 200 && (await p.$('[data-civilcraft]'));
    await p.close();
    if (okNow) return ctx;
    await ctx.close();
  }
  const cred = admin('up');
  const ctx = await browser.newContext({ acceptDownloads: true, ...opts });
  const p = await ctx.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', cred.email);
  await p.fill('input[name="password"]', cred.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await ctx.storageState({ path: STATE });
  await p.close();
  return ctx;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
async function download(page, action) {
  const [dl] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, dl.suggestedFilename());
  await dl.saveAs(f);
  return f;
}
const E0 = 6150000, N0 = 2080000;
const cam = (page) => page.evaluate(() => { const c = window.civilcraft.view3d.cam; return { eye: c.eye.slice(), target: c.target.slice(), dist: c.distance, persp: c.persp }; });
const moved = (a, b) => Math.hypot(a.eye[0] - b.eye[0], a.eye[1] - b.eye[1], a.eye[2] - b.eye[2]) > 1e-6;
/** How much of the 3D canvas differs from its background colour (0…1), read from the WebGL drawing buffer. */
const inked = (page) => page.evaluate(() => {
  const v = window.civilcraft.view3d.view, c = v.canvas;
  v.draw();
  const t = document.createElement('canvas'); t.width = 200; t.height = 150;
  const g = t.getContext('2d'); g.drawImage(c, 0, 0, 200, 150);
  const d = g.getImageData(0, 0, 200, 150).data, bg = parseInt(v.scene.background.getHexString(), 16);   // sRGB (Color.r/g/b are linear)
  const br = (bg >> 16) & 255, bgg = (bg >> 8) & 255, bb = bg & 255;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - br) + Math.abs(d[i + 1] - bgg) + Math.abs(d[i + 2] - bb) > 24) n++;
  return n / (200 * 150);
});

let ctx;
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
  // 0.4 1.2: a reload after unsaved work offers "Recover your work?" (app-autosave.js); this suite does not test that
  // (browser-part2.mjs a12 does), so the offer is discarded whenever it shows
  await ctx.addInitScript(() => {
    new MutationObserver(() => { const b = document.querySelector('[data-autosave-dialog][open] [data-autosave-discard]'); if (b) b.click(); })
      .observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  });
  const page = await ctx.newPage();
  watch(page);
  const threeReq = [];
  page.on('request', (r) => { if (/\/vendor\/three\//.test(r.url()) || /site-view3d\.js/.test(r.url())) threeReq.push(r.url()); });

  console.log('\n== the sample site, with a design');
  const r = await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  ok(r.status() === 200 && (await page.evaluate(() => !!window.civilcraft)), '/lab/civilcraft started');
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  for (const [k, v] of [['FL', 'breakline'], ['TBN', 'breakline'], ['TBS', 'breakline'], ['RIDGE', 'breakline'], ['CP', 'off']]) {
    await page.selectOption(`[data-groups] select[aria-label="How group ${k} builds the surface"]`, v);
  }
  await page.evaluate(async ([E0, N0]) => {
    const PI = await import('/assets/apps/civilcraft/dev/pipes.js');
    const p = window.civilcraft.project;
    p.change('Alignment', (s) => s.alignments.push({ id: 'a90', name: 'Access road', start: 1000, pis: [{ x: E0 + 10, y: N0 + 260, r: 0 }, { x: E0 + 200, y: N0 + 230, r: 120 }, { x: E0 + 300, y: N0 + 40, r: 90 }, { x: E0 + 390, y: N0 + 30, r: 0 }], pvis: [], corridor: null }));
    const a = p.alignment(p.state.alignments[0]);
    const egp = p.egProfile(p.state.alignments[0]).filter((q) => q.z !== null);
    p.change('Profile', (s) => { s.alignments[0].pvis = [{ sta: a.start, z: Number(egp[0].z.toFixed(2)), L: 0 }, { sta: Number((a.start + a.length / 2).toFixed(2)), z: 256, L: 120 }, { sta: Number(a.end.toFixed(2)), z: Number(egp[egp.length - 1].z.toFixed(2)), L: 0 }]; });
    p.change('Corridor', (s) => { s.alignments[0].corridor = { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }; });
    p.change('Pad', (s) => s.pads.push({ id: 'p91', name: 'Pad A', pts: [{ x: E0 + 60, y: N0 + 120 }, { x: E0 + 120, y: N0 + 120 }, { x: E0 + 120, y: N0 + 170 }, { x: E0 + 60, y: N0 + 170 }], z: 252, cut: 2, fill: 2 }));
    const net = PI.defaultNetwork('ft');
    net.structures = [{ id: 's92', name: 'S1', x: E0 + 250, y: N0 + 150, rim: null, sumpDepth: 0.5, dia: 48 }, { id: 's93', name: 'S2', x: E0 + 170, y: N0 + 110, rim: null, sumpDepth: 0, dia: 48 }, { id: 's94', name: 'S3', x: E0 + 60, y: N0 + 70, rim: null, sumpDepth: 1, dia: 60 }];
    net.pipes = [{ id: 'q95', name: 'P1', from: 's92', to: 's93', dia: 12, invUp: null, invDn: null }, { id: 'q96', name: 'P2', from: 's93', to: 's94', dia: 18, invUp: null, invDn: null }];
    net.pipes = PI.autoInverts(net, p.pipeSurface(), 'ft').pipes;
    p.change('Pipes', (s) => { s.network = net; });
  }, [E0, N0]);
  ok(await page.evaluate(() => { const p = window.civilcraft.project; return !!p.graded().surface && p.networkCheck().problems.length === 0; }), 'alignment, design profile, corridor, pad and a clean pipe network in the project');
  ok(threeReq.length === 0, 'three.js and the 3D module are not fetched before 3D opens');
  ok(await page.evaluate(() => { const c = document.querySelector('[data-plan] > [data-viewcube]'); return !!c && !c.hidden && getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().width > 50; }), 'the plan shows the view cube (default corner indicator)');
  await page.locator('[data-plan] > [data-viewcube]').screenshot({ path: path.join(OUT, '05-cube-plan-paper.png') });

  console.log('\n== open 3D');
  await page.click('[data-cmd="view3d"]');
  await page.waitForFunction(() => window.civilcraft.view3d?.scene && !document.querySelector('[data-view3d]').hidden, null, { timeout: 20000 });
  await wait(300);
  ok(threeReq.some((u) => /three\.module\.js/.test(u)) && threeReq.some((u) => /site-view3d\.js/.test(u)), 'three.js and site-view3d.js load on first use');
  ok(await page.getAttribute('[data-cmd="view3d"]', 'aria-pressed') === 'true', 'the 3D button is pressed');
  ok(await page.evaluate(() => { const t = document.querySelector('main > [role="toolbar"]'); const g = [...t.querySelectorAll(':scope > [role="group"]')]; return g.length >= 6 && t.querySelector('[data-cmd="view3d"]').closest('[role="group"]').getAttribute('aria-label') === 'View' && !!t.querySelector('[data-cmd="view3d"]').closest('[class$="-tool-row"]'); }), 'toolbar shape kept: role=toolbar child of <main>, 3D in the View group\'s tool row');
  ok(await page.evaluate(() => { const t = document.querySelector('.cv-tools'); const tops = new Set([...t.querySelectorAll('.cv-tool-group')].map((g) => Math.round(g.getBoundingClientRect().top))); return tops.size === 1; }), 'the toolbar is still one row at 1440 px');
  const sc0 = await page.evaluate(() => { const s = window.civilcraft.view3d.scene; return { keys: s.meshes.map((m) => m.key), lines: s.lines.map((l) => l.key), tris: s.counts.triangles, pipes: s.counts.pipes, structs: s.counts.structures, origin: s.origin, egOx: window.civilcraft.project.eg().surface.ox }; });
  ok(['eg', 'fg', 'pipes', 'structures'].every((k) => sc0.keys.includes(k)) && ['alignments', 'stations', 'corridors', 'breaklines', 'pads', 'daylight', 'eg-major'].every((k) => sc0.lines.includes(k)), `scene: ${sc0.keys.join(', ')} + ${sc0.lines.length} line sets`);
  ok(sc0.pipes === 2 && sc0.structs === 3 && sc0.origin.x === sc0.egOx, `2 pipes, 3 structures, local origin at E ${sc0.origin.x}`);
  const ink0 = await inked(page);
  ok(ink0 > 0.08, `the view draws the site (${(ink0 * 100).toFixed(0)}% of the canvas)`);
  await page.screenshot({ path: path.join(OUT, '01-3d-paper.png') });

  console.log('\n== navigation');
  const box = await page.locator('[data-3d-canvas]').boundingBox();
  const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
  let c0 = await cam(page);
  await page.mouse.move(cx, cy); await page.mouse.down({ button: 'middle' }); await page.mouse.move(cx + 120, cy + 30, { steps: 6 }); await page.mouse.up({ button: 'middle' });
  let c1 = await cam(page);
  ok(moved(c0, c1) && Math.abs(c0.dist - c1.dist) < 1e-6 * c0.dist && c0.target.every((v, i) => Math.abs(v - c1.target[i]) < 1e-9), 'middle-drag orbits about the target (same distance)');
  c0 = c1;
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx - 80, cy - 40, { steps: 6 }); await page.mouse.up();
  c1 = await cam(page);
  ok(moved(c0, c1) && c0.target.every((v, i) => Math.abs(v - c1.target[i]) < 1e-9), 'left-drag orbits too');
  c0 = c1;
  await page.mouse.move(cx, cy); await page.mouse.down({ button: 'right' }); await page.mouse.move(cx + 60, cy + 20, { steps: 5 }); await page.mouse.up({ button: 'right' });
  c1 = await cam(page);
  ok(moved(c0, c1) && !c0.target.every((v, i) => Math.abs(v - c1.target[i]) < 1e-9) && Math.abs(c0.dist - c1.dist) < 1e-6 * c0.dist, 'right-drag pans (target moves with the eye)');
  c0 = c1;
  await page.mouse.move(cx + 50, cy); await page.mouse.wheel(0, -300); await wait(100);
  c1 = await cam(page);
  ok(c1.dist < c0.dist * 0.8, `the wheel zooms in at the cursor (${c0.dist.toFixed(0)} → ${c1.dist.toFixed(0)})`);
  c0 = c1;
  await page.dispatchEvent('[data-3d-canvas]', 'wheel', { deltaX: 14, deltaY: 3.5, deltaMode: 0, clientX: cx, clientY: cy });
  c1 = await cam(page);
  ok(moved(c0, c1) && Math.abs(c0.dist - c1.dist) < 1e-6 * c0.dist, 'a trackpad two-finger swipe orbits');
  c0 = c1;
  await page.dispatchEvent('[data-3d-canvas]', 'wheel', { deltaX: 0, deltaY: 8, deltaMode: 0, ctrlKey: true, clientX: cx, clientY: cy });
  c1 = await cam(page);
  ok(c1.dist > c0.dist * 1.02, 'a pinch (ctrl + wheel) zooms');
  await page.selectOption('[data-3d-view]', 'top');
  c1 = await cam(page);
  ok(Math.abs(c1.eye[0] - c1.target[0]) < 1e-3 * c1.dist && c1.eye[2] > c1.target[2], 'View › Top looks straight down');
  await page.selectOption('[data-3d-view]', 'front');
  c1 = await cam(page);
  ok(c1.eye[1] < c1.target[1] && Math.abs(c1.eye[2] - c1.target[2]) < 1e-3 * c1.dist, 'View › Front looks north from the south');
  await page.selectOption('[data-3d-view]', 'iso');
  await page.click('[data-3d-persp]');
  ok((await cam(page)).persp === false && (await page.getAttribute('[data-3d-persp]', 'aria-pressed')) === 'false', 'Perspective off: parallel projection');
  await page.click('[data-3d-persp]');
  ok((await cam(page)).persp === true, 'and back on');
  await page.mouse.move(cx, cy); await page.mouse.wheel(0, 1500); await wait(50);
  await page.click('[data-3d-extents]');
  c1 = await cam(page);
  ok(c1.dist < 5000, `Extents brings the whole site back (${c1.dist.toFixed(0)} ft away)`);

  console.log('\n== exaggeration, colouring, toggles');
  const zTop = () => page.evaluate(() => window.civilcraft.view3d.scene.bbox.max[2]);
  const z2 = await zTop();
  await page.selectOption('[data-3d-exag]', '5');
  const z5 = await zTop();
  ok(Math.abs(z5 / z2 - 2.5) < 1e-3 && (await page.evaluate(() => window.civilcraft.view3d.scene.exag)) === 5, `5× vertical: heights 2.5 times the 2× ones (${z2.toFixed(1)} → ${z5.toFixed(1)})`);
  await page.selectOption('[data-3d-color]', 'single');
  ok(await page.evaluate(() => { const m = window.civilcraft.view3d.scene.meshes.find((x) => x.key === 'eg'); return m.indices.length / 3 === window.civilcraft.project.eg().surface.nT; }), 'One colour: the surface is the TIN as is (no band pieces)');
  await page.selectOption('[data-3d-color]', 'bands');
  await page.click('[data-3d-show-menu] > summary');
  for (const k of ['fg', 'pipes', 'contours', 'alignments']) await page.click(`[data-3d-show="${k}"]`);
  let sc = await page.evaluate(() => { const s = window.civilcraft.view3d.scene; return { m: s.meshes.map((x) => x.key), l: s.lines.map((x) => x.key) }; });
  ok(!sc.m.includes('fg') && !sc.m.includes('pipes') && !sc.l.some((k) => /major|minor/.test(k)) && !sc.l.includes('alignments'), 'Show: graded surface, pipes, contours and alignments toggle off');
  for (const k of ['fg', 'pipes', 'contours', 'alignments', 'points', 'triangles']) await page.click(`[data-3d-show="${k}"]`);
  sc = await page.evaluate(() => { const s = window.civilcraft.view3d.scene; return { m: s.meshes.map((x) => x.key), l: s.lines.map((x) => x.key), pts: s.points?.ids.length || 0 }; });
  ok(sc.m.includes('fg') && sc.m.includes('pipes') && sc.l.includes('eg-tin') && sc.pts === 276, 'and back on, with survey points (276) and triangle edges');
  await page.keyboard.press('Escape');
  ok(!(await page.evaluate(() => document.querySelector('[data-3d-show-menu]').open)), 'Esc closes the Show menu');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('civilcraft.view3d')));
  ok(saved.exag === 5 && saved.show.points === true, 'the 3D choices are remembered (localStorage civilcraft.view3d)');

  console.log('\n== picking');
  await page.click('[data-3d-show="triangles"]').catch(() => {});
  await page.selectOption('[data-3d-view]', 'iso');
  await page.click('[data-3d-extents]');
  const at = (x, y, z) => page.evaluate(([x, y, z]) => { const v = window.civilcraft.view3d, s = v.scene; const p = v.cam.project([x - s.origin.x, y - s.origin.y, (z - s.origin.z) * s.exag]); const r = v.view.canvas.getBoundingClientRect(); return { x: r.left + p[0], y: r.top + p[1] }; }, [x, y, z]);
  const rim2 = await page.evaluate(() => window.civilcraft.project.networkCheck().structs.get('s93').rim);
  let s = await at(E0 + 170, N0 + 110, rim2 - 1);
  await page.mouse.click(s.x, s.y); await wait(150);
  ok(await page.evaluate(() => window.civilcraft.sel?.kind === 'structure' && window.civilcraft.sel.id === 's93'), 'a click on structure S2 selects it');
  ok((await page.textContent('[data-props-h]')) === 'Structure' && (await page.inputValue('#cv-st-name')) === 'S2' && /S2[\s\S]*E 61501[67]\d\.\d\d +N 20801[01]\d\.\d\d +EL 2\d\d\.\d\d ft/.test(await page.textContent('[data-3d-tip]')) && !(await page.$eval('[data-3d-tip]', (e) => e.hidden)), 'Properties shows S2 and a tip names it with its coordinates');
  const q = await page.evaluate(() => { const n = window.civilcraft.project.state.network; const p = n.pipes[0], a = n.structures[0], b = n.structures[1]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (p.invUp + p.invDn) / 2 + 0.5 }; });
  s = await at(q.x, q.y, q.z);
  await page.mouse.click(s.x, s.y); await wait(150);
  ok(await page.evaluate(() => window.civilcraft.sel?.kind === 'pipe' && window.civilcraft.sel.id === 'q95'), 'a click on pipe P1 (under the ground) selects it');
  const pt = await page.evaluate(() => window.civilcraft.project.points.find((p) => p.n === '100'));
  s = await at(pt.x, pt.y, pt.z);
  await page.mouse.click(s.x + 1, s.y - 1); await wait(150);
  ok((await page.evaluate(() => window.civilcraft.picked)).join() === '100', 'a click on survey point 100 selects it');
  await page.screenshot({ path: path.join(OUT, '02-3d-picked-paper.png') });

  console.log('\n== exports');
  const glbFile = await download(page, () => page.click('[data-3d-glb]'));
  const glb = new Uint8Array(fs.readFileSync(glbFile));
  ok(/-3d\.glb$/.test(glbFile) && new DataView(glb.buffer).getUint32(0, true) === 0x46546c67, `GLB downloaded (${path.basename(glbFile)}, ${(glb.length / 1024).toFixed(0)} KB)`);
  if (validator) { const rep = await validator.validateBytes(glb, { maxIssues: 20 }); ok(rep.issues.numErrors === 0, `Khronos glTF validator: ${rep.issues.numErrors} errors, ${rep.issues.numWarnings} warnings`); }
  const jl = new DataView(glb.buffer).getUint32(12, true), gj = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jl)));
  ok(gj.scenes[0].extras.origin.easting === sc0.origin.x && gj.meshes.some((m) => m.name === 'Pipes') && gj.meshes.some((m) => m.name === 'Survey points'), 'the GLB carries what is shown (pipes, points) and the origin');
  const objFile = await download(page, () => page.click('[data-3d-obj]'));
  const objText = fs.readFileSync(objFile, 'utf8');
  ok(/^# CivilCraft site/.test(objText) && /\nf \d+\/\/\d+ /.test(objText) && /\nl \d+ \d+/.test(objText) && /\np \d+/.test(objText), `OBJ downloaded (${path.basename(objFile)}: faces, lines, points)`);
  ok(/Exported .*-3d\.obj/.test(await page.textContent('[data-status]')), 'the status line says what was exported');

  console.log('\n== model theme');
  const bg0 = await page.evaluate(() => window.civilcraft.view3d.view.scene.background.getHexString());
  await page.click('.space-toggle button[value="model"]');
  await page.waitForFunction(() => document.documentElement.dataset.space === 'model');
  await wait(300);
  const bg1 = await page.evaluate(() => window.civilcraft.view3d.view.scene.background.getHexString());
  ok(bg0 !== bg1 && parseInt(bg1, 16) < parseInt(bg0, 16), `the 3D view re-themes for model space (#${bg0} → #${bg1})`);
  const ink1 = await inked(page);
  ok(ink1 > 0.08, `and still draws the site (${(ink1 * 100).toFixed(0)}%)`);
  await page.screenshot({ path: path.join(OUT, '03-3d-model.png') });
  await page.click('.space-toggle button[value="paper"]');
  await page.waitForFunction(() => document.documentElement.dataset.space === 'paper');

  console.log('\n== back to the plan, key D');
  await page.keyboard.press('d');
  await page.waitForFunction(() => document.querySelector('[data-view3d]').hidden);
  ok((await page.getAttribute('[data-cmd="view3d"]', 'aria-pressed')) === 'false', 'D closes 3D: the plan is back');
  await page.focus('[data-over]');
  await page.keyboard.press('d');
  await page.waitForFunction(() => !document.querySelector('[data-view3d]').hidden);
  ok(true, 'D opens it again');
  await page.click('[data-cmd="alignment"]');
  ok(await page.evaluate(() => document.querySelector('[data-view3d]').hidden && window.civilcraft.tool === 'alignment'), 'a drawing tool (Alignment) goes back to the plan');
  await page.keyboard.press('Escape');

  console.log('\n== view cube');
  const cell = async (scope, key) => page.evaluate(([scope, key]) => {
    const r = [...document.querySelectorAll(scope + ' [data-viewcube] [data-vc-key="' + key + '"]')].map((e) => e.getBoundingClientRect()).find((b) => b.width > 2 && b.height > 2);
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null;
  }, [scope, key]);
  const dir3 = () => page.evaluate(() => { const c = window.civilcraft.view3d.cam, d = [c.target[0] - c.eye[0], c.target[1] - c.eye[1], c.target[2] - c.eye[2]], l = Math.hypot(...d); return d.map((v) => v / l); });
  await page.evaluate(() => window.civilcraft.setTool('select'));   // the plan, as the Alignment check left it
  ok(await page.evaluate(() => document.querySelector('[data-view3d]').hidden), 'on the plan');
  let pc = await cell('[data-plan] >', 'top-front');
  ok(!!pc, 'from the plan the cube shows its top (with the top front edge to click)');
  await page.mouse.click(pc.x, pc.y); await wait(500);
  let d = await dir3();
  ok(!(await page.evaluate(() => document.querySelector('[data-view3d]').hidden)) && Math.abs(d[1] - Math.SQRT1_2) < 0.01 && Math.abs(d[2] + Math.SQRT1_2) < 0.01, `a click on the plan cube's top front edge opens 3D looking from there (${d.map((v) => v.toFixed(3)).join(', ')})`);
  ok(await page.evaluate(() => { const p = document.querySelector('[data-plan] > [data-viewcube]'), q = document.querySelector('[data-view3d] [data-viewcube]'); return getComputedStyle(p).display === 'none' || p.hidden ? !!q && getComputedStyle(q).display !== 'none' : false; }), 'in 3D the plan\'s cube hides and the 3D view has its own');
  pc = await cell('[data-view3d]', 'front');
  await page.mouse.click(pc.x, pc.y); await wait(700);
  d = await dir3();
  ok(Math.abs(d[1] - 1) < 0.01 && Math.abs(d[0]) < 0.01, `3D cube Front: the camera looks north (${d.map((v) => v.toFixed(3)).join(', ')})`);
  pc = await cell('[data-view3d]', 'top-front-right');
  if (pc) { await page.mouse.click(pc.x, pc.y); await wait(700); d = await dir3(); ok(d[0] < -0.5 && d[1] > 0.5 && d[2] < -0.5, `a corner (top front right) looks from up, south and east (${d.map((v) => v.toFixed(2)).join(', ')})`); }
  const c2 = await cam(page);
  const cb = await page.locator('[data-view3d] [data-viewcube] svg').boundingBox();
  await page.mouse.move(cb.x + cb.width / 2, cb.y + cb.height / 2); await page.mouse.down(); await page.mouse.move(cb.x + cb.width / 2 + 40, cb.y + cb.height / 2 + 5, { steps: 5 }); await page.mouse.up();
  ok(moved(c2, await cam(page)), 'dragging the cube orbits');
  await page.locator('[data-view3d] [data-viewcube]').screenshot({ path: path.join(OUT, '06-cube-3d-paper.png') });
  await page.screenshot({ path: path.join(OUT, '07-3d-cube-paper.png') });
  await page.click('.space-toggle button[value="model"]');
  await page.waitForFunction(() => document.documentElement.dataset.space === 'model'); await wait(200);
  await page.locator('[data-view3d] [data-viewcube]').screenshot({ path: path.join(OUT, '08-cube-3d-model.png') });
  await page.click('.space-toggle button[value="paper"]');
  await page.waitForFunction(() => document.documentElement.dataset.space === 'paper');

  console.log('\n== Settings › CivilCraft: corner indicator and exaggeration');
  await page.selectOption('[data-3d-exag]', '3');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('civilcraft.settings')).exag === 3), 'the bar\'s exaggeration is the setting (3×)');
  await page.keyboard.press('Control+,');
  await page.waitForSelector('[data-app-settings][open]');
  ok((await page.isChecked('input[name="cvCorner"][value="cube"]')) && (await page.isChecked('input[name="cvExag"][value="3"]')), 'the settings show View cube and 3×');
  await page.check('input[name="cvExag"][value="10"]');
  ok(await page.evaluate(() => window.civilcraft.view3d.state.exag === 10 && document.querySelector('[data-3d-exag]').value === '10'), 'choosing 10× in Settings changes the 3D view and its bar');
  await page.check('input[name="cvCorner"][value="axes"]');
  ok(await page.evaluate(() => { const vis = (e) => !!e && !e.hidden && getComputedStyle(e).display !== 'none'; return !vis(document.querySelector('[data-view3d] [data-viewcube]')) && vis(document.querySelector('[data-view3d] [data-axis-icon]')); }), 'Axis icon: the 3D view swaps the cube for the X/Y/Z icon at once');
  await page.keyboard.press('Escape');
  await page.reload({ waitUntil: 'networkidle' });
  ok(await page.evaluate(() => { const vis = (e) => !!e && !e.hidden && getComputedStyle(e).display !== 'none'; return !vis(document.querySelector('[data-plan] > [data-viewcube]')) && vis(document.querySelector('[data-plan] > [data-axis-icon]')); }), 'after a reload the plan shows the axis icon (the setting persists)');
  await page.click('[data-cmd="view3d"]');
  await page.waitForFunction(() => window.civilcraft.view3d?.state);
  ok(await page.evaluate(() => window.civilcraft.view3d.state.exag === 10 && document.querySelector('[data-3d-exag]').value === '10'), 'and 3D opens at 10× (persisted)');
  await page.keyboard.press('Control+,');
  await page.waitForSelector('[data-app-settings][open]');
  await page.check('input[name="cvCorner"][value="none"]');
  ok(await page.evaluate(() => { const vis = (e) => !!e && !e.hidden && getComputedStyle(e).display !== 'none'; return !vis(document.querySelector('[data-view3d] [data-viewcube]')) && !vis(document.querySelector('[data-view3d] [data-axis-icon]')); }), 'None: no corner indicator');
  await page.click('[data-settings-reset]'); await wait(200);
  ok(await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('civilcraft.settings')), d = document.querySelector('[data-app-settings]'); return s.corner === 'cube' && s.exag === 2 && d.querySelector('input[name="cvCorner"][value="cube"]').checked && window.civilcraft.view3d.state.exag === 2 && !document.querySelector('[data-view3d] [data-viewcube]').hidden; }), 'Reset: View cube and 2× again (setting, dialog and 3D view)');
  await page.keyboard.press('Escape');

  console.log('\n== a 100k-triangle surface');
  const big = await page.evaluate(async () => {
    let seed = 7; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const pts = [];
    for (let i = 0; i < 50500; i++) { const x = 6.2e6 + r() * 3000, y = 2.1e6 + r() * 3000; pts.push({ n: String(i + 1), x, y, z: 500 + 20 * Math.sin(x / 300) + 15 * Math.cos(y / 400), d: 'GRD' }); }
    const cc = window.civilcraft;
    await cc.show3D(false);   // closed while the points change, so the timing below is the whole rebuild
    cc.project.state.network = null; cc.project.state.alignments = []; cc.project.state.pads = [];
    cc.project.setPoints(pts, 'big.csv');
    let t0 = performance.now();
    await cc.show3D(true);
    const v = cc.view3d;
    const tris = v.scene.counts.triangles;
    const build = performance.now() - t0;
    const gl = v.view.renderer.getContext(), px = new Uint8Array(4);
    const times = [];
    for (let k = 0; k < 6; k++) { v.cam.orbit(25, 3); t0 = performance.now(); v.view.draw(); gl.readPixels(1, 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); times.push(performance.now() - t0); }
    return { tris, build, frame: times.slice(1).reduce((a, b) => a + b, 0) / (times.length - 1), meshes: v.view.root.children.filter((o) => o.isMesh && o.name !== 'labels').length };   // the labels' mesh (0.5 WL.22) is not a surface
  });
  ok(big.tris >= 100000, `${big.tris} surface triangles in the 3D view`);
  ok(big.meshes === 1, 'one BufferGeometry for the surface');
  ok(big.build < 6000, `the scene rebuilt in ${big.build.toFixed(0)} ms`);
  ok(big.frame < 1500, `a frame draws in ${big.frame.toFixed(0)} ms in headless software WebGL (renders only on demand)`);
  await page.selectOption('[data-3d-view]', 'iso');
  await page.screenshot({ path: path.join(OUT, '04-3d-100k-paper.png') });

  await page.close();
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
} finally {
  await browser.close();
  if (!process.argv.includes('--stay-up')) { try { admin('down'); } catch { /* fine */ } }
  fs.rmSync(DL, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed  (screenshots in ${OUT})`);
process.exit(fail ? 1 : 0);
