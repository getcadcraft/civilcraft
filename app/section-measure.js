/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section-measure.js — CV.3 (suggestion #1534): measuring in a cross section. Pure functions (no DOM), so tests run them under node.
 *
 *   sectionPoints(section) → [{ o, z, kind }]   every vertex a click can snap to: ground, design, the bottom surface, each component
 *       line's two ends, the corridor's marks (kind 'ground' | 'design' | 'bottom' | 'layer' | 'mark')
 *   snapSection(section, sx, sy, toScreen, px) → { o, z, kind } | null   the nearest vertex within px screen pixels (endpoint snap)
 *   measureSection(a, b) → { dh, dv, dist, slope }   horizontal and vertical distance (b − a), the straight distance and the slope
 *       (rise / run, a fraction; null for a vertical line)
 */

export function sectionPoints(s) {
  const out = [];
  const runs = (rs, kind) => { for (const r of rs || []) for (const q of r) if (Number.isFinite(q.z)) out.push({ o: q.o, z: q.z, kind }); };
  runs(s.ground, 'ground'); runs(s.design, 'design');
  if (s.basis && s.basis !== s.design) runs(s.basis, 'bottom');
  for (const L of s.layers || []) { out.push({ o: L.a.o, z: L.a.z, kind: 'layer' }, { o: L.b.o, z: L.b.z, kind: 'layer' }); }
  for (const m of s.marks || []) if (Number.isFinite(m.z)) out.push({ o: m.o, z: m.z, kind: 'mark' });
  return out;
}

const RANK = { mark: 0, layer: 1, bottom: 2, design: 3, ground: 4 };
export function snapSection(s, sx, sy, toScreen, px = 10) {
  let best = null, bd = px;
  for (const p of sectionPoints(s)) {
    const q = toScreen(p.o, p.z), d = Math.hypot(q.x - sx, q.y - sy);
    if (d < bd - 1e-9 || (best && Math.abs(d - bd) < 1e-9 && RANK[p.kind] < RANK[best.kind])) { bd = d; best = p; }
  }
  return best;
}

export function measureSection(a, b) {
  const dh = b.o - a.o, dv = b.z - a.z;
  return { dh, dv, dist: Math.hypot(dh, dv), slope: Math.abs(dh) > 1e-12 ? dv / dh : null };
}
