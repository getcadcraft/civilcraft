#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pointer-lag.mjs — what CadCraft costs on every pointer move over the drawing (0.9.1, suggestion #1504: "the cursor
 * jumps around the screen" on a 2013 dual-core laptop with integrated graphics).
 *
 * Headless Chromium on the server draws in software (no graphics card), and the CPU is slowed with the DevTools protocol
 * (Emulation.setCPUThrottlingRate), which is a stand-in for an old processor, NOT a measurement on one.
 *
 * It measures from outside the app, so the same script reads a released build too:
 *   - every pointermove listener is wrapped (addEventListener) and timed: main-thread cost per move
 *   - every requestAnimationFrame callback is timed: cost of the frame the move asked for
 *   - a requestAnimationFrame loop of its own: frame-to-frame times while the pointer moves
 *   - DevTools Performance.getMetrics: layouts, style recalcs, script and task time per move
 *   - PerformanceObserver long tasks (> 50 ms)
 * Scenes: an empty drawing and showcase drawings (fixtures/showcase), hovering with no command and inside LINE (snaps,
 * rubber band, dynamic input).
 *
 *   node tools/cadcraft-test/browser-pointer-lag.mjs                      the checks (lab build) + a table
 *   node tools/cadcraft-test/browser-pointer-lag.mjs --build use          the released build at /use/cadcraft (table only)
 *   … --throttle 1,4,6   --steps 300   --json <file>   --shots <dir>   --quick (throttle 4 only, fewer scenes)
 *   … --scenes empty,chip   --patch "<js run in the page after load>" (diagnosis: switch one cost off, measure again)
 *   (run as root; test admin cctest+cadcraft@projectz.xyz)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf('--' + n); return i >= 0 ? args[i + 1] : d; };
const BUILD = opt('build', 'lab');
const QUICK = args.includes('--quick');
const THROTTLES = opt('throttle', QUICK ? '4' : '1,4,6').split(',').map(Number);
const STEPS = parseInt(opt('steps', '300'), 10);
const JSON_OUT = opt('json', null);
const SHOTS = opt('shots', null);
const PATCH = opt('patch', null);       // diagnosis: JavaScript run in the page after each load (to switch one cost off and measure again)
const TRACE = args.includes('--trace');   // diagnosis: a Chromium trace of each run, summed by event name (renderer main thread)
const WHO = args.includes('--who');       // diagnosis: who asks for animation frames and timers while the pointer moves
const ONLY = opt('scenes', null);       // e.g. --scenes empty,chip
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, serviceWorkers: 'block' });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);

/** The probe: runs before any page script. */
await ctx.addInitScript(() => {
  const P = (window.__lag = { on: false, moves: [], rafs: [], frames: [], long: [], cur: null });
  const wrapped = new WeakMap();
  const add = EventTarget.prototype.addEventListener, rem = EventTarget.prototype.removeEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, o) {
    if ((type !== 'pointermove' && type !== 'mousemove') || typeof fn !== 'function') return add.call(this, type, fn, o);
    let w = wrapped.get(fn);
    if (!w) {
      w = function (e) {
        if (!P.on) return fn.call(this, e);
        const t0 = performance.now();
        try { return fn.call(this, e); } finally {
          const dt = performance.now() - t0;
          if (P.cur !== e) { P.cur = e; P.moves.push(dt); } else P.moves[P.moves.length - 1] += dt;
        }
      };
      wrapped.set(fn, w);
    }
    return add.call(this, type, w, o);
  };
  EventTarget.prototype.removeEventListener = function (type, fn, o) { return rem.call(this, type, (typeof fn === 'function' && wrapped.get(fn)) || fn, o); };
  const raf = window.requestAnimationFrame.bind(window);
  // callbacks of one frame share its timestamp: their cost is summed per frame; --who counts who asks for frames and timers
  let frameCost = 0, frameTs = -1;
  const who = (P.who = new Map());
  const site = (kind) => { if (!P.who.on) return; const k = kind + ' ' + (new Error().stack.split('\n').slice(3, 5).map((l) => l.trim().replace(/^at /, '').replace(/https?:\/\/[^/]+/, '').replace(/\?v=\d+/, '')).join(' < ')); who.set(k, (who.get(k) || 0) + 1); };
  window.requestAnimationFrame = (cb) => { if (!cb.__lagLoop) site('frame'); return raf((ts) => {
    if (!P.on || cb.__lagLoop) return cb(ts);
    if (ts !== frameTs) { if (frameTs >= 0) P.rafs.push(frameCost); frameTs = ts; frameCost = 0; }
    const t0 = performance.now();
    try { return cb(ts); } finally { frameCost += performance.now() - t0; }
  }); };
  for (const name of ['setTimeout', 'setInterval']) { const f = window[name].bind(window); window[name] = (cb, ms, ...a) => { site(name + '(' + (ms | 0) + ')'); return f(cb, ms, ...a); }; }
  let last = 0;
  const loop = (ts) => { if (P.on) { if (last) P.frames.push(ts - last); last = ts; } else last = 0; raf(loop); };
  loop.__lagLoop = true;
  raf(loop);
  try { new PerformanceObserver((l) => { if (P.on) for (const e of l.getEntries()) P.long.push(e.duration); }).observe({ entryTypes: ['longtask'] }); } catch { /* not there */ }
  P.reset = () => { P.moves = []; P.rafs = []; P.frames = []; P.long = []; P.cur = null; };
});

