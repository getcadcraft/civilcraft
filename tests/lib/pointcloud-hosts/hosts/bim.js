/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/bim.js — the BimCraft adapter of the Point clouds add-on (0.9 PC.11; copied to bimcraft/dev/addons/pointcloud/host.js by tools/pointcloud-adapters/sync.mjs).
 * BimCraft's 3D view is Viewer3D (viewer3d.js): Y up, metres, OrbitControls; the page keeps it on its canvas as `canvas.viewer` (created with the first model). This adapter
 * presents it to the shared cloud view in the Z-up frame the engine uses: a camera that reads/writes the viewer's camera, a wrapper group turned Z-up → Y-up that the cloud hangs
 * under in the viewer's `root`, and the viewer's render() wrapped so the cloud is selected and loaded every frame.
 *   engineDeps() → { las, thin, groundClassify, groundSurface }   the app's own LAS reader; the ground modules are CivilCraft's, copied next to this file (sync.mjs) because BimCraft has none
 *   readers() → the app's pointcloud.js (E57, PLY, PCD, PTX, XYZ, PTS)      accept      ground = true: the Classify fold shows
 *   app(ctx) → { show3D, view3d } | null (no viewer yet: open a model first)    placementOf(ctx) → { T, how }
 */
import * as THREE from 'three';
import * as las from '../../las.js';
import * as thin from './thin.js';
import * as groundClassify from './ground-classify.js';
import * as groundSurface from './ground-surface.js';
import { placement } from './common.js';

export const ground = true;
export const accept = '.las,.laz,.e57,.ply,.pcd,.ptx,.xyz,.pts';
export const engineDeps = () => ({ las, thin, groundClassify, groundSurface });
export const readers = () => import('../../pointcloud.js');

const YUP = [1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1];   // Z up → Y up: (x, y, z) → (x, z, −y)
const toZ = (v) => [v.x, -v.z, v.y];
const fromZ = (p) => new THREE.Vector3(p[0], p[2], -p[1]);
const find = () => { for (const c of document.querySelectorAll('canvas')) if (c.viewer && c.viewer.renderer) return c.viewer; return null; };

let current = null;   // { v, host, wrap }
function build(v, ctx) {
  const M = new THREE.Matrix4().fromArray(YUP), wrap = new THREE.Group();
  const area = v.canvas.closest('[data-canvas-wrap]'); if (area) area.setAttribute('data-view3d', '');   // the shared lasso finds the 3D area by this attribute (removed on dispose)
  wrap.name = 'pointcloud-zup'; wrap.matrixAutoUpdate = false; wrap.matrix.copy(M); wrap.matrixWorldNeedsUpdate = true;
  const cam = {
    get eye() { return toZ(v.camera.position); }, set eye(p) { v.camera.position.copy(fromZ(p)); v.controls.update(); },
    get target() { return toZ(v.controls.target); }, set target(p) { v.controls.target.copy(fromZ(p)); v.controls.update(); },
    get fov() { return v.camera.fov; }, persp: true,
    get w() { return Math.max(1, v.canvas.clientWidth); }, get h() { return Math.max(1, v.canvas.clientHeight); },
    get height() { return 2 * v.camera.position.distanceTo(v.controls.target) * Math.tan((v.camera.fov * Math.PI) / 360); },
    viewProj() { v.camera.updateMatrixWorld(true); return new THREE.Matrix4().multiplyMatrices(v.camera.projectionMatrix, v.camera.matrixWorldInverse).multiply(M).toArray(); },
    clip(r) {
      const d = v.camera.position.distanceTo(v.controls.target), need = d + r * 4 + 100;
      if (v.camera.far < need) { v.camera.far = need; v.camera.updateProjectionMatrix(); }
    },
    ray(sx, sy) {
      v.camera.updateMatrixWorld(true);
      const p = new THREE.Vector3((2 * sx) / cam.w - 1, 1 - (2 * sy) / cam.h, 0.5).unproject(v.camera), o = v.camera.position, d = p.sub(o).normalize();
      return { o: toZ(o), d: toZ(d) };
    },
    fit(bb, dir = null) {
      const c = [(bb.min[0] + bb.max[0]) / 2, (bb.min[1] + bb.max[1]) / 2, (bb.min[2] + bb.max[2]) / 2], r = Math.max(Math.hypot(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]) / 2, 0.01);
      let d = dir || cam.eye.map((x, i) => x - cam.target[i]);
      const l = Math.hypot(...d) || 1; d = d.map((x) => x / l);
      const fovMin = (Math.min(v.camera.fov, v.camera.fov * v.camera.aspect) * Math.PI) / 360, dd = (r / Math.sin(fovMin)) * 1.08;
      v.controls.target.copy(fromZ(c)); v.camera.position.copy(fromZ(c.map((x, i) => x + d[i] * dd)));
      cam.clip(r); v.controls.update();
    },
    orbit(dx) { const e = cam.eye, t = cam.target, a = (dx * Math.PI) / 360, x = e[0] - t[0], y = e[1] - t[1]; cam.eye = [t[0] + x * Math.cos(a) - y * Math.sin(a), t[1] + x * Math.sin(a) + y * Math.cos(a), e[2]]; },
  };
  const bound = v.render.bind(v);
  let busy = false, radiusFn = null;
  const host = {
    id: 'bim', cam, renderer: v.renderer, canvas: v.canvas, frames: 0,
    scene: { add: (g) => { if (!wrap.parent) v.root.add(wrap); wrap.add(g); }, remove: (g) => { wrap.remove(g); if (!wrap.children.length) wrap.removeFromParent(); } },
    get data() { const o = ctx.cloud ? ctx.cloud.origin : [0, 0, 0], T = ctx.cloud ? placementOf(ctx).T : [0, 0, 0]; return { origin: { x: o[0] - T[0], y: o[1] - T[1], z: o[2] - T[2] }, exag: 1 }; },
    get draw() { return bound; },
    set draw(fn) {
      if (fn === bound) { delete v.render; return; }
      v.render = function () { if (busy) return bound(); busy = true; try { fn(); } finally { busy = false; } };
    },
    get radius() { return radiusFn || (() => Math.max(20, v.box && !v.box.isEmpty() ? v.box.getSize(new THREE.Vector3()).length() / 2 : 20)); },
    set radius(fn) { radiusFn = fn; },
    invalidate: () => v.render(),
  };
  return { v, host, wrap };
}

export function app(ctx) {
  const v = find();
  if (!v) { current = null; return null; }
  return {
    show3D: async () => {},
    get view3d() { const cv = find(); if (!cv) return null; if (!current || current.v !== cv) current = build(cv, ctx); return { view: current.host }; },
  };
}

/** The model's box turned Z-up (x, −z, y), or null while no model is open. */
function hostBox() {
  const v = find(), b = v && v.box;
  if (!b || b.isEmpty()) return null;
  return { min: [b.min.x, -b.max.z, b.min.y], max: [b.max.x, -b.min.z, b.max.y] };
}
const cache = new Map();
export function placementOf(ctx) {
  const c = ctx.cloud;
  if (!c) return { T: [0, 0, 0], how: 'centre' };
  if (!cache.has(c.id)) cache.set(c.id, placement(c.origin, c.bounds, hostBox()));
  return cache.get(c.id);
}
export function dispose() { document.querySelectorAll('[data-canvas-wrap][data-view3d]').forEach((e) => e.removeAttribute('data-view3d')); current = null; cache.clear(); }
