/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pv-sun.js — the sun and the light on a tilted plane for solar PV (0.8 EG.15, session `energy_PART_2`). No DOM, no model. The sun's position is
 * render/sun.js (NOAA); the clear sky is daylight-bim-sky.js `clearSky` (Hottel); everything else is published maths, cited at each function.
 *
 *   KLEIN_DAYS, DAYS_IN_MONTH               the day of each month that stands for it (Klein 1977; Duffie & Beckman, Solar Engineering of Thermal Processes, Table 1.6.1)
 *   solarToClock(site, month, day, solarHour, tz) → the clock hour for a solar-time hour (so hour angle ω = 15° × (solar hour − 12))
 *   sunAt(site, month, day, solarHour, { tz }) → { alt, az, dir (model axes), cosZ, omega, n } | null when the sun is down
 *   dailyExtraterrestrial(lat, n) → kWh/m² on a horizontal plane in a day  (D&B eq. 1.10.3)
 *   monthlyDiffuseFraction(kt, wsDeg) → Hd/H (Erbs, Klein & Duffie 1982, Solar Energy 28:293; D&B eq. 2.12.1–2)
 *   dayIrradiance(site, month, sky, { tz }) → { month, day, hours: [{ h, sun, ghi, dhi, dni }], ghiKwh, notes, problems }  (W/m²; one entry per solar hour 0…23, mid-hour)
 *       sky = { mode: 'clear', factor = 1, climate?, altitudeKm? }   the Hottel clear sky times `factor` — a ceiling, not a forecast
 *           | { mode: 'monthly', ghi: [12 numbers] kWh/m² per day }   the person's own monthly means, spread over the day by Collares-Pereira & Rabl
 *             (1979, Solar Energy 22:155; D&B eq. 2.13.2–2.13.3 and 2.14.1) and split by Erbs; the hourly values are scaled so their sum is exactly the typed day.
 *   poa(irr, sun, normal, { albedo, b0 }) → { beam, sky, ground, total, cosI, iam }  Liu & Jordan isotropic sky: beam = DNI cos θ, sky = DHI (1 + cos β)/2,
 *       ground = GHI ρ (1 − cos β)/2; the beam is further reduced by the ASHRAE incidence-angle modifier 1 − b0 (1/cos θ − 1) (De Soto et al. 2006).
 */
import { sunPosition, dayOfYear } from './render/sun.js';
import { clearSky, climateFor, GSC } from './daylight-bim-sky.js';

