/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usdc-read.js — reads a binary USD layer ("crate", `.usdc`, versions 0.4.0 – 0.16.0) into an sdf.js Layer.
 * Untrusted input: every offset, count and index is checked; caps from util.js LIMITS; a value that contains itself is
 * refused. The layout (bootstrap, table of contents, the TOKENS / STRINGS / FIELDS / FIELDSETS / PATHS / SPECS sections,
 * the 64-bit value representations, inlined values, compressed arrays) follows the reference library's crateFile.cpp,
 * read after the licence gate (docs/0.7-sessions/usd.md; see NOTICE). Our own code. DOM-free.
 *
 *   readUsdc(bytes, opts) → Layer (layer.version = '0.8.0', layer.format = 'usdc')
 *   isUsdc(bytes)
 */
import { ByteReader, UsdError, damaged, unsupported, tooBig, limitsOf, halfToFloat, utf8decode } from './util.js';
import { unpackChunks } from './lz4.js';
import { decodeInts } from './intcode.js';
import { Layer, V, ENUM_TYPE, ENUM_KIND, TYPES } from './sdf.js';
import { msg } from './messages.js';

const IDENT = [80, 88, 82, 45, 85, 83, 68, 67];   // "PXR-USDC"
export const SPEC_TYPES = ['unknown', 'attribute', 'connection', 'expression', 'mapper', 'mapperArg', 'prim', 'pseudoRoot',
  'relationship', 'relationshipTarget', 'variant', 'variantSet'];
const SPECIFIERS = ['def', 'over', 'class'];
const NEWEST = [0, 16];
const MIN_COMPRESSED = 16;

export function isUsdc(b) { return b && b.length >= 8 && IDENT.every((c, i) => b[i] === c); }

const vcmp = (a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);

