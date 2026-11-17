#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bim-openings.mjs — booklet row BK.11 in the real TakeoffCraft page, /lab, headless (session bk-quantities-10): a takeoff handed
 * over by BimCraft (a house: exterior walls with two windows and a door, an inside wall with a door) is opened from its PDF, and TakeoffCraft
 * shows the wall area NET of the openings, with the gross and what was taken out, equal to BimCraft's own schedule.
 *   nice -n 10 timeout 600 node tools/takeoffcraft-test/browser-bim-openings.mjs [--shots <dir>]      run as root (a test admin session)
 * The hand-over file is made first by `node bin/test-bimcraft.mjs --quantities` (BimCraft's own modules), with BimCraft's numbers beside it.
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

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bkq-'));
const PDF = path.join(tmp, 'House takeoff.pdf');
const made = spawnSync(process.execPath, [path.join(ROOT, 'bin/test-bimcraft.mjs'), '--quantities'], { env: { ...process.env, BKQ_PDF: PDF }, encoding: 'utf8' });
ok(made.status === 0 && fs.existsSync(PDF) && fs.existsSync(PDF + '.json'), 'BimCraft made the hand-over PDF (its own quantities test passed)', (made.stdout || '').split('\n').filter((l) => /FAIL/.test(l)).slice(0, 3));
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
  const st = await T(() => { const s = window.takeoffcraft.model.state; return { items: s.items.map((i) => ({ id: i.id, name: i.name, type: i.type, heightFt: i.heightFt })), opens: s.marks.filter((m) => m.opens).map((m) => ({ id: m.id, item: m.item, sheet: m.sheet, n: m.opens.length, pts: m.pts })) }; });
  ok(st.opens.length === 3 && st.opens.reduce((n, m) => n + m.n, 0) === 4, 'three wall runs carry openings: 4 in all (two windows and a door outside, one door inside)', st.opens.map((m) => m.n));

  console.log('== the estimate: wall area net, with the gross and the openings');
  const FT2 = 304.8 * 304.8;
  const rows = await T(() => window.takeoffcraft.estimate().rows.filter((r) => r.kind === 'item' && r.wallArea).map((r) => ({ name: r.name, wallArea: r.wallArea })));
  const ext = rows.find((r) => r.wallArea.deductions > 0 && r.wallArea.gross * 92903.04 > 5e7), int = rows.find((r) => r.wallArea.deductions > 0 && r !== ext);
  ok(ext && rel(ext.wallArea.gross * FT2, BIM.ext.gross) && rel(ext.wallArea.deductions * FT2, BIM.ext.deductions) && rel(ext.wallArea.value * FT2, BIM.ext.net), 'exterior walls: ' + ext?.wallArea.gross.toFixed(2) + ' SF gross, ' + ext?.wallArea.deductions.toFixed(2) + ' out, ' + ext?.wallArea.value.toFixed(2) + ' net = BimCraft\'s schedule (' + Math.round(BIM.ext.gross) + ' / ' + Math.round(BIM.ext.deductions) + ' / ' + Math.round(BIM.ext.net) + ' mm2)', ext);
  ok(int && rel(int.wallArea.gross * FT2, BIM.int.gross) && rel(int.wallArea.deductions * FT2, BIM.int.deductions) && rel(int.wallArea.value * FT2, BIM.int.net), 'the inside wall: ' + int?.wallArea.gross.toFixed(2) + ' SF gross, ' + int?.wallArea.deductions.toFixed(2) + ' out, ' + int?.wallArea.value.toFixed(2) + ' net = BimCraft\'s schedule', int);
  const noteRows = await page.$$eval('tr.is-note[data-qty-wall]', (trs) => trs.map((tr) => tr.textContent));
  ok(noteRows.some((x) => / net \(length × .* gross, less .* of openings\)/.test(x)), 'the Quantities table says so under the wall item: net, gross, less the openings', noteRows.slice(0, 3));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'tk-1-estimate.png') });

  console.log('== a wall run picked on the sheet');
  const m = st.opens.find((x) => x.n === 2) || st.opens[0];
  await T((key) => window.takeoffcraft.showSheet(key), m.sheet);
  await page.waitForTimeout(800);
  // 30% along the run: its middle is where the inside wall meets it
  const mid = await T((pts) => window.takeoffcraft.toScreen({ x: pts[0].x + (pts[1].x - pts[0].x) * 0.3, y: pts[0].y + (pts[1].y - pts[0].y) * 0.3 }), m.pts.slice(0, 2).map((p) => (Array.isArray(p) ? { x: p[0], y: p[1] } : p)));
  await page.mouse.click(mid.x, mid.y);
  await page.waitForTimeout(400);
  ok((await T(() => window.takeoffcraft.selection())).includes(m.id), 'a click on the south wall\'s run selects it');
  const props = await page.textContent('[data-mark-props]');
  ok(/Wall area/.test(props) && /Wall area, gross/.test(props) && /Openings deducted \(2\)/.test(props), 'its properties show Wall area (net), Wall area, gross and Openings deducted (2)', props.slice(0, 400));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'tk-2-run-props.png') });
  await T(() => window.takeoffcraft.model.markSaved?.());

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await browser.contexts()[0]?.pages()[0]?.screenshot({ path: path.join(SHOTS, 'tk-stopped.png') }).catch(() => {});
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* already down */ }
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
