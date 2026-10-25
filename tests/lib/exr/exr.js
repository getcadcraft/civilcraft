/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is internal diagnostics (the {why} of ccexr.damaged.chunk / ccexr.write.bad_image) and file-format text. */
/**
 * exr.js — cc-exr's OpenEXR reader and writer, from the published OpenEXR documents (OpenEXRFileLayout,
 * TechnicalIntroduction, StandardAttributes). PIZ follows OpenEXR's sources (see piz.js); everything else is the docs.
 * DOM-free, synchronous, no dependencies.
 *
 *   readExr(bytes, { part, limits }) → {
 *     format: 'exr', version: 2, multipart, parts: [Part], notes: [string], incomplete: bool,
 *     ...the first part (or opts.part) spread on top: width, height, channels, header, …
 *   }
 *   Part = { name, type 'scanlineimage' | 'tiledimage', width, height, dataWindow {xMin,yMin,xMax,yMax}, displayWindow,
 *            compression ('none' | 'rle' | 'zips' | 'zip' | 'piz' | 'pxr24' | 'b44' | 'b44a'; read only, the last three), lineOrder, tiles {xSize,ySize,levelMode,
 *            roundingMode} | null, header {name → value}, types {name → attribute type},
 *            channels [{ name, type 'half' | 'float' | 'uint', xSampling, ySampling, pLinear, width, height,
 *                        data: Float32Array (half, float) | Uint32Array (uint) }] (in file order = sorted by name),
 *            missing: number of blocks that could not be read }
 *   Rows run top to bottom (data window yMin first), samples left to right. Only the full-size level of a mipmap or
 *   ripmap image is read (said in notes). Errors: ExrError (util.js) with code not_exr | damaged | too_big | unsupported.
 *   A file whose header reads but whose blocks are partly missing or damaged still opens: `incomplete` is true, the
 *   blocks are left 0 and `notes` says how many.
 *
 *   writeExr({ width, height, channels: [{ name, type: 'half' | 'float' | 'uint', data }], compression: 'zip',
 *              tiles: { xSize, ySize } | null, lineOrder: 'increasing', origin: {x, y}, displayWindow, attributes:
 *              { name: { type, value } } }) → Uint8Array (one part; layers are channel-name prefixes, "diffuse.R")
 *     compression: none | rle | zips | zip | piz. A block that would grow is stored raw, as the format allows.
 *
 *   isExr(bytes) · layersOf(part) → [{ name ('' = the main layer), channels: { R: channel, … } }]
 *   rgbaOf(part, { layer }) → { width, height, data: Float32Array RGBA } (Y → grey; no A → 1)
 */
import { ExrError, LIMITS, Reader, Writer, damaged, HALF_TO_FLOAT, floatToHalf, utf8Bytes } from './util.js';
import { msg } from './messages.js';
import { inflateZlib, deflateZlib } from './zlib.js';
import { pizDecode, pizEncode } from './piz.js';

const MAGIC = 20000630;   // 76 2f 31 01
export const COMPRESSIONS = ['none', 'rle', 'zips', 'zip', 'piz', 'pxr24', 'b44', 'b44a', 'dwaa', 'dwab', 'htj2k256', 'htj2k32', 'lj2k', 'zstd'];
const LINES = { none: 1, rle: 1, zips: 1, zstd: 1, zip: 16, pxr24: 16, piz: 32, b44: 32, b44a: 32, htj2k32: 32, dwaa: 32, dwab: 256, htj2k256: 256, lj2k: 256 };
const READS = new Set(['none', 'rle', 'zips', 'zip', 'piz', 'pxr24', 'b44', 'b44a']);
const WRITES = new Set(['none', 'rle', 'zips', 'zip', 'piz']);
const LINE_ORDERS = ['increasing', 'decreasing', 'random'];
const PIXEL = ['uint', 'half', 'float'];
const SIZE = { uint: 4, half: 2, float: 4 };
const LEVEL_MODES = ['one', 'mipmap', 'ripmap'];

export function isExr(bytes) {
  return bytes && bytes.length >= 8 && bytes[0] === 0x76 && bytes[1] === 0x2f && bytes[2] === 0x31 && bytes[3] === 0x01;
}

// ---------------------------------------------------------------- attributes

