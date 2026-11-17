/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mesh-sample.js — what phone scanning apps export, read into points (0.10 SU.1809). DOM-free, no app imports, no third-party code.
 *
 *   readPly(bytes) → { vertices: Float64Array(3n), colors: Uint8Array(3n)|null, normals?, triangles: Uint32Array(3m)|null, notes[] }
 *       PLY (the Stanford format; ascii, binary_little_endian, binary_big_endian), `vertex` element with x y z, optional red/green/blue (or
 *       diffuse_*), nx ny nz; `face` element with a list property (vertex_indices | vertex_index), polygons cut into triangles.
 *       Other elements and properties are skipped by their declared size.
 *   readObj(text) → same shape: v x y z [r g b] (the common colour extension, 0 to 1 or 0 to 255), f with v, v/vt, v//vn, v/vt/vn, negative
 *       indexes, polygons fanned; everything else ignored. Notes say what was skipped.
 *   readUsdz(bytes) → { entries: [{ name, bytes }], mesh | null, notes[] }
 *       A USDZ is an uncompressed zip. The meshes inside are read when they are PLY/OBJ files or USDA text; a USDC (binary crate) file is
 *       named in notes and NOT read (code 'usdc_unsupported' on .mesh === null && .usdc), see the help topic.
 *   sampleSurface(mesh, { spacing, budget, seed }) → { n, pos: Float64Array(3n), rgb: Uint8Array(3n)|null, area }
 *       points spread evenly over the triangles (about one per spacing², at most `budget`), with the colour taken from the vertices
 *       (barycentric blend); a mesh with no triangles gives its vertices. Deterministic for a seed.
 *   unitHint(extent) / see scan-check.js for scale, up axis and level.
 *
 * What these formats are, from their own documentation rather than assumed: PLY — Paul Bourke's PLY description (the reference for the
 * header grammar and the scalar type names); Wavefront OBJ — the Alias|Wavefront "Object Files (.obj)" appendix; USDZ — Pixar's USDZ file
 * format specification (a zip, stored not deflated, files 64-byte aligned). A phone app's real export was not available to the build
 * (docs/0.10-sessions/pointcloud-10.md): the readers take the formats as documented, and the tests use files WE wrote in those formats.
 */
const TD = new TextDecoder();
const fail = (code, data) => { throw Object.assign(new Error('mesh: ' + code), { name: 'PcError', code, data }); };

const PLY_TYPES = {
  char: [1, 'getInt8'], int8: [1, 'getInt8'], uchar: [1, 'getUint8'], uint8: [1, 'getUint8'], short: [2, 'getInt16'], int16: [2, 'getInt16'],
  ushort: [2, 'getUint16'], uint16: [2, 'getUint16'], int: [4, 'getInt32'], int32: [4, 'getInt32'], uint: [4, 'getUint32'], uint32: [4, 'getUint32'],
  float: [4, 'getFloat32'], float32: [4, 'getFloat32'], double: [8, 'getFloat64'], float64: [8, 'getFloat64'],
};

