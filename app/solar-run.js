/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes; the words are the UI's t() keys (solar.*). */
/**
 * solar-run.js — one code path for ground PV arrays on terrain (0.8 EG.15, round 3 session civil_PART_3): the window, the assistant tools and the
 * Problems source all call these. DOM-free, no strings.
 *
 *   regionOf(project, array) → [{x,y}] | null           the parcel's or pad's corners (an arc in a parcel is taken as its chord), or the typed polygon
 *   keepOutsOf(project, array) → [[{x,y}]]               the pads and parcels the array leaves empty
 *   groundOf(project, array) → surface | null            'fg' the graded ground, 'eg' the existing, 'auto' = graded when there is one
 *   siteOf(project, array) → { lat, lon, tz?, north? } | null      the array's own place, else the project's coordinate system at the region's middle
 *   planArray(project, array) → plan                      solar.js planGround, memoised on the ground and the inputs
 *   summaryOf(plan, yieldResult?) → the numbers the file keeps
 */
import { planGround } from './solar.js';

export function regionOf(project, a) {
  const s = project.state, r = a.region || {};
  if (r.kind === 'poly') return r.pts || null;
  const list = r.kind === 'parcel' ? s.parcels : s.pads;
  const it = (list || []).find((x) => x.id === r.ref);
  return it && it.pts?.length >= 3 ? it.pts.map((p) => ({ x: p.x, y: p.y })) : null;
}
export function keepOutsOf(project, a) {
  const s = project.state, out = [];
  for (const id of a.keep || []) {
    const it = (s.pads || []).find((x) => x.id === id) || (s.parcels || []).find((x) => x.id === id);
    if (it && it.pts?.length >= 3) out.push(it.pts.map((p) => ({ x: p.x, y: p.y })));
  }
  return out;
}
export function groundOf(project, a) {
  const fg = project.graded().surface, eg = project.eg().surface;
  if (a.ground === 'fg') return fg || null;
  if (a.ground === 'eg') return eg || null;
  return fg || eg || null;
}
export async function crsSite(project, poly) {
  const crs = project.state.crs;
  if (!crs || !poly?.length) return null;
  try {
    const { frame } = await import('./crs.js');
    const c = poly.reduce((m, p) => ({ x: m.x + p.x / poly.length, y: m.y + p.y / poly.length }), { x: 0, y: 0 });
    const [lon, lat] = frame(crs).toLonLat(c.x, c.y);
    return Number.isFinite(lat) && Number.isFinite(lon) ? { lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5 } : null;
  } catch { return null; }
}
export const siteOf = (project, a) => a.site || null;

export function planArray(project, a) {
  const poly = regionOf(project, a);
  const key = 'solar:' + a.id;
  const deps = project.surfaceDeps() + '|' + project.gradeDeps() + '|' + JSON.stringify([a.region, a.keep, a.ground, a.site, a.module, a.options]) + '|' + JSON.stringify(poly) + '|' + JSON.stringify(keepOutsOf(project, a)) + project.state.units;
  return project.memo(key, deps, () => {
    const ground = groundOf(project, a);
    if (!poly) return { ok: false, error: 'solar.err.region', tables: [] };
    return planGround({ ...a.options, ground, polygon: poly, units: project.state.units, site: siteOf(project, a), module: a.module, keepOut: keepOutsOf(project, a) });
  });
}

export function summaryOf(plan, y = null) {
  if (!plan?.ok) return null;
  return { count: plan.count, modules: plan.modules, kwp: plan.kwp, ...(y?.ok ? { kwh: Math.round(y.res.total.acKwh) } : {}) };
}
