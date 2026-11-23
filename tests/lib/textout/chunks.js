/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a library with no UI; the one error is a developer message. */
/**
 * chunks.js — a text writer's output kept as a list of ~1 MB strings instead of one string or one array of millions of lines
 * (PERF.26, 0.10; session dwg-perf-10). DOM-free.
 *
 * A DXF, LandXML, OBJ or USDA writer used to push every line into an array and `join` it: the array of a million-entity drawing
 * is 50 million small strings, the joined text stops at V8's 512 MB string limit, and the text plus the Blob made from it is
 * twice the output in memory. With a TextChunks the writer calls `add(line)` for each line (the same lines it joined before) and
 * the result is read as the parts it already is:
 *
 *   const out = new TextChunks('\r\n');          // the line separator; default '\n'
 *   out.add('  0'); out.add('SECTION');          // or out.addAll(arrayOfLines)
 *   out.finish();                                 // the end of the text (a trailing separator when asked: finish(true))
 *   out.parts      → string[]                     // what to hand to new Blob(parts) or to write one after another
 *   out.blob(type) → Blob                         // no single string is made
 *   out.string()   → string                       // only while it fits one string, else RangeError that names blob()
 *   await out.pipe(async (part) => writable.write(part))   // to a file handle's createWritable() or a Node stream, a part at a time
 *   out.length     → characters so far
 *   out.output(type) → the string while the text is up to BLOB_FROM (300 M) characters, else blob(type)   what a Save or Download hands the host
 *                    (host.js takes a string or a Blob): below the size nothing changes for the caller; above it no string is ever made (perf-finish-11)
 *
 * The text is exactly lines.join(separator) (+ separator when finish(true)); tests/dwg-perf compares it with the old join.
 */
const FLUSH = 1 << 20;            // characters per part
const V8_MAX_STRING = 0x1FFFFFE8; // 536,870,888
export const BLOB_FROM = 300 * 1048576;   // PERF.26: callers hand a Blob above ~300 MB of text (the string and its Blob would be twice the output in memory)

export class TextChunks {
  constructor(separator = '\n') {
    this.sep = separator;
    this.parts = [];
    this.cur = [];
    this.curLen = 0;
    this.length = 0;
    this.lines = 0;
    this.done = false;
  }
  add(line) {
    if (this.curLen >= FLUSH) { this.parts.push(this.cur.join(this.sep) + this.sep); this.cur = []; this.curLen = 0; }   // a line follows, so the separator belongs to this part
    const s = typeof line === 'string' ? line : String(line);
    this.cur.push(s);
    this.curLen += s.length + this.sep.length;
    this.length += s.length + (this.lines ? this.sep.length : 0);
    this.lines++;
    return this;
  }
  /** Array-style: a writer that built `const L = []; L.push(a, b)` and ended `L.join(sep)` becomes `const L = new TextChunks(sep)` and `L.finish()`. */
  push(...lines) { for (let i = 0; i < lines.length; i++) this.add(lines[i]); return this.lines; }
  addAll(lines) { for (let i = 0; i < lines.length; i++) this.add(lines[i]); return this; }
  /** Close the text: the last part, with a trailing separator if `trailing`. Safe to call twice. */
  finish(trailing = false) {
    if (this.done) return this;
    this.done = true;
    if (this.cur.length || !this.parts.length) { this.parts.push(this.cur.join(this.sep) + (trailing && this.lines ? this.sep : '')); }
    else if (trailing && this.parts.length) this.parts.push(this.sep);
    if (trailing && this.lines) this.length += this.sep.length;
    this.cur = []; this.curLen = 0;
    return this;
  }
  blob(type = 'text/plain') { this.finish(); return new Blob(this.parts, { type }); }
  string() {
    this.finish();
    if (this.length > V8_MAX_STRING) throw new RangeError('this text is ' + this.length + ' characters, more than one string can hold: use blob() or pipe()');
    return this.parts.join('');
  }
  async pipe(write) { this.finish(); for (const p of this.parts) await write(p); }
  /** For a save or a download: the string, as before, while the text has at most `blobFrom` characters; a Blob of the parts past that. */
  output(type = 'text/plain', { blobFrom = BLOB_FROM } = {}) { this.finish(); return this.length > Math.min(blobFrom, V8_MAX_STRING) ? this.blob(type) : this.string(); }
}
