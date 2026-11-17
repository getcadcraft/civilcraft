/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plants-live.js — 0.8 LD.1 (session `landscape_PART_4`). The plants list the apps use: read live from the Library at run time, the bundled
 * seed list (plants-seed.json, CC0) as the fallback. DOM-free; shared by CivilCraft's Landscape workspace, BimCraft's library view and
 * ModelCraft's starter library (rule 39), so there is one copy of this logic.
 *
 *   NET.2: every response is capped (MAX_PLANTS_BYTES, MAX_COLLECTION_BYTES, readCapped) and timeoutMs covers the body too.
 *   loadPlants({ seed, fetchFn, base, timeoutMs, app }) → Promise<{ species, source: 'library' | 'bundled', fromLibrary, note, collection }>
 *     with `app` (0.9 C.3) the plants of that app's default Library collection come first (`collection: true`)
 *
 * The Library side is `GET /api/v1/library/plants.csv` (public, CORS *, published plant items only). The result is the bundled list with the
 * Library's rows laid over it (same key = the Library's row wins), so a Library that has only some of the species, none (the import
 * `bin/library-import-plants.php` not run yet), or that cannot be reached (offline, a desktop window, a slow network) never costs the person a plant.
 */
import { plantsFromCsv, mergeLists } from './plants.js';

/** 2026-11-09: offline = navigator.onLine false, or this page came from the saved offline copy (sw.js adds a `cc-offline-copy` Server-Timing entry; onLine can stay true with the network gone). */
function pageOffline() {
  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
    const nav = typeof performance !== 'undefined' && performance.getEntriesByType ? performance.getEntriesByType('navigation')[0] : null;
    return !!(nav && Array.isArray(nav.serverTiming) && nav.serverTiming.some((t) => t.name === 'cc-offline-copy'));
  } catch { return false; }
}
export const LIBRARY_PLANTS_PATH = '/api/v1/library/plants.csv';

/** NET.2 (Lucas, Discord 2026-11-12): a server that misbehaves must not cost memory or hang the app. The list is ~90 KB today; 8 MB leaves
 *  room for a big Library and refuses anything past it. The default collection's JSON is small; 1 MB. */
export const MAX_PLANTS_BYTES = 8 * 1024 * 1024;
export const MAX_COLLECTION_BYTES = 1024 * 1024;

/** The body as text, never more than `max` bytes: a Content-Length over the cap is refused before reading; without one (or with a
 *  wrong one) the stream is read in pieces and cancelled the moment it passes the cap. Throws Error('too-big'). */
export async function readCapped(r, max) {
  const len = Number(r.headers && typeof r.headers.get === 'function' ? r.headers.get('content-length') : NaN);
  if (Number.isFinite(len) && len > max) { try { await r.body?.cancel?.(); } catch { /* gone */ } throw new Error('too-big'); }
  if (!r.body || typeof r.body.getReader !== 'function') {   // no stream (an older engine, a test double): read it, then check
    const t = await r.text();
    if (t.length > max) throw new Error('too-big');
    return t;
  }
  const reader = r.body.getReader(), parts = [];
  let n = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    n += value.byteLength;
    if (n > max) { try { await reader.cancel(); } catch { /* gone */ } throw new Error('too-big'); }
    parts.push(value);
  }
  const all = new Uint8Array(n);
  let at = 0;
  for (const p of parts) { all.set(p, at); at += p.byteLength; }
  return new TextDecoder().decode(all);
}

/** GET with one deadline for the headers AND the body (the abort stops a body that trickles), and the byte cap. → { status, ok, text } */
async function getCapped(fetchFn, url, { timeoutMs, max }) {
  const ac = typeof AbortController === 'function' ? new AbortController() : null;
  let timer = null;
  const slow = new Promise((_, no) => { timer = setTimeout(() => { if (ac) ac.abort(); no(new Error('timeout')); }, timeoutMs); });
  slow.catch(() => {});   // the race below may already be settled when the deadline passes
  try {
    return await Promise.race([(async () => {
      const r = await fetchFn(url, { method: 'GET', credentials: 'omit', ...(ac ? { signal: ac.signal } : {}) });
      if (!r || !r.ok) return { ok: false, status: r ? r.status : 0, text: '' };
      return { ok: true, status: r.status, text: await readCapped(r, max) };
    })(), slow]);
  } finally { clearTimeout(timer); }
}

/** Where the Library lives for this page: its own origin on http(s), else the public site. */
export function libraryBase(loc = (typeof location !== 'undefined' ? location : null)) {
  return loc && /^https?:$/.test(loc.protocol) && loc.origin ? loc.origin : 'https://getcadcraft.com';
}

export async function loadPlants({ seed = [], fetchFn = (typeof fetch === 'function' ? fetch : null), base = libraryBase(), timeoutMs = 4000, app = '' } = {}) {
  const bundled = { species: seed, source: 'bundled', fromLibrary: 0, note: '', collection: false };
  if (!fetchFn || pageOffline()) return { ...bundled, note: 'offline' };
  // 0.9 C.3: with an `app`, the plants of that app's default Library collection(s) come first; none set (or none published) = every published plant, as before
  const get = async (path) => {
    try {
      const r = await getCapped(fetchFn, base + path, { timeoutMs, max: MAX_PLANTS_BYTES });
      if (!r.ok) return { note: 'http-' + r.status };
      const got = plantsFromCsv(r.text);
      return got.species.length ? { species: got.species } : { note: 'empty' };   // empty: the import has not been run
    } catch (e) { return { note: e && (e.message === 'too-big' || e.message === 'timeout') ? e.message : String((e && e.name) || e) }; }
  };
  let note = '';
  if (app) {
    const c = await get('/api/v1/library/collections/app/' + encodeURIComponent(app) + '/plants.csv');
    if (c.species) return { species: mergeLists(seed, c.species), source: 'library', fromLibrary: c.species.length, note: '', collection: true };
    note = c.note;
  }
  const g = await get(LIBRARY_PLANTS_PATH);
  if (g.species) return { species: mergeLists(seed, g.species), source: 'library', fromLibrary: g.species.length, note: '', collection: false };
  return { ...bundled, note: g.note || note };
}

/**
 * 0.9 C.3 (owner 2026-11-05): which Library collection is this app's default, so the app can say where its plants come from.
 *   loadDefaultCollection(app, { fetchFn, base, timeoutMs }) → { slug, name, revision, count } | null   (null: offline, unreachable, none set)
 * `GET /api/v1/library/collections/app/<app>` (public, CORS *). Only the first default collection is described.
 */
export async function loadDefaultCollection(app, { fetchFn = (typeof fetch === 'function' ? fetch : null), base = libraryBase(), timeoutMs = 4000 } = {}) {
  if (!fetchFn || pageOffline()) return null;
  try {
    const r = await getCapped(fetchFn, base + '/api/v1/library/collections/app/' + encodeURIComponent(app), { timeoutMs, max: MAX_COLLECTION_BYTES });
    if (!r.ok) return null;
    const c = JSON.parse(r.text)?.data?.collections?.[0];
    if (!c || typeof c.slug !== 'string') return null;
    return { slug: c.slug, name: String(c.name || c.slug), revision: Number(c.revision) || 1, count: Array.isArray(c.items) ? c.items.length : 0 };
  } catch { return null; }
}
