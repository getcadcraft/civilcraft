/* SPDX-License-Identifier: Apache-2.0 */
/**
 * octree.js — the read side of a tiled cloud ("CCT 1", spec § 5) and the byte codecs the tiler writes with.
 *
 *   await openCloud(store, id) → Cloud          reads cct/<id>/cloud.json + nodes.bin + edits.json
 *
 *   cloud.meta / .id / .count / .bounds / .origin / .scale / .nodeCount / .depth / .classCounts
 *   cloud.nodeId(i) / nodeBox(i) / nodeCount(i) / children(i)
 *   cloud.select(view, { budget, maxError }) → [nodeIndex…]   parents always come before their children
 *       view = { eye:[x,y,z], planes:[[a,b,c,d]×6], focalPx }  in coordinates RELATIVE TO cloud.origin (the same frame as
 *       readNode's positions); a point is inside a plane when a·x + b·y + c·z + d ≥ 0.
 *   await cloud.readNode(i, { attrs, applyEdits }) → { n, pos Float32Array(3n, relative to origin), cls?, rgb?, inten? }
 *       with applyEdits (default true) deleted points are left out and classes are the edited ones.
 *   await cloud.readRaw(i, { applyEdits }) → { n, x, y, z (Int32Array, units of cloud.scale from origin), cls, flags,
 *       inten, rgb, del (Uint8Array, 1 = deleted) }            for engine code (classify, export)
 *   await cloud.readRegion(bbox [x0,y0,x1,y1] absolute, { applyEdits, dropDeleted, zmin, zmax }) → { n, x, y, z (Float64Array, absolute),
 *       cls, node, idx, inten? }                               every point inside the box (half-open at the high side)
 *   await cloud.forEachNode(fn, { signal, progress, bbox, applyEdits })
 *   cloud.edits / await cloud.preview(region) / await cloud.ground()
 *
 * Node files hold ADDITIVE levels of detail: a node holds the points that fall on its own grid, its children hold the rest, so
 * drawing a node together with its ancestors draws every point exactly once.
 */
import { fail, aligned, parseJson, throwIfAborted, reporter } from './util.js';
import { EditLog } from './edits.js';
import { preview as previewRegion, GroundModel } from './select.js';

export const NODE_MAGIC = [0x43, 0x43, 0x54, 0x4e];   // 'CCTN'
export const TABLE_MAGIC = [0x43, 0x43, 0x54, 0x54];  // 'CCTT'
export const REC = 40;

/** Encode one node. a = { n, x, y, z (Int32Array), cls (Uint8Array), flags (Uint8Array), inten?, rgb? }. */
export function encodeNode(a, hasRgb, hasInt) {
  const n = a.n, size = 16 + 12 * n + (hasInt ? 2 * n : 0) + n + n + (hasRgb ? 3 * n : 0);
  const out = new Uint8Array(size), dv = new DataView(out.buffer);
  out.set(NODE_MAGIC, 0); dv.setUint32(4, n, true); out[8] = (hasRgb ? 1 : 0) | (hasInt ? 2 : 0) | 4;
  let o = 16;
  out.set(new Uint8Array(a.x.buffer, a.x.byteOffset, 4 * n), o); o += 4 * n;
  out.set(new Uint8Array(a.y.buffer, a.y.byteOffset, 4 * n), o); o += 4 * n;
  out.set(new Uint8Array(a.z.buffer, a.z.byteOffset, 4 * n), o); o += 4 * n;
  if (hasInt) { out.set(new Uint8Array(a.inten.buffer, a.inten.byteOffset, 2 * n), o); o += 2 * n; }
  out.set(a.cls.subarray(0, n), o); o += n;
  out.set(a.flags.subarray(0, n), o); o += n;
  if (hasRgb) out.set(a.rgb.subarray(0, 3 * n), o);
  return out;
}

export function decodeNode(bytes) {
  const b = aligned(bytes);
  if (b.length < 16 || b[0] !== NODE_MAGIC[0] || b[1] !== NODE_MAGIC[1] || b[2] !== NODE_MAGIC[2] || b[3] !== NODE_MAGIC[3]) fail('bad_node');
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength), n = dv.getUint32(4, true), fl = b[8];
  const hasRgb = !!(fl & 1), hasInt = !!(fl & 2), hasCls = !!(fl & 4);
  const need = 16 + 12 * n + (hasInt ? 2 * n : 0) + (hasCls ? n : 0) + n + (hasRgb ? 3 * n : 0);
  if (b.length < need) fail('bad_node');
  let o = b.byteOffset + 16;
  const x = new Int32Array(b.buffer, o, n); o += 4 * n;
  const y = new Int32Array(b.buffer, o, n); o += 4 * n;
  const z = new Int32Array(b.buffer, o, n); o += 4 * n;
  let inten = null; if (hasInt) { inten = new Uint16Array(b.buffer, o, n); o += 2 * n; }
  let cls = null; if (hasCls) { cls = new Uint8Array(b.buffer, o, n); o += n; }
  const flags = new Uint8Array(b.buffer, o, n); o += n;
  const rgb = hasRgb ? new Uint8Array(b.buffer, o, 3 * n) : null;
  return { n, x, y, z, inten, cls: cls || new Uint8Array(n), flags, rgb, hasRgb, hasInt };
}

