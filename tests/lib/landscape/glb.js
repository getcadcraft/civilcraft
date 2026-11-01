/* SPDX-License-Identifier: Apache-2.0 */
/**
 * glb.js — a plant record's own 3D model from a binary glTF 2.0 file (.glb), geometry only (0.8 LA.7, session `landscape-finish_PART_4`).
 * Written from the Khronos glTF 2.0 specification (GLB container § 4.4, accessors § 3.6, nodes and transforms § 3.5). No DOM, no imports.
 * Canonical in lib/landscape/; byte-identical copies by `node tools/landscape/sync.mjs civilcraft`.
 *
 * The file is untrusted. Nothing is fetched: a buffer or image that names a URI is never loaded (a .glb carries its own data; a model that
 * needs another file is refused). Nothing is evaluated: the JSON chunk goes through JSON.parse only. Every index, offset, stride and count is
 * checked against what it points at. Caps (GLB_LIMITS): file size, JSON size, triangles and vertices (after instancing), nodes visited, node depth,
 * images (count, bytes, and each PNG/JPEG's width and height read from its header — textures are never decoded or kept: the model is drawn in
 * the plant's own colour). Compressed or quantized geometry (Draco, meshopt, KHR_mesh_quantization) and sparse accessors are refused.
 *
 *   readGlbModel(bytes, limits?) → { positions: Float32Array (x, y, z with z up), indices: Uint32Array, notes: [code] }
 *     throws Error(code): 'too-big' | 'bad-glb' | 'unsupported' | 'external' | 'empty'
 *     notes: 'lines' (points or lines skipped), 'external-image' (an image naming a URI, not loaded), 'image-unread' (an image whose size
 *     could not be read from its header; it is not used either way)
 *   imageSize(bytes) → { w, h } | null      PNG or JPEG header
 * glTF is Y up; the result is Z up: (x, y, z) → (x, −z, y). Units do not matter: symbols.js normalizeModel scales the model to the plant.
 */

export const GLB_LIMITS = { bytes: 32 * 1024 * 1024, json: 4 * 1024 * 1024, tris: 50000, nodes: 10000, depth: 32, images: 64, imageBytes: 16 * 1024 * 1024, textureSide: 4096 };
const MAGIC = 0x46546c67, JSON_CHUNK = 0x4e4f534a, BIN_CHUNK = 0x004e4942;
const SIZE = { 5121: 1, 5123: 2, 5125: 4, 5126: 4 };
const NCOMP = { SCALAR: 1, VEC3: 3 };
/** Extensions a file may require that change nothing about the geometry we read (materials and textures are not used). */
const HARMLESS = /^KHR_(materials_|texture_)/;
const fail = (code) => { throw new Error(code); };
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const isIdx = (v, arr) => Number.isInteger(v) && v >= 0 && Array.isArray(arr) && v < arr.length;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function imageSize(b) {
  if (!(b instanceof Uint8Array) || b.length < 12) return null;
  if (b.length >= 24 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) {
    const dv = new DataView(b.buffer, b.byteOffset, b.length);
    return { w: dv.getUint32(16), h: dv.getUint32(20) };
  }
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    for (let n = 0; n < 10000 && i + 9 < b.length; n++) {
      if (b[i] !== 0xff) return null;
      const m = b[i + 1];
      if (m === 0xff) { i++; continue; }
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { w: (b[i + 7] << 8) | b[i + 8], h: (b[i + 5] << 8) | b[i + 6] };
      if (m === 0xd8 || (m >= 0xd0 && m <= 0xd7)) { i += 2; continue; }
      i += 2 + ((b[i + 2] << 8) | b[i + 3]);
    }
  }
  return null;
}

