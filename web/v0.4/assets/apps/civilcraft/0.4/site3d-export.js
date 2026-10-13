/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d-export.js — the visible 3D site scene (site3d.js) as GLB (glTF 2.0 binary) and OBJ. No DOM.
 *
 *   exportGLB(scene, { name }) → Uint8Array      exportOBJ(scene, { name }) → string
 *
 * Both are written at true scale (the vertical exaggeration is taken back out), in METERS (US survey feet →
 * 1200/3937 m), Y up (Z-up project space turned: x → x, z → y, y → −z, the usual glTF/OBJ convention), around the
 * scene's local origin so the numbers stay small and precise in Float32. The origin (project easting, northing,
 * elevation and units) is recorded: in the GLB as `extras` on the scene and the root node, in the OBJ as comments.
 * Surfaces, pipes and structures are triangle meshes with normals and vertex colours; contours, breaklines,
 * alignments, ticks, corridor and pad lines are line primitives (GLB) / `l` records (OBJ); survey points are a
 * POINTS primitive (GLB) / `p` records (OBJ).
 */

import { t } from "./i18n.js";
import { rgb } from './site3d.js';

export const METERS_PER = { ft: 1200 / 3937, m: 1 };

/** Positions → meters, Y up, exaggeration undone. Normals turned the same way (and re-normalized). */
function convert(scene, P, N) {
  const k = METERS_PER[scene.units] || 1, e = scene.exag || 1;
  const out = new Float32Array(P.length);
  for (let i = 0; i < P.length; i += 3) { out[i] = P[i] * k; out[i + 1] = (P[i + 2] / e) * k; out[i + 2] = -P[i + 1] * k; }
  let nOut = null;
  if (N) {
    nOut = new Float32Array(N.length);
    for (let i = 0; i < N.length; i += 3) {
      const x = N[i], y = N[i + 1], z = N[i + 2] * e, l = Math.hypot(x, y, z) || 1;
      nOut[i] = x / l; nOut[i + 1] = z / l; nOut[i + 2] = -y / l;
    }
  }
  return { P: out, N: nOut };
}

function originExtras(scene) {
  // i18n-ignore: glTF extras (file metadata other programs read)
  return { generator: 'CivilCraft', units: scene.units === 'm' ? 'meters' : 'US survey feet', origin: { easting: scene.origin.x, northing: scene.origin.y, elevation: scene.origin.z },
    note: 'Coordinates are meters, Y up, relative to the origin (project easting, northing, elevation in the project units); true scale.' };   // i18n-ignore: glTF extras
}

export function exportGLB(scene, { name = 'Site' } = {}) {
  const chunks = [];
  let offset = 0;
  const bufferViews = [], accessors = [], meshes = [], nodes = [], materials = [];
  const view = (arr, target) => {
    const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
    const pad = (4 - (bytes.length % 4)) % 4;
    chunks.push(bytes); if (pad) chunks.push(new Uint8Array(pad));
    bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length, ...(target ? { target } : {}) });
    offset += bytes.length + pad;
    return bufferViews.length - 1;
  };
  const acc = (arr, type, componentType, target, minmax) => {
    const n = type === 'VEC3' ? 3 : 1;
    const a = { bufferView: view(arr, target), componentType, count: arr.length / n, type };
    if (minmax) {
      const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
      for (let i = 0; i < arr.length; i += 3) for (let k = 0; k < 3; k++) { if (arr[i + k] < min[k]) min[k] = arr[i + k]; if (arr[i + k] > max[k]) max[k] = arr[i + k]; }
      a.min = min.map(Math.fround); a.max = max.map(Math.fround);
    }
    accessors.push(a);
    return accessors.length - 1;
  };
  const material = (nm, color, opts = {}) => {
    const c = color ? rgb(color) : [1, 1, 1];
    // glTF base colours are linear; the page colours are sRGB
    const lin = c.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    materials.push({ name: nm, pbrMetallicRoughness: { baseColorFactor: [...lin, 1], metallicFactor: 0, roughnessFactor: 1 }, ...(opts.doubleSided ? { doubleSided: true } : {}) });
    return materials.length - 1;
  };
  const ARRAY = 34962, ELEMENT = 34963, FLOAT = 5126, UINT = 5125;
  const children = [];
  for (const m of scene.meshes) {
    if (!m.indices.length) continue;
    const { P, N } = convert(scene, m.positions, m.normals);
    // the colours are sRGB in the scene; COLOR_0 is linear
    const C = new Float32Array(m.colors.length);
    for (let i = 0; i < C.length; i++) { const v = m.colors[i]; C[i] = v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }
    const attributes = { POSITION: acc(P, 'VEC3', FLOAT, ARRAY, true), NORMAL: acc(N, 'VEC3', FLOAT, ARRAY), COLOR_0: acc(C, 'VEC3', FLOAT, ARRAY) };
    const indices = acc(m.indices, 'SCALAR', UINT, ELEMENT);
    meshes.push({ name: m.name, primitives: [{ attributes, indices, material: material(m.name, null, { doubleSided: true }), mode: 4 }] });
    nodes.push({ name: m.name, mesh: meshes.length - 1 });
    children.push(nodes.length - 1);
  }
  for (const l of scene.lines) {
    if (!l.positions.length) continue;
    const { P } = convert(scene, l.positions, null);
    meshes.push({ name: l.name, primitives: [{ attributes: { POSITION: acc(P, 'VEC3', FLOAT, ARRAY, true) }, material: material(l.name, l.color), mode: 1 }] });
    nodes.push({ name: l.name, mesh: meshes.length - 1 });
    children.push(nodes.length - 1);
  }
  if (scene.points?.positions.length) {
    const { P } = convert(scene, scene.points.positions, null);
    const ptsName = t('scene.layer.node');
    meshes.push({ name: ptsName, primitives: [{ attributes: { POSITION: acc(P, 'VEC3', FLOAT, ARRAY, true) }, material: material(ptsName, scene.points.color), mode: 0 }] });
    nodes.push({ name: ptsName, mesh: meshes.length - 1 });
    children.push(nodes.length - 1);
  }
  nodes.push({ name, ...(children.length ? { children } : {}), extras: originExtras(scene) });
  const json = {
    asset: { version: '2.0', generator: 'CivilCraft' },
    scene: 0, scenes: [{ name, nodes: [nodes.length - 1], extras: originExtras(scene) }],
    nodes, meshes, materials, accessors, bufferViews, buffers: [{ byteLength: offset }],
  };
  if (!meshes.length) { delete json.meshes; delete json.materials; delete json.accessors; delete json.bufferViews; delete json.buffers; }
  let jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jpad = (4 - (jsonBytes.length % 4)) % 4;
  const total = 12 + 8 + jsonBytes.length + jpad + (offset ? 8 + offset : 0);
  const out = new Uint8Array(total), dv = new DataView(out.buffer);
  dv.setUint32(0, 0x46546c67, true); dv.setUint32(4, 2, true); dv.setUint32(8, total, true);
  dv.setUint32(12, jsonBytes.length + jpad, true); dv.setUint32(16, 0x4e4f534a, true);
  out.set(jsonBytes, 20); out.fill(0x20, 20 + jsonBytes.length, 20 + jsonBytes.length + jpad);
  if (offset) {
    let p = 20 + jsonBytes.length + jpad;
    dv.setUint32(p, offset, true); dv.setUint32(p + 4, 0x004e4942, true); p += 8;
    for (const c of chunks) { out.set(c, p); p += c.length; }
  }
  return out;
}

