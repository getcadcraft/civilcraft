/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; its errors are English (an app translates what it shows). */
/**
 * xsd-regex.js — XML Schema regular expressions (XSD 1.0 Part 2, Appendix F: what IDS xs:pattern uses) → JavaScript RegExp.
 * DOM-free and import-free.
 *
 *   xsdRegExp(pattern) → RegExp   matches the WHOLE value (XSD patterns are implicitly anchored); throws XsdRegexError
 *
 * The differences handled (each is a place a plain `new RegExp(pattern)` would answer differently):
 *   - implicit anchoring: the result is ^(?:…)$ with the u flag (code points, not UTF-16 halves)
 *   - "." is any character but \n and \r
 *   - "^" and "$" are ordinary characters in XSD. One leading "^" and one trailing "$" are read as the anchors people mean
 *     (IDS files in the wild write ^…$; the anchors change nothing on a pattern that is anchored anyway); elsewhere literal
 *   - \d = \p{Nd}; \s = [ \t\n\r]; \w = [^\p{P}\p{Z}\p{C}]; \i / \c = XML name start / name characters; \D \S \W \I \C negate
 *   - \p{IsBlock} Unicode block escapes (the common blocks; an unknown block is an error, never silently "anything")
 *   - character class subtraction [a-z-[aeiou]], nested to any depth
 *   - (? constructs, back references and other Perl syntax are not XSD: errors
 * An escape XSD does not define but that can only mean the character itself (\/ \' \" \: …) is read as that character.
 */

export class XsdRegexError extends Error { constructor(message) { super(message); this.name = 'XsdRegexError'; } }

const NAME_START = ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\u{10000}-\\u{EFFFF}';
const NAME_CHAR = NAME_START + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
const ANY = '[\\s\\S]';
const CATS = new Set(['L', 'Lu', 'Ll', 'Lt', 'Lm', 'Lo', 'M', 'Mn', 'Mc', 'Me', 'N', 'Nd', 'Nl', 'No', 'P', 'Pc', 'Pd', 'Ps', 'Pe', 'Pi', 'Pf', 'Po',
  'Z', 'Zs', 'Zl', 'Zp', 'S', 'Sm', 'Sc', 'Sk', 'So', 'C', 'Cc', 'Cf', 'Co', 'Cn']);
// Unicode blocks (the XSD 1.0 names, spaces and hyphens removed as XSD writes them): first and last code point
const BLOCKS = {
  BasicLatin: [0x0000, 0x007F], 'Latin-1Supplement': [0x0080, 0x00FF], LatinExtended_A: [0x0100, 0x017F], 'LatinExtended-A': [0x0100, 0x017F],
  'LatinExtended-B': [0x0180, 0x024F], IPAExtensions: [0x0250, 0x02AF], SpacingModifierLetters: [0x02B0, 0x02FF], CombiningDiacriticalMarks: [0x0300, 0x036F],
  Greek: [0x0370, 0x03FF], GreekandCoptic: [0x0370, 0x03FF], Cyrillic: [0x0400, 0x04FF], Armenian: [0x0530, 0x058F], Hebrew: [0x0590, 0x05FF],
  Arabic: [0x0600, 0x06FF], Syriac: [0x0700, 0x074F], Thaana: [0x0780, 0x07BF], Devanagari: [0x0900, 0x097F], Bengali: [0x0980, 0x09FF],
  Thai: [0x0E00, 0x0E7F], Georgian: [0x10A0, 0x10FF], HangulJamo: [0x1100, 0x11FF], LatinExtendedAdditional: [0x1E00, 0x1EFF], GreekExtended: [0x1F00, 0x1FFF],
  GeneralPunctuation: [0x2000, 0x206F], SuperscriptsandSubscripts: [0x2070, 0x209F], CurrencySymbols: [0x20A0, 0x20CF], LetterlikeSymbols: [0x2100, 0x214F],
  NumberForms: [0x2150, 0x218F], Arrows: [0x2190, 0x21FF], MathematicalOperators: [0x2200, 0x22FF], MiscellaneousTechnical: [0x2300, 0x23FF],
  BoxDrawing: [0x2500, 0x257F], BlockElements: [0x2580, 0x259F], GeometricShapes: [0x25A0, 0x25FF], MiscellaneousSymbols: [0x2600, 0x26FF], Dingbats: [0x2700, 0x27BF],
  CJKSymbolsandPunctuation: [0x3000, 0x303F], Hiragana: [0x3040, 0x309F], Katakana: [0x30A0, 0x30FF], CJKUnifiedIdeographs: [0x4E00, 0x9FFF],
  HangulSyllables: [0xAC00, 0xD7AF], PrivateUse: [0xE000, 0xF8FF], CJKCompatibilityIdeographs: [0xF900, 0xFAFF], AlphabeticPresentationForms: [0xFB00, 0xFB4F],
  ArabicPresentationForms_A: [0xFB50, 0xFDFF], 'ArabicPresentationForms-A': [0xFB50, 0xFDFF], HalfwidthandFullwidthForms: [0xFF00, 0xFFEF], Specials: [0xFFF0, 0xFFFF],
};
const hex = (cp) => '\\u{' + cp.toString(16).toUpperCase() + '}';
const SINGLE = 'nrt\\|.?*+(){}-[]^';   // XSD SingleCharEsc
// a literal character in JS u-mode syntax: outside a class only syntax characters (and /) may be escaped; inside, also "-"
const ctl = (ch) => (ch === '\n' ? '\\n' : ch === '\r' ? '\\r' : ch === '\t' ? '\\t' : null);
const litOut = (ch) => ctl(ch) || (/[\\^$.*+?()[\]{}|/]/.test(ch) ? '\\' + ch : ch);
const lit = (ch) => ctl(ch) || (/[\\^\]\[-]/.test(ch) ? '\\' + ch : ch);