/** The GLB container → { json, bin } (bin: Uint8Array | null). */
function container(u8, L) {
  if (!(u8 instanceof Uint8Array)) fail('bad-glb');
  if (u8.length > L.bytes) fail('too-big');
  if (u8.length < 20) fail('bad-glb');
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.length);
  if (dv.getUint32(0, true) !== MAGIC) fail('bad-glb');
  if (dv.getUint32(4, true) !== 2) fail('unsupported');
  const total = dv.getUint32(8, true);
  if (total > u8.length || total < 20) fail('bad-glb');
  let off = 12, json = null, bin = null;
  for (let n = 0; off + 8 <= total && n < 64; n++) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true), start = off + 8;
    if (len > total - start) fail('bad-glb');
    if (n === 0) {
      if (type !== JSON_CHUNK) fail('bad-glb');
      if (len > L.json) fail('too-big');
      let text;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(u8.subarray(start, start + len)); } catch { fail('bad-glb'); }
      try { json = JSON.parse(text); } catch { fail('bad-glb'); }
    } else if (type === BIN_CHUNK && !bin) bin = u8.subarray(start, start + len);
    off = start + len + ((4 - (len % 4)) % 4);
  }
  if (!isObj(json) || !isObj(json.asset) || !/^2\./.test(String(json.asset.version || ''))) fail('bad-glb');
  return { json, bin };
}

/** The bytes a buffer view stands for (only the GLB's own buffer; a URI is never followed). */
function viewBytes(json, bin, vi) {
  const bv = isIdx(vi, json.bufferViews) ? json.bufferViews[vi] : fail('bad-glb');
  if (!isObj(bv) || !isIdx(bv.buffer, json.buffers)) fail('bad-glb');
  const buf = json.buffers[bv.buffer];
  if (!isObj(buf)) fail('bad-glb');
  if (buf.uri !== undefined) fail('external');
  if (!bin) fail('bad-glb');
  const o = bv.byteOffset ?? 0, n = bv.byteLength;
  if (!Number.isInteger(o) || o < 0 || !Number.isInteger(n) || n < 0 || o + n > bin.length || (Number.isInteger(buf.byteLength) && o + n > buf.byteLength)) fail('bad-glb');
  return { bytes: bin.subarray(o, o + n), stride: bv.byteStride };
}

/** One accessor's numbers, checked: positions (VEC3 float) or indices (SCALAR unsigned). */
function readAccessor(json, bin, ai, want) {
  const a = isIdx(ai, json.accessors) ? json.accessors[ai] : fail('bad-glb');
  if (!isObj(a)) fail('bad-glb');
  if (a.sparse !== undefined) fail('unsupported');
  const nc = NCOMP[a.type], cs = SIZE[a.componentType], count = a.count;
  if (!Number.isInteger(count) || count < 0) fail('bad-glb');
  if (want === 'pos' && (a.type !== 'VEC3' || a.componentType !== 5126 || a.normalized)) fail('unsupported');
  if (want === 'idx' && (a.type !== 'SCALAR' || ![5121, 5123, 5125].includes(a.componentType))) fail('bad-glb');
  if (!nc || !cs) fail('bad-glb');
  if (count === 0) return want === 'pos' ? new Float32Array(0) : new Uint32Array(0);
  if (a.bufferView === undefined) fail('bad-glb');   // all zeros: nothing to draw from
  const { bytes, stride: st } = viewBytes(json, bin, a.bufferView);
  const elem = nc * cs, stride = st === undefined ? elem : st, off = a.byteOffset ?? 0;
  if (!Number.isInteger(stride) || stride < elem || stride > 252 || stride % cs) fail('bad-glb');
  if (!Number.isInteger(off) || off < 0 || off % cs || off + stride * (count - 1) + elem > bytes.length) fail('bad-glb');
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.length);
  if (want === 'pos') {
    const out = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) for (let k = 0; k < 3; k++) { const v = dv.getFloat32(off + i * stride + k * 4, true); if (!fin(v)) fail('bad-glb'); out[i * 3 + k] = v; }
    return out;
  }
  const out = new Uint32Array(count), get = cs === 1 ? (p) => dv.getUint8(p) : cs === 2 ? (p) => dv.getUint16(p, true) : (p) => dv.getUint32(p, true);
  for (let i = 0; i < count; i++) out[i] = get(off + i * stride);
  return out;
}

