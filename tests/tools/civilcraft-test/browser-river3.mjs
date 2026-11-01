#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-river3.mjs — 0.8 SU.957 rest (round 3, civil_PART_3): a made-up straight river in the lab, a culvert and a bridge added through Properties (one undo each),
 * the Results dialog with the structures table, and the Unsteady flow dialog run end to end, at https://getcadcraft.com/lab/civilcraft.
 *   node tools/civilcraft-test/browser-river3.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-river3'); })();
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project && window.civilcraft.command);

  const model = { format: 'cc-river', v: 1, id: 'rv1', name: 'Test river', units: 'm', centreline: [{ x: 0, y: 0 }, { x: 1000, y: 0 }], regime: 'sub',
    sections: Array.from({ length: 11 }, (_, i) => { const rs = i * 100, zb = rs * 0.001; return { id: 'xs' + (i + 1), rs, line: [{ x: 1000 - rs, y: -50 }, { x: 1000 - rs, y: 50 }], lineAt0: 50, pts: [{ o: -20, z: 10 + zb }, { o: -20, z: zb }, { o: 20, z: zb }, { o: 20, z: 10 + zb }], banks: [-20, 20], n: [{ o: -20, n: 0.03 }], reach: { lob: i ? 100 : 0, ch: i ? 100 : 0, rob: i ? 100 : 0 }, cc: 0.1, ce: 0.3 }; }),
    profiles: [{ name: 'PF 1', q: 40, changes: [], down: { type: 'normal', slope: 0.001 } }] };
  await page.evaluate((m) => { window.civilcraft.project.change('test river', (st) => { (st.rivers ||= []).push(m); }); window.civilcraft.select({ kind: 'river', id: 'rv1' }); }, model);
  await page.waitForSelector('[data-river-add-culvert]');
  ok(!!(await page.$('[data-river-unsteady]')), 'the river Properties has the Unsteady flow button');
  await page.click('[data-river-add-culvert]');
  let n = await page.evaluate(() => (window.civilcraft.project.state.rivers[0].structures || []).length);
  ok(n === 1, 'Add a culvert puts one in the river');
  await page.waitForSelector('[data-river-struct]');
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate(() => !(window.civilcraft.project.state.rivers[0].structures || []).length), 'one undo takes it back');
  await page.evaluate(() => window.civilcraft.project.redo());
  await page.click('[data-river-add-bridge]');
  ok(await page.evaluate(() => window.civilcraft.project.state.rivers[0].structures.map((s) => s.kind).join()) === 'culvert,bridge', 'Add a bridge adds a second one');
  await page.waitForSelector('[data-river-struct]');
  const saved = await page.evaluate(() => JSON.parse(JSON.stringify(window.civilcraft.project.state.rivers[0].structures)));
  ok(saved.every((s) => Number.isFinite(s.rs) && s.rs > 0 && s.rs < 1000), 'both sit between two sections', saved.map((s) => s.rs));
  // the results dialog
  await page.evaluate(() => window.civilcraft.command('river-results'));
  await page.waitForSelector('[data-river-dialog] [data-river-struct-table]', { timeout: 20000 });
  const rows = await page.$$eval('[data-river-struct-row]', (r) => r.length);
  ok(rows === 2, 'Results lists both structures in the structures table');
  ok((await page.$$eval('[data-river-table] tbody tr', (r) => r.length)) === 11, 'and the 11 sections');
  await page.click('[data-river-dialog] .cv-dlg-foot button:last-child');
  // unsteady
  await page.evaluate(() => window.civilcraft.project.change('drop structures', (st) => { delete st.rivers[0].structures; }));
  await page.evaluate(() => window.civilcraft.select(null)); await page.evaluate(() => window.civilcraft.select({ kind: 'river', id: 'rv1' }));
  await page.click('[data-river-unsteady]');
  await page.waitForSelector('[data-river-un-run]');
  await page.fill('[data-river-un-dur]', '6'); await page.fill('[data-river-un-dt]', '120');
  await page.click('[data-river-un-run]');
  await page.waitForSelector('[data-river-un-table]', { timeout: 60000 });
  ok((await page.$$eval('[data-river-un-table] tbody tr', (r) => r.length)) === 11, 'Unsteady run: a peak row for every section');
  const mass = await page.textContent('[data-river-un-mass]');
  ok(/%/.test(mass) && !!(await page.$('[data-river-un-plot] svg')), 'the volume check and the flow plot are shown: ' + mass.slice(0, 80));
  const peaks = await page.$$eval('[data-river-un-table] tbody tr', (r) => r.map((x) => Number(x.children[3].textContent)));
  ok(Math.max(...peaks) > 39 && Math.max(...peaks) <= 40.5, 'the peak at the top is the inflow peak (40): ' + peaks[10]);
  ok(!!(await page.$('[data-river-un-dialog] [data-river-review]')), 'the review line is shown');
  await page.screenshot({ path: path.join(OUT, 'unsteady.png') });
  // 0.8 SU.957 (civil_PART_4): a second river that flows into the first; Properties offers it, the Results show the junction
  await page.evaluate((m) => { const t = JSON.parse(JSON.stringify(m)); t.id = 'rv2'; t.name = 'Creek'; t.profiles[0].q = 15; t.centreline = [{ x: 0, y: 500 }, { x: 1000, y: 500 }]; window.civilcraft.project.change('creek', (st) => { st.rivers.push(t); }); window.civilcraft.select({ kind: 'river', id: 'rv2' }); }, model);
  await page.waitForSelector('[data-river-joins]');
  await page.selectOption('[data-river-joins]', 'rv1'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.civilcraft.project.state.rivers.find((r) => r.id === 'rv2').joinsTo) === 'rv1', 'Flows into: the creek is set to join the test river (one undo step)');
  await page.evaluate(() => window.civilcraft.select({ kind: 'river', id: 'rv1' })); await page.evaluate(() => window.civilcraft.command('river-results'));
  await page.waitForSelector('[data-river-dialog] [data-river-join-table]', { timeout: 20000 });
  const jt = await page.textContent('[data-river-join-table]'); ok(/Test river/.test(jt) && /Creek/.test(jt) && /55\.00/.test(jt) || /40\.00 \+ 15\.00|15\.00/.test(jt), 'the junction table names both rivers and adds the flows: ' + jt.replace(/\s+/g, ' ').slice(0, 120));
  ok(/Equal water surface/.test(await page.textContent('[data-river-dialog]')), 'and says which method it used');
  await page.click('[data-river-dialog] .cv-dlg-foot button:last-child');
  await page.evaluate(() => window.civilcraft.command('undo'));
  ok(problems.length === 0, 'no console errors', problems);
} finally {
  await browser.close();

}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
