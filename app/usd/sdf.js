/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sdf.js — cc-usd's layer model: what one USD file says, before composition. Both formats read into it and write from
 * it (usda-read/-write, usdc-read/-write), so converting between them is lossless. DOM-free; imports util.js only.
 *
 * A layer is a map of **specs** keyed by path, exactly as the published data model has them:
 *
 *   layer.specs: Map<path string, { type, fields: Map<field name, Value> }>
 *     type: 'pseudoRoot' (path '/') | 'prim' | 'attribute' | 'relationship' | 'variantSet' | 'variant'
 *           | 'connection' | 'relationshipTarget' | 'expression' | 'mapper' | 'mapperArg'
 *
 * A **Value** is `{ t, v }`: `t` a value type name, `v` the data.
 *   scalars   'bool' 'uchar' 'int' 'uint' 'int64' 'uint64' 'half' 'float' 'double' 'timecode'   v = number (int64: BigInt
 *             when outside ±2^53) · 'string' 'token' 'asset' → string · 'pathExpression' → string
 *   tuples    'float3' 'double2' 'half4' 'int3' … v = [..] · 'quatf' 'quatd' 'quath' v = [w, x, y, z] (text order)
 *             'matrix2d' 'matrix3d' 'matrix4d' v = flat row-major numbers (USD's row-vector convention: translation in
 *             the last row)
 *   arrays    any of the above + '[]', v = plain array (tuples: array of arrays) or a typed array for numbers
 *   'dictionary'       v = Map<string, Value>          'variantSelection' v = Map<string, string>
 *   'tokens' 'strings' 'paths' 'doubles' (vectors, not arrays: field values such as primChildren) v = array
 *   'layerOffsets'     v = [{offset, scale}]
 *   'specifier' v = 'def' | 'over' | 'class' · 'variability' v = 'varying' | 'uniform' · 'permission' 'public'|'private'
 *   'listop:<item>'    item = token | string | path | reference | payload | int | int64 | uint | uint64
 *                      v = { explicit: bool, explicitItems, addedItems, prependedItems, appendedItems, deletedItems,
 *                            orderedItems } (each an array or absent); reference items {asset, prim, offset:{offset,
 *                      scale}, customData: Map}, payload items {asset, prim, offset}
 *   'timeSamples'      v = [[time, Value | null (a block)], …] sorted by time
 *   'block'            v = null (None: the value is blocked)
 *   'reference' 'payload' (single), 'path' (single path)
 *   'unregistered'     v = string (a value the text format keeps verbatim)
 *
 * Paths are Sdf text: '/', '/World', '/World/Wall.ifc:class', '/Set{shape=box}Cube', '/Set{shape=}'.
 */
import { UsdError } from './util.js';

export const V = (t, v) => ({ t, v });

// ---------------------------------------------------------------- value types

