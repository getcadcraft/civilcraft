/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — data format and geometry only; the words are the host apps'. */
/**
 * site-context — what "Address to site" found around a point, as a small file another app can take as SUGGESTIONS (0.8 EG.63, civil_PART_4; rule 39: one
 * shared file, synced byte-identical into CivilCraft, BimCraft and ModelCraft by tools/site-context/sync.mjs; never edit a copy). No DOM, no imports.
 *
 * The file (`*.ccsite.json`, format `cc-site-context` v1) holds, in METRES east and north of the address point (equirectangular: 111,320 m per degree of
 * latitude and that times cos(latitude) per degree of longitude, good to a few metres within a few kilometres), the things the open sources gave:
 *   items: [{ id, kind: 'building'|'parcel'|'zoning'|'flood'|'soil', name, ring: [[x, y]…] (closed implied, ≤ 400 points), height (m | null when the source gave none),
 *             heightFrom: 'source'|'levels' (levels × 3 m is an ASSUMPTION), label (text from the source, ≤ 120) }]
 *   origin { lat, lon }, radius (m), attribution [text], made (ISO date)
 * Nothing is added to a model by reading it. `proposals()` lists what could be added and a person ticks what to keep (the apps' Suggest mode).
 *
 *   FORMAT · LEVEL_HEIGHT
 *   toLocal(origin, lon, lat) → [x, y]            fromLocal(origin, x, y) → [lon, lat]
 *   buildContext({ origin, radius, items: [{ kind, rings: [[[lon, lat]…]…], name, height, levels, label }], attribution, now }) → ctx
 *   cleanContext(obj) → ctx | null                         untrusted: bounded numbers, text cut, unknown fields dropped
 *   readContext(text) → { ok, ctx, why }                   why: 'size' | 'json' | 'format' | 'empty'
 *   proposals(ctx, { defaultHeight }) → [{ id, kind, name, ring, height, assumed, label, adds: boolean }]   adds: false = information only (zoning, flood, soil)
 *   pick(list, ids) → the proposals with those ids
 */
export const FORMAT = 'cc-site-context';
export const LEVEL_HEIGHT = 3;   // metres a storey is assumed to stand when only the number of levels is given (said in the proposal)
const KINDS = ['building', 'parcel', 'zoning', 'flood', 'soil'];
const MAX_ITEMS = 2000, MAX_RING = 400, MAX_BYTES = 8 * 1024 * 1024;
const M_PER_DEG = 111320;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const S = (v, n) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').slice(0, n);

export const toLocal = (o, lon, lat) => [(lon - o.lon) * M_PER_DEG * Math.cos((o.lat * Math.PI) / 180), (lat - o.lat) * M_PER_DEG];
export const fromLocal = (o, x, y) => [o.lon + x / (M_PER_DEG * Math.cos((o.lat * Math.PI) / 180)), o.lat + y / M_PER_DEG];

function thin(ring) {
  if (ring.length <= MAX_RING) return ring;
  const step = Math.ceil(ring.length / MAX_RING);
  return ring.filter((_, i) => i % step === 0);
}
const clean = (ring) => { const r = ring.filter((p) => Array.isArray(p) && fin(p[0]) && fin(p[1])); if (r.length > 1 && r[0][0] === r[r.length - 1][0] && r[0][1] === r[r.length - 1][1]) r.pop(); return r; };

export function buildContext({ origin, radius, items, attribution = [], now = new Date() }) {
  const out = [];
  let n = 0;
  for (const it of items || []) {
    if (!KINDS.includes(it.kind)) continue;
    for (const ring of it.rings || []) {
      const local = thin(clean(ring.map((p) => toLocal(origin, p[0], p[1]))));
      if (local.length < 3) continue;
      if (!local.some((p) => Math.hypot(p[0], p[1]) <= radius * 1.5)) continue;   // nowhere near the point
      if (out.length >= MAX_ITEMS) break;
      const h = fin(it.height) && it.height > 0 && it.height < 2000 ? it.height : null, lv = fin(it.levels) && it.levels > 0 && it.levels < 300 ? it.levels : null;
      out.push({ id: it.kind[0] + (++n), kind: it.kind, name: S(it.name, 80), ring: local.map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]),
        height: h !== null ? h : lv !== null ? lv * LEVEL_HEIGHT : null, heightFrom: h !== null ? 'source' : lv !== null ? 'levels' : null, label: S(it.label, 120) });
    }
  }
  return { format: FORMAT, v: 1, origin: { lat: origin.lat, lon: origin.lon }, radius, attribution: attribution.map((a) => S(a, 160)).slice(0, 20), made: now.toISOString().slice(0, 10), items: out };
}

