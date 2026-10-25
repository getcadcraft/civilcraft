/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cdt.js — points added inside a triangulated polygon (with holes), keeping it Delaunay: each point splits the triangle it
 * falls in, then edges are flipped while the opposite corner lies inside a circumcircle (Lawson's algorithm, from the
 * textbooks: de Berg et al., "Computational Geometry", ch. 9). The polygon's own sides are never flipped, because no
 * triangle lies on their far side. DOM-free, our own code.
 *
 *   insertPoints(X, Y, tris, points) → tris   X, Y: growable arrays of coordinates (the new points are pushed onto them),
 *       tris: [a, b, c, …] from earcut (any turn), points: [[x, y], …]; returns the new triangle list (counter-clockwise)
 *   flipAll(X, Y, tris) → tris   the same flips with no new points (makes earcut's fans Delaunay)
 */

const orient = (X, Y, a, b, c) => (X[b] - X[a]) * (Y[c] - Y[a]) - (Y[b] - Y[a]) * (X[c] - X[a]);

function inCircle(X, Y, a, b, c, d) {
  const ax = X[a] - X[d], ay = Y[a] - Y[d], bx = X[b] - X[d], by = Y[b] - Y[d], cx = X[c] - X[d], cy = Y[c] - Y[d];
  return (ax * ax + ay * ay) * (bx * cy - cx * by) - (bx * bx + by * by) * (ax * cy - cx * ay) + (cx * cx + cy * cy) * (ax * by - bx * ay);
}

class Mesh2 {
  constructor(X, Y, tris) {
    this.X = X; this.Y = Y; this.T = []; this.he = new Map();
    for (let k = 0; k < tris.length; k += 3) {
      let [a, b, c] = [tris[k], tris[k + 1], tris[k + 2]];
      const o = orient(X, Y, a, b, c);
      if (o === 0) continue;
      if (o < 0) [b, c] = [c, b];
      this.put(this.T.length, a, b, c);
    }
    this.last = 0;
  }
  key(a, b) { return a * 4294967296 + b; }
  put(t, a, b, c) {
    if (t < this.T.length && this.T[t]) this.drop(t);
    this.T[t] = [a, b, c];
    this.he.set(this.key(a, b), t); this.he.set(this.key(b, c), t); this.he.set(this.key(c, a), t);
  }
  drop(t) {
    const [a, b, c] = this.T[t];
    for (const [p, q] of [[a, b], [b, c], [c, a]]) if (this.he.get(this.key(p, q)) === t) this.he.delete(this.key(p, q));
    this.T[t] = null;
  }
  /** The triangle holding (x, y): a walk from the last one, then every triangle when the walk gets lost. */
  locate(x, y) {
    const X = this.X, Y = this.Y;
    const inside = (t) => {
      const T = this.T[t];
      if (!T) return -1;
      const [a, b, c] = T;
      const o = (p, q) => (X[q] - X[p]) * (y - Y[p]) - (Y[q] - Y[p]) * (x - X[p]);
      const e0 = o(a, b), e1 = o(b, c), e2 = o(c, a);
      if (e0 >= 0 && e1 >= 0 && e2 >= 0) return -2;
      // step across the side it lies most outside of
      const m = Math.min(e0, e1, e2);
      const [p, q] = m === e0 ? [a, b] : m === e1 ? [b, c] : [c, a];
      const n = this.he.get(this.key(q, p));
      return n === undefined ? -1 : n;
    };
    let t = this.T[this.last] ? this.last : this.T.findIndex(Boolean);
    for (let step = 0; step < 4096 && t >= 0; step++) {
      const r = inside(t);
      if (r === -2) return t;
      t = r;
    }
    for (let k = 0; k < this.T.length; k++) if (inside(k) === -2) return k;
    return -1;
  }
  insert(x, y) {
    const t = this.locate(x, y);
    if (t < 0) return false;
    const X = this.X, Y = this.Y;
    const [a, b, c] = this.T[t];
    // too close to a side or corner: leave it out (the refinement after this fills in where needed)
    const area = orient(X, Y, a, b, c);
    const p = X.length;
    X.push(x); Y.push(y);
    const w0 = orient(X, Y, a, b, p), w1 = orient(X, Y, b, c, p), w2 = orient(X, Y, c, a, p);
    const eps = area * 1e-6;
    if (Math.min(w0, w1, w2) <= eps) {
      // on a side (the other two well inside): split it and the triangle beyond; on a corner or a polygon side: leave it out
      const on = [w0, w1, w2].filter((w) => w <= eps).length;
      const [q, r, o] = w0 <= eps ? [a, b, c] : w1 <= eps ? [b, c, a] : [c, a, b];
      const n = this.he.get(this.key(r, q));
      if (on !== 1 || n === undefined || Math.min(w0, w1, w2) < -eps) { X.pop(); Y.pop(); return false; }
      const N = this.T[n];
      const d = N[0] === r ? N[2] : N[1] === r ? N[0] : N[1];
      if (orient(X, Y, r, p, d) <= 0 || orient(X, Y, p, q, d) <= 0) { X.pop(); Y.pop(); return false; }
      this.drop(n);
      this.put(t, q, p, o); this.put(n, p, r, o);
      const t3 = this.T.length; this.put(t3, r, p, d);
      const t4 = this.T.length; this.put(t4, p, q, d);
      this.last = t;
      this.legalize(r, o, p); this.legalize(o, q, p); this.legalize(q, d, p); this.legalize(d, r, p);
      return true;
    }
    this.put(t, a, b, p);
    const t1 = this.T.length; this.put(t1, b, c, p);
    const t2 = this.T.length; this.put(t2, c, a, p);
    this.last = t;
    this.legalize(a, b, p); this.legalize(b, c, p); this.legalize(c, a, p);
    return true;
  }
  /** Edge a→b of triangle (a, b, p): flip it while the far corner lies in the circle. */
  legalize(a, b, p, depth = 0) {
    if (depth > 64) return;
    const t = this.he.get(this.key(a, b));
    const n = this.he.get(this.key(b, a));
    if (t === undefined || n === undefined) return;
    const N = this.T[n];
    const d = N[0] === b ? N[2] : N[1] === b ? N[0] : N[1];   // the corner of (b, a, d) not on the edge
    if (inCircle(this.X, this.Y, a, b, p, d) <= 0) return;
    // the new edge p–d must leave both triangles turning the same way
    if (orient(this.X, this.Y, a, d, p) <= 0 || orient(this.X, this.Y, d, b, p) <= 0) return;
    this.drop(n);
    this.put(t, a, d, p);
    this.put(n, d, b, p);
    this.legalize(a, d, p, depth + 1);
    this.legalize(d, b, p, depth + 1);
  }
  out() { const r = []; for (const T of this.T) if (T) r.push(T[0], T[1], T[2]); return r; }
}

export function insertPoints(X, Y, tris, points) {
  const m = new Mesh2(X, Y, tris);
  for (const [x, y] of points) m.insert(x, y);
  return m.out();
}

export function flipAll(X, Y, tris) {
  const m = new Mesh2(X, Y, tris);
  for (let pass = 0; pass < 8; pass++) {
    let flips = 0;
    for (let t = 0; t < m.T.length; t++) {
      const T = m.T[t];
      if (!T) continue;
      for (let k = 0; k < 3; k++) {
        const a = T[k], b = T[(k + 1) % 3], p = T[(k + 2) % 3];
        const n = m.he.get(m.key(b, a));
        if (n === undefined) continue;
        const N = m.T[n];
        const d = N[0] === b ? N[2] : N[1] === b ? N[0] : N[1];
        if (inCircle(X, Y, a, b, p, d) > 0 && orient(X, Y, a, d, p) > 0 && orient(X, Y, d, b, p) > 0) {
          m.drop(n); m.put(t, a, d, p); m.put(n, d, b, p); flips++;
          break;
        }
      }
    }
    if (!flips) break;
  }
  return m.out();
}
