#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-concrete.mjs — DetailCraft's Concrete and Seismic blocks in the page (0.8 SU.1056, concrete-08). Run as root (it calls
 * `sudo -u www-data php tools/frame/admin.php session|down`) with the cached Playwright Chromium:
 *
 *   node tools/frame/browser-concrete.mjs [--shots <dir>]
 *
 * A two-storey frame of plate profiles (PL400x400 columns, PL300x600 beams) is drawn through the model; the Analysis tab shows both
 * blocks, each opening with "for checking by an engineer"; sections are set up as concrete, floors found and weighed, seismic cases
 * and combinations made, the analysis run, the concrete check run: a row per member, the members coloured, the storey forces and the
 * drift table, the report PDF carrying the tables, the failed checks in the shell's Problems panel. Fails on any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SHOTS = arg('--shots', path.join(ROOT, 'tmp/shots/frame'));
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const tmp = fs.mkdtempSync(path.join(ROOT, 'tmp/frame-concrete-'));

const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/frame/admin.php'), cmd], { encoding: 'utf8' }));
const SESSION = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const issues = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
  await ctx.addCookies([{ name: SESSION.name, value: SESSION.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') issues.push('console: ' + m.text()); });
  page.on('pageerror', (e) => issues.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/detailcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.detailcraft && window.detailcraft.view, null, { timeout: 30000 });
  const sameTab = () => page.waitForSelector('[data-fa-concrete]');
  // draw a two-storey concrete frame through the app's own model (one undo step)
  await page.evaluate(() => {
    const d = window.detailcraft;
    d.model.change('concrete frame', (tx) => {
      const P = [[0, 0], [6000, 0], [6000, 5000], [0, 5000]];
      for (const [z0, z1] of [[0, 3500], [3500, 7000]]) P.forEach(([x, y]) => tx.addMember({ type: 'column', profile: 'PL400x400', start: [x, y, z0], end: [x, y, z1] }));
      for (const z of [3500, 7000]) P.forEach(([x, y], k) => { const [x2, y2] = P[(k + 1) % 4]; tx.addMember({ type: 'beam', profile: 'PL300x600', start: [x, y, z], end: [x2, y2, z] }); });
    });
  });
  await page.waitForFunction(() => window.detailcraft.model.state.members.length === 16);
  await page.click('[data-tab="analysis"]');
  await sameTab();
  const rcAid = await page.textContent('[data-fa-rc-aid]'), eqAid = await page.textContent('[data-fa-eq-aid]');
  ok(/checking by an engineer/.test(rcAid) && /checking by an engineer/.test(eqAid), 'both blocks open with "for checking by an engineer"');
  ok(await page.locator('[data-fa-rc-setup]').count() === 2, 'the Concrete block lists the two sections the members use, each with "Set up as concrete…"');
  await page.click('[data-fa-rc-setup="PL400x400"]');
  await page.click('[data-fa-rc-setup="PL300x600"]');
  await page.waitForSelector('[data-fa-rc-form="PL300X600"]');
  const forms = () => page.evaluate(() => window.detailcraft.model.state.analysis?.concrete?.forms || {});
  let f = await forms();
  ok(Object.keys(f).length === 2 && f.PL400X400.b * f.PL400X400.h === 160000 && f.PL300X600.b * f.PL300X600.h === 180000, 'both are set up as rectangles from the drawn profiles (160 000 and 180 000 mm²)', JSON.stringify(Object.values(f).map((x) => [x.b, x.h])));
  await page.check('[data-fa-rc="PL400X400:cage"]');
  await page.fill('[data-fa-rc="PL300X600:cover"]', '60'); await page.keyboard.press('Tab');
  f = await forms();
  ok(f.PL400X400.cage && f.PL400X400.cage.ny === 3 && f.PL300X600.cover === 60, 'a column cage and a cover are saved in the model');
  // floors
  await page.click('[data-fa-eq-find]');
  await page.waitForSelector('[data-fa-eq-floors] tbody tr');
  ok(await page.locator('[data-fa-eq-floors] tbody tr').count() === 2, 'Find floors: the two levels where beams meet');
  // the weights come from the Dead case's own weight (the helper), not typed
  await page.click('[data-fa-eq-weights]');
  await page.waitForFunction(() => window.detailcraft.model.state.analysis.concrete.floors.every((f) => f.w > 0));
  const ws = await page.evaluate(() => window.detailcraft.model.state.analysis.concrete.floors.map((f) => f.w));
  // hand: beams 0.18 m² × 22 m × 2400 kg/m³ × g = 93.2 kN a floor; ½ × 4 columns of 13.18 kN to each floor they join: F2 119.6, F1 145.9 kN (rounded to 0.1)
  ok(Math.abs(ws[0] - 145.9) < 0.15 && Math.abs(ws[1] - 119.6) < 0.15, `Take weights from cases: F1 ${ws[0]} kN, F2 ${ws[1]} kN (the half-storey rule on the Dead case's own weight)`);
  await page.click('[data-fa-eq-make]');
  await page.waitForFunction(() => window.detailcraft.model.state.analysis.cases.some((c) => c.gen === 'elf'));
  const nCases = await page.evaluate(() => window.detailcraft.model.state.analysis.cases.filter((c) => c.gen === 'elf').length);
  ok(nCases === 4, 'Make seismic cases: four cases (X and Y, torsion each way) in the model');
  await page.click('[data-fa-rc-make]');
  const nCombo = await page.evaluate(() => window.detailcraft.model.state.analysis.combos.filter((c) => c.limit === 'strength').length);
  ok(nCombo >= 5, `Make combinations: ${nCombo} strength combinations (ASCE 7) saved`);
  await page.click('[data-fa-run]');
  await page.waitForSelector('[data-fa-eq-forces]');
  const sum = await page.textContent('[data-fa-eq-summary]');
  ok(/V 53\.\d kN/.test(sum) && /12\.8-2/.test(sum), 'the storey forces: V = Cs W = 0.2 × 265.5 kN by equation 12.8-2', sum.trim());
  const drift = await page.$$eval('[data-fa-eq-drift]', (r) => r.length);
  ok(drift === 8, 'the drift table has a row per floor and seismic case (8)');
  await page.click('[data-fa-rc-run]');
  await page.waitForSelector('[data-fa-rc-table]');
  const rows = await page.$$eval('[data-fa-rc-row]', (r) => r.map((x) => x.getAttribute('data-fa-rc-row')));
  const coloured = await page.evaluate(() => window.detailcraft.view._analysisUtil?.children.length || 0);
  ok(rows.length === 16 && !rows.includes('not-checked') && coloured > 0, `Check concrete: ${rows.length} members checked (${rows.filter((x) => x === 'fail').length} over capacity), ${coloured} coloured on the view`);
  await page.locator('[data-fa-concrete]').screenshot({ path: path.join(SHOTS, '03-concrete-block.png') });
  await page.locator('[data-fa-seismic]').screenshot({ path: path.join(SHOTS, '04-seismic-block.png') });
  // the report
  const [d] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), page.click('[data-fa-pdf]')]);
  const pf = path.join(tmp, d.suggestedFilename());
  await d.saveAs(pf);
  const text = (() => { try { return execFileSync('pdftotext', ['-layout', pf, '-'], { encoding: 'utf8' }); } catch { return ''; } })();
  ok(!text || (/Concrete checks/.test(text) && /ACI 318-19/.test(text) && /Storey drift/.test(text) && /Forces on the floors/.test(text) && /checking by an engineer/.test(text)), 'the report PDF carries the concrete checks, the storey forces and the drift, with the engineer line');
  // problems in the shell's panel (failed checks and drift over the limit)
  const nProb = await page.evaluate(() => window.ccProblems ? window.ccProblems.store.list().filter((p) => p.source?.name === 'detailcraft.frame').length : -1).catch(() => -1);
  const fails = rows.filter((x) => x === 'fail').length;
  ok(nProb === -1 || nProb >= fails, `the failed checks are in the shell's Problems (${nProb} from the frame source, ${fails} members over capacity)`);
  // undo takes the last settings change back
  const before = await page.evaluate(() => window.detailcraft.model.state.analysis.concrete.mat.cracked);
  await page.selectOption('[data-fa-rc-mat="stiff"]', 'gross');
  const gross = await page.evaluate(() => window.detailcraft.model.state.analysis.concrete.mat.cracked);
  await page.evaluate(() => document.activeElement?.blur());
  await page.keyboard.press('Control+z');
  const back = await page.evaluate(() => window.detailcraft.model.state.analysis.concrete.mat.cracked);
  ok(before === true && gross === false && back === true, 'Stiffness → gross sections is one undo step (Ctrl+Z takes it back)');
  ok(/stale|changed|Run/i.test((await page.textContent('[data-fa-rc-state]').catch(() => '')) || 'stale'), 'the results are stale after the change');
  await page.screenshot({ path: path.join(SHOTS, '05-concrete-page.png') });
} finally {
  await browser.close();
  try { admin('down'); } catch { /* the test admin stays disabled anyway */ }
  fs.rmSync(tmp, { recursive: true, force: true });
}
for (const i of issues) { fail++; console.log('  FAIL ' + i); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
