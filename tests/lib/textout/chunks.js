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
 *
 * The text is exactly lines.join(separator) (+ separator when finish(true)); tests/dwg-perf compares it with the old join.
 */
const FLUSH = 1 << 20;            // characters per part
const V8_MAX_STRING = 0x1FFFFFE8; // 536,870,888

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
}
