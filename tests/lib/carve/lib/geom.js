/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geom.js — plain 2D / 3D helpers for the carving engine (lib/carve). DOM-free, import-free. Millimetres throughout.
 *   bounds(loops) → { x0, y0, x1, y1 }          signedArea(loop)           pathLength(pts)
 *   simplify(pts, tol)          Douglas-Peucker on [x, y] or [x, y, z] points (z counts, so a ramp is kept)
 *   flattenBulges(pts, tol)     [{ x, y, b }] polyline with arc bulges → [[x, y]] chords no further than `tol` from the arc
 *   orderPaths(paths, from)     nearest-neighbour order (paths may be reversed) to shorten the rapid moves
 */
export const bounds = (loops) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const l of loops) for (const p of l) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return { x0, y0, x1, y1 };
};
export const signedArea = (l) => { let s = 0; for (let i = 0; i < l.length; i++) { const a = l[i], b = l[(i + 1) % l.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
export const pathLength = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1], (pts[i][2] || 0) - (pts[i - 1][2] || 0)); return s; };

export function simplify(pts, tol) {
  const n = pts.length;
  if (n < 3 || !(tol > 0)) return pts.slice();
  const keep = new Uint8Array(n);
  keep[0] = keep[n - 1] = 1;
  const stack = [[0, n - 1]];
  const d3 = pts[0].length > 2;
  while (stack.length) {
    const [a, b] = stack.pop();
    let worst = -1, wi = -1;
    const A = pts[a], B = pts[b];
    const dx = B[0] - A[0], dy = B[1] - A[1], dz = d3 ? B[2] - A[2] : 0, L2 = dx * dx + dy * dy + dz * dz;
    for (let i = a + 1; i < b; i++) {
      const P = pts[i];
      let t = L2 > 0 ? ((P[0] - A[0]) * dx + (P[1] - A[1]) * dy + (d3 ? (P[2] - A[2]) * dz : 0)) / L2 : 0;
      t = Math.max(0, Math.min(1, t));
      const e = Math.hypot(P[0] - (A[0] + t * dx), P[1] - (A[1] + t * dy), d3 ? P[2] - (A[2] + t * dz) : 0);
      if (e > worst) { worst = e; wi = i; }
    }
    if (worst > tol) { keep[wi] = 1; stack.push([a, wi], [wi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}

export function flattenBulges(pts, closed, tol = 0.02) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    out.push([a.x, a.y]);
    const bulge = Number(a.b) || 0;
    if (!bulge || (i === n - 1 && !closed)) continue;
    const sweep = 4 * Math.atan(bulge), dx = b.x - a.x, dy = b.y - a.y, chord = Math.hypot(dx, dy);
    if (!(chord > 0)) continue;
    const r = chord / (2 * Math.sin(Math.abs(sweep) / 2)), off = r * Math.cos(Math.abs(sweep) / 2) * (bulge > 0 ? 1 : -1);
    const cx = (a.x + b.x) / 2 - (dy / chord) * off, cy = (a.y + b.y) / 2 + (dx / chord) * off;
    const a0 = Math.atan2(a.y - cy, a.x - cx);
    const step = 2 * Math.acos(Math.max(0, 1 - tol / Math.max(r, tol)));   // the angle whose chord sags `tol`
    const steps = Math.max(1, Math.ceil(Math.abs(sweep) / Math.max(step, 0.01)));
    for (let k = 1; k < steps; k++) { const ang = a0 + sweep * (k / steps); out.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]); }
  }
  return out;
}

export function orderPaths(paths, from = [0, 0]) {
  const left = paths.slice(), out = [];
  let cur = from;
  while (left.length) {
    let bi = 0, bd = Infinity, rev = false;
    for (let i = 0; i < left.length; i++) {
      const p = left[i], s = p[0], e = p[p.length - 1];
      const ds = Math.hypot(s[0] - cur[0], s[1] - cur[1]), de = Math.hypot(e[0] - cur[0], e[1] - cur[1]);
      if (ds < bd) { bd = ds; bi = i; rev = false; }
      if (de < bd) { bd = de; bi = i; rev = true; }
    }
    const p = left.splice(bi, 1)[0];
    const q = rev ? p.slice().reverse() : p;
    out.push(q);
    cur = q[q.length - 1];
  }
  return out;
}
