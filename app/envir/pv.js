/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pv.js — photovoltaic yield of a roof or a wall from a typical-year weather file (0.9 SU.1119, cc-envir; DOM-free; imports solar.js, epw.js).
 *
 * THE MODEL, plainly. For each hour of the file:
 *   1. The sun's position at the middle of the hour (epw.js).
 *   2. Plane-of-array irradiance, isotropic sky (Liu & Jordan 1960):
 *        POA = DNI·cosθ·lit + DHI·(1 + cosβ)/2·svf + GHI·ρ·(1 − cosβ)/2
 *      β = tilt from horizontal (0 flat roof, 90 wall), θ = angle between the sun and the surface normal (cosθ clipped at 0),
 *      lit = share of the surface the sun reaches (0..1, from the shade study; 1 when open), svf = sky view factor (1 when open),
 *      ρ = ground albedo (default 0.2). The beam part is reduced by an incidence-angle factor ASHRAE b0 = 0.05: 1 − b0·(1/cosθ − 1).
 *   3. Cell temperature, NOCT model: Tc = Ta + (NOCT − 20)/800 · POA        (NOCT default 45 °C; wind ignored, so a little pessimistic)
 *   4. DC power = kWp · POA/1000 · (1 + γ·(Tc − 25))                         (γ = −0.004 /°C, crystalline silicon)
 *   5. AC power = DC · (1 − losses) · inverter efficiency                    (losses 14 % covers soiling, wiring, mismatch, light-induced
 *      degradation and availability, the PVWatts default; inverter 96 %). No clipping, no snow, no degradation over the years.
 * A year of hours is summed to kWh. This is a planning estimate (typically within 5–10 % of a measured year on an open site for the same
 * climate), not a bankable one: a typical-meteorological-year file is not any real year. Anisotropic sky models (Perez) would raise
 * tilted surfaces by a few percent; that is the next refinement, not done.
 *
 *   planeOfArray({ ghi, dni, dhi, sun, tilt, azimuth, albedo = 0.2, lit = 1, svf = 1, b0 = 0.05 }) → { poa, beam, sky, ground, cosTheta }
 *   cellTemperature(ta, poa, noct = 45) → °C
 *   pvHour(opts) → { poa, kWac per kWp }
 *   yearYield({ epw, suns?, tilt, azimuth, kWp = 1, albedo, losses = 0.14, inverter = 0.96, gamma = -0.004, noct = 45, b0 = 0.05,
 *               lit: (i) => 0..1 | Float32Array | null, svf = 1 }) → { kWh, specific (kWh/kWp), poaKWhm2, monthly: [12 kWh], peakKw, hours: Float32Array kWh per hour }
 *   surfaceTilt(kind): flat roof 0, wall 90 (a helper for callers) — see ROOF / WALL
 */
import { epwSun } from './epw.js';

const R = Math.PI / 180;
export const ROOF = { tilt: 0 }, WALL = { tilt: 90 };

export function planeOfArray({ ghi, dni, dhi, sun, tilt, azimuth, albedo = 0.2, lit = 1, svf = 1, b0 = 0.05 }) {
  const b = tilt * R;
  const up = sun.altitude > 0;
  let cosT = 0;
  if (up) {
    const z = sun.zenith * R;
    cosT = Math.cos(z) * Math.cos(b) + Math.sin(z) * Math.sin(b) * Math.cos((sun.azimuth - azimuth) * R);
    if (cosT < 0) cosT = 0;
  }
  const iam = cosT > 0 ? Math.max(0, 1 - b0 * (1 / cosT - 1)) : 0;
  const beam = dni * cosT * iam * lit;
  const sky = dhi * ((1 + Math.cos(b)) / 2) * svf;
  const ground = ghi * albedo * ((1 - Math.cos(b)) / 2);
  return { poa: beam + sky + ground, beam, sky, ground, cosTheta: cosT };
}

export const cellTemperature = (ta, poa, noct = 45) => ta + ((noct - 20) / 800) * poa;

export function pvHour(o) {
  const { poa } = planeOfArray(o);
  const tc = cellTemperature(o.ta ?? 20, poa, o.noct ?? 45);
  const dc = (poa / 1000) * (1 + (o.gamma ?? -0.004) * (tc - 25));
  return { poa, kW: Math.max(0, dc) * (1 - (o.losses ?? 0.14)) * (o.inverter ?? 0.96) };
}

export function yearYield(o) {
  const { epw } = o;
  if (!epw?.hours?.length) throw new Error('no_weather');
  if (!(o.tilt >= 0 && o.tilt <= 180) || !Number.isFinite(o.azimuth)) throw new Error('bad_surface');
  const kWp = o.kWp ?? 1, n = epw.hours.length, hours = new Float32Array(n), monthly = new Array(12).fill(0);
  let kWh = 0, poaSum = 0, peak = 0;
  for (let i = 0; i < n; i++) {
    const r = epw.hours[i], sun = o.suns ? o.suns[i] : epwSun(r, epw.location);
    const lit = typeof o.lit === 'function' ? o.lit(i) : o.lit ? o.lit[i] : 1;
    const h = pvHour({ ghi: r.ghi, dni: r.dni, dhi: r.dhi, sun, tilt: o.tilt, azimuth: o.azimuth, albedo: o.albedo, lit, svf: o.svf ?? 1, b0: o.b0, ta: r.ta ?? 20, noct: o.noct, gamma: o.gamma, losses: o.losses, inverter: o.inverter });
    const e = h.kW * kWp;
    hours[i] = e; kWh += e; poaSum += h.poa / 1000; monthly[r.month - 1] += e;
    if (e > peak) peak = e;
  }
  return { kWh, specific: kWp ? kWh / kWp : 0, poaKWhm2: poaSum, monthly, peakKw: peak, hours };
}
