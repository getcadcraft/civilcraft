/* SPDX-License-Identifier: Apache-2.0 */
/**
 * select.js — region tests (spec § 7) and the ground model the height-above-ground region reads.
 *
 *   region = { type:'all' } | { type:'polygon', ring:[[x,y]…], zmin?, zmax? } | { type:'box', min:[3], max:[3] }
 *          | { type:'heightAboveGround', min, max } | { type:'class', set:[…] } | { type:'and', parts:[region…] }
 *   Coordinates are absolute (the file's). `invert: true` on a region (or params.invert on an edit) selects everything else.
 *
 *   compileRegion(region, { ground }) → { bbox:[x0,y0,x1,y1] | null, needsGround, test(x, y, z, cls) → bool }
 *       bbox bounds where matching points can be (null = anywhere); a node whose cube misses it is skipped unread.
 *   pointInRing(x, y, ring) → bool            even-odd rule
 *   await preview(cloud, region, { signal }) → { count, byClass }   what the log would see now (deleted points not counted)
 *   class GroundModel                          per-tile ground height grids written by classifyGround
 *       GroundModel.load(cloud) → model | null     the model of the newest active 'ground' edit
 *       model.at(x, y) → z | NaN
 */
import { fail, throwIfAborted, parseJson } from './util.js';

export function pointInRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export function compileRegion(region, { ground = null, invert = false } = {}) {
  const r = region || { type: 'all' };
  const inv = !!(invert || r.invert);
  let bbox = null, needsGround = false, test;
  switch (r.type) {
    case 'all': test = () => true; break;
    case 'box': {
      const [a, b] = [r.min, r.max];
      if (!a || !b) fail('bad_region', { type: r.type });
      bbox = [a[0], a[1], b[0], b[1]];
      test = (x, y, z) => x >= a[0] && x <= b[0] && y >= a[1] && y <= b[1] && z >= a[2] && z <= b[2];
      break;
    }
    case 'polygon': {
      const ring = r.ring;
      if (!Array.isArray(ring) || ring.length < 3) fail('bad_region', { type: r.type });
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const p of ring) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      bbox = [x0, y0, x1, y1];
      const zmin = r.zmin ?? -Infinity, zmax = r.zmax ?? Infinity;
      test = (x, y, z) => z >= zmin && z <= zmax && x >= x0 && x <= x1 && y >= y0 && y <= y1 && pointInRing(x, y, ring);
      break;
    }
    case 'class': {
      const set = new Set(r.set || []);
      test = (x, y, z, c) => set.has(c);
      break;
    }
    case 'heightAboveGround': {
      needsGround = true;
      if (!ground) fail('no_ground', null);
      const lo = r.min ?? -Infinity, hi = r.max ?? Infinity;
      test = (x, y, z) => { const g = ground.at(x, y); if (g !== g) return false; const h = z - g; return h >= lo && h <= hi; };
      break;
    }
    case 'and': {
      const parts = (r.parts || []).map((p) => compileRegion(p, { ground }));
      needsGround = parts.some((p) => p.needsGround);
      for (const p of parts) if (p.bbox) bbox = bbox ? [Math.max(bbox[0], p.bbox[0]), Math.max(bbox[1], p.bbox[1]), Math.min(bbox[2], p.bbox[2]), Math.min(bbox[3], p.bbox[3])] : p.bbox;
      test = (x, y, z, c) => { for (const p of parts) if (!p.test(x, y, z, c)) return false; return true; };
      break;
    }
    default: fail('bad_region', { type: r.type });
  }
  if (inv) { const t = test; return { bbox: null, needsGround, test: (x, y, z, c) => !t(x, y, z, c) }; }
  return { bbox, needsGround, test };
}

export function regionNeedsGround(region) {
  if (!region) return false;
  if (region.type === 'heightAboveGround') return true;
  if (region.type === 'and') return (region.parts || []).some(regionNeedsGround);
  return false;
}

