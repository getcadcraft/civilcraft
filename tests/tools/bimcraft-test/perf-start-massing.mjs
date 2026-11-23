#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * perf-start-massing.mjs — PERF.57, BimCraft part (perf-finish-11, lane bim): /lab/bimcraft start-up with a CDP sampling profile, N loads.
 * Per load: long tasks in the first 10 s, the self time of program-mass.js / design-ui.js frames (massingOptions and the panel's render), whether
 * the massing panel ([data-eg58]) has any content at start; then the panel is asked for (window.bimcraftProgram.render(), what scrolling it
 * into view does) and the time that takes = what the start paid before the panel was made lazy.
 *   tools/gpu-remote/run.sh --session perf-finish-bim --lab -- tools/bimcraft-test/perf-start-massing.mjs [--loads 5]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch, labCookie, machine, BASE } from '../gpu-remote/browser.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const i = process.argv.indexOf('--loads'), LOADS = i > 0 ? Number(process.argv[i + 1]) : 5;
const out = [];
const say = (s) => { console.log(s); out.push(s); };
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s.length ? s[Math.floor(s.length / 2)] : 0; };
const runs = [];
for (let n = 0; n < LOADS; n++) {
  const browser = await launch({ webgl: true });
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  await ctx.addCookies(labCookie());
  await ctx.addInitScript(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask', buffered: true }); } catch (e) { /* none */ } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 500 });
  await cdp.send('Profiler.start');
  await page.goto(`${BASE}/lab/bimcraft`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForTimeout(10000);
  const { profile } = await cdp.send('Profiler.stop');
  if (!n) say('machine: ' + await machine(page));
  // self time per node from the samples
  const dt = new Map(); const nodes = new Map(profile.nodes.map((x) => [x.id, x]));
  for (let k = 0; k < profile.samples.length; k++) dt.set(profile.samples[k], (dt.get(profile.samples[k]) || 0) + (profile.timeDeltas[k + 1] ?? 0) / 1000);
  let mass = 0, panel = 0; const fns = new Set();
  for (const [id, t] of dt) { const cf = nodes.get(id).callFrame; if (/program-mass\.js/.test(cf.url)) { mass += t; fns.add(cf.functionName || '(anon)'); } if (/design-ui\.js/.test(cf.url)) panel += t; }
  const st = await page.evaluate(() => { const lt = window.__lt.filter((x) => x[0] < 10000); return { tasks: lt.length, block: Math.round(lt.reduce((a, x) => a + x[1], 0)), longest: Math.round(lt.reduce((a, x) => Math.max(a, x[1]), 0)), kids: document.querySelector('[data-eg58]')?.childElementCount ?? -1, api: !!window.bimcraftProgram } ; });
  const open = await page.evaluate(() => { const t0 = performance.now(); window.bimcraftProgram?.render?.(); const ms = performance.now() - t0; return { ms: +ms.toFixed(1), kids: document.querySelector('[data-eg58]')?.childElementCount ?? -1, options: document.querySelectorAll('[data-eg58-option]').length }; });
  const R = { load: n, start: st, massSelfMs: +mass.toFixed(1), panelSelfMs: +panel.toFixed(1), fns: [...fns], open };
  runs.push(R);
  say(`load ${n + 1}: first 10 s ${st.block} ms blocking in ${st.tasks} long tasks (longest ${st.longest}) | program-mass.js ${R.massSelfMs} ms, design-ui.js ${R.panelSelfMs} ms in the profile${fns.size ? ' (' + [...fns].join(', ') + ')' : ''} | panel children at start ${st.kids} | asking for the panel: ${open.ms} ms, then ${open.kids} children, ${open.options} options`);
  await browser.close();
}
say(`median of ${LOADS}: start blocking ${med(runs.map((r) => r.start.block))} ms, program-mass.js in the start ${med(runs.map((r) => r.massSelfMs))} ms, the panel when asked for ${med(runs.map((r) => r.open.ms))} ms`);
fs.mkdirSync(path.join(REPO, 'tmp'), { recursive: true });
fs.writeFileSync(path.join(REPO, 'tmp', 'perf-start-massing.json'), JSON.stringify(runs, null, 1));
