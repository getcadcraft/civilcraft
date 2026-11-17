// SPDX-License-Identifier: Apache-2.0
/**
 * junctions.js — where walls meet, for measurement methods that do not measure every wall along its full centre line
 * (booklet row BK.42, session bk-measure-10). Host-free: no imports, no DOM; one length unit in, the same unit out.
 * Canonical copy: lib/quantities/ (node tools/quantities/sync.mjs copies it to the apps).
 *
 * The three ways a method can measure wall junctions (methods.js JUNCTION_MODES):
 *   'centre'   every wall along its centre line as drawn; nothing is taken off where walls meet. (The default.)
 *   'overlap'  the part of a wall that lies inside another wall is counted once: a wall that ends against the run of another
 *              wall (a T) is measured to the face of that wall. At a corner (two walls ending on each other) nothing is taken
 *              off: measured on their centre lines, the two walls together already count the corner block exactly once.
 *              Two walls that cross: the thinner one (the same thickness: the one later in the list) loses the other's thickness.
 *   'face'     every wall end that meets another wall (a T or a corner) is measured to the near face of that wall, and each of
 *              two crossing walls loses the other's thickness. What is left is the clear length between walls.
 *
 *   junctionCuts(walls, { tol }) → Map(id → { face: { length, area }, overlap: { length, area }, ends: [..] })
 *     walls: [{ id, a: [x, y], b: [x, y], t (thickness), height, curved? }] of ONE level. `length` is taken off the wall's length,
 *     `area` off one face (length × the lower of the two walls' heights). tol: how near counts as touching (default 1 unit: 1 mm).
 *   cutFor(cuts, id, mode) → { length, area }   what `mode` takes off this wall (zeros for 'centre' or an unknown wall)
 *
 * What is assumed, and said in the apps: both walls stand on the same base; the lower height is used; curved walls are not
 * looked at (nothing is taken off them or off walls that meet them); walls nearer than 12 degrees to parallel are not a junction;
 * where several walls meet one wall end, the largest single cut counts, not the sum.
 */

const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const cross = (u, v) => u[0] * v[1] - u[1] * v[0];
const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : 0);
const MIN_SIN = 0.2;   // about 12 degrees

function frame(w) {
  const d = sub(w.b, w.a), len = Math.hypot(d[0], d[1]);
  return len > 0 ? { len, u: [d[0] / len, d[1] / len] } : null;
}

export function junctionCuts(walls, { tol = 1 } = {}) {
  const list = (walls || []).filter((w) => w && Array.isArray(w.a) && Array.isArray(w.b) && !w.curved).map((w, order) => ({ w, order, f: frame(w), t: pos(w.t), h: pos(w.height) })).filter((x) => x.f);
  const out = new Map();
  for (const w of walls || []) if (w) out.set(w.id, { face: { length: 0, area: 0 }, overlap: { length: 0, area: 0 }, ends: [] });
  const add = (W, X, kind, len) => {
    const o = out.get(W.w.id), h = Math.min(W.h, X.h);
    const L = Math.min(len, W.f.len);
    o.ends.push({ with: X.w.id, kind, length: L });
    if (kind !== 'corner') { o.overlap.length += L; o.overlap.area += L * h; }
    o.face.length += L; o.face.area += L * h;
  };
  for (const W of list) {
    // ---- each end of W against the other walls
    for (const end of ['a', 'b']) {
      const E = W.w[end];
      const hits = [];
      for (const X of list) {
        if (X === W) continue;
        const s = Math.abs(cross(W.f.u, X.f.u));
        if (s < MIN_SIN) continue;
        const r = sub(E, X.w.a), along = dot(r, X.f.u), d = Math.abs(cross(X.f.u, r));
        if (d > X.t / 2 + tol) continue;                                   // the end is not in or on X's body
        if (along < -(W.t / 2 + tol) || along > X.f.len + W.t / 2 + tol) continue;
        const nearEnd = along < Math.max(W.t, X.t) / 2 + tol || along > X.f.len - Math.max(W.t, X.t) / 2 - tol;
        hits.push({ X, corner: nearEnd, len: Math.max(0, (X.t / 2 - d) / s), u: X.f.u });
      }
      if (!hits.length) continue;
      // two walls in one line that both end here are one wall running through: a T, not a corner
      const through = hits.some((h1) => hits.some((h2) => h1 !== h2 && Math.abs(cross(h1.u, h2.u)) < 0.05));
      const best = hits.reduce((m, h) => (h.len > m.len ? h : m));
      if (best.len > 0) add(W, best.X, best.corner && !through ? 'corner' : 'tee', best.len);
    }
  }
  // ---- walls that cross (neither ends on the other)
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const A = list[i], B = list[j];
    const s = cross(A.f.u, B.f.u);
    if (Math.abs(s) < MIN_SIN) continue;
    const r = sub(B.w.a, A.w.a);
    const ta = cross(r, B.f.u) / s, tb = cross(r, A.f.u) / s;               // where the centre lines cross, along A and along B
    const inA = ta > B.t / 2 + tol && ta < A.f.len - B.t / 2 - tol, inB = tb > A.t / 2 + tol && tb < B.f.len - A.t / 2 - tol;
    if (!inA || !inB) continue;
    const lenA = B.t / Math.abs(s), lenB = A.t / Math.abs(s);
    const loser = A.t < B.t ? A : B;                                       // the thinner; the same thickness: the later one
    for (const [W, X, len] of [[A, B, lenA], [B, A, lenB]]) {
      const o = out.get(W.w.id), h = Math.min(W.h, X.h), L = Math.min(len, W.f.len);
      o.ends.push({ with: X.w.id, kind: 'cross', length: L });
      o.face.length += L; o.face.area += L * h;
      if (W === loser) { o.overlap.length += L; o.overlap.area += L * h; }
    }
  }
  return out;
}

export function cutFor(cuts, id, mode) {
  const c = cuts && cuts.get ? cuts.get(id) : null;
  if (!c || (mode !== 'face' && mode !== 'overlap')) return { length: 0, area: 0 };
  return c[mode];
}
