/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solar.js — where the sun is (0.9 SU.1119, cc-envir; DOM-free, no imports, canonical copy: lib/envir/).
 *
 * NOAA's solar calculator equations (Meeus, Astronomical Algorithms ch. 25, low-precision form): good to about a minute of arc for 1800–2100.
 * Angles in degrees. Azimuth is measured from north, clockwise (east = 90). Altitude is above the horizon.
 *
 *   solarPosition(when, lat, lon, { refraction = true }) → { azimuth, altitude, zenith, declination, eot }
 *       `when` is a Date or UTC milliseconds; lon is east-positive.
 *   sunVector({ azimuth, altitude }) → [east, north, up] unit vector toward the sun
 *   utcOffsetFor(date 'YYYY-MM-DD', zone) → hours | null    (a number is used as typed; a name like 'America/Denver' is looked up for the date)
 *   dayTrack(date, utcOffset, lat, lon, stepMin) → [{ min, ms, azimuth, altitude, zenith }]    local-day samples at the middle of each step
 *   sunriseSunset(date, utcOffset, lat, lon) → { sunrise, sunset, noon, daylight }   minutes of the local day (null at polar day/night), hours of daylight
 */
const R = Math.PI / 180;
const fin = Number.isFinite;

function refractionDeg(h) {
  if (h > 85) return 0;
  const te = Math.tan(h * R);
  let r;
  if (h > 5) r = 58.1 / te - 0.07 / te ** 3 + 0.000086 / te ** 5;
  else if (h > -0.575) r = 1735 + h * (-518.2 + h * (103.4 + h * (-12.79 + h * 0.711)));
  else r = -20.774 / te;
  return r / 3600;
}

export function solarPosition(when, lat, lon, opts = {}) {
  const ms = when instanceof Date ? when.getTime() : Number(when);
  if (!fin(ms) || !fin(lat) || !fin(lon)) throw new Error('bad_input');
  const jd = ms / 86400000 + 2440587.5, T = (jd - 2451545) / 36525;
  const L0 = (((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360) + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);
  const C = Math.sin(M * R) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M * R) * (0.019993 - 0.000101 * T) + Math.sin(3 * M * R) * 0.000289;
  const omega = 125.04 - 1934.136 * T, lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega * R);
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60, eps = eps0 + 0.00256 * Math.cos(omega * R);
  const decl = Math.asin(Math.sin(eps * R) * Math.sin(lambda * R)) / R;
  const y = Math.tan((eps / 2) * R) ** 2;
  const eot = (4 / R) * (y * Math.sin(2 * L0 * R) - 2 * e * Math.sin(M * R) + 4 * e * y * Math.sin(M * R) * Math.cos(2 * L0 * R) - 0.5 * y * y * Math.sin(4 * L0 * R) - 1.25 * e * e * Math.sin(2 * M * R));
  const d = new Date(ms), minutes = d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + d.getUTCMilliseconds() / 60000;
  let tst = (minutes + eot + 4 * lon) % 1440; if (tst < 0) tst += 1440;
  const ha = tst / 4 < 0 ? tst / 4 + 180 : tst / 4 - 180;
  const cosZ = Math.sin(lat * R) * Math.sin(decl * R) + Math.cos(lat * R) * Math.cos(decl * R) * Math.cos(ha * R);
  const zen = Math.acos(Math.max(-1, Math.min(1, cosZ))) / R, elev = 90 - zen;
  const sz = Math.sin(zen * R);
  let az;
  if (Math.abs(sz) < 1e-9) az = lat > decl ? 180 : 0;
  else {
    const c = (Math.sin(lat * R) * Math.cos(zen * R) - Math.sin(decl * R)) / (Math.cos(lat * R) * sz);
    const a = Math.acos(Math.max(-1, Math.min(1, c))) / R;
    az = ha > 0 ? (a + 180) % 360 : (540 - a) % 360;
  }
  const altitude = elev + (opts.refraction === false ? 0 : refractionDeg(elev));
  return { azimuth: az, altitude, zenith: 90 - altitude, declination: decl, eot };
}

export function sunVector({ azimuth, altitude }) {
  const a = azimuth * R, h = altitude * R;
  return [Math.cos(h) * Math.sin(a), Math.cos(h) * Math.cos(a), Math.sin(h)];
}

export function utcOffsetFor(date, zone) {
  if (typeof zone === 'number') return fin(zone) && Math.abs(zone) <= 14 ? zone : null;
  const s = String(zone ?? '').trim();
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) { const n = Number(s); return Math.abs(n) <= 14 ? n : null; }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!m || !s) return null;
  try {
    const noon = Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0, 0);
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: s, timeZoneName: 'longOffset' }).formatToParts(new Date(noon));
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    if (tz === 'GMT') return 0;
    const g = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(tz);
    return g ? (g[1] === '-' ? -1 : 1) * (Number(g[2]) + Number(g[3] || 0) / 60) : null;
  } catch { return null; }
}

export function dayTrack(date, utcOffset, lat, lon, stepMin = 15) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!m) throw new Error('bad_date');
  if (!(stepMin >= 1 && stepMin <= 240)) throw new Error('bad_step');
  const day0 = Date.UTC(+m[1], +m[2] - 1, +m[3]) - utcOffset * 3600000;
  const n = Math.round(1440 / stepMin), out = [];
  for (let k = 0; k < n; k++) {
    const min = (k + 0.5) * stepMin, ms = day0 + min * 60000;
    const p = solarPosition(ms, lat, lon);
    out.push({ min, ms, azimuth: p.azimuth, altitude: p.altitude, zenith: p.zenith });
  }
  return out;
}

/** Sunrise and sunset by bisection on the altitude of the sun's centre crossing −0.833° (refraction + the solar disc). */
export function sunriseSunset(date, utcOffset, lat, lon) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!m) throw new Error('bad_date');
  const day0 = Date.UTC(+m[1], +m[2] - 1, +m[3]) - utcOffset * 3600000;
  const alt = (min) => solarPosition(day0 + min * 60000, lat, lon, { refraction: false }).altitude + 0.833;
  const step = 5, up = [], down = [];
  for (let a = 0; a < 1440; a += step) {
    const f0 = alt(a), f1 = alt(a + step);
    if ((f0 < 0) === (f1 < 0)) continue;
    let lo = a, hi = a + step;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; ((alt(mid) < 0) === (f0 < 0)) ? (lo = mid) : (hi = mid); }
    (f0 < 0 ? up : down).push((lo + hi) / 2);
  }
  const sunrise = up.length ? up[0] : null, sunset = down.length ? down[down.length - 1] : null;
  let noon = 0, best = -91;
  for (let a = 0; a < 1440; a += 1) { const h = alt(a); if (h > best) { best = h; noon = a; } }
  let daylight = 0;
  for (let a = 0; a < 1440; a++) if (alt(a + 0.5) >= 0) daylight++;
  return { sunrise, sunset, noon, daylight: daylight / 60 };
}
