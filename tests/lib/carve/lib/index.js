/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — lib/carve: V-carving, relief carving from a depth map, engraving, an editable post-processor and a G-code checker.
 * DOM-free, Apache-2.0, millimetres. See each file's header; the add-on (main.js + a host adapter) is the only thing that touches a page.
 */
export { vcarve, polish, V_DEFAULTS } from './vcarve.js';
export { relief, heightField, RELIEF_DEFAULTS } from './relief.js';
export { engrave } from './engrave.js';
export { gcode, parseGcode, cleanPost, POSTS } from './post.js';
export { checkProgram } from './check.js';
export { makeSim, cutPaths, simulate, toolHeight } from './sim.js';
export { makeField, nearest, at } from './field.js';
export { medialAxis } from './ridge.js';
export { contours } from './contour.js';
export { simplify, flattenBulges, orderPaths, pathLength, bounds } from './geom.js';

export const JOB_DEFAULTS = { unit: 'mm', safeZ: 10, clearZ: 2, feed: 1000, plunge: 300, rpm: 12000, name: 'Carving' };
/** An untrusted job (a saved file, the panel) → a safe one. */
export function cleanJob(o = {}) {
  const num = (v, d, lo, hi) => (Number.isFinite(Number(v)) && Number(v) >= lo && Number(v) <= hi ? Number(v) : d);
  return {
    unit: o.unit === 'in' ? 'in' : 'mm', safeZ: num(o.safeZ, JOB_DEFAULTS.safeZ, 1, 200), clearZ: num(o.clearZ, JOB_DEFAULTS.clearZ, 0, 100),
    feed: num(o.feed, JOB_DEFAULTS.feed, 1, 30000), plunge: num(o.plunge, JOB_DEFAULTS.plunge, 1, 10000), rpm: num(o.rpm, JOB_DEFAULTS.rpm, 100, 60000),
    name: String(o.name ?? JOB_DEFAULTS.name).replace(/[\u0000-\u001f\u007f()]/g, ' ').slice(0, 60),
  };
}
