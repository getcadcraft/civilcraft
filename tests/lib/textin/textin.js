/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a library with no UI; the errors are developer messages. */
/**
 * textin.js: a text file read as a list of parts, never as one string (PERF.20, 0.10; session scale-10). DOM-free.
 *
 * Every text reader used to start with `new TextDecoder().decode(bytes)` or `await file.text()`: one JS string for the whole file.
 * V8 stops a string at 536,870,888 characters (a 512 MB file), and a 100 MB one already costs 100+ MB of heap before the reader
 * has parsed a character. This module is the shared input half (lib/textout/chunks.js is the output half):
 *
 *   const text = decodeParts(bytes, { label: 'utf-8', fatal: false })    Uint8Array → TextParts (parts of about 4 MB, each ending
 *                                                                        right after a line feed except the last)
 *   const text = await decodePartsAsync(blobOrStream, opts)              the same from a Blob / File / ReadableStream, one slice at a time
 *   partsOf(x)       string | TextParts | string[]  → string[]            how a reader accepts "the text" in any of those forms
 *   lengthOf(x)      characters
 *   for (const line of linesOf(x, { crlf }))                              exactly the elements of text.split(/\r?\n/) (crlf false: split('\n')), one at a time
 *   startsWithText(x, s) · testParts(x, re)                              a prefix test, a regex test per part
 *   parseJsonParts(x) → value                                             JSON.parse of the parts (joined up to 400 M characters, else no whole-file string)
 *   text.string()  → one string, only while it fits (RangeError that names the parts otherwise)
 *   readJsonFile(file) → value                                            a project file: JSON.parse up to 32 MB, parts beyond
 *
 * A part ends right after a "\n" (byte 0x0A), which is never the second byte of a multibyte character in UTF-8, Shift-JIS, GBK,
 * Big5, EUC-KR or any single-byte code page, so each part decodes by itself and its text is the file's text cut at a line end.
 * UTF-16 and UTF-32 are not line-cut safe; decode those whole (they are not text formats this code reads).
 */
export const V8_MAX_STRING = 0x1FFFFFE8;   // 536,870,888
export const PART_BYTES = 4 << 20;

export class TextParts {
  constructor(parts = [], encoding = 'utf-8') { this.parts = parts; this.encoding = encoding; this.length = parts.reduce((n, p) => n + p.length, 0); }
  string() {
    if (this.length > V8_MAX_STRING) throw new RangeError('this text is ' + this.length + ' characters, more than one string can hold: read its parts (linesOf, partsOf)');
    return this.parts.length === 1 ? this.parts[0] : this.parts.join('');
  }
  blob(type = 'text/plain') { return new Blob(this.parts, { type }); }
  [Symbol.iterator]() { return this.parts[Symbol.iterator](); }
}

const cache = new Map();
function decoderFor(label, fatal, first) {
  const k = label + '|' + (fatal ? 1 : 0) + '|' + (first ? 1 : 0);
  let d = cache.get(k);
  if (!d) { d = new TextDecoder(label, { fatal: !!fatal, ignoreBOM: !first }); cache.set(k, d); }   // a BOM is only a BOM at the start of the file
  return d;
}

/** The end (exclusive) of the slice that starts at `from`: just after the first "\n" at or past from + want, else the end. */
function sliceEnd(bytes, from, want) {
  const target = from + want;
  if (target >= bytes.length) return bytes.length;
  const i = bytes.indexOf(10, target);
  return i < 0 ? bytes.length : i + 1;
}

/** bytes → TextParts. `fatal` throws a TypeError at the first byte that is not valid in the label (as TextDecoder fatal does). */
export function decodeParts(bytes, { label = 'utf-8', fatal = false, partBytes = PART_BYTES } = {}) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes.buffer || bytes, bytes.byteOffset || 0, bytes.byteLength);
  const parts = [];
  for (let a = 0; a < u8.length;) {
    const b = sliceEnd(u8, a, partBytes);
    parts.push(decoderFor(label, fatal, a === 0).decode(u8.subarray(a, b)));
    a = b;
  }
  if (!parts.length) parts.push('');
  return new TextParts(parts, label);
}