function readAttr(type, r, size, name) {
  const why = msg('ccexr.damaged.attribute', { name });
  const end = r.pos + size;
  const f = (n) => { const a = []; for (let i = 0; i < n; i++) a.push(r.f32(why)); return a; };
  const ints = (n) => { const a = []; for (let i = 0; i < n; i++) a.push(r.i32(why)); return a; };
  let v;
  switch (type) {
    case 'box2i': { const [xMin, yMin, xMax, yMax] = ints(4); v = { xMin, yMin, xMax, yMax }; break; }
    case 'box2f': { const [xMin, yMin, xMax, yMax] = f(4); v = { xMin, yMin, xMax, yMax }; break; }
    case 'chlist': {
      v = [];
      for (;;) {
        if (r.pos >= end) throw damaged(msg('ccexr.damaged.channels'));
        if (r.b[r.pos] === 0) { r.pos++; break; }
        const cname = r.cstr(Math.min(255, end - r.pos), msg('ccexr.damaged.channels'));
        const pt = r.i32(why);
        const pLinear = r.u8(why);
        r.bytes(3, why);
        const xSampling = r.i32(why);
        const ySampling = r.i32(why);
        if (!PIXEL[pt] || xSampling < 1 || ySampling < 1) throw damaged(msg('ccexr.damaged.channels'));
        v.push({ name: cname, type: PIXEL[pt], pLinear, xSampling, ySampling });
        if (v.length > LIMITS.channels) throw new ExrError('too_big', msg('ccexr.too_big', { what: msg('ccexr.too_big.channels', { n: v.length }) }));
      }
      break;
    }
    case 'chromaticities': { const a = f(8); v = { red: [a[0], a[1]], green: [a[2], a[3]], blue: [a[4], a[5]], white: [a[6], a[7]] }; break; }
    case 'compression': { const c = r.u8(why); v = COMPRESSIONS[c] ?? 'unknown-' + c; break; }
    case 'double': v = r.f64(why); break;
    case 'envmap': v = ['latlong', 'cube'][r.u8(why)] ?? 'unknown'; break;
    case 'float': v = r.f32(why); break;
    case 'int': v = r.i32(why); break;
    case 'lineOrder': v = LINE_ORDERS[r.u8(why)] ?? 'unknown'; break;
    case 'm33f': v = f(9); break;
    case 'm44f': v = f(16); break;
    case 'rational': v = [r.i32(why), r.u32(why)]; break;
    case 'string': v = new TextDecoder().decode(r.bytes(size, why)); break;
    case 'stringvector': {
      v = [];
      while (r.pos < end) { const n = r.i32(why); if (n < 0 || r.pos + n > end) throw damaged(why); v.push(new TextDecoder().decode(r.bytes(n, why))); }
      break;
    }
    case 'floatvector': v = f(size >> 2); break;
    case 'tiledesc': {
      const xSize = r.u32(why);
      const ySize = r.u32(why);
      const mode = r.u8(why);
      v = { xSize, ySize, levelMode: LEVEL_MODES[mode & 15] ?? 'unknown', roundingMode: (mode >> 4) ? 'up' : 'down' };
      break;
    }
    case 'timecode': v = [r.u32(why), r.u32(why)]; break;
    case 'keycode': v = ints(7); break;
    case 'v2i': v = ints(2); break;
    case 'v2f': v = f(2); break;
    case 'v3i': v = ints(3); break;
    case 'v3f': v = f(3); break;
    case 'v2d': v = [r.f64(why), r.f64(why)]; break;
    case 'v3d': v = [r.f64(why), r.f64(why), r.f64(why)]; break;
    case 'preview': {
      const width = r.u32(why);
      const height = r.u32(why);
      if (width * height * 4 !== size - 8) throw damaged(why);
      v = { width, height, rgba: r.bytes(size - 8, why).slice() };
      break;
    }
    default: v = { type, bytes: r.bytes(size, why).slice() };
  }
  if (r.pos !== end) throw damaged(why);
  return v;
}

function readHeader(r, longNames, limits) {
  const max = longNames ? 255 : 31;
  const header = {};
  const types = {};
  let n = 0;
  for (;;) {
    if (r.pos >= r.end) throw damaged(msg('ccexr.damaged.header_end'));
    if (r.b[r.pos] === 0) { r.pos++; break; }
    const name = r.cstr(max, msg('ccexr.damaged.header_end'));
    const type = r.cstr(max, msg('ccexr.damaged.attribute', { name }));
    const size = r.i32(msg('ccexr.damaged.attribute', { name }));
    if (size < 0 || size > limits.attributeBytes || size > r.left()) throw damaged(msg('ccexr.damaged.attribute', { name }));
    const sub = new Reader(r.b, r.pos);
    sub.end = r.pos + size;
    header[name] = readAttr(type, sub, size, name);
    types[name] = type;
    r.pos += size;
    if (++n > limits.attributes) throw new ExrError('too_big', msg('ccexr.too_big', { what: msg('ccexr.too_big.attributes', { n: limits.attributes }) }));
  }
  return { header, types };
}

// ---------------------------------------------------------------- geometry of a part

const floorDiv = (a, b) => Math.floor(a / b);
/** How many multiples of s lie in [lo, hi]. */
const samplesIn = (lo, hi, s) => (hi < lo ? 0 : floorDiv(hi, s) - floorDiv(lo - 1, s));
const mod = (a, s) => ((a % s) + s) % s;

function floorLog2(x) { let y = 0; while (x > 1) { x = Math.floor(x / 2); y++; } return y; }
function ceilLog2(x) { const f = floorLog2(x); return (2 ** f < x) ? f + 1 : f; }

function levelSize(size, l, up) { return Math.max(1, up ? Math.ceil(size / 2 ** l) : Math.floor(size / 2 ** l)); }

