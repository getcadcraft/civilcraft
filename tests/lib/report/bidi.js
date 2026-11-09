/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bidi.js — enough of right-to-left text for a printed page, with no shaping engine. DOM-free.
 *   shapeArabic(s)      Arabic letters → their joined presentation forms (and lam-alef ligatures), still in reading order
 *   bidiLine(pieces, measure)   one laid-out line [{ s, r, w }] → { line, rtl } in the order to draw left to right, or null when it holds no RTL text
 * A simplified Unicode bidi: the first strong letter sets the line's direction, numbers and Latin stay left to right inside RTL text, neutrals between two
 * stretches of one direction take it, brackets mirror. Not handled: explicit bidi controls, and scripts that need a real shaper (Devanagari and other Indic scripts).
 */
export const isRtlCode = c => (c >= 0x0590 && c <= 0x08FF) || (c >= 0xFB1D && c <= 0xFDFF) || (c >= 0xFE70 && c <= 0xFEFF);
const hasRtl = s => { for (const ch of s) if (isRtlCode(ch.codePointAt(0))) return true; return false; };

/* letter → [isolated, final, initial, medial]; two forms = joins only to the letter before it */
const FORMS = new Map();
{
  let at = 0xFE80;
  for (const [cp, n] of [[0x621, 1], [0x622, 2], [0x623, 2], [0x624, 2], [0x625, 2], [0x626, 4], [0x627, 2], [0x628, 4], [0x629, 2], [0x62A, 4], [0x62B, 4], [0x62C, 4], [0x62D, 4], [0x62E, 4], [0x62F, 2], [0x630, 2], [0x631, 2], [0x632, 2], [0x633, 4], [0x634, 4], [0x635, 4], [0x636, 4], [0x637, 4], [0x638, 4], [0x639, 4], [0x63A, 4], [0x641, 4], [0x642, 4], [0x643, 4], [0x644, 4], [0x645, 4], [0x646, 4], [0x647, 4], [0x648, 2], [0x649, 2], [0x64A, 4]]) {
    FORMS.set(cp, Array.from({ length: n }, (_, i) => at + i)); at += n;
  }
  for (const [cp, first, n] of [[0x67E, 0xFB56, 4], [0x686, 0xFB7A, 4], [0x698, 0xFB8A, 2], [0x6A4, 0xFB6A, 4], [0x6A9, 0xFB8E, 4], [0x6AF, 0xFB92, 4], [0x6CC, 0xFBFC, 4]]) FORMS.set(cp, Array.from({ length: n }, (_, i) => first + i));
}
const LAM = 0x644, LAM_ALEF = new Map([[0x622, 0xFEF5], [0x623, 0xFEF7], [0x625, 0xFEF9], [0x627, 0xFEFB]]);
const isMark = c => (c >= 0x64B && c <= 0x65F) || c === 0x670;
const joinsNext = c => (FORMS.get(c) || []).length === 4;
const joinsPrev = c => (FORMS.get(c) || []).length >= 2;

export function shapeArabic(s) {
  if (!/[ء-ۿ]/.test(s)) return s;
  const cs = Array.from(s, ch => ch.codePointAt(0)), out = [];
  const near = (i, by) => { let j = i + by; while (j >= 0 && j < cs.length && isMark(cs[j])) j += by; return j >= 0 && j < cs.length ? j : -1; };
  for (let i = 0; i < cs.length; i++) {
    const c = cs[i], f = FORMS.get(c);
    if (!f) { out.push(c); continue; }
    const p = near(i, -1), n = near(i, 1);
    const fromPrev = p >= 0 && joinsNext(cs[p]) && joinsPrev(c);
    if (c === LAM && n >= 0 && LAM_ALEF.has(cs[n])) {
      out.push(LAM_ALEF.get(cs[n]) + (fromPrev ? 1 : 0));
      for (let k = i + 1; k < n; k++) out.push(cs[k]);   // marks between them stay
      i = n; continue;
    }
    const toNext = n >= 0 && joinsNext(c) && joinsPrev(cs[n]);
    const form = fromPrev ? (toNext && f.length === 4 ? 3 : 1) : (toNext && f.length === 4 ? 2 : 0);
    out.push(f[form] ?? f[0]);
  }
  return String.fromCodePoint(...out);
}

const MIRROR = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '«': '»', '»': '«' };
const reverseClusters = s => {
  const cl = [];
  for (const ch of s) { if (cl.length && /\p{M}/u.test(ch)) cl[cl.length - 1] += ch; else cl.push(MIRROR[ch] || ch); }
  return cl.reverse().join('');
};
const classOf = ch => { const c = ch.codePointAt(0); if (/\p{Nd}/u.test(ch)) return 'L'; if (isRtlCode(c)) return /\p{L}|\p{M}/u.test(ch) ? 'R' : 'N'; return /\p{L}/u.test(ch) ? 'L' : 'N'; };

export function bidiLine(pieces, measure) {
  if (!pieces.some(p => hasRtl(p.s))) return null;
  const chunks = [];
  for (const p of pieces) { let cur = null; for (const ch of p.s) { const k = classOf(ch); if (!cur || cur.k !== k) chunks.push(cur = { s: '', r: p.r, k }); cur.s += ch; } }
  const first = chunks.find(c => c.k !== 'N'), rtl = !!first && first.k === 'R', base = rtl ? 1 : 0;
  chunks.forEach((c, i) => {
    if (c.k === 'R') c.level = 1;
    else if (c.k === 'L') c.level = rtl ? 2 : 0;
    else {
      let a = i - 1, b = i + 1;
      while (a >= 0 && chunks[a].k === 'N') a--;
      while (b < chunks.length && chunks[b].k === 'N') b++;
      c.level = a >= 0 && b < chunks.length && chunks[a].k === chunks[b].k ? (chunks[a].k === 'R' ? 1 : rtl ? 2 : 0) : base;
    }
  });
  for (let lv = Math.max(...chunks.map(c => c.level)); lv >= 1; lv--) {
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i].level < lv) continue;
      let j = i; while (j + 1 < chunks.length && chunks[j + 1].level >= lv) j++;
      chunks.splice(i, j - i + 1, ...chunks.slice(i, j + 1).reverse());
      i = j;
    }
  }
  return { rtl, line: chunks.map(c => { const s = c.level % 2 ? reverseClusters(c.s) : c.s; return { s, r: c.r, w: measure(s, c.r) }; }) };
}
