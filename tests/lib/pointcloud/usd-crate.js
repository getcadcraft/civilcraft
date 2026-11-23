/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usd-crate.js — a binary USD file (".usdc", the "crate" format that a USDZ from an iPhone or iPad holds) read into one mesh (0.11 SU.1809).
 * DOM-free, no app imports, no third-party code: the LZ4 block decoder and the integer decompression are written here.
 *
 *   readUsdc(bytes) → { vertices: Float64Array(3n), colors: Uint8Array(3n)|null, triangles: Uint32Array(3m)|null, metersPerUnit, upAxis: 'Y'|'Z'|null,
 *                       meshes: n, notes[] }
 *   Every `Mesh` prim's `points`, `faceVertexCounts` and `faceVertexIndices` (default values), its display colour (`primvars:displayColor`, per
 *   vertex or constant) and the transform of its parents (`xformOp:transform`, translate, scale, rotateXYZ/ZYX..., orient, in `xformOpOrder`,
 *   `!invert!` and `!resetXformStack!` honoured) are put together in one mesh. Skeletons, skinning, instancing, references to other files,
 *   time samples and subdivision are NOT applied; notes say which were met ('usdc_skinned', 'usdc_references', 'usdc_timesamples', 'usdc_no_mesh').
 *   Throws code 'usdc_bad' (not a crate file / damaged / a version older than 0.4) or 'usdc_version'.
 *
 * Source of the format: Pixar's OpenUSD (Apache-2.0), file `pxr/usd/sdf/crateFile.cpp` and its description of the bootstrap, table of contents,
 * the sections TOKENS, STRINGS, FIELDS, FIELDSETS, PATHS and SPECS, the 64-bit value representation (bit 63 array, 62 inlined, 61 compressed,
 * bits 48 to 55 the type, the low 48 bits the payload or the offset); `pxr/usd/sdf/integerCoding.cpp` (the integer codes: a common delta, then
 * 2 bits per number choosing common / int8 / int16 / int32 delta); `pxr/base/tf/fastCompression.cpp` (one byte of chunk count, then LZ4 blocks).
 * Checked against real files, not only our own: testfiles/third-party/usd-glb (BSD-3-Clause, f3d), see bin/test-pointcloud-formats.mjs.
 */
const TD = new TextDecoder();
const fail = (code, data) => { throw Object.assign(new Error('usdc: ' + code), { name: 'PcError', code, data }); };

/** LZ4 block decoder: decodes one block that ends where the input ends; returns the bytes written. */
function lz4Block(src, sp, end, dst, dp) {
  const d0 = dp;
  while (sp < end) {
    const tok = src[sp++];
    let lit = tok >> 4;
    if (lit === 15) { let b; do { b = src[sp++]; lit += b; } while (b === 255 && sp < end); }
    if (dp + lit > dst.length || sp + lit > end) fail('usdc_bad', { why: 'lz4_literal' });
    dst.set(src.subarray(sp, sp + lit), dp); sp += lit; dp += lit;
    if (sp >= end) break;
    const off = src[sp] | (src[sp + 1] << 8); sp += 2;
    if (off === 0 || off > dp - d0 + 0 && off > dp) fail('usdc_bad', { why: 'lz4_offset' });
    let ml = tok & 15;
    if (ml === 15) { let b; do { b = src[sp++]; ml += b; } while (b === 255 && sp < end); }
    ml += 4;
    if (dp + ml > dst.length) fail('usdc_bad', { why: 'lz4_overflow' });
    for (let i = 0; i < ml; i++, dp++) dst[dp] = dst[dp - off];
  }
  return dp - d0;
}
/** TfFastCompression: first byte = chunk count (0: one block, to the end), else per chunk int32 size + block. */
function fastDecompress(src, outSize, exact = true) {
  const out = new Uint8Array(outSize);
  const nChunks = src[0];
  if (nChunks === 0) { const n = lz4Block(src, 1, src.length, out, 0); if (exact && n !== outSize) fail('usdc_bad', { why: 'size', n, outSize }); return out; }
  const dv = new DataView(src.buffer, src.byteOffset, src.byteLength);
  let sp = 1, dp = 0;
  for (let c = 0; c < nChunks; c++) {
    const sz = dv.getInt32(sp, true); sp += 4;
    if (sz <= 0 || sp + sz > src.length) fail('usdc_bad', { why: 'chunk' });
    dp += lz4Block(src, sp, sp + sz, out, dp); sp += sz;
  }
  if (exact && dp !== outSize) fail('usdc_bad', { why: 'size', dp, outSize });
  return out;
}
/** Integer coding: [int32 common][(n+3)/4 code bytes][variable deltas]. 32-bit and 64-bit (the 64-bit deltas are read as numbers; exact to 2^53). */
function decodeInts(enc, n, bits) {
  const dv = new DataView(enc.buffer, enc.byteOffset, enc.byteLength), W = bits / 8;
  const out = bits === 32 ? new Int32Array(n) : new Float64Array(n);
  let common, p = W;
  common = bits === 32 ? dv.getInt32(0, true) : Number(dv.getBigInt64(0, true));
  const codes = p; p += (n + 3) >> 2;
  let prev = 0;
  for (let i = 0; i < n; i++) {
    const c = (enc[codes + (i >> 2)] >> (2 * (i & 3))) & 3;
    let d;
    if (c === 0) d = common;
    else if (c === 1) { d = dv.getInt8(p); p += 1; }
    else if (c === 2) { d = dv.getInt16(p, true); p += 2; }
    else if (bits === 32) { d = dv.getInt32(p, true); p += 4; } else { d = Number(dv.getBigInt64(p, true)); p += 8; }
    prev = bits === 32 ? (prev + d) | 0 : prev + d; out[i] = prev;
  }
  return out;
}

