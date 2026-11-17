#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-measure.mjs — booklet row BK.42 in the real TakeoffCraft page, /lab, headless (session bk-measure-10): a takeoff handed over
 * by BimCraft under the RICS NRM 2 method (four brick walls with a door and three windows, a partition; bricks priced per 1000) is
 * opened from its PDF. TakeoffCraft measures the wall area by that method (openings of 0.5 m2 or less stay in), names the method,
 * and prices the bricks and the mortar from the two components.
 *   nice -n 10 timeout 600 node tools/takeoffcraft-test/browser-measure.mjs [--shots <dir>]      run as root (a test admin session)
 * The hand-over file is made first by `node bin/test-bimcraft.mjs --qtymethod` (BimCraft's own modules), with BimCraft's numbers beside
 * it (worked out by hand in the header of tools/bimcraft-test/measure-test.mjs): 54 000 000 mm2 gross, 3 330 000 deducted, 50 670 000 net,
 * 6006 bricks to order, 850 per 1000 = 5105.10.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const rel = (a, b, e = 1e-4) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bkm-'));
const PDF = path.join(tmp, 'Measure takeoff.pdf');
const made = spawnSync(process.execPath, [path.join(ROOT, 'bin/test-bimcraft.mjs'), '--qtymethod'], { env: { ...process.env, BKM_PDF: PDF }, encoding: 'utf8' });
ok(made.status === 0 && fs.existsSync(PDF) && fs.existsSync(PDF + '.json'), 'BimCraft made the hand-over PDF under RICS NRM 2 (its own measurement-method test passed)', (made.stdout || '').split('\n').filter((l) => /FAIL/.test(l)).slice(0, 3));
const BIM = fs.existsSync(PDF + '.json') ? JSON.parse(fs.readFileSync(PDF + '.json', 'utf8')) : null;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  if (!BIM) throw new Error('no hand-over file');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  const throttled = new Set();
  page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);

  console.log('== open the PDF BimCraft made: the takeoff inside it is offered and opened');
  await page.setInputFiles('[data-file-pdf]', PDF);
  await page.waitForSelector('dialog.tc-dialog [data-key="ok"]', { timeout: 30000 });
  ok(/takeoff/i.test(await page.textContent('dialog.tc-dialog')), 'TakeoffCraft finds the takeoff in the PDF and asks');
  await page.click('dialog.tc-dialog [data-key="ok"]');
  await page.waitForFunction(() => window.takeoffcraft.model.state.marks.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const st = await T(() => { const s = window.takeoffcraft.model.state; return { method: s.method || null, items: s.items.map((i) => ({ id: i.id, name: i.name, components: i.components.map((c) => ({ name: c.name, unit: c.unit, formula: c.formula, mat: c.mat })) })), opens: s.marks.filter((m) => m.opens).map((m) => ({ id: m.id, item: m.item, sheet: m.sheet, n: m.opens.length, pts: m.pts })) }; });
  ok(st.method?.id === 'rics-nrm2-2021' && st.opens.length === 1 && st.opens[0].n === 4, 'the takeoff carries the method id, and the south wall\'s run its four openings', [st.method, st.opens.map((m) => m.n)]);

  console.log('== the estimate: wall area by the method, bricks and mortar priced');
  const FT2 = 304.8 * 304.8;
  const est = await T(() => window.takeoffcraft.estimate().rows.map((r) => ({ kind: r.kind, name: r.name, unit: r.unit, qty: r.qty, matExt: r.matExt, wallArea: r.wallArea || null, error: r.error || null })));
  const bi = est.find((r) => r.kind === 'item' && /^Brick 215 test walls/.test(r.name));
  const K = bi?.wallArea && /m/.test(bi.wallArea.unit) ? 1e6 : FT2;
  ok(bi && rel(bi.wallArea.gross * K, BIM.gross) && rel(bi.wallArea.deductions * K, BIM.deductions) && rel(bi.wallArea.value * K, BIM.net), 'brick walls: ' + bi?.wallArea.gross.toFixed(2) + ' gross, ' + bi?.wallArea.deductions.toFixed(2) + ' out, ' + bi?.wallArea.value.toFixed(2) + ' ' + bi?.wallArea.unit + ' net = BimCraft under NRM 2 (' + BIM.gross + ' / ' + BIM.deductions + ' / ' + BIM.net + ' mm2): the 0.5 and 0.09 m2 windows stay in', bi);
  const units = est.find((r) => r.kind === 'component' && /units to order/.test(r.name)), mortar = est.find((r) => r.kind === 'component' && /^Mortar volume/.test(r.name));
  ok(units && !units.error && units.unit === '1000 EA' && Math.abs(units.qty * 1000 - BIM.units) <= 1 && Math.abs(units.matExt - Math.round(BIM.amount * 100)) <= 85, 'the bricks: ' + (units ? Math.round(units.qty * 1000) : '?') + ' to order (BimCraft ' + BIM.units + '), priced ' + (units ? (units.matExt / 100).toFixed(2) : '?') + ' at 850 per 1000 (BimCraft ' + BIM.amount.toFixed(2) + ')', units);
  ok(mortar && !mortar.error && mortar.unit === 'm³' && rel(mortar.qty * 1e9, BIM.mortar, 2e-4), 'the mortar: ' + mortar?.qty.toFixed(3) + ' m3 (BimCraft ' + (BIM.mortar / 1e9).toFixed(3) + ')', mortar);
  const noteRows = await page.$$eval('tr.is-note[data-qty-wall]', (trs) => trs.map((tr) => tr.textContent));
  ok(noteRows.some((x) => / net \(length × .* gross, less .* of openings\)/.test(x) && x.includes(BIM.line)), 'the Quantities table says under the wall item: net, gross, less the openings, then the method, its source and "Unchecked by a quantity surveyor"', noteRows.slice(0, 2));
  const rowsText = await page.evaluate(() => document.body.innerText);
  ok(/units to order/.test(rowsText) && /Mortar volume/.test(rowsText), 'the two masonry components are listed in the page');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'tkm-1-estimate.png') });

  console.log('== the south wall\'s run picked on the sheet');
  const m = st.opens[0];
  await T((key) => window.takeoffcraft.showSheet(key), m.sheet);
  await page.waitForTimeout(800);
  // 23% along the run: between the door's count mark and the first window's
  const mid = await T((pts) => window.takeoffcraft.toScreen({ x: pts[0].x + (pts[1].x - pts[0].x) * 0.23, y: pts[0].y + (pts[1].y - pts[0].y) * 0.23 }), m.pts.slice(0, 2).map((p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p)));
  await page.mouse.click(mid.x, mid.y);
  await page.waitForTimeout(400);
  ok((await T(() => window.takeoffcraft.selection())).includes(m.id), 'a click on the south wall\'s run selects it');
  const props = await page.textContent('[data-mark-props]');
  ok(/Openings deducted \(2\)/.test(props) && /Openings the method does not deduct \(2\)/.test(props) && /Measurement method/.test(props) && /Unchecked by a quantity surveyor/.test(props), 'its properties: Openings deducted (2), Openings the method does not deduct (2), and the method', props.slice(0, 600));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'tkm-2-run-props.png') });

  console.log('== the exported estimate and the saved takeoff');
  const out = await T(async () => { const X = await import(new URL('export.js', [...document.querySelectorAll('script[type=module]')].map((s) => s.src).find((s) => /takeoffcraft/.test(s)) || location.href).href).catch(() => null); return { csv: X ? X.estimateCsv(window.takeoffcraft.model.state) : null, json: window.takeoffcraft.model.toJSON() }; });
  ok(out.json.method?.id === 'rics-nrm2-2021', 'a takeoff saved from here keeps the method', out.json.method);
  if (out.csv !== null) ok(out.csv.includes(BIM.line), 'the exported estimate (CSV) ends with the method line');
  await T(() => window.takeoffcraft.model.markSaved?.());

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await browser.contexts()[0]?.pages()[0]?.screenshot({ path: path.join(SHOTS, 'tkm-stopped.png') }).catch(() => {});
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* already down */ }
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
