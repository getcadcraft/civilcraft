/* SPDX-License-Identifier: Apache-2.0 */
/**
 * grid.js — the sparse narrow-band signed-distance grid (0.8 CE.1, decision D1). DOM-free.
 *
 * Nodes sit on the world lattice x = i·h (i, j, k whole numbers, negative allowed), so two grids with the same h line up
 * exactly and the lattice never depends on where a part's box happens to start. Nodes live in bricks of 8³. A node holds the
 * signed distance to the surface (negative inside), clamped to ±band·h. Only bricks that come within the band of the surface
 * are stored as arrays; a brick that is wholly outside is absent, one that is wholly inside is the marker INSIDE.
 */
/* i18n-ignore-file: the messages here are for developers; CraftScript's field builtins check their arguments first and map `code` to words (cs-lib-field.js) */
/** An error with a code the script layer turns into a sentence in the user's language. */
export class FieldError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
export const BS = 8, BN = 512;
export const INSIDE = -1;                                // a brick of nodes that are all −band·h
const OFF = 65536, S = 131072;                          // brick key: 17 bits per axis, 51 bits in all (bricks ±8 191 in use)
export const keyOf = (bx, by, bz) => ((bx + OFF) * S + (by + OFF)) * S + (bz + OFF);
export function brickOf(key) {
  const bz = key % S; key = (key - bz) / S;
  const by = key % S, bx = (key - by) / S;
  return [bx - OFF, by - OFF, bz - OFF];
}
export const inRange = (b) => b > -8192 && b < 8191;                // bricks; 8 nodes each, so nodes stay inside ±65 535

export class Grid {
  constructor(h, band = 3) {
    if (!(h > 0)) throw new FieldError('h', 'field: voxel size must be positive');
    this.h = h; this.band = band; this.bw = band * h;
    this.bricks = new Map();
  }
  /** Node value at lattice (i, j, k). */
  at(i, j, k) {
    const b = this.bricks.get(keyOf(i >> 3, j >> 3, k >> 3));
    if (b === undefined) return this.bw;
    if (b === INSIDE) return -this.bw;
    return b[(i & 7) | ((j & 7) << 3) | ((k & 7) << 6)];
  }
  /** Trilinear sample at a world point. */
  sample(x, y, z) {
    const h = this.h, fx = x / h, fy = y / h, fz = z / h;
    const i = Math.floor(fx), j = Math.floor(fy), k = Math.floor(fz);
    const u = fx - i, v = fy - j, w = fz - k;
    const c000 = this.at(i, j, k), c100 = this.at(i + 1, j, k), c010 = this.at(i, j + 1, k), c110 = this.at(i + 1, j + 1, k);
    const c001 = this.at(i, j, k + 1), c101 = this.at(i + 1, j, k + 1), c011 = this.at(i, j + 1, k + 1), c111 = this.at(i + 1, j + 1, k + 1);
    const a0 = c000 + (c100 - c000) * u, a1 = c010 + (c110 - c010) * u, b0 = c001 + (c101 - c001) * u, b1 = c011 + (c111 - c011) * u;
    const d0 = a0 + (a1 - a0) * v, d1 = b0 + (b1 - b0) * v;
    return d0 + (d1 - d0) * w;
  }
  /** Gradient (central differences over one voxel) → [gx, gy, gz]. */
  gradient(x, y, z) {
    const e = this.h * 0.5;
    return [this.sample(x + e, y, z) - this.sample(x - e, y, z), this.sample(x, y + e, z) - this.sample(x, y - e, z), this.sample(x, y, z + e) - this.sample(x, y, z - e)].map((g) => g / (2 * e));
  }
  /** Stored bricks, in key order (the only order anything here iterates in, so results never depend on insertion order). */
  sortedKeys() { return [...this.bricks.keys()].sort((a, b) => a - b); }
  /** Bricks that hold values (arrays, not markers). */
  arrayKeys() { return this.sortedKeys().filter((k) => this.bricks.get(k) !== INSIDE); }
  /** Brick box that holds everything stored: { lo:[bx,by,bz], hi:[…] } (inclusive) or null when empty. */
  extent() {
    if (!this.bricks.size) return null;
    const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (const k of this.bricks.keys()) { const b = brickOf(k); for (let a = 0; a < 3; a++) { if (b[a] < lo[a]) lo[a] = b[a]; if (b[a] > hi[a]) hi[a] = b[a]; } }
    return { lo, hi };
  }
  /** World box of the stored bricks (node positions). */
  worldBox() {
    const e = this.extent();
    if (!e) return null;
    const h = this.h;
    return [e.lo[0] * 8 * h, e.lo[1] * 8 * h, e.lo[2] * 8 * h, (e.hi[0] * 8 + 7) * h, (e.hi[1] * 8 + 7) * h, (e.hi[2] * 8 + 7) * h];
  }
  /** Store a brick, folding a brick that is all outside into "absent" and all inside into INSIDE. */
  setBrick(key, arr) {
    const bw = this.bw;
    let out = true, inn = true;
    for (let n = 0; n < BN; n++) { const v = arr[n]; if (v < bw) out = false; if (v > -bw) inn = false; if (!out && !inn) break; }
    if (out) this.bricks.delete(key); else if (inn) this.bricks.set(key, INSIDE); else this.bricks.set(key, arr);
  }
  /** Bytes held by the stored bricks. */
  bytes() { let n = 0; for (const b of this.bricks.values()) if (b !== INSIDE) n += BN * 4; return n; }
  /**
   * Volume enclosed (world units³): every node counts its share of a voxel, clamp(½ − d/h, 0, 1) — exact for a flat surface,
   * second-order for a curved one. INSIDE bricks count whole.
   */
  volume() {
    const h = this.h, h3 = h * h * h;
    let v = 0;
    for (const k of this.sortedKeys()) {
      const b = this.bricks.get(k);
      if (b === INSIDE) { v += BN; continue; }
      for (let n = 0; n < BN; n++) { const f = 0.5 - b[n] / h; v += f <= 0 ? 0 : f >= 1 ? 1 : f; }
    }
    return v * h3;
  }
}

/** FNV-1a over a typed array's bytes, two lanes → 16 hex characters. A fingerprint for the determinism tests and data sheets. */
export function fingerprint(...arrays) {
  let a = 0x811c9dc5, b = 0x01000193 ^ 0x9e3779b9;
  for (const arr of arrays) {
    const u8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    for (let i = 0; i < u8.length; i++) {
      a = Math.imul(a ^ u8[i], 0x01000193) >>> 0;
      b = Math.imul(b ^ ((u8[i] + i) & 255), 0x85ebca6b) >>> 0;
    }
    a = Math.imul(a ^ 0xff, 0x01000193) >>> 0;
  }
  return a.toString(16).padStart(8, '0') + b.toString(16).padStart(8, '0');
}

/** A Grid as plain transferable data, and back (for workers and part files). */
export function packGrid(g) {
  const keys = g.sortedKeys(), arrays = keys.map((k) => { const b = g.bricks.get(k); return b === INSIDE ? null : b; });
  return { h: g.h, band: g.band, keys, arrays };
}
export function unpackGrid(d) {
  const g = new Grid(d.h, d.band);
  d.keys.forEach((k, i) => g.bricks.set(k, d.arrays[i] === null ? INSIDE : d.arrays[i]));
  return g;
}