export async function preview(cloud, region, { signal = null } = {}) {
  const ground = regionNeedsGround(region) ? await cloud.ground() : null;
  const c = compileRegion(region, { ground }), byClass = {};
  let count = 0;
  const [ox, oy, oz] = cloud.origin, [sx, sy, sz] = cloud.scale;
  for (const i of cloud.nodesIn(c.bbox)) {
    throwIfAborted(signal);
    const r = await cloud.readRaw(i);
    for (let k = 0; k < r.n; k++) {
      if (r.del[k]) continue;
      if (c.test(ox + r.x[k] * sx, oy + r.y[k] * sy, oz + r.z[k] * sz, r.cls[k])) { count++; byClass[r.cls[k]] = (byClass[r.cls[k]] || 0) + 1; }
    }
  }
  return { count, byClass };
}

/** One tile's ground heights: nodes at x0 + i·cell, y0 + j·cell (nx × ny nodes), Float32. */
export function encodeGroundTile(t) {
  const out = new Uint8Array(40 + 4 * t.z.length), dv = new DataView(out.buffer);
  dv.setFloat64(0, t.x0, true); dv.setFloat64(8, t.y0, true); dv.setFloat64(16, t.cell, true); dv.setUint32(24, t.nx, true); dv.setUint32(28, t.ny, true);
  out.set(new Uint8Array(t.z.buffer, t.z.byteOffset, 4 * t.z.length), 40);
  return out;
}
export function decodeGroundTile(b) {
  const c = b.byteOffset & 3 ? new Uint8Array(b) : b, dv = new DataView(c.buffer, c.byteOffset, c.byteLength);
  const nx = dv.getUint32(24, true), ny = dv.getUint32(28, true);
  return { x0: dv.getFloat64(0, true), y0: dv.getFloat64(8, true), cell: dv.getFloat64(16, true), nx, ny, z: new Float32Array(c.buffer, c.byteOffset + 40, nx * ny) };
}

export class GroundModel {
  /** meta = { editId, tileSize, gx0, gy0, cell }; tiles = Map 'tx_ty' → tile */
  constructor(meta, tiles) { this.meta = meta; this.tiles = tiles; }
  at(x, y) {
    const m = this.meta, tx = Math.floor((x - m.gx0) / m.tileSize), ty = Math.floor((y - m.gy0) / m.tileSize);
    const t = this.tiles.get(tx + '_' + ty);
    if (!t) return NaN;
    return bilinear(t, x, y);
  }
  static async load(cloud) {
    const e = cloud.edits;
    const rec = e ? [...e.list()].reverse().find((r) => r.op === 'ground') : null;
    if (!rec) return null;
    if (cloud._ground && cloud._ground.meta.editId === rec.id) return cloud._ground;
    const mb = await cloud.get('ground/' + rec.id + '/meta.json');
    if (!mb) return null;
    const meta = parseJson(mb), tiles = new Map();
    for (const k of await cloud.store.list(cloud.prefix + 'ground/' + rec.id + '/')) {
      const name = k.slice((cloud.prefix + 'ground/' + rec.id + '/').length);
      if (!name.endsWith('.bin')) continue;
      tiles.set(name.slice(0, -4), decodeGroundTile(await cloud.store.get(k)));
    }
    cloud._ground = new GroundModel(meta, tiles);
    return cloud._ground;
  }
}

export function bilinear(t, x, y) {
  const fx = (x - t.x0) / t.cell, fy = (y - t.y0) / t.cell;
  let i = Math.floor(fx), j = Math.floor(fy);
  if (i < 0) i = 0; else if (i > t.nx - 2) i = t.nx - 2;
  if (j < 0) j = 0; else if (j > t.ny - 2) j = t.ny - 2;
  const u = Math.min(1, Math.max(0, fx - i)), v = Math.min(1, Math.max(0, fy - j)), z = t.z, o = j * t.nx + i;
  return z[o] * (1 - u) * (1 - v) + z[o + 1] * u * (1 - v) + z[o + t.nx] * (1 - u) * v + z[o + t.nx + 1] * u * v;
}

