/* SPDX-License-Identifier: Apache-2.0 */
/**
 * voxel.js — masses (plan polygons with a base level and a height, in metres) turned into solid cells for the flow solver (0.9 SU.1119 wind; DOM-free, Apache-2.0).
 *   voxelise({ masses: [{ pts: [{x,y}], z0, height }], dx, frame: { cx, cy, ex, ey, x0, y0 }, nx, ny, nz, ground }) → Uint8Array(nx*ny*nz)
 *     The grid is in the FLOW frame: its X axis points the way the wind blows (unit vector (ex, ey) in plan), Y is 90 degrees to the left, origin (x0, y0) is the corner in
 *     that frame about the centre (cx, cy). A cell is solid when its centre is inside a mass footprint and below its top, measured from `ground` (a flat ground at the
 *     lowest mass level). Cells are cubes of side dx. Ground is not a solid: the solver gives it a wall or a wall function.
 *   pointInPoly(px, py, pts) · flowFrame(deg) → { ex, ey, fx, fy }   (deg = direction the wind blows FROM, clockwise from north; x east, y north)
 */
export function pointInPoly(px, py, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > py) !== (b.y > py) && px < ((b.x - a.x) * (py - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
export function flowFrame(deg) {
  const r = (deg * Math.PI) / 180, ex = -Math.sin(r), ey = -Math.cos(r);   // blowing vector
  return { ex, ey, fx: -ey, fy: ex };                                      // Y = 90 deg left of the flow
}
export function voxelise({ masses, dx, frame, nx, ny, nz, ground }) {
  const solid = new Uint8Array(nx * ny * nz), { cx, cy, ex, ey, x0, y0 } = frame, fx = -ey, fy = ex;
  for (const m of masses) {
    const top = m.z0 + m.height;
    let X0 = Infinity, X1 = -Infinity, Y0 = Infinity, Y1 = -Infinity;
    for (const p of m.pts) { const X = (p.x - cx) * ex + (p.y - cy) * ey, Y = (p.x - cx) * fx + (p.y - cy) * fy; X0 = Math.min(X0, X); X1 = Math.max(X1, X); Y0 = Math.min(Y0, Y); Y1 = Math.max(Y1, Y); }
    const ia = Math.max(0, Math.floor((X0 - x0) / dx)), ib = Math.min(nx - 1, Math.ceil((X1 - x0) / dx));
    const ja = Math.max(0, Math.floor((Y0 - y0) / dx)), jb = Math.min(ny - 1, Math.ceil((Y1 - y0) / dx));
    const kb = Math.min(nz - 1, Math.floor((top - ground) / dx - 0.5));
    for (let j = ja; j <= jb; j++) for (let i = ia; i <= ib; i++) {
      const X = x0 + (i + 0.5) * dx, Y = y0 + (j + 0.5) * dx, wx = cx + X * ex + Y * fx, wy = cy + X * ey + Y * fy;
      if (!pointInPoly(wx, wy, m.pts)) continue;
      for (let k = 0; k <= kb; k++) solid[i + nx * (j + ny * k)] = 1;
    }
  }
  return solid;
}