const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send('Performance.enable');
const problems = [];
page.on('console', (m) => { if (m.type() === 'error' && !/status of 429/.test(m.text())) problems.push('console: ' + m.text()); });   // 429: the hardware report's hourly limit, reached by this test's many page loads
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(200); };
const metrics = async () => Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map((m) => [m.name, m.value]));
const q = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const r2 = (x) => Math.round(x * 100) / 100;

async function fresh(file) {
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await page.goto(BASE + '/' + BUILD + '/cadcraft', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('cadcraft.tour', 'skipped'); localStorage.removeItem('cadcraft.settings'); localStorage.removeItem('cadcraft.pointer'); localStorage.removeItem('cc-crosshair'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  if (file) {
    await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/showcase', file));
    await page.waitForFunction(() => window.cadcraft.doc.all().length > 0, null, { timeout: 60000 });
    await page.waitForTimeout(1200);
  }
  if (PATCH) await page.evaluate(PATCH);
  return page.evaluate(() => window.cadcraft.doc.all().length);
}

/** Move the pointer over the drawing in a loop that crosses most of it; → the numbers for those moves. */
async function sweep(rate, steps = STEPS) {
  const box = await page.evaluate(() => { const r = document.querySelector('.cc-over').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  const at = (i) => { const a = (i / steps) * Math.PI * 2; return [box.x + box.w * (0.5 + 0.42 * Math.sin(3 * a)), box.y + box.h * (0.5 + 0.42 * Math.sin(2 * a))]; };
  await page.mouse.move(...at(0));
  await cdp.send('Emulation.setCPUThrottlingRate', { rate });
  await page.waitForTimeout(300);
  await page.evaluate((w) => { window.__lag.reset(); window.__lag.who.clear(); window.__lag.who.on = w; window.__lag.on = true; }, WHO);
  if (TRACE) await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'viz', 'v8'] });
  const m0 = await metrics(), t0 = Date.now();
  for (let i = 1; i <= steps; i++) { await page.mouse.move(...at(i)); await page.waitForTimeout(8); }   // about a 125 Hz mouse
  await page.waitForTimeout(100);
  const wall = Date.now() - t0, m1 = await metrics();
  if (TRACE) traceSummary(JSON.parse((await browser.stopTracing()).toString()), steps);
  const P = await page.evaluate(() => { const p = window.__lag; p.on = false; p.who.on = false; return { moves: p.moves, rafs: p.rafs, frames: p.frames, long: p.long, who: [...p.who].sort((a, b) => b[1] - a[1]).slice(0, 14) }; });
  if (WHO) for (const [k, n] of P.who) console.log('      ' + (n / steps).toFixed(2).padStart(6) + ' /move  ' + k);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const per = (k) => (m1[k] - m0[k]) / steps;
  return {
    events: P.moves.length, wall_ms: wall,
    move_med: r2(q(P.moves, 0.5)), move_p95: r2(q(P.moves, 0.95)),
    raf_med: r2(q(P.rafs, 0.5)), raf_p95: r2(q(P.rafs, 0.95)),
    frame_med: r2(q(P.frames, 0.5)), frame_p95: r2(q(P.frames, 0.95)), frame_max: r2(Math.max(0, ...P.frames)),
    slow_frames: P.frames.filter((f) => f > 34).length, frames: P.frames.length,
    long_tasks: P.long.length,
    layouts: r2(per('LayoutCount')), styles: r2(per('RecalcStyleCount')),
    script_ms: r2(per('ScriptDuration') * 1000), layout_ms: r2((per('LayoutDuration') + per('RecalcStyleDuration')) * 1000), task_ms: r2(per('TaskDuration') * 1000),
  };
}

/** Total time by trace event name on the renderer's main thread, per move (nested events count in their parents too). */
function traceSummary(trace, steps) {
  const ev = trace.traceEvents || trace;
  const main = ev.find((e) => e.name === 'thread_name' && e.args?.name === 'CrRendererMain');
  const sum = new Map();
  for (const e of ev) if (e.ph === 'X' && e.dur && main && e.pid === main.pid && e.tid === main.tid) { const v = sum.get(e.name) || [0, 0]; v[0] += e.dur / 1000; v[1]++; sum.set(e.name, v); }
  const top = [...sum].sort((a, b) => b[1][0] - a[1][0]).slice(0, 22);
  for (const [n, [ms, c]] of top) console.log('      ' + n.padEnd(34) + (ms / steps).toFixed(2).padStart(8) + ' ms/move  ' + (c / steps).toFixed(2).padStart(6) + ' /move');
}
const ALL_SCENES = [['empty', null], ['house', 'cadcraft-sample-house.dwg'], ['hvac', 'cadcraft-hvac-office.dwg'], ['chip', 'cadcraft-chip-sky130.dwg']];
const SCENES = QUICK && !ONLY ? ALL_SCENES.slice(0, 2) : ALL_SCENES;
if (ONLY) { const keep = ONLY.split(','); for (let i = SCENES.length - 1; i >= 0; i--) if (!keep.includes(SCENES[i][0])) SCENES.splice(i, 1); }
const rows = [];
const run = async (scene, mode, count, extra = '') => {
  for (const rate of THROTTLES) {
    const r = await sweep(rate);
    rows.push({ build: BUILD, scene, objects: count, mode: mode + extra, throttle: rate, ...r });
    console.log(`  ${scene.padEnd(6)} ${String(count).padStart(6)} obj  ${(mode + extra).padEnd(14)} ${rate}x  move ${String(r.move_med).padStart(6)} / ${String(r.move_p95).padStart(6)} ms   frame-cb ${String(r.raf_med).padStart(6)} / ${String(r.raf_p95).padStart(6)} ms   frame ${String(r.frame_med).padStart(6)} / ${String(r.frame_p95).padStart(6)} ms (max ${r.frame_max}, ${r.slow_frames}/${r.frames} > 34 ms)   task ${r.task_ms} ms/move (script ${r.script_ms}, layout ${r.layout_ms}; ${r.layouts} layouts, ${r.styles} styles)   long ${r.long_tasks}`);
  }
};

try {
  console.log(`\n== pointer moves over the drawing, ${BUILD} build, ${STEPS} moves a run (median / p95)`);
  for (const [scene, file] of SCENES) {
    const count = await fresh(file);
    await run(scene, 'hover', count);
    // inside LINE with a first point: object snap, tracking, the rubber band and dynamic input all follow the pointer
    await typeCmd('LINE'); await typeCmd('0,0');
    await run(scene, 'line', count);
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    if (scene === 'house') await shot('pointer-' + BUILD + '-house');
  }

  if (BUILD === 'lab') {
    const lab = await import('./pointer-lag-checks.mjs').catch(() => null);
    if (lab) await lab.checks({ page, cdp, ok, fresh, sweep, typeCmd, shot, rows });
  }
  ok(!problems.length, 'no console errors', problems.slice(0, 4).join(' | '));
} catch (err) {
  ok(false, 'ran to the end', err.stack || err.message);
} finally {
  await browser.close();
}
if (JSON_OUT) fs.writeFileSync(JSON_OUT, JSON.stringify(rows, null, 1));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
