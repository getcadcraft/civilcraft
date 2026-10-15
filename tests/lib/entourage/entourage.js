/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the names and descriptions here are library item data written into the items (English, like every
   library item); ModelCraft shows its own translated names (app.starter.ent-*). */
/**
 * entourage.js — trees, shrubs, people and cars for pictures and site plans (0.5 RC.11 (e), session `render`), drawn by
 * CadCraft from numbers (seeded shapes, no outside model or photo) and shared under CC0 1.0. No DOM, no imports.
 * Canonical here (lib/entourage/); copies, byte-identical, in modelcraft/dev/entourage.js (the starter library) and the public
 * library repo's tools/entourage/entourage.js (which writes them as LibraryCraft items): node tools/entourage/sync.mjs [--check].
 *
 *   ENTOURAGE_VERSION
 *   entourage() → [{slug, name, cat ('site/landscape' | 'people/entourage' | 'site/vehicles'), description,
 *                   parts: [{name, color '#rrggbb', alpha (1 opaque … 0 clear), positions (mm), indices}],
 *                   plan: {layers, entities}, size: [w, d, h] (mm)}]
 *   merged(e) → {positions, indices, ranges: [{from, to, color, alpha}]}   one mesh, each part's triangle range
 *   partsText(ranges) → '0-319 #4f7a3a;320-359 #6b4a2f;…/0.55'           the CC-RENDER-PARTS source attribute
 *   readPartsText(text) → ranges | null                                   (untrusted)
 *   libraryItem(e) → a CadCraft library item, format 1, without uuid / version / license / provenance
 *
 * Conventions (the library's): millimetres, Z up, the front faces −Y; the insertion point is the middle of the item at the
 * ground (a tree's trunk, a person's feet, the middle of a car). Low polygon counts (a few hundred to two thousand
 * triangles), so a street of trees stays quick. Each part has one colour; car windows are see-through (alpha).
 */

export const ENTOURAGE_VERSION = 1;

// ---- seeded randomness ----
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const r1 = (v) => Math.round(v * 10) / 10;