const TYPE = { Bool: 1, UChar: 2, Int: 3, UInt: 4, Int64: 5, UInt64: 6, Half: 7, Float: 8, Double: 9, Token: 11, Matrix4d: 15, Quatd: 16, Quatf: 17, Vec3d: 23, Vec3f: 24, Vec3h: 25, TokenVector: 41 };
const SPEC_PRIM = 6, SPEC_ATTR = 1, SPEC_PSEUDO = 7;

export function readUsdc(input) {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (u8.length < 88 || TD.decode(u8.subarray(0, 8)) !== 'PXR-USDC') fail('usdc_bad', { why: 'magic' });
  const ver = [u8[8], u8[9], u8[10]];
  if (ver[0] !== 0 || ver[1] < 4 || ver[1] > 12) fail('usdc_version', { version: ver.join('.') });
  const u64 = (o) => { const v = dv.getBigUint64(o, true); if (v > 0x1FFFFFFFFFFFFFn) fail('usdc_bad', { why: 'big' }); return Number(v); };
  const toc = u64(16);
  if (!(toc >= 88 && toc + 8 <= u8.length)) fail('usdc_bad', { why: 'toc' });
  const nsec = u64(toc), sec = {};
  if (nsec > 64 || toc + 8 + nsec * 32 > u8.length) fail('usdc_bad', { why: 'sections' });
  for (let i = 0; i < nsec; i++) {
    const o = toc + 8 + 32 * i, name = TD.decode(u8.subarray(o, o + 16)).replace(/\0+$/, '');
    sec[name] = { start: u64(o + 16), size: u64(o + 24) };
    if (sec[name].start + sec[name].size > u8.length) fail('usdc_bad', { why: 'section_range', name });
  }
  for (const n of ['TOKENS', 'FIELDS', 'FIELDSETS', 'PATHS', 'SPECS']) if (!sec[n]) fail('usdc_bad', { why: 'no_section', name: n });
  const maxCount = u8.length * 4 + 1024;   // a table cannot hold more entries than the file could describe
  const cnt = (o) => { const n = u64(o); if (n > maxCount) fail('usdc_bad', { why: 'count', n }); return n; };

  // TOKENS
  let p = sec.TOKENS.start;
  const nTok = cnt(p), tokUnc = u64(p + 8), tokComp = u64(p + 16); p += 24;
  if (tokUnc > u8.length * 255 || p + tokComp > u8.length) fail('usdc_bad', { why: 'tokens' });
  const tb = fastDecompress(u8.subarray(p, p + tokComp), tokUnc), tokens = [];
  for (let s = 0, i = 0; i < nTok; i++) { let e = s; while (e < tb.length && tb[e] !== 0) e++; tokens.push(TD.decode(tb.subarray(s, e))); s = e + 1; }
  // compressed integer block: uint64 size, then size bytes
  const ints = (pos, n, bits = 32) => {
    const cs = u64(pos), enc = fastDecompress(u8.subarray(pos + 8, pos + 8 + cs), (bits / 8) + ((n + 3) >> 2) + n * (bits / 8), false);
    return { v: decodeInts(enc, n, bits), end: pos + 8 + cs };
  };
  // FIELDS
  p = sec.FIELDS.start;
  const nFields = cnt(p); p += 8;
  const fTok = ints(p, nFields); p = fTok.end;
  const rcs = u64(p), repsRaw = fastDecompress(u8.subarray(p + 8, p + 8 + rcs), nFields * 8), rdv = new DataView(repsRaw.buffer, repsRaw.byteOffset, repsRaw.byteLength);
  const fields = [];
  for (let i = 0; i < nFields; i++) fields.push({ name: tokens[fTok.v[i]], rep: rdv.getBigUint64(8 * i, true) });
  // FIELDSETS
  p = sec.FIELDSETS.start;
  const nFS = cnt(p); p += 8;
  const fsI = ints(p, nFS).v, fieldSets = {};
  { let cur = [], start = 0; for (let i = 0; i < nFS; i++) { if (fsI[i] === -1) { fieldSets[start] = cur; cur = []; start = i + 1; } else cur.push(fsI[i]); } }   // a spec names a set by the index of its first entry
  // PATHS
  p = sec.PATHS.start;
  const nPaths = cnt(p); p += 8;
  const nEnc = cnt(p); p += 8;
  const pi = ints(p, nEnc); p = pi.end;
  const ei = ints(p, nEnc); p = ei.end;
  const ji = ints(p, nEnc);
  const paths = new Array(nPaths).fill('');
  // iterative form of the recursive builder (a deep scene must not overflow the stack)
  const stack = [[0, '']];
  let guard = 0;
  while (stack.length) {
    let [cur, parent] = stack.pop();
    let hasChild = false, hasSib = false;
    do {
      if (++guard > nEnc * 2 + 8 || cur >= nEnc) fail('usdc_bad', { why: 'paths' });
      const me = cur++, idx = pi.v[me];
      if (idx < 0 || idx >= nPaths) fail('usdc_bad', { why: 'path_index' });
      let here;
      if (parent === '' && me === 0 && idx === 0 && ei.v[me] === 0 && stack.length === 0 && !paths[0]) here = '/';
      else {
        const tk = ei.v[me], prop = tk < 0, name = tokens[Math.abs(tk)];
        if (name === undefined) fail('usdc_bad', { why: 'path_token' });
        here = prop ? (parent === '/' ? '' : parent) + '.' + name : (parent === '/' ? '' : parent) + '/' + name;
      }
      paths[idx] = here;
      const j = ji.v[me];
      hasChild = j > 0 || j === -1; hasSib = j >= 0;
      if (hasChild && hasSib) stack.push([me + j, parent]);
      if (hasChild) parent = here;
    } while (hasChild || hasSib);
  }
  // SPECS
  p = sec.SPECS.start;
  const nSpec = cnt(p); p += 8;
  const sPath = ints(p, nSpec); p = sPath.end;
  const sFS = ints(p, nSpec); p = sFS.end;
  const sType = ints(p, nSpec);
  const specs = new Map();   // path string → { type, fields: Map name→rep }
  for (let i = 0; i < nSpec; i++) {
    const fl = new Map();
    for (const fi of fieldSets[sFS.v[i]] || []) { const f = fields[fi]; if (f) fl.set(f.name, f.rep); }
    specs.set(paths[sPath.v[i]], { type: sType.v[i], fields: fl });
  }

  // ---- values
  const isArr = (r) => (r >> 63n) === 1n, isInl = (r) => ((r >> 62n) & 1n) === 1n, isCmp = (r) => ((r >> 61n) & 1n) === 1n, typ = (r) => Number((r >> 48n) & 0xFFn), pay = (r) => Number(r & 0xFFFFFFFFFFFFn);
  const notes = new Set();
  const half = (h) => { const s = (h & 0x8000) ? -1 : 1, e = (h >> 10) & 31, f = h & 1023; return e === 0 ? s * 5.960464477539063e-8 * f : e === 31 ? (f ? NaN : s * Infinity) : s * 2 ** (e - 15) * (1 + f / 1024); };
  function arrayOf(r) {
    const t = typ(r);
    if (!isArr(r) || isInl(r)) return null;
    let o = pay(r);
    if (o + 8 > u8.length) fail('usdc_bad', { why: 'value_offset' });
    const n = u64(o); o += 8;
    if (n > u8.length * 8) fail('usdc_bad', { why: 'array_size', n });
    if (t === TYPE.Int || t === TYPE.UInt) {
      if (isCmp(r) && n >= 16) { const { v } = ints(o, n); return t === TYPE.UInt ? Uint32Array.from(v, (x) => x >>> 0) : v; }
      if (o + 4 * n > u8.length) fail('usdc_bad', { why: 'array_range' });
      const cp = new Uint8Array(u8.subarray(o, o + 4 * n)).buffer;   // a copy (u8 may be a Node Buffer, whose slice() shares memory)
      return t === TYPE.Int ? new Int32Array(cp) : new Uint32Array(cp);
    }
    const width = { [TYPE.Float]: 1, [TYPE.Double]: 1, [TYPE.Vec3f]: 3, [TYPE.Vec3d]: 3, [TYPE.Vec3h]: 3 }[t];
    if (!width) return null;
    if (isCmp(r)) { notes.add('usdc_compressed_floats'); return null; }
    const bytes = t === TYPE.Vec3d || t === TYPE.Double ? 8 : t === TYPE.Vec3h ? 2 : 4;
    if (o + n * width * bytes > u8.length) fail('usdc_bad', { why: 'array_range' });
    const f = new DataView(u8.buffer, u8.byteOffset + o, n * width * bytes), out = new Float64Array(n * width);
    for (let i = 0; i < out.length; i++) out[i] = bytes === 8 ? f.getFloat64(8 * i, true) : bytes === 4 ? f.getFloat32(4 * i, true) : half(f.getUint16(2 * i, true));
    return out;
  }
  function scalar(r) {
    const t = typ(r);
    if (isArr(r)) return null;
    if (isInl(r)) {
      const lo = Number(r & 0xFFFFFFFFn);
      if (t === TYPE.Double || t === TYPE.Float) { const b = new DataView(new ArrayBuffer(4)); b.setUint32(0, lo, true); return b.getFloat32(0, true); }
      if (t === TYPE.Token) return tokens[lo];
      if (t === TYPE.Int || t === TYPE.UInt || t === TYPE.Bool) return t === TYPE.Int ? lo | 0 : lo;
      return null;
    }
    const o = pay(r);
    if (t === TYPE.Double && o + 8 <= u8.length) return dv.getFloat64(o, true);
    if (t === TYPE.Matrix4d && o + 128 <= u8.length) { const m = new Float64Array(16); for (let i = 0; i < 16; i++) m[i] = dv.getFloat64(o + 8 * i, true); return m; }
    if (t === TYPE.Vec3d && o + 24 <= u8.length) return [dv.getFloat64(o, true), dv.getFloat64(o + 8, true), dv.getFloat64(o + 16, true)];
    if (t === TYPE.Vec3f && o + 12 <= u8.length) return [dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true)];
    if (t === TYPE.Quatf && o + 16 <= u8.length) return [dv.getFloat32(o, true), dv.getFloat32(o + 4, true), dv.getFloat32(o + 8, true), dv.getFloat32(o + 12, true)];   // w, x, y, z
    if (t === TYPE.Quatd && o + 32 <= u8.length) return [dv.getFloat64(o, true), dv.getFloat64(o + 8, true), dv.getFloat64(o + 16, true), dv.getFloat64(o + 24, true)];
    if (t === TYPE.TokenVector && o + 8 <= u8.length) { const n = u64(o), out = []; for (let i = 0; i < n && o + 8 + 4 * i + 4 <= u8.length; i++) out.push(tokens[dv.getUint32(o + 8 + 4 * i, true)]); return out; }
    return null;
  }
  const attr = (primPath, name) => specs.get(primPath + '.' + name)?.fields.get('default');
  // ---- transforms (row-vector convention as in USD: p' = p * M; stored here as column-major-free 4x4 row arrays)
  const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const mul = (a, b) => { const r = new Array(16).fill(0); for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) r[4 * i + j] += a[4 * i + k] * b[4 * k + j]; return r; };
  const rotM = (axis, deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), m = I4(); if (axis === 'X') { m[5] = c; m[6] = s; m[9] = -s; m[10] = c; } else if (axis === 'Y') { m[0] = c; m[2] = -s; m[8] = s; m[10] = c; } else { m[0] = c; m[1] = s; m[4] = -s; m[5] = c; } return m; };
  const inv = (m) => {   // general 4x4 inverse (cofactors via Gauss-Jordan)
    const a = m.slice(), r = I4();
    for (let c = 0; c < 4; c++) {
      let piv = c; for (let i = c + 1; i < 4; i++) if (Math.abs(a[4 * i + c]) > Math.abs(a[4 * piv + c])) piv = i;
      if (Math.abs(a[4 * piv + c]) < 1e-300) return I4();
      if (piv !== c) for (let j = 0; j < 4; j++) { [a[4 * c + j], a[4 * piv + j]] = [a[4 * piv + j], a[4 * c + j]]; [r[4 * c + j], r[4 * piv + j]] = [r[4 * piv + j], r[4 * c + j]]; }
      const d = a[4 * c + c]; for (let j = 0; j < 4; j++) { a[4 * c + j] /= d; r[4 * c + j] /= d; }
      for (let i = 0; i < 4; i++) if (i !== c) { const f = a[4 * i + c]; if (f) for (let j = 0; j < 4; j++) { a[4 * i + j] -= f * a[4 * c + j]; r[4 * i + j] -= f * r[4 * c + j]; } }
    }
    return r;
  };
  function localMatrix(prim) {
    const order = scalar(specs.get(prim + '.xformOpOrder')?.fields.get('default') ?? 0n);
    let m = I4(), reset = false;
    const names = Array.isArray(order) ? order : [];
    for (const full of names) {
      if (full === '!resetXformStack!') { reset = true; continue; }
      const invert = full.startsWith('!invert!'), nm = invert ? full.slice(8) : full;
      const rep = attr(prim, nm); if (rep === undefined) continue;
      let op = null;
      const base = nm.split(':')[1] || '';
      if (base === 'transform') { const v = scalar(rep); if (v) op = Array.from(v); }
      else if (base === 'translate') { const v = scalar(rep); if (v) { op = I4(); op[12] = v[0]; op[13] = v[1]; op[14] = v[2]; } }
      else if (base === 'scale') { const v = scalar(rep); if (v) { op = I4(); op[0] = v[0]; op[5] = v[1]; op[10] = v[2]; } }
      else if (base === 'orient') {
        const q = scalar(rep);
        if (q) { const [w, x, y, z] = q; op = [1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0, 2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0, 2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0, 0, 0, 0, 1]; }
      } else if (/^rotate(X|Y|Z)$/.test(base)) { const v = scalar(rep); if (typeof v === 'number') op = rotM(base[6], v); }
      else if (/^rotate[XYZ]{3}$/.test(base)) {
        const v = scalar(rep);
        if (v) { const ax = base.slice(6); op = I4(); for (let k = 0; k < 3; k++) op = mul(op, rotM(ax[k], v[k])); }
      }
      if (op) m = mul(invert ? inv(op) : op, m);   // ops listed first apply to the point last? USD: the first listed op is the outermost, so left-multiplied
    }
    return { m, reset };
  }
  const worldCache = new Map();
  function world(prim) {
    if (prim === '/' || prim === '') return I4();
    if (worldCache.has(prim)) return worldCache.get(prim);
    const parent = prim.slice(0, prim.lastIndexOf('/')) || '/';
    const l = localMatrix(prim);
    const w = l.reset ? l.m : mul(l.m, world(parent));
    worldCache.set(prim, w);
    return w;
  }
  const typeName = (path) => { const r = specs.get(path)?.fields.get('typeName'); return r === undefined ? '' : scalar(r) || ''; };

  // ---- the layer's own metadata
  const root = specs.get('/');
  let metersPerUnit = 1, upAxis = null;
  if (root) {
    const mpu = root.fields.get('metersPerUnit'); if (mpu !== undefined) { const v = scalar(mpu); if (v > 0) metersPerUnit = v; }
    const ua = root.fields.get('upAxis'); if (ua !== undefined) { const v = scalar(ua); if (v === 'Y' || v === 'Z') upAxis = v; }
  }
  // ---- meshes
  const V = [], C = [], T = [];
  let meshes = 0, anyColour = false;
  for (const [path, sp] of specs) {
    if (sp.type !== SPEC_PRIM || path === '/') continue;
    if (sp.fields.has('references') || sp.fields.has('payload')) notes.add('usdc_references');
    if (sp.fields.has('apiSchemas')) { /* skinning is the API schema SkelBindingAPI; the points are still the bind pose */ }
    if (typeName(path) !== 'Mesh') continue;
    const pr = attr(path, 'points'), fi = attr(path, 'faceVertexIndices'), fc = attr(path, 'faceVertexCounts');
    if (pr === undefined) { if (specs.get(path + '.points')?.fields.has('timeSamples')) notes.add('usdc_timesamples'); continue; }
    const pts = arrayOf(pr);
    if (!pts || pts.length < 3) continue;
    if (specs.has(path + '.skel:joints') || specs.get(path + '.primvars:skel:jointIndices')) notes.add('usdc_skinned');
    const M = world(path), nv = pts.length / 3, base = V.length / 3;
    for (let i = 0; i < nv; i++) {
      const x = pts[3 * i], y = pts[3 * i + 1], z = pts[3 * i + 2];
      V.push((x * M[0] + y * M[4] + z * M[8] + M[12]) * metersPerUnit, (x * M[1] + y * M[5] + z * M[9] + M[13]) * metersPerUnit, (x * M[2] + y * M[6] + z * M[10] + M[14]) * metersPerUnit);
    }
    // display colour: one per vertex or one for the whole mesh
    const cr = attr(path, 'primvars:displayColor');
    let col = null;
    if (cr !== undefined) { const a = arrayOf(cr); if (a && (a.length === 3 || a.length === 3 * nv)) col = a; }
    for (let i = 0; i < nv; i++) { if (col) { anyColour = true; const k = col.length === 3 ? 0 : 3 * i; C.push(Math.round(col[k] * 255), Math.round(col[k + 1] * 255), Math.round(col[k + 2] * 255)); } else C.push(-1, -1, -1); }
    const idx = fi !== undefined ? arrayOf(fi) : null, cts = fc !== undefined ? arrayOf(fc) : null;
    if (idx) {
      let o = 0;
      const counts = cts || new Int32Array(Math.floor(idx.length / 3)).fill(3);
      for (let f = 0; f < counts.length; f++) {
        const c = counts[f];
        if (c < 3 || o + c > idx.length) { o += Math.max(0, c); continue; }
        for (let k = 1; k + 1 < c; k++) {
          const a = idx[o], b = idx[o + k], d = idx[o + k + 1];
          if (a < nv && b < nv && d < nv && a >= 0 && b >= 0 && d >= 0) T.push(base + a, base + b, base + d);
        }
        o += c;
      }
    }
    meshes++;
  }
  if (!meshes) { notes.add('usdc_no_mesh'); fail('usdc_no_mesh', { notes: [...notes], specs: [...specs].slice(0, 12).map(([k, v]) => k + ' t' + v.type + ' ' + [...v.fields.keys()].join(',') + ' tn=' + (v.fields.has('typeName') ? scalar(v.fields.get('typeName')) : '')) }); }
  const nvAll = V.length / 3;
  let colors = null;
  if (anyColour) { colors = new Uint8Array(3 * nvAll); for (let i = 0; i < C.length; i++) colors[i] = C[i] < 0 ? 160 : Math.min(255, Math.max(0, C[i])); }
  return { vertices: Float64Array.from(V), colors, triangles: T.length ? Uint32Array.from(T) : null, metersPerUnit, upAxis, meshes, notes: [...notes] };
}
