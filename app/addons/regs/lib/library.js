/* SPDX-License-Identifier: Apache-2.0 */
/**
 * library.js — the regions installed from the CadCraft Library (0.8 REG.1, owner decision 8: one engine add-on, packs are Library data
 * installed per region; docs/0.8-ZA-STANDARDS.md). The installed packs are kept on this computer in ONE place for every app
 * (localStorage `cc-regs:library`, the same origin as every app), so a region is picked once and works offline.
 *
 *   apiBase() → 'https://getcadcraft.com' (or this page's origin when it is the site)
 *   countries({ fetchJson }) → Promise<[{ country, name, packs, bytes, paid, updated_at }]>     GET /api/v1/library/regulations
 *   countryPacks(cc, { fetchJson }) → Promise<[pack row]>                                        GET /api/v1/library/regulations/<CC>
 *   install(cc, { fetchJson }) → Promise<{ ok, name, packs, failed[] }>   every pack of the country: its item.json, checked (kind
 *                                     regulation, the pack cleaned by regs.js, the id the list names) — all or nothing for the region
 *   remove(cc) · installed() → { CC: { name, installed_at, packs: [{ pack, uuid, version, sha256, item_url }] } } · installedPacks()
 *   regionCodes() → [CC…] | null (null = never picked) · onExternalChange(fn) → stop()   (another app's tab changed the store)
 *   refreshInstalled({ maxAgeMs }) → the installed regions brought up to the Library's versions (the add-on calls it on start)
 * Store shape: { format: 'cc-regs-installed', version: 1, regions: {…} }. Anything else read from the store is dropped.
 */
import { cleanPack } from './regs.js';

const KEY = 'cc-regs:library';
const FORMAT = 'cc-regs-installed';

export function apiBase() {
  try { if (/^https?:$/.test(location.protocol) && /(^|\.)getcadcraft\.com$|^localhost$|^127\.0\.0\.1$/.test(location.hostname)) return location.origin; } catch (e) { /* not a page */ }
  return 'https://getcadcraft.com';
}
const defaultFetch = (url) => fetch(url, { credentials: 'omit' }).then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });

let mem = null;   // when localStorage is not there (a test, a locked-down browser): this session only
function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = mem; }
  if (raw === null && mem) raw = mem;
  if (!raw || raw.format !== FORMAT || raw.version !== 1 || !raw.regions || typeof raw.regions !== 'object') return null;
  const out = {};
  for (const [cc, r] of Object.entries(raw.regions)) {
    if (!/^[A-Z]{2}$/.test(cc) || !r || !Array.isArray(r.packs)) continue;
    const packs = r.packs.map((x) => {
      const c = cleanPack(x && x.pack);
      return c.ok && c.pack.jurisdiction.country === cc ? { pack: c.pack, uuid: String(x.uuid || ''), version: Number(x.version) || null, sha256: String(x.sha256 || ''), item_url: String(x.item_url || '') } : null;
    }).filter(Boolean);
    out[cc] = { name: String(r.name || cc).slice(0, 80), installed_at: String(r.installed_at || ''), packs };
  }
  return out;
}
function save(regions) {
  const doc = { format: FORMAT, version: 1, regions };
  mem = doc;
  try { localStorage.setItem(KEY, JSON.stringify(doc)); } catch (e) { /* kept for this session only */ }
}

export const installed = () => load() || {};
export const regionCodes = () => { const r = load(); return r ? Object.keys(r).sort() : null; };
export const installedPacks = () => Object.entries(installed()).flatMap(([cc, r]) => r.packs.map((p) => ({ ...p, region: cc })));

export async function countries({ fetchJson = defaultFetch } = {}) {
  const j = await fetchJson(apiBase() + '/api/v1/library/regulations');
  return Array.isArray(j?.data?.countries) ? j.data.countries.filter((c) => /^[A-Z]{2}$/.test(c.country)) : [];
}
export async function countryPacks(cc, { fetchJson = defaultFetch } = {}) {
  const j = await fetchJson(apiBase() + '/api/v1/library/regulations/' + encodeURIComponent(cc));
  return Array.isArray(j?.data?.packs) ? j.data.packs : [];
}

