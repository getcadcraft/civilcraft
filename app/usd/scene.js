/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scene.js — a composed stage (stage.js) as a plain scene an app can import: a tree of groups and meshes in metres,
 * Z up, with instanced prims sharing one prototype, PointInstancers expanded to placements, materials as OpenPBR
 * parameters (read from an OpenPBR or MaterialX standard-surface shader, else converted from UsdPreviewSurface), lamps
 * and cameras. What the scene keeps of each prim's own data: its `ifc:*` and `cadcraft:*` attributes, plain. DOM-free.
 *
 *   sceneOf(stage, { time, purposes = ['default', 'render'] }) → {
 *     root: Node, protos: Map<key, Node>, materials: Map<path, Material>, lights: [Light], cameras: [Cam], notes, frame }
 *   Node { path, name, displayName, type, kind, matrix (local, 16, column-major), visible, children: [Node],
 *          mesh: Mesh | null, proto: key | null, data: {name: plain value}, material: path | null }
 *   Mesh  meshOf()'s shape + faceMaterials: Int32Array (index into mesh.materials) | null, materials: [path]
 *   Material { path, name, openpbr: {OpenPBR names}, texture: asset path | null, from: 'openpbr' | 'standard_surface' | 'preview' }
 *   Light { path, name, kind: 'point' | 'spot' | 'area' | 'distant' | 'dome', matrix (world, metres), color (linear), intensity,
 *           exposure, radius, width, height, angle, on, data }
 *   Cam   { path, name, matrix (world), persp, fov (vertical degrees), height }
 */
import { meshOf, worldMatrix, localMatrix, stageFrame, mul, valueAt, visibleOf, purposeOf, quatMatrix } from './geom.js';

const LIGHTS = { SphereLight: 'point', RectLight: 'area', DiskLight: 'area', DistantLight: 'distant', DomeLight: 'dome', CylinderLight: 'area' };
const GEOM = new Set(['Mesh', 'Cube', 'Sphere', 'Cylinder', 'Cone', 'Capsule', 'Plane']);

export function sceneOf(stage, { time, purposes = ['default', 'render'] } = {}) {
  const frame = stageFrame(stage);
  const materials = new Map();
  const protos = new Map();
  const lights = [], cameras = [];
  const notes = [];
  const val = (prim, name) => valueAt(prim.props.get(name), time);
  const keep = (prim) => prim.defined && prim.active && purposes.includes(purposeOf(prim));

  const materialAt = (path) => (!path ? null : materials.has(path) ? path : readMaterial(stage, path, materials, time));
  const bindingOf = (prim) => {
    for (let p = prim; p && p.path !== '/'; p = p.parent) {
      const rel = p.props.get('material:binding');
      if (rel && rel.targets.length) return materialAt(rel.targets[0]);
    }
    return null;
  };

  const build = (prim, inProto) => {
    if (!keep(prim) || prim.typeName === 'Scope' && prim.name === 'Looks' && !prim.children.some((c) => c.typeName !== 'Material')) return null;
    if (prim.typeName === 'Material' || prim.typeName === 'Shader' || prim.typeName === 'NodeGraph' || prim.typeName === 'GeomSubset') return null;
    const node = {
      path: prim.path, name: prim.name, displayName: prim.meta.get('displayName')?.v || prim.name, type: prim.typeName,
      kind: prim.meta.get('kind')?.v || '', matrix: localMatrix(prim, time).m, reset: localMatrix(prim, time).reset,
      visible: visibleOf(prim, time), children: [], mesh: null, proto: null, data: dataOf(prim, time), material: null,
    };
    if (LIGHTS[prim.typeName]) { lights.push(lightOf(prim, time, mul(frame, worldMatrix(prim, time)), node.data)); return null; }
    if (prim.typeName === 'Camera') { cameras.push(cameraOf(prim, time, mul(frame, worldMatrix(prim, time)), stage.meta.metersPerUnit)); return null; }
    if (prim.instanceKey && !inProto) {
      // the first instance builds the prototype from its children; every instance points at it
      if (!protos.has(prim.instanceKey)) {
        const proto = { ...node, path: prim.instanceKey, matrix: IDENT(), children: [] };
        protos.set(prim.instanceKey, proto);
        for (const c of prim.children) { const k = build(c, true); if (k) proto.children.push(k); }
        if (GEOM.has(prim.typeName)) proto.mesh = meshWithMaterials(prim, time, bindingOf, materialAt);
      }
      node.proto = prim.instanceKey;
      return node;
    }
    if (GEOM.has(prim.typeName)) {
      node.mesh = meshWithMaterials(prim, time, bindingOf, materialAt);
      if (!node.mesh) notes.push('mesh ' + prim.path);
    }
    if (prim.typeName === 'PointInstancer') { pointInstances(prim, node, time, build, protos); return node; }
    for (const c of prim.children) { const k = build(c, inProto); if (k) node.children.push(k); }
    return node;
  };

  const root = { path: '/', name: '', displayName: '', type: '', kind: '', matrix: frame, visible: true, children: [], mesh: null, proto: null, data: {}, material: null };
  for (const c of stage.root.children) { const n = build(c, false); if (n) root.children.push(n); }
  return { root, protos, materials, lights, cameras, notes: [...stage.notes, ...notes], frame };
}

