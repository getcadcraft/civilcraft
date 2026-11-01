/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plants-live.js — 0.8 LD.1 (session `landscape_PART_4`). The plants list the apps use: read live from the Library at run time, the bundled
 * seed list (plants-seed.json, CC0) as the fallback. DOM-free; shared by CivilCraft's Landscape workspace, BimCraft's library view and
 * ModelCraft's starter library (rule 39), so there is one copy of this logic.
 *
 *   loadPlants({ seed, fetchFn, base, timeoutMs }) → Promise<{ species, source: 'library' | 'bundled', fromLibrary, note }>
 *
 * The Library side is `GET /api/v1/library/plants.csv` (public, CORS *, published plant items only). The result is the bundled list with the
 * Library's rows laid over it (same key = the Library's row wins), so a Library that has only some of the species, none (the import
 * `bin/library-import-plants.php` not run yet), or that cannot be reached (offline, a desktop window, a slow network) never costs the person a plant.
 */
import { plantsFromCsv, mergeLists } from './plants.js';

export const LIBRARY_PLANTS_PATH = '/api/v1/library/plants.csv';

/** Where the Library lives for this page: its own origin on http(s), else the public site. */
export function libraryBase(loc = (typeof location !== 'undefined' ? location : null)) {
  return loc && /^https?:$/.test(loc.protocol) && loc.origin ? loc.origin : 'https://getcadcraft.com';
}

export async function loadPlants({ seed = [], fetchFn = (typeof fetch === 'function' ? fetch : null), base = libraryBase(), timeoutMs = 4000 } = {}) {
  const bundled = { species: seed, source: 'bundled', fromLibrary: 0, note: '' };
  if (!fetchFn || (typeof navigator !== 'undefined' && navigator.onLine === false)) return { ...bundled, note: 'offline' };
  let timer = null;
  try {
    const ac = typeof AbortController === 'function' ? new AbortController() : null;
    const slow = new Promise((_, no) => { timer = setTimeout(() => { if (ac) ac.abort(); no(new Error('timeout')); }, timeoutMs); });
    const r = await Promise.race([fetchFn(base + LIBRARY_PLANTS_PATH, { method: 'GET', credentials: 'omit', ...(ac ? { signal: ac.signal } : {}) }), slow]);
    if (!r || !r.ok) return { ...bundled, note: 'http-' + (r ? r.status : 0) };
    const text = await r.text();
    if (text.length > 16 * 1024 * 1024) return { ...bundled, note: 'too-big' };
    const got = plantsFromCsv(text);
    if (!got.species.length) return { ...bundled, note: 'empty' };   // the import has not been run: the bundled list stands
    return { species: mergeLists(seed, got.species), source: 'library', fromLibrary: got.species.length, note: '' };
  } catch (e) {
    return { ...bundled, note: String((e && e.name) || e) };
  } finally { if (timer) clearTimeout(timer); }
}
