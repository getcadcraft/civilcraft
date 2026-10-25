#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — PartCraft in headless Chromium at /lab/partcraft, driven by real clicks and keys.
 *
 *   node tools/partcraft-test/browser.mjs [--out <dir>] [--state <file>]
 * Run as root: it calls `sudo -u www-data php tools/partcraft-test/admin.php up|down` for the test admin
 * partcrafttest+cadcraft@projectz.xyz (disabled again at the end). The admin login is throttled
 * (10 per 10 minutes for 127.0.0.1, shared): the session is saved to --state and reused, so it signs
 * in at most once. Fails on any console error. Screenshots go to --out (default tmp/shots/partcraft).
 *
 * Covers: a block sketched on the top plane with the rectangle tool, dimensioned with the dimension
 * tool (typed values), tied to the origin with a relation button, fully defined; extrude by panel;
 * a circle sketched on the block's top face (picked in 3D), cut through all; linear pattern; a
 * dimension changed from the history panel rebuilds; suppress / roll back / reorder refusal;
 * undo/redo; drag in a sketch keeps relations; over-defined dimension named; save → reopen same
 * volume; STL / 3MF / STEP / DXF downloads (read back by trimesh / ezdxf when the venv exists);
 * the Catalog flange fixture; Model (dark) theme; 390 px phone width without page scroll.
 * Exact kernel (OpenCascade in its worker): waits for it to load (reports the time), checks exact volumes
 * (π, not polygons), fillets and chamfers on edges picked with clicks and Shift+clicks, pick mode,
 * a shell opened at a picked face, the fillet following a width change, exact STEP downloaded and read
 * back by native OpenCascade (cadquery-ocp), the STEP opened again as an imported solid and sketched
 * on, and the drawing sheet: a section view from the panel, a detail view, datum / feature control
 * frame / surface finish placed by clicks, edited in the panel, dragged, deleted, exported as PDF.
 * Edit (toolbar Edit + More menu, real clicks and keys): sketch geometry copied / pasted at a click / pasted in place /
 * duplicated / cut, with internal relations kept and undo/redo; Ctrl+A / Esc; a feature duplicated and pasted in the
 * history; an assembly part duplicated and pasted in place; disabled items say why; the toolbar stays one row at 1440 px.
 * Settings › PartCraft: middle-button orbit, trackpad scrolling, relations while sketching — kept after a reload, reset.
 * Per-area files (browser-<area>.mjs, each runnable alone through browser-harness.mjs) run near the end: workspaces, sketch tools.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/partcraft'));
const STATE = arg('--state', path.join(REPO, 'tmp/partcraft-test-state.json'));
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
const F = await import('./fixtures.mjs');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
/** Relative check for volumes: the kernel's meshes are single precision. */
const nearRel = (a, b, rel = 2e-6) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(b));
const PI = Math.PI;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/partcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true, ...(fs.existsSync(STATE) ? { storageState: STATE } : {}) });
let page = await ctx.newPage();
const problems = [];
const watch = (p) => {
  p.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  p.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
};
watch(page);
let signedIn = false;

async function open(url = '/lab/partcraft/0.2') {
  await page.goto(BASE + url, { waitUntil: 'networkidle' });
  if (/\/(admin\/)?login\b/.test(new URL(page.url()).pathname)) {
    const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
    await page.fill('input[name="email"]', admin.email);
    await page.fill('input[name="password"]', admin.password);
    await Promise.all([page.waitForNavigation(), page.click('form:has(input[name="password"]) button[type="submit"]:not([name="space"])')]);
    await ctx.storageState({ path: STATE });
    signedIn = true;
    await page.goto(BASE + url, { waitUntil: 'networkidle' });
  }
  await page.waitForFunction(() => window.partcraft && window.partcraft.regen, null, { timeout: 30000 });
  // the exact kernel (OpenCascade, ~7 MB gzipped) loads in its worker after the page is up
  await page.evaluate(() => window.partcraft.exactReady());
}

const pc = (fn, a) => page.evaluate(fn, a);
/** Wait until the part on screen is the part in memory (exact rebuilds run in a worker). */
const built = () => page.evaluate(() => window.partcraft.built());
const stats = async () => { await built(); return pc(() => window.partcraft.regen.stats); };
/** Page coordinates of a model point in the 3D view. */
const proj3 = (p) => pc((p) => { const v = window.partcraft.view; const q = new (v.camera.position.constructor)(p[0], p[1], p[2]).project(v.camera); const r = v.canvas.getBoundingClientRect(); return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height]; }, p);
const statusText = () => page.textContent('[data-status]');
/** Page coordinates of a sketch point. */
const sk2page = async (p) => pc((p) => { const e = window.partcraft.editor; const r = e.canvas.getBoundingClientRect(); const [x, y] = e.toScreen(p); return [r.left + x, r.top + y]; }, p);
async function clickSk(p, { shift = false } = {}) {
  const [x, y] = await sk2page(p);
  if (shift) await page.keyboard.down('Shift');
  await page.mouse.click(x, y);
  if (shift) await page.keyboard.up('Shift');
  await page.waitForTimeout(30);
}
async function moveSk(p) { const [x, y] = await sk2page(p); await page.mouse.move(x, y); }
async function typeInDim(v) {
  await page.waitForSelector('[data-dim-input]:not([hidden])');
  await page.fill('[data-dim-input]', String(v));
  await page.press('[data-dim-input]', 'Enter');
  await page.waitForTimeout(50);
}
/** Midpoint of the line of feature i's sketch that scores highest by fn(mid). */
const lineMid = (i, fn) => pc(([i, src]) => {
  const f = new Function('m', 'return (' + src + ')(m)');
  const sk = window.partcraft.part.features[i].sketch;
  const P = (id) => sk.entities.find((e) => e.id === id);
  const mids = sk.entities.filter((e) => e.type === 'line').map((l) => [(P(l.p1).x + P(l.p2).x) / 2, (P(l.p1).y + P(l.p2).y) / 2]);
  return mids.sort((a, b) => f(b) - f(a))[0];
}, [i, fn.toString()]);
const tool = (cmd) => page.click(`.pc-tools [data-cmd="${cmd}"]`);
/** New part by the toolbar, discarding changes when it asks. */
async function newPartUI() {
  await page.click('[data-cmd="new"]');
  await page.waitForFunction(() => document.querySelector('dialog[open]') || (window.partcraft.part.features.length === 0 && window.partcraft.mode === 'model'));
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 0 && !document.querySelector('dialog[open]'));
  await built();
}
async function shot(name) { await page.waitForTimeout(150); await page.screenshot({ path: path.join(OUT, name + '.png') }); }
async function download(fn) {
  const [d] = await Promise.all([page.waitForEvent('download'), fn()]);
  const p = path.join(OUT, d.suggestedFilename());
  await d.saveAs(p);
  return p;
}

