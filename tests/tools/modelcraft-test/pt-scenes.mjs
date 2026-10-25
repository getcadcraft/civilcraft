/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pt-scenes.mjs — tiny test scenes for the path tracer (0.7 RN.1, session `render`), as plain data: no three.js, no DOM, so the
 * same scene goes to Node (bin/test-render.mjs) and into a page (tools/modelcraft-test/browser-pt.mjs) as JSON. Our own, made
 * here (CC0). The bench scenes proper are `compute`'s (fixtures/render-bench/, CU.8); these are the kernels' unit scenes.
 *
 *   SCENES = {room, daylight, furnace, glass, grove, volfurnace, fogshaft, caustic, mirrorlight}   each () → {items: [{pos: number[], nor: number[], uv?: number[], look,
 *                                                 matrix?: number[16], ref?: index of an earlier item whose geometry it shares}],
 *                                                 up, bounds, groundAt, sun, lights, camera: {world, proj}, settings, uniformEnv?}
 *   applyPatches(packed, data, finishRecord?) → packed   data.uniformEnv / data.matPatch [[material, float offset, value]]
 *                                         (furnace scenes); pass pt-pack.js finishRecord so the derived words follow
 *   shimScene(data) → a scene the renderer takes (items with BufferGeometry-shaped geometries; camera(aspect) → matrices)
 */

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

/** Camera to world (column-major) looking from eye at target, up = up. */
export function lookAt(eye, target, up) {
  const z = norm(sub(eye, target)), x = norm(cross(up, z)), y = cross(z, x);
  return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, eye[0], eye[1], eye[2], 1];
}
export function perspective(fovDeg, aspect, near, far) {
  const f = 1 / Math.tan((fovDeg * Math.PI) / 360), nf = 1 / (near - far);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
}

/** A quad a, b, c, d (counter-clockwise seen from its front) as two triangles with its normal. */
function quad(out, a, b, c, d) {
  const n = norm(cross(sub(b, a), sub(d, a)));
  for (const p of [a, b, c, a, c, d]) { out.pos.push(...p); out.nor.push(...n); out.uv.push(p[0], p[1]); }
  return out;
}
function boxItem(min, max, look) {
  const o = { pos: [], nor: [], uv: [], look };
  const [x0, y0, z0] = min, [x1, y1, z1] = max;
  quad(o, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]);   // top
  quad(o, [x0, y1, z0], [x1, y1, z0], [x1, y0, z0], [x0, y0, z0]);   // bottom
  quad(o, [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]);   // −y
  quad(o, [x1, y1, z0], [x0, y1, z0], [x0, y1, z1], [x1, y1, z1]);   // +y
  quad(o, [x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1]);   // −x
  quad(o, [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]);   // +x
  return o;
}
/** A UV sphere (smooth normals). */
function sphereItem(c, r, look, seg = 16, rings = 10) {
  const o = { pos: [], nor: [], uv: [], look };
  const P = (i, j) => { const th = (Math.PI * j) / rings, ph = (2 * Math.PI * i) / seg; const n = [Math.sin(th) * Math.cos(ph), Math.sin(th) * Math.sin(ph), Math.cos(th)]; return { p: [c[0] + r * n[0], c[1] + r * n[1], c[2] + r * n[2]], n }; };
  for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
    const a = P(i, j), b = P(i, j + 1), cc = P(i + 1, j + 1), d = P(i + 1, j);
    for (const v of [a, b, cc, a, cc, d]) { o.pos.push(...v.p); o.nor.push(...v.n); o.uv.push(i / seg, j / rings); }
  }
  return o;
}
const bounds = (items) => {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const it of items) for (let i = 0; i < it.pos.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], it.pos[i + k]); max[k] = Math.max(max[k], it.pos[i + k]); }
  return { min, max };
};

