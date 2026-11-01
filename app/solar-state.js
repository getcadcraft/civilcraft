/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — field names; nothing here is read by a person. */
/**
 * solar-state.js — the ground PV arrays a project keeps (0.8 EG.15, round 3 session civil_PART_3), under one key `solar`: { arrays: [array] }.
 * An array keeps its INPUTS and the last numbers; the tables are worked out again from the ground when they are needed (deterministic, so the file stays small).
 *   array = { id 'sa<n>', name, region { kind 'parcel' | 'pad' | 'poly', ref?, pts? }, keep [id of a pad or parcel left empty], ground 'auto' | 'eg' | 'fg',
 *             site { lat, lon, tz?, north? }, module (pv.js cleanModule row), options (solar.js cleanOptions), summary { count, modules, kwp, pitch, kwh? } }
 * The file is untrusted: numbers are bounded, text is cut, unknown fields dropped.
 */
import { cleanModule, STARTER_MODULE } from './pv/pv.js';
import { cleanOptions } from './solar.js';

const fin = (v) => v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v));
const N = (v, d, lo = -1e9, hi = 1e9) => (fin(v) ? Math.min(hi, Math.max(lo, Number(v))) : d);
const S = (v, n = 80) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

export function cleanSolarArray(a, id) {
  if (!a || typeof a !== 'object') return null;
  const r = a.region && typeof a.region === 'object' ? a.region : {};
  const kind = ['parcel', 'pad', 'poly'].includes(r.kind) ? r.kind : null;
  if (!kind) return null;
  const region = { kind };
  if (kind === 'poly') region.pts = (Array.isArray(r.pts) ? r.pts : []).slice(0, 2000).filter((p) => p && fin(p.x) && fin(p.y)).map((p) => ({ x: N(p.x, 0), y: N(p.y, 0) }));
  else region.ref = S(r.ref, 40);
  if (kind === 'poly' && region.pts.length < 3) return null;
  const m = cleanModule(a.module || STARTER_MODULE);
  const site = a.site && fin(a.site.lat) && fin(a.site.lon) && Math.abs(a.site.lat) <= 90 && Math.abs(a.site.lon) <= 180
    ? { lat: N(a.site.lat, 0, -90, 90), lon: N(a.site.lon, 0, -180, 180), ...(fin(a.site.tz) ? { tz: N(a.site.tz, 0, -12, 14) } : {}), ...(Array.isArray(a.site.north) && fin(a.site.north[0]) && fin(a.site.north[1]) ? { north: [N(a.site.north[0], 0), N(a.site.north[1], 1)] } : {}) } : null;
  const sm = a.summary && typeof a.summary === 'object' ? a.summary : null;
  return {
    id: /^sa\d{1,9}$/.test(String(a.id)) ? String(a.id) : id(a.id, 'sa'), name: S(a.name, 80) || 'Solar array', region,
    keep: (Array.isArray(a.keep) ? a.keep : []).slice(0, 200).map((k) => S(k, 40)).filter(Boolean),
    ground: ['eg', 'fg'].includes(a.ground) ? a.ground : 'auto', site, module: m.module, options: cleanOptions(a.options || {}),
    ...(sm ? { summary: { count: N(sm.count, 0, 0, 1e6), modules: N(sm.modules, 0, 0, 1e8), kwp: N(sm.kwp, 0, 0, 1e9), ...(fin(sm.kwh) ? { kwh: N(sm.kwh, 0, 0, 1e12) } : {}) } } : {}),
  };
}

export function cleanSolar(obj, id) {
  if (!obj || typeof obj !== 'object') return null;
  const arrays = (Array.isArray(obj.arrays) ? obj.arrays : []).slice(0, 100).map((a) => cleanSolarArray(a, id)).filter(Boolean);
  return arrays.length ? { arrays } : null;
}
