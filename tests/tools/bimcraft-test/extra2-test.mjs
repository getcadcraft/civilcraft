/* SPDX-License-Identifier: Apache-2.0 */
/**
 * extra2-test.mjs — BimCraft round-2 extras (0.6, session `bim-extra_PART_2`), DOM-free, run by
 *   node bin/test-bimcraft.mjs --extra2 [--only glb,assets,daylight]
 *   glb       DC.22 Model for rendering (.glb): glb-bim.js + png.js, checked by the Khronos glTF validator (test-only oracle in
 *             tools/modelcraft-test/node_modules) and read back
 *   assets    LC.12 asset data and the maintenance record kept in the IFC (assets-bim.js)
 *   daylight  LC.20 average daylight factor per room (daylight-bim.js), known answers
 * Saved IFCs are checked by IfcOpenShell at the end when its venv is here (tools/bimcraft-test/ifc_validate.py).
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';

export async function extra2Mode({ APP, ROOT, WebIFC, IfcModel, quiet, args = [] }) {
  const only = (() => { const i = args.indexOf('--only'); return i >= 0 ? new Set(String(args[i + 1] || '').split(',')) : null; })();
  const want = (k) => !only || only.has(k);
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
  const saved = {};
  const ctx = { APP, ROOT, WebIFC, IfcModel, quiet, ok, near, saved };

  if (want('glb')) await glbPart(ctx);
  if (want('assets')) await (await import('./extra2-assets.mjs')).assetsPart(ctx);
  if (want('daylight')) await (await import('./extra2-daylight.mjs')).daylightPart(ctx);

  // IfcOpenShell on every IFC saved above (skipped without its venv)
  const py = [path.join(ROOT, 'tools/detailcraft-test/venv/bin/python'), path.join(ROOT, 'tools/bimcraft-test/venv/bin/python')].find((p) => fs.existsSync(p));
  if (Object.keys(saved).length && py) {
    const { execFileSync } = await import('node:child_process');
    const dir = fs.mkdtempSync(path.join(ROOT, 'tmp', 'extra2-'));
    for (const [name, bytes] of Object.entries(saved)) {
      const f = path.join(dir, name + '.ifc');
      fs.writeFileSync(f, bytes);
      let out = '';
      try { out = execFileSync(py, ['-I', path.join(ROOT, 'tools/bimcraft-test/ifc_validate.py'), f], { encoding: 'utf8' }); } catch (e) { out = String(e.stdout || e.message); }
      let r = null;
      try { r = JSON.parse(out.trim().split('\n').pop()); } catch { r = null; }
      ok(r && r.errors === 0, 'IfcOpenShell: ' + name + ' (' + (r?.schema || '?') + ') validates, 0 errors', r ? r.first.join(' | ') : out.slice(0, 300));
    }
    fs.rmSync(dir, { recursive: true, force: true });
  } else if (Object.keys(saved).length) console.log('  --   no venv with ifcopenshell: schema validation skipped');

  console.log(`\nextra2: ${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}

// ================================================================================ DC.22 .glb for rendering programs
async function glbPart({ APP, ROOT, ok, near }) {
  console.log('== DC.22 Model for rendering (.glb)');
  const { encodePng, crc32 } = await import(path.join(APP, 'png.js'));
  const G = await import(path.join(APP, 'glb-bim.js'));
  const { MATERIALS, material } = await import(path.join(APP, 'render/materials.js'));

  // ---- png.js: a 3 × 2 picture read back by Node's own zlib
  ok(crc32(new TextEncoder().encode('123456789')) === 0xcbf43926, 'crc32 of "123456789" = CBF43926 (the check value of the PNG / zip CRC)');
  const px = new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]);
  const png = await encodePng(px, 3, 2);
  const sig = [...png.subarray(0, 8)].join(), dv = new DataView(png.buffer);
  ok(sig === '137,80,78,71,13,10,26,10' && dv.getUint32(16) === 3 && dv.getUint32(20) === 2 && png[24] === 8 && png[25] === 6, 'PNG: signature, IHDR 3 × 2, 8-bit RGBA');
  let o = 8; const chunks = [];
  while (o < png.length) { const n = dv.getUint32(o), type = new TextDecoder().decode(png.subarray(o + 4, o + 8)); chunks.push({ type, data: png.subarray(o + 8, o + 8 + n), crc: dv.getUint32(o + 8 + n), all: png.subarray(o + 4, o + 8 + n) }); o += 12 + n; }
  ok(chunks.map((c) => c.type).join() === 'IHDR,IDAT,IEND' && chunks.every((c) => crc32(c.all) === c.crc), 'PNG: IHDR, IDAT, IEND, every chunk CRC right');
  const raw = zlib.inflateSync(Buffer.from(chunks[1].data));
  const back = []; for (let y = 0; y < 2; y++) { ok(raw[y * 13] === 0, 'PNG row ' + y + ': filter 0'); back.push(...raw.subarray(y * 13 + 1, y * 13 + 13)); }
  ok(back.join() === [...px].join(), 'PNG: the pixels come back exactly (Node zlib inflates our IDAT)');

  // ---- a scene shaped like bimScene's: duck-typed geometries
  const geo = (pos, nor, idx, { uv = null, count = Infinity } = {}) => ({
    getAttribute: (n) => (n === 'position' ? { array: Float32Array.from(pos) } : n === 'normal' ? { array: Float32Array.from(nor) } : n === 'uv' && uv ? { array: Float32Array.from(uv) } : undefined),
    index: idx ? { array: Uint32Array.from(idx) } : null,
    drawRange: { start: 0, count },
  });
  // a 4 × 3 m wall face (two triangles) + two triangles of a hidden element after the solid part (drawRange 6)
  const wall = geo([0, 0, 0, 4, 0, 0, 4, 3, 0, 0, 3, 0, 9, 9, 9, 9, 8, 9, 8, 9, 9], [0, 0, 2, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0], [0, 1, 2, 0, 2, 3, 4, 5, 6], { count: 6, uv: [0, 0, 4, 0, 4, 3, 0, 3, 0, 0, 0, 0, 0, 0] });
  const pane = geo([0, 0, 0.1, 1, 0, 0.1, 1, 1, 0.1], [0, 0, 1, 0, 0, 1, 0, 0, 1], [0, 1, 2]);
  const floor = geo([0, 0, 0, 4, 0, 0, 4, 0, -3], [0, 1, 0, 0, 1, 0, 0, 0, 0], [0, 1, 2]);
  const M = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 0, -5, 1];
  const scene = {
    items: [
      { geometry: wall, matrix: M, look: 'mat:brick-red', mi: 0, storey: 7 },
      { geometry: pane, matrix: M, look: '#c9dbe6', mi: 0, storey: 7 },
      { geometry: floor, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], look: '#aeaaa3', mi: 0, storey: 8 },
      { geometry: pane, matrix: M, lines: true },
    ],
    looks: { '#c9dbe6': 'glass' }, defaultColor: '#e6e3dc',
  };
  const lamps = [
    { key: 1, name: 'Pendant', kind: 'spot', lumens: 1257, color: '#ffffff', angle: 60, p: [1, 2.5, -1], dir: [0, -1, 0], on: true },
    { key: 2, name: 'Wall light', kind: 'point', lumens: 400, color: '#ffe7c4', angle: 60, p: [2, 2, -1], dir: [0, -1, 0], on: true },
    { key: 3, name: 'Off', kind: 'point', lumens: 800, p: [0, 0, 0], on: false },
  ];
  const names = { storey: (mi, s) => (s === 7 ? 'Level 1' : s === 8 ? 'Level 2' : ''), material: (id) => 'Lib ' + id, colour: (hex, look) => hex + ' (' + look + ')' };
  const { bytes, stats } = await G.sceneGlb(scene, { settings: { looks: { '#aeaaa3': 'satin' } }, lamps, site: { lat: 51.5, lon: -0.12, north: [0, 1] }, names });
  const J = G.readGlbJson(bytes);
  const hv = new DataView(bytes.buffer, bytes.byteOffset);
  ok(hv.getUint32(0, true) === 0x46546c67 && hv.getUint32(4, true) === 2 && hv.getUint32(8, true) === bytes.length && bytes.length % 4 === 0, 'GLB header: glTF, version 2, length = the file, 4-byte aligned');
  ok(stats.triangles === 4 && stats.materials === 3 && stats.textures === 1 && stats.lights === 2, 'stats: 4 triangles (the hidden element\'s and the edges left out), 3 materials, 1 texture, 2 lamps (the one off left out)', JSON.stringify(stats));
  const nodeNames = J.nodes.map((n) => n.name);
  ok(nodeNames.includes('Level 1 — Lib brick-red') && nodeNames.includes('Level 2 — #aeaaa3') && nodeNames.includes('Pendant'), 'node names: storey — material, lamps by name', nodeNames.join(' | '));
  const wallNode = J.nodes.find((n) => n.name === 'Level 1 — Lib brick-red');
  ok(wallNode.matrix && wallNode.matrix[12] === 10 && wallNode.matrix[14] === -5, 'a batch\'s world matrix is on its node');
  ok(!J.nodes.find((n) => n.name === 'Level 2 — #aeaaa3').matrix, 'an identity matrix is left out');
  const prim = J.meshes[wallNode.mesh].primitives[0];
  const acc = J.accessors[prim.attributes.POSITION];
  ok(acc.count === 4 && acc.min.join() === '0,0,0' && acc.max.join() === '4,3,0', 'the wall keeps only its 4 used corners (the hidden element\'s vertices dropped); POSITION min / max', JSON.stringify(acc));
  const brick = material('brick-red'), wm = J.materials[prim.material];
  ok(wm.name === 'Lib brick-red' && wm.pbrMetallicRoughness.baseColorTexture?.index === 0 && near(wm.pbrMetallicRoughness.roughnessFactor, brick.rough) && wm.pbrMetallicRoughness.metallicFactor === 0, 'library material: named, textured, its roughness and metalness');
  // UVs: planar metres ÷ the tile's real size (brick 0.9 × 0.6 m)
  const binStart = 20 + hv.getUint32(12, true) + 8;
  const read = (ai) => { const a = J.accessors[ai], v = J.bufferViews[a.bufferView]; return new Float32Array(bytes.buffer.slice(bytes.byteOffset + binStart + v.byteOffset, bytes.byteOffset + binStart + v.byteOffset + v.byteLength)); };
  const uv = read(prim.attributes.TEXCOORD_0);
  ok(near(uv[2], 4 / 0.9, 1e-5) && near(uv[5], 3 / 0.6, 1e-5), 'UVs in texture repeats: 4 m ÷ 0.9 m, 3 m ÷ 0.6 m', [...uv].join());
  const nr = read(prim.attributes.NORMAL);
  ok(near(Math.hypot(nr[0], nr[1], nr[2]), 1, 1e-6) && near(nr[2], 1), 'normals written unit length (a (0,0,2) normal comes out (0,0,1))');
  const img = J.images[0];
  ok(img.mimeType === 'image/png' && J.bufferViews[img.bufferView].target === undefined, 'the texture: an embedded PNG in a bufferView without a target');
  const glassM = J.materials.find((m) => m.alphaMode === 'BLEND');
  ok(glassM && glassM.extensions.KHR_materials_transmission.transmissionFactor === 0.82 && near(glassM.pbrMetallicRoughness.baseColorFactor[3], 0.18), 'a colour whose own look is glass: BLEND + KHR_materials_transmission 0.82');
  const satin = J.materials.find((m) => m.name === '#aeaaa3 (satin)');
  ok(satin && satin.pbrMetallicRoughness.roughnessFactor === 0.5 && near(satin.pbrMetallicRoughness.baseColorFactor[0], G.hexLinear('#aeaaa3')[0]), 'a colour\'s chosen look (satin) and its colour in linear light');
  const lights = J.extensions.KHR_lights_punctual.lights;
  ok(lights.length === 2 && lights[0].type === 'spot' && near(lights[0].intensity, 1257 / (4 * Math.PI), 1e-3) && near(lights[0].spot.outerConeAngle, Math.PI / 6, 1e-4), 'lamps: a spot of 1257 lm = 100 cd, beam 60° → outer cone 30°', JSON.stringify(lights[0]));
  const pend = J.nodes.find((n) => n.name === 'Pendant');
  const q = pend.rotation, rot = (v) => { const [x, y, z, w] = q, ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2]; return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x]; };
  const d = rot([0, 0, -1]);
  ok(near(d[0], 0, 1e-6) && near(d[1], -1, 1e-6) && near(d[2], 0, 1e-6) && pend.translation.join() === '1,2.5,-1', 'the spot\'s node turns −Z onto its direction (straight down) and sits at the lamp', d.join());
  ok(J.extensionsUsed.sort().join() === 'KHR_lights_punctual,KHR_materials_transmission' && !J.extensionsRequired, 'extensionsUsed lists both; nothing required (a reader without them still opens the file)');
  ok(J.scenes[0].extras.latitude === 51.5 && J.scenes[0].extras.longitude === -0.12, 'the site\'s latitude and longitude in the scene\'s extras');
  ok(G.quatFromMinusZ([0, 0, 1]).join() === '0,1,0,0', 'a light pointing back (+Z): half a turn about Y');

  // ---- every library material, one batch each: the validator again
  const all = { items: MATERIALS.map((m, i) => ({ geometry: wall, matrix: M, look: 'mat:' + m.id, mi: 0, storey: 7 + i })), looks: {} };
  const big = await G.sceneGlb(all, { names });
  ok(big.stats.materials === MATERIALS.length && big.stats.textures === MATERIALS.filter((m) => m.tex).length, 'all ' + MATERIALS.length + ' library materials, ' + big.stats.textures + ' textures (one per textured material)');
  const empty = await G.sceneGlb({ items: [] }, {});
  ok(G.readGlbJson(empty.bytes).asset.version === '2.0' && empty.stats.triangles === 0, 'an empty view: still a valid file, no buffers');

  // ---- the Khronos validator (test-only oracle)
  const vdir = path.join(ROOT, 'tools/modelcraft-test/node_modules/gltf-validator');
  if (fs.existsSync(vdir)) {
    const validator = createRequire(import.meta.url)(vdir);
    for (const [label, b] of [['the test scene', bytes], ['every library material', big.bytes], ['an empty view', empty.bytes]]) {
      const rep = await validator.validateBytes(new Uint8Array(b), { maxIssues: 50 });
      const errs = rep.issues.messages.filter((m) => m.severity === 0), warns = rep.issues.messages.filter((m) => m.severity === 1);
      ok(rep.issues.numErrors === 0 && !warns.length, 'Khronos glTF validator ' + rep.validatorVersion + ', ' + label + ': 0 errors, 0 warnings', [...errs, ...warns].map((m) => m.code + ' ' + m.pointer).join('; '));
    }
  } else console.log('  (gltf-validator not installed in tools/modelcraft-test: validator check skipped)');
}