export function readUsdc(bytes, opts = {}) {
  const limits = limitsOf(opts);
  const b = bytes instanceof Uint8Array ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) : new Uint8Array(bytes);
  if (!isUsdc(b)) throw new UsdError('not_usd', msg('ccusd.not_usd'));
  if (b.length < 88) throw damaged('ccusd.damaged.short');
  if (b.length > limits.fileBytes) throw tooBig('ccusd.too_big.bytes', { n: Math.round(b.length / 1048576) });
  const r = new ByteReader(b, limits);
  const ver = [b[8], b[9], b[10]];
  if (ver[0] !== 0 || vcmp(ver, [0, 4, 0]) < 0 || vcmp(ver, [NEWEST[0], NEWEST[1], 255]) > 0) {
    throw unsupported('ccusd.unsupported.version', { version: ver.join('.') });
  }
  r.seek(16);
  const tocOffset = r.u64();
  if (tocOffset < 88 || tocOffset >= b.length) throw damaged('ccusd.damaged.toc');

  // table of contents
  r.seek(tocOffset);
  const nSec = r.u64();
  if (nSec > 64) throw damaged('ccusd.damaged.toc');
  const sections = new Map();
  for (let i = 0; i < nSec; i++) {
    const nameBytes = r.bytes(16);
    const end = nameBytes.indexOf(0);
    const name = utf8decode(nameBytes.subarray(0, end < 0 ? 16 : end));
    const start = r.u64(), size = r.u64();
    if (start + size > b.length) throw damaged('ccusd.damaged.toc');
    sections.set(name, { start, size });
  }
  const sec = (name) => {
    const s = sections.get(name);
    if (!s) return null;
    r.seek(s.start);
    return s;
  };
  const compressedInts = (n, unsigned = true) => {
    const size = r.u64();
    if (size > b.length) throw damaged('ccusd.damaged.section', { name: 'integers' });
    return decodeInts(r.bytes(size), n, { unsigned });
  };

  // TOKENS
  const tokens = [];
  if (sec('TOKENS')) {
    const n = r.count(r.u64());
    const usize = r.u64(), csize = r.u64();
    if (usize > limits.valueBytes) throw tooBig('ccusd.too_big.bytes', { n: Math.round(usize / 1048576) });
    const chars = unpackChunks(r.bytes(csize), usize);
    let p = 0;
    for (let i = 0; i < n; i++) {
      const z = chars.indexOf(0, p);
      if (z < 0) throw damaged('ccusd.damaged.section', { name: 'TOKENS' });
      tokens.push(utf8decode(chars.subarray(p, z)));
      p = z + 1;
    }
  }
  const tok = (i) => { if (i >= tokens.length) throw damaged('ccusd.damaged.index', { what: 'token' }); return tokens[i]; };

  // STRINGS (string index → token index)
  const strings = [];
  if (sec('STRINGS')) {
    const n = r.count(r.u64());
    for (let i = 0; i < n; i++) strings.push(tok(r.u32()));
  }
  const str = (i) => { if (i >= strings.length) throw damaged('ccusd.damaged.index', { what: 'string' }); return strings[i]; };

  // FIELDS
  let fieldTok = new Uint32Array(0), fieldRep = [];
  if (sec('FIELDS')) {
    const n = r.count(r.u64());
    fieldTok = compressedInts(n);
    const repsSize = r.u64();
    const reps = unpackChunks(r.bytes(repsSize), n * 8);
    const dv = new DataView(reps.buffer, reps.byteOffset, reps.byteLength);
    fieldRep = new Array(n);
    for (let i = 0; i < n; i++) fieldRep[i] = dv.getBigUint64(i * 8, true);
  }
  // FIELDSETS (field indices, each set ended by ~0)
  let fieldSets = new Uint32Array(0);
  if (sec('FIELDSETS')) {
    const n = r.count(r.u64());
    fieldSets = compressedInts(n);
  }
  // PATHS
  let paths = [];
  if (sec('PATHS')) {
    const nPaths = r.count(r.u64());
    paths = new Array(nPaths).fill('');   // slots the tree leaves out are the empty path
    const n = r.count(r.u64());
    const idx = compressedInts(n), elem = compressedInts(n, false), jumps = compressedInts(n, false);
    buildPaths(paths, idx, elem, jumps, tok);
  }
  // SPECS
  const layer = new Layer();
  layer.format = 'usdc';
  layer.version = ver.join('.');
  layer.specs.clear();
  const values = new ValueReader(r, { tok, str, paths, ver, limits });
  if (sec('SPECS')) {
    const n = r.count(r.u64());
    if (n > limits.specs) throw tooBig('ccusd.too_big.count', { n });
    const pi = compressedInts(n), fsi = compressedInts(n), st = compressedInts(n);
    for (let i = 0; i < n; i++) {
      const p = paths[pi[i]];
      if (!p) throw damaged('ccusd.damaged.index', { what: 'path' });
      const type = SPEC_TYPES[st[i]];
      if (!type || type === 'unknown' || layer.specs.has(p)) continue;   // the reference drops these too
      const fields = new Map();
      for (let k = fsi[i]; ; k++) {
        if (k >= fieldSets.length) throw damaged('ccusd.damaged.section', { name: 'FIELDSETS' });
        const f = fieldSets[k];
        if (f === 0xffffffff) break;
        if (f >= fieldTok.length) throw damaged('ccusd.damaged.index', { what: 'field' });
        fields.set(tok(fieldTok[f]), values.unpack(fieldRep[f]));
      }
      layer.specs.set(p, { type, fields });
    }
  }
  if (!layer.specs.has('/')) layer.specs.set('/', { type: 'pseudoRoot', fields: new Map() });
  return layer;
}

function buildPaths(paths, idx, elem, jumps, tok) {
  const n = idx.length;
  // iterative form of the reference's recursion: a stack of (index, parent) to visit
  const stack = [[0, '']];
  let guard = 0;
  while (stack.length) {
    let [cur, parent] = stack.pop();
    for (;;) {
      if (cur >= n || ++guard > n * 2 + 2) throw damaged('ccusd.damaged.paths');
      let p;
      if (!parent) p = '/';
      else {
        const e = elem[cur], name = tok(Math.abs(e));
        p = e < 0 ? parent + '.' + name : name.startsWith('{') ? parent + name : parent === '/' ? '/' + name : (parent.endsWith('}') ? parent + name : parent + '/' + name);
      }
      if (idx[cur] >= paths.length) throw damaged('ccusd.damaged.index', { what: 'path' });
      paths[idx[cur]] = p;
      const j = jumps[cur];
      const hasChild = j > 0 || j === -1, hasSibling = j >= 0;
      if (hasChild && hasSibling) stack.push([cur + j, parent]);
      if (hasChild) { parent = p; cur++; continue; }
      if (hasSibling) { cur++; continue; }
      break;
    }
  }
}