try {
  await open();
  console.log('\n== empty part');
  const kload = await pc(() => window.partcraft.exact.loadMs);
  ok((await pc(() => window.partcraft.useExact)) && (await page.textContent('[data-kernel]')).includes('Exact kernel'), `the exact kernel (OpenCascade) loaded in its worker in ${(kload / 1000).toFixed(1)} s; the chip says so`);
  ok(await page.$eval('main > [role="toolbar"]', (n) => n.parentElement.tagName === 'MAIN'), 'toolbar is a direct child of <main>');
  ok((await pc(() => window.partcraft.part.features.length)) === 0, 'starts empty');
  await shot('01-empty');

  console.log('\n== block: rectangle on the top plane, dimensioned, fully defined');
  await page.click('[data-plane="top"]');
  await tool('sketch');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  ok(true, 'Sketch opens on the top plane');
  await page.keyboard.press('r');
  await clickSk([30, 20]); await clickSk([90, 52]);
  let sk = await pc(() => window.partcraft.part.features[0].sketch);
  ok(sk.entities.filter((e) => e.type === 'line').length === 4, 'rectangle = four lines');
  ok(sk.constraints.filter((c) => c.type === 'horizontal').length === 2 && sk.constraints.filter((c) => c.type === 'vertical').length === 2, 'two horizontal + two vertical relations');
  ok((await pc(() => window.partcraft.lastSolve.dof)) === 4, 'rectangle has 4 degrees of freedom');
  await tool('view-fit');
  // dimension tool: bottom line, then where the dimension goes
  await page.keyboard.press('d');
  const bottom = await lineMid(0, (m) => -m[1]);
  await clickSk(bottom); await clickSk([bottom[0], bottom[1] - 6]);
  await typeInDim(80);
  await tool('view-fit'); await page.keyboard.press('d');
  const right = await lineMid(0, (m) => m[0]);
  await clickSk(right); await clickSk([right[0] + 5, right[1]]);
  await typeInDim(50);
  sk = await pc(() => window.partcraft.part.features[0].sketch);
  const lens = sk.entities.filter((e) => e.type === 'line').map((l) => { const a = sk.entities.find((p) => p.id === l.p1), b = sk.entities.find((p) => p.id === l.p2); return Math.hypot(b.x - a.x, b.y - a.y); }).sort((a, b) => a - b);
  ok(near(lens[0], 50, 1e-6) && near(lens[3], 80, 1e-6), `typed dimensions drive the sketch (sides ${lens.map((v) => v.toFixed(3)).join(', ')})`);
  ok((await pc(() => window.partcraft.lastSolve.dof)) === 2, 'two degrees of freedom left (position)');
  // select the lower-left corner and the origin, then the Coincident button
  await tool('view-fit'); await page.keyboard.press('s');
  const corner = await pc(() => { const sk = window.partcraft.part.features[0].sketch; const pts = sk.entities.filter((e) => e.type === 'point'); pts.sort((a, b) => a.x + a.y - b.x - b.y); return [pts[0].x, pts[0].y]; });
  await clickSk(corner);
  if (process.env.PCDEBUG) console.log('after corner click', await pc(() => [...window.partcraft.editor.sel]), corner, await sk2page(corner));
  await clickSk([0, 0], { shift: true });
  if (process.env.PCDEBUG) console.log('after origin click', await pc(() => [...window.partcraft.editor.sel]));
  await page.click('.pc-right button:has-text("Coincident")');
  let solve = await pc(() => window.partcraft.lastSolve);
  ok(solve.status === 'full' && solve.dof === 0, 'corner on the origin: fully defined');
  ok((await page.textContent('[data-sketch-state]')).includes('Fully defined'), 'status chip says fully defined');
  await shot('02-sketch-full');
  // over-define: a third dimension on the top line conflicts
  await tool('view-fit'); await page.keyboard.press('d');
  const top = await lineMid(0, (m) => m[1]);
  await clickSk(top); await clickSk([top[0], top[1] + 6]);
  await typeInDim(90);
  solve = await pc(() => window.partcraft.lastSolve);
  ok(solve.status === 'over' && solve.conflicts.length >= 1, 'a conflicting dimension makes it over defined');
  ok((await statusText()).includes('Over defined') && (await page.textContent('.pc-right')).includes('Distance 90'), 'the conflict is named (Distance 90)');
  await shot('03-over-defined');
  await page.keyboard.press('Control+z');
  solve = await pc(() => window.partcraft.lastSolve);
  ok(solve.status === 'full', 'undo removes it: fully defined again');
  // Esc twice: back to select, then out of the sketch
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.partcraft.mode === 'model');
  ok(true, 'Esc closes the sketch');

  console.log('\n== extrude');
  await tool('extrude');
  let s = await stats();
  ok(s && nearRel(s.volume, 80 * 50 * 10), `extruded 10 by default: ${s?.volume}`);
  const depth = page.locator('.pc-right label:has-text("Depth") + input');
  await depth.fill('20'); await depth.press('Enter');
  s = await stats();
  ok(nearRel(s.volume, 80000), `depth 20 from the panel → 80 × 50 × 20 = 80000 (${s.volume})`);
  ok(near(s.bbox.min[1], 0, 1e-4) && near(s.bbox.max[1], 20, 1e-4) && near(s.bbox.max[0], 80, 1e-4) && near(s.bbox.min[2], -50, 1e-4), 'top-plane sketch extrudes up +Y (top plane sketch y = −Z)');
  await shot('04-extrude');

  console.log('\n== sketch on the top face, cut a hole through');
  await pc(() => window.partcraft.view.view('top'));
  await page.waitForTimeout(100);
  const glBox = await page.locator('[data-gl]').boundingBox();
  // the block centre (40, 20, −25) projected
  const pt = await pc(() => { const v = window.partcraft.view; const T = v.camera; const p = { x: 40, y: 20, z: -25 }; const THREEv = T.position.constructor; const q = new THREEv(p.x, p.y, p.z).project(T); const r = v.canvas.getBoundingClientRect(); return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height]; });
  await page.mouse.click(pt[0], pt[1]);
  const pk = await pc(() => window.partcraft.pick);
  ok(pk && pk.kind === 'face' && pk.flat && pk.ref.kind === 'face' && pk.ref.face === 'end', 'clicking the top face picks it as Extrude1\'s end face');
  await page.click('.pc-right button:has-text("Sketch on this face")');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  await page.keyboard.press('c');
  await clickSk([40, 25]); await clickSk([48, 25]);
  await page.keyboard.press('d');
  const circ = await pc(() => { const sk = window.partcraft.part.features.at(-1).sketch; const c = sk.entities.find((e) => e.type === 'circle'); const ce = sk.entities.find((e) => e.id === c.c); return [ce.x + c.r, ce.y]; });
  await clickSk(circ); await clickSk([circ[0] + 10, circ[1] + 10]);
  await typeInDim(16);
  const rr = await pc(() => window.partcraft.part.features.at(-1).sketch.entities.find((e) => e.type === 'circle').r);
  ok(near(rr, 8, 1e-9), 'circle diameter typed as 16 → r 8');
  await tool('exit-sketch');
  await tool('cut-extrude');
  s = await stats();
  const k64 = F.facetFactor(64);
  const H = PI * 64 * 20;   // one Ø16 hole through 20, exact
  void k64;
  ok(nearRel(s.volume, 80000 - H, 1e-9), `cut through all: 80000 − 64π·20 = ${(80000 - H).toFixed(6)} exactly (${s.volume.toFixed(6)})`);
  ok(s.genus === 1, 'one through hole (genus 1)');
  await shot('05-cut');

  console.log('\n== linear pattern of the cut');
  await tool('lpattern');
  s = await stats();
  const fid = await pc(() => window.partcraft.sel.id);
  await built();
  ok((await pc((id) => window.partcraft.regen.results.get(id).status, fid)) === 'ok', 'pattern builds');
  // default 3 along X at 20: holes at x 40, 60, 80 — the last is centred on the block's edge (a half notch)
  ok(s.genus === 2 && nearRel(s.volume, 80000 - 2.5 * H, 1e-9), `3 × 20 along X: two holes + a half notch on the edge (genus ${s.genus}, ${s.volume.toFixed(4)})`);
  const cnt = page.locator('.pc-right label:has-text("Count") + input');
  await cnt.fill('2'); await cnt.press('Enter');
  const sp = page.locator('.pc-right label:has-text("Spacing") + input');
  await sp.fill('25'); await sp.press('Enter');
  s = await stats();
  ok(s.genus === 2 && nearRel(s.volume, 80000 - 2 * H), `count 2, spacing 25: two holes (genus ${s.genus})`);
  await shot('06-pattern');

  console.log('\n== change a sketch dimension from the history: the part rebuilds');
  await page.click('.pc-tree [data-id="f2"]');
  const w80 = page.locator('.pc-right .pc-dimrow', { hasText: 'Distance' }).first().locator('input');
  ok((await w80.inputValue()) === '80', 'Extrude1 panel lists Sketch1\'s dimensions (80 first)');
  await w80.fill('120'); await w80.press('Enter');
  s = await stats();
  ok(near(s.bbox.max[0] - s.bbox.min[0], 120, 1e-6) && nearRel(s.volume, 120000 - 2 * H, 1e-9), `block 120 wide from the panel; holes kept (${s.volume.toFixed(4)})`);

  console.log('\n== suppress, roll back, reorder refusal, undo/redo');
  const nBefore = (await stats()).volume;
  await page.click('.pc-tree [data-id="f4"]');
  await page.click('.pc-right button:has-text("Suppress")');
  await built();
  let r4 = await pc(() => [window.partcraft.regen.results.get('f4').status, window.partcraft.regen.results.get('f5').status]);
  ok(r4[0] === 'suppressed' && r4[1] === 'skipped', 'suppress the cut: the pattern of it is skipped');
  ok((await stats()).volume > nBefore, 'material comes back');
  await page.click('.pc-right button:has-text("Unsuppress")');
  ok(nearRel((await stats()).volume, nBefore), 'unsuppress: same volume again');
  await page.click('.pc-right button:has-text("Roll back to here")');
  ok((await pc(() => window.partcraft.part.rollback)) === 3 && (await page.$('.pc-rollbar')) !== null, 'rollback bar above Extrude2/Cut');
  ok(nearRel((await stats()).volume, 120000), 'rolled back: the plain block (120000)');
  await page.click('.pc-rollbar');
  ok((await pc(() => window.partcraft.part.rollback)) === null, 'roll forward');
  await page.click('.pc-tree [data-id="f4"]');
  ok(await page.$eval('.pc-right button:has-text("Move up")', (b) => b.disabled), 'cut cannot move above the sketch it uses (Move up disabled)');
  await page.focus('.pc-tree [data-id="f4"]');
  await page.keyboard.press('Alt+ArrowUp');
  ok((await statusText()).includes('has to come first'), 'Alt+↑ refused with the reason');
  await page.keyboard.press('Control+z');
  await page.keyboard.press('Control+y');
  ok(nearRel((await stats()).volume, nBefore), 'undo + redo keep the part');

  console.log('\n== drag in a sketch keeps its relations');
  await page.dblclick('.pc-tree [data-id="f3"]');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  ok((await pc(() => window.partcraft.lastSolve.status)) === 'under', 'the face sketch\'s circle centre is free (under defined)');
  const cen = await pc(() => { const sk = window.partcraft.part.features.find((f) => f.id === 'f3').sketch; const c = sk.entities.find((e) => e.type === 'circle'); const p = sk.entities.find((e) => e.id === c.c); return [p.x, p.y]; });
  const [cx, cy] = await sk2page(cen);
  await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + 30, cy + 10, { steps: 5 }); await page.mouse.up();
  const after = await pc(() => { const sk = window.partcraft.part.features.find((f) => f.id === 'f3').sketch; const c = sk.entities.find((e) => e.type === 'circle'); const p = sk.entities.find((e) => e.id === c.c); return [p.x, p.y, c.r]; });
  ok(Math.hypot(after[0] - cen[0], after[1] - cen[1]) > 1 && near(after[2], 8, 1e-9), 'dragging moves the centre, the ⌀16 holds');
  await shot('07-sketch-face');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.partcraft.mode === 'model');

  console.log('\n== files');
  const sPart = (await stats()).volume;
  const saved = await download(() => page.keyboard.press('Control+s'));
  const json = JSON.parse(fs.readFileSync(saved, 'utf8'));
  ok(json.format === 'partcraft' && json.version === 2 && json.features.length === 5, 'saved JSON: format, version 2, five features');
  const stl = await download(async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-stl"]'); });
  const buf = fs.readFileSync(stl);
  ok(buf.readUInt32LE(80) * 50 + 84 === buf.length, 'STL: binary, size matches its triangle count');
  const step = await download(async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-step-faceted"]'); });
  ok(fs.readFileSync(step, 'utf8').startsWith('ISO-10303-21;') && /FACETED_BREP/.test(fs.readFileSync(step, 'utf8')), 'faceted STEP (the mesh) still downloads');
  const mf = await download(async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-3mf"]'); });
  await page.click('.pc-tree [data-id="f1"]');
  const dxf = await download(async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-dxf"]'); });
  ok(fs.readFileSync(dxf, 'utf8').includes('AC1009'), 'DXF (R12) of Sketch1 downloaded');
  if (fs.existsSync(PY)) {
    const out = execFileSync(PY, ['-c', `
import sys, trimesh, ezdxf
m = trimesh.load(sys.argv[1]); print('stl', round(float(m.volume), 3), m.is_watertight)
s = trimesh.load(sys.argv[2]); g = list(s.geometry.values())[0]; print('3mf', round(float(g.volume), 3))
d = ezdxf.readfile(sys.argv[3]); print('dxf', len([e for e in d.modelspace() if e.dxftype() == 'LINE']))
`, stl, mf, dxf], { encoding: 'utf8' });
    const v = out.match(/stl ([\d.]+) True/), v3 = out.match(/3mf ([\d.]+)/), dl = out.match(/dxf (\d+)/);
    ok(v && near(+v[1], sPart, sPart * 2e-3), `trimesh reads the STL (exact solid tessellated): watertight, volume ${v && v[1]} ≈ ${sPart.toFixed(3)}`);
    ok(v3 && near(+v3[1], sPart, sPart * 2e-3), `trimesh reads the 3MF: volume ${v3 && v3[1]}`);
    ok(dl && +dl[1] === 4, 'ezdxf reads the DXF: four lines');
  }
  // reopen through the file input
  await page.click('.pc-tree [data-id="f2"]');
  const dep = page.locator('.pc-right label:has-text("Depth") + input');
  await dep.fill('21'); await dep.press('Enter');
  await page.click('[data-cmd="new"]');
  await page.waitForSelector('dialog[open]');
  ok((await page.textContent('dialog[open]')).includes('not saved'), 'New asks about unsaved changes in the page');
  await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 0, null, { timeout: 5000 }).catch(() => {});
  ok((await pc(() => window.partcraft.part.features.length)) === 0, 'New (discard) empties the part');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-cmd="open"]')]);
  await chooser.setFiles(saved);
  await page.waitForFunction(() => window.partcraft.part.features.length === 5);
  ok(nearRel((await stats()).volume, sPart, 1e-9), 'reopened file rebuilds to the same volume');
  await shot('08-reopened');

  console.log('\n== fillet, chamfer and shell on edges and faces picked in the view (exact kernel)');
  {
    // a fresh 100 × 50 × 20 block (fixture), opened as a file
    const part = (await import('./fixtures.mjs')).blockSketch(100, 50);
    const P = await import('../../public_html/assets/apps/partcraft/dev/part.js');
    const bp = P.newPart('Block');
    const s1 = P.addFeature(bp, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: part.sk });
    P.addFeature(bp, 'extrude', { sketch: s1.id, depth: 20 });
    await newPartUI();
    await pc((t) => window.partcraft.openText(t, 'Block.partcraft.json'), JSON.stringify(bp));
    s = await stats();
    ok(nearRel(s.volume, 100000, 1e-9), 'block 100 × 50 × 20 opened');
    await pc(() => window.partcraft.view.view('iso'));
    await page.waitForTimeout(100);
    // two vertical edges: click one, Shift+click the other
    const vert = await pc(() => window.partcraft.regen.edges.map((e, i) => ({ i, at: e.at, side: e.faces.every((n) => n.includes('.side:')) })).filter((e) => e.side));
    const clickEdge = async (at, shift) => { const [x, y] = await proj3(at); if (shift) await page.keyboard.down('Shift'); await page.mouse.click(x, y); if (shift) await page.keyboard.up('Shift'); await page.waitForTimeout(40); };
    // the two front vertical edges seen in iso: x 0 and x 100 at z 0
    const e1 = vert.find((e) => near(e.at[0], 0, 1e-6) && near(e.at[2], 0, 1e-6)), e2 = vert.find((e) => near(e.at[0], 100, 1e-6) && near(e.at[2], 0, 1e-6));
    await clickEdge(e1.at, false);
    let pk = await pc(() => window.partcraft.pick);
    ok(pk && pk.kind === 'edge' && pk.edge === e1.i && near(pk.info.len, 20, 1e-9), 'clicking an edge picks the exact edge (length 20, the two faces it joins)');
    await clickEdge(e2.at, true);
    ok((await pc(() => window.partcraft.multi.length)) === 2, 'Shift+click adds the second edge');
    await shot('16-edges-picked');
    await tool('fillet');
    s = await stats();
    const fil = await pc(() => window.partcraft.part.features.at(-1));
    ok(fil.type === 'fillet' && fil.edges.length === 2, 'Fillet makes a fillet of the two picked edges');
    const rIn = page.locator('.pc-right label:has-text("Radius") + input');
    await rIn.fill('5'); await rIn.press('Enter');
    s = await stats();
    const corner = (25 - 25 * PI / 4) * 20;
    ok(nearRel(s.volume, 100000 - 2 * corner, 1e-9), `radius 5 from the panel: 100000 − 2·(5² − 25π/4)·20 = ${(100000 - 2 * corner).toFixed(6)} (${s.volume.toFixed(6)})`);
    await shot('17-fillet');
    // the block grows to 120 wide (Extrude1's sketch dimension in the panel): the fillet keeps its edges
    await page.click('.pc-tree [data-id="f2"]');
    const w = page.locator('.pc-right .pc-dimrow', { hasText: 'Distance' }).first().locator('input');
    await w.fill('120'); await w.press('Enter');
    s = await stats();
    ok(nearRel(s.volume, 120000 - 2 * corner, 1e-9) && (await pc(() => window.partcraft.regen.results.get('f3').status)) === 'ok', 'width 100 → 120: the fillet follows its two edges (named by their faces)');
    // shell: pick the top face, then "Shell, opening this face"
    await pc(() => window.partcraft.view.view('iso'));
    await page.waitForTimeout(80);
    const topPt = await proj3([60, 20, -25]);
    await page.mouse.click(topPt[0], topPt[1]);
    pk = await pc(() => window.partcraft.pick);
    ok(pk && pk.kind === 'face' && pk.info && pk.info.type === 'plane' && pk.info.name === 'f2.end', 'clicking the top face picks it (exact face f2.end)');
    await page.click('.pc-right button:has-text("Shell, opening this face")');
    s = await stats();
    const outer = 120000 - 2 * corner, inner = (116 * 46 - 2 * (9 - 9 * PI / 4)) * 18;
    ok(nearRel(s.volume, outer - inner, 1e-9), `Shell 2 mm, top open: ${(outer - inner).toFixed(6)} exactly (${s.volume.toFixed(6)})`);
    await shot('18-shell');
    // chamfer with nothing picked: pick mode, click the outer bottom edge at the back, Done
    await page.keyboard.press('Escape');
    await tool('chamfer');
    await page.waitForFunction(() => window.partcraft.mode === 'pick');
    ok(true, 'Chamfer with nothing picked opens pick mode (the part as it is before the chamfer)');
    await pc(() => window.partcraft.view.view('bottom'));
    await page.waitForTimeout(80);
    const bEdges = await pc(() => window.partcraft.regen.edges.filter((e) => e.faces.includes('f2.start') && e.type === 'line' && !e.faces.some((n) => n.includes('~'))).map((e) => e.at));
    const back = bEdges.sort((a, b) => a[2] - b[2])[0];
    const [bx, by] = await proj3(back);
    await page.mouse.click(bx, by);
    await built();
    ok((await pc(() => window.partcraft.part.features.at(-1).edges.length)) === 1, 'clicking an edge in pick mode adds it to the chamfer');
    await tool('pick-done');
    await page.waitForFunction(() => window.partcraft.mode === 'model');
    s = await stats();
    const ch = await pc(() => [window.partcraft.regen.results.get(window.partcraft.part.features.at(-1).id).status, window.partcraft.regen.faces.filter((f) => f.name && f.name.includes('.bevel:')).length]);
    ok(ch[0] === 'ok' && ch[1] >= 1 && s.volume < outer - inner, `Done: the chamfer builds (${ch[1]} bevel face${ch[1] === 1 ? '' : 's'}; the bottom outline is one tangent chain with the rounds)`);
    await pc(() => window.partcraft.view.view('iso'));
    await shot('19-chamfer');
    ok((await page.textContent('.pc-tree')).includes('Fillet1') && (await page.textContent('.pc-tree')).includes('Shell1') && (await page.textContent('.pc-tree')).includes('Chamfer1'), 'the history lists Fillet1, Shell1, Chamfer1');

    console.log('\n== exact STEP out, read back, and in again');
    const vNow = (await stats()).volume;
    const stp = await download(async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-step"]'); });
    const txt = fs.readFileSync(stp, 'utf8');
    ok(/AP242_MANAGED_MODEL_BASED_3D_ENGINEERING/.test(txt) && /CYLINDRICAL_SURFACE/.test(txt) && !/FACETED_BREP/.test(txt), 'STEP AP242 (exact) downloads: true cylindrical faces for the rounds, no facets');
    if (fs.existsSync(PY) && execFileSync(PY, ['-c', 'import OCP; print(1)'], { encoding: 'utf8' }).trim() === '1') {
      const out = execFileSync(PY, ['-c', `
import sys
from OCP.STEPControl import STEPControl_Reader
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.BRepCheck import BRepCheck_Analyzer
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g); print(g.Mass(), BRepCheck_Analyzer(s).IsValid())
`, stp], { encoding: 'utf8' }).trim().split(/\s+/);
      ok(nearRel(+out[0], vNow, 1e-7) && out[1] === 'True', `native OpenCascade (cadquery-ocp) reads the download: valid, volume ${(+out[0]).toFixed(4)} = ours`);
    }
    // open the STEP file: a new part with it as an imported solid
    const ch2 = page.waitForEvent('filechooser');
    await page.click('[data-cmd="open"]');
    await page.waitForTimeout(150);
    if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
    await (await ch2).setFiles(stp);
    await page.waitForSelector('dialog[open]');
    ok((await page.textContent('dialog[open]')).includes('1 solid'), 'opening a STEP file asks: add to this part or a new part (1 solid)');
    await page.click('dialog[open] button[data-key="new"]');
    await page.waitForTimeout(150);
    if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
    await page.waitForFunction(() => window.partcraft.part.features[0]?.type === 'import');
    s = await stats();
    ok(nearRel(s.volume, vNow, 1e-7), `the STEP comes back as an imported solid, same volume (${s.volume.toFixed(4)})`);
    // sketch on one of its flat faces: the bottom
    await pc(() => window.partcraft.view.view('bottom'));
    await page.waitForTimeout(80);
    const bot = await proj3([20, 0, -10]);
    await page.mouse.click(bot[0], bot[1]);
    pk = await pc(() => window.partcraft.pick);
    ok(pk && pk.flat && pk.ref.kind === 'face' && pk.ref.face === 'named' && /^f1\.face:\d+$/.test(pk.ref.name), `a flat face of the imported solid is a named reference (${pk && pk.ref.name})`);
    await shot('20-step-imported');
    await page.keyboard.press('Escape');

    console.log('\n== the drawing sheet: section, detail, GD&T');
    await newPartUI();
    await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
    await built();
    await tool('drawing');
    await page.waitForFunction(() => window.partcraft.mode === 'drawing' && window.partcraft.drawing?.sheet, null, { timeout: 20000 });
    ok(await page.isVisible('[data-sheet] svg'), 'Drawing shows the sheet (SVG) with the HLR views');
    await page.selectOption('.pc-right label:has-text("Section A-A") + select', 'front');
    await page.waitForFunction(() => window.partcraft.drawing?.sheet?.views?.section, null, { timeout: 20000 });
    ok(true, 'Section A-A of the front view from the panel');
    const sheetPt = async (view, u, v) => pc(([view, u, v]) => { const st = window.partcraft.drawing; const p = st.sheet.place[view]; const sx = p.x + (u - p.box.u0) * p.s, sy = p.y + (v - p.box.v0) * p.s; const sv = document.querySelector('[data-sheet] svg'); const r = sv.getBoundingClientRect(); const vw = window.partcraft.drawing; void vw; const m = sv.querySelector('g').getAttribute('transform').match(/matrix\(([^)]+)\)/)[1].split(' ').map(Number); return [r.left + m[0] * sx + m[4], r.top + m[3] * sy + m[5]]; }, [view, u, v]);
    // datum A on the front view's bottom edge
    await tool('dr-datum');
    let q = await sheetPt('front', 0, 0.3); await page.mouse.click(q[0], q[1]);
    let notes = await pc(() => window.partcraft.part.drawing.notes);
    ok(notes.length === 1 && notes[0].kind === 'datum' && notes[0].letter === 'A' && notes[0].view === 'front' && near(notes[0].at[1], 0, 1e-6), 'Datum: one click on the front view puts datum A on the bottom edge (snapped to the line)');
    // a feature control frame on a bolt hole in the top view
    await tool('dr-fcf');
    q = await sheetPt('top', 82, 0); await page.mouse.click(q[0], q[1]);
    notes = await pc(() => window.partcraft.part.drawing.notes);
    ok(notes.length === 2 && notes[1].kind === 'fcf' && notes[1].view === 'top', 'Frame: a feature control frame placed on the top view');
    await page.selectOption('.pc-right label:has-text("Tolerance") + select', 'position');
    await page.locator('.pc-right label:has-text("Diameter zone") input').check();
    const tolIn = page.locator('.pc-right label:has-text("Zone (mm)") + input');
    await tolIn.fill('0.2'); await tolIn.press('Enter');
    await page.selectOption('.pc-right label:has-text("Material") + select', 'M');
    notes = await pc(() => window.partcraft.part.drawing.notes);
    ok(notes[1].char === 'position' && notes[1].dia && notes[1].tol === 0.2 && notes[1].mod === 'M' && notes[1].datums[0].letter === 'A' && (await page.textContent('.pc-right')).includes('Position dia 0.2 (M) | A'), 'set in the panel: position ⌀0.2 Ⓜ to datum A');
    // finish on the section
    await tool('dr-finish');
    q = await sheetPt('section', -70, 30); await page.mouse.click(q[0], q[1]);   // the disc's top at x −70 (clear of the frame, which hangs over the section's left end)
    notes = await pc(() => window.partcraft.part.drawing.notes);
    ok(notes.length === 3 && notes[2].kind === 'finish' && notes[2].view === 'section', 'Finish: a surface finish symbol on the section');
    // drag the frame by 10 mm to the right
    const before = notes[1].off;
    const nb = await pc(() => window.partcraft.drawing.sheet.notes.find((n) => n.id === 'g2').box);
    const c0 = await pc(([x, y]) => { const sv = document.querySelector('[data-sheet] svg'); const r = sv.getBoundingClientRect(); const m = sv.querySelector('g').getAttribute('transform').match(/matrix\(([^)]+)\)/)[1].split(' ').map(Number); return [r.left + m[0] * x + m[4], r.top + m[3] * y + m[5], m[0]]; }, [(nb[0] + nb[2]) / 2 + 3, (nb[1] + nb[3]) / 2]);
    await page.mouse.move(c0[0], c0[1]); await page.mouse.down(); await page.mouse.move(c0[0] + 10 * c0[2], c0[1], { steps: 6 }); await page.mouse.up();
    notes = await pc(() => window.partcraft.part.drawing.notes);
    ok(near(notes[1].off[0] - before[0], 10, 0.6) && near(notes[1].off[1], before[1], 0.6), `dragging the frame moves it 10 mm on the sheet (${(notes[1].off[0] - before[0]).toFixed(2)})`);
    // a detail of the section around the right bolt hole
    await tool('dr-detail');
    q = await sheetPt('section', 75, 15); await page.mouse.click(q[0], q[1]);
    await page.waitForFunction(() => window.partcraft.drawing?.sheet?.views?.detail);
    ok((await pc(() => window.partcraft.part.drawing.detail.of)) === 'section', 'Detail: a click on the section places detail B');
    await shot('21-drawing');
    // a fourth note deleted with the Delete key, then undo brings it back
    await tool('dr-datum');
    q = await sheetPt('right', 0, 0.3); await page.mouse.click(q[0], q[1]);
    ok((await pc(() => window.partcraft.part.drawing.notes.at(-1).letter)) === 'B', 'a second datum gets the next letter (B)');
    await page.keyboard.press('Delete');
    ok((await pc(() => window.partcraft.part.drawing.notes.length)) === 3, 'Delete removes the selected note');
    const pdf = await download(() => tool('dr-pdf'));
    const ptxt = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' });
    ok(/Section A-A/.test(ptxt) && /Detail B/.test(ptxt) && /0\.2/.test(ptxt) && /Ra 1\.6|Ra 3\.2|Ra \d/.test(ptxt), 'PDF: section A-A, detail B, the frame\'s 0.2 and the Ra value');
    execFileSync('pdftoppm', ['-png', '-r', '70', '-singlefile', pdf, path.join(OUT, '22-drawing-pdf')]);
    // saved with the part
    const sv = await download(() => page.keyboard.press('Control+s'));
    const sj = JSON.parse(fs.readFileSync(sv, 'utf8'));
    ok(sj.drawing && sj.drawing.section.of === 'front' && sj.drawing.notes.length === 3 && sj.drawing.detail, 'the notes, section and detail are saved in the part file');
    await page.evaluate(() => document.documentElement.setAttribute('data-space', 'model'));
    await page.waitForTimeout(200);
    await shot('23-drawing-model');
    await page.evaluate(() => document.documentElement.setAttribute('data-space', 'paper'));
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => window.partcraft.mode === 'model');
    ok(true, 'Esc goes back to the model');
  }

  console.log('\n== the Catalog flange');
  const fl = F.flange();
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(fl.part));
  s = await stats();
  ok(nearRel(s.volume, PI * 302160, 1e-9) && s.genus === 9, `flange: volume ${s.volume.toFixed(6)} = 302160π exactly, 9 through holes`);
  await pc(() => window.partcraft.view.view('iso'));
  await shot('09-flange-paper');
  await page.click('.pc-tree [data-id="f1"]');
  const hubTop = page.locator('.pc-right .pc-dimrow', { hasText: 'Horizontal distance' }).nth(3).locator('input');
  await hubTop.fill('45'); await hubTop.press('Enter');
  s = await stats();
  const exp45 = PI * (265320 + 50 / 3 * (52 * 52 + 52 * 45 + 45 * 45) - 34 * 34 * 50 - 8 * 49 * 30);
  await built();
  ok(nearRel(s.volume, exp45, 1e-9), `hub top Ø80 → Ø90 from the panel: volume ${s.volume.toFixed(3)} (expected ${exp45.toFixed(3)})`);
  ok((await pc(() => window.partcraft.regen.results.get('f3').status)) === 'ok', 'the hole sketch still sits on the disc\'s top face');

  console.log('\n== assembly: two flanges joined face to face');
  await tool('asm-new');
  await page.waitForFunction(() => window.partcraft.mode === 'assembly');
  const asmBuilt = () => page.evaluate(() => window.partcraft.asmBuilt());
  await asmBuilt();
  ok((await pc(() => window.partcraft.asm.instances.length)) === 1, 'Assembly starts with the open part, grounded');
  await tool('asm-insert-copy');
  await asmBuilt();
  ok((await pc(() => window.partcraft.asm.instances.length)) === 2, 'Add copy inserts a second flange beside it');
  await page.click('.pc-tools [data-cmd="view-fit"]');
  await pc(() => window.partcraft.view.view('bottom'));
  const proj = (p) => pc((p) => { const v = window.partcraft.view; const q = new (v.camera.position.constructor)(p[0], p[1], p[2]).project(v.camera); const r = v.canvas.getBoundingClientRect(); return [r.left + (q.x + 1) / 2 * r.width, r.top + (1 - q.y) / 2 * r.height]; }, p);
  const dx2 = await pc(() => window.partcraft.asmPlace.world.get(window.partcraft.asm.instances[1].id)[12]);
  await page.keyboard.press('j');
  let pt1 = await proj([0, 0, 50]); await page.mouse.click(pt1[0], pt1[1]);
  pt1 = await proj([dx2, 0, 50]); await page.mouse.click(pt1[0], pt1[1]);
  await asmBuilt();
  const asmNow = await pc(() => ({ joints: window.partcraft.asm.joints, problems: window.partcraft.asmPlace.problems }));
  ok(asmNow.joints.length === 1 && asmNow.joints[0].type === 'revolute' && asmNow.problems.length === 0, 'Joint: two clicks on the discs\' bottom faces → a revolute joint, both placed');
  const W2 = await pc(() => window.partcraft.asmPlace.world.get(window.partcraft.asm.instances[1].id));
  ok(near(W2[13], 0, 1e-6) && near(W2[5], -1, 1e-9) && near(W2[12], 0, 1e-6), 'the copy turned over onto the first flange (face to face, same axis)');
  await page.click('.pc-tools [data-cmd="asm-check"]');
  ok((await pc(() => window.partcraft.clashes.length)) === 0 && /No interference/.test(await statusText()), 'Clash: no interference');
  const off = page.locator('.pc-right label:has-text("Offset") + input');
  await off.fill('-2'); await off.press('Enter');
  await asmBuilt();
  await page.click('.pc-tools [data-cmd="asm-check"]');
  const cl = await pc(() => window.partcraft.clashes);
  ok(cl.length === 1 && nearRel(cl[0].volume, 2 * PI * 8452, 3e-3), `pushed 2 mm into each other: overlap ${cl[0]?.volume.toFixed(3)} mm³ ≈ 2·8452π = ${(2 * PI * 8452).toFixed(3)} (clash runs on the exact solids' tessellation)`);
  await off.fill('0'); await off.press('Enter');
  await asmBuilt();
  await page.click('.pc-right button:has-text("Check the motion")');
  ok(/No clash anywhere/.test(await statusText()), 'motion check of the revolute joint: no clash all the way round');
  const ang = page.locator('.pc-right input[type="range"]');
  await ang.fill('45');
  ok(near((await pc(() => window.partcraft.asm.joints[0].angle)), 45, 1e-9), 'dragging the angle slider turns the second flange');
  await pc(() => window.partcraft.view.view('iso'));
  await shot('15-assembly');
  const asmFile = await download(() => page.keyboard.press('Control+s'));
  const aj = JSON.parse(fs.readFileSync(asmFile, 'utf8'));
  ok(aj.format === 'partcraft-assembly' && aj.instances.length === 2 && aj.joints.length === 1 && Object.keys(aj.parts).length === 1, 'assembly saves as one file with the part inside');
  // edit the part from the assembly: both copies change
  await page.click('.pc-tree [data-inst]');
  await tool('asm-edit');
  await page.waitForFunction(() => window.partcraft.mode === 'model');
  await page.click('.pc-tree [data-id="f4"]');
  const dia = page.locator('.pc-right label:has-text("Diameter") + input');
  await dia.fill('16'); await dia.press('Enter');
  await built();
  await tool('asm-back');
  await page.waitForFunction(() => window.partcraft.mode === 'assembly');
  await asmBuilt();
  const holeD = await pc(() => Object.values(window.partcraft.asm.parts)[0].part.features.find((f) => f.id === 'f4').d);
  ok(holeD === 16, 'Edit part → hole Ø16 → Back: the assembly\'s part has the change');
  await page.click('.pc-tools [data-cmd="asm-close"]');
  await page.waitForSelector('dialog[open]');
  await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.mode === 'model');
  const chooserP = page.waitForEvent('filechooser');
  await page.click('[data-cmd="open"]');
  await page.waitForTimeout(200);
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  (await chooserP).setFiles(asmFile);
  await page.waitForFunction(() => window.partcraft.mode === 'assembly');
  await asmBuilt();
  ok((await pc(() => window.partcraft.asm.joints.length)) === 1 && (await pc(() => window.partcraft.asmPlace.problems.length)) === 0, 'the saved assembly reopens with its joint');
  await page.click('.pc-tools [data-cmd="asm-close"]');
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.mode === 'model');

  console.log('\n== Model (dark) theme and phone width');
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'model'));
  await page.waitForTimeout(200);
  await shot('10-flange-model');
  const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.pc-panel')).backgroundColor);
  ok(bg !== 'rgb(255, 255, 255)', 'dark theme panels: ' + bg);
  await page.dblclick('.pc-tree [data-id="f1"]');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  ok((await pc(() => window.partcraft.lastSolve.status)) === 'full', 'flange profile sketch is fully defined');
  await shot('11-flange-sketch-model');
  // double-click the hub-top dimension (45) on the canvas and type 40: back to the Catalog flange
  const box45 = await pc(() => { const e = window.partcraft.editor; const sk = window.partcraft.part.features[0].sketch; const c = sk.constraints.find((k) => k.value === 45); const b = e.dimBoxes.find((x) => x.id === c.id); const r = e.canvas.getBoundingClientRect(); return b && [r.left + b.x + b.w / 2, r.top + b.y + b.h / 2]; });
  ok(!!box45, 'the 45 dimension is drawn on the sketch');
  await page.mouse.dblclick(box45[0], box45[1]);
  await typeInDim(40);
  ok((await pc(() => window.partcraft.part.features[0].sketch.constraints.some((k) => k.value === 40 && k.type === 'hdistance'))), 'double-click a dimension, type 40, Enter: the dimension changes');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.partcraft.mode === 'model');
  s = await stats();
  ok(nearRel(s.volume, PI * 302160, 1e-9), 'closing the sketch rebuilds the Catalog flange volume (302160π)');
  const drawing = await download(async () => { await page.click('[data-export-menu] summary'); await page.click('[data-cmd="export-drawing"]'); });
  const pinfo = execFileSync('pdfinfo', [drawing], { encoding: 'utf8' });
  ok(/Page size:\s+1190\.55 x 841\.89/.test(pinfo), 'Drawing (PDF) downloads an A3 sheet that pdfinfo reads');
  execFileSync('pdftoppm', ['-png', '-r', '60', '-singlefile', drawing, path.join(OUT, '13-drawing')]);
  await page.evaluate(() => document.documentElement.setAttribute('data-space', 'paper'));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(300);
  // the app's own area (<main>); the shared app bar above it is site chrome (its Paper/Model form is
  // wider than 390 px in every lab app — reported, not ours to change)
  const sw = await page.evaluate(() => { const m = document.querySelector('main'); const wide = [...m.querySelectorAll('*')].filter((n) => { const b = n.getBoundingClientRect(); return b.right > innerWidth + 1 && !n.closest('.pc-tools'); }).length; return [m.scrollWidth, window.innerWidth, wide, document.documentElement.scrollWidth]; });
  ok(sw[0] <= sw[1] && sw[2] === 0, `PartCraft's area has no horizontal scroll at 390 px (main ${sw[0]} ≤ ${sw[1]}, ${sw[2]} elements past the edge; toolbar scrolls inside itself; whole page ${sw[3]})`);
  await shot('12-phone');
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('\n== revolve and fillet by keyboard and clicks');
  await page.click('[data-cmd="new"]');
  if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
  await page.waitForFunction(() => window.partcraft.part.features.length === 0);
  await page.click('[data-plane="front"]');
  await page.keyboard.press('s');   // S = sketch on the selected plane
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  const addNum = async (kind, a, b) => {
    await page.selectOption('.pc-right form select', kind);
    await page.fill('#pc-num-0', a); if (b !== undefined) await page.fill('#pc-num-1', b);
    await page.press('#pc-num-0', 'Enter');
  };
  await addNum('centerline', '0, 0', '0, 50');
  await addNum('rect', '10, 0', '20, 30');
  sk = await pc(() => window.partcraft.part.features[0].sketch);
  ok(sk.entities.filter((e) => e.type === 'line').length === 5 && sk.entities.some((e) => e.construction), 'centerline + rectangle typed in "Add by coordinates"');
  await tool('exit-sketch');
  await tool('revolve');
  s = await stats();
  ok(nearRel(s.volume, PI * (400 - 100) * 30, 1e-9) && s.genus === 1, `revolved ring = π(20² − 10²)·30 exactly (${s.volume.toFixed(6)})`);
  // keyboard orbit of the 3D view
  await page.focus('[data-gl]');
  const camBefore = await pc(() => window.partcraft.view.camera.position.toArray());
  await page.keyboard.press('ArrowLeft');
  const camAfter = await pc(() => window.partcraft.view.camera.position.toArray());
  ok(Math.hypot(...camBefore.map((v, i) => v - camAfter[i])) > 1, 'arrow keys turn the 3D view');
  // fillet and arc tools by clicks on a new sketch on the top plane
  await page.click('[data-plane="top"]');
  await tool('sketch');
  await page.waitForFunction(() => window.partcraft.mode === 'sketch');
  await addNum('rect', '40, -20', '80, 10');
  await tool('view-fit');
  await page.keyboard.press('f');
  const fcorner = await pc(() => { const sk = window.partcraft.part.features.at(-1).sketch; const p = sk.entities.filter((e) => e.type === 'point').sort((a, b) => (b.x - b.y) - (a.x - a.y))[0]; return [p.x, p.y]; });
  await clickSk(fcorner);
  await typeInDim(6);
  sk = await pc(() => window.partcraft.part.features.at(-1).sketch);
  ok(sk.entities.some((e) => e.type === 'arc') && sk.constraints.some((c) => c.type === 'radius' && c.value === 6), 'fillet tool: click a corner, type 6 → a tangent arc with R6');
  await page.keyboard.press('a');
  await clickSk([60, -5]); await clickSk([66, -5]);
  await moveSk([63, 0]); await moveSk([60, 1]); await clickSk([60, 1]);
  sk = await pc(() => window.partcraft.part.features.at(-1).sketch);
  ok(sk.entities.filter((e) => e.type === 'arc').length === 2, 'arc tool: centre, start, end');
  await page.keyboard.press('Control+z');
  await tool('exit-sketch');
  await tool('extrude');
  s = await stats();
  const plate = (40 * 30 - (36 - 9 * PI)) * 10;   // the R6 corner removes r² − πr²/4
  ok(s.bodies === 2 && nearRel(s.volume, PI * 300 * 30 + plate, 1e-9), `filleted 40 × 30 plate extruded 10 beside the ring: two bodies, ${s.volume.toFixed(6)} = 9000π + ${plate.toFixed(6)}`);
  await shot('14-revolve-fillet');

  console.log('\n== Edit: copy, paste, duplicate (sketch, history, assembly)');
  {
    const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
    const editTools = await page.$$eval('.pc-tools [role=group][aria-label="Edit"] .pc-tool-row > *', (n) => n.map((x) => x.dataset.cmd || (x.matches('[data-edit-menu]') ? 'more' : '?')));
    ok(rows === 1 && editTools.join(',') === 'undo,redo,copy,paste,more', `Edit group = Undo, Redo, Copy, Paste, More (${editTools.join(', ')}); the toolbar is one row at 1440 px`);
    await page.click('[data-edit-menu] > summary');
    const items = await page.$$eval('[data-edit-menu] [role=menuitem]', (n) => n.map((x) => x.textContent.replace(/\s+/g, ' ').trim()));
    ok(items.join(' | ') === 'Cut Ctrl+X | Copy Ctrl+C | Paste Ctrl+V | Paste in place Ctrl+Shift+V | Duplicate Ctrl+D | Delete Delete | Select all Ctrl+A | Select none Esc', 'More lists cut, copy, paste, paste in place, duplicate, delete, select all, select none with their keys');
    await shot('15-edit-more');
    await page.keyboard.press('Escape');
    await page.click('[data-edit-menu] > summary');   // close it
    await newPartUI();
    await page.click('[data-plane="top"]');
    await tool('sketch');
    await page.waitForFunction(() => window.partcraft.mode === 'sketch');
    await page.keyboard.press('r');
    await clickSk([10, 10]); await clickSk([50, 30]);
    await page.keyboard.press('Escape');
    const n0 = await pc(() => window.partcraft.part.features[0].sketch.entities.length);
    const c0 = await pc(() => window.partcraft.part.features[0].sketch.constraints.length);
    const why = await page.getAttribute('.pc-tools .pc-tool[data-cmd="copy"]', 'title');
    ok((await page.isDisabled('.pc-tools .pc-tool[data-cmd="copy"]')) && /Select sketch geometry first/.test(why), 'nothing selected: Copy is off and its title says why');
    await page.focus('[data-sketch-canvas]');
    await page.keyboard.press('Control+a');
    ok((await pc(() => window.partcraft.editor.sel.size)) === n0, `Ctrl+A selects all ${n0} items of the sketch`);
    await page.keyboard.press('Escape');
    ok((await pc(() => window.partcraft.editor.sel.size)) === 0, 'Esc selects none');
    await page.keyboard.press('Control+a');
    await tool('copy');
    const stored = await pc(() => JSON.parse(localStorage.getItem('partcraft.clipboard')));
    ok(stored.kind === 'sketch' && stored.sketch.entities.length === n0 && stored.sketch.constraints.length === c0, `Copy (toolbar): the clipboard holds the ${n0} items and all ${c0} relations, in localStorage too`);
    await tool('paste');
    ok((await pc(() => window.partcraft.editor.tool)) === 'paste', 'Paste (toolbar): the copy follows the pointer');
    await moveSk([80, 20]); await moveSk([90, 20]);
    await clickSk([90, 20]);
    let sk2 = await pc(() => window.partcraft.part.features[0].sketch);
    const xs = sk2.entities.filter((e) => e.type === 'point').map((e) => e.x);
    ok(sk2.entities.length === 2 * n0 && sk2.constraints.length === 2 * c0 && Math.abs(Math.max(...xs) - 110) < 1e-6, 'a click puts it down there: twice the geometry and relations, the copy centred at x 90 (right edge 110)');
    ok((await pc(() => window.partcraft.lastSolve.conflicts.length)) === 0, 'the sketch still solves');
    await page.keyboard.press('Control+z');
    ok((await pc(() => window.partcraft.part.features[0].sketch.entities.length)) === n0, 'Ctrl+Z takes the paste back in one step');
    await page.keyboard.press('Control+y');
    ok((await pc(() => window.partcraft.part.features[0].sketch.entities.length)) === 2 * n0, 'Ctrl+Y puts it back');
    await page.click('[data-edit-menu] > summary');
    await page.click('[data-edit-menu] [data-cmd="paste-in-place"]');
    sk2 = await pc(() => window.partcraft.part.features[0].sketch);
    const orig = sk2.entities.filter((e) => e.type === 'point').slice(0, 8).map((e) => [e.x, e.y]);
    const placed = sk2.entities.filter((e) => e.type === 'point').slice(-8).map((e) => [e.x, e.y]);
    ok(sk2.entities.length === 3 * n0 && orig.every((p, i) => Math.abs(p[0] - placed[i][0]) < 1e-6 && Math.abs(p[1] - placed[i][1]) < 1e-6), 'More › Paste in place: the copy lands on the original coordinates');
    // duplicate one line: Ctrl+D then Esc cancels, Ctrl+D then a click puts it down
    const lineMidPt = await pc(() => { const sk = window.partcraft.part.features[0].sketch; const l = sk.entities.find((e) => e.type === 'line'); const P = (id) => sk.entities.find((e) => e.id === id); return [(P(l.p1).x + P(l.p2).x) / 2, (P(l.p1).y + P(l.p2).y) / 2]; });
    await page.keyboard.press('Escape');
    await clickSk(lineMidPt);
    ok((await pc(() => window.partcraft.editor.sel.size)) === 1, 'a line clicked and selected');
    await page.keyboard.press('Control+d');
    ok((await pc(() => window.partcraft.editor.tool)) === 'paste', 'Ctrl+D starts a duplicate that follows the pointer');
    await page.keyboard.press('Escape');
    ok((await pc(() => [window.partcraft.editor.tool, window.partcraft.part.features[0].sketch.entities.length])).join() === 'select,' + 3 * n0, 'Esc cancels the duplicate: nothing added');
    await clickSk(lineMidPt);
    await page.keyboard.press('Control+d');
    await moveSk([30, -20]); await clickSk([30, -20]);
    ok((await pc(() => window.partcraft.part.features[0].sketch.entities.length)) === 3 * n0 + 3, 'Ctrl+D, click: one line and its two end points duplicated (the clipboard is left alone)');
    ok((await pc(() => window.partcraft.clip().sketch.entities.length)) === n0, 'the clipboard still holds the rectangle');
    // cut the duplicated line (it is selected after the click): its relation to the rectangle is dropped, and said
    await page.keyboard.press('Control+x');
    ok((await pc(() => window.partcraft.part.features[0].sketch.entities.length)) === 3 * n0 && (await pc(() => window.partcraft.clip().curves)) === 1, 'Ctrl+X cuts the selected line into the clipboard');
    await page.keyboard.press('Control+z');
    // a rectangle side alone: its corner relations to the other sides are dropped, and the status says so
    await clickSk(lineMidPt);
    await page.keyboard.press('Control+c');
    ok(/relations? to geometry outside the copy will not come along/.test(await statusText()) && (await pc(() => window.partcraft.clip().dropped)) >= 2, 'copying one side of the rectangle: the status says its relations to the other sides do not come along');
    await shot('16-sketch-pasted');
    await page.keyboard.press('Escape');
    await page.keyboard.press('Control+z'); await page.keyboard.press('Control+z');
    ok((await pc(() => window.partcraft.part.features[0].sketch.entities.length)) === 2 * n0, 'two Ctrl+Z take back the duplicate and the paste in place: two rectangles left');
    await tool('exit-sketch');
    await tool('extrude');
    await built();
    // the history: select Extrude1, copy, paste → a new sketch + extrude; More › Duplicate on the sketch; undo
    await page.click('.pc-tree [data-id="f2"]');
    const f0 = await pc(() => window.partcraft.part.features.length);
    await page.keyboard.press('Control+c');
    ok((await pc(() => window.partcraft.clip().kind)) === 'features' && (await pc(() => window.partcraft.clip().features.length)) === 2, 'history: Ctrl+C on Extrude1 copies it with its sketch');
    await page.keyboard.press('Control+v');
    await built();
    let feats = await pc(() => window.partcraft.part.features.map((f) => [f.type, f.name, window.partcraft.regen.results.get(f.id)?.status]));
    ok(feats.length === f0 + 2 && feats.at(-2)[0] === 'sketch' && feats.at(-1)[0] === 'extrude' && feats.every((f) => f[2] === 'ok'), `Ctrl+V adds ${feats.at(-2)[1]} and ${feats.at(-1)[1]}; everything builds`);
    await page.keyboard.press('Control+z');
    await built();
    ok((await pc(() => window.partcraft.part.features.length)) === f0, 'one Ctrl+Z takes both back');
    await page.click('.pc-tree [data-id="f1"]');
    await page.click('[data-edit-menu] > summary');
    await page.click('[data-edit-menu] [data-cmd="duplicate"]');
    await built();
    feats = await pc(() => window.partcraft.part.features.map((f) => f.type));
    ok(feats.length === f0 + 1 && feats.at(-1) === 'sketch' && (await pc(() => window.partcraft.sel.id)) === (await pc(() => window.partcraft.part.features.at(-1).id)), 'More › Duplicate on Sketch1: a new sketch, selected');
    await page.click('.pc-tree [data-id="f1"]');
    await page.keyboard.press('Escape');
    ok((await page.isDisabled('[data-edit-menu] [data-cmd="duplicate"]')) && /Select a sketch, extrude, revolve or hole/.test(await page.getAttribute('[data-edit-menu] [data-cmd="duplicate"]', 'title')), 'nothing selected in the history: Duplicate is off and says why');
    // assembly: duplicate the part, paste one in place, undo/redo
    await tool('asm-new');
    await page.waitForFunction(() => window.partcraft.mode === 'assembly');
    await pc(() => window.partcraft.asmBuilt());
    ok(/a part pastes into an assembly|features paste/.test(await page.getAttribute('.pc-tools .pc-tool[data-cmd="paste"]', 'title')) && (await page.isDisabled('.pc-tools .pc-tool[data-cmd="paste"]')), 'in the assembly, Paste is off while the clipboard holds features, and says why');
    await page.click('.pc-tree [data-inst]');
    await page.click('[data-edit-menu] > summary');
    await page.click('[data-edit-menu] [data-cmd="duplicate"]');
    await page.waitForFunction(() => window.partcraft.asm.instances.length === 2);
    await pc(() => window.partcraft.asmBuilt());
    let a = await pc(() => { const p = window.partcraft; return { n: p.asm.instances.length, parts: Object.keys(p.asm.parts).length, same: p.asm.instances[0].part === p.asm.instances[1].part, x: p.asmPlace.world.get(p.asm.instances[1].id)[12] }; });
    ok(a.n === 2 && a.parts === 1 && a.same && a.x > 40, `More › Duplicate: a second instance of the same part, placed ${a.x.toFixed(1)} mm to the side`);
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+Shift+v');
    await page.waitForFunction(() => window.partcraft.asm.instances.length === 3);
    a = await pc(() => { const p = window.partcraft; return { parts: Object.keys(p.asm.parts).length, same: p.asm.instances[2].place.every((v, i) => v === p.asm.instances[1].place[i]) }; });
    ok(a.parts === 1 && a.same, 'Ctrl+C, Ctrl+Shift+V: a third instance exactly on the copied one');
    await page.keyboard.press('Control+z');
    ok((await pc(() => window.partcraft.asm.instances.length)) === 2, 'Ctrl+Z removes the pasted part');
    await page.keyboard.press('Control+y');
    ok((await pc(() => window.partcraft.asm.instances.length)) === 3, 'Ctrl+Y brings it back');
    await pc(() => window.partcraft.asmBuilt());
    await shot('17-assembly-duplicated');
    await page.click('.pc-tools [data-cmd="asm-close"]');
    if (await page.$('dialog[open]')) await page.click('dialog[open] button[data-key="discard"]');
    await page.waitForFunction(() => window.partcraft.mode === 'model');
  }

  console.log('\n== Settings › PartCraft');
  {
    await page.click('[data-settings-open]');
    await page.waitForSelector('dialog[data-app-settings][open]');
    await page.click('[data-settings-tab="app"]');
    ok(await page.isChecked('input[name="pcOrbit"][value="left"]') && await page.isChecked('input[name="pcScroll"][value="auto"]') && await page.isChecked('input[name="pcAutoRel"]'), 'the PartCraft tab opens on the defaults: left button, work it out, relations on');
    await shot('18-settings');
    await page.click('label:has(input[name="pcOrbit"][value="middle"])');
    await page.click('label:has(input[name="pcScroll"][value="trackpad"])');
    await page.click('label:has(input[name="pcAutoRel"])');
    const st = await pc(() => [window.partcraft.view.controls.mouseButtons.LEFT, window.partcraft.view.controls.mouseButtons.MIDDLE, window.partcraft.editor.autoRelations, JSON.parse(localStorage.getItem('partcraft.settings'))]);
    ok(st[0] === null && st[1] === 0 && st[2] === false && st[3].orbit === 'middle' && st[3].scroll === 'trackpad' && st[3].autoRel === false, 'clicked: the middle button orbits (left only picks), trackpad scrolling, no automatic relations — stored in partcraft.settings');
    await page.click('dialog[data-app-settings] button[type="submit"].btn-plot');
    // trackpad: a sideways two-finger swipe turns the part without zooming
    const g = await page.$eval('[data-gl]', (c) => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    await page.mouse.move(g[0], g[1]);
    const cam0 = await pc(() => [...window.partcraft.view.camera.position.toArray(), window.partcraft.view.camera.zoom]);
    await page.mouse.wheel(40, 0);
    await page.waitForTimeout(100);
    const cam1 = await pc(() => [...window.partcraft.view.camera.position.toArray(), window.partcraft.view.camera.zoom]);
    ok(Math.hypot(cam1[0] - cam0[0], cam1[1] - cam0[1], cam1[2] - cam0[2]) > 1 && cam1[3] === cam0[3], 'trackpad: a two-finger swipe turns the part (no zoom)');
    // no automatic relations: a line drawn from a corner of a sketch gets no coincident
    await page.click('[data-plane="front"]');
    await tool('sketch');
    await page.waitForFunction(() => window.partcraft.mode === 'sketch');
    await page.keyboard.press('l');
    await clickSk([0, 0]); await clickSk([40, 0.5]);
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    const cons = await pc(() => window.partcraft.part.features.at(-1).sketch.constraints.length);
    ok(cons === 0, `relations off: a line from the origin, nearly level, adds no relations (${cons})`);
    await page.keyboard.press('Control+z');
    await tool('exit-sketch');
    // kept after a reload, shown again when the dialog opens
    await page.evaluate(() => window.partcraft.hist.clear());
    page.once('dialog', (d) => d.accept());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.partcraft && window.partcraft.regen, null, { timeout: 30000 });
    const st2 = await pc(() => [window.partcraft.view.orbitButton, window.partcraft.editor.autoRelations, window.partcraft.settings.scroll]);
    ok(st2.join() === 'middle,false,trackpad', 'after a reload: still middle button, trackpad, relations off');
    await page.keyboard.press('Control+,');
    await page.waitForSelector('dialog[data-app-settings][open]');
    ok(await page.isChecked('input[name="pcOrbit"][value="middle"]') && await page.isChecked('input[name="pcScroll"][value="trackpad"]') && !(await page.isChecked('input[name="pcAutoRel"]')), 'Ctrl+, opens the dialog showing the stored choices');
    await page.click('[data-settings-reset]');
    const st3 = await pc(() => [window.partcraft.view.orbitButton, window.partcraft.editor.autoRelations, window.partcraft.settings.scroll, window.partcraft.view.controls.mouseButtons.LEFT]);
    ok(st3.join() === 'left,true,auto,0' && await page.isChecked('input[name="pcOrbit"][value="left"]'), 'Reset puts the PartCraft settings back to left button, work it out, relations on');
    await page.click('dialog[data-app-settings] button[type="submit"].btn-plot');
  }

  // per-area checks (each also runs alone: node tools/partcraft-test/browser-<area>.mjs; docs/apps/partcraft-workspaces.md)
  const areaHelpers = { page, ctx, browser, BASE, OUT, F, ok, near, nearRel, problems, pc, open, built, tool, shot, statusText };
  await (await import('./rel-browser-workspaces.mjs')).run(areaHelpers);
  await (await import('./rel-browser-sketch-tools.mjs')).run(areaHelpers);
  await (await import('./rel-browser-design-features.mjs')).run(areaHelpers);
  await (await import('./rel-browser-assembly-tools.mjs')).run(areaHelpers);
  await (await import('./rel-browser-manufacture.mjs')).run(areaHelpers);
  await (await import('./rel-browser-form.mjs')).run(areaHelpers);
  await (await import('./rel-browser-simulation.mjs')).run(areaHelpers);
  await (await import('./rel-browser-generative.mjs')).run(areaHelpers);

  ok(problems.length === 0, 'no console errors' + (problems.length ? ':\n    ' + problems.join('\n    ') : ''));

  console.log('\n== when OpenCascade cannot load: the mesh kernel carries on');
  {
    const p2 = await ctx.newPage();
    const errs = [];
    p2.on('pageerror', (e) => errs.push(e.message));
    // a browser where the kernel's worker cannot start (as when module workers or WebAssembly memory are missing)
    await p2.addInitScript(() => { window.Worker = class { constructor() { throw new Error('Workers are off in this test'); } }; });
    await p2.goto(BASE + '/lab/partcraft/0.2', { waitUntil: 'networkidle' });
    await p2.waitForFunction(() => window.partcraft && window.partcraft.exact.state === 'failed', null, { timeout: 30000 });
    await p2.evaluate((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
    await p2.evaluate(() => window.partcraft.built());
    const st = await p2.evaluate(() => [window.partcraft.regen.exact === true, window.partcraft.regen.stats.volume, document.querySelector('[data-kernel]').textContent, document.querySelector('[data-cmd="fillet"]').disabled, document.querySelector('[data-cmd="export-step"]').disabled]);
    ok(!st[0] && nearRel(st[1], F.facetFactor(64) * 302160, 1e-8) && /Mesh kernel only/.test(st[2]) && st[3] && st[4], `the flange builds faceted (k·302160 = ${st[1].toFixed(3)}); the chip says "Mesh kernel only"; Fillet and exact STEP are disabled`);
    ok(errs.length === 0, 'no page errors without OpenCascade' + (errs.length ? ': ' + errs.join('; ') : ''));
    await p2.close();
  }
} catch (err) {
  fail++;
  console.log('  FAIL ' + (err && err.stack ? err.stack : err));
  if (problems.length) console.log('    ' + problems.join('\n    '));
  await page.screenshot({ path: path.join(OUT, 'zz-failure.png') }).catch(() => {});
} finally {
  await browser.close();
  if (!process.argv.includes('--keep-admin')) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* ignore */ } }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