const IDENT = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
/** Column-major 4×4 product a·b. */
function mul(a, b) {
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; }
  return o;
}
function nodeMatrix(n) {
  if (n.matrix !== undefined) { if (!Array.isArray(n.matrix) || n.matrix.length !== 16 || !n.matrix.every(fin)) fail('bad-glb'); return n.matrix.slice(); }
  const T = n.translation ?? [0, 0, 0], R = n.rotation ?? [0, 0, 0, 1], S = n.scale ?? [1, 1, 1];
  if (![T, R, S].every((v, i) => Array.isArray(v) && v.length === (i === 1 ? 4 : 3) && v.every(fin))) fail('bad-glb');
  const [x, y, z, w] = R, L = Math.hypot(x, y, z, w) || 1, qx = x / L, qy = y / L, qz = z / L, qw = w / L;
  const r = [1 - 2 * (qy * qy + qz * qz), 2 * (qx * qy + qz * qw), 2 * (qx * qz - qy * qw), 0,
    2 * (qx * qy - qz * qw), 1 - 2 * (qx * qx + qz * qz), 2 * (qy * qz + qx * qw), 0,
    2 * (qx * qz + qy * qw), 2 * (qy * qz - qx * qw), 1 - 2 * (qx * qx + qy * qy), 0, 0, 0, 0, 1];
  for (let c = 0; c < 3; c++) for (let k = 0; k < 3; k++) r[c * 4 + k] *= S[c];
  r[12] = T[0]; r[13] = T[1]; r[14] = T[2];
  return r;
}

/** A primitive's triangles as index triples into its own vertices (strips and fans turned into lists). */
function triangles(mode, idx, nv) {
  const n = idx ? idx.length : nv, at = idx ? (i) => idx[i] : (i) => i, out = [];
  if (mode === 4) for (let i = 0; i + 2 < n; i += 3) out.push(at(i), at(i + 1), at(i + 2));
  else if (mode === 5) for (let i = 0; i + 2 < n; i++) out.push(...(i % 2 ? [at(i + 1), at(i), at(i + 2)] : [at(i), at(i + 1), at(i + 2)]));
  else if (mode === 6) for (let i = 1; i + 1 < n; i++) out.push(at(0), at(i), at(i + 1));
  return out;
}
const triCount = (mode, n) => (mode === 4 ? Math.floor(n / 3) : mode === 5 || mode === 6 ? Math.max(0, n - 2) : 0);

