/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — the pool generator's engine (0.11 Track POOL; brief docs/0.11-POOL-SPEC.md). lib/pool is canonical: add-ons carry byte-identical
 * copies (`node tools/pool/sync.mjs`). Host-free: no DOM here, no app imports; panel.js is the only file that touches a page, and only when called.
 *
 * design(raw, spec) is the whole generator: loose input and an optional spec pack in, everything out.
 */
import { cleanPool, resolve, SERIES } from './model.js';
import { circulation, loopHead, pumpFor } from './hydraulics.js';
import { build, stepsOf, benchesOf } from './build.js';
import { outlineOf, isRect, area, centroidX, perimeter } from './plan.js';
import { network, pipeTotals } from './network.js';
import { bars, barElements } from './rebar.js';
import { quantities } from './quantities.js';
import { check } from './spec.js';

export * from './model.js';
export * from './hydraulics.js';
export * from './build.js';
export * from './plan.js';
export * from './network.js';
export * from './rebar.js';
export * from './quantities.js';
export * from './spec.js';
export * from './drawings.js';
export * from './report.js';
export * from './ifcout.js';
export * from './units.js';

/**
 * → { pool (cleaned input), inputProblems, spec, design (every figure set), basis (where each governed figure came from), shape { poly, L, B,
 *     rect }, steps, benches, circ, built { elements, layout, metrics }, net (the connected pipes, network.js), rebar (bars.js; always worked
 *     out, drawn as elements only with rebarMode 'bars'), quantities, checks (against the spec; [] with none), problems: [{ code, vars }] }
 */
export function design(raw = {}, spec = null) {
  const { pool, problems: inputProblems } = cleanPool(raw);
  const { design: d, basis } = resolve(pool, spec);
  const problems = [];
  const typed = parseCornersText(d.corners);
  let sh = outlineOf({ ...d, corners: typed.pts });
  if (d.shape === 'free' && typed.bad.length) problems.push({ code: 'shape.text', vars: { text: typed.bad[0].slice(0, 40) } });
  for (const code of sh.problems) problems.push({ code });
  d.length = sh.L; d.width = sh.B;
  const rect = isRect(sh.poly);
  Object.defineProperty(d, '_shape', { value: sh, enumerable: false, writable: true });
  let steps = stepsOf(d);
  const bn = benchesOf(d);
  problems.push(...bn.problems);
  const plan = rect ? null : { area: area(sh.poly), cx: centroidX(sh.poly) };
  const under = (steps && !steps.nofit ? steps.volume : 0) + bn.list.reduce((s, b) => s + b.volume, 0);
  const circ = circulation(d, under, SERIES, plan);
  let built;
  try { built = build(d, circ, steps, bn.list); }
  catch (err) {
    if (err && err.code !== 'shape.offset') throw err;
    // an outline too narrow for its own walls: drawn as its bounding rectangle, and said so
    problems.push({ code: 'shape.offset' });
    sh = { poly: [[0, 0], [sh.L, 0], [sh.L, sh.B], [0, sh.B]], L: sh.L, B: sh.B, problems: [] };
    d._shape = sh;
    steps = stepsOf(d);
    built = build(d, circ, steps, []);
  }
  // head loss from the routed pipes; 'calculated' makes it the pump head, 'given' keeps the person's figure and only reports it
  const loop = loopHead(built.layout.pipes, d);
  circ.loop = loop;
  if (d.pumpHeadMode === 'calculated') {
    circ.pump = pumpFor(circ.pump.count, circ.pump.flowEach, loop.total, d.pumpEff);
    for (const e of built.elements) if (e.key.startsWith('pump-')) Object.assign(e.props, { HeadM: circ.pump.head, ShaftKw: circ.pump.shaftKw, MotorKw: circ.pump.motorKw });
  }
  // the pipes as a connected network: segments, fittings, ports, connections
  const net = network(built, d, circ);
  for (const e of built.elements) if (net.owned.has(e.key)) e.ports = net.owned.get(e.key);
  built.elements.push(...net.elements);
  for (const e of net.elements) if (e.qty.volume === undefined) e.qty.volume = 0;
  // reinforcement: always worked out (the schedule), drawn as bars only when asked
  const rebar = bars(d, built.layout);
  if (d.rebarMode === 'bars') { const els = barElements(rebar, d); for (const e of els) e.qty.volume = 0; built.elements.push(...els); }
  const q = quantities(d, circ, steps, built, { net, rebar });
  if (steps && steps.nofit) problems.push({ code: 'steps.nofit', vars: { run: steps.run } });
  if (steps && !steps.nofit && steps.lastRiser > steps.riser * 1.25) problems.push({ code: 'steps.last', vars: { last: Math.round(steps.lastRiser), riser: Math.round(steps.riser) } });
  if (steps && steps.fits === false) problems.push({ code: 'steps.outside', vars: { side: steps.edge } });
  if (d.stepsEdge > 0 && !steps && d.steps !== 'none' && d.kind === 'pool') problems.push({ code: 'steps.side', vars: { side: d.stepsEdge, sides: sh.poly.length } });
  if (!circ.filter.fits) problems.push({ code: 'filter.nofit', vars: { area: Number(circ.filter.areaNeed.toFixed(2)) } });
  if (!circ.pump.fits) problems.push({ code: 'pump.nofit', vars: { kw: Number(circ.pump.shaftKw.toFixed(1)) } });
  for (const [k, l] of Object.entries(circ.lines)) if (l.flow > 0 && !l.fits) problems.push({ code: 'pipe.nofit', vars: { line: k, need: Math.round(l.need) } });
  if (d.wall < 2 * d.coverWater + 50) problems.push({ code: 'wall.thin', vars: { wall: d.wall, cover: d.coverWater } });
  if (d.copingWidth < d.finish + d.wall && d.overflow !== 'gutter') problems.push({ code: 'coping.narrow', vars: { coping: d.copingWidth, wall: d.finish + d.wall } });
  if (built.metrics.gateNoFit) problems.push({ code: 'gate.nofit', vars: { width: d.gateWidth } });
  if (built.metrics.sharp) problems.push({ code: 'shape.sharp', vars: { n: built.metrics.sharp } });
  if (net.open) problems.push({ code: 'pipe.open', vars: { n: net.open } });
  if (d.rebarMode === 'bars' && rebar.tooMany) problems.push({ code: 'rebar.many', vars: { n: rebar.pieceCount } });
  const shape = { poly: sh.poly, L: sh.L, B: sh.B, rect: isRect(sh.poly), area: area(sh.poly) / 1e6, perimeter: perimeter(sh.poly) / 1000, sides: sh.poly.length };
  const result = { pool, inputProblems, spec, design: d, basis, shape, steps, benches: bn.list, circ, built, net, rebar, quantities: q, problems };
  result.checks = check(d, basis, circ, steps, spec, rebar);
  return result;
}

/** Corners text ("x,y; x,y", mm) → { pts: [[x, y]…], bad: [text that is not a corner] }. */
function parseCornersText(text) {
  const pts = [], bad = [];
  for (const raw of String(text || '').split(/[;\n]+/)) {
    const s = raw.trim(); if (!s) continue;
    const m = s.split(/\s*,\s*/);
    if (m.length === 2 && m.every((v) => v !== '' && Number.isFinite(Number(v)))) pts.push([Number(m[0]), Number(m[1])]); else bad.push(s);
  }
  return { pts, bad };
}
export { pipeTotals };
