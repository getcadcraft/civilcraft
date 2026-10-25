/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: error codes for the caller; lan-ui.js turns codes into words */
/**
 * lan.js — use another computer on the same network as a render node (0.7 CU.7, the requesting page's side). The node is a
 * Studio that turned on "Let others render on this computer" (lan-node.js); its code (TT-SSSSS, shown in its Settings) is
 * the password of the same handshake Studio Live uses, and every byte after it is end-to-end encrypted (lan-proto.js). The
 * scene goes once; then the node renders sample ranges, so it is just one more device for hybrid.js — a node that leaves
 * mid-render loses nothing (its samples are redone by the other devices). No relay, no internet. DOM-free.
 *
 *   const node = await connectNode({ transport, code, crypto, maxBytes })   crypto = the app's live-crypto.js module
 *   node.info → { kernels: [id], workers, maxBytes }
 *   await node.loadScene({ kernel: id, buffers: { name: typedArray }, params }) → sceneId     (replaces the node's last scene)
 *   node.device(sceneId, { W, H }) → { id: 'lan:<tag>', kind: 'lan', renderRange(s0, spp, { signal }) → Float32Array W·H·4 }
 *   node.close() · node.closed · node.onclose = () => {}
 * Errors carry `code`: bad_code, wrong_code, timeout, closed, node_left, refused (the node said no: unknown kernel, too big…),
 * cancelled.
 */
import { createChannel, handshakeJoiner, lanError, VERSION } from './lan-proto.js';

const KINDS = { f32: Float32Array, f64: Float64Array, u32: Uint32Array, i32: Int32Array, u8: Uint8Array };
const kindOf = (a) => Object.keys(KINDS).find((k) => a instanceof KINDS[k]);

export async function connectNode({ transport, code, crypto, maxBytes = 512 * 1024 * 1024, timeoutMs = 10000 }) {
  const session = await handshakeJoiner(transport, code, crypto, { timeoutMs });
  const tag = crypto.parseCode(code).tag;
  const waiting = new Map();   // key → { resolve, reject }
  let readyResolve, readyReject;
  const ready = new Promise((res, rej) => { readyResolve = res; readyReject = rej; });
  let nextJob = 1, nextScene = 1, closed = false;
  const node = { info: null, onclose: null, get closed() { return closed; } };
  const leave = (err) => {
    if (closed) return;
    closed = true;
    const e = err?.code === 'closed' ? lanError('node_left', 'the render node left') : err;
    readyReject(e);
    for (const w of waiting.values()) w.reject(e);
    waiting.clear();
    try { node.onclose?.(e); } catch { /* the caller's */ }
  };
  const ch = createChannel({
    transport, session, maxBytes,
    onError: leave,
    onMessage(head, payload) {
      if (head.type === 'ready') { node.info = { kernels: Array.isArray(head.kernels) ? head.kernels.map(String).slice(0, 64) : [], workers: head.workers | 0, maxBytes: head.maxBytes | 0 }; readyResolve(); return; }
      const key = head.type === 'scene-ok' || (head.type === 'error' && head.scene) ? 's' + head.scene : 'j' + head.job;
      const w = waiting.get(key);
      if (!w) return;
      waiting.delete(key);
      if (head.type === 'error') w.reject(lanError(head.code === 'cancelled' ? 'cancelled' : 'refused', String(head.message || head.code).slice(0, 200)));
      else w.resolve({ head, payload });
    },
  });
  ch.send({ type: 'hello', v: VERSION });
  await Promise.race([ready, new Promise((_, rej) => setTimeout(() => rej(lanError('timeout', 'the node did not answer')), timeoutMs))]);

  const ask = (key, head, payload) => new Promise((resolve, reject) => {
    if (closed) return reject(lanError('node_left', 'the render node left'));
    waiting.set(key, { resolve, reject });
    try { ch.send(head, payload); } catch (e) { waiting.delete(key); reject(e); }
  });

  node.loadScene = async ({ kernel, buffers, params = {} }) => {
    const id = nextScene++;
    const list = [];
    let total = 0;
    for (const [name, a] of Object.entries(buffers)) {
      const kind = kindOf(a);
      if (!kind) throw lanError('bad_scene', name + ' is not a typed array');
      list.push({ name, kind, length: a.length });
      total += a.byteLength;
    }
    const all = new Uint8Array(total);
    let o = 0;
    for (const a of Object.values(buffers)) { all.set(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), o); o += a.byteLength; }
    await ask('s' + id, { type: 'scene', scene: id, kernel: String(kernel), params, buffers: list }, all);
    return id;
  };

  node.device = (scene, { W, H }) => ({
    id: 'lan:' + tag, kind: 'lan',
    async renderRange(s0, spp, { signal = null } = {}) {
      if (signal?.aborted) throw lanError('cancelled');
      const job = nextJob++;
      const p = ask('j' + job, { type: 'range', job, scene, s0, spp, W, H });
      const onAbort = () => { try { ch.send({ type: 'cancel', job }); } catch { /* gone */ } };
      signal?.addEventListener('abort', onAbort, { once: true });
      try {
        const { head, payload } = await p;
        if (head.type !== 'result' || head.s0 !== s0 || head.spp !== spp || payload.length !== W * H * 16) throw lanError('refused', 'a result that does not match the request');
        const out = new Float32Array(W * H * 4);
        new Uint8Array(out.buffer).set(payload);
        return out;
      } finally { signal?.removeEventListener('abort', onAbort); }
    },
  });

  node.close = () => { try { ch.send({ type: 'bye' }); } catch { /* gone */ } ch.close(); leave(lanError('closed')); };
  return node;
}
