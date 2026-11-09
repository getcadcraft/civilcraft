/* SPDX-License-Identifier: Apache-2.0 */
/**
 * abl.js — the atmospheric boundary layer and the wind climate (0.9 SU.1119 wind; DOM-free, Apache-2.0).
 *   logProfile(z, z0, uRef, zRef = 10) → speed at height z over ground of roughness z0 (log law, zero at and below z0)
 *   powerProfile(z, alpha, uRef, zRef = 10)
 *   ROUGHNESS → named roughness lengths (Davenport-Wieringa classes, m)
 *   metToSite(u10Met, { z0Met = 0.03, z0Site, zg = 300 }) → speed at 10 m over the site: the weather-station speed is carried up to the gradient height zg over the station's
 *       roughness and brought back down over the site's (log law both ways; a standard engineering shortcut, not a full model of the boundary-layer depth).
 *   sectorOf(deg, n) → index of the wind-direction sector (sector k is centred on k * 360/n degrees, the direction the wind blows FROM, clockwise from north)
 *   windRose(epw, n) → { n, calm, speeds: per-hour array [{ sector, u }], freq[] }
 */
export const ROUGHNESS = { sea: 0.0002, open: 0.03, farmland: 0.1, suburban: 0.5, urban: 1.0, dense: 2.0 };

export function logProfile(z, z0, uRef, zRef = 10) {
  if (!(z0 > 0) || !(zRef > z0)) throw new Error('z0 must be positive and below the reference height');
  return z <= z0 ? 0 : uRef * Math.log(z / z0) / Math.log(zRef / z0);
}
export function powerProfile(z, alpha, uRef, zRef = 10) { return z <= 0 ? 0 : uRef * Math.pow(z / zRef, alpha); }

export function metToSite(u10Met, { z0Met = 0.03, z0Site = 0.5, zg = 300 } = {}) {
  return u10Met * (Math.log(zg / z0Met) / Math.log(10 / z0Met)) * (Math.log(10 / z0Site) / Math.log(zg / z0Site));
}

export const sectorOf = (deg, n) => Math.round((((deg % 360) + 360) % 360) / (360 / n)) % n;

/** Hourly wind from an EPW object (hours[].wd, hours[].ws). Hours with missing values or speed < 0.5 m/s are calm and carry no sector. */
export function windRose(epw, n) {
  const speeds = [], freq = new Array(n).fill(0); let calm = 0;
  for (const h of epw.hours) {
    if (h.ws === null || h.wd === null || h.ws < 0.5) { calm++; speeds.push({ sector: -1, u: h.ws ?? 0 }); continue; }
    const s = sectorOf(h.wd, n); freq[s]++; speeds.push({ sector: s, u: h.ws });
  }
  return { n, calm, speeds, freq: freq.map((c) => c / epw.hours.length) };
}