export function readPly(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  // the header ends at the line "end_header" (LF or CRLF)
  const probe = TD.decode(u8.subarray(0, Math.min(u8.length, 65536)));
  const m = /end_header\r?\n/.exec(probe);
  if (!probe.startsWith('ply') || !m) fail('ply_header');
  const dataStart = m.index + m[0].length, lines = probe.slice(0, m.index).split(/\r?\n/);
  let format = '', els = [], cur = null;
  const notes = [];
  for (const ln of lines) {
    const w = ln.trim().split(/\s+/);
    if (w[0] === 'format') format = w[1];
    else if (w[0] === 'element') { cur = { name: w[1], count: Number(w[2]), props: [] }; els.push(cur); }
    else if (w[0] === 'property' && cur) {
      if (w[1] === 'list') cur.props.push({ list: true, cnt: w[2], type: w[3], name: w[4] });
      else cur.props.push({ type: w[1], name: w[2] });
    }
  }
  if (!['ascii', 'binary_little_endian', 'binary_big_endian'].includes(format)) fail('ply_format', { format });
  const vel = els.find((e) => e.name === 'vertex');
  if (!vel || !(vel.count >= 0)) fail('ply_no_vertices');
  const pi = (n, ...alt) => vel.props.findIndex((p) => [n, ...alt].includes(p.name));
  const ix = pi('x'), iy = pi('y'), iz = pi('z'), ir = pi('red', 'diffuse_red', 'r'), ig = pi('green', 'diffuse_green', 'g'), ib = pi('blue', 'diffuse_blue', 'b');
  if (ix < 0 || iy < 0 || iz < 0) fail('ply_no_xyz');
  const colour = ir >= 0 && ig >= 0 && ib >= 0;
  const V = new Float64Array(3 * vel.count), C = colour ? new Uint8Array(3 * vel.count) : null;
  const fel = els.find((e) => e.name === 'face');
  const tris = [];
  const addFace = (idx) => { for (let k = 1; k + 1 < idx.length; k++) tris.push(idx[0], idx[k], idx[k + 1]); };
  const colScale = (p) => (/^(float|double|float32|float64)$/.test(p.type) ? 255 : 1);
  if (format === 'ascii') {
    const txt = TD.decode(u8.subarray(dataStart)).split(/\r?\n/);
    let li = 0;
    for (const e of els) {
      for (let r = 0; r < e.count; r++) {
        const w = (txt[li++] || '').trim().split(/\s+/);
        if (e === vel) {
          V[3 * r] = Number(w[ix]); V[3 * r + 1] = Number(w[iy]); V[3 * r + 2] = Number(w[iz]);
          if (colour) { C[3 * r] = Number(w[ir]) * colScale(vel.props[ir]); C[3 * r + 1] = Number(w[ig]) * colScale(vel.props[ig]); C[3 * r + 2] = Number(w[ib]) * colScale(vel.props[ib]); }
        } else if (e === fel) {
          const lp = e.props.findIndex((p) => p.list && /^vertex_?ind/.test(p.name));
          let o = 0, idx = null;
          for (let k = 0; k < e.props.length; k++) {
            if (e.props[k].list) { const n = Number(w[o++]); const a = []; for (let j = 0; j < n; j++) a.push(Number(w[o++])); if (k === lp) idx = a; } else o++;
          }
          if (idx) addFace(idx);
        }
      }
    }
  } else {
    const le = format === 'binary_little_endian', dv = new DataView(u8.buffer, u8.byteOffset + dataStart, u8.length - dataStart);
    let o = 0;
    const rd = (type) => { const t = PLY_TYPES[type]; if (!t) fail('ply_type', { type }); const v = dv[t[1]](o, le); o += t[0]; return v; };
    for (const e of els) {
      for (let r = 0; r < e.count; r++) {
        if (o > dv.byteLength) fail('ply_truncated');
        const vals = [];
        let idx = null;
        for (const p of e.props) {
          if (p.list) { const n = rd(p.cnt), a = []; for (let j = 0; j < n; j++) a.push(rd(p.type)); if (e === fel && /^vertex_?ind/.test(p.name)) idx = a; vals.push(null); } else vals.push(rd(p.type));
        }
        if (e === vel) {
          V[3 * r] = vals[ix]; V[3 * r + 1] = vals[iy]; V[3 * r + 2] = vals[iz];
          if (colour) { C[3 * r] = vals[ir] * colScale(vel.props[ir]); C[3 * r + 1] = vals[ig] * colScale(vel.props[ig]); C[3 * r + 2] = vals[ib] * colScale(vel.props[ib]); }
        } else if (idx) addFace(idx);
      }
    }
  }
  if (!fel || !tris.length) notes.push('no_faces');
  return { vertices: V, colors: C, triangles: tris.length ? Uint32Array.from(tris) : null, notes };
}

export function readObj(text) {
  const V = [], C = [], T = [], notes = new Set();
  let anyColour = false;
  for (const raw of text.split(/\r?\n/)) {
    const ln = raw.trim();
    if (!ln || ln[0] === '#') continue;
    const w = ln.split(/\s+/);
    if (w[0] === 'v') {
      V.push(Number(w[1]), Number(w[2]), Number(w[3]));
      if (w.length >= 7) { anyColour = true; C.push(Number(w[4]), Number(w[5]), Number(w[6])); } else C.push(-1, -1, -1);
    } else if (w[0] === 'f') {
      const n = V.length / 3, idx = w.slice(1).map((s) => { const k = parseInt(s.split('/')[0], 10); return k < 0 ? n + k : k - 1; });
      if (idx.some((k) => !(k >= 0 && k < n))) { notes.add('bad_index'); continue; }
      for (let k = 1; k + 1 < idx.length; k++) T.push(idx[0], idx[k], idx[k + 1]);
    } else if (w[0] === 'mtllib' || w[0] === 'usemtl' || w[0] === 'vt') notes.add('materials_and_textures_ignored');
  }
  if (!V.length) fail('obj_no_vertices');
  let colors = null;
  if (anyColour) {
    const max = C.reduce((m, v) => Math.max(m, v), 0), k = max <= 1 ? 255 : 1;
    colors = Uint8Array.from(C, (v) => (v < 0 ? 128 : Math.round(v * k)));
  }
  if (!T.length) notes.add('no_faces');
  return { vertices: Float64Array.from(V), colors, triangles: T.length ? Uint32Array.from(T) : null, notes: [...notes] };
}

