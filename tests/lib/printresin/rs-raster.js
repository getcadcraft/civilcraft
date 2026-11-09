/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-raster.js — a layer's outlines to the picture the screen shows (roadmap RSN.1). No DOM, imports nothing.
 *
 *   rasterize(rings, w, h, { sub }) → Uint8Array(w * h)
 *     rings: [[x, y] …] lists in PIXEL units (x to the right, y down, a pixel is the square [i, i+1) × [j, j+1)). Filled by the non-zero winding rule, so
 *     an outer ring turning one way and a hole turning the other leave the hole dark, and an extra ring on top of a filled one changes nothing.
 *     Edges are anti-aliased: `sub` sub-scanlines a row (default 4), exact horizontal coverage on each, so an edge on a pixel border gives 0 or 255
 *     and one through the middle of a pixel gives about 128. 255 = full light. The answer carries `.span` = [first row, one past the last] that can be lit.
 */
export function rasterize(rings, w, h, { sub = 4, into = null } = {}) {
  let out = into;   // `into`: the buffer a last call returned, wiped here only where it was lit; saves allocating and clearing w * h bytes a layer
  if (out && out.length === w * h) { if (out.span) out.fill(0, Math.max(0, out.span[0]) * w, Math.min(h, out.span[1]) * w); } else out = new Uint8Array(w * h);
  const edges = [];
  for (const ring of rings) {
    const n = ring.length;
    if (n < 3) continue;
    for (let i = 0; i < n; i++) {
      const a = ring[i], b = ring[(i + 1) % n];
      if (a[1] === b[1]) continue;
      const up = a[1] < b[1];
      const p = up ? a : b, q = up ? b : a;   // p is the upper end (smaller y)
      edges.push({ y0: p[1], y1: q[1], x0: p[0], dx: (q[0] - p[0]) / (q[1] - p[1]), dir: up ? 1 : -1 });
    }
  }
  if (!edges.length) { out.span = [0, 0]; return out; }
  edges.sort((a, b) => a.y0 - b.y0);
  let top = Infinity, bottom = -Infinity;
  for (const e of edges) { if (e.y0 < top) top = e.y0; if (e.y1 > bottom) bottom = e.y1; }
  const rowA = Math.max(0, Math.floor(top)), rowB = Math.min(h - 1, Math.floor(bottom));
  const acc = new Float32Array(w + 2), diff = new Float32Array(w + 2);
  out.span = [rowA, rowB + 1];
  const w1 = 1 / sub;
  let next = 0, active = [];
  const xs = [];
  for (let r = rowA; r <= rowB; r++) {
    let any = false, lo = w, hi = 0;   // lo..hi: the pixels this row touched; the rest stay dark and are never read or cleared
    for (let k = 0; k < sub; k++) {
      const y = r + (k + 0.5) * w1;
      while (next < edges.length && edges[next].y0 <= y) active.push(edges[next++]);
      if (!active.length) continue;
      active = active.filter((e) => e.y1 > y);
      xs.length = 0;
      for (const e of active) xs.push([e.x0 + (y - e.y0) * e.dx, e.dir]);
      if (xs.length < 2) continue;
      xs.sort((a, b) => a[0] - b[0]);
      let wind = 0;
      for (let i = 0; i < xs.length - 1; i++) {
        wind += xs[i][1];
        if (wind === 0) continue;
        const xa = Math.min(w, Math.max(0, xs[i][0])), xb = Math.min(w, Math.max(0, xs[i + 1][0]));
        if (xb <= xa) continue;
        any = true;
        const ia = Math.floor(xa), ib = Math.floor(xb);
        if (ia < lo) lo = ia; if (ib > hi) hi = ib;
        if (ia === ib) acc[ia] += (xb - xa) * w1;
        else {
          acc[ia] += (ia + 1 - xa) * w1;
          diff[ia + 1] += w1; diff[ib] -= w1;
          acc[ib] += (xb - ib) * w1;
        }
      }
    }
    if (!any) continue;
    let run = 0;
    const base = r * w, end = Math.min(w - 1, hi + 1);
    for (let i = lo; i <= end; i++) {
      run += diff[i];
      const v = acc[i] + run;
      out[base + i] = v >= 0.9995 ? 255 : v <= 0 ? 0 : Math.round(v * 255);
      acc[i] = 0; diff[i] = 0;
    }
    for (let i = end + 1; i <= Math.min(w + 1, hi + 2); i++) { acc[i] = 0; diff[i] = 0; }
  }
  return out;
}
