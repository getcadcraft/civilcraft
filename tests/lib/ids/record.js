/* SPDX-License-Identifier: Apache-2.0 */
/**
 * record.js — the IDS a project remembers (0.7.1 71.25). Import-free, so an app's file reader can use it without loading the checker.
 *
 *   cleanIdsRecord(raw) → { name, hash, text } | null     from a file: untrusted, bounded (8 MB of text, 200 characters of name)
 *   cleanIdsRef(raw) → { name, hash, title, version } | null   only the reference (no text), as undo snapshots and BimCraft's IFC keep it
 *   idsHash(text) → 'cc53-' + 14 hex digits   a stable 53-bit hash (cyrb53): tells "the same IDS" from "another"; not a security hash
 *   idsTextStore() → { put(text) → hash, get(hash), has(hash), prune(keep(hash) → bool), size }
 *     the texts kept ONCE, outside the undo snapshots (lead 2026-10-26): a snapshot holds { name, hash } only, so 200 edits with a
 *     200 KB IDS cost 200 short references, not 40 MB. prune drops texts no snapshot or state refers to any more.
 */

export function idsHash(text) {
  const s = String(text ?? '');
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 'cc53-' + (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, '0');
}

const HASH = /^cc53-[0-9a-f]{14}$/;
const line = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n) : '');

export function cleanIdsRecord(r) {
  if (!r || typeof r !== 'object' || typeof r.text !== 'string' || !r.text.trim() || r.text.length > 8e6) return null;
  const hash = typeof r.hash === 'string' && HASH.test(r.hash) ? r.hash : '';
  return { name: line(r.name, 200), hash, text: r.text };
}

export function cleanIdsRef(r) {
  if (!r || typeof r !== 'object' || typeof r.hash !== 'string' || !HASH.test(r.hash)) return null;
  return { name: line(r.name, 200), hash: r.hash, title: line(r.title, 200), version: line(r.version, 60) };
}

export function idsTextStore() {
  const texts = new Map();
  return {
    put(text) { const h = idsHash(text); texts.set(h, text); return h; },
    get: (h) => texts.get(h) ?? null,
    has: (h) => texts.has(h),
    prune(keep) { for (const h of [...texts.keys()]) if (!keep(h)) texts.delete(h); },
    get size() { return texts.size; },
  };
}
