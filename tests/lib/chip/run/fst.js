/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fst.js — our own reader for FST wave files (the compressed format Verilator writes with --trace-fst and GTKWave reads) (HD.4, 2026-11-21).
 * DOM-free; imports only ./zlib.js (our inflate, a byte copy of lib/zip/zlib.js). Written for this add-on: the layout was learned from the MIT-licensed libfstwriter
 * that Verilator 5.054 ships (include/fstcpp) and checked against real Verilator files; no code was copied.
 *
 *   isFstBytes(bytes) → true when the file starts with an FST header block
 *   readFst(bytes, { maxChanges = 5e6 }) → { ok, header: { start, end, timescale (exponent, -9 = ns), writer, date, handles, vars, scopes },
 *       vars: [{ path, name, kind, width, handle, dir }], changes: Map(handle → { t: number[], v: string[] }), problems[] }
 *   fstToVcd(bytes) → VCD text (so the waves go through the one VCD reader, vcd.js readVcd, and the same viewer)
 *
 * Read: header (0), geometry (3), hierarchy gzip (4) / LZ4 (6), value-change blocks version 3 (8: "dynamic alias 2"), wave data packed
 * with LZ4 ('4') or zlib ('Z'). Not read, said in `problems`: older value-change blocks (1, 5), FastLZ wave data ('F'), the twice-LZ4
 * hierarchy (7), the outer gzip wrapper (254), VHDL nine-state values beyond what VCD can hold (written as x).
 * Everything is big-endian except reals (the writer's own byte order, found from the header's e = 2.718… check value).
 */
import { inflateZlib, inflateRawSized } from './zlib.js';   // byte copy of lib/zip/zlib.js (tools/zip/sync.mjs)

const KIND = ['event', 'integer', 'parameter', 'real', 'real', 'reg', 'supply0', 'supply1', 'time', 'tri', 'triand', 'trior', 'trireg', 'tri0', 'tri1',
  'wand', 'wire', 'wor', 'port', 'sparray', 'realtime', 'string', 'wire', 'wire', 'integer', 'integer', 'integer', 'integer', 'reg', 'real'];
const ONE_BIT = ['x', 'z', 'h', 'u', 'w', 'l', '-', '?'];   // the extended codes of a 1-bit change, (v >> 1) & 7
const DIR = ['implicit', 'input', 'output', 'inout', 'buffer', 'linkage'];

class R {
  constructor(b, p = 0, end = b.length) { this.b = b; this.p = p; this.end = end; }
  need(n) { if (this.p + n > this.end) throw new Error('the FST file ends early'); }
  u8() { this.need(1); return this.b[this.p++]; }
  u64() { this.need(8); let v = 0; for (let i = 0; i < 8; i++) v = v * 256 + this.b[this.p++]; return v; }   // exact below 2^53
  i8() { const v = this.u8(); return v > 127 ? v - 256 : v; }
  leb() { let v = 0, mul = 1, x; do { this.need(1); x = this.b[this.p++]; v += (x & 0x7f) * mul; mul *= 128; } while (x & 0x80); return v; }
  sleb() { let v = 0, mul = 1, x; do { this.need(1); x = this.b[this.p++]; v += (x & 0x7f) * mul; mul *= 128; } while (x & 0x80); if (x & 0x40) v -= mul; return v; }
  str0() { const a = this.p; while (this.p < this.end && this.b[this.p] !== 0) this.p++; const s = new TextDecoder().decode(this.b.subarray(a, this.p)); this.p++; return s; }
  bytes(n) { this.need(n); const s = this.b.subarray(this.p, this.p + n); this.p += n; return s; }
}

/** LZ4 block format (no frame): literals + matches; `size` = the known uncompressed length. */
export function lz4Block(src, size) {
  const out = new Uint8Array(size);
  let i = 0, o = 0;
  while (i < src.length) {
    const tok = src[i++];
    let lit = tok >> 4;
    if (lit === 15) { let x; do { x = src[i++]; lit += x; } while (x === 255); }
    if (o + lit > size || i + lit > src.length) throw new Error('LZ4 data is damaged');
    out.set(src.subarray(i, i + lit), o); i += lit; o += lit;
    if (i >= src.length) break;   // the last sequence has literals only
    const off = src[i] | (src[i + 1] << 8); i += 2;
    if (!off || off > o) throw new Error('LZ4 data is damaged');
    let len = tok & 15;
    if (len === 15) { let x; do { x = src[i++]; len += x; } while (x === 255); }
    len += 4;
    if (o + len > size) throw new Error('LZ4 data is damaged');
    for (let k = 0; k < len; k++, o++) out[o] = out[o - off];
  }
  if (o !== size) throw new Error('LZ4 data is shorter than it says');
  return out;
}

