#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-sewer.mjs — CivilCraft 0.6 LC.16 step S1: sanitary design flows (sewer.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-sewer.mjs [--build dev|x.y] [--verbose]
 *
 * Known answer: a published sanitary sewer design sheet — City of Hamilton (Ontario) subdivision application "Upper West Side
 * draft plan of industrial subdivision", project 17-556, Urbantech Consulting, 12 June 2020 (spike docs/spikes/LC.16_PART_2.md;
 * the PDF stays outside git in testfiles/lc16-hamilton-sewer-sheet/). Criteria: 360 L/person/day, 0.40 L/s/ha, Manning n
 * 0.015, peaking factor Babbitt 5/P^0.2 held between 2.00 and 5.00. Every pipe row of the sheet is rebuilt as a network
 * (the trunk 15A → EX MH 3 → EX MH 2 ← 4A, then EX MH 2 → HC018, so the last pipe's people and area are the sums) and every
 * printed number is checked to the sheet's own rounding: peaking factor, domestic flow, infiltration, total flow, full-flow
 * capacity, full-flow velocity, percent full and the actual (part-full) velocity. Also: Harmon by hand, the caps, a feet
 * project in gpd and cfs by hand, the checks (over, slow, fast, flat), sizing, a loop refused, the project file.
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
const SW = await mod('sewer.js');
const PJ = await mod('project.js');

let pass = 0, fail = 0;
const ok = (c, m, extra) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); } };
/** Equal to the sheet's printed value at its own rounding (half a unit of the last digit). */
const printed = (got, want, dec, m) => ok(Number.isFinite(got) && Math.abs(got - want) <= 0.5 * 10 ** -dec + 1e-9, `${m}: ${got.toFixed(dec + 2)} prints as ${want.toFixed(dec)}`);
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

const HAM = { perCap: 360, infil: 0.4, peak: 'babbitt', pfMin: 2, pfMax: 5, n: 0.015, vMin: 0.75, vMax: 2.75, maxFull: 1 };

section('peaking factors');
{
  const sw = SW.cleanSewer(HAM, 'm');
  // the sheet's area rows: 4,227 → 3.75, 7,889 → 3.31, 1,388 → 4.68, 938 / 750 / 375 / 132 / 29 → 5.00 (the cap), 7,500 → 3.34
  for (const [p, want] of [[4227, 3.75], [7889, 3.31], [1388, 4.68], [938, 5], [750, 5], [375, 5], [132, 5], [29, 5], [7500, 3.34], [3075, 3.99], [15353, 2.90], [15728, 2.88], [18803, 2.78]]) printed(SW.peakingFactor(p, sw), want, 2, `Babbitt for ${p} people (sheet)`);
  const h = SW.cleanSewer({ peak: 'harmon', pfMin: 1, pfMax: 10 }, 'm');
  near(SW.peakingFactor(1000, h), 3.8, 1e-12, 'Harmon at 1,000 people: 1 + 14/5 = 3.8');
  near(SW.peakingFactor(100000, h), 2, 1e-12, 'Harmon at 100,000: 1 + 14/14 = 2');
  near(SW.peakingFactor(1e9, SW.cleanSewer({ peak: 'harmon', pfMin: 1.5, pfMax: 4 }, 'm')), 1.5, 0, 'held at pfMin for a city');
  near(SW.peakingFactor(0, sw), 5, 0, 'no people: pfMax (infiltration only is unaffected)');
}