function setupPart(header, types, version, limits, index) {
  for (const k of ['channels', 'compression', 'dataWindow', 'displayWindow', 'lineOrder']) {
    if (!(k in header)) throw damaged(msg('ccexr.damaged.required', { name: k }));
  }
  if (types.channels !== 'chlist' || types.dataWindow !== 'box2i' || types.compression !== 'compression' || types.lineOrder !== 'lineOrder') {
    throw damaged(msg('ccexr.damaged.required', { name: types.channels !== 'chlist' ? 'channels' : types.dataWindow !== 'box2i' ? 'dataWindow' : types.compression !== 'compression' ? 'compression' : 'lineOrder' }));
  }
  const dw = header.dataWindow;
  const width = dw.xMax - dw.xMin + 1;
  const height = dw.yMax - dw.yMin + 1;
  if (!(width >= 1 && height >= 1) || !Number.isSafeInteger(width) || width > 2 ** 30 || height > 2 ** 30) throw damaged(msg('ccexr.damaged.window'));
  if (width * height > limits.pixels) throw new ExrError('too_big', msg('ccexr.too_big', { what: msg('ccexr.too_big.pixels', { n: Math.round(width * height / 1e6) }) }));
  const type = typeof header.type === 'string' ? header.type : ((version & 0x200) ? 'tiledimage' : 'scanlineimage');
  if (type === 'deepscanline' || type === 'deeptile' || (version & 0x800)) throw new ExrError('unsupported', msg('ccexr.unsupported', { what: msg('ccexr.unsupported.deep') }));
  const tiled = type === 'tiledimage';
  const compression = header.compression;
  if (!READS.has(compression)) throw new ExrError('unsupported', msg('ccexr.unsupported', { what: msg('ccexr.unsupported.compression', { name: compression.toUpperCase() }) }));
  if (!header.channels.length) throw damaged(msg('ccexr.damaged.no_channels'));
  let samples = 0;
  const channels = header.channels.map((c) => {
    const cw = samplesIn(dw.xMin, dw.xMax, c.xSampling);
    const ch = samplesIn(dw.yMin, dw.yMax, c.ySampling);
    samples += cw * ch;
    if (tiled && (c.xSampling !== 1 || c.ySampling !== 1)) throw new ExrError('unsupported', msg('ccexr.unsupported', { what: msg('ccexr.unsupported.tiled_sampling') }));
    return { ...c, width: cw, height: ch, data: null,
      x0: dw.xMin + mod(-dw.xMin, c.xSampling), y0: dw.yMin + mod(-dw.yMin, c.ySampling) };
  });
  if (samples > limits.samples) throw new ExrError('too_big', msg('ccexr.too_big', { what: msg('ccexr.too_big.pixels', { n: Math.round(samples / 1e6) }) }));
  const part = {
    name: header.name ?? null, type, width, height, dataWindow: dw, displayWindow: header.displayWindow,
    compression, lineOrder: header.lineOrder, tiles: null, header, types, channels, missing: 0, index,
  };
  if (tiled) {
    const t = header.tiles;
    if (!t || types.tiles !== 'tiledesc' || t.xSize < 1 || t.ySize < 1 || t.xSize > 2 ** 24 || t.ySize > 2 ** 24 || t.levelMode === 'unknown') throw damaged(msg('ccexr.damaged.required', { name: 'tiles' }));
    part.tiles = t;
    const up = t.roundingMode === 'up';
    const lg = up ? ceilLog2 : floorLog2;
    const tilesIn = (sz, tsz) => Math.ceil(sz / tsz);
    let count = 0;
    if (t.levelMode === 'one') count = tilesIn(width, t.xSize) * tilesIn(height, t.ySize);
    else if (t.levelMode === 'mipmap') {
      const n = lg(Math.max(width, height)) + 1;
      for (let l = 0; l < n; l++) count += tilesIn(levelSize(width, l, up), t.xSize) * tilesIn(levelSize(height, l, up), t.ySize);
    } else {
      const nx = lg(width) + 1;
      const ny = lg(height) + 1;
      for (let ly = 0; ly < ny; ly++) for (let lx = 0; lx < nx; lx++) count += tilesIn(levelSize(width, lx, up), t.xSize) * tilesIn(levelSize(height, ly, up), t.ySize);
    }
    part.chunkCount = count;
    part.tilesX = tilesIn(width, t.xSize);
    part.tilesY = tilesIn(height, t.ySize);
  } else {
    part.linesPerChunk = LINES[compression];
    part.chunkCount = Math.ceil(height / part.linesPerChunk);
  }
  // a multi-part file states its table length; that is what the table holds, whatever our count says
  if (typeof header.chunkCount === 'number' && header.chunkCount >= 0) part.tableLength = header.chunkCount;
  else part.tableLength = part.chunkCount;
  return part;
}

// ---------------------------------------------------------------- blocks

/** Byte layout of one block: rows (image y, or tile row), the channels with a row there and their sample counts. */
function blockRows(part, y0, y1, x0, x1) {
  const rows = [];
  let bytes = 0;
  for (let y = y0; y <= y1; y++) {
    for (let ci = 0; ci < part.channels.length; ci++) {
      const c = part.channels[ci];
      if (mod(y, c.ySampling) !== 0) continue;
      const n = samplesIn(x0, x1, c.xSampling);
      if (!n) continue;
      rows.push({ ci, y, n, at: bytes });
      bytes += n * SIZE[c.type];
    }
  }
  return { rows, bytes };
}

function undoPredictor(src) {
  const n = src.length;
  const t = src;
  for (let i = 1; i < n; i++) t[i] = (t[i - 1] + t[i] - 128) & 255;
  const out = new Uint8Array(n);
  const half = (n + 1) >> 1;
  for (let i = 0, j = 0; i < n; j++) {
    out[i++] = t[j];
    if (i < n) out[i++] = t[half + j];
  }
  return out;
}

function applyPredictor(src) {
  const n = src.length;
  const t = new Uint8Array(n);
  const half = (n + 1) >> 1;
  for (let i = 0, a = 0, b = half; i < n;) {
    t[a++] = src[i++];
    if (i < n) t[b++] = src[i++];
  }
  let p = t[0];
  for (let i = 1; i < n; i++) { const d = (t[i] - p + 384) & 255; p = t[i]; t[i] = d; }
  return t;
}

