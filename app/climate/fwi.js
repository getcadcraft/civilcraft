/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fwi.js — the Canadian Forest Fire Weather Index System, daily (0.9 EG.46). DOM-free, no imports. Written from the published equations:
 * Van Wagner, C.E. 1987, "Development and structure of the Canadian Forest Fire Weather Index System", Forestry Technical Report 35, and
 * Van Wagner & Pickett 1985 (the FORTRAN program and its test day); day-length factors outside 46° N from Lawson & Armitage 2008 (as the
 * cffdrs package uses them). Used by tools/climate/build-pack.mjs to turn daily model weather into a fire-weather change for a pack.
 *
 *   fwiDay(prev, { T, rh, ws, rain, month, lat })  → { ffmc, dmc, dc, isi, bui, fwi }
 *        T noon °C, rh noon %, ws noon 10 m wind km/h, rain 24 h mm; prev = yesterday's { ffmc, dmc, dc } (START when none)
 *   fwiSeries(days, lat)                          → [{ ...indices }] one per day, started from START on the first day
 *   START = { ffmc: 85, dmc: 6, dc: 15 }           the standard spring start-up values
 */
export const START = Object.freeze({ ffmc: 85, dmc: 6, dc: 15 });

const EL = {   // DMC effective day length by month and latitude band
  n46: [6.5, 7.5, 9, 12.8, 13.9, 13.9, 12.4, 10.9, 9.4, 8, 7, 6],
  n20: [7.9, 8.4, 8.9, 9.5, 9.9, 10.2, 10.1, 9.7, 9.1, 8.6, 8.1, 7.8],
  s20: [10.1, 9.6, 9.1, 8.5, 8.1, 7.8, 7.9, 8.3, 8.9, 9.4, 9.9, 10.2],
  s40: [11.5, 10.5, 9.2, 7.9, 6.8, 6.2, 6.5, 7.4, 8.7, 10, 11.2, 11.8],
};
const FL = { n: [-1.6, -1.6, -1.6, 0.9, 3.8, 5.8, 6.4, 5, 2.4, 0.4, -1.6, -1.6], s: [6.4, 5, 2.4, 0.4, -1.6, -1.6, -1.6, -1.6, -1.6, 0.9, 3.8, 5.8] };
const dayLength = (lat, m) => (lat > 33 ? EL.n46 : lat > 0 ? EL.n20 : lat > -30 ? EL.s20 : EL.s40)[m - 1];
const dayFactor = (lat, m) => (lat > 20 ? FL.n[m - 1] : lat <= -20 ? FL.s[m - 1] : 1.4);

function ffmcCalc(f0, T, H, W, ro) {
  let mo = (147.2 * (101 - f0)) / (59.5 + f0);
  if (ro > 0.5) {
    const rf = ro - 0.5;
    let mr = mo + 42.5 * rf * Math.exp(-100 / (251 - mo)) * (1 - Math.exp(-6.93 / rf));
    if (mo > 150) mr += 0.0015 * (mo - 150) ** 2 * Math.sqrt(rf);
    mo = Math.min(mr, 250);
  }
  const ed = 0.942 * H ** 0.679 + 11 * Math.exp((H - 100) / 10) + 0.18 * (21.1 - T) * (1 - Math.exp(-0.115 * H));
  let m;
  if (mo > ed) {
    const ko = 0.424 * (1 - (H / 100) ** 1.7) + 0.0694 * Math.sqrt(W) * (1 - (H / 100) ** 8);
    m = ed + (mo - ed) * 10 ** -(ko * 0.581 * Math.exp(0.0365 * T));
  } else {
    const ew = 0.618 * H ** 0.753 + 10 * Math.exp((H - 100) / 10) + 0.18 * (21.1 - T) * (1 - Math.exp(-0.115 * H));
    if (mo < ew) {
      const kl = 0.424 * (1 - ((100 - H) / 100) ** 1.7) + 0.0694 * Math.sqrt(W) * (1 - ((100 - H) / 100) ** 8);
      m = ew - (ew - mo) * 10 ** -(kl * 0.581 * Math.exp(0.0365 * T));
    } else m = mo;
  }
  return Math.max(0, Math.min(101, (59.5 * (250 - m)) / (147.2 + m)));
}

function dmcCalc(p0, T, H, ro, mon, lat) {
  const t = Math.max(T, -1.1);
  const rk = 1.894 * (t + 1.1) * (100 - H) * dayLength(lat, mon) * 1e-4;
  let pr = p0;
  if (ro > 1.5) {
    const re = 0.92 * ro - 1.27, mo = 20 + 280 / Math.exp(0.023 * p0);
    const b = p0 <= 33 ? 100 / (0.5 + 0.3 * p0) : p0 <= 65 ? 14 - 1.3 * Math.log(p0) : 6.2 * Math.log(p0) - 17.2;
    const mr = mo + (1000 * re) / (48.77 + b * re);
    pr = 43.43 * (5.6348 - Math.log(mr - 20));
  }
  return Math.max(0, Math.max(pr, 0) + rk);
}

function dcCalc(d0, T, ro, mon, lat) {
  const t = Math.max(T, -2.8);
  const pe = Math.max(0, (0.36 * (t + 2.8) + dayFactor(lat, mon)) / 2);
  let dr = d0;
  if (ro > 2.8) {
    const rd = 0.83 * ro - 1.27, qo = 800 * Math.exp(-d0 / 400);
    dr = Math.max(0, d0 - 400 * Math.log(1 + (3.937 * rd) / qo));
  }
  return dr + pe;
}

function isiCalc(ffmc, W) {
  const fm = (147.2 * (101 - ffmc)) / (59.5 + ffmc);
  const sf = 19.115 * Math.exp(-0.1386 * fm) * (1 + fm ** 5.31 / 4.93e7);
  return sf * Math.exp(0.05039 * W);
}

function buiCalc(dmc, dc) {
  if (dmc === 0 && dc === 0) return 0;
  const b = dmc <= 0.4 * dc ? (0.8 * dc * dmc) / (dmc + 0.4 * dc) : dmc - (1 - (0.8 * dc) / (dmc + 0.4 * dc)) * (0.92 + (0.0114 * dmc) ** 1.7);
  return Math.max(0, b);
}

function fwiCalc(isi, bui) {
  const bb = bui <= 80 ? 0.1 * isi * (0.626 * bui ** 0.809 + 2) : 0.1 * isi * (1000 / (25 + 108.64 * Math.exp(-0.023 * bui)));
  return bb <= 1 ? bb : Math.exp(2.72 * (0.434 * Math.log(bb)) ** 0.647);
}

export function fwiDay(prev, { T, rh, ws, rain = 0, month, lat = 46 }) {
  const p = prev || START, H = Math.max(0, Math.min(100, rh)), W = Math.max(0, ws), ro = Math.max(0, rain);
  const ffmc = ffmcCalc(p.ffmc, T, H, W, ro), dmc = dmcCalc(p.dmc, T, H, ro, month, lat), dc = dcCalc(p.dc, T, ro, month, lat);
  const isi = isiCalc(ffmc, W), bui = buiCalc(dmc, dc);
  return { ffmc, dmc, dc, isi, bui, fwi: fwiCalc(isi, bui) };
}

export function fwiSeries(days, lat) {
  const out = [];
  let prev = null;
  for (const d of days) { prev = fwiDay(prev, { ...d, lat }); out.push(prev); }
  return out;
}
