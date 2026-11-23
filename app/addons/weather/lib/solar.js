/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solar.js — where the sun is over a weather station, by clock time (0.11 Track WX, WX.7). Host-free.
 * The formulas are the published low-accuracy ones (the fractional-year series for the equation of time and the declination, as printed in
 * NOAA's "General Solar Position Calculations"); good to about a minute of time, which is what a chart of a typical year needs.
 *
 *   sunOf(day)                         → { decl (rad), eot (minutes) }                  day = 0…364, at local noon
 *   events(place, day)                 → { sunrise, sunset, noon, civil: [dawn, dusk], nautical: […], astro: […], dayLength }
 *                                        clock hours 0…24 in the station's standard time (no daylight saving), null when the sun does not
 *                                        cross that height on that day (polar day or night)
 *   altitude(place, day, clockHour)    → degrees above the horizon (negative = below)
 *   azimuth(place, day, clockHour)     → degrees clockwise from north
 *   keyDays(place)                     → { summer, autumn, winter, spring }             day of the year of each solstice and equinox, named for
 *                                        the station's own hemisphere
 *   dayOfYear(month, day) / dateOf(dayOfYear) → { month, day }                          a 365-day year
 *   place = { lat, lon (degrees north / east), tz (hours from UTC) }
 */
const R = Math.PI / 180;
export const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
export const MONTH_START = MONTH_DAYS.reduce((a, d) => (a.push(a[a.length - 1] + d), a), [0]);   // 13 entries, the last is 365

export function dayOfYear(month, day) { return MONTH_START[month - 1] + day - 1; }
export function dateOf(doy) {
  const d = ((Math.floor(doy) % 365) + 365) % 365;
  let m = 0;
  while (m < 11 && d >= MONTH_START[m + 1]) m++;
  return { month: m + 1, day: d - MONTH_START[m] + 1 };
}

export function sunOf(day, hour = 12) {
  const g = (2 * Math.PI / 365) * (day + (hour - 12) / 24);
  const eot = 229.18 * (0.000075 + 0.001868 * Math.cos(g) - 0.032077 * Math.sin(g) - 0.014615 * Math.cos(2 * g) - 0.040849 * Math.sin(2 * g));
  const decl = 0.006918 - 0.399912 * Math.cos(g) + 0.070257 * Math.sin(g) - 0.006758 * Math.cos(2 * g) + 0.000907 * Math.sin(2 * g) - 0.002697 * Math.cos(3 * g) + 0.00148 * Math.sin(3 * g);
  return { decl, eot };
}

/** minutes the sun runs ahead of the clock at this place */
const ahead = (place, eot) => eot + 4 * (place.lon - 15 * (place.tz || 0));

export function events(place, day) {
  const { decl, eot } = sunOf(day), lat = place.lat * R, noon = 12 - ahead(place, eot) / 60;
  const at = (zenith) => {
    const c = (Math.cos(zenith * R) - Math.sin(lat) * Math.sin(decl)) / (Math.cos(lat) * Math.cos(decl));
    if (!(c >= -1 && c <= 1)) return [null, null];
    const h = Math.acos(c) / R / 15;
    return [noon - h, noon + h];
  };
  const [sunrise, sunset] = at(90.833);
  return { sunrise, sunset, noon, civil: at(96), nautical: at(102), astro: at(108), dayLength: sunrise === null ? (lat * decl > 0 ? 24 : 0) : sunset - sunrise };
}

function angles(place, day, clock) {
  const { decl, eot } = sunOf(day, clock), lat = place.lat * R;
  const ha = (15 * (clock + ahead(place, eot) / 60 - 12)) * R;
  const sinAlt = Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const az = Math.atan2(-Math.sin(ha) * Math.cos(decl), Math.cos(lat) * Math.sin(decl) - Math.sin(lat) * Math.cos(decl) * Math.cos(ha));
  return { alt: alt / R, az: ((az / R) + 360) % 360 };
}
export const altitude = (place, day, clock) => angles(place, day, clock).alt;
export const azimuth = (place, day, clock) => angles(place, day, clock).az;

export function keyDays(place) {
  let hi = 0, lo = 0, up = 0, down = 0, prev = sunOf(364).decl;
  for (let d = 0; d < 365; d++) {
    const x = sunOf(d).decl;
    if (x > sunOf(hi).decl) hi = d;
    if (x < sunOf(lo).decl) lo = d;
    if (prev < 0 && x >= 0) up = d;
    if (prev > 0 && x <= 0) down = d;
    prev = x;
  }
  return place && place.lat < 0 ? { summer: lo, autumn: up, winter: hi, spring: down } : { summer: hi, autumn: down, winter: lo, spring: up };
}
