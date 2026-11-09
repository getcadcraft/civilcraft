#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * input-latency.mjs — FX.42 (0.9): how late does an app answer the pointer? "Input lag since 0.8.1, no CPU or GPU load" (Discord 2026-11-04).
 * A probe, not a verdict: it measures the same thing in the 0.8, the 0.8.1 and the dev (lab) build of an app, so a difference between builds
 * shows up as a number and no difference says so.
 *
 *   tools/gpu-remote/run.sh --session studio-fix-09 --lab -- tools/shell-test/input-latency.mjs [--apps cadcraft,bimcraft,modelcraft,partcraft] [--builds 0.8,0.8.1,dev] [--moves 200]
 *   node tools/shell-test/input-latency.mjs …        (here, on the VPS: SwiftShader, only to check the probe runs; the numbers that count are the workstation's)
 *
 * Per app and build, in a fresh page with the app empty (no file): 
 *   idle     3 s of nothing: rAF frame interval (p50 / p95 / max) and long tasks (> 50 ms) the page itself ran (timers, probes, presence)
 *   move     N real mouse moves over the app's main canvas (CDP input events, 8 ms apart): pointermove -> the next animation frame
 *   wheel    40 real wheel steps: wheel -> next frame
 *   click    20 real clicks on empty canvas: pointerdown -> next frame
 *   event    the browser's Event Timing entries (>= 16 ms): the longest input delay and processing time seen
 * "pointer -> next frame" = (the first requestAnimationFrame callback after the event, its timestamp) - event.timeStamp. At 60 Hz the floor is
 * about 8 ms on average, up to 16.7; a number far above that, or a p95 that is many frames, is lag. Results go to tmp/input-latency.json and a table.
 * Not measured here: Studio's own shell (WebView2 + the Rust side), the owner's machine, a real tablet or pen. Say so in the log.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const APPS = arg('--apps', 'cadcraft,bimcraft,modelcraft,partcraft').split(',').filter(Boolean);
const BUILDS = arg('--builds', '0.8,0.8.1,dev').split(',').filter(Boolean);
const MOVES = parseInt(arg('--moves', '200'), 10);
const OUT = path.join(REPO, 'tmp');
fs.mkdirSync(OUT, { recursive: true });

const INIT = () => {
  const L = (window.__lat = { move: [], wheel: [], click: [], frames: [], long: [], ev: [] });
  const after = (bucket) => (e) => { const t = e.timeStamp; requestAnimationFrame((ts) => L[bucket].push(ts - t)); };
  document.addEventListener('pointermove', after('move'), { capture: true, passive: true });
  document.addEventListener('wheel', after('wheel'), { capture: true, passive: true });
  document.addEventListener('pointerdown', after('click'), { capture: true, passive: true });
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) L.long.push([Math.round(e.startTime), Math.round(e.duration)]); }).observe({ type: 'longtask', buffered: true }); } catch { /* no long task API */ }
  try { new PerformanceObserver((l) => { for (const e of l.getEntries()) L.ev.push({ n: e.name, delay: Math.round(e.processingStart - e.startTime), proc: Math.round(e.processingEnd - e.processingStart), dur: e.duration }); }).observe({ type: 'event', durationThreshold: 16, buffered: true }); } catch { /* no event timing */ }
  let last = 0; const tick = (ts) => { if (last) L.frames.push(ts - last); last = ts; requestAnimationFrame(tick); };
  window.__latStart = () => { L.frames.length = 0; last = 0; requestAnimationFrame(tick); };
  window.__latReset = () => { for (const k of ['move', 'wheel', 'click', 'long', 'ev']) L[k].length = 0; };
};
const q = (a, p) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return Math.round(s[Math.min(s.length - 1, Math.floor(p * s.length))] * 10) / 10; };
const stat = (a) => ({ n: a.length, p50: q(a, 0.5), p95: q(a, 0.95), max: q(a, 1) });

