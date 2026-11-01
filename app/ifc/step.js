/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its errors are English (an app translates what it shows). */
/**
 * step.js — ISO 10303-21 ("STEP physical file", the .ifc text format) for cc-ifc: an index built in one pass over the
 * bytes, and a parser for one instance's parameters, run only when that instance is read. Written from ISO 10303-21:2016
 * (clauses 5–7: tokens, header section, data section, string encoding). DOM-free; runs in a Worker (open-async.js).
 *
 *   const ix = scanStep(bytes)          → { count, ids, starts, ends, types, names, maxId, header, schema, errors }
 *       ids[i]     instance number of record i (file order)
 *       starts[i]  byte offset of the "(" after its keyword (or of the "(" of a complex instance)
 *       ends[i]    byte offset of its closing ";"
 *       types[i]   index into names (upper-case keyword, e.g. "IFCWALL"; "" for a complex instance)
 *   parseParams(bytes, start, end)     → [value…]  the instance's parameter list
 *   parseComplex(bytes, start, end)    → [{ type, params }…]  the parts of a complex instance "(A(..)B(..))"
 *
 * Parameter values (the "raw" form every other cc-ifc module reads):
 *   null              $            (unset)
 *   DERIVED           *            (derived / redeclared; written back as *)
 *   number            1, -2.5, 1.E-3   (REAL or INTEGER: the schema says which)
 *   string            'text'       (decoded: '' → ', \\ → \, \S\, \X\hh, \X2\…\X0\, \X4\…\X0\; raw UTF-8 accepted too)
 *   { ref: n }        #n
 *   { enum: 'X' }     .X.          (.T. .F. .U. too: BOOLEAN / LOGICAL)
 *   { bin: 'hex' }    "0AF"        (binary: first digit = unused bits, then hex)
 *   { typed: 'IFCLABEL', value }   IFCLABEL('x')  (a defined type named in a SELECT)
 *   [ … ]             ( … )        (aggregate; nested)
 *
 * Writing: formatValue(v, { real }) / formatString(s) / formatReal(x) give the Part 21 text of a raw value.
 */

export const DERIVED = Object.freeze({ derived: true });

const C_HASH = 35, C_EQ = 61, C_SEMI = 59, C_LP = 40, C_RP = 41, C_COMMA = 44, C_QUOTE = 39, C_DQUOTE = 34;
const C_SLASH = 47, C_STAR = 42, C_DOLLAR = 36, C_DOT = 46, C_MINUS = 45, C_PLUS = 43, C_BSL = 92;

export class StepError extends Error {
  constructor(message, offset) { super(message + (offset !== undefined ? ' (at byte ' + offset + ')' : '')); this.name = 'StepError'; this.offset = offset; }
}

const isSpace = (c) => c === 32 || c === 10 || c === 13 || c === 9 || c === 12 || c === 11;
const isDigit = (c) => c >= 48 && c <= 57;
const isKeyChar = (c) => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || isDigit(c) || c === 95 || c === C_MINUS || c === 33;

/** Skip blanks and comments from i; → the first other byte's offset. */
function skip(b, i, end) {
  for (;;) {
    while (i < end && isSpace(b[i])) i++;
    if (i + 1 < end && b[i] === C_SLASH && b[i + 1] === C_STAR) {
      i += 2;
      while (i + 1 < end && !(b[i] === C_STAR && b[i + 1] === C_SLASH)) i++;
      i += 2;
      continue;
    }
    return i;
  }
}

/** Offset just past a quoted string starting at i (b[i] is the quote). */
function pastString(b, i, end) {
  i++;
  for (;;) {
    while (i < end && b[i] !== C_QUOTE) i++;
    if (i >= end) throw new StepError('A text value is not closed', i);
    if (i + 1 < end && b[i + 1] === C_QUOTE) { i += 2; continue; }
    return i + 1;
  }
}