section('the Hamilton design sheet, every pipe row');
/** One straight pipe per row: a structure pair at the row's length, inverts falling at its slope. */
function sheetNetwork() {
  // ids as a project file keeps them (s<n>, q<n>); the sheet's manhole names are the names
  const ids = { '15A': 's1', EXMH3: 's2', EXMH2: 's3', '4A': 's4', HC018: 's5' };
  let q = 0;
  const st = (name, x, y, sew) => ({ id: ids[name], name, x, y, rim: null, sumpDepth: 0, dia: 1200, ...(sew ? { sew } : {}) });
  const pipe = (name, from, to, dia, slopePct, len, z0) => ({ id: 'q' + ++q, name, from: ids[from], to: ids[to], dia, invUp: z0, invDn: z0 - slopePct / 100 * len });
  // trunk: 15A → (525 m) → EX MH 3 → (1090 m) → EX MH 2 ← (715 m) ← 4A ; EX MH 2 → (80 m) → HC018
  const structures = [st('15A', 0, 1615, { pop: 3075, area: 32.80 }), st('EXMH3', 0, 1090), st('EXMH2', 0, 0), st('4A', 715, 0, { pop: 15728, area: 69.23 + 70.41 }), st('HC018', 0, -80)];
  const pipes = [pipe('15A-EXMH3', '15A', 'EXMH3', 300, 1.15, 525, 100), pipe('EXMH3-EXMH2', 'EXMH3', 'EXMH2', 750, 0.30, 1090, 90), pipe('4A-EXMH2', '4A', 'EXMH2', 675, 0.30, 715, 90), pipe('EXMH2-HC018', 'EXMH2', 'HC018', 1050, 0.30, 80, 80)];
  return { name: 'Sanitary', type: 'sanitary', rules: { minSlope: 0.003, minCover: 2, minDrop: 0.03 }, structures, pipes, sewer: HAM };
}
{
  const net = sheetNetwork();
  const r = SW.sewerFlows(net, 'm');
  // [pipe, people, area, PF, domestic L/s, infiltration L/s, total L/s, capacity L/s, full m/s, actual m/s, % full] as printed
  const rows = [
    ['15A-EXMH3', 3075, 32.80, 3.99, 51.2, 13.1, 64.3, 89.9, 1.27, 1.36, 72],
    ['EXMH3-EXMH2', 3075, 32.80, 3.99, 51.2, 13.1, 64.3, 528.5, 1.20, 0.80, 12],
    ['4A-EXMH2', 15728, 139.64, 2.88, 188.8, 55.9, 244.7, 399.0, 1.12, 1.15, 61],
    ['EXMH2-HC018', 18803, 172.44, 2.78, 217.8, 69.0, 286.8, 1296.3, 1.50, 1.18, 22],
  ];
  for (const [id, P, A, pf, dom, inf, tot, cap, vf, va, pct] of rows) {
    const f = r.pipes.get(net.pipes.find((x) => x.name === id).id);
    ok(f.P === P && Math.abs(f.area - A) < 1e-9, `${id}: ${P} people and ${A} ha come down to it`, { P: f.P, A: f.area });
    printed(f.pf, pf, 2, `${id} peaking factor`);
    printed(f.qDom * 1000, dom, 1, `${id} domestic flow L/s`);
    printed(f.qInf * 1000, inf, 1, `${id} infiltration L/s`);
    printed(f.Q * 1000, tot, 1, `${id} total flow L/s`);
    printed(f.cap * 1000, cap, 1, `${id} full-flow capacity L/s (Manning, n 0.015)`);
    printed(f.vFull, vf, 2, `${id} full-flow velocity m/s`);
    printed(f.ratio * 100, pct, 0, `${id} percent full`);
    // the sheet does not say how it gets its part-full velocity; ours is Manning with a constant n at the normal depth, which
    // runs up to 3 % above it at 60–70 % full (part-full charts with n varying with depth give less): within 3.5 %
    near(f.V, va, va * 0.035, `${id} actual velocity at its normal depth vs the sheet's ${va} m/s (within 3.5 %)`);
  }
  ok(!r.problems.length, 'nothing over capacity, too slow or too fast against the sheet\'s criteria', r.problems);
  // the sheet's two single runs: the existing 200 ha / 7,500 people into HC018, and areas 7 + 3 from 4A to 26A
  const one = (P, A, dia, s, len) => { const n = { type: 'sanitary', rules: {}, sewer: HAM, structures: [{ id: 'a', x: 0, y: 0, sew: { pop: P, area: A } }, { id: 'b', x: len, y: 0 }], pipes: [{ id: 'p', from: 'a', to: 'b', dia, invUp: 10, invDn: 10 - s / 100 * len }] }; return SW.sewerFlows(n, 'm').pipes.get('p'); };
  const e = one(7500, 200, 1050, 0.30, 80);
  printed(e.pf, 3.34, 2, 'existing run: peaking factor'); printed(e.qDom * 1000, 104.4, 1, 'existing run: domestic'); printed(e.qInf * 1000, 80.0, 1, 'existing run: infiltration');
  printed(e.Q * 1000, 184.4, 1, 'existing run: total'); printed(e.ratio * 100, 14, 0, 'existing run: percent full'); near(e.V, 1.05, 1.05 * 0.035, 'existing run: actual velocity (within 3.5 %)');
  const g = one(15353, 69.23 + 66.41, 600, 0.50, 800);
  printed(g.pf, 2.90, 2, '7 + 3 run: peaking factor'); printed(g.qDom * 1000, 185.2, 1, '7 + 3 run: domestic'); printed(g.qInf * 1000, 54.3, 1, '7 + 3 run: infiltration');
  printed(g.Q * 1000, 239.5, 1, '7 + 3 run: total'); printed(g.cap * 1000, 376.3, 1, '7 + 3 run: capacity'); printed(g.vFull, 1.33, 2, '7 + 3 run: full velocity');
  printed(g.ratio * 100, 64, 0, '7 + 3 run: percent full'); near(g.V, 1.37, 1.37 * 0.035, '7 + 3 run: actual velocity (within 3.5 %)');
}

