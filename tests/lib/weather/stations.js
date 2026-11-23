/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stations.js — the station index of a weather set and the fetch of one station's year (0.11 Track WX, WX.3). Host-free.
 *
 * A weather SET is content, never code: an index file plus one gzip-packed .epw per station, served from the CDN (the site keeps a copy as
 * the fallback). The index carries each station's design figures (made by tools/weather/build.mjs with derive.js summary()), so a person
 * gets design temperatures and degree-days from the small index alone; the year itself (about 1.5 MB, 300 KB packed) is fetched only when
 * something needs the hours.
 *
 *   index = { format: 'cadcraft-weather-index', version: 1, id, name, made, source: { name, url, licence, attribution, note },
 *             stations: [{ id, name, region, country, wmo, lat, lon, elev, tz, file, bytes, packed, sha256, summary }] }
 *   cleanIndex(raw)                        → { ok, errors, index }       refuses anything it does not understand; nothing is guessed
 *   nearest(index | [indexes], lat, lon, { n = 5, maxKm = 400 }) → [{ station, set, km, dElev }]   by great-circle distance
 *   distanceKm(lat1, lon1, lat2, lon2)
 *   loadYear(set, station, { bases, fetch, gunzip, sha256 }) → { text, from }    tries each base in turn (CDN first); the bytes must match the
 *       index's SHA-256 or the file is refused. gunzip(Uint8Array) → Uint8Array and sha256(Uint8Array) → hex default to the platform's own
 *       (DecompressionStream, crypto.subtle), so nothing is bundled.
 */
export const FORMAT = 'cadcraft-weather-index';
const ID_RE = /^[a-z0-9][a-z0-9._-]{1,79}$/, FILE_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{1,119}\.epw(\.gz)?$/, SHA_RE = /^[0-9a-f]{64}$/;
const str = (x, max) => (typeof x === 'string' ? x.trim().slice(0, max) : '');
const fin = (x) => typeof x === 'number' && Number.isFinite(x);

export function cleanIndex(raw) {
  const errors = [];
  const bad = (m) => { errors.push(m); };
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || raw.version !== 1) return { ok: false, errors: ['format'], index: null };
  if (!ID_RE.test(String(raw.id || ''))) bad('id');
  const s = raw.source || {};
  const source = { name: str(s.name, 200), url: str(s.url, 300), licence: str(s.licence, 600), attribution: str(s.attribution, 600), note: str(s.note, 600) };
  if (!source.name || !/^https:\/\//.test(source.url) || !source.licence || !source.attribution) bad('source');
  const seen = new Set(), stations = [];
  if (!Array.isArray(raw.stations) || !raw.stations.length || raw.stations.length > 20000) bad('stations');
  for (const [i, t] of (Array.isArray(raw.stations) ? raw.stations : []).entries()) {
    const id = String(t?.id || '');
    if (!ID_RE.test(id) || seen.has(id)) { bad('station ' + i + ': id'); continue; }
    if (!fin(t.lat) || Math.abs(t.lat) > 90 || !fin(t.lon) || Math.abs(t.lon) > 180) { bad(id + ': place'); continue; }
    if (!FILE_RE.test(String(t.file || '')) || !SHA_RE.test(String(t.sha256 || '')) || !(t.bytes > 0 && t.bytes < 8e6)) { bad(id + ': file'); continue; }
    const m = t.summary;
    if (!m || !fin(m.heat?.t996) || !fin(m.cool?.t004) || !fin(m.hdd) || !fin(m.cdd)) { bad(id + ': summary'); continue; }
    seen.add(id);
    stations.push({ id, name: str(t.name, 120), region: str(t.region, 40), country: str(t.country, 40), wmo: str(t.wmo, 20), lat: t.lat, lon: t.lon, elev: fin(t.elev) ? t.elev : null, tz: fin(t.tz) ? t.tz : null,
      file: t.file, bytes: t.bytes, packed: t.packed > 0 ? t.packed : null, sha256: t.sha256, summary: m });
  }
  if (errors.length) return { ok: false, errors, index: null };
  return { ok: true, errors, index: { format: FORMAT, version: 1, id: raw.id, name: str(raw.name, 120), made: str(raw.made, 30), source, stations } };
}

export function distanceKm(lat1, lon1, lat2, lon2) {
  const r = Math.PI / 180, a = Math.sin(((lat2 - lat1) * r) / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 6371.0088 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function nearest(sets, lat, lon, { n = 5, maxKm = 400, elev = null } = {}) {
  const out = [];
  for (const set of Array.isArray(sets) ? sets : [sets]) for (const station of set?.stations || []) {
    const km = distanceKm(lat, lon, station.lat, station.lon);
    if (km <= maxKm) out.push({ station, set, km, dElev: elev !== null && station.elev !== null ? station.elev - elev : null });
  }
  return out.sort((a, b) => a.km - b.km).slice(0, n);
}

async function platformGunzip(bytes) {
  if (typeof DecompressionStream !== 'function') throw Object.assign(new Error('gunzip'), { key: 'wx.err.gunzip' });
  const s = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Uint8Array(await new Response(s).arrayBuffer());
}
async function platformSha(bytes) {
  const d = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function loadYear(set, station, { bases, fetch: f = globalThis.fetch, gunzip = platformGunzip, sha256 = platformSha } = {}) {
  let last = null;
  for (const base of bases || []) {
    try {
      const r = await f(String(base).replace(/\/+$/, '') + '/' + set.id + '/' + station.file, { credentials: 'omit' });
      if (!r.ok) { last = Object.assign(new Error('http ' + r.status), { key: 'wx.err.fetch' }); continue; }
      let bytes = new Uint8Array(await r.arrayBuffer());
      if (bytes.length > 8e6) throw Object.assign(new Error('big'), { key: 'wx.err.big' });
      // a server (or the browser) may have unpacked the gzip already: the magic number says which we hold
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) bytes = await gunzip(bytes);
      if ((await sha256(bytes)) !== station.sha256) { last = Object.assign(new Error('sha'), { key: 'wx.err.sha' }); continue; }
      return { text: new TextDecoder('latin1').decode(bytes), from: base };
    } catch (e) { last = e.key ? e : Object.assign(new Error(String(e.message || e)), { key: 'wx.err.fetch' }); }
  }
  throw last || Object.assign(new Error('no base'), { key: 'wx.err.fetch' });
}
