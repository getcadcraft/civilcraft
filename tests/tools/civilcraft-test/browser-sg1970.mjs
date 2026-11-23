#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sg1970.mjs — CivilCraft 0.10.1, suggestion #1970 (feature lines, pads, grading) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft: a person reaches every part from the page.
 *   Pad: a Z box per corner, corners added (row +, and by a click on a side) and removed, the row in use ringed on the plan, the pad made
 *   flat again; the drawing tools snap to a midpoint, a crossing, a perpendicular and the nearest place on a line; the Ramp tool snaps and
 *   its corners can be edited afterwards and survive a save; a feature line's row Pick, vertices added and removed; a feature line added to
 *   a pad shapes it; an open design line is a breakline of the proposed surface; the slope-to-surface and longitudinal-offset tools.
 * Run as root; minted session (tag sg1970).   node tools/civilcraft-test/browser-sg1970.mjs   Shots in tmp/shots/civilcraft-sg1970/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-sg1970');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'sg1970'], { encoding: 'utf8' }) || '{}');

// flat ground at 100 (survey points every 40, off the pad's corners), a pad (100,60)-(300,160) at 100, a feature line inside it
// (f1: (150,80) → (250,140), elevations 100.5 and 101), one crossing its top side (f3: (200,120) → (200,220)) and one outside (f2)
const points = [];
{ let n = 1; for (let x = -30; x <= 430; x += 40) for (let y = -30; y <= 330; y += 40) points.push([String(n++), x, y, 100, 'G']); }
const FILE = JSON.stringify({ format: 'civilcraft-project', version: 1, name: 'sg1970', units: 'ft', points, seq: 60, alignments: [], network: null,
  pads: [{ id: 'p40', name: 'Lot', pts: [{ x: 100, y: 60 }, { x: 300, y: 60 }, { x: 300, y: 160 }, { x: 100, y: 160 }], z: 100, cut: 2, fill: 2 }],
  features: [
    { id: 'f1', name: 'Swale', pts: [{ x: 150, y: 80, z: 100.5 }, { x: 250, y: 140, z: 101 }], closed: false, use: 'off' },
    { id: 'f2', name: 'Ditch', pts: [{ x: 330, y: 230, z: 99 }, { x: 410, y: 230, z: 99 }], closed: false, use: 'off' },
    { id: 'f3', name: 'Cross', pts: [{ x: 200, y: 120, z: 100 }, { x: 200, y: 220, z: 100 }], closed: false, use: 'off' }] });

admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); } catch { /* */ } });   // Properties shows every section
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  const load = async (file = FILE) => {
    await page.evaluate(async (f) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(f, 'sg1970.civilcraft.json'); }, file);
    await page.waitForFunction(() => window.civilcraft.project.state.pads.length >= 1 && window.civilcraft.project.points.length > 50);
    await page.waitForTimeout(400);
  };
  await load();
  const S = () => page.evaluate(() => JSON.parse(JSON.stringify(window.civilcraft.project.state)));
  const undoN = () => page.evaluate(() => window.civilcraft.project.undoStack.length);
  const undo = () => page.evaluate(() => window.civilcraft.project.undo()).then(() => page.waitForTimeout(150));
  const at = (x, y, dx = 0, dy = 0) => page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [x, y]).then((q) => ({ x: q.x + dx, y: q.y + dy }));
  const click = async (x, y, dx = 0, dy = 0) => { const q = await at(x, y, dx, dy); await page.mouse.move(q.x - 1, q.y - 1); await page.mouse.move(q.x, q.y); await page.waitForTimeout(60); await page.mouse.click(q.x, q.y); await page.waitForTimeout(100); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const nodeSel = (kind, id) => page.evaluate(([k, i]) => { document.activeElement?.blur?.(); window.civilcraft.select({ kind: k, id: i }); }, [kind, id]).then(() => page.waitForTimeout(200));
  const zAt = (x, y) => page.evaluate(([x, y]) => window.civilcraft.project.graded().surface?.elevationAt(x, y) ?? null, [x, y]);
  const type = async (loc, v) => { await loc.fill(String(v)); await loc.press('Enter'); await page.waitForTimeout(200); };
  let st;

  console.log('\nPad corners: Z, add, remove, highlight');
  await nodeSel('pad', 'p40');
  const zBoxes = page.locator('[data-cv-corners="pad"] input[data-cv-corner-z]');
  ok(await zBoxes.count() === 4, 'the pad Corners table has a Z box in every row', await zBoxes.count());
  ok(await page.locator('[data-cv-corners="pad"] thead th').nth(3).innerText().then((x) => /^Z/.test(x.trim())), 'the Z column comes after Northing and its Pick button');
  ok(near(Number(await zBoxes.nth(2).inputValue()), 100), 'a corner of a flat pad shows the pad elevation (100)');
  let u0 = await undoN();
  await type(zBoxes.nth(2), '102');
  st = await S();
  ok(st.pads[0].pts[2].z === 102 && st.pads[0].pts[0].z === undefined, 'typing 102 gives corner 3 its own elevation; the others follow the pad', st.pads[0].pts);
  ok(await undoN() === u0 + 1, 'one undo step');
  await page.evaluate(() => document.activeElement?.blur?.()); await page.waitForTimeout(200);   // Properties redraws when the box is left
  ok(/2→3 \+2\.00% · 3→4 −1\.00%/.test(await page.locator('[data-cv-corner-grades]').innerText()), 'the note lists the side grades (2→3 rises 2 in 100 = +2.00%, 3→4 falls 2 in 200 = −1.00%)', await page.locator('[data-cv-corner-grades]').innerText());
  ok(near(await zAt(290, 150), 101.6, 0.35), 'the graded pad rises toward corner 3 (about 101.6 near it)', await zAt(290, 150));
  await page.screenshot({ path: path.join(SHOTS, '01-pad-z.png') });
  // highlight: point at row 3
  const point = async (sel) => { const l = page.locator(sel); await l.evaluate((n) => n.scrollIntoView({ block: 'center' })); await page.waitForTimeout(250); const bb = await l.boundingBox(); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2 - 2); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await page.waitForTimeout(150); };   // the row is brought to the middle of the panel first, clear of the tour note at the bottom of the window
  await point('[data-cv-corners="pad"] tr[data-cv-corner-row="2"] td:first-child');
  let hot = await page.evaluate(() => window.civilcraft.hot);
  ok(hot && near(hot.x, 300) && near(hot.y, 160), 'pointing at row 3 rings corner 3 (300, 160) on the plan', hot);
  await page.screenshot({ path: path.join(SHOTS, '02-pad-row-ring.png') });
  await page.locator('input[aria-label="Corner 1 easting"]').focus(); await page.waitForTimeout(100);
  hot = await page.evaluate(() => window.civilcraft.hot);
  ok(hot && near(hot.x, 100) && near(hot.y, 60), 'putting the cursor in row 1 rings corner 1', hot);
  await page.evaluate(() => document.activeElement?.blur?.()); await page.mouse.move(5, 5); await page.waitForTimeout(100);
  // row +
  u0 = await undoN();
  await page.locator('[data-cv-corner-add="1"]').click(); await page.waitForTimeout(200);
  st = await S();
  ok(st.pads[0].pts.length === 5 && near(st.pads[0].pts[2].x, 300) && near(st.pads[0].pts[2].y, 110) && near(st.pads[0].pts[2].z, 101), 'the + in row 2 adds a corner halfway to corner 3 at (300, 110), elevation 101 (halfway from 100 to 102)', st.pads[0].pts[2]);
  ok(await undoN() === u0 + 1, 'one undo step');
  await page.locator('[data-cv-corner-del="2"]').click(); await page.waitForTimeout(200);
  st = await S();
  ok(st.pads[0].pts.length === 4 && st.pads[0].pts[2].z === 102, 'the x in that row takes it out again', st.pads[0].pts.length);
  // add by a click on a side
  await page.locator('[data-cv-corner-pick-add]').click(); await page.waitForTimeout(100);
  await click(160, 60, 0, 4);
  st = await S();
  ok(st.pads[0].pts.length === 5 && near(st.pads[0].pts[1].x, 160, 0.6) && near(st.pads[0].pts[1].y, 60, 1e-6), 'Add a corner + a click near the bottom side puts corner 2 on the side (y = 60 exactly)', st.pads[0].pts[1]);
  await undo();
  await page.locator('[data-cv-corner-level]').click(); await page.waitForTimeout(200);
  st = await S();
  ok(st.pads[0].pts.every((p) => p.z === undefined), 'Flat puts every corner back to the pad elevation');
  await undo();
  await type(page.locator('[data-cv-corners="pad"] input[data-cv-corner-z]').nth(2), '');
  st = await S();
  ok(st.pads[0].pts[2].z === undefined, 'emptying a Z box puts that corner back to the pad elevation', st.pads[0].pts[2]);

  console.log('\nSnaps: midpoint, crossing, perpendicular, nearest');
  await load();
  await page.evaluate(() => window.civilcraft.setTool('parcel'));
  let q = await at(200, 60, 3, -3); await page.mouse.move(q.x - 2, q.y); await page.mouse.move(q.x, q.y); await page.waitForTimeout(120);
  let snap = await page.evaluate(() => window.civilcraft.snap);
  ok(snap?.kind === 'mid' && near(snap.x, 200) && near(snap.y, 60), 'the pointer near the middle of the pad\'s bottom side shows Midpoint (200, 60)', snap);
  await page.screenshot({ path: path.join(SHOTS, '03-snap-mid.png') });
  await page.mouse.click(q.x, q.y); await page.waitForTimeout(80);
  await click(200, 160, 3, 3);       // where f3 crosses the top side
  await click(140, 160, 0, -4);      // the nearest place on the top side
  await page.keyboard.press('Enter'); await page.waitForTimeout(250);
  st = await S();
  const pc = st.parcels?.[0];
  ok(pc && near(pc.pts[0].x, 200, 1e-6) && near(pc.pts[0].y, 60, 1e-6), 'corner 1 landed on the midpoint exactly', pc?.pts[0]);
  ok(pc && near(pc.pts[1].x, 200, 1e-6) && near(pc.pts[1].y, 160, 1e-6), 'corner 2 landed where the feature line crosses the pad side (200, 160)', pc?.pts[1]);
  ok(pc && near(pc.pts[2].y, 160, 1e-6) && near(pc.pts[2].x, 140, 1), 'corner 3 landed on the side itself (nearest; y = 160 exactly)', pc?.pts[2]);
  // perpendicular: the Pad tool, first corner free at (150, 250), the pointer near (150, 160) on the top side
  await load();
  await page.evaluate(() => window.civilcraft.setTool('pad'));
  await page.keyboard.down('Alt'); await click(150, 250); await page.keyboard.up('Alt');
  q = await at(150, 160, 4, 3); await page.mouse.move(q.x - 2, q.y); await page.mouse.move(q.x, q.y); await page.waitForTimeout(120);
  snap = await page.evaluate(() => window.civilcraft.snap);
  ok(snap?.kind === 'perp' && near(snap.x, 150, 0.01) && near(snap.y, 160, 1e-6), 'with a first corner at (150, 250) the pointer near the pad side shows Perpendicular at (150, 160)', snap);
  await page.keyboard.press('Escape'); await page.waitForTimeout(80);
  await page.evaluate(() => window.civilcraft.setTool('select'));

  console.log('\nSloped pad or ramp: snaps, editable afterwards, saved');
  await load();
  await page.evaluate(() => window.civilcraft.command('ramp')); await page.waitForTimeout(150);
  await click(100, 160, 3, 3);     // the pad's corner 4
  await click(200, 220, 3, -2);    // the end of feature line f3
  await page.keyboard.press('Enter'); await page.waitForTimeout(300);
  ok(await page.locator('dialog[data-pf-ramp]').count() === 1, 'two clicks and Enter open the ramp box');
  await page.locator('[data-pf-make]').click(); await page.waitForTimeout(400);
  st = await S();
  const ramp = st.pads[1];
  // centre line (100,160) → (200,220), width 10: the corners sit 5 either side, so the middle of corners 1 and 4 is the start
  ok(ramp && near((ramp.pts[0].x + ramp.pts[3].x) / 2, 100, 1e-6) && near((ramp.pts[0].y + ramp.pts[3].y) / 2, 160, 1e-6) && near((ramp.pts[1].x + ramp.pts[2].x) / 2, 200, 1e-6), 'the ramp starts on the pad corner and ends on the feature line end (both snapped)', ramp?.pts);
  await nodeSel('pad', ramp.id);
  const rz = page.locator('[data-cv-corners="pad"] input[data-cv-corner-z]');
  ok(await rz.count() === 4 && near(Number(await rz.nth(1).inputValue()), ramp.pts[1].z, 0.006), 'the ramp\'s corners show their elevations in the Z column', await rz.nth(1).inputValue());
  await type(rz.nth(1), '111.5');
  st = await S();
  ok(st.pads[1].pts[1].z === 111.5, 'a ramp corner\'s elevation can be edited after it is placed', st.pads[1].pts[1]);
  const saved = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON()));
  await load(saved);
  st = await S();
  ok(st.pads[1]?.pts[1].z === 111.5 && near(st.pads[1].pts[0].z, ramp.pts[0].z, 1e-9), 'saved and opened again: the corner elevations are kept', st.pads[1]?.pts);

  console.log('\nFeature line: row Pick, vertices added and removed, highlight');
  await load();
  await nodeSel('feature', 'f1');
  ok(await page.locator('[data-fl-table] tbody tr').first().locator('td').first().locator('[data-fl-pick]').count() === 1, 'each Vertices row starts with a Pick button');
  u0 = await undoN();
  await page.locator('[data-fl-pick="1"]').click(); await page.waitForTimeout(100);
  await click(300, 160, -3, 3);
  st = await S();
  ok(near(st.features[0].pts[1].x, 300, 1e-6) && near(st.features[0].pts[1].y, 160, 1e-6) && st.features[0].pts[1].z === 101, 'row 2\'s Pick + a click near the pad corner moves vertex 2 onto it (300, 160); its elevation stays 101', st.features[0].pts[1]);
  ok(await undoN() === u0 + 1, 'one undo step');
  await undo();
  await point('[data-fl-table] tr[data-fl-row="1"] td:nth-child(3)');
  hot = await page.evaluate(() => window.civilcraft.hot);
  ok(hot && near(hot.x, 250) && near(hot.y, 140), 'pointing at row 2 rings vertex 2 on the plan', hot);
  await page.screenshot({ path: path.join(SHOTS, '04-fl-row-ring.png') });
  await page.mouse.move(5, 5);
  await page.locator('[data-fl-vadd="0"]').click(); await page.waitForTimeout(200);
  st = await S();
  ok(st.features[0].pts.length === 3 && near(st.features[0].pts[1].x, 200) && near(st.features[0].pts[1].y, 110) && near(st.features[0].pts[1].z, 100.75), 'the + in row 1 adds a vertex halfway at (200, 110), elevation 100.75', st.features[0].pts[1]);
  await page.locator('[data-fl-vdel="1"]').click(); await page.waitForTimeout(200);
  st = await S();
  ok(st.features[0].pts.length === 2, 'the x takes it out');
  ok(await page.locator('[data-fl-vdel="0"]').isDisabled(), 'a two-vertex line cannot lose a vertex (the x is off)');
  await page.locator('[data-fl-vadd-pick]').click(); await page.waitForTimeout(100);
  await click(175, 95, 2, 2);
  st = await S();
  ok(st.features[0].pts.length === 3 && near(st.features[0].pts[1].z, 100.5 + 0.5 * ((st.features[0].pts[1].x - 150) / 100), 1e-6), 'Add a vertex + a click on the line adds one there at the line\'s elevation', st.features[0].pts[1]);
  await undo();
  const fe = page.locator('[data-cv-corners="feature"] input[aria-label="Corner 2 easting"]');
  ok(await fe.count() === 1, 'the feature line also lists typed eastings and northings');
  await type(fe, '260');
  st = await S();
  ok(st.features[0].pts[1].x === 260 && st.features[0].pts[1].z === 101, 'typing an easting moves vertex 2; its elevation stays', st.features[0].pts[1]);
  await undo();

  console.log('\nFeature lines in a pad (Pad 5) and in the proposed surface (Grading 1)');
  await nodeSel('pad', 'p40');
  ok(await page.locator('[data-pad-lines] [data-pad-line-add="f1"]').count() === 1, 'the pad lists the feature line lying in it, with Add to the pad');
  ok(await page.locator('[data-pad-lines] [data-pad-line-row="f2"]').count() === 0, 'a line outside the pad is not listed');
  ok(near(await zAt(200, 110), 100, 1e-6), 'before: the pad is level at 100 under the line');
  u0 = await undoN();
  await page.locator('[data-pad-line-add="f1"]').click(); await page.waitForTimeout(400);
  st = await S();
  ok(st.features[0].use === 'design' && await undoN() === u0 + 1, 'Add to the pad makes it a design line (one undo step)');
  ok(near(await zAt(200, 110), 100.75, 1e-6), 'after: the pad surface passes through the line (100.75 at its middle)', await zAt(200, 110));
  ok(await page.locator('[data-pad-lines] [data-pad-line-out="f1"]').count() === 1, 'it is now listed as shaping the pad, with a remove button');
  await page.screenshot({ path: path.join(SHOTS, '05-pad-lines.png') });
  await page.locator('[data-pad-line-draw]').click(); await page.waitForTimeout(150);
  ok(await page.evaluate(() => window.civilcraft.tool) === 'feature', 'Draw a feature line in this pad starts the Feature line tool');
  await page.keyboard.down('Alt'); await click(130, 140); await click(180, 140); await page.keyboard.up('Alt');
  await page.keyboard.press('Enter'); await page.waitForTimeout(400);
  st = await S();
  const drawn = st.features[st.features.length - 1];
  ok(st.features.length === 4 && drawn.use === 'design' && !drawn.closed, 'the line drawn that way is a design line', drawn && [drawn.use, drawn.pts]);
  await nodeSel('feature', 'f2');
  ok(/drawn on the plan/.test(await page.locator('[data-fl-use-note]').innerText()), 'the outside line starts as Only drawn');
  await page.selectOption('#cv-fl-use', 'design'); await page.waitForTimeout(400);
  ok(/breakline of the proposed surface/.test(await page.locator('[data-fl-use-note]').innerText()), 'set to Graded into the design, an open line says it is a breakline of the proposed surface');
  ok(near(await zAt(370, 230), 99, 1e-6) && near(await zAt(370, 290), 100, 1e-6), 'the proposed surface drops to 99 on the ditch line and is unchanged a survey row away', [await zAt(370, 230), await zAt(370, 290)]);
  await page.screenshot({ path: path.join(SHOTS, '06-breakline.png') });

  console.log('\nGrading tools: slope to a surface, longitudinal feature');
  // a level line at 104 on flat ground at 100, drawn west to east at y = 290 … use f2 moved: (130, 250) → (290, 250), elevation 104
  await load();
  await page.evaluate(() => { const p = window.civilcraft.project; p.change('test line', (s) => { s.features.push({ id: 'f20', name: 'Top', pts: [{ x: 130, y: 250, z: 104 }, { x: 290, y: 250, z: 104 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 }); }); });
  await nodeSel('feature', 'f20');
  ok(await page.locator('[data-fl-slope]').count() === 1 && await page.locator('[data-fl-long]').count() === 1, 'the feature line has Slope to a surface and Longitudinal feature blocks');
  ok(near(Number(await page.inputValue('#cv-fl-sl-to')), 160), 'the stop distance starts at the line\'s length (160)');
  u0 = await undoN();
  await page.fill('#cv-fl-sl-s0', '2:1'); await page.fill('#cv-fl-sl-s1', '4:1');
  await page.locator('[data-fl-slope-go]').click(); await page.waitForTimeout(400);
  st = await S();
  let made = st.features[st.features.length - 1];
  // right of a west-to-east line is south: 4 high at 2:1 = 8 out at the start, at 4:1 = 16 out at the stop
  ok(made.name === 'Top daylight' && !made.closed && near(made.pts[0].x, 130, 1e-4) && near(made.pts[0].y, 242, 1e-3) && near(made.pts[made.pts.length - 1].y, 234, 1e-3) && near(made.pts[0].z, 100, 1e-3), 'Make the slope (2:1 to 4:1, right side) adds "Top daylight": 8 out at the start (y 242), 16 out at the stop (y 234), on the ground at 100', [made.name, made.pts[0], made.pts[made.pts.length - 1]]);
  ok(await undoN() === u0 + 1 && await page.evaluate(() => window.civilcraft.sel?.id) === made.id, 'one undo step, and the new line is selected');
  await page.screenshot({ path: path.join(SHOTS, '07-daylight.png') });
  await undo();
  await nodeSel('feature', 'f20');
  await page.selectOption('#cv-fl-sl-make', 'area'); await page.fill('#cv-fl-sl-s0', '2'); await page.fill('#cv-fl-sl-s1', '2');
  await page.locator('[data-fl-slope-go]').click(); await page.waitForTimeout(600);
  st = await S();
  made = st.features[st.features.length - 1];
  ok(made.closed && made.use === 'design' && made.name === 'Top slope', 'Make: The slope, graded adds a closed design line "Top slope"', [made.name, made.closed, made.use]);
  ok(near(await zAt(210, 246), 102, 1e-3), 'the proposed surface now holds the slope: 102 halfway down it', await zAt(210, 246));
  await undo();
  await nodeSel('feature', 'f20');
  // a bad slope is refused and nothing is added
  u0 = await undoN();
  await page.fill('#cv-fl-sl-s0', '0'); await page.locator('[data-fl-slope-go]').click(); await page.waitForTimeout(200);
  ok(await undoN() === u0, 'a slope of 0 is refused: nothing is added');
  // longitudinal feature: offset 10 → 20 to the right, −2 % → −2 %
  await page.fill('#cv-fl-lo-o0', '10'); await page.fill('#cv-fl-lo-o1', '20');
  await page.locator('[data-fl-long-go]').click(); await page.waitForTimeout(400);
  st = await S();
  made = st.features[st.features.length - 1];
  ok(made.name === 'Top offset' && made.pts.length === 2 && near(made.pts[0].y, 240, 1e-6) && near(made.pts[0].z, 103.8, 1e-6) && near(made.pts[1].y, 230, 1e-6) && near(made.pts[1].z, 103.6, 1e-6), 'Make the line (offset 10 to 20, −2 %): (130, 240) at 103.8 to (290, 230) at 103.6', made.pts);
  ok(await undoN() === u0 + 1, 'one undo step');
  await undo();
  await nodeSel('feature', 'f20');
  await page.selectOption('#cv-fl-lo-mode', 'toelev'); await page.waitForTimeout(100);
  ok(await page.locator('#cv-fl-lo-o0').isHidden() && await page.locator('#cv-fl-lo-c').isVisible(), 'A slope out to an elevation hides the offsets and asks for the elevation');
  await page.fill('#cv-fl-lo-a', '25'); await page.fill('#cv-fl-lo-b', '25'); await page.fill('#cv-fl-lo-c', '102');
  await page.locator('[data-fl-long-go]').click(); await page.waitForTimeout(400);
  st = await S();
  made = st.features[st.features.length - 1];
  ok(near(made.pts[0].y, 242, 1e-6) && made.pts[0].z === 102, '25 % out to elevation 102 from 104: 8 out (y 242), at 102', made.pts[0]);
  const kept = await page.evaluate(() => JSON.stringify(window.civilcraft.project.toJSON()));
  await load(kept);
  st = await S();
  ok(st.features.some((f) => f.name === 'Top offset' && f.pts[0].z === 102), 'the new line is in the saved file');
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
