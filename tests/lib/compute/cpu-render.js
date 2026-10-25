/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a developer error */
/**
 * cpu-render.js — progressive rendering on every CPU core (0.7 CU.5's worker plumbing): the scene is shared with the pool
 * once, each pass renders every tile at the next sample indices through the scheduler (tiles go to whichever worker is free,
 * a failed tile is redone elsewhere), and the pass is added to one accumulation buffer in tile order, so the picture is the
 * same bytes whatever the worker count. Stop keeps the picture so far; resume continues the sample sequence (RENDER-SPEC § 7).
 * The kernel is any job module exporting `renderTile({x0, y0, tw, th, sample0, spp, W, H, …params}, ctx) → Float32Array
 * (tw·th·4: Σr, Σg, Σb, n)` that reads the scene from ctx.shared — render's JS reference (the JS twin) now, cc-trace-rs
 * (WebAssembly, one instance per worker) when RS.2 lands. DOM-free.
 *
 *   const r = createCpuRender({ pool, kernel: { url, fn = 'renderTile' }, W, H, tile = 32, params = {} })
 *   await r.share({ name: typedArray, … })          the scene buffers, once (pool.share)
 *   await r.pass({ spp = 1, signal, onTile }) → { samples, ms }   one more pass over every pixel
 *   await r.renderRange(s0, spp, { signal }) → Float32Array (W·H·4)   samples s0 … s0+spp of every pixel, NOT added to accum
 *                                    (hybrid.js gives each device its own sample range of a frame)
 *   await r.run({ passes, spp, signal, onPass(accum, samples) }) → { samples, ms, stopped }
 *   r.accum (Float32Array W·H·4) · r.samples · r.reset() · r.release() (unshare)
 *   r.image(out?) → Float32Array W·H·3 (Σ / n: linear radiance)
 */
import { createScheduler } from './sched.js';

const JOB = new URL('./cpu-render-job.js', import.meta.url).href;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

export function createCpuRender({ pool, kernel, W, H, tile = 32, params = {} }) {
  if (!pool || !kernel?.url) throw new Error('cpu-render: a pool and a kernel module are needed');
  const tw = Math.max(4, Math.floor(tile)), cols = Math.ceil(W / tw), rows = Math.ceil(H / tw), tiles = cols * rows;
  const accum = new Float32Array(W * H * 4);
  let samples = 0;
  const names = [];
  const sched = createScheduler({ devices: [{ id: 'cpu', lanes: pool.size, run: (c, { signal }) => runChunk(c, signal) }], targetMs: 60 });
  let cur = null;   // the pass in progress: { sample0, spp, parts: Map(tileIndex → Float32Array) }

  function tileRect(i) {
    const x0 = (i % cols) * tw, y0 = Math.floor(i / cols) * tw;
    return [x0, y0, Math.min(tw, W - x0), Math.min(tw, H - y0)];
  }
  async function runChunk(c, signal) {
    const list = [];
    for (let i = c.start; i < c.start + c.count; i++) list.push(...tileRect(i));
    const res = await pool.run(JOB, 'runTiles', { kernel: kernel.url, fn: kernel.fn || 'renderTile', tiles: list, sample0: cur.sample0, spp: cur.spp, W, H, params }, { signal, units: c.count });
    let off = 0;
    for (let i = c.start; i < c.start + c.count; i++) {
      const [, , w, h] = tileRect(i), n = w * h * 4;
      cur.parts.set(i, res.data.subarray(off, off + n));
      off += n;
    }
    return c.count;
  }

  const r = {
    accum, W, H, tiles,
    get samples() { return samples; },
    async share(buffers) {
      for (const [name, data] of Object.entries(buffers)) { await pool.share(name, data); if (!names.includes(name)) names.push(name); }
    },
    async renderRange(s0, spp, { signal = null, onTile = null, into = null } = {}) {
      const out = into || new Float32Array(W * H * 4);
      cur = { sample0: s0, spp, parts: new Map() };
      try {
        await sched.runRange(tiles, { signal, onChunk: (c) => { try { onTile?.(c); } catch { /* advisory */ } } });
        // add in tile order: the same sums whatever ran where
        for (let i = 0; i < tiles; i++) {
          const [x0, y0, w, h] = tileRect(i), part = cur.parts.get(i);
          for (let y = 0; y < h; y++) {
            const src = y * w * 4, dst = ((y0 + y) * W + x0) * 4;
            for (let k = 0; k < w * 4; k++) out[dst + k] += part[src + k];
          }
        }
      } finally { cur = null; }
      return out;
    },
    async pass({ spp = 1, signal = null, onTile = null } = {}) {
      const t0 = now();
      await r.renderRange(samples, spp, { signal, onTile, into: null }).then((part) => { for (let i = 0; i < accum.length; i++) accum[i] += part[i]; });
      samples += spp;
      return { samples, ms: now() - t0 };
    },
    async run({ passes = 1, spp = 1, signal = null, onPass = null } = {}) {
      const t0 = now();
      let stopped = false;
      for (let p = 0; p < passes; p++) {
        if (signal?.aborted) { stopped = true; break; }
        try { await r.pass({ spp, signal }); }
        catch (e) { if (e?.code === 'cancelled') { stopped = true; break; } throw e; }
        try { onPass?.(accum, samples); } catch { /* advisory */ }
      }
      return { samples, ms: now() - t0, stopped };
    },
    image(out = new Float32Array(W * H * 3)) {
      for (let i = 0; i < W * H; i++) { const n = accum[i * 4 + 3] || 1; out[i * 3] = accum[i * 4] / n; out[i * 3 + 1] = accum[i * 4 + 1] / n; out[i * 3 + 2] = accum[i * 4 + 2] / n; }
      return out;
    },
    reset() { accum.fill(0); samples = 0; },
    release() { for (const n of names.splice(0)) pool.unshare(n); },
  };
  return r;
}
