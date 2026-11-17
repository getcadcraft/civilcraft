/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-geom.js — geometry helpers of the open solver cases library (lib/opensolvers; suggestion 1309). DOM-free, imports nothing.
 *
 *   surface = { positions: number[] | Float32Array (x y z …, model units), indices: (i j k …), triFace?: per-triangle host face index }
 *   bounds(positions) → { min, max, size, diag }
 *   faceTriangles(surface, faces) → triangle indices of those host faces · otherTriangles(surface, usedFaces) → the rest
 *   patchStats(surface, tris) → { area, normal (unit, area-weighted, outward), centroid }
 *   stlAscii(name, surface, tris, scale) → an ASCII STL solid (one `solid name` … `endsolid name`), coordinates × scale
 *   inside(surface, p) → true when p is inside the closed surface (ray parity, three skew rays, majority)
 *   distance(surface, p) → the shortest distance from p to the surface
 *   tetBoundary(tets4) / cellSurface: see os-vtk.js for cells read from a file
 * The point-in-solid test is the crossing-number rule (Jordan curve theorem) with the Möller–Trumbore ray/triangle test
 * (Möller and Trumbore, "Fast, minimum storage ray/triangle intersection", J. Graphics Tools 2(1), 1997).
 */
export const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const norm = (a) => Math.hypot(a[0], a[1], a[2]);
export const unit = (a) => { const l = norm(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

export function bounds(P) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let d = 0; d < 3; d++) { const v = P[i + d]; if (v < min[d]) min[d] = v; if (v > max[d]) max[d] = v; }
  const size = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
  return { min, max, size, diag: Math.hypot(size[0], size[1], size[2]) };
}

const vert = (s, t, k) => { const i = 3 * s.indices[3 * t + k]; return [s.positions[i], s.positions[i + 1], s.positions[i + 2]]; };
export const triCount = (s) => s.indices.length / 3;

export function faceTriangles(s, faces) {
  const want = new Set(faces), out = [];
  if (!s.triFace) return out;
  for (let t = 0; t < s.triFace.length; t++) if (want.has(s.triFace[t])) out.push(t);
  return out;
}
export function otherTriangles(s, usedFaces) {
  const used = new Set(usedFaces), out = [], n = triCount(s);
  for (let t = 0; t < n; t++) if (!s.triFace || !used.has(s.triFace[t])) out.push(t);
  return out;
}

export function patchStats(s, tris) {
  let area = 0; const n = [0, 0, 0], c = [0, 0, 0];
  for (const t of tris) {
    const a = vert(s, t, 0), b = vert(s, t, 1), d = vert(s, t, 2), w = cross(sub(b, a), sub(d, a)), A = norm(w) / 2;
    area += A;
    for (let k = 0; k < 3; k++) { n[k] += w[k] / 2; c[k] += A * (a[k] + b[k] + d[k]) / 3; }
  }
  return { area, normal: unit(n), centroid: area > 0 ? c.map((v) => v / area) : [0, 0, 0] };
}

const e6 = (v) => { const s = v.toExponential(6); return s; };
/** One ASCII STL solid. STL has no units: the writer multiplies by `scale` (model mm → metres = 0.001). */
export function stlAscii(name, s, tris, scale = 1) {
  const L = ['solid ' + name];
  for (const t of tris) {
    const a = vert(s, t, 0), b = vert(s, t, 1), c = vert(s, t, 2), n = unit(cross(sub(b, a), sub(c, a)));
    L.push(' facet normal ' + n.map(e6).join(' '), '  outer loop');
    for (const p of [a, b, c]) L.push('   vertex ' + p.map((v) => e6(v * scale)).join(' '));
    L.push('  endloop', ' endfacet');
  }
  L.push('endsolid ' + name);
  return L.join('\n') + '\n';
}

/** Ray from o along d against triangle (a, b, c) → distance t > eps, or null. */
function rayTri(o, d, a, b, c) {
  const e1 = sub(b, a), e2 = sub(c, a), p = cross(d, e2), det = dot(e1, p);
  if (Math.abs(det) < 1e-14) return null;
  const inv = 1 / det, tv = sub(o, a), u = dot(tv, p) * inv;
  if (u < 0 || u > 1) return null;
  const q = cross(tv, e1), v = dot(d, q) * inv;
  if (v < 0 || u + v > 1) return null;
  const t = dot(e2, q) * inv;
  return t > 1e-9 ? t : null;
}
// three directions that are not along an axis or a common diagonal, so a ray does not run in a face or through an edge of a box-like part
const RAYS = [unit([0.5773, 0.3015, 0.7592]), unit([-0.2113, 0.8911, 0.4016]), unit([0.6713, -0.5309, -0.5171])];

export function inside(s, p) {
  const n = triCount(s);
  let votes = 0;
  for (const d of RAYS) {
    let hits = 0;
    for (let t = 0; t < n; t++) if (rayTri(p, d, vert(s, t, 0), vert(s, t, 1), vert(s, t, 2)) !== null) hits++;
    if (hits % 2 === 1) votes++;
  }
  return votes >= 2;
}

/** Closest distance from p to triangle (a, b, c) (Ericson, Real-Time Collision Detection, 5.1.5: the Voronoi regions of the triangle). */
function distTri(p, a, b, c) {
  const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a), d1 = dot(ab, ap), d2 = dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) return norm(ap);
  const bp = sub(p, b), d3 = dot(ab, bp), d4 = dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) return norm(bp);
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); return norm(sub(p, [a[0] + v * ab[0], a[1] + v * ab[1], a[2] + v * ab[2]])); }
  const cp = sub(p, c), d5 = dot(ab, cp), d6 = dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) return norm(cp);
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); return norm(sub(p, [a[0] + w * ac[0], a[1] + w * ac[1], a[2] + w * ac[2]])); }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); return norm(sub(p, [b[0] + w * (c[0] - b[0]), b[1] + w * (c[1] - b[1]), b[2] + w * (c[2] - b[2])])); }
  const den = 1 / (va + vb + vc), v = vb * den, w = vc * den;
  return norm(sub(p, [a[0] + ab[0] * v + ac[0] * w, a[1] + ab[1] * v + ac[1] * w, a[2] + ab[2] * v + ac[2] * w]));
}
export function distance(s, p) {
  const n = triCount(s);
  let best = Infinity;
  for (let t = 0; t < n; t++) { const d = distTri(p, vert(s, t, 0), vert(s, t, 1), vert(s, t, 2)); if (d < best) best = d; }
  return best;
}

/** Signed volume of the closed surface (positive when the triangles are outward by the right-hand rule), in model units cubed. */
export function volume(s) {
  let v = 0;
  for (let t = 0; t < triCount(s); t++) v += dot(vert(s, t, 0), cross(vert(s, t, 1), vert(s, t, 2))) / 6;
  return v;
}

/** A file-safe name: letters, digits, underscore; starts with a letter; at most `max` characters. */
export function safeName(v, fallback = 'part', max = 32) {
  let s = String(v ?? '').normalize('NFKD').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, max);
  if (!s) s = fallback;
  if (!/^[A-Za-z]/.test(s)) s = ('p' + s).slice(0, max);
  return s;
}