export function exportOBJ(scene, { name = 'Site' } = {}) {
  const o = scene.origin;
  const f = (v) => { const s = v.toFixed(4); return s === '-0.0000' ? '0.0000' : s; };
  const lines = [
    '# CivilCraft site — ' + String(name).replace(/[\r\n]+/g, ' '),
    // i18n-ignore: OBJ header comments (file content)
    '# Meters, Y up, true scale, relative to the origin below (Z-up project coordinates, ' + (scene.units === 'm' ? 'meters' : 'US survey feet') + ')',
    `# origin easting ${o.x} northing ${o.y} elevation ${o.z}`,
  ];
  let base = 1, nBase = 1;
  for (const m of scene.meshes) {
    if (!m.indices.length) continue;
    const { P, N } = convert(scene, m.positions, m.normals);
    lines.push('o ' + m.name.replace(/\s+/g, '_'));
    for (let i = 0; i < P.length; i += 3) lines.push(`v ${f(P[i])} ${f(P[i + 1])} ${f(P[i + 2])}`);
    for (let i = 0; i < N.length; i += 3) lines.push(`vn ${N[i].toFixed(5)} ${N[i + 1].toFixed(5)} ${N[i + 2].toFixed(5)}`);   // i18n-ignore: OBJ records
    const I = m.indices;
    for (let t = 0; t < I.length; t += 3) { const a = I[t] + base, b = I[t + 1] + base, c = I[t + 2] + base, na = I[t] + nBase, nb = I[t + 1] + nBase, nc = I[t + 2] + nBase; lines.push(`f ${a}//${na} ${b}//${nb} ${c}//${nc}`); }
    base += P.length / 3; nBase += N.length / 3;
  }
  for (const l of scene.lines) {
    if (!l.positions.length) continue;
    const { P } = convert(scene, l.positions, null);
    lines.push('o ' + l.name.replace(/\s+/g, '_'));
    for (let i = 0; i < P.length; i += 3) lines.push(`v ${f(P[i])} ${f(P[i + 1])} ${f(P[i + 2])}`);
    for (let i = 0; i < P.length / 3; i += 2) lines.push(`l ${base + i} ${base + i + 1}`);
    base += P.length / 3;
  }
  if (scene.points?.positions.length) {
    const { P } = convert(scene, scene.points.positions, null);
    lines.push('o ' + t('scene.layer.node').replace(/\s+/g, '_'));
    for (let i = 0; i < P.length; i += 3) lines.push(`v ${f(P[i])} ${f(P[i + 1])} ${f(P[i + 2])}`);
    for (let i = 0; i < P.length / 3; i++) lines.push(`p ${base + i}`);
    base += P.length / 3;
  }
  return lines.join('\n') + '\n';
}
