/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys. */
/**
 * indicators.js — the EU noise indicators Lden and Lnight (0.11 XE.3, session sound-11). DOM-free; lib/acoustics is canonical.
 * Source: Directive 2002/49/EC of 25 June 2002, OJ L 189, 18.7.2002, Annex I (refs/acoustics/eu-2002-49-en.pdf; read it at
 * https://eur-lex.europa.eu/eli/dir/2002/49/oj). The formula is copied from the rendered page L 189/18, not typed from memory.
 *
 *   lden({ day, evening, night }, hours?) → { ok, Lden, Lnight, hours, notes }
 *     day, evening, night: the A-weighted long-term levels of each period (dB(A)); a period with no level is no sound in that period (−∞)
 *     hours: { day, evening, night } — default 12, 4, 8 (Annex I § 1). A Member State may shorten the evening by one or two hours and lengthen the day
 *            and/or the night accordingly: so the evening is 2, 3 or 4 hours and the three add up to 24. Anything else is refused (ok: false).
 *     Lden = 10 lg (1/24) (Td·10^(Lday/10) + Te·10^((Levening+5)/10) + Tn·10^((Lnight+10)/10))   (Annex I § 1, with Td, Te, Tn = 12, 4, 8 by default)
 *     Lnight = the night level (Annex I § 2).
 *   ASSESSMENT_HEIGHT — 4.0 ± 0.2 m above the ground at the most exposed façade, for strategic noise mapping (Annex I § 1); other purposes may use other
 *     heights, never under 1.5 m.
 *   assessmentNotes(h) → notes about a receiver height against those rules.
 * Both indicators take the INCIDENT sound: no reflection from the façade of the dwelling itself (Annex I § 1) — the caller leaves that façade out.
 */
export const SOURCE = { text: 'Directive 2002/49/EC, Annex I (OJ L 189, 18.7.2002, p. 18)', link: 'https://eur-lex.europa.eu/eli/dir/2002/49/oj' };
export const DEFAULT_HOURS = { day: 12, evening: 4, night: 8 };
export const PENALTY = { day: 0, evening: 5, night: 10 };   // the +5 and +10 in the formula of Annex I § 1
export const ASSESSMENT_HEIGHT = { mapping: 4.0, tolerance: 0.2, minimum: 1.5 };

const e10 = (L) => (Number.isFinite(L) ? Math.pow(10, L / 10) : 0);

export function lden(levels = {}, hours = DEFAULT_HOURS) {
  const H = { day: Number(hours?.day), evening: Number(hours?.evening), night: Number(hours?.night) }, notes = [];
  const ok = [2, 3, 4].includes(H.evening) && H.day >= 12 && H.night >= 8 && Math.abs(H.day + H.evening + H.night - 24) < 1e-9;
  if (!ok) return { ok: false, reason: 'hours', hours: H, notes: [{ key: 'ac.ind.note.hours' }] };
  if (H.evening !== 4) notes.push({ key: 'ac.ind.note.shortevening', evening: H.evening });
  const any = ['day', 'evening', 'night'].some((p) => Number.isFinite(levels[p]));
  if (!any) return { ok: false, reason: 'nolevel', hours: H, notes };
  for (const p of ['day', 'evening', 'night']) if (!Number.isFinite(levels[p])) notes.push({ key: 'ac.ind.note.silent', period: p });
  const sum = H.day * e10(levels.day + PENALTY.day) + H.evening * e10(levels.evening + PENALTY.evening) + H.night * e10(levels.night + PENALTY.night);
  return { ok: true, Lden: 10 * Math.log10(sum / 24), Lnight: Number.isFinite(levels.night) ? levels.night : null, hours: H, notes };
}

export function assessmentNotes(h) {
  const out = [];
  if (!(h >= ASSESSMENT_HEIGHT.minimum)) out.push({ key: 'ac.ind.note.low', h, min: ASSESSMENT_HEIGHT.minimum });
  else if (Math.abs(h - ASSESSMENT_HEIGHT.mapping) > ASSESSMENT_HEIGHT.tolerance + 1e-9) out.push({ key: 'ac.ind.note.notmapping', h });
  return out;
}
