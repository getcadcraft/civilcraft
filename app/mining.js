/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mining.js — block models and open-pit design (0.8 EG.27). No DOM, no strings, no imports. SI inside (m, t, t/m³, currency per tonne).
 * Tested by bin/test-civilcraft-mining.mjs. A calculation aid: a mine plan is signed by a competent person; every price, cost, recovery and slope here is the user's.
 *
 * Published maths (nothing copied):
 *  - Block model: a regular grid of blocks, each with density, attributes (grade ...) and a rock type; interpolation of drill-hole samples by inverse distance
 *    weighting (Shepard 1968), power p, search radius.
 *  - Block economic value: V = tonnes·(grade·recovery·price − processing cost) − tonnes·mining cost for ore; −tonnes·mining cost for waste (cut-off grade: ore when the process
 *    margin is positive) (Hustrulid and Kuchta, Open Pit Mine Planning and Design, ch. 3 and 5).
 *  - Ultimate pit as a maximum-weight closure: a block can be mined only after the blocks above it inside the slope cone (Lerchs and Grossmann 1965; Picard 1976 showed it is a
 *    minimum cut): source → positive blocks, negative blocks → sink, infinite precedence arcs; Dinic's maximum flow (Dinic 1970).
 *  - Bench geometry: overall slope angle OSA = atan( H / (H/tan(α) + B) ) for bench height H, face angle α and berm width B (Read and Stacey, Guidelines for Open Pit Slope Design).
 *  - Grade–tonnage curve: tonnes and mean grade of everything at or above each cut-off.
 *
 *   overallSlope({ benchHeight, faceAngle, berm, ramp? }) → radians
 *   makeModel({ nx, ny, nz, size: [dx,dy,dz], origin: [x,y,z] }) → model     z up; k = 0 is the bottom layer
 *   idw(model, samples[{x,y,z,grade}], { power, radius }) → fills model.grade
 *   blockValues(model, { price, recovery, processCost, miningCost, wasteCost? }) → Float64Array
 *   ultimatePit(model, values, { slope (rad), pattern: 8 | 4 }) → { mined: Uint8Array, value, ore, waste, blocks }
 *   gradeTonnage(model, cutoffs[]) → [{ cutoff, tonnes, grade }]
 *   benchReport(model, mined, { benchBlocks }) → [{ level, z, ore, waste, grade, strip }]
 *   nestedPits(model, params, { factors, slope }) → [{ factor, result, summary }]   the pit at each revenue factor (price × factor), smallest first: a series of nested pits
 *        (Lerchs–Grossmann parametric analysis, Whittle's "pit shells" idea in its published form; here one max-closure per factor); pits grow with the factor
 *   schedule(model, pits, values, { oreCapacity, moveCapacity, discount, periods }) → { periods: [{ period, ore, waste, grade, cash, pv }], npv, period (Int16Array per block, -1 = not mined), unscheduled }
 *        phases = the nested pits in order, top layer down inside a phase (a block's overlying cone is in the same or an earlier phase and a higher layer, so precedence holds);
 *        capacity-limited by periods; discounted cash flow at `discount` per period (Hustrulid and Kuchta ch. 7).
 *   rampLength({ benchHeight, grade, benches }) → { perBench, total }     length of ramp to climb `benches` benches at the given grade (fraction: 0.1 = 10 %)
 */
const DEG = Math.PI / 180;

export function overallSlope({ benchHeight, faceAngle, berm, ramp = 0, rampShare = 1 }) {
  const run = benchHeight / Math.tan(faceAngle) + berm + (ramp ? (ramp * rampShare) : 0);
  return Math.atan(benchHeight / run);
}

export function makeModel({ nx, ny, nz, size = [1, 1, 1], origin = [0, 0, 0], density = 2.7 }) {
  const n = nx * ny * nz;
  return { nx, ny, nz, size, origin, density: new Float64Array(n).fill(density), grade: new Float64Array(n), rock: new Uint8Array(n),
    index: (i, j, k) => i + nx * (j + ny * k), centre: (i, j, k) => [origin[0] + (i + 0.5) * size[0], origin[1] + (j + 0.5) * size[1], origin[2] + (k + 0.5) * size[2]],
    volume: size[0] * size[1] * size[2] };
}

export function idw(model, samples, { power = 2, radius = Infinity, min = 1 } = {}) {
  for (let k = 0; k < model.nz; k++) for (let j = 0; j < model.ny; j++) for (let i = 0; i < model.nx; i++) {
    const c = model.centre(i, j, k); let sw = 0, sv = 0, n = 0, exact = null;
    for (const s of samples) {
      const d = Math.hypot(c[0] - s.x, c[1] - s.y, c[2] - s.z);
      if (d > radius) continue;
      if (d < 1e-9) { exact = s.grade; break; }
      const w = 1 / Math.pow(d, power); sw += w; sv += w * s.grade; n++;
    }
    model.grade[model.index(i, j, k)] = exact !== null ? exact : n >= min ? sv / sw : 0;
  }
  return model.grade;
}

export function blockValues(model, { price, recovery = 1, processCost = 0, miningCost = 0, wasteCost = null }) {
  const v = new Float64Array(model.grade.length);
  for (let b = 0; b < v.length; b++) {
    const t = model.volume * model.density[b], ore = t * (model.grade[b] * recovery * price - processCost);
    v[b] = ore > 0 ? ore - t * miningCost : -t * (wasteCost ?? miningCost);
  }
  return v;
}

/** Dinic's algorithm on an adjacency-list graph built for the closure. */
class Flow {
  constructor(n) { this.n = n; this.head = new Int32Array(n).fill(-1); this.to = []; this.cap = []; this.next = []; }
  add(u, v, c) { this.to.push(v); this.cap.push(c); this.next.push(this.head[u]); this.head[u] = this.to.length - 1; this.to.push(u); this.cap.push(0); this.next.push(this.head[v]); this.head[v] = this.to.length - 1; }
  bfs(s, t) { this.level = new Int32Array(this.n).fill(-1); const q = [s]; this.level[s] = 0; for (let h = 0; h < q.length; h++) { const u = q[h]; for (let e = this.head[u]; e !== -1; e = this.next[e]) if (this.cap[e] > 1e-12 && this.level[this.to[e]] < 0) { this.level[this.to[e]] = this.level[u] + 1; q.push(this.to[e]); } } return this.level[t] >= 0; }
  maxflow(s, t) {
    let flow = 0; this.it = new Int32Array(this.n);
    while (this.bfs(s, t)) {
      for (let i = 0; i < this.n; i++) this.it[i] = this.head[i];
      for (;;) {   // iterative DFS for one augmenting path
        const stack = [s], edges = []; let found = false;
        while (stack.length) {
          const u = stack[stack.length - 1]; if (u === t) { found = true; break; }
          let advanced = false;
          for (; this.it[u] !== -1; this.it[u] = this.next[this.it[u]]) { const e = this.it[u], v = this.to[e]; if (this.cap[e] > 1e-12 && this.level[v] === this.level[u] + 1) { stack.push(v); edges.push(e); advanced = true; break; } }
          if (!advanced) { stack.pop(); if (edges.length) { const e = edges.pop(); this.it[stack[stack.length - 1]] = this.next[e]; } else break; }
        }
        if (!found) break;
        let f = Infinity; for (const e of edges) f = Math.min(f, this.cap[e]);
        for (const e of edges) { this.cap[e] -= f; this.cap[e ^ 1] += f; }
        flow += f;
      }
    }
    return flow;
  }
}

/** The ultimate pit: the most valuable set of blocks that can be mined within the slope. `values` per block; `slope` in radians; pattern 8 or 4 neighbours per layer. */
export function ultimatePit(model, values, { slope = 45 * DEG, pattern = 8 } = {}) {
  const { nx, ny, nz, size } = model, n = nx * ny * nz, S = n, T = n + 1, g = new Flow(n + 2), INF = 1e18;
  // precedence: mining block (i,j,k) needs the blocks above it inside the cone, one layer at a time (the 1:n:… pattern generalised to any angle)
  const reach = (dz) => (dz * size[2]) / Math.tan(slope);   // horizontal reach at dz layers above
  for (let k = 0; k < nz - 1; k++) {
    const r = reach(1), rx = Math.round(r / size[0]), ry = Math.round(r / size[1]);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const u = model.index(i, j, k);
      for (let dj = -ry; dj <= ry; dj++) for (let di = -rx; di <= rx; di++) {
        if (pattern === 4 && di !== 0 && dj !== 0) continue;
        if (Math.hypot(di * size[0], dj * size[1]) > r + 1e-9) continue;
        const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= ny) continue;
        g.add(u, model.index(ii, jj, k + 1), INF);
      }
    }
  }
  let pos = 0;
  for (let b = 0; b < n; b++) { if (values[b] > 0) { g.add(S, b, values[b]); pos += values[b]; } else if (values[b] < 0) g.add(b, T, -values[b]); }
  const flow = g.maxflow(S, T);
  // the source side of the minimum cut is the closure
  const seen = new Uint8Array(n + 2), q = [S]; seen[S] = 1;
  for (let h = 0; h < q.length; h++) { const u = q[h]; for (let e = g.head[u]; e !== -1; e = g.next[e]) if (g.cap[e] > 1e-9 && !seen[g.to[e]]) { seen[g.to[e]] = 1; q.push(g.to[e]); } }
  const mined = new Uint8Array(n); let value = 0, ore = 0, waste = 0, blocks = 0;
  for (let b = 0; b < n; b++) if (seen[b]) { mined[b] = 1; value += values[b]; blocks++; if (values[b] > 0) ore += model.volume * model.density[b]; else waste += model.volume * model.density[b]; }
  return { mined, value, ore, waste, blocks, flow, bound: pos - flow };
}

