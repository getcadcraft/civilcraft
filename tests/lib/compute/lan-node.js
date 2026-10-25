/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: protocol error codes and messages sent to the other page; lan-ui.js turns codes into words */
/**
 * lan-node.js — this computer as a render node for another one on the same network (0.7 CU.7, the node page's side). Runs
 * only when the person turned on "Let others render on this computer" (Settings › Rendering; off by default, per machine).
 * The node renders with ITS OWN kernels, picked by id from the list the app hands in — it never loads code named over the
 * network — and with its own pool (cpu-render.js). Everything received is checked: a known kernel, buffer names, kinds and
 * sizes that add up, a picture and sample count within the limits. One scene at a time; a new one replaces the last.
 *
 *   serveNode({ transport, code: { tag, secret }, crypto, pool, kernels: { id: { url, fn } }, limits, onEvent }) → Promise<{ close() }>
 *     resolves once the handshake succeeds (rejects on a wrong code: onEvent('wrong-code') — 3 in a row, make a new code)
 *     limits: { maxBytes = 512 MiB, maxPixels = 3840·2160, maxSpp = 1024, tile = 32 }
 *     onEvent(kind, detail): 'connected' | 'scene' {kernel, bytes} | 'range' {s0, spp, W, H, ms} | 'left' | 'wrong-code'
 */
import { createChannel, handshakeNode, lanError, VERSION } from './lan-proto.js';
import { createCpuRender } from './cpu-render.js';

const KINDS = { f32: Float32Array, f64: Float64Array, u32: Uint32Array, i32: Int32Array, u8: Uint8Array };
const NAME = /^[A-Za-z0-9_.-]{1,64}$/;

export async function serveNode({ transport, code, crypto, pool, kernels, limits = {}, onEvent = () => {} }) {
  const L = { maxBytes: 512 * 1024 * 1024, maxPixels: 3840 * 2160, maxSpp: 1024, tile: 32, ...limits };
  const say = (k, d) => { try { onEvent(k, d); } catch { /* the app's */ } };
  const session = await handshakeNode(transport, code, crypto, { onWrong: () => say('wrong-code') });
  say('connected');
  let scene = null;          // { id, kernel, buffers, params, renders: Map("WxH" → cpuRender) }
  const jobs = new Map();    // job → AbortController
  let ch = null;
  const refuse = (head, code2, message) => { try { ch.send({ type: 'error', ...head, code: code2, message }); } catch { /* gone */ } };

  async function loadScene(head, payload) {
    const id = head.scene;
    if (!Number.isInteger(id) || id < 1) return refuse({ scene: 0 }, 'bad_scene', 'scene id');
    const k = kernels[head.kernel];
    if (!k || !Object.hasOwn(kernels, head.kernel)) return refuse({ scene: id }, 'unknown_kernel', 'this node cannot run ' + String(head.kernel).slice(0, 40));
    if (!Array.isArray(head.buffers) || head.buffers.length > 32) return refuse({ scene: id }, 'bad_scene', 'buffers');
    const buffers = {};
    let o = 0;
    for (const b of head.buffers) {
      const T = KINDS[b?.kind];
      if (!T || typeof b.name !== 'string' || !NAME.test(b.name) || !Number.isInteger(b.length) || b.length < 0) return refuse({ scene: id }, 'bad_scene', 'buffer ' + String(b?.name).slice(0, 40));
      const bytes = b.length * T.BYTES_PER_ELEMENT;
      if (o + bytes > payload.length) return refuse({ scene: id }, 'bad_scene', 'buffers longer than the data');
      const a = new T(b.length);
      new Uint8Array(a.buffer).set(payload.subarray(o, o + bytes));
      buffers[b.name] = a;
      o += bytes;
    }
    if (o !== payload.length) return refuse({ scene: id }, 'bad_scene', 'data longer than the buffers');
    if (scene) for (const r of scene.renders.values()) r.release();
    scene = { id, kernel: k, buffers, params: head.params && typeof head.params === 'object' ? head.params : {}, renders: new Map() };
    say('scene', { kernel: head.kernel, bytes: payload.length });
    ch.send({ type: 'scene-ok', scene: id });
  }

  async function range(head) {
    const { job, s0, spp, W, H } = head;
    if (!Number.isInteger(job)) return;
    if (!scene || head.scene !== scene.id) return refuse({ job }, 'no_scene', 'send the scene first');
    if (![s0, spp, W, H].every(Number.isInteger) || s0 < 0 || spp < 1 || spp > L.maxSpp || W < 1 || H < 1 || W * H > L.maxPixels) return refuse({ job }, 'too_big', 'the picture or the samples are over this node\'s limits');
    const ac = new AbortController();
    jobs.set(job, ac);
    const t0 = Date.now();
    try {
      const key = W + 'x' + H;
      let r = scene.renders.get(key);
      if (!r) {
        // one render (and one share of the scene in the pool) per picture size; a new scene releases the old ones
        for (const old of scene.renders.values()) old.release();
        scene.renders.clear();
        r = createCpuRender({ pool, kernel: scene.kernel, W, H, tile: L.tile, params: scene.params });
        await r.share(scene.buffers);
        scene.renders.set(key, r);
      }
      const out = await r.renderRange(s0, spp, { signal: ac.signal });
      ch.send({ type: 'result', job, s0, spp }, out);
      say('range', { s0, spp, W, H, ms: Date.now() - t0 });
    } catch (e) {
      refuse({ job }, e?.code === 'cancelled' ? 'cancelled' : 'failed', String(e?.message || e).slice(0, 200));
    } finally { jobs.delete(job); }
  }

  ch = createChannel({
    transport, session, maxBytes: L.maxBytes,
    onError: () => { for (const ac of jobs.values()) ac.abort(); if (scene) for (const r of scene.renders.values()) r.release(); scene = null; say('left'); },
    onMessage(head, payload) {
      if (head.type === 'hello') { if (head.v !== VERSION) { refuse({}, 'version', 'protocol ' + head.v); ch.close(); return; } ch.send({ type: 'ready', v: VERSION, kernels: Object.keys(kernels), workers: pool.size, maxBytes: L.maxBytes }); return; }
      if (head.type === 'scene') { loadScene(head, payload); return; }
      if (head.type === 'range') { range(head); return; }
      if (head.type === 'cancel') { jobs.get(head.job)?.abort(); return; }
      if (head.type === 'bye') { ch.close(); say('left'); }
      // anything else: ignored (the protocol grows by new types)
    },
  });
  return { close: () => ch.close() };
}