/** Offset of the ";" ending the statement that continues at i (strings, binaries and comments skipped). */
function statementEnd(b, i, end) {
  while (i < end) {
    const c = b[i];
    if (c === C_SEMI) return i;
    if (c === C_QUOTE) { i = pastString(b, i, end); continue; }
    if (c === C_DQUOTE) { i++; while (i < end && b[i] !== C_DQUOTE) i++; i++; continue; }
    if (c === C_SLASH && i + 1 < end && b[i + 1] === C_STAR) { i += 2; while (i + 1 < end && !(b[i] === C_STAR && b[i + 1] === C_SLASH)) i++; i += 2; continue; }
    i++;
  }
  return -1;
}

function keywordAt(b, i, end) {
  let j = i;
  while (j < end && isKeyChar(b[j])) j++;
  let s = '';
  for (let k = i; k < j; k++) s += String.fromCharCode(b[k]);
  return { name: s.toUpperCase(), next: j };
}

/** Find an ASCII token (upper case) at a statement boundary from `from`. */
function findToken(b, token, from, end) {
  const t0 = token.charCodeAt(0), n = token.length;
  let i = from;
  while (i < end) {
    i = skip(b, i, end);
    if (i >= end) return -1;
    if (b[i] === t0 || b[i] === t0 + 32) {
      let ok = true;
      for (let k = 1; k < n && ok; k++) { const c = b[i + k]; const want = token.charCodeAt(k); ok = c === want || (want >= 65 && want <= 90 && c === want + 32); }
      if (ok && !isKeyChar(b[i + n] ?? 0)) return i;
    }
    const e = statementEnd(b, i, end);
    if (e < 0) return -1;
    i = e + 1;
  }
  return -1;
}

/**
 * Index every instance of the DATA section(s). Fails only when the file is not Part 21 at all; a broken instance is
 * skipped and listed in `errors` (with its byte offset), as a damaged file still opens.
 */
export function scanStep(bytes) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const end = b.length;
  let i = skip(b, 0, end);
  if (b[i] === 0xEF && b[i + 1] === 0xBB && b[i + 2] === 0xBF) i = skip(b, i + 3, end);   // a UTF-8 byte order mark
  const magic = keywordAt(b, i, end);
  if (magic.name !== 'ISO-10303-21') throw new StepError('Not an IFC (STEP) file: it does not start with ISO-10303-21;');

  const header = { description: null, name: null, schema: [], raw: {} };
  const hdr = findToken(b, 'HEADER', i, end);
  const data0 = findToken(b, 'DATA', i, end);
  if (data0 < 0) throw new StepError('This file has no DATA section.');
  if (hdr >= 0 && hdr < data0) readHeader(b, statementEnd(b, hdr, end) + 1, data0, header);

  let cap = Math.max(1024, Math.min(1 << 24, (end / 60) | 0));
  let ids = new Int32Array(cap), starts = new Uint32Array(cap), ends = new Uint32Array(cap), types = new Uint16Array(cap);
  const names = [''], nameIdx = new Map([['', 0]]);
  const errors = [];
  let count = 0, maxId = 0;

  i = statementEnd(b, data0, end) + 1;   // past "DATA;" (or "DATA(…);" in edition 3)
  while (i < end) {
    i = skip(b, i, end);
    if (i >= end) break;
    const c = b[i];
    if (c !== C_HASH) {
      const kw = keywordAt(b, i, end);
      if (kw.name === 'ENDSEC') {
        // another DATA section may follow (edition 3); otherwise this is the end
        const more = findToken(b, 'DATA', kw.next, end);
        if (more < 0) break;
        i = statementEnd(b, more, end) + 1;
        continue;
      }
      const e = statementEnd(b, i, end);
      errors.push({ offset: i, message: 'Unexpected text in the DATA section' });
      if (e < 0) break;
      i = e + 1;
      continue;
    }
    let j = i + 1, id = 0;
    while (j < end && isDigit(b[j])) { id = id * 10 + (b[j] - 48); j++; }
    j = skip(b, j, end);
    const e = statementEnd(b, j, end);
    if (e < 0) { errors.push({ offset: i, message: 'An instance is not closed with ;' }); break; }
    if (j === i + 1 || b[j] !== C_EQ) { errors.push({ offset: i, message: 'Expected #n=' }); i = e + 1; continue; }
    j = skip(b, j + 1, end);
    let t = 0, start;
    if (b[j] === C_LP) { start = j; }   // complex instance (A(..)B(..))
    else {
      const kw = keywordAt(b, j, end);
      if (!kw.name) { errors.push({ offset: i, message: 'Expected an entity name' }); i = e + 1; continue; }
      t = nameIdx.get(kw.name);
      if (t === undefined) { t = names.length; names.push(kw.name); nameIdx.set(kw.name, t); }
      start = skip(b, kw.next, end);
      if (b[start] !== C_LP) { errors.push({ offset: i, message: 'Expected ( after ' + kw.name }); i = e + 1; continue; }
    }
    if (count === cap) {
      cap *= 2;
      const grow = (a, T) => { const n = new T(cap); n.set(a); return n; };
      ids = grow(ids, Int32Array); starts = grow(starts, Uint32Array); ends = grow(ends, Uint32Array); types = grow(types, Uint16Array);
    }
    ids[count] = id; starts[count] = start; ends[count] = e; types[count] = t; count++;
    if (id > maxId) maxId = id;
    i = e + 1;
  }
  const schema = header.schema[0] || '';
  return {
    count, maxId, names, header, schema, errors,
    ids: ids.subarray(0, count), starts: starts.subarray(0, count), ends: ends.subarray(0, count), types: types.subarray(0, count),
  };
}

