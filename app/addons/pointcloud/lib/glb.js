/* SPDX-License-Identifier: Apache-2.0 */
/**
 * glb.js — a binary glTF 2.0 file (".glb", what Scaniverse, Polycam and many phone scanning apps export) read into one mesh (0.11 SU.1809).
 * DOM-free, no app imports, no third-party code.
 *
 *   readGlb(bytes) → { vertices: Float64Array(3n), colors: Uint8Array(3n)|null, triangles: Uint32Array(3m)|null, meshes: n, notes[] }
 *   Reads the default scene (else every scene), walks the node tree with each node's matrix or translation / rotation / scale, and puts the
 *   POSITION (and COLOR_0 when there is one) of every triangle, strip, fan and point primitive into one mesh. Accessors: every component type,
 *   `normalized`, byte strides, KHR_mesh_quantization's integer positions. NOT read: Draco and meshopt compressed primitives, sparse accessors,
 *   morph targets, skinning, textures (a texture is a picture, not points: the base colour factor is not used either); notes say which were
 *   met ('glb_draco', 'glb_meshopt', 'glb_sparse', 'glb_textured'). Throws 'glb_bad' for a file that is not a GLB or is cut short.
 *
 * Source: the Khronos glTF 2.0 specification (section 4, "GLB File Format Specification": 12-byte header "glTF", version 2, length; chunks of
 * [length, type, data], JSON 0x4E4F534A then BIN 0x004E4942; section 3 for accessors, nodes and the TRS composition M = T * R * S;
 * section 5.x data layouts). Checked on real files, see bin/test-pointcloud-formats.mjs.
 */
const TD = new TextDecoder();
const fail = (code, data) => { throw Object.assign(new Error('glb: ' + code), { name: 'PcError', code, data }); };
const COMP = { 5120: [1, 'getInt8', 127], 5121: [1, 'getUint8', 255], 5122: [2, 'getInt16', 32767], 5123: [2, 'getUint16', 65535], 5125: [4, 'getUint32', 1], 5126: [4, 'getFloat32', 1] };
const NCOMP = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 };

