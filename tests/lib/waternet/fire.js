/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * fire.js — fire flow at every hydrant (0.9 WN.3). For each node: the pressures with the needed flow drawn there on top of the demand
 * state (peak day, or any multiplier), and the flow available while a residual pressure holds. The residual is checked at the node
 * itself ('node') or at the lowest pressure anywhere in the system ('system', the stricter and the default). Bisection on the draw, using the
 * host's steady solver, so the answer leaves exactly the residual to the tolerance asked.
 *
 *   hydrantNodes(water) → ids of nodes with a hydrant fitting (all junctions when none is marked)
 *   fireFlowAll(water, units, { needed, residual, criterion, nodes, mult, tol, maxFlow }) → { rows, pass, fail, residual, needed }
 *   row: { id, name, available, pressureAtNeeded, systemMinAtNeeded, limitedBy, pass, base }
 */
import { hydraulics, num, pos } from './util.js';

export function hydrantNodes(water) {
  const junctions = (water?.nodes || []).filter((n) => n.kind === 'junction').map((n) => n.id);
  const marked = new Set((water?.fittings || []).filter((f) => f.kind === 'hydrant' && f.host?.node).map((f) => f.host.node));
  const list = junctions.filter((id) => marked.has(id));
  return list.length ? list : junctions;
}

export function fireFlowAll(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const needed = pos(opts.needed, units === 'm' ? 63 : 1000);   // 1000 gpm ≈ 63 L/s: a starting value, the person sets the real one
  const residual = pos(opts.residual, units === 'm' ? 140 : 20);
  const criterion = opts.criterion === 'node' ? 'node' : 'system';
  const mult = pos(opts.mult, 1), tol = Math.min(0.1, Math.max(0.0005, num(opts.tol, 0.01)));
  const maxFlow = pos(opts.maxFlow, needed * 8);
  const ids = (opts.nodes && opts.nodes.length ? opts.nodes : hydrantNodes(W)).filter((id) => W.nodes.some((n) => n.id === id && n.kind === 'junction'));
  const name = new Map(W.nodes.map((n) => [n.id, n.name || n.id]));
  const rows = [];
  for (const id of ids) {
    const at = (f) => {   // the lowest pressure that matters with f drawn at id
      const r = hyd.solve(W, units, { mult, extra: { [id]: f } });
      let sys = Infinity, sysAt = null;
      for (const [nid, n] of r.nodes) if (n.pressure != null && n.pressure < sys) { sys = n.pressure; sysAt = nid; }
      const own = r.nodes.get(id)?.pressure;
      return { node: own == null ? -Infinity : own, system: sys, sysAt, ok: r.ok, isolated: r.problems.some((p) => p.code === 'isolated' && p.id === id) };
    };
    const lim = (x) => (criterion === 'node' ? x.node : Math.min(x.node, x.system));
    const base = at(0);
    if (base.isolated || !Number.isFinite(base.node)) { rows.push({ id, name: name.get(id), available: 0, pressureAtNeeded: null, systemMinAtNeeded: null, limitedBy: 'isolated', pass: false, base: null }); continue; }
    const atNeeded = at(needed);
    let available = 0, limitedBy = null;
    if (lim(base) >= residual) {
      let lo = 0, hi = needed, h = at(hi);
      while (lim(h) >= residual && hi < maxFlow) { lo = hi; hi = Math.min(maxFlow, hi * 1.6); h = at(hi); }
      if (lim(h) >= residual) { available = hi; limitedBy = 'cap'; }
      else {
        for (let i = 0; i < 60 && (hi - lo) > tol * Math.max(lo, 1e-9) && (hi - lo) > 1e-6; i++) { const mid = (lo + hi) / 2; if (lim(at(mid)) >= residual) lo = mid; else hi = mid; }
        available = lo;
        const x = at(hi); limitedBy = criterion === 'node' || x.node <= x.system ? 'node' : 'system';
      }
    } else limitedBy = 'base';   // the residual fails with no fire draw at all
    rows.push({ id, name: name.get(id), available, pressureAtNeeded: atNeeded.node, systemMinAtNeeded: atNeeded.system, systemMinAt: atNeeded.sysAt, limitedBy, pass: available >= needed, base: base.node });
  }
  rows.sort((a, b) => a.available - b.available);
  return { rows, pass: rows.filter((r) => r.pass).length, fail: rows.filter((r) => !r.pass).length, residual, needed, criterion, mult };
}
