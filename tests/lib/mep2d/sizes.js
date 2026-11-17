/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sizes.js — typed pipe and duct sizes for 2D MEP drafting (lib/mep2d). DOM-free.
 *
 * Pipes: a nominal size gives the outside diameter a double-line run is drawn at. The only table here is steel pipe to
 * ASME B36.10M (NPS ↔ DN pairs and outside diameters in inches; the same figures as the Piping add-on's tables.js, which
 * cites the standard). Any other pipe (copper, plastics, multilayer) is typed as its outside diameter — "Ø22", "OD22",
 * "22mm" — and is drawn at exactly what was typed: user-entered data, not a table of ours.
 *
 *   parsePipeSize(text, metric) → { label, od (mm), dn | null, nps | null, typed (true = the OD was typed) } | null
 *   parseDuctSize(text)         → { shape: 'rect', w, h, label } | { shape: 'round', d, label } | null   (in the units typed)
 */

// NPS: [outside diameter in, DN] — ASME B36.10M
export const STEEL_OD = Object.freeze({
  '1/8': [0.405, 6], '1/4': [0.54, 8], '3/8': [0.675, 10], '1/2': [0.84, 15], '3/4': [1.05, 20], '1': [1.315, 25], '1-1/4': [1.66, 32],
  '1-1/2': [1.9, 40], '2': [2.375, 50], '2-1/2': [2.875, 65], '3': [3.5, 80], '3-1/2': [4, 90], '4': [4.5, 100], '5': [5.563, 125],
  '6': [6.625, 150], '8': [8.625, 200], '10': [10.75, 250], '12': [12.75, 300], '14': [14, 350], '16': [16, 400], '18': [18, 450],
  '20': [20, 500], '24': [24, 600],
});
export const DN_LIST = Object.freeze(Object.values(STEEL_OD).map((r) => r[1]));
const byDn = (dn) => Object.entries(STEEL_OD).find(([, r]) => r[1] === dn) || null;
const r1 = (v) => Math.round(v * 10) / 10;

export function parsePipeSize(text, metric = true) {
  const s = String(text ?? '').trim().replace(/[”"]|\s*in\.?$/gi, '').replace(/^(\d+)\s+(\d+\/\d+)$/, '$1-$2');
  if (!s) return null;
  const typed = /^(?:ø|Ø|od)\s*(\d+(?:\.\d+)?)\s*(?:mm)?$/i.exec(s) || /^(\d+(?:\.\d+)?)\s*mm$/i.exec(s);
  if (typed) { const od = Number(typed[1]); return od > 0 && od <= 5000 ? { label: 'Ø' + typed[1], od, dn: null, nps: null, typed: true } : null; }
  const dn = /^dn\s*(\d+)$/i.exec(s) || (metric ? /^(\d+)$/.exec(s) : null);
  if (dn) {
    const hit = byDn(Number(dn[1]));
    if (hit) return { label: 'DN' + hit[1][1], od: r1(hit[1][0] * 25.4), dn: hit[1][1], nps: hit[0], typed: false };
    if (/^dn/i.test(s) || metric) return null;
  }
  if (STEEL_OD[s]) return { label: s + '"', od: r1(STEEL_OD[s][0] * 25.4), dn: STEEL_OD[s][1], nps: s, typed: false };
  const v = Number(s);
  if (Number.isFinite(v) && v > 0) {
    const hit = Object.entries(STEEL_OD).find(([k]) => Math.abs(nominal(k) - v) < 1e-9);
    if (hit) return { label: hit[0] + '"', od: r1(hit[1][0] * 25.4), dn: hit[1][1], nps: hit[0], typed: false };
  }
  return null;
}
/** "1-1/4" → 1.25 */
export function nominal(k) {
  const m = /^(?:(\d+)-)?(\d+)\/(\d+)$/.exec(k);
  return m ? Number(m[1] || 0) + Number(m[2]) / Number(m[3]) : Number(k);
}

export function parseDuctSize(text) {
  const s = String(text ?? '').trim().replace(/\s*(mm|in|")$/i, '');
  const round = /^(?:ø|Ø|d|dia\.?)\s*(\d+(?:\.\d+)?)$/i.exec(s);
  if (round) { const d = Number(round[1]); return d > 0 ? { shape: 'round', d, label: 'Ø' + round[1] } : null; }
  const m = /^(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)$/i.exec(s);
  if (m) { const w = Number(m[1]), h = Number(m[2]); return w > 0 && h > 0 ? { shape: 'rect', w, h, label: m[1] + 'x' + m[2] } : null; }
  return null;
}
