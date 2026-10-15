#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — cc-dwg unit tests (docs/DWG-LIB-SPEC.md "Done means" 4). Imports whatever lib/dwg exposes
 * and skips — with the reason — what is not built yet.
 *
 *   node tools/dwg-test/test.mjs [--verbose] [--only bits,crc,lz,r2007,rs,header,read]
 *
 *   bits    bit codes against the worked examples of the ODA spec v5.4.1 ch. 2 (BS, BL, BD, 3B, MC, MS,
 *           handle 5.2.05E7, the BS-in-an-object example of 2.14.1), reader and writer, + random round trips
 *   crc     CRC-8 and CRC-32 against the spec's own tables and functions (parsed from ods-5.4.1.txt),
 *           the CRC-32 check value, and reader-vs-writer agreement on every checksum both sides implement
 *   lz      R2004 LZ (ch. 4.7): writer compress → reader decompress, many shapes and sizes
 *   r2007   R2007 compression (ch. 5.10): writer compress → reader decompress
 *   rs      Reed–Solomon (ch. 5.13): real R2007 file headers from the corpus decode with zero syndromes;
 *           1–8 injected byte errors per codeword are corrected; writer encode → reader decode when exported
 *   header  header-vars table per version (ch. 9) + readDwg header vs the ODA truth on the quick corpus
 *   read    readDwg never crashes: a 10-byte fake DWG and an unsupported version give a clean result or error
 */
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO, CORPUS, TRUTH, readJson, flag, arg, list } from './lib/util.mjs';

const LIB = path.join(REPO, 'lib/dwg');
const SPEC = '/var/www/CADCRAFT/refs/dwg-spec/ods-5.4.1.txt';
const VERBOSE = flag('--verbose');
const ONLY = list(arg('--only'));
let pass = 0, fail = 0, skip = 0;
const skipped = [];
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } return !!c; };
const skipT = (m) => { skip++; skipped.push(m); console.log('  skip ' + m); };
const section = (k, s) => { if (ONLY && !ONLY.includes(k)) return false; console.log('\n== ' + s); return true; };
async function tryImport(f) {
  const p = path.join(LIB, f);
  if (!fs.existsSync(p)) return { mod: null, why: `lib/dwg/${f} not there yet` };
  try { return { mod: await import(pathToFileURL(p).href) }; } catch (e) { return { mod: null, why: `lib/dwg/${f} does not load: ${String(e.message || e).split('\n')[0]}` }; }
}
const fnOf = (m, ...names) => { for (const n of names) if (m && typeof m[n] === 'function') return m[n]; return null; };
const bitsToBytes = (s) => { const b = new Uint8Array(Math.ceil(s.length / 8)); for (let i = 0; i < s.length; i++) if (s[i] === '1') b[i >> 3] |= 0x80 >> (i & 7); return b; };
const bitStr = (bytes, n) => { let s = ''; for (let i = 0; i < n; i++) s += (bytes[i >> 3] >> (7 - (i & 7))) & 1; return s; };
let seed = 12345;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const rbytes = (n, alpha = 256) => { const b = new Uint8Array(n); for (let i = 0; i < n; i++) b[i] = Math.floor(rnd() * alpha); return b; };
const eq = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
const hex = (n) => '0x' + (n >>> 0).toString(16).toUpperCase();

const R = {}, W = {}, why = {};
for (const [k, f] of [['bits', 'bits-read.js'], ['crc', 'crc.js'], ['lz', 'lz-r2004.js'], ['r2007', 'r2007.js'], ['hv', 'header-vars.js'], ['index', 'index.js'], ['read', 'read.js']]) { const r = await tryImport(f); R[k] = r.mod; why['R.' + k] = r.why; }
for (const [k, f] of [['bits', 'bits-write.js'], ['lz', 'lz-r2004-write.js'], ['r2007', 'r2007-write.js'], ['cont', 'container-write.js']]) { const r = await tryImport(f); W[k] = r.mod; why['W.' + k] = r.why; }

