/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — geometry only. */
/**
 * site3d-pit.js — the open pits in the 3D view (0.8 EG.27, civil_PART_4): the pit cut into the ground (a surface, drawn with the ground's own mesh), each bench's rim as
 * a line, and the haul ramp as a road-wide ribbon on the walls. `list`: [{ id, name, road: { pts [[x,y,z]], width } | null, benches: [{ z, loops: [[[x,y]…]] }] }] in project units.
 *   pitMesh(B, list, L) → number of ribbons drawn           (ramp ribbons into the mesh builder B; owner kind 'pit')
 *   pitLines(list, L) → Float32Array of segment pairs        (bench rims)
 */
const RAMP = [0.85, 0.45, 0.1];
export const PIT_COLORS = { ramp: '#d9730d', bench: '#4a3b2a' };

export function pitMesh(B, list, L) {
  let n = 0;
  for (const pit of list || []) {
    const r = pit.road; if (!r || r.pts.length < 2) continue;
    B.owner({ kind: 'pit', id: pit.id, name: pit.name });
    const h = (r.width || 0) / 2; if (!(h > 0)) continue;
    const side = r.pts.map((p, i) => { const a = r.pts[Math.max(0, i - 1)], b = r.pts[Math.min(r.pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [-dy / l * h, dx / l * h]; });
    for (let i = 0; i + 1 < r.pts.length; i++) {
      const a = r.pts[i], b = r.pts[i + 1], sa = side[i], sb = side[i + 1], lift = 0.02 * (r.width || 1);
      const q = [L(a[0] + sa[0], a[1] + sa[1], a[2] + lift), L(a[0] - sa[0], a[1] - sa[1], a[2] + lift), L(b[0] - sb[0], b[1] - sb[1], b[2] + lift), L(b[0] + sb[0], b[1] + sb[1], b[2] + lift)];
      const v = q.map((p) => B.vert(p, [0, 0, 1], RAMP));
      B.tri(v[0], v[1], v[2]); B.tri(v[0], v[2], v[3]); B.tri(v[0], v[2], v[1]); B.tri(v[0], v[3], v[2]);
    }
    n++;
  }
  return n;
}

export function pitLines(list, L) {
  const out = [];
  for (const pit of list || []) for (const b of pit.benches || []) for (const loop of b.loops) for (let i = 0; i < loop.length; i++) {
    const p = loop[i], q = loop[(i + 1) % loop.length]; out.push(...L(p[0], p[1], b.z), ...L(q[0], q[1], b.z));
  }
  return new Float32Array(out);
}
