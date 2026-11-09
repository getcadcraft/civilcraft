#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-scanfit-09.mjs — 0.9 SU.1082 round 3 (session engineer-09) in ModelCraft's real page /lab/modelcraft, headless Chromium (rule 49):
 * a can with a rounded rim (STL, known truth: torus R 16, r 4) and a block whose edge is rounded with a radius going 2 to 6 mm (STL) are
 * imported; Surfaces › Scan › Fit lists a Torus row "fillet, radius 4 mm … ring radius 16 mm" and a Variable fillet row "fillet, radius 2 to
 * 6 mm"; Stitch closes both (volume vs the closed form). Synthetic scans only: a real scan is the owner's hand check. No console errors.
 *   node tools/nurbs/browser-scanfit-09.mjs [--out <dir>]      (root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { roundedCan, roundedCanVolume, varFilletBlock, binaryStl } = await import(path.join(REPO, 'tools/nurbs/scan-fixtures.mjs'));
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/scanfit')));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model, null, { timeout: 60000 });
  await page.evaluate(() => document.querySelector('[data-nurbs-open]').scrollIntoView());
  await page.click('[data-nurbs-open]');
  await page.waitForSelector('[data-nurbs-panel]');
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const note = () => page.evaluate(() => [...document.querySelectorAll('[data-nurbs-panel] .nui-note[aria-live]')].map((e) => e.textContent).join(' '));
  const fitAndStitch = async (file, mesh, minRows) => {
    await page.evaluate(() => window.modelcraft.surfaces.session.load(null));
    await page.setInputFiles('[data-file-import]', { name: file, mimeType: 'model/stl', buffer: binaryStl(mesh) });
    const stem = file.replace(/\.stl$/, '');
    await page.waitForFunction((s) => (document.body.textContent || '').includes(s), stem, { timeout: 30000 }).catch(() => {});
    await page.evaluate(() => { const m = window.modelcraft.model; const iid = [...m.root.insts.keys()].at(-1); window.modelcraft.host.setSel([{ t: 'i', id: iid }]); });
    await page.click('[data-nurbs-start="scan.fit"]');
    await opt('tol', '0.1');
    await page.click('[data-nurbs-run]');
    await page.waitForFunction((n) => document.querySelectorAll('[data-nurbs-scan-row]').length >= n, minRows, { timeout: 90000 });
    const rows = await page.$$eval('[data-nurbs-scan-row]', (r) => r.map((x) => ({ ok: x.dataset.ok, t: x.textContent })));
    await page.screenshot({ path: path.join(OUT, '09-' + stem + '.png') });
    await page.click('[data-nurbs-start="scan.solid"]');
    await page.click('[data-nurbs-run]');
    await page.waitForSelector('[data-nurbs-solid]', { timeout: 60000 }).catch(() => {});
    const l = await note();
    return { rows, vol: Number((l.match(/Volume ([\d.]+) mm/) || [])[1]), line: l };
  };

  console.log('== a can with a rounded rim (torus R 16, r 4)');
  const c = await fitAndStitch('rim-can.stl', roundedCan(20, 40, 4, 96, 8, 0.01), 4);
  const tor = c.rows.find((r) => /^Scan torus/.test(r.t));
  ok(!!tor, 'a Torus row is listed — ' + c.rows.map((r) => r.t.split('·')[0]).join(' | '));
  const tr = tor && Number((tor.t.match(/fillet, radius ([\d.]+) mm/) || [])[1]), tR = tor && Number((tor.t.match(/ring radius ([\d.]+) mm/) || [])[1]);
  ok(tor && Math.abs(tr - 4) < 0.05 && Math.abs(tR - 16) < 0.05, 'the torus is a fillet of radius ' + tr + ' (truth 4), ring radius ' + tR + ' (truth 16)', tor && tor.t);
  ok(c.rows.every((r) => r.ok === '1'), 'every face: largest error within 0.1 mm');
  const want = roundedCanVolume(20, 40, 4);
  ok(Math.abs(c.vol - want) / want < 0.005, 'the rim-filleted can stitches: volume ' + c.vol + ' vs ' + want.toFixed(0) + ' mm3 closed form', c.line.slice(0, 160));

  console.log('== a block whose edge radius goes from 2 to 6 mm');
  const law = (x) => 2 + 4 * x / 60, b = await fitAndStitch('var-fillet.stl', varFilletBlock(60, 40, 30, law, 10, 0.01), 7);
  const vf = b.rows.find((r) => /^Scan varfillet/.test(r.t));
  const m = vf && vf.t.match(/fillet, radius ([\d.]+) to ([\d.]+) mm/);
  ok(!!vf && /Variable fillet/.test(vf.t), 'a Variable fillet row is listed — ' + b.rows.map((r) => r.t.split('·')[0]).join(' | '));
  ok(!!m && Math.abs(Math.min(+m[1], +m[2]) - 2) < 0.05 && Math.abs(Math.max(+m[1], +m[2]) - 6) < 0.05, 'its radius runs ' + (m && m[1]) + ' to ' + (m && m[2]) + ' mm (truth 2 to 6)', vf && vf.t);
  ok(b.rows.every((r) => r.ok === '1'), 'every face: largest error within 0.1 mm');
  let cut = 0; for (let i = 0; i < 6000; i++) cut += (1 - Math.PI / 4) * law(60 * (i + 0.5) / 6000) ** 2 * 60 / 6000;
  const want2 = 60 * 40 * 30 - cut;
  ok(Math.abs(b.vol - want2) / want2 < 0.005, 'the block stitches: volume ' + b.vol + ' vs ' + want2.toFixed(0) + ' mm3 closed form', b.line.slice(0, 160));
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' - ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