function rleDecode(src, size) {
  const out = new Uint8Array(size);
  let i = 0;
  let o = 0;
  while (i < src.length) {
    const c = (src[i++] << 24) >> 24;
    if (c < 0) {
      const n = -c;
      if (i + n > src.length || o + n > size) throw new Error('RLE run past the end');
      out.set(src.subarray(i, i + n), o);
      i += n;
      o += n;
    } else {
      const n = c + 1;
      if (i >= src.length || o + n > size) throw new Error('RLE run past the end');
      out.fill(src[i++], o, o + n);
      o += n;
    }
  }
  if (o !== size) throw new Error('RLE unpacks to the wrong size');
  return out;
}

function rleEncode(src) {
  const out = [];
  const n = src.length;
  let runs = 0;
  let rune = 1;
  while (runs < n) {
    let count = 0;
    while (rune < n && src[runs] === src[rune] && count < 127) { rune++; count++; }
    if (count >= 2) {
      out.push(count, src[runs]);
      runs = rune;
    } else {
      count++;
      while (rune < n && ((rune + 1 >= n || src[rune] !== src[rune + 1]) || (rune + 2 >= n || src[rune + 1] !== src[rune + 2])) && count < 127) { count++; rune++; }
      out.push((256 - count) & 255);
      while (runs < rune) out.push(src[runs++]);
    }
    rune++;
  }
  return Uint8Array.from(out);
}

/** packed bytes ↔ PIZ planes: one plane per channel, rows = the block's rows of that channel. */
function planesOf(part, layout) {
  const planes = part.channels.map((c) => ({ c, rows: [], nx: 0, w: SIZE[c.type] / 2 }));
  for (const row of layout.rows) { const p = planes[row.ci]; p.rows.push(row); p.nx = row.n; }
  return planes.map((p) => ({ ...p, ny: p.rows.length, data: new Uint16Array(p.nx * p.rows.length * p.w) }));
}

function pxr24Decode(part, layout, src) {
  // the unpacked stream holds float as 3 bytes, half 2, uint 4, each row split into byte planes
  let size = 0;
  for (const row of layout.rows) size += row.n * (part.channels[row.ci].type === 'float' ? 3 : SIZE[part.channels[row.ci].type]);
  const raw = inflateZlib(src, size);
  const out = new Uint8Array(layout.bytes);
  const dv = new DataView(out.buffer);
  let at = 0;
  for (const row of layout.rows) {
    const t = part.channels[row.ci].type;
    const w = row.n;
    let pixel = 0;
    for (let x = 0; x < w; x++) {
      if (t === 'uint') {
        pixel = (pixel + ((raw[at + x] << 24) | (raw[at + w + x] << 16) | (raw[at + 2 * w + x] << 8) | raw[at + 3 * w + x])) >>> 0;
        dv.setUint32(row.at + x * 4, pixel, true);
      } else if (t === 'half') {
        pixel = (pixel + ((raw[at + x] << 8) | raw[at + w + x])) >>> 0;
        dv.setUint16(row.at + x * 2, pixel & 0xffff, true);
      } else {
        pixel = (pixel + ((raw[at + x] << 24) | (raw[at + w + x] << 16) | (raw[at + 2 * w + x] << 8))) >>> 0;
        dv.setUint32(row.at + x * 4, pixel, true);
      }
    }
    at += w * (t === 'float' ? 3 : SIZE[t]);
  }
  return out;
}

// B44 / B44A (lossy, half channels in 4 × 4 blocks of 14 bytes, or 3 for a flat block; other channels raw)
let B44_LOG = null;
function b44LogTable() {
  if (!B44_LOG) {
    B44_LOG = new Uint16Array(65536);
    for (let x = 0; x < 65536; x++) {
      if ((x & 0x7c00) === 0x7c00 || x > 0x8000) { B44_LOG[x] = 0; continue; }
      B44_LOG[x] = floatToHalf(Math.fround(8 * Math.fround(Math.log(HALF_TO_FLOAT[x]))));
    }
  }
  return B44_LOG;
}

function b44Unpack14(b, i, s) {
  s[0] = (b[i] << 8) | b[i + 1];
  const shift = b[i + 2] >> 2;
  const bias = 0x20 << shift;
  const d = (k) => (k & 0x3f) * (1 << shift) - bias;
  const at = (j) => b[i + j];
  s[4] = (s[0] + d((at(2) << 4) | (at(3) >> 4))) & 0xffff;
  s[8] = (s[4] + d((at(3) << 2) | (at(4) >> 6))) & 0xffff;
  s[12] = (s[8] + d(at(4))) & 0xffff;
  s[1] = (s[0] + d(at(5) >> 2)) & 0xffff;
  s[5] = (s[4] + d((at(5) << 4) | (at(6) >> 4))) & 0xffff;
  s[9] = (s[8] + d((at(6) << 2) | (at(7) >> 6))) & 0xffff;
  s[13] = (s[12] + d(at(7))) & 0xffff;
  s[2] = (s[1] + d(at(8) >> 2)) & 0xffff;
  s[6] = (s[5] + d((at(8) << 4) | (at(9) >> 4))) & 0xffff;
  s[10] = (s[9] + d((at(9) << 2) | (at(10) >> 6))) & 0xffff;
  s[14] = (s[13] + d(at(10))) & 0xffff;
  s[3] = (s[2] + d(at(11) >> 2)) & 0xffff;
  s[7] = (s[6] + d((at(11) << 4) | (at(12) >> 4))) & 0xffff;
  s[11] = (s[10] + d((at(12) << 2) | (at(13) >> 6))) & 0xffff;
  s[15] = (s[14] + d(at(13))) & 0xffff;
  for (let k = 0; k < 16; k++) s[k] = s[k] & 0x8000 ? s[k] & 0x7fff : ~s[k] & 0xffff;
}

