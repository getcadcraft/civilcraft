/* SPDX-License-Identifier: Apache-2.0 */
/**
 * build.js — writes a scene by docs/USD-CONVENTIONS.md: the helper every app's USD adapter uses (ModelCraft's save,
 * XF.8's exports), so they all name, nest and describe things the same way. DOM-free; builds an sdf.js Layer.
 *
 *   const b = new UsdBuilder({ app, appVersion, source, doc, metersPerUnit = 1, upAxis = 'Z', root = 'World', kind = 'assembly' })
 *   b.group(parent, name, opts) → path          Xform (opts: kind, displayName, matrix, visible, type, instanceable,
 *                                                references: [prim path], attrs: {name: [type, value, {custom, uniform}]})
 *   b.mesh(parent, name, geo, opts) → path       Mesh (geo: points flat, counts, indices, normals {values, interp},
 *                                                uvs [{name, values, interp, indices}], colors {values, interp}, holes,
 *                                                subdivision ('none'), creases, doubleSided; opts.material, opts.subsets)
 *   b.material(name, openpbr, {textures}) → path under /World/Looks (one per name): OpenPBR (MaterialX) + UsdPreviewSurface
 *   b.colorMaterial('#rrggbb') → path            a material with only base_color (sRGB hex → linear)
 *   b.lamp(parent, name, lamp) · b.sun(...) · b.camera(parent, name, cam)
 *   b.attr(path, name, typeName, value, opts)   any attribute (value: number / array / string / typed array)
 *   b.unique(parent, wanted) → a free identifier among the parent's children (displayName keeps the real name)
 *   b.layer · b.write('usda' | 'usdc') · b.usdz(files: [{name, bytes}])
 */
import { Layer, V, identifier, typeInfo } from './sdf.js';
import { writeUsda } from './usda-write.js';
import { writeUsdc } from './usdc-write.js';
import { writeUsdz } from './usdz.js';

export const OPENPBR_TYPES = {
  base_weight: 'float', base_color: 'color3f', base_diffuse_roughness: 'float', base_metalness: 'float',
  specular_weight: 'float', specular_color: 'color3f', specular_roughness: 'float', specular_roughness_anisotropy: 'float', specular_ior: 'float',
  transmission_weight: 'float', transmission_color: 'color3f', transmission_depth: 'float', transmission_scatter: 'color3f',
  transmission_scatter_anisotropy: 'float', transmission_dispersion_scale: 'float', transmission_dispersion_abbe_number: 'float',
  subsurface_weight: 'float', subsurface_color: 'color3f', subsurface_radius: 'float', subsurface_radius_scale: 'color3f', subsurface_scatter_anisotropy: 'float',
  coat_weight: 'float', coat_color: 'color3f', coat_roughness: 'float', coat_roughness_anisotropy: 'float', coat_ior: 'float', coat_darkening: 'float',
  fuzz_weight: 'float', fuzz_color: 'color3f', fuzz_roughness: 'float',
  thin_film_weight: 'float', thin_film_thickness: 'float', thin_film_ior: 'float',
  emission_luminance: 'float', emission_color: 'color3f', geometry_opacity: 'float', geometry_thin_walled: 'bool',
};
/** OpenPBR's own defaults (the specification's; the same as RN.2's OPENPBR_DEFAULTS). */
export const OPENPBR_DEFAULTS = Object.freeze({
  base_weight: 1, base_color: [0.8, 0.8, 0.8], base_diffuse_roughness: 0, base_metalness: 0,
  specular_weight: 1, specular_color: [1, 1, 1], specular_roughness: 0.3, specular_roughness_anisotropy: 0, specular_ior: 1.5,
  transmission_weight: 0, transmission_color: [1, 1, 1], transmission_depth: 0, transmission_scatter: [0, 0, 0],
  transmission_scatter_anisotropy: 0, transmission_dispersion_scale: 0, transmission_dispersion_abbe_number: 20,
  subsurface_weight: 0, subsurface_color: [0.8, 0.8, 0.8], subsurface_radius: 1, subsurface_radius_scale: [1, 0.5, 0.25], subsurface_scatter_anisotropy: 0,
  coat_weight: 0, coat_color: [1, 1, 1], coat_roughness: 0, coat_roughness_anisotropy: 0, coat_ior: 1.6, coat_darkening: 1,
  fuzz_weight: 0, fuzz_color: [1, 1, 1], fuzz_roughness: 0.5,
  thin_film_weight: 0, thin_film_thickness: 0.5, thin_film_ior: 1.4,
  emission_luminance: 0, emission_color: [1, 1, 1], geometry_opacity: 1, geometry_thin_walled: false,
});

