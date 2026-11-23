/* SPDX-License-Identifier: Apache-2.0 */
/**
 * envelope.js — the ground a run sweeps, as outline loops (FX.351). The core tool fills a dense grid over the path's WHOLE bounding box and
 * coarsens the cell until it fits 4 million cells, so a 1.7 km alignment gets a cell of a metre or two and the outline draws stair-stepped.
 * This one stores only the cells the bodies touch, as runs per row (a row of runs, not a grid), so the cell stays fine at any path length.
 *
 *   sweptEnvelope(polys, { cell, tol, maxRuns }) → { loops: [[{x, y}]], area, cell, cells, error }
 *     polys    body polygons (any closed polygon; convex quads in practice) in project units
 *     cell     cell size; default `tol` / 2.2 where tol (default 0.04 of the narrowest body, at most 0.1) is the outline error in project units
 *     error    the largest the outline can be off the true union, in project units (half a cell diagonal, then the simplify tolerance)
 *   Loops have the swept side on their left (outer loops counter-clockwise, holes clockwise), like the core's, so a caller can swap them.
 */
const sorted = (a) => a.sort((p, q) => p[0] - q[0]);

export function sweptEnvelope(polys, opts = {}) {
  const P = (polys || []).filter((p) => Array.isArray(p) && p.length >= 3);
  if (!P.length) return { loops: [], area: 0, cell: 0, cells: 0, error: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, narrow = Infinity;
  for (const p of P) {
    let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
    for (const q of p) { if (q.x < a) a = q.x; if (q.x > b) b = q.x; if (q.y < c) c = q.y; if (q.y > d) d = q.y; }
    minX = Math.min(minX, a); maxX = Math.max(maxX, b); minY = Math.min(minY, c); maxY = Math.max(maxY, d);
    narrow = Math.min(narrow, Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y), Math.hypot(p[2].x - p[1].x, p[2].y - p[1].y));
  }
  const maxRuns = opts.maxRuns > 0 ? opts.maxRuns : 6e6;
  let h = opts.cell > 0 ? opts.cell : (opts.tol > 0 ? opts.tol : Math.min(0.1, Math.max(narrow, 1e-6) * 0.04)) / 2.2;
  // coarsen only when the runs would not fit (rows touched by every body, summed); a long path keeps its fine cell
  const rowsOf = (hh) => { let n = 0; for (const p of P) { let a = Infinity, b = -Infinity; for (const q of p) { if (q.y < a) a = q.y; if (q.y > b) b = q.y; } n += Math.ceil((b - a) / hh) + 1; } return n; };
  while (rowsOf(h) > maxRuns) h *= 1.5;
  const x0 = minX - h, y0 = minY - h;
  const rows = new Map();
  for (const p of P) {
    let a = Infinity, b = -Infinity; for (const q of p) { if (q.y < a) a = q.y; if (q.y > b) b = q.y; }
    const j0 = Math.ceil((a - y0) / h - 0.5), j1 = Math.floor((b - y0) / h - 0.5);
    for (let j = j0; j <= j1; j++) {
      const yc = y0 + (j + 0.5) * h, xs = [];
      for (let k = 0; k < p.length; k++) {
        const u = p[k], w = p[(k + 1) % p.length];
        if ((u.y <= yc) !== (w.y <= yc)) xs.push(u.x + ((yc - u.y) * (w.x - u.x)) / (w.y - u.y));
      }
      if (xs.length < 2) continue;
      xs.sort((m, o) => m - o);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const i0 = Math.ceil((xs[k] - x0) / h - 0.5), i1 = Math.floor((xs[k + 1] - x0) / h - 0.5);
        if (i1 < i0) continue;
        let r = rows.get(j); if (!r) rows.set(j, r = []);
        r.push([i0, i1 + 1]);   // [from, to) in cell indices
      }
    }
  }
  // merge each row into disjoint runs that do not touch
  let cells = 0;
  for (const [j, r] of rows) {
    sorted(r);
    const m = [r[0].slice()];
    for (let k = 1; k < r.length; k++) { const l = m[m.length - 1]; if (r[k][0] <= l[1]) { if (r[k][1] > l[1]) l[1] = r[k][1]; } else m.push(r[k].slice()); }
    rows.set(j, m);
    for (const x of m) cells += x[1] - x[0];
  }
  // the boundary: vertical edges at run ends, horizontal edges where the neighbouring row has no cell
  const out = new Map();
  const key = (i, j) => i * 4294967296 + (j + 2147483648);
  const add = (ai, aj, bi, bj) => { const k = key(ai, aj); const l = out.get(k); if (l) l.push([bi, bj]); else out.set(k, [[bi, bj]]); };
  const uncovered = (a, b, other) => {   // parts of [a, b) not inside the runs of `other`
    const res = []; let c = a;
    for (const [s, e] of other || []) { if (e <= c) continue; if (s >= b) break; if (s > c) res.push([c, s]); c = Math.max(c, e); if (c >= b) break; }
    if (c < b) res.push([c, b]);
    return res;
  };
  for (const [j, r] of rows) {
    for (const [a, b] of r) {
      add(a, j + 1, a, j);        // left edge, downward
      add(b, j, b, j + 1);        // right edge, upward
      for (const [s, e] of uncovered(a, b, rows.get(j - 1))) add(s, j, e, j);           // bottom edge, left to right
      for (const [s, e] of uncovered(a, b, rows.get(j + 1))) add(e, j + 1, s, j + 1);   // top edge, right to left
    }
  }
  const loops = [];
  for (const [k0, list] of out) {
    while (list.length) {
      const si = Math.floor(k0 / 4294967296), sj = (k0 - si * 4294967296) - 2147483648;
      const loop = [[si, sj]];
      let cur = list.pop(), prev = [si, sj];
      while (!(cur[0] === si && cur[1] === sj)) {
        loop.push(cur);
        const l2 = out.get(key(cur[0], cur[1]));
        if (!l2 || !l2.length) break;
        let pick = 0;
        if (l2.length > 1) {   // a pinch: take the left turn so loops never cross
          const dx = cur[0] - prev[0], dy = cur[1] - prev[1];
          pick = l2.findIndex((q) => (q[0] - cur[0]) * -dy + (q[1] - cur[1]) * dx > 0);
          if (pick < 0) pick = 0;
        }
        prev = cur; cur = l2.splice(pick, 1)[0];
      }
      if (loop.length >= 4) loops.push(loop);
    }
  }
  const tolS = h * 1.5;   // a staircase of cells is up to 1.41 h peak to peak, so it must thin to a straight edge
  const result = loops.map((L) => simplify(dropCollinear(L).map(([i, j]) => ({ x: x0 + i * h, y: y0 + j * h })), tolS));
  return { loops: result, area: cells * h * h, cell: h, cells, error: h * Math.SQRT1_2 + tolS };
}

