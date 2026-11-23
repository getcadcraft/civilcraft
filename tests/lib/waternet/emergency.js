/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * emergency.js — emergency-event runs (0.11 WN.15): what happens, and for how long, when something goes wrong. Each event is a run of the
 * stepped simulator (control.js) with the event laid on top of the normal day:
 *
 *   break  { pipe | segment, fromHours }   a main out of service: its isolation segment (valves) or just the pipe when no valves are drawn
 *   fire   { node, flow, fromHours, toHours }   a fire draw at a hydrant on top of the demand
 *   power  { pumps: [ids] (default all), fromHours, toHours }   pumps stopped (a power cut)
 *
 *   runEmergency(water, units, event, { hours, step, minP, rules, valves, mult }) → { event, closed, summary, rows, tanks, nodes }
 *   summary: { hoursRun, unservedDemand, unservedNodes, minPressure, firstLowAt (hours, or null), lowNodes: [{ id, minPressure, hoursLow }],
 *              tanks: [{ id, startLevel, endLevel, minLevel, emptyAt (hours or null) }], problems }
 * A node cut off from every source counts as unserved the whole time it is cut off; "low" is under the project's minimum pressure.
 */
import { hydraulics, pos } from './util.js';
import { isolationSegments } from './critical.js';
import { simulate } from './control.js';

export function runEmergency(water, units, event, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const hours = pos(opts.hours, 6), minP = pos(opts.minP, W.settings.minP);
  const from = Number(event.fromHours ?? 0), to = Number(event.toHours ?? hours + 1);
  const run = { hours, step: opts.step || 900, reportStep: opts.reportStep || 900, rules: opts.rules, valves: opts.valves, patternStep: opts.patternStep, pattern: opts.mult != null ? [opts.mult] : opts.pattern };
  let closed = [];
  if (event.kind === 'break') {
    const segs = isolationSegments(W);
    const seg = event.segment ? segs.find((s) => s.id === event.segment) : null;
    closed = seg ? seg.pipes.slice() : [event.pipe];
    if (!event.segment && opts.useValves) { const s = segs.find((x) => x.pipes.includes(event.pipe)); if (s && s.pipes.length < W.pipes.length) closed = s.pipes.slice(); }
    run.outages = closed.map((id) => ({ link: id, fromHours: from, toHours: 1e9 }));
  } else if (event.kind === 'fire') run.draws = [{ node: event.node, flow: event.flow, fromHours: from, toHours: to }];
  else if (event.kind === 'power') {
    const pumps = (event.pumps && event.pumps.length ? event.pumps : W.pipes.filter((p) => p.kind === 'pump').map((p) => p.id));
    closed = pumps; run.outages = pumps.map((id) => ({ link: id, fromHours: from, toHours: to }));
  } else throw Object.assign(new Error('bad_event'), { code: 'bad_event' });
  const sim = simulate(W, units, run);
  const junctions = W.nodes.filter((n) => n.kind === 'junction');
  const rows = sim.rows;
  const low = new Map(junctions.map((n) => [n.id, { id: n.id, minPressure: Infinity, hoursLow: 0 }]));
  let firstLowAt = null, minPressure = Infinity, unserved = 0, unservedNodes = new Set();
  const base = rows.find((r) => r.t >= 0);
  rows.forEach((r, i) => {
    const dt = (rows[i + 1] ? rows[i + 1].t : r.t + sim.reportStep) - r.t;
    if (r.t < from * 3600) return;
    let cut = 0;
    for (const n of junctions) {
      const x = r.nodes.get(n.id), L = low.get(n.id);
      if (!x || x.pressure == null) { unservedNodes.add(n.id); cut += (base.nodes.get(n.id)?.demand || 0); L.minPressure = -Infinity; L.hoursLow += dt / 3600; if (firstLowAt == null) firstLowAt = r.t / 3600; continue; }
      L.minPressure = Math.min(L.minPressure, x.pressure); minPressure = Math.min(minPressure, x.pressure);
      if (x.pressure < minP) { L.hoursLow += dt / 3600; if (firstLowAt == null) firstLowAt = r.t / 3600; }
    }
    unserved = Math.max(unserved, cut);
  });
  const tanks = W.nodes.filter((n) => n.kind === 'tank').map((n) => {
    const lv = rows.map((r) => r.tanks[n.id].level), emp = sim.problems.find((p) => p.code === 'tankempty' && p.id === n.id);
    return { id: n.id, startLevel: lv[0], endLevel: lv[lv.length - 1], minLevel: Math.min(...lv), emptyAt: emp ? emp.t / 3600 : null };
  });
  return { event, closed, rows, sim, summary: { hoursRun: hours, unservedDemand: unserved, unservedNodes: [...unservedNodes], minPressure: Number.isFinite(minPressure) ? minPressure : null, firstLowAt,
    lowNodes: [...low.values()].filter((x) => x.hoursLow > 0).sort((a, b) => b.hoursLow - a.hoursLow), tanks, problems: sim.problems } };
}
