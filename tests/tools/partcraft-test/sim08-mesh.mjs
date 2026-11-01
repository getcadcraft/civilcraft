/* SPDX-License-Identifier: Apache-2.0 */
// Structured T10 meshes for the part-sim-08 tests (nonlinear.js, contact.js): a box of cubes, each cut into six tets,
// midside nodes shared by edge. Node/tet layout as tetmesh.js toT10: tets10 = corners, then midsides (01)(12)(02)(03)(13)(23).
export function boxT10(size, div, origin = [0, 0, 0], warp = null) {
  const [nx, ny, nz] = div, nodes = [], tets = [], key = new Map();
  const id = (i, j, k) => i + (nx + 1) * (j + (ny + 1) * k);
  for (let k = 0; k <= nz; k++) for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    let p = [origin[0] + size[0] * i / nx, origin[1] + size[1] * j / ny, origin[2] + size[2] * k / nz];
    if (warp) p = warp(p);
    nodes.push(...p);
  }
  const mid = (a, b) => { const kk = a < b ? a * 1e7 + b : b * 1e7 + a; let m = key.get(kk); if (m === undefined) { m = nodes.length / 3; key.set(kk, m); for (let c = 0; c < 3; c++) nodes.push((nodes[3 * a + c] + nodes[3 * b + c]) / 2); } return m; };
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) for (const p of perms) {
    const c = [i, j, k], v = [id(...c)]; for (let s = 0; s < 3; s++) { c[p[s]]++; v.push(id(...c)); }
    const X = (n) => nodes.slice(3 * n, 3 * n + 3), a = X(v[0]), b = X(v[1]), cc = X(v[2]), d = X(v[3]);
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], w = [cc[0] - a[0], cc[1] - a[1], cc[2] - a[2]], z = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
    const vol = u[0] * (w[1] * z[2] - w[2] * z[1]) - u[1] * (w[0] * z[2] - w[2] * z[0]) + u[2] * (w[0] * z[1] - w[1] * z[0]);
    if (vol < 0) [v[2], v[3]] = [v[3], v[2]];
    tets.push(v);
  }
  const n4 = nodes.length / 3; void n4;
  const t10 = tets.map((v) => [...v, mid(v[0], v[1]), mid(v[1], v[2]), mid(v[0], v[2]), mid(v[0], v[3]), mid(v[1], v[3]), mid(v[2], v[3])]);
  return { nodes: Float64Array.from(nodes), tets10: Int32Array.from(t10.flat()), nTets: tets.length };
}
/** Nodal force vector (old numbering) for a uniform traction t (3) over the faces of tets that lie in the plane where pred(p) holds. */
export function faceTraction(t10, pred, t, f = null) {
  const X = t10.nodes, m = t10.tets10.length / 10; f = f || new Float64Array(X.length);
  const faces = [[0, 1, 2, 4, 5, 6], [0, 1, 3, 4, 8, 7], [1, 2, 3, 5, 9, 8], [0, 2, 3, 6, 9, 7]];
  for (let e = 0; e < m; e++) for (const fc of faces) {
    const v = fc.map((q) => t10.tets10[10 * e + q]);
    if (!v.every((n) => pred([X[3 * n], X[3 * n + 1], X[3 * n + 2]]))) continue;
    const P = (n) => [X[3 * n], X[3 * n + 1], X[3 * n + 2]], a = P(v[0]), b = P(v[1]), c = P(v[2]);
    const cr = [(b[1] - a[1]) * (c[2] - a[2]) - (b[2] - a[2]) * (c[1] - a[1]), (b[2] - a[2]) * (c[0] - a[0]) - (b[0] - a[0]) * (c[2] - a[2]), (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])];
    const A = 0.5 * Math.hypot(...cr);
    for (let q = 3; q < 6; q++) for (let ax = 0; ax < 3; ax++) f[3 * v[q] + ax] += A / 3 * t[ax];   // T6: corners 0, midsides A/3
  }
  return f;
}

/**
 * A quarter solid of revolution (x ≥ 0, z ≥ 0 about the y axis) as a closed triangle mesh for tetmesh.js.
 * profile: [[r, y], …] from the pole (r = 0) to the top rim; the top is a flat disc at the last y. triFace: 0 the curved side,
 * 1 the plane x = 0, 2 the plane z = 0, 3 the top disc. → { mesh: { positions, indices, triFace }, faces }
 */
