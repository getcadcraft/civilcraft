/* SPDX-License-Identifier: Apache-2.0 */
/**
 * worker.js — decodes one node and colours it, off the main thread (spec § 6). Two kinds of job:
 *   { id, bytes, scale, flagsDel, mode, ramp… }  the node's file bytes: decodeNode() here (the fast path, when the edit log is empty)
 *   { id, node: { n, pos, cls, rgb, inten }, mode, … }  a node the main thread already read with the edits applied
 * Answer: { id, n, pos Float32Array (relative to the cloud's origin), col Uint8Array (3 per point) } (buffers transferred).
 */
import { decodeNode } from './lib/octree.js';

// ASPRS colours (class → rgb); anything else grey
const CLASS_RGB = { 0: [150, 150, 150], 1: [170, 170, 170], 2: [160, 110, 60], 3: [120, 200, 90], 4: [50, 160, 60], 5: [10, 100, 40], 6: [220, 80, 70], 7: [230, 40, 200], 9: [60, 120, 230], 18: [255, 130, 0] };
const RAMP = [[0, 38, 84], [30, 130, 170], [90, 190, 120], [235, 215, 90], [200, 90, 50]];
function ramp(t) {
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const f = t * (RAMP.length - 1), i = Math.min(RAMP.length - 2, Math.floor(f)), u = f - i, a = RAMP[i], b = RAMP[i + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}
function diverge(t) {   // -1..1: blue - white - red
  t = t < -1 ? -1 : t > 1 ? 1 : t;
  return t < 0 ? [255 + 215 * t, 255 + 130 * t, 255 - 0 * t] : [255, 255 - 190 * t, 255 - 230 * t];
}

function colour(node, o) {
  const { n, pos, cls, rgb, inten } = node, col = new Uint8Array(3 * n), mode = o.mode;
  const z0 = o.zmin, zs = 1 / Math.max(o.zmax - o.zmin, 1e-9), g = o.grid;
  for (let k = 0; k < n; k++) {
    let c;
    if (mode === 'rgb' && rgb) c = [rgb[3 * k], rgb[3 * k + 1], rgb[3 * k + 2]];
    else if (mode === 'class') c = CLASS_RGB[cls ? cls[k] : 0] || [150, 150, 150];
    else if (mode === 'intensity' && inten) { const v = Math.min(1, Math.sqrt(inten[k] / o.imax)) * 255; c = [v, v, v]; }
    else if (mode === 'residual' && g) {
      const x = pos[3 * k] + o.ox, y = pos[3 * k + 1] + o.oy;
      const i = Math.floor((x - g.x0) / g.cell), j = Math.floor((y - g.y0) / g.cell);
      const r = i >= 0 && j >= 0 && i < g.nx && j < g.ny ? g.mean[j * g.nx + i] : NaN;
      c = r === r ? diverge(r / (2 * o.tol)) : [120, 120, 120];
    } else c = ramp((pos[3 * k + 2] + o.oz - z0) * zs);   // height (also the fallback when a colour plane is missing)
    col[3 * k] = c[0]; col[3 * k + 1] = c[1]; col[3 * k + 2] = c[2];
  }
  return col;
}

self.onmessage = (e) => {
  const m = e.data;
  try {
    let node;
    if (m.bytes) {
      const d = decodeNode(m.bytes), s = m.scale;
      let keep = 0; for (let k = 0; k < d.n; k++) if (!(d.flags[k] & 1)) keep++;
      const pos = new Float32Array(3 * keep), cls = new Uint8Array(keep), rgb = d.rgb ? new Uint8Array(3 * keep) : null, inten = d.inten ? new Uint16Array(keep) : null;
      let j = 0;
      for (let k = 0; k < d.n; k++) {
        if (d.flags[k] & 1) continue;
        pos[3 * j] = d.x[k] * s[0]; pos[3 * j + 1] = d.y[k] * s[1]; pos[3 * j + 2] = d.z[k] * s[2]; cls[j] = d.cls[k];
        if (rgb) { rgb[3 * j] = d.rgb[3 * k]; rgb[3 * j + 1] = d.rgb[3 * k + 1]; rgb[3 * j + 2] = d.rgb[3 * k + 2]; }
        if (inten) inten[j] = d.inten[k];
        j++;
      }
      node = { n: keep, pos, cls, rgb, inten };
    } else node = m.node;
    const col = colour(node, m);
    self.postMessage({ id: m.id, n: node.n, pos: node.pos, col }, [node.pos.buffer, col.buffer]);
  } catch (err) {
    self.postMessage({ id: m.id, error: String((err && err.code) || (err && err.message) || err) });
  }
};
