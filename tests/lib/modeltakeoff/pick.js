/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: geometry only; no words. */
/**
 * pick.js: which element a ray from the 3D view hits (0.11 MT.3). DOM-free, so the answer is tested in Node with shapes whose hits are known by hand.
 *
 *   pickElement(elements, origin [x, y, z], dir [x, y, z], { skip(e) → bool }) → { id, t, point: [x, y, z] } | null   the nearest element hit
 *     elements: read.js elements (bbox, mesh { v: x y z nx ny nz per vertex, i }); an element with no mesh is not hit; skip() leaves out what is hidden.
 *   rayBox(origin, dir, box) → distance | null     slab test, the quick reject before an element's triangles
 *   rayTriangle(origin, dir, a, b, c) → distance | null     Möller–Trumbore, both faces (a mirrored placement flips winding)
 */

export function rayBox(o, d, b) {
  let t0 = 0, t1 = Infinity;
  for (let k = 0; k < 3; k++) {
    const lo = b[k], hi = b[k + 3];
    if (Math.abs(d[k]) < 1e-12) { if (o[k] < lo || o[k] > hi) return null; continue; }
    let a = (lo - o[k]) / d[k], c = (hi - o[k]) / d[k];
    if (a > c) { const x = a; a = c; c = x; }
    if (a > t0) t0 = a;
    if (c < t1) t1 = c;
    if (t0 > t1) return null;
  }
  return t0;
}

export function rayTriangle(o, d, a, b, c) {
  const e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
  const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (Math.abs(det) < 1e-14) return null;
  const inv = 1 / det, tx = o[0] - a[0], ty = o[1] - a[1], tz = o[2] - a[2];
  const u = (tx * px + ty * py + tz * pz) * inv;
  if (u < 0 || u > 1) return null;
  const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x;
  const v = (d[0] * qx + d[1] * qy + d[2] * qz) * inv;
  if (v < 0 || u + v > 1) return null;
  const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
  return t > 1e-9 ? t : null;
}

export function pickElement(elements, o, d, { skip = null } = {}) {
  let best = null;
  const A = [0, 0, 0], B = [0, 0, 0], C = [0, 0, 0];
  for (const e of elements) {
    if (!e.mesh || !e.bbox || (skip && skip(e))) continue;
    const tb = rayBox(o, d, e.bbox);
    if (tb === null || (best && tb > best.t)) continue;
    const { v, i } = e.mesh;
    for (let k = 0; k < i.length; k += 3) {
      const a = i[k] * 6, b = i[k + 1] * 6, c = i[k + 2] * 6;
      A[0] = v[a]; A[1] = v[a + 1]; A[2] = v[a + 2]; B[0] = v[b]; B[1] = v[b + 1]; B[2] = v[b + 2]; C[0] = v[c]; C[1] = v[c + 1]; C[2] = v[c + 2];
      const t = rayTriangle(o, d, A, B, C);
      if (t !== null && (!best || t < best.t)) best = { id: e.id, t };
    }
  }
  if (best) best.point = [o[0] + d[0] * best.t, o[1] + d[1] * best.t, o[2] + d[2] * best.t];
  return best;
}
