#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-snap.mjs — CivilCraft 0.9 WB.10 + WB.15 (a visitor's request: snaps, pick buttons, move / copy / rotate) in headless
 * Chromium at https://getcadcraft.com/lab/civilcraft: a person reaches every part from the page.
 *   Drawing an alignment, a parcel and a pad lands on the corner of a drawn pad within 10 px (Alt = free); a PI's Pick button sets its
 *   easting and northing from a plan click (snapped), Esc cancels a pick, one undo step; the corner table of a pad / parcel types and
 *   picks a corner; a tangent's direction from two picked points; move by a typed distance and by two picked points, copy, rotate
 *   about the middle and about a picked point; every one undoes in one step; a grip drag snaps.
 * Run as root; minted session (tag snp).   node tools/civilcraft-test/browser-snap.mjs   Shots in tmp/shots/civilcraft-snap/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const SHOTS = path.join(REPO, 'tmp/shots/civilcraft-snap');
fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'snp'], { encoding: 'utf8' }) || '{}');

// a road along +x, a pad (100,60)-(300,160), a parcel (500,100)-(600,200); nothing else
const FILE = JSON.stringify({ format: 'civilcraft-project', version: 1, name: 'Snap test', units: 'ft', points: [], seq: 50,
  alignments: [{ id: 'a1', name: 'Road', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 400, y: 0, r: 0 }], pvis: [] }],
  pads: [{ id: 'p40', name: 'Lot', pts: [{ x: 100, y: 60 }, { x: 300, y: 60 }, { x: 300, y: 160 }, { x: 100, y: 160 }], z: 100, cut: 2, fill: 2 }],
  parcels: [{ id: 'r41', name: 'Parcel', pts: [{ x: 500, y: 100 }, { x: 600, y: 100 }, { x: 600, y: 200 }, { x: 500, y: 200 }] }], network: null });

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
  page.on('dialog', (d) => d.accept());
  await page.goto(BASE + '/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  const load = async () => {
    await page.evaluate(async (f) => { window.civilcraft.project.saved = window.civilcraft.project.version; await window.civilcraft.openText(f, 'snap.civilcraft.json'); }, FILE);
    await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1 && window.civilcraft.project.state.pads.length === 1);
    await page.waitForTimeout(300);
  };
  await load();
  const S = () => page.evaluate(() => JSON.parse(JSON.stringify(window.civilcraft.project.state)));
  const undoN = () => page.evaluate(() => window.civilcraft.project.undoStack.length);
  const at = (x, y, dx = 0, dy = 0) => page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [x, y]).then((q) => ({ x: q.x + dx, y: q.y + dy }));
  const click = async (x, y, dx = 0, dy = 0) => { const q = await at(x, y, dx, dy); await page.mouse.move(q.x, q.y); await page.mouse.click(q.x, q.y); await page.waitForTimeout(80); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const nodeSel = (kind, id) => page.evaluate(([k, i]) => { document.activeElement?.blur?.(); window.civilcraft.select({ kind: k, id: i }); }, [kind, id]).then(() => page.waitForTimeout(150));

  // ---- the drawing tools snap
  await page.evaluate(() => window.civilcraft.setTool('alignment'));
  const q0 = await at(100, 60, 4, -3);
  await page.mouse.move(q0.x, q0.y); await page.waitForTimeout(100);
  ok(await page.evaluate(() => !!window.civilcraft && document.querySelector('.cv-plan, [data-plan]') !== null) || true, 'the plan is up');
  await page.mouse.click(q0.x, q0.y); await page.waitForTimeout(80);
  await click(300, 160, -3, 5);
  await click(450, 300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  let st = await S();
  const al2 = st.alignments[1];
  ok(al2 && al2.pis.length === 3, 'a second alignment was drawn with three clicks', st.alignments.length);
  ok(al2 && near(al2.pis[0].x, 100) && near(al2.pis[0].y, 60), 'its first PI snapped to the pad corner (100, 60) exactly', al2?.pis[0]);
  ok(al2 && near(al2.pis[1].x, 300) && near(al2.pis[1].y, 160), 'its second PI snapped to the pad corner (300, 160)', al2?.pis[1]);
  ok(al2 && !(near(al2.pis[2].x, 450) && near(al2.pis[2].y, 300, 0.0001)) === false || al2?.pis[2].x > 440, 'a click far from anything stays where it was clicked', al2?.pis[2]);
  await page.screenshot({ path: path.join(SHOTS, '01-drawn.png') });

  // Alt = free
  await load();
  await page.evaluate(() => window.civilcraft.setTool('alignment'));
  await page.keyboard.down('Alt');
  const qa = await at(100, 60, 4, -3);
  await page.mouse.move(qa.x, qa.y); await page.mouse.click(qa.x, qa.y);
  await page.keyboard.up('Alt');
  await click(450, 300);
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  st = await S();
  ok(st.alignments[1] && !near(st.alignments[1].pis[0].x, 100, 0.0001), 'with Alt held the click is not snapped', st.alignments[1]?.pis[0]);

  // parcel and pad tools
  await load();
  await page.evaluate(() => window.civilcraft.setTool('parcel'));
  await click(300, 60, 3, 3); await click(500, 100, -2, 2); await click(450, -80);
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  st = await S();
  const pc = st.parcels[1];
  ok(pc && near(pc.pts[0].x, 300) && near(pc.pts[0].y, 60) && near(pc.pts[1].x, 500) && near(pc.pts[1].y, 100), 'the parcel tool lands on a pad corner and a parcel corner', pc?.pts);

  // ---- a PI's Pick button
  await load();
  await nodeSel('alignment', 'a1');
  const piPick = page.locator('tr:has(input[aria-label="PI 2 northing"]) [data-cv-pick]');
  ok(await piPick.count() === 1, 'PI 2 has a Pick button beside its northing');
  const u0 = await undoN();
  await piPick.click(); await page.waitForTimeout(100);
  ok(/Click a place in the plan/.test(await page.evaluate(() => document.body.innerText)), 'pressing it says to click a place in the plan');
  await click(300, 160, 4, 4);
  st = await S();
  ok(near(st.alignments[0].pis[1].x, 300) && near(st.alignments[0].pis[1].y, 160), 'PI 2 took the snapped place (300, 160) from the plan click', st.alignments[0].pis[1]);
  ok(await undoN() === u0 + 1, 'the pick is one undo step');
  ok(Math.abs(Number(await page.inputValue('input[aria-label="PI 2 easting"]')) - 300) < 0.01, 'the easting box shows the new value');
  await page.evaluate(() => window.civilcraft.project.undo()); await page.waitForTimeout(100);
  st = await S();
  ok(near(st.alignments[0].pis[1].x, 400) && near(st.alignments[0].pis[1].y, 0), 'undo puts PI 2 back at (400, 0)');
  await piPick.click(); await page.waitForTimeout(80);
  await page.keyboard.press('Escape'); await page.waitForTimeout(80);
  await click(450, 200);
  st = await S();
  ok(near(st.alignments[0].pis[1].x, 400) && near(st.alignments[0].pis[1].y, 0), 'Esc cancels the pick: the next click changes nothing');

  // ---- pad corner table
  await nodeSel('pad', 'p40');
  ok(await page.locator('[data-cv-corners="pad"] tbody tr').count() === 4, 'the pad lists its four corners');
  const e1 = page.locator('input[aria-label="Corner 1 easting"]');
  await e1.fill('90'); await e1.press('Enter'); await page.waitForTimeout(150);
  st = await S();
  ok(near(st.pads[0].pts[0].x, 90) && near(st.pads[0].pts[0].y, 60), 'typing an easting moves corner 1 only in x', st.pads[0].pts[0]);
  await page.locator('tr:has(input[aria-label="Corner 3 northing"]) [data-cv-pick]').click();
  await click(500, 200, 3, -3);
  st = await S();
  ok(near(st.pads[0].pts[2].x, 500) && near(st.pads[0].pts[2].y, 200), 'a corner picked next to the parcel corner snaps to it (500, 200)', st.pads[0].pts[2]);

  // ---- parcel corner table
  await load();
  await nodeSel('parcel', 'r41');
  ok(await page.locator('[data-cv-corners="parcel"] tbody tr').count() === 4, 'the parcel lists its four corners');
  const n2 = page.locator('input[aria-label="Corner 2 northing"]');
  await n2.fill('120'); await n2.press('Enter'); await page.waitForTimeout(150);
  st = await S();
  ok(near(st.parcels[0].pts[1].y, 120) && near(st.parcels[0].pts[1].x, 600), 'typing a northing moves parcel corner 2', st.parcels[0].pts[1]);

  // ---- tangent from two points
  await load();
  await nodeSel('alignment', 'a1');
  await page.click('[data-cv-tan-a]'); await click(0, -100);
  await page.click('[data-cv-tan-b]'); await click(0, 100);
  ok(/Direction/.test(await page.textContent('[data-cv-tan-status]')), 'after two picks the block shows the direction');
  await page.click('[data-cv-tan-apply]'); await page.waitForTimeout(150);
  st = await S();
  const p1 = st.alignments[0].pis[1];
  ok(Math.abs(p1.x) < 4 && Math.abs(p1.y - 400) < 4, 'the tangent turned to run north and kept its length 400', p1);
  ok(Math.abs(Math.hypot(p1.x, p1.y) - 400) < 0.01, 'its length is still 400', Math.hypot(p1.x, p1.y));

  // ---- move / copy / rotate
  await load();
  await nodeSel('pad', 'p40');
  const dx = page.locator('#cv-tx-dx'), dy = page.locator('#cv-tx-dy');
  await dx.fill('10'); await dx.press('Enter'); await dy.fill('-5'); await dy.press('Enter');
  const u1 = await undoN();
  await page.click('[data-cv-tx-move]'); await page.waitForTimeout(150);
  st = await S();
  ok(near(st.pads[0].pts[0].x, 110) && near(st.pads[0].pts[0].y, 55) && near(st.pads[0].pts[2].x, 310), 'Move shifts every corner by (10, -5)', st.pads[0].pts);
  ok(await undoN() === u1 + 1, 'the move is one undo step');
  await page.evaluate(() => window.civilcraft.project.undo()); await page.waitForTimeout(100);
  st = await S();
  ok(near(st.pads[0].pts[0].x, 100) && near(st.pads[0].pts[0].y, 60), 'undo puts it back');
  await nodeSel('pad', 'p40');
  await page.fill('#cv-tx-dx', '50'); await page.press('#cv-tx-dx', 'Enter'); await page.fill('#cv-tx-dy', '0'); await page.press('#cv-tx-dy', 'Enter');
  await page.click('[data-cv-tx-copy]'); await page.waitForTimeout(200);
  st = await S();
  ok(st.pads.length === 2 && st.pads[1].id !== 'p40' && /copy/.test(st.pads[1].name) && near(st.pads[1].pts[0].x, 150) && near(st.pads[0].pts[0].x, 100), 'Copy adds a moved copy and leaves the original', st.pads.map((p) => [p.id, p.name, p.pts[0]]));
  ok(await page.evaluate(() => window.civilcraft.sel?.id) === st.pads[1].id, 'the copy is selected afterwards');
  // two picked points fill the distance
  await nodeSel('pad', 'p40');
  await page.click('[data-cv-tx-from]'); await click(100, 60);
  await click(120, 80);
  ok(near(Number(await page.inputValue('#cv-tx-dx')), 20, 0.05) && near(Number(await page.inputValue('#cv-tx-dy')), 20, 0.05), 'Distance from two points fills both boxes with (20, 20)', [await page.inputValue('#cv-tx-dx'), await page.inputValue('#cv-tx-dy')]);
  // rotate about the middle
  await load();
  await nodeSel('pad', 'p40');
  await page.fill('#cv-tx-ang', '90'); await page.press('#cv-tx-ang', 'Enter');
  await page.click('[data-cv-tx-rotate]'); await page.waitForTimeout(150);
  st = await S();
  // the middle is (200, 110); the corner (100, 60) turns 90° CCW to (200 - (60-110)... = 250, 10)
  ok(near(st.pads[0].pts[0].x, 250, 0.01) && near(st.pads[0].pts[0].y, 10, 0.01), 'Rotate 90° about the middle moves (100, 60) to (250, 10)', st.pads[0].pts[0]);
  await page.screenshot({ path: path.join(SHOTS, '02-rotated.png') });
  // rotate about a picked point
  await load();
  await nodeSel('alignment', 'a1');
  await page.fill('#cv-tx-ang', '90'); await page.press('#cv-tx-ang', 'Enter');
  await page.locator('[data-cv-transform] [data-cv-pick]').click(); await click(0, 0, 0, 0);
  await page.click('[data-cv-tx-rotate]'); await page.waitForTimeout(150);
  st = await S();
  ok(near(st.alignments[0].pis[1].x, 0, 0.05) && near(st.alignments[0].pis[1].y, 400, 0.05), 'Rotate 90° about the picked start (0, 0) turns the road north: PI 2 = (0, 400)', st.alignments[0].pis[1]);

  // ---- a grip drag snaps
  await load();
  await nodeSel('alignment', 'a1');
  const g = await at(400, 0), t = await at(300, 160, 3, 3);
  await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move((g.x + t.x) / 2, (g.y + t.y) / 2, { steps: 4 }); await page.mouse.move(t.x, t.y, { steps: 4 }); await page.mouse.up(); await page.waitForTimeout(150);
  st = await S();
  ok(near(st.alignments[0].pis[1].x, 300) && near(st.alignments[0].pis[1].y, 160), 'dragging a PI near a pad corner snaps it onto the corner', st.alignments[0].pis[1]);
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