function readHeader(b, i, end, header) {
  while (i < end) {
    i = skip(b, i, end);
    if (i >= end) break;
    const kw = keywordAt(b, i, end);
    const e = statementEnd(b, i, end);
    if (e < 0 || kw.name === 'ENDSEC') break;
    const p = skip(b, kw.next, end);
    if (b[p] === C_LP) {
      let params = null;
      try { params = parseParams(b, p, e); } catch (err) { params = null; }
      if (params) {
        header.raw[kw.name] = params;
        if (kw.name === 'FILE_DESCRIPTION') header.description = params;
        if (kw.name === 'FILE_NAME') header.name = params;
        if (kw.name === 'FILE_SCHEMA') header.schema = (Array.isArray(params[0]) ? params[0] : []).filter((s) => typeof s === 'string').map((s) => s.trim().toUpperCase());
      }
    }
    i = e + 1;
  }
}

/** The parameter list of one instance: b[start] is "(" and end the ";" offset (or any offset past the ")"). */
export function parseParams(b, start, end) {
  const p = new Parser(b, start, end);
  const v = p.list();
  return v;
}

/** A complex instance "(A(…)B(…))" → [{ type, params }] in file order. */
export function parseComplex(b, start, end) {
  const out = [];
  let i = skip(b, start + 1, end);
  while (i < end && b[i] !== C_RP) {
    const kw = keywordAt(b, i, end);
    const p = new Parser(b, skip(b, kw.next, end), end);
    out.push({ type: kw.name, params: p.list() });
    i = skip(b, p.i, end);
  }
  return out;
}

class Parser {
  constructor(b, i, end) { this.b = b; this.i = i; this.end = end; }

  fail(msg) { throw new StepError(msg, this.i); }

  list() {
    const b = this.b;
    this.i = skip(b, this.i, this.end);
    if (b[this.i] !== C_LP) this.fail('Expected (');
    this.i++;
    const out = [];
    this.i = skip(b, this.i, this.end);
    if (b[this.i] === C_RP) { this.i++; return out; }
    for (;;) {
      out.push(this.value());
      this.i = skip(b, this.i, this.end);
      const c = b[this.i];
      if (c === C_COMMA) { this.i++; continue; }
      if (c === C_RP) { this.i++; return out; }
      this.fail('Expected , or )');
    }
  }