export function readGlb(input) {
  const u8 = input instanceof Uint8Array ? input : new Uint8Array(input);
  if (u8.length < 20) fail('glb_bad', { why: 'short' });
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  if (dv.getUint32(0, true) !== 0x46546C67 || dv.getUint32(4, true) !== 2) fail('glb_bad', { why: 'magic_or_version' });
  const total = Math.min(dv.getUint32(8, true), u8.length);
  let p = 12, json = null, bin = null;
  while (p + 8 <= total) {
    const len = dv.getUint32(p, true), type = dv.getUint32(p + 4, true), s = p + 8;
    if (s + len > u8.length) fail('glb_bad', { why: 'chunk' });
    if (type === 0x4E4F534A && !json) json = JSON.parse(TD.decode(u8.subarray(s, s + len)));
    else if (type === 0x004E4942 && !bin) bin = u8.subarray(s, s + len);
    p = s + ((len + 3) & ~3);
  }
  if (!json) fail('glb_bad', { why: 'no_json' });
  const notes = new Set();
  const bv = json.bufferViews || [], acc = json.accessors || [];
  const usedExt = json.extensionsUsed || [];
  if (usedExt.includes('KHR_draco_mesh_compression')) notes.add('glb_draco');
  if (usedExt.includes('EXT_meshopt_compression') || usedExt.includes('KHR_meshopt_compression')) notes.add('glb_meshopt');

  /** An accessor read into a Float64Array (count * ncomp), applying normalized. Returns null when it cannot be read. */
  function read(ai, wantNorm = true) {
    const a = acc[ai];
    if (!a || a.sparse && !a.bufferView) { notes.add('glb_sparse'); return null; }
    if (a.sparse) notes.add('glb_sparse');
    const c = COMP[a.componentType], nc = NCOMP[a.type];
    if (!c || !nc || a.bufferView == null) return null;
    const v = bv[a.bufferView];
    if (!v || v.extensions) return null;   // meshopt / compressed views
    if (v.buffer !== 0 || !bin) return null;   // an external or missing buffer: a .glb holds buffer 0 only
    const base = (v.byteOffset || 0) + (a.byteOffset || 0), stride = v.byteStride || c[0] * nc, n = a.count;
    if (!(n >= 0) || n > 5e8 || base + (n > 0 ? (n - 1) * stride + c[0] * nc : 0) > bin.length) fail('glb_bad', { why: 'accessor_range', accessor: ai });
    const d = new DataView(bin.buffer, bin.byteOffset, bin.byteLength), out = new Float64Array(n * nc), k = a.normalized && wantNorm ? 1 / c[2] : 1;
    for (let i = 0; i < n; i++) for (let j = 0; j < nc; j++) { const x = d[c[1]](base + i * stride + j * c[0], true) * k; out[i * nc + j] = a.normalized && wantNorm && x < -1 ? -1 : x; }
    return { data: out, nc, n };
  }

  // column-major 4x4 (glTF's own layout), M applied to a column vector
  const I4 = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const mul = (a, b) => { const r = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 4; k++) r[c * 4 + rr] += a[k * 4 + rr] * b[c * 4 + k]; return r; };
  const local = (nd) => {
    if (Array.isArray(nd.matrix) && nd.matrix.length === 16) return nd.matrix.slice();
    const t = nd.translation || [0, 0, 0], q = nd.rotation || [0, 0, 0, 1], s = nd.scale || [1, 1, 1];
    const [x, y, z, w] = q, n = Math.hypot(x, y, z, w) || 1, X = x / n, Y = y / n, Z = z / n, W = w / n;
    const R = [1 - 2 * (Y * Y + Z * Z), 2 * (X * Y + Z * W), 2 * (X * Z - Y * W), 0, 2 * (X * Y - Z * W), 1 - 2 * (X * X + Z * Z), 2 * (Y * Z + X * W), 0, 2 * (X * Z + Y * W), 2 * (Y * Z - X * W), 1 - 2 * (X * X + Y * Y), 0, 0, 0, 0, 1];
    return [R[0] * s[0], R[1] * s[0], R[2] * s[0], 0, R[4] * s[1], R[5] * s[1], R[6] * s[1], 0, R[8] * s[2], R[9] * s[2], R[10] * s[2], 0, t[0], t[1], t[2], 1];
  };

  const V = [], C = [], T = [];
  let anyColour = false, meshes = 0;
  function emit(prim, M) {
    if (prim.extensions && prim.extensions.KHR_draco_mesh_compression) { notes.add('glb_draco'); return; }
    if (prim.extensions && prim.extensions.EXT_meshopt_compression) { notes.add('glb_meshopt'); return; }
    const pa = prim.attributes && prim.attributes.POSITION;
    if (pa == null) return;
    const P = read(pa);
    if (!P || P.nc !== 3) { notes.add('glb_unreadable_primitive'); return; }
    const base = V.length / 3, nv = P.n;
    for (let i = 0; i < nv; i++) {
      const x = P.data[3 * i], y = P.data[3 * i + 1], z = P.data[3 * i + 2];
      V.push(M[0] * x + M[4] * y + M[8] * z + M[12], M[1] * x + M[5] * y + M[9] * z + M[13], M[2] * x + M[6] * y + M[10] * z + M[14]);
    }
    const ca = prim.attributes.COLOR_0, col = ca != null ? read(ca) : null;
    for (let i = 0; i < nv; i++) {
      if (col && col.n === nv && col.nc >= 3) { anyColour = true; for (let j = 0; j < 3; j++) C.push(Math.round(Math.min(1, Math.max(0, col.data[col.nc * i + j])) * 255)); } else C.push(-1, -1, -1);
    }
    if (prim.material != null && (json.materials || [])[prim.material]?.pbrMetallicRoughness?.baseColorTexture && !col) notes.add('glb_textured');
    const mode = prim.mode == null ? 4 : prim.mode;
    if (mode === 0) { meshes++; return; }   // points: vertices only
    if (mode < 4 || mode > 6) return;       // lines
    let idx;
    if (prim.indices != null) { const r = read(prim.indices, false); if (!r) { notes.add('glb_unreadable_primitive'); return; } idx = r.data; } else { idx = new Float64Array(nv); for (let i = 0; i < nv; i++) idx[i] = i; }
    const tri = (a, b, c) => { if (a < nv && b < nv && c < nv && a !== b && b !== c && a !== c) T.push(base + a, base + b, base + c); };
    if (mode === 4) for (let i = 0; i + 2 < idx.length; i += 3) tri(idx[i], idx[i + 1], idx[i + 2]);
    else if (mode === 5) for (let i = 0; i + 2 < idx.length; i++) (i & 1) ? tri(idx[i + 1], idx[i], idx[i + 2]) : tri(idx[i], idx[i + 1], idx[i + 2]);
    else for (let i = 1; i + 1 < idx.length; i++) tri(idx[0], idx[i], idx[i + 1]);
    meshes++;
  }
  const seen = new Set();
  function walk(ni, parent, depth) {
    const nd = (json.nodes || [])[ni];
    if (!nd || depth > 256 || seen.has(ni)) return;   // a cycle is a damaged file: stop
    seen.add(ni);
    const M = mul(parent, local(nd));
    if (nd.mesh != null) for (const prim of ((json.meshes || [])[nd.mesh] || {}).primitives || []) emit(prim, M);
    if (nd.skin != null) notes.add('glb_skinned');
    for (const c of nd.children || []) walk(c, M, depth + 1);
    seen.delete(ni);
  }
  const scenes = json.scenes || [];
  const roots = scenes.length ? (scenes[json.scene != null ? json.scene : 0] || scenes[0]).nodes || [] : (json.nodes || []).map((_, i) => i);
  for (const r of roots) walk(r, I4(), 0);
  if (!meshes) fail('glb_no_mesh', { notes: [...notes] });
  let colors = null;
  if (anyColour) { colors = new Uint8Array(C.length); for (let i = 0; i < C.length; i++) colors[i] = C[i] < 0 ? 160 : C[i]; }
  return { vertices: Float64Array.from(V), colors, triangles: T.length ? Uint32Array.from(T) : null, meshes, notes: [...notes] };
}