/** sRGB '#rrggbb' → linear [r, g, b]. */
export function hexToLinear(hex) {
  const n = parseInt(String(hex).slice(1, 7), 16);
  const c = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return [c((n >> 16) & 255), c((n >> 8) & 255), c(n & 255)];
}
export function linearToHex(rgb) {
  const c = (v) => { v = Math.min(1, Math.max(0, v)); v = v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055; return Math.round(v * 255).toString(16).padStart(2, '0'); };
  return '#' + c(rgb[0]) + c(rgb[1]) + c(rgb[2]);
}

/** A JS value as a Value of the attribute type (role names allowed: 'point3f[]', 'color3f'). */
export function valueOf(typeName, x) {
  const info = typeInfo(typeName);
  if (!info) throw new Error('unknown type ' + typeName);   // i18n-ignore: programmer error
  const { base, array, def } = info;
  if (!array) return V(base, def.n > 1 ? Array.from(x) : x);
  if (def.k === 'f32' || def.k === 'f16') return V(base + '[]', x instanceof Float32Array ? x : Float32Array.from(x));
  if (def.k === 'f64') return V(base + '[]', x instanceof Float64Array ? x : Float64Array.from(x));
  if (def.k === 'i32') return V(base + '[]', x instanceof Int32Array ? x : Int32Array.from(x));
  return V(base + '[]', Array.from(x));
}

export class UsdBuilder {
  constructor({ app = 'CadCraft', appVersion = '', source = '', doc = '', metersPerUnit = 1, upAxis = 'Z', root = 'World', kind = 'assembly' } = {}) {
    const L = new Layer();
    this.layer = L;
    L.setMeta('defaultPrim', V('token', root));
    L.setMeta('metersPerUnit', V('double', metersPerUnit));
    L.setMeta('upAxis', V('token', upAxis));
    if (doc) L.setMeta('documentation', V('string', doc));
    const cad = new Map([['app', V('string', app)], ['convention', V('string', 'cadcraft-usd-1')]]);
    if (appVersion) cad.set('appVersion', V('string', appVersion));
    if (source) cad.set('source', V('string', String(source).replace(/^.*[\\/]/, '')));
    L.setMeta('customLayerData', V('dictionary', new Map([['cadcraft', V('dictionary', cad)]])));
    this.root = L.addPrim('/', root, { typeName: 'Xform' });
    if (kind) L.set(this.root, 'kind', V('token', kind));
    this.looks = null;
    this.materials = new Map();
    this.names = new Map();
  }

  /** A free identifier for a child of `parent` (the real name goes in displayName by the caller). */
  unique(parent, wanted) {
    const base = identifier(wanted);
    let used = this.names.get(parent);
    if (!used) { used = new Set(this.layer.get(parent, 'primChildren', [])); this.names.set(parent, used); }
    let n = base, k = 2;
    while (used.has(n)) n = base + '_' + k++;
    used.add(n);
    return n;
  }
  prim(parent, name, typeName, { kind, displayName, specifier = 'def', fields } = {}) {
    const id = this.unique(parent, name);
    const p = this.layer.addPrim(parent, id, { typeName, specifier, fields });
    if (kind) this.layer.set(p, 'kind', V('token', kind));
    if (displayName && displayName !== id) this.layer.set(p, 'displayName', V('string', displayName));
    return p;
  }
  attr(p, name, typeName, value, opts = {}) {
    return this.layer.addAttr(p, name, typeName, value === null || value === undefined ? null : valueOf(typeName, value), opts);
  }
  /** Transform ops: a 16-number matrix (column-major = USD's flat row-major) as one xformOp:transform. */
  setMatrix(p, m) {
    if (!m || isIdentity(m)) return;
    this.attr(p, 'xformOp:transform', 'matrix4d', Array.from(m));
    this.attr(p, 'xformOpOrder', 'token[]', ['xformOp:transform'], { uniform: true });
  }
  group(parent, name, opts = {}) {
    const p = this.prim(parent, name, opts.type === undefined ? 'Xform' : opts.type, { kind: opts.kind, displayName: opts.displayName ?? name });
    this.common(p, opts);
    return p;
  }
  common(p, opts) {
    if (opts.matrix) this.setMatrix(p, opts.matrix);
    if (opts.visible === false) this.attr(p, 'visibility', 'token', 'invisible');
    if (opts.purpose) this.attr(p, 'purpose', 'token', opts.purpose, { uniform: true });
    if (opts.instanceable) this.layer.set(p, 'instanceable', V('bool', true));
    if (opts.references) this.layer.set(p, 'references', V('listop:reference', { explicit: false, prependedItems: opts.references.map((r) => ({ asset: '', prim: r, offset: { offset: 0, scale: 1 }, customData: new Map() })) }));
    if (opts.attrs) for (const [n, [t, v, o]] of Object.entries(opts.attrs)) this.attr(p, n, t, v, o || {});
    if (opts.api) this.layer.set(p, 'apiSchemas', V('listop:token', { explicit: false, prependedItems: opts.api.slice() }));
  }

