#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-river3.mjs — CivilCraft 0.8 SU.957 rest (round 3, civil_PART_3): culverts, bridges and junctions
 * (river-structures.js) and unsteady flow (river-unsteady.js), DOM-free, in Node. Known answers, each worked out here by hand
 * and not taken from the program:
 *   - Culvert, inlet control: weir flow HW = (Q/(Cw·B))^(2/3); drowned entrance: HW = Q²/(2g·Cd²·A²) + D/2; outlet control:
 *     HW = (1 + Ke + Kf)·V²/2g + ho − L·S0 with a high tailwater; flow over the road shares Q (barrel + road = Q); more flow, higher HW.
 *   - Bridge: an opening as wide as the channel with no piers leaves the water surface as the plain profile has it; piers raise it
 *     (more piers, more); a narrow opening chokes (energy upstream above the critical energy of the opening); a low chord under the
 *     water gives pressure flow that satisfies the sluice equation, a deck under it adds weir flow and the two add up to Q.
 *   - A model with a culvert: the first section above it starts at the culvert's headwater; none = the plain profile.
 *   - Junction: flows add, the heads of the joining reaches stand at the water surface of the main reach's first section.
 *   - Unsteady: steady flow stays steady; a step in the inflow ends at the steady profile of the new flow; volume closes (in = out +
 *     storage); a flood wave lags and does not grow; its speed matches the kinematic wave celerity within 20 %.
 *   node bin/test-civilcraft-river3.mjs [--build dev] [--verbose]
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
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const PR = await mod('problems-river.js');
const RV = await mod('river.js'), SV = await mod('river-solve.js'), ST = await mod('river-structures.js'), UN = await mod('river-unsteady.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const g = 9.80665;

const rect = (b, h = 10) => [{ o: 0, z: h }, { o: 0, z: 0 }, { o: b, z: 0 }, { o: b, z: h }];
function channel({ b = 20, n = 0.03, slope = 0.001, count = 21, dx = 50, q = 60, down, structures, units = 'm', h = 10 }) {
  const pts = rect(b, h), bank = [0, b], sections = [];
  for (let i = 0; i < count; i++) {
    const rs = i * dx, zb = rs * slope;
    sections.push({ id: 'xs' + i, rs, pts: pts.map((p) => ({ o: p.o, z: p.z + zb })), banks: bank, n: [{ o: 0, n }], reach: { lob: i ? dx : 0, ch: i ? dx : 0, rob: i ? dx : 0 }, cc: 0.1, ce: 0.3 });
  }
  return RV.cleanRiver({ units, sections, profiles: [{ name: 'PF 1', q, down: down || { type: 'normal', slope } }], regime: 'sub', structures });
}
function manningY(Q, n, S, b) { let lo = 1e-6, hi = 100; for (let i = 0; i < 200; i++) { const y = (lo + hi) / 2, A = b * y, R = A / (b + 2 * y); if ((1 / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S) > Q) hi = y; else lo = y; } return (lo + hi) / 2; }

section('Culvert: inlet control');
{
  const c = { kind: 'culvert', shape: 'box', rise: 2, span: 3, barrels: 1, length: 12, invUp: 100, invDown: 98.8, n: 0.013, ke: 0.5, cd: 0.6, cw: 1.7, roadCrest: null, roadLength: 30, roadCw: 1.7 };
  const Q = 2, r = ST.culvertHeadwater(c, Q, 0, 'm');
  near(r.hw, Math.pow(Q / (1.7 * 3), 2 / 3), 1e-6, 'free entrance: HW from the weir equation');
  ok(r.control === 'inlet' && r.qRoad === 0 && Math.abs(r.qCulvert - Q) < 1e-9, 'inlet control, no road flow');
  const Q2 = 30, hwO = (Q2 * Q2) / (2 * g * 0.36 * 36) + 1, r2 = ST.culvertHeadwater(c, Q2, 0, 'm');
  ok(hwO / 2 > 1.5, 'the check case sits above HW/D = 1.5');
  near(r2.hw, hwO, 1e-6, 'drowned entrance: HW from the orifice equation');
  let prev = 0, mono = true;
  for (const q of [0.5, 1, 2, 4, 8, 12, 16, 20, 30]) { const h = ST.culvertHeadwater(c, q, 0, 'm').hw; if (h <= prev) mono = false; prev = h; }
  ok(mono, 'HW grows with Q through the transition');
}
section('Culvert: outlet control, road flow, a round barrel');
{
  const c = { kind: 'culvert', shape: 'box', rise: 2, span: 3, barrels: 1, length: 60, invUp: 100, invDown: 100, n: 0.013, ke: 0.5, cd: 0.6, cw: 1.7, roadCrest: null, roadLength: 30, roadCw: 1.7 };
  const Q = 6, tw = 3, V = Q / 6, R = 6 / 10, kf = (2 * g * 0.013 ** 2 * 60) / Math.pow(R, 4 / 3);
  const r = ST.culvertHeadwater(c, Q, tw, 'm');
  near(r.hw, (1 + 0.5 + kf) * V * V / (2 * g) + tw, 1e-6, 'outlet control: (1 + Ke + Kf)V²/2g + tailwater');
  ok(r.control === 'outlet', 'the tailwater puts it in outlet control');
  const cr = { ...c, roadCrest: 100 + 2.5, roadLength: 40 };
  const big = ST.culvertHeadwater(c, 40, tw, 'm'), road = ST.culvertHeadwater(cr, 40, tw, 'm');
  ok(road.qRoad > 0 && road.flags.includes('overtop'), 'water over the road flagged');
  near(road.qCulvert + road.qRoad, 40, 1e-6, 'barrel + road = Q');
  near(road.qRoad, 1.7 * 40 * Math.pow(road.hw - 2.5, 1.5), 1e-4, 'road flow from its weir equation');
  ok(road.hw < big.hw, 'the road carries some, so the headwater is lower');
  const two = ST.culvertHeadwater({ ...c, barrels: 2 }, Q * 2, tw, 'm');
  near(two.hw, r.hw, 1e-6, 'two barrels carrying twice the flow = one barrel');
  const circ = { ...c, shape: 'circle', rise: 1.2, span: 1.2, length: 20, invUp: 100.2 };
  const a = ST.culvertHeadwater(circ, 0.3, 0, 'm'), b = ST.culvertHeadwater(circ, 1.2, 0, 'm');
  ok(a.hw > 0 && b.hw > a.hw, 'a round barrel: more flow, higher headwater');
}
section('Bridge');
{
  const base = channel({}), plain = SV.solve(base).profiles[0].rows;
  const secs = RV.ordered(base), D = secs[10], U = secs[11];
  const yn = manningY(60, 0.03, 0.001, 20), wsD = plain[10].wse;
  const bridge = (o) => ({ kind: 'bridge', id: 'b', rs: 525, rsD: D.rs, rsU: U.rs, rsB: 525, abutL: 0, abutR: 20, lowChord: 100, deckTop: 101, piers: [], cd: 0.8, cw: 1.7, cc: 0.3, ce: 0.5, ...o });
  const open = ST.bridgeUpstream(bridge({}), D, U, 60, wsD, 'm');
  near(open.wsU, plain[11].wse, 5e-3, 'an opening as wide as the channel leaves the profile as it was');
  ok(open.mode === 'low' && !open.choked, 'free low flow');
  const p1 = ST.bridgeUpstream(bridge({ piers: [{ o: 10, w: 1 }] }), D, U, 60, wsD, 'm'), p2 = ST.bridgeUpstream(bridge({ piers: [{ o: 6, w: 1.5 }, { o: 14, w: 1.5 }] }), D, U, 60, wsD, 'm');
  ok(p1.wsU > open.wsU + 1e-4 && p2.wsU > p1.wsU, `piers raise the water surface, more piers more (${(p1.wsU - open.wsU).toFixed(4)}, ${(p2.wsU - open.wsU).toFixed(4)})`);
  // choked: a 4 m opening; the energy upstream must stand at least at the critical energy of the opening
  const ch = ST.bridgeUpstream(bridge({ abutL: 8, abutR: 12 }), D, U, 60, wsD, 'm');
  const q = 60 / 4, yc = Math.cbrt(q * q / g), Ec = D.pts[1].z + 1.5 * yc;
  ok(ch.choked && ch.flags.includes('choked'), 'a narrow opening chokes');
  ok(ch.egl >= Ec - 1e-3, `the upstream energy (${ch.egl.toFixed(3)}) is above the critical energy of the opening (${Ec.toFixed(3)})`);
  ok(ch.wsU > p2.wsU, 'choking raises the water surface more than piers do');
  // pressure flow: the low chord at 60 % of the normal depth above the bed at the downstream section
  const zb = D.pts[1].z, lc = zb + 0.6 * yn;
  const pr = ST.bridgeUpstream(bridge({ lowChord: lc, deckTop: lc + 3 }), D, U, 60, wsD, 'm');
  ok(pr.mode === 'pressure' && pr.wsU > lc, 'low chord under the water: pressure flow');
  const An = 20 * 0.6 * yn, zH = lc - zb, eglU = pr.egl;
  ok(wsD >= lc, 'the tailwater is above the low chord: drowned');
  near(pr.qPress, 0.8 * An * Math.sqrt(2 * g * (eglU - wsD)), 1e-3 * 60, 'pressure flow, drowned = the orifice equation on the head over the tailwater');
  const sl = ST.bridgeUpstream(bridge({ lowChord: lc, deckTop: lc + 3 }), D, U, 60, zb + 0.5 * yn, 'm');
  if (sl.mode === 'pressure') near(sl.qPress, 0.8 * An * Math.sqrt(2 * g * (sl.egl - (zb + zH / 2))), 1e-3 * 60, 'pressure flow, sluice type (tailwater below the chord) = the sluice equation');
  else ok(false, 'sluice case reached pressure flow');
  near(pr.qPress + pr.qWeir, 60, 0.1, 'pressure flow carries all of Q');
  const ov = ST.bridgeUpstream(bridge({ lowChord: lc, deckTop: lc + 0.2 }), D, U, 60, wsD, 'm');
  ok(ov.mode === 'weir' && ov.qWeir > 0 && ov.flags.includes('overtop'), 'a deck under the water: weir flow too');
  near(ov.qPress + ov.qWeir, 60, 0.1, 'opening + deck flow = Q');
  ok(ov.wsU < pr.wsU, 'the overflow lowers the water surface');
}
section('A river model with a culvert, and with none');
{
  const none = channel({ q: 8 }), plain = SV.solve(none).profiles[0].rows;
  const same = ST.solveStructures(none).profiles[0].rows;
  ok(same.length === plain.length && same.every((r, i) => Math.abs(r.wse - plain[i].wse) < 1e-9), 'no structures = the plain profile');
  const cul = { kind: 'culvert', id: 'c1', rs: 525, shape: 'box', rise: 1.5, span: 3, barrels: 1, length: 12, invUp: 0.525, invDown: 0.513, n: 0.013, ke: 0.5, roadCrest: 5, roadLength: 30 };
  const m = channel({ q: 8, structures: [cul] });
  ok(m.structures.length === 1 && m.structures[0].barrels === 1, 'cleanRiver keeps the culvert');
  const res = ST.solveStructures(m), p = res.profiles[0], rows = p.rows;
  ok(res.issues.length === 0 && rows.length === 21 && p.structures.length === 1, 'solved: 21 sections and one structure line');
  const info = p.structures[0], up = rows.find((r) => r.rs === 550);
  near(up.wse, info.hwWse, 1e-6, 'the first section above the culvert stands at its headwater');
  ok(info.hwWse > plain[11].wse, 'the culvert backs the water up');
  ok(rows.slice(1).every((r, i) => r.rs > rows[i].rs), 'rows run downstream to upstream');
  const bad = RV.cleanRiver({ ...m, structures: [{ kind: 'culvert', rs: 5, rise: -1, length: 10, invUp: 0, invDown: 0 }, { kind: 'bridge', rs: 5, abutL: 5, abutR: 2, lowChord: 1, deckTop: 2 }, 7, null] });
  ok(!bad.structures, 'untrusted structures with bad numbers are dropped');
  const off = ST.solveStructures(channel({ q: 8, structures: [{ ...cul, rs: 5000 }] }));
  ok(off.issues.some((i) => i.code === 'structplace'), 'a structure outside the sections is reported');
}
section('Problems for structures');
{
  const cul = { kind: 'culvert', id: 'c1', rs: 525, shape: 'box', rise: 1.5, span: 3, barrels: 1, length: 12, invUp: 0.525, invDown: 0.513, n: 0.013, ke: 0.5, roadCrest: 1.4, roadLength: 30 };
  const m = channel({ q: 30, structures: [cul] }), raw = { ...m, id: 'rv1', sections: m.sections.map((x) => ({ ...x, line: [{ x: x.rs, y: -20 }, { x: x.rs, y: 20 }] })) };
  const res = ST.solveStructures(m);
  const probs = PR.riverProblems([raw], { t: I18N.t, resultsOf: () => res, unit: 'm' });
  const over = probs.filter((p) => p.code === 'river.struct.overtop');
  ok(over.length === 1 && over[0].severity === 'warning' && /c1/.test(over[0].text) && over[0].where, 'water over the road is a Problem about the river, placed at the section above');
}
section('Junctions');
{
  const main = channel({ q: 30, count: 11 });
  const mk = (q, drop) => { const m = channel({ q, count: 11, slope: 0.002 }); for (const s of m.sections) { s.rs += 0; s.pts = s.pts.map((p) => ({ o: p.o, z: p.z + drop })); } return m; };
  const t1 = mk(12, 0.5), t2 = mk(8, 0.5);
  const net = ST.solveNetwork({ reaches: [{ id: 'main', model: main, to: null }, { id: 'a', model: t1, to: 'main' }, { id: 'b', model: t2, to: 'main' }] });
  ok(net.issues.length === 0 && net.order[0] === 'main' && net.order.length === 3, 'a tree of three reaches is solved from the outlet up');
  const j = net.junctions[0], head = net.reaches.main.profiles[0].rows.at(-1);
  near(j.profiles[0].q, 20, 1e-9, 'flows add: 12 + 8 = 20 at the head of the main reach');
  near(net.reaches.main.profiles[0].rows[0].q, 20, 1e-9, 'the main reach carries the sum');
  for (const id of ['a', 'b']) near(net.reaches[id].profiles[0].rows[0].wse, head.wse, 1e-6, `reach ${id} starts at the main reach's water surface`);
  const cyc = ST.solveNetwork({ reaches: [{ id: 'x', model: main, to: 'y' }, { id: 'y', model: main, to: 'x' }] });
  ok(cyc.issues.length > 0, 'a loop is refused');
}
{   // 0.8 SU.957 (civil_PART_4): the group of rivers a project saves with `joinsTo`
  const main = RV.cleanRiver({ ...channel({ q: 30, count: 11 }), id: 'r1', name: 'Main' });
  const mk = (id, q) => RV.cleanRiver({ ...channel({ q, count: 11, slope: 0.002 }), id, name: id, joinsTo: 'r1' });
  const a = mk('r2', 12), b = mk('r3', 8), lone = RV.cleanRiver({ ...channel({ q: 5, count: 11 }), id: 'r9' });
  ok(main.joinsTo === undefined && a.joinsTo === 'r1', 'joinsTo is kept; none stays absent'); ok(RV.cleanRiver({ ...channel({ q: 5, count: 11 }), id: 'r5', joinsTo: 'r5' }).joinsTo === undefined, 'a river cannot flow into itself');
  const g1 = ST.networkOf([main, a, b, lone], 'r2');
  ok(g1 && g1.ids.length === 3 && !g1.ids.includes('r9') && g1.issues.length === 0, 'the group of r2 is r1, r2, r3 and not the lone river');
  ok(ST.networkOf([main, a, b, lone], 'r9') === null && ST.networkOf([lone], 'r9') === null, 'a river that joins nothing has no junction');
  const net = ST.solveNetwork({ reaches: g1.reaches }); ok(net.issues.length === 0 && net.junctions.length === 1 && net.junctions[0].ups.length === 2, 'solved: one junction with two tributaries');
  near(net.junctions[0].profiles[0].q, 20, 1e-9, 'flows add');
  const two = RV.cleanRiver({ ...channel({ q: 5, count: 11 }), id: 'r7', joinsTo: 'r1', profiles: [{ name: 'A', q: 5, down: { type: 'normal', slope: 0.001 }, up: { type: 'critical' } }, { name: 'B', q: 9, down: { type: 'normal', slope: 0.001 }, up: { type: 'critical' } }] });
  ok(ST.networkOf([main, two], 'r1').issues.some((i) => i.code === 'profilecount'), 'rivers with different numbers of profiles are said');
}
section('Unsteady flow');
{
  const b = 20, n = 0.03, S = 0.001;
  const m = channel({ b, n, slope: S, count: 21, dx: 100, q: 20 });
  const Q = (a) => a.map(([t, q]) => ({ t, q }));
  const steady = UN.unsteady(m, { inflow: Q([[0, 20], [3600, 20]]), down: { type: 'normal', slope: S }, duration: 3600, dt: 60 });
  ok(steady.issues.length === 0 && steady.steps === 60, 'constant inflow runs 60 steps');
  const h0 = SV.solve(m).profiles[0].rows.slice().reverse().map((r) => r.wse);
  const drift = Math.max(...steady.frames.at(-1).h.map((v, i) => Math.abs(v - h0[i])));
  ok(drift < 1e-4, `steady flow stays steady (largest drift ${drift.toExponential(2)} m)`);
  ok(Math.max(...steady.frames.at(-1).q.map((v) => Math.abs(v - 20))) < 1e-3, 'and so does the flow');
  const m2 = { ...m };
  const step = UN.unsteady(m2, { inflow: Q([[0, 20], [60, 40], [20000, 40]]), down: { type: 'normal', slope: S }, duration: 14400, dt: 60 });
  const fin = SV.solve({ ...m, profiles: [{ name: 'f', q: 40, changes: [], down: { type: 'normal', slope: S } }] }).profiles[0].rows.slice().reverse().map((r) => r.wse);
  const e = Math.max(...step.frames.at(-1).h.map((v, i) => Math.abs(v - fin[i])));
  ok(e < 0.01, `after a step in the inflow the water surface ends at the steady profile of the new flow (largest gap ${e.toFixed(4)} m)`);
  ok(Math.abs(step.mass.error) < 1e-3, `volume closes: in - out - storage = ${(step.mass.error * 100).toFixed(4)} % of the largest`);
  // a flood wave: a triangle 20 -> 60 -> 20 over two hours down a 10 km reach
  const L = channel({ b: 50, n, slope: 0.002, count: 21, dx: 500, q: 10 });
  const tri = Q([[0, 10], [3600, 10], [7200, 40], [10800, 10], [86400, 10]]);
  const wave = UN.unsteady(L, { inflow: tri, down: { type: 'normal', slope: 0.002 }, duration: 28800, dt: 60, every: 600 });
  ok(wave.issues.length === 0 && !wave.flags.noconv, 'a flood wave runs');
  const up = wave.peaks[0], dn = wave.peaks.at(-1);
  ok(dn.q <= up.q + 1e-6 && dn.q > 0.5 * up.q, `the peak does not grow and is not lost (${up.q.toFixed(1)} -> ${dn.q.toFixed(1)})`);
  ok(dn.tQ > up.tQ, 'the peak arrives later downstream');
  ok(Math.abs(wave.mass.error) < 2e-3, `volume closes (${(wave.mass.error * 100).toFixed(4)} %)`);
  // kinematic wave celerity c = dQ/dA = (5/3)V for a wide rectangular channel; V from Manning at the mean flow
  const Qm = 25, yn = manningY(Qm, n, 0.002, 50), V = Qm / (50 * yn), c = (5 / 3) * V * (1 - (2 / 3) * (2 * yn) / (50 + 2 * yn) * 0 );
  const lag = dn.tQ - up.tQ, lagK = 10000 / c;
  ok(Math.abs(lag - lagK) / lagK < 0.2, `peak travel time ${lag} s against the kinematic ${lagK.toFixed(0)} s (within 20 %)`);
  const bad = UN.unsteady(L, { inflow: [], down: { type: 'normal', slope: 0.002 }, duration: 100, dt: 10 });
  ok(bad.issues.some((i) => i.code === 'noinflow'), 'no hydrograph is reported');
  const withStruct = UN.unsteady(channel({ q: 8, structures: [{ kind: 'culvert', rs: 525, rise: 1.5, span: 3, length: 12, invUp: 0.5, invDown: 0.5 }] }), { inflow: Q([[0, 8], [100, 8]]), down: { type: 'normal', slope: 0.001 }, duration: 100, dt: 10 });
  ok(withStruct.issues.some((i) => i.code === 'structures'), 'structures inside an unsteady reach are said not to be run');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