const IDENT = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

function meshWithMaterials(prim, time, bindingOf, materialAt) {
  const m = meshOf(prim, time);
  if (!m) return null;
  m.materials = [];
  const whole = bindingOf(prim);
  const subsets = prim.children.filter((c) => c.typeName === 'GeomSubset' && valueAt(c.props.get('familyName'))?.v === 'materialBind');
  if (subsets.length) {
    const fm = new Int32Array(m.counts.length).fill(-1);
    if (whole) { m.materials.push(whole); fm.fill(0); }
    for (const s of subsets) {
      const rel = s.props.get('material:binding');
      const mat = rel && rel.targets.length ? materialAt(rel.targets[0]) : null;
      if (!mat) continue;
      let k = m.materials.indexOf(mat);
      if (k < 0) { k = m.materials.length; m.materials.push(mat); }
      for (const f of valueAt(s.props.get('indices'), time)?.v || []) if (f >= 0 && f < fm.length) fm[f] = k;
    }
    m.faceMaterials = fm;
  } else if (whole) { m.materials.push(whole); m.faceMaterials = null; }
  return m;
}

/** Custom attributes in the `ifc:` and `cadcraft:` namespaces as plain values. */
function dataOf(prim, time) {
  const out = {};
  for (const [n, p] of prim.props) {
    if (p.kind !== 'attribute' || !(n.startsWith('ifc:') || n.startsWith('cadcraft:'))) continue;
    const v = valueAt(p, time);
    if (!v) continue;
    out[n] = ArrayBuffer.isView(v.v) ? Array.from(v.v, (x) => (typeof x === 'bigint' ? Number(x) : x)) : v.v;
  }
  return out;
}

function pointInstances(prim, node, time, build, protos) {
  const rel = prim.props.get('prototypes');
  const targets = rel ? rel.targets : [];
  const idx = valueAt(prim.props.get('protoIndices'), time)?.v || [];
  const pos = valueAt(prim.props.get('positions'), time)?.v || [];
  const ori = valueAt(prim.props.get('orientations'), time)?.v || valueAt(prim.props.get('orientationsf'), time)?.v || null;
  const sc = valueAt(prim.props.get('scales'), time)?.v || null;
  const keys = targets.map((t) => {
    const key = 'pi|' + t;
    if (!protos.has(key)) {
      const p = findPrim(prim, t);
      const proto = { path: key, name: p ? p.name : 'Prototype', displayName: p ? p.name : 'Prototype', type: 'Xform', kind: '', matrix: IDENT(), visible: true, children: [], mesh: null, proto: null, data: {}, material: null };
      if (p) { const k = build(p, true); if (k) { k.matrix = IDENT(); proto.children.push(k); } }
      protos.set(key, proto);
    }
    return key;
  });
  for (let i = 0; i < idx.length; i++) {
    const k = keys[idx[i]];
    if (!k || pos.length < (i + 1) * 3) continue;
    let m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2], 1];
    if (ori && ori.length >= (i + 1) * 4) { const r = quatMatrix([ori[i * 4], ori[i * 4 + 1], ori[i * 4 + 2], ori[i * 4 + 3]]); r[12] = pos[i * 3]; r[13] = pos[i * 3 + 1]; r[14] = pos[i * 3 + 2]; m = r; }
    if (sc && sc.length >= (i + 1) * 3) m = mul(m, [sc[i * 3], 0, 0, 0, 0, sc[i * 3 + 1], 0, 0, 0, 0, sc[i * 3 + 2], 0, 0, 0, 0, 1]);
    node.children.push({ path: prim.path + '#' + i, name: 'instance_' + i, displayName: 'instance ' + i, type: 'Xform', kind: '', matrix: m, visible: true, children: [], mesh: null, proto: k, data: {}, material: null });
  }
}
function findPrim(from, path) {
  let r = from;
  while (r.parent) r = r.parent;
  const walk = (p) => { if (p.path === path) return p; for (const c of p.children) { const f = walk(c); if (f) return f; } return null; };
  return walk(r);
}

// ---------------------------------------------------------------- materials

