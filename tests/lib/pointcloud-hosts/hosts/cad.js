/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/cad.js — the CadCraft adapter of the Point clouds add-on (0.9 PC.12; copied to cadcraft/dev/addons/pointcloud/host.js by tools/pointcloud-adapters/sync.mjs).
 * CadCraft's 3D tab (ws3d.js) is ModelCraft's View3D: Z up, metres, and its Camera is the one the shared cloud view was written for, so only the glue differs: the scene,
 * the camera and renderer of `window.cadcraft.host.ws3d.view3d`, its draw() wrapped so the cloud is selected and loaded every frame, and the cloud's place in the scene.
 * No ground classification here: CadCraft carries no TIN or ground modules and the add-on may not import across folders, so the Classify fold is not shown.
 *   engineDeps() → { las }     readers() → the app's pointcloud.js     accept     ground = false     app(ctx) → { show3D, view3d }     placementOf(ctx) → { T, how }
 */
import * as las from '../../las.js';
import { placement } from './common.js';

export const ground = false;
export const accept = '.las,.laz,.e57,.ply,.pcd,.ptx,.xyz,.pts';
export const engineDeps = () => ({ las });
export const readers = () => import('../../pointcloud.js');

const wsOf = () => (window.cadcraft && window.cadcraft.host && window.cadcraft.host.ws3d) || null;
let current = null;   // { view, host }
function build(ws, ctx) {
  const view = ws.view3d, bound = view.draw.bind(view);
  let radiusFn = null;
  const host = {
    id: 'cad', cam: ws.cam, renderer: view.renderer, canvas: view.gl, scene: view.scene, frames: 0,
    get data() { const o = ctx.cloud ? ctx.cloud.origin : [0, 0, 0], T = ctx.cloud ? placementOf(ctx).T : [0, 0, 0]; return { origin: { x: o[0] - T[0], y: o[1] - T[1], z: o[2] - T[2] }, exag: 1 }; },
    get draw() { return bound; },
    set draw(fn) {
      if (fn === bound) { delete view.draw; return; }
      view.draw = function () { if (radiusFn) view.radius = Math.max(view.radius || 20, radiusFn()); fn(); };
    },
    get radius() { return radiusFn || (() => view.radius || 20); },
    set radius(fn) { radiusFn = fn === host._r0 ? null : fn; },
    invalidate: () => view.invalidate(),
  };
  host._r0 = host.radius;
  return { view, host };
}

export function app(ctx) {
  if (!window.cadcraft || !window.cadcraft.host || !window.cadcraft.host.open3d) return null;
  return {
    show3D: async () => { if (!wsOf()) await window.cadcraft.host.open3d(); },
    get view3d() { const ws = wsOf(); if (!ws || !ws.view3d) return null; if (!current || current.view !== ws.view3d) current = build(ws, ctx); return { view: current.host }; },
  };
}

function hostBox() {
  const ws = wsOf(), b = ws && ws.bbox && ws.bbox();
  return b && b.min && b.max ? { min: b.min.slice(), max: b.max.slice() } : null;
}
const cache = new Map();
export function placementOf(ctx) {
  const c = ctx.cloud;
  if (!c) return { T: [0, 0, 0], how: 'centre' };
  if (!cache.has(c.id)) cache.set(c.id, placement(c.origin, c.bounds, hostBox()));
  return cache.get(c.id);
}
export function dispose() { current = null; cache.clear(); }