// ------------------------------------------------------------------------------------------------ bits
if (section('bits', 'bit codes (spec ch. 2 worked examples)')) {
  const BR = R.bits?.BitReader;
  if (!BR) skipT('reader bit codes: ' + (why['R.bits'] || 'bits-read.js exports no BitReader'));
  else {
    const rd = (bits, o = {}) => new BR(bitsToBytes(bits), { version: 15, ...o });
    let r = rd('0000000001000000011011010000111110');
    ok(JSON.stringify([r.BS(), r.BS(), r.BS(), r.BS(), r.BS()]) === '[257,0,256,15,0]', 'reader BITSHORT: 257, 0, 256, 15, 0 (2.2)');
    r = rd('000000000100000001000000000000000010010000111110');
    ok(JSON.stringify([r.BL(), r.BL(), r.BL(), r.BL()]) === '[257,0,15,0]', 'reader BITLONG: 257, 0, 15, 0 (2.3)');
    r = rd('0110' + '00' + bitStr(new Uint8Array(new Float64Array([2.5]).buffer), 64));
    ok(r.BD() === 1 && r.BD() === 0 && r.BD() === 2.5, 'reader BITDOUBLE: 01 → 1.0, 10 → 0.0, 00 + IEEE double (2.5)');
    r = rd('0' + '10' + '110' + '111');
    ok(JSON.stringify([r.B3(), r.B3(), r.B3(), r.B3()]) === '[0,2,6,7]', 'reader 3B: 0, 10, 110, 111 → 0, 2, 6, 7 (2.1)');
    r = rd('010100100000010111100111');
    const h = r.H(0);
    ok(Number(h) === 0x5E7 && (r.hcode === undefined || r.hcode === 5), `reader handle reference 0101.0010.00000101.11100111 → 5E7 code 5 (2.13) [got ${h}, code ${r.hcode}]`);
    r = rd('01000000' + '11100000');
    ok(r.BS() === 3, 'reader: the 2.14.1 object "01 00000011 100000" holds bitshort 3');
    const { readMC, readMS, mod } = R.bits;
    if (readMC && mod) {
      const mc = (arr) => { const v = readMC(new Uint8Array(arr), 0); return [v, mod.pos]; };
      ok(JSON.stringify(mc([0x82, 0x24])) === '[4610,2]', 'reader MODULAR CHAR 10000010 00100100 → 4610 (2.6)');
      ok(JSON.stringify(mc([233, 151, 230, 53])) === '[112823273,4]', 'reader MODULAR CHAR 4 bytes → 112823273 (2.6)');
      ok(JSON.stringify(mc([0x85, 0x4B])) === '[-1413,2]', 'reader MODULAR CHAR 10000101 01001011 → −1413 (2.6)');
    } else skipT('reader modular chars: bits-read.js exports no readMC/mod');
    if (readMS && mod) ok(readMS(new Uint8Array([49, 244, 141, 0]), 0) === 4650033, 'reader MODULAR SHORT 00110001 11110100 10001101 00000000 → 4650033 (2.7)');
    else skipT('reader modular shorts: bits-read.js exports no readMS');
  }
  const BW = W.bits?.BitWriter;
  if (!BW) skipT('writer bit codes: ' + (why['W.bits'] || 'bits-write.js exports no BitWriter'));
  else {
    const out = (w) => bitStr(w.buf || w.bytes(), w.bit ?? w.pos);
    let w = new BW('AC1015'); for (const v of [257, 0, 256, 15, 0]) w.BS(v);
    ok(out(w) === '0000000001000000011011010000111110', 'writer BITSHORT: 257, 0, 256, 15, 0 (2.2)');
    w = new BW('AC1015'); for (const v of [257, 0, 15, 0]) w.BL(v);
    ok(out(w) === '000000000100000001000000000000000010010000111110', 'writer BITLONG: 257, 0, 15, 0 (2.3)');
    w = new BW('AC1015'); w.BD(1); w.BD(0); w.BD(2.5);
    ok(out(w).startsWith('0110' + '00') && (w.bit ?? 0) === 4 + 66, 'writer BITDOUBLE: 1 → 01, 0 → 10, else 00 + 8 bytes (2.5)');
    w = new BW('AC1015'); w.H(5, 0x5E7);
    ok(out(w) === '010100100000010111100111', 'writer handle reference 5.2.05E7 (2.13)');
    w = new BW('AC1015'); for (const v of [0, 2, 6, 7]) w.B3(v);
    ok(out(w) === '0' + '10' + '110' + '111', 'writer 3B (2.1)');
    const mcB = W.bits.mcBytes;
    if (mcB) ok(JSON.stringify([...mcB(4610)]) === '[130,36]' && JSON.stringify([...mcB(112823273)]) === '[233,151,230,53]' && JSON.stringify([...mcB(-1413)]) === '[133,75]', 'writer modular chars 4610, 112823273, −1413 (2.6)');
    else skipT('writer modular chars: bits-write.js exports no mcBytes');
    if (W.bits.ByteWriter) { const b = new W.bits.ByteWriter(); b.MS(4650033); ok(JSON.stringify([...b.bytes()]) === '[49,244,141,0]', 'writer modular short 4650033 (2.7)'); }
    if (R.bits?.BitReader) {
      // random round trips writer → reader
      const BRr = R.bits.BitReader;
      let bad = [];
      for (let it = 0; it < 300; it++) {
        const w2 = new BW('AC1015'); const vals = [];
        for (let k = 0; k < 20; k++) {
          const kind = Math.floor(rnd() * 8);
          const v = kind === 0 ? Math.floor(rnd() * 65536) - 32768 : kind === 1 ? Math.floor(rnd() * 2 ** 32) - 2 ** 31 : kind === 2 ? (rnd() < 0.3 ? [0, 1][Math.floor(rnd() * 2)] : (rnd() - 0.5) * 1e7) : kind === 3 ? Math.floor(rnd() * 256) : kind === 4 ? Math.floor(rnd() * 2 ** 31) : kind === 5 ? (rnd() - 0.5) * 1e12 : kind === 6 ? [0, 2, 6, 7][Math.floor(rnd() * 4)] : Math.floor(rnd() * 0xFFFFFF);
          vals.push([kind, v]);
          if (kind === 0) w2.BS(v); else if (kind === 1) w2.BL(v); else if (kind === 2) w2.BD(v); else if (kind === 3) w2.RC(v); else if (kind === 4) w2.RL(v); else if (kind === 5) w2.RD(v); else if (kind === 6) w2.B3(v); else w2.H(5, v);
        }
        const r2 = new BRr(w2.bytes(), { version: 15 });
        for (const [kind, v] of vals) {
          const g = kind === 0 ? r2.BS() : kind === 1 ? r2.BL() : kind === 2 ? r2.BD() : kind === 3 ? r2.RC() : kind === 4 ? r2.RL() : kind === 5 ? r2.RD() : kind === 6 ? r2.B3() : Number(r2.H(0));
          const want = kind === 1 && v < 0 ? v : kind === 4 ? v >>> 0 : v;
          if (g !== want && !(kind === 1 && (g | 0) === (v | 0))) { bad.push(`${['BS', 'BL', 'BD', 'RC', 'RL', 'RD', '3B', 'H'][kind]} ${v} → ${g}`); break; }
        }
        if (bad.length) break;
      }
      ok(!bad.length, 'random round trip writer → reader: 300 × 20 mixed BS BL BD RC RL RD 3B H' + (bad.length ? ': ' + bad[0] : ''));
      // text
      const w3 = new BW('AC1015'); w3.TV('Ab°'); const r3 = new BRr(w3.bytes(), { version: 15, decode: (u) => new TextDecoder('windows-1252').decode(u) });
      const tv = r3.TV();
      ok(tv === 'Ab°' || tv === 'Ab°\0', `TV round trip R2000 (code page text) [got ${JSON.stringify(tv)}]`);
    }
  }
}

