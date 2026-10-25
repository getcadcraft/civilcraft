#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fbx.mjs — ModelCraft's clean-room FBX reader (modelcraft/dev/io/fbx-parse.js, fbx-import.js, tga.js; 0.7 XF.4 / XF.6,
 * session `interchange`; rules in docs/spikes/fbx-reader.md). Run by bin/test-modelcraft.mjs (§ FBX) or on its own:
 *   node tools/modelcraft-test/fbx.mjs [--no-fuzz]
 *
 * 1. Hand-made files (binary 7.4 and 7.5 records, ASCII) with known answers: the container (every property type, zlib
 *    arrays, 32- and 64-bit records, null records), polygons from PolygonVertexIndex, layer mappings, materials by
 *    polygon, the transform stack (pivots, offsets, pre-rotation, rotation orders), axes and units, TGA → PNG, refusals.
 * 2. Assimp's BSD test models (testfiles/fbx-corpus/assimp, outside git): every file imports; triangles and **every world
 *    point** agree with Assimp's (assimp-py in /var/www/CADCRAFT/oracles/fbx-venv — black box, its output only).
 * 3. Truncation + byte-flip fuzz in a worker with a time limit: only an FbxError (or a model) comes out.
 *
 *   run({ ok, close, section, APP })
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const CORPUS = '/var/www/CADCRAFT/testfiles/fbx-corpus/assimp';
const PY = '/var/www/CADCRAFT/oracles/fbx-venv/bin/python';

async function libs(APP) {
  const I18N = await import(path.join(APP, 'i18n.js'));
  const LANG = path.join(APP, 'lang/en.json');
  if (fs.existsSync(LANG)) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(LANG, 'utf8')) });
  return {
    M: await import(path.join(APP, 'model.js')), V: await import(path.join(APP, 'vec.js')),
    P: await import(path.join(APP, 'io/fbx-parse.js')), F: await import(path.join(APP, 'io/fbx-import.js')), G: await import(path.join(APP, 'io/tga.js')),
  };
}