/** A Blob / File / ReadableStream / async iterable of Uint8Array → TextParts, a slice at a time (the file is never one buffer). */
export async function decodePartsAsync(source, { label = 'utf-8', fatal = false, partBytes = PART_BYTES } = {}) {
  const parts = [];
  let carry = null, first = true;
  const take = (bytes, last) => {
    // `bytes` = carry + new data; cut at the last line feed, keep the rest as the next carry
    let end = last ? bytes.length : bytes.lastIndexOf(10) + 1;
    if (end <= 0) { carry = bytes; return; }
    parts.push(decoderFor(label, fatal, first).decode(bytes.subarray(0, end))); first = false;
    carry = end < bytes.length ? bytes.slice(end) : null;
  };
  const join = (a, b) => { if (!a) return b; const c = new Uint8Array(a.length + b.length); c.set(a); c.set(b, a.length); return c; };
  if (typeof source.slice === 'function' && typeof source.size === 'number') {
    for (let off = 0; off < source.size; off += partBytes) {
      const buf = new Uint8Array(await source.slice(off, Math.min(source.size, off + partBytes)).arrayBuffer());
      take(join(carry, buf), false);
    }
  } else {
    const it = typeof source.getReader === 'function' ? (async function* () { const r = source.getReader(); for (;;) { const { done, value } = await r.read(); if (done) return; yield value; } })() : source;
    let acc = null;
    for await (const chunk of it) {
      acc = join(acc, chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk));
      if (acc.length >= partBytes) { take(join(carry, acc), false); acc = null; }
    }
    if (acc) take(join(carry, acc), false);
  }
  if (carry) take(carry, true);
  if (!parts.length) parts.push('');
  return new TextParts(parts, label);
}

// a TextParts from another copy of this file (each app carries its own) is recognised by its shape
const isTextParts = (x) => x instanceof TextParts || (!!x && typeof x === 'object' && !Array.isArray(x) && Array.isArray(x.parts) && typeof x.length === 'number');
export function partsOf(x) {
  if (typeof x === 'string') return [x];
  if (isTextParts(x)) return x.parts;
  if (Array.isArray(x)) return x;
  throw new TypeError('a string, TextParts or an array of strings is expected');
}
export const lengthOf = (x) => (isTextParts(x) ? x.length : partsOf(x).reduce((n, p) => n + p.length, 0));
export const isParts = (x) => isTextParts(x) || Array.isArray(x);

/** Every element of text.split(/\r?\n/), one at a time, however the text is cut into parts. */
export function* linesOf(x, { crlf = true } = {}) {
  // crlf false: split on "\n" only (text.split('\n')), the way a reader that trims its own lines did
  const sep = crlf ? /\r?\n/ : '\n';
  let carry = '';
  for (const part of partsOf(x)) {
    if (!part) continue;
    const lines = (carry ? carry + part : part).split(sep);
    carry = lines.pop();
    for (let i = 0; i < lines.length; i++) yield lines[i];
  }
  yield carry;
}

export function startsWithText(x, s) {
  const p = partsOf(x);
  let have = '';
  for (let i = 0; i < p.length && have.length < s.length; i++) have += p[i].slice(0, s.length - have.length);
  return have.startsWith(s);
}
/** A regex tested against each part (a match cannot span the cut: parts end at a line end, so use it for one-line patterns). */
export function testParts(x, re) { for (const p of partsOf(x)) if (re.test(p)) return true; return false; }

// ------------------------------------------------------------------------------------------------ JSON

/**
 * JSON.parse over parts. One part: JSON.parse itself. Several: an incremental parser that never holds the whole text. The result is
 * the same value JSON.parse gives (same key order, same numbers, `__proto__` stays an own key), and a syntax error throws a
 * SyntaxError. Slower than JSON.parse (about 5 to 10 times; a 268 MB GeoJSON 2.3 times, scale-11), so parts that join into a string of up to
 * `joinUpTo` characters (JOIN_UP_TO, 400 M: well inside V8's 512 M) are joined and handed to JSON.parse: a caller may pass parts at any size and
 * gets JSON.parse's speed below that and no whole-file string above it (PERF.20, perf-finish-11: "callers hand parts only above ~400 MB" is decided
 * here, once, instead of in every caller). `{ joinUpTo: 0 }` always takes the incremental parser (its tests).
 */
