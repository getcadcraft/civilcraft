/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — geometry only; shape codes are data */
/**
 * bars.js — a reinforcing bar as the polyline of its straight legs' centre lines meeting at bend vertices, each bend an arc of one
 * centre-line radius (cc-rc, 0.9 RC.1). No DOM, millimetres.
 *
 *   bend(bar, kind)                   → { D (inside bend diameter), rc (centre-line radius), clause }
 *   hookTail(bar, deg, code, kind)    → straight extension past a hook's bend (mm) + clause
 *   segments(pts, rc)                 → [{ k:'L', a, b } | { k:'A', a, m, b, c, r, angle }]   tangent points and mid-arc points
 *   centerLength(pts, rc)             → exact centre-line length (straight legs shortened at each bend + the arcs)
 *   outDims(shape, pts, bar, rc)      → out-to-out schedule dimensions { A, B, C } (as rebar.js measures footing bars)
 *   cutLength(shape, pts, bar)        → ASTM bars: the centre line; BS bars with shapes S / L / U: BS 8666:2020 shape codes 00 / 11 / 21
 *   tessellate(pts, rc, seg)          → world polyline for drawing (arcs in `seg` pieces)
 *
 * Bends. Main bars with a standard hook use the bar's own bendD (rebar.js: ACI 318-19 Table 25.3.1, BS 8666:2020 minimum radius).
 * Stirrups and ties (kind 'tie'): ACI 318-19 Table 25.3.2, inside bend diameter 4·db for No. 10 through No. 16 and 6·db for No. 19
 * through No. 25; BS 4449 bars use BS 8666:2020's minimum scheduling radius (bendD) as for any other bar; EN 1992-1-1 Table 8.1N
 * (φm,min 4φ for φ ≤ 16, 7φ above) is no larger than BS 8666's for 8–16 mm.
 * Hook tails: ACI 318-19 Table 25.3.2 (stirrups, ties): 90° → greater of 6·db and 75 mm (No. 10–16), 12·db (No. 19–25); 135° →
 * greater of 6·db and 75 mm; 180° → greater of 4·db and 65 mm. ACI 318-19 Table 25.3.1 (main bars): 90° → 12·db, 180° → greater of
 * 4·db and 65 mm. EN 1992-1-1 Figure 8.5 (links): taken as 10φ ≥ 70 mm for a 90°–135° bend and 5φ ≥ 50 mm for 150° and more — the
 * angle ranges are read from the figure and listed for the owner to confirm (docs/0.9-sessions/rc-09.md).
 *
 * Shapes (DetailCraft's codes): S straight · L one 90° bend · U two 90° bends the same way · T closed tie / stirrup with two 135°
 * hooks (A, B outside width and height, C the hook tail) · K a bar with any other bends (dims are the leg lengths).
 */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** The bend a bar takes: kind 'main' (hooks of main bars) or 'tie' (stirrups, ties, links). */
export function bend(bar, kind = 'main') {
  if (kind === 'tie' && bar.set !== 'bs') {
    const D = (bar.db <= 16 + 1e-6 ? 4 : 6) * bar.db;
    return { D, rc: D / 2 + bar.db / 2, clause: 'ACI 318-19 Table 25.3.2' };
  }
  return { D: bar.bendD, rc: bar.bendD / 2 + bar.db / 2, clause: bar.set === 'bs' ? 'BS 8666:2020' : 'ACI 318-19 Table 25.3.1' };
}

/** Straight extension past a hook's bend, mm. */
export function hookTail(bar, deg, code = 'aci', kind = 'tie') {
  const d = bar.db;
  if (code === 'ec2') {
    if (deg >= 150) return { value: Math.max(5 * d, 50), clause: 'EN 1992-1-1 Figure 8.5' };
    return { value: Math.max(10 * d, 70), clause: 'EN 1992-1-1 Figure 8.5' };
  }
  if (kind === 'main') {
    if (deg >= 180) return { value: Math.max(4 * d, 65), clause: 'ACI 318-19 Table 25.3.1' };
    return { value: 12 * d, clause: 'ACI 318-19 Table 25.3.1' };
  }
  if (deg >= 180) return { value: Math.max(4 * d, 65), clause: 'ACI 318-19 Table 25.3.2' };
  if (deg >= 135) return { value: Math.max(6 * d, 75), clause: 'ACI 318-19 Table 25.3.2' };
  return { value: d <= 16 + 1e-6 ? Math.max(6 * d, 75) : 12 * d, clause: 'ACI 318-19 Table 25.3.2' };
}

