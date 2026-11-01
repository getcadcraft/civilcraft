#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-storm-route.mjs — CivilCraft 0.8 LC.16: a storm routed through the pipe network as hydrographs (storm-route.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-storm-route.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: 1 acre at C 1, i 6 in/h, tc 10 min is 6 cfs after 10 minutes, 3 cfs after 5 (the rise is linear), holds to the end of the rain and falls over the next
 * 10 minutes; its volume is 6 cfs × 30 min of rain = 180 cfs·min; a storm shorter than tc peaks at 6 × 5/10 = 3 cfs; 1 ha at 100 mm/h is 100/360 = 0.2778 m³/s.
 * Muskingum's three coefficients add up to 1; a routed pipe never raises the peak, delays it and keeps the volume; a pipe too short for the step passes the flow after
 * a plain lag; two branches meeting add their flows time step by time step.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const RT = await mod('storm-route.js');
const HY = await mod('hydro.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const sq = (x, y, s) => [{ x, y }, { x: x + s, y }, { x: x + s, y: y + s }, { x, y: y + s }];
const ACRE = Math.sqrt(43560), HA = 100;
const sum = (a) => a.reduce((s, v) => s + v, 0);

section('one catchment, by hand');
{
  const hy = RT.catchmentHydrograph({ CA: 1, tc: 10, i: 6, duration: 30, dt: 1, steps: 60, units: 'ft' });
  near(hy[5], 3, 1e-9, 'after 5 min: 3 cfs'); near(hy[10], 6, 1e-9, 'after 10 min: 6 cfs'); near(hy[20], 6, 1e-9, 'holds while it rains');
  near(hy[35], 3, 1e-9, '5 min after the rain stops: 3 cfs'); near(hy[40], 0, 1e-9, '10 min after: 0'); near(hy[0], 0, 1e-12, 'dry at the start');
  near(sum(hy), 180, 1e-9, 'volume 6 cfs × 30 min (dt 1 min) = 180');
  const short = RT.catchmentHydrograph({ CA: 1, tc: 10, i: 6, duration: 5, dt: 1, steps: 40, units: 'ft' });
  near(Math.max(...short), 3, 1e-9, 'a 5 min storm on a 10 min tc peaks at 6 × 5/10 = 3 cfs');
  near(sum(short), 30, 1e-9, '… and still carries 6 × 5 = 30');
  const m = RT.catchmentHydrograph({ CA: 1, tc: 10, i: 100, duration: 30, dt: 1, steps: 60, units: 'm' });
  near(Math.max(...m), 100 / 360, 1e-12, '1 ha at 100 mm/h = 0.2778 m³/s');
}

section('Muskingum');
{
  for (const [K, X, dt] of [[5, 0.2, 1], [12, 0.4, 2], [3, 0, 1]]) { const c = RT.muskingum(K, X, dt); near(c.c0 + c.c1 + c.c2, 1, 1e-12, `coefficients add to 1 (K ${K}, X ${X}, dt ${dt})`); }
  ok(!RT.muskingum(5, 0.2, 2).lag && RT.muskingum(0.3, 0.2, 1).lag, 'a reach shorter than the step is a lag, a longer one is routed'); ok(RT.routeReach([0, 5, 5, 0, 0, 0], 6, 0.15, 1).step > 1, 'a step finer than 2·K·X is run on a coarser grid so the coefficients stay positive');
  const inflow = Array.from({ length: 80 }, (_, j) => (j >= 5 && j < 25 ? 10 : 0));
  const { out, lag } = RT.routeReach(inflow, 6, 0.15, 1);
  ok(!lag && Math.max(...out) < 10 && Math.max(...out) > 5, 'a 6 min reach lowers a 10 cfs plateau but not to nothing');
  near(sum(out), sum(inflow), 0.02 * sum(inflow), 'routing keeps the volume (within 2 %: the grid is interpolated)');
  ok(out.indexOf(Math.max(...out)) > inflow.indexOf(10), 'the peak comes later');
  const lg = RT.routeReach(inflow, 0.3, 0.2, 1);
  ok(lg.lag && Math.abs(Math.max(...lg.out) - 10) < 1e-6 && Math.abs(sum(lg.out) - sum(inflow)) < 1e-6, 'a lag keeps the peak and the volume');
  ok(RT.routeReach(inflow, 3, 0.5, 6).lag, 'a coarse step falls back to a lag instead of going negative');
  ok(out.every((v) => v >= 0), 'no negative flows');
}

section('a network');
const net = (over = {}) => ({
  name: 't', type: 'storm', rules: {},
  structures: [{ id: 's1', name: 'MH-1', x: 0, y: 0 }, { id: 's2', name: 'MH-2', x: 1000, y: 0 }, { id: 's3', name: 'OUT', x: 2000, y: 0 }],
  pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 18, invUp: 100, invDn: 95 }, { id: 'p2', name: 'P2', from: 's2', to: 's3', dia: 24, invUp: 94.5, invDn: 89.5 }],
  catchments: [{ id: 'k1', name: 'A', pts: sq(0, 0, ACRE * 2), C: 0.8, tc: 10, to: 's1' }],
  hydro: null, ...over,
});
{
  const n = net(), r = RT.route(n, 'ft', { duration: 30, rain: 5 });
  ok(r.steps > 60 && r.dt === 1 && r.t[3] === 3, 'a time axis in minutes');
  near(r.structs.get('s1').peak, 0.8 * 4 * 5, 1e-9, 'MH-1 sees C·A·i = 16 cfs at its peak (rain long enough)');
  const p1 = r.pipes.get('p1'), p2 = r.pipes.get('p2');
  ok(p1 && p2 && p1.peakOut <= p1.peakIn + 1e-9 && p2.peakOut <= p2.peakIn + 1e-9, 'a pipe never raises the peak');
  ok(p1.tPeakOut >= r.structs.get('s1').tPeak, 'the peak out is no earlier than the peak in');
  near(sum(r.outlets[0].q), sum(r.structs.get('s1').q), 0.03 * sum(r.structs.get('s1').q), 'the outlet receives the whole storm (volume kept within 3 % through two pipes)');
  ok(r.outlets.length === 1 && r.outlets[0].id === 's3', 'one outlet: the structure no pipe leaves');
  ok(p1.K > 0 && p1.X >= 0 && p1.X <= 0.5 && p1.c > 0, 'K, X and the celerity are sensible');
  ok(r.outlets[0].peak <= r.structs.get('s1').peak + 1e-9 && r.outlets[0].peak > 0.5 * r.structs.get('s1').peak, 'the outlet peak is at most the catchment peak and not wiped out');
  ok(HY.rationalFlows(n, 'ft').pipes.get('p1').Q > 0, 'the rational method still answers beside it');
  const long = net({ structures: [{ id: 's1', name: 'a', x: 0, y: 0 }, { id: 's2', name: 'b', x: 6000, y: 0 }, { id: 's3', name: 'c', x: 12000, y: 0 }] });
  const rl = RT.route(long, 'ft', { duration: 15, rain: 5 }), rs = RT.route(n, 'ft', { duration: 15, rain: 5 });
  ok(rl.outlets[0].peak < rs.outlets[0].peak, 'longer pipes attenuate a short storm more (lower outlet peak)');
  ok(rl.outlets[0].tPeak > rs.outlets[0].tPeak, 'and take longer');
}
{
  const n = net({ structures: [{ id: 's1', name: 'MH-1', x: 0, y: 0 }, { id: 's4', name: 'MH-4', x: 0, y: 800 }, { id: 's2', name: 'MH-2', x: 1000, y: 0 }, { id: 's3', name: 'OUT', x: 2000, y: 0 }],
    pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 18, invUp: 100, invDn: 95 }, { id: 'p3', name: 'P3', from: 's4', to: 's2', dia: 18, invUp: 100, invDn: 95 }, { id: 'p2', name: 'P2', from: 's2', to: 's3', dia: 30, invUp: 94.5, invDn: 89.5 }],
    catchments: [{ id: 'k1', name: 'A', pts: sq(0, 0, ACRE * 2), C: 0.8, tc: 10, to: 's1' }, { id: 'k2', name: 'B', pts: sq(0, 0, ACRE * 2), C: 0.8, tc: 25, to: 's4' }] });
  const r = RT.route(n, 'ft', { duration: 20, rain: 4 });
  const a = r.pipes.get('p1'), b = r.pipes.get('p3'), o = r.structs.get('s2');
  ok(o.peak <= a.peakOut + b.peakOut + 1e-9 && o.peak >= Math.max(a.peakOut, b.peakOut) - 1e-9, 'where two branches meet the flows add at each minute (never more than the sum of the two peaks)');
  ok(o.peak < a.peakOut + b.peakOut - 0.1, 'branches with different times of concentration do not peak together, so the sum of peaks overstates it');
  near(sum(o.q), sum(r.structs.get('s1').q) + sum(r.structs.get('s4').q), 0.03 * sum(o.q), 'MH-2 receives both storms (volume within 3 %)');
}
{
  const tight = net({ pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 6, invUp: 100, invDn: 99 }, { id: 'p2', name: 'P2', from: 's2', to: 's3', dia: 24, invUp: 94.5, invDn: 89.5 }] });
  const r = RT.route(tight, 'ft', { duration: 30, rain: 8 });
  ok(r.pipes.get('p1').over && r.problems.some((q) => q.id === 'p1' && q.kind === 'pipe'), 'a 6 in pipe asked for 25 cfs is flagged over its capacity');
  const loop = net({ pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 18, invUp: 100, invDn: 95 }, { id: 'p2', name: 'P2', from: 's2', to: 's1', dia: 18, invUp: 94, invDn: 93 }] });
  ok(RT.route(loop, 'ft').problems.some((q) => q.kind === 'network'), 'a loop is a finding, not a hang');
  ok(RT.route(net({ catchments: [] }), 'ft').steps === 0 && RT.route({ pipes: [], structures: [] }, 'ft').steps === 0, 'nothing to route gives an empty result');
  const flat = net({ pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 18, invUp: 95, invDn: 95 }, { id: 'p2', name: 'P2', from: 's2', to: 's3', dia: 24, invUp: 94.5, invDn: 89.5 }] });
  ok(RT.route(flat, 'ft', { duration: 20, rain: 4 }).problems.some((q) => q.id === 'p1'), 'a pipe with no fall is named, not guessed');
  const bad = RT.route(net(), 'ft', { duration: -5, rain: NaN, dt: 1e9 });
  ok(bad.steps > 0 && bad.dt === 1 && bad.duration > 0 && bad.rain > 0, 'hostile options fall back to the defaults');
}

