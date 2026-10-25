/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-geom.js — the geometry a laser job needs (0.7 SU.772, session `make-07`): flattening arcs, areas, which loop lies in
 * which, scan-line hatching of closed shapes, and ordering paths. DOM-free, import-free. Units are the caller's (mm in a job).
 *
 * A path is a list of points `{x, y, b?}`; b is the DXF-style bulge of the segment that STARTS at that point
 * (tan(sweep / 4), + = counter-clockwise). A closed path wraps from its last point back to its first.
 *
 *   flatten(path, closed, tol) → [{x, y}]            arcs as chords whose sag is at most tol (default 0.01)
 *   area(pts) → signed area (counter-clockwise +) · bounds(pts) → { x0, y0, x1, y1 } · length(pts, closed) → total length
 *   inside(pt, pts) → true when pt is inside the closed polygon (even-odd)
 *   depths(loops) → [n]            how many other loops contain each loop (0 = outermost; an island in a hole = 2)
 *   hatch(loops, { interval, angle, offset }) → [{ y, spans: [[x0, x1]…] }]   the scan lines of the even-odd region of every
 *       loop, in the frame rotated by −angle (so the lines are horizontal there); y is in that frame, lines lie on
 *       (k + 0.5) × interval + offset; unrotate(pt, angle) maps a point of that frame back
 *   rotate(pt, angle) · unrotate(pt, angle)           angle in degrees, about the origin
 *   orderPaths(paths, start) → paths reordered by nearest neighbour from `start`; each path { pts, closed }: a closed one is
 *       turned to begin at its vertex nearest the head, an open one may be reversed
 */
const DEG = Math.PI / 180;

export function flatten(path, closed = true, tol = 0.01) {
  const out = [];
  const n = path.length;
  const last = closed ? n : n - 1;
  for (let i = 0; i < n; i++) {
    const p = path[i];
    out.push({ x: p.x, y: p.y });
    if (i >= last) continue;
    const q = path[(i + 1) % n], b = p.b || 0;
    if (!b) continue;
    const th = 4 * Math.atan(b), ch = Math.hypot(q.x - p.x, q.y - p.y);
    if (ch < 1e-12) continue;
    const r = ch / (2 * Math.sin(Math.abs(th) / 2));
    const steps = Math.max(1, Math.ceil(Math.abs(th) / (2 * Math.acos(Math.max(-1, Math.min(1, 1 - Math.min(tol, r) / r))))));
    const mx = (p.x + q.x) / 2, my = (p.y + q.y) / 2, ux = (q.x - p.x) / ch, uy = (q.y - p.y) / ch;
    const d = r * Math.cos(th / 2) * Math.sign(th);
    const cx = mx - uy * d, cy = my + ux * d, a0 = Math.atan2(p.y - cy, p.x - cx);
    for (let k = 1; k < steps; k++) { const a = a0 + th * k / steps; out.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) }); }
  }
  return out;
}

export function area(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p.x * q.y - q.x * p.y; }
  return a / 2;
}
export function bounds(pts) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { if (p.x < x0) x0 = p.x; if (p.y < y0) y0 = p.y; if (p.x > x1) x1 = p.x; if (p.y > y1) y1 = p.y; }
  return { x0, y0, x1, y1 };
}
export function length(pts, closed = false) {
  let L = 0;
  for (let i = 0; i + 1 < pts.length; i++) L += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
  if (closed && pts.length > 1) L += Math.hypot(pts[0].x - pts[pts.length - 1].x, pts[0].y - pts[pts.length - 1].y);
  return L;
}
export function inside(pt, pts) {
  let o = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > pt.y) !== (b.y > pt.y) && pt.x < (b.x - a.x) * (pt.y - a.y) / (b.y - a.y) + a.x) o = !o;
  }
  return o;
}

export function depths(loops) {
  const polys = loops.map((l) => (l.pts || l));
  return polys.map((p, i) => {
    // a point of p that is not on another loop: its middle edge's midpoint is as good as any; use two probes
    const probe = (k) => { const a = p[k % p.length], b = p[(k + 1) % p.length]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
    const probes = [probe(0), probe(Math.floor(p.length / 2))];
    let n = 0;
    polys.forEach((q, j) => { if (j !== i && probes.every((pt) => inside(pt, q)) && Math.abs(area(q)) > Math.abs(area(p))) n++; });
    return n;
  });
}

export const rotate = (p, deg) => { const c = Math.cos(-deg * DEG), s = Math.sin(-deg * DEG); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; };
export const unrotate = (p, deg) => { const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return { x: p.x * c - p.y * s, y: p.x * s + p.y * c }; };

export function hatch(loops, { interval = 0.1, angle = 0, offset = 0 } = {}) {
  const polys = loops.map((l) => (l.pts || l).map((p) => rotate(p, angle))).filter((p) => p.length >= 3);
  if (!polys.length || !(interval > 0)) return [];
  let y0 = Infinity, y1 = -Infinity;
  for (const pl of polys) for (const p of pl) { if (p.y < y0) y0 = p.y; if (p.y > y1) y1 = p.y; }
  const out = [];
  const k0 = Math.floor((y0 - offset) / interval - 0.5), k1 = Math.ceil((y1 - offset) / interval - 0.5);
  for (let k = k0; k <= k1; k++) {
    const y = (k + 0.5) * interval + offset;
    if (y < y0 || y > y1) continue;
    const xs = [];
    for (const pl of polys) {
      for (let i = 0; i < pl.length; i++) {
        const a = pl[i], b = pl[(i + 1) % pl.length];
        if ((a.y <= y) !== (b.y <= y)) xs.push(a.x + (b.x - a.x) * (y - a.y) / (b.y - a.y));      // half-open: a vertex on the line counts once
      }
    }
    if (xs.length < 2) continue;
    xs.sort((p, q) => p - q);
    const spans = [];
    for (let i = 0; i + 1 < xs.length; i += 2) if (xs[i + 1] - xs[i] > 1e-9) spans.push([xs[i], xs[i + 1]]);
    if (spans.length) out.push({ y, spans });
  }
  return out;
}

export function orderPaths(paths, start = { x: 0, y: 0 }) {
  const left = paths.slice(), out = [];
  let head = start;
  const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
  while (left.length) {
    let best = null;
    left.forEach((p, i) => {
      const pts = p.pts;
      if (p.closed) {
        for (let k = 0; k < pts.length; k++) { const d = d2(head, pts[k]); if (!best || d < best.d) best = { i, d, k, rev: false }; }
      } else {
        const a = d2(head, pts[0]), b = d2(head, pts[pts.length - 1]);
        if (!best || a < best.d) best = { i, d: a, k: 0, rev: false };
        if (b < best.d) best = { i, d: b, k: 0, rev: true };
      }
    });
    const p = left.splice(best.i, 1)[0];
    let pts = p.pts;
    if (p.closed && best.k) pts = pts.slice(best.k).concat(pts.slice(0, best.k));
    if (best.rev) pts = pts.slice().reverse();
    out.push({ ...p, pts });
    head = p.closed ? pts[0] : pts[pts.length - 1];
  }
  return out;
}
