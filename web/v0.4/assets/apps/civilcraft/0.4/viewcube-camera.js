/* SPDX-License-Identifier: Apache-2.0 */
/**
 * viewcube-camera.js — connects the view cube (viewcube.js) to ModelCraft's own Camera (camera.js). DOM-free and
 * three-free (Node runs it). Canonical copy: modelcraft/dev/; apps that use camera.js (CadCraft's m3d, CivilCraft,
 * TakeoffCraft) keep BYTE-IDENTICAL copies next to their viewcube.js and camera.js.
 *
 *   import { mountViewCube } from './viewcube.js';
 *   import { cameraCubeOptions } from './viewcube-camera.js';
 *   const cube = mountViewCube(stage, cameraCubeOptions(cam, { invalidate: () => view.invalidate(), home: () => … }));
 *   // after every render: cube.update()
 *
 * camera.js keeps Z up and cannot roll, so a straight-down or straight-up view is tilted by 0.0002 rad towards the
 * wanted screen-up (exactly what camera.js does for its own Top view): turning a plan view 90° works, and every
 * other view has Z up on the screen, as the cube asks.
 */
import { basis, animateView, reducedMotion } from './viewcube.js';

const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]); return l > 1e-12 ? mul(a, 1 / l) : [0, 0, 0]; };

/** The camera's view for the cube: {dir, up, persp}. */
export function cameraView(cam) {
  const ax = cam.axes();
  return { dir: mul(ax.z, -1), up: ax.y.slice(), persp: cam.persp !== false };
}
/** Point the camera along view.dir (screen-up view.up where it can), keeping its target and distance. */
export function applyView(cam, view) {
  const { u, d } = basis(view);
  const dist = cam.distance || 10;
  let off = mul(d, -1);
  // camera.js takes screen-right = Z × (eye − target): tilt towards −up looking down, +up looking up
  if (Math.abs(d[2]) > 0.9999) off = norm(add(mul(d, -1), mul(u, 2e-4 * Math.sign(d[2]))));
  cam.eye = add(cam.target, mul(off, dist));
}
/** Options for mountViewCube: getView / setView (animated unless reduced motion) / onDrag (cam.orbit) / home. */
export function cameraCubeOptions(cam, { invalidate = () => {}, home = null, ms = 420, ...rest } = {}) {
  let cancel = null;
  const stop = () => { if (cancel) { cancel(); cancel = null; } };
  return {
    ...rest,
    getView: () => cameraView(cam),
    setView(view, { animate = false } = {}) {
      stop();
      const from = cameraView(cam);
      const to = { dir: view.dir, up: view.up };
      cancel = animateView(from, to, (v) => { applyView(cam, v); invalidate(); }, { ms: animate && !reducedMotion() ? ms : 0, done: () => { cancel = null; } });
    },
    onDrag(dx, dy) { stop(); cam.orbit(dx, dy); invalidate(); },
    home: home ? () => { stop(); home(); invalidate(); } : null,
    stop,
  };
}