section('metric and the outputs');
{
  const n = { name: 't', type: 'storm', rules: {}, structures: [{ id: 's1', name: 'a', x: 0, y: 0 }, { id: 's2', name: 'b', x: 300, y: 0 }],
    pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: 450, invUp: 10, invDn: 8.5 }], catchments: [{ id: 'k1', name: 'A', pts: sq(0, 0, HA), C: 1, tc: 10, to: 's1' }] };
  const r = RT.route(n, 'm', { duration: 30, rain: 100 });
  near(r.structs.get('s1').peak, 100 / 360, 1e-9, '1 ha, C 1, 100 mm/h = 0.2778 m³/s into the first structure');
  const lines = RT.hydrographCsv(r, 's2', 'm').trim().split('\r\n');
  ok(lines[0] === 'minutes,flow m3/s' && lines.length === r.steps + 1, 'the CSV has a header and one row per minute');
  ok(RT.hydrographCsv(r, 'zz', 'm') === '', 'an unknown structure gives nothing');
  ok(JSON.stringify(RT.route(n, 'm', { duration: 30, rain: 100 }).outlets[0].q) === JSON.stringify(r.outlets[0].q), 'the same inputs give the same numbers');
}

section('the page side');
{
  const ui = fs.readFileSync(path.join(APP, 'storm-route-ui.js'), 'utf8'), dr = fs.readFileSync(path.join(APP, 'drainage-ui.js'), 'utf8');
  ok(dr.includes('createRoute(ctx)') && dr.includes('rtUi.block(n)'), 'the storm drainage block in Properties carries the Route a storm block');
  const en = JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'));
  const keys = [...new Set([...ui.matchAll(/t\('(rt\.[a-z.]+)'/g), ...fs.readFileSync(path.join(APP, 'storm-route.js'), 'utf8').matchAll(/t\('(rt\.[a-z.]+)'/g)].map((m) => m[1]))];
  ok(keys.length >= 18 && keys.every((k) => k in en && k in en['@context']), 'every rt.* word has text and a note in en.json');
  ok(!/innerHTML|insertAdjacentHTML|eval\(/.test(ui), 'the block builds DOM with el() and text nodes only');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