/** Node table: records in breadth-first order (a parent always has a smaller index than its children). */
export function encodeTable(rows) {
  const out = new Uint8Array(16 + REC * rows.length), dv = new DataView(out.buffer);
  out.set(TABLE_MAGIC, 0); dv.setUint32(4, 1, true); dv.setUint32(8, rows.length, true); dv.setUint32(12, REC, true);
  rows.forEach((r, i) => {
    const o = 16 + REC * i;
    dv.setInt32(o, r.parent, true); dv.setUint8(o + 4, r.octant); dv.setUint8(o + 5, r.depth);
    dv.setUint32(o + 8, r.count, true); dv.setUint32(o + 12, r.byteLength, true); dv.setFloat64(o + 16, r.byteOffset, true);
    dv.setFloat32(o + 24, r.minZ, true); dv.setFloat32(o + 28, r.maxZ, true); dv.setFloat32(o + 32, r.cellSize, true);
  });
  return out;
}

export function decodeTable(bytes) {
  const b = aligned(bytes), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (b.length < 16 || b[0] !== TABLE_MAGIC[0] || b[3] !== TABLE_MAGIC[3]) fail('bad_table');
  const n = dv.getUint32(8, true), rec = dv.getUint32(12, true);
  if (rec !== REC || b.length < 16 + REC * n) fail('bad_table');
  const t = { n, parent: new Int32Array(n), octant: new Uint8Array(n), depth: new Uint8Array(n), count: new Uint32Array(n), byteLength: new Uint32Array(n), byteOffset: new Float64Array(n), minZ: new Float32Array(n), maxZ: new Float32Array(n), cellSize: new Float32Array(n) };
  for (let i = 0; i < n; i++) {
    const o = 16 + REC * i;
    t.parent[i] = dv.getInt32(o, true); t.octant[i] = dv.getUint8(o + 4); t.depth[i] = dv.getUint8(o + 5);
    t.count[i] = dv.getUint32(o + 8, true); t.byteLength[i] = dv.getUint32(o + 12, true); t.byteOffset[i] = dv.getFloat64(o + 16, true);
    t.minZ[i] = dv.getFloat32(o + 24, true); t.maxZ[i] = dv.getFloat32(o + 28, true); t.cellSize[i] = dv.getFloat32(o + 32, true);
  }
  return t;
}

export const cloudKey = (id, rel) => 'cct/' + id + '/' + rel;

export async function openCloud(store, id, opts = {}) {
  const mb = await store.get(cloudKey(id, 'cloud.json'));
  if (!mb) fail('no_cloud', { id });
  const meta = parseJson(mb);
  if (meta.format !== 'cct' || meta.version !== 1) fail('bad_cloud', { id });
  if (meta.building) fail('building', { id, building: meta.building });
  const tb = await store.get(cloudKey(id, 'nodes.bin'));
  if (!tb) fail('bad_cloud', { id });
  const cloud = new Cloud(store, id, meta, decodeTable(tb), opts);
  cloud.edits = await EditLog.load(cloud);
  return cloud;
}

export class Cloud {
  constructor(store, id, meta, table, opts = {}) {
    this.store = store; this.id = id; this.meta = meta; this.t = table; this.prefix = cloudKey(id, '');
    this.count = meta.count; this.bounds = meta.bounds; this.origin = meta.origin; this.scale = meta.scale; this.depth = meta.depth; this.classCounts = meta.classCounts;
    this.cube = meta.cube; this.nodeCap = meta.nodeCap;
    this.cacheBytes = opts.cacheBytes ?? 256 * 1048576; this._cache = new Map(); this._cached = 0;
    const n = table.n; this.ids = new Array(n); this.kids = new Array(n);
    for (let i = 0; i < n; i++) this.kids[i] = [];
    for (let i = 0; i < n; i++) {
      this.ids[i] = i === 0 ? 'r' : this.ids[table.parent[i]] + table.octant[i];
      if (i > 0) this.kids[table.parent[i]].push(i);
    }
    this._boxes = new Array(n); this._ground = undefined; this.edits = null;
  }
  get nodeCountTotal() { return this.t.n; }
  nodeId(i) { return this.ids[i]; }
  nodePoints(i) { return this.t.count[i]; }
  children(i) { return this.kids[i]; }
  /** Absolute bounds of node i's cube. */
  nodeBox(i) {
    let b = this._boxes[i];
    if (b) return b;
    const id = this.ids[i], min = this.cube.min.slice(); let size = this.cube.size;
    for (let k = 1; k < id.length; k++) { size /= 2; const o = id.charCodeAt(k) - 48; if (o & 1) min[0] += size; if (o & 2) min[1] += size; if (o & 4) min[2] += size; }
    b = { min, max: [min[0] + size, min[1] + size, min[2] + size], size };
    this._boxes[i] = b; return b;
  }

