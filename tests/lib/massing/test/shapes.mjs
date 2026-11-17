/* SPDX-License-Identifier: Apache-2.0 */
/** Test solids with outward normals: a polygon (anticlockwise, [x, y]) extruded up, or a profile in the x-z plane extruded along y. */
const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
const inTri = (p, a, b, c) => cross(a, b, p) > 0 && cross(b, c, p) > 0 && cross(c, a, p) > 0;
export function earclip(P) {
  const idx = P.map((_, i) => i), out = [];
  let guard = 0;
  while (idx.length > 3 && guard++ < 1000) {
    for (let i = 0; i < idx.length; i++) {
      const a = idx[(i + idx.length - 1) % idx.length], b = idx[i], c = idx[(i + 1) % idx.length];
      if (cross(P[a], P[b], P[c]) <= 0) continue;
      if (idx.some((k) => k !== a && k !== b && k !== c && inTri(P[k], P[a], P[b], P[c]))) continue;
      out.push([a, b, c]); idx.splice(i, 1); break;
    }
  }
  out.push(idx);
  return out;
}
export function prism(P, z0, z1) {
  const T = [], caps = earclip(P);
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length];
    T.push([[a[0], a[1], z0], [b[0], b[1], z0], [b[0], b[1], z1]], [[a[0], a[1], z0], [b[0], b[1], z1], [a[0], a[1], z1]]);
  }
  for (const [a, b, c] of caps) {
    T.push([[P[a][0], P[a][1], z1], [P[b][0], P[b][1], z1], [P[c][0], P[c][1], z1]]);
    T.push([[P[c][0], P[c][1], z0], [P[b][0], P[b][1], z0], [P[a][0], P[a][1], z0]]);
  }
  return T;
}
/** profile [[x, z]] anticlockwise in the x-z plane, extruded from y0 to y1. */
export function prismY(P, y0, y1) {
  return prism(P, y0, y1).map((t) => t.map(([u, v, w]) => [u, w, v]).reverse());
}
export const box = (x0, y0, z0, x1, y1, z1) => prism([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], z0, z1);