section('a feet project, by hand');
{
  // 1,000 people at 100 gpcd, Harmon 3.8, + 50 ac at 200 gpd/ac: 380,000 + 10,000 = 390,000 gpd = 0.60347 cfs
  const net = { type: 'sanitary', rules: {}, sewer: { perCap: 100, infil: 200, peak: 'harmon', pfMin: 1.5, pfMax: 4, n: 0.013, vMin: 2, vMax: 10, maxFull: 0.8 },
    structures: [{ id: 'a', x: 0, y: 0, sew: { pop: 1000, area: 50 } }, { id: 'b', x: 400, y: 0 }], pipes: [{ id: 'p', name: 'P-1', from: 'a', to: 'b', dia: 8, invUp: 100, invDn: 98 }] };
  const f = SW.sewerFlows(net, 'ft').pipes.get('p');
  near(f.Q, 390000 * SW.GAL_FT3 / 86400, 1e-12, '1,000 people × 100 gpcd × 3.8 + 50 ac × 200 gpd/ac = 390,000 gpd in cfs');
  near(f.cap, (1.486 / 0.013) * (Math.PI * (8 / 12) ** 2 / 4) * ((8 / 12) / 4) ** (2 / 3) * Math.sqrt(0.005), 1e-12, '8" at 0.50 %: Manning full flow by hand');
  ok(SW.flowText(f.Q, 'ft') === '271 gpm (0.603 cfs)' && SW.flowText(0.2395, 'm') === '239.5 L/s', 'flows shown as gpm and cfs, or L/s', SW.flowText(f.Q, 'ft'));
  ok(!SW.sewerFlows(net, 'ft').problems.length, 'at 80 % allowed, the 8" (0.85 cfs full) carries it: 71 % full, no problem');
  const half = { ...net, sewer: { ...net.sewer, maxFull: 0.5 } };
  const r = SW.sewerFlows(half, 'ft');
  ok(r.problems.some((q) => /71% full at the peak flow; the limit is 50%/.test(q.msg)), 'at 50 % allowed it is over: "71% full … the limit is 50%"', r.problems.map((q) => q.msg));
  const sz = SW.sizeSewers(half, r, 'ft');
  ok(sz[0].ok && sz[0].dia === 10, 'sizing picks 10" (1.55 cfs full: the smallest at most 50 % full)', sz);
  const slow = { ...net, pipes: [{ ...net.pipes[0], dia: 24, invDn: 99.6 }] };
  ok(SW.sewerFlows(slow, 'ft').problems.some((q) => /slower/.test(q.msg)), 'a 24" at 0.1 % runs under 2 ft/s: said');
  const fast = { ...net, sewer: { ...net.sewer, vMax: 8 }, pipes: [{ ...net.pipes[0], dia: 10, invDn: 40 }] };
  ok(SW.sewerFlows(fast, 'ft').problems.some((q) => /runs at 9\.00 .*faster than the 8 maximum/.test(q.msg)), 'a 10" at 15 % runs at 9.00 ft/s, over an 8 ft/s maximum: said');
  const flat = { ...net, pipes: [{ ...net.pipes[0], invDn: 100 }] };
  ok(SW.sewerFlows(flat, 'ft').problems.some((q) => /no fall/.test(q.msg)), 'a pipe with no fall: said');
  const loop = { ...net, pipes: [...net.pipes, { id: 'q', from: 'b', to: 'a', dia: 8, invUp: 98, invDn: 97 }] };
  ok(SW.sewerFlows(loop, 'ft').problems.some((q) => q.kind === 'network'), 'a loop is refused');
}

section('untrusted settings and the project file');
{
  const c = SW.cleanSewer({ perCap: -5, infil: 'x', peak: 'other', pfMin: 6, pfMax: 2, n: 3, vMin: -1, vMax: 0, maxFull: 1.5 }, 'm');
  ok(c.perCap === 350 && c.infil === 0.2 && c.peak === 'harmon' && c.pfMin === 2 && c.pfMax === 6 && c.n === 0.013 && c.vMin === 0.6 && c.vMax === 3 && c.maxFull === 0.8, 'bad settings fall back to the placeholders; a swapped min and max are put in order', c);
  ok(SW.cleanSewLoad({ pop: -1, area: 0 }) === null && SW.cleanSewLoad({ pop: 12, area: 'x' }).area === 0, 'a load with nothing in it is none; a bad number is 0');
  const p = new PJ.Project();
  p.change('net', (s) => { s.units = 'm'; s.network = sheetNetwork(); });
  const net2 = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project.state.network;
  ok(net2.type === 'sanitary' && net2.sewer.peak === 'babbitt' && net2.sewer.n === 0.015 && net2.structures.find((s) => s.name === '4A').sew.pop === 15728 && !('sew' in net2.structures.find((s) => s.name === 'EXMH2')), 'the project file keeps the sewer settings and each structure\'s load (none where nothing enters)');
  near(SW.sewerFlows(net2, 'm').pipes.get(net2.pipes.find((q) => q.name === 'EXMH2-HC018').id).Q * 1000, 286.8, 0.05, 'and reopened, the last pipe still carries 286.8 L/s');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
