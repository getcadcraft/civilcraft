#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-issues-util.mjs — CivilCraft 0.10 CV.1 (issues + BCF) and SU.1810 (utility networks) in headless Chromium at https://getcadcraft.com/lab/civilcraft:
 * the Issues window (add at the view centre, at a station of the selected alignment, status, comment, BCF export, BCF import again = nothing new, undo),
 * the Utility networks window (a run from the selected alignment, a typed value, crossings, the summary), the DXF with the service layers, console clean.
 * Run as root, one at a time: nice -n 10 timeout 300 node tools/civilcraft-test/browser-issues-util.mjs   (minted session, tag cv10)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-issues-util'); fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv10'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, acceptDownloads: true });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(300);
  const P = (src) => page.evaluate((s) => { const p = window.civilcraft.project; return eval(s); }, src);   // eslint-disable-line no-eval

  // ---- an alignment to pin to and to make a run from
  const aid = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, id = p.nextId('a');
    p.change('alignment', (s) => { s.alignments.push({ id, name: 'Main St', start: 0, pis: [{ x: X(0.1), y: Y(0.5), r: 0 }, { x: X(0.9), y: Y(0.5), r: 0 }], pvis: [] }); });
    window.civilcraft.select({ kind: 'alignment', id }); return id;
  });

  // ---- Issues
  await page.evaluate(() => window.civilcraft.command('issues'));
  await page.waitForSelector('[data-iss-dialog][open]');
  await page.fill('[data-iss-title]', 'Pothole at the start');
  await page.click('[data-iss-add]'); await page.waitForTimeout(200);
  ok(await P('p.state.issues.length === 1 && p.state.issues[0].pin.kind === "plan"'), 'an issue pinned at the plan view centre');
  await page.fill('[data-iss-title]', 'Edge drop'); await page.selectOption('[data-iss-mode]', 'station');
  await page.fill('#cv-iss-s', '40'); await page.click('[data-iss-add]'); await page.waitForTimeout(200);
  ok(await P('p.state.issues.length === 2 && p.state.issues[1].pin.kind === "station" && p.state.issues[1].pin.ref.sta === 40'), 'a second issue at station 40 of the selected alignment');
  await page.selectOption('[data-iss-row] select >> nth=0', 'resolved'); await page.waitForTimeout(150);
  ok(await P('p.state.issues[0].status === "resolved"'), 'status changed to resolved');
  await page.click('[data-iss-row] button.cv-linkbtn >> nth=1'); await page.fill('[data-iss-comment]', 'checked on site'); await page.click('[data-iss-addcomment]'); await page.waitForTimeout(150);
  ok(await P('p.state.issues[1].comments.length === 1'), 'a comment is added to the picked issue');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-iss-export]')]);
  const bcf = path.join(SHOTS, 'issues.bcfzip'); await dl.saveAs(bcf);
  ok(fs.statSync(bcf).size > 500 && fs.readFileSync(bcf).slice(0, 2).toString() === 'PK', 'BCF zip downloaded: ' + dl.suggestedFilename());
  await page.setInputFiles('[data-iss-file]', bcf); await page.waitForTimeout(500);
  ok(await P('p.state.issues.length === 2'), 'importing the same file again adds nothing (same topic guids)');
  await page.screenshot({ path: path.join(SHOTS, '01-issues.png') });
  await page.click('[data-iss-dialog] .cv-dlg-foot button:last-child'); await page.waitForTimeout(150);
  await page.evaluate(() => window.civilcraft.command('undo')); await page.waitForTimeout(100);
  ok(await P('p.state.issues.length === 2'), 'undo takes back the last step (the import, a no-op, or the comment) without losing the issues');
  const saved = await P('JSON.stringify(p.toJSON().issues.length)');
  ok(saved === '2', 'the issues are in the project file');

  // ---- Utility networks
  await page.evaluate((id) => window.civilcraft.select({ kind: 'alignment', id }), aid);
  await page.evaluate(() => window.civilcraft.command('utilities'));
  await page.waitForSelector('[data-un-dialog][open]');
  await page.click('[data-un-fromsel]'); await page.waitForTimeout(200);
  ok(await P('p.state.utilities.runs.length === 1 && p.state.utilities.runs[0].service === "water" && p.state.utilities.runs[0].pts.length >= 2'), 'a water run made from the selected alignment');
  await page.selectOption('[data-un-service]', 'power'); await page.click('[data-un-fromsel]'); await page.waitForTimeout(200);
  ok(await P('p.state.utilities.runs.length === 2 && p.state.utilities.runs[1].service === "power"'), 'a power run made from the same line');
  await page.fill('[data-un-row] input[aria-label="Cover (m)"] >> nth=0', '1.5'); await page.press('[data-un-row] input[aria-label="Cover (m)"] >> nth=0', 'Enter'); await page.$eval('[data-un-row] input[aria-label="Cover (m)"]', (n) => n.blur()); await page.waitForTimeout(200);
  ok(await P('p.state.utilities.runs[0].depth === 1.5'), 'the cover typed in the table is kept');
  ok((await page.textContent('[data-un-sum]')).includes('2 runs'), 'the summary counts the runs: ' + (await page.textContent('[data-un-sum]')));
  await page.screenshot({ path: path.join(SHOTS, '02-utilities.png') });
  const [dx] = await Promise.all([page.waitForEvent('download'), page.evaluate(() => window.civilcraft.command('dxf'))]);
  const dxf = path.join(SHOTS, 'out.dxf'); await dx.saveAs(dxf);
  const txt = fs.readFileSync(dxf, 'utf8');
  ok(txt.includes('U-WATR-RUN') && txt.includes('U-POWR-RUN') && txt.includes('C-ISSU-OPEN'), 'the DXF carries the service layers and the issue layer');
  await page.click('[data-un-dialog] .cv-dlg-foot button:last-child');
  ok(!problems.length, 'no console errors', problems);
} catch (e) { fail++; console.log('  FAIL ' + e.stack); } finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