/** Unpacks 64-bit value representations (cached by representation, so shared values stay shared). */
class ValueReader {
  constructor(r, ctx) { this.r = r; this.c = ctx; this.cache = new Map(); this.busy = new Set(); this.depth = 0; }
  unpack(word) {
    const isArray = !!(word >> 63n & 1n), inlined = !!(word >> 62n & 1n), compressed = !!(word >> 61n & 1n), edit = !!(word >> 60n & 1n);
    const type = Number((word >> 48n) & 0xffn);
    const payload = Number(word & 0xffffffffffffn);
    if (edit) throw unsupported('ccusd.unsupported.array_edit');
    if (!inlined && this.cache.has(word)) return this.cache.get(word);
    if (this.busy.has(word) || this.depth > this.c.limits.depth) throw damaged('ccusd.damaged.loop');
    this.busy.add(word); this.depth++;
    const save = this.r.pos;
    try {
      const v = this.decode(type, isArray, inlined, compressed, payload);
      if (!inlined) this.cache.set(word, v);
      return v;
    } finally { this.r.pos = save; this.busy.delete(word); this.depth--; }
  }
  decode(type, isArray, inlined, compressed, payload) {
    const r = this.r, c = this.c;
    const base = ENUM_TYPE[type];
    if (base) {
      if (isArray) {
        if (payload === 0) return V(base + '[]', emptyArray(base));
        r.seek(payload);
        if (vcmp(c.ver, [0, 5, 0]) < 0) r.u32();
        return V(base + '[]', this.array(base, compressed));
      }
      if (inlined) return V(base, this.inline(base, payload));
      r.seek(payload);
      return V(base, this.scalar(base));
    }
    const kind = ENUM_KIND[type];
    if (!kind) throw unsupported('ccusd.unsupported.type', { type });
    const low = payload & 0xffffffff;
    switch (kind) {
      case 'specifier': return V(kind, SPECIFIERS[low] || 'def');
      case 'variability': return V(kind, low === 1 || low === 2 ? 'uniform' : 'varying');
      case 'permission': return V(kind, low === 1 ? 'private' : 'public');
      case 'block': case 'animationBlock': return V('block', null);
      case 'spline': throw unsupported('ccusd.unsupported.spline');
      default: break;
    }
    if (kind === 'dictionary' && inlined) return V(kind, new Map());
    r.seek(payload);
    switch (kind) {
      case 'dictionary': return V(kind, this.dict());
      case 'tokens': return V(kind, this.vec(() => c.tok(r.u32())));
      case 'strings': return V(kind, this.vec(() => c.str(r.u32())));
      case 'paths': return V(kind, this.vec(() => this.pathAt(r.u32())));
      case 'doubles': return V(kind, this.vec(() => r.f64()));
      case 'layerOffsets': return V(kind, this.vec(() => ({ offset: r.f64(), scale: r.f64() })));
      case 'variantSelection': {
        const n = r.count(r.u64()), m = new Map();
        for (let i = 0; i < n; i++) m.set(c.str(r.u32()), c.str(r.u32()));
        return V(kind, m);
      }
      case 'payload': return V(kind, this.payloadItem());
      case 'timeSamples': return V(kind, this.timeSamples());
      case 'value': return this.vtValue();
      case 'unregistered': { const v = this.vtValue(); return V('unregistered', v.v); }
      case 'relocates': return V(kind, this.vec(() => [this.pathAt(r.u32()), this.pathAt(r.u32())]));
      case 'duration': return V(kind, r.f64());
      default: break;
    }
    if (kind.startsWith('listop:')) {
      const item = kind.slice(7);
      const read = {
        token: () => c.tok(r.u32()), string: () => c.str(r.u32()), path: () => this.pathAt(r.u32()),
        reference: () => this.referenceItem(), payload: () => this.payloadItem(), int: () => r.i32(), uint: () => r.u32(),
        int64: () => r.i64(), uint64: () => r.u64(), unregistered: () => this.vtValue().v,
      }[item];
      const h = r.u8();
      const op = { explicit: !!(h & 1) };
      const keys = [[2, 'explicitItems'], [4, 'addedItems'], [32, 'prependedItems'], [64, 'appendedItems'], [8, 'deletedItems'], [16, 'orderedItems']];
      for (const [bit, key] of keys) if (h & bit) op[key] = this.vec(read);
      return V(kind, op);
    }
    throw unsupported('ccusd.unsupported.type', { type });
  }
  pathAt(i) { const p = this.c.paths[i]; if (p === undefined) throw damaged('ccusd.damaged.index', { what: 'path' }); return p; }
  vec(read) {
    const n = this.r.count(this.r.u64());
    const out = new Array(n);
    for (let i = 0; i < n; i++) out[i] = read();
    return out;
  }
  vtValue() {
    const r = this.r, start = r.pos, off = r.i64();
    r.seek(start + off);
    const word = r.word();
    const after = r.pos;
    const v = this.unpack(word);
    r.pos = after;
    return v;
  }
  dict() {
    const r = this.r, n = r.count(r.u64()), m = new Map();
    for (let i = 0; i < n; i++) { const k = this.c.str(r.u32()); m.set(k, this.vtValue()); }
    return m;
  }
  layerOffset() { return { offset: this.r.f64(), scale: this.r.f64() }; }
  referenceItem() {
    const asset = this.c.str(this.r.u32()), prim = this.pathAt(this.r.u32()), offset = this.layerOffset(), customData = this.dict();
    return { asset, prim, offset, customData };
  }
  payloadItem() {
    const asset = this.c.str(this.r.u32()), prim = this.pathAt(this.r.u32());
    const offset = vcmp(this.c.ver, [0, 8, 0]) >= 0 ? this.layerOffset() : { offset: 0, scale: 1 };
    return { asset, prim, offset };
  }
  timeSamples() {
    const r = this.r;
    let start = r.pos, off = r.i64();
    r.seek(start + off);
    const times = this.unpack(r.word());
    start = r.pos; off = r.i64();
    r.seek(start + off);
    const n = r.count(r.u64());
    const t = times.v;
    if (!Array.isArray(t) || t.length !== n) throw damaged('ccusd.damaged.value');
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
      const v = this.unpack(r.word());
      out[i] = [t[i], v.t === 'block' ? null : v];
    }
    return out;
  }
  inline(base, payload) {
    const c = this.c, d = TYPES[base];
    const u = payload >>> 0;
    const s = u | 0;
    switch (base) {
      case 'bool': return !!(u & 0xff);
      case 'uchar': return u & 0xff;
      case 'int': return s;
      case 'uint': return u;
      case 'int64': return s;
      case 'uint64': return u;
      case 'half': return halfToFloat(u & 0xffff);
      case 'float': case 'double': case 'timecode': { F32B.setUint32(0, u, true); return F32B.getFloat32(0, true); }
      case 'string': return c.str(u);
      case 'token': case 'asset': return c.tok(u);
      default: break;
    }
    const i8 = (k) => { const x = (u >>> (8 * k)) & 0xff; return x > 127 ? x - 256 : x; };
    if (d.mat) {
      const m = d.mat, out = new Array(m * m).fill(0);
      for (let k = 0; k < m; k++) out[k * m + k] = i8(k);
      return out;
    }
    const out = new Array(d.n);
    for (let k = 0; k < d.n; k++) out[k] = i8(k);
    return out;
  }
  one(k) {
    const r = this.r;
    switch (k) {
      case 'bool': return !!r.u8();
      case 'u8': return r.u8();
      case 'i32': return r.i32();
      case 'u32': return r.u32();
      case 'i64': { r.need(8); const v = r.dv.getBigInt64(r.pos, true); r.pos += 8; return safe(v); }
      case 'u64': { r.need(8); const v = r.dv.getBigUint64(r.pos, true); r.pos += 8; return safe(v); }
      case 'f16': return halfToFloat(r.u16());
      case 'f32': return r.f32();
      case 'f64': return r.f64();
      case 'str': return this.c.str(r.u32());
      case 'tok': return this.c.tok(r.u32());
      case 'asset': case 'pathexpr': return this.c.str(r.u32());
      default: throw unsupported('ccusd.unsupported.type', { type: k });
    }
  }
  scalar(base) {
    const d = TYPES[base];
    if (base === 'asset' || base === 'pathExpression') return this.c.str(this.r.u32());
    if (d.n === 1) return this.one(d.k);
    const out = new Array(d.n);
    for (let i = 0; i < d.n; i++) out[i] = this.one(d.k);
    if (d.quat) return quatFromMemory(out);
    return out;
  }
  array(base, compressed) {
    const r = this.r, c = this.c, d = TYPES[base];
    const n = r.count(vcmp(c.ver, [0, 7, 0]) < 0 ? r.u32() : r.u64());
    const total = n * d.n;
    if (total > c.limits.arrayCount) throw tooBig('ccusd.too_big.count', { n: total });
    const k = d.k;
    if (compressed && (k === 'i32' || k === 'u32' || k === 'i64' || k === 'u64') && vcmp(c.ver, [0, 5, 0]) >= 0) {
      if (n < MIN_COMPRESSED) return this.raw(k, n);
      const wide = k === 'i64' || k === 'u64';
      const size = r.u64();
      const ints = decodeInts(r.bytes(size), n, { wide, unsigned: k === 'u32' || k === 'u64' });
      return ints;
    }
    if (compressed && d.n === 1 && (k === 'f16' || k === 'f32' || k === 'f64') && vcmp(c.ver, [0, 6, 0]) >= 0) {
      if (n < MIN_COMPRESSED) return this.raw(k, n);
      const code = r.u8();
      const out = k === 'f64' ? new Float64Array(n) : new Float32Array(n);
      if (code === 105) {            // 'i': every value a whole number
        const size = r.u64();
        const ints = decodeInts(r.bytes(size), n);
        for (let i = 0; i < n; i++) out[i] = ints[i];
      } else if (code === 116) {     // 't': a lookup table and indices
        const lutN = r.u32();
        if (lutN > n) throw damaged('ccusd.damaged.value');
        const lut = this.raw(k, lutN);
        const size = r.u64();
        const ix = decodeInts(r.bytes(size), n, { unsigned: true });
        for (let i = 0; i < n; i++) { if (ix[i] >= lutN) throw damaged('ccusd.damaged.value'); out[i] = lut[ix[i]]; }
      } else throw damaged('ccusd.damaged.value');
      return out;
    }
    if (k === 'str' || k === 'tok' || k === 'asset' || k === 'pathexpr') {
      const out = new Array(n);
      for (let i = 0; i < n; i++) out[i] = this.one(k);
      return out;
    }
    const arr = this.raw(k, total);
    if (d.quat) {
      for (let i = 0; i < arr.length; i += 4) { const q = quatFromMemory([arr[i], arr[i + 1], arr[i + 2], arr[i + 3]]); arr[i] = q[0]; arr[i + 1] = q[1]; arr[i + 2] = q[2]; arr[i + 3] = q[3]; }
    }
    return arr;
  }
  /** n raw little-endian values of kind k → a typed array (half → Float32Array). */
  raw(k, n) {
    const r = this.r;
    const size = { bool: 1, u8: 1, i32: 4, u32: 4, i64: 8, u64: 8, f16: 2, f32: 4, f64: 8 }[k];
    const bytes = r.bytes(n * size).slice();   // a copy: aligned, and free of the file buffer
    switch (k) {
      case 'bool': return Array.from(bytes, (x) => !!x);
      case 'u8': return bytes;
      case 'i32': return new Int32Array(bytes.buffer);
      case 'u32': return new Uint32Array(bytes.buffer);
      case 'i64': return new BigInt64Array(bytes.buffer);
      case 'u64': return new BigUint64Array(bytes.buffer);
      case 'f16': { const h = new Uint16Array(bytes.buffer), out = new Float32Array(n); for (let i = 0; i < n; i++) out[i] = halfToFloat(h[i]); return out; }
      case 'f32': return new Float32Array(bytes.buffer);
      default: return new Float64Array(bytes.buffer);
    }
  }
}
const F32B = new DataView(new ArrayBuffer(4));
function safe(v) { return v <= BigInt(Number.MAX_SAFE_INTEGER) && v >= BigInt(Number.MIN_SAFE_INTEGER) ? Number(v) : v; }
function emptyArray(base) {
  const k = TYPES[base].k;
  return k === 'f32' || k === 'f16' ? new Float32Array(0) : k === 'f64' ? new Float64Array(0) : k === 'i32' ? new Int32Array(0) : [];
}
/** In memory a quaternion is its imaginary part then its real part; values here are [w, x, y, z] as text writes them. */
export const QUAT_REAL_LAST = true;
function quatFromMemory(m) { return QUAT_REAL_LAST ? [m[3], m[0], m[1], m[2]] : m; }
