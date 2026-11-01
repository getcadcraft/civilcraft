/* SPDX-License-Identifier: Apache-2.0 */
/**
 * code128.js — a small Code 128 bar code writer (0.8 SU.1035, session `sx-cabinet`). DOM-free and import-free; ours, written
 * from the symbology's public description (ISO/IEC 15417): 107 symbol patterns, start codes A/B/C, a mod-103 check symbol and
 * the stop pattern. Code sets B (printable ASCII 32–126) and C (digit pairs) are used; a run of four or more digits (at the
 * start or end, six or more in the middle) goes into set C, so part ids like `B01-0003` stay short. Canonical in lib/cutlist;
 * copies only through `node tools/cutlist/sync.mjs`.
 *
 *   encode(text) → { values: [start, …data, check, 106], modules: [w, w, …] (bar, space, bar … widths in modules, 11 each,
 *                    the stop 13), width (modules, quiet zones not included), text }   throws on a character outside 32–126
 *   checksum(values) → the mod-103 check value of [start, …data]
 *   barsSvg(text, { x, y, h, module, quiet }) → SVG <rect> elements (a string) for the bars, the quiet zone included in x
 *   PATTERNS[v] → the six (stop: seven) widths of value v
 */

/** Widths of bar, space, bar, space, bar, space for values 0–105; 106 = stop (seven widths). */
export const PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
].map((s) => [...s].map(Number));

export const START_A = 103, START_B = 104, START_C = 105, CODE_B = 100, CODE_C = 99, STOP = 106;

const isDigit = (c) => c >= 48 && c <= 57;
/** Length of the run of digits starting at i. */
function digitRun(s, i) { let n = 0; while (i + n < s.length && isDigit(s.charCodeAt(i + n))) n++; return n; }

export function checksum(values) {
  let sum = values[0];
  for (let i = 1; i < values.length; i++) sum += values[i] * i;
  return sum % 103;
}

/** Text → the symbol values (start … data …), choosing B or C as it goes. */
function dataValues(text) {
  const s = String(text);
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 32 || c > 126) throw new RangeError('Code 128: character ' + c + ' at ' + i + ' is not printable ASCII');   // i18n-ignore (for developers; labels catch it)
  }
  const out = [];
  let set = null, i = 0;
  // set C pays when it saves symbols: 4+ digits at the start or the end, 6+ in the middle (an even count is taken)
  const wantsC = (at) => {
    const n = digitRun(s, at);
    if (at === 0 && n === s.length) return n >= 2 && n % 2 === 0 || n >= 4;
    if (at === 0 || at + n === s.length) return n >= 4;
    return n >= 6;
  };
  while (i < s.length) {
    if (wantsC(i) || (set === 'C' && digitRun(s, i) >= 2)) {
      if (set !== 'C') {
        // an odd run: the first digit goes in B, the rest in pairs
        if (digitRun(s, i) % 2 === 1) {
          if (set !== 'B') { out.push(set === null ? START_B : CODE_B); set = 'B'; }
          out.push(s.charCodeAt(i) - 32); i++;
        }
        out.push(set === null ? START_C : CODE_C); set = 'C';
      }
      out.push(Number(s.slice(i, i + 2))); i += 2;
      continue;
    }
    if (set !== 'B') { out.push(set === null ? START_B : CODE_B); set = 'B'; }
    out.push(s.charCodeAt(i) - 32); i++;
  }
  if (!out.length) out.push(START_B);   // an empty text: a start, the check and the stop (scanners read it as empty)
  return out;
}

export function encode(text) {
  const values = dataValues(text);
  values.push(checksum(values), STOP);
  const modules = [];
  for (const v of values) modules.push(...PATTERNS[v]);
  return { values, modules, width: modules.reduce((a, b) => a + b, 0), text: String(text) };
}

/** The bars as SVG rects: x/y the top-left of the quiet zone, h the bar height, module the narrowest bar's width. */
export function barsSvg(text, { x = 0, y = 0, h = 10, module = 0.25, quiet = 10, fill = '#000' } = {}) {
  const { modules } = encode(text);
  const r = (v) => Math.round(v * 1000) / 1000;
  let at = x + quiet * module, out = '';
  modules.forEach((w, k) => {
    if (k % 2 === 0) out += `<rect x="${r(at)}" y="${r(y)}" width="${r(w * module)}" height="${r(h)}" fill="${fill}"/>`;
    at += w * module;
  });
  return out;
}
