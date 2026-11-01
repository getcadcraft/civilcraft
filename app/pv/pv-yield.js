/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pv-yield.js — the energy a PV array gives in a year (0.8 EG.15, session `energy_PART_2`). No DOM, no model. Every input is shown in the result and
 * every default is labelled: this is an early-design estimate, not a bankable yield report.
 *
 *   DEFAULT_LOSSES                          { soiling, wiring, mismatch, availability, inverter } — starter values, labelled
 *   cellTemperature(tAmb, g, noct) → °C     T_cell = T_amb + (NOCT − 20) / 800 · G    (the NOCT model, Duffie & Beckman §23.3; G in W/m²)
 *   moduleDc(g, tCell, module) → W          P = Wp · G/1000 · (1 + γ (T_cell − 25))   (the module's rating at 1000 W/m², 25 °C, linear in temperature)
 *   yieldOf({ arrays, site, sky, tAmb, albedo, losses, inverter, shade, tz }) → result
 *       arrays   [{ id, name, module, modules (count), tilt, azimuth, normal }]
 *       shade    { [arrayId]: frac[12][24] } from pv-shade.js (beam shading), or none
 *       tAmb     a number (°C) or twelve numbers, the daytime air temperature of each month
 *       inverter { pacKw (total AC rating, clips the sum), eta } — optional
 *   Per hour of each month's representative day: plane-of-array light (pv-sun poa, with the incidence-angle modifier), the beam times (1 − shade),
 *   cell temperature, DC power; the losses multiply (soiling, mismatch, wiring, inverter efficiency, availability); the AC sum is clipped at the inverter
 *   rating; a day's energy times the days in the month. The performance ratio is AC energy ÷ (kWp × the year's unshaded plane-of-array kWh/m²), IEC 61724 style.
 */
import { dayIrradiance, poa, DAYS_IN_MONTH } from './pv-sun.js';

export const DEFAULT_LOSSES = Object.freeze({ soiling: 0.02, wiring: 0.02, mismatch: 0.02, availability: 0.01, inverter: 0.97, label: 'starter values — replace with your project\'s losses' });
export const DEFAULT_TAMB = 20;
const r1 = (x) => Math.round(x * 10) / 10;
const r3 = (x) => Math.round(x * 1000) / 1000;

export const cellTemperature = (tAmb, g, noct) => tAmb + (noct - 20) / 800 * g;
export const moduleDc = (g, tCell, m) => m.wp * (g / 1000) * (1 + m.gammaPmax * (tCell - 25));

const tAt = (tAmb, m) => (Array.isArray(tAmb) ? Number(tAmb[m]) : Number(tAmb)) ;

/** The sun and light of every month once (they do not depend on the array): [{ irr: day }]. */
export function skyYear(site, sky, { tz } = {}) {
  const months = [];
  for (let m = 1; m <= 12; m++) months.push(dayIrradiance(site, m, sky, { tz }));
  return months;
}
export const sunGridOf = (months) => months.map((d) => d.hours.map((x) => x.sun));

