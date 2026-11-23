/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words. */
/**
 * project-stream.js — a project file's survey points read as the text streams in, never as one string (0.11, perf-finish-11 lane civil, the
 * 2,000,000-point cap lifted). No imports, no DOM: the open Worker (open-async.js) runs this very file.
 *
 * A 10-million-point project is ~500 MB of JSON: one string of it is at V8's limit and JSON.parse of it makes 10 million arrays. Here the
 * top-level "points" array is cut out while the text arrives: each row is read straight into the blocks of a point table (point-table.js
 * BlockWriter, the rows kept by the same rule as project-rows.js pointColumns: an array with finite x and y; the first `max`), and the rest of
 * the file (everything but that array, `[]` in its place) is kept as text parts for JSON.parse. A row that is not a flat array of plain values is
 * handed to JSON.parse alone; anything JSON.parse would refuse is refused (a SyntaxError).
 *
 *   const r = new ProjectStream({ max, rowOf, writer });  for each text chunk: r.push(chunk);  r.end()
 *     → { rest: string[] (the file without its points), total (the array's length), found: 'one' | 'none' | 'twice' | 'notarray' }
 *   found 'none' / 'twice' / 'notarray': the points are not (all) in the writer — the caller reads obj.points from the rest as before (JSON.parse
 *   keeps the last of two keys; a "points" that is not an array is read by pointColumns as before).
 */
const WS = (c) => c === 32 || c === 10 || c === 13 || c === 9;
const NUM = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const MORE = Symbol('more');   // the element goes on past the text so far

