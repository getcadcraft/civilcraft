/* SPDX-License-Identifier: Apache-2.0 */
/**
 * playback.js — where every load and vehicle is at time t, from a run's trace (0.8 SU.858 step 4, session sx-flow). DOM-free;
 * the 3D view (view.js) only draws what frame() returns.
 *
 *   const pl = makePlayer(result.trace, built)      built = layout.buildGraph(layout) (geometry + the graph's speeds)
 *   makePlayer(sim.trace, built, { live: true })     for a run still going (realtime.js): reads the trace as it grows
 *   pl.until                                        the last traced time (s)
 *   pl.frame(t) → { loads: [{id, type, L, p: [x, y, z], h}], vehicles: [{n, p, h, loaded}] }
 *
 * Conveyors: a load's tail is at min(v·t + c, S) (accumulating belts, the regimes sim.js recorded) or D(t) − De (belts that
 * stop); it is drawn at its middle (tail + L/2) on the belt's centre line. Stations: loads in service on the station, waiting
 * ones in a row before its input; buffers, pickups, drops and sources: a row back from the output. Moving forward in time
 * keeps a running set (cheap); a jump back rebuilds it.
 */

export function makePlayer(trace, built, { live = false } = {}) {
  const geom = built.geom;
  const spec = Object.fromEntries(built.graph.elements.map((e) => [e.id, e]));
  // a live trace (sim.js stepping in real time) is still being written: records come in time order, so read it in place
  const res = trace ? (live ? trace.res : trace.res.slice().sort((a, b) => a.t0 - b.t0)) : [];
  const belts = trace ? trace.belts : {};
  const moves = new Map();
  let seenMoves = 0;
  const takeMoves = () => {
    const vs = trace ? trace.vehicles : [];
    for (; seenMoves < vs.length; seenMoves++) { const m = vs[seenMoves]; if (!moves.has(m.v)) moves.set(m.v, []); moves.get(m.v).push(m); }
  };
  takeMoves();
  let next = 0, active = [], last = -Infinity;

  const advance = (t) => {
    if (t < last) { next = 0; active = []; }
    while (next < res.length && res[next].t0 <= t) active.push(res[next++]);
    active = active.filter((r) => r.t1 > t);
    last = t;
  };

  const along = (id, s) => { const g = geom[id]; return g && g.path ? g.path.at(s) : null; };
  const back = (port, d) => { const r = (port.h * Math.PI) / 180; return { p: [port.p[0] - d * Math.cos(r), port.p[1] - d * Math.sin(r), port.p[2]], h: port.h }; };

  function beltD(id, t) {
    const h = belts[id];
    if (!h || !h.length) return null;
    let lo = 0, hi = h.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (h[m][0] <= t) lo = m; else hi = m - 1; }
    const [t0, D0, run] = h[lo];
    return D0 + (run ? spec[id].speed * (t - t0) : 0);
  }

  function vehicleAt(n, t) {
    const ms = moves.get(n) || [];
    let m = ms[0];
    for (const x of ms) { if (x.t0 <= t) m = x; else break; }
    if (!m) return null;
    const g = geom[m.e];
    if (!g || !g.path) return null;
    const f = m.t0 < 0 || t >= m.t1 ? 1 : (t - m.t0) / (m.t1 - m.t0);
    return g.path.at(f * g.path.length);
  }

  function frame(t) {
    if (live) takeMoves();
    advance(t);
    const loads = [], vehicles = [];
    const queues = new Map();
    for (const r of active) {
      const sp = spec[r.el], g = geom[r.el];
      let at = null;
      if (r.el.startsWith('agv:')) { const v = vehicleAt(Number(r.el.slice(4)) - 1, t); if (v) at = { p: [v.p[0], v.p[1], v.p[2] + 0.25], h: v.h }; }
      else if (sp && sp.type === 'conveyor' && g && g.path) {
        let s;
        if (r.k) {
          let k = r.k[0];
          for (const x of r.k) { if (x[0] <= t) k = x; else break; }
          s = Math.min(sp.speed * t + k[1], k[2]);
        } else {
          const D = beltD(r.el, t);
          s = D === null ? 0 : D - r.De;
        }
        at = along(r.el, Math.max(0, s) + r.L / 2);
      } else if (g) {
        if (sp && sp.type === 'station' && r.ts !== undefined && r.ts <= t) at = { p: [g.x, g.y, g.z + 0.15], h: g.rot };
        else {
          const q = queues.get(r.el) || 0;
          queues.set(r.el, q + 1);
          const port = g.ports.in && sp && sp.type === 'station' ? g.ports.in : g.ports.out || g.ports.in;
          if (port) at = back(port, (sp && sp.type === 'station' ? 0.1 : 0) + r.L / 2 + q * (r.L + 0.05));
          else at = { p: [g.x, g.y, g.z], h: g.rot };
        }
      }
      if (at) loads.push({ id: r.l, type: r.ty, L: r.L, p: at.p, h: at.h });
    }
    const carrying = new Set(active.filter((r) => r.el.startsWith('agv:')).map((r) => Number(r.el.slice(4)) - 1));
    for (const n of moves.keys()) {
      const v = vehicleAt(n, t);
      if (v) vehicles.push({ n: n + 1, p: v.p, h: v.h, loaded: carrying.has(n) });
    }
    return { loads, vehicles };
  }

  return { until: trace ? trace.until : 0, full: !!(trace && trace.full), frame };
}