const PREVIEW_TO_PBR = {
  diffuseColor: 'base_color', metallic: 'base_metalness', roughness: 'specular_roughness', ior: 'specular_ior',
  opacity: 'geometry_opacity', clearcoat: 'coat_weight', clearcoatRoughness: 'coat_roughness', emissiveColor: 'emission_color',
};
const STD_TO_PBR = {
  base: 'base_weight', base_color: 'base_color', metalness: 'base_metalness', specular: 'specular_weight', specular_color: 'specular_color',
  specular_roughness: 'specular_roughness', specular_IOR: 'specular_ior', transmission: 'transmission_weight', transmission_color: 'transmission_color',
  coat: 'coat_weight', coat_roughness: 'coat_roughness', coat_IOR: 'coat_ior', sheen: 'fuzz_weight', sheen_color: 'fuzz_color',
  emission: 'emission_luminance', emission_color: 'emission_color', thin_walled: 'geometry_thin_walled', subsurface: 'subsurface_weight',
  subsurface_color: 'subsurface_color', thin_film_thickness: 'thin_film_thickness', thin_film_IOR: 'thin_film_ior',
};
function readMaterial(stage, path, materials, time) {
  const m = stage.prim(path);
  if (!m) return null;
  const rec = { path, name: m.meta.get('displayName')?.v || m.name, openpbr: {}, texture: null, from: null };
  materials.set(path, rec);
  const shaderAt = (conn) => { if (!conn) return null; const p = conn.slice(0, conn.lastIndexOf('.')); return stage.prim(p); };
  const inputs = (sh) => {
    const out = {};
    for (const [n, p] of sh.props) {
      if (!n.startsWith('inputs:')) continue;
      const k = n.slice(7);
      if (p.connections.length) { out[k] = { conn: p.connections[0] }; continue; }
      const v = valueAt(p, time);
      if (v) out[k] = ArrayBuffer.isView(v.v) ? Array.from(v.v) : v.v;
    }
    return out;
  };
  const idOf = (sh) => valueAt(sh.props.get('info:id'))?.v || '';
  const mx = m.props.get('outputs:mtlx:surface'), pv = m.props.get('outputs:surface');
  const mxSh = shaderAt(mx && mx.connections[0]);
  if (mxSh && /open_pbr_surface/.test(idOf(mxSh))) {
    rec.from = 'openpbr';
    for (const [k, v] of Object.entries(inputs(mxSh))) if (!v || !v.conn) rec.openpbr[k] = v;
  } else if (mxSh && /standard_surface/.test(idOf(mxSh))) {
    rec.from = 'standard_surface';
    for (const [k, v] of Object.entries(inputs(mxSh))) if (STD_TO_PBR[k] && !(v && v.conn)) rec.openpbr[STD_TO_PBR[k]] = v;
  }
  const pvSh = shaderAt(pv && pv.connections[0]);
  if (pvSh && idOf(pvSh) === 'UsdPreviewSurface') {
    const ins = inputs(pvSh);
    if (!rec.from) {
      rec.from = 'preview';
      for (const [k, v] of Object.entries(ins)) if (PREVIEW_TO_PBR[k] && !(v && v.conn)) rec.openpbr[PREVIEW_TO_PBR[k]] = v;
      if (rec.openpbr.emission_color && rec.openpbr.emission_color.some((x) => x > 0)) rec.openpbr.emission_luminance = 1;
      if (ins.useSpecularWorkflow === 1 && Array.isArray(ins.specularColor)) rec.openpbr.specular_color = ins.specularColor;
    }
    const dc = ins.diffuseColor;
    if (dc && dc.conn) {
      const tex = shaderAt(dc.conn);
      if (tex && idOf(tex) === 'UsdUVTexture') { const f = valueAt(tex.props.get('inputs:file')); if (f) rec.texture = f.v; }
    }
  }
  return path;
}

// ---------------------------------------------------------------- lamps and cameras

function lightOf(prim, time, W, data) {
  const g = (n, d) => { const v = valueAt(prim.props.get('inputs:' + n), time) || valueAt(prim.props.get(n), time); return v ? (ArrayBuffer.isView(v.v) ? Array.from(v.v) : v.v) : d; };
  const api = prim.meta.get('apiSchemas')?.v || [];
  let kind = LIGHTS[prim.typeName];
  if (kind === 'point' && (api.includes('ShapingAPI') || prim.props.has('inputs:shaping:cone:angle'))) kind = 'spot';
  return {
    path: prim.path, name: prim.meta.get('displayName')?.v || prim.name, kind, matrix: W, color: g('color', [1, 1, 1]),
    intensity: g('intensity', 1), exposure: g('exposure', 0), radius: g('radius', 0.5), width: g('width', 1), height: g('height', 1),
    angle: g('shaping:cone:angle', 90) * 2, on: visibleOf(prim, time), data,
  };
}
function cameraOf(prim, time, W, mpu) {
  const g = (n, d) => { const v = valueAt(prim.props.get(n), time); return v ? v.v : d; };
  const persp = g('projection', 'perspective') !== 'orthographic';
  const va = g('verticalAperture', 15.2908), fl = g('focalLength', 50);
  return {
    path: prim.path, name: prim.meta.get('displayName')?.v || prim.name, matrix: W, persp,
    fov: (2 * Math.atan(va / 2 / fl) * 180) / Math.PI, height: (va / 10) * (mpu > 0 ? mpu : 0.01),
  };
}
