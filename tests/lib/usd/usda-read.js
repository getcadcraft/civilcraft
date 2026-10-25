/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usda-read.js — reads USD text (`.usda`, "#usda 1.0") into an sdf.js Layer, with the same specs and fields the
 * binary reader produces for the same scene (attributes carry custom + variability; prims primChildren / properties /
 * variantSetChildren). From the published text format; our own tokenizer and recursive-descent parser. Untrusted
 * input: nesting depth and sizes capped, every value checked against its declared type. DOM-free.
 *
 *   readUsda(text | bytes, opts) → Layer (layer.format = 'usda')
 *   isUsda(bytes)
 */
import { UsdError, damaged, limitsOf, floatToHalf, halfToFloat, utf8decode } from './util.js';
import { Layer, V, typeInfo, path as P } from './sdf.js';
import { msg } from './messages.js';

export function isUsda(b) {
  const head = b instanceof Uint8Array ? utf8decode(b.subarray(0, 16)) : String(b).slice(0, 16);
  return head.startsWith('#usda ');
}

// ---------------------------------------------------------------- tokens

const PUNCT = new Set(['(', ')', '[', ']', '{', '}', '=', ',', ';', ':', '.', '&']);
const NUM = /[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/y;
const ID = /[A-Za-z_][A-Za-z0-9_]*(?::[A-Za-z_][A-Za-z0-9_]*)*/y;

function tokenize(src, limits) {
  const out = [];
  let i = 0, line = 1;
  const n = src.length;
  const err = (what) => damaged('ccusd.damaged.syntax', { line, what });
  while (i < n) {
    const c = src[i];
    if (c === '\n') { line++; i++; continue; }
    if (c === ' ' || c === '\t' || c === '\r' || c === '\f') { i++; continue; }
    if (c === '#') { while (i < n && src[i] !== '\n') i++; continue; }
    const at = line;
    if (c === '"' || c === "'") {
      const triple = src.startsWith(c + c + c, i);
      const q = triple ? c + c + c : c;
      let j = i + q.length, s = '';
      for (;;) {
        if (j >= n) throw err(msg('ccusd.syntax.end', { what: msg('ccusd.part.string') }));
        if (src.startsWith(q, j)) { j += q.length; break; }
        const ch = src[j];
        if (ch === '\n') { if (!triple) throw err(msg('ccusd.syntax.end', { what: msg('ccusd.part.string') })); line++; }
        if (ch === '\\') {
          const e = src[j + 1];
          const map = { n: '\n', t: '\t', r: '\r', '\\': '\\', '"': '"', "'": "'", a: '\x07', b: '\b', f: '\f', v: '\v', 0: '\0' };
          if (e === 'x') { s += String.fromCharCode(parseInt(src.slice(j + 2, j + 4), 16)); j += 4; continue; }
          if (e in map) { s += map[e]; j += 2; continue; }
          s += e === undefined ? '' : e; j += 2; continue;
        }
        s += ch; j++;
      }
      out.push({ k: 'str', v: s, line: at });
      i = j;
      continue;
    }
    if (c === '@') {
      if (src.startsWith('@@@', i)) {
        const j = src.indexOf('@@@', i + 3);
        if (j < 0) throw err(msg('ccusd.syntax.end', { what: msg('ccusd.part.asset') }));
        out.push({ k: 'asset', v: src.slice(i + 3, j), line: at }); i = j + 3; continue;
      }
      const j = src.indexOf('@', i + 1);
      if (j < 0 || src.slice(i + 1, j).includes('\n')) throw err(msg('ccusd.syntax.end', { what: msg('ccusd.part.asset') }));
      out.push({ k: 'asset', v: src.slice(i + 1, j), line: at }); i = j + 1; continue;
    }
    if (c === '<') {
      const j = src.indexOf('>', i + 1);
      if (j < 0) throw err(msg('ccusd.syntax.end', { what: msg('ccusd.part.path') }));
      out.push({ k: 'path', v: src.slice(i + 1, j).trim(), line: at }); i = j + 1; continue;
    }
    if (/[0-9.+-]/.test(c)) {
      if ((c === '-' || c === '+') && /^inf/.test(src.slice(i + 1, i + 4)) && !/[A-Za-z0-9_]/.test(src[i + 4] || '')) {
        out.push({ k: 'num', v: c === '-' ? -Infinity : Infinity, line: at }); i += 4; continue;
      }
      NUM.lastIndex = i;
      const m = NUM.exec(src);
      if (m && m[0] !== '.' && m[0] !== '-' && m[0] !== '+') {
        out.push({ k: 'num', v: Number(m[0]), int: !/[.eE]/.test(m[0]), text: m[0], line: at });
        i += m[0].length;
        continue;
      }
    }
    ID.lastIndex = i;
    const m = ID.exec(src);
    if (m) { out.push({ k: 'id', v: m[0], line: at }); i += m[0].length; continue; }
    if (PUNCT.has(c)) { out.push({ k: c, line: at }); i++; continue; }
    throw err(msg('ccusd.syntax.expected', { want: msg('ccusd.part.value'), got: JSON.stringify(c) }));
  }
  out.push({ k: 'eof', line });
  if (out.length > limits.tableCount) throw damaged('ccusd.damaged.syntax', { line, what: msg('ccusd.syntax.depth') });
  return out;
}

// ---------------------------------------------------------------- parser

const LISTOP_WORDS = { prepend: 'prependedItems', append: 'appendedItems', add: 'addedItems', delete: 'deletedItems', reorder: 'orderedItems' };
const SPECIFIERS = new Set(['def', 'over', 'class']);

/** Known metadata → [field name, value kind]. Kinds: a value type, 'listop:x', or a special. */
const LAYER_META = {
  defaultPrim: ['defaultPrim', 'token'], upAxis: ['upAxis', 'token'], metersPerUnit: ['metersPerUnit', 'double'],
  kilogramsPerUnit: ['kilogramsPerUnit', 'double'], startTimeCode: ['startTimeCode', 'double'], endTimeCode: ['endTimeCode', 'double'],
  timeCodesPerSecond: ['timeCodesPerSecond', 'double'], framesPerSecond: ['framesPerSecond', 'double'], framePrecision: ['framePrecision', 'int'],
  doc: ['documentation', 'string'], documentation: ['documentation', 'string'], comment: ['comment', 'string'], owner: ['owner', 'string'],
  customLayerData: ['customLayerData', 'dictionary'], expressionVariables: ['expressionVariables', 'dictionary'],
  colorConfiguration: ['colorConfiguration', 'asset'], colorManagementSystem: ['colorManagementSystem', 'token'],
  subLayers: ['subLayers', 'subLayers'], startFrame: ['startFrame', 'double'], endFrame: ['endFrame', 'double'],
};
const PRIM_META = {
  kind: ['kind', 'token'], active: ['active', 'bool'], instanceable: ['instanceable', 'bool'], hidden: ['hidden', 'bool'],
  doc: ['documentation', 'string'], documentation: ['documentation', 'string'], comment: ['comment', 'string'],
  displayName: ['displayName', 'string'], displayGroup: ['displayGroup', 'string'], customData: ['customData', 'dictionary'],
  assetInfo: ['assetInfo', 'dictionary'], clips: ['clips', 'dictionary'], sdrMetadata: ['sdrMetadata', 'dictionary'],
  references: ['references', 'listop:reference'], payload: ['payload', 'listop:payload'], inherits: ['inheritPaths', 'listop:path'],
  specializes: ['specializes', 'listop:path'], variantSets: ['variantSetNames', 'listop:string'], variants: ['variantSelection', 'variantSelection'],
  apiSchemas: ['apiSchemas', 'listop:token'], permission: ['permission', 'permission'], symmetryFunction: ['symmetryFunction', 'token'],
  prefix: ['prefix', 'string'], suffix: ['suffix', 'string'], instanceName: ['instanceName', 'string'],
};
const PROP_META = {
  interpolation: ['interpolation', 'token'], elementSize: ['elementSize', 'int'], customData: ['customData', 'dictionary'],
  doc: ['documentation', 'string'], documentation: ['documentation', 'string'], comment: ['comment', 'string'],
  displayName: ['displayName', 'string'], displayGroup: ['displayGroup', 'string'], hidden: ['hidden', 'bool'],
  colorSpace: ['colorSpace', 'token'], connectability: ['connectability', 'token'], renderType: ['renderType', 'token'],
  allowedTokens: ['allowedTokens', 'token[]'], sdrMetadata: ['sdrMetadata', 'dictionary'], unauthoredValuesIndex: ['unauthoredValuesIndex', 'int'],
  permission: ['permission', 'permission'], symmetricPeer: ['symmetricPeer', 'string'], prefix: ['prefix', 'string'],
  suffix: ['suffix', 'string'], limits: ['limits', 'dictionary'], arraySizeConstraint: ['arraySizeConstraint', 'int64'],
  displayUnit: ['displayUnit', 'token'],
};

export function readUsda(input, opts = {}) {
  const limits = limitsOf(opts);
  const text = typeof input === 'string' ? input : utf8decode(input);
  if (text.length > limits.textBytes) throw new UsdError('too_big', msg('ccusd.too_big', { what: Math.round(text.length / 1048576) + ' MB' }));
  if (!/^#usda\s+1\.\d/.test(text)) throw text.startsWith('#usda') ? damaged('ccusd.damaged.syntax', { line: 1, what: msg('ccusd.syntax.header') }) : new UsdError('not_usd', msg('ccusd.not_usd'));
  const toks = tokenize(text.slice(text.indexOf('\n') + 1 || text.length), limits);
  for (const t of toks) t.line++;
  const p = new Parser(toks, limits);
  const layer = new Layer();
  layer.format = 'usda';
  p.layer = layer;
  if (p.is('(')) p.metaBlock('/', LAYER_META, true);
  while (!p.is('eof')) p.prim('/');
  return layer;
}

class Parser {
  constructor(toks, limits) { this.t = toks; this.i = 0; this.limits = limits; this.depth = 0; }
  get cur() { return this.t[this.i]; }
  is(k, v) { const c = this.t[this.i]; return c.k === k && (v === undefined || c.v === v); }
  isId(v) { return this.is('id', v); }
  next() { return this.t[this.i++]; }
  fail(want) {
    const c = this.cur;
    const got = c.k === 'eof' ? msg('ccusd.part.end') : c.k === 'id' || c.k === 'num' ? JSON.stringify(String(c.v)) : c.k === 'str' ? msg('ccusd.part.string') : c.k === 'path' ? msg('ccusd.part.path') : c.k === 'asset' ? msg('ccusd.part.asset') : JSON.stringify(c.k);
    return damaged('ccusd.damaged.syntax', { line: c.line, what: msg('ccusd.syntax.expected', { want, got }) });
  }
  expect(k, v) { if (!this.is(k, v)) throw this.fail(v !== undefined ? JSON.stringify(v) : JSON.stringify(k)); return this.next(); }
  enter() { if (++this.depth > this.limits.depth) throw damaged('ccusd.damaged.syntax', { line: this.cur.line, what: msg('ccusd.syntax.depth') }); }
  leave() { this.depth--; }
  skip(k) { if (this.is(k)) { this.i++; return true; } return false; }

  // ---- metadata

  /** '(' items ')' onto the spec at `at`. A bare string is the comment. */
  metaBlock(at, table, isLayer = false) {
    this.expect('(');
    this.enter();
    const spec = this.layer.specs.get(at);
    while (!this.is(')')) {
      if (this.skip(';')) continue;
      if (this.is('str')) { spec.fields.set('comment', V('string', this.next().v)); continue; }
      let prefix = null;
      if (this.is('id') && LISTOP_WORDS[this.cur.v] && this.t[this.i + 1].k === 'id') prefix = this.next().v;
      const key = this.expect('id').v;
      this.expect('=');
      const known = table[key];
      if (key === 'subLayers' && isLayer) { this.subLayers(spec); continue; }
      if (known) {
        const [field, kind] = known;
        if (kind.startsWith('listop:')) { this.listOpInto(spec, field, kind, prefix); continue; }
        if (kind === 'variantSelection') { spec.fields.set(field, V(kind, this.variantSelection())); continue; }
        if (kind === 'permission') { spec.fields.set(field, V(kind, this.expect('id').v === 'private' ? 'private' : 'public')); continue; }
        spec.fields.set(field, this.value(kind));
        continue;
      }
      // something we don't know: keep it as the value it looks like
      if (prefix) { this.listOpInto(spec, key, 'listop:token', prefix); continue; }
      spec.fields.set(key, this.untyped());
    }
    this.leave();
    this.next();
  }
  subLayers(spec) {
    const list = [], offs = [];
    this.expect('[');
    while (!this.is(']')) {
      if (this.skip(',')) continue;
      list.push(this.expect('asset').v);
      offs.push(this.is('(') ? this.layerOffset() : { offset: 0, scale: 1 });
    }
    this.next();
    spec.fields.set('subLayers', V('strings', list));
    spec.fields.set('subLayerOffsets', V('layerOffsets', offs));
  }
  layerOffset(item = null) {
    const o = { offset: 0, scale: 1 };
    this.expect('(');
    while (!this.is(')')) {
      if (this.skip(';') || this.skip(',')) continue;
      const k = this.expect('id').v;
      this.expect('=');
      if (k === 'offset') o.offset = this.number();
      else if (k === 'scale') o.scale = this.number();
      else if (k === 'customData' && item) item.customData = this.dictionary();
      else this.untyped();
    }
    this.next();
    return o;
  }
  variantSelection() {
    const m = new Map();
    this.expect('{');
    while (!this.is('}')) {
      if (this.skip(';')) continue;
      this.expect('id', 'string');
      const k = this.is('str') ? this.next().v : this.expect('id').v;
      this.expect('=');
      m.set(k, this.expect('str').v);
    }
    this.next();
    return m;
  }
  /** One list-op statement (`prepend x = …`, or explicit) merged into the spec's field. */
  listOpInto(spec, field, kind, prefix) {
    const item = kind.slice(7);
    let items;
    if (this.isId('None')) { this.next(); items = []; } else if (this.is('[')) {
      this.next();
      items = [];
      while (!this.is(']')) { if (this.skip(',')) continue; items.push(this.listItem(item)); }
      this.next();
    } else items = [this.listItem(item)];
    const cur = spec.fields.get(field);
    const op = cur && cur.t === kind ? cur.v : { explicit: false };
    if (!prefix) { for (const k of Object.keys(op)) delete op[k]; op.explicit = true; op.explicitItems = items; } else { op.explicit = false; delete op.explicitItems; op[LISTOP_WORDS[prefix]] = items; }
    spec.fields.set(field, V(kind, op));
  }
  listItem(item) {
    switch (item) {
      case 'path': return this.expect('path').v;
      case 'token': case 'string': return this.expect('str').v;
      case 'reference': case 'payload': {
        const x = { asset: '', prim: '' };
        if (this.is('asset')) x.asset = this.next().v;
        if (this.is('path')) x.prim = this.next().v;
        if (item === 'reference') x.customData = new Map();
        x.offset = this.is('(') ? this.layerOffset(x) : { offset: 0, scale: 1 };
        return x;
      }
      case 'int': case 'uint': case 'int64': case 'uint64': return this.number();
      default: return this.untyped().v;
    }
  }

  // ---- prims

  prim(parent) {
    const spec = this.expect('id');
    if (!SPECIFIERS.has(spec.v)) { this.i--; throw this.fail(msg('ccusd.part.specifier')); }
    let typeName = '';
    if (this.is('id')) {
      typeName = this.next().v;
      while (this.is('.')) { this.next(); typeName += '.' + this.expect('id').v; }
    }
    const name = this.expect('str').v;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) throw damaged('ccusd.damaged.syntax', { line: this.t[this.i - 1].line, what: msg('ccusd.syntax.expected', { want: msg('ccusd.part.prim_name'), got: JSON.stringify(name) }) });
    const p = P.child(parent, name);
    if (this.layer.specs.has(p)) throw damaged('ccusd.damaged.syntax', { line: this.t[this.i - 1].line, what: msg('ccusd.syntax.expected', { want: msg('ccusd.part.new_prim'), got: p }) });
    if (this.layer.specs.size > this.limits.specs) throw new UsdError('too_big', msg('ccusd.too_big', { what: this.layer.specs.size + ' specs' }));
    const f = new Map([['specifier', V('specifier', spec.v)]]);
    if (typeName) f.set('typeName', V('token', typeName));
    this.layer.specs.set(p, { type: 'prim', fields: f });
    addName(this.layer.specs.get(parent), 'primChildren', name);
    if (this.is('(')) this.metaBlock(p, PRIM_META);
    this.body(p);
  }
  body(p) {
    this.expect('{');
    this.enter();
    while (!this.is('}')) {
      if (this.skip(';')) continue;
      const c = this.cur;
      if (c.k === 'id' && SPECIFIERS.has(c.v) && (this.t[this.i + 1].k === 'str' || (this.t[this.i + 1].k === 'id' && this.t[this.i + 2].k !== '=' && this.t[this.i + 2].k !== '.' && this.t[this.i + 2].k !== '['))) {
        this.prim(p);
        continue;
      }
      if (c.k === 'id' && c.v === 'variantSet' && this.t[this.i + 1].k === 'str') { this.variantSet(p); continue; }
      if (c.k === 'id' && c.v === 'reorder' && this.t[this.i + 1].k === 'id' && (this.t[this.i + 1].v === 'nameChildren' || this.t[this.i + 1].v === 'properties')) {
        this.next();
        const which = this.next().v;
        this.expect('=');
        const v = this.untyped();
        this.layer.specs.get(p).fields.set(which === 'nameChildren' ? 'primOrder' : 'propertyOrder', V('tokens', Array.from(v.v || [])));
        continue;
      }
      this.property(p);
    }
    this.leave();
    this.next();
  }
  variantSet(p) {
    this.next();
    const setName = this.expect('str').v;
    this.expect('=');
    this.expect('{');
    const sp = p + '{' + setName + '=}';
    const names = [];
    this.layer.specs.set(sp, { type: 'variantSet', fields: new Map([['variantChildren', V('tokens', names)]]) });
    addName(this.layer.specs.get(p), 'variantSetChildren', setName);
    while (!this.is('}')) {
      if (this.skip(';') || this.skip(',')) continue;
      const v = this.expect('str').v;
      names.push(v);
      const vp = p + '{' + setName + '=' + v + '}';
      this.layer.specs.set(vp, { type: 'variant', fields: new Map() });
      if (this.is('(')) this.metaBlock(vp, PRIM_META);
      this.body(vp);
    }
    this.next();
  }

  // ---- properties

  property(prim) {
    let prefix = null;
    if (this.is('id') && LISTOP_WORDS[this.cur.v] && this.t[this.i + 1].k === 'id') prefix = this.next().v;
    let custom = false, variability = null;
    for (;;) {
      if (this.isId('custom')) { this.next(); custom = true; continue; }
      if (this.isId('uniform') || this.isId('config')) { this.next(); variability = 'uniform'; continue; }
      if (this.isId('varying')) { this.next(); variability = 'varying'; continue; }
      break;
    }
    if (this.isId('rel')) { this.next(); return this.relationship(prim, prefix, custom, variability); }
    let typeName = this.expect('id').v;
    if (this.is('[') && this.t[this.i + 1].k === ']') { this.i += 2; typeName += '[]'; }
    const info = typeInfo(typeName);
    if (!info) throw damaged('ccusd.damaged.syntax', { line: this.t[this.i - 1].line, what: msg('ccusd.syntax.type', { type: typeName }) });
    const name = this.propName();
    let suffix = null;
    if (this.is('.')) { this.next(); suffix = this.expect('id').v; }
    const pp = P.prop(prim, name);
    const spec = this.propSpec(prim, pp, 'attribute');
    const f = spec.fields;
    if (!f.has('custom')) f.set('custom', V('bool', custom));
    else if (custom) f.set('custom', V('bool', true));
    if (!f.has('typeName')) f.set('typeName', V('token', typeName));
    if (!f.has('variability') || variability) f.set('variability', V('variability', variability || f.get('variability')?.v || 'varying'));
    reorderFields(f, ['custom', 'typeName', 'variability']);
    if (suffix === 'connect') {
      this.expect('=');
      this.listOpInto(spec, 'connectionPaths', 'listop:path', prefix);
    } else if (suffix === 'timeSamples') {
      this.expect('=');
      f.set('timeSamples', V('timeSamples', this.timeSamples(info)));
    } else if (suffix) {
      throw damaged('ccusd.damaged.syntax', { line: this.cur.line, what: msg('ccusd.unsupported', { what: '.' + suffix }) });
    } else if (this.skip('=')) {
      f.set('default', this.isId('None') ? (this.next(), V('block', null)) : this.typedValue(info));
    }
    if (this.is('(')) this.metaBlock(pp, PROP_META);
  }
  propName() {
    // names may be keywords ('rel', 'uniform', …) and namespaced
    const t = this.expect('id');
    return t.v;
  }
  propSpec(prim, pp, type) {
    let spec = this.layer.specs.get(pp);
    if (!spec) {
      spec = { type, fields: new Map() };
      this.layer.specs.set(pp, spec);
      addName(this.layer.specs.get(prim), 'properties', P.name(pp));
    }
    return spec;
  }
  relationship(prim, prefix, custom, variability) {
    const name = this.propName();
    if (this.is('.')) { this.next(); this.expect('id'); }   // rel x.default = …: same as rel x = …
    const pp = P.prop(prim, name);
    const spec = this.propSpec(prim, pp, 'relationship');
    if (custom) spec.fields.set('custom', V('bool', true));
    if (!spec.fields.has('variability') || variability) spec.fields.set('variability', V('variability', variability || 'uniform'));
    if (this.skip('=')) this.listOpInto(spec, 'targetPaths', 'listop:path', prefix);
    if (this.is('(')) this.metaBlock(pp, PROP_META);
  }
  timeSamples(info) {
    this.expect('{');
    const rows = [];
    while (!this.is('}')) {
      if (this.skip(',')) continue;
      const t = this.number();
      this.expect(':');
      rows.push([t, this.isId('None') ? (this.next(), null) : this.typedValue(info)]);
    }
    this.next();
    rows.sort((a, b) => a[0] - b[0]);
    return rows;
  }

  // ---- values

  number() {
    const c = this.cur;
    if (c.k === 'num') { this.i++; return c.v; }
    if (c.k === 'id' && (c.v === 'inf' || c.v === 'nan')) { this.i++; return c.v === 'inf' ? Infinity : NaN; }
    throw this.fail(msg('ccusd.part.number'));
  }
  /** A value of a value type name ('float3[]', 'dictionary', 'token', …). */
  value(kind) {
    if (kind === 'dictionary') return V('dictionary', this.dictionary());
    const info = typeInfo(kind);
    if (!info) throw this.fail(kind);
    return this.typedValue(info);
  }
  typedValue(info) {
    const { base, array, def } = info;
    if (base === 'opaque') throw this.fail(msg('ccusd.part.no_value'));
    if (!array) return V(base, this.scalarOrTuple(base, def));
    this.enter();
    this.expect('[');
    const items = [];
    while (!this.is(']')) {
      if (this.skip(',')) continue;
      const x = this.scalarOrTuple(base, def);
      if (def.n === 1) items.push(x); else for (const y of x) items.push(y);
      if (items.length > this.limits.arrayCount) throw new UsdError('too_big', msg('ccusd.too_big', { what: items.length + ' values' }));
    }
    this.next();
    this.leave();
    return V(base + '[]', typedArray(def.k, items));
  }
  scalarOrTuple(base, def) {
    if (def.mat) {
      this.expect('(');
      const out = [];
      for (let r = 0; r < def.mat; r++) {
        if (r) this.expect(',');
        this.expect('(');
        for (let c = 0; c < def.mat; c++) { if (c) this.expect(','); out.push(this.number()); }
        this.skip(',');
        this.expect(')');
      }
      this.skip(',');
      this.expect(')');
      return out;
    }
    if (def.n > 1) {
      this.expect('(');
      const out = [];
      for (let k = 0; k < def.n; k++) { if (k) this.expect(','); out.push(this.component(def.k)); }
      this.skip(',');
      this.expect(')');
      return out;
    }
    return this.component(def.k);
  }
  component(k) {
    const c = this.cur;
    switch (k) {
      case 'bool':
        if (c.k === 'id' && (c.v === 'true' || c.v === 'false')) { this.i++; return c.v === 'true'; }
        if (c.k === 'num') { this.i++; return c.v !== 0; }
        throw this.fail(msg('ccusd.part.bool'));
      case 'str': case 'tok': case 'pathexpr': return this.expect('str').v;
      case 'asset': return this.expect('asset').v;
      case 'i32': case 'u32': case 'u8': case 'i64': case 'u64': {
        const x = this.number();
        if (!Number.isInteger(x)) throw damaged('ccusd.damaged.syntax', { line: c.line, what: msg('ccusd.syntax.value', { type: k }) });
        if ((k === 'i64' || k === 'u64') && !Number.isSafeInteger(x) && c.text) return BigInt(c.text);
        return x;
      }
      case 'f16': return halfToFloat(floatToHalf(this.number()));
      case 'f32': return Math.fround(this.number());
      default: return this.number();
    }
  }
  dictionary() {
    this.expect('{');
    this.enter();
    const m = new Map();
    while (!this.is('}')) {
      if (this.skip(';') || this.skip(',')) continue;
      let typeName = this.expect('id').v;
      if (this.is('[') && this.t[this.i + 1].k === ']') { this.i += 2; typeName += '[]'; }
      const key = this.is('str') ? this.next().v : this.expect('id').v;
      this.expect('=');
      if (typeName === 'dictionary') m.set(key, V('dictionary', this.dictionary()));
      else {
        const info = typeInfo(typeName);
        if (!info) throw damaged('ccusd.damaged.syntax', { line: this.cur.line, what: msg('ccusd.syntax.type', { type: typeName }) });
        m.set(key, this.typedValue(info));
      }
    }
    this.leave();
    this.next();
    return m;
  }
  /** A value with no declared type (unknown metadata): its shape decides. */
  untyped() {
    const c = this.cur;
    if (c.k === 'str') { this.i++; return V('string', c.v); }
    if (c.k === 'num') { this.i++; return c.int ? V('int', c.v) : V('double', c.v); }
    if (c.k === 'asset') { this.i++; return V('asset', c.v); }
    if (c.k === 'path') { this.i++; return V('path', c.v); }
    if (c.k === 'id') {
      this.i++;
      if (c.v === 'true' || c.v === 'false') return V('bool', c.v === 'true');
      if (c.v === 'None') return V('block', null);
      return V('token', c.v);
    }
    if (c.k === '{') return V('dictionary', this.dictionary());
    if (c.k === '[') {
      this.enter();
      this.next();
      const items = [];
      while (!this.is(']')) { if (this.skip(',')) continue; items.push(this.untyped()); }
      this.next();
      this.leave();
      const t = items[0]?.t;
      if (t === 'string' || t === 'token') return V('tokens', items.map((x) => x.v));
      if (t === 'path') return V('paths', items.map((x) => x.v));
      if (t === 'double' || t === 'int') return V('doubles', items.map((x) => x.v));
      return V('strings', items.map((x) => String(x.v)));
    }
    if (c.k === '(') {
      this.next();
      const items = [];
      while (!this.is(')')) { if (this.skip(',')) continue; items.push(this.number()); }
      this.next();
      return V('double' + items.length, items);
    }
    throw this.fail(msg('ccusd.part.value'));
  }
}

function addName(spec, field, name) {
  const cur = spec.fields.get(field);
  if (cur) { if (!cur.v.includes(name)) cur.v.push(name); } else spec.fields.set(field, V('tokens', [name]));
}
function reorderFields(f, first) {
  const head = first.filter((k) => f.has(k)).map((k) => [k, f.get(k)]);
  const rest = [...f].filter(([k]) => !first.includes(k));
  f.clear();
  for (const [k, v] of [...head, ...rest]) f.set(k, v);
}
function typedArray(k, items) {
  switch (k) {
    case 'f32': case 'f16': return Float32Array.from(items);
    case 'f64': return Float64Array.from(items);
    case 'i32': return Int32Array.from(items);
    case 'u32': return Uint32Array.from(items);
    case 'u8': return Uint8Array.from(items);
    case 'i64': return BigInt64Array.from(items, (x) => BigInt(x));
    case 'u64': return BigUint64Array.from(items, (x) => BigInt(x));
    default: return items;
  }
}