export function gradeTonnage(model, cutoffs, mined = null) {
  return cutoffs.map((c) => {
    let t = 0, m = 0;
    for (let b = 0; b < model.grade.length; b++) if ((!mined || mined[b]) && model.grade[b] >= c) { const tt = model.volume * model.density[b]; t += tt; m += tt * model.grade[b]; }
    return { cutoff: c, tonnes: t, grade: t ? m / t : 0 };
  });
}

export function benchReport(model, mined, values, { benchBlocks = 1 } = {}) {
  const out = [];
  for (let k0 = model.nz - 1; k0 >= 0; k0 -= benchBlocks) {
    let ore = 0, waste = 0, gm = 0;
    for (let k = Math.max(0, k0 - benchBlocks + 1); k <= k0; k++) for (let j = 0; j < model.ny; j++) for (let i = 0; i < model.nx; i++) {
      const b = model.index(i, j, k); if (!mined[b]) continue; const t = model.volume * model.density[b];
      if (values[b] > 0) { ore += t; gm += t * model.grade[b]; } else waste += t;
    }
    if (ore || waste) out.push({ level: k0, z: model.origin[2] + (k0 + 1) * model.size[2], ore, waste, grade: ore ? gm / ore : 0, strip: ore ? waste / ore : Infinity });
  }
  return out;
}

