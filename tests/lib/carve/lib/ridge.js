/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ridge.js — the medial axis of a distance field (lib/carve): the line a V-bit follows to carve an outline in one pass.
 *   medialAxis(F, { minD, prune }) → [{ pts: [[x, y, d]…] }]   (d = the distance to the edge there, mm)
 * Steps: cells that are a local maximum of the distance across at least one of four directions (a drop of a third of a cell on one side, none
 * on the other) → thinned to one cell wide (Zhang and Suen) → traced from ends and junctions into paths → short branches that end well inside the
 * shape pruned (they come from the grid, a branch into a real corner ends at the edge) → points through straight stretches dropped.
 * The distance field is good to about half a cell, so the axis is too: a bit above that off the true line in the worst place.
 */
export function medialAxis(F, { prune = 6, angle = 0.45 } = {}) {
  const { w, h, dist, res, label, segs } = F;
  const mask = new Uint8Array(w * h);
  const foot = (c, si) => {   // the closest point of segment si to the centre of cell c
    const e = segs[si], i = c % w, j = (c - i) / w, x = F.x0 + (i + 0.5) * res, y = F.y0 + (j + 0.5) * res;
    const dx = e[2] - e[0], dy = e[3] - e[1], L2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, L2 > 0 ? ((x - e[0]) * dx + (y - e[1]) * dy) / L2 : 0));
    return [e[0] + t * dx, e[1] + t * dy];
  };
  const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
  for (let j = 1; j < h - 1; j++) {
    for (let i = 1; i < w - 1; i++) {
      const c = j * w + i;
      if (!F.inside[c] || label[c] < 0) continue;
      for (const [dx, dy] of DIRS) {
        const n = (j + dy) * w + i + dx;
        if (!F.inside[n] || label[n] < 0 || label[n] === label[c]) continue;
        const pa = foot(c, label[c]), pb = foot(n, label[n]);   // where each cell's nearest edge is: far apart, as seen from the cell, only on the medial axis
        const chord = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]), d = (dist[c] + dist[n]) / 2;
        if (chord >= Math.max(2.2 * res, angle * d)) mask[dist[c] >= dist[n] ? c : n] = 1;
      }
    }
  }
  thin(mask, w, h);
  const N8 = [[-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]];
  const nb = (k) => { const i = k % w, j = (k - i) / w, o = []; for (const [dx, dy] of N8) { const a = i + dx, b = j + dy; if (a >= 0 && b >= 0 && a < w && b < h && mask[b * w + a]) o.push(b * w + a); } return o; };
  const xy = (k) => { const i = k % w; return [F.x0 + (i + 0.5) * res, F.y0 + ((k - i) / w + 0.5) * res]; };
  const cells = [];
  for (let k = 0; k < w * h; k++) if (mask[k]) cells.push(k);
  const deg = new Map(cells.map((k) => [k, nb(k).length]));
  const seen = new Set();
  const paths = [];   // { cells: [k…], tipFree: bool, joined: bool }
  const walk = (start) => {
    const cs = [start];
    seen.add(start);
    let cur = start, prev = -1, joined = false;
    for (;;) {
      const nx = nb(cur).filter((q) => q !== prev);
      const fresh = nx.filter((q) => !seen.has(q));
      if (!fresh.length) {
        const hook = nx.find((q) => seen.has(q) && q !== cs[0] && !cs.includes(q));
        if (hook !== undefined) { cs.push(hook); joined = true; }
        else if (cs.length > 3 && nx.includes(cs[0])) { cs.push(cs[0]); joined = true; }
        break;
      }
      let pick = fresh[0];
      if (prev >= 0 && fresh.length > 1) {   // keep going straight
        const [px, py] = xy(prev), [cx, cy] = xy(cur);
        let bs = -Infinity;
        for (const q of fresh) { const [qx, qy] = xy(q), l = Math.hypot(qx - cx, qy - cy), sc = ((cx - px) * (qx - cx) + (cy - py) * (qy - cy)) / (l * res); if (sc > bs) { bs = sc; pick = q; } }
      }
      seen.add(pick); cs.push(pick); prev = cur; cur = pick;
    }
    return { cells: cs, joined };
  };
  for (const k of cells) if (deg.get(k) === 1 && !seen.has(k)) paths.push({ ...walk(k), tip: true });
  for (const k of cells) if (!seen.has(k)) paths.push({ ...walk(k), tip: false });
  // spurs: a short path from a free tip that joins another: the grid's, unless it runs into a corner (the tip then ends at the edge)
  const keep = paths.filter((p) => !(p.tip && p.joined && p.cells.length <= prune && dist[p.cells[0]] > 3 * res));
  // a blob of isolated cells (the centre of a disc) is one point
  const mergeR = Math.max(4 * res, 0.05 * F.max);
  const out = [], dots = [];
  for (const p of keep) { if (p.cells.length <= 2) dots.push(p); else out.push(p); }
  dots.sort((a, b) => dist[b.cells[0]] - dist[a.cells[0]]);
  const kept = [];
  for (const d of dots) { const [x, y] = xy(d.cells[0]); if (!kept.some((q) => Math.hypot(q.x - x, q.y - y) <= mergeR) && !out.some((p) => p.cells.some((c) => { const [a, b] = xy(c); return Math.hypot(a - x, b - y) <= mergeR; }))) kept.push({ x, y, c: d.cells[0] }); }
  const res2 = out.map((p) => ({ pts: p.cells.map((c) => { const [x, y] = xy(c); return [x, y, dist[c]]; }), closed: p.cells.length > 3 && p.cells[0] === p.cells[p.cells.length - 1] }));
  for (const q of kept) res2.push({ pts: [[q.x, q.y, dist[q.c]]], closed: false });
  // small isolated pieces (the centre of a disc, where the grid cannot tell a point from a short star) are one point, where the distance is greatest
  const blobR = Math.max(8 * res, 0.08 * F.max);
  const diag = (p) => { const xs = p.pts.map((q) => q[0]), ys = p.pts.map((q) => q[1]); return Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)); };
  const small = res2.filter((p) => !p.closed && diag(p) <= 2 * blobR), big = res2.filter((p) => !small.includes(p));
  const deepest = (p) => p.pts.reduce((a, b) => (b[2] > a[2] ? b : a));
  const centres = [];
  for (const p of small.sort((a, b) => deepest(b)[2] - deepest(a)[2])) {
    const c = deepest(p);
    if (centres.some((q) => Math.hypot(q[0] - c[0], q[1] - c[1]) <= blobR)) continue;
    centres.push(c);
    big.push({ pts: [c], closed: false });
  }
  return big;
}

