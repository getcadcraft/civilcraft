/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; its errors are English (an app translates what it shows). */
/**
 * model-pack.js — a plain-data tree (the reader's model) packed into a few typed arrays and back, so a worker can hand a
 * drawing over by TRANSFER instead of structured clone (cc-dwg, Apache-2.0; PERF.9 / PERF.22).
 *
 * Why: the structured clone of a million-object model is made on the page's thread when the message arrives (1.3 s of freeze
 * for Plans.dwg in CadCraft) and holds the worker's copy and the page's copy at once. A packed list is five typed arrays: the
 * worker transfers their buffers (no copy), the page rebuilds the objects a slice at a time, and the worker's own objects can
 * be dropped as soon as a slice is sent.
 *
 *   const p = new Packer();
 *   const chunk = p.pack(list, from, to);       // → { tags, ints, nums, bytes, strings, shapes, count }  (strings / shapes: only the new ones)
 *   chunkBuffers(chunk)                          // the ArrayBuffers to put in postMessage's transfer list
 *   const u = new Unpacker();
 *   const items = u.unpack(chunk);               // → the same values, in the same key order, a fresh array of `count` items
 *
 * Handled: undefined, null, booleans, numbers (-0, NaN and ±Infinity kept), strings, arrays, plain objects, Uint8Array.
 * Anything else (BigInt, Map, Date, class instances, other typed arrays, a cycle) throws PackError: the caller sends that slice
 * as an ordinary structured clone instead. An unpacked tree equals what structured clone would give (tests/dwg-pack in
 * tools/dwg-test/test.mjs compares both on the corpus).
 */
export class PackError extends Error { constructor(m) { super(m); this.name = 'PackError'; } }

const T_UNDEF = 0, T_NULL = 1, T_FALSE = 2, T_TRUE = 3, T_INT = 4, T_NUM = 5, T_STR = 6, T_ARR = 7, T_SHAPE = 8, T_BYTES = 9, T_DICT = 10;
const MAX_SHAPES = 4096, MAX_SHAPE_KEYS = 40;

class Grow {
  constructor(T, n) { this.T = T; this.a = new T(n); this.n = 0; }
  push(v) { if (this.n === this.a.length) { const b = new this.T(this.a.length * 2); b.set(this.a); this.a = b; } this.a[this.n++] = v; }
  pushAll(src) { const k = src.length; while (this.n + k > this.a.length) { const b = new this.T(this.a.length * 2); b.set(this.a); this.a = b; } this.a.set(src, this.n); this.n += k; }
  take() { const r = this.a.slice(0, this.n); this.n = 0; return r; }
}

export class Packer {
  constructor() {
    this.strIds = new Map(); this.strNew = [];
    this.shapeIds = new Map(); this.shapeNew = [];
    this.tags = new Grow(Uint8Array, 1 << 16); this.ints = new Grow(Int32Array, 1 << 16); this.nums = new Grow(Float64Array, 1 << 12); this.bytes = new Grow(Uint8Array, 1 << 12);
  }
  str(s) {
    let id = this.strIds.get(s);
    if (id === undefined) { id = this.strIds.size; this.strIds.set(s, id); this.strNew.push(s); }
    return id;
  }
  /**
   * Pack list[from..to) (the whole list by default) into one chunk. With `budget` (tags), stop after the item that passes it:
   * chunk.count says how many items went in, so the page's rebuild of one chunk stays a few milliseconds whatever the items weigh.
   * Throws PackError; the packer stays usable.
   */
  pack(list, from = 0, to = list.length, budget = 0) {
    const nStr = this.strNew.length, nShape = this.shapeNew.length;
    let packed = 0;
    try {
      for (let i = from; i < to; i++) { this.value(list[i], 0); packed++; if (budget && this.tags.n >= budget) break; }
    } catch (e) {
      // forget this chunk's new strings and shapes: they were never sent
      for (let i = nStr; i < this.strNew.length; i++) this.strIds.delete(this.strNew[i]);
      this.strNew.length = nStr;
      for (let i = nShape; i < this.shapeNew.length; i++) this.shapeIds.delete(this.shapeNew[i].join('\u0000'));
      this.shapeNew.length = nShape;
      this.tags.n = 0; this.ints.n = 0; this.nums.n = 0; this.bytes.n = 0;
      throw e instanceof PackError ? e : new PackError(e && e.message || String(e));
    }
    const chunk = { tags: this.tags.take(), ints: this.ints.take(), nums: this.nums.take(), bytes: this.bytes.take(), strings: this.strNew, shapes: this.shapeNew, count: packed };
    this.strNew = []; this.shapeNew = [];
    return chunk;
  }
  value(v, depth) {
    const tags = this.tags, ints = this.ints;
    switch (typeof v) {
      case 'undefined': tags.push(T_UNDEF); return;
      case 'boolean': tags.push(v ? T_TRUE : T_FALSE); return;
      case 'number':
        if ((v | 0) === v && !Object.is(v, -0)) { tags.push(T_INT); ints.push(v); } else { tags.push(T_NUM); this.nums.push(v); }
        return;
      case 'string': tags.push(T_STR); ints.push(this.str(v)); return;
      case 'object': break;
      default: throw new PackError('cannot pack a ' + typeof v);
    }
    if (v === null) { tags.push(T_NULL); return; }
    if (depth > 200) throw new PackError('too deep (a cycle?)');
    if (Array.isArray(v)) {
      tags.push(T_ARR); ints.push(v.length);
      for (let i = 0; i < v.length; i++) this.value(v[i], depth + 1);
      return;
    }
    const proto = Object.getPrototypeOf(v);
    if (proto === Uint8Array.prototype && v.constructor === Uint8Array) { tags.push(T_BYTES); ints.push(v.length); this.bytes.pushAll(v); return; }
    if (proto !== Object.prototype && proto !== null) throw new PackError('cannot pack a ' + (v.constructor && v.constructor.name || 'object'));
    const keys = Object.keys(v);
    const n = keys.length;
    let id = -1;
    if (n <= MAX_SHAPE_KEYS) {
      const sig = keys.join('\u0000');
      id = this.shapeIds.get(sig);
      if (id === undefined) {
        if (this.shapeIds.size >= MAX_SHAPES || keys.includes('__proto__') || sig.includes('\u0000') && n > 0 && keys.some((k) => k.includes('\u0000'))) id = -1;
        else { id = this.shapeIds.size; this.shapeIds.set(sig, id); this.shapeNew.push(keys); }
      }
    }
    if (id >= 0) {
      tags.push(T_SHAPE); ints.push(id);
      for (let i = 0; i < n; i++) this.value(v[keys[i]], depth + 1);
    } else {
      if (keys.includes('__proto__')) throw new PackError('a key named __proto__');
      tags.push(T_DICT); ints.push(n);
      for (let i = 0; i < n; i++) { ints.push(this.str(keys[i])); this.value(v[keys[i]], depth + 1); }
    }
  }
}