/** A zip's stored entries by the central directory (USDZ never deflates). Entries that are compressed are listed with `bytes: null`. */
export function readZip(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes), dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  let e = -1;
  for (let i = u8.length - 22; i >= Math.max(0, u8.length - 22 - 65535); i--) if (dv.getUint32(i, true) === 0x06054b50) { e = i; break; }
  if (e < 0) fail('zip_not_zip');
  const n = dv.getUint16(e + 10, true); let p = dv.getUint32(e + 16, true);
  const out = [];
  for (let i = 0; i < n; i++) {
    if (dv.getUint32(p, true) !== 0x02014b50) fail('zip_bad_directory');
    const method = dv.getUint16(p + 10, true), size = dv.getUint32(p + 24, true), nl = dv.getUint16(p + 28, true), xl = dv.getUint16(p + 30, true), cl = dv.getUint16(p + 32, true), lh = dv.getUint32(p + 42, true);
    const name = TD.decode(u8.subarray(p + 46, p + 46 + nl));
    p += 46 + nl + xl + cl;
    const lnl = dv.getUint16(lh + 26, true), lxl = dv.getUint16(lh + 28, true), s = lh + 30 + lnl + lxl;
    out.push({ name, method, bytes: method === 0 ? u8.subarray(s, s + size) : null });
  }
  return out;
}

/** USDA text (the readable USD): `point3f[] points`, `int[] faceVertexCounts`, `int[] faceVertexIndices`; ONE mesh's arrays, no transforms. */
function readUsda(text) {
  const arr = (name) => { const m = new RegExp(name + '\\s*=\\s*\\[([^\\]]*)\\]').exec(text); return m ? m[1] : null; };
  const pts = arr('point3f\\[\\]\\s+points'), cnt = arr('int\\[\\]\\s+faceVertexCounts'), idx = arr('int\\[\\]\\s+faceVertexIndices');
  if (!pts || !idx) return null;
  const nums = (s) => s.replace(/[()]/g, ' ').split(/[\s,]+/).filter(Boolean).map(Number);
  const V = Float64Array.from(nums(pts)), I = nums(idx), Cn = cnt ? nums(cnt) : null, T = [];
  let o = 0;
  for (const c of (Cn || Array(I.length / 3).fill(3))) { for (let k = 1; k + 1 < c; k++) T.push(I[o], I[o + k], I[o + k + 1]); o += c; }
  return { vertices: V, colors: null, triangles: Uint32Array.from(T), notes: [] };
}

export function readUsdz(bytes) {
  const entries = readZip(bytes), notes = [];
  const find = (re) => entries.find((e) => re.test(e.name) && e.bytes);
  let mesh = null;
  const ply = find(/\.ply$/i), obj = find(/\.obj$/i), usda = find(/\.usda$/i);
  if (ply) mesh = readPly(ply.bytes); else if (obj) mesh = readObj(TD.decode(obj.bytes)); else if (usda) mesh = readUsda(TD.decode(usda.bytes));
  const usdc = entries.some((e) => /\.usdc$/i.test(e.name));
  if (!mesh && usdc) notes.push('usdc_unsupported');
  if (entries.some((e) => e.method !== 0)) notes.push('compressed_entries');
  return { entries: entries.map((e) => ({ name: e.name, size: e.bytes ? e.bytes.length : null })), mesh, usdc, notes };
}

function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }

export function sampleSurface(mesh, { spacing = 0.02, budget = 5e6, seed = 1 } = {}) {
  const V = mesh.vertices, C = mesh.colors, T = mesh.triangles, nv = V.length / 3;
  if (!T) {
    const n = Math.min(nv, budget);
    const pos = V.length / 3 <= n ? V : V.subarray(0, 3 * n);
    return { n, pos: Float64Array.from(pos), rgb: C ? Uint8Array.from(C.subarray(0, 3 * n)) : null, area: 0 };
  }
  const nt = T.length / 3, area = new Float64Array(nt);
  let total = 0;
  for (let t = 0; t < nt; t++) {
    const a = 3 * T[3 * t], b = 3 * T[3 * t + 1], c = 3 * T[3 * t + 2];
    const ux = V[b] - V[a], uy = V[b + 1] - V[a + 1], uz = V[b + 2] - V[a + 2], vx = V[c] - V[a], vy = V[c + 1] - V[a + 1], vz = V[c + 2] - V[a + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
    area[t] = 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz); total += area[t];
  }
  const want = Math.min(budget, Math.max(nt, Math.round(total / (spacing * spacing)))), r = rng(seed);
  const pos = new Float64Array(3 * want), rgb = C ? new Uint8Array(3 * want) : null;
  let k = 0, carry = 0;
  for (let t = 0; t < nt && k < want; t++) {
    // expected points on this triangle; the fraction is carried so the total is `want`
    const e = area[t] / total * want + carry, m = Math.floor(e); carry = e - m;
    const a = 3 * T[3 * t], b = 3 * T[3 * t + 1], c = 3 * T[3 * t + 2];
    for (let j = 0; j < m && k < want; j++, k++) {
      let u = r(), v = r(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
      const w = 1 - u - v;
      for (let q = 0; q < 3; q++) pos[3 * k + q] = w * V[a + q] + u * V[b + q] + v * V[c + q];
      if (rgb) for (let q = 0; q < 3; q++) rgb[3 * k + q] = Math.round(w * C[a + q] + u * C[b + q] + v * C[c + q]);
    }
  }
  return { n: k, pos: k === want ? pos : pos.slice(0, 3 * k), rgb: rgb && (k === want ? rgb : rgb.slice(0, 3 * k)), area: total };
}