// ---- a mesh part ----
class Part {
  constructor(name, color, alpha = 1) { this.name = name; this.color = color; this.alpha = alpha; this.P = []; this.I = []; }
  v(x, y, z) { this.P.push(r1(x), r1(y), r1(z)); return this.P.length / 3 - 1; }
  tri(a, b, c) { this.I.push(a, b, c); }
  /** A ring-lofted solid: rings [{z, r, cx, cy, rx?, ry?}] round the Z axis (or an offset centre), `seg` sides, capped. */
  loft(rings, seg = 12, cap = true) {
    const base = this.P.length / 3;
    for (const g of rings) for (let i = 0; i < seg; i++) {
      const a = (2 * Math.PI * i) / seg;
      this.v((g.cx || 0) + (g.rx ?? g.r) * Math.cos(a), (g.cy || 0) + (g.ry ?? g.r) * Math.sin(a), g.z);
    }
    for (let k = 0; k + 1 < rings.length; k++) for (let i = 0; i < seg; i++) {
      const a = base + k * seg + i, b = base + k * seg + ((i + 1) % seg), c = a + seg, d = b + seg;
      this.tri(a, b, d); this.tri(a, d, c);
    }
    if (cap) {
      const bot = this.v(rings[0].cx || 0, rings[0].cy || 0, rings[0].z), top = this.v(rings.at(-1).cx || 0, rings.at(-1).cy || 0, rings.at(-1).z);
      for (let i = 0; i < seg; i++) {
        this.tri(bot, base + ((i + 1) % seg), base + i);
        const t0 = base + (rings.length - 1) * seg;
        this.tri(top, t0 + i, t0 + ((i + 1) % seg));
      }
    }
    return this;
  }
  /** An icosphere (subdivided `sub` times) scaled to (rx, ry, rz) at c, its surface pushed in and out by `bump` (0…1). */
  blob(c, rx, ry, rz, sub, bump, R) {
    const t = (1 + Math.sqrt(5)) / 2;
    let V = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map((p) => { const l = Math.hypot(...p); return p.map((x) => x / l); });
    let F = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
    for (let s = 0; s < sub; s++) {
      const mid = new Map(), m = (a, b) => {
        const k = a < b ? a + '|' + b : b + '|' + a;
        if (!mid.has(k)) { const p = V[a].map((x, i) => (x + V[b][i]) / 2), l = Math.hypot(...p); V.push(p.map((x) => x / l)); mid.set(k, V.length - 1); }
        return mid.get(k);
      };
      F = F.flatMap(([a, b, c]) => { const ab = m(a, b), bc = m(b, c), ca = m(c, a); return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]; });
    }
    const base = this.P.length / 3;
    for (const p of V) { const k = 1 + bump * (R() * 2 - 1); this.v(c[0] + p[0] * rx * k, c[1] + p[1] * ry * k, c[2] + p[2] * rz * k); }
    for (const [a, b, d] of F) this.tri(base + a, base + b, base + d);
    return this;
  }
  /** Nothing below the ground: points under z = 0 come up to it (a shrub sits on its flattened base). */
  ground() { for (let i = 2; i < this.P.length; i += 3) if (this.P[i] < 0) this.P[i] = 0; return this; }
  /** A box from its two corners. */
  box(x0, y0, z0, x1, y1, z1) {
    const b = this.P.length / 3;
    for (const z of [z0, z1]) for (const [x, y] of [[x0, y0], [x1, y0], [x1, y1], [x0, y1]]) this.v(x, y, z);
    for (const t of [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [1, 2, 6], [1, 6, 5], [2, 3, 7], [2, 7, 6], [3, 0, 4], [3, 4, 7]]) this.tri(b + t[0], b + t[1], b + t[2]);
    return this;
  }
  /** A side profile (x along the length, z up; anticlockwise) swept across y0 … y1: a car's body or cabin. */
  sweepY(prof, y0, y1) {
    const n = prof.length, b = this.P.length / 3;
    for (const y of [y0, y1]) for (const [x, z] of prof) this.v(x, y, z);
    // the profile is convex and anticlockwise (x right, z up): the y0 side faces −Y, the y1 side +Y, the rim outward
    for (let i = 1; i + 1 < n; i++) { this.tri(b, b + i, b + i + 1); this.tri(b + n, b + n + i + 1, b + n + i); }
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; this.tri(b + i, b + n + j, b + j); this.tri(b + i, b + n + i, b + n + j); }
    return this;
  }
  /** A wheel: a cylinder along Y at (x, z) of radius r from y0 to y1. */
  wheel(x, z, r, y0, y1, seg = 14) {
    const b = this.P.length / 3;
    // a corner at the bottom (−90°), so the tyre stands on the ground exactly; wound outward
    for (const y of [y0, y1]) for (let i = 0; i < seg; i++) { const a = (2 * Math.PI * i) / seg - Math.PI / 2; this.v(x + r * Math.cos(a), y, z + r * Math.sin(a)); }
    const c0 = this.v(x, y0, z), c1 = this.v(x, y1, z);
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      this.tri(b + i, b + seg + j, b + j); this.tri(b + i, b + seg + i, b + seg + j);
      this.tri(c0, b + i, b + j); this.tri(c1, b + seg + j, b + seg + i);
    }
    return this;
  }
}

// ---- plan symbols (the library's layer names: outlines, -DETAIL thin lines) ----
const circ = (x, y, r, layer) => ({ type: 'circle', layer, color: null, x, y, r });
const poly = (pts, layer, closed = true) => ({ type: 'poly', layer, color: null, pts: pts.map(([x, y]) => [r1(x), r1(y)]), closed });
function canopyPlan(r, seed, trunk) {
  const R = rng(seed), n = 14, pts = [];
  for (let i = 0; i < n; i++) { const a = (2 * Math.PI * i) / n, k = r * (0.86 + R() * 0.18); pts.push([k * Math.cos(a), k * Math.sin(a)]); }
  return { layers: [{ name: 'PLANTING', color: 3 }, { name: 'PLANTING-DETAIL', color: 3 }],
    entities: [poly(pts, 'PLANTING'), circ(0, 0, trunk, 'PLANTING-DETAIL'), poly([[-r * 0.25, 0], [r * 0.25, 0]], 'PLANTING-DETAIL', false), poly([[0, -r * 0.25], [0, r * 0.25]], 'PLANTING-DETAIL', false)] };
}

