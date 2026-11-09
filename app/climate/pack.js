/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and file fields; the panel turns them into words (strings.js). */
/**
 * pack.js — the future-climate DATA PACK (0.9 EG.46, session climate-futures-09; owner decision: CMIP6 downscaled data as a data add-on, rule 44). DOM-free, no imports.
 * The engines below never hold a climate number of their own: every figure comes from a pack, and every pack names its source, licence and date.
 *
 *   FORMAT 'cadcraft-climate-futures' v1:
 *   { format, version: 1, id, name, sample: bool, note,
 *     source: { name, url, license, retrieved }, method, baseline: '1995-2014',
 *     locations: [{ id, name, lat, lon, coastal: bool,
 *       futures: { '<scenario>-<horizon>': { window: '2041-2060', models, years,
 *                  dTmean: [12 °C], dTmax: [12 °C], dTmin: [12 °C],     monthly change of the mean, the daily maximum and the daily minimum
 *                  dRH: [12 % points], dGhiPct: [12 %] (optional),       monthly change of relative humidity (points) and of sunshine (per cent)
 *                  slrM, slrBasis,                                          sea-level rise (m) against the baseline, and where it came from
 *                  rx1dayPct, fwiPct } } }],                                wettest-day rainfall change (%) and fire-weather index change (%)
 *     global: { futures: { '<scenario>-<horizon>': { dT, slrM, rx1dayPct, basis } } } }      the fallback far from every location, said as such
 *
 *   SCENARIOS ['ssp245', 'ssp585'], HORIZONS [2050, 2080]
 *   readPack(textOrObject)                     → { ok, pack, errors }   validated; values outside plain physical ranges are refused, not clipped
 *   futureAt(pack, { lat, lon, locationId, scenario, horizon, maxKm }) → { ok, key, loc, distanceKm, global, d, notes }   d = the deltas (monthly arrays filled)
 *   nearest(pack, lat, lon)                    → { loc, km } | null
 *   distanceKm(lat1, lon1, lat2, lon2)          great circle, R = 6371 km
 */
export const FORMAT = 'cadcraft-climate-futures';
export const SCENARIOS = Object.freeze(['ssp245', 'ssp585']);
export const HORIZONS = Object.freeze([2050, 2080]);
export const WINDOWS = Object.freeze({ 2050: '2041-2060', 2080: '2071-2090' });
const MONTHLY = { dTmean: [-15, 20], dTmax: [-15, 20], dTmin: [-15, 20], dRH: [-50, 50], dGhiPct: [-60, 60] };
const SCALAR = { slrM: [-2, 5], rx1dayPct: [-80, 300], fwiPct: [-90, 1000], dT: [-5, 15] };
const clip = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f-\u009f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);