/** One class item: { simple: 'JS class body' } or { expr: 'JS expression matching one character' }. */
function property(neg, name) {
  if (name.startsWith('Is')) {
    const b = BLOCKS[name.slice(2)];
    if (!b) throw new XsdRegexError('Unknown Unicode block \\p{' + name + '}');
    const body = hex(b[0]) + '-' + hex(b[1]);
    return neg ? { expr: '(?:(?![' + body + '])' + ANY + ')', neg: body } : { simple: body };
  }
  if (!CATS.has(name)) throw new XsdRegexError('Unknown Unicode category \\p{' + name + '}');
  return { simple: (neg ? '\\P{' : '\\p{') + name + '}' };
}
function multi(c) {
  switch (c) {
    case 'd': return { simple: '\\p{Nd}' };
    case 'D': return { simple: '\\P{Nd}' };
    case 's': return { simple: ' \\t\\n\\r' };
    case 'S': return { expr: '[^ \\t\\n\\r]' };
    case 'w': return { expr: '[^\\p{P}\\p{Z}\\p{C}]' };
    case 'W': return { simple: '\\p{P}\\p{Z}\\p{C}' };
    case 'i': return { simple: NAME_START };
    case 'I': return { expr: '[^' + NAME_START + ']' };
    case 'c': return { simple: NAME_CHAR };
    case 'C': return { expr: '[^' + NAME_CHAR + ']' };
    default: return null;
  }
}

