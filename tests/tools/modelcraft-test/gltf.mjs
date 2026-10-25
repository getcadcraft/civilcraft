#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gltf.mjs — ModelCraft's glTF 2.0 reader, importer and writer (modelcraft/dev/io/gltf-*.js; 0.7 XF.1, session
 * `interchange`). Run by bin/test-modelcraft.mjs (§ glTF) or on its own: node tools/modelcraft-test/gltf.mjs [--no-fuzz]
 *
 *   run({ ok, close, section, APP })
 *
 * 1. Hand-made files with known answers: accessors (normalized ints, interleaved strides, sparse, matrices), strips and
 *    fans, Y up → Z up, KHR_texture_transform on the uv layer, the weld and the layers, a two-bone skin posed as it rests,
 *    morph weights, EXT_mesh_gpu_instancing, KHR_lights_punctual → lamps, cameras → scenes, refusals (every kind of bad
 *    index, offset, stride, loop; unknown required extensions; a missing external file).
 * 2. The Khronos sample models (testfiles/gltf-corpus/sample-assets, outside git; skipped when absent): every file reads
 *    and imports; faces = the file's triangles less the ones with no area; the import's bounds = the file's world bounds
 *    (computed here from the reader's output, Z up) for models without skins; Draco / meshopt / quantized variants give
 *    the base model's faces and bounds; save → reload and undo leave the model whole.
 * 3. The writer: every imported sample and a push/pull model with colours, an image paint, lamps and scenes → the Khronos
 *    glTF validator (Apache-2.0, test-only, in /var/www/CADCRAFT/oracles/gltf/node_modules: `npm install gltf-validator`)
 *    finds no errors; re-imported: same faces, bounds, UVs, lamps and cameras.
 * 4. Truncation and byte-flip fuzz on a few files in a worker with a time limit: only a GltfError (or a model) comes out.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const VENDOR = path.join(ROOT, 'public_html/assets/vendor');
const CORPUS = '/var/www/CADCRAFT/testfiles/gltf-corpus/sample-assets';
const VALIDATOR = '/var/www/CADCRAFT/oracles/gltf/node_modules/gltf-validator';

async function libs(APP) {
  const I18N = await import(path.join(APP, 'i18n.js'));
  const LANG = path.join(APP, 'lang/en.json');
  if (fs.existsSync(LANG)) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(LANG, 'utf8')) });
  const M = await import(path.join(APP, 'model.js'));
  const V = await import(path.join(APP, 'vec.js'));
  const R = await import(path.join(APP, 'io/gltf-read.js'));
  const I = await import(path.join(APP, 'io/gltf-import.js'));
  const W = await import(path.join(APP, 'io/gltf-write.js'));
  const { dracoDecode } = await import(path.join(APP, 'io/draco.js'));
  const DracoDecoderModule = createRequire(import.meta.url)(path.join(VENDOR, 'draco/current/draco_wasm_wrapper_gltf.js'));
  const D = await DracoDecoderModule({ wasmBinary: fs.readFileSync(path.join(VENDOR, 'draco/current/draco_decoder_gltf.wasm')) });
  const { MeshoptDecoder } = await import(path.join(VENDOR, 'meshoptimizer/current/meshopt_decoder.mjs'));
  const opts = (dir) => ({
    resolve: async (u) => { const p = dir && path.join(dir, u); return p && fs.existsSync(p) ? new Uint8Array(fs.readFileSync(p)) : null; },
    draco: async (b, a, k) => dracoDecode(D, b, a, k),
    meshopt: async () => MeshoptDecoder,
  });
  return { M, V, R, I, W, opts };
}

// ------------------------------------------------------------------ worker: fuzz one file
if (!isMainThread && workerData?.gltfFuzz) {
  const { APP, file, cuts, flips, seed } = workerData;
  const { M, R, I, opts } = await libs(APP);
  const bytes = new Uint8Array(fs.readFileSync(file));
  const res = [];
  const one = async (b, tag) => {
    try {
      const s = await R.readGltf(b, opts(null));
      const m = new M.Model();
      m.change('x', (mm) => { const x = I.importGltfScene(mm, s, 'fuzz'); mm.place(mm.root, x.def.id, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); });
      res.push({ tag, ok: 'read' });
    } catch (e) {
      res.push(e instanceof R.GltfError ? { tag, ok: 'GltfError ' + e.code } : { tag, bad: e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e) });
    }
  };
  for (const c of cuts) await one(bytes.subarray(0, c), '@' + c);
  let s = seed >>> 0;
  const rnd = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  for (let k = 0; k < flips; k++) {
    const b = bytes.slice();
    for (let j = 0, n = 1 + Math.floor(rnd() * 6); j < n; j++) b[Math.floor(rnd() * b.length)] = Math.floor(rnd() * 256);
    await one(b, 'flip' + k);
  }
  parentPort.postMessage(res);
}