// ------------------------------------------------------------------------------------------------ crc
function specTable(name, count) {
  const t = fs.readFileSync(SPEC, 'utf8');
  const i = t.indexOf(name);
  if (i < 0) return null;
  const vals = [];
  const re = /0x([0-9a-fA-F]+)/g; re.lastIndex = i;
  let m;
  while (vals.length < count && (m = re.exec(t))) vals.push(parseInt(m[1], 16) >>> 0);
  return vals.length === count ? vals : null;
}
if (section('crc', 'CRCs (spec 2.14)')) {
  const T8 = specTable('int crctable[256]', 256), T32 = specTable('OdUInt32 crc32Table[]', 256);
  ok(T8 && T8[1] === 0xC0C1 && T8[255] === 0x4040, 'parsed the 8-bit CRC table from the spec text');
  ok(T32 && T32[1] === 0x77073096 && T32[255] === 0x2D02EF8D, 'parsed the 32-bit CRC table from the spec text');
  const specCrc8 = (dx, p) => { for (const b of p) { const al = (b ^ (dx & 0xFF)) & 0xFF; dx = ((dx >> 8) & 0xFF) ^ T8[al]; } return dx; };
  const specCrc32 = (p, seedV) => { let c = ~seedV >>> 0; for (const b of p) c = ((c >>> 8) ^ T32[(c ^ b) & 0xFF]) >>> 0; return ~c >>> 0; };
  ok(specCrc32(new TextEncoder().encode('123456789'), 0) === 0xCBF43926, 'the spec CRC-32 gives the standard check value 0xCBF43926 for "123456789"');
  const crc = R.crc;
  if (!crc) skipT('reader CRCs: ' + why['R.crc']);
  else {
    const c8 = fnOf(crc, 'crc8');
    if (c8) {
      let good = true;
      for (let i = 0; i < 50 && good; i++) { const d = rbytes(1 + Math.floor(rnd() * 300)); const s = Math.floor(rnd() * 65536); if (c8(s, d) !== specCrc8(s, d)) good = false; }
      ok(good && c8(0, new Uint8Array([1])) === 0xC0C1, 'crc.js crc8 = the spec function (50 random buffers and seeds)');
      if (crc.CRC8_TABLE) ok(eq([...crc.CRC8_TABLE], T8), 'crc.js CRC8_TABLE = the spec table');
    } else skipT('crc.js has no crc8');
    const c32 = fnOf(crc, 'crc32');
    if (c32) {
      let good = true, first = '';
      for (let i = 0; i < 50 && good; i++) { const d = rbytes(1 + Math.floor(rnd() * 300)); const s = i < 10 ? 0 : Math.floor(rnd() * 2 ** 32) >>> 0; const a = c32(d, s) >>> 0, b = specCrc32(d, s); if (a !== b) { good = false; first = `${hex(a)} vs ${hex(b)} seed ${hex(s)}`; } }
      ok(good, 'crc.js crc32(bytes, seed) = the spec function (50 random buffers and seeds)' + (first ? ': ' + first : ''));
    } else skipT('crc.js has no crc32');
  }
  // reader vs writer: the same checksum implemented twice must agree
  const pairs = [
    ['CRC-8 (crc.js crc8 vs container-write crc16)', fnOf(crc, 'crc8'), fnOf(W.cont, 'crc16'), (f, d, s) => f(s & 0xFFFF, d)],
    ['CRC-32 (crc.js vs container-write)', fnOf(crc, 'crc32'), fnOf(W.cont, 'crc32'), (f, d, s) => f(d, s) >>> 0],
    ['R2004 page checksum (crc.js vs container-write)', fnOf(crc, 'pageChecksum'), fnOf(W.cont, 'pageChecksum'), (f, d, s) => f(s, d, 0, d.length) >>> 0],
    ['R2007 page checksum (crc.js vs r2007-write)', fnOf(crc, 'r2007PageChecksum'), fnOf(W.r2007, 'pageChecksum21'),
      (f, d, s) => { let x; try { x = f(s, d, 0, d.length); } catch { x = f(BigInt(s), d, 0, d.length); } return BigInt.asUintN(32, BigInt(x)).toString(16); }],   // one side takes a BigInt seed
    ['CRC-64 normal (crc.js vs r2007-write)', fnOf(crc, 'crc64Normal'), fnOf(W.r2007, 'crc64Normal'), (f, d, s) => BigInt.asUintN(64, BigInt(f(d, BigInt(s)))).toString(16)],
    ['CRC-64 mirrored (crc.js vs r2007-write)', fnOf(crc, 'crc64Mirrored'), fnOf(W.r2007, 'crc64Mirrored'), (f, d, s) => BigInt.asUintN(64, BigInt(f(d, BigInt(s)))).toString(16)],
  ];
  for (const [name, a, b, call] of pairs) {
    if (!a || !b) { skipT(`${name}: ${!a ? 'reader side' : 'writer side'} not exported`); continue; }
    let good = true, msg = '';
    for (let i = 0; i < 40 && good; i++) {
      const d = rbytes(1 + Math.floor(rnd() * 600)); const s = Math.floor(rnd() * 2 ** 31);
      try {
        const x = call ? call(a, d, s) : a(s, d, 0, d.length) >>> 0;
        const y = call ? call(b, d, s) : b(s, d, 0, d.length) >>> 0;
        if (String(x) !== String(y)) { good = false; msg = `${x} vs ${y}`; }
      } catch (e) { good = false; msg = 'threw ' + e.message; }
    }
    ok(good, `${name} agree on 40 random buffers` + (msg ? ': ' + msg : ''));
  }
}