// ---- the set ----
const LEAF = ['#4f7a3a', '#5d8a3f', '#3f6b35', '#6f8f3c'];
function deciduous(slug, name, H, seed, leaf) {
  const R = rng(seed), trunk = new Part('trunk', '#6b4a2f'), crown = new Part('leaves', leaf);
  const tr = H * 0.035;
  trunk.loft([{ z: 0, r: tr * 1.3 }, { z: H * 0.25, r: tr }, { z: H * 0.48, r: tr * 0.7 }], 10);
  const cz = H * 0.66, cr = H * 0.27;
  crown.blob([0, 0, cz], cr, cr, cr * 0.92, 2, 0.08, R);
  for (let k = 0; k < 4; k++) {
    const a = (2 * Math.PI * k) / 4 + R(), d = cr * 0.55;
    crown.blob([d * Math.cos(a), d * Math.sin(a), cz + (R() - 0.4) * cr * 0.6], cr * 0.62, cr * 0.62, cr * 0.55, 1, 0.12, R);
  }
  return { slug, name, cat: 'site/landscape', description: `A deciduous tree about ${(H / 1000).toFixed(0)} m tall, for site plans and pictures.`, parts: [trunk, crown], plan: canopyPlan(cr * 1.45, seed, tr * 1.3), size: [cr * 2.9, cr * 2.9, H] };
}
function conifer(slug, name, H, seed) {
  const R = rng(seed), trunk = new Part('trunk', '#5a3d28'), crown = new Part('needles', '#2f5a3a');
  trunk.loft([{ z: 0, r: H * 0.03 }, { z: H * 0.25, r: H * 0.022 }], 8);
  const base = H * 0.18, r0 = H * 0.2;
  for (let k = 0; k < 4; k++) {
    const z0 = base + k * H * 0.17, rr = r0 * (1 - k * 0.2) * (0.95 + R() * 0.1);
    crown.loft([{ z: z0, r: rr }, { z: z0 + H * 0.3, r: rr * 0.08 }], 12);
  }
  return { slug, name, cat: 'site/landscape', description: `A conifer about ${(H / 1000).toFixed(0)} m tall.`, parts: [trunk, crown], plan: canopyPlan(r0 * 1.02, seed, H * 0.03), size: [r0 * 2, r0 * 2, H] };
}
function columnar(slug, name, H, seed) {
  const R = rng(seed), trunk = new Part('trunk', '#5a3d28'), crown = new Part('leaves', '#3d6233');
  trunk.loft([{ z: 0, r: H * 0.025 }, { z: H * 0.12, r: H * 0.02 }], 8);
  crown.blob([0, 0, H * 0.55], H * 0.11, H * 0.11, H * 0.45, 2, 0.06, R);
  return { slug, name, cat: 'site/landscape', description: `A narrow columnar tree about ${(H / 1000).toFixed(0)} m tall, for rows along a drive or a boundary.`, parts: [trunk, crown], plan: canopyPlan(H * 0.115, seed, H * 0.025), size: [H * 0.23, H * 0.23, H] };
}
function shrub(slug, name, W, H, seed, leaf) {
  const R = rng(seed), p = new Part('leaves', leaf);
  p.blob([0, 0, H * 0.48], W / 2, W / 2, H * 0.52, 2, 0.1, R);
  for (let k = 0; k < 3; k++) { const a = (2 * Math.PI * k) / 3 + R(); p.blob([W * 0.25 * Math.cos(a), W * 0.25 * Math.sin(a), H * 0.4], W * 0.3, W * 0.3, H * 0.38, 1, 0.12, R); }
  p.ground();
  return { slug, name, cat: 'site/landscape', description: `A rounded shrub about ${W} mm across and ${H} mm tall.`, parts: [p], plan: canopyPlan(W / 2, seed, W * 0.04), size: [W, W, H] };
}
function hedge(slug, name, L, W, H, seed) {
  const R = rng(seed), p = new Part('leaves', '#46703a');
  const n = Math.max(2, Math.round(L / 500));
  for (let k = 0; k < n; k++) { const x = -L / 2 + (k + 0.5) * (L / n); p.blob([x, 0, H * 0.5], (L / n) * 0.62, W * 0.52, H * 0.52, 1, 0.08, R); }
  p.ground();
  return { slug, name, cat: 'site/landscape', description: `A trimmed hedge ${L} mm long, ${W} mm deep, ${H} mm tall.`, parts: [p],
    plan: { layers: [{ name: 'PLANTING', color: 3 }], entities: [poly([[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]], 'PLANTING')] }, size: [L, W, H] };
}
function potted(slug, name, seed) {
  const R = rng(seed), pot = new Part('pot', '#b0603e'), leaf = new Part('leaves', '#4f7a3a');
  pot.loft([{ z: 0, r: 170 }, { z: 380, r: 230 }], 16);
  leaf.blob([0, 0, 720], 330, 330, 380, 2, 0.12, R);
  return { slug, name, cat: 'site/landscape', description: 'A plant in a clay pot, about 1.1 m tall: for terraces, entrances and rooms.', parts: [pot, leaf], plan: canopyPlan(330, seed, 230), size: [660, 660, 1100] };
}