export const SCENES = {
  /** A closed room lit by one area lamp (night: no sun), red and green side walls, a white block, a mirror ball. */
  room() {
    const items = [];
    const walls = { pos: [], nor: [], uv: [], look: '#d8d4cc' };
    quad(walls, [0, 0, 0], [0, 4, 0], [4, 4, 0], [4, 0, 0]);   // floor, facing +z (seen from above)
    quad(walls, [0, 0, 3], [4, 0, 3], [4, 4, 3], [0, 4, 3]);   // ceiling, facing −z
    quad(walls, [0, 4, 0], [0, 4, 3], [4, 4, 3], [4, 4, 0]);   // back wall, facing −y
    quad(walls, [0, 0, 0], [4, 0, 0], [4, 0, 3], [0, 0, 3]);   // front wall behind the camera, facing +y
    items.push(walls);
    const red = { pos: [], nor: [], uv: [], look: '#b03a2e' }; quad(red, [0, 0, 0], [0, 0, 3], [0, 4, 3], [0, 4, 0]); items.push(red);
    const green = { pos: [], nor: [], uv: [], look: '#3f8f45' }; quad(green, [4, 4, 0], [4, 4, 3], [4, 0, 3], [4, 0, 0]); items.push(green);
    items.push(boxItem([1.0, 2.0, 0], [2.0, 3.0, 1.4], '#eeeeee'));
    items.push(sphereItem([2.9, 1.8, 0.6], 0.6, '#c0c0c0'));
    return {
      items, up: [0, 0, 1], bounds: bounds(items), groundAt: 0, sun: null,
      lights: [{ kind: 'area', p: [2, 2, 2.98], dir: [0, 0, -1], color: '#ffffff', lumens: 3000, size: [1, 1], on: true }],
      camera: { world: lookAt([2, 0.25, 1.5], [2, 4, 1.3], [0, 0, 1]), proj: perspective(70, 1, 0.05, 50) },
      settings: { sky: 'clear', ground: false, looks: { '#c0c0c0': 'chrome' } },
    };
  },
  /** Daylight: a block, a metal ball, a glass pane in front of a wall, on the ground, under the sun and sky. */
  daylight() {
    const items = [boxItem([-1, -1, 0], [1, 1, 1.2], '#c9a675'), sphereItem([1.8, -0.6, 0.5], 0.5, '#9aa0a6')];
    const pane = { pos: [], nor: [], uv: [], look: '#c9dbe6' }; quad(pane, [-1.5, -2, 0], [1.5, -2, 0], [1.5, -2, 1.6], [-1.5, -2, 1.6]); items.push(pane);
    return {
      items, up: [0, 0, 1], bounds: bounds(items), groundAt: 0, sun: norm([0.5, -0.6, 0.62]), lights: [],
      camera: { world: lookAt([3.5, -6, 2.4], [0, 0, 0.6], [0, 0, 1]), proj: perspective(45, 1, 0.1, 200) },
      settings: { sky: 'clear', ground: true, looks: { '#9aa0a6': 'metal', '#c9dbe6': 'glass' } },
    };
  },
  /** White furnace: a white Lambert sphere in a uniform environment of radiance 1 → every pixel → 1. */
  furnace() {
    const items = [sphereItem([0, 0, 0], 1, '#ffffff', 24, 16)];
    return {
      items, up: [0, 0, 1], bounds: bounds(items), groundAt: -2, sun: null, lights: [], uniformEnv: 1,
      matPatch: [[1, 7, 0]],   // specular weight 0: a pure Lambert sphere
      camera: { world: lookAt([0, -4, 0], [0, 0, 0], [0, 0, 1]), proj: perspective(40, 1, 0.1, 50) },
      settings: { sky: 'white', ground: false, looks: { '#ffffff': 'matte' } },
    };
  },
  /** RN.7, the volume furnace: a white-albedo cloud (an empty scene: no surfaces) in the uniform environment → every pixel → 1. */
  volfurnace() {
    return {
      items: [], up: [0, 0, 1], bounds: { min: [-2, -2, -2], max: [2, 2, 2] }, groundAt: -3, sun: null, lights: [], uniformEnv: 1, maxBounces: 48,
      camera: { world: lookAt([0, -6, 0], [0, 0, 0], [0, 0, 1]), proj: perspective(36, 1, 0.1, 50) },
      settings: { sky: 'white', ground: false, volume: { on: true, kind: 'cloud', size: 4, density: 0.8, color: '#ffffff', g: 0.4, res: 20, seed: 3 } },
    };
  },
  /** RN.7: a sun and a fog layer in a black sky, the camera 2 m up looking along +y with a 2° view: the in-scattered sunlight. */
  fogshaft() {
    return {
      items: [], up: [0, 0, 1], bounds: { min: [-5, -5, 0], max: [5, 5, 4] }, groundAt: 0, sun: norm([0.3, -0.5, 0.45]), lights: [], uniformEnv: 1e-9,
      camera: { world: lookAt([0, 0, 2], [0, 10, 2], [0, 0, 1]), proj: perspective(2, 1, 0.1, 50) },
      settings: { sky: 'clear', ground: false, fog: { on: true, visibility: 78.24, top: 10, g: 0.5, color: '#ffffff' } },
    };
  },
  /** RN.7: caustics. A smooth glass ball on the ground under a rectangular lamp, nothing else (black sky): the ball focuses the lamp's light into a bright patch on the ground. */
  caustic() {
    const items = [sphereItem([0, 0, 0.45], 0.45, '#ffffff', 28, 18)];
    return {
      items, up: [0, 0, 1], bounds: { min: [-2, -2, 0], max: [2, 2, 2.6] }, groundAt: 0, sun: null, uniformEnv: 1e-9,
      lights: [{ kind: 'area', name: 'Lamp', p: [0, 0, 2.5], dir: [0, 0, -1], color: '#ffffff', lumens: 4000, size: [0.8, 0.8], on: true }],
      camera: { world: lookAt([0, -2.6, 2.2], [0, 0.2, 0.1], [0, 0, 1]), proj: perspective(42, 1, 0.05, 60) },
      settings: { sky: 'white', ground: true, looks: { '#ffffff': 'glass' }, caustics: true },
    };
  },
  /** RN.7: a lamp that faces up lights the floor only through a mirror above it (every bit of the floor's light is a specular tail). */
  mirrorlight() {
    const items = [];
    const mirror = { pos: [], nor: [], uv: [], look: '#d0d0d0' };
    quad(mirror, [-1.6, 1.6, 2], [1.6, 1.6, 2], [1.6, -1.6, 2], [-1.6, -1.6, 2]);   // facing down
    items.push(mirror);
    return {
      items, up: [0, 0, 1], bounds: { min: [-2, -2, 0], max: [2, 2, 2.2] }, groundAt: 0, sun: null, uniformEnv: 1e-9,
      lights: [{ kind: 'area', name: 'Up', p: [1.1, 0, 0.9], dir: [0, 0, 1], color: '#ffffff', lumens: 2500, size: [0.7, 0.7], on: true }],
      camera: { world: lookAt([0, -3.6, 1.3], [0, 0, 0.2], [0, 0, 1]), proj: perspective(52, 1, 0.05, 60) },
      settings: { sky: 'white', ground: true, looks: { '#d0d0d0': 'chrome' }, caustics: true },
    };
  },
  /** A grove: one tree geometry placed 25 times (two looks), so the pack builds two levels (§ 6.3 v2 instances). */
  grove() {
    const trunk = boxItem([-0.12, -0.12, 0], [0.12, 0.12, 1.2], '#6b4a2f');
    const crown = sphereItem([0, 0, 1.7], 0.6, '#3f7a45', 12, 8);
    const items = [];
    for (let i = 0; i < 25; i++) {
      const x = (i % 5) * 2 - 4, y = Math.floor(i / 5) * 2 - 4, s = 0.8 + 0.4 * ((i * 7) % 5) / 4;
      const m = [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, x, y, 0, 1];
      items.push(i === 0 ? { ...trunk, matrix: m } : { ref: 0, look: trunk.look, matrix: m });
      items.push(i === 0 ? { ...crown, matrix: m } : { ref: 1, look: i % 3 ? crown.look : '#8a9a3a', matrix: m });
    }
    return {
      items, up: [0, 0, 1], bounds: { min: [-5, -5, 0], max: [5, 5, 3] }, groundAt: 0, sun: norm([0.4, -0.5, 0.75]), lights: [],
      camera: { world: lookAt([7, -9, 5], [0, 0, 0.8], [0, 0, 1]), proj: perspective(45, 1, 0.1, 200) },
      settings: { sky: 'clear', ground: true, looks: {} },
    };
  },
  /** Glass furnace: a smooth solid glass ball in the uniform environment → 1 (refraction in and out cancels the η² scaling). */
  glass() {
    const items = [sphereItem([0, 0, 0], 1, '#ffffff', 24, 16)];
    return {
      items, up: [0, 0, 1], bounds: bounds(items), groundAt: -2, sun: null, lights: [], uniformEnv: 1,
      camera: { world: lookAt([0, -4, 0], [0, 0, 0], [0, 0, 1]), proj: perspective(40, 1, 0.1, 50) },
      matPatch: [[1, 11, 1], [1, 15, 0], [1, 8, 0]],   // all transmission, solid (not thin-walled), perfectly smooth
      settings: { sky: 'white', ground: false, looks: { '#ffffff': 'glass' } },
    };
  },
  /** RN.3: the room under five lamps of four kinds, one with an IES profile (a narrow cos³ downlight, ours). */
  lamps() {
    const d = SCENES.room();
    d.lights = [
      { kind: 'point', name: 'Bulb', p: [1, 1, 2.5], dir: [0, 0, -1], color: '#ffffff', lumens: 800, size: [0.12], on: true },
      { kind: 'spot', name: 'Spot', p: [3, 1, 2.5], dir: [0, 0.3, -1], color: '#ffd8a0', lumens: 1200, angle: 60, size: [0.1], on: true },
      { kind: 'area', name: 'Panel', p: [2, 2, 2.98], dir: [0, 0, -1], color: '#ffffff', lumens: 1500, size: [1, 0.6], on: true },
      { kind: 'disc', name: 'Disc', p: [1, 3, 2.9], dir: [0, 0, -1], color: '#e0f0ff', lumens: 1500, size: [0.5], on: true },
      { kind: 'point', name: 'Downlight', p: [3, 3, 2.7], dir: [0, 0, -1], color: '#ffffff', lumens: 900, size: [0.08], on: true },
    ];
    d.settings = { ...d.settings, ies: { Downlight: { file: 'narrow.ies', text: iesCos3() } } };
    return d;
  },
  /** RN.3: the daylight scene under Preetham's physical sky (turbidity 4), the sun through the atmosphere. */
  physical() {
    const d = SCENES.daylight();
    d.settings = { ...d.settings, sky: 'physical', turbidity: 4 };
    return d;
  },
  /** RN.6: the lamps scene with every render element and light mixing on. */
  elements() {
    const d = SCENES.lamps();
    d.settings = { ...d.settings, mode: 'hq', elements: true, lightMix: true };
    return d;
  },
  /** RN.4: the room through a fast lens (f/2, six blades), focused on the white block — the walls blur. */
  dof() {
    const d = SCENES.room();
    d.settings = { ...d.settings, mode: 'hq', dof: true, fstop: 2, blades: 6, focus: 2.2 };
    return d;
  },
  /** RN.4: the daylight scene as a 360° panorama (two-point camera: levelled). */
  pano() {
    const d = SCENES.daylight();
    d.settings = { ...d.settings, mode: 'hq', projection: 'equirect', twoPoint: true };
    return d;
  },
  /** RN.4: the room as a cube map. */
  cube() {
    const d = SCENES.room();
    d.settings = { ...d.settings, mode: 'hq', projection: 'cube' };
    return d;
  },
  /** RN.4: the room with the camera moving 30 cm sideways over the shutter (camera motion blur). */
  motion() {
    const d = SCENES.room();
    d.settings = { ...d.settings, mode: 'hq' };
    d.cameraMove = [0.3, 0, 0];
    return d;
  },
  /** RN.3: a glowing panel over a floor in the dark (an OpenPBR scene for packBench: its triangles become lights). */
  glow() {
    const tri = (pos) => { const t = []; for (let k = 0; k < pos.length; k += 9) t.push(pos[k], pos[k + 1], pos[k + 2], 0, pos[k + 3] - pos[k], pos[k + 4] - pos[k + 1], pos[k + 5] - pos[k + 2], 0, pos[k + 6] - pos[k], pos[k + 7] - pos[k + 1], pos[k + 8] - pos[k + 2], 0); return t; };
    const place = (s0, z) => [s0, 0, 0, 0, 0, s0, 0, 0, 0, 0, 1, 0, -s0 / 2 + 0.5, -s0 / 2 + 0.5, z, 1];
    return {
      bench: {
        up: [0, 0, 1], env: { kind: 'black' }, sun: null, lights: [],
        materials: [{ name: 'floor', base_color: '#c8c8c8', specular_roughness: 0.6 }, { name: 'glow', base_color: '#000000', specular_weight: 0, emission_luminance: 500, emission_color: '#ffe0c0' }],
        meshes: [{ tris: tri([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0]) }, { tris: tri([0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0]) }],
        instances: [{ mesh: 0, material: 0, m: place(6, 0) }, { mesh: 1, material: 1, m: place(0.6, 1.2) }],
        camera: { world: lookAt([0.5, -2.5, 1.6], [0.5, 0.5, 0.2], [0, 0, 1]), proj: perspective(50, 1, 0.05, 50) },
      },
    };
  },
};

