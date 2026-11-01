/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sun.js — where the sun is, for shadows. No DOM.
 *
 * Source: NOAA Global Monitoring Laboratory, "General Solar Position Calculations"
 * (gml.noaa.gov/grad/solcalc/solareqns.PDF): fractional year γ, equation of time and declination
 * from Spencer's Fourier series, true solar time from longitude and time zone, then the zenith and
 * azimuth angles. Accurate to a fraction of a degree, which is plenty for massing shadows.
 * Refraction is ignored. The model's north is +Y (green), east is +X (red).
 *
 *   sunPosition({month, day, hour, lat, lon, tz, year}) → {altitude, azimuth (degrees from north,
 *                clockwise), dir: unit vector toward the sun in model space, up: altitude > 0}
 */

const RAD = Math.PI / 180;

export function dayOfYear(month, day, year = 2026) {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const cum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return cum[month - 1] + day + (leap && month > 2 ? 1 : 0);
}

export function sunPosition({ month = 6, day = 21, hour = 12, lat = 40, lon = -105, tz = -7, year = 2026 } = {}) {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const N = dayOfYear(month, day, year);
  const g = (2 * Math.PI / (leap ? 366 : 365)) * (N - 1 + (hour - 12) / 24);
  const eqtime = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g)
    - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  const offset = eqtime + 4 * lon - 60 * tz;                // minutes
  const tst = hour * 60 + offset;                           // true solar time, minutes
  const ha = (tst / 4 - 180) * RAD;                         // hour angle
  const phi = lat * RAD;
  const cosZ = Math.sin(phi) * Math.sin(decl) + Math.cos(phi) * Math.cos(decl) * Math.cos(ha);
  const zen = Math.acos(Math.max(-1, Math.min(1, cosZ)));
  const altitude = 90 - zen / RAD;
  // azimuth measured from north, clockwise
  const az = Math.atan2(Math.sin(ha), Math.cos(ha) * Math.sin(phi) - Math.tan(decl) * Math.cos(phi)) / RAD + 180;
  const azimuth = ((az % 360) + 360) % 360;
  const alt = altitude * RAD, a = azimuth * RAD;
  return {
    altitude, azimuth, declination: decl / RAD, eqtime,
    dir: [Math.sin(a) * Math.cos(alt), Math.cos(a) * Math.cos(alt), Math.sin(alt)],
    up: altitude > 0,
  };
}
