/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usda-write.js — an sdf.js Layer as USD text (`.usda`, "#usda 1.0"), following the published text format. DOM-free.
 *
 *   writeUsda(layer) → string
 *   formatValue(value, indent) → string (one value in text form; used by tests and the dictionary writer)
 *
 * Numbers: doubles in their shortest exact form, floats and halves in the shortest form that reads back to the same
 * float/half; inf / -inf / nan. Everything the layer holds is written; nothing is dropped silently.
 */
import { TYPES, isIdentifier, path as P } from './sdf.js';
import { floatToHalf, halfToFloat } from './util.js';

const PRIM_STRUCTURAL = new Set(['specifier', 'typeName', 'primChildren', 'properties', 'variantChildren', 'variantSetChildren', 'primOrder', 'propertyOrder']);
const ATTR_STRUCTURAL = new Set(['typeName', 'custom', 'variability', 'default', 'timeSamples', 'connectionPaths', 'spline']);
const REL_STRUCTURAL = new Set(['custom', 'variability', 'targetPaths', 'targetChildren']);
/** Field names whose text keyword differs. */
const KEYWORD = { documentation: 'doc', variantSelection: 'variants', variantSetNames: 'variantSets', inheritPaths: 'inherits' };
const LISTOP_KEYS = [['deletedItems', 'delete '], ['addedItems', 'add '], ['prependedItems', 'prepend '], ['appendedItems', 'append '], ['orderedItems', 'reorder ']];

export function writeUsda(layer) {
  const out = ['#usda 1.0'];
  const root = layer.specs.get('/');
  const meta = [];
  for (const [k, v] of root ? root.fields : []) {
    if (k === 'primChildren' || k === 'subLayerOffsets') continue;
    if (k === 'subLayers') { meta.push(subLayersText(v.v, root.fields.get('subLayerOffsets'), '    ')); continue; }
    meta.push(...metaLines(k, v, '    '));
  }
  if (meta.length) out.push('(', ...meta, ')');
  out.push('');
  for (const c of layer.children('/')) out.push(...primText(layer, c, ''), '');
  return out.join('\n');
}

function subLayersText(list, offsets, ind) {
  const offs = offsets ? offsets.v : [];
  const items = list.map((a, i) => {
    const o = offs[i];
    return asset(a) + (o && (o.offset !== 0 || o.scale !== 1) ? ' (' + layerOffsetText(o) + ')' : '');
  });
  return ind + 'subLayers = [\n' + items.map((s) => ind + '    ' + s).join(',\n') + '\n' + ind + ']';
}
function layerOffsetText(o) {
  const parts = [];
  if (o.offset !== 0) parts.push('offset = ' + num(o.offset, 'f64'));
  if (o.scale !== 1) parts.push('scale = ' + num(o.scale, 'f64'));
  return parts.join('; ');
}

function primText(layer, p, ind) {
  const s = layer.specs.get(p);
  const f = s.fields;
  const spec = s.type === 'variant' ? null : (f.get('specifier')?.v || 'def');
  const type = f.get('typeName')?.v;
  const name = P.name(p);
  const lines = [];
  const head = s.type === 'variant' ? ind + quote(name.slice(name.indexOf('=') + 1, -1)) : ind + spec + (type ? ' ' + type : '') + ' ' + quote(name);
  const meta = [];
  for (const [k, v] of f) {
    if (PRIM_STRUCTURAL.has(k)) continue;
    meta.push(...metaLines(k, v, ind + '    '));
  }
  lines.push(meta.length ? head + ' (\n' + meta.join('\n') + '\n' + ind + ')' : head);
  lines.push(ind + '{');
  const body = [];
  if (f.get('primOrder')) body.push(ind + '    reorder nameChildren = [' + f.get('primOrder').v.map(quote).join(', ') + ']');
  if (f.get('propertyOrder')) body.push(ind + '    reorder properties = [' + f.get('propertyOrder').v.map(quote).join(', ') + ']');
  for (const prop of layer.properties(p)) body.push(propText(layer, prop, ind + '    '));
  // variant sets: '{set=}' specs under this prim
  const sets = [...layer.specs.keys()].filter((k) => k.startsWith(p + '{') && k.endsWith('=}') && !k.slice(p.length + 1).includes('{'));
  const orderedSets = f.get('variantSetChildren')?.v || [];
  sets.sort((a, b) => orderedSets.indexOf(setName(a)) - orderedSets.indexOf(setName(b)));
  const kids = layer.children(p);
  if (body.length && (kids.length || sets.length)) body.push('');
  kids.forEach((c, i) => { if (i) body.push(''); body.push(...primText(layer, c, ind + '    ')); });
  for (const sp of sets) {
    if (body.length) body.push('');
    body.push(ind + '    variantSet ' + quote(setName(sp)) + ' = {');
    const variants = layer.get(sp, 'variantChildren', []);
    for (const v of variants) {
      const vp = sp.slice(0, -1) + v + '}';
      if (layer.specs.has(vp)) body.push(...primText(layer, vp, ind + '        '));
    }
    body.push(ind + '    }');
  }
  lines.push(...body, ind + '}');
  return lines;
}
const setName = (sp) => sp.slice(sp.lastIndexOf('{') + 1, -2);