/** A .gltf from parts: buffers as one data: URI. */
function makeGltf(json, chunks) {
  let total = 0;
  const views = [];
  for (const c of chunks) {
    const pad = (4 - (total % 4)) % 4;
    total += pad;
    views.push({ buffer: 0, byteOffset: total, byteLength: c.byteLength, ...(c.stride ? { byteStride: c.stride } : {}) });
    total += c.byteLength;
  }
  const buf = new Uint8Array(total);
  let o = 0;
  for (const c of chunks) { o += (4 - (o % 4)) % 4; buf.set(new Uint8Array(c.buffer, c.byteOffset, c.byteLength), o); o += c.byteLength; }
  const j = { asset: { version: '2.0' }, ...json, buffers: [{ byteLength: total, uri: 'data:application/octet-stream;base64,' + Buffer.from(buf).toString('base64') }], bufferViews: [...views, ...(json.bufferViews || [])] };
  return new TextEncoder().encode(JSON.stringify(j));
}
const f32 = (...a) => Float32Array.from(a.flat(Infinity));
const QUAD = f32([0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]);   // glTF Y up: a 1 × 1 square standing up, facing +Z

export async function run({ ok, close, section, APP }) {
  const { M, V, R, I, W, opts } = await libs(APP);
  const ident = V.ident();
  const imp = async (bytes, dir = null) => {
    const s = await R.readGltf(bytes, opts(dir));
    const model = new M.Model();
    const r = model.change('import', (m) => { const x = I.importGltfScene(m, s, 'test'); m.place(m.root, x.def.id, ident); return x; });
    return { s, model, r };
  };
  const refuses = async (bytes, code, what, dir = null) => {
    try { await R.readGltf(bytes, opts(dir)); ok(false, what, 'no error'); } catch (e) { ok(e instanceof R.GltfError && e.code === code, what, e instanceof R.GltfError ? e.code + ': ' + e.message : String(e.stack)); }
  };
  const meshDefs = (model) => [...model.defs.values()].filter((d) => d.mesh);

  section('glTF: accessors, primitives, axes');
  {
    // a quad as a triangle strip, positions interleaved with normals (stride 24), UVs as normalized u16
    const inter = new Float32Array(4 * 6);
    for (let i = 0; i < 4; i++) { inter.set(QUAD.subarray(i * 3, i * 3 + 3), i * 6); inter.set([0, 0, 1], i * 6 + 3); }
    inter.stride = 24;
    const uv = Uint16Array.from([0, 65535, 65535, 65535, 65535, 0, 0, 0]);
    const strip = Uint8Array.from([0, 1, 3, 2]);
    const g = makeGltf({
      scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, translation: [0, 2, 0], name: 'Up two' }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, mode: 5 }] }],
      accessors: [
        { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', byteOffset: 0, min: [0, 0, 0], max: [1, 1, 0] },
        { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', byteOffset: 12 },
        { bufferView: 1, componentType: 5123, count: 4, type: 'VEC2', normalized: true },
        { bufferView: 2, componentType: 5121, count: 4, type: 'SCALAR' },
      ],
    }, [inter, uv, strip]);
    const { model, r } = await imp(g);
    const [md] = meshDefs(model);
    const mesh = md?.mesh;
    ok(mesh && mesh.faceCount === 2 && mesh.vertexCount === 4, 'a strip of 4 indices → 2 triangles on 4 welded vertices', mesh && mesh.faceCount + ' faces ' + mesh.vertexCount + ' verts');
    const top = model.defs.get([...model.root.insts.values()][0].def);
    const place = [...top.insts.values()][0];
    ok(place && close(place.m[12], 0) && close(place.m[13], 0) && close(place.m[14], 2), 'Y up → Z up: a node 2 up in glTF sits 2 up in Z', place && place.m.slice(12, 15).join(','));
    ok(place && place.name === 'Up two', 'the placement keeps the node\'s name');
    const n = mesh && mesh.faceNormal(0);
    ok(n && close(n[1], -1, 1e-9), 'a quad facing glTF +Z faces −Y in Z up', n && n.join(','));
    const u = mesh && mesh.attrArray('uv');
    let uvOk = !!u;
    for (let h = 0; mesh && h < mesh.nh; h++) {
      const v = mesh.hV[h];
      const p = [mesh.P[v * 3], mesh.P[v * 3 + 1], mesh.P[v * 3 + 2]];
      // corner at glTF (x, y) had uv (x, 1−y) → v turned up: (x, y), i.e. (P.x, P.z)
      if (!close(u[h * 2], p[0], 1e-4) || !close(u[h * 2 + 1], p[2], 1e-4)) uvOk = false;
    }
    ok(uvOk, 'normalized u16 TEXCOORD_0 → uv, v turned to run up');
    ok(mesh && mesh.attrArray('normal') && close(mesh.attrArray('normal')[1], -1, 1e-6), 'NORMAL → the normal layer (in Z up)');
    ok(r.report.faces === 2 && r.report.meshes === 1, 'report counts faces and meshes');
    // fan, sparse, a MAT4 accessor read
    const fanIdx = Uint16Array.from([0, 1, 2, 3]);
    const sparseIdx = Uint8Array.from([2]);
    const sparseVal = f32([5, 5, 0]);
    const mats = f32([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 2, 3, 1]);
    const g2 = makeGltf({
      scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1, mode: 6 }] }],
      accessors: [
        { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', sparse: { count: 1, indices: { bufferView: 2, componentType: 5121 }, values: { bufferView: 3 } } },
        { bufferView: 1, componentType: 5123, count: 4, type: 'SCALAR' },
        { bufferView: 4, componentType: 5126, count: 1, type: 'MAT4' },
      ],
    }, [QUAD, fanIdx, sparseIdx, sparseVal, mats]);
    const s2 = await R.readGltf(g2);
    const P = s2.meshes[0].primitives[0].positions;
    ok(P[6] === 5 && P[7] === 5 && P[3] === 1, 'sparse values replace the base accessor\'s', [...P].join(','));
    const { model: m2 } = await imp(g2);
    ok(meshDefs(m2)[0].mesh.faceCount === 2, 'a fan of 4 → 2 triangles');
  }

  section('glTF: materials, texture transform, colours');
  {
    // a 1 × 1 PNG (red)
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');
    const uv = f32([0, 1], [1, 1], [1, 0], [0, 0]);
    const col = f32([1, 0, 0, 1], [0, 1, 0, 1], [0, 0, 1, 1], [1, 1, 1, 0.5]);
    const idx = Uint16Array.from([0, 1, 2, 0, 2, 3]);
    const pngView = new Uint8Array(png);
    const g = makeGltf({
      extensionsUsed: ['KHR_texture_transform', 'KHR_materials_clearcoat'],
      scenes: [{ nodes: [0, 1] }], nodes: [{ mesh: 0 }, { mesh: 1, translation: [3, 0, 0] }],
      meshes: [
        { primitives: [{ attributes: { POSITION: 0, TEXCOORD_0: 1, COLOR_0: 2 }, indices: 3, material: 0 }] },
        { primitives: [{ attributes: { POSITION: 0 }, indices: 3, material: 1 }] },
      ],
      materials: [
        { name: 'Tex', pbrMetallicRoughness: { baseColorTexture: { index: 0, extensions: { KHR_texture_transform: { offset: [0.5, 0], scale: [2, 2], rotation: 0 } } } } },
        { name: 'Coat', pbrMetallicRoughness: { baseColorFactor: [0.2158605, 0.2158605, 0.2158605, 1], metallicFactor: 0.5 }, extensions: { KHR_materials_clearcoat: { clearcoatFactor: 1 } } },
      ],
      textures: [{ source: 0 }], images: [{ bufferView: 4, mimeType: 'image/png' }],
      accessors: [
        { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
        { bufferView: 1, componentType: 5126, count: 4, type: 'VEC2' },
        { bufferView: 2, componentType: 5126, count: 4, type: 'VEC4' },
        { bufferView: 3, componentType: 5123, count: 6, type: 'SCALAR' },
      ],
    }, [QUAD, uv, col, idx, pngView]);
    const { model, r } = await imp(g);
    const [texDef, coatDef] = meshDefs(model);
    const tm = texDef.mesh;
    const paint = tm.facePaint(0);
    ok(M.isImagePaint(paint) && model.images.size === 1, 'a base colour texture → an image paint and one kept image', paint);
    const U = tm.attrArray('uv');
    let tt = true;
    for (let h = 0; h < tm.nh; h++) {
      const v = tm.hV[h];
      const x = tm.P[v * 3], gy = tm.P[v * 3 + 2];   // glTF y is model z
      const u0 = x, v0 = 1 - gy;                       // the file's uv at that corner
      if (!close(U[h * 2], u0 * 2 + 0.5, 1e-5) || !close(U[h * 2 + 1], 1 - v0 * 2, 1e-5)) tt = false;
    }
    ok(tt, 'KHR_texture_transform (offset 0.5, scale 2) baked into the uv layer');
    const C = tm.attrArray('color');
    ok(C && C.length >= tm.nh * 4 && [...C.subarray(0, 4)].every((v) => v === 0 || v === 1 || v === 0.5), 'COLOR_0 → the color layer (corner RGBA)');
    ok(coatDef.mesh.facePaint(0) === '#808080', 'a base colour factor → that colour (linear 0.2159 = #808080)', coatDef.mesh.facePaint(0));
    const coat = r.report.materials.find((x) => x.name === 'Coat');
    ok(coat && coat.extra && coat.also.includes('clearcoat') && coat.also.includes('metal 0.50'), 'the rest of a material is read and reported', JSON.stringify(coat));
    ok(coat && coat.openpbr.params.coat_weight === 1 && coat.openpbr.params.base_metalness === 0.5, 'each imported material carries its OpenPBR parameters for `materials`', JSON.stringify(coat && coat.openpbr));
  }

  section('glTF: skins, morphs, instancing, lamps, cameras');
  {
    // a 2-triangle quad on two joints; the second joint turned 90° about glTF Z at rest: its vertices follow it
    const joints = Uint8Array.from([0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0]);
    const weights = f32([1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0], [1, 0, 0, 0]);   // each vertex wholly on its first joint
    const ibm = f32([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -1, 0, 1]);
    const idx = Uint16Array.from([0, 1, 2, 0, 2, 3]);
    const morph = f32([0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1]);
    const g = makeGltf({
      extensionsUsed: ['KHR_lights_punctual', 'EXT_mesh_gpu_instancing'],
      extensions: { KHR_lights_punctual: { lights: [{ type: 'point', intensity: 100, color: [1, 1, 1] }, { type: 'spot', intensity: 10, spot: { outerConeAngle: Math.PI / 6 } }, { type: 'directional' }] } },
      scenes: [{ nodes: [0, 3, 4, 5, 6, 7, 8] }],
      nodes: [
        { mesh: 0, skin: 0, translation: [100, 0, 0] }, { children: [2] }, { translation: [0, 1, 0], rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2] },
        { children: [1] },
        { mesh: 1, weights: [0.5] },
        { mesh: 2, extensions: { EXT_mesh_gpu_instancing: { attributes: { TRANSLATION: 6 } } } },
        { translation: [0, 3, 0], extensions: { KHR_lights_punctual: { light: 0 } } },
        { translation: [1, 2, 3], rotation: [-Math.SQRT1_2, 0, 0, Math.SQRT1_2], extensions: { KHR_lights_punctual: { light: 1 } } },
        { camera: 0, translation: [0, 1.6, 5], children: [9] },
        { extensions: { KHR_lights_punctual: { light: 2 } } },
      ],
      skins: [{ joints: [1, 2], inverseBindMatrices: 4 }],
      cameras: [{ type: 'perspective', perspective: { yfov: 0.6, znear: 0.1 }, name: 'Front door' }],
      meshes: [
        { primitives: [{ attributes: { POSITION: 0, JOINTS_0: 2, WEIGHTS_0: 3 }, indices: 1 }] },
        { primitives: [{ attributes: { POSITION: 0 }, indices: 1, targets: [{ POSITION: 5 }] }] },
        { primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] },
      ],
      accessors: [
        { bufferView: 0, componentType: 5126, count: 4, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] },
        { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' },
        { bufferView: 2, componentType: 5121, count: 4, type: 'VEC4' },
        { bufferView: 3, componentType: 5126, count: 4, type: 'VEC4' },
        { bufferView: 4, componentType: 5126, count: 2, type: 'MAT4' },
        { bufferView: 5, componentType: 5126, count: 4, type: 'VEC3', min: [0, 0, 1], max: [0, 0, 1] },
        { bufferView: 6, componentType: 5126, count: 3, type: 'VEC3' },
      ],
    }, [QUAD, idx, joints, weights, ibm, morph, f32([0, 0, 0], [2, 0, 0], [4, 0, 0])]);
    const { model, r } = await imp(g);
    const defs = meshDefs(model);
    const skinned = defs.find((d) => d.mesh.hasAttr('joints'));
    // joint 2's world = translate(0,1,0)·rotZ(90°); IBM2 = translate(0,−1,0): a vertex at glTF (1,1,0) goes to (0, 2, 0) → Z up (0, 0, 2)
    let found = false;
    if (skinned) for (let v = 0; v < skinned.mesh.nv; v++) { const p = [skinned.mesh.P[v * 3], skinned.mesh.P[v * 3 + 1], skinned.mesh.P[v * 3 + 2]]; if (close(p[0], 0, 1e-9) && close(p[1], 0, 1e-9) && close(p[2], 2, 1e-9)) found = true; }
    ok(skinned && found, 'a skinned mesh comes in posed as it rests (joint world × inverse bind)');
    const skinPlace = [...model.defs.get([...model.root.insts.values()][0].def).insts.values()].find((i) => i.def === skinned?.id);
    ok(skinPlace && V.mmul(skinPlace.m, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])[12] === 0, 'a skinned mesh ignores its own node transform (placed at the origin)');
    ok(skinned && skinned.mesh.attrInfo('joints')?.domain === 'vertex' && skinned.mesh.attrInfo('weights')?.size === 4, 'JOINTS_0 / WEIGHTS_0 → vertex layers joints (i32) / weights');
    const morphed = defs.find((d) => !d.mesh.hasAttr('joints') && Math.abs(d.mesh.bounds().min[1] + 0.5) < 1e-9);
    ok(morphed, 'morph weight 0.5 moves the quad half a target (glTF z +0.5 → model y −0.5)', defs.map((d) => JSON.stringify(d.mesh.bounds())).join(' '));
    ok(r.report.instances === 3 && r.report.components >= 1, 'EXT_mesh_gpu_instancing → 3 placements of one mesh', 'instances ' + r.report.instances);
    const lamps = [...model.lights.values()];
    const point = lamps.find((l) => l.kind === 'point');
    const spot = lamps.find((l) => l.kind === 'spot');
    ok(lamps.length === 2 && point && close(point.p[2], 3) && point.lumens === Math.round(100 * 4 * Math.PI), 'a point light → a lamp 3 up, 100 cd → ' + (point && point.lumens) + ' lm');
    ok(spot && close(spot.p[0], 1) && close(spot.p[1], -3) && close(spot.p[2], 2) && spot.angle === 60 && close(spot.dir[2], -1, 1e-6), 'a spot light → a spot lamp aimed down with a 60° cone', spot && JSON.stringify([spot.p, spot.dir, spot.angle]));
    ok(r.report.skipped[Object.keys(r.report.skipped).find((k) => /directional/.test(k))] === 1, 'a directional light is counted, not added');
    const sc = model.scenes.find((x) => x.name === 'Front door');
    // glTF eye (0, 1.6, 5) looking along −Z → model eye (0, −5, 1.6) looking along +Y
    ok(sc && close(sc.cam.eye[1], -5) && close(sc.cam.eye[2], 1.6) && close(sc.cam.fov, 0.6 * 180 / Math.PI, 1e-6) && sc.cam.target[1] > sc.cam.eye[1], 'a camera → a scene at its eye, looking where it looks, same field of view', sc && JSON.stringify(sc.cam));
    ok(r.report.skins === 1 && r.report.morphs === 1, 'skins and morph targets counted');
    // undo takes the whole import back
    model.undo();
    ok(!model.lights.size && !model.scenes.length && !model.root.insts.size, 'one undo takes back meshes, lamps and scenes');
  }

  section('glTF ↔ OpenPBR (after RN.2)');
  {
    const PB = await import(path.join(APP, 'io/pbr.js'));
    const PK = await import(path.join(APP, 'render/pt-pack.js')), PS_MAT_FLOATS = (await import(path.join(APP, 'render/pt-spec.js'))).MAT_FLOATS;
    const glass = { name: 'Glass', baseColor: [1, 1, 1, 1], baseColorTex: null, metallic: 0, roughness: 0.05, metallicRoughnessTex: null, normalTex: null, occlusionTex: null,
      emissive: [0, 0, 0], emissiveTex: null, emissiveStrength: 1, alphaMode: 'OPAQUE', alphaCutoff: 0.5, doubleSided: false, unlit: false, ior: 1.45, transmission: 1, transmissionTex: null,
      volume: { thickness: 0.01, thicknessTex: null, attenuationDistance: 0.5, attenuationColor: [0.2, 0.8, 0.6] }, clearcoat: { factor: 0.5, tex: null, roughness: 0.1, roughnessTex: null, normalTex: null },
      sheen: null, specular: null, iridescence: { factor: 1, tex: null, ior: 1.3, thicknessMin: 100, thicknessMax: 400, thicknessTex: null }, anisotropy: null, dispersion: 1 };
    const { params } = PB.gltfToOpenPBR(glass);
    ok(params.transmission_weight === 1 && params.specular_ior === 1.45 && params.transmission_depth === 0.5 && params.coat_weight === 0.5 && params.thin_film_thickness === 0.4 && params.transmission_dispersion_abbe_number === 20 && !params.geometry_thin_walled, 'glass with volume, coat, iridescence, dispersion → OpenPBR names', JSON.stringify(params));
    const rec = PK.recordFrom(params);
    ok(rec.length === PS_MAT_FLOATS && rec.every(Number.isFinite), 'render\'s recordFrom takes the parameters (a finite record of MAT_FLOATS: 80 since RENDER-SPEC v8)');
    const back = PB.openPBRToGltf(params);
    const e = back.material.extensions || {};
    ok(close(e.KHR_materials_ior?.ior, 1.45, 1e-6) && close(e.KHR_materials_volume?.attenuationColor[1], 0.8, 1e-4) && close(e.KHR_materials_clearcoat?.clearcoatFactor, 0.5, 1e-9) && close(e.KHR_materials_iridescence?.iridescenceThicknessMaximum, 400, 1e-6) && close(e.KHR_materials_dispersion?.dispersion, 1, 1e-6), 'and back to glTF KHR extensions (AP1 ↔ Rec.709 round trip)', JSON.stringify(back.material));
    const unlit = PB.gltfToOpenPBR({ ...glass, unlit: true, baseColor: [1, 0, 0, 1] }).params;
    ok(unlit.base_weight === 0 && unlit.emission_luminance === 1, 'unlit → emission only');
    const fb = PB.fbxToOpenPBR({ DiffuseColor: [1, 0, 0], ShininessExponent: [20], Opacity: [0.5] }).params;
    ok(fb.base_color[0] > 0.5 && fb.specular_roughness > 0.4 && fb.specular_roughness < 0.6 && fb.geometry_opacity === 0.5, 'FBX lambert/phong → OpenPBR (shininess 20 → roughness ≈ 0.5)', JSON.stringify(fb));
  }

  section('glTF: refusals');
  {
    const base = { scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }], meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
      accessors: [{ bufferView: 0, componentType: 5126, count: 4, type: 'VEC3' }, { bufferView: 1, componentType: 5123, count: 6, type: 'SCALAR' }] };
    const idx = Uint16Array.from([0, 1, 2, 0, 2, 3]);
    const mk = (patch) => { const j = JSON.parse(new TextDecoder().decode(makeGltf(base, [QUAD, idx]))); patch(j); return new TextEncoder().encode(JSON.stringify(j)); };
    await refuses(mk((j) => { j.accessors[0].count = 400; }), 'damaged', 'an accessor past its buffer view');
    await refuses(mk((j) => { j.bufferViews[0].byteLength = 1e6; }), 'damaged', 'a buffer view past its buffer');
    await refuses(mk((j) => { j.bufferViews[0].byteStride = 2; }), 'damaged', 'a stride under 4');
    {
      const big = Uint16Array.from([0, 1, 9, 0, 2, 3]);
      await refuses(makeGltf(base, [QUAD, big]), 'damaged', 'an index past the vertices');
    }
    await refuses(mk((j) => { j.nodes = [{ children: [1] }, { children: [0] }]; }), 'damaged', 'a node loop');
    await refuses(mk((j) => { j.nodes = [{ children: [2] }, { children: [2] }, {}]; }), 'damaged', 'a node with two parents');
    await refuses(mk((j) => { j.extensionsRequired = ['EXT_unknown_thing']; j.extensionsUsed = ['EXT_unknown_thing']; }), 'unsupported', 'an unknown required extension');
    await refuses(mk((j) => { j.asset.version = '1.0'; }), 'unsupported', 'glTF 1.0');
    await refuses(new TextEncoder().encode('solid stl'), 'not_gltf', 'not glTF at all');
    await refuses(mk((j) => { j.buffers[0].uri = 'model.bin'; }), 'missing', 'a .gltf whose .bin was not given');
    await refuses(mk((j) => { j.accessors[0].componentType = 5124; }), 'damaged', 'an unknown component type');
    await refuses(mk((j) => { j.meshes[0].primitives[0].mode = 9; }), 'damaged', 'an unknown primitive mode');
    await refuses(mk((j) => { j.accessors[0].sparse = { count: 6, indices: { bufferView: 1, componentType: 5123 }, values: { bufferView: 0 } }; }), 'damaged', 'sparse indices out of order (the index list 0 1 2 0 2 3)');
  }

  // ------------------------------------------------------------------ the sample corpus
  const files = [];
  if (fs.existsSync(CORPUS)) {
    const walk = (d) => { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); if (fs.statSync(p).isDirectory()) walk(p); else if (/\.(glb|gltf)$/.test(f)) files.push(p); } };
    walk(CORPUS);
  }
  if (!files.length) console.log('  glTF sample corpus not found at ' + CORPUS + ' — corpus checks skipped.');
  const validator = fs.existsSync(VALIDATOR) ? createRequire(import.meta.url)(VALIDATOR) : null;
  if (!validator) console.log('  Khronos glTF validator not found at ' + VALIDATOR + ' — writer checks skipped.');
  if (files.length) {
    section('glTF: the Khronos sample models (' + files.length + ' files)');
    const base = new Map();   // model name → {faces, bbox} of the plain glTF variant
    let readOk = 0;
    let validOk = 0;
    let validN = 0;
    const problems = [];
    for (const f of files) {
      const rel = path.relative(CORPUS, f);
      const [modelName, variant] = rel.split('/');
      let got;
      try { got = await imp(new Uint8Array(fs.readFileSync(f)), path.dirname(f)); } catch (e) { problems.push(rel + ': ' + e.message); continue; }
      const { s, model, r } = got;
      readOk++;
      // faces vs the file's triangles; bounds vs the world bounds worked out here from the reader's output
      const ref = refBounds(s, V);
      const bb = model.bbox();
      const tris = s.meshes.length ? countTris(s) : 0;
      const lost = Object.entries(r.report.skipped).filter(([k]) => /area/.test(k) && !/lamp/.test(k)).reduce((n, [, v]) => n + v, 0);
      if (ref.used && r.report.faces + lost !== ref.tris) problems.push(rel + ': ' + r.report.faces + ' faces + ' + lost + ' dropped vs ' + ref.tris + ' triangles placed');
      if (!ref.skinned && ref.box && bb && !(ref.box.min.every((v, k) => close(v, bb.min[k], 1e-4 * (1 + Math.abs(v)))) && ref.box.max.every((v, k) => close(v, bb.max[k], 1e-4 * (1 + Math.abs(v)))))) problems.push(rel + ': bounds ' + JSON.stringify(bb) + ' vs ' + JSON.stringify(ref.box));
      if (variant === 'glTF') base.set(modelName, { faces: r.report.faces, bb });
      const b = base.get(modelName);
      if (b && variant !== 'glTF' && bb && b.bb) {
        const tol = /Quantized|Meshopt|Draco/.test(variant) ? 2e-3 : 1e-5;
        const size = Math.max(...b.bb.max.map((v, k) => v - b.bb.min[k]), 1e-9);
        if (!b.bb.min.every((v, k) => Math.abs(v - bb.min[k]) <= tol * size) || !b.bb.max.every((v, k) => Math.abs(v - bb.max[k]) <= tol * size)) problems.push(rel + ': bounds differ from the plain glTF');
        if (Math.abs(r.report.faces - b.faces) > Math.max(16, b.faces * 0.002)) problems.push(rel + ': ' + r.report.faces + ' faces vs ' + b.faces + ' in the plain glTF');
      }
      // save → reload; undo
      const back = new M.Model();
      back.load(JSON.parse(JSON.stringify(model.toJSON())));
      const bb2 = back.bbox();
      if (bb && !(bb2 && bb.min.every((v, k) => close(v, bb2.min[k], 1e-9)))) problems.push(rel + ': save → reload moved it');
      // the writer, once per model (its .glb or its plain .gltf)
      if (validator && (variant === 'glTF-Binary' || (variant === 'glTF' && !fs.existsSync(path.join(CORPUS, modelName, 'glTF-Binary'))))) {
        const out = W.exportGltf(model);
        const v = await validator.validateBytes(out.bytes, { maxIssues: 10 });
        validN++;
        if (v.issues.numErrors) problems.push(rel + ': written file has ' + v.issues.numErrors + ' validator errors: ' + v.issues.messages.filter((m) => m.severity === 0).slice(0, 2).map((m) => m.code + ' ' + m.pointer).join('; '));
        else validOk++;
        const again = await imp(out.bytes);
        const bb3 = again.model.bbox();
        if (again.r.report.faces !== r.report.faces) problems.push(rel + ': re-imported with ' + again.r.report.faces + ' faces, not ' + r.report.faces);
        if (bb && bb3 && !bb.min.every((v, k) => close(v, bb3.min[k], 1e-5 * (1 + Math.abs(v))))) problems.push(rel + ': re-imported somewhere else');
      }
      model.undo();
      if (model.root.insts.size) problems.push(rel + ': undo left something behind');
    }
    ok(readOk === files.length, 'every sample file reads and imports (' + readOk + ' of ' + files.length + ')', problems.filter((p) => !/bounds|faces|written|re-imported|undo|reload/.test(p)).slice(0, 3).join(' || '));
    ok(!problems.length, 'faces, bounds, variants, save/reload, undo and re-import agree', problems.slice(0, 6).join(' || '));
    if (validator) ok(validOk === validN && validN > 0, 'the Khronos validator finds no errors in what we write (' + validOk + ' of ' + validN + ' models)');
  }

  if (validator) {
    section('glTF: writing a ModelCraft model');
    const model = new M.Model();
    model.change('box', (m) => {
      const pts = [[0, 0, 0], [2, 0, 0], [2, 1, 0], [0, 1, 0]];
      const d = M.meshDef(m, [pts, pts.map(([x, y]) => [x, y, 1]).reverse()], 'Slab');
      for (const f of d.faces.values()) f.color = '#c0392b';
      m.place(m.root, d.id, ident);
      m.place(m.root, d.id, V.translation([5, 0, 0]));
      m.addLight({ kind: 'spot', p: [1, 1, 3], dir: [0, 0, -1], lumens: 1200, angle: 50, color: '#ffffff', name: 'Spot' });
      m.addLight({ kind: 'area', p: [1, 1, 3], dir: [0, 0, -1], lumens: 1200 });
      m.scenes.push(M.cleanScene({ name: 'Corner', cam: { eye: [10, -10, 5], target: [0, 0, 0], fov: 40, persp: true } }));
    });
    const out = W.exportGltf(model);
    const v = await validator.validateBytes(out.bytes, { maxIssues: 10 });
    ok(!v.issues.numErrors && !v.issues.numWarnings, 'a push/pull model with a lamp and a scene validates clean', JSON.stringify(v.issues.messages.slice(0, 3)));
    ok(out.report.lights === 1 && out.report.cameras === 1 && Object.keys(out.report.skipped).length === 1, 'the spot is written, the area lamp counted', JSON.stringify(out.report));
    const { model: back, r } = await imp(out.bytes);
    const L = [...back.lights.values()][0];
    ok(L && L.kind === 'spot' && Math.abs(L.lumens - 1200) <= 1 && Math.abs(L.angle - 50) <= 1 && close(L.p[2], 3, 1e-6) && close(L.dir[2], -1, 1e-6), 'the lamp comes back: spot, 1200 lm, 50°, same place and aim', L && JSON.stringify(L));
    const S = back.scenes[0];
    ok(S && close(S.cam.fov, 40, 1e-6) && close(S.cam.eye[0], 10, 1e-6) && close(S.cam.eye[2], 5, 1e-6), 'the scene comes back as a camera at the same eye and field of view', S && JSON.stringify(S.cam));
    ok(r.report.components === 1, 'the definition placed twice stays one mesh placed twice');
    const ms = meshDefs(back);
    ok(ms.length === 1 && ms[0].mesh.facePaint(0) === '#c0392b', 'its colour comes back', ms[0] && ms[0].mesh.facePaint(0));
  }

  if (files.length && !process.argv.includes('--no-fuzz')) {
    section('glTF: fuzz (worker, time limit)');
    for (const rel of ['Box/glTF-Binary/Box.glb', 'BoxTextured/glTF-Binary/BoxTextured.glb', 'CesiumMan/glTF-Binary/CesiumMan.glb', 'SimpleInstancing/glTF-Binary/SimpleInstancing.glb', 'LightsPunctualLamp/glTF-Binary/LightsPunctualLamp.glb']) {
      const f = path.join(CORPUS, rel);
      if (!fs.existsSync(f)) continue;
      const size = fs.statSync(f).size;
      const cuts = new Set([0, 4, 12, 20, 40, 100, size - 1]);
      for (let i = 1; i <= 10; i++) cuts.add(Math.floor(size * i / 11));
      const res = await new Promise((resolve) => {
        const w = new Worker(fileURLToPath(import.meta.url), { workerData: { gltfFuzz: true, APP, file: f, cuts: [...cuts].filter((c) => c >= 0).sort((a, b) => a - b), flips: 30, seed: size } });
        const timer = setTimeout(() => { w.terminate(); resolve({ hang: true }); }, 180000);
        w.once('message', (m) => { clearTimeout(timer); w.terminate(); resolve(m); });
        w.once('error', (e) => { clearTimeout(timer); resolve([{ tag: 'worker', bad: e.message }]); });
      });
      if (res.hang) { ok(false, 'fuzz ' + rel, 'no answer within 180 s'); continue; }
      const bad = res.filter((x) => x.bad);
      const counts = {};
      for (const x of res) { const k = x.ok || 'BAD'; counts[k] = (counts[k] || 0) + 1; }
      ok(!bad.length, 'fuzz ' + path.basename(rel) + ' (' + Object.entries(counts).map(([k, n]) => n + ' ' + k).join(', ') + ')', bad.slice(0, 2).map((x) => x.tag + ' ' + x.bad).join(' || '));
    }
  }
}