export const JOIN_UP_TO = 400 * 1048576;
export function parseJsonParts(x, { joinUpTo = JOIN_UP_TO } = {}) {
  const parts = partsOf(x);
  if (parts.length === 1) return JSON.parse(parts[0]);
  if (parts.length && lengthOf(x) <= Math.min(joinUpTo, V8_MAX_STRING)) return JSON.parse(parts.join(''));
  let pi = 0, s = parts[0] || '', i = 0, line = 1;
  const more = () => { while (++pi < parts.length) { if (parts[pi].length) { s = parts[pi]; i = 0; return true; } } return false; };
  const err = (m) => new SyntaxError('JSON: ' + m + ' (part ' + pi + ', offset ' + i + ')');
  const ws = () => { for (;;) { while (i < s.length) { const c = s.charCodeAt(i); if (c === 32 || c === 9 || c === 10 || c === 13) i++; else return; } if (!more()) return; } };
  const peek = () => { if (i >= s.length && !more()) return ''; return s[i]; };
  const lit = (word, val) => { for (let k = 0; k < word.length; k++) { if (peek() !== word[k]) throw err('unexpected token'); i++; } return val; };
  function str() {
    i++;   // opening quote
    let out = '';
    for (;;) {
      if (i >= s.length && !more()) throw err('unterminated string');
      let j = i;
      while (j < s.length) { const c = s.charCodeAt(j); if (c === 34 || c === 92 || c < 32) break; j++; }
      out += s.slice(i, j); i = j;
      if (i >= s.length) continue;
      const c = s.charCodeAt(i);
      if (c === 34) { i++; return out; }
      if (c < 32) throw err('a control character in a string');
      i++;   // backslash
      const e = peek(); if (!e) throw err('unterminated string'); i++;
      if (e === 'u') { let h = ''; for (let k = 0; k < 4; k++) { const d = peek(); if (!/[0-9a-fA-F]/.test(d)) throw err('bad unicode escape'); h += d; i++; } out += String.fromCharCode(parseInt(h, 16)); }
      else { const m = { '"': '"', '\\': '\\', '/': '/', b: '\b', f: '\f', n: '\n', r: '\r', t: '\t' }[e]; if (m === undefined) throw err('bad escape'); out += m; }
    }
  }
  function num() {
    let t = '';
    for (;;) {
      if (i >= s.length && !more()) break;
      const c = s[i];
      if ((c >= '0' && c <= '9') || c === '-' || c === '+' || c === '.' || c === 'e' || c === 'E') { t += c; i++; } else break;
    }
    if (!/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/.test(t)) throw err('bad number');
    return Number(t);
  }
  function value() {
    ws();
    const c = peek();
    if (c === '{') {
      i++; const o = {}; ws();
      if (peek() === '}') { i++; return o; }
      for (;;) {
        ws(); if (peek() !== '"') throw err('a key is expected');
        const k = str(); ws(); if (peek() !== ':') throw err('a colon is expected'); i++;
        const v = value();
        if (k === '__proto__') Object.defineProperty(o, k, { value: v, enumerable: true, writable: true, configurable: true }); else o[k] = v;
        ws(); const d = peek(); i++;
        if (d === ',') continue; if (d === '}') return o; throw err('a comma or } is expected');
      }
    }
    if (c === '[') {
      i++; const a = []; ws();
      if (peek() === ']') { i++; return a; }
      for (;;) {
        a.push(value()); ws(); const d = peek(); i++;
        if (d === ',') continue; if (d === ']') return a; throw err('a comma or ] is expected');
      }
    }
    if (c === '"') return str();
    if (c === 't') return lit('true', true);
    if (c === 'f') return lit('false', false);
    if (c === 'n') return lit('null', null);
    if (c === '-' || (c >= '0' && c <= '9')) return num();
    throw err(c ? 'unexpected token ' + c : 'unexpected end of the text');
  }
  const v = value(); ws();
  if (peek() !== '') throw err('text after the value');
  void line;
  return v;
}

/** A JSON file (a Blob / File) → its value. Up to `partsFrom` bytes it is JSON.parse(await file.text()); a bigger one is decoded in parts and parsed
 *  by parseJsonParts, so a project over V8's 512 MB string limit opens (the objects it holds are then the limit, not the text). */
export async function readJsonFile(file, { partsFrom = 32 * 1048576 } = {}) {
  if (!(file.size > partsFrom)) return JSON.parse(await file.text());
  return parseJsonParts(await decodePartsAsync(file));
}
