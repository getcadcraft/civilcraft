/* SPDX-License-Identifier: Apache-2.0 */
/**
 * surface3d.js — the 3D lux surface (isolines.js luxSurface) as a picture the panel can draw on a plain 2D canvas (0.11 IL.7, session `light-finish-11`). DOM-free.
 * No WebGL, so it works in every host (CadCraft has no 3D view): an orthographic view turned by `yaw` about the vertical and tilted by `pitch` (0 = from the side,
 * 90 = from above), triangles drawn back to front (painter's order), each with the mean colour of its three corners and a little shade from its slope.
 *
 *   projectSurface(surface, { yaw, pitch, w, h, pad, outline, marks, posts }) → { tris: [{ p: [[x, y] × 3], rgb: [r, g, b] 0..255, depth }], outline: [[x, y]], marks: [[x, y]], posts: [[[x, y], [x, y]]], scale }
 *     surface = luxSurface(...) (positions mm, colours 0..1, indices); outline = the room polygon (mm, drawn at height 0); marks = luminaire plan points [[x, y]] (drawn at height 0);
 *     posts = [[x, y, z]] points of the surface each given a vertical line down to height 0 (so a raised surface reads as standing over the room)
 *     screen y grows downwards (canvas); `tris` is sorted far to near.
 */
const rad = (d) => d * Math.PI / 180;

export function projectSurface(s, { yaw = 30, pitch = 35, w = 420, h = 260, pad = 12, outline = null, marks = null, posts = null } = {}) {
  const P = s.positions, n = P.length / 3;
  if (!n) return { tris: [], outline: [], marks: [], posts: [], scale: 0 };
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const pts2 = [...(outline || [])];
  for (let i = 0; i < n; i++) { x0 = Math.min(x0, P[3 * i]); x1 = Math.max(x1, P[3 * i]); y0 = Math.min(y0, P[3 * i + 1]); y1 = Math.max(y1, P[3 * i + 1]); }
  for (const q of pts2) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cy_ = Math.cos(rad(yaw)), sy = Math.sin(rad(yaw)), cp = Math.cos(rad(pitch)), sp = Math.sin(rad(pitch));
  /** (x, y, z) mm → [screen right, screen up, depth (bigger = farther)] before fitting */
  const view = (x, y, z) => { const a = x - cx, b = y - cy, xr = a * cy_ - b * sy, yr = a * sy + b * cy_; return [xr, yr * sp + z * cp, yr * cp - z * sp]; };
  const V = new Array(n);
  let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
  const grow = (q) => { u0 = Math.min(u0, q[0]); u1 = Math.max(u1, q[0]); v0 = Math.min(v0, q[1]); v1 = Math.max(v1, q[1]); };
  for (let i = 0; i < n; i++) { V[i] = view(P[3 * i], P[3 * i + 1], P[3 * i + 2]); grow(V[i]); }
  const O = (outline || []).map((q) => view(q[0], q[1], 0)), M = (marks || []).map((q) => view(q[0], q[1], 0));
  const T = (posts || []).map((q) => [view(q[0], q[1], q[2]), view(q[0], q[1], 0)]);
  O.forEach(grow); M.forEach(grow); T.forEach((pq) => pq.forEach(grow));
  const k = Math.min((w - 2 * pad) / Math.max(u1 - u0, 1e-9), (h - 2 * pad) / Math.max(v1 - v0, 1e-9));
  const ox = (w - (u1 - u0) * k) / 2, oy = (h - (v1 - v0) * k) / 2;
  const fit = (q) => [ox + (q[0] - u0) * k, h - (oy + (q[1] - v0) * k)];
  const I = s.indices, C = s.colours, tris = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t], b = I[t + 1], c = I[t + 2];
    // shade: the triangle's normal against a light from above and behind the viewer (steep faces a little darker)
    const ax = P[3 * b] - P[3 * a], ay = P[3 * b + 1] - P[3 * a + 1], az = P[3 * b + 2] - P[3 * a + 2], bx = P[3 * c] - P[3 * a], by = P[3 * c + 1] - P[3 * a + 1], bz = P[3 * c + 2] - P[3 * a + 2];
    const nx = ay * bz - az * by, ny = az * bx - ax * bz, nz = ax * by - ay * bx, len = Math.hypot(nx, ny, nz) || 1, shade = 0.72 + 0.28 * Math.abs(nz / len);
    const rgb = [0, 1, 2].map((j) => Math.round(255 * Math.min(1, shade * (C[3 * a + j] + C[3 * b + j] + C[3 * c + j]) / 3)));
    tris.push({ p: [fit(V[a]), fit(V[b]), fit(V[c])], rgb, depth: (V[a][2] + V[b][2] + V[c][2]) / 3 });
  }
  tris.sort((p, q) => q.depth - p.depth);
  return { tris, outline: O.map(fit), marks: M.map(fit), posts: T.map((pq) => pq.map(fit)), scale: k };
}
