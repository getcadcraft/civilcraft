#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-railline.mjs — CivilCraft CV.1 (2026-11-12) in headless Chromium at https://getcadcraft.com/lab/civilcraft: on a railway alignment
 * in the real page, the track geometry limits and table, a turnout added with the button and edited in the table (station, frog number, side,
 * crossover spacing), its rails on the plan (C-RAIL-TURN), "Make its track", the clearance envelope switched on (outline, platform, the
 * section drawing, the result list), a feature line inside it found (in the block and in the Problems panel), the envelope's edges on the
 * plan (C-RAIL-CLRN), the LandXML file with its <Cant>, the turnout's rails in 3D, undo. Run as root; minted session (tag crn).
 *   node tools/civilcraft-test/browser-railline.mjs      Shots in tmp/shots/civilcraft-railline/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-railline');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'crn'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });   // 2026-11-12: the shell folds Properties to one open section (2026-11-09); this test reads several at once
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(200);

  // ---- a railway line: a long straight, one curve, a design profile with a steep first grade (set through the project, as a file would)
  const type = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Enter'); await page.$eval(sel, (n) => n.blur()).catch(() => {}); await page.waitForTimeout(200); };
  const id = await page.evaluate(() => {
    const p = window.civilcraft.project, b = p.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f, z = p.eg().surface.elevationAt(X(0.5), Y(0.5)) || 100;
    const aid = p.nextId('a');
    p.change('railway', (s) => { s.alignments.push({ id: aid, name: 'Down main', start: 0, pis: [{ x: X(0.05), y: Y(0.3), r: 0 }, { x: X(0.7), y: Y(0.3), r: 60, ls1: 15, ls2: 15, cant: 60 }, { x: X(0.9), y: Y(0.9), r: 0 }], pvis: [], sampling: null, design: { speed: 40, unit: 'km/h' } }); });
    const a = p.state.alignments[0], al = p.alignment(a);
    p.change('profile', (s) => { s.alignments[0].pvis = [{ sta: 0, z: z + 1, L: 0 }, { sta: al.length * 0.3, z: z + 1 + al.length * 0.3 * 0.02, L: 20 }, { sta: al.length, z: z + 1 + al.length * 0.3 * 0.02, L: 0 }]; });
    window.civilcraft.select({ kind: 'alignment', id: aid }); window.civilcraft.command('fit');
    return aid;
  });
  const A = (f) => page.evaluate((src) => { const p = window.civilcraft.project, a = p.state.alignments[0]; return eval(src); }, f);   // eslint-disable-line no-eval
  await page.waitForSelector('[data-rail-on]');
  await page.click('[data-rail-on]');
  await page.waitForSelector('[data-rail-track]');
  ok(await A('a.rail.on && a.rail.limits.grade === 12.5 && a.rail.limits.elementTime === 1.8'), 'Railway on: the track geometry limits come with it');

  // ---- limits and the geometry table
  ok(await page.$('#cv-rail-lim-grade') !== null && await page.$('#cv-rail-lim-vr') !== null && await page.$('#cv-rail-lim-el') !== null && await page.$('#cv-rail-lim-dr') !== null, 'the six new limit boxes are in the block');
  ok(await page.$('[data-rail-warning="rail.vert.grade"]') !== null, 'the 20 mm/m grade is warned in the block (limit 12.5)');
  const steep = await page.$eval('[data-rail-steepest]', (n) => n.textContent);
  ok(/^20(\.0+)? mm\/m$/.test(steep), 'Track geometry: steepest gradient ' + steep);
  ok((await page.$$eval('[data-rail-vcurves] tr', (r) => r.length)) === 1, 'one vertical curve listed with its radius');
  await type('#cv-rail-lim-grade', 25);
  ok(await A('a.rail.limits.grade === 25') && await page.$('[data-rail-warning="rail.vert.grade"]') === null, 'limit raised to 25 mm/m: kept, and the warning is gone');

  // ---- a turnout
  const u0 = await page.evaluate(() => window.civilcraft.project.undoStack.length);
  await page.click('[data-rail-tu-add]');
  await page.waitForSelector('[data-rail-turnouts] [data-rail-tu]');
  ok(await A('p.state.geo.turnouts.length === 1 && p.state.geo.turnouts[0].alignment === a.id') && await page.evaluate((n) => window.civilcraft.project.undoStack.length === n + 1, u0), 'Add a turnout: one turnout on this alignment, one undo step');
  const t0 = await A('(() => { const q = p.railTurnouts(a)[0], al = p.alignment(a), e = al.elementAt(q.toeSta + 0.01); return { ok: q.ok, line: e.type, lead: q.lead, R: q.R, speed: q.speed }; })()');
  ok(t0.ok && t0.line === 'line', 'it is placed on the straight', t0);
  ok(Math.abs(Number(await page.$eval('[data-rail-tu-lead]', (n) => n.textContent.replace(/,/g, ''))) - t0.lead) < 0.01, `the table shows its lead (${t0.lead.toFixed(2)} m)`);
  await type('#cv-rail-tu-n-1', 12);
  const t1 = await A('p.railTurnouts(a)[0]');
  ok(t1.n === 12 && t1.lead > t0.lead && t1.R > t0.R, 'frog number 12 typed: a longer lead and a larger radius');
  await page.selectOption('#cv-rail-tu-side-1', 'R'); await page.$eval('#cv-rail-tu-side-1', (n) => n.blur()); await page.waitForTimeout(200);
  ok(await A('p.state.geo.turnouts[0].side === "R"'), 'side set to right');
  await type('#cv-rail-tu-sta-1', 12);
  ok(await A('p.state.geo.turnouts[0].station === 12'), 'station typed');
  await page.evaluate(() => window.civilcraft.view.invalidateScene()); await page.waitForTimeout(300);
  const tuItems = await page.evaluate(() => window.civilcraft.view.sceneCache?.scene?.items.filter((x) => x.layer === 'C-RAIL-TURN').map((x) => x.kind + (x.dashed ? '-dashed' : '')));
  ok(tuItems.filter((k) => k === 'poly').length === 4 && tuItems.includes('poly-dashed') && tuItems.includes('text'), 'the plan draws its two rails, centreline, two ticks and label (C-RAIL-TURN)', tuItems);
  await page.screenshot({ path: path.join(SHOTS, '01-turnout.png') });
  await page.$eval('[data-rail-turnouts]', (n) => n.scrollIntoView({ block: 'start' })); await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(SHOTS, '01b-turnout-block.png') });
  // a crossover
  await type('#cv-rail-tu-sp-1', 4.5);
  ok(await A('!!p.railTurnouts(a)[0].crossover && Math.abs(p.railTurnouts(a)[0].crossover.spacing - 4.5) < 1e-9'), 'crossover spacing 4.5 m typed: it is a crossover now');
  await type('#cv-rail-tu-sp-1', 0);
  // onto the curve: warned
  const mid = await A('(() => { const c = p.alignment(a).curves[0]; return Math.round((c.sc + c.cs) / 2); })()');
  await type('#cv-rail-tu-sta-1', mid);
  ok(await page.$('[data-rail-warning="rail.turnout.curve"]') !== null, 'moved onto the curve: rail.turnout.curve in the block');
  await type('#cv-rail-tu-sta-1', 12);
  ok(await page.$('[data-rail-warning="rail.turnout.curve"]') === null, 'back on the straight: gone');
  // its own track
  await page.click('[data-rail-tu-branch]'); await page.waitForTimeout(300);
  ok(await A('p.state.alignments.length === 2 && p.state.alignments[1].rail.on && p.alignment(p.state.alignments[1]).ok && p.alignment(p.state.alignments[1]).curves.length === 1'), 'Make its track: a second railway alignment with the closure curve');
  ok(await A('Math.abs(p.alignment(p.state.alignments[1]).curves[0].r - p.railTurnouts(a)[0].R) < 1e-6'), 'its curve is the closure radius');
  await page.evaluate(() => window.civilcraft.command('undo')); await page.waitForTimeout(200);
  ok(await A('p.state.alignments.length === 1'), 'Ctrl+Z takes that alignment away again');
  await page.evaluate((i) => window.civilcraft.select({ kind: 'alignment', id: i }), id);

  // ---- the clearance envelope
  await page.waitForSelector('[data-rail-cl-on]');
  await page.click('[data-rail-cl-on]');
  await page.waitForSelector('[data-rail-cl-result]');
  ok(await A('a.rail.clearance.on && a.rail.clearance.outline === "box"'), 'envelope on, the plain placeholder outline');
  ok(await page.$('[data-rail-cl-svg] path') !== null, 'the section drawing is there');
  ok(/placeholder/i.test(await page.$eval('[data-rail-cl-placeholder]', (n) => n.textContent)), 'the block says the outlines are placeholders');
  const wide = await page.$eval('[data-rail-cl-wide]', (n) => n.textContent);
  // box 3.4 m; on the 60 m curve a 20 m vehicle on 14 m bogies throws 14²/480 in and (400 − 196)/480 out = 0.833 m more, plus the lean from 60 mm of cant
  ok(/ m at station/.test(wide) && parseFloat(wide) > 3.4 + 0.833 && parseFloat(wide) < 3.4 + 0.833 + 0.25, 'widest envelope = 3.4 + 0.833 of curve throw + the cant\'s lean: ' + wide);
  ok((await page.$eval('[data-rail-cl-hits]', (n) => n.textContent)) === 'None', 'nothing inside it yet');
  await page.selectOption('#cv-rail-cl-outline', 'shaped'); await page.$eval('#cv-rail-cl-outline', (n) => n.blur()); await page.waitForTimeout(200);
  ok(await A('a.rail.clearance.outline === "shaped"'), 'outline changed');
  await page.selectOption('#cv-rail-cl-outline', 'custom'); await page.$eval('#cv-rail-cl-outline', (n) => n.blur()); await page.waitForSelector('#cv-rail-cl-points');
  await page.fill('#cv-rail-cl-points', '-1.5 0.3\n1.5 0.3\n1.5 4\n-1.5 4'); await page.$eval('#cv-rail-cl-points', (n) => { n.dispatchEvent(new Event('change', { bubbles: true })); n.blur(); }); await page.waitForTimeout(250);
  ok(await A('a.rail.clearance.outline === "custom" && a.rail.clearance.points.length === 4 && a.rail.clearance.points[2].z === 4'), 'your own outline typed, four points');
  // a platform
  await page.selectOption('#cv-rail-cl-pf', 'L'); await page.$eval('#cv-rail-cl-pf', (n) => n.blur()); await page.waitForSelector('#cv-rail-cl-pf-off');
  await type('#cv-rail-cl-pf-off', 1.4);
  ok(await page.$('[data-rail-warning="rail.clear.platform"]') !== null && /Inside/.test(await page.$eval('[data-rail-cl-gap]', (n) => n.textContent)), 'a platform edge 1.4 m from the centre is inside the 1.5 m outline: warned');
  await type('#cv-rail-cl-pf-off', 2.5);   // the inside of the 60 m curve reaches about 1.5 + 0.41 + the lean
  ok(await page.$('[data-rail-warning="rail.clear.platform"]') === null && /Clear/.test(await page.$eval('[data-rail-cl-gap]', (n) => n.textContent)), 'at 2.5 m: clear');
  // a feature line 1 m beside the track, 1 m above the rail
  await page.evaluate(() => { const p = window.civilcraft.project, a = p.state.alignments[0], al = p.alignment(a), pr = p.designProfile(a), q0 = al.pointAt(20), q1 = al.pointAt(30), n = { x: -Math.sin(q0.dir), y: Math.cos(q0.dir) };
    p.change('wall', (s) => { s.features.push({ id: p.nextId('f'), name: 'Wall', pts: [{ x: q0.x + n.x, y: q0.y + n.y, z: pr.elevationAt(20) + 1 }, { x: q1.x + n.x, y: q1.y + n.y, z: pr.elevationAt(30) + 1 }], closed: false, use: 'off' }); }); });
  await page.evaluate((i) => window.civilcraft.select({ kind: 'alignment', id: i }), id); await page.waitForTimeout(300);
  ok(await page.$('[data-rail-warning="rail.clear.hit"]') !== null && (await page.$$eval('[data-rail-cl-hitlist] li', (l) => l.map((x) => x.textContent)))[0]?.startsWith('Wall'), 'a feature line 1 m off the centre at rail + 1 m: found inside the envelope');
  await page.waitForFunction(() => window.ccProblems?.store.list().some((p) => p.code === 'rail.clear.hit'), null, { timeout: 8000 }).catch(() => {});
  const probs = await page.evaluate(() => window.ccProblems?.store.list().filter((p) => /^rail\./.test(p.code)).map((p) => p.code));
  ok(probs?.includes('rail.clear.hit'), 'the Problems panel has rail.clear.hit', probs);
  await page.evaluate(() => window.civilcraft.view.invalidateScene()); await page.waitForTimeout(300);
  const cl = await page.evaluate(() => window.civilcraft.view.sceneCache?.scene?.items.filter((x) => x.layer === 'C-RAIL-CLRN').length);
  ok(cl === 4, 'the plan draws the envelope\'s two edges and a cross at the clash (C-RAIL-CLRN)', cl);
  await page.screenshot({ path: path.join(SHOTS, '02-envelope.png') });

  // ---- LandXML carries the cant
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.evaluate(() => window.civilcraft.command('landxml'))]);
  const xml = fs.readFileSync(await dl.path(), 'utf8');
  ok(/<Cant name="Down main" gauge="1\.435" rotationPoint="insideRail">/.test(xml) && (xml.match(/<CantStation /g) || []).length === 4 && /appliedCant="60"/.test(xml), 'the LandXML file has the <Cant> block: four stations, 60 mm');

  // ---- 3D: the turnout's rails
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d.scene?.lines.some((m) => m.key === 'turnouts'), null, { timeout: 30000 }).catch(() => {});
  const s3 = await page.evaluate(() => { const l = window.civilcraft.view3d.scene?.lines.find((m) => m.key === 'turnouts'); return l ? l.positions.length : 0; });
  ok(s3 > 0 && s3 % 6 === 0, '3D: the turnout\'s diverging rails are drawn', s3);
  await page.waitForTimeout(400); await page.screenshot({ path: path.join(SHOTS, '03-3d.png') });
  await page.evaluate(() => window.civilcraft.show3D(false));

  // ---- remove the turnout with its small x
  await page.evaluate((i) => window.civilcraft.select({ kind: 'alignment', id: i }), id);
  await page.waitForSelector('[data-rail-tu-remove]'); await page.click('[data-rail-tu-remove]'); await page.waitForTimeout(250);
  ok(await A('!p.state.geo || !p.state.geo.turnouts'), 'the row\'s x removes the turnout');
  await page.evaluate(() => window.civilcraft.command('undo')); await page.waitForTimeout(200);
  ok(await A('p.state.geo.turnouts.length === 1'), 'Ctrl+Z brings it back');
  ok(!problems.length, 'no console errors', problems);
} catch (e) {
  fail++; console.log('  FAIL ' + e.stack);
} finally {
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
