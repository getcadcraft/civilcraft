/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view.js — the night picture and the false-colour picture beside it (0.10 SU.1816, session `night-light-10`). DOM-free.
 *
 *   nightScene({ room, luminaires, outdoor, obstacles, axes, aspect, lamps, ies }) → plain scene data for the path tracer: items (triangles), lights, camera, bounds
 *   cameraFor(room, { outdoor, aspect, axes }) → { world, proj }   a standing view inside the room, or a raised view of the site
 *   rendererScene(data) → the object render/pt-pack.js packScene takes (geometry accessors; camera(aspect))
 *   renderNight({ kit, data, settings, w, h, spp, onProgress, tick }) → { accum, bytes, w, h }   kit = { PK: pt-pack.js, REF: pt-ref.js, SMP: pt-sampler.js }
 *   falseColour({ w, h, camera, axes, planeZ, inside, luxAt, range, base }) → { rgba, lux (Float32Array, NaN off the plane), range, covered, legend }
 *   pixelLux(accum, w, px, py, rho, r) → lux a Lambertian floor of reflectance rho must have for the render to show what it shows at (px, py)
 *
 * The false colour is NOT read from the picture: each pixel's ray is cut with the workplane (or the ground), and the lux there come from the same calculation as the
 * result table. The picture is the path tracer's own. Where they should agree (a Lambertian surface, the lamps' own web) they are compared in test/night.test.mjs.
 */
import { axesOf, luxFromRadiance } from './night.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const linearToSrgb = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const greyHex = (rho) => { const v = Math.round(255 * linearToSrgb(Math.min(1, Math.max(0, rho)))).toString(16).padStart(2, '0'); return '#' + v + v + v; };

export function lookAt(eye, target, up) {
  const z = unit(sub(eye, target)), x = unit(cross(up, z)), y = cross(z, x);
  return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, eye[0], eye[1], eye[2], 1];
}
export function perspective(fovDeg, aspect, near = 0.05, far = 500) {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}

// ------------------------------------------------------------------------------------------------------------- geometry
/** Ear clipping of a simple polygon [[x, y]] → triangles of three corners each. */
export function triangulate(poly) {
  const P = poly.map((p) => [p[0], p[1]]);
  let a = 0; for (let i = 0; i < P.length; i++) { const u = P[i], v = P[(i + 1) % P.length]; a += u[0] * v[1] - v[0] * u[1]; }
  const idx = P.map((_, i) => i); if (a < 0) idx.reverse();
  const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
  const inTri = (p, A, B, C) => cr(A, B, p) >= 0 && cr(B, C, p) >= 0 && cr(C, A, p) >= 0;
  const out = []; let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k + idx.length - 1) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length], A = P[i0], B = P[i1], C = P[i2];
      if (cr(A, B, C) <= 0) continue;
      if (idx.some((j) => j !== i0 && j !== i1 && j !== i2 && inTri(P[j], A, B, C))) continue;
      out.push([A, B, C]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) break;
  }
  if (idx.length === 3) out.push([P[idx[0]], P[idx[1]], P[idx[2]]]);
  return out;
}
const newItem = (look) => ({ pos: [], nor: [], uv: [], look });
function tri(it, A, a, b, c, n) { for (const p of [a, b, c]) { it.pos.push(...A.pt(p)); it.nor.push(...A.dir(n)); it.uv.push(p[0] / 1000, p[1] / 1000); } }
function quad(it, A, a, b, c, d, n) { tri(it, A, a, b, c, n); tri(it, A, a, c, d, n); }
function box(it, A, o) {
  const { x0, y0, x1, y1, z0, z1 } = o;
  quad(it, A, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
  quad(it, A, [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0], [0, 0, -1]);
  quad(it, A, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0]);
  quad(it, A, [x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [0, 1, 0]);
  quad(it, A, [x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [-1, 0, 0]);
  quad(it, A, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], [1, 0, 0]);
}
const bboxOf = (poly) => { const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]); return { x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) }; };
const centroid = (poly) => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];