/** gzip (RFC 1952) member → bytes; the deflate data goes through our zlib inflate by wrapping it. */
function gunzip(src, size) {
  if (src[0] !== 0x1f || src[1] !== 0x8b || src[2] !== 8) throw new Error('not gzip data');
  const flg = src[3];
  let p = 10;
  if (flg & 4) p += 2 + (src[p] | (src[p + 1] << 8));
  if (flg & 8) { while (src[p]) p++; p++; }
  if (flg & 16) { while (src[p]) p++; p++; }
  if (flg & 2) p += 2;
  return inflateRawSized(src.subarray(p), size);
}

export function isFstBytes(b) {
  return !!b && b.length > 9 + 321 && b[0] === 0 && b[1] === 0 && b[2] === 0 && b[3] === 0 && b[4] === 0 && b[5] === 0 && b[6] === 0 && b[7] === 0x01 && b[8] === 0x49;   // block 0, length 329
}

function realOrder(b, at) {   // the header's e: 2.718281828459045 as written (native order); find whether it is little-endian
  const dv = new DataView(b.buffer, b.byteOffset + at, 8);
  return Math.abs(dv.getFloat64(0, true) - Math.E) < 1e-12 ? 'le' : 'be';
}


export function readFst(bytes, { maxChanges = 5e6 } = {}) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const out = { ok: false, header: null, vars: [], changes: new Map(), problems: [] };
  const widths = [];   // by handle - 1: bit width; 0 = real (8 bytes); -1 = string (not read)
  let le = true, hierBytes = null, nChanges = 0;
  const blocks = [];
  for (let p = 0; p + 9 <= b.length;) {
    const type = b[p], len = new R(b, p + 1).u64();
    if (len < 8 || p + 1 + len > b.length) { out.problems.push('block at byte ' + p + ' runs past the end of the file'); break; }
    blocks.push({ type, at: p + 9, end: p + 1 + len });
    p += 1 + len;
  }
  for (const bl of blocks) {
    try {
      const r = new R(b, bl.at, bl.end);
      if (bl.type === 0) {
        const start = r.u64(), end = r.u64();
        le = realOrder(b, r.p) === 'le'; r.p += 8;
        r.u64(); const scopes = r.u64(), vars = r.u64(), handles = r.u64(); r.u64();
        const timescale = r.i8();
        const text = (n) => { const s = r.bytes(n); const z = s.indexOf(0); return new TextDecoder().decode(z < 0 ? s : s.subarray(0, z)); };
        const writer = text(128), date = text(26);
        out.header = { start, end, timescale, writer, date, scopes, vars, handles };
      } else if (bl.type === 3) {
        const ulen = r.u64(); r.u64();   // uncompressed length, handle count
        let g = b.subarray(r.p, bl.end);
        if (g.length !== ulen) g = inflateZlib(g, ulen);
        const gr = new R(g);
        while (gr.p < g.length) { const w = gr.leb(); widths.push(w === 0 ? 0 : w === 0xffffffff ? -1 : w); }
      } else if (bl.type === 6) {
        const ulen = r.u64();
        hierBytes = lz4Block(b.subarray(r.p, bl.end), ulen);
      } else if (bl.type === 4) {
        const ulen = r.u64();
        hierBytes = gunzip(b.subarray(r.p, bl.end), ulen);
      } else if (bl.type === 7) out.problems.push('this FST file stores its signal names twice-LZ4 compressed (block 7), which is not read');
      else if (bl.type === 1 || bl.type === 5) out.problems.push('this FST file uses an older value-change block (' + bl.type + '), which is not read');
      else if (bl.type === 254) out.problems.push('this FST file is wrapped in gzip as a whole; unpack it first');
    } catch (e) { out.problems.push('block ' + bl.type + ': ' + e.message); }
  }
  if (!out.header) { out.problems.push('no FST header'); return out; }
  // hierarchy → vars with paths
  if (hierBytes) {
    const h = new R(hierBytes), stack = [];
    let handle = 0;
    while (h.p < hierBytes.length) {
      const tag = h.u8();
      if (tag === 254) { h.u8(); const name = h.str0(); h.str0(); stack.push(name); }
      else if (tag === 255) stack.pop();
      else if (tag === 252) { h.u8(); h.u8(); h.str0(); h.leb(); }
      else if (tag === 253) { /* attribute end */ }
      else {
        const dir = h.u8(), name = h.str0(), len = h.leb(), alias = h.leb();
        const hd = alias || ++handle;
        out.vars.push({ path: [...stack, name.replace(/\s+\[.*$/, '')].join('.'), name, kind: KIND[tag] || 'wire', width: len, handle: hd, dir: DIR[dir] || '' });
      }
    }
  } else out.problems.push('no signal names (hierarchy block) in this FST file');
  // value changes
  const W = (hd) => widths[hd - 1];
  const push = (hd, t, v) => { let c = out.changes.get(hd); if (!c) out.changes.set(hd, (c = { t: [], v: [] })); if (c.t.length && c.t[c.t.length - 1] === t) c.v[c.v.length - 1] = v; else { c.t.push(t); c.v.push(v); } nChanges++; };
  const realAt = (g, p) => new DataView(g.buffer, g.byteOffset + p, 8).getFloat64(0, le);
  const bitsOf = (g, p, w) => { let s = ''; for (let i = 0; i < w; i++) s += (g[p + (i >> 3)] >> (7 - (i & 7))) & 1; return s; };
  for (const bl of blocks.filter((x) => x.type === 8)) {
    try {
      const r = new R(b, bl.at, bl.end);
      r.u64(); r.u64(); r.u64();   // begin and end time, memory
      // time table (from the end of the block)
      const tail = new R(b, bl.end - 24, bl.end);
      const tUlen = tail.u64(), tClen = tail.u64(), tCount = tail.u64();
      const tStart = bl.end - 24 - tClen;
      let tb = b.subarray(tStart, tStart + tClen);
      if (tClen !== tUlen) tb = inflateZlib(tb, tUlen);
      const times = [], tr = new R(tb);
      for (let i = 0, t = 0; i < tCount; i++) { t += tr.leb(); times.push(t); }
      const posLen = new R(b, tStart - 8, tStart).u64();
      const posStart = tStart - 8 - posLen;
      // initial values
      const bUlen = r.leb(), bClen = r.leb(), bCount = r.leb();
      let bits = r.bytes(bClen);
      if (bClen !== bUlen) bits = inflateZlib(bits, bUlen);
      let q = 0;
      const t0 = times[0] ?? out.header.start;
      for (let hd = 1; hd <= bCount; hd++) {
        const w = W(hd);
        if (w === 0) { push(hd, t0, String(realAt(bits, q))); q += 8; }
        else if (w > 0) { push(hd, t0, new TextDecoder().decode(bits.subarray(q, q + w)).toLowerCase()); q += w; }
      }
      // wave data, then the position table that says where each handle's data starts
      r.leb(); const pack = String.fromCharCode(r.u8());
      const base = r.p - 1;   // offsets count from the pack-type byte (the first handle's offset is 1)
      const pr = new R(b, posStart, posStart + posLen);
      const offs = new Array(bCount).fill(0), alias = new Array(bCount).fill(0);
      let idx = 0, pval = 0, prevAlias = 0;
      while (pr.p < pr.end && idx < bCount) {
        if (b[pr.p] & 1) {
          const v = pr.sleb(); const sh = Math.floor(v / 2);
          if (sh > 0) { pval += sh; offs[idx] = pval; }
          else if (sh < 0) { prevAlias = sh; alias[idx] = sh; }
          else alias[idx] = prevAlias;
          idx++;
        } else idx += Math.floor(pr.leb() / 2);
      }
      const starts = offs.map((o, i) => [o, i]).filter(([o]) => o > 0).sort((x, y) => x[0] - y[0]);
      const endOf = new Map(starts.map(([o, i], k) => [i, k + 1 < starts.length ? starts[k + 1][0] : posStart - base]));
      const decode = (i) => {
        const o = offs[i];
        if (!o) return null;
        const c = new R(b, base + o, base + endOf.get(i));
        const ulen = c.leb();
        let d = b.subarray(c.p, c.end);
        if (ulen) {
          if (pack === '4') d = lz4Block(d, ulen);
          else if (pack === 'Z') d = inflateZlib(d, ulen);
          else throw new Error('wave data packed with "' + pack + '" (FastLZ) is not read');
        }
        return d;
      };
      for (let i = 0; i < bCount; i++) {
        const hd = i + 1, w = W(hd);
        const src = alias[i] ? -alias[i] - 1 : i;
        const d = decode(src);
        if (!d || w < 0) continue;
        const c = new R(d);
        let ti = 0;
        while (c.p < d.length) {
          if (nChanges >= maxChanges) { out.problems.push('stopped after ' + maxChanges + ' changes'); break; }
          if (w === 1) {
            const v = c.leb();
            if (v & 1) { ti += Math.floor(v / 16); push(hd, times[ti], ONE_BIT[(v >> 1) & 7] === 'z' ? 'z' : 'x'); }
            else { ti += Math.floor(v / 4); push(hd, times[ti], (v >> 1) & 1 ? '1' : '0'); }
          } else if (w === 0) { const v = c.leb(); ti += Math.floor(v / 2); push(hd, times[ti], String(realAt(d, c.p))); c.p += 8; }
          else {
            const v = c.leb(); ti += Math.floor(v / 2);
            if (v & 1) { const s = new TextDecoder().decode(c.bytes(w)).toLowerCase().replace(/[^01xz]/g, 'x'); push(hd, times[ti], s); }
            else { const n = (w + 7) >> 3; push(hd, times[ti], bitsOf(d, c.p, w)); c.p += n; }
          }
        }
      }
    } catch (e) { out.problems.push('value-change block: ' + e.message); }
  }
  out.ok = !!out.header && out.vars.length > 0 && !out.problems.some((p) => /block 8|value-change block/.test(p));
  return out;
}

