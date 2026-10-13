/* SPDX-License-Identifier: Apache-2.0 */
/**
 * camera.js — the ModelCraft camera. No DOM, no three.js: the view hands its matrices to three.js,
 * and picking/inference use the same matrices, so what you click is what you see.
 *
 *   cam.setSize(w, h)                     the drawing area in CSS pixels
 *   cam.view() / proj() / viewProj()      4×4 column-major (OpenGL clip space, like three.js)
 *   cam.project(p) → [x, y, depth] | null screen pixels from the top-left; null behind the eye
 *   cam.ray(x, y) → {o, d}                the pick ray through a pixel (d unit)
 *   cam.orbit(dx, dy) · pan(dx, dy) · zoomAt(factor, x, y, pivot?) · fit(bbox) · standard(name)
 *   cam.toJSON() / set(json)              {eye, target, fov, persp, height} (scenes)
 * Z is up. Parallel projection shows the same area the perspective view shows at the target.
 */
import { add, sub, mul, dot, cross, len, norm, dist, mmul, rayPlane } from './vec.js';

export const VIEWS = {
  iso: [1, -1.15, 0.85],
  top: [0, -1e-4, 1],
  bottom: [0, -1e-4, -1],
  front: [0, -1, 0],
  back: [0, 1, 0],
  left: [-1, 0, 0],
  right: [1, 0, 0],
};
export const VIEW_LABELS = { iso: 'Iso', top: 'Top', bottom: 'Bottom', front: 'Front', back: 'Back', left: 'Left', right: 'Right' };

export class Camera {
  constructor() {
    this.eye = [9, -12, 8];
    this.target = [0, 0, 1];
    this.fov = 35;            // vertical, degrees
    this.persp = true;
    this.w = 800; this.h = 600;
    this.near = 0.05; this.far = 5000;
    this.sceneRadius = 20;
  }
  setSize(w, h) { this.w = Math.max(1, w); this.h = Math.max(1, h); }
  get aspect() { return this.w / this.h; }
  get distance() { return dist(this.eye, this.target); }
  /** Height of the parallel view (m): what the perspective view shows at the target distance. */
  get height() { return 2 * this.distance * Math.tan((this.fov * Math.PI) / 360); }
  axes() {
    const z = norm(sub(this.eye, this.target));
    let x = cross([0, 0, 1], z);
    if (len(x) < 1e-9) x = [1, 0, 0];
    x = norm(x);
    return { x, y: cross(z, x), z };
  }
  /** Near/far planes from the model's size so nothing clips and depth stays precise. */
  clip(radius = this.sceneRadius) {
    this.sceneRadius = Math.max(radius, 1);
    const d = this.distance;
    this.far = d + this.sceneRadius * 4 + 100;
    this.near = Math.max(this.far / 1e5, Math.min(d * 0.01, 0.05));
  }
  view() {
    const { x, y, z } = this.axes(), e = this.eye;
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
  }
  proj() {
    const n = this.near, f = this.far;
    if (this.persp) {
      const t = 1 / Math.tan((this.fov * Math.PI) / 360);
      return [t / this.aspect, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, (2 * f * n) / (n - f), 0];
    }
    const hh = this.height / 2, hw = hh * this.aspect, nn = -f;
    return [1 / hw, 0, 0, 0, 0, 1 / hh, 0, 0, 0, 0, -2 / (f - nn), 0, 0, 0, -(f + nn) / (f - nn), 1];
  }
  viewProj() { return mmul(this.proj(), this.view()); }
  project(p, vp = this.viewProj()) {
    const x = vp[0] * p[0] + vp[4] * p[1] + vp[8] * p[2] + vp[12];
    const y = vp[1] * p[0] + vp[5] * p[1] + vp[9] * p[2] + vp[13];
    const z = vp[2] * p[0] + vp[6] * p[1] + vp[10] * p[2] + vp[14];
    const w = vp[3] * p[0] + vp[7] * p[1] + vp[11] * p[2] + vp[15];
    if (w <= 1e-9) return null;
    return [(x / w + 1) * this.w / 2, (1 - y / w) * this.h / 2, z / w];
  }
  ray(sx, sy) {
    const { x, y, z } = this.axes();
    const nx = (2 * sx) / this.w - 1, ny = 1 - (2 * sy) / this.h;
    const th = Math.tan((this.fov * Math.PI) / 360);
    if (this.persp) {
      return { o: this.eye.slice(), d: norm(add(add(mul(x, nx * th * this.aspect), mul(y, ny * th)), mul(z, -1))) };
    }
    const hh = this.height / 2, hw = hh * this.aspect;
    const o = add(add(add(this.eye, mul(x, nx * hw)), mul(y, ny * hh)), mul(z, this.far * 0.5));
    return { o, d: mul(z, -1) };
  }
  /** Meters per pixel at a point's depth (for pixel tolerances in model units). */
  pixelSize(p = this.target) {
    const depth = this.persp ? Math.max(dot(sub(p, this.eye), mul(this.axes().z, -1)), 1e-6) : this.distance;
    return (2 * depth * Math.tan((this.fov * Math.PI) / 360)) / this.h;
  }