/** A person, stylised (the architectural kind): standing or walking, an adult or a child; clothes in calm colours. */
function person(slug, name, { H = 1750, walk = 0, top = '#3e5c7a', legs = '#3a3d42', skin = '#c9a184', hair = '#3b2b22', seed = 1 } = {}) {
  const k = H / 1750, body = new Part('clothes', top), lower = new Part('trousers', legs), head = new Part('skin', skin), hairP = new Part('hair', hair);
  const R = rng(seed);
  // legs (apart when walking), torso, arms, head
  const step = walk * 160 * k;
  for (const [sx, sy] of [[-90, step], [90, -step]]) lower.loft([{ z: 0, r: 60 * k, cx: sx * k, cy: sy - 20 * k }, { z: 820 * k, r: 75 * k, cx: sx * k * 0.85, cy: sy * 0.2 }], 8);
  body.loft([{ z: 790 * k, r: 0, rx: 180 * k, ry: 105 * k }, { z: 1150 * k, rx: 190 * k, ry: 110 * k, r: 0 }, { z: 1430 * k, rx: 210 * k, ry: 115 * k, r: 0 }, { z: 1480 * k, rx: 120 * k, ry: 80 * k, r: 0 }], 12);
  for (const sx of [-1, 1]) {
    const swing = -sx * walk * 140 * k;
    body.loft([{ z: 820 * k, r: 42 * k, cx: sx * 245 * k, cy: swing }, { z: 1420 * k, r: 50 * k, cx: sx * 228 * k, cy: 0 }], 8);
  }
  head.loft([{ z: 1470 * k, r: 45 * k }, { z: 1540 * k, r: 50 * k }], 8);
  head.blob([0, -10 * k, 1630 * k], 95 * k, 105 * k, 120 * k, 2, 0.01, R);
  hairP.blob([0, 15 * k, 1690 * k], 98 * k, 100 * k, 75 * k, 1, 0.02, R);
  return { slug, name, cat: 'people/entourage', description: `A person ${H} mm tall${walk ? ', walking' : ''}, stylised, for scale in pictures and sections.`, parts: [lower, body, head, hairP],
    plan: { layers: [{ name: 'ENTOURAGE', color: 8 }], entities: [{ type: 'ellipse', layer: 'ENTOURAGE', color: null, cx: 0, cy: 0, mx: 250 * k, my: 0, ratio: 0.5, t0: 0, t1: 360 }, circ(0, 0, 100 * k, 'ENTOURAGE')] },
    size: [520 * k, 300 * k + step * 2, H] };
}

/** A car: body, glass, wheels; L × W × H mm. */
function car(slug, name, { L = 4700, W = 1820, H = 1450, color = '#8a1f24', suv = false } = {}) {
  const bodyP = new Part('body', color), glass = new Part('glass', '#2d3a44', 0.55), tyres = new Part('tyres', '#1e2023'), lights = new Part('lights', '#e9e4d6');
  const x0 = -L / 2, x1 = L / 2, sill = 330, belt = suv ? 1000 : 860, roof = H;
  // the lower body: a side profile swept across the width (the nose and the tail slope)
  bodyP.sweepY([[x0 + 60, sill], [x1 - 60, sill], [x1, sill + 180], [x1 - 40, belt - 60], [x1 - 300, belt], [x0 + 200, belt], [x0, belt - 120], [x0, sill + 140]], -W / 2, W / 2);
  // the cabin: glass all round, the roof in the body colour
  const c0 = x0 + (suv ? 600 : 1050), c1 = x1 - (suv ? 950 : 1250), inset = 70;
  glass.sweepY([[c0 - (suv ? 120 : 300), belt], [c1 + (suv ? 250 : 500), belt], [c1, roof - 60], [c0, roof - 60]], -W / 2 + inset, W / 2 - inset);
  bodyP.box(c0 + 10, -W / 2 + inset + 20, roof - 70, c1 - 10, W / 2 - inset - 20, roof);
  // wheels and lamps
  const wr = suv ? 380 : 330, wb = L * 0.6;
  for (const x of [-wb / 2, wb / 2]) for (const [y0, y1] of [[-W / 2 - 5, -W / 2 + 230], [W / 2 - 230, W / 2 + 5]]) tyres.wheel(x, wr, wr, y0, y1);
  for (const y of [-W / 2 + 120, W / 2 - 420]) lights.box(x1 - 30, y, sill + 300, x1 + 5, y + 300, sill + 400);
  return { slug, name, cat: 'site/vehicles', description: `A ${suv ? 'sport utility vehicle' : 'car'} ${L} × ${W} mm, ${H} mm tall, for drives, garages and parking.`, parts: [bodyP, glass, tyres, lights],
    plan: { layers: [{ name: 'VEHICLE', color: 8 }, { name: 'VEHICLE-DETAIL', color: 8 }],
      entities: [poly([[x0 + 80, -W / 2], [x1 - 150, -W / 2], [x1, -W / 2 + 200], [x1, W / 2 - 200], [x1 - 150, W / 2], [x0 + 80, W / 2], [x0, W / 2 - 120], [x0, -W / 2 + 120]], 'VEHICLE'),
        poly([[c0, -W / 2 + inset], [c1, -W / 2 + inset], [c1, W / 2 - inset], [c0, W / 2 - inset]], 'VEHICLE-DETAIL')] },
    size: [L, W + 10, H] };
}

