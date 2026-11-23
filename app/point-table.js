/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words. */
/**
 * point-table.js — the survey points of a project as typed arrays (0.11, perf-finish-11 lane civil, the 2,000,000-point cap lifted;
 * owner 2026-11-22). No imports, no DOM: the open Worker builds its blocks from this very file.
 *
 * A point was one object { n, x, y, z, d } each (+ blk, 0.5 WL.19); 10 million of them do not fit a page. The table keeps them in blocks of
 * BLOCK rows: x, y, z as Float64Array (z NaN = no elevation), the description as a code into one dictionary per table (Uint32Array), the
 * names joined into one string per block with offsets (or a plain array once a block's names are edited), block references and any point
 * that is not of the plain shape kept beside (sparse Maps). Blocks change in place or are rebuilt one at a time, so an edit touches the
 * blocks it changes, the undo step keeps the rows it changed (project.js editPointTable), and the autosave writes the blocks whose version moved.
 *
 *   PointTable.from(points)          a table of these point objects (an array, or anything iterable)
 *   PointTable.fromParts({ dict, blocks })   the open Worker's blocks (pointBlocks below), taken over without a copy
 *   t.length / t.get(i)              a point object as it was put in (a fresh object each call: same keys, same order, same values)
 *   t.x(i) t.y(i) t.z(i) t.name(i) t.desc(i)   one value (z null = no elevation)
 *   t.forEachBlock((b, start) => …)  the blocks in order (b.n rows; b.x, b.y, b.z, b.d codes into t.dict)
 *   compat: iteration, forEach, map, filter, some, every, find, findIndex, reduce, slice, at, concat, toArray(), toJSON() — as the array of
 *   point objects was (the callback gets fresh objects; never the same object twice), so code that read `project.points` reads it on
 *   edits (the undo records): append(points | table) · setRow(i, point) · removeAt(sortedIdx) → the removed rows as a table ·
 *     insertAt(sortedIdx, table) · truncate(n) · setXY(xs, ys) (every row)
 *   t.blockRowsJSON(b)               the rows of block b as the project file writes them: JSON.stringify(rows.map(pointRow)) without the arrays
 *   t.rows()                         every row as the project file's [n, x, y, z, d(, blk)]
 *   t.indexOfName(n)                 the first row named n, or -1 (a search of each block's joined names, no string per row)
 *   pointBlocks(cols)                (Worker) rows read off the page → { dict, blocks } to send (blocks' buffers in transferList(parts))
 */
export const BLOCK = 4096;   // rows a block: an edit of one point rewrites one block of its autosave copy, ~190,000 characters (381 KB measured; the 0.10 blocks were 5,000 rows, 465 KB)
const MAX_BLOCK = 2 * BLOCK;
let UID = 0;