/** Base value types: crate enum, components, scalar kind (for packing). */
export const TYPES = {
  bool: { e: 1, n: 1, k: 'bool' }, uchar: { e: 2, n: 1, k: 'u8' }, int: { e: 3, n: 1, k: 'i32' }, uint: { e: 4, n: 1, k: 'u32' },
  int64: { e: 5, n: 1, k: 'i64' }, uint64: { e: 6, n: 1, k: 'u64' }, half: { e: 7, n: 1, k: 'f16' }, float: { e: 8, n: 1, k: 'f32' },
  double: { e: 9, n: 1, k: 'f64' }, string: { e: 10, n: 1, k: 'str' }, token: { e: 11, n: 1, k: 'tok' }, asset: { e: 12, n: 1, k: 'asset' },
  matrix2d: { e: 13, n: 4, k: 'f64', mat: 2 }, matrix3d: { e: 14, n: 9, k: 'f64', mat: 3 }, matrix4d: { e: 15, n: 16, k: 'f64', mat: 4 },
  quatd: { e: 16, n: 4, k: 'f64', quat: true }, quatf: { e: 17, n: 4, k: 'f32', quat: true }, quath: { e: 18, n: 4, k: 'f16', quat: true },
  double2: { e: 19, n: 2, k: 'f64' }, float2: { e: 20, n: 2, k: 'f32' }, half2: { e: 21, n: 2, k: 'f16' }, int2: { e: 22, n: 2, k: 'i32' },
  double3: { e: 23, n: 3, k: 'f64' }, float3: { e: 24, n: 3, k: 'f32' }, half3: { e: 25, n: 3, k: 'f16' }, int3: { e: 26, n: 3, k: 'i32' },
  double4: { e: 27, n: 4, k: 'f64' }, float4: { e: 28, n: 4, k: 'f32' }, half4: { e: 29, n: 4, k: 'f16' }, int4: { e: 30, n: 4, k: 'i32' },
  timecode: { e: 56, n: 1, k: 'f64' }, pathExpression: { e: 57, n: 1, k: 'pathexpr' },
};
/** Crate enum → base type name (array-capable ones), and the non-array field kinds. */
export const ENUM_TYPE = Object.fromEntries(Object.entries(TYPES).map(([k, d]) => [d.e, k]));
export const ENUM_KIND = {
  31: 'dictionary', 32: 'listop:token', 33: 'listop:string', 34: 'listop:path', 35: 'listop:reference', 36: 'listop:int',
  37: 'listop:int64', 38: 'listop:uint', 39: 'listop:uint64', 40: 'paths', 41: 'tokens', 42: 'specifier', 43: 'permission',
  44: 'variability', 45: 'variantSelection', 46: 'timeSamples', 47: 'payload', 48: 'doubles', 49: 'layerOffsets', 50: 'strings',
  51: 'block', 52: 'value', 53: 'unregistered', 54: 'listop:unregistered', 55: 'listop:payload', 58: 'relocates', 59: 'spline',
  60: 'animationBlock', 61: 'duration',
};
export const KIND_ENUM = Object.fromEntries(Object.entries(ENUM_KIND).map(([e, k]) => [k, +e]));

/** Role names (attribute type names) → their value type. */
export const ROLES = {
  point3h: 'half3', point3f: 'float3', point3d: 'double3', vector3h: 'half3', vector3f: 'float3', vector3d: 'double3',
  normal3h: 'half3', normal3f: 'float3', normal3d: 'double3', color3h: 'half3', color3f: 'float3', color3d: 'double3',
  color4h: 'half4', color4f: 'float4', color4d: 'double4', texCoord2h: 'half2', texCoord2f: 'float2', texCoord2d: 'double2',
  texCoord3h: 'half3', texCoord3f: 'float3', texCoord3d: 'double3', frame4d: 'matrix4d', group: 'opaque', opaque: 'opaque',
};

/** 'point3f[]' → { base: 'float3', array: true, role: 'point3f' }, or null for an unknown name. */
export function typeInfo(name) {
  if (typeof name !== 'string') return null;
  const array = name.endsWith('[]');
  const role = array ? name.slice(0, -2) : name;
  const base = ROLES[role] || role;
  if (base === 'opaque') return { base, array, role, def: null };
  const def = TYPES[base];
  return def ? { base, array, role, def } : null;
}

// ---------------------------------------------------------------- paths

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PROP = /^[A-Za-z_][A-Za-z0-9_]*(:[A-Za-z_][A-Za-z0-9_]*)*$/;
export const isIdentifier = (s) => typeof s === 'string' && IDENT.test(s);
export const isPropertyName = (s) => typeof s === 'string' && PROP.test(s);

/** A USD identifier from any name: other characters → '_', a leading digit gets '_' in front; '' → '_'. */
export function identifier(s) {
  let out = String(s ?? '').normalize('NFC').replace(/[^A-Za-z0-9_]/g, '_');
  if (!out) out = '_';
  if (/^[0-9]/.test(out)) out = '_' + out;
  return out;
}

