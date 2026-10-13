#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-hydro.mjs — CivilCraft 0.4 V19 + V20: catchments and the rational method, pipe sizing by Manning, the
 * hydraulic and energy grade lines (hydro.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-hydro.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: 1 acre = a 208.71 ft square, 1 ha = 100 m square; i(10 min) = 60 / 20^0.75 = 6.3442 in/h; a 12" pipe at 1 %
 * with n 0.013 carries 1.486/0.013 · 0.7854 · 0.25^(2/3) · 0.1 = 3.5628 cfs full (the usual table value 3.56) at 4.536 ft/s;
 * normal depth gives back its own flow; flows summed down two pipes with the longest time of concentration; sizing picks
 * 15" for 5 cfs at 1 %; part-full pipes have their HGL at invert + normal depth; a tailwater above the outlet's crown
 * makes it flow full and the HGL rises by the friction slope; an HGL above a rim is flagged; metric Q = CiA/360.
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
const HY = await mod('hydro.js');
const PJ = await mod('project.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const sq = (x, y, s) => [{ x, y }, { x: x + s, y }, { x: x + s, y: y + s }, { x, y: y + s }];

section('areas, intensity, Manning');
{
  near(HY.catchmentArea(sq(0, 0, Math.sqrt(43560)), 'ft'), 1, 1e-12, '1 acre'); near(HY.catchmentArea(sq(0, 0, 100), 'm'), 1, 1e-12, '1 hectare');
  const h = HY.cleanHydro(null, 'ft');
  near(HY.idf(10, h), 60 / Math.pow(20, 0.75), 1e-12, 'i(10 min) = 60 / 20^0.75'); near(HY.idf(10, h), 6.3442, 1e-4, '= 6.3442 in/h');
  const m = HY.manningFull(1, 0.01, 0.013, 'ft');
  near(m.Q, 3.5628, 1e-4, '12" at 1 %, n 0.013: 3.5628 cfs full'); near(m.V, 4.5363, 1e-4, 'at 4.536 ft/s');
  near(HY.manningFull(0.3, 0.01, 0.013, 'm').Q, (1 / 0.013) * (Math.PI * 0.09 / 4) * Math.pow(0.075, 2 / 3) * 0.1, 1e-12, '300 mm at 1 %: k = 1 in metres');
  const yn = HY.normalDepth(1, 1, 0.01, 0.013, 'ft');
  const pf = HY.partFull(yn, 1);
  near((1.486 / 0.013) * pf.A * Math.pow(pf.A / pf.P, 2 / 3) * 0.1, 1, 1e-6, `normal depth ${yn.toFixed(4)} ft gives back 1 cfs`);
  ok(yn > 0.33 && yn < 0.4, 'about 0.36 D for 28 % of full capacity');
  ok(HY.normalDepth(4, 1, 0.01, 0.013, 'ft') === null, 'more than the pipe carries at its best depth (≈ 3.83 cfs): null');
  near(HY.partFull(0.5, 1).A, Math.PI / 8, 1e-12, 'half full: half the area');
  const c = HY.cleanCatchment({ id: 'k3', name: 'A\u0007', pts: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 'x', y: 1 }, { x: 1, y: 1 }, { x: 0, y: 1 }], C: 2, tc: -1, to: 's1' });
  ok(c && c.name === 'A' && c.pts.length === 4 && c.C === 0.5 && c.tc === 10 && c.to === 's1', 'untrusted catchment: bad point dropped, C and tc defaulted');
  ok(HY.cleanCatchment({ pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }) === null, 'two corners: no catchment');
}

// S1 → S2 → S3 (outlet), 200 ft apart, 1 % each; catchments: 1 ac C 0.5 tc 10 at S1, 2 ac C 0.8 tc 15 at S2
function net(dia1 = 12, dia2 = 15) {
  const A1 = Math.sqrt(43560), A2 = Math.sqrt(2 * 43560);
  return {
    name: 'Storm', type: 'storm', rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 },
    structures: [{ id: 's1', name: 'S1', x: 0, y: 0, rim: 110, sumpDepth: 0, dia: 48 }, { id: 's2', name: 'S2', x: 200, y: 0, rim: 108, sumpDepth: 0, dia: 48 }, { id: 's3', name: 'S3', x: 400, y: 0, rim: 106, sumpDepth: 0, dia: 48 }],
    pipes: [{ id: 'p1', name: 'P1', from: 's1', to: 's2', dia: dia1, invUp: 105, invDn: 103 }, { id: 'p2', name: 'P2', from: 's2', to: 's3', dia: dia2, invUp: 102.6, invDn: 100.6 }],   // crowns matched (15" 0.25 ft lower + a 0.15 ft drop)
    catchments: [{ id: 'k1', name: 'A1', pts: sq(-300, 50, A1), C: 0.5, tc: 10, to: 's1' }, { id: 'k2', name: 'A2', pts: sq(100, 50, A2), C: 0.8, tc: 15, to: 's2' }],
    hydro: null,
  };
}

