/* SPDX-License-Identifier: Apache-2.0 */
/**
 * illustrate-fixtures.mjs — small products for the Illustrate tests (session `illustrate`): meshes made here, no kernel.
 *   box(w, h, d, [cx, cy, cz])  a closed box mesh (outward triangles)
 *   cylinder(r, h, n)           a closed cylinder along Y, n sides
 *   product()                   { parts, instances, groups, explodes } — a base plate, two posts (one part, two copies),
 *                               a cap and a pin, the posts and cap in a sub-assembly, one exploded view
 */

export function box(w, h, d, c = [0, 0, 0]) {
  const x0 = c[0] - w / 2, x1 = c[0] + w / 2, y0 = c[1] - h / 2, y1 = c[1] + h / 2, z0 = c[2] - d / 2, z1 = c[2] + d / 2;
  const positions = Float32Array.from([x0, y0, z0, x1, y0, z0, x1, y1, z0, x0, y1, z0, x0, y0, z1, x1, y0, z1, x1, y1, z1, x0, y1, z1]);
  const indices = Uint32Array.from([
    0, 2, 1, 0, 3, 2, // back (−z)
    4, 5, 6, 4, 6, 7, // front (+z)
    0, 1, 5, 0, 5, 4, // bottom (−y)
    3, 7, 6, 3, 6, 2, // top (+y)
    0, 4, 7, 0, 7, 3, // left (−x)
    1, 2, 6, 1, 6, 5, // right (+x)
  ]);
  return { positions, indices };
}

export function cylinder(r, h, n = 24, c = [0, 0, 0]) {
  const pos = [], idx = [];
  for (let i = 0; i < n; i++) {
    const a = 2 * Math.PI * i / n;
    pos.push(c[0] + r * Math.cos(a), c[1] - h / 2, c[2] + r * Math.sin(a), c[0] + r * Math.cos(a), c[1] + h / 2, c[2] + r * Math.sin(a));
  }
  const bot = pos.length / 3; pos.push(c[0], c[1] - h / 2, c[2]);
  const top = pos.length / 3; pos.push(c[0], c[1] + h / 2, c[2]);
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n, a = 2 * i, b = 2 * j;
    idx.push(a, a + 1, b + 1, a, b + 1, b);   // side, outward
    idx.push(bot, a, b);                      // bottom (−y)
    idx.push(top, b + 1, a + 1);              // top (+y)
  }
  return { positions: Float32Array.from(pos), indices: Uint32Array.from(idx) };
}

const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

export function product() {
  return {
    parts: {
      plate: { name: 'Base plate', number: 'BP-100', description: 'Steel base', material: 'Steel', density: 7.85, mesh: box(120, 10, 80) },
      post: { name: 'Post', number: 'PS-20', material: 'Aluminium', density: 2.7, mesh: cylinder(6, 40, 24) },
      cap: { name: 'Cap', number: 'CP-1', material: 'Acetal', density: 1.41, mesh: box(100, 6, 30) },
      pin: { name: 'Pin', number: 'PN-3', mesh: cylinder(2, 20, 12) },
    },
    groups: [{ id: 'g1', name: 'Frame', parent: null }, { id: 'g2', name: 'Posts', parent: 'g1' }],
    instances: [
      { id: 'i1', part: 'plate', name: 'Base plate', matrix: T(0, 5, 0) },
      { id: 'i2', part: 'post', name: 'Post <1>', group: 'g2', matrix: T(-40, 30, 0) },
      { id: 'i3', part: 'post', name: 'Post <2>', group: 'g2', matrix: T(40, 30, 0) },
      { id: 'i4', part: 'cap', name: 'Cap', group: 'g1', matrix: T(0, 53, 0) },
      { id: 'i5', part: 'pin', name: 'Pin', matrix: T(0, 66, 0) },
    ],
    explodes: [{ id: 'v1', name: 'Exploded 1', steps: [{ insts: ['i5'], dir: [0, 1, 0], dist: 40 }, { insts: ['i4', 'i5'], dir: [0, 1, 0], dist: 30 }] }],
  };
}

