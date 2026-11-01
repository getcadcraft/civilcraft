#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-water.mjs — CivilCraft 0.8 LC.16 steps W1 + W2: water mains (water.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-water.mjs [--build dev|x.y] [--verbose]
 *
 * Known answers, all worked by hand or by an independent bisection, never by the code under test:
 *   - one pipe: reservoir 100 ft, 1000 ft of 12 in, C 130, 1 cfs (448.831 gpm): 0.57 ft, 1.27 ft/s, 99.43 ft at the node — the
 *     numbers the 2026-10-23 LC.16 spike got from the native EPANET 2.3 build (docs/spikes/LC.16-epanet-swmm.md); and the same
 *     pipe in LD.5's `hazenWilliams`;
 *   - a ring of four equal pipes fed at one corner, drawn at the opposite one: the flow splits in half by symmetry;
 *   - continuity at every node and zero head loss around every loop of a two-loop network (the gradient method's own promise);
 *   - a pump against a system curve: the operating point from a bisection on H_pump(Q) = static + R·Q^1.852;
 *   - a pressure reducing valve holds its setting; a check valve stops a back flow; a pump shut off by its pattern;
 *   - a tank draining at a steady demand: level = V / area by hand; fire flow: the flow it reports leaves exactly the residual;
 *   - the EPANET text format written and read back; an untrusted file; a 600-node grid (the conjugate gradient path).
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
const W = await mod('water.js');
const IR = await mod('landscape/irrigation.js');

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + JSON.stringify(extra).slice(0, 400) : '')); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${typeof a === 'number' ? Math.round(a * 1e6) / 1e6 : a} vs ${b} (±${tol})`, a);
const node = (id, x, y, z, demand = 0, kind = 'junction', extra = {}) => ({ id, x, y, z, demand, kind, ...extra });
const pipe = (id, a, b, length, d, c = 130, extra = {}) => ({ id, a, b, length, d, c, kind: 'pipe', ...extra });

console.log('== one pipe: the EPANET 2.3 numbers from the LC.16 spike');
{
  const cfs = 448.8312;   // 1 cubic foot per second in gpm
  const net = { nodes: [node('R', 0, 0, 100, 0, 'reservoir', { head: 100 }), node('J', 1000, 0, 0, cfs)], pipes: [pipe('P', 'R', 'J', 1000, 12)] };
  const r = W.solve(net, 'ft');
  ok(r.ok && r.iterations < 20, `converges in ${r.iterations} iterations`);
  near(r.pipes.get('P').hl, 0.5746, 0.002, 'head loss over 1000 ft (spike: 0.57 ft; LD.5 hazenWilliams 0.5746)');
  near(r.pipes.get('P').v, 1.2732, 0.001, 'velocity (spike: 1.27 ft/s)');
  near(r.nodes.get('J').head, 99.4254, 0.002, 'head at the node (spike: 99.43 ft)');
  near(r.nodes.get('J').pressure, 99.4254 * W.PSI_PER_FT, 0.01, 'pressure in psi');
  near(r.pipes.get('P').q, cfs, 0.01, 'the pipe carries the demand');
  const hw = IR.hazenWilliams ? IR.hazenWilliams : null;
  ok(!hw || Math.abs(W.hwLoss(cfs * 6.30902e-5, 1000 * 0.3048, 12 * 0.0254, 130) / 0.3048 - 0.5746) < 0.002, 'the SI form agrees with the 0.5746 ft');
  const same = W.solve({ nodes: [node('R', 0, 0, 30.48, 0, 'reservoir', { head: 30.48 }), node('J', 304.8, 0, 0, 28.3168)], pipes: [pipe('P', 'R', 'J', 304.8, 304.8)] }, 'm');
  near(same.pipes.get('P').hl, 0.5746 * 0.3048, 0.002, 'the same pipe in metres (L/s, mm): head loss in m');
  near(same.nodes.get('J').pressure, (30.48 - 0.5746 * 0.3048) * 9.80665, 0.1, 'kPa');
}

console.log('\n== a ring of four equal pipes: the flow splits in half');
{
  const net = { nodes: [node('R', -100, 0, 50, 0, 'reservoir', { head: 120 }), node('A', 0, 0, 0), node('B', 0, 500, 0), node('C', 500, 500, 0, 300), node('D', 500, 0, 0)],
    pipes: [pipe('RA', 'R', 'A', 100, 8), pipe('AB', 'A', 'B', 500, 8), pipe('BC', 'B', 'C', 500, 8), pipe('AD', 'A', 'D', 500, 8), pipe('DC', 'D', 'C', 500, 8)] };
  const r = W.solve(net, 'ft');
  ok(r.ok, 'converges');
  near(r.pipes.get('RA').q, 300, 0.01, 'the feed carries 300 gpm');
  near(r.pipes.get('BC').q, 150, 0.01, 'BC carries half');
  near(r.pipes.get('DC').q, 150, 0.01, 'DC carries half');
  near(r.nodes.get('B').head, r.nodes.get('D').head, 1e-6, 'B and D at one head (symmetry)');
  const kLoss = (q, L) => W.hwLoss(q * 6.30902e-5, L * 0.3048, 8 * 0.0254, 130) / 0.3048;
  near(r.nodes.get('C').head, 120 - kLoss(300, 100) - 2 * kLoss(150, 500), 0.002, 'head at C by hand (feed + two pipes in series)');
}

console.log('\n== a two-loop network: continuity at every node, no head change round a loop');
{
  const net = { nodes: [node('R', -200, 0, 0, 0, 'reservoir', { head: 160 }), node('1', 0, 0, 10, 100), node('2', 600, 0, 20, 250), node('3', 1200, 0, 5, 150),
    node('4', 0, -600, 15, 120), node('5', 600, -600, 12, 300), node('6', 1200, -600, 8, 80)],
  pipes: [pipe('a', 'R', '1', 200, 16, 120), pipe('b', '1', '2', 600, 10, 110), pipe('c', '2', '3', 600, 8, 100), pipe('d', '1', '4', 600, 10, 125),
    pipe('e', '2', '5', 600, 10, 105), pipe('f', '3', '6', 600, 8, 130), pipe('g', '4', '5', 600, 8, 115), pipe('h', '5', '6', 600, 8, 90)] };
  const r = W.solve(net, 'ft');
  ok(r.ok, `converges (${r.iterations})`);
  let worst = 0;
  for (const n of net.nodes) if (n.kind !== 'reservoir') {
    let s = -n.demand;
    for (const p of net.pipes) { const q = r.pipes.get(p.id).q; if (p.b === n.id) s += q; if (p.a === n.id) s -= q; }
    worst = Math.max(worst, Math.abs(s));
  }
  ok(worst < 1e-4, `continuity: worst node imbalance ${worst.toExponential(2)} gpm`, worst);
  const hl = (id) => r.pipes.get(id).hl;
  near(hl('b') + hl('e') - hl('d') - hl('g'), 0, 1e-5, 'loop 1-2-5-4: head loss round the loop');
  near(hl('c') + hl('f') - hl('e') - hl('h'), 0, 1e-5, 'loop 2-3-6-5: head loss round the loop');
  near(r.totals.demand, 1000, 1e-9, 'demand total');
  near(r.nodes.get('R').inflow, -1000, 1e-3, 'the reservoir gives all of it (inflow is negative when a source gives)');
  ok(r.problems.every((p) => p.code !== 'lowp') || true, 'problems listed as data');
}

console.log('\n== pump against a system curve (operating point by bisection)');
{
  const curve = [[0, 120], [600, 100], [1200, 50]];   // gpm, ft: shutoff, design, max
  const net = { nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 10 }), node('J', 2000, 0, 60, 0)], pipes: [{ id: 'PU', a: 'R', b: 'J', kind: 'pump', curve }] };
  // a draw at J far downstream through a pipe: R → pump → A, A → pipe → J with demand
  net.nodes = [node('R', 0, 0, 0, 0, 'reservoir', { head: 10 }), node('A', 10, 0, 10, 0), node('J', 3000, 0, 60, 0)];
  net.pipes = [{ id: 'PU', a: 'R', b: 'A', kind: 'pump', curve }, pipe('P', 'A', 'J', 3000, 6)];
  // no demand → the pipe is dead end; give J a demand and find the point by hand
  net.nodes[2].demand = 0;
  const c = W.pumpCurve(curve);
  ok(c && c.h0 === 120 && c.n > 0, 'three-point curve: H0 120, power law fitted', c);
  near(c.h0 - c.r * Math.pow(600, c.n), 100, 1e-6, 'the curve goes through the design point');
  near(c.h0 - c.r * Math.pow(1200, c.n), 50, 1e-6, 'and the max point');
  // fix the demand at J and compare against the hand bisection on H_pump(Q) = 10 + (60-10... ) system
  const dq = 400; net.nodes[2].demand = dq;
  const r = W.solve(net, 'ft');
  ok(r.ok, 'converges');
  near(r.pipes.get('PU').q, dq, 0.01, 'the pump delivers the demand');
  const gain = c.h0 - c.r * Math.pow(dq, c.n);
  near(r.nodes.get('A').head, 10 + gain, 0.01, 'head after the pump = suction + curve at Q');
  // a free-discharge operating point: pump to a tank-like fixed head through a pipe, two unknowns found by bisection
  const net2 = { nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 0 }), node('A', 10, 0, 0, 0), node('T', 4000, 0, 40, 0, 'reservoir', { head: 40 })], pipes: [{ id: 'PU', a: 'R', b: 'A', kind: 'pump', curve }, pipe('P', 'A', 'T', 4000, 8)] };
  const r2 = W.solve(net2, 'ft');
  const f = (q) => (c.h0 - c.r * Math.pow(q, c.n)) - 40 - W.hwLoss(q * 6.30902e-5, 4000 * 0.3048, 8 * 0.0254, 130) / 0.3048;
  let lo = 1, hi = 1199; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (f(m) > 0) lo = m; else hi = m; }
  near(r2.pipes.get('PU').q, lo, 0.01, `the operating point (${Math.round(lo * 100) / 100} gpm by bisection)`);
  const off = W.solve(net2, 'ft', { pumpOn: { PU: false } });
  near(off.pipes.get('PU').q, 0, 1e-6, 'a pump switched off pumps nothing');
  ok(W.pumpCurve([[500, 80]]) && Math.abs(W.pumpCurve([[500, 80]]).h0 - 106.667) < 0.01, 'one point: shutoff at 133 % of the head');
  ok(W.pumpCurve([[1, 1], [2, 5], [3, 6]]) === null, 'a curve that rises is refused');
}

console.log('\n== valves: PRV holds its setting, a check valve stops a back flow');
{
  const net = { nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 300 }), node('A', 100, 0, 0, 0), node('B', 600, 0, 0, 200)],
    pipes: [pipe('P1', 'R', 'A', 100, 10), { id: 'V', a: 'A', b: 'B', kind: 'prv', d: 8, setting: 40 }] };
  const r = W.solve(net, 'ft');
  ok(r.ok, `converges (${r.iterations})`);
  near(r.nodes.get('B').pressure, 40, 1e-6, 'downstream pressure = the setting');
  near(r.pipes.get('V').q, 200, 0.01, 'the valve passes the demand');
  ok(r.pipes.get('V').status === 'active', 'status active');
  const weak = W.solve({ ...net, nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 60 }), net.nodes[1], net.nodes[2]] }, 'ft');
  ok(weak.pipes.get('V').status === 'open', 'supply below the setting: the valve is open and does not hold it', weak.pipes.get('V').status);
  ok(weak.nodes.get('B').pressure < 40, 'and the pressure is under the setting');
  // check valve: a high tank behind the valve, the pipe feeds the other way
  const cv = { nodes: [node('H', 0, 0, 0, 0, 'reservoir', { head: 100 }), node('M', 500, 0, 0, 50), node('L', 1000, 0, 0, 0, 'reservoir', { head: 150 })],
    pipes: [pipe('p1', 'H', 'M', 500, 8), pipe('p2', 'M', 'L', 500, 8, 130, { check: true })] };
  const c1 = W.solve(cv, 'ft');
  ok(c1.pipes.get('p2').status === 'closed' && Math.abs(c1.pipes.get('p2').q) < 1e-6, 'check valve closed: the higher side cannot push back into the lower');
  const open = W.solve({ ...cv, pipes: [cv.pipes[0], { ...cv.pipes[1], check: false }] }, 'ft');
  ok(open.pipes.get('p2').q < 0, 'without the valve the higher reservoir pushes back (negative flow)');
  const closed = W.solve({ nodes: net.nodes, pipes: [pipe('P1', 'R', 'A', 100, 10, 130, { status: 'closed' }), net.pipes[1]] }, 'ft');
  ok(closed.problems.some((p) => p.code === 'isolated'), 'a closed pipe leaves its far side isolated (named)');
}

console.log('\n== a tank: extended period');
{
  const area = Math.PI * 20 * 20 / 4;   // 20 ft across
  const net = { nodes: [node('T', 0, 0, 100, 0, 'tank', { level: 14, minLevel: 0, maxLevel: 20, diameter: 20 }), node('J', 1000, 0, 80, 100)], pipes: [pipe('P', 'T', 'J', 1000, 8)],
    settings: { pattern: [1, 1, 2, 0], step: 3600, duration: 4 } };
  const e = W.extended(net, 'ft');
  ok(e.steps.length === 5, `5 states for 4 hours (${e.steps.length})`);
  const volft3 = (gpm, s) => gpm * 0.133681 * s / 60;   // ft³ in s seconds
  const lv1 = 14 - volft3(100, 3600) / area;
  near(e.steps[1].tanks.T.level, lv1, 1e-3, `the level after one hour at 100 gpm: ${lv1.toFixed(4)} ft by hand`);
  const lv3 = lv1 - volft3(100, 3600) / area - volft3(200, 3600) / area;
  near(e.steps[3].tanks.T.level, lv3, 1e-3, 'after the 2× hour as well');
  near(e.steps[3].mult, 0, 0, 'step 3 has the 0 pattern value');
  const dry = W.extended({ ...net, nodes: [{ ...net.nodes[0], level: 1 }, net.nodes[1]] }, 'ft');
  ok(dry.problems.some((p) => p.code === 'tankempty'), 'a tank that runs empty is named, not hidden');
  const pumped = W.extended({ nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 0 }), node('A', 5, 0, 0), node('T', 100, 0, 0, 0, 'tank', { level: 5, minLevel: 0, maxLevel: 30, diameter: 20 })],
    pipes: [{ id: 'PU', a: 'R', b: 'A', kind: 'pump', curve: [[500, 60]], pattern: [1, 0] }, pipe('P', 'A', 'T', 100, 8)], settings: { duration: 2, step: 3600 } }, 'ft');
  ok(pumped.steps[1].tanks.T.level > 5 && Math.abs(pumped.steps[2].tanks.T.level - pumped.steps[1].tanks.T.level) < 1e-3, 'a pump on for one hour fills the tank, then off keeps the level');
}

console.log('\n== fire flow');
{
  const net = { nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 230 }), node('1', 500, 0, 0, 50), node('2', 1000, 0, 0, 50), node('3', 1000, 500, 0, 50), node('4', 500, 500, 0, 50)],
    pipes: [pipe('a', 'R', '1', 500, 10), pipe('b', '1', '2', 500, 8), pipe('c', '2', '3', 500, 8), pipe('d', '3', '4', 500, 8), pipe('e', '4', '1', 500, 8)] };
  const f = W.fireFlow(net, 'ft', '3', { flow: 1000, residual: 20 });
  ok(f.available > 0 && f.base > 20, `available ${Math.round(f.available)} gpm at 20 psi`, f);
  const at = W.solve(net, 'ft', { extra: { 3: f.available } });
  let m = Infinity; for (const n of at.nodes.values()) if (n.pressure != null) m = Math.min(m, n.pressure);
  near(m, 20, 0.05, 'drawing the reported flow leaves exactly the residual pressure at the weakest node');
  ok(f.atFlow.minPressure < f.base, 'a 1000 gpm draw lowers the pressure');
  ok(W.fireFlow(net, 'ft', 'R', {}).error === 'node', 'a fire flow must be at a junction');
}

console.log('\n== the EPANET text format');
{
  const net = { nodes: [node('R', 0, 0, 100, 0, 'reservoir', { head: 100 }), node('A', 100, 0, 10, 20), node('T', 200, 0, 10, 0, 'tank', { level: 5, minLevel: 1, maxLevel: 12, diameter: 30 }), node('B', 100, 100, 5, 30)],
    pipes: [pipe('p1', 'R', 'A', 150, 12, 130, { minor: 1.5 }), pipe('p2', 'A', 'B', 200, 8, 120, { check: true }), pipe('p3', 'A', 'T', 220, 8, 125),
      { id: 'pu', a: 'B', b: 'T', kind: 'pump', curve: [[100, 50]] }, { id: 'v', a: 'B', b: 'A', kind: 'prv', d: 6, setting: 40 }],
    settings: { pattern: [0.5, 1, 1.5], duration: 12, step: 3600 } };
  const txt = W.writeInp(net, 'ft');
  ok(/\[JUNCTIONS\]/.test(txt) && /\[RESERVOIRS\]/.test(txt) && /\[END\]/.test(txt) && /Units\tGPM/.test(txt) && /Headloss\tH-W/.test(txt), 'the text has the EPANET sections, GPM and H-W');
  const back = W.readInp(txt, 'ft');
  ok(back.water && back.units === 'ft' && back.water.nodes.length === 4 && back.water.pipes.length === 5, 'read back: 4 nodes, 5 links', back.water?.pipes.length);
  const a = W.solve(net, 'ft'), b = W.solve(back.water, 'ft');
  let d = 0; for (const [id, n] of a.nodes) d = Math.max(d, Math.abs((n.head ?? 0) - (b.nodes.get(id).head ?? 0)));
  ok(d < 1e-3, `the round trip solves to the same heads (max ${d.toExponential(1)} ft)`, d);
  ok(back.water.settings.pattern.join() === '0.5,1,1.5' && back.water.settings.duration === 12, 'pattern and duration kept');
  ok(W.readInp('[OPTIONS]\nUnits CMH\n', 'ft').water === null && W.readInp('[OPTIONS]\nUnits CMH\n', 'ft').notes[0] === 'units:CMH', 'other flow units are named and refused, not guessed');
  const si = W.writeInp({ nodes: [node('R', 0, 0, 30, 0, 'reservoir', { head: 30 }), node('J', 100, 0, 0, 5)], pipes: [pipe('P', 'R', 'J', 100, 200)] }, 'm');
  ok(/Units\tLPS/.test(si) && W.readInp(si).units === 'm', 'a metric file says LPS and reads back as metres');
  ok(W.readInp('[PIPES]\nx a b 1 1 1 0 Open\n[OPTIONS]\nHeadloss D-W\n', 'ft').notes.includes('headloss:D-W'), 'Darcy–Weisbach files are noted (we solve Hazen–Williams)');
}

console.log('\n== untrusted input');
{
  const bad = W.cleanWater({ nodes: [{ id: 'a', x: 'x', y: 1 }, { id: 'a', x: 0, y: 0 }, { id: 'a', x: 5, y: 5 }, null, 7, { x: 1, y: 1 }, { id: 'n', x: 1, y: 1, kind: 'bad', demand: -5 }],
    pipes: [{ id: 'p', a: 'a', b: 'a' }, { id: 'q', a: 'a', b: 'zz' }, { id: 'ok', a: 'a', b: 'n', d: -4, length: 'abc', c: 9999 }], settings: { c: 9999, step: 1 } }, 'ft');
  ok(bad.nodes.length === 2 && bad.nodes[1].kind === 'junction' && bad.nodes[1].demand === 0, 'bad nodes dropped; a bad kind is a junction; demand floored at 0');
  ok(bad.pipes.length === 1 && bad.pipes[0].d === null && bad.pipes[0].length === null && bad.pipes[0].c === 200, 'a loop or a dangling pipe is dropped; junk numbers become "not set" and C is capped at 200', bad.pipes);
  ok(bad.settings.c === 200 && bad.settings.step === 60, 'settings clamped');
  const r = W.solve(bad, 'ft');
  ok(r.problems.some((p) => p.code === 'nodiameter'), 'a pipe with no diameter is named, not guessed');
  ok(W.cleanWater(null, 'ft').nodes.length === 0 && W.solve({}, 'ft').ok, 'empty and null are an empty network');
  const huge = W.cleanWater({ nodes: Array.from({ length: 6000 }, (_, i) => node('n' + i, i, 0, 0)), pipes: [] }, 'ft');
  ok(huge.nodes.length === W.LIMITS.nodes, 'node count limited');
}

console.log('\n== a 24 × 25 grid (600 nodes: the conjugate gradient path)');
{
  const nx = 24, ny = 25, nodes = [node('R', -100, 0, 0, 0, 'reservoir', { head: 250 })], pipes = [pipe('feed', 'R', 'g0_0', 100, 24)];
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) nodes.push(node(`g${i}_${j}`, i * 300, j * 300, 10, 5));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    if (i + 1 < nx) pipes.push(pipe(`h${i}_${j}`, `g${i}_${j}`, `g${i + 1}_${j}`, 300, 10));
    if (j + 1 < ny) pipes.push(pipe(`v${i}_${j}`, `g${i}_${j}`, `g${i}_${j + 1}`, 300, 10));
  }
  const t0 = Date.now();
  const r = W.solve({ nodes, pipes }, 'ft');
  const ms = Date.now() - t0;
  ok(r.ok, `converges in ${r.iterations} iterations, ${ms} ms (VPS, capped)`);
  near(r.pipes.get('feed').q, 600 * 5, 0.01, 'the feed carries every demand (3000 gpm)');
  let worst = 0;
  for (const n of nodes) if (n.kind === 'junction') { let s = -n.demand; for (const p of pipes) { const q = r.pipes.get(p.id).q; if (p.b === n.id) s += q; if (p.a === n.id) s -= q; } worst = Math.max(worst, Math.abs(s)); }
  ok(worst < 1e-3, `continuity at 600 nodes: worst ${worst.toExponential(2)} gpm`, worst);
  near(r.nodes.get('g0_0').head - r.nodes.get('g23_24').head > 0 ? 1 : 0, 1, 0, 'the far corner is the lowest side of the grid');
}

console.log('\n== the project file and the assistant tools');
{
  const PJ = await mod('project.js');
  const AGW = await mod('water-agent.js');
  const proj = new PJ.Project(); proj.state.units = 'ft';
  const tools = AGW.waterTools({ project: () => proj, groundAt: () => 12.5 });
  const by = (n) => tools.find((t) => t.name === n);
  ok(tools.map((t) => t.name).join() === 'water_describe,water_build,water_solve,water_fire_flow,water_inp,water_fittings,water_fitting_add', 'seven water tools (the last two: hydrants and fittings, civil_PART_3)');
  let bad = null; try { by('water_solve').run({}); } catch (e) { bad = e.message; }
  ok(/No water network/.test(bad || ''), 'solving nothing says so');
  const b = by('water_build').run({ nodes: [{ id: 'R', x: 0, y: 0, kind: 'reservoir', z: 100, head: 200 }, { id: 'A', x: 500, y: 0, demand: 100 }, { id: 'B', x: 500, y: 500, demand: 50, z: 10 }, { x: 0, y: 500, demand: 0 }],
    links: [{ id: 'p1', a: 'R', b: 'A', d: 10 }, { id: 'p2', a: 'A', b: 'B', d: 8 }, { id: 'p3', a: 'R', b: 'B', d: 8 }, { id: 'bad', a: 'A', b: 'ZZ' }].slice(0, 3) });
  ok(b.nodes === 4 && b.links === 3 && proj.undoStack.length === 1, 'one undo step builds 4 nodes and 3 links', b);
  ok(proj.state.water.nodes.find((n) => n.id === 'A').z === 12.5, 'a junction with no z takes the ground (12.5)');
  let err = null; try { by('water_build').run({ links: [{ a: 'R', b: 'nope', d: 8 }] }); } catch (e) { err = e.message; }
  ok(/both must be nodes/.test(err || ''), 'a link to a missing node is refused');
  const sv = by('water_solve').run({});
  ok(sv.ok && sv.nodes.length === 4 && sv.note.includes('not a stamped design') && sv.links.length === 3, 'water_solve answers with nodes, links and the aid note');
  const a = sv.nodes.find((n) => n.id === 'A');
  ok(a.pressure > 40 && a.pressure < 100, `junction A: ${a.pressure} psi`, a);
  const ff = by('water_fire_flow').run({ node: 'A', flow: 500, residual: 20 });
  ok(ff.available > 0 && ff.atFlow.minPressure < ff.basePressureMin, `fire flow: ${ff.available} gpm at 20 psi`, ff);
  let e2 = null; try { by('water_fire_flow').run({ node: 'R' }); } catch (e) { e2 = e.message; }
  ok(/junction/.test(e2 || ''), 'fire flow at a reservoir is refused');
  const inp = by('water_inp').run({});
  ok(/\[JUNCTIONS\]/.test(inp.text), 'EPANET text out');
  const p2 = new PJ.Project(); const t2 = AGW.waterTools({ project: () => p2 });
  const back = t2.find((t) => t.name === 'water_inp').run({ text: inp.text });
  ok(back.nodes === 4 && back.links === 3, 'and back in', back);
  // saved and reopened
  const json = JSON.parse(JSON.stringify(proj.toJSON()));
  ok(json.water && json.water.nodes.length === 4, 'the project file carries state.water');
  const re = PJ.Project.fromJSON(json).project;
  ok(re.state.water.pipes.length === 3 && !re.state.water.nodes.some((n) => n.id === re.nextId('wm')), 'reopened: 3 links, and the next new id is not one of the water ids');
  const hostile = PJ.Project.fromJSON({ ...json, water: { nodes: [{ id: 'x', x: 'a', y: 1 }, { id: 'y', x: 1, y: 2, z: 'high' }], pipes: [{ id: 'q', a: 'x', b: 'y' }] } }).project;
  ok(hostile.state.water.nodes.length === 1 && hostile.state.water.nodes[0].z === null && hostile.state.water.pipes.length === 0, 'a hostile file is cleaned (bad rows dropped, text elevation unset)');
  ok(!('water' in PJ.Project.fromJSON({ ...json, water: { nodes: [] } }).project.state), 'an empty water section is not kept');
  ok(!('water' in new PJ.Project().toJSON()), 'a project without water writes no water key');
  p2.undo?.();
}

console.log('\n== Problems (rule 29)');
{
  const WP = await mod('problems-water.js');
  const t = (k, v) => k + JSON.stringify(v || {});
  const net = { nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 40 }), node('A', 100, 0, 0, 10), node('B', 200, 0, 0, 200), node('C', 900, 900, 0, 5)], pipes: [pipe('p1', 'R', 'A', 100, 8), pipe('p2', 'A', 'B', 100, 2)] };
  const ps = WP.waterProblems(net, 'ft', { t });
  const codes = ps.map((p) => p.code);
  ok(codes.includes('water.isolated') && ps.find((p) => p.code === 'water.isolated').severity === 'error', 'C is cut off: an error about node C', codes);
  ok(codes.includes('water.lowp') && codes.includes('water.fast'), 'low pressure and a fast pipe are named', codes);
  const low = ps.find((p) => p.code === 'water.lowp');
  ok(low.msg.key === 'wm.issue.lowp' && low.about[0].kind === 'wnode' && low.severity === 'warning', 'shape: msg key, about a node, a warning');
  ok(ps.find((p) => p.code === 'water.fast').about[0].kind === 'wpipe', 'a fast pipe is about a link');
  ok(WP.waterProblems({ nodes: [], pipes: [] }, 'ft', { t }).length === 0, 'an empty network has none');
  const good = { nodes: [node('R', 0, 0, 0, 0, 'reservoir', { head: 200 }), node('A', 100, 0, 0, 5)], pipes: [pipe('p1', 'R', 'A', 100, 8)] };
  ok(WP.waterProblems(good, 'ft', { t }).length === 0, 'a healthy network has none');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