  orbit(dx, dy) {
    const off = sub(this.eye, this.target);
    const r = len(off);
    let yaw = Math.atan2(off[1], off[0]) - dx * 0.008;
    let pitch = Math.acos(Math.max(-1, Math.min(1, off[2] / r))) - dy * 0.008;
    pitch = Math.max(0.001, Math.min(Math.PI - 0.001, pitch));
    this.eye = add(this.target, [r * Math.sin(pitch) * Math.cos(yaw), r * Math.sin(pitch) * Math.sin(yaw), r * Math.cos(pitch)]);
  }
  pan(dx, dy) {
    const { x, y } = this.axes(), s = this.pixelSize(this.target);
    const mv = add(mul(x, -dx * s), mul(y, dy * s));
    this.eye = add(this.eye, mv);
    this.target = add(this.target, mv);
  }
  /** factor < 1 zooms in, keeping `pivot` (or the point under the cursor on the target plane) still. */
  zoomAt(factor, sx = this.w / 2, sy = this.h / 2, pivot = null) {
    let P = pivot;
    if (!P) {
      const r = this.ray(sx, sy), z = this.axes().z;
      const hit = rayPlane(r.o, r.d, { n: z, d: dot(z, this.target) });
      P = hit ? hit.p : this.target;
    }
    const d0 = this.distance;
    const nd = d0 * factor;
    if (nd < 1e-3 || nd > 1e6) return;
    if (this.persp) {
      this.eye = add(P, mul(sub(this.eye, P), factor));
      this.target = add(P, mul(sub(this.target, P), factor));
    } else {
      // parallel: shrink the view about P, keep the eye's distance proportional
      const { z } = this.axes();
      const tgt = add(P, mul(sub(this.target, P), factor));
      const along = dot(sub(tgt, this.target), z);
      const t2 = sub(tgt, mul(z, along));
      this.target = t2;
      this.eye = add(t2, mul(z, nd));
    }
  }
  /** Look at a bounding box from the current direction (or `dir`). */
  fit(bb, dir = null) {
    const d = norm(dir || sub(this.eye, this.target));
    const c = bb ? mul(add(bb.min, bb.max), 0.5) : [0, 0, 0];
    const r = bb ? Math.max(dist(bb.min, bb.max) / 2, 0.5) : 5;
    const fovMin = Math.min(this.fov, this.fov * this.aspect) * Math.PI / 360;
    const dd = (r / Math.sin(fovMin)) * 1.08;
    this.target = c;
    this.eye = add(c, mul(d, dd));
    this.clip(r);
  }
  standard(name, bb) { this.fit(bb, VIEWS[name] || VIEWS.iso); }
  toJSON() { return { eye: this.eye.slice(), target: this.target.slice(), fov: this.fov, persp: this.persp, height: this.height }; }
  set(j) {
    this.eye = j.eye.slice(); this.target = j.target.slice();
    if (j.fov) this.fov = j.fov;
    this.persp = j.persp !== false;
  }
}

/** Camera halfway between two saved cameras (scene transitions): eye and target move in straight lines. */
export function lerpCam(a, b, t) {
  const s = t * t * (3 - 2 * t);
  const l = (p, q) => add(p, mul(sub(q, p), s));
  return { eye: l(a.eye, b.eye), target: l(a.target, b.target), fov: a.fov + (b.fov - a.fov) * s, persp: s < 0.5 ? a.persp : b.persp };
}