// ---------------------------------------------------------------------------------------------- files in each format
/** A GLB (or, with { embedded: true }, a .gltf JSON with a data: buffer) of [{ name, mesh (index into meshes), m (16) | trs,
 *  children }] nodes over meshes [{ name, mesh }] (metres). */
export function gltf(meshes, nodes, { embedded = false, scale = 0.001 } = {}) {
  const bufs = [], json = { asset: { version: '2.0' }, scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [] };
  let off = 0;
  const view = (arr) => { const b = new Uint8Array(arr.buffer.slice(0)); bufs.push(b); json.bufferViews.push({ buffer: 0, byteOffset: off, byteLength: b.length }); off += b.length; while (off % 4) { bufs.push(new Uint8Array(1)); off++; } return json.bufferViews.length - 1; };
  for (const m of meshes) {
    const P = Float32Array.from(m.mesh.positions, (v) => v * scale);
    const pv = view(P), iv = view(Uint32Array.from(m.mesh.indices));
    json.accessors.push({ bufferView: pv, componentType: 5126, count: P.length / 3, type: 'VEC3' }, { bufferView: iv, componentType: 5125, count: m.mesh.indices.length, type: 'SCALAR' });
    json.meshes.push({ name: m.name, primitives: [{ attributes: { POSITION: json.accessors.length - 2 }, indices: json.accessors.length - 1 }] });
  }
  const add = (n) => {
    const i = json.nodes.length; const node = { name: n.name }; json.nodes.push(node);
    if (n.mesh !== undefined) node.mesh = n.mesh;
    if (n.m) node.matrix = n.m;
    if (n.t) node.translation = n.t;
    if (n.r) node.rotation = n.r;
    if (n.children) node.children = n.children.map(add);
    return i;
  };
  json.scenes[0].nodes = nodes.map(add);
  const bin = new Uint8Array(off); let o = 0; for (const b of bufs) { bin.set(b, o); o += b.length; }
  if (embedded) { json.buffers.push({ byteLength: bin.length, uri: 'data:application/octet-stream;base64,' + Buffer.from(bin).toString('base64') }); return new TextEncoder().encode(JSON.stringify(json)); }
  json.buffers.push({ byteLength: bin.length });
  let js = new TextEncoder().encode(JSON.stringify(json));
  const pad = (4 - js.length % 4) % 4; js = Uint8Array.from([...js, ...Array(pad).fill(32)]);
  const total = 12 + 8 + js.length + 8 + bin.length;
  const out = new Uint8Array(total), dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true);
  dv.setUint32(12, js.length, true); dv.setUint32(16, 0x4e4f534a, true); out.set(js, 20);
  dv.setUint32(20 + js.length, bin.length, true); dv.setUint32(24 + js.length, 0x004e4942, true); out.set(bin, 28 + js.length);
  return out;
}
/** OBJ text: [{ name, mesh, at: [x,y,z] }] (positions moved by at). */
export function obj(objects) {
  const lines = ['# test'];
  let base = 1;
  for (const o of objects) {
    lines.push('o ' + o.name);
    const P = o.mesh.positions;
    for (let i = 0; i < P.length; i += 3) lines.push(`v ${P[i] + o.at[0]} ${P[i + 1] + o.at[1]} ${P[i + 2] + o.at[2]}`);
    for (let k = 0; k < o.mesh.indices.length; k += 3) lines.push(`f ${o.mesh.indices[k] + base} ${o.mesh.indices[k + 1] + base} ${o.mesh.indices[k + 2] + base}`);
    base += P.length / 3;
  }
  return new TextEncoder().encode(lines.join('\n') + '\n');
}
/** Binary STL of meshes, each moved by its matrix (column-major 16). */
export function stl(items) {
  const tris = [];
  for (const it of items) {
    const P = it.mesh.positions, I = it.mesh.indices, M = it.m;
    const tp = (i) => [M[0] * P[i * 3] + M[4] * P[i * 3 + 1] + M[8] * P[i * 3 + 2] + M[12], M[1] * P[i * 3] + M[5] * P[i * 3 + 1] + M[9] * P[i * 3 + 2] + M[13], M[2] * P[i * 3] + M[6] * P[i * 3 + 1] + M[10] * P[i * 3 + 2] + M[14]];
    for (let k = 0; k < I.length; k += 3) tris.push([tp(I[k]), tp(I[k + 1]), tp(I[k + 2])]);
  }
  const out = new Uint8Array(84 + 50 * tris.length), dv = new DataView(out.buffer);
  out.set(new TextEncoder().encode('Two brackets'), 0);
  dv.setUint32(80, tris.length, true);
  tris.forEach((t, k) => { for (let c = 0; c < 3; c++) for (let j = 0; j < 3; j++) dv.setFloat32(84 + 50 * k + 12 + c * 12 + j * 4, t[c][j], true); });
  return out;
}
/** A stored (uncompressed) zip of [{ name, data (string | Uint8Array) }] — APPNOTE local headers + central directory. */
export function zip(files) {
  const enc = new TextEncoder(), parts = [], central = [];
  let off = 0;
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  for (const f of files) {
    const data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, name = enc.encode(f.name);
    const h = new Uint8Array(30 + name.length), dv = new DataView(h.buffer);
    dv.setUint32(0, 0x04034b50, true); dv.setUint16(4, 20, true); dv.setUint32(14, crc(data), true); dv.setUint32(18, data.length, true); dv.setUint32(22, data.length, true); dv.setUint16(26, name.length, true); h.set(name, 30);
    const c = new Uint8Array(46 + name.length), cv = new DataView(c.buffer);
    cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint32(16, crc(data), true); cv.setUint32(20, data.length, true); cv.setUint32(24, data.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, off, true); c.set(name, 46);
    parts.push(h, data); central.push(c); off += h.length + data.length;
  }
  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const e = new Uint8Array(22), ev = new DataView(e.buffer);
  ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, files.length, true); ev.setUint16(10, files.length, true); ev.setUint32(12, cdSize, true); ev.setUint32(16, off, true);
  const all = [...parts, ...central, e], out = new Uint8Array(all.reduce((s, b) => s + b.length, 0));
  let o = 0; for (const b of all) { out.set(b, o); o += b.length; }
  return out;
}
/** A 3MF: one mesh object placed by build items [{ transform: '12 numbers' }] in `unit`, plus a two-component object. */
export function threeMf({ unit = 'millimeter', items = [] } = {}) {
  const b = box(10, 20, 30), c = cylinder(3, 8, 8);
  const mesh = (m) => '<mesh><vertices>' + Array.from({ length: m.positions.length / 3 }, (_, i) => `<vertex x="${m.positions[i * 3]}" y="${m.positions[i * 3 + 1]}" z="${m.positions[i * 3 + 2]}"/>`).join('') + '</vertices><triangles>' + Array.from({ length: m.indices.length / 3 }, (_, k) => `<triangle v1="${m.indices[k * 3]}" v2="${m.indices[k * 3 + 1]}" v3="${m.indices[k * 3 + 2]}"/>`).join('') + '</triangles></mesh>';
  const model = `<?xml version="1.0" encoding="UTF-8"?><model unit="${unit}" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>`
    + `<object id="1" name="Block" type="model">${mesh(b)}</object><object id="2" name="Peg" type="model">${mesh(c)}</object>`
    + '<object id="3" name="Block with pegs" type="model"><components><component objectid="1"/><component objectid="2" transform="1 0 0 0 1 0 0 0 1 0 0 19"/><component objectid="2" transform="1 0 0 0 1 0 0 0 1 0 0 -19"/></components></object>'
    + '</resources><build>' + items.map((it) => `<item objectid="${it.id || 1}"${it.transform ? ` transform="${it.transform}"` : ''}/>`).join('') + '</build></model>';
  return zip([
    { name: '[Content_Types].xml', data: '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>' },
    { name: '_rels/.rels', data: '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>' },
    { name: '3D/3dmodel.model', data: model },
  ]);
}