function b44Decode(part, layout, src) {
  const planes = planesOf(part, layout);
  const s = new Uint16Array(16);
  let i = 0;
  for (const p of planes) {
    const { nx, ny } = p;
    if (!nx || !ny) continue;
    if (p.c.type !== 'half') {
      const n = nx * ny * 4;
      if (i + n > src.length) throw new Error('B44 data cut short');
      const dv = new DataView(src.buffer, src.byteOffset + i, n);
      for (let k = 0; k < nx * ny * 2; k++) p.data[k] = dv.getUint16(k * 2, true);
      i += n;
      continue;
    }
    for (let y = 0; y < ny; y += 4) {
      for (let x = 0; x < nx; x += 4) {
        if (i + 3 > src.length) throw new Error('B44 data cut short');
        if (src[i + 2] >= (13 << 2)) {
          let v = (src[i] << 8) | src[i + 1];
          v = v & 0x8000 ? v & 0x7fff : ~v & 0xffff;
          s.fill(v);
          i += 3;
        } else {
          if (i + 14 > src.length) throw new Error('B44 data cut short');
          b44Unpack14(src, i, s);
          i += 14;
        }
        if (p.c.pLinear) { const t = b44LogTable(); for (let k = 0; k < 16; k++) s[k] = t[s[k]]; }
        for (let r = 0; r < 4 && y + r < ny; r++) for (let q = 0; q < 4 && x + q < nx; q++) p.data[(y + r) * nx + x + q] = s[r * 4 + q];
      }
    }
  }
  return planes;
}

function planesToPacked(planes, size) {
  const out = new Uint8Array(size);
  const dv = new DataView(out.buffer);
  for (const p of planes) {
    p.rows.forEach((row, r) => {
      const words = p.nx * p.w;
      for (let k = 0; k < words; k++) dv.setUint16(row.at + k * 2, p.data[r * words + k], true);
    });
  }
  return out;
}

function unpackBlock(part, layout, src) {
  const size = layout.bytes;
  if (src.length === size) return src;   // stored raw (it would not have shrunk)
  switch (part.compression) {
    case 'none': throw new Error('wrong size');
    case 'rle': return undoPredictor(rleDecode(src, size));
    case 'zips':
    case 'zip': return undoPredictor(inflateZlib(src, size));
    case 'pxr24': return pxr24Decode(part, layout, src);
    case 'piz': {
      const planes = planesOf(part, layout);
      pizDecode(src, planes);
      return planesToPacked(planes, size);
    }
    case 'b44':
    case 'b44a': return planesToPacked(b44Decode(part, layout, src), size);
    default: throw new Error('not read');
  }
}

function storeBlock(part, layout, bytes, xOff) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (const row of layout.rows) {
    const c = part.channels[row.ci];
    const sy = (row.y - c.y0) / c.ySampling;
    const base = sy * c.width + xOff(c);
    const d = c.data;
    let at = row.at;
    if (c.type === 'half') for (let i = 0; i < row.n; i++, at += 2) d[base + i] = HALF_TO_FLOAT[dv.getUint16(at, true)];
    else if (c.type === 'float') for (let i = 0; i < row.n; i++, at += 4) d[base + i] = dv.getFloat32(at, true);
    else for (let i = 0; i < row.n; i++, at += 4) d[base + i] = dv.getUint32(at, true);
  }
}

// ---------------------------------------------------------------- reading

