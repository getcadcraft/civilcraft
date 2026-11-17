#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-typeswap.mjs: 0.10 BK.7 (type swap from a list, the "what moved" report) and BK.16 (the LOD tag on wall types) in the real page,
 * /lab, headless (session bk-typeswap-10):
 *   nice -n 10 timeout 600 node tools/bimcraft-test/browser-typeswap.mjs [--shots <dir>]      run as root (a test admin session)
 * Two project types are made in the type editor (a copy of the Wall tool's type tagged LOD 200, and a thicker copy tagged LOD 300); a room is
 * drawn with the first; walls are picked and swapped from the list. Thicknesses are read from the page; expected values are worked out
 * beside each check.
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
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimtypeswap'], { encoding: 'utf8' }));
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
await page.evaluate(() => { try { localStorage.removeItem('bimcraft.walls'); localStorage.setItem('bimcraft.model.units', 'mm');  } catch (e) { /* none */ } });
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
  await page.fill('[data-new-name]', 'Type swap'); await page.fill('[data-new-levels]', '1'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])'); await settled();
  await page.click('[data-model-layout="plan"]'); await page.waitForTimeout(300);
  const types = () => page.evaluate(() => window.bimcraftTypeSwap.list('').map((r) => ({ key: r.key, name: r.name, t: r.t, lod: r.lod, label: r.label, current: r.current })));
  const AT = 25;   // mm2: the page's room areas come from lengths stored in the file's units; on 18 m2 they sit within about 10 mm2 of the hand value

  console.log('== BK.16 the type editor has the LOD tag');
  await page.click('[data-wall-assemblies-menu]');
  await page.waitForSelector('[data-assembly-editor]', { timeout: 15000 });
  const lodOpts = await page.$$eval('[data-assembly-lod] option', (o) => o.map((x) => x.textContent));
  ok(lodOpts.join('|') === 'Not set|LOD 100|LOD 200|LOD 300|LOD 350|LOD 400|LOD 500' && await page.$eval('[data-assembly-lod]', (s) => s.value) === '', 'the editor lists Not set, LOD 100, 200, 300, 350, 400, 500; a starter type has none set', lodOpts);
  ok(await page.evaluate(() => [...document.querySelectorAll('[data-assembly-editor] label')].some((l) => /^Level of development \(LOD\)/.test(l.textContent))), 'the field is labelled "Level of development (LOD)"');
  await page.fill('[data-assembly-name]', 'Wall generic');
  await page.selectOption('[data-assembly-lod]', '200');
  await shot('1-editor-lod');
  await page.click('[data-assembly-save]'); await page.waitForSelector('[data-assembly-editor]', { state: 'detached' }); await settled();
  let TY = await types();
  const A = TY.find((x) => x.name === 'Wall generic');
  ok(A && A.lod === 200 && A.label === 'Wall generic [LOD 200]', 'saved: the project type "Wall generic" carries LOD 200', A);

  console.log('== a room 5000 x 4000 of "Wall generic"');
  await tool('data-wall-shapes', 'wrect');
  await planClick(0, 0); await planClick(5000, 4000); await settled();
  let W = await walls();
  const T = W[0].t, S0 = hz(W, 0), E0 = vt(W, 5000), N0 = hz(W, 4000), W0 = vt(W, 0);
  const typeOf = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ guid: w.guid, typeKey: w.typeKey, t: w.t, a: w.a, b: w.b })));
  ok(W.length === 4 && (await typeOf()).every((w) => w.typeKey === A.key) && near(T, A.t), 'four walls of "Wall generic", ' + T + ' mm thick');
  const roomArea = () => page.evaluate(() => Math.max(...window.bimcraftPlan.state.loops.rooms.map((r) => r.area)));
  const area0 = await roomArea();
  ok(near(area0, (5000 - T) * (4000 - T), AT), 'the room: (5000 - ' + T + ') x (4000 - ' + T + ') = ' + Math.round((5000 - T) * (4000 - T)) + ' mm2', area0);

  console.log('== a second type: a thicker copy tagged LOD 300');
  await tool(null, 'select');
  await page.click('[data-wall-assemblies-menu]');
  await page.waitForSelector('[data-assembly-editor]', { timeout: 15000 });
  ok(await page.$eval('[data-assembly-lod]', (s) => s.value) === '200' && await page.$eval('[data-assembly-name]', (i) => i.value) === 'Wall generic', 'the editor opens "Wall generic" with LOD 200 chosen');
  await page.click('[data-assembly-duplicate]');
  await page.fill('[data-assembly-name]', 'Wall specific, built up');
  await page.selectOption('[data-assembly-lod]', '300');
  // the core (the thickest layer) gets 60 mm thicker
  const grown = await page.evaluate(() => { const ins = [...document.querySelectorAll('[data-assembly-layers] input[aria-label^="Thickness"]')]; let best = null, bv = -1; for (const i of ins) { const v = parseFloat(i.value); if (v > bv) { bv = v; best = i; } } best.value = (bv + 60) + ' mm'; best.dispatchEvent(new Event('input', { bubbles: true })); return bv; });
  await page.click('[data-assembly-save]'); await page.waitForSelector('[data-assembly-editor]', { state: 'detached' }); await settled();
  TY = await types();
  const B = TY.find((x) => x.name === 'Wall specific, built up');
  ok(B && B.lod === 300 && B.t > T + 59 && B.t < T + 61 && (await typeOf()).every((w) => w.typeKey === A.key), 'saved: "Wall specific, built up", LOD 300, ' + (B && B.t) + ' mm (the core, shown as ' + grown + ', typed as ' + (grown + 60) + ' mm); the drawn walls keep "Wall generic"', B);
  const D = B.t - T;

  console.log('== BK.7 / BK.16 the Swap type list');
  await page.click('[data-wall-tools] > summary');
  const btn = await page.evaluate(() => { const b = document.querySelector('[data-wall-tools] [data-wall-swaptype]'); return { shown: !!b && b.offsetParent !== null, label: b?.textContent.trim(), icon: b?.querySelector('[data-ccic]')?.dataset.ccic || '', title: b?.getAttribute('title') || b?.getAttribute('data-bs-original-title') || b?.getAttribute('aria-label') || '' }; });
  ok(btn.shown && btn.label === 'Swap type' && btn.icon === 'wallswaptype', 'Edit › Walls shows Swap type with its own wall icon (wallswaptype)', btn);
  await page.click('[data-wall-swaptype]'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.bimcraftTypeSwap.state.open && !document.querySelector('[data-typeswap]') && !document.querySelector('dialog[open]') && document.body.innerText.includes('Pick the walls to change first')), 'with no wall picked it says "Pick the walls to change first …" and shows nothing over the drawing');
  // the plan still works: pick the south and north walls; the list shows in their Properties block
  await pickKeys([S0.key, N0.key]); await page.waitForSelector('[data-model-props] [data-typeswap]'); await page.waitForTimeout(300);
  const where = () => page.evaluate(() => {
    const p = document.querySelector('[data-typeswap]'), r = p.getBoundingClientRect(), host = p.closest('[data-model-props]'), hr = host?.getBoundingClientRect();
    const over = (sel) => [...document.querySelectorAll(sel)].filter((e) => e.offsetParent !== null).some((e) => { const q = e.getBoundingClientRect(); return q.width > 0 && r.left < q.right - 1 && r.right > q.left + 1 && r.top < q.bottom - 1 && r.bottom > q.top + 1; });
    return { tag: p.tagName, pos: getComputedStyle(p).position, inProps: !!host, inside: !!hr && r.left >= hr.left - 1 && r.right <= hr.right + 1, w: Math.round(r.width), overPlan: over('[data-plan-wrap] canvas'), overBar: over('.bc-modelbar, [data-wall-tools], [data-mb-library]'), overLeft: over('[data-levels]'), x: p.querySelector('[data-typeswap-close]').classList.contains('shell-x'), modal: !!document.querySelector('dialog[open]'), dd: p.parentElement.className };
  });
  let at0 = await where();
  ok(at0.tag !== 'DIALOG' && !at0.modal && at0.pos === 'static' && at0.inProps && at0.inside && /bc-mp-wide/.test(at0.dd) && at0.x, 'the list is not a dialog and not a floating box: it is a wide row inside the picked walls\' block in Properties (' + at0.w + ' px wide); its close x is the shared small x', at0);
  ok(!at0.overPlan && !at0.overBar && !at0.overLeft, 'it covers neither the plan, the Draw bar nor the Levels panel', at0);
  const panel = await page.evaluate(() => { const p = document.querySelector('[data-typeswap]'); return { rows: [...p.querySelectorAll('[data-typeswap-key]')].map((b) => ({ key: b.dataset.typeswapKey, text: b.textContent, lod: b.querySelector('[data-lod]').dataset.lod, disabled: b.disabled })) }; });
  const rowA = panel.rows.find((r) => r.key === A.key), rowB = panel.rows.find((r) => r.key === B.key);
  ok(rowA && rowB && rowA.lod === '200' && rowB.lod === '300' && /Wall generic/.test(rowA.text) && /LOD 200/.test(rowA.text) && /Wall specific, built up/.test(rowB.text) && /LOD 300/.test(rowB.text) && panel.rows.some((r) => r.lod === '' && /No LOD/.test(r.text)), 'each type shows its thickness and tag: "Wall generic … LOD 200", "Wall specific, built up … LOD 300"; starter types say "No LOD"', [rowA, rowB]);
  const picked = await page.evaluate(() => { const p = document.querySelector('[data-typeswap]'); return { line: p.querySelector('[data-typeswap-picked]').textContent, a: p.querySelector('[data-typeswap-key].is-current')?.dataset.typeswapKey, cur: p.querySelector('[data-typeswap-key].is-current .bc-swap-cur')?.textContent, dis: [...p.querySelectorAll('[data-typeswap-key]:disabled')].map((b) => b.dataset.typeswapKey) }; });
  ok(/^Walls picked: 2\. 2 × Wall generic \[LOD 200\]$/.test(picked.line) && picked.a === A.key && /: 2$/.test(picked.cur) && picked.dis.join() === A.key, 'two walls picked: it says "Walls picked: 2. 2 × Wall generic [LOD 200]", their type is marked and cannot be chosen again', picked);
  await pickKeys([S0.key]); await page.waitForTimeout(300);
  ok(/^Walls picked: 1\./.test(await page.$eval('[data-typeswap-picked]', (p) => p.textContent)), 'it follows the pick (one wall: "Walls picked: 1.")');
  await pickKeys([S0.key, N0.key]); await page.waitForTimeout(300);
  await page.fill('[data-typeswap-find]', 'lod 300');
  ok((await page.$$eval('[data-typeswap-key]', (b) => b.map((x) => x.dataset.typeswapKey))).join() === B.key, 'Find "lod 300" leaves the one LOD 300 type');
  await shot('2-swap-list');

  console.log('== swap the two walls from the list: one step, the report');
  const undoN = () => page.evaluate(() => window.bimcraftRes.api.ed().changes.length);
  const n0 = await undoN();
  await page.click(`[data-typeswap-key="${B.key}"]`); await settled(); await page.waitForTimeout(300); await page.waitForSelector('[data-model-props] [data-typeswap-report]:not([hidden])');
  let TW = await typeOf();
  const tw = (g) => TW.find((w) => w.guid === g);
  ok(await undoN() === n0 + 1 && tw(S0.guid).typeKey === B.key && tw(N0.guid).typeKey === B.key && near(tw(S0.guid).t, B.t, 0.2) && tw(E0.guid).typeKey === A.key && tw(W0.guid).typeKey === A.key, 'one undo step: the south and north walls are "Wall specific, built up" (' + B.t + ' mm), east and west unchanged');
  ok(near(tw(S0.guid).a[1], 0, 0.01) && near(tw(N0.guid).a[1], 4000, 0.01), 'both kept their location line (the centre line: y = 0 and y = 4000)');
  // each inside face moves in by D / 2: the room is (5000 - T) x (4000 - T - D)
  const area1 = await roomArea(), want1 = (5000 - T) * (4000 - T - D);
  ok(near(area1, want1, AT), 'the room is now (5000 - ' + T + ') x (4000 - ' + T + ' - ' + Math.round(D * 100) / 100 + ') = ' + Math.round(want1) + ' mm2', area1);
  const rep = await page.evaluate(() => { const p = document.querySelector('[data-typeswap-report]'); return { hidden: p.hidden, role: p.getAttribute('role'), head: p.querySelector('h4')?.textContent, lines: [...p.querySelectorAll('li')].map((l) => ({ k: l.dataset.rep, t: l.textContent })), R: JSON.parse(JSON.stringify(window.bimcraftTypeSwap.state.report)), status: document.querySelector('[data-status], .bc-status, [data-statusbar]')?.textContent || '' }; });
  const line = (k) => rep.lines.find((l) => l.k === k)?.t || '';
  ok(!rep.hidden && rep.role === 'status' && rep.head === 'What moved' && await page.evaluate(() => !document.querySelector('dialog[open]') && !!document.querySelector('[data-model-props] [data-typeswap]')), 'the report shows under the list as "What moved"; no dialog opened, the list stays in Properties');
  ok(line('walls') === 'Walls changed: 2. They are now Wall specific, built up [LOD 300].' && /^Thickness: .+ to .+\.$/.test(line('thick')) && line('lod.up') === 'Level of development raised: LOD 200 to LOD 300.', 'it says: 2 walls changed to "Wall specific, built up [LOD 300]", the thickness, LOD raised 200 to 300', rep.lines);
  ok(rep.R.walls.changed === 2 && rep.R.walls.thicker === 2 && rep.R.walls.shifted === 0 && rep.R.lod.kind === 'up' && rep.R.openings.rehosted === 0 && line('noopenings') === 'No door or window was affected.', 'no door or window in these walls: it says so');
  ok(rep.R.rooms.changed === 1 && near(rep.R.rooms.list[0].before, area0, AT) && near(rep.R.rooms.list[0].after, want1, AT) && near(rep.R.rooms.delta, -(5000 - T) * D, AT), 'one room changed: ' + Math.round(area0) + ' → ' + Math.round(want1) + ' mm2 (-(5000 - T) x D = ' + Math.round(-(5000 - T) * D) + ')', rep.R.rooms);
  const m2 = (v) => (Math.round(v / 1e4) / 100).toFixed(2) + ' m²';
  ok(line('rooms') === 'Rooms whose area changed: 1. Together ' + m2(area0) + ' to ' + m2(want1) + ' (-' + m2((5000 - T) * D) + ').' && line('room').endsWith(': ' + m2(area0) + ' to ' + m2(want1) + ' (-' + m2((5000 - T) * D) + ')'), 'in words: "' + line('rooms') + '" and the room\'s own line', [line('rooms'), line('room')]);
  const statusText = await page.evaluate(() => document.body.innerText.includes('Walls swapped to Wall specific, built up [LOD 300]: 2. Doors and windows hosted again: 0. Rooms whose area changed: 1.'));
  ok(statusText, 'the status bar says it in one line');
  await page.fill('[data-typeswap-find]', '');
  const after = await page.evaluate(() => { const p = document.querySelector('[data-typeswap]'); return { line: p.querySelector('[data-typeswap-picked]').textContent, cur: [...p.querySelectorAll('[data-typeswap-key].is-current')].map((b) => b.dataset.typeswapKey) }; });
  ok(/2 × Wall specific, built up \[LOD 300\]$/.test(after.line) && after.cur.join() === B.key, 'the walls stay picked and the list now marks the new type', after);
  await shot('3-swap-report');
  console.log('== where it sits: light and dark, 1440 x 900 and 1920 x 1080');
  for (const [w, h] of [[1440, 900], [1920, 1080]]) for (const space of ['paper', 'model']) {
    await page.setViewportSize({ width: w, height: h });
    await page.click(`.space-toggle button[value="${space}"]`).catch(() => {});
    await page.waitForTimeout(500);
    await page.evaluate(() => document.querySelector('[data-typeswap]')?.scrollIntoView({ block: 'nearest' }));
    const g = await where(), theme = await page.evaluate(() => document.documentElement.getAttribute('data-space'));
    const col = await page.evaluate(() => { const p = document.querySelector('[data-typeswap]'), c = getComputedStyle(p), n = getComputedStyle(p.querySelector('.bc-swap-name')); const lum = (x) => { const m = x.match(/[\d.]+/g).map(Number); return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255; }; return { bg: lum(c.backgroundColor), ink: lum(n.color) }; });
    ok(theme === space && g.inProps && g.inside && g.pos === 'static' && !g.overPlan && !g.overBar && !g.overLeft && Math.abs(col.bg - col.ink) > 0.4, w + ' x ' + h + ', ' + (space === 'paper' ? 'light' : 'dark') + ': inside Properties (' + g.w + ' px wide), over nothing else; text and background are far apart (luminance ' + col.ink.toFixed(2) + ' on ' + col.bg.toFixed(2) + ')', [g, col, theme]);
    await shot('4-' + w + 'x' + h + '-' + (space === 'paper' ? 'light' : 'dark'));
  }
  await page.setViewportSize({ width: 1440, height: 900 }); await page.click('.space-toggle button[value="paper"]').catch(() => {}); await page.waitForTimeout(400);

  console.log('== undo: one step puts both walls back');
  await undo();
  TW = await typeOf();
  ok(tw(S0.guid).typeKey === A.key && tw(N0.guid).typeKey === A.key && near(tw(S0.guid).t, T, 0.2) && near(await roomArea(), area0, AT) && await undoN() === n0, 'one Undo: both walls are "Wall generic" again and the room is ' + Math.round(area0) + ' mm2 again');

  console.log('== Properties › Type shows the tags and uses the same swap');
  await pickKeys([E0.key, W0.key]); await page.waitForTimeout(400);
  const props = await page.evaluate(() => { const s = document.querySelector('[data-mp-type]'); return { opts: s ? [...s.options].map((o) => o.textContent) : [], list: !!document.querySelector('[data-model-props] [data-typeswap]'), under: (() => { const a = document.querySelector('[data-mp-type]'), b = document.querySelector('[data-typeswap]'); return !!a && !!b && a.getBoundingClientRect().bottom <= b.getBoundingClientRect().top + 1; })() }; });
  ok(props.opts.includes('Wall generic [LOD 200]') && props.opts.includes('Wall specific, built up [LOD 300]') && props.list && props.under, 'the Type list in Properties reads "Wall generic [LOD 200]", "Wall specific, built up [LOD 300]"; the open Swap type list sits right under it', props);
  const n1 = await undoN();
  await page.selectOption('[data-mp-type]', B.key); await settled(); await page.waitForTimeout(300);
  TW = await typeOf();
  const R2 = await page.evaluate(() => JSON.parse(JSON.stringify(window.bimcraftTypeSwap.state.report)));
  // east and west on their centre lines: the room is (5000 - T - D) x (4000 - T)
  ok(await undoN() === n1 + 1 && tw(E0.guid).typeKey === B.key && tw(W0.guid).typeKey === B.key && R2.walls.changed === 2 && R2.rooms.changed === 1 && near(R2.rooms.list[0].after, (5000 - T - D) * (4000 - T), AT) && near(await roomArea(), (5000 - T - D) * (4000 - T), AT), 'choosing the type there swaps both picked walls in one step and reports: room → (5000 - T - D) x (4000 - T) = ' + Math.round((5000 - T - D) * (4000 - T)) + ' mm2', R2.rooms);
  await undo();
  ok((await typeOf()).every((w) => w.typeKey === A.key), 'one Undo: back');
  await pickKeys([E0.key, W0.key]); await page.waitForTimeout(300);
  await page.click('[data-typeswap-close]'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => !document.querySelector('[data-typeswap]') && document.querySelector('[data-model-props] [data-mp-swap]')?.textContent === 'Swap type…'), 'the x closes the list: Properties shows the Swap type… button again');
  await pickKeys([E0.key]); await page.waitForTimeout(300);
  await page.click('[data-mp-swap]'); await page.waitForTimeout(200);
  ok(await page.evaluate(() => !!document.querySelector('[data-model-props] [data-typeswap]')) && /Walls picked: 1\./.test(await page.$eval('[data-typeswap-picked]', (p) => p.textContent)), 'Properties › Swap type… opens it for the picked wall');
  ok(await page.evaluate(() => { const r = document.querySelector('[data-typeswap-report]'); return !r || r.hidden; }), 'the report of the swap that Undo took back is not shown any more');
  await page.click('[data-typeswap-close]');

  console.log('== BK.16 the tag in the Wall tool\'s type list and in the wall schedule');
  await tool(null, 'wall');
  const wt = await page.$$eval('[data-model-walltype] option', (o) => o.map((x) => x.textContent));
  ok(wt.some((x) => /^Wall generic \(.+\) \[LOD 200\]$/.test(x)) && wt.some((x) => /^Wall specific, built up \(.+\) \[LOD 300\]$/.test(x)) && wt.some((x) => !/LOD/.test(x)), 'the Wall tool\'s Type list reads "Wall generic (…) [LOD 200]", "Wall specific, built up (…) [LOD 300]"; starter types carry no tag', wt.filter((x) => /Wall /.test(x)));
  await tool(null, 'select');
  const sched = async () => page.evaluate(() => { const k = document.querySelector('[data-msched-kind]'); k.value = 'walls'; k.dispatchEvent(new Event('change', { bubbles: true })); const t = document.querySelector('[data-msched]'); return { head: [...t.querySelectorAll('thead th')].map((x) => x.textContent), rows: [...t.querySelectorAll('tbody tr')].map((r) => [...r.children].map((c) => c.textContent)) }; });
  const sc0 = await sched();
  const setCol = (on) => page.evaluate((on) => { const c = document.querySelector('[data-walls-settings] [name="bcWallLodCol"]'); if (!c) return null; c.checked = on; c.dispatchEvent(new Event('change', { bubbles: true })); return JSON.parse(localStorage.getItem('bimcraft.walls') || '{}').lodcol; }, on);
  const stored = await setCol(true); await page.waitForTimeout(300);
  const sc1 = await sched();
  ok(!sc0.head.includes('LOD') && stored === 'on' && sc1.head.at(-1) === 'LOD' && sc1.head.length === sc0.head.length + 1 && sc1.rows.find((r) => r[0] === 'Wall generic')?.at(-1) === 'LOD 200', 'Settings › BimCraft › Walls › "Show each wall type\'s LOD in the wall schedule": off by default; on adds a last column LOD ("Wall generic": LOD 200)', [sc0.head, sc1.head, sc1.rows]);
  await setCol(false); await page.waitForTimeout(200);
  ok(!(await sched()).head.includes('LOD'), 'off again: the column is gone');

  const real = problems.filter((p) => !(/429/.test(p) && [...throttled].some((u) => /hardware/.test(u))));
  ok(real.length === 0, 'no console errors', real.slice(0, AT));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'stopped.png') }).catch(() => {});
} finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
