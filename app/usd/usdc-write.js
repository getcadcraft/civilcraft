/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usdc-write.js — an sdf.js Layer as a binary USD layer ("crate", `.usdc`), version 0.8.0 (what the reference library
 * writes by default): values first, then the TOKENS / STRINGS / FIELDS / FIELDSETS / PATHS / SPECS sections and the table
 * of contents. Integer arrays of 16 or more and every index table use the integer coding (intcode.js); small values are
 * inlined in their 64-bit representation as the format allows; equal values are written once. Layout as in
 * usdc-read.js (see NOTICE). Our own code. DOM-free.
 *
 *   writeUsdc(layer) → Uint8Array
 */
import { ByteWriter, UsdError, floatToHalf, utf8 } from './util.js';
import { encodeInts } from './intcode.js';
import { packChunks } from './lz4.js';
import { TYPES, KIND_ENUM, path as P } from './sdf.js';
import { SPEC_TYPES, QUAT_REAL_LAST } from './usdc-read.js';

const VERSION = [0, 8, 0];
const SPECIFIER = { def: 0, over: 1, class: 2 };

const rep = (e, payload, { array = false, inline = false, compressed = false } = {}) =>
  (array ? 1n << 63n : 0n) | (inline ? 1n << 62n : 0n) | (compressed ? 1n << 61n : 0n) | (BigInt(e) << 48n) | BigInt(payload);

