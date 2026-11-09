/* SPDX-License-Identifier: Apache-2.0 */
/**
 * climate-mount.js — CivilCraft's thin adapter for the shared climate-futures block (0.9 EG.46, session climate-futures-09). The engines and the block
 * are lib/climate (copied into ./climate/ by tools/climate/sync.mjs; never edit the copies). eg-ui.js shows it in Surface › More › Address to site,
 * under the site's rows: the flood level raised for a future climate (from FEMA's base flood elevation when the flood layer gave one), the wildfire
 * screening and the future weather file, present beside future.
 *
 *   siteClimate(ctx) → { block({ lat, lon, flood }) → element }     flood = { level, unit, source } | null; ctx = eg-ui's ctx (download, units)
 */
import { t, locale } from './i18n.js';
import { createClimate } from './climate/panel.js';

const CLS = { input: 'cv-input', select: 'select-cc cv-input', btn: 'btn-line btn-sm-cc', run: 'btn-plot btn-sm-cc', table: 'cv-table', note: 'cv-note', muted: 'cv-note', h: 'cv-h3' };

export function siteClimate(ctx) {
  const site = { lat: null, lon: null, flood: null };
  let C = null;
  const make = () => createClimate({ doc: document, t, locale: locale(), key: 'civilcraft.climate', show: ['flood', 'fire', 'heat'], cls: CLS,
    host: { latLon: () => (Number.isFinite(site.lat) && Number.isFinite(site.lon) ? { lat: site.lat, lon: site.lon } : null), flood: () => site.flood,
      download: (name, text) => ctx.download(name, new Blob([text], { type: 'text/plain' })) } });
  return {
    block({ lat, lon, flood = null } = {}) {
      const moved = site.lat !== lat || site.lon !== lon;
      Object.assign(site, { lat, lon, flood: flood || { level: NaN, unit: ctx.units?.() === 'm' ? 'm' : 'ft', source: '' } });
      C ||= make();
      if (moved) { C.state.fl.level = ''; C.state.flOut = null; C.state.fiOut = null; }
      return C.render();
    },
  };
}
