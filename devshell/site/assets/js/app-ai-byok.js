/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol and developer messages; the person's words are in the hub card and the Ask box. */
/**
 * app-ai-byok.js — the Ask box uses the person's own model inside Studio (0.8 AC.11, owner 2026-10-29). Studio's hub window keeps the API key in the
 * computer's credential store and is the only window that can use it (desktop-shell ask_keys.rs); an app window asks the hub, over Studio's window
 * channel, to make one provider call ('ask.call' → 'ask.result': the status and the JSON body come back, never the key). The settings and the spending
 * ledger are plain localStorage shared by every window of the suite, so the caps count every app together. The engine is tools/mcp/byok.mjs
 * (ai-byok.js, a byte-identical copy: `node bin/test-ask-byok.mjs` checks it).
 *
 *   studioEngine({ studio, store, now }) → an ask-style engine for ai-ask.js, or null when the person has not set up a model (no stored settings)
 *   hasSettings(store)
 */
import { createByok } from './ai-byok.js';

export const SETTINGS_KEY = 'cadcraft.studio.byok.settings';
export const LEDGER_KEY = 'cadcraft.studio.byok.ledger';
const json = (store, key, d) => { try { const v = JSON.parse(store.getItem(key) || 'null'); return v === null ? d : v; } catch { return d; } };
export const hasSettings = (store = globalThis.localStorage) => { try { return store.getItem(SETTINGS_KEY) !== null; } catch { return false; } };

/** A transport that sends one provider call to the hub and waits for its answer. */
export function channelTransport(studio, { timeoutMs = 130000, uid = () => Math.random().toString(36).slice(2, 12) + Date.now().toString(36) } = {}) {
  return function call({ provider, baseUrl, keyName, request, signal }) {
    return new Promise((resolve) => {
      const id = uid();
      let done = false, off = () => {};
      const finish = (v) => { if (done) return; done = true; clearTimeout(timer); off(); if (signal) signal.removeEventListener('abort', onAbort); resolve(v); };
      const onAbort = () => finish({ status: 0, error: 'aborted' });
      const timer = setTimeout(() => finish({ status: 0, error: 'timeout' }), timeoutMs);
      off = studio.on('ask.result', (d) => { if (d && d.id === id) finish({ status: Number(d.status) || 0, json: d.json === undefined ? null : d.json, ...(d.error ? { error: String(d.error) } : {}) }); });
      if (signal) { if (signal.aborted) { finish({ status: 0, error: 'aborted' }); return; } signal.addEventListener('abort', onAbort, { once: true }); }
      try { studio.post('ask.call', { id, call: { provider, baseUrl, keyName, request } }, typeof studio.hub === 'function' ? studio.hub() : undefined); } catch { finish({ status: 0, error: 'unreachable' }); }
    });
  };
}

export function studioEngine({ studio = globalThis.cadcraftStudio, store = globalThis.localStorage, now } = {}) {
  if (!studio || typeof studio.post !== 'function' || typeof studio.on !== 'function' || !hasSettings(store)) return null;
  const settings = { get: () => json(store, SETTINGS_KEY, {}) };
  const ledger = { get: () => json(store, LEDGER_KEY, []), set: (v) => { try { store.setItem(LEDGER_KEY, JSON.stringify(v)); } catch { /* full or private */ } } };
  // the key never reaches this window: has() / set() / delete() are the hub card's job, and a call without a key answers 'no_key'
  const keystore = { async has() { return true; }, async set() { throw new Error('The key is set in Studio, in Your own AI model.'); }, async delete() {}, async _get() { return null; } };
  const eng = createByok({ settings, ledger, keystore, transport: channelTransport(studio), ...(now ? { now } : {}) });
  return { name: 'Your own model', kind: 'byok', ask: (o) => eng.ask(o), check: eng.check, usage: eng.usage };
}
