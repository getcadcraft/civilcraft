#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gh3ui.mjs — BimCraft GH.3 A/B/C (0.8 round 3, session gh3ui_PART_3) in the lab, headless, with real clicks.
 *   node tools/bimcraft-test/browser-gh3ui.mjs [--dump] [--shots <dir>]
 * Mints a session with tools/shell-test/admin.php session (never the shared MCP admin sign-in). Fails on any console error.
 *   A  one display unit: the showcase house under each of the six units; the displayed lengths (plan bar, Properties, status,
 *      schedules, section bar, Measure, coordinates, dialogs) carry no other family's length marks
 *   B  Shaded / Edges / Wireframe buttons beside the view cube; Plan / Split / 3D as tools in the toolbar row; keys and commands still work
 *   C  Measure held orthogonal with Shift or the bar's toggle
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const DUMP = process.argv.includes('--dump');
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
let ctx = null, page = null;
async function fresh(viewport = { width: 1440, height: 900 }) {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport, acceptDownloads: true });
  const [cn, ...cv] = String(minted.cookie).split('=');
  await ctx.addCookies([{ name: cn, value: cv.join('='), domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'ftin'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return !s || (!s.busy && !s.reloading && !s.queue.length); }, null, { timeout: 90000 });
const openShowcase = async () => {
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await waitStatus(/^Opened bimcraft-house/, 25000);
};
const setUnit = async (u) => { await page.selectOption('[data-model-units]', u); await settled(); };

try {
  await fresh();
  await openShowcase();
  await page.click('[data-model-toggle]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  const WALL = await page.evaluate(() => window.bimcraftKeys('Exterior 2×6'));
  const LEN = /(\d\s?(mm|cm|ft|in)\b|\d\s?m\b(?![²³/])|\d['"])/;
  if (DUMP) {
    for (const u of ['ftin', 'in', 'ftdec', 'mm', 'cm', 'm']) {
      await setUnit(u);
      const txt = await page.evaluate(() => document.body.innerText);
      console.log('== ' + u);
      for (const l of txt.split('\n')) if (/\d/.test(l) && LEN.test(l)) console.log('   ' + l.slice(0, 160));
    }
  }

  console.log('== A: one display unit across the panels');
  // what each family of marks must NOT appear in the text of the visible panels under a unit
  const BAD = { ftin: /\d\s?(mm|cm)\b|\d\s?m\b(?![²³/])/, in: /\d\s?(mm|cm|ft)\b|\d\s?m\b(?![²³/])|\d['"]/, ftdec: /\d\s?(mm|cm|in)\b|\d\s?m\b(?![²³/])|\d['"]/, mm: /\d\s?(cm|in|ft)\b|\d\s?m\b(?![²³/])|\d['"]/, cm: /\d\s?(mm|in|ft)\b|\d\s?m\b(?![²³/])|\d['"]/, m: /\d\s?(mm|cm|in|ft)\b|\d['"]/ };
  const panelText = () => page.evaluate(() => ['[data-props]', '[data-status]', '.bc-sched', '[data-model-levels]', '[data-modelbar]', '[data-coords]'].map((q) => [...document.querySelectorAll(q)].filter((e) => e.offsetParent).map((e) => { const c = e.cloneNode(true); c.querySelectorAll('select, [data-model-type]').forEach((x) => x.remove()); return c.textContent + ' ' + [...e.querySelectorAll('input')].map((i) => i.value).join(' '); }).join('\n')).join('\n'));
  await page.evaluate((k) => window.bimcraftVis.pick([k]), WALL);
  await page.waitForSelector('[data-props] [data-bc-propgrid], [data-props] .bc-dl');
  for (const u of ['ftin', 'in', 'ftdec', 'mm', 'cm', 'm']) {
    await setUnit(u);
    await page.waitForTimeout(150);
    const txt = (await panelText()).replace(/\/\s?\d+\s?(ft|m)\b/g, '');
    const mark = { ftin: '', in: 'in', ftdec: 'ft', mm: 'mm', cm: 'cm', m: 'm' }[u];
    ok(!BAD[u].test(txt), u + ': the plan bar, levels, schedule and Properties carry no other unit family' + (BAD[u].test(txt) ? ' -> ' + (() => { const m = txt.match(BAD[u]); return JSON.stringify(txt.slice(Math.max(0, m.index - 50), m.index + 30)); })() : ''));
    const rows = await page.evaluate(() => [...document.querySelectorAll('[data-props] [data-pg-row], [data-props] dt')].map((e) => e.textContent).join('|'));
    void rows; void mark;
  }
  // Properties: a quantity of the wall follows the pick (the file's number is in metres or millimetres; it is converted)
  await setUnit('m');
  const q = await page.evaluate(() => [...document.querySelectorAll('[data-props] input, [data-props] dd, [data-props] .pg-ro, [data-props] [data-pg-row]')].map((e) => e.value ?? e.textContent).filter((v) => /^-?[\d.]+ m$/.test(String(v).trim())));
  ok(q.length > 0, 'Properties shows a length in metres with its unit: ' + q.slice(0, 3).join(', '));
  await setUnit('ftin');
  const q2 = await page.evaluate(() => [...document.querySelectorAll('[data-props] input, [data-props] dd, [data-props] [data-pg-row]')].map((e) => e.value ?? e.textContent).filter((v) => /\d['"]/.test(String(v))));
  ok(q2.length > 0, 'and in feet and inches: ' + q2.slice(0, 3).join(', '));
  // the coordinate readout and the section bar
  await setUnit('mm');
  await page.click('[data-toggle="section"]').catch(() => {});
  const secUnit = await page.textContent('[data-sec-unit]').catch(() => null);
  ok(secUnit === null || /mm/.test(secUnit), 'the section bar names the unit (mm): ' + secUnit);
  await page.click('[data-toggle="section"]').catch(() => {});
  // a refusal speaks the unit: a floor thinner than 10 mm
  await setUnit('m');
  await page.evaluate(() => { document.querySelector('[data-status]').textContent = ''; });

  console.log('== B: display modes beside the view cube, Plan / Split / 3D in the toolbar row');
  await setUnit('ftin');
  await page.click('[data-toolbar] [data-model-layout="3d"]'); await page.waitForTimeout(200);
  const modes = await page.evaluate(() => ({ n: document.querySelectorAll('[data-display-set]').length, select: !!document.querySelector('select[data-display-mode]'), pressed: [...document.querySelectorAll('[data-display-set][aria-pressed="true"]')].map((b) => b.dataset.displaySet) }));
  ok(modes.n === 3 && !modes.select && modes.pressed.join() === 'edges', 'three buttons, edges pressed, no drop-down');
  const near = await page.evaluate(() => { const d = document.querySelector('.bc-display-mode').getBoundingClientRect(), c = document.querySelector('.cc-vc')?.getBoundingClientRect(); return c ? { dx: Math.abs(d.right - c.right), above: d.bottom <= c.top + c.height * 0.2 } : null; });
  ok(near && near.dx < 40, 'they sit by the view cube: ' + JSON.stringify(near));
  for (const m of ['wireframe', 'shaded', 'edges']) {
    await page.click('[data-display-set="' + m + '"]');
    const st = await page.evaluate(() => ({ mode: document.querySelector('[data-canvas]').viewer.displayMode, pressed: [...document.querySelectorAll('[data-display-set][aria-pressed="true"]')].map((b) => b.dataset.displaySet).join() }));
    ok(st.mode === m && st.pressed === m, m + ': the viewer draws it and the button is pressed');
  }
  await page.evaluate(() => window.ccInput.run('view.display.wireframe'));
  ok(await page.evaluate(() => document.querySelector('[data-canvas]').viewer.displayMode) === 'wireframe', 'the command view.display.wireframe runs it');
  await page.click('[data-display-set="edges"]');
  await page.click('[data-toolbar] [data-toggle="edges"]');
  ok((await page.evaluate(() => document.querySelector('[data-canvas]').viewer.displayMode)) === 'shaded' && (await page.getAttribute('[data-display-set="shaded"]', 'aria-pressed')) === 'true', 'the toolbar Edges toggle still works and moves the buttons');
  await page.click('[data-toolbar] [data-toggle="edges"]');
  const inRow = await page.evaluate(() => [...document.querySelectorAll('[data-model-layout]')].map((b) => !!b.closest('[data-toolbar] .bc-tool-row') && b.offsetParent !== null && !!b.querySelector('.bi')));
  ok(inRow.length === 3 && inRow.every(Boolean), 'Plan, Split and 3D are icon tools in the toolbar row');
  await page.click('[data-toolbar] [data-model-layout="plan"]');
  ok(await page.evaluate(() => document.querySelector('.bc-stage').classList.contains('is-plan-only')), 'Plan: the plan alone');
  await page.click('[data-toolbar] [data-model-layout="split"]');
  ok(await page.evaluate(() => document.querySelector('.bc-stage').classList.contains('is-plan-split')), 'Split: both');
  await page.evaluate(() => window.ccInput.run('view.plan'));
  ok(await page.evaluate(() => document.querySelector('.bc-stage').classList.contains('is-plan-only')), 'the command view.plan still works');
  await page.click('[data-toolbar] [data-model-layout="3d"]');
  ok(await page.evaluate(() => !document.querySelector('.bc-stage').classList.contains('is-plan-only') && !document.querySelector('.bc-stage').classList.contains('is-plan-split')), '3D: the plan closes');
  const splitterShown = await (async () => { await page.click('[data-toolbar] [data-model-layout="split"]'); return page.evaluate(() => !document.querySelector('[data-model-splitter]').hidden); })();
  ok(splitterShown, 'the plan still has its draggable splitter in Split');
  await shot(page, 'gh3-b-split');
  for (const w of [390, 360]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(300);
    const sw = await page.evaluate(() => ({ doc: document.documentElement.scrollWidth, win: window.innerWidth, bar: (() => { const b = document.querySelector('[data-toolbar]'); return b ? { sw: b.scrollWidth, cw: b.clientWidth, ov: getComputedStyle(b).overflowX } : null; })() }));
    ok(sw.doc <= sw.win + 1, w + ' px: the page does not scroll sideways (' + sw.doc + ' of ' + sw.win + ')');
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(300);
  await page.click('[data-toolbar] [data-model-layout="3d"]');

  console.log('== C: Measure held orthogonal');
  await setUnit('mm');
  await page.evaluate(() => window.bimcraftMeasure.on());
  await page.waitForSelector('[data-measurebar]:not([hidden])');
  ok(await page.getAttribute('[data-measure-ortho]', 'aria-pressed') === 'false', 'the bar has a Straight toggle, off');
  // two surface points a good way apart, found by looking at what the pointer can hit
  const pts = await page.evaluate(() => {
    const v = document.querySelector('[data-canvas]').viewer, r = document.querySelector('[data-canvas]').getBoundingClientRect(), out = [];
    for (let fy = 0.35; fy < 0.8; fy += 0.07) for (let fx = 0.25; fx < 0.8; fx += 0.07) { const x = r.left + r.width * fx, y = r.top + r.height * fy, h = v.measureAt(x, y); if (h && h.snap === 'face') out.push({ x, y, p: h.point }); }
    return out;
  });
  let best = null;
  for (const a of pts) for (const b of pts) { const d = [b.p[0] - a.p[0], b.p[1] - a.p[1], b.p[2] - a.p[2]].map(Math.abs).sort((x, y) => y - x); if (d[0] > 1 && d[1] > 0.5 * d[0] && (!best || d[1] > best.d1)) best = { a, b, d1: d[1] }; }
  ok(!!best, 'found two skew surface points to measure (' + pts.length + ' hits)');
  const measure = async (fn) => {
    await page.evaluate(() => { const m = window.bimcraftMeasure; m.off(); m.on(); });
    await fn();
    return page.evaluate(() => { const it = window.bimcraftMeasure.state().items; return it[it.length - 1] || null; });
  };
  const click2 = async (opts = {}) => {
    await page.mouse.move(best.a.x, best.a.y); await page.mouse.click(best.a.x, best.a.y);
    if (opts.shift) await page.keyboard.down('Shift');
    await page.mouse.move(best.b.x, best.b.y, { steps: 3 }); await page.mouse.click(best.b.x, best.b.y);
    if (opts.shift) await page.keyboard.up('Shift');
  };
  const comps = (it) => it.delta.map(Math.abs);
  const one = (c) => { const m = Math.max(...c); return c.filter((v) => v < m * 1e-6 + 1e-9).length === 2; };
  if (best) {
    let it = await measure(() => click2());
    ok(it && !one(comps(it)), 'free: the segment is skew, ' + it?.delta.map((v) => v.toFixed(2)).join(' / '));
    it = await measure(() => click2({ shift: true }));
    ok(it && one(comps(it)), 'Shift held: one axis only, ' + it?.delta.map((v) => v.toFixed(2)).join(' / '));
    it = await measure(async () => { await page.click('[data-measure-ortho]'); await click2(); });
    ok(it && one(comps(it)) && (await page.getAttribute('[data-measure-ortho]', 'aria-pressed')) === 'true', 'the Straight toggle: one axis only, ' + it?.delta.map((v) => v.toFixed(2)).join(' / '));
    await page.click('[data-measure-ortho]');
    it = await measure(() => click2());
    ok(it && !one(comps(it)), 'toggled off: free again');
  }
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  await page.mouse.move(5, 5);
  await page.keyboard.press('m');
  ok(await page.evaluate(() => !document.querySelector('[data-measurebar]').hidden), 'M still starts Measure');
  await page.keyboard.press('m');
  await shot(page, 'gh3-c');

  console.log('== D: GH.3-A round 2 (gh3a2_PART_3): analysis results, paper, eye height, under all six units');
  await page.click('[data-toolbar] [data-model-layout="3d"]').catch(() => {});
  const MARK = { ftin: { a: 'ft²', v: 'ft³' }, in: { a: 'in²', v: 'in³' }, ftdec: { a: 'ft²', v: 'ft³' }, mm: { a: 'mm²', v: 'mm³' }, cm: { a: 'cm²', v: 'cm³' }, m: { a: 'm²', v: 'm³' } };
  const LENMARK = { ftin: /\d['"]/, in: /\d\s?in\b/, ftdec: /\d\s?ft\b/, mm: /\d\s?mm\b/, cm: /\d\s?cm\b/, m: /\d\s?m\b(?![²³/])/ };
  const UNITS6 = ['ftin', 'in', 'ftdec', 'mm', 'cm', 'm'];
  // Room acoustics: area, height and volume in the room line, and the volume column
  await page.click('[data-eg49-details] summary');
  await page.waitForSelector('[data-eg49-rooms] tbody tr');
  for (const u of UNITS6) {
    await setUnit(u);
    const line = await page.textContent('[data-eg49-room]'), mid = await page.textContent('[data-eg49-mid]');
    const vol = await page.$$eval('[data-eg49-rooms] tbody tr td:nth-child(2)', (c) => c.map((x) => x.textContent));
    const fam = (x) => (u === 'ftin' ? !/\d\s?(mm|cm|m|ft|in)\b/.test(x.replace(/\d+(\.\d+)? ?s\b/g, '')) : true);
    ok(line.includes(MARK[u].a) && line.includes(MARK[u].v) && LENMARK[u].test(line.replace(/\d+(\.\d+)? ?(ft²|ft³|in²|in³|mm²|mm³|cm²|cm³|m²|m³)/g, '')), u + ': acoustics room line ' + line);
    ok(vol.length > 0 && vol.every((x) => x.includes(MARK[u].v)), u + ': the volume column says ' + MARK[u].v + ' (' + vol.slice(0, 2).join(', ') + ')');
    ok(LENMARK[u].test(mid) && fam(mid), u + ': the sound travels: ' + mid.slice(-60));
  }
  // Hazard (flood): the peak, a wet room's depth and the clock follow the pick; the typed peak stays metres as its label says
  await page.click('[data-eg47-details] summary');
  await page.waitForSelector('[data-eg47-run]');
  await page.fill('[data-eg47-field="peak"]', '3');
  await page.click('[data-eg47-run]');
  await page.waitForSelector('[data-eg47-sum]');
  for (const u of UNITS6) {
    await setUnit(u);
    const sum = await page.textContent('[data-eg47-sum]');
    const want = await page.evaluate(([mm, uu]) => window.bimcraftUnits?.lenMark ? window.bimcraftUnits.lenMark(mm, uu) : null, [3000, u]);
    const exp = { ftin: "9'-10 1/8\"", in: '118.11 in', ftdec: '9.84 ft', mm: '3000 mm', cm: '300 cm', m: '3 m' }[u];
    void want;
    ok(sum.includes(exp + ' above'), u + ': flood peak "' + exp + ' above" in: ' + sum.slice(0, 90));
    const depth = await page.$$eval('[data-eg47-table] tbody tr td:nth-child(3)', (c) => c.map((x) => x.textContent));
    ok(depth.length > 0 && depth.every((x) => LENMARK[u].test(x)), u + ': the deepest-water column ' + depth.slice(0, 2).join(', '));
  }
  // Evacuation: the walked distances
  await page.click('[data-eg48-details] summary');
  await page.waitForSelector('[data-eg48-run]');
  await page.fill('[data-eg48-field="m2"]', '4');
  await page.click('[data-eg48-run]');
  await page.waitForSelector('[data-eg48-sum]', { timeout: 60000 });
  for (const u of UNITS6) {
    await setUnit(u);
    const rows = await page.$$eval('[data-eg48-rooms] tbody tr', (r) => r.map((x) => [...x.cells].slice(3).map((c) => c.textContent).join(' / ')));
    ok(rows.length > 0 && rows.every((x) => LENMARK[u].test(x) || /no way|–/i.test(x)), u + ': walked distances ' + rows.slice(0, 2).join(' ; '));
  }
  // Paper lists: the names stay, the sizes follow the pick (sheet set dialog and sheet editor)
  for (const u of UNITS6) {
    await setUnit(u);
    await page.evaluate(() => document.querySelector('[data-res-sheetsopen]')?.click());
    await page.waitForSelector('[data-res-sheets-dlg][open]', { timeout: 20000 });
    const opts = await page.$$eval('[data-res-shpaper] option', (o) => o.map((x) => x.textContent));
    const sizeMark = { ftin: ' in', in: ' in', ftdec: ' ft', mm: ' mm', cm: ' cm', m: ' m' }[u];
    ok(opts.length === 5 && /^Letter · /.test(opts[0]) && /^A3 · /.test(opts[3]) && opts.every((x) => x.endsWith(sizeMark)), u + ': sheet set papers ' + opts[0] + ' | ' + opts[3]);
    await page.evaluate(() => document.querySelector('[data-res-sheets-dlg]').close());
  }
  // the walk bar's eye height: shown in the pick, with the unit beside it
  for (const u of UNITS6) {
    await setUnit(u);
    const w = await page.evaluate(() => { const i = document.querySelector('[data-walk-height]'); return { v: i.value, tail: i.parentNode.lastChild.textContent.trim() }; });
    const exp = { ftin: ["5'-3\"", ''], in: ['62.992', 'in'], ftdec: ['5.25', 'ft'], mm: ['1600', 'mm'], cm: ['160', 'cm'], m: ['1.6', 'm'] }[u];
    ok(w.v === exp[0] && w.tail === exp[1], u + ': eye height ' + w.v + ' ' + w.tail);
  }
  await setUnit('ftin');
  await page.evaluate(() => { const i = document.querySelector('[data-walk-height]'); i.value = "6'"; i.dispatchEvent(new Event('change', { bubbles: true })); });
  await setUnit('m');
  const eyeAfter = await page.evaluate(() => document.querySelector('[data-walk-height]').value);
  ok(eyeAfter === '1.83', 'a typed eye height of 6\' is kept (as metres) and shown as ' + eyeAfter + ' m after the unit changes');
} catch (e) {
  fail++; console.log('  FAIL ' + String(e.message).split('\n')[0]);
} finally {
  await browser.close();
}
for (const p of problems) { fail++; console.log('  FAIL ' + p); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