export function readExr(input, opts = {}) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const limits = { ...LIMITS, ...(opts.limits || {}) };
  if (!isExr(bytes)) throw new ExrError('not_exr', msg('ccexr.not_exr'));
  const r = new Reader(bytes, 4);
  const ver = r.u32(msg('ccexr.damaged.header_end'));
  const version = ver & 0xff;
  if (version !== 2 && version !== 1) throw new ExrError('unsupported', msg('ccexr.unsupported', { what: msg('ccexr.unsupported.version', { version }) }));
  const longNames = !!(ver & 0x400);
  const multipart = !!(ver & 0x1000);
  if ((ver & 0x800) && !multipart) throw new ExrError('unsupported', msg('ccexr.unsupported', { what: msg('ccexr.unsupported.deep') }));
  const notes = [];
  const parts = [];
  if (multipart) {
    for (;;) {
      if (r.pos >= r.end) throw damaged(msg('ccexr.damaged.parts'));
      if (bytes[r.pos] === 0) { r.pos++; break; }
      const { header, types } = readHeader(r, longNames, limits);
      if (!('name' in header) || !('type' in header)) throw damaged(msg('ccexr.damaged.parts'));
      parts.push({ header, types });
      if (parts.length > limits.parts) throw damaged(msg('ccexr.damaged.parts'));
    }
    if (!parts.length) throw damaged(msg('ccexr.damaged.parts'));
  } else parts.push(readHeader(r, longNames, limits));

  // set up every part (a part we can't read in a multi-part file is listed with its reason, not fatal)
  const set = parts.map(({ header, types }, i) => {
    try { return setupPart(header, types, multipart ? 0 : ver, limits, i); } catch (e) {
      if (!multipart) throw e;
      return { index: i, name: header.name ?? null, error: e, chunkCount: typeof header.chunkCount === 'number' ? header.chunkCount : null };
    }
  });
  // offset tables, one after the other
  const tables = [];
  for (const p of set) {
    const n = p.error ? p.chunkCount : p.tableLength;
    if (n === null || n < 0 || n * 8 > r.left()) {
      if (n === null) throw damaged(msg('ccexr.damaged.parts'));
      throw damaged(msg('ccexr.damaged.offsets'));
    }
    const t = new Array(n);
    for (let i = 0; i < n; i++) t[i] = r.u64(msg('ccexr.damaged.offsets'));
    tables.push(t);
  }
  const chunksStart = r.pos;
  const pick = opts.part ?? 0;
  const want = (i) => opts.allParts !== false || i === pick;

  // locate chunks: by the tables; when a table has impossible entries, by walking the chunks from the start
  const located = set.map(() => new Map());   // key → offset of the chunk's own header (after the part number)
  let bad = false;
  set.forEach((p, i) => {
    for (const off of tables[i]) {
      if (!(off >= chunksStart && off < bytes.length)) { bad = true; continue; }
      const k = chunkKeyAt(bytes, off, p, multipart, i);
      if (k === null) { bad = true; continue; }
      located[i].set(k.key, k.at);
    }
  });
  if (bad) {
    let pos = chunksStart;
    let found = 0;
    while (pos + 8 <= bytes.length) {
      const pi = multipart ? readI32(bytes, pos) : 0;
      const p = set[pi];
      if (!p || p.error) break;
      const k = chunkKeyAt(bytes, pos, p, multipart, pi);
      if (k === null) break;
      if (!located[pi].has(k.key)) { located[pi].set(k.key, k.at); found++; }
      pos = k.next;
    }
    if (found) notes.push(msg('ccexr.note.rebuilt_offsets'));
  }

  const out = set.map((p, i) => {
    if (p.error) return { index: i, name: p.name, error: p.error.message, code: p.error.code };
    if (!want(i)) return publicPart(p);
    for (const c of p.channels) c.data = c.type === 'uint' ? new Uint32Array(c.width * c.height) : new Float32Array(c.width * c.height);
    const dw = p.dataWindow;
    let missing = 0;
    if (p.tiles) {
      if (p.tiles.levelMode !== 'one') notes.push(msg('ccexr.note.levels', { kind: p.tiles.levelMode }));
      for (let ty = 0; ty < p.tilesY; ty++) {
        for (let tx = 0; tx < p.tilesX; tx++) {
          const at = located[i].get(tx + ',' + ty + ',0,0');
          const x0 = dw.xMin + tx * p.tiles.xSize;
          const y0 = dw.yMin + ty * p.tiles.ySize;
          const x1 = Math.min(dw.xMax, x0 + p.tiles.xSize - 1);
          const y1 = Math.min(dw.yMax, y0 + p.tiles.ySize - 1);
          if (at === undefined) { missing++; continue; }
          try {
            const size = readI32(bytes, at + 16);
            const layout = blockRows(p, y0, y1, x0, x1);
            if (layout.bytes > limits.chunkBytes) throw new Error('block too large');
            const data = unpackBlock(p, layout, bytes.subarray(at + 20, at + 20 + size));
            storeBlock(p, layout, data, () => x0 - dw.xMin);
          } catch (e) { missing++; if (opts.strict) throw damaged(msg('ccexr.damaged.chunk', { why: e.message })); }
        }
      }
    } else {
      for (let ci = 0; ci < p.chunkCount; ci++) {
        const y0 = dw.yMin + ci * p.linesPerChunk;
        const y1 = Math.min(dw.yMax, y0 + p.linesPerChunk - 1);
        const at = located[i].get(String(y0));
        if (at === undefined) { missing++; continue; }
        try {
          const size = readI32(bytes, at + 4);
          const layout = blockRows(p, y0, y1, dw.xMin, dw.xMax);
          if (layout.bytes > limits.chunkBytes) throw new Error('block too large');
          const data = unpackBlock(p, layout, bytes.subarray(at + 8, at + 8 + size));
          storeBlock(p, layout, data, () => 0);
        } catch (e) { missing++; if (opts.strict) throw damaged(msg('ccexr.damaged.chunk', { why: e.message })); }
      }
    }
    p.missing = missing;
    if (missing) notes.push(msg('ccexr.note.missing_chunks', { n: missing }));
    return publicPart(p);
  });
  const main = out[pick] && !out[pick].error ? out[pick] : out.find((p) => !p.error);
  if (!main) throw new ExrError(out[0].code || 'unsupported', out[0].error);
  return { format: 'exr', version, multipart, ...main, parts: out, notes, incomplete: out.some((p) => p.missing) };
}

function publicPart(p) {
  return {
    index: p.index, name: p.name, type: p.type, width: p.width, height: p.height, dataWindow: p.dataWindow,
    displayWindow: p.displayWindow, compression: p.compression, lineOrder: p.lineOrder, tiles: p.tiles, header: p.header,
    types: p.types, missing: p.missing,
    channels: p.channels.map(({ name, type, xSampling, ySampling, pLinear, width, height, data }) => ({ name, type, xSampling, ySampling, pLinear, width, height, data })),
  };
}

function readI32(b, at) {
  if (at + 4 > b.length) throw new Error('cut short');
  return (b[at] | (b[at + 1] << 8) | (b[at + 2] << 16) | (b[at + 3] << 24));
}

/** The chunk at `off`: its key and where its own header starts, or null when it does not fit the part. */
function chunkKeyAt(b, off, p, multipart, pi) {
  let at = off;
  try {
    if (multipart) { if (readI32(b, at) !== pi) return null; at += 4; }
    if (p.tiles) {
      const tx = readI32(b, at); const ty = readI32(b, at + 4); const lx = readI32(b, at + 8); const ly = readI32(b, at + 12);
      const size = readI32(b, at + 16);
      if (tx < 0 || ty < 0 || lx < 0 || ly < 0 || size < 0 || at + 20 + size > b.length) return null;
      return { key: tx + ',' + ty + ',' + lx + ',' + ly, at, next: at + 20 + size };
    }
    const y = readI32(b, at);
    const size = readI32(b, at + 4);
    const dw = p.dataWindow;
    if (y < dw.yMin || y > dw.yMax || (y - dw.yMin) % p.linesPerChunk || size < 0 || at + 8 + size > b.length) return null;
    return { key: String(y), at, next: at + 8 + size };
  } catch { return null; }
}