/** An IES (LM-63-2002) text: a narrow downlight, candela ∝ cos³ θ to 90°, nothing above — made here, ours. */
export function iesCos3() {
  const v = [], c = [];
  for (let a = 0; a <= 90; a += 5) { v.push(a); c.push(1000 * Math.cos((a * Math.PI) / 180) ** 3); }
  v.push(180); c.push(0);
  return ['IESNA:LM-63-2002', '[TEST] narrow downlight (ours)', 'TILT=NONE', `1 1000 1 ${v.length} 1 1 2 0.1 0.1 0`, '1 1 20', v.join(' '), '0', c.map((x) => x.toFixed(2)).join(' ')].join('\n');
}

/** A scene's packed buffers: packScene for the app's scenes, packBench for an OpenPBR one (`bench`). */
export function packFor(PK, d, { w, h }) {
  if (d.bench) return PK.packBench({ ...d.bench, meshes: d.bench.meshes.map((m) => ({ ...m, tris: Float32Array.from(m.tris) })), camera: () => d.bench.camera }, { w, h });
  const sc = shimScene(d);
  let camera1 = null;
  if (d.cameraMove) { const c = sc.camera(w / h); camera1 = { world: c.world.slice(), proj: c.proj }; for (let k = 0; k < 3; k++) camera1.world[12 + k] += d.cameraMove[k]; }
  return applyPatches(PK.packScene(sc, d.settings, { w, h, camera1 }), d, PK.finishRecord);
}