const KEYS5 = ['n', 'x', 'y', 'z', 'd'];
/** A point of the plain shape: keys n, x, y, z, d (+ blk) in that order, n a string, x and y finite, z finite or null. Anything else is kept whole. */
function plain(o) {
  if (!o || typeof o !== 'object' || typeof o.n !== 'string' || !Number.isFinite(o.x) || !Number.isFinite(o.y) || !(o.z === null || Number.isFinite(o.z))) return 0;
  let i = 0, ok = 1;
  for (const k in o) {
    if (!Object.prototype.hasOwnProperty.call(o, k)) return 0;
    if (i < 5) { if (k !== KEYS5[i]) return 0; } else if (i === 5) { if (k !== 'blk') return 0; ok = 2; } else return 0;
    i++;
  }
  if (i < 5) return 0;
  if (Object.getOwnPropertySymbols(o).length) return 0;
  return ok;   // 1 plain, 2 plain + blk
}
const UNSAFE = /["\\\u0000-\u001f\ud800-\udfff]/;
const jsonVal = (v) => { const s = JSON.stringify(v); return s === undefined ? 'null' : s; };
const numText = (v) => (Number.isFinite(v) ? String(v) : 'null');   // JSON.stringify of a number (-0 → "0", as String does)
/** The project file's row of a point object (project.js pointRow). */
const rowOf = (p) => (p.blk ? [p.n, p.x, p.y, p.z, p.d, p.blk] : [p.n, p.x, p.y, p.z, p.d]);

function newBlock(cap) {
  return { uid: ++UID, v: 0, n: 0, x: new Float64Array(cap), y: new Float64Array(cap), z: new Float64Array(cap), d: new Uint32Array(cap), names: [], nj: null, no: null, bk: null, irr: null };
}
/** A block whose arrays are exactly n long (what the table keeps once built). */
function fit(b) {
  if (b.x.length !== b.n) { b.x = b.x.slice(0, b.n); b.y = b.y.slice(0, b.n); b.z = b.z.slice(0, b.n); b.d = b.d.slice(0, b.n); }
  if (b.names && b.names.length !== b.n) b.names.length = b.n;
  return b;
}

export class PointTable {
  constructor() {
    this.blocks = [];
    this.dict = [];            // description values (strings mostly; any value a point object held)
    this.dmap = new Map();     // value → code
    this.count = 0;
    this.version = 0;
    this._starts = null;
  }
  static from(points) {
    if (points instanceof PointTable) return points;
    const t = new PointTable();
    if (points) t.append(points);
    t.version = 0;
    return t;
  }
  /** The open Worker's { dict, blocks } (pointBlocks): the typed arrays are taken as they are. */
  static fromParts({ dict, blocks }) {
    const t = new PointTable();
    t.dict = dict;
    for (let i = 0; i < dict.length; i++) t.dmap.set(dict[i], i);
    for (const p of blocks) {
      const b = { uid: ++UID, v: 0, n: p.n, x: p.x, y: p.y, z: p.z, d: p.d, names: null, nj: p.nj, no: p.no, bk: null, irr: null };
      if (p.bk && p.bk.length) { b.bk = new Map(); for (let i = 0; i < p.bk.length; i += 2) b.bk.set(p.bk[i], p.bk[i + 1]); }
      t.blocks.push(b); t.count += b.n;
    }
    return t;
  }
  get length() { return this.count; }
  code(v) { let c = this.dmap.get(v); if (c === undefined) { c = this.dict.length; this.dict.push(v); this.dmap.set(v, c); } return c; }
  starts() {
    if (this._starts) return this._starts;
    const s = new Float64Array(this.blocks.length + 1);
    for (let i = 0; i < this.blocks.length; i++) s[i + 1] = s[i] + this.blocks[i].n;
    return (this._starts = s);
  }
  /** Row i → [block index, row in block]; i must be in range. */
  locate(i) {
    const s = this.starts();
    let lo = 0, hi = this.blocks.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (s[m] <= i) lo = m; else hi = m - 1; }
    return [lo, i - s[lo]];
  }
  touched() { this._starts = null; this.version++; }

  // ---- one row ----
  rowName(b, k) { return b.names ? b.names[k] : b.nj.slice(b.no[k], b.no[k + 1]); }
  rowGet(b, k) {
    const o = b.irr && b.irr.get(k);
    if (o) return { ...o };
    const z = b.z[k], p = { n: this.rowName(b, k), x: b.x[k], y: b.y[k], z: z !== z ? null : z, d: this.dict[b.d[k]] };
    if (b.bk) { const v = b.bk.get(k); if (v !== undefined) p.blk = v; }
    return p;
  }
  get(i) { if (!(i >= 0 && i < this.count)) return undefined; const [bi, k] = this.locate(i); return this.rowGet(this.blocks[bi], k); }
  at(i) { i = Math.trunc(i) || 0; return this.get(i < 0 ? i + this.count : i); }
  x(i) { const [bi, k] = this.locate(i); return this.blocks[bi].x[k]; }
  y(i) { const [bi, k] = this.locate(i); return this.blocks[bi].y[k]; }
  z(i) { const [bi, k] = this.locate(i), b = this.blocks[bi], o = b.irr && b.irr.get(k); if (o) return o.z; const z = b.z[k]; return z !== z ? null : z; }
  name(i) { const [bi, k] = this.locate(i), b = this.blocks[bi], o = b.irr && b.irr.get(k); return o ? o.n : this.rowName(b, k); }
  desc(i) { const [bi, k] = this.locate(i), b = this.blocks[bi], o = b.irr && b.irr.get(k); return o ? o.d : this.dict[b.d[k]]; }
  forEachBlock(fn) { let s = 0; for (const b of this.blocks) { fn(b, s); s += b.n; } }
  /** How many points have an elevation (= points.filter((p) => p.z !== null).length). */
  countWithZ() { let n = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++) { const o = b.irr && b.irr.get(k); if (o ? o.z !== null : b.z[k] === b.z[k]) n++; } return n; }
  /** Every name, as a Set (= new Set(points.map((p) => p.n))). */
  nameSet() { const s = new Set(); for (const b of this.blocks) for (let k = 0; k < b.n; k++) { const o = b.irr && b.irr.get(k); s.add(o ? o.n : this.rowName(b, k)); } return s; }
  /** The names in order (no point objects): for code that only reads p.n (clip.js renumber takes names too). */
  *names() { for (const b of this.blocks) for (let k = 0; k < b.n; k++) { const o = b.irr && b.irr.get(k); yield o ? o.n : this.rowName(b, k); } }
  /** The points whose name fn(name) says yes to, as objects (= points.filter((p) => fn(p.n)), without an object for the others). */
  whereName(fn) { const out = []; for (const b of this.blocks) for (let k = 0; k < b.n; k++) { const o = b.irr && b.irr.get(k); if (fn(o ? o.n : this.rowName(b, k))) out.push(this.rowGet(b, k)); } return out; }
  /** The rows (indexes) whose name fn(name) says yes to. */
  indexesWhereName(fn) { const out = []; let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) { const o = b.irr && b.irr.get(k); if (fn(o ? o.n : this.rowName(b, k))) out.push(i); } return out; }
  /** A point kept whole (not of the plain shape) named n: indexOfName finds those too; this says whether one is. */
  irregularName(n) { for (const b of this.blocks) if (b.irr) for (const o of b.irr.values()) if (o.n === n) return true; return false; }

  // ---- the array of point objects, as it was ----
  *[Symbol.iterator]() { for (const b of this.blocks) for (let k = 0; k < b.n; k++) yield this.rowGet(b, k); }
  forEach(fn) { let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) fn(this.rowGet(b, k), i, this); }
  map(fn) { const out = new Array(this.count); let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) out[i] = fn(this.rowGet(b, k), i, this); return out; }
  filter(fn) { const out = []; let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) { const p = this.rowGet(b, k); if (fn(p, i, this)) out.push(p); } return out; }
  some(fn) { let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) if (fn(this.rowGet(b, k), i, this)) return true; return false; }
  every(fn) { let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) if (!fn(this.rowGet(b, k), i, this)) return false; return true; }
  find(fn) { let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) { const p = this.rowGet(b, k); if (fn(p, i, this)) return p; } return undefined; }
  findIndex(fn) { let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) if (fn(this.rowGet(b, k), i, this)) return i; return -1; }
  reduce(fn, ...init) {
    let i = 0, acc, has = init.length > 0;
    if (has) acc = init[0];
    for (const b of this.blocks) for (let k = 0; k < b.n; k++, i++) { const p = this.rowGet(b, k); if (!has) { acc = p; has = true; } else acc = fn(acc, p, i, this); }
    if (!has) throw new TypeError('Reduce of empty array with no initial value');
    return acc;
  }
  slice(a = 0, e = this.count) {
    const n = this.count, s = a < 0 ? Math.max(n + a, 0) : Math.min(a, n), t = e < 0 ? Math.max(n + e, 0) : Math.min(e, n), out = [];
    for (let i = s; i < t; i++) out.push(this.get(i));
    return out;
  }
  concat(...more) { return this.toArray().concat(...more); }
  toArray() { return this.map((p) => p); }
  toJSON() { return this.toArray(); }

  // ---- what the project file and its autosave write ----
  rows() { const out = new Array(this.count); let i = 0; for (const b of this.blocks) for (let k = 0; k < b.n; k++) out[i++] = rowOf(this.rowGet(b, k)); return out; }
  blockRowsJSON(b) {
    const parts = new Array(b.n), dj = this._dictJSON || (this._dictJSON = []);
    // a name JSON.stringify would write as it is ('"' + name + '"'): no quote, backslash, control character or surrogate in the block's names
    const plainNames = b.nj !== null && !UNSAFE.test(b.nj);
    for (let k = 0; k < b.n; k++) {
      const o = b.irr && b.irr.get(k);
      if (o) { parts[k] = JSON.stringify(rowOf(o)); continue; }
      const z = b.z[k], blk = b.bk ? b.bk.get(k) : undefined, c = b.d[k];
      const dv = dj[c] !== undefined ? dj[c] : (dj[c] = jsonVal(this.dict[c]));
      parts[k] = '[' + (plainNames ? '"' + b.nj.slice(b.no[k], b.no[k + 1]) + '"' : JSON.stringify(this.rowName(b, k))) + ',' + numText(b.x[k]) + ',' + numText(b.y[k]) + ',' + (z !== z ? 'null' : numText(z)) + ',' + dv + (blk ? ',' + jsonVal(blk) : '') + ']';
    }
    return '[' + parts.join(',') + ']';
  }
  /**
   * The rows of block b as the project file's pretty print writes them inside "points" (JSON.stringify(file, null, 1): a row at two spaces,
   * its values at three), each row's text on its own, `fix(text)` applied to the rows that are not of the plain shape (ifc-native.js
   * collapses arrays of numbers there). → string[] (one a row)
   */
  blockRowsPretty(b, fix = (s) => s) {
    const out = new Array(b.n), dj = this._dictJSON || (this._dictJSON = []);
    const plainNames = b.nj !== null && !UNSAFE.test(b.nj);
    for (let k = 0; k < b.n; k++) {
      const o = b.irr && b.irr.get(k), blk = b.bk ? b.bk.get(k) : undefined;
      if (o || blk) { out[k] = fix(JSON.stringify(o ? rowOf(o) : rowOf(this.rowGet(b, k)), null, 1).replace(/\n/g, '\n  ')); continue; }
      const z = b.z[k], c = b.d[k];
      const dv = dj[c] !== undefined ? dj[c] : (dj[c] = jsonVal(this.dict[c]));
      out[k] = '[\n   ' + (plainNames ? '"' + b.nj.slice(b.no[k], b.no[k + 1]) + '"' : JSON.stringify(this.rowName(b, k))) + ',\n   ' + numText(b.x[k]) + ',\n   ' + numText(b.y[k]) + ',\n   ' + (z !== z ? 'null' : numText(z)) + ',\n   ' + dv + '\n  ]';
    }
    return out;
  }
  /**
   * Hold the blocks as they are now (the autosave writes them a few at a time, between other work): until thaw(token), a row edit makes a
   * copy of the block it changes instead of changing it, so what `token.blocks` holds stays as it was. Removals and puts-back already make
   * new blocks. → token { blocks }
   */
  freeze() { const token = { blocks: this.blocks.slice() }; for (const b of token.blocks) b.frozen = token; return token; }
  thaw(token) { for (const b of token.blocks) if (b.frozen === token) b.frozen = null; }
  _thaw(bi) {
    const b = this.blocks[bi];
    if (!b.frozen) return b;
    const c = { ...b, frozen: null, x: b.x.slice(), y: b.y.slice(), z: b.z.slice(), d: b.d.slice(), names: b.names ? b.names.slice() : null, no: b.no ? b.no.slice() : null, bk: b.bk ? new Map(b.bk) : null, irr: b.irr ? new Map(b.irr) : null };
    this.blocks[bi] = c;
    return c;
  }
  indexOfName(n) {
    if (typeof n !== 'string') { return this.findIndex((p) => p.n === n); }
    let s = 0;
    for (const b of this.blocks) {
      let k = this._firstIn(b, n);
      if (b.irr) for (const [j, o] of b.irr) if (o.n === n && (k < 0 || j < k)) k = j;
      if (k >= 0) return s + k;
      s += b.n;
    }
    return -1;
  }
  _firstIn(b, n) {
    if (b.names) { for (let k = 0; k < b.n; k++) if (b.names[k] === n && !(b.irr && b.irr.has(k))) return k; return -1; }
    const L = n.length;
    let at = b.nj.indexOf(n);
    while (at >= 0) {
      // a row whose name is exactly n starts at `at` and ends at at + L: offsets are sorted, find the row starting at `at`
      let lo = 0, hi = b.n - 1;
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (b.no[m] <= at) lo = m; else hi = m - 1; }
      // rows with empty names share an offset: step to the first row starting here whose name is exactly n
      let k = lo; while (k > 0 && b.no[k - 1] === at) k--;
      for (; k < b.n && b.no[k] === at; k++) if (b.no[k + 1] - b.no[k] === L && !(b.irr && b.irr.has(k))) return k;
      at = b.nj.indexOf(n, at + 1);
      if (L === 0) break;
    }
    if (L === 0) for (let k = 0; k < b.n; k++) if (b.no[k + 1] === b.no[k] && !(b.irr && b.irr.has(k))) return k;
    return -1;
  }

  // ---- edits ----
  _names(b) { if (!b.names) { const a = new Array(b.n); for (let k = 0; k < b.n; k++) a[k] = b.nj.slice(b.no[k], b.no[k + 1]); b.names = a; b.nj = null; b.no = null; } return b.names; }
  /** Write point object p into block b row k (the block's arrays are long enough). */
  _put(b, k, p) {
    const kind = plain(p);
    const names = this._names(b);
    if (kind) {
      b.x[k] = p.x; b.y[k] = p.y; b.z[k] = p.z === null ? NaN : p.z; b.d[k] = this.code(p.d); names[k] = p.n;
      if (b.irr) b.irr.delete(k);
      if (kind === 2) (b.bk || (b.bk = new Map())).set(k, p.blk); else if (b.bk) b.bk.delete(k);
    } else {
      const fx = Number(p && p.x), fy = Number(p && p.y), fz = p && p.z;
      b.x[k] = fx; b.y[k] = fy; b.z[k] = typeof fz === 'number' ? fz : NaN; b.d[k] = this.code(p ? p.d : undefined); names[k] = p ? p.n : undefined;
      (b.irr || (b.irr = new Map())).set(k, { ...p });
      if (b.bk) b.bk.delete(k);
    }
  }
  /** Copy row k of block sb (table src) to the end of builder block b. */
  _copyRow(b, src, sb, k) {
    const j = b.n++;
    b.x[j] = sb.x[k]; b.y[j] = sb.y[k]; b.z[j] = sb.z[k];
    b.d[j] = src === this ? sb.d[k] : this.code(src.dict[sb.d[k]]);
    b.names[j] = src.rowName(sb, k);
    const o = sb.irr && sb.irr.get(k);
    if (o) (b.irr || (b.irr = new Map())).set(j, o);
    const v = sb.bk ? sb.bk.get(k) : undefined;
    if (v !== undefined) (b.bk || (b.bk = new Map())).set(j, v);
  }
  /** Blocks of at most BLOCK rows from a builder block of any size. */
  _split(b) {
    if (b.n <= MAX_BLOCK) return [fit(b)];
    const out = [];
    for (let s = 0; s < b.n; s += BLOCK) {
      const e = Math.min(b.n, s + BLOCK), c = newBlock(e - s);
      for (let k = s; k < e; k++) this._copyRow(c, this, b, k);
      out.push(fit(c));
    }
    return out;
  }
  append(points) {
    if (points instanceof PointTable) {
      for (const sb of points.blocks) for (let k = 0; k < sb.n; k++) {
        let b = this.blocks[this.blocks.length - 1];
        if (!b || b.n >= BLOCK || b.x.length === b.n) { b = this._room(); }
        this._copyRow(b, points, sb, k);
      }
    } else {
      for (const p of points) {
        let b = this.blocks[this.blocks.length - 1];
        if (!b || b.n >= BLOCK || b.x.length === b.n) b = this._room();
        this._put(b, b.n, p); b.n++;
      }
    }
    for (const b of this.blocks) if (b._grow) { delete b._grow; fit(b); }
    this.count = 0; for (const b of this.blocks) this.count += b.n;
    this.touched();
    return this;
  }
  /** The last block with room to append into (its arrays grown to BLOCK), or a new block. */
  _room() {
    const last = this.blocks[this.blocks.length - 1];
    if (last && last.n < BLOCK) {
      const g = newBlock(BLOCK); g.uid = last.uid; g.v = last.v + 1;
      for (let k = 0; k < last.n; k++) this._copyRow(g, this, last, k);
      g._grow = true; this.blocks[this.blocks.length - 1] = g; return g;
    }
    const b = newBlock(BLOCK); b._grow = true; this.blocks.push(b); return b;
  }
  setRow(i, p) { const [bi, k] = this.locate(i), b = this._thaw(bi); this._put(b, k, p); b.v++; this.version++; }
  /** Remove the rows at these indexes (ascending, distinct) → the removed rows, in order, as a table of their own. */
  removeAt(idx) {
    const gone = new PointTable();
    if (!idx.length) return gone;
    const s = this.starts(), out = [];
    let j = 0;
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const b = this.blocks[bi], e = s[bi + 1];
      if (j >= idx.length || idx[j] >= e) { out.push(b); continue; }
      const nb = newBlock(b.n); nb.uid = b.uid; nb.v = b.v + 1;
      for (let k = 0; k < b.n; k++) {
        if (j < idx.length && idx[j] === s[bi] + k) { gone._appendRow(this, b, k); j++; } else this._copyRow(nb, this, b, k);
      }
      if (nb.n) out.push(fit(nb));
    }
    this.blocks = out;
    this.count -= idx.length;
    gone._finish();
    this.touched();
    return gone;
  }
  _appendRow(src, sb, k) {
    let b = this.blocks[this.blocks.length - 1];
    if (!b || b.n >= BLOCK) { b = newBlock(BLOCK); b._grow = true; this.blocks.push(b); }
    this._copyRow(b, src, sb, k);
    this.count++;
  }
  _finish() { for (const b of this.blocks) if (b._grow) { delete b._grow; fit(b); } this.touched(); }
  /** Put the rows of `rows` (a table) back at these final indexes (ascending): the inverse of removeAt. */
  insertAt(idx, rows) {
    if (!idx.length) return;
    if (idx[0] >= this.count) { this.append(rows); return; }   // all at the end (indexes ascending from the old length)
    const out = [], last = this.blocks.length - 1;
    let j = 0, final = 0;   // final = the index the next row written gets; j = the next index of idx
    let rb = 0, rk = 0;     // the next row of `rows`
    const nextRow = (nb) => { const sb = rows.blocks[rb]; this._copyRow(nb, rows, sb, rk); if (++rk >= sb.n) { rb++; rk = 0; } j++; final++; };
    for (let bi = 0; bi <= last; bi++) {
      const b = this.blocks[bi];
      // the rows put back inside this block's stretch (before its last row; after it they belong to the next block, or to the end)
      let c = 0; while (j + c < idx.length && idx[j + c] < final + b.n + c) c++;
      const tail = bi === last ? idx.length - j - c : 0;
      if (!c && !tail) { out.push(b); final += b.n; continue; }
      const nb = newBlock(b.n + c + tail); nb.uid = b.uid; nb.v = b.v + 1;
      const jEnd = j + c;
      for (let k = 0; k < b.n; k++) {
        while (j < jEnd && idx[j] === final) nextRow(nb);
        this._copyRow(nb, this, b, k); final++;
      }
      while (j < jEnd) nextRow(nb);   // counted for this stretch but after its last row
      if (bi === last) while (j < idx.length) nextRow(nb);
      out.push(...this._split(nb));
    }
    this.blocks = out;
    this.count += idx.length;
    this.touched();
  }
  truncate(n) {
    if (n >= this.count) return;
    const s = this.starts(), out = [];
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const b = this.blocks[bi];
      if (s[bi + 1] <= n) { out.push(b); continue; }
      const keep = n - s[bi];
      if (keep <= 0) break;
      const nb = newBlock(keep); nb.uid = b.uid; nb.v = b.v + 1;
      for (let k = 0; k < keep; k++) this._copyRow(nb, this, b, k);
      out.push(fit(nb));
      break;
    }
    this.blocks = out;
    this.count = n;
    this.touched();
  }
  /** Every row's x and y (the arrays are count long); the rest of each row stays. A point kept whole gets them on its object. */
  setXY(xs, ys) {
    let i = 0;
    for (let bi = 0; bi < this.blocks.length; bi++) {
      const b = this._thaw(bi);
      for (let k = 0; k < b.n; k++, i++) { b.x[k] = xs[i]; b.y[k] = ys[i]; const o = b.irr && b.irr.get(k); if (o) b.irr.set(k, { ...o, x: xs[i], y: ys[i] }); }
      b.v++;
    }
    this.version++;
  }
  /** Every row's x and y, copied (setXY's inverse). */
  getXY() {
    const xs = new Float64Array(this.count), ys = new Float64Array(this.count);
    let i = 0;
    for (const b of this.blocks) { xs.set(b.x.subarray(0, b.n), i); ys.set(b.y.subarray(0, b.n), i); i += b.n; }
    return { xs, ys };
  }
  /** About how many bytes the table holds (typed arrays + names + side maps), for the undo and status numbers. */
  bytes() {
    let n = 0;
    for (const b of this.blocks) {
      n += b.n * 28 + (b.nj ? b.nj.length * 2 + b.n * 4 : b.n * 24) + (b.bk ? b.bk.size * 64 : 0) + (b.irr ? b.irr.size * 128 : 0);
    }
    return n;
  }
}