  mesh(parent, name, geo, opts = {}) {
    const p = this.prim(parent, name, 'Mesh', { displayName: opts.displayName ?? name });
    const pts = geo.points;
    let lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < pts.length; i += 3) for (let c = 0; c < 3; c++) { lo[c] = Math.min(lo[c], pts[i + c]); hi[c] = Math.max(hi[c], pts[i + c]); }
    if (!pts.length) { lo = [0, 0, 0]; hi = [0, 0, 0]; }
    this.attr(p, 'extent', 'float3[]', [...lo, ...hi]);
    this.attr(p, 'faceVertexCounts', 'int[]', geo.counts);
    this.attr(p, 'faceVertexIndices', 'int[]', geo.indices);
    if (geo.holes && geo.holes.length) this.attr(p, 'holeIndices', 'int[]', geo.holes);
    this.attr(p, 'points', 'point3f[]', pts);
    if (geo.normals) this.attr(p, 'normals', 'normal3f[]', geo.normals.values, { meta: { interpolation: V('token', geo.normals.interp || 'faceVarying') } });
    for (const uv of geo.uvs || []) {
      const pn = 'primvars:' + uv.name;
      this.attr(p, pn, 'texCoord2f[]', uv.values, { meta: { interpolation: V('token', uv.interp || 'faceVarying') } });
      if (uv.indices) this.attr(p, pn + ':indices', 'int[]', uv.indices);
    }
    if (geo.colors) this.attr(p, 'primvars:displayColor', 'color3f[]', geo.colors.values, { meta: { interpolation: V('token', geo.colors.interp || 'uniform') } });
    if (geo.creases && geo.creases.indices.length) {
      this.attr(p, 'creaseIndices', 'int[]', geo.creases.indices);
      this.attr(p, 'creaseLengths', 'int[]', geo.creases.lengths);
      this.attr(p, 'creaseSharpnesses', 'float[]', geo.creases.sharpness);
    }
    this.attr(p, 'subdivisionScheme', 'token', geo.subdivision || 'none', { uniform: true });
    if (geo.doubleSided) this.attr(p, 'doubleSided', 'bool', true, { uniform: true });
    this.common(p, opts);
    if (opts.material) this.bind(p, opts.material);
    for (const s of opts.subsets || []) {
      const sp = this.prim(p, s.name, 'GeomSubset');
      this.attr(sp, 'elementType', 'token', 'face', { uniform: true });
      this.attr(sp, 'familyName', 'token', 'materialBind', { uniform: true });
      this.attr(sp, 'indices', 'int[]', s.faces);
      if (s.material) this.bind(sp, s.material);
    }
    if (opts.subsets && opts.subsets.length) this.attr(p, 'subsetFamily:materialBind:familyType', 'token', 'nonOverlapping', { uniform: true });
    return p;
  }
  bind(p, material) {
    const cur = this.layer.field(p, 'apiSchemas');
    const items = cur ? (cur.v.prependedItems || cur.v.explicitItems || []) : [];
    if (!items.includes('MaterialBindingAPI')) this.layer.set(p, 'apiSchemas', V('listop:token', { explicit: false, prependedItems: [...items, 'MaterialBindingAPI'] }));
    this.layer.addRel(p, 'material:binding', [material]);
  }

  /** /World/Looks/<name>: OpenPBR (MaterialX) + a UsdPreviewSurface fallback. Same name → the same material. */
  material(name, params = {}, { texture = null, displayName = null } = {}) {
    if (this.materials.has(name)) return this.materials.get(name);
    if (!this.looks) this.looks = this.prim(this.root, 'Looks', 'Scope');
    const m = this.prim(this.looks, name, 'Material', { displayName: displayName ?? name });
    this.materials.set(name, m);
    const L = this.layer;
    const pbr = this.prim(m, 'OpenPBR', 'Shader');
    this.attr(pbr, 'info:id', 'token', 'ND_open_pbr_surface_surfaceshader', { uniform: true });
    const P = { ...params };
    for (const [k, t] of Object.entries(OPENPBR_TYPES)) {
      const v = P[k];
      if (v === undefined || v === null) continue;
      if (sameValue(v, OPENPBR_DEFAULTS[k])) continue;
      this.attr(pbr, 'inputs:' + k, t, v);
    }
    this.attr(pbr, 'outputs:out', 'token', null);
    const prev = this.prim(m, 'Preview', 'Shader');
    this.attr(prev, 'info:id', 'token', 'UsdPreviewSurface', { uniform: true });
    const g = (k) => (P[k] === undefined || P[k] === null ? OPENPBR_DEFAULTS[k] : P[k]);
    const bw = g('base_weight');
    this.attr(prev, 'inputs:diffuseColor', 'color3f', g('base_color').map((c) => c * bw));
    this.attr(prev, 'inputs:metallic', 'float', g('base_metalness'));
    this.attr(prev, 'inputs:roughness', 'float', g('specular_roughness'));
    this.attr(prev, 'inputs:ior', 'float', g('specular_ior'));
    if (g('geometry_opacity') < 1) this.attr(prev, 'inputs:opacity', 'float', g('geometry_opacity'));
    if (g('transmission_weight') > 0) this.attr(prev, 'inputs:opacity', 'float', Math.max(0.05, 1 - g('transmission_weight')));
    if (g('coat_weight') > 0) { this.attr(prev, 'inputs:clearcoat', 'float', g('coat_weight')); this.attr(prev, 'inputs:clearcoatRoughness', 'float', g('coat_roughness')); }
    if (g('emission_luminance') > 0) this.attr(prev, 'inputs:emissiveColor', 'color3f', g('emission_color'));
    this.attr(prev, 'outputs:surface', 'token', null);
    if (texture) this.previewTexture(m, prev, texture);
    L.addAttr(m, 'outputs:mtlx:surface', 'token', null, { connect: pbr + '.outputs:out' });
    L.addAttr(m, 'outputs:surface', 'token', null, { connect: prev + '.outputs:surface' });
    return m;
  }
  /** A base-colour picture on the preview surface (uv set `st`), with its file name relative to the layer. */
  previewTexture(m, prev, { file, scale = null }) {
    const reader = this.prim(m, 'UV', 'Shader');
    this.attr(reader, 'info:id', 'token', 'UsdPrimvarReader_float2', { uniform: true });
    this.attr(reader, 'inputs:varname', 'token', 'st');
    this.attr(reader, 'outputs:result', 'float2', null);
    const tex = this.prim(m, 'BaseColor', 'Shader');
    this.attr(tex, 'info:id', 'token', 'UsdUVTexture', { uniform: true });
    this.attr(tex, 'inputs:file', 'asset', file);
    this.layer.addAttr(tex, 'inputs:st', 'float2', null, { connect: reader + '.outputs:result' });
    if (scale) this.attr(tex, 'inputs:scale', 'float4', [...scale, 1]);
    this.attr(tex, 'inputs:wrapS', 'token', 'repeat');
    this.attr(tex, 'inputs:wrapT', 'token', 'repeat');
    this.attr(tex, 'outputs:rgb', 'float3', null);
    // diffuseColor is fed by the picture instead of its value
    this.layer.specs.get(prev + '.inputs:diffuseColor').fields.delete('default');
    this.layer.set(prev + '.inputs:diffuseColor', 'connectionPaths', V('listop:path', { explicit: true, explicitItems: [tex + '.outputs:rgb'] }));
  }
  colorMaterial(hex) {
    const h = String(hex).toLowerCase();
    return this.material('Color_' + h.slice(1), { base_color: hexToLinear(h), specular_roughness: 0.6 });
  }

  /** A lamp (ModelCraft's {kind point|spot|area, p, dir, color, lumens, angle, size, on, name}) under /World/Lights. */
  lamp(parent, name, L) {
    const type = L.kind === 'area' ? 'RectLight' : 'SphereLight';
    const p = this.prim(parent, name, type, { displayName: L.name || name });
    // aim: a light looks down its −Z; build a frame whose −Z is `dir`
    const m = frameLookingAlong(L.p, L.dir || [0, 0, -1]);
    this.setMatrix(p, m);
    const rgb = hexToLinear(L.color || '#ffffff');
    this.attr(p, 'inputs:color', 'color3f', rgb);
    // photometric: lumens → intensity by the conversion in README.md (a sphere light emits intensity × area × π W/m² … as nits)
    const area = L.kind === 'area' ? L.size[0] * L.size[1] : Math.max(1e-6, 4 * Math.PI * (L.size[0] / 2) ** 2);
    this.attr(p, 'inputs:intensity', 'float', L.lumens / (683 * area * Math.PI));
    if (L.kind === 'area') { this.attr(p, 'inputs:width', 'float', L.size[0]); this.attr(p, 'inputs:height', 'float', L.size[1]); }
    else this.attr(p, 'inputs:radius', 'float', L.size[0] / 2);
    if (L.kind === 'spot') {
      const cur = ['ShapingAPI'];
      this.layer.set(p, 'apiSchemas', V('listop:token', { explicit: false, prependedItems: cur }));
      this.attr(p, 'inputs:shaping:cone:angle', 'float', L.angle / 2);
    }
    if (L.on === false) this.attr(p, 'visibility', 'token', 'invisible');
    this.attr(p, 'cadcraft:lumens', 'double', L.lumens, { custom: true });
    return p;
  }
  /** A camera from eye/target/fov (vertical, degrees)/persp/height (visible height for parallel views). */
  camera(parent, name, c, { up = [0, 0, 1] } = {}) {
    const p = this.prim(parent, name, 'Camera', { displayName: name });
    const m = frameLookingAlong(c.eye, sub(c.target, c.eye), up);
    this.setMatrix(p, m);
    const VA = 24;   // vertical aperture in "mm" (tenths of a scene unit, as the schema has it)
    if (c.persp === false) {
      this.attr(p, 'projection', 'token', 'orthographic');
      this.attr(p, 'verticalAperture', 'float', c.height * 10);
      this.attr(p, 'horizontalAperture', 'float', c.height * 10 * 1.5);
    } else {
      this.attr(p, 'projection', 'token', 'perspective');
      this.attr(p, 'verticalAperture', 'float', VA);
      this.attr(p, 'horizontalAperture', 'float', VA * 1.5);
      this.attr(p, 'focalLength', 'float', VA / 2 / Math.tan(((c.fov || 35) * Math.PI) / 360));
    }
    const d = Math.hypot(...sub(c.target, c.eye));
    this.attr(p, 'clippingRange', 'float2', [Math.max(0.01, d / 1000), Math.max(1000, d * 100)]);
    return p;
  }

  write(format = 'usda') { return format === 'usdc' ? writeUsdc(this.layer) : writeUsda(this.layer); }
  /** A .usdz: this layer as the default (binary), then the files it names (textures). */
  usdz(files = []) { return writeUsdz([{ name: 'scene.usdc', bytes: writeUsdc(this.layer) }, ...files]); }
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
function norm(v) { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
/** A frame at `at` whose −Z points along `dir` (cameras and lights look down −Z), +Y as close to `up` as it can be. */
export function frameLookingAlong(at, dir, up = [0, 0, 1]) {
  const z = norm([-dir[0], -dir[1], -dir[2]]);
  let x = cross(up, z);
  if (Math.hypot(...x) < 1e-9) x = cross([0, 1, 0], z);
  if (Math.hypot(...x) < 1e-9) x = cross([1, 0, 0], z);
  x = norm(x);
  const y = cross(z, x);
  return [x[0], x[1], x[2], 0, y[0], y[1], y[2], 0, z[0], z[1], z[2], 0, at[0], at[1], at[2], 1];
}
function isIdentity(m) { for (let i = 0; i < 16; i++) if (Math.abs(m[i] - (i % 5 === 0 ? 1 : 0)) > 0) return false; return true; }
function sameValue(a, b) {
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => Math.abs(x - b[i]) < 1e-9);
  return a === b;
}