/** Straight lines and arcs of a polyline bar (vertices = where the legs' centre lines meet). */
export function segments(pts, rc) {
  const n = pts.length;
  if (n < 2) return [];
  const out = [];
  let cur = pts[0];
  for (let i = 1; i < n - 1; i++) {
    const a = norm(sub(pts[i], pts[i - 1])), b = norm(sub(pts[i + 1], pts[i]));
    const cos = Math.max(-1, Math.min(1, dot(a, b)));
    const th = Math.acos(cos);                    // the bend angle (direction change)
    if (th < 1e-6) continue;
    const tl = rc * Math.tan(th / 2);
    const t1 = sub(pts[i], mul(a, tl)), t2 = add(pts[i], mul(b, tl));
    const bis = norm(sub(b, a));                  // toward the arc's centre
    const c = add(pts[i], mul(bis, rc / Math.cos(th / 2)));
    const m = add(c, mul(norm(sub(pts[i], c)), rc));
    out.push({ k: 'L', a: cur, b: t1 });
    out.push({ k: 'A', a: t1, m, b: t2, c, r: rc, angle: th });
    cur = t2;
  }
  out.push({ k: 'L', a: cur, b: pts[n - 1] });
  return out;
}

/** Exact centre-line length. */
export function centerLength(pts, rc) {
  let s = 0;
  for (const g of segments(pts, rc)) s += g.k === 'L' ? len(sub(g.b, g.a)) : g.r * g.angle;
  return s;
}

/** Leg lengths between vertices (centre line, vertex to vertex). */
export function legs(pts) { const o = []; for (let i = 1; i < pts.length; i++) o.push(len(sub(pts[i], pts[i - 1]))); return o; }

/** Out-to-out schedule dimensions. */
export function outDims(shape, pts, bar, rc = 0) {
  const L = legs(pts), h = bar.db / 2;
  if (shape === 'S') return { A: L[0] };
  if (shape === 'L') return { A: L[0] + h, B: L[1] + h };
  if (shape === 'U') return { A: L[1] + 2 * h, B: L[0] + h, C: L[2] + h };
  if (shape === 'T') {   // tail, side, side, side, side, tail: outside width and height, the tail
    return { A: L[2] + 2 * h, B: L[1] + 2 * h, C: L[0] - rc * Math.tan(67.5 * Math.PI / 180) };
  }
  const o = {}; L.forEach((v, i) => { o['ABCDEFGH'[i] || 'X' + i] = v; }); return o;
}

/** Cut length (mm). BS bars of shapes L / U by BS 8666:2020 (11: A + B − 0.5r − d; 21: A + B + C − r − 2d), else the centre line. */
export function cutLength(shape, pts, bar, rc) {
  if (bar.set === 'bs' && (shape === 'S' || shape === 'L' || shape === 'U')) {
    const d = outDims(shape, pts, bar, rc);
    if (shape === 'S') return d.A;
    if (shape === 'L') return d.A + d.B - 0.5 * bar.r - bar.db;
    return d.A + d.B + d.C - bar.r - 2 * bar.db;
  }
  return centerLength(pts, rc);
}

/** World polyline with arcs tessellated. */
export function tessellate(pts, rc, seg = 6) {
  const segs = segments(pts, rc);
  if (!segs.length) return pts.slice();
  const out = [segs[0].a];
  for (const g of segs) {
    if (g.k === 'L') { out.push(g.b); continue; }
    const u = norm(sub(g.a, g.c)), w0 = sub(g.b, g.c);
    const v = norm(sub(w0, mul(u, dot(w0, u))));
    for (let i = 1; i <= seg; i++) { const t = g.angle * i / seg; out.push(add(g.c, add(mul(u, g.r * Math.cos(t)), mul(v, g.r * Math.sin(t))))); }
  }
  return out;
}

/** The closed tie of a rectangle (centre-line corners in a plane) with two 135° hooks at the first corner, as a polyline.
 *  o = origin (the section's middle), ey, ez = the section's axes, w, h = centre-line width and height, tail = straight hook tail,
 *  rc = the tie's bend radius. The overlap at the hook corner is set off by one bar diameter along `ex` (so the two passes do not
 *  coincide), the way the bar is bent. */
export function closedTie(o, ex, ey, ez, w, h, tail, db) {
  const P = (y, z, x = 0) => add(add(add(o, mul(ey, y)), mul(ez, z)), mul(ex, x));
  const y0 = -w / 2, y1 = w / 2, z0 = -h / 2, z1 = h / 2;
  const s2 = Math.SQRT1_2;
  const off = db;
  return [
    P(y0 + tail * s2, z1 - tail * s2, 0),     // first tail (inside the core, toward the corner)
    P(y0, z1, 0), P(y0, z0, off / 4), P(y1, z0, off / 2), P(y1, z1, off * 3 / 4), P(y0, z1, off),
    P(y0 + tail * s2, z1 - tail * s2, off),   // second tail
  ];
}
