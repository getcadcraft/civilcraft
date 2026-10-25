/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: file-format errors for developers and the scene files; never shown as app text */
/**
 * bench-scenes.js — the render bench scenes (0.7 CU.8): reads a `cadcraft-render-bench` v1 file (fixtures/render-bench/, made
 * by tools/bench/render/make-scenes.mjs) and expands it into what the kernels and the BVH take: triangle records per mesh
 * (RENDER-SPEC § 6.2), instances with their materials, the camera matrices, lights and environment. DOM-free, import-free.
 * The files are ours, but are still checked like any input (sizes, numbers, references).
 *
 *   readBenchScene(json) → scene | throws Error('bench scene: …')
 *   expandScene(scene, { tier = 'cpu', frame = 0 }) → {
 *     name, up, image {w, h}, env, sun, lights, materials,
 *     meshes: [{ name, tris: Float32Array (12 / triangle) }],
 *     instances: [{ mesh, material, m (16, column-major) }],   scatter expanded for the tier, animation keys applied
 *     triangles (placed: Σ over instances), camera(aspect) → { world, proj } (column-major; looks down −Z, as render-core) }
 *   srgbToLinear('#rrggbb') → [r, g, b]
 *   SCENES                  the scene keys the bench runs, in order
 *
 * File fields: format 'cadcraft-render-bench', version 1, name, license, source, up [3], camera {eye, target, up, fovY (deg)},
 * image {w, h}, env {kind 'black' | 'uniform' (radiance) | 'gradient' (zenith, horizon, ground: '#rrggbb', intensity)},
 * sun null | {dir (toward the sun), irradiance (W/m², RENDER-SPEC § 5.2), tint}, materials [{name, RENDER-SPEC § 5.1 names;
 * colours '#rrggbb'}], meshes [{name, positions [x,y,z…], indices [a,b,c…]}], instances [{mesh, material, m [16]}],
 * lights (render-core's lamp shape: kind point|spot|area, p, dir, color, lumens, angle, size, on), scatter [{mesh, material,
 * seed, area [x0,y0,x1,y1], avoid [[x0,y0,x1,y1]…], scale [min,max], count {tier: n}}], frames null | {count, keys
 * [{instance, keys [{frame, m}]}]} (matrices interpolated component-wise between keys: fine for the bench's turns).
 */

export const SCENES = ['cornell', 'interior', 'exterior', 'product', 'anim', 'furnace-diffuse', 'furnace-glass'];
export const TIER_KEYS = ['cpu', 'gpu-low', 'gpu-high'];

const LIMITS = { meshes: 256, vertices: 2_000_000, triangles: 2_000_000, instances: 100_000, scatter: 2_000_000, materials: 256, lights: 256 };

function fail(msg) { throw new Error('bench scene: ' + msg); }
const isNum = (x) => typeof x === 'number' && Number.isFinite(x);
const vec = (v, n, what) => { if (!Array.isArray(v) || v.length !== n || !v.every(isNum)) fail(what + ' must be ' + n + ' numbers'); return v; };
const HEX = /^#[0-9a-fA-F]{6}$/;