function propText(layer, p, ind) {
  const s = layer.specs.get(p);
  const f = s.fields;
  const name = P.name(p);
  const lines = [];
  const meta = [];
  const struct = s.type === 'relationship' ? REL_STRUCTURAL : ATTR_STRUCTURAL;
  for (const [k, v] of f) if (!struct.has(k)) meta.push(...metaLines(k, v, ind + '    '));
  const metaText = meta.length ? ' (\n' + meta.join('\n') + '\n' + ind + ')' : '';
  const custom = f.get('custom')?.v ? 'custom ' : '';
  if (s.type === 'relationship') {
    const varying = f.get('variability')?.v === 'varying' ? 'varying ' : '';
    const op = f.get('targetPaths')?.v;
    const decl = custom + varying + 'rel ' + name;
    if (!op) return ind + decl + metaText;
    const st = listOpStatements(op, (items) => (items.length === 0 ? 'None' : items.length === 1 ? pathText(items[0]) : '[\n' + items.map((x) => ind + '    ' + pathText(x)).join(',\n') + ',\n' + ind + ']'));
    st.forEach(([prefix, val], i) => lines.push(ind + prefix + decl + ' = ' + val + (i === st.length - 1 ? metaText : '')));
    if (!st.length) lines.push(ind + decl + metaText);
    return lines.join('\n');
  }
  const uniform = f.get('variability')?.v === 'uniform' ? 'uniform ' : '';
  const typeName = f.get('typeName')?.v || 'token';
  const decl = custom + uniform + typeName + ' ' + name;
  const def = f.get('default');
  lines.push(ind + decl + (def ? ' = ' + formatValue(def, ind) : '') + metaText);
  const ts = f.get('timeSamples');
  if (ts) {
    const rows = ts.v.map(([t, v]) => ind + '    ' + num(t, 'f64') + ': ' + (v ? formatValue(v, ind + '    ') : 'None') + ',');
    lines.push(ind + decl + '.timeSamples = {\n' + rows.join('\n') + '\n' + ind + '}');
  }
  const con = f.get('connectionPaths');
  if (con) {
    for (const [prefix, val] of listOpStatements(con.v, (items) => (items.length === 0 ? 'None' : items.length === 1 ? pathText(items[0]) : '[' + items.map(pathText).join(', ') + ']'))) {
      lines.push(ind + prefix + decl + '.connect = ' + val);
    }
  }
  return lines.join('\n');
}

/** A list op as statements: [[prefix, value text]] (explicit → one with prefix ''). */
function listOpStatements(op, fmt) {
  if (op.explicit) return [['', fmt(op.explicitItems || [])]];
  const out = [];
  for (const [k, prefix] of LISTOP_KEYS) if (op[k] && op[k].length) out.push([prefix, fmt(op[k])]);
  return out;
}

/** Metadata `key = value` lines (list ops become one line per part). */
function metaLines(k, v, ind) {
  const key = KEYWORD[k] || k;
  if (v.t.startsWith('listop:')) {
    const item = v.t.slice(7);
    const fmt = (items) => {
      const one = (x) => listItemText(item, x, ind);
      if (items.length === 1 && item !== 'token' && item !== 'string') return one(items[0]);
      if (items.length === 1 && (key === 'variantSets')) return one(items[0]);
      return '[' + items.map(one).join(', ') + ']';
    };
    return listOpStatements(v.v, fmt).map(([prefix, val]) => ind + prefix + key + ' = ' + val);
  }
  if (k === 'comment') return [ind + quote(v.v)];
  if (k === 'documentation') return [ind + key + ' = ' + quote(v.v)];
  if (v.t === 'variantSelection') {
    const rows = [...v.v].map(([s, sel]) => ind + '    string ' + keyText(s) + ' = ' + quote(sel));
    return [ind + key + ' = {\n' + rows.join('\n') + '\n' + ind + '}'];
  }
  if (v.t === 'payload') return [ind + key + ' = ' + listItemText('payload', v.v, ind)];
  return [ind + key + ' = ' + formatValue(v, ind)];
}

function listItemText(item, x, ind) {
  switch (item) {
    case 'token': case 'string': return quote(x);
    case 'path': return pathText(x);
    case 'reference': case 'payload': {
      let s = x.asset ? asset(x.asset) : '';
      if (x.prim) s += pathText(x.prim);
      if (!s) s = '@@';
      const o = x.offset;
      const parts = [];
      if (o && (o.offset !== 0 || o.scale !== 1)) parts.push(layerOffsetText(o));
      if (x.customData && x.customData.size) parts.push('customData = ' + dictText(x.customData, ind));
      return parts.length ? s + ' (' + parts.join('; ') + ')' : s;
    }
    case 'int': case 'uint': case 'int64': case 'uint64': return String(x);
    default: return formatValue(x, ind);
  }
}