/** XSD pattern → RegExp matching the whole value. */
export function xsdRegExp(pattern) {
  const p = String(pattern);
  const cps = [...p];
  let i = 0;
  const n = cps.length;
  let start = 0, end = n;
  if (cps[0] === '^') start = 1;
  if (n > start && cps[n - 1] === '$' && cps[n - 2] !== '\\') end = n - 1;
  i = start;

  // an escape after "\": → { simple } | { expr } | { char }
  function escape() {
    const c = cps[i++];
    if (c === undefined) throw new XsdRegexError('The pattern ends with "\\"');
    if (c === 'p' || c === 'P') {
      if (cps[i] !== '{') throw new XsdRegexError('\\' + c + ' needs {…}');
      const close = cps.indexOf('}', i);
      if (close < 0) throw new XsdRegexError('\\' + c + '{ is not closed');
      const name = cps.slice(i + 1, close).join('');
      i = close + 1;
      return property(c === 'P', name);
    }
    const m = multi(c);
    if (m) return m;
    if (c === 'n') return { char: '\n' };
    if (c === 'r') return { char: '\r' };
    if (c === 't') return { char: '\t' };
    if (SINGLE.includes(c)) return { char: c };
    if (/[0-9A-Za-z]/.test(c)) throw new XsdRegexError('\\' + c + ' is not an XSD escape');   // back references, \b, \u… are not XSD
    return { char: c };   // \/ \' \" \: … : the character itself
  }

  // a character class after "[": → JS expression for one character
  function charClass() {
    let neg = false;
    if (cps[i] === '^') { neg = true; i++; }
    const simple = [], exprs = [];
    let sub = null, first = true;
    for (;;) {
      if (i >= n) throw new XsdRegexError('A character class is not closed');
      const c = cps[i];
      if (c === ']' && !first) { i++; break; }
      if (c === '-' && cps[i + 1] === '[' && !first) { i += 2; sub = charClass(); if (cps[i] !== ']') throw new XsdRegexError('A class subtraction must end the class'); i++; break; }
      first = false;
      let a;
      if (c === '\\') { i++; a = escape(); } else if (c === '[') throw new XsdRegexError('"[" must be escaped inside a class'); else { i++; a = { char: c }; }
      if (a.char !== undefined && cps[i] === '-' && cps[i + 1] !== ']' && cps[i + 1] !== '[' && i + 1 < n) {
        i++;
        let b;
        if (cps[i] === '\\') { i++; b = escape(); } else b = { char: cps[i++] };
        if (b.char === undefined) throw new XsdRegexError('A range must end on a single character');
        if (b.char.codePointAt(0) < a.char.codePointAt(0)) throw new XsdRegexError('A range runs backwards: ' + a.char + '-' + b.char);
        simple.push(lit(a.char) + '-' + lit(b.char));
        continue;
      }
      if (a.char !== undefined) simple.push(lit(a.char));
      else if (a.simple) simple.push(a.simple);
      else exprs.push(a.expr);
    }
    let pos;
    if (!exprs.length) pos = simple.length ? (neg ? '[^' : '[') + simple.join('') + ']' : neg ? ANY : '[]';
    else {
      const parts = (simple.length ? ['[' + simple.join('') + ']'] : []).concat(exprs);
      const union = '(?:' + parts.join('|') + ')';
      pos = neg ? '(?:(?!' + union + ')' + ANY + ')' : union;
    }
    return sub ? '(?:(?!' + sub + ')' + pos + ')' : pos;
  }

  let out = '', depth = 0, atom = false;
  while (i < end) {
    const c = cps[i];
    if (c === '\\') {
      i++;
      const a = escape();
      out += a.char !== undefined ? litOut(a.char) : a.simple ? '[' + a.simple + ']' : a.expr;
      atom = true;
    } else if (c === '[') { i++; out += charClass(); atom = true; }
    else if (c === '.') { i++; out += '[^\\n\\r]'; atom = true; }
    else if (c === '(') {
      if (cps[i + 1] === '?') throw new XsdRegexError('"(?" is not XSD syntax');
      i++; depth++; out += '('; atom = false;
    } else if (c === ')') {
      if (!depth) throw new XsdRegexError('")" without "("');
      i++; depth--; out += ')'; atom = true;
    } else if (c === '|') { i++; out += '|'; atom = false; }
    else if (c === '*' || c === '+' || c === '?') {
      if (!atom) throw new XsdRegexError('"' + c + '" has nothing to repeat');
      i++; out += c; atom = false;
      if (cps[i] === '?' || cps[i] === '+' || cps[i] === '*') throw new XsdRegexError('A quantifier cannot follow a quantifier');
    } else if (c === '{') {
      const close = cps.indexOf('}', i);
      const q = close < 0 ? '' : cps.slice(i + 1, close).join('');
      if (!/^\d+(,\d*)?$/.test(q)) throw new XsdRegexError('Bad quantifier {' + q + '}');
      const [lo, hi] = q.split(',');
      if (hi !== undefined && hi !== '' && Number(hi) < Number(lo)) throw new XsdRegexError('Bad quantifier {' + q + '}');
      if (!atom) throw new XsdRegexError('"{" has nothing to repeat');
      i = close + 1; out += '{' + q + '}'; atom = false;
    } else if (c === ']' || c === '}') throw new XsdRegexError('"' + c + '" must be escaped');
    else { i++; out += litOut(c); atom = true; }
  }
  if (depth) throw new XsdRegexError('"(" is not closed');
  try { return new RegExp('^(?:' + out + ')$', 'u'); } catch (e) { throw new XsdRegexError('The pattern cannot be used: ' + e.message); }
}
