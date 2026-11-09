/* SPDX-License-Identifier: Apache-2.0 */
/**
 * people.js — people flow and evacuation on the discrete-event engine (0.8 XE.5).
 * Method: the hydraulic (flow-limited) egress model of the engineering literature — Predtechenskii & Milinskii, Pauls and Nelson & MacLennan in the SFPE
 * Handbook of Fire Protection Engineering: walking speed S, specific flow Fs = S·D, effective width = width − 2 × boundary layer, a passage releases at most
 * Fsm × effective width persons per second, then people walk its length at the unimpeded speed. Queues form at the doors; nothing here is a crowd-dynamics
 * model (no density-dependent speed, no social forces, no counter-flow). The constants below are those commonly cited for level corridors and doors;
 * they are parameters, listed as a note in every result, and must be checked against the code the design answers to before the figure is relied on.
 *
 *   egress({rooms, passages, exits, options}) → {ok, model, run(opts), problems}
 *   rooms     [{id, people?: n, pre?: dist, area?: m²}]               pre = pre-movement time distribution (s), default 0
 *   passages  [{id, from, to, length, width, kind?: 'door'|'corridor'|'stair', speed?, fsm?}]   two-way unless `oneway`; metres
 *   exits     [room ids]   rooms that are outside (or a place of safety)
 *   options   {routing: 'static'|'dynamic', fsm: 1.32, boundary: 0.15, speed: 1.4, stairSpeed: 0.8, stairFsm: 1.0, limit?: seconds, maxDensity?: p/m²}
 */
import { Graph } from './agv.js';
import { problem, simulate } from './engine.js';
import { mean } from './rng.js';

export const DEFAULTS = { routing: 'static', fsm: 1.32, boundary: 0.15, speed: 1.4, stairSpeed: 0.8, stairFsm: 1.0 };
/** persons per second through a passage of `width` with a boundary layer on each side */
export const flowRate = (width, fsm = DEFAULTS.fsm, boundary = DEFAULTS.boundary) => Math.max(0, fsm * (width - 2 * boundary));
/** Nelson & MacLennan: speed S = k (1 − 0.266 D) with D in persons/m², k = 1.4 m/s on level ground; specific flow Fs = S·D. */
export const speedAtDensity = (D, k = 1.4) => k * (1 - 0.266 * D);
export const specificFlow = (D, k = 1.4) => D * speedAtDensity(D, k);

