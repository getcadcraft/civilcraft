/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a developer error */
/**
 * raycast-job.js — pool job: camera rays for one tile through the shared scene BVH (0.7 CU.8 bench; the worker plumbing CU.5's
 * CPU kernel uses the same way: the scene shared once with pool.share(), tiles as jobs). Nothing is shaded here: it measures
 * traversal, the part of a path tracer the CPU spends most of its time in.
 *
 *   castTile({ x0, y0, tw, th, W, H, world, proj, spp, seed }, ctx) → { rays, hits, sumT }
 *     shared: 'bvh.nodes' (Uint32Array), 'bvh.tris' (Float32Array), 'bvh.inst' (Float32Array), 'bvh.meta' (Uint32Array)
 *     — bvh-scene.js sceneBuffers(scene). Jitter per sample from a per-pixel hash of (x, y, sample, seed): deterministic.
 */
import { sceneView, sceneHit } from './bvh-scene.js';

let cached = null, cachedNodes = null;
const out = { t: 0, slot: -1, mesh: -1, tri: -1, inst: -1, u: 0, v: 0 };

function hash(a, b, c, d) {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be59b, 0xc2b2ae35) ^ Math.imul(c + 0x27d4eb2f, 0x165667b1) ^ d;
  h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function castTile({ x0, y0, tw, th, W, H, world, proj, spp = 1, seed = 0 }, ctx) {
  const nodes = ctx.shared['bvh.nodes'];
  if (!nodes) throw new Error('raycast: no scene shared');
  if (cachedNodes !== nodes) { cached = sceneView({ nodes, tris: ctx.shared['bvh.tris'], inst: ctx.shared['bvh.inst'], meta: ctx.shared['bvh.meta'] }); cachedNodes = nodes; }
  const o = [world[12], world[13], world[14]], d = [0, 0, 0];
  let rays = 0, hits = 0, sumT = 0;
  for (let y = y0; y < y0 + th; y++) {
    if ((y & 7) === 0 && ctx.cancelled()) break;
    for (let x = x0; x < x0 + tw; x++) for (let s = 0; s < spp; s++) {
      const jx = hash(x, y, s, seed), jy = hash(y, x, s, seed + 1);
      const nx = ((2 * (x + jx)) / W - 1) / proj[0], ny = (1 - (2 * (y + jy)) / H) / proj[5];
      d[0] = world[0] * nx + world[4] * ny - world[8]; d[1] = world[1] * nx + world[5] * ny - world[9]; d[2] = world[2] * nx + world[6] * ny - world[10];
      const l = Math.hypot(d[0], d[1], d[2]); d[0] /= l; d[1] /= l; d[2] /= l;
      rays++;
      const h = sceneHit(cached, o, d, Infinity, out);
      if (h) { hits++; sumT += h.t; }
    }
  }
  return { rays, hits, sumT };
}
