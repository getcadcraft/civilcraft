/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live.js — the wire between the windows that hold the one living model (0.8 Track CH, CH.4). DOM-free: the channel is handed in
 * (a BroadcastChannel in the apps, a fake in the tests), so nothing here touches `window`.
 *
 * CadCraft (P&ID add-on) and BimCraft (Plant add-on) are separate pages of the same site; when one of them changes the model (a pipe's
 * size made in 3D, a line renumbered on the P&ID) it publishes the whole `cadcraft-process` block, and the other takes it, re-runs the
 * hydraulics and raises Problems where the drawings now disagree. Nothing leaves the browser: BroadcastChannel is same-origin only.
 *
 *   packet(model, { from, rev, change? })   → the message (a plain object; the model travels as its JSON text)
 *   readPacket(raw)                          → { from, rev, model, change } | null   (untrusted: shape, size and the model's own cleaning)
 *   open(factory, { from, onModel })         → { publish(model, change?), close(), rev() }   factory(name) → a channel with postMessage / onmessage / close
 *
 * A window ignores its own messages and any message whose `rev` is not newer than the last one it saw or sent (so two windows cannot
 * ping-pong an unchanged model). `change` is { stream?, ln?, run?, size, by } — what happened, for the status line; the block is the truth.
 */
import { toJSON, fromJSON, LIMITS } from './model.js';

export const CHANNEL = 'cadcraft-process-live';
export const FORMAT = 'cadcraft-process-live';

const APPS = /^[a-z][a-z0-9-]{1,24}$/;
const cleanChange = (c) => {
  if (!c || typeof c !== 'object') return null;
  const s = (v, n = 80) => (v == null ? undefined : String(v).slice(0, n));
  const out = { by: c.by === 'pid' ? 'pid' : '3d' };
  for (const k of ['stream', 'ln', 'run', 'size']) if (c[k] != null) out[k] = s(c[k]);
  return out;
};

export function packet(model, { from, rev = Date.now(), change = null } = {}) {
  if (!APPS.test(String(from || ''))) throw new Error('live: from must name the app');
  return { format: FORMAT, v: 1, from: String(from), rev: Number(rev) || Date.now(), model: toJSON(model), ...(change ? { change: cleanChange(change) } : {}) };
}

export function readPacket(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || raw.v !== 1) return null;
  if (!APPS.test(String(raw.from)) || !Number.isFinite(raw.rev) || typeof raw.model !== 'string' || raw.model.length > LIMITS.json) return null;
  const model = fromJSON(raw.model);
  return model ? { from: raw.from, rev: raw.rev, model, change: cleanChange(raw.change) } : null;
}

export function open(factory, { from, onModel } = {}) {
  let ch = null, last = 0;
  try { ch = factory(CHANNEL); } catch { ch = null; }
  if (!ch) return { publish: () => false, close() {}, rev: () => last, live: false };
  if (typeof ch.unref === 'function') ch.unref();   // Node: an open channel must not keep a script alive
  ch.onmessage = (ev) => {
    const p = readPacket(ev && ev.data);
    if (!p || p.from === from || p.rev <= last) return;
    last = p.rev;
    try { onModel && onModel(p.model, p.change, p); } catch { /* a handler's failure never stops the wire */ }
  };
  return {
    live: true,
    rev: () => last,
    publish(model, change = null) {
      const rev = Math.max(Date.now(), last + 1);
      last = rev;
      ch.postMessage(packet(model, { from, rev, change }));
      return true;
    },
    close() { try { ch.close(); } catch { /* already closed */ } },
  };
}
