#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-quantities.mjs — booklet rows BK.84 (gross, deductions and net on the schedules), BK.11 (the one stated measuring rule, shown on
 * the schedule and handed to TakeoffCraft) and BK.40 (takeoff data on a wall type) in the real page, /lab, headless (session bk-quantities-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-quantities.mjs [--shots <dir>]      run as root (a test admin session)
 * Walls are the Wall tool's default type; their thickness and height are read from the page. Expected values are worked out beside each check.
 */
/**
 * browser-walljoins.mjs — 0.9 WT.5 (join style, layer priority), FX.70 (Disallow join as a tool), FX.62 (Align keeps joins), FX.66 (a group Move
 * with the Move tool) and WT.1 (the wall icons on the Walls menu) in the real page, /lab, headless (session walls-join-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-walljoins.mjs [--shots <dir>]      run as root (a test admin session)
 * Walls are int-2x4 or the Wall tool's default type; T = their thickness, read from the page. Expected values are worked out beside each check.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimquant'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const throttled = new Set();   // the anonymous hardware report answers 429 after many runs from this machine: not this test's
page.on('response', (r) => { if (r.status() === 429) throttled.add(r.url()); });
await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.walls'); } catch (e) { /* none */ } });
await page.reload({ waitUntil: 'networkidle' });
const quiet = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const settled = async () => { await quiet(); await page.waitForTimeout(350); await quiet(); };
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, o) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, o); };
const hover = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); };
const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) s += p[i][0] * p[(i + 1) % p.length][1] - p[i][1] * p[(i + 1) % p.length][0]; return Math.abs(s / 2); };
const walls = () => page.evaluate(() => { const S = window.bimcraftPlan.state; return S.data.walls.map((w) => ({ guid: w.guid, key: window.bimcraftRes.api.kb() + w.id, a: w.a, b: w.b, t: w.t, joins: (w.joins || []).map((j) => ({ kind: j.kind, pos: j.pos, other: j.other, style: j.style || 'mitre', through: j.through === true })), joinOff: { a: !!w.joinOff?.a, b: !!w.joinOff?.b }, outline: [...(S.outlines?.get(w.guid) || [])].map((q) => [q[0], q[1]]) })); });
const near = (a, b, e = 0.5) => Math.abs(a - b) <= e;
const rebuilt = () => page.waitForFunction(() => !/Working/.test(document.body.innerText.slice(0, 200000)), null, { timeout: 90000 }).catch(() => {});
const undo = async () => { await page.click('[data-act="undo"]'); await page.waitForTimeout(400); await rebuilt(); await settled(); };
const tool = async (menu, name) => { if (menu) { await page.click(`[${menu}] > summary`); } await page.click(`[data-mtool="${name}"]`); await settled(); };
const pickKeys = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
const hz = (W, y) => W.find((w) => near(w.a[1], y, 1) && near(w.b[1], y, 1));
const vt = (W, x) => W.find((w) => near(w.a[0], x, 1) && near(w.b[0], x, 1));
const styleAt = (W, g1, g2) => W.find((w) => w.guid === g1).joins.find((j) => j.other === g2 && j.kind === 'L');
try {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Quantities'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);

  const sched = async (kind) => { await page.selectOption('[data-msched-kind]', kind); await page.waitForTimeout(250); return page.evaluate(() => ({ head: [...document.querySelectorAll('[data-msched] thead th')].map((x) => x.textContent), rows: [...document.querySelectorAll('[data-msched] tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent)), total: [...document.querySelectorAll('[data-msched] tfoot td')].map((x) => x.textContent), note: document.querySelector('[data-schedule-note]')?.textContent || '' })); };
  const m2 = (mm2) => (Math.round(mm2 / 1e4) / 100).toFixed(2) + ' m²';

  console.log('== a room 5000 x 4000 with one door');
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  let W = await walls();
  const Hh = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].height);
  ok(W.length === 4 && Hh > 0, 'four walls, ' + Hh + ' mm high');
  await page.click('[data-mtool="door"]');
  await planClick(2000, 300); await settled();   // inside the room near the south wall: the door goes in that wall
  await page.click('[data-mtool="select"]'); await settled();
  const O = await page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ kind: o.kind, width: o.width, height: o.height })));
  ok(O.length === 1 && O[0].kind === 'door', 'a door in the south wall: ' + Math.round(O[0]?.width) + ' x ' + Math.round(O[0]?.height));
  const GROSS = 18000 * Hh, DOOR = O[0].width * O[0].height;

  console.log('== BK.84 Walls by type: gross, deductions, net, and the rule');
  // the Schedules section of the left panel starts closed: open it as a person would
  await page.evaluate(() => document.querySelector('[data-msched-sec]').scrollIntoView({ block: 'start' }));
  if (await page.getAttribute('[data-msched-sec] > h2', 'aria-expanded') === 'false') await page.click('[data-msched-sec] > h2', { position: { x: 20, y: 10 } });
  await page.waitForSelector('[data-msched-kind]', { state: 'visible', timeout: 10000 });
  let S = await sched('walls');
  ok(S.head.length === 7 && S.head[4] === 'Gross area' && S.head[5] === 'Deductions' && S.head[6] === 'Net area', 'the columns Gross area, Deductions, Net area', S.head);
  // gross = (5000 + 4000 + 5000 + 4000) x the wall height; the door is the one deduction
  ok(S.rows.length === 1 && S.rows[0][4] === m2(GROSS) && S.rows[0][5] === m2(DOOR) && S.rows[0][6] === m2(GROSS - DOOR), 'the row: ' + m2(GROSS) + ' gross, ' + m2(DOOR) + ' deducted (the door, once), ' + m2(GROSS - DOOR) + ' net', S.rows[0]);
  ok(S.total[4] === m2(GROSS) && S.total[5] === m2(DOOR) && S.total[6] === m2(GROSS - DOOR), 'the total row says the same', S.total);
  ok(/^Gross: the area of one face of the wall/.test(S.note) && /Deductions: every door, window and other opening/.test(S.note) && /Net: gross less deductions/.test(S.note), 'BK.11 the measuring rule is written above the table', S.note);
  await shot('1-walls-schedule');
  const opts = await page.$$eval('[data-msched-kind] option', (o) => o.map((x) => x.value + '=' + x.textContent));
  ok(['floors=Floors', 'finishes=Finishes', 'walltakeoff=Wall types: takeoff data'].every((x) => opts.includes(x)), 'the list offers Floors, Finishes and Wall types: takeoff data', opts);

  console.log('== BK.84 Finishes and Floors');
  S = await sched('finishes');
  const typeFin = await page.evaluate(() => { const w = window.bimcraftPlan.state.data.walls[0]; return (w.assembly?.layers || []).filter((l) => l.function === 'finish' && l.kind !== 'cavity' && l.t > 0).length; });
  ok(S.head.join('|') === 'Finish|On|Faces|Gross area|Deductions|Net area' && S.rows.length === typeFin && typeFin >= 1, 'Finishes: a row for each finish layer of the wall type (' + typeFin + ')', [S.head, S.rows]);
  ok(S.rows.every((r) => r[2] === '4' && r[3] === m2(GROSS) && r[4] === m2(DOOR) && r[5] === m2(GROSS - DOOR)), 'each: 4 faces, the wall\'s own gross, the door out once, the same net', S.rows);
  ok(/A finish is a layer of the wall: it is listed here and is not added to the wall area/.test(S.note), 'the finishes rule says a finish is not added to the wall area');
  await shot('2-finishes-schedule');
  await page.click('[data-msched] tbody tr'); await settled();
  ok(await page.evaluate(() => window.bimcraftRes.api.selectedKeys().length) === 4, 'a click on a finish row picks its four walls');
  await page.keyboard.press('Escape'); await settled();
  S = await sched('floors');
  ok(S.rows.length === 0 && /Nothing drawn of this kind yet/.test(await page.textContent('[data-msched]')) && /^Gross: the area inside the outline of the floor/.test(S.note), 'Floors: nothing yet, and its rule is stated');

  console.log('== BK.40 takeoff data on a wall type');
  await page.click('[data-wall-assemblies-menu]');
  await page.waitForSelector('[data-assembly-editor]', { timeout: 15000 });
  ok(await page.isVisible('[data-assembly-takeoff]') && /Takeoff data/.test(await page.textContent('[data-assembly-takeoff] legend')), 'the type editor has a Takeoff data block');
  const labels = await page.$$eval('[data-assembly-takeoff] label', (l) => l.map((x) => x.childNodes[0].textContent));
  ok(['Unit (brick, block)', 'Unit length', 'Unit height', 'Unit width', 'Mortar', 'Joint thickness', 'Rate', 'Currency code', 'Rate is per'].every((x) => labels.includes(x)), 'with unit, sizes, mortar, joint, rate, currency and basis', labels);
  await page.fill('[data-assembly-name]', 'Brick test');
  await page.fill('[data-takeoff="unitName"]', 'Clay brick');
  await page.fill('[data-takeoff="length"]', '222'); await page.fill('[data-takeoff="height"]', '73'); await page.fill('[data-takeoff="width"]', '106');
  await page.fill('[data-takeoff="mortarName"]', 'Class II'); await page.fill('[data-takeoff="joint"]', '10');
  await page.fill('[data-takeoff="amount"]', '450'); await page.fill('[data-takeoff="currency"]', 'r1');
  await page.click('[data-assembly-save]'); await page.waitForTimeout(300);
  ok(await page.isVisible('[data-assembly-editor]') && /three-letter code/.test(await page.textContent('[data-assembly-editor] .bc-error')), 'a currency that is not a three-letter code is refused with a plain message, nothing saved');
  await page.fill('[data-takeoff="currency"]', 'zar');
  await shot('3-type-editor-takeoff');
  await page.click('[data-assembly-save]'); await page.waitForSelector('[data-assembly-editor]', { state: 'detached' }); await settled();
  // the Wall tool now draws the saved type: two walls, 3000 and 2000 long, north of the room
  await page.click('[data-mtool="wall"]'); await settled();
  await planClick(1000, 6000); await planClick(4000, 6000); await planClick(4000, 8000); await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="select"]'); await settled();
  const bw = await page.evaluate(() => window.bimcraftPlan.state.data.walls.filter((w) => w.assembly?.name === 'Brick test').map((w) => ({ len: w.len, height: w.height, takeoff: w.assembly.takeoff })));
  ok(bw.length === 2 && bw.every((w) => w.takeoff?.unit?.name === 'Clay brick' && w.takeoff.unit.length === 222 && w.takeoff.mortar.joint === 10 && w.takeoff.rate.amount === 450 && w.takeoff.rate.currency === 'ZAR' && w.takeoff.rate.basis === 'm2'), 'two walls of the saved type, each reading the unit, mortar and rate from its type', bw);
  const NET = bw.reduce((s, w) => s + w.len * w.height, 0), AMT = Math.round(450 * NET / 1e6 * 100) / 100;
  S = await sched('walltakeoff');
  const row = S.rows.find((r) => r[0] === 'Brick test'), other = S.rows.find((r) => r[0] !== 'Brick test');
  ok(S.head.join('|') === 'Wall type|Unit|Mortar|Count|Length (mm)|Net area|Rate|Amount|Units per m² of leaf|Units to order|Mortar volume', 'Wall types: takeoff data has Unit, Mortar, Count, Length, Net area, Rate, Amount, then (BK.42) units per m², units to order, mortar volume', S.head);
  ok(row && row[1] === 'Clay brick, 222 mm x 73 mm x 106 mm' && row[2] === 'Class II, 10 mm' && row[3] === '2' && row[5] === m2(NET) && row[6] === '450.00 ZAR / m²' && row[7] === AMT.toFixed(2) + ' ZAR', 'the row: the brick, the mortar, 2 walls, ' + m2(NET) + ' net, 450.00 ZAR / m², ' + AMT.toFixed(2) + ' ZAR (rate x net area)', row);
  ok(other && other[1] === '' && other[7] === '' && S.total[7] === AMT.toFixed(2) + ' ZAR' && /rounded up to a whole unit/.test(S.note), 'the other type has empty cells; the total and the note are there', [other, S.total]);
  await shot('4-walltakeoff-schedule');
  // reopen the editor: what was entered is shown again
  await page.click('[data-wall-assemblies-menu]');
  await page.waitForSelector('[data-assembly-editor]', { timeout: 15000 });
  const shown = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-assembly-takeoff] [data-takeoff]')].map((i) => [i.dataset.takeoff, i.value])));
  ok(shown.unitName === 'Clay brick' && shown.length === '222' && shown.joint === '10' && shown.amount === '450' && shown.currency === 'ZAR' && shown.basis === 'm2', 'the editor shows the saved data again', shown);
  await page.evaluate(() => document.querySelector('[data-assembly-editor]').close());

  console.log('== BK.11 / BK.40 what the takeoff hands to TakeoffCraft');
  const to = await page.evaluate(async () => { const r = await window.bimcraftRes.makeTakeoff(); if (!r?.takeoff) return null; return { items: r.takeoff.items.map((i) => ({ id: i.id, name: i.name, heightFt: i.heightFt, components: i.components.map((c) => ({ name: c.name, unit: c.unit, mat: c.mat, formula: c.formula })) })), opens: r.takeoff.marks.filter((m) => m.opens).map((m) => ({ item: m.item, opens: m.opens })) }; });
  const FT = 304.8;
  ok(to && to.opens.length === 1 && to.opens[0].opens.length === 1 && near(to.opens[0].opens[0][0] * FT, O[0].width, 0.1) && near(to.opens[0].opens[0][1] * FT, O[0].height, 0.1), 'the south wall\'s run carries its door once, in feet (' + JSON.stringify(to?.opens[0]?.opens) + ')', to?.opens);
  const bi = to?.items.find((i) => /^Brick test walls/.test(i.name)), bc = bi?.components.find((c) => /Clay brick/.test(c.name));
  ok(bc && bc.name === 'Clay brick, 222 mm x 73 mm x 106 mm; mortar Class II, 10 mm; rate in ZAR' && bc.unit === 'm²' && bc.mat === 4500000 && bc.formula === 'A', 'the brick walls\' item carries the type\'s data as a component priced on the net wall area', bi);

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