export function yieldOf({ arrays, site, sky = { mode: 'clear' }, tAmb = DEFAULT_TAMB, albedo = 0.2, losses = DEFAULT_LOSSES, inverter = null, shade = {}, tz, months = null }) {
  const L = { ...DEFAULT_LOSSES, ...losses };
  const days = months || skyYear(site, sky, { tz });
  const problems = [...days.flatMap((d) => d.problems)];
  const chain = (1 - L.soiling) * (1 - L.mismatch) * (1 - L.wiring) * (1 - L.availability) * (L.inverter ?? inverter?.eta ?? 0.97);
  const out = [], sum = { dcKwh: 0, acKwh: 0, kwp: 0, poa: 0 };
  // per array, per month, per hour: AC power (kW) before clipping
  const hourly = arrays.map(() => days.map(() => new Array(24).fill(0)));
  arrays.forEach((a, ai) => {
    const n = a.modules, kwp = n * a.module.wp / 1000, sh = shade[a.id] || null;
    const mo = [];
    let dcY = 0, poaY = 0, poaFree = 0, effFree = 0, beamY = 0, beamLost = 0;
    days.forEach((d, mi) => {
      const T = tAt(tAmb, mi);
      let dcDay = 0, effDay = 0, effFreeDay = 0, irrDay = 0, beamDay = 0, lostDay = 0;
      for (const x of d.hours) {
        if (!x.sun) continue;
        const p = poa(x, a.normal, { albedo, b0: a.module.iamB0 });
        const f = sh?.[mi]?.[x.h] ?? 0;
        const g = p.beam > 0 ? p.beamIam * (1 - f) + p.sky + p.ground : p.sky + p.ground;
        const tc = cellTemperature(T, g, a.module.noct);
        const w = n * Math.max(0, moduleDc(g, tc, a.module));
        dcDay += w / 1000;
        hourly[ai][mi][x.h] = w / 1000 * chain;
        effDay += g / 1000; effFreeDay += p.total / 1000; irrDay += p.totalNoIam / 1000; beamDay += p.beamIam / 1000; lostDay += p.beamIam * f / 1000;
      }
      const k = DAYS_IN_MONTH[mi];
      mo.push({ month: mi + 1, poaKwhM2: r1(irrDay * k), shadeLossPct: r1(effFreeDay > 0 ? (effFreeDay - effDay) / effFreeDay * 100 : 0), beamLossPct: r1(beamDay > 0 ? lostDay / beamDay * 100 : 0), dcKwh: r1(dcDay * k), acKwh: 0 });
      dcY += dcDay * k; poaY += effDay * k; poaFree += irrDay * k; effFree += effFreeDay * k; beamY += beamDay * k; beamLost += lostDay * k;
    });
    out.push({ id: a.id, name: a.name, kwp: r3(kwp), modules: n, tilt: a.tilt, azimuth: a.azimuth, monthly: mo, _dcY: dcY, _poaY: poaY, _poaFree: poaFree, _effFree: effFree, _beamY: beamY, _beamLost: beamLost });
  });
  // clip at the inverters' rating, then month by month
  const pac = inverter?.pacKw > 0 ? inverter.pacKw : Infinity;
  let clippedKwh = 0, unclippedKwh = 0;
  const monthTot = days.map(() => ({ dc: 0, ac: 0, poa: 0 }));
  days.forEach((d, mi) => {
    const k = DAYS_IN_MONTH[mi], scale = new Array(24).fill(1);
    for (let h = 0; h < 24; h++) {
      const tot = arrays.reduce((s, _, ai) => s + hourly[ai][mi][h], 0);
      if (tot > pac) { scale[h] = pac / tot; clippedKwh += (tot - pac) * k; }
      unclippedKwh += tot * k;
    }
    arrays.forEach((_, ai) => { out[ai].monthly[mi].acKwh = r1(hourly[ai][mi].reduce((s, v, h) => s + v * scale[h], 0) * k); });
  });
  for (const o of out) {
    const ac = o.monthly.reduce((s, m) => s + m.acKwh, 0), dc = o._dcY;
    o.annual = { poaKwhM2: r1(o._poaFree), poaFreeKwhM2: r1(o._poaFree), dcKwh: Math.round(dc), acKwh: Math.round(ac), specificKwhKwp: o.kwp > 0 ? Math.round(ac / o.kwp) : 0,
      pr: o.kwp > 0 && o._poaFree > 0 ? r3(ac / (o.kwp * o._poaFree)) : 0, shadeLossPct: r1(o._effFree > 0 ? (o._effFree - o._poaY) / o._effFree * 100 : 0), beamLossPct: r1(o._beamY > 0 ? o._beamLost / o._beamY * 100 : 0) };
    sum.dcKwh += dc; sum.acKwh += ac; sum.kwp += o.kwp; sum.poa += o._poaFree * o.kwp;
    delete o._dcY; delete o._poaY; delete o._poaFree; delete o._effFree; delete o._beamY; delete o._beamLost;
    void monthTot;
  }
  const total = { kwp: r3(sum.kwp), dcKwh: Math.round(sum.dcKwh), acKwh: Math.round(sum.acKwh), specificKwhKwp: sum.kwp > 0 ? Math.round(sum.acKwh / sum.kwp) : 0,
    pr: sum.poa > 0 ? r3(sum.acKwh / sum.poa) : 0, clippedKwh: Math.round(clippedKwh), clippedPct: unclippedKwh > 0 ? r1(clippedKwh / unclippedKwh * 100) : 0,
    monthly: days.map((_, mi) => ({ month: mi + 1, acKwh: r1(out.reduce((s, o) => s + o.monthly[mi].acKwh, 0)) })) };
  total.shadeLossPct = sum.poa > 0 ? r1(out.reduce((s, o) => s + o.annual.shadeLossPct * o.kwp * o.annual.poaFreeKwhM2, 0) / sum.poa) : 0;
  const notes = [{ key: sky.mode === 'monthly' ? 'pv.note.diffuse' : 'pv.note.clear' }, { key: 'pv.note.linear' }, { key: 'pv.note.temp' }];
  if (sky.mode === 'monthly') notes.unshift({ key: 'pv.note.diffuse' });
  const starter = arrays.some((a) => a.module.starter) || (losses && losses.label === DEFAULT_LOSSES.label) || !!inverter?.starter;
  if (starter) notes.push({ key: 'pv.note.starter' });
  return { arrays: out, total, inputs: { sky: sky.mode, albedo, tAmb, losses: L, chain: r3(chain), inverterKw: Number.isFinite(pac) ? pac : null }, notes: dedupe(notes), problems };
}
const dedupe = (n) => { const s = new Set(); return n.filter((x) => (s.has(x.key) ? false : (s.add(x.key), true))); };