export function distanceKm(a1, o1, a2, o2) {
  const r = Math.PI / 180, dA = (a2 - a1) * r, dO = (o2 - o1) * r;
  const h = Math.sin(dA / 2) ** 2 + Math.cos(a1 * r) * Math.cos(a2 * r) * Math.sin(dO / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function cleanFuture(f, where, errors, global) {
  if (!f || typeof f !== 'object') { errors.push(where + ': not an object'); return null; }
  const out = { window: clip(f.window, 20), models: Number(f.models) || null, years: Number(f.years) || null, slrBasis: clip(f.slrBasis, 200), basis: clip(f.basis, 200) };
  if (!global) for (const [k, [lo, hi]] of Object.entries(MONTHLY)) {
    if (f[k] === undefined || f[k] === null) continue;
    if (!Array.isArray(f[k]) || f[k].length !== 12 || !f[k].every((v) => Number.isFinite(v) && v >= lo && v <= hi)) { errors.push(where + ': ' + k + ' must be 12 numbers between ' + lo + ' and ' + hi); continue; }
    out[k] = f[k].map(Number);
  }
  for (const [k, [lo, hi]] of Object.entries(SCALAR)) {
    if (f[k] === undefined || f[k] === null) continue;
    const v = Number(f[k]);
    if (!Number.isFinite(v) || v < lo || v > hi) { errors.push(where + ': ' + k + ' must be between ' + lo + ' and ' + hi); continue; }
    out[k] = v;
  }
  return out;
}

export function readPack(input) {
  const errors = [];
  let j = input;
  if (typeof input === 'string') {
    if (input.length > 5e6) return { ok: false, errors: ['big'] };
    try { j = JSON.parse(input); } catch (e) { return { ok: false, errors: ['json'] }; }
  }
  if (!j || j.format !== FORMAT) return { ok: false, errors: ['format'] };
  if (Number(j.version) !== 1) return { ok: false, errors: ['version'] };
  const src = j.source || {};
  const pack = { format: FORMAT, version: 1, id: clip(j.id, 60) || 'pack', name: clip(j.name, 120), sample: j.sample === true, note: clip(j.note, 600), method: clip(j.method, 900), baseline: clip(j.baseline, 20) || '1995-2014',
    source: { name: clip(src.name, 200), url: clip(src.url, 300), license: clip(src.license, 160), retrieved: clip(src.retrieved, 20) }, locations: [], global: { futures: {} } };
  if (!pack.source.name || !pack.source.license) errors.push('source: name and license are required');
  const keyOk = (k) => /^(ssp\d{3})-(\d{4})$/.test(k);
  for (const [i, L] of (Array.isArray(j.locations) ? j.locations.slice(0, 5000) : []).entries()) {
    const lat = Number(L?.lat), lon = Number(L?.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) { errors.push('location ' + (i + 1) + ': lat/lon'); continue; }
    const loc = { id: clip(L.id, 60) || 'loc' + (i + 1), name: clip(L.name, 120), lat, lon, coastal: L.coastal === true, futures: {} };
    for (const [k, f] of Object.entries(L.futures || {})) { if (!keyOk(k)) { errors.push(loc.id + ': key ' + k); continue; } const c = cleanFuture(f, loc.id + ' ' + k, errors, false); if (c) loc.futures[k] = c; }
    pack.locations.push(loc);
  }
  for (const [k, f] of Object.entries(j.global?.futures || {})) { if (!keyOk(k)) { errors.push('global: key ' + k); continue; } const c = cleanFuture(f, 'global ' + k, errors, true); if (c) pack.global.futures[k] = c; }
  if (!pack.locations.length && !Object.keys(pack.global.futures).length) errors.push('empty');
  return { ok: errors.length === 0, pack, errors };
}

export function nearest(pack, lat, lon) {
  let best = null;
  for (const loc of pack.locations) { const km = distanceKm(lat, lon, loc.lat, loc.lon); if (!best || km < best.km) best = { loc, km }; }
  return best;
}

const fill12 = (a, v) => (Array.isArray(a) ? a.slice() : Array(12).fill(v));

export function futureAt(pack, { lat, lon, locationId, scenario = 'ssp245', horizon = 2050, maxKm = 100 } = {}) {
  const key = scenario + '-' + horizon, notes = [];
  let loc = null, km = null;
  if (locationId) loc = pack.locations.find((l) => l.id === locationId) || null;
  if (!loc && Number.isFinite(lat) && Number.isFinite(lon)) { const n = nearest(pack, lat, lon); if (n && n.km <= maxKm) { loc = n.loc; km = n.km; } else if (n) notes.push('far'); }
  if (loc && km === null && Number.isFinite(lat) && Number.isFinite(lon)) km = distanceKm(lat, lon, loc.lat, loc.lon);
  const f = loc?.futures[key];
  if (f && f.dTmean) {
    const d = { ...f, dTmean: f.dTmean.slice(), dTmax: fill12(f.dTmax, null), dTmin: fill12(f.dTmin, null), dRH: fill12(f.dRH, 0), dGhiPct: fill12(f.dGhiPct, 0) };
    for (let m = 0; m < 12; m++) { if (d.dTmax[m] === null) d.dTmax[m] = d.dTmean[m]; if (d.dTmin[m] === null) d.dTmin[m] = d.dTmean[m]; }
    if (!f.dTmax || !f.dTmin) notes.push('shiftonly');
    const g = pack.global.futures[key];
    if (d.slrM === undefined && g?.slrM !== undefined) { d.slrM = g.slrM; d.slrBasis = g.basis || 'global'; notes.push('slrglobal'); }
    if (d.rx1dayPct === undefined && g?.rx1dayPct !== undefined) { d.rx1dayPct = g.rx1dayPct; notes.push('rainglobal'); }
    return { ok: true, key, scenario, horizon, loc, distanceKm: km, global: false, d, notes };
  }
  const g = pack.global.futures[key];
  if (!g) return { ok: false, key, scenario, horizon, loc, distanceKm: km, notes: notes.concat('nodata') };
  const dT = g.dT ?? 0;
  notes.push('global');
  return { ok: true, key, scenario, horizon, loc: null, distanceKm: null, global: true, notes,
    d: { window: g.window, dTmean: Array(12).fill(dT), dTmax: Array(12).fill(dT), dTmin: Array(12).fill(dT), dRH: Array(12).fill(0), dGhiPct: Array(12).fill(0), slrM: g.slrM, slrBasis: g.basis, rx1dayPct: g.rx1dayPct, fwiPct: g.fwiPct, basis: g.basis } };
}
