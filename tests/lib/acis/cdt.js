/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cdt.js — constrained Delaunay triangulation of a region in the plane (cc-acis' faces in their own (u, v)). No DOM,
 * no imports. Our own, after the textbook method: points are inserted one by one (Lawson: split the triangle the point
 * falls in, flip edges until Delaunay), each boundary segment is then forced in by flipping the edges that cross it
 * (Sloan, "A fast algorithm for generating constrained Delaunay triangulations", 1993), and the triangles inside the
 * rings are kept by parity: crossing a boundary segment goes from outside to inside and back.
 *
 *   cdt(xy, rings) → [i0, i1, i2, …]
 *     xy: flat [x0, y0, x1, y1, …] — every point (the rings' points first, ring after ring, then any points inside)
 *     rings: [[start, count]…] — each ring's run of points (closed: the last joins the first)
 *   Every point is used (none dropped for lying in a line with others); triangles come anticlockwise.
 */

export function cdt(xy, rings) {
  const n = xy.length >> 1;
  if (n < 3) return [];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) { const x = xy[2 * i], y = xy[2 * i + 1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const D = Math.max(x1 - x0, y1 - y0) || 1, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  // the points, then three far corners of a triangle around all of them
  const X = new Float64Array(n + 3), Y = new Float64Array(n + 3);
  for (let i = 0; i < n; i++) { X[i] = xy[2 * i]; Y[i] = xy[2 * i + 1]; }
  X[n] = cx - 20 * D; Y[n] = cy - 10 * D;
  X[n + 1] = cx + 20 * D; Y[n + 1] = cy - 10 * D;
  X[n + 2] = cx; Y[n + 2] = cy + 20 * D;
  const eps = D * 1e-13, epsA = D * D * 1e-13;   // a length, an area (orient() is twice a triangle's area)
  const orient = (a, b, c) => (X[b] - X[a]) * (Y[c] - Y[a]) - (Y[b] - Y[a]) * (X[c] - X[a]);
  const inCircle = (a, b, c, d) => {
    const adx = X[a] - X[d], ady = Y[a] - Y[d], bdx = X[b] - X[d], bdy = Y[b] - Y[d], cdx = X[c] - X[d], cdy = Y[c] - Y[d];
    return (adx * adx + ady * ady) * (bdx * cdy - cdx * bdy) - (bdx * bdx + bdy * bdy) * (adx * cdy - cdx * ady) + (cdx * cdx + cdy * cdy) * (adx * bdy - bdx * ady);
  };
  // triangles: V[t*3 + k] corners (anticlockwise), N[t*3 + k] the triangle across edge k (corner k → corner k+1)
  const V = [n, n + 1, n + 2], N = [-1, -1, -1];
  const alias = new Int32Array(n).fill(-1);    // a point on top of another → that one
  const fixed = new Set();                      // boundary edges, once in
  const ek = (a, b) => (a < b ? a * 4294967296 + b : b * 4294967296 + a);
  const edgeOf = (t, a) => { for (let k = 0; k < 3; k++) if (V[t * 3 + k] === a) return k; return -1; };
  const setN = (t, a, b, u) => { if (t < 0) return; for (let k = 0; k < 3; k++) if (V[t * 3 + k] === a && V[t * 3 + (k + 1) % 3] === b) { N[t * 3 + k] = u; return; } };
  let last = 0;
  const locate = (p) => {
    let t = last;
    for (let steps = 0; steps < 4 * V.length; steps++) {
      let moved = false;
      for (let k = 0; k < 3; k++) {
        const a = V[t * 3 + k], b = V[t * 3 + (k + 1) % 3];
        if (orient(a, b, p) < -epsA && N[t * 3 + k] >= 0) { t = N[t * 3 + k]; moved = true; break; }
      }
      if (!moved) return t;
    }
    // walking failed (rounding): look at every triangle
    for (let t2 = 0; t2 < V.length / 3; t2++) {
      const a = V[t2 * 3], b = V[t2 * 3 + 1], c = V[t2 * 3 + 2];
      if (orient(a, b, p) >= -epsA && orient(b, c, p) >= -epsA && orient(c, a, p) >= -epsA) return t2;
    }
    return -1;
  };
  /** flip the edge of t at corner k with the triangle across; → the two triangles (t keeps corner a) */
  const flip = (t, k) => {
    const u = N[t * 3 + k];
    const a = V[t * 3 + k], b = V[t * 3 + (k + 1) % 3], c = V[t * 3 + (k + 2) % 3];
    const ku = edgeOf(u, b);   // in u the edge runs b → a
    const d = V[u * 3 + (ku + 2) % 3];
    const tNa = N[t * 3 + (k + 2) % 3];   // across c → a
    const tNb = N[t * 3 + (k + 1) % 3];   // across b → c
    const uNa = N[u * 3 + (ku + 1) % 3];  // across a → d
    const uNb = N[u * 3 + (ku + 2) % 3];  // across d → b
    // t = (a, d, c), u = (d, b, c)
    V[t * 3] = a; V[t * 3 + 1] = d; V[t * 3 + 2] = c;
    N[t * 3] = uNa; N[t * 3 + 1] = u; N[t * 3 + 2] = tNa;
    V[u * 3] = d; V[u * 3 + 1] = b; V[u * 3 + 2] = c;
    N[u * 3] = uNb; N[u * 3 + 1] = tNb; N[u * 3 + 2] = t;
    setN(uNa, d, a, t); setN(tNb, c, b, u);
    return [t, u];
  };
  const legalize = (stack) => {
    let guard = 0;
    while (stack.length && guard++ < 1e7) {
      const [t, p] = stack.pop();
      // the edge of t opposite p
      const kp = edgeOf(t, p);
      if (kp < 0) continue;
      const k = (kp + 1) % 3;
      const u = N[t * 3 + k];
      if (u < 0) continue;
      const a = V[t * 3 + k], b = V[t * 3 + (k + 1) % 3];
      if (fixed.has(ek(a, b))) continue;
      const ku = edgeOf(u, b);
      const d = V[u * 3 + (ku + 2) % 3];
      // t = (p, a, b) anticlockwise with p at kp: p, then a, then b
      if (inCircle(p, a, b, d) > 0) {
        const kk = edgeOf(t, a);   // the edge a → b of t
        const [t1, u1] = flip(t, kk);
        stack.push([t1, p], [u1, p]);
      }
    }
  };
  const add = (p) => {
    const t = locate(p);
    if (t < 0) return false;
    // on top of a corner?
    for (let k = 0; k < 3; k++) { const q = V[t * 3 + k]; if (Math.abs(X[q] - X[p]) <= eps && Math.abs(Y[q] - Y[p]) <= eps) { alias[p] = q < n ? q : -1; return true; } }
    const a = V[t * 3], b = V[t * 3 + 1], c = V[t * 3 + 2];
    const nA = N[t * 3], nB = N[t * 3 + 1], nC = N[t * 3 + 2];
    // on an edge? split it and the triangle across
    let onK = -1;
    for (let k = 0; k < 3; k++) if (Math.abs(orient(V[t * 3 + k], V[t * 3 + (k + 1) % 3], p)) <= epsA) { onK = k; break; }
    if (onK >= 0 && N[t * 3 + onK] >= 0) {
      const k = onK;
      const ea = V[t * 3 + k], eb = V[t * 3 + (k + 1) % 3], ec = V[t * 3 + (k + 2) % 3];
      const u = N[t * 3 + k], ku = edgeOf(u, eb), ed = V[u * 3 + (ku + 2) % 3];
      const t_ca = N[t * 3 + (k + 2) % 3], t_bc = N[t * 3 + (k + 1) % 3];
      const u_ad = N[u * 3 + (ku + 1) % 3], u_db = N[u * 3 + (ku + 2) % 3];
      const t2 = V.length / 3, u2 = t2 + 1;
      // t = (ea, p, ec), t2 = (p, eb, ec), u = (eb, p, ed), u2 = (p, ea, ed)
      V[t * 3] = ea; V[t * 3 + 1] = p; V[t * 3 + 2] = ec; N[t * 3] = u2; N[t * 3 + 1] = t2; N[t * 3 + 2] = t_ca;
      V.push(p, eb, ec); N.push(u, t_bc, t);
      V[u * 3] = eb; V[u * 3 + 1] = p; V[u * 3 + 2] = ed; N[u * 3] = t2; N[u * 3 + 1] = u2; N[u * 3 + 2] = u_db;
      V.push(p, ea, ed); N.push(t, u_ad, u);
      setN(t_bc, ec, eb, t2); setN(u_ad, ed, ea, u2);
      // a boundary edge split in two stays boundary in its halves
      if (fixed.has(ek(ea, eb))) { fixed.delete(ek(ea, eb)); fixed.add(ek(ea, p)); fixed.add(ek(p, eb)); }
      last = t;
      legalize([[t, p], [t2, p], [u, p], [u2, p]]);
      return true;
    }
    const t2 = V.length / 3, t3 = t2 + 1;
    // t = (a, b, p), t2 = (b, c, p), t3 = (c, a, p)
    V[t * 3] = a; V[t * 3 + 1] = b; V[t * 3 + 2] = p; N[t * 3] = nA; N[t * 3 + 1] = t2; N[t * 3 + 2] = t3;
    V.push(b, c, p); N.push(nB, t3, t);
    V.push(c, a, p); N.push(nC, t, t2);
    setN(nB, c, b, t2); setN(nC, a, c, t3);
    last = t;
    legalize([[t, p], [t2, p], [t3, p]]);
    return true;
  };
  for (let i = 0; i < n; i++) add(i);
  const real = (i) => (alias[i] >= 0 ? alias[i] : i);

  // force the boundary segments in
  const segs = [];
  for (const [s, c] of rings) for (let i = 0; i < c; i++) { const a = real(s + i), b = real(s + (i + 1) % c); if (a !== b) segs.push([a, b]); }
  const crosses = (a, b, c, d) => {
    const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
    return ((o1 > epsA && o2 < -epsA) || (o1 < -epsA && o2 > epsA)) && ((o3 > epsA && o4 < -epsA) || (o3 < -epsA && o4 > epsA));
  };
  const edgeSet = () => {
    const m = new Map();
    for (let t = 0; t < V.length / 3; t++) for (let k = 0; k < 3; k++) m.set(V[t * 3 + k] * 4294967296 + V[t * 3 + (k + 1) % 3], t * 3 + k);
    return m;
  };
  let E = edgeSet();
  for (const [a, b] of segs) {
    if (E.has(a * 4294967296 + b) || E.has(b * 4294967296 + a)) { fixed.add(ek(a, b)); continue; }
    // the edges that cross a–b
    let queue = [];
    for (let t = 0; t < V.length / 3; t++) for (let k = 0; k < 3; k++) {
      const p = V[t * 3 + k], q = V[t * 3 + (k + 1) % 3];
      if (p < q && N[t * 3 + k] >= 0 && crosses(a, b, p, q)) queue.push([p, q]);
    }
    let guard = 0;
    while (queue.length && guard++ < 100000) {
      const [p, q] = queue.shift();
      const at = E.get(p * 4294967296 + q) ?? E.get(q * 4294967296 + p);
      if (at === undefined) continue;
      const t = (at / 3) | 0, k = at % 3;
      const u = N[t * 3 + k];
      if (u < 0) continue;
      const c = V[t * 3 + (k + 2) % 3], ku = edgeOf(u, V[t * 3 + (k + 1) % 3]), d = V[u * 3 + (ku + 2) % 3];
      const ea = V[t * 3 + k], eb = V[t * 3 + (k + 1) % 3];
      // a convex quad c, ea, d, eb: flip to c–d
      if (!(orient(ea, d, c) > epsA && orient(d, eb, c) > epsA)) { queue.push([p, q]); continue; }
      flip(t, k);
      E = edgeSet();
      if (crosses(a, b, c, d)) queue.push(c < d ? [c, d] : [d, c]);
    }
    fixed.add(ek(a, b));
  }

  // inside or out: start outside at the far triangle corners, change side across each boundary segment
  const nT = V.length / 3;
  const side = new Int8Array(nT).fill(-1);
  const stack = [];
  for (let t = 0; t < nT; t++) if (V[t * 3] >= n || V[t * 3 + 1] >= n || V[t * 3 + 2] >= n) { side[t] = 0; stack.push(t); }
  while (stack.length) {
    const t = stack.pop();
    for (let k = 0; k < 3; k++) {
      const u = N[t * 3 + k];
      if (u < 0 || side[u] >= 0) continue;
      const crossing = fixed.has(ek(V[t * 3 + k], V[t * 3 + (k + 1) % 3]));
      side[u] = crossing ? 1 - side[t] : side[t];
      stack.push(u);
    }
  }
  const out = [];
  for (let t = 0; t < nT; t++) {
    if (side[t] !== 1) continue;
    const a = V[t * 3], b = V[t * 3 + 1], c = V[t * 3 + 2];
    if (a >= n || b >= n || c >= n) continue;
    out.push(a, b, c);
  }
  return out;
}
