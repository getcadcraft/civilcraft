/* SPDX-License-Identifier: Apache-2.0 */
/**
 * registry.js — the climate packs this page has (0.9 EG.46). DOM-free. The data add-on ("Climate futures", off by default) adds its pack here;
 * a person may load their own pack file in the panel. Nothing here holds data; nothing is fetched.
 *   addPack(pack, { origin }) → id   removePack(id)   packs() → [{ id, pack, origin }]   onPacks(fn) → unsubscribe
 */
const list = new Map(), subs = new Set();
const tell = () => { for (const f of subs) { try { f(); } catch (e) { /* a listener's own problem */ } } };
export function addPack(pack, { origin = 'addon' } = {}) { list.set(pack.id, { id: pack.id, pack, origin }); tell(); return pack.id; }
export function removePack(id) { if (list.delete(id)) tell(); }
export const packs = () => [...list.values()];
export function onPacks(fn) { subs.add(fn); return () => subs.delete(fn); }
