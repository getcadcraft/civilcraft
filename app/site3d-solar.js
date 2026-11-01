/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — geometry only. */
/**
 * site3d-solar.js — ground PV tables in the 3D view (0.8 EG.15, round 3 session civil_PART_3). One flat-shaded panel (two triangles, both faces) per table on its
 * own tilted plane, and a pile under each lower corner down to the ground. Owner = the array, so a click finds it. `list`: [{ id, name, plan }] from solar-ui arrays().
 *   solarMesh(B, list, L, ground?) → number of tables drawn
 */
const rgbOf = (hex) => { const v = parseInt(String(hex).replace('#', ''), 16) || 0; return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]; };
export const SOLAR_COLORS = { panel: '#1f3a6e', back: '#8d939c', pile: '#6b6f76' };
const MAX_TABLES_3D = 6000;

function tri(B, a, b, c, col, flip) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz); if (!(l > 1e-12)) return;
  if (flip) { nx = -nx; ny = -ny; nz = -nz; [b, c] = [c, b]; }
  const n = [nx / l, ny / l, nz / l];
  B.tri(B.vert(a, n, col), B.vert(b, n, col), B.vert(c, n, col));
}

export function solarMesh(B, list, L, groundAt = null) {
  const panel = rgbOf(SOLAR_COLORS.panel), back = rgbOf(SOLAR_COLORS.back), pile = rgbOf(SOLAR_COLORS.pile);
  let n = 0;
  for (const a of list || []) {
    B.owner({ kind: 'solar', id: a.id, name: a.name });
    for (const tb of a.plan.tables) {
      if (n >= MAX_TABLES_3D) return n;
      const [p0, p1, p2, p3] = tb.corners.map((c) => L(c[0], c[1], c[2]));
      // the plane faces up and toward the sun: its normal has the positive z component; the front is blue, the back grey
      tri(B, p0, p1, p2, panel, false); tri(B, p0, p2, p3, panel, false);
      tri(B, p0, p2, p1, back, false); tri(B, p0, p3, p2, back, false);
      // piles: a thin post under each lower corner, to the ground when it is known
      if (groundAt) for (const c of [tb.corners[0], tb.corners[1]]) {
        const z = groundAt(c[0], c[1]); if (!Number.isFinite(z) || c[2] - z < 1e-3) continue;
        const d = 0.08;   // half the post's width, in project units
        const a0 = L(c[0] - d, c[1], c[2]), a1 = L(c[0] + d, c[1], c[2]), b0 = L(c[0] - d, c[1], z), b1 = L(c[0] + d, c[1], z);
        tri(B, a0, b0, b1, pile, false); tri(B, a0, b1, a1, pile, false); tri(B, a0, b1, b0, pile, false); tri(B, a0, a1, b1, pile, false);
      }
      n++;
    }
  }
  return n;
}
