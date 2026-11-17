// SPDX-License-Identifier: Apache-2.0
/**
 * store.js: where the Default Policies document is kept on this computer (0.10 DP.1, session bk-defaults-10). No app imports.
 * ONE store for every app: localStorage `cc-default-policies` on the apps' shared origin, so an office sets its defaults once and
 * BimCraft, CadCraft and the others read the same document. Without localStorage (a test, a locked-down browser) it is kept for
 * this session only. What is read is always passed through cleanDoc, so a hand-edited or damaged value can never reach an app.
 *
 *   load() → doc                 save(doc) → doc (cleaned)          clear()
 *   onStoreChange(fn) → stop()   fn(doc) after save() here or in another tab (the browser's storage event)
 *   useStorage(storageLike)      tests: a stand-in for localStorage (null = memory only)
 */
import { cleanDoc, emptyDoc } from './policies.js';

export const KEY = 'cc-default-policies';
let mem = null, forced;
const listeners = new Set();
const ls = () => { if (forced !== undefined) return forced; try { return globalThis.localStorage || null; } catch (e) { return null; } };

export function useStorage(s) { forced = s; mem = null; }
export function load() {
  let raw = mem;
  const st = ls();
  if (st) { try { raw = JSON.parse(st.getItem(KEY) || 'null'); } catch (e) { raw = null; } }
  return raw ? cleanDoc(raw).doc : emptyDoc();
}
const tell = () => { const d = load(); for (const fn of [...listeners]) { try { fn(d); } catch (e) { /* a listener's failure never stops the others */ } } };
export function save(doc) {
  const clean = cleanDoc(doc).doc;
  mem = clean;
  const st = ls();
  if (st) { try { st.setItem(KEY, JSON.stringify(clean)); } catch (e) { /* kept for this session only */ } }
  tell();
  return clean;
}
export function clear() {
  mem = null;
  const st = ls();
  if (st) { try { st.removeItem(KEY); } catch (e) { /* blocked */ } }
  tell();
}
export function onStoreChange(fn) {
  listeners.add(fn);
  const h = (e) => { if (!e || e.key === KEY || e.key === null) { try { fn(load()); } catch (err) { /* listener */ } } };
  try { globalThis.addEventListener && globalThis.addEventListener('storage', h); } catch (e) { /* no window */ }
  return () => { listeners.delete(fn); try { globalThis.removeEventListener && globalThis.removeEventListener('storage', h); } catch (e) { /* no window */ } };
}