export function writeUsdc(layer) {
  const w = new ByteWriter(1 << 20);
  // bootstrap, filled in at the end
  for (let i = 0; i < 88; i++) w.u8(0);

  const tokens = [], tokIx = new Map();
  const tok = (s) => { let i = tokIx.get(s); if (i === undefined) { i = tokens.length; tokens.push(s); tokIx.set(s, i); } return i; };
  tok('');   // index 0: the root's empty element, so no property name sits at 0 (the paths table negates property elements)
  const strings = [], strIx = new Map();
  const str = (s) => { let i = strIx.get(s); if (i === undefined) { i = strings.length; strings.push(tok(s)); strIx.set(s, i); } return i; };
  const paths = [], pathIx = new Map();
  const addPath = (p) => {
    // the empty path (a reference with no prim) gets a slot the PATHS tree leaves out, as the reference library does
    if (p === '') { let e = pathIx.get(''); if (e === undefined) { e = paths.length; paths.push(''); pathIx.set('', e); } return e; }
    let i = pathIx.get(p);
    if (i !== undefined) return i;
    if (p !== '/') addPath(P.parent(p) || '/');
    i = paths.length; paths.push(p); pathIx.set(p, i);
    return i;
  };
  addPath('/');

  const dedup = new Map();
  const at = (key, write) => {
    // values written once: the key is the value's text; returns its offset
    if (key !== null && dedup.has(key)) return dedup.get(key);
    w.align(8);
    const pos = w.tell();
    write();
    if (key !== null) dedup.set(key, pos);
    return pos;
  };

  // ---------------------------------------------------------------- values

  const writeScalar = (k, x) => {
    switch (k) {
      case 'bool': w.u8(x ? 1 : 0); break;
      case 'u8': w.u8(x); break;
      case 'i32': w.i32(x); break;
      case 'u32': w.u32(x); break;
      case 'i64': w.i64(x); break;
      case 'u64': w.u64(x); break;
      case 'f16': w.u16(floatToHalf(x)); break;
      case 'f32': w.f32(x); break;
      case 'f64': w.f64(x); break;
      case 'str': case 'asset': case 'pathexpr': w.u32(str(x)); break;
      case 'tok': w.u32(tok(x)); break;
      default: throw new UsdError('bad_scene', 'scalar ' + k);   // i18n-ignore: programmer error
    }
  };
  const isI8 = (x) => Number.isInteger(x) && x >= -128 && x <= 127 && !Object.is(x, -0);

  const pack = (val) => {
    const t = val.t, v = val.v;
    if (t === 'block') return rep(KIND_ENUM.block, 0, { inline: true });
    const array = t.endsWith('[]');
    const base = array ? t.slice(0, -2) : t;
    const d = TYPES[base];
    if (d) return array ? packArray(base, d, v) : packScalar(base, d, v);
    switch (t) {
      case 'specifier': return rep(KIND_ENUM.specifier, SPECIFIER[v] ?? 0, { inline: true });
      case 'variability': return rep(KIND_ENUM.variability, v === 'uniform' ? 1 : 0, { inline: true });
      case 'permission': return rep(KIND_ENUM.permission, v === 'private' ? 1 : 0, { inline: true });
      case 'dictionary': {
        if (!v.size) return rep(KIND_ENUM.dictionary, 0, { inline: true });
        const reps = [...v].map(([k, x]) => [k, pack(x)]);
        return rep(KIND_ENUM.dictionary, at(null, () => writeDict(reps)));
      }
      case 'tokens': return rep(KIND_ENUM.tokens, at('tk' + JSON.stringify(v), () => { w.u64(v.length); for (const s of v) w.u32(tok(s)); }));
      case 'strings': return rep(KIND_ENUM.strings, at('st' + JSON.stringify(v), () => { w.u64(v.length); for (const s of v) w.u32(str(s)); }));
      case 'paths': case 'path': {
        const list = t === 'path' ? [v] : v;
        const ix = list.map(addPath);
        return rep(KIND_ENUM.paths, at('pa' + JSON.stringify(list), () => { w.u64(ix.length); for (const i of ix) w.u32(i); }));
      }
      case 'doubles': return rep(KIND_ENUM.doubles, at('db' + Array.from(v).join(','), () => { w.u64(v.length); for (const x of v) w.f64(x); }));
      case 'layerOffsets': return rep(KIND_ENUM.layerOffsets, at(null, () => { w.u64(v.length); for (const o of v) { w.f64(o.offset); w.f64(o.scale); } }));
      case 'variantSelection': return rep(KIND_ENUM.variantSelection, at(null, () => { w.u64(v.size); for (const [k, s] of v) { w.u32(str(k)); w.u32(str(s)); } }));
      case 'payload': { const fn = payloadWriter(v); return rep(KIND_ENUM.payload, at(null, fn)); }
      case 'timeSamples': {
        const timesRep = pack({ t: 'doubles', v: v.map((r) => r[0]) });
        const valReps = v.map(([, x]) => (x ? pack(x) : rep(KIND_ENUM.block, 0, { inline: true })));
        return rep(KIND_ENUM.timeSamples, at(null, () => {
          w.i64(8); w.word(timesRep); w.i64(8); w.u64(valReps.length);
          for (const r of valReps) w.word(r);
        }));
      }
      case 'unregistered': {
        const inner = pack(typeof v === 'string' ? { t: 'string', v } : { t: 'dictionary', v });
        return rep(KIND_ENUM.unregistered, at(null, () => { w.i64(8); w.word(inner); }));
      }
      case 'duration': return rep(KIND_ENUM.duration, at(null, () => w.f64(v)));
      case 'relocates': return rep(KIND_ENUM.relocates, at(null, () => { w.u64(v.length); for (const [a, b] of v) { w.u32(addPath(a)); w.u32(addPath(b)); } }));
      default: break;
    }
    if (t.startsWith('listop:')) return packListOp(t, v);
    throw new UsdError('bad_scene', 'value type ' + t);   // i18n-ignore: programmer error
  };

  const writeDict = (reps) => {
    w.u64(reps.length);
    for (const [k, r] of reps) { w.u32(str(k)); w.i64(8); w.word(r); }
  };
  const payloadWriter = (x) => () => { w.u32(str(x.asset || '')); w.u32(addPath(x.prim || '')); w.f64(x.offset?.offset ?? 0); w.f64(x.offset?.scale ?? 1); };

  const packScalar = (base, d, x) => {
    const e = d.e;
    if (base === 'pathExpression') return rep(e, at(null, () => w.u32(str(x))));
    if (d.n === 1) {
      switch (d.k) {
        case 'bool': return rep(e, x ? 1 : 0, { inline: true });
        case 'u8': return rep(e, x & 0xff, { inline: true });
        case 'i32': return rep(e, (x | 0) >>> 0, { inline: true });
        case 'u32': return rep(e, x >>> 0, { inline: true });
        case 'f16': return rep(e, floatToHalf(x), { inline: true });
        case 'f32': { F.setFloat32(0, x, true); return rep(e, F.getUint32(0, true), { inline: true }); }
        case 'str': return rep(e, str(x), { inline: true });
        case 'tok': case 'asset': return rep(e, tok(x), { inline: true });
        case 'f64':
          if (base !== 'timecode' && Object.is(Math.fround(x), x) && Number.isFinite(x)) { F.setFloat32(0, x, true); return rep(e, F.getUint32(0, true), { inline: true }); }
          return rep(e, at(null, () => w.f64(x)));
        case 'i64': case 'u64': {
          const n = typeof x === 'bigint' ? x : BigInt(x);
          if (d.k === 'i64' && n >= -2147483648n && n <= 2147483647n) return rep(e, Number(BigInt.asUintN(32, n)), { inline: true });
          if (d.k === 'u64' && n >= 0n && n <= 4294967295n) return rep(e, Number(n), { inline: true });
          return rep(e, at(null, () => (d.k === 'i64' ? w.i64(n) : w.u64(n))));
        }
        default: break;
      }
    }
    const a = Array.from(x);
    if (d.mat) {
      const m = d.mat;
      let ok = true;
      for (let r = 0; r < m && ok; r++) for (let c = 0; c < m; c++) { const y = a[r * m + c]; if (r === c ? !isI8(y) : !Object.is(y, 0)) { ok = false; break; } }
      if (ok) { let pl = 0; for (let k = 0; k < m; k++) pl |= (a[k * m + k] & 0xff) << (8 * k); return rep(e, pl >>> 0, { inline: true }); }
      return rep(e, at(null, () => { for (const y of a) w.f64(y); }));
    }
    if (d.quat) return rep(e, at(null, () => { for (const y of quatToMemory(a)) writeScalar(d.k, y); }));
    if (a.every(isI8)) { let pl = 0; for (let k = 0; k < d.n; k++) pl |= (a[k] & 0xff) << (8 * k); return rep(e, pl >>> 0, { inline: true }); }
    return rep(e, at(null, () => { for (const y of a) writeScalar(d.k, y); }));
  };

  const packArray = (base, d, v) => {
    const e = d.e;
    const len = v.length;
    if (!len) return rep(e, 0, { array: true });
    const n = len / d.n;
    const k = d.k;
    if ((k === 'i32' || k === 'u32' || k === 'i64' || k === 'u64') && n >= 16) {
      const wide = k === 'i64' || k === 'u64';
      return rep(e, at(null, () => {
        w.u64(n);
        const packed = encodeInts(wide ? Array.from(v, (x) => BigInt(x)) : v, { wide });
        w.u64(packed.length); w.bytes(packed);
      }), { array: true, compressed: true });
    }
    return rep(e, at(null, () => {
      w.u64(n);
      if (k === 'str' || k === 'asset' || k === 'pathexpr') { for (const s of v) w.u32(str(s)); return; }
      if (k === 'tok') { for (const s of v) w.u32(tok(s)); return; }
      if (d.quat) { for (let i = 0; i < len; i += 4) for (const y of quatToMemory([v[i], v[i + 1], v[i + 2], v[i + 3]])) writeScalar(k, y); return; }
      if (k === 'f32') { w.bytes(new Uint8Array(Float32Array.from(v).buffer)); return; }
      if (k === 'f64') { w.bytes(new Uint8Array(Float64Array.from(v).buffer)); return; }
      for (let i = 0; i < len; i++) writeScalar(k, v[i]);
    }), { array: true });
  };

  const packListOp = (t, op) => {
    const item = t.slice(7);
    const e = KIND_ENUM[t];
    // nested values (reference customData) are written before the list op itself
    const pre = new Map();
    if (item === 'reference') {
      for (const key of ['explicitItems', 'addedItems', 'prependedItems', 'appendedItems', 'deletedItems', 'orderedItems']) {
        for (const x of op[key] || []) if (x.customData && x.customData.size) pre.set(x, [...x.customData].map(([k, v]) => [k, pack(v)]));
      }
    }
    const one = {
      token: (x) => w.u32(tok(x)), string: (x) => w.u32(str(x)), path: (x) => w.u32(addPath(x)),
      int: (x) => w.i32(x), uint: (x) => w.u32(x), int64: (x) => w.i64(x), uint64: (x) => w.u64(x),
      reference: (x) => {
        w.u32(str(x.asset || '')); w.u32(addPath(x.prim || ''));
        w.f64(x.offset?.offset ?? 0); w.f64(x.offset?.scale ?? 1);
        writeDict(pre.get(x) || []);
      },
      payload: (x) => payloadWriter(x)(),
    }[item];
    if (!one) throw new UsdError('bad_scene', 'list op ' + t);   // i18n-ignore: programmer error
    const parts = [[2, 'explicitItems'], [4, 'addedItems'], [32, 'prependedItems'], [64, 'appendedItems'], [8, 'deletedItems'], [16, 'orderedItems']];
    let h = op.explicit ? 1 : 0;
    for (const [bit, key] of parts) if (op[key] && (op[key].length || (op.explicit && key === 'explicitItems'))) h |= bit;
    if (op.explicit && !(op.explicitItems || []).length) h &= ~2;
    return rep(e, at(null, () => {
      w.u8(h);
      // the reader reads in this order: explicit, added, prepended, appended, deleted, ordered
      for (const [bit, key] of parts) if (h & bit) { w.u64(op[key].length); for (const x of op[key]) one(x); }
    }));
  };

  // ---------------------------------------------------------------- specs

  // every spec's path first, so paths come out in a stable order
  for (const p of layer.specs.keys()) addPath(p);
  const fields = [], fieldIx = new Map();
  const fieldSets = [], fieldSetIx = new Map();
  const specs = [];
  for (const [p, s] of layer.specs) {
    const list = [];
    for (const [name, val] of s.fields) {
      const r = pack(val);
      const key = tok(name) + ':' + r.toString(16);
      let fi = fieldIx.get(key);
      if (fi === undefined) { fi = fields.length; fields.push([tok(name), r]); fieldIx.set(key, fi); }
      list.push(fi);
    }
    const sk = list.join(',');
    let fs = fieldSetIx.get(sk);
    if (fs === undefined) { fs = fieldSets.length; fieldSets.push(...list, 0xffffffff); fieldSetIx.set(sk, fs); }
    const type = SPEC_TYPES.indexOf(s.type);
    if (type <= 0) throw new UsdError('bad_scene', 'spec type ' + s.type);   // i18n-ignore: programmer error
    specs.push([pathIx.get(p), fs, type]);
  }

  // ---------------------------------------------------------------- sections
  const sections = [];
  const section = (name, fn) => { w.align(8); const start = w.tell(); fn(); sections.push([name, start, w.tell() - start]); };
  const ints = (arr) => { const packed = encodeInts(arr); w.u64(packed.length); w.bytes(packed); };

  // paths are written before tokens (their element names add tokens)
  const pathTree = encodePaths(paths, tok);
  section('TOKENS', () => {
    const parts = tokens.map((s) => utf8.encode(s));
    const total = parts.reduce((a, b) => a + b.length + 1, 0);
    const chars = new Uint8Array(total);
    let o = 0;
    for (const b of parts) { chars.set(b, o); o += b.length + 1; }
    const packed = packChunks(chars);
    w.u64(tokens.length); w.u64(total); w.u64(packed.length); w.bytes(packed);
  });
  section('STRINGS', () => { w.u64(strings.length); for (const t of strings) w.u32(t); });
  section('FIELDS', () => {
    w.u64(fields.length);
    ints(fields.map((f) => f[0]));
    const raw = new Uint8Array(fields.length * 8);
    const dv = new DataView(raw.buffer);
    fields.forEach((f, i) => dv.setBigUint64(i * 8, f[1], true));
    const packed = packChunks(raw);
    w.u64(packed.length); w.bytes(packed);
  });
  section('FIELDSETS', () => { w.u64(fieldSets.length); ints(fieldSets); });
  section('PATHS', () => {
    w.u64(paths.length); w.u64(pathTree.idx.length);
    ints(pathTree.idx); ints(pathTree.elem); ints(pathTree.jumps);
  });
  section('SPECS', () => { w.u64(specs.length); ints(specs.map((s) => s[0])); ints(specs.map((s) => s[1])); ints(specs.map((s) => s[2])); });

  w.align(8);
  const toc = w.tell();
  w.u64(sections.length);
  for (const [name, start, size] of sections) {
    const nb = new Uint8Array(16);
    nb.set(utf8.encode(name));
    w.bytes(nb); w.u64(start); w.u64(size);
  }
  const end = w.tell();
  w.seek(0);
  w.bytes(utf8.encode('PXR-USDC'));
  w.bytes(Uint8Array.from([...VERSION, 0, 0, 0, 0, 0]));
  w.u64(toc);
  w.seek(end);
  return w.result();
}

