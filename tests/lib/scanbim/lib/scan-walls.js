/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scan-walls.js — walls from a phone or laser scan's plan slice (0.8 EG.37 SPIKE, session bim_PART_2; write-up docs/spikes/EG.37_PART_2.md).
 * No DOM: tools/bimcraft-test/scan-walls-test.mjs (node bin/test-bimcraft.mjs --scan-walls) runs it on synthetic scans. A spike: it finds the
 * walls of a rectilinear room or building (every wall parallel to one of two perpendicular directions, which is how most rooms are built);
 * a curved or diagonal wall is not found, and it has not been run on a real phone scan (none is in the repository).
 *
 *   scanWalls(xy, n, { angle, cell = 20, minLen = 800, minPoints = 25, gapMax = 450, doorMin = 600, doorMax = 1300 }) → { walls, doors, notes }
 *     xy = the plan slice (slicePoints: Float64Array, 2 per point, mm); angle = the walls' direction in degrees (cloud-slice.js squareAngle; 0 when
 *     the scan is already square). walls = [{ a: [x, y], b: [x, y], points, dir: 'x'|'y' }] in the slice's own axes, each along the middle of the
 *     points that make it; doors = [{ wall (index), at: [x, y], width }] where a wall has a gap of a door's width. Clutter (a chair's
 *     points) is dropped by the density test: a wall is a long, thin run of points.
 */
export function scanWalls(xy, n, { angle = 0, cell = 20, minLen = 800, minPoints = 25, gapMax = 450, doorMin = 600, doorMax = 1300 } = {}) {
  const notes = [];
  if (!(n >= 100)) return { walls: [], doors: [], notes: ['Too few points in the slice to find walls.'] };
  const c = Math.cos((-angle * Math.PI) / 180), s = Math.sin((-angle * Math.PI) / 180);
  const u = new Float64Array(n), v = new Float64Array(n);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  for (let i = 0; i < n; i++) {
    const x = xy[2 * i], y = xy[2 * i + 1];
    u[i] = x * c - y * s; v[i] = x * s + y * c;
    if (u[i] < u0) u0 = u[i]; if (u[i] > u1) u1 = u[i]; if (v[i] < v0) v0 = v[i]; if (v[i] > v1) v1 = v[i];
  }
  const back = (a, b) => { const k = Math.cos((angle * Math.PI) / 180), m = Math.sin((angle * Math.PI) / 180); return [a * k - b * m, a * m + b * k]; };
  const walls = [];
  // A wall along v at u = p: a peak in the histogram of u (the points pile up in one thin column), then the runs of v along it.
  const along = (P, Q, p0, p1, dir) => {   // P = across, Q = along
    const nb = Math.max(1, Math.ceil((p1 - p0) / cell) + 1), h = new Float64Array(nb);
    const idx = (x) => Math.min(nb - 1, Math.max(0, Math.floor((x - p0) / cell)));
    for (let i = 0; i < n; i++) h[idx(P[i])]++;
    const peaks = [];
    for (let b = 1; b < nb - 1; b++) {   // a peak: a local maximum over a 3-cell window that holds enough points
      const w = h[b - 1] + h[b] + h[b + 1];
      if (h[b] >= h[b - 1] && h[b] > h[b + 1] && w >= minPoints * 2) peaks.push({ b, w });
    }
    peaks.sort((a, b2) => b2.w - a.w);
    const used = [];
    for (const pk of peaks) {
      if (used.some((q) => Math.abs(q - pk.b) <= 3)) continue;   // one wall per 8 cm: a thick wall's second face is the same wall
      used.push(pk.b);
      const lo = p0 + (pk.b - 1) * cell, hi = p0 + (pk.b + 2) * cell;
      const own = [];
      let sum = 0, k = 0;
      for (let i = 0; i < n; i++) if (P[i] >= lo && P[i] < hi) { own.push(Q[i]); sum += P[i]; k++; }
      if (k < minPoints) continue;
      const mid = sum / k;
      own.sort((a, b2) => a - b2);
      // runs along the wall: a gap bigger than gapMax splits it (a door shows as a gap of a door's width; a smaller gap is a scan shadow)
      let start = own[0], prev = own[0], count = 1;
      const flush = (end) => {
        if (end - start < minLen || count < minPoints) return;
        // thin: a wall has an empty side (outside the building); a table or a sofa has points on both. Count the points in the bands 4–10 cells to each side along the run.
        let left = 0, right = 0;
        for (let i = 0; i < n; i++) {
          if (Q[i] < start || Q[i] > end) continue;
          if (P[i] >= lo - 10 * cell && P[i] < lo - 3 * cell) left++; else if (P[i] >= hi + 3 * cell && P[i] < hi + 10 * cell) right++;
        }
        if (Math.min(left, right) > 0.25 * count) return;
        // and denser than what is beside it: the edge of a filled blob (a table, a sofa) is a histogram peak too, but its dense side is as dense as the edge
        const core = count / (3 * cell), side = Math.max(left, right) / (7 * cell);
        if (core < 3 * side) return;
        walls.push({ across: mid, from: start, to: end, points: count, dir });
      };
      for (let i = 1; i < own.length; i++) {
        if (own[i] - prev > gapMax) { flush(prev); start = own[i]; count = 0; }
        prev = own[i]; count++;
      }
      flush(prev);
    }
  };
  along(u, v, u0 - 3 * cell, u1 + 3 * cell, 'y');   // walls that run along v (constant u)
  along(v, u, v0 - 3 * cell, v1 + 3 * cell, 'x');   // walls that run along u (constant v)
  const out = walls.map((w) => (w.dir === 'y' ? { a: back(w.across, w.from), b: back(w.across, w.to), points: w.points, dir: w.dir } : { a: back(w.from, w.across), b: back(w.to, w.across), points: w.points, dir: w.dir }));
  // doors: two walls on one line with a door-sized gap between them
  const doors = [];
  for (let i = 0; i < walls.length; i++) for (let j = i + 1; j < walls.length; j++) {
    const A = walls[i], B = walls[j];
    if (A.dir !== B.dir || Math.abs(A.across - B.across) > cell * 4) continue;
    const first = A.from < B.from ? A : B, second = first === A ? B : A, gap = second.from - first.to;
    if (gap >= doorMin && gap <= doorMax) {
      const mid = (first.to + second.from) / 2, across = (A.across + B.across) / 2;
      doors.push({ wall: i, at: A.dir === 'y' ? back(across, mid) : back(mid, across), width: Math.round(gap) });
    }
  }
  if (!out.length) notes.push('No wall found: the slice has no long, thin runs of points. Check the cut height and that the scan is square (squareAngle).');
  return { walls: out, doors, notes };
}
