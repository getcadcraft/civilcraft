/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: errors for developers calling the builder */
/**
 * bvh-scene.js — the two-level BVH a whole scene is traced against (0.7 CU.4; RENDER-SPEC § 6.3 v2): one wide BVH per mesh
 * (BLAS, object space) and one wide BVH over the instances (TLAS, world space), all in ONE node buffer with the TLAS first,
 * so a million copies of a tree cost one tree's triangles. Without instances it is one level (the mesh baked in world space,
 * root = node 0), the same node format. DOM-free; the build runs here or in the pool (bvh-parallel.js builds big BLASes).
 *
 *   buildScene({ meshes, instances }, opts) → scene
 *     meshes:    [{ tris: Float32Array }]              RENDER-SPEC § 6.2 `tris` records (12 floats / triangle), object space
 *     instances: [{ mesh, m: number[16] }] | null      m = object → world, column-major; null = one level (meshes[0] in world)
 *     opts:      { maxLeaf = 4, bins = 12, trees?: [binary tree per mesh] (prebuilt, e.g. by bvh-parallel.js) }
 *   scene = { layout: 2, nodes: Uint32Array (16 words / node), f: Float32Array view, nodeCount,
 *             tris: Float32Array (every mesh's triangles in BLAS slot order, concatenated), triCount,
 *             triMesh, triIndex: Uint32Array (slot → mesh, slot → triangle index within that mesh: for shading attributes),
 *             inst: Float32Array (16 words / instance in TLAS slot order: rows 0..2 of world → object (12 floats),
 *                   w12 BLAS root node (u32 bits), w13 instance index as given, w14 mesh index, w15 material override
 *                   (u32; 0xffffffff = the triangles' own)), instCount,
 *             blas: [{ root, nodes, triOffset, triCount, wide }], tlas: wide | null }
 *   sceneHit(scene, o, d, tmax?, out?) → { t, slot, mesh, tri, inst, instSlot, u, v } | null    closest hit (inst −1 when one
 *     level; instSlot = the instance's slot in `inst`, for its rows)
 *   sceneOccluded(scene, o, d, tmax) → bool                                           any hit
 *   moveInstances(scene, instances)        new matrices, same instances: TLAS refit (no rebuild)
 *   refitMesh(scene, mesh, tris)           a deformed mesh (same triangle count and order): its BLAS refit, TLAS refit
 *   headerWords(scene) → { 3: nodeCount, 62: instCount, 63: 2 }   what the RENDER-SPEC header gains for v2
 *   packV2(scene) → { records: Uint32Array, f: Float32Array view, tris, header: {3, 62, 63}, triMesh, triIndex }
 *     RENDER-SPEC § 6.3 v2: ONE buffer of 16-word records = the nodes (TLAS first, then each BLAS) followed by the instance
 *     records (they start at record header[3], the node count); `tris` in slot order (reorder the shading attributes with
 *     triMesh / triIndex). sceneFromV2(packed) → a scene sceneHit can trace (the test that the bytes alone suffice).
 *   sceneBuffers(scene) → { nodes, tris, inst, meta: Uint32Array [two, triCount, instCount, nodeCount] }   to share with workers
 *   sceneView(buffers) → a scene sceneHit / sceneOccluded can trace (no per-slot mesh/triangle tables: hit.mesh/tri = −1)
 *
 * Shading normals of an instanced hit: n_world = (world → object)ᵀ · n_object, from the same three rows (no second matrix).
 */
import { buildTree, canonical, triBoxes, intersectTri } from './bvh-core.js';
import { toWide, refitWide, traverseWide, newStack, WORDS } from './bvh-wide.js';

/** Inverse of an affine column-major 4×4 as three rows (12 numbers: r0.xyz t0, r1.xyz t1, r2.xyz t2). */
export function invAffineRows(m) {
  const a = m[0], b = m[4], c = m[8], d = m[1], e = m[5], f = m[9], g = m[2], h = m[6], i = m[10];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-300) return null;
  const s = 1 / det;
  const r = [
    A * s, -(b * i - c * h) * s, (b * f - c * e) * s,
    B * s, (a * i - c * g) * s, -(a * f - c * d) * s,
    C * s, -(a * h - b * g) * s, (a * e - b * d) * s,
  ];
  const tx = m[12], ty = m[13], tz = m[14];
  return [
    r[0], r[1], r[2], -(r[0] * tx + r[1] * ty + r[2] * tz),
    r[3], r[4], r[5], -(r[3] * tx + r[4] * ty + r[5] * tz),
    r[6], r[7], r[8], -(r[6] * tx + r[7] * ty + r[8] * tz),
  ];
}