// ------------------------------------------------------------------------------------------------ lz
function shapes() {
  const text = new TextEncoder().encode('AcDb:Header AcDb:Classes AcDb:Handles AcDb:Header '.repeat(400));
  const runs = new Uint8Array(30000); for (let i = 0; i < runs.length; i++) runs[i] = (i >> 7) & 3;
  const mixed = new Uint8Array(70000); for (let i = 0; i < mixed.length; i++) mixed[i] = i % 1000 < 500 ? Math.floor(rnd() * 256) : mixed[i - 500];
  const far = new Uint8Array(0x10000 + 600); far.set(rbytes(300), 0); far.set(far.subarray(0, 300), 0x8000); far.set(far.subarray(0, 300), 0x10000);
  return [['empty', new Uint8Array(0)], ['1 byte', new Uint8Array([7])], ['3 bytes', new Uint8Array([1, 2, 3])], ['18 literals', rbytes(18)], ['19 literals', rbytes(19)], ['zeros 0x7400', new Uint8Array(0x7400)],
    ['random 5000', rbytes(5000)], ['text', text], ['runs', runs], ['mixed 70000', mixed], ['far matches', far], ['small alphabet 40000', rbytes(40000, 3)]];
}
if (section('lz', 'R2004 compression (spec 4.7): writer → reader')) {
  const comp = fnOf(W.lz, 'compressR2004'), dec = fnOf(R.lz, 'decompressR2004');
  if (!comp || !dec) skipT('R2004 LZ round trip: ' + (!comp ? why['W.lz'] || 'no compressR2004' : why['R.lz'] || 'no decompressR2004'));
  else for (const lit of [false, true]) for (const [name, src] of shapes()) {
    let msg = '';
    try {
      const c = comp(src, { literalOnly: lit });
      const d = dec(c, 0, c.length, src.length);
      if (!eq(d, src)) { const i = d.findIndex((v, k) => v !== src[k]); msg = `differs at byte ${i} of ${src.length}`; }
      else if (VERBOSE) msg = '';
      ok(!msg, `${name}${lit ? ' (literal only)' : ''}: ${src.length} → ${c.length} bytes → back` + (msg ? ': ' + msg : ''));
    } catch (e) { ok(false, `${name}${lit ? ' (literal only)' : ''}: threw ${e.message}`); }
  }
}

