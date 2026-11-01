/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a file format and developer messages; the words a person reads come from the caller (gen-ui.js maps `code`) */
/**
 * vdb.js — the field as an OpenVDB level set (.vdb), DOM-free, the same bytes in Node and in a page (rule D2).
 *
 *   toVDB(grid, { name, maxBytes }) → Uint8Array      one FloatGrid, class "level set", tree 5-4-3, voxel size h (world units = the
 *                                                     part's millimetres), background +band·h, active voxels = the narrow band
 *   vdbSize(grid) → number                            an upper bound on the file size in bytes (the caller can refuse first)
 *
 * Format: OpenVDB file format 224 as OpenVDB 12.1.0 (Apache-2.0) writes it — io/Archive.cc (header, grid descriptors, stream positions,
 * grid compression word), MetaMap.cc / Metadata.h (metadata), math/Maps.h (UniformScaleMap), tree/RootNode.h, tree/InternalNode.h,
 * tree/LeafNode.h (topology then buffers), util/NodeMasks.h (masks as 64-bit words), io/Compression.h (active-mask compression: a
 * metadata byte per node, the active values, and when needed a selection mask). Read for the layout, written here from scratch.
 * Data compression is COMPRESS_ACTIVE_MASK only: no zlib or Blosc, so no library is needed and every reader can open it.
 *
 * How our grid maps onto the tree. Our bricks of 8³ ARE VDB leaves (the same world lattice x = i·h, so VDB's index (i, j, k) is ours).
 * A brick that holds values → a leaf. An INSIDE brick → an inactive tile of −background in its 16³ internal node; an absent brick →
 * +background (outside), which is what a level set's tiles and background mean. Our brick arrays are x-fastest
 * (n = x | y<<3 | z<<6); VDB's are z-fastest (n = x<<6 | y<<3 | z), so values are reordered on the way out.
 * Nothing reads the clock: the 36-character file id that OpenVDB fills with random bytes is a fingerprint of the content here.
 */
import { INSIDE, BN, brickOf } from './grid.js';
import { fingerprint } from './grid.js';

export const VDB_FILE_VERSION = 224;                    // OPENVDB_FILE_VERSION in 12.1.0 (225 adds half grids, which we never write)
const LIB_MAJOR = 12, LIB_MINOR = 1;                    // the library whose format this follows (readers use it only for old-format branches)
const MAGIC = 0x56444220;                               // "VDB " (OPENVDB_MAGIC), written as a 64-bit integer
const COMPRESS_ACTIVE_MASK = 0x2;
const TREE_TYPE = 'Tree_float_5_4_3';
// io/Compression.h: what a node's metadata byte says about its inactive values
const NO_MASK_OR_INACTIVE_VALS = 0, NO_MASK_AND_MINUS_BG = 1, NO_MASK_AND_ONE_INACTIVE_VAL = 2, MASK_AND_NO_INACTIVE_VALS = 3,
  MASK_AND_ONE_INACTIVE_VAL = 4, MASK_AND_TWO_INACTIVE_VALS = 5, NO_MASK_AND_ALL_VALS = 6;

/** A little-endian byte stream that grows. */
class Out {
  constructor() { this.buf = new Uint8Array(1 << 16); this.dv = new DataView(this.buf.buffer); this.n = 0; }
  room(k) {
    if (this.n + k <= this.buf.length) return;
    let cap = this.buf.length * 2; while (cap < this.n + k) cap *= 2;
    const nb = new Uint8Array(cap); nb.set(this.buf.subarray(0, this.n)); this.buf = nb; this.dv = new DataView(nb.buffer);
  }
  u8(v) { this.room(1); this.buf[this.n++] = v & 255; }
  u32(v) { this.room(4); this.dv.setUint32(this.n, v >>> 0, true); this.n += 4; }
  i32(v) { this.room(4); this.dv.setInt32(this.n, v | 0, true); this.n += 4; }
  i64(v) { this.room(8); this.dv.setBigInt64(this.n, BigInt(v), true); this.n += 8; }
  f32(v) { this.room(4); this.dv.setFloat32(this.n, v, true); this.n += 4; }
  f64(v) { this.room(8); this.dv.setFloat64(this.n, v, true); this.n += 8; }
  bytes(u8) { this.room(u8.length); this.buf.set(u8, this.n); this.n += u8.length; }
  str(s) { const u = new TextEncoder().encode(s); this.u32(u.length); this.bytes(u); }      // util/Name.h writeString: uint32 length + bytes
  f32s(arr, count) { this.room(count * 4); for (let i = 0; i < count; i++) { this.dv.setFloat32(this.n, arr[i], true); this.n += 4; } }
  mask(words) { this.room(words.length * 4); for (let i = 0; i < words.length; i++) { this.dv.setUint32(this.n, words[i], true); this.n += 4; } }   // 64-bit words as low/high halves
  done() { return this.buf.slice(0, this.n); }
}

