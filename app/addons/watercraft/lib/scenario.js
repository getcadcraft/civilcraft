/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * scenario.js — scenarios compared side by side (0.11 WN.8). A scenario is a name and a list of changes to the base network; each is solved
 * the same way and the results are set in columns with the difference from the first.
 *
 * Text form, one change a line (a line starting `scenario` opens a new scenario; `#` comments):
 *   scenario Peak day            demand x1.5  [nodes a,b]      every demand (or the listed junctions) times 1.5
 *   close P12                    open P12                       a main out of service / back
 *   diameter P3 16               c P4 80                        a pipe's diameter / roughness
 *   demand J5 120                a junction's demand
 *   pump P1 off | on             tank T1 level 130              reservoir R1 head 820
 *   fire J9 1500                 a fire draw (project flow units) on top of the demand
 *
 *   parseScenarios(text) → { scenarios: [{ name, changes }], errors }
 *   applyChanges(water, changes, units) → { water, mult, extra, notes }
 *   runScenario(water, units, scenario, { pdd }) → { name, metrics, nodes: Map, pipes: Map }
 *   compareScenarios(water, units, scenarios, opts) → { names, metrics: [{ key, values, deltas }], nodes: [{ id, values, deltas }], pipes: [...] }
 *   comparisonCsv(cmp)
 */
import { hydraulics, num, pos } from './util.js';
import { solveState } from './control.js';
import { solvePDD } from './pdd.js';
import { toCsv } from './report.js';