const F = new DataView(new ArrayBuffer(4));
function quatToMemory(q) { return QUAT_REAL_LAST ? [q[1], q[2], q[3], q[0]] : q; }

/** The paths as the three integer lists of the PATHS section (depth-first; jumps as the reader expects). */
function encodePaths(paths, tok) {
  const kids = new Map(paths.map((p) => [p, []]));
  for (const p of paths) if (p !== '/' && p !== '') kids.get(P.parent(p) || '/').push(p);
  const ix = new Map(paths.map((p, i) => [p, i]));
  const idx = [], elem = [], jumps = [];
  const visit = (list, depth) => {
    if (depth > 4096) throw new UsdError('bad_scene', 'paths too deep');   // i18n-ignore: programmer error
    list.forEach((p, k) => {
      const me = idx.length;
      idx.push(ix.get(p));
      if (p === '/') elem.push(0);
      else {
        const name = P.name(p);
        elem.push(P.isProp(p) ? -tok(name) : tok(name));
      }
      jumps.push(0);
      const ch = kids.get(p);
      const hasSibling = k < list.length - 1, hasChild = ch.length > 0;
      if (hasChild) visit(ch, depth + 1);
      jumps[me] = hasChild && hasSibling ? idx.length - me : hasSibling ? 0 : hasChild ? -1 : -2;
    });
  };
  visit(['/'], 0);
  return { idx, elem, jumps };
}