const RAD = Math.PI / 180;
export const KLEIN_DAYS = Object.freeze([[1, 17], [2, 16], [3, 16], [4, 15], [5, 15], [6, 11], [7, 17], [8, 16], [9, 15], [10, 15], [11, 14], [12, 10]]);
export const DAYS_IN_MONTH = Object.freeze([31, 28.25, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
/** The site's compass frame in the model's plan: north (unit, default +Y) and east (to the right of north). */
export function frameOf(site) {
  const n = site?.north && Math.hypot(site.north[0], site.north[1]) > 1e-9 ? site.north : [0, 1];
  const l = Math.hypot(n[0], n[1]);
  const north = [n[0] / l, n[1] / l];
  return { north, east: [north[1], -north[0]] };
}

/** The clock hour (the sun.js argument) at which solar time is `solarHour`: clock = solar − (equation of time + 4 lon − 60 tz) / 60. */
export function solarToClock(site, month, day, solarHour, tz = Math.round(site.lon / 15)) {
  let clock = solarHour;
  for (let k = 0; k < 2; k++) {
    const s = sunPosition({ month, day, hour: clock, lat: site.lat, lon: site.lon, tz });
    clock = solarHour - (s.eqtime + 4 * site.lon - 60 * tz) / 60;
  }
  return clock;
}
/** The sun at solar hour `h` of a day, in the model's axes (its north from site.north); null when it is not up. */
export function sunAt(site, month, day, solarHour, { tz = Math.round(site.lon / 15), year = 2026 } = {}) {
  const s = sunPosition({ month, day, hour: solarToClock(site, month, day, solarHour, tz), lat: site.lat, lon: site.lon, tz, year });
  if (!(s.altitude > 0)) return null;
  const F = frameOf(site);
  const dir = [F.east[0] * s.dir[0] + F.north[0] * s.dir[1], F.east[1] * s.dir[0] + F.north[1] * s.dir[1], s.dir[2]];
  return { alt: s.altitude, az: s.azimuth, dir, cosZ: s.dir[2], omega: 15 * (solarHour - 12), decl: s.declination, n: dayOfYear(month, day, year) };
}

/** Daily extraterrestrial radiation on a horizontal plane, kWh/m²/day (D&B eq. 1.10.3), day-of-year n. */
export function dailyExtraterrestrial(lat, n) {
  const phi = lat * RAD, dec = 23.45 * Math.sin(2 * Math.PI * (284 + n) / 365) * RAD;
  const ws = Math.acos(clamp(-Math.tan(phi) * Math.tan(dec), -1, 1));
  const gon = GSC * (1 + 0.033 * Math.cos(2 * Math.PI * n / 365));
  return 24 / Math.PI * gon / 1000 * (Math.cos(phi) * Math.cos(dec) * Math.sin(ws) + ws * Math.sin(phi) * Math.sin(dec));
}
/** Hd/H for a month's mean clearness index kt (Erbs et al. 1982, monthly form). wsDeg: the sunset hour angle. */
export const monthlyDiffuseFraction = (kt, wsDeg) => (wsDeg <= 81.4 ? 1.391 - 3.56 * kt + 4.189 * kt ** 2 - 2.137 * kt ** 3 : 1.311 - 3.022 * kt + 3.427 * kt ** 2 - 1.821 * kt ** 3);

/** Collares-Pereira & Rabl's share of the day's total falling in an hour centred on hour angle ω (deg): { rt (total), rd (diffuse) }. */
function cpr(omegaDeg, wsDeg) {
  const w = omegaDeg * RAD, ws = wsDeg * RAD, den = Math.sin(ws) - ws * Math.cos(ws);
  if (!(den > 1e-9)) return { rt: 0, rd: 0 };
  const a = 0.409 + 0.5016 * Math.sin(ws - 60 * RAD), b = 0.6609 - 0.4767 * Math.sin(ws - 60 * RAD);
  const top = Math.cos(w) - Math.cos(ws);
  if (top <= 0) return { rt: 0, rd: 0 };
  return { rt: Math.max(0, Math.PI / 24 * (a + b * Math.cos(w)) * top / den), rd: Math.PI / 24 * top / den };
}

/**
 * The irradiance each hour of a month's representative day. Hours are solar-time hours 0…23, each described at its middle (h + 0.5), W/m² = kWh/m² in that hour.
 * `problems` lists typed numbers that cannot be real (a monthly total above the sun's own, say).
 */
export function dayIrradiance(site, month, sky = { mode: 'clear' }, { tz = Math.round(site.lon / 15) } = {}) {
  const [, day] = KLEIN_DAYS[month - 1];
  const hours = [], notes = [], problems = [];
  const n = dayOfYear(month, day);
  const mk = (h) => ({ h, sun: sunAt(site, month, day, h + 0.5, { tz }), ghi: 0, dhi: 0, dni: 0 });
  for (let h = 0; h < 24; h++) hours.push(mk(h));
  if (sky.mode === 'monthly') {
    const H = Number(sky.ghi?.[month - 1]);
    if (!(H >= 0) || H > 12) { problems.push({ code: 'sky.range', month, value: sky.ghi?.[month - 1] }); return { month, day, hours, ghiKwh: 0, notes, problems }; }
    const up = hours.filter((x) => x.sun);
    if (!up.length || H === 0) return { month, day, hours, ghiKwh: 0, notes, problems };
    const phi = site.lat * RAD, dec = up[0].sun.decl * RAD, wsDeg = Math.acos(clamp(-Math.tan(phi) * Math.tan(dec), -1, 1)) / RAD;
    const H0 = dailyExtraterrestrial(site.lat, n), kt = H / H0;
    if (kt > 0.85) problems.push({ code: 'sky.kt', month, kt: Math.round(kt * 100) / 100 });
    const fd = clamp(monthlyDiffuseFraction(Math.min(kt, 0.85), wsDeg), 0.05, 1), Hd = fd * H;
    let st = 0, sd = 0;
    const parts = up.map((x) => { const c = cpr(x.sun.omega, wsDeg); st += c.rt; sd += c.rd; return c; });
    up.forEach((x, i) => {
      const I = st > 0 ? H * parts[i].rt / st : 0, Id = sd > 0 ? Math.min(I, Hd * parts[i].rd / sd) : 0;   // kWh/m² in the hour = kW/m² → W/m² × 1000
      x.ghi = I * 1000; x.dhi = Id * 1000;
      x.dni = x.sun.cosZ > 0.05 ? Math.min((x.ghi - x.dhi) / x.sun.cosZ, 0.8 * GSC * (1 + 0.033 * Math.cos(2 * Math.PI * n / 365))) : 0;
    });
    notes.push({ key: 'pv.sky.spread', vars: { month } });
  } else {
    const f = Number.isFinite(sky.factor) ? sky.factor : 1, cl = sky.climate || climateFor(site.lat, month);
    for (const x of hours) {
      if (!x.sun) continue;
      const c = clearSky(n, x.sun.cosZ, { altitudeKm: (sky.altitudeKm ?? (site.elevation || 0) / 1000), climate: cl });
      x.dni = c.Gbn * f; x.dhi = c.Gdh * f; x.ghi = c.Gbh * f + c.Gdh * f;
    }
    notes.push({ key: 'pv.note.clear' });
  }
  return { month, day, hours, ghiKwh: hours.reduce((s, x) => s + x.ghi, 0) / 1000, notes, problems };
}

/** The light on a plane with unit normal `normal` (model axes) in an hour: { beam, sky, ground, total, cosI, iam } W/m². Needs irr.sun. */
export function poa(irr, normal, { albedo = 0.2, b0 = 0.05 } = {}) {
  const s = irr.sun;
  if (!s) return { beam: 0, sky: 0, ground: 0, total: 0, cosI: 0, iam: 0 };
  const cosI = s.dir[0] * normal[0] + s.dir[1] * normal[1] + s.dir[2] * normal[2];
  const cosB = normal[2];
  const iam = cosI > 0 ? Math.max(0, 1 - b0 * (1 / cosI - 1)) : 0;
  const beamRaw = cosI > 0 ? irr.dni * cosI : 0;
  const skyD = irr.dhi * (1 + cosB) / 2, ground = irr.ghi * albedo * (1 - cosB) / 2;
  return { beam: beamRaw, beamIam: beamRaw * iam, sky: skyD, ground, total: beamRaw * iam + skyD + ground, totalNoIam: beamRaw + skyD + ground, cosI: Math.max(0, cosI), iam };
}