export function revolveQuarter(profile, nphi, rings = 4) {
  const n = profile.length - 1, pos = [], tri = [], tag = [];
  const ph = (k) => (k * Math.PI) / 2 / nphi, cs = (k) => (k === nphi ? 0 : Math.cos(ph(k))), sn = (k) => (k === 0 ? 0 : Math.sin(ph(k)));
  const add = (p) => { pos.push(...p); return pos.length / 3 - 1; };
  const V = [[add([0, profile[0][1], 0])]];
  for (let i = 1; i <= n; i++) { V.push([]); for (let k = 0; k <= nphi; k++) V[i].push(add([profile[i][0] * cs(k), profile[i][1], profile[i][0] * sn(k)])); }
  const pole = V[0][0], A = [pole]; for (let i = 1; i <= n; i++) A.push(add([0, profile[i][1], 0]));
  const yt = profile[n][1], rt = profile[n][0];
  const T = [[A[n]]]; for (let j = 1; j <= rings; j++) { T.push([]); for (let k = 0; k <= nphi; k++) T[j].push(j === rings ? V[n][k] : add([rt * j / rings * cs(k), yt, rt * j / rings * sn(k)])); }
  const vv = (i, k) => (i === 0 ? pole : V[i][k]);
  const push = (a, b, c, f) => { tri.push(a, b, c); tag.push(f); };
  for (let k = 0; k < nphi; k++) {
    push(pole, V[1][k], V[1][k + 1], 0);
    for (let i = 1; i < n; i++) { push(V[i][k], V[i + 1][k], V[i + 1][k + 1], 0); push(V[i][k], V[i + 1][k + 1], V[i][k + 1], 0); }
    push(A[n], T[1][k], T[1][k + 1], 3);
    for (let j = 1; j < rings; j++) { push(T[j][k], T[j + 1][k], T[j + 1][k + 1], 3); push(T[j][k], T[j + 1][k + 1], T[j][k + 1], 3); }
  }
  for (const [kc, f] of [[nphi, 1], [0, 2]]) {
    const Pn = (i) => vv(i, kc), Q = (j) => (j === 0 ? A[n] : T[j][kc]);
    push(pole, Pn(1), A[1], f);
    for (let i = 1; i < n - 1; i++) { push(Pn(i), Pn(i + 1), A[i + 1], f); push(Pn(i), A[i + 1], A[i], f); }
    for (let j = rings; j >= 1; j--) push(Pn(n - 1), Q(j), Q(j - 1), f);
    push(Pn(n - 1), A[n], A[n - 1], f);
  }
  const c = [0, 0, 0]; for (let i = 0; i < pos.length; i += 3) for (let a = 0; a < 3; a++) c[a] += pos[i + a] / (pos.length / 3);
  const out = [], tg = [];
  for (let t = 0; t < tri.length; t += 3) {
    let [a, b, d] = [tri[t], tri[t + 1], tri[t + 2]];
    const P = (q) => [pos[3 * q], pos[3 * q + 1], pos[3 * q + 2]], pa = P(a), pb = P(b), pd = P(d);
    const u = [pb[0] - pa[0], pb[1] - pa[1], pb[2] - pa[2]], w = [pd[0] - pa[0], pd[1] - pa[1], pd[2] - pa[2]];
    const nn = [u[1] * w[2] - u[2] * w[1], u[2] * w[0] - u[0] * w[2], u[0] * w[1] - u[1] * w[0]];
    if (Math.hypot(...nn) < 1e-12) continue;   // the collapsed triangles at the axis
    const m = [(pa[0] + pb[0] + pd[0]) / 3 - c[0], (pa[1] + pb[1] + pd[1]) / 3 - c[1], (pa[2] + pb[2] + pd[2]) / 3 - c[2]];
    if (nn[0] * m[0] + nn[1] * m[1] + nn[2] * m[2] < 0) [b, d] = [d, b];
    out.push(a, b, d); tg.push(tag[t / 3]);
  }
  const faces = [{ type: 'other' }, { type: 'plane', n: [1, 0, 0], o: [0, 0, 0] }, { type: 'plane', n: [0, 0, 1], o: [0, 0, 0] }, { type: 'plane', n: [0, 1, 0], o: [0, yt, 0], area: Math.PI * rt * rt / 4 }];
  return { mesh: { positions: Float32Array.from(pos), indices: Uint32Array.from(out), triFace: Int32Array.from(tg) }, faces };
}
/** Profile of a sphere of radius R from its pole at y = 0 (dir +1 grows up, −1 down) to polar angle thMax, steps with spacing growing from ds0. */
export function spherePole(R, thMax, ds0, grow = 1.25, dir = 1) {
  const pts = [[0, 0]]; let s = 0, ds = ds0;
  while (s + ds < R * thMax - 1e-9) { s += ds; ds *= grow; const th = s / R; pts.push([R * Math.sin(th), dir * R * (1 - Math.cos(th))]); }
  pts.push([R * Math.sin(thMax), dir * R * (1 - Math.cos(thMax))]);
  return pts;
}

/** Boundary T6 triangles (corners, then midsides 01 12 20; outward normals) of the tets whose face lies wholly where pred(point) holds. */
export function outwardFaces(t10, pred) {
  const X = t10.nodes, m = t10.tets10.length / 10, out = [];
  const edge = { '0,1': 4, '1,0': 4, '1,2': 5, '2,1': 5, '0,2': 6, '2,0': 6, '0,3': 7, '3,0': 7, '1,3': 8, '3,1': 8, '2,3': 9, '3,2': 9 };
  for (let e = 0; e < m; e++) for (const [a, b, c, d] of [[0, 1, 2, 3], [0, 1, 3, 2], [1, 2, 3, 0], [0, 2, 3, 1]]) {
    const V = (k) => t10.tets10[10 * e + k], P = (k) => [X[3 * V(k)], X[3 * V(k) + 1], X[3 * V(k) + 2]];
    if (![a, b, c].every((k) => pred(P(k)))) continue;
    const pa = P(a), pb = P(b), pc = P(c), pd = P(d);
    const n = [(pb[1] - pa[1]) * (pc[2] - pa[2]) - (pb[2] - pa[2]) * (pc[1] - pa[1]), (pb[2] - pa[2]) * (pc[0] - pa[0]) - (pb[0] - pa[0]) * (pc[2] - pa[2]), (pb[0] - pa[0]) * (pc[1] - pa[1]) - (pb[1] - pa[1]) * (pc[0] - pa[0])];
    const inward = n[0] * (pd[0] - pa[0]) + n[1] * (pd[1] - pa[1]) + n[2] * (pd[2] - pa[2]) > 0;
    const [i, j, k] = inward ? [a, c, b] : [a, b, c];
    out.push([V(i), V(j), V(k), V(edge[i + ',' + j]), V(edge[j + ',' + k]), V(edge[k + ',' + i])]);
  }
  return out;
}
