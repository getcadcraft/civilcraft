/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: scene names inside the CC0 scene files (data) */
/**
 * bench-make.js — builds the render bench scenes (0.7 CU.8): our own scenes, CC0, every number ours (the "Cornell-style" box
 * is our own dimensions and colours, not the published Cornell data). Deterministic: the same code gives the same scenes.
 * tools/bench/render/make-scenes.mjs writes them to fixtures/render-bench/ (made once, --check compares); the bench page
 * builds them in memory from this same code (fixtures/ is not served). Format: bench-scenes.js header. DOM-free, import-free.
 *
 *   makeScenes() → { cornell, interior, exterior, product, anim, 'furnace-diffuse', 'furnace-glass' }   (plain JSON objects)
 */
export function makeScenes() {
  const scenes = {};
  const r6 = (x) => Math.round(x * 1e6) / 1e6;
  const I4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  const T = (x, y, z) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
  const TRS = (x, y, z, rz = 0, s = 1) => { const c = Math.cos(rz) * s, n = Math.sin(rz) * s; return [c, n, 0, 0, -n, c, 0, 0, 0, 0, s, 0, x, y, z, 1].map(r6); };

  class Mesh {
    constructor(name) { this.name = name; this.p = []; this.i = []; }
    v(x, y, z) { this.p.push(r6(x), r6(y), r6(z)); return this.p.length / 3 - 1; }
    tri(a, b, c) { this.i.push(a, b, c); }
    quad(a, b, c, d) { this.tri(a, b, c); this.tri(a, c, d); }
    /** A box min..max; normals out (inward with flip). */
    box(x0, y0, z0, x1, y1, z1, flip = false) {
      const v = [];
      for (let k = 0; k < 8; k++) v.push(this.v(k & 1 ? x1 : x0, k & 2 ? y1 : y0, k & 4 ? z1 : z0));
      const faces = [[0, 2, 3, 1], [4, 5, 7, 6], [0, 1, 5, 4], [2, 6, 7, 3], [0, 4, 6, 2], [1, 3, 7, 5]];
      for (const f of faces) flip ? this.quad(v[f[3]], v[f[2]], v[f[1]], v[f[0]]) : this.quad(v[f[0]], v[f[1]], v[f[2]], v[f[3]]);
      return this;
    }
    /** An axis-aligned rectangle facing `n` (±x, ±y or ±z). */
    rect(c, size, n) {
      const [cx, cy, cz] = c, [w, h] = size.map((s) => s / 2);
      const ax = n[0] ? 0 : n[1] ? 1 : 2, s = n[ax] > 0 ? 1 : -1;
      const P = (u, v) => { const q = [cx, cy, cz]; const [i, j] = [0, 1, 2].filter((k) => k !== ax); q[i] += u; q[j] += v; return this.v(...q); };
      const a = P(-w, -h), b = P(w, -h), cc = P(w, h), d = P(-w, h);
      (s > 0) === (ax !== 1) ? this.quad(a, b, cc, d) : this.quad(d, cc, b, a);
      return this;
    }
    sphere(cx, cy, cz, r, seg = 24, rings = 16) {
      const base = this.p.length / 3;
      for (let j = 0; j <= rings; j++) for (let i = 0; i <= seg; i++) {
        const th = (j / rings) * Math.PI, ph = (i / seg) * 2 * Math.PI;
        this.v(cx + r * Math.sin(th) * Math.cos(ph), cy + r * Math.sin(th) * Math.sin(ph), cz + r * Math.cos(th));
      }
      for (let j = 0; j < rings; j++) for (let i = 0; i < seg; i++) {
        const a = base + j * (seg + 1) + i, b = a + seg + 1;
        if (j > 0) this.tri(a, a + 1, b);
        if (j < rings - 1) this.tri(a + 1, b + 1, b);
      }
      return this;
    }
    /** A (p, q) torus knot tube: the product shot's object. */
    knot(R = 0.5, r = 0.12, p = 2, q = 3, seg = 160, side = 12) {
      const base = this.p.length / 3;
      const C = (t) => { const ph = q * t; return [(R + 0.25 * R * Math.cos(ph)) * Math.cos(p * t), (R + 0.25 * R * Math.cos(ph)) * Math.sin(p * t), 0.25 * R * Math.sin(ph)]; };
      for (let i = 0; i < seg; i++) {
        const t = (i / seg) * 2 * Math.PI, c = C(t), c2 = C(t + 1e-3);
        const tg = c2.map((x, k) => x - c[k]), l = Math.hypot(...tg); tg.forEach((x, k) => { tg[k] = x / l; });
        let nx = [-tg[1], tg[0], 0]; const nl = Math.hypot(...nx) || 1; nx = nx.map((x) => x / nl);
        const bx = [tg[1] * nx[2] - tg[2] * nx[1], tg[2] * nx[0] - tg[0] * nx[2], tg[0] * nx[1] - tg[1] * nx[0]];
        for (let j = 0; j < side; j++) { const a = (j / side) * 2 * Math.PI; this.v(...[0, 1, 2].map((k) => c[k] + r * (Math.cos(a) * nx[k] + Math.sin(a) * bx[k]))); }
      }
      for (let i = 0; i < seg; i++) for (let j = 0; j < side; j++) {
        const a = base + i * side + j, b = base + ((i + 1) % seg) * side + j, c = base + ((i + 1) % seg) * side + ((j + 1) % side), d = base + i * side + ((j + 1) % side);
        this.quad(a, b, c, d);
      }
      return this;
    }
    /** A small low plant: a trunk and three crossed leaf cards (≈ 18 triangles), base at the origin, ~1 m tall. */
    plant() {
      this.box(-0.03, -0.03, 0, 0.03, 0.03, 0.5);
      for (let k = 0; k < 3; k++) {
        const a = (k / 3) * Math.PI, c = Math.cos(a) * 0.35, s = Math.sin(a) * 0.35;
        const p0 = this.v(-c, -s, 0.35), p1 = this.v(c, s, 0.35), p2 = this.v(c, s, 1.0), p3 = this.v(-c, -s, 1.0);
        this.quad(p0, p1, p2, p3);
      }
      return this;
    }
    json() { return { name: this.name, positions: this.p, indices: this.i }; }
  }

  const mat = (name, o = {}) => ({ name, base_color: '#cccccc', base_weight: 1, base_metalness: 0, specular_weight: 1, specular_roughness: 0.5, specular_ior: 1.5, transmission_weight: 0, transmission_color: '#ffffff', thin_walled: false, emission_color: '#ffffff', emission_luminance: 0, ...o });
  const scene = (name, o) => ({ format: 'cadcraft-render-bench', version: 1, name, license: 'CC0-1.0', source: 'made by CadCraft: tools/bench/render/make-scenes.mjs', up: [0, 0, 1], frames: null, scatter: [], lights: [], sun: null, ...o });
  const DAY_SKY = { kind: 'gradient', zenith: '#6f9fd8', horizon: '#dfe8f1', ground: '#9a9488', intensity: 1 };


  // 1. Cornell-style box (our own numbers): 2 m cube room open at the front, red left, green right, two blocks, a ceiling panel.
  {
    const room = new Mesh('room');
    room.rect([0, 1, 0], [2, 2], [0, 0, 1]).rect([0, 1, 2], [2, 2], [0, 0, -1]).rect([0, 2, 1], [2, 2], [0, -1, 0]);   // floor, ceiling, back
    const left = new Mesh('left').rect([-1, 1, 1], [2, 2], [1, 0, 0]);
    const right = new Mesh('right').rect([1, 1, 1], [2, 2], [-1, 0, 0]);
    const tall = new Mesh('tall').box(-0.3, -0.3, 0, 0.3, 0.3, 1.2);
    const short = new Mesh('short').box(-0.3, -0.3, 0, 0.3, 0.3, 0.6);
    scenes.cornell = scene('Cornell-style box', {
      camera: { eye: [0, -3.4, 1], target: [0, 1, 1], up: [0, 0, 1], fovY: 39 }, image: { w: 512, h: 512 },
      env: { kind: 'black' },
      materials: [mat('white', { base_color: '#bababa', specular_roughness: 1 }), mat('red', { base_color: '#a8251c', specular_roughness: 1 }), mat('green', { base_color: '#2f7a2c', specular_roughness: 1 })],
      meshes: [room.json(), left.json(), right.json(), tall.json(), short.json()],
      instances: [{ mesh: 0, material: 0, m: I4 }, { mesh: 1, material: 1, m: I4 }, { mesh: 2, material: 2, m: I4 }, { mesh: 3, material: 0, m: TRS(-0.35, 1.25, 0, 0.3) }, { mesh: 4, material: 0, m: TRS(0.38, 0.65, 0, -0.3) }],
      lights: [{ kind: 'area', p: [0, 1, 1.995], dir: [0, 0, -1], size: [0.5, 0.4], color: '#fff2e0', lumens: 2400, on: true }],
    });
  }

  // 2. Interior: a 6 × 4 × 3 m room, a window opening on the south wall (sky and sun come in), a glass sphere, a metal box,
  //    a table, and three lamps (point, spot, area).
  {
    const walls = new Mesh('walls');
    walls.rect([0, 0, 0], [6, 4], [0, 0, 1]).rect([0, 0, 3], [6, 4], [0, 0, -1]).rect([-3, 0, 1.5], [4, 3], [1, 0, 0]).rect([3, 0, 1.5], [4, 3], [-1, 0, 0]).rect([0, 2, 1.5], [6, 3], [0, -1, 0]);
    // south wall with a 2 × 1.4 m window opening: four strips
    walls.rect([-2, -2, 1.5], [2, 3], [0, 1, 0]).rect([2, -2, 1.5], [2, 3], [0, 1, 0]).rect([0, -2, 0.4], [2, 0.8], [0, 1, 0]).rect([0, -2, 2.6], [2, 0.8], [0, 1, 0]);
    const table = new Mesh('table').box(-0.8, -0.45, 0.72, 0.8, 0.45, 0.76).box(-0.75, -0.4, 0, -0.7, -0.35, 0.72).box(0.7, -0.4, 0, 0.75, -0.35, 0.72).box(-0.75, 0.35, 0, -0.7, 0.4, 0.72).box(0.7, 0.35, 0, 0.75, 0.4, 0.72);
    const ball = new Mesh('ball').sphere(0, 0, 0.2, 0.2, 32, 20);
    const cube = new Mesh('cube').box(-0.15, -0.15, 0, 0.15, 0.15, 0.3);
    scenes.interior = scene('Interior with glass and lamps', {
      camera: { eye: [-2.4, -1.4, 1.6], target: [0.5, 0.6, 0.9], up: [0, 0, 1], fovY: 60 }, image: { w: 960, h: 540 },
      env: DAY_SKY, sun: { dir: [0.35, -0.75, 0.55], irradiance: 1000, tint: '#fff4e5' },
      materials: [mat('plaster', { base_color: '#e8e2d6', specular_roughness: 0.9 }), mat('oak', { base_color: '#8a6a4a', specular_roughness: 0.45 }), mat('glass', { base_color: '#ffffff', transmission_weight: 1, specular_roughness: 0, thin_walled: false }), mat('steel', { base_color: '#c8c8c8', base_metalness: 1, specular_roughness: 0.25 })],
      meshes: [walls.json(), table.json(), ball.json(), cube.json()],
      instances: [{ mesh: 0, material: 0, m: I4 }, { mesh: 1, material: 1, m: T(0.5, 0.6, 0) }, { mesh: 2, material: 2, m: T(0.2, 0.55, 0.76) }, { mesh: 3, material: 3, m: TRS(0.85, 0.7, 0.76, 0.5) }],
      lights: [
        { kind: 'point', p: [-1.5, 1.2, 2.4], color: '#ffd8a8', lumens: 800, size: 0.08, on: true },
        { kind: 'spot', p: [1.6, -0.5, 2.9], dir: [-0.3, 0.6, -1], color: '#fff0dd', lumens: 600, angle: 50, size: 0.06, on: true },
        { kind: 'area', p: [0.5, 0.6, 2.99], dir: [0, 0, -1], size: [1.2, 0.3], color: '#ffffff', lumens: 1500, on: true },
      ],
    });
  }

  // 3. Exterior: 200 × 200 m ground, a house, a million plants scattered (tiers cap the count), sun and sky.
  {
    const ground = new Mesh('ground').rect([0, 0, 0], [200, 200], [0, 0, 1]);
    const house = new Mesh('house').box(-5, -4, 0, 5, 4, 3);
    const roof = new Mesh('roof');
    { const a = roof.v(-5.4, -4.4, 3), b = roof.v(5.4, -4.4, 3), c = roof.v(5.4, 4.4, 3), d = roof.v(-5.4, 4.4, 3), e = roof.v(-5.4, 0, 5.2), f = roof.v(5.4, 0, 5.2); roof.quad(a, b, f, e); roof.quad(c, d, e, f); roof.tri(b, c, f); roof.tri(d, a, e); }
    const plant = new Mesh('plant').plant();
    scenes.exterior = scene('Exterior with scattered plants', {
      camera: { eye: [-24, -30, 9], target: [0, 0, 2], up: [0, 0, 1], fovY: 45 }, image: { w: 1280, h: 720 },
      env: DAY_SKY, sun: { dir: [-0.4, -0.55, 0.73], irradiance: 1000, tint: '#fff4e5' },
      materials: [mat('grass', { base_color: '#5d7a3a', specular_roughness: 0.95 }), mat('render', { base_color: '#d8d0c0', specular_roughness: 0.8 }), mat('tiles', { base_color: '#8c3b2a', specular_roughness: 0.6 }), mat('leaves', { base_color: '#3f6b2a', specular_roughness: 0.7 })],
      meshes: [ground.json(), house.json(), roof.json(), plant.json()],
      instances: [{ mesh: 0, material: 0, m: I4 }, { mesh: 1, material: 1, m: I4 }, { mesh: 2, material: 2, m: I4 }],
      scatter: [{ mesh: 3, material: 3, seed: 20261022, area: [-95, -95, 95, 95], avoid: [[-7, -6, 7, 6]], scale: [0.6, 1.6], count: { cpu: 20000, 'gpu-low': 100000, 'gpu-high': 1000000 } }],
    });
  }

  // 4. Product shot: a torus knot on a plinth in a white studio.
  {
    const knot = new Mesh('knot').knot();
    const plinth = new Mesh('plinth').box(-0.8, -0.8, -0.7, 0.8, 0.8, -0.6);
    scenes.product = scene('Product shot', {
      camera: { eye: [1.6, -2.2, 0.9], target: [0, 0, -0.1], up: [0, 0, 1], fovY: 35 }, image: { w: 800, h: 800 },
      env: { kind: 'gradient', zenith: '#ffffff', horizon: '#f2f2f2', ground: '#d9d9d9', intensity: 1.2 },
      materials: [mat('paint', { base_color: '#b0201c', specular_roughness: 0.3, coat_weight: 1, coat_roughness: 0.05, coat_ior: 1.5 }), mat('plinth', { base_color: '#f0f0f0', specular_roughness: 0.8 })],
      meshes: [knot.json(), plinth.json()],
      instances: [{ mesh: 0, material: 0, m: I4 }, { mesh: 1, material: 1, m: I4 }],
      lights: [{ kind: 'area', p: [-1.2, -1.2, 1.5], dir: [0.5, 0.5, -0.7], size: [1, 1], color: '#ffffff', lumens: 4000, on: true }],
    });
  }

  // 5. Animated: nine boxes turning and rising over 24 frames (the instance keys exercise refit and frame-parallel renders).
  {
    const cube = new Mesh('cube').box(-0.25, -0.25, 0, 0.25, 0.25, 0.5);
    const floor = new Mesh('floor').rect([0, 0, 0], [8, 8], [0, 0, 1]);
    const insts = [{ mesh: 1, material: 1, m: I4 }];
    const keys = [];
    for (let k = 0; k < 9; k++) {
      const x = (k % 3 - 1) * 1.2, y = (Math.floor(k / 3) - 1) * 1.2;
      insts.push({ mesh: 0, material: 0, m: TRS(x, y, 0, 0) });
      keys.push({ instance: k + 1, keys: [0, 12, 23].map((f) => ({ frame: f, m: TRS(x, y, f / 23 * (0.3 + k * 0.1), f / 23 * Math.PI * (k % 2 ? 1 : -1)) })) });
    }
    scenes.anim = scene('Animated boxes', {
      camera: { eye: [4, -5, 3.5], target: [0, 0, 0.4], up: [0, 0, 1], fovY: 40 }, image: { w: 640, h: 360 },
      env: DAY_SKY, sun: { dir: [0.3, -0.5, 0.8], irradiance: 1000, tint: '#fff4e5' },
      materials: [mat('blue', { base_color: '#3f6fb0', specular_roughness: 0.35 }), mat('floor', { base_color: '#bdb8ad', specular_roughness: 0.9 })],
      meshes: [cube.json(), floor.json()], instances: insts, frames: { count: 24, keys },
    });
  }

  // 6. Furnaces (RENDER-SPEC § 9): a white Lambert sphere (albedo 1) and a smooth glass sphere in a uniform environment of
  //    radiance 1: every pixel converges to 1.
  {
    const s = new Mesh('sphere').sphere(0, 0, 0, 1, 48, 32);
    const base = { camera: { eye: [0, -4, 0], target: [0, 0, 0], up: [0, 0, 1], fovY: 40 }, image: { w: 64, h: 64 }, env: { kind: 'uniform', radiance: 1 }, meshes: [s.json()], instances: [{ mesh: 0, material: 0, m: I4 }] };
    scenes['furnace-diffuse'] = scene('Furnace: white diffuse sphere', { ...base, materials: [mat('white', { base_color: '#ffffff', specular_weight: 0, specular_roughness: 1 })] });
    scenes['furnace-glass'] = scene('Furnace: smooth glass sphere', { ...base, materials: [mat('glass', { base_color: '#ffffff', transmission_weight: 1, specular_roughness: 0 })] });
  }
  return scenes;
}
