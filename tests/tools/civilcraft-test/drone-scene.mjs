// SPDX-License-Identifier: Apache-2.0
// The made-up drone survey used by SU.935's tests: a smooth terrain with buildings, tree canopies and stray low points,
// all points unclassified (class 0). Shared by make-drone-cloud.mjs (writes the LAS once) and bin/test-civilcraft-ground.mjs.
export const SIZE = 300, X0 = 500000, Y0 = 4000000;
export const terrainZ = (x, y) => { const u = x - X0, v = y - Y0; return 100 + 0.06 * u + 4 * Math.sin(u / 40) * Math.cos(v / 55); };
export const BUILDINGS = [   // [u, v, width, depth, height] from the corner
  [40, 50, 24, 18, 8], [120, 200, 30, 20, 10], [210, 90, 16, 16, 6], [60, 230, 12, 12, 7], [230, 230, 20, 14, 9]];
export function trees() {
  const r = rng(7), out = [];
  while (out.length < 70) {
    const u = 10 + r() * (SIZE - 20), v = 10 + r() * (SIZE - 20);
    if (BUILDINGS.some(([bu, bv, w, d]) => u > bu - 8 && u < bu + w + 8 && v > bv - 8 && v < bv + d + 8)) continue;
    out.push([u, v, 2.5 + r() * 2, 5 + r() * 5]);   // u, v, canopy radius, canopy height above the ground
  }
  return out;
}
export function rng(seed) { let s = seed >>> 0; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
/** What stands at (u, v): 'building' | 'tree' | null, and how high above the ground. */
export function standing(u, v, T = trees()) {
  for (const [bu, bv, w, d, h] of BUILDINGS) if (u >= bu && u <= bu + w && v >= bv && v <= bv + d) return { kind: 'building', h };
  for (const [tu, tv, r, h] of T) if (Math.hypot(u - tu, v - tv) <= r) return { kind: 'tree', h };
  return null;
}