export function entourage() {
  return [
    deciduous('tree-deciduous-6m', 'Deciduous tree, 6 m', 6000, 101, LEAF[0]),
    deciduous('tree-deciduous-10m', 'Deciduous tree, 10 m', 10000, 102, LEAF[1]),
    deciduous('tree-ornamental-4m', 'Ornamental tree, 4 m', 4000, 103, LEAF[3]),
    conifer('tree-conifer-8m', 'Conifer, 8 m', 8000, 104),
    columnar('tree-columnar-7m', 'Columnar tree, 7 m', 7000, 105),
    shrub('shrub-round-1200', 'Round shrub, 1.2 m', 1200, 1000, 106, LEAF[2]),
    shrub('shrub-small-600', 'Small shrub, 0.6 m', 600, 550, 107, LEAF[1]),
    hedge('hedge-2000', 'Hedge, 2 m long', 2000, 600, 1200, 108),
    potted('plant-potted', 'Potted plant', 109),
    person('person-standing', 'Person, standing', { seed: 201 }),
    person('person-walking', 'Person, walking', { walk: 1, top: '#7a3e3e', legs: '#2f3b4f', seed: 202 }),
    person('person-standing-2', 'Person, standing (light clothes)', { H: 1650, top: '#c8c1b3', legs: '#55606b', hair: '#6b4a2f', seed: 203 }),
    person('child-standing', 'Child, standing', { H: 1200, top: '#3e7a5c', legs: '#3a3d42', seed: 204 }),
    car('car-sedan', 'Car, sedan', {}),
    car('car-suv', 'Car, SUV', { L: 4800, W: 1900, H: 1750, color: '#4b5560', suv: true }),
  ];
}

export function merged(e) {
  const positions = [], indices = [], ranges = [];
  for (const p of e.parts) {
    const base = positions.length / 3, from = indices.length / 3;
    positions.push(...p.P);
    for (const i of p.I) indices.push(base + i);
    ranges.push({ from, to: indices.length / 3 - 1, color: p.color, alpha: p.alpha ?? 1 });
  }
  return { positions, indices, ranges };
}

export function partsText(ranges) {
  return ranges.map((r) => `${r.from}-${r.to} ${r.color}` + (r.alpha < 1 ? '/' + Math.round(r.alpha * 100) / 100 : '')).join(';');
}

export function readPartsText(text) {
  if (typeof text !== 'string' || text.length > 2000) return null;
  const out = [];
  for (const s of text.split(';')) {
    const m = /^\s*(\d{1,7})-(\d{1,7}) (#[0-9a-fA-F]{6})(?:\/(0(?:\.\d+)?|1(?:\.0+)?))?\s*$/.exec(s);
    if (!m) return null;
    const from = Number(m[1]), to = Number(m[2]);
    if (to < from || (out.length && from <= out[out.length - 1].to)) return null;
    out.push({ from, to, color: m[3].toLowerCase(), alpha: m[4] === undefined ? 1 : Number(m[4]) });
    if (out.length > 64) return null;
  }
  return out.length ? out : null;
}

export function libraryItem(e) {
  const m = merged(e);
  return {
    format: 'cadcraft-library-item', format_version: 1,
    name: e.name, kind: 'furniture', category: e.cat, description: e.description, maker: '', model: '',
    plan: e.plan,
    body: { type: 'mesh', positions: m.positions, indices: m.indices },
    clearances: [],
    params: { width: r1(e.size[0]), depth: r1(e.size[1]), height: r1(e.size[2]) },
    source_attrs: { 'CC-RENDER-PARTS': partsText(m.ranges), 'CC-ENTOURAGE': String(ENTOURAGE_VERSION) },
  };
}
