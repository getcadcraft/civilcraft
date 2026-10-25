#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pick-bench.mjs — picking with lib/compute/bvh against the vendored three-mesh-bvh 0.9.15 on the same meshes and rays
 * (0.7 CU.4: "replaces three-mesh-bvh in picking where faster, measured"). Prints build and ray times and checks both find
 * the same nearest hits. Timing rules (KICKOFF 14): run through the capped slice, note the load, never in a loop:
 *   systemd-run --scope --slice=forkrust.slice nice -n 19 ionice -c3 node --import ./tools/compute-test/three-hook.mjs tools/compute-test/pick-bench.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const V = (p) => import(pathToFileURL(path.join(ROOT, p)).href);
const THREE = await V('public_html/assets/vendor/three/current/three.module.js');
const { MeshBVH } = await V('public_html/assets/vendor/three-mesh-bvh/current/index.module.js');
const C = await V('lib/compute/bvh-core.js');
const S = await V('lib/compute/bvh-scene.js');

const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
/** A height field (a terrain: what BimCraft/CivilCraft pick against) of g×g quads = 2g² triangles, positions + index. */
function terrain(g) {
  const pos = new Float32Array((g + 1) * (g + 1) * 3);
  for (let j = 0; j <= g; j++) for (let i = 0; i <= g; i++) { const k = (j * (g + 1) + i) * 3; pos[k] = i; pos[k + 1] = j; pos[k + 2] = Math.sin(i * 0.1) * Math.cos(j * 0.13) * 6; }
  const idx = new Uint32Array(g * g * 6);
  let n = 0;
  for (let j = 0; j < g; j++) for (let i = 0; i < g; i++) { const a = j * (g + 1) + i; idx.set([a, a + 1, a + g + 2, a, a + g + 2, a + g + 1], n); n += 6; }
  return { pos, idx };
}
/** Scattered boxes (a building model: many small parts). */
function parts(count, seed) {
  const r = rng(seed), pos = [], idx = [];
  for (let b = 0; b < count; b++) {
    const x = r() * 200, y = r() * 200, z = r() * 30, sx = 0.2 + r() * 3, sy = 0.2 + r() * 3, sz = 0.2 + r() * 3, o = pos.length / 3;
    for (let c = 0; c < 8; c++) pos.push(x + (c & 1) * sx, y + ((c >> 1) & 1) * sy, z + ((c >> 2) & 1) * sz);
    for (const f of [[0, 1, 3, 2], [4, 6, 7, 5], [0, 4, 5, 1], [2, 3, 7, 6], [0, 2, 6, 4], [1, 5, 7, 3]]) idx.push(o + f[0], o + f[1], o + f[2], o + f[0], o + f[2], o + f[3]);
  }
  return { pos: new Float32Array(pos), idx: new Uint32Array(idx) };
}
function records({ pos, idx }) {
  const n = idx.length / 3, t = new Float32Array(n * 12);
  for (let i = 0; i < n; i++) {
    const a = idx[i * 3] * 3, b = idx[i * 3 + 1] * 3, c = idx[i * 3 + 2] * 3;
    t.set([pos[a], pos[a + 1], pos[a + 2], 0, pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2], 0, pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2], 0], i * 12);
  }
  return t;
}
function rays(count, seed, box) {
  const r = rng(seed), out = [];
  for (let i = 0; i < count; i++) {
    const o = [box[0] + r() * (box[3] - box[0]), box[1] + r() * (box[4] - box[1]), box[5] + 20];
    const tx = box[0] + r() * (box[3] - box[0]), ty = box[1] + r() * (box[4] - box[1]), tz = box[2];
    const d = [tx - o[0], ty - o[1], tz - o[2]], l = Math.hypot(...d);
    out.push([o, d.map((x) => x / l)]);
  }
  return out;
}
const ms = (f) => { const t = performance.now(); const r = f(); return [performance.now() - t, r]; };

const results = [];
for (const [name, mesh, box] of [['terrain 200×200 (80 000 triangles)', terrain(200), [0, 0, -6, 200, 200, 6]], ['parts 20 000 boxes (240 000 triangles)', parts(20000, 4), [0, 0, 0, 200, 200, 33]]]) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(mesh.pos, 3));
  geo.setIndex(new THREE.BufferAttribute(mesh.idx, 1));
  const [tmb, bvh] = ms(() => new MeshBVH(geo));
  const tris = records(mesh);
  const [tours, scene] = ms(() => S.buildScene({ meshes: [{ tris }] }));
  const [tbin, bin] = ms(() => C.canonical(C.buildTree(C.triBoxes(tris))));
  const R = rays(20000, 7, box);
  const ray = new THREE.Ray();
  let agree = 0, both = 0;
  const [rm, a] = ms(() => R.map(([o, d]) => { ray.origin.set(o[0], o[1], o[2]); ray.direction.set(d[0], d[1], d[2]); const h = bvh.raycastFirst(ray, THREE.DoubleSide); return h ? h.distance : -1; }));
  const out = { t: 0, slot: -1, mesh: -1, tri: -1, inst: -1, u: 0, v: 0 };
  const [ro, b] = ms(() => R.map(([o, d]) => { const h = S.sceneHit(scene, o, d, Infinity, out); return h ? h.t : -1; }));
  const bout = { t: 0, prim: -1, u: 0, v: 0 };
  const [rb, c] = ms(() => R.map(([o, d]) => { const h = C.closestHit(bin, tris, o, d, Infinity, bout); return h ? h.t : -1; }));
  for (let i = 0; i < R.length; i++) { if (a[i] >= 0 || b[i] >= 0) { both++; if (Math.abs(a[i] - b[i]) < 1e-4 * Math.max(1, a[i]) && Math.abs(c[i] - b[i]) < 1e-9 * Math.max(1, b[i])) agree++; } }
  results.push({ name, build: { threeMeshBvh: +tmb.toFixed(1), wide: +tours.toFixed(1), binary: +tbin.toFixed(1) }, rays20k: { threeMeshBvh: +rm.toFixed(1), wide: +ro.toFixed(1), binary: +rb.toFixed(1) }, agree: agree + ' / ' + both });
}
const load = fs.readFileSync('/proc/loadavg', 'utf8').split(' ').slice(0, 3).join(' ');
if (process.argv.includes('--json')) console.log(JSON.stringify({ load, node: process.version, results }));
else {
  console.log('Picking: lib/compute/bvh vs three-mesh-bvh 0.9.15 (ms; Node ' + process.version + ', load ' + load + ', VPS capped)');
  for (const r of results) console.log('  ' + r.name + '\n    build: three-mesh-bvh ' + r.build.threeMeshBvh + ', ours wide ' + r.build.wide + ', ours binary ' + r.build.binary + '\n    20 000 rays: three-mesh-bvh ' + r.rays20k.threeMeshBvh + ', ours wide ' + r.rays20k.wide + ', ours binary ' + r.rays20k.binary + '\n    same nearest hit: ' + r.agree);
}
