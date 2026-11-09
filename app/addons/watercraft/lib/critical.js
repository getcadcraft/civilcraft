/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * critical.js — criticality and isolation (0.9 WN.4): what happens if this main is out of service. Each outage closes the pipe (or the whole
 * isolation segment) and re-solves; the row says how much demand is cut off, how many nodes drop under the minimum pressure, and the lowest
 * pressure left. The valves are the hydrant/valve fittings on a pipe (`host.pipe`, `t`); a segment is what lies between valves.
 *
 *   isolationSegments(water) → [{ id, pipes, nodes, valves }]     (a pipe with no valve on it is never cut: segments are only as fine as the valves)
 *   criticality(water, units, { by: 'pipe' | 'segment', only: [ids], mult, minP }) → { rows, base }
 *   row: { id, name, pipes, closed, unservedDemand, unservedNodes: [ids], lowNodes, minPressure, converged, score }
 * A pipe that a valve cuts partly is closed whole (the model has no half pipe): the outage it shows is a little worse than the real one.
 */
import { hydraulics, pos } from './util.js';

export function isolationSegments(water) {
  const nodes = water?.nodes || [], pipes = water?.pipes || [];
  const valves = new Map();   // pipe id → sorted t of valves on it
  for (const f of water?.fittings || []) if (f.kind === 'valve' && f.host?.pipe) { const a = valves.get(f.host.pipe) || []; a.push(f.host.t ?? 0.5); valves.set(f.host.pipe, a); }
  const parent = new Map();
  const find = (x) => { let r = x; while (parent.get(r) !== r) r = parent.get(r); while (parent.get(x) !== r) { const n = parent.get(x); parent.set(x, r); x = n; } return r; };
  const uni = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent.set(ra, rb); };
  for (const n of nodes) parent.set('n:' + n.id, 'n:' + n.id);
  const piece = (p, i) => 'p:' + p.id + ':' + i;
  for (const p of pipes) {
    const k = (valves.get(p.id) || []).length;
    for (let i = 0; i <= k; i++) parent.set(piece(p, i), piece(p, i));
    uni(piece(p, 0), 'n:' + p.a); uni(piece(p, k), 'n:' + p.b);   // the ends hang on their nodes
  }
  const out = new Map();
  const touch = (root) => { if (!out.has(root)) out.set(root, { pipes: new Set(), nodes: new Set(), valves: 0 }); return out.get(root); };
  for (const n of nodes) touch(find('n:' + n.id)).nodes.add(n.id);
  for (const p of pipes) { const k = (valves.get(p.id) || []).length; for (let i = 0; i <= k; i++) touch(find(piece(p, i))).pipes.add(p.id); }
  let i = 0;
  return [...out.values()].filter((s) => s.pipes.size).map((s) => ({ id: 'S' + (++i), pipes: [...s.pipes], nodes: [...s.nodes], valves: [...s.pipes].reduce((a, id) => a + (valves.get(id)?.length || 0), 0) }));
}

export function criticality(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const mult = pos(opts.mult, 1);
  const base = hyd.solve(W, units, { mult });
  const minP = pos(opts.minP, W.settings?.minP ?? (units === 'm' ? 140 : 20));
  const demandOf = (r, id) => r.nodes.get(id)?.demand || 0;
  const units_ = [];
  if (opts.by === 'segment') for (const s of isolationSegments(W)) units_.push({ id: s.id, name: s.id, pipes: s.pipes });
  else for (const p of W.pipes) if (p.kind === 'pipe' && p.status !== 'closed') units_.push({ id: p.id, name: p.name || p.id, pipes: [p.id] });
  const only = opts.only ? new Set(opts.only) : null;
  const rows = [];
  for (const u of units_) {
    if (only && !only.has(u.id)) continue;
    const closed = new Set(u.pipes);
    const w2 = { ...W, pipes: W.pipes.map((p) => (closed.has(p.id) ? { ...p, status: 'closed' } : p)) };
    const r = hyd.solve(w2, units, { mult });
    const cut = r.problems.filter((p) => p.code === 'isolated').map((p) => p.id);
    let unserved = 0; for (const id of cut) unserved += demandOf(base, id);
    let low = 0, lowest = Infinity;
    for (const [id, n] of r.nodes) {
      if (n.kind !== 'junction' || n.pressure == null) continue;
      if (n.pressure < minP && (base.nodes.get(id)?.pressure ?? Infinity) >= minP) low++;
      if (n.pressure < lowest) lowest = n.pressure;
    }
    rows.push({ id: u.id, name: u.name, pipes: u.pipes, closed: u.pipes.length, unservedDemand: unserved, unservedNodes: cut, lowNodes: low, minPressure: Number.isFinite(lowest) ? lowest : null, converged: r.ok, score: unserved + low });
  }
  rows.sort((a, b) => b.unservedDemand - a.unservedDemand || b.lowNodes - a.lowNodes || a.id.localeCompare(b.id));
  return { rows, base: { minPressure: (() => { let m = Infinity; for (const n of base.nodes.values()) if (n.pressure != null && n.pressure < m) m = n.pressure; return Number.isFinite(m) ? m : null; })(), demand: base.totals?.demand ?? 0 }, minP, by: opts.by === 'segment' ? 'segment' : 'pipe' };
}
