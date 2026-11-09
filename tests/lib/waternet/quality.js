/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * quality.js — water quality over an extended-period run (0.9 WN.2): water age, a decaying disinfectant (chlorine), and a source trace.
 * Our own code from the published method (a Lagrangian time-driven transport of plug-flow segments through the pipes, completely
 * mixed junctions and tanks) — no vendored code. The hydraulics are the host's extended run; this walks the water through them.
 *
 *   waterQuality(water, units, opts) → { times, nodes: Map id → { kind, c: [value per hydraulic step], last, max, min } (junctions and tanks), pipes: Map id → { c } , mass, problems }
 *   opts: { mode: 'age' | 'chlorine' | 'trace', hours, step (hydraulic step s), qstep (quality step s, default min(300, step)),
 *           bulk (1/day, chlorine bulk decay, > 0 means decay), wall (m/day, wall coefficient, used as 2·kw/D in 1/day), sources: { nodeId: c } (chlorine mg/L,
 *           reservoirs default to `reservoirC`), reservoirC (default 0 for age, 1 for chlorine), traceNode (trace: the source node), minC, maxAge (hours) }
 *   Units: age in hours; chlorine in mg/L; trace in percent. Decay uses first order: c(t) = c0·exp(−k·t), k in 1/day.
 * Simplifications said in the listing: first-order bulk and wall only; no booster-station rules; a tank is one mixed volume; junctions mix at
 * the start of each quality step. A calculation aid: an engineer checks every result.
 */
import { hydraulics, si, num, pos, problem } from './util.js';