/** Guo and Hall thinning, in place (it keeps diagonal lines, which Zhang and Suen's can erase). */
export function thin(m, w, h) {
  const P = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? 0 : m[j * w + i]);
  const del = [];
  for (let changed = true; changed;) {
    changed = false;
    for (let step = 0; step < 2; step++) {
      del.length = 0;
      for (let j = 1; j < h - 1; j++) {
        for (let i = 1; i < w - 1; i++) {
          if (!m[j * w + i]) continue;
          const p2 = P(i, j - 1), p3 = P(i + 1, j - 1), p4 = P(i + 1, j), p5 = P(i + 1, j + 1), p6 = P(i, j + 1), p7 = P(i - 1, j + 1), p8 = P(i - 1, j), p9 = P(i - 1, j - 1);
          const C = (!p2 && (p3 || p4) ? 1 : 0) + (!p4 && (p5 || p6) ? 1 : 0) + (!p6 && (p7 || p8) ? 1 : 0) + (!p8 && (p9 || p2) ? 1 : 0);
          const N1 = (p9 || p2 ? 1 : 0) + (p3 || p4 ? 1 : 0) + (p5 || p6 ? 1 : 0) + (p7 || p8 ? 1 : 0);
          const N2 = (p2 || p3 ? 1 : 0) + (p4 || p5 ? 1 : 0) + (p6 || p7 ? 1 : 0) + (p8 || p9 ? 1 : 0);
          const N = Math.min(N1, N2);
          const m1 = step === 0 ? ((p2 || p3 || !p5) && p4) : ((p6 || p7 || !p9) && p8);
          if (C === 1 && N >= 2 && N <= 3 && !m1) del.push(j * w + i);
        }
      }
      for (const k of del) m[k] = 0;
      if (del.length) changed = true;
    }
  }
}