// A node mask of `bits` bits as 32-bit halves of OpenVDB's 64-bit words: bit i lives in word i >> 6, so in our half (i >> 5), bit i & 31.
const newMask = (bits) => new Uint32Array(bits >> 5);
const setBit = (m, i) => { m[i >> 5] |= 1 << (i & 31); };
const isOn = (m, i) => (m[i >> 5] >>> (i & 31) & 1) === 1;

/**
 * io::writeCompressedValues with COMPRESS_ACTIVE_MASK, as Compression.h decides it: look at up to three distinct inactive values
 * (skipping child slots), pick the metadata byte, then write the inactive values it needs, the selection mask when there are two,
 * and the active values (or every value when there are more than two inactive ones). Float32 comparisons are exact, as there.
 */
function writeValues(out, vals, count, valueMask, childMask, bg) {
  const f = Math.fround, bgf = f(bg), mbg = f(-bg);
  const inactive = [bgf, bgf];
  let unique = 0;
  for (let i = 0; i < count && unique < 3; i++) {
    if (isOn(valueMask, i) || (childMask && isOn(childMask, i))) continue;
    const v = f(vals[i]);
    const seen = (unique > 0 && v === inactive[0]) || (unique > 1 && v === inactive[1]);
    if (!seen) { if (unique < 2) inactive[unique] = v; unique++; }
  }
  let meta = NO_MASK_OR_INACTIVE_VALS;
  if (unique === 1) {
    if (inactive[0] !== bgf) meta = inactive[0] === mbg ? NO_MASK_AND_MINUS_BG : NO_MASK_AND_ONE_INACTIVE_VAL;
  } else if (unique === 2) {
    if (inactive[0] !== bgf && inactive[1] !== bgf) meta = MASK_AND_TWO_INACTIVE_VALS;
    else if (inactive[1] === bgf) meta = inactive[0] === mbg ? MASK_AND_NO_INACTIVE_VALS : MASK_AND_ONE_INACTIVE_VAL;
    else if (inactive[0] === bgf) { meta = inactive[1] === mbg ? MASK_AND_NO_INACTIVE_VALS : MASK_AND_ONE_INACTIVE_VAL; const s = inactive[0]; inactive[0] = inactive[1]; inactive[1] = s; }
  } else if (unique > 2) meta = NO_MASK_AND_ALL_VALS;
  out.u8(meta);
  if (meta === NO_MASK_AND_ONE_INACTIVE_VAL || meta === MASK_AND_ONE_INACTIVE_VAL || meta === MASK_AND_TWO_INACTIVE_VALS) {
    out.f32(inactive[0]);
    if (meta === MASK_AND_TWO_INACTIVE_VALS) out.f32(inactive[1]);
  }
  if (meta === NO_MASK_AND_ALL_VALS) { out.f32s(vals, count); return; }
  const active = [];
  if (meta === NO_MASK_OR_INACTIVE_VALS || meta === NO_MASK_AND_MINUS_BG || meta === NO_MASK_AND_ONE_INACTIVE_VAL) {
    for (let i = 0; i < count; i++) if (isOn(valueMask, i)) active.push(vals[i]);
  } else {
    const sel = newMask(count);
    for (let i = 0; i < count; i++) {
      if (isOn(valueMask, i)) active.push(vals[i]);
      else if (f(vals[i]) === inactive[1]) setBit(sel, i);
    }
    out.mask(sel);
  }
  out.f32s(active, active.length);
}

/** One metadata entry (MetaMap::writeMeta): name, type name, uint32 byte count, the value. */
function meta(out, name, type, write) {
  const tmp = new Out(); write(tmp); const v = tmp.done();
  out.str(name); out.str(type); out.u32(v.length); out.bytes(v);
}