export function readGlbModel(bytes, limits = {}) {
  const L = { ...GLB_LIMITS, ...limits };
  const { json, bin } = container(bytes, L);
  const notes = new Set();
  for (const e of Array.isArray(json.extensionsRequired) ? json.extensionsRequired : []) if (!HARMLESS.test(String(e))) fail('unsupported');
  // images: never decoded or kept; checked so an oversized texture is refused rather than carried
  const images = Array.isArray(json.images) ? json.images : [];
  if (images.length > L.images) fail('too-big');
  let imgBytes = 0;
  for (const im of images) {
    if (!isObj(im)) fail('bad-glb');
    if (im.uri !== undefined) { notes.add('external-image'); continue; }
    if (im.bufferView === undefined) continue;
    const b = viewBytes(json, bin, im.bufferView).bytes;
    imgBytes += b.length;
    if (imgBytes > L.imageBytes) fail('too-big');
    const sz = imageSize(b);
    if (!sz) { notes.add('image-unread'); continue; }
    if (sz.w > L.textureSide || sz.h > L.textureSide) fail('too-big');
  }
  const nodes = Array.isArray(json.nodes) ? json.nodes : [], meshes = Array.isArray(json.meshes) ? json.meshes : [];
  // the scene's root nodes (else every node that is no other node's child)
  let roots;
  const sc = json.scene ?? 0;
  if (Array.isArray(json.scenes) && isIdx(sc, json.scenes) && isObj(json.scenes[sc])) roots = Array.isArray(json.scenes[sc].nodes) ? json.scenes[sc].nodes : [];
  else { const child = new Set(nodes.flatMap((n) => (isObj(n) && Array.isArray(n.children) ? n.children : []))); roots = nodes.map((_, i) => i).filter((i) => !child.has(i)); }
  // first pass: what will be drawn (mesh, matrix), with the triangle count checked before any data is read
  const draws = [];
  let tris = 0, verts = 0, visits = 0;
  const walk = (ni, parent, depth, path) => {
    if (!isIdx(ni, nodes) || !isObj(nodes[ni])) fail('bad-glb');
    if (depth > L.depth || path.has(ni)) fail('bad-glb');
    if (++visits > L.nodes) fail('too-big');
    const n = nodes[ni], m = mul(parent, nodeMatrix(n));
    if (n.extensions && isObj(n.extensions) && n.extensions.EXT_mesh_gpu_instancing) fail('unsupported');
    if (n.mesh !== undefined) {
      const mesh = isIdx(n.mesh, meshes) && isObj(meshes[n.mesh]) ? meshes[n.mesh] : fail('bad-glb');
      for (const pr of Array.isArray(mesh.primitives) ? mesh.primitives : fail('bad-glb')) {
        if (!isObj(pr) || !isObj(pr.attributes)) fail('bad-glb');
        if (pr.extensions && isObj(pr.extensions) && Object.keys(pr.extensions).length) fail('unsupported');   // Draco and the like
        const mode = pr.mode ?? 4;
        if (![0, 1, 2, 3, 4, 5, 6].includes(mode)) fail('bad-glb');
        if (mode < 4) { notes.add('lines'); continue; }
        const pa = isIdx(pr.attributes.POSITION, json.accessors) ? json.accessors[pr.attributes.POSITION] : fail('bad-glb');
        const ia = pr.indices === undefined ? null : isIdx(pr.indices, json.accessors) ? json.accessors[pr.indices] : fail('bad-glb');
        const cnt = ia ? ia?.count : pa?.count;
        if (!Number.isInteger(cnt) || cnt < 0) fail('bad-glb');
        tris += triCount(mode, cnt);
        verts += Number.isInteger(pa?.count) ? pa.count : 0;
        if (tris > L.tris || verts > 3 * L.tris) fail('too-big');   // vertices too: a few indices into a huge position list is refused
        draws.push({ pr, m, mode });
      }
    }
    if (n.children !== undefined) {
      if (!Array.isArray(n.children)) fail('bad-glb');
      path.add(ni);
      for (const c of n.children) walk(c, m, depth + 1, path);
      path.delete(ni);
    }
  };
  for (const r of roots) walk(r, IDENT, 0, new Set());
  // second pass: read, transform, Y up → Z up
  const pos = [], ind = [];
  for (const { pr, m, mode } of draws) {
    const P = readAccessor(json, bin, pr.attributes.POSITION, 'pos'), nv = P.length / 3;
    const I = pr.indices === undefined ? null : readAccessor(json, bin, pr.indices, 'idx');
    if (I && I.some((v) => v >= nv)) fail('bad-glb');
    const base = pos.length / 3;
    for (let i = 0; i < nv; i++) {
      const x = P[i * 3], y = P[i * 3 + 1], z = P[i * 3 + 2];
      const X = m[0] * x + m[4] * y + m[8] * z + m[12], Y = m[1] * x + m[5] * y + m[9] * z + m[13], Z = m[2] * x + m[6] * y + m[10] * z + m[14];
      if (!fin(X) || !fin(Y) || !fin(Z)) fail('bad-glb');
      pos.push(X, -Z, Y);
    }
    const tri = triangles(mode, I, nv);
    const det = m[0] * (m[5] * m[10] - m[9] * m[6]) - m[4] * (m[1] * m[10] - m[9] * m[2]) + m[8] * (m[1] * m[6] - m[5] * m[2]);
    if (det < 0) for (let i = 0; i < tri.length; i += 3) { const k = tri[i + 1]; tri[i + 1] = tri[i + 2]; tri[i + 2] = k; }   // a mirrored node keeps its faces outward
    for (const v of tri) ind.push(base + v);
  }
  if (ind.length < 3) fail('empty');
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(ind), notes: [...notes] };
}