export const path = {
  /** Parent of a prim, property or variant path ('/A/B' → '/A', '/A.x' → '/A', '/A{v=s}' → '/A', '/A' → '/'). */
  parent(p) {
    if (p === '/') return '';
    const dot = lastPropDot(p);
    if (dot >= 0) return p.slice(0, dot);
    if (p.endsWith('}')) return p.slice(0, p.lastIndexOf('{'));
    const i = p.lastIndexOf('/');
    const j = p.lastIndexOf('}');
    if (j > i) return p.slice(0, j + 1);
    return i <= 0 ? '/' : p.slice(0, i);
  },
  /** Last element: prim name, property name, or '{set=sel}'. */
  name(p) {
    if (p === '/') return '';
    const dot = lastPropDot(p);
    if (dot >= 0) return p.slice(dot + 1);
    if (p.endsWith('}')) return p.slice(p.lastIndexOf('{'));
    const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('}'));
    return p.slice(i + 1);
  },
  child(parent, name) {
    if (name.startsWith('{')) return parent + name;
    if (parent === '/') return '/' + name;
    return parent.endsWith('}') ? parent + name : parent + '/' + name;
  },
  prop(prim, name) { return prim + '.' + name; },
  isProp(p) { return lastPropDot(p) >= 0; },
  /** '/A{v=s}B' → '/A/B' (the path a variant's contents have on the composed stage). */
  stripVariants(p) { return p.replace(/\{[^}]*\}/g, '/').replace(/\/+/g, '/').replace(/\/(?=\.|$)/, '') || '/'; },
};
function lastPropDot(p) {
  // a '.' outside '[...]' (target paths) and after the last '/', '}' — property paths have exactly one
  let depth = 0;
  for (let i = p.length - 1; i >= 0; i--) {
    const c = p[i];
    if (c === ']') depth++;
    else if (c === '[') depth--;
    else if (depth === 0 && (c === '/' || c === '}')) return -1;
    else if (depth === 0 && c === '.') return i;
  }
  return -1;
}

/** Resolve a path written relative to an anchor ('../x', 'x', '.y') against a prim path. */
export function absolutePath(rel, anchor) {
  if (!rel || rel.startsWith('/')) return rel;
  let base = anchor;
  let rest = rel;
  while (rest.startsWith('../')) { base = path.parent(base); rest = rest.slice(3); }
  if (rest === '..') return path.parent(base);
  if (rest.startsWith('.')) return base + rest;
  return path.child(base, rest);
}

// ---------------------------------------------------------------- layers

export class Layer {
  constructor() {
    this.specs = new Map([['/', { type: 'pseudoRoot', fields: new Map() }]]);
    this.notes = [];
  }
  spec(p) { return this.specs.get(p) || null; }
  field(p, name) { const s = this.specs.get(p); const f = s && s.fields.get(name); return f === undefined ? null : f; }
  /** A field's data (`v`), or `dflt` when absent. */
  get(p, name, dflt = null) { const f = this.field(p, name); return f ? f.v : dflt; }
  set(p, name, value) { this.specs.get(p).fields.set(name, value); return this; }
  /** Layer metadata (pseudo-root fields). */
  meta(name, dflt = null) { return this.get('/', name, dflt); }
  setMeta(name, value) { return this.set('/', name, value); }

  /** Child prims of a prim (or of '/'), in order. */
  children(p) {
    const names = this.get(p, 'primChildren', []);
    return names.map((n) => path.child(p, n)).filter((c) => this.specs.has(c));
  }
  properties(p) {
    const names = this.get(p, 'properties', []);
    return names.map((n) => path.prop(p, n)).filter((c) => this.specs.has(c));
  }