export async function install(cc, { fetchJson = defaultFetch } = {}) {
  if (!/^[A-Z]{2}$/.test(cc)) return { ok: false, name: cc, packs: [], failed: ['bad country'] };
  const j = await fetchJson(apiBase() + '/api/v1/library/regulations/' + cc);
  const rows = Array.isArray(j?.data?.packs) ? j.data.packs : [];
  const packs = [], failed = [];
  await Promise.all(rows.map(async (row) => {
    try {
      const url = String(row.file_url || '');
      if (!/^https:\/\/[^\s"<>]+\/item\.json$/.test(url) && !url.startsWith(apiBase() + '/')) throw new Error('no item.json link');
      const item = await fetchJson(url.replace(/^https:\/\/getcadcraft\.com/, apiBase()));
      const c = cleanPack(item && item.kind === 'regulation' ? item.regulation : null);
      if (!c.ok) throw new Error(c.errors[0] || 'not a pack');
      if (c.pack.id !== row.pack_id || c.pack.jurisdiction.country !== cc) throw new Error('the pack is not the one listed');
      packs.push({ pack: c.pack, uuid: String(row.uuid || ''), version: Number(row.version) || null, sha256: String(row.sha256 || ''), item_url: String(row.item_url || '') });
    } catch (e) { failed.push((row && row.name ? row.name + ': ' : '') + (e && e.message)); }
  }));
  if (failed.length || !packs.length) return { ok: false, name: j?.data?.name || cc, packs: [], failed: failed.length ? failed : ['no packs for this country yet'] };
  const order = rows.map((r) => r.pack_id);
  packs.sort((a, b) => order.indexOf(a.pack.id) - order.indexOf(b.pack.id));
  const regions = installed();
  regions[cc] = { name: String(j?.data?.name || cc), installed_at: new Date().toISOString(), packs };
  save(regions);
  return { ok: true, name: regions[cc].name, packs, failed: [] };
}

export function remove(cc) {
  const regions = installed();
  delete regions[cc];
  save(regions);
}

export function onExternalChange(fn) {
  const h = (e) => { if (e.key === KEY) fn(); };
  try { window.addEventListener('storage', h); } catch (e) { return () => {}; }
  return () => window.removeEventListener('storage', h);
}

/** Brings every installed region up to the Library's current packs (owner 2026-10-27: an install from the first day still had the 8-rule
 *  IRC). A region is fetched again only when the Library lists a pack it lacks, lacks one it has, or another version/sha256 of one;
 *  all or nothing per region, so a failed update keeps the copy that works. At most once per `maxAgeMs` for every app (the stamp lives in
 *  the store's own key `cc-regs:checked`); 0 = always. → { checked, updated: [region name], failed: [text] } */
export async function refreshInstalled({ fetchJson = defaultFetch, maxAgeMs = 6 * 3600e3 } = {}) {
  const STAMP = 'cc-regs:checked';
  let last = 0;
  try { last = Number(localStorage.getItem(STAMP)) || 0; } catch (e) { /* no storage: check */ }
  if (maxAgeMs > 0 && Date.now() - last < maxAgeMs) return { checked: false, updated: [], failed: [] };
  try { localStorage.setItem(STAMP, String(Date.now())); } catch (e) { /* this session only */ }
  const updated = [], failed = [];
  for (const [cc, here] of Object.entries(installed())) {
    let rows;
    try { rows = await countryPacks(cc, { fetchJson }); } catch (e) { failed.push(here.name + ': ' + (e && e.message)); continue; }
    const same = rows.length === here.packs.length && rows.every((row) => here.packs.some((p) => p.pack.id === row.pack_id
      && p.version === (Number(row.version) || null) && (!row.sha256 || p.sha256 === String(row.sha256))));
    if (same) continue;
    try {
      const r = await install(cc, { fetchJson });
      if (r.ok) updated.push(r.name); else failed.push(r.name + ': ' + r.failed[0]);
    } catch (e) { failed.push(here.name + ': ' + (e && e.message)); }
  }
  return { checked: true, updated, failed };
}
