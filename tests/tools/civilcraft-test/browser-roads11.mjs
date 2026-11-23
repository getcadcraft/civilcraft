#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-roads11.mjs — civil-roads-11, 0.11 in the real /lab page: the alignment's elements table and CSV (FX.369), a spiral between two curves (SU.1944), a circular vertical
 * curve by radius (FX.366), the pipe-run profile window (SU.1937), named drainage rule sets (SU.1937b).
 *   Run as root: nice -n 10 timeout 400 node tools/civilcraft-test/browser-roads11.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-roads11'); fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 200)); });
  await page.goto('https://getcadcraft.com/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(400);
  const aid = await page.evaluate(() => {
    const p = window.civilcraft.project, id = p.nextId('a'), u = (d) => [Math.cos(d * Math.PI / 180), Math.sin(d * Math.PI / 180)], b = p.eg().surface.bounds, x0 = b.minX + 40, y0 = (b.minY + b.maxY) / 2;
    const V = [x0 + 750, y0], d50 = u(50), P2 = [V[0] + d50[0] * 32, V[1] + d50[1] * 32], P3 = [V[0] + d50[0] * 400, V[1] + d50[1] * 400];
    p.change('alignment', (s) => { s.alignments.push({ id, name: 'Compound', start: 0, pis: [{ x: x0, y: y0, r: 0 }, { x: x0 + 700, y: y0, r: 300, lsc: 60 }, { x: P2[0], y: P2[1], r: 150 }, { x: P3[0], y: P3[1], r: 0 }],
      pvis: [{ sta: 0, z: 100 }, { sta: 400, z: 112, R: 3000 }, { sta: 900, z: 104 }] }); });
    return id;
  });
  await page.evaluate((id) => window.civilcraft.select({ kind: 'alignment', id }), aid);
  await page.waitForTimeout(600);
  // FX.369
  const rows = await page.$$eval('[data-al-elements] tbody tr', (t) => t.map((r) => ({ kind: r.dataset.elKind, cells: [...r.children].map((c) => c.textContent) })));
  ok(rows.map((r) => r.kind).join() === 'line,arc,cspiral,arc,line', 'the elements table lists line, arc, joining spiral, arc, line', rows.map((r) => r.kind));
  const cs = rows.find((r) => r.kind === 'spiral') || rows.find((r) => r.kind === 'cspiral');
  ok(rows.some((r) => r.kind === 'cspiral') || rows.length === 5, 'rows read');
  ok(await page.evaluate(() => /Compound spiral/.test(document.querySelector('[data-al-elements]')?.textContent || '')), 'the joining spiral is named Compound spiral');
  const gis = rows[0].cells[8];
  ok(gis === '100.0000', 'the first straight runs east: gisement 100.0000 gon', gis);
  ok(await page.evaluate(() => !!document.querySelector('#cv-pi2-lsc') && !document.querySelector('#cv-pi1-lsc')), 'the PI table has the To next box on PI 2 only (PI 1 is an end)');
  ok(await page.evaluate(() => document.querySelector('#cv-pi2-lsc')?.value === '60'), 'it shows 60');
  await page.evaluate(() => { const h = [...document.querySelectorAll('h3')].find((x) => x.textContent.trim() === 'Elements'); h?.click(); });
  await page.waitForTimeout(300);
  const dl = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.click('[data-al-csv="fr"]', { timeout: 5000 })]);
  const csvTxt = dl[0] ? fs.readFileSync(await dl[0].path(), 'utf8') : null;
  ok(csvTxt && csvTxt.startsWith('﻿') && csvTxt.includes(';') && /\d,\d{3}/.test(csvTxt), 'the French CSV downloads: BOM, semicolons, decimal commas', csvTxt && csvTxt.slice(0, 160));
  // SU.1944: edit the spiral in the box, one undo step
  const open3 = (name) => page.evaluate((n) => { const h = [...document.querySelectorAll('h3')].find((x) => x.textContent.trim() === n); h?.click(); }, name);
  await open3('PIs'); await page.waitForTimeout(300);
  await page.fill('#cv-pi2-lsc', '40'); await page.keyboard.press('Tab'); await page.waitForTimeout(500);
  ok(await page.evaluate((id) => window.civilcraft.project.state.alignments.find((a) => a.id === id).pis[1].lsc === 40, aid), 'typing 40 in To next changes the PI');
  await open3('Curves'); await page.waitForTimeout(300);
  ok(await page.evaluate(() => /Joining spiral/.test(document.querySelector('[data-comp-spiral]')?.textContent || '')), 'the curve list says "Joining spiral…"');
  await page.evaluate(() => window.civilcraft.project.undo());
  ok(await page.evaluate((id) => window.civilcraft.project.state.alignments.find((a) => a.id === id).pis[1].lsc === 60, aid), 'one undo puts 60 back');
  // FX.366
  const vc = await page.evaluate((id) => { const a = window.civilcraft.project.state.alignments.find((x) => x.id === id), pr = window.civilcraft.project.designProfile(a); return { ok: pr.ok, circ: pr.curves[0]?.circ, R: pr.curves[0]?.R }; }, aid);
  ok(vc.ok && vc.circ && vc.R === 3000, 'the profile holds a circular vertical curve R 3000', vc);
  ok(await page.evaluate(() => !!document.querySelector('#cv-pvi2-r') && document.querySelector('#cv-pvi2-r').value === '3000') && /Circular curve R 3000/.test(await page.evaluate(() => document.querySelector('[data-profile-facts]')?.textContent || '')), 'the PVI table has the R box and the facts line names the circle');
  // SU.1937 / SU.1937b: a network
  await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, x = b.minX + 20, y = b.minY + 20;
    p.change('network', (s) => { s.network = { name: 'Storm', type: 'storm', rules: { minSlope: 0.005, minCover: 0.6, minDrop: 0.03 }, structures: [
      { id: 's1', name: 'MH-1', x, y, rim: null, sumpDepth: 0.3, dia: 1200 }, { id: 's2', name: 'MH-2', x: x + 60, y, rim: null, sumpDepth: 0.3, dia: 1200 }, { id: 's3', name: 'MH-3', x: x + 120, y, rim: null, sumpDepth: 0.3, dia: 1200 }],
      pipes: [{ id: 'q1', name: 'P1', from: 's1', to: 's2', dia: 300, invUp: null, invDn: null }, { id: 'q2', name: 'P2', from: 's2', to: 's3', dia: 300, invUp: null, invDn: null }] }; });
  });
  await page.evaluate(() => window.civilcraft.select({ kind: 'structure', id: 's1' }));
  await page.waitForTimeout(500);
  await page.click('[data-ppr-open]'); await page.waitForSelector('[data-ppr-dialog][open]');
  ok(/Set the inverts|no inverts/i.test(await page.evaluate(() => document.querySelector('[data-ppr-note]')?.textContent || '')) || await page.evaluate(() => document.querySelector('[data-ppr-note]')?.textContent.length > 0), 'a run with no inverts is refused with a reason');
  await page.evaluate(() => document.querySelector('[data-ppr-dialog]').close());
  await page.evaluate(() => { const p = window.civilcraft.project; p.change('inverts', (s) => { const z = (st) => p.pipeSurface().elevationAt(st.x, st.y, 1e-6); const a = z(s.network.structures[0]); s.network.pipes[0].invUp = a - 1.2; s.network.pipes[0].invDn = a - 1.6; s.network.pipes[1].invUp = a - 1.65; s.network.pipes[1].invDn = a - 2.0; }); window.civilcraft.select({ kind: 'structure', id: 's1' }); });
  await page.waitForTimeout(400);
  await page.click('[data-ppr-open]'); await page.waitForSelector('[data-ppr-dialog][open] svg');
  const svgInfo = await page.evaluate(() => { const v = document.querySelector('[data-ppr-view]'); return { n: v.querySelectorAll('polyline').length, text: v.textContent }; });
  ok(svgInfo.n > 20 && /MH-1/.test(svgInfo.text) && /MH-3/.test(svgInfo.text) && /rim /.test(svgInfo.text) && /300 mm/.test(svgInfo.text), 'the window draws the run: manholes named, rims, pipe size', { n: svgInfo.n });
  await page.screenshot({ path: path.join(SHOTS, 'pipe-run.png') });
  const dl2 = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.click('[data-ppr-svg]')]);
  ok(dl2[0] && fs.readFileSync(await dl2[0].path(), 'utf8').startsWith('<svg'), 'Save SVG downloads the drawing');
  const dl3 = await Promise.all([page.waitForEvent('download', { timeout: 8000 }).catch(() => null), page.click('[data-ppr-pdf]')]);
  ok(dl3[0] && fs.readFileSync(await dl3[0].path()).subarray(0, 4).toString() === '%PDF', 'Save PDF downloads a PDF');
  await page.evaluate(() => document.querySelector('[data-ppr-dialog]').close());
  // SU.1941: named values by station in the corridor's templates block
  const nv = await page.evaluate(async (id) => {
    const TP = await import('/assets/apps/civilcraft/dev/templates.js'), p = window.civilcraft.project, EX = TP.exampleTemplates('m');
    p.change('tpl', (s) => { s.templates = ['lanes', 'daylight'].map((k, i) => ({ ...JSON.parse(JSON.stringify(EX.find((x) => x.id === 'ex-' + k))), id: 'tp' + (i + 1), source: 'project' })); s.seq = 20;
      const a = s.alignments.find((x) => x.id === id); a.corridor = { on: true, lane: 3.6, laneSlope: 0.02, shoulder: 1.2, shoulderSlope: 0.04, cut: 2, fill: 3, step: 25, regions: [{ from: 0, L: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp2' } }, R: { uses: [{ tpl: 'tp1' }], end: { tpl: 'tp2' } } }] }; });
    window.civilcraft.select({ kind: 'alignment', id });
    return true;
  }, aid);
  await page.waitForTimeout(800);
  for (const rx of ['^Templates by station$', '^Named values by station$', '^Corridor$']) {
    if (await page.evaluate(() => { const b = document.querySelector('[data-tpl-nv-add]'); return !!b && b.offsetParent !== null; })) break;
    await page.evaluate((r) => { const h = [...document.querySelectorAll('h3')].find((x) => new RegExp(r).test(x.textContent.trim())); h?.click(); }, rx); await page.waitForTimeout(300);
  }
  const addNv = await page.$('[data-tpl-nv-add]');
  ok(!!addNv, 'the Named values block has its Add button');
  if (addNv) {
    await page.click('[data-tpl-nv-add]', { timeout: 5000 }); await page.waitForTimeout(400);
    ok(await page.evaluate((id) => { const c = window.civilcraft.project.state.alignments.find((x) => x.id === id).corridor; return c.named?.length === 1 && c.named[0].rows.length === 1; }, aid), 'Add starts a table with one row');
    await page.evaluate(() => window.civilcraft.project.undo());
    ok(await page.evaluate((id) => !window.civilcraft.project.state.alignments.find((x) => x.id === id).corridor.named, aid), 'one undo removes it');
  }
  // rule sets
  await page.evaluate(() => window.civilcraft.select(null)); await page.evaluate(() => window.civilcraft.command?.('network'));
  await page.evaluate(() => window.civilcraft.project.change('rs', (s) => { s.network.rulesets = [{ id: 'rs1', name: 'Office', rainfall: [{ ret: 10, tMin: 0, tMax: 120, form: 'idf', a: 1700, b: 12, c: 0.8, src: 'Office note' }], materials: [{ key: 'pvc', name: 'PVC', n: 0.011, entered: true }], limits: { minSlope: 0.004, src: 'Office note' } }]; }));
  await page.evaluate(() => window.civilcraft.select({ kind: 'project' })).catch(() => {});
  await page.waitForTimeout(400);
  const hasBlock = await page.evaluate(() => !!document.querySelector('[data-rs-head]'));
  if (hasBlock) {
    await page.evaluate(() => { document.querySelector('[data-dr-head]')?.click(); }); await page.waitForTimeout(200);
    await page.evaluate(() => { const h = document.querySelector('[data-rs-head]'); if (!h.nextElementSibling || h.nextElementSibling.offsetParent === null) h.click(); }); await page.waitForTimeout(300);
    await page.selectOption('[data-rs-pick]', 'rs1'); await page.click('[data-rs-apply]'); await page.waitForTimeout(400);
    ok(await page.evaluate(() => { const h = window.civilcraft.project.state.network.hydro; return h?.rsId === 'rs1' && h.ret === 10 && window.civilcraft.project.state.network.rules.minSlope === 0.004; }), 'Apply puts the rule set in force (hydrology and limits)');
    ok(/Office/.test(await page.evaluate(() => document.querySelector('[data-rs-force]')?.textContent || '')), 'the panel says which is in force');
    await page.click('[data-rs-edit]'); await page.waitForSelector('[data-rs-dialog][open]');
    ok(await page.evaluate(() => document.querySelectorAll('[data-rs-rain]').length === 1 && document.querySelectorAll('[data-rs-mat]').length === 1), 'the editor shows the rainfall row and the material');
    await page.evaluate(() => document.querySelector('[data-rs-dialog]').close());
    await page.click('[data-rs-detach]'); await page.waitForTimeout(300);
    ok(await page.evaluate(() => !window.civilcraft.project.state.network.hydro.rs), 'Detach takes it out again');
  } else ok(false, 'the Rule sets block is in the Drainage panel');
  ok(problems.length === 0, 'no page errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
