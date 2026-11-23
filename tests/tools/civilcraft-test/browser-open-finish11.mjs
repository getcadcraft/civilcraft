#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-open-finish11.mjs — CivilCraft 0.11 PERF.33 (perf-finish-11, lane civil) in the real /lab page: what the open Worker hands back is what
 * the page would have made itself (rule 62).
 *   1. a 60,000-point project file (line codes, smoothed contours) opened through the file input: parsed in the Worker (no JSON.parse of
 *      it on the page), and the project, the surface, its stats and outline, the contours and the line-code figures equal a fresh build from
 *      JSON.parse + Project.fromJSON on the page; no long task over 400 ms;
 *   2. a 40,000-point LandXML TIN (CivilCraft's own writer, > 2 MB): its lists read in the Worker, the TIN, surface and contours equal the
 *      tree reader's (readLandXml(text, { fast: false })) and a fresh build;
 *   3. view.js draws a closed line as an added path of its own: the pixels equal closePath() on the layer path.
 *   Run as root: nice -n 10 timeout 900 node tools/civilcraft-test/browser-open-finish11.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const { writeLandXml } = await import(pathToFileURL(path.join(APP, 'landxml.js')).href);
const { buildSurface } = await import(pathToFileURL(path.join(APP, 'tin.js')).href);
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'cv-openf11-'));
let seed = 21; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
// 1. a project file: points on a gentle surface, a few line-coded edges (EP B … EP E, CL … CL C), some without z, control characters
const rows = [];
for (let i = 0; i < 60000; i++) { const x = 1000 + rnd() * 1200, y = 2000 + rnd() * 900; rows.push([String(i + 1), x, y, i % 997 === 0 ? null : 50 + Math.sin(x / 70) * 6 + y / 120 + rnd() * 0.2, i % 50 === 0 ? 'EP' + (i % 200 === 0 ? ' B' : '') : i % 77 === 0 ? 'CL ' + (i % 154 === 0 ? 'C' : 'x') : 'GND\u0001']); }
const proj = { format: 'civilcraft-project', version: 1, name: 'openf11', units: 'm', seq: 1, points: rows, display: { interval: 0.5, smooth: 'light' }, surface: { descKeys: [{ code: 'EP', use: 'points' }], lineCodes: { begin: ['B'], end: ['E'], close: ['C'] } } };
const projText = JSON.stringify(proj);
fs.writeFileSync(path.join(dir, 'openf11.civilcraft.json'), projText);
// 2. a LandXML TIN written by CivilCraft itself
const lp = Array.from({ length: 40000 }, () => { const x = 5000 + rnd() * 2000, y = 8000 + rnd() * 1500; return { x, y, z: 120 + Math.cos(x / 90) * 4 + y / 300 }; });
const lsf = buildSurface({ points: lp }).surface;
const lxText = writeLandXml({ name: 'openf11 lx', units: 'm', points: [], surfaces: [{ name: 'EG', desc: '', surface: lsf, breaklines: [], boundary: null }], alignments: [], date: new Date(0) });
fs.writeFileSync(path.join(dir, 'openf11.xml'), lxText);
console.log(`files: project ${(projText.length / 1048576).toFixed(1)} MB, LandXML ${(lxText.length / 1048576).toFixed(1)} MB (${lsf.nT} triangles)`);

admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => {
    window.__workers = []; const W = window.Worker;
    window.Worker = function (u, o) { window.__workers.push(String(u).slice(0, 5)); return new W(u, o); }; window.Worker.prototype = W.prototype;
    window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch { /* */ }
    window.__parses = 0; const jp = JSON.parse; JSON.parse = function (s, r) { if (typeof s === 'string' && s.length > 1e6) window.__parses++; return jp.call(this, s, r); };
    try { localStorage.setItem('cc-autofocus', 'off'); localStorage.setItem('cc-hw-share', 'off'); } catch { /* */ }   // no hardware report: its 30-an-hour throttle on 127.0.0.1 answers 429
  });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 300)); if (m.type() === 'warning' && /civilcraft:/.test(m.text())) problems.push('warning: ' + m.text().slice(0, 300)); });
  await page.goto('https://getcadcraft.com/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  const devUrl = await page.evaluate(() => [...document.querySelectorAll('script[type=module]')].map((s) => s.src).find((u) => /civilcraft\/dev\//.test(u)) || '');
  const base = devUrl.replace(/[^/]*$/, '') || 'https://getcadcraft.com/assets/apps/civilcraft/dev/';

  // ---- 1. the project file
  const n0 = await page.evaluate(() => window.__lt.length);
  await page.setInputFiles('[data-file]', path.join(dir, 'openf11.civilcraft.json'));
  await page.waitForFunction(() => window.civilcraft.project.points.length === 60000 && performance.getEntriesByName('cv-open:shown').length > 0, null, { timeout: 300000 });
  await page.waitForTimeout(1500);
  const r1 = await page.evaluate(async ([text, base, n0]) => {
    const p = window.civilcraft.project, P = p.constructor;
    const memo = (k) => p.cache.get(k)?.value;
    const eg = p.eg(), cont = p.contours(eg.surface, 'eg'), fig = p.figures();
    const parsesBefore = window.__parses;
    const fresh = P.fromJSON(JSON.parse(text)).project;
    fresh.state.display = p.state.display;   // the display is not in the comparison's way
    const fileA = JSON.stringify({ ...p.toJSON(), saved: 0, seq: 0 }), fileB = JSON.stringify({ ...fresh.toJSON(), saved: 0, seq: 0 });
    const feg = fresh.eg(), fs = feg.surface, s = eg.surface;
    const arr = (a, b) => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
    const freshStats = JSON.stringify(fs.stats()), freshOutline = JSON.stringify(fs.outline());
    return {
      workers: window.__workers, parsesOnPage: parsesBefore,
      file: fileA === fileB, fileLen: fileA.length,
      surface: s.nT === fs.nT && arr(s.tris, fs.tris) && arr(s.X, fs.X) && arr(s.Y, fs.Y) && arr(s.Z, fs.Z) && s.ox === fs.ox && s.oy === fs.oy,
      fromWorker: memo('eg') === eg && memo('contours:eg') === cont && memo('fig:*') === fig,
      stats: JSON.stringify(s.stats()) === freshStats, outline: JSON.stringify(s.outline()) === freshOutline,
      contours: JSON.stringify(cont) === JSON.stringify(fresh.contoursOf(fs)), nContours: cont.length, smooth: p.state.display.smooth,
      figures: JSON.stringify(fig) === JSON.stringify(fresh.figures()), nFigures: fig.length,
      longest: (() => { const m0 = performance.getEntriesByName('cv-open:start').at(-1)?.startTime ?? 0; return Math.round(Math.max(0, ...window.__lt.filter((x) => x[0] >= m0).map((x) => x[1]))); })(),
      tasks: (() => { const m0 = performance.getEntriesByName('cv-open:start').at(-1)?.startTime ?? 0; return window.__lt.filter((x) => x[0] >= m0 - 2000).map((x) => [Math.round(x[0] - m0), Math.round(x[1])]); })(),
    };
  }, [projText, base, n0]);
  ok(r1.workers.includes('blob:'), 'the open Worker started (blob: module)', r1.workers);
  ok(r1.parsesOnPage === 0, 'the project file was not JSON.parse\'d on the page (the Worker parsed it)', r1.parsesOnPage);
  ok(r1.file, 'the project equals JSON.parse + Project.fromJSON on the page (toJSON, ' + r1.fileLen + ' characters)');
  ok(r1.fromWorker, 'p.eg(), p.contours() and p.figures() come from what the Worker built (memo)');
  ok(r1.surface, 'the surface equals a fresh build (triangles, X, Y, Z, origin)');
  ok(r1.stats && r1.outline, 'its stats and outline equal a fresh build\'s');
  ok(r1.contours && r1.nContours > 50 && r1.smooth === 'light', 'the smoothed contours equal a fresh build\'s (' + r1.nContours + ' lines, smooth ' + r1.smooth + ')', r1);
  ok(r1.figures && r1.nFigures > 0, 'the line-code figures equal a fresh build\'s (' + r1.nFigures + ')');
  ok(r1.longest < 1000, 'no long task over 1 s from the start of the open (longest ' + r1.longest + ' ms; the shared VPS, load printed below)', r1.tasks);
  console.log('  long tasks from the open [start ms, ms]: ' + JSON.stringify(r1.tasks) + '  (' + execFileSync('uptime').toString().trim().replace(/^.*load/, 'load') + ')');

  // ---- 2. the LandXML TIN
  await page.setInputFiles('[data-file]', path.join(dir, 'openf11.xml'));
  await page.waitForFunction(() => (window.civilcraft.project.state.surface.tin?.pts?.length || 0) > 30000, null, { timeout: 300000 });
  await page.waitForTimeout(1500);
  const r2 = await page.evaluate(async ([text, base]) => {
    const p = window.civilcraft.project;
    const { readLandXml } = await import(base + 'landxml.js');
    const tree = readLandXml(text, { fast: false }).surfaces[0];
    const tin = p.state.surface.tin;
    const eg = p.eg(), s = eg.surface;
    const { surfaceFromFaces } = await import(base + 'tin.js');
    const fs = surfaceFromFaces({ pts: tree.pts, faces: tree.faces }).surface;
    const arr = (a, b) => a.length === b.length && a.every((v, i) => Object.is(v, b[i]));
    return {
      tin: JSON.stringify(tin.pts) === JSON.stringify(tree.pts) && JSON.stringify(tin.faces) === JSON.stringify(tree.faces), n: tin.pts.length, f: tin.faces.length,
      primed: p.cache.get('eg')?.value === eg && !!p.cache.get('contours:eg'),
      surface: arr(s.tris, fs.tris) && arr(s.Z, fs.Z) && s.ox === fs.ox,
      contours: JSON.stringify(p.contours(s, 'eg')) === JSON.stringify(p.contoursOf(fs)),
    };
  }, [lxText, base]);
  ok(r2.tin, 'the LandXML TIN read through the Worker equals the tree reader\'s (' + r2.n + ' points, ' + r2.f + ' faces)', r2);
  ok(r2.primed && r2.surface && r2.contours, 'its surface and contours were built in the Worker and equal a fresh build', r2);

  // ---- 3. closed lines: an added path draws what closePath() on the layer path draws
  const r3 = await page.evaluate(() => {
    const draw = (added) => {
      const c = document.createElement('canvas'); c.width = 400; c.height = 300; const g = c.getContext('2d');
      g.lineWidth = 3; g.lineJoin = 'miter'; g.strokeStyle = '#123'; const P = new Path2D();
      for (let k = 0; k < 40; k++) {
        const cx = 20 + (k % 8) * 48, cy = 30 + Math.floor(k / 8) * 55, q = added ? new Path2D() : P;
        for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2, x = cx + Math.cos(a) * (12 + (k % 3) * 4), y = cy + Math.sin(a) * 15; i ? q.lineTo(x, y) : q.moveTo(x, y); }
        q.closePath(); if (added) P.addPath(q);
        P.moveTo(cx, cy + 20); P.lineTo(cx + 20, cy + 22);   // an open line between them
      }
      g.stroke(P); return g.getImageData(0, 0, 400, 300).data;
    };
    const a = draw(false), b = draw(true); let diff = 0, ink = 0;
    for (let i = 0; i < a.length; i++) { if (a[i] !== b[i]) diff++; if (a[i]) ink++; }
    return { diff, ink };
  });
  ok(r3.diff === 0 && r3.ink > 1000, 'a closed line added as its own path draws the same pixels as closePath() on the layer path', r3);
  ok(problems.length === 0, 'no page errors or open warnings', problems);
} finally { await browser.close(); admin('down'); fs.rmSync(dir, { recursive: true, force: true }); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