function dropCollinear(L) {
  const n = L.length, o = [];
  for (let i = 0; i < n; i++) {
    const a = L[(i + n - 1) % n], b = L[i], c = L[(i + 1) % n];
    if ((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) !== 0) o.push(b);
  }
  return o.length >= 3 ? o : L;
}
/** Douglas–Peucker on a closed loop (split at the point furthest from the first). */
function simplify(P, tol) {
  if (P.length < 8) return P;
  const keep = new Uint8Array(P.length);
  let b = 0, best = -1;
  for (let i = 0; i < P.length; i++) { const d = (P[i].x - P[0].x) ** 2 + (P[i].y - P[0].y) ** 2; if (d > best) { best = d; b = i; } }
  keep[0] = keep[b] = 1;
  const stack = [[0, b], [b, P.length]];
  while (stack.length) {
    const [i, j] = stack.pop();
    const p = P[i], q = P[j % P.length], dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy) || 1;
    let far = -1, fd = tol;
    for (let k = i + 1; k < j; k++) { const d = Math.abs((P[k].x - p.x) * dy - (P[k].y - p.y) * dx) / L; if (d > fd) { fd = d; far = k; } }
    if (far >= 0) { keep[far] = 1; stack.push([i, far], [far, j]); }
  }
  return P.filter((_, i) => keep[i]);
}