  value() {
    const b = this.b;
    this.i = skip(b, this.i, this.end);
    const c = b[this.i];
    if (c === C_DOLLAR) { this.i++; return null; }
    if (c === C_STAR) { this.i++; return DERIVED; }
    if (c === C_HASH) {
      let j = this.i + 1, n = 0;
      while (isDigit(b[j])) { n = n * 10 + (b[j] - 48); j++; }
      if (j === this.i + 1) this.fail('Expected a number after #');
      this.i = j;
      return { ref: n };
    }
    if (c === C_QUOTE) {
      const s = this.i + 1, e = pastString(b, this.i, this.end);
      this.i = e;
      return decodeString(b, s, e - 1);
    }
    if (c === C_DOT) {
      let j = this.i + 1;
      while (j < this.end && b[j] !== C_DOT) j++;
      let s = '';
      for (let k = this.i + 1; k < j; k++) s += String.fromCharCode(b[k]);
      this.i = j + 1;
      return { enum: s.trim().toUpperCase() };
    }
    if (c === C_LP) return this.list();
    if (c === C_DQUOTE) {
      let j = this.i + 1, s = '';
      while (j < this.end && b[j] !== C_DQUOTE) s += String.fromCharCode(b[j++]);
      this.i = j + 1;
      return { bin: s };
    }
    if (isDigit(c) || c === C_MINUS || c === C_PLUS || c === C_DOT) return this.number();
    if (isKeyChar(c)) {
      const kw = keywordAt(b, this.i, this.end);
      this.i = skip(b, kw.next, this.end);
      if (b[this.i] !== C_LP) this.fail('Expected ( after ' + kw.name);
      const inner = this.list();
      return { typed: kw.name, value: inner.length === 1 ? inner[0] : inner };
    }
    this.fail('Unexpected character ' + JSON.stringify(String.fromCharCode(c)));
  }

  number() {
    const b = this.b;
    let j = this.i, s = '';
    while (j < this.end) {
      const c = b[j];
      if (isDigit(c) || c === C_MINUS || c === C_PLUS || c === C_DOT || c === 69 || c === 101) { s += String.fromCharCode(c); j++; }
      else break;
    }
    this.i = j;
    // "1." and "1.E5" are valid Part 21 reals; Number() takes both
    const n = Number(s.endsWith('.') ? s + '0' : s.replace(/\.(?=[eE])/, '.0'));
    if (!Number.isFinite(n)) this.fail('Bad number ' + s);
    return n;
  }
}

const UTF8 = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { fatal: true }) : null;

/** The text of a string token b[s..e) (between the quotes): raw bytes → characters, then the Part 21 escapes. */
export function decodeString(b, s, e) {
  let ascii = true, quote = false, bsl = false;
  for (let k = s; k < e; k++) { const c = b[k]; if (c >= 128) ascii = false; else if (c === C_QUOTE) quote = true; else if (c === C_BSL) bsl = true; }
  let t;
  if (ascii) {
    t = '';
    for (let k = s; k < e; k += 4096) t += String.fromCharCode.apply(null, b.subarray(k, Math.min(e, k + 4096)));
  } else {
    // Part 21 allows only 0x20–0x7E, but many exporters write UTF-8 (or Latin-1) as it is: take what decodes.
    try { t = UTF8 ? UTF8.decode(b.subarray(s, e)) : latin1(b, s, e); } catch (err) { t = latin1(b, s, e); }
  }
  if (quote) t = t.replace(/''/g, "'");
  return bsl ? unescapeStep(t) : t;
}

function latin1(b, s, e) { let t = ''; for (let k = s; k < e; k++) t += String.fromCharCode(b[k]); return t; }

const hexVal = (h) => parseInt(h, 16);