// ------------------------------------------------------------------------------------------------ r2007 LZ
if (section('r2007', 'R2007 compression (spec 5.10): writer → reader')) {
  const comp = fnOf(W.r2007, 'compressR2007'), dec = fnOf(R.r2007, 'decompressR21', 'decompressR2007');
  if (!comp || !dec) skipT('R2007 compression round trip: ' + (!comp ? why['W.r2007'] || 'no compressR2007' : why['R.r2007'] || 'no decompressR21'));
  else for (const [name, src] of shapes()) {
    try {
      const c = comp(src);
      const d = dec(c, 0, c.length, src.length);
      const good = eq(d, src);
      ok(good, `${name}: ${src.length} → ${c.length} bytes → back` + (good ? '' : `: differs at byte ${d.findIndex((v, k) => v !== src[k])}`));
    } catch (e) { ok(false, `${name}: threw ${e.message}`); }
  }
}

// ------------------------------------------------------------------------------------------------ RS
if (section('rs', 'Reed–Solomon (255,239) (spec 5.13)')) {
  const zero = fnOf(R.r2007, 'rsSyndromesZero'), decode = fnOf(R.r2007, 'rsDecodeBlock');
  if (!zero || !decode) skipT('Reed–Solomon decode: ' + (why['R.r2007'] || 'r2007.js exports no rsSyndromesZero / rsDecodeBlock'));
  else {
    // real data: the R2007 file header at 0x80 is 3 interleaved (255,239) codewords (spec 5.2: 0x3D8 bytes, factor 3)
    const files = fs.existsSync(path.join(CORPUS, 'AC1021')) ? fs.readdirSync(path.join(CORPUS, 'AC1021')).filter((f) => f.endsWith('.dwg')).slice(0, 6) : [];
    const orig2007 = ['example-2007', 'architectural-annotation-scaling-and-multileaders', 'blocks-and-tables-imperial'].map((n) => path.join(CORPUS, 'orig', n + '.dwg')).filter((f) => fs.existsSync(f));
    const words = [];
    for (const f of [...files.map((x) => path.join(CORPUS, 'AC1021', x)), ...orig2007]) {
      const b = fs.readFileSync(f);
      for (let k = 0; k < 3; k++) { const cw = new Uint8Array(255); for (let i = 0; i < 255; i++) cw[i] = b[0x80 + i * 3 + k]; words.push({ f: path.basename(path.dirname(f)) + '/' + path.basename(f), cw }); }
    }
    if (!words.length) skipT('no R2007 files in the corpus');
    else {
      ok(words.every((w) => zero(w.cw, 239, true)), `${words.length} header codewords from ${words.length / 3} real R2007 files (ODA- and AutoCAD-saved) have zero syndromes`);
      let fixed = 0, tried = 0, bad = '';
      for (const w of words) for (let t = 1; t <= 8; t++) {
        const c = w.cw.slice(); const pos = new Set(); while (pos.size < t) pos.add(Math.floor(rnd() * 255));
        for (const p of pos) c[p] ^= 1 + Math.floor(rnd() * 255);
        tried++;
        const r = decode(c, 239, true);
        if (r && r.ok !== false && eq(c, w.cw)) fixed++; else if (!bad) bad = `${w.f}: ${t} errors → ${JSON.stringify(r)}`;
      }
      ok(fixed === tried, `${tried} corrupted codewords (1–8 byte errors each) corrected back to the original` + (bad ? ' — first failure ' + bad : ''));
      let flagged = 0, n9 = 0;
      for (const w of words.slice(0, 12)) {
        const c = w.cw.slice(); const pos = new Set(); while (pos.size < 12) pos.add(Math.floor(rnd() * 255));
        for (const p of pos) c[p] ^= 1 + Math.floor(rnd() * 255);
        n9++; const r = decode(c, 239, true); if (!(r && r.ok !== false && eq(c, w.cw))) flagged++;
      }
      ok(flagged === n9, `${n9} codewords with 12 errors (beyond the 8 correctable) are not silently "restored"`);
    }
    const enc = fnOf(W.r2007, 'rsEncode');
    const code = W.r2007 && (W.r2007.RS_SYS || W.r2007.RS_SYSTEM);
    if (enc && code) {
      const data = rbytes(239 * 3);
      const e = enc(data, code, true, () => 0);
      const cw = new Uint8Array(255); let all = true;
      for (let k = 0; k < 3; k++) { for (let i = 0; i < 255; i++) cw[i] = e[i * 3 + k]; if (!zero(cw, 239, true)) all = false; }
      ok(all, 'writer rsEncode (interleaved ×3) → reader: zero syndromes');
    } else skipT('writer → reader RS round trip: r2007-write.js exports rsEncode but not its code parameters (export RS_SYS / RS_DATA to enable)');
  }
}