export function waterQuality(water, units, opts = {}) {
  const hyd = hydraulics(), K = si(units);
  const mode = opts.mode === 'chlorine' || opts.mode === 'trace' ? opts.mode : 'age';
  if (typeof hyd.extended !== 'function') throw problem('not_configured');
  const eps = hyd.extended(water, units, { hours: opts.hours, step: opts.step });
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const dt = eps.dt, steps = eps.steps;
  const qstep = Math.max(1, Math.min(dt, pos(opts.qstep, Math.min(300, dt))));
  const bulk = Math.max(0, num(opts.bulk, 0)) / 86400, wall = Math.max(0, num(opts.wall, 0)) / 86400;
  const problems = [];
  const nodes = W.nodes, idx = new Map(nodes.map((n, i) => [n.id, i]));
  const traceIdx = mode === 'trace' ? idx.get(opts.traceNode) : undefined;
  if (mode === 'trace' && traceIdx === undefined) throw problem('trace_node');

  // source value at a fixed-head node
  const source = (n) => {
    if (mode === 'age') return 0;
    if (mode === 'trace') return idx.get(n.id) === traceIdx ? 100 : 0;
    const s = opts.sources && opts.sources[n.id];
    return s != null ? Math.max(0, Number(s)) : (n.kind === 'reservoir' ? (opts.reservoirC ?? 1) : null);
  };

  // pipes (non-pump links carry volume; a pump or valve is a point, no volume)
  const links = W.pipes.map((p) => {
    const a = idx.get(p.a), b = idx.get(p.b);
    let len = p.length;
    if (len == null) { const A = nodes[a], B = nodes[b]; len = Math.hypot(A.x - B.x, A.y - B.y); }
    const D = (p.kind === 'pipe' ? (p.d || 0) * K.dia : 0), Lm = len * K.len;
    const vol = p.kind === 'pipe' && D > 0 ? Math.PI * D * D / 4 * Lm : 0;
    const k = bulk + (D > 0 ? 2 * wall / D : 0);   // 1/s, first order
    return { id: p.id, a, b, vol, k, segs: vol > 0 ? [{ v: vol, c: 0 }] : [], dir: 1 };
  });
  // tanks: one mixed volume
  const tankVol = new Map(), conc = new Float64Array(nodes.length);
  nodes.forEach((n, i) => {
    if (n.kind === 'tank') tankVol.set(i, Math.PI * Math.pow(n.diameter * K.len, 2) / 4 * Math.max(0.01, (steps[0].tanks[n.id]?.level ?? n.level) * K.len));
    const s = n.kind !== 'junction' ? source(n) : null;
    if (n.kind === 'tank') conc[i] = mode === 'chlorine' ? Math.max(0, num(opts.tankC?.[n.id], 0)) : 0;
    else if (s != null) conc[i] = s;
  });
  for (const l of links) for (const s of l.segs) s.c = mode === 'chlorine' ? Math.max(0, num(opts.initialC, 0)) : 0;
  const fixedC = (i) => { const n = nodes[i]; return n.kind === 'reservoir' ? source(n) : null; };

  const times = [], out = new Map(nodes.map((n) => [n.id, { c: [] }])), pipeOut = new Map(links.map((l) => [l.id, { c: [] }]));
  const record = (t) => {
    times.push(t / 3600);
    nodes.forEach((n, i) => out.get(n.id).c.push(conc[i]));
    for (const l of links) { let m = 0, v = 0; for (const s of l.segs) { m += s.c * s.v; v += s.v; } pipeOut.get(l.id).c.push(v > 0 ? m / v : 0); }
  };
  record(0);
  for (let s = 0; s < steps.length - 1; s++) {
    const st = steps[s];
    // flows (m³/s) for this hydraulic step
    const Q = links.map((l) => { const r = st.pipes.get(l.id); return r ? r.q * K.q : 0; });
    // tank volumes track the hydraulic step's levels
    nodes.forEach((n, i) => { if (n.kind === 'tank') tankVol.set(i, Math.max(1e-6, Math.PI * Math.pow(n.diameter * K.len, 2) / 4 * (st.tanks[n.id].level * K.len))); });
    let left = dt;
    while (left > 1e-9) {
      const h = Math.min(qstep, left); left -= h;
      // 1. react (age grows, chlorine decays) in every pipe segment and tank
      for (const l of links) for (const g of l.segs) {
        if (mode === 'age') g.c += h / 3600; else if (mode === 'chlorine') g.c *= Math.exp(-l.k * h);
      }
      if (mode === 'age') nodes.forEach((n, i) => { if (n.kind === 'tank') conc[i] += h / 3600; });
      else if (mode === 'chlorine') nodes.forEach((n, i) => { if (n.kind === 'tank') conc[i] *= Math.exp(-bulk * h); });
      // 2. move water through the pipes: what leaves the downstream end is mixed at the end node
      const mass = new Float64Array(nodes.length), vin = new Float64Array(nodes.length);
      links.forEach((l, j) => {
        const q = Q[j], flow = Math.abs(q) * h, from = q >= 0 ? l.a : l.b, to = q >= 0 ? l.b : l.a;
        if (!(flow > 0)) return;
        if (l.vol <= 0) { const cc = conc[from]; mass[to] += cc * flow; vin[to] += flow; return; }   // a pump or valve passes the water through
        const want = q >= 0 ? 1 : -1;
        if (l.dir !== want) { l.segs.reverse(); l.dir = want; }   // segs run upstream → downstream in the direction of flow
        let take = flow, m = 0;
        while (take > 1e-15 && l.segs.length) {
          const g = l.segs[l.segs.length - 1];
          if (g.v <= take) { m += g.c * g.v; take -= g.v; l.segs.pop(); } else { g.v -= take; m += g.c * take; take = 0; }
        }
        if (take > 0) m += conc[from] * take;   // more than a pipeful in one step: the rest is the inflow itself
        l.segs.unshift({ v: Math.min(flow, l.vol), c: conc[from] });
        mass[to] += m; vin[to] += flow;
      });
      // 3. mix at the nodes
      nodes.forEach((n, i) => {
        const fc = fixedC(i);
        if (fc != null) { conc[i] = fc; return; }
        if (n.kind === 'tank') {   // one completely mixed volume: what came in mixes with what was there; what left went at its value
          const V = tankVol.get(i);
          if (vin[i] > 0) conc[i] = (conc[i] * V + mass[i]) / (V + vin[i]);
          return;
        }
        if (vin[i] > 1e-15) conc[i] = mass[i] / vin[i];
        else if (mode === 'age') conc[i] += h / 3600;   // water standing at a dead-end node keeps ageing
      });
    }
    record((s + 1) * dt);
  }
  const summary = new Map();
  for (const [id, o] of out) {
    const n = nodes[idx.get(id)];
    if (n.kind === 'reservoir') continue;
    const tail = o.c.slice(Math.max(1, o.c.length - Math.round(86400 / dt)));
    summary.set(id, { kind: n.kind, c: o.c, last: o.c[o.c.length - 1], max: Math.max(...tail), min: Math.min(...tail) });
    if (n.kind !== 'junction') continue;
    if (mode === 'chlorine' && opts.minC != null && summary.get(id).min < opts.minC) problems.push({ code: 'lowcl', id, value: summary.get(id).min, limit: opts.minC });
    if (mode === 'age' && opts.maxAge != null && summary.get(id).max > opts.maxAge) problems.push({ code: 'oldwater', id, value: summary.get(id).max, limit: opts.maxAge });
  }
  return { mode, times, nodes: summary, pipes: pipeOut, problems, hydraulic: { steps: steps.length, problems: eps.problems } };
}
