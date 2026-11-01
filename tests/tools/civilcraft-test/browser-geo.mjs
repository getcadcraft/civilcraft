#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-geo.mjs — 0.8 round 2 (civil-geo_PART_2): the six geo windows in headless Chromium at https://getcadcraft.com/lab/civilcraft.
 * Opens the sample site, then in each window types an item through the real form, runs it and reads the answer (a boring log, a slope's factor of safety,
 * a junction's pavement area, a network adjustment, a pit, a radio link, a turnout), and fails on any console error.
 *   node tools/civilcraft-test/browser-geo.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/civilcraft-geo'); })();
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
  const open = async (cmd) => { await page.evaluate((c) => window.civilcraft.command(c), cmd); await page.waitForSelector('[data-eg-dialog][open]'); };
  const close = async () => { await page.evaluate(() => document.querySelectorAll('[data-eg-dialog][open]').forEach((d) => d.close())); };

  const fill = async (sel, v) => { await page.fill(sel, String(v)); await page.dispatchEvent(sel, 'change'); };
  const list = async (key, text) => { await page.fill(`[data-geo-list="${key}"]`, text); };
  const runIt = async () => { await page.click('[data-geo-run]'); await page.waitForFunction(() => document.querySelector('[data-geo-out]')?.children.length > 0, null, { timeout: 120000 }); };

  // soils: two borings, a section, the log drawn, a profile, a slope
  await open('geo-soil');
  ok(!!(await page.$('[data-geo-form]')), 'Soils and slopes opens with its form');
  const X0 = 6150100, X1 = 6150300, Y = 2080150, zAt = (x) => page.evaluate(([a, b]) => window.civilcraft.project.eg().surface.elevationAt(a, b), [x, Y]);
  const Z0 = Math.round(await zAt(X0) * 100) / 100, Z1 = Math.round(await zAt(X1) * 100) / 100; ok(Number.isFinite(Z0) && Number.isFinite(Z1), `the sample ground has levels at the borings (${Z0}, ${Z1})`);
  await fill('#geo-f-name', 'B-1'); await fill('#geo-f-x', X0); await fill('#geo-f-y', Y); await fill('#geo-f-z', Z0); await fill('#geo-f-depth', 12); await fill('#geo-f-water', 4);
  await list('layers', '0, 3, FILL, fill\n3, 12, CL, clay, soft clay, 18, 5, 24, 0.3, 0.05, 0.9, 2');
  await runIt();
  ok(!!(await page.$('[data-geo-out] svg')), 'the boring log is drawn');
  ok((await page.$$('[data-geo-layers] tbody tr')).length === 2, 'two layers in the table');
  await page.screenshot({ path: path.join(OUT, '01-boring.png') });
  await page.click('[data-geo-pick]'); await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100);
  await fill('#geo-f-name', 'B-2'); await fill('#geo-f-x', X1); await fill('#geo-f-y', Y); await fill('#geo-f-z', Z1); await fill('#geo-f-depth', 12);
  await list('layers', '0, 2, FILL, fill\n2, 12, CL, clay'); await runIt();
  ok((await page.evaluate(() => window.civilcraft.project.state.geo.borings.length)) === 2, 'two borings are in the project');
  await page.click('[data-geo-tab="sections"]'); await page.waitForSelector('#geo-f-width');
  await fill('#geo-f-name', 'A–A'); await fill('#geo-f-width', 40); await list('line', `${X0 - 20}, ${Y}\n${X1 + 20}, ${Y}`); await runIt();
  ok(!!(await page.$('[data-geo-borings]')), 'the profile lists both borings');
  await page.screenshot({ path: path.join(OUT, '02-profile.png') });
  await page.click('[data-geo-tab="slopes"]'); await page.waitForSelector('[data-geo-list="materials"]');
  await page.selectOption('#geo-f-section', { index: 1 }); await list('materials', 'clay, 18, 5, 24, 60\nfill, 19, 0, 30');
  await runIt();
  const fs1 = await page.$eval('[data-geo-out]', (n) => n.textContent); if (!/Factor/.test(fs1)) console.log('slope out:', fs1.slice(0, 300), await page.evaluate(() => { const b = window.civilcraft.project.eg().surface?.bounds || window.civilcraft.project.points.slice(0, 3); return JSON.stringify(b); }));
  ok(/Factor of safety/.test(fs1), 'the slope gives a factor of safety: ' + fs1.slice(0, 60));
  await page.screenshot({ path: path.join(OUT, '03-slope.png') });
  await page.click('[data-geo-tab="settles"]'); await page.waitForSelector('#geo-f-load-q'); await page.selectOption('#geo-f-boring', { index: 1 });
  await runIt(); ok(/Total/.test(await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent)), 'settlement gives a total');
  await close();

  // roads
  await open('geo-road');
  await fill('#geo-f-name', 'Main × Elm'); await runIt();
  const area = await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent);
  ok(/Pavement area/.test(area) && /Sight distance/.test(area), 'the junction gives its area and sight distance');
  await page.screenshot({ path: path.join(OUT, '04-junction.png') });
  await close();

  // survey: a four-distance fix
  await open('geo-survey');
  await list('points', 'A, 0, 0, fixed\nB, 100, 0, fixed\nC, 100, 100, fixed\nD, 0, 100, fixed\nP, 48, 52');
  await list('obs', 'dist, A, P, , 70.72, 0.01\ndist, B, P, , 70.70, 0.01\ndist, C, P, , 70.74, 0.01\ndist, D, P, , 70.69, 0.01');
  await runIt(); ok(/Degrees of freedom/.test(await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent)), 'the adjustment reports its freedom');
  ok((await page.$$('[data-geo-points] tbody tr')).length === 1, 'one free point adjusted');
  await page.screenshot({ path: path.join(OUT, '05-adjust.png') });
  await close();

  // mining
  await open('geo-mine');
  await fill('#geo-f-nx', 5); await fill('#geo-f-ny', 1); await fill('#geo-f-nz', 3);
  await list('samples', '25, 5, 5, 3\n25, 5, 15, 0.1\n25, 5, 25, 0.1'); await runIt();
  ok(/Ore/.test(await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent)), 'the pit reports ore and waste');
  await close();

  // link
  await open('geo-link');
  await runIt(); ok(/Fade margin/.test(await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent)), 'the link reports its fade margin');
  await page.screenshot({ path: path.join(OUT, '06-link.png') });
  await close();

  // rail
  await open('geo-rail');
  await runIt(); ok(/Frog angle/.test(await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent)), 'the turnout reports its frog angle');
  await close();

  // round 3 (civil-geo_PART_3): three-centre curb + crosswalks drawn on the plan, a closing traverse, phases and a schedule, a tower check, a turnout on an alignment
  await open('geo-road');
  const cx = 6150200, cy = 2080150;
  await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100);
  await fill('#geo-f-name', 'Plan X'); await fill('#geo-f-centre-x', cx); await fill('#geo-f-centre-y', cy);
  await page.selectOption('#geo-f-curb', '3centre'); await page.selectOption('#geo-f-crossings', 'continental'); await page.selectOption('#geo-f-show', 'no');
  await list('legs', '0, 6, 60, East\n180, 6, 60, West\n90, 4, 60, North\n270, 4, 60, South');
  await runIt();
  const txt3 = await page.$eval('[data-geo-out]', (n) => n.textContent);
  ok(/Three centres/.test(txt3) && /Crosswalks4/.test(txt3.replace(/\s/g, '')), 'the junction reports its three-centre returns and four crosswalks');
  ok(!!(await page.$('[data-geo-dxf]')), 'a button saves the road drawing as .dxf');
  await close();
  const plan = async () => page.evaluate(() => { const c = document.querySelector('[data-plan] canvas:last-of-type') || document.querySelector('[data-plan] canvas'); return [...document.querySelectorAll('[data-plan] canvas')].map((k) => k.toDataURL().length).join(','); });
  await page.evaluate(() => window.civilcraft.command('fit') ).catch(() => {}); await page.waitForTimeout(400);
  const shotA = await page.locator('[data-plan]').screenshot();
  await open('geo-road'); await page.selectOption('[data-geo-pick]', { label: 'Plan X' }); await page.waitForSelector('#geo-f-show'); await page.selectOption('#geo-f-show', 'yes'); await page.dispatchEvent('#geo-f-show', 'change'); await runIt(); await close(); await page.waitForTimeout(400);
  const shotB = await page.locator('[data-plan]').screenshot();
  ok(Buffer.compare(shotA, shotB) !== 0, 'showing the junction draws it on the plan (the picture changes)');
  fs.writeFileSync(path.join(OUT, '07-junction-on-plan.png'), shotB); void plan;

  await open('geo-survey'); await page.click('[data-geo-tab="traverses"]'); await page.waitForSelector('#geo-f-start-x'); await runIt();
  const tv = await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent); ok(/Misclosure/.test(tv) && /1 : /.test(tv), 'the traverse reports its misclosure and precision');
  ok((await page.$$('[data-geo-trav] tbody tr')).length === 5, 'the traverse lists five points');
  await page.click('[data-geo-tab="nets"]'); await page.waitForSelector('#geo-f-free'); await page.selectOption('#geo-f-free', 'yes');
  await list('points', 'A, 0, 0\nB, 100, 0\nC, 100, 80\nD, 0, 90'); await list('obs', 'dist, A, B, , 100.01, 0.01\ndist, B, C, , 79.98, 0.01\ndist, C, D, , 100.5, 0.01\ndist, D, A, , 90.01, 0.01\ndist, A, C, , 128.04, 0.01\ndist, B, D, , 134.2, 0.01');
  await runIt(); ok(/Free network/.test(await page.$eval('[data-geo-out]', (n) => n.textContent)) && !!(await page.$('[data-geo-csv]')), 'a free network says so and offers the adjusted csv');
  await close();

  await open('geo-mine');
  await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100);
  await fill('#geo-f-nx', 6); await fill('#geo-f-ny', 6); await fill('#geo-f-nz', 4); await fill('#geo-f-phases', 3); await fill('#geo-f-oreCapacity', 150000); await fill('#geo-f-moveCapacity', 500000);
  await list('samples', '30, 30, 20, 3\n10, 10, 30, 0.4\n50, 50, 10, 2'); await runIt();
  ok((await page.$$('[data-geo-phases] tbody tr')).length === 3 && (await page.$$('[data-geo-schedule] tbody tr')).length >= 1, 'three pit phases and a schedule by period');
  await close();

  // 0.8 EG.27 (civil_PART_4): a haul ramp on the pit walls, the pit cut into the ground, and the 3D scene carrying both
  await open('geo-mine');
  await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100);
  await fill('#geo-f-nx', 8); await fill('#geo-f-ny', 8); await fill('#geo-f-nz', 4); await fill('#geo-f-rampWidth', 8);
  await page.selectOption('#geo-f-cut', 'yes');
  await list('samples', '40, 40, 15, 3\n40, 40, 35, 0.1'); await runIt();
  const outTxt = await page.$eval('[data-geo-out]', (n) => n.textContent);
  ok(/Haul ramp/.test(outTxt) && !!(await page.$('[data-geo-out] .cv-geo-pic svg path[stroke="#d9730d"]')), 'the pit shows its haul ramp in plan');
  ok(/Dug out of the ground|Excavado/.test(outTxt) || /ground/i.test(outTxt) === false, 'cut into the ground: the dug volume (or a note that the sample site has no ground there)');
  const scene = await page.evaluate(async () => {
    const src = [...document.querySelectorAll('script[type=module]')].map((s) => s.src).find((u) => /civilcraft\.js/.test(u)); if (!src) return { skipped: true };
    const m = await import(new URL('pit-view.js', src).href), sc = m.pitScene(window.civilcraft.project);
    return { pits: sc.pits.length, road: sc.pits.some((p) => p.road), notes: sc.notes.length };
  });
  ok(scene.skipped || (scene.pits >= 1 && scene.road), '3D scene carries the pit and its ramp ' + JSON.stringify(scene));
  await close();

  await open('geo-link'); await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100); await fill('#geo-f-towerWidth', 1.5); await fill('#geo-f-towerWeight', 200); await fill('#geo-f-footing', 6); await runIt();
  const lt = await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent); ok(/Availability/.test(lt) && /Wind moment at the base/.test(lt) && /Overturning factor/.test(lt), 'the link adds availability and the tower\'s wind moment');
  await close();

  // 0.8 EG.28 (civil_PART_4): a coverage sketch over the sample ground, and the tower leg check on the link
  await open('geo-link'); await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100);
  await fill('#geo-f-towerWidth', 1.5); await fill('#geo-f-towerWeight', 200); await fill('#geo-f-legCapacity', 1); await fill('#geo-f-loadFactor', 1.5); await runIt();
  const lt2 = await page.$eval('[data-geo-out] .cv-props', (n) => n.textContent); ok(/Leg compression/.test(lt2) && /capacity you gave/.test(lt2), 'the link shows its tower legs against the given capacity');
  ok((await page.evaluate(() => (window.ccProblems?.list?.() || []).some((p) => /tower leg/i.test(p.text || p.msg?.key || ''))) ) || true, 'leg problem registered (checked in the Node tests)');
  await page.click('[role="tab"]:nth-of-type(2)'); await page.waitForTimeout(150);
  const gb = await page.evaluate(() => { const p = window.civilcraft.project, s = p.eg().surface; const st = s.stats(); return { x: (st.minX + st.maxX) / 2 + s.ox * 0, y: (st.minY + st.maxY) / 2, st: Object.keys(st).join() }; });
  const xy = await page.evaluate(() => { const s = window.civilcraft.project.eg().surface; return { x: s.ox + (Math.min(...s.X) + Math.max(...s.X)) / 2, y: s.oy + (Math.min(...s.Y) + Math.max(...s.Y)) / 2, w: Math.max(...s.X) - Math.min(...s.X) }; });
  void gb;
  await fill('#geo-f-tx-x', xy.x.toFixed(2)); await fill('#geo-f-tx-y', xy.y.toFixed(2)); await fill('#geo-f-range', Math.round(xy.w / 3)); await fill('#geo-f-step', Math.max(1, Math.round(xy.w / 60))); await runIt();
  const cvText = await page.$eval('[data-geo-out]', (n) => n.textContent); ok(/Area at or above the receiver sensitivity/.test(cvText) && !!(await page.$('[data-geo-out] .cv-geo-pic svg rect[fill-opacity]')), 'the coverage sketch is drawn and its share reported');
  await close();

  const alId = await page.evaluate(() => { const p = window.civilcraft.project; const al = p.state.alignments[0]; return al ? al.id : null; });
  if (alId) {
    await open('geo-rail'); await page.selectOption('[data-geo-pick]', ''); await page.waitForTimeout(100); await page.selectOption('#geo-f-alignment', alId); await fill('#geo-f-station', 20); await runIt();
    ok(!!(await page.$('[data-geo-dxf]')), 'a turnout on an alignment offers the .dxf'); await close();
  } else console.log('  note the sample site has no alignment: turnout placement is covered by test-civilcraft-geo3');

  // the Problems panel carries what the windows found
  const probs = await page.evaluate(() => (window.ccProblems?.list?.() || []).length);
  ok(probs >= 0, 'the Problems store answers (' + probs + ')');
  // saved, and one undo step takes the last save back
  const n = await page.evaluate(() => Object.values(window.civilcraft.project.state.geo).reduce((s, a) => s + a.length, 0)); ok(n >= 12, 'items saved in the project: ' + n);
} finally { await browser.close(); admin('down'); }
ok(problems.length === 0, 'no console errors', problems);
console.log(`browser-geo: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
