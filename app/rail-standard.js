/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — document names only; the words around them are in the language files. */
/**
 * rail-standard.js — which railway standard a CivilCraft rail setup cites (0.8 CV.1, civil_PART_4; owner decision 2026-10-30: the European standard first, UIC and EN, South Africa not in 0.8).
 *
 * NO NUMBER from any standard is built in. The limits in rail.js stay the placeholders they were (cant, deficiency, excess, gradient, rate), and the person (or the railway's engineer)
 * types the value and the clause it comes from beside each limit. This file only names the documents a European project cites, by title, so a report can say what the numbers are
 * placeholders for. Clause numbers are never guessed: an empty clause reads "clause not entered".
 *
 *   STANDARDS                 { none, eu } → { id, docs: [{ key, ref, title }] }
 *   CITE_KEYS                 the limits that take a clause: cant, deficiency, excess, gradient, rate, turnout, gauge
 *   cleanStd(v) → 'none' | 'eu'            cleanCites(o) → { key: text ≤ 120 } (untrusted)
 *   citeOf(rail, key) → { std, clause, placeholder: true }   what a result may say about where a limit comes from
 */
export const STANDARDS = {
  none: { id: 'none', docs: [] },
  eu: {
    id: 'eu',
    docs: [
      { key: 'alignment', ref: 'EN 13803', title: 'Railway applications — Track — Track alignment design parameters — Track gauges 1435 mm and wider', for: ['cant', 'deficiency', 'excess', 'gradient', 'rate'] },
      { key: 'switches', ref: 'EN 13232', title: 'Railway applications — Track — Switches and crossings for Vignole rails', for: ['turnout'] },
      { key: 'gauges', ref: 'EN 15273', title: 'Railway applications — Gauges', for: ['gauge'] },
      { key: 'geometry', ref: 'EN 13848', title: 'Railway applications — Track — Track geometry quality', for: [] },
    ],
  },
};
export const CITE_KEYS = ['cant', 'deficiency', 'excess', 'gradient', 'rate', 'turnout', 'gauge'];
export const cleanStd = (v) => (v === 'eu' ? 'eu' : 'none');
export function cleanCites(o) {
  const out = {};
  if (o && typeof o === 'object') for (const k of CITE_KEYS) if (typeof o[k] === 'string' && o[k].trim()) out[k] = o[k].trim().slice(0, 120);
  return out;
}
export function citeOf(rail, key) {
  const std = cleanStd(rail?.std);
  return { std, clause: (rail?.cites && rail.cites[key]) || '', placeholder: true };
}