// ---------------------------------------------------------------- values

export function formatValue(val, ind = '') {
  const t = val.t, v = val.v;
  if (t === 'block' || v === null || v === undefined) return 'None';
  if (t === 'dictionary') return dictText(v, ind);
  if (t === 'tokens' || t === 'strings') return '[' + v.map(quote).join(', ') + ']';
  if (t === 'paths') return '[' + v.map(pathText).join(', ') + ']';
  if (t === 'doubles') return '[' + Array.from(v, (x) => num(x, 'f64')).join(', ') + ']';
  if (t === 'specifier' || t === 'variability' || t === 'permission') return v;
  if (t === 'unregistered') return typeof v === 'string' ? v : dictText(v, ind);
  if (t === 'path') return pathText(v);
  if (t.startsWith('listop:')) return '[' + (v.explicitItems || []).map((x) => listItemText(t.slice(7), x, ind)).join(', ') + ']';
  const array = t.endsWith('[]');
  const base = array ? t.slice(0, -2) : t;
  const d = TYPES[base];
  if (!d) return quote(String(v));
  const one = (x) => scalarText(base, d, x);
  if (!array) return d.n === 1 ? one(v) : tupleText(d, Array.from(v), 0);
  if (d.n === 1) return '[' + Array.from(v, one).join(', ') + ']';
  const parts = [];
  for (let i = 0; i < v.length; i += d.n) parts.push(tupleText(d, v, i));
  return '[' + parts.join(', ') + ']';
}
function tupleText(d, a, at) {
  if (d.mat) {
    const m = d.mat, rows = [];
    for (let r = 0; r < m; r++) {
      const row = [];
      for (let c = 0; c < m; c++) row.push(num(Number(a[at + r * m + c]), 'f64'));
      rows.push('(' + row.join(', ') + ')');
    }
    return '( ' + rows.join(', ') + ' )';
  }
  const parts = [];
  for (let i = 0; i < d.n; i++) parts.push(d.k === 'i32' ? String(a[at + i] | 0) : num(Number(a[at + i]), d.k));
  return '(' + parts.join(', ') + ')';
}
function scalarText(base, d, x) {
  switch (d.k) {
    case 'bool': return x ? 'true' : 'false';
    case 'str': case 'tok': return quote(x);
    case 'asset': return asset(x);
    case 'pathexpr': return quote(x);
    case 'u8': case 'i32': case 'u32': case 'i64': case 'u64': return String(x);
    default: return num(Number(x), d.k);
  }
}
/** Shortest text that reads back to the same value at its precision. */
export function num(x, k = 'f64') {
  if (Number.isNaN(x)) return 'nan';
  if (x === Infinity) return 'inf';
  if (x === -Infinity) return '-inf';
  if (Object.is(x, -0)) return '-0';
  if (k === 'f32') {
    const f = Math.fround(x);
    for (let p = 1; p <= 9; p++) { const s = shortNum(f, p); if (Math.fround(+s) === f) return s; }
    return String(f);
  }
  if (k === 'f16') {
    const h = floatToHalf(x);
    for (let p = 1; p <= 6; p++) { const s = shortNum(halfToFloat(h), p); if (floatToHalf(+s) === h) return s; }
    return String(halfToFloat(h));
  }
  return String(x).replace('e+', 'e');
}
function shortNum(x, p) {
  let s = x.toPrecision(p);
  if (s.includes('e')) { const [m, e] = s.split('e'); return (m.includes('.') ? m.replace(/0+$/, '').replace(/\.$/, '') : m) + 'e' + e.replace('+', ''); }
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

function dictText(m, ind) {
  if (!m.size) return '{\n' + ind + '}';
  const rows = [];
  for (const [k, val] of m) {
    const tn = val.t === 'dictionary' ? 'dictionary' : val.t === 'tokens' ? 'token[]' : val.t === 'strings' ? 'string[]' : val.t === 'doubles' ? 'double[]' : val.t === 'paths' ? 'path[]' : val.t;
    rows.push(ind + '    ' + tn + ' ' + keyText(k) + ' = ' + formatValue(val, ind + '    '));
  }
  return '{\n' + rows.join('\n') + '\n' + ind + '}';
}
const keyText = (k) => (isIdentifier(k) ? k : quote(k));

export function quote(s) {
  s = String(s);
  if (s.includes('\n') && !s.includes('"""') && !s.endsWith('"') && !s.includes('\\')) return '"""' + s + '"""';
  return '"' + s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"';
}
export function asset(a) { return a.includes('@') ? '@@@' + a + '@@@' : '@' + a + '@'; }
const pathText = (p) => '<' + p + '>';