section('the rational method, summed downstream');
{
  const N = net();
  const f = HY.rationalFlows(N, 'ft');
  const p1 = f.pipes.get('p1'), p2 = f.pipes.get('p2');
  near(p1.CA, 0.5, 1e-12, 'P1 carries C·A = 0.5'); near(p1.tc, 10, 1e-12, 'at tc 10 min');
  near(p1.Q, 0.5 * 6.3442, 1e-3, 'Q1 = 0.5 × 6.344 = 3.172 cfs');
  const v1 = HY.manningFull(1, 0.01, 0.013, 'ft').V, t1 = 200 / v1 / 60;
  near(p1.travel, t1, 1e-9, `travel time in P1 = 200 ft / ${v1.toFixed(3)} ft/s = ${t1.toFixed(3)} min`);
  near(p2.CA, 0.5 + 1.6, 1e-12, 'P2 carries 0.5 + 0.8 × 2 = 2.1');
  near(p2.tc, Math.max(15, 10 + t1), 1e-9, 'at the longer time: max(15, 10 + travel) = 15 min');
  near(p2.Q, 2.1 * 60 / Math.pow(25, 0.75), 1e-9, 'Q2 = 2.1 × i(15)');
  const m = { ...N, catchments: [{ ...N.catchments[0], pts: sq(0, 0, 100) }], structures: N.structures, pipes: N.pipes };
  const fm = HY.rationalFlows({ ...m, hydro: { idf: { a: 1700, b: 12, c: 0.8 }, n: 0.013 } }, 'm');
  near(fm.pipes.get('p1').Q, (0.5 * 1 * (1700 / Math.pow(22, 0.8))) / 360, 1e-12, 'metric: Q = C·i·A / 360 m³/s');
  const loop = { ...N, pipes: [...N.pipes, { id: 'p3', name: 'P3', from: 's3', to: 's1', dia: 12, invUp: 100, invDn: 99 }] };
  ok(HY.rationalFlows(loop, 'ft').problems.some((q) => /loop/.test(q.msg)), 'a loop: said');
  ok(HY.rationalFlows({ ...N, catchments: [{ ...N.catchments[0], to: 'nope' }] }, 'ft').problems.some((q) => /drains to no structure/.test(q.msg)), 'a catchment with no outlet: said');
}

section('sizing and the grade lines');
{
  const N = net(12, 12);
  N.catchments[1].C = 1; N.catchments[1].pts = sq(100, 50, Math.sqrt(0.6 * 43560));
  const f = HY.rationalFlows(N, 'ft');
  // P2: CA 0.5 + 0.6 = 1.1 at i(15) → 4.28 cfs: more than a 12" carries at 1 % (3.56) → 15"
  const sz = HY.sizePipes(N, f, 'ft');
  ok(sz.find((x) => x.id === 'p1').dia === 12 && sz.find((x) => x.id === 'p2').dia === 15, 'sized: P1 12" (3.17 cfs), P2 15" (' + f.pipes.get('p2').Q.toFixed(2) + ' cfs)');
  ok(sz.every((x) => x.ok && x.cap >= x.Q), 'every size carries its flow');
  const big = HY.sizePipes(N, { ...f, pipes: new Map([['p1', { ...f.pipes.get('p1'), Q: 1000 }]]) }, 'ft');
  ok(big[0].dia === 72 && !big[0].ok, '1,000 cfs: the largest size, not ok');
  // part full everywhere with the sizes in place
  const N2 = { ...N, pipes: N.pipes.map((p) => ({ ...p, dia: sz.find((x) => x.id === p.id).dia })) };
  const f2 = HY.rationalFlows(N2, 'ft');
  const hg = HY.hydraulicGrade(N2, f2, 'ft');
  const g1 = hg.pipes.get('p1');
  near(g1.hglUp, 105 + g1.yn, 1e-12, 'P1 part full: HGL at its top = invert + normal depth'); near(g1.hglDn, Math.max(103 + g1.yn, hg.structs.get('s2').hgl), 1e-12, 'at its foot: its normal depth or S2’s water, whichever is higher (backwater)');
  near(g1.eglUp - g1.hglUp, g1.V * g1.V / (2 * 32.174), 1e-12, 'EGL = HGL + V²/2g');
  ok(!g1.full && !hg.problems.length, 'nothing full, nothing flooded');
  near(hg.structs.get('s2').hgl, hg.pipes.get('p2').hglUp + 0.5 * hg.pipes.get('p2').V ** 2 / (2 * 32.174), 1e-12, 'S2 = P2’s top HGL + 0.5 V²/2g');
  // a tailwater above the outlet pipe's crown: P2 flows full and its HGL rises by Sf × L
  const N3 = { ...N2, hydro: { tailwater: 103 } };
  const hg3 = HY.hydraulicGrade(N3, HY.rationalFlows(N3, 'ft'), 'ft');
  const g2 = hg3.pipes.get('p2');
  ok(g2.full && hg3.problems.some((q) => /P2 flows full/.test(q.msg)), 'tailwater 103 (P2’s crown at the outlet 101.85): P2 flows full, said');
  near(g2.hglDn, 103, 1e-12, 'its HGL at the outlet = the tailwater');
  near(g2.hglUp, Math.max(103 + g2.Sf * 200, 102.6 + 1.25), 1e-9, 'and at its top: up by Sf × 200 ft (or at its crown)');
  const N4 = { ...N2, structures: N2.structures.map((s) => (s.id === 's2' ? { ...s, rim: 103.5 } : s)), hydro: { tailwater: 104 } };
  ok(HY.hydraulicGrade(N4, HY.rationalFlows(N4, 'ft'), 'ft').problems.some((q) => /above the rim at S2/.test(q.msg)), 'tailwater 104 against a 103.5 rim at S2: flooding said');
}

section('the project file');
{
  const p = new PJ.Project();
  p.change('net', (s) => { s.network = { ...net(), hydro: { idf: { a: 70, b: 12, c: 0.8 }, n: 0.012, kj: 0.3, tailwater: 101 } }; });
  const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(q.state.network.catchments.length === 2 && q.state.network.catchments[1].C === 0.8 && q.state.network.catchments[0].to === 's1', 'catchments kept');
  ok(q.state.network.hydro.idf.a === 70 && q.state.network.hydro.n === 0.012 && q.state.network.hydro.tailwater === 101, 'hydrology settings kept');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