/** The standing view in a room (eye 1.6 m, from the corner nearest the minimum corner, looking across) or a raised view of the site from the south-west. mm → scene units. */
export function cameraFor(room, { outdoor = false, aspect = 16 / 9, axes = 'z', fov = 0 } = {}) {
  const A = axesOf(axes), P = room.polygon, bb = bboxOf(P), c = centroid(P), W = bb.x1 - bb.x0, D = bb.y1 - bb.y0;
  let eye, target;
  if (outdoor) {
    const ext = Math.max(W, D, (room.height || 6000) * 1.5), az = -2.4, el = 0.55, dist = ext * 1.5;
    eye = [c[0] + Math.cos(az) * Math.cos(el) * dist, c[1] + Math.sin(az) * Math.cos(el) * dist, Math.sin(el) * dist];
    target = [c[0], c[1], 0];
  } else {
    const v = P.reduce((best, p) => (Math.hypot(p[0] - bb.x0, p[1] - bb.y0) < Math.hypot(best[0] - bb.x0, best[1] - bb.y0) ? p : best), P[0]);
    eye = [v[0] + (c[0] - v[0]) * 0.15, v[1] + (c[1] - v[1]) * 0.15, Math.min(1600, room.height * 0.6)];
    target = [c[0] + (c[0] - eye[0]) * 0.8, c[1] + (c[1] - eye[1]) * 0.8, 700];
  }
  return { world: lookAt(A.pt(eye), A.pt(target), A.up), proj: perspective(fov || (outdoor ? 45 : 85), aspect) };
}

/**
 * Scene data of a room (floor, ceiling, walls with the design's own reflectances) or a site (a ground sheet around the area, the boxes). The surfaces are the tracer's
 * 'matte' look at a grey of the stated reflectance; the tracer's matte has a faint specular lobe a perfectly diffuse calculation does not (see the test's tolerance).
 */
export function nightScene({ room, luminaires, outdoor = false, obstacles = null, axes = 'z', aspect = 16 / 9, lamps, ies, settings = {}, modelItems = null, shell = true }) {
  const A = axesOf(axes), P = room.polygon, H = room.height, bb = bboxOf(P), items = [];
  const rf = room.refl || { ceiling: 0.7, walls: 0.5, floor: 0.2 };
  const gRho = Number.isFinite(settings.groundRho) ? settings.groundRho : 0.2;
  const floor = newItem(greyHex(outdoor ? gRho : rf.floor));
  // shell: true = floor, walls and ceiling from the outline; false = none (the model brings its own, modelItems); or { floor, walls, ceiling } each on or off (0.11 SU.1816)
  const SH = shell === true ? { floor: true, walls: true, ceiling: true } : shell && typeof shell === 'object' ? shell : { floor: false, walls: false, ceiling: false };
  if (!SH.floor) { /* the model brings its own floor (modelItems) */ }
  else if (outdoor) {   // the area plus a margin of 30 %, so the pools of light have an edge to fall off
    const mx = (bb.x1 - bb.x0) * 0.3, my = (bb.y1 - bb.y0) * 0.3;
    quad(floor, A, [bb.x0 - mx, bb.y0 - my, 0], [bb.x1 + mx, bb.y0 - my, 0], [bb.x1 + mx, bb.y1 + my, 0], [bb.x0 - mx, bb.y1 + my, 0], [0, 0, 1]);
  } else for (const t of triangulate(P)) tri(floor, A, [t[0][0], t[0][1], 0], [t[1][0], t[1][1], 0], [t[2][0], t[2][1], 0], [0, 0, 1]);
  if (SH.floor) items.push(floor);
  if (!outdoor && (SH.walls || SH.ceiling)) {
    const ceil = newItem(greyHex(rf.ceiling)), walls = newItem(greyHex(rf.walls));
    for (const t of triangulate(P)) tri(ceil, A, [t[0][0], t[0][1], H], [t[2][0], t[2][1], H], [t[1][0], t[1][1], H], [0, 0, -1]);
    let s = 0; for (let i = 0; i < P.length; i++) { const u = P[i], v = P[(i + 1) % P.length]; s += u[0] * v[1] - v[0] * u[1]; }
    for (let i = 0; i < P.length; i++) {
      const u = P[i], v = P[(i + 1) % P.length], len = Math.hypot(v[0] - u[0], v[1] - u[1]) || 1, tx = (v[0] - u[0]) / len, ty = (v[1] - u[1]) / len, n = s > 0 ? [-ty, tx, 0] : [ty, -tx, 0];
      quad(walls, A, [u[0], u[1], 0], [v[0], v[1], 0], [v[0], v[1], H], [u[0], u[1], H], n);
    }
    if (SH.ceiling) items.push(ceil);
    if (SH.walls) items.push(walls);
  }
  if (modelItems && modelItems.length) for (const m of modelItems) items.push(m);   // the model's own geometry and materials (0.11 SU.1816), see modelItem()
  if (obstacles && obstacles.length) { const b = newItem(greyHex(0.35)); for (const o of obstacles) box(b, A, o); items.push(b); }
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (const it of items) for (let i = 0; i < it.pos.length; i += 3) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], it.pos[i + k]); hi[k] = Math.max(hi[k], it.pos[i + k]); }
  const lampList = lamps || [];
  return {
    items, up: A.up, bounds: { min: lo, max: hi }, groundAt: 0, sun: null, lights: lampList, ies: ies || {}, camera: cameraFor(room, { outdoor, aspect, axes }),
    settings: { sky: 'clear', ground: false, looks: {}, ies: ies || {}, ...settings },
  };
}