/** The ArrayBuffers of a chunk (for postMessage's transfer list). */
export function chunkBuffers(c) { return [c.tags.buffer, c.ints.buffer, c.nums.buffer, c.bytes.buffer]; }

let canCompile = null;
function compile(keys, rd) {
  if (canCompile !== false) {
    try {
      const f = new Function('rd', 'return function () { return {' + keys.map((k) => JSON.stringify(k) + ': rd()').join(', ') + '}; };')(rd);   // an object literal: all fields in the object, none in a side array
      canCompile = true;
      return f;
    } catch { canCompile = false; }   // no eval (a strict content security policy): fill an object field by field
  }
  return () => { const o = {}; for (let i = 0; i < keys.length; i++) o[keys[i]] = rd(); return o; };
}

export class Unpacker {
  constructor() {
    this.strings = []; this.shapes = [];
    this.tags = null; this.ints = null; this.nums = null; this.bytes = null; this.ti = 0; this.ii = 0; this.ni = 0; this.bi = 0;
    const self = this;
    this.rd = function rd() { return self.read(); };
  }
  /** Rebuild the `count` values of a chunk (in the order they were packed). */
  unpack(c) {
    for (const s of c.strings) this.strings.push(s);
    for (const k of c.shapes) this.shapes.push(compile(k, this.rd));
    this.tags = c.tags; this.ints = c.ints; this.nums = c.nums; this.bytes = c.bytes; this.ti = this.ii = this.ni = this.bi = 0;
    const out = new Array(c.count);
    for (let i = 0; i < c.count; i++) out[i] = this.read();
    this.tags = this.ints = this.nums = this.bytes = null;
    return out;
  }
  read() {
    switch (this.tags[this.ti++]) {
      case T_UNDEF: return undefined;
      case T_NULL: return null;
      case T_FALSE: return false;
      case T_TRUE: return true;
      case T_INT: return this.ints[this.ii++];
      case T_NUM: return this.nums[this.ni++];
      case T_STR: return this.strings[this.ints[this.ii++]];
      case T_ARR: { const n = this.ints[this.ii++], a = new Array(n); for (let i = 0; i < n; i++) a[i] = this.read(); return a; }
      case T_SHAPE: return this.shapes[this.ints[this.ii++]]();
      case T_BYTES: { const n = this.ints[this.ii++]; const b = this.bytes.slice(this.bi, this.bi + n); this.bi += n; return b; }
      case T_DICT: { const n = this.ints[this.ii++], o = {}; for (let i = 0; i < n; i++) { const k = this.strings[this.ints[this.ii++]]; o[k] = this.read(); } return o; }
      default: throw new PackError('damaged pack');
    }
  }
}
