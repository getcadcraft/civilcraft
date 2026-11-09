/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: file data and error codes; every word a person reads comes from the host app. */
/**
 * private-notes.js — notes only their writer can read (0.9 NOTES.1). Canonical here (lib/notes); apps carry byte-identical
 * copies written by `node tools/notes/sync.mjs` (nobody edits a copy). No imports, no DOM. Hosts: MarkupCraft first, SuperCad
 * Studio and any other app next: it seals any JSON payload and knows nothing about markups.
 *
 * Why a passphrase and not the writer's name: a name is not a secret and our code is public, so a key made from a name could
 * be rebuilt by anyone. The key comes from a passphrase only the writer knows (PBKDF2-SHA-256, a random salt, 600,000 rounds)
 * and seals with AES-256-GCM, which also refuses a changed file. There is no recovery: nobody, us included, can open a note
 * without the passphrase. The writer's name goes inside the sealed payload, never beside it.
 *
 * A sealed blob = { f: 'cc-private-notes', v: 1, it, salt, iv, ct } (base64). Nothing in it says who wrote it or what it holds.
 *
 *   deriveKey(pass, saltB64, it?) · seal(key, saltB64, it, payload) → blob · openBlob(key, blob) → payload | null
 *   cleanBlob(untrusted) → blob | null
 *   createKeychain({ storage?, crypto? }) → keychain, one writer's keys on this device
 *     await load() · state 'off' (never set up here) | 'locked' | 'open'
 *     await unlock(pass, { remember, blobs }) → { ok, code?, created, added }   sets up on first use. A passphrase is also tried
 *        on `blobs` with other salts (notes from the writer's other devices); their keys join the keychain.
 *     await addPassphrase(pass, blobs) → keys added · await lock() · await forget() · await sealPayload(payload) → blob · await openPayload(blob) → payload | null
 *   The passphrase itself is never kept. Keys are non-extractable; `remember` keeps them in this browser profile's IndexedDB
 *   (anyone using the same profile while it is unlocked can read the notes: that is what Lock and "ask every time" are for).
 */
export const FORMAT = 'cc-private-notes';
export const VERSION = 1;
export const ITERATIONS = 600000;
export const MIN_PASS = 10;
const MAX_TRY_SALTS = 8;
const CHECK = 'cc-private-notes-check-1';
const AAD = new TextEncoder().encode(FORMAT + '/1');

export function toB64(bytes) {
  const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
  return btoa(s);
}
export function fromB64(b64) {
  const s = atob(String(b64));
  const u = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i);
  return u;
}

const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
/** An untrusted blob from a file → a clean one, or null. */
export function cleanBlob(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b) || b.f !== FORMAT || b.v !== VERSION) return null;
  if (!Number.isInteger(b.it) || b.it < 100000 || b.it > 10000000) return null;
  for (const k of ['salt', 'iv', 'ct']) if (typeof b[k] !== 'string' || !B64.test(b[k])) return null;
  try { if (fromB64(b.salt).length !== 16 || fromB64(b.iv).length !== 12) return null; } catch { return null; }
  return { f: FORMAT, v: VERSION, it: b.it, salt: b.salt, iv: b.iv, ct: b.ct };
}

export async function deriveKey(pass, saltB64, it = ITERATIONS, c = globalThis.crypto) {
  const raw = await c.subtle.importKey('raw', new TextEncoder().encode(String(pass).normalize('NFKC')), 'PBKDF2', false, ['deriveKey']);
  return c.subtle.deriveKey({ name: 'PBKDF2', hash: 'SHA-256', salt: fromB64(saltB64), iterations: it }, raw, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}
export async function seal(key, saltB64, it, payload, c = globalThis.crypto) {
  const iv = c.getRandomValues(new Uint8Array(12));
  const ct = await c.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: AAD }, key, new TextEncoder().encode(JSON.stringify(payload)));
  return { f: FORMAT, v: VERSION, it, salt: saltB64, iv: toB64(iv), ct: toB64(new Uint8Array(ct)) };
}
export async function openBlob(key, blob, c = globalThis.crypto) {
  try {
    const pt = await c.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(blob.iv), additionalData: AAD }, key, fromB64(blob.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  } catch { return null; }
}