/**
 * Rows written one at a time into blocks for PointTable.fromParts (the open Worker): `add(x, y, z, name, desc, blk)` (z NaN = none; blk the raw
 * block reference or undefined), then `done()` → { dict, blocks }. Descriptions go into one dictionary, the names of a block are joined.
 */
export class BlockWriter {
  constructor() { this.dict = []; this.dmap = new Map(); this.blocks = []; this.count = 0; this.open(); }
  open() { this.n = 0; this.x = new Float64Array(BLOCK); this.y = new Float64Array(BLOCK); this.z = new Float64Array(BLOCK); this.d = new Uint32Array(BLOCK); this.nm = new Array(BLOCK); this.bk = []; }
  add(x, y, z, name, desc, blk) {
    const k = this.n;
    this.x[k] = x; this.y[k] = y; this.z[k] = z; this.nm[k] = name;
    let c = this.dmap.get(desc); if (c === undefined) { c = this.dict.length; this.dict.push(desc); this.dmap.set(desc, c); } this.d[k] = c;
    if (blk !== undefined) this.bk.push(k, blk);
    this.count++;
    if (++this.n === BLOCK) this.close();
  }
  close() {
    const n = this.n;
    if (!n) return;
    const no = new Uint32Array(n + 1);
    let off = 0;
    for (let k = 0; k < n; k++) { no[k] = off; off += this.nm[k].length; }
    no[n] = off;
    this.nm.length = n;
    this.blocks.push({ n, x: n === BLOCK ? this.x : this.x.slice(0, n), y: n === BLOCK ? this.y : this.y.slice(0, n), z: n === BLOCK ? this.z : this.z.slice(0, n), d: n === BLOCK ? this.d : this.d.slice(0, n), nj: this.nm.join(''), no, bk: this.bk });
    this.open();
  }
  done() { this.close(); return { dict: this.dict, blocks: this.blocks, count: this.count }; }
}
/** (Worker) pointColumns' result → { dict, blocks } (the rows kept as they were read). */
export function pointBlocks(cols) {
  const w = new BlockWriter(), names = Array.isArray(cols.names) ? cols.names : cols.names.split('\u0000'), descs = Array.isArray(cols.descs) ? cols.descs : cols.descs.split('\u0000');
  const blk = new Map(); for (let i = 0; i < cols.blk.length; i += 2) blk.set(cols.blk[i], cols.blk[i + 1]);
  for (let i = 0; i < cols.count; i++) w.add(cols.x[i], cols.y[i], cols.z[i], cols.count ? names[i] : '', cols.count ? descs[i] : '', blk.get(i));
  return w.done();
}
/** The buffers of pointBlocks' output, for postMessage's transfer list. */
export const transferList = (parts) => parts.blocks.flatMap((b) => [b.x.buffer, b.y.buffer, b.z.buffer, b.d.buffer, b.no.buffer]);
