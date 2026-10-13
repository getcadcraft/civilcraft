/* SPDX-License-Identifier: Apache-2.0 */
/**
 * font.js — the one text face CivilCraft labels with (copied from CadCraft): Helvetica metrics (Arial has the same widths).
 * The screen draws text in Helvetica/Arial and plotted PDFs use the PDF reader's built-in
 * Helvetica, so measuring with these widths lines up text boxes, wrapping, centring and plots.
 * No DOM.
 */

// Helvetica advance widths (1/1000 em) for the printable ASCII range, from its font metrics.
const HELV = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667,
  611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833,
  556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
/** Windows-1252 codes 0x80–0x9F (the PDF's WinAnsiEncoding). */
export const CP1252 = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98, '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };
/** Widths of characters above 0x7F (by Windows-1252 code) that differ from their base letter. */
const WIDE = { 0x80: 556, 0x85: 1000, 0x89: 1000, 0x8c: 1000, 0x91: 222, 0x92: 222, 0x93: 333, 0x94: 333, 0x95: 350, 0x96: 556, 0x97: 1000, 0x99: 1000, 0x9c: 944, 0xa0: 278, 0xa1: 333, 0xa6: 260, 0xa7: 556, 0xa9: 737, 0xaa: 370, 0xab: 556, 0xac: 584, 0xad: 333, 0xae: 737, 0xb0: 400, 0xb1: 584, 0xb2: 333, 0xb3: 333, 0xb4: 333, 0xb5: 556, 0xb6: 537, 0xb7: 278, 0xb8: 333, 0xb9: 333, 0xba: 365, 0xbb: 556, 0xbc: 834, 0xbd: 834, 0xbe: 834, 0xbf: 611, 0xc6: 1000, 0xd7: 584, 0xd8: 778, 0xdf: 611, 0xe6: 889, 0xf7: 584, 0xf8: 611 };
/** Characters drawn as a close Windows-1252 one (⌀ as Ø, the true minus as a hyphen …). */
export const SUBST = { '⌀': 'Ø', '−': '-', '′': "'", '″': '"', '\t': ' ' };

/** Width of one character in 1/1000 em. */
export function charAdvance(ch) {
  ch = SUBST[ch] || ch;
  const code = ch.codePointAt(0);
  if (code >= 32 && code < 127) return HELV[code - 32];
  const w = CP1252[ch] !== undefined ? WIDE[CP1252[ch]] : WIDE[code];
  if (w) return w;
  const b = ch.normalize('NFD')[0].codePointAt(0);
  if (b >= 32 && b < 127) return HELV[b - 32];
  return code >= 0x2e80 ? 1000 : 556;   // CJK and the like: about square
}

/** Width of a string in 1/1000 em. */
export function advance(s) {
  let w = 0;
  for (const ch of s) w += charAdvance(ch);
  return w;
}