// ---------------------------------------------------------------- helpers shared by the tile-wise engines

/** The XY tiles (size tileSize, anchored at the cloud origin) that hold points, optionally limited to a bbox. */
export function tileList(cloud, tileSize, bbox = null) {
  const gx0 = cloud.origin[0], gy0 = cloud.origin[1], b = cloud.bounds, out = [];
  let ax0 = b.min[0], ay0 = b.min[1], ax1 = b.max[0], ay1 = b.max[1];
  if (bbox) { ax0 = Math.max(ax0, bbox[0]); ay0 = Math.max(ay0, bbox[1]); ax1 = Math.min(ax1, bbox[2]); ay1 = Math.min(ay1, bbox[3]); }
  if (ax1 < ax0 || ay1 < ay0) return out;
  const t0x = Math.floor((ax0 - gx0) / tileSize), t1x = Math.floor((ax1 - gx0) / tileSize), t0y = Math.floor((ay0 - gy0) / tileSize), t1y = Math.floor((ay1 - gy0) / tileSize);
  for (let ty = t0y; ty <= t1y; ty++) for (let tx = t0x; tx <= t1x; tx++) out.push({ tx, ty, x0: gx0 + tx * tileSize, y0: gy0 + ty * tileSize, x1: gx0 + (tx + 1) * tileSize, y1: gy0 + (ty + 1) * tileSize });
  return out;
}

/** A 3D hash of points for radius searches. ids = the point indexes to hash (default all). */
export class Hash3 {
  constructor(X, Y, Z, ids, cell) {
    this.X = X; this.Y = Y; this.Z = Z; this.cell = cell;
    const n = ids.length;
    let x0 = Infinity, y0 = Infinity, z0 = Infinity;
    for (let q = 0; q < n; q++) { const i = ids[q]; if (X[i] < x0) x0 = X[i]; if (Y[i] < y0) y0 = Y[i]; if (Z[i] < z0) z0 = Z[i]; }
    this.x0 = x0 - cell; this.y0 = y0 - cell; this.z0 = z0 - cell;
    const keys = new Float64Array(n), M = 131072;
    for (let q = 0; q < n; q++) { const i = ids[q]; keys[q] = (Math.floor((X[i] - this.x0) / cell) * M + Math.floor((Y[i] - this.y0) / cell)) * M + Math.floor((Z[i] - this.z0) / cell); }
    const ord = new Uint32Array(n); for (let q = 0; q < n; q++) ord[q] = q;
    ord.sort((a, b) => keys[a] - keys[b]);
    this.ids = new Int32Array(n); this.start = new Map();
    for (let q = 0; q < n; q++) {
      this.ids[q] = ids[ord[q]];
      const k = keys[ord[q]];
      const s = this.start.get(k);
      if (s === undefined) this.start.set(k, q);
    }
    this.keys = new Float64Array(n); for (let q = 0; q < n; q++) this.keys[q] = keys[ord[q]];
    this.M = M; this.n = n;
  }
  /** Calls fn(j, d2) for every hashed point j within r (r ≤ cell) of (x, y, z), the point itself included when hashed. */
  near(x, y, z, r, fn) {
    const c = this.cell, M = this.M, ix = Math.floor((x - this.x0) / c), iy = Math.floor((y - this.y0) / c), iz = Math.floor((z - this.z0) / c), r2 = r * r;
    for (let a = ix - 1; a <= ix + 1; a++) for (let b = iy - 1; b <= iy + 1; b++) for (let d = iz - 1; d <= iz + 1; d++) {
      const key = (a * M + b) * M + d;
      let q = this.start.get(key);
      if (q === undefined) continue;
      for (; q < this.n && this.keys[q] === key; q++) {
        const j = this.ids[q], dx = this.X[j] - x, dy = this.Y[j] - y, dz = this.Z[j] - z, d2 = dx * dx + dy * dy + dz * dz;
        if (d2 <= r2) fn(j, d2);
      }
    }
  }
}