// ---------------------------------------------------------------- layers and RGBA

export function layersOf(part) {
  const map = new Map();
  for (const c of part.channels) {
    const dot = c.name.lastIndexOf('.');
    const layer = dot < 0 ? '' : c.name.slice(0, dot);
    const key = dot < 0 ? c.name : c.name.slice(dot + 1);
    if (!map.has(layer)) map.set(layer, { name: layer, channels: {} });
    map.get(layer).channels[key] = c;
  }
  return [...map.values()];
}

export function rgbaOf(part, { layer = null } = {}) {
  const layers = layersOf(part);
  const L = layer !== null ? layers.find((l) => l.name === layer)
    : layers.find((l) => l.name === '' && (l.channels.R || l.channels.Y)) || layers.find((l) => l.channels.R || l.channels.Y) || layers[0];
  if (!L) return null;
  const { width, height } = part;
  const out = new Float32Array(width * height * 4);
  const ch = L.channels;
  const get = (c) => {
    if (!c) return null;
    if (c.width === width && c.height === height) return (i) => c.data[i];
    return (i) => {   // subsampled: nearest sample
      const x = i % width;
      const y = (i / width) | 0;
      return c.data[Math.min(c.height - 1, Math.floor(y / c.ySampling)) * c.width + Math.min(c.width - 1, Math.floor(x / c.xSampling))];
    };
  };
  const R = get(ch.R || ch.r || ch.Y);
  const G = get(ch.G || ch.g || ch.Y) || R;
  const B = get(ch.B || ch.b || ch.Y) || R;
  const A = get(ch.A || ch.a);
  for (let i = 0, o = 0; i < width * height; i++, o += 4) {
    out[o] = R ? R(i) : 0;
    out[o + 1] = G ? G(i) : 0;
    out[o + 2] = B ? B(i) : 0;
    out[o + 3] = A ? A(i) : 1;
  }
  return { width, height, data: out, layer: L.name };
}

// ---------------------------------------------------------------- writing

function bad(why) { return new ExrError('bad_image', msg('ccexr.write.bad_image', { why })); }

function writeAttr(w, name, type, value) {
  const v = new Writer(64);
  switch (type) {
    case 'box2i': for (const k of ['xMin', 'yMin', 'xMax', 'yMax']) v.i32(value[k]); break;
    case 'box2f': for (const k of ['xMin', 'yMin', 'xMax', 'yMax']) v.f32(value[k]); break;
    case 'chlist':
      for (const c of value) { v.cstr(c.name); v.i32(PIXEL.indexOf(c.type)); v.u8(c.pLinear ? 1 : 0); v.u8(0); v.u8(0); v.u8(0); v.i32(1); v.i32(1); }
      v.u8(0);
      break;
    case 'chromaticities': for (const k of ['red', 'green', 'blue', 'white']) { v.f32(value[k][0]); v.f32(value[k][1]); } break;
    case 'compression': v.u8(COMPRESSIONS.indexOf(value)); break;
    case 'double': v.f64(value); break;
    case 'envmap': v.u8(value === 'cube' ? 1 : 0); break;
    case 'float': v.f32(value); break;
    case 'int': v.i32(value); break;
    case 'lineOrder': v.u8(LINE_ORDERS.indexOf(value)); break;
    case 'm33f': case 'm44f': case 'floatvector': case 'v2f': case 'v3f': for (const x of value) v.f32(x); break;
    case 'v2i': case 'v3i': for (const x of value) v.i32(x); break;
    case 'v2d': case 'v3d': for (const x of value) v.f64(x); break;
    case 'rational': v.i32(value[0]); v.u32(value[1]); break;
    case 'string': v.bytes(utf8Bytes(value)); break;
    case 'stringvector': for (const s of value) { const b = utf8Bytes(s); v.i32(b.length); v.bytes(b); } break;
    case 'tiledesc': v.u32(value.xSize); v.u32(value.ySize); v.u8(0); break;
    case 'timecode': v.u32(value[0]); v.u32(value[1]); break;
    default: throw bad('attribute type ' + type);
  }
  const data = v.done();
  w.cstr(name);
  w.cstr(type);
  w.i32(data.length);
  w.bytes(data);
}