/**
 * One surface of the model for the night picture: tris = [[[x, y, z] mm, [x, y, z], [x, y, z]], ...] in design space (the host's own triangles), look = the renderer's look name
 * or a '#rrggbb' colour (what the host's material gives; a reflectance rho gives a grey with greyOf(rho)). Normals come from the winding (counter-clockwise = outward).
 */
export function modelItem(tris, look = '#808080', axes = 'z') {
  const A = axesOf(axes), it = newItem(look);
  for (const t of tris) {
    const n = unit(cross(sub(t[1], t[0]), sub(t[2], t[0])));
    for (const p of t) { it.pos.push(...A.pt(p)); it.nor.push(...A.dir(n)); it.uv.push(p[0] / 1000, p[1] / 1000); }
  }
  return it;
}
export const greyOf = greyHex;

/** Plain scene data → what pt-pack.js packScene takes. */
export function rendererScene(d) {
  const attr = (a, k) => ({ count: a.length / k, getX: (i) => a[i * k], getY: (i) => a[i * k + 1], getZ: (i) => a[i * k + 2] });
  const geo = (it) => { const m = { position: attr(it.pos, 3), normal: attr(it.nor, 3), uv: it.uv ? attr(it.uv, 2) : null }; return { getAttribute: (n) => m[n] || null, index: null, drawRange: { start: 0, count: Infinity } }; };
  return {
    items: d.items.map((it) => ({ geometry: geo(it), look: it.look, matrix: null })), defaultColor: '#e6e3dc', up: d.up, bounds: d.bounds, groundAt: d.groundAt, sun: d.sun, lights: d.lights,
    camera: (aspect) => ({ world: d.camera.world, proj: d.camera.proj.map((x, i) => (i === 0 ? d.camera.proj[5] / aspect : x)) }),
  };
}

export async function renderNight({ kit, data, settings, w, h, spp = 16, onProgress = null, tick = null, patch = null }) {
  const pk = kit.PK.packScene(rendererScene(data), settings, { w, h });
  if (patch) patch(pk);   // a test's hook on the packed scene (e.g. diffuse-only surfaces)
  const T = kit.REF.makeTracer(pk, { mask: kit.SMP.blueNoise() });
  let accum = null;
  for (let s = 0; s < spp; s++) { accum = T.render({ spp: 1, s0: s, accum }); if (onProgress) onProgress(s + 1, spp); if (tick) await tick(); }
  return { accum, w, h, bytes: kit.REF.toBytes(accum, w, h, settings.exposure || 0, null) };
}
/** Mean luminance (Y of the AP1 radiance, as the tracer's own weights) in the (2r + 1)² pixels around (px, py) → the lux a floor of reflectance rho would have. */
export function pixelLux(accum, w, px, py, rho, r = 1) {
  let Y = 0, n = 0;
  for (let y = py - r; y <= py + r; y++) for (let x = px - r; x <= px + r; x++) {
    const i = (y * w + x) * 4, s = accum[i + 3] || 1;
    Y += (0.2722 * accum[i] + 0.6741 * accum[i + 1] + 0.0537 * accum[i + 2]) / s; n++;
  }
  return luxFromRadiance(Y / n, rho);
}

