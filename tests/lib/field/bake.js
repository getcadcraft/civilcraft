/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages; the script layer maps the error code to words (cs-lib-field.js) */
/**
 * bake.js — a field spec → a Grid (0.8 CE.1). Split in three so workers can share the work without changing a bit:
 *   plan(spec, opts)               → { h, band, keys, inside }   which bricks need computing (sorted), which are wholly inside
 *   bakeKeys(spec, h, band, keys)  → Float32Array[]              one brick of values per key, same order
 *   assemble(plan, arrays)         → Grid
 * Every brick is a pure function of the spec and its own key, and the grid only ever iterates in key order, so any split of
 * `keys` over any number of workers gives the same grid (rule D2). `bake()` does all three in one go.
 */
import { compile, IN, OUT } from './field.js';
import { Grid, keyOf, inRange, BN, packGrid, unpackGrid, FieldError } from './grid.js';

const R_BRICK = 3.5 * Math.sqrt(3);                      // brick half-diagonal in voxels (nodes span 7 voxels)

export function plan(spec, { h, bbox = null, band = 3 } = {}) {
  const node = compile(spec);
  const box = bbox || node.bounds;
  if (!box.every(Number.isFinite)) throw new FieldError('nobox', 'field: this field has no finite box; pass bbox or intersect it with a box');
  const pad = band * h;
  const lo = [0, 1, 2].map((a) => Math.floor((box[a] - pad) / h / 8)), hi = [0, 1, 2].map((a) => Math.floor((box[a + 3] + pad) / h / 8));
  for (let a = 0; a < 3; a++) if (!inRange(lo[a]) || !inRange(hi[a])) throw new FieldError('toolarge', 'field: part too large for the grid (more than 16 000 bricks along an axis)');
  const keys = [], inside = [], r = R_BRICK * h;
  for (let bx = lo[0]; bx <= hi[0]; bx++) for (let by = lo[1]; by <= hi[1]; by++) for (let bz = lo[2]; bz <= hi[2]; bz++) {
    const cls = node.cls((bx * 8 + 3.5) * h, (by * 8 + 3.5) * h, (bz * 8 + 3.5) * h, r, band * h);
    if (cls === OUT) continue;
    if (cls === IN) inside.push(keyOf(bx, by, bz)); else keys.push(keyOf(bx, by, bz));
  }
  return { h, band, keys, inside, bricks: (hi[0] - lo[0] + 1) * (hi[1] - lo[1] + 1) * (hi[2] - lo[2] + 1) };
}

export function bakeKeys(spec, h, band, keys) {
  const f = compile(spec).f, bw = band * h, out = [];
  for (const key of keys) {
    const bz = Math.floor(key % 131072), rest = (key - bz) / 131072, by = rest % 131072, bx = (rest - by) / 131072;
    const x0 = (bx - 65536) * 8, y0 = (by - 65536) * 8, z0 = (bz - 65536) * 8;
    const arr = new Float32Array(BN);
    let n = 0;
    for (let k = 0; k < 8; k++) for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++, n++) {
      let v = f((x0 + i) * h, (y0 + j) * h, (z0 + k) * h);
      arr[n] = v > bw ? bw : v < -bw ? -bw : v;
    }
    out.push(arr);
  }
  return out;
}

export function assemble(p, arrays) {
  const g = new Grid(p.h, p.band);
  for (const k of p.inside) g.bricks.set(k, -1);
  p.keys.forEach((k, i) => g.setBrick(k, arrays[i]));
  return g;
}

export function bake(spec, opts = {}) {
  const p = plan(spec, opts);
  return assemble(p, bakeKeys(spec, p.h, p.band, p.keys));
}

/** Split a key list into n contiguous chunks (for workers). */
export function chunks(keys, n) {
  const out = [], size = Math.ceil(keys.length / n) || 1;
  for (let i = 0; i < keys.length; i += size) out.push(keys.slice(i, i + size));
  return out;
}

/** A spec with its Grid leaves turned into plain data (to post to a worker) and back. Everything else in a spec is JSON already. */
export function packSpec(spec) {
  if (Array.isArray(spec)) return spec.map(packSpec);
  if (!spec || typeof spec !== 'object') return spec;
  if (spec instanceof Grid) return { __grid: packGrid(spec) };
  const o = {};
  for (const k of Object.keys(spec)) o[k] = packSpec(spec[k]);
  return o;
}
export function unpackSpec(spec) {
  if (Array.isArray(spec)) return spec.map(unpackSpec);
  if (!spec || typeof spec !== 'object') return spec;
  if (spec.__grid) return unpackGrid(spec.__grid);
  const o = {};
  for (const k of Object.keys(spec)) o[k] = unpackSpec(spec[k]);
  return o;
}