if (!isMainThread && workerData?.fbxFuzz) {
  const { APP, file, cuts, flips, seed } = workerData;
  const { M, P, F } = await libs(APP);
  const bytes = new Uint8Array(fs.readFileSync(file));
  const res = [];
  const one = async (b, tag) => {
    try {
      const sc = await F.readFbxScene(P.parseFbx(b), {});
      new M.Model().change('x', (m) => F.importFbx(m, sc, 'f'));
      res.push({ tag, ok: 'read' });
    } catch (e) { res.push(e instanceof P.FbxError ? { tag, ok: 'FbxError ' + e.code } : { tag, bad: e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e) }); }
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

// ------------------------------------------------------------------ a small binary FBX writer (test only)
/** node = [name, [props], [children]]; a prop: number (I), {d}, {L}, string (S), Float64Array (d[]), Int32Array (i[]), {zip: Float64Array}. */
function writeFbx(nodes, version = 7400) {
  const wide = version >= 7500;
  const head = wide ? 25 : 13;
  const parts = [];
  let pos = 27;
  const prop = (p) => {
    const out = [];
    const u32 = (v) => { const b = Buffer.alloc(4); b.writeUInt32LE(v); return b; };
    if (typeof p === 'number') { const b = Buffer.alloc(5); b.write('I'); b.writeInt32LE(p, 1); out.push(b); }
    else if (typeof p === 'string') { out.push(Buffer.from('S'), u32(Buffer.byteLength(p)), Buffer.from(p)); }
    else if (p instanceof Float64Array || p instanceof Int32Array || (p && p.zip)) {
      const arr = p.zip || p;
      const tc = arr instanceof Float64Array ? 'd' : 'i';
      const raw = Buffer.from(arr.buffer, arr.byteOffset, arr.byteLength);
      const body = p.zip ? zlib.deflateSync(raw) : raw;
      out.push(Buffer.from(tc), u32(arr.length), u32(p.zip ? 1 : 0), u32(body.length), body);
    } else if (p && 'd' in p) { const b = Buffer.alloc(9); b.write('D'); b.writeDoubleLE(p.d, 1); out.push(b); }
    else if (p && 'L' in p) { const b = Buffer.alloc(9); b.write('L'); b.writeBigInt64LE(BigInt(p.L), 1); out.push(b); }
    else if (p && 'raw' in p) { out.push(Buffer.from('R'), u32(p.raw.length), Buffer.from(p.raw)); }
    return Buffer.concat(out);
  };
  const rec = (n, at) => {
    const [name, props, children = []] = n;
    const pl = Buffer.concat(props.map(prop));
    const nm = Buffer.from(name);
    let p = at + head + nm.length + pl.length;
    const kidsBufs = [];
    for (const c of children) { const b = rec(c, p); kidsBufs.push(b); p += b.length; }
    if (children.length) { kidsBufs.push(Buffer.alloc(head)); p += head; }
    const h = Buffer.alloc(head);
    if (wide) { h.writeBigUInt64LE(BigInt(p), 0); h.writeBigUInt64LE(BigInt(props.length), 8); h.writeBigUInt64LE(BigInt(pl.length), 16); h[24] = nm.length; }
    else { h.writeUInt32LE(p, 0); h.writeUInt32LE(props.length, 4); h.writeUInt32LE(pl.length, 8); h[12] = nm.length; }
    return Buffer.concat([h, nm, pl, ...kidsBufs]);
  };
  for (const n of nodes) { const b = rec(n, pos); parts.push(b); pos += b.length; }
  const top = Buffer.alloc(27);
  top.write('Kaydara FBX Binary  \0');
  top[21] = 0x1a; top[22] = 0;
  top.writeUInt32LE(version, 23);
  return new Uint8Array(Buffer.concat([top, ...parts, Buffer.alloc(head), Buffer.alloc(160)]));
}
const P70 = (...ps) => ['Properties70', [], ps.map(([n, ...v]) => ['P', [n, n, '', 'A', ...v.map((x) => ({ d: x }))]])];

export async function run({ ok, close, section, APP }) {
  const { M, V, P, F, G } = await libs(APP);
  const ident = V.ident();
  const imp = async (bytes, resolve = null) => {
    const sc = await F.readFbxScene(P.parseFbx(bytes), { resolve });
    const model = new M.Model();
    const r = model.change('import', (m) => { const x = F.importFbx(m, sc, 'test'); m.place(m.root, x.def.id, ident); return x; });
    return { sc, model, r };
  };
  const meshes = (model) => [...model.defs.values()].filter((d) => d.mesh);
  const worldPts = (model) => { const out = []; model.walk((d, wm) => { if (!d.mesh) return; const p = d.mesh.P; for (let v = 0; v < d.mesh.nv; v++) out.push(V.apply(wm, [p[v * 3], p[v * 3 + 1], p[v * 3 + 2]])); }); return out; };

  // a quad + a triangle sharing an edge, Y up, centimetres; the model translated 100 cm up the file's Y and turned 90° about Z
  const scene = (version, zip) => writeFbx([
    ['FBXHeaderExtension', [], [['FBXVersion', [version]]]],
    ['GlobalSettings', [], [P70(['UnitScaleFactor', 1])]],
    ['Objects', [], [
      ['Geometry', [{ L: 10 }, 'Geometry::Plate', 'Mesh'], [
        ['Vertices', [zip ? { zip: Float64Array.of(0, 0, 0, 100, 0, 0, 100, 0, -100, 0, 0, -100, 50, 0, -160) } : Float64Array.of(0, 0, 0, 100, 0, 0, 100, 0, -100, 0, 0, -100, 50, 0, -160)]],
        ['PolygonVertexIndex', [Int32Array.of(0, 1, 2, -4, 3, 2, -5)]],
        ['LayerElementUV', [0], [['MappingInformationType', ['ByPolygonVertex']], ['ReferenceInformationType', ['IndexToDirect']],
          ['UV', [Float64Array.of(0, 0, 1, 0, 1, 1, 0, 1, 0.5, 1.6)]], ['UVIndex', [Int32Array.of(0, 1, 2, 3, 3, 2, 4)]]]],
        ['LayerElementMaterial', [0], [['MappingInformationType', ['ByPolygon']], ['ReferenceInformationType', ['IndexToDirect']], ['Materials', [Int32Array.of(0, 1)]]]],
      ]],
      ['Model', [{ L: 20 }, 'Model::Plate', 'Mesh'], [P70(['Lcl Translation', 0, 100, 0], ['Lcl Rotation', 0, 0, 90])]],
      ['Material', [{ L: 30 }, 'Material::Red', ''], [P70(['DiffuseColor', 1, 0, 0])]],
      ['Material', [{ L: 31 }, 'Material::Blue', ''], [P70(['DiffuseColor', 0, 0, 1])]],
      ['Texture', [{ L: 40 }, 'Texture::T', ''], []],
      ['Video', [{ L: 50 }, 'Video::V', 'Clip'], [['RelativeFilename', ['red.tga']], ['Content', [{ raw: tga(2, 2, [255, 0, 0, 255]) }]]]],
    ]],
    ['Connections', [], [
      ['C', ['OO', { L: 20 }, { L: 0 }]], ['C', ['OO', { L: 10 }, { L: 20 }]], ['C', ['OO', { L: 30 }, { L: 20 }]], ['C', ['OO', { L: 31 }, { L: 20 }]],
      ['C', ['OP', { L: 40 }, { L: 30 }, 'DiffuseColor']], ['C', ['OO', { L: 50 }, { L: 40 }]],
    ]],
  ], version);

  section('FBX: the container and a hand-made scene');
  for (const [version, zip] of [[7400, false], [7500, true]]) {
    const bytes = scene(version, zip);
    const tree = P.parseFbx(bytes);
    ok(tree.binary && tree.version === version && P.child(tree.root, 'Objects').children.length === 6, version + (zip ? ' (64-bit records, zlib arrays)' : ' (32-bit records)') + ': the node tree');
    const { model, r } = await imp(bytes);
    const [md] = meshes(model);
    ok(md && md.mesh.faceCount === 2 && md.mesh.vertexCount === 5 && [...md.mesh.faceCorners(0, [])].length === 4, version + ': a quad and a triangle from PolygonVertexIndex (negative = last corner)');
    // file (x, y, z) cm → model (x, −z, y) m, after the model's own turn and lift
    const pts = worldPts(model).map((p) => p.map((x) => Math.round(x * 1e6) / 1e6));
    ok(pts.some((p) => close(p[0], 0) && close(p[1], 0) && close(p[2], 1)) && pts.some((p) => close(p[0], 0) && close(p[1], 0) && close(p[2], 2)), version + ': axes, centimetres and the transform: (100, 0, 0) turned 90° about Z and lifted 100 → 2 m up', JSON.stringify(pts));
    ok(M.isImagePaint(md.mesh.facePaint(0)) && md.mesh.facePaint(1) === '#0000ff' && model.images.size === 1, version + ': per-polygon materials; the textured one keeps its embedded TGA (as PNG)', md.mesh.facePaint(0) + ' ' + md.mesh.facePaint(1));
    const uv = md.mesh.attrArray('uv');
    const cs = md.mesh.faceCorners(1, []);
    ok(uv && cs.some((h) => close(uv[h * 2], 0.5, 1e-6) && close(uv[h * 2 + 1], 1.6, 1e-6)), version + ': IndexToDirect UVs by polygon vertex');
    void r;
  }
  {
    const img = G.decodeTga(tga(3, 2, [10, 20, 30, 255]));
    ok(img && img.width === 3 && img.height === 2 && img.rgba[0] === 10 && img.rgba[2] === 30, 'TGA: true colour, bottom-up, BGR → RGBA');
    const png = G.encodePng(img.width, img.height, img.rgba);
    ok(png[1] === 0x50 && png.length > 40, 'TGA → PNG writes a PNG');
    let code = '';
    try { P.parseFbx(new TextEncoder().encode('Kaydara FBX Binary  \0\x1a\0\x40\x1f\0\0' + '\0'.repeat(6))); } catch (e) { code = e.code; }
    ok(code === 'damaged' || code === 'not_fbx', 'a cut-off binary FBX is refused', code);
    code = '';
    try { P.parseFbx(new TextEncoder().encode('solid not fbx')); } catch (e) { code = e.code; }
    ok(code === 'not_fbx', 'not FBX at all');
    const old = writeFbx([['FBXHeaderExtension', [], []]], 6100);
    code = '';
    try { await F.readFbxScene(P.parseFbx(old)); } catch (e) { code = e.code; }
    ok(code === 'unsupported', 'FBX 6 files are refused with a reason', code);
    const evil = scene(7400, false);
    const dv = new DataView(evil.buffer);
    dv.setUint32(27, 0x7fffffff, true);   // the first record ends past the file
    code = '';
    try { P.parseFbx(evil); } catch (e) { code = e.code; }
    ok(code === 'damaged', 'a record that ends past the file is refused');
    const ascii = ['; FBX 7.4.0 project file', 'FBXHeaderExtension:  {', '\tFBXVersion: 7400', '}', 'Objects:  {', '\tGeometry: 1, "Geometry::", "Mesh" {', '\t\tVertices: *9 {', '\t\t\ta: 0,0,0,1,0,0,0,1,0', '\t\t}', '\t\tPolygonVertexIndex: *3 {', '\t\t\ta: 0,1,-3', '\t\t}', '\t}', '\tModel: 2, "Model::Tri", "Mesh" {', '\t}', '}', 'Connections:  {', '\tC: "OO",2,0', '\tC: "OO",1,2', '}', ''].join('\n');
    const a = await imp(new TextEncoder().encode(ascii));
    ok(meshes(a.model).length === 1 && a.r.report.faces === 1, 'an ASCII FBX: a triangle, linked through Connections');
  }

  // ------------------------------------------------------------------ corpus vs Assimp
  const files = fs.existsSync(CORPUS) ? fs.readdirSync(CORPUS).filter((f) => /\.fbx$/i.test(f)).concat(fs.existsSync(path.join(CORPUS, 'embedded_ascii/box.FBX')) ? ['embedded_ascii/box.FBX'] : []) : [];
  if (!files.length) console.log('  FBX corpus not found at ' + CORPUS + ' — corpus checks skipped.');
  else {
    section('FBX: Assimp\'s test models vs Assimp (' + files.length + ' files)');
    const haveOracle = fs.existsSync(PY);
    if (!haveOracle) console.log('  assimp-py not found at ' + PY + ' — oracle comparison skipped.');
    let read = 0;
    const problems = [];
    for (const f of files) {
      const file = path.join(CORPUS, f);
      let got;
      try { got = await imp(new Uint8Array(fs.readFileSync(file))); } catch (e) {
        if (f === 'transparentTest.fbx' && e.code === 'not_fbx') continue;   // every zero byte turned into a space: Assimp refuses it too
        problems.push(f + ': ' + e.message);
        continue;
      }
      read++;
      if (!haveOracle) continue;
      let a;
      try { a = JSON.parse(execFileSync(PY, ['-I', path.join(HERE, 'assimp_dump.py'), file], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 1e9 })); } catch { problems.push(f + ': the oracle could not read it'); continue; }
      let tris = 0;
      got.model.walk((d) => { if (d.mesh) tris += d.mesh.triangulate().tri.length / 3; });
      if (tris !== a.faces) problems.push(f + ': ' + tris + ' triangles vs ' + a.faces);
      // Assimp gives the file's unit, turned Y up: bring its points into ModelCraft's (Y up → Z up, the unit → metres)
      // and find each one among ours (nearest point within 0.1 % of the model's size)
      const A = F.axisMatrix({ ...got.sc.settings, up: 1, upSign: 1, front: 2, frontSign: 1, coord: 0, coordSign: 1 });
      const ours = worldPts(got.model);
      const size = Math.max(1e-9, ...ours.flat().map(Math.abs));
      const tol = size * 1e-3;
      const cell = new Map();
      const key = (p) => p.map((x) => Math.floor(x / tol)).join(',');
      for (const p of ours) { const k = key(p); if (!cell.has(k)) cell.set(k, []); cell.get(k).push(p); }
      const near = (p) => {
        const c = p.map((x) => Math.floor(x / tol));
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
          for (const o of cell.get([c[0] + dx, c[1] + dy, c[2] + dz].join(',')) || []) if (Math.hypot(o[0] - p[0], o[1] - p[1], o[2] - p[2]) <= tol) return true;
        }
        return false;
      };
      let miss = 0;
      for (let i = 0; i < a.points.length; i += 3) if (!near(V.apply(A, [a.points[i], a.points[i + 1], a.points[i + 2]]))) miss++;
      if (miss) problems.push(f + ': ' + miss + ' of ' + a.points.length / 3 + ' of Assimp\'s points are not where ours are');
    }
    ok(read >= files.length - 1, 'every readable file imports (' + read + ' of ' + files.length + '; the mangled transparentTest.fbx refused, as by Assimp)', problems.slice(0, 3).join(' || '));
    if (haveOracle) ok(!problems.length, 'triangles and every world point agree with Assimp (pivots, offsets, mirroring, units, axes, skins at rest)', problems.slice(0, 4).join(' || '));
  }

  if (files.length && !process.argv.includes('--no-fuzz')) {
    section('FBX: fuzz (worker, time limit)');
    for (const f of ['box.fbx', 'boxWithCompressedCTypeArray.FBX', 'cubes_with_names.fbx', 'huesitos.fbx', 'embedded_float_uv.fbx']) {
      const file = path.join(CORPUS, f);
      if (!fs.existsSync(file)) continue;
      const size = fs.statSync(file).size;
      const cuts = new Set([0, 10, 27, 40, 100, size - 1]);
      for (let i = 1; i <= 10; i++) cuts.add(Math.floor(size * i / 11));
      const res = await new Promise((resolve) => {
        const w = new Worker(fileURLToPath(import.meta.url), { workerData: { fbxFuzz: true, APP, file, cuts: [...cuts].filter((c) => c >= 0).sort((x, y) => x - y), flips: 40, seed: size } });
        const timer = setTimeout(() => { w.terminate(); resolve({ hang: true }); }, 180000);
        w.once('message', (m) => { clearTimeout(timer); w.terminate(); resolve(m); });
        w.once('error', (e) => { clearTimeout(timer); resolve([{ tag: 'worker', bad: e.message }]); });
      });
      if (res.hang) { ok(false, 'fuzz ' + f, 'no answer within 180 s'); continue; }
      const bad = res.filter((x) => x.bad);
      const counts = {};
      for (const x of res) { const k = x.ok || 'BAD'; counts[k] = (counts[k] || 0) + 1; }
      ok(!bad.length, 'fuzz ' + f + ' (' + Object.entries(counts).map(([k, n]) => n + ' ' + k).join(', ') + ')', bad.slice(0, 2).map((x) => x.tag + ' ' + x.bad).join(' || '));
    }
  }
}

/** An uncompressed true-colour TGA, w × h of one colour [r, g, b, a]. */
function tga(w, h, [r, g, b, a]) {
  const out = new Uint8Array(18 + w * h * 4);
  out[2] = 2; out[12] = w; out[14] = h; out[16] = 32; out[17] = 8;
  for (let i = 0; i < w * h; i++) out.set([b, g, r, a], 18 + i * 4);
  return out;
}

if (isMainThread && process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
  let pass = 0;
  let fail = 0;
  const ok = (c, what, d) => { if (c) pass++; else { fail++; console.log('  FAIL ' + what + (d ? ' — ' + d : '')); } };
  const close = (x, y, eps = 1e-9) => Math.abs(x - y) <= eps;
  await run({ ok, close, section: (s) => console.log(s), APP });
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