// ------------------------------------------------------------------------------------------------------------- false colour
const STOPS = [[0, [43, 10, 88]], [0.2, [31, 79, 216]], [0.4, [22, 179, 196]], [0.6, [62, 201, 87]], [0.8, [242, 210, 27]], [1, [229, 50, 28]]];
export function colourAt(t) {
  t = Math.min(1, Math.max(0, t));
  for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) { const [t0, c0] = STOPS[i - 1], [t1, c1] = STOPS[i], f = (t - t0) / (t1 - t0); return c0.map((v, k) => Math.round(v + (c1[k] - v) * f)); }
  return STOPS[STOPS.length - 1][1].slice();
}
/** The ray of pixel (px, py) in scene space: { o, d }. Perspective only (proj[11] === -1). */
export function pixelRay(camera, w, h, px, py) {
  const M = camera.world, P = camera.proj, nx = (2 * (px + 0.5)) / w - 1, ny = 1 - (2 * (py + 0.5)) / h, c = [nx / P[0], ny / P[5], -1];
  return { o: [M[12], M[13], M[14]], d: unit([M[0] * c[0] + M[4] * c[1] + M[8] * c[2], M[1] * c[0] + M[5] * c[1] + M[9] * c[2], M[2] * c[0] + M[6] * c[1] + M[10] * c[2]]) };
}
/** Round ticks (1, 2, 5 × 10ⁿ) inside the range, each with its place on the log scale and its colour. */
export function legendTicks(range) {
  const lo = Math.log10(range.min), hi = Math.log10(range.max), out = [];
  for (let e = Math.floor(lo); e <= Math.ceil(hi); e++) for (const m of [1, 2, 5]) {
    const v = m * 10 ** e;
    if (v >= range.min * 0.999 && v <= range.max * 1.001) { const t = (Math.log10(v) - lo) / (hi - lo || 1); out.push({ lux: v, t, rgb: colourAt(t) }); }
  }
  return out;
}
/**
 * w × h picture. For each pixel the ray is cut with the horizontal plane at planeZ mm; where it lands inside the area (inside(x, y) mm) the colour is the lux there
 * (luxAt(x, y) mm → lux) on a log scale between range.min and range.max; elsewhere the pixel is the night picture (base RGBA) dimmed, or dark grey without one.
 */
export function falseColour({ w, h, camera, axes = 'z', planeZ = 0, inside = () => true, luxAt, range = null, base = null, dim = 0.4 }) {
  const A = axesOf(axes), lux = new Float32Array(w * h).fill(NaN), ui = A.upIndex, plane = planeZ / 1000;
  let covered = 0, mn = Infinity, mx = 0;
  for (let py = 0; py < h; py++) for (let px = 0; px < w; px++) {
    const { o, d } = pixelRay(camera, w, h, px, py);
    if (Math.abs(d[ui]) < 1e-9) continue;
    const t = (plane - o[ui]) / d[ui];
    if (!(t > 0)) continue;
    const p = A.inv([o[0] + d[0] * t, o[1] + d[1] * t, o[2] + d[2] * t]);
    if (!inside(p[0], p[1])) continue;
    const v = luxAt(p[0], p[1]);
    lux[py * w + px] = v; covered++;
    if (v > 0) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
  }
  const hi = range ? range.max : Math.max(mx, 1e-3), lo = range ? range.min : Math.max(Math.min(mn, hi), hi / 64), rg = { min: lo, max: Math.max(hi, lo * 1.0001) };
  const rgba = new Uint8ClampedArray(w * h * 4), l0 = Math.log10(rg.min), span = Math.log10(rg.max) - l0 || 1;
  for (let i = 0; i < w * h; i++) {
    const v = lux[i];
    if (Number.isNaN(v)) { for (let k = 0; k < 3; k++) rgba[i * 4 + k] = base ? base[i * 4 + k] * dim : 40; }
    else { const c = colourAt(v > 0 ? (Math.log10(v) - l0) / span : 0); rgba[i * 4] = c[0]; rgba[i * 4 + 1] = c[1]; rgba[i * 4 + 2] = c[2]; }
    rgba[i * 4 + 3] = 255;
  }
  return { rgba, lux, range: rg, covered, legend: legendTicks(rg) };
}
