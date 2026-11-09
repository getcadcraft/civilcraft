/* SPDX-License-Identifier: Apache-2.0 */
/**
 * contour.js — marching squares over a scalar grid (lib/carve). DOM-free.
 *   contours(values, w, h, level, { x0, y0, res }) → [{ pts: [[x, y]…], closed }]
 * `values` is row-major w × h, a node at each cell centre (x0 + (i + 0.5) res, y0 + (j + 0.5) res); the level line has the values ≥ level on
 * its inside. Crossings are linearly interpolated, a saddle is decided by the mean of its corners, loops are closed whenever the field is below
 * the level all round the grid's edge (the fields in lib/carve are padded so that it is).
 */
export function contours(values, w, h, level, { x0 = 0, y0 = 0, res = 1 } = {}) {
  const segs = [];   // [edgeA, edgeB]
  const H = (i, j) => 2 * (j * w + i), V = (i, j) => 2 * (j * w + i) + 1;   // an edge's id: horizontal (i, j)-(i+1, j), vertical (i, j)-(i, j+1)
  for (let j = 0; j < h - 1; j++) {
    for (let i = 0; i < w - 1; i++) {
      const a = values[j * w + i], b = values[j * w + i + 1], c = values[(j + 1) * w + i + 1], d = values[(j + 1) * w + i];
      const code = (a >= level ? 1 : 0) | (b >= level ? 2 : 0) | (c >= level ? 4 : 0) | (d >= level ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const B = H(i, j), T = H(i, j + 1), L = V(i, j), R = V(i + 1, j);
      switch (code) {
        case 1: case 14: segs.push([L, B]); break;
        case 2: case 13: segs.push([B, R]); break;
        case 3: case 12: segs.push([L, R]); break;
        case 4: case 11: segs.push([R, T]); break;
        case 6: case 9: segs.push([B, T]); break;
        case 7: case 8: segs.push([L, T]); break;
        case 5: { const m = (a + b + c + d) / 4 >= level; if (m) segs.push([L, T], [B, R]); else segs.push([L, B], [R, T]); break; }
        case 10: { const m = (a + b + c + d) / 4 >= level; if (m) segs.push([L, B], [R, T]); else segs.push([B, R], [L, T]); break; }
        default: break;
      }
    }
  }
  const at = (id) => {   // the crossing on an edge
    const horizontal = (id & 1) === 0, cell = id >> 1, i = cell % w, j = (cell - i) / w;
    const va = values[cell], vb = horizontal ? values[cell + 1] : values[cell + w];
    const t = va === vb ? 0.5 : Math.max(0, Math.min(1, (level - va) / (vb - va)));
    return horizontal ? [x0 + (i + 0.5 + t) * res, y0 + (j + 0.5) * res] : [x0 + (i + 0.5) * res, y0 + (j + 0.5 + t) * res];
  };
  const byEdge = new Map();
  segs.forEach((s, k) => { for (const e of s) { const l = byEdge.get(e); if (l) l.push(k); else byEdge.set(e, [k]); } });
  const used = new Uint8Array(segs.length), out = [];
  for (let k = 0; k < segs.length; k++) {
    if (used[k]) continue;
    used[k] = 1;
    const ids = [segs[k][0], segs[k][1]];
    for (let dir = 0; dir < 2; dir++) {   // grow from the end, then from the start
      for (;;) {
        const tip = dir === 0 ? ids[ids.length - 1] : ids[0];
        const nxt = (byEdge.get(tip) || []).find((q) => !used[q]);
        if (nxt === undefined) break;
        used[nxt] = 1;
        const o = segs[nxt][0] === tip ? segs[nxt][1] : segs[nxt][0];
        if (dir === 0) ids.push(o); else ids.unshift(o);
      }
    }
    const closed = ids.length > 2 && ids[0] === ids[ids.length - 1];
    if (closed) ids.pop();
    out.push({ pts: ids.map(at), closed });
  }
  return out;
}