export function writeExr(img) {
  const width = img.width | 0;
  const height = img.height | 0;
  if (!(width >= 1 && height >= 1) || width !== img.width || height !== img.height) throw bad('size ' + img.width + ' × ' + img.height);
  const compression = img.compression ?? 'zip';
  if (!WRITES.has(compression)) throw bad('compression ' + compression);
  const lineOrder = img.lineOrder ?? 'increasing';
  if (lineOrder !== 'increasing' && lineOrder !== 'decreasing') throw bad('line order ' + lineOrder);
  const chans = (img.channels || []).map((c) => ({ name: String(c.name), type: c.type ?? 'half', data: c.data, pLinear: !!c.pLinear }));
  if (!chans.length) throw bad('no channels');
  const seen = new Set();
  for (const c of chans) {
    if (!c.name || utf8Bytes(c.name).length > 255 || c.name.includes('\0')) throw bad('channel name "' + c.name + '"');
    if (seen.has(c.name)) throw bad('channel "' + c.name + '" twice');
    seen.add(c.name);
    if (!SIZE[c.type]) throw bad('channel type ' + c.type);
    if (!c.data || c.data.length !== width * height) throw bad('channel "' + c.name + '" has ' + (c.data ? c.data.length : 0) + ' samples');
  }
  // the channel list is sorted by name, byte for byte
  const key = (s) => Array.from(utf8Bytes(s));
  chans.sort((a, b) => { const x = key(a.name); const y = key(b.name); for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] - y[i]; return x.length - y.length; });
  const ox = img.origin?.x ?? 0;
  const oy = img.origin?.y ?? 0;
  const dw = { xMin: ox, yMin: oy, xMax: ox + width - 1, yMax: oy + height - 1 };
  const tiles = img.tiles ? { xSize: img.tiles.xSize | 0, ySize: img.tiles.ySize | 0 } : null;
  if (tiles && !(tiles.xSize >= 1 && tiles.ySize >= 1)) throw bad('tile size');
  const longNames = chans.some((c) => utf8Bytes(c.name).length > 31) || Object.keys(img.attributes || {}).some((k) => utf8Bytes(k).length > 31);

  const w = new Writer(1 << 20);
  w.u32(MAGIC);
  w.u32(2 | (tiles ? 0x200 : 0) | (longNames ? 0x400 : 0));
  writeAttr(w, 'channels', 'chlist', chans);
  writeAttr(w, 'compression', 'compression', compression);
  writeAttr(w, 'dataWindow', 'box2i', dw);
  writeAttr(w, 'displayWindow', 'box2i', img.displayWindow ?? dw);
  writeAttr(w, 'lineOrder', 'lineOrder', lineOrder);
  writeAttr(w, 'pixelAspectRatio', 'float', 1);
  writeAttr(w, 'screenWindowCenter', 'v2f', [0, 0]);
  writeAttr(w, 'screenWindowWidth', 'float', 1);
  if (tiles) writeAttr(w, 'tiles', 'tiledesc', tiles);
  const fixed = new Set(['channels', 'compression', 'dataWindow', 'displayWindow', 'lineOrder', 'pixelAspectRatio', 'screenWindowCenter', 'screenWindowWidth', 'tiles']);
  for (const [name, a] of Object.entries(img.attributes || {})) {
    if (fixed.has(name)) continue;
    writeAttr(w, name, a.type, a.value);
  }
  w.u8(0);

  const part = { channels: chans.map((c) => ({ ...c, xSampling: 1, ySampling: 1 })), compression };
  const blocks = [];   // [{ head: [ints], y0, y1, x0, x1 }]
  if (tiles) {
    const tX = Math.ceil(width / tiles.xSize);
    const tY = Math.ceil(height / tiles.ySize);
    for (let ty = 0; ty < tY; ty++) for (let tx = 0; tx < tX; tx++) {
      blocks.push({ head: [tx, ty, 0, 0], x0: tx * tiles.xSize, x1: Math.min(width - 1, (tx + 1) * tiles.xSize - 1),
        y0: ty * tiles.ySize, y1: Math.min(height - 1, (ty + 1) * tiles.ySize - 1) });
    }
  } else {
    const lpc = LINES[compression];
    for (let y = 0; y < height; y += lpc) blocks.push({ head: [oy + y], x0: 0, x1: width - 1, y0: y, y1: Math.min(height - 1, y + lpc - 1) });
  }
  const tableAt = w.pos;
  for (let i = 0; i < blocks.length; i++) w.u64(0);
  const offsets = [];
  const order = lineOrder === 'decreasing' && !tiles ? blocks.map((_, i) => blocks.length - 1 - i) : blocks.map((_, i) => i);
  const offs = new Array(blocks.length);
  for (const bi of order) {
    const b = blocks[bi];
    const layout = blockRows(part, b.y0, b.y1, b.x0, b.x1);
    const raw = new Uint8Array(layout.bytes);
    const dv = new DataView(raw.buffer);
    for (const row of layout.rows) {
      const c = part.channels[row.ci];
      const src = c.data;
      let at = row.at;
      const base = row.y * width + b.x0;
      if (c.type === 'half') for (let i = 0; i < row.n; i++, at += 2) dv.setUint16(at, floatToHalf(src[base + i]), true);
      else if (c.type === 'float') for (let i = 0; i < row.n; i++, at += 4) dv.setFloat32(at, src[base + i], true);
      else for (let i = 0; i < row.n; i++, at += 4) dv.setUint32(at, src[base + i] >>> 0, true);
    }
    let data = raw;
    if (compression === 'rle') data = rleEncode(applyPredictor(raw));
    else if (compression === 'zip' || compression === 'zips') data = deflateZlib(applyPredictor(raw));
    else if (compression === 'piz') {
      const planes = planesOf(part, layout);
      for (const p of planes) {
        p.rows.forEach((row, r) => {
          const words = p.nx * p.w;
          for (let k = 0; k < words; k++) p.data[r * words + k] = dv.getUint16(row.at + k * 2, true);
        });
      }
      data = pizEncode(planes) || raw;
    }
    if (data.length >= raw.length) data = raw;
    offs[bi] = w.pos;
    for (const v of b.head) w.i32(v);
    w.i32(data.length);
    w.bytes(data);
  }
  for (let i = 0; i < blocks.length; i++) offsets.push(offs[i]);
  const end = w.pos;
  w.pos = tableAt;
  for (const o of offsets) w.u64(o);
  w.pos = end;
  return w.done();
}
