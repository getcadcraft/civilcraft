#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-print3d.mjs — Export › Check for 3D printing in ModelCraft (0.5 SG.4, #531), headless Chromium at
 * /lab/modelcraft.
 *   node tools/modelcraft-test/browser-print3d.mjs [--out <dir>] [--keep-admin]
 * Run as root: ModelCraft's test admin (`sudo -u www-data php tools/modelcraft-test/admin.php up|down`), the session
 * saved in tmp/skp-browser-state.json is shared with tools/skp-test/browser.mjs. Builds a 20 mm cube (closed) and a
 * box with no top (open) through the page's own model, opens the dialog from the Export menu, downloads STL and 3MF
 * and reads them back with trimesh (tools/modelcraft-test/venv); then the SketchUp PIMETA board (outside git, skipped
 * when missing) is checked as a big real model. Screenshots of the dialog in both themes (tmp/shots/print3d).
 * Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/print3d')));
const DL = path.join(REPO, 'tmp/modelcraft-test');
const STATE = path.join(REPO, 'tmp/skp-browser-state.json');
const SKP = '/var/www/CADCRAFT/testfiles/skp-corpus/owner/pimeta-v2-pcb-model-12-v6.skp';
const KEEP_ADMIN = process.argv.includes('--keep-admin');
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DL, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE, acceptDownloads: true });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (okLab) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext({ ...opts, acceptDownloads: true });
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  fs.chmodSync(STATE, 0o600);
  await p.close();
  return c;
}

const py = path.join(REPO, 'tools/modelcraft-test/venv/bin/python');
const readBack = (f) => { try { return JSON.parse(execFileSync(py, [path.join(REPO, 'tools/modelcraft-test/print_check.py'), f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); } catch (err) { return { error: String(err.stderr || err.message).slice(-300) }; } };

async function openDialog(page) {
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export="print3d"]');
  await page.waitForSelector('dialog.mc-dialog [data-print-ok]', { timeout: 120000 });
  return page.evaluate(() => {
    const d = document.querySelector('dialog.mc-dialog');
    return { ok: d.querySelector('[data-print-ok]').dataset.printOk, text: d.textContent, problems: [...d.querySelectorAll('[data-print-problems] li')].map((l) => l.textContent), warnings: [...d.querySelectorAll('[data-print-warnings] li')].map((l) => l.textContent), title: d.querySelector('h2').textContent };
  });
}

// the page's own model module (the import map's URL), so the shapes are built with the code the app runs
const build3d = (page, what) => page.evaluate(async (what) => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const url = Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))?.[1] || Object.keys(map).find((k) => /\/modelcraft\/dev\/model\.js/.test(k));
  const M = await import(url);
  const mc = window.modelcraft, m = mc.model;
  m.change('test shape', (mm) => {
    M.addPolygon(mm.root, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], 0.02, 0.02));
    M.pushPull(mm.root, [...mm.root.faces.keys()][0], 0.02);
    if (what === 'open') { const top = [...mm.root.faces].find(([, f]) => M.faceNormal(mm.root, f)[2] > 0.99)[0]; mm.root.faces.delete(top); }
  });
  mc.host.changed?.();
}, what);

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1400, height: 900 }, locale: 'en-US' });
  for (const space of ['paper', 'model']) {
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(space + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(space + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/modelcraft?space=' + space, { waitUntil: 'networkidle' });
    ok(await page.evaluate(() => !!window.modelcraft), space + ': the app starts');
    await build3d(page, 'cube');
    const d = await openDialog(page);
    ok(d.title === 'Check for 3D printing' && d.ok === '1' && /Ready to print/.test(d.text), space + ': a 20 mm cube is ready to print');
    ok(/Size: 20 × 20 × 20 mm/.test(d.text) && /Volume: 8 cm³/.test(d.text) && /What prints: everything shown/.test(d.text), space + ': size, volume, what prints');
    await page.screenshot({ path: path.join(OUT, `01-ready-${space}.png`) });
    if (space === 'paper') {
      const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog.mc-dialog button[data-key="3mf"]')]);
      const f = path.join(DL, 'browser-cube.3mf'); await dl.saveAs(f);
      const b = readBack(f);
      ok(!b.error && b.zip_ok && b.watertight && Math.abs(b.volume - 8000) < 1e-3 && b.unit === 'millimeter', 'the downloaded 3MF reads back watertight, 8000 mm³ — ' + JSON.stringify(b.error || b.volume));
      ok(/^Downloaded .*\.3mf: 12 triangles, in millimeters\.$/.test(await page.textContent('[data-msg]')), 'status: ' + await page.textContent('[data-msg]'));
      await openDialog(page);
      const [dl2] = await Promise.all([page.waitForEvent('download'), page.click('dialog.mc-dialog button[data-key="stl"]')]);
      const f2 = path.join(DL, 'browser-cube.stl'); await dl2.saveAs(f2);
      const a = readBack(f2);
      ok(!a.error && a.watertight && Math.abs(a.volume - 8000) < 1e-3 && a.triangles === 12, 'the downloaded STL reads back watertight, 8000 mm³');
      // a box with no top
      await page.evaluate(() => { window.modelcraft.model.undo(); });
      await build3d(page, 'open');
      const o = await openDialog(page);
      ok(o.ok === '0' && o.problems.length === 1 && /4 edges have a face on one side only/.test(o.problems[0]), 'a box with no top: not ready, 4 open edges — ' + o.problems);
      await page.screenshot({ path: path.join(OUT, '02-open-paper.png') });
      await page.click('dialog.mc-dialog button[data-key="cancel"]');
      // nothing at all
      await page.evaluate(() => { const m = window.modelcraft.model; m.undo(); m.undo(); });
      const e = await openDialog(page);
      ok(e.ok === '0' && /nothing to print/.test(e.text) && !(await page.$('dialog.mc-dialog button[data-key="3mf"]')), 'an empty model: nothing to print, no download buttons');
      await page.click('dialog.mc-dialog button[data-key="cancel"]');
      if (fs.existsSync(SKP)) {
        await page.setInputFiles('[data-file-import]', SKP);
        await page.waitForFunction(() => /^(Imported|Could not import)/.test(document.querySelector('[data-msg]')?.textContent || ''), null, { timeout: 120000 });
        const t0 = Date.now();
        const s = await openDialog(page);
        ok(/What prints: the selection/.test(s.text) && /triangles/.test(s.text), 'the SketchUp board (the import selected) is checked in ' + (Date.now() - t0) + ' ms: ' + (s.ok === '1' ? 'ready' : s.problems.join(' | ')) + (s.warnings.length ? ' — ' + s.warnings.join(' | ') : ''));
        await page.screenshot({ path: path.join(OUT, '03-skp-board-paper.png') });
        await page.click('dialog.mc-dialog button[data-key="cancel"]');
      } else console.log('  (skipped: ' + SKP + ' missing)');
    } else await page.click('dialog.mc-dialog button[data-key="cancel"]');
    await page.close();
  }
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} finally {
  await browser.close();
  if (!KEEP_ADMIN) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} if (fs.existsSync(STATE)) fs.unlinkSync(STATE); }
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${OUT}`);
process.exit(fail ? 1 : 0);
