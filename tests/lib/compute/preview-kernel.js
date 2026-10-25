/* SPDX-License-Identifier: Apache-2.0 */
/**
 * preview-kernel.js — a tiny CPU kernel for cpu-render.js (0.7 CU.5): "clay" shading lit from the eye (albedo · |n·d|) over the
 * shared scene BVH, sky colour for misses. It is not RENDER-SPEC's path tracer (render's JS reference is the oracle); it exists
 * to test and time the plumbing (tiles, passes, stop/resume, determinism) on any machine, and as a fallback preview.
 *   renderTile({ x0, y0, tw, th, sample0, spp, W, H, world, proj, sky = [0.6, 0.7, 0.85] }, ctx) → Float32Array (tw·th·4)
 *   shared: 'bvh.nodes', 'bvh.tris', 'bvh.inst', 'bvh.meta' (bvh-scene.js sceneBuffers)
 */
import { sceneView, sceneHit } from './bvh-scene.js';

let cached = null, cachedNodes = null;
const hit = { t: 0, slot: -1, mesh: -1, tri: -1, inst: -1, instSlot: -1, u: 0, v: 0 };

function hash(a, b, c) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be59b, 0xc2b2ae35) ^ Math.imul(c + 0x27d4eb2f, 0x165667b1);
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function renderTile({ x0, y0, tw, th, sample0, spp, W, H, world, proj, sky = [0.6, 0.7, 0.85] }, ctx) {
  const nodes = ctx.shared['bvh.nodes'];
  if (cachedNodes !== nodes) { cached = sceneView({ nodes, tris: ctx.shared['bvh.tris'], inst: ctx.shared['bvh.inst'], meta: ctx.shared['bvh.meta'] }); cachedNodes = nodes; }
  const out = new Float32Array(tw * th * 4);
  const o = [world[12], world[13], world[14]], d = [0, 0, 0];
  const T = cached.tris, I = cached.inst;
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const px = x0 + x, py = y0 + y, k = (y * tw + x) * 4;
    for (let s = sample0; s < sample0 + spp; s++) {
      const jx = hash(px, py, s * 2), jy = hash(py, px, s * 2 + 1);
      const nx = ((2 * (px + jx)) / W - 1) / proj[0], ny = (1 - (2 * (py + jy)) / H) / proj[5];
      d[0] = world[0] * nx + world[4] * ny - world[8]; d[1] = world[1] * nx + world[5] * ny - world[9]; d[2] = world[2] * nx + world[6] * ny - world[10];
      const l = Math.hypot(d[0], d[1], d[2]); d[0] /= l; d[1] /= l; d[2] /= l;
      const h = sceneHit(cached, o, d, Infinity, hit);
      if (!h) { out[k] += sky[0]; out[k + 1] += sky[1]; out[k + 2] += sky[2]; out[k + 3] += 1; continue; }
      // geometric normal (object space), into world space through the instance rows when instanced
      const q = h.slot * 12;
      let n0 = T[q + 5] * T[q + 10] - T[q + 6] * T[q + 9], n1 = T[q + 6] * T[q + 8] - T[q + 4] * T[q + 10], n2 = T[q + 4] * T[q + 9] - T[q + 5] * T[q + 8];
      if (I && hit.instSlot >= 0) {
        // world normal = rowsᵀ · n (rows = world → object)
        const b = hit.instSlot * 16;
        const a0 = I[b] * n0 + I[b + 4] * n1 + I[b + 8] * n2, a1 = I[b + 1] * n0 + I[b + 5] * n1 + I[b + 9] * n2, a2 = I[b + 2] * n0 + I[b + 6] * n1 + I[b + 10] * n2;
        n0 = a0; n1 = a1; n2 = a2;
      }
      const nl = Math.hypot(n0, n1, n2) || 1;
      const c = Math.abs(n0 * d[0] + n1 * d[1] + n2 * d[2]) / nl;
      const v = 0.08 + 0.72 * c;
      out[k] += v; out[k + 1] += v; out[k + 2] += v; out[k + 3] += 1;
    }
  }
  return out;
}
