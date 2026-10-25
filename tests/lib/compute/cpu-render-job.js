/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a developer error */
/**
 * cpu-render-job.js — pool job behind cpu-render.js (0.7 CU.5): runs a kernel module's renderTile on several tiles and returns
 * them packed in order. The kernel module is imported once per worker (pool-worker.js keeps only same-origin modules; this
 * file imports what cpu-render.js named, which the page's own code chose).
 *   runTiles({ kernel, fn, tiles: [x0, y0, tw, th, …], sample0, spp, W, H, params }, ctx) → { data: Float32Array }
 */
const kernels = new Map();

export async function runTiles({ kernel, fn = 'renderTile', tiles, sample0, spp, W, H, params = {} }, ctx) {
  let p = kernels.get(kernel);
  if (!p) { p = import(kernel); kernels.set(kernel, p); p.catch(() => kernels.delete(kernel)); }
  const mod = await p;
  if (typeof mod[fn] !== 'function') throw new Error(fn + ' is not a function of the kernel module');
  let total = 0;
  for (let i = 0; i < tiles.length; i += 4) total += tiles[i + 2] * tiles[i + 3] * 4;
  const data = new Float32Array(total);
  let off = 0;
  for (let i = 0; i < tiles.length; i += 4) {
    if (ctx.cancelled()) break;
    const part = await mod[fn]({ x0: tiles[i], y0: tiles[i + 1], tw: tiles[i + 2], th: tiles[i + 3], sample0, spp, W, H, ...params }, ctx);
    data.set(part, off);
    off += part.length;
  }
  return { data };
}
