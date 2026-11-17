#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-contour-smooth.mjs — 0.9.1 (/suggest #1500) in headless Chromium at https://getcadcraft.com/lab/civilcraft: the
 * Contouring method list (D9.6, never run in a browser before), the ABOS settings, Contour smoothing, the index-contour
 * list, and the DXF that comes out. The sample survey (276 points) is the one the app ships. Screenshots of the same points
 * as: triangulation / no smoothing, triangulation / strong smoothing, kriging, ABOS, ABOS / strong smoothing.
 * Run as root (admin tag civsm).
 *   node tools/civilcraft-test/browser-contour-smooth.mjs [--out dir]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-contour-smooth'));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'civsm'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
let up = false;
try {
  const cred = admin('up'); up = true;
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
  await ctx.addInitScript(() => {
    new MutationObserver(() => { const b = document.querySelector('[data-autosave-dialog][open] [data-autosave-discard]'); if (b) b.click(); })
      .observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  });
  const p0 = await ctx.newPage();
  await p0.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p0.fill('input[name="email"]', cred.email); await p0.fill('input[name="password"]', cred.password);
  await Promise.all([p0.waitForNavigation(), p0.click('form button[type="submit"]')]);
  await p0.close();
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });

  console.log('\n== the sample survey');
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  ok(await page.evaluate(() => window.civilcraft.project.eg().surface.nT > 400), 'surface built from the 276 points');

  // the person's way: the real <select> and <input> elements, changed with the mouse/keyboard
  const pick = async (sel, value) => { const l = page.locator(sel); await l.scrollIntoViewIfNeeded(); await l.selectOption(value); await wait(250); };
  const type = async (sel, value) => { const l = page.locator(sel); await l.scrollIntoViewIfNeeded(); await l.fill(String(value)); await l.press('Tab'); await wait(250); };
  const info = () => page.evaluate(() => {
    const p = window.civilcraft.project, c = p.contours();
    return { smooth: p.state.display.smooth || 'none', method: p.state.surface.method || 'tin', lines: c.length, pts: c.reduce((s, l) => s + l.pts.length, 0), tris: p.eg().surface?.nT || 0, q: p.state.surface.gridQ, acc: p.state.surface.gridAcc, major: p.state.display.major, interval: p.state.display.interval };
  });
  const canvas = page.locator('[data-over]');
  const shot = async (name) => {
    await wait(500);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    const b = await canvas.boundingBox();
    await page.screenshot({ path: path.join(OUT, name + '-plan.png'), clip: { x: b.x, y: b.y, width: b.width, height: b.height } });
  };

  console.log('\n== the controls are there');
  const opts = await page.$$eval('[data-contour-smooth] option', (l) => l.map((o) => o.value + '=' + o.textContent.trim()));
  ok(opts.join('|') === 'none=None (straight pieces)|light=Light|strong=Strong', 'Contour smoothing: ' + opts.join(', '));
  ok(await page.locator('[data-contour-smooth]').isVisible() && await page.locator('label[for="cv-smooth"]').textContent() === 'Contour smoothing', 'it is visible in the Display section, labelled "Contour smoothing"');
  ok((await page.locator('[data-contour-smooth]').inputValue()) === 'none', 'default: None');
  const methods = await page.$$eval('[data-grid-method] option', (l) => l.map((o) => o.textContent.trim()));
  ok(methods.length === 19 && methods[0] === 'Triangulation with linear interpolation' && methods.includes('ABOS (approximation based on smoothing)') && methods.includes('Kriging') && methods.includes('Minimum curvature'), `Contouring method lists ${methods.length} choices, ABOS among them`);
  ok(methods.every((m) => !/cv\.grid|^\s*$/.test(m)), 'every method has a name (no raw keys)');
  ok(await page.locator('[data-grid-q]').isDisabled() && await page.locator('[data-grid-acc]').isDisabled() && await page.locator('[data-grid-step]').isDisabled(), 'with Triangulation the grid spacing and the ABOS boxes are greyed');
  const majors = await page.$$eval('[data-major] option', (l) => l.map((o) => o.textContent.trim()).join(', '));
  ok(majors === '2nd contour, 4th contour, 5th contour, 10th contour', 'Major every: ' + majors);
  ok(await page.locator('[data-show="labels"]').isChecked(), 'contour labels are on');
  // zoom in so single contour pieces can be seen
  const b = await canvas.boundingBox();
  await page.mouse.move(b.x + b.width * 0.5, b.y + b.height * 0.5);
  for (let i = 0; i < 4; i++) { await page.mouse.wheel(0, -240); await wait(120); }

  console.log('\n== triangulation, no smoothing (today\'s look)');
  const a = await info();
  ok(a.method === 'tin' && a.smooth === 'none' && a.lines > 10, `${a.lines} contour lines, ${a.pts} vertices`);
  await shot('1-tin-none');

  console.log('\n== triangulation, strong smoothing');
  await pick('[data-contour-smooth]', 'strong');
  const s = await info();
  ok(s.smooth === 'strong' && s.lines === a.lines && s.pts > a.pts * 1.5, `same ${s.lines} lines, now ${s.pts} vertices on screen`);
  await shot('2-tin-strong');
  await pick('[data-contour-smooth]', 'light');
  const l = await info();
  ok(l.smooth === 'light' && l.pts > a.pts && l.pts < s.pts, `light: ${l.pts} vertices`);
  await shot('2b-tin-light');

  console.log('\n== index contours and the interval');
  await pick('[data-major]', '2');
  await pick('[data-interval]', '0.5');
  const iv = await info();
  ok(iv.major === 2 && iv.interval === 0.5 && iv.lines > a.lines * 1.7, `every 2nd contour heavier at 0.5 ft: ${iv.lines} lines`);
  await shot('3-interval-0.5-major-2-light');
  await pick('[data-major]', '5'); await pick('[data-interval]', '1');

  console.log('\n== DXF with strong smoothing');
  await pick('[data-contour-smooth]', 'strong');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => document.querySelector('[data-cmd="dxf"]').click())]);
  const dxfFile = path.join(OUT, dl.suggestedFilename()); await dl.saveAs(dxfFile);
  {
    const g = fs.readFileSync(dxfFile, 'utf8').split(/\r\n/), pl = [];
    let cur = null;
    for (let i = 0; i + 1 < g.length; i += 2) {
      const c = Number(g[i]), v = g[i + 1];
      if (c === 0) { if (v === 'POLYLINE') { cur = { layer: '', elev: 0, n: 0, inV: false }; pl.push(cur); } else if (v === 'VERTEX' && cur) { cur.n++; cur.inV = true; } else cur = null; }
      else if (cur && !cur.inV) { if (c === 8) cur.layer = v; if (c === 30) cur.elev = Number(v); }
    }
    const maj = pl.filter((x) => x.layer === 'C-TOPO-MAJR'), min = pl.filter((x) => x.layer === 'C-TOPO-MINR');
    ok(maj.length > 0 && min.length > maj.length && maj.every((x) => x.elev % 5 === 0) && min.every((x) => x.elev % 5 !== 0), `the downloaded DXF has ${maj.length} index contours on C-TOPO-MAJR and ${min.length} minor on C-TOPO-MINR, each at its elevation`);
    ok([...maj, ...min].reduce((t, x) => t + x.n, 0) === s.pts, `and carries the smoothed vertices (${s.pts})`);
  }
  await pick('[data-contour-smooth]', 'none');

  console.log('\n== Contouring method: kriging');
  await pick('[data-grid-method]', 'kriging');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.method === 'kriging' && window.civilcraft.project.eg().surface);
  const k = await info();
  const rep = (await page.locator('[data-surface-report]').textContent()).replace(/\s+/g, ' ');
  ok(k.method === 'kriging' && k.tris !== a.tris && k.lines > 10, `kriging surface: ${k.tris} triangles, ${k.lines} contour lines`);
  ok(/Kriging, grid spacing [\d.]+\. At your \d+ points the surface is off by [\d.]+ \(RMS\)/.test(rep) && /variogram fitted/.test(rep), 'the surface report says what was done: ' + rep.slice(0, 140) + '…');
  ok(!(await page.locator('[data-grid-step]').isDisabled()) && await page.locator('[data-grid-q]').isDisabled(), 'grid spacing can be typed; the ABOS boxes stay greyed');
  await shot('4-kriging-none');

  console.log('\n== every method builds a surface in the browser');
  const keys = await page.$$eval('[data-grid-method] option', (o) => o.map((x) => x.value));
  const bad = [];
  for (const key of keys) {
    if (key === 'tin') continue;
    await pick('[data-grid-method]', key);
    const r = await page.evaluate(() => { const e = window.civilcraft.project.eg(); return { ok: !!e.surface, errors: e.report.errors, n: e.surface?.nT || 0, c: window.civilcraft.project.contours().length }; });
    if (!r.ok || r.errors.length) bad.push(key + ': ' + r.errors.join('; '));
  }
  ok(bad.length === 0, `${keys.length - 1} gridding methods each built a surface from the sample` + (bad.length ? ' — failed: ' + bad.join(' | ') : ''));

  console.log('\n== Contouring method: ABOS');
  await pick('[data-grid-method]', 'abos');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.method === 'abos' && window.civilcraft.project.eg().surface);
  const ab = await info();
  const rep2 = (await page.locator('[data-surface-report]').textContent()).replace(/\s+/g, ' ');
  ok(/ABOS finished after \d+ cycles\. The largest difference at your points is [\d.]+, inside the accuracy asked for \(1% of the height range/.test(rep2), 'the report: ' + (rep2.match(/ABOS finished[^.]*\.[^.]*\.[^)]*\)/) || [rep2.slice(0, 160)])[0]);
  ok(!(await page.locator('[data-grid-q]').isDisabled()) && (await page.locator('[data-grid-q]').inputValue()) === '0.5' && (await page.locator('[data-grid-acc]').inputValue()) === '1', 'Smoothness 0.5 and Accuracy 1 % are shown and can be typed');
  await shot('5-abos-none');
  await type('[data-grid-q]', '0.1');
  await type('[data-grid-acc]', '3');
  const ab2 = await info();
  const rep3 = (await page.locator('[data-surface-report]').textContent()).replace(/\s+/g, ' ');
  ok(ab2.q === 0.1 && ab2.acc === 3 && /3% of the height range/.test(rep3) && /Smoothness 0\.1/.test(rep3), 'typing 0.1 and 3 rebuilds the surface with them (the report says 3% and smoothness 0.1)');
  await type('[data-grid-q]', '-4');
  ok((await page.locator('[data-grid-q]').getAttribute('aria-invalid')) === 'true' && (await info()).q === 0.1, 'a bad smoothness is marked and not used');
  await type('[data-grid-q]', '0.5'); await type('[data-grid-acc]', '1');
  await pick('[data-contour-smooth]', 'strong');
  const ab3 = await info();
  ok(ab3.smooth === 'strong' && ab3.pts > ab.pts, `ABOS with strong smoothing: ${ab3.pts} vertices (from ${ab.pts})`);
  await shot('6-abos-strong');

  console.log('\n== undo, and back to today\'s look');
  await pick('[data-grid-method]', 'tin');
  await pick('[data-contour-smooth]', 'none');
  const z = await info();
  ok(z.method === 'tin' && z.smooth === 'none' && z.pts === a.pts && z.lines === a.lines && z.q === undefined, 'Triangulation and None give the first picture\'s lines again, vertex for vertex');
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 3).join(' | ') : ''));
} catch (e) { fail++; console.log('  FAIL ' + (e?.stack || e)); }
finally {
  await browser.close();
  if (up) try { admin('down'); } catch { /* */ }
}
console.log(`\nscreenshots in ${OUT}`);
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