export class ProjectStream {
  constructor({ max = Infinity, rowOf, writer }) {
    this.max = max; this.rowOf = rowOf; this.writer = writer;
    this.rest = []; this.buf = ''; this.pos = 0;
    this.mode = 0;           // 0 outside the points, 1 inside the points array, 2 after it
    this.depth = 0; this.inStr = false; this.esc = false;
    this.keyState = 0;       // 0 none; 1 a key may start here (depth 1, after { or ,); 2 reading a key; 3 after a key, before ':'; 4 after ':', before the value
    this.key = ''; this.keyRaw = false;
    this.found = 'none'; this.total = 0; this.expectComma = false; this.afterComma = false;
  }
  push(chunk) {
    this.buf = this.pos < this.buf.length ? this.buf.slice(this.pos) + chunk : chunk;
    this.pos = 0;
    this.run(false);
  }
  end() {
    this.run(true);
    if (this.mode === 1) throw new SyntaxError('Unexpected end of JSON input');
    return { rest: this.rest, total: this.total, found: this.found };
  }
  run(last) {
    for (;;) {
      if (this.mode === 1) { if (!this.rows(last)) return; continue; }
      this.outside();
      return;
    }
  }
  /** Outside the points array: copy the text to `rest`, watching for the top-level key "points". */
  outside() {
    const s = this.buf; let i = this.pos; const from = i;
    for (; i < s.length; i++) {
      const c = s.charCodeAt(i);
      if (this.inStr) {
        if (this.keyState === 2) { if (this.esc) { this.esc = false; this.key += s[i]; continue; } if (c === 92) { this.esc = true; this.keyRaw = true; this.key += '\\'; continue; } if (c === 34) { this.inStr = false; this.keyState = 3; continue; } this.key += s[i]; if (this.key.length > 64) this.keyState = 0; continue; }
        if (this.esc) this.esc = false; else if (c === 92) this.esc = true; else if (c === 34) this.inStr = false;
        continue;
      }
      if (WS(c)) continue;
      if (this.keyState === 4) {
        this.keyState = 0;
        if (this.isPoints()) {
          if (this.found === 'none' && c === 91) {   // [ : the points: cut here
            this.rest.push(s.slice(from, i) + '[]');
            this.found = 'one'; this.mode = 1; this.pos = i + 1; this.expectComma = false;
            this.run(false);   // the rows that are here already
            return;
          }
          this.found = this.found === 'none' ? 'notarray' : 'twice';
        }
      }
      if (c === 34) { this.inStr = true; if (this.keyState === 1) { this.keyState = 2; this.key = ''; this.keyRaw = false; } continue; }
      if (this.keyState === 3) { this.keyState = c === 58 && this.depth === 1 ? 4 : 0; continue; }
      if (c === 123 || c === 91) { this.depth++; this.keyState = c === 123 && this.depth === 1 ? 1 : 0; continue; }
      if (c === 125 || c === 93) { this.depth--; this.keyState = 0; continue; }
      if (c === 44) { this.keyState = this.depth === 1 ? 1 : 0; continue; }
      this.keyState = this.keyState === 3 ? 3 : 0;
    }
    if (i > from) this.rest.push(s.slice(from, i));
    this.pos = i;
  }
  isPoints() {
    if (!this.keyRaw) return this.key === 'points';
    try { return JSON.parse('"' + this.key + '"') === 'points'; } catch { return false; }
  }
  /** Inside the points array: read rows until the text runs out (→ false, wait for more) or the array ends (→ true). */
  rows(last) {
    const s = this.buf;
    for (;;) {
      let i = this.pos;
      while (i < s.length && WS(s.charCodeAt(i))) i++;
      if (i >= s.length) { this.pos = i; if (last) throw new SyntaxError('Unexpected end of JSON input'); return false; }
      let c = s.charCodeAt(i);
      if (c === 93) {
        if (this.afterComma) throw new SyntaxError('Unexpected token ] in the points of the project file');
        this.pos = i + 1; this.mode = 2; this.keyState = 0; this.outsideAfter(); return false;
      }
      if (this.expectComma) {
        if (c !== 44) throw new SyntaxError('Unexpected token in the points of the project file');
        this.expectComma = false; this.afterComma = true;
        i++; while (i < s.length && WS(s.charCodeAt(i))) i++;
        if (i >= s.length) { this.pos = i; if (last) throw new SyntaxError('Unexpected end of JSON input'); return false; }   // the comma is read
        c = s.charCodeAt(i);
        if (c === 93) throw new SyntaxError('Unexpected token ] in the points of the project file');
      }
      const at = i;
      let v = c === 91 ? this.flatRow(s, i) : null;
      if (v === null) { const e = this.extent(s, i); if (e === MORE) { this.pos = at; if (last) throw new SyntaxError('Unexpected end of JSON input'); return false; } v = { value: JSON.parse(s.slice(i, e)), end: e }; }
      else if (v === MORE) { this.pos = at; if (last) throw new SyntaxError('Unexpected end of JSON input'); return false; }
      if (this.total < this.max) this.rowOf(v.value, this.writer);
      this.total++;
      this.pos = v.end; this.expectComma = true; this.afterComma = false;
    }
  }
  outsideAfter() { this.mode = 0; this.outside(); }
  /** A row `[v, v, …]` of strings, numbers, true / false / null at s[i] → { value, end } | null (not that simple: JSON.parse it) | MORE. */
  flatRow(s, i) {
    const out = [];
    let p = i + 1;
    const ws = () => { while (p < s.length && WS(s.charCodeAt(p))) p++; };
    ws();
    if (p >= s.length) return MORE;
    if (s.charCodeAt(p) === 93) return { value: out, end: p + 1 };
    for (;;) {
      ws();
      if (p >= s.length) return MORE;
      const c = s.charCodeAt(p);
      if (c === 34) {
        let q = p + 1, esc = false;
        for (; q < s.length; q++) { const d = s.charCodeAt(q); if (d === 34) break; if (d === 92) { esc = true; q++; continue; } if (d < 32) return null; }
        if (q >= s.length) return MORE;
        out.push(esc ? JSON.parse(s.slice(p, q + 1)) : s.slice(p + 1, q));
        p = q + 1;
      } else if (c === 45 || (c >= 48 && c <= 57)) {
        NUM.lastIndex = p;
        const m = NUM.exec(s);
        if (!m) return null;
        const e = p + m[0].length;
        if (e >= s.length) return MORE;   // the number may go on in the next chunk
        out.push(Number(m[0]));
        p = e;
      } else if (c === 110 || c === 116 || c === 102) {
        const w = c === 110 ? 'null' : c === 116 ? 'true' : 'false';
        if (p + w.length > s.length) return w.startsWith(s.slice(p)) ? MORE : null;
        if (!s.startsWith(w, p)) return null;
        out.push(c === 110 ? null : c === 116);
        p += w.length;
      } else return null;
      ws();
      if (p >= s.length) return MORE;
      const d = s.charCodeAt(p);
      if (d === 44) { p++; continue; }
      if (d === 93) return { value: out, end: p + 1 };
      return null;
    }
  }
  /** The end of the JSON value at s[i] (strings, arrays, objects balanced; a number or word to its delimiter) or MORE. */
  extent(s, i) {
    const c = s.charCodeAt(i);
    if (c !== 91 && c !== 123 && c !== 34) {
      let p = i; while (p < s.length) { const d = s.charCodeAt(p); if (d === 44 || d === 93 || d === 125 || WS(d)) break; p++; }
      return p >= s.length ? MORE : p;
    }
    let depth = 0, str = false, esc = false;
    for (let p = i; p < s.length; p++) {
      const d = s.charCodeAt(p);
      if (str) { if (esc) esc = false; else if (d === 92) esc = true; else if (d === 34) { str = false; if (depth === 0) return p + 1; } continue; }
      if (d === 34) { str = true; continue; }
      if (d === 91 || d === 123) depth++;
      else if (d === 93 || d === 125) { depth--; if (depth === 0) return p + 1; }
    }
    return MORE;
  }
}
