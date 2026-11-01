/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol only: the words a person reads are in plant-table-ui.js. */
/**
 * plant-library.js — the person's OWN plant list in the Library, from the app (0.8 LA.6, round 5, session `civil-mount_PART_5`). DOM-free; fetch and the
 * token are handed in, so bin/test-landscape.mjs runs it in Node against a stand-in server. The server side is `GET|POST /api/v1/library/my-plants`
 * (api/v1/library/my-plants.php over LibraryPlants::mine / saveMine; Bearer, a 'full' token like every library write).
 *
 *   loadMine({ fetchFn, base, token }) → { ok, rows: [{ sp, status, visibility }], why }     the person's own plant items as species
 *   saveList({ fetchFn, base, token, species, licenseId }) → { ok, added, updated, unchanged, pending, refused: [{ key, why }], message, why }
 *   mergeMine(own, rows) → { list, added, updated }        the Library's rows laid over the project's own list: the Library's fields win, the project's
 *                                                          own version-2 fields (cultivars, supplied sizes, density, spec, own symbol/model) are kept
 *   forLibrary(species) → { list, kept }                   what the Library holds is the version-1 record; `kept` = rows whose version-2 fields stay in the project
 *
 * `why` is one of 'signin' (no token, 401, 403 = this token cannot write), 'throttled', 'offline', 'bad' (anything else). The Library keeps the
 * version-1 plant record only (LibraryItemFormat::plant); cultivars, supplied sizes, density and spec notes stay in the project and in the plants file.
 */
import { cleanSpecies } from './plants.js';

export const MINE_PATH = '/api/v1/library/my-plants';
export const V2_KEYS = ['cultivars', 'supplies', 'density', 'spec', 'own'];

export function forLibrary(species) {
  let kept = 0;
  const list = (species || []).map((sp) => {
    const o = { ...sp };
    if (V2_KEYS.some((k) => o[k] != null)) kept++;
    for (const k of V2_KEYS) delete o[k];
    return o;
  });
  return { list, kept };
}

function why(status) { return status === 401 || status === 403 ? 'signin' : status === 429 ? 'throttled' : 'bad'; }

async function call(fetchFn, base, token, method, body) {
  if (!token) return { ok: false, why: 'signin' };
  if (!fetchFn) return { ok: false, why: 'offline' };
  let r;
  try {
    r = await fetchFn(base + MINE_PATH, { method, credentials: 'omit', headers: { Accept: 'application/json', Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}) });
  } catch { return { ok: false, why: 'offline' }; }
  let j = null;
  try { j = await r.json(); } catch { j = null; }
  if (!r.ok) return { ok: false, why: why(r.status), message: String(j?.error || j?.message || '').slice(0, 300) };
  return { ok: true, data: j?.data || {} };
}

export async function loadMine({ fetchFn = (typeof fetch === 'function' ? fetch : null), base = '', token = '' } = {}) {
  const r = await call(fetchFn, base, token, 'GET');
  if (!r.ok) return r;
  const rows = [];
  for (const raw of Array.isArray(r.data.species) ? r.data.species.slice(0, 5000) : []) {
    const c = cleanSpecies(raw);   // untrusted, like a plants file
    if (c.sp) rows.push({ sp: c.sp, status: String(raw.status || '').slice(0, 20), visibility: String(raw.visibility || '').slice(0, 10) });
  }
  return { ok: true, rows };
}

export async function saveList({ fetchFn = (typeof fetch === 'function' ? fetch : null), base = '', token = '', species = [], licenseId = 'CC0-1.0' } = {}) {
  const { list } = forLibrary(species);
  const r = await call(fetchFn, base, token, 'POST', { species: list, license_id: licenseId, attest: true });
  if (!r.ok) return r;
  const d = r.data;
  return { ok: true, added: +d.added || 0, updated: +d.updated || 0, unchanged: +d.unchanged || 0, pending: +d.pending || 0,
    refused: (Array.isArray(d.refused) ? d.refused : []).slice(0, 50).map((x) => ({ key: String(x.key || '').slice(0, 64), why: String(x.why || '').slice(0, 200) })), message: String(d.message || '').slice(0, 300) };
}

export function mergeMine(own, rows) {
  const list = (own || []).slice(), at = new Map(list.map((s, i) => [s.key, i]));
  let added = 0, updated = 0;
  for (const { sp } of rows || []) {
    if (at.has(sp.key)) {
      const was = list[at.get(sp.key)], next = { ...sp };
      for (const k of V2_KEYS) if (was[k] != null) next[k] = was[k];
      if (JSON.stringify(forLibrary([was]).list[0]) !== JSON.stringify(forLibrary([next]).list[0])) updated++;
      list[at.get(sp.key)] = next;
    } else { at.set(sp.key, list.length); list.push(sp); added++; }
  }
  return { list, added, updated };
}