export function cleanContext(o) {
  if (!o || typeof o !== 'object' || o.format !== FORMAT || o.v !== 1) return null;
  const org = o.origin;
  if (!org || !fin(org.lat) || !fin(org.lon) || Math.abs(org.lat) > 90 || Math.abs(org.lon) > 180) return null;
  const items = [];
  for (const it of Array.isArray(o.items) ? o.items.slice(0, MAX_ITEMS) : []) {
    if (!it || !KINDS.includes(it.kind) || !Array.isArray(it.ring)) continue;
    const ring = thin(clean(it.ring.map((p) => (Array.isArray(p) ? [p[0], p[1]] : [NaN, NaN])).filter((p) => fin(p[0]) && fin(p[1]) && Math.abs(p[0]) < 1e6 && Math.abs(p[1]) < 1e6)));
    if (ring.length < 3) continue;
    const h = fin(it.height) && it.height > 0 && it.height < 2000 ? it.height : null;
    items.push({ id: S(it.id, 12) || it.kind[0] + (items.length + 1), kind: it.kind, name: S(it.name, 80), ring, height: h, heightFrom: h === null ? null : it.heightFrom === 'levels' ? 'levels' : 'source', label: S(it.label, 120) });
  }
  const seen = new Set(); for (const it of items) { while (seen.has(it.id)) it.id += 'x'; seen.add(it.id); }
  return { format: FORMAT, v: 1, origin: { lat: org.lat, lon: org.lon }, radius: fin(o.radius) && o.radius > 0 && o.radius < 1e5 ? o.radius : 150,
    attribution: (Array.isArray(o.attribution) ? o.attribution : []).slice(0, 20).map((a) => S(a, 160)), made: S(o.made, 10), items,
    ...provenance(o) };
}

export function readContext(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) return { ok: false, why: 'size' };
  let o; try { o = JSON.parse(text); } catch { return { ok: false, why: 'json' }; }
  const ctx = cleanContext(o);
  if (!ctx) return { ok: false, why: 'format' };
  if (!ctx.items.length) return { ok: false, why: 'empty', ctx };
  return { ok: true, ctx };
}

export function proposals(ctx, { defaultHeight = 6 } = {}) {
  return (ctx?.items || []).map((it) => ({
    id: it.id, kind: it.kind, name: it.name, ring: it.ring, label: it.label,
    height: it.kind === 'building' ? (it.height !== null ? it.height : defaultHeight) : null,
    assumed: it.kind === 'building' ? (it.height === null ? 'default' : it.heightFrom === 'levels' ? 'levels' : null) : null,
    adds: it.kind === 'building' || it.kind === 'parcel',
  }));
}
export const pick = (list, ids) => list.filter((p) => ids.includes(p.id));

// ---------------------------------------------------------------------------------------------------------------------------------------------
// The site kept IN a project file (0.8 EG.63, "savable in the JSON file"): the typed address, the sources used with the day each was fetched and its
// licence, and what they returned, so a reopened or shared file keeps its site and nothing is fetched again. An optional key of the app's own file
// (`site`; older readers ignore it, so no new file version); the block carries its own `v`, and a reader of an older build REFUSES a newer one
// (cleanSite → why 'newer') rather than half-reading it.
//
//   site = { v: 1, address, label, origin { lat, lon }, radius, fetched (the newest source day), attribution [text],
//            sources: [{ id, name, licence, where, via: 'fetch' | 'file', fetched (YYYY-MM-DD), kinds [kind] }],
//            info: [{ id, key, value (number | text | { symbol, name, mukey }), src }],   // single answers: ground elevation, the soil at the point
//            items: [{ id, kind, name, ring, height, heightFrom, label }] }               // as the .ccsite.json holds them (metres from the point)
// Merge-friendly: every list is objects with a string `id`; an item's id comes from WHAT it is (kind + its outline), so two people who fetched the same
// feature get the same id and the file merges clean, and different features never collide.
//
//   SITE_VERSION · buildSite({ address, origin, radius, items, sources, info, attribution, now }) → site
//   cleanSite(obj) → { ok, site } | { ok: false, why: 'format' | 'newer' }       untrusted: bounded, text cut, unknown fields dropped
//   siteContext(site) → the cc-site-context object (so proposals() and the .ccsite.json writer take it as before)
export const SITE_VERSION = 1;
const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : '');
const slug = (v, n) => String(v ?? '').replace(/[^A-Za-z0-9._-]/g, '-').slice(0, n);

