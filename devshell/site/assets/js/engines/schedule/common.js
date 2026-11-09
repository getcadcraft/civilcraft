/* SPDX-License-Identifier: Apache-2.0 */
/** Shared bits of cc-schedule: the problem shape (docs/0.8-PROBLEMS-SPEC.md, rule 29) and the method/limits record every result carries. */

export function problem(code, severity, text, about = [], extra = {}) {
  return { id: 'schedule:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: { kind: 'engine', name: 'cc-schedule' }, ...extra };
}

/** Every result says how it was computed and what it does not do (the brief: results carry their method and their limits). */
export function method(name, ref, limits) { return { name, ref, limits }; }

/** Mulberry32: a small seeded generator so a Monte Carlo run is repeatable. */
export function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const ms = (s) => Date.parse(s + 'T00:00:00Z');

/**
 * A working calendar. Time inside the engines is whole working days counted from the project start (a "time point": 0 = start of the first
 * working day; a task occupies [ES, EF)). The calendar turns those into dates. One calendar per project (said in the limits).
 */
export function makeCalendar({ start, workdays = [1, 2, 3, 4, 5], holidays = [] } = {}) {
  if (!start || Number.isNaN(ms(start))) throw new Error('calendar needs a start date (YYYY-MM-DD)');
  const off = new Set(holidays), days = [];
  let cur = ms(start);
  const fill = (n) => { while (days.length <= n) { const d = new Date(cur).getUTCDay(); if (workdays.includes(d) && !off.has(iso(cur))) days.push(iso(cur)); cur += DAY; if (days.length > 200000) throw new Error('calendar has no working days'); } };
  return {
    start, workdays: workdays.slice(), holidays: holidays.slice(),
    /** Date of the start of working day n (n = 0 is the first working day). */
    dateOf(n) { fill(n); return days[n]; },
    /** Date a task finishes on: the last working day it occupies (EF is exclusive); a milestone lands on its own point. */
    finishDate(ef, dur = 1) { return dur > 0 && ef > 0 ? this.dateOf(ef - 1) : this.dateOf(ef); },
    /** Working days between the project start and a date (the date itself not counted); a non-working date maps to the next working day. */
    indexOf(date) { const t = ms(date); fill(0); let n = 0; for (;;) { fill(n); if (ms(days[n]) >= t) return n; n++; } },
  };
}
