#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-modify.mjs — BimCraft's Move, Align and Distribute (0.8 D8.3, session `bim-08`) in the lab, headless, with real clicks and keys.
 *   node tools/bimcraft-test/browser-modify.mjs [--shots <dir>]
 * Run as root. One walk: two walls drawn, Shift+M (Move; M stays Measure), base point + second point, Copy with C, a typed
 * distance, Align, Undo; then an OBJ file opened (SU.1055). Fails on any console error.
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
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? process.argv[oi + 1].split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bim08modify'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

// BimCraft opens drawings in 3D by default (Settings › BimCraft › Drawings open in); these checks are written for the 2D view,
// so every page starts with "2D" unless the test itself sets bimcraft.settings.dwgStart.
{
  const pin2d = () => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch { /* another origin */ } };
  const nc = browser.newContext.bind(browser), np = browser.newPage.bind(browser);
  browser.newContext = async (...a) => { const c = await nc(...a); await c.addInitScript(pin2d); return c; };
  browser.newPage = async (...a) => { const p = await np(...a); await p.addInitScript(pin2d); return p; };
}
const problems = [];
let ctx = null, page = null;
/** A fresh browser context (its own storage: no autosave from an earlier section), signed in, on /lab/bimcraft in mm. */
async function fresh() {
  if (ctx) await ctx.close();
  ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('bimcraft.render'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
}
/** File › New building from the empty start page: n levels of h mm. */
async function newBuilding(name, n = 2, h = 3000) {
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', name);
  await page.fill('[data-new-levels]', String(n));
  await page.fill('[data-new-height]', h + ' mm');
  await page.click('[data-new-ok]');
  await waitStatus(new RegExp('^New building ' + name));
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
}
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const statusOf = () => page.textContent('[data-status]');
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y, opts) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py, opts); };
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const pick = (keys) => page.evaluate((k) => window.bimcraftVis.pick(k), keys);
/** Open a file; when edits are waiting, answer the in-page question with "Discard". */
const openFile = async (file, re) => {
  await page.setInputFiles('[data-file]', file);
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 1500 }).catch(() => null);
  if (asked) await asked.click();
  await waitStatus(re, 120000);
};
const openShowcase = async () => {
  await openFile({ name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) }, /^Opened bimcraft-house/);
};