export function egress(spec) {
  const o = { ...DEFAULTS, ...(spec.options || {}) }, P = [], used = new Set();
  const rooms = spec.rooms || [], passages = spec.passages || [], exits = new Set(spec.exits || []);
  const ids = new Set(rooms.map((r) => r.id)), nodes = [];
  if (!rooms.length || !passages.length && ![...exits].some((e) => ids.has(e))) P.push(problem('egress.empty', 'error', 'An egress model needs rooms, passages and at least one exit.'));
  for (const e of exits) if (!ids.has(e)) P.push(problem('egress.exit', 'error', `Exit "${e}" is not a room.`, [{ id: e }]));
  if (!exits.size) P.push(problem('egress.exit', 'error', 'The model has no exit.'));
  const edges = [];
  for (const p of passages) {
    if (!ids.has(p.from) || !ids.has(p.to)) { P.push(problem('egress.passage', 'error', `Passage "${p.id}" joins an unknown room.`, [{ id: p.id }])); continue; }
    if (!(p.length > 0)) { P.push(problem('egress.passage', 'error', `Passage "${p.id}" needs a length > 0.`, [{ id: p.id }])); continue; }
    const stair = p.kind === 'stair', fsm = p.fsm ?? (stair ? o.stairFsm : o.fsm), rate = flowRate(p.width, fsm, o.boundary);
    if (!(rate > 0)) { P.push(problem('egress.width', 'error', `Passage "${p.id}" is ${p.width} m wide; after the ${o.boundary} m boundary layer on each side nothing is left to walk through.`, [{ id: p.id }], { found: p.width, req: 2 * o.boundary })); continue; }
    if (stair && p.speed === undefined) used.add('stairSpeed'); if (stair && p.fsm === undefined) used.add('stairFsm');
    edges.push({ ...p, fsm, rate, v: p.speed ?? (stair ? o.stairSpeed : o.speed) });
  }
  const g = new Graph({ nodes: Object.fromEntries(rooms.map((r) => [r.id, [0, 0]])), edges: edges.map((e) => [e.from, e.to, e.length, { oneway: !!e.oneway }]) });
  // distance from each room to the nearest exit, measured in walking time
  const walk = new Graph({ nodes: g.nodes, edges: edges.map((e) => [e.from, e.to, e.length / e.v, { oneway: !!e.oneway }]) });
  const toExit = (r) => Math.min(...[...exits].map((x) => walk.distance(r, x)));
  const out = new Map(), nodeFor = (e, dir) => {
    const key = e.id + (dir > 0 ? '>' : '<'); if (out.has(key)) return out.get(key);
    const from = dir > 0 ? e.from : e.to, to = dir > 0 ? e.to : e.from, door = `door:${key}`, wk = `walk:${key}`;
    nodes.push({ type: 'server', name: door, units: 1, service: 1 / e.rate, to: wk, leaves: `room:${from}` });
    nodes.push({ type: 'delay', name: wk, time: e.length / e.v, to: `room:${to}` });
    out.set(key, door); return door;
  };
  const fromRoom = (r) => edges.flatMap((e) => (e.from === r ? [[e, 1, e.to]] : []).concat(!e.oneway && e.to === r ? [[e, -1, e.from]] : []));
  for (const r of rooms) {
    if (exits.has(r.id)) { nodes.push({ type: 'sink', name: `room:${r.id}` }); continue; }
    const d0 = toExit(r.id);
    if (!Number.isFinite(d0)) { if ((r.people || 0) > 0) P.push(problem('egress.noexit', 'error', `People in "${r.id}" have no way to an exit.`, [{ id: r.id }], { found: r.people })); nodes.push({ type: 'sink', name: `room:${r.id}` }); continue; }
    // next hops that get strictly closer to an exit
    const hops = fromRoom(r.id).map(([e, dir, next]) => ({ e, dir, next, rest: e.length / e.v + toExit(next) })).filter((h) => h.rest < Infinity && toExit(h.next) < d0 - 1e-9);
    hops.sort((a, b) => a.rest - b.rest);
    let to;
    if (o.routing === 'dynamic' && hops.length > 1) to = { least: hops.map((h) => ({ to: nodeFor(h.e, h.dir), extra: h.rest })) };
    else to = nodeFor(hops[0].e, hops[0].dir);
    nodes.push({ type: 'junction', name: `room:${r.id}`, to });
    if ((r.people || 0) > 0) nodes.push({ type: 'burst', name: `people:${r.id}`, count: r.people, at: r.pre ?? 0, to: `room:${r.id}` });
  }
  if (used.size) P.push(problem('egress.placeholder', 'warning', `Stair passages without a ${[...used].map((u) => (u === 'stairSpeed' ? 'speed' : 'fsm')).join(' or ')} use placeholder values (${o.stairSpeed} m/s, ${o.stairFsm} persons/s/m); set them from the code the design answers to.`, [], { found: { stairSpeed: o.stairSpeed, stairFsm: o.stairFsm } }));
  P.push(problem('egress.basis', 'note', `Flow-limited hydraulic model: specific flow ${o.fsm} persons/s/m, boundary layer ${o.boundary} m each side, unimpeded speed ${o.speed} m/s. No speed reduction with density and no counter-flow.`));
  const model = { nodes };
  const run = ({ seed = 1, until = 36000 } = {}) => {
    const s = simulate(model, { until, seed });
    if (!s.ok) return { ok: false, problems: s.problems };
    const r = s.result, problems = [...P.filter((p) => p.severity !== "error"), ...s.problems], byExit = {}; let total = 0, last = 0, placed = 0;
    for (const x of exits) { const n = r.nodes[`room:${x}`]; if (!n) continue; byExit[x] = { count: n.count, first: n.first, last: n.last, cycle: n.cycle }; total += n.count; if (n.last > last) last = n.last; }
    for (const q of rooms) placed += q.people || 0;
    const roomsOut = {}, pass = {};
    for (const q of rooms) { const n = r.nodes[`room:${q.id}`]; if (n && n.type === 'junction') roomsOut[q.id] = { peak: n.inside.max, density: q.area ? n.inside.max / q.area : null }; }
    for (const [name, n] of Object.entries(r.nodes)) if (name.startsWith('door:')) pass[name.slice(5)] = { passed: n.completed, peakQueue: n.queue.max, busy: n.utilization };
    if (total < placed) problems.push(problem('egress.incomplete', 'error', `${placed - total} of ${placed} people had not reached an exit when the run ended at ${until} s.`, [], { found: total, req: placed }));
    if (o.limit && last > o.limit) problems.push(problem('egress.time', 'warning', `The last person reaches an exit at ${last.toFixed(1)} s; the limit is ${o.limit} s.`, [], { found: last, req: o.limit }));
    if (o.maxDensity) for (const [id, v] of Object.entries(roomsOut)) if (v.density !== null && v.density > o.maxDensity) problems.push(problem('egress.density', 'warning', `Room "${id}" peaks at ${v.density.toFixed(2)} persons/m², above the ${o.maxDensity} you set.`, [{ id }], { found: v.density, req: o.maxDensity }));
    return { ok: true, evacuated: total, placed, time: last, byExit, rooms: roomsOut, passages: pass, result: r, problems };
  };
  const ok = !P.some((p) => p.severity === 'error');
  return { ok, model: ok ? model : null, run: ok ? run : () => ({ ok: false, problems: P }), problems: P, options: o };
}
