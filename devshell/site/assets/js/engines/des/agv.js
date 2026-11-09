/* SPDX-License-Identifier: Apache-2.0 */
/**
 * agv.js — the guide-path graph for AGVs and people (0.8 XE.5; DOM-free, no imports). Nodes are named points; edges are straight lanes with a length
 * (given, else from the node coordinates). Lanes are two-way unless `oneway`. Shortest paths by Dijkstra. No lane reservation or collision handling.
 * spec: {nodes: {A: [x, y], …}, edges: [[from, to, length?, {oneway?}], …]}
 */
export class Graph {
  constructor(spec) {
    this.nodes = spec.nodes || {}; this.adj = new Map(); this.problems = [];
    for (const n of Object.keys(this.nodes)) this.adj.set(n, []);
    for (const [a, b, len, opt] of spec.edges || []) {
      if (!this.nodes[a] || !this.nodes[b]) { this.problems.push(`edge ${a}–${b} names an unknown node`); continue; }
      const L = typeof len === 'number' ? len : Math.hypot(this.nodes[a][0] - this.nodes[b][0], this.nodes[a][1] - this.nodes[b][1]);
      if (!(L > 0)) { this.problems.push(`edge ${a}–${b} has no length`); continue; }
      this.adj.get(a).push([b, L]); if (!(opt && opt.oneway)) this.adj.get(b).push([a, L]);
    }
    this._cache = new Map();
  }
  /** distances from `src` to every reachable node (and the previous-node map for paths) */
  from(src) {
    if (this._cache.has(src)) return this._cache.get(src);
    const dist = new Map([[src, 0]]), prev = new Map(), done = new Set();
    for (;;) {
      let u = null, du = Infinity; for (const [n, d] of dist) if (!done.has(n) && d < du) { u = n; du = d; }
      if (u === null) break; done.add(u);
      for (const [v, L] of this.adj.get(u) || []) if (!(dist.has(v) && dist.get(v) <= du + L)) { dist.set(v, du + L); prev.set(v, u); }
    }
    const r = { dist, prev }; this._cache.set(src, r); return r;
  }
  distance(a, b) { const d = this.from(a).dist.get(b); return d === undefined ? Infinity : d; }
  path(a, b) { const { dist, prev } = this.from(a); if (!dist.has(b)) return null; const p = [b]; while (p[0] !== a) p.unshift(prev.get(p[0])); return p; }
}
