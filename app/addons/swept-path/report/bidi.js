/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bidi.js — enough of right-to-left text for a printed page, with no shaping engine. DOM-free.
 *   shapeArabic(s)      Arabic letters → their joined presentation forms (and lam-alef ligatures), still in reading order
 *   bidiLine(pieces, measure)   one laid-out line [{ s, r, w }] → { line, rtl } in the order to draw left to right, or null when it holds no RTL text
 * A simplified Unicode bidi: the first strong letter sets the line's direction, numbers and Latin stay left to right inside RTL text, neutrals between two
 * stretches of one direction take it, brackets mirror. Not handled: explicit bidi controls, and scripts that need a real shaper (Devanagari and other Indic scripts).
 *
 * For text that is one string per line (drawing text: CadCraft TEXT and MTEXT, 1.0 ORS.17) the same module has the Unicode Bidirectional Algorithm's implicit rules
 * (UAX #9: W1-W7, N0 for the common brackets, N1-N2, I1-I2, L1-L2, L4 mirroring), written from the published standard:
 *   firstStrong(s)                 → 'rtl' | 'ltr' | null    the paragraph direction rule (P2-P3)
 *   bidiLevels(s, dir?)            → { levels (one per UTF-16 unit), base (0 | 1), rtl }
 *   visualLine(s, { dir, shape, has, before, after }) → { text, rtl, pieces: [{ text, level }] }   the string in the order to draw left to right, Arabic joined
 *   shapeArabic(s, { has, before, after })   has(codePoint) → the font has that glyph: a joined form the font lacks stays the plain letter
 * The stored string never changes: these only say how to draw it. Explicit direction controls (embeddings, overrides, isolates) are dropped, not obeyed.
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
  // ORS.17: Urdu, Sindhi, Uyghur, Kurdish and other letters with joined forms of their own
  for (const [cp, first, n] of [[0x671, 0xFB50, 2], [0x679, 0xFB66, 4], [0x67A, 0xFB5E, 4], [0x67B, 0xFB52, 4], [0x67F, 0xFB62, 4], [0x680, 0xFB5A, 4], [0x683, 0xFB76, 4], [0x684, 0xFB72, 4],
    [0x687, 0xFB7E, 4], [0x688, 0xFB88, 2], [0x68C, 0xFB84, 2], [0x68D, 0xFB82, 2], [0x68E, 0xFB86, 2], [0x691, 0xFB8C, 2], [0x6A6, 0xFB6E, 4], [0x6AD, 0xFBD3, 4], [0x6B1, 0xFB9A, 4],
    [0x6B3, 0xFB96, 4], [0x6BA, 0xFB9E, 2], [0x6BB, 0xFBA0, 4], [0x6BE, 0xFBAA, 4], [0x6C0, 0xFBA4, 2], [0x6C1, 0xFBA6, 4], [0x6C5, 0xFBE0, 2], [0x6C6, 0xFBD9, 2], [0x6C7, 0xFBD7, 2],
    [0x6C8, 0xFBDB, 2], [0x6C9, 0xFBE2, 2], [0x6CB, 0xFBDE, 2], [0x6D0, 0xFBE4, 4], [0x6D2, 0xFBAE, 2], [0x6D3, 0xFBB0, 2]]) FORMS.set(cp, Array.from({ length: n }, (_, i) => first + i));
}
/* ORS.17: a letter a font may lack → the nearest letter whose joined forms it is drawn with then (Urdu heh goal as heh, yeh barree as Farsi yeh …) */
const NEAREST = new Map([[0x6C1, 0x647], [0x6C0, 0x629], [0x6C3, 0x629], [0x6D2, 0x6CC], [0x6D3, 0x626], [0x6BA, 0x646], [0x6BE, 0x647], [0x6D5, 0x647], [0x6D4, 0x2D]]);
const JOINER = c => c === 0x640 || c === 0x200D;   // tatweel and the zero-width joiner join on both sides and have no forms of their own
const LAM = 0x644, LAM_ALEF = new Map([[0x622, 0xFEF5], [0x623, 0xFEF7], [0x625, 0xFEF9], [0x627, 0xFEFB]]);
const isMark = c => (c >= 0x64B && c <= 0x65F) || c === 0x670 || (c >= 0x610 && c <= 0x61A) || (c >= 0x6D6 && c <= 0x6DC) || (c >= 0x6DF && c <= 0x6E4) || c === 0x6E7 || c === 0x6E8 || (c >= 0x6EA && c <= 0x6ED) || (c >= 0x8D3 && c <= 0x8FF && c !== 0x8E2);
const joinsNext = c => JOINER(c) || (FORMS.get(c) || []).length === 4;
const joinsPrev = c => JOINER(c) || (FORMS.get(c) || []).length >= 2;
/** Do two letters join when the first is followed by the second (marks between them aside)? For a host that draws a line in pieces. */
export const joinsAcross = (a, b) => joinsNext(a) && joinsPrev(b);