/** Triangles every mesh primitive has (modes 4–6), placed or not. */
function countTris(s) {
  let n = 0;
  for (const m of s.meshes) for (const p of m.primitives) {
    const c = p.indices ? p.indices.length : p.count;
    n += p.mode === 4 ? Math.floor(c / 3) : p.mode >= 5 ? Math.max(0, c - 2) : 0;
  }
  return n;
}

/** World bounds of the scene's triangles in Z up, worked out from the reader's output (no importer code). */
function refBounds(s, V) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  let tris = 0;
  let skinned = false;
  let used = true;
  const meshSeen = new Set();
  const visit = (ni, pm, depth) => {
    if (depth > 64) return;
    const n = s.nodes[ni];
    const wm = V.mmul(pm, n.matrix);
    if (n.mesh !== null) {
      const gm = s.meshes[n.mesh];
      const w = n.weights ?? gm.weights;
      if (n.skin !== null || w.some((x) => x)) { skinned = true; used = false; }
      const places = n.instances ? Array.from({ length: n.instances.count }, (_, k) => {
        const I = n.instances;
        return V.mmul(wm, trsOf(I.t ? [I.t[k * 3], I.t[k * 3 + 1], I.t[k * 3 + 2]] : [0, 0, 0], I.r ? [I.r[k * 4], I.r[k * 4 + 1], I.r[k * 4 + 2], I.r[k * 4 + 3]] : [0, 0, 0, 1], I.s ? [I.s[k * 3], I.s[k * 3 + 1], I.s[k * 3 + 2]] : [1, 1, 1]));
      }) : [wm];
      const first = !meshSeen.has(n.mesh);
      meshSeen.add(n.mesh);
      for (const m of places) for (const p of gm.primitives) {
        if (p.mode < 4) continue;
        const ix = p.indices ?? Uint32Array.from({ length: p.count }, (_, i) => i);
        const nt = p.mode === 4 ? Math.floor(ix.length / 3) : Math.max(0, ix.length - 2);
        if (first && m === places[0]) tris += nt;   // a mesh placed twice is one definition
        const seen = new Uint8Array(p.count);
        for (let k = 0; k < (p.mode === 4 ? nt * 3 : ix.length); k++) {
          const i = ix[k];
          if (seen[i]) continue;
          seen[i] = 1;
          const q = V.apply(m, [p.positions[i * 3], p.positions[i * 3 + 1], p.positions[i * 3 + 2]]);
          const z = [q[0], -q[2], q[1]];
          for (let a = 0; a < 3; a++) { if (z[a] < min[a]) min[a] = z[a]; if (z[a] > max[a]) max[a] = z[a]; }
        }
      }
    }
    for (const c of n.children) visit(c, wm, depth + 1);
  };
  for (const r of s.scenes[s.scene].nodes) visit(r, V.ident(), 0);
  return { box: Number.isFinite(min[0]) ? { min, max } : null, tris, skinned, used };
}

function trsOf(T, R, S) {
  const [x, y, z, w] = R;
  return [(1 - 2 * (y * y + z * z)) * S[0], 2 * (x * y + z * w) * S[0], 2 * (x * z - y * w) * S[0], 0, 2 * (x * y - z * w) * S[1], (1 - 2 * (x * x + z * z)) * S[1], 2 * (y * z + x * w) * S[1], 0, 2 * (x * z + y * w) * S[2], 2 * (y * z - x * w) * S[2], (1 - 2 * (x * x + y * y)) * S[2], 0, T[0], T[1], T[2], 1];
}

if (isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
  let pass = 0;
  let fail = 0;
  const ok = (c, what, d) => { if (c) pass++; else { fail++; console.log('  FAIL ' + what + (d ? ' — ' + d : '')); } };
  const close = (a, b, eps = 1e-9) => Math.abs(a - b) <= eps;
  const section = (s) => console.log(s);
  await run({ ok, close, section, APP });
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
