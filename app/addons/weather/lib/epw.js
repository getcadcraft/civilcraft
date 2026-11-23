/* SPDX-License-Identifier: Apache-2.0 */
/**
 * epw.js — reads an EnergyPlus weather file (.epw): one typical year of hourly weather for a station (0.11 Track WX, WX.1).
 * Host-free and DOM-free: node bin/test-weather.mjs. The format is the published one (EnergyPlus "Auxiliary Programs", Weather
 * Converter, "EnergyPlus Weather File (EPW) Data Dictionary"); nothing here comes from another program's source.
 *
 *   readEpw(text) → { ok, errors, warnings, location, design, ground, periods, comments, n, hours }
 *       location  { city, region, country, source, wmo, lat, lon, tz, elev }          (degrees north / east, hours from UTC, m)
 *       design    null | { source, heat: { month, db996, db990 }, cool: { month, range, db004, wb004, db010, wb010, db020, wb020 } }
 *                 the station's published design conditions when the file carries them (°C). Read by the words "Heating" and
 *                 "Cooling" in the line, never by a fixed column, so an older or newer handbook layout is refused, not misread.
 *       ground    [{ depth (m), monthly: [12 × °C] }]
 *       hours     { month, day, hour (Uint8Array), db, dp (°C), rh (%), pa (Pa), ghi, dni, dhi (Wh/m²), wd (°), ws (m/s) } Float32Array,
 *                 NaN where the file says "missing" (99.9, 999, 9999, 999999 by column)
 *                 and (WX.6) etr, etrn, ir, ghi…dhi (Wh/m²), ghl, dnl, dhl (lux), zl (cd/m²), tsky, osky (tenths), vis (km), ceil (m; NaN =
 *                 no ceiling), pw (mm), aod (thousandths), snow (cm), dsnow (days), alb (0…1), rain (mm): every hourly column of the format
 *   A file with no 8760 (or 8784) hours of dry-bulb temperature is refused: nothing is filled in.
 *   writeEpw(text, hours, keys, note) → text   (WX.10) the same file with the columns named in `keys` written again from `hours`; every other
 *       byte is kept, an hour that is missing in `hours` keeps what the file had, and `note` is added to the file's second comment line so
 *       the file says it was changed. The design conditions in the header are NOT worked out again.
 */

const HEAD = ['LOCATION', 'DESIGN CONDITIONS', 'TYPICAL/EXTREME PERIODS', 'GROUND TEMPERATURES', 'HOLIDAYS/DAYLIGHT SAVINGS', 'COMMENTS 1', 'COMMENTS 2', 'DATA PERIODS'];
/** column → [key, the value that means "missing"] (0-based columns of a data line) */
const COLS = [[6, 'db', 99.9], [7, 'dp', 99.9], [8, 'rh', 999], [9, 'pa', 999999], [13, 'ghi', 9999], [14, 'dni', 9999], [15, 'dhi', 9999], [20, 'wd', 999], [21, 'ws', 999],
  // the rest of the year (WX.6): a file may stop short of these columns, and then they are all "missing"
  [10, 'etr', 9999], [11, 'etrn', 9999], [12, 'ir', 9999], [16, 'ghl', 999900], [17, 'dnl', 999900], [18, 'dhl', 999900], [19, 'zl', 9999],
  [22, 'tsky', 99], [23, 'osky', 99], [24, 'vis', 9999], [25, 'ceil', 77777], [28, 'pw', 999], [29, 'aod', 0.999], [30, 'snow', 999], [31, 'dsnow', 99],
  [32, 'alb', 999], [33, 'rain', 999]];
/** key → [lowest, highest, decimals] a changed value may take and how the file writes it (WX.10): inside what the reader accepts, below the "missing" code */
export const LIMITS = { db: [-70, 65, 1], dp: [-70, 65, 1], rh: [0, 100, 0], pa: [31000, 120000, 0], etr: [0, 9000, 0], etrn: [0, 9000, 0], ir: [0, 9000, 0], ghi: [0, 9000, 0], dni: [0, 9000, 0], dhi: [0, 9000, 0],
  ghl: [0, 900000, 0], dnl: [0, 900000, 0], dhl: [0, 900000, 0], zl: [0, 9990, 0], wd: [0, 360, 0], ws: [0, 90, 1], tsky: [0, 10, 0], osky: [0, 10, 0], vis: [0, 9000, 1], ceil: [0, 77000, 0],
  pw: [0, 990, 0], aod: [0, 0.99, 4], snow: [0, 990, 0], dsnow: [0, 98, 0], alb: [0, 1, 3], rain: [0, 990, 1] };
export const MAX_BYTES = 6e6;

const num = (s) => { const t = String(s ?? '').trim(); if (t === '') return NaN; const x = Number(t); return Number.isFinite(x) ? x : NaN; };

function designOf(cells) {
  // DESIGN CONDITIONS,<n>,<source>,,Heating,<month>,<99.6 % DB>,<99 % DB>,…,Cooling,<month>,<range>,<0.4 % DB>,<MCWB>,<1 % DB>,<MCWB>,<2 % DB>,<MCWB>,…,Extremes,…
  if (!(num(cells[1]) >= 1)) return null;
  const hi = cells.findIndex((c) => c.trim().toLowerCase() === 'heating'), ci = cells.findIndex((c) => c.trim().toLowerCase() === 'cooling');
  if (hi < 0 || ci < 0 || ci < hi + 3) return null;
  const h = (k) => num(cells[hi + k]), c = (k) => num(cells[ci + k]);
  const d = { source: String(cells[2] || '').trim(), heat: { month: h(1), db996: h(2), db990: h(3) }, cool: { month: c(1), range: c(2), db004: c(3), wb004: c(4), db010: c(5), wb010: c(6), db020: c(7), wb020: c(8) } };
  // a sane set or none: the 99 % winter temperature is not colder than the 99.6 %, and the summer ones fall in order
  const okH = Number.isFinite(d.heat.db996) && Number.isFinite(d.heat.db990) && d.heat.db996 <= d.heat.db990 + 1e-9 && d.heat.db996 > -90 && d.heat.db990 < 40;
  const okC = Number.isFinite(d.cool.db004) && Number.isFinite(d.cool.db010) && d.cool.db004 >= d.cool.db010 - 1e-9 && d.cool.db004 < 65 && d.cool.db004 > -20;
  if (!okH || !okC) return null;
  return d;
}