// ------------------------------------------------------------------------------------------------ header
if (section('header', 'header variables (spec ch. 9)')) {
  const HV = R.hv;
  if (!HV?.HEADER_VARS) skipT('header-vars table: ' + (why['R.hv'] || 'no HEADER_VARS export'));
  else {
    const rows = HV.HEADER_VARS;
    ok(rows.length > 100, `${rows.length} header variables in the table`);
    const bad = rows.filter((r) => !r.name || r.from == null || r.to == null);
    ok(!bad.length, 'every row has a name and a version range' + (bad.length ? ': ' + bad.slice(0, 3).map((r) => JSON.stringify(r)).join(' ') : ''));
    if (HV.varsFor) {
      const vs = ['AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'].map((v) => [v, HV.varsFor(HV.VERSION_NUM?.[v] ?? v).length]);
      ok(vs.every(([, n]) => n > 100), 'varsFor(version) gives > 100 variables for each version: ' + vs.map(([v, n]) => `${v} ${n}`).join(', '));
    }
  }
  const readDwg = R.index?.readDwg || R.read?.readDwg;
  if (!readDwg) skipT('readDwg header vs truth: ' + (why['R.index'] || 'lib/dwg/index.js exports no readDwg'));
  else {
    const KEYS = ['INSUNITS', 'MEASUREMENT', 'EXTMIN', 'EXTMAX', 'LIMMIN', 'LIMMAX', 'LTSCALE'];
    for (const dir of ['orig', 'AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032']) {
      const f = path.join(CORPUS, dir, 'example-2000.dwg'), tj = readJson(path.join(TRUTH, dir, 'example-2000.json'));
      if (!fs.existsSync(f) || !tj) continue;
      let m; try { m = await readDwg(new Uint8Array(fs.readFileSync(f))); } catch (e) { ok(false, `${dir}/example-2000: readDwg threw ${e.message}`); continue; }
      const diffs = [];
      for (const k of KEYS) {
        const want = tj.header[k], got = m.header?.[k];
        if (want === undefined) continue;
        const norm = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? [v.x, v.y, v.z].filter((x) => x !== undefined) : v);
        const a = norm(want), b = norm(got);
        const same = Array.isArray(a) ? Array.isArray(b) && a.every((x, i) => Math.abs(x - b[i]) <= 1e-9 * Math.max(1, Math.abs(x))) : a === b || (typeof a === 'number' && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)));
        if (!same) diffs.push(`${k} ${JSON.stringify(got)} vs ${JSON.stringify(want)}`);
      }
      ok(!diffs.length, `${dir}/example-2000: header ${KEYS.join(' ')} = ODA's` + (diffs.length ? ': ' + diffs.join('; ') : ''));
    }
  }
}

// ------------------------------------------------------------------------------------------------ read
if (section('read', 'readDwg never crashes')) {
  const readDwg = R.index?.readDwg || R.read?.readDwg;
  if (!readDwg) skipT('readDwg robustness: ' + (why['R.index'] || 'no readDwg'));
  else {
    const cases = [['10-byte fake "AC1027fake"', new TextEncoder().encode('AC1027fake')], ['R12 header AC1009', (() => { const b = new Uint8Array(4096); b.set(new TextEncoder().encode('AC1009')); return b; })()],
      ['not a DWG', new TextEncoder().encode('hello world, this is not a drawing')], ['truncated R2004 (first 4 KB of example_2004)', fs.existsSync(path.join(CORPUS, 'orig/example-2004.dwg')) ? fs.readFileSync(path.join(CORPUS, 'orig/example-2004.dwg')).subarray(0, 4096) : null]];
    for (const [name, b] of cases) {
      if (!b) continue;
      try {
        const m = await readDwg(new Uint8Array(b));
        ok(m && (m.report?.notes?.length || m.notes?.length), `${name}: returns a model with a note`);
      } catch (e) {
        ok(!(e instanceof TypeError || e instanceof RangeError || e instanceof ReferenceError), `${name}: a clean error (${e.constructor.name}: ${String(e.message).slice(0, 100)})`);
      }
    }
  }
}

