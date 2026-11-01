/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: no words a person reads; the window (eg-ui.js) words every code and the add-ons name their own sources. */
/**
 * site-fetch.js — "Address to site" data from the open services, one source per add-on (0.8 EG.63, owner 2026-10-29: free open data, USGS, FEMA, OSM and
 * county parcels). DOM-free apart from the registry on `window`. The app calls a service ONLY when the person presses that source's button; nothing
 * is fetched at start, no key is sent, the address leaves the page only to the service the person chose, https only, one request per press, and the
 * answer is kept 24 hours in this browser (so pressing again costs the service nothing). Each source lives in its own bundled, off-by-default add-on
 * (addons/site-*) that calls registerSource().
 *
 * A SOURCE: { id, name, licence, where, kinds: ['flood'…], needs: 'point' | 'address' | 'url',
 *   request({ lat, lon, radius, address, url }) → { url, method?, headers?, body? }     (https only; refused otherwise)
 *   parse(text, ctx) → { geojson?: string, kind?: 'flood'…, name?, point?: { lat, lon, label }, info?: [{ key, value }] } }
 *
 *   registerSource(src) → unregister() · sources() · onChange(fn)
 *   runSource(src, ctx, { fetchFn, store, now }) → { ok, result?, cached?, why? }     why: 'https' | 'http' | 'network' | 'parse' | 'need'
 */
const KEY = 'cc-site-cache';
const TTL = 24 * 3600 * 1000, MAX_ENTRIES = 12, MAX_BYTES = 400000;

const reg = () => (globalThis.__ccSiteSources ||= { list: [], subs: [] });
export const sources = () => reg().list.slice();
export const onChange = (fn) => { reg().subs.push(fn); return () => { reg().subs = reg().subs.filter((f) => f !== fn); }; };
export function registerSource(src) {
  const r = reg();
  if (!src || !src.id || typeof src.request !== 'function' || typeof src.parse !== 'function') throw new Error('registerSource: id, request and parse');
  r.list = r.list.filter((s) => s.id !== src.id).concat(src);
  r.subs.forEach((f) => f());
  return () => { r.list = r.list.filter((s) => s !== src); r.subs.forEach((f) => f()); };
}

const memStore = () => { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, v) }; };
const defaultStore = () => { try { return globalThis.localStorage || memStore(); } catch { return memStore(); } };
const readCache = (store) => { try { return JSON.parse(store.getItem(KEY) || '{}'); } catch { return {}; } };
const writeCache = (store, c) => { try { const keys = Object.keys(c).sort((a, b) => c[b].t - c[a].t).slice(0, MAX_ENTRIES); const o = {}; for (const k of keys) o[k] = c[k]; store.setItem(KEY, JSON.stringify(o)); } catch { /* full or blocked: no cache */ } };

export async function runSource(src, ctx, { fetchFn = globalThis.fetch?.bind(globalThis), store = defaultStore(), now = Date.now() } = {}) {
  if (src.needs === 'point' && !(Number.isFinite(ctx.lat) && Number.isFinite(ctx.lon))) return { ok: false, why: 'need' };
  if (src.needs === 'address' && !String(ctx.address || '').trim()) return { ok: false, why: 'need' };
  if (src.needs === 'url' && !/^https:\/\//i.test(String(ctx.url || ''))) return { ok: false, why: String(ctx.url || '') ? 'https' : 'need' };
  let req;
  try { req = src.request(ctx); } catch { return { ok: false, why: 'need' }; }
  if (!/^https:\/\//i.test(req.url)) return { ok: false, why: 'https' };
  const ck = src.id + '|' + (req.method || 'GET') + '|' + req.url + '|' + (req.body || '');
  const cache = readCache(store), hit = cache[ck];
  let text, cached = false;
  if (hit && now - hit.t < TTL) { text = hit.text; cached = true; }
  else {
    try {
      const r = await fetchFn(req.url, { method: req.method || 'GET', headers: req.headers, body: req.body, credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error' });
      if (!r.ok) return { ok: false, why: 'http', status: r.status };
      text = await r.text();
    } catch { return { ok: false, why: 'network' }; }
    if (text.length < MAX_BYTES) { cache[ck] = { t: now, text }; writeCache(store, cache); }
  }
  try { return { ok: true, cached, result: src.parse(text, ctx) }; } catch { return { ok: false, why: 'parse' }; }
}