  select(view, { budget = 2.5e6, maxError = 1.5 } = {}) {
    const { eye, planes, focalPx } = view, t = this.t, ox = this.origin;
    const rel = (i) => { const b = this.nodeBox(i); return [b.min[0] - ox[0], b.min[1] - ox[1], b.min[2] - ox[2], b.max[0] - ox[0], b.max[1] - ox[1], b.max[2] - ox[2]]; };
    const visible = (r) => {
      for (const p of planes) {
        const x = p[0] >= 0 ? r[3] : r[0], y = p[1] >= 0 ? r[4] : r[1], z = p[2] >= 0 ? r[5] : r[2];
        if (p[0] * x + p[1] * y + p[2] * z + p[3] < 0) return false;
      }
      return true;
    };
    const prio = (i, r) => {
      const dx = Math.max(r[0] - eye[0], 0, eye[0] - r[3]), dy = Math.max(r[1] - eye[1], 0, eye[1] - r[4]), dz = Math.max(r[2] - eye[2], 0, eye[2] - r[5]);
      return t.cellSize[i] * focalPx / Math.max(Math.hypot(dx, dy, dz), 1e-3);
    };
    const heap = [];   // [priority, index]
    const push = (e) => { heap.push(e); let k = heap.length - 1; while (k > 0) { const p = (k - 1) >> 1; if (heap[p][0] >= heap[k][0]) break; [heap[p], heap[k]] = [heap[k], heap[p]]; k = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let k = 0; for (;;) { let l = 2 * k + 1, r = l + 1, m = k; if (l < heap.length && heap[l][0] > heap[m][0]) m = l; if (r < heap.length && heap[r][0] > heap[m][0]) m = r; if (m === k) break; [heap[m], heap[k]] = [heap[k], heap[m]]; k = m; } } return top; };
    const out = []; let used = 0;
    if (t.n && visible(rel(0))) push([prio(0, rel(0)), 0]);
    while (heap.length) {
      const [pr, i] = pop();
      if (used + t.count[i] > budget) continue;
      used += t.count[i]; out.push(i);
      if (pr <= maxError) continue;
      for (const c of this.kids[i]) { const r = rel(c); if (visible(r)) push([prio(c, r), c]); }
    }
    return out;
  }