function groundOf(cells) {
  const n = num(cells[1]), out = [];
  if (!(n >= 1 && n <= 10)) return out;
  let at = 2;
  for (let i = 0; i < n; i++) {
    const depth = num(cells[at]), monthly = cells.slice(at + 4, at + 16).map(num);
    if (Number.isFinite(depth) && monthly.length === 12 && monthly.every(Number.isFinite)) out.push({ depth, monthly });
    at += 16;
  }
  return out;
}

export function readEpw(text) {
  const errors = [], warnings = [];
  const fail = (key, more = {}) => ({ ok: false, errors: [{ key, ...more }], warnings });
  if (typeof text !== 'string' || !text.length) return fail('wx.err.empty');
  if (text.length > MAX_BYTES) return fail('wx.err.big');
  const lines = text.replace(/^﻿/, '').split(/\r\n|\n|\r/);
  if (!/^LOCATION,/i.test(lines[0] || '')) return fail('wx.err.notepw');
  const head = new Map();
  let at = 0;
  for (; at < lines.length && at < 40; at++) {
    const l = lines[at], key = HEAD.find((k) => l.toUpperCase().startsWith(k + ','));
    if (!key) break;
    head.set(key, l.split(','));
  }
  const L = head.get('LOCATION');
  const location = { city: (L[1] || '').trim(), region: (L[2] || '').trim(), country: (L[3] || '').trim(), source: (L[4] || '').trim(), wmo: (L[5] || '').trim(), lat: num(L[6]), lon: num(L[7]), tz: num(L[8]), elev: num(L[9]) };
  if (!(Math.abs(location.lat) <= 90) || !(Math.abs(location.lon) <= 180)) return fail('wx.err.place');
  const design = head.has('DESIGN CONDITIONS') ? designOf(head.get('DESIGN CONDITIONS')) : null;
  if (head.has('DESIGN CONDITIONS') && !design && num(head.get('DESIGN CONDITIONS')[1]) >= 1) warnings.push({ key: 'wx.warn.design' });
  const ground = head.has('GROUND TEMPERATURES') ? groundOf(head.get('GROUND TEMPERATURES')) : [];
  const comments = ['COMMENTS 1', 'COMMENTS 2'].map((k) => (head.get(k) || []).slice(1).join(',').trim()).filter(Boolean);
  const periods = (head.get('DATA PERIODS') || []).slice(1).map((x) => x.trim());

  const rows = [];
  for (; at < lines.length; at++) { const l = lines[at]; if (l.trim() === '') continue; rows.push(l); }
  const n = rows.length;
  if (n !== 8760 && n !== 8784) return fail('wx.err.hours', { n });
  const hours = { month: new Uint8Array(n), day: new Uint8Array(n), hour: new Uint8Array(n) };
  for (const [, k] of COLS) hours[k] = new Float32Array(n);
  let missDb = 0;
  for (let i = 0; i < n; i++) {
    const c = rows[i].split(',');
    if (c.length < 22) return fail('wx.err.row', { row: i + 1 });
    const mo = num(c[1]), dy = num(c[2]), hr = num(c[3]);
    if (!(mo >= 1 && mo <= 12 && dy >= 1 && dy <= 31 && hr >= 1 && hr <= 24)) return fail('wx.err.row', { row: i + 1 });
    hours.month[i] = mo; hours.day[i] = dy; hours.hour[i] = hr;
    for (const [col, k, miss] of COLS) { const x = num(c[col]); hours[k][i] = Number.isFinite(x) && x < miss - 1e-6 ? x : NaN; }
    if (Number.isNaN(hours.db[i])) missDb++;
    else if (hours.db[i] < -90 || hours.db[i] > 70) return fail('wx.err.row', { row: i + 1 });
  }
  if (missDb) return fail('wx.err.missing', { n: missDb });
  return { ok: true, errors, warnings, location, design, ground, periods, comments, n, hours };
}

export function writeEpw(text, hours, keys, note = '') {
  const cols = COLS.filter(([, k]) => keys.includes(k) && LIMITS[k] && hours[k]);
  const nl = /\r\n/.test(text) ? '\r\n' : '\n', lines = text.split(/\r\n|\n|\r/);
  let at = 0, i = 0;
  for (; at < lines.length && at < 40; at++) {
    const up = lines[at].toUpperCase();
    if (!HEAD.some((k) => up.startsWith(k + ','))) break;
    if (note && up.startsWith('COMMENTS 2,')) lines[at] = lines[at].replace(/\s+$/, '') + (lines[at].length > 11 ? ' | ' : '') + String(note).replace(/[\r\n,]+/g, ' ').slice(0, 300);
  }
  for (; at < lines.length; at++) {
    if (lines[at].trim() === '') continue;
    const c = lines[at].split(',');
    for (const [col, k] of cols) { const v = hours[k][i], [lo, hi, dec] = LIMITS[k]; if (col < c.length && !Number.isNaN(v)) c[col] = Math.min(hi, Math.max(lo, v)).toFixed(dec); }
    lines[at] = c.join(','); i++;
  }
  return lines.join(nl);
}