  /** Add a prim spec under `parent`; keeps primChildren in order. → its path. Throws on a bad or taken name. */
  addPrim(parent, name, { specifier = 'def', typeName = '', fields = null } = {}) {
    if (!isIdentifier(name)) throw new UsdError('bad_scene', 'not an identifier: ' + name);   // i18n-ignore: programmer error
    const p = path.child(parent, name);
    if (this.specs.has(p)) throw new UsdError('bad_scene', 'already exists: ' + p);   // i18n-ignore: programmer error
    const f = new Map([['specifier', V('specifier', specifier)]]);
    if (typeName) f.set('typeName', V('token', typeName));
    if (fields) for (const [k, v] of fields) f.set(k, v);
    this.specs.set(p, { type: 'prim', fields: f });
    appendName(this.specs.get(parent), 'primChildren', name);
    return p;
  }
  /** Add an attribute: typeName as written ('point3f[]'), value a Value or null, opts {custom, uniform, meta: {k: Value}}. */
  addAttr(prim, name, typeName, value = null, { custom = false, uniform = false, meta = null, timeSamples = null, connect = null } = {}) {
    if (!isPropertyName(name)) throw new UsdError('bad_scene', 'not a property name: ' + name);   // i18n-ignore: programmer error
    const p = path.prop(prim, name);
    // the reference library writes custom and variability on every attribute: so do we (equal layers compare equal)
    const f = new Map([['custom', V('bool', !!custom)], ['typeName', V('token', typeName)], ['variability', V('variability', uniform ? 'uniform' : 'varying')]]);
    if (value) f.set('default', value);
    if (timeSamples) f.set('timeSamples', V('timeSamples', timeSamples));
    if (connect) f.set('connectionPaths', V('listop:path', { explicit: true, explicitItems: [].concat(connect) }));
    if (meta) for (const [k, v] of Object.entries(meta)) f.set(k, v);
    if (!this.specs.has(p)) appendName(this.specs.get(prim), 'properties', name);
    this.specs.set(p, { type: 'attribute', fields: f });
    return p;
  }
  addRel(prim, name, targets = [], { custom = false, meta = null } = {}) {
    const p = path.prop(prim, name);
    const f = new Map();
    if (custom) f.set('custom', V('bool', true));
    f.set('variability', V('variability', 'uniform'));
    if (targets) f.set('targetPaths', V('listop:path', { explicit: true, explicitItems: [].concat(targets) }));
    if (meta) for (const [k, v] of Object.entries(meta)) f.set(k, v);
    if (!this.specs.has(p)) appendName(this.specs.get(prim), 'properties', name);
    this.specs.set(p, { type: 'relationship', fields: f });
    return p;
  }
  /** A variant set and its variants on a prim → { set path, variant paths by name }. */
  addVariantSet(prim, setName, variantNames) {
    const sp = prim + '{' + setName + '=}';
    this.specs.set(sp, { type: 'variantSet', fields: new Map([['variantChildren', V('tokens', variantNames.slice())]]) });
    const ps = this.specs.get(prim);
    appendName(ps, 'variantSetChildren', setName);
    const names = ps.fields.get('variantSetNames');
    const list = names ? names.v.explicitItems || names.v.prependedItems || [] : [];
    if (!list.includes(setName)) list.push(setName);
    ps.fields.set('variantSetNames', V('listop:string', names && !names.v.explicit ? { ...names.v, prependedItems: list } : { explicit: true, explicitItems: list }));
    const out = {};
    for (const v of variantNames) {
      const vp = prim + '{' + setName + '=' + v + '}';
      this.specs.set(vp, { type: 'variant', fields: new Map() });
      out[v] = vp;
    }
    return { set: sp, variants: out };
  }
}
function appendName(spec, field, name) {
  const cur = spec.fields.get(field);
  if (cur) { if (!cur.v.includes(name)) cur.v.push(name); } else spec.fields.set(field, V('tokens', [name]));
}

/** Items of a list op as it applies to an empty list (what a single layer says). */
export function listOpItems(op) {
  if (!op) return [];
  if (op.explicit) return (op.explicitItems || []).slice();
  const out = [...(op.prependedItems || []), ...(op.addedItems || []), ...(op.appendedItems || [])];
  const del = op.deletedItems || [];
  return del.length ? out.filter((x) => !del.some((d) => same(d, x))) : out;
}
/** Apply a list op on top of a weaker list (prepend/append/delete/explicit). */
export function applyListOp(op, weaker) {
  if (!op) return weaker.slice();
  if (op.explicit) return (op.explicitItems || []).slice();
  let out = weaker.filter((x) => !(op.deletedItems || []).some((d) => same(d, x)));
  const pre = op.prependedItems || [], app = [...(op.addedItems || []), ...(op.appendedItems || [])];
  out = out.filter((x) => !pre.some((p) => same(p, x)) && !app.some((a) => same(a, x)));
  return [...pre, ...out, ...app];
}
function same(a, b) { return a === b || JSON.stringify(a) === JSON.stringify(b); }
