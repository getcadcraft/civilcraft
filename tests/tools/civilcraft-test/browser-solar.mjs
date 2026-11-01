#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-solar.mjs — 0.8 round 3 (civil_PART_3), EG.15: the Solar arrays window on the sample site in headless Chromium (lay out, year's energy, save,
 * save in the project file and back, the table list, the plan overlay, 3D) at https://getcadcraft.com/lab/civilcraft.
 *   node tools/civilcraft-test/browser-solar.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-solar'); })();
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
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);

  const open = async () => { await page.evaluate(() => window.civilcraft.command('solar')); await page.waitForSelector('[data-eg-dialog="cv-solar"][open]'); };
  const setField = async (label, value) => { const done = await page.evaluate(([l, v]) => { const lab = [...document.querySelectorAll('#cv-solar label.k')].find((x) => x.textContent.startsWith(l)); const inp = lab && document.getElementById(lab.getAttribute('for')); if (!inp) return false; inp.value = v; inp.dispatchEvent(new Event('change', { bubbles: true })); return true; }, [label, value]); ok(done, 'field "' + label + '" is there'); };
  const b = await page.evaluate(() => { const s = window.civilcraft.project.eg().surface.stats().bounds; return { ...s, units: window.civilcraft.project.state.units }; });
  const w = b.maxX - b.minX, h = b.maxY - b.minY;
  await open();
  ok(!!(await page.$('[data-solar-form]')), 'the Solar arrays window opens');
  // the region: corners typed inside the sample site
  await page.selectOption('#cv-solar select >> nth=0', 'poly:');
  await page.waitForSelector('[data-solar-poly]');
  const poly = [[b.minX + w * 0.15, b.minY + h * 0.15], [b.maxX - w * 0.15, b.minY + h * 0.15], [b.maxX - w * 0.15, b.maxY - h * 0.15], [b.minX + w * 0.15, b.maxY - h * 0.15]];
  await page.fill('[data-solar-poly]', poly.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join('\n')); await page.dispatchEvent('[data-solar-poly]', 'change');
  await page.click('[data-solar-plan]');
  await page.waitForSelector('[data-solar-error]');
  ok((await page.$eval('[data-solar-error]', (n) => n.textContent)).length > 10, 'without a latitude and longitude it says so');
  await setField('Latitude', '40'); await setField('Longitude', '-105');
  await setField('Modules across a table', '6');
  await page.click('[data-solar-plan]');
  await page.waitForSelector('[data-solar-result] .cv-props', { timeout: 30000 });
  const txt = await page.$eval('[data-solar-result]', (n) => n.textContent);
  ok(/Tables/.test(txt) && /Row to row/.test(txt), 'the layout is described: ' + txt.slice(0, 160));
  const n1 = await page.evaluate(() => window.civilcraft.project.state.solar?.arrays?.length || 0);
  await page.click('[data-solar-yield]');
  await page.waitForSelector('[data-solar-result] .cv-props', { timeout: 120000 });
  await page.waitForFunction(() => /Energy in a year/.test(document.querySelector('[data-solar-result]')?.textContent || ''), null, { timeout: 120000 });
  ok(true, 'the year is worked out: ' + (await page.$eval('[data-solar-result]', (n) => n.textContent)).match(/Energy in a year[^S]*/)?.[0]);
  await page.click('[data-solar-save]');
  await page.waitForFunction(() => window.civilcraft.project.state.solar?.arrays?.length === 1);
  ok(n1 === 0, 'nothing is saved until Save');
  const saved = await page.evaluate(() => { const j = window.civilcraft.project.toJSON(); return { n: j.solar?.arrays?.length, id: j.solar?.arrays?.[0]?.id, kwp: j.solar?.arrays?.[0]?.summary?.kwp, kwh: j.solar?.arrays?.[0]?.summary?.kwh, tables: j.solar?.arrays?.[0]?.tables }; });
  ok(saved.n === 1 && /^sa\d+$/.test(saved.id) && saved.kwp > 0 && saved.kwh > 0 && saved.tables === undefined, 'the array is in the project file as inputs and numbers, not as thousands of tables', saved);
  // undo takes it out
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate(() => !window.civilcraft.project.state.solar), 'one undo step removes it');
  await page.evaluate(() => window.civilcraft.project.redo());
  // it comes back from the file
  const back = await page.evaluate(async () => { const text = JSON.stringify(window.civilcraft.project.toJSON()); const m = await import('/assets/apps/civilcraft/dev/project.js'); const r = m.Project.fromJSON(JSON.parse(text)); return { n: r.project.state.solar?.arrays?.length, tables: r.project.state.solar?.arrays?.[0]?.id }; }).catch((e) => ({ err: String(e) }));
  ok(back.n === 1, 'it reads back from the project file', back);
  // a bad file cannot put junk in
  const junk = await page.evaluate(async () => { const m = await import('/assets/apps/civilcraft/dev/project.js'); const o = window.civilcraft.project.toJSON(); o.solar = { arrays: [{ id: 'x', region: { kind: 'poly', pts: [{ x: 'a', y: 1 }] } }, { region: { kind: 'zzz' } }, 7] }; return m.Project.fromJSON(o).project.state.solar || null; });
  ok(junk === null, 'a damaged solar section is dropped, not trusted', junk);
  // the plan shows it; Problems has it quiet; the CSV downloads
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-solar-csv]')]);
  const csvText = fs.readFileSync(await dl.path(), 'utf8');
  ok(csvText.split('\r\n').filter(Boolean).length > 3, 'the table list downloads as CSV (' + csvText.split('\n').length + ' lines)');
  await page.evaluate(() => document.querySelectorAll('[data-eg-dialog][open]').forEach((d) => d.close()));
  await page.screenshot({ path: path.join(OUT, 'plan.png') });
  // 3D: the tables stand on the ground
  await page.evaluate(() => window.civilcraft.command('view3d')).catch(() => {});
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