/** The pit's rim and floor as outlines per layer (blocks mined at that layer, in plan): a list of cells for the drawing. */
export function layerCells(model, mined, k) { const out = []; for (let j = 0; j < model.ny; j++) for (let i = 0; i < model.nx; i++) if (mined[model.index(i, j, k)]) out.push([i, j]); return out; }

/** Strip ratio (waste tonnes per ore tonne) and the value split of a result. */
export function pitSummary(model, values, result, { benchBlocks = 1 } = {}) {
  return { value: result.value, ore: result.ore, waste: result.waste, strip: result.ore ? result.waste / result.ore : Infinity, blocks: result.blocks, benches: benchReport(model, result.mined, values, { benchBlocks }) };
}


/** The pit at a series of revenue factors (multipliers on the price); the pits nest, so the bigger factor holds the smaller pit. */
export function nestedPits(model, params, { factors = [0.4, 0.6, 0.8, 1], slope = 45 * DEG } = {}) {
  return factors.slice().sort((a, b) => a - b).map((factor) => {
    const values = blockValues(model, { ...params, price: params.price * factor }), result = ultimatePit(model, values, { slope });
    return { factor, values, result };
  });
}

/** Length of ramp (m) to climb `benches` benches of height `benchHeight` at `grade` (rise over run). */
export function rampLength({ benchHeight, grade, benches = 1 }) { const per = grade > 0 ? benchHeight / grade : Infinity; return { perBench: per, total: per * benches }; }

/**
 * Production schedule over nested pits. `pits` from nestedPits(); `values` are the block values of the LAST (full-price) factor, used for the cash flow.
 * oreCapacity: tonnes of ore per period (the plant); moveCapacity: tonnes of ore + waste per period (the fleet). Either may be Infinity.
 */
export function schedule(model, pits, values, { oreCapacity = Infinity, moveCapacity = Infinity, discount = 0.1, periods = 60 } = {}) {
  const n = model.nx * model.ny * model.nz, per = new Int16Array(n).fill(-1), order = [], seen = new Uint8Array(n);
  for (const p of pits) {
    for (let k = model.nz - 1; k >= 0; k--) for (let j = 0; j < model.ny; j++) for (let i = 0; i < model.nx; i++) { const b = model.index(i, j, k); if (p.result.mined[b] && !seen[b]) { seen[b] = 1; order.push(b); } }
  }
  const rows = []; let t = 0, ore = 0, mov = 0, waste = 0, gm = 0, cash = 0, unscheduled = 0;
  const close = () => { if (!ore && !waste) return; const pv = cash / Math.pow(1 + discount, t + 1); rows.push({ period: t + 1, ore, waste, grade: ore ? gm / ore : 0, cash, pv }); t++; ore = mov = waste = gm = cash = 0; };
  for (const b of order) {
    const tn = model.volume * model.density[b], isOre = values[b] > 0;
    if (tn > oreCapacity || tn > moveCapacity) { unscheduled++; continue; }   // a block bigger than a period's capacity can never be mined
    if ((isOre && ore + tn > oreCapacity) || mov + tn > moveCapacity) { close(); if (t >= periods) { unscheduled += order.length; break; } }
    if (t >= periods) { unscheduled++; continue; }
    per[b] = t; mov += tn; cash += values[b]; if (isOre) { ore += tn; gm += tn * model.grade[b]; } else waste += tn;
  }
  close();
  return { periods: rows, npv: rows.reduce((s, r) => s + r.pv, 0), undiscounted: rows.reduce((s, r) => s + r.cash, 0), period: per, unscheduled };
}
