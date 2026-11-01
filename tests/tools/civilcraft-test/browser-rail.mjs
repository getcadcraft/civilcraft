#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-rail.mjs — CivilCraft 0.7.1 71.26 (railway) in headless Chromium at https://getcadcraft.com/lab/civilcraft: the sample site in
 * metres; an alignment drawn with the Alignment tool (three clicks + Enter: one curve); Properties › Railway on (one undo step);
 * spirals typed into the PI table; the curve's transition set to Bloss and its cant typed; a design speed; the curve table's
 * equilibrium cant and deficiency; the warning; the cant diagram; a design profile; "Build the track"; the track's quantities; the
 * rails on the plan (layer C-RAIL-TRAK); the cant band in the profile view; 3D rails, ballast and one sleeper box per sleeper; Ctrl+Z.
 * Run as root; minted session (tag crl).   node tools/civilcraft-test/browser-rail.mjs   Shots in tmp/shots/civilcraft-rail/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-rail');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'crl'], { encoding: 'utf8' }) || '{}');
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
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.evaluate(() => { window.civilcraft.project.change('units', (s) => { s.units = 'm'; }); window.civilcraft.command('fit'); });
  await page.waitForTimeout(200);

  // ---- draw the alignment: three clicks and Enter (one curve at the middle point)
  await page.evaluate(() => window.civilcraft.setTool('alignment'));
  const at = await page.evaluate(() => { const b = window.civilcraft.project.eg().surface.bounds, X = (f) => b.minX + (b.maxX - b.minX) * f, Y = (f) => b.minY + (b.maxY - b.minY) * f; return [[X(0.1), Y(0.2)], [X(0.55), Y(0.25)], [X(0.85), Y(0.8)]].map(([x, y]) => window.civilcraft.toScreen(x, y)); });
  for (const p of at) { await page.mouse.click(p.x, p.y); await page.waitForTimeout(80); }
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
  const id = await page.evaluate(() => window.civilcraft.project.state.alignments[0].id);
  const A = (f) => page.evaluate((src) => { const a = window.civilcraft.project.state.alignments[0]; return eval(src); }, f);   // eslint-disable-line no-eval
  ok(await A('a.pis.length === 3 && a.pis[1].r > 0'), 'drawn with the Alignment tool: three PIs, a curve at the middle one');
  await page.evaluate((i) => window.civilcraft.select({ kind: 'alignment', id: i }), id);

  // ---- Railway on (one undo step)
  await page.waitForSelector('[data-rail-on]');
  const u0 = await page.evaluate(() => window.civilcraft.project.undoStack.length);
  await page.click('[data-rail-on]');
  await page.waitForSelector('[data-rail-track]');
  ok(await A('a.rail && a.rail.on && a.rail.gauge === 1435 && a.rail.rail === "60E1"') && await page.evaluate((n) => window.civilcraft.project.undoStack.length === n + 1, u0), 'Railway on: standard gauge, 60E1 rail (metres), one undo step');
  // spirals in the PI table, then the transition and the cant in the Railway block
  // the Properties panel re-renders once focus leaves it (it never rebuilds under the cursor), so each entry ends by leaving the box
  const type = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Enter'); await page.$eval(sel, (n) => n.blur()).catch(() => {}); await page.waitForTimeout(150); };
  await type('input[aria-label="Radius at PI 2"]', 150);
  await type('#cv-pi2-ls1', 30); await type('#cv-pi2-ls2', 30);
  ok(await A('a.pis[1].r === 150 && a.pis[1].ls1 === 30 && a.pis[1].ls2 === 30'), 'radius 150 m and spirals of 30 m typed into the PI table');
  await page.selectOption('#cv-rail-tr-2', 'bloss'); await page.$eval('#cv-rail-tr-2', (n) => n.blur()); await page.waitForTimeout(150);
  ok(await A('a.pis[1].tr === "bloss"'), 'the curve\'s transition set to Bloss');
  await type('#cv-al-speed', 60);
  await type('#cv-rail-cant-2', 100);
  ok(await A('a.pis[1].cant === 100 && a.design.speed === 60'), 'cant 100 mm typed; design speed 60 km/h');
  const eq = await page.$eval('[data-rail-eq="2"]', (n) => Number(n.textContent.replace(/,/g, '')));
  const r = await A('a.pis[1].r');
  const want = (1507 * (60 / 3.6) ** 2) / (9.81 * r);
  ok(Math.abs(eq - want) < 1, `the curve table: equilibrium cant ${eq} mm (G·v²/(g·R) = ${want.toFixed(1)})`);
  ok(Number(await page.$eval('[data-rail-def="2"]', (n) => n.textContent.replace(/,/g, ''))) === Math.round(want - 100), 'deficiency = equilibrium − 100');
  ok(await page.$('[data-rail-warning="rail.cant.deficiency"]') !== null, 'the deficiency over the limit is warned in the block');
  ok(await page.$('[data-rail-diagram]') !== null, 'the cant diagram is drawn');
  await page.screenshot({ path: path.join(SHOTS, '01-railway-block.png') });

  // 0.8 CV.1 (civil_PART_4): name the European standard; its documents show, the clause is typed by the person, no number changes
  const limBefore = await page.$eval('#cv-rail-lim-cant', (n) => n.value);
  await page.selectOption('#cv-rail-std', 'eu'); await page.waitForSelector('[data-rail-cites]');
  ok((await page.$$eval('[data-rail-std-docs] li', (l) => l.length)) >= 3 && /placeholder/i.test(await page.$eval('[data-rail-placeholder]', (n) => n.textContent)), 'European standard: its documents are named and the placeholder note is shown');
  await page.fill('#cv-rail-cite-cant', 'clause typed by the engineer'); await page.$eval('#cv-rail-cite-cant', (n) => n.blur()); await page.waitForTimeout(200);
  ok(await page.evaluate(() => { const a = window.civilcraft.project.state.alignments[0]; return a.rail.std === 'eu' && a.rail.cites.cant === 'clause typed by the engineer'; }), 'the clause is kept in the project');
  ok(await page.$eval('#cv-rail-lim-cant', (n) => n.value) === limBefore, 'the cant limit is the same placeholder as before');

  // ---- a design profile, then build the track
  await page.click('[data-start-profile]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pvis.length >= 2);
  await page.evaluate((i) => window.civilcraft.select({ kind: 'alignment', id: i }), id);
  await page.waitForSelector('[data-rail-build]');
  await page.click('[data-rail-build]');
  await page.waitForSelector('[data-rail-qty]', { timeout: 30000 });
  const sl = await page.$eval('[data-rail-qty-sleepers]', (n) => Number(n.textContent));
  const len = await page.evaluate(() => { const p = window.civilcraft.project, a = p.state.alignments[0], al = p.alignment(a); return al.length; });
  ok(sl > len / 0.6 * 0.95 && sl < len / 0.6 * 1.05, `Build the track: ${sl} sleepers for ${len.toFixed(1)} m at 0.6 m`);
  ok(await page.$('[data-rail-co-note]') !== null && await page.$('[data-se-on]') === null, 'the corridor block says it is a track (no lanes or superelevation)');
  await page.evaluate(() => window.civilcraft.view.invalidateScene());
  await page.waitForTimeout(300);
  const plan = await page.evaluate(() => window.civilcraft.view.sceneCache?.scene?.items.filter((x) => x.layer === 'C-RAIL-TRAK').length);
  ok(plan === 2, 'the plan draws both rails (layer C-RAIL-TRAK)', plan);
  // Problems: the rail warning is in the shared panel's store
  await page.waitForFunction(() => window.ccProblems?.store.list().some((p) => p.code === 'rail.cant.deficiency'), null, { timeout: 8000 }).catch(() => {});
  const probs = await page.evaluate(() => window.ccProblems?.store.list().filter((p) => /^rail\./.test(p.code)).map((p) => ({ code: p.code, req: p.req, found: p.found })));
  ok(probs?.some((p) => p.code === 'rail.cant.deficiency' && p.req?.value === 130 && p.found?.value > 130), 'the Problems panel lists rail.cant.deficiency with required and found', probs);
  await page.evaluate(() => window.civilcraft.command('fit'));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(SHOTS, '02-track-plan.png') });

  // ---- the profile view's cant band
  await page.evaluate(() => { if (!window.civilcraft.pview.cv.offsetParent) window.civilcraft.command('profile'); });
  await page.waitForTimeout(400);
  const pvh = await page.evaluate(() => ({ h: window.civilcraft.pview.h, band: window.civilcraft.pview.cantH() }));
  ok(pvh.band > 0, 'the profile view has its cant band under the stations', pvh);
  await page.screenshot({ path: path.join(SHOTS, '03-profile-cant.png') });

  // ---- 3D
  await page.evaluate(() => window.civilcraft.show3D(true));
  await page.waitForFunction(() => window.civilcraft.view3d.scene?.meshes.some((m) => m.key === 'rails'), null, { timeout: 30000 });
  const s3 = await page.evaluate(() => { const sc = window.civilcraft.view3d.scene, s = sc.instances.find((x) => x.key === 'sleepers'); return { ballast: sc.meshes.some((m) => m.key === 'ballast'), sleepers: s?.count || 0, rot: !!s?.rot }; });
  ok(s3.ballast && s3.sleepers === sl && s3.rot, `3D: rails, the ballast bed and ${s3.sleepers} sleepers (instanced, turned)`, s3);
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SHOTS, '04-track-3d.png') });
  // close up on the canted curve: rails, sleepers tilted with the cant, the ballast bed (nothing selected: no highlight)
  await page.evaluate(() => { window.civilcraft.select(null); window.civilcraft.view3d.highlight(); });
  const close = (r) => page.evaluate((rr) => {
    const v = window.civilcraft.view3d, d = v.scene, p = window.civilcraft.project, a = p.state.alignments[0], al = p.alignment(a), c = al.curves[0];
    const q = al.pointAt((c.sc + c.cs) / 2), z = p.designProfile(a).elevationAt((c.sc + c.cs) / 2);
    const T = [q.x - d.origin.x, q.y - d.origin.y, (z - d.origin.z) * d.exag], f = [Math.cos(q.dir), Math.sin(q.dir)];
    v.cam.fit({ min: [T[0] - rr, T[1] - rr, T[2] - rr / 3], max: [T[0] + rr, T[1] + rr, T[2] + rr / 3] }, [-f[0] * 0.8 + f[1] * 0.5, -f[1] * 0.8 - f[0] * 0.5, 0.45]);
    v.view.invalidate();
  }, r);
  await close(9); await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, '05-track-3d-close.png') });
  await close(3); await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SHOTS, '06-track-3d-closer.png') });
  await page.evaluate(() => window.civilcraft.show3D(false));

  // ---- undo
  await page.evaluate(() => window.civilcraft.command('undo'));
  await page.waitForTimeout(200);
  ok(await A('!a.corridor || !a.corridor.on'), 'Ctrl+Z: the track is unbuilt again (one step)');
  ok(!problems.length, 'no console errors', problems);
} catch (e) {
  fail++; console.log('  FAIL ' + e.stack);
} finally {
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