/** \\ \S\c \P?\ \X\hh \X2\hhhh…\X0\ \X4\hhhhhhhh…\X0\ (ISO 10303-21 7.3.3). Unknown or broken directives stay as text. */
export function unescapeStep(t) {
  let out = '', i = 0;
  const n = t.length;
  while (i < n) {
    const c = t[i];
    if (c !== '\\') { out += c; i++; continue; }
    const d = t.slice(i, i + 4).toUpperCase();
    if (t[i + 1] === '\\') { out += '\\'; i += 2; continue; }
    if (d.startsWith('\\S\\') && i + 3 < n) { out += String.fromCharCode(t.charCodeAt(i + 3) + 128); i += 4; continue; }
    if (d.startsWith('\\P') && t[i + 3] === '\\') { i += 4; continue; }   // code page switch: Latin-1 assumed
    if (d.startsWith('\\X\\') && /^[0-9A-Fa-f]{2}$/.test(t.slice(i + 3, i + 5))) { out += String.fromCharCode(hexVal(t.slice(i + 3, i + 5))); i += 5; continue; }
    if (d === '\\X2\\' || d === '\\X4\\') {
      const w = d === '\\X2\\' ? 4 : 8;
      const close = t.toUpperCase().indexOf('\\X0\\', i + 4);
      if (close > 0) {
        const hex = t.slice(i + 4, close);
        if (hex.length % w === 0 && /^[0-9A-Fa-f]*$/.test(hex)) {
          for (let k = 0; k < hex.length; k += w) {
            const cp = hexVal(hex.slice(k, k + w));
            out += w === 4 ? String.fromCharCode(cp) : String.fromCodePoint(cp);
          }
          i = close + 4;
          continue;
        }
      }
    }
    out += c;
    i++;
  }
  return out;
}

// ---- writing ----

/** A string as a Part 21 token: printable ASCII as it is, '' and \\ doubled, everything else as \X2\ (or \X4\). */
export function formatString(s) {
  let out = "'", run = '';
  const flush = () => { if (run) { out += run; run = ''; } };
  let wide = '';
  const endWide = () => { if (wide) { out += '\\X2\\' + wide + '\\X0\\'; wide = ''; } };
  for (const ch of String(s)) {
    const cp = ch.codePointAt(0);
    if (cp >= 0x20 && cp <= 0x7E) {
      endWide();
      run += ch === "'" ? "''" : ch === '\\' ? '\\\\' : ch;
      continue;
    }
    flush();
    if (cp > 0xFFFF) { endWide(); out += '\\X4\\' + cp.toString(16).toUpperCase().padStart(8, '0') + '\\X0\\'; continue; }
    wide += cp.toString(16).toUpperCase().padStart(4, '0');
  }
  flush(); endWide();
  return out + "'";
}

/** A REAL token: always with a ".", exponent as E. */
export function formatReal(x) {
  if (!Number.isFinite(x)) throw new StepError('A real value must be finite');
  if (Object.is(x, -0)) x = 0;
  let s = String(x);
  if (/e/i.test(s)) {
    const [m, ex] = s.toLowerCase().split('e');
    return (m.includes('.') ? m : m + '.') + 'E' + ex.replace('+', '');
  }
  return s.includes('.') ? s : s + '.';
}

export function formatInteger(x) {
  if (!Number.isFinite(x)) throw new StepError('An integer value must be finite');
  return String(Math.round(x));
}

/**
 * The Part 21 text of a raw value. `real(path)` is asked for a bare number whether it is a REAL (true) or an INTEGER;
 * omitted → integers stay integers. Typed values decide from their own type name through `realType(name)`.
 */
export function formatValue(v, real = () => false, realType = () => true, path = '') {
  if (v === null || v === undefined) return '$';
  if (v === DERIVED) return '*';
  if (typeof v === 'number') return real(path) ? formatReal(v) : (Number.isInteger(v) ? formatInteger(v) : formatReal(v));
  if (typeof v === 'string') return formatString(v);
  if (typeof v === 'boolean') return v ? '.T.' : '.F.';
  if (Array.isArray(v)) return '(' + v.map((x, k) => formatValue(x, real, realType, path + '/' + k)).join(',') + ')';
  if ('ref' in v) return '#' + v.ref;
  if ('enum' in v) return '.' + v.enum + '.';
  if ('bin' in v) return '"' + v.bin + '"';
  if ('typed' in v) {
    const isReal = realType(v.typed);
    return v.typed + '(' + formatValue(v.value, () => isReal, realType) + ')';
  }
  throw new StepError('Cannot write value ' + JSON.stringify(v));
}