export function srgbToLinear(hex) {
  if (!HEX.test(hex)) fail('colour ' + JSON.stringify(hex) + ' is not #rrggbb');
  return [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
}

export function readBenchScene(j) {
  if (!j || typeof j !== 'object') fail('not an object');
  if (j.format !== 'cadcraft-render-bench' || j.version !== 1) fail('format must be cadcraft-render-bench version 1');
  vec(j.up, 3, 'up');
  const c = j.camera || fail('no camera');
  vec(c.eye, 3, 'camera.eye'); vec(c.target, 3, 'camera.target'); vec(c.up, 3, 'camera.up');
  if (!isNum(c.fovY) || c.fovY <= 1 || c.fovY >= 179) fail('camera.fovY must be 1–179 degrees');
  if (!j.image || !Number.isInteger(j.image.w) || !Number.isInteger(j.image.h) || j.image.w < 1 || j.image.h < 1 || j.image.w * j.image.h > 3840 * 2160) fail('image size');
  const env = j.env || fail('no env');
  if (!['black', 'uniform', 'gradient'].includes(env.kind)) fail('env.kind');
  if (env.kind === 'uniform' && !isNum(env.radiance)) fail('env.radiance');
  if (env.kind === 'gradient') for (const k of ['zenith', 'horizon', 'ground']) srgbToLinear(env[k]);
  if (j.sun) { vec(j.sun.dir, 3, 'sun.dir'); if (!isNum(j.sun.irradiance)) fail('sun.irradiance'); }
  if (!Array.isArray(j.materials) || !j.materials.length || j.materials.length > LIMITS.materials) fail('materials');
  for (const m of j.materials) { srgbToLinear(m.base_color); for (const k of ['base_weight', 'base_metalness', 'specular_roughness', 'specular_ior', 'transmission_weight']) if (m[k] !== undefined && !isNum(m[k])) fail('material ' + m.name + ': ' + k); }
  if (!Array.isArray(j.meshes) || !j.meshes.length || j.meshes.length > LIMITS.meshes) fail('meshes');
  let verts = 0, tris = 0;
  for (const m of j.meshes) {
    if (!Array.isArray(m.positions) || m.positions.length % 3 || !Array.isArray(m.indices) || m.indices.length % 3) fail('mesh ' + m.name + ': positions/indices');
    verts += m.positions.length / 3; tris += m.indices.length / 3;
    const nv = m.positions.length / 3;
    if (!m.positions.every(isNum)) fail('mesh ' + m.name + ': a position is not a number');
    if (!m.indices.every((i) => Number.isInteger(i) && i >= 0 && i < nv)) fail('mesh ' + m.name + ': an index is out of range');
  }
  if (verts > LIMITS.vertices || tris > LIMITS.triangles) fail('too many vertices or triangles');
  if (!Array.isArray(j.instances) || j.instances.length > LIMITS.instances) fail('instances');
  const ref = (it, what) => {
    if (!Number.isInteger(it.mesh) || it.mesh < 0 || it.mesh >= j.meshes.length) fail(what + ': mesh index');
    if (!Number.isInteger(it.material) || it.material < 0 || it.material >= j.materials.length) fail(what + ': material index');
  };
  j.instances.forEach((it, k) => { ref(it, 'instance ' + k); vec(it.m, 16, 'instance ' + k + ' matrix'); });
  if (!Array.isArray(j.lights) || j.lights.length > LIMITS.lights) fail('lights');
  for (const s of j.scatter || []) {
    ref(s, 'scatter');
    vec(s.area, 4, 'scatter.area'); vec(s.scale, 2, 'scatter.scale');
    for (const t of TIER_KEYS) if (!Number.isInteger(s.count?.[t]) || s.count[t] < 0 || s.count[t] > LIMITS.scatter) fail('scatter.count.' + t);
  }
  if (j.frames) {
    if (!Number.isInteger(j.frames.count) || j.frames.count < 1 || j.frames.count > 10000) fail('frames.count');
    for (const k of j.frames.keys || []) { if (!Number.isInteger(k.instance) || k.instance < 0 || k.instance >= j.instances.length) fail('frames: instance'); for (const kk of k.keys) vec(kk.m, 16, 'frames key matrix'); }
  }
  return j;
}

function rng(seed) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function trisOf(m) {
  const P = m.positions, I = m.indices, n = I.length / 3, t = new Float32Array(n * 12);
  for (let i = 0; i < n; i++) {
    const a = I[i * 3] * 3, b = I[i * 3 + 1] * 3, c = I[i * 3 + 2] * 3;
    t[i * 12] = P[a]; t[i * 12 + 1] = P[a + 1]; t[i * 12 + 2] = P[a + 2]; t[i * 12 + 3] = 0;
    t[i * 12 + 4] = P[b] - P[a]; t[i * 12 + 5] = P[b + 1] - P[a + 1]; t[i * 12 + 6] = P[b + 2] - P[a + 2]; t[i * 12 + 7] = 0;
    t[i * 12 + 8] = P[c] - P[a]; t[i * 12 + 9] = P[c + 1] - P[a + 1]; t[i * 12 + 10] = P[c + 2] - P[a + 2]; t[i * 12 + 11] = 0;
  }
  return t;
}

function keyAt(keys, frame) {
  if (!keys.length) return null;
  if (frame <= keys[0].frame) return keys[0].m;
  for (let i = 1; i < keys.length; i++) {
    if (frame <= keys[i].frame) {
      const a = keys[i - 1], b = keys[i], u = (frame - a.frame) / Math.max(1e-9, b.frame - a.frame);
      return a.m.map((x, k) => x + (b.m[k] - x) * u);
    }
  }
  return keys[keys.length - 1].m;
}

function normalize(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

export function expandScene(scene, { tier = 'cpu', frame = 0 } = {}) {
  const t = TIER_KEYS.includes(tier) ? tier : 'cpu';
  const meshes = scene.meshes.map((m) => ({ name: m.name, tris: trisOf(m) }));
  const instances = scene.instances.map((it) => ({ mesh: it.mesh, material: it.material, m: it.m.slice() }));
  if (scene.frames) for (const k of scene.frames.keys || []) { const m = keyAt(k.keys, frame); if (m) instances[k.instance].m = m; }
  for (const s of scene.scatter || []) {
    const r = rng(s.seed | 0), [x0, y0, x1, y1] = s.area, n = s.count[t];
    let made = 0, tries = 0;
    while (made < n && tries < n * 4) {
      tries++;
      const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), a = r() * 2 * Math.PI, sc = s.scale[0] + r() * (s.scale[1] - s.scale[0]);
      if ((s.avoid || []).some(([ax0, ay0, ax1, ay1]) => x >= ax0 && x <= ax1 && y >= ay0 && y <= ay1)) continue;
      const c = Math.cos(a) * sc, sn = Math.sin(a) * sc;
      instances.push({ mesh: s.mesh, material: s.material, m: [c, sn, 0, 0, -sn, c, 0, 0, 0, 0, sc, 0, x, y, 0, 1] });
      made++;
    }
  }
  const triangles = instances.reduce((a, it) => a + meshes[it.mesh].tris.length / 12, 0);
  const cam = scene.camera;
  return {
    name: scene.name, up: scene.up, image: { ...scene.image }, env: scene.env, sun: scene.sun, lights: scene.lights, materials: scene.materials,
    meshes, instances, triangles,
    /** Camera to world and projection (column-major), as render-core's adapters give them. */
    camera(aspect = scene.image.w / scene.image.h) {
      const z = normalize([cam.eye[0] - cam.target[0], cam.eye[1] - cam.target[1], cam.eye[2] - cam.target[2]]);
      const x = normalize(cross(cam.up, z)), y = cross(z, x);
      const world = [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, cam.eye[0], cam.eye[1], cam.eye[2], 1];
      const near = 0.01, far = 1e4, f = 1 / Math.tan((cam.fovY * Math.PI) / 360);
      const proj = [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
      return { world, proj };
    },
  };
}

/** A camera ray through pixel (px + jx, py + jy) of a w × h image (RENDER-SPEC § 1): { o, d } in world space. */
export function cameraRay(cam, w, h, px, py, jx = 0.5, jy = 0.5) {
  const { world: W, proj: P } = cam;
  const nx = (2 * (px + jx)) / w - 1, ny = 1 - (2 * (py + jy)) / h;
  // perspective only (the bench scenes): direction in camera space from the projection's focal terms
  const dx = nx / P[0], dy = ny / P[5], dz = -1;
  const d = normalize([W[0] * dx + W[4] * dy + W[8] * dz, W[1] * dx + W[5] * dy + W[9] * dz, W[2] * dx + W[6] * dy + W[10] * dz]);
  return { o: [W[12], W[13], W[14]], d };
}