export function parseScenarios(text) {
  const scenarios = [], errors = []; let cur = null;
  String(text || '').split(/\r?\n/).forEach((raw, i) => {
    const line = raw.replace(/#.*$/, '').trim(); if (!line) return;
    const w = line.split(/\s+/), k = w[0].toLowerCase();
    if (k === 'scenario') { cur = { name: w.slice(1).join(' ') || 'Scenario ' + (scenarios.length + 1), changes: [] }; scenarios.push(cur); return; }
    if (!cur) { cur = { name: 'Scenario 1', changes: [] }; scenarios.push(cur); }
    const bad = () => errors.push({ line: i + 1, text: raw.trim() });
    if (k === 'demand' && /^x[\d.]+$/i.test(w[1] || '')) { const nodes = w[2] === 'nodes' ? (w[3] || '').split(',').filter(Boolean) : null; cur.changes.push({ kind: 'demandMult', mult: Number(w[1].slice(1)), nodes }); }
    else if (k === 'demand' && w.length === 3 && num(w[2]) != null) cur.changes.push({ kind: 'nodeDemand', node: w[1], demand: Number(w[2]) });
    else if ((k === 'close' || k === 'open') && w[1]) cur.changes.push({ kind: 'pipeStatus', pipe: w[1], status: k === 'close' ? 'closed' : 'open' });
    else if (k === 'diameter' && pos(w[2])) cur.changes.push({ kind: 'pipeDiameter', pipe: w[1], d: Number(w[2]) });
    else if (k === 'c' && pos(w[2])) cur.changes.push({ kind: 'pipeC', pipe: w[1], c: Number(w[2]) });
    else if (k === 'pump' && /^(on|off)$/i.test(w[2] || '')) cur.changes.push({ kind: 'pump', pump: w[1], on: w[2].toLowerCase() === 'on' });
    else if (k === 'tank' && w[2] === 'level' && num(w[3]) != null) cur.changes.push({ kind: 'tankLevel', node: w[1], level: Number(w[3]) });
    else if (k === 'reservoir' && w[2] === 'head' && num(w[3]) != null) cur.changes.push({ kind: 'reservoirHead', node: w[1], head: Number(w[3]) });
    else if (k === 'fire' && pos(w[2])) cur.changes.push({ kind: 'fire', node: w[1], flow: Number(w[2]) });
    else bad();
  });
  return { scenarios, errors };
}

export function applyChanges(water, changes, units = 'ft') {
  const hyd = hydraulics();
  const W = JSON.parse(JSON.stringify(hyd.cleanWater ? hyd.cleanWater(water, units) : water));
  let mult = 1; const extra = {}, notes = [], pumpOff = new Set();
  const node = (id) => W.nodes.find((n) => n.id === id), pipe = (id) => W.pipes.find((p) => p.id === id);
  for (const c of changes || []) {
    if (c.kind === 'demandMult') { if (c.nodes && c.nodes.length) for (const id of c.nodes) { const n = node(id); if (n) n.demand *= c.mult; else notes.push({ code: 'no_node', id }); } else mult *= c.mult; }
    else if (c.kind === 'nodeDemand') { const n = node(c.node); if (n && n.kind === 'junction') n.demand = Math.max(0, c.demand); else notes.push({ code: 'no_node', id: c.node }); }
    else if (c.kind === 'pipeStatus') { const p = pipe(c.pipe); if (p) p.status = c.status; else notes.push({ code: 'no_pipe', id: c.pipe }); }
    else if (c.kind === 'pipeDiameter') { const p = pipe(c.pipe); if (p && p.kind === 'pipe') p.d = c.d; else notes.push({ code: 'no_pipe', id: c.pipe }); }
    else if (c.kind === 'pipeC') { const p = pipe(c.pipe); if (p) p.c = c.c; else notes.push({ code: 'no_pipe', id: c.pipe }); }
    else if (c.kind === 'pump') { const p = pipe(c.pump); if (p && p.kind === 'pump') { if (!c.on) pumpOff.add(p.id); } else notes.push({ code: 'no_pump', id: c.pump }); }
    else if (c.kind === 'tankLevel') { const n = node(c.node); if (n && n.kind === 'tank') n.level = Math.min(n.maxLevel, Math.max(n.minLevel, c.level)); else notes.push({ code: 'no_tank', id: c.node }); }
    else if (c.kind === 'reservoirHead') { const n = node(c.node); if (n && n.kind === 'reservoir') n.head = c.head; else notes.push({ code: 'no_reservoir', id: c.node }); }
    else if (c.kind === 'fire') { const n = node(c.node); if (n && n.kind === 'junction') extra[c.node] = (extra[c.node] || 0) + c.flow; else notes.push({ code: 'no_node', id: c.node }); }
  }
  return { water: W, mult, extra, notes, pumpOff };
}

export function runScenario(water, units, scenario, opts = {}) {
  const hyd = hydraulics();
  const base = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const a = applyChanges(base, scenario.changes, units);
  const pumpOn = {}; for (const id of a.pumpOff) pumpOn[id] = false;
  const common = { mult: a.mult, pumpOn, extra: a.extra };
  const r = opts.pdd ? solvePDD(a.water, units, { ...common, ...opts.pdd }) : solveState(a.water, units, common);
  const S = a.water.settings;
  let minP = Infinity, maxP = -Infinity, low = 0, high = 0, fast = 0, maxV = 0, demand = 0, cut = 0, minAt = null;
  for (const [id, n] of r.nodes) if (n.kind === 'junction') {
    if (n.pressure == null) { cut += n.demand; continue; }
    if (n.pressure < minP) { minP = n.pressure; minAt = id; } if (n.pressure > maxP) maxP = n.pressure;
    if (n.pressure < S.minP) low++; if (n.pressure > S.maxP) high++;
    demand += n.demand;
  }
  for (const p of r.pipes.values()) if (p.kind === 'pipe' && p.v != null) { maxV = Math.max(maxV, p.v); if (p.v > S.vMax) fast++; }
  let supplied = 0; for (const n of r.nodes.values()) if (n.kind !== 'junction' && n.inflow != null && n.inflow < 0) supplied -= n.inflow;
  return { name: scenario.name, notes: a.notes, nodes: r.nodes, pipes: r.pipes, ok: r.ok, metrics: { minPressure: Number.isFinite(minP) ? minP : null, minPressureAt: minAt, maxPressure: Number.isFinite(maxP) ? maxP : null, lowNodes: low, highNodes: high, maxVelocity: maxV, fastPipes: fast, demandServed: opts.pdd ? r.delivered : demand, demandCutOff: cut, deficit: opts.pdd ? r.deficit : 0, supplied, converged: r.ok ? 1 : 0 } };
}

const METRICS = ['minPressure', 'maxPressure', 'lowNodes', 'highNodes', 'maxVelocity', 'fastPipes', 'demandServed', 'demandCutOff', 'deficit', 'supplied'];
export function compareScenarios(water, units, scenarios, opts = {}) {
  const runs = scenarios.map((s) => runScenario(water, units, s, opts));
  const d = (vals) => vals.map((v, i) => (i === 0 || v == null || vals[0] == null ? null : v - vals[0]));
  const metrics = METRICS.map((key) => { const values = runs.map((r) => r.metrics[key]); return { key, values, deltas: d(values) }; });
  const ids = [...runs[0].nodes.keys()].filter((id) => runs[0].nodes.get(id).kind === 'junction');
  const nodes = ids.map((id) => { const values = runs.map((r) => r.nodes.get(id)?.pressure ?? null); return { id, values, deltas: d(values) }; });
  const pids = [...runs[0].pipes.keys()];
  const pipes = pids.map((id) => { const values = runs.map((r) => r.pipes.get(id)?.q ?? null); return { id, values, deltas: d(values) }; });
  return { names: runs.map((r) => r.name), metrics, nodes, pipes, runs, notes: runs.flatMap((r) => r.notes.map((n) => ({ ...n, scenario: r.name }))) };
}

export const comparisonCsv = (cmp, kind = 'metrics') => {
  const rows = (cmp[kind] || []).map((r) => [r.key ?? r.id, ...r.values.flatMap((v, i) => (i === 0 ? [v] : [v, r.deltas[i]]))]);
  const head = [kind === 'metrics' ? 'Measure' : kind === 'nodes' ? 'Node (pressure)' : 'Pipe (flow)', ...cmp.names.flatMap((n, i) => (i === 0 ? [n] : [n, n + ' change']))];
  return toCsv(head, rows);
};
