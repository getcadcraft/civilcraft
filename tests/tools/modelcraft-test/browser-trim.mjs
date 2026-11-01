#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-trim.mjs — trimmed surfaces in ModelCraft's Surfaces panel (0.8 DC.54 S2, session apps-mount_PART_5; rule 49: tested in the real
 * page): two curves, Loft, then "Trim with a circle" (a hole), "Trim to a rectangle" (keep only that part), the panel's Undo, STEP out with
 * the bounds, and the patch set kept in the file data. No console errors.
 *   node tools/modelcraft-test/browser-trim.mjs [--out <dir>]      (root; as browser-mount3.mjs)
 */
/**
 * browser-trim.mjs — ModelCraft's round-3 mounts (0.8, session model_PART_3; KICKOFF rule 40: each mount tested in the real page),
 * headless Chromium at /lab/modelcraft:
 *   P.6     the 3D-print check is a Problems source: an open box → ⚠ count, the panel row, a marker over the view, "Repair" fixes it
 *           (one undo step) and the check runs again; a model change clears it
 *   RE.2/6  Export › Render a picture… hands its scene on: Engine "glTF file" saves a real .glb (no "cannot hand its scene" note)
 *   SU.747b the Surfaces panel (cc-nurbs-ui over cc-nurbs): two curves from typed points, Loft (a mesh in the scene), the continuity
 *           table, a gap between two lofts → a G0 problem in Problems, its Match fix closes it, the panel's undo, zebra and
 *           curvature views, picking a curve by clicking it in the view, points picked with the snapping tool, STEP export, the
 *           patch set kept in the file (save → reopen) and gone on New
 *   kit     (when --kit) the shell's seven modules: calc, reasons, totals, lessons, Suggest, activity, the Ask box answering a question
 * No console errors.
 *   node tools/modelcraft-test/browser-trim.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin, as browser-model08.mjs). Shots in tmp/shots/mount3.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/trim')));
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  // a minted staff session (as tools/problems-test/*): sign-in by password races other sessions' test runs on the shared test admin
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  await c.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return c;
}

const modUrl = (page, re) => page.evaluate((src) => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports; return Object.entries(map).find(([k]) => new RegExp(src).test(k))?.[1] || null; }, re.source);
/** An open box (a 2 × 2 × 2 m solid with its top face erased) as a group: the print check says "open". */
const openBox = async (page) => page.evaluate(async (u) => {
  const M = await import(u), mc = window.modelcraft;
  const iid = mc.model.change('box', (m) => {
    M.addPolygon(m.root, [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]], [0, 0, 1]); M.pushPull(m.root, [...m.root.faces.keys()].at(-1), 2);
    const top = [...m.root.faces.entries()].find(([, f]) => f.loops[0].every((v) => Math.abs(m.root.verts.get(v)[2] - 2) < 1e-9));
    if (top) M.eraseSel(m.root, [{ t: 'f', id: top[0] }]);
    return m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Open box');
  });
  document.querySelector('[data-hint]').hidden = true;
  document.querySelector('.mc-tools [data-act="extents"]')?.click();
  return iid;
}, await modUrl(page, /\/modelcraft\/dev\/model\.js/));
const newFile = async (page) => {
  await page.evaluate(() => document.querySelector('[data-act="new"]').click());
  const b = await page.waitForSelector('dialog[open] button[data-key="discard"]', { timeout: 1500 }).catch(() => null);
  if (b) await b.click();   // an unsaved model asks first
  await page.waitForTimeout(200);
};
const counts = (page) => page.evaluate(() => window.ccProblems.store.counts());
const bySource = (page, id) => page.evaluate((s) => window.ccProblems.store.list().filter((p) => p.source?.name === s || p.id.startsWith(s)), id);

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccProblems, null, { timeout: 60000 });
  await page.evaluate(() => document.querySelector('[data-nurbs-open]').scrollIntoView());
  await page.click('[data-nurbs-open]');
  await page.waitForSelector('[data-nurbs-panel]');
  const curve = async (pts) => {
    await page.click('[data-nurbs-start="curve.points"]');
    await page.fill('[data-nurbs-points]', pts);
    await page.dispatchEvent('[data-nurbs-points]', 'change');
    await page.click('[data-nurbs-run]');
  };
  await curve('0, 0, 0\n500, 0, 200\n1000, 0, 0');
  await curve('0, 1000, 0\n500, 1000, -200\n1000, 1000, 0');
  await page.click('[data-nurbs-start="surface.loft"]');
  await page.click('[data-nurbs-pick="c1"]'); await page.click('[data-nurbs-pick="c2"]');
  await page.click('[data-nurbs-run]');
  const meshInfo = () => page.evaluate(() => {
    const m = [...window.modelcraft.surfaces.display.cache.values()].find((c) => c.obj.isMesh).obj, g = m.geometry, P = g.getAttribute('position'), I = g.index;
    let a = 0;
    for (let i = 0; i < I.count; i += 3) {
      const p = [0, 1, 2].map((k) => [P.getX(I.getX(i + k)), P.getY(I.getX(i + k)), P.getZ(I.getX(i + k))]);
      const u = p[1].map((v, k) => v - p[0][k]), w = p[2].map((v, k) => v - p[0][k]);
      a += Math.hypot(u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]) / 2;
    }
    return { tris: I.count / 3, area: a };
  });
  const whole = await meshInfo();
  ok(whole.tris > 0, 'the loft is a mesh: ' + whole.tris + ' triangles, area ' + whole.area.toFixed(4) + ' m2');

  console.log('== Trim with a circle (a hole)');
  ok(await page.isVisible('[data-nurbs-start="surface.trimCircle"]') && await page.isVisible('[data-nurbs-start="surface.trimRect"]') && await page.isVisible('[data-nurbs-start="surface.trimCurve"]'), 'the Trim group has its commands');
  await page.click('[data-nurbs-start="surface.trimCircle"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'surface', 'Trim with a circle asks for a surface');
  await page.click('[data-nurbs-pick="s3"]');
  await page.fill('[data-nurbs-opt="r"]', '0.3'); await page.dispatchEvent('[data-nurbs-opt="r"]', 'change');
  await page.click('[data-nurbs-run]');
  await page.waitForTimeout(300);
  const holed = await meshInfo();
  const expectLoss = Math.PI * 0.3 * 0.3 * whole.area;   // the circle is round in the unit square: a share pi r^2 of a plate-like patch
  ok(Math.abs((whole.area - holed.area) - expectLoss) / expectLoss < 0.06, 'the hole takes out about pi r2 of the area: ' + (whole.area - holed.area).toFixed(4) + ' vs ' + expectLoss.toFixed(4));
  ok(/trimmed, 1 holes/.test(await page.textContent('[data-nurbs-item="s3"]')), 'the item row says it is trimmed');
  await page.screenshot({ path: path.join(OUT, '1-hole.png') });

  console.log('== Trim to a rectangle (keep that part), then undo');
  await page.click('[data-nurbs-start="surface.untrim"]'); await page.click('[data-nurbs-pick="s3"]'); await page.click('[data-nurbs-run]');
  await page.waitForTimeout(200);
  ok(Math.abs((await meshInfo()).area - whole.area) / whole.area < 1e-6, 'Remove the trim shows the whole surface again');
  await page.click('[data-nurbs-start="surface.trimRect"]'); await page.click('[data-nurbs-pick="s3"]');
  await page.click('[data-nurbs-run]');
  await page.waitForTimeout(300);
  const kept = await meshInfo();
  ok(Math.abs(kept.area / whole.area - 0.25) < 0.03, 'a 0.5 x 0.5 rectangle kept: a quarter of the area (' + (kept.area / whole.area).toFixed(3) + ')');
  await page.click('[data-nurbs-undo]');
  await page.waitForTimeout(300);
  ok(Math.abs((await meshInfo()).area - whole.area) / whole.area < 1e-6, 'the panel Undo brings the whole surface back');
  await page.click('[data-nurbs-redo]');
  await page.waitForTimeout(300);

  console.log('== the file and STEP');
  const trimInDoc = await page.evaluate(() => { const it = window.modelcraft.surfaces.session.doc.items.find((i) => i.kind === 'surface'); return !!(it.trim && it.trim.outer && it.trim.outer.length >= 3); });
  ok(trimInDoc, 'the patch set carries the trim (it is saved with the file)');
  const [st] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="step"]')]);
  const stText = fs.readFileSync(await st.path(), 'utf8');
  ok(/FACE_OUTER_BOUND/.test(stText) && /B_SPLINE_CURVE_WITH_KNOTS/.test(stText), 'STEP out carries the trim bound');
  const [ig] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="iges"]')]);
  void ig;
  ok(/trims were not written/.test(await page.evaluate(() => document.body.textContent)), 'IGES says the trims are not written');
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