if (section('async', 'readDwgAsync (read-async.js: readDwg in a worker, 0.4 1.3)')) {
  // the worker is linked from blob: URLs, which needs the reader's import graph to be a tree (no cycles)
  const cycles = [];
  const seen = new Set();
  const visit = (f, stack) => {
    if (stack.includes(f)) { cycles.push([...stack, f].join(' > ')); return; }
    if (seen.has(f)) return;
    seen.add(f);
    const src = fs.readFileSync(path.join(LIB, f), 'utf8');
    for (const d of new Set([...src.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*)'\.\/([\w.-]+\.js)'/g)].map((m) => m[1]))) visit(d, [...stack, f]);
  };
  visit('read-async.js', []);
  ok(!cycles.length && seen.has('read.js'), `the reader's ${seen.size} modules import each other without a cycle${cycles.length ? ': ' + cycles.join(' | ') : ''}`);
  const A = await tryImport('read-async.js'), R = await tryImport('read.js');
  if (A.mod && R.mod) {
    const file = path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg');
    if (fs.existsSync(file)) {
      const bytes = new Uint8Array(fs.readFileSync(file));
      const a = await A.mod.readDwgAsync(bytes), b = R.mod.readDwg(bytes);
      delete a.report.ms; delete b.report.ms;
      ok(JSON.stringify(a) === JSON.stringify(b) && A.mod.dwgWorkerState() === 'main', 'without Worker (Node) it reads on this thread, the same model as readDwg');
      ok(bytes[0] === 0x41 && bytes.length === fs.statSync(file).size, 'the caller\'s bytes are left as they were');
    } else skipT('async: fixtures/dwg/kitchen-equipment.dwg not found');
  } else ok(false, A.why || R.why);
}