/** The tree: root → 32³ internal (level 2) → 16³ internal (level 1) → 8³ leaves (our bricks), every list in OpenVDB's order. */
function buildTree(grid) {
  const bg = Math.fround(grid.bw);
  const l2 = new Map();                                  // key "x,y,z" of the level-2 origin → { o:[x,y,z], kids: Map(offset → level-1) }
  let voxels = 0;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const key of grid.sortedKeys()) {
    const b = grid.bricks.get(key), [bx, by, bz] = brickOf(key);
    const o2 = [bx >> 9 << 12, by >> 9 << 12, bz >> 9 << 12];                     // 512 bricks = 4096 voxels per level-2 node
    const k2 = o2.join(',');
    let n2 = l2.get(k2); if (!n2) { n2 = { o: o2, kids: new Map() }; l2.set(k2, n2); }
    const off2 = ((bx >> 4) & 31) << 10 | ((by >> 4) & 31) << 5 | ((bz >> 4) & 31);
    let n1 = n2.kids.get(off2); if (!n1) { n1 = { leaves: new Map(), inside: new Set() }; n2.kids.set(off2, n1); }
    const off1 = (bx & 15) << 8 | (by & 15) << 4 | (bz & 15);
    if (b === INSIDE) { n1.inside.add(off1); continue; }
    // reorder x-fastest → z-fastest, and mark the narrow band active
    const vals = new Float32Array(BN), mask = newMask(BN);
    for (let z = 0; z < 8; z++) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      const v = b[x | y << 3 | z << 6], n = x << 6 | y << 3 | z;
      vals[n] = v;
      if (v < bg && v > -bg) {
        setBit(mask, n); voxels++;
        const p = [bx * 8 + x, by * 8 + y, bz * 8 + z];
        for (let a = 0; a < 3; a++) { if (p[a] < lo[a]) lo[a] = p[a]; if (p[a] > hi[a]) hi[a] = p[a]; }
      }
    }
    n1.leaves.set(off1, { o: [bx * 8, by * 8, bz * 8], vals, mask });
  }
  // the root's table is a std::map on Coord: x, then y, then z
  const roots = [...l2.values()].sort((a, b) => a.o[0] - b.o[0] || a.o[1] - b.o[1] || a.o[2] - b.o[2]);
  return { bg, roots, voxels, bbox: voxels ? { lo, hi } : null };
}

function writeTopology(out, tree) {
  const { bg, roots } = tree;
  out.i32(1);                                            // TreeBase::writeTopology: buffer count
  out.f32(bg);                                           // RootNode: background, tile count, child count
  out.u32(0); out.u32(roots.length);
  for (const n2 of roots) {
    out.i32(n2.o[0]); out.i32(n2.o[1]); out.i32(n2.o[2]);
    // level 2: child mask, value mask (no active tiles), the 32 768 tile values (all +background; child slots 0)
    const offs2 = [...n2.kids.keys()].sort((a, b) => a - b);
    const cm2 = newMask(32768), vm2 = newMask(32768), v2 = new Float32Array(32768).fill(bg);
    for (const o of offs2) { setBit(cm2, o); v2[o] = 0; }
    out.mask(cm2); out.mask(vm2); writeValues(out, v2, 32768, vm2, cm2, bg);
    for (const o of offs2) {
      const n1 = n2.kids.get(o), offs1 = [...n1.leaves.keys()].sort((a, b) => a - b);
      const cm1 = newMask(4096), vm1 = newMask(4096), v1 = new Float32Array(4096).fill(bg);
      for (const i of n1.inside) v1[i] = -bg;                                       // inside bricks: inactive −background tiles
      for (const i of offs1) { setBit(cm1, i); v1[i] = 0; }
      out.mask(cm1); out.mask(vm1); writeValues(out, v1, 4096, vm1, cm1, bg);
      for (const i of offs1) out.mask(n1.leaves.get(i).mask);                       // LeafNode::writeTopology: the value mask
    }
  }
}