function itemId(it, used) {
  let h = 2166136261;
  const s = it.kind + JSON.stringify(it.ring);
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  let id = it.kind[0] + '-' + h.toString(36), n = 1;
  while (used.has(id)) id = it.kind[0] + '-' + h.toString(36) + '-' + (++n);
  used.add(id);
  return id;
}
const cleanInfoValue = (v) => {
  if (typeof v === 'number') return fin(v) ? v : null;
  if (typeof v === 'string') return S(v, 160);
  if (v && typeof v === 'object' && !Array.isArray(v)) { const o = {}; for (const k of ['symbol', 'name', 'mukey']) if (v[k] !== undefined && v[k] !== null) o[k] = S(v[k], 80); return Object.keys(o).length ? o : null; }
  return null;
};

export function buildSite({ address = '', origin, radius = 150, items = [], sources = [], info = [], attribution = [], now = new Date() }) {
  const used = new Set();
  const src = sources.map((s) => ({ id: slug(s.id, 40), name: S(s.name, 120), licence: S(s.licence, 160), where: S(s.where, 200), via: s.via === 'file' ? 'file' : 'fetch', fetched: day(s.fetched) || now.toISOString().slice(0, 10), kinds: (s.kinds || []).map((k) => slug(k, 20)).slice(0, 8) })).filter((s) => s.id);
  const cleanInfo = info.map((i) => ({ id: slug(i.id || i.key + '-' + (i.src || ''), 60), key: slug(i.key, 40), value: cleanInfoValue(i.value), src: slug(i.src, 40) })).filter((i) => i.id && i.key && i.value !== null);
  return {
    v: SITE_VERSION, address: S(address, 200), label: '', origin: { lat: origin.lat, lon: origin.lon }, radius,
    fetched: src.map((s) => s.fetched).sort().pop() || now.toISOString().slice(0, 10),
    attribution: attribution.map((a) => S(a, 160)).slice(0, 20), sources: src, info: cleanInfo,
    items: items.map((it) => ({ ...it, id: itemId(it, used) })),
  };
}

export function cleanSite(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o) || !Number.isInteger(o.v) || o.v < 1) return { ok: false, why: 'format' };
  if (o.v > SITE_VERSION) return { ok: false, why: 'newer' };
  const ctx = cleanContext({ ...o, format: FORMAT, v: 1 });
  if (!ctx) return { ok: false, why: 'format' };
  const { sources, info } = cleanProvenance(o);
  return { ok: true, site: { v: SITE_VERSION, address: S(o.address, 200), label: S(o.label, 120), origin: ctx.origin, radius: ctx.radius, fetched: day(o.fetched), attribution: ctx.attribution, sources, info, items: ctx.items } };
}

/** The sources and single answers of an untrusted object (a site or a .ccsite.json that carries them). */
function cleanProvenance(o) {
  const sources = [], seen = new Set();
  for (const s of Array.isArray(o.sources) ? o.sources.slice(0, 40) : []) {
    const id = slug(s?.id, 40); if (!id || seen.has(id)) continue; seen.add(id);
    sources.push({ id, name: S(s.name, 120), licence: S(s.licence, 160), where: S(s.where, 200), via: s.via === 'file' ? 'file' : 'fetch', fetched: day(s.fetched), kinds: (Array.isArray(s.kinds) ? s.kinds : []).slice(0, 8).map((k) => slug(k, 20)) });
  }
  const info = [], seenI = new Set();
  for (const i of Array.isArray(o.info) ? o.info.slice(0, 40) : []) {
    const id = slug(i?.id, 60), value = cleanInfoValue(i?.value); if (!id || seenI.has(id) || value === null) continue; seenI.add(id);
    info.push({ id, key: slug(i.key, 40), value, src: slug(i.src, 40) });
  }
  return { sources, info };
}
function provenance(o) {
  const { sources, info } = cleanProvenance(o), out = {};
  if (typeof o.address === 'string' && o.address.trim()) out.address = S(o.address, 200);
  if (sources.length) out.sources = sources;
  if (info.length) out.info = info;
  return out;
}

export function siteContext(site) {
  return { format: FORMAT, v: 1, origin: { ...site.origin }, radius: site.radius, attribution: site.attribution.slice(), made: site.fetched || '', items: site.items.map((it) => ({ ...it })),
    ...(site.address ? { address: site.address } : {}), ...(site.sources.length ? { sources: site.sources.map((x) => ({ ...x })) } : {}), ...(site.info.length ? { info: site.info.map((x) => ({ ...x })) } : {}) };
}
