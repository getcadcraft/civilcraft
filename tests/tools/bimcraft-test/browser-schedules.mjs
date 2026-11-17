#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-schedules.mjs — booklet rows BK.39 (schedule exports, finishes by room), BK.29 (room finishes: tiles with cuts, substrate),
 * BK.149 (the office standard on every schedule), BK.142 (a figure selects its elements), BK.47 (specification, working-drawing
 * schedules in a document) and BK.61 (the assistant tools through the page's own control channel) in the real page, /lab, headless
 * (session bk-r3-schedules-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-schedules.mjs [--shots <dir>]      run as root (a test admin session)
 * Walls are the Wall tool's default type; their thickness and height are read from the page. Expected values are worked out beside each check.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimsched'], { encoding: 'utf8' }));
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
  await page.fill('[data-new-name]', 'Schedules'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  const read = () => page.evaluate(() => ({ head: [...document.querySelectorAll('[data-msched] thead th')].map((x) => x.textContent), rows: [...document.querySelectorAll('[data-msched] tbody tr')].map((tr) => [...tr.children].map((c) => c.textContent)),
    foot: [...document.querySelectorAll('[data-msched] tfoot td')].map((x) => x.textContent), title: document.querySelector('[data-sched-title]')?.textContent || '', std: document.querySelector('[data-sched-standard]')?.getAttribute('data-sched-standard') || '' }));
  const sched = async (kind) => { await page.selectOption('[data-msched-kind]', kind); await page.waitForTimeout(300); return read(); };
  const selection = () => page.evaluate(() => [...(window.bimcraftSchedules && document.querySelector('[data-msched]') ? window.bimcraft?.viewer?.selection || [] : [])]);
  const selKeys = () => page.evaluate(() => window.bimcraftRes.api.selectedKeys().map((k) => k - window.bimcraftRes.api.kb()));

  console.log('== a room 5000 x 4000 with a door');
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  await page.click('[data-mtool="door"]');
  await planClick(2000, 300); await settled();
  const M = await page.evaluate(() => { const S = window.bimcraftPlan.state; return { walls: S.data.walls.map((w) => ({ id: w.id, guid: w.guid, t: w.t, h: w.height, a: w.a, b: w.b })), openings: S.data.openings.map((o) => ({ id: o.id, w: o.width, h: o.height, wall: o.wall })), rooms: S.data.derived.spaces.map((s) => ({ id: s.id, guid: s.guid, number: s.number })) }; });
  const T = M.walls[0].t, Hh = M.walls[0].h, DOOR = M.openings[0];
  ok(M.walls.length === 4 && M.openings.length === 1 && M.rooms.length === 1, 'four walls ' + T + ' thick and ' + Hh + ' high, one door, one room');

  console.log('== BK.142 the panel: every figure selects its elements');
  await page.evaluate(() => { const h = document.querySelector('[data-msched-sec] [data-af="closed"]'); if (h) h.click(); });   // the left panel keeps one section open: open Schedules
  await page.waitForTimeout(200);
  let S = await sched('walls');
  ok(await page.locator('[data-sched-layout]').count() === 1 && await page.locator('[data-sched-top]').count() === 1 && await page.locator('[data-sched-xlsx]').count() === 1 && await page.locator('[data-sched-sheets]').count() === 1, 'the layout controls and the export buttons are under the Schedules list');
  ok(S.rows.length === 1 && S.head.length === 7 && S.foot[0] === 'Total' && S.std === '' && S.title === '', 'no standard, nothing chosen: Walls by type looks as it did', S);
  await page.click('[data-msched] tbody tr td[data-fig="0:3"]'); await page.waitForTimeout(200);
  ok((await selKeys()).sort().join() === M.walls.map((w) => w.id).sort().join(), 'a click on the length figure selects the four walls');
  await page.click('[data-msched] tbody tr td[data-fig="0:5"]'); await page.waitForTimeout(200);
  ok((await selKeys()).join() === String(DOOR.id), 'a click on the deductions figure selects the door behind it');
  await page.click('[data-msched] tfoot td[data-fig="1:4"]'); await page.waitForTimeout(200);
  ok((await selKeys()).length === 4, 'a click on a total selects everything it adds up');
  S = await sched('doors');
  await page.click('[data-msched] tbody tr[data-msched-row="0"] td'); await page.waitForTimeout(200);
  ok((await selKeys()).join() === String(DOOR.id) && S.foot[0] === '1 in all', 'the door row selects the door; the total row reads "1 in all" as before', S.foot);

  console.log('== BK.149 grouping and totals in the panel; a saved set-up');
  await page.selectOption('[data-sched-group]', 'level'); await page.waitForTimeout(300);
  await page.selectOption('[data-sched-totals]', 'groups'); await page.waitForTimeout(300);
  S = await read();
  ok(S.rows.length === 3 && /^Level: /.test(S.rows[0][0]) && S.rows[2][0] === 'Subtotal (1)' && S.foot[0] === 'Total (1)' && S.head.length === 5 && !S.head.includes('Level'), 'grouped by level with subtotals: a group heading, the door, a subtotal, a total; the Level column moved into the heading', S);
  await page.fill('[data-sched-prop]', 'FireRating'); await page.click('[data-sched-prop-add]'); await page.waitForTimeout(300);
  S = await read();
  ok(S.head[S.head.length - 1] === 'FireRating' && /No element in this schedule has a value yet for: FireRating/.test(await page.locator('[data-sched-empty]').textContent()), 'a column read from a property is added; it says no door has a value yet');
  await page.fill('[data-sched-name]', 'Door schedule by floor'); await page.click('[data-sched-save]'); await settled(); await page.waitForTimeout(400);
  const cur = await page.evaluate(() => ({ value: document.querySelector('[data-msched-kind]').value, text: document.querySelector('[data-msched-kind]').selectedOptions[0]?.textContent, setups: window.bimcraftSchedules.state().setups }));
  ok(cur.value === 'setup:door-schedule-by-floor' && cur.text === 'Door schedule by floor' && cur.setups.length === 1 && cur.setups[0].layout.groupBy === 'level' && cur.setups[0].layout.totals === 'groups' && cur.setups[0].props[0].name === 'FireRating', 'Save as a set-up: it is in the file and in the Schedules list, and is shown', cur);
  S = await read();
  ok(S.title === 'Door schedule by floor' && S.rows.length === 3 && S.head[S.head.length - 1] === 'FireRating' && await page.locator('[data-sched-remove]').isVisible(), 'the set-up shows its title, grouping, subtotals and the property column');
  await page.evaluate(() => document.querySelector('[data-sched-top]').scrollIntoView({ block: 'start' })); await shot('setup');
  await undo();
  ok((await page.evaluate(() => [document.querySelector('[data-msched-kind]').value, window.bimcraftSchedules.state().setups.length])).join() === 'doors,0', 'undo takes the set-up out again; the list goes back to Doors');
  await page.click('[data-act="redo"]'); await page.waitForTimeout(400); await rebuilt(); await settled();
  ok(await page.evaluate(() => window.bimcraftSchedules.state().setups.length) === 1, 'redo brings it back');

  console.log('== BK.39 exports: Excel, tab-separated for Google Sheets, CSV');
  await sched('setup:door-schedule-by-floor');
  let dl = page.waitForEvent('download', { timeout: 20000 });
  await page.click('[data-sched-xlsx]');
  let file = await dl, p1 = path.join(fs.mkdtempSync('/tmp/bk-sched-'), 'a.xlsx');
  await file.saveAs(p1);
  const bytes = fs.readFileSync(p1);
  ok(/door schedule by floor\.xlsx$/.test(file.suggestedFilename()) && bytes.length > 1500 && bytes[0] === 0x50 && bytes[1] === 0x4b, 'Download Excel saves "… door schedule by floor.xlsx", a zip of ' + bytes.length + ' bytes', file.suggestedFilename());
  const X = await import(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/assets-bim-xlsx.js'));
  const wb = await X.readXlsx(new Uint8Array(bytes));
  ok(wb.sheets.length === 2 && wb.sheets[0].rows[0][0] === 'Mark' && /^Level: /.test(wb.sheets[0].rows[1][0]) && wb.sheets[1].name === 'Elements' && wb.sheets[1].rows.length === 5 && /^[0-9A-Za-z_$]{22}$/.test(wb.sheets[1].rows[2][2]), 'read back: the schedule sheet as laid out, and an Elements sheet naming the door by GlobalId', wb.sheets.map((s) => s.rows.slice(0, 3)));
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await page.click('[data-sched-sheets]'); await page.waitForTimeout(300);
  const clip = await page.evaluate(async () => { try { return await navigator.clipboard.readText(); } catch (e) { return window.bimcraftSchedules.state().tsv; } });
  ok(clip.split('\n')[0].split('\t').join('|') === 'Mark|Type|Width (mm)|Height (mm)|In wall|FireRating' && clip.split('\n').length === 6, 'Copy for Google Sheets: tab-separated text on the clipboard (headings + 4 lines)', clip.split('\n')[0]);
  const note = await page.locator('[data-sched-sheets-note]').textContent();
  ok(/sends nothing there/.test(note) && /does not sign in to Google/.test(note) && await page.locator('[data-sched-sheets-new]').getAttribute('href') === 'https://sheets.new', 'the panel says exactly what the Google Sheets route is: paste; sheets.new is Google\'s own page; nothing is sent');
  dl = page.waitForEvent('download', { timeout: 20000 });
  await page.click('[data-msched-csv]');
  file = await dl; const p2 = p1.replace('a.xlsx', 'b.csv'); await file.saveAs(p2);
  const csv = fs.readFileSync(p2, 'utf8').replace(/^﻿/, '').split(/\r?\n/);
  ok(csv[0] === 'Mark,Type,Width (mm),Height (mm),In wall,FireRating' && /^Level: /.test(csv[1]) && /^Subtotal \(1\)/.test(csv[3]) && /^Total \(1\)/.test(csv[4]), 'Download CSV follows the layout shown', csv.slice(0, 5));

  console.log('== BK.29 room finishes: the dialog, then the schedules');
  await page.click('[data-sched-finishes]');
  await page.waitForSelector('[data-fin-dialog]');
  await page.click('[data-fin-add-type]');
  const fid = await page.locator('[data-fin-type]').first().getAttribute('data-fin-type');
  await page.fill(`[data-fin-name="${fid}"]`, 'Porcelain 600');
  await page.fill(`[data-fin-th="${fid}"]`, '10'); await page.fill(`[data-fin-tl="${fid}"]`, '600'); await page.fill(`[data-fin-tw="${fid}"]`, '600'); await page.fill(`[data-fin-waste="${fid}"]`, '10');
  await page.fill(`[data-fin-sub="${fid}"]`, 'Screed'); await page.fill(`[data-fin-subth="${fid}"]`, '50');
  await page.fill(`[data-fin-tj="${fid}"]`, 'abc');
  await page.selectOption(`[data-fin-room-floor="${M.rooms[0].guid}"]`, fid);
  await page.click('[data-fin-save]'); await page.waitForTimeout(200);
  ok(/Joint.* is not a length/.test(await page.locator('[data-fin-alert]').textContent()) && await page.locator('[data-fin-dialog]').count() === 1, 'a joint that is not a length is said in words and nothing is saved');
  await page.fill(`[data-fin-tj="${fid}"]`, '0');
  await shot('finishes-dialog');
  await page.fill(`[data-fin-room-skirting="${M.rooms[0].guid}"]`, 'Timber 100'); await page.fill(`[data-fin-room-skh="${M.rooms[0].guid}"]`, '100');
  await page.click('[data-fin-save]'); await settled(); await page.waitForTimeout(300);
  ok(await page.locator('[data-fin-dialog]').count() === 0, 'Save closes the dialog');
  // the room inside the wall faces: (5000 - T) x (4000 - T); 600 tiles from one corner
  const RW = 5000 - T, RH = 4000 - T, nx = Math.ceil(RW / 600 - 1e-9), ny = Math.ceil(RH / 600 - 1e-9), wx = Math.floor(RW / 600 + 1e-9), wy = Math.floor(RH / 600 + 1e-9);
  const whole = wx * wy, cut = nx * ny - whole, order = Math.ceil((whole + cut) * 1.1 - 1e-9);
  const m2 = (mm2) => (Math.round(mm2 / 1e4) / 100).toFixed(2) + ' m²';
  S = await sched('roomfinishes');
  ok(S.rows.length === 1 && S.rows[0][3] === 'Porcelain 600' && S.rows[0][4] === m2(RW * RH) && S.rows[0][9] === 'Timber 100', 'Finishes by room: the room, Porcelain 600 on ' + m2(RW * RH) + ', skirting Timber 100', S.rows[0]);
  // skirting: the room's wall length 2 (RW + RH) less the door's width
  const sk = Math.round(2 * (RW + RH) - DOOR.w);
  ok(S.rows[0][10].replace(/[^0-9]/g, '') === String(sk), 'skirting ' + sk + ' mm: the wall length less the door', S.rows[0][10]);
  await page.click('[data-msched] tbody tr td[data-fig="0:10"]'); await page.waitForTimeout(200);
  ok((await selKeys()).includes(DOOR.id), 'the skirting figure selects what it came from, the door it leaves out among them');
  S = await sched('finishtotals');
  ok(S.rows.length === 1 && S.rows[0][3] === String(whole) && S.rows[0][4] === String(cut) && S.rows[0][5] === String(order) && S.rows[0][6] === 'Screed' && /m³$/.test(S.rows[0][7]), 'Finish quantities: ' + whole + ' whole + ' + cut + ' cut tiles, ' + order + ' to order, the screed volume', S.rows[0]);
  ok(/a tile partly on it is a cut tile/.test(await page.locator('[data-schedule-note]').textContent()), 'the note says how tiles are counted');

  console.log('== BK.149 the office standard (the Default Policies store) lays out every schedule');
  const setStd = (pol) => page.evaluate((pol) => { window.__std = pol; return import('/assets/apps/bimcraft/dev/defaults-hook.js').then((H) => { H.setDefaults(pol ? { get: (id) => pol[id], source: () => 'from your Default Policies' } : null); }); }, pol);
  await setStd({ 'all.schedule.group': 'level', 'all.schedule.totals': 'groups', 'all.schedule.headings': 'upper', 'all.schedule.title': '{project}: {schedule}' });
  await page.waitForTimeout(500); await settled();
  S = await sched('doors');
  ok(S.std.split(' ').sort().join() === 'groupBy,headings,title,totals' && S.head[0] === 'MARK' && /^LEVEL: /.test(S.rows[0][0]) && S.rows[2][0] === 'Subtotal (1)' && S.title === 'Schedules: Doors', 'Doors, with nothing chosen: grouped by level, subtotals, capitals, titled, and the panel says the office standard did it', S);
  S = await sched('setup:door-schedule-by-floor');
  ok(S.std.split(' ').sort().join() === 'headings,title' && S.rows[2][0] === 'Subtotal (1)', 'the saved set-up keeps its own grouping and totals; the office gives the title and the heading case', S.std);
  await setStd(null); await page.waitForTimeout(500); await settled();
  S = await sched('doors');
  ok(S.std === '' && S.head[0] === 'Mark' && S.rows.length === 1, 'the standard off: Doors is plain again');

  console.log('== BK.47 the specification and the documents');
  await page.click('[data-sched-spec]');
  await page.waitForSelector('[data-spec-dialog]');
  const secs = await page.evaluate(() => [...document.querySelectorAll('[data-spec-section]')].map((s) => ({ id: s.getAttribute('data-spec-section'), facts: [...s.querySelectorAll('li')].map((l) => l.textContent) })));
  ok(secs.length === 3 && secs[0].id.startsWith('wall:') && secs[1].id.startsWith('door:') && secs[2].id.startsWith('finish:') && secs[0].facts.some((f) => /^Layer 1: /.test(f)) && secs[0].facts.some((f) => /In the model: 4 walls/.test(f)), 'the Specification dialog: a section for the wall type, the door type and the finish, with facts from the model', secs.map((s) => s.id));
  await page.fill(`[data-spec-text="${secs[0].id}"]`, 'Studs at 400 centres, boards screwed.');
  await page.click('[data-spec-save]'); await settled();
  ok(await page.evaluate(() => window.bimcraftSchedules.sections()[0].text) === 'Studs at 400 centres, boards screwed.', 'the person\'s text is saved in the file');
  await page.evaluate(() => { const d = document.querySelector('[data-sx-docs-details]'); d.open = true; d.dispatchEvent(new Event('toggle')); });
  await page.waitForSelector('[data-sx-docs-pick]');
  await page.selectOption('[data-sx-docs-pick]', 'tpl:spec'); await page.waitForTimeout(200);
  await page.click('[data-sx-docs-preview]'); await page.waitForTimeout(500);
  let out = await page.locator('[data-sx-docs-out]').innerText();
  ok(/Walls/.test(out) && /Studs at 400 centres, boards screwed\./.test(out) && /No specification text written yet\./.test(out) && /Porcelain 600/.test(out), 'Documents › Specification: the sections, the facts, the text, and "not written yet" where there is none');
  await page.selectOption('[data-sx-docs-pick]', 'tpl:working'); await page.waitForTimeout(200);
  await page.click('[data-sx-docs-preview]'); await page.waitForTimeout(500);
  const figs = await page.locator('[data-sx-docs-out] td[data-doc-fig]').count();
  out = await page.locator('[data-sx-docs-out]').innerText();
  ok(figs > 0 && /Finishes by room/.test(out) && /Porcelain 600/.test(out) && !/\[\?schedule/.test(out), 'Documents › Working drawing schedules: doors, windows and the finish schedules straight from the model', figs);
  await pickKeys([]);
  await page.locator('[data-sx-docs-out] table[data-doc-figures]').first().locator('td[data-doc-fig]').first().click(); await page.waitForTimeout(200);
  ok((await selKeys()).join() === String(DOOR.id), 'a figure of the door schedule in the document selects the door (BK.142)');

  console.log('== BK.61 the assistant tools on the page\'s own control channel');
  await page.evaluate(() => window.bimcraftControl.configure({ enabled: true, groups: ['read', 'edit', 'export'] }));
  const rpc = (method, params, id = 1) => page.evaluate(([m, p, i]) => window.bimcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, 'sched-session', { name: 'Test assistant', version: '1' }), [method, params, id]);
  let r = await rpc('tools.list', {});
  const names = (r.result?.tools || []).map((x) => x.name);
  ok(['schedule_list', 'schedule_setup', 'schedule_arrange', 'schedule_read', 'schedule_export', 'schedule_remove', 'finishes_get', 'finishes_set'].every((n) => names.includes(n)), 'tools.list: the eight schedule and finishes tools', names.filter((n) => /sched|finish/.test(n)));
  r = await rpc('tools.call', { name: 'schedule_setup', arguments: { name: 'Window schedule', source: 'windows', group_by: 'level', totals: 'grand', columns: ['mark', 'type', 'width', 'height', 'sill', 'Glazing'] } });
  await settled(); await page.waitForTimeout(300);
  let sc = r.result?.structuredContent;
  ok(!r.result?.isError && sc?.saved && sc.id === 'window-schedule' && sc.empty_columns?.join() === 'Glazing' && await page.locator('[data-msched-kind] option[value="setup:window-schedule"]').count() === 1, 'schedule_setup by the assistant: saved in the file, and it is in the person\'s Schedules list', JSON.stringify(r).slice(0, 300));
  ok(/Assistant: set up the schedule Window schedule/.test(await page.evaluate(() => document.querySelector('[data-change-list]')?.textContent || '')), 'the change list names the step "Assistant: set up the schedule Window schedule"');
  r = await rpc('tools.call', { name: 'schedule_read', arguments: { id: 'door-schedule-by-floor' } });
  sc = r.result?.structuredContent;
  ok(!r.result?.isError && sc?.lines?.length === 4 && sc.lines[1].elements.length === 1, 'schedule_read: the person\'s set-up, filled, each line with its GlobalIds', JSON.stringify(r).slice(0, 300));
  r = await rpc('tools.call', { name: 'selection_set', arguments: { guids: sc.lines[1].elements } });
  ok(!r.result?.isError && (await selKeys()).join() === String(DOOR.id), 'the elements of a line, handed to selection_set, select the door (BK.142)');
  const dl2 = page.waitForEvent('download', { timeout: 20000 });
  r = await rpc('tools.call', { name: 'schedule_export', arguments: { source: 'finishtotals', format: 'xlsx' } });
  const f2 = await dl2;
  ok(!r.result?.isError && r.result.structuredContent.downloaded && /finish quantities\.xlsx$/.test(f2.suggestedFilename()), 'schedule_export: the workbook is downloaded in the window', f2.suggestedFilename());
  await page.evaluate(() => window.bimcraftControl.configure({ groups: ['read'] }));
  r = await rpc('tools.call', { name: 'schedule_setup', arguments: { name: 'x', source: 'doors' } });
  ok(r.result?.isError && /edit permission/.test(r.result.content[0].text), 'with only Read allowed, schedule_setup is refused');
  void selection;
  ok(problems.filter((p) => !/429|Too Many Requests|hardware/.test(p)).length === 0, 'no console errors', problems.slice(0, 4));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