function writeBuffers(out, tree) {
  for (const n2 of tree.roots) for (const o of [...n2.kids.keys()].sort((a, b) => a - b)) {
    const n1 = n2.kids.get(o);
    for (const i of [...n1.leaves.keys()].sort((a, b) => a - b)) {
      const leaf = n1.leaves.get(i);
      out.mask(leaf.mask); writeValues(out, leaf.vals, BN, leaf.mask, null, tree.bg);
    }
  }
}

/** An upper bound on the file size: every leaf with every value written, plus the internal nodes' masks and values. */
export function vdbSize(grid) {
  let leaves = 0; const l1 = new Set(), l2 = new Set();
  for (const k of grid.bricks.keys()) { const [x, y, z] = brickOf(k); if (grid.bricks.get(k) !== INSIDE) leaves++; l1.add((x >> 4) + ',' + (y >> 4) + ',' + (z >> 4)); l2.add((x >> 9) + ',' + (y >> 9) + ',' + (z >> 9)); }
  return 1024 + leaves * (64 + 64 + 1 + 64 + BN * 4) + l1.size * (1024 + 1 + 512 + 4096 * 4) + l2.size * (12 + 8192 + 1 + 4096 + 32768 * 4);
}

export function toVDB(grid, { name = 'surface', maxBytes = 1.5e9 } = {}) {
  if (!grid.bricks.size) throw Object.assign(new Error('export: the field is empty'), { code: 'empty' });
  const est = vdbSize(grid);
  if (est > maxBytes) throw Object.assign(new Error('export: the .vdb file would be too big'), { code: 'toobig', vars: { bytes: est } });
  const h = grid.h, tree = buildTree(grid);
  // the grid's own bytes first, so the file id can be their fingerprint
  const g = new Out();
  g.u32(COMPRESS_ACTIVE_MASK);                           // Archive::setGridCompression (level sets never use zlib)
  const metas = [                                        // a std::map, so in name order
    ['class', 'string', (o) => o.bytes(new TextEncoder().encode('level set'))],
    ['creator', 'string', (o) => o.bytes(new TextEncoder().encode('CadCraft cc-field'))],
    ...(tree.bbox ? [['file_bbox_max', 'vec3i', (o) => tree.bbox.hi.forEach((v) => o.i32(v))], ['file_bbox_min', 'vec3i', (o) => tree.bbox.lo.forEach((v) => o.i32(v))]] : []),
    ['file_voxel_count', 'int64', (o) => o.i64(tree.voxels)],
    ['is_local_space', 'bool', (o) => o.u8(0)],
    ['is_saved_as_half_float', 'bool', (o) => o.u8(0)],
    ['name', 'string', (o) => o.bytes(new TextEncoder().encode(name))],
    ['units', 'string', (o) => o.bytes(new TextEncoder().encode('mm'))],
  ];
  g.u32(metas.length);
  for (const [n, ty, w] of metas) meta(g, n, ty, w);
  g.str('UniformScaleMap');                              // Transform::write: map type, then ScaleMap's five vectors
  for (const v of [h, h, 1 / h, 1 / (h * h), 1 / (2 * h)]) { g.f64(v); g.f64(v); g.f64(v); }
  writeTopology(g, tree);
  const topoEnd = g.n;
  writeBuffers(g, tree);
  const body = g.done();
  // file: header, (no file metadata), one grid descriptor with its stream positions, the grid
  const out = new Out();
  out.i64(MAGIC); out.u32(VDB_FILE_VERSION); out.u32(LIB_MAJOR); out.u32(LIB_MINOR);
  out.u8(1);                                             // the stream has grid offsets (seekable)
  const fp = fingerprint(body) + fingerprint(new Float64Array([h, grid.band, body.length]));          // 32 hex characters
  const id = (fp.slice(0, 8) + '-' + fp.slice(8, 12) + '-' + fp.slice(12, 16) + '-' + fp.slice(16, 20) + '-' + fp.slice(20, 32)).toUpperCase();
  out.bytes(new TextEncoder().encode(id));               // 36 characters, no length
  out.u32(0);                                            // file-level metadata: none
  out.i32(1);                                            // grid count
  out.str(name); out.str(TREE_TYPE); out.str('');        // GridDescriptor::writeHeader: unique name, type, instance parent
  const gridPos = out.n + 24;
  out.i64(gridPos); out.i64(gridPos + topoEnd); out.i64(gridPos + body.length);   // grid, block (buffers) and end positions
  out.bytes(body);
  return out.done();
}