/**
 * `o` (ORS.17, all optional): has(codePoint) → false when the font has no such glyph (the letter then stays plain, or takes the nearest letter's forms);
 * before / after: the text around `s` on its line, read for joining only (a line drawn in pieces still joins across them).
 */
export function shapeArabic(s, o) {
  if (!/[\u0621-\u06FF\u08A0-\u08FF]/.test(s)) return s;
  const has = o && o.has, pre = o && o.before ? Array.from(o.before, ch => ch.codePointAt(0)) : [], post = o && o.after ? Array.from(o.after, ch => ch.codePointAt(0)) : [];
  const own = Array.from(s, ch => ch.codePointAt(0)), cs = pre.concat(own, post), out = [], from = pre.length, to = from + own.length;
  const near = (i, by) => { let j = i + by; while (j >= 0 && j < cs.length && isMark(cs[j])) j += by; return j >= 0 && j < cs.length ? j : -1; };
  for (let i = from; i < to; i++) {
    const c = cs[i];
    let f = FORMS.get(c);
    if (!f) { out.push(has && !has(c) && NEAREST.has(c) && has(NEAREST.get(c)) ? NEAREST.get(c) : c); continue; }
    const p = near(i, -1), n = near(i, 1);
    const fromPrev = p >= 0 && joinsNext(cs[p]) && joinsPrev(c);
    if (c === LAM && n >= 0 && n < to && LAM_ALEF.has(cs[n]) && (!has || has(LAM_ALEF.get(cs[n]) + (fromPrev ? 1 : 0)))) {
      out.push(LAM_ALEF.get(cs[n]) + (fromPrev ? 1 : 0));
      for (let k = i + 1; k < n; k++) out.push(cs[k]);   // marks between them stay
      i = n; continue;
    }
    const toNext = n >= 0 && joinsNext(c) && joinsPrev(cs[n]);
    const pick = (ff) => { const form = fromPrev ? (toNext && ff.length === 4 ? 3 : 1) : (toNext && ff.length === 4 ? 2 : 0); return ff[form] ?? ff[0]; };
    let g = pick(f);
    if (has && !has(g)) {   // the font lacks the joined form: the nearest letter's form (its joining kind decides), else the plain letter
      const alt = NEAREST.get(c), af = alt !== undefined ? FORMS.get(alt) : null;
      // a two-form letter drawn with a four-form neighbour must not start joining forward: only its isolated and final forms are used
      g = af && has(pick(f.length === 2 ? af.slice(0, 2) : af)) ? pick(f.length === 2 ? af.slice(0, 2) : af) : has(c) ? c : alt !== undefined && has(alt) ? alt : c;
    }
    out.push(g);
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

// ---------------------------------------------------------------------------------------------------------------------
// ORS.17: one string per line (drawing text). The implicit rules of the Unicode Bidirectional Algorithm (UAX #9).

const RE_NSM = /\p{Mn}|\p{Me}/u, RE_L = /\p{L}/u, RE_PS = /\p{P}|\p{S}|\p{Z}/u;
/** The bidirectional class of a code point: L R AL EN ES ET AN CS NSM BN B S WS ON (the classes the implicit rules use). */
export function bidiClass(c) {
  if (c < 0x80) {
    if (c >= 0x30 && c <= 0x39) return 'EN';
    if ((c >= 0x41 && c <= 0x5A) || (c >= 0x61 && c <= 0x7A)) return 'L';
    if (c === 0x20 || c === 0x0C) return 'WS';
    if (c === 0x09 || c === 0x0B || c === 0x1F) return 'S';
    if (c === 0x0A || c === 0x0D || (c >= 0x1C && c <= 0x1E)) return 'B';
    if (c === 0x2B || c === 0x2D) return 'ES';
    if (c === 0x23 || c === 0x24 || c === 0x25) return 'ET';
    if (c === 0x2C || c === 0x2E || c === 0x2F || c === 0x3A) return 'CS';
    return c < 0x20 || c === 0x7F ? 'BN' : 'ON';
  }
  if (c === 0x200E) return 'L';
  if (c === 0x200F) return 'R';
  if (c === 0x061C) return 'AL';
  if ((c >= 0x200B && c <= 0x200D) || (c >= 0x202A && c <= 0x202E) || (c >= 0x2060 && c <= 0x2069) || c === 0xFEFF || c === 0xAD) return 'BN';
  if (c >= 0x0590 && c <= 0x05FF) return (c >= 0x0591 && c <= 0x05BD) || c === 0x05BF || c === 0x05C1 || c === 0x05C2 || c === 0x05C4 || c === 0x05C5 || c === 0x05C7 ? 'NSM' : 'R';
  if (c >= 0x0600 && c <= 0x07BF) {
    if (c <= 0x0605 || c === 0x06DD || (c >= 0x0660 && c <= 0x0669) || c === 0x066B || c === 0x066C) return 'AN';
    if (c === 0x0606 || c === 0x0607 || c === 0x060E || c === 0x060F || c === 0x06DE || c === 0x06E9) return 'ON';
    if (c === 0x0609 || c === 0x060A || c === 0x066A) return 'ET';
    if (c === 0x060C) return 'CS';
    if (c >= 0x06F0 && c <= 0x06F9) return 'EN';
    if ((c >= 0x0610 && c <= 0x061A) || (c >= 0x064B && c <= 0x065F) || c === 0x0670 || (c >= 0x06D6 && c <= 0x06DC) || (c >= 0x06DF && c <= 0x06E4) || c === 0x06E7 || c === 0x06E8
      || (c >= 0x06EA && c <= 0x06ED) || c === 0x0711 || (c >= 0x0730 && c <= 0x074A) || (c >= 0x07A6 && c <= 0x07B0)) return 'NSM';
    return 'AL';
  }
  if (c >= 0x07C0 && c <= 0x085F) return (c >= 0x07EB && c <= 0x07F3) || c === 0x07FD || (c >= 0x0816 && c <= 0x082D && c !== 0x081A && c !== 0x0824 && c !== 0x0828) || (c >= 0x0859 && c <= 0x085B) ? 'NSM' : 'R';
  if (c >= 0x0860 && c <= 0x08FF) return c === 0x08E2 ? 'AN' : c >= 0x08D3 || (c >= 0x0898 && c <= 0x089F) ? 'NSM' : 'AL';
  if (c >= 0xFB1D && c <= 0xFB4F) return c === 0xFB1E ? 'NSM' : c === 0xFB29 ? 'ES' : 'R';
  if (c >= 0xFB50 && c <= 0xFDFF) return c === 0xFD3E || c === 0xFD3F ? 'ON' : 'AL';
  if (c >= 0xFE70 && c <= 0xFEFE) return 'AL';
  if (c === 0xA0 || c === 0x202F || c === 0x2044) return 'CS';
  if ((c >= 0xA2 && c <= 0xA5) || c === 0xB0 || c === 0xB1 || (c >= 0x2030 && c <= 0x2034) || (c >= 0x20A0 && c <= 0x20CF) || c === 0x2213) return 'ET';
  if (c === 0xB2 || c === 0xB3 || c === 0xB9 || c === 0x2070 || (c >= 0x2074 && c <= 0x2079) || (c >= 0x2080 && c <= 0x2089) || (c >= 0xFF10 && c <= 0xFF19)) return 'EN';
  if (c === 0x2212 || c === 0x207A || c === 0x207B || c === 0x208A || c === 0x208B) return 'ES';
  if ((c >= 0x2000 && c <= 0x200A) || c === 0x2028 || c === 0x205F || c === 0x3000 || c === 0x1680) return 'WS';
  if (c === 0x2029 || c === 0x85) return 'B';
  const ch = String.fromCodePoint(c);
  if (RE_NSM.test(ch)) return 'NSM';
  if (RE_L.test(ch)) return 'L';
  if (RE_PS.test(ch)) return 'ON';
  return 'L';
}

/** The paragraph direction by its first strong character (P2-P3), or null when the text has none. */
export function firstStrong(s) {
  for (const ch of String(s)) { const k = bidiClass(ch.codePointAt(0)); if (k === 'L') return 'ltr'; if (k === 'R' || k === 'AL') return 'rtl'; }
  return null;
}

const OPEN = { '(': ')', '[': ']', '{': '}' }, CLOSE = { ')': '(', ']': '[', '}': '{' };
const strongOf = (t) => (t === 'L' ? 'L' : t === 'R' || t === 'EN' || t === 'AN' ? 'R' : null);

/** Resolved embedding levels of the code points `cps` (one paragraph, no explicit controls). → { levels: number[], base, types (original classes) } */
function levelsOfCps(cps, dir) {
  const orig = cps.map(bidiClass), n = cps.length;
  let base = dir === 'rtl' ? 1 : dir === 'ltr' ? 0 : -1;
  if (base < 0) { base = 0; for (const t of orig) { if (t === 'L') break; if (t === 'R' || t === 'AL') { base = 1; break; } } }
  const e = base ? 'R' : 'L';
  const idx = [];
  for (let i = 0; i < n; i++) if (orig[i] !== 'BN') idx.push(i);   // X9: boundary neutrals take no part
  const m = idx.length, T = idx.map((i) => orig[i]);
  // W1: a nonspacing mark takes the type of what it sits on
  for (let k = 0, prev = e; k < m; k++) { if (T[k] === 'NSM') T[k] = prev; prev = T[k]; }
  // W2: a European number after an Arabic letter is an Arabic number        W3: Arabic letters are R from here on
  for (let k = 0, last = e; k < m; k++) { const t = T[k]; if (t === 'L' || t === 'R' || t === 'AL') last = t; else if (t === 'EN' && last === 'AL') T[k] = 'AN'; }
  for (let k = 0; k < m; k++) if (T[k] === 'AL') T[k] = 'R';
  // W4: one separator between two numbers of a kind joins them
  for (let k = 1; k + 1 < m; k++) {
    if (T[k] === 'ES' && T[k - 1] === 'EN' && T[k + 1] === 'EN') T[k] = 'EN';
    else if (T[k] === 'CS' && T[k - 1] === T[k + 1] && (T[k - 1] === 'EN' || T[k - 1] === 'AN')) T[k] = T[k - 1];
  }
  // W5: number terminators beside a European number belong to it
  for (let k = 0; k < m; k++) {
    if (T[k] !== 'ET') continue;
    let z = k; while (z + 1 < m && T[z + 1] === 'ET') z++;
    if ((k > 0 && T[k - 1] === 'EN') || (z + 1 < m && T[z + 1] === 'EN')) for (let q = k; q <= z; q++) T[q] = 'EN';
    k = z;
  }
  // W6: what is left of them is neutral        W7: a European number after a Latin letter is L
  for (let k = 0; k < m; k++) if (T[k] === 'ES' || T[k] === 'ET' || T[k] === 'CS') T[k] = 'ON';
  for (let k = 0, last = e; k < m; k++) { const t = T[k]; if (t === 'L' || t === 'R') last = t; else if (t === 'EN' && last === 'L') T[k] = 'L'; }
  // N0: a pair of brackets takes one direction (the common pairs)
  const stack = [], pairs = [];
  for (let k = 0; k < m; k++) {
    if (T[k] !== 'ON') continue;
    const ch = String.fromCodePoint(cps[idx[k]]);
    if (OPEN[ch]) { if (stack.length < 63) stack.push([k, ch]); else break; }
    else if (CLOSE[ch]) { for (let q = stack.length - 1; q >= 0; q--) if (stack[q][1] === CLOSE[ch]) { pairs.push([stack[q][0], k]); stack.length = q; break; } }
  }
  pairs.sort((a, b) => a[0] - b[0]);
  for (const [a, b] of pairs) {
    let same = false, other = false;
    for (let k = a + 1; k < b; k++) { const s = strongOf(T[k]); if (s === e) { same = true; break; } if (s) other = true; }
    let set = null;
    if (same) set = e;
    else if (other) { let ctx = e; for (let k = a - 1; k >= 0; k--) { const s = strongOf(T[k]); if (s) { ctx = s; break; } } set = ctx !== e ? ctx : e; }
    if (set) { T[a] = set; T[b] = set; }
  }
  // N1 / N2: neutrals between two stretches of one direction take it, the others take the paragraph's
  const NI = (t) => t === 'B' || t === 'S' || t === 'WS' || t === 'ON';
  for (let k = 0; k < m; k++) {
    if (!NI(T[k])) continue;
    let z = k; while (z + 1 < m && NI(T[z + 1])) z++;
    const before = k > 0 ? strongOf(T[k - 1]) || e : e, after = z + 1 < m ? strongOf(T[z + 1]) || e : e;
    const set = before === after ? before : e;
    for (let q = k; q <= z; q++) T[q] = set;
    k = z;
  }
  // I1 / I2
  const levels = new Array(n).fill(base);
  for (let k = 0; k < m; k++) { const t = T[k]; levels[idx[k]] = base ? (t === 'R' ? 1 : 2) : (t === 'R' ? 1 : t === 'L' ? 0 : 2); }
  for (let i = 0; i < n; i++) if (orig[i] === 'BN') levels[i] = i ? levels[i - 1] : base;
  // L1: separators and the white space before them or at the end go back to the paragraph's level
  for (let i = n - 1, tail = true; i >= 0; i--) {
    const t = orig[i];
    if (t === 'B' || t === 'S') { levels[i] = base; tail = true; }
    else if (tail && (t === 'WS' || t === 'BN')) levels[i] = base;
    else tail = false;
  }
  return { levels, base, types: orig };
}

/** Embedding levels of a line, one per UTF-16 unit of `s` (so they index the string). dir: 'rtl' | 'ltr' | undefined = by the first strong character. */
export function bidiLevels(s, dir) {
  const str = String(s), cps = Array.from(str, (ch) => ch.codePointAt(0));
  const r = levelsOfCps(cps, dir), levels = [];
  cps.forEach((c, i) => { levels.push(r.levels[i]); if (c > 0xFFFF) levels.push(r.levels[i]); });
  return { levels, base: r.base, rtl: r.base === 1 };
}

const MIRROR2 = { ...MIRROR, '‹': '›', '›': '‹', '≤': '≥', '≥': '≤' };
/** Reorder items that carry a level (L2): from the highest level down to the lowest odd one, each stretch at or above it is reversed. */
export function reorderByLevel(items) {
  const out = items.slice();
  let hi = 0, lo = 99;
  for (const it of out) { if (it.level > hi) hi = it.level; if (it.level % 2 && it.level < lo) lo = it.level; }
  for (let lv = hi; lv >= lo && lv >= 1; lv--) {
    for (let i = 0; i < out.length; i++) {
      if (out[i].level < lv) continue;
      let j = i; while (j + 1 < out.length && out[j + 1].level >= lv) j++;
      for (let a = i, b = j; a < b; a++, b--) { const x = out[a]; out[a] = out[b]; out[b] = x; }
      i = j;
    }
  }
  return out;
}

/**
 * A line of text in the order to draw it left to right. The string is first joined (shapeArabic, unless shape: false), then ordered; a mark stays after
 * its letter, brackets in right-to-left stretches are mirrored, direction controls are dropped.
 * → { text, rtl (the line reads right to left), pieces: [{ text, level }] (stretches of one level, left to right) }; a line with nothing right-to-left comes back as it is.
 */
export function visualLine(s, o = {}) {
  const str = String(s ?? '');
  if (!o.dir && !hasRtl(str)) return { text: str, rtl: false, pieces: str ? [{ text: str, level: 0 }] : [] };
  const shaped = o.shape === false ? str : shapeArabic(str, o);
  const cps = Array.from(shaped, (ch) => ch.codePointAt(0));
  const r = levelsOfCps(cps, o.dir);   // before / after only join letters (shapeArabic): a piece of a longer line is ordered on its own
  const units = [];
  for (let i = 0; i < cps.length; i++) {
    const t = r.types[i];
    if (t === 'BN') continue;
    if (t === 'NSM' && units.length) { units[units.length - 1].text += String.fromCodePoint(cps[i]); continue; }
    units.push({ text: String.fromCodePoint(cps[i]), level: r.levels[i] });
  }
  for (const u of units) if (u.level % 2) { const first = String.fromCodePoint(u.text.codePointAt(0)); if (MIRROR2[first]) u.text = MIRROR2[first] + u.text.slice(first.length); }
  const vis = reorderByLevel(units), pieces = [];
  for (const u of vis) { const last = pieces[pieces.length - 1]; if (last && last.level === u.level) last.text += u.text; else pieces.push({ text: u.text, level: u.level }); }
  return { text: vis.map((u) => u.text).join(''), rtl: r.base === 1, pieces };
}