/** This browser profile's store: one record in IndexedDB. */
export function idbStorage(name = 'cc-private-notes') {
  const open = () => new Promise((res, rej) => {
    const q = indexedDB.open(name, 1);
    q.onupgradeneeded = () => q.result.createObjectStore('kv');
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
  const run = async (mode, fn) => {
    const db = await open();
    try {
      return await new Promise((res, rej) => {
        const tx = db.transaction('kv', mode), q = fn(tx.objectStore('kv'));
        tx.oncomplete = () => res(q.result);
        tx.onerror = tx.onabort = () => rej(tx.error);
      });
    } finally { db.close(); }
  };
  return {
    get: () => run('readonly', (s) => s.get('me')),
    set: (v) => run('readwrite', (s) => s.put(v, 'me')),
    clear: () => run('readwrite', (s) => s.delete('me')),
  };
}

export function createKeychain({ storage = null, crypto: c = globalThis.crypto } = {}) {
  const store = storage || idbStorage();
  let me = null;            // { primary: salt, it, check: blob, remember }
  let keys = new Map();     // salt → CryptoKey, while open
  const persist = async () => {
    if (!me) return;
    await store.set({ ...me, keys: me.remember ? [...keys].map(([salt, key]) => ({ salt, key })) : [] });
  };
  const addOthers = async (pass, blobs) => {
    const salts = [...new Map((blobs || []).map(cleanBlob).filter((b) => b && !keys.has(b.salt)).map((b) => [b.salt, b])).values()].slice(0, MAX_TRY_SALTS);
    let added = 0;
    for (const b of salts) {
      const key = await deriveKey(pass, b.salt, b.it, c);
      if (await openBlob(key, b, c)) { keys.set(b.salt, key); added++; }
    }
    return added;
  };
  return {
    get state() { return !me ? 'off' : keys.has(me.primary) ? 'open' : 'locked'; },
    async load() {
      let rec = null;
      try { rec = await store.get(); } catch { rec = null; }
      if (!rec?.primary || !cleanBlob(rec.check)) { me = null; keys = new Map(); return this.state; }
      me = { primary: rec.primary, it: rec.it, check: rec.check, remember: rec.remember === true };
      keys = new Map((rec.keys || []).filter((k) => k?.salt && k.key).map((k) => [k.salt, k.key]));
      return this.state;
    },
    async unlock(pass, { remember = true, blobs = [] } = {}) {
      if (String(pass || '').length < MIN_PASS) return { ok: false, code: 'short' };
      let created = false;
      if (!me) {
        // first use on this device: a new salt; older notes in open files come in through addOthers below and are sealed under this one when saved
        const salt = toB64(c.getRandomValues(new Uint8Array(16)));
        const key = await deriveKey(pass, salt, ITERATIONS, c);
        keys = new Map([[salt, key]]);
        me = { primary: salt, it: ITERATIONS, check: await seal(key, salt, ITERATIONS, CHECK, c), remember };
        created = true;
      } else {
        const key = keys.get(me.primary) || await deriveKey(pass, me.primary, me.it, c);
        if (await openBlob(key, me.check, c) !== CHECK) return { ok: false, code: 'wrong' };
        keys.set(me.primary, key);
        me.remember = remember;
      }
      const added = await addOthers(pass, blobs);
      await persist();
      return { ok: true, created, added };
    },
    /** Another passphrase (or device) of this writer's: keeps the keys that open `blobs`. How many joined. */
    async addPassphrase(pass, blobs = []) {
      if (!me || !keys.has(me.primary)) return 0;
      const added = await addOthers(pass, blobs);
      if (added) await persist();
      return added;
    },
    async lock() { keys = new Map(); if (me) await store.set({ ...me, keys: [] }); },
    async forget() { me = null; keys = new Map(); await store.clear(); },
    async sealPayload(payload) {
      const key = me && keys.get(me.primary);
      if (!key) throw new Error('private notes are locked');
      return seal(key, me.primary, me.it, payload, c);
    },
    async openPayload(blob) {
      const b = cleanBlob(blob);
      const key = b && keys.get(b.salt);
      return key ? openBlob(key, b, c) : null;
    },
  };
}
