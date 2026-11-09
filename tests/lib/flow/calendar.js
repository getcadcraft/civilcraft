/* SPDX-License-Identifier: Apache-2.0 */
/**
 * calendar.js — shift calendars for the Material flow simulation (0.8 SU.858, session flow-08). DOM-free.
 *
 * A calendar is a week that repeats: windows of "on" time, each on some days from a start to an end time. Simulation time 0 is
 * Monday 00:00. A window whose end is not after its start runs past midnight into the next day (22:00–06:00 on Monday ends
 * Tuesday 06:00); start = end means the whole day.
 *
 *   spec (what the layout keeps):  { id, name, windows: [{ days: [0..6] (0 = Monday), from: 'HH:MM', to: 'HH:MM' }] }
 *   cleanCalendar(raw) → spec | null        untrusted → clean (≤ 12 windows)
 *   compile(spec) → { always, never, isOn(t), nextOn(t), nextOff(t), onTime(a, b) }      times in seconds
 *     nextOn(t)  = the first time ≥ t the calendar is on (Infinity: never)
 *     nextOff(t) = the first time ≥ t it is off (Infinity: always on from there)
 *   hhmm(s) · parseHHMM(text) → seconds | null
 */
export const DAY = 86400, WEEK = 7 * DAY;
export const PRESETS = {
  'one-shift': [{ days: [0, 1, 2, 3, 4], from: '06:00', to: '14:00' }],
  'two-shifts': [{ days: [0, 1, 2, 3, 4], from: '06:00', to: '22:00' }],
  'three-shifts': [{ days: [0, 1, 2, 3, 4], from: '00:00', to: '00:00' }],
  'every-day': [{ days: [0, 1, 2, 3, 4, 5, 6], from: '00:00', to: '00:00' }],
};

export function parseHHMM(text) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(String(text ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2]);
  return h <= 24 && mi < 60 && !(h === 24 && mi) ? h * 3600 + mi * 60 : null;
}
export const hhmm = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}`;

export function cleanCalendar(raw) {
  if (!raw || typeof raw !== 'object' || typeof raw.id !== 'string' || !/^[a-z][a-z0-9-]{0,39}$/.test(raw.id)) return null;
  const windows = [];
  for (const w of Array.isArray(raw.windows) ? raw.windows.slice(0, 12) : []) {
    if (!w || typeof w !== 'object') continue;
    const days = [...new Set((Array.isArray(w.days) ? w.days : []).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))].sort();
    const a = parseHHMM(w.from), b = parseHHMM(w.to);
    if (!days.length || a === null || b === null) continue;
    windows.push({ days, from: hhmm(a % DAY), to: b === DAY ? '00:00' : hhmm(b) });
  }
  const name = typeof raw.name === 'string' ? raw.name.replace(/[\u0000-\u001f<>]/g, '').slice(0, 60) : '';
  return { id: raw.id, name: name || raw.id, windows };
}

/** The weekly "on" intervals in seconds, merged, within [0, WEEK] (a window past Sunday midnight wraps to the start). */
function weekIntervals(spec) {
  const iv = [];
  for (const w of spec.windows || []) {
    const a = parseHHMM(w.from), b = parseHHMM(w.to);
    if (a === null || b === null) continue;
    for (const d of w.days) {
      const s = d * DAY + a;
      const len = b > a ? b - a : b === a ? DAY : DAY - a + b;
      const e = s + len;
      if (e <= WEEK) iv.push([s, e]); else { iv.push([s, WEEK]); iv.push([0, e - WEEK]); }
    }
  }
  iv.sort((x, y) => x[0] - y[0]);
  const out = [];
  for (const x of iv) { const l = out[out.length - 1]; if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else out.push([x[0], x[1]]); }
  return out;
}

export function compile(spec) {
  const w = weekIntervals(spec);
  const never = w.length === 0;
  const always = w.length === 1 && w[0][0] === 0 && w[0][1] === WEEK;
  // two weeks unrolled and merged, so an interval that runs across Sunday midnight is one piece
  const two = [];
  for (const k of [0, 1]) for (const [s, e] of w) { const x = [s + k * WEEK, e + k * WEEK], l = two[two.length - 1]; if (l && x[0] <= l[1]) l[1] = x[1]; else two.push(x); }
  const at = (t) => { const base = Math.floor(t / WEEK) * WEEK; return [base, t - base]; };
  const isOn = (t) => {
    if (always) return true;
    if (never) return false;
    const [, tw] = at(t);
    return two.some(([s, e]) => tw >= s && tw < e);
  };
  const nextOn = (t) => {
    if (always) return t;
    if (never) return Infinity;
    const [base, tw] = at(t);
    for (const [s, e] of two) { if (e <= tw) continue; return s <= tw ? t : base + s; }
    return Infinity;
  };
  const nextOff = (t) => {
    if (always) return Infinity;
    if (never) return t;
    const [base, tw] = at(t);
    for (const [s, e] of two) if (tw >= s && tw < e) return e >= 2 * WEEK ? Infinity : base + e;
    return t;
  };
  const onTime = (a, b) => {
    if (b <= a) return 0;
    if (always) return b - a;
    if (never) return 0;
    let sum = 0, t = a;
    for (let guard = 0; t < b && guard < 1e6; guard++) {
      const on = nextOn(t);
      if (on >= b) break;
      const off = Math.min(nextOff(on), b);
      sum += off - on; t = off;
    }
    return sum;
  };
  return { always, never, isOn, nextOn, nextOff, onTime };
}