const UNITS = [[0, 's'], [-3, 'ms'], [-6, 'us'], [-9, 'ns'], [-12, 'ps'], [-15, 'fs']];
/** The same waves as VCD text. Scopes from the paths; each handle gets one code; aliases share it. */
export function fstToVcd(fst) {
  const f = fst.vars ? fst : readFst(fst);
  const ex = f.header?.timescale ?? -9;
  const u = UNITS.find(([e]) => e <= ex) || [-15, 'fs'];
  const L = ['$date ' + (f.header?.date || '') + ' $end', '$version ' + (f.header?.writer || 'FST') + ' (read by CadCraft) $end', `$timescale ${10 ** (ex - u[0])}${u[1]} $end`];
  const code = (n) => { let s = ''; n += 1; while (n > 0) { n--; s += String.fromCharCode(33 + (n % 94)); n = Math.floor(n / 94); } return s; };
  let open = [];
  for (const v of f.vars) {
    const parts = v.path.split('.'), scope = parts.slice(0, -1);
    let k = 0; while (k < open.length && k < scope.length && open[k] === scope[k]) k++;
    for (let j = open.length; j > k; j--) L.push('$upscope $end');
    for (let j = k; j < scope.length; j++) L.push('$scope module ' + scope[j] + ' $end');
    open = scope;
    const range = /\s+(\[[^\]]*\])$/.exec(v.name);
    L.push(`$var ${v.kind === 'real' ? 'real' : v.kind} ${v.width || 1} ${code(v.handle)} ${parts[parts.length - 1]}${range ? ' ' + range[1] : ''} $end`);
  }
  for (let j = open.length; j > 0; j--) L.push('$upscope $end');
  L.push('$enddefinitions $end');
  const ev = [];
  const widthOf = new Map(f.vars.map((v) => [v.handle, v]));
  for (const [hd, c] of f.changes) for (let i = 0; i < c.t.length; i++) ev.push([c.t[i], hd, c.v[i]]);
  ev.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  let t = -1;
  for (const [tt, hd, v] of ev) {
    const info = widthOf.get(hd);
    if (!info) continue;
    if (tt !== t) { L.push('#' + tt); t = tt; }
    if (info.kind === 'real') L.push('r' + v + ' ' + code(hd));
    else if ((info.width || 1) === 1) L.push(v + code(hd));
    else L.push('b' + v + ' ' + code(hd));
  }
  return L.join('\n') + '\n';
}