// ------------------------------------------------------------------------------------------------ dynamic blocks
if (section('dyn', 'dynamic blocks (dynblock-read.js, 0.5 DB.2; docs/DWG-DYNAMIC-BLOCKS.md)')) {
  const D = await tryImport('dynblock-read.js'), Wr = await tryImport('write.js');
  const file = path.join(CORPUS, 'orig/blocks-and-tables-imperial.dwg');
  if (!D.mod || !R.read) ok(false, D.why || why['R.read']);
  else if (!fs.existsSync(file)) skipT('dyn: ' + file + ' not found (AutoCAD sample, outside git)');
  else {
    const db = R.read.readDwg(new Uint8Array(fs.readFileSync(file)));
    const defs = db.blocks.filter((b) => b.dynamic);
    ok(defs.length === 12 && db.report.dynamicBlocks === 12, 'the blocks sample: 12 dynamic definitions');
    ok(['Label', 'Window', 'Receptacle', 'Switch', 'Sink', 'Toilet', 'Door'].every((n) => defs.some((b) => b.name === n && b.trueName === n)) && !defs.some((b) => b.name.startsWith('*')),
      'definitions stored as "*U" with a graph take their true name (as the ODA converter names them)');
    const rec = defs.find((b) => b.name === 'Receptacle'), vis = rec.dynamic.params.find((p) => p.kind === 'visibility');
    ok(vis && vis.node === 73 && vis.label === 'Visibility' && vis.states.map((x) => x.name).join('|') === 'Duplex|GFI' && vis.all.length === 5
      && vis.states[0].entities.length === 4 && vis.states[1].entities.length === 5 && vis.grip === 74, 'Receptacle: visibility parameter (node 73, grip 74), states Duplex | GFI with their entity lists');
    ok(rec.dynamic.params.some((p) => p.kind === 'alignment' && p.node === 48), 'Receptacle: its alignment parameter (node 48)');
    const states = defs.flatMap((b) => b.dynamic.params.filter((p) => p.kind === 'visibility').map((p) => p.states.length));
    ok(states.slice().sort().join() === '2,2,2,2,3,3', 'six visibility parameters, decoded exactly (two with 3 states)');
    const door = defs.find((b) => b.name === 'Door');
    ok(door.dynamic.params.map((p) => p.kind).sort().join() === 'alignment,basepoint,flip,flip,linear,point' && door.dynamic.actions.map((a) => a.kind).sort().join() === 'flip,flip,move,scale,stretch',
      'Door: its parameters and actions by kind');
    const refs = db.blocks.flatMap((b) => b.entities.filter((e) => e.dyn));
    ok(refs.length === 136 && refs.every((e) => defs.some((b) => b.record === e.dyn.def)), '136 references, each finds its definition');
    const st = {}; for (const e of refs) if (e.dyn.state) st[e.dyn.state] = (st[e.dyn.state] || 0) + 1;
    ok(st.GFI === 7 && st.Duplex === 38 && st['3 Pole'] === 6 && st.Single === 14 && st['Kitchen - Plan'] === 1, 'their visibility states (from the XRECORDs, else the block shown)', JSON.stringify(st));
    const lin = refs.map((e) => e.dyn.values.find((v) => v.kind === 'linear')).find(Boolean);
    ok(lin && Math.abs(lin.distance - 72) < 1e-9, 'a linear value as its distance (Window: 72)', lin && lin.distance);
    ok(refs.some((e) => e.dyn.values.some((v) => v.kind === 'flip' && typeof v.flipped === 'boolean')), 'flip values read as flipped / not');
    ok(db.blocks.filter((b) => b.dynamicOf).length === 29 && db.blocks.filter((b) => b.dynamicOf).every((b) => defs.some((d) => d.record === b.dynamicOf)), '29 reference copies (*B…) point back to their definition');
    // every version keeps the graph layout: AutoCAD's own example files (a sweep's history)
    const ex = ['2000', '2004', '2007', '2010', '2013', '2018'].map((v) => path.join(CORPUS, 'orig/example-' + v + '.dwg')).filter((f) => fs.existsSync(f));
    const nodes = ex.map((f) => { const m = R.read.readDwg(new Uint8Array(fs.readFileSync(f))); const g = m.objects.find((o) => o.type === 'ACAD_EVALUATION_GRAPH'); return JSON.stringify(D.mod.graphNodes(g).map((x) => x.node)); });
    ok(ex.length === 6 && nodes.every((x) => x === '[1]'), 'the evaluation graph reads the same in AutoCAD 2000–2018', nodes.join(' '));
    // untrusted data: a damaged parameter is left undecoded, the read goes on
    const vo = db.objects.find((o) => o.type === 'BLOCKVISIBILITYPARAMETER');
    const cut = { ...vo, raw: { ...vo.raw, h: vo.raw.h.slice(0, 3) } };
    let threw = false; try { D.mod.visibilityOf(cut); } catch { threw = true; }
    ok(threw, 'a visibility parameter whose handle list is short is refused (not half read)');
    // written back by cc-dwg in its own version: everything there again; another version: as proxies (AutoCAD saves down so)
    if (Wr.mod) {
      const again = R.read.readDwg(Wr.mod.writeDwg(db, { version: '2007' }).bytes);
      const st2 = {}; for (const e of again.blocks.flatMap((b) => b.entities.filter((x) => x.dyn))) if (e.dyn.state) st2[e.dyn.state] = (st2[e.dyn.state] || 0) + 1;
      ok(again.report.dynamicBlocks === 12 && JSON.stringify(st2) === JSON.stringify(st), 'written as AutoCAD 2007 (its own version) and read again: the same definitions and states');
      const down = Wr.mod.writeDwg(db, { version: '2018' });
      ok(down.report.notes.some((n) => /proxies of their own class/.test(n) && /BLOCKVISIBILITYPARAMETER/.test(n)), 'written as 2018: kept as proxies of their own class, and said');
      // an edited visibility parameter (dynblock-write.js, 0.5 DB.9): re-encoded exactly first, then written with new states
      const Dw = await tryImport('dynblock-write.js');
      if (Dw.mod) {
        const vps = db.objects.filter((o) => o.type === 'BLOCKVISIBILITYPARAMETER');
        ok(vps.length === 6 && vps.every((o) => Dw.mod.reencodesExactly(o.raw)), 'dynblock-write: all 6 visibility parameters re-encode bit for bit');
        const f = Dw.mod.visibilityFields(vo.raw);
        const states = [...f.states.map((s, i) => ({ name: i ? s.name : s.name + ' (edited)', from: s.name, entities: s.entities.map(([, h]) => h) })), { name: 'Empty', from: f.states[0].name, entities: [] }];
        const edited = { ...db, objects: db.objects.map((o) => (o === vo ? { ...o, raw: Dw.mod.rewriteVisibility(o.raw, states) } : o)) };
        const back = R.read.readDwg(Wr.mod.writeDwg(edited, { version: '2007' }).bytes);
        const pv = back.objects.filter((o) => o.type === 'BLOCKVISIBILITYPARAMETER').map((o) => { try { return D.mod.visibilityOf(o).states.map((s) => s.name + ':' + s.entities.length).join('|'); } catch { return 'damaged'; } });
        const want = states.map((s) => s.name + ':' + s.entities.length).join('|');
        ok(back.report.dynamicBlocks === 12 && pv.includes(want), 'an edited parameter (state renamed, one added) written in its own version reads back as edited', want + ' in ' + JSON.stringify(pv));
      }
    }
  }
}

console.log(`\n${pass} passed, ${fail} failed, ${skip} skipped`);
if (skip && !VERBOSE) console.log('skipped: ' + skipped.map((s) => s.split(':')[0]).join('; '));
process.exit(fail ? 1 : 0);
