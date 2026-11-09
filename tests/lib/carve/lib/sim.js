/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sim.js — a height-field simulator (lib/carve): cut toolpaths into a block and read back what is left. DOM-free. Millimetres, z = 0 the top.
 *   makeSim({ x0, y0, x1, y1, res }) → S = { w, h, x0, y0, res, z: Float32Array }   (z[k] = the height of cell k, 0 untouched)
 *   cutPaths(S, paths, tool)    tool = { type: 'v', angle } | { type: 'flat', dia } | { type: 'ball', dia }
 *   toolHeight(tool, rho)       how high the tool's surface is above its tip at radius rho (Infinity beyond its radius)
 * Each path is sampled every half cell and the tool stamped there (the tip's z, the profile above it); a cell keeps the lowest it has been cut to.
 * It models the cutter's shape only (no deflection, chip load or machine limits), which is what the tests need and the panel's preview shows.
 */
export function toolHeight(tool, rho) {
  if (tool.type === 'v') return rho / Math.tan((tool.angle * Math.PI) / 360);
  const r = tool.dia / 2;
  if (rho > r) return Infinity;
  return tool.type === 'ball' ? r - Math.sqrt(Math.max(0, r * r - rho * rho)) : 0;
}
export function makeSim({ x0, y0, x1, y1, res }) {
  const w = Math.ceil((x1 - x0) / res) + 1, h = Math.ceil((y1 - y0) / res) + 1;
  return { w, h, x0, y0, res, z: new Float32Array(w * h) };
}
export function cutPaths(S, paths, tool) {
  const { w, h, x0, y0, res, z } = S;
  const reach = tool.type === 'v' ? Infinity : tool.dia / 2;
  const tan = tool.type === 'v' ? Math.tan((tool.angle * Math.PI) / 360) : 0;
  const stamp = (px, py, pz) => {
    const R = tool.type === 'v' ? Math.max(0, -pz) * tan : reach;   // a V-bit reaches the surface at -z tan(half-angle)
    if (!(R > 0) && tool.type !== 'v') return;
    const i0 = Math.max(0, Math.floor((px - R - x0) / res)), i1 = Math.min(w - 1, Math.ceil((px + R - x0) / res));
    const j0 = Math.max(0, Math.floor((py - R - y0) / res)), j1 = Math.min(h - 1, Math.ceil((py + R - y0) / res));
    for (let j = j0; j <= j1; j++) {
      const cy = y0 + j * res - py;
      for (let i = i0; i <= i1; i++) {
        const cx = x0 + i * res - px, rho = Math.hypot(cx, cy);
        const v = pz + toolHeight(tool, rho);
        if (v < z[j * w + i]) z[j * w + i] = v;
      }
    }
  };
  for (const p of paths) {
    if (p.length === 1) { stamp(p[0][0], p[0][1], p[0][2]); continue; }
    for (let k = 1; k < p.length; k++) {
      const a = p[k - 1], b = p[k], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]), n = Math.max(1, Math.ceil(L / (res * 0.5)));
      for (let s = k === 1 ? 0 : 1; s <= n; s++) { const t = s / n; stamp(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t); }
    }
  }
}

/** Cut every op of a plan into a fresh block: simulate(ops, { x0, y0, x1, y1, res }) → S (the panel's preview and the tests read S.z). */
export function simulate(ops, box) {
  const S = makeSim(box);
  for (const op of ops) cutPaths(S, op.paths, op.tool);
  return S;
}