function worldBox(m, bx) {
  const out = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (let c = 0; c < 8; c++) {
    const x = c & 1 ? bx[3] : bx[0], y = c & 2 ? bx[4] : bx[1], z = c & 4 ? bx[5] : bx[2];
    const wx = m[0] * x + m[4] * y + m[8] * z + m[12], wy = m[1] * x + m[5] * y + m[9] * z + m[13], wz = m[2] * x + m[6] * y + m[10] * z + m[14];
    if (wx < out[0]) out[0] = wx; if (wy < out[1]) out[1] = wy; if (wz < out[2]) out[2] = wz;
    if (wx > out[3]) out[3] = wx; if (wy > out[4]) out[4] = wy; if (wz > out[5]) out[5] = wz;
  }
  return out;
}

export function buildScene({ meshes, instances = null }, { maxLeaf = 4, bins = 12, trees = null } = {}) {
  if (!Array.isArray(meshes) || !meshes.length) throw new Error('bvh: no meshes');
  const two = Array.isArray(instances);
  const usedMeshes = two ? meshes : [meshes[0]];
  // BLAS per mesh (binary → canonical → wide), placed after the TLAS
  const binTrees = usedMeshes.map((m, i) => canonical(trees?.[i] || buildTree(triBoxes(m.tris), { maxLeaf, bins })));
  let instBoxes = null, tlasTree = null, instMats = null;
  if (two) {
    instMats = instances.map((it) => (Array.isArray(it.m) || ArrayBuffer.isView(it.m)) && it.m.length >= 16 ? it.m : [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    instBoxes = new Float64Array(instances.length * 6);
    instances.forEach((it, k) => {
      const t = binTrees[it.mesh];
      if (!t) throw new Error('bvh: instance ' + k + ' names mesh ' + it.mesh + ' which does not exist');
      const root = [t.bmin[0], t.bmin[1], t.bmin[2], t.bmax[0], t.bmax[1], t.bmax[2]];
      instBoxes.set(t.n ? worldBox(instMats[k], root) : [0, 0, 0, 0, 0, 0], k * 6);
    });
    tlasTree = canonical(buildTree(instBoxes, { maxLeaf: 2, bins }));
  }
  // sizes first (a wide tree never has more nodes than its binary tree): build each wide tree with its final offsets
  const tlasWide = two ? toWide(tlasTree, { nodeOffset: 0, primOffset: 0 }) : null;
  let nodeCursor = tlasWide ? tlasWide.count : 0, triCursor = 0;
  const blas = binTrees.map((t) => {
    const w = toWide(t, { nodeOffset: nodeCursor, primOffset: triCursor });
    const rec = { root: nodeCursor, nodes: w.count, triOffset: triCursor, triCount: t.n, wide: w };
    nodeCursor += w.count; triCursor += t.n;
    return rec;
  });
  const nodeCount = nodeCursor;
  const nodes = new Uint32Array(nodeCount * WORDS);
  const f = new Float32Array(nodes.buffer);
  if (tlasWide) nodes.set(tlasWide.words, 0);
  for (const r of blas) nodes.set(r.wide.words, r.root * WORDS);
  // triangles in slot order
  const tris = new Float32Array(triCursor * 12);
  const triMesh = new Uint32Array(triCursor), triIndex = new Uint32Array(triCursor);
  blas.forEach((r, mi) => {
    const src = usedMeshes[mi].tris;
    for (let s = 0; s < r.triCount; s++) {
      const p = r.wide.order[s];
      tris.set(src.subarray(p * 12, p * 12 + 12), (r.triOffset + s) * 12);
      triMesh[r.triOffset + s] = mi; triIndex[r.triOffset + s] = p;
    }
  });
  // instances in TLAS slot order
  let inst = null;
  if (two) {
    inst = new Float32Array(instances.length * 16);
    const iu = new Uint32Array(inst.buffer);
    for (let s = 0; s < instances.length; s++) {
      const k = tlasWide.order[s];
      const rows = invAffineRows(instMats[k]) || [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      inst.set(rows, s * 16);
      iu[s * 16 + 12] = blas[instances[k].mesh].root;
      iu[s * 16 + 13] = k;
      iu[s * 16 + 14] = instances[k].mesh;
      iu[s * 16 + 15] = Number.isInteger(instances[k].material) && instances[k].material >= 0 ? instances[k].material : 0xffffffff;
    }
  }
  return {
    layout: 2, nodes, f, nodeCount, tris, triCount: triCursor, triMesh, triIndex, inst, instCount: two ? instances.length : 0,
    blas, tlas: tlasWide, instBoxes, instMats, instMesh: two ? instances.map((it) => it.mesh) : null, meshes: usedMeshes, two,
  };
}

const stA = newStack(), stB = newStack();
/** The u32 view of the instance buffer, made once per scene (no allocation per ray: KICKOFF rule 18). */
function instU(scene) {
  if (!scene.instUView || scene.instUView.buffer !== scene.inst.buffer) scene.instUView = new Uint32Array(scene.inst.buffer, scene.inst.byteOffset, scene.inst.length);
  return scene.instUView;
}

export function sceneHit(scene, o, d, tmax = Infinity, out = { t: 0, slot: -1, mesh: -1, tri: -1, inst: -1, u: 0, v: 0 }) {
  if (!scene.triCount) return null;
  const { nodes, f, tris } = scene;
  const rec = { slot: -1, inst: -1, u: 0, v: 0 };
  const tmp = { t: 0, u: 0, v: 0 };
  const triLeaf = (first, count, ray, best) => {
    let bt = best;
    for (let s = first; s < first + count; s++) {
      if (intersectTri(tris, s, ray.ox, ray.oy, ray.oz, ray.dx, ray.dy, ray.dz, 0, bt, tmp)) { bt = tmp.t; rec.slot = s; rec.u = tmp.u; rec.v = tmp.v; rec.inst = ray.inst; }
    }
    return bt;
  };
  const ray = { ox: o[0], oy: o[1], oz: o[2], dx: d[0], dy: d[1], dz: d[2], inst: -1 };
  let t;
  if (!scene.two) t = traverseWide(nodes, f, 0, ray, tmax, triLeaf, false, stA);
  else {
    const I = scene.inst, IU = instU(scene);
    const local = { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 0, inst: -1 };
    const instLeaf = (first, count, r, best) => {
      let bt = best;
      for (let s = first; s < first + count; s++) {
        const k = s * 16;
        local.ox = I[k] * r.ox + I[k + 1] * r.oy + I[k + 2] * r.oz + I[k + 3];
        local.oy = I[k + 4] * r.ox + I[k + 5] * r.oy + I[k + 6] * r.oz + I[k + 7];
        local.oz = I[k + 8] * r.ox + I[k + 9] * r.oy + I[k + 10] * r.oz + I[k + 11];
        local.dx = I[k] * r.dx + I[k + 1] * r.dy + I[k + 2] * r.dz;
        local.dy = I[k + 4] * r.dx + I[k + 5] * r.dy + I[k + 6] * r.dz;
        local.dz = I[k + 8] * r.dx + I[k + 9] * r.dy + I[k + 10] * r.dz;
        local.inst = s;
        const tt = traverseWide(nodes, f, IU[k + 12], local, bt, triLeaf, false, stB);
        if (tt < bt) bt = tt;
      }
      return bt;
    };
    t = traverseWide(nodes, f, 0, ray, tmax, instLeaf, false, stA);
  }
  if (!(t < tmax) || rec.slot < 0) return null;
  out.t = t; out.slot = rec.slot; out.mesh = scene.triMesh ? scene.triMesh[rec.slot] : -1; out.tri = scene.triIndex ? scene.triIndex[rec.slot] : -1;
  out.instSlot = rec.inst;
  out.inst = rec.inst >= 0 ? instU(scene)[rec.inst * 16 + 13] : -1;
  out.u = rec.u; out.v = rec.v;
  return out;
}

export function sceneOccluded(scene, o, d, tmax) {
  if (!scene.triCount) return false;
  const { nodes, f, tris } = scene;
  const triLeaf = (first, count, ray, best) => {
    for (let s = first; s < first + count; s++) if (intersectTri(tris, s, ray.ox, ray.oy, ray.oz, ray.dx, ray.dy, ray.dz, 0, best, null)) return 0;
    return Infinity;
  };
  const ray = { ox: o[0], oy: o[1], oz: o[2], dx: d[0], dy: d[1], dz: d[2] };
  if (!scene.two) return traverseWide(nodes, f, 0, ray, tmax, triLeaf, true, stA) < tmax;
  const I = scene.inst, IU = instU(scene);
  const local = { ox: 0, oy: 0, oz: 0, dx: 0, dy: 0, dz: 0 };
  const instLeaf = (first, count, r, best) => {
    for (let s = first; s < first + count; s++) {
      const k = s * 16;
      local.ox = I[k] * r.ox + I[k + 1] * r.oy + I[k + 2] * r.oz + I[k + 3];
      local.oy = I[k + 4] * r.ox + I[k + 5] * r.oy + I[k + 6] * r.oz + I[k + 7];
      local.oz = I[k + 8] * r.ox + I[k + 9] * r.oy + I[k + 10] * r.oz + I[k + 11];
      local.dx = I[k] * r.dx + I[k + 1] * r.dy + I[k + 2] * r.dz;
      local.dy = I[k + 4] * r.dx + I[k + 5] * r.dy + I[k + 6] * r.dz;
      local.dz = I[k + 8] * r.dx + I[k + 9] * r.dy + I[k + 10] * r.dz;
      if (traverseWide(nodes, f, IU[k + 12], local, best, triLeaf, true, stB) < best) return 0;
    }
    return Infinity;
  };
  return traverseWide(nodes, f, 0, ray, tmax, instLeaf, true, stA) < tmax;
}

function writeBack(scene, w, offset) { scene.nodes.set(w.words, offset * WORDS); }

/** New matrices for the same instances (same order as built): world boxes, TLAS refit, inverse rows. */
export function moveInstances(scene, instances) {
  if (!scene.two) throw new Error('bvh: one-level scene has no instances');
  if (instances.length !== scene.instCount) throw new Error('bvh: moveInstances needs the same instances (rebuild for added or removed ones)');
  const I = scene.inst, IU = new Uint32Array(I.buffer, I.byteOffset, I.length);
  instances.forEach((it, k) => {
    if (it.mesh !== undefined && it.mesh !== scene.instMesh[k]) throw new Error('bvh: moveInstances cannot change an instance\'s mesh (rebuild)');
    scene.instMats[k] = it.m;
    const r = scene.blas[scene.instMesh[k]];
    const bx = Array.from(r.wide.boxes.subarray(0, 6));
    scene.instBoxes.set(r.triCount ? worldBox(it.m, bx) : [0, 0, 0, 0, 0, 0], k * 6);
  });
  for (let s = 0; s < scene.instCount; s++) {
    const k = IU[s * 16 + 13];
    I.set(invAffineRows(scene.instMats[k]) || new Array(12).fill(0), s * 16);
  }
  refitWide(scene.tlas, scene.instBoxes);
  writeBack(scene, scene.tlas, 0);
  return scene;
}

/** A deformed mesh: the same triangles in the same order, new positions. Its BLAS and the TLAS are refitted. */
export function refitMesh(scene, mesh, tris) {
  const r = scene.blas[mesh];
  if (!r) throw new Error('bvh: unknown mesh');
  if (tris.length !== r.triCount * 12) throw new Error('bvh: refitMesh needs the same triangle count');
  for (let s = 0; s < r.triCount; s++) {
    const p = r.wide.order[s];
    scene.tris.set(tris.subarray(p * 12, p * 12 + 12), (r.triOffset + s) * 12);
  }
  refitWide(r.wide, triBoxes(tris));
  writeBack(scene, r.wide, r.root);
  if (scene.two) moveInstances(scene, scene.instMats.map((m) => ({ m })));
  return scene;
}

export function headerWords(scene) {
  return { 3: scene.nodeCount, 62: scene.instCount, 63: scene.layout };   // instance records start at record word 3's value
}

export function sceneBuffers(scene) {
  return { nodes: scene.nodes, tris: scene.tris, inst: scene.inst || new Float32Array(0), meta: new Uint32Array([scene.two ? 1 : 0, scene.triCount, scene.instCount, scene.nodeCount]) };
}

export function sceneView({ nodes, tris, inst, meta }) {
  return { layout: 2, nodes, f: new Float32Array(nodes.buffer, nodes.byteOffset, nodes.length), tris, inst: meta[0] ? inst : null, two: !!meta[0], triCount: meta[1], instCount: meta[2], nodeCount: meta[3], triMesh: null, triIndex: null };
}

/** RENDER-SPEC § 6.3 v2: nodes then instance records in one buffer of 16-word records (≤ 8 storage buffers per stage). */
export function packV2(scene) {
  const n = scene.nodeCount, m = scene.instCount;
  const records = new Uint32Array((n + m) * WORDS);
  records.set(scene.nodes, 0);
  if (m) records.set(new Uint32Array(scene.inst.buffer, scene.inst.byteOffset, m * 16), n * WORDS);
  return {
    records, f: new Float32Array(records.buffer), tris: scene.tris, triMesh: scene.triMesh, triIndex: scene.triIndex,
    header: { 3: n, 62: m, 63: 2 },
  };
}

/** The scene back from packV2's bytes alone (what a kernel sees): for tests and the CPU kernel's JS twin. */
export function sceneFromV2({ records, tris, header }) {
  const n = header[3], m = header[62];
  const nodes = records.subarray(0, n * WORDS);
  const inst = m ? new Float32Array(records.buffer, records.byteOffset + n * WORDS * 4, m * 16) : null;
  return { layout: 2, nodes, f: new Float32Array(records.buffer, records.byteOffset, n * WORDS), tris, inst, two: m > 0, triCount: tris.length / 12, instCount: m, nodeCount: n, triMesh: null, triIndex: null };
}