/** Plain data → the shape the renderer takes (geometry accessors as three.js BufferGeometry has them). */
export function shimScene(d) {
  const attr = (a, k) => ({ count: a.length / k, getX: (i) => a[i * k], getY: (i) => a[i * k + 1], getZ: (i) => a[i * k + 2] });
  const geo = (it) => {
    const m = { position: attr(it.pos, 3), normal: attr(it.nor, 3), uv: it.uv ? attr(it.uv, 2) : null };
    return { getAttribute: (n) => m[n] || null, index: null, drawRange: { start: 0, count: Infinity } };
  };
  const geos = [];
  for (const it of d.items) geos.push(it.ref !== undefined ? geos[it.ref] : geo(it));
  return {
    items: d.items.map((it, i) => ({ geometry: geos[i], look: it.look, matrix: it.matrix || null })),
    defaultColor: '#e6e3dc', up: d.up, bounds: d.bounds, groundAt: d.groundAt, sun: d.sun, lights: d.lights,
    camera: (aspect) => ({ world: d.camera.world, proj: d.camera.proj.map((x, i) => (i === 0 ? d.camera.proj[5] / aspect : x)) }),
  };
}

export function applyPatches(packed, d, finishRecord = null) {
  if (d.uniformEnv) uniformEnvironment(packed, d.uniformEnv);
  if (d.maxBounces) new Float32Array(packed.header)[55] = d.maxBounces;   // deep scattering (RN.7's furnace)
  const F = packed.mats.length / (new Uint32Array(packed.header)[4] || 1);   // floats per record
  const touched = new Set();
  for (const [m, o, v] of d.matPatch || []) { packed.mats[m * F + o] = v; touched.add(m); }
  // the record's derived words (IOR after the weight rule, …) follow the patched values
  if (finishRecord) for (const m of touched) finishRecord(packed.mats.subarray(m * F, m * F + F));
  return packed;
}

/** Make a packed scene's environment uniform (the furnace tests): zenith = horizon = ground = v, intensity 1. */
export function uniformEnvironment(packed, v = 1) {
  const hf = new Float32Array(packed.header);
  for (const o of [48, 52, 56]) { hf[o] = v; hf[o + 1] = v; hf[o + 2] = v; }
  hf[51] = 1;
  return packed;
}