try {
  await fresh();
  console.log('== modify: Move, Copy, Align on drawn walls');
  await newBuilding('Mod', 1, 3000);
  await page.click('[data-mtool="wall"]');
  await planClick(1000, 1000); await planClick(5000, 1000); await page.keyboard.press('Escape');
  await planClick(1000, 3000); await planClick(4000, 3000); await page.keyboard.press('Escape');
  await settled();
  const walls = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ key: window.bimcraftRes.api.kb() + w.id, a: w.a, b: w.b })).sort((p, q) => p.a[1] - q.a[1]));
  ok((await walls()).length === 2, 'two walls drawn');
  const [w1, w2] = await walls();
  // M stays Measure; Shift+M is Move
  await pick([w1.key]);
  await page.mouse.move(10, 10);
  await page.keyboard.press('Shift+M');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'move', 'Shift+M starts Move');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool) !== 'measure', 'M is still Measure (not Move)');
  await planClick(2000, 1000); await planClick(2000, 1600);   // base, second: 600 mm up the plan
  await settled();
  let [a1] = await walls();
  ok(Math.abs(a1.a[1] - 1600) < 1 && Math.abs(a1.a[0] - 1000) < 1, 'Move by two points: the wall is 600 mm over', JSON.stringify(a1.a));
  await page.keyboard.press('Control+z'); await settled();
  [a1] = await walls();
  ok(Math.abs(a1.a[1] - 1000) < 1, 'one Undo puts it back', JSON.stringify(a1.a));
  // a typed distance along the pointer
  await pick([a1.key]);
  await planClick(2000, 1000);
  await page.mouse.move(...(await at(2000, 1500)));
  await page.keyboard.type('250');
  await page.keyboard.press('Enter');
  await settled();
  [a1] = await walls();
  ok(Math.abs(a1.a[1] - 1250) < 2, 'Move by a typed distance: 250 mm along the pointer', JSON.stringify(a1.a));
  // Copy
  await page.evaluate(() => document.activeElement?.blur());
  await pick([a1.key]);
  await page.mouse.move(10, 10);
  await page.keyboard.press('Shift+M');
  await page.keyboard.press('c');
  await planClick(2000, 1250); await planClick(2000, 2000);
  await settled();
  ok((await walls()).length === 3, 'Copy on: the move made a third wall');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  // Align: the picked walls' left ends
  const all = await walls();
  await pick(all.map((w) => w.key));
  await page.click('[data-res-tools] summary').catch(() => {});
  await page.evaluate(() => document.querySelector('[data-mtool="align"]').click());
  await page.selectOption('[data-mod-side]', 'left');
  await page.click('[data-mod-apply="align"]');
  await settled();
  const xs = (await walls()).map((w) => Math.min(w.a[0], w.b[0]));
  ok(xs.every((x) => Math.abs(x - xs[0]) < 1), 'Align left: every wall starts at the same x', xs.join());
  await shot(page, 'modify-01-aligned');
  console.log('== modify in 3D: D8.3 a base point and a second point picked inside the 3D view');
  await fresh();
  await newBuilding('Mod3d', 1, 3000);
  await page.click('[data-mtool="wall"]');
  await planClick(1000, 1000); await planClick(5000, 1000); await page.keyboard.press('Escape');
  await settled();
  const w3 = () => page.evaluate(() => window.bimcraftPlan.state.data.walls.map((w) => ({ key: window.bimcraftRes.api.kb() + w.id, a: w.a, b: w.b })));
  const [m1] = await w3();
  await page.click('[data-view="top"]');
  await page.waitForTimeout(400);
  await pick([m1.key]);
  await page.mouse.move(10, 10);
  await page.keyboard.press('Shift+M');
  ok(await page.evaluate(() => window.bimcraftPlan.state.tool) === 'move', '3D: Move is the tool');
  const cv = await page.evaluate(() => { const r = document.querySelector('[data-canvas]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  const hov = () => page.evaluate(() => window.bimcraftModify.state.hover);
  await page.mouse.move(cv[0], cv[1], { steps: 3 });
  const h0 = await hov();
  await page.mouse.move(cv[0] + 80, cv[1], { steps: 3 });
  const h1 = await hov();
  await page.mouse.move(cv[0] + 80, cv[1] - 60, { steps: 3 });
  const h2 = await hov();
  ok(h0 && h1 && Math.abs(h1[0] - h0[0]) > 20 && Math.abs(h1[1] - h0[1]) < 5, 'the pointer in the Top view gives plan points: 80 px right moves x, not y', JSON.stringify([h0, h1]));
  ok(h2 && h2[1] - h1[1] > 20 && Math.abs(h2[0] - h1[0]) < 5, 'and 60 px up moves y up the plan', JSON.stringify([h1, h2]));
  await page.mouse.move(cv[0], cv[1], { steps: 2 });
  await page.mouse.click(cv[0], cv[1]);
  const base3 = await page.evaluate(() => window.bimcraftModify.state.base);
  ok(base3 && Math.abs(base3[0] - h0[0]) < 2 && Math.abs(base3[1] - h0[1]) < 2, 'first click in 3D sets the base point', JSON.stringify(base3));
  await page.mouse.move(cv[0] + 80, cv[1] - 60, { steps: 3 });
  await page.mouse.click(cv[0] + 80, cv[1] - 60);
  await settled();
  const [m2] = await w3();
  ok(Math.abs((m2.a[0] - m1.a[0]) - (h2[0] - h0[0])) < 3 && Math.abs((m2.a[1] - m1.a[1]) - (h2[1] - h0[1])) < 3, 'second click in 3D moves the wall by that vector', JSON.stringify([m1.a, m2.a, h0, h2]));
  await page.keyboard.press('Control+z'); await settled();
  const [m3] = await w3();
  ok(Math.abs(m3.a[0] - m1.a[0]) < 1 && Math.abs(m3.a[1] - m1.a[1]) < 1, 'one Undo puts it back', JSON.stringify(m3.a));
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('[data-mtool="select"]')?.click());
  ok(await page.evaluate(() => window.bimcraftModify.state.base) === null, 'leaving Move clears the base point');
  await shot(page, 'modify-02-in3d');
  console.log('== trace: SU.1055 Trace Reference shows another level, dashed, under the plan');
  await fresh();
  await newBuilding('Trace', 2, 3000);
  await page.click('[data-mtool="wall"]');
  await planClick(1000, 1000); await planClick(5000, 1000); await page.keyboard.press('Escape');
  await settled();
  const levels = await page.evaluate(() => window.bimcraftPlan.state.data.levels.map((l) => ({ id: l.id, guid: l.guid, name: l.name })));
  const l1 = levels[0];
  await page.selectOption('[data-model-level]', String(levels[1].id));
  await settled();
  const traceSegs = () => page.evaluate(() => window.bimcraftPlan.view.scene.trace?.segs?.length || 0);
  ok(await traceSegs() === 0, 'no reference at first');
  await page.evaluate((g) => window.bimcraftTraceRef.set({ ref: g }), l1.guid);
  ok(await traceSegs() === 16, 'Level 1 as the reference: its wall (4 edges) is under Level 2', String(await traceSegs()));
  await page.evaluate(() => window.bimcraftTraceRef.set({ dx: 1000, angle: 90 }));
  const sg = await page.evaluate(() => window.bimcraftPlan.view.scene.trace.segs);
  const xs2 = sg.filter((_, i) => i % 2 === 0);
  ok(Math.max(...xs2) - Math.min(...xs2) < 400, 'turned by 90°: the 4 m wall now runs the other way', String(Math.max(...xs2) - Math.min(...xs2)));
  await shot(page, 'trace-01-reference');
  // any view, not only a level's plan: a level's ceiling plan is on the list and traces too
  await page.evaluate(() => document.querySelector('[data-mtool="traceref"]').click());
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-tr-level] option')].map((o) => o.value));
  ok(opts.includes('rcp:' + l1.guid) && opts.includes(l1.guid), 'the Trace list offers plans and ceiling plans', JSON.stringify(opts));
  await page.selectOption('[data-tr-level]', 'rcp:' + l1.guid);
  ok(await traceSegs() >= 8, 'Level 1\'s ceiling plan as the reference: its drawing shows under Level 2', String(await traceSegs()));
  await page.evaluate(() => window.bimcraftTraceRef.set({ ref: '' }));
  ok(await traceSegs() === 0, 'Hide removes it');
  console.log('== pens: SU.1055 a view\'s pen overrides');
  await fresh();
  await newBuilding('Pens', 1, 3000);
  await page.click('[data-mtool="wall"]');
  await planClick(1000, 1000); await planClick(5000, 1000); await page.keyboard.press('Escape');
  await settled();
  const penOf = () => page.evaluate(() => window.bimcraftPlan.view.scene.walls.map((w) => w.pen || null));
  ok((await penOf()).every((p) => p === null), 'no override at first');
  await page.evaluate(() => { const s = window.bimcraftPens.state; s.scope = 'wall'; s.weight = 4; s.dash = 'dash'; s.color = '--layer-red'; window.bimcraftPens.add(); });
  const pens = await penOf();
  ok(pens.length === 1 && pens[0]?.w === 4 && pens[0].dash === 'dash' && pens[0].color === '--layer-red', 'All walls: weight 4, dashed, red', JSON.stringify(pens));
  await shot(page, 'pens-01-wall');
  // on paper: Print the plan, and the wall's override outline is in the PDF (red, dashed)
  {
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 20000 }), page.click('[data-model-print]')]);
    const pdf = fs.readFileSync(await dl.path()).toString('latin1');
    ok(/\.pdf$/i.test(dl.suggestedFilename()) && pdf.includes('0.702 0.071 0.18 RG'), 'Print: the red pen override is in the plan PDF (' + dl.suggestedFilename() + ')');
  }
  await page.evaluate(() => window.bimcraftPens.clear());
  ok((await penOf()).every((p) => p === null), 'Clear all removes it');
  console.log('== stair: SU.1055 a stair from a sketched walking line');
  await fresh();
  await newBuilding('Stair', 2, 3000);
  await page.evaluate(() => document.querySelector('[data-mtool="stairsketch"]').click());
  await planClick(1000, 1000); await planClick(4000, 1000); await planClick(4000, 2500);
  await page.mouse.move(10, 10);
  await page.keyboard.press('Enter');
  await settled();
  const S = await page.evaluate(() => window.bimcraftRes.state.stairs.map((s) => ({ kind: s.kind, n: s.layout?.n, parts: s.parts.length })));
  ok(S.length === 1 && S[0].kind === 'l' && S[0].n === 16 && S[0].parts >= 4, 'two lines: an L stair of 16 risers for 3000 mm, with flights, a landing and handrails', JSON.stringify(S));
  await shot(page, 'stair-01-sketched');
  console.log('== obj: SU.1055 OBJ import opens as mesh elements');
  await fresh();
  const obj = 'o Box\nv 0 0 0\nv 1 0 0\nv 1 0 -1\nv 0 0 -1\nv 0 1 0\nv 1 1 0\nv 1 1 -1\nv 0 1 -1\nf 1 2 3 4\nf 5 8 7 6\nf 1 5 6 2\nf 2 6 7 3\nf 3 7 8 4\nf 4 8 5 1\no Tri\nv 2 0 0\nv 3 0 0\nv 2 1 0\nf -3 -2 -1\n';
  await page.setInputFiles('[data-file]', { name: 'two-objects.obj', mimeType: 'text/plain', buffer: Buffer.from(obj) });
  await waitStatus(/OBJ file as 2 mesh element/, 120000);
  ok(/13 triangles/.test(await statusOf()), 'an OBJ opens: 2 mesh elements, 13 triangles', await statusOf());
  await shot(page, 'obj-01-opened');
  await page.setInputFiles('[data-file]', { name: 'bad.obj', mimeType: 'text/plain', buffer: Buffer.from('# nothing here\n') }).catch(() => {});
  await waitStatus(/Cannot open bad\.obj: The file has no faces/, 30000).catch(() => {});
  ok(/Cannot open bad\.obj/.test(await statusOf()), 'an OBJ with no faces is refused with the reason', await statusOf());
  const real = problems.filter((p) => !/favicon|ERR_ABORTED/.test(p));
  ok(!real.length, 'no console errors', real.slice(0, 5).join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e));
  await shot(page, 'zz-error').catch(() => {});
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bim08modify']); } catch (e) { /* the session ends on its own */ }
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