  _cacheGet(i) { const v = this._cache.get(i); if (v) { this._cache.delete(i); this._cache.set(i, v); } return v; }
  _cachePut(i, v, bytes) {
    this._cache.set(i, v); this._cached += bytes;
    while (this._cached > this.cacheBytes && this._cache.size > 1) { const k = this._cache.keys().next().value, o = this._cache.get(k); this._cache.delete(k); this._cached -= o.bytes; }
  }
  async _raw(i) {
    let v = this._cacheGet(i);
    if (v) return v.node;
    if (i < 0 || i >= this.t.n) fail('bad_node', { i });
    if (!this.t.count[i]) return { n: 0, x: new Int32Array(0), y: new Int32Array(0), z: new Int32Array(0), inten: null, cls: new Uint8Array(0), flags: new Uint8Array(0), rgb: null };
    const b = await this.store.get(this.prefix + 'n/' + this.ids[i] + '.bin');
    if (!b) fail('missing_node', { id: this.ids[i] });
    const node = decodeNode(b);
    this._cachePut(i, { node, bytes: b.length }, b.length);
    return node;
  }
  async readRaw(i, { applyEdits = true } = {}) {
    const raw = await this._raw(i);
    let cls = raw.cls, del;
    if (applyEdits && this.edits && this.edits.count() > 0) { const e = await this.edits.apply(this, i, raw); cls = e.cls; del = e.del; }
    else { del = new Uint8Array(raw.n); for (let k = 0; k < raw.n; k++) del[k] = raw.flags[k] & 1; }
    return { n: raw.n, x: raw.x, y: raw.y, z: raw.z, cls, flags: raw.flags, inten: raw.inten, rgb: raw.rgb, del };
  }
  async readNode(i, { attrs = ['cls'], applyEdits = true } = {}) {
    const r = await this.readRaw(i, { applyEdits });
    let m = 0; for (let k = 0; k < r.n; k++) if (!r.del[k]) m++;
    const sx = this.scale[0], sy = this.scale[1], sz = this.scale[2];
    const pos = new Float32Array(3 * m), want = new Set(attrs || []);
    const cls = want.has('cls') ? new Uint8Array(m) : null, rgb = want.has('rgb') && r.rgb ? new Uint8Array(3 * m) : null, inten = want.has('inten') && r.inten ? new Uint16Array(m) : null;
    let j = 0;
    for (let k = 0; k < r.n; k++) {
      if (r.del[k]) continue;
      pos[3 * j] = r.x[k] * sx; pos[3 * j + 1] = r.y[k] * sy; pos[3 * j + 2] = r.z[k] * sz;
      if (cls) cls[j] = r.cls[k];
      if (rgb) { rgb[3 * j] = r.rgb[3 * k]; rgb[3 * j + 1] = r.rgb[3 * k + 1]; rgb[3 * j + 2] = r.rgb[3 * k + 2]; }
      if (inten) inten[j] = r.inten[k];
      j++;
    }
    const out = { n: m, pos };
    if (cls) out.cls = cls; if (rgb) out.rgb = rgb; if (inten) out.inten = inten;
    return out;
  }

  /** Node indexes (breadth-first) whose cube overlaps bbox [x0,y0,x1,y1] (absolute); no bbox = all nodes with points. */
  nodesIn(bbox) {
    const out = [], stack = [0];
    if (!this.t.n) return out;
    while (stack.length) {
      const i = stack.pop();
      if (bbox) { const b = this.nodeBox(i); if (b.max[0] < bbox[0] || b.min[0] > bbox[2] || b.max[1] < bbox[1] || b.min[1] > bbox[3]) continue; }
      if (this.t.count[i]) out.push(i);
      for (const c of this.kids[i]) stack.push(c);
    }
    return out.sort((a, b) => a - b);
  }

  async forEachNode(fn, { signal = null, progress = null, bbox = null, applyEdits = true, phase = 'scan' } = {}) {
    const nodes = this.nodesIn(bbox), rep = reporter(progress);
    for (let k = 0; k < nodes.length; k++) {
      throwIfAborted(signal);
      await fn(nodes[k], await this.readRaw(nodes[k], { applyEdits }), k);
      if ((k & 15) === 15) rep(k / nodes.length, phase);
    }
    rep(1, phase);
    return nodes.length;
  }

  async readRegion(bbox, { applyEdits = true, dropDeleted = true, zmin = -Infinity, zmax = Infinity } = {}) {
    const parts = [];
    let total = 0;
    const [ox, oy, oz] = this.origin, [sx, sy, sz] = this.scale;
    for (const i of this.nodesIn(bbox)) {
      const r = await this.readRaw(i, { applyEdits });
      const keep = [];
      for (let k = 0; k < r.n; k++) {
        if (dropDeleted && r.del[k]) continue;
        const x = ox + r.x[k] * sx, y = oy + r.y[k] * sy, z = oz + r.z[k] * sz;
        if (x < bbox[0] || x >= bbox[2] || y < bbox[1] || y >= bbox[3] || z < zmin || z > zmax) continue;
        keep.push(k);
      }
      if (!keep.length) continue;
      parts.push({ i, r, keep }); total += keep.length;
    }
    const out = { n: total, x: new Float64Array(total), y: new Float64Array(total), z: new Float64Array(total), cls: new Uint8Array(total), node: new Uint32Array(total), idx: new Uint32Array(total), del: new Uint8Array(total) };
    let j = 0;
    for (const { i, r, keep } of parts) for (const k of keep) {
      out.x[j] = ox + r.x[k] * sx; out.y[j] = oy + r.y[k] * sy; out.z[j] = oz + r.z[k] * sz; out.cls[j] = r.cls[k]; out.node[j] = i; out.idx[j] = k; out.del[j] = r.del[k]; j++;
    }
    return out;
  }

  async get(rel) { return this.store.get(this.prefix + rel); }
  async put(rel, bytes) { return this.store.put(this.prefix + rel, bytes); }
  async remove(rel) { return this.store.delete(this.prefix + rel); }

  async preview(region) { return previewRegion(this, region); }
  async ground() { return GroundModel.load(this); }
}
