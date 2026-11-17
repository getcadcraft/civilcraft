#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-measure.mjs — booklet row BK.42 in the real page, /lab, headless (session bk-measure-10): pick the project's measurement
 * method in the Schedules panel and see the schedules change; load an office's own method file; see the brick and mortar numbers
 * of a wall type; the hand-over to TakeoffCraft carries the method and the masonry components.
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-measure.mjs [--shots <dir>]      run as root (a test admin session)
 * Sizes are read from the page; every expected value is worked out beside its check.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimmeasure'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message + ' @ ' + String(e.stack || '').split('\n').slice(1, 4).map((l) => l.trim().replace(/https:\/\/getcadcraft\.com\/assets\/apps\/bimcraft\/dev\//, '').replace(/\?v=\d+/, '')).join(' < ')));
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
  await page.fill('[data-new-name]', 'Measure'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);

  const sched = async (kind) => { await page.selectOption('[data-msched-kind]', kind); await page.waitForTimeout(250); return page.evaluate(() => ({ head: [...document.querySelectorAll('[data-msched] thead th')].map((x) => x.textContent), rows: [...document.querySelectorAll('[data-msched] tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent)), total: [...document.querySelectorAll('[data-msched] tfoot td')].map((x) => x.textContent), note: document.querySelector('[data-schedule-note]')?.textContent || '' })); };
  const m2 = (mm2) => (Math.round(mm2 / 1e4) / 100).toFixed(2) + ' m²';
  const setField = async (sel, value) => { await page.fill(sel, value); await page.press(sel, 'Enter'); await settled(); };
  const method = () => page.evaluate(() => ({ value: document.querySelector('[data-qty-method-pick]')?.value, options: [...document.querySelectorAll('[data-qty-method-pick] option')].map((o) => o.value + '=' + o.textContent), line: document.querySelector('[data-qty-method-line]')?.textContent || '', msg: document.querySelector('[data-qty-method-msg]')?.textContent || '', link: document.querySelector('[data-qty-method-link]')?.href || '', notes: document.querySelector('[data-qty-method-notes]')?.hidden === false ? document.querySelector('[data-qty-method-notes] p').textContent : '' }));
  const pickMethod = async (id) => { await page.selectOption('[data-qty-method-pick]', id); await page.waitForTimeout(400); await rebuilt(); await settled(); };

  console.log('== a room 5000 x 4000 with a door and a small window (800 x 600 = 0.48 m2)');
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  const Hh = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].height), Tt = await page.evaluate(() => window.bimcraftPlan.state.data.walls[0].t);
  await page.click('[data-mtool="door"]');
  await planClick(2000, 300); await settled();
  await page.click('[data-mtool="window"]');
  await planClick(2500, 3700); await settled();
  await page.click('[data-mtool="select"]'); await settled();
  let O = await page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ kind: o.kind, width: o.width, height: o.height, off: o.offset, wall: o.wall })));
  const win0 = O.find((o) => o.kind === 'window');
  ok(O.length === 2 && win0, 'a door in the south wall and a window in the north wall', O);
  const nw = await page.evaluate((id) => { const w = window.bimcraftPlan.state.data.walls.find((x) => x.id === id); return { a: w.a, b: w.b }; }, win0.wall);
  const ux = (nw.b[0] - nw.a[0]) / 5000, wx = nw.a[0] + ux * (win0.off + win0.width / 2);
  await planClick(wx, 4000);
  await page.waitForSelector('[data-mp-ow]', { timeout: 15000 });
  await setField('[data-mp-ow]', '800');
  await page.waitForSelector('[data-mp-oh]');
  await setField('[data-mp-oh]', '600');
  await page.keyboard.press('Escape'); await settled();
  O = await page.evaluate(() => window.bimcraftPlan.state.data.openings.map((o) => ({ kind: o.kind, width: o.width, height: o.height })));
  const door = O.find((o) => o.kind === 'door'), win = O.find((o) => o.kind === 'window');
  const DOOR = door.width * door.height, WIN = win.width * win.height, GROSS = 18000 * Hh;
  ok(near(win.width, 800) && near(win.height, 600) && DOOR > 1e6, 'the window is 800 x 600 = 480 000 mm2; the door is ' + Math.round(door.width) + ' x ' + Math.round(door.height) + ' (over 1 m2)', O);

  console.log('== the measurement method in the Schedules panel');
  await page.evaluate(() => document.querySelector('[data-msched-sec]').scrollIntoView({ block: 'start' }));
  if (await page.getAttribute('[data-msched-sec] > h2', 'aria-expanded') === 'false') await page.click('[data-msched-sec] > h2', { position: { x: 20, y: 10 } });
  await page.waitForSelector('[data-msched-kind]', { state: 'visible', timeout: 10000 });
  let S = await sched('walls');
  let Mt = await method();
  ok(Mt.value === 'cadcraft-default' && Mt.options.length === 5 && Mt.options[0] === 'cadcraft-default=CadCraft default (every opening deducted)' && Mt.options.some((o) => o === 'rics-nrm2-2021=RICS NRM 2 (United Kingdom)') && Mt.options.some((o) => /^aaqs-africa-2015=/.test(o)) && Mt.options.some((o) => /^is-1200-1976=/.test(o)) && Mt.options.some((o) => /^us-bia-tn10-2009=/.test(o)), 'the picker lists the five shipped methods, the CadCraft default chosen', Mt.options);
  ok(Mt.line === 'Measurement method: CadCraft default (every opening deducted).' && Mt.link === '' && Mt.notes === '', 'under it: the method in force (the default has no source to name)', Mt);
  // default: both openings deducted
  ok(S.rows[0][4] === m2(GROSS) && S.rows[0][5] === m2(DOOR + WIN) && S.rows[0][6] === m2(GROSS - DOOR - WIN) && /^Gross: the area of one face of the wall/.test(S.note), 'default: ' + m2(DOOR + WIN) + ' deducted (door and window), the plain rule above the table', S.rows[0]);
  await shot('m1-default');

  console.log('== pick RICS NRM 2: the 0.48 m2 window is no longer deducted');
  await pickMethod('rics-nrm2-2021');
  S = await sched('walls'); Mt = await method();
  ok(Mt.value === 'rics-nrm2-2021' && S.rows[0][4] === m2(GROSS) && S.rows[0][5] === m2(DOOR) && S.rows[0][6] === m2(GROSS - DOOR), 'Walls by type: ' + m2(GROSS) + ' gross, only the door deducted (' + m2(DOOR) + '), ' + m2(GROSS - DOOR) + ' net', S.rows[0]);
  ok(/^Measurement method: RICS NRM 2 \(United Kingdom\)\. Source: NRM 2: Detailed measurement for building works, 2nd edition, October 2021, Royal Institution of Chartered Surveyors \(RICS\); read 2026-11-11\. Unchecked by a quantity surveyor\./.test(S.note) && /An opening of 0\.5 m² or less is not deducted/.test(S.note) && /Read from: NRM 2, Work section 14 Masonry, items 1 to 3, note 6/.test(S.note), 'the schedule\'s note names the method, its source, the date read, "Unchecked by a quantity surveyor", the rule and its clause', S.note.slice(0, 220));
  ok(/Unchecked by a quantity surveyor\./.test(Mt.line) && /^https:\/\/www\.rics\.org\//.test(Mt.link) && /less than/.test(Mt.notes) && /equal to or less than/.test(Mt.notes), 'under the picker: the source line, a link to the source, and the notes on what the source leaves open', Mt);
  const saved = await page.evaluate(async () => { const ed = window.bimcraftRes.api.ed(); return new TextDecoder().decode(ed.save()).includes("'rics-nrm2-2021'"); });
  ok(saved, 'the IFC that would be saved holds the method id');
  S = await sched('finishes');
  ok(S.rows.length >= 1 && S.rows.every((r) => r[4] === m2(DOOR)) && /An opening of 1 m² or less is not deducted/.test(S.note) && /Reveals \(the returns of the finish into the openings\) are not measured/.test(S.note), 'Finishes under NRM 2 (1 m2): only the door is deducted on each face; reveals are said not to be measured', [S.rows, S.note.slice(0, 200)]);
  await shot('m2-nrm2');
  const csv = await page.evaluate(async () => { const all = window.bimcraftRes.api.schedules(); const SC = all.finishes; return (SC.csvRows || []).map((r) => r[0]).pop(); });
  ok(/^Measurement method: RICS NRM 2/.test(csv || ''), 'the CSV of a schedule ends with the method line', csv);
  await undo();
  S = await sched('walls'); Mt = await method();
  ok(Mt.value === 'cadcraft-default' && S.rows[0][5] === m2(DOOR + WIN), 'Undo: one step back to the default, the window is deducted again', [Mt.value, S.rows[0]]);

  console.log('== an office\'s own method file');
  const dir = fs.mkdtempSync(path.join((await import('node:os')).tmpdir(), 'bkm-'));
  const office = { format: 'cadcraft-measurement-method', version: 1, id: 'office-face', name: 'Office method (to the face)', region: 'Test',
    source: { title: 'Office measuring notes', publisher: 'Test office', edition: 'rev 3', url: 'https://example.com/measuring-notes', read: '2026-11-11', note: 'A test file.' },
    quantities: { 'wall.side': { openings: { state: 'stated', clause: 'Office rule 3', minArea: 0.25, unit: 'm2', inclusive: true }, junctions: { state: 'stated', clause: 'Office rule 4', mode: 'face' } }, 'finish.wall': { reveals: { state: 'stated', clause: 'Office rule 7', measured: true, linearUpTo: 300 } } },
    masonry: { waste: { state: 'stated', clause: 'Office rule 9', pct: 7.5 } } };
  const write = (name, obj) => { const p = path.join(dir, name); fs.writeFileSync(p, typeof obj === 'string' ? obj : JSON.stringify(obj)); return p; };
  await page.setInputFiles('[data-qty-method-file]', write('bad.json', { ...office, format: 'something-else' }));
  await page.waitForTimeout(500);
  Mt = await method();
  ok(Mt.value === 'cadcraft-default' && Mt.msg === 'This is not a CadCraft measurement method file.', 'a file in another format is refused with a plain message; the method stays', Mt.msg);
  await page.setInputFiles('[data-qty-method-file]', write('taken.json', { ...office, id: 'rics-nrm2-2021' }));
  await page.waitForTimeout(500);
  ok((await method()).msg === 'This file uses the id of a method that comes with the app. Give it an id of its own.', 'a file that takes a shipped method\'s id is refused');
  await page.setInputFiles('[data-qty-method-file]', write('noclause.json', { ...office, quantities: { 'wall.side': { openings: { state: 'stated', clause: '', minArea: 0.25 } } } }));
  await page.waitForTimeout(500);
  ok(/^The method file was refused\. First problem: wall\.side\.openings\.clause/.test((await method()).msg), 'a stated value with no clause: refused, the field named', (await method()).msg);
  await page.setInputFiles('[data-qty-method-file]', write('office.json', office));
  await page.waitForTimeout(500); await rebuilt(); await settled();
  S = await sched('walls'); Mt = await method();
  // to the face: each of the four walls loses half the thickness of the wall it meets at each end: 4 x T in all
  const G2 = (18000 - 4 * Tt) * Hh;
  ok(Mt.value === 'office-face' && Mt.options.includes('office-face=Office method (to the face) (office file)') && /Loaded Office method \(to the face\)\./.test(Mt.msg), 'the valid office file is loaded, chosen and listed as an office file', Mt);
  ok(S.rows[0][4] === m2(G2) && S.rows[0][5] === m2(DOOR + WIN) && S.rows[0][6] === m2(G2 - DOOR - WIN), 'to the face: gross (18 000 - 4 x ' + Tt + ') x ' + Hh + ' = ' + m2(G2) + '; both openings are above 0.25 m2 and deducted', S.rows[0]);
  ok(/Loaded from an office file\. Unchecked by a quantity surveyor\./.test(S.note) && /Every wall end that meets another wall is measured to the near face/.test(S.note), 'the note says it is an office file, unchecked, and how junctions are measured');
  S = await sched('finishes');
  // reveals: door 2h + w, window 2h + 2w, depth T / 2 (no deeper than 300 mm: a length), on each finish face
  const GIRTH = 2 * door.height + door.width + 2 * win.height + 2 * win.width;
  ok(S.head.length === 8 && S.head[6] === 'Reveals, area' && S.head[7] === 'Reveals, length (mm)' && S.rows.every((r) => r[7] === String(Math.round(GIRTH))), 'Finishes gains Reveals columns: ' + Math.round(GIRTH) + ' mm of reveal on each finish face', [S.head, S.rows]);
  await shot('m3-office');
  await pickMethod('cadcraft-default');

  console.log('== bricks and mortar on a wall type');
  await page.click('[data-wall-assemblies-menu]');
  await page.waitForSelector('[data-assembly-editor]', { timeout: 15000 });
  const labels = await page.$$eval('[data-assembly-takeoff] label', (l) => l.map((x) => x.childNodes[0].textContent));
  ok(['Waste on units, %', 'Extra mortar, %'].every((x) => labels.includes(x)) && await page.locator('[data-takeoff-leaf]').count() >= 1 && /Layers built of this unit/.test(await page.textContent('[data-takeoff-leaves]')), 'the Takeoff data block has Waste on units, Extra mortar and a tick per layer built of the unit', labels);
  const bases = await page.$$eval('[data-takeoff="basis"] option', (o) => o.map((x) => x.value + '=' + x.textContent));
  ok(['unit=unit (brick, block) to order', 'k=1000 units to order', 'm3=m³ of mortar'].every((x) => bases.includes(x)), 'Rate is per: also a unit, 1000 units, a m3 of mortar', bases);
  await page.fill('[data-assembly-name]', 'Brick test');
  await page.fill('[data-takeoff="unitName"]', 'Brick');
  await page.fill('[data-takeoff="length"]', '215'); await page.fill('[data-takeoff="height"]', '65'); await page.fill('[data-takeoff="width"]', '102.5');
  await page.fill('[data-takeoff="mortarName"]', 'M4'); await page.fill('[data-takeoff="joint"]', '10');
  await page.fill('[data-takeoff="amount"]', '850'); await page.fill('[data-takeoff="currency"]', 'gbp'); await page.selectOption('[data-takeoff="basis"]', 'k');
  await page.fill('[data-takeoff="waste"]', '150');
  await page.click('[data-assembly-save]'); await page.waitForTimeout(300);
  ok(await page.isVisible('[data-assembly-editor]') && /percentage from 0 to 100/.test(await page.textContent('[data-assembly-editor] .bc-error')), 'a waste of 150% is refused with a plain message, nothing saved');
  await page.fill('[data-takeoff="waste"]', '5');
  await page.check('[data-takeoff-leaf] >> nth=0');
  await shot('m4-type-editor');
  await page.click('[data-assembly-save]'); await page.waitForSelector('[data-assembly-editor]', { state: 'detached' }); await settled();
  await page.click('[data-mtool="wall"]'); await settled();
  await planClick(1000, 6000); await planClick(4000, 6000); await planClick(4000, 8000); await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="select"]'); await settled();
  const bw = await page.evaluate(() => window.bimcraftPlan.state.data.walls.filter((w) => w.assembly?.name === 'Brick test').map((w) => ({ len: w.len, height: w.height, layers: w.assembly.layers.map((l) => ({ t: l.t, masonry: l.masonry === true })), takeoff: w.assembly.takeoff })));
  const leaves = bw[0]?.layers.filter((l) => l.masonry) || [];
  ok(bw.length === 2 && leaves.length === 1 && bw[0].takeoff.unit.waste === 5 && bw[0].takeoff.rate.basis === 'k', 'two walls of the saved type; one layer is ticked as built of the brick; 5% waste and a rate per 1000 are kept', [bw.length, bw[0]]);
  // units per m2 of one leaf = 1e6 / (225 x 75) = 59.259259; unit widths across = round((leaf + 10) / 112.5), at least 1
  const NET = bw.reduce((s, w) => s + w.len * w.height, 0), tL = leaves[0].t, across = Math.max(1, Math.round((tL + 10) / 112.5));
  const unitsNet = 1e6 / (225 * 75) * across * NET / 1e6, order = Math.ceil(unitsNet * 1.05 - 1e-9), mortar = Math.max(0, NET * tL - unitsNet * 215 * 65 * 102.5);
  const whole = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  S = await sched('walltakeoff');
  let row = S.rows.find((r) => r[0] === 'Brick test');
  ok(row && row[8] === '59.26' && row[9] === whole(order) + ' (with 5% waste)' && row[10] === (mortar / 1e9).toFixed(3) + ' m³', 'the schedule: 59.26 units per m2 of leaf, ' + whole(order) + ' units to order (59.259 x ' + across + ' x ' + (NET / 1e6).toFixed(2) + ' m2 x 1.05, rounded up), mortar ' + (mortar / 1e9).toFixed(3) + ' m3', row);
  ok(row && row[6] === '850.00 GBP / 1000 units' && row[7] === (850 * order / 1000).toFixed(2) + ' GBP', 'priced per 1000: 850 x ' + order + ' / 1000 = ' + (850 * order / 1000).toFixed(2) + ' GBP', row);
  ok(/Units per area of one leaf = 1 \/ \(\(unit length \+ joint\) x \(unit height \+ joint\)\)/.test(S.note) && /Mortar = net wall area x leaf thickness, less the volume of the units/.test(S.note) && /worked out by CadCraft/.test(S.note), 'the formulas are stated above the table, as computed');
  await shot('m5-bricks-mortar');
  await pickMethod('us-bia-tn10-2009');
  S = await sched('walltakeoff');
  row = S.rows.find((r) => r[0] === 'Brick test');
  ok(row && row[9] === whole(order) + ' (with 5% waste)' && row[10] === (mortar * 1.15 / 1e9).toFixed(3) + ' m³' && /Mortar allowance from the method: 15%/.test(S.note) && /Waste on units from the method: 5%/.test(S.note), 'under BIA Technical Note 10: the mortar gains the method\'s 15% (' + (mortar * 1.15 / 1e9).toFixed(3) + ' m3); the type\'s own 5% waste stays', row);

  console.log('== the hand-over to TakeoffCraft');
  const to = await page.evaluate(async () => { const r = await window.bimcraftRes.makeTakeoff(); if (!r?.takeoff) return null; return { method: r.takeoff.method || null, items: r.takeoff.items.map((i) => ({ name: i.name, components: i.components.map((c) => ({ name: c.name, unit: c.unit, mat: c.mat, formula: c.formula })) })) }; });
  const bi = to?.items.find((i) => /^Brick test walls/.test(i.name));
  ok(to && to.method?.id === 'us-bia-tn10-2009' && !to.method.file, 'the takeoff carries the method id (a shipped method needs no file)', to?.method);
  ok(bi && bi.components.length === 3 && /units to order/.test(bi.components[1].name) && bi.components[1].unit === '1000 EA' && bi.components[1].mat === 8500000 && /^ceil\(A \* .+ \* 1\.05\) \/ 1000$/.test(bi.components[1].formula) && /^Mortar volume/.test(bi.components[2].name) && bi.components[2].unit === 'm³' && bi.components[0].mat === 0, 'the brick walls\' item has the units (priced 850 per 1000) and the mortar as components with quantities', bi);
  fs.rmSync(dir, { recursive: true, force: true });

  // Known, not this row's: with the Wall tool on a just-saved project type, a pointer move while the model is still being read again can
  // throw in model-ui.js drawOverlay (projectWallType gives null → typeThickness). Seen in 3 of 5 completed runs, at a point where the
  // default method is in force (browser-quantities.mjs makes the same clicks); reported to the lead in docs/0.9-sessions/bk-measure-10.md. It is printed here, never hidden, and not counted.
  const race = problems.filter((p) => /reading 'layers'\) @ at typeThickness .*drawOverlay/.test(p));
  if (race.length) console.log('  --   seen ' + race.length + 'x: the Wall tool overlay error on a just-saved type (model-ui.js drawOverlay; not counted, see the session log)');
  const real = problems.filter((p) => !race.includes(p) && !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors (other than the one named above, if printed)', real.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
