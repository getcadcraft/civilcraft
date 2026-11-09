/* SPDX-License-Identifier: Apache-2.0 */
/**
 * epw.js — reads an EnergyPlus weather file (EPW, a typical year of 8760 hours) (0.9 SU.1119, cc-envir; DOM-free, no imports).
 * EPW is an open text format (CSV). Eight header lines, then one line per hour:
 *   LOCATION,city,state,country,source,WMO,latitude,longitude,time zone (hours from UTC),elevation (m)
 *   data columns used: 1 month, 2 day, 3 hour (1–24, the hour that ENDS at that time, local standard time), 7 dry bulb °C, 8 dew point °C,
 *   9 relative humidity %, 10 pressure Pa, 13 global horizontal, 14 direct normal, 15 diffuse horizontal (Wh/m² in the hour, taken as W/m²),
 *   16 horizontal infrared (Wh/m²), 21 wind direction, 22 wind speed (m/s, measured at 10 m). 9999 / 999 / 99.9 mean "missing".
 *
 *   parseEpw(text) → { location: { city, state, country, lat, lon, tz, elevation }, n, hours: [{ month, day, hour, ta, td, rh, p, ghi, dni, dhi, ir, wd, ws }] }
 *   epwSun(row, location) → { azimuth, altitude, zenith }  the sun at the middle of the hour (hour − 0.5, local standard time), reference year 2020
 *   epwSunDirs(epw) → array of suns for every row (use with shade.litFraction for yield on shaded surfaces)
 */
import { solarPosition } from './solar.js';

const num = (s, big) => { const v = Number(s); return Number.isFinite(v) && Math.abs(v) < big ? v : null; };

export function parseEpw(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  const loc = lines.findIndex((l) => /^LOCATION,/i.test(l));
  if (loc < 0) throw new Error('epw_no_location');
  const L = lines[loc].split(',');
  const lat = Number(L[6]), lon = Number(L[7]), tz = Number(L[8]);
  if (![lat, lon, tz].every(Number.isFinite) || Math.abs(lat) > 90 || Math.abs(lon) > 180 || Math.abs(tz) > 14) throw new Error('epw_bad_location');
  const location = { city: (L[1] || '').trim(), state: (L[2] || '').trim(), country: (L[3] || '').trim(), lat, lon, tz, elevation: Number(L[9]) || 0 };
  const start = lines.findIndex((l, i) => i >= loc && /^DATA PERIODS/i.test(l));
  if (start < 0) throw new Error('epw_no_data');
  const hours = [];
  for (let i = start + 1; i < lines.length; i++) {
    const c = lines[i].split(',');
    if (c.length < 22) continue;
    const month = Number(c[1]), day = Number(c[2]), hour = Number(c[3]);
    if (!(month >= 1 && month <= 12 && day >= 1 && day <= 31 && hour >= 1 && hour <= 24)) continue;
    hours.push({
      month, day, hour,
      ta: num(c[6], 90), td: num(c[7], 90), rh: num(c[8], 999), p: num(c[9], 999999),
      ghi: num(c[13], 9999) ?? 0, dni: num(c[14], 9999) ?? 0, dhi: num(c[15], 9999) ?? 0, ir: num(c[12], 9999),
      wd: num(c[20], 999), ws: num(c[21], 99),
    });
  }
  if (hours.length < 24 * 28) throw new Error('epw_too_short');
  return { location, n: hours.length, hours };
}

export function epwSun(row, location) {
  const ms = Date.UTC(2020, row.month - 1, row.day, 0, 0, 0) + ((row.hour - 0.5) - location.tz) * 3600000;
  const p = solarPosition(ms, location.lat, location.lon);
  return { azimuth: p.azimuth, altitude: p.altitude, zenith: p.zenith };
}

export function epwSunDirs(epw) { return epw.hours.map((r) => epwSun(r, epw.location)); }