const browser = await launch({ webgl: true });
const results = [];
let machineLine = '';
for (const app of APPS) for (const build of BUILDS) {
  const url = build === 'dev' ? `${BASE}/lab/${app}` : `${BASE}/use/${app}/${build}`;
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  try { await ctx.addCookies(labCookie()); } catch { /* /use pages need no sign-in */ }
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const row = { app, build, url };
  try {
    const r = await page.goto(url, { waitUntil: 'load', timeout: 60000 });
    if (!r || r.status() >= 400) throw new Error('HTTP ' + (r && r.status()));
    await page.waitForTimeout(2500);
    if (!machineLine) { machineLine = await machine(page); console.log(machineLine); }
    // the main canvas: the biggest visible one
    const box = await page.evaluate(() => {
      const c = [...document.querySelectorAll('canvas')].filter((e) => e.getClientRects().length).map((e) => ({ r: e.getBoundingClientRect() })).sort((a, b) => b.r.width * b.r.height - a.r.width * a.r.height)[0];
      return c ? { x: c.r.left, y: c.r.top, w: c.r.width, h: c.r.height } : { x: 300, y: 150, w: 800, h: 600 };
    });
    // idle
    await page.evaluate(() => { window.__latStart(); window.__latReset(); });
    await page.waitForTimeout(3000);
    row.idle = await page.evaluate(() => ({ frames: window.__lat.frames.slice(), long: window.__lat.long.slice() }));
    row.idle = { frame: stat(row.idle.frames), long: row.idle.long.length, longMax: row.idle.long.reduce((m, l) => Math.max(m, l[1]), 0) };
    const cx = box.x + box.w / 2, cy = box.y + box.h / 2;
    // moves
    await page.evaluate(() => window.__latReset());
    await page.mouse.move(cx, cy);
    for (let i = 0; i < MOVES; i++) {
      await page.mouse.move(cx + Math.sin(i / 9) * box.w * 0.35, cy + Math.cos(i / 7) * box.h * 0.35);
      await page.waitForTimeout(8);
    }
    await page.waitForTimeout(200);
    // wheel
    await page.mouse.move(cx, cy);
    for (let i = 0; i < 40; i++) { await page.mouse.wheel(0, i % 2 ? 120 : -120); await page.waitForTimeout(30); }
    await page.waitForTimeout(200);
    // clicks on the canvas (a click on an empty spot selects nothing; a tool may start: Escape after each)
    for (let i = 0; i < 20; i++) { await page.mouse.click(cx + (i - 10) * 7, cy + 40); await page.keyboard.press('Escape'); await page.waitForTimeout(40); }
    await page.waitForTimeout(300);
    const L = await page.evaluate(() => ({ move: window.__lat.move, wheel: window.__lat.wheel, click: window.__lat.click, long: window.__lat.long, ev: window.__lat.ev }));
    row.move = stat(L.move); row.wheel = stat(L.wheel); row.click = stat(L.click);
    row.longDuring = L.long.length; row.longDuringMax = L.long.reduce((m, l) => Math.max(m, l[1]), 0);
    row.event = { n: L.ev.length, maxDelay: L.ev.reduce((m, e) => Math.max(m, e.delay), 0), maxProc: L.ev.reduce((m, e) => Math.max(m, e.proc), 0), maxDur: Math.round(L.ev.reduce((m, e) => Math.max(m, e.dur), 0)) };
  } catch (e) { row.error = String(e.message || e).split('\n')[0]; }
  results.push(row);
  console.log(JSON.stringify(row));
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, 'input-latency.json'), JSON.stringify({ machine: machineLine, at: new Date().toISOString(), moves: MOVES, results }, null, 1));
const f = (s) => (s ? `${s.p50}/${s.p95}/${s.max}` : '-');
console.log('\n' + machineLine + '\n\n| app | build | idle frame ms p50/p95/max | idle long tasks (max ms) | move->frame ms p50/p95/max | wheel | click | long tasks while moving (max ms) | event timing max delay/proc/dur |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of results) console.log(r.error ? `| ${r.app} | ${r.build} | ERROR: ${r.error} |` : `| ${r.app} | ${r.build} | ${f(r.idle.frame)} | ${r.idle.long} (${r.idle.longMax}) | ${f(r.move)} | ${f(r.wheel)} | ${f(r.click)} | ${r.longDuring} (${r.longDuringMax}) | ${r.event.maxDelay}/${r.event.maxProc}/${r.event.maxDur} |`);
console.log('\nresults in tmp/input-latency.json');
